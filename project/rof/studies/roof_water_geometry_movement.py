"""Signed collector movement for the selected independent drainage assemblies."""
from pathlib import Path
from contextlib import redirect_stdout
from io import StringIO
import json
import hashlib
import math
import runpy
import sys

HERE = Path(__file__).resolve().parent
ARGS = sys.argv[:]
width = int(next((arg.split('=')[1] for arg in ARGS if arg.startswith('--court-width=')), '280'))
inner_dry_kg_per_m = float(next((arg.split('=')[1] for arg in ARGS if arg.startswith('--inner-dry-kg-per-m=')), '60'))
sys.argv = ['roof_water_geometry_trial.py', f'--court-width={width}', f'--inner-dry-kg-per-m={inner_dry_kg_per_m}']
m = runpy.run_path(str(HERE/'roof_water_geometry_trial.py'))
weighted_sum, linear_combination = m['weighted_sum'], m['linear_combination']
p, models, segments = m['p'], m['models'], m['segments']


def root_point(face, station, name='outer'):
    cuts = p['sides'][face, 'outer' if name == 'outer' else 'inner']
    normal = p['A'] if name == 'outer' else p['C']
    return p['pt'](face, normal, max(cuts[0], min(cuts[-1], station)))


def root_state(displacement, point, load=None, ring_self=None):
    if point in p['nodes']:
        return [displacement[p['vDO'](point, j)] for j in range(3)]
    name = 'court' if all(p['C'] <= value <= p['E'] for value in point) else 'outer'
    seg = m['find_segment'](name, point)
    key, a, b, length, axis = (seg[k] for k in ('key', 'a', 'b', 'length', 'axis'))
    x = point[axis]-a[axis]
    t = x/length
    h, slope = m['shape'](length, x)
    nodal = [displacement[p['vDO'](a, 0)], displacement[p['vDO'](a, axis+1)],
             displacement[p['vDO'](b, 0)], displacement[p['vDO'](b, axis+1)]]
    result = [0.]*3
    result[0] = sum(q*v for q, v in zip(h, nodal))
    result[axis+1] = sum(q*v for q, v in zip(slope, nodal))
    result[2-axis] = (1-t)*displacement[p['vDO'](a, 2-axis)]+t*displacement[p['vDO'](b, 2-axis)]
    sec = models[name]['section']
    EI = p['Es']*sec['I']
    if ring_self == name:
        result[0] += sec['lineG']*x*x*(length-x)**2/(24*EI)
        result[axis+1] += sec['lineG']*x*(length-x)*(length-2*x)/(12*EI)
    if load is not None:
        equivalent = load.vertical[key]
        crossed = [v for v in load.points_v[key] if v[0] < x]
        result[0] += (equivalent[1]*x*x/2-equivalent[0]*x**3/6
                      + sum(force*(x-at)**3/6-moment*(x-at)**2/2 for at, force, moment, _ in crossed))/EI
        result[axis+1] += (equivalent[1]*x-equivalent[0]*x*x/2
                           + sum(force*(x-at)**2/2-moment*(x-at) for at, force, moment, _ in crossed))/EI
        b0, h0, thickness = sec['B'], sec['H'], sec['t']
        J = 4*((b0-thickness)*(h0-thickness))**2/(2*(b0-thickness+h0-thickness)/thickness)
        result[2-axis] += (equivalent[4]*x-sum(torque*(x-at) for at, _, _, torque in crossed))/(77000*J)
    return result


def reference(face, radial, station, root_at=None, name='outer'):
    root = root_point(face, station if root_at is None else root_at, name)
    source = p['pt'](face, -radial, station)
    return root, source


def at(displacement, ref, load=None, ring_self=None):
    root, source = ref
    value = root_state(displacement, root, load, ring_self)
    return value[0]+sum((source[j]-root[j])*value[j+1] for j in (0, 1))


queries = []
primary_stations = [-345+12690*(j+.5)/16 for j in range(16)]
fault_stations = [-397.5+12795*(j+.5)/16 for j in range(16)]
for face, station, label in m['heads']:
    if label.endswith('normal'):
        candidates = sorted(primary_stations, key=lambda x: abs(x-station))[:2]
        for index, near in enumerate(candidates):
            head_root = root_point(face, station)
            near_root = root_point(face, near)
            queries.append((label+f' head root minus primary root {index+1}',
                            (head_root, head_root), (near_root, near_root)))
            queries.append((label+f' head at R1130 minus primary front R520, root {index+1}',
                            reference(face, 1130, station), reference(face, 520, near)))
    for index, near in enumerate(sorted(fault_stations, key=lambda value: abs(value-station))[:2]):
        head_root = root_point(face, station)
        near_root = root_point(face, near)
        queries.append((label+f' head root minus lower root {index+1}',
                        (head_root, head_root), (near_root, near_root)))
        queries.append((label+f' return R1260 minus R600 at actual lower root {index+1}',
                        reference(face, 1260, station), reference(face, 600, station, root_at=near)))
    queries.append((label+' head R1130 minus lower front R670 at same station',
                    reference(face, 1130, station), reference(face, 670, station)))
    queries.append((label+' widest return R1260 minus lower back R125',
                    reference(face, 1260, station), reference(face, 125, station)))
    queries.append((label+' return R1260 minus R600 at same station',
                    reference(face, 1260, station), reference(face, 600, station)))
    queries.append((label+' primary carrier R170 minus lower front R670',
                    reference(face, 170, station), reference(face, 670, station)))
    queries.append((label+' primary front R520 minus lower front R670',
                    reference(face, 520, station), reference(face, 670, station)))
    queries.append((label+' primary cross-section R520 minus R170',
                    reference(face, 520, station), reference(face, 170, station)))
    queries.append((label+' lower cross-section R670 minus R125',
                    reference(face, 670, station), reference(face, 125, station)))

zero_reference = (p['pt'](0, p['A'], p['A']), p['pt'](0, p['A'], p['A']))
for face in range(4):
    for station in primary_stations:
        label = f'outer face{face} primary root u{station}'
        queries.append((label+' cross-section R520 minus R170',
                        reference(face, 520, station), reference(face, 170, station)))
        for radial in (170., 520.):
            queries.append((label+f' R{radial} absolute', reference(face, radial, station), None))
        for near in sorted(fault_stations, key=lambda value: abs(value-station))[:2]:
            queries.append((label+f' moving R170 minus lower R670 rooted at u{near}',
                            reference(face, 170, station), reference(face, 670, station, root_at=near)))
    for station in fault_stations:
        label = f'outer face{face} lower root u{station}'
        queries.append((label+' cross-section R670 minus R125',
                        reference(face, 670, station), reference(face, 125, station)))
        for radial in (125., 670.):
            queries.append((label+f' R{radial} absolute', reference(face, radial, station), None))

assert len(queries) == 564
court_circuits = m['court_circuits']
for face in range(4):
    for circuit in court_circuits:
        name = circuit['name']
        q_edges = (circuit['centre']-circuit['width']/2,circuit['centre']+circuit['width']/2)
        modules = circuit['modules']
        for j, module in enumerate(modules):
            # Corners include their complete L-body bounding territory,
            # not only the equivalent-area module p range.
            p_ends = [q_edges[0] if j == 0 else module['pRange'][0],
                      12000-q_edges[0] if j == len(modules)-1 else module['pRange'][1]]
            for station in p_ends:
                for q in q_edges:
                    queries.append((f'inner face{face} {name} module{j} p{station} q{q} absolute',
                                    reference(face, -q, station, root_at=module['rootStation'], name='court'), None))
        for root in sorted({module['rootStation'] for module in modules}):
            queries.append((f'inner face{face} {name} width q{q_edges[1]} minus q{q_edges[0]} root{root}',
                            reference(face, -q_edges[1], root, root_at=root, name='court'),
                            reference(face, -q_edges[0], root, root_at=root, name='court')))

    # A change of either owning cassette is a real discontinuity. Retain
    # both one-sided references at every common interval boundary.
    boundaries = sorted({4375., 7625., *(at for circuit in court_circuits
                                       for module in circuit['modules'] for at in module['pRange'])})
    assert len(boundaries) == 15
    for left, right in zip(boundaries, boundaries[1:]):
        middle = (left+right)/2
        owners = []
        for circuit in court_circuits:
            modules = circuit['modules']
            owner = next((module for module in modules if module['pRange'][0] <= middle <= module['pRange'][1]),
                         modules[0] if middle < modules[0]['pRange'][0] else modules[-1])
            owners.append(owner['rootStation'])
        for station in (left, right):
            queries.append((f'inner face{face} interval{left}:{right} p{station} lower q4800 minus primary q4375',
                            reference(face, -4800., station, root_at=owners[1], name='court'),
                            reference(face, -4375., station, root_at=owners[0], name='court')))
assert len(queries) == 908


def values(displacement, load=None, ring_self=None):
    return [at(displacement, a, load, ring_self)-(0. if b is None else at(displacement, b, load, ring_self))
            for _, a, b in queries]


native_bounds = {}
for stripped in (False, True):
    low = [0.]*len(queries)
    high = low.copy()
    for name, model in models.items():
        for label, loads, lo, hi in model['cases']:
            if stripped and (label == 'ringG' or label.startswith('bracemass')):
                continue
            if stripped and label.startswith('F'):
                hi = 0.
            local = model['solve']([loads[j] for j in model['free']])
            full = [0.]*p['spaceSize']
            for value, dof in zip(local, model['free']):
                node, axis = divmod(dof, 3)
                full[p['vDO'](model['nodes'][node], axis)] = value
            response = values(full, ring_self=name if label == 'ringG' else None)
            low = [a+min(lo*b, hi*b) for a, b in zip(low, response)]
            high = [a+max(lo*b, hi*b) for a, b in zip(high, response)]
    native_bounds[stripped] = (low, high)

host = [values(u, load) for u, load in zip(m['host_units'], m['host_loads'])]
screen = [values(u) for u in m['screen']]
wet, dry, vertical = (values(m[key+'_u'], m[load]) for key, load in
                     [('wet', 'wet'), ('dry', 'dry'), ('vertical', 'wind_vertical')])
strip, special = values(m['strip_d']), values(m['special_d'])
horizontal = {prog: [values(response[0], load) for response, load in zip(m['horizontal'][prog], rows)]
              for prog, rows in m['horizontal_cases'].items()}
panels = {spec: [values(response[0], load) for response, load in zip(m['panel_responses'][spec], rows)]
          for spec, rows in m['panel_loads'].items()}
water = [(response[1], values(response[0], load)) for load, response in m['water_responses']]
centroid = [(response[1], values(response[0], load))
            for load, response in zip(m['centroid_loads'], m['centroid_responses'])]
records = [{'label': label, 'references': [a, b], 'rangeMM': [math.inf, -math.inf],
            'incrementOnlyRangeMM': [math.inf, -math.inf], 'dryDiversionRangeMM': [math.inf, -math.inf],
            'control': [None, None]}
           for label, a, b in queries]
modes = [('partial water down', m['dry_bg'], dry, 1., 1., False),
         ('partial water up', m['dry_bg'], dry, -1., 1., False),
         ('dry down', m['dry_bg'], dry, 1., 1., False),
         ('dry up', m['dry_bg'], dry, -1., 1., False),
         ('stripped up', [0.]*32, [0.]*len(queries), -1., 0., True)]
for crack in (.2, .35):
    portal, units, coupled, guards = m['portal_model'](crack)
    guard_values = [linear_combination([-v for v in row[3]], host) for row in guards]
    # Only one signed guard acts at a time. For a scalar query its exact
    # extrema are +/- the largest absolute of the sixteen linear responses.
    # This preserves the original 33-state set without repeating every
    # wind/mode loop 33 times.
    guard_indices = [max(range(len(guard_values)), key=lambda j: abs(guard_values[j][i]))
                     for i in range(len(queries))]
    guard_peaks = [abs(guard_values[j][i]) for i, j in enumerate(guard_indices)]
    zero_weights = [[0., 0., 0., 0.] for _ in range(8)]
    panel_bounds = {}
    for spec, rows in panels.items():
        choices = [[0.]*len(queries)]
        for response, value in zip(m['panel_responses'][spec], rows):
            _, actions = coupled(response[1], zero_weights)
            choices.append(weighted_sum([(1., value), (-1., linear_combination(actions, host))]))
        panel_bounds[spec] = ([min(column) for column in zip(*choices)], [max(column) for column in zip(*choices)])
    body_bounds = {prog: (weighted_sum([(1., panel_bounds[spec][0]) for spec in specs]),
                         weighted_sum([(1., panel_bounds[spec][1]) for spec in specs]))
                   for prog, specs in m['panel_specs'].items()}
    water_low, water_high = [0.]*len(queries), [0.]*len(queries)
    for background, value in water:
        _, actions = coupled(background, zero_weights)
        response = weighted_sum([(1., value), (-1., linear_combination(actions, host))])
        water_low = [a+min(0., b) for a, b in zip(water_low, response)]
        water_high = [a+max(0., b) for a, b in zip(water_high, response)]
    centroid_fields = []
    for background, value in centroid:
        _, actions = coupled(background, zero_weights)
        centroid_fields.append([abs(v) for v in weighted_sum([(1., value), (-1., linear_combination(actions, host))])])
    for programme, indices in m['centroid_programmes'].items():
        for index in indices:
            lo, hi = body_bounds[programme]
            body_bounds[programme] = ([a-b for a, b in zip(lo, centroid_fields[index])],
                                      [a+b for a, b in zip(hi, centroid_fields[index])])
    for mode, goods_bg, goods, wind_sign, portal_g, stripped in modes:
        for extra_specials in ((0.,) if stripped else (0., 1.35)):
            for wi, state in enumerate(p['space']):
                programme = tuple(state[0])
                active = [m['sap']['load_scope'](programme, opening) for opening in m['sap']['ground']]
                weights = [[portal_g, float(on), 0., 0.] for on in active]
                _, hor_bg, _ = m['horizontal'][programme][2]
                court_scale = 1. if stripped else 0.
                background = weighted_sum([(1., m['source_bg'][wi]), (1., goods_bg), (wind_sign, m['vertical_bg']),
                                           (1., hor_bg), (court_scale, m['strip_bg']), (extra_specials, m['special_bg'])])
                _, actions = coupled(background, weights)
                base = weighted_sum([(1., screen[wi]), (1., goods), (wind_sign, vertical), (1., horizontal[programme][2]),
                                     (court_scale, strip), (extra_specials, special), (-1., linear_combination(actions, host))])
                lo = [a+b+c-g for a, b, c, g in zip(base, native_bounds[stripped][0], body_bounds[programme][0], guard_peaks)]
                hi = [a+b+c+g for a, b, c, g in zip(base, native_bounds[stripped][1], body_bounds[programme][1], guard_peaks)]
                if mode.startswith('partial'):
                    lo = [a+b for a, b in zip(lo, water_low)]
                    hi = [a+b for a, b in zip(hi, water_high)]
                for i, row in enumerate(records):
                    if mode.startswith('dry'):
                        row['dryDiversionRangeMM'][0] = min(row['dryDiversionRangeMM'][0], lo[i])
                        row['dryDiversionRangeMM'][1] = max(row['dryDiversionRangeMM'][1], hi[i])
                    row['incrementOnlyRangeMM'][0] = min(row['incrementOnlyRangeMM'][0], base[i]-guard_peaks[i]+body_bounds[programme][0][i])
                    row['incrementOnlyRangeMM'][1] = max(row['incrementOnlyRangeMM'][1], base[i]+guard_peaks[i]+body_bounds[programme][1][i])
                    for side, value in enumerate((lo[i], hi[i])):
                        better = value < row['rangeMM'][side] if side == 0 else value > row['rangeMM'][side]
                        if better:
                            row['rangeMM'][side] = float(value)
                            guard_id = guard_indices[i] if guard_peaks[i] else None
                            guard_direction = 1 if guard_id is not None and guard_values[guard_id][i] > 0 else -1
                            sign = (1 if side else -1)*guard_direction if guard_id is not None else 0
                            row['control'][side] = {'crack': crack, 'mode': mode, 'specials': extra_specials,
                                                  'windIndex': wi, 'guard': guard_id, 'sign': sign}
output = {'windQualification':'Declared original house-wind comparison; extra inner panels pending.', 'role': 'Signed relative collector/root and rigid-arm movement. Local bracket bending is added separately.',
          'positive': 'First reference moves downward relative to second.',
          'courtWidthMM': width, 'innerDryKgPerM': [inner_dry_kg_per_m]*2, 'independentWaterTributaries': len(water),
          'newGoodsDryKN': sum(row['downN'] for row in m['dry'].placed)/1000+m['inner_dry_kn'],
          'newGoodsFullWetKN': sum(row['downN'] for row in m['wet'].placed)/1000+m['inner_dry_kn'],
          'extraVerticalWindAreaM2': m['wind_area'], 'normalCatchCentroidYawKNm': .114,
          'nativeGravityIntervalsRetained': True, 'queries': records,
          'primaryBracketStations': primary_stations, 'lowerBracketStations': fault_stations,
          'courtSupportCassettes': m['court_support_cassettes'],
          'sourceHashes': {str(path.relative_to(m['ROOT'])): hashlib.sha256(path.read_bytes()).hexdigest()
                           for path in (HERE/'roof_water_geometry_trial.py', Path(__file__))}}
def rounded(value):
    if isinstance(value, dict):
        return {key: rounded(item) for key, item in value.items()}
    if isinstance(value, (tuple, list)):
        return [rounded(item) for item in value]
    return round(value, 9) if isinstance(value, float) else value


target = HERE/f"roof_water_geometry_movement_{width}_{m['MASS_TAG']}.json"
contents = json.dumps(rounded(output), indent=2)+'\n'
if '--check' in ARGS:
    assert target.read_text() == contents, 'Rebuild the joined collector movement comparison'
else:
    target.write_text(contents)
print(f'{len(records)} signed collector movement queries checked at court width {width} mm.')
