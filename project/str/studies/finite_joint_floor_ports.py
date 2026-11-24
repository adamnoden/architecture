"""Exploratory solid L + slab patch with distributed shell-contour work ports.

Uses the existing solid library and Schur method. This changes the constitutive
comparison explicitly; it does not install an operator in the native house.
Outer-band/chord yaw, exterior remeshing and exact native replacement remain open.
"""
from bisect import bisect_right
import hashlib
import json
from pathlib import Path
import tarfile

import numpy as np
from scipy.sparse import coo_matrix
from scipy.sparse.linalg import splu
from skfem import Basis, ElementHex1, ElementVector, MeshHex, asm
from skfem.models.elasticity import linear_elasticity, lame_parameters

from finite_joint_solid import _axis, rigid_trace, gravity_force
from foundation_solid_weight import disjoint_solid_union


def read_current_patch_geometry(root, inputs):
    root = Path(root)
    archive = root/inputs['geometryArchive']
    if hashlib.sha256(archive.read_bytes()).hexdigest() != inputs['geometryArchiveSHA256']:
        raise ValueError('stale explicit geometry archive')
    with tarfile.open(archive) as stream:
        data = stream.extractfile(inputs['geometryCapture']).read()
    expected = json.loads((root/inputs['geometryComparison']).read_text())
    if not any(row['file'] == inputs['geometryCapture']
               and row['fullSHA256'] == hashlib.sha256(data).hexdigest() for row in expected['captures']):
        raise ValueError('geometry capture differs from actual full response')
    capture = json.loads(data)
    for path, identity in capture['methodSourceSHA256'].items():
        if hashlib.sha256((root/path).read_bytes()).hexdigest() != identity:
            raise ValueError('stale geometry source/method: '+path)
    audit_path = root/'project/str/studies/four-l-joint-material-audit.json'
    audit = json.loads(audit_path.read_text())
    joint = next(row for row in audit['joints'] if row['id'] == inputs['jointId'])
    rectangles = np.asarray(joint['footprintRectanglesXYMm'], dtype=float)/1000
    low_xy = rectangles[:, :2].min(axis=0)
    high_xy = low_xy+inputs['patchSideMm']/1000
    floor = capture['response']['nativeVertical']
    source_cells = floor['plate']['cellsXYMm']
    clipped = []
    for i, cell in enumerate(source_cells):
        a = np.maximum(np.asarray(cell[:2]), low_xy*1000)
        b = np.minimum(np.asarray(cell[2:]), high_xy*1000)
        if np.all(b > a):
            clipped.append({'id': str(i), 'kind': 'actual-plate', 'boxXYZMm':
                            [float(a[0]), float(a[1]), 0., float(b[0]), float(b[1]), 1.]})
    fragments = disjoint_solid_union(clipped)
    area_m2 = lambda row: ((row['boxXYZMm'][3]-row['boxXYZMm'][0])
                          *(row['boxXYZMm'][4]-row['boxXYZMm'][1])/1e6)
    union_area = sum(area_m2(row) for row in fragments)
    if (not np.isclose(union_area, np.prod(high_xy-low_xy), atol=1e-12, rtol=0)
            or not np.isclose(union_area, sum(area_m2(row) for row in clipped), atol=1e-12, rtol=0)):
        raise ValueError('actual patch has holes/overlap; solid replacement unsupported')
    if any(np.all(np.asarray(row['xyMm'])/1000 > low_xy)
           and np.all(np.asarray(row['xyMm'])/1000 < high_xy) for row in floor['bearings']):
        raise ValueError('patch intersects actual normal contacts; their removal is unsupported')
    axes = [sorted({float(low_xy[d]), float(high_xy[d]),
                    *(float(row['boxXYZMm'][d])/1000 for row in clipped),
                    *(float(row['boxXYZMm'][d+3])/1000 for row in clipped)}) for d in range(2)]
    mid = joint['gravityCentroidXYZMm'][2]/1000
    half = audit['plateThicknessMm']/2000
    return {'rectangles': rectangles, 'lowXY': low_xy, 'highXY': high_xy,
            'axisKnots': axes, 'levels': [mid-half-inputs['wallExtensionBelowMm']/1000,
                                         mid-half, mid+half,
                                         mid+half+inputs['wallExtensionAboveMm']/1000],
            'slabUnitWeight': audit['plateUnitWeightKNPerM3'],
            'geometryCaptureSHA256': hashlib.sha256(data).hexdigest(),
            'sourceSHA256': capture['methodSourceSHA256'],
            'auditSHA256': hashlib.sha256(audit_path.read_bytes()).hexdigest(),
            'actualPatchAreaM2': float(union_area), 'actualNormalContactsInsidePatch': 0}


def assemble_patch(geometry, pitch_m, young_kn_m2, poisson):
    rects = np.asarray(geometry['rectangles'])
    low, high = np.asarray(geometry['lowXY']), np.asarray(geometry['highXY'])
    levels = geometry['levels']
    if (not np.isfinite([pitch_m, young_kn_m2, poisson]).all() or pitch_m <= 0
            or young_kn_m2 <= 0 or not -1 < poisson < .5
            or np.any(high <= low) or np.any(np.diff(levels) <= 0)
            or np.any(rects[:, :2] < low) or np.any(rects[:, 2:] > high)):
        raise ValueError('unsupported patch controls')
    axes = [_axis([*geometry['axisKnots'][d], *rects[:, [d, d+2]].ravel(), low[d], high[d]], pitch_m)
            for d in range(2)]
    mesh = MeshHex.init_tensor(*axes, _axis(levels, pitch_m))
    center = mesh.p[:, mesh.t].mean(axis=1)
    occupied = (center[2] > levels[1]) & (center[2] < levels[2])
    for a, b, c, d in rects:
        occupied |= ((center[0] > a) & (center[0] < c)
                     & (center[1] > b) & (center[1] < d))
    mesh = mesh.remove_elements(np.flatnonzero(~occupied)).remove_unused_nodes()
    basis = Basis(mesh, ElementVector(ElementHex1()), intorder=3)
    stiffness = asm(linear_elasticity(*lame_parameters(young_kn_m2, poisson)), basis).tocsc()
    area_l = np.prod(rects[:, 2:]-rects[:, :2], axis=1).sum()
    expected_volume = (np.prod(high-low)*(levels[2]-levels[1])
                       +area_l*(levels[1]-levels[0]+levels[3]-levels[2]))
    if not np.isclose(basis.dx.sum(), expected_volume, atol=1e-12, rtol=1e-11):
        raise ValueError('patch/stub union volume mismatch')
    return mesh, basis, stiffness


def _linear_weights(coordinate, knots):
    i = min(max(bisect_right(knots, coordinate)-1, 0), len(knots)-2)
    a, b = knots[i:i+2]
    if coordinate < a-1e-12 or coordinate > b+1e-12 or b <= a:
        raise ValueError('contour trace lies outside explicit common knots')
    t = (coordinate-a)/(b-a)
    return [(i, 1-t), (i+1, t)]


def contour_ports(mesh, basis, geometry):
    low, high = geometry['lowXY'], geometry['highXY']
    levels = geometry['levels'];mid = (levels[1]+levels[2])/2
    rects = np.asarray(geometry['rectangles'])
    areas = np.prod(rects[:, 2:]-rects[:, :2], axis=1)
    centroid = np.sum(areas[:, None]*(rects[:, :2]+rects[:, 2:])/2, axis=0)/areas.sum()
    ports = [{'id': f'wall/{end}/{axis}', 'originM': [*centroid, z], 'axis': axis}
             for end, z in [('lower', levels[0]), ('upper', levels[3])]
             for axis in ['tx', 'ty', 'tz', 'rx', 'ry', 'rz']]
    contour_points = sorted({*( (float(high[0]), float(y)) for y in geometry['axisKnots'][1]),
                             *( (float(x), float(high[1])) for x in geometry['axisKnots'][0])})
    starts = {}
    for i, point in enumerate(contour_points):
        starts[point] = len(ports)
        ports.extend({'id': f'floor/{i}/{axis}', 'originM': [*point, mid], 'axis': axis}
                     for axis in ['tx', 'ty', 'tz', 'rx', 'ry'])
    rows, cols, coefficients, boundary = [], [], [], set()
    def add(node, start, trace, scale=1.):
        for d, row in enumerate(trace):
            boundary.add(int(basis.nodal_dofs[d, node]))
            for j, value in enumerate(row):
                if value and scale:
                    rows.append(int(basis.nodal_dofs[d, node]));cols.append(start+j);coefficients.append(value*scale)
    for node, point in enumerate(mesh.p.T):
        end = next((i for i, z in enumerate([levels[0], levels[3]]) if abs(point[2]-z) < 1e-12), None)
        if end is not None:
            add(node, end*6, rigid_trace(point[:, None], [*centroid, [levels[0], levels[3]][end]])[0])
        elif levels[1]-1e-12 <= point[2] <= levels[2]+1e-12:
            zeta = point[2]-mid
            trace = [[1, 0, 0, 0, zeta], [0, 1, 0, -zeta, 0], [0, 0, 1, 0, 0]]
            if abs(point[0]-high[0]) < 1e-12:
                for j, weight in _linear_weights(point[1], geometry['axisKnots'][1]):
                    add(node, starts[(float(high[0]), float(geometry['axisKnots'][1][j]))], trace, weight)
            elif abs(point[1]-high[1]) < 1e-12:
                for j, weight in _linear_weights(point[0], geometry['axisKnots'][0]):
                    add(node, starts[(float(geometry['axisKnots'][0][j]), float(high[1]))], trace, weight)
    transform = coo_matrix((coefficients, (rows, cols)), shape=(basis.N, len(ports))).tocsc()
    if np.any(np.asarray(abs(transform).sum(axis=0)).ravel() == 0):
        raise ValueError('unattached contour port')
    return ports, transform, np.asarray(sorted(boundary))


def condense_patch(mesh, basis, stiffness, geometry, wall_unit_weight):
    if not np.isfinite(wall_unit_weight) or wall_unit_weight <= 0:
        raise ValueError('positive explicit wall unit weight required')
    ports, transform, boundary = contour_ports(mesh, basis, geometry)
    interior = np.setdiff1d(np.arange(basis.N), boundary)
    factor = splu(stiffness[interior][:, interior])
    displacement = transform.toarray()
    displacement[interior] = -factor.solve((stiffness @ transform)[interior].toarray())
    condensed = displacement.T @ (stiffness @ displacement)
    low, high = geometry['levels'][1:3]
    force = gravity_force(basis, lambda x: np.where((x[2] > low) & (x[2] < high),
                                                   geometry['slabUnitWeight'], wall_unit_weight))
    particular = np.zeros(basis.N);particular[interior] = factor.solve(force[interior])
    return {'ports': ports, 'stiffness': condensed, 'gravity': displacement.T @ force,
            'loadEnergyConstant': float(-.5*force @ particular), 'particular': particular,
            'displacement': displacement, 'bodyForce': force, 'interior': interior}


def rigid_port_modes(ports):
    modes = []
    for port in ports:
        axis = port['axis']
        if axis in ['tx', 'ty', 'tz']:
            modes.append(rigid_trace(np.asarray(port['originM'])[:, None], [0, 0, 0])[0][['tx','ty','tz'].index(axis)])
        else:
            modes.append(np.eye(6)[['rx', 'ry', 'rz'].index(axis)+3])
    return np.asarray(modes)
