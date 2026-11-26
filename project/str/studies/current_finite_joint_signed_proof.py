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
import math
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

def current_document_identity(document_path):
    code="import{readFileSync}from'node:fs';import{readEngineeringDocumentIdentity}from'./compiler/reference-house/current-design/engineering-document.ts';console.log(JSON.stringify(readEngineeringDocumentIdentity(JSON.parse(readFileSync(process.argv[1],'utf8')))))"
    return json.loads(subprocess.check_output(['node','--import','tsx','--input-type=module','-e',code,str(document_path)],text=True))

def require_document_bundle_identity(document_path,bundle):
    identity=current_document_identity(document_path)
    if bundle.get('documentIdentity')!=identity:raise ValueError('Compiled bundle does not belong to the supplied saved document')
    return identity

def require_document_snapshot(packet):
    path=Path(packet['documentPath'])
    if digest_bytes(path.read_bytes())!=packet['documentSnapshotSHA256']:raise ValueError('Current saved document differs from the prepared snapshot')
    document=read(path)
    if digest({'design':document['design'],'stages':document['stages']})!=packet['controllingChoicesSHA256']:raise ValueError('Current controlling choices differ from the prepared snapshot')


def rear_identities():
    from rear_direct_bearing import identities
    return {'rearMethodSHA256':identities(ROOT),
            'rearReplaySHA256':digest_bytes(Path('project/str/studies/rear_direct_bearing_replay.py').read_bytes())}

def admitted_parent(floor):
    rear=floor.get('rearBearingComparison')
    if rear is None:
        comp=floor['finiteJointComparison']
        if comp['status']!='computed-unselected-comparison':raise ValueError('Actual shared saved compiler result required')
        result=comp['result'];request=comp['request']
        if result['authoredNativeCase']!=request['nativeCase'] or result['settings']!=request['settings']:raise ValueError('Saved request/result identity differs')
        return request['nativeCase'],request['settings'],result,None
    if rear['status']!='computed-unselected-comparison':raise ValueError('Saved optional rear stage must be actually computed; no default fallback')
    request=rear['request'];result=rear['result']
    if (set(request)!={'nativeCase','choices','finiteSettings'} or result['authoredNativeCase']!=request['nativeCase']
        or result['choices']!=request['choices'] or result['finiteSettings']!=request['finiteSettings']):
        raise ValueError('Actual saved rear stage request/result differs')
    from rear_bearing_plan import admit_choices
    choices=admit_choices(request['choices'])
    if choices['execution']!='compute':raise ValueError('Actual computed rear stage required')
    if any(result.get(k) is not False for k in ('candidateAccepted','wholeHouseAccepted','strengthAccepted','ownerAccepted')):
        raise ValueError('Rear stage cannot inject acceptance')
    return request['nativeCase'],request['finiteSettings'],result,choices

def finite_house(result):
    return result['finiteHouseResult'] if result.get('schema')=='str-rear-direct-bearing-comparison/1' else result

def require_finite_tree(value):
    if isinstance(value,float) and not math.isfinite(value):raise ValueError('Nonfinite saved physical response')
    if isinstance(value,dict):
        for item in value.values():require_finite_tree(item)
    elif isinstance(value,(list,tuple)):
        for item in value:require_finite_tree(item)

def rear_body_catalogue(checkpoint):
    model=checkpoint['postprocessingModel'];inventory=model['lowerCoreBodies']
    fibres={f['id']:f for f in model['verticalFloor']['fibres']}
    rows=[]
    for row in inventory['contactBodies']:
        fibre=fibres[row['fibreId']]
        rows.append({**row,'sourceHeightMm':fibre['heightMm']})
    return {'ordinaryAndTailBodies':rows,'bearingBodies':model['rearDirectBearing']['bearingBodies'],
            'sourceOrdinaryCoreIds':inventory['inventory']['sourceOrdinaryCoreIds'],
            'bodyHeightMm':inventory['inventory']['bodyHeightMm']}

def check_spring_state(state,raw,mode):
    if state['mode']!=mode or state['gap']!=0 or type(state['active']) is not bool:raise ValueError('Actual source spring mode/status differs')
    value=math.fsum(coefficient*raw['displacements'][node][axis] for node,row in state['terms'] for axis,coefficient in enumerate(row))
    expected=state['stiffness']*value if state['active'] else 0.
    if abs(value-state['relativeMm'])>1e-7 or abs(expected-state['forceKN'])>1e-7:raise ValueError('Actual body/contact displacement and force law differ')
    if mode=='bilateral' and state['active'] is not True:raise ValueError('Actual axial body cannot be inactive')
    if mode=='compression' and ((state['active'] and value>1e-7) or (not state['active'] and value < -1e-7) or state['forceKN']>1e-9 or (not state['active'] and abs(state['forceKN'])>1e-7)):
        raise ValueError('Actual source normal contact carries tension or inactive force')

def check_all_rear_bodies(packet,capture,checkpoint):
    require_finite_tree(capture);require_finite_tree(checkpoint)
    model=checkpoint['postprocessingModel'];raw=checkpoint['rawResponse'];frame=model['frame']
    if rear_body_catalogue(checkpoint)!=packet['rearBodyCatalogue']:raise ValueError('Actual rear body geometry/material/law catalogue differs from prepared source')
    inventory=model['lowerCoreBodies'];rows=inventory['contactBodies'];fibres=model['verticalFloor']['fibres']
    owners=set(inventory['inventory']['sourceOrdinaryCoreIds'])
    expected=[f for f in fibres if f['ownerId'] in owners]
    if len({r['fibreId'] for r in rows})!=len(rows) or {r['fibreId'] for r in rows}!={f['id'] for f in expected} or inventory['contactBodyCount']!=len(rows):
        raise ValueError('Complete actual ordinary/tail body catalogue required')
    by_id={f['id']:f for f in expected};states={r['id']:r for r in raw['springs']}
    if len(states)!=len(raw['springs']):raise ValueError('Duplicate actual spring identity')
    case=capture['authoredNativeCase'];masonry=case['bearingCase']['masonryCase']
    density=masonry['lowerCoreBodies']['masonryUnitWeightKNPerM3']
    factor=masonry['verticalCase']['monolithicCase']['houseCase']['boundary']['physicalGFactor']
    maximum=0.
    for index,row in enumerate(rows):
        fibre=by_id[row['fibreId']];top=states[fibre['id']];body=states['LOWER-CORE/axial/'+str(index)]
        if row['xyMm']!=fibre['xyMm'] or row['areaMm2']!=fibre['areaMm2'] or row['ownerId']!=fibre['ownerId']:raise ValueError('Actual rear body source geometry changed')
        check_spring_state(top,raw,'compression');check_spring_state(body,raw,'bilateral')
        own=fibre['areaMm2']*fibre['heightMm']/1e9*density*factor
        values=[own,body['forceKN'],top['forceKN'],row['bodyPhysicalGKN'],row['bodyAxialStiffnessKNPerMm']]
        if not all(math.isfinite(v) for v in values) or abs(row['bodyPhysicalGKN']*factor-own)>1e-7:raise ValueError('Finite source body material/G required')
        load=frame['loads'].get(row['bodyTopNodeId'],[0.]*6)
        if len(load)!=6 or not all(math.isfinite(v) for v in load) or any(abs(v)>1e-9 for i,v in enumerate(load) if i!=2) or abs(load[2]+own/2)>1e-7:raise ValueError('Actual consistent source body G card changed')
        residual=-body['forceKN']+own/2+top['forceKN']-own
        if abs(residual)>1e-7 or top['mode']!='compression' or top['gap']!=0 or top['forceKN']>1e-9 or type(top['active']) is not bool or (not top['active'] and abs(top['forceKN'])>1e-7):raise ValueError('Actual rear body base/top/ownG closure fails')
        if abs(body['stiffness']-row['bodyAxialStiffnessKNPerMm'])>1e-9:raise ValueError('Actual body law changed')
        maximum=max(maximum,abs(residual))
    bearing_rows=model['rearDirectBearing']['bearingBodies'];bearing_ids=[r['id'] for r in bearing_rows]
    if len(set(bearing_ids))!=len(bearing_ids):raise ValueError('Duplicate actual bearing body identity')
    bearing_maximum=0.;active=0
    for row in bearing_rows:
        top=states[row['id']+'/top'];body=states[row['id']+'/body']
        check_spring_state(top,raw,'compression');check_spring_state(body,raw,'bilateral')
        own=row['serialLaw']['bodyPhysicalGKN']*factor;joint=row['beddingPhysicalGKN']*factor
        compression=-top['forceKN'];residual=-body['forceKN']+own/2-compression-own-joint/2
        if top['mode']!='compression' or top['gap']!=0 or type(top['active']) is not bool or compression < -1e-9 or (not top['active'] and abs(compression)>1e-7):
            raise ValueError('Actual bearing compression-only/open-contact status invalid')
        if abs(residual)>1e-7:raise ValueError('Actual bearing body/bedding own-G closure fails')
        load=frame['loads'].get(row['bodyTopNodeId'],[0.]*6)
        if len(load)!=6 or any(abs(v)>1e-9 for i,v in enumerate(load) if i!=2) or abs(load[2]+(own+joint)/2)>1e-7:
            raise ValueError('Actual bearing consistent body/bedding G card changed')
        for state,key in ((top,'topContactStiffnessKNPerMm'),(body,'bodyAxialStiffnessKNPerMm')):
            if abs(state['stiffness']-row['serialLaw'][key])>1e-9:raise ValueError('Actual bearing body law changed')
        bearing_maximum=max(bearing_maximum,abs(residual));active+=top['active']
    return {'actualOrdinaryAndTailBodyCount':len(rows),'activeOrdinaryAndTailContactCount':sum(states[r['fibreId']]['active'] for r in rows),
            'actualBearingContactCount':len(bearing_rows),'activeBearingContactCount':active,
            'maximumIndependentBodyResidualKN':maximum,'maximumIndependentBearingBodyResidualKN':bearing_maximum}

def check_rear_result(packet,index,result,checkpoint):
    from rear_direct_bearing_replay import replay as rear_replay
    require_finite_tree(result)
    if checkpoint is not None:require_finite_tree(checkpoint)
    case=make_case(packet,index);derived=copy.deepcopy(case);derived['wetSupport']=None
    if (result.get('schema')!='str-rear-direct-bearing-comparison/1' or result['authoredNativeCase']!=case
        or result['choices']!=packet['rearChoices'] or result['finiteSettings']!=packet['settings']
        or result['sourceSHA256']!=packet['sourceSHA256'] or result['methodSHA256']!=packet['rearMethodSHA256']):
        raise ValueError('Actual rear source/case/choices/method identity differs')
    if checkpoint is None:raise ValueError('Retained actual native rear checkpoint required')
    inner_packet={**packet,'nativeCase':derived};inner_packet.pop('rearChoices')
    finite=check_finite_result(inner_packet,index,result['finiteHouseResult'])
    rear=rear_replay(result,checkpoint,ROOT)
    bodies=check_all_rear_bodies(packet,result,checkpoint)
    return {**finite,'rearReplay':rear,'rearAllBodyReplay':bodies}

def read_checkpoint(path):
    data=Path(path).read_bytes()
    return json.loads(gzip.decompress(data) if str(path).endswith('.gz') else data)


def admit_reference_proof(packet,path):
    proof=read(path)
    if (proof.get('schema')!='str-current-finite-signed-proof/1' or proof.get('status')!='all96-current-source-programmes-replayed'
        or proof.get('caseCount')!=96 or set(proof['captureIdentities'])!={str(i) for i in range(96)}):
        raise ValueError('Complete retained original96 reference proof required')
    for key in ('sourceSHA256','methodSHA256','runtime','observerSHA256','replaySHA256'):
        if proof[key]!=packet[key]:raise ValueError('Retained seated reference source/method/runtime differs')
    if 'rearChoices' in proof or any(proof.get(k) is not False for k in ('candidateAccepted','completeHouseProof','resistanceAccepted','ownerAccepted')):
        raise ValueError('Only unaccepted original seated reference admitted')
    return proof

def reference_difference(packet,index,result,folder,proof):
    from rear_direct_bearing_replay import material_and_load_difference
    paths=list(Path(folder).rglob(f'case-{index:02}.json.gz'))
    if len(paths)!=1:raise ValueError('Exactly one retained seated reference capture required')
    compressed=paths[0].read_bytes();data=gzip.decompress(compressed);capture=json.loads(data);require_finite_tree(capture)
    identity=proof['captureIdentities'][str(index)]
    if digest_bytes(compressed)!=identity['gzipSHA256'] or digest_bytes(data)!=identity['rawSHA256']:
        raise ValueError('Retained seated reference capture differs from authenticated proof')
    if (capture['windIndex']!=index or capture['derivedNativeCaseSHA256']!=digest(make_case(packet,index))
        or capture['catalogueRow']!=packet['catalogue'][index] or capture['parentInputSHA256']!=proof['parentInputSHA256']):
        raise ValueError('Retained seated reference actual source case differs')
    reference_packet={**packet};reference_packet.pop('rearChoices')
    check_finite_result(reference_packet,index,capture['result'])
    return material_and_load_difference(result,capture['result'],ROOT)

def admit_packet(packet):
    require_document_snapshot(packet)
    source,methods,runtime=actual_sources()
    observer='project/str/studies/finite_joint_normal_observer.py'
    replay='project/str/studies/current_finite_joint_replay.py'
    observed={'sourceSHA256':source['identities'],'methodSHA256':methods,'runtime':runtime,
              'observerSHA256':digest_bytes(Path(observer).read_bytes()),'replaySHA256':digest_bytes(Path(replay).read_bytes()),
              'proofSHA256':digest_bytes(Path(METHOD).read_bytes())}
    if packet.get('schema')!='str-current-finite-signed-input/1' or any(packet.get(k)!=v for k,v in observed.items()):raise ValueError('Current source, runtime and exact proof methods required')
    if packet['nativeCase']['sourceSHA256']!=source['identities'] or packet['catalogue']!=catalogue(source):raise ValueError('Parent native request or source catalogue changed')
    if packet['settings']['enabled'] is not True:raise ValueError('Actual enabled finite insertion required')
    if 'rearChoices' in packet:
        from rear_bearing_plan import admit_choices
        if admit_choices(packet['rearChoices'])!=packet['rearChoices'] or packet['rearChoices']['execution']!='compute' or packet['nativeCase']['wetSupport'] is None:raise ValueError('Actual original seated reference and computed rear choices required')
        if any(packet.get(k)!=v for k,v in rear_identities().items()):raise ValueError('Rear physical producer/plan/renewal/replay identity changed')
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
    identity=require_document_bundle_identity(args.document,bundle)
    native_case,settings,result,rear_choices=admitted_parent(bundle['engineering']['floorSection'])
    active=finite_house(result)
    if rear_choices is None:replay(result)
    source,methods,runtime=actual_sources()
    if active['sourceSHA256']!=source['identities'] or active['methodSHA256']!=methods or active['runtime']!=runtime:raise ValueError('Compiled result is not current source/method/runtime')
    packet={'schema':'str-current-finite-signed-input/1','nativeCase':native_case,'settings':settings,
            'sourceSHA256':source['identities'],'methodSHA256':methods,'runtime':runtime,'catalogue':catalogue(source),
            'observerSHA256':digest_bytes(Path('project/str/studies/finite_joint_normal_observer.py').read_bytes()),
            'replaySHA256':digest_bytes(Path('project/str/studies/current_finite_joint_replay.py').read_bytes()),
            'proofSHA256':digest_bytes(Path(METHOD).read_bytes()),
            'controllingChoicesSHA256':digest({'design':document['design'],'stages':document['stages']}),
            'documentSnapshotSHA256':digest_bytes(Path(args.document).read_bytes()),'documentPath':str(args.document),'documentIdentity':identity,
            'sourceCommit':subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip(),
            'parentResultSHA256':digest(result),'portIds':[p['id'] for p in active['finiteJoint']['ports']],
            'headIds':[h['id'] for h in active['native']['nativeVertical']['native']['heads']]}
    if rear_choices is not None:
        packet.update(rearChoices=rear_choices,**rear_identities())
        path=getattr(args,'parent_checkpoint',None)
        if not path or digest_bytes(Path(path).read_bytes())!=result['rawCheckpointSHA256']:raise ValueError('Exact retained parent rear checkpoint required')
        checkpoint=read_checkpoint(path);packet['rearBodyCatalogue']=rear_body_catalogue(checkpoint)
        check_rear_result(packet,wind_floor(native_case)['boundaryCase']['windIndex'],result,checkpoint)
    reference_path=getattr(args,'reference_proof',None);reference_folder=getattr(args,'reference_captures',None)
    if reference_path or reference_folder:
        if rear_choices is None or not reference_path or not reference_folder:raise ValueError('Rear comparison reference requires both actual proof and captures')
        admit_reference_proof(packet,reference_path)
        packet['seatedReference']={'proofPath':str(reference_path),'proofSHA256':digest_bytes(Path(reference_path).read_bytes()),'capturesPath':str(reference_folder)}
    admit_packet(packet);write(args.out,packet)
    print('PREPARED actual saved house and96 distinct source wind/court programmes',flush=True)

def check_observation(packet,result):
    observation=result['normalSupportObservation'];rows=observation['rows'];ids=result['audit']['actualNormalContactIds']
    if len(rows)!=32 or len(set(ids))!=32 or [r['fibreId'] for r in rows]!=ids:raise ValueError('Complete ordered actual32-body catalogue required')
    method='project/str/studies/finite_joint_normal_observer.py'
    if observation['methodSHA256']!={method:packet['observerSHA256']}:raise ValueError('Actual passive observer method differs')
    bearings=[b for b in result['native']['nativeVertical']['bearings'] if b['id'] in set(ids)]
    if len(bearings)!=32 or len({b['id'] for b in bearings})!=32:raise ValueError('Actual native32-contact catalogue differs')
    by_id={b['id']:b for b in bearings};case=result['executedConventionalCase'];masonry=case['bearingCase']['masonryCase']
    density=masonry['lowerCoreBodies']['masonryUnitWeightKNPerM3'];factor=masonry['verticalCase']['monolithicCase']['houseCase']['boundary']['physicalGFactor'];maximum=0.
    for row in rows:
        bearing=by_id[row['fibreId']]
        if any(row[k]!=bearing[k] for k in ('xyMm','areaMm2','heightMm')):raise ValueError('Observed body geometry differs from actual native fibre')
        keys=('areaMm2','heightMm','topCompressionKN','actualAxialSpringForceKN','appliedBodyOwnGKN','actualBodyTopAppliedLoadKN','baseCompressionKN','baseMinusTopMinusOwnGKN')
        if not all(math.isfinite(row[k]) for k in keys) or type(row['topActive']) is not bool:raise ValueError('Finite physical body values and actual contact status required')
        own=row['areaMm2']*row['heightMm']/1e9*density*factor;top=row['topCompressionKN'];base=-row['actualAxialSpringForceKN']+own/2;residual=base-top-own
        errors=(row['appliedBodyOwnGKN']-own,row['actualBodyTopAppliedLoadKN']+own/2,row['baseCompressionKN']-base,row['baseMinusTopMinusOwnGKN']-residual,residual,top-bearing['normalCompressionKN'])
        if not math.isfinite(bearing['normalCompressionKN']) or any(abs(v)>1e-7 for v in errors) or top < -1e-9:raise ValueError('Independent actual body own-G/contact/base closure fails')
        if row['topActive']!=bearing['active'] or (not row['topActive'] and abs(top)>1e-7):raise ValueError('Observed/native contact status or inactive force differs')
        maximum=max(maximum,abs(residual))
    saved=observation['maximumIndependentBodyEquilibriumResidualKN']
    if not math.isfinite(saved) or abs(saved-maximum)>1e-7 or maximum>1e-7:raise ValueError('Recomputed body residual differs')
    if sum(row['topActive'] for row in rows)!=observation['activeContactCount']:raise ValueError('Recomputed active contact count differs')
    normals=[(p,v) for p,v in zip(result['finiteJoint']['ports'],result['finiteJoint']['portReactionKN_KNm']) if p['kind']=='normal']
    if len(normals)!=32 or {p['contactIndex'] for p,v in normals}!=set(range(32)):raise ValueError('Complete actual solid normal-port catalogue required')
    for port,value in normals:
        if not math.isfinite(value) or abs(value-rows[port['contactIndex']]['topCompressionKN'])>1e-6:raise ValueError('Actual solid normal-port/contact force differs')

def check_finite_result(packet,index,result):
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
    check_observation(packet,result)
    return replay(result)

def check_result(packet,index,result,checkpoint=None):
    if 'rearChoices' in packet:return check_rear_result(packet,index,result,checkpoint)
    return check_finite_result(packet,index,result)

def actual_body_adverse_controls(packet,result,index,checkpoint=None):
    labels=[]
    for label in ('dropped-body','changed-body-own-G','changed-native-contact','changed-observer-method','nonfinite-residual'):
        changed=copy.deepcopy(result);inner=finite_house(changed);normal=inner['normalSupportObservation']
        if label=='dropped-body':normal['rows'].pop()
        elif label=='changed-body-own-G':normal['rows'][0]['appliedBodyOwnGKN']+=1
        elif label=='changed-native-contact':
            identity=normal['rows'][0]['fibreId'];next(b for b in inner['native']['nativeVertical']['bearings'] if b['id']==identity)['normalCompressionKN']+=1
        elif label=='changed-observer-method':normal['methodSHA256']={}
        else:normal['maximumIndependentBodyEquilibriumResidualKN']=float('nan')
        try:check_result(packet,index,changed,checkpoint)
        except ValueError:labels.append(label)
        else:raise ValueError('Adverse actual body edit was wrongly accepted: '+label)
    return labels

def one(args):
    from finite_joint_normal_observer import run_observed_current_joint
    packet=read(args.input);admit_packet(packet);started=time.monotonic()
    checkpoint=None;checkpoint_path=Path(str(args.out)+'.checkpoint.json')
    if 'rearChoices' in packet:
        from rear_direct_bearing import run_rear_direct_bearing
        try:
            result=run_rear_direct_bearing(make_case(packet,args.index),packet['rearChoices'],packet['settings'],ROOT,checkpoint_path)
            write(str(args.out)+'.candidate.json',result)
            checkpoint=read_checkpoint(checkpoint_path)
            if digest_bytes(checkpoint_path.read_bytes())!=result['rawCheckpointSHA256']:raise ValueError('Actual raw rear checkpoint changed')
        except Exception as error:
            write(str(args.out)+'.failure.json',{'windIndex':args.index,'parentInputSHA256':digest(packet),'checkpointPath':str(checkpoint_path),'error':str(error),'postProcessingComplete':False})
            raise
    else:result=run_observed_current_joint(make_case(packet,args.index),packet['settings'],ROOT)
    try:check=check_result(packet,args.index,result,checkpoint);admit_packet(packet)
    except Exception as error:
        if 'rearChoices' in packet:write(str(args.out)+'.failure.json',{'windIndex':args.index,'parentInputSHA256':digest(packet),'checkpointPath':str(checkpoint_path),'candidatePath':str(args.out)+'.candidate.json','error':str(error),'postProcessingComplete':False})
        raise
    value={'schema':'str-current-finite-signed-case/1','windIndex':args.index,'parentInputSHA256':digest(packet),
           'derivedNativeCaseSHA256':digest(make_case(packet,args.index)),'catalogueRow':packet['catalogue'][args.index],
           'elapsedSeconds':time.monotonic()-started,'result':result,'replay':check,
           'adverseBodyControls':actual_body_adverse_controls(packet,result,args.index,checkpoint) if args.index==0 else []}
    data=encoded(value);path=Path(args.out);path.parent.mkdir(parents=True,exist_ok=True);partial=path.with_name(path.name+'.partial')
    with gzip.open(partial,'wb',compresslevel=6) as stream:stream.write(data)
    partial.replace(path)
    print(json.dumps({'windIndex':args.index,'elapsedSeconds':value['elapsedSeconds'],'rawSHA256':digest_bytes(data),
                     'activeContacts':finite_house(result)['normalSupportObservation']['activeContactCount']}),flush=True)

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
    reference=None;reference_folder=None
    if 'seatedReference' in packet:
        bound=packet['seatedReference']
        if digest_bytes(Path(bound['proofPath']).read_bytes())!=bound['proofSHA256']:raise ValueError('Bound seated reference proof changed')
        reference=admit_reference_proof(packet,bound['proofPath']);reference_folder=getattr(args,'reference_captures',None) or bound['capturesPath']
    rows=[];hashes={};head_envelope={}
    for index in range(96):
        paths=list(folder.rglob(f'case-{index:02}.json.gz'))
        if len(paths)!=1:raise ValueError('Exactly one actual capture per source programme required')
        data=gzip.decompress(paths[0].read_bytes());capture=json.loads(data)
        if capture['windIndex']!=index or capture['parentInputSHA256']!=digest(packet) or capture['derivedNativeCaseSHA256']!=digest(make_case(packet,index)) or capture['catalogueRow']!=packet['catalogue'][index]:raise ValueError('Captured case identity differs')
        result=capture['result'];checkpoint=None
        if 'rearChoices' in packet:
            checkpoint_paths=list(folder.rglob(f'case-{index:02}.json.gz.checkpoint.json'))
            if len(checkpoint_paths)!=1:raise ValueError('Exactly one retained actual rear checkpoint per programme required')
            if digest_bytes(checkpoint_paths[0].read_bytes())!=result['rawCheckpointSHA256']:raise ValueError('Captured actual rear checkpoint identity differs')
            checkpoint=read_checkpoint(checkpoint_paths[0])
        check=check_result(packet,index,result,checkpoint)
        rear_result=result if 'rearChoices' in packet else None
        difference=reference_difference(packet,index,result,reference_folder,reference) if reference is not None else None
        result=finite_house(result)
        if index==0 and capture.get('adverseBodyControls')!=['dropped-body','changed-body-own-G','changed-native-contact','changed-observer-method','nonfinite-residual']:raise ValueError('Actual body adverse controls missing')
        # Fresh replay already enforces the original physical limits. Stored
        # floating residuals can differ by last bits across hosted CPU kernels.
        if any(check[k]!=capture['replay'][k] for k in ('portCount','actualNormalCount','activeActualNormalCount')):raise ValueError('Saved replay catalogue counts differ')
        hashes[str(index)]={'rawSHA256':digest_bytes(data),'gzipSHA256':digest_bytes(paths[0].read_bytes())}
        if rear_result is not None:hashes[str(index)]['checkpointSHA256']=rear_result['rawCheckpointSHA256']
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
                     'jointWallCutActionsKN_KNm':check['wallCutActionsAboutActualCutKN_KNm'],'elapsedSeconds':capture['elapsedSeconds'],
                     **({'rearReplay':check['rearReplay'],'rearAllBodyReplay':check['rearAllBodyReplay']} if rear_result is not None else {}),
                     **({'seatedReferenceMaterialAndLoadDifference':difference} if difference is not None else {})})
    admit_packet(packet)
    summary={'schema':'str-current-finite-signed-proof/1','status':'all96-current-source-programmes-replayed','sourceCommit':packet['sourceCommit'],
             'controllingChoicesSHA256':packet['controllingChoicesSHA256'],'parentInputSHA256':digest(packet),
             'sourceSHA256':packet['sourceSHA256'],'methodSHA256':packet['methodSHA256'],'runtime':packet['runtime'],
             'observerSHA256':packet['observerSHA256'],'replaySHA256':packet['replaySHA256'],'proofSHA256':packet['proofSHA256'],
             'actualBodyAdverseControls':5,'caseCount':96,'headCount':52,'portCount':len(packet['portIds']),'normalContactCount':32,'cases':rows,
             'headReactionEnvelopesKN_KNm':head_envelope,'captureIdentities':hashes,
             'scope':'All96 source wind/court permutations at the saved G/Q and conventional secant law. One finiteSW joint; three rigid corner controls. Thermal/shrinkage, differential movement, other stiffness/material cases, convergence and strength are not qualified.',
             'candidateAccepted':False,'completeHouseProof':False,'resistanceAccepted':False,'ownerAccepted':False}
    if 'rearChoices' in packet:summary.update(rearChoices=packet['rearChoices'],rearMethodSHA256=packet['rearMethodSHA256'],rearReplaySHA256=packet['rearReplaySHA256'],rearBodyCatalogueSHA256=digest(packet['rearBodyCatalogue']))
    if reference is not None:summary['seatedReference']={'proofSHA256':packet['seatedReference']['proofSHA256'],'caseCount':96,'usedAsNewSolveInput':False}
    write(args.out,summary)
    print('FINITE_SIGNED_ENVELOPE_SUMMARY '+json.dumps(summary,separators=(',',':'),allow_nan=False),flush=True)

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('mode',choices=['prepare','one','shard','aggregate'])
    for flag in ('bundle','document','input','captures','out','parent-checkpoint','reference-proof','reference-captures'):parser.add_argument('--'+flag)
    for flag in ('index','shard'):parser.add_argument('--'+flag,type=int)
    arguments=parser.parse_args()
    {'prepare':prepare,'one':one,'shard':shard,'aggregate':aggregate}[arguments.mode](arguments)
