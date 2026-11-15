"""Plan articulation and placement screens for a roof support rewind, in mm and kN."""

from hashlib import sha256
from itertools import combinations, product
import json
from math import asin, ceil, cos, hypot, sin, sqrt
from pathlib import Path
import sys


STUDIES = Path(__file__).resolve().parent
SOURCES = (
    'current-house-ring-space', 'current-house-welded-heel',
    'floor-portal-heel-return', 'floor-portal-hip-diaphragms',
    'floor-portal-receiver-cover', 'reconciled-house-interface',
)


def rotate(point, count):
    x, y = point
    return ((x, y), (-y, x), (-x, -y), (y, -x))[count]


def determinant(rows):
    a, b, c = rows
    return sum(a[i] * (b[(i + 1) % 3] * c[(i + 2) % 3] -
                       b[(i + 2) % 3] * c[(i + 1) % 3]) for i in range(3))


def far_jamb_articulation(far_axis, cap_q, centre):
    arm = (far_axis - centre, cap_q - centre)
    radius = hypot(*arm)
    arms = [rotate(arm, i) for i in range(4)]
    directions = [(-y / radius, x / radius) for x, y in arms]
    # Yaw is scaled by the common radius. Each row constrains displacement
    # only in its tangential direction. Two survivors have at most rank two.
    rows = [[*direction, 1.] for direction in directions]
    minors = [abs(determinant(three)) for three in combinations(rows, 3)]
    radial_check = max(abs(x * t_x + y * t_y) for (x, y), (t_x, t_y) in zip(arms, directions))
    assert min(minors) > 1.99 and radial_check < 1e-10
    # Direct witness for prescribed pure Fx/Fy and pure yaw in the equal-spring
    # rigid control only. Recover the three generalized forces independently.
    reactions = [[row[i] / (4 if i == 2 else 2) for row in rows] for i in range(3)]
    for load_axis, reaction in enumerate(reactions):
        recovered = [sum(f * row[i] for f, row in zip(reaction, rows)) for i in range(3)]
        assert max(abs(value - (i == load_axis)) for i, value in enumerate(recovered)) < 1e-12
    single_out_force = []
    for three in combinations(rows, 3):
        for load_axis in (0, 1):
            load = [float(i == load_axis) for i in range(3)]
            solved = [determinant((*three[:i], load, *three[i + 1:])) / determinant(three)
                      for i in range(3)]
            actual = [sum(f * row[i] for f, row in zip(solved, three)) for i in range(3)]
            assert max(abs(a - b) for a, b in zip(actual, load)) < 1e-12
            single_out_force.extend(map(abs, solved))
    return {
        'guideXYmm': [[centre + x, centre + y] for x, y in arms],
        'guideTangents': directions,
        'radiusMm': radius,
        'normalizedThreeGuideAbsoluteDeterminants': minors,
        'uniformRadialGrowthTangentialResidualMmPerUnitStrain': radial_check,
        'maxTangentialMismatchMmForOneMmPerMUniformXOnlyStrain': max(
            abs(x * t_x) / 1000 for (x, _), (t_x, _) in zip(arms, directions)),
        'minimumNecessaryPeakGuideKNForOneKNResultantFxFy': [
            1 / sum(abs(row[i]) for row in rows) for i in (0, 1)],
        'peakEqualSpringGuideKNForOneKNResultantFxFy': [max(map(abs, row)) for row in reactions[:2]],
        'equalSpringGuideKNPerKNmForPureYaw': 250 / radius,
        'maximumSingleOutGuideKNForOneKNResultantFxOrFy': max(single_out_force),
    }


def cap_placement(jamb, receiver, centre):
    # Compare the old cassette only. The trial new exposed receiver would have
    # different geometry, stiffness and maintenance space.
    q_low, q_high = jamb['portalCoreQ']
    q_centre = (q_low + q_high) / 2
    s_extent = jamb['widthNormalAlong'][1] / 2
    q_extent = (q_high - q_low) / 2
    base_u = jamb['axes'][1]
    setting = sum(receiver['independentSettingsMm'])
    web = receiver['provisionalWebScreenMm']
    bars = list(product(jamb['continuousJambH12X'], jamb['continuousJambH12Q']))
    bar_radius = 6.
    half_long = receiver['cassettePlanLengthMm'] / 2
    half_short = receiver['base140MmArm']['cassetteWidthMm'] / 2

    def angle(s, q):
        dx, dy = centre - base_u - s, centre - q_centre - q
        length = hypot(dx, dy)
        return dx / length, dy / length

    def projections(a, b, length=half_long):
        return length * a + half_short * b, length * b + half_short * a

    def point_gap(s, q, a, b, bar, length=half_long):
        dx, dy = bar[0] - s, bar[1] - q_centre - q
        radial, tangent = a * dx + b * dy, -b * dx + a * dy
        return hypot(max(0., abs(radial) - length), max(0., abs(tangent) - half_short))

    # The radial components are monotone in the forward quadrant, so their
    # separate minima on the host rectangle bound every projected half-width
    # below. Include the entire resulting centre rectangle, even where some
    # centres would fail cover, to give the embedded trial the benefit of doubt.
    angles = [angle(s, q) for s, q in product((-s_extent, s_extent), (-q_extent, q_extent))]
    min_half_s, min_half_q = projections(min(a for a, _ in angles), min(b for _, b in angles))
    s_bound = s_extent - setting - web - min_half_s
    q_bound = q_extent - setting - web - min_half_q
    step = .25
    sample_indices = [range(-ceil(bound / step), ceil(bound / step) + 1) for bound in (s_bound, q_bound)]
    samples = []
    for i, j in product(*sample_indices):
        s, q = i * step, j * step
        a, b = angle(s, q)
        samples.append((min(point_gap(s, q, a, b, bar) for bar in bars), s, q))
    best, best_s, best_q = max(samples)
    nearest_sample = step / sqrt(2)
    nearest_radius = hypot(centre - base_u - s_bound, centre - q_centre - q_bound)
    # A translated rectangle moves by no more than the centre displacement
    # plus a corner's chord under the maximum radial-angle change.
    angle_change = asin(nearest_sample / nearest_radius)
    unsampled = nearest_sample + 2 * hypot(half_long, half_short) * sin(angle_change / 2)
    limit = best + unsampled - bar_radius - setting
    a, b = angle(0, 0)
    central_s, central_q = projections(a, b)
    nominal_cover = min(s_extent - central_s, q_extent - central_q) - setting
    # The pinned guide hardware study used a 45 mm jamb tongue. For a smaller
    # same-family reservation, add the retained 20 mm travel and 4 mm running.
    jamb_half_length = (45 + 20 + 4) / 2
    jamb_s, jamb_q = projections(a, b, jamb_half_length)
    jamb_gap = min(point_gap(0, 0, a, b, bar, jamb_half_length) for bar in bars) - bar_radius - setting
    assert nominal_cover > web
    assert best > bar_radius and limit < 0
    assert jamb_gap > 0
    return {
        'capDepthAndWidthMm': [2 * q_extent, 2 * s_extent],
        'cassettePlanLengthAndWidthMm': [2 * half_long, 2 * half_short],
        'coverScreenMm': web,
        'relativeSettingMm': setting,
        'centredNominalWebAfterSettingMm': nominal_cover,
        'testedCentreBoundsAboutCapCentreMm': [s_bound, q_bound],
        'gridStepMm': step,
        'bestGridStationAndDepthOffsetsMm': [best_s, best_q],
        'bestGridCassetteToH12AxisMm': best,
        'maximumBetweenSampleVariationMm': unsampled,
        'absoluteUpperBoundOfCassetteToH12SurfaceAfterSettingsMm': limit,
        'shorterHistoricalJambTongueEnvelopeControl': {
            'cassettePlanLengthAndWidthMm': [2 * jamb_half_length, 2 * half_short],
            'centredNominalWebAfterSettingMm': min(s_extent - jamb_s, q_extent - jamb_q) - setting,
            'centredH12GapAfterSettingMm': jamb_gap,
        },
    }


def relocated_uplift(jamb, rings, heel, joined_water, centre):
    ring = rings['rings']['outer']
    corner_xy = [row['xy'] for row in heel['ring']['stations'] if len(row['walls']) == 2
                 and all(side.startswith('outer-') for side in row['walls'])]
    old_station = min((row for row in ring['stationsIncludingWind'] if row['xy'] in corner_xy),
                      key=lambda row: row['range'][0])
    near_axis = jamb['axes'][0]
    corner_q = min(corner_xy)[0]
    arm_length_m = (near_axis - corner_q) / 1000
    pull = abs(old_station['range'][0])
    water_station = min((row for row in joined_water['stations'] if row['xy'] in corner_xy),
                        key=lambda row: row['installedRangeKN'][0])
    water_pull = abs(water_station['installedRangeKN'][0])
    assert pull > 0 and near_axis > corner_q
    return {
        'oldCoupledRoofOnlyCornerTensionWitness': old_station,
        'retainedCornerBearingXYmm': corner_xy,
        'outerRingAtNearJambHoldXYmm': [[centre + x, centre + y]
                                      for i in range(4)
                                      for x, y in (rotate((u - centre, corner_q - centre), i)
                                                   for u in (near_axis, 2 * centre - near_axis))],
        'distanceAlongEachAdjacentFaceToNearSupportMm': arm_length_m * 1000,
        'localTransferEqualSplitArmBendingKNm': pull * arm_length_m / 2,
        'localTransferEqualSplitResultantMomentKNm': pull * arm_length_m / sqrt(2),
        'localTransferSingleArmBendingKNm': pull * arm_length_m,
        'loadedRoofWaterComparison': {
            'xyMm': water_station['xy'],
            'oldInstalledTensionKN': water_pull,
            'case': water_station['admittedControllingCases'][0],
            'equalSplitArmBendingKNm': water_pull * arm_length_m / 2,
            'singleArmBendingKNm': water_pull * arm_length_m,
        },
    }


def compare():
    paths = {name: STUDIES / (name + '.json') for name in SOURCES}
    paths['joined_water'] = STUDIES.parents[1] / 'rof/studies/roof_water_receiving_union.json'
    data = {name: json.loads(path.read_bytes()) for name, path in paths.items()}
    heel = data['current-house-welded-heel']
    rings = data['current-house-ring-space']
    weld = data['floor-portal-heel-return']
    clash = data['floor-portal-hip-diaphragms']
    receiver = data['floor-portal-receiver-cover']
    jamb = data['reconciled-house-interface']['jambAndTies']
    centre = 6000.
    cap_q = sum(jamb['portalCoreQ']) / 2
    assert all(row['passingTrialCount'] == 0 for row in weld['mirrorAtOtherControllingWeb'])
    articulation = far_jamb_articulation(jamb['axes'][1], cap_q, centre)
    # Full-face positive or negative case, pinned floor_portal_loads.py wind().
    roof_cap = data['reconciled-house-interface']['roof']['slateEnvelopeAndGravityReceipt']['fieldEaveRidgeAndCapZ'][2]
    width, two_portals = 12.4, 2 * 1.410
    full_face = 2.25 * (width * (roof_cap - 6600) / 1000 + (width - two_portals) * (6600 - 3370) / 2000)
    articulation['historicalFullFaceHorizontalRoofTributary'] = {
        'sourceCommit': receiver['referenceStudyCommit'],
        'file': 'project/str/studies/floor_portal_loads.py',
        'sourceSHA256': 'd36374c650180c4176f5014127a2b907c1d454ebd533b6e572ebe21676e73990',
        'pressureKPa': 2.25,
        'faceWidthAndNetOrdinaryUpperFacadeWidthM': [width, width - two_portals],
        'sameFaceRoofAndUpperFacadeRoofTributaryKN': full_face,
        'minimumGuideForceKNAtThisScale': full_face * articulation['minimumNecessaryPeakGuideKNForOneKNResultantFxFy'][0],
        'equalSpringGuideForceKNAtThisScale': full_face * articulation['peakEqualSpringGuideKNForOneKNResultantFxFy'][0],
        'singleOutGuideForceKNAtThisScale': full_face * articulation['maximumSingleOutGuideKNForOneKNResultantFxOrFy'],
    }
    return {
        'disposition': 'Retire nested heel and collar topology. Rewind support arrangement. No assembled successor.',
        'sourceSHA256': {path.name: sha256(path.read_bytes()).hexdigest() for path in paths.values()},
        'rejectedHeelControls': {
            'socketClashesPerHip': len(clash['originalClashes']),
            'maxCompatibleCentresInRetainedWebPacking': clash['unchangedWebsWithRelocatedBars']['centralMaximumCentresUpperBound'],
            'minimumAdditionalTransverseMomentReserveKNm': min(
                row['additionalTransverseMomentAt100MPaKNm'] for row in weld['extendedCentredGrooveComparator']),
        },
        'farJambArticulation': articulation,
        'inheritedEmbeddedGuidePlacement': cap_placement(jamb, receiver, centre),
        'upliftRelocationTransfers': relocated_uplift(jamb, rings, heel, data['joined_water'], centre),
        'limits': [
            'The plan uses rigid motion and ideal bilateral one-axis guides. Rank evaluates kinematics only.',
            'The cap placement bound concerns the inherited rectangular cassette and four existing H12 force lines, before loops, tools or positive retention.',
            'Uplift uses separate local statics comparators with historical roof and roof-water reactions. It does not give frame capacity or predict the rewound joint demands.',
        ],
    }


def draw_plan(result):
    uplift = result['upliftRelocationTransfers']
    guides = result['farJambArticulation']['guideXYmm']
    bearings = uplift['retainedCornerBearingXYmm']
    arm = uplift['distanceAlongEachAdjacentFaceToNearSupportMm']
    lower, upper = min(bearings)[0], max(bearings)[0]

    def xy(x, y):
        return 70 + x * .044, 610 - y * .044

    x0, y0 = xy(lower, upper)
    x1, y1 = xy(upper, lower)
    hx, hy = xy(lower + arm, lower + arm)
    return '\n'.join([
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 810 695" role="img" aria-labelledby="title">',
        '<title id="title">Outer roof support rewind plan</title>',
        '<rect width="810" height="695" fill="#fff"/>',
        '<g font-family="sans-serif" fill="#182429" stroke-width="1.5">',
        '<text x="42" y="37" font-size="24" font-weight="bold">Outer roof support rewind</text>',
        '<text x="42" y="59" font-size="14">Reference setout in mm · north up</text>',
        f'<rect x="{x0:.2f}" y="{y0:.2f}" width="{x1 - x0:.2f}" height="{y1 - y0:.2f}" fill="none" stroke="#718086"/>',
        '<rect x="242.37" y="254.37" width="183.26" height="183.26" fill="none" stroke="#a5afb1" stroke-dasharray="5 5"/>',
        '<text x="334" y="351" font-size="16" text-anchor="middle">Court</text>',
        f'<path d="M {hx:.2f} {y1:.2f} H {x0:.2f} V {hy:.2f}" fill="none" stroke="#a24725" stroke-width="4"/>',
        f'<path d="M {x0:.2f} {y1 + 19:.2f} v14 M {hx:.2f} {y1 + 19:.2f} v14 M {x0:.2f} {y1 + 26:.2f} H {hx:.2f} '
        f'M {x0 - 19:.2f} {y1:.2f} h-14 M {x0 - 19:.2f} {hy:.2f} h-14 M {x0 - 26:.2f} {y1:.2f} V {hy:.2f}" stroke="#6b4635"/>',
        f'<text x="{(hx + x0) / 2:.2f}" y="{y1 + 46:.2f}" text-anchor="middle" font-size="13">{arm:.0f}</text>',
        f'<text x="{x0 - 41:.2f}" y="{(hy + y1) / 2:.2f}" text-anchor="end" font-size="13">{arm:.0f}</text>',
        '<path d="M 654 138 V 100 l -5 8 m 5 -8 l 5 8" fill="none" stroke="#182429"/>',
        '<text x="654" y="94" font-size="13" text-anchor="middle">N</text>',
        '<circle cx="618" cy="215" r="6" fill="#182429"/>',
        '<text x="634" y="219" font-size="14">L-pier gravity seat</text>',
        '<rect x="613" y="247" width="10" height="10" fill="#a24725"/>',
        '<text x="634" y="256" font-size="14">Near-jamb hold-down</text>',
        '<path d="M 618 280 l 7 7 l -7 7 l -7 -7 z" fill="#176773"/>',
        '<text x="634" y="291" font-size="14">Far-jamb guide axis</text>',
        '<path d="M 612 322 h12" stroke="#a24725" stroke-width="4"/>',
        '<text x="634" y="326" font-size="14">Example uplift transfer</text>',
        *(f'<circle cx="{x:.2f}" cy="{y:.2f}" r="6" fill="#182429"/>' for x, y in (xy(*point) for point in bearings)),
        *(f'<rect x="{x - 5:.2f}" y="{y - 5:.2f}" width="10" height="10" fill="#a24725"/>'
          for x, y in (xy(*point) for point in uplift['outerRingAtNearJambHoldXYmm'])),
        *(f'<path d="M {x:.2f} {y - 7:.2f} l 7 7 l -7 7 l -7 -7 z" fill="#176773"/>' for x, y in (xy(*point) for point in guides)),
        '<text x="42" y="675" font-size="13">Proposed load-path setout for redraw. Connections and framing require the joined comparison.</text>',
        '</g>', '</svg>', '',
    ])


if __name__ == '__main__':
    result = compare()
    receipt = json.dumps(result, indent=2) + '\n'
    if sys.argv[1:] == ['--check']:
        assert (STUDIES / 'floor-portal-support-rewind.json').read_text() == receipt
        assert (STUDIES / 'floor-portal-support-rewind.svg').read_text() == draw_plan(result)
    elif sys.argv[1:] == ['--svg']:
        print(draw_plan(result), end='')
    else:
        assert not sys.argv[1:]
        print(receipt, end='')
