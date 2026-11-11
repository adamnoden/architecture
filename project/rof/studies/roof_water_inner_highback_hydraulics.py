"""Unselected high-back inner hydraulic comparison with a full catchment bound.

This does not select the new supports, heads, apron, joints or renewal route.
The older14mm/170-190 comparison remains unchanged. All dimensions are mm;
flows are L/s. Rainfall is the retained synthetic216mm/h comparison, not a site
rainfall determination. Normal-depth and transport screens are not a solved
subcritical backwater profile or a qualified component rating.
"""
from pathlib import Path
import argparse
import hashlib
import importlib.util
import json
import math

D = Path(__file__).resolve().parent
ROOT = D.parents[2]
spec = importlib.util.spec_from_file_location('old_hydraulic_comparison', D/'roof_water_inner_hydraulics.py')
old = importlib.util.module_from_spec(spec)
spec.loader.exec_module(old)
TOTAL_Q = old.ridge**2/1e6*old.rain
assert abs(TOTAL_Q-3.60375) < 1e-12


def profile(front, width, movement, flow, shift=0., step=1.):
    face_length = 12000-2*(4725-width/2)
    crown, head = 6635+shift, 6605.75+shift
    fall = (crown-head)/(2*face_length)
    # All non-weather-roof dose is placed at one crown, including the entire
    # original open-sky square. No favourable head/hinged-leaf shadow is needed.
    extra = flow-old.old_roof_q
    crown_dose = old.valley_q+extra
    minimum = {'reserveMM': math.inf}
    for face in range(2):
        start, end = face*face_length, (face+1)*face_length
        count = math.ceil((end-start)/step)
        for j in range(count):
            a = start+(end-start)*j/count
            b = start+(end-start)*(j+1)/count
            q = crown_dose+old.direct_face_q*b/face_length+face*old.valley_q
            depth, loss = old.depth_and_loss(q, width/2)
            bed = crown-a*fall
            reserve = front-bed-depth-loss-10-25-movement
            if reserve < minimum['reserveMM']:
                minimum = {'reserveMM': reserve, 'pathIntervalMM': [a, b],
                    'flowLps': q, 'bedMM': bed, 'normalDepthMM': depth, 'K4HeadMM': loss}
    # Two intermediate valleys and the final SW valley at the receiving head
    # remain in addition to the NE valley already inside crown_dose.
    assert abs(crown_dose+4*old.direct_face_q+3*old.valley_q-flow) < 1e-12
    return {'minimum': minimum, 'oneArmLengthMM': 2*face_length,
        'crownBedMM': crown, 'headBedMM': head, 'adverseCrownDoseLps': crown_dose,
        'allNonWeatherRoofDoseAtCrownLps': extra,
        'referenceParameterLengthMM': 2*face_length,
        'referenceIntervalAtMostMM': step,
        'longestPhysicalIntervalAtMostMM': step*6500/(2*face_length),
        'method': 'Earlier bed and later flow bound every1mm reference interval continuously; its corresponding longest physical interval is6500/5800mm. No sampled-only pass.'}


def graded_spill(flow, start=2400., end=4800., factor=1.):
    slope = .02875/4.8
    coefficient = .75*math.sqrt(9.81)/2**1.5
    def discharge(head_mm):
        h = head_mm/1000
        a, b = start/1000, end/1000
        integral = (max(0., h-slope*a)**2.5-max(0., h-slope*b)**2.5)/(2.5*slope)
        return 2000*coefficient*factor*integral
    low, high = 0., 1000.
    for _ in range(80):
        middle = (low+high)/2
        if discharge(middle) >= flow:
            high = middle
        else:
            low = middle
    h = (low+high)/2
    return {'headAboveLowestRimMM': h, 'flowLps': discharge(h),
        'clearIntervalEachPathMM': [start, end], 'distributedFactor': factor,
        'linearCrestRiseMM': 28.75, 'pathLengthMM': 4800}


def transport(flow, width_mm, depth_mm, length_mm, movement):
    width, depth, length = width_mm/1000, depth_mm/1000, length_mm/1000
    area = width*depth
    radius = area/(width+2*depth)
    velocity = flow/1000/area
    friction = .020**2*(flow/1000)**2/(area**2*radius**(4/3))*length*1000
    local = 4*velocity**2/(2*9.81)*1000
    return {'flowLps': flow, 'clearWidthMM': width_mm, 'minimumFloodedDepthMM': depth_mm,
        'fullArmLengthMM': length_mm, 'frictionHeadMM': friction, 'K4HeadMM': local,
        'totalHeadMM': friction+local, 'settingPlusMovementMM': 10+movement,
        'condition': 'The declared setting/movement allowance must bound adverse bed-to-crest relative motion so this minimum flooded depth remains available.'}


def compare_case(label, *, flow, movement, primary_front, primary_rear,
                 lower_front, lower_rear, primary_bound, lower_bound, shift=0.):
    p = profile(primary_front, 350., movement, flow, shift)
    lower_depth, lower_loss = old.depth_and_loss(flow, 425/2)
    pspill = 2000*((flow/(4800*.5*.75))**2/9.81)**(1/3)
    lspill = graded_spill(flow)
    # The clear half-width need not lie on the centreline. The common inboard
    # edge atq4375 gives two3250mm faces; use its6500mm path for both circuits.
    pt = transport(flow, 175, primary_front+pspill-(6635+shift), 6500, movement)
    lt = transport(flow, 212.5, lower_front, 6500, movement)
    pwater = primary_front-(6605.75+shift)+pspill+10+movement+pt['totalHeadMM']
    lwater = lower_front+lspill['headAboveLowestRimMM']+10+movement+lt['totalHeadMM']
    maximum_crest_head = 28.75+2000*((flow/(2*4800*.5*.75))**2/9.81)**(1/3)
    maximum_crest_water = lower_front+maximum_crest_head+10+movement+lt['totalHeadMM']
    margins = {'primaryNormalMM': p['minimum']['reserveMM'],
        'lowerNormalFullDoseMM': lower_front-lower_depth-lower_loss-10-25-movement,
        'primaryRearAfterSplashMM': primary_rear-(6605.75+shift)-pwater-25,
        'lowerRearAfterSplashMM': lower_rear-lwater-25,
        'primaryNativeWaterMM': primary_bound-pwater, 'lowerNativeWaterMM': lower_bound-lwater}
    return {'label': label, 'flowLps': flow, 'movementMM': movement,
        'primary': p, 'lowerNormalDepthMM': lower_depth, 'lowerK4HeadMM': lower_loss,
        'primaryLevelSpillHeadMM': pspill, 'lowerGradedSpill': lspill,
        'primaryTransport': pt, 'lowerTransport': lt,
        'maximumStoredPrimaryMM': pwater, 'maximumStoredLowerMM': lwater,
        'lowerUnknownCrestShapeComparison': {'headAboveLowestRimMM': maximum_crest_head,
            'maximumStoredDepthMM': maximum_crest_water,
            'nativeWaterReserveMM': lower_bound-maximum_crest_water,
            'rearAfterSplashReserveMM': lower_rear-maximum_crest_water-25,
            'scope': 'Place the entire4800mm surviving clear length at the maximum+28.75mm crest. This is a separate adverse bound, not an invented fabricated crest.'},
        'nativeWaterBoundsMM': [primary_bound, lower_bound], 'marginsMM': margins,
        'numericScreensPass': all(v > 0 for v in margins.values()),
        'physicalAssemblyAccepted': False}


def compare():
    baseline = old.compare()
    check = profile(6715., 350., 14., old.normal_q)
    assert abs(check['minimum']['reserveMM']-baseline['primary']['minimum']['reserveMM']) < 1e-10
    assert abs(graded_spill(old.normal_q)['headAboveLowestRimMM']-
               baseline['blockedSpill']['lowerLowestHalfBlocked']['headAboveLowestRimMM']) < 1e-10
    shifts = [120., 150., 180., 200.]
    proposed = []
    for shift in shifts:
        row = compare_case('proposed high back, full inward catchment', flow=TOTAL_Q,
            movement=25., primary_front=6735+shift, primary_rear=6830+shift,
            lower_front=140., lower_rear=245., primary_bound=200., lower_bound=220., shift=shift)
        row['geometry'] = {'primaryVerticalShiftMM': shift, 'lowerVerticalShiftMM': 10.,
            'primaryBedsMM': [6605.75+shift, 6635+shift],
            'primaryFrontMM': 6735+shift, 'primaryRearMM': 6830+shift,
            'primaryCapBottomTopMM': [6860+shift, 6880+shift],
            'lowerBedsMM': [6396.25, 6425.], 'lowerFrontDepthMM': 140., 'lowerRearDepthMM': 245.,
            'highestLowerRearMM': 6670.,
            'primaryLowestWetBedToHighestLowerRearMM': 6605.75+shift-6670.,
            'scope': 'Pure hydraulic geometry. Carrier depth, head-arm envelope, relative solid motion and support details must be subtracted independently.'}
        proposed.append(row)
    assert all(r['numericScreensPass'] for r in proposed)
    failures = [
        compare_case('old walls under the new flow and movement domain', flow=TOTAL_Q,
            movement=25., primary_front=6715., primary_rear=6795., lower_front=125.,
            lower_rear=125., primary_bound=170., lower_bound=190.),
        compare_case('raising rear walls alone does not restore normal-profile freeboard', flow=TOTAL_Q,
            movement=25., primary_front=6715., primary_rear=6830., lower_front=125.,
            lower_rear=245., primary_bound=200., lower_bound=220.)]
    assert not any(r['numericScreensPass'] for r in failures)
    sources = ['project/rof/studies/roof_water_inner_hydraulics.py',
        'project/rof/studies/roof_water_inner_hydraulics.json',
        'project/mat/studies/ring-roof-family.json', 'project/rwt/studies/selected-water-event.json',
        str(Path(__file__).relative_to(ROOT))]
    return {'status': 'UNSELECTED PARAMETRIC HIGH-BACK COMPARISON; NO PHYSICAL JOIN OR ORDINARY RENEWAL ACCEPTED',
        'catchment': {'ridgeSquareSideMM': old.ridge, 'entireInwardAreaM2': old.ridge**2/1e6,
            'rainLpsM2': old.rain, 'entireInwardDoseLps': TOTAL_Q,
            'previousCollectorDoseLps': old.normal_q, 'includedFormerOpenSkyDoseLps': TOTAL_Q-old.normal_q,
            'scope': 'Bounds rain on heads, stowed leaves and other goods wholly inside the inward ridge footprint, even with all former sky rain directed to a collector. Does not determine actual remaining sky aperture or admit projections beyond that footprint.'},
        'conditions': {'halfClearWidth': True, 'ManningN': .020, 'hydraulicFall': .004,
            'localK': 4, 'relativeHydraulicMovementMM': 25, 'settingMM': 10, 'splashMM': 25,
            'movementBoundEarned': False, 'siteRainfallEstablished': False, 'componentRatingEstablished': False,
            'fullTransportPathMM': 6500,
            'longestEdgeNominalBedGrades': {'primary': 29.25/6500, 'lower': 28.75/6500},
            'normalProfileParameterisation': 'The same bed/flow endpoint fractions are retained along each face. The1mm centreline interval gives a coarser fractional interval than6500mm and remains a conservative bound on this declared profile; actual corner and obstruction routing must earn that model.'},
        'historicalArithmeticReproduced': True, 'proposed': proposed, 'failedControls': failures,
        'buriedStaticComparison': {'proposedLevelMM': 7100.,
            'aboveHighestProposedPrimaryRearMM': 7100-(6830+max(shifts)),
            'selectedHistoricalLevelMM': 6750.,
            'scope': 'Proposed comparator only; no selected-route identity, seal rating or transient qualification is changed.'},
        'unproved': ['Actual nonuniform backwater, head entry/outlet ratings, jets, splash and obstructions.',
            'The25mm hydraulic relative-motion allowance must be earned by the final member/carrier/apron geometry.',
            'Lower rear containment and fixed secondary kick-over must remain clear of primary arms in every actual motion state.',
            'Hinged-leaf normal/stowed pressure, new head supports, complete stock and operating sequence must be joined.',
            'Native200/220 water is a new force and moment comparison, not inherited from170/190 results.',
            'No first wet opening, temporary catch, whole-body departure or reverse water-control pass follows.'],
        'sourceHashes': {p: hashlib.sha256((ROOT/p).read_bytes()).hexdigest() for p in sources}}


def rounded(value):
    if isinstance(value, dict): return {k: rounded(v) for k, v in value.items()}
    if isinstance(value, (list, tuple)): return [rounded(v) for v in value]
    return round(value, 9) if isinstance(value, float) else value


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    result = rounded(compare())
    target = Path(__file__).with_suffix('.json')
    content = json.dumps(result, indent=2)+'\n'
    if args.check:
        assert target.read_text() == content, 'Rebuild the high-back comparison'
    else:
        target.write_text(content)
    print(json.dumps({'catchment': result['catchment'], 'margins': result['proposed'][0]['marginsMM'],
        'water': [result['proposed'][0]['maximumStoredPrimaryMM'], result['proposed'][0]['maximumStoredLowerMM']]}, indent=2))
