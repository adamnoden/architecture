"""Joined-B family-bath privacy sequence: declared planar proxies, not a doorset.

Whole axis segments are checked exactly. Coupled slider/arm motion is sampled
with a Lipschitz half-step subtraction, so positive bounds cover between samples.
The accepted house and pinned STR comparison are never modified.
"""
from pathlib import Path
import hashlib
import json
import math
import sys
from xml.sax.saxutils import escape

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
PINS = {
    'project/str/studies/house-plan.json': '193805456e26533026814bebe8c6be862e26a7d944c360dbb6047a1bde2d2282',
    'compiler/reference-house/georgian/layout-revision.ts': 'd05fd7755a286db5b19db022950131982c5eed7e798a6808fa103d19f9a3c670',
}
for name, digest in PINS.items():
    assert hashlib.sha256((ROOT/name).read_bytes()).hexdigest() == digest, f'Reappraise changed input: {name}'
SOURCE = json.loads((ROOT/'project/str/studies/house-plan.json').read_text())
RADIUS, ARM_RADIUS, REACH = 300., 40., 650.
STEPS = 2000
RAW = [5450., 6350.]
LINED = [5482., 6318.]
OPEN_LEAD, CLOSED_LEAD, LEAF_LENGTH = 5680., 6400., 1000.
LEAF_X, LEAF_WIDTH, PULL_BACK = 9156., 44., 150.
GUIDE = [9165.5, 5517.5, 25., 45.]


def rect_gap(point, rect):
    x, y, w, h = rect
    return math.hypot(max(x-point[0], point[0]-x-w, 0), max(y-point[1], point[1]-y-h, 0))


def axis_gap(a, b, rect):
    assert a[0] == b[0] or a[1] == b[1], 'No unchecked diagonal path'
    x, y, w, h = rect
    return math.hypot(max(x-max(a[0], b[0]), min(a[0], b[0])-x-w, 0),
                      max(y-max(a[1], b[1]), min(a[1], b[1])-y-h, 0))


def point_segment(p, a, b):
    vx, vy = b[0]-a[0], b[1]-a[1]
    den = vx*vx+vy*vy
    t = max(0, min(1, ((p[0]-a[0])*vx+(p[1]-a[1])*vy)/den)) if den else 0
    return math.hypot(p[0]-a[0]-t*vx, p[1]-a[1]-t*vy)


def segment_rect_gap(a, b, rect):
    """Exact segment/rectangle distance, including a segment crossing the box."""
    x, y, w, h = rect
    lo, hi = 0., 1.
    for start, delta, lower, upper in [(a[0], b[0]-a[0], x, x+w), (a[1], b[1]-a[1], y, y+h)]:
        if delta == 0:
            if not lower <= start <= upper:
                lo, hi = 1., 0.
                break
        else:
            p, q = sorted(((lower-start)/delta, (upper-start)/delta))
            lo, hi = max(lo, p), min(hi, q)
            if lo > hi:
                break
    if lo <= hi:
        return 0.
    corners = [(x, y), (x+w, y), (x+w, y+h), (x, y+h)]
    return min(rect_gap(a, rect), rect_gap(b, rect), *(point_segment(p, a, b) for p in corners))


def wall_boxes(walls):
    boxes = []
    for wall in walls:
        x, y = wall['a']; xx, yy = wall['b']; t = wall['t']
        horizontal = y == yy
        low, high, at = (x, xx, y) if horizontal else (y, yy, x)
        cuts = [low, *sorted(v for opening in wall['holes'] for v in opening), high]
        for start, end in zip(cuts, cuts[1:]):
            if end <= start or any(start >= a and end <= b for a, b in wall['holes']):
                continue
            boxes.append([start, at-t/2, end-start, t] if horizontal else [at-t/2, start, t, end-start])
    return boxes


def leaf(lead):
    return [LEAF_X, lead-LEAF_LENGTH, LEAF_WIDTH, LEAF_LENGTH]


WALLS = wall_boxes(SOURCE['first_walls'])
JAMBS = [[9215., RAW[0], 170., 32.], [9215., LINED[1], 170., 32.]]
ENVELOPE = [[0., 0., 12000., 417.5], [0., 11582.5, 12000., 417.5],
            [0., 417.5, 417.5, 11165.], [11582.5, 417.5, 417.5, 11165.]]
FIXED = WALLS + JAMBS + list(SOURCE['first_objects'].values()) + [SOURCE['stair'], SOURCE['void'], [3832.5, 3832.5, 4335., 4335.]] + ENVELOPE
ENTRY = [[6000., 3250.], [8750., 3250.], [8750., 6000.], [9480., 6000.],
         [9480., 5880.], [9710., 5880.], [9710., 5750.]]
TASKS = {
    'WC approach': [[9710., 5880.], [10700., 5880.], [10700., 6070.]],
    'basin approach': [[9710., 5880.], [10000., 5880.], [10000., 5890.]],
    'bath approach': [[9710., 5880.], [10500., 5880.], [10500., 4800.]],
    'cabinet approach': [[9710., 5880.], [10300., 5880.], [10300., 5050.]],
}


def route(points, lead):
    obstacles = FIXED + [leaf(lead), GUIDE]
    margins = [min(axis_gap(a, b, r)-RADIUS for r in obstacles) for a, b in zip(points, points[1:])]
    return {'clear': min(margins) >= 0, 'minimum_mm': min(margins), 'segment_margins_mm': margins}


body_min = arm_min = float('inf')
illustration = []
for i in range(STEPS+1):
    t = i/STEPS
    lead = OPEN_LEAD + (CLOSED_LEAD-OPEN_LEAD)*t
    grip = [9200., lead-PULL_BACK]
    body = [9710., 5750.+130.*t]
    body_min = min(body_min, *(rect_gap(body, r)-RADIUS for r in FIXED))
    arm_min = min(arm_min, *(segment_rect_gap(body, grip, r)-ARM_RADIUS for r in FIXED))
    if i % 250 == 0:
        illustration.append({'t': t, 'lead': lead, 'body': body, 'grip': grip})

# Distance to a fixed closed set is 1-Lipschitz. Maximum point displacement
# between an arbitrary state and its nearest sampled state is speed/(2*STEPS).
body_bound = body_min - 130/(2*STEPS)
arm_bound = arm_min - 720/(2*STEPS)  # every point of the arm segment moves <=720 per t
reach = max(math.dist(row['body'], row['grip']) for row in (illustration[0], illustration[-1]))
# Norm of an affine relative vector is convex: its maximum is at an endpoint.
panel_body_bound = 9710-(LEAF_X+LEAF_WIDTH)-RADIUS
guide_overlap = [CLOSED_LEAD-LEAF_LENGTH, OPEN_LEAD]
guide_end_margin = min(GUIDE[1]-guide_overlap[0], guide_overlap[1]-(GUIDE[1]+GUIDE[3]))
entry = route(ENTRY, OPEN_LEAD)
tasks = {name: route(path, CLOSED_LEAD) for name, path in TASKS.items()}
adverse = {
    'old_gallery_x8910': route([[8910., 3250.], [8910., 6000.]], OPEN_LEAD),
    'straight_entry_hits_basin': route([[8910., 6000.], [10537., 6000.]], OPEN_LEAD),
    'old_parked_pull_y5275_arm_clearance_mm': min(segment_rect_gap([9710., 5750.], [9200., 5275.], r)-ARM_RADIUS for r in FIXED),
    'same_coupling_reach600_passes': reach <= 600.,
    'closed_panel_allows_entry': route(ENTRY, CLOSED_LEAD)['clear'],
}
assert entry['clear'] and all(v['clear'] for v in tasks.values())
assert body_bound > 0 and arm_bound > 0 and reach < REACH and panel_body_bound > 0
assert guide_end_margin == 117.5 and GUIDE[0] > LEAF_X and GUIDE[0]+GUIDE[2] < LEAF_X+LEAF_WIDTH
assert not adverse['old_gallery_x8910']['clear'] and not adverse['straight_entry_hits_basin']['clear']
assert adverse['old_parked_pull_y5275_arm_clearance_mm'] < 0
assert not adverse['same_coupling_reach600_passes'] and not adverse['closed_panel_allows_entry']
# Meaningful controls for full-segment collision and tangent distance.
assert segment_rect_gap([-10, 5], [20, 5], [0, 0, 10, 10]) == 0
assert axis_gap([-10, 13], [20, 13], [0, 0, 10, 10]) == 3

result = {
    'basis': 'Pinned, unadopted joined STR B; accepted RH-LAYOUT-REVISION-02 unchanged',
    'source_sha256': PINS, 'adopted': False,
    'scope': 'Planar proxy entry, reachable inside slider motion, closed-door approach points, exact reversal to hall; no installed or human-use acceptance',
    'authored_geometry_mm': {'raw_aperture': RAW, 'lining_clear': LINED, 'jamb_each': 32,
        'leaf_open': leaf(OPEN_LEAD), 'leaf_closed': leaf(CLOSED_LEAD), 'wall_gap': 15,
        'pull_from_leading_edge': PULL_BACK, 'pull_open': illustration[0]['grip'], 'pull_closed': illustration[-1]['grip'],
        'travel': CLOSED_LEAD-OPEN_LEAD, 'parked_clear': LINED[1]-OPEN_LEAD,
        'body_diameter': RADIUS*2, 'hand_forearm_diameter': ARM_RADIUS*2, 'reach_limit': REACH,
        'guide_plan': GUIDE, 'guide_height': 16, 'guide_shared_leaf_interval': guide_overlap, 'guide_end_margin': guide_end_margin},
    'entry_path': ENTRY, 'entry': entry,
    'coupled': {'body_fixed_clearance_lower_bound_mm': body_bound, 'arm_fixed_clearance_lower_bound_mm': arm_bound,
        'body_to_panel_clearance_lower_bound_mm': panel_body_bound, 'maximum_reach_mm': reach,
        'sample_intervals': STEPS, 'body_half_step_bound_mm': 130/(2*STEPS), 'arm_half_step_bound_mm':720/(2*STEPS),
        'illustrative_states': illustration},
    'closed_task_paths': TASKS, 'closed_task_results': tasks, 'adverse_controls': adverse,
    'sequence': ['Enter with leaf held at open stop', 'Coupled inside closing motion', 'One closed-door approach and return at a time',
        'Reverse the same coupled motion to reopen', 'Reverse the complete entry path back to hall'],
    'limits': ['650 reach is an authored sensitivity, wider than the STR600 proxy; same prescribed path fails600.',
        '80 hand/forearm capsule and600 torso disc omit articulated arms, shoulders, clothing, grip, force, balance, latch and real people.',
        'Guide is located in plan only: rebate, engagement, floor boundary, fixing and actual stand-off need an installed section.',
        'Leaf height/mass, rail/hanger/stop/support sections, mounting through masonry, exact pull recess and15 wall gap remain unselected.',
        'Closed approach points do not prove sitting, bathing, tap reach, full cabinet release, accessibility, assisted rescue, privacy/acoustics or fire performance.',
        'Named track includes polymer components and is not an admitted material assembly. No purchase, source adoption or HAD/STR completion.']
}

# Three cropped A3 plan states; the JSON retains the complete hall connection.
svg = ['<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297" font-family="DejaVu Sans,sans-serif" fill="#24343b">',
       '<rect width="420" height="297" fill="#fffef9"/>']
def text(x, y, content, size=3, colour='#24343b'):
    svg.append(f'<text x="{x}" y="{y}" font-size="{size}" fill="{colour}">{escape(content)}</text>')
text(12, 14, 'HAD / Family-bath slider: keep the inside pull reachable', 5.3)
text(12, 23, 'Joined B only · 600 torso / 80 arm / 650 reach proxies · fixtures and house sources unchanged', 3.1)
text(12, 31, 'Tradeoff: 720 travel leaves 638 lined opening; actual hardware, force, privacy and material acceptance remain open.', 3.0)
fixtures = {k: v for k, v in SOURCE['first_objects'].items() if k.startswith('family-')}
colours = ['#247e77', '#a34c4c', '#4375a1', '#8d6eaa']
for panel, ox in enumerate([12, 151, 290]):
    px = lambda x: ox+(x-8800)/25
    py = lambda y: 45+(6650-y)/25
    def rect(r, fill, stroke='#697a80', dash=False):
        x,y,w,h = r
        svg.append(f'<rect x="{px(x):.4f}" y="{py(y+h):.4f}" width="{w/25:.4f}" height="{h/25:.4f}" fill="{fill}" stroke="{stroke}" stroke-width=".25"'+(' stroke-dasharray="1 1"' if dash else '')+'/>')
    def line(points, colour, width=.5, dash=False):
        svg.append('<polyline points="'+' '.join(f'{px(x):.4f},{py(y):.4f}' for x,y in points)+f'" fill="none" stroke="{colour}" stroke-width="{width}"'+(' stroke-dasharray="1 1"' if dash else '')+'/>')
    def circle(p, radius, colour):
        svg.append(f'<circle cx="{px(p[0]):.4f}" cy="{py(p[1]):.4f}" r="{radius/25}" fill="none" stroke="{colour}" stroke-width=".35" stroke-dasharray="1 1"/>')
    rect([9215, 3700, 2367.5, 2800], '#f3efe5')
    rect([8800, 3700, 415, 2800], '#e7ecea')
    for r in WALLS+JAMBS:
        x0,y0 = max(r[0],8800),max(r[1],3700)
        x1,y1 = min(r[0]+r[2],11682.5),min(r[1]+r[3],6500)
        if x1 > x0 and y1 > y0:
            rect([x0,y0,x1-x0,y1-y0], '#c4cbcb')
    rect([11582.5,3700,100,2800], '#c4cbcb')
    for name,r in fixtures.items():
        rect(r, '#c5dbe0')
        label = {'family-bath1700':'bath', 'family-WC':'WC', 'family-basin':'basin', 'family-service-cabinet':'cabinet'}[name]
        text(px(r[0]+r[2]/2)-len(label)*.65, py(r[1]+r[3]/2), label, 2.6)
    rect(leaf(OPEN_LEAD if panel == 0 else CLOSED_LEAD), '#b98056')
    rect(GUIDE, 'none', '#754287', True)
    if panel == 1:
        rect(leaf(OPEN_LEAD), 'none', '#b98056', True)
    if panel == 0:
        line(ENTRY[2:], colours[0], .7)
        circle([9480,6000],300,colours[0])
        line([[9200,5530],[9710,5750]], '#aa6578', .65)
        text(ox, 171, '1  Enter at y6000; turn before the basin', 3.25)
        text(ox, 179, 'Full hall connection: x8750 gallery line.', 2.7)
        text(ox, 185, 'The old x8910 line hits the parked leaf.', 2.7)
        text(ox, 191, 'Whole-route minimum reserve: 18 mm.', 2.7)
    elif panel == 1:
        line([row['body'] for row in illustration], colours[1], .7)
        for row in (illustration[0], illustration[-1]):
            line([row['grip'],row['body']], '#aa6578', .65)
            circle(row['body'],300,colours[1])
        text(ox, 171, '2  Close from inside; pull stays exposed', 3.25)
        text(ox, 179, f'Continuous body bound: {body_bound:.2f} mm.', 2.7)
        text(ox, 185, f'Arm bound: {arm_bound:.2f}; reach: {reach:.2f} mm.', 2.7)
        text(ox, 191, 'The same prescribed path fails 600 reach.', 2.7)
    else:
        for i,path in enumerate(TASKS.values()): line(path,colours[i],.55)
        text(ox, 171, '3  Closed-door approaches; then reverse', 3.25)
        text(ox, 179, 'WC / bath / cabinet reserves: 15 mm.', 2.7)
        text(ox, 185, 'Basin approach reserve: 5 mm only.', 2.7)
        text(ox, 191, 'These are approach points, not use tests.', 2.7)
    text(ox, 199, '1:25 at A3 · cropped gallery · north up · mm', 2.6)

text(12, 214, 'A real retained edge replaces a hidden-handle assumption', 4)
notes = [
    'Raw opening y5450–6350; authored 32 jambs leave 5482–6318. Parked leading edge 5680 leaves 638 clear.',
    '1000×44 panel: x9156–9200, 15 off the gallery face. Pull 150 behind the edge: 5530 open / 6250 closed.',
    'Henderson 102N guide 45×25×16: under the panel in every state; 117.5 longitudinal end reserve.',
    'The named Husky 100 kit includes nylon/polymer parts. Its catalogue limits do not admit this material assembly.',
    'Door height, mass, rail/support, recess, floor rebate, stops, latch, rescue and real bodily operation remain unproved.',
    'Keep the source and adverse route controls as evidence; no accepted layout or lifecycle changes.'
]
for i,note in enumerate(notes): text(12,225+i*9,note,2.85)
svg.append('</svg>')
for name, content in [('family-bath-slider.json',json.dumps(result,indent=2)+'\n'), ('family-bath-slider.svg','\n'.join(svg)+'\n')]:
    path = HERE/name
    if '--check' in sys.argv:
        assert path.read_text() == content, f'Stale {name}'
    else:
        path.write_text(content)
print(json.dumps({'entry':entry,'body_bound':body_bound,'arm_bound':arm_bound,'reach':reach,'tasks':tasks,'adverse':adverse},indent=2))
