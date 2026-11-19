"""Check the proposed supported inlet, cold bridge and upright rack against the house."""
import argparse
import json
from math import cos, dist, hypot, radians, sin
from pathlib import Path

here = Path(__file__).resolve().parent
model = json.loads((here / "../../had/studies/water-replan.json").read_text())["model"]
service = model["servicesInterface"]
plant = service["plant"]
plant_case = json.loads((here / "east-water-plant.json").read_text())
baseline = json.loads((here / "whole-house-service-baseline.json").read_text())
joint = plant_case["plant"]["emitterJoin"]
assert joint["radComplete"] == next(e["plan"] for e in service["emitters"] if e["id"] == "plant-N")

def edges(points):
    return list(zip(points, points[1:]))

def point_segment(p, a, b):
    dx, dy = b[0]-a[0], b[1]-a[1]
    t = ((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy) if dx or dy else 0
    t = min(1, max(0, t))
    return hypot(p[0]-a[0]-t*dx, p[1]-a[1]-t*dy)

def distance(a, b, c, d):
    def cross(p, q, r):
        return (q[0]-p[0])*(r[1]-p[1])-(q[1]-p[1])*(r[0]-p[0])
    if cross(a,b,c)*cross(a,b,d)<0 and cross(c,d,a)*cross(c,d,b)<0:
        return 0
    return min(point_segment(p, u, v) for p,u,v in ((a,c,d),(b,c,d),(c,a,b),(d,a,b)))

def path_gap(route, obstacle, radius):
    return min(distance(a,b,c,d) for a,b in route for c,d in edges(obstacle))-radius

# One new external entry and two jointly fed internal branches. All fixed tube
# axes at Z1000 before the upturned plant seat. Reservations include insulation.
R, margin = 37, 25
tee = (11315,3150)
entry = [(12090,3150), tee]
utility = [tee,(11315,2380)]
north = [tee,(11315,3500),(11075,3500),(11075,3970)]
upstream = north[-1]
apparatus = (10090,3970)
fixed = edges(entry)+edges(utility)+edges(north)
walls = {w["id"]:w for w in model["groundWalls"]}
for name,x,net in (("utility-north",11315,115),("plant-intermediate-arch",11075,100)):
    w=walls[name]
    assert w["structuralCore"][1]-w["structuralCore"][0] == 140
    assert w["finishedFaces"][1]-w["finishedFaces"][0] == 194
    assert x-w["holes"][0][1]-50 == net  # proposed formed Ø100
assert 50-R == 13
foundation=json.loads((here / "../../str/studies/current-house-joined-foundation.json").read_text())
head=next(h for h in foundation["heads"] if h["id"]=="P17")["xy"]
grid=json.loads((here / "../../str/studies/current-house-grid.json").read_text())
cap=next(h for h in grid["heads"] if h["id"]=="P17")
assert head == cap["xy"] and cap["capZ"] == [-750,-180] and cap["capXY"] == [900,600]
assert abs(3150-head[1]) < cap["capXY"][1]/2
cap_east=head[0]+cap["capXY"][0]/2
assert cap_east-12090 == 27.5 and 12250-100-cap_east == 32.5
east = {o["id"]:o for o in model["openings"]["GROUND"] if o["wall"]=="outer-east"}
window, door = east["east-window-0"], east["plant-replacement"]
assert 3150-(window["centre"]+window["width"]/2)-50 == 800
assert door["centre"]-door["width"]/2-3150-50 == 700
u = service["utility"]
platform=next(e for e in service["extract"] if e["id"]=="utility")["platform"]
assert utility[-1][1]-(platform[1]+platform[3])-R >= 25
assert utility[-1][0]-(u["electricalWorkingField"][0]+u["electricalWorkingField"][2])-R >= 25
operators = model["plantReferenceDoor"]
assert path_gap(fixed,operators["operatorCentrePath"],R+operators["retainedBodyRadius"]) >= margin
for e in service["emitters"]:
    if e["id"] in ("utility-E","plant-N"):
        assert 1000-R-(e["z"][1]+e["renewalLift"]) >= margin

# Assume the complete heating pair (not each pipe) fits an R84 horizontal
# cylinder at each declared drop. Qualify insulation and relative spacing.
heat = {e["id"]:e["pressurePairBranchPlan"][-1] for e in baseline["heat"]["emitterSchedule"]}
for name in ("plant-N","utility-E"):
    assert min(point_segment(heat[name],a,b) for a,b in fixed)-84-R >= margin

cylinder, buffer = plant["cylinder"], plant["buffer"]
centre = cylinder["replacementCentrePath"][0]
case_radius = cylinder["body"][2]/2
assert cylinder["handlingRadius"] == buffer["handlingRadius"] == 425
assert case_radius+R+margin <= dist(centre,apparatus)
assert dist(centre,apparatus)+R <= 425-margin  # retained cold tail travels with cradle
# The two parked-board brackets extend north from solid plant-pier masonry.
# Their whole projected bodies fit R37 about their arms. Rack is empty in
# radiator-service mode and carries the bridge only during cylinder renewal.
hooks = [((11495,3797),(11495,4070))]
retained = fixed+hooks
for task in ("radRoutineBody","radAfter150PullBody","controlsBody","bufferFrontServiceBody"):
    x,y,r = joint[task]
    assert min(point_segment((x,y),a,b) for a,b in retained) - r-R >= margin, task
for unit in (cylinder,buffer):
    assert path_gap(retained,unit["replacementCentrePath"],425+R) >= margin

# Both upswept union seats use the whole installed 60 mm body as a bound.
zlow, zhigh, backoff, lift, bridge_z = 1040, 1100, 60, 85, 1230
assert zlow+lift-zhigh == margin
assert bridge_z-R-(zhigh+backoff) >= margin
# 120 E + 100 N diagonally after lifting: the west foot is nearest the cylinder,
# the east foot nearest the heat drop throughout, by their X ordering.
dx,dy = 120,100
west_clear = (apparatus[0]+dx,apparatus[1]+dy)
pivot = (upstream[0]+dx,upstream[1]+dy)
hot = heat["plant-N"]
assert centre[0] < apparatus[0] and pivot[0] < hot[0]
translate_body = point_segment(centre,apparatus,west_clear)-case_radius-R
translate_heat = point_segment(hot,upstream,pivot)-84-R
assert min(translate_body,translate_heat) >= margin
assert pivot[1]-hot[1]-84-R >= margin  # any X during/after the quarter turn
# In XZ about the lifted east foot, west offsets u >= 0, heights v >= 0:
# X=pivot.X-u*cos(t)+v*sin(t), Z=zlow+lift+u*sin(t)+v*cos(t).
# X is non-decreasing, so the stationary cylinder is closest at the start.
span, rise = upstream[0]-apparatus[0], bridge_z-zlow
assert span == 985 and rise == 190
arc_top = zlow+lift+hypot(span,rise)+R
assert arc_top < 2200 and 2200 < 2300  # explicit clear working volume
# Move the upright piece 110 E onto the two clips; they remain beyond both carts.
park = [(pivot[0]+110,pivot[1]), (pivot[0]+110+rise,pivot[1])]
assert park[-1]==hooks[0][1]
for unit in (cylinder,buffer):
    assert path_gap(edges(park),unit["replacementCentrePath"],425+R) >= margin

# Wrench centreline sweeps. A sector can approach the obstacle only along its
# nearest ray or a boundary; clipping to tool length handles the far end.
def tool_gap(p,station,lo,hi,obstacle_r):
    from math import atan2, degrees
    theta = max(lo,min(hi,degrees(atan2(p[1]-station[1],p[0]-station[0]))))
    tip=(station[0]+297*cos(radians(theta)),station[1]+297*sin(radians(theta)))
    return point_segment(p,station,tip)-71.5/2-obstacle_r
assert tool_gap(centre,apparatus,-20,40,case_radius) >= margin
assert tool_gap(hot,upstream,45,105,84) >= margin
assert apparatus[1]+297*sin(radians(-20))-71.5/2-walls["plant-intermediate-arch"]["finishedFaces"][1] >= margin

print(f"Lift {lift}; slide 120 E/100 N; cylinder {translate_body:.1f}, hot pair {translate_heat:.1f} clear.")
print(f"Tilt/stow {span} bridge; top <={arc_top:.1f}; parked cylinder cart clearance {path_gap(edges(park),cylinder['replacementCentrePath'],425+R):.1f} mm.")

# Two orthographic views. Front/end lines are schematic, not product outlines.
def path(points,colour,width,opacity=1):
    pts=" ".join(f"{x:.1f},{y:.1f}" for x,y in points)
    return f'<polyline points="{pts}" fill="none" stroke="{colour}" stroke-width="{width}" stroke-linejoin="round" stroke-linecap="round" opacity="{opacity}"/>'

def txt(x,y,t,size=14):
    return f'<text x="{x}" y="{y}" font-size="{size}">{t}</text>'

def plan(p):
    return 38+(p[0]-9310)*.108, 378-(p[1]-2250)*.108

def elev(x,z):
    return 560+(x-9960)*.27, 412-(z-850)*.18

def rect(r,colour):
    x,y,w,h=r
    a,b=plan((x,y+h))
    return f'<rect x="{a:.1f}" y="{b:.1f}" width="{w*.108:.1f}" height="{h*.108:.1f}" fill="{colour}"/>'

ink,old,wet,moving,stored = "#203c45","#aaa89b","#295b71","#b35931","#487969"
out=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1040 525" width="1040" height="525">',
     '<title>Lobby water inlet and lift-off cylinder bridge</title><desc>Plan locates the utility and plant branches, two pierced walls, radiator and trolley. Elevation shows the operating and upright stowed bridge.</desc>',
     '<rect width="1040" height="525" fill="#faf9f5"/><g font-family="Arial, sans-serif" fill="#203c45">',
     txt(26,37,"Bring water into the shared lobby",24),txt(554,37,"Lift and park the cold bridge",24),
     txt(26,63,"North-up plan · dimensions in mm"),txt(554,63,"Front elevation · moving assembly in two positions")]
for w in (walls["utility-north"],walls["plant-intermediate-arch"]):
    yl,yh=w["structuralCore"]
    for a,b in ((w["a"][0],w["holes"][0][0]),(w["holes"][0][1],w["b"][0])):
        out.append(rect([a,yl,b-a,yh-yl],old))
for r in (joint["radComplete"],u["electricalStation"]):
    out.append(rect(r,"#c9957c"))
px,py=plan(centre)
out.append(f'<circle cx="{px:.1f}" cy="{py:.1f}" r="{case_radius*.108:.1f}" fill="#d1cbc0"/>')
cart_line=cylinder["replacementCentrePath"][:3]+[[12000,4575]]
out.append(path([plan(v) for v in cart_line],"#a1c8b9",850*.108,.50))
for line in (entry,north,utility):
    out.append(path([plan(v) for v in line],wet,5))
arc=[elev(pivot[0]-span*cos(radians(d)),zlow+lift+span*sin(radians(d))) for d in range(0,91,3)]
out.append(path(arc,"#98aaa3",1.5))
out.extend([txt(359,161,"Cylinder route"),txt(359,219,"Plant pier"),txt(359,282,"East entry"),txt(359,353,"Utility pier"),path([plan(a) for a in (apparatus,upstream)],moving,6),
            path([plan(a) for a in park],stored,5),
            txt(32,464,"Blue = fixed feed   ·   Orange = removable bridge"),
            txt(32,489,"Green = parked bridge   ·   Pale band = cylinder trolley"),
            txt(555,118,"Upright spine sits on two wall brackets."),
            path([elev(apparatus[0],zlow),elev(apparatus[0],bridge_z),elev(upstream[0],bridge_z),elev(upstream[0],zlow)],moving,8),
            path([elev(park[0][0],zlow+lift+span),elev(park[1][0],zlow+lift+span),elev(park[1][0],zlow+lift),elev(park[0][0],zlow+lift)],stored,6),
            txt(554,441,"Release both nuts. Lift 85 and translate 120 east / 100 north."),
            txt(554,466,"Tilt the west end up, then move 110 east onto the clips."),
            txt(554,491,"Reverse the supported sequence before pressure testing."),'</g></svg>'])
art="\n".join(out)+"\n"
target=here/"plant-inlet-route.svg"
parser=argparse.ArgumentParser()
parser.add_argument("--check",action="store_true")
if parser.parse_args().check:
    assert target.read_text()==art, "Regenerate plant-inlet-route.svg"
else:
    target.write_text(art)
