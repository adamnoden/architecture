import copy
import hashlib
import json
from pathlib import Path
import sys
import time

from monolithic_rc_sweep import numerical_case as monolithic_case
from vertical_rc_floor import build_vertical_rc_floor, load_vertical_rc_floor_source, reference_vertical_rc_floor_case, solve_vertical_rc_floor
from vertical_floor_views import draw_vertical_floor


D=Path(__file__).resolve().parent


def numerical_case(source):
    case=reference_vertical_rc_floor_case(source);case['monolithicCase']=monolithic_case(source['parent'])
    case['plateLaw']={'elasticModulusMPa':33000,'poissonRatio':.2,'thicknessMm':200,'flexuralFactor':.25,'shearFactor':.5,'unitWeightKNPerM3':25}
    case['bearingLaw']={'masonryModulusMPa':1000,'jointNormalComplianceMmPerMPa':.01}
    return case


def summarize(result):
    n=result['native'];bearing=result['bearings'];four=n['fourLComparisonInterfaces']
    return {'caseId':n['caseId'],'request':result['request'],'mass':result['mass'],'headWrenches':n['heads'],
        'equilibriumResidualKN_KNm':n['equilibriumResidualKN_KNm'],'sourceSelfGCondensationResidualKN_KNm':result['mass']['sourceSelfGCondensationResidualKN_KNm'],
        'nativeCondensedSystemEnergyRelativeResidual':n['energyRelativeResidual'],'physicalPlateWorkRelativeResidual':result['plate']['physicalRecovery']['workRelativeResidual'],
        'plateCellCount':result['plate']['cellCount'],'platePointCount':result['plate']['pointCount'],'retainedCoordinateCount':result['plate']['retainedCoordinateCount'],
        'maximumFrameTranslationMm':n['maximumFrameTranslationMm'],'maximumPlateDeflectionMm':result['plate']['physicalRecovery']['maximumDeflectionMm'],
        'normalFibreCount':len(bearing),'activeNormalFibreCount':sum(row['active'] for row in bearing),'normalCompressionKN':sum(row['normalCompressionKN'] for row in bearing),
        'maximumNormalPressureMPa':max(row['normalPressureMPa'] for row in bearing),'maximumClosureMm':max(row['relativeClosureMm'] for row in bearing),
        'missingGroundContactAreaMm2':result['missingGroundContactAreaMm2'],'fourLComparisonInterfaces':four,
        'maximumUnqualifiedLTieDemandKN':max(row['unqualifiedTieTensionKN'] for row in four),'auxiliaryGaugeMaximumReactionKN_KNmm':result['auxiliaryGaugeMaximumReactionKN_KNmm'],
        'portFrameRigidWorkResidual':result['portFrameRigidWorkResidual'],'additionalGroundCapCuts':result['additionalGroundCapCuts'],
        'candidateAccepted':False,'floorGravityAccepted':False,'completeHouseProof':False}


def compact_baseline(result):
    value={key:data for key,data in result.items() if key not in ('bearings','diagnostics')};owners=sorted({row['ownerId'] for row in result['bearings']});receivers=sorted({row['gridMemberId'] for row in result['bearings']});owner_index={v:i for i,v in enumerate(owners)};receiver_index={v:i for i,v in enumerate(receivers)}
    columns=['xMm','yMm','areaMm2','normalCompressionKN','normalPressureMPa','relativeClosureMm','active','ownerIndex','groundReceiverIndex']
    field=[[row['xyMm'][0],row['xyMm'][1],row['areaMm2'],row['normalCompressionKN'],row['normalPressureMPa'],row['relativeClosureMm'],row['active'],owner_index[row['ownerId']],receiver_index[row['gridMemberId']]] for row in result['bearings']]
    value['normalField']={'columns':columns,'owners':owners,'groundReceivers':receivers,'values':field};return value


def head_delta(a,b):
    before={row['id']:row['reactionKN_KNm'] for row in a['native']['heads']};return max(abs(x-y) for row in b['native']['heads'] for x,y in zip(before[row['id']],row['reactionKN_KNm']))


def proof(source):
    base=numerical_case(source);controls=[('baseline',copy.deepcopy(base))]
    for name in ('mesh700','quadrature2','masonry500','masonry5000','aperture-wider','fresh-GMAX-Q2','opposite-W7','mixed-W35','zero-physicalG'):
        case=copy.deepcopy(base)
        if name=='mesh700':case['maxPitchMm']=700
        if name=='quadrature2':case['bearingQuadratureOrder']=2
        if name=='masonry500':case['bearingLaw']['masonryModulusMPa']=500
        if name=='masonry5000':case['bearingLaw']['masonryModulusMPa']=5000
        if name=='aperture-wider':case['monolithicCase']['houseCase']['joinedCase']['floor']['componentCase']['edits']['floorApertures']=[{'id':'FLOOR-APERTURE/plant-riser','shape':{'kind':'rectangle','boundsXYMm':[9240,4760,9905,5305]}}]
        if name=='fresh-GMAX-Q2':case['monolithicCase']['houseCase']['boundary'].update(physicalGFactor=1.35,includeExternalGMAXQ=True);case['freshUniformLiveKPa']=2
        if name=='opposite-W7':case['monolithicCase']['houseCase']['joinedCase']['floor']['boundaryCase']['windIndex']=7
        if name=='mixed-W35':case['monolithicCase']['houseCase']['joinedCase']['floor']['boundaryCase']['windIndex']=35
        if name=='zero-physicalG':case['monolithicCase']['houseCase']['boundary']['physicalGFactor']=0
        controls.append((name,case))
    summaries=[];baseline=None;svg=None;start=time.time()
    for name,case in controls:
        model=build_vertical_rc_floor(case,source);result=solve_vertical_rc_floor(model,source,'VERTICAL-FLOOR/'+name);summary=summarize(result)
        if baseline is None:baseline=result;svg=draw_vertical_floor(result)
        summary['maximum52HeadComponentDeltaFromBaselineKN_KNm']=head_delta(baseline,result);summaries.append(summary)
        print(name,'elapsed',round(time.time()-start,2),'G',result['mass']['newPlatePhysicalSelfGKN'],'w',summary['maximumPlateDeflectionMm'],'Ltie',summary['maximumUnqualifiedLTieDemandKN'],'headDelta',summary['maximum52HeadComponentDeltaFromBaselineKN_KNm'],flush=True)
        (D/'vertical-rc-floor-checkpoint.json').write_text(json.dumps({'schema':'str-vertical-rc-floor-checkpoint/1','sourceSHA256':source['identities'],'complete':False,'executedCaseCount':len(summaries),'cases':summaries},allow_nan=False)+'\n')
    by_name={row['caseId'].split('/')[-1]:row for row in summaries};mass_delta=by_name['aperture-wider']['mass']['newPlatePhysicalSelfGKN']-summaries[0]['mass']['newPlatePhysicalSelfGKN']
    if abs(mass_delta+.545)>1e-8:raise ValueError('Actualaperturearea/selfG perturbation is not source-controlled')
    if by_name['aperture-wider']['maximum52HeadComponentDeltaFromBaselineKN_KNm']<1e-6:raise ValueError('Actualflooraperture changes no coupledhead response')
    if abs(summaries[0]['mass']['newPlateAreaM2']-98.75938125)>1e-8:raise ValueError('Independent baselineRC/holes/bands/physicalstair union area is inconsistent')
    summary={'schema':'str-vertical-rc-floor-proof/1','sourceSHA256':source['identities'],'proofProducerSHA256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
        'authoredNumericalCase':base,'executedCoupledCaseCount':len(summaries),'executedSourceWindIndices':[7,31,35],'nativeProgrammeSweepClaimed':False,
        'baseline':compact_baseline(baseline),'cases':summaries,'aperturePhysicalSelfGDeltaKN':mass_delta,
        'independentBaselineAreaM2':98.75938125,'baselineSelfGAndFirstMomentsConserved':True,
        'comparisonScope':'RC200knownphysicalsourcevoids/explicitserviceenvelopes+authoredslabbandunion; source0datums, actual52headfinitegrid andclearcore/capnormalcomparison. No wholehousewall/roofgravity or acceptedconstitutivedata. Entireprincipalwetterritorywithheld, not a confirmedarchitecturalhole. Ordinaryarch/headwallcontact+ownG remainunjoined.',
        'floorSvgSHA256':hashlib.sha256(svg.encode()).hexdigest(),'candidateAccepted':False,'floorGravityAccepted':False,'completeHouseProof':False,'waterControlAccepted':False,'thermalAccepted':False,'installedAcceptance':False}
    return summary,svg


if __name__=='__main__':
    if sys.argv[1:]!=['--write']:raise SystemExit('Use --write for actualcoupledRC200gravityproof')
    source=load_vertical_rc_floor_source(D.parents[2]);result,svg=proof(source)
    if source['identities']!=load_vertical_rc_floor_source(D.parents[2])['identities']:raise SystemExit('Sourceschanged; no staleverticalfloorproofwritten')
    (D/'vertical-rc-floor-proof.json').write_text(json.dumps(result,indent=2,allow_nan=False)+'\n');(D/'vertical-rc-floor.svg').write_text(svg)
    (D/'vertical-rc-floor-checkpoint.json').unlink(missing_ok=True)
    print('Actualverticalfloorgravitycontrolscomplete; physical/completehouseacceptancefalse',flush=True)
