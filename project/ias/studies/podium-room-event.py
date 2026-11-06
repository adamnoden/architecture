"""CORRECTED IAS evidence: published podium furniture event is REJECTED.
Run: python project/ias/studies/podium-room-event.py
Uses ALL canonical groundFurniture; only three named proposed moved items are
excluded from unchanged obstacles. No house adoption, route or physical pass.
Old body/turn arithmetic did not prove fixture completeness. See owning WIP.
"""
import hashlib
import json
import math
from pathlib import Path
p=Path(__file__).resolve().parents[2]/'had/studies/open-north-loggia.json'
b=p.read_bytes();sha=hashlib.sha1(f'blob {len(b)}\0'.encode()+b).hexdigest()
assert sha=='25faad2c4d40df2b7da7212f73808843a88d2f52'
model=json.loads(b)
source=model['groundFurniture']
for name,r in source.items():
    assert len(r)==4 and all(isinstance(x,(int,float)) for x in r) and r[2]>0 and r[3]>0,name
# Audited exclusions: ONLY these actually moved in the withdrawn reference.
# The reading side table remains an unchanged obstacle, not an exclusion.
PROPOSED={
    'reading-sofa1900x850':(700,9000,850,1900),
    'family-sofa1900x750':(3440,9630,750,1800), #UNADOPTED100 reduction
    'family-side-table300':(3900,9000,300,300),
}
assert set(PROPOSED)<=set(source)
fixed={k:tuple(v) for k,v in source.items() if k not in PROPOSED}
classification={k:('proposed move' if k in PROPOSED else 'unchanged obstacle') for k in source}
assert set(classification)==set(source) and set(fixed)|set(PROPOSED)==set(source)
assert not(set(fixed)&set(PROPOSED))
# Every canonical structural fixture, stair and void also remains an obstacle.
for name,r in model['fixedObstacles']['GROUND']:
    assert name not in fixed
    x,y,w,h=r;g=18 if name in {'wetBeamSouthReceiver','wetBeamNorthReceiver'} else 0
    fixed[name]=(x-g,y-g,w+2*g,h+2*g)
fixed['stair footprint']=tuple(model['stair']);fixed['ground void']=tuple(model['void'])
for name,r in fixed.items():
    assert len(r)==4 and all(isinstance(x,(int,float))for x in r) and r[2]>0 and r[3]>0,name

def overlap(a,b):
    return(max(0,min(a[0]+a[2],b[0]+b[2])-max(a[0],b[0])),
           max(0,min(a[1]+a[3],b[1]+b[3])-max(a[1],b[1])))

def point_box(p,r):
    x,y,w,h=r;dx=max(x-p[0],p[0]-x-w,0);dy=max(y-p[1],p[1]-y-h,0)
    return math.hypot(dx,dy) if dx or dy else -min(p[0]-x,x+w-p[0],p[1]-y,y+h-p[1])

# Retain interior-centre guard: unsigned edge distances cannot be clearances.
assert point_box((1225,9950),source['reading-sofa1900x850'])==-425
collisions={}
for moved,a in PROPOSED.items():
    for name,b in fixed.items():
        w,h=overlap(a,b)
        if w>0 and h>0:collisions[moved,name]=(w,h)
assert collisions['reading-sofa1900x850','rear-stack']==(29.5,100)
assert collisions['family-sofa1900x750','service-emitter-living-N2']==(612.5,59.5)
assert collisions # This candidate MUST NOT return a positive full-scene verdict.
print('HISTORICAL1335 HAD source verified',sha)
print('classified',len(source),'groundFurniture objects;',len(fixed),'total unchanged obstacles incl fixed/void/stair')
print('AUDITED proposed-move exclusions',list(PROPOSED))
for (moved,fixed_name),dims in collisions.items():
    print('REJECTED collision',moved,'against',fixed_name,'overlap mm',dims)
print('RESULT: published1335 furniture event REJECTED with full source inventory.')
print('No alternative event, equipment failure, house change or IAS completion inferred.')
