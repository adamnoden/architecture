#!/usr/bin/env python3
"""Reproduce one suspended concrete floor and boundary comparison."""
import argparse
import html
import json
import math
import subprocess
from itertools import pairwise
from pathlib import Path

from subfloor_vent_path import compare_path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
STEM = 'floor-pour-boundary'


def read_source(source):
    raw = subprocess.check_output(['git', 'show', source['commit'] + ':' + source['path']], cwd=ROOT)
    blob = subprocess.check_output(['git', 'hash-object', '--stdin'], input=raw, cwd=ROOT).decode().strip()
    assert blob == source['blob'], source['path']
    return json.loads(raw)


def batch_comparison(control, floor, area, thickness):
    nominal_volume = area * thickness / 1000
    steel_kg = floor['steelTonnesBeforeLapsEdges'] * 1000
    steel_volume = steel_kg / control['steelDensity_kg_m3']
    concrete_volume = nominal_volume - steel_volume
    gravity = control['gravity_m_s2']
    ceiling = control['compositeDensityCeiling_kN_m3']
    ceiling_mass = ceiling * 1000 / gravity
    cement = control['cement_kg_m3']
    water = control['effectiveWater_kg_m3']
    paste_volume = cement / control['cementParticleDensity_kg_m3'] + water / control['waterDensity_kg_m3']
    cases = []
    for air in control['assumedAirVolumeFractions']:
        aggregate_volume = 1 - paste_volume - air
        assert aggregate_volume > 0
        aggregate_kg = aggregate_volume * control['aggregateParticleDensity_kg_m3']
        plain_density = cement + water + aggregate_kg
        density_checks = []
        for depth in sorted(set([*floor['depthRange'], thickness])):
            volume = area * depth / 1000
            concrete_at_depth = volume - steel_volume
            weight = (plain_density * concrete_at_depth + steel_kg) * gravity / (1000 * volume)
            plain_limit = (ceiling_mass * volume - steel_kg) / concrete_at_depth
            density_checks.append({
                'grossDepth_mm': depth, 'compositeWeight_kN_m3': weight,
                'requiredPlainDensityMaximum_kg_m3': plain_limit,
                'aggregateDensityMaximumInThisBatch_kg_m3': (plain_limit - cement - water) / aggregate_volume,
                'insideCurrentWeightBudget': weight <= ceiling,
            })
        cases.append({
            'assumedAirVolumeFraction': air, 'aggregate_kg_m3': aggregate_kg,
            'plainDensity_kg_m3': plain_density, 'aggregateForNominalPour_kg': aggregate_kg * concrete_volume,
            'densityChecks': density_checks,
        })
    assert not any(row['insideCurrentWeightBudget'] for row in cases[0]['densityChecks'])
    return {
        'control': control, 'grossRCVolume_m3': nominal_volume, 'steelBeforeLapsAndEdges_kg': steel_kg,
        'steelDisplacement_m3': steel_volume, 'nominalConcreteVolumeBeforeLapsAndEdges_m3': concrete_volume,
        'cementForNominalConcreteVolume_kg': cement * concrete_volume,
        'effectiveWaterForNominalConcreteVolume_kg': water * concrete_volume,
        'effectiveWaterCementRatio': water / cement, 'cases': cases,
        'decision': 'The zero-air comparison exceeds the current structural weight budget. Actual fresh density with the delivered reinforcement must earn the load bound or STR must recheck the actual actions. Entrapped air remains a measured input.',
    }


def box_xy(rect):
    x, y, width, length = rect
    return x, y, x + width, y + length


def support_boxes(grid, z):
    boxes = {}
    for name, girder in grid['girders'].items():
        if girder['z'][0] < z < girder['z'][1]:
            lo, hi = girder['extent']
            datum, half = girder['datum'], girder['width'] / 2
            boxes[name] = (lo, datum - half, hi, datum + half) if girder['axis'] == 'x' else (
                datum - half, lo, datum + half, hi)
    for name, member in grid['crossBeams'].items():
        if member['z'][0] < z < member['z'][1]:
            (xa, ya), (xb, yb) = member['a'], member['b']
            half = member['width'] / 2
            assert (xa == xb) != (ya == yb)
            boxes[name] = (min(xa, xb), ya - half, max(xa, xb), ya + half) if ya == yb else (
                xa - half, min(ya, yb), xa + half, max(ya, yb))
    for head in grid['heads']:
        if head['capZ'][0] < z < head['capZ'][1]:
            x, y = head['xy']
            width, length = head['capXY']
            boxes[head['id']] = box_xy((x - width / 2, y - length / 2, width, length))
    return boxes


def cast_union(had, grid, floor, slab):
    model = had['model']
    west = grid['girders']['outer-W']['datum']
    east = grid['girders']['outer-E']['datum']
    south = grid['girders']['outer-S']['datum']
    north = grid['girders']['outer-NW']['datum']
    dry_extent = (west, south, east, north)
    lx, ly, lw, _ = model['loggia']['clear']
    ex, ey, _, eh = had['passage']['outdoor']
    seat = box_xy(model['southCourtThresholdReference']['pan']['permanentSeat']['plan'])
    cuts = [box_xy(model['court']), (lx, ly, lx + lw, north), (ex, ey, east, ey + eh)]
    support = support_boxes(grid, slab['bottom'])
    all_boxes = [dry_extent, seat, *cuts, *support.values()]
    xs, ys = [sorted({edge for box in all_boxes for edge in box[axis::2]}) for axis in (0, 1)]

    def inside(x, y, box):
        return box[0] < x < box[2] and box[1] < y < box[3]

    cells = {}
    for i, (xa, xb) in enumerate(pairwise(xs)):
        for j, (ya, yb) in enumerate(pairwise(ys)):
            x, y = (xa + xb) / 2, (ya + yb) / 2
            dry = inside(x, y, seat) or (inside(x, y, dry_extent) and not any(
                inside(x, y, cut) for cut in cuts))
            on_grid = any(inside(x, y, box) for box in support.values())
            cells[i, j] = (dry, on_grid, (xb - xa) * (yb - ya))
    dry_area = sum(a for dry, _, a in cells.values() if dry) / 1e6
    on_grid_area = sum(a for dry, on_grid, a in cells.values() if dry and on_grid) / 1e6
    shoulder_area = sum(a for dry, on_grid, a in cells.values() if not dry and on_grid) / 1e6
    assert math.isclose(dry_area, sum(floor['physicalAreaM2'].values()), abs_tol=1e-6)
    assert math.isclose(on_grid_area, floor['physicalAreaM2']['direct'], abs_tol=1e-6)
    assert shoulder_area > 0 and len(support) == len(grid['girders']) + len(grid['crossBeams']) - 2 + grid['headCount']
    end = {'edgeAtContinuingDrySoffit_m': 0, 'edgeAtVerticalRCFace_m': 0}
    for (i, j), (_, on_grid, _) in cells.items():
        if on_grid:
            for di, dj, length in [(1, 0, ys[j+1] - ys[j]), (-1, 0, ys[j+1] - ys[j]),
                                   (0, 1, xs[i+1] - xs[i]), (0, -1, xs[i+1] - xs[i])]:
                next_dry, next_grid, _ = cells.get((i + di, j + dj), (False, False, 0))
                if not next_grid:
                    key = 'edgeAtContinuingDrySoffit_m' if next_dry else 'edgeAtVerticalRCFace_m'
                    end[key] += length / 1000
    depth = (slab['top'] - slab['bottom']) / 1000
    return {
        'drySlabAndSeatArea_m2': dry_area, 'drySlabAndSeatVolume_m3': dry_area * depth,
        'overlapCountedOnce_m2': on_grid_area, 'additionalCommonShoulderArea_m2': shoulder_area,
        'additionalCommonShoulderVolume_m3': shoulder_area * depth,
        'proposedMonolithicUpperCastVolume_m3': (dry_area + shoulder_area) * depth,
        'lowerLiftInterfaceArea_m2': on_grid_area + shoulder_area, 'lowerLiftPlanEdges': end,
        'locatedExamples_mm': [
            {'section': 'outer west at Y2750', 'beamNormalX': [support['outer-W'][0], support['outer-W'][2]],
             'drySlabEdgeX': west, 'additionalShoulderX': [support['outer-W'][0], west]},
            {'section': 'court south at X4450', 'beamNormalY': [support['court-S'][1], support['court-S'][3]],
             'drySlabEdgeY': cuts[0][1], 'additionalShoulderY': None},
            {'section': 'court east at Y5900', 'beamNormalX': [support['court-E'][0], support['court-E'][2]],
             'drySlabEdgeX': cuts[0][2], 'additionalShoulderX': [support['court-E'][0], cuts[0][2]]},
            {'section': 'loggia west at Y10300', 'beamNormalX': [support['loggia-W'][0], support['loggia-W'][2]],
             'drySlabEdgeX': lx, 'additionalShoulderX': None},
        ],
        'scope': 'Structural candidate union at Z−380..−180. Separate exterior decking and low ties are outside it. Interface edges are potential concrete-face terminations before actual covers, coatings, returns or contacts. They are not measured open paths or another air allocation. Shoulder cage, batch and weight are not inherited from the dry slab.',
    }


def straight_perimeter(sources, slab):
    model = sources['HAD']['model']
    grid = sources['STRgrid']
    boxes = support_boxes(grid, slab['bottom'])
    outer = sources['ordinaryOuter']['occurrence']['ordinaryPerpendicularLayers_mm']
    assert outer[-1][2] == model['envelope']
    ordinary_widths = [hi - lo for _, lo, hi in outer]
    loggia_widths = [width for _, width in reversed(model['weather']['layersRoomToWeather'])]
    loggia_wall = next(row for row in model['groundWalls'] if row['id'] == 'loggia-west-weather')
    dpc = sources['ordinaryWall']['bondedMineralBase']
    header = dpc['headerWidth']
    cx, cy, cw, _ = model['court']
    sections = [
        ('outer-west', 'outer-W', 2750, 0, 1, ordinary_widths),
        ('court-south', 'court-S', 4450, cy, -1, ordinary_widths),
        ('court-east', 'court-E', 5900, cx + cw, 1, ordinary_widths),
        ('loggia-west-weather', 'loggia-W', 10300, model['loggia']['clear'][0], -1, loggia_widths),
    ]
    output = []
    for wall, beam, station, exterior, sign, widths in sections:
        leaf, drain, glass, core, plaster = widths
        glass_end = leaf + drain + glass
        project = (header - core) / 2

        def span(lo, hi):
            return sorted((exterior + sign * lo, exterior + sign * hi))

        normal = 1 if grid['girders'][beam]['axis'] == 'x' else 0
        lower, upper = boxes[beam][normal::2]
        assert boxes[beam][1-normal] < station < boxes[beam][3-normal]
        assert grid['girders'][beam]['z'][1] == dpc['fromZ'] == slab['top']
        header_span = span(glass_end - project, glass_end + core + project)
        assert lower <= min(exterior, *header_span) and max(exterior, *header_span) <= upper
        assert project < glass and project > plaster
        assert not any(a['wall'] == wall and abs(a['centre'] - station) <= a['width'] / 2
                       for a in model['archOpeningRegister']['GROUND'])
        core_span = span(glass_end, glass_end + core)
        if beam == 'loggia-W':
            assert core_span == loggia_wall['structuralCore']
        output.append({'wall': wall, 'stationAlongWall_mm': station, 'beam': beam,
                       'beamNormalBounds_mm': [lower, upper], 'coreNormalBounds_mm': core_span,
                       'centredHeaderNormalBounds_mm': header_span,
                       'centredHeaderProjectionEach_mm': project,
                       'drainedGapPlanRetained_mm': drain, 'glassPlanRemainingAtBand_mm': glass - project,
                       'floorLayerZoneEncroachmentBeyondFinish_mm': project - plaster})
    return {
        'straightSections': output,
        'clearCavityDepthBelowInnerBandBase_mm': dpc['fromZ'] - slab['top'],
        'existingLoggiaTrayComparison': sources['loggia']['cavityTray'],
        'unqualified': ['Header bonding, movement and thermal response at each boundary and corner.',
                        'Actual ordinary cavity base tray, outward weeps and separation from the ventilated floor void.',
                        'Actual court door jamb, pan, seat and retained ordinary wall-base interfaces.',
                        'Four outer pier restraints, portal contacts, three RC crossings and lower stair toe.',
                        'Dry specimen and installed air, capillary and thermal behaviour.'],
        'role': 'Test the same centred ordinary header without thinning the drained gap or moving the core. The ordinary 429.5 wall recipe and the separate loggia 519.5 recipe have different remaining glass. The old loggia tray is a located research control with its own support and finish interfaces, not an ordinary shell or court tray.',
    }


def vent_slices(control, had, grid, void):
    low, high = control['z_mm']
    front, rear = control['westEastBandsY_mm']
    west_east = control['westEastExtentX_mm']
    west, east = (grid['girders'][name] for name in ('outer-W', 'outer-E'))
    assert high < min(west['z'][0], east['z'][0])
    assert west_east[0] < west['datum'] - west['width'] / 2
    assert west_east[1] > east['datum'] + east['width'] / 2
    assert low > void['effectiveStressDatum_mm']
    all_support_bottom = min(void['clearanceCases'][key]['bottomZ_mm'] for key in (
        'lowestGirderSoffit', 'lowestFoundationCap'))
    assert high < all_support_bottom
    east_track = had['passage']['structuralClearY']
    normal_carrier_bottom = min(z for _, z in had['model']['northNormalRoute']['normal']['carrierBottom'])
    assert normal_carrier_bottom > high and front[1] < east_track[0] < east_track[1] < rear[0]
    widths = [b - a for a, b in (front, rear)]
    assert widths[0] == widths[1]
    bands = []
    for name, (start, end) in [('front', front), ('rear', rear)]:
        gaps = []
        for head in grid['heads']:
            x, y = head['xy']
            radius = head['shaftDiameter'] / 2
            if west_east[0] < x + radius and x - radius < west_east[1]:
                gaps.append((max(start - y - radius, y - radius - end), head['id']))
        gap, shaft = min(gaps)
        assert gap > 0
        bands.append({'id': name, 'planXYXY_mm': [west_east[0], start, west_east[1], end],
                      'minimumShaftEnvelopeReserve_mm': gap, 'governingShaft': shaft})
    gross = widths[0] * (high - low)
    free = gross * control['screenFreeFractionComparison']
    return {
        'control': control, 'opposedBands': bands, 'undersideReserve_mm': all_support_bottom - high,
        'shell_mm': had['model']['shell'], 'courtPlan_mm': had['model']['court'],
        'loggiaPlan_mm': had['model']['loggia']['clear'],
        'heightAboveEffectiveStressDatum_mm': low - void['effectiveStressDatum_mm'],
        'northCarrierBottomMinimum_mm': normal_carrier_bottom,
        'fourMouthGrossArea_mm2': gross * 4, 'oneMouthNominalScreenFreeArea_mm2': free,
        'twoMouthsPerFaceNominalScreenFreeArea_mm2': free * 2,
        'fourMouthNominalScreenFreeArea_mm2': free * 4,
        'scope': 'Geometric strips between external W/E mouth reservations. Actual screens, plinth, independent outdoor-deck supports, services, drainage, flood/splash response, effective openings and distribution to every bay remain unqualified. The rear strip traverses the zone below the outdoor loggia. Free areas are screen sensitivities, not flow, compliance or a substitute for effective drainage.',
    }


def vent_mouths(control, vent, had, grid):
    """Compare an externally removable screen and rain hood at each actual strip end."""
    model = had['model']
    low, high = vent['control']['z_mm']
    west, east = vent['control']['westEastExtentX_mm']
    bands = vent['control']['westEastBandsY_mm']
    width = bands[0][1] - bands[0][0]
    frame = control['screenBorder_mm']
    hole, pitch = control['squareHole_mm'], control['holePitch_mm']
    assert 0 < hole < pitch and frame > 0
    counts = [1 + math.floor((dim - 2 * frame - hole) / pitch) for dim in (width, high - low)]
    assert min(counts) > 0
    screen_area = math.prod(counts) * hole**2
    sill, skirt = control['sillProjection_mm'], control['hoodProjectionToInnerSkirt_mm']
    thickness = control['hoodSkirtThickness_mm']
    slope = control['outwardFallRunPerRise']
    assert 0 < sill < skirt and slope > 0 and thickness > 0
    # Downward-facing intake between the sill tip and inner skirt. The cowl sides
    # are outside the clear width. The cap falls outward at the same slope.
    cap_back = high + control['hoodRearUndersideAboveOpening_mm']
    sill_tip = low - sill / slope
    cap_front = cap_back - skirt / slope
    skirt_foot = low - control['skirtBelowInnerSill_mm']
    assert skirt_foot < sill_tip < low < high <= cap_front
    throat = width * (skirt - sill)
    limit = min(screen_area, throat)
    screen_pull = control['screenPullOut_mm']
    garden = model['gardenFailureBypass']['groundPathEnvelope']
    receiver = model['rwtReceivingInterface']['east']['receiverBounds']
    mouths = []
    for face, x, direction, wall in [('west', west, -1, 'outer-W'), ('east', east, 1, 'outer-E')]:
        beam = grid['girders'][wall]
        beam_edge = beam['datum'] + direction * beam['width'] / 2
        shell_x = 0 if face == 'west' else model['shell']
        roof_x = shell_x + direction * model['exterior']['overhang']
        roof_local = (roof_x - x) * direction
        nose_x = x + direction * (skirt + thickness)
        for name, (ya, yb) in zip(('front', 'rear'), bands, strict=True):
            if face == 'west':
                path_edges = [px + w for px, py, w, h in garden if py < yb and ya < py + h]
                assert path_edges
                separation = nose_x - max(path_edges)
                neighbour = 'west garden bypass'
            else:
                _, ry, _, rh = receiver
                separation = max(ry - yb, ya - ry - rh)
                neighbour = 'east wet receiver (Y only)'
            assert separation > 0 and (x - beam_edge) * direction > 0
            mouths.append({'position': f'{face} {name}', 'screenX_mm': x, 'bandY_mm': [ya, yb],
                           'noseX_mm': nose_x, 'outsideBeamFace_mm': (x - beam_edge) * direction,
                           'roofEdgeX_mm': roof_x, 'roofEdgeFromScreen_mm': roof_local,
                           'roofEdgeOverHood': 0 <= roof_local <= skirt + thickness,
                           'neighbour': neighbour, 'planSeparation_mm': separation})
    return {
        'control': control, 'screenClearField_mm': [width - 2 * frame, high - low - 2 * frame],
        'squareHoleCountXY': counts, 'netScreenAreaPerMouth_mm2': screen_area,
        'downFacingClearDepth_mm': skirt - sill, 'downFacingAreaPerMouth_mm2': throat,
        'minimumSerialAreaPerMouth_mm2': limit,
        'fourClear_mm2': 4 * limit, 'oneBlocked_mm2': 3 * limit,
        'weakerFaceOneBlocked_mm2': limit,
        'throatDepthToMatchScreen_mm': screen_area / width,
        'sillBackAndTipZ_mm': [low, sill_tip], 'hoodUndersideZ_mm': [cap_back, cap_front],
        'skirtFootZ_mm': skirt_foot, 'skirtToTipVerticalOverlap_mm': sill_tip - skirt_foot,
        'skirtFootAboveReferenceGrade_mm': skirt_foot - model['approaches']['authoredExteriorGrade'],
        'screenPullAfterHoodRemoval_mm': screen_pull, 'mouths': mouths,
        'scope': 'Clear areas of successive sections only. The smaller area bounds the geometric opening; pressure losses add. Wind-driven water, seams, debris, rebound, plinth support, outlet, service access, adjacent upper-deck supports and every-bay ventilation require separate evidence.',
    }


def solum_fall(control, had, void):
    # A plane draining west rises to the east. Test its highest point under
    # the crossing; use uniform stress solely for the vertical clearance check.
    _, east_edge = control['crossingBandX_mm']
    low, _ = control['lowerZ_mm']
    slope = control['solumWestFallRunPerRise']
    width = had['model']['shell']
    grade = void['referenceGrade_mm']
    stress = void['effectiveStressDatum_mm'] - grade
    assert slope > 0 and 0 < east_edge < width
    rise_at_crossing = east_edge / slope
    lip_at_grade = grade
    lip_with_east_at_grade = grade - width / slope
    lip_at_contact = low - stress - rise_at_crossing

    def test(lip):
        stressed = lip + rise_at_crossing + stress
        return {'westLip_mm': lip, 'eastEdge_mm': lip + width / slope,
                'highestStressUnderCrossing_mm': stressed,
                'clearBelowCorridor_mm': low - stressed,
                'lipBelowExteriorComparison_mm': grade - lip}

    return {'runPerRise': slope, 'flatStressMargin_mm': low - void['effectiveStressDatum_mm'],
            'westLipAtUniformExterior': test(lip_at_grade),
            'eastEdgeAtUniformExterior': test(lip_with_east_at_grade),
            'westLipForZeroCorridorClearance_mm': lip_at_contact,
            'minimumWestLipDropForPositiveClearance_mm': grade - lip_at_contact,
            'eastFaultWaterAboveCutWestLip_mm':
                had['model']['rwtReceivingInterface']['east']['blockedOutletSpill']['maximumFaultedReceiverWater']
                - lip_with_east_at_grade,
            'scope': 'An ideal plane is neither a working outlet nor a predicted deformed surface. Independent downhill receiving ground and controlling backwater below the running solum outlet, continuous routes past shafts and plinth, differential heave and erosion remain unverified.'}


def void_comparison(had, grid, floor_area, slab_bottom, guidance):
    grade = had['model']['approaches']['authoredExteriorGrade']
    ground = had['groundEnvelope']
    assert grade == -ground['routeLocalDTrial']
    loss = ground['heaveStress'] + ground['constructionLoss']
    effective_ground = grade + loss
    girders = [*grid['girders'].values(), *grid['crossBeams'].values()]
    member_bottom = min(girder['z'][0] for girder in girders)
    cap_bottom = min(head['capZ'][0] for head in grid['heads'])
    planes = {
        'slabSoffit': slab_bottom, 'lowestGirderSoffit': member_bottom,
        'lowestFoundationCap': cap_bottom, 'separateFullWaterTrackComparison': ground['fullSelectedTrackLowest'],
    }
    vent = guidance['voidClearance_mm']
    floor_area_term = guidance['ventAreaPerFloorArea_mm2_m2'] * floor_area
    historical_grade = had['model']['approaches']['supersededD1300Comparison']['authoredExteriorGrade']
    return {
        'referenceGrade_mm': grade, 'heaveStress_mm': ground['heaveStress'],
        'separateConstructionLoss_mm': ground['constructionLoss'],
        'effectiveStressDatum_mm': effective_ground,
        'clearanceCases': {
            key: {'bottomZ_mm': z, 'verticalClearance_mm': z - effective_ground,
                  'surplusOver150Comparison_mm': z - effective_ground - vent}
            for key, z in planes.items()
        },
        'supersededGradeToFullTrackClearance_mm': planes['separateFullWaterTrackComparison'] - historical_grade - loss,
        'floorAreaVentTerm_mm2': floor_area_term,
        'externalWallRunCrossover_m': floor_area_term / guidance['ventAreaPerExternalWallRun_mm2_m'],
        'actualExternalWallRun_m': None, 'actualConnectedVentOpeningArea_mm2': None,
        'actualSolumDrainageAndExposure': None,
        'scope': 'The D1800 stress check compares vertical reservations. The deeper water track keeps its own location and vent/drainage obligations. Establish the actual underfloor enclosure, opposite openings, free path past every support and screen, ground/drainage relation, water entry and vermin protection before accepting a vent route.',
    }


def produce():
    control = json.loads((HERE / f'{STEM}.json').read_text())
    sources = {key: read_source(source) for key, source in control['sources'].items()}
    had = sources['HAD']
    model = had['model']
    floor = sources['STRfloor']['groundFloor']
    field = sources['field']
    ordinary = sources['ordinaryWall']
    air = sources['airDuty']
    grid = sources['STRgrid']
    guidance = control['moistureGuidance']
    slab = model['sections']['groundFloorRC']
    depth = slab['top'] - slab['bottom']
    assert slab == {'top': -180, 'bottom': -380}
    stack = model['northNormalRoute']['floorJoin']
    assert stack['layers'] == [15, 65, 100, 200]
    assert stack['innerDpc'] == [-180, -30]
    assert floor['faceCoverRange'] == [40, 50]
    assert floor['depthRange'][0] >= guidance['minimumInSituThickness_mm']
    assert floor['faceCoverRange'][0] >= guidance['minimumCover_mm']
    assert control['mixTrial']['cement_kg_m3'] >= guidance['minimumCement_kg_m3']
    assert not any(control['admission'].values())
    area = sum(floor['physicalAreaM2'].values())
    crossings = field['confirmedSourceProposedSupportCrossings']
    structures = model['structuralChanges']
    wet_beam = structures['newWetWallBeam']
    assert [row['core'] for row in crossings] == [
        structures['stairMidPost']['concrete'], wet_beam['southReceiverCore'], wet_beam['northReceiverCore']]
    bases = field['wallBaseRegister']
    assert [row['id'] for row in bases] == [wall['id'] for wall in model['groundWalls']]
    for wall, row in zip(model['groundWalls'], bases):
        along = 1 if wall['a'][0] == wall['b'][0] else 0
        length = abs(wall['b'][along] - wall['a'][along])
        assert length - sum(b - a for a, b in wall.get('holes', [])) == row['rawSolidLength_mm']
    spine = grid['girders']['spine']
    spine_base = next(row for row in bases if row['id'] == 'service-spine')
    assert spine['datum'] == spine_base['axis'] and spine['axis'] == 'y'
    assert spine['extent'][0] <= ordinary['section']['atY'] <= spine['extent'][1]
    doors = [row for row in model['archOpeningRegister']['GROUND'] if row['kind'] == 'door']
    assert doors == field['threeDoorTransitions']
    assert sum(row['width'] for row in doors) == 5000
    stair = sources['STRtoe']['finite_floor_frame']['stair']
    toe = {'lowerFlightX_mm': model['stairGuard']['lowerFlightX'],
           'bearingAxisY_mm': stair['bearing_axes_y'][0], 'floorContact': stair['ground_toe_support'],
           'actualThreeDimensionalContact': None}
    assert toe['floorContact']['control_RC_top'] == slab['top']
    batch = batch_comparison(control['mixTrial'], floor, area, depth)
    concrete_volume = batch['nominalConcreteVolumeBeforeLapsAndEdges_m3']
    batch['guidanceMinimumCementAtNominalConcreteVolume_kg'] = concrete_volume * guidance['minimumCement_kg_m3']
    void = void_comparison(had, grid, area, slab['bottom'], guidance)
    vent = vent_slices(control['ventSliceTrial'], had, grid, void)
    assert void['supersededGradeToFullTrackClearance_mm'] < 0
    assert void['clearanceCases']['lowestFoundationCap']['surplusOver150Comparison_mm'] > 0
    assert grid['headCount'] == len(grid['heads']) == 52
    line = control['airScreen']
    ideal_cracks = []
    for aperture in [*line['authoredCrackApertures_mm'], floor['preferredField']['crackWidthFullRestraint'], floor['wkIf500Microstrain']]:
        gap = aperture / 1000
        speed = gap**2 * line['pressure_Pa'] / (12 * line['airDynamicViscosity_Pa_s'] * depth / 1000)
        ideal_cracks.append({'aperture_mm': aperture, 'flow_m3_h_per_m': speed * gap * 3600,
                             'idealHydraulicReynoldsNumber': line['airDensity_kg_m3'] * speed * 2 * gap / line['airDynamicViscosity_Pa_s']})
    families = air['aggregateFamilyBudgets']
    floor_budget = families['floorWallField']['aggregate_m3_per_h_at50Pa']
    opening_budget = families['completeOpeningsIncludingThreeDoorThresholds']['aggregate_m3_per_h_at50Pa']
    assert sources['court']['joinedCandidate']['finiteAirLedger']['sharedAllOpeningsBudget_m3_per_h'] == opening_budget
    return {
        'status': control['status'], 'sources': control['sources'], 'admission': control['admission'],
        'actualFloor': {'stack': stack, 'physicalArea_m2': area, 'areaParts_m2': floor['physicalAreaM2'],
                        'pressureFootprint_m2': air['geometry']['groundPressureFootprint']['area_m2'],
                        'roomField_m2': field['supportAwareRoomField']['netField_m2'],
                        'ordinaryFieldEdge_m': field['supportAwareRoomField']['ordinaryUpstandExcludingThreeDoors_m'],
                        'slab': slab, 'depthRange_mm': floor['depthRange'], 'faceCoverRange_mm': floor['faceCoverRange'],
                        'commonGridMemberZ_mm': spine['z'], 'serviceSpineWidth_mm': spine['width'],
                        'sectionY_mm': ordinary['section']['atY'],
                        'lowerInterfaceZ_mm': slab['bottom'], 'structuralPour': floor['pour'],
                        'structuralMaterialScope': floor['materials']},
        'guidance': guidance, 'voidComparison': void, 'ventSliceTrial': vent,
        'ventMouthComparison': vent_mouths(control['ventMouth'], vent, had, grid),
        'solumFallTrial': solum_fall(control['ventCrossing'], had, void),
        'ventCrossingPath': compare_path(control['ventCrossing'], had, grid, sources['RWTlowerTrack'], vent, void),
        'proposedMonolithicCastUnion': cast_union(had, grid, floor, slab),
        'batchComparison': batch, 'binderEvidence': control['binderEvidence'], 'curingAndJoint': control['curingAndJoint'],
        'airAndCapillaryRegister': {
            'ordinaryDpcControl': ordinary['bondedMineralBase'], 'ordinaryAirRoute': ordinary['airRouteControl'],
            'proposedStraightPerimeter': straight_perimeter(sources, slab),
            'wallBases': bases, 'threeSourceProposedRCCrossings': crossings, 'groundToe': toe,
            'proposedFoundationShaftCount': grid['headCount'], 'openingCuts': doors,
            'capillaryPaths': [
                'Ground and wet supports can feed the connected lower RC and slab. Establish matrix and interface transfer under the actual exposure.',
                'Outdoor RC and threshold seat contacts remain possible bypasses. Close the actual external and internal DPC ends, including the local structural pier cuts.',
                'Each vertical RC core and the stair toe has a separate moisture and surface duty. The slab comparison does not qualify those vertical paths.',
            ],
            'singleFloorWallFamily_m3_h_at50Pa': floor_budget, 'openingFamily_m3_h_at50Pa': opening_budget,
            'servicePenetrationsFamily_m3_h_at50Pa': families['servicePenetrations']['aggregate_m3_per_h_at50Pa'],
            'airTestScope': 'One aggregate for slab body, actual cracks and joints, ordinary wall bases, three structural crossings and the stair toe up to the actual assembly cuts. Opening and service assemblies retain their own disjoint budgets. Mask those interfaces when isolating this family and verify the final whole envelope unmasked. Every installed contribution remains unmeasured.',
            'idealCrackModel': line, 'idealCracks': ideal_cracks,
        },
        'costScope': {'fieldSheetAndOrdinaryReturnsScreen_kg': field['supportAwareRoomField']['ordinaryFlatAndUpstandScreen_kg'],
                      'role': 'The RC lift and cage are shared structural work. Compare actual mix, cure, inspection, interface and renewal differences before drawing a cost conclusion.'},
    }


def figure(result):
    floor = result['actualFloor']
    void = result['voidComparison']
    air = result['airAndCapillaryRegister']
    svg = ['<svg xmlns="http://www.w3.org/2000/svg" width="1250" height="1135" viewBox="0 0 1250 1135">',
           '<rect width="1250" height="1135" fill="#faf9f4"/><g font-family="Arial" fill="#263b47">']

    def text(x, y, label, size=17):
        svg.append(f'<text x="{x}" y="{y}" font-size="{size}">{html.escape(label)}</text>')

    def block(x0, x1, low, high, color):
        # Shared drawing datum. Horizontal dimensions are cropped around the spine.
        top = 295 - high * 0.52
        svg.append(f'<rect x="{x0}" y="{top}" width="{x1-x0}" height="{(high-low)*0.52}" fill="{color}" stroke="#647782"/>')

    text(30, 40, 'The continuous RC floor and its real boundary cuts', 28)
    text(30, 73, 'Development comparison. Installed material, air, moisture and site evidence remain open.')
    text(55, 127, 'A  SERVICE-SPINE SECTION / cropped field', 20)
    block(60, 660, -380, -180, '#b6bdba')
    block(135, 585, -630, -380, '#aeb6b6')
    for low, high, color in [(-180, -80, '#cfe2db'), (-80, -15, '#e6d9c2'), (-15, 0, '#d5c8ad')]:
        block(60, 306.25, low, high, color)
        block(413.75, 660, low, high, color)
    bed_bottom = floor['stack']['innerDpc'][0]
    dpc = air['ordinaryDpcControl']
    for bed, course in zip(dpc['beds'], dpc['courses']):
        block(306.25, 413.75, bed_bottom, bed_bottom + bed, '#e3ccae')
        block(306.25, 413.75, bed_bottom + bed, bed_bottom + bed + course, '#ba8f6e')
        bed_bottom += bed + course
    block(325, 395, -30, 220, '#c6a489')
    block(311.5, 325, 0, 220, '#e5d9cb')
    block(395, 408.5, 0, 220, '#e5d9cb')
    svg.append('<path d="M135 492.6H585" stroke="#ab553e" stroke-width="3" stroke-dasharray="8 4"/>')
    text(60, 652, 'Continuous RC200 upper lift, Z−380..−180.')
    text(60, 680, 'Possible prepared lower-grid interface at Z−380.')
    text(60, 708, 'DPC band Z−180..−30. Plaster begins at Z0.')
    text(60, 736, 'The wall core bridges the 30 mm between DPC and plaster.')
    text(60, 764, 'Connected lower concrete can carry ground moisture.')
    text(60, 816, 'Geometry and scope shown separately from performance.', 15)
    text(730, 127, 'B  PROPOSED UPPER CAST', 20)
    text(730, 165, f'{floor["physicalArea_m2"]:.3f} m² physical slab and seat.')
    cast = result['proposedMonolithicCastUnion']
    text(730, 192, f'{cast["drySlabAndSeatVolume_m3"]:.3f} m³ dry slab and seat, nominal gross.')
    text(730, 219, f'+{cast["additionalCommonShoulderVolume_m3"]:.3f} m³ of upper beam and cap shoulders.')
    text(730, 246, f'{cast["proposedMonolithicUpperCastVolume_m3"]:.3f} m³ total proposed upper cast, nominal gross.')
    text(730, 273, f'{cast["lowerLiftInterfaceArea_m2"]:.3f} m² potential interface at Z−380.')
    text(730, 328, 'C  D1800 STRESS COMPARISON', 20)
    for i, (key, label) in enumerate([
        ('slabSoffit', 'Slab soffit'), ('lowestGirderSoffit', 'Lowest girder'),
        ('lowestFoundationCap', 'Lowest cap'), ('separateFullWaterTrackComparison', 'Separate full water track')]):
        item = void['clearanceCases'][key]
        text(730, 366 + i * 27, f'{label}, {item["verticalClearance_mm"]} mm vertical clearance.')
    text(730, 482, 'Actual free openings, drainage and soil exposure remain open.')
    text(730, 537, 'D  ONE FLOOR/WALL AIR FAMILY', 20)
    text(730, 575, f'{air["singleFloorWallFamily_m3_h_at50Pa"]:.3f} m³/h at 50 Pa, provisional.')
    text(730, 602, 'Slab, actual cracks, 22 wall bases and ordinary perimeter.')
    text(730, 629, 'Three RC crossings and the unresolved lower stair toe.')
    text(730, 656, 'Complete doors and service penetrations have separate cuts.')
    text(730, 683, 'Actual contributions remain unmeasured.')
    text(730, 754, 'Glass stays above the structural pour.')
    text(730, 781, 'The comparison retains the accessible service zone.')
    text(55, 865, 'E  TWO W/E OPENING RESERVATIONS', 20)
    vent = result['ventSliceTrial']
    scale = 0.0175
    origin_x, origin_y = 67, 1110

    def plan_box(x, y, w, h, fill, stroke):
        svg.append(f'<rect x="{origin_x+x*scale}" y="{origin_y-(y+h)*scale}" width="{w*scale}" '
                   f'height="{h*scale}" fill="{fill}" stroke="{stroke}"/>')

    shell = vent['shell_mm']
    plan_box(0, 0, shell, shell, '#e8e6dc', '#52646d')
    for key in ('courtPlan_mm', 'loggiaPlan_mm'):
        plan_box(*vent[key], '#f6f1e5', '#a49785')
    for band in vent['opposedBands']:
        xa, ya, xb, yb = band['planXYXY_mm']
        plan_box(xa, ya, xb - xa, yb - ya, '#5c8f94', '#326c71')
    text(310, 909, '400 × 150 mm strips at Z−1000..−850, below the grid.')
    text(310, 937, 'Front Y2000..2400, 50 mm nominal shaft reserve.')
    text(310, 965, 'Rear Y10100..10500, 25 mm reserve. Under outdoor loggia.')
    text(310, 993, 'Four mouths give 120,000 mm² at an assumed 50% free screen.')
    text(310, 1021, 'Two opposed strips do not establish circulation to all bays.')
    text(310, 1049, 'Actual plinth, deck supports, screens, grade and outfall remain open.')
    text(310, 1093, 'The upper dwelling air boundary stays separate from these openings.', 15)
    svg.append('</g></svg>')
    return ''.join(svg) + '\n'


def mouth_figure(result):
    vent = result['ventMouthComparison']
    control = vent['control']
    screen_bottom, sill_tip = vent['sillBackAndTipZ_mm']
    _, screen_top = result['ventSliceTrial']['control']['z_mm']
    cap_back, cap_front = vent['hoodUndersideZ_mm']
    skirt_bottom = vent['skirtFootZ_mm']
    sill, hood = control['sillProjection_mm'], control['hoodProjectionToInnerSkirt_mm']
    eaves = vent['mouths'][0]['roofEdgeFromScreen_mm']
    assert all(m['roofEdgeFromScreen_mm'] == eaves for m in vent['mouths'])
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="540" viewBox="0 0 1000 540">
<title>Section through the removable subfloor vent hood</title>
<desc>Downward intake between a free sill drip and an outer skirt. The projected roof edge falls on the hood.</desc>
<rect width="1000" height="540" fill="#faf9f4"/>
<g font-family="Arial, sans-serif" fill="#233b45">
<text x="35" y="43" font-size="26">Where rain meets the subfloor vent</text>
<text x="35" y="74" font-size="16">West and east mouths · local section looking along the wall · dimensions in millimetres</text>
<g transform="translate(145,-790) scale(1.16,-1.16)" stroke-linejoin="round">
<path d="M -75 {screen_top} H 0 V {cap_back+42} H -75 Z M -75 {screen_bottom} H 0 V {screen_bottom-42} H -75 Z" fill="#ddd9ce"/>
<path d="M 0 {cap_back} L {hood} {cap_front} V {skirt_bottom}" fill="none" stroke="#324955" stroke-width="4"/>
<path d="M -60 {screen_bottom} H 0 L {sill} {sill_tip} v -4" fill="none" stroke="#324955" stroke-width="3"/>
<path d="M 0 {screen_bottom} V {screen_top}" stroke="#324955" stroke-width="4" stroke-dasharray="3 3"/>
<path d="M {eaves} {cap_back+48} V {cap_back-eaves/control['outwardFallRunPerRise']+3} l -4 7 m 4 -7 l 4 7" stroke="#9e5739" stroke-width="2.6" fill="none"/>
<path d="M {hood-30} {skirt_bottom-45} V {screen_bottom+30} Q {hood-30} {screen_bottom+67} {hood-67} {screen_bottom+67} H -40 l 9 -4 m -9 4 l 9 4" stroke="#326c71" stroke-width="3" fill="none"/>
</g>
<text x="136" y="106" fill="#884b34" font-size="15">Projected roof drip</text>
<text x="47" y="317" font-size="14">Floor void</text>
<text x="203" y="469" font-size="15">Exterior air enters from below</text>
<text x="480" y="148" font-size="19">The metal hood takes the drip</text>
<text x="480" y="180" font-size="16">The roof edge projects {eaves:g} past the screen at all four mouths.</text>
<text x="480" y="210" font-size="16">The cap and sill slope outwards at 1 in {control['outwardFallRunPerRise']:g}.</text>
<text x="480" y="240" font-size="16">The skirt ends {vent['skirtToTipVerticalOverlap_mm']:g} below the sill tip.</text>
<text x="480" y="307" font-size="19">Two restrictions in series</text>
<text x="480" y="339" font-size="16">{vent['downFacingClearDepth_mm']:g} clear at the intake gives {vent['downFacingAreaPerMouth_mm2']:,} mm².</text>
<text x="480" y="369" font-size="16">The framed screen reduces this to {vent['netScreenAreaPerMouth_mm2']:,} mm².</text>
<text x="480" y="413" font-size="16">Remove the hood from outside to reach the screen.</text>
<text x="35" y="514" font-size="14">Study geometry. Wind-driven rain, splash, discharge, framing and installed pressure loss require testing.</text>
</g></svg>''' + '\n'


def path_figure(result):
    vent = result['ventSliceTrial']
    path = result['ventCrossingPath']
    crossing = path['control']
    lower, upper = crossing['lowerZ_mm']
    left, right = crossing['crossingBandX_mm']
    south, north = crossing['crossExtentY_mm']
    front, rear = vent['control']['westEastBandsY_mm']
    x0, x1 = vent['control']['westEastExtentX_mm']
    shell = vent['shell_mm']
    ground = result['voidComparison']['effectiveStressDatum_mm']
    ink, route, wet, paper = '#233b45', '#28797b', '#9e583f', '#faf9f4'
    s, ox, oy = .027, 71, 470
    svg = ['<svg xmlns="http://www.w3.org/2000/svg" width="1060" height="575" viewBox="0 0 1060 575">',
           '<title>Two separated subfloor zones and the trial crossing beneath the water track</title>',
           f'<rect width="1060" height="575" fill="{paper}"/><g font-family="Arial, sans-serif" fill="{ink}">']

    def label(x, y, value, size=16, colour=ink):
        svg.append(f'<text x="{x}" y="{y}" fill="{colour}" font-size="{size}">{html.escape(value)}</text>')

    def box(x, y, w, h, fill):
        svg.append(f'<rect x="{ox+x*s}" y="{oy-(y+h)*s}" width="{w*s}" height="{h*s}" fill="{fill}"/>')

    label(35, 41, 'A lower air path to the northeast floor pocket', 27)
    label(35, 72, 'Plan and levels in millimetres. North is up. The uniform ground case is shown.')
    box(0, 0, shell, shell, '#e9e4d9')
    for footprint in path['excludedXYWH_mm']:
        box(*footprint, '#b9b3a4')
    cx, cy, cw, ch = vent['courtPlan_mm']
    wy0, wy1 = path['trackY_mm']
    box(cx+cw, wy0, shell-(cx+cw), wy1-wy0, '#c88970')
    box(x0, front[0], right-x0, front[1]-front[0], route)
    box(left, front[0], right-left, south-front[0], route)
    box(left, north, right-left, rear[1]-north, route)
    box(left, rear[0], x1-left, rear[1]-rear[0], route)
    box(left, south, right-left, north-south, '#bd663e')
    for y0, y1 in (front, rear):
        for x in (x0, x1):
            svg.append(f'<circle cx="{ox+x*s}" cy="{oy-(y0+y1)*s/2}" r="4.5" fill="{ink}"/>')
    label(208, 311, 'Court', 13)
    label(212, 195, 'Loggia', 13)
    label(324, 278, 'Water track', 12)
    label(288, 170, 'NE pocket', 15)
    label(49, 500, 'Green: upper path', 15, route)
    label(206, 500, 'Rust: lowered crossing', 15, wet)
    label(49, 527, 'The route avoids the space below the loggia.', 15)
    sx, sy, height = 490, 157, .75
    roof = path['railBottomWithDeflection_mm']
    zmap = lambda z: sy + (roof-z)*height
    for z, title, colour in [(roof, f'Rail underside with deflection  {roof:,.1f}', ink),
                             (upper, f'Top of air route  {upper:,}', route),
                             (lower, f'Bottom of air route  {lower:,}', route),
                             (ground, f'Stressed ground  {ground:,}', wet)]:
        svg.append(f'<path d="M {sx} {zmap(z)} h 135" stroke="{colour}" stroke-width="2"/>')
        label(648, zmap(z)+5, title, 16, colour)
    svg.append(f'<rect x="{sx+12}" y="{zmap(upper)+1}" width="111" height="{(upper-lower)*height-2}" fill="#d2e6df"/>')
    label(sx, 120, 'AT THE EAST EDGE OF THE CROSSING', 16)
    label(sx, 401, f'Rail reserve above the path: {roof-upper:.1f} mm.', 17)
    label(sx, 432, f'Ground reserve below the path: {lower-ground:g} mm.', 17)
    label(sx, 483, 'Raising the solum to drain to level exterior ground', 16)
    label(sx, 509, 'at a 1 in 100 fall consumes the lower reserve.', 16)
    label(35, 560, 'Geometry only. Physical airflow, ground movement, runoff and a lower independent outfall require evidence.', 14)
    svg.append('</g></svg>')
    return '\n'.join(svg) + '\n'


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    result = produce()
    outputs = {HERE / f'{STEM}.results.json': json.dumps(result, indent=2, ensure_ascii=False) + '\n',
               HERE / f'{STEM}.svg': figure(result),
               HERE / 'subfloor-vent-mouth.svg': mouth_figure(result),
               HERE / 'subfloor-vent-crossing.svg': path_figure(result)}
    for path, contents in outputs.items():
        if args.check:
            assert path.exists() and path.read_text() == contents, f'Stale output: {path.name}'
        else:
            path.write_text(contents)
    print('Floor pour, D1800 clearance, batch weight and one air-family comparison reproduce. Admission remains open.')
