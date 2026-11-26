"""Bounded recovery of the exact current saved W0/rear-bearing comparison."""
import argparse
import copy
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys

ROOT=Path('.')
DOCUMENT=Path('project/ccr/studies/working-house-comparison.json')
SHA={
 'project/str/studies/rear_direct_bearing.py':'7bb3dbf3ab6e4f6b05110be01c27968af9607202641a1fa5425fa868e6f34cc1',
 'project/str/studies/rear_bearing_plan.py':'a005206e76ac1f778bb248f9b9e56c62cab9f2fd318d1cf2c402cc0ea68f6446',
 'project/str/studies/rear_bearing_plan_test.py':'55c091d4f88aff1587a32a6888654ce1adf4d3d99e1ef71c7c7d6889a0cc803b',
}
METHODS=tuple(SHA)+(
 'project/str/studies/rear_direct_bearing_test.py',
 'project/str/studies/rear_direct_bearing_replay.py',
 'project/str/studies/rear_direct_bearing_replay_test.py',
 'project/str/studies/rear_direct_bearing_recovery.py',
 'compiler/reference-house/current-design/structural-rear-bearing.ts',
 'compiler/reference-house/current-design-rear-bearing.test.ts',
 '.github/workflows/rear-bearing-recovery.yml',
)

def digest(path):return hashlib.sha256(Path(path).read_bytes()).hexdigest()
def read(path):return json.loads(Path(path).read_text())
def write(path,value):Path(path).write_text(json.dumps(value,allow_nan=False))
def methods():return {p:digest(p) for p in METHODS}
def guard():
    if any(digest(p)!=value for p,value in SHA.items()):raise ValueError('Recovered source no longer matches exact pre-outage bytes')
def floor(case):return case['bearingCase']['masonryCase']['verticalCase']['monolithicCase']['houseCase']['joinedCase']['floor']

def prepare(folder):
    guard();folder.mkdir(parents=True,exist_ok=True);document=read(DOCUMENT);original=copy.deepcopy(document)
    document['stages']['distributedFloor']['boundaryCase']['windIndex']=0
    check=copy.deepcopy(document);check['stages']['distributedFloor']['boundaryCase']['windIndex']=original['stages']['distributedFloor']['boundaryCase']['windIndex']
    if check!=original:raise ValueError('Only the admitted current wind index may change for the matched W0 programme')
    code="import{readFileSync}from'node:fs';import{readEngineeringDocument}from'./compiler/reference-house/current-design/engineering-document.ts';let d=JSON.parse(readFileSync(process.argv[1],'utf8'));console.log(JSON.stringify((await readEngineeringDocument(d.design)).bindings))"
    refreshed=json.loads(subprocess.check_output(['node','--import','tsx','--input-type=module','-e',code,str(DOCUMENT)],text=True))
    reviewed=[]
    for family in ('disciplines','implementations','authoredDefaults'):
        before=original['bindings'][family];after=refreshed[family]
        for path in sorted(set(before)|set(after)):
            if before.get(path)!=after.get(path):reviewed.append({'family':family,'path':path,'before':before.get(path),'after':after.get(path)})
    expected=[{'family':'implementations','path':'compiler/reference-house/current-design/structural-rear-bearing.ts',
        'before':None,'after':'b9cdfabc01ddf0f26fa081a9fc7ee02ca4ff9c64'}]
    if reviewed!=expected:raise ValueError('Unreviewed source binding change in recovery: '+json.dumps(reviewed))
    document['bindings']=refreshed
    write(folder/'binding-review.json',{'schema':'str-rear-recovery-binding-review/1','explicitSourceBindingRefresh':reviewed,
        'sameDesignAndStagesExceptAdmittedWindIndex':True,'canonicalFileChanged':False})
    write(folder/'parent-W0-document.json',document)
    from floor_section_model import load_source
    from current_finite_rc_joint import method_identities,runtime_versions
    write(folder/'execution-start.json',{'schema':'str-rear-bearing-recovery-start/1',
      'sourceCommit':subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip(),
      'canonicalDocumentSHA256':digest(DOCUMENT),'derivedDocumentSHA256':digest(folder/'parent-W0-document.json'),
      'allowedParentPerturbation':'sole semantic change: stages.distributedFloor.boundaryCase.windIndex to0; explicit reviewed new-consumer source binding refresh',
      'reviewedSourceBindingChanges':reviewed,
      'sourceSHA256':load_source(ROOT)['identities'],'finiteMethodSHA256':method_identities(ROOT),
      'runtime':runtime_versions(),'recoveredMethodSHA256':methods(),'candidateAccepted':False,
      'sharedRearStageIntegrated':False,'previousRawW0Retained':False})
    print('Prepared sole current saved parent with explicit admitted W0 perturbation',flush=True)

def execute(folder):
    guard();start=read(folder/'execution-start.json')
    if digest(DOCUMENT)!=start['canonicalDocumentSHA256'] or methods()!=start['recoveredMethodSHA256']:raise ValueError('Recovered source changed before execution')
    from current_finite_joint_signed_proof import require_document_bundle_identity
    from current_finite_joint_replay import replay
    from rear_bearing_plan import choices_defaults
    bundle=read(folder/'parent-W0-bundle.json')
    identity=require_document_bundle_identity(folder/'parent-W0-document.json',bundle)
    comp=bundle['engineering']['floorSection']['finiteJointComparison']
    if comp['status']!='computed-unselected-comparison':raise ValueError('Actual saved parent compiler did not produce its finite W0 control: '+json.dumps(comp.get('diagnostics')))
    control=comp['result'];request=comp['request']
    if control['authoredNativeCase']!=request['nativeCase'] or control['settings']!=request['settings'] or floor(request['nativeCase'])['boundaryCase']['windIndex']!=0:raise ValueError('Actual compiler parent is not the matched native W0 case')
    if control['sourceSHA256']!=start['sourceSHA256'] or control['methodSHA256']!=start['finiteMethodSHA256'] or control['runtime']!=start['runtime']:raise ValueError('Fresh parent source/method/runtime changed')
    replay(control);write(folder/'parent-W0-native.json',control)
    choices=choices_defaults();choices['execution']='compute'
    candidate={'nativeCase':request['nativeCase'],'finiteSettings':request['settings'],'choices':choices}
    write(folder/'rear-W0-request.json',candidate);write(folder/'parent-document-identity.json',identity)
    with open(folder/'rear-W0-request.json') as source,open(folder/'rear-W0-native.json','w') as output,open(folder/'rear-W0-native.log','w') as log:
        process=subprocess.run([sys.executable,'-B','project/str/studies/rear_direct_bearing.py','--checkpoint',str(folder/'rear-W0-raw-checkpoint.json')],
            stdin=source,stdout=output,stderr=log,timeout=1200,env={**os.environ,'OPENBLAS_NUM_THREADS':'1','OMP_NUM_THREADS':'1'})
    if process.returncode:raise ValueError('Fresh whole-house rear candidate failed; retained its exact execution log')
    with open(folder/'rear-W0-replay.log','w') as log:
        subprocess.run([sys.executable,'-B','project/str/studies/rear_direct_bearing_replay.py',
            '--capture',str(folder/'rear-W0-native.json'),'--checkpoint',str(folder/'rear-W0-raw-checkpoint.json'),
            '--control',str(folder/'parent-W0-native.json'),'--out',str(folder/'rear-W0-proof.json')],stdout=log,stderr=subprocess.STDOUT,check=True)
    value=read(folder/'rear-W0-native.json')
    for name,svg in value['drawings'].items():(folder/name).write_text(svg)
    if digest(DOCUMENT)!=start['canonicalDocumentSHA256'] or methods()!=start['recoveredMethodSHA256']:raise ValueError('Source changed during actual recovery execution')
    print('Fresh actual rear W0 and raw independent replay completed; adverse tests still pending',flush=True)

def finalize(folder):
    guard();start=read(folder/'execution-start.json')
    if methods()!=start['recoveredMethodSHA256'] or digest(DOCUMENT)!=start['canonicalDocumentSHA256'] or digest(folder/'parent-W0-document.json')!=start['derivedDocumentSHA256']:raise ValueError('Final source or document provenance changed')
    for name,count in [('plan-tests.log',7),('physical-tests.log',10),('adverse-tests.log',7),('parent-replay-tests.log',8)]:
        text=(folder/name).read_text()
        if ('Ran '+str(count)+' tests in') not in text or '\nOK' not in text or 'skipped=' in text:raise ValueError('Required actual recovered controls did not complete: '+name)
    proof=read(folder/'rear-W0-proof.json')
    summary={'status':'fresh-native-W0-and-independent-adverse-replay-complete',
      **start,'schema':'str-rear-bearing-recovered-proof/1','proof':proof,
      'retainedFilesSHA256':{p.name:digest(p) for p in folder.iterdir() if p.is_file()},
      'freshActualCases':{'seatedW0':True,'rearW0':True},'newRearSigned96Complete':False,
      'candidateAccepted':False,'strengthAccepted':False,'ownerAccepted':False,'sharedRearStageIntegrated':False}
    write(folder/'recovery-summary.json',summary)
    print('REAR_RECOVERY_PROOF '+json.dumps(proof,allow_nan=False),flush=True)
    print('REAR_RECOVERY_SUMMARY '+json.dumps({'sourceCommit':start['sourceCommit'],'status':summary['status'],
        'wholeGChangeKN':proof['independentMaterialAndLoadDifference']['actualHousePhysicalGChangeKN'],
        'activeBearingContacts':proof['activeBearingContactCount'],'headCount':proof['actualHeadCount']},allow_nan=False),flush=True)

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('mode',choices=['prepare','execute','finalize']);parser.add_argument('--folder',type=Path,required=True)
    args=parser.parse_args();{'prepare':prepare,'execute':execute,'finalize':finalize}[args.mode](args.folder)
