"""Fresh joined successor controls; no outage or prior-force receipt is an input."""
import copy
import hashlib
import json
from pathlib import Path
import sys
import time

from masonry_frame_a import load_masonry_frame_a_source, reference_masonry_frame_a_case, run_masonry_frame_a
from vertical_rc_floor_proof import numerical_case as vertical_numerical_case

D=Path(__file__).resolve().parent


def numerical_case(source):
    case=reference_masonry_frame_a_case(source)
    case['verticalCase']=vertical_numerical_case(source['vertical'])
    case['courtCornerClosure']={'mode':'source-sw-formed-quarter-node-comparison'}
    return case


def reinforcement_summary(result):
    return {**result,'straightDevelopment':{k:v for k,v in result['straightDevelopment'].items() if k!='routeInventory'}}


def summarize(result):
    n=result['nativeVertical'];heads=n['native']['heads']
    return {'caseId':n['native']['caseId'],'changedControls':{'physicalGFactor':result['request']['verticalCase']['monolithicCase']['houseCase']['boundary']['physicalGFactor'],'abutmentSlices':result['request']['abutmentSlices'],'floorApertures':result['request']['verticalCase']['monolithicCase']['houseCase']['joinedCase']['floor']['componentCase']['edits']['floorApertures']},'mass':result['mass'],
        'headWrenches':heads,'equilibriumResidualKN_KNm':n['native']['equilibriumResidualKN_KNm'],
        'maximumPlateDeflectionMm':n['plate']['physicalRecovery']['maximumDeflectionMm'],
        'maximumFrameTranslationMm':n['native']['maximumFrameTranslationMm'],
        'minimumHeadVerticalKN':min(row['reactionKN_KNm'][2] for row in heads),
        'negativeHeadCount':sum(row['reactionKN_KNm'][2]<-1e-8 for row in heads),
        'missingGroundContactAreaMm2':n['missingGroundContactAreaMm2'],
        'sourceSelfGAndFirstMomentResidualKN_KNm':result['foundationWeight']['sourceSelfGAndFirstMomentResidualKN_KNm'],
        'plateWorkRelativeResidual':n['plate']['physicalRecovery']['workRelativeResidual'],
        'maximumAbsoluteBendingPlusTwistingKNmPerM':result['plateBending']['maximumAbsoluteBendingPlusTwistingKNmPerM'],
        'floorReinforcement':reinforcement_summary(result['floorReinforcement']),
        'candidateAccepted':False,'completeHouseProof':False,'installedAcceptance':False}


def head_delta(before,after):
    a={r['id']:r['reactionKN_KNm'] for r in before['nativeVertical']['native']['heads']}
    return max(abs(x-y) for r in after['nativeVertical']['native']['heads'] for x,y in zip(a[r['id']],r['reactionKN_KNm']))


def proof(source):
    start=time.time();base=numerical_case(source);controls=[('baseline',base)]
    aperture=copy.deepcopy(base)
    aperture['verticalCase']['monolithicCase']['houseCase']['joinedCase']['floor']['componentCase']['edits']['floorApertures']=[{'id':'FLOOR-APERTURE/plant-riser','shape':{'kind':'rectangle','boundsXYMm':[9240,4760,9905,5305]}}]
    controls.append(('aperture-wider',aperture))
    adverse=copy.deepcopy(base);adverse['verticalCase']['monolithicCase']['houseCase']['boundary']['physicalGFactor']=0.
    controls.append(('zero-physical-G',adverse))
    refined=copy.deepcopy(base);refined['abutmentSlices']=24;controls.append(('abutment-slices24',refined))
    summaries=[];baseline=None
    for name,case in controls:
        result=run_masonry_frame_a(case,source,'MASONRY-FRAME-A/'+name)
        if baseline is None:baseline=result
        summary=summarize(result);summary['maximum52HeadComponentDeltaFromBaselineKN_KNm']=head_delta(baseline,result);summaries.append(summary)
        print(name,'elapsed',round(time.time()-start,2),'minHead',summary['minimumHeadVerticalKN'],'headDelta',summary['maximum52HeadComponentDeltaFromBaselineKN_KNm'],flush=True)
    if abs(summaries[1]['mass']['newPlatePhysicalSelfGKN']-summaries[0]['mass']['newPlatePhysicalSelfGKN']+.545)>1e-8:raise ValueError('Actual sole-floor aperture material change missing')
    if summaries[1]['maximum52HeadComponentDeltaFromBaselineKN_KNm']<1e-6:raise ValueError('Aperture mutation did not propagate through actual compatible52head response')
    if summaries[0]['missingGroundContactAreaMm2']>1e-8:raise ValueError('Authored formed court corner did not close the actual missing normal route')
    if baseline['geometry']!=run_geometry_control(source,base):raise ValueError('Unchanged source geometric control differs')
    # Dense field inspections regenerate through the same native method; retain
    # the actual simultaneous physical member/cap cuts and all52heads here.
    kept={k:baseline[k] for k in ('schema','sourceSHA256','geometry','mass','foundationWeight','courtCornerClosure','masonryCourses','loadIntroduction')}
    kept['plateBending']={k:v for k,v in baseline['plateBending'].items() if k!='cells'}
    n=baseline['nativeVertical']
    kept['nativeVertical']={'schema':n['schema'],'sourceSHA256':n['sourceSHA256'],'parentVerticalMethodSchema':n['parentVerticalMethodSchema'],
        'missingGroundContactAreaMm2':n['missingGroundContactAreaMm2'],'normalCoreCount':len(n['normalCoreGeometry']),
        'native':{k:n['native'][k] for k in ('schema','sourceSHA256','caseId','heads','equilibriumResidualKN_KNm','memberCuts','capCuts','adjacentGridMemberCuts','maximumFrameTranslationMm','energyRelativeResidual')},
        'plate':{'cellCount':n['plate']['cellCount'],'maximumDeflectionMm':n['plate']['physicalRecovery']['maximumDeflectionMm'],
            'workRelativeResidual':n['plate']['physicalRecovery']['workRelativeResidual']}}
    output={'schema':'str-masonry-frame-a-proof/1','sourceSHA256':source['identities'],
        'proofProducerSHA256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
        'authoredNumericalCase':base,'executedCoupledCaseCount':len(summaries),'baseline':kept,'cases':summaries,
        'sourceWindIndicesExecuted':[31],'nativeProgrammeSweepClaimed':False,
        'aperturePhysicalSelfGDeltaKN':summaries[1]['mass']['newPlatePhysicalSelfGKN']-summaries[0]['mass']['newPlatePhysicalSelfGKN'],
        'taperedSectionRefinementHeadDeltaKN_KNm':summaries[3]['maximum52HeadComponentDeltaFromBaselineKN_KNm'],
        'candidateAccepted':False,'completeHouseProof':False,'installedAcceptance':False}
    return output,baseline['drawings']


def run_geometry_control(source,case):
    from masonry_frame_a import geometry
    floor=source['vertical']['parent']['house']['joined']['floor'];h=floor['retained']['values']['project/had/studies/water-replan.json']['model']
    grid=floor['successor']['values']['current-house-grid']
    return geometry(case,h['insulatedPortal'],grid)


if __name__=='__main__':
    if sys.argv[1:]!=['--write']:raise SystemExit('Use --write for fresh source-bound joined masonry-frame controls')
    source=load_masonry_frame_a_source(D.parents[2]);result,drawings=proof(source)
    if source['identities']!=load_masonry_frame_a_source(D.parents[2])['identities']:raise SystemExit('Source changed while solving; stale proof not written')
    (D/'masonry-frame-a-proof.json').write_text(json.dumps(result,indent=2,allow_nan=False)+'\n')
    for name,svg in drawings.items():(D/name).write_text(svg)
    print('Four actual compatible states; all installed/complete-house gates remain false',flush=True)
