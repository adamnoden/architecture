"""Verify actual complete ordinary/observed bytes before retaining joint inputs.

--write requires the real captures and actual Node-admission result. --check
replays the lossless observed input and source/method joins; the crop cannot
reconstruct omitted full native bytes and never substitutes for a new solve.
"""
import argparse
import hashlib
import json
from pathlib import Path

from four_l_joint_observer import _controls, digest
from four_l_joint_recovery import recover, verify_passivity

ROOT=Path(__file__).resolve().parents[3]
METHOD='project/str/studies/four_l_joint_proof.py'
METHODS=('compiler/reference-house/current-design/structural-four-l-joint-adapter.ts',
    'project/str/studies/four_l_joint_observer.py','project/str/studies/four_l_joint_recovery.py')
PROOF=ROOT/'project/str/studies/four-l-joint-proof.json'


def file_sha(path):return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def methods():return {p:file_sha(ROOT/p) for p in METHODS}


def source_current(identities):
    if not isinstance(identities,dict) or len(identities)!=58:
        raise ValueError('Actual58-source native tuple required')
    for path,identity in identities.items():
        if not path.startswith('project/') or '..' in path.split('/') or file_sha(ROOT/path)!=identity:
            raise ValueError('Stale actual native source: '+path)


def witness(ordinary,observed):
    observation=observed['observation']
    return {'schema':'str-four-L-joint-passivity-witness/1',**verify_passivity(ordinary,observed),
        'sourceSHA256':observation['sourceSHA256'],'executedRequest':observation['request'],
        'caseId':observation['caseId'],'runtimeThreads':observation['runtimeThreads'],
        'methodSourceSHA256':methods()}


def check(proof):
    if proof.get('schema')!='str-four-L-actual-joint-demand-proof/1':raise ValueError('Actual joint proof required')
    source_current(proof['sourceSHA256'])
    if proof['processingSourceSHA256']!={**methods(),METHOD:file_sha(ROOT/METHOD)}:
        raise ValueError('Stale joint observer/consumer/producer source')
    ordinary=proof['ordinaryControl'];observed=proof['exactObservedInput'];observation=observed['observation']
    if observation['methodSourceSHA256']!={p:methods()[p] for p in METHODS[1:]}:
        raise ValueError('Retained observation used another actual method; rerun rather than rehash')
    if (proof['sourceSHA256']!=observation['sourceSHA256'] or proof['witness']!=witness(ordinary,observed)
            or observed['freeBodies']!=recover(observation)):
        raise ValueError('Actual source/witness/free-body replay differs')
    captures=proof['verifiedFullCaptures'];node=proof['actualNodeAdmission']
    if (captures['exactFullNativeBytesEqual'] is not True
            or captures['retainedCropReconstructsCompleteNativeBytes'] is not False
            or captures['ordinaryFullCaptureFileSHA256']!=captures['observedFullCaptureFileSHA256']
            or len(captures['ordinaryFullCaptureFileSHA256'])!=64
            or node['actualNodeAdmissionPassing'] is not True or node['physicalHeadCount']!=52
            or node['methodSourceSHA256']!=methods()
            or node['nativeResultSHA256']!=observation['fullNativeResultSHA256']
            or node['jointDemands']!={**observed['freeBodies'],
                'status':'computed-rigid-joint-demand','methodSourceSHA256':methods(),
                'nativeResultSHA256':observation['fullNativeResultSHA256'],
                'patchOwnGAlreadyIncludedInPlateContribution':True,
                'diagnostics':['FOUR_L_JOINT/finite-joint-laws-and-resistance-unqualified',
                    'FOUR_L_JOINT/complete-signed-demand-envelope-unavailable']}
            or proof['finiteJointCapacityAvailable'] is not False or proof['completeHouseProof'] is not False
            or proof['candidateAccepted'] is not False):
        raise ValueError('Actual complete-byte/Node admission or explicit proof boundary lost')
    return proof


def write(ordinary_path,ordinary_manifest,observed_path,envelope_path,node_path):
    ordinary_path,ordinary_manifest,observed_path,envelope_path,node_path=map(Path,
        (ordinary_path,ordinary_manifest,observed_path,envelope_path,node_path))
    old=json.loads(ordinary_path.read_bytes());manifest=json.loads(ordinary_manifest.read_bytes())
    actual=json.loads(observed_path.read_bytes());envelope=json.loads(envelope_path.read_bytes())
    node=json.loads(node_path.read_bytes());observation=envelope['observation']
    source_current(actual['sourceSHA256'])
    if (manifest['schema']!='str-full-native-control-capture/1'
            or manifest['fullResultSHA256']!=file_sha(ordinary_path)
            or manifest['sourceSHA256']!=old['sourceSHA256'] or manifest['request']!=old['request']
            or manifest['nativeCaseId']!=old['nativeVertical']['native']['caseId']):
        raise ValueError('Original complete ordinary capture manifest mismatch')
    if ordinary_path.read_bytes()!=observed_path.read_bytes():
        raise ValueError('Actual complete native bytes differ; strict passivity FAILED')
    if (envelope['nativeResultJSON']!=json.dumps(actual,sort_keys=True,separators=(',',':'),allow_nan=False)
            or digest(actual)!=observation['fullNativeResultSHA256']):
        raise ValueError('Observed envelope does not bind the actual complete native bytes')
    ordinary={'schema':'str-four-L-joint-ordinary-control/1','sourceSHA256':old['sourceSHA256'],
        'requestSHA256':digest(old['request']),'caseId':old['nativeVertical']['native']['caseId'],
        'runtimeThreads':observation['runtimeThreads'],**_controls(old)}
    observed={key:envelope[key] for key in ('observation','freeBodies')}
    proof={'schema':'str-four-L-actual-joint-demand-proof/1','sourceSHA256':actual['sourceSHA256'],
        'processingSourceSHA256':{**methods(),METHOD:file_sha(ROOT/METHOD)},
        'witness':witness(ordinary,observed),'ordinaryControl':ordinary,'exactObservedInput':observed,
        'verifiedFullCaptures':{'ordinaryFullCaptureFileSHA256':file_sha(ordinary_path),
            'ordinaryManifestFileSHA256':file_sha(ordinary_manifest),
            'observedFullCaptureFileSHA256':file_sha(observed_path),
            'observedEnvelopeFileSHA256':file_sha(envelope_path),'actualNodeAdmissionFileSHA256':file_sha(node_path),
            'exactFullNativeBytesEqual':True,'retainedCropReconstructsCompleteNativeBytes':False},
        'actualNodeAdmission':node,'finiteJointCapacityAvailable':False,'completeHouseProof':False,'candidateAccepted':False,
        'scope':'One actual f25 wet-aligned quadrature8 request only. Original ordinary and passive observed full native bytes, all52heads and all existing cuts match exactly. Retained observed inputs replay the eight physical L end cuts and four rigid-joint six-component free bodies; no new G, finite joint law, signed envelope, local capacity or house acceptance. Original full bytes/manifest remain separate execution captures; this crop cannot regenerate them.'}
    check(proof);PROOF.write_text(json.dumps(proof,indent=2,allow_nan=False)+'\n');return proof


if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__);mode=parser.add_mutually_exclusive_group(required=True)
    mode.add_argument('--write',action='store_true');mode.add_argument('--check',action='store_true')
    for name in ('ordinary-full','ordinary-manifest','observed-full','observed-envelope','node-admission'):
        parser.add_argument('--'+name,type=Path)
    args=parser.parse_args()
    if args.write:
        values=[args.ordinary_full,args.ordinary_manifest,args.observed_full,args.observed_envelope,args.node_admission]
        if any(value is None for value in values):parser.error('--write requires all five actual capture/admission paths')
        proof=write(*values)
    else:proof=check(json.loads(PROOF.read_bytes()))
    print(json.dumps({'strictPassivityPassing':True,'exactFullNativeBytesEqual':True,
        'physicalHeads':52,'jointCount':len(proof['exactObservedInput']['freeBodies']['joints']),
        'maximumJointResidualKN_KNm':proof['exactObservedInput']['freeBodies']['maximumAbsoluteResidualKN_KNm'],
        'finiteJointCapacityAvailable':False}))
