"""Horizontal roof diaphragm: twelve reversible CHS diagonals, two real rings,
eight radial and four hip twin ties. Compare with a mechanism/open deck, not
an infinitely rigid cap. First-floor rigid-plane and fixed base are explicit
controls pending finite RC floor/site comparison. Units N, mm unless named.
"""
from pathlib import Path
import json,math,sys,runpy
from itertools import pairwise,product
D=Path(__file__).resolve().parent;H=json.loads((D.parents[1]/'had/studies/water-replan.json').read_text())['model']
w=json.loads((D/'current-house-welded-network.json').read_text());heel=json.loads((D/'current-house-welded-heel.json').read_text())
fac=runpy.run_path(str(D/'structural-linear.py'))['factor']
A,B,C,E=332.5,11667.5,3917.5,8082.5
def pt(face,normal,u):
    return [(u,normal),(12000-normal,u),(12000-u,12000-normal),(normal,12000-u)][face]
DIA=101.6;t=4;As=math.pi*(DIA**2-(DIA-2*t)**2)/4;Is=math.pi*(DIA**4-(DIA-2*t)**4)/64
Es=200000.;er=33000.;rho=78.5;cf=.25;draw=[]
# Brace axes end on the rings independently of projecting heel/rail width.
# Leave 420 at the hip side and 240 at an ordinary side. Real brace offset
# causes bending in finite wall-head members; do not treat it as a perfect
# common pin at the rafter or brace through the twin rails.
edges=[];rings=[];radials=[];braces=[];corners={};sides={}
for face in range(4):
    ou=[A,4700,7300,B];inn=[C,4700,7300,E]
    for k in range(3):
        if k==0: f,j=pt(face,A,ou[k]+420),pt(face,C,inn[k+1]-240)
        elif k==2:f,j=pt(face,A,ou[k+1]-420),pt(face,C,inn[k]+240)
        else:f,j=pt(face,A,ou[k+1]-240),pt(face,C,inn[k]+240)
        braces.append((f,j))
    for u,v in zip(ou,inn):
        ee=(pt(face,A,u),pt(face,C,v))
        if ee not in radials:radials.append(ee)
    for ring,ns in [('outer',A),('inner',C)]:
        lo,hi=(A,B) if ns==A else (C,E)
        # local face coordinate inverse
        candidates={x for e in braces+radials for x in e}
        cuts=sorted({lo,hi,*[u for p in candidates for u in [[p[0],p[1],12000-p[0],12000-p[1]][face]] if lo<=u<=hi and pt(face,ns,u)==p]})
        sides[face,ring]=cuts
        rings.extend((pt(face,ns,l),pt(face,ns,r)) for l,r in pairwise(cuts))
    corners[pt(face,A,A)]=face
# Last face can introduce a point on the start of the first face only at a
# common corner; all independent brace ends are strictly inside their face.
nodes=sorted({p for e in rings for p in e});ind={p:j for j,p in enumerate(nodes)}
assert len(radials)==12 and len(braces)==12 and all(p in ind for e in radials+braces for p in e)
nr=3*len(nodes);size=nr+3
def add(K,terms,coef):
    for i,f in terms:
        for j,g in terms:K[i][j]+=coef*f*g
def dof(p,axis):return 3*ind[p]+axis
def axterms(p,q):
    L=math.dist(p,q);dx=(q[0]-p[0])/L;dy=(q[1]-p[1])/L
    return [(dof(p,0),-dx),(dof(p,1),-dy),(dof(q,0),dx),(dof(q,1),dy)]
def wdof(p):
    return [[(nr,1),(nr+2,-(p[1]-6000)/6000)],[(nr+1,1),(nr+2,(p[0]-6000)/6000)],[(dof(p,0),1)],[(dof(p,1),1)]]
# Connected L with both plan moments including product inertia; span two
# force application levels on the same fixed-base cantilever. Compare roof
# tie/strut elevation separately from where it passes force into corner RC.
xl=[(0.,0.,1000.,140.),(0.,140.,140.,1000.)]
area=sum((b-a)*(d-c) for a,c,b,d in xl);cc=sum((b-a)*(d-c)*(a+b)/2 for a,c,b,d in xl)/area
I=sum((d-c)*(b-a)**3/12+(d-c)*(b-a)*((a+b)/2-cc)**2 for a,c,b,d in xl)
Ixy=sum((d-c)*(b-a)*((a+b)/2-cc)*((c+d)/2-cc) for a,c,b,d in xl)
base=-180.;ff=3370.;rr=6600.;peak=heel['height']['ridge']
z=[ff-base,rr-base]
flex=[[min(x,y)**2*(3*max(x,y)-min(x,y))/6 for y in z] for x in z]
det=flex[0][0]*flex[1][1]-flex[0][1]**2
inv=[[flex[1][1]/det,-flex[0][1]/det],[-flex[0][1]/det,flex[0][0]/det]]
def build(active=True):
    K=[[0.]*size for _ in range(size)];props={}
    for kind,ls,a in [('ring',rings,w['sections']['collector']['A']),('radial',radials,w['sections']['tie']['A']),('brace',braces,As)]:
        if kind=='brace' and not active:continue
        for p,q in ls:
            L=math.dist(p,q);n=axterms(p,q);add(K,n,Es*a/L);props[kind,p,q]=(n,Es*a/L)
            if kind!='ring':continue
            # Euler beam bending about vertical axis (real manufactured ring);
            # transverse unit line perpendicular to p-q.
            dx=(q[0]-p[0])/L;dy=(q[1]-p[1])/L
            a0=[(dof(p,0),-dy),(dof(p,1),dx)];a2=[(dof(q,0),-dy),(dof(q,1),dx)]
            ts=[a0,[(dof(p,2),1)],a2,[(dof(q,2),1)]]
            kb=[[12,6*L,-12,6*L],[6*L,4*L**2,-6*L,2*L**2],[-12,-6*L,12,-6*L],[6*L,2*L**2,-6*L,4*L**2]]
            coef=Es*w['sections']['collector']['Iminor']/L**3
            for m,ii in enumerate(ts):
                for n,jj in enumerate(ts):
                    for i,fx in ii:
                        for j,fy in jj:K[i][j]+=coef*kb[m][n]*fx*fy
    springs={}
    for p in corners:
        sg=(1 if p[0]==A else -1)*(1 if p[1]==A else -1)
        props2=[[I,Ixy*sg],[Ixy*sg,I]]
        k=[[inv[m//2][n//2]*cf*er*props2[m%2][n%2] for n in range(4)] for m in range(4)]
        ts=wdof(p);springs[p]=(k,ts)
        for m,ii in enumerate(ts):
            for n,jj in enumerate(ts):
                for i,fx in ii:
                    for j,fy in jj:K[i][j]+=k[m][n]*fx*fy
    return fac(K),props,springs
def times(terms,u):return sum(f*u[i] for i,f in terms)
def state(active,inside):
    sol,pp,spr=build(active);cases=[]
    # Quadrature integrated face width incl actual 200mm overhang. Outer
    # face loading, not only symmetric full-coverage wind. Split half/whole
    # rectangles and both orthogonal directions; joint/foundation torsion
    # can change even for identical total force.
    for axbits in product(range(7),repeat=2):
        if axbits==(0,0):continue
        f=[0.]*size;V=[0.,0.];M=[0.,0.];Vroof=[0.,0.];Mroof=[0.,0.];tor=0
        for ax,ccase in enumerate(axbits):
            if not ccase:continue
            s=1 if ccase<4 else -1;mode=(ccase-1)%3
            face=(3 if s==1 else 1) if ax==0 else (0 if s==1 else 2)
            cut=sides[face,'outer'];low=-200 if mode!=2 else 6000;high=12200 if mode!=1 else 6000
            # Linear source/influence integrated exactly after splitting at nodes.
            zcuts=sorted({low,high,*[u for u in [*cut,*sides[face,"inner"],4250,7750] if low<u<high]})
            for l,r in pairwise(zcuts):
                u=(l+r)/2;ii=next((i for i in range(len(cut)-1) if u<=cut[i+1]),len(cut)-2)
                a,b=cut[ii:ii+2];v=(u-a)/(b-a);dl=(r-l)/1000
                # 2.25 kPa. Foundation gets the bottom half of lower walls;
                # roof overturning above its ring plane additionally travels
                # as a real vertical couple, NOT a fictitious rigid-tip M.
                P1=s*2.25*dl*(rr-base)/2
                P2=s*2.25*dl*((rr-ff)/2+(peak-rr))
                Mr=s*2.25*dl*((peak-rr)/1000)**2/2
                for t,u0 in [(1-v,a),(v,b)]:
                    p=pt(face,A,u0)
                    for j,c in wdof(p)[ax]:f[j]+=t*P1*c
                    if not inside or not 4250<u<7750:f[dof(p,ax)]+=t*P2
                    tor+=(p[0]-6000 if ax==1 else 6000-p[1])*t*(P1+P2)
                if inside and 4250<u<7750:
                    inner=sides[face,'inner'];j=next(j for j in range(len(inner)-1) if u<=inner[j+1]);cc,dd=inner[j:j+2];ri=(u-cc)/(dd-cc)
                    for t,n in [(1-ri,cc),(ri,dd)]:f[dof(pt(face,C,n),ax)]+=t*P2
                V[ax]+=P1+P2;Vroof[ax]+=P2;M[ax]+=P1*(ff-base)+P2*(rr-base);Mroof[ax]+=Mr
        u=sol(f);forces={k:times(t,u)*co/1000 for k,(t,co) in pp.items()}
        rec=[0.,0.];tactual=0;corner={};moment=[0.,0.]
        for p,(k,ts) in spr.items():
            ds=[times(t,u) for t in ts]
            ys=[sum(r*v for r,v in zip(row,ds)) for row in k];corner[p]=ys
            for j in range(2):rec[j]+=ys[j]+ys[j+2];moment[j]+=ys[j]*(ff-base)+ys[j+2]*(rr-base)
            tactual+=(ys[1]+ys[3])*(p[0]-6000)-(ys[0]+ys[2])*(p[1]-6000)
        assert max(abs(a-b) for a,b in zip(V,rec))<.02 and max(abs(a-b) for a,b in zip(moment,M))<100 and abs(tor-tactual)<100
        cases.append((axbits,u,forces,corner,Mroof))
    return cases
actual=state(True,False)+state(True,True);control=state(False,False)+state(False,True)
def extrema(cases,kind):
    fam=[(v,c,k) for c,u,fs,cs,m in cases for k,v in fs.items() if k[0]==kind]
    return min(fam),max(fam)
# Move the historical 8.5 kN provision to the actual brace bodies/end
# locations. Tube mass is exact here; remainder is an enforceable total end
# gusset/connection allowance, not favourable minimum structural weight.
tubeG=sum(math.dist(p,q)*As*78.5/1e9 for p,q in braces);endG=(8.5-tubeG)/24
assert endG>0
braceG={}
for p,q in braces:
    for a in [p,q]:braceG[a]=braceG.get(a,0)+endG+math.dist(p,q)*As*78.5/1e9/2
def ringMoment(u,p,q):
    L=math.dist(p,q);dx=(q[0]-p[0])/L;dy=(q[1]-p[1])/L
    v1=-dy*u[dof(p,0)]+dx*u[dof(p,1)];v2=-dy*u[dof(q,0)]+dx*u[dof(q,1)]
    t1=u[dof(p,2)];t2=u[dof(q,2)];EI=Es*w['sections']['collector']['Iminor']
    # Section moment at both ends in the same physical diagram sign.
    return [EI/L*(6*(v1-v2)/L+4*t1+2*t2)/1e6,-EI/L*(6*(v1-v2)/L+2*t1+4*t2)/1e6]
def caseLoads(case):
    axbits,u,fs,cs,Mr=case;v={};g={}
    # Elevation couples transmitted into the wall-head ring (below the tie
    # and brace plane). Vertical deflection positive down; slopeX times M_y,
    # slopeY times -M_x, hence +e*F_x and +e*F_y as generalised x/y couples.
    for (kind,p,q),N in fs.items():
        if kind=='ring':continue
        e=(6785-6600)/1000 if kind=='brace' else (6770-6600)/1000
        for a,b in [(p,q),(q,p)]:
            dx,dy=[(y-x)/math.dist(a,b) for x,y in zip(a,b)]
            z=g.setdefault(a,[0.,0.]);z[0]+=e*N*dx;z[1]+=e*N*dy
    # Above-ring overturning distributed as a vertical force couple between
    # OUTER opposite cornerties (equilibrium control). Actual sloped roof force
    # route to those particular nodes requires a separate vertical-plane join.
    for p in corners:
        v[p]=sum(Mr[i]*(1 if p[i]==B else -1)/(2*(B-A)/1000) for i in range(2))
    return v,g
if __name__=='__main__':
    for kind in ['brace','ring','radial']:print(kind,extrema(actual,kind))
    for ls in [actual,control]:print('max roof defl anywhere',max(math.hypot(u[dof(p,0)],u[dof(p,1)]) for c,u,fs,cs,m in ls for p in nodes),'corner V',max(abs(P)/1000 for c,u,fs,cs,m in ls for rr in cs.values() for P in rr))
    print('brace qty',sum(math.dist(p,q) for p,q in braces)/1000,'m; tube mass',(sum(math.dist(p,q) for p,q in braces)/1000)*As/1e6*7850,'kg')
