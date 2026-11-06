"""Condense the actual perforated first-floor plate to its four L supports.
Constant-strain triangles, compatible elastic membrane. No roof deck bracing,
solid ideal square or shear carried by window frames. Units N, mm.
"""
from pathlib import Path
import math,json,runpy
from itertools import pairwise
D=Path(__file__).resolve().parent;H=json.loads((D.parents[1]/'had/studies/water-replan.json').read_text())['model']
A,B=332.5,11667.5;corner=sorted([(A,A),(A,B),(B,A),(B,B)])
holes=[[r[0],r[1],r[0]+r[2],r[1]+r[3]] for r in [H['court'],H['stair'],H['void']]]+[[1812.5,9252.5,2212.5,9652.5]]
# Ignore the 15 mm tongue at the stair edge as a field. The underlying
# actual 140 mm perimeter beam is present. Its 70 mm plan half inside the
# facade axis remains, with its additional independent weak-axis stiffness.
holes[1][0]=A+70
# 1200 MPa cracked membrane and independently bounded shear modulus.
# H12/150 each way each face gives nominal E_s*rho=1508 MPa; original
# H12/150 one-way RC200 member capacity alone does not promise this mesh.
C=[[1200/(1-.15**2),1200*.15/(1-.15**2),0],[1200*.15/(1-.15**2),1200/(1-.15**2),0],[0,0,440]]
def cuts(j):
    orig=sorted({A,B,A+70,B-70,A+930,B-930,3917.5,8082.5,*[r[k] for r in holes for k in [j,j+2]]});out=[]
    for a,b in pairwise(orig):
        n=math.ceil((b-a)/1400)
        out.extend(a+(b-a)*i/n for i in range(n))
    return out+[B]
xx,yy=cuts(0),cuts(1);ts=[];points=set()
for a,b in pairwise(xx):
 for c,d in pairwise(yy):
    if any(l<(a+b)/2<r and n<(c+d)/2<s for l,n,r,s in holes):continue
    for t in [[(a,c),(b,c),(b,d)],[(a,c),(b,d),(a,d)]]:ts.append(t);points.update(t)
points=sorted(points);ids={p:i for i,p in enumerate(points)};rotPoints=sorted({q for q in points for lo,hi in [(A,B),(3917.5,8082.5)] if lo<=min(q) and max(q)<=hi and (lo in q or hi in q)})
rot={q:2*len(points)+i for i,q in enumerate(rotPoints)};n=len(points)*2+len(rot)
K=[[0.]*n for _ in range(n)];els=[]
for t in ts:
    (a,b),(c,d),(e,f)=t;area=((c-a)*(f-b)-(e-a)*(d-b))/2;dm=[[0.]*6 for _ in range(3)]
    for i,(bx,by) in enumerate([(d-f,e-c),(f-b,a-e),(b-d,c-a)]):
        dm[0][2*i]=bx/(2*area);dm[1][2*i+1]=by/(2*area);dm[2][2*i]=by/(2*area);dm[2][2*i+1]=bx/(2*area)
    ii=[2*ids[p]+j for p in t for j in [0,1]];els.append((t,ii,dm,area))
    cd=[[sum(c*d[k] for c,d in zip(row,dm)) for k in range(6)] for row in C]
    for i,k in enumerate(ii):
        for j,l in enumerate(ii): K[k][l]+=200*area*sum(d0[i]*b0[j] for d0,b0 in zip(dm,cd))
# Eight additional continuous H12 at the neutral region of the *existing*
# floor edge carry in-plane chord action, independently of the reserved
# flexural faces. Keep the same central through-rod/gap lane. Do not count
# the entire 650/750 concrete beam as a fictitious uncracked steel chord.
chords=[];beams=[];chordA=8*math.pi*12**2/4
for lo,hi in [(A,B),(3917.5,8082.5)]:
 for datum in [lo,hi]:
  for ax in [0,1]:
    pp=sorted((q for q in points if q[1-ax]==datum and lo<=q[ax]<=hi),key=lambda q:q[ax])
    for p0,p1 in pairwise(pp):
        L=math.dist(p0,p1);dd=[2*ids[p0]+ax,2*ids[p1]+ax];k=200000*chordA/L
        for i,v in enumerate([1,-1]):
            for j,w in enumerate([1,-1]):K[dd[i]][dd[j]]+=v*w*k
        chords.append((p0,p1,dd,k))
        # Horizontal in-plane bending of the actual 140 wide upstand. The
        # former axial-only chord makes the 15 mm lip falsely act as an
        # independent diaphragm beam. Use cracked 25% of the real Iweak.
        h=750 if lo==A else 650;ei=.25*33000*h*140**3/12
        sg=1 if ax==0 else -1
        fd=[(2*ids[p0]+1-ax,sg),(rot[p0],1),(2*ids[p1]+1-ax,sg),(rot[p1],1)]
        mat=[[12,6*L,-12,6*L],[6*L,4*L**2,-6*L,2*L**2],[-12,-6*L,12,-6*L],[6*L,2*L**2,-6*L,4*L**2]]
        for i,(ki,ci) in enumerate(fd):
            for j,(kj,cj) in enumerate(fd):K[ki][kj]+=ei/L**3*mat[i][j]*ci*cj
        beams.append((p0,p1,L,ei,fd))
# The actual 1000x140 L pier intersects the slab along both legs. Tie the
# footprint nodes through a rigid local section with FREE yaw (no fictitious
# torsion fixity). Former one-point restraint produces a mesh singularity.
trans=[None]*n;patches={q:[] for q in corner};nn=12
for pp in points:
    owner=None
    for q in corner:
        dx,dy=[(v-k)*(1 if k==A else -1) for v,k in zip(pp,q)]
        if (0<=dx<=930 and 0<=dy<=70) or (0<=dy<=930 and 0<=dx<=70):owner=q;break
    if owner is not None:
        j=corner.index(owner);patches[owner].append(pp)
        trans[2*ids[pp]]=[(2*j,1),(8+j,-(pp[1]-owner[1])/1000)]
        trans[2*ids[pp]+1]=[(2*j+1,1),(8+j,(pp[0]-owner[0])/1000)]
    else:
        trans[2*ids[pp]]=[(nn,1)];trans[2*ids[pp]+1]=[(nn+1,1)];nn+=2
for q,i in rot.items():
    trans[i]=[(nn,1)];nn+=1
Kt=[[0.]*nn for _ in range(nn)]
for i,row in enumerate(K):
    for j,v in enumerate(row):
        if v:
            for k,cf in trans[i]:
                for l,cg in trans[j]:Kt[k][l]+=cf*cg*v
fixed=list(range(8));free=list(range(8,nn))
fac=runpy.run_path(str(D/'structural-linear.py'))['factor']
solve=fac([[Kt[i][j] for j in free] for i in free]);shapes=[];reducedShapes=[]
def expand(z):return [sum(z[k]*cf for k,cf in r) for r in trans]
for ii in fixed:
    z=[0.]*nn;z[ii]=1
    for j,v in zip(free,solve([-Kt[j][ii] for j in free])):z[j]=v
    reducedShapes.append(z);shapes.append(expand(z))
Ke=[[sum(Kt[i][j]*q[j] for j in range(nn)) for q in reducedShapes] for i in fixed]
assert max(abs(Ke[i][j]-Ke[j][i]) for i in range(8) for j in range(8))<.0001
def basis(p,j):
    # Floor-edge point loads distribute on actual two linear boundary nodes.
    if p in ids:return [(2*ids[p]+j,1)]
    ax=0 if p[1] in [A,B] else 1
    qt=sorted(q[ax] for q in points if q[1-ax]==p[1-ax])
    x,y=next((x,y) for x,y in pairwise(qt) if x<=p[ax]<=y);f=(p[ax]-x)/(y-x)
    q0=list(p);q1=list(p);q0[ax]=x;q1[ax]=y
    return [(2*ids[tuple(q0)]+j,1-f),(2*ids[tuple(q1)]+j,f)]
def reduced(p,j):return [sum(sh[k]*m for k,m in basis(p,j)) for sh in shapes]
def recover(ends,external):
    u=[sum(z*sh[k] for z,sh in zip(ends,shapes)) for k in range(n)]
    f=[0.]*n
    for (p,j),v in external.items():
        for k,m in basis(p,j):f[k]+=m*v
    ft=[0.]*nn
    for j,v in enumerate(f):
        for k,cf in trans[j]:ft[k]+=cf*v
    dz=[0.]*nn
    for k,x in zip(free,solve([ft[k] for k in free])):dz[k]=x
    u=[v+d for v,d in zip(u,expand(dz))]
    mx=[0.]*3;critical=[None]*3;highChord=max(abs(k*(u[dd[1]]-u[dd[0]]))/1000 for p0,p1,dd,k in chords)
    for t,ds,dm,area in els:
        strain=[sum(b*u[k] for b,k in zip(row,ds)) for row in dm]
        stress=[sum(k*v for k,v in zip(row,strain)) for row in C]
        nx,ny,txy=[v*.2*1000 for v in stress] # 200mm x 1000mm into kN/m
        for i,n0 in enumerate([nx+abs(txy),ny+abs(txy),abs(txy)]):
            if n0>mx[i]:mx[i]=n0;critical[i]=t
    weakM=0
    for p0,p1,L,ei,dd in beams:
        v0,t0,v1,t1=[u[k]*sg for k,sg in dd]
        weakM=max(weakM,*[abs(ei/L*(6*(v0-v1)/L+a*t0+b*t1)/1e6) for a,b in [(4,2),(2,4)]])
    return u,mx,critical,highChord,weakM
