"""Compare the rear foul stack with the controlled west roof goods."""

from hashlib import sha256
from json import dumps, loads
from math import hypot, sqrt
from pathlib import Path
from sys import argv


def study(root):
    paths = (
        'project/mat/studies/rear-wc-west-gravity.json',
        'project/had/studies/water-replan.json',
        'project/rof/studies/outer_66_checkpoint/outer-66-pieces.json',
        'project/str/studies/current-house-grid.json',
        'project/str/studies/current-house-welded-heel.json',
        'project/str/studies/current-house-welded-network.json',
        'project/str/studies/open-loggia-support.json',
    )
    inputs = [(root / path).read_bytes() for path in paths]
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
        'sourceSHA256': {path: sha256(data).hexdigest() for path, data in zip(paths, inputs)},
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


if __name__ == '__main__':
    root = Path(argv[1])
    receipt = Path(__file__).with_suffix('.json')
    output = dumps(study(root), indent=2) + '\n'
    if argv[2:] == ['--check']:
        assert receipt.read_text() == output, 'West roof/foul interface receipt needs regeneration'
    else:
        assert not argv[2:]
        print(output, end='')
