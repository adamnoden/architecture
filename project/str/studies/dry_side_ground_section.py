import ast
import hashlib
import json
import math
from pathlib import Path
from xml.sax.saxutils import escape


def sha256(raw):
    return hashlib.sha256(raw).hexdigest()


def bind_sources(case, raw_sources):
    if set(case) != {'schema', 'status', 'sources', 'settings'} or case['schema'] != 'dry-side-ground-section/2':
        raise ValueError('unsupported section document')
    for path, digest in case['sources'].items():
        if path not in raw_sources or sha256(raw_sources[path]) != digest:
            raise ValueError('missing or stale source: ' + path)


def native_member_method(raw):
    tree = ast.parse(raw)
    names = {'section', 'mechanics'}
    nodes = [n for n in tree.body if isinstance(n, ast.FunctionDef) and n.name in names]
    if {n.name for n in nodes} != names:
        raise ValueError('missing native section/mechanics method')
    scope = {'math': math, 'A': lambda d: math.pi * d * d / 4,
             'fyd': 500 / 1.15, 'fcd': .85 * 30 / 1.5,
             'E': 22000 * (38 / 10) ** .3, 'SPAN': 4}
    exec(compile(ast.Module(body=nodes, type_ignores=[]), 'bound-native-bridge-method', 'exec'), scope)
    return scope['section'], scope['mechanics']


def native_floor_geometry(raw, house):
    tree = ast.parse(raw)
    names = {'inner', 'loggia', 'outdoor', 'seat'}
    assignments = [n for n in tree.body if isinstance(n, ast.Assign)
                   and any(isinstance(t, ast.Name) and t.id in names for t in n.targets)]
    axes = [n for n in tree.body if isinstance(n, ast.Assign)
            and any(isinstance(t, ast.Tuple) and [v.id for v in t.elts] == ['A', 'B'] for t in n.targets)]
    if len(assignments) != 4 or len(axes) != 1:
        raise ValueError('unsupported native ground-floor geometry declarations')
    scope = {'h': house, 'xyrect': lambda r: [r[0], r[1], r[0] + r[2], r[1] + r[3]]}
    exec(compile(ast.Module(body=axes + assignments, type_ignores=[]), 'bound-native-floor-geometry', 'exec'), scope)
    court = scope['xyrect'](house['court'])
    return {k: scope[k] for k in names} | {'court': court}


def native_court_core_footprints(raw, house):
    tree = ast.parse(raw)
    axes = [n for n in tree.body if isinstance(n, ast.Assign) and any(isinstance(t, ast.Tuple)
            and [v.id for v in t.elts] in (['A', 'B'], ['C', 'E']) for t in n.targets)]
    outer = [n for n in tree.body if isinstance(n, ast.Assign)
             and any(isinstance(t, ast.Name) and t.id == 'outer' for t in n.targets)]
    if len(axes) != 2 or len(outer) != 1:
        raise ValueError('unsupported native facade-core geometry declarations')
    scope = {}
    exec(compile(ast.Module(body=axes + outer, type_ignores=[]), 'bound-native-court-core-geometry', 'exec'), scope)
    width = next(value for name, value in house['weather']['layersRoomToWeather'] if name == 'structuralMasonry')
    rows = []
    for name, (axis, normal) in scope['outer'].items():
        if not name.startswith('court-'):
            continue
        intervals = [(scope['C']-width/2, scope['E']+width/2)]
        for op in house['openings']['GROUND']:
            if op['wall'] != name or not op.get('kind', '').startswith('open-'):
                continue
            start, end = op['centre']-op['width']/2, op['centre']+op['width']/2
            intervals = [part for low, high in intervals for part in ((low, min(high, start)), (max(low, end), high)) if part[1] > part[0]]
        for index, (low, high) in enumerate(intervals):
            rectangle = [low, normal-width/2, high, normal+width/2] if axis == 0 else [normal-width/2, low, normal+width/2, high]
            rows.append({'id': name+'-native-ground-core-'+str(index), 'planMm': rectangle,
                         'role': 'native structural candidate core axis; actual MAT/weather alignment and load acceptance remain separate'})
    return rows


def union_area(rectangles):
    xs = sorted({v for r in rectangles for v in (r[0], r[2])})
    area = 0
    for a, b in zip(xs, xs[1:]):
        ys = sorted((r[1], r[3]) for r in rectangles if r[0] < b and r[2] > a)
        total = 0
        end = -math.inf
        for c, d in ys:
            total += max(0, d - max(c, end))
            end = max(end, d)
        area += (b - a) * total
    return area


def grid_rectangles(grid):
    rows = []
    for key, g in grid['girders'].items():
        lo, hi = g['extent']
        d, w = g['datum'], g['width'] / 2
        rect = [lo, d - w, hi, d + w] if g['axis'] == 'x' else [d - w, lo, d + w, hi]
        rows.append((key, rect, g['z']))
    for key, g in grid['crossBeams'].items():
        (x, y), (xx, yy), w = g['a'], g['b'], g['width'] / 2
        rect = [x, y - w, xx, yy + w] if y == yy else [x - w, y, xx + w, yy]
        rows.append((key, rect, g['z']))
    for h in grid['heads']:
        x, y = h['xy']
        w, d = h['capXY']
        rows.append((h['id'], [x - w / 2, y - d / 2, x + w / 2, y + d / 2], h['capZ']))
    return rows


def intersection(a, b):
    r = [max(a[0], b[0]), max(a[1], b[1]), min(a[2], b[2]), min(a[3], b[3])]
    return r if r[2] > r[0] and r[3] > r[1] else None


def approach(old, rise_mm, slope):
    run = rise_mm * slope
    max_flight = max(old['flights'])
    count = max(1, math.ceil(run / max_flight))
    flights = [max_flight] * (count - 1) + [run - max_flight * (count - 1)]
    landings = count + 1
    total = run + landings * old['landingLength']
    return {'riseMm': rise_mm, 'slopeRatio': slope, 'slopingRunMm': run,
            'flightsMm': flights, 'landingLengthMm': old['landingLength'], 'landings': landings,
            'totalStraightReservationMm': total,
            'extraStraightReservationMm': total - old['totalStraightReservation']}


def exterior_core_footprints(house, geometry):
    width = next(value for name, value in house['weather']['layersRoomToWeather'] if name == 'structuralMasonry')
    a, c, b, d = geometry['inner']
    axes = {'outer-south': (0, c), 'outer-north': (0, d), 'outer-west': (1, a), 'outer-east': (1, b)}
    rows = []
    for name, (axis, normal) in axes.items():
        low, high = ((a, b) if axis == 0 else (c, d))
        intervals = [(low - width / 2, high + width / 2)]
        openings = [op for op in house['openings']['GROUND'] if op['wall'] == name and op.get('kind', '').startswith('open-')]
        for opening in openings:
            start, end = opening['centre'] - opening['width'] / 2, opening['centre'] + opening['width'] / 2
            intervals = [part for lo, hi in intervals for part in ((lo, min(hi, start)), (max(lo, end), hi)) if part[1] > part[0]]
        for index, (lo, hi) in enumerate(intervals):
            rectangle = [lo, normal-width/2, hi, normal+width/2] if axis == 0 else [normal-width/2, lo, normal+width/2, hi]
            rows.append({'id': name + '-ground-core-' + str(index), 'planMm': rectangle,
                         'role': 'actual structural-core-width support domain; open-loggia/service portals excluded; no weather-leaf credit'})
    return rows


def upper_component_footprints(house, geometry, exterior, court):
    half = next(value for name, value in house['weather']['layersRoomToWeather'] if name == 'structuralMasonry') / 2
    bounds = [geometry['inner'][0]-half, geometry['inner'][1]-half,
              geometry['inner'][2]+half, geometry['inner'][3]+half]
    rows = list(exterior) + list(court)
    for wall in house['groundWalls']:
        axis = 0 if wall['a'][0] != wall['b'][0] else 1
        lo, hi = sorted([wall['a'][axis], wall['b'][axis]])
        c0, c1 = wall['structuralCore']
        rectangle = [lo, c0, hi, c1] if axis == 0 else [c0, lo, c1, hi]
        clipped = intersection(rectangle, bounds)
        if clipped:
            rows.append({'id': 'internal-base-' + wall['id'], 'planMm': clipped,
                         'role': 'source core footprint below FFL; ordinary door-base continuity is proposed, no filled opening above FFL'})
    structural = house['structuralChanges']
    cores = {'stairMidPost': structural['stairMidPost']['concrete'],
             'southWetReceiver': structural['newWetWallBeam']['southReceiverCore'],
             'northWetReceiver': structural['newWetWallBeam']['northReceiverCore']}
    for name, r in cores.items():
        rows.append({'id': name, 'planMm': [r[0], r[1], r[0]+r[2], r[1]+r[3]],
                     'role': 'actual RC core restarts in upper dry slab; no cold starter crosses course'})
    portal = house['northNormalRoute']['portal']
    for index, interval in enumerate(portal['coreBands']):
        for face in ('west', 'east'):
            x0, x1 = portal['piers'][face]
            rows.append({'id': 'north-portal-' + face + '-' + str(index),
                         'planMm': [x0, interval[0], x1, interval[1]],
                         'role': 'actual full portal-core bearing footprint, including projection beyond ordinary outer core'})
    return rows


def clipped_floor_bearings(geometry, receivers, additions=()):
    rectangles = list(geometry.values()) + receivers + list(additions)
    xs = sorted({v for r in rectangles for v in (r[0], r[2])})
    ys = sorted({v for r in rectangles for v in (r[1], r[3])})
    inside = lambda x, y, r: r[0] <= x < r[2] and r[1] <= y < r[3]
    floor_area = 0
    cells = []
    for x0, x1 in zip(xs, xs[1:]):
        for y0, y1 in zip(ys, ys[1:]):
            x, y = (x0 + x1) / 2, (y0 + y1) / 2
            dry = inside(x, y, geometry['inner']) and not any(inside(x, y, geometry[k]) for k in ('court', 'loggia', 'outdoor'))
            if not (dry or inside(x, y, geometry['seat']) or any(inside(x, y, r) for r in additions)):
                continue
            area = (x1 - x0) * (y1 - y0) / 1e6
            floor_area += area
            if any(inside(x, y, r) for r in receivers):
                cells.append([x0, y0, x1, y1])
    bearing_area = sum((r[2] - r[0]) * (r[3] - r[1]) / 1e6 for r in cells)
    return {'floorAreaM2': floor_area, 'bearingAreaM2': bearing_area,
            'disjointCellCount': len(cells), 'disjointCellDigest': sha256(json.dumps(cells, separators=(',', ':')).encode())}


def derive_section(case, raw_sources):
    bind_sources(case, raw_sources)
    s = case['settings']
    if set(s) != {'caseId', 'courseBottomMm', 'exteriorGradeMm', 'localSolumMm', 'minimumGradeClearanceMm', 'approachSlopeRatio', 'newBeam',
                  'rcDensityKNm3', 'mineralDensityBudgetKNm3', 'ordinaryBarClearanceMm', 'geometryOnly', 'serviceZoneMm'}:
        raise ValueError('unsupported section settings')
    for key in ('courseBottomMm', 'exteriorGradeMm', 'localSolumMm', 'minimumGradeClearanceMm',
                'approachSlopeRatio', 'rcDensityKNm3', 'mineralDensityBudgetKNm3', 'ordinaryBarClearanceMm', 'serviceZoneMm'):
        if type(s[key]) not in (int, float) or not math.isfinite(s[key]):
            raise ValueError('nonfinite section setting: ' + key)
    if not isinstance(s['caseId'], str) or not s['caseId'] or min(s[k] for k in ('approachSlopeRatio', 'rcDensityKNm3', 'mineralDensityBudgetKNm3')) <= 0:
        raise ValueError('unsupported section settings domain')
    if not 0 < s['serviceZoneMm'] <= 500:
        raise ValueError('service zone must be positive and no more than500mm in this comparison')
    h = json.loads(raw_sources['project/had/studies/water-replan.json'])['model']
    grid = json.loads(raw_sources['project/str/studies/current-house-grid.json'])
    floor_source = json.loads(raw_sources['project/str/studies/current-house-occupied-interfaces.json'])
    floor = floor_source['groundFloor']
    lower_toe = json.loads(raw_sources['project/str/studies/open-loggia-support.json'])['finite_floor_frame']['stair']['ground_toe_support']
    mineral = json.loads(raw_sources['project/mat/studies/conventional-ground-junction.json'])['bondedMineralBase']
    member, mechanics = native_member_method(raw_sources['project/str/studies/current-house-bridge.py'])
    source_layers = h['northNormalRoute']['floorJoin']['layers']
    if source_layers != [15, 65, 100, 200] or grid['girders']['court-S']['z'] != [-630, -180]:
        raise ValueError('unsupported source floor/grid domain')
    layers = [source_layers[0], s['serviceZoneMm'], *source_layers[2:]]
    cold_top = grid['girders']['court-S']['z'][1]
    course_bottom = s['courseBottomMm']
    course_height = sum(mineral['beds']) + sum(mineral['courses'])
    dry_bottom = course_bottom + course_height
    dry_top = dry_bottom + layers[3]
    ffl = dry_top + sum(layers[:3])
    delta = ffl - h['sections']['groundFFL']
    grade = s['exteriorGradeMm']
    plinth_height = course_bottom - cold_top
    diagnostics = []
    source_evidence_current = floor_source['HAD'] == sha256(raw_sources['project/had/studies/water-replan.json']) and floor_source['sources']['current-house-grid.json'] == sha256(raw_sources['project/str/studies/current-house-grid.json'])
    if not source_evidence_current:
        diagnostics.append('REGENERATE_SOURCE_FLOOR_AND_GRID_EVIDENCE')
    if plinth_height < 0:
        diagnostics.append('MINERAL_COURSE_INTRUDES_IN_COLD_GRID')
    if course_bottom - grade < s['minimumGradeClearanceMm']:
        diagnostics.append('EXTERIOR_GRADE_BRIDGES_LOW_MINERAL_COURSE')
    if delta != 0:
        diagnostics.append('UNCOORDINATED_SERVICE_ROOF_FOUNDATION_LEVELS')
    diagnostics.append('LOWER_STAIR_TOE_CONTACT_UNLOCATED')
    beam = s['newBeam']
    if set(beam) != {'axisYmm', 'widthMm', 'depthMm', 'endExtensionMm', 'nodeTransferLengthMm',
                     'barsEachFace', 'barDiameterMm', 'linkDiameterMm', 'linkPitchMm', 'coverRangeMm'}:
        raise ValueError('unsupported beam settings')
    for key in set(beam) - {'coverRangeMm'}:
        if type(beam[key]) not in (int, float) or not math.isfinite(beam[key]) or beam[key] <= 0:
            raise ValueError('unsupported beam setting domain: ' + key)
    if type(beam['barsEachFace']) is not int or beam['barsEachFace'] < 2:
        raise ValueError('unsupported main bar count')
    if len(beam['coverRangeMm']) != 2 or any(type(v) not in (int, float) or not math.isfinite(v) or v < 0 for v in beam['coverRangeMm']):
        raise ValueError('unsupported cover range')
    west, east = (grid['girders'][key] for key in ('court-W', 'court-E'))
    x0, x1 = west['datum'], east['datum']
    y, width, depth = beam['axisYmm'], beam['widthMm'], beam['depthMm']
    if width < mineral['headerWidth']:
        diagnostics.append('MINERAL_HEADER_OVERHANGS_NEW_BEAM')
    rect = [x0 - beam['endExtensionMm'], y - width / 2, x1 + beam['endExtensionMm'], y + width / 2]
    for g in (west, east):
        if not g['extent'][0] <= rect[1] < rect[3] <= g['extent'][1]:
            diagnostics.append('NEW_BEAM_END_OUTSIDE_COURT_GIRDER')
        if beam['nodeTransferLengthMm'] > min(g['width'], 2 * beam['endExtensionMm']):
            diagnostics.append('NEW_BEAM_NODE_OVERLAP_RESERVATION_UNSUPPORTED')
    seat = h['southCourtThresholdReference']['pan']['permanentSeat']['plan']
    old_edge = grid['girders']['court-S']['datum'] + grid['girders']['court-S']['width'] / 2
    seat_rect = [seat[0], seat[1], seat[0] + seat[2], seat[1] + seat[3]]
    former_projection = [seat_rect[0], old_edge, seat_rect[2], seat_rect[3]]
    covered = intersection(former_projection, rect)
    former_area = seat[2] * (seat_rect[3] - old_edge) / 1e6
    covered_area = 0 if covered is None else (covered[2] - covered[0]) * (covered[3] - covered[1]) / 1e6
    unsupported = max(0, former_area - covered_area)
    if unsupported > 1e-9:
        diagnostics.append('THRESHOLD_DRY_SLAB_CANTILEVER_REMAINS')
    all_grid = grid_rectangles(grid)
    geometry = native_floor_geometry(raw_sources['project/str/studies/current-house-head-actions.py'], h)
    old_receivers = [q for _, q, levels in all_grid if levels[1] >= h['sections']['groundFloorRC']['bottom']
                     and levels[0] < h['sections']['groundFloorRC']['top']]
    outer_core = exterior_core_footprints(h, geometry)
    court_core = native_court_core_footprints(raw_sources['project/str/studies/current-house-head-actions.py'], h)
    upper_components = upper_component_footprints(h, geometry, outer_core, court_core)
    for component in upper_components:
        q = component['planMm']
        covered = [r for receiver in old_receivers + [rect] for r in [intersection(q, receiver)] if r is not None]
        component['directSupportAreaM2'] = union_area(covered) / 1e6
        component['unsupportedAreaM2'] = max(0, (q[2]-q[0])*(q[3]-q[1])/1e6 - component['directSupportAreaM2'])
        if component['unsupportedAreaM2'] > 1e-8:
            diagnostics.append('UPPER_COMPONENT_WITHOUT_DIRECT_MINERAL_SUPPORT:' + component['id'])
    edge_additions = [row['planMm'] for row in upper_components]
    old_bearings = clipped_floor_bearings(geometry, old_receivers)
    new_bearings = clipped_floor_bearings(geometry, old_receivers + [rect], edge_additions)
    overlap_rects = [r for _, q, z in all_grid if z[0] <= cold_top - depth and z[1] >= cold_top
                     for r in [intersection(q, rect)] if r is not None]
    beam_gross_area = (rect[2] - rect[0]) * width / 1e6
    beam_net_area = beam_gross_area - union_area(overlap_rects) / 1e6
    span = (x1 - x0) / 1000
    projection_m = (seat_rect[3] - old_edge) / 1000
    density = s['rcDensityKNm3']
    g_self = width * depth / 1e6 * density
    g_mineral = width / 1000 * course_height / 1000 * s['mineralDensityBudgetKNm3']
    g_plinth = width / 1000 * max(0, plinth_height) / 1000 * density
    g_floor = floor['Gk'] * projection_m
    G, Q, P = g_self + g_mineral + g_plinth + g_floor, floor['Qk'] * projection_m + 5, 7.5
    T = span * (1.35 * (g_mineral + g_plinth + g_floor) + 1.5 * Q) * width / 2000 + P * width / 2000
    comparisons = []
    for cover in beam['coverRangeMm']:
        v = mechanics(member(width, depth, beam['barsEachFace'], beam['barDiameterMm'], cover,
                             beam['linkDiameterMm'], beam['linkPitchMm'], G, Q, P, span), T)
        clear = (width - 2 * (cover + beam['linkDiameterMm'] + beam['barDiameterMm'] / 2)) / (beam['barsEachFace'] - 1) - beam['barDiameterMm']
        required = v['V'] * 1000 / (2 * .9 * v['d'] * (500 / 1.15)) + T * 1e6 / (2 * v['Ak'] * (500 / 1.15))
        v['outerLegRequired'] = required
        v['mainBarHorizontalClearMm'] = clear
        v['passChecks']['closedLink'] = required <= v['outerLegProvided']
        v['passChecks']['horizontalBarClear'] = clear >= s['ordinaryBarClearanceMm']
        v['pass'] = all(v['passChecks'].values())
        comparisons.append(v)
    if not all(v['pass'] for v in comparisons):
        diagnostics.append('NEW_BEAM_COMPARISON_FAILS')
    reaction = (1.35 * G + 1.5 * Q) * span / 2 + P
    bearing_pressure = reaction * 1000 / (beam['nodeTransferLengthMm'] * width)
    beam_length_m = (rect[2] - rect[0]) / 1000
    link_count = math.ceil(beam_length_m * 1000 / beam['linkPitchMm']) + 1
    minimum_cover = min(beam['coverRangeMm'])
    link_perimeter_m = 2 * (width + depth - 4 * (minimum_cover + beam['linkDiameterMm'] / 2)) / 1000
    main_steel_kg = 2 * beam['barsEachFace'] * math.pi * beam['barDiameterMm'] ** 2 / 4 / 1e6 * beam_length_m * 7850
    link_steel_kg = link_count * link_perimeter_m * math.pi * beam['linkDiameterMm'] ** 2 / 4 / 1e6 * 7850
    floor_area = new_bearings['floorAreaM2']
    direct_area = old_bearings['bearingAreaM2']
    if source_evidence_current and (abs(old_bearings['floorAreaM2'] - sum(floor['physicalAreaM2'].values())) > 1e-8 or abs(direct_area - floor['physicalAreaM2']['direct']) > 0.0000005):
        diagnostics.append('NATIVE_FLOOR_GEOMETRY_RECONCILIATION_FAILS')
    old_removed_volume = (old_bearings['floorAreaM2'] - direct_area) * layers[3] / 1000
    new_slab_volume = floor_area * layers[3] / 1000
    support_area = new_bearings['bearingAreaM2']
    pan = h['southCourtThresholdReference']['pan']
    draw = h['southCourtThresholdReference']['maintainedState']['panTask']
    route_gaps = []
    threshold = h['southCourtThresholdReference']
    for key in ('primaryTray', 'secondaryTray'):
        for start, end in zip(threshold[key]['route'], threshold[key]['route'][1:]):
            rr = [min(start[0], end[0]) - 50, min(start[1], end[1]) - 50,
                  max(start[0], end[0]) + 50, max(start[1], end[1]) + 50]
            if intersection(rr, rect):
                route_gaps.append({'id': key, 'sourceStart': start, 'sourceEnd': end,
                                   'lineBedToColdBeamMm': min(start[2], end[2]) + delta - cold_top,
                                   'qualification': 'centreline/declared100mm width screen only; wall/gauge/support envelopes not transferred'})
    overhangs = [{'id': key, 'endProjectionMm': g['endCantilevers']} for key, g in grid['girders'].items() if any(g['endCantilevers'])]
    cores = {'stairMidPost': h['structuralChanges']['stairMidPost']['concrete'],
             'southWetReceiver': h['structuralChanges']['newWetWallBeam']['southReceiverCore'],
             'northWetReceiver': h['structuralChanges']['newWetWallBeam']['northReceiverCore']}
    crossings = [{'id': key, 'planMm': r, 'construction': 'restart in the upper dry slab; no lower RC/bar continuity through mineral course'} for key, r in cores.items()]
    crossings += [{'id': 'northPortal-' + face + '-' + str(i),
                   'construction': 'full bearing on mineral course over named loggia girder; upper bars end above course'} for face in ('west', 'east') for i in (1, 2)]
    crossings += [{'id': 'stair-lower-toe', 'construction': 'seat on upper dry slab, no direct cold-grid contact'}]
    crossings += [{'id': 'inner-corner-' + k, 'construction': 'aligned dry wall/abutment above course; historical RC L and upper metal plate not inherited'} for k in ('SW', 'SE', 'NW', 'NE')]
    front = approach(h['approaches']['front'], ffl - grade, s['approachSlopeRatio'])
    garden_level = h['approaches']['garden']['terrace'] + delta
    garden = approach(h['approaches']['garden'], garden_level - grade, s['approachSlopeRatio'])
    return {'schema': 'dry-side-ground-section-result/2', 'caseId': s['caseId'], 'status': 'source-bound proposal; geometry and local member comparisons only',
            'sources': case['sources'], 'selected': False, 'diagnostics': diagnostics,
            'floorAssembly': {'sourceLayersTopDownMm': source_layers, 'authoredLayersTopDownMm': layers,
                              'scope': 'Only service depth is authored here; finish, glass and slab retain their bound source. No installed service or structural evidence transfers.'},
            'levelsMm': {'coldGridTop': cold_top, 'wetRCPlinth': [cold_top, course_bottom], 'mineralCourse': [course_bottom, dry_bottom],
                         'dryRC': [dry_bottom, dry_top], 'glass': [dry_top, dry_top + layers[2]],
                         'accessibleDistribution': [dry_top + layers[2], ffl - layers[0]],
                         'finish': [ffl - layers[0], ffl], 'ffl': ffl, 'occupiedTranslation': delta,
                         'authoredExteriorGrade': grade, 'sourceUnadoptedUniformGrade': h['approaches']['authoredExteriorGrade'],
                         'localSolum': s['localSolumMm'], 'exteriorAboveLocalSolum': grade - s['localSolumMm'],
                         'courseToGrade': course_bottom - grade,
                         'gradeClearanceToControlMargin': course_bottom - grade - s['minimumGradeClearanceMm'],
                         'nominalMinus150GradeWouldPass': course_bottom + 150 >= s['minimumGradeClearanceMm'],
                         'courtSouthWalking': h['sections']['waterLevels']['southLandingStart'] + delta,
                         'courtNorthWalking': h['sections']['waterLevels']['courtNorth'] + delta,
                         'gardenTerrace': garden_level, 'courtWeatherLeafDpcLowerReservation': ffl + 150,
                         'firstFFL': h['sections']['firstFFL'] + delta,
                         'firstFloorAboveAuthoredGeneralGrade': h['sections']['firstFFL'] + delta - grade,
                         'firstFloorAboveLocalSolum': h['sections']['firstFFL'] + delta - s['localSolumMm'],
                         'actualLowestAdjacentGround': None,
                         'MATeaves': h['exterior']['eaves'] + delta, 'MATridge': h['exterior']['ridge'] + delta},
            'quantities': {'sourceEvidenceCurrent': source_evidence_current,
                           'evidenceRule': 'Geometry quantities recompute from bound native declarations; sourceEvidenceCurrent marks old structural-receipt applicability, never physical acceptance.',
                           'floorAreaM2': floor_area, 'formerDirectOverlapM2': direct_area,
                           'originalOccupiedFloorAreaM2': old_bearings['floorAreaM2'],
                           'additionalDrySlabCoreEdgeAreaM2': floor_area - old_bearings['floorAreaM2'],
                           'additionalDrySlabCoreEdgeVolumeM3': (floor_area - old_bearings['floorAreaM2']) * layers[3] / 1000,
                           'wetPlinthUnion': new_bearings,
                           'additionalWetRCPlinthM3': support_area * max(0, plinth_height) / 1000,
                           'additionalWetRCPlinthWeightKN': support_area * max(0, plinth_height) / 1000 * density,
                           'newDrySlabGrossM3': new_slab_volume, 'removedOldFreeFieldGrossM3': old_removed_volume,
                           'addedRCCausedBySeparationM3': new_slab_volume - old_removed_volume,
                           'addedRCWeightBudgetKN': (new_slab_volume - old_removed_volume) * density,
                           'newColdBeamGrossM3': beam_gross_area * depth / 1000,
                           'newColdBeamNetAddedM3': beam_net_area * depth / 1000,
                           'newColdBeamNetAddedWeightKN': beam_net_area * depth / 1000 * density,
                           'fullWidthBearingFootprintM2': support_area,
                           'mineralCourseGrossReservationM3': support_area * course_height / 1000,
                           'mineralCourseGrossWeightBudgetKN': support_area * course_height / 1000 * s['mineralDensityBudgetKNm3'],
                           'mineralCourseOnlyConductancePerUnitLambdaWPerK': support_area / (course_height / 1000),
                           'actualMineralConductivity': None, 'actualJunctionHeatLoss': None},
            'approaches': {'front': front, 'garden': garden,
                           'clearWidthReservationMm': h['approaches']['clearWidthReservation'],
                           'status': 'same source flight-length/landing arithmetic, not accepted accessibility or a surveyed site'},
            'coldBeam': {'planMm': rect, 'axisSupportSpanMm': span * 1000, 'zMm': [cold_top - depth, cold_top],
                         'loadGKNm': G, 'loadQKNm': Q, 'variablePointULSKN': P,
                         'torsionBoundKNm': T, 'endReactionEnvelopeULSKN': reaction,
                         'nominalPlanNodeStressMPa': bearing_pressure, 'sourceConcreteCompressionComparisonMPa': .85 * 30 / 1.5,
                         'nodeTransferLengthMm': beam['nodeTransferLengthMm'],
                         'endSupportIds': ['court-W', 'court-E'], 'physicalEndBearingCredited': False, 'comparisons': comparisons,
                         'mainAndLinkBareSteelBeforeHooksAnchorageKg': main_steel_kg + link_steel_kg,
                         'closedLinkCountReservation': link_count,
                         'formerUnsupportedSeatM2': former_area, 'remainingUnsupportedSeatM2': unsupported,
                         'bearingAndCageAnchorageQualified': False},
            'sourceSupportControl': {'gridTopMm': cold_top, 'gridHeadCount': grid['headCount'],
                                     'groundSupport': h['sections']['groundSupport'],
                                     'localSolumIsNotExteriorGrade': True},
            'lowerStairToe': {'sourceControl': lower_toe, 'proposedSupport': 'upper dry slab',
                              'proposedSupportTopMm': dry_top, 'actualContactPlanMm': None,
                              'actualCageQualified': False},
            'downstreamApplicability': {'status': 'uncoordinated candidate only', 'occupiedTranslationMm': delta,
                                        'nominalPlansRemainOriginalLevels': True,
                                        'requiresRequalification': ['services/water and maintenance translation', 'actual tied roof and wind heights', 'compatible foundation/contact response', 'site water and access terrain']},
            'drawingGeometryMm': {'courtSouthGridY': [grid['girders']['court-S']['datum'] - grid['girders']['court-S']['width'] / 2, old_edge],
                                  'courtSouthGridZ': grid['girders']['court-S']['z'], 'seatPlan': seat,
                                  'panThickness': pan['thickness'], 'panBearingPads': pan['bearingPads'],
                                  'coldSupportRectangles': old_receivers},
            'threshold': {'panPlanUnchangedMm': pan['bodyEnvelope']['plan'], 'bodyDimensionsMm': pan['bodyEnvelope']['dimensions'],
                          'panProfileYZMm': [[q, z + delta] for q, z in pan['dryFold']['profileYZ']],
                          'panWetFloorYZMm': [[q, z + delta] for q, z in pan['fallY']],
                          'rearCrestMm': pan['rear']['crestZ'] + delta, 'endCrestMm': pan['ends']['crestZ'] + delta,
                          'mineralBearingBottomMm': dry_top, 'northDrawMm': draw['pullNorth'],
                          'planRotationRadiusMm': draw['planRotationRadius'], 'sourcePlanDrawReservationMm': draw['clearDrawPlan'],
                          'sourcePanMinimumToDryRCMm': pan['bodyEnvelope']['z'][0] + delta - dry_top,
                          'wetFixingsCredited': 0, 'renewalQualified': False,
                          'fixedDryBackingEndYmm': 4054, 'minimumOverlapChallengeMm': 20,
                          'minimumRiserGapChallengeMm': 2,
                          'completeAirWaterEndJointQualified': False},
            'locatedRouteScreens': route_gaps, 'retainedColdGridEndProjections': overhangs,
            'supportTopology': {'rule': 'continuous full-width bonded mineral bearing over every existing slab-contact grid/cap footprint plus new court seat support; all occupied RC, wall, stair and portal reinforcement wholly above it',
                                'bearingFootprintReservationOnly': True, 'walls': [w['id'] for w in h['groundWalls']],
                                'exteriorCoreFootprints': outer_core,
                                'upperComponentFootprints': upper_components,
                                'drySlabEdgeRule': 'extend upper dry RC to actual exterior structural-core weather faces; preserve open portals; no extension into weather leaf or cavity',
                                'crossings': crossings, 'foundationHeadsUncut': grid['headCount'],
                                'upperSlabPositiveCrossingCredited': False, 'mineralShearResistance': None,
                                'retentionQualified': False, 'contactQualified': False},
            'invalidatedEvidence': ['old ground-slab support/cage/crack/pour acceptance', 'retained ground slab credit',
                                    'old DPC/global load distribution', 'native old-height wind and roof assumptions',
                                    'actual 52-head compatible actions/movement', 'floor/wall/threshold air and thermal qualification'],
            'holds': ['actual mortar constituents and WCBL65 product dimension identity/bond/bed layout',
                      'distributed contact/sliding/shear and local mineral bearing under all adverse loads',
                      'new beam anchorage/node force and cold-grid reactions in compatible 52-head solve',
                      'court southwest upper-slab transfer and lower stair-toe contact-end/cage geometry',
                      'suspended slab body/joint air-moisture and site gas/pressure-water applicability',
                      'supported removable dry-apron/end/jamb seal under movement; pan/support renewal',
                      '3D surface/condensation/heat-loss with exact mineral properties',
                      'outer/court wet-leaf DPC/cavity tray and dry bearing separation',
                      'roof actual MAT geometry plus tied successor wind/support system',
                      'owner raised-plinth/approach/court aesthetic decision']}


def read_section_case(document, case_id=None):
    if set(document) != {'schema', 'status', 'sources', 'commonSettings', 'recommendedCaseId', 'cases'} or document['schema'] != 'dry-side-ground-section-comparison/2':
        raise ValueError('unsupported section comparison document')
    target = case_id or document['recommendedCaseId']
    authored = next((item for item in document['cases'] if item['caseId'] == target), None)
    if authored is None:
        raise ValueError('section case missing')
    return {'schema': 'dry-side-ground-section/2', 'status': document['status'],
            'sources': document['sources'], 'settings': document['commonSettings'] | authored}


def derive_comparison(document, raw_sources):
    read_section_case(document)
    results = {}
    for authored in document['cases']:
        if set(authored) != {'caseId', 'courseBottomMm', 'exteriorGradeMm', 'localSolumMm'}:
            raise ValueError('unsupported authored section case')
        if authored['caseId'] in results:
            raise ValueError('duplicate section case ID')
        case = read_section_case(document, authored['caseId'])
        results[authored['caseId']] = derive_section(case, raw_sources)
    if document['recommendedCaseId'] not in results:
        raise ValueError('recommended section case missing')
    return {'schema': 'dry-side-ground-section-comparison-result/2', 'selected': False,
            'recommendedCaseId': document['recommendedCaseId'], 'cases': results,
            'recommendation': 'Develop raised530 on nominal exterior with separately assessed local solum; deep-exterior350 is a special-site candidate, rejected as general compact-house default.'}


def render_section(result):
    z = result['levelsMm']
    beam = result['coldBeam']
    out = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1480 1030" width="1480" height="1030">',
           '<rect width="1480" height="1030" fill="#faf8f1"/>',
           '<g font-family="sans-serif" fill="#233943">',
           '<text x="35" y="38" font-size="25">Separated dry structure on continuous mineral bearing</text>',
           '<text x="35" y="68" font-size="16">UNSELECTED · authored exterior and local solum kept separate · no installed or house acceptance</text>']
    geometry = result['drawingGeometryMm']
    grid_y, grid_z = geometry['courtSouthGridY'], geometry['courtSouthGridZ']
    seat = geometry['seatPlan']
    pan = result['threshold']
    pan_start = pan['panProfileYZMm'][0][0]
    xmin = min(grid_y[0], beam['planMm'][1], seat[1]) - 250
    xmax = max(grid_y[1], beam['planMm'][3], seat[1] + seat[3]) + 100
    zmin = min(grid_z[0], beam['zMm'][0])
    zmax = max(z['ffl'], pan['endCrestMm']) + 100
    xscale, zscale = 720 / (xmax - xmin), 560 / (zmax - zmin)
    X = lambda q: 65 + (q - xmin) * xscale
    Z = lambda q: 720 - (q - zmin) * zscale

    def rect(a, b, low, high, fill, label=None):
        if high <= low:
            return
        out.append(f'<rect x="{X(a):.2f}" y="{Z(high):.2f}" width="{(b-a)*xscale:.2f}" height="{(high-low)*zscale:.2f}" fill="{fill}" stroke="#52666c"/>')
        if label:
            out.append(f'<text x="{X(a)+8:.2f}" y="{Z((low+high)/2)+5:.2f}" font-size="13">{label}</text>')

    rect(*grid_y, *grid_z, '#b5bdb8', 'existing cold court-S grid')
    rect(beam['planMm'][1], beam['planMm'][3], *beam['zMm'], '#8d9fa0')
    rect(*grid_y, *z['wetRCPlinth'], '#a2b4b9', f'wet RC plinth {z["wetRCPlinth"][1]-z["wetRCPlinth"][0]:g}')
    rect(beam['planMm'][1], beam['planMm'][3], *z['wetRCPlinth'], '#a2b4b9')
    rect(*grid_y, *z['mineralCourse'], '#b18563', f'{z["mineralCourse"][1]-z["mineralCourse"][0]:g} bonded mineral reservation')
    rect(beam['planMm'][1], beam['planMm'][3], *z['mineralCourse'], '#b18563')
    rect(xmin, seat[1]+seat[3], *z['dryRC'], '#d2d8d5', f'NEW suspended RC {z["dryRC"][1]-z["dryRC"][0]:g}')
    rect(xmin, pan_start, *z['glass'], '#dbc893', f'bare glass {z["glass"][1]-z["glass"][0]:g}')
    rect(xmin, pan_start, *z['accessibleDistribution'], '#f0e8cb', f'accessible {z["accessibleDistribution"][1]-z["accessibleDistribution"][0]:g}')
    rect(xmin, pan_start, *z['finish'], '#8d775c')
    profile = pan['panProfileYZMm'] + [pan['panWetFloorYZMm'][0], pan['panWetFloorYZMm'][-1]]
    out.append('<polyline points="' + ' '.join(f'{X(q):.2f},{Z(zz):.2f}' for q, zz in profile) + '" fill="none" stroke="#236b87" stroke-width="4"/>')
    pad = geometry['panBearingPads'][len(geometry['panBearingPads']) // 2]
    y0, y1 = pad['y']
    (p0, pz0), (p1, pz1) = pan['panWetFloorYZMm']
    underside = lambda y: pz0 + (pz1-pz0) * (y-p0) / (p1-p0) - geometry['panThickness']
    points = [(y0, z['dryRC'][1]), (y1, z['dryRC'][1]), (y1, underside(y1)), (y0, underside(y0))]
    out.append('<polygon points="'+' '.join(f'{X(q):.2f},{Z(zz):.2f}' for q, zz in points)+'" fill="#c9b49a" stroke="#52666c"/>')
    front = result['approaches']['front']
    quantity = result['quantities']
    governing = beam['comparisons'][-1]
    dimensions = ' × '.join(f'{v:g}' for v in pan['bodyDimensionsMm'])
    course_range = '..'.join(f'{v:g}' for v in z['mineralCourse'])
    unsupported_max = max(row['unsupportedAreaM2'] for row in result['supportTopology']['upperComponentFootprints'])
    out += [f'<text x="{X(xmin)}" y="{Z(z["ffl"])-17}" font-size="17">FFL {z["ffl"]:+g}; occupied structure {z["occupiedTranslation"]:+g}</text>',
            f'<text x="865" y="95" font-size="14">{escape(result["caseId"])}</text>',
            '<text x="865" y="118" font-size="19">Actual new load path</text>',
            '<text x="865" y="149" font-size="15">Aligned walls / tied roof / dry slab</text>',
            '<text x="865" y="176" font-size="15">→ bonded full-width mineral course</text>',
            f'<text x="865" y="203" font-size="15">→ cold RC grid → existing {result["sourceSupportControl"]["gridHeadCount"]} heads</text>',
            '<text x="865" y="245" font-size="16">No bars or RC bridge the course.</text>',
            '<text x="865" y="274" font-size="15">Shear, contact and retention remain unproved.</text>',
            f'<text x="865" y="316" font-size="16">New cold crossbeam: {governing["width"]:g} × {governing["depth"]:g}</text>',
            f'<text x="865" y="345" font-size="15">{beam["axisSupportSpanMm"]/1000:g}m court-W/E; {escape(governing["steel"])}</text>',
            f'<text x="865" y="374" font-size="15">2-leg H{governing["linkDiameter"]:g}/{governing["linkPitch"]:g}; cover {min(q["cover"] for q in beam["comparisons"]):g}..{max(q["cover"] for q in beam["comparisons"]):g}</text>',
            f'<text x="865" y="403" font-size="15">M{beam["comparisons"][-1]["M"]:.2f} / MR{min(q["MR"] for q in beam["comparisons"]):.2f} kNm; V{beam["comparisons"][-1]["V"]:.2f}kN</text>',
            f'<text x="865" y="432" font-size="15">Seat unsupported: {beam["remainingUnsupportedSeatM2"]:.4f}m²; former {beam["formerUnsupportedSeatM2"]:.4f}m²</text>',
            f'<text x="865" y="461" font-size="14">Largest direct-support gap {unsupported_max:.6f}m²; slab transfer unqualified.</text>',
            f'<text x="865" y="486" font-size="14">Plan node {beam["nodeTransferLengthMm"]:g}×{governing["width"]:g}; {beam["nominalPlanNodeStressMPa"]:.3f}MPa; no bearing credit.</text>',
            f'<text x="65" y="750" font-size="17">Authored exterior {z["authoredExteriorGrade"]:+g}; local solum {z["localSolum"]:+g}; terrain difference {z["exteriorAboveLocalSolum"]:g}mm.</text>',
            f'<text x="65" y="780" font-size="16">Court south {z["courtSouthWalking"]:+g}; wet-leaf tray ≥{z["courtWeatherLeafDpcLowerReservation"]:+g}; inner mineral {course_range}.</text>',
            f'<text x="65" y="810" font-size="16">Pan {dimensions}mm; NORTH {pan["northDrawMm"]:g}mm draw. Full end/air joint remains unqualified.</text>',
            '<text x="65" y="840" font-size="16">No court paving, mortar, external deck, service or temporary prop may bridge to the dry structure.</text>',
            f'<text x="65" y="880" font-size="17">Additional RC: separation {quantity["addedRCCausedBySeparationM3"]:.4f}m³; wet plinth {quantity["additionalWetRCPlinthM3"]:.4f}m³; beam {quantity["newColdBeamNetAddedM3"]:.4f}m³ net.</text>',
            f'<text x="65" y="910" font-size="16">Front 1:{front["slopeRatio"]:g}: {front["slopingRunMm"]/1000:g}m slopes +{front["landings"]*front["landingLengthMm"]/1000:g}m landings = {front["totalStraightReservationMm"]/1000:g}m reservation.</text>',
            '<text x="65" y="940" font-size="16">Owner must review the raised plinth and approach. No site, physical, gas or thermal acceptance.</text>',
            '<text x="65" y="985" font-size="13">Source identities and adverse/perturbation checks accompany dry-side-ground-section.results.json. Diagram shows reservations.</text>',
            ]
    source_rectangles = geometry['coldSupportRectangles']
    plan_low = min(v for r in source_rectangles for v in (r[0], r[1]))
    plan_high = max(v for r in source_rectangles for v in (r[2], r[3]))
    scale = 205 / (plan_high - plan_low)
    out.append('<text x="865" y="505" font-size="14">Bound core/support footprints · open portals preserved</text>')
    for rectangle, colour in [(r, '#d5ddd9') for r in source_rectangles] + [(row['planMm'], '#b18563') for row in result['supportTopology']['upperComponentFootprints']] + [(beam['planMm'], '#236b87')]:
        x0, y0, x1, y1 = rectangle
        out.append(f'<rect x="{900+(x0-plan_low)*scale:.2f}" y="{730-(y1-plan_low)*scale:.2f}" width="{(x1-x0)*scale:.2f}" height="{(y1-y0)*scale:.2f}" fill="{colour}"/>')
    out.append('</g></svg>')
    return '\n'.join(out) + '\n'


def render_comparison(result):
    primary = result['cases'][result['recommendedCaseId']]
    svg = render_section(primary).replace('0 0 1480 1030', '0 0 1480 1210').replace('height="1030"', 'height="1210"')
    rows = ['<g font-family="sans-serif" fill="#233943">',
            '<text x="65" y="1045" font-size="18">Compared site envelopes · preferred development geometry only; owner appearance decision retained</text>']
    for index, (case_id, item) in enumerate(result['cases'].items()):
        z, q, a = item['levelsMm'], item['quantities'], item['approaches']['front']
        text = f'{case_id}: FFL{z["ffl"]:+g}; exterior{z["authoredExteriorGrade"]:+g}; solum{z["localSolum"]:+g}; wetRC {q["additionalWetRCPlinthM3"]:.3f}m³; front {a["totalStraightReservationMm"]/1000:g}m'
        rows.append(f'<text x="65" y="{1080+index*32}" font-size="16">{escape(text)}</text>')
    rows.extend(['<text x="65" y="1160" font-size="15">Deep exterior is rejected as the general compact-house default. Local low solum needs its own passive water/daylight route.</text>', '</g>'])
    return svg.replace('</svg>', '\n'.join(rows) + '\n</svg>')


def main():
    import argparse
    import sys
    parser = argparse.ArgumentParser()
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument('--check', action='store_true')
    mode.add_argument('--read', action='store_true')
    parser.add_argument('--case-id')
    args = parser.parse_args()
    folder = Path(__file__).resolve().parent
    root = folder.parents[2]
    case = json.loads((folder / 'dry-side-ground-section.json').read_text())
    raw = {p: (root / p).read_bytes() for p in case['sources']}
    if args.read:
        print(json.dumps(read_section_case(case, args.case_id)))
        return
    if not args.check and not sys.stdin.isatty():
        incoming = sys.stdin.read()
        if incoming.strip():
            replay = derive_section(json.loads(incoming), raw)
            print(json.dumps({'schema': 'dry-side-ground-section-replay/1', 'result': replay, 'sectionSvg': render_section(replay)}))
            return
    if args.case_id:
        raise ValueError('--case-id requires --read')
    result = derive_comparison(case, raw)
    outputs = {'dry-side-ground-section.results.json': json.dumps(result, indent=2) + '\n',
               'dry-side-ground-section.svg': render_comparison(result)}
    for name, content in outputs.items():
        if args.check:
            if (folder / name).read_text() != content:
                raise ValueError('stale output: ' + name)
        else:
            (folder / name).write_text(content)
    print(json.dumps({key: {'fflMm': value['levelsMm']['ffl'], 'newBeamComparisonPass': all(q['pass'] for q in value['coldBeam']['comparisons']), 'diagnostics': value['diagnostics']} for key, value in result['cases'].items()}))


if __name__ == '__main__':
    main()
