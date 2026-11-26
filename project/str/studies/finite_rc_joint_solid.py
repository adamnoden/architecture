"""Finite conventional RC joint for composition with the actual house solve.

Geometry inputs use mm, MPa and kN/m³. Condensed coordinates use m/radians,
forces kN/kNm and potential kNm. No filesystem or retained-case fallback.
The supplied isotropic secant law is a comparison, not RC resistance evidence.
"""
from __future__ import annotations

import numpy as np
from scipy.sparse import coo_matrix
from scipy.sparse.linalg import splu
from skfem import LinearForm, asm

from finite_floor_contour import solid_boxes, condense, rigid_trace


def _vector(value, n, label):
    a = np.asarray(value, dtype=float)
    if a.shape != (n,) or not np.isfinite(a).all():
        raise ValueError('Finite '+label+' required')
    return a


def _inside_xy(point, rectangles, tolerance=1e-12):
    return any(r[0]-tolerance <= point[0] <= r[2]+tolerance
               and r[1]-tolerance <= point[1] <= r[3]+tolerance for r in rectangles)


def _node_lookup(mesh, point):
    key = tuple(float(v) for v in point)
    lookup = getattr(mesh, '_joint_exact_nodes', None)
    if lookup is None:
        lookup = {tuple(float(v) for v in p): i for i, p in enumerate(mesh.p.T)}
        mesh._joint_exact_nodes = lookup
    if key not in lookup:
        # This fallback addresses only arithmetic roundoff at explicitly
        # inserted axes. Ambiguous near-coincident nodes are never merged.
        scale = max(1., float(np.max(abs(point))))
        choices = np.flatnonzero(np.max(abs(mesh.p-np.asarray(point)[:, None]), axis=0)
                                 <= np.finfo(float).eps*scale*8)
        if len(choices) != 1:
            raise ValueError('Actual exact physical mesh node unavailable or ambiguous')
        return int(choices[0])
    return lookup[key]


def _ports_and_transform(mesh, basis, patch, slab, contours, l_rectangles,
                         wall_centroid, upper_end, normal_points, chord_axes, band_width):
    low, high = slab
    middle = (low+high)/2
    coordinates = ('u', 'v', 'w', 'rx', 'ry', 'rz')
    ports = []
    band_ports = {}
    for side, origin in [('east', [patch[2], chord_axes[1], middle]),
                         ('north', [chord_axes[0], patch[3], middle])]:
        start = len(ports)
        band_ports[side] = start
        ports.extend({'id':'band/'+side+'/'+c, 'kind':'band', 'coordinate':c,
                      'originM':list(origin)} for c in ('u', 'v', 'rz'))
    stations = {}
    shell_points = {}
    for side in ('east', 'north'):
        values = np.asarray(contours[side], float)
        along = 1 if side == 'east' else 0
        if (values.ndim != 1 or len(values) < 2 or not np.isfinite(values).all()
            or np.any(np.diff(values) <= 0)
            or abs(values[0]-patch[along]) > 1e-12
            or abs(values[-1]-patch[along+2]) > 1e-12):
            raise ValueError('Actual strictly increasing complete native contour required')
        band_high = chord_axes[along]+band_width/2
        if not np.any(abs(values-band_high) < 1e-12):
            raise ValueError('Native band edge must be an explicit contour station')
        rows = []
        for value in values:
            xy = (patch[2], float(value)) if side == 'east' else (float(value), patch[3])
            if xy not in shell_points:
                in_band = value <= band_high+1e-12
                indices = {}
                for c in (('w', 'rx', 'ry') if in_band else ('u', 'v', 'w', 'rx', 'ry')):
                    indices[c] = len(ports)
                    ports.append({'id':f'floor/{xy[0]:.17g}/{xy[1]:.17g}/{c}',
                                  'kind':'shell', 'coordinate':c, 'xyM':list(xy), 'zM':middle})
                shell_points[xy] = indices
            rows.append((float(value), xy, shell_points[xy]))
        stations[side] = rows
    walls = []
    for label, level in [('lower', low), ('upper', upper_end)]:
        origin = [*wall_centroid, level]
        start = len(ports)
        walls.append((level, start, np.asarray(origin)))
        ports.extend({'id':'wall/'+label+'/'+c, 'kind':'wall', 'coordinate':c,
                      'originM':origin} for c in coordinates)
    normal_indices = []
    for i, point in enumerate(normal_points):
        normal_indices.append(len(ports))
        ports.append({'id':'normal/'+str(i)+'/w', 'kind':'normal', 'coordinate':'w',
                      'originM':[*point, low], 'contactIndex':i})
    rows = []
    cols = []
    entries = []
    constrained = set()

    def put(dof, coefficients):
        if dof in constrained:
            raise ValueError('Duplicate physical boundary coordinate duty')
        constrained.add(int(dof))
        for column, value in coefficients.items():
            if value:
                rows.append(int(dof));cols.append(column);entries.append(float(value))

    def station_trace(side, row, zeta):
        value, xy, indices = row
        result = [dict(), dict(), dict()]
        if 'u' in indices:
            result[0][indices['u']] = 1.
            result[1][indices['v']] = 1.
        else:
            start = band_ports[side]
            result[0][start] = 1.
            result[1][start+1] = 1.
            if side == 'east':
                result[0][start+2] = -(value-chord_axes[1])
            else:
                result[1][start+2] = value-chord_axes[0]
        result[0][indices['ry']] = zeta
        result[1][indices['rx']] = -zeta
        result[2][indices['w']] = 1.
        return result

    for node, point in enumerate(mesh.p.T):
        lower_wall = abs(point[2]-low) < 1e-12 and _inside_xy(point, l_rectangles)
        upper_wall = abs(point[2]-upper_end) < 1e-12
        if lower_wall or upper_wall:
            level, start, origin = walls[0 if lower_wall else 1]
            trace = rigid_trace(point, origin)
            for d in range(3):
                put(basis.nodal_dofs[d, node], {start+j:v for j,v in enumerate(trace[d]) if v})
            continue
        side = None
        if low-1e-12 <= point[2] <= high+1e-12:
            if abs(point[0]-patch[2]) < 1e-12:side = 'east'
            elif abs(point[1]-patch[3]) < 1e-12:side = 'north'
        if side:
            along = 1 if side == 'east' else 0
            values = np.array([r[0] for r in stations[side]])
            i = min(max(int(np.searchsorted(values, point[along], side='right'))-1, 0), len(values)-2)
            fraction = (point[along]-values[i])/(values[i+1]-values[i])
            if not -1e-10 <= fraction <= 1+1e-10:
                raise ValueError('Contour interpolation outside actual stations')
            a = station_trace(side, stations[side][i], point[2]-middle)
            b = station_trace(side, stations[side][i+1], point[2]-middle)
            for d in range(3):
                coefficients = {}
                for trace, factor in ((a, 1-fraction), (b, fraction)):
                    for j,v in trace[d].items():coefficients[j] = coefficients.get(j, 0.)+factor*v
                put(basis.nodal_dofs[d, node], coefficients)
    for i, point in enumerate(normal_points):
        node = _node_lookup(mesh, [*point, low])
        # Only W is retained here. U/V remain real interior coordinates.
        put(basis.nodal_dofs[2, node], {normal_indices[i]:1.})
    transform = coo_matrix((entries, (rows, cols)), shape=(basis.N, len(ports))).tocsc()
    if np.any(np.asarray(abs(transform).sum(axis=0)).ravel() == 0):
        raise ValueError('Unused physical joint port')
    return ports, transform, np.asarray(sorted(constrained), int)


def _rigid_modes(ports):
    result = []
    for port in ports:
        coordinate = ('u', 'v', 'w', 'rx', 'ry', 'rz').index(port['coordinate'])
        if coordinate < 3:
            point = port.get('originM', [*port.get('xyM', []), port.get('zM')])
            result.append(rigid_trace(point, np.zeros(3))[coordinate])
        else:
            row = np.zeros(6);row[coordinate] = 1.;result.append(row)
    return np.asarray(result)


def _chord_stiffness(mesh, basis, patch, middle, axes, axial_rigidity):
    rows = [];cols = [];values = []
    segments = []
    for axis in (0, 1):
        along = np.unique(mesh.p[axis])
        along = along[(along >= axes[axis]) & (along <= patch[axis+2])]
        for a,b in zip(along, along[1:]):
            p = [axes[0], axes[1], middle];q = p.copy();p[axis] = a;q[axis] = b
            ia, ib = _node_lookup(mesh, p), _node_lookup(mesh, q)
            dofs = [int(basis.nodal_dofs[axis, ia]), int(basis.nodal_dofs[axis, ib])]
            k = axial_rigidity/(b-a)
            for i, sign_i in enumerate((1., -1.)):
                for j, sign_j in enumerate((1., -1.)):
                    rows.append(dofs[i]);cols.append(dofs[j]);values.append(k*sign_i*sign_j)
            segments.append({'axis':axis, 'startM':p, 'endM':q, 'axialRigidityKN':axial_rigidity})
    return coo_matrix((values, (rows, cols)), shape=(basis.N, basis.N)).tocsc(), segments


def build_joint(*, patch_xy_mm, slab_z_mm, l_rectangles_xy_mm,
                wall_centroid_xy_mm, upper_end_z_mm, contours_mm,
                normal_points_xy_mm, chord_axis_xy_mm, chord_axial_rigidity_kn,
                pitch_mm, young_mpa=8250., poisson=.2,
                slab_density_kn_m3=27., wall_density_kn_m3=25., slab_live_kpa=0.):
    patch = _vector(patch_xy_mm, 4, 'patch')/1000
    slab = _vector(slab_z_mm, 2, 'slab datums')/1000
    rectangles = np.asarray(l_rectangles_xy_mm, float)/1000
    centroid = _vector(wall_centroid_xy_mm, 2, 'wall centroid')/1000
    axes = _vector(chord_axis_xy_mm, 2, 'chord axes')/1000
    normal = np.asarray(normal_points_xy_mm, float).reshape((-1, 2))/1000
    contours = {side:np.asarray(contours_mm[side], float)/1000 for side in ('east', 'north')}
    if (np.any(patch[2:] <= patch[:2]) or slab[1] <= slab[0]
        or rectangles.ndim != 2 or rectangles.shape[1] != 4 or not np.isfinite(rectangles).all()
        or np.any(rectangles[:, 2:] <= rectangles[:, :2])
        or not np.isfinite(normal).all() or len({tuple(p) for p in normal}) != len(normal)
        or not all(np.isfinite(v) and v > 0 for v in (upper_end_z_mm, pitch_mm, young_mpa, slab_density_kn_m3, wall_density_kn_m3))
        or not np.isfinite(chord_axial_rigidity_kn) or chord_axial_rigidity_kn < 0
        or not np.isfinite(slab_live_kpa) or slab_live_kpa < 0
        or not np.isfinite(poisson) or not 0 <= poisson < .5):
        raise ValueError('Finite positive exact physical joint inputs required')
    upper = upper_end_z_mm/1000
    if upper <= slab[1] or any(r[0] < patch[0] or r[1] < patch[1] or r[2] > patch[2] or r[3] > patch[3] for r in rectangles):
        raise ValueError('Contained actual L and positive upper stub required')
    if any(not (patch[0] < p[0] < patch[2] and patch[1] < p[1] < patch[3]) or _inside_xy(p, rectangles) for p in normal):
        raise ValueError('Normal scalar port must be actual slab soffit outside wall/contour duties')
    width = rectangles[0, 2]-rectangles[0, 0]
    if abs(axes[0]-patch[0]-width/2) > 1e-12 or abs(axes[1]-patch[1]-width/2) > 1e-12:
        raise ValueError('Actual source band/chord axes must bisect wall-normal strip')
    boxes = np.array([[*patch[:2], slab[0], *patch[2:], slab[1]],
                      *[[r[0], r[1], slab[1], r[2], r[3], upper] for r in rectangles]])
    x_extra = [*contours['north'], *normal[:, 0], axes[0]]
    y_extra = [*contours['east'], *normal[:, 1], axes[1]]
    depth = np.linspace(slab[0], slab[1], 5)
    mesh, basis, concrete, volume = solid_boxes(boxes, pitch_mm/1000, young_mpa*1000, poisson,
                                              (x_extra, y_extra, depth))
    chord, segments = _chord_stiffness(mesh, basis, patch, slab.mean(), axes, chord_axial_rigidity_kn)
    stiffness = concrete+chord
    ports, transform, boundary = _ports_and_transform(mesh, basis, patch, slab, contours, rectangles,
                                                     centroid, upper, normal, axes, width)
    @LinearForm
    def gravity(v, w):
        return -np.where(w.x[2] < slab[1], slab_density_kn_m3, wall_density_kn_m3)*v[2]
    @LinearForm
    def live(v, w):
        return -slab_live_kpa/(slab[1]-slab[0])*(w.x[2] < slab[1])*v[2]
    g = asm(gravity, basis);q = asm(live, basis)
    result = condense(stiffness, transform, boundary, g)
    rigid = _rigid_modes(ports)
    native = np.zeros((basis.N, 6))
    for node, p in enumerate(mesh.p.T):native[basis.nodal_dofs[:, node]] = rigid_trace(p, np.zeros(3))
    trace_error = float(abs((transform@rigid)[boundary]-native[boundary]).max())
    k = result['stiffness']
    rigid_error = float(abs(k@rigid).max()/max(1., abs(k).max()))
    load_error = float(abs(rigid.T@result['force']-native.T@g).max())
    eigenvalues = np.linalg.eigvalsh((k+k.T)/2)
    minimum_relative_eigenvalue = float(eigenvalues[0]/max(1., abs(eigenvalues[-1])))
    if trace_error > 1e-10 or rigid_error > 1e-9 or load_error > 1e-7 or minimum_relative_eigenvalue < -1e-8:
        raise ValueError('Finite joint lost rigid motion or distributed load wrench')
    return {'ports':ports, 'condensedStiffness':k, 'gravityLoad':result['force'],
            'liveLoad':result['response'].T@q, 'rigidModes':rigid, 'volumeM3':volume,
            'slabVolumeM3':float(np.prod(patch[2:]-patch[:2])*(slab[1]-slab[0])),
            'wallVolumeM3':float(sum(np.prod(r[2:]-r[:2]) for r in rectangles)*(upper-slab[1])),
            'relativeRigidModeResidual':rigid_error, 'physicalTraceResidual':trace_error,
            'minimumRelativeEigenvalue':minimum_relative_eigenvalue,
            'gravityWrenchResidualKN_KNm':load_error, 'chordSegments':segments,
            'mesh':mesh, 'basis':basis, 'fullStiffness':stiffness,
            'response':result['response'], 'interior':result['interior'], 'boundary':boundary,
            'transform':transform, 'physicalLoads':{'gravity':g, 'live':q},
            'gravityParticular':result['particular'], 'gravityPotentialConstantKNm':result['energyConstant'],
            'patchM':patch, 'slabM':slab, 'lRectanglesM':rectangles,
            'candidateAccepted':False, 'resistanceAccepted':False}


def condense_load(engine, force):
    force = np.asarray(force, float)
    if force.shape != (engine['basis'].N,) or not np.isfinite(force).all():
        raise ValueError('Complete finite physical joint load required')
    return engine['response'].T@force


def top_patch_load(engine, rectangle_xy_mm, pressure_kn_per_mm2):
    rectangle = _vector(rectangle_xy_mm, 4, 'top pressure rectangle')/1000
    patch = engine['patchM'];z = engine['slabM'][1]
    if (np.any(rectangle[2:] <= rectangle[:2]) or np.any(rectangle[:2] < patch[:2]-1e-12)
        or np.any(rectangle[2:] > patch[2:]+1e-12) or not np.isfinite(pressure_kn_per_mm2)):
        raise ValueError('Contained actual top pressure patch required')
    if any(np.all(np.minimum(rectangle[2:], r[2:])-np.maximum(rectangle[:2], r[:2]) > 1e-12)
           for r in engine['lRectanglesM']):
        raise ValueError('Upper masonry pressure must not overlap the actual upper L body')
    force = np.zeros(engine['basis'].N)
    axes = [np.unique(engine['mesh'].p[i]) for i in (0, 1)]
    # Split against actual mesh faces; exact bilinear face integration on every
    # clipped subrectangle. This is a true top-plane load, not lumped at a wall.
    for x0,x1 in zip(axes[0], axes[0][1:]):
        a,c = max(x0, rectangle[0]), min(x1, rectangle[2])
        if c <= a:continue
        for y0,y1 in zip(axes[1], axes[1][1:]):
            b,d = max(y0, rectangle[1]), min(y1, rectangle[3])
            if d <= b:continue
            nodes = [_node_lookup(engine['mesh'], p) for p in
                     [(x0,y0,z), (x1,y0,z), (x1,y1,z), (x0,y1,z)]]
            # Integrals factor into exact independent linear shape integrals.
            ix = np.array([(x1*(c-a)-(c*c-a*a)/2)/(x1-x0),
                           ((c*c-a*a)/2-x0*(c-a))/(x1-x0)])
            iy = np.array([(y1*(d-b)-(d*d-b*b)/2)/(y1-y0),
                           ((d*d-b*b)/2-y0*(d-b))/(y1-y0)])
            for node, weight in zip(nodes, [ix[0]*iy[0], ix[1]*iy[0], ix[1]*iy[1], ix[0]*iy[1]]):
                force[engine['basis'].nodal_dofs[2, node]] -= pressure_kn_per_mm2*1e6*weight
    return force


def line_load(engine, *, axis, fixed_coordinate_mm, z_mm, interval_mm, force_density_kn_per_mm):
    if axis not in (0, 1):raise ValueError('Actual orthogonal line axis required')
    interval = _vector(interval_mm, 2, 'line interval')/1000
    density = _vector(force_density_kn_per_mm, 3, 'line force density')*1000
    other = 1-axis;fixed = fixed_coordinate_mm/1000;z = z_mm/1000
    along = np.unique(engine['mesh'].p[axis])
    if interval[1] <= interval[0] or interval[0] < along[0]-1e-12 or interval[1] > along[-1]+1e-12:
        raise ValueError('Contained actual line load required')
    force = np.zeros(engine['basis'].N)
    for lo,hi in zip(along, along[1:]):
        a,b = max(lo, interval[0]), min(hi, interval[1])
        if b <= a:continue
        p = [0.,0.,z];q = p.copy();p[axis] = lo;q[axis] = hi;p[other] = q[other] = fixed
        nodes = [_node_lookup(engine['mesh'], value) for value in (p,q)]
        weights = [(hi*(b-a)-(b*b-a*a)/2)/(hi-lo), ((b*b-a*a)/2-lo*(b-a))/(hi-lo)]
        for node,weight in zip(nodes, weights):force[engine['basis'].nodal_dofs[:, node]] += weight*density
    return force


def recover(engine, port_displacements_si, physical_load):
    q = _vector(port_displacements_si, len(engine['ports']), 'joint port displacement')
    f = _vector(physical_load, engine['basis'].N, 'complete joint physical load')
    interior = engine['interior']
    if '_interiorFactor' not in engine:
        engine['_interiorFactor'] = splu(engine['fullStiffness'][interior][:, interior], permc_spec='MMD_AT_PLUS_A')
    particular = np.zeros(engine['basis'].N)
    particular[interior] = engine['_interiorFactor'].solve(f[interior])
    u = engine['response']@q+particular
    reaction = engine['condensedStiffness']@q-condense_load(engine, f)
    energy = float(.5*u@(engine['fullStiffness']@u))
    work = float(q@reaction+u@f)
    error = abs(2*energy-work)/max(1., abs(work))
    if error > 1e-7:raise ValueError('Actual finite joint physical energy/work fails')
    return {'physicalDisplacementsM':u, 'portReactionKN_KNm':reaction,
            'strainEnergyKNm':energy, 'externalLoadWorkKNm':float(u@f),
            'relativeWorkResidual':error, 'candidateAccepted':False, 'resistanceAccepted':False}
