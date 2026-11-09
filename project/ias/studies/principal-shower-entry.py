"""Located shower-entry comparison. Run directly with stock Python 3."""
import argparse
import json
import math
from pathlib import Path

PROJECT = Path(__file__).resolve().parents[2]
MAT = json.loads((PROJECT / "mat/studies/interiors-b-wetroom-assembly.json").read_text())
HAD = json.loads((PROJECT / "had/studies/water-replan.json").read_text())["model"]
ROOM = MAT["room"]
FIXTURES = {k: v for k, v in MAT["objects"].items() if k != "tray"}
TRAY = MAT["objects"]["tray"]
assert TRAY == HAD["upperFurniture"]["principal-shower900"] == [9400, 6600, 900, 900]
assert FIXTURES["WC"] == HAD["upperFurniture"]["principal-WC"]
assert FIXTURES["basin"] == HAD["upperFurniture"]["principal-basin"]
assert HAD["rooms"]["principalBath"]["door"] == MAT["door"]["rough"]
assert ROOM == [9400, 6600, 2167.5, 1552.5]
assert MAT["showerScreen"]["clearOpeningMinimum"] == 700

# The manufacturer's 750 swing and 750 access set the leaf scale. The
# hinge, 880 wall setouts and two usable grip faces are installation trials.
HINGE = (10280, 6730)
LEAF, GRIP, OFFSET = 750, 675, 35
BODY, REACH = 300, MAT["showerScreen"]["reachComparison"]
FIXED = {**FIXTURES, "north glass": [9400, 7475, 880, 10],
         "south hinge strip": [10275, 6600, 10, 130]}
# (opening angle from north towards east, person X, person Y).
TRANSFER = (math.degrees(math.atan2(200, 1070)), 10480, 7800)
POSES = [(0, 10480, 7800), TRANSFER, (12, 10480, 7800),
         (46, 10540, 7690), (56, 10590, 7600), (62, 10610, 7490),
         (62, 10610, 7350), (64, 10490, 7220), (64, 10420, 7180),
         (62, 10360, 7160), (60, 10300, 7150), (0, 9940, 7150)]

def add(a, b, scale=1):
    return (a[0] + b[0]*scale, a[1] + b[1]*scale)

def nearest(p, a, b):
    v = (b[0]-a[0], b[1]-a[1])
    s = max(0, min(1, ((p[0]-a[0])*v[0] + (p[1]-a[1])*v[1]) /
                   (v[0]**2 + v[1]**2))) if a != b else 0
    return math.dist(p, add(a, v, s))

def segdist(a, b, c, d):
    def cross(p, q, r):
        return (q[0]-p[0])*(r[1]-p[1]) - (q[1]-p[1])*(r[0]-p[0])
    if cross(a,b,c)*cross(a,b,d) < 0 and cross(c,d,a)*cross(c,d,b) < 0:
        return 0
    return min(nearest(a,c,d), nearest(b,c,d), nearest(c,a,b), nearest(d,a,b))

def ptbox(p, r):
    x, y, w, h = r
    return math.hypot(max(0, x-p[0], p[0]-x-w), max(0, y-p[1], p[1]-y-h))

def segbox(a, b, r):
    x, y, w, h = r
    corners = [(x, y), (x+w, y), (x+w, y+h), (x, y+h)]
    return min(ptbox(a,r), ptbox(b,r),
               *(segdist(a,b,corners[i-1],corners[i]) for i in range(4)))

def screen(angle):
    t = math.radians(angle)
    u, n = (math.sin(t), math.cos(t)), (math.cos(t), -math.sin(t))
    centre = add(HINGE, u, GRIP)
    return add(HINGE,u,-15), add(HINGE,u,LEAF), add(centre,n,OFFSET), add(centre,n,-OFFSET)

def walls(p):
    x, y, w, h = ROOM
    return min(p[0]-x, p[1]-y, x+w-p[0], y+h-p[1])

def reserves(pose, side):
    angle, x, y = pose
    p = (x,y)
    heel, tip, outer, inner = screen(angle)
    hand = outer if side == 1 else inner
    return {
        "body to room/fixtures/glazing": min(walls(p), *(ptbox(p,r) for r in FIXED.values())) - BODY,
        "body to moving glass": nearest(p,heel,tip) - BODY - 10,
        "body to handle": nearest(p,outer,inner) - BODY - 7,
        "hand reach": REACH - math.dist(p,hand),
        "arm to moving glass": segdist(p,hand,heel,tip) - 4 - 12,
        "arm to fixed glass/fixtures": min(segbox(p,hand,r) for r in FIXED.values()) - 12,
    }

def verify(poses):
    minima = {}
    for i, (a,b) in enumerate(zip(poses,poses[1:])):
        # Distance-to-set and endpoint interpolation are Lipschitz. At any time
        # the centre travels <= |dc|/2n from the nearest sample; every screen
        # point travels <= R|dt|/2n. The arm has moving endpoints too. Summing
        # both moving sets bounds all reported reserves conservatively.
        travel = math.dist(a[1:],b[1:]) + 2*LEAF*abs(math.radians(b[0]-a[0]))
        n = max(1, math.ceil(travel/3))
        bound = travel/(2*n)
        for j in range(n+1):
            pose = tuple(v+(w-v)*j/n for v,w in zip(a,b))
            for key, margin in reserves(pose, 1 if i==0 else -1).items():
                minima[key] = min(minima.get(key,math.inf), margin-bound)
    return minima

def jambs():
    door = MAT["door"]
    r0,r1 = door["rough"]
    west = r0 + door["frameAllowance"]
    east = r1 - door["frameAllowance"]
    return ([ROOM[0],8152.5,west-ROOM[0],260],
            [east,8152.5,ROOM[0]+ROOM[2]-east,260])

def route_reserve(a, b):
    heel, tip, outer, inner = screen(0)
    def room_edge(p):
        return min(p[0]-ROOM[0], p[1]-ROOM[1], ROOM[0]+ROOM[2]-p[0])
    return min(room_edge(a),room_edge(b), *(segbox(a,b,r) for r in jambs()),
               segdist(a,b,heel,tip)-10,
               segdist(a,b,outer,inner)-7, *(segbox(a,b,r) for r in FIXED.values())) - BODY

def privacy():
    door = MAT["door"]
    left,y,width,thickness = door["openLeaf"]
    travel = door["travel"]
    assert door["closedLeaf"] == [left+travel,y,width,thickness]
    assert door["netOpen"] == [left+width,door["rough"][1]-door["frameAllowance"]]
    old = add(door["insideGrip"], (1,0), travel)
    assert ptbox(old,jambs()[1]) == 0 and old[0] - door["rough"][1] == 75
    # Flush wet-facing cups. A is 40 behind the leading edge, B another
    # 350 behind A. Neither needs a rigid projection into the reveal.
    a = (left+width-40,y)
    b = add(a,(-1,0),350)
    body = (10400,8050)
    switch = 400
    pairs = [(a,add(a,(1,0),switch)),
             (add(b,(1,0),switch),add(b,(1,0),travel))]
    # Each active grip translates on a straight line. At fixed body the
    # maximum reach is at an endpoint. All arm segments lie in the same
    # convex lined opening with the endpoint x-bounds below.
    used = [v for pair in pairs for v in pair]
    clearance = min(p[0]-jambs()[0][0]-jambs()[0][2] for p in used+[body])
    clearance = min(clearance, min(jambs()[1][0]-p[0] for p in used+[body]))
    assert door["thresholdRise"] == 20 and thickness == 44
    assert y-(jambs()[0][1]+jambs()[0][3]) == 17.5
    assert min(clearance-12,REACH-max(math.dist(body,p) for p in used)) > 18
    assert y-body[1]-BODY >= 80
    return body, max(math.dist(body,p) for p in used),clearance-12

def figure():
    scale = 0.20
    parts = ['<svg xmlns="http://www.w3.org/2000/svg" width="1060" height="720" viewBox="0 0 1060 720">',
             '<title>Principal shower entrance, first floor</title>',
             '<desc>Two comparable plans show the outside hand transfer and the move into the tray with the door open to 64 degrees. North is up.</desc>',
             '<rect width="1060" height="540" fill="#faf8f3"/>',
             '<g font-family="sans-serif" fill="#172f3a">',
             '<text x="32" y="40" font-size="25" font-weight="bold">Principal shower  /  a person and a moving leaf</text>',
             '<text x="33" y="68" font-size="15">First floor   ·   millimetres   ·   north up   ·   blue body Ø600   ·   amber swing   ·   teal grip line</text>']
    for offset, pose, title, footer in [
            (32, TRANSFER, "01   Change hands beyond the tip", "Both grip faces are reachable at 10.6°."),
            (552, POSES[7], "02   Cross the rim and draw the leaf shut", "The door reaches 64°. The WC and basin stay in place.")]:
        def xy(p):
            return (offset+(p[0]-ROOM[0])*scale, 128+(8152.5-p[1])*scale)
        def points(seq):
            return " ".join(f"{x:.1f},{y:.1f}" for x,y in map(xy,seq))
        def rect(r, fill, stroke="#8c9693"):
            x,y=xy((r[0],r[1]+r[3]))
            return f'<rect x="{x:.1f}" y="{y:.1f}" width="{r[2]*scale:.1f}" height="{r[3]*scale:.1f}" fill="{fill}" stroke="{stroke}"/>'
        def line(a,b,color,width):
            return f'<polyline points="{points([a,b])}" fill="none" stroke="{color}" stroke-width="{width}"/>'
        def label(p, val):
            x,y=xy(p)
            return f'<text x="{x:.1f}" y="{y:.1f}" font-size="12">{val}</text>'
        angle,*person=pose
        parts.extend([f'<text x="{offset}" y="101" font-size="17" font-weight="bold">{title}</text>',
                      rect(ROOM,"#fff"),rect(TRAY,"#e4eee9"),
                      *(rect(r,"#e3dfd5") for r in FIXTURES.values()),
                      line((9400,7480),(10280,7480),"#334e50",2),
                      line((10280,6600),HINGE,"#334e50",2),
                      line((10000,8152.5),(10775,8152.5),"#fff",3),
                      label((9460,7830),"Basin"),label((11005,7690),"WC"),
                      label((9440,6660),"900 tray"),label((10050,8210),"775 slider opening")])
        arc=[screen(i)[1] for i in range(91)]
        parts.append(f'<polyline points="{points(arc)}" stroke="#b6782f" stroke-dasharray="4 4" fill="none"/>')
        heel,tip,outer,inner=screen(angle)
        x,y=xy(person)
        parts.extend([f'<polyline points="{points(p[1:] for p in POSES)}" stroke="#3c7181" fill="none" stroke-dasharray="3 3"/>',
                      f'<circle cx="{x:.1f}" cy="{y:.1f}" r="60" fill="#9dbdca" fill-opacity=".38" stroke="#31617a"/>',
                      line(heel,tip,"#af6b22",3),line(person,inner,"#00685b",2)])
        if pose == TRANSFER:
            parts.append(line(person,outer,"#00685b",2))
        parts.append(f'<text x="{offset}" y="475" font-size="14">{footer}</text>')
    parts.extend(['<line x1="32" x2="1028" y1="502" y2="502" stroke="#c4c5bd"/>',
                  '<text x="32" y="538" font-size="18" font-weight="bold">03   Close the separate privacy slider with two recessed pulls</text>',
                  '<text x="32" y="562" font-size="14">Room-side elevation, X only   ·   cream opening 850 between lined jambs   ·   blue moving leaf   ·   dots are pull positions</text>'])
    for i,(name,travel) in enumerate([("Open",0),("Switch grips",400),("Closed",825)]):
        x0, y0 = 32+i*347, 594
        x = lambda world: x0 + (world-9000)*0.145
        parts.extend([f'<text x="{x0}" y="{y0-8}" font-size="13" font-weight="bold">{name}</text>',
                      f'<rect x="{x0}" y="{y0}" width="291" height="31" fill="#e1ded4"/>',
                      f'<rect x="{x(9925)}" y="{y0}" width="{850*.145}" height="31" fill="#fff5d8"/>',
                      f'<rect x="{x(9050+travel)}" y="{y0+5}" width="{950*.145}" height="20" fill="#afc7cf" stroke="#547582"/>'])
        for j,g in enumerate([9960,9610]):
            active = i==1 or j==i//2
            parts.append(f'<circle cx="{x(g+travel)}" cy="{y0+15}" r="4" fill="{("#00685b" if active else "#aaa9a4")}"/>')
    parts.extend(['<text x="32" y="658" font-size="14">One fixed stance. A is 40 behind the leading edge, B is 350 behind A. Change hands after 400 of the 825 travel.</text>',
                  '<text x="32" y="691" font-size="13">Source setouts and published leaf dimensions are distinct from assumed grips, body and tool envelopes.</text>',
                  '</g></svg>'])
    return "\n".join(parts)+"\n"

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    minima = verify(POSES)
    assert min(margin for key, margin in minima.items() if key.startswith("body")) >= 20, minima
    assert min(minima.values()) > 0, minima
    entry = MAT["bodyRoutes"]["entry"][-1]
    inside = MAT["showerScreen"]["insideStation"]
    # Join the two source paths where the bedroom route enters the slider.
    hall = next(w for w in HAD["actions"]["witnesses"] if w["id"] == "principal-ordinary-entry-bath")
    assert hall["pass"] and hall["points"][-1][0] == entry[0] and entry[1] <= hall["points"][-1][1] <= MAT["bodyRoutes"]["entry"][0][1]
    body, grip_reach, wrist = privacy()
    assert route_reserve(entry,body) >= 30 and route_reserve(body,POSES[0][1:]) >= 30
    assert route_reserve(entry,POSES[0][1:]) >= 30
    assert route_reserve(POSES[-1][1:],inside) >= 20
    # At maximum swing, and everywhere en route, bound the whole leaf by
    # its turning radius against the (non-mating) north/east fixture group.
    radial = min(ptbox(HINGE,r) for r in FIXTURES.values()) - LEAF - 10
    assert radial > 200 and HINGE[1]-15-10 > ROOM[1]
    assert HINGE[0]+LEAF+10 < ROOM[0]+ROOM[2]
    operator = MAT["showerScreen"]["operatorStation"]
    direct = math.degrees(math.atan2(operator[0]-HINGE[0], operator[1]-HINGE[1]))
    heel, tip, *_ = screen(direct)
    assert 0 < direct < 64 and nearest(operator,heel,tip) < 0.001
    # A real configuration, rather than only a pessimistic lower bound,
    # demonstrates the larger-body failure at the north return.
    a, b = POSES[-3:-1]
    middle = tuple((v+w)/2 for v,w in zip(a,b))
    assert reserves(middle, -1)["body to room/fixtures/glazing"] < 25
    graphic = Path(__file__).with_suffix(".svg")
    if args.check:
        assert graphic.read_text() == figure(), "Regenerate the entry drawing"
    else:
        graphic.write_text(figure())
    print(f"Slider max reach {grip_reach:.2f}, wrist to lined jamb {wrist:.2f}, approach to slider {route_reserve(entry,body):.2f}, slider to shower {route_reserve(body,POSES[0][1:]):.2f}")
    print("Continuous plan reserves (mm)", {k: round(v,2) for k,v in minima.items()})
    print(f"Closed arrival {route_reserve(entry,POSES[0][1:]):.2f}, inside {route_reserve(POSES[-1][1:],inside):.2f}, fixture sweep {radial:.2f}, fixed-stance collision at {direct:.2f} degrees")

if __name__ == "__main__":
    main()
