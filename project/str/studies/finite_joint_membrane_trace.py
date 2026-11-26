"""Exact point traces composed through the unchanged native CST/band compiler.

A zero-measure kinematic descriptor retains one physical point, not a finite
rigid footprint. Numerical axes are introduced by partitioning existing source
rectangles into adjacent pieces with exactly the same material union. No fake
aperture, alternate element, added restraint or historical result is used.
"""
import copy
import math

from perforated_floor_condensation import compile_perforated_floor


def _finite(value):
    return type(value) in (int, float) and math.isfinite(value)


def compile_point_trace_floor(bodies, omissions, loops, corner_patches, law,
        max_pitch_mm, pressure_rows=(), boundary_receivers=(),
        numerical_backend='auto-fine-sparse-v1', retained_point_ports=(),
        extra_coordinates=((), ())):
    if (not isinstance(retained_point_ports, (list, tuple))
            or not isinstance(extra_coordinates, (list, tuple)) or len(extra_coordinates) != 2
            or any(not isinstance(a, (list, tuple)) or not all(_finite(v) for v in a)
                   for a in extra_coordinates)):
        raise ValueError('Explicit finite point traces and numerical coordinate arrays required')
    if not bodies or any(len(r) != 4 or not all(_finite(v) for v in r)
                         or r[2] <= r[0] or r[3] <= r[1] for r in bodies):
        raise ValueError('Actual positive source material rectangles required')
    ids = {p['id'] for p in corner_patches}
    if len(ids) != len(corner_patches):
        raise ValueError('Duplicate actual rigid-section port')
    points = {}
    point_patches = []
    for p in retained_point_ports:
        if (not isinstance(p, dict) or set(p) != {'id', 'originXYMm', 'node'}
                or not isinstance(p['id'], str) or not p['id'] or p['id'] in ids
                or not isinstance(p['node'], str) or not p['node']):
            raise ValueError('Unique stable physical point identity required')
        xy = p['originXYMm']
        if (not isinstance(xy, (list, tuple)) or len(xy) != 2
                or not all(_finite(v) for v in xy) or tuple(xy) in points):
            raise ValueError('Unique finite physical point XY required')
        x, y = xy
        if any(r[0]-1e-6 <= x <= r[2]+1e-6 and r[1]-1e-6 <= y <= r[3]+1e-6
               for patch in corner_patches for r in patch['rectangles']):
            raise ValueError('Physical point overlaps an existing finite rigid footprint')
        for r in boundary_receivers:
            along = r['axis']
            if (r['lo']-1e-6 <= xy[along] <= r['hi']+1e-6
                    and abs(xy[1-along]-r['datum']) <= r['width']/2+1e-6):
                raise ValueError('Point retention cannot override an actual finite beam receiver')
        ids.add(p['id'])
        points[tuple(xy)] = p
        point_patches.append({**copy.deepcopy(p), 'rectangles': [[x, y, x, y]]})
    partition = [list(r) for r in bodies]
    bounds = [min(r[0] for r in bodies), min(r[1] for r in bodies),
              max(r[2] for r in bodies), max(r[3] for r in bodies)]
    splits = []
    for axis in (0, 1):
        coordinates = sorted(set(extra_coordinates[axis]) | {p[axis] for p in points})
        for value in coordinates:
            if not bounds[axis] < value < bounds[axis+2]:
                continue  # Exactly the native bounded-coordinate policy.
            if any(value in (r[axis], r[axis+2]) for r in partition):
                continue
            index = next((j for j, r in enumerate(partition) if r[axis] < value < r[axis+2]), None)
            if index is None:
                raise ValueError('Numerical axis cannot be introduced without partitioning real material')
            old = partition[index]
            lo, hi = old[:], old[:]
            lo[axis+2], hi[axis] = value, value
            partition[index:index+1] = [lo, hi]
            splits.append({'axis': axis, 'coordinateMm': value,
                           'originalRectangleXYMm': old, 'adjacentPartitionsXYMm': [lo, hi]})
    result = compile_perforated_floor(partition, omissions, loops,
            [*corner_patches, *point_patches], law, max_pitch_mm,
            pressure_rows=pressure_rows, boundary_receivers=boundary_receivers,
            numerical_backend=numerical_backend)
    # Native footprint ownership has a1e-6mm incidence tolerance. It may select
    # the exact point, but must never merge a distinct neighbouring coordinate.
    for point in points:
        if any(any(v != point[a] and abs(v-point[a]) <= 1e-6
                   for v in result['coordinateColumns'][a]) for a in (0, 1)):
            raise ValueError('Native incidence tolerance would merge distinct physical point coordinates')
    triangles = result['meshTrianglesXYMm']
    vertices = {tuple(p) for triangle in triangles for p in triangle}
    participation = []
    for index, patch in enumerate(point_patches, len(corner_patches)):
        xy = tuple(patch['originXYMm'])
        on_band = any(abs(xy[1-r['axis']]-r['datum']) <= 1e-9
                      and r['lo'] <= xy[r['axis']] <= r['hi'] for r in loops)
        if xy not in vertices and not on_band:
            raise ValueError('Point has no actual membrane or band material work')
        matrix = result['condensedStiffnessKNPerMm']
        active = [a for a in range(3) if matrix[3*index+a][3*index+a] > 0]
        if 0 not in active or 1 not in active:
            raise ValueError('Retained physical point has no independent translation work')
        participation.append({'id': patch['id'], 'originXYMm': list(xy),
                              'activeCoordinates': active, 'addedRestraint': False})
    area = lambda rs: math.fsum((r[2]-r[0])*(r[3]-r[1]) for r in rs)
    residual = abs(area(partition)-area(bodies))
    if residual > 1e-6:
        raise ValueError('Source material partition lost physical area')
    return {**result, 'retainedPointParticipation': participation,
            'pointTraceComposition': {'schema': 'str-native-point-trace-composition/1',
                'nativeKernelUnchanged': True, 'zeroMeasureKinematicDescriptors': True,
                'physicalMaterialUnionUnchanged': True, 'bodyPartitionAreaSumResidualMm2': residual,
                'sourceBodyRectangleCount': len(bodies), 'partitionedBodyRectangleCount': len(partition),
                'numericalPartitions': splits, 'noNewPhysicalApertures': True,
                'noAddedRestraintOrStiffness': True}}
