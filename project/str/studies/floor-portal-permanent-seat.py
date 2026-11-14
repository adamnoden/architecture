"""Compare a permanent aligned tension seat and a separate guide service path."""
from hashlib import sha256
from itertools import combinations
import json
from math import dist, pi
from pathlib import Path
import sys

STUDIES = Path(__file__).resolve().parent
SOURCES = {
    'seat': 'floor-portal-seat-detail.json',
    'cage': 'floor-portal-continuous-cage.json',
    'access': 'floor-portal-ring-access.json',
    'backing': 'floor-portal-guide-backing.json',
    'roof': 'current-house-welded-heel.json',
}


def compare():
    sources = {key: STUDIES / name for key, name in SOURCES.items()}
    data = {key: json.loads(path.read_text()) for key, path in sources.items()}
    seat, cage, roof, access, backing = (data[key] for key in ('seat', 'cage', 'roof', 'access', 'backing'))
    cell = roof['ring']['section']
    soffit, top = roof['ring']['z']
    steel = cell['t']
    ring_room = access['access']['qRoomFaceMm']
    ring_cold = ring_room - cell['B']
    ring_centre = (ring_room + ring_cold) / 2
    core_start = seat['seatOuterInwardCoordinateMm']
    assert core_start - ring_cold == 40
    core_to_corner_station = ring_centre - core_start
    corner_half = access['taperedPlanAndFixedEndSensitivity']['cornerCassetteHalfExtentMm']
    setting = 5.0
    common_datum_error = 5.0
    independent_error = 2 * setting
    fitting = cage['independentTopFittingEnvelope']
    fitting_diameter = fitting['fittingEnvelopeDiameterMm']
    trial_annular_radial_land = 5.0
    socket_diameter = fitting_diameter + 2 * (trial_annular_radial_land + common_datum_error)
    socket_radius = socket_diameter / 2
    socket_and_setting = socket_radius + common_datum_error
    open_web_interval = [ring_cold + steel, ring_room - steel]
    faces = roof['ring']['faces']
    first_arm_length = min(
        segments[index]['end'] - segments[index]['start']
        for key, row in faces.items() if key.startswith('outer-')
        for segments in [row['segments']] for index in (0, -1)
    )
    placements = []
    for index, (x, y) in enumerate(seat['trialPositionsMm']):
        station = max(x, y) - core_to_corner_station
        q = core_start + min(x, y)
        straight = station - socket_and_setting >= corner_half
        remaining = min(q - open_web_interval[0], open_web_interval[1] - q) - socket_and_setting
        locations = {
            'localAnchorIndex': index,
            'coreXYmm': [x, y],
            'inwardQmm': q,
            'stationFromCornerMm': station,
            'straightArm': straight,
        }
        if straight:
            locations.update({
                'remainingToStraightWebAfterSettingsMm': remaining,
                'remainingToCornerCassetteMm': station - socket_and_setting - corner_half,
                'remainingToNextHeelCassetteMm': first_arm_length - corner_half - station - socket_and_setting,
            })
        placements.append(locations)
    straight = [row for row in placements if row['straightArm']]
    adjacent = min(dist(a['coreXYmm'], b['coreXYmm']) for a, b in combinations(placements, 2))
    assert len(straight) == 8
    assert min(row['remainingToStraightWebAfterSettingsMm'] for row in straight) > 0
    assert adjacent > socket_diameter + common_datum_error
    layout_comparisons = []
    for error in (common_datum_error, independent_error):
        diameter = fitting_diameter + 2 * (trial_annular_radial_land + error)
        layout_comparisons.append({
            'relativeSettingMm': error,
            'minimumSocketDiameterForTrialLandMm': diameter,
            'remainingBetweenSocketFootprintsWithSamePairErrorMm': adjacent - diameter - error,
            'fixed54MmSocketRemainingRadialLandMm': (54 - fitting_diameter) / 2 - error,
        })
    assert layout_comparisons[1]['remainingBetweenSocketFootprintsWithSamePairErrorMm'] < 0

    anchor = access['anchorRelocation']['sourceAnchorTensionWitness']
    tension = anchor['tensionN']
    witness = int(anchor['anchor'].rsplit('-', 1)[1])
    assert placements[witness]['inwardQmm'] == access['anchorRelocation']['oldAnchorAndTrialEyeQmm'][0]
    maximum_straight_eccentricity = max(abs(row['inwardQmm'] - ring_centre) for row in straight)
    weld_throat = 4.0
    weld_line_tension = tension / (2 * pi * socket_radius)
    weld_line_moment = tension * common_datum_error / (pi * socket_radius**2)
    torsion_line = access['torsion']['torqueProbeNmm'] / (2 * access['torsion']['sectionAreaAtMedianLineMm2'])
    # Add the full closed-cell shear flow and the peak tensile/moment line forces.
    # This is a screen of line demands only; a locally interrupted seam need not distribute them this way.
    weld_stress = (weld_line_tension + weld_line_moment + torsion_line) / weld_throat
    strip_span = cell['B'] - steel
    strip_inertia = socket_diameter * steel**3 / 12
    strip_centre_moment = tension * strip_span / 4
    strip_stress = strip_centre_moment * (steel / 2) / strip_inertia
    strip_deflection = tension * strip_span**3 / (48 * 200_000 * strip_inertia)
    fitting_top = fitting['seatedFittingBottomZmm'] + fitting['fittingLengthMm']
    approach = [-setting, setting]
    free_height = [soffit - fitting_top + a - b for a in approach for b in approach]
    transfer_stroke = [min(free_height), max(free_height)]
    assert transfer_stroke == [15, 35]
    movement = seat['movement']
    pressure = backing['assumptions']
    guide_depth = pressure['backingWidthDepthCheekMm'][1]
    cassette_depth = 66.0
    assert guide_depth < cassette_depth
    open_j = (2 * (cell['H'] - steel) + cell['B'] - steel) * steel**3 / 3
    closed_j = access['torsion']['intactClosedJmm4']
    clearance_above_hip = roof['node']['hip']['clearAboveFullCassette']

    return {
        'sources': {path.name: sha256(path.read_bytes()).hexdigest() for path in sources.values()},
        'status': 'Pre-site geometry and demand comparison; no installed connection selected',
        'placements': {
            'sameScreenAtFourSymmetricLPiers': True,
            'socketOutsideDiameterMm': socket_diameter,
            'relativeCommonDatumErrorMm': common_datum_error,
            'trialAnnularRadialLandMm': trial_annular_radial_land,
            'layoutComparisons': layout_comparisons,
            'locations': placements,
            'straightPerCorner': len(straight),
            'insideCornerCassettePerCorner': len(placements) - len(straight),
            'remainingBetweenSocketCentresAfterFootprintsAndSettingsMm': adjacent - socket_diameter - common_datum_error,
        },
        'permanentAlignedTension': {
            'sourcePeakWitness': anchor,
            'peakWitnessCellMomentKNm': tension * (placements[witness]['inwardQmm'] - ring_centre) / 1e6,
            'straightLocationWorstEccentricityMm': maximum_straight_eccentricity,
            'sameTensionAtWorstStraightOffsetMomentKNm': tension * maximum_straight_eccentricity / 1e6,
            'nominalAndAdverseCouponToSoffitHeightMm': [soffit - fitting_top, transfer_stroke],
            'historicalProjectedHardwareLimitZmm': seat['projectingHardwareMaximumZmm'],
            'effectivePeripheralThroatTrialMm': weld_throat,
            'anchorTensionAndEccentricityLineDemandsNPerMm': [weld_line_tension, weld_line_moment],
            'separateRingTorsionLineDemandNPerMm': torsion_line,
            'conservativeAdditiveGrossThroatStressMPa': weld_stress,
            'isolatedUnperforatedStripWidthAndSpanMm': [socket_diameter, strip_span],
            'stripGrossBendingMPaAndDisplacementMm': [strip_stress, strip_deflection],
            'steelAndWeldStressComparatorsMPa': [200 / 1.1, 100],
        },
        'erectionAndGuide': {
            'openTroughToClosedTorsionalConstantFraction': open_j / closed_j,
            'retainedNominalBoxDepthMm': top - soffit,
            'bareHipAboveClosedLidMm': clearance_above_hip,
            'guideWorkingFaceAndCassetteDepthMm': [guide_depth, cassette_depth],
            'guideDepthExcessOverFreeCouponToSoffitHeightMm': [guide_depth - max(free_height), guide_depth - min(free_height)],
            'previousMovementCasesAndRetainedHeads': [movement['cases'], movement['headCount']],
        },
    }


if __name__ == '__main__':
    result = json.dumps(compare(), indent=2) + '\n'
    if sys.argv[1:] == ['--check']:
        if Path(__file__).with_suffix('.json').read_text() != result:
            sys.exit('Permanent seat receipt differs')
    elif len(sys.argv) == 1:
        print(result, end='')
    else:
        sys.exit('Usage: floor-portal-permanent-seat.py [--check]')
