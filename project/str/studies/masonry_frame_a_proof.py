"""Fresh joined current-model controls; no stored head reactions are inputs."""
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
    case['lowerCoreBodies']={'masonryUnitWeightKNPerM3':20.}
    case['lowerLWeight']={'unitWeightKNPerM3':25.}
    case['verticalCase']['monolithicCase']['houseCase']['northUpstandWidthMm']=290.
    from roof_floor_compatibility import reference_roof_coupling_settings
    roof=reference_roof_coupling_settings(source['root'])
    roof['upperFrameLaw']=copy.deepcopy(case['verticalCase']['monolithicCase']['houseCase']['joinedCase']['portal']['frameLaw'])
    roof['upperUnitWeightKNPerM3']=25.
    roof['intermediateSupportLaws']={identifier:{'stiffnessKNPerMm':40.,'mode':'bilateral'} for identifier in roof['intermediateSupportLaws']}
    if 'roofSteelGravity' in roof:roof['roofSteelGravity']={'unitWeightKNPerM3':78.5}
    case['roofCoupling']=roof
    from straight_frame_cage import reference_six_bar_straight_frame_cage_settings
    case['straightFrameCage']=reference_six_bar_straight_frame_cage_settings()
    return case


def reinforcement_summary(result):
    return {**result,'straightDevelopment':{k:v for k,v in result['straightDevelopment'].items() if k!='routeInventory'}}


def cage_summary(result):
    if result is None:return None
    keys=('schema','settings','sourceCaseId','sourceSHA256','nativeSourceSHA256','simultaneousCutDigest',
        'failedMainBarPairCount','minimumMainBarAdverseClearanceMm','minimumMainBarAdverseCoverMm',
        'worstSectionScreen','allSectionComparisonsWithinOne','actualJointPostBarCoverComparatorPasses',
        'closedLinkHookClosure','fullForceDevelopment','capInterfaces','candidateAccepted','jointPanelAccepted',
        'capGridJointAccepted','pileInterfaceAccepted','reinforcementAccepted','installedAcceptance','solvedGeometrySuppliesDemand')
    return {k:result[k] for k in keys}


def roof_summary(result):
    if result is None:return None
    return {k:v for k,v in result.items() if k not in ('roofSvg','ringDisplacements','receivers','sourcePressureOrigins')}


def summarize(result):
    n=result['nativeVertical'];heads=n['native']['heads'];case=result['request'];house=case['verticalCase']['monolithicCase']['houseCase']
    return {'caseId':n['native']['caseId'],'changedControls':{'physicalGFactor':house['boundary']['physicalGFactor'],
        'northUpstandWidthMm':house['northUpstandWidthMm'],'abutmentSlices':case['abutmentSlices'],
        'floorApertures':house['joinedCase']['floor']['componentCase']['edits']['floorApertures'],
        'windIndex':house['joinedCase']['floor']['boundaryCase']['windIndex'],
        'ringPlanEIRatio':case['roofCoupling']['ringPlanEIRatio'] if case['roofCoupling'] else None},
        'mass':result['mass'],'headWrenches':heads,'headPositions':n['headPositions'],
        'externalWrenchKN_KNm':n['native']['externalWrenchKN_KNm'],'equilibriumResidualKN_KNm':n['native']['equilibriumResidualKN_KNm'],
        'maximumPlateDeflectionMm':n['plate']['physicalRecovery']['maximumDeflectionMm'],
        'maximumFrameTranslationMm':n['native']['maximumFrameTranslationMm'],
        'minimumHeadVerticalKN':min(row['reactionKN_KNm'][2] for row in heads),
        'negativeHeadCount':sum(row['reactionKN_KNm'][2]<-1e-8 for row in heads),
        'missingGroundContactAreaMm2':n['missingGroundContactAreaMm2'],
        'sourceSelfGAndFirstMomentResidualKN_KNm':result['foundationWeight']['sourceSelfGAndFirstMomentResidualKN_KNm'],
        'plateWorkRelativeResidual':n['plate']['physicalRecovery']['workRelativeResidual'],
        'maximumAbsoluteBendingPlusTwistingKNmPerM':result['plateBending']['maximumAbsoluteBendingPlusTwistingKNmPerM'],
        'floorReinforcement':reinforcement_summary(result['floorReinforcement']),
        'lowerLWeight':result['lowerLWeight'],'lowerCoreBodies':result['lowerCoreBodies'],
        'lowerCoreResponse':result['lowerCoreResponse'],'roofCoupling':roof_summary(result['roofCoupling']),
        'straightFrameCage':cage_summary(result['straightFrameCage']),
        'candidateAccepted':False,'completeHouseProof':False,'installedAcceptance':False}


def head_delta(before,after):
    a={r['id']:r['reactionKN_KNm'] for r in before['nativeVertical']['native']['heads']}
    return max(abs(x-y) for r in after['nativeVertical']['native']['heads'] for x,y in zip(a[r['id']],r['reactionKN_KNm']))


def _audit_head_wrench(summary):
    positions={r['id']:r['xyzMm'] for r in summary['headPositions']};total=[0.]*6
    for row in summary['headWrenches']:
        x,y,z=positions[row['id']];fx,fy,fz,mx,my,mz=row['reactionKN_KNm']
        values=(fx,fy,fz,mx+(y*fz-z*fy)/1000,my+(z*fx-x*fz)/1000,mz+(x*fy-y*fx)/1000)
        total=[a+b for a,b in zip(total,values)]
    if max(abs(a+b) for a,b in zip(total,summary['externalWrenchKN_KNm']))>1e-6:raise ValueError('Independent all52head force/first-moment reconstruction fails')
    return total


def proof(source):
    start=time.time();base=numerical_case(source);controls=[('baseline',base)]
    aperture=copy.deepcopy(base)
    aperture['verticalCase']['monolithicCase']['houseCase']['joinedCase']['floor']['componentCase']['edits']['floorApertures']=[{'id':'FLOOR-APERTURE/plant-riser','shape':{'kind':'rectangle','boundsXYMm':[9240,4760,9905,5305]}}]
    controls.append(('aperture-wider',aperture))
    roof_edit=copy.deepcopy(base);roof_edit['roofCoupling']['ringPlanEIRatio']=.5;controls.append(('roof-ring-EI-half',roof_edit))
    court=copy.deepcopy(base);court['verticalCase']['monolithicCase']['houseCase']['joinedCase']['floor']['boundaryCase']['windIndex']=79;controls.append(('roof-court-W79',court))
    adverse=copy.deepcopy(base);adverse['verticalCase']['monolithicCase']['houseCase']['boundary']['physicalGFactor']=0.;controls.append(('zero-physical-G',adverse))
    controls.append(('restored',copy.deepcopy(base)))
    summaries=[];baseline=None
    for name,case in controls:
        result=run_masonry_frame_a(case,source,'MASONRY-FRAME-A/'+name)
        if baseline is None:baseline=result
        summary=summarize(result);summary['maximum52HeadComponentDeltaFromBaselineKN_KNm']=head_delta(baseline,result)
        summary['independentlySummedHeadWrenchKN_KNm']=_audit_head_wrench(summary);summaries.append(summary)
        print(name,'elapsed',round(time.time()-start,2),'minHead',summary['minimumHeadVerticalKN'],'headDelta',summary['maximum52HeadComponentDeltaFromBaselineKN_KNm'],flush=True)
    if abs(summaries[1]['mass']['newPlatePhysicalSelfGKN']-summaries[0]['mass']['newPlatePhysicalSelfGKN']+.545)>1e-8:raise ValueError('Actual sole-floor aperture material change missing')
    if summaries[1]['maximum52HeadComponentDeltaFromBaselineKN_KNm']<1e-6:raise ValueError('Aperture mutation did not propagate through actual compatible52head response')
    if summaries[2]['maximum52HeadComponentDeltaFromBaselineKN_KNm']<1e-6:raise ValueError('Roof stiffness mutation did not propagate to actual floor/52head response')
    for key in ('RCPostVolumeM3','masonryPhysicalGKN','newPlatePhysicalSelfGKN','newPlateAreaM2','referenceStructuralShellPhysicalGKN','foundationPhysicalGKN','cornerClosurePhysicalGKN','lowerLPhysicalGKN','lowerCorePhysicalGKN','roofAddedPhysicalGKN','joinedPhysicalGKN'):
        if abs(summaries[0]['mass'][key]-summaries[2]['mass'][key])>1e-8:raise ValueError('Roof stiffness-only edit changed physical inventory: '+key)
    if summaries[-1]['maximum52HeadComponentDeltaFromBaselineKN_KNm']>1e-6:raise ValueError('Restored full case failed to reproduce actual all-head response')
    if summaries[0]['missingGroundContactAreaMm2']>1e-8:raise ValueError('Authored formed court corner did not close actual missing normal route')
    kept={k:baseline[k] for k in ('schema','sourceSHA256','geometry','mass','foundationWeight','courtCornerClosure','masonryCourses','loadIntroduction','lowerLWeight','lowerCoreBodies','lowerCoreResponse')}
    kept['request']=base
    kept['straightFrameCage']={**cage_summary(baseline['straightFrameCage']),'sectionScreens':baseline['straightFrameCage']['sectionScreens']}
    kept['roofCoupling']={k:v for k,v in baseline['roofCoupling'].items() if k!='roofSvg'}
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
        'sourceWindIndicesExecuted':[31,79],'nativeProgrammeSweepClaimed':False,
        'aperturePhysicalSelfGDeltaKN':summaries[1]['mass']['newPlatePhysicalSelfGKN']-summaries[0]['mass']['newPlatePhysicalSelfGKN'],
        'roofRingStiffnessHeadDeltaKN_KNm':summaries[2]['maximum52HeadComponentDeltaFromBaselineKN_KNm'],
        'actualFullCaseReversalHeadDeltaKN_KNm':summaries[-1]['maximum52HeadComponentDeltaFromBaselineKN_KNm'],
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
    print('Six actual compatible states; all installed/complete-house gates remain false',flush=True)
