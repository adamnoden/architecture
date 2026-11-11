"""Compact exact-root vector ledger for the stronger80 mm spreader comparison.

The detailed inventory remains unselected. This exports known atoms only and
leaves original fixed stock and seam load sharing explicitly unresolved.
"""
from pathlib import Path
import argparse
import hashlib
import itertools
import json
import math

HERE=Path(__file__).resolve().parent
parser=argparse.ArgumentParser()
parser.add_argument('--check',action='store_true')
args=parser.parse_args()
source=HERE/'outer-66-pieces.json'
data=json.loads(source.read_text())


def add(rows):
    return {key:[sum(row[key][j] for row in rows) for j in range(3)] for key in
        ['forceXYZ_N','momentXYZ_NMM','nativeDownMxGradientMyGradient_N_NMM_NMM']}


def gravity(mass,xy,root):
    f=9.81*mass;dx,dy=xy[0]-root[0],xy[1]-root[1]
    return {'forceXYZ_N':[0.,0.,-f],'momentXYZ_NMM':[-f*dy,f*dx,0.],
        'nativeDownMxGradientMyGradient_N_NMM_NMM':[f,f*dx,f*dy]}


def world(face,r,u):
    if face=='north':return [u,12000+r]
    if face=='south':return [u,-r]
    if face=='east':return [12000+r,u]
    return [-r,u]


roots=[];max_error=0.
for record in data['rootLedger']:
    pieces=[p for p in data['pieces'] if p['sourceRootId']==record['sourceRootId']]
    support=next((s for s in data['retainedSpreaderCandidates'] if s['sourceRootId']==record['sourceRootId']),None)
    retained=[a for a in support['atoms']] if support else []
    known=[]
    for piece in pieces:
        for a in piece['atoms']:
            recomputed=gravity(a['massKG'],a['centroidWorldXYMM'],record['nativeRootWorldXYMM'])
            for key in recomputed:
                max_error=max(max_error,max(abs(x-y) for x,y in zip(recomputed[key],a['characteristicGravityAtSourceRoot'][key])))
        dry=add([a['characteristicGravityAtSourceRoot'] for a in piece['atoms']])
        nominal=gravity(piece['knownRemovableDryKG'],world(piece['face'],*record['nativeDryPointRadialAlongMM']),record['nativeRootWorldXYMM'])
        known.append({'pieceId':piece['id'],'massKG':piece['knownRemovableDryKG'],
            'centroidRadialAlongMM':piece['knownDryCentroidRadialAlongMM'],
            'dryGravityAtActualRoot':dry,
            'differenceFromSameMassAtOldSourcePointMomentXYZ_NMM':
                [dry['momentXYZ_NMM'][j]-nominal['momentXYZ_NMM'][j] for j in range(3)],
            'water':piece['uniformNativeDepthWaterComparison'],
            'floorPressure':piece['factored2_25kPaFloorPressure'],
            'captureEnvelopePlanMM':piece['captureEnvelopePlanMM']})
    states=[]
    for presence in itertools.product([False,True],repeat=len(known)):
        fields=[a['characteristicGravityAtSourceRoot'] for a in retained]
        fields += [p['dryGravityAtActualRoot'] for p,on in zip(known,presence) if on]
        states.append({'presentPieceIds':[p['pieceId'] for p,on in zip(known,presence) if on],
            'knownRetainedSupportAlwaysPresent':True,
            'knownDryGravityOnly':add(fields),
            'omitsUnlocatedOriginalFixedAndSeamReactions':True})
    root=dict(record)
    root.update({'knownPieces':known,
        'knownAddedRetainedSupportAtoms':retained,
        'knownAddedRetainedSupportGravity':add([a['characteristicGravityAtSourceRoot'] for a in retained]),
        'allLocalPiecePresenceStates':states})
    roots.append(root)
assert max_error<.00002,max_error

result={'status':'UNSELECTED KNOWN-ATOM VECTOR EXPORT; NO FULL NATIVE LOAD CLOSURE',
    'inventorySHA256':hashlib.sha256(source.read_bytes()).hexdigest(),
    'role':'80 mm spreader is retained as the stronger hardware alternative. Its0.130 kg south-primary source-cap excess is a load-update duty, not rejection.',
    'pieceCount':sum(len(r['knownPieces']) for r in roots),'nominalRootPacketCount':len(roots),
    'uniqueNativeAttachmentCoordinates':len({tuple(r['nativeRootWorldXYMM']) for r in roots}),
    'independentRcrossFMaximumReproductionErrorNMM':max_error,
    'coordinateConvention':{'source': 'Global Cartesian physical forces: down is negativeZ; moments are r cross F about the actual clamped native attachment.',
        'native':'Load.place uses generalized gradients: [downN, down*dx, down*dy] for vertical gravity. Both representations are exported.',
        'along':'Pan along coordinate is globalX on N/S and globalY on E/W. Nominal tributary station and clamped native attachment are distinct.'},
    'rootLedger':roots,
    'nativeJoinGates':[
        'Original fixed root/apron metal has known mass but unlocated centroids/load paths. It is not replaced by an invented point or favourable zero mass.',
        'Seam half-share is stock accounting only. Actual joint vertical and moment transfer, retention and cut states remain unqualified.',
        'The two added pickups load the same original root packet, but a single retained half has its own along and radial moment. A scalar0..cap cannot automatically contain that vector.',
        'Actual collector attachment coordinates are taken from owning signed-movement references, including the corner station clamp.',
        'Every changed body and retained support needs its corresponding pressure/wind group. Only explicit floor pressure is exported here; no missing wall/lap/baffle wind is silently set to zero.',
        'Local beam screens do not qualify the spreader joints, source fixed-root torsion, coplanar butt joints or complete frame.',
        'A new combined native run, with these duties resolved, is required before any change to the old source caps is admitted.'
    ],
    'scriptSHA256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest()}

def rounded(x):
    if isinstance(x,dict):return {k:rounded(v) for k,v in x.items()}
    if isinstance(x,list):return [rounded(v) for v in x]
    return round(x,9) if isinstance(x,float) else x

contents=json.dumps(rounded(result),indent=2)+'\n';target=HERE/'outer-66-load-ledger.json'
if args.check:assert target.read_text()==contents,'Rebuild exact-root compact ledger'
else:target.write_text(contents)
print(json.dumps({k:result[k] for k in ['status','pieceCount','nominalRootPacketCount','uniqueNativeAttachmentCoordinates',
    'independentRcrossFMaximumReproductionErrorNMM']},indent=2))
