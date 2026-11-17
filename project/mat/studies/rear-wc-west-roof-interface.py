"""Compare the rear foul stack with the controlled west roof goods."""

from hashlib import sha256
from itertools import pairwise
from json import dumps, loads
from math import acos, ceil, cos, dist, hypot, isfinite, radians, sin, sqrt, tan
from pathlib import Path
from runpy import run_path
from subprocess import check_output
from sys import argv, stdin


PROJECT_SOURCES = (
        'project/mat/studies/rear-wc-west-gravity.json',
        'project/had/studies/water-replan.json',
        'project/rof/studies/outer_66_checkpoint/outer-66-pieces.json',
        'project/str/studies/current-house-grid.json',
        'project/str/studies/current-house-welded-heel.json',
        'project/str/studies/current-house-welded-network.json',
        'project/str/studies/open-loggia-support.json',
)

ROOF_PLAN_METHOD = 'project/str/studies/current-house-roof-bracing.py'
DISTANCE_METHOD = 'project/str/studies/court_tie_starter_paths.py'
RENEWAL_SOURCE = 'project/rof/studies/outer_physical_checkpoint/outer-renewal-path-checks.json'
HAD_SCHEDULE = 'project/had/studies/current-house-services.json'
RETURN_SOURCES = (
    *PROJECT_SOURCES, ROOF_PLAN_METHOD, DISTANCE_METHOD, RENEWAL_SOURCE, HAD_SCHEDULE,
    'project/str/studies/current-house-membrane.py', 'project/str/studies/structural-linear.py',
)
REFERENCE = {'riserAxisXYMm': [775, 9090], 'wetStackAirTakeoffZMm': 3800, 'terminalZMm': 8000}
PLACEMENT_MM = 10
DESIGN_RESERVE_MM = 25
DRY_ENVELOPE_RADIUS_MM = 95
FLASHING_RADIUS_MM = 150
BEND_RADIUS_MM = 110


def study(root):
    inputs = [(root / path).read_bytes() for path in PROJECT_SOURCES]
    gravity, house, roof, grid, heel, network, loggia = map(loads, inputs)
    model = house['model']
    stack_x, stack_y = gravity['geometry']['outerStackXyMm']
    radius = gravity['chase']['straightTubeNominalODMm'] / 2
    stack_plan = [abs(stack_x) - radius, abs(stack_x) + radius]
    vent_z = gravity['terminal']['minVentZFromKnownOpeningHeadsMm']
    highest_inlet_z = gravity['routing']['upperAxisAtExteriorStackZMm']
    setting = 10
    working_gap = 25

    # Reserve space for the pipe, clamps and independent mast as one body.
    mast_radius = 1220
    mast_half_width = 95
    mast_near = mast_radius - mast_half_width
    mast_far = mast_radius + mast_half_width
    swept_y = [stack_y - mast_half_width - setting - working_gap,
               stack_y + mast_half_width + setting + working_gap]
    goods = {}
    for circuit, lips in [('primary', [130, 230]), ('lower', [125])]:
        piece, = (piece for piece in roof['pieces'] if piece['face'] == 'west'
                  and piece['circuit'] == circuit
                  and piece['commonPlanAlongIntervalMM'][0] < stack_y < piece['commonPlanAlongIntervalMM'][1])
        radial = [point[0] for point in piece['polygonRadialAlongMM']]
        inside, outside = min(radial), max(radial)
        south, north = piece['commonPlanAlongIntervalMM']
        pickup = piece['pickupAlongMM']
        bed = piece['pickupBedZMM'] + (pickup - stack_y) / 200
        overlap = min(outside, stack_plan[1]) - max(inside, stack_plan[0])
        assert overlap == radius * 2 and highest_inlet_z < bed < bed + max(lips) < vent_z
        shifted_north = swept_y[1] - south
        goods[circuit] = {
            'piece': piece['id'],
            'pieceYmm': [south, north],
            'installedRadialMM': [inside, outside],
            'bedZmm': bed,
            'lipZmm': [bed + lip for lip in lips],
            'stackOverlapMM': overlap,
            'clearanceAfter400OutAndSettingMM': mast_near - outside - 400 - setting,
            'northShiftBeforePassingMastMM': shifted_north,
            'southShiftBeforePassingMastMM': north - swept_y[0],
            'northShiftBeyondPickupCentred1200BayMM': north + shifted_north - pickup - 600,
        }

    path_west, _, path_width, _ = model['gardenFailureBypass']['groundPathEnvelope'][1]
    escape_east_r = -(path_west + path_width)
    worker_r, worker_y, worker_body_r = 1050, stack_y + 425, 300
    worker_to_mast = hypot(mast_radius - worker_r, stack_y - worker_y) - mast_half_width - worker_body_r - setting
    worker_to_escape = escape_east_r - worker_r - worker_body_r - setting
    assert min(worker_to_mast, worker_to_escape) >= working_gap

    current_foul, = (duty for duty in model['servicesInterface']['otherServiceDuties'] if duty['id'] == 'rear-soil')
    host_x, host_y, host_z = current_foul['path'][-1]
    dry_x, dry_y, dry_top = current_foul['path'][0]
    assert [dry_x, dry_y] == gravity['retainedWC']['currentlyFormedPortXYAndDiameterMm'][:2]
    shell = model['shell']
    hip_distance = abs(shell - dry_x - dry_y) / sqrt(2)
    hip_rail_outer = max(edge for rail in heel['node']['hip']['railBoundsY'] for edge in rail)
    north_rows = loggia['actual_roof']['purlin_rows']
    west_row_x = min(shell - row for row in north_rows if row < shell)
    west_row_end_y = shell - west_row_x
    assert dry_x < shell - dry_y and shell / 2 < dry_y < west_row_end_y
    secondary = network['sections']['secondary']
    purlin_min_half_width = min(secondary['B'], secondary['H']) / 2
    dry_screen_diameter = 75
    dry_screen_radius = dry_screen_diameter / 2
    hip_gap = hip_distance - hip_rail_outer - dry_screen_radius
    purlin_gap_bound = abs(dry_x - west_row_x) - purlin_min_half_width - dry_screen_radius
    assert hip_gap < 0 and purlin_gap_bound < 0 and dry_top > heel['node']['hip']['roofCentreAtHeel']

    branch = gravity['routing']['upperWC']
    (first_x, first_y), (turn_x, turn_y) = branch['planMM'][:2]
    assert first_y == turn_y == dry_y and turn_x < dry_x < first_x
    fall_ratio = float(gravity['routing']['gradient'].split(':')[-1])
    takeoff_axis_z = branch['endAxisZMm'] + branch['fallMM'] - (first_x - dry_x) / fall_ratio
    floor_z = branch['endAxisZMm'] - 80 - gravity['routing']['upperWallSleeveUndersideAboveFFLMm']
    assert floor_z - host_z > 1300 and gravity['routing']['lowerAxisAtExteriorStackZMm'] - host_z > 2000
    grade_z = -1800
    crown_cover = 600
    buried_outside_radius = 80
    upstream_axis_z = grade_z - crown_cover - buried_outside_radius
    direct_run = hypot(host_x - stack_x, host_y - stack_y)
    drop = direct_run / 40
    west_girder = grid['girders']['outer-W']
    girder_edge_r = west_girder['width'] / 2 - west_girder['datum']

    return {
        'disposition': 'Reject the straight tall stack. Retain the rear floor port in source pending coordinated redesign.',
        'sourceSHA256': {path: sha256(data).hexdigest() for path, data in zip(PROJECT_SOURCES, inputs)},
        'existingStackXYmm': [stack_x, stack_y],
        'screenedBareVentZmm': vent_z,
        'westGoods': goods,
        'bareVentMinimumRadiusForInstalledGoodsMM': goods['lower']['installedRadialMM'][1] + radius + setting,
        'standOffVent': {
            'trialMastRadiusMM': mast_radius,
            'completeSupportReserveDiameterMM': mast_half_width * 2,
            'escapeRadialMM': [escape_east_r, -path_west],
            'mastClearOfEscapeAfterSettingMM': escape_east_r - mast_far - setting,
            'bodyCentreRadiusAndYmm': [worker_r, worker_y],
            'bodyClearOfMastAfterSettingMM': worker_to_mast,
            'bodyClearOfEscapeAfterSettingMM': worker_to_escape,
            'scope': 'Plan and initial withdrawal only. The lower 400 mm movement is a sensitivity. Full pan transfer, wet pickup, support, tool and escape states remain unproved.',
        },
        'unalteredDryRiser': {
            'roofReservationXYZmm': [dry_x, dry_y, dry_top],
            'idealBareOutsideDiameterMM': dry_screen_diameter,
            'nearestHipAxisDistanceMM': hip_distance,
            'hipOuterRailFaceFromAxisMM': hip_rail_outer,
            'bareVentInterferenceWithHipRailMM': -hip_gap,
            'firstInteriorWestPurlinXAndNorthCentrelineEndYmm': [west_row_x, west_row_end_y],
            'purlinMinimumHalfWidthInPlanMM': purlin_min_half_width,
            'minimumBareVentInterferenceWithPurlinMM': -purlin_gap_bound,
            'possibleDryTakeoffAtWCBranchAxisZmm': takeoff_axis_z,
            'WCVerticalAbovePriorHostAxisMM': floor_z - host_z,
            'showerStackConnectionAbovePriorHostAxisMM': gravity['routing']['lowerAxisAtExteriorStackZMm'] - host_z,
            'scope': 'The WC takeoff would connect to the external stack through the wet WC branch. It does not provide separate open stack ventilation during flush or surcharge. A roof offset and an independently established air path are distinct obligations.',
        },
        'independentFoul': {
            'previousConditionalHostXYZmm': [host_x, host_y, host_z],
            'trialGradeZmm': grade_z,
            'trialCoverMM': crown_cover,
            'maximumUpstreamAxisZmm': upstream_axis_z,
            'minimumDirectPlanLengthMM': direct_run,
            'minimumDropAt1In40MM': drop,
            'maximumHostAxisZmmWithSameCover': upstream_axis_z - drop,
            'upstreamCoverMMIfPreviousHostLevelHeld': grade_z - (host_z + drop + buried_outside_radius),
            'minimumPipeEnvelopeToWestGirderPlanMM': abs(stack_x) - buried_outside_radius - girder_edge_r,
            'scope': 'Direct run is a plan lower bound. Confirm actual grade, fitted branches, excavation, separate vent, inspection and lawful receiving.',
        },
    }


def offset(a, b, factor):
    return tuple(x + factor*y for x, y in zip(a, b))


def unit(a, b):
    length = dist(a, b)
    return tuple((y-x)/length for x, y in zip(a, b))


def rounded_centreline(points):
    trims = []
    for a, p, b in zip(points, points[1:], points[2:]):
        incoming, outgoing = unit(a, p), unit(p, b)
        dot = max(-1, min(1, sum(x*y for x, y in zip(incoming, outgoing))))
        angle = acos(dot)
        if angle < 1e-7:
            trims.append((0, (p,)))
            continue
        take = BEND_RADIUS_MM*tan(angle/2)
        entry = offset(p, incoming, -take)
        inward = tuple((y-x*dot)/sin(angle) for x, y in zip(incoming, outgoing))
        centre = offset(entry, inward, BEND_RADIUS_MM)
        radius = tuple(x-y for x, y in zip(entry, centre))
        n = max(1, ceil(BEND_RADIUS_MM*angle/5))
        trims.append((take, tuple(
            offset(offset(centre, radius, cos(angle*i/n)), incoming, BEND_RADIUS_MM*sin(angle*i/n))
            for i in range(n+1)
        )))
    all_trims = [(0, (points[0],)), *trims, (0, (points[-1],))]
    remaining = min(dist(a, b)-left[0]-right[0]
                    for (a, b), (left, right) in zip(pairwise(points), pairwise(all_trims)))
    if remaining < 0:
        return (), remaining
    return tuple(point for _, arc in all_trims for point in arc), remaining


def boxes_gap(segments, bounds, radius):
    minimum = float('inf')
    for a, b in segments:
        length = dist(a, b)
        samples = max(1, ceil(length/5))
        step = tuple((y-x)/samples for x, y in zip(a, b))
        sampled = min(hypot(*(max(lo-x, x-hi, 0) for x, (lo, hi) in zip(offset(a, step, i), bounds)))
                      for i in range(samples+1))
        minimum = min(minimum, sampled-length/(2*samples))
    return minimum-radius-PLACEMENT_MM


def planar_gap(point, segments, radius):
    def distance(a, b):
        direction = unit(a, b)
        along = max(0, min(dist(a, b), sum((p-x)*v for p, x, v in zip(point, a, direction))))
        return dist(point, offset(a, direction, along))
    return min(distance(a, b) for a, b in segments)-radius-PLACEMENT_MM


def inputs_for_vent(root):
    sources = {name: (root/name).read_bytes() for name in RETURN_SOURCES}
    loaded = {name: loads(content) for name, content in sources.items() if name.endswith('.json')}
    structure = run_path(str(root/ROOF_PLAN_METHOD))
    distance = run_path(str(root/DISTANCE_METHOD))['segment_distance']
    return loaded, structure, distance, {name: sha256(content).hexdigest() for name, content in sources.items()}


def accept_case(case):
    if not isinstance(case, dict) or set(case) != set(REFERENCE):
        raise ValueError('Expected a versioned rear dry return case')
    axis = case['riserAxisXYMm']
    values = [*axis, case['wetStackAirTakeoffZMm'], case['terminalZMm']] if isinstance(axis, list) else []
    if len(values) != 4 or any(type(n) not in (int, float) or not isfinite(n) for n in values):
        raise ValueError('Expected two finite riser coordinates, takeoff and terminal in millimetres')
    x, y, start, terminal = values
    if not (600 <= x <= 1050 and 8950 <= y <= 9500 and 3650 <= start <= 5800 and 7300 <= terminal <= 8500):
        raise ValueError('This method covers the west rear-bath dry return, below the outer roof goods')
    return values


def dry_return(case, occupied, data):
    x, y, start, terminal = accept_case(case)
    sources, structure, segment_distance, digest = data
    gravity, _, roof, _, heel, network, loggia = (sources[path] for path in PROJECT_SOURCES)
    trial_tray = sources[RENEWAL_SOURCE]['lowTrayCoverageCounterexample']
    selected = sources[HAD_SCHEDULE]['selectedServiceInterfaces']
    house = occupied['model']
    fan = next(row for row in house['servicesInterface']['extract'] if row['id'] == 'rear-bath')
    head = next(row for row in selected['heads'] if row['room'] == 'rearBath')
    radiator = next(row for row in selected['radiatorMaintenance'] if row['id'] == 'rear-W')
    stage = head['renewal']['stage']
    stack_x, stack_y = gravity['geometry']['outerStackXyMm']
    highest_wet = gravity['routing']['upperAxisAtExteriorStackZMm']
    wet_diameter = gravity['chase']['straightTubeNominalODMm']
    wet = {
        'stackAxisXYMm': [stack_x, stack_y],
        'upperWC': gravity['routing']['upperWC'], 'lowerShower': gravity['routing']['independentLowerShower'],
        'junctionLevelsZMm': [gravity['routing']['lowerAxisAtExteriorStackZMm'], highest_wet],
    }
    south_wall = next(row for row in house['upperWalls'] if row['id'] == 'rear-wet-south')
    interior_x = house['upperFurniture']['rear-cabinet'][0]
    knee_x = interior_x+30.5
    grade_ratio = float(gravity['routing']['gradient'].split(':')[-1])
    cross_length = hypot(knee_x-stack_x, y-stack_y)
    knee_z = start+cross_length/grade_ratio
    riser_z = knee_z+(x-knee_x)/grade_ratio
    corners = [(stack_x, stack_y, highest_wet), (stack_x, stack_y, start),
               (knee_x, y, knee_z), (x, y, riser_z), (x, y, terminal)]
    rounded, straight_tangent = rounded_centreline(corners)
    if not rounded:
        return {
            'case': case, 'state': 'geometric-failure', 'installedAcceptance': False, 'wet': wet,
            'sourceSHA256': digest, 'remainingStraightBetweenBendsMm': straight_tangent,
            'failedChecks': ['BEND_TANGENT_LENGTH'], 'clearanceMm': {},
        }

    segments = tuple(pairwise(rounded))
    reserve = DRY_ENVELOPE_RADIUS_MM + BEND_RADIUS_MM*(1-cos(5/(2*BEND_RADIUS_MM)))
    settings_radius = reserve+PLACEMENT_MM
    def check_dry(bounds):
        return boxes_gap(segments, bounds, reserve)

    def bound_duct(path, radius):
        return min(segment_distance(*line, *other) for line in segments for other in pairwise(path))-radius-settings_radius

    wall_fraction = -stack_x/(knee_x-stack_x)
    wall_y = stack_y+(y-stack_y)*wall_fraction
    wall_z = start+(knee_z-start)*wall_fraction
    sleeve_radius = gravity['geometry']['sleeveDiameterMm']/2
    wall_radius = sleeve_radius*dist(corners[1], corners[2])/(knee_x-stack_x)
    floor_z = house['sections']['firstFFL']
    arch_entries = [row for row in house['archOpeningRegister']['FIRST'] if row['wall'] == 'outer-west']
    along_wall_at_finish = stack_y+(y-stack_y)*(interior_x-stack_x)/(knee_x-stack_x)
    wall_y_range = sorted((wall_y, along_wall_at_finish))
    wall_z_range = (wall_z, start+(knee_z-start)*(interior_x-stack_x)/(knee_x-stack_x))

    def interval_distance(value, bounds):
        return max(bounds[0]-value, value-bounds[1], 0)

    def arch_reserve(row):
        height = row['head']-row['spring']
        radius = (row['width']**2+4*height**2)/(8*height)
        centre_z = floor_z+row['head']-radius
        outside_circle = hypot(interval_distance(row['centre'], wall_y_range),
                               interval_distance(centre_z, wall_z_range))
        return outside_circle-radius-row['radialRingTrial']-wall_radius-PLACEMENT_MM

    raw_window = min(interval_distance(row['centre'], wall_y_range)-row['width']/2
                     for row in arch_entries)-wall_radius-PLACEMENT_MM
    arch_gap = min(arch_reserve(row) for row in arch_entries)
    nearest_w3 = next(row for row in arch_entries if row['id'] == 'west-window-3')

    def rect_box(rect, height):
        xx, yy, width, depth = rect
        return ((xx,xx+width), (yy,yy+depth), height)

    def west_box(radial, along, levels):
        return ((-radial[1], -radial[0]), along, levels)

    shell = house['shell']
    roofs = loggia['actual_roof']['purlin_rows']
    purlin_radius = hypot(network['sections']['secondary']['B']/2, network['sections']['secondary']['H']/2)
    west_rows = sorted(shell-value for value in roofs)
    purlin_gap = min(abs(x-axis) for axis in west_rows)-purlin_radius-FLASHING_RADIUS_MM-PLACEMENT_MM
    radial_profile = max(max(edge for rail in row['railBoundsY'] for edge in rail) for row in heel['node'].values())
    brace_gap = planar_gap((x, y), structure['braces'], FLASHING_RADIUS_MM+structure['DIA']/2)
    radial_gap = planar_gap((x, y), structure['radials'], FLASHING_RADIUS_MM+radial_profile)
    roof_pitch = house['roofDevelopment']['pitch']
    nominal_cover = heel['height']['eave']+(x+FLASHING_RADIUS_MM)*tan(radians(roof_pitch))
    bend_from_oblique = unit(corners[1], corners[2])
    bend_to_room = unit(corners[2], corners[3])
    wall_turn_dot = max(-1, min(1, sum(a*b for a,b in zip(bend_from_oblique, bend_to_room))))
    wall_to_inside_tangent = knee_x-interior_x-BEND_RADIUS_MM*tan(acos(wall_turn_dot)/2)*bend_from_oblique[0]

    wet_stage_inlet = (stack_x, stack_y, gravity['routing']['lowerAxisAtExteriorStackZMm'])
    wet_segments = ((wet_stage_inlet, corners[0]),)
    approach_gravity = min(b[2]-a[2] for a,b in segments)
    lowest_interior = min(p[2] for p in rounded if p[0] >= interior_x)
    rear_basin = house['upperFurniture']['rear-basin']
    moving_cartridge_gap = min(check_dry(west_box(
        [cartridge['initial']['outwardNormalMM'][0], cartridge['dryRestNormalMM'][1]],
        cartridge['dryRestAlongMM'],
        [cartridge['dryRest']['z'][0], cartridge['initial']['z'][1]]
    )) for cartridge in head['renewal']['cartridges'])
    radiators = [rect_box(radiator['installedPlan'], tuple(floor_z+n for n in radiator['finalZ'])),
                 rect_box(radiator['carrier'], (floor_z, floor_z+radiator['liftedZ'][1]))]
    stage_deck = west_box(stage['outwardNormalMM'], stage['alongMM'], (stage['deckZ'], stage['deckZ']))
    tray_envelope = west_box(
        (trial_tray['trialExtendedBackRMM'], trial_tray['outboardOnlyRadialMM'][1]),
        (0, shell), (trial_tray['floorZMM'], trial_tray['rimZMM']))
    roof_circuits = []
    for row in roof['pieces']:
        if row['face'] != 'west':
            continue
        south, north = row['commonPlanAlongIntervalMM']
        if north < min(stack_y, y)-settings_radius or south > max(stack_y, y)+settings_radius:
            continue
        radial = [point[0] for point in row['polygonRadialAlongMM']]
        max_grade_difference = max(abs(row['pickupAlongMM']-station) for station in (south,north))/200
        roof_circuits.append(west_box((min(radial), max(radial)), (south,north),
                                      (row['pickupBedZMM']-max_grade_difference,
                                       row['pickupBedZMM']+max_grade_difference+230)))
    scaffold_legs = [west_box((rr,rr+dr), (yy,yy+dy), (house['gardenFailureBypass']['grade'],stage['deckZ']))
                     for yy,rr,dy,dr in stage['feet']]
    clearance = {
        'westWindowRawPlan': raw_window, 'westWindowConservativeFullArch': arch_gap,
        'westWindowThreeSillVertical': floor_z+nearest_w3['sill']-wall_z_range[1]-wall_radius-PLACEMENT_MM,
        'rearBathExtractFullCollar': bound_duct(fan['path'], fan['selectedRoute']['maximumCollarOD']/2),
        'rearBathIndependentCondensate': bound_duct(fan['condensatePort']['path'], fan['condensatePort']['formedDiameter']/2),
        'rearBathSouthWall': y-south_wall['finishedFaces'][1]-settings_radius,
        'rearBasinShaftPlan': planar_gap((x,y), (((rear_basin[0],rear_basin[1]), (rear_basin[0],rear_basin[1]+rear_basin[3])),), reserve),
        'rearRadiatorAndCarrier': min(check_dry(box) for box in radiators),
        'headRenewalDeck': min(check_dry(stage_deck), boxes_gap(wet_segments, stage_deck, wet_diameter/2)),
        'headRenewalScaffoldLegs': min(min(check_dry(box), boxes_gap(wet_segments, box, wet_diameter/2)) for box in scaffold_legs),
        'headRenewalMovingCartridges': moving_cartridge_gap,
        'roofRenewalTray': min(check_dry(tray_envelope), boxes_gap(wet_segments, tray_envelope, wet_diameter/2)),
        'installedWestRoofTrays': min(min(check_dry(box), boxes_gap(wet_segments, box, wet_diameter/2)) for box in roof_circuits),
        'westPurlinsCompleteFlashingPlan': purlin_gap, 'roofRadialRailsPlan': radial_gap, 'roofBraceTubesPlan': brace_gap,
        'flashingToTerminalOverSlopedCover': terminal-nominal_cover,
    }
    near_heads = []
    for storey, rows in house['openings'].items():
        for row in rows:
            if not row.get('head') or row['wall'] not in ('outer-west','outer-north','outer-east','outer-south'):
                continue
            on_x = row['wall'] in ('outer-south', 'outer-north')
            normal = shell if row['wall'] in ('outer-east','outer-north') else 0
            if hypot((y if on_x else x)-normal,
                     interval_distance(x if on_x else y,(row['centre']-row['width']/2,row['centre']+row['width']/2))) <= 3000:
                near_heads.append((row['id'], row['head']+(floor_z if storey=='FIRST' else 0)))
    terminal_opening_reserve = terminal-max(z for _,z in near_heads)-900
    failed = [name for name,value in clearance.items() if value < DESIGN_RESERVE_MM]
    if terminal_opening_reserve < 0:
        failed.append('NEARBY_OPENING_HEIGHT')
    if approach_gravity < 0:
        failed.append('DRY_RETURN_CONDENSATE_BACKFALL')
    if wall_to_inside_tangent < PLACEMENT_MM/2:
        failed.append('BEND_TANGENT_INSIDE_FORMED_WALL')
    return {
        'case': case, 'state': 'geometric-failure' if failed else 'bounded-dry-return-comparison', 'installedAcceptance': False,
        'sourceSHA256': digest, 'wet': wet, 'clearanceMm': clearance, 'failedChecks': failed,
        'cornersXYZmm': corners, 'roundedCentrelineXYZmm': rounded,
        'formedWallCentreXYZmm': [0,wall_y,wall_z], 'formedWallProjectedRadiusMm': wall_radius,
        'receiverWallFinishXMm': interior_x, 'minimumRoomSideUndersideAboveFFLMm': lowest_interior-floor_z-reserve,
        'bendRadiusMm': BEND_RADIUS_MM, 'remainingStraightBetweenBendsMm': straight_tangent,
        'insideWallFaceToFirstBendTangentMm': wall_to_inside_tangent,
        'completeDryEnvelopeDiameterMm': 2*DRY_ENVELOPE_RADIUS_MM, 'roofFlashingEnvelopeDiameterMm': 2*FLASHING_RADIUS_MM,
        'nearOpeningHeads': near_heads, 'terminalAboveOpeningAllowanceMm': terminal_opening_reserve,
        'minimumDryRisePerChordMm': approach_gravity, 'minimumGeometricReserveMm': DESIGN_RESERVE_MM,
        'hostAndRenewalUnresolved': [
            'Drain hydraulic and ventilation performance, site host levels, surcharge and positive pressure relief',
            'Native bends, loaded supports, scaffold ties, step access, tool sweep and first release',
            'Wall and ceiling structural opening, wet/air/fire/thermal closures and renewable roof flashing',
            'Actual air intakes, roof downdraught and terminal performance',
            'NW port stays in the canonical structure until full foul route and port removal are accepted',
        ],
    }


if __name__ == '__main__':
    root = Path(argv[1])
    if argv[2:] == ['--current-request']:
        current = loads(stdin.read())
        if current['schema'] != 'mat-rear-foul-vent-native-case/1':
            raise ValueError('Unknown rear foul vent case schema')
        comparison = dry_return(current['vent'], current['occupied'], inputs_for_vent(root))
        print(dumps({'schema': 'mat-rear-foul-vent-native-result/1', 'comparison': comparison}, allow_nan=False))
    else:
        assert argv[2:] in ([], ['--check'])
        occupied = loads(check_output(['node', str(root/'project/had/studies/current-house.mjs')], text=True))
        data = inputs_for_vent(root)
        output = study(root)
        controls = {
            'directFormerAxis': {**REFERENCE, 'riserAxisXYMm': [670,9400]},
            'highReturn': {**REFERENCE, 'riserAxisXYMm': [775,9140], 'wetStackAirTakeoffZMm': 5550},
        }
        output['dryReturnComparison'] = {'lowObliqueReturn': dry_return(REFERENCE, occupied, data)}
        for key, case in controls.items():
            compared = dry_return(case, occupied, data)
            output['dryReturnComparison'][key] = {
                name: compared[name] for name in ('case', 'state', 'failedChecks', 'clearanceMm')
            }
        output = dumps(output, indent=2, allow_nan=False)+'\n'
        receipt = Path(__file__).with_suffix('.json')
        if argv[2:] == ['--check']:
            assert receipt.read_text() == output, 'West roof/foul interface receipt needs regeneration'
        else:
            print(output, end='')
