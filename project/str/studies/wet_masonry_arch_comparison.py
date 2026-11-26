"""Local arched-wall alternative; existing circular three-hinge mechanics.

Actual frozen native loads do not become a coupled replacement response.
The masonry-frame ring witness is reused; full-width ring section recovery uses
the same crown-hinge statics as open-loggia-support.north_arch_controls.
"""
import argparse
import copy
import hashlib
import html
import json
import math
from pathlib import Path

from masonry_frame_a import _ring_witness
from foundation_solid_weight import subtract_box

D = Path(__file__).resolve().parent
ROOT = D.parents[2]
CHOICES = D / 'wet-masonry-arch-comparison-inputs.json'
PROOF = D / 'wet-masonry-arch-comparison.json'
EVIDENCE = D / 'wet-masonry-arch-native-input.json'
METHODS = ['project/str/studies/wet_masonry_arch_comparison.py',
           'project/str/studies/masonry_frame_a.py',
           'project/str/studies/foundation_solid_weight.py',
           'project/str/studies/open-loggia-support.py']


def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(',', ':'), allow_nan=False).encode()).hexdigest()


def choices(value):
    expected = {'schema', 'id', 'finishedClearSpanMm', 'lowerCoreEastOffsetMm',
                'masonryUnitWeightKNPerM3', 'integrationIntervals', 'sectionSamples', 'tieCentreZMm', 'tieBearingFacesYMm', 'scope'}
    if not isinstance(value, dict) or set(value) != expected or value['schema'] != 'str-wet-masonry-arch-choices/1' or value['id'] != 'STR/WET/masonry-arch-alternative' or value['scope'] != 'unselected-frozen-native-load-local-comparison':
        raise ValueError('Explicit unselected arch choices required')
    for key in expected - {'schema', 'id', 'scope', 'tieBearingFacesYMm'}:
        if type(value[key]) not in (int, float) or not math.isfinite(value[key]):
            raise ValueError('Finite actual choices required')
    if not 1900 <= value['finishedClearSpanMm'] <= 2200 or not 0 <= value['lowerCoreEastOffsetMm'] <= 20 or not 18 <= value['masonryUnitWeightKNPerM3'] <= 24:
        raise ValueError('Outside the declared local architectural comparison')
    if any(type(value[k]) is not int or not 100 <= value[k] <= 10000 for k in ('integrationIntervals', 'sectionSamples')) or not 2200 <= value['tieCentreZMm'] <= 2700:
        raise ValueError('Explicit bounded integration and tie height required')
    faces = value['tieBearingFacesYMm']
    if not isinstance(faces, list) or len(faces) != 2 or any(type(v) not in (int, float) or not math.isfinite(v) for v in faces) or not faces[0] < faces[1]:
        raise ValueError('Two actual ordered tie bearing faces required')
    return copy.deepcopy(value)


def intersect(a, b):
    r = [max(a[0], b[0]), max(a[1], b[1]), min(a[2], b[2]), min(a[3], b[3])]
    return r if r[2] > r[0] and r[3] > r[1] else None


def geometry(c, h, grid):
    upper = next(w for w in h['upperWalls'] if w['id'] == 'rear-wet-east')
    support = h['structuralChanges']['newWetWallBeam']
    controls = h['internalArchControls']
    if upper['structuralCore'] != [2832.5, 2972.5] or controls['upperRCUnderside'] != 3170 or controls['actualRadialFinish'] != 27:
        raise ValueError('Changed actual wall/arch/stair source requires re-coordination')
    x = upper['a'][0] + c['lowerCoreEastOffsetMm']
    lo = support['southReceiverCore'][1]
    hi = support['northReceiverCore'][1] + support['northReceiverCore'][3]
    centre = (support['southReceiverCore'][1] + support['southReceiverCore'][3]/2 + support['northReceiverCore'][1] + support['northReceiverCore'][3]/2)/2
    span = c['finishedClearSpanMm'] + 2*controls['actualRadialFinish']
    rise = controls['rise']; ri = span**2/(8*rise) + rise/2
    angle = math.asin(span/2/ri); cz = controls['head']-ri
    ro = ri+controls['radialRing']; outer_at_spring = math.sqrt(ro**2-(ri-rise)**2)
    rect = [x-70, lo, x+70, hi]
    receivers = []
    for name, row in grid['girders'].items():
        axis = row['axis']; a, b = row['extent']; d = row['datum']; w = row['width']/2
        receivers.append({'id': 'GRID/'+name, 'rectangleXYMm': [d-w, a, d+w, b] if axis == 'y' else [a, d-w, b, d+w]})
    pieces = [[rect[0], rect[1], 0, rect[2], rect[3], 1]]
    for receiver in receivers:
        r = receiver['rectangleXYMm']
        pieces = [p for box in pieces for p in subtract_box(box, [r[0], r[1], 0, r[2], r[3], 1])]
    sofa = h['groundFurniture']['family-sofa1900x750']
    finish = [rect[0]-27, lo, rect[2]+27, hi]
    clear = [centre-c['finishedClearSpanMm']/2, centre+c['finishedClearSpanMm']/2]
    sofa_overlap = intersect(finish, [sofa[0], sofa[1], sofa[0]+sofa[2], sofa[1]+sofa[3]])
    segment_area = ri**2*(angle-math.sin(angle)*math.cos(angle))
    wall_volume = ((hi-lo)*(3170+180)-span*controls['spring']-segment_area)*140/1e9
    physical = {'seatAngleRad': angle, 'sourceInnerRadiusMm': ri, 'sourceOuterRadiusMm': ro,
                'sourceCurveCentreZMm': cz, 'normalWidthMm': 140.}
    return {'id': c['id'], 'lowerCoreRectangleXYMm': rect, 'finishedWallRectangleXYMm': finish,
            'sourceUpperWallAxisXMm': upper['a'][0], 'lowerWallAxisXMm': x,
            'sourceGravityEccentricityXMm': upper['a'][0]-x,
            'upperLowerCoreOverlapMm': max(0, min(upper['structuralCore'][1], rect[2])-max(upper['structuralCore'][0], rect[0])),
            'finishedStairPlaneXMm': h['protectedRoute']['geometry']['groundStairEastWall']['finished'][0],
            'lowerWestFinishXMm': finish[0],
            'stairPlaneIntrusionMm': max(0, h['protectedRoute']['geometry']['groundStairEastWall']['finished'][0]-finish[0]),
            'finishedClearOpeningYMm': clear, 'rawOpeningYMm': [centre-span/2, centre+span/2],
            'rawSpanMm': span, 'centreYMm': centre, 'springZMm': controls['spring'], 'headZMm': controls['head'],
            'radialRingMm': controls['radialRing'], 'ringCrownZMm': controls['ringCrown'],
            'ringToSlabReserveMm': 3170-controls['ringCrown'],
            'outerRingProjectionAtSpringYMm': [centre-outer_at_spring, centre+outer_at_spring],
            'outerRingInsideActualAbutmentTerritory': centre-outer_at_spring >= lo and centre+outer_at_spring <= hi,
            'solidWallSofaOverlapXYMm': sofa_overlap,
            'sofaWithinClearOpening': clear[0] <= sofa[1] and sofa[1]+sofa[3] <= clear[1],
            'sofaSouthNorthPassageMm': [sofa[1]-clear[0], clear[1]-sofa[1]-sofa[3]],
            'body600PassageReserveMm': [sofa[1]-clear[0]-600, clear[1]-sofa[1]-sofa[3]-600],
            'radiatorPullBodyOpeningReserveMm': min(9450-300-clear[0], clear[1]-(9450+300)),
            'groundReceiverUnionUncoveredBoxes': pieces, 'groundReceiverCoverageGeometric': not pieces,
            'actualGroundReceiverIdentities': [r['id'] for r in receivers if intersect(rect, r['rectangleXYMm'])],
            'wallMinusOpeningGrossVolumeM3': wall_volume,
            'wallQuantityScope': 'One140mm rectangular core from source gridtop−180 to slabsoffit3170, less actual raw circular opening aboveFFL0. Overlapping retained walls, mortar constituents, finishes and local tie hardware are not netted.',
            'archPhysicalGeometry': physical, 'appearanceAccepted': False, 'wholeRoomOperationAccepted': False}


def crop_native(n, full_sha):
    wet = n['seatedWetSupport']; rows = n['nativeVertical']['native']['memberCuts']
    return {'schema': 'str-wet-arch-frozen-native-input/1', 'fullResponseSHA256': full_sha,
            'nativeCaseId': n['nativeVertical']['native']['caseId'], 'sourceSHA256': n['sourceSHA256'],
            'request': n['request'], 'beamSettings': wet['settings'], 'beamPhysicalGKN': wet['beamPhysicalGKN'],
            'beamEndCuts': [r for r in rows if r['memberId'].startswith('WET-SUPPORT/beam/')],
            'postPadWeightsKN': [p['padPhysicalGKN'] for p in wet['posts']],
            'beamPostBulkGKN': wet['beamPhysicalGKN']+sum(p['physicalGKN'] for p in wet['posts']),
            'upperFreeBodyBoxes': n['upperMasonry']['inventory']['freeTopBodyBoxes'],
            'upperDensityKNPerM3': n['upperMasonry']['inventory']['densityKNPerM3'],
            'originalCompleteNativeResponseRetainedElsewhere': True,
            'croppedInputReconstructsCompleteNativeResponse': False}


def upper_cards(native):
    """Same actual upper clear-body material over the actual beam reservation."""
    g = native['beamSettings']; x = g['beamAxisXMm']; half = g['beamWidthMm']/2
    rect = [x-half, g['beamSouthEndYMm'], x+half, g['beamNorthEndYMm']]
    factor = native['request']['bearingCase']['masonryCase']['verticalCase']['monolithicCase']['houseCase']['boundary']['physicalGFactor']
    result = []
    for i, body in enumerate(native['upperFreeBodyBoxes']):
        b = body['boxXYZMm']; overlap = intersect(rect, [b[0], b[1], b[3], b[4]])
        if overlap:
            a, lo, z, hi = overlap; q = (z-a)*(b[5]-b[2])*native['upperDensityKNPerM3']/1e9
            result.append({'id': body['ownerId']+'/actual-box/'+str(i), 'intervalYMm': [lo, hi],
                           'originXMm': (a+z)/2, 'characteristicDownKNPerMm': q,
                           'actualFactor': factor, 'actualFactoredDownKN': q*(hi-lo)*factor,
                           'sourceBoxXYZMm': b})
    return result


def arch_equilibrium(g, points, samples):
    """Existing circular three-hinge crown balance; sampled no-tension diagnostic.

    Coordinates m, forces kN. Positive point load is downward. H is inward.
    A full-width215mm composite section is explicitly only a comparison.
    """
    p = g['archPhysicalGeometry']; ri = p['sourceInnerRadiusMm']/1000
    rm = ri+g['radialRingMm']/2000; angle = p['seatAngleRad']; a = rm*math.sin(angle)
    cz = p['sourceCurveCentreZMm']/1000; zs = cz+rm*math.cos(angle); rise = cz+rm-zs
    if any(not -a <= x <= a or not math.isfinite(f) for x, f in points):
        raise ValueError('Explicit actual loads must lie between physical mean-ring seats')
    total = math.fsum(f for x, f in points); right = math.fsum(f*(x+a)/(2*a) for x, f in points); left = total-right
    horizontal = (left*a-math.fsum(f*(-x) for x, f in points if x<0))/rise
    rows = []
    for i in range(1, samples):
        x = -a+2*a*i/samples; y = cz+math.sqrt(rm**2-x*x)-zs
        theta = math.atan(-x/math.sqrt(rm**2-x*x)); shear = left-math.fsum(f for xp, f in points if xp <= x)
        normal = horizontal*math.cos(theta)+shear*math.sin(theta)
        moment = left*(x+a)-math.fsum(f*(x-xp) for xp, f in points if xp<x)-horizontal*y
        ecc = moment/normal if normal>0 else None
        depth = g['radialRingMm']/1000; width = .140
        contact = None if ecc is None else min(depth, 3*(depth/2-abs(ecc)))
        pressure = (None if contact is None or contact<=0 else normal/(width*depth)*(1+6*abs(ecc)/depth)/1000 if abs(ecc)<=depth/6 else 2*normal/(width*contact)/1000)
        rows.append({'localYM': x, 'compressionKN': normal, 'momentKNm': moment,
                     'eccentricityMm': None if ecc is None else 1000*ecc, 'requiredCompressionMPa': pressure})
    return {'totalDownKN': total, 'southVerticalKN': left, 'northVerticalKN': right,
            'horizontalThrustKN': horizontal, 'meanRingSeatYMm': [g['centreYMm']-a*1000, g['centreYMm']+a*1000],
            'meanRingSeatZMm': zs*1000, 'forceResidualKN': left+right-total,
            'firstMomentResidualKNm': right*2*a-math.fsum(f*(x+a) for x, f in points),
            'sampleCount': len(rows), 'sampledCompressionEverywhere': all(r['compressionKN']>0 for r in rows),
            'sampledThrustLineContained': all(r['eccentricityMm'] is not None and abs(r['eccentricityMm'])<=g['radialRingMm']/2 for r in rows),
            'maximumAbsoluteEccentricityMm': max((abs(r['eccentricityMm']) for r in rows if r['eccentricityMm'] is not None), default=None),
            'maximumRequiredCompressionMPa': max((r['requiredCompressionMPa'] for r in rows if r['requiredCompressionMPa'] is not None), default=None),
            'samples': rows, 'composite215mmRingQualified': False, 'masonryResistanceAccepted': False}


def assess(c, h, grid, native):
    c = choices(c); g = geometry(c, h, grid); p = g['archPhysicalGeometry']
    factor = native['request']['bearingCase']['masonryCase']['verticalCase']['monolithicCase']['houseCase']['boundary']['physicalGFactor']
    rho = c['masonryUnitWeightKNPerM3']; ri = p['sourceInnerRadiusMm']/1000; ro = p['sourceOuterRadiusMm']/1000
    rm = (ri+ro)/2; angle = p['seatAngleRad']; a = rm*math.sin(angle); cz = p['sourceCurveCentreZMm']/1000
    n = c['integrationIntervals']; points = []; centre = g['centreYMm']; dx = 2*a/n
    # Exact reusable source ring-course quantities/witness, separate from loaded composite comparison.
    ring = _ring_witness(p, rho)
    cards = upper_cards(native); cropped = []
    for card in cards:
        lo, hi = card['intervalYMm']; l = max(lo, centre-a*1000); r = min(hi, centre+a*1000)
        if r>l:
            cropped.append({**card, 'archIntervalYMm': [l, r]})
    loadsets = {'ring-only': [], 'ring-spandrel-actual-upper': []}
    # Include every actual material-load breakpoint. Refinement never slides a
    # source boundary to a sample or changes its exact force/first moment.
    breaks = sorted({-a, a, *[(v-centre)/1000 for row in cropped for v in row['archIntervalYMm']]})
    cells = []
    for l, r in zip(breaks, breaks[1:]):
        count = max(1, math.ceil((r-l)/dx))
        cells.extend((l+(r-l)*i/count, l+(r-l)*(i+1)/count) for i in range(count))
    for l, r in cells:
        x = (l+r)/2; dx_cell = r-l; y = centre+x*1000
        # Uniform radial area through circular rays, same formula as north-arch control.
        ring_q = rho*.140*(ro**2-ri**2)/(2*math.sqrt(rm**2-x*x))
        extrados = cz+math.sqrt(ro**2-x*x)
        spandrel_q = rho*.140*max(0, 3.170-extrados)
        actual_upper_q = sum(row['characteristicDownKNPerMm']*1000 for row in cropped if row['archIntervalYMm'][0] <= y <= row['archIntervalYMm'][1])
        loadsets['ring-only'].append((x, factor*ring_q*dx_cell))
        loadsets['ring-spandrel-actual-upper'].append((x, factor*(ring_q+spandrel_q+actual_upper_q)*dx_cell))
    # Exact physical floor/member side actions are deliberately retained, not silently mapped to masonry.
    side_actions = [{k: r[k] for k in ('memberId', 'end', 'physicalPointMm', 'globalPhysicalEndWrenchKN_KNm')} for r in native['beamEndCuts']]
    results = {name: arch_equilibrium(g, loads, c['sectionSamples']) for name, loads in loadsets.items()}
    loaded = results['ring-spandrel-actual-upper']; seat_z = loaded['meanRingSeatZMm']; tie_z = c['tieCentreZMm']
    piers = []
    for name, V, yseat, interval in [('south', loaded['southVerticalKN'], loaded['meanRingSeatYMm'][0], [g['lowerCoreRectangleXYMm'][1], g['rawOpeningYMm'][0]]),
                                   ('north', loaded['northVerticalKN'], loaded['meanRingSeatYMm'][1], [g['rawOpeningYMm'][1], g['lowerCoreRectangleXYMm'][3]])]:
        width = interval[1]-interval[0]; own_g = .140*width/1000*(2550+180)/1000*rho*factor
        centre_y = sum(interval)/2; sign = -1 if name == 'south' else 1
        direct = []
        for card in cards:
            left, right = card['intervalYMm']; hinge = loaded['meanRingSeatYMm'][0 if name == 'south' else 1]
            l, r = (left, min(right, hinge)) if name == 'south' else (max(left, hinge), right)
            if r > l:
                direct.append({'sourceId': card['id'], 'intervalYMm': [l, r],
                               'forceDownKN': (r-l)*card['characteristicDownKNPerMm']*factor,
                               'originYMm': (l+r)/2, 'originXMm': card['originXMm']})
        direct_n = sum(row['forceDownKN'] for row in direct)
        direct_m = sum(row['forceDownKN']*(row['originYMm']-centre_y)/1000 for row in direct)
        H = loaded['horizontalThrustKN']; N = V+own_g+direct_n
        untied_m = sign*H*(seat_z+180)/1000 + V*(yseat-centre_y)/1000+direct_m
        tied_m = sign*H*(seat_z-tie_z)/1000 + V*(yseat-centre_y)/1000+direct_m
        # Explicit nominal statical allocation of the actual X-origin moments.
        # This conserves their total; it is not a stiffness-derived distribution
        # or an upper bound on opposing out-of-plane end couples.
        ys, yn = loaded['meanRingSeatYMm']; normal_m = 0.
        for card in cards:
            l, r = card['intervalYMm']; xm = card['originXMm']-g['lowerWallAxisXMm']
            for a0, b0 in zip(sorted({l, r, *[v for v in (ys, yn) if l < v < r]}),
                              sorted({l, r, *[v for v in (ys, yn) if l < v < r]})[1:]):
                mid = (a0+b0)/2; t = min(1., max(0., (mid-ys)/(yn-ys)))
                weight = 1-t if name == 'south' else t
                normal_m += (b0-a0)*card['characteristicDownKNPerMm']*factor*weight*xm/1000
        sensitivity = []
        for tie_level in sorted({2450., 2500., 2550., 2560., 2570., 2600., tie_z-10, tie_z, tie_z+10}):
            mm = sign*H*(seat_z-tie_level)/1000 + V*(yseat-centre_y)/1000+direct_m
            ratio = 6*abs(mm)/(N*width/1000)+6*abs(normal_m)/(N*.140)
            sensitivity.append({'tieCentreZMm': tie_level, 'inPlaneBaseMomentKNm': mm,
                                'nominalBiaxialGrossNoTensionRatio': ratio})
        piers.append({'id': 'STR/WET-MASONRY/'+name, 'actualAbutmentIntervalYMm': interval,
                      'meanRingSeatYMm': yseat, 'axialCompressionKN': N, 'grossPierOwnFactoredGKN': own_g,
                      'actualUpperDirectGravityOrigins': direct, 'directUpperGravityKN': direct_n,
                      'pierOwnWeightScope': 'Gross140core below source spring only. Remaining upper/spandrel/retained-wall union and all coupled floor actions are omitted, not available stabilising weight.',
                      'untiedBaseHorizontalKN': sign*H, 'untiedBaseInPlaneMomentKNm': untied_m,
                      'tiedBaseInPlaneMomentKNm': tied_m, 'tieForceKN': H,
                      'tieVerticalLeverMm': seat_z-tie_z,
                      'untiedGrossNoTensionRatio': 6*abs(untied_m)/(N*width/1000) if N>0 else None,
                      'tiedGrossNoTensionRatio': 6*abs(tied_m)/(N*width/1000) if N>0 else None,
                      'inPlaneMomentSign': 'positive about negative globalX',
                      'nominalActualUpperOriginNormalMomentKNm': normal_m,
                      'nominalNormalMomentAllocation': 'Linear vertical-support influence weights at physical mean-ring seats, retaining every actual X origin. Chosen statical witness, not compatible distribution or actual force bound.',
                      'normalMomentCompatibleDistributionAvailable': False,
                      'tiedNominalBiaxialGrossNoTensionRatio': 6*abs(tied_m)/(N*width/1000)+6*abs(normal_m)/(N*.140),
                      'tieHeightSensitivity': sensitivity,
                      'plusMinus10TieHeightNominalProbePassing': all(row['nominalBiaxialGrossNoTensionRatio'] <= 1 for row in sensitivity if tie_z-10 <= row['tieCentreZMm'] <= tie_z+10),
                      'tieHeightProbeIsPhysicalToleranceQualification': False,
                      'baseHorizontalTransferAccepted': False, 'tieAnchorageAccepted': False, 'outOfPlaneStabilityAccepted': False})
    tie_ref = h['northNormalRoute']['portal']['tie']
    plate = tie_ref['endPlate']; washer = tie_ref['washer']; nut = tie_ref['nut']; rod = tie_ref['rod']; bore = tie_ref['formedBore']
    stack = plate[2]+washer[1]+nut[1]; faces = c['tieBearingFacesYMm']
    if not g['lowerCoreRectangleXYMm'][1]+stack <= faces[0] < loaded['meanRingSeatYMm'][0] < loaded['meanRingSeatYMm'][1] < faces[1] <= g['lowerCoreRectangleXYMm'][3]-stack:
        raise ValueError('Complete tie ends or direct-bearing masonry leave the actual receiving territory')
    steel_path = {'sourceComponentRequirements': copy.deepcopy(tie_ref), 'tieCentreZMm': tie_z,
        'rodAxisXMm': g['lowerWallAxisXMm'], 'bearingFacesYMm': faces,
        'endStackLengthMm': stack, 'completeStackBoundsYMm': [faces[0]-stack, faces[1]+stack],
        'southNorthReceiverEndReservesMm': [faces[0]-stack-g['lowerCoreRectangleXYMm'][1], g['lowerCoreRectangleXYMm'][3]-faces[1]-stack],
        'sourceWeatherBoundaryYMm': native['beamSettings']['receiverRectanglesXYMm'][1][3],
        'northStackWeatherReserveMm': native['beamSettings']['receiverRectanglesXYMm'][1][3]-faces[1]-stack,
        'plateNormalProjectionBeyond140CoreEachMm': max(0, (plate[0]-140)/2),
        'plateInsideExisting194FinishedWidthReserveEachMm': (194-plate[0])/2,
        'sourceRodNominalTensionStressMPa': loaded['horizontalThrustKN']*1000/(math.pi*rod**2/4),
        'source140x150BearingMinusBoreRequiredPressureMPa': loaded['horizontalThrustKN']*1000/(140*plate[1]-math.pi*bore**2/4),
        'exposedTieUndersideRequirementMm': tie_z-tie_ref['envelope']/2,
        'forcePath': 'Straight axial rod joins outer bearing plates. Plates bear toward the arch through real intervening masonry; no friction, glue or embedded tension development is credited. Lower body/pier receives residual offset moments.',
        'installationAndAccess': 'Build actual end bearing pockets and install rod/plates before masonry closure. Form retained east-side access for nuts without cutting the north weather plane. Pocket-loss/node/tool/grip, restoration and complete constituents remain unqualified.',
        'bearingPocketRemovalIncludedInWallQuantity': False,
        'plateBendingNodeTieAndMaterialAccepted': False, 'installedAccessAccepted': False}
    return {'schema': 'str-wet-masonry-arch-comparison/1', 'choices': c, 'geometry': g,
            'nativeEvidence': {'caseId': native['nativeCaseId'], 'fullResponseSHA256': native['fullResponseSHA256'],
                               'nativeRequestSHA256': digest(native['request']), 'nativeSourceSHA256': native['sourceSHA256']},
            'actualUpperGravityCards': cards, 'upperGravityWithinRingSpan': cropped,
            'exactUpperGravityFactoredKN': sum(card['actualFactoredDownKN'] for card in cards),
            'exactUpperGravityNormalMomentAboutLowerAxisKNm': sum(card['actualFactoredDownKN']*(card['originXMm']-g['lowerWallAxisXMm'])/1000 for card in cards),
            'upperGravityNormalMomentScope': 'Force and physicalX first moment retained once; its distribution into ring/abutments and slab transfer remain unsupported.',
            'sourceRingCourseSelfWeightWitnesses': ring,
            'gravityCases': results, 'tiedUntiedAbutmentDemands': piers,
            'positiveTiePathComparison': steel_path,
            'quantities': {'grossWallMinusArchM3': g['wallMinusOpeningGrossVolumeM3'],
                           'grossWallMinusArchGKN': g['wallMinusOpeningGrossVolumeM3']*rho,
                           'retainedNativeRCBeamPostGKN': native['beamPostBulkGKN'],
                           'netReplacementWeightAccepted': False},
            'retainedActualBeamEndActions': side_actions,
            'nativeReplacementRecipe': {'remove': ['seated250x350beam+itsG/Q', 'two finite260x450posts+theirG', 'normal-only pads+theirG', 'both beam boundary maps and RC200strip omission'],
                'add': ['source-owned arched140core with explicit12mm lower axis offset', 'restored RC200strip with actual plate/membrane operators and G/Q once', 'actual arch gravity/thrust/abutment/tie laws at named600wet/rearW/stairpost/outerNW receivers'],
                'recover': ['all floor/membrane/body/contact source origins on both candidate interfaces', 'full six-component replacement demands and52heads', 'old post-reservation masonry subtraction and new wall union once', 'actual stair/sofa/window/finish and wall/floor moisture interfaces'],
                'sameSystemForceComparisonAvailable': False},
            'diagnostics': ['FROZEN_NATIVE_SIDE_ACTIONS_NOT_REPLAYED', 'ACTUAL_FLOOR_LOAD_REDISTRIBUTION_UNAVAILABLE', 'ARCH_COMPOSITE_AND_NODE_RESISTANCE_UNQUALIFIED', 'TIE_BASE_AND_OUT_OF_PLANE_TRANSFER_UNQUALIFIED'],
            'sourceGroundDatumMm': 0, 'raisedGroundApplicabilityAccepted': False,
            'completeSignedLoadEnvelope': False, 'globalNativeReplacementExecuted': False,
            'candidateAccepted': False, 'ownerAppearanceAccepted': False,
            'scope': 'Partial circular three-hinge masonry gravity free body with same actual upper clear-material cards. No native floor/frame replacement, coupled stiffness, complete load-envelope, installed assembly or selected house.'}


def drawing(r):
    g = r['geometry']; lo, hi = g['finishedClearOpeningYMm']; y0 = 8500; scale = .19
    x = lambda y: 65+(y-y0)*scale
    z = lambda level: 690-level*.17
    p = g['archPhysicalGeometry']; ri = p['sourceInnerRadiusMm']; ro = p['sourceOuterRadiusMm']; centre = g['centreYMm']; cz = p['sourceCurveCentreZMm']
    def curve(radius):
        return ' '.join(f'{x(centre+radius*math.sin(t)):.2f},{z(cz+radius*math.cos(t)):.2f}' for t in [-p['seatAngleRad']+2*p['seatAngleRad']*i/160 for i in range(161)])
    sofa = [9800,10550]; loaded = r['gravityCases']['ring-spandrel-actual-upper']
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="790" viewBox="0 0 1200 790"><style>text{{font-family:Arial,sans-serif;fill:#252422}}.small{{font-size:14px}}.label{{font-size:18px}}.warn{{fill:#9b3b2a}}</style><rect width="1200" height="790" fill="#faf8f2"/><text x="35" y="37" font-size="25">Wet wall: arched masonry alternative</text><text x="35" y="64" class="small">Partial actual-upper-gravity comparison; frozen native floor and six-action transfer remain unjoined.</text><rect x="{x(8627.5):.2f}" y="{z(3170):.2f}" width="{3110*scale:.2f}" height="{3350*.17:.2f}" fill="#e2d9c8"/><polygon points="{x(g['rawOpeningYMm'][0]):.2f},690 {curve(ri)} {x(g['rawOpeningYMm'][1]):.2f},690" fill="#faf8f2"/><polyline points="{curve(ro)}" fill="none" stroke="#8c6850" stroke-width="3"/><polyline points="{curve(ri)}" fill="none" stroke="#8c6850" stroke-width="3"/><line x1="{x(8627.5):.2f}" x2="{x(11737.5):.2f}" y1="{z(3170):.2f}" y2="{z(3170):.2f}" stroke="#555" stroke-width="4"/><rect x="{x(sofa[0]):.2f}" y="{z(700):.2f}" width="{750*scale:.2f}" height="{700*.17:.2f}" fill="#b7bea3"/><line x1="{x(lo):.2f}" x2="{x(hi):.2f}" y1="{z(r['choices']['tieCentreZMm']):.2f}" y2="{z(r['choices']['tieCentreZMm']):.2f}" stroke="#a38b4e" stroke-width="3" stroke-dasharray="10 6"/><text x="780" y="120" class="label">Clear span {r['choices']['finishedClearSpanMm']:.0f} mm</text><text x="780" y="150" class="small">2550 spring /2850 head /215 ring</text><text x="780" y="180" class="small">105 mm crown-to-slab reserve</text><text x="780" y="225" class="small">Unchanged sofa beneath opening</text><text x="780" y="255" class="small">South/north bands {g['sofaSouthNorthPassageMm'][0]:.1f}/{g['sofaSouthNorthPassageMm'][1]:.1f} mm</text><text x="780" y="305" class="small">Lower wall moves {r['choices']['lowerCoreEastOffsetMm']:.0f} mm east</text><text x="780" y="335" class="small">Upper core overlap {g['upperLowerCoreOverlapMm']:.0f} mm</text><text x="780" y="385" class="small">Partial gravity thrust {loaded['horizontalThrustKN']:.3f} kN</text><text x="780" y="415" class="small">Dashed tie: demand comparison only</text><text x="780" y="465" class="small warn">No coupled native replacement</text><text x="780" y="495" class="small warn">No tie/abutment or ring acceptance</text><text x="35" y="746" class="small">Source-ground0 /actual600wet grid geometry /RC200 first floor. Drawing cuts through new wall, not a selected room view.</text><text x="35" y="773" class="small warn">Fixed side actions, slab-strip restoration, complete envelope, moisture, construction and owner appearance remain open.</text></svg>'''


def produce():
    h = json.loads((ROOT/'project/had/studies/water-replan.json').read_text())['model']
    grid = json.loads((D/'current-house-grid.json').read_text()); native = json.loads(EVIDENCE.read_text())
    for path, identity in native['sourceSHA256'].items():
        if hashlib.sha256((ROOT/path).read_bytes()).hexdigest() != identity:
            raise ValueError('Stale native source: '+path)
    r = assess(json.loads(CHOICES.read_text()), h, grid, native)
    refined_choices = {**r['choices'], 'integrationIntervals': r['choices']['integrationIntervals']*2,
                       'sectionSamples': r['choices']['sectionSamples']*2}
    refined = assess(refined_choices, h, grid, native)
    r['numericalComparison'] = {'coarseIntervals': r['choices']['integrationIntervals'],
        'fineIntervals': refined_choices['integrationIntervals'],
        'coarseSectionSamples': r['choices']['sectionSamples'], 'fineSectionSamples': refined_choices['sectionSamples'],
        'gravityCaseChanges': {name: {key: refined['gravityCases'][name][key]-case[key] for key in
            ['totalDownKN', 'southVerticalKN', 'northVerticalKN', 'horizontalThrustKN', 'maximumAbsoluteEccentricityMm', 'maximumRequiredCompressionMPa']}
            for name, case in r['gravityCases'].items()},
        'scope': 'Measured midpoint-integration and sampled-section sensitivity only. Actual load breakpoints are retained at both pitches; no continuum or complete-envelope convergence claim.'}
    r['sourceSHA256'] = {path: hashlib.sha256((ROOT/path).read_bytes()).hexdigest() for path in METHODS+['project/had/studies/water-replan.json', 'project/str/studies/current-house-grid.json', str(CHOICES.relative_to(ROOT)), str(EVIDENCE.relative_to(ROOT))]}
    return r


if __name__ == '__main__':
    p = argparse.ArgumentParser(); p.add_argument('--write', action='store_true'); p.add_argument('--check', action='store_true'); p.add_argument('--check-capture', type=Path); a = p.parse_args()
    if a.check_capture:
        captured = json.loads(a.check_capture.read_bytes()); sha = hashlib.sha256(a.check_capture.read_bytes()).hexdigest()
        retained = json.loads(EVIDENCE.read_text())
        if sha != retained['fullResponseSHA256'] or crop_native(captured, sha) != retained:
            raise ValueError('Complete native bytes do not match the actual retained arch input')
        from floor_section_model import load_source
        from floor_section_proof import validate_full
        source = load_source(ROOT)
        validate_full(captured, captured['request'], source, retained['nativeCaseId'])
    r = produce(); text = json.dumps(r, indent=2, allow_nan=False)+'\n'; svg = drawing(r)
    if a.write:
        PROOF.write_text(text); PROOF.with_suffix('.svg').write_text(svg)
    elif a.check:
        if PROOF.read_text() != text or PROOF.with_suffix('.svg').read_text() != svg:
            raise ValueError('Stale arched masonry comparison; regenerate actual sources')
    else:
        print(text)
