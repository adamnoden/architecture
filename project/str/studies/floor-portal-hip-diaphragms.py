"""Finite hip diaphragm clearance and load-path comparisons. Dimensions in mm."""

from hashlib import sha256
import json
from math import ceil, floor, sqrt
from pathlib import Path
import sys

HERE = Path(__file__).resolve().parent
HEEL = 'current-house-welded-heel'
SEAT = 'floor-portal-permanent-seat'
WEB = 16
TRANSFER_LENGTH = 160
LID = 20
LIGAMENT_ALLOWANCE = 2
CASSETTE_HALF_SIDE = 150
RING_AXIS_IN_CORE = 70
CORE_ARM_WIDTH = 140
RETAINED_SEAT_PLATE_EDGE_RESERVE = 19 + 2 + 5


def read(name, suffix='.json'):
    return (HERE / (name + suffix)).read_bytes()


def diagonal_coordinates(seat):
    return [
        (row['localAnchorIndex'],
         ((row['coreXYmm'][0] + row['coreXYmm'][1] - 2 * RING_AXIS_IN_CORE) / sqrt(2),
          (row['coreXYmm'][1] - row['coreXYmm'][0]) / sqrt(2)))
        for row in seat['placements']['locations'] if not row['straightArm']
    ]


def clearance(axis, station, anchors, radius):
    return min(abs(point[axis] - station) - WEB / 2 - radius for _, point in anchors)


def relocated_station(axis, original, anchors, radius):
    # Do not flip a station to the other side or put the transfer strip
    # outside the 300-square cassette in the 45-degree plan.
    bound = floor(CASSETTE_HALF_SIDE * sqrt(2) - TRANSFER_LENGTH / 2 - WEB / 2)
    admissible = [x for x in range(-bound, bound + 1)
                  if x * original > 0 and clearance(axis, x, anchors, radius) >= LIGAMENT_ALLOWANCE]
    if not admissible:
        raise ValueError('No socket-clear station inside the cassette')
    return min(admissible, key=lambda x: (abs(x - original), x))


def interval_union(intervals):
    covered = 0
    right = -TRANSFER_LENGTH / 2
    for start, end in sorted(intervals):
        covered += max(0, end - max(start, right))
        right = max(right, end)
    return covered


def interrupted_length(axis, station, anchors, radius):
    intervals = []
    for _, point in anchors:
        distance = max(0, abs(point[axis] - station) - WEB / 2)
        if distance >= radius:
            continue
        reach = sqrt(radius**2 - distance**2)
        intervals.append((max(-80, point[1 - axis] - reach), min(80, point[1 - axis] + reach)))
    return interval_union(intervals)


def retained_web_packing(radius, pitch, minimum_web_half_span):
    # Neglect extra weld and tool reserve. A fully contained round socket
    # bounds the centre to the reduced diamond in the diagonal coordinates.
    limit = (CASSETTE_HALF_SIDE - radius) * sqrt(2)
    # The shortest source web is 230 mm long. A centre beyond its end
    # must also fit the diameter-reduced square and the old L bearing plate.
    # For large positive u, both coordinates cannot lie inside the 140 mm
    # corner square, so edge reserve is bounded by the lesser coordinate.
    other_axis_limit = limit - minimum_web_half_span
    positive_u_smallest_core_coordinate = RING_AXIS_IN_CORE + (
        minimum_web_half_span - other_axis_limit) / sqrt(2)
    positive_u_minimum_core_sum = 2 * RING_AXIS_IN_CORE + minimum_web_half_span * sqrt(2)
    negative_u_largest_lesser_coordinate = RING_AXIS_IN_CORE - minimum_web_half_span / sqrt(2)
    outer_v_largest_lesser_coordinate = RING_AXIS_IN_CORE + (
        other_axis_limit - minimum_web_half_span) / sqrt(2)
    assert positive_u_minimum_core_sum > 2 * CORE_ARM_WIDTH
    assert max(CORE_ARM_WIDTH - positive_u_smallest_core_coordinate,
               negative_u_largest_lesser_coordinate,
               outer_v_largest_lesser_coordinate) < RETAINED_SEAT_PLATE_EDGE_RESERVE
    web_exclusion = WEB / 2 + radius
    u_safe, v_safe = 80 - web_exclusion, 70 - web_exclusion
    u_outer, v_outer = 80 + web_exclusion, 70 + web_exclusion
    assert u_outer + v_outer > limit
    # Negative outer u puts at least one centre coordinate outside the old L.
    negative_u_upper_core_coordinate = RING_AXIS_IN_CORE - u_outer / sqrt(2)
    # Positive outer u is outside the inner corner or within this upper bound
    # of its re-entrant boundary, allowing the most favourable point at v=0
    # no more margin than the diagonal of the remaining coordinate bounds.
    positive_u_lower_core_coordinate = RING_AXIS_IN_CORE + (u_outer - v_safe) / sqrt(2)
    reentrant_clearance_upper = max(0, CORE_ARM_WIDTH - positive_u_lower_core_coordinate) * sqrt(2)
    outer_v_upper_core_coordinate = RING_AXIS_IN_CORE + (u_safe - v_outer) / sqrt(2)
    assert max(negative_u_upper_core_coordinate, reentrant_clearance_upper,
               outer_v_upper_core_coordinate) < RETAINED_SEAT_PLATE_EDGE_RESERVE
    minimum_u_spacing = sqrt(pitch**2 - (2 * v_safe)**2)
    bound = floor(2 * u_safe / minimum_u_spacing) + 1
    assert bound < 4
    return {
        'squareContainmentMaximumAbsUSumAbsVMm': limit,
        'shortestCenteredWebHalfSpanMm': minimum_web_half_span,
        'oldLSeatPlateMinimumEdgeReserveMm': RETAINED_SEAT_PLATE_EDGE_RESERVE,
        'outerSectorMaximumEdgeReservesMm': [negative_u_upper_core_coordinate,
                                            reentrant_clearance_upper,
                                            outer_v_upper_core_coordinate],
        'remainingCentralWidthAndHeightMm': [2 * u_safe, 2 * v_safe],
        'minimumSocketCentrePitchMm': pitch,
        'centralMinimumAlongUSeparationMm': minimum_u_spacing,
        'centralMaximumCentresUpperBound': bound,
    }


def compare():
    heel, seat = map(lambda name: json.loads(read(name)), (HEEL, SEAT))
    hip = heel['node']['hip']
    box_depth = hip['ringZ'][1] - hip['ringZ'][0]
    space = box_depth - 2 * LID
    through_web_length = 260
    total_through_and_cross_length = heel['componentsMM3']['cassetteTwoThroughPlusTwoCrossWebs'] / (2 * space * WEB)
    cross_web_length = total_through_and_cross_length - through_web_length
    minimum_web_half_span = min(through_web_length, cross_web_length) / 2
    assert minimum_web_half_span == 115
    source_stations = [(0, -80), (0, 80), (1, -70), (1, 70)]
    radius = seat['placements']['socketOutsideDiameterMm'] / 2 + seat['placements']['relativeCommonDatumErrorMm']
    anchors = diagonal_coordinates(seat)
    baselines = []
    for index, point in anchors:
        overlap = [max(0, radius + WEB / 2 - abs(point[axis] - station))
                   for axis, station in source_stations]
        baselines.append(dict(anchor=index, diagonalPlanMm=point, overlapWithEachWebMm=overlap))
    assert len(baselines) == 4 and all(max(row['overlapWithEachWebMm']) > 0 for row in baselines)

    moves = [dict(axis=axis, original=station, moved=relocated_station(axis, station, anchors, radius))
             for axis, station in source_stations]
    for row in moves:
        row['reserveMm'] = clearance(row['axis'], row['moved'], anchors, radius)
    max_move = max(abs(row['moved'] - row['original']) for row in moves)
    comparison_limit = 200 / 1.1
    shifted_20 = hip['skinStress'] * max_move / hip['installedWebOffsetBound']
    minimum_thickness = LID * sqrt(shifted_20 / comparison_limit)
    full_thickness = ceil(minimum_thickness)
    above = hip['clearAboveFullCassette'] - 12
    inward_minimum = max(0, full_thickness - LID - above)
    original_mass = heel['nodeGkN']
    full_plate_extra_kn = 300**2 * (full_thickness - LID) / 1e9 * 78.5
    path_weld_stress = hip['internalWebWeldStress']
    relief = []
    for axis, station in source_stations:
        lost = interrupted_length(axis, station, anchors, radius)
        # Keep the upper seam, charge all disk-chord interruption to the
        # lower one. The optimistic average demands are not local strengths.
        remaining = 2 * TRANSFER_LENGTH - lost
        relief.append(dict(axis=axis, stationMm=station, lowerWeldInterruptedMm=lost,
                           remainingDoubleWeldMm=remaining,
                           idealAverageWeldStressMPa=path_weld_stress * 2 * TRANSFER_LENGTH / remaining))
    assert shifted_20 > comparison_limit
    assert inward_minimum > 0 and original_mass + full_plate_extra_kn > heel['nodeGMaximum']
    return {
        'status': 'No admitted hip detail; aligned seats and guide remain separate',
        'sourcesSha256': {f'{name}{suffix}': sha256(read(name, suffix)).hexdigest()
                          for name, suffix in ((HEEL, '.json'), (HEEL, '.py'), (SEAT, '.json'))},
        'fittingEnvelope': {'socketAndSettingRadiusMm': radius, 'trialAdditionalWebReserveMm': LIGAMENT_ALLOWANCE},
        'originalWebs': source_stations,
        'originalClashes': baselines,
        'unchangedWebsWithRelocatedBars': retained_web_packing(
            radius, seat['placements']['socketOutsideDiameterMm'] +
            seat['placements']['relativeCommonDatumErrorMm'], minimum_web_half_span),
        'translatedWebs': {
            'stations': moves, 'maximumShoeTransferOffsetMm': max_move,
            'retainedLidStressMPa': shifted_20, 'trialLidStressLimitMPa': comparison_limit,
            'minimumUniformThicknessMm': minimum_thickness, 'roundedUniformThicknessMm': full_thickness,
            'originalGrossRoofGapMm': hip['clearAboveFullCassette'], 'retainedRoofGapMm': 12,
            'minimumThickeningInsideCellMm': inward_minimum,
            'interiorIfAllThickeningInsideCellMm': space - (full_thickness - LID),
            'fullLidAdditionalWeightKN': full_plate_extra_kn,
            'fullLidNodeWeightBeforeWebChangesKN': original_mass + full_plate_extra_kn,
            'originalNodeWeightLimitKN': heel['nodeGMaximum'],
        },
        'fixedWebBottomReliefs': {
            'webDepthMm': space, 'rows': relief,
            'lowerJointMustBeRebuilt': True,
            'cutHeightCannotBeSelectedWithoutCollarWeldAndToolDepth': True,
            'averageWeldStressScreenMPa': 100,
        },
    }


if __name__ == '__main__':
    result = json.dumps(compare(), indent=2) + '\n'
    if '--check' in sys.argv:
        assert read('floor-portal-hip-diaphragms').decode() == result
    else:
        sys.stdout.write(result)
