"""Continuous split-hoop insertion and straight-splice envelope comparison."""
import hashlib
import json
from math import ceil, cos, hypot, pi, sin, sqrt
from pathlib import Path
from runpy import run_path

import numpy as np

STUDIES = Path(__file__).resolve().parent
DETAIL = STUDIES / 'floor-portal-seat-detail.py'
RECEIPT = DETAIL.with_suffix('.json')
SEAT = run_path(str(DETAIL))
HOOP_RADIUS = 4.0
RELATIVE_PLAN_SETTING = 2 * SEAT['SETTING']
HEIGHT_STEP = 0.05
ANGLE_STEP = pi / 180
TRAVEL = 120.0
SPLIT = 43.0


def chord_segments(arc):
    centre, radius, start, end = arc
    count = ceil((end - start) * pi / 180 / ANGLE_STEP)
    angles = np.linspace(start * pi / 180, end * pi / 180, count + 1)
    points = [(centre[0] + radius * cos(a), centre[1] + radius * sin(a)) for a in angles]
    return list(zip(points, points[1:]))


def point_segment_distances(points, starts, ends):
    delta = ends - starts
    offset = points[:, None] - starts
    u = np.clip((offset * delta).sum(axis=2) / (delta * delta).sum(axis=1), 0, 1)
    return np.linalg.norm(offset - u[:, :, None] * delta, axis=2)


def swept_chord_distances(points, chords, displacement):
    starts, ends = np.asarray(chords, dtype=float).transpose(1, 0, 2)
    if displacement == (0, 0):
        return point_segment_distances(points, starts, ends).min(axis=1)
    d = np.asarray(displacement)
    tangent = ends - starts
    relative = points[:, None] - starts
    area = tangent[:, 0] * d[1] - tangent[:, 1] * d[0]
    nondegenerate = abs(area) > 1e-8
    divisor = np.where(nondegenerate, area, 1.0)
    along = (relative[:, :, 0] * d[1] - relative[:, :, 1] * d[0]) / divisor
    across = (tangent[:, 0] * relative[:, :, 1] - tangent[:, 1] * relative[:, :, 0]) / divisor
    inside = nondegenerate & (along >= 0) & (along <= 1) & (across >= 0) & (across <= 1)
    distances = np.minimum.reduce((
        point_segment_distances(points, starts, ends),
        point_segment_distances(points, starts + d, ends + d),
        point_segment_distances(points, starts, starts + d),
        point_segment_distances(points, ends, ends + d),
    ))
    distances[inside] = 0
    return distances.min(axis=1)


def smooth_station(z):
    t = min(1.0, max(0.0, (z - 6215.0) / 220.0))
    return 600.0 - 10.0 * t * t * (3.0 - 2.0 * t)


def bar_paths(receipt):
    paths = []
    for index, (old, trial) in enumerate(zip(receipt['originalPositionsMm'], receipt['trialPositionsMm'])):
        slope = 1.5 * hypot(*SEAT['offset'](old, trial)) / (SEAT['BEND_TOP'] - SEAT['BEND_BOTTOM'])
        paths.append((f'H20-{index}', 10.0, slope,
                      lambda z, a=old, b=trial: SEAT['bent_bar_at'](a, b, z)))
    for axis in (0, 1):
        for station in (350.0, 600.0):
            for q in (42.0, 80.0):
                def path(z, station=station, q=q, axis=axis):
                    pair = (station if station == 350.0 else smooth_station(z), q)
                    return pair if axis == 0 else pair[::-1]
                slope = 0 if station == 350.0 else 15.0 / 220.0
                paths.append((f'H12-{axis}-{station:g}-{q:g}', 6.0, slope, path))
    return paths


def moving_gap(chords, direction, levels, paths, sagitta, piece_radius=HOOP_RADIUS):
    shift = tuple(TRAVEL * x for x in direction)
    best = None
    for level in levels:
        heights = np.linspace(level - 10, level + 10, round(20 / HEIGHT_STEP) + 1)
        for name, radius, slope, path in paths:
            points = np.asarray([path(z) for z in heights])
            planar = swept_chord_distances(points, chords, shift)
            bounds = ((planar - sagitta - slope * HEIGHT_STEP / 2) / sqrt(1 + slope ** 2)
                      - radius - piece_radius - RELATIVE_PLAN_SETTING)
            i = int(np.argmin(bounds))
            if best is None or bounds[i] < best['clearanceLowerBoundMm']:
                best = {'clearanceLowerBoundMm': float(bounds[i]), 'levelMm': level,
                        'bar': name, 'sampleHeightMm': float(heights[i]),
                        'sameHeightClearanceUpperBoundMm': float(planar[i] + sagitta - radius
                                                                - piece_radius - RELATIVE_PLAN_SETTING)}
    return best


def mid_arm_trial(segments, arcs, levels, paths, sagitta, sleeve_radius):
    station, centreline = 420.0, 3.0
    left, right = station - 24.0, station + 24.0
    split = (station, centreline)
    cold_points = [segments[0][0], (left - 21, -1), (left, centreline), split]
    room_points = [split, (right, centreline), (right + 21, -1), segments[0][1]]

    def mirrored_chords(points):
        chords = list(zip(points, points[1:]))
        return chords + [tuple(point[::-1] for point in chord) for chord in chords]

    cold = mirrored_chords(cold_points) + chord_segments(arcs[0])
    room = mirrored_chords(room_points) + segments[1:5]
    for arc in arcs[1:]:
        room.extend(chord_segments(arc))
    sleeves = [((left, centreline), (right, centreline)), ((centreline, left), (centreline, right))]
    return {
        'stationMm': station,
        'centrelineFromCoreOriginMm': centreline,
        'coverAfterSettingMm': centreline + SEAT['OUTWARD'] - sleeve_radius - SEAT['SETTING'],
        'seatedSleeveToFixedBars': moving_gap(sleeves, (0, 0), levels, paths, 0, sleeve_radius),
        'coldDiagonal': moving_gap(cold, (-1, -1), levels, paths, sagitta),
        'roomDiagonal': moving_gap(room, (1, 1), levels, paths, sagitta),
    }


def compare():
    receipt = json.loads(RECEIPT.read_text())
    loop = receipt['roundedH8LinkScreen']
    segments = loop['centrelineSegmentsFromCoreOriginMm']
    arcs = loop['centrelineArcsFromCoreOriginMm']
    end_x = segments[1][0][0]
    assert segments[1][0][1] < SPLIT < segments[1][1][1]
    assert segments[4][1] == segments[1][0][::-1]
    split_points = ((end_x, SPLIT), (SPLIT, end_x))
    cold = [segments[0], segments[5], (segments[1][0], split_points[0]),
            (segments[4][1], split_points[1])]
    room = [segments[2], segments[3], (split_points[0], segments[1][1]),
            (split_points[1], segments[4][0])]
    for index in (0, 1, 5):
        cold.extend(chord_segments(arcs[index]))
    for index in (2, 3, 4):
        room.extend(chord_segments(arcs[index]))
    sagitta = max(arc[1] for arc in arcs) * (1 - cos(ANGLE_STEP / 2))
    paths = bar_paths(receipt)
    levels = loop['levelsMm']
    routes = {
        'coldDiagonal': moving_gap(cold, (-1, -1), levels, paths, sagitta),
        'roomDiagonal': moving_gap(room, (1, 1), levels, paths, sagitta),
        'coldSingleAxisControl': moving_gap(cold, (-1, 0), levels, paths, sagitta),
    }
    sleeve = ((end_x, 19.0), (end_x, 67.0))
    sleeve_chords = [sleeve, tuple(point[::-1] for point in sleeve)]
    sleeve_radius = 8.0
    seated_sleeve = moving_gap(sleeve_chords, (0, 0), levels, paths, 0, sleeve_radius)
    routes['coldWithPreinstalled16MmSleeve'] = moving_gap(
        sleeve_chords, (-1, -1), levels, paths, 0, sleeve_radius)
    splice_diameter = 2 * (SEAT['CORE_LENGTH'] - end_x - SEAT['COVER_SCREEN'] - SEAT['SETTING'])
    inward = 4.0
    relocated_end = tuple((x - inward, y) for x, y in sleeve)
    relocated = [relocated_end, tuple(point[::-1] for point in relocated_end)]
    inward_clearance = moving_gap(relocated, (0, 0), levels, paths, 0, sleeve_radius)
    mid_arm = mid_arm_trial(segments, arcs, levels, paths, sagitta, sleeve_radius)
    assert inward_clearance['sameHeightClearanceUpperBoundMm'] < 0
    assert mid_arm['coverAfterSettingMm'] == SEAT['COVER_SCREEN']
    assert mid_arm['coldDiagonal']['clearanceLowerBoundMm'] > 0
    assert mid_arm['roomDiagonal']['sameHeightClearanceUpperBoundMm'] < 0
    assert routes['coldDiagonal']['clearanceLowerBoundMm'] > 0
    assert routes['roomDiagonal']['clearanceLowerBoundMm'] > 0
    assert routes['coldSingleAxisControl']['sameHeightClearanceUpperBoundMm'] < 0
    assert splice_diameter == 2 * HOOP_RADIUS
    assert routes['coldWithPreinstalled16MmSleeve']['sameHeightClearanceUpperBoundMm'] < 0
    return {
        'sourceSha256': {p.name: hashlib.sha256(p.read_bytes()).hexdigest() for p in (DETAIL, RECEIPT)},
        'splitPointsMm': split_points,
        'travelPerAxisMm': TRAVEL,
        'heightSampleStepMm': HEIGHT_STEP,
        'arcChordMaximumSagittaMm': sagitta,
        'relativePlanSettingMm': RELATIVE_PLAN_SETTING,
        'fixedBarClearances': routes,
        'maximumConcentricSpliceOutsideDiameterAtStraightEndsMm': splice_diameter,
        'hypotheticalConcentricSleeve': {
            'diameterMm': 2 * sleeve_radius,
            'lengthMm': sleeve[1][1] - sleeve[0][1],
            'seatedFixedBarClearance': seated_sleeve,
            'coverAfterSettingMm': SEAT['CORE_LENGTH'] - end_x - sleeve_radius - SEAT['SETTING'],
            'coverScreenMm': SEAT['COVER_SCREEN'],
            'inwardRelocationToRestoreCoverMm': inward,
            'inwardRelocationSeatedFixedBarClearance': inward_clearance,
        },
        'midArmRelocatedSplit': mid_arm,
    }


if __name__ == '__main__':
    print(json.dumps(compare(), indent=2))
