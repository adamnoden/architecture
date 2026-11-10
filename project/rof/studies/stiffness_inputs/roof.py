"""Compare two flat roof controls with the current three-dimensional frame.
The pitched frame uses the actual ridge purlin, a single-sided 200 mm saddle,
finite primary bending/torsion, two collectors and the perforated floor.
Twelve additional horizontal CHS are a comparator, not the chosen load path.
Fixed pier bases remain a site-dependent assumption. Units N and mm.
"""
from pathlib import Path
import json,math,sys,runpy
from itertools import pairwise,product
D=Path(__file__).resolve().parents[3]/'str/studies';SUPPORT_N_PER_MM=globals().get('supportSpringNPerMM',40000.);H=json.loads((D.parents[1]/'had/studies/water-replan.json').read_text())['model']
w=json.loads((D/'current-house-welded-network.json').read_text());heel=json.loads((D/'current-house-welded-heel.json').read_text())
fac=runpy.run_path(str(D/'structural-linear.py'))['factor']
membrane=runpy.run_path(str(D/'current-house-membrane.py'))
A,B,C,E=332.5,11667.5,3917.5,8082.5
# Optional selected sections leave the archived comparison unchanged.
collectorSections=globals().get('collectorSections',{})
def collectorSection(a,b):
    inner=all(C<=point[0]<=E and C<=point[1]<=E for point in (a,b))
    return collectorSections.get('court' if inner else 'outer',w['sections']['collector'])
def pt(face,normal,u):
    return [(u,normal),(12000-normal,u),(12000-u,12000-normal),(normal,12000-u)][face]
DIA=101.6;t=4;As=math.pi*(DIA**2-(DIA-2*t)**2)/4;Is=math.pi*(DIA**4-(DIA-2*t)**4)/64
Es=200000.;er=33000.;cf=.25
# Brace axes end on the rings independently of projecting heel/rail width.
# Leave 420 at the hip side and 240 at an ordinary side. Real brace offset
# causes bending in finite wall-head members; do not treat it as a perfect
# common pin at the rafter or brace through the twin rails.
rings=[];radials=[];braces=[];corners={};sides={}
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
        extra=([4700,7300] if face in (0,2) else [3800,6000,8200]) if ns==A else ([12000-5925] if face==2 else [6000])
        cuts=sorted({lo,hi,*extra,*[u for p in candidates for u in [[p[0],p[1],12000-p[0],12000-p[1]][face]] if lo<=u<=hi and pt(face,ns,u)==p]})
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
def wdof(p,high=False):
    if high:return [[(spaceSize-8+i,v) for i,v in enumerate(membrane['reduced'](p,j))] for j in [0,1]]+[[(dof(p,0),1)],[(dof(p,1),1)]]
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
crowns={tuple((a+b)/2 for a,b in zip(p,q)):(p,q) for p,q in radials}
highNodes=sorted(crowns);zheel=6860;zhigh=zheel+(C-A)/2*math.tan(math.radians(25))
highD=lambda p,j:size+4*highNodes.index(p)+j
vDO=lambda p,j:size+4*len(crowns)+3*ind[p]+j
ridgePairs=[(pt(face,(A+C)/2,l),pt(face,(A+C)/2,r)) for face in range(4) for l,r in pairwise([(A+C)/2,4700,7300,12000-(A+C)/2])]
phiD=lambda p,q,ei:size+4*len(crowns)+3*len(nodes)+2*ridgePairs.index((p,q))+ei
rRot=lambda q,j:size+4*len(crowns)+3*len(nodes)+2*len(ridgePairs)+3*highNodes.index(q)+j
spaceSize=size+4*len(crowns)+3*len(nodes)+2*len(ridgePairs)+3*len(crowns)+8
seatZ=200.;outerTerms={}
def scalar(axis,dirs):
    return [(i,k*v) for k,terms in zip(axis,dirs) for i,v in terms if k*v]
def insert(K,terms,mat):
    for m,rr in enumerate(terms):
        for n,ss in enumerate(terms):
            for i,v in rr:
                for j,f in ss:K[i][j]+=v*mat[m][n]*f
def nonAxial(p,q):
    # Outer half is the physical ridge-seat receiver. Its flexural/torsional
    # element can transmit eccentric moment; the opposing half remains a
    # pin-ended axial strut and is NEVER locked by this saddle.
    dz=zhigh-zheel;L=math.sqrt(math.dist(p,q)**2+dz**2);hh=math.dist(p,q)
    h=[(q[j]-p[j])/hh for j in range(2)];X=[h[0]*hh/L,h[1]*hh/L,dz/L]
    Y=[-h[1],h[0],0];Z=[-h[0]*dz/L,-h[1]*dz/L,hh/L]
    o=zheel-6600
    bp=[[(dof(p,0),1),(vDO(p,1),o)],[(dof(p,1),1),(vDO(p,2),o)],[(vDO(p,0),-1)]]
    rp=[[(vDO(p,2),-1)],[(vDO(p,1),1)],[(dof(p,2),1)]]
    bq=[[(highD(q,0),1),(rRot(q,1),-seatZ)],[(highD(q,1),1),(rRot(q,0),seatZ)],[(highD(q,2),1)]]
    rq=[[(rRot(q,i),1)] for i in range(3)]
    sec=w['sections']['primary'];A,H,t=sec['B'],sec['H'],sec['t']
    tor=4*((A-t)*(H-t))**2/(2*(A-t+H-t)/t)
    k=77000*tor/L;z1=[scalar(X,rp),scalar(X,rq)];terms=[('torsion',z1,[[k,-k],[-k,k]])]
    m=[[12,6*L,-12,6*L],[6*L,4*L**2,-6*L,2*L**2],[-12,-6*L,12,-6*L],[6*L,2*L**2,-6*L,4*L**2]]
    for tag,vv,rr,ii in [('weak',Y,Z,sec['Iminor']),('strong',Z,[-v for v in Y],sec['I'])]:
        z0=[scalar(vv,bp),scalar(rr,rp),scalar(vv,bq),scalar(rr,rq)]
        terms.append((tag,z0,[[z*Es*ii/L**3 for z in row] for row in m]))
    return terms
def localForces(u,terms):
    for name,rr,mat in terms:
        uu=[sum(u[i]*f for i,f in r) for r in rr]
        vals=[sum(z*vv for z,vv in zip(row,uu)) for row in mat]
        yield name,rr,vals
# Two 100x8 mm working flange/side strips separated by 72 mm. Each side
# develops through 140 mm stock, two 12 mm cantilevers of 100x16, and a
# conservative 14 mm nominal shear path through joined 2x100x7 throats.
sideCompliance=140/(Es*800)+2*12**3/(3*Es*(100*16**3/12))+14/(77000*1400)
jointSpring=72**2/(2*sideCompliance)*.65 # N mm/rad, 35% reserve
assert jointSpring>1e9
upperSupports=set()
for face in range(4):
    for ns,stations in [(A,([4700,7300] if face in (0,2) else [3800,6000,8200])),(C,([12000-5925] if face==2 else [6000]))]:
        for u in [ns,*stations,12000-ns]:upperSupports.add(pt(face,ns,u))
assert len(upperSupports)==22
def build(active=True,high=False,springsAt=None,ringPlanEI=1.,ridgeStiff=1.):
    tally=spaceSize if high else size
    K=[[0.]*tally for _ in range(tally)];props={}
    if high:
        # Old three rigid-body coordinates unused in this independent space
        # solve. Retain unit diagonals solely to avoid empty matrix rows.
        for j in range(3):K[nr+j][nr+j]=1
        for j in range(8):
            for k in range(8):K[spaceSize-8+j][spaceSize-8+k]+=membrane['Ke'][j][k]
    for kind,ls,a in [('ring',rings,w['sections']['collector']['A']),('radial',radials,w['sections']['tie']['A']),('brace',braces,As)]:
        if kind=='brace' and not active:continue
        for p,q in ls:
            L=math.dist(p,q);n=axterms(p,q)
            if high and kind=='radial':
                for j in range(2):
                    f=170*(q[j]-p[j])/L;n.extend([(vDO(p,1+j),-f),(vDO(q,1+j),f)])
            area=collectorSection(p,q)['A'] if kind=='ring' else a
            add(K,n,Es*area/L);props[kind,p,q]=(n,Es*area/L)
            if kind!='ring':continue
            # Euler beam bending about vertical axis (real manufactured ring);
            # transverse unit line perpendicular to p-q.
            dx=(q[0]-p[0])/L;dy=(q[1]-p[1])/L
            a0=[(dof(p,0),-dy),(dof(p,1),dx)];a2=[(dof(q,0),-dy),(dof(q,1),dx)]
            ts=[a0,[(dof(p,2),1)],a2,[(dof(q,2),1)]]
            kb=[[12,6*L,-12,6*L],[6*L,4*L**2,-6*L,2*L**2],[-12,-6*L,12,-6*L],[6*L,2*L**2,-6*L,4*L**2]]
            coef=Es*collectorSection(p,q)['Iminor']/L**3*ringPlanEI
            for m,ii in enumerate(ts):
                for n,jj in enumerate(ts):
                    for i,fx in ii:
                        for j,fy in jj:K[i][j]+=coef*kb[m][n]*fx*fy
    if high:
        # Flexible vertical grillage on exactly the same twenty-two stations
        # as the separate final ring analysis. 40 kN/mm support is on the
        # scale of one S355 M24 shaft 3.23 m long, not infinite vertical fixity.
        for p in upperSupports:K[vDO(p,0)][vDO(p,0)]+=(springsAt or {}).get(p,SUPPORT_N_PER_MM)
        for p,q in rings:
            box=collectorSection(p,q);b0,h0,tw=box['B'],box['H'],box['t']
            tors=4*((b0-tw)*(h0-tw))**2/(2*(b0-tw+h0-tw)/tw)
            ax=0 if p[1]==q[1] else 1;sg=1 if q[ax]>p[ax] else -1;L=math.dist(p,q)
            tv=[(vDO(p,0),1),(vDO(p,1+ax),sg),(vDO(q,0),1),(vDO(q,1+ax),sg)]
            mat=[[12,6*L,-12,6*L],[6*L,4*L**2,-6*L,2*L**2],[-12,-6*L,12,-6*L],[6*L,2*L**2,-6*L,4*L**2]]
            for m,(i,cf1) in enumerate(tv):
                for n,(j,cf2) in enumerate(tv):K[i][j]+=cf1*cf2*mat[m][n]*Es*box['I']/L**3
            add(K,[(vDO(p,2-ax),-1),(vDO(q,2-ax),1)],77000*tors/L)
        # Two primary legs meet at the intentional ridge pin. Ridge purlin
        # transmits planar shear as a finite, continuous rectangular frame;
        # no plate diaphragm or moment fixity at the rafter crown is credited.
        for peakXY,(a,b) in crowns.items():
            for p in [a,b]:
                dist=math.sqrt(math.dist(p,peakXY)**2+(zhigh-zheel)**2);cx,cy=[(z1-z0)/dist for z0,z1 in zip(p,peakXY)];cz=(zhigh-zheel)/dist
                terms=[(dof(p,0),-cx),(dof(p,1),-cy),(highD(peakXY,0),cx),(highD(peakXY,1),cy),(highD(peakXY,2),cz)]
                terms.extend([(rRot(peakXY,1),-seatZ*cx),(rRot(peakXY,0),seatZ*cy)])
                terms.extend([(vDO(p,0),cz),(vDO(p,1),-(zheel-rr)*cx),(vDO(p,2),-(zheel-rr)*cy)])
                co=Es*w['sections']['primary']['A']/dist;add(K,terms,co);props['leg',p,peakXY]=(terms,co)
                if p==a:
                    et=nonAxial(p,peakXY);outerTerms[p,peakXY]=et
                    for tag,r0,k0 in et:insert(K,r0,k0)
        sec=w['sections']['secondary'];cc=(A+C)/2
        for face in range(4):
            ls=[pt(face,cc,at) for at in [cc,4700,7300,12000-cc]]
            for p,q in pairwise(ls):
                L=math.dist(p,q);cx=(q[0]-p[0])/L;cy=(q[1]-p[1])/L
                terms=[(highD(p,0),-cx),(highD(p,1),-cy),(highD(q,0),cx),(highD(q,1),cy)]
                co=Es*sec['A']/L;add(K,terms,co);props['ridge',p,q]=(terms,co)
                td=[[(highD(p,0),-cy),(highD(p,1),cx)],[(phiD(p,q,0),1)],[(highD(q,0),-cy),(highD(q,1),cx)],[(phiD(p,q,1),1)]]
                for i,loc in enumerate([p,q]):
                    add(K,[(phiD(p,q,i),1),(highD(loc,3),-1)],jointSpring*ridgeStiff)
                mat=[[12,6*L,-12,6*L],[6*L,4*L**2,-6*L,2*L**2],[-12,-6*L,12,-6*L],[6*L,2*L**2,-6*L,4*L**2]]
                for ii,tt in enumerate(td):
                    for jj,vv in enumerate(td):
                        for k,kk in tt:
                            for l,ll in vv:K[k][l]+=Es*sec['Iminor']/L**3*mat[ii][jj]*kk*ll
    springs={}
    for p in corners:
        sg=(1 if p[0]==A else -1)*(1 if p[1]==A else -1)
        props2=[[I,Ixy*sg],[Ixy*sg,I]]
        k=[[inv[m//2][n//2]*cf*er*props2[m%2][n%2] for n in range(4)] for m in range(4)]
        ts=wdof(p,high);springs[p]=(k,ts)
        for m,ii in enumerate(ts):
            for n,jj in enumerate(ts):
                for i,fx in ii:
                    for j,fy in jj:K[i][j]+=k[m][n]*fx*fy
    return fac(K),props,springs
def times(terms,u):return sum(f*u[i] for i,f in terms)
floorLoadCases={}
def state(active,inside,roofspace=False,springsAt=None,ringPlanEI=1.,ridgeStiff=1.):
    sol,pp,spr=build(active,roofspace,springsAt,ringPlanEI,ridgeStiff);cases=[]
    # Quadrature integrated face width incl actual 200mm overhang. Outer
    # face loading, not only symmetric full-coverage wind. Split half/whole
    # rectangles and both orthogonal directions; joint/foundation torsion
    # can change even for identical total force.
    for axbits in product(range(7),repeat=2):
        if axbits==(0,0):continue
        appliedFloor={}
        f=[0.]*(spaceSize if roofspace else size);V=[0.,0.];M=[0.,0.];Vroof=[0.,0.];Mroof=[0.,0.];tor=0
        for ax,ccase in enumerate(axbits):
            if not ccase:continue
            s=1 if ccase<4 else -1;mode=(ccase-1)%3
            face=(3 if s==1 else 1) if ax==0 else (0 if s==1 else 2)
            cut=sides[face,'outer'];low=-200 if mode!=2 else 6000;high=12200 if mode!=1 else 6000
            # Linear source/influence integrated exactly after splitting at nodes.
            zcuts=sorted({low,high,*[u for u in [*cut,*sides[face,"inner"],4250,7750,(A+C)/2,12000-(A+C)/2] if low<u<high]})
            for l,r in pairwise(zcuts):
                u=(l+r)/2;ii=next((i for i in range(len(cut)-1) if u<=cut[i+1]),len(cut)-2)
                a,b=cut[ii:ii+2];v=(u-a)/(b-a);dl=(r-l)/1000
                # 2.25 kPa. Foundation gets the bottom half of lower walls;
                # roof overturning above its ring plane additionally travels
                # as a real vertical couple, NOT a fictitious rigid-tip M.
                P1=s*2.25*dl*(rr-base)/2
                P2=s*2.25*dl*((rr-ff)/2+(peak-rr))
                Mr=s*2.25*dl*((peak-rr)/1000)**2/2
                # Identical external resultant and first moments. Put an
                # upper horizontal force at the ACTUAL crown and the balance
                # of the projected band at the ring. Integrating linear
                # purlin influences, including signed outer tails, preserves
                # yaw as well as overturning (no invented opposite supports).
                Pupper=Mr*1e6/(zhigh+seatZ-rr) if roofspace else 0.
                if roofspace:
                    cc=(A+C)/2;cs0=[cc,4700,7300,12000-cc]
                    idx=0 if u<=cs0[0] else next((j for j in range(3) if u<=cs0[j+1]),2);ll,hh=cs0[idx:idx+2];frac=(u-ll)/(hh-ll)
                    for at,t in [(ll,1-frac),(hh,frac)]:f[highD(pt(face,cc,at),ax)]+=Pupper*t
                for t,u0 in [(1-v,a),(v,b)]:
                    p=pt(face,A,u0)
                    for j,c in wdof(p,roofspace)[ax]:f[j]+=t*P1*c
                    appliedFloor[p,ax]=appliedFloor.get((p,ax),0)+t*P1
                    if not inside or not 4250<u<7750:f[dof(p,ax)]+=t*(P2-Pupper)
                    tor+=(p[0]-6000 if ax==1 else 6000-p[1])*t*(P1+P2)
                if inside and 4250<u<7750:
                    inner=sides[face,'inner'];j=next(j for j in range(len(inner)-1) if u<=inner[j+1]);cc,dd=inner[j:j+2];ri=(u-cc)/(dd-cc)
                    for t,n in [(1-ri,cc),(ri,dd)]:f[dof(pt(face,C,n),ax)]+=t*(P2-Pupper)
                V[ax]+=P1+P2;Vroof[ax]+=P2;M[ax]+=P1*(ff-base)+P2*(rr-base);Mroof[ax]+=Mr
        u=sol(f);forces={k:times(t,u)*co/1000 for k,(t,co) in pp.items()}
        rec=[0.,0.];tactual=0;corner={};moment=[0.,0.]
        for p,(k,ts) in spr.items():
            ds=[times(t,u) for t in ts]
            ys=[sum(r*v for r,v in zip(row,ds)) for row in k];corner[p]=ys
            for j in range(2):rec[j]+=ys[j]+ys[j+2];moment[j]+=ys[j]*(ff-base)+ys[j+2]*(rr-base)
            tactual+=(ys[1]+ys[3])*(p[0]-6000)-(ys[0]+ys[2])*(p[1]-6000)
        assert max(abs(a-b) for a,b in zip(V,rec))<.02 and max(abs(a-b) for a,b in zip(moment,M))<100 and abs(tor-tactual)<100
        if roofspace:floorLoadCases[id(u)]=appliedFloor
        cases.append((axbits,u,forces,corner,Mroof))
    return cases
actual=state(True,False)+state(True,True);control=state(False,False)+state(False,True);space=state(False,False,True)+state(False,True,True)
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
    t1=u[dof(p,2)];t2=u[dof(q,2)];EI=Es*collectorSection(p,q)['Iminor']
    # Section moment at both ends in the same physical diagram sign.
    return [EI/L*(6*(v1-v2)/L+4*t1+2*t2)/1e6,-EI/L*(6*(v1-v2)/L+2*t1+4*t2)/1e6]
def caseLoads(case):
    axbits,u,fs,cs,Mr=case;v={};g={}
    # Elevation couples transmitted into the wall-head ring (below the tie
    # and brace plane). Vertical deflection positive down; slopeX times M_y,
    # slopeY times -M_x, hence +e*F_x and +e*F_y as generalised x/y couples.
    for (kind,p,q),N in fs.items():
        if kind in ['ring','ridge']:continue
        if kind=='leg':
            L=math.sqrt(math.dist(p,q)**2+(zhigh-zheel)**2);nz=(zhigh-zheel)/L
            v[p]=v.get(p,0)-N*nz;z=g.setdefault(p,[0.,0.])
            for j in range(2):z[j]+=N*(q[j]-p[j])/L*(zheel-rr)/1000
            # Add the actual outer rafter's weak-/strong-axis moments, shear
            # and torque at the receiving heel. These internal actions were
            # absent in the earlier local-only saddle price.
            for tag,terms,vals in localForces(u,outerTerms.get((p,q),[])):
                for rr0,vv in zip(terms,vals):
                    for k,cf in rr0:
                        if k==vDO(p,0):v[p]-=cf*vv/1000
                        if k==vDO(p,1):z[0]-=cf*vv/1e6
                        if k==vDO(p,2):z[1]-=cf*vv/1e6
            continue
        e=(6785-6600)/1000 if kind=='brace' else (6770-6600)/1000
        for a,b in [(p,q),(q,p)]:
            dx,dy=[(y-x)/math.dist(a,b) for x,y in zip(a,b)]
            z=g.setdefault(a,[0.,0.]);z[0]+=e*N*dx;z[1]+=e*N*dy
    # Above-ring overturning distributed as a vertical force couple between
    # OUTER opposite cornerties (equilibrium control). Actual sloped roof force
    # route to those particular nodes requires a separate vertical-plane join.
    if not any(k[0]=='leg' for k in fs):
      for p in corners:
        v[p]=sum(Mr[i]*(1 if p[i]==B else -1)/(2*(B-A)/1000) for i in range(2))
    # Units: positive-down first moments in x/y; balanced force from
    # the primary legs and the finite 260 mm heel-to-ring transfer eccentricity.
    for j in range(2):
        chk=sum(n*p[j]/1000 for p,n in v.items())+sum(z[j] for z in g.values())
        assert abs(chk-Mr[j])<.0001,(chk,Mr[j])
    return v,g
if __name__=='__main__':
    for kind in ['brace','ring','radial']:print(kind,extrema(actual,kind))
    for ls in [actual,control]:print('max roof defl anywhere',max(math.hypot(u[dof(p,0)],u[dof(p,1)]) for c,u,fs,cs,m in ls for p in nodes),'corner V',max(abs(P)/1000 for c,u,fs,cs,m in ls for rr in cs.values() for P in rr))
    print('brace qty',sum(math.dist(p,q) for p,q in braces)/1000,'m; tube mass',(sum(math.dist(p,q) for p,q in braces)/1000)*As/1e6*7850,'kg')
