"""Source-specific hosted saved-stage W31 proof; no canonical account mutation."""
import argparse,copy,hashlib,json,os,subprocess,sys
from pathlib import Path
ROOT=Path('.')
DOCUMENT=Path('project/ccr/studies/working-house-comparison.json')
ACCOUNT=Path('project/ccr/studies/source-coverage.json')
EXACT={
 'project/str/studies/rear_direct_bearing.py':'7bb3dbf3ab6e4f6b05110be01c27968af9607202641a1fa5425fa868e6f34cc1',
 'project/str/studies/rear_bearing_plan.py':'a005206e76ac1f778bb248f9b9e56c62cab9f2fd318d1cf2c402cc0ea68f6446',
 'project/str/studies/rear_bearing_plan_test.py':'55c091d4f88aff1587a32a6888654ce1adf4d3d99e1ef71c7c7d6889a0cc803b',
}
OWNED={
 'compiler/reference-house/current-design/structural-floor-section.ts':'bc74cf0217b80be3e8a2a45f38211814362732ef',
 'project/str/studies/current_finite_joint_signed_proof.py':'1ad2fc2dbbb3d94a37ec37a282777729b46b0efe',
 'project/str/studies/current_finite_joint_signed_proof_test.py':'c8b2921ba44c5a30361962ea29143bcb04a5755e',
 'compiler/reference-house/current-design/structural-rear-bearing.ts':None,
 'compiler/reference-house/current-design-rear-bearing.test.ts':None,
 'project/str/studies/rear_direct_bearing.py':None,
 'project/str/studies/rear_bearing_plan.py':None,
 'project/str/studies/rear_bearing_plan_test.py':None,
 'project/str/studies/rear_direct_bearing_test.py':None,
 'project/str/studies/rear_direct_bearing_replay.py':None,
 'project/str/studies/rear_direct_bearing_replay_test.py':None,
 'project/str/studies/rear_bearing_saved_proof.py':None,
 'project/str/rear-direct-bearing-comparison.md':None,
}
AUTHORS=['compiler/reference-house/current-design/structural-rear-bearing.ts','project/str/studies/rear_direct_bearing.py','project/str/studies/rear_bearing_plan.py']
FIXTURE='project/ias/studies/selected-family-convergence.json'
CONSUMERS=[p for p in OWNED if p not in AUTHORS and p!='compiler/reference-house/current-design/structural-floor-section.ts' and not p.endswith('.md')]
def blob(data):return hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()
def sha(path):return hashlib.sha256(Path(path).read_bytes()).hexdigest()
def read(path):return json.loads(Path(path).read_text())
def write(path,value):Path(path).write_text(json.dumps(value,allow_nan=False))
def node(code,*arguments):return json.loads(subprocess.check_output(['node','--import','tsx','--input-type=module','-e',code,*map(str,arguments)],text=True))
def guard():
    for path,value in EXACT.items():
        if sha(path)!=value:raise ValueError('Exact recovered physical source changed: '+path)
def prepare(folder):
    guard();folder.mkdir(parents=True,exist_ok=True);original=read(DOCUMENT);old=read(ACCOUNT)
    if blob(ACCOUNT.read_bytes())!='766942ba380d2c3a14d2d6dbe330d1b0ca9db8e6':raise ValueError('Baseline source account changed; review new migration explicitly')
    if original['stages']['distributedFloor']['boundaryCase']['windIndex']!=31:raise ValueError('Actual canonical W31 parent required')
    account=copy.deepcopy(old);family=next(f for f in account['families'] if f['id']=='str-masonry-frame-comparison')
    additions={'authorRoots':AUTHORS,'inputReceipts':[FIXTURE],'consumers':CONSUMERS,'decisions':['project/str/rear-direct-bearing-comparison.md']}
    for role,paths in additions.items():
        for path in paths:
            if path not in family[role]:family[role].append(path)
    reviewed=[]
    for path,expected in OWNED.items():
        if old['gitBlobs'].get(path)!=expected:raise ValueError('Unreviewed prior identity: '+path)
        actual=blob(Path(path).read_bytes());account['gitBlobs'][path]=actual
        reviewed.append({'path':path,'before':expected,'after':actual})
    if account['receiptEdges']!=old['receiptEdges'] or any(account['gitBlobs'].get(p)!=v for p,v in old['gitBlobs'].items() if p not in OWNED):
        raise ValueError('Unowned hashes or historical receipt edges changed')
    if blob(Path(FIXTURE).read_bytes())!=old['gitBlobs'][FIXTURE]:raise ValueError('Existing IAS authored geometry changed')
    write(folder/'source-account-before.json',old);write(ACCOUNT,account);write(folder/'source-account-workcopy.json',account)
    audit=node("import{auditSourceCoverage}from'./project/ccr/studies/source-coverage.ts';console.log(JSON.stringify(auditSourceCoverage()))")
    write(folder/'source-account-audit.json',audit)
    if audit['findings']:raise ValueError('Strict source account findings: '+json.dumps(audit['findings']))
    refreshed=node("import{readFileSync}from'node:fs';import{readEngineeringDocument}from'./compiler/reference-house/current-design/engineering-document.ts';let d=JSON.parse(readFileSync(process.argv[1],'utf8'));console.log(JSON.stringify((await readEngineeringDocument(d.design)).bindings))",DOCUMENT)
    binding_changes=[]
    for category in ('disciplines','implementations','authoredDefaults'):
        before=original['bindings'][category];after=refreshed[category]
        for key in sorted(set(before)|set(after)):
            if before.get(key)!=after.get(key):
                if (category=='disciplines' and key not in {'str-masonry-frame-comparison','str-finite-joint-development'}) or (category=='implementations' and key not in set(OWNED)|{str(ACCOUNT)}) or category=='authoredDefaults':
                    raise ValueError('Unreviewed binding change: '+category+'/'+key)
                binding_changes.append({'category':category,'path':key,'before':before.get(key),'after':after.get(key)})
    parent=copy.deepcopy(original);parent['bindings']=refreshed
    from rear_bearing_plan import choices_defaults
    candidate=copy.deepcopy(parent);candidate['stages']['floorSection']['finiteJointComparison']['execution']='deferred'
    candidate['stages']['floorSection']['rearBearingComparison']={**choices_defaults(),'execution':'compute'}
    check=copy.deepcopy(candidate);del check['stages']['floorSection']['rearBearingComparison']
    check['stages']['floorSection']['finiteJointComparison']['execution']=parent['stages']['floorSection']['finiteJointComparison']['execution']
    if check!=parent:raise ValueError('Unexpected saved house semantic edit')
    write(folder/'parent-W31-document.json',parent);write(folder/'rear-W31-document.json',candidate)
    write(folder/'source-and-binding-review.json',{'schema':'str-rear-saved-proof-source-review/1','sourceCommit':subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip(),
       'canonicalDocumentSHA256':sha(DOCUMENT),'sourceAccountGitBlobBefore':'766942ba380d2c3a14d2d6dbe330d1b0ca9db8e6',
       'explicitOwnedGitBlobChanges':reviewed,'explicitFamilyResourceAdditions':additions,'bindingChanges':binding_changes,
       'allOtherGitBlobsAndReceiptEdgesUnchanged':True,'strictAuditFindingCount':0,
       'physicalNative58AndFinite6Changed':False,'canonicalFileChanged':False,'unselected':True,
       'semanticChanges':['sole optional stages.floorSection.rearBearingComparison compute','existing finiteJointComparison.execution deferred, enabled and all physical inputs unchanged'],
       'parentDocumentSHA256':sha(folder/'parent-W31-document.json'),'rearDocumentSHA256':sha(folder/'rear-W31-document.json')})
    print('PREPARED strict source-account workcopy and source-bound sole optional rear W31 stage',flush=True)
def execute(folder):
    guard()
    from current_finite_joint_signed_proof import require_document_bundle_identity,admitted_parent
    from current_finite_joint_replay import replay as finite_replay
    from rear_direct_bearing_replay import replay,material_and_load_difference
    parent=read(folder/'parent-W31-bundle.json');candidate=read(folder/'rear-W31-bundle.json')
    parent_identity=require_document_bundle_identity(folder/'parent-W31-document.json',parent)
    candidate_identity=require_document_bundle_identity(folder/'rear-W31-document.json',candidate)
    _,_,control,old_choices=admitted_parent(parent['engineering']['floorSection'])
    if old_choices is not None:raise ValueError('Seated parent unexpectedly acquired rear stage')
    finite_replay(control);_,_,result,choices=admitted_parent(candidate['engineering']['floorSection'])
    if choices is None or candidate['engineering']['floorSection']['finiteJointComparison']['status']!='analysis-pending':raise ValueError('Actual sole rear physical execution and explicit deferred reference required')
    write(folder/'parent-W31-native.json',control);write(folder/'rear-W31-native.json',result)
    checkpoint=read(folder/'rear-W31-raw-checkpoint.json')
    if sha(folder/'rear-W31-raw-checkpoint.json')!=result['rawCheckpointSHA256']:raise ValueError('Retained actual rear checkpoint differs')
    proof=replay(result,checkpoint,ROOT);proof['independentMaterialAndLoadDifference']=material_and_load_difference(result,control,ROOT)
    write(folder/'rear-W31-proof.json',proof);write(folder/'actual-document-identities.json',{'parent':parent_identity,'rear':candidate_identity})
    for name,value in result['drawings'].items():(folder/name).write_text(value)
    print('Actual saved-stage W31 and independent material/force replay passed',flush=True)
def finalize(folder):
    guard();review=read(folder/'source-and-binding-review.json')
    if sha(DOCUMENT)!=review['canonicalDocumentSHA256']:raise ValueError('Canonical source document changed')
    audit=node("import{auditSourceCoverage}from'./project/ccr/studies/source-coverage.ts';console.log(JSON.stringify(auditSourceCoverage()))")
    if audit['findings']:raise ValueError('Source account findings appeared during actual proof')
    summary={'schema':'str-rear-saved-W31-proof/1','status':'actual-saved-W31-rear-stage-and-independent-replay-complete',
       'sourceCommit':review['sourceCommit'],'sourceReview':review,'proof':read(folder/'rear-W31-proof.json'),
       'retainedFilesSHA256':{p.name:sha(p) for p in folder.iterdir() if p.is_file()},
       'newRearSigned96Complete':False,'candidateAccepted':False,'strengthAccepted':False,'ownerAccepted':False}
    write(folder/'saved-stage-summary.json',summary)
    print('REAR_SAVED_W31_PROOF '+json.dumps(summary['proof'],allow_nan=False),flush=True)
if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('mode',choices=['prepare','execute','finalize']);parser.add_argument('--folder',type=Path,required=True)
    args=parser.parse_args();{'prepare':prepare,'execute':execute,'finalize':finalize}[args.mode](args.folder)
