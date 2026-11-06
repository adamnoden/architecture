"""Authored IAS plan witness, not product CAD/physical acceptance.
Run: python project/ias/studies/podium-room-event.py
Selected HAD source: open-north-loggia.json blob25faad2c4d40df2b7da7212f73808843a88d2f52.
All coordinates mm; fixed receiver boxes include18 finish. Native manual transform
and actual furniture/grips remain holds in ../ias-03-podium-operator-wip.md.
No generic search, route admission or maintained test-suite integration.
"""
import math
import hashlib
from pathlib import Path
source=Path(__file__).resolve().parents[2]/"had/studies/open-north-loggia.json"
data=source.read_bytes()
source_blob=hashlib.sha1(f"blob {len(data)}\0".encode()+data).hexdigest()
assert source_blob=="25faad2c4d40df2b7da7212f73808843a88d2f52", "Selected source moved: review actual fixtures before rerunning"
print("selected HAD source verified",source_blob)
ROOM = (654.5, 8949.5, 4262.5, 11564.5)
FIXED = {'south receiver': (2727.5,8582.5,350,540),
         'north receiver': (2727.5,11242.5,350,513)}
# Explicit unadopted furniture-selection rewind: B1800 instead of selected1900, same centre.
STATE = {'A':(800,9000,850,1900), 'B':(2387.5,9800,1800,750),
         'AT':(800,10925,300,300), 'BT':(3900,9450,300,300)}

def rect(r):
    x,y,w,h=r
    return [(x,y),(x+w,y),(x+w,y+h),(x,y+h)]

def point_seg(p,a,b):
    dx,dy=b[0]-a[0],b[1]-a[1]
    t=max(0,min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy))) if dx or dy else 0
    return math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy)

def point_box(p,r):
    """Signed Euclidean distance; negative inside, zero on boundary."""
    x,y,w,h=r
    dx=max(x-p[0],p[0]-x-w,0);dy=max(y-p[1],p[1]-y-h,0)
    if dx or dy:return math.hypot(dx,dy)
    return -min(p[0]-x,x+w-p[0],p[1]-y,y+h-p[1])

# Negative control: edge distance alone can falsely pass a deep interior centre.
inside_A=(1225,9950)
assert point_box(inside_A,STATE['A'])==-425
assert point_box(inside_A,STATE['A'])-300<0
assert point_box(inside_A,STATE['A'])-975<0

def overlap(a,b):
    for ps in (a,b):
        for p,q in zip(ps,ps[1:]+ps[:1]):
            nx,ny=-(q[1]-p[1]),q[0]-p[0]
            aa=[nx*x+ny*y for x,y in a];bb=[nx*x+ny*y for x,y in b]
            if max(aa)<=min(bb) or max(bb)<=min(aa):return False
    return True

def gap(a,b):
    if overlap(a,b):return -1
    return min(point_seg(p,q,r) for aa,bb in ((a,b),(b,a)) for p in aa for q,r in zip(bb,bb[1:]+bb[:1]))

def inside(p,r=0):
    return min(p[0]-r-ROOM[0],ROOM[2]-p[0]-r,p[1]-r-ROOM[1],ROOM[3]-p[1]-r)

def capsule_gap(a,b,r):
    # Axis-aligned handler segments only: nearest point between segment and box.
    assert a[0]==b[0] or a[1]==b[1]
    lo=(min(a[0],b[0]),min(a[1],b[1]));hi=(max(a[0],b[0]),max(a[1],b[1]))
    dx=max(r[0]-hi[0],lo[0]-r[0]-r[2],0)
    dy=max(r[1]-hi[1],lo[1]-r[1]-r[3],0)
    return math.hypot(dx,dy)-300

def stage(n,key,target,paths):
    old=STATE[key]
    # Complete rectangular overbound of this translation, including diagonal step5.
    sweep=(min(old[0],target[0]),min(old[1],target[1]),old[2]+abs(target[0]-old[0]),old[3]+abs(target[1]-old[1]))
    others={**FIXED,**{k:v for k,v in STATE.items() if k!=key}}
    assert all(gap(rect(sweep),rect(r))>=25 for r in others.values()),n
    assert all(inside(p)>=25 for p in rect(sweep)),n
    minimum=1e9
    for a,b in paths:
        # Diagonal step5 is charged as horizontal then vertical, both clear.
        segments=[(a,b)] if a[0]==b[0] or a[1]==b[1] else [(a,(b[0],a[1])),((b[0],a[1]),b)]
        for p,q in segments:
            assert inside(p,300)>=25 and inside(q,300)>=25,(n,'wall')
            for r in others.values():minimum=min(minimum,capsule_gap(p,q,r))
    assert minimum>=25,(n,minimum)
    STATE[key]=target
    print('move',n,'handler/other minimum',round(minimum,3))

stage(1,'A',(700,9000,850,1900),[[(1975,9450),(1875,9450)]])
stage(2,'B',(2387.5,10450,1800,750),[[(3000,9475),(3000,10125)]])
stage(3,'BT',(3900,9000,300,300),[[(3900,10075),(3900,9625)]])
stage(4,'B',(2387.5,9800,1800,750),[[(3000,10125),(3000,9475)]])
# Both handlers route around west end; first parks beyond second's final position.
for end in (3612.5,2962.5):
    route=[(3000,9475),(2012.5,9475),(2012.5,10875),(end,10875)]
    for a,b in zip(route,route[1:]):
        assert inside(a,300)>=25 and inside(b,300)>=25
        assert all(capsule_gap(a,b,r)>=25 for r in {**FIXED,**STATE}.values())
assert 3612.5-2962.5>=600
stage(5,'B',(2312.5,9775,1800,750),[[(3287.5+x,10875),(3212.5+x,10850)] for x in (-325,325)])
C=(3212.5,10150); radius=math.hypot(900,375)
others={**FIXED,**{k:v for k,v in STATE.items() if k!='B'}}
print('sofa turn radius',radius)
for k,r in others.items():
    d=point_box(C,r)-radius
    assert d>=25,(k,d)
    print('sofa circle gap',k,round(d,3))
assert inside(C,radius)>=25
# Each sampled centre is charged an additional whole-step arc displacement bound.
# This bounds the continuous quarter-turn; not merely 9001 clear point samples.
arc_bound=math.hypot(325,700)*math.radians(.01)
minimum=1e9
for i in range(9001):
    a=math.radians(i/100);co,si=math.cos(a),math.sin(a)
    for x in (-325,325):
        p=(C[0]+x*co-700*si,C[1]+x*si+700*co)
        minimum=min(minimum,inside(p,300)-arc_bound)
        for r in others.values():
            d=point_box(p,r)-300-arc_bound
            minimum=min(minimum,d)
assert minimum>=25
print('paired handler continuous-turn lower clearance',round(minimum,3),'arc allowance',arc_bound)
STATE['B']=(2837.5,9250,750,1800)
stage(7,'B',(3112.5,9250,750,1800),[[(2512.5,y),(2787.5,y)] for y in (9825,10475)])
stage(8,'B',(3112.5,9630,750,1800),[[(2787.5,y),(2787.5,y+380)] for y in (9825,10475)])
stage(9,'B',(3440,9630,750,1800),[[(2787.5,y),(3115,y)] for y in (10205,10855)])
c,s=math.cos(math.radians(172)),math.sin(math.radians(172))
def region(U,V):
    return [(2387+u*c+v*s,9894-u*s+v*c) for u,v in ((U[0],V[0]),(U[1],V[0]),(U[1],V[1]),(U[0],V[1]))]
for label,U,V in [('body',(-370,370),(-1145,295)),('front stabilisers',(-861,861),(295,786))]:
    p=region(U,V)
    assert all(inside(q)>=25 for q in p)
    for k,r in {**FIXED,**STATE}.items():
        d=gap(p,rect(r));assert d>=25,(label,k)
        print('installed',label,k,round(d,3))
feet=(2387+100*s,9894+100*c)
print('authored feet',feet,'required grip distance',math.dist((*feet,2400),(2302.5,9502.5,2850)))
# Provenance guard and geometric negative retain different failures.
# Old opposite-side turn ended one handler east; next move requires both west.
old_turn_end={(2512.5,10175),(3912.5,10175)}
old_next_start={(2512.5,9700),(2512.5,10350)}
assert old_turn_end != old_next_start
print('SEQUENCE MISMATCH: old opposite-side handler exchange has no supplied joining path; no geometric impossibility asserted')
old_circle_clearance=math.hypot(3212.5-3077.5,10155-9122.5)-math.hypot(950,375)
assert old_circle_clearance < 25
print('NEGATIVE: 1900-sofa revised turn fails25 criterion:',old_circle_clearance)
print('PLAN WITNESS ONLY: product transform, crew, furniture grips, tools, erection/access and physical acceptance remain held.')
