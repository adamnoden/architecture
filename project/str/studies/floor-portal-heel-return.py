"""Trial finite lower weld groups at the two socket-interrupted hip heel webs."""
import hashlib
import json
import math
from pathlib import Path
import sys

STUDIES = Path(__file__).parent
SOURCE = STUDIES / 'floor-portal-hip-diaphragms.json'
THROAT_MM = 8
HALF_WEB_MM = 8
FILLET_LEG_MM = math.sqrt(2) * THROAT_MM
CROSS_WEB_INNER_MM = 80 - HALF_WEB_MM
CASSETTE_EDGE_MM = 150 * math.sqrt(2)
ACTIVE_HALF_LENGTH_MM = 80


def properties(lines, force):
    area = sx = sy = xx = xy = yy = 0
    for (u, v), (r, s) in lines:
        a = THROAT_MM * math.hypot(r - u, s - v)
        area += a
        sx += a * (u + r) / 2
        sy += a * (v + s) / 2
        xx += a * (u * u + u * r + r * r) / 3
        xy += a * (2 * u * v + u * s + r * v + 2 * r * s) / 6
        yy += a * (v * v + v * s + s * s) / 3
    u_c, v_c = sx / area, sy / area
    ix, ixy, iy = xx - sx * u_c, xy - sx * v_c, yy - sy * v_c
    determinant = ix * iy - ixy**2
    b = force * (ixy * v_c - iy * u_c) / determinant
    c = force * (ixy * u_c - ix * v_c) / determinant
    stresses = [force / area + b * (u - u_c) + c * (v - v_c)
                for line in lines for u, v in line]
    return {
        'effectiveLengthMm': area / THROAT_MM,
        'centroidRelativeToLoadedLineMm': [u_c, v_c],
        'directAverageMPa': force / area,
        'linearEndStressRangeMPa': [min(stresses), max(stresses)],
        'maximumAbsoluteLinearEndStressMPa': max(map(abs, stresses)),
    }


def distance_to_segment(point, start, end):
    direction = (end[0] - start[0], end[1] - start[1])
    squared = sum(value**2 for value in direction)
    t = max(0, min(1, sum((point[i] - start[i]) * direction[i]
                          for i in range(2)) / squared))
    return math.hypot(*(point[i] - start[i] - t * direction[i] for i in range(2)))


def routed_path(left, right, height):
    return [(left, 0), (left, height), (right, height), (right, 0)]


def shape(left, right, height, sockets, radius, station):
    web_path = routed_path(left, right, height)
    # Only credit the face away from the sockets. At the return corners allow
    # the bounding square of the web and projected fillet, not a zero-width line.
    outside = HALF_WEB_MM + FILLET_LEG_MM
    weld_reservation = routed_path(left - outside, right + outside,
                                  height + outside)
    socket_reserve = min(distance_to_segment(point, start, end) - radius - HALF_WEB_MM
                         for point in sockets for start, end in zip(web_path, web_path[1:]))
    web_reserve = CROSS_WEB_INNER_MM - max(abs(left - outside), abs(right + outside))
    box_reserve = (CASSETTE_EDGE_MM - max(abs(u) + abs(v + station)
                                        for u, v in weld_reservation)) / math.sqrt(2)
    return {'socketToWebMm': socket_reserve, 'crossWebToFilletToeMm': web_reserve,
            'cassetteEdgeToFilletToeMm': box_reserve}


def existing_wings(start, end, both_faces):
    return [segment for row in ([HALF_WEB_MM, -HALF_WEB_MM] if both_faces else [HALF_WEB_MM])
            for segment in (((-ACTIVE_HALF_LENGTH_MM, row), (start, row)),
                            ((end, row), (ACTIVE_HALF_LENGTH_MM, row)))]


def screen(left, right, height, sockets, radius, station, force, both_faces):
    reserve = shape(left, right, height, sockets, radius, station)
    if min(reserve.values()) < 0:
        return None
    # The inherited relief clears the entire diameter across both faces. Do
    # not take credit for shorter interruptions at one face of the web.
    controlling_socket = max(sockets, key=lambda point: point[1])
    lower, upper = controlling_socket[0] - radius, controlling_socket[0] + radius
    outside_face = [(left - HALF_WEB_MM, HALF_WEB_MM),
                    (left - HALF_WEB_MM, height + HALF_WEB_MM),
                    (right + HALF_WEB_MM, height + HALF_WEB_MM),
                    (right + HALF_WEB_MM, HALF_WEB_MM)]
    lines = existing_wings(lower, upper, both_faces) + list(zip(outside_face, outside_face[1:]))
    return {'webCentrelineRelativeToLoadedLineMm': routed_path(left, right, height),
            'outboardWeldRootLineMm': outside_face, 'reservesMm': reserve,
            **properties(lines, force)}


def centred_groove_screen(force, radius, axis, station, anchors):
    # Keep the shorter source web as the bound and debit entirely both
    # perpendicular intersections. Do not assume a path through either.
    source_half_span = 115
    perpendicular = (70, 80)[axis]
    groove = 16
    blocked = [(position - HALF_WEB_MM, position + HALF_WEB_MM)
               for position in (-perpendicular, perpendicular)]
    for point in anchors:
        normal = max(0, abs(point[axis] - station) - HALF_WEB_MM)
        if normal < radius:
            projected = math.sqrt(radius**2 - normal**2)
            along = point[1 - axis]
            blocked.append((along - projected, along + projected))
    intervals = []
    left = -source_half_span
    for start, end in sorted(blocked):
        right = min(start, source_half_span)
        if right > left:
            intervals.append((left, right))
        left = max(left, end)
    if left < source_half_span:
        intervals.append((left, source_half_span))
    length = sum(end - start for start, end in intervals)
    first_moment = sum((end**2 - start**2) / 2 for start, end in intervals)
    second_moment = sum((end**3 - start**3) / 3 for start, end in intervals)
    centroid = first_moment / length
    along_inertia = groove * (second_moment - first_moment * centroid)
    direct = force / (length * groove)
    peak = max(abs(direct - force * centroid * (point - centroid) / along_inertia)
               for interval in intervals for point in interval)
    limit = 100
    moment_reserve = (limit - peak) * length * groove**2 / 6
    return {
        'axis': axis, 'stationMm': station,
        'centredLineEffectiveGrooveMm': groove,
        'effectiveIntervalsMm': intervals,
        'effectiveLengthMm': length,
        'grossDirectAverageMPa': direct,
        'elasticPeakAtGroupEndsMPa': peak,
        'minimumEffectiveGrooveToMeetLinear100MPaMm': groove * peak / limit,
        'additionalTransverseMomentAt100MPaKNm': moment_reserve / 1e6,
        'equivalentTransverseForceLineErrorMm': moment_reserve / force,
        'shortestWebHalfSpanMm': source_half_span,
        'uninterruptedOutboardWingMmEachEnd': source_half_span - perpendicular - HALF_WEB_MM,
        'reserveToCassetteEdgeBeforeProcessMm':
            (CASSETTE_EDGE_MM - source_half_span - abs(station) - groove / 2) / math.sqrt(2),
    }


def compare():
    source = json.loads(SOURCE.read_text())
    station = 70
    radius = source['fittingEnvelope']['socketAndSettingRadiusMm']
    sockets = [(u, v - station) for row in source['originalClashes']
               for u, v in [row['diagonalPlanMm']]]
    relief = source['fixedWebBottomReliefs']
    positive = next(row for row in relief['rows'] if row['axis'] == 1 and row['stationMm'] == station)
    assert positive['lowerWeldInterruptedMm'] == 2 * radius
    assert math.isclose(sockets[1][0], sockets[2][0])
    assert source['unchangedWebsWithRelocatedBars']['shortestCenteredWebHalfSpanMm'] == 115
    assert len(source['originalWebs']) == 4
    force = 1000 * relief['solidWebLaneForceKN']
    previous = positive['outboardReturnPlanOnly']['polylineInDiagonalPlanMm']
    left, right = previous[0][0], previous[-1][0]
    height = previous[1][1] - station
    bounds = 52
    candidates = [(u, r, h) for u in range(-bounds, -38)
                  for r in range(39, bounds + 1) for h in range(28, 74)]
    groups = []
    for faces in (False, True):
        prior = screen(left, right, height, sockets, radius, station, force, faces)
        admissible = [result for trial in candidates
                      if (result := screen(*trial, sockets, radius, station, force, faces))]
        best = min(admissible, key=lambda result: result['maximumAbsoluteLinearEndStressMPa'])
        balanced = [result for result in admissible
                    if result['maximumAbsoluteLinearEndStressMPa'] <= relief['averageWeldStressScreenMPa']]
        best_balanced = max(balanced, key=lambda result: min(result['reservesMm'].values()), default=None)
        groups.append({'survivingFacesOnOriginalWings': 2 if faces else 1,
                       'inheritedPlanRoute': prior, 'lowestElasticPeakIntegerTrial': best,
                       'passingTrialCount': len(balanced), 'passingTrialWithMostMinimumSpace': best_balanced})
    assert all(group['passingTrialCount'] == 0 for group in groups)
    anchors = [row['diagonalPlanMm'] for row in source['originalClashes']]
    grooves = [centred_groove_screen(force, radius, axis, coordinate, anchors)
               for axis, coordinate in source['originalWebs']]
    assert all(row['elasticPeakAtGroupEndsMPa'] < relief['averageWeldStressScreenMPa'] for row in grooves)
    return {'status': 'Elastic normal transfer and finite one-face weld comparison only',
            'sourceSha256': hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
            'trialInputs': {'cassetteSideMm': 300, 'centrelineBoundsMm': [bounds, 28, 73],
                            'existingAndReturnEffectiveThroatMm': THROAT_MM,
                            'oneSideFilletLegMm': FILLET_LEG_MM,
                            'fullTransferAtOriginalLineKN': force / 1000,
                            'inheritedComparisonMPa': relief['averageWeldStressScreenMPa']},
            'mirrorAtOtherControllingWeb': groups,
            'extendedCentredGrooveComparator': grooves,
            'grooveLimitations': 'Full effective groove and transfer beyond both intersecting webs are assumptions. '
                                'No torch, groove preparation, closure, fatigue or skin participation established.',
            'limitations': 'No weld end setbacks, tool envelope, shell flexibility, shear, fatigue, access qualification or load redistribution.'}


if __name__ == '__main__':
    result = json.dumps(compare(), indent=2) + '\n'
    if '--check' in sys.argv:
        if Path(__file__).with_suffix('.json').read_text() != result:
            raise SystemExit('Heel return receipt differs')
    else:
        sys.stdout.write(result)
