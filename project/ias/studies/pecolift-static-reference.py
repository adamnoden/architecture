"""PROJECT-PROPOSED conservative static equipment/crew contract, NOT an OEM fit.
Direct arithmetic only. It does not prove rolling ingress, operation or emergency rescue.
Owning source/version/holds: ../ias-03-pecolift-access-wip.md.
"""
import hashlib
import itertools
import math
from pathlib import Path
p=Path(__file__).resolve().parents[2]/'had/studies/open-north-loggia.json';b=p.read_bytes()
assert hashlib.sha1(f'blob {len(b)}\0'.encode()+b).hexdigest()=='25faad2c4d40df2b7da7212f73808843a88d2f52'
# A delivered unit must satisfy ALL these prospective bounds, not just a brochure.
GROSS=(1697.5,8987.5,705,1075); CENTRE=(2050,9525)
HATCH=(1722.5,9052.5,800,800); PIPE=(2302.5,9452.5); PIPE_R=60.33/2
CEILING=2575.375; DECK=1250; SHOULDER=DECK+1450; HEAD=DECK+1750
HARDWARE=1600+(DECK-300) # REQUIRED 1:1 travel bound, verify supplied machine.
assert HARDWARE==2550 and CEILING-HARDWARE>=25
assert 3170-HEAD>=25

def rect_gap(a,b):
    dx=max(a[0]-b[0]-b[2],b[0]-a[0]-a[2],0)
    dy=max(a[1]-b[1]-b[3],b[1]-a[1]-a[3],0)
    return math.hypot(dx,dy)

def body_gap(x,y,r,b):
    return math.hypot(max(b[0]-x,x-b[0]-b[2],0),max(b[1]-y,y-b[1]-b[3],0))-r

OBS={'A':(800,9000,850,1900),'B650N':(2337.5,10450,1900,750),
     'Atable':(800,10925,300,300),'Btable':(3900,9450,300,300),
     'south receiver':(2727.5,8582.5,350,540),'north receiver':(2727.5,11242.5,350,513)}
ROOM=(654.5,8949.5,4262.5,11564.5)
assert min(GROSS[0]-ROOM[0],ROOM[2]-GROSS[0]-GROSS[2],GROSS[1]-ROOM[1],ROOM[3]-GROSS[1]-GROSS[3])>=25
for k,r in OBS.items():
    d=rect_gap(GROSS,r);assert d>=25;print('gross/fixture',k,d)
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
