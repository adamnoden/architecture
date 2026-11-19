"""Unadopted HAD kinematic comparison, not a human operation or doorset test.

Run after relocation-route-study.ts. --check verifies the retained witness JSON.
Translations check entire axis segments; rotations check entire five-degree arcs.
The authored centre-to-handle reach limit does not model arms, grasp or strength.
"""
import json
import math
import sys
from collections import deque
from pathlib import Path

HERE = Path(__file__).resolve().parent
basis = json.loads((HERE / 'relocation-route-study.json').read_text())
assert basis['basis'] == 'RH-LAYOUT-REVISION-02'
objects = {r['id']: r for r in basis['objects']}
assert objects['basin 220 × 360'] == dict(id='basin 220 × 360', x=8617.5, y=500, w=220, h=360)
assert objects['WC 560 × 355'] == dict(id='WC 560 × 355', x=7512.5, y=1250, w=560, h=355)
# Frame is explicit: 686 leaf + two 3 gaps + two 28 jambs = 748.
# Centred inside 800 rough opening gives 26 packing each end.
# Actual jamb faces 1004/1696; leaf ends 1007/1693.
# Add12 at each jamb across the full wall for conservative BODY passage only.
# This is not a physical full-depth stop construction or a leaf/frame closing check.
OBSTACLES = [(8837.5, 417.5, 125, 598.5), (8837.5, 1684, 125, 966)]
for key in ['service cabinet', 'WC 560 × 355', 'shower 900 × 800', 'basin 220 × 360', 'base 1350 × 1900']:
    r = objects[key]
    OBSTACLES.append((r['x'], r['y'], r['w'], r['h']))
HX, HY, LEAF = 8837.5, 1693, 686
HANDLE_STATION, HANDLE_RADIUS, REACH = 620, 100, 600
X0, Y0, STEP, NX, NY = 8002.5, 717.5, 10, 141, 130
ANGLES = [i * math.pi / 36 for i in range(19)]
ENDS = [(HX - LEAF * math.sin(a), HY - LEAF * math.cos(a)) for a in ANGLES]
HANDLES = [(HX - HANDLE_STATION * math.sin(a), HY - HANDLE_STATION * math.cos(a)) for a in ANGLES]


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
        if min(y, yy) < 417.5+radius or max(y, yy) > 2587.5-radius:
            return False
        return all(math.hypot(max(min(x, xx)-a-w, a-max(x, xx), 0),
                              max(min(y, yy)-b-h, b-max(y, yy), 0)) >= radius-1e-7
                   for a, b, w, h in OBSTACLES)

    def turn_free(x, y, a, b):
        theta = math.atan2(HX-x, HY-y)
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
    start = (129, 63, 0)
    sx, sy = X0+start[0]*STEP, Y0+start[1]*STEP
    assert start[:2] in free, 'Start fails fixed geometry'
    assert point_segment(sx, sy, HX, HY, *ENDS[0]) >= radius+22
    assert math.hypot(sx-HANDLES[0][0], sy-HANDLES[0][1]) >= radius+HANDLE_RADIUS
    queue, parents, goal = deque([start]), {start: None}, None
    while queue:
        ix, iy, a = queue.popleft()
        x, y = X0+ix*STEP, Y0+iy*STEP
        if a == 0 and x < 8450 and y < 1000:
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


results = [solve(radius) for radius in [300, 305, 310]]
assert results[0]['found'] and results[1]['found'], 'Retained positive witness changed'
# Fixed fixtures lie outside the complete conservative 750 sweep; jamb contact is
# a separate frame/hinge detail, not certified by this fixture-only comparison.
fixture_distance = math.hypot(HX-8072.5, HY-1605)
assert fixture_distance > 750
output = {'scope': 'local coupled clearance witness; not ergonomics or installed doorset acceptance',
          'leaf': [686, 44], 'hinge': [HX, HY], 'jambClear': [1004, 1696], 'conservativeStoppedBodyThroat': [1016, 1684],
          'handleStation': HANDLE_STATION, 'handleEnvelopeRadius': HANDLE_RADIUS,
          'centreToHandleReachAssumption': REACH,
          'translationStep': STEP, 'angleStepDegrees': 5,
          'fixedWcCornerDistance': fixture_distance, 'results': results}
content = json.dumps(output, indent=2)+'\n'
path = HERE / 'wet-door-operation.json'
if '--check' in sys.argv:
    assert path.read_text() == content, 'Retained door witness differs'
else:
    path.write_text(content)
print(json.dumps([{k: v for k, v in r.items() if k != 'path'} for r in results]))
