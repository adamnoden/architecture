"""Join source load records, two finite roof rings and the integral floor edge.
Compute actual signed states on passive lower bearings with eight captive stops.
Legacy family records are replayed before lower-wall collapse, not overwritten
on old shaft cards. Positive kN down, residual Cx=N*deltaX, Cy=N*deltaY kNm.
"""
from pathlib import Path
import math,json,runpy,sys,hashlib
from itertools import pairwise
from collections import defaultdict
D=Path(__file__).resolve().parent
def read(n):return json.loads((D/n).read_text())
def collect(lst):
    return lambda c,k,n,p,rr:lst.append((c,k,n,p,rr))
olds=[];mins=[]
args=sys.argv[:];sys.argv=['joined-source','--check']
old=runpy.run_path(str(D/'current-house-head-actions.py'),init_globals={'originObserver':collect(olds)})
edge=runpy.run_path(str(D/'current-house-floor-closure.py'),init_globals={'retainedObserver':lambda c,r,f:mins.append((c,dict(r),f))})
sys.argv=args
plane=runpy.run_path(str(D/'current-house-roof-bracing.py'))
plane['bracedAlternate']=plane['actual'];plane['actual']=plane['space']
rings=read('current-house-ring-space.json')['rings'];w=read('current-house-welded-network.json');h=old['h'];gd=old['gd'];heads=old['heads'];W=edge['walls'];caps=edge['caps'];loPads=edge['allLower']
A,B,C,E=332.5,11667.5,3917.5,8082.5
# Build reusable unit routes through named lower beams: no stepping sideways
# to the closest shaft. Preserve the perpendicular force couple on each real head.
def foldGround(name,point,weight,ox=0.,oy=0.):
    if name in heads:return [(name,weight,weight*ox/1000,weight*oy/1000)]
    ends=old['member'](name,point)
    dx=point[0]-sum(p[0]*t for h,p,t in ends);dy=point[1]-sum(p[1]*t for h,p,t in ends)
    return [y for k,p,f in ends if f for y in foldGround(k,p,weight*f,ox+dx,oy+dy)]
# receiver identities can be heads or floor-edge pads. The source residual
# couple is retained, never disguised as a new vertical source.
def routes(nodes):
    end=[]
    for n,p,t in nodes:
        if n.startswith('@'):
            for q,f in edge['lower'](n[1:],p):end.append((tuple(q),t*f,0.,0.))
        else:end.extend(foldGround(n,p,t))
    return end
def xy(key):return key if isinstance(key,tuple) else tuple(heads[key]['xy'])
book=defaultdict(lambda:defaultdict(lambda:[0.,0.,0.]));orig=defaultdict(lambda:[0.,0.,0.])
bounds=defaultdict(lambda:[[0.,0.] for _ in range(3)])
def addB(rows,lo,hi):
    for h,vec in rows.items():
        for j,x in enumerate(vec):
            bounds[h][j][0]+=min(lo*x,hi*x);bounds[h][j][1]+=max(lo*x,hi*x)
edgeEvents=[]
def upperEvent(ns,N,lo,hi):
    ev=[(name[1:],q,t*N) for name,q,t in ns if name.startswith('@') and abs(t*N)>1e-10]
    if ev:edgeEvents.append((ev,lo,hi))
def put(c,k,N,p,ns):
    if abs(N)<1e-12:return
    dest=routes(ns);assert abs(sum(t for h,t,x,y in dest)-1)<1e-6,(c,p,ns)
    dx=p[0]/1000-sum(t*xy(h)[0]/1000+x for h,t,x,y in dest);dy=p[1]/1000-sum(t*xy(h)[1]/1000+y for h,t,x,y in dest)
    o=orig[c,k];o[0]+=N;o[1]+=N*p[0]/1000;o[2]+=N*p[1]/1000
    per=defaultdict(lambda:[0.,0.,0.])
    for h,t,x,y in dest:
        e=per[h];e[0]+=N*t;e[1]+=N*(x+t*dx);e[2]+=N*(y+t*dy)
        v=book[c,k][h];v[0]+=N*t;v[1]+=N*(x+t*dx);v[2]+=N*(y+t*dy)
    if k in ['G','Q'] and c!='shifted roof excluding global braces':
        scale=1.35 if k=='G' else 1.5;addB(per,0,scale);upperEvent(ns,N,0,scale)
    if k=='R':addB(per,-2.25,6.3);upperEvent(ns,N,-2.25,6.3)
    if k=='S':addB(per,0,1.35);upperEvent(ns,N,0,1.35)
# Include actual reinforcing steel as an adverse additional permanent load,
# even though each RC volume was already counted at 25 kN/m3. No extra
# minimum stabilising mass credit. Use original local receiver points:
# floor fields and residual/bridge area all carry 2 kPa characteristic Q.
for c,k,n,p,rr in olds:
    if c in ['first-floor fields','first-floor bridge','first-floor residual RC and finish'] and k=='Q':
        rate=4*math.pi*12**2/4/150*1000*7850/1e6*.00981
        put('first-floor full membrane mesh reserve','G',n/2*rate,p,rr)
    if c=='ground RC200' and k=='G':
        rate=4*math.pi*12**2/4/100*1000*7850/1e6*.00981
        put('ground floor full two-face cage reserve','G',n/5*rate,p,rr)
    if c not in ['roof','roof signed rows','steel wall-head ring']:put(c,k,n,p,rr)
def virtual(p):return '@'+edge['wallat'](p)
def uput(c,k,N,p):put(c,k,N,p,[(virtual(p),p,1.)])
# Conservative installed quantities above envelope budgets: actual core/slab
# volume overlapping the proposed first-floor edge is already in G. Gmax core
# was gross filled 25kN/m3; never stabilises the roof.
sets=edge['sets'];arInc=0.
for xa,xb in pairwise(sets[0]):
 for ya,yb in pairwise(sets[1]):
    p=(x,y)=((xa+xb)/2,(ya+yb)/2);inc=lambda r:r[0]<x<r[2] and r[1]<y<r[3]
    I=inc(edge['outerRect']) and not inc(edge['outerHole']) or inc(edge['courtRect']) and not inc(edge['courtHole'])
    if not I:continue
    ex=any(inc(r) for r in edge['Lrect']) or inc(edge['inner']) and not any(inc(r) for r in edge['holes'])
    if ex:continue
    ar=(xb-xa)*(yb-ya)/1e6;arInc+=ar
    name=min(W,key=lambda w:abs(p[1-W[w][0]]-W[w][1]) if W[w][2]<=p[W[w][0]]<=W[w][3] else 1e6)
    i,d,lo,hi,us=W[name];q=edge['xy'](name,max(lo,min(hi,p[i])));put('RC edge beyond previously counted RC and upper core','G',ar*.2*25,p,[('@'+name,q,1.)])
assert math.isclose(arInc,2.653,abs_tol=1e-6)
for nm,(i,d,lo,hi,us) in W.items():
    for p,ln in old['parts'](edge['xy'](nm,lo),edge['xy'](nm,hi)):
        # Reinforcement budget 1.85t includes the separate eight-H12 membrane chord
        # and fabrication/continuity beyond 1.648t nominal; gross concrete not reduced.
        uput('edge reinforcement reserve','G',ln/62*1850*.00981,p)
allupper={tuple(row['xy']) for g in rings.values() for row in g['stations']}
for p in allupper:
    # Gross added rod/foot/end/nut/splice budget 24kg intermediate /45kg
    # corner, separate from RC cage and roof heel budget. No Gmin credit.
    uput('floor positive ties and plate reserve','G',(.045 if p in caps else .024)*9.81,p)
# Gross added steel, counted in every maximum G case, never as minimum G.
# Take substantial physical stock in the four capillary joints and new pier
# cages beyond the previous nominal concrete-volume allowance. Concentrate
# the uniformly distributed pier cage at the actual centroid of its L shape.
for p in plane['corners']:
    sg=[1 if x==A else -1 for x in p]
    aa=plane['cc']-70
    qp=tuple(z+s*aa for z,s in zip(p,sg));ratio=aa/860
    dest=[(old['coord'][p],p,1-2*ratio)]
    for j in range(2):
        q=list(p);q[j]+=sg[j]*860;q=tuple(q);dest.append((old['coord'][q],q,ratio))
    put('outer pier cage and positive DPC stock reserve','G',(420+120)*.00981,qp,dest)
def windrows(g,wi):return [{'xy':p,'n':n} for p,n in zip(g['windStationOrder'],g['windAtActualStations'][wi])]
def vrange(r):return [(virtual(tuple(q['xy'])),tuple(q['xy']),q['n']) for q in r]
inf={}
for label,r in rings.items():
    for k,rows in r['influence'].items():
        if k=='ringMass':
            for nm,p,t in vrange(rows):uput('steel wall-head ring','G',t,p)
        else:
            kind,pos=k.split(':');p=tuple(float(x) for x in pos.split(','));inf[kind,p]=vrange(rows)
for p,n in plane['braceG'].items():put('roof plane reserve at distributed interface stations','G',n,p,inf['bracemass',p])
for f in w['frames']:
    ordinary=f['id']=='ordinary';L=f['axisSpanM'];ds=1 if ordinary else math.sqrt(2)
    radial=[(p,q) for p,q in plane['radials'] if ((p[0]==q[0] or p[1]==q[1])==ordinary)]
    pts=[(r['x'],r['area']*1.5/math.cos(math.radians(25))+r['area']/r['rowWidth']*w['sections']['secondary']['lineG'],r['area']*1.5,-2.25*r['area']) for r in f['rows']]
    pts += [(L/4-.26625*ds,f['primaryG']/2,0,0),(3*L/4+.26625*ds,f['primaryG']/2,0,0),(0,f['tieG']/2+1,0,0),(L,f['tieG']/2+1,0,0),(L/2,.5,0,0)]
    for outer,inner in radial:
        for ii,(x,g,q,u) in enumerate(pts):
            p=old['towards'](inner,outer,x/L)
            ns=[(nm,rr,t*coef) for at,coef in [(inner,1-x/L),(outer,x/L)] for nm,rr,t in inf['F',at]]
            for case,n in [('G',g),('Q',q),('U',u)]:put('shifted roof excluding global braces',case,n,p,ns)
            arow=f['rows'][ii]['area'] if ii<len(f['rows']) else 0.
            put('row independent', 'R',arow,p,ns);put('row independent','S',g-arow*1.5/math.cos(math.radians(25)),p,ns)
# The positive gravity references do not erase the heel torsion/eccentric
# reversible component. Each is a pure moment, with real signed vertical
# reactions (may sum to zero), not a positive unit/nearest shaft.
for (kind,p),rr in inf.items():
 if kind in ['torsion','eccentric']:
    dest=routes(rr);rows=defaultdict(lambda:[0.,0.,0.]);mag=10 if kind=='torsion' else 10.3
    for k,t,x,y in dest:
        rows[k][0]+=t;rows[k][1]+=x;rows[k][2]+=y
    assert abs(sum(z[0] for z in rows.values()))<1e-5
    addB(rows,-mag,mag);upperEvent(rr,1.,-mag,mag)
assert math.isclose(orig['shifted roof excluding global braces','G'][0]+orig['roof plane reserve at distributed interface stations','G'][0],w['globalOrigins']['G'],rel_tol=1e-8)
for c,rs,n in mins:
    for p,t in rs.items():uput(c,'retainedMin',n*t,p)
assert math.isclose(sum(v[0] for (c,k),v in orig.items() if k=='retainedMin'),382.798106,abs_tol=.002)
# Keep each original corner as a *compression* bearing, but anchor below
# the floor at an adjacent real clear jamb over one selected pile, rather
# than drag tension from an unsupported projection or add a new pile.
# Three-point beam balance exactly recovers the corner force AND first
# moment: Rc at A is replaced by tensile T at B and compression P at C.
shifts={(C,C):((C,4332.5),(C,6000.),'P32'),(C,E):((C,7950.),(C,6000.),'P34'),(E,C):((7950.,C),(7215.,C),'P35'),(E,E):((E,7700.),(E,6000.),'P37')}
shifted={t:h for p,(t,s0,h) in shifts.items()}
for t,hh in shifted.items():
    put('court lower tie, blind block and terminal steel','G',90*.00981,t,[(hh,xy(hh),1.)])
for p,(t,s0,h0) in shifts.items():
    assert s0 in loPads and all(abs(t[edge['walls'][edge['wallat'](t)][0]]-q['centre'])>=q['width']/2+125 for q in h['openings']['GROUND'] if q['wall']==edge['wallat'](t))
def splitStop(p):
    t,s0,_=shifts[p];coef=math.dist(p,s0)/math.dist(t,s0)
    assert all(abs(p[j]-coef*t[j]-(1-coef)*s0[j])<1e-8 for j in [0,1])
    return [(t,coef),(s0,1-coef)]
def groundFromPad(p):
    if p in shifted:
        hh=shifted[p];pp=xy(hh);return [(hh,1.,(p[0]-pp[0])/1000,(p[1]-pp[1])/1000)]
    name=edge['wallat'](p);ns=old['wallbase'](name,p)
    if p==(C,C):
        # Same 600x450 concrete at a real common SW elbow. A single
        # alphabetical wall choice previously sent all load via the 835 mm
        # south cantilever, giving P39 -23.03 kN even under full G+Q.
        # Two compatible cantilevers on two real shaft pairs: tip
        # compliance a²(a+L)/(3EI), including backspan rotations.
        aa,bb=4785-p[0],4332.5-p[1];cs=aa*aa*(aa+1215);cw=bb*bb*(bb+1867.5)
        sw=cw/(cs+cw);ns=[(k,pp,f*t) for nm,f in [('court-south',sw),('court-west',1-sw)] for k,pp,t in old['wallbase'](nm,p)]
    dst=routes(ns)
    dx=p[0]/1000-sum(t*xy(h)[0]/1000+x for h,t,x,y in dst);dy=p[1]/1000-sum(t*xy(h)[1]/1000+y for h,t,x,y in dst)
    return [(h,t,x+dx*t,y+dy*t) for h,t,x,y in dst]
padRoutes={p:groundFromPad(p) for p in loPads|set(shifted)}
def ends(p):
    w=edge['wallat'](p);i,d,lo,hi,_=W[w];sc=sorted(x[i] for x in caps if x[1-i]==d and lo<=x[i]<=hi);a,b=next((a,b) for a,b in pairwise(sc) if a<p[i]<b);t=(p[i]-a)/(b-a)
    return [(edge['xy'](w,a),1-t),(edge['xy'](w,b),t)]
def inc(dst,h,v,f=1):
    a=dst[h]
    for i,n in enumerate(v):a[i]+=f*n
def zero():return defaultdict(lambda:[0.,0.,0.])
def direct(k):
    d=zero();o=[0.,0.,0.]
    for (c,kk),rr in book.items():
        if k==kk:
            for h,v in rr.items():inc(d,h,v)
            for i,n in enumerate(orig[c,k]):o[i]+=n
    return d,o
D0={k:direct(k) for k in ['G','Q','U','retainedMin']}
def realState(factors,windIdx=None):
    # Compatibility model remains a lower bound static proposal: first use
    # real short spans, remove each passive tension reaction and carry its
    # residual along the continuous edge to two captive corners. This
    # redistribution cannot create tension at another passive pad.
    d=zero();o=[0.,0.,0.]
    for k,f in factors.items():
        rr,oo=D0[k]
        for h,v in rr.items():inc(d,h,v,f)
        for i,n in enumerate(oo):o[i]+=f*n
    if windIdx is not None:
        for nr,g in rings.items():
            for q in windrows(g,windIdx):
                p=tuple(q['xy']);n=q['n'];ns=routes([(virtual(p),p,1.)])
                for hd,t,x,y in ns:inc(d,hd,(n*t,n*x,n*y))
                for j,v in enumerate([n,n*p[0]/1000,n*p[1]/1000]):o[j]+=v
    falling=[]
    for p in loPads-caps:
        r=d[p]
        if r[0]<0:
            n=r[0];falling.append((p,n));r[0]=0
            for q,t in ends(p):d[q][0]+=t*n
    for p in shifts:
        if d[p][0]<0:
            n=d[p][0];d[p][0]=0
            for t,f in splitStop(p):d[t][0]+=n*f
    pads={p:d[p][:] for p in loPads|set(shifted)};ground=zero()
    for h,(n,cx,cy) in d.items():
        if isinstance(h,str):inc(ground,h,(n,cx,cy))
        else:
            for key,t,x,y in padRoutes[h]:inc(ground,key,(n*t,cx*t+n*x,cy*t+n*y))
    if windIdx is not None:
        case=plane['actual'][windIdx];cs=case[3];GD=old['coord']
        for p,Y in cs.items():
            sx=1 if p[0]==A else -1;sy=1 if p[1]==A else -1
            for j in range(2):
                # Actual coupled pier shear/bending on foundation heads -750,
                # including exposed plinth and lower wall direct-to-ground
                # reactions (added below separately). Transfer bending as a
                # signed couple in each 860mm three-shaft corner group.
                m=(Y[j]*(3370+750)+Y[2+j]*(6600+750))/1e6
                pp=(p[0]+860*sx,p[1]) if j==0 else (p[0],p[1]+860*sy)
                n=m/(.86*(sx if j==0 else sy));ground[GD[pp]][0]+=n;ground[GD[p]][0]-=n;o[j+1]+=m
        # Foundation-level facade half-panel and exposed low plinth at their
        # actual application elevations. No soil/passive earth credit.
        for j,ccc in enumerate(case[0]):
            if not ccc:continue
            s=1 if ccc<4 else -1;full=(ccc-1)%3==0;ww=2.25*12.4*(1 if full else .5)*s
            m=ww*((3.370+.180)/2*.570+.570**2/2)
            # Direct floor-ground diaphragm distributed to 4 bases. This
            # small term is separated; actual soil/stiffness remains open.
            for p in caps:
                if p[0] not in [A,B]:continue
                sg=1 if p[j]==A else -1;pp=list(p);pp[j]+=860*sg;n=m/4/(.86*sg)
                ground[GD[tuple(pp)]][0]+=n;ground[GD[p]][0]-=n
            o[j+1]+=m
    check=[sum(v[0] for v in ground.values()),*[sum(v[0]*xy(k)[j]/1000+v[j+1] for k,v in ground.items()) for j in range(2)]]
    assert max(abs(a-b) for a,b in zip(check,o))<.005,(check,o)
    return ground,pads,falling,check
# Independent, deliberately conservative component bounds across all rows,
# two-axis wind states, and unilateral floor contacts. Variations at different
# shafts are not simultaneous; only realState rows may be summed.
def boundmax(x,y):return [min(x,y),max(x,y)]
def sumInterval(target,src,scale=1.):
    for j,(lo,hi) in enumerate(src):
        a,b=boundmax(lo*scale,hi*scale);target[j][0]+=a;target[j][1]+=b
windPad=defaultdict(lambda:[0.,0.]);windPile=defaultdict(lambda:[[0.,0.] for _ in range(3)])
for wi in range(len(plane['actual'])):
    windOnly=zero()
    for group in rings.values():
        for rr in windrows(group,wi):
            p=tuple(rr['xy']);n=rr['n']
            for key,t,x,y in routes([(virtual(p),p,1.)]):inc(windOnly,key,(n*t,n*x,n*y))
    for key,vec in windOnly.items():
        windPad[key][0]=min(windPad[key][0],vec[0]);windPad[key][1]=max(windPad[key][1],vec[0])
    # Removing the separate eccentric roof-rods contribution here is essential:
    # realState({},wind) ALSO includes roof/grillage verticals and passive clamp
    # redistribution. Extract the actual lower L/group base actions directly
    # by subtracting that floor load path after projection.
    gr,ps,_,_=realState({},wi);sub=zero()
    for p,(n,cx,cy) in ps.items():
        for head,t,x,y in padRoutes[p]:inc(sub,head,(n*t,cx*t+n*x,cy*t+n*y))
    for h,v in gr.items():
        for j in range(3):
            z=v[j]-sub[h][j];windPile[h][j][0]=min(windPile[h][j][0],z);windPile[h][j][1]=max(windPile[h][j][1],z)
for p,bo in windPad.items():
    bounds[p][0][0]+=bo[0];bounds[p][0][1]+=bo[1]
# Route lower residuals to the two captive stations. Use the tighter retained-
# shell card below when selecting a ground rod. This broad stripped/repair
# state cannot rely on incidental weight and is retained as a component control.
rawAll={p:bounds[p][0][:] for p in loPads}
rawCorner={p:bounds[p][0][:] for p in caps}
for p in loPads-caps:
    lo,hi=bounds[p][0]
    for q,t in ends(p):bounds[q][0][0]+=t*min(0.,lo);bounds[q][0][1]+=t*min(0.,hi)
    bounds[p][0]=[max(0.,lo),max(0.,hi)]
cornerRaw={p:bounds[p][0][:] for p in caps}
for p in shifts:
    lo,hi=bounds[p][0]
    for q,t in splitStop(p):
        ll,hh=boundmax(min(0,lo)*t,min(0,hi)*t)
        bounds[q][0][0]+=ll;bounds[q][0][1]+=hh
    bounds[p][0]=[max(lo,0),max(hi,0)]
headB=defaultdict(lambda:[[0.,0.] for _ in range(3)])
for key,vals in bounds.items():
    if isinstance(key,str):sumInterval(headB[key],vals);continue
    for h,t,x,y in padRoutes[key]:
        sumInterval(headB[h],vals,t)
        for j,coef in enumerate([x,y]):
            ll,hh=boundmax(coef*vals[0][0],coef*vals[0][1]);headB[h][j+1][0]+=ll;headB[h][j+1][1]+=hh
for key,rr in windPile.items():sumInterval(headB[key],rr)
if __name__=='__main__':
    print('new held sites',[(p,shifted[p],[round(x,1) for x in bounds[p][0]]) for p in shifted]);print('independent head',min(v[0][0] for v in headB.values()),max(v[0][1] for v in headB.values()),'eight lower corners',[(p,[round(x,1) for x in bounds[p][0]]) for p in sorted(caps)])
    yy=realState({'G':1.35,'Q':1.5});print('static',yy[3],min(q[0] for q in yy[0].values()),max(q[0] for q in yy[0].values()))
    cases=[realState({'U':1,'retainedMin':1},i) for i in range(len(plane['actual']))];print('uplift',min(n[0] for g,*_ in cases for n in g.values()),max(n[0] for g,*_ in cases for n in g.values()),'support',min(p[0] for _,pp,*_ in cases for p in pp.values()))
# Ground-plane horizontal force follows the four named pier groups. Spread
# shear equally in each three-shaft group, adding a tangential couple to
# recover the actual pier-axis location rather than shifting yaw to its centroid.
def horizontal(wi):
    V={k:[0.,0.] for k in heads};g={p:[0.,0.] for p in plane['corners']}
    ax,_,_,cs,_=plane['actual'][wi]
    for p,rs in cs.items():
        for j in [0,1]:g[p][j]+=(rs[j]+rs[j+2])/1000
    for j,cc in enumerate(ax):
        if not cc:continue
        mode=(cc-1)%3;s=1 if cc<4 else -1
        h=2.25*12.4*(1 if mode==0 else .5)*s*((3.370+.180)/2+.570)
        station=[6000,2900,9100][mode]
        # The plan cut parameter follows each windward facade's local sense.
        face=(3 if s==1 else 1) if j==0 else (0 if s==1 else 2)
        coord=plane['pt'](face,A,station)[1-j]
        for p in g:
            t=(coord-A)/(B-A) if p[1-j]==B else (B-coord)/(B-A)
            g[p][j]+=h*t/2
    for p,v in g.items():
        sx=1 if p[0]==A else -1;sy=1 if p[1]==A else -1
        points=[p,(p[0]+860*sx,p[1]),(p[0],p[1]+860*sy)]
        cen=[sum(q[j] for q in points)/3 for j in [0,1]]
        moment=(p[0]-cen[0])*v[1]-(p[1]-cen[1])*v[0]
        pol=sum(math.dist(q,cen)**2 for q in points)
        for q in points:
            vv=V[old['coord'][q]];vv[0]+=v[0]/3-moment*(q[1]-cen[1])/pol
            vv[1]+=v[1]/3+moment*(q[0]-cen[0])/pol
    resultant=[sum(v[j] for v in V.values()) for j in [0,1]]
    assert max(abs(sum(v[j] for v in g.values())-resultant[j]) for j in [0,1])<1e-7
    yaw=sum(v[1]*xy(k)[0]-v[0]*xy(k)[1] for k,v in V.items())/1000
    assert abs(yaw-sum(v[1]*p[0]-v[0]*p[1] for p,v in g.items())/1000)<1e-7
    return V,[*resultant,yaw]
def rounded(v):return [round(x,4) for x in v]
def report():
    case0={'G characteristic':{'G':1},'Q characteristic':{'Q':1},'uniform roof suction only':{'U':1},'max factored gravity':{'G':1.35,'Q':1.5},'retained shell plus uniform suction':{'retainedMin':1,'U':1}}
    named={nm:realState(cf) for nm,cf in case0.items()}
    orientations=[horizontal(i) for i in range(len(plane['actual']))]
    ext={k:[[1e15,-1e15,None,None] for _ in range(5)] for k in heads}
    def see(head,vec,state):
        for j,n in enumerate(vec):
            v=ext[head][j]
            if n<v[0]:v[0]=n;v[2]=state
            if n>v[1]:v[1]=n;v[3]=state
    for id,(gr,_,__,___) in named.items():
        for k in heads:see(k,[*gr[k],0,0],id)
    summaries=[]
    for wi,(v,hor) in enumerate(orientations):
        tx={}
        for id,cf in [('GQ+wind',{'G':1.35,'Q':1.5}),('stripped suction+wind',{'U':1}),('retained suction+wind',{'U':1,'retainedMin':1})]:
            gr,ps,fall,eq=realState(cf,wi);state=id+':'+str(wi)
            for k in heads:see(k,[*gr[k],*v[k]],state)
            tx[id]={'N_Xmoment_Ymoment':rounded(eq),'releasedLowerPadCount':len(fall),'minMaxN':rounded([min(z[0] for z in gr.values()),max(z[0] for z in gr.values())])}
        summaries.append({'wind':wi,'programme':plane['actual'][wi][0],'courtProjection':wi>=48,'Vx_Vy_yaw':rounded(hor),'conservedStates':tx})
    hh=[]
    for k in sorted(heads):
        for j in range(3):
            lo,hi=headB[k][j];actual=ext[k][j];assert lo<=actual[0]+.02 and hi>=actual[1]-.02,(k,j,[lo,hi],actual)
        hh.append({'id':k,'xy':xy(k),'roles':heads[k]['roles'],'named_N_Cx_Cy':{id:rounded(z[0][k]) for id,z in named.items()},'separateComponentBounds_N_Cx_Cy':[rounded(ab) for ab in headB[k]],'coherentExtreme_N_Cx_Cy_Vx_Vy':[[round(l,4),round(h,4),a,b] for l,h,a,b in ext[k]]})
    return {'sources':{str(f.relative_to(D.parents[2])):hashlib.sha256(f.read_bytes()).hexdigest() for f in [D.parents[1]/'had/studies/water-replan.json',D/'current-house-ring-space.json',D/'current-house-welded-network.json',D/'current-house-grid.json',D/'current-house-head-actions.json',D/'current-house-floor-closure.json',D/'current-house-membrane.py']},'admitted':False,'status':'Proposed fixed-base 52-shaft load paths; no geotechnical, section, floor-edge or capillary joint acceptance.','units':'kN, kNm, mm. N positive down; Cx=N*deltaX and Cy=N*deltaY are first-moment residuals in x and y (not textbook Mx/My order). Vx/Vy horizontal kN. Positive yaw counterclockwise.','origins':[{ 'family':c,'case':k,'N_Xmoment_Ymoment':rounded(v)} for (c,k),v in sorted(orig.items()) if k not in ['R','S']],'named_source_totals':{id:rounded(val[3]) for id,val in named.items()},'coherentSignedStates':summaries,'approach':'Horizontal CHS omitted: two finite welded rings with the existing twelve twin-rail radial ties carry roof plan shear. The original 8.5 kN interface/bracing allowance remains an adverse distributed G budget, without favourable mass credit. 96 simultaneous full/partial, signed and biaxial wind patterns each repeated for three gravity/suction states. Ring eccentricities, elevated facade/roof projections applied at the actual ridge purlin, 24 inclined primary legs and their 260 mm eccentric connection to the ring included. Lower passive pads release in tension; each adjacent floor strip routes residual to the two captive corners. Ground-floor plinth wind tributary and L-corner spring shears are distributed to three reference shafts with conserved yaw. First-floor cracked membrane/roof joint/soil stiffness, roof pin/purlin and local floor/arch joints and head/soil capacity remain design questions. Independent component extrema are not one simultaneous house load.','courtTies':[{'oldCorner':p,'newHold':t,'passiveBalance':s,'head':h,'threePointCoefficient':splitStop(p)[0][1],'signedRange':rounded(bounds[t][0])} for p,(t,s,h) in shifts.items()],'outerTies':[{'point':p,'signedRange':rounded(cornerRaw[p])} for p in sorted(plane['corners'])],'heads':hh,'courtSWGroundElbow':'Two actual 600x450 beam returns share the corner compression by equal tip displacement on their real backspans; old first-wall-only control gave P39 -23.0332 kN in gravity. This redistribution demands reinforcement around the real SW node and compatible shaft/soil stiffness. No pile count changed.','localOptionalBay':'Separate unadopted reference in current-house-service-bay.json. Do not add the entire wet sled load to the bay floor. Apply its declared P36/P37 loads only if adopting that control, including moments and hydrostatic action.'}
if __name__=='__main__':
    out=Path(__file__).with_suffix('.json');s=json.dumps(report(),indent=2,sort_keys=True)+'\n'
    if '--check' in sys.argv:assert out.read_text()==s
    else:out.write_text(s)
