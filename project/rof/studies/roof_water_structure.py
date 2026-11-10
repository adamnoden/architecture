"""Read-only recovery of the SAP-C1 collector comparison.

Uses the unchanged native kernel and the actual portal condensation. Added
point loads retain their consistent beam loads and local fixed-end actions.
N, mm and Nmm internally. The source independent heel envelopes are retained.
"""
from collections import defaultdict
from contextlib import redirect_stdout
from io import StringIO
from itertools import pairwise, product
from pathlib import Path
import hashlib
import json
import math
import sys
import runpy

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
D = ROOT / 'project/str/studies'
ARGS = sys.argv[:]
COURT_WIDTH = int(next((arg.split('=')[1] for arg in ARGS if arg.startswith('--court-width=')), '260'))
assert COURT_WIDTH in (220, 240, 260)
BODY_LOW, BODY_HIGH = 6000., 7400.


def weighted_sum(terms):
    weights, rows = zip(*terms)
    return [sum(weight*value for weight, value in zip(weights, column)) for column in zip(*rows)]


def linear_combination(weights, rows):
    return weighted_sum(list(zip(weights, rows)))


def matrix_vector(matrix, vector):
    return [sum(a*b for a, b in zip(row, vector)) for row in matrix]


def load_kernel(width):
    network = json.loads((D/'current-house-welded-network.json').read_text())
    outer = network['sections']['collector'].copy()
    court = outer.copy()
    b, h, t = width, court['H'], court['t']
    area = b*h-(b-2*t)*(h-2*t)
    inertia = (b*h**3-(b-2*t)*(h-2*t)**3)/12
    minor = (h*b**3-(h-2*t)*(b-2*t)**3)/12
    court.update(B=b, A=area, I=inertia, Iminor=minor, W=inertia/(h/2),
                 Wminor=minor/(b/2), lineG=area*78.5/1e6)
    court['MR'] = court['W']*(200/1.1)/1e6
    court['TR'] = 2*(b-t)*(h-t)*t*(200/1.1)/(math.sqrt(3)*1e6)
    sections = {'outer': outer, 'court': court}
    captured = {}
    sys.argv = [str(D/'current-house-roof-bracing.py'), '--check']
    with redirect_stdout(StringIO()):
        roof = runpy.run_path(str(D/'current-house-roof-bracing.py'),
                              init_globals={'collectorSections': sections})
        sys.argv = [str(D/'current-house-ring-return.py'), '--floor-clips', '--space-roof', '--check']
        ring = runpy.run_path(str(D/'current-house-ring-return.py'),
                              init_globals={'roofKernel': roof, 'collectorSections': sections,
                                            'modelObserver': lambda name, model: captured.__setitem__(name, model),
                                            'readOnly': True})
    if width == 220:
        assert ring['txt'] == (D/'current-house-ring-space.json').read_text()
    solver, props, springs = roof['build'](False, True)
    return {'p': roof, 'models': captured, 'section': outer, 'sections': sections,
            'solve': solver, 'props': props, 'springs': springs, 'mvec': ring['mvec'], 'ns': ring}


engine = load_kernel(COURT_WIDTH)
p, models, section = engine['p'], engine['models'], engine['section']
solve, props = engine['solve'], engine['props']
source_results = engine['ns']['results']
portal_path = D / 'reconciled-corner-portals.py'
with redirect_stdout(StringIO()):
    sap = runpy.run_path(str(portal_path), init_globals={'roofKernel': p, 'definitionsOnly': True})


def shape(length, x):
    t = x / length
    h = [1-3*t*t+2*t**3, length*(t-2*t*t+t**3),
         3*t*t-2*t**3, length*(-t*t+t**3)]
    slope = [(-6*t+6*t*t)/length, 1-4*t+3*t*t,
             (6*t-6*t*t)/length, -2*t+3*t*t]
    return h, slope


segments = []
segment_index = {}
for name, model in models.items():
    for ei, (left, right, length, axis) in enumerate(model['edges']):
        a, b = model['nodes'][left], model['nodes'][right]
        key = (name, ei)
        segment_index[key] = len(segments)
        segments.append({'key': key, 'a': a, 'b': b, 'length': length,
                         'axis': axis, 'normal': (0, 1) if axis == 0 else (-1, 0)})


def find_segment(name, point):
    for seg in segments:
        if seg['key'][0] != name:
            continue
        axis = seg['axis']
        if (seg['a'][1-axis] == point[1-axis] and
                seg['a'][axis] <= point[axis] <= seg['b'][axis]):
            return seg
    raise ValueError((name, point))


class Load:
    def __init__(self, label):
        self.label = label
        self.vector = [0.] * p['spaceSize']
        self.vertical = defaultdict(lambda: [0.] * 6)
        self.horizontal = defaultdict(lambda: [0.] * 6)
        self.points_v = defaultdict(list)
        self.points_h = defaultdict(list)
        self.placed = []

    def node(self, point, down, mx, my, fx, fy, yaw):
        for j, value in enumerate((down, mx, my)):
            self.vector[p['vDO'](point, j)] += value
        for j, value in enumerate((fx, fy, yaw)):
            self.vector[p['dof'](point, j)] += value

    def place(self, name, face, radial, station, down=0., fx=0., fy=0., z=6600., tag='', root_station=None):
        ring = 'outer' if name == 'outer' else 'inner'
        normal = p['A'] if name == 'outer' else p['C']
        cuts = p['sides'][face, ring]
        source = p['pt'](face, -radial, station)
        root_at = station if root_station is None else root_station
        root = p['pt'](face, normal, max(cuts[0], min(cuts[-1], root_at)))
        dx, dy = (source[j]-root[j] for j in (0, 1))
        # Generalised rotations are slopeX = physical Ry and slopeY = -Rx.
        mx = down*dx + fx*(z-6600.)
        my = down*dy + fy*(z-6600.)
        yaw = dx*fy-dy*fx
        self.placed.append({'tag': tag, 'ring': name, 'face': face, 'radial': radial,
                            'station': station, 'rootStation': root_station,
                            'source': [*source, z], 'root': root,
                            'downN': down, 'FxN': fx, 'FyN': fy,
                            'MxGradientNmm': mx, 'MyGradientNmm': my, 'yawNmm': yaw})
        if root in p['nodes']:
            self.node(root, down, mx, my, fx, fy, yaw)
            return
        seg = find_segment(name, root)
        key, a, b, length, axis = (seg[k] for k in ('key', 'a', 'b', 'length', 'axis'))
        x = root[axis]-a[axis]
        t = x/length
        h, slope = shape(length, x)
        parallel, torque = ((mx, my) if axis == 0 else (my, mx))
        vv = [down*u+parallel*v for u, v in zip(h, slope)] + [torque*(1-t), torque*t]
        normal_force = fx*seg['normal'][0]+fy*seg['normal'][1]
        axial = fx if axis == 0 else fy
        hh = [normal_force*u+yaw*v for u, v in zip(h, slope)] + [axial*(1-t), axial*t]
        for point, offset, side in ((a, 0, 0), (b, 2, 1)):
            rotations = [0., 0.]
            rotations[axis] = vv[offset+1]
            rotations[1-axis] = vv[4+side]
            forces = [seg['normal'][j]*hh[offset] for j in (0, 1)]
            forces[axis] += hh[4+side]
            self.node(point, vv[offset], *rotations, *forces, hh[offset+1])
        self.vertical[key] = [a+b for a, b in zip(self.vertical[key], vv)]
        self.horizontal[key] = [a+b for a, b in zip(self.horizontal[key], hh)]
        self.points_v[key].append((x, down, parallel, torque))
        self.points_h[key].append((x, normal_force, yaw, axial))

    def local_normal_displacement(self, seg, x):
        key = seg['key']
        force, moment = self.horizontal[key][:2]
        result = moment*x*x/2-force*x**3/6
        for at, transverse, yaw, _ in self.points_h[key]:
            if at < x:
                result += transverse*(x-at)**3/6-yaw*(x-at)**2/2
        return result/(p['Es']*models[key[0]]['section']['Iminor'])


print('Native model and SAP-C1 definitions loaded.', flush=True)
C, source_bg, host_units, full_backgrounds, source_lead_bg, source_strip_bg, roof_data = sap['house_interfaces']()
lead_d, strip_d, _ = sap['slate']['origins'](p, solve)
screen = [[a-b for a, b in zip(row, strip_d)] for row in full_backgrounds]

interface_vectors = []
interface_points = []
interface_descriptions = []
host_loads = []
for opening in sap['ground']:
    face = sap['faces'].index(opening['side'])
    for make in (sap['floor_vector'], sap['ring_vector']):
        for x in sap['axes']:
            terms, where = make(opening, x)
            vector = [0.] * p['spaceSize']
            for i, value in terms:
                vector[i] += value
            interface_vectors.append(vector)
            interface_descriptions.append({'opening': [opening['side'], opening['new']],
                                           'level': 'floor' if len(where) == 3 else 'roof',
                                           'xy': where[0] if len(where) == 3 else p['pt'](face, p['A'], where[3])})
            point = None
            load = Load('portal interface')
            if len(where) == 4:
                _, _, _, station = where
                root = p['pt'](face, p['A'], station)
                seg = find_segment('outer', root)
                normal = (0, 1) if face == 0 else (-1, 0) if face == 1 else (0, -1) if face == 2 else (1, 0)
                load.place('outer', face, -p['A'], station, fx=normal[0], fy=normal[1])
                assert max(abs(a-b) for a, b in zip(load.vector, vector)) < 1e-9
                point = (seg, root[seg['axis']]-seg['a'][seg['axis']], normal)
            interface_points.append(point)
            host_loads.append(load)


def interface_values(displacement, load=None):
    values = matrix_vector(interface_vectors, displacement)
    if load is not None:
        for i, point in enumerate(interface_points):
            if point is not None:
                seg, x, normal = point
                orientation = sum(a*b for a, b in zip(normal, seg['normal']))
                values[i] += orientation*load.local_normal_displacement(seg, x)
    return values


# Check the canonical added local flexibility against direct fixed-end recovery.
interface_error = 0.
for i, load in enumerate(host_loads):
    if interface_points[i] is None:
        continue
    recovered = interface_values(host_units[i], load)
    for j, point in enumerate(interface_points):
        if point is not None:
            interface_error = max(interface_error, abs(recovered[j]-C[j][i]))
assert interface_error < 1e-9, interface_error

# Actual MAT 316L specials and independent lower valley beds, at their source origins.
mat_roof = json.loads((ROOT/'project/mat/studies/whole-envelope.json').read_text())['roof']
special_vector = [0.] * p['spaceSize']
mid = (p['A']+p['C'])/2
valley_length = mat_roof['valleyLength']
fraction = (valley_length/2+100)/(valley_length+250)*(4525-mid)/(p['C']-mid)
mass = (mat_roof['lowerTraysKg']+mat_roof['steelSupportBedsKg'])/4
for face in range(4):
    heel, crown = p['pt'](face, p['C'], p['C']), p['pt'](face, mid, mid)
    special_vector[p['vDO'](heel, 0)] += fraction*mass*9.81
    special_vector[p['highD'](crown, 2)] -= (1-fraction)*mass*9.81
special_d = weighted_sum([(mat_roof['steelSpecialsKg']/mat_roof['leadReferenceKg'], lead_d),
                          (1., solve(special_vector))])
special_sum = sum(40*special_d[p['vDO'](point, 0)] for point in p['upperSupports'])
assert abs(special_sum-(mat_roof['steelSpecialsKg']+mass*4)*.00981) < 1e-6

wet = Load('new goods, blocked-water gravity')
dry = Load('new goods, dry gravity')
circuits = [('outer primary', 'outer', 345, 350*180/1000, 50),
            ('outer lower', 'outer', 397.5, 545*175/1000, 50),
            ('inner primary', 'court', -4537.5, 375*160/1000, 40),
            ('inner lower', 'court', -4562.5, 475*150/1000, 40)]
for tag, kind, radial, water_kg_m, dry_kg_m in circuits:
    length = 12000+2*radial
    count = 16 if kind == 'outer' else math.ceil(length/1200)
    for face in range(4):
        for j in range(count):
            station = -radial+length*(j+.5)/count
            wet.place(kind, face, radial, station,
                      down=(1.5*water_kg_m+1.35*dry_kg_m)*9.81*length/1000/count, tag=tag)
            dry.place(kind, face, radial, station,
                      down=1.35*dry_kg_m*9.81*length/1000/count, tag=tag)
heads = [(0, 11150, 'south normal'), (0, 11750, 'south relief'),
         (2, 12000-9025, 'north normal'), (2, 12000-11750, 'north relief')]
leader_locations = [('outer', face, 1130, station, tag) for face, station, tag in heads]
leader_locations += [('court', 0, -4500, 4500, 'inner SW normal'),
                     ('court', 0, -4500, 7500, 'inner SE relief')]
leader_dry_kg = math.pi/4*(.154**2-.150**2)*8.4*8940
leader_water_kg = math.pi/4*.150**2*8.4*1000
for kind, face, radial, station, tag in leader_locations:
    wet.place(kind, face, radial, station,
              down=(1.35*(75+leader_dry_kg)+1.5*(40+leader_water_kg))*9.81, tag=tag+' head and leader')
    dry.place(kind, face, radial, station,
              down=1.35*(75+leader_dry_kg)*9.81, tag=tag+' head and leader')

wind_vertical = Load('additional vertical projection at 2.25 kPa, positive down')
wind_areas = []


def annulus(name, q_from, q_to, root_radial, tag):
    centre, half = (q_from+q_to)/2, (q_to-q_from)/2
    area = 0.
    for q, weight in ((centre-half*math.sqrt(.6), 5/9), (centre, 8/9),
                      (centre+half*math.sqrt(.6), 5/9)):
        length = 12000-2*q
        root_length = 12000+2*root_radial
        count = 16 if name == 'outer' else math.ceil(root_length/1200)
        for face in range(4):
            for j in range(count):
                cell = length/count*half*weight
                station = q+length*(j+.5)/count
                root_station = -root_radial+root_length*(j+.5)/count
                wind_vertical.place(name, face, -q, station, down=2.25*cell/1000, tag=tag,
                                    root_station=root_station)
                area += cell/1e6
    wind_areas.append((tag, area))


annulus('outer', -520, -200, 345, 'primary outside old 200 overhang')
annulus('outer', -670, -520, 397.5, 'lower outside primary')
annulus('court', 4525, 4800, -4537.5, 'fixed cap and primary within old 2950 sky')
for face, station, tag in heads:
    start = 520 if tag.endswith('normal') else 670
    area = .250*(1260-start)/1000
    wind_vertical.place('outer', face, (1260+start)/2, station,
                        down=2.25*area*1000, tag=tag+' head and spout')
    wind_areas.append((tag, area))
    if start == 520:
        shadow = .250*.150
        roots = [-397.5+(12000+795)*(j+.5)/16 for j in range(16)]
        nearest_root = min(roots, key=lambda value: abs(value-station))
        wind_vertical.place('outer', face, (520+670)/2, station,
                            down=-2.25*shadow*1000, tag=tag+' lower shadow deduction',
                            root_station=nearest_root)
        wind_areas.append((tag+' lower shadow deduction', -shadow))
        additional_catch = (.450-.250)*.260
        wind_vertical.place('outer', face, 1130, station, down=2.25*additional_catch*1000,
                            tag=tag+' wider high-level catch')
        wind_areas.append((tag+' wider high-level catch', additional_catch))
wind_area = sum(v for _, v in wind_areas)
assert abs(wind_area-27.8321) < 1e-9


def extra_horizontal(programme, body_height, include_bodies=True):
    load = Load('additional horizontal goods pressure')
    for axis, code in enumerate(programme):
        if not code:
            continue
        sign = 1 if code < 4 else -1
        face = (3 if sign == 1 else 1) if axis == 0 else (0 if sign == 1 else 2)
        mode = (code-1) % 3
        # Added projected side strips beyond the old +/-200 facade rectangle.
        # A deliberately enlarged1400-high envelope contains the complete
        # gutter, carrier, apron and head bodies, excluding the pipe leaders.
        for station in ((-435, 12435) if include_bodies else ()):
            if mode and ((station < 6000) != (mode == 1)):
                continue
            forces = [0., 0.]
            forces[axis] = sign*2.25*.470*(BODY_HIGH-BODY_LOW)
            load.place('outer', face, 670, station, fx=forces[0], fy=forces[1],
                       z=body_height, tag='body beyond old facade width')
        # Charge the complete8.4m wind envelope to the roof as an adverse
        # collector comparison. The actual top1.5m is roof tributary. Remaining
        #6.9m requires its separately recorded facade/floor support receipt.
        # No shadowing or load reduction from those clamps is credited here.
        for kind, head_face, radial, station, tag in leader_locations:
            xy = p['pt'](head_face, -radial, station)
            projected = (xy[0], xy[1], 12000-xy[0], 12000-xy[1])[face]
            if mode and ((projected < 6000) != (mode == 1)):
                continue
            forces = [0., 0.]
            forces[axis] = sign*2.25*.250*8.4*1000
            elevation = 6860. if tag == 'inner SW normal' else 6600.
            load.place(kind, head_face, radial, station, fx=forces[0], fy=forces[1],
                       z=elevation, tag=tag+' complete leader wind comparison')
            # Include the head/spout beyond the 670 goods edge. Full bounding
            # height and no inter-head shadow provide an adverse comparison.
            if axis == 0 and kind == 'outer' and include_bodies:
                forces[axis] = sign*2.25*.590*(BODY_HIGH-BODY_LOW)
                load.place('outer', head_face, (670+1260)/2, station,
                           fx=forces[0], fy=forces[1], z=body_height,
                           tag=tag+' head outside 670 envelope')
    return load


horizontal_cases = {programme: [extra_horizontal(programme, z) for z in (BODY_LOW, BODY_HIGH)]
                    + [extra_horizontal(programme, 6600, False)]
                    for programme in {tuple(state[0]) for state in p['space']}}

# The 450-wide normal catch has at most 0.50625 kN normal-face pressure.
# Its centroid can lie 225 mm either side of the leader axis. Apply the
# rounded 0.114 kNm pure yaw through equal/opposite forces at the actual
# head root. The complete leader envelope already contains its net force.
centroid_loads = []
centroid_stations = []
for face, station, tag in heads:
    if not tag.endswith('normal'):
        continue
    load = Load(tag+' independent catch centroid couple')
    for side in (-1, 1):
        load.place('outer', face, 1130, station+side*225,
                   fy=side*.114e6/450, root_station=station, tag=tag)
    centroid_loads.append(load)
    centroid_stations.append(p['pt'](face, -1130, station))
centroid_programmes = {}
for programme in horizontal_cases:
    code = programme[1]
    active = []
    if code:
        mode = (code-1) % 3
        for index, point in enumerate(centroid_stations):
            along = point[0] if code < 4 else 12000-point[0]
            if not mode or ((along < 6000) == (mode == 1)):
                active.append(index)
    centroid_programmes[programme] = active


def body_specs(programme):
    """Independent exposed panels. Any actual pressure centroid lies inside
    the four extreme source points, with force from zero to the full bound.
    """
    panels = []
    for axis, code in enumerate(programme):
        if not code:
            continue
        sign, mode = (1 if code < 4 else -1), (code-1) % 3
        face = (3 if sign == 1 else 1) if axis == 0 else (0 if sign == 1 else 2)
        for ends in ((-670., -200.), (12200., 12670.)):
            if mode and (((sum(ends)/2) < 6000) != (mode == 1)):
                continue
            vertices = tuple((face, 670., along, z) for along in ends for z in (BODY_LOW, BODY_HIGH))
            panels.append((axis, sign, .470*(BODY_HIGH-BODY_LOW)/1000, vertices))
        if axis == 0:
            for head_face, station, tag in heads:
                xy = p['pt'](head_face, -1130, station)
                projected = (xy[0], xy[1], 12000-xy[0], 12000-xy[1])[face]
                if mode and ((projected < 6000) != (mode == 1)):
                    continue
                vertices = tuple((head_face, radial, station, z)
                                 for radial in (670., 1260.) for z in (BODY_LOW, BODY_HIGH))
                panels.append((axis, sign, .590*(BODY_HIGH-BODY_LOW)/1000, vertices))
    return panels


panel_specs = {programme: body_specs(programme) for programme in horizontal_cases}
panel_loads = {}
for spec in {spec for panels in panel_specs.values() for spec in panels}:
    axis, sign, area, vertices = spec
    rows = []
    for face, radial, station, z in vertices:
        load = Load('extreme horizontal body source')
        forces = [0., 0.]
        forces[axis] = sign*2.25*area*1000
        load.place('outer', face, radial, station, fx=forces[0], fy=forces[1], z=z)
        rows.append(load)
    panel_loads[spec] = rows
all_loads = [wet, dry, wind_vertical, *host_loads,
             *centroid_loads,
             *(load for pair in horizontal_cases.values() for load in pair),
             *(load for rows in panel_loads.values() for load in rows)]

points = []
for seg in segments:
    locations = {0., seg['length']}
    for load in all_loads:
        locations.update(q[0] for q in load.points_v[seg['key']])
        locations.update(q[0] for q in load.points_h[seg['key']])
    for x in sorted(locations):
        for side in (False, True):
            if x == 0 and side is False or x == seg['length'] and side is True:
                continue
            points.append((seg, x, side))


def vertical_end(seg, displacement):
    model = models[seg['key'][0]]
    do, k, _ = model['local'][seg['key'][1]]
    values = []
    for term in do:
        node, axis = divmod(term, 3)
        values.append(displacement[p['vDO'](model['nodes'][node], axis)])
    return engine['mvec'](k, values)


def horizontal_end(seg, displacement):
    a, b, length, axis = (seg[k] for k in ('a', 'b', 'length', 'axis'))
    normal = seg['normal']
    member_section = models[seg['key'][0]]['section']
    values = [sum(normal[j]*displacement[p['dof'](a, j)] for j in (0, 1)),
              displacement[p['dof'](a, 2)],
              sum(normal[j]*displacement[p['dof'](b, j)] for j in (0, 1)),
              displacement[p['dof'](b, 2)]]
    matrix = [[12, 6*length, -12, 6*length],
              [6*length, 4*length**2, -6*length, 2*length**2],
              [-12, -6*length, 12, -6*length],
              [6*length, 2*length**2, -6*length, 4*length**2]]
    actions = [sum(k*v for k, v in zip(row, values))*p['Es']*member_section['Iminor']/length**3
               for row in matrix]
    axial = p['Es']*member_section['A']/length*(displacement[p['dof'](b, axis)]-displacement[p['dof'](a, axis)])
    return [*actions, -axial, axial]


def features(displacement, load=None):
    ends = {}
    for seg in segments:
        key = seg['key']
        vertical = vertical_end(seg, displacement)
        horizontal = horizontal_end(seg, displacement)
        if load is not None:
            vertical = [a-b for a, b in zip(vertical, load.vertical[key])]
            horizontal = [a-b for a, b in zip(horizontal, load.horizontal[key])]
        ends[key] = (vertical, horizontal)
        if load is not None:
            pv, ph, length = load.points_v[key], load.points_h[key], seg['length']
            assert abs(vertical[0]+vertical[2]+sum(v[1] for v in pv)) < .03
            assert abs(vertical[4]+vertical[5]+sum(v[3] for v in pv)) < .3
            assert abs(vertical[1]+vertical[3]+vertical[2]*length+sum(v[0]*v[1]+v[2] for v in pv)) < .3
            assert abs(horizontal[0]+horizontal[2]+sum(v[1] for v in ph)) < .03
            assert abs(horizontal[1]+horizontal[3]+horizontal[2]*length+sum(v[0]*v[1]+v[2] for v in ph)) < .3
            assert abs(horizontal[4]+horizontal[5]+sum(v[3] for v in ph)) < .03
    rows = []
    for seg, x, right in points:
        key = seg['key']
        v, h = ends[key]
        pv = [] if load is None else [q for q in load.points_v[key] if q[0] < x or right and q[0] <= x]
        ph = [] if load is None else [q for q in load.points_h[key] if q[0] < x or right and q[0] <= x]
        rows.append([(v[1]-v[0]*x-sum(f*(x-a)-m for a, f, m, t in pv))/1e6,
                     (v[4]+sum(t for a, f, m, t in pv))/1e6,
                     (-v[0]-sum(f for a, f, m, t in pv))/1000,
                     (h[1]-h[0]*x-sum(f*(x-a)-m for a, f, m, n in ph))/1e6,
                     (-h[4]-sum(n for a, f, m, n in ph))/1000,
                     (-h[0]-sum(f for a, f, m, n in ph))/1000])
    return [value for row in rows for value in row]


balance_errors = []


def solve_load(load):
    displacement = solve(load.vector)
    total = sum(v['downN'] for v in load.placed)/1000
    recovered = sum(40*displacement[p['vDO'](point, 0)] for point in p['upperSupports'])
    assert abs(recovered-total) < 1e-6, (load.label, total, recovered)
    column = {}
    for point, (stiffness, terms) in engine['springs'].items():
        local = [p['times'](term, displacement) for term in terms]
        column[point] = [sum(a*b for a, b in zip(row, local)) for row in stiffness]
    given_horizontal = [sum(v[key] for v in load.placed)/1000 for key in ('FxN', 'FyN')]
    received_horizontal = [sum(v[j]+v[j+2] for v in column.values())/1000 for j in (0, 1)]
    moment_errors = []
    for axis, key in enumerate(('FxN', 'FyN')):
        given = sum(v['downN']*(v['source'][axis]-6000)+v[key]*(v['source'][2]-p['base'])
                    for v in load.placed)/1e6
        received = sum(40*displacement[p['vDO'](point, 0)]*(point[axis]-6000)/1000
                       for point in p['upperSupports'])
        received += sum(v[axis]*(p['ff']-p['base'])+v[axis+2]*(p['rr']-p['base'])
                        for v in column.values())/1e6
        moment_errors.append(abs(given-received))
    given_yaw = sum((v['source'][0]-6000)*v['FyN']-(v['source'][1]-6000)*v['FxN']
                    for v in load.placed)/1e6
    received_yaw = sum((point[0]-6000)*(v[1]+v[3])-(point[1]-6000)*(v[0]+v[2])
                       for point, v in column.items())/1e6
    error = max(abs(recovered-total), *(abs(a-b) for a, b in zip(given_horizontal, received_horizontal)),
                *moment_errors, abs(given_yaw-received_yaw))
    assert error < 1e-5, (load.label, error, moment_errors)
    balance_errors.append(error)
    return displacement, interface_values(displacement, load), features(displacement, load)


wet_u, wet_bg, wet_f = solve_load(wet)
dry_u, dry_bg, dry_f = solve_load(dry)
water_responses = []
for wet_point, dry_point in zip(wet.placed, dry.placed):
    assert wet_point['source'] == dry_point['source'] and wet_point['root'] == dry_point['root']
    force = wet_point['downN']-dry_point['downN']
    assert force >= 0
    load = Load(wet_point['tag']+' independently blocked water')
    load.place(wet_point['ring'], wet_point['face'], wet_point['radial'], wet_point['station'],
               down=force, z=wet_point['source'][2], tag=wet_point['tag'], root_station=wet_point['rootStation'])
    water_responses.append((load, solve_load(load)))
water_sum = weighted_sum([(1., row[1][0]) for row in water_responses])
water_balance = max(abs(a-b+c) for a, b, c in zip(water_sum, wet_u, dry_u))
assert water_balance < 1e-8, water_balance
vertical_u, vertical_bg, vertical_f = solve_load(wind_vertical)
horizontal = {key: [solve_load(load) for load in pair] for key, pair in horizontal_cases.items()}
panel_responses = {key: [solve_load(load) for load in rows] for key, rows in panel_loads.items()}
centroid_responses = [solve_load(load) for load in centroid_loads]
host_f = [features(u, load) for u, load in zip(host_units, host_loads)]
screen_f = [features(u) for u in screen]
strip_f, special_f = features(strip_d), features(special_d)
strip_bg, special_bg = interface_values(strip_d), interface_values(special_d)
support_points = sorted(p['upperSupports'])
support_indices = [p['vDO'](point, 0) for point in support_points]
host_reactions = [[row[index]*40 for index in support_indices] for row in host_units]
screen_reactions = [[row[index]*40 for index in support_indices] for row in screen]


def support_reactions(displacement):
    return [displacement[index]*40 for index in support_indices]


def stripped_bounds(model):
    bounds = defaultdict(lambda: [0., 0.])
    for label, loads, low, high in model['cases']:
        if label == 'ringG' or label.startswith('bracemass'):
            continue
        if label.startswith('F'):
            high = 0.
        solution = model['solve']([loads[i] for i in model['free']])
        displacement = [0.] * len(loads)
        for i, dof in enumerate(model['free']):
            displacement[dof] = solution[i]
        for dof in model['fixed']:
            value = 40*displacement[dof]
            bounds['head', dof//3][0] += min(value*low, value*high)
            bounds['head', dof//3][1] += max(value*low, value*high)
        for ei, (dofs, stiffness, _) in enumerate(model['local']):
            actions = engine['mvec'](stiffness, [displacement[i] for i in dofs])
            for end in (0, 1):
                for tag, at, divisor in (('M', 1+2*end, 1e6), ('T', 4+end, 1e6), ('V', 2*end, 1000)):
                    value = actions[at]/divisor
                    bounds[tag, ei, end][0] += min(value*low, value*high)
                    bounds[tag, ei, end][1] += max(value*low, value*high)
    return bounds


up_bounds = {name: stripped_bounds(model) for name, model in models.items()}
support_bounds = {}
for stripped in (False, True):
    low, high = [], []
    for point in support_points:
        name = 'court' if all(p['C'] <= v <= p['E'] for v in point) else 'outer'
        model = models[name]
        node = model['nodes'].index(point)
        bounds = up_bounds[name] if stripped else model['bounds']
        lo, hi = bounds['head', node]
        low.append(lo)
        high.append(hi)
    support_bounds[stripped] = (low, high)


def feature_bounds(stripped=False):
    lower, upper, self_weight = [], [], []
    for seg, x, _ in points:
        name, ei = seg['key']
        bounds = up_bounds[name] if stripped else models[name]['bounds']
        t = x/seg['length']
        intervals = []
        for tag in ('M', 'T', 'V'):
            lo, hi = bounds[tag, ei, 0]
            right_lo, right_hi = bounds[tag, ei, 1]
            value = ((1-t)*lo-t*right_hi, (1-t)*hi-t*right_lo)
            if tag == 'V':
                value = (-value[1], -value[0])
            intervals.append(value)
        lower.append([v[0] for v in intervals])
        upper.append([v[1] for v in intervals])
        self_weight.append(0. if stripped else 1.35*models[name]['section']['lineG']*(seg['length']/1000)**2/8)
    return [v for row in lower for v in row], [v for row in upper for v in row], self_weight


full_bounds = feature_bounds()
empty_bounds = feature_bounds(True)
member_indices = {name: [i for i, (seg, _, _) in enumerate(points) if seg['key'][0] == name]
                  for name in models}
section_at_points = {key: [models[seg['key'][0]]['section'][key] for seg, _, _ in points]
                     for key in ('B', 'H', 't', 'W', 'Wminor', 'A')}
zero_features = [0.] * len(wet_f)
zero_supports = [0.] * len(support_points)


def bounded_components(index, values, bounds, uncertainty=None):
    lower, upper, self_weight = bounds
    lo, hi = (zero_features, zero_features) if uncertainty is None else uncertainty
    k, j = 6*index, 3*index
    vertical = [max(abs(values[k+a]+lower[j+a]+lo[k+a]),
                    abs(values[k+a]+upper[j+a]+hi[k+a])) for a in range(3)]
    horizontal = [max(abs(values[k+a]+lo[k+a]), abs(values[k+a]+hi[k+a])) for a in range(3, 6)]
    vertical[0] += self_weight[index]
    return vertical, horizontal


def interaction(values, bounds, uncertainty=None):
    result = []
    for i in range(len(points)):
        (moment, torque, shear), (yaw, axial, plan_shear) = bounded_components(i, values, bounds, uncertainty)
        b, h, thickness = (section_at_points[key][i] for key in ('B', 'H', 't'))
        sigma = (moment*1e6/section_at_points['W'][i]+yaw*1e6/section_at_points['Wminor'][i]
                 + axial*1000/section_at_points['A'][i])
        tau = (torque*1e6/(2*(b-thickness)*(h-thickness)*thickness)
               + shear*1000/(2*thickness*(h-2*thickness))
               + plan_shear*1000/(2*thickness*(b-2*thickness)))
        result.append(math.hypot(sigma, math.sqrt(3)*tau)/(200/1.1))
    return result


def bounded_actions(index, values, bounds, uncertainty=None):
    v, h = bounded_components(index, values, bounds, uncertainty)
    return {'M_kNm': v[0], 'T_kNm': v[1], 'V_kN': v[2],
            'yaw_kNm': h[0], 'N_kN': h[1], 'planShear_kN': h[2]}


# Native end parity checks the complete stress-recovery sign convention.
parity = 0.
for wi, state in enumerate(p['space']):
    vals = interaction(features(state[1]), full_bounds)
    for index, (seg, x, side) in enumerate(points):
        if x not in (0., seg['length']):
            continue
        name, ei = seg['key']
        original = source_results[name]['segments'][ei]
        original.setdefault('privateRecovered', 0.)
        original['privateRecovered'] = max(original['privateRecovered'], vals[index])
for name in models:
    for row in source_results[name]['segments']:
        parity = max(parity, abs(row['privateRecovered']-row['oneWindInteraction']))
assert parity < 1e-6, parity
frozen_parity = None
if COURT_WIDTH == 220:
    frozen = json.loads((D/'current-house-ring-space.json').read_text())['rings']
    frozen_parity = 0.
    for name in models:
        for actual, previous in zip(source_results[name]['segments'], frozen[name]['segments']):
            for key in ('M', 'T', 'V', 'oneWindInteraction'):
                frozen_parity = max(frozen_parity, abs(actual[key]-previous[key]))
    assert frozen_parity < 1e-8, frozen_parity

print('Loads and local fixed-end recovery checked. Building portal response cases.', flush=True)


def portal_model(crack):
    portal = sap['Portal'](crack)
    units = []
    for ground, upper in zip(sap['ground'], sap['upstairs']):
        pressure, old = portal.pressure(ground, upper)
        responses = [portal.result(load) for load in
                     (portal.gravity_load(ground), pressure, portal.guard_point(0), portal.guard_point(1))]
        units.append((responses, old))
    Ct = [[value+(1/2000. if i == j else 0.) for j, value in enumerate(row)] for i, row in enumerate(C)]
    stiffness = [[portal.K[i%4][j%4] if i//4 == j//4 else 0. for j in range(32)] for i in range(32)]
    compat = [[float(i == j)+sum(Ct[i][4*(j//4)+k]*portal.K[k][j%4] for k in range(4))
               for j in range(32)] for i in range(32)]
    coupled_solve = sap['factor'](compat)

    def coupled(background, weights):
        fixed, removed = [], []
        for (responses, old), scales in zip(units, weights):
            fixed.extend(sum(weight*response[1][6+i] for weight, response in zip(scales, responses))
                         for i in range(4))
            removed.extend(value*scales[1] for value in old)
        d = coupled_solve(weighted_sum([(1., background), (-1., matrix_vector(Ct, fixed)),
                                       (-1., matrix_vector(C, removed))]))
        actions = weighted_sum([(1., fixed), (1., matrix_vector(stiffness, d)), (1., removed)])
        return d, actions

    guards = []
    for target in range(8):
        for side in (0, 1):
            weights = [[0., 0., 0., 0.] for _ in range(8)]
            weights[target][2+side] = 1.
            d, actions = coupled([0.]*32, weights)
            negative = [-value for value in actions]
            guards.append((target, side, d, actions, linear_combination(negative, host_f),
                           linear_combination(negative, host_reactions)))
    return portal, units, coupled, guards


def location(index):
    seg, x, side = points[index]
    t = x/seg['length']
    return {'ring': seg['key'][0], 'segment': [seg['a'], seg['b']],
            'point': [a+t*(b-a) for a, b in zip(seg['a'], seg['b'])],
            'side': 'right' if side else 'left'}


def run_cases():
    # Independent water bounds contain all-wet, all-dry and every partial-fill state.
    # Independent panel bounds contain both common-centroid body cases.
    modes = [('partial water down', dry_bg, dry_f, 1., 1., False),
             ('partial water up', dry_bg, dry_f, -1., 1., False),
             ('stripped up', [0.]*32, zero_features, -1., 0., True)]
    results = {}
    source_portal_parity = {}
    portal_comparison = {}
    station_ranges = [{'xy': point, 'rangeKN': [math.inf, -math.inf], 'controllingCases': [None, None]}
                      for point in support_points]
    tie_ranges = [{**description, 'rangeKN': [math.inf, -math.inf], 'controllingCases': [None, None]}
                  for description in interface_descriptions]
    for crack in (.2, .35):
        portal, units, coupled, guards = portal_model(crack)
        panel_bounds = {}
        panel_reaction_bounds = {}
        panel_tie_bounds = {}
        zero_weights = [[0., 0., 0., 0.] for _ in range(8)]
        for spec, responses in panel_responses.items():
            values = [zero_features]
            reactions = [zero_supports]
            ties = [[0.]*32]
            for displacement, background, value in responses:
                _, actions = coupled(background, zero_weights)
                values.append(weighted_sum([(1., value), (-1., linear_combination(actions, host_f))]))
                reactions.append(weighted_sum([(1., support_reactions(displacement)),
                                               (-1., linear_combination(actions, host_reactions))]))
                ties.append([value/1000 for value in actions])
            panel_bounds[spec] = ([min(column) for column in zip(*values)], [max(column) for column in zip(*values)])
            panel_reaction_bounds[spec] = ([min(column) for column in zip(*reactions)],
                                           [max(column) for column in zip(*reactions)])
            panel_tie_bounds[spec] = ([min(column) for column in zip(*ties)], [max(column) for column in zip(*ties)])
        body_bounds = {programme: (weighted_sum([(1., panel_bounds[spec][0]) for spec in specs]),
                                   weighted_sum([(1., panel_bounds[spec][1]) for spec in specs]))
                       for programme, specs in panel_specs.items()}
        body_reaction_bounds = {programme: (weighted_sum([(1., panel_reaction_bounds[spec][0]) for spec in specs]),
                                            weighted_sum([(1., panel_reaction_bounds[spec][1]) for spec in specs]))
                                for programme, specs in panel_specs.items()}
        body_tie_bounds = {programme: (weighted_sum([(1., panel_tie_bounds[spec][0]) for spec in specs]),
                                      weighted_sum([(1., panel_tie_bounds[spec][1]) for spec in specs]))
                           for programme, specs in panel_specs.items()}
        water_low, water_high = zero_features[:], zero_features[:]
        water_reaction_low, water_reaction_high = zero_supports[:], zero_supports[:]
        water_tie_low, water_tie_high = [0.]*32, [0.]*32
        for _, (displacement, background, value) in water_responses:
            _, actions = coupled(background, zero_weights)
            response = weighted_sum([(1., value), (-1., linear_combination(actions, host_f))])
            reactions = weighted_sum([(1., support_reactions(displacement)),
                                      (-1., linear_combination(actions, host_reactions))])
            water_low = [a+min(0., b) for a, b in zip(water_low, response)]
            water_high = [a+max(0., b) for a, b in zip(water_high, response)]
            water_reaction_low = [a+min(0., b) for a, b in zip(water_reaction_low, reactions)]
            water_reaction_high = [a+max(0., b) for a, b in zip(water_reaction_high, reactions)]
            water_tie_low = [a+min(0., b/1000) for a, b in zip(water_tie_low, actions)]
            water_tie_high = [a+max(0., b/1000) for a, b in zip(water_tie_high, actions)]
        centroid_fields = []
        for displacement, background, value in centroid_responses:
            _, actions = coupled(background, zero_weights)
            force = weighted_sum([(1., value), (-1., linear_combination(actions, host_f))])
            reactions = weighted_sum([(1., support_reactions(displacement)),
                                      (-1., linear_combination(actions, host_reactions))])
            centroid_fields.append(([abs(v) for v in force], [abs(v) for v in reactions],
                                    [abs(v/1000) for v in actions]))
        for programme, indices in centroid_programmes.items():
            for index in indices:
                for table, delta in zip((body_bounds, body_reaction_bounds, body_tie_bounds), centroid_fields[index]):
                    lo, hi = table[programme]
                    table[programme] = ([a-b for a, b in zip(lo, delta)], [a+b for a, b in zip(hi, delta)])
        # Same unmodified SAP-C1 source combinations. Compare portal reaction
        # and drift envelopes, independent of the new-goods extension.
        parity_keys = ('roofTieKN', 'floorTieKN', 'footVerticalKN', 'tieTravelMM')
        expected = next(row for row in json.loads((D/'reconciled-corner-portals.json').read_text())['results']
                        if row['crackedEI'] == crack)['bounds']
        measured = {key: [math.inf, -math.inf] for key in parity_keys}
        measures = []
        for responses, _ in units:
            table = []
            for displacement, reactions in [*responses, *portal.modes]:
                table.append({'roofTieKN': [value/1000 for value in reactions[8:]],
                              'floorTieKN': [value/1000 for value in reactions[6:8]],
                              'footVerticalKN': [reactions[j]/1000 for j in (2, 5)],
                              'tieTravelMM': [displacement[j] for j in portal.ties]})
            measures.append(table)
        for wi, state in enumerate(p['space']):
            active = [sap['load_scope'](state[0], opening) for opening in sap['ground']]
            weights = [[1., float(on), 0., 0.] for on in active]
            d, _ = coupled(weighted_sum([(1., source_bg[wi]), (1., source_lead_bg)]), weights)
            for a, table in enumerate(measures):
                for key in parity_keys:
                    for j, gravity in enumerate(table[0][key]):
                        mode_values = [row[key][j] for row in table[4:]]
                        value = gravity+active[a]*table[1][key][j]+sum(x*y for x, y in zip(d[4*a:4*a+4], mode_values))
                        extra = max(abs((table[2+side][key][j] if target == a else 0.)
                                        + sum(x*y for x, y in zip(du[4*a:4*a+4], mode_values)))
                                    for target, side, du, *_ in guards)
                        measured[key][0] = min(measured[key][0], value-extra)
                        measured[key][1] = max(measured[key][1], value+extra)
        error = max(abs(measured[key][j]-expected[key][j]) for key in parity_keys for j in (0, 1))
        if COURT_WIDTH == 220:
            assert error < .000051, (crack, error, measured, expected)
        source_portal_parity[str(crack)] = error
        portal_comparison[str(crack)] = {'frozenBounds': {key: expected[key] for key in parity_keys},
                                         'recoveredBounds': measured,
                                         'unchangedSectionParityRequired': COURT_WIDTH == 220}
        print('Portal source parity', crack, error, flush=True)
        for mode, goods_bg, goods_f, wind_sign, portal_g, stripped in modes:
            bounds = empty_bounds if stripped else full_bounds
            # Original G/heel envelope already reserves the field and specials.
            # Also test the complete selected specials as an adverse extra
            # origin, without spending their lower mass as a favourable credit.
            for extra_specials in ((0.,) if stripped else (0., 1.35)):
                for body_index in (2,):
                    body_label = str((BODY_LOW, BODY_HIGH)[body_index]) if body_index < 2 else 'independent exposed-panel bounds'
                    key = f'{crack}|{mode}|specials={extra_specials}|body={body_label}'
                    peaks = {name: {'interaction': 0.} for name in models}
                    for wi, state in enumerate(p['space']):
                        active = [sap['load_scope'](state[0], opening) for opening in sap['ground']]
                        weights = [[portal_g, float(on), 0., 0.] for on in active]
                        _, hor_bg, hor_f = horizontal[tuple(state[0])][body_index]
                        uncertainty = body_bounds[tuple(state[0])]
                        reaction_uncertainty = body_reaction_bounds[tuple(state[0])]
                        tie_uncertainty = body_tie_bounds[tuple(state[0])]
                        if not stripped:
                            uncertainty = ([a+b for a, b in zip(uncertainty[0], water_low)],
                                           [a+b for a, b in zip(uncertainty[1], water_high)])
                            reaction_uncertainty = ([a+b for a, b in zip(reaction_uncertainty[0], water_reaction_low)],
                                                    [a+b for a, b in zip(reaction_uncertainty[1], water_reaction_high)])
                            tie_uncertainty = ([a+b for a, b in zip(tie_uncertainty[0], water_tie_low)],
                                               [a+b for a, b in zip(tie_uncertainty[1], water_tie_high)])
                        # Additional 75mm court roof is upward only in the
                        # named stripped source case. Downward is covered by
                        # the retained original independent heel duty.
                        court_scale = 1. if stripped else 0.
                        background = weighted_sum([(1., source_bg[wi]), (1., goods_bg), (wind_sign, vertical_bg),
                                                   (1., hor_bg), (court_scale, strip_bg), (extra_specials, special_bg)])
                        _, actions = coupled(background, weights)
                        removed = [value*float(on) for (_, old), on in zip(units, active) for value in old]
                        ties = [(a-b)/1000 for a, b in zip(actions, removed)]
                        values = weighted_sum([(1., screen_f[wi]), (1., goods_f), (wind_sign, vertical_f),
                                               (1., hor_f), (court_scale, strip_f), (extra_specials, special_f),
                                               (-1., linear_combination(actions, host_f))])
                        goods_displacement = [0.]*len(wet_u) if stripped else dry_u
                        reactions = weighted_sum([(1., screen_reactions[wi]), (1., support_reactions(goods_displacement)),
                                                  (wind_sign, support_reactions(vertical_u)),
                                                  (1., support_reactions(horizontal[tuple(state[0])][body_index][0])),
                                                  (court_scale, support_reactions(strip_d)),
                                                  (extra_specials, support_reactions(special_d)),
                                                  (-1., linear_combination(actions, host_reactions))])
                        for guard_case in [None, *guards]:
                            for sign in ([0] if guard_case is None else (-1, 1)):
                                actual = values if guard_case is None else [a+sign*b for a, b in zip(values, guard_case[4])]
                                actual_reactions = reactions if guard_case is None else [a+sign*b for a, b in zip(reactions, guard_case[5])]
                                actual_ties = ties if guard_case is None else [a+sign*b/1000 for a, b in zip(ties, guard_case[3])]
                                reaction_low = [a+b+c for a, b, c in zip(actual_reactions, support_bounds[stripped][0], reaction_uncertainty[0])]
                                reaction_high = [a+b+c for a, b, c in zip(actual_reactions, support_bounds[stripped][1], reaction_uncertainty[1])]
                                for i, row in enumerate(station_ranges):
                                    for side, value in enumerate((reaction_low[i], reaction_high[i])):
                                        better = value < row['rangeKN'][side] if side == 0 else value > row['rangeKN'][side]
                                        if better:
                                            row['rangeKN'][side] = value
                                            row['controllingCases'][side] = {'case': key, 'windIndex': wi,
                                                                             'guard': None if guard_case is None else guard_case[:2],
                                                                             'guardSign': sign}
                                for i, row in enumerate(tie_ranges):
                                    for side, value in enumerate((actual_ties[i]+tie_uncertainty[0][i],
                                                                  actual_ties[i]+tie_uncertainty[1][i])):
                                        better = value < row['rangeKN'][side] if side == 0 else value > row['rangeKN'][side]
                                        if better:
                                            row['rangeKN'][side] = value
                                            row['controllingCases'][side] = {'case': key, 'windIndex': wi,
                                                                             'guard': None if guard_case is None else guard_case[:2],
                                                                             'guardSign': sign}
                                ratios = interaction(actual, bounds, uncertainty)
                                for name, indices in member_indices.items():
                                    index = max(indices, key=lambda index: ratios[index])
                                    if ratios[index] > peaks[name]['interaction']:
                                        peaks[name] = {'interaction': ratios[index], 'windIndex': wi,
                                                       'programme': state[0], 'guard': None if guard_case is None else guard_case[:2],
                                                       'guardSign': sign, 'actions': actual[6*index:6*index+6],
                                                       'boundedActions': bounded_actions(index, actual, bounds, uncertainty),
                                                       **location(index)}
                    results[key] = peaks
            print('Finished', crack, mode, flush=True)
    return results, source_portal_parity, portal_comparison, station_ranges, tie_ranges


if __name__ == '__main__':
    results, portal_parity, portal_comparison, station_ranges, tie_ranges = run_cases()
    worst = {name: max((dict(row[name], case=case) for case, row in results.items()),
                      key=lambda row: row['interaction']) for name in models}
    output = {'courtWidthMM': COURT_WIDTH, 'sections': engine['sections'],
              'nativeEndParity': parity, 'portalLocalFlexibilityParity': interface_error,
              'frozen220SectionParity': frozen_parity,
              'portalSourceComparisonMaxDelta': portal_parity, 'portalSourceComparison': portal_comparison,
              'extraVerticalAreaM2': wind_area,
              'extraVerticalWindKN': wind_area*2.25, 'extraWindAreas': wind_areas,
              'wetGravityKN': sum(v['downN'] for v in wet.placed)/1000,
              'independentWaterTributaries': len(water_responses),
              'independentWaterSuperpositionError': water_balance,
              'waterEnvelopeMethod': 'Each gutter tributary and each leader/head water load ranges independently from zero to its full bound. The component bounds need not occur simultaneously.',
              'dryGravityKN': sum(v['downN'] for v in dry.placed)/1000,
              'leaderDryKgEach': leader_dry_kg, 'leaderWaterKgEach': leader_water_kg,
              'loadBounds': {'outerDryKgPerM': [50, 50], 'innerDryKgPerM': [40, 40],
                             'outerBlockedWaterDepthMM': [180, 175], 'innerBlockedWaterDepthMM': [160, 150],
                             'outerWetWidthsMM': [350, 545], 'innerWetWidthsMM': [375, 475],
                             'innerCentrelineCoordinatesMM': [4537.5, 4562.5],
                             'outerRootsPerCircuit': 64, 'innerRootSpacingMaxMM': 1200,
                             'leaderCount': 6, 'leaderIDMM': 150, 'leaderWallMM': 2,
                             'leaderMaxLengthM': 8.4, 'headDryKgEach': 75, 'headWaterKgEach': 40,
                             'normalCatchAlongWidthMM': 450, 'normalCatchRadialEnvelopeMM': [1000, 1260],
                             'normalCatchIndependentCentroidYawKNm': .114,
                             'innerNormalWindApplicationZMM': 6860, 'otherLeaderWindApplicationZMM': 6600,
                             'leaderRoofWindAreaM2Each': .250*1.5,
                             'leaderComparedWindAreaM2Each': .250*8.4,
                             'leaderLowerSupportWindKNEach': 2.25*.250*6.9,
                             'leaderLowerSupportWindKNTotalPerAxis': 6*2.25*.250*6.9,
                             'leaderMaxClampTributaryWindKN': 2.25*.250*1.2,
                             'goodsBodyElevationEnvelopeMM': [BODY_LOW, BODY_HIGH]},
              'maximumSixComponentBalanceError': max(balance_errors),
              'selectedSpecialsCharacteristicKN': special_sum,
              'addedCourtCollectorGkKN': (engine['sections']['court']['lineG']-engine['sections']['outer']['lineG'])*4*(p['E']-p['C'])/1000,
              'supportReactionRanges': station_ranges,
              'portalNormalTieRanges': tie_ranges,
              'maximumPortalNormalTieKN': {level: max(abs(v) for row in tie_ranges if row['level'] == level for v in row['rangeKN'])
                                           for level in ('floor', 'roof')},
              'worstUpperTensionKN': -min(row['rangeKN'][0] for row in station_ranges),
              'worstUpperCompressionKN': max(row['rangeKN'][1] for row in station_ranges),
              'existingM24ComparisonResistanceKN': 353*(355/1.1)/1000,
              'worst': worst, 'cases': results,
              'sourceHashes': {str(path.relative_to(ROOT)): hashlib.sha256(path.read_bytes()).hexdigest()
                               for path in [D/'current-house-roof-bracing.py', D/'current-house-ring-return.py',
                                            portal_path, D/'reconciled-slate-roof.py',
                                            ROOT/'project/mat/studies/whole-envelope.json', Path(__file__)]},
              'limits': ['Source independent heel intervals remain a bounded stress screen.',
                         'Horizontal bodies use a 1400 mm high independent projected-panel envelope, with every force centroid within its four endpoint extremes and zero-to-full pressure area.',
                         'Complete leader wind is compared at the roof. The lower 6.9 m facade/floor support load and connection schedule remains an explicit separate receipt.',
                         'Root connections, masonry restraint, fabrication and site/load qualification remain separate.']}
    def rounded(value):
        if isinstance(value, dict):
            return {key: rounded(item) for key, item in value.items()}
        if isinstance(value, (tuple, list)):
            return [rounded(item) for item in value]
        return round(value, 9) if isinstance(value, float) else value
    target = HERE/({260: 'roof_water_structure.json', 240: 'roof_water_structure_240_comparison.json',
                   220: 'roof_water_structure_control.json'}[COURT_WIDTH])
    contents = json.dumps(rounded(output), indent=2)+'\n'
    if '--check' in ARGS:
        assert target.read_text() == contents, 'Rebuild the joined roof collector comparison'
    else:
        target.write_text(contents)
    assert (worst['court']['interaction'] < 1) == (COURT_WIDTH in (240, 260))
    assert worst['outer']['interaction'] < 1
    assert output['worstUpperTensionKN'] < output['existingM24ComparisonResistanceKN']
    print(json.dumps({key: output[key] for key in ('nativeEndParity', 'portalSourceComparisonMaxDelta', 'wetGravityKN',
                                                 'extraVerticalWindKN', 'worstUpperTensionKN', 'worst')}, indent=2))
