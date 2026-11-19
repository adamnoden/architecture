import math
import runpy
from pathlib import Path


def dot(a, b):
    return math.fsum(x*y for x, y in zip(a, b))


def cross(a, b):
    return [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]]


def mm(a, b):
    return [[dot(row, column) for column in zip(*b)] for row in a]


def transpose(a):
    return list(map(list, zip(*a)))


def offset_matrix(offset):
    x, y, z = offset
    return [[1,0,0,0,z,-y], [0,1,0,-z,0,x], [0,0,1,y,-x,0],
            [0,0,0,1,0,0], [0,0,0,0,1,0], [0,0,0,0,0,1]]


def rectangle_section(width, depth):
    a, b = max(width, depth), min(width, depth)
    correction = math.fsum(math.tanh(n*math.pi*a/(2*b))/n**5 for n in range(1, 60, 2))
    return {'A':width*depth, 'Iy':depth*width**3/12, 'Iz':width*depth**3/12,
            'J':a*b**3/3*(1-192*b/(math.pi**5*a)*correction)}


def rectangle_contact_quadrature(rectangle):
    a,b,c,d = rectangle
    if not all(math.isfinite(value) for value in rectangle) or c <= a or d <= b:
        raise ValueError('A positive finite contact rectangle is required')
    centre_u,centre_v = (a+c)/2,(b+d)/2
    du,dv = (c-a)/(2*math.sqrt(3)),(d-b)/(2*math.sqrt(3))
    weight = (c-a)*(d-b)/4
    return [(centre_u+su*du,centre_v+sv*dv,weight) for su in (-1,1) for sv in (-1,1)]


def l_section(low, width, end):
    rectangles = [(low,low,low+width,end), (low+width,low,end,low+width)]
    areas = [(b-a)*(d-c) for a,c,b,d in rectangles]
    area = sum(areas)
    centre = [sum(ar*(r[j]+r[j+2])/2 for ar,r in zip(areas,rectangles))/area for j in range(2)]
    uu = vv = uv = 0.
    for ar,(a,c,b,d) in zip(areas,rectangles):
        u, v = (a+b)/2-centre[0], (c+d)/2-centre[1]
        uu += (d-c)*(b-a)**3/12+ar*u*u
        vv += (b-a)*(d-c)**3/12+ar*v*v
        uv += ar*u*v
    angle = math.atan2(2*uv, uu-vv)/2
    co, si = math.cos(angle), math.sin(angle)
    var_y = co*co*uu+si*si*vv+2*co*si*uv
    var_z = si*si*uu+co*co*vv-2*co*si*uv
    torsion = sum(rectangle_section(b-a,d-c)['J'] for a,c,b,d in rectangles)
    return {'A':area, 'Iy':var_z, 'Iz':var_y, 'J':torsion,
            'centreUV':centre, 'principalYUV':[co,si], 'rectangles':rectangles}


def frame_matrix(start, end, section, material, y_axis=None):
    length = math.dist(start, end)
    if length <= 1e-6:
        raise ValueError('Frame member has zero length')
    x = [(b-a)/length for a,b in zip(start,end)]
    trial = y_axis or ([0,0,1] if abs(x[2]) < .9 else [1,0,0])
    y = [a-dot(trial,x)*b for a,b in zip(trial,x)]
    scale = math.sqrt(dot(y,y))
    if scale < 1e-8:
        raise ValueError('Frame orientation is parallel to its axis')
    y = [v/scale for v in y]
    z = cross(x,y)
    rotation = [x,y,z]
    transform = [[0.]*12 for _ in range(12)]
    for offset in (0,3,6,9):
        for i in range(3):
            for j in range(3):
                transform[offset+i][offset+j] = rotation[i][j]
    e = material['elasticModulusMPa']/1000
    g = e/(2*(1+material['poissonRatio']))
    local = [[0.]*12 for _ in range(12)]
    def pair(indices, matrix):
        for i,ii in enumerate(indices):
            for j,jj in enumerate(indices):
                local[ii][jj] += matrix[i][j]
    axial = e*section['A']/length
    pair((0,6), [[axial,-axial],[-axial,axial]])
    torsion = g*section['J']*material['torsionFactor']/length
    pair((3,9), [[torsion,-torsion],[-torsion,torsion]])
    for positions, inertia, signs in [((1,5,7,11),section['Iz'],(1,1,1,1)),
                                      ((2,4,8,10),section['Iy'],(1,-1,1,-1))]:
        ei = e*inertia*material['flexuralFactor']
        phi = 12*ei/(g*material['shearAreaFactor']*section['A']*length*length)
        basic = [[12,6*length,-12,6*length],
                 [6*length,(4+phi)*length*length,-6*length,(2-phi)*length*length],
                 [-12,-6*length,12,-6*length],
                 [6*length,(2-phi)*length*length,-6*length,(4+phi)*length*length]]
        pair(positions, [[ei/(length**3*(1+phi))*v*signs[i]*signs[j] for j,v in enumerate(row)] for i,row in enumerate(basic)])
    return mm(transpose(transform),mm(local,transform))


class FrameModel:
    def __init__(self):
        self.nodes = {}
        self.members = []
        self.springs = []
        self.fixed = {}
        self.loads = {}

    def node(self, name, xyz):
        if name in self.nodes and tuple(xyz) != self.nodes[name]:
            raise ValueError('Conflicting stable node coordinates')
        self.nodes[name] = tuple(xyz)
        return name

    def member(self, name, a, b, section, material, physical_start=None, physical_end=None, y_axis=None):
        p, q = physical_start or self.nodes[a], physical_end or self.nodes[b]
        stiffness = frame_matrix(p,q,section,material,y_axis)
        shifts = [[0.]*12 for _ in range(12)]
        for at, point, master in [(0,p,self.nodes[a]),(6,q,self.nodes[b])]:
            block = offset_matrix([x-y for x,y in zip(point,master)])
            for i,row in enumerate(block):
                shifts[at+i][at:at+6] = row
        self.members.append((name,a,b,mm(transpose(shifts),mm(stiffness,shifts))))

    def spring(self, name, a, b, point, direction, stiffness, mode='bilateral', gap=0.):
        if mode not in ('bilateral','compression','tension') or not math.isfinite(stiffness) or stiffness <= 0:
            raise ValueError('Unsupported finite spring law')
        if gap != 0:
            raise ValueError('Only zero-gap spring laws are supported; finite free-travel branches require a different contact solver')
        rows = []
        for node, sign in [(a,1),(b,-1)]:
            offset = [x-y for x,y in zip(point,self.nodes[node])]
            coeff = [*direction,*cross(offset,direction)]
            rows.append((node,[sign*v for v in coeff]))
        self.springs.append({'id':name,'terms':rows,'stiffness':stiffness,'mode':mode,'gap':gap})

    def load(self, node, wrench):
        previous = self.loads.setdefault(node,[0.]*6)
        for i,value in enumerate(wrench):
            previous[i] += value

    def solve(self):
        names = list(self.nodes)
        indices = {name:6*i for i,name in enumerate(names)}
        count = 6*len(names)
        fixed = {indices[name]+axis:value for (name,axis),value in self.fixed.items()}
        free = [i for i in range(count) if i not in fixed]
        scale = [1 if i%6 < 3 else .001 for i in range(count)]
        external = [0.]*count
        for name,wrench in self.loads.items():
            for axis,value in enumerate(wrench): external[indices[name]+axis] += value
        base = [[0.]*count for _ in range(count)]
        for _,a,b,stiffness in self.members:
            dofs = list(range(indices[a],indices[a]+6))+list(range(indices[b],indices[b]+6))
            for ii,row in zip(dofs,stiffness):
                for jj,value in zip(dofs,row): base[ii][jj] += value
        active = {spring['id']:True for spring in self.springs}
        factor = runpy.run_path(str(Path(__file__).with_name('structural-linear.py')))['factor']
        seen = set()
        for iteration in range(40):
            state = tuple(sorted(name for name,enabled in active.items() if enabled))
            if state in seen: raise ValueError('Unilateral contact active set cycles; no compatible result')
            seen.add(state)
            matrix = [row[:] for row in base]
            force = external[:]
            for spring in self.springs:
                if not active[spring['id']]: continue
                terms = [(indices[name]+axis,coefficient) for name,row in spring['terms'] for axis,coefficient in enumerate(row) if coefficient]
                k = spring['stiffness']
                rest = (-spring['gap'] if spring['mode']=='compression' else spring['gap']) if spring['mode']!='bilateral' else 0.
                for i,x in terms:
                    force[i] += k*rest*x
                    for j,y in terms: matrix[i][j] += k*x*y
            reduced = [[matrix[i][j]*scale[i]*scale[j] for j in free] for i in free]
            rhs = [(force[i]-sum(matrix[i][j]*value for j,value in fixed.items()))*scale[i] for i in free]
            solved = factor(reduced)(rhs)
            u = [fixed.get(i,0.) for i in range(count)]
            for i,value in zip(free,solved): u[i] = value*scale[i]
            changed = False
            springs = []
            for spring in self.springs:
                relative = sum(coefficient*u[indices[name]+axis] for name,row in spring['terms'] for axis,coefficient in enumerate(row))
                mode, gap = spring['mode'], spring['gap']
                enabled = mode=='bilateral' or relative <= -gap+1e-10 if mode!='tension' else relative > gap+1e-10
                rest = -gap if mode=='compression' else gap if mode=='tension' else 0.
                force_value = spring['stiffness']*(relative-rest) if enabled else 0.
                if enabled != active[spring['id']]: changed = True
                active[spring['id']] = enabled
                springs.append({**spring,'relativeMm':relative,'active':enabled,'forceKN':force_value})
            if changed: continue
            residual = [sum(k*x for k,x in zip(row,u))-force[i] for i,row in enumerate(matrix)]
            if max(abs(residual[i]) for i in free) > .01:
                raise ValueError('Compatible frame solution fails free-node equilibrium')
            members = {}
            for name,a,b,stiffness in self.members:
                vector = u[indices[a]:indices[a]+6]+u[indices[b]:indices[b]+6]
                members[name] = [dot(row,vector) for row in stiffness]
            return {'displacements':{name:u[indices[name]:indices[name]+6] for name in names},
                    'memberEndWrenchesKN_KNmm':members,
                    'supportWrenches':{name:[residual[indices[name]+axis] if indices[name]+axis in fixed else 0. for axis in range(6)] for name in names if any((name,axis) in self.fixed for axis in range(6))},
                    'springs':springs,'iterations':iteration+1,'maximumFreeResidualKNOrKNmm':max(abs(residual[i]) for i in free)}
        raise ValueError('Unilateral contact did not converge')
