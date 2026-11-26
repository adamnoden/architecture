import hashlib
import json
import math
from itertools import pairwise


_OPERATOR_CACHE = {}
_BACKEND_POLICIES = ('auto-fine-sparse-v1','python','scipy-sparse')


def _sparse_operator(matrix,retained,scale):
    """Congruence-normalised physical Schur block, without graph fill in Python."""
    import numpy as np
    from scipy import sparse
    from scipy.sparse.linalg import splu
    interior=sorted(set(matrix)-set(retained));order=retained+interior;lookup={index:i for i,index in enumerate(order)}
    rows=[];columns=[];values=[]
    for i,row in matrix.items():
        for j,value in row.items():
            if value:rows.append(lookup[i]);columns.append(lookup[j]);values.append(value)
    physical=sparse.csc_matrix((values,(rows,columns)),shape=(len(order),len(order)))
    magnitude=max(1.,float(np.max(np.abs(physical.data))) if physical.nnz else 0.)
    asymmetry=physical-physical.T
    if asymmetry.nnz and float(np.max(np.abs(asymmetry.data)))>magnitude*1e-12:
        raise ValueError('Physical perforated-floor matrix is not symmetric; no operator repair')
    r=len(retained);si=np.array([scale[i] for i in interior]);sr=np.array([scale[i] for i in retained])
    kir=(sparse.diags(si)@physical[r:,:r]).tocsc();kri=(physical[:r,r:]@sparse.diags(si)).tocsr()
    kii=(sparse.diags(si)@physical[r:,r:]@sparse.diags(si)).tocsc()
    factor=None;response=np.zeros((len(interior),r));minimum_pivot=None
    if interior:
        try:
            factor=splu(kii,permc_spec='MMD_AT_PLUS_A',diag_pivot_thresh=0.,options={'SymmetricMode':True,'Equil':False})
        except RuntimeError as error:
            raise ValueError('Unconnected or singular perforated-floor interior; no artificial restraint is added') from error
        # Symmetric permutations make positive LU diagonals an LDL energy
        # certificate. A row pivot is NOT silently admitted as another backend.
        physical_pivots=factor.U.diagonal()/si[np.argsort(factor.perm_c)]**2
        if not np.array_equal(factor.perm_r,factor.perm_c) or not np.all(np.isfinite(physical_pivots)) or np.min(physical_pivots)<=1e-9:
            raise ValueError('Nonpositive or singular perforated-floor interior; no pivot/support regularisation')
        minimum_pivot=float(np.min(physical_pivots));response=factor.solve(kir.toarray())
        residual=kii@response-kir.toarray()
        if float(np.max(np.abs(residual)))/max(1.,float(np.max(np.abs(kir.data))) if kir.nnz else 0.)>1e-8:
            raise ValueError('Sparse perforated-floor interior response fails physical solve residual')
    condensed=physical[:r,:r].toarray()-kri@response
    condensed=sr[:,None]*condensed*sr[None,:]
    return condensed.tolist(),{'factor':factor,'interior':interior,'interiorScale':si,'retainedScale':sr,
        'interiorMatrix':kii,'interiorToRetained':kri,'minimumPhysicalInteriorPivot':minimum_pivot}


def _reduced_force(cached,retained,force):
    if cached['backend']=='python':
        reduced=dict(force);energy=0.
        for index,pivot,neighbours in cached['steps']:
            applied=reduced.pop(index,0.);energy+=applied*applied/(2*pivot)
            for a,x in neighbours:reduced[a]=reduced.get(a,0.)-x*applied/pivot
        return [reduced.get(i,0.)*cached['scale'][i] for i in retained],energy
    import numpy as np
    data=cached['sparse'];fi=np.array([force.get(i,0.) for i in data['interior']])*data['interiorScale']
    particular=data['factor'].solve(fi) if data['factor'] is not None else fi
    residual=data['interiorMatrix']@particular-fi
    if len(fi) and float(np.max(np.abs(residual)))/max(1.,float(np.max(np.abs(fi))))>1e-8:
        raise ValueError('Sparse perforated-floor load reduction fails physical solve residual')
    load=np.array([force.get(i,0.) for i in retained])-data['interiorToRetained']@particular
    return (load*data['retainedScale']).tolist(),float(fi@particular/2)


def _add(matrix, terms, local):
    for i, row in enumerate(local):
        for j, value in enumerate(row):
            if not value:
                continue
            for a, x in terms[i]:
                for b, y in terms[j]:
                    matrix.setdefault(a, {})[b] = matrix.get(a, {}).get(b, 0.)+value*x*y


def _schur(matrix, retained, scale, order, load=None):
    work = {i: dict(row) for i, row in matrix.items()}
    steps = []
    force = dict(load or {})
    for index in order:
        row = work[index]
        pivot = row[index]
        if not math.isfinite(pivot) or pivot <= 1e-9:
            raise ValueError('Unconnected or singular perforated-floor interior; no artificial restraint is added')
        neighbours = [(j, value) for j, value in row.items() if j != index and value]
        steps.append((index, pivot, neighbours))
        applied = force.pop(index, 0.)
        for a,x in neighbours:
            force[a] = force.get(a, 0.)-x*applied/pivot
        for a, x in neighbours:
            work[a].pop(index, None)
            target = work[a]
            for b, y in neighbours:
                target[b] = target.get(b, 0.)-x*y/pivot
        del work[index]
    return [[work[i].get(j, 0.)*scale[i]*scale[j] for j in retained] for i in retained], [force.get(i, 0.)*scale[i] for i in retained], steps


def positive_energy_modes(matrix):
    count = len(matrix)
    work = [[(a+b)/2 for a, b in zip(row, column)] for row, column in zip(matrix, zip(*matrix))]
    original = max(abs(value) for row in work for value in row)
    modes = []
    remaining = set(range(count))
    while remaining:
        index = max(remaining, key=lambda i: work[i][i])
        pivot = work[index][index]
        if pivot < -original*1e-8:
            raise ValueError('The condensed floor has negative strain energy')
        if pivot <= original*1e-10:
            if max(abs(work[i][j]) for i in remaining for j in remaining) > original*1e-8:
                raise ValueError('Unsupported condensed-floor nullspace')
            break
        vector = [work[index][j]/math.sqrt(pivot) if j in remaining else 0. for j in range(count)]
        modes.append(vector)
        for i in remaining:
            for j in remaining:
                work[i][j] -= vector[i]*vector[j]
        remaining.remove(index)
    reconstructed = [[math.fsum(mode[i]*mode[j] for mode in modes) for j in range(count)] for i in range(count)]
    error = max(abs(a-b) for row, other in zip(matrix, reconstructed) for a, b in zip(row, other))/max(1., original)
    if error > 1e-8:
        raise ValueError('Condensed energy modes do not reproduce the physical floor stiffness')
    return modes, error


def compile_perforated_floor(bodies, omissions, loops, corner_patches, law, max_pitch_mm, pressure_rows=(), boundary_receivers=(), numerical_backend='auto-fine-sparse-v1'):
    if numerical_backend not in _BACKEND_POLICIES:raise ValueError('Explicit supported perforated-floor numerical backend policy required; no fallback')
    backend=('scipy-sparse' if max_pitch_mm<500 else 'python') if numerical_backend=='auto-fine-sparse-v1' else numerical_backend
    if not law or not all(math.isfinite(value) and (value > 0 or key == 'edgeAxialRigidityKN' and type(value) in (int,float) and value == 0) for key, value in law.items() if key != 'poissonRatio') or not 0 <= law['poissonRatio'] < .5:
        raise ValueError('An explicit positive finite membrane and edge law is required')
    port_ids={row['id'] for row in corner_patches}
    for receiver in boundary_receivers:
        if set(receiver)!={'id','axis','datum','width','lo','hi','stations','shearPhi'} or type(receiver['axis']) is not int or receiver['axis'] not in (0,1) or any(type(receiver[key]) not in (int,float) or not math.isfinite(receiver[key]) for key in ('datum','width','lo','hi')) or not receiver['lo']<receiver['hi'] or receiver['width']<=0:
            raise ValueError('Unsupported explicit orthogonal finite beam receiver')
        stations=receiver['stations']
        coordinate='x' if receiver['axis']==0 else 'u'
        if len(stations)<2 or len(receiver['shearPhi'])!=len(stations)-1 or any(set(row)!={'id',coordinate} or row['id'] not in port_ids or type(row[coordinate]) not in (int,float) or not math.isfinite(row[coordinate]) for row in stations):
            raise ValueError('Finite beam receiver requires existing retained station ports')
        if any(a[coordinate]>=b[coordinate] for a,b in pairwise(stations)) or any(not math.isfinite(value) or value<0 for value in receiver['shearPhi']):
            raise ValueError('Unordered or nonfinite beam receiver interpolation')
    bounds = [min(row[0] for row in bodies), min(row[1] for row in bodies), max(row[2] for row in bodies), max(row[3] for row in bodies)]
    coordinates = []
    for axis in (0, 1):
        raw = {bounds[axis], bounds[axis+2],(bounds[axis]+bounds[axis+2])/2}
        for rectangle in bodies+omissions:
            raw.update(value for value in rectangle[axis::2] if bounds[axis] <= value <= bounds[axis+2])
        for loop in loops:
            raw.update(value for value in [loop['lo'], loop['hi'], loop['lo']+loop['width']/2, loop['hi']-loop['width']/2] if bounds[axis] <= value <= bounds[axis+2])
            raw.update(value for value in [loop['lo']-loop['width']/2, loop['hi']+loop['width']/2] if bounds[axis] <= value <= bounds[axis+2])
        for corner in corner_patches:
            raw.update(value for rectangle in corner['rectangles'] for value in rectangle[axis::2] if bounds[axis] <= value <= bounds[axis+2])
        for receiver in boundary_receivers:
            if axis==receiver['axis']:
                coordinate='x' if receiver['axis']==0 else 'u'
                raw.update(value for value in [receiver['lo'],receiver['hi'],*[row[coordinate] for row in receiver['stations']]] if bounds[axis]<=value<=bounds[axis+2])
            else:
                raw.update(value for value in [receiver['datum']-receiver['width']/2,receiver['datum'],receiver['datum']+receiver['width']/2] if bounds[axis]<=value<=bounds[axis+2])
        values = []
        for a, b in pairwise(sorted(raw)):
            n = max(1, math.ceil((b-a)/max_pitch_mm))
            values.extend(a+(b-a)*i/n for i in range(n))
        coordinates.append(values+[bounds[axis+2]])
    def inside(point, rectangle):
        x, y = point
        return rectangle[0] < x < rectangle[2] and rectangle[1] < y < rectangle[3]
    triangles = []
    for a, b in pairwise(coordinates[0]):
        for c, d in pairwise(coordinates[1]):
            point = ((a+b)/2, (c+d)/2)
            if not any(inside(point, rectangle) for rectangle in bodies) or any(inside(point, rectangle) for rectangle in omissions):
                continue
            triangles.extend([[(a,c),(b,c),(b,d)],[(a,c),(b,d),(a,d)]])
    mesh_points = sorted({point for triangle in triangles for point in triangle})
    dofs = {}
    def dof(key):
        if key not in dofs:
            dofs[key] = len(dofs)
        return dofs[key]
    for corner in corner_patches:
        for axis in range(3):
            dof(('corner', corner['id'], axis))
    def corner_terms(point, corner, axis):
        if axis == 2:
            return [(dof(('corner',corner['id'],2)),1.)]
        x, y = point
        cx, cy = corner['originXYMm']
        coefficient = -(y-cy) if axis == 0 else x-cx
        return [(dof(('corner',corner['id'],axis)),1.),(dof(('corner',corner['id'],2)),coefficient)]
    def owner(point):
        for corner in corner_patches:
            if any(rectangle[0]-1e-6 <= point[0] <= rectangle[2]+1e-6 and rectangle[1]-1e-6 <= point[1] <= rectangle[3]+1e-6 for rectangle in corner['rectangles']):
                return corner
        return None
    def boundary_terms(point,axis):
        for receiver in boundary_receivers:
            along=receiver['axis'];transverse=1-along;sign=1 if along==0 else -1
            coordinate='x' if along==0 else 'u'
            if not receiver['lo']-1e-6<=point[along]<=receiver['hi']+1e-6 or abs(point[transverse]-receiver['datum'])>receiver['width']/2+1e-6:
                continue
            local_axis=0 if axis==along else 1 if axis==transverse else 2
            output_sign=sign if local_axis==1 else 1
            stations=receiver['stations'];u=point[along];offset=sign*(point[transverse]-receiver['datum'])
            if u<=stations[0][coordinate] or u>=stations[-1][coordinate]:
                row=stations[0] if u<=stations[0][coordinate] else stations[-1]
                identifier=row['id'];dx=u-row[coordinate]
                values={0:[(identifier,0,1.),(identifier,2,-offset)],1:[(identifier,1,1.),(identifier,2,dx)],2:[(identifier,2,1.)]}[local_axis]
            else:
                index=next(i for i,(a,b) in enumerate(pairwise(stations)) if a[coordinate]<=u<=b[coordinate])
                a,b=stations[index:index+2];length=b[coordinate]-a[coordinate];v=(u-a[coordinate])/length;phi=receiver['shearPhi'][index];den=1+phi
                lateral=[(1-3*v*v+2*v**3+phi*(1-v))/den,length*(v-2*v*v+v**3+phi*(v-v*v)/2)/den,
                         (3*v*v-2*v**3+phi*v)/den,length*(-v*v+v**3+phi*(-v+v*v)/2)/den]
                rotation=[6*(v*v-v)/(length*den),(1-4*v+3*v*v+phi*(1-v))/den,
                          6*(v-v*v)/(length*den),(-2*v+3*v*v+phi*v)/den]
                transverse=[(a['id'],1,lateral[0]),(a['id'],2,lateral[1]),(b['id'],1,lateral[2]),(b['id'],2,lateral[3])]
                turning=[(a['id'],1,rotation[0]),(a['id'],2,rotation[1]),(b['id'],1,rotation[2]),(b['id'],2,rotation[3])]
                values=[(a['id'],0,1-v),(b['id'],0,v)]+[(identifier,c,-offset*coefficient) for identifier,c,coefficient in turning] if local_axis==0 else transverse if local_axis==1 else turning
            return [(dof(('corner',identifier,along if c==0 else 1-along if c==1 else 2)),output_sign*(sign if c==1 else 1)*coefficient)
                for identifier,c,coefficient in values if coefficient]
        return None
    def axis_terms(point, axis):
        boundary=boundary_terms(point,axis)
        if boundary is not None:return boundary
        corner = owner(point)
        if corner:
            return corner_terms(point, corner, axis)
        return [(dof(('ring',point,axis)),1.)]
    def mesh_terms(point, axis):
        boundary=boundary_terms(point,axis)
        if boundary is not None:return boundary
        corner = owner(point)
        if corner:
            return corner_terms(point, corner, axis)
        candidates = []
        for loop in loops:
            ax = loop['axis']; datum = loop['datum']; u = point[ax]
            distance = abs(point[1-ax]-datum)
            if loop['lo']-1e-6 <= u <= loop['hi']+1e-6 and abs(distance-loop['width']/2) <= 1e-6:
                projected = (u,datum) if ax == 0 else (datum,u)
                candidates.append((distance,projected))
        if candidates:
            _, projected = min(candidates)
            terms = axis_terms(projected,axis)
            rotation = axis_terms(projected,2)
            coefficient = -(point[1]-projected[1]) if axis == 0 else point[0]-projected[0]
            return terms+[(index,value*coefficient) for index,value in rotation]
        return [(dof(('mesh',point,axis)),1.)]
    # A real frame node may have no in-plane plate attachment (for example a
    # vertical-only station). Retain its exact zero work row rather than
    # inventing membrane stiffness or dropping an interface coordinate.
    matrix = {i:{i:0.} for i in range(len(corner_patches)*3)}
    e, nu, shear, thickness = [law[key] for key in ('elasticModulusMPa','poissonRatio','shearModulusMPa','thicknessMm')]
    constitutive = [[e/(1-nu**2),e*nu/(1-nu**2),0],[e*nu/(1-nu**2),e/(1-nu**2),0],[0,0,shear]]
    area_total = 0.
    for triangle in triangles:
        (a,b),(c,d),(e0,f) = triangle
        area = ((c-a)*(f-b)-(e0-a)*(d-b))/2
        dm = [[0.]*6 for _ in range(3)]
        for i,(bx,by) in enumerate([(d-f,e0-c),(f-b,a-e0),(b-d,c-a)]):
            dm[0][2*i] = bx/(2*area);dm[1][2*i+1] = by/(2*area)
            dm[2][2*i] = by/(2*area);dm[2][2*i+1] = bx/(2*area)
        cd = [[math.fsum(value*dm[k][j] for k,value in enumerate(row)) for j in range(6)] for row in constitutive]
        local = [[thickness*area*math.fsum(dm[k][i]*cd[k][j] for k in range(3))/1000 for j in range(6)] for i in range(6)]
        _add(matrix,[mesh_terms(point,axis) for point in triangle for axis in (0,1)],local)
        area_total += area
    edge_records = []
    force = {}
    def put_force(terms, value):
        for index, coefficient in terms:
            force[index] = force.get(index, 0.)+coefficient*value
    for loop in loops:
        axis, datum = loop['axis'], loop['datum']
        stations = sorted({loop['lo'],loop['hi'],*[point[axis] for point in mesh_points if loop['lo'] <= point[axis] <= loop['hi']],*[value for value in coordinates[axis] if loop['lo'] <= value <= loop['hi']]})
        depth, width = loop['depth'], loop['width']
        for a,b in pairwise(stations):
            p,q = ((a,datum),(b,datum)) if axis == 0 else ((datum,a),(datum,b))
            length = b-a
            if any(receiver['axis']==axis and abs(receiver['datum']-datum)<1e-6 and receiver['lo']-1e-6<=a and b<=receiver['hi']+1e-6 for receiver in boundary_receivers):
                continue
            axial = law['edgeAxialRigidityKN']/length
            _add(matrix,[axis_terms(p,axis),axis_terms(q,axis)],[[axial,-axial],[-axial,axial]])
            # A crossing full-depth receiver replaces this concrete band
            # segment. The independently authored steel chord above remains.
            if any(receiver['axis']!=axis and receiver['lo']-1e-6<=datum<=receiver['hi']+1e-6 and receiver['datum']-receiver['width']/2-1e-6<=a and b<=receiver['datum']+receiver['width']/2+1e-6 for receiver in boundary_receivers):continue
            ei = law['edgeElasticModulusMPa']*law['edgeFlexuralFactor']*depth*width**3/12/1000
            signs = 1 if axis == 0 else -1
            terms = [[(index,value*signs) for index,value in axis_terms(p,1-axis)],axis_terms(p,2),[(index,value*signs) for index,value in axis_terms(q,1-axis)],axis_terms(q,2)]
            basic = [[12,6*length,-12,6*length],[6*length,4*length**2,-6*length,2*length**2],[-12,-6*length,12,-6*length],[6*length,2*length**2,-6*length,4*length**2]]
            _add(matrix,terms,[[ei/length**3*value for value in row] for row in basic])
        for pressure in pressure_rows:
            force_axis = 0 if pressure['forceKN'][0] else 1
            if axis == force_axis or abs(pressure['pointXYZMm'][force_axis]-datum) > 1e-6 or not loop['id'].startswith('outer-'):
                continue
            low,high = pressure['loadedAlongIntervalMm']
            qload = pressure['forceKN'][force_axis]/(high-low)
            for left,right in pairwise(stations):
                start,end = max(left,low),min(right,high)
                if end <= start:
                    continue
                if abs(start-left)>1e-6 or abs(end-right)>1e-6:
                    raise ValueError('Pressure boundaries must be actual mesh stations')
                p0,p1 = ((left,datum),(right,datum)) if axis == 0 else ((datum,left),(datum,right))
                length = right-left
                put_force(axis_terms(p0,force_axis),qload*length/2)
                put_force(axis_terms(p1,force_axis),qload*length/2)
                sign = 1 if axis == 0 else -1
                put_force(axis_terms(p0,2),sign*qload*length**2/12)
                put_force(axis_terms(p1,2),-sign*qload*length**2/12)
            for start,end,station in [(low,min(high,stations[0]),stations[0]),(max(low,stations[-1]),high,stations[-1])]:
                if end <= start:
                    continue
                point = (station,datum) if axis == 0 else (datum,station)
                value = qload*(end-start)
                put_force(axis_terms(point,force_axis),value)
                sign = 1 if axis == 0 else -1
                put_force(axis_terms(point,2),sign*value*((start+end)/2-station))
        edge_records.append({**loop,'segmentCount':len(stations)-1})
    retained = list(range(len(corner_patches)*3))
    inverse = {value:key for key,value in dofs.items()}
    cache_key = hashlib.sha256(json.dumps([bodies,omissions,loops,corner_patches,law,max_pitch_mm,numerical_backend,backend]+([boundary_receivers] if boundary_receivers else []),sort_keys=True,separators=(',',':'),allow_nan=False).encode()).hexdigest()
    cached = _OPERATOR_CACHE.get(cache_key)
    if cached is None:
        scale = [.001 if inverse[index][-1] == 2 else 1. for index in range(len(dofs))]
        cached={'backend':backend,'scale':scale,'interiorCount':len(set(matrix)-set(retained))}
        if backend=='python':
            interiors = set(matrix)-set(retained);order = [];graph = {i:set(row)-{i} for i,row in matrix.items()}
            while interiors:
                index = min(interiors,key=lambda i:(len(graph[i]),i));neighbours = graph[index]
                for a in neighbours:
                    graph[a].discard(index);graph[a].update(neighbours-{a})
                del graph[index];interiors.remove(index);order.append(index)
            condensed, _, steps = _schur(matrix,retained,scale,order)
            cached['steps']=steps
        else:
            condensed,data=_sparse_operator(matrix,retained,scale);cached['sparse']=data
        modes,error = positive_energy_modes(condensed)
        cached.update(condensed=condensed,modes=modes,error=error)
        if len(_OPERATOR_CACHE)>=4:
            _OPERATOR_CACHE.pop(next(iter(_OPERATOR_CACHE)))
        _OPERATOR_CACHE[cache_key] = cached
    condensed,modes,error=[cached[k] for k in ('condensed','modes','error')]
    if any(value and index not in matrix for index,value in force.items()):raise ValueError('Physical perforated-floor load has no assembled work coordinate')
    condensed_force,load_only_energy=_reduced_force(cached,retained,force)
    rigid = [];source_work=[];origins={p['id']:p['originXYMm'] for p in corner_patches}
    for translation,rotation in [((1.,0.),0.),((0.,1.),0.),((0.,0.),.001)]:
        vector = []
        for corner in corner_patches:
            x,y = corner['originXYMm']
            vector.extend([translation[0]-rotation*y,translation[1]+rotation*x,rotation*1000])
        rigid.append(max(abs(math.fsum(k*v for k,v in zip(row,vector))) for row in condensed))
        def physical_value(index):
            kind,point,axis=inverse[index];x,y=origins[point] if kind=='corner' else point
            return rotation if axis==2 else translation[axis]+rotation*(-y if axis==0 else x)
        source_work.append(math.fsum(f*v for f,v in zip(condensed_force,vector))-math.fsum(value*physical_value(index) for index,value in force.items()))
    if max(rigid)>1e-3:
        raise ValueError('Condensation restrained a physical rigid mode')
    if max(abs(v) for v in source_work)>1e-6:raise ValueError('Condensation loses physical source work under rigid translation/rotation')
    numerical={'policy':numerical_backend,'selectedBackend':backend,'operatorCacheIdentity':cache_key,
        'factorReuse':'Same geometry/material/ports/backend; new physical loads are always reduced again',
        'interiorRotationCoordinateScale':.001 if backend=='scipy-sparse' else 1.,
        'physicalInteriorPivotMinimumCriterion':1e-9,'loadOnlyParticularEnergyKNmm':load_only_energy,
        'sourceRigidWorkResidualKNmm':source_work,'noFallbackOrRegularisation':True}
    if backend=='scipy-sparse':
        import platform
        import numpy
        import scipy
        numerical.update(ordering='MMD_AT_PLUS_A; symmetric/no row pivot/no equilibration',
            runtime={'python':platform.python_version(),'numpy':numpy.__version__,'scipy':scipy.__version__,
                'dependencyLock':'project/str/studies/vertical-floor-requirements.txt'},
            minimumPhysicalInteriorPivot=cached['sparse']['minimumPhysicalInteriorPivot'])
    return {'schema':'str-perforated-floor-condensation/1',
            'condensedStiffnessKNPerMm':[row[:] for row in condensed],'condensedForceKN':condensed_force,
            'energyModes':[row[:] for row in modes],'modeReconstructionRelativeError':error,'rigidModeResidualKN':rigid,
            'triangleCount':len(triangles),'pointCount':len(mesh_points),'assembledDofCount':len(dofs),'interiorDofCount':cached['interiorCount'],
            'numericalCondensation':numerical,
            'membraneAreaM2':area_total/1e6,'meshTrianglesXYMm':triangles,'bands':edge_records,'ports':corner_patches,
            'omissionsXYMm':omissions,'coordinateColumns':coordinates,'unqualifiedLaw':law,
            'portCoordinates':['ux_mm','uy_mm','1000*rz_rad'],**({'finiteBeamBoundaryReceivers':boundary_receivers} if boundary_receivers else {})}
