"""Solve the eight proposed inner arch frames together with the pitched house.

The local section model covers in-plane bending and axial load. The result
keeps weak-axis loads, outer masonry, frame renewal and steel detailing open.
"""
import hashlib
import itertools
import json
import math
import runpy
import sys
from pathlib import Path
D = Path(__file__).resolve().parent
p = runpy.run_path(str(D / 'current-house-roof-bracing.py'))
m = p['membrane']
H = p['H']
fSel = next((x for x in H['openings']['FIRST'] if x['wall'] == 'outer-south' and x['centre'] == 1800))
w = fSel['width']
rise = fSel['head'] - fSel['spring']
ri = w * w / (8 * rise) + rise / 2
fi = math.asin(w / 2 / ri)
ro = ri + 215
r = (ri + ro) / 2
cz = 3450 + fSel['head'] - ri
base = 3170 + 750
ang0 = -fi
np = 18
arch = [(1800 + r * math.sin(t), cz + r * math.cos(t)) for t in [ang0 + 2 * fi * j / np for j in range(np + 1)]]
xL, xR = (arch[0][0], arch[-1][0])
zs = arch[0][1]
nseg = 5
left = [(xL, base + (zs - base) * j / nseg) for j in range(nseg + 1)]
jamb_width = 205
xJ = 2300 + jamb_width / 2
right = [(xJ,z) for z in sorted({base,zs,4000,4550,*range(4100,4550,100),4800,5200,5600})]
def jamb_normal_width(z):
    return 225-85*max(0,min(1,(z-4000)/550))
nodes = sorted(set(arch + right))
ind = {q: i for i, q in enumerate(nodes)}
n = len(nodes) * 3

# A curved planar Euler frame. Each of its six support coordinates has a matching
# reaction. The left spring coincides with the real L. Only the opposite jamb is added.
def solve_arch(crack, action, pressure, imposed, signed=False):
    K = [[0.0] * n for _ in range(n)]
    rhs = [0.0] * n
    terms = []

    def build(a, b, width, depth, kind):
        L = math.dist(a, b)
        cx = (b[0] - a[0]) / L
        sz = (b[1] - a[1]) / L
        x0 = 3 * ind[a]
        x1 = 3 * ind[b]
        ux = [(x0, -cx), (x0 + 1, -sz), (x1, cx), (x1 + 1, sz)]
        v = [[(x0, -sz), (x0 + 1, cx)], [(x0 + 2, 1)], [(x1, -sz), (x1 + 1, cx)], [(x1 + 2, 1)]]
        sec = width * depth
        EI = crack * 33000 * width * depth ** 3 / 12
        mat = [[12, 6 * L, -12, 6 * L], [6 * L, 4 * L ** 2, -6 * L, 2 * L ** 2], [-12, -6 * L, 12, -6 * L], [6 * L, 2 * L ** 2, -6 * L, 4 * L ** 2]]
        mat = [[t * EI / L ** 3 for t in row] for row in mat]
        p['insert'](K, v, mat)
        p['add'](K, ux, 33000 * sec / L)
        load = [0.0] * 4
        q = 0
        if kind == 'arch':
            mid = (a[0] + b[0]) / 2
            outer = cz + math.sqrt(ro * ro - (mid - 1800) ** 2)
            Garch = sec * 25 / 1000000.0
            Gsp = max(0, 6540 - outer) * width * 25 / 1000000.0
            pressurePart = pressure[int(mid >= 1800)]
            q = -(1.35 * (Garch + Gsp * cx) + ((action(mid) if callable(action) else action) + pressurePart) * cx)
        else:
            q = -1.35 * sec * 25 / 1000000.0
        load = [q * cx * L / 2, q * cx * L ** 2 / 12, q * cx * L / 2, -q * cx * L ** 2 / 12]
        for row, z in zip(v, load):
            for k, cf in row:
                rhs[k] += cf * z
        for ii in [x0, x1]:
            rhs[ii] += q * sz * cx * L / 2
            rhs[ii + 1] += q * sz * sz * L / 2
        terms.append((kind, a, b, L, ux, v, mat, 33000 * sec / L, load, q * sz * L / 2 / 1000))
    for a, b in zip(arch, arch[1:]):
        build(a, b, 140, 215, 'arch')
    for z in [right]:
        for a, b in zip(z, z[1:]):
            build(a, b, jamb_normal_width((a[1]+b[1])/2), jamb_width, 'jamb')
    build(arch[-1], right[-1], 140, 215, 'knee')
    fixed = {}
    for node, vals in [(left[-1], imposed[1]), (right[0], imposed[2])]:
        for i, v in enumerate(vals):
            fixed[3 * ind[node] + i] = v
    free = [j for j in range(n) if j not in fixed]
    rhsf = [rhs[i] - sum((K[i][j] * v for j, v in fixed.items())) for i in free]
    if crack not in factors:
        factors[crack] = p['fac']([[K[i][j] for j in free] for i in free])
    u = [0.0] * n
    for j, v in fixed.items():
        u[j] = v
    for j, v in zip(free, factors[crack](rhsf)):
        u[j] = v
    res = [sum((row[j] * u[j] for j in range(n))) - r0 for row, r0 in zip(K, rhs)]
    assert max((abs(res[i]) for i in free)) < 0.01
    out = []
    P = lambda row: sum((u[j] * v for j, v in row))
    magnitude = (lambda value: value) if signed else abs
    for kind, a, b, L, ux, v, mat, ea, load, axHalf in terms:
        N = ea * P(ux) / 1000
        ys = [sum((z * P(row) for z, row in zip(mr, v))) - f for mr, f in zip(mat, load)]
        for i in [0, 1]:
            out.append((kind, magnitude(ys[2 * i + 1] / 1000000.0), magnitude(ys[2 * i] / 1000), N + (1 - 2 * i) * axHalf))
    return (u, res, out)

# Integrate both components of the real L-pier curvature at the skewback.
# The off-diagonal inertia changes sign at mirrored corners.
factors = {}

# At each axial force balance concrete and the two actual layers of reinforcement
# before obtaining the bending resistance, including displaced concrete.
def capacity(dep, bar, across=2):
    A0 = math.pi * bar ** 2 / 4 * across
    clr = 35
    bars = [clr + 6 + bar / 2, dep - (clr + 6 + bar / 2)]
    if dep == jamb_width:
        # Both radial pairs turn down on 80 mm centre radii. Use the least
        # lever arm by mirroring the more deeply covered pair at both edges.
        margin = 53
        bars = [margin, dep-margin]

    def at(N):
        lo, hi = (0.1, 20000)

        def nm(x):
            z = min(dep, 0.8 * x)
            fc = 17
            force = 140 * z * fc
            M = force * (dep / 2 - z / 2)
            for k in bars:
                sig = max(-500 / 1.15, min(500 / 1.15, 0.0035 * (1 - k / x) * 200000))
                f = A0 * (sig - (fc if k < z else 0))
                force += f
                M += f * (dep / 2 - k)
            return (force / 1000, M / 1000000.0)
        for _ in range(27):
            x = (lo + hi) / 2
            if nm(x)[0] < N:
                lo = x
            else:
                hi = x
        return nm((lo + hi) / 2)[1]
    return at
A, B = (p['A'], p['B'])
levels = [p['ff'], p['rr']]
h0 = zs - p['base']
FZ = 3920
floorRadius = FZ - p['ff']
c0 = A - 70 + p['cc']
modes = []
corner_windows = []
nd = p['spaceSize']
old_solve, _, spring_data = p['build'](False, True)

# Cantilever Green function and its slope derivatives. A concentrated moment
# at a skewback is paired with rotation; forces at offset locations include bending.
def F(x, y, dx, dy):
    if dx and dy:
        return min(x, y)
    if dx:
        return F(y, x, 0, 1)
    if dy:
        return x * x / 2 if x <= y else x * y - y * y / 2
    return min(x, y) ** 2 * (3 * max(x, y) - min(x, y)) / 6
dot = lambda a, b: sum((x * y for x, y in zip(a, b)))
mul = lambda M, x: [dot(r, x) for r in M]
ym = [z - p['base'] for z in levels]
vf = p['inv']
gk = p['cf'] * p['er']
# The two 37.5 mm toe extensions occupy the actual window reveal at each L.
# Integrate the cantilever flexibility through its three material regions and
# replace the old four-node springs in the assembled roof/floor model.
from functools import lru_cache
from itertools import pairwise

wide_normal=float(globals().get('arch_normal_width',140))
assert wide_normal>=140
def section(leg, normal_width=140):
    outer=140-normal_width
    rectangles=[(outer,outer,leg,140.),(outer,140.,140.,leg)]
    area=sum((r-l)*(t-b) for l,b,r,t in rectangles)
    centroid=sum((r-l)*(t-b)*(l+r)/2 for l,b,r,t in rectangles)/area
    inertia=sum((t-b)*((r-l)**3/12+(r-l)*((l+r)/2-centroid)**2) for l,b,r,t in rectangles)
    product=sum((r-l)*(t-b)*((l+r)/2-centroid)*((b+t)/2-centroid) for l,b,r,t in rectangles)
    return area,centroid,inertia,product

narrow,wide=section(1000.),section(1037.5,wide_normal)
assert abs(narrow[2]-p['I'])<.01
# Round the cast-in extension outwards beyond the curved bars and their tails.
fill_bottom,fill_top=5000.,6200.
c0=A-70+wide[1]
@lru_cache(None)
def pier_compliance(P,x,y,di,dj,i,j):
    mir=(1 if P[0]==A else -1)*(1 if P[1]==A else -1)
    limit=min(x,y)
    divisions=sorted({0.,limit,*[z-p['base'] for z in [fill_bottom,fill_top] if 0<z-p['base']<limit]})
    value=0.
    for low,high in pairwise(divisions):
        middle=(low+high)/2
        _,_,ii,ij=wide if fill_bottom<middle+p['base']<fill_top else narrow
        component=(ii if i==j else -mir*ij)/((ii*ii-ij*ij)*gk)
        def term(t):
            return (1 if di else x-t)*(1 if dj else y-t)
        value+=component*(high-low)*(term(low)+4*term(middle)+term(high))/6
    return value

corner_keys=sorted(p['corners'])
unit4=[[float(i==j) for j in range(4)] for i in range(4)]
terminal=[]
new_stiffness={}
change={}
for corner_point in corner_keys:
    terms=p['wdof'](corner_point,True)
    for t in terms:
        vec=[0.]*nd
        for k,v in t:vec[k]+=v
        terminal.append(vec)
    flex=[[pier_compliance(corner_point,ym[i//2],ym[j//2],0,0,i%2,j%2) for j in range(4)] for i in range(4)]
    inv=p['fac'](flex)
    new_stiffness[corner_point]=[inv(row) for row in unit4]
    old=spring_data[corner_point][0]
    change[corner_point]=[[a-b for a,b in zip(r,s)] for r,s in zip(new_stiffness[corner_point],old)]
responses=[old_solve(v) for v in terminal]
end_flex=[[dot(test,v) for v in responses] for test in terminal]
compat=[[float(i==j)+sum(change[corner_keys[i//4]][i%4][k]*end_flex[4*(i//4)+k][j] for k in range(4)) for j in range(16)] for i in range(16)]
compat_solve=p['fac'](compat)

def updated_solution(old_solution):
    end_values=[dot(v,old_solution) for v in terminal]
    extra=compat_solve([sum(change[corner_keys[i//4]][i%4][k]*end_values[4*(i//4)+k] for k in range(4)) for i in range(16)])
    return [v-sum(r[j]*a for r,a in zip(responses,extra)) for j,v in enumerate(old_solution)]

def fullSolve(force):
    return updated_solution(old_solve(force))

updated_wind=[]
for case in p['space']:
    u=updated_solution(case[1]);ends=[dot(v,u) for v in terminal]
    reactions={q:mul(new_stiffness[q],ends[4*j:4*j+4]) for j,q in enumerate(corner_keys)}
    for axis in [0,1]:
        before=sum(f[axis]+f[axis+2] for f in case[3].values())
        after=sum(f[axis]+f[axis+2] for f in reactions.values())
        assert abs(before-after)<.01
    p['floorLoadCases'][id(u)]=p['floorLoadCases'][id(case[1])]
    updated_wind.append((case[0],u,case[2],reactions,case[4]))

def terminal_cross(P,h,der,axis):
    return [pier_compliance(P,z,h,0,der,j,axis) for z in ym for j in [0,1]]

def pierced(z,case,P):
    return [[dot(terminal_cross(P,z-p['base'],der,j),case[3][P]) for j in [0,1]] for der in [0,1]]

# Six work-conjugate coordinates at each window. Loads on the far jamb enter
# the finite floor membrane and edge beam. Unit rotations are in milliradians.
for ax, side, near in itertools.product([0, 1], repeat=3):
    sg = 1 - 2 * near
    nline = A if side == 0 else B

    def xy(x):
        y = x if near == 0 else 12000 - x
        return (y, nline) if ax == 0 else (nline, y)
    P = xy(A)
    J = xy(xJ)
    L0 = xy(xL)
    cent = [c0 if z == A else 12000 - c0 for z in P]
    offset = [l - c for l, c in zip(L0, cent)]
    corner_windows.append((P, J, L0, ax, sg))
    wr = p['wdof'](P, True)
    for dof in range(6):
        tt = [(ax, 0, sg)] if dof == 0 else [(k, 1, -offset[k]) for k in [0, 1]] if dof == 1 else [(ax, 1, -1000 * sg)] if dof == 2 else []
        floorF = {} if dof != 3 else {(J, ax): sg}
        v = [0.0] * nd
        for k, der, cf in tt:
            weights=mul(new_stiffness[P],terminal_cross(P,h0,der,k))
            for t,weight in zip(wr,weights):
                for di,coef in t:v[di]+=cf*coef*weight
        for (loc, k), amp in floorF.items():
            for i, cf in enumerate(m['reduced'](loc, k)):
                v[-8 + i] += amp * cf
        fb = [(1, -sg * floorRadius)] if dof == 3 else [(0, 1)] if dof == 4 else [(1, 1000 * sg)] if dof == 5 else []
        modes.append((P, J, ax, dof, tt, floorF, v, fb))
N = len(modes)
full = [fullSolve(q[6]) for q in modes]
zeros = [0] * 8
localF = [m['recover'](zeros, q[5])[0] if q[5] else [] for q in modes]
C = [[0.0] * N for _ in modes]
ident = [[int(i == j) for j in range(N)] for i in range(N)]
for i, (P, J, ax, di, tt, floorF, v, fb) in enumerate(modes):
    for j, (Q, Qj, bx, dj, uu, floorG, y, g2) in enumerate(modes):
        value = dot(v, full[j])
        if P == Q:
            for k, di0, cf in tt:
                for l, dj0, cg in uu:
                    plus=terminal_cross(P,h0,di0,k)
                    minus=terminal_cross(P,h0,dj0,l)
                    value+=cf*cg*(pier_compliance(P,h0,h0,di0,dj0,k,l)-dot(plus,mul(new_stiffness[P],minus)))
            if di == dj == 1:
                extra=h0-(fill_bottom-p['base'])
                value+=((h0-extra)/narrow[0]+extra/wide[0])/33000
        if floorF and floorG:
            value += sum((a * sum((localF[j][k] * t for k, t in m['basis'](loc, z))) for (loc, z), a in floorF.items()))
        C[i][j] = value
assert max((abs(C[i][j] - C[j][i]) for i in range(N) for j in range(N))) < 1e-09
wallmodel = runpy.run_path(str(D / 'current-house-floor-closure.py'))
wall = wallmodel['walls']
fac = p['fac']
# Compare the mapped positive lower bearings and a stripped two-end span.
# Both are research bounds on the floor edge, with interior rotation free.
floor_cases = []
floor_unit_reactions = {}
for endsOnly in [False, True]:
    V = [[0.0] * N for i in range(N)]
    mxspan = {}
    for face, (k, line, lo, hi, sups) in wall.items():
        if not face.startswith('outer-'):
            continue
        js = [j for j, (_, J, ax, dof, *_) in enumerate(modes) if ax == k and J[1 - k] == line and (dof >= 3)]
        fixs = [lo, hi] if endsOnly else sups
        coords = sorted(set(fixs + [modes[j][1][k] for j in js]))
        nv = 2 * len(coords)
        K = [[0.0] * nv for _ in range(nv)]
        EIs = 0.25 * 33000 * 140 * 750 ** 3 / 12
        for ia, (l, r) in enumerate(zip(coords, coords[1:])):
            L = r - l
            kk = [[12, 6 * L, -12, 6 * L], [6 * L, 4 * L * L, -6 * L, 2 * L * L], [-12, -6 * L, 12, -6 * L], [6 * L, 2 * L * L, -6 * L, 4 * L * L]]
            for a in range(4):
                for b in range(4):
                    K[2 * ia + a][2 * ia + b] += kk[a][b] * EIs / L ** 3
        free = sorted(set(range(nv)) - {2 * coords.index(t) for t in fixs})
        SL = fac([[K[i][j] for j in free] for i in free])
        for j in js:
            vals = [0.0] * nv
            force = [0.0] * nv
            loc = coords.index(modes[j][1][k])
            for d, c in modes[j][7]:
                force[2 * loc + d] += c
            for l, x in zip(free, SL([force[i] for i in free])):
                vals[l] = x
            for node,station in enumerate(coords):
                if station in fixs:
                    point=(station,line) if k==0 else (line,station)
                    floor_unit_reactions[endsOnly,j,point]=dot(K[2*node],vals)-force[2*node]
            for i in js:
                V[i][j] = sum((c * vals[2 * coords.index(modes[i][1][k]) + d] for d, c in modes[i][7]))
        mxspan[face] = max((r - l for l, r in zip(fixs, fixs[1:])))
    floor_cases.append((V, mxspan))

def subframe(d, cr, al, pr, signed=False):
    v = d[:]
    v[2] /= 1000
    v[5] /= 1000
    u, r, sol = solve_arch(cr, al, pr, [[0, 0, 0], v[:3], v[3:]], signed=signed)
    order = [3 * ind[node] + k for node in [left[-1], right[0]] for k in range(3)]
    rr = [r[j] / (1000 if i % 3 == 2 else 1) for i, j in enumerate(order)]
    return (u, rr, sol)
arch_input = json.loads((D / 'current-house-arch-jambs.json').read_text())
ceiling_actions = {}
rows = []
for aidx, (P, J, L0, ax, sg) in enumerate(corner_windows):
    face = ('outer-south' if P[1] == A else 'outer-north') if ax == 0 else 'outer-west' if P[0] == A else 'outer-east'
    selected = next((q for q in arch_input['openings'] if q['wall'] == face and q['centre'] == (1800 if sg > 0 else 10200)))

    def load_at(x):
        t = x if sg > 0 else 12000 - x
        return next((q['ulsKNPerM'] for q in selected['ceilingBands'] if q['interval'][0] <= t <= q['interval'][1]))
    ceiling_actions[aidx] = {(a[0] + b[0]) / 2: load_at((a[0] + b[0]) / 2) for a, b in zip(arch, arch[1:])}
# Complete rigid window follows two sill bearings. Its single horizontal datum
# is midway up the near reveal. The two vertical movements rotate the frame.
# Distinguish movement of the raw RC intrados from movement of its centreline.
window_source=json.loads((D.parents[1]/'oas/studies/north-export-occurrence.json').read_text())['frame']
sill=3450+window_source['outsideZ'][0]
mid_datum=3450+sum(window_source['outsideZ'])/2
sill_left,sill_right=1375.,2225.
sill_span=sill_right-sill_left
@lru_cache(None)
def pier_probe(P,z,axis,derivative):
    h=z-p['base']
    cross=terminal_cross(P,h,derivative,axis)
    equivalent=mul(new_stiffness[P],cross)
    response=[]
    for j,(Q,_,_,_,tt,_,_,_) in enumerate(modes):
        t=p['wdof'](P,True)
        value=dot(equivalent,[sum(w*full[j][i] for i,w in row) for row in t])
        if Q==P:
            for b,dj,cf in tt:
                value+=cf*(pier_compliance(P,h,h0,derivative,dj,axis,b)-dot(equivalent,terminal_cross(P,h0,dj,b)))
        response.append(value)
    return cross,response

def window_fit(a,case,reactions,local):
    P,J,L0,ax,sg=corner_windows[a]
    face=('outer-south' if P[1]==A else 'outer-north') if ax==0 else ('outer-west' if P[0]==A else 'outer-east')
    opening=next(q for q in H['openings']['FIRST'] if q['wall']==face and q['centre']==(1800 if sg>0 else 10200))
    # Same trial OAS outside profile but each occurrence has its actual sill.
    sill=3450+opening['sill']+window_source['gap']
    def near(z,axis,der=0):
        cross,resp=pier_probe(P,z,axis,der)
        return dot(cross,case[3][P])-dot(resp,reactions)
    def right_state(z):
        low,high=next((left,right0) for left,right0 in pairwise(right) if left[1]<=z<=right0[1])
        span=high[1]-low[1];t=(z-low[1])/span
        a0,b0=3*ind[low],3*ind[high]
        # In a vertical member, positive in-plane rotation gives negative dx/dz.
        x=((1-3*t*t+2*t**3)*local[a0]-(t-2*t*t+t**3)*span*local[a0+2]
           +(3*t*t-2*t**3)*local[b0]-(t**3-t*t)*span*local[b0+2])
        rot=(-(6*t*t-6*t)*local[a0]/span+(1-4*t+3*t*t)*local[a0+2]
             -(6*t-6*t*t)*local[b0]/span+(3*t*t-2*t)*local[b0+2])
        return x,(1-t)*local[a0+1]+t*local[b0+1],rot
    centre_line=A-70+(wide[1] if fill_bottom<=sill<=fill_top else narrow[1]);across_cent=A-70+narrow[1]
    # Absolute sill displacement includes axial compression from both arches
    # sharing this L, plus rotation to the real bearing (y lies on core axis).
    force=-sum(reactions[i] for i,q in enumerate(modes) if q[0]==P and q[3]==1)
    axial=(sill-p['base'])*force/(33000*narrow[0])
    left_z=axial-sg*(sill_left-centre_line)*near(sill,ax,1)-(1 if P[1-ax]==A else -1)*(A-across_cent)*near(sill,1-ax,1)
    rx,rz,rotation=right_state(sill)
    right_z=rz+rotation*(sill_right-xJ)
    tilt=(right_z-left_z)/sill_span
    # A horizontal fix on either physical jamb, all in the near-L casting or
    # opposite RC pier. Report a common datum for every occurrence and state.
    base_mid=sg*near(mid_datum,ax)
    def frame(x,z):return base_mid-tilt*(z-mid_datum),left_z+tilt*(x-sill_left)
    hits=[]
    for i in range(33):
        z=sill+(3450+2550-sill)*i/32
        move=frame(1335,z)[0]
        hits.extend([(sg*near(z,ax)-move,-1,'near jamb'),(move-right_state(z)[0],1,'opposite jamb')])
    for j,q in enumerate(arch):
        theta=ang0+2*fi*j/np
        nx,nz=math.sin(theta),math.cos(theta)
        fx,fz=frame(1800+(ri-35)*nx,cz+(ri-35)*nz)
        ux,uz=local[3*ind[q]:3*ind[q]+2]
        hits.append(((fx-ux)*nx+(fz-uz)*nz,nx,'curved head'))
    result={}
    for jamb in ['near','opposite']:
        for z in [5000.,5150.,5300.,5450.,5600.,5750.]:
            fix=sg*near(z,ax) if jamb=='near' else right_state(z)[0]
            correction=fix+tilt*(z-mid_datum)-base_mid
            result[jamb,int(z)]=max((close+correction*n,name) for close,n,name in hits)
    return result,tilt


# The simultaneous solution is (I + C K) d = d_wind − C r_gravity.
# Every response must recover this identity at all 48 terminal coordinates.
if not globals().get('arch_model_only',False):
    for cr in [0.2, 0.35]:
        z6 = [0] * 6
        k0 = subframe(z6, cr, 0, [0, 0])[1]
        arch_stiffness = [[0.0] * 6 for _ in z6]
        for j in range(6):
            f = subframe([int(t == j) for t in range(6)], cr, 0, [0, 0])[1]
            for i in range(6):
                arch_stiffness[i][j] = f[i] - k0[i]
        assert max((abs(arch_stiffness[j][i] - arch_stiffness[i][j]) for i in range(6) for j in range(6))) < 0.001
        for vi, (V, spans) in enumerate(floor_cases):
            coupled_flexibility = [[x + y for x, y in zip(a, b)] for a, b in zip(C, V)]
            compatibility_matrix = [[int(i == j) + sum((coupled_flexibility[i][j // 6 * 6 + t] * arch_stiffness[t][j % 6] for t in range(6))) for j in range(N)] for i in range(N)]
            slv = fac(compatibility_matrix)
            mmax = [0] * 2
            hmax = 0
            rzmax = 0
            shmax = 0
            maxshift = 0
            maxvert = 0
            maxM = 0
            maxFdist = 0
            maxUtil = [0, 0]
            demands = [[], []]
            worst_window=[-1,None]
            max_tilt=0.
            data_options={}
            # Expose the signed forces at each end to the separately owned whole-
            # house calculation. The calm case removes arch self-weight from a
            # pure wind increment; it never enters the window service envelopes.
            if 'arch_observer' in globals():
                calm=([0,0],[0.]*nd,{},dict.fromkeys(corner_keys,[0.]*4),[0,0])
                for installed_ceiling in [False,True]:
                    actions=[(lambda x,ar=i:ceiling_actions[ar][x]) if installed_ceiling else 0 for i in range(8)]
                    fixed_load=sum((subframe(z6,cr,a,[0,0])[1] for a in actions),[])
                    disp=slv([-v for v in mul(coupled_flexibility,fixed_load)])
                    reactions=sum((subframe(disp[6*a:6*a+6],cr,actions[a],[0,0])[1] for a in range(8)),[])
                    arch_observer(globals(),calm,-1,reactions,cr,vi,installed_ceiling)
            for wi, case in enumerate(updated_wind):
                baseq = []
                field = m['recover'](case[1][-8:], p['floorLoadCases'][id(case[1])])[0]
                for P, J, ax, di, tt, floorF, v, fb in modes:
                    ux, der = pierced(zs, case, P)
                    u = sum((cf * [ux, der][typ][k] for k, typ, cf in tt)) + sum((g * sum((field[k] * e for k, e in m['basis'](loc, z))) for (loc, z), g in floorF.items()))
                    baseq.append(u)
                for al, pr in [(0, [0, 0]), (1, [0, 0])]:
                    acts = [(lambda x, ar=i: ceiling_actions[ar][x]) if al else 0 for i in range(8)]
                    f0 = sum((subframe(z6, cr, a, pr)[1] for a in acts), [])
                    d = slv([x - y for x, y in zip(baseq, mul(coupled_flexibility, f0))])
                    r = []
                    local_states=[]
                    for a in range(8):
                        dd = d[6 * a:6 * a + 6]
                        u, f, res = subframe(dd, cr, acts[a], pr)
                        r.extend(f)
                        local_states.append(u)
                        hmax = max(hmax, abs(f[0]) / 1000)
                        rzmax = max(rzmax, abs(f[1]) / 1000)
                        maxshift = max(maxshift, abs(dd[0] - dd[3]))
                        maxvert = max(maxvert, abs(dd[1] - dd[4]))
                        maxM = max(maxM, abs(f[2]) / 1000, abs(f[5]) / 1000)
                        maxFdist = max(maxFdist, abs(f[1] + f[4]) / 1000)
                        for k, M, V0, N0 in res:
                            if k not in ['arch', 'jamb']:
                                continue
                            j = ['arch', 'jamb'].index(k)
                            mmax[j] = max(mmax[j], M)
                            demands[j].append((M, -N0))
                            shmax = max(shmax, V0)
                    if 'arch_observer' in globals():
                        arch_observer(globals(),case,wi,r,cr,vi,bool(al))
                    for a,local in enumerate(local_states):
                        options,tilt=window_fit(a,case,r,local)
                        for datum,(gap,surface) in options.items():
                            if gap>data_options.get(datum,[-1])[0]:data_options[datum]=[gap,wi,a,surface]
                        closing,where=options['near',5300]
                        if closing>worst_window[0]:worst_window=[closing,{'window':a,'wind':wi,'ceiling':al,'surface':where}]
                        max_tilt=max(max_tilt,abs(tilt))
                    assert max((abs(x - y + z) for x, y, z in zip(d, baseq, mul(coupled_flexibility, r)))) < 0.0001
            for j, dep in enumerate([215, jamb_width]):
                cap = capacity(dep, 16)
                v = {round(N0, 1): cap(round(N0, 1)) for M, N0 in demands[j]}
                maxUtil[j] = max((M / v[round(N0, 1)] for M, N0 in demands[j]))
            rows.append(dict(crackedEI=cr, support='two retained corner bearings' if vi else 'all mapped lower bearings', maxLowerSpan=spans, windowFinishGap=8, datumComparisons={f'{k[0]} {k[1]}':v for k,v in data_options.items()}, maximumGapClosure=worst_window, maximumRigidWindowRotation=max_tilt, residualFinishGap=8-worst_window[0], maxMomentArchJamb=mmax, maxInPlaneInteractionArchJamb=maxUtil, maxLeftH=hmax, maxLeftV=rzmax, maxRelativeEndpointX=maxshift, maxRelativeEndpointZ=maxvert, maxEndMoment=maxM, maxMemberShear=shmax, maxTotalVerticalReaction=maxFdist))

    inputs = ['current-house-arch-jambs.json', 'current-house-roof-bracing.py',
              'current-house-membrane.py', 'current-house-floor-closure.py']
    result = {
        'sources': {name: hashlib.sha256((D/name).read_bytes()).hexdigest() for name in inputs},
        'scope': 'Eight upper corner openings, six coupled terminal coordinates each, 96 directional winds, ceiling present or removed, and two flexural stiffnesses. The floor strong-axis comparison models the added arch loads. Existing floor sag, base settlement and construction variation must be introduced before window clearance can be accepted.',
        'geometry': {'arch': [140, 215], 'oppositeJamb': [140, jamb_width], 'oppositeJambX': [2300, 2300+jamb_width], 'oppositeHeadEccentricity': xJ-xR, 'leftSpringX': xL, 'rightSpringX': xR, 'springZ': zs},
        'rows': rows,
        'recomputedMembers': {'localLToeGlobalZ':[fill_bottom,fill_top], 'LWidthAtSkewback':1037.5,'originalL':narrow,'localL':wide,'jambNormalWidthAtFoot':225,'jambNormalWidthAbove4550':140,'updatedWholeRoofWindStates':len(updated_wind)},
        'remaining': 'Develop curved bars into both receivers. Check out-of-plane loads including window and guarding, actual floor deflections and jamb datum, exterior masonry arch and perimeter details. Include these member actions and changed material in the final foundation ledger.',
        'admitted': False,
    }
    output = Path(__file__).with_suffix('.json')
    contents = json.dumps(result, indent=2, sort_keys=True) + '\n'
    if '--check' in sys.argv:
        assert output.read_text() == contents
    else:
        output.write_text(contents)
    print('Coupled arch/jamb moments', [row['maxMomentArchJamb'] for row in rows])
