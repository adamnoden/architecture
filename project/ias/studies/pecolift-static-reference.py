"""PROJECT-PROPOSED conservative static equipment/crew contract, NOT an OEM fit.
Direct arithmetic only. It does not prove rolling ingress, operation or emergency rescue.
Owning source/version/holds: ../ias-03-pecolift-access-wip.md.
"""
import hashlib
import itertools
import json
import math
from pathlib import Path
root=Path(__file__).resolve().parents[2]
historical_path=root/'had/studies/open-north-loggia.json'
historical_bytes=historical_path.read_bytes()
assert hashlib.sha1(f'blob {len(historical_bytes)}\0'.encode()+historical_bytes).hexdigest()=='25faad2c4d40df2b7da7212f73808843a88d2f52'
historical=json.loads(historical_bytes)
p=root/'had/studies/water-replan.json';b=p.read_bytes()
assert hashlib.sha1(f'blob {len(b)}\0'.encode()+b).hexdigest()=='f7324121f59cc5f1707ea47640dd2b20c26b9bbb'
current=json.loads(b);assert current['status'].startswith('SELECTED')
selected=current['model']
# Authenticate ONLY the relevant NW scene, not legitimate changed east services.
def nw(r):return r[0]<4377.5 and r[0]+r[2]>0 and r[1]<12000 and r[1]+r[3]>7750
old_nw={k:v for k,v in historical['groundFurniture'].items() if nw(v)}
new_nw={k:v for k,v in selected['groundFurniture'].items() if nw(v)}
assert old_nw==new_nw,'Current NW furniture/apparatus changed; review reference'
wall_ids={'rear-west','loggia-west-weather','protected-stair-east'}
old_walls={w['id']:w for w in historical['groundWalls'] if w['id'] in wall_ids}
new_walls={w['id']:w for w in selected['groundWalls'] if w['id'] in wall_ids}
assert set(new_walls)==wall_ids and old_walls==new_walls
assert selected['fixedObstacles']['GROUND']==historical['fixedObstacles']['GROUND']
assert selected['stair']==historical['stair'] and selected['void']==historical['void']
assert selected['shell']==historical['shell'] and selected['envelope']==historical['envelope']
old_door=next(d for d in historical['protectedRoute']['doors'] if d['id']=='FD-WEST-CROSS')
new_door=next(d for d in selected['protectedRoute']['doors'] if d['id']=='FD-WEST-CROSS')
assert old_door==new_door
services_path=root.parent/current['sources']['services']['path']
services=json.loads(services_path.read_bytes())
rear=services['interfaces']['rearShowerDrop']
assert tuple(rear['clearHatch'])==(1722.5,9052.5,800,800)
assert rear['finishedPanelUnderside']==2575.375
print('CURRENT selected water-replan f7324121; authenticated NW subset',sorted(new_nw))
print('Current west door and actual Services rear clear-hatch/ceiling authenticated')
# A delivered unit must satisfy ALL these prospective bounds, not just a brochure.
GROSS=(1697.5,8987.5,705,1075); CENTRE=(2050,9525)
HATCH=tuple(rear['clearHatch']); PIPE=(2302.5,9452.5); PIPE_R=60.33/2
CEILING=rear['finishedPanelUnderside']; DECK=1250; SHOULDER=DECK+1450; HEAD=DECK+1750
HARDWARE=1600+(DECK-300) # REQUIRED 1:1 travel bound, verify supplied machine.
assert HARDWARE==2550 and CEILING-HARDWARE>=25
assert 3170-HEAD>=25

def rect_gap(a,b):
    dx=max(a[0]-b[0]-b[2],b[0]-a[0]-a[2],0)
    dy=max(a[1]-b[1]-b[3],b[1]-a[1]-a[3],0)
    return math.hypot(dx,dy)

def body_gap(x,y,r,b):
    return math.hypot(max(b[0]-x,x-b[0]-b[2],0),max(b[1]-y,y-b[1]-b[3],0))-r

# ALL unchanged selected ground furniture/apparatus stay obstacles in this event.
# Only the explicitly moved B is replaced by its temporary position.
OBS={k:tuple(v) for k,v in selected['groundFurniture'].items()
     if k!='family-sofa1900x750'}
assert set(OBS)==set(selected['groundFurniture'])-{'family-sofa1900x750'}
assert tuple(selected['groundFurniture']['family-sofa1900x750'])==(2337.5,9800,1900,750)
OBS['B650N']=(2337.5,10450,1900,750)
# Canonical fixed boxes already include their finish. Retain an ADDITIONAL
# authored18 guard around wet receivers; no relaxation/native-finish claim.
for name,r in selected['fixedObstacles']['GROUND']:
    assert name not in OBS
    x,y,w,h=r;g=18 if name in {'wetBeamSouthReceiver','wetBeamNorthReceiver'} else 0
    OBS[name]=(x-g,y-g,w+2*g,h+2*g)
OBS['stair footprint']=tuple(selected['stair']);OBS['ground void']=tuple(selected['void'])
for name,r in OBS.items():
    assert len(r)==4 and all(isinstance(x,(int,float))for x in r) and r[2]>0 and r[3]>0,name
print('ALL canonical ground furniture/fixed obstacles loaded; ONLY B650N substituted')
ROOM=(654.5,8949.5,4262.5,11564.5)
assert min(GROSS[0]-ROOM[0],ROOM[2]-GROSS[0]-GROSS[2],GROSS[1]-ROOM[1],ROOM[3]-GROSS[1]-GROSS[3])>=25
for k,r in OBS.items():
    d=rect_gap(GROSS,r);assert d>=25,(k,d)
    if d<500:print('gross/fixture',k,d)
# DELIVERED REQUIREMENT, not an OEM fact:600 CLEAR transverse X x720 CLEAR
# longitudinal Y, aligned/contained inside charged gross incl closed gate/posts.
# Nominal720x600 does not prove this clear shape;720 across705 would FAIL.
# Under THIS contract, test full uncertainty in actual basket origin.
# Stand facing SOUTH: clothed reference480X x300Y includes resting upper arms.
worst_reach=0;worst_head=1e9;min_hatch=1e9
for cx,cy in itertools.product((2050-52.5,2050+52.5),(9525-177.5,9525+177.5)):
    fx,fy=cx-10,9517.5
    # Upper body has60 each side in600 before the10 X offset; Y offset<=185.
    assert 300-240-abs(fx-cx)>=25
    assert 360-150-abs(fy-cy)>=25
    assert 300-150-abs(fx-cx)>=25 #300-square foot contact
    for x,y in ((fx-240,fy-150),(fx+240,fy+150)):
        min_hatch=min(min_hatch,x-HATCH[0],HATCH[0]+HATCH[2]-x,y-HATCH[1],HATCH[1]+HATCH[3]-y)
    # Head cylinder intentionally conservative at work height; whole branch still held.
    worst_head=min(worst_head,math.hypot(PIPE[0]-fx,PIPE[1]-fy)-150-PIPE_R)
    for sx in (fx-200,fx+200): #400 shoulder centres within480 outer body
        worst_reach=max(worst_reach,math.dist((sx,fy,SHOULDER),(*PIPE,2950)))
assert min_hatch>=25 and worst_head>=25 and worst_reach<=600
print('hardware/ceiling',CEILING-HARDWARE,'upper body/hatch',min_hatch,
      'head/straight stem',worst_head,'worst bare-point arm',worst_reach)
# Static apron/assistant are real bodies, not proof of a joining route or hook stroke.
STATIONS={'north gate apron':(2012.5,10387.5),'east emergency assistant':(2727.5,9450)}
for name,(x,y) in STATIONS.items():
    assert min(x-300-ROOM[0],ROOM[2]-x-300,y-300-ROOM[1],ROOM[3]-y-300)>=25
    assert body_gap(x,y,300,GROSS)>=25
    ds=[body_gap(x,y,300,r)for r in OBS.values()];assert min(ds)>=25
    print(name,'fixture/body lower',min(ds),'machine/body',body_gap(x,y,300,GROSS))
# REQUIRED delivered handwheel region / OEM tool reach; authored, not native dimensions.
hand=(2450,9450,1950); assistant=(2727.5,9450,1450)
assert math.dist(hand,assistant)<=600
corners=itertools.product((1850,2250),(9325,9425),(1970,2370))
hook=max(math.dist(hand,c)for c in corners)
assert hook+25<=775
print('required hand reach',math.dist(hand,assistant),'hook endpoint bound',hook,'required effective OEM hook775')
print('STATIC CONTRACT ONLY: all current specimen dimensions, floor/level, whole pipe, gate/tool strokes, rolling route and qualification remain held.')
