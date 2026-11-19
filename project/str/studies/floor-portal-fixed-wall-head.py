"""Source-bound wall-head strip and roof datum competition, mm and kN."""

import argparse
from hashlib import sha256
import json
from math import hypot
from pathlib import Path


NAMES = ('reconciled-house-interface', 'current-house-welded-heel',
         'current-house-welded-network', 'floor-portal-permanent-seat')


def lateral(span, load, inertia, modulus):
    m = load * span**2 / 8
    d = 5 * load * span**4 / (384 * 200_000 * inertia)
    return {'simpleSpanMm': span, 'eachSameSignReactionKN': load * span / 2000,
            'momentKNm': m / 1e6, 'grossElasticStressMPa': m / modulus,
            'elasticDeflectionMm': d, 'lOver250ComparisonMm': span / 250}


def study(studies):
    raw = {name: (studies / (name + '.json')).read_bytes() for name in NAMES}
    data = {name: json.loads(source) for name, source in raw.items()}
    handoff = data['reconciled-house-interface']
    heel = data['current-house-welded-heel']
    ring = heel['ring']['section']
    network = data['current-house-welded-network']
    roof = handoff['roof']['slateEnvelopeAndGravityReceipt']
    ordinary = next(row for row in network['frames'] if row['id'] == 'ordinary')
    portal_width = handoff['jambAndTies']['ordinaryWallCoreQ']
    roof_soffit, ring_top = heel['ring']['z']
    upper_crown = max(row['head'] for row in handoff['openingEdits'] if row['level'] == 'FIRST')
    arch_depth = 215.  # Exact pinned floor_portal_house.py build_vertical() inner arch.
    extrados = upper_crown + arch_depth
    available = roof_soffit - extrados
    width = portal_width[1] - portal_width[0]
    assert (upper_crown, extrados, roof_soffit, ring_top) == (6300., 6515., 6540., 6660.)
    assert (available, width) == (25., 140.)
    first_far = handoff['jambAndTies']['axes'][1]
    opposite_far = 12000 - first_far
    span = opposite_far - first_far
    q = 2.25 * (6600 - 3370) / 2000  # Pinned full-face ordinary upper tributary.
    gross_i = available * width**3 / 12
    gross_w = 2 * gross_i / width
    separated = lateral(span, q, gross_i, gross_w)
    reused = lateral(span, q, ring['Iminor'], ring['Wminor'])
    piers = [row['u'] for row in heel['ring']['faces']['outer-north']['supports']
             if row['upperLowerType'] == 'existing north pier']
    assert piers == [4377.5, 7622.5]
    piers_span = max(b - a for a, b in zip([first_far, *piers], [*piers, opposite_far]))
    assert piers_span == 3245.
    # Four identical supports per side are not claimed. Price the largest
    # unsupported simple span and retain ideal fixed ends as a sensitivity.
    gross_stress_budget = 200 / 1.1
    frame_points = network['ordinaryStations']
    assert frame_points == [4700, 7300]
    lever = frame_points[0] - first_far
    assert lever == opposite_far - frame_points[1]
    ring_dead_m = 1.35 * ring['lineG'] * (span / 1000)**2 / 8
    same_gravity_load = ordinary['actualUniformULS']['RA']
    wider_downward_probe = ordinary['independentAdverse']['RA'][1]
    old_room_q = 429.5
    old_hip_gap = data['floor-portal-permanent-seat']['erectionAndGuide']['bareHipAboveClosedLidMm']
    settings = [5., 5.]
    new_reserve = 70.
    raise_trial = 60.
    assert old_hip_gap - sum(settings) < new_reserve < old_hip_gap + raise_trial - sum(settings)
    raise_options = []
    for rise in (raise_trial, 100., 120.):
        gross = old_hip_gap + rise
        net = gross - sum(settings)
        raise_options.append({
            'datumRiseMm': rise, 'grossZoneMm': gross, 'netAfterSettingsMm': net,
            'remainingBeyond70MmEnvelopeMm': net - new_reserve,
            'remainingBeyondSeparateOld32MmHeadAnd70MmStrokeMm': net - (32 + 70),
            'slateEaveRidgeCapMm': [z + rise for z in roof['fieldEaveRidgeAndCapZ']],
            'newHeelToRingCentreArmMm': 260 + rise,
            'extraProjectedFullFacePressureKN': 2.25 * 12.4 * rise / 1000,
        })
    thermal_strain = .000720
    arm = 6000 - min(row['xy'][0] for row in heel['ring']['stations'])
    new_north_arm = max(max(piers) - (6000 - arm), (6000 + arm) - min(piers))
    return {
        'sourceSHA256': {name + '.json': sha256(content).hexdigest() for name, content in raw.items()},
        'numericalScope': 'Gross elastic local strip screens and geometric reservation only',
        'existingSection': {'roomFinishQmm': old_room_q, 'ordinaryConcreteQmm': portal_width,
                            'clearArchCrownZmm': upper_crown, 'structuralExtradosZmm': extrados,
                            'roofRingZmm': [roof_soffit, ring_top],
                            'newBandBelowRoofRingGrossHeightMm': available},
        'independentAddedBand': dict(separated, qKNPerM=q, grossWidthAndDepthMm=[width, available],
                                     grossSteelStressComparisonMPa=gross_stress_budget,
                                     minGrossDepthForL250AtSameWidthMm=available * separated['elasticDeflectionMm'] /
                                     separated['lOver250ComparisonMm'],
                                     maxSpanForL250Mm=(384 * 200_000 * gross_i / (5*q*250))**(1/3),
                                     idealRotationallyFixedEnds=dict(endMomentKNm=separated['momentKNm'] * 2/3,
                                         grossElasticStressMPa=separated['grossElasticStressMPa'] * 2/3,
                                         displacementMm=separated['elasticDeflectionMm']/5)),
        'reuseExistingFootprintAsFixedHead': dict(reused, oldRingWidthDepthAndWallMm=[ring['B'], ring['H'], ring['t']],
              northernPierModelAxesMm=piers, northernPierLargestBay=lateral(piers_span, q, ring['Iminor'], ring['Wminor']),
              oldGrossStrongAxisComparisonKNm=ring['MR'], ordinaryVerticalRoofForceStationsMm=frame_points,
              sameUniformFactoredGravityEachSeatKN=same_gravity_load,
              simpleStrongAxisMomentWithTwoUniformSeatsAndBandWeightKNm=same_gravity_load * lever / 1000 + ring_dead_m,
              simpleStrongAxisMomentWithTwoSeparateAdverseSeatValuesAsSensitivityKNm=wider_downward_probe * lever / 1000 + ring_dead_m),
        'raisedRoofComparison': {'oldNominalBareClearanceAboveBandMm': old_hip_gap,
              'heightBudgetForDiscreteSeatMm': new_reserve, 'independentSettingsMm': settings,
              'minDatumRiseForTrialReserveMm': new_reserve + sum(settings) - old_hip_gap, 'datumRiseMm': raise_trial,
              'minimumBareClearanceZmm': [ring_top + old_hip_gap, ring_top + old_hip_gap + raise_trial],
              'netSeatZoneAfterSettingsMm': old_hip_gap + raise_trial - sum(settings),
              'remainingNetGeometricAllowanceBeyondSeatZoneMm': old_hip_gap + raise_trial - sum(settings) - new_reserve,
              'oldSlateEaveRidgeCapZmm': roof['fieldEaveRidgeAndCapZ'],
              'raisedSlateEaveRidgeCapZmm': [z + raise_trial for z in roof['fieldEaveRidgeAndCapZ']],
              'incrementalProjectedFullFacePressureKNAtRetainedReference': 2.25 * 12.4 * raise_trial / 1000,
              'oldAndRaisedRoofHeelCentreToRingCentreMm': [260., 260. + raise_trial],
              'sameHistoricalOrdinaryTieForceAddedLeverMomentKNm': ordinary['independentAdverse']['H'][1] * raise_trial / 1000},
        'raisedRoofOptions': raise_options,
        'segmentMovementComparison': {'freeStrain': thermal_strain,
              'symmetricHypotheticalCentralFixedPointToOuterSeamMm': arm,
              'alignedNorthPierAsymmetricLongestToOuterSeamMm': new_north_arm,
              'centralFixedPointLongitudinalMotionEachArmMm': arm * thermal_strain,
              'relativeVectorAtTwoOrthogonalCentralFixedArmsMm': hypot(arm, arm) * thermal_strain,
              'relativeVectorWithOneAsymmetricNorthernAlongArmMm': hypot(new_north_arm, arm) * thermal_strain},
    }


def draw(result):
    existing = result['existingSection']
    soffit, top = existing['roofRingZmm']
    crown, extrados = existing['clearArchCrownZmm'], existing['structuralExtradosZmm']
    gap = result['raisedRoofComparison']['oldNominalBareClearanceAboveBandMm']
    new = next(row for row in result['raisedRoofOptions'] if row['datumRiseMm'] == 100)

    def fy(z):
        return 515 - (z - 6300) * .84

    def panel(x, raised):
        def fx(q):
            return x + (q - 185) * .95

        def rect(left, right, bottom, end, fill, stroke, dashed=False):
            dash = ' stroke-dasharray="5 4"' if dashed else ''
            return f'<rect x="{fx(left):.2f}" y="{fy(end):.2f}" width="{fx(right)-fx(left):.2f}" height="{fy(bottom)-fy(end):.2f}" fill="{fill}" stroke="{stroke}"{dash}/>'

        def line(y, stroke, dash=''):
            return f'<path d="M {fx(185):.2f} {fy(y):.2f} H {fx(458):.2f}" stroke="{stroke}" {dash}/>'

        def label(q, z, message, size=13):
            return f'<text x="{fx(q):.2f}" y="{fy(z):.2f}" font-size="{size}">{message}</text>'

        old_trace = top + gap
        roof_trace = old_trace + (new['datumRiseMm'] if raised else 0)
        lines = [
            rect(222.5, 402.5, crown, extrados, '#f1e5d5', '#977641'),
            rect(222.5, 442.5, soffit, top, '#d1e2e5', '#176773'),
            line(roof_trace, '#182429'),
            label(186, roof_trace + 9, 'Lowest bare hip steel'),
            label(225, 6380, 'Upper arch at crown'),
            label(225, 6630, '220 × 120 fixed band' if raised else '220 × 120 moving roof ring'),
            label(440, crown - 16, 'Room →'), label(185, crown - 16, 'Cold'),
            line(extrados, '#977641', 'stroke-dasharray="3 4"'),
            label(445, extrados - 3, 'Z6515'), label(445, soffit + 10, 'Z6540'),
            label(445, top - 3, 'Z6660'),
        ]
        if raised:
            lines += [line(old_trace, '#96a4a8', 'stroke-dasharray="4 4"'),
                      rect(255, 406, top, top + 70, 'none', '#a34624', True),
                      label(260, top + 52, '70 mm seat zone'),
                      label(260, top + 10, 'Hardware envelope only'),
                      label(380, roof_trace + 9, f'Z{roof_trace:.2f}')]
        else:
            lines += [rect(262.5, 402.5, extrados, soffit, '#d28467', '#a34624'),
                      label(185, 6495, '25 mm additional-band limit'),
                      label(380, roof_trace + 9, f'Z{roof_trace:.2f}')]
        return lines

    return '\n'.join(['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 850 585" role="img" aria-labelledby="title">',
        '<title id="title">Independent wall head and raised roof section</title>',
        '<rect width="850" height="585" fill="white"/>',
        '<g fill="#182429" font-family="sans-serif" stroke-width="1.4">',
        '<text x="35" y="34" font-size="23" font-weight="bold">Independent wall head and raised roof</text>',
        '<text x="52" y="67" font-size="17" font-weight="bold">Add a band below the existing roof</text>',
        '<text x="469" y="67" font-size="17" font-weight="bold">Keep the band zone and raise roof 100 mm</text>',
        *panel(51, False), *panel(469, True),
        '<text x="36" y="570" font-size="13">Dimensions in mm. Crown station of the upper portal. Geometry comparison only.</text>',
        '</g>', '</svg>', ''])


if __name__ == '__main__':
    p = argparse.ArgumentParser()
    p.add_argument('studies', type=Path)
    p.add_argument('--svg', action='store_true')
    args = p.parse_args()
    result = study(args.studies)
    print(draw(result), end='') if args.svg else print(json.dumps(result, indent=2))
