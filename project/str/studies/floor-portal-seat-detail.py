"""Finite geometry and coupled demand comparison for the outward L-cap seat."""
import argparse
from contextlib import redirect_stdout
from dataclasses import replace
from itertools import combinations
import hashlib
import json
from math import atan2, cos, degrees, hypot, radians, sin, sqrt
from pathlib import Path
from runpy import run_path
import subprocess
import sys

STUDIES = Path(__file__).resolve().parent
FIT = run_path(str(STUDIES / 'floor-portal-receiver-cover.py'))
REPLAY = run_path(str(STUDIES / 'floor-portal-cap-replay.py'))
SOURCE = STUDIES / 'current-house-ground-ties.json'
PATCH = Path(__file__).with_suffix('.patch')
CORE_WIDTH = 140.0
OUTWARD = 35.0
GUIDE_ACROSS_CORE = 52.5
CORE_LENGTH = 1000.0
CAP_Z = 6515.0
BAR_DIAMETER = 20.0
COUPLER_DIAMETER = 38.0
COUPLER_HEIGHT = 48.0
WELD_TOE_RESERVE = 2.0
SETTING = 5.0
COVER_SCREEN = 25.0
CLEAR_SCREEN = 21.0
BEND_BOTTOM, BEND_TOP = 6140.0, 6450.0
CAP_SHOULDER = 6215.0
SEAT_GAP = 15.0
GUIDE_SHIFT = 20.0


def anchor_location(x, y):
    if x < 140 and y < 140:
        if max(x, y) < 70:
            return 29.0, 29.0
        if min(x, y) >= 70:
            return 98.5, 98.5
        return (27.0, 116.0) if x < 70 else (116.0, 27.0)
    if x >= 850:
        station = 772.0 if x == 850 else 882.0
        return (station, 27.0) if y < 70 else (station + 55.0, 76.0)
    transposed = anchor_location(y, x)
    return transposed[1], transposed[0]


def offset(a, b):
    return a[0] - b[0], a[1] - b[1]


def seat_guide_station(station):
    return {200.0: 200.0 + GUIDE_SHIFT, 725.0: 680.0}.get(station, station)


def distance_to_cassette(point, centre, direction, extra_length=0.0):
    dx, dy = offset(point, centre)
    nx, ny = direction
    along = dx * nx + dy * ny
    across = -dx * ny + dy * nx
    return hypot(max(0.0, abs(along) - (FIT['CASSETTE_LENGTH'] + extra_length) / 2),
                 max(0.0, abs(across) - FIT['CASSETTE_WIDTH'] / 2))


def l_edge(point, outward):
    x, y = (coordinate + outward for coordinate in point)
    end, width = CORE_LENGTH + outward, CORE_WIDTH + outward
    if not (0 <= x <= end and 0 <= y <= end and min(x, y) <= width):
        return -1.0
    boundary = ((0, 0), (end, 0), (end, width), (width, width), (width, end), (0, end))
    return min(FIT['point_to_segment']((x, y), a, b) for a, b in FIT['edges'](boundary))


def bent_bar_at(start, end, level):
    t = min(1.0, max(0.0, (level - BEND_BOTTOM) / (BEND_TOP - BEND_BOTTOM)))
    progress = t * t * (3 - 2 * t)
    return tuple(a + progress * (b - a) for a, b in zip(start, end))


def distance_to_arc(point, centre, radius, start, end):
    delta = offset(point, centre)
    theta = degrees(atan2(delta[1], delta[0])) % 360.0
    if start <= theta <= end:
        return abs(hypot(*delta) - radius)
    return min(hypot(delta[0] - radius * cos(radians(angle)),
                     delta[1] - radius * sin(radians(angle))) for angle in (start, end))


def hoop_screen(old, proposed, levels):
    hoop_radius, rounding = 4.0, 20.0
    inset = COVER_SCREEN + SETTING + hoop_radius
    outer, inner, far = inset - OUTWARD, CORE_WIDTH - inset, CORE_LENGTH - inset
    segments = (
        ((outer + rounding, outer), (far - rounding, outer)),
        ((far, outer + rounding), (far, inner - rounding)),
        ((far - rounding, inner), (CORE_WIDTH, inner)),
        ((inner, CORE_WIDTH), (inner, far - rounding)),
        ((inner - rounding, far), (outer + rounding, far)),
        ((outer, far - rounding), (outer, outer + rounding)),
    )
    arcs = (
        ((outer + rounding, outer + rounding), rounding, 180, 270),
        ((far - rounding, outer + rounding), rounding, 270, 360),
        ((far - rounding, inner - rounding), rounding, 0, 90),
        ((CORE_WIDTH, CORE_WIDTH), inset, 180, 270),
        ((inner - rounding, far - rounding), rounding, 0, 90),
        ((outer + rounding, far - rounding), rounding, 90, 180),
    )
    def distance_to_loop(point):
        return min(min(FIT['point_to_segment'](point, p, q) for p, q in segments),
                   min(distance_to_arc(point, *arc) for arc in arcs))

    gap = float('inf')
    witness = None
    # The link and bar can each move 5 mm vertically. The sample enclosure
    # includes the whole band and one half-step of the Lipschitz bar travel.
    for level in levels:
        for index, (a, b) in enumerate(zip(old, proposed)):
            slope = 1.5 * hypot(*offset(a, b)) / (BEND_TOP - BEND_BOTTOM)
            for dz in range(-10, 11):
                point = bent_bar_at(a, b, level + dz)
                distance = distance_to_loop(point)
                bound = (distance - slope / 2) / sqrt(1 + slope**2) - BAR_DIAMETER / 2 - hoop_radius - 2 * SETTING
                if bound < gap:
                    gap = bound
                    witness = {'linkZmm': level, 'barIndex': index, 'relativeVerticalSettingMm': dz}
    return {
        'levelsMm': levels,
        'centrelineSegmentsFromCoreOriginMm': segments,
        'centrelineArcsFromCoreOriginMm': arcs,
        'minimumAfterIndependentCageSettingsMm': gap,
        'witness': witness,
        'axialLoopFeedPastOldCoreH20MinimumGapMm': min(map(distance_to_loop, old)) - hoop_radius - BAR_DIAMETER / 2 - 2 * SETTING,
        'axialLoopFeedPastPrethreadedWeldSleeveMinimumGapMm': min(map(distance_to_loop, proposed)) - hoop_radius - COUPLER_DIAMETER / 2 - WELD_TOE_RESERVE - 2 * SETTING,
        'upperHoopToCassetteAfterIndependentSettingsMm': 6449.0 - max(levels) - hoop_radius - 2 * SETTING,
        'minimumVerticalLinkGapWithIndependentSettingsMm': min(b - a for a, b in zip(levels, levels[1:])) - 2 * hoop_radius - 2 * SETTING,
        'maximumRelativeVerticalSettingAt21MmFlowScreenMm': min(b - a for a, b in zip(levels, levels[1:])) - 2 * hoop_radius - CLEAR_SCREEN,
    }


def assembly_screen(old, proposed):
    edges = {}
    for i, (before, after) in enumerate(zip(old, proposed)):
        radius = hypot(*offset(before, after))
        for j, other in enumerate(old):
            if i == j:
                continue
            # Same-height witness at the lower straight end, where the
            # offset of the retained bar from its thread axis is largest.
            clearance = abs(hypot(*offset(other, after)) - radius) - BAR_DIAMETER - 2 * SETTING
            if clearance < 0:
                edges[i, j] = clearance
    cycles = [(i, j) for i, j in edges if i < j and (j, i) in edges]
    synchronous_gap = min(
        abs(hypot(*offset(proposed[i], proposed[j])) -
            hypot(*offset(offset(old[i], old[j]), offset(proposed[i], proposed[j]))))
        - BAR_DIAMETER - 2 * SETTING
        for i, j in combinations(range(len(old)), 2)
    )
    type_c_radius, locknut_trial_radius = 17.5, 21.0
    lower_pair = min(hypot(*offset(a, b)) for a, b in combinations(old, 2))
    lower_edge = min(l_edge(point, 0.0) for point in old)
    locknut_against_bar = lower_pair - locknut_trial_radius - BAR_DIAMETER / 2 - 2 * SETTING
    locked_side_cover = lower_edge - locknut_trial_radius - SETTING
    return {
        'lowerCoreTypeCSpliceScreen': {
            'cxl20TypeCBodyDiameterMm': 2 * type_c_radius,
            'bodyWithSimultaneousNeighboursGapMm': lower_pair - 2 * type_c_radius - 2 * SETTING,
            'staggeredBodyAgainstNeighbourBarGapMm': lower_pair - type_c_radius - BAR_DIAMETER / 2 - 2 * SETTING,
            'staggeredBodyCoverAfterSettingMm': lower_edge - type_c_radius - SETTING,
            'trialLocknutDiameterEnvelopeMm': 2 * locknut_trial_radius,
            'staggeredLocknutAgainstNeighbourBarGapMm': locknut_against_bar,
            'locknutCoverAfterSettingMm': locked_side_cover,
            'coreCoverShortfallAtTrialLocknutMm': COVER_SCREEN - locked_side_cover,
            'maximumLocknutDiameterAtCoverScreenMm': 2 * (lower_edge - SETTING - COVER_SCREEN),
        },
        'rotationScreenZmm': BEND_BOTTOM,
        'fullTurnConflicts': [{'rotatingBar': i, 'installedBar': j, 'surfaceGapAfterSettingsMm': gap}
                              for (i, j), gap in edges.items()],
        'reciprocalConflicts': cycles,
        'sameAngleFullTurnMinimumGapMm': synchronous_gap,
        'straightBelowWeldableSleeveMm': CAP_Z - COUPLER_HEIGHT - BEND_TOP,
        'cxl20TypeCCouplerBodyMm': 48.0,
        'straightShortfallForTypeCBodyBeforeLocknutMm': 48.0 - (CAP_Z - COUPLER_HEIGHT - BEND_TOP),
    }


def layout():
    old = tuple(map(tuple, json.loads(SOURCE.read_text())['outer']['primaryBarXY']))
    assert len(old) == 12 and len(set(old)) == 12
    proposed = tuple(anchor_location(*bar) for bar in old)
    rise = BEND_TOP - BEND_BOTTOM
    largest_offset = max(hypot(*offset(b, a)) for a, b in zip(old, proposed))
    # Simultaneous cross sections interpolate between the two pair vectors.
    # Either member can supply the Lipschitz bound for different-height pairs.
    clearances = []
    for i, j in combinations(range(len(old)), 2):
        a, b = offset(old[i], old[j]), offset(proposed[i], proposed[j])
        synchronous = hypot(*a) if a == b else FIT['point_to_segment']((0, 0), a, b)
        slope = 1.5 * min(hypot(*offset(old[k], proposed[k])) for k in (i, j)) / rise
        clearances.append(synchronous / sqrt(1 + slope**2) - BAR_DIAMETER - 2 * SETTING)
    bar_clear = min(clearances)
    maximum_coupler_radius = COUPLER_DIAMETER / 2 + WELD_TOE_RESERVE
    spacings = [hypot(*offset(a, b)) for a, b in combinations(proposed, 2)]
    packing_gap = min(spacings) - 2 * maximum_coupler_radius - 2 * SETTING
    unshifted_gap = min(hypot(*offset(a, b)) for a, b in combinations(old, 2)) - COUPLER_DIAMETER - 2 * SETTING
    edge_margin = min(l_edge(point, 0) for point in proposed) - maximum_coupler_radius - SETTING
    cover = min(l_edge(point, OUTWARD) for point in proposed) - COUPLER_DIAMETER / 2 - SETTING
    bend_radius = rise**2 / (6 * largest_offset)

    conflicts, webs, unrecentred_webs = [], [], []
    existing_h12, moved_h12, longer_h12_at_590, longer_h12_at_589, longer_webs, longer_conflicts = [], [], [], [], [], []
    for _, origin_x, origin_y, sx, sy in FIT['CORNER_ORIGINS']:
        for station in FIT['GUIDE_STATIONS']:
            along = seat_guide_station(station)
            for leg, centre in enumerate(((along, GUIDE_ACROSS_CORE), (GUIDE_ACROSS_CORE, along))):
                delta = (centre[0] + sx * (origin_x - 6000.0),
                         centre[1] + sy * (origin_y - 6000.0))
                length = hypot(*delta)
                direction = tuple(coordinate / length for coordinate in delta)
                local = tuple(coordinate + OUTWARD for coordinate in centre)
                spans = CORE_WIDTH + OUTWARD, FIT['CASSETTE_LENGTH'], FIT['CASSETTE_WIDTH'], CORE_LENGTH + OUTWARD
                webs.append(FIT['web_to_l_boundary'](local, direction, *spans) - 2 * SETTING)
                long_spans = spans[0], spans[1] + 3.0, spans[2], spans[3]
                longer_webs.append(FIT['web_to_l_boundary'](local, direction, *long_spans) - 2 * SETTING)
                reach = abs(direction[leg]) * spans[1] / 2 + abs(direction[1 - leg]) * spans[2] / 2
                long_reach = reach + 1.5 * abs(direction[leg])
                existing_h12.extend(abs(along - bar) - reach - 6.0 - 2 * SETTING for bar in (350.0, 600.0))
                moved_h12.extend(abs(along - bar) - reach - 6.0 - 2 * SETTING for bar in (350.0, 590.0))
                longer_h12_at_590.extend(abs(along - bar) - long_reach - 6.0 - 2 * SETTING for bar in (350.0, 590.0))
                longer_h12_at_589.extend(abs(along - bar) - long_reach - 6.0 - 2 * SETTING for bar in (350.0, 589.0))
                old_centre = (along, 50.0) if leg == 0 else (50.0, along)
                old_delta = (old_centre[0] + sx * (origin_x - 6000.0),
                             old_centre[1] + sy * (origin_y - 6000.0))
                old_direction = tuple(coordinate / hypot(*old_delta) for coordinate in old_delta)
                old_local = tuple(coordinate + OUTWARD for coordinate in old_centre)
                unrecentred_webs.append(FIT['web_to_l_boundary'](old_local, old_direction, *spans) - 2 * SETTING)
                conflicts.extend(distance_to_cassette(point, centre, direction) for point in proposed)
                longer_conflicts.extend(distance_to_cassette(point, centre, direction, 3.0) for point in proposed)
    coupler_to_guide = min(conflicts) - COUPLER_DIAMETER / 2 - 2 * SETTING
    assert bar_clear >= CLEAR_SCREEN and packing_gap >= CLEAR_SCREEN > unshifted_gap
    assert min(webs) >= COVER_SCREEN > min(unrecentred_webs)
    assert min(moved_h12) >= COVER_SCREEN > min(existing_h12)
    assert min(longer_h12_at_589) >= COVER_SCREEN > min(longer_h12_at_590)
    assert cover >= COVER_SCREEN and edge_margin > 0.0
    cap = json.loads((STUDIES / 'floor-portal-cap-replay.json').read_text())
    previous = cap['signed']['cap300-relief5']['capTransition']
    plain_gap = previous['minimumProjectedGap']
    ring = json.loads((STUDIES / 'current-house-welded-network.json').read_text())['sections']['collector']
    overhang = ring['B'] / 2 - (332.5 - 262.5)
    load = previous['peakCoreBearing']['compressionN']
    strip_width, elastic_yield_comparator = 100.0, 355.0
    strip_modulus = strip_width * ring['t']**2 / 6
    tip_load_stress = load * overhang / strip_modulus
    assert tip_load_stress > elastic_yield_comparator
    prior_approach = 5.0 - plain_gap['signedGapMM']
    hoop = hoop_screen(old, proposed, (6355.0, 6394.0, 6433.0))
    lower_hoop_control = hoop_screen(old, proposed, (6350.0, 6390.0, 6430.0))
    assembly = assembly_screen(old, proposed)
    assert assembly['reciprocalConflicts'] and assembly['sameAngleFullTurnMinimumGapMm'] < 0
    lower_splice = assembly['lowerCoreTypeCSpliceScreen']
    assert lower_splice['bodyWithSimultaneousNeighboursGapMm'] < lower_splice['staggeredBodyAgainstNeighbourBarGapMm'] < CLEAR_SCREEN
    assert lower_splice['staggeredBodyCoverAfterSettingMm'] < COVER_SCREEN
    core_cover = min(l_edge(bent_bar_at(a, b, CAP_SHOULDER + 2 * SETTING), 0)
                     for a, b in zip(old, proposed)) - BAR_DIAMETER / 2 - SETTING
    assert core_cover >= COVER_SCREEN and coupler_to_guide >= COVER_SCREEN
    assert hoop['minimumAfterIndependentCageSettingsMm'] > 0 < hoop['upperHoopToCassetteAfterIndependentSettingsMm']
    assert hoop['minimumVerticalLinkGapWithIndependentSettingsMm'] >= CLEAR_SCREEN
    assert lower_hoop_control['minimumAfterIndependentCageSettingsMm'] < 0
    assert hoop['axialLoopFeedPastOldCoreH20MinimumGapMm'] < 0
    assert hoop['axialLoopFeedPastPrethreadedWeldSleeveMinimumGapMm'] < 0
    return {
        'sourceSHA256': {path.name: hashlib.sha256(path.read_bytes()).hexdigest() for path in (
            SOURCE, STUDIES / 'current-house-welded-network.json',
            STUDIES / 'floor-portal-receiver-cover.py', STUDIES / 'floor-portal-cap-replay.json',
        )},
        'originalPositionsMm': old,
        'trialPositionsMm': proposed,
        'barBendLowerZmm': BEND_BOTTOM,
        'barBendUpperZmm': BEND_TOP,
        'minimumContinuousBarClearAfterSettingsMm': bar_clear,
        'minimumBendRadiusLowerBoundMm': bend_radius,
        'clearScreenMm': CLEAR_SCREEN,
        'unshiftedCxl20wPairGapAfterSettingsMm': unshifted_gap,
        'minimumStaggeredCouplerWeldEnvelopeGapAfterSettingsMm': packing_gap,
        'minimumBearingPlateEdgeReserveMm': edge_margin,
        'maximumRadialWeldToeAllowanceAtPackingScreenMm': (min(spacings) - COUPLER_DIAMETER - 2 * SETTING - CLEAR_SCREEN) / 2,
        'fiveMmWeldToePlateEdgeReserveMm': edge_margin + WELD_TOE_RESERVE - 5.0,
        'fixedPlateFullTurnScreen': assembly,
        'minimumCxl20wSideCoverAfterSettingsMm': cover,
        'sideCoverScreenMm': COVER_SCREEN,
        'minimumCxl20wToCassettePlanGapAfterSettingsMm': coupler_to_guide,
        'retained350And600H12StationGapAfterSettingsMm': min(existing_h12),
        'trial350And590H12StationGapAfterSettingsMm': min(moved_h12),
        'longerTonguePlanOnly': {
            'tongueLengthMm': FIT['TONGUE_LENGTH'] + 3.0,
            'cassetteWebAfterSettingsMm': min(longer_webs),
            'couplerToCassetteGapAfterSettingsMm': min(longer_conflicts) - COUPLER_DIAMETER / 2 - 2 * SETTING,
            'trial350And590H12StationGapAfterSettingsMm': min(longer_h12_at_590),
            'trial350And589H12StationGapAfterSettingsMm': min(longer_h12_at_589),
        },
        'steelSoffitZmm': CAP_Z + 25.0,
        'seatOuterInwardCoordinateMm': 262.5,
        'projectingHardwareMaximumZmm': CAP_Z + 25.0 - SEAT_GAP,
        'capArmWidthMm': CORE_WIDTH + OUTWARD,
        'guideAcrossOldCoreOriginMm': GUIDE_ACROSS_CORE,
        'minimumCassetteWebAfterSettingsMm': min(webs),
        'unrecentredCassetteWebAfterSettingsMm': min(unrecentred_webs),
        'nominalGlassWidthMm': 110.0 - OUTWARD,
        'minimumGlassWidthAfterSingleOutwardCapSettingMm': 110.0 - OUTWARD - SETTING,
        'cavityGlassBoundaryInwardQmm': 152.5,
        'nominalOuterConcreteFaceInwardQmm': 262.5 - OUTWARD,
        'couplerHeightMm': COUPLER_HEIGHT,
        'guideStationsMm': tuple(map(seat_guide_station, FIT['GUIDE_STATIONS'])),
        'authoredGapMm': SEAT_GAP,
        'gapAfterTwoVerticalSettingsBeforePlateFlexAtPriorApproachMm': SEAT_GAP - 2 * SETTING - prior_approach,
        'roundedH8LinkScreen': hoop,
        'roundedH8LowerLinkFailureMm': lower_hoop_control['minimumAfterIndependentCageSettingsMm'],
        'barSideCoverAtOldCoreShoulderAfterSettingsMm': core_cover,
        'fiveMmReplayMinimumProjectedGap': plain_gap,
        'ringSkinConcentratedLoadAdverse': {
            'previousCapCoreCompressionN': load,
            'overhangMm': overhang,
            'ringSkinThicknessMm': ring['t'],
            'independentStripWidthMm': strip_width,
            'concentratedTipLoadStressMPa': tip_load_stress,
            'elasticYieldComparatorMPa': elastic_yield_comparator,
            'requiredUniformStripWidthAtYieldComparatorMm': strip_width * tip_load_stress / elastic_yield_comparator,
        },
    }


def friction_screen(config):
    import numpy as np
    from floor_portal_candidate import GuideFrictionSolve, guide_state
    from floor_portal_house import House
    from floor_portal_loads import Case, gravity, roof_goods, roof_gravity, wind

    house = House(config)
    house.controls()
    g, q, _ = gravity(house)
    rg, rq, ru, _ = roof_gravity(house)
    dg, water, extra, _, _ = roof_goods(house)
    g = Case.combination(house, 'G', [(1, g), (1, rg), (1, dg)])
    q = Case.combination(house, 'Q', [(1, q), (1, rq), (1, water)])
    u = Case.combination(house, 'U', [(1, ru), (-1, extra)])
    factored = Case.combination(house, '1.35G+1.5Q', [(1.35, g), (1.5, q)])
    solver = GuideFrictionSolve(house, 0.20)
    shelf = [i for i, contact in enumerate(house.contacts)
             if contact['name'].startswith('L-cap-projected-bearing-')]
    comparisons = ((4, 4, False, 6000, False), (1, 4, True, 7400, False), (4, 1, True, 7400, True))
    results = []
    for i, j, court, goods_z, uplift in comparisons:
        pressure = wind(house, (i, j), court, goods_z)
        parts = [(1, pressure), (1, u)] if uplift else [(1, factored), (1, pressure), (-1, u)]
        case = Case.combination(house, 'fixed-direction friction', parts)
        displacement, reaction, contact = solver(case.f)
        balance = house.rigid.T @ (case.f + reaction)
        assert max(abs(balance[:3])) < 0.03 and max(abs(balance[3:])) < 20.0
        planar = {name: float(np.linalg.norm(row['forceAndMoment'][:2]))
                  for name, row in guide_state(house, displacement).items()
                  if name.startswith('L-cap-key-')}
        friction = contact['guideFriction']
        radial = friction['groupedFrictionResultantN']
        guide, resultant = max(((name, hypot(force, radial.get(name, 0.0)))
                                for name, force in planar.items()), key=lambda item: item[1])
        guide_width = config.L_key_width
        engaged_depth, contact_fraction = 60.0, 0.75
        concrete_comparator = 0.85 * 30.0 / 1.5
        results.append({
            'programme': (i, j), 'court': court, 'goodsZmm': goods_z, 'uplift': uplift,
            'minimumShelfGapMm': float(min(contact['gap'][index] for index in shelf)),
            'maximumShelfCompressionN': float(max(contact['force'][index] for index in shelf)),
            'maximumResultantGuide': guide,
            'resultantKN': resultant / 1000.0,
            'simultaneousTangentKN': planar[guide] / 1000.0,
            'simultaneousRadialKN': radial.get(guide, 0.0) / 1000.0,
            'concretePressureComparatorMPa': concrete_comparator,
            'nominalTangentPressureMPa': planar[guide] / (guide_width * engaged_depth * contact_fraction),
            'engagementNeededAtPressureComparatorMm': planar[guide] / (guide_width * contact_fraction * concrete_comparator),
            'directionReversalCount': friction['directionReversalCount'],
        })
    return results


def checked_source(worktree):
    def git(*args):
        return subprocess.run(['git', '-C', worktree, *args], check=True, capture_output=True).stdout

    diff = git('diff', '--no-ext-diff', '--binary', '--full-index', '--no-renames',
               '--diff-algorithm=myers', '--no-indent-heuristic', '-U3', 'HEAD', '--')
    if git('rev-parse', 'HEAD').decode().strip() != REPLAY['SOURCE_COMMIT'] or diff != PATCH.read_bytes():
        raise ValueError('Apply the exact seat detail patch to the pinned predecessor.')
    sys.path.insert(0, str(worktree.resolve() / 'project' / 'str' / 'studies'))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('worktree', nargs='?', type=Path)
    parser.add_argument('screen', nargs='?', choices=('signed', 'movement', 'friction', 'friction-longer'))
    args = parser.parse_args()
    result = layout()
    if bool(args.worktree) != bool(args.screen):
        parser.error('provide both the pinned worktree and a screen')
    if args.worktree:
        with redirect_stdout(sys.stderr):
            checked_source(args.worktree)
            REPLAY['check_contact_gap']()
            base = REPLAY['parameters']('cap300-relief5')
            across = GUIDE_ACROSS_CORE + OUTWARD
            source_stations = tuple(seat_guide_station(s) + OUTWARD for s in FIT['GUIDE_STATIONS'])
            stations = tuple((s, across) for s in source_stations) + tuple((across, s) for s in source_stations)
            config = replace(base, L_arm_width=CORE_WIDTH + OUTWARD, L_outward_extension=OUTWARD,
                             L_key_centres=stations, L_projected_bearing_gap=SEAT_GAP,
                             L_trial_anchor_positions=tuple(result['trialPositionsMm']))
            if args.screen == 'signed':
                import numpy as np
                if np.finfo(np.longdouble).eps >= np.finfo(float).eps:
                    parser.error('signed reaction recovery requires NumPy longdouble wider than float64')
            result['sourceCommit'] = REPLAY['SOURCE_COMMIT']
            result['replayPatchSHA256'] = hashlib.sha256(PATCH.read_bytes()).hexdigest()
            if args.screen == 'friction-longer':
                config = replace(config, L_key_width=FIT['TONGUE_LENGTH'] + 3.0)
            screen = friction_screen if args.screen.startswith('friction') else REPLAY[args.screen + '_screen']
            result['replay'] = screen(config)
    print(json.dumps(result, indent=2))


if __name__ == '__main__':
    main()
