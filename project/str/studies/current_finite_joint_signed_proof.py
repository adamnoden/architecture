"""Fresh source-bound whole-house wind proofs; no incremental load replay.

The saved compiler creates the sole parent native request. Each worker changes
only its admitted windIndex, builds a fresh complete house, and independently
replays the actual result. This is verification, not another authored house.
"""
import argparse
import copy
import gzip
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys
import time

ROOT=Path('.')
METHOD='project/str/studies/current_finite_joint_signed_proof.py'

def digest_bytes(value):return hashlib.sha256(value).hexdigest()
def encoded(value):return json.dumps(value,sort_keys=True,separators=(',',':'),allow_nan=False).encode()
def digest(value):return digest_bytes(encoded(value))
def read(path):return json.loads(Path(path).read_text())
def write(path,value):
    path=Path(path);path.parent.mkdir(parents=True,exist_ok=True)
    partial=path.with_name(path.name+'.partial');partial.write_bytes(encoded(value));partial.replace(path)

def wind_floor(case):
    return case['bearingCase']['masonryCase']['verticalCase']['monolithicCase']['houseCase']['joinedCase']['floor']

def actual_sources():
    from floor_section_model import load_source
    from current_finite_rc_joint import method_identities,runtime_versions
    source=load_source(ROOT)
    return source,method_identities(ROOT),runtime_versions()

def catalogue(source):
    from distributed_floor_compatibility import _native_floor_wind
    floor=source['bearing']['base']['vertical']['parent']['house']['joined']['floor']
    rows=[_native_floor_wind(floor,i,floor['retained']['policy']['axes']) for i in range(96)]
    if len({(tuple(r['programme']),r['courtProjection']) for r in rows})!=96:raise ValueError('Complete actual96-programme source catalogue required')
    return rows

def admit_packet(packet):
    source,methods,runtime=actual_sources()
    observer='project/str/studies/finite_joint_normal_observer.py'
    replay='project/str/studies/current_finite_joint_replay.py'
    observed={'sourceSHA256':source['identities'],'methodSHA256':methods,'runtime':runtime,
              'observerSHA256':digest_bytes(Path(observer).read_bytes()),'replaySHA256':digest_bytes(Path(replay).read_bytes()),
              'proofSHA256':digest_bytes(Path(METHOD).read_bytes())}
    if packet.get('schema')!='str-current-finite-signed-input/1' or any(packet.get(k)!=v for k,v in observed.items()):raise ValueError('Current source, runtime and exact proof methods required')
    if packet['nativeCase']['sourceSHA256']!=source['identities'] or packet['catalogue']!=catalogue(source):raise ValueError('Parent native request or source catalogue changed')
    if packet['settings']['enabled'] is not True:raise ValueError('Actual enabled finite insertion required')
    return source

def make_case(packet,index):
    if type(index) is not int or not 0<=index<96:raise ValueError('Actual source windIndex0..95 required')
    case=copy.deepcopy(packet['nativeCase']);wind_floor(case)['boundaryCase']['windIndex']=index
    check=copy.deepcopy(case);wind_floor(check)['boundaryCase']['windIndex']=wind_floor(packet['nativeCase'])['boundaryCase']['windIndex']
    if check!=packet['nativeCase']:raise ValueError('Only the admitted source wind index may change')
    return case

def prepare(args):
    from current_finite_joint_replay import replay
    document=read(args.document);bundle=read(args.bundle)
    comp=bundle['engineering']['floorSection']['finiteJointComparison']
    if comp['status']!='computed-unselected-comparison':raise ValueError('Actual shared saved compiler result required')
    result=comp['result'];request=comp['request']
    if result['authoredNativeCase']!=request['nativeCase'] or result['settings']!=request['settings']:raise ValueError('Saved request/result identity differs')
    replay(result)
    source,methods,runtime=actual_sources()
    packet={'schema':'str-current-finite-signed-input/1','nativeCase':request['nativeCase'],'settings':request['settings'],
            'sourceSHA256':source['identities'],'methodSHA256':methods,'runtime':runtime,'catalogue':catalogue(source),
            'observerSHA256':digest_bytes(Path('project/str/studies/finite_joint_normal_observer.py').read_bytes()),
            'replaySHA256':digest_bytes(Path('project/str/studies/current_finite_joint_replay.py').read_bytes()),
            'proofSHA256':digest_bytes(Path(METHOD).read_bytes()),
            'controllingChoicesSHA256':digest({'design':document['design'],'stages':document['stages']}),
            'documentSnapshotSHA256':digest_bytes(Path(args.document).read_bytes()),
            'sourceCommit':subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip(),
            'parentResultSHA256':digest(result),'portIds':[p['id'] for p in result['finiteJoint']['ports']],
            'headIds':[h['id'] for h in result['native']['nativeVertical']['native']['heads']]}
    admit_packet(packet);write(args.out,packet)
    print('PREPARED actual saved house and96 distinct source wind/court programmes',flush=True)

def check_result(packet,index,result):
    from current_finite_rc_joint import uniform_concrete_case
    from current_finite_joint_replay import replay
    case=make_case(packet,index)
    if result['authoredNativeCase']!=case or result['executedConventionalCase']!=uniform_concrete_case(case,packet['settings']['youngMPa']):raise ValueError('Derived whole-house case changed')
    if result['native']['request']!=result['executedConventionalCase']:raise ValueError('Executed native request differs')
    if any(result.get(k)!=packet[k] for k in ('settings','sourceSHA256','methodSHA256','runtime')):raise ValueError('Actual result source/runtime/settings differ')
    if any(result.get(k) is not False for k in ('candidateAccepted','completeHouseProof','resistanceAccepted')):raise ValueError('No engineering acceptance may be injected')
    if [p['id'] for p in result['finiteJoint']['ports']]!=packet['portIds']:raise ValueError('Actual physical port catalogue changed')
    native=result['native']['nativeVertical']['native']
    if [h['id'] for h in native['heads']]!=packet['headIds'] or len(native['heads'])!=52:raise ValueError('Actual52-head catalogue changed')
    observation=result['normalSupportObservation']
    if observation['actualContactCount']!=32 or observation['addedForceStiffnessRestraintOrGauge'] is not False:raise ValueError('Passive actual32-body observation required')
    if observation['maximumIndependentBodyEquilibriumResidualKN']>1e-7:raise ValueError('Actual body equilibrium fails')
    return replay(result)

def one(args):
    from finite_joint_normal_observer import run_observed_current_joint
    packet=read(args.input);admit_packet(packet);started=time.monotonic()
    result=run_observed_current_joint(make_case(packet,args.index),packet['settings'],ROOT)
    check=check_result(packet,args.index,result);admit_packet(packet)
    value={'schema':'str-current-finite-signed-case/1','windIndex':args.index,'parentInputSHA256':digest(packet),
           'derivedNativeCaseSHA256':digest(make_case(packet,args.index)),'catalogueRow':packet['catalogue'][args.index],
           'elapsedSeconds':time.monotonic()-started,'result':result,'replay':check}
    data=encoded(value);path=Path(args.out);path.parent.mkdir(parents=True,exist_ok=True);partial=path.with_name(path.name+'.partial')
    with gzip.open(partial,'wb',compresslevel=6) as stream:stream.write(data)
    partial.replace(path)
    print(json.dumps({'windIndex':args.index,'elapsedSeconds':value['elapsedSeconds'],'rawSHA256':digest_bytes(data),
                     'activeContacts':result['normalSupportObservation']['activeContactCount']}),flush=True)

def shard(args):
    packet=read(args.input);admit_packet(packet)
    if type(args.shard) is not int or not 0<=args.shard<12:raise ValueError('Bounded12×8 programme shard required')
    folder=Path(args.out);folder.mkdir(parents=True,exist_ok=True);completed=[];failed=[]
    for index in range(args.shard*8,args.shard*8+8):
        target=folder/f'case-{index:02}.json.gz'
        with open(folder/f'case-{index:02}.log','w') as log:
            try:
                process=subprocess.run([sys.executable,'-B',METHOD,'one','--input',args.input,'--index',str(index),'--out',str(target)],
                    stdout=log,stderr=subprocess.STDOUT,timeout=900,env={**os.environ,'OPENBLAS_NUM_THREADS':'1','OMP_NUM_THREADS':'1'})
                code=process.returncode
            except subprocess.TimeoutExpired:code=124
        if code==0:completed.append(index)
        else:failed.append({'windIndex':index,'exitCode':code})
        print(json.dumps({'shard':args.shard,'windIndex':index,'exitCode':code}),flush=True)
    write(folder/f'shard-{args.shard:02}.json',{'schema':'str-current-finite-signed-shard/1','parentInputSHA256':digest(packet),
          'shard':args.shard,'completed':completed,'failed':failed})
    if failed:raise SystemExit(1)

def aggregate(args):
    packet=read(args.input);admit_packet(packet);folder=Path(args.captures)
    statuses=[read(p) for p in folder.rglob('shard-*.json')]
    if len(statuses)!=12 or {s['shard'] for s in statuses}!=set(range(12)):raise ValueError('All12 actual shard reports required')
    if any(s['parentInputSHA256']!=digest(packet) or s['failed'] for s in statuses):raise ValueError('A source programme failed; retained failures must be resolved, never dropped')
    if sorted(i for s in statuses for i in s['completed'])!=list(range(96)):raise ValueError('Exact96 source coverage required')
    rows=[];hashes={};head_envelope={}
    for index in range(96):
        paths=list(folder.rglob(f'case-{index:02}.json.gz'))
        if len(paths)!=1:raise ValueError('Exactly one actual capture per source programme required')
        data=gzip.decompress(paths[0].read_bytes());capture=json.loads(data)
        if capture['windIndex']!=index or capture['parentInputSHA256']!=digest(packet) or capture['derivedNativeCaseSHA256']!=digest(make_case(packet,index)) or capture['catalogueRow']!=packet['catalogue'][index]:raise ValueError('Captured case identity differs')
        result=capture['result'];check=check_result(packet,index,result)
        if check!=capture['replay']:raise ValueError('Independent saved replay differs')
        hashes[str(index)]={'rawSHA256':digest_bytes(data),'gzipSHA256':digest_bytes(paths[0].read_bytes())}
        normal=result['normalSupportObservation'];native=result['native']['nativeVertical']['native']
        for head in native['heads']:
            envelope=head_envelope.setdefault(head['id'],[{'minimum':None,'maximum':None} for _ in range(6)])
            for axis,value in enumerate(head['reactionKN_KNm']):
                cell=envelope[axis]
                if cell['minimum'] is None or value<cell['minimum']['value']:cell['minimum']={'value':value,'windIndex':index}
                if cell['maximum'] is None or value>cell['maximum']['value']:cell['maximum']={'value':value,'windIndex':index}
        rows.append({'windIndex':index,'programme':packet['catalogue'][index]['programme'],'courtProjection':packet['catalogue'][index]['courtProjection'],
                     'activeContacts':normal['activeContactCount'],'topCompressionKN':sum(r['topCompressionKN'] for r in normal['rows']),
                     'maximumBodyEquilibriumResidualKN':normal['maximumIndependentBodyEquilibriumResidualKN'],
                     'maximumHeadWrenchResidualKN_KNm':max(map(abs,check['replayedHouseWrenchResidualKN_KNm'])),
                     'maximumJointWrenchResidualKN_KNm':max(map(abs,check['independentJointWrenchResidualKN_KNm'])),
                     'jointStrainEnergyKNm':result['finiteJoint']['strainEnergyKNm'],
                     'jointWallCutActionsKN_KNm':check['wallCutActionsAboutActualCutKN_KNm'],'elapsedSeconds':capture['elapsedSeconds']})
    admit_packet(packet)
    summary={'schema':'str-current-finite-signed-proof/1','status':'all96-current-source-programmes-replayed','sourceCommit':packet['sourceCommit'],
             'controllingChoicesSHA256':packet['controllingChoicesSHA256'],'parentInputSHA256':digest(packet),
             'sourceSHA256':packet['sourceSHA256'],'methodSHA256':packet['methodSHA256'],'runtime':packet['runtime'],
             'observerSHA256':packet['observerSHA256'],'replaySHA256':packet['replaySHA256'],'proofSHA256':packet['proofSHA256'],
             'caseCount':96,'headCount':52,'portCount':len(packet['portIds']),'normalContactCount':32,'cases':rows,
             'headReactionEnvelopesKN_KNm':head_envelope,'captureIdentities':hashes,
             'scope':'All96 source wind/court permutations at the saved G/Q and conventional secant law. One finiteSW joint; three rigid corner controls. Thermal/shrinkage, differential movement, other stiffness/material cases, convergence and strength are not qualified.',
             'candidateAccepted':False,'completeHouseProof':False,'resistanceAccepted':False,'ownerAccepted':False}
    write(args.out,summary)
    print('FINITE_SIGNED_ENVELOPE_SUMMARY '+json.dumps(summary,separators=(',',':'),allow_nan=False),flush=True)

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('mode',choices=['prepare','one','shard','aggregate'])
    for flag in ('bundle','document','input','captures','out'):parser.add_argument('--'+flag)
    for flag in ('index','shard'):parser.add_argument('--'+flag,type=int)
    arguments=parser.parse_args()
    {'prepare':prepare,'one':one,'shard':shard,'aggregate':aggregate}[arguments.mode](arguments)
