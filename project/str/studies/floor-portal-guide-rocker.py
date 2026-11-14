"""Screen a depth-rocking sliding shoe and its fixed concrete backing."""
from hashlib import sha256
import json
from math import atan, degrees, hypot, pi, sqrt
from pathlib import Path
from runpy import run_path
import sys

STUDIES = Path(__file__).resolve().parent
BACKING = STUDIES / 'floor-portal-guide-backing.py'
BACKING_RECEIPT = BACKING.with_suffix('.json')
SEAT_RECEIPT = STUDIES / 'floor-portal-seat-detail.json'
BACKING_STUDY = run_path(str(BACKING))
FIT = BACKING_STUDY['FIT']
SEAT = BACKING_STUDY['SEAT']


def width_screen(width, thickness):
    webs = []
    for _, ox, oy, sx, sy in FIT['CORNER_ORIGINS']:
        for station in FIT['GUIDE_STATIONS']:
            along = SEAT['seat_guide_station'](station)
            for centre in ((along, SEAT['GUIDE_ACROSS_CORE']), (SEAT['GUIDE_ACROSS_CORE'], along)):
                delta = (centre[0] + sx * (ox - 6000), centre[1] + sy * (oy - 6000))
                radial = tuple(value / hypot(*delta) for value in delta)
                outward = SEAT['OUTWARD']
                local_centre = tuple(value + outward for value in centre)
                web = FIT['web_to_l_boundary'](local_centre, radial, SEAT['CORE_WIDTH'] + outward,
                                              width, thickness, SEAT['CORE_LENGTH'] + outward)
                webs.append(web - 2 * SEAT['SETTING'])
    return min(webs)


def compare():
    previous = json.loads(BACKING_RECEIPT.read_text())
    seat = json.loads(SEAT_RECEIPT.read_text())
    force = 1000 * previous['retainedTangentWitness']['simultaneousTangentKN']
    depth = previous['assumptions']['backingWidthDepthCheekMm'][1]
    cap = previous['assumptions']['pressureComparatorMPa']
    nominal_travel = FIT['TRAVEL_EACH']
    adverse_travel = nominal_travel + FIT['RUNNING_EACH']
    backing_width = FIT['CASSETTE_LENGTH']
    centred_minimum_width = (force + sqrt(force**2 + 24 * adverse_travel * force * depth * cap)) / (
        2 * depth * cap)
    widths = [
        {'widthMm': width, 'thicknessMm': thickness, 'concreteWebAfterSettingsMm': width_screen(width, thickness),
         'centredPeakAtAdverseTravelMPa': force / (width * depth) * (1 + 6 * adverse_travel / width)}
        for width, thickness in ((backing_width, FIT['CASSETTE_WIDTH']), (96, 46), (98, 46), (100, 46),
                                 (98, 48), (98, 50), (98, 54))
    ]
    minimum_extended_coupler_gap = seat['minimumCxl20wToCassettePlanGapAfterSettingsMm'] - (
        98 - backing_width) / 2
    minimum_extended_h12_gap = previous['cage']['backingCassetteToBentBars']['H12']['lowerBoundMm'] - (
        98 - backing_width) / 2
    shoe_width = FIT['TONGUE_LENGTH']
    pad_arm = 17.0
    pad_height = 12.0
    pad_faces = (-pad_arm, pad_arm)
    steel_E = 200000.0
    blade_thickness = FIT['TONGUE_THICKNESS']
    blade_inertia = shoe_width * blade_thickness**3 / 12
    blade_area = shoe_width * blade_thickness
    blade_shear_modulus = steel_E / (2 * 1.3)
    effective_line_length = shoe_width - 5
    line_radius = 15.0
    identical_steel_effective_modulus = steel_E / (2 * (1 - 0.3**2))
    line_half_width = sqrt(4 * force * line_radius / (pi * effective_line_length * identical_steel_effective_modulus))
    line_peak = 2 * force / (pi * effective_line_length * line_half_width)

    def blade_deflection(at_depth):
        deflection = 0.0
        for depth_down in (depth / 2 - pad_arm, depth / 2 + pad_arm):
            first, last = sorted((depth_down, at_depth))
            deflection += force / 2 * first**2 * (3 * last - first) / (6 * steel_E * blade_inertia)
            deflection += force / 2 * first / ((5 / 6) * blade_shear_modulus * blade_area)
        return deflection

    blade_pair_difference = (blade_deflection(depth / 2 + pad_arm) -
                             blade_deflection(depth / 2 - pad_arm))
    movement = []
    for face_step in (0, 0.20, 0.50):
        slope = (blade_pair_difference + face_step) / (2 * pad_arm)
        movement.append({'differentialFaceSettingMm': face_step, 'bladePadDeflectionDifferenceMm': blade_pair_difference,
                         'minimumShoeRotationDegrees': degrees(atan(slope)), 'rimSweepEachSideMm': depth / 2 * slope})

    rows = []
    for width in (94.0, 98.0, 100.0):
        for travel in (previous['simultaneousGoverningRadialTravelMm'], nominal_travel, adverse_travel):
            average = force / (width * depth)
            depth_margin = (cap / average - 1 - 6 * travel / width) * depth / 6
            safe_positive = max(depth_margin, 0.0)
            moment_reserve = force * safe_positive
            rows.append({'widthMm': width, 'travelMm': travel,
                         'idealCentredPeakMPa': average * (1 + 6 * travel / width),
                         'availableDepthEccentricityMm': depth_margin,
                         'maxPivotFrictionMomentNM': moment_reserve / 1000,
                         'equivalentPadForceImbalanceFraction': safe_positive / pad_arm,
                         'maxPivotFrictionCoefficientAt15MmRadius': moment_reserve / (force * line_radius)})
    assert widths[0]['centredPeakAtAdverseTravelMPa'] > cap
    assert widths[2]['centredPeakAtAdverseTravelMPa'] < cap
    assert widths[-1]['concreteWebAfterSettingsMm'] < SEAT['COVER_SCREEN']
    assert max(abs(row['rimSweepEachSideMm']) for row in movement) < 2
    return {
        'sourceSha256': {p.name: sha256(p.read_bytes()).hexdigest() for p in (BACKING, BACKING_RECEIPT, SEAT_RECEIPT)},
        'retainedTangentWitness': previous['retainedTangentWitness'],
        'widthScreenAcrossAllGuides': widths,
        'minimumPerfectlyCentredBackingWidthMmAtAdverseTravel': centred_minimum_width,
        'pressureAndMomentReserve': rows,
        '98MmReceiverConservativeGapBoundsMm': {
            'H12': minimum_extended_h12_gap,
            'coupler': minimum_extended_coupler_gap,
        },
        'depthRocker': {
            'padCentresFromMidDepthMm': list(pad_faces),
            'padFaceWidthAndHeightMm': [shoe_width, pad_height],
            'meanPadPressureMPaWithEqualForce': force / (2 * shoe_width * pad_height),
            'meanPadPressureMPaIfOnePadCarriesAll': force / (shoe_width * pad_height),
            'uncorrectedOnePadMomentNM': force * pad_arm / 1000,
            'bladeMovementAndAdverseFaceMismatch': movement,
            'lineContactTrialRadiusAndEffectiveLengthMm': [line_radius, effective_line_length],
            'steelOnSteelRigidLineContactHalfWidthMm': line_half_width,
            'elasticLineContactPeakMPa': line_peak,
            'nominalPerSideDepthMm': (FIT['CASSETTE_WIDTH'] - FIT['TONGUE_THICKNESS']) / 2,
            'maxVerticalContainmentBelowCapWithinInheritedBoxMm': SEAT['CAP_Z'] - 6449,
        },
        'independentMovementWitnessMm': seat['movement']['witnesses']['maximumLReleasedTravelMM']['value'],
    }


if __name__ == '__main__':
    result = json.dumps(compare(), indent=2) + '\n'
    if sys.argv[1:] == ['--check']:
        if Path(__file__).with_suffix('.json').read_text() != result:
            raise SystemExit('Guide rocker receipt differs. Regenerate and review the source changes.')
    elif not sys.argv[1:]:
        sys.stdout.write(result)
    else:
        raise SystemExit('Usage: floor-portal-guide-rocker.py [--check]')
