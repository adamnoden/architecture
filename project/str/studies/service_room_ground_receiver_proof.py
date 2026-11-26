"""Replay authenticated current two-room cuts and a same-input contact edit.

Archives are inspection evidence only. The compiler never consumes them as a
current result. The opposite-end checker supplies an independent equilibrium
reconstruction, not resistance or material/contact convergence.
"""
import hashlib,json,math,tarfile
from pathlib import Path
from service_room_ground_receiver_replay import check,extract,adversarial,FIELDS

D=Path(__file__).resolve().parent
ROOT=D.parents[2]
ARCHIVE=D/'service-room-ground-receiver-captures-20261126.tar.xz'
PROOF=D/'service-room-ground-receiver-proof.json'
OLD=D/'service-room-ground-observed-two-room-20261126.tar.xz'
METHOD='project/str/studies/service_room_ground.py'

def sha(data):return hashlib.sha256(data).hexdigest()

def heads(response):
    rows=response['native']['heads']
    result={r['id']:r['reactionKN_KNm'] for r in rows}
    if len(rows)!=52 or len(result)!=52 or any(len(w)!=6 or not all(math.isfinite(v) for v in w) for w in result.values()):raise ValueError('Actual52-head six-component response required')
    if max(map(abs,response['native']['equilibriumResidualKN_KNm']))>1e-5:raise ValueError('Whole coupled equilibrium unavailable')
    return result

def produce():
    with tarfile.open(ARCHIVE) as archive:data={m.name:archive.extractfile(m).read() for m in archive.getmembers() if m.isfile()}
    saved=json.loads(data['saved-document-and-result.json']);current=saved['groundPocketLoads'];fine=json.loads(data['contact125.json'])
    with tarfile.open(OLD) as archive:old=json.load(archive.extractfile('saved-document-and-ground-result.json'))['groundPocketLoads']
    source=current['method']['sourceSHA256']
    for path,expected in {**current['request']['nativeCase']['sourceSHA256'],**source}.items():
        if sha((ROOT/path).read_bytes())!=expected:raise ValueError('Current native or comparison method changed: '+path)
    for path,expected in source.items():
        if sha(data['methods/'+path])!=expected:raise ValueError('Archived executed method bytes changed: '+path)
    request=current['request'];changed=fine['experimentalRequest']
    expected=json.loads(json.dumps(request));expected['caseId']+=':contact125';expected['settings']['contactPitchMm']=125
    if changed!=expected or fine['experimentalMethodSHA256']!={METHOD:source[METHOD]} or fine['sourceSHA256']!=request['nativeCase']['sourceSHA256']:raise ValueError('Contact perturbation lost exact saved input/source identity')
    if request['nativeCase']!=old['request']['nativeCase']:raise ValueError('Prior ordinary physical case differs')
    without_origin=lambda bodies:[{k:v for k,v in b.items() if k!='source'} for b in bodies]
    if without_origin(request['structuralFloorBodies'])!=without_origin(old['request']['structuralFloorBodies']):raise ValueError('Prior and current physical room bodies differ')
    baseline_heads=heads(current);old_heads=heads(old)
    if baseline_heads.keys()!=old_heads.keys():raise ValueError('Prior foundation catalogue differs')
    maximum=max(abs(a-b) for name in baseline_heads for a,b in zip(baseline_heads[name],old_heads[name]))
    if maximum>1e-7:raise ValueError('Receiver recovery changed the actual coupled solve')
    controls=[]
    for name,response in [('saved-current',current),('contact125',fine)]:
        cuts,factor=extract(response);body=response['comparison'];native_heads=heads(response)
        if native_heads.keys()!=baseline_heads.keys() or response['candidateAccepted'] or response['wholeHouseAccepted']:raise ValueError('Perturbation loses heads or invents acceptance')
        fibres=[f for b in body['bodies'] for f in b['fibres']]
        expected_ids={f['receiverId'] for f in fibres}
        if set(cuts['serviceReceiverIds'])!=expected_ids or len(cuts['actualServiceBodyOriginIds'])!=len(fibres):raise ValueError('Actual receiver/contact catalogue lost')
        if set(cuts['gravitySourceInventories'])!={'lower-core/base-G','lower-core/free-G','foundation/solid-G','ground-pocket/mineral-base-G'}:raise ValueError('Existing source gravity family missing')
        if cuts['gravitySourceInventories']['ground-pocket/mineral-base-G']['sourcePieceCount']!=len(fibres):raise ValueError('Actual mineral base-half source-piece inventory lost')
        if abs(body['addedPhysicalGKN']-current['comparison']['addedPhysicalGKN'])>1e-9:raise ValueError('Contact edit changed physical stock gravity')
        report=check(cuts,factor);report['adverseControls']=adversarial(cuts,factor)
        controls.append({'id':name,'captureSHA256':sha(data['saved-document-and-result.json' if name=='saved-current' else 'contact125.json']),
            'contactCount':len(fibres),'receiverCount':len(cuts['serviceReceiverIds']),'originCount':cuts['originCount'],
            'knownUnfactoredGKN':body['addedPhysicalGKN'],'factoredKnownGridGKN':sum(b['gridCompressionKN'] for b in body['bodies']),
            'memberLoadEquilibriumResidualKN_KNm':cuts['memberLoadEquilibrium']['maximumResidualKN_KNm'],'independentRightEndReplay':report})
    a={ (r['memberId'],r['end']):r for r in current['comparison']['receiverCutRecovery']['memberCuts'] }
    b={ (r['memberId'],r['end']):r for r in fine['comparison']['receiverCutRecovery']['memberCuts'] }
    if a.keys()!=b.keys():raise ValueError('Actual physical receiver end catalogue changed')
    changes={field:max(abs(a[k][field]-b[k][field]) for k in a) for field in FIELDS}
    if max(changes.values())<1e-5:raise ValueError('Contact perturbation did not recompute local demand')
    return {'schema':'str-current-room-receiver-proof/1','scope':'Exact saved two-room known-gravity comparison and same-source contact edit; no whole raised house or complete installed inventory.',
        'sourceSHA256':source,'nativeSourceSHA256':request['nativeCase']['sourceSHA256'],'captureArchiveSHA256':sha(ARCHIVE.read_bytes()),
        'replayMethodSHA256':{p:sha((ROOT/p).read_bytes()) for p in ['project/str/studies/service_room_ground_receiver_proof.py','project/str/studies/service_room_ground_receiver_replay.py']},
        'priorTwoRoomArchiveSHA256':sha(OLD.read_bytes()),'priorMaximum312HeadComponentDifferenceKN_KNm':maximum,
        'controls':controls,'contactEditMaximumPhysicalEndChanges':changes,'contactConverged':False,'completeSignedDemandEnvelopeAvailable':False,
        'completeInstalledInventory':False,'jointOrReceiverResistanceAccepted':False,'candidateAccepted':False,'wholeHouseAccepted':False}

if __name__=='__main__':
    import sys
    result=produce();text=json.dumps(result,indent=2,allow_nan=False)+'\n'
    if '--check' in sys.argv:
        if PROOF.read_text()!=text:raise ValueError('Stale current room receiver proof')
    else:PROOF.write_text(text)
    print('Current room receiver cuts independently close; contact changes demand at unchanged stock. No resistance or house acceptance.')
