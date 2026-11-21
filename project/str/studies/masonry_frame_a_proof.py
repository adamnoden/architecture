"""Fresh joined current-model controls; no stored head reactions are inputs."""
import copy
import hashlib
import json
import math
import os
from pathlib import Path
import sys
import subprocess
import time

from masonry_frame_a import (load_masonry_frame_a_source, reference_masonry_frame_a_case,
    build_masonry_frame_a, finish_masonry_frame_a)
from vertical_rc_floor import solve_vertical_rc_floor
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
    return {'caseId':n['native']['caseId'],'executedRequest':case,'floorLiveLoad':n['floorLiveLoad'],
        'physicalPlateParticipation':{r['id']:r['plateTrace']['physicalPlateParticipation'] for r in result['roofCoupling']['receivers']},
        'changedControls':{'physicalGFactor':house['boundary']['physicalGFactor'],
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


def solve_control(case,source,name):
    model=build_masonry_frame_a(case,source)
    traces=model['verticalFloor']['retainedPointReceivers']
    if len(traces)!=18:raise ValueError('All eighteen actual roof feet must participate in the sole plate')
    for identifier,trace in traces.items():
        audit=trace['physicalPlateParticipation']
        if (not audit['physicalTraceConfirmed'] or not audit['allCoefficientRowsUsedByPhysicalElements']
                or audit['createdScalarCoordinateCount']!=0 or audit['assembledTraceRowMaxAbs']<=0
                or audit['condensedTraceRowMaxAbs']<=0):raise ValueError('Orphan/nonphysical roof receiving trace: '+identifier)
    print(name,'all18 physical plate traces verified before solve',flush=True)
    captured={}
    native=solve_vertical_rc_floor(model,source['vertical'],'MASONRY-FRAME-A/'+name,
        additional_nodal_loads=model['roofFloorCoupling']['additionalNodalLoads'],result_observer=lambda raw:captured.update(raw=raw))
    return finish_masonry_frame_a(model,source,native,captured['raw'])


def file_sha(path):
    digest=hashlib.sha256()
    with Path(path).open('rb') as stream:
        for chunk in iter(lambda:stream.read(1024*1024),b''):digest.update(chunk)
    return digest.hexdigest()


def _atomic_json(path,value):
    path=Path(path);temporary=path.with_name(path.name+'.writing-'+str(os.getpid()))
    with temporary.open('w') as stream:json.dump(value,stream,allow_nan=False);stream.write('\n')
    os.replace(temporary,path)


def _finite_vector(value,size):
    return isinstance(value,list) and len(value)==size and all(type(v) in (int,float) and math.isfinite(v) for v in value)


def validate_full_capture(result,case,source,name):
    """Validate the actual49-source response before publishing or reusing it."""
    if (len(source['identities'])!=49 or result.get('schema')!='str-masonry-frame-a-result/1'
            or result.get('sourceSHA256')!=source['identities'] or result.get('request')!=case):
        raise ValueError('Captured control is not the exact49-source actual request')
    n=result.get('nativeVertical',{});native=n.get('native',{})
    if (n.get('sourceSHA256')!=source['identities'] or native.get('sourceSHA256')!=source['identities']
            or native.get('request')!=case or native.get('caseId')!='MASONRY-FRAME-A/'+name):
        raise ValueError('Captured native source/request/control name differs')
    for owner in (result,native):
        if any(owner.get(key) is not False for key in ('candidateAccepted','completeHouseProof','installedAcceptance')):
            raise ValueError('Captured control invents physical/complete-house acceptance')
    heads=native.get('heads',[]);positions=n.get('headPositions',[])
    grid=source['vertical']['parent']['house']['joined']['floor']['successor']['values']['current-house-grid']
    actual_positions={r['id']:[*r['xy'],r['capZ'][0]] for r in grid['heads']}
    if (len(heads)!=52 or len(positions)!=52 or len({r.get('id') for r in heads})!=52
            or {r.get('id') for r in heads}!=set(actual_positions)
            or {r.get('id') for r in heads}!={r.get('id') for r in positions}
            or any(r.get('xyzMm')!=actual_positions.get(r.get('id')) for r in positions)
            or any(not _finite_vector(r.get('reactionKN_KNm'),6) for r in heads)
            or any(not _finite_vector(r.get('xyzMm'),3) for r in positions)
            or not _finite_vector(native.get('externalWrenchKN_KNm'),6)):
        raise ValueError('Captured control lost the actual52 finite physical head wrenches')
    _audit_head_wrench({'headWrenches':heads,'headPositions':positions,
        'externalWrenchKN_KNm':native['externalWrenchKN_KNm']})
    receivers=result.get('roofCoupling',{}).get('receivers',[])
    if (len(receivers)!=18 or len({r.get('id') for r in receivers})!=18
            or {r.get('id') for r in receivers}!=set(case['roofCoupling']['intermediateSupportLaws'])):
        raise ValueError('Captured control must retain eighteen distinct physical receivers')
    for row in receivers:
        audit=row.get('plateTrace',{}).get('physicalPlateParticipation',{})
        if (row.get('physicalAcceptance') is not False or audit.get('physicalTraceConfirmed') is not True
                or audit.get('allCoefficientRowsUsedByPhysicalElements') is not True
                or audit.get('createdScalarCoordinateCount')!=0
                or not all(type(audit.get(k)) in (int,float) and math.isfinite(audit[k]) and audit[k]>0
                    for k in ('assembledTraceRowMaxAbs','condensedTraceRowMaxAbs'))):
            raise ValueError('Captured control contains a nonphysical receiving trace')
    return result


def _capture_paths(source,case,name,root=Path('/tmp/ovid-masonry-frame-controls')):
    if not isinstance(name,str) or not name or any(c not in 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_' for c in name):
        raise ValueError('Stable bounded masonry control name required')
    source_id=hashlib.sha256(json.dumps(source['identities'],sort_keys=True,separators=(',',':')).encode()).hexdigest()
    request_id=hashlib.sha256(json.dumps({'name':name,'request':case},sort_keys=True,separators=(',',':'),allow_nan=False).encode()).hexdigest()
    directory=Path(root)/source_id/(name+'-'+request_id);directory.mkdir(parents=True,exist_ok=True)
    request=directory/'request.json';full=directory/'response.json';manifest=directory/'capture.json'
    if request.exists() and json.loads(request.read_text())!=case:
        raise ValueError('Stored capture request changed; preserve it instead of overwriting')
    if not request.exists():_atomic_json(request,case)
    return request,full,manifest


def read_capture(full,manifest,case,source,name):
    full=Path(full);manifest=Path(manifest)
    if not full.exists() and not manifest.exists():return None
    receipt=None
    if manifest.exists():
        receipt=json.loads(manifest.read_text())
        if (receipt.get('schema')!='str-masonry-full-control-capture/1'
                or receipt.get('sourceSHA256')!=source['identities'] or receipt.get('request')!=case
                or receipt.get('nativeCaseId')!='MASONRY-FRAME-A/'+name):
            raise ValueError('Stored masonry capture has stale or different controlling inputs; preserve it')
    if not full.exists():return None
    if receipt is not None and receipt.get('fullResultSHA256')!=file_sha(full):
        raise ValueError('Stored masonry full-result checksum mismatch; preserve it')
    result=validate_full_capture(json.loads(full.read_text()),case,source,name)
    # A valid unpaired full response is preserved, but is not silently reused
    # without its checksum receipt; the absent control must execute again.
    return result if receipt is not None else None


def publish_capture(result,full,manifest,case,source,name):
    validate_full_capture(result,case,source,name)
    full=Path(full);manifest=Path(manifest)
    # An interruption can leave just one atomically written artifact. Keep that
    # artifact under its content identity before recomputing the unpaired state.
    for path in (full,manifest):
        if path.exists():
            preserved=path.with_name(path.name+'.previous-'+file_sha(path))
            if not preserved.exists():os.replace(path,preserved)
    _atomic_json(full,result)
    receipt={'schema':'str-masonry-full-control-capture/1','sourceSHA256':source['identities'],
        'request':case,'nativeCaseId':'MASONRY-FRAME-A/'+name,'fullResultSHA256':file_sha(full)}
    _atomic_json(manifest,receipt)
    return receipt


def obtain_control(case,source,name,baseline_capture=None):
    request,full,manifest=_capture_paths(source,case,name)
    supplied=None
    if baseline_capture is not None:
        supplied=validate_full_capture(json.loads(Path(baseline_capture).read_text()),case,source,name)
    cached=read_capture(full,manifest,case,source,name)
    if cached is not None:
        print(name,'reused verified exact-source/request/checksum full capture',flush=True)
        return cached,file_sha(full)
    if supplied is not None:
        publish_capture(supplied,full,manifest,case,source,name)
        print(name,'recovered verified actual baseline capture',flush=True)
        return supplied,file_sha(full)
    # Each successful control publishes its response and manifest before the
    # next subprocess starts. A killed later control cannot erase its peers.
    subprocess.run([sys.executable,'-B',str(Path(__file__).resolve()),'--capture-control',name,
        str(request),str(full),str(manifest)],check=True)
    result=read_capture(full,manifest,case,source,name)
    if result is None:raise ValueError('Masonry worker returned without a complete captured control')
    return result,file_sha(full)


def proof(source,baseline_capture=None):
    start=time.time();base=numerical_case(source);controls=[('baseline',base)]
    aperture=copy.deepcopy(base)
    aperture['verticalCase']['monolithicCase']['houseCase']['joinedCase']['floor']['componentCase']['edits']['floorApertures']=[{'id':'FLOOR-APERTURE/plant-riser','shape':{'kind':'rectangle','boundsXYMm':[9240,4760,9905,5305]}}]
    controls.append(('aperture-wider',aperture))
    roof_edit=copy.deepcopy(base);roof_edit['roofCoupling']['ringPlanEIRatio']=.5;controls.append(('roof-ring-EI-half',roof_edit))
    court=copy.deepcopy(base);court['verticalCase']['monolithicCase']['houseCase']['joinedCase']['floor']['boundaryCase']['windIndex']=79;controls.append(('roof-court-W79',court))
    adverse=copy.deepcopy(base);adverse['verticalCase']['monolithicCase']['houseCase']['boundary']['physicalGFactor']=0.;controls.append(('zero-physical-G',adverse))
    live=copy.deepcopy(base);live['verticalCase']['freshUniformLiveKPa']=2.;controls.append(('net-floor-Q2',live))
    from roof_floor_compatibility import load_roof_only_source,_scope
    from roof_surface_pressure import reference_roof_surface_pressure_settings
    scope,_=_scope(load_roof_only_source(source['root']))
    suction=copy.deepcopy(base);pressure=reference_roof_surface_pressure_settings({'scope':scope});pressure['uniformKPa']=-2.25
    suction['roofCoupling']['roofSurfacePressure']=pressure;controls.append(('roof-plan-uniform-minus2p25',suction))
    controls.append(('restored',copy.deepcopy(base)))
    summaries=[];baseline=None;captures={}
    for name,case in controls:
        result,captures[name]=obtain_control(case,source,name,baseline_capture if name=='baseline' else None)
        if baseline is None:
            baseline=result
            _atomic_json(Path('/tmp/masonry48-baseline-full.json'),result)
        summary=summarize(result);summary['maximum52HeadComponentDeltaFromBaselineKN_KNm']=head_delta(baseline,result)
        summary['independentlySummedHeadWrenchKN_KNm']=_audit_head_wrench(summary);summaries.append(summary)
        print(name,'elapsed',round(time.time()-start,2),'minHead',summary['minimumHeadVerticalKN'],'headDelta',summary['maximum52HeadComponentDeltaFromBaselineKN_KNm'],flush=True)
    if abs(summaries[1]['mass']['newPlatePhysicalSelfGKN']-summaries[0]['mass']['newPlatePhysicalSelfGKN']+.545)>1e-8:raise ValueError('Actual sole-floor aperture material change missing')
    if summaries[1]['maximum52HeadComponentDeltaFromBaselineKN_KNm']<1e-6:raise ValueError('Aperture mutation did not propagate through actual compatible52head response')
    if summaries[2]['maximum52HeadComponentDeltaFromBaselineKN_KNm']<1e-6:raise ValueError('Roof stiffness mutation did not propagate to actual floor/52head response')
    for key in ('RCPostVolumeM3','masonryPhysicalGKN','newPlatePhysicalSelfGKN','newPlateAreaM2','referenceStructuralShellPhysicalGKN','foundationPhysicalGKN','cornerClosurePhysicalGKN','lowerLPhysicalGKN','lowerCorePhysicalGKN','roofAddedPhysicalGKN','joinedPhysicalGKN'):
        if abs(summaries[0]['mass'][key]-summaries[2]['mass'][key])>1e-8:raise ValueError('Roof stiffness-only edit changed physical inventory: '+key)
    if summaries[-1]['maximum52HeadComponentDeltaFromBaselineKN_KNm']>1e-6:raise ValueError('Restored full case failed to reproduce actual all-head response')
    for index,load_key,wrench_key in ((5,'floorLiveLoad','appliedWrenchKN_KNm'),(6,'roofCoupling','pressureWrenchKN_KNm')):
        changed=summaries[index];ledger=changed[load_key] if index==5 else changed[load_key]['roofSurfacePressure']
        delta=[a-b for a,b in zip(changed['externalWrenchKN_KNm'],summaries[0]['externalWrenchKN_KNm'])]
        if max(abs(a-b) for a,b in zip(delta,ledger[wrench_key]))>1e-6:raise ValueError('Independent added-load six-wrench delta fails: '+changed['caseId'])
        if abs(changed['mass']['joinedPhysicalGKN']-summaries[0]['mass']['joinedPhysicalGKN'])>1e-8:raise ValueError('Q/roof pressure changed physical mass')
    live=summaries[5]['floorLiveLoad']
    if abs(live['appliedQKN']-1.5*2*live['actualNetPlateAreaM2'])>1e-8:raise ValueError('Independent actual-net-area Q2 application missing')
    if summaries[0]['missingGroundContactAreaMm2']>1e-8:raise ValueError('Authored formed court corner did not close actual missing normal route')
    kept={k:baseline[k] for k in ('schema','sourceSHA256','geometry','mass','foundationWeight','courtCornerClosure','masonryCourses','loadIntroduction','lowerLWeight','lowerCoreBodies','lowerCoreResponse')}
    kept['request']=base
    kept['straightFrameCage']={**cage_summary(baseline['straightFrameCage']),'sectionScreens':baseline['straightFrameCage']['sectionScreens']}
    kept['roofCoupling']={k:v for k,v in baseline['roofCoupling'].items() if k!='roofSvg'}
    kept['plateBending']={k:v for k,v in baseline['plateBending'].items() if k!='cells'}
    n=baseline['nativeVertical']
    kept['nativeVertical']={'schema':n['schema'],'sourceSHA256':n['sourceSHA256'],'parentVerticalMethodSchema':n['parentVerticalMethodSchema'],
        'missingGroundContactAreaMm2':n['missingGroundContactAreaMm2'],'normalCoreCount':len(n['normalCoreGeometry']),'floorLiveLoad':n['floorLiveLoad'],
        'native':{k:n['native'][k] for k in ('schema','sourceSHA256','caseId','heads','equilibriumResidualKN_KNm','memberCuts','capCuts','adjacentGridMemberCuts','maximumFrameTranslationMm','energyRelativeResidual')},
        'plate':{'cellCount':n['plate']['cellCount'],'maximumDeflectionMm':n['plate']['physicalRecovery']['maximumDeflectionMm'],
            'workRelativeResidual':n['plate']['physicalRecovery']['workRelativeResidual']}}
    output={'schema':'str-masonry-frame-a-proof/1','sourceSHA256':source['identities'],
        'proofProducerSHA256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
        'authoredNumericalCase':base,'executedCoupledCaseCount':len(summaries),'baseline':kept,'cases':summaries,
        'fullResultCaptureSHA256ByCase':captures,
        'fullCaptureScope':'Persistent exact-source/request/name/checksum-verified actual full controls; absent controls recompute and incomplete artifacts remain preserved.',
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
    source=load_masonry_frame_a_source(D.parents[2])
    if len(sys.argv) in (5,6) and sys.argv[1] in ('--solve-control','--capture-control'):
        if (sys.argv[1]=='--solve-control')!=(len(sys.argv)==5):raise SystemExit('Exact control output arguments required')
        case=json.loads(Path(sys.argv[3]).read_text());result=solve_control(case,source,sys.argv[2])
        if source['identities']!=load_masonry_frame_a_source(D.parents[2])['identities']:raise SystemExit('Source changed while solving; stale control not written')
        if sys.argv[1]=='--capture-control':publish_capture(result,sys.argv[4],sys.argv[5],case,source,sys.argv[2])
        else:_atomic_json(Path(sys.argv[4]),result)
        raise SystemExit(0)
    if sys.argv[1:]!=['--write'] and not (len(sys.argv)==4 and sys.argv[1:3]==['--write','--baseline-capture']):raise SystemExit('Use --write [--baseline-capture exact-result.json] for source-bound joined controls')
    result,drawings=proof(source,sys.argv[3] if len(sys.argv)==4 else None)
    if source['identities']!=load_masonry_frame_a_source(D.parents[2])['identities']:raise SystemExit('Source changed while solving; stale proof not written')
    (D/'masonry-frame-a-proof.json').write_text(json.dumps(result,indent=2,allow_nan=False)+'\n')
    for name,svg in drawings.items():(D/name).write_text(svg)
    print('Eight actual compatible states; all installed/complete-house gates remain false',flush=True)
