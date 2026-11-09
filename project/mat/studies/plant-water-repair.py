"""Locate the incoming water repair, retained obstacles and cylinder renewal sweep."""
import argparse
import json
from math import dist
from pathlib import Path

here = Path(__file__).resolve().parent
house = json.loads((here / "../../had/studies/water-replan.json").read_text())["model"]
services = house["servicesInterface"]
inlet = next(d for d in services["otherServiceDuties"] if d["id"] == "incoming-water")["path"]
entry, south, elbow, end = inlet
assert entry[1] == south[1] and south[0] == elbow[0] and elbow[1] == end[1]
assert len({p[2] for p in inlet}) == 1
cylinder = services["plant"]["cylinder"]
start, turn, exit_turn, exit_end = cylinder["replacementCentrePath"]
assert start[1] == turn[1] and turn[0] == exit_turn[0] and exit_turn[1] == exit_end[1]
assert start[0] < end[0] < turn[0] < elbow[0] < exit_end[0] and turn[1] < end[1] < exit_turn[1]
R = cylinder["handlingRadius"]
body_radius = cylinder["body"][2]/2
assert cylinder["body"][2] == cylinder["body"][3]
outer_radius, reserve = 11, 25  # 22 mm tube only; east-water-plant.py's cart-to-solid allowance
separation = exit_turn[1] - elbow[1]
# Along the full horizontal tube: the first cart leg covers X <= turn.X and
# the final leg covers X >= turn.X. No unaudited sampling between points.
assert max(end[1] - turn[1], separation) < body_radius
cutoff_y = exit_turn[1] - R - outer_radius - reserve
terminal_length = dist(end, elbow) + elbow[1] - cutoff_y
wx, wy, ww, wh = cylinder["workingEast"]
radiator = next(e for e in services["emitters"] if e["id"] == "plant-N")
rx, ry, rw, rh = radiator["plan"]
assert rx < elbow[0] < rx+rw and south[1] < ry < ry+rh < elbow[1]
assert radiator["z"][0] < elbow[2] < radiator["z"][1]
walls = [next(w for w in house["groundWalls"] if w["id"] == name)
         for name in ("utility-north", "plant-intermediate-arch")]
assert all(w["a"][0] < elbow[0] < w["b"][0] and south[1] < w["a"][1] < elbow[1]
           and all(elbow[0] > stop for _, stop in w["holes"]) for w in walls)
# Challenge the false equivalence of a 100 mm coupler and 100 mm of damage.
# This is a chosen removal length, centred on the proven path intersection.
assert end == [10400, 4300, 500] and turn[0] == 10500 and R == 425
assert cutoff_y == 4114 and terminal_length == 986
gap = 100
xcut_l, xcut_r = turn[0]-gap/2, turn[0]+gap/2
assert end[0] <= xcut_l < xcut_r <= min(wx+ww, elbow[0])
assert wy < end[1] < wy+wh
for sleeve in (32, 41):  # current Endex 88039 item and catalogue row, respectively
    assert end[0] < xcut_l-sleeve and xcut_r+sleeve < min(wx+ww, elbow[0])
    assert gap > sleeve  # two seated sleeves do not meet
    print(f"{sleeve} mm sleeve: park {xcut_l-sleeve:g}..{xcut_l:g} and {xcut_r:g}..{xcut_r+sleeve:g}; "
          f"ideal centred shift {sleeve/2:g}, nominal west straight left {xcut_l-sleeve-end[0]:g} mm.")
print(f"Elbow to final centreline {separation:g} mm; remove through Y{cutoff_y:g}, "
      f"{terminal_length:g} mm developed centreline before fitting/support bodies.")

# North-up plan and enlargement use different scales.
scale, x0, y0 = .113, 9300, 5550
def p(x, y):
    return 46+(x-x0)*scale, 97+(y0-y)*scale

def box(plan, fill, stroke="none", dashed=False):
    x, y, w, h = plan
    a, b = p(x, y+h)
    dash = ' stroke-dasharray="4 3"' if dashed else ""
    return f'<rect x="{a:.2f}" y="{b:.2f}" width="{w*scale:.2f}" height="{h*scale:.2f}" fill="{fill}" stroke="{stroke}"{dash}/>'

def line(points, color, width, opacity=1):
    xy = " ".join(f"{a:.2f},{b:.2f}" for a,b in points)
    return f'<polyline points="{xy}" fill="none" stroke="{color}" stroke-width="{width}" stroke-linecap="round" stroke-linejoin="round" opacity="{opacity}"/>'

def label(x, y, text, size=15, color="#253d45"):
    return f'<text x="{x}" y="{y}" fill="{color}" font-size="{size}">{text}</text>'

out = ['<svg xmlns="http://www.w3.org/2000/svg" width="1040" height="550" viewBox="0 0 1040 550">',
       '<title>Incoming water and cylinder removal at the east plant station</title>',
       '<desc>The fixed water run crosses two wall cores, a radiator and the cylinder route. Two unmade slip sleeves park clear of a 100 mm repair spool.</desc>',
       '<rect width="1040" height="550" fill="#faf9f5"/><g font-family="Arial, sans-serif">',
       label(32,40,"Where the incoming water meets the cylinder route",27),
       label(32,68,"Plan at left. The axial repair detail at right uses a larger scale. Dimensions in millimetres.")]
for wall in walls:
    lo, hi = wall["structuralCore"]
    hole_l, hole_r = wall["holes"][0]
    for a,b in ((wall["a"][0],hole_l),(hole_r,wall["b"][0])):
        out.append(box([a,lo,b-a,hi-lo],"#8c9288"))
out += [box(cylinder["station"],"none","#78847d",True),box(cylinder["workingEast"],"none","#6a7477",True),
        line([p(*v) for v in (start,turn,exit_turn,exit_end)],"#a7cfc5",2*R*scale,.65),
        line([p(*v) for v in (start,turn,exit_turn,exit_end)],"#52867f",2),
        box(radiator["plan"],"#c67b5d"),
        line([p(south[0],2450),p(*elbow[:2]),p(*end[:2])],"#35596b",3),
        label(43,470,"Grey = structural core · Rust = radiator",14),
        label(43,495,"Green = 850-wide cart · Blue = water at Z500",14),
        label(482,112,"One damaged piece, two butt joints",20),
        label(482,147,"Cut at X10450 and X10550. The view uses 41 mm sleeves."),
        label(482,191,"PARK ON SOUND TUBE",14)]
zoom=lambda x: 493+(x-end[0])*2.35
for y, offset in ((218,0),(330,41/2)):
    out += [line([(zoom(end[0]),y),(zoom(xcut_l),y)],"#467180",8),
            line([(zoom(xcut_r),y),(zoom(xcut_r+45),y)],"#467180",8)]
    if offset:
        out.append(line([(zoom(xcut_l),y),(zoom(xcut_r),y)],"#467180",8))
    for a,b in ((xcut_l-41+offset,xcut_l+offset),(xcut_r-offset,xcut_r+41-offset)):
        out.append(f'<rect x="{zoom(a):.1f}" y="{y-10}" width="{zoom(b)-zoom(a):.1f}" height="20" fill="#ae6949" fill-opacity=".75"/>')
out += [label(482,258,"The west sleeve parks 9 mm from the drawn terminal."),
        label(482,300,"CENTRE OVER THE TWO CUTS",14),
        label(482,370,"The accurately sized replacement tube enters from the side."),
        label(482,396,"Each unmade sleeve travels 20.5 mm before joining."),
        label(482,440,"Bare-part geometry only. Clamps, insertion space, heat"),
        label(482,465,"protection and actual kit dimensions still need a detail."),
        label(32,532,"Reroute the fixed feed past the radiator and resolve both wall penetrations before detailing the terminal.",14),
        '</g></svg>']
svg = "\n".join(out)+"\n"
target=here/"plant-water-repair.svg"
parser=argparse.ArgumentParser()
parser.add_argument("--check",action="store_true")
if parser.parse_args().check:
    assert target.read_text() == svg, "Stale plant-water-repair.svg"
else:
    target.write_text(svg)
