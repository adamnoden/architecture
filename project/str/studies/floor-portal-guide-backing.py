"""Compare unilateral guide backing and the reinforcement actually in its load zone."""
import hashlib
import json
from contextlib import redirect_stdout
from dataclasses import replace
from math import hypot, pi
from pathlib import Path
from runpy import run_path
import sys

STUDIES = Path(__file__).resolve().parent
DETAIL = STUDIES / 'floor-portal-seat-detail.py'
DETAIL_RESULT = DETAIL.with_suffix('.json')
CASSETTE = STUDIES / 'floor-portal-receiver-cover.py'
INSERTION = STUDIES / 'floor-portal-hoop-insertion.py'
PATCH = DETAIL.with_suffix('.patch')
SEAT = run_path(str(DETAIL))
FIT = SEAT['FIT']
GOVERNING_TRAVEL = 2.9736936964546743


def replay_travel(worktree):
    SEAT['checked_source'](worktree)
    import floor_portal_candidate
    from unittest.mock import patch

    base = SEAT['REPLAY']['parameters']('cap300-relief5')
    across = SEAT['GUIDE_ACROSS_CORE'] + SEAT['OUTWARD']
    stations = tuple(SEAT['seat_guide_station'](station) + SEAT['OUTWARD']
                     for station in FIT['GUIDE_STATIONS'])
    centres = tuple((s, across) for s in stations) + tuple((across, s) for s in stations)
    receipt = json.loads(DETAIL_RESULT.read_text())
    config = replace(base, L_arm_width=SEAT['CORE_WIDTH'] + SEAT['OUTWARD'],
                     L_outward_extension=SEAT['OUTWARD'], L_key_centres=centres,
                     L_projected_bearing_gap=SEAT['SEAT_GAP'],
                     L_trial_anchor_positions=tuple(receipt['trialPositionsMm']))
    guide_state = floor_portal_candidate.guide_state
    observations = []

    def observe(house, displacement):
        states = guide_state(house, displacement)
        observations.append({name: state['releasedTravelMM'] for name, state in states.items()
                             if name.startswith('L-cap-key-')})
        return states

    with patch.object(floor_portal_candidate, 'guide_state', observe):
        results = SEAT['friction_screen'](config)
    assert len(observations) == len(results) == len(receipt['friction'])
    for previous, result, travel in zip(receipt['friction'], results, observations):
        assert previous['maximumResultantGuide'] == result['maximumResultantGuide']
        assert abs(previous['simultaneousTangentKN'] - result['simultaneousTangentKN']) < 1e-6
        result['simultaneousGuideTravelMm'] = travel[result['maximumResultantGuide']]
        largest = max(travel, key=travel.get)
        result['maximumLGuideTravelMm'] = travel[largest]
        result['maximumLGuideTravelName'] = largest
    governing = max(results, key=lambda row: row['simultaneousTangentKN'])
    assert abs(governing['simultaneousGuideTravelMm'] - GOVERNING_TRAVEL) < 1e-6
    return results


def clip_rectangle(width, height, a, b, c):
    rectangle = [(-width / 2, -height / 2), (width / 2, -height / 2),
                 (width / 2, height / 2), (-width / 2, height / 2)]
    points = []
    for start, end in FIT['edges'](rectangle):
        f0, f1 = (a + b * x + c * z for x, z in (start, end))
        if f0 >= 0:
            points.append(start)
        if (f0 < 0 < f1) or (f1 < 0 < f0):
            ratio = f0 / (f0 - f1)
            points.append(tuple(x + ratio * (y - x) for x, y in zip(start, end)))
    return points


def integrate(points, pressure):
    # Degree-two triangle quadrature, exact for each pressure first moment.
    area, force, moment_x, moment_z = 0.0, 0.0, 0.0, 0.0
    if len(points) < 3:
        return area, force, moment_x, moment_z
    x0, z0 = points[0]
    for (x1, z1), (x2, z2) in zip(points[1:], points[2:]):
        triangle = ((x1 - x0) * (z2 - z0) - (x2 - x0) * (z1 - z0)) / 2
        area += triangle
        for x, z in ((x0, z0), (x1, z1), (x2, z2)):
            x = x / 2 + (x0 + x1 + x2) / 6
            z = z / 2 + (z0 + z1 + z2) / 6
            load = pressure(x, z) * triangle / 3
            force += load
            moment_x += load * x
            moment_z += load * z
    return area, force, moment_x, moment_z


def bisect(low, high, residual):
    low_value, high_value = residual(low), residual(high)
    assert low_value <= 1e-12 and high_value >= -1e-12
    for _ in range(45):
        value = (low + high) / 2
        if residual(value) < 0:
            low = value
        else:
            high = value
    return (low + high) / 2


def peak_contact(width, height, force, radial_ecc, depth_ecc):
    # Find a compression-only linear pressure field with the target force
    # centroid. Normalise gradients by the two half dimensions.
    def field(x_gradient, z_gradient):
        b, c = x_gradient * 2 / width, z_gradient * 2 / height
        offset = bisect(-10, 10, lambda a: integrate(
            clip_rectangle(width, height, a, b, c), lambda x, z: a + b * x + c * z)[1]
            / (width * height) - 1)
        area, unit_force, mx, mz = integrate(
            clip_rectangle(width, height, offset, b, c), lambda x, z: offset + b * x + c * z)
        return area, unit_force, mx, mz, offset

    def at_depth(x_gradient):
        zg = bisect(0, 4, lambda zg: field(x_gradient, zg)[3] / (width * height) - depth_ecc)
        return zg, field(x_gradient, zg)

    xg = bisect(0, 3, lambda xg: at_depth(xg)[1][2] / (width * height) - radial_ecc)
    zg, (area, unit_force, mx, mz, offset) = at_depth(xg)
    assert abs(mx / unit_force - radial_ecc) < 1e-8
    assert abs(mz / unit_force - depth_ecc) < 1e-8
    return {
        'peakPressureMPa': force * (offset + xg + zg) / unit_force,
        'engagedAreaFraction': area / (width * height),
        'pressureCoefficients': [force * offset / unit_force, force * 2 * xg / (width * unit_force),
                                 force * 2 * zg / (height * unit_force)],
    }


def maximum_depth_centroid(width, height, force, limit, radial_ecc):
    # For fixed force and x moment, the greatest z moment fills the part
    # where z + b*x exceeds a cutoff with pressure equal to the cap.
    # Integrating the dual linear function proves this is an upper bound.
    def at_slope(slope):
        cut = bisect(-1000, 1000, lambda a: integrate(
            clip_rectangle(width, height, a, slope, 1), lambda x, z: limit)[1] - force)
        return integrate(clip_rectangle(width, height, cut, slope, 1), lambda x, z: limit)
    if radial_ecc == 0:
        return at_slope(0)[3] / force
    slope = bisect(0, 6, lambda b: at_slope(b)[2] / force - radial_ecc)
    return at_slope(slope)[3] / force


def maximum_backing_eccentricity(width, height, force, limit, depth_ecc):
    return bisect(0, 12, lambda radial: depth_ecc - maximum_depth_centroid(
        width, height, force, limit, radial))


def cheek_wing_stress(backing_width, tongue_width, depth, cheek, radial, pressure):
    p0, px, pz = pressure
    # Conservative strip at the loaded depth edge. An unsupported wing is
    # opposed by no tongue pressure until the nearest tongue edge.
    results = []
    for side in (-1, 1):
        length = backing_width / 2 - tongue_width / 2 - side * radial
        edge = max(0, p0 + side * px * backing_width / 2 + pz * depth / 2)
        root = max(0, edge - side * px * length)
        moment = length**2 * (2 * edge + root) / 6
        results.append(6 * moment / cheek**2)
    return max(results)


def cage_screen(receipt):
    # The box limits are the inherited cap top and lowest cassette component.
    # Independent vertical setting expands that box. Plan setting is deducted.
    z0, z1 = 6449.0, SEAT['CAP_Z']
    error, pitch = 2 * SEAT['SETTING'], 0.5
    low, high = z0 - error, z1 + error
    profiles = [(f'H20-{i}', 10.0, 1.5 * hypot(*FIT['offset'](old, end)) /
                 (SEAT['BEND_TOP'] - SEAT['BEND_BOTTOM']),
                 lambda z, old=old, end=end: SEAT['bent_bar_at'](old, end, z))
                for i, (old, end) in enumerate(zip(receipt['originalPositionsMm'], receipt['trialPositionsMm']))]
    # Exact trial H12 paths from the closed-hoop study. They are geometry
    # inputs and do not certify a developed H12 connection.
    for axis in (0, 1):
        for station in (350, 600):
            for across in (42, 80):
                def path(z, axis=axis, station=station, across=across):
                    t = min(1.0, max(0.0, (z - 6215.0) / 220.0))
                    point = (station - (10 * t * t * (3 - 2 * t) if station == 600 else 0), across)
                    return point if axis == 0 else point[::-1]
                profiles.append((f'H12-{axis}-{station}-{across}', 6.0,
                                 15 / 220 if station == 600 else 0, path))
    gaps = {}
    local_h12 = []
    for corner, ox, oy, sx, sy in FIT['CORNER_ORIGINS']:
        for axis in (0, 1):
            for station in (220, 475, 680):
                centre = (station, SEAT['GUIDE_ACROSS_CORE'])
                if axis == 1:
                    centre = centre[::-1]
                d = (centre[0] + sx * (ox - 6000), centre[1] + sy * (oy - 6000))
                radial = tuple(v / hypot(*d) for v in d)
                tangent = (-radial[1], radial[0])
                # H12 profile is constant throughout the vertical backing zone.
                for name, radius, slope, path in profiles:
                    kind = name[:3]
                    first = min(low - radius - error - 50, SEAT['BEND_BOTTOM'])
                    last = max(high + radius + error + 50, SEAT['BEND_TOP'])
                    n = round((last - first) / pitch)
                    for i in range(n + 1):
                        z = first + (last - first) * i / n
                        delta = FIT['offset'](path(z), centre)
                        u, v = FIT['dot'](delta, radial), FIT['dot'](delta, tangent)
                        du = max(0, abs(u) - FIT['CASSETTE_LENGTH'] / 2)
                        dv = max(0, abs(v) - FIT['CASSETTE_WIDTH'] / 2)
                        dz = max(0, low - z, z - high)
                        clearance = hypot(du, dv, dz) - radius - error - hypot(slope, 1) * pitch / 2
                        if kind not in gaps or clearance < gaps[kind]['lowerBoundMm']:
                            gaps[kind] = {'lowerBoundMm': clearance, 'bar': name, 'corner': corner,
                                          'axis': axis, 'stationMm': station, 'sampleHeightMm': z}
                        if (corner == 'NE' and axis == 0 and station == 680 and
                                name.startswith('H12-0-') and z == 6485):
                            run = abs(v) - FIT['CASSETTE_WIDTH'] / 2
                            radial_reserve = FIT['CASSETTE_LENGTH'] / 2 + run / 2 - abs(u)
                            local_h12.append({'bar': name, 'radialAndTangentialCoordinateMm': [u, v],
                                              'runFromCassetteFaceMm': run,
                                              'centrelineReserveInsideTwoToOneSpreadMm': radial_reserve})
    highest = max(receipt['roundedH8LinkScreen']['levelsMm'])
    governor_centre = (680.0, SEAT['GUIDE_ACROSS_CORE'])
    governor_delta = tuple(x - 5737.5 for x in governor_centre)
    radial_alignment = abs(governor_delta[0]) / hypot(*governor_delta)
    return {
        'backingCassetteToBentBars': gaps,
        'highestH8ToBackingBottomAfterIndependentSettingsMm': z0 - highest - 4.0 - error,
        'governingGuideSameArmH12AtBackingDepth': local_h12,
        'straightH8LegProjectionOntoGoverningRadialAxis': radial_alignment,
        'oneStraightH8LegProjectedYieldComparatorKN': pi * 4**2 * 500 * radial_alignment / (1.15 * 1000),
    }


def compare():
    receipt = json.loads(DETAIL_RESULT.read_text())
    force_row = max(receipt['friction'], key=lambda row: row['simultaneousTangentKN'])
    force = force_row['simultaneousTangentKN'] * 1000
    backing, depth = FIT['CASSETTE_LENGTH'], 60.0
    cheek = FIT['CARRIER_CHEEK_EACH']
    limit = force_row['concretePressureComparatorMPa']
    depth_ecc = depth * (2 / 3 - 1 / 2)
    independent_movement = receipt['movement']['witnesses']['maximumLReleasedTravelMM']['value']
    # The simultaneous point is reproduced by the optional source-bound replay.
    governing_travel = GOVERNING_TRAVEL
    distances = [0.0, governing_travel, independent_movement, FIT['TRAVEL_EACH'],
                 FIT['TRAVEL_EACH'] + FIT['RUNNING_EACH']]
    rows = []
    for radial in distances:
        contact = peak_contact(backing, depth, force, radial, depth_ecc)
        maximum_z = maximum_depth_centroid(backing, depth, force, limit, radial)
        rows.append({
            'radialEccentricityMm': radial,
            'compressionOnlyContact': contact,
            'maximumDepthEccentricityAt17MPaMm': maximum_z,
            'pressureCappedStaticBalancePossible': maximum_z >= depth_ecc,
            'idealRecenteredDepthPeakMPa': force / (backing * depth) * (1 + 6 * radial / backing),
            'sixMmCheekWingElasticStressMPa': cheek_wing_stress(
                backing, FIT['TONGUE_LENGTH'], depth, cheek, radial, contact['pressureCoefficients']),
        })
    assert rows[0]['compressionOnlyContact']['peakPressureMPa'] > limit
    assert rows[-2]['pressureCappedStaticBalancePossible'] and not rows[-1]['pressureCappedStaticBalancePossible']
    source = cage_screen(receipt)
    assert source['highestH8ToBackingBottomAfterIndependentSettingsMm'] == 2
    assert len(source['governingGuideSameArmH12AtBackingDepth']) == 4
    return {
        'sourceSha256': {p.name: hashlib.sha256(p.read_bytes()).hexdigest()
                         for p in (DETAIL, DETAIL_RESULT, CASSETTE, INSERTION, PATCH)},
        'retainedTangentWitness': force_row,
        'simultaneousGoverningRadialTravelMm': governing_travel,
        'assumptions': {'backingWidthDepthCheekMm': [backing, depth, cheek],
                        'inheritedDepthEccentricityMm': depth_ecc, 'pressureComparatorMPa': limit},
        'momentNeededToRecenterInheritedDepthResultantKNm': force * depth_ecc / 1e6,
        'compressionOnlyComparisons': rows,
        'largestRadialEccentricityForAny17MPaPressureFieldAtInheritedDepthMm': (
            maximum_backing_eccentricity(backing, depth, force, limit, depth_ecc)),
        'noSpreadAtRetained75PercentFaceAreaMPa': force / (FIT['TONGUE_LENGTH'] * depth * 0.75),
        'noConcreteBackContactCanBalanceTangentForce': False,
        'separateTangentAndRadialLoadIntroductionKN': [
            force / 1000, force_row['simultaneousRadialKN']],
        'illustrativeTwoToOneSplittingTiePerNodeKN': force / 4000,
        'illustrativeH12AxialYieldComparatorKN': pi * 6**2 * 500 / (1.15 * 1000),
        'cage': source,
    }


if __name__ == '__main__':
    if len(sys.argv) == 3 and sys.argv[1] == '--replay-travel':
        with redirect_stdout(sys.stderr):
            replay = replay_travel(Path(sys.argv[2]))
        print(json.dumps(replay, indent=2))
        raise SystemExit(0)
    result = json.dumps(compare(), indent=2) + '\n'
    if sys.argv[1:] == ['--check']:
        if Path(__file__).with_suffix('.json').read_text() != result:
            raise SystemExit('Guide backing receipt differs. Regenerate and review source changes.')
    elif len(sys.argv) == 1:
        sys.stdout.write(result)
    else:
        raise SystemExit('Usage: floor-portal-guide-backing.py [--check | --replay-travel WORKTREE]')
