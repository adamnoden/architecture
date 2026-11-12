"""Finite geometry and coupled demand comparison for the outward L-cap seat."""
import argparse
from contextlib import redirect_stdout
from dataclasses import replace
from itertools import combinations
import json
from math import hypot, sqrt
from pathlib import Path
from runpy import run_path
import hashlib
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
BEND_BOTTOM, BEND_TOP = 6215.0, 6450.0
SEAT_GAP = 15.0
GUIDE_SHIFT = 20.0


def anchor_location(x, y):
    if x < 140 and y < 140:
        return (29.0 if x < 70 else 102.0, 29.0 if y < 70 else 102.0)
    if x >= 850:
        station = 830.0 if x == 850 else 908.0
        return (station, 27.0) if y < 70 else (station + 39.0, 89.0)
    transposed = anchor_location(y, x)
    return transposed[1], transposed[0]


def offset(a, b):
    return a[0] - b[0], a[1] - b[1]


def seat_guide_station(station):
    return station + GUIDE_SHIFT if station == min(FIT['GUIDE_STATIONS']) else station


def distance_to_cassette(point, centre, direction):
    dx, dy = offset(point, centre)
    nx, ny = direction
    along = dx * nx + dy * ny
    across = -dx * ny + dy * nx
    return hypot(max(0.0, abs(along) - FIT['CASSETTE_LENGTH'] / 2),
                 max(0.0, abs(across) - FIT['CASSETTE_WIDTH'] / 2))


def l_edge(point, outward):
    x, y = (coordinate + outward for coordinate in point)
    end, width = CORE_LENGTH + outward, CORE_WIDTH + outward
    if not (0 <= x <= end and 0 <= y <= end and min(x, y) <= width):
        return -1.0
    boundary = ((0, 0), (end, 0), (end, width), (width, width), (width, end), (0, end))
    return min(FIT['point_to_segment']((x, y), a, b) for a, b in FIT['edges'](boundary))


def layout():
    old = tuple(map(tuple, json.loads(SOURCE.read_text())['outer']['primaryBarXY']))
    assert len(old) == 12 and len(set(old)) == 12
    proposed = tuple(anchor_location(*bar) for bar in old)
    rise = BEND_TOP - BEND_BOTTOM
    largest_offset = max(hypot(*offset(b, a)) for a, b in zip(old, proposed))
    # Both bars use the same cubic easing along Z. Simultaneous cross sections
    # therefore interpolate between the old and new pair vectors on a segment.
    pair_segments = [(offset(old[i], old[j]), offset(proposed[i], proposed[j]))
                     for i, j in combinations(range(len(old)), 2)]
    synchronous = min(hypot(*a) if a == b else FIT['point_to_segment']((0, 0), a, b)
                      for a, b in pair_segments)
    max_slope = 1.5 * largest_offset / rise
    bar_clear = synchronous / sqrt(1 + max_slope**2) - BAR_DIAMETER - 2 * SETTING
    # Bound different-height pairs by the slope, then account for independent setting.
    maximum_coupler_radius = COUPLER_DIAMETER / 2 + WELD_TOE_RESERVE
    spacings = [hypot(*offset(a, b)) for a, b in combinations(proposed, 2)]
    packing_gap = min(spacings) - 2 * maximum_coupler_radius - 2 * SETTING
    unshifted_gap = min(hypot(*offset(a, b)) for a, b in combinations(old, 2)) - COUPLER_DIAMETER - 2 * SETTING
    edge_margin = min(l_edge(point, 0) for point in proposed) - maximum_coupler_radius - SETTING
    cover = min(l_edge(point, OUTWARD) for point in proposed) - COUPLER_DIAMETER / 2 - SETTING
    bend_radius = rise**2 / (6 * largest_offset)

    conflicts, webs, unrecentred_webs = [], [], []
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
                old_centre = (along, 50.0) if leg == 0 else (50.0, along)
                old_delta = (old_centre[0] + sx * (origin_x - 6000.0),
                             old_centre[1] + sy * (origin_y - 6000.0))
                old_direction = tuple(coordinate / hypot(*old_delta) for coordinate in old_delta)
                old_local = tuple(coordinate + OUTWARD for coordinate in old_centre)
                unrecentred_webs.append(FIT['web_to_l_boundary'](old_local, old_direction, *spans) - 2 * SETTING)
                conflicts.extend(distance_to_cassette(point, centre, direction) for point in proposed)
    coupler_to_guide = min(conflicts) - COUPLER_DIAMETER / 2 - 2 * SETTING
    assert bar_clear >= CLEAR_SCREEN and packing_gap >= CLEAR_SCREEN > unshifted_gap
    assert min(webs) >= COVER_SCREEN > min(unrecentred_webs)
    assert cover >= COVER_SCREEN and edge_margin > 0.0
    cap = json.loads((STUDIES / 'floor-portal-cap-replay.json').read_text())
    plain_gap = cap['signed']['cap300-relief5']['capTransition']['minimumProjectedGap']
    return {
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
        'minimumCxl20wSideCoverAfterSettingsMm': cover,
        'sideCoverScreenMm': COVER_SCREEN,
        'minimumCxl20wToCassettePlanGapAfterSettingsMm': coupler_to_guide,
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
        'fiveMmReplayMinimumProjectedGap': plain_gap,
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
        guide_width = FIT['TONGUE_LENGTH']
        engaged_depth, contact_fraction = 60.0, 0.75
        concrete_comparator = 0.85 * 30.0 / 1.5
        results.append({
            'programme': (i, j), 'court': court, 'goodsZmm': goods_z, 'uplift': uplift,
            'minimumShelfGapMm': float(min(contact['gap'][index] for index in shelf)),
            'maximumShelfCompressionN': float(max(contact['force'][index] for index in shelf)),
            'maximumResultantGuide': guide,
            'resultantKn': resultant / 1000.0,
            'simultaneousTangentKn': planar[guide] / 1000.0,
            'simultaneousRadialKn': radial.get(guide, 0.0) / 1000.0,
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
    parser.add_argument('screen', nargs='?', choices=('signed', 'movement', 'friction'))
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
            result['sourceCommit'] = REPLAY['SOURCE_COMMIT']
            result['replayPatchSHA256'] = hashlib.sha256(PATCH.read_bytes()).hexdigest()
            screen = friction_screen if args.screen == 'friction' else REPLAY[args.screen + '_screen']
            result['replay'] = screen(config)
    print(json.dumps(result, indent=2))


if __name__ == '__main__':
    main()
