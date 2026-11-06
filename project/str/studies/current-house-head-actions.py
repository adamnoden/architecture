"""Vertical action and first-moment ledger for the current trial; no soil capacity implied.
All quantities entering a named check are loads, not precomputed member envelopes.
No external solver. Support spans are a statically determinate comparison, not a
claim that an integral RC mat on unknown soil has precisely these reactions.
"""
from collections import defaultdict
from pathlib import Path
from itertools import pairwise
import hashlib,json,math,sys
D=Path(__file__).resolve().parent
def read(f):return json.loads((D/f).read_text())
gd=read('current-house-grid.json');h=json.loads((D.parents[1]/'had/studies/water-replan.json').read_text())['model'];o=read('open-loggia-support.json');roof=read('current-house-roof-network.json')
A,B=332.5,11667.5;C,E=3917.5,8082.5
heads={q['id']:q for q in gd['heads']};gs=gd['girders'];links=gd['crossBeams'];F=o['finite_floor_frame']
orig=defaultdict(lambda:[0.,0.,0.]); sums=defaultdict(lambda:[0.,0.,0.]); routeGap=defaultdict(float);fallbackSites={};adverse=defaultdict(lambda:[0.]*6)
def axis2(axis,u,v):return (u,v) if axis==0 else (v,u)
def towards(p,q,t):return tuple(a+(b-a)*t for a,b in zip(p,q))
def parts(p,q,gap=130):
    n=max(1,math.ceil(math.dist(p,q)/gap))
    for i in range(n):yield towards(p,q,(i+.5)/n),math.dist(p,q)/n/1000
def xyrect(r):return [r[0],r[1],r[0]+r[2],r[1]+r[3]]
def inside(p,r):return r[0]<=p[0]<r[2] and r[1]<=p[1]<r[3]
def collinear(surface,p):return [surface,(p[0],p[1]),1.]
def accumulate(dest,k,row):
    a=dest[k]
    for i in range(3):a[i]+=row[i]
def outline(name):
    if name in gs:
        g=gs[name];i=0 if g['axis']=='x' else 1
        return axis2(i,g['extent'][0],g['datum']),axis2(i,g['extent'][1],g['datum'])
    g=links[name];return tuple(g['a']),tuple(g['b'])
def pair_weights(us,u):
    i=next((j for j in range(len(us)-1) if u<=us[j+1]),len(us)-2)
    a,b=us[i:i+2];w=(u-a)/(b-a);return i,1-w,w
def member(name,p,trail=()):
    assert name not in trail,(name,trail)
    a,b=outline(name);i=0 if a[0]!=b[0] else 1
    if name in gs:
        q=gs[name]['heads'];j,f,s=pair_weights([z['u'] for z in q],p[i])
        return [(q[j]['id'],heads[q[j]['id']]['xy'],f),(q[j+1]['id'],heads[q[j+1]['id']]['xy'],s)]
    g=links[name];_,f,s=pair_weights([a[i],b[i]],p[i])
    return [(g['start'],a,f),(g['end'],b,s)]
def carry(name,p,unit,cat,case,trail=(),cx=0.,cy=0.):
    if name in heads:
        vals=(unit,unit*cx/1000,unit*cy/1000)
        accumulate(sums,(name,cat,case),vals)
        for j,val in enumerate(vals):adverse[name,cat,case][2*j+(val>=0)]+=val
        return
    nodes=member(name,p,trail)
    assert abs(sum(t for n,q,t in nodes)-1)<1e-8
    dx=p[0]-sum(q[0]*t for n,q,t in nodes);dy=p[1]-sum(q[1]*t for n,q,t in nodes)
    for n,q,t in nodes:
        if t:carry(n,q,unit*t,cat,case,trail+(name,),cx+dx,cy+dy)
def source(cat,case,unit,p,nodes):
    # Each intermediate split conserves vertical force; retain perpendicular
    # offset as a signed head moment rather than losing it to a plan projection.
    if abs(unit)<1e-14:return
    assert abs(sum(t for n,q,t in nodes)-1)<1e-8,(cat,p,nodes)
    accumulate(orig,(cat,case),(unit,unit*p[0]/1000,unit*p[1]/1000))
    dx=p[0]-sum(q[0]*t for n,q,t in nodes);dy=p[1]-sum(q[1]*t for n,q,t in nodes)
    for n,q,t in nodes:
        if t:carry(n,q,unit*t,cat,case,cx=dx,cy=dy)
def nearest(p,allowed=None):
    def distance(k):
        a,b=outline(k);l=math.dist(a,b);t=max(0,min(1,sum((v-w)*(z-w) for v,w,z in zip(p,a,b))/l**2))
        return math.dist(p,towards(a,b,t))
    k=min(allowed or [*gs,*links],key=distance)
    dist=distance(k)
    if dist>routeGap[k]:routeGap[k]=dist;fallbackSites[k]=p
    return [(k,p,1.)]
def sides(l,r,u):
    assert r>l;return [(l,(r-u)/(r-l)),(r,(u-l)/(r-l))]
outer={'outer-south':(0,A),'outer-north':(0,B),'outer-west':(1,A),'outer-east':(1,B),'court-south':(0,C),'court-north':(0,E),'court-west':(1,C),'court-east':(1,E)}
def wallbase(w,p):
    u=p[outer[w][0]]
    if w=='outer-north' and 4500<u<7500 or w=='court-north' and 4500<u<7500:
        return [('loggia-'+k,(v,p[1]),t) for k,(v,t) in zip(['W','E'],sides(4500,7500,u))]
    key={'outer-south':'outer-S','outer-north':'outer-NW' if u<=4500 else 'outer-NE','outer-west':'outer-W','outer-east':'outer-E','court-south':'court-S','court-north':'court-NW' if u<=4500 else 'court-NE','court-west':'court-W','court-east':'court-E'}[w]
    return [(key,p,1.)]
def opening(w,p,level,tail):
    axis=outer[w][0];u=p[axis]
    for op in h['openings'][level]:
        if op['wall']!=w:continue
        a=op['centre']-op['width']/2;b=a+op['width']
        if a<u<b:
            # Finite structural bearings 100mm outside rough ends. They are not
            # tensile masonry: reversible roof path requires captive jamb ties.
            return [(n,r,t*f) for v,t in sides(a-100,b+100,u) for n,r,f in tail(axis2(axis,v,p[1-axis]))]
    return tail(p)
def facade(w,p,upper=True):
    gr=lambda q:opening(w,q,'GROUND',lambda z:wallbase(w,z))
    return opening(w,p,'FIRST',gr) if upper else gr(p)
def nearestfac(p):
    w=min(outer,key=lambda w:abs(p[1-outer[w][0]]-outer[w][1]))
    return w,abs(p[1-outer[w][0]]-outer[w][1])
def roofdest(p):
    w,d=nearestfac(p);assert d<.001;return facade(w,p)
# Each row arm receives actual area, purlin and component masses at their own
# stations. Overhangs have signed reaction coefficients; no 70kN per-seat total.
for frame in roof['frames']:
    ord=frame['id']=='ordinary';L=frame['axisSpanM'];rr=frame['rows'];ds=1 if ord else math.sqrt(2)
    pts=[(x['x'],x['area']*1.5/math.cos(math.radians(25))+x['area']/x['rowWidth']*roof['sections']['secondary']['lineG'],x['area']*1.5,-2.25*x['area']) for x in rr]
    pts.extend([(L/4-.26625*ds,frame['primaryG']/2,0,0),(3*L/4+.26625*ds,frame['primaryG']/2,0,0),(0,frame['tieG']/2+1+frame['bracingG']/2,0,0),(L,frame['tieG']/2+1+frame['bracingG']/2,0,0),(L/2,.5,0,0)])
    frames=[]
    if ord:
        for u in [4377.5,7622.5]:frames.extend([((u,C),(u,A)),((u,E),(u,B)),((C,u),(A,u)),((E,u),(B,u))])
    else:
        for ix,ox in [(C,A),(E,B)]:
            for iy,oy in [(C,A),(E,B)]:frames.append(((ix,iy),(ox,oy)))
    for inn,out in frames:
        for ii,(x,g,q,up) in enumerate(pts):
            p=towards(inn,out,x/L);routes=[(n,r,t*f) for seat,t in [(inn,1-x/L),(out,x/L)] for n,r,f in roofdest(seat)]
            for case,force in [('G',g),('Q',q),('U',up)]:source('roof',case,force,p,routes)
            area=rr[ii]['area'] if ii<len(rr) else 0.
            source('roof signed rows','R',area,p,routes)
            source('roof signed rows','S',1.35*(g-area*1.5/math.cos(math.radians(25))),p,routes)
assert abs(orig['roof','G'][0]-roof['globalOrigins']['G'])<1e-8
# Steel wall-head collector and independent protected ceiling field.
for name,(axis,d) in outer.items():
    lo,hi=(A,B) if name.startswith('outer') else (C,E)
    for p,l in parts(axis2(axis,lo,d),axis2(axis,hi,d)):
        source('steel wall-head ring','G',roof['sections']['collector']['lineG']*l,p,facade(name,p))
# Lower core axes, widths and existing loadbearing apertures.
wallmap={'study-east':'study-east','cloak-east':'study-east','cloak-west':'cloak-west','cloak-south':'cloak-south','study-cloak-north':'study-north','study-L-return':'study-L-return','study-L-north':'study-L-north','wc-west':'wc-west','wc-north':'wc-north','service-spine':'spine','utility-north':'utility-north','plant-intermediate-arch':'plant-intermediate','plant-north':'passage-S','rear-west':'rear-W','rear-east':'rear-E','loggia-west-weather':'loggia-W','loggia-east-weather':'loggia-E','protected-stair-east':'stair-post','protected-west-cross':'protected-W','protected-east-cross':'protected-E','east-passage-north-weather':'passage-N','gallery-east-water-weather':'spine'}
def which(w,p):
    k=wallmap[w['id']]
    if k=='rear-W' and p[0]>2942.5:k='rear-W-end'
    return k
def core(w,p):
    i=0 if w['a'][0]!=w['b'][0] else 1;u=p[i]
    for l,r in w.get('holes',[]):
        if l<u<r:
            return [(which(w,q),q,t) for v,t in sides(l-100,r+100,u) for q in [axis2(i,v,p[1-i])]]
    return [(which(w,p),p,1.)]
def lower(p):
    # Admit a wall only on its finite axis/material territory. A missing upper
    # or floor edge follows its actual finite trimmer; no nearest neighbour
    # transfers across a room.
    w,d=nearestfac(p)
    if d<=1 and (w.startswith('outer') or C-1<=p[outer[w][0]]<=E+1):return facade(w,p,False)
    for l in h['groundWalls']:
        i=0 if l['a'][0]!=l['b'][0] else 1
        if abs(p[1-i]-l['a'][1-i])<=75 and min(l['a'][i],l['b'][i])-1<=p[i]<=max(l['a'][i],l['b'][i])+1:return core(l,p)
    x,y=p
    if abs(x-2902.5)<72 and y>=8852.5:
        return [('wet',(2902.5,v),t) for v,t in sides(8852.5,11512.5,y)]
    if abs(y-6500)<75 and x>=9300: # upper bath wall over changed lower plant/passage
        return [(k,(u,y),t) for k,(u,t) in zip(['spine','outer-E'],sides(9300,B,x))]
    if abs(y-C)<80 and x<C:
        return [('study-L-return',(2917.5,C), (C-x)/(C-2917.5)),('court-W',(C,C),(x-2917.5)/(C-2917.5))]
    if abs(y-C)<80 and x>E:
        return [('court-E',(E,C),(9300-x)/(9300-E)),('spine',(9300,C),(x-E)/(9300-E))]
    if abs(y-4332.5)<101 and x<=C:return [('stair-header',p,1.)]
    if abs(x-2917.5)<101 and 2650<=y<=8852.5:return [('study-L-return' if y<=4332.5 else 'stair-post',p,1.)]
    return nearest(p)
# Quantify wall cores and weather leaves on physical rectangles with single
# ownership at intersections. Gross opening fill is an adverse gravity budget,
# never favourable dead weight in the uplift case. 25 bounds RC substitutions.
wr={}
def wallrect(i,u0,u1,d,w):return [u0,d-w/2,u1,d+w/2] if i==0 else [d-w/2,u0,d+w/2,u1]
def clipped(r):return [max(0,r[0]),max(0,r[1]),min(12000,r[2]),min(12000,r[3])]
for level,hh in [('ground',3.350),('upper',3.170)]:
    rows=[]
    for w,(i,d) in outer.items():
        lo,hi=(A-70,B+70) if w.startswith('outer') else (C-70,E+70)
        # Ground wrap stops at the open loggia and eastern open-air service room:
        # an explicit gross masonry-equivalent lintel/spandrel budget over that
        # removed material is retained for gravity only and named as such.
        rows.append((w,wallrect(i,lo,hi,d,140),lambda p,w=w:facade(w,p,False),25,hh,'core'))
        inward={'outer-south':-1,'outer-north':1,'outer-west':-1,'outer-east':1,'court-south':1,'court-north':-1,'court-west':1,'court-east':-1}[w]
        weatherd=d+inward*281.25;lo,hi=(0,12000) if w.startswith('outer') else (4250,7750)
        rows.append((w+'-weather',wallrect(i,lo,hi,weatherd,102.5),lambda p,w=w:facade(w,p,False),20,3.55 if level=='ground' else 3.860,'leaf'))
    for w in h['groundWalls' if level=='ground' else 'upperWalls']:
        if w['id']=='gallery-east-water-weather':continue # same spine core
        i=0 if w['a'][0]!=w['b'][0] else 1;d=w['a'][1-i];lo=max(A-70,min(w['a'][i],w['b'][i]));hi=min(B+70,max(w['a'][i],w['b'][i]))
        wid=w['structuralCore'][1]-w['structuralCore'][0]
        rows.append((w['id'],wallrect(i,lo,hi,d,wid),lambda p,w=w:core(w,p) if level=='ground' else lower(p),25,hh,'core'))
    if level=='ground':
        for k,i,d,lo,hi in [('loggia-west-weather',1,4748.75,7750,12000),('loggia-east-weather',1,7251.25,7750,12000),('plant-north',0,6248.75,9397,12000),('east-passage-north-weather',0,7551.25,9397,12000),('gallery-east-water-weather',1,9671.25,6300,7500)]:
            wall=next(w for w in h['groundWalls'] if w['id']==k)
            rows.append((k+'-leaf',wallrect(i,lo,hi,d,102.5),lambda p,wall=wall:core(wall,p),20,3.55,'leaf'))
    # Two full-height leaf closures flank the rear upper wall where exposed
    # below the first floor; loggia above is enclosed by the outer facade.
    xs=sorted({v for _,r,*_ in rows for v in [r[0],r[2]]}); ys=sorted({v for _,r,*_ in rows for v in [r[1],r[3]]})
    for xa,xb in pairwise(xs):
        for ya,yb in pairwise(ys):
            p=((xa+xb)/2,(ya+yb)/2)
            hit=next((row for row in rows if inside(p,row[1])),None)
            if not hit:continue
            name,r,dest,rho,height,typ=hit;ar=(xb-xa)*(yb-ya)/1e6
            # Partition at roughly 100mm to resolve openings, local head spans and
            # transferred loaded length; integration is checked by whole moments.
            i=0 if xb-xa>=yb-ya else 1;n=max(1,math.ceil(max(xb-xa,yb-ya)/130))
            for j in range(n):
                pp=axis2(i,([xa,ya][i]+[xb-xa,yb-ya][i]*(j+.5)/n),p[1-i])
                # Extra area load is an enforceable combined finish, insulation,
                # fixtures and connection mass budget per gross m² of wall face.
                gauge=min(r[2]-r[0],r[3]-r[1])/1000;face=ar/gauge
                source(level+' '+typ+' and finish budget','G',height*(rho*ar+face*(.4 if typ=='core' else .3))/n,pp,dest(pp))
# First-floor fields: two actual bearing edges per oriented tributary. Outside
# those fields retain the physical bridge, trimmer and all narrow residual slabs.
stair=xyrect(h['stair']);void=xyrect(h['void']);court=xyrect(h['court']);inner=[A,A,B,B];bridge=[4885,2735,7115,3832.5]
def strips(r,axis,a,b,fn):
    i=axis; transverse=1-i;lo,hi=r[transverse],r[transverse+2];n=max(1,math.ceil((hi-lo)/140))
    for j in range(n):
        v=lo+(hi-lo)*(j+.5)/n;p=axis2(i,(r[i]+r[i+2])/2,v)
        ary=(hi-lo)*(r[i+2]-r[i])/n/1e6
        yield p,ary,[(n,q,t*f) for u,t in sides(a,b,p[i]) for n,q,f in fn(axis2(i,u,v))]
firstarea=0
for f in o['floor_fields']:
    r=f['rectangle'];i=0 if f['direction']=='EW' else 1
    for p,ar,nodes in strips(r,i,r[i],r[i+2],lower):
        firstarea+=ar
        for k,rate in [('G',f['G']),('Q',f['Q'])]:source('first-floor fields',k,ar*rate,p,nodes)
# The finite entry bridge spans EW between side beams, which span NS to seats.
def bridgeend(p):
    x,y=p
    return [(n,q,t*f) for v,t in sides(2650,C,y) for n,q,f in lower((x,v))]
for p,ar,nodes in strips(bridge,0,4785,7215,bridgeend):
    firstarea+=ar
    for k,r in [('G',7.5),('Q',2)]:source('first-floor bridge',k,ar*r,p,nodes)
for c in read('physical-slab-join.json')['cells']:
    r=c['rect'];p=((r[0]+r[2])/2,(r[1]+r[3])/2);ar=c['area_m2'];firstarea+=ar
    if c['mode']=='loggia-transverse-end':
        ns=[('loggia-W',(4377.5,p[1]),(7622.5-p[0])/3245),('loggia-E',(7622.5,p[1]),(p[0]-4377.5)/3245)]
    elif 4800<=p[0]<=4885 and 2650<=p[1]<=C or 7115<=p[0]<=7200 and 2650<=p[1]<=C:
        # Residual beside the entrance belongs to the finite side beam, not a
        # nearest ground rib hundreds of millimetres away.
        ns=bridgeend((4785 if p[0]<6000 else 7215,p[1]))
    else:ns=lower(p)
    for k,v in [('G',8.5),('Q',2)]:source('first-floor residual RC and finish',k,v*ar,p,ns)
assert math.isclose(firstarea,100.6602)
# Ground floor, all common beams/caps and their intersections taken once by
# vertical intervals. Low loggia ties lie BELOW the sloping outdoor deck.
# Normal interior RC spans between the nearest bracketing parallel ribs across
# a physically present continuous solid field. Exterior court/loggia/relief
# decking is separately assigned and has no assumed RC-to-weather insulation.
rects=[];lines={}
for n in [*gs,*links]:
    a,b=outline(n);w=gs[n]['width'] if n in gs else links[n]['width'];z=(gs[n] if n in gs else links[n])['z'];i=0 if a[0]!=b[0] else 1
    r=wallrect(i,a[i],b[i],a[1-i],w);rects.append((r,z,n));lines[n]=(i,a[1-i],a[i],b[i])
for n,hd in heads.items():
    x,y=hd['xy'];w,d=hd['capXY'];rects.append(([x-w/2,y-d/2,x+w/2,y+d/2],hd['capZ'],n))
loggia=[4800,7750,7200,B];outdoor=[9722.5,6300,B,7500];seat=xyrect(h['southCourtThresholdReference']['pan']['permanentSeat']['plan'])
garea=defaultdict(float);worstspan=(0,None);edgeMiss=0
def ground(p):
    global worstspan,edgeMiss
    x,y=p;options=[]
    for i in (0,1):
        # Span along i to ribs transverse to i, never credit an imaginary wall.
        v=p[1-i];br=[(d,n) for n,(j,d,a,b) in lines.items() if j!=i and a-.01<=v<=b+.01 and not n.startswith('low-tie')]
        l=max(((d,n) for d,n in br if d<=p[i]),default=None);r=min(((d,n) for d,n in br if d>=p[i]),default=None)
        if l and r and r[0]>l[0]:
            options.append((r[0]-l[0],i,l,r))
    if not options:
        n=nearest(p);edgeMiss=max(edgeMiss,math.dist(p,towards(*outline(n[0][0]),.5)));return n
    span,i,l,r=min(options)
    if span>worstspan[0]:worstspan=(span,p)
    return [(n,axis2(i,u,p[1-i]),t) for n,(u,t) in zip([l[1],r[1]],sides(l[0],r[0],p[i]))]
allrect=[inner,loggia,court,outdoor,seat]+[r for r,z,n in rects]
xs=sorted({v for r in allrect for v in [r[0],r[2]]});ys=sorted({v for r in allrect for v in [r[1],r[3]]})
for xa,xb in pairwise(xs):
    for ya,yb in pairwise(ys):
        p=((xa+xb)/2,(ya+yb)/2);ar=(xb-xa)*(yb-ya)/1e6
        slabs=[];occ=inside(p,inner) and not any(inside(p,r) for r in [court,loggia,outdoor]) or inside(p,seat)
        if occ:slabs.append(([-380,-180],'ground slab'))
        bodies=slabs+[(z,n) for r,z,n in rects if inside(p,r)]
        # Both faces of each z interval matter at the two low ties.
        if bodies:
            zz=sorted({v for z,n in bodies for v in z})
            for bottom,top in pairwise(zz):
                owner=next((n for z,n in bodies if z[0]<=(bottom+top)/2<=z[1]),None)
                if owner:
                    vol=ar*(top-bottom)/1000
                    source('ground RC200' if owner=='ground slab' else 'common grid and heads','G',vol*25,p,ground(p) if owner=='ground slab' else [(owner,p,1.)] if owner not in heads else [(owner,heads[owner]['xy'],1.)])
        if occ:
            garea['dry slab']+=ar
            for k,rate in [('G',2.5),('Q',2)]:source('ground finishes and use',k,ar*rate,p,ground(p))
        elif inside(p,court):
            # Independent slab deck load comparison to W and E court girders;
            # no such material is added to the domestic ground slab cubature.
            garea['exterior court']+=ar;dest=[(n,(u,p[1]),t) for n,(u,t) in zip(['court-W','court-E'],sides(3950,7950,p[0]))]
            for k,r in [('G',7.5),('Q',4)]:source('exterior court deck reserved',k,ar*r,p,dest)
        elif inside(p,loggia):
            garea['exterior loggia']+=ar;dest=[(n,(p[0],u),t) for n,(u,t) in zip(['low-tie-8050','low-tie-11667'],sides(8050,B,p[1]))]
            for k,r in [('G',7.5),('Q',4)]:source('exterior loggia deck reserved',k,ar*r,p,dest)
        elif inside(p,outdoor):
            garea['exterior east']+=ar;dest=[(n,(p[0],u),t) for n,(u,t) in zip(['passage-S','passage-N'],sides(6100,7700,p[1]))]
            for k,r in [('G',3),('Q',4)]:source('exterior passage deck reserved',k,ar*r,p,dest)
# Roof ceiling over the entire occupied footprint, including entrance and stair
# voids. Core-wall mass stops at collector underside. This is distinct from
# floor soffit finishes in the non-wall floor allowance.
ceillines=[(w,i,d,*((A,B) if w.startswith('outer') else (C,E))) for w,(i,d) in outer.items()]
for w in h['upperWalls']:
    i=0 if w['a'][0]!=w['b'][0] else 1;ceillines.append((w,i,w['a'][1-i],w['a'][i],w['b'][i]))
def ceiling(p):
    opt=[]
    for i in [0,1]:
        br=[(d,j,n) for j,(n,direction,d,a,b) in enumerate(ceillines) if direction!=i and a<=p[1-i]<=b]
        l=max((q for q in br if q[0]<=p[i]),default=None,key=lambda q:q[0]);r=min((q for q in br if q[0]>=p[i]),default=None,key=lambda q:q[0])
        if l and r and r[0]>l[0]:opt.append((r[0]-l[0],i,l,r))
    span,i,l,r=min(opt,key=lambda q:q[0]);ns=[]
    for w,(u,t) in zip([l[2],r[2]],sides(l[0],r[0],p[i])):
        q=axis2(i,u,p[1-i]);out=facade(w,q) if isinstance(w,str) else lower(q)
        ns.extend((n,z,t*f) for n,z,f in out)
    return ns,span
maxceil=0
# Cuts at every finite upper receiving wall and court boundary; below 150mm
# extra quadrature captures the change of nearest span within each field.
cuts=[[A,B,4250,7750] for _ in range(2)]
for w,i,d,a,b in ceillines:
    cuts[i].extend([a,b]);cuts[1-i].append(d)
for i in (0,1):cuts[i]=sorted({v for v in cuts[i] if A<=v<=B})
for xa,xb in pairwise(cuts[0]):
    for ya,yb in pairwise(cuts[1]):
        p=((xa+xb)/2,(ya+yb)/2)
        if inside(p,court):continue
        ns,span=ceiling(p);maxceil=max(span,maxceil)
        source('independent ceiling envelope','G',(xb-xa)*(yb-ya)/1e6*1.5,p,ns)
# Two actual flights; inside landing and beam sit between real west and post
# receivers, not half to a point where the stairwell has no slab.
st=F['stair'];z0,z1=st['bearing_axes_y'];dx0,dx1=st['midlanding_beam']['support_axes_x']
for i,x in enumerate([A+.644*1000,A+1.938*1000]):
    high=[('outer-W',(dx0,z1),(dx1-x)/(dx1-dx0)),('stair-post',(dx1,z1),(x-dx0)/(dx1-dx0))]
    for k,rate in [('G',st['G']),('Q',st['Q'])]:
        u=st['flight_body_width']*(z1-z0)/1e6*rate
        source('two stair flights',k,u,(x,(z0+z1)/2),[(n,p,f/2) for n,p,f in high]+[('stair-header',(x,z0),.5)])
for p,ar,ns in strips([429.5,7257.5,2817.5,8852.5],1,7257.5,8852.5,lambda q:([('outer-W',(dx0,z1),(dx1-q[0])/(dx1-dx0)),('stair-post',(dx1,z1),(q[0]-dx0)/(dx1-dx0))] if q[1]==z1 else lower(q))):
    for k,r in [('G',6.75),('Q',3)]:source('stair midlanding',k,r*ar,p,ns)
# Downstand only where top 200 is already in the floor. Concrete/overlap budget
# at abutting beam ends is conservative; these are net extra material maxima.
for n,co,p,q in [('stair-header',F['stair_header']['section'],(A,4332.5),(C,4332.5)),('long-trimmer',F['long_trimmer']['section'],(2917.5,4332.5),(2917.5,8852.5)),('west-return',F['west_return']['section'],(2917.5,2650),(2917.5,4332.5)),('wet upper beam',o['wet_wall_beam']['section'],(2902.5,8852.5),(2902.5,B))]+[(c['id'],c['section'],(c['x_supports'][0],c['axis_y']),(c['x_supports'][1],c['axis_y'])) for c in F['corner_collectors']]:
    for p0,l in parts(p,q):
        source('upper frame downstands','G',co['b']*(co['h']-200)/1e6*25*l,p0,lower(p0))
for x in [4785,7215]:source('upper frame downstands','G',1.90125/2,(x,(2650+C)/2),bridgeend((x,(2650+C)/2)))
for p,l in parts((dx0,z1),(dx1,z1)):
    source('landing beam and post','G',.250*.190*25*l,p,[('outer-W',(dx0,z1),(dx1-p[0])/(dx1-dx0)),('stair-post',(dx1,z1),(p[0]-dx0)/(dx1-dx0))])
source('landing beam and post','G',.25*.25*(1.335+.18)*25,(2942.5,z1),[('stair-post',(2942.5,z1),1)])
# Operational sources distinct from background slabs. Two simultaneous 5kN
# variable rail/service challenges are conservatively put at opposite stations.
for n,x,y in [('spine',9300,6900),('outer-E',B,6900)]:source('wet equipment variable reserve','Q',5,(x,y),[(n,(x,y),1.)])
# Added standing plant masses, separate from live/occupancy (conditional W9/VTC).
for x,y,g in [(11100,4300,1.530),(10900,4500,.805)]:
    source('concentrated plant budget','G',g,(x,y),ground((x,y)))
# Check each originating family, in EACH load case, for vertical and two first
# moments against all final signed head forces and residual eccentric couples.
errors=[]
for key,tot in orig.items():
    recovered=[0.,0.,0.]
    for n,hd in heads.items():
        g,mx,my=sums[n,*key];x,y=hd['xy'];recovered[0]+=g;recovered[1]+=g*x/1000+mx;recovered[2]+=g*y/1000+my
    delta=[x-y for x,y in zip(recovered,tot)]
    if max(map(abs,delta))>1e-6:errors.append([key,delta])
assert not errors,errors
lat=read('current-house-lateral.json');rho=roof['globalOrigins'];height=read('current-house-roof-connection.json')['heightComparison']

# Signed lateral load is fed to the actual RC floor and steel roof collectors.
# Full 12.4m rectangle to the proposed higher ridge; below-grid face is exposed
# only down to the selected local head comparison. Exterior grade/site is unknown.
zbase=-.75;zground=-.180;zfloor=3.370;zroof=6.740;zridge=height['selectedCandidateRidge']/1000
ww=2.25*(h['shell']+2*h['roofDevelopment']['overhang'])/1000
F0=ww*(zfloor-zground)/2;F1=ww*((zfloor-zground)+(zroof-zfloor))/2;F2=ww*((zroof-zfloor)/2+(zridge-zroof));M2=ww*(zridge-zroof)**2/2
pl=ww*(zground-zbase);V=F0+F1+F2+pl;Mt=F0*(zground-zbase)+F1*(zfloor-zbase)+F2*(zroof-zbase)+M2+pl*(zground-zbase)/2
assert math.isclose(Mt,ww*(zridge-zbase)**2/2)
# Homogeneous mirrored L sections, rigid symmetric diaphragms constrain coupled
# orthogonal displacements. Product inertia determines the secondary force on
# each pile group; opposite corners cancel only in whole-building totals.
rect=[(0.,0.,1000.,140.),(0.,140.,140.,1000.)]
area=sum((b-a)*(d-c) for a,c,b,d in rect);cx=sum((b-a)*(d-c)*(b+a)/2 for a,c,b,d in rect)/area
ix=iy=ixy=0.
for a,c,b,d in rect:
    w,hh=b-a,d-c;t=w*hh;xx=(a+b)/2-cx;yy=(c+d)/2-cx
    ix+=w*hh**3/12+t*yy**2;iy+=hh*w**3/12+t*xx**2;ixy+=t*xx*yy
ratio=ixy/ix;assert -.59<ratio<-.58
wind=defaultdict(dict);coord={tuple(g['xy']):n for n,g in heads.items()}
for ax in [0,1]:
    for sgn in [-1,1]:
        case='W'+('X' if ax==0 else 'Y')+('+' if sgn==1 else '-')
        for pier in lat['RClegs']['piers']:
            p0,px,py=pier['cornerPileGroup'];sx=1 if px[0]>p0[0] else -1;sy=1 if py[1]>p0[1] else -1
            major=sgn*Mt/4;minor=major*ratio*sx*sy
            mx,my=(major,minor) if ax==0 else (minor,major)
            n1=mx/((px[0]-p0[0])/1000);n2=my/((py[1]-p0[1])/1000)
            for p,v in [(p0,-n1-n2),(px,n1),(py,n2)]:wind[case][coord[tuple(p)]]=v
        assert abs(sum(wind[case].values()))<1e-8
        for j in [0,1]:assert abs(sum(v*heads[n]['xy'][j]/1000 for n,v in wind[case].items())-(sgn*Mt if j==ax else 0))<1e-7
for sx in [-1,1]:
    for sy in [-1,1]:
        kx='WX'+('+' if sx==1 else '-');ky='WY'+('+' if sy==1 else '-')
        wind[kx+ky]={n:wind[kx].get(n,0)+wind[ky].get(n,0) for n in heads}
cards=[];categories=sorted({key[0] for key in orig})
for n,hd in heads.items():
    # Cx,Cy are the signed residual first-moment couples at each real head;
    # M about Y from X arm, M about X from Y arm (sign convention stated).
    cas={k:[sum(sums[n,c,k][i] for c in categories) for i in range(3)] for k in ['G','Q','U']}
    cas['ULSdown']=[1.35*g+1.5*q for g,q in zip(cas['G'],cas['Q'])]
    signed={name:cas['U'][0]+vs.get(n,0) for name,vs in wind.items()}
    nmax=max(cas['ULSdown'][0]+max(w.get(n,0) for w in wind.values()),cas['ULSdown'][0]);nmin=min(*signed.values(),cas['U'][0],0.)
    wcard={name:vs.get(n,0) for name,vs in wind.items()};corner='stability corner group' in hd['roles']
    local=[]
    for j in range(3):
        lo=hi=0.
        for c in categories:
            if c in ['roof','roof signed rows']:continue
            for k,f in [('G',1.35),('Q',1.5)]:
                lo+=adverse[n,c,k][2*j]*f;hi+=adverse[n,c,k][2*j+1]*f
        r0,r1=adverse[n,'roof signed rows','R'][2*j:2*j+2];s0,s1=adverse[n,'roof signed rows','S'][2*j:2*j+2]
        lo+=6.3*r0-2.25*r1+s0;hi+=6.3*r1-2.25*r0+s1
        if j==0:lo+=min(w.get(n,0) for w in wind.values());hi+=max(w.get(n,0) for w in wind.values())
        local.append([round(lo,4),round(hi,4)])
    cards.append({'id':n,'independentAdverseNCxCy':local,'xy':hd['xy'],'headZ':-750,'caseVerticalAndEccentricCouples':{k:[round(v,5) for v in z] for k,z in cas.items()},'overturningIncrementByDirection':{k:round(v,4) for k,v in wcard.items()},'upliftRoofPlusWind':{k:round(v,4) for k,v in signed.items()},'gravityPlusWindMaximum':round(nmax,4),'noFavourableDeadMinimum':round(nmin,4),'groupShearPerAxisWholeToOneHeadAdverse':round(V/4,4) if corner else 0,'originGQUp':{c:[round(sums[n,c,k][0],4) for k in ['G','Q','U']] for c in categories if max(abs(sums[n,c,k][0]) for k in ['G','Q','U'])>.00001}})
assert max(routeGap.values())<=150, routeGap
firstMoment={k:[round(sum(v[i] for (c,kk),v in orig.items() if kk==k),5) for i in range(3)] for k in ['G','Q','U']}
ranges={k:[min((v[k],v['id']) for v in cards),max((v[k],v['id']) for v in cards)] for k in ['gravityPlusWindMaximum','noFavourableDeadMinimum']}
# A closed register can reveal a failure. These fallback distances and floor-
# span outliers must be examined, not asserted away merely because sums close.
out={'status':'52-head force-and-two-first-moment comparison; gravity budgets and signed wind/uplift are not soil reactions under verified stiffness or accepted junction capacities','adverseMethod':'Per origin and every quadrature station take positive and negative influence separately: G=0..1.35, Q=0..1.5, roof independent row pressures=-2.25..+6.3 kPa, structural metal=0..1.35G. Combine with both axis winds independently at full envelope (including diagonals). Each head lists independentAdverseNCxCy as [min,max] in N, Cx, Cy order; bounds are not simultaneous and MUST NOT be summed. Zero favourable dead load is credited.','sources':{f:hashlib.sha256((D/f).read_bytes()).hexdigest() for f in ['current-house-grid.json','current-house-roof-network.json','current-house-lateral.json','current-house-roof-connection.json','physical-slab-join.json','open-loggia-support.json']},'HAD':gd['sources']['project/had/studies/water-replan.json'],'interpretation':'Units kN,kNm,mm. G/Q/U each conserved in every named origin family. Positive compression; U is -2.25kPa roof with no favourable G. Eccentric Cx=N*deltaX, Cy=N*deltaY. Each head gives [N,Cx,Cy], not an unsigned resultant. U+direction and 1.35G+1.5Q+direction are separate conservative envelopes, not a prescribed code combination. Each span treated as end-supported, signed cantilever reactions allowed: stiffness, alternate load patterns, positive ties and shaft moment resistance are not credited. Gross filled wall openings are a one-sided maximum; never stabilise adverse uplift with fictitious masonry.','surfaceComparators':{'upperRCarea':firstarea,'groundFields':dict(garea),'maximumGroundRCSpanMM':worstspan,'maximumCeilingSpanMM':maxceil,'nearestFallbackMaxDistancesMM':{k:[v,fallbackSites[k]] for k,v in sorted(routeGap.items(),key=lambda p:-p[1])}},'globalGQUpFirstMoments':firstMoment,'originVerticalGQUp':{c:[round(orig[c,k][0],5) for k in ['G','Q','U']] for c in categories if c!='roof signed rows'},'lateral':{'zBaseFloorRoofRidge':[zbase,zfloor,zroof,zridge],'facadeWidth':ww/2.25,'loadPerHeight':ww,'exposedLowerPlinthShear':pl,'groundFloorRoofCollectors':[F0,F1,F2],'roofLocalOverturning':M2,'globalShear':V,'globalMomentAtShaft':Mt,'IxyOverI':ratio,'groupCondition':'Rigid symmetric restrained diaphragms; signs transformed by each mirrored L. Vertical group couple conserved about head at -750; no pile bending credited for that couple. Whole group lateral shear separately assigned as adverse per-head demand; do not sum per-head adverse group shares. Foundation stiffness, settlement and soil capacity unknown.'},'ranges':ranges,'heads':cards,'admission':False}
assert len(cards)==gd['headCount']==52
assert abs(firstMoment['U'][0]+324.3375)<1e-5 and abs(firstMoment['U'][1]-6*firstMoment['U'][0])<1e-5 and abs(firstMoment['U'][2]-6*firstMoment['U'][0])<1e-5
assert all(c['independentAdverseNCxCy'][0][0]<=c['noFavourableDeadMinimum']+.001 and c['gravityPlusWindMaximum']<=c['independentAdverseNCxCy'][0][1]+.001 for c in cards)
def rounded(v):
    if isinstance(v,dict):return {k:rounded(x) for k,x in v.items()}
    if isinstance(v,(list,tuple)):return [rounded(x) for x in v]
    return round(v,6) if isinstance(v,float) else v
out=rounded(out)
output=D/'current-house-head-actions.json';txt=json.dumps(out,indent=2)+'\n'
if '--check' in sys.argv:assert output.read_text()==txt
else:output.write_text(txt)
print('52 heads; G/Q/U & global first moments',firstMoment,'; axial extremes',ranges,'; floor span',worstspan,'; fallback',sorted(routeGap.items(),key=lambda p:-p[1])[:5],'; ceiling',maxceil)
