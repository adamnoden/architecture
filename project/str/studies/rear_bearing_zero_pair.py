"""Fresh zero-extra-EA W31 pair from the exact shared saved-case chain.

Proof-only source counterfactual until permanent source-account migration.
No archived response supplies assembly or a force increment.
"""
import argparse,copy,hashlib,json,subprocess,traceback,zipfile
from pathlib import Path
FOLDER=None
METHOD='project/str/studies/rear_bearing_zero_pair.py'
READER='project/str/studies/rear_bearing_saved_request.ts'
PROBE='project/str/studies/rear_bearing_interface_probe.py'
SOURCE_COMMIT='a8decb9845498fdb864121ee57d0caba16b98002'
SOURCE={
 'project/str/studies/distributed_floor_compatibility.py':('45c0d9e082dec58edf2040064d7a14c50dcbb1d4','d1c6b5dde95f1d94be6ccf39160312a7b9a0f61c0835b76ffaa964b2d9225c7d'),
 'project/str/studies/perforated_floor_condensation.py':('b297a5f9d22a4890b2921ff2460d746f0cb4c4fe','c7fbb46717c0b54af02d42d5737993bb5b647214e9d10eaf70343771acb296c6'),
}
ZIP_SHA='6c15eec478a617d16efa52c2f2ceed61737c3205a4cad4c711132615e4516ae5'
def encode(v):return json.dumps(v,sort_keys=True,separators=(',',':'),allow_nan=False).encode()
def digest(v):return hashlib.sha256(encode(v)).hexdigest()
def sha(path):return hashlib.sha256(Path(path).read_bytes()).hexdigest()
def blob(data):return hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()
def read(path):return json.loads(Path(path).read_text())
def write(path,value):
    p=Path(path);partial=p.with_suffix('.partial');partial.write_bytes(encode(value));partial.replace(p)
def floor(case):return case['bearingCase']['masonryCase']['verticalCase']['monolithicCase']['houseCase']['joinedCase']['floor']
def request(document):
    return json.loads(subprocess.check_output(['node','--import','tsx',READER,str(document)],text=True))
def source_rebind(value,old,current):
    if isinstance(value,dict):
        out={}
        for key,item in value.items():
            if key=='sourceSHA256':
                if not isinstance(item,dict) or any(path not in old or old[path]!=identity or path not in current for path,identity in item.items()):
                    raise ValueError('Unowned nested native source identity')
                out[key]={path:current[path] for path in item}
            else:out[key]=source_rebind(item,old,current)
        return out
    if isinstance(value,list):return [source_rebind(item,old,current) for item in value]
    return copy.deepcopy(value)
def without_sources(value):
    if isinstance(value,dict):return {k:without_sources(v) for k,v in value.items() if k!='sourceSHA256'}
    if isinstance(value,list):return [without_sources(v) for v in value]
    return value
def prepare(folder):
    import rear_bearing_saved_proof as shared
    extra=[READER,PROBE,METHOD,'project/str/studies/rear_lintel_point_trace_test.py']
    shared.OWNED.update({p:None for p in extra});shared.CONSUMERS.extend(extra);shared.prepare(folder)
    archive=folder/'retained-W31.zip'
    if sha(archive)!=ZIP_SHA:raise ValueError('Retained exact full-CLI W31 artifact ZIP identity differs')
    with zipfile.ZipFile(archive) as z:
        expected=['parent-W31-bundle.json','parent-W31-document.json','source-and-binding-review.json']
        for name in expected:
            matches=[n for n in z.namelist() if n==name]
            if matches!=[name]:raise ValueError('Exactly one source-bound retained W31 member required: '+name)
            (folder/('retained-'+name)).write_bytes(z.read(name))
    historical_bundle=read(folder/'retained-parent-W31-bundle.json')
    comp=historical_bundle['engineering']['floorSection']['finiteJointComparison']
    if comp['status']!='computed-unselected-comparison':raise ValueError('Retained source37 actual full CLI parent missing')
    old=comp['result'];saved=request(folder/'rear-W31-document.json')
    if saved['nativeCase']!=comp['request']['nativeCase'] or saved['finiteSettings']!=comp['request']['settings']:
        raise ValueError('Pure shared saved-case chain does not exactly match actual retained full-CLI W31 request')
    if old['authoredNativeCase']!=saved['nativeCase'] or old['settings']!=saved['finiteSettings'] or floor(saved['nativeCase'])['boundaryCase']['windIndex']!=31:
        raise ValueError('Retained parent lost its actual same native W31 controls')
    from current_finite_joint_replay import replay
    replay(old)
    write(folder/'retained-positive-W31-native.json',old)
    zero_document=read(folder/'rear-W31-document.json')
    original_ea=zero_document['stages']['distributedFloor']['edgeBand']['axialRigidityKN']
    if original_ea<=0:raise ValueError('Positive-EA canonical control required')
    zero_document['stages']['distributedFloor']['edgeBand']['axialRigidityKN']=0.
    write(folder/'zero-rear-W31-document.json',zero_document)
    zero=request(folder/'zero-rear-W31-document.json');check=copy.deepcopy(zero['nativeCase'])
    floor(check)['edgeBand']['axialRigidityKN']=original_ea
    if check!=saved['nativeCase'] or zero['finiteSettings']!=saved['finiteSettings'] or zero['choices']!=saved['choices']:
        raise ValueError('Zero shared stage changed more than its actual additional axial-chord allowance')
    source_before=saved['nativeCase']['sourceSHA256'];method_review=[]
    for path,(before,expected) in SOURCE.items():
        old_bytes=Path(path).read_bytes()
        if blob(old_bytes)!=before or hashlib.sha256(old_bytes).hexdigest()!=source_before[path]:raise ValueError('Unexpected original native method: '+path)
        new_bytes=subprocess.check_output(['git','show',SOURCE_COMMIT+':'+path])
        if hashlib.sha256(new_bytes).hexdigest()!=expected:raise ValueError('Pinned native correction differs: '+path)
        (folder/('old-'+Path(path).name)).write_bytes(old_bytes);(folder/('new-'+Path(path).name)).write_bytes(new_bytes)
        Path(path).write_bytes(new_bytes)
        method_review.append({'path':path,'oldGitBlob':before,'oldSHA256':source_before[path],'newSHA256':expected})
    # Import native loaders only AFTER the explicit two-file transition.
    from floor_section_model import load_source
    from current_finite_rc_joint import method_identities,runtime_versions
    current=load_source(Path('.'))['identities']
    if len(current)!=58 or set(current)!=set(source_before) or {p for p in current if current[p]!=source_before[p]}!=set(SOURCE):
        raise ValueError('Native58 transition exceeded the two explicitly admitted methods')
    if method_identities(Path('.'))!=old['methodSHA256'] or runtime_versions()!=old['runtime']:
        raise ValueError('Existing finite6 or runtime changed')
    # Verify the exact three reviewed textual edits reverse to old native bytes.
    old_guard="band['axialRigidityKN'] <= 0";new_guard="band['axialRigidityKN'] < 0"
    old_mem="math.isfinite(value) and value > 0 for key, value in law.items() if key != 'poissonRatio'"
    new_mem="math.isfinite(value) and (value > 0 or key == 'edgeAxialRigidityKN' and type(value) in (int,float) and value == 0) for key, value in law.items() if key != 'poissonRatio'"
    old_schur="        for a, x in neighbours:\n            work[a].pop(index, None)\n            target = work[a]"
    new_schur="        for target in work.values():\n            target.pop(index, None)\n        for a, x in neighbours:\n            target = work[a]"
    edits={next(iter(SOURCE)):[(old_guard,new_guard)],list(SOURCE)[1]:[(old_mem,new_mem),(old_schur,new_schur)]}
    for path,pairs in edits.items():
        text=Path(path).read_text()
        for before,after in pairs:
            if text.count(after)!=1 or before in text:raise ValueError('Unreviewed native edit: '+path)
            text=text.replace(after,before)
        if hashlib.sha256(text.encode()).hexdigest()!=source_before[path]:raise ValueError('Native change did not reverse exactly')
    rebound=source_rebind(zero['nativeCase'],source_before,current)
    if without_sources(rebound)!=without_sources(zero['nativeCase']):raise ValueError('Source refresh changed physical controls')
    packet={'schema':'str-rear-zero-EA-W31-paired-input/1','nativeCase':rebound,'settings':zero['finiteSettings'],'choices':zero['choices'],
        'sourceSHA256':current,'methodSHA256':old['methodSHA256'],'runtime':old['runtime'],'sourceReview':method_review,
        'nativeMethodTransitionCommit':SOURCE_COMMIT,'historicalArtifact':{'runId':45830698847,'artifactId':15121224942,'zipSHA256':ZIP_SHA,'sourceCommit':'37bff8ef16fde7752e0e63a772720488bd8ca2ca'},
        'pureSharedRequestExactlyMatchesRetainedActualCLI':True,'savedSourceDocumentSHA256':sha(folder/'zero-rear-W31-document.json'),
        'proofMethodSHA256':{p:sha(p) for p in extra},
        'currentSavedEngineeringDocumentAdmitted':False,'sourceAccountMigrationRequired':True,'candidateAccepted':False}
    write(folder/'zero-W31-paired-input.json',packet)
    print('Prepared exact shared source-bound zero-EA W31 pair; no force increment or canonical admission',flush=True)
def execute(folder,name):
    packet=read(folder/'zero-W31-paired-input.json')
    if any(sha(p)!=h for p,h in packet['proofMethodSHA256'].items()):raise ValueError('Paired proof method changed')
    from floor_section_model import load_source
    from current_finite_rc_joint import method_identities,runtime_versions
    if load_source(Path('.'))['identities']!=packet['sourceSHA256'] or method_identities(Path('.'))!=packet['methodSHA256'] or runtime_versions()!=packet['runtime']:
        raise ValueError('Actual paired sources/runtime changed')
    if name=='seated':
        archive=folder/'retained-zero-W31.zip'
        if sha(archive)!='9be9d30d90849fe4eef97e3799dd81cccb34d6afef6b3896abd7f2adade5083c':raise ValueError('Exact completed zero seated reference archive changed')
        with zipfile.ZipFile(archive) as z:
            result=json.loads(z.read('zero-seated-W31-native.json'))
            historical_input=json.loads(z.read('zero-W31-paired-input.json'))
            diagnostic=json.loads(z.read('seated-interface-diagnostic.json'))
        if historical_input['nativeCase']!=packet['nativeCase'] or result['authoredNativeCase']!=packet['nativeCase'] or any(result[k]!=packet[k] for k in ('settings','sourceSHA256','methodSHA256','runtime')):
            raise ValueError('Seated reference is not exactly the same actual native58/finite6/settings/input case')
        from current_finite_joint_replay import replay
        from current_finite_joint_signed_proof import check_observation
        check=replay(result);check_observation({'observerSHA256':sha('project/str/studies/finite_joint_normal_observer.py')},result)
        write(folder/'zero-seated-W31-native.json',result);write(folder/'zero-seated-W31-replay.json',check)
        write(folder/'seated-interface-diagnostic.json',diagnostic)
        write(folder/'seated-reference-provenance.json',{'runId':45834355568,'artifactId':15124951816,'zipSHA256':sha(archive),
            'sourceCommit':'31c26061d6ebc3944ec2c69f6c4d4672957ae265','completeActualReferenceUnmodified':True,
            'sameActualNative58Finite6RuntimeAndNativeCase':True,'usedAsForceIncrement':False,'newSolveClaimed':False})
        print('REAR_AUTHENTICATED_ZERO_SEATED_REFERENCE '+json.dumps(check,allow_nan=False),flush=True)
        return
    import floor_section_model as native
    from rear_bearing_interface_probe import diagnose
    from rear_direct_bearing import run_rear_direct_bearing,identities
    from finite_joint_normal_observer import run_observed_current_joint
    from current_finite_joint_replay import replay
    original=native._interface_result
    def checked(model,raw,mid):
        diagnostic=diagnose(model,raw,mid)
        write(folder/(name+'-interface-diagnostic.json'),diagnostic)
        snapshot={k:model[k] for k in ('request','joinedFloor','housePressure','lowerCoreBodies','foundationWeight','memberEquivalentLoads','memberPointLoads','memberDistributedLoads','members','families')}
        for key in ('rearDirectBearing','rearDirectJointOrigins','wetGridOrigins','seatedWetSupport'):
            if key in model:snapshot[key]=model[key]
        snapshot['verticalFloor']={'fibres':model['verticalFloor']['fibres']}
        snapshot['frame']={k:getattr(model['model'],k) for k in ('nodes','loads','springs')}
        write(folder/(name+'-pre-guard-checkpoint.json'),{'schema':'str-rear-zero-W31-pre-interface-checkpoint/1',
            'postProcessingComplete':False,'nativeInterfaceGuardAlreadyPassed':False,'name':name,'inputSHA256':digest(packet),
            'sourceSHA256':packet['sourceSHA256'],'methodSHA256':packet['methodSHA256'],
            'rawResponse':raw,'postprocessingModel':snapshot,'diagnostic':diagnostic})
        print('REAR_ZERO_INTERFACE_DIAGNOSTIC '+json.dumps({'name':name,**diagnostic},allow_nan=False),flush=True)
        return original(model,raw,mid)
    try:
        native._interface_result=checked
        if name=='seated':
            result=run_observed_current_joint(packet['nativeCase'],packet['settings'],Path('.'));check=replay(result)
        else:
            result=run_rear_direct_bearing(packet['nativeCase'],packet['choices'],packet['settings'],Path('.'),folder/'zero-rear-raw-checkpoint.json')
            # Retain the complete result before any new replay.
            write(folder/'zero-rear-W31-native.json',result)
            from rear_direct_bearing_replay import replay as rear_replay
            checkpoint=read(folder/'zero-rear-raw-checkpoint.json')
            check=rear_replay(result,checkpoint,Path('.'))
            from current_finite_joint_signed_proof import check_observation,check_all_rear_bodies,rear_body_catalogue
            check_observation({'observerSHA256':sha('project/str/studies/finite_joint_normal_observer.py')},result['finiteHouseResult'])
            check['allOrdinaryTailAndBearingBodyReplay']=check_all_rear_bodies({'rearBodyCatalogue':rear_body_catalogue(checkpoint)},result,checkpoint)
        inner=result['finiteHouseResult'] if name=='rear' else result
        if inner['audit']['retainedSteelChordEAKN']!=0. or inner['audit']['explicitConcreteBandEAKN']!=231000.:raise ValueError('Zero extra steel must preserve actual RC231000kN axial rigidity')
        write(folder/('zero-'+name+'-W31-native.json'),result);write(folder/('zero-'+name+'-W31-replay.json'),check)
        print('REAR_ZERO_CASE_PASS '+json.dumps({'name':name,'replay':check},allow_nan=False),flush=True)
    except Exception:
        write(folder/('zero-'+name+'-W31-failure.json'),{'name':name,'inputSHA256':digest(packet),'failure':traceback.format_exc(),
            'currentSavedEngineeringDocumentAdmitted':False,'candidateAccepted':False})
        raise
    finally:native._interface_result=original
def aggregate(folder):
    from rear_direct_bearing_replay import material_and_load_difference
    from rear_direct_bearing import compare_seated_reference
    control=read(folder/'zero-seated-W31-native.json');rear=read(folder/'zero-rear-W31-native.json')
    summary={'schema':'str-rear-zero-extra-EA-W31-pair/1','input':read(folder/'zero-W31-paired-input.json'),
        'matchedHouseComparison':compare_seated_reference(rear,control),'seatedReferenceProvenance':read(folder/'seated-reference-provenance.json'),
        'independentMaterialAndLoadDifference':material_and_load_difference(rear,control,Path('.')),
        'seatedInterface':read(folder/'seated-interface-diagnostic.json'),'rearInterface':read(folder/'rear-interface-diagnostic.json'),
        'currentSavedEngineeringDocumentAdmitted':False,'sourceAccountMigrationRequired':True,
        'newRearSigned96Complete':False,'candidateAccepted':False,'strengthAccepted':False,'ownerAccepted':False}
    write(folder/'zero-rear-W31-pair-summary.json',summary)
    print('REAR_ZERO_W31_PAIR '+json.dumps(summary,allow_nan=False),flush=True)
if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('mode',choices=['prepare','seated','rear','aggregate']);parser.add_argument('--folder',type=Path,required=True);a=parser.parse_args()
    if a.mode=='prepare':prepare(a.folder)
    elif a.mode=='aggregate':aggregate(a.folder)
    else:execute(a.folder,a.mode)
