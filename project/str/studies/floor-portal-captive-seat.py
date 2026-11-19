"""Static and access comparisons for a station-axis captive seat pin."""
import hashlib
import json
from math import hypot, pi, sqrt
from pathlib import Path
import re
import sys

STUDIES = Path(__file__).resolve().parent
SEAT = STUDIES / 'floor-portal-seat-detail.json'
ACCESS = STUDIES / 'floor-portal-ring-access.json'
RING = STUDIES / 'current-house-welded-network.json'
COUPLED = STUDIES / 'floor-portal-seat-detail.patch'


def pin_demand(force, diameter, eye, gap, ear):
    # Symmetric pin with uniform bearing over the actual eye and ear widths.
    # This is the simply supported elastic screen, without contact redistribution.
    moment = force * (eye + 4 * gap + 2 * ear) / 8
    area, modulus = pi * diameter**2 / 4, pi * diameter**3 / 32
    bending, shear = moment / modulus, force / (2 * area)
    return {
        'midspanMomentNmm': moment,
        'elasticBendingStressMPa': bending,
        'meanShearPerPlaneMPa': shear,
        'elasticEquivalentStressScreenMPa': hypot(bending, sqrt(3) * shear),
        'eyeAverageBearingMPa': force / (eye * diameter),
        'eachEarAverageBearingMPa': force / (2 * ear * diameter),
    }


def arm_demand(force, offset, width, depth, bar_compliance):
    inertia = width * depth**3 / 12
    compliance = offset**3 / (3 * 200000 * inertia)
    return {
        'widthAndDepthMm': [width, depth],
        'grossElasticBendingStressMPa': force * offset * depth / (2 * inertia),
        'cantileverDisplacementMm': force * compliance,
        'barAndArmOnlyAxialStiffnessKNPerMm': 1 / (1000 * (bar_compliance + compliance)),
        'stiffnessFractionOfBarOnly': bar_compliance / (bar_compliance + compliance),
    }


def compare():
    seat, access, ring = (json.loads(p.read_text()) for p in (SEAT, ACCESS, RING))
    ring = ring['sections']['collector']
    source = access['anchorRelocation']
    anchor_q = source['oldAnchorAndTrialEyeQmm'][0]
    force = source['sourceAnchorTensionWitness']['tensionN']
    web_q = access['access']['qRoomFaceMm']
    air_q = access['access']['airReceiverCrossingQmm']
    soffit = seat['steelSoffitZmm']
    fitting_z = soffit - 25.0
    pin_q, pin_z, pad_z = web_q + 18.0, soffit + 25.0, soffit + 85.0
    eye, gap, ear, diameter = 10.0, 2.0, 8.0, 16.0
    housing_radius, pad_height = 14.0, 20.0
    offset, lever = pin_q - anchor_q, pad_z - pin_z
    moment = force * offset
    pad_force = moment / lever
    pin_force = hypot(force, pad_force)
    pin = pin_demand(pin_force, diameter, eye, gap, ear)
    pin['samePinUnderVerticalOnlyStressScreenMPa'] = pin_demand(
        force, diameter, eye, gap, ear)['elasticEquivalentStressScreenMPa']
    assert abs(pad_force * lever - moment) < 1e-7
    assert pin_force > 2 * force

    # The pad must be closed in the uplift direction. A positive gap lets the
    # bracket rotate about the station-axis pin before the couple engages.
    lengths = re.findall(r'^\s+L_cap_anchor_length:float=([\d.]+)$', COUPLED.read_text(), re.M)
    if len(lengths) != 1:
        raise ValueError('Expected one retained L-cap anchor length in the coupled patch')
    bar_length = float(lengths[0])
    bar_compliance = bar_length / (200000 * pi * 20**2 / 4)
    fit = {}
    for lost_motion in (0.0, 0.5, 1.0, 5.0):
        fit[str(lost_motion)] = offset * lost_motion / lever
    bar_extension = force * bar_compliance
    force_width = 42.0
    pocket = soffit - fitting_z
    setting = 5.0
    usable_depth = pocket - 2 * setting
    material_screen = 355.0
    arm = [arm_demand(force, offset, width, depth, bar_compliance)
           for width, depth in ((force_width, usable_depth), (force_width, pocket),
                                (55.0, pocket), (force_width, 35.0))]
    minimum_width = 6 * moment / (material_screen * usable_depth**2)
    assert arm[0]['grossElasticBendingStressMPa'] > material_screen
    assert arm[1]['grossElasticBendingStressMPa'] < material_screen

    # Pin can be drawn along the ring rather than across the narrow air return.
    # Two 3 mm retained ends and a 6 mm pull-tool allowance make a 42 mm runway.
    fork = eye + 2 * (ear + gap)
    body_length = fork + 6.0
    runway = body_length + 6.0
    trial_index = int(source['sourceAnchorTensionWitness']['anchor'].rsplit('-', 1)[1])
    along = max(seat['trialPositionsMm'][trial_index])
    same_arm = [max(p) for i, p in enumerate(seat['trialPositionsMm'])
                if i != trial_index and p[0] > 700]
    nearest_station = min(same_arm, key=lambda position: abs(along - position))
    nearest_pitch = abs(along - nearest_station)
    between_forks = nearest_pitch - fork
    assert nearest_station < along
    assert runway > between_forks
    station_service_length = fork + runway + 2 * setting
    minimum_clear_q = air_q - (pin_q + housing_radius) - 2 * setting
    pad_top_gap = soffit + ring['H'] - ring['t'] - (pad_z + pad_height / 2)
    assert minimum_clear_q > 0
    assert pad_top_gap == setting

    # Local web demand decomposition for a backed 40 mm long footprint.
    # Reactions go to the diaphragm and both skins. These quantities do not
    # represent a weld, shell or through-thickness resistance.
    backing_length = 40.0
    pad_area = backing_length * pad_height
    side_web_mid_q = web_q - ring['t'] / 2
    cell_centre_q = web_q - ring['B'] / 2
    external_offset = pin_q - side_web_mid_q
    skin_mid_height = ring['H'] - ring['t']
    # Downward vertical force at increasing q is positive in this decomposition.
    # The balancing moment from the pin/pad couple therefore has negative sign.
    pin_vertical_at_cell = force * (pin_q - cell_centre_q)
    net_at_cell = force * (anchor_q - cell_centre_q)
    assert abs(pin_vertical_at_cell - moment - net_at_cell) < 1e-7
    full_ring_torque = access['torsion']['torqueProbeNmm']
    far_end = 1000.0
    required_far_station = along + fork / 2 + runway + 2 * setting
    return {
        'sourceSha256': {p.name: hashlib.sha256(p.read_bytes()).hexdigest()
                         for p in (SEAT, ACCESS, RING, COUPLED)},
        'signedAnchorWitness': source['sourceAnchorTensionWitness'],
        'geometry': {
            'anchorPinPadAndWebQmm': [anchor_q, pin_q, web_q],
            'pinPadAndSoffitZmm': [pin_z, pad_z, soffit],
            'offsetAndLeverMm': [offset, lever],
            'pinDiameterAndForkEarEyeGapMm': [diameter, ear, eye, gap],
        },
        'equilibrium': {
            'offsetMomentKNm': moment / 1e6,
            'padCompressionAndHorizontalPinKN': pad_force / 1000,
            'pinResultantKN': pin_force / 1000,
            'netTransverseForceN': 0.0,
            'pin': pin,
            'shorter40MmLeverPinResultantKN': hypot(force, moment / 40) / 1000,
        },
        'slipAndArm': {
            'upliftLostMotionPerPadGapMm': offset / lever,
            'padGapToFirstOrderAnchorLostMotionMm': fit,
            'H20ModelEffectiveLengthMm': bar_length,
            'barOnlyElasticExtensionAtSignedWitnessMm': bar_extension,
            'maxPadGapToEqualThatExtensionMm': bar_extension * lever / offset,
            'nominalAndAfterSettingArmDepthMm': [pocket, usable_depth],
            'grossYieldOnlyMinimumWidthAtAfterSettingDepthMm': minimum_width,
            'armComparisons': arm,
        },
        'webIntroduction': {
            'trialPadWidthHeightAndAreaMm': [backing_length, pad_height, pad_area],
            'averagePadPressureMPa': pad_force / pad_area,
            'pinLineToRoomWebMedianMm': external_offset,
            'localPinVerticalMomentAtRoomWebMedianKNm': force * external_offset / 1e6,
            'equivalentSkinCoupleForLocalPinEccentricityKN': force * external_offset / (1000 * skin_mid_height),
            'ringCellCentreQmm': cell_centre_q,
            'signedPinVerticalAndPadCoupleMomentsAtCellCentreKNm': [pin_vertical_at_cell / 1e6, -moment / 1e6],
            'signedNetMomentAtCellCentreKNm': net_at_cell / 1e6,
            'signedNetMomentAtRoomWebMedianKNm': force * (anchor_q - side_web_mid_q) / 1e6,
            'separate10KNmRingShearFlowNPerMm': full_ring_torque / (
                2 * access['torsion']['sectionAreaAtMedianLineMm2']),
        },
        'stationAxisService': {
            'housingQAndZExtentMm': [[pin_q - housing_radius, pin_q + housing_radius],
                                     [pin_z - housing_radius, pin_z + housing_radius]],
            'radialHousingReserveToAirReturnAfterSettingsMm': minimum_clear_q,
            'nominalPadTopGapToUpperSkinMm': pad_top_gap,
            'forkPinAndPullRunwayMm': [fork, body_length, runway],
            'minimumStraightServiceLengthWithSettingsMm': station_service_length,
            'governingStationAndNearestSourceAnchorMm': [along, nearest_station],
            'bareGapIfBothNeighbourForksUseSameLineMm': between_forks,
            'withdrawalOverlapIfDirectedTowardNeighbourMm': runway - between_forks,
            'oppositeDirectionRequiredClearStationRangeMm': [along + fork / 2, required_far_station],
            'oppositeDirectionSpillPastCoreEndMm': max(0.0, required_far_station - far_end),
        },
    }


if __name__ == '__main__':
    result = json.dumps(compare(), indent=2) + '\n'
    if sys.argv[1:] == ['--check']:
        if Path(__file__).with_suffix('.json').read_text() != result:
            raise SystemExit('Captive seat receipt differs. Regenerate and review the source changes.')
    elif len(sys.argv) == 1:
        sys.stdout.write(result)
    else:
        raise SystemExit('Usage: floor-portal-captive-seat.py [--check]')
