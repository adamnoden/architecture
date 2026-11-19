"""Accepted-Study operation comparison; no change to the house or its handing.

A fully open obstruction is not a failed room sequence. Whole straight movements
and their swept forearm triangles are exact. Rotations have explicit continuous
movement bounds. Product envelopes, authored contacts and source reservations
retain separate authority; no installed doorset or human-use pass is produced.
"""
from pathlib import Path
import hashlib
import json
import math
import subprocess
import sys
from xml.sax.saxutils import escape

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
PINS = {
    'compiler/reference-house/georgian/layout-revision.ts': 'd05fd7755a286db5b19db022950131982c5eed7e798a6808fa103d19f9a3c670',
    'compiler/reference-house/georgian/source.ts': '974aa1d6e89c2e9f2d6ac9495741e5f9a9b276f1e564d8e9e38dbb9ceb9a6ad1',
    'compiler/reference-house/georgian/section-exemplar.ts': 'c4fe97c34f600fbb228b6013c7578f2050c1e6aa4f51cc9a905d0bdfba92ba86',
    'compiler/architectural-drawing/opening-symbol.ts': '4b4b2d75c5fdc15d0443a3fe22b38fc0cd0bfa30752b7f04fc6c47ab8a15641c',
}
for name, digest in PINS.items():
    assert hashlib.sha256((ROOT/name).read_bytes()).hexdigest() == digest, f'Reappraise changed input: {name}'
SOURCE = json.loads(subprocess.check_output([
    'node', '--import', 'tsx', '--input-type=module', '-e',
    "import {layoutRevision as d,revisionOpenings} from './compiler/reference-house/georgian/layout-revision.ts';"
    "console.log(JSON.stringify({id:d.id,shell:d.shell,envelope:d.envelope,partition:d.partition,"
    "walls:d.partitions.GROUND,openings:revisionOpenings('GROUND'),desk:d.furniture.studyDesk,"
    "chairReservation:d.furniture.studyChair,stair:d.stair,court:d.court}));"
], cwd=ROOT, text=True))
assert [SOURCE[k] for k in ['id', 'shell', 'envelope', 'partition']] == ['RH-LAYOUT-REVISION-02', 12000, 417.5, 125]
DOOR = next(o for o in SOURCE['openings'] if o['id'] == 'study-door')
assert [DOOR[k] for k in ['wall', 'centre', 'width', 'swing', 'hinge']] == ['study-north', 2850, 900, 'right', 'low']
WINDOWS = [o for o in SOURCE['openings'] if o['id'] in ['south-window-0', 'south-window-1', 'west-window-0']]
assert len(WINDOWS) == 3
def box(item):
    return [item[k] for k in ['x', 'y', 'width', 'depth']]
DESK = box(SOURCE['desk'])
RESERVATION = box(SOURCE['chairReservation'])
assert DESK == [600, 600, 1600, 700] and RESERVATION == [1000, 1400, 1000, 900]

H = (2469., 2587.5)
LEAF, STATION, BODY_RADIUS, ARM_RADIUS, REACH = 762., 702., 300., 40., 600.
A80 = math.radians(80)
LEAF_LOCAL = (0., -22., LEAF, 44.)
# Conservative body-clearance bound only. It is NOT an installed handle shape
# or a hardware/frame collision test. The face contacts below are authored.
HANDLE_LOCAL = (STATION-102., -84., 204., 168.)

def point_rect_gap(p, r):
    x, y, w, h = r
    return math.hypot(max(x-p[0], p[0]-x-w, 0), max(y-p[1], p[1]-y-h, 0))

def point_segment_gap(p, a, b):
    vx, vy = b[0]-a[0], b[1]-a[1]
    den = vx*vx+vy*vy
    t = max(0, min(1, ((p[0]-a[0])*vx+(p[1]-a[1])*vy)/den)) if den else 0
    return math.hypot(p[0]-a[0]-t*vx, p[1]-a[1]-t*vy)

def polygon_rect_gap(poly, rectangle):
    """Exact convex polygon/rectangle distance, also valid for a segment."""
    x, y, w, h = rectangle
    q = [(x, y), (x+w, y), (x+w, y+h), (x, y+h)]
    separated = False
    for shape in [poly, q]:
        for a, b in zip(shape, shape[1:]+shape[:1]):
            normal = (b[1]-a[1], a[0]-b[0])
            first = [p[0]*normal[0]+p[1]*normal[1] for p in poly]
            second = [p[0]*normal[0]+p[1]*normal[1] for p in q]
            if max(first) < min(second) or max(second) < min(first):
                separated = True
    if not separated:
        return 0.
    return min(
        [point_segment_gap(p, a, b) for p in poly for a, b in zip(q, q[1:]+q[:1])]
        + [point_segment_gap(p, a, b) for p in q for a, b in zip(poly, poly[1:]+poly[:1])])

def vertices(r):
    x, y, w, h = r
    return [(x,y), (x+w,y), (x+w,y+h), (x,y+h)]

def wall_boxes():
    result = []
    for wall in SOURCE['walls']:
        x, y = wall['a']; xx, yy = wall['b']; horizontal = y == yy
        low, high, at = (x, xx, y) if horizontal else (y, yy, x)
        holes = [(o['centre']-o['width']/2, o['centre']+o['width']/2)
                 for o in SOURCE['openings'] if o['wall'] == wall['id'] and o['kind'] == 'door']
        cuts = [low, *sorted(v for pair in holes for v in pair), high]
        for start, end in zip(cuts, cuts[1:]):
            if end <= start or any(start >= a and end <= b for a,b in holes):
                continue
            r = [start, at-62.5, end-start, 125.] if horizontal else [at-62.5, start, 125., end-start]
            result.append((wall['id'], r))
    return result

WALLS = wall_boxes()
SHELL = [('south envelope',[0,0,12000,417.5]), ('west envelope',[0,0,417.5,12000]),
         ('north envelope',[0,11582.5,12000,417.5]), ('east envelope',[11582.5,0,417.5,12000])]
# Full-depth lining/stop strips are conservative passage reservations, not
# selected joinery sections. The cloak is not borrowed as Study working floor.
EXTRA = [('low lining and stop',[2400,2587.5,79,125]), ('high lining and stop',[3221,2587.5,79,125]),
         ('cloak unavailable',[3337.5,1137.5,1462.5,1512.5]),
         ('court fabric',[3832.5,3832.5,4335,4335]), ('stair',[417.5,3832.5,2400,4335])]
ROOM_FIXED = WALLS + SHELL + EXTRA + [('source desk',DESK)]
DOOR_FIXED = ROOM_FIXED + [('chair reservation kept clear',RESERVATION)]

def basis(angle):
    return (math.cos(angle), -math.sin(angle)), (math.sin(angle), math.cos(angle))

def local(p, angle):
    u,n = basis(angle); v = (p[0]-H[0],p[1]-H[1])
    return (v[0]*u[0]+v[1]*u[1],v[0]*n[0]+v[1]*n[1])

def world(p, angle):
    u,n = basis(angle)
    return (H[0]+p[0]*u[0]+p[1]*n[0],H[1]+p[0]*u[1]+p[1]*n[1])

def grip(angle, side=0):
    return world((STATION,side*84.), angle)

def point_checks(body, angle, side, to_local=local, contact=grip):
    g = contact(angle, side)
    bl, gl = to_local(body,angle), to_local(g,angle)
    return {
        'body_fixed': min(point_rect_gap(body,r)-BODY_RADIUS for _,r in DOOR_FIXED),
        'body_leaf': point_rect_gap(bl,LEAF_LOCAL)-BODY_RADIUS,
        'body_handle_bound': point_rect_gap(bl,HANDLE_LOCAL)-BODY_RADIUS,
        'arm_leaf': polygon_rect_gap([bl,gl],LEAF_LOCAL)-ARM_RADIUS,
        'arm_fixed': min(polygon_rect_gap([body,g],r)-ARM_RADIUS for _,r in DOOR_FIXED),
        'face_reach': math.dist(body,g),
    }

def turn(start, finish, body_function, side, intervals, speed):
    minima = {k:math.inf for k in ['body_fixed','body_leaf','body_handle_bound','arm_leaf','arm_fixed']}
    reach = 0.; samples = []
    for i in range(intervals+1):
        angle = start+(finish-start)*i/intervals
        body = body_function(angle); values = point_checks(body,angle,side)
        for key in minima:
            minima[key] = min(minima[key],values[key])
        reach = max(reach,values['face_reach'])
        if i % (intervals//8) == 0:
            samples.append({'angle_degrees':math.degrees(angle),'body':body,'grip':grip(angle,side)})
    half_step = abs(finish-start)/(2*intervals)
    errors = {key:speed[key]*half_step for key in minima}
    bounds = {key:minima[key]-errors[key] for key in minima}
    reach_upper = reach+speed['reach']*half_step
    assert min(bounds.values()) > 0 and reach_upper < REACH
    return {'sample_intervals':intervals,'sampled_minima_mm':minima,
            'half_step_corrections_mm':errors,'continuous_lower_bounds_mm':bounds,
            'sampled_maximum_face_reach_mm':reach,'continuous_face_reach_upper_mm':reach_upper,
            'illustrative_states':samples}

def walk(points, angle, side=0, hold=False, fixed=None,
         to_local=local, contact=grip):
    fixed = DOOR_FIXED if fixed is None else fixed
    g = contact(angle,side); gl = to_local(g,angle)
    keys = ['body_fixed','body_leaf','body_handle_bound'] + (['arm_leaf','arm_fixed'] if hold else [])
    minima = {key:math.inf for key in keys}; reach = 0.
    for p,q in zip(points,points[1:]):
        pl,ql = to_local(p,angle),to_local(q,angle)
        values = {
            'body_fixed':min(polygon_rect_gap([p,q],r)-BODY_RADIUS for _,r in fixed),
            'body_leaf':polygon_rect_gap([pl,ql],LEAF_LOCAL)-BODY_RADIUS,
            'body_handle_bound':polygon_rect_gap([pl,ql],HANDLE_LOCAL)-BODY_RADIUS,
        }
        if hold:
            # The union of lines from the fixed grip to this translating body
            # is the complete triangle, not just its two endpoint forearms.
            values['arm_leaf'] = polygon_rect_gap([pl,ql,gl],LEAF_LOCAL)-ARM_RADIUS
            values['arm_fixed'] = min(polygon_rect_gap([p,q,g],r)-ARM_RADIUS for _,r in fixed)
            reach = max(reach,math.dist(p,g),math.dist(q,g))
        for key in keys:
            minima[key] = min(minima[key],values[key])
    return {'points':points,'exact_swept_minima_mm':minima,'clear':min(minima.values())>=0,
            'maximum_face_reach_mm':reach if hold else None}

INITIAL = (2900.,2200.)
HANDOVER = world((1120.,0.),A80)
C80 = grip(A80)
CLOSE_START = (C80[0],C80[1]-500.)
def closing_body(angle):
    c = grip(angle)
    return (c[0]-300.*(1-angle/A80),c[1]-500.)
CLOSED = closing_body(0.)
ENTRY = [(6000.,3250.),(2850.,3250.),(2850.,2200.),INITIAL]
AROUND = [INITIAL,(3020.,2200.),(3020.,HANDOVER[1]),HANDOVER]
AFTER = [HANDOVER,(HANDOVER[0],CLOSE_START[1]),CLOSE_START]
CHAIR_APPROACH = [CLOSED,(2871.,2000.),(2325.,2000.)]
leaf_speed = math.hypot(LEAF,22.)
handle_speed = math.hypot(STATION+102.,84.)
grip_speed = math.hypot(STATION,84.)
body_speed = STATION+300./A80
stages = {
    'entry':walk(ENTRY,math.pi/2),
    'close_90_to_80':turn(math.pi/2,A80,lambda a:INITIAL,+1,1000,
        {'body_fixed':0.,'body_leaf':leaf_speed,'body_handle_bound':handle_speed,
         'arm_leaf':grip_speed+leaf_speed,'arm_fixed':grip_speed,'reach':grip_speed}),
    'around_tip':walk(AROUND,A80,+1,True),
    'after_handover':walk(AFTER,A80,-1,True),
    'close_80_to_0':turn(A80,0.,closing_body,-1,1600,
        {'body_fixed':body_speed,'body_leaf':body_speed+leaf_speed,
         'body_handle_bound':body_speed+handle_speed,'arm_leaf':body_speed+leaf_speed,
         'arm_fixed':body_speed,'reach':body_speed+grip_speed}),
    'closed_chair_side':walk(CHAIR_APPROACH,0.),
}
for stage in stages.values():
    if 'clear' in stage:
        assert stage['clear']
        assert stage['maximum_face_reach_mm'] is None or stage['maximum_face_reach_mm'] < REACH
handover_checks = {str(side):point_checks(HANDOVER,A80,side) for side in [+1,-1]}
assert all(min(v[k] for k in v if k!='face_reach') > 0 and v['face_reach'] < REACH for v in handover_checks.values())

# The real chair envelope is a separate, unadopted comparator within the source
# reservation. It is not the 1000x900 reservation treated as a solid object.
CHAIR = [1255.,1400.,490.,600.]
STOWED_CHAIR = [1255.,1310.,490.,600.]
assert CHAIR[0]>=RESERVATION[0] and CHAIR[1]>=RESERVATION[1]
assert CHAIR[0]+CHAIR[2]<=RESERVATION[0]+RESERVATION[2] and CHAIR[1]+CHAIR[3]<=RESERVATION[1]+RESERVATION[3]
chair_route = [CLOSED,(2500.,2087.5),(2195.,2087.5),(2195.,1700.)]
chair_approach = walk(chair_route,0.,fixed=ROOM_FIXED+[('comparison chair',CHAIR)])
chair_body_path = [(2195.,1700.),(2195.,1610.)]
chair_body_fixed = walk(chair_body_path,0.,fixed=ROOM_FIXED)
chair_sweep = [1255.,1310.,490.,690.]
chair_object_margin = min(polygon_rect_gap(vertices(chair_sweep),r) for _,r in ROOM_FIXED)
chair_arm_sweep = [(2195.,1700.),(2195.,1610.),(1745.,1610.),(1745.,1700.)]
chair_arm_fixed = min(polygon_rect_gap(chair_arm_sweep,r)-ARM_RADIUS for _,r in ROOM_FIXED)
chair_motion = {'source_pose':CHAIR,'temporary_pose':STOWED_CHAIR,'translation':[0.,-90.],
    'body_path':chair_body_path,'authored_contact_path':[(1745.,1700.),(1745.,1610.)],
    'body_fixed_and_closed_door':chair_body_fixed,'swept_chair_clearance_mm':chair_object_margin,
    'swept_arm_fixed_clearance_mm':chair_arm_fixed,'constant_reach_mm':450.,
    'body_to_moving_chair_clearance_mm':150.,
    'limit':'Contact at overall envelope is authored, not a recovered grasp; movement/force, seated use and desk section remain unproved.'}
WEST_PATH = [(2195.,1610.),(2500.,1610.),(2500.,2230.),(800.,2230.),(800.,1800.)]
EAST_FRONT_PATH = [CLOSED,(2800.,2087.5),(2800.,800.),(3900.,800.)]
window_paths = {
    'west_after_chair_stow':walk(WEST_PATH,0.,fixed=ROOM_FIXED+[('stowed chair',STOWED_CHAIR)]),
    'south_east_with_chair_in_place':walk(EAST_FRONT_PATH,0.,fixed=ROOM_FIXED+[('comparison chair',CHAIR)]),
}
assert chair_approach['clear'] and chair_body_fixed['clear'] and chair_object_margin > 0 and chair_arm_fixed > 0
assert all(v['clear'] for v in window_paths.values())

adverse = {
    'fully_open_direct_chair_approach':walk([INITIAL,(2900.,2000.),(2325.,2000.)],math.pi/2),
    'fixed_body_during_unstaged_closing':point_checks(INITIAL,math.radians(50),+1),
    'west_path_before_chair_stow':walk(WEST_PATH,0.,fixed=ROOM_FIXED+[('comparison chair',CHAIR)]),
    'front_west_standing_point_inside_desk':point_rect_gap((1800.,800.),DESK)-BODY_RADIUS,
    'desk_to_south_wall_gap_mm':DESK[1]-SOURCE['envelope'],
    'chair_to_north_face_before_stow_mm':2587.5-(CHAIR[1]+CHAIR[3]),
}
assert not adverse['fully_open_direct_chair_approach']['clear']
assert adverse['fixed_body_during_unstaged_closing']['body_leaf'] < 0
assert not adverse['west_path_before_chair_stow']['clear']
assert adverse['front_west_standing_point_inside_desk'] < 0
# These controls test segment crossing and a triangle interior that endpoint
# forearms alone would miss; both are pertinent to the reported motion proof.
assert polygon_rect_gap([(-10,5),(20,5)],(0,0,10,10)) == 0
assert polygon_rect_gap([(-10,13),(20,13)],(0,0,10,10)) == 3
assert polygon_rect_gap([(0,0),(10,0),(5,10)],(4,3,2,2)) == 0

result = {
    'basis':'Accepted RH-LAYOUT-REVISION-02; not the differently shaped STR B Study',
    'starting_main':'9f1e6f8b4df6e9df4e617238a75b3e202f93b191','source_sha256':PINS,'adopted':False,
    'source_door':DOOR,'source_desk':DESK,'source_chair_reservation':RESERVATION,'source_windows':WINDOWS,
    'authored_door_geometry_mm':{'raw_aperture':[2400,3300],'outer_frame':[2434,3266],
        'jamb_clear':[2466,3234],'stop_clear':[2479,3221],'hinge':H,
        'leaf_width':LEAF,'leaf_thickness':44,'gap_each':3,'jamb_each':32,'packing_each':34,'stop_each':13,
        'spindle_station':STATION,'face_grip_offsets':[-84,84],'body_only_handle_bound_local':HANDLE_LOCAL,
        'body_diameter':600,'arm_diameter':80,'maximum_reach_proxy':600},
    'door_stages':stages,'handover':{'body':HANDOVER,'face_checks':handover_checks,'requires_two_grips_and_two_hands':True},
    'chair_approach':chair_approach,'chair_motion':chair_motion,'window_approaches':window_paths,'adverse_controls':adverse,
    'sequence':['Enter while door is held at90','Close to80 while holding first face',
        'Go around free end with continuous first-face contact','Reach second face before releasing first; two-hand handover',
        'Finish closing; reach chair side','Optional chair stow and window approach, then exactly restore chair',
        'Reverse all door stages and hall approach'],
    'limits':['Geometric contact proxies and two-hand handover do not prove grasp, strength, balance, comfort or actual people.',
        'Actual leaf dimensions are separate from authored frame, hinge, stops, spindle and contact placement.',
        'Handle bound is body-only: installed handle/frame fit and actual doorset section are not verified.',
        'The source chair field is a reservation; the490x600 product comparator is not an adopted office chair.',
        'The90 temporary chair movement leaves10 nominal desk clearance and does not prove actual grip or sliding/lifting method.',
        'Window approaches do not prove sash, shade, cleaning, first release or full renewal; the front-west window still lacks a direct standing field.',
        'No material exception, hardware/door selection, accepted layout change, lifecycle change or HAD completion.']
}

svg = ['<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297" font-family="DejaVu Sans,sans-serif" fill="#24343b"><rect width="420" height="297" fill="#fffef9"/>']
def text(x,y,value,size=3,colour='#24343b'):
    svg.append(f'<text x="{x}" y="{y}" font-size="{size}" fill="{colour}">{escape(str(value))}</text>')
text(12,14,'HAD / Study: close the retained door before judging the route',5.1)
text(12,23,'Accepted-house comparison · 600 body / 80 arm / 600 reach proxies · no rehanding or source geometry change',3.0)
text(12,31,'Two face grips and a two-hand handover are required by this witness. Small margins do not establish ordinary human use.',2.9,'#934b40')
for panel,ox in enumerate([12.,218.]):
    px = lambda x:ox+x/25
    py = lambda y:45+(3400-y)/25
    def rect(r,fill,stroke='#78878b',dash=False):
        x,y,w,h=r
        svg.append(f'<rect x="{px(x):.4f}" y="{py(y+h):.4f}" width="{w/25:.4f}" height="{h/25:.4f}" fill="{fill}" stroke="{stroke}" stroke-width=".24"'+(' stroke-dasharray="1 1"' if dash else '')+'/>')
    def line(points,colour,width=.5,dash=False):
        svg.append('<polyline points="'+' '.join(f'{px(x):.4f},{py(y):.4f}' for x,y in points)+f'" fill="none" stroke="{colour}" stroke-width="{width}"'+(' stroke-dasharray="1 1"' if dash else '')+'/>')
    def circle(p,r,colour):
        svg.append(f'<circle cx="{px(p[0]):.4f}" cy="{py(p[1]):.4f}" r="{r/25:.4f}" fill="none" stroke="{colour}" stroke-width=".3" stroke-dasharray="1 1"/>')
    rect([0,0,4800,3400],'#f4f0e7')
    for name,r in WALLS+SHELL+EXTRA:
        x,y,w,h=r; left,right=max(0,x),min(4800,x+w); low,high=max(0,y),min(3400,y+h)
        if right>left and high>low:
            rect([left,low,right-left,high-low],'#cbd2d1')
    rect(DESK,'#c7dbe1'); text(px(1000),py(950),'retained desk',2.6)
    rect(RESERVATION,'none','#96918a',True)
    text(px(1050),py(2350),'source chair reservation',2.35)
    for o in WINDOWS:
        a,b=o['centre']-o['width']/2,o['centre']+o['width']/2
        line([(a,417.5),(b,417.5)] if o['wall']=='outer-south' else [(417.5,a),(417.5,b)],'#447f9c',.9)
    if panel==0:
        rect(CHAIR,'#e5d3b8')
        for angle,col in [(math.pi/2,'#af7b55'),(A80,'#ba6565'),(0,'#596f80')]:
            line([world(p,angle) for p in vertices(LEAF_LOCAL)]+[world(vertices(LEAF_LOCAL)[0],angle)],col,.45)
        line([(4800,3250),*ENTRY[1:]],'#277f77',.65)
        line(AROUND,'#aa4c56',.6); line(AFTER,'#aa4c56',.6)
        line([s['body'] for s in stages['close_80_to_0']['illustrative_states']],'#aa4c56',.6)
        line(CHAIR_APPROACH,'#277f77',.55)
        circle(HANDOVER,300,'#aa4c56')
        for side in [-1,+1]: line([HANDOVER,grip(A80,side)],'#865ba0',.5)
        text(px(3100),py(2250),'1',3.3);text(px(2790),py(1350),'2 hands',2.7,'#934b40')
        text(ox,188,'A  Retained low hinge: a staged closing sequence',3.35)
        text(ox,197,'Enter → close 10° → walk around tip → hand over → close.',2.65)
        text(ox,205,'Body/handle lower bound 8.51 mm; around-tip arm gap 8.96.',2.65)
        text(ox,213,'Largest face-grip reach < 550 mm; no wider reach proxy.',2.65)
        text(ox,221,'Exact reversal returns to the hall. Real two-hand use is unproved.',2.65)
    else:
        line([world(p,0) for p in vertices(LEAF_LOCAL)]+[world(vertices(LEAF_LOCAL)[0],0)],'#596f80',.5)
        rect(CHAIR,'none','#9b784e',True);rect(STOWED_CHAIR,'#e5d3b8')
        line(WEST_PATH,'#825b9a',.55);line(EAST_FRONT_PATH,'#347f8f',.55)
        circle((800,1800),300,'#825b9a')
        line([(1800-70,800-70),(1800+70,800+70)],'#a4473e',.7)
        line([(1800-70,800+70),(1800+70,800-70)],'#a4473e',.7)
        text(px(1650),py(1500),'90',2.7)
        text(ox,188,'B  A movable chair is not its whole reservation',3.35)
        text(ox,197,'490 × 600 real chair envelope; temporary 90 mm south move.',2.65)
        text(ox,205,'10 mm nominal desk margin; side contact and force unverified.',2.65)
        text(ox,213,'West and east-front approaches connect; no sash/use result.',2.65)
        text(ox,221,'Front-west standing field still conflicts with the retained desk.',2.65,'#934b40')
    text(ox,231,'1:25 at A3 · north up · hall cropped at x4800 · mm',2.5)
text(12,247,'Decision: retain the existing handing as an eligible comparison; the static open-state obstruction does not require a reversal.',3.2)
text(12,258,'Actual leaf dimensions: JB Kind KOAK262, 762 × 44. Frame, stops, grips and placement are authored; no installed hardware fit is earned.',2.8)
text(12,269,'Quaker 1875 dimensions support the chair envelope only. No seated comfort, product/material admission, window renewal or HAD closure.',2.8)
text(12,281,'Sources and complete movement bounds: study-operation.py / .json. Front Study window duties remain with the existing HAD/BAY/OAS handoff.',2.65)
svg.append('</svg>')

# A fair handing comparison must allow the retained door the same unheld
# pre-contact approach as the mirrored trial. The original two-hand witness
# and its generated artifacts above remain unchanged.
def single_contact_body(angle):
    c = grip(angle)
    return (min(max(c[0],2530.),3000.),c[1]-500.)

SINGLE_ENTRY = [(6000.,3250.),(2850.,3250.),(2850.,2200.),
                (3020.,2200.),(3020.,1385.5),(2530.,1385.5)]
SINGLE_CLOSED = single_contact_body(0.)
assert SINGLE_ENTRY[-1] == single_contact_body(math.pi/2)
assert SINGLE_CLOSED == (3000.,2087.5)
single_speed = {
    'body_fixed':STATION,'body_leaf':STATION+leaf_speed,
    'body_handle_bound':STATION+handle_speed,
    'arm_fixed':max(STATION,grip_speed),
    'arm_leaf':max(STATION,grip_speed)+leaf_speed,'reach':STATION+grip_speed,
}
single_stages = {
    'parked_90_unheld_entry':walk(SINGLE_ENTRY,math.pi/2),
    'close_90_to_0_same_minus_contact':turn(math.pi/2,0.,single_contact_body,-1,1800,single_speed),
    'closed_join_to_accepted_task_origin':walk([SINGLE_CLOSED,CLOSED],0.),
    'closed_chair_side':walk([SINGLE_CLOSED,*CHAIR_APPROACH],0.),
}
assert all(v['clear'] for v in single_stages.values() if 'clear' in v)

HIGH_H = (2*DOOR['centre']-H[0],H[1])
assert HIGH_H == (3231.,2587.5)
def high_basis(angle):
    return (-math.cos(angle),-math.sin(angle)),(math.sin(angle),-math.cos(angle))

def high_world(p, angle):
    u,n = high_basis(angle)
    return (HIGH_H[0]+p[0]*u[0]+p[1]*n[0],HIGH_H[1]+p[0]*u[1]+p[1]*n[1])

def high_local(p, angle):
    u,n = high_basis(angle); v = (p[0]-HIGH_H[0],p[1]-HIGH_H[1])
    return (v[0]*u[0]+v[1]*u[1],v[0]*n[0]+v[1]*n[1])

def high_grip(angle, side=0):
    return high_world((STATION,side*84.),angle)

A85 = math.radians(85)
HIGH_INITIAL = (min(high_grip(A85)[0],3000.),high_grip(A85)[1]-500.)
HIGH_ENTRY = [(6000.,3250.),(2800.,3250.),(2800.,2350.),(2700.,2350.),
              (2700.,HIGH_INITIAL[1]),HIGH_INITIAL]
high_entry = walk(HIGH_ENTRY,A85,to_local=high_local,contact=high_grip)
high_initial = point_checks(HIGH_INITIAL,A85,+1,to_local=high_local,contact=high_grip)
high_straight_entry = walk([(6000.,3250.),(2800.,3250.),
                           (2800.,HIGH_INITIAL[1]),HIGH_INITIAL],A85,
                          to_local=high_local,contact=high_grip)
high_west = walk(WEST_PATH,0.,fixed=ROOM_FIXED+[('stowed chair',STOWED_CHAIR)],
                 to_local=high_local,contact=high_grip)
high_90_contact = high_grip(math.pi/2,+1)
cloak = next(r for name,r in EXTRA if name=='cloak unavailable')
high_90_endpoint_margin = point_rect_gap(high_90_contact,cloak)-ARM_RADIUS
assert high_entry['clear'] and high_initial['arm_leaf'] < 0
assert not high_straight_entry['clear'] and not high_west['clear']
assert abs(high_90_endpoint_margin-(-17.5)) < 1e-9

handing_result = {
    'basis':'Same accepted RH-LAYOUT-REVISION-02 and exact proxies as study-operation.json',
    'starting_main':'76addac4dfcb64d54ce6a794b07d012de7349435',
    'accepted_predecessor_pr':1163,'source_sha256':PINS,'adopted':False,
    'source_handing':'low; unchanged','unadopted_trial_handing':'high; exact mirror about x2850',
    'state_assumption':'The leaf is already stationary at the declared angle and remains there during unheld entry and reversed exit. Establishing or maintaining that state is not proved.',
    'unchanged_proxy_mm':{'body_diameter':600,'arm_diameter':80,'reach_limit':600,
        'leaf_width':762,'leaf_thickness':44,'spindle_station':702,
        'face_offsets':[-84,84],'body_only_handle_bound':HANDLE_LOCAL},
    'retained_low':{
        'hinge':H,'parked_angle_degrees':90,'body_path':'(clamp(C.x,2530,3000), C.y-500)',
        'contact':'G-minus throughout modelled closing and reopening; no handover',
        'stages':single_stages,'movement_speed_bounds_mm_per_radian':single_speed,
        'reverse':'Return from the task to (3000,2087.5), reacquire the same authored G-minus, reverse P(theta) from0 to90, release at the stationary leaf, then reverse SINGLE_ENTRY. The same exact swept sets and continuous bounds apply.',
        'accepted_tasks':'The explicit closed connector reaches the unchanged (2871,2087.5) origin of study-operation.json. Its chair-stow/window-approach states and limitations remain unchanged, including restoring the chair before returning.',
    },
    'mirrored_high_trials':{
        'hinge':HIGH_H,'closed_room_face_contact':'G-plus in the mirrored basis',
        'parked_90':{'contact':high_90_contact,'endpoint_to_cloak_margin_mm':high_90_endpoint_margin,
            'result':'The radius40 capsule at this contact overlaps the cloak independently of torso position; no full90 same-contact loop is earned.'},
        'parked_85':{'body_path_trial':'(min(C.x,3000), C.y-500)','initial_body':HIGH_INITIAL,
            'entry':high_entry,'initial_contact_checks':high_initial,
            'result':'This particular turn fails already at its initial forearm/leaf capsule. A clear body entry is not a clear turn; no claim about all85-degree paths.'},
        'adverse_straight_entry_at_85':high_straight_entry,
        'separate_closed_state_west_window_path':high_west,
        'closed_handle_bound_world_vertices':[high_world(p,0.) for p in vertices(HANDLE_LOCAL)],
    },
    'decision':'Retain the source handing as eligible: removing the earlier witness handover does not require rehanding. These failed high trials are not a universal impossibility proof. No handing or doorset is adopted by the comparison.',
    'limits':[
        'One unchanged face contact is not a one-handed human-use result; grip acquisition, orientation, force, balance and release are unproved.',
        'Zero angle is geometrically closed, not proved latched; reverse geometry does not qualify actual unlatching.',
        'No stop, detent, closer or hold-open hardware is inferred from either parked angle.',
        'The handle rectangle is a body-clearance bound, not actual hardware/frame fit or a recovered contact shape.',
        'Small proxy margins do not establish comfort, accessibility, construction tolerance or preference.',
        'The original two-hand witness and its chair/window task evidence remain valid within their own states; no high-hinge inheritance.',
        'No material admission, source geometry change, product selection or HAD lifecycle completion.',
    ],
}

handing_svg = ['<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297" font-family="DejaVu Sans,sans-serif" fill="#24343b"><rect width="420" height="297" fill="#fffef9"/>']
def htext(x,y,value,size=3,colour='#24343b'):
    handing_svg.append(f'<text x="{x}" y="{y}" font-size="{size}" fill="{colour}">{escape(str(value))}</text>')
htext(12,14,'HAD / Study: a grip change does not require a hinge change',5.0)
htext(12,23,'Same accepted room, furniture and 600 body / 80 arm / 600 reach proxies. Source low hinge remains unchanged.',3.0)
htext(12,31,'Both comparisons begin with an already stationary leaf. Parking, latch, actual grasp and released-leaf control are unproved.',2.8,'#934b40')
for panel,ox in enumerate([12.,218.]):
    px = lambda x:ox+x/25
    py = lambda y:45+(3400-y)/25
    def hrect(r,fill,stroke='#78878b',dash=False):
        x,y,w,h=r
        handing_svg.append(f'<rect x="{px(x):.4f}" y="{py(y+h):.4f}" width="{w/25:.4f}" height="{h/25:.4f}" fill="{fill}" stroke="{stroke}" stroke-width=".24"'+(' stroke-dasharray="1 1"' if dash else '')+'/>')
    def hline(points,colour,width=.5,dash=False):
        handing_svg.append('<polyline points="'+' '.join(f'{px(x):.4f},{py(y):.4f}' for x,y in points)+f'" fill="none" stroke="{colour}" stroke-width="{width}"'+(' stroke-dasharray="1 1"' if dash else '')+'/>')
    def hcircle(p,r,colour,dash=False):
        handing_svg.append(f'<circle cx="{px(p[0]):.4f}" cy="{py(p[1]):.4f}" r="{r/25:.4f}" fill="none" stroke="{colour}" stroke-width=".3"'+(' stroke-dasharray="1 1"' if dash else '')+'/>')
    hrect([0,0,4800,3400],'#f4f0e7')
    for name,r in WALLS+SHELL+EXTRA:
        x,y,w,h=r; left,right=max(0,x),min(4800,x+w); low,high=max(0,y),min(3400,y+h)
        if right>left and high>low: hrect([left,low,right-left,high-low],'#cbd2d1')
    hrect(DESK,'#c7dbe1'); htext(px(1000),py(950),'retained desk',2.6)
    hrect(RESERVATION,'none','#96918a',True)
    htext(px(1050),py(2350),'chair reservation',2.35)
    for o in WINDOWS:
        a,b=o['centre']-o['width']/2,o['centre']+o['width']/2
        hline([(a,417.5),(b,417.5)] if o['wall']=='outer-south' else [(417.5,a),(417.5,b)],'#447f9c',.9)
    if panel==0:
        for angle,col in [(math.pi/2,'#af7b55'),(0,'#596f80')]:
            corners=[world(p,angle) for p in vertices(LEAF_LOCAL)]
            hline(corners+[corners[0]],col,.5)
        hline([(4800,3250),*SINGLE_ENTRY[1:]],'#277f77',.65,True)
        hline([single_contact_body(math.pi/2*i/90) for i in range(90,-1,-1)],'#825b9a',.65)
        hline([SINGLE_CLOSED,*CHAIR_APPROACH],'#277f77',.55)
        for angle in [math.pi/2,math.pi/4,0.]:
            hline([single_contact_body(angle),grip(angle,-1)],'#825b9a',.35)
        hcircle(SINGLE_ENTRY[-1],BODY_RADIUS,'#825b9a',True)
        hcircle(SINGLE_CLOSED,BODY_RADIUS,'#825b9a',True)
        hline([(3050,1100),SINGLE_ENTRY[-1]],'#825b9a',.25)
        hcircle(SINGLE_ENTRY[-1],15,'#825b9a')
        htext(px(3100),py(1030),'first contact pose',2.35,'#825b9a')
        htext(ox,188,'A  Retained low hinge / parked 90°',3.35)
        htext(ox,197,'Dashed entry: walk around the free end before first G− contact.',2.65)
        htext(ox,205,'Purple: close/reopen with that same contact; no handover.',2.65)
        htext(ox,213,'Continuous arm/leaf margin ≥ 2.194 mm; reach < 521.216.',2.65)
        htext(ox,221,'Closed connector retains the accepted chair/window task origin.',2.65)
    else:
        for angle,col,dash in [(math.pi/2,'#af7b55',True),(A85,'#a4473e',False)]:
            corners=[high_world(p,angle) for p in vertices(LEAF_LOCAL)]
            hline(corners+[corners[0]],col,.5,dash)
        hline([(4800,3250),*HIGH_ENTRY[1:]],'#277f77',.65,True)
        hcircle(HIGH_INITIAL,BODY_RADIUS,'#a4473e',True)
        hline([HIGH_INITIAL,high_grip(A85,+1)],'#a4473e',.65)
        hcircle(high_grip(A85,+1),ARM_RADIUS,'#a4473e')
        hcircle(high_90_contact,ARM_RADIUS,'#a4473e')
        htext(px(3400),py(1900),'90° endpoint',2.3,'#934b40')
        htext(px(3060),py(1280),'85° start fails',2.3,'#934b40')
        htext(ox,188,'B  Unadopted mirrored high hinge / separate trials',3.35)
        htext(ox,197,'At 90°, the grip-end capsule overlaps the cloak by 17.5 mm.',2.65)
        htext(ox,205,'At 85°, the shown entry clears; the tested arm/leaf fails.',2.65)
        htext(ox,213,'Initial arm/leaf penetration 5.304 mm; no passing turn.',2.65)
        htext(ox,221,'Failure of this path does not reject every rehanded operation.',2.65)
    htext(ox,231,'1:25 at A3 · north up · hall cropped at x4800 · mm',2.5)
htext(12,247,'Decision: retain the current handing as eligible. A simpler contact sequence alone does not support changing the source door.',3.15)
htext(12,258,'The high hinge also moves the closed handle bound into the accepted west-window approach: −26.5 mm body clearance in that separate state.',2.7)
htext(12,269,'All contacts and frame/stop positions are authored. These are finite geometric comparisons, not one-handed use, comfort or installed-door passes.',2.65)
htext(12,281,'The earlier two-hand sequence and its generated sheets are preserved. Exact paths, movement bounds and limits: study-handing-comparison.json.',2.65)
handing_svg.append('</svg>')

for name,content in [('study-operation.json',json.dumps(result,indent=2)+'\n'),('study-operation.svg','\n'.join(svg)+'\n'),
                     ('study-handing-comparison.json',json.dumps(handing_result,indent=2)+'\n'),
                     ('study-handing-comparison.svg','\n'.join(handing_svg)+'\n')]:
    path=HERE/name
    if '--check' in sys.argv:
        assert path.read_text()==content, f'Stale {name}'
    else:
        path.write_text(content)
print(json.dumps({'door_entry':stages['entry']['exact_swept_minima_mm'],
    'first_close':stages['close_90_to_80']['continuous_lower_bounds_mm'],
    'around_tip':stages['around_tip']['exact_swept_minima_mm'],
    'final_close':stages['close_80_to_0']['continuous_lower_bounds_mm'],
    'chair_move':chair_body_fixed['exact_swept_minima_mm'],
    'window_approaches':{k:v['exact_swept_minima_mm'] for k,v in window_paths.items()},
    'same_contact_retained_turn':single_stages['close_90_to_0_same_minus_contact']['continuous_lower_bounds_mm'],
    'high_90_endpoint_margin':high_90_endpoint_margin,'high_85_initial_arm_leaf':high_initial['arm_leaf'],
    'high_closed_west_path':high_west['exact_swept_minima_mm']},indent=2))
