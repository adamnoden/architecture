"""Reallocate identified old gravity sources before applying a curved-arch response."""
from collections import defaultdict
from itertools import pairwise
import math


def build(s,j):
    old=j['old']; model=s['H']; book=defaultdict(lambda:[0.,0.,0.]); debit=defaultdict(float)
    units=defaultdict(float); raw_loads=[]; capture=defaultdict(float)
    A,B=j['A'],j['B']; specs=[]; total=lambda: [0.,0.,0.]
    expected_frame=total()

    def deposit(point,force,destination,category):
        if abs(force)<1e-12:return
        targets=j['routes'](destination)
        assert abs(sum(t for _,t,_,_ in targets)-1)<1e-7
        dx=point[0]/1000-sum(j['xy'](h)[0]*t/1000+cx for h,t,cx,cy in targets)
        dy=point[1]/1000-sum(j['xy'](h)[1]*t/1000+cy for h,t,cx,cy in targets)
        for h,t,cx,cy in targets:
            row=book[h];row[0]+=force*t;row[1]+=force*(cx+t*dx);row[2]+=force*(cy+t*dy)
        units[category]+=force

    def direct_pad(p):return [(j['virtual'](p),p,1.)]

    # Locate actual upper-core source points on the enclosing wall. Inventory
    # only concrete-equivalent weight (25 kN/m³). The independent 0.4 kN/m²
    # finish allowance cannot fund a structural member or half a fixture.
    candidates=defaultdict(lambda:defaultdict(list))
    for c,k,weight,point,targets in j['olds']:
        if c!='upper core and finish budget' or k!='G' or len(targets)!=1:continue
        name,coord,share=targets[0]
        if not isinstance(name,str) or not name.startswith('@outer-') or abs(share-1)>.00001:continue
        face=name[1:];ax=old['outer'][face][0]
        candidates[face][point[ax]].append((weight*25*.14/(25*.14+.4),point,targets))

    def debit_core(face,position,force,xy,category):
        # Interpolate using two physical recorded strips. Per-strip debit is
        # checked against its pre-existing inventory. Keep the removed load's
        # actual first moment by explicitly accounting for the slight shift
        # between a quadrature point and the centre of its represented strip.
        xs=sorted(candidates[face]);l,r=next((a,b) for a,b in pairwise(xs) if a-1e-7<=position<=b+1e-7)
        f=(position-l)/(r-l)
        for station,shape in [(l,1-f),(r,f)]:
            available=sum(w for w,_,_ in candidates[face][station])
            for idx,(w,pt,targets) in enumerate(candidates[face][station]):
                quantity=force*shape*w/available
                debit[face,station,idx]+=quantity
                deposit(xy,-1.35*quantity,targets,category)

    def include_frame(point,force):
        expected_frame[0]+=force
        for k in [0,1]:expected_frame[k+1]+=force*point[k]/1000

    for occurrence,(P,J,L,axis,sg) in enumerate(s['corner_windows']):
        face=('outer-south' if P[1]==A else 'outer-north') if axis==0 else ('outer-west' if P[0]==A else 'outer-east')
        datum=P[1-axis]
        def xy(u,q=0,axis=axis,sg=sg,datum=datum):
            along=u if sg>0 else 12000-u
            # Positive q goes to the warm room, matching the jamb drawing.
            normal=datum+q*(1 if datum==A else -1)
            return (along,normal) if axis==0 else (normal,along)
        specs.append((face,axis,sg,xy,s['xL'],s['xR']))
        op=next(o for o in model['openings']['FIRST'] if o['wall']==face and o['centre']==(1800 if sg>0 else 10200))
        # Per-segment force and midpoint use the exact discretised arch model.
        for a,b in pairwise(s['arch']):
            le=math.dist(a,b);width=b[0]-a[0];u=(a[0]+b[0])/2
            top=s['cz']+math.sqrt(s['ro']**2-(u-1800)**2)
            weight=25*(140*215*le+140*max(0,6540-top)*width)/1e9
            g=1.35*weight
            ceiling=s['ceiling_actions'][occurrence][u]*width/1000
            include_frame(xy(u),g+ceiling);raw_loads.append((face,a[0],b[0],weight,xy,'reroute real arch and spandrel'))
        # A short physical haunch connects the mean arch to the actual jamb
        # axis. Its weight is included by the original planar element model.
        length=abs(s['xJ']-s['xR']);u=(s['xR']+s['xJ'])/2
        weight=length*140*215*25/1e9
        include_frame(xy(u),1.35*weight);raw_loads.append((face,s['xR'],s['xJ'],weight,xy,'reroute arch knee'))
        for a,b in pairwise(s['right']):
            z=(a[1]+b[1])/2;normal=s['jamb_normal_width'](z);h=b[1]-a[1]
            weight=normal*s['jamb_width']*h*25/1e9
            include_frame(xy(s['xJ']),1.35*weight)
            raw_loads.append((face,2300,2505,weight*140/normal,xy,'reroute actual opposite jamb'))
            # The asymmetric outward projection has the physical CG at half
            # its extension. Apply its little transverse first moment to the
            # edge representative without adding its weight for a second time.
            p0=xy(s['xJ']);p1=xy(s['xJ'],-(normal-140)/2)
            deposit(p1,1.35*weight,direct_pad(p0),'actual jamb centroid');deposit(p0,-1.35*weight,direct_pad(p0),'actual jamb centroid')
            units['outer projection included in arch model']+=1.35*weight*(1-140/normal)
        # The floor edge already owns its 140 wide body. For Z3020..3920 it
        # needs the additional 85 projecting into the original insulation.
        p0=xy(s['xJ']);p1=xy(s['xJ'],-(70+85/2));volume=.205*.085*.900
        deposit(p1,1.35*25*volume,direct_pad(p0),'additional foot outside old rectangle below beam top')
        # New near toe is concrete in a 37.5-wide region already in the old
        # masonry-equivalent budget. Debit it, then place it on the real L.
        q=xy((1262.5+1300)/2);weight=.0375*.14*1.2*25
        debit_core(face,q[axis],weight,q,'reroute existing mass at extended near toe')
        # Use the actual three-shaft corner group rather than an interior wall.
        deposit(q,1.35*weight,[(old['coord'][P],P,1.)],'reroute existing mass at extended near toe')
        # Remove only these eight physically open core apertures. Retain the
        # neighbouring gross wall and its independent finish mass. Each strip
        # width is 5 mm; the circular intrados is integrated analytically.
        def primitive(t):
            rr=s['ri'];return .5*(t*math.sqrt(rr*rr-t*t)+rr*rr*math.asin(t/rr))
        for x in range(1300,2300,5):
            x1=x+5;u=(x+x1)/2
            area=(s['cz']-3450-op['sill'])*(x1-x)+primitive(x1-1800)-primitive(x-1800)
            physical=xy(u)
            debit_core(face,physical[axis],area*140*25/1e9,physical,'remove filled inner opening')
        # These are explicit maximum delivery budgets, never credited for
        # stabilising wind. 60 kg covers the new arch/jamb reinforcement and
        # local links, 55 kg the two structural guard receivers, and 200 kg
        # the complete window/guard. An actual assembly exceeding any maximum
        # requires a revised positive card before selection.
        for x,mass,name in [(s['xL'],30,'arch cage allowance'),(s['xJ'],30,'arch cage allowance'),
                            (1195,27.5,'guard receiver allowance'),(2410,27.5,'guard receiver allowance'),
                            (1375,100,'complete guard and window allowance'),(2225,100,'complete guard and window allowance')]:
            q=xy(x);deposit(q,1.35*mass*.00981,direct_pad(q),name)

    for face,a,b,weight,xy,category in raw_loads:
        count=max(1,math.ceil(abs(b-a)/5))
        for i in range(count):
            u=a+(b-a)*(i+.5)/count;q=xy(u);axis=old['outer'][face][0]
            debit_core(face,q[axis],weight/count,q,category)
    fraction=max(value/candidates[f][x][i][0] for (f,x,i),value in debit.items())
    assert fraction<1,(fraction,sorted(((value/candidates[f][x][i][0],f,x) for (f,x,i),value in debit.items()),reverse=True)[:6])

    # Remove the complete prior ceiling once, then reconstruct its shortest
    # spans on the same supports, splitting where one of the eight arch load
    # intervals starts or finishes. Each real cell transfers force and its
    # two first moments, including any offset in lower interior support lines.
    old_ceiling=j['book']['independent ceiling envelope','G']
    for receiver,vector in old_ceiling.items():
        for d,n in enumerate(vector):book[receiver][d]-=1.35*n
    units['remove previous ceiling']=-1.35*sum(v[0] for v in old_ceiling.values())
    cuts=[set(v) for v in old['cuts']]
    for face,ax,sg,xy,lo,hi in specs:
        cuts[ax].update([xy(lo)[ax],xy(hi)[ax]])
    cc=[sorted(x) for x in cuts]
    for xa,xb in pairwise(cc[0]):
        for ya,yb in pairwise(cc[1]):
            point=((xa+xb)/2,(ya+yb)/2)
            if old['inside'](point,old['court']):continue
            options=[]
            for axis in [0,1]:
                lines=[(v,idx,wall) for idx,(wall,ax,v,lo,hi) in enumerate(old['ceillines']) if ax!=axis and lo<=point[1-axis]<=hi]
                left=max((r for r in lines if r[0]<=point[axis]),default=None,key=lambda r:r[0]);right=min((r for r in lines if r[0]>=point[axis]),default=None,key=lambda r:r[0])
                if left and right and left[0]<right[0]:options.append((right[0]-left[0],axis,left,right))
            _,axis,left,right=min(options,key=lambda r:r[0]);g=1.35*1.5*(xb-xa)*(yb-ya)/1e6
            for wall,(u,share) in zip([left[2],right[2]],old['sides'](left[0],right[0],point[axis])):
                loc=old['axis2'](axis,u,point[1-axis]);force=g*share
                hit=None
                if isinstance(wall,str):
                    hit=next((f for f,ax,sg,xy,l,r in specs if wall==f and l<(loc[ax] if sg>0 else 12000-loc[ax])<r),None)
                if hit:capture[hit]+=force;continue
                dest=old['facade'](wall,loc) if isinstance(wall,str) else old['lower'](loc)
                deposit(loc,force,dest,'return ceiling outside eight arches')
    modeled_ceiling=sum(sum(actions[(a[0]+b[0])/2]*(b[0]-a[0])/1000 for a,b in pairwise(s['arch'])) for actions in s['ceiling_actions'].values())
    assert abs(sum(capture.values())-modeled_ceiling)<1e-7,(sum(capture.values()),modeled_ceiling)
    assert abs(units['remove previous ceiling']+units['return ceiling outside eight arches']+modeled_ceiling)<1e-7
    return {'book':dict(book),'origins':dict(units),'frameExternalULS':expected_frame,'maximumCoreDebitFraction':fraction,'realArchCeilingULSKN':modeled_ceiling}
