"""Current-source actual section edits, matched load controls and reversal."""
import copy
import hashlib
import os
import json
from pathlib import Path
import subprocess
import sys
import tempfile

from floor_section_model import load_source, reference_case, run

D=Path(__file__).resolve().parent
PROOF=D/'floor-section-proof.json'


def cases(source):
    base=reference_case(source)
    heavy=copy.deepcopy(base);b=heavy['bearingCase']['masonryCase'];v=b['verticalCase']
    v['freshUniformLiveKPa']=2.;v['plateLaw']['unitWeightKNPerM3']=27.
    v['monolithicCase']['houseCase']['boundary']['physicalGFactor']=1.35
    b['floorReinforcement'].update(barDiameterMm=16.,pitchMm=80.)
    deep=copy.deepcopy(heavy);deep['thicknessMm']=250.
    from seated_wet_support import reference_support
    h=json.loads((source['root']/'project/had/studies/water-replan.json').read_text())['model']
    wet=copy.deepcopy(heavy);wet['wetSupport']=reference_support(h)
    shifted=copy.deepcopy(wet);shifted['wetSupport']['padCentreOffsetsYMm'][0]=160.
    refined=copy.deepcopy(shifted);refined['wetSupport']['bearingQuadratureOrder']=8
    adverse=copy.deepcopy(refined);adverse['bearingCase']['masonryCase']['verticalCase']['monolithicCase']['houseCase']['boundary']['physicalGFactor']=0.
    adverse['bearingCase']['masonryCase']['verticalCase']['freshUniformLiveKPa']=0.
    from roof_floor_compatibility import load_roof_only_source,_scope
    from roof_surface_pressure import reference_roof_surface_pressure_settings
    scope,_=_scope(load_roof_only_source(source['root']));pressure=reference_roof_surface_pressure_settings({'scope':scope});pressure['uniformKPa']=-2.25
    adverse['bearingCase']['roofControls']['roofSurfacePressure']=pressure
    roof3=copy.deepcopy(refined);roof3_pressure=copy.deepcopy(pressure);roof3_pressure['uniformKPa']=3.
    roof3['bearingCase']['roofControls']['roofSurfacePressure']=roof3_pressure
    aligned8=copy.deepcopy(wet);aligned8['wetSupport']['bearingQuadratureOrder']=8
    concrete27=copy.deepcopy(aligned8);concrete27['wetSupport']['concreteUnitWeightKNPerM3']=27.
    return [('current200',base),('matched200-G135-Q2-rho27',heavy),('matched250-G135-Q2-rho27',deep),
        ('wet-aligned-G135-Q2-rho27',wet),('wet-south-pad-north160',shifted),('wet-shifted-quadrature8',refined),('wet-zeroG-roof-suction',adverse),('wet-heavy-roof3',roof3),('wet-aligned-quadrature8',aligned8),('wet-aligned-concrete27',concrete27),('restored200',copy.deepcopy(base))]


def summarize(result):
    native=result['nativeVertical']['native'];positions={r['id']:r['xyzMm'] for r in result['nativeVertical']['headPositions']};total=[0.]*6
    for row in native['heads']:
        x,y,z=positions[row['id']];fx,fy,fz,mx,my,mz=row['reactionKN_KNm']
        for i,v in enumerate((fx,fy,fz,mx+(y*fz-z*fy)/1000,my+(z*fx-x*fz)/1000,mz+(x*fy-y*fx)/1000)):total[i]+=v
    residual=[a+b for a,b in zip(total,native['externalWrenchKN_KNm'])]
    return {'executedRequest':result['request'],'sourceSHA256':result['sourceSHA256'],'nativeCaseId':native['caseId'],'heads':native['heads'],
        'independent52HeadBalanceResidualKN_KNm':residual,'floorSection':result['floorSection'],'mass':result['mass'],
        'momentInspectionKNmPerM':result['plateBending']['maximumAbsoluteBendingPlusTwistingKNmPerM'],
        'governing':result['plateBending']['governing'],'necessaryStrainCompatibleSection':result['floorReinforcement']['necessaryStrainCompatibleSection'],
        'physicalRecovery':{k:v for k,v in result['nativeVertical']['plate']['physicalRecovery'].items() if k!='points'},
        **({'seatedWetSupport':result['seatedWetSupport']} if 'seatedWetSupport' in result else {}),
        'candidateAccepted':False,'completeHouseProof':False,'localStressConvergenceProven':False}


def check(proof,source):
    if proof['schema']!='str-coupled-floor-section-proof/1' or proof['sourceSHA256']!=source['identities']:raise ValueError('Stale floor-section evidence')
    rows=proof['controls'];expected=cases(source)
    if len(rows)!=len(expected):raise ValueError('Missing matched/actual support/offset/quadrature/adverse/reversal native states')
    for row,(name,request) in zip(rows,expected):
        if row['executedRequest']!=request or row['sourceSHA256']!=source['identities'] or row['nativeCaseId']!=name:raise ValueError('Evidence does not execute actual current section inputs')
        if len(row['heads'])!=52 or len({h['id'] for h in row['heads']})!=52:raise ValueError('Not the actual52physicalheads')
        if max(abs(v) for v in row['independent52HeadBalanceResidualKN_KNm'])>1e-5:raise ValueError('Global source wrench lost')
        for key in ('sourceGravityResidualKN_KNm','sourcePressureResidualKN_KNm','sourceUpperMaterialResidualKN_KNm'):
            if max(abs(v) for v in row['floorSection'][key])>1e-6:raise ValueError('Section edit loses physical source work/load transfer')
        if row['candidateAccepted'] or row['completeHouseProof'] or row['localStressConvergenceProven']:raise ValueError('Unearned section acceptance')
    for row in (r for r in rows if r['executedRequest']['wetSupport'] is not None):
        support=row.get('seatedWetSupport')
        if support is None or support['physicalAcceptance'] or support['momentFixityAtBearingsCredited'] or support['frictionOrHorizontalBearingRestraintCredited']:raise ValueError('Actual seated mechanics missing or unearned frame/retention acceptance')
        if max(abs(v) for v in support['sourceMaterialWrenchResidualKN_KNm'])>1e-6 or max(abs(v) for v in support['liveLoad']['wrenchResidualKN_KNm'])>1e-6:raise ValueError('Actual support G/Q source wrench lost')
        if row['floorSection']['finishStairServiceEvidenceApplicable']:raise ValueError('Support edit silently preserves old finish/stair/service evidence')
        audit=support.get('plateAttachmentAudit',{})
        if not audit.get('allPlateAttachmentsAtRealBeamNodes') or audit.get('missingAttachmentCoordinatesYMm') or not audit.get('physicalBeamElementCutsAvailable') or audit.get('completePhysicalBeamDemandEnvelopeAvailable') is not False:
            raise ValueError('Wet beam cut recovery lacks actual common nodal attachments or invents a complete load envelope')
        grid=support.get('receivingGridCuts',{})
        if grid.get('completePhysicalGridDemandEnvelopeAvailable') is not False or grid.get('candidateAccepted') is not False:
            raise ValueError('Receiving grid recovery loses its incomplete-envelope boundary')
        if grid.get('physicalElementCutsAvailable'):
            # This count covers raw node-residual wrench entries, including free nodes;
            # the52 physical foundation heads are independently checked above.
            raw_count=grid.get('nativeSupportReactionCountUnchanged')
            if grid.get('gridResistanceAccepted') is not False or not grid.get('nativeSupportReactionsUnchanged') or type(raw_count) is not int or raw_count<52:
                raise ValueError('Receiving grid invents resistance or changes actual support reactions')
        elif grid.get('memberCuts') or grid.get('interiorMemberCuts') or not grid.get('diagnostics'):
            raise ValueError('Unclosed grid recovery emitted unsupported physical cuts')
        if any(c['normalCompressionKN'] < -1e-7 for c in support['contactFibres']):raise ValueError('Wet pad carried tension')
    by_name={r['nativeCaseId']:r for r in rows}
    light,heavy=by_name['wet-aligned-quadrature8'],by_name['wet-aligned-concrete27']
    support=light['seatedWetSupport'];setting=support['settings']
    volume=setting['beamWidthMm']*setting['beamDepthMm']*(setting['beamNorthEndYMm']-setting['beamSouthEndYMm'])/1e9
    volume+=sum((p['rectangleXYMm'][2]-p['rectangleXYMm'][0])*(p['rectangleXYMm'][3]-p['rectangleXYMm'][1])*(p['physicalTopZMm']-p['physicalBottomZMm'])/1e9 for p in support['posts'])
    expected_delta=2*volume
    actual_delta=heavy['mass']['joinedPhysicalGKN']-light['mass']['joinedPhysicalGKN']
    if abs(actual_delta-expected_delta)>1e-6:raise ValueError('Wet concrete mass edit did not change actual complete beam/post source volume once')
    proof['wetConcrete25To27CharacteristicGDeltaKN']=actual_delta
    proof['wetConcrete25To27GeometryVolumeM3']=volume
    p4={h['id']:h['reactionKN_KNm'] for h in rows[4]['heads']}
    difference=max(abs(a-b) for h in rows[5]['heads'] for a,b in zip(h['reactionKN_KNm'],p4[h['id']]))
    proof['wetBearing4To8Maximum312ComponentDifferenceKN_KNm']=difference
    proof['wetBearing4To8RawFloorPeakDifferenceKNmPerM']=abs(rows[5]['momentInspectionKNmPerM']-rows[4]['momentInspectionKNmPerM'])
    if difference>.1 or proof['wetBearing4To8RawFloorPeakDifferenceKNmPerM']>.1:raise ValueError('Wet bearing quadrature4/8 fails predeclared0.1globalresponse comparison; refine without acceptance')
    old={h['id']:h['reactionKN_KNm'] for h in rows[0]['heads']}
    for row in rows:
        row['maximum52HeadComponentDeltaFromBaseline']=max(abs(a-b) for h in row['heads'] for a,b in zip(h['reactionKN_KNm'],old[h['id']]))
    if rows[-1]['maximum52HeadComponentDeltaFromBaseline']>1e-6:raise ValueError('Real section reversal failed')
    if rows[2]['maximum52HeadComponentDeltaFromBaseline']<1e-5 or rows[1]['heads']==rows[2]['heads']:raise ValueError('Actual section edit did not change coupled52headresponse')
    a,b=rows[1]['floorSection'],rows[2]['floorSection']
    if abs(b['plateSelfGKN']/a['plateSelfGKN']-1.25)>1e-10 or b['midplaneZMm']!=3295 or b['topZMm']!=3420:raise ValueError('Thickness edit did not change actual mass/datums')
    if a['steelChordAxialRigidityKN']!=b['steelChordAxialRigidityKN']:raise ValueError('Concrete thickness improperly changes independently authored steel chord')
    if b['remainingSourceFinishDepthMm']!=30 or b['finishStairServiceEvidenceApplicable']:raise ValueError('Unadopted finish/stair/services silently retained')
    old_proof=json.loads((D/'upper-roof-bearing-proof.json').read_text())
    if old_proof['sourceSHA256']!=source['bearing']['identities']:raise ValueError('Baseline upper-bearing receipt is stale')
    predecessor={h['id']:h['reactionKN_KNm'] for h in old_proof['controls'][0]['heads']}
    proof['baselineMaximum312ComponentDifferenceFromCurrent52Source']=max(abs(a-b) for h in rows[0]['heads'] for a,b in zip(h['reactionKN_KNm'],predecessor[h['id']]))
    if proof['baselineMaximum312ComponentDifferenceFromCurrent52Source']>1e-6:raise ValueError('RC200 no longer reproduces existing current method')
    return proof


def file_sha(path):
    digest=hashlib.sha256()
    with Path(path).open('rb') as stream:
        for chunk in iter(lambda:stream.read(1024*1024),b''):digest.update(chunk)
    return digest.hexdigest()


def validate_full(result,case,source,name):
    if result['sourceSHA256']!=source['identities'] or result['request']!=case or result['nativeVertical']['native']['caseId']!=name:
        raise ValueError('Capture source/request/native identity differs from actual current control')
    summary=summarize(result)
    if len(summary['heads'])!=52 or len({h['id'] for h in summary['heads']})!=52:raise ValueError('Capture lost actual52heads')
    if max(abs(v) for v in summary['independent52HeadBalanceResidualKN_KNm'])>1e-5:raise ValueError('Capture fails independent all-head equilibrium')
    for key in ('sourceGravityResidualKN_KNm','sourcePressureResidualKN_KNm','sourceUpperMaterialResidualKN_KNm'):
        if max(abs(v) for v in summary['floorSection'][key])>1e-6:raise ValueError('Capture lost source wrench')
    if result['candidateAccepted'] or result['completeHouseProof']:raise ValueError('Capture fabricated acceptance')
    if not result['drawings']['floor-section-floor.svg'].startswith('<svg'):raise ValueError('Capture missing actual result drawing')
    return summary


def capture(name,request,full_path,manifest_path,verify=False):
    source=load_source(D.parents[2]);case=json.loads(Path(request).read_text());full_path=Path(full_path);manifest_path=Path(manifest_path)
    if verify:
        manifest=json.loads(manifest_path.read_text())
        if manifest['schema']!='str-full-native-control-capture/1' or manifest['sourceSHA256']!=source['identities'] or manifest['request']!=case or manifest['nativeCaseId']!=name:
            raise ValueError('Existing full capture has stale or different controlling inputs')
        if manifest['fullResultSHA256']!=file_sha(full_path):raise ValueError('Existing full capture checksum mismatch')
        with full_path.open() as stream:result=json.load(stream)
        summary=validate_full(result,case,source,name)
        if manifest['summary']!=summary or manifest['drawings']!=result['drawings']:raise ValueError('Capture summary/drawing differs from full actual result')
        return
    result=run(case,source,name);summary=validate_full(result,case,source,name)
    temporary=full_path.with_suffix('.writing.json')
    with temporary.open('w') as stream:json.dump(result,stream,allow_nan=False)
    os.replace(temporary,full_path)
    manifest={'schema':'str-full-native-control-capture/1','nativeCaseId':name,'sourceSHA256':source['identities'],'request':case,
        'fullResultSHA256':file_sha(full_path),'summary':summary,'drawings':result['drawings']}
    temporary=manifest_path.with_suffix('.writing.json');temporary.write_text(json.dumps(manifest,allow_nan=False));os.replace(temporary,manifest_path)


def write():
    source=load_source(D.parents[2]);rows=[];capture_receipts={}
    identity=hashlib.sha256(json.dumps(source['identities'],sort_keys=True).encode()).hexdigest()
    directory=Path('/tmp/ovid-seated-wet-controls')/identity;directory.mkdir(parents=True,exist_ok=True)
    for name,case in cases(source):
        input_identity=hashlib.sha256(json.dumps({'caseId':name,'request':case},sort_keys=True).encode()).hexdigest()
        case_directory=directory/(name+'-'+input_identity);case_directory.mkdir(parents=True,exist_ok=True)
        request=case_directory/'request.json';full=case_directory/'result.full.json';manifest=case_directory/'capture.json'
        if request.exists() and json.loads(request.read_text())!=case:raise ValueError('Stored control request changed within source identity; do not overwrite or reuse')
        request.write_text(json.dumps(case,allow_nan=False))
        reused=full.exists() and manifest.exists()
        command='--verify-capture' if reused else '--capture'
        subprocess.run([sys.executable,'-B',str(Path(__file__)),command,name,str(request),str(full),str(manifest)],check=True)
        saved=json.loads(manifest.read_text());rows.append(saved['summary']);capture_receipts[name]=saved['fullResultSHA256']
        print(name,'reused-verified-full-capture' if reused else 'executed-new-full-capture','moment',rows[-1]['momentInspectionKNmPerM'],'checksum',saved['fullResultSHA256'],flush=True)
        if case['thicknessMm']==250.:(D/'floor-section-250.svg').write_text(saved['drawings']['floor-section-floor.svg'])
        if name=='wet-shifted-quadrature8':(D/'seated-wet-support-floor.svg').write_text(saved['drawings']['floor-section-floor.svg'])
        del saved
    proof=check({'schema':'str-coupled-floor-section-proof/1','sourceSHA256':source['identities'],'controls':rows,
        'fullCaptureSourceIdentityDigest':identity,'fullResultCaptureSHA256ByCase':capture_receipts,
        'fullCaptureScope':'Complete native responses are retained separately during execution for recovery. This canonical receipt retains complete authored inputs, source identities, actual52head values, source-wrench/contact/reversal checks and full-response checksums; rerun the same source-bound native method for complete fields.',
        'executionFailureHistory':['Initial uncheckpointed run completed5states, then quadrature8worker was SIGKILLed; no partial proof was promoted. Driver now keeps complete source/request/checksum-bound captures; failed state must execute.']},source)
    PROOF.write_text(json.dumps(proof,indent=2,allow_nan=False)+'\n')


if __name__=='__main__':
    if sys.argv[1:]==['--write']:write()
    elif sys.argv[1:]==['--check']:check(json.loads(PROOF.read_text()),load_source(D.parents[2]))
    elif sys.argv[1] in ('--capture','--verify-capture'):
        capture(sys.argv[2],sys.argv[3],sys.argv[4],sys.argv[5],verify=sys.argv[1]=='--verify-capture')
    elif sys.argv[1]=='--solve':
        result=run(json.loads(Path(sys.argv[3]).read_text()),load_source(D.parents[2]),sys.argv[2])
        with Path(sys.argv[4]).open('w') as stream:json.dump(result,stream,allow_nan=False)
    else:raise SystemExit('Use --write or --check')
