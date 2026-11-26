"""Bounded signed development proof from an authenticated saved-chain W31 case.

Ordinary compiler admission remains mandatory in the ordinary prepare mode.
This alternate authority preserves the old admitted document and records the
exact two-method source transition and sole zero-extra-EA physical edit.
"""
import argparse,copy,gzip,hashlib,io,json,subprocess,zipfile
from contextlib import contextmanager
from pathlib import Path
METHOD='project/str/studies/rear_bearing_signed_development.py'
ARCHIVE_SHA='60f76154729357dc9e6c71eaebe6c7f3fe1d5ca0cdfe0ffeb1865863b16f3a07'
ORIGINAL_SHA='6c15eec478a617d16efa52c2f2ceed61737c3205a4cad4c711132615e4516ae5'
DOCUMENT='proof-input/rear-development-document.json'
def sha(path):return hashlib.sha256(Path(path).read_bytes()).hexdigest()
def read(path):return json.loads(Path(path).read_text())
def write(path,value):
    p=Path(path);p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(value,allow_nan=False))
def restore_sources(folder):
    from rear_bearing_zero_pair import SOURCE
    for path,(old_git_blob,new_sha) in SOURCE.items():
        source=Path(folder)/('new-'+Path(path).name)
        if sha(source)!=new_sha:raise ValueError('Exact authorised native source transition evidence required')
        committed=subprocess.check_output(['git','show','HEAD:'+path])
        if sha(path)!=new_sha or hashlib.sha256(committed).hexdigest()!=new_sha:
            raise ValueError('Immutable executed tree must contain the exact two approved native methods')
def admit_development_source(packet):
    import current_finite_joint_signed_proof as signed
    from rear_bearing_zero_pair import SOURCE,floor
    a=packet['developmentAuthority']
    if packet['documentPath']!=DOCUMENT:raise ValueError('Exact development snapshot path required')
    document=read(packet['documentPath'])
    if (a.get('schema')!='str-rear-signed-development-authority/1' or a.get('actualW31ArtifactId')!=15129761196
        or a.get('actualW31ArchiveSHA256')!=ARCHIVE_SHA or a.get('originalFullCLIArchiveSHA256')!=ORIGINAL_SHA
        or a.get('helperSHA256')!=sha(METHOD) or packet.get('currentSavedEngineeringDocumentAdmitted') is not False
        or packet.get('documentIdentity') is not None or a.get('usedAsAssemblyForces') is not False):
        raise ValueError('Exact counterfactual parent authority required; ordinary compiler admission is not inferred')
    for label,value,key in (('native-case',packet['nativeCase'],'nativeInputSHA256'),('settings',packet['settings'],'finiteSettingsSHA256'),('rear-choices',packet['rearChoices'],'rearChoicesSHA256')):
        if signed.digest(value)!=a[key]:raise ValueError('Authenticated development seed changed: '+label)
    if packet['documentSnapshotSHA256']!=a['savedDocumentSHA256'] or packet['controllingChoicesSHA256']!=a['controllingChoicesSHA256']:
        raise ValueError('Authenticated saved source document changed')
    if (floor(packet['nativeCase'])['boundaryCase']['windIndex']!=31 or floor(packet['nativeCase'])['edgeBand']['axialRigidityKN']!=0.
        or document['stages']['distributedFloor']['boundaryCase']['windIndex']!=31
        or document['stages']['distributedFloor']['edgeBand']['axialRigidityKN']!=0.
        or document['stages']['floorSection']['rearBearingComparison']!=packet['rearChoices']):
        raise ValueError('Exact saved zero-EA rear W31 source controls required')
    finite=document['stages']['floorSection']['finiteJointComparison']
    if finite!={**packet['settings'],'execution':'deferred'}:raise ValueError('Saved enabled finite reference controls changed')
    changes=a['nativeSourceTransition']
    if len(changes)!=2 or {r['path'] for r in changes}!=set(SOURCE) or any(r['oldGitBlob']!=SOURCE[r['path']][0] or r['newSHA256']!=SOURCE[r['path']][1] or packet['sourceSHA256'][r['path']]!=r['newSHA256'] for r in changes):
        raise ValueError('Development source transition exceeded exact two authorised methods')
def prepare(args):
    import current_finite_joint_signed_proof as signed
    from rear_bearing_zero_pair import source_rebind,floor,SOURCE
    folder=Path(args.development_folder);archive=folder/'retained-rear-W31.zip';out=Path(args.out)
    if sha(archive)!=ARCHIVE_SHA:raise ValueError('Exact retained complete rear W31 archive checksum differs')
    with zipfile.ZipFile(archive) as z:
        needed=['zero-W31-paired-input.json','zero-rear-W31-native.json','zero-rear-raw-checkpoint.json',
            'zero-seated-W31-native.json','seated-interface-diagnostic.json','rear-interface-diagnostic.json',
            'zero-rear-W31-document.json','retained-W31.zip','seated-reference-provenance.json',
            'new-distributed_floor_compatibility.py','new-perforated_floor_condensation.py']
        for name in needed:
            if z.namelist().count(name)!=1:raise ValueError('Exactly one actual source-bound parent archive member required: '+name)
            (folder/name).write_bytes(z.read(name))
    if sha(folder/'retained-W31.zip')!=ORIGINAL_SHA:raise ValueError('Original admitted full-CLI source archive differs')
    with zipfile.ZipFile(folder/'retained-W31.zip') as z:
        original_bundle=json.loads(z.read('parent-W31-bundle.json'));original_document=json.loads(z.read('parent-W31-document.json'))
    old_comp=original_bundle['engineering']['floorSection']['finiteJointComparison']
    if old_comp['status']!='computed-unselected-comparison':raise ValueError('Original actual full-CLI W31 source request required')
    old_case=old_comp['request']['nativeCase'];parent=read(folder/'zero-W31-paired-input.json')
    result=read(folder/'zero-rear-W31-native.json');checkpoint=read(folder/'zero-rear-raw-checkpoint.json');document=read(folder/'zero-rear-W31-document.json')
    if parent['historicalArtifact']['zipSHA256']!=ORIGINAL_SHA or parent['pureSharedRequestExactlyMatchesRetainedActualCLI'] is not True:
        raise ValueError('Exact admitted saved-chain provenance was not established')
    restore_sources(folder)
    source,methods,runtime=signed.actual_sources()
    if parent['sourceSHA256']!=source['identities'] or parent['methodSHA256']!=methods or parent['runtime']!=runtime:
        raise ValueError('Actual native58/finite6/runtime differs from the authenticated W31 parent')
    expected=source_rebind(old_case,old_case['sourceSHA256'],source['identities']);floor(expected)['edgeBand']['axialRigidityKN']=0
    if parent['nativeCase']!=expected or signed.digest(parent['nativeCase'])!=signed.digest(expected) or result['authoredNativeCase']!=expected or parent['settings']!=old_comp['request']['settings']:
        raise ValueError('Native input must derive from the actual shared full-CLI case by source transition and sole EA0 edit')
    target=copy.deepcopy(original_document);target['bindings']=document['bindings']
    target['stages']['distributedFloor']['edgeBand']['axialRigidityKN']=0.
    target['stages']['floorSection']['finiteJointComparison']['execution']='deferred'
    target['stages']['floorSection']['rearBearingComparison']=parent['choices']
    if document!=target or sha(folder/'zero-rear-W31-document.json')!=parent['savedSourceDocumentSHA256']:
        raise ValueError('Other authored source stages changed or saved snapshot was relabelled')
    if sha(folder/'zero-rear-raw-checkpoint.json')!=result['rawCheckpointSHA256']:raise ValueError('Actual raw parent checkpoint identity differs')
    Path(DOCUMENT).parent.mkdir(parents=True,exist_ok=True);Path(DOCUMENT).write_bytes((folder/'zero-rear-W31-document.json').read_bytes())
    active=result['finiteHouseResult'];packet={'schema':'str-current-finite-signed-input/1','nativeCase':parent['nativeCase'],'settings':parent['settings'],
        'sourceSHA256':source['identities'],'methodSHA256':methods,'runtime':runtime,'catalogue':signed.catalogue(source),
        'observerSHA256':sha('project/str/studies/finite_joint_normal_observer.py'),'replaySHA256':sha('project/str/studies/current_finite_joint_replay.py'),
        'proofSHA256':sha(signed.METHOD),'controllingChoicesSHA256':signed.digest({'design':document['design'],'stages':document['stages']}),
        'documentSnapshotSHA256':sha(DOCUMENT),'documentPath':DOCUMENT,'documentIdentity':None,
        'sourceCommit':subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip(),'parentResultSHA256':signed.digest(result),
        'portIds':[p['id'] for p in active['finiteJoint']['ports']],'headIds':[h['id'] for h in active['native']['nativeVertical']['native']['heads']],
        'rearChoices':parent['choices'],'rearBodyCatalogue':signed.rear_body_catalogue(checkpoint),**signed.rear_identities(),
        'currentSavedEngineeringDocumentAdmitted':False}
    packet['developmentAuthority']={'schema':'str-rear-signed-development-authority/1','actualW31WorkflowRun':45841589967,'actualW31ArtifactId':15129761196,
        'actualW31SourceCommit':'86508d62dcafa9b8ccc68725ab57b93f457e67c1','actualW31ArchiveSHA256':ARCHIVE_SHA,
        'originalFullCLIArchiveSHA256':ORIGINAL_SHA,'nativeSourceTransition':parent['sourceReview'],'helperSHA256':sha(METHOD),
        'nativeInputSHA256':signed.digest(parent['nativeCase']),'finiteSettingsSHA256':signed.digest(parent['settings']),'rearChoicesSHA256':signed.digest(parent['choices']),
        'savedDocumentSHA256':packet['documentSnapshotSHA256'],'controllingChoicesSHA256':packet['controllingChoicesSHA256'],
        'authenticatedPhysicalParentPacketSHA256':signed.digest(parent),'usedAsAssemblyForces':False,'ordinaryCompilerAdoption':False}
    signed.admit_packet(packet);check=signed.check_rear_result(packet,31,result,checkpoint)
    write(folder/'actual-parent-W31-development-replay.json',check)
    from rear_bearing_zero_pair import aggregate
    aggregate(folder)
    summary=read(folder/'zero-rear-W31-pair-summary.json')
    summary.update(actualParentReplay=check,pointTraceRepresentation=result['actualReplacement']['pointTraceRepresentation'],replayedActualSourceCommit='86508d62dcafa9b8ccc68725ab57b93f457e67c1',newGlobalSolveClaimed=False)
    write(folder/'verified-ordinary-point-W31-summary.json',summary)
    import math
    comparison=summary['matchedHouseComparison'];heads=active['native']['nativeVertical']['native']['heads']
    metrics={'pointTraceRepresentation':result['actualReplacement']['pointTraceRepresentation'],
        'seatedControl':comparison['seatedControl'],'directBearing':comparison['directBearing'],'physicalGKN':comparison['physicalGKN'],
        'maximumHeadComponentChangeKN_KNm':max(abs(v) for r in comparison['headReactionDifferencesKN_KNm'] for v in r['differenceKN_KNm']),
        'maximumFloorInterfaceTranslationMm':max(math.hypot(*r['displacementMmMrad'][:2]) for r in active['native']['nativeVertical']['native']['floorInterfacePorts']),
        'minimumHeadFzKN':min(r['reactionKN_KNm'][2] for r in heads),'parentReplay':check,
        'independentMaterialAndLoadDifference':summary['independentMaterialAndLoadDifference'],
        'currentSavedEngineeringDocumentAdmitted':False,'candidateAccepted':False}
    write(folder/'verified-W31-metrics.json',metrics)
    print('REAR_WORKING_W31_METRICS '+json.dumps(metrics,allow_nan=False),flush=True)
    out.parent.mkdir(parents=True,exist_ok=True);signed.write(out,packet)
    (out.parent/'rear-development-document.json').write_bytes(Path(DOCUMENT).read_bytes())
    for path in SOURCE:(out.parent/('new-'+Path(path).name)).write_bytes(Path(path).read_bytes())
    write(out.parent/'development-authority.json',packet['developmentAuthority'])
    print('REAR_DEVELOPMENT_PREPARED '+json.dumps({'sourceCommit':packet['sourceCommit'],'parentInputSHA256':signed.digest(packet),
        'nativeInputSHA256':signed.digest(expected),'savedDocumentSHA256':packet['documentSnapshotSHA256'],'headCount':len(packet['headIds']),
        'portCount':len(packet['portIds']),'caseCount':len(packet['catalogue']),'currentSavedEngineeringDocumentAdmitted':False}),flush=True)
def restore(args):
    import current_finite_joint_signed_proof as signed
    packet=signed.read(args.input);folder=Path(args.input).parent
    if packet['documentPath']!=DOCUMENT:raise ValueError('Exact development snapshot path required')
    restore_sources(folder)
    doc=folder/'rear-development-document.json'
    if sha(doc)!=packet['documentSnapshotSHA256']:raise ValueError('Exact prepared saved snapshot required')
    Path(packet['documentPath']).parent.mkdir(parents=True,exist_ok=True);Path(packet['documentPath']).write_bytes(doc.read_bytes())
    signed.admit_packet(packet)
@contextmanager
def retain_native_response(packet,index,target):
    """Read-only capture before ANY native or rear postprocessor can fail."""
    import floor_section_model as native
    import current_finite_joint_signed_proof as signed
    original_build=native._build_base;original_solve=native.solve_vertical_frame;original_interface=native._interface_result
    held={};target=Path(target);component=Path(str(target)+'.membrane.json.gz')
    def built(*args,**kwargs):
        model=original_build(*args,**kwargs);held['model']=model;return model
    def solved(frame,data):
        model=held['model']
        if model['model'] is not frame:raise ValueError('Actual frame/model identity changed before raw retention')
        raw=original_solve(frame,data);held['rawSemanticSHA256']=signed.digest(raw)
        snapshot={k:model[k] for k in ('request','joinedFloor','housePressure','rearDirectBearing','rearDirectJointOrigins','wetGridOrigins',
            'lowerCoreBodies','foundationWeight','seatedWetSupport','memberEquivalentLoads','memberPointLoads','memberDistributedLoads','members','families')}
        snapshot['verticalFloor']={'fibres':model['verticalFloor']['fibres']}
        snapshot['frame']={k:getattr(frame,k) for k in ('nodes','loads','springs')}
        signed.write(target,{'schema':'str-rear-raw-before-native-postprocessing/1','postProcessingComplete':False,
            'windIndex':index,'parentInputSHA256':signed.digest(packet),'sourceSHA256':packet['sourceSHA256'],
            'rearMethodSHA256':packet['rearMethodSHA256'],'rawSemanticSHA256':held['rawSemanticSHA256'],
            'rawResponse':raw,'postprocessingModel':snapshot})
        return raw
    def interfaces(model,raw,mid):
        data=model['joinedFloor'];floor=data['floor']
        value={'schema':'str-rear-actual-membrane-capture/1','windIndex':index,'parentInputSHA256':signed.digest(packet),
            'midplaneZMm':mid,'floor':{k:floor[k] for k in ('ports','condensedStiffnessKNPerMm','condensedForceKN')},
            'portTerms':data['portTerms'],'pressureRows':model['housePressure']['reconciledFloorRows'],'nativeGuardPassed':False}
        def retain():
            with gzip.open(component,'wb',compresslevel=6) as stream:stream.write(signed.encoded(value))
        retain()
        rows,residual=original_interface(model,raw,mid);value.update(nativeGuardPassed=True,nativeWrenchResidualKN_KNm=residual);retain()
        held['componentPath']=str(component)
        return rows,residual
    try:
        native._build_base=built;native.solve_vertical_frame=solved;native._interface_result=interfaces
        yield held
    finally:
        native._build_base=original_build;native.solve_vertical_frame=original_solve;native._interface_result=original_interface


def verify_native_component(packet,index,result,checkpoint,path,receipt):
    import current_finite_joint_signed_proof as signed
    import floor_section_model as native
    from rear_direct_bearing_replay import compare_values
    if sha(path)!=receipt['membraneCaptureSHA256'] or signed.digest(checkpoint['rawResponse'])!=receipt['rawSemanticSHA256']:
        raise ValueError('Retained actual component/raw physical response identity differs')
    value=json.loads(gzip.decompress(Path(path).read_bytes()))
    if value['schema']!='str-rear-actual-membrane-capture/1' or value['windIndex']!=index or value['parentInputSHA256']!=signed.digest(packet) or value['nativeGuardPassed'] is not True:
        raise ValueError('Actual membrane source/guard status differs')
    shadow={'joinedFloor':{'floor':value['floor'],'portTerms':value['portTerms']},'housePressure':{'reconciledFloorRows':value['pressureRows']}}
    rows,residual=native._interface_result(shadow,checkpoint['rawResponse'],value['midplaneZMm'])
    actual=result['finiteHouseResult']['native']['nativeVertical']['native']
    compare_values(rows,actual['floorInterfacePorts'],'actualMembranePortForceRecovery')
    compare_values(residual,actual['floorInterfaceWrenchResidualKN_KNm'],'actualMembraneWrenchRecovery')
    compare_values(residual,value['nativeWrenchResidualKN_KNm'],'savedMembraneGuard')
    return max(map(abs,residual))

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('mode',choices=['prepare','restore']);p.add_argument('--development-folder');p.add_argument('--out');p.add_argument('--input');a=p.parse_args()
    {'prepare':prepare,'restore':restore}[a.mode](a)
