"""Unadopted HAD kinematic comparison, not a human operation or doorset test.

Run directly. --check verifies the retained witness JSON.
The larger Bedroom4 proposal is kept separate from the historical compact trial.
Translations check entire axis segments; rotations check entire five-degree arcs.
The authored centre-to-handle reach limit does not model arms, grasp or strength.
"""
import json
import math
import sys
from collections import deque
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
import hashlib
source = ROOT / 'compiler/reference-house/georgian/layout-revision.ts'
assert hashlib.sha256(source.read_bytes()).hexdigest() == 'd05fd7755a286db5b19db022950131982c5eed7e798a6808fa103d19f9a3c670', 'Current house source changed: reappraise applicability'
prior = json.loads((HERE / 'bedroom4-allocation-study.json').read_text())
assert prior['basis'] == 'RH-LAYOUT-REVISION-02' and prior['wetClear'] == [1920, 2532.5]
# Successor proposal: new127.5 partition holds dry faces; west finish adds10.
# All dimensions below are deliberate design comparisons, not current-house adoption.
OBSTACLES = [(2335,8295,127.5,152),(2335,9253,127.5,1569.5),
 (427.5,8800,300,750),(727.5,8850,560,355),(1400,8295,400,220),
 (1335,9822.5,1000,1000),(2462.5,9450,660,1500),(3847.5,9400,2090,1500)]
HX, HY, LEAF = 2462.5, 9263, 826
HANDLE_STATION, HANDLE_RADIUS, REACH = 766, 135, 650
X0, Y0, STEP, NX, NY = 1502.5, 8645, 20, 116, 91
ANGLES = [i * math.pi / 36 for i in range(19)]
ENDS = [(HX + LEAF * math.sin(a), HY - LEAF * math.cos(a)) for a in ANGLES]
HANDLES = [(HX + HANDLE_STATION * math.sin(a), HY - HANDLE_STATION * math.cos(a)) for a in ANGLES]

def point_segment(px, py, ax, ay, bx, by):
    dx, dy = bx - ax, by - ay
    t = max(0, min(1, ((px-ax)*dx + (py-ay)*dy)/(dx*dx+dy*dy))) if dx or dy else 0
    return math.hypot(px-ax-t*dx, py-ay-t*dy)


def cross(a, b, c):
    return (b[0]-a[0])*(c[1]-a[1]) - (b[1]-a[1])*(c[0]-a[0])


def segment_distance(a, b, c, d):
    if cross(a, b, c)*cross(a, b, d) < 0 and cross(c, d, a)*cross(c, d, b) < 0:
        return 0
    return min(point_segment(*a, *c, *d), point_segment(*b, *c, *d),
               point_segment(*c, *a, *b), point_segment(*d, *a, *b))


def solve(radius):
    def fixed(x, y, xx, yy):
        if min(y, yy) < 8295+radius or max(y, yy) > 10822.5-radius:
            return False
        return all(math.hypot(max(min(x, xx)-a-w, a-max(x, xx), 0),
                              max(min(y, yy)-b-h, b-max(y, yy), 0)) >= radius-1e-7
                   for a, b, w, h in OBSTACLES)

    def turn_free(x, y, a, b):
        theta = math.atan2(x-HX, HY-y)
        lo, hi = sorted([ANGLES[a], ANGLES[b]])
        distance = math.hypot(x-HX, y-HY)
        # Distance to the whole swept leaf sector, then thicken by half the 44 leaf.
        leaf_distance = max(distance-LEAF, 0) if lo <= theta <= hi else min(
            point_segment(x, y, HX, HY, *ENDS[a]), point_segment(x, y, HX, HY, *ENDS[b]))
        opposite = (theta+math.pi) % (2*math.pi)
        max_reach = distance+HANDLE_STATION if lo <= opposite <= hi else max(
            math.hypot(x-hx, y-hy) for hx, hy in [HANDLES[a], HANDLES[b]])
        handle_distance = abs(distance-HANDLE_STATION) if lo <= theta <= hi else min(
            math.hypot(x-hx, y-hy) for hx, hy in [HANDLES[a], HANDLES[b]])
        return leaf_distance >= radius+22 and handle_distance >= radius+HANDLE_RADIUS and max_reach <= REACH

    free = {(ix, iy) for ix in range(NX) for iy in range(NY)
            if fixed(X0+STEP*ix, Y0+STEP*iy, X0+STEP*ix, Y0+STEP*iy)}
    start = (100, 10, 0)
    sx, sy = X0+start[0]*STEP, Y0+start[1]*STEP
    assert start[:2] in free, 'Start fails fixed geometry'
    assert point_segment(sx, sy, HX, HY, *ENDS[0]) >= radius+22
    assert math.hypot(sx-HANDLES[0][0], sy-HANDLES[0][1]) >= radius+HANDLE_RADIUS
    queue, parents, goal = deque([start]), {start: None}, None
    while queue:
        ix, iy, a = queue.popleft()
        x, y = X0+ix*STEP, Y0+iy*STEP
        if a == 0 and x < 2000 and y < 9200:
            goal = (ix, iy, a)
            break
        for dx, dy in [(1, 0), (-1, 0), (0, 1), (0, -1)]:
            key = (ix+dx, iy+dy, a)
            if key[:2] not in free or key in parents:
                continue
            xx, yy = x+dx*STEP, y+dy*STEP
            if (fixed(x, y, xx, yy)
                and segment_distance((x, y), (xx, yy), (HX, HY), ENDS[a]) >= radius+22
                and point_segment(*HANDLES[a], x, y, xx, yy) >= radius+HANDLE_RADIUS):
                parents[key] = (ix, iy, a)
                queue.append(key)
        for aa in [a-1, a+1]:
            key = (ix, iy, aa)
            if 0 <= aa <= 18 and key not in parents and turn_free(x, y, a, aa):
                parents[key] = (ix, iy, a)
                queue.append(key)
    path = []
    while goal is not None:
        ix, iy, angle = goal
        path.append([X0+ix*STEP, Y0+iy*STEP, angle*5])
        goal = parents[goal]
    return {'radius': radius, 'found': bool(path), 'visited': len(parents), 'path': path[::-1]}


results = [solve(radius) for radius in [300,325,350]]
assert results[0]['found'] and results[1]['found'], 'Retained coupled entry/close witness failed'
# Full outward swept box, including a deliberately conservative135-radius
# handle bound, stays south of wardrobe. Frame contact/hinge is separately held.
wardrobe_gap = 9450-(HY+HANDLE_RADIUS)
assert wardrobe_gap == 52
output = {'basis': prior['basis'], 'scope': 'unadopted Bedroom4 outward-door clearance witness; not ergonomics, installed doorset or whole-room acceptance',
 'finishedWetBounds':[427.5,8295,2335,10822.5],
 'leaf': [826,44], 'hinge':[HX,HY], 'roughAperture':[8375,9325],
 'authoredJambThickness':32, 'authoredStopProjection':13, 'packingEach':27,
 'jambClear':[8434,9266], 'conservativeStoppedThroat':[8447,9253],
 'handleStation':HANDLE_STATION,'handleEnvelopeRadius':HANDLE_RADIUS,
 'centreToHandleReachAssumption':REACH, 'wardrobeSweptBoxGap':wardrobe_gap,
 'obstacles':OBSTACLES,'translationStep':STEP,'angleStepDegrees':5,'results':results}
content=json.dumps(output,indent=2)+'\n'
p=HERE/'bedroom4-door-operation.json'
if '--check' in sys.argv: assert p.read_text()==content,'Door witness stale'
else: p.write_text(content)
print(json.dumps([{k:v for k,v in row.items() if k!='path'} for row in results]))
