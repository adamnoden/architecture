"""Inner collector hydraulic comparison with located corner inflows.

This is a reference calculation, not a qualified channel, outlet or joint.
The raised primary walls are a proposed comparison until the local assembly
and its ordinary renewal are joined. Units: mm, L/s, kPa.
"""
from pathlib import Path
import argparse
import hashlib
import json
import math

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
SOURCES = {}


def read(path):
    p = ROOT/path
    SOURCES[path] = hashlib.sha256(p.read_bytes()).hexdigest()
    return json.loads(p.read_text())


roof = read('project/mat/studies/ring-roof-family.json')['catchment']
rain = read('project/rwt/studies/selected-water-event.json')['duty']['syntheticRainfallMmPerHour']/3600
ridge = roof['outerCourtRidgeSides'][2]
normal_q = (ridge**2-2400**2)/1e6*rain
old_roof_q = roof['revisedCourt']['normalInnerRoofLps']
valley_q = roof['revisedCourt']['valleyLps']
new_goods_q = normal_q-old_roof_q
direct_face_q = (old_roof_q-4*valley_q)/4
assert abs(normal_q-3.25815) < 1e-10
assert abs(new_goods_q-.17655) < 1e-10
assert abs(direct_face_q-.4248) < 1e-10


def depth_and_loss(q, clear_width):
    # The 0.004 hydraulic fall is adverse to the authored 0.005 bed grade.
    width = clear_width/1000
    low, high = 0., 1.
    for _ in range(64):
        d = (low+high)/2
        flow = 1000*width*d*(width*d/(width+2*d))**(2/3)*math.sqrt(.004)/.020
        if flow >= q:
            high = d
        else:
            low = d
    d = (low+high)/2
    speed = q/1000/(width*d) if q else 0.
    return d*1000, 4*speed**2/(2*9.81)*1000


def primary_profile(front, width=350., movement=14., step=1.):
    # Both routes run two faces from the NE crown to the SW head.
    # Put the ENTIRE NE valley and all newly exposed goods/cap rain on one
    # arm at its crown. The other arm receives no share of that dose. This
    # bounds any split without assuming a symmetric valley jet. Each arm
    # still receives its actual intermediate corner valley; the SW valley
    # enters the collecting head and is not sent uphill through the arms.
    face_length = 12000-2*(4725-width/2)
    crown_dose = valley_q+new_goods_q
    crown_bed = 6635.
    bed_fall = (crown_bed-6605.75)/(2*face_length)
    minimum = {'reserveMM': math.inf}
    checks = []
    for face in range(2):
        start, end = face*face_length, (face+1)*face_length
        count = math.ceil((end-start)/step)
        for j in range(count):
            a = start+(end-start)*j/count
            b = start+(end-start)*(j+1)/count
            q = crown_dose+direct_face_q*b/face_length+face*valley_q
            d, loss = depth_and_loss(q, width/2)
            bed_at_a = crown_bed-a*bed_fall
            reserve = front-bed_at_a-d-loss-10-25-movement
            if reserve < minimum['reserveMM']:
                minimum = {'reserveMM': reserve, 'pathIntervalMM': [a, b],
                           'flowAtUpperIntervalEndLps': q, 'bedAtLowerIntervalEndMM': bed_at_a,
                           'normalDepthMM': d, 'K4HeadMM': loss}
        for x in (start, end):
            q = crown_dose+direct_face_q*x/face_length+face*valley_q
            d, loss = depth_and_loss(q, width/2)
            checks.append({'face': face, 'distanceMM': x, 'flowLps': q,
                           'bedMM': crown_bed-x*bed_fall,
                           'reserveMM': front-(crown_bed-x*bed_fall)-d-loss-10-25-movement})
    assert abs((crown_dose+2*direct_face_q+valley_q)
               +(2*direct_face_q+valley_q)+valley_q-normal_q) < 1e-10
    return {'frontMM': front, 'widthMM': width, 'crownBedMM': crown_bed,
            'headBedMM': crown_bed-2*face_length*bed_fall,
            'authoredBedFall': bed_fall,
            'oneArmLengthMM': 2*face_length, 'adverseCrownDoseLps': crown_dose,
            'intermediateCornerLps': valley_q, 'directPerFaceLps': direct_face_q,
            'allAddedGoodsRainAtCrownLps': new_goods_q, 'minimum': minimum,
            'boundaryChecks': checks, 'intervalWidthAtMostMM': step,
            'proof': 'Within each interval the available depth increases with distance. Normal depth and K4 head increase with flow: rectangular hydraulic radius, velocity and discharge all increase with depth. Using the earlier bed and later flow is therefore a conservative continuous-interval bound, not only a sampled-point pass.'}


def graded_spill(clear_from_mm, clear_to_mm, distributed_factor=1.):
    # Each SE-to-NW front-edge path is LINEAR:4800 mm with28.75 mm rise.
    # Integral of the same factor-two critical-head comparison used above.
    slope = .02875/4.8
    coefficient = .75*math.sqrt(9.81)/2**1.5
    def flow(head_mm):
        h = head_mm/1000
        a, b = clear_from_mm/1000, clear_to_mm/1000
        integral = (max(0., h-slope*a)**2.5-max(0., h-slope*b)**2.5)/(2.5*slope)
        return 1000*2*coefficient*distributed_factor*integral
    low, high = 0., 1000.
    for _ in range(80):
        middle = (low+high)/2
        if flow(middle) >= normal_q:
            high = middle
        else:
            low = middle
    head = (low+high)/2
    return {'clearIntervalOnEachPathMM': [clear_from_mm, clear_to_mm],
            'distributedEffectiveFactor': distributed_factor, 'headAboveLowestRimMM': head,
            'reproducedFlowLps': flow(head)}


def transport_bound(width_mm, depth_mm, length_mm):
    # Full dose over the full arm, at its minimum flooded depth throughout.
    # Distributed spill and divided normal flow would reduce this demand.
    width, depth, length = width_mm/1000, depth_mm/1000, length_mm/1000
    area = width*depth
    radius = area/(width+2*depth)
    speed = normal_q/1000/area
    friction = .020**2*(normal_q/1000)**2/(area**2*radius**(4/3))*length*1000
    local = 4*speed**2/(2*9.81)*1000
    return {'flowLps': normal_q, 'clearWidthMM': width_mm,
            'minimumFloodedDepthMM': depth_mm, 'fullArmLengthMM': length_mm,
            'frictionHeadMM': friction, 'K4HeadMM': local, 'totalHeadMM': friction+local,
            'scope': 'Conservative full-dose transport comparison. The24 mm setting/movement stage allowance must bound adverse bed-to-crest relative shifts so this minimum depth remains available.'}


def compare():
    primary_front, primary_rear, primary_head_bed = 6715., 6795., 6605.75
    lower_depth, motion, setting, splash = 125., 14., 10., 25.
    d, loss = depth_and_loss(normal_q, 425/2)
    # Primary lip is level. Conservatively use only one4800 path with half
    # its length unavailable. Lower lip is graded: removing the lowest half
    # of BOTH paths gives the least flow for a given water level, because
    # those lowest crest locations have the greatest local discharge.
    effective_spill_length = 4800*.5*.75
    primary_spill_head = 2000*((normal_q/effective_spill_length)**2/9.81)**(1/3)
    uniform_half = graded_spill(0, 4800, .5)
    lowest_half_blocked = graded_spill(2400, 4800)
    highest_half_blocked = graded_spill(0, 2400)
    assert abs(uniform_half['headAboveLowestRimMM']-20.304054410) < 1e-8
    primary_transport = transport_bound(350/2, primary_front+primary_spill_head-6635, 5800)
    lower_transport = transport_bound(425/2, lower_depth, 5650)
    primary_water = primary_front-primary_head_bed+primary_spill_head+setting+motion+primary_transport['totalHeadMM']
    lower_water = lower_depth+lowest_half_blocked['headAboveLowestRimMM']+setting+motion+lower_transport['totalHeadMM']
    maximum_crest_head = 28.75+2000*((normal_q/(2*4800*.5*.75))**2/9.81)**(1/3)
    result = {
        'status': 'PROPOSED HYDRAULIC COMPARISON; complete local assembly and renewal remain unjoined',
        'flow': {'rainLpsM2': rain, 'normalLps': normal_q, 'valleyLps': valley_q,
                 'newExposedGoodsAndCapLps': new_goods_q, 'directRoofPerFaceLps': direct_face_q,
                 'remainingCourtLps': 2400**2/1e6*rain},
        'geometry': {'primaryWidthMM': 350, 'lowerWidthMM': 425,
                     'primaryQMM': [4375, 4725], 'lowerQMM': [4375, 4800],
                     'primaryFrontMM': primary_front, 'primaryRearMM': primary_rear,
                     'primaryCrownBedMM': 6635, 'primaryHeadBedMM': primary_head_bed,
                     'lowerDepthMM': lower_depth, 'capBottomTopMM': [6820, 6840]},
        'conditions': {'halfWidthUnavailable': True, 'ManningN': .020,
                       'hydraulicFall': .004, 'localK': 4,
                       'movementMM': motion, 'settingMM': setting, 'splashMM': splash,
                       'siteRainfallEstablished': False, 'componentRatingEstablished': False,
                       'normalProfileScope': 'A continuous bound on the declared normal-depth plus K4 comparison. It is not a nonuniform subcritical backwater solution or a qualified inlet/outlet capacity.'},
        'primary': primary_profile(primary_front),
        'earlierFrontComparisons': [primary_profile(6705., 375.), primary_profile(6710., 350.)],
        'lowerOnePathFullDose': {'normalDepthMM': d, 'K4HeadMM': loss,
                                'reserveMM': lower_depth-d-loss-setting-splash-motion},
        'blockedSpill': {'nominalAvailablePathMM': 4800, 'clearFraction': .5,
                         'dischargeComparison': .75, 'effectiveLengthMM': effective_spill_length,
                         'primaryLevelLipHeadMM': primary_spill_head,
                         'lowerPathRiseMM': 28.75, 'lowerCrestProfile': 'Explicit linear rise along EACH4800 mm path; a maximum-height bound alone is insufficient.',
                         'lowerUniformHalfComparison': uniform_half,
                         'lowerLowestHalfBlocked': lowest_half_blocked,
                         'lowerHighestHalfBlockedControl': highest_half_blocked,
                         'primaryTransport': primary_transport, 'lowerTransport': lower_transport,
                         'primaryRearReserveMM': primary_rear-primary_front-primary_spill_head-setting-motion-splash-primary_transport['totalHeadMM'],
                         'primaryMaximumWaterMM': primary_water, 'lowerMaximumWaterMM': lower_water,
                         'nativePrimaryWaterBoundMM': 170., 'nativeLowerWaterBoundMM': 190.,
                         'nativePrimaryWaterReserveMM': 170-primary_water,
                         'nativeLowerWaterReserveMM': 190-lower_water,
                         'former160PrimaryReserveMM': 160-primary_water,
                         'former160LowerReserveMM': 160-lower_water,
                         'unknownCrestShapeControl': {'allClearCrestAtMaximumHeadMM': maximum_crest_head,
                             'storedWaterWithSameTransportMM': lower_depth+maximum_crest_head+setting+motion+lower_transport['totalHeadMM'],
                             'reserveAgainst190MM': 190-(lower_depth+maximum_crest_head+setting+motion+lower_transport['totalHeadMM']),
                             'decision': 'Reject replacing the explicit linear crest with only a maximum-height statement.'},
                         'clearLengthProof': 'For a common water level the local discharge decreases monotonically with crest elevation. Removing the lowest half of the two identical graded paths therefore minimises capacity among all blockages covering the same total length.'},
        'pressureComparison': {'blockedRoofLevelMM': 6800.,
                               'abovePrimaryRearMM': 6800-primary_rear,
                               'scope': 'Static buried-route comparator only; actual outlet, seal, transient and qualification duties remain separate.'},
        'unproved': ['The actual spill edges, corner transitions and both outlet bodies must provide the stated lengths and level continuity.',
                    'Normal head and overflow-entry capacity, physical jets/splash and partial-obstruction behaviour require joined detail and testing.',
                    'The complete collector/assembly movement must fit the14 mm allowance.',
                    'This comparison does not prove first release, temporary rain capture or any receiving resistance.']}
    result['screens'] = {
        'primaryNormalProfile': result['primary']['minimum']['reserveMM'] > 0,
        'lowerFullDose': result['lowerOnePathFullDose']['reserveMM'] > 0,
        'primaryRear': result['blockedSpill']['primaryRearReserveMM'] > 0,
        'nativeWaterBound': min(result['blockedSpill']['nativePrimaryWaterReserveMM'], result['blockedSpill']['nativeLowerWaterReserveMM']) > 0}
    result['sourceHashes'] = {**SOURCES, str(Path(__file__).relative_to(ROOT)): hashlib.sha256(Path(__file__).read_bytes()).hexdigest()}
    return result


def rounded(value):
    if isinstance(value, dict):
        return {k: rounded(v) for k, v in value.items()}
    if isinstance(value, list):
        return [rounded(v) for v in value]
    return round(value, 9) if isinstance(value, float) else value


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    result = compare()
    content = json.dumps(rounded(result), indent=2)+'\n'
    target = Path(__file__).with_suffix('.json')
    if args.check:
        assert target.read_text() == content, 'Rebuild the inner corner-flow comparison'
    else:
        target.write_text(content)
    assert all(result['screens'].values())
    print(json.dumps({'screens': result['screens'], 'minimumPrimaryReserveMM': result['primary']['minimum']['reserveMM'],
                      'lowerReserveMM': result['lowerOnePathFullDose']['reserveMM'],
                      'spill': result['blockedSpill']}, indent=2))
