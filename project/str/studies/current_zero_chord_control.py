"""Standalone paired W0 control of exact zero additional axial-chord EA.

Authenticated historical nativeCase controls are inputs, never historical forces.
Fresh loaders bind a NEW request to the sole permitted admission-only source edit.
No current saved-source/account adoption or reinforcement acceptance is implied.
"""
import argparse
import copy
import gzip
import hashlib
import json
from pathlib import Path
import traceback

import numpy as np

GUARD='project/str/studies/distributed_floor_compatibility.py'
OLD_GUARD="band['axialRigidityKN'] <= 0"
NEW_GUARD="band['axialRigidityKN'] < 0"
MEMBRANE='project/str/studies/perforated_floor_condensation.py'
OLD_MEMBRANE="math.isfinite(value) and value > 0 for key, value in law.items() if key != 'poissonRatio'"
NEW_MEMBRANE="math.isfinite(value) and (value > 0 or key == 'edgeAxialRigidityKN' and type(value) in (int,float) and value == 0) for key, value in law.items() if key != 'poissonRatio'"
OLD_SCHUR="""        for a, x in neighbours:
            work[a].pop(index, None)
            target = work[a]"""
NEW_SCHUR="""        for target in work.values():
            target.pop(index, None)
        for a, x in neighbours:
            target = work[a]"""
SCHEMA='str-zero-extra-chord-W0-input/1'

def encode(x):return json.dumps(x,sort_keys=True,separators=(',',':'),allow_nan=False).encode()
def digest(x):return hashlib.sha256(encode(x)).hexdigest()
def sha(path):return hashlib.sha256(Path(path).read_bytes()).hexdigest()
def read(path):
    p=Path(path);data=p.read_bytes()
    return json.loads(gzip.decompress(data) if p.suffix=='.gz' else data)
def write(path,x):
    p=Path(path);p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(encode(x)+b'\n')
def floor(case):return case['bearingCase']['masonryCase']['verticalCase']['monolithicCase']['houseCase']['joinedCase']['floor']
def without_identities(x):
    if isinstance(x,dict):return {k:without_identities(v) for k,v in x.items() if k!='sourceSHA256'}
    if isinstance(x,list):return [without_identities(v) for v in x]
    return x

def current_sources():
    from floor_section_model import load_source
    from current_finite_rc_joint import method_identities,runtime_versions
    return load_source(Path('.')),method_identities(Path('.')),runtime_versions()

def bind_new_input(old,old_sources,current):
    """Derive new INPUT identities only; never mutate a historical receipt."""
    if isinstance(old,dict):
        result={}
        for key,value in old.items():
            if key=='sourceSHA256':
                if not isinstance(value,dict) or any(p not in old_sources or old_sources[p]!=h or p not in current for p,h in value.items()):
                    raise ValueError('Unowned or unauthenticated nested native input source')
                result[key]={p:current[p] for p in value}
            else:result[key]=bind_new_input(value,old_sources,current)
        return result
    if isinstance(old,list):return [bind_new_input(v,old_sources,current) for v in old]
    return copy.deepcopy(old)

def derive_inputs(parent,summary):
    source,methods,runtime=current_sources();identities=source['identities']
    observer='project/str/studies/finite_joint_normal_observer.py'
    if sha(observer)!=summary['observerSHA256']:raise ValueError('Actual observer method changed')
    if parent['sourceSHA256']!=summary['sourceSHA256'] or parent['methodSHA256']!=summary['methodSHA256'] or parent['runtime']!=summary['runtime']:
        raise ValueError('Authenticated actual parent source/method/runtime differs')
    if set(identities)!=set(summary['sourceSHA256']) or len(identities)!=58 or methods!=summary['methodSHA256'] or runtime!=summary['runtime']:
        raise ValueError('Native inventory, finite methods or original runtime changed')
    changed=[p for p in identities if identities[p]!=summary['sourceSHA256'][p]]
    if set(changed)!={GUARD,MEMBRANE}:raise ValueError('Only the two explicitly authorised admission guards may change')
    for path,changes in ((GUARD,((OLD_GUARD,NEW_GUARD),)),(MEMBRANE,((OLD_MEMBRANE,NEW_MEMBRANE),(OLD_SCHUR,NEW_SCHUR)))):
        text=Path(path).read_text()
        for old_part,new_part in changes:
            if text.count(new_part)!=1 or old_part in text:raise ValueError('Unowned source edit: '+path)
            text=text.replace(new_part,old_part)
        if hashlib.sha256(text.encode()).hexdigest()!=summary['sourceSHA256'][path]:
            raise ValueError('Owning source change exceeds exact authorised guards/index repair: '+path)
    old=parent['authoredNativeCase'];before=digest(parent)
    positive=bind_new_input(old,summary['sourceSHA256'],identities)
    if without_identities(positive)!=without_identities(old) or floor(positive)['boundaryCase']['windIndex']!=0 or floor(positive)['edgeBand']['axialRigidityKN']<=0:
        raise ValueError('Actual positive W0 authored controls must remain unchanged')
    zero=copy.deepcopy(positive);floor(zero)['edgeBand']['axialRigidityKN']=0.
    check=copy.deepcopy(zero);floor(check)['edgeBand']['axialRigidityKN']=floor(positive)['edgeBand']['axialRigidityKN']
    if check!=positive or digest(parent)!=before:raise ValueError('Zero trial altered other controls or historical receipt')
    from distributed_floor_compatibility import _admit_distributed
    owner=source['bearing']['base']['vertical']['parent']['house']['joined']['floor']
    _admit_distributed(floor(positive),owner);_admit_distributed(floor(zero),owner)
    return {'schema':SCHEMA,'settings':parent['settings'],'cases':{'positive':positive,'zero':zero},
            'sourceSHA256':identities,'methodSHA256':methods,'runtime':runtime,
            'parentSourceSHA256':summary['sourceSHA256'],'parentSummarySemanticSHA256':digest(summary),
            'observerSHA256':summary['observerSHA256'],'runnerSHA256':sha('project/str/studies/current_zero_chord_control.py'),
            'authenticatedParentNativeInputSHA256':digest(old),'historicalReceiptSHA256':before,
            'sourceChanges':[{'path':p,'oldSHA256':summary['sourceSHA256'][p],'newSHA256':identities[p],
                              'scope':('Finite exact-zero additional axial-chord admission' if p==GUARD else 'Finite exact-zero extra-chord admission and eliminated-column bookkeeping repair; pivot/fill/force formulas/order/tolerances unchanged')} for p in (GUARD,MEMBRANE)],
            'inputDerivation':'Authenticated nativeCase controls only, freshly bound through current authoritative source identities. Historical response arrays never supply assembly.',
            'currentSavedEngineeringDocumentAdmitted':False,
            'integrationDebt':'Exploratory branch only. Owning source-account/current-model identities and applicable consumers require legitimate migration before adoption.'}

def admit(packet):
    source,methods,runtime=current_sources()
    if packet['schema']!=SCHEMA or packet['sourceSHA256']!=source['identities'] or packet['methodSHA256']!=methods or packet['runtime']!=runtime or packet['observerSHA256']!=sha('project/str/studies/finite_joint_normal_observer.py') or packet['runnerSHA256']!=sha('project/str/studies/current_zero_chord_control.py'):
        raise ValueError('Prepared new input source/method/runtime is stale')
    return source

def prepare(args):
    capture=read(args.parent);summary=read(args.summary)
    if capture.get('schema')!='str-current-finite-signed-case/1' or capture['windIndex']!=0:
        raise ValueError('Exact authenticated actual W0 wrapper required')
    data=Path(args.parent).read_bytes();raw=gzip.decompress(data)
    ids=summary['captureIdentities']['0']
    if hashlib.sha256(data).hexdigest()!=ids['gzipSHA256'] or hashlib.sha256(raw).hexdigest()!=ids['rawSHA256']:
        raise ValueError('Full original W0 raw/gzip identity differs')
    from current_finite_joint_replay import replay
    replay(capture['result'])
    packet=derive_inputs(capture['result'],summary);admit(packet);write(args.out,packet)
    print('PREPARED fresh native inputs for same positive W0 and exact zero-extra W0')

def one(args):
    packet=read(args.input);admit(packet);case=packet['cases'][args.name]
    from finite_joint_normal_observer import run_observed_current_joint
    from current_finite_joint_replay import replay
    from current_finite_rc_joint import uniform_concrete_case
    try:
        result=run_observed_current_joint(case,packet['settings'],Path('.'))
        if result['authoredNativeCase']!=case or result['executedConventionalCase']!=uniform_concrete_case(case,packet['settings']['youngMPa']) or result['native']['request']!=result['executedConventionalCase']:
            raise ValueError('Fresh executed request changed')
        if any(result[k]!=packet[k] for k in ('sourceSHA256','methodSHA256','runtime','settings')):raise ValueError('Fresh source/runtime/settings differ')
        check=replay(result)
        if result['normalSupportObservation']['methodSHA256']!={'project/str/studies/finite_joint_normal_observer.py':packet['observerSHA256']}:raise ValueError('Actual observer result identity differs')
        extra=floor(case)['edgeBand']['axialRigidityKN']
        if abs(result['audit']['explicitConcreteBandEAKN']-231000.)>1e-8 or result['audit']['retainedSteelChordEAKN']!=extra:
            raise ValueError('Zero additional chord removed or replaced physical RC axial energy')
        if any(result[k] is not False for k in ('candidateAccepted','completeHouseProof','resistanceAccepted')):raise ValueError('No acceptance injection')
        admit(packet)
        value={'schema':'str-zero-extra-chord-W0-case/1','name':args.name,'inputPacketSHA256':digest(packet),'nativeInputSHA256':digest(case),
               'historicalOutputUsedForAssembly':False,'result':result,'replay':check}
        p=Path(args.out);p.parent.mkdir(parents=True,exist_ok=True)
        with gzip.open(p,'wb',compresslevel=6) as stream:stream.write(encode(value))
        print('FRESH_ZERO_CHORD_CASE '+json.dumps({'name':args.name,'extraSteelEAKN':extra,'concreteEAKN':result['audit']['explicitConcreteBandEAKN'],
            'maximumHouseWrenchResidualKN_KNm':max(map(abs,check['replayedHouseWrenchResidualKN_KNm'])),
            'maximumJointWrenchResidualKN_KNm':max(map(abs,check['independentJointWrenchResidualKN_KNm']))}))
    except Exception:
        write(str(args.out)+'.failure.json',{'schema':'str-zero-extra-chord-W0-failure/1','name':args.name,'inputPacketSHA256':digest(packet),
            'nativeInputSHA256':digest(case),'failure':traceback.format_exc(),'failedCaseRetained':True,'candidateAccepted':False})
        raise

def head_map(result):return {h['id']:h['reactionKN_KNm'] for h in result['native']['nativeVertical']['native']['heads']}
def maximum_delta(a,b):
    if set(a)!=set(b):raise ValueError('Actual named catalogue changed')
    return max(abs(x-y) for key in a for x,y in zip(a[key],b[key]))

def aggregate(args):
    packet=read(args.input);admit(packet)
    values={name:read(Path(args.captures)/(name+'.json.gz')) for name in ('positive','zero')}
    from current_finite_joint_replay import replay
    for name,value in values.items():
        if value['name']!=name or value['inputPacketSHA256']!=digest(packet) or value['nativeInputSHA256']!=digest(packet['cases'][name]):
            raise ValueError('Actual fresh result input differs')
        replay(value['result'])
    positive=values['positive']['result'];zero=values['zero']['result']
    historical=read(args.parent)['result']
    baseline_delta=maximum_delta(head_map(positive),head_map(historical))
    if baseline_delta>1e-6:raise ValueError('Unchanged positive control changed physical head mechanics')
    pnative=positive['native']['nativeVertical']['native'];znative=zero['native']['nativeVertical']['native']
    wrench_delta=np.asarray(pnative['externalWrenchKN_KNm'])-np.asarray(znative['externalWrenchKN_KNm'])
    if max(abs(wrench_delta))>1e-6 or abs(positive['audit']['actualJointGKN']-zero['audit']['actualJointGKN'])>1e-8:
        raise ValueError('Stiffness-only control lost/doubled physical force origins or G')
    if positive['finiteJoint']['ports']!=zero['finiteJoint']['ports'] or positive['audit']['actualNormalContactIds']!=zero['audit']['actualNormalContactIds']:
        raise ValueError('Zero trial changed physical port/contact geometry')
    heads_p=head_map(positive);heads_z=head_map(zero)
    head_deltas=[{'id':key,'deltaKN_KNm':[b-a for a,b in zip(heads_p[key],heads_z[key])]} for key in heads_p]
    ports=positive['finiteJoint']['ports'];scale=np.array([.001 if p['coordinate'] in ('rx','ry','rz') else 1. for p in ports])
    delta=np.asarray(positive['finiteJoint']['condensedStiffnessKN_KNm'])-np.asarray(zero['finiteJoint']['condensedStiffnessKN_KNm'])
    scaled=scale[:,None]*delta*scale[None,:];eigen=np.linalg.eigvalsh((scaled+scaled.T)/2)
    relative=float(eigen[0]/max(1.,max(abs(eigen))))
    if relative < -1e-8:raise ValueError('Removed finite chord contribution violates original energy tolerance')
    rows={}
    for name,value in values.items():
        r=value['result'];native=r['native']['nativeVertical']['native'];heads=head_map(r);normal=r['normalSupportObservation']
        movement={p['id']:p['displacementMmMrad'] for p in native['floorInterfacePorts']}
        rows[name]={'additionalAxialChordEAKN':floor(packet['cases'][name])['edgeBand']['axialRigidityKN'],'concreteBandEAKN':r['audit']['explicitConcreteBandEAKN'],
            'minimumHeadFzKN':min(v[2] for v in heads.values()),'maximumHeadFzKN':max(v[2] for v in heads.values()),
            'tensileHeadCount':sum(v[2]<0 for v in heads.values()),'maximumFrameTranslationMm':native['maximumFrameTranslationMm'],
            'maximumRoofRingTranslationMm':r['native']['roofCoupling']['maximumRingTranslationMm'],
            'maximumFloorInterfaceTranslationMm':max(float(np.linalg.norm(v[:2])) for v in movement.values()),'floorPortMovementsMmMrad':movement,
            'activeContactCount':normal['activeContactCount'],'topCompressionKN':sum(x['topCompressionKN'] for x in normal['rows']),
            'maximumBodyEquilibriumResidualKN':normal['maximumIndependentBodyEquilibriumResidualKN'],
            'jointStrainEnergyKNm':r['finiteJoint']['strainEnergyKNm'],
            'actualWallCutActionsKN_KNm':value['replay']['wallCutActionsAboutActualCutKN_KNm'],
            'maximumHouseWrenchResidualKN_KNm':max(map(abs,value['replay']['replayedHouseWrenchResidualKN_KNm'])),
            'maximumJointWrenchResidualKN_KNm':max(map(abs,value['replay']['independentJointWrenchResidualKN_KNm']))}
    report={'schema':'str-zero-extra-chord-W0-comparison/1','status':'fresh-positive-and-exact-zero-W0-computed-unselected',
        'sourceSHA256':packet['sourceSHA256'],'methodSHA256':packet['methodSHA256'],'runtime':packet['runtime'],'sourceChanges':packet['sourceChanges'],
        'inputPacketSHA256':digest(packet),'historicalPositiveControlMaximumHeadDeltaKN_KNm':baseline_delta,
        'actualHeadDeltasZeroMinusPositiveKN_KNm':head_deltas,'maximumHeadDeltaKN_KNm':maximum_delta(heads_p,heads_z),
        'samePhysicalAppliedWrenchResidualKN_KNm':wrench_delta.tolist(),'finiteChordRemovalMinimumRelativeEigenvalue':relative,
        'cases':rows,'scope':'Two freshly assembled actual200mm W0 houses. One finiteSW joint and three rigid corner controls; G/Q and physical geometry unchanged. Exact zero removes additional axial chord only. No96 zero-chord envelope or monotonic/conservative demand claim.',
        'currentSavedEngineeringDocumentAdmitted':False,'integrationDebt':packet['integrationDebt'],
        'candidateAccepted':False,'resistanceAccepted':False,'completeHouseProof':False,'reinforcementAccepted':False,'ownerAccepted':False}
    write(args.out,report)
    small={k:v for k,v in report.items() if k not in ('sourceSHA256','methodSHA256','actualHeadDeltasZeroMinusPositiveKN_KNm','cases')}
    small['cases']={name:{k:v for k,v in row.items() if k!='floorPortMovementsMmMrad'} for name,row in rows.items()}
    print('ZERO_CHORD_W0_COMPARISON '+json.dumps(small,separators=(',',':'),allow_nan=False))

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('mode',choices=('prepare','one','aggregate'))
    for flag in ('parent','summary','input','captures','out'):p.add_argument('--'+flag)
    p.add_argument('--name',choices=('positive','zero'));a=p.parse_args()
    {'prepare':prepare,'one':one,'aggregate':aggregate}[a.mode](a)
