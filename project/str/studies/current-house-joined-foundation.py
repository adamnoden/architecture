"""Join source load records, two finite roof rings and the integral floor edge.
Compute actual signed states on passive lower bearings with eight captive stops.
Legacy family records are replayed before lower-wall collapse, not overwritten
on old shaft cards. Positive kN down, residual Cx=N*deltaX, Cy=N*deltaY kNm.
"""
from pathlib import Path
import math,json,runpy,sys
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
rings=read('current-house-ring-braced.json')['rings'];w=read('current-house-welded-network.json');h=old['h'];gd=old['gd'];heads=old['heads'];W=edge['walls'];caps=edge['caps'];loPads=edge['allLower']
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
def put(c,k,N,p,ns):
    if abs(N)<1e-12:return
    dest=routes(ns);assert abs(sum(t for h,t,x,y in dest)-1)<1e-6,(c,p,ns)
    dx=p[0]/1000-sum(t*xy(h)[0]/1000+x for h,t,x,y in dest);dy=p[1]/1000-sum(t*xy(h)[1]/1000+y for h,t,x,y in dest)
    o=orig[c,k];o[0]+=N;o[1]+=N*p[0]/1000;o[2]+=N*p[1]/1000
    per=defaultdict(lambda:[0.,0.,0.])
    for h,t,x,y in dest:
        e=per[h];e[0]+=N*t;e[1]+=N*(x+t*dx);e[2]+=N*(y+t*dy)
        v=book[c,k][h];v[0]+=N*t;v[1]+=N*(x+t*dx);v[2]+=N*(y+t*dy)
    if k in ['G','Q'] and c!='shifted roof excluding global braces':addB(per,0,1.35 if k=='G' else 1.5)
    if k=='R':addB(per,-2.25,6.3)
    if k=='S':addB(per,0,1.35)
for c,k,n,p,rr in olds:
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
        # Reinforcement budget 1.25t includes 239kg beyond nominal 1.01t
        # for continuity and local steel; gross concrete not reduced.
        uput('edge reinforcement reserve','G',ln/62*1250*.00981,p)
allupper={tuple(row['xy']) for g in rings.values() for row in g['stations']}
for p in allupper:
    # Gross added rod/foot/end/nut/splice budget 24kg intermediate /45kg
    # corner, separate from RC cage and roof heel budget. No Gmin credit.
    uput('floor positive ties and plate reserve','G',(.045 if p in caps else .024)*9.81,p)
def windrows(g,wi):return [{'xy':p,'n':n} for p,n in zip(g['windStationOrder'],g['windAtActualStations'][wi])]
def vrange(r):return [(virtual(tuple(q['xy'])),tuple(q['xy']),q['n']) for q in r]
inf={}
for label,r in rings.items():
    for k,rows in r['influence'].items():
        if k=='ringMass':
            for nm,p,t in vrange(rows):uput('steel wall-head ring','G',t,p)
        else:
            kind,pos=k.split(':');p=tuple(float(x) for x in pos.split(','));inf[kind,p]=vrange(rows)
for p,n in plane['braceG'].items():put('roof brace and fittings provision','G',n,p,inf['bracemass',p])
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
    addB(rows,-mag,mag)
assert math.isclose(orig['shifted roof excluding global braces','G'][0]+orig['roof brace and fittings provision','G'][0],w['globalOrigins']['G'],rel_tol=1e-8)
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
for p,(t,s0,h0) in shifts.items():
    assert s0 in loPads and all(abs(t[edge['walls'][edge['wallat'](t)][0]]-q['centre'])>=q['width']/2+125 for q in h['openings']['GROUND'] if q['wall']==edge['wallat'](t))
def splitStop(p):
    t,s0,_=shifts[p];coef=math.dist(p,s0)/math.dist(t,s0)
    assert all(abs(p[j]-coef*t[j]-(1-coef)*s0[j])<1e-8 for j in [0,1])
    return [(t,coef),(s0,1-coef)]
def groundFromPad(p):
    if p in shifted:
        hh=shifted[p];pp=xy(hh);return [(hh,1.,(p[0]-pp[0])/1000,(p[1]-pp[1])/1000)]
    name=edge['wallat'](p);ns=old['wallbase'](name,p);dst=routes(ns)
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
