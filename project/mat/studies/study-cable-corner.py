"""Check the dry study corner against the selected plan and a bare 2L1.5 cable."""
import json
import math
from pathlib import Path

project = Path(__file__).resolve().parents[2]
house = json.loads((project / "had/studies/water-replan.json").read_text())["model"]
north = next(w for w in house["groundWalls"] if w["id"] == "study-L-north")
wall_x, wall_y = house["envelope"], min(north["finishedFaces"])
emitter = house["groundFurniture"]["service-emitter-study-W"]
assert (wall_x, wall_y) == (429.5, 3150.5)
assert wall_y - 500 > emitter[1] + emitter[3]
assert wall_x + 500 < min(start for start, _ in north["holes"])
west_windows = [w for w in house["openings"]["GROUND"] if w["wall"] == "outer-west"]
assert all(w["centre"] + w["width"]/2 < wall_y-500 or
           w["centre"] - w["width"]/2 > wall_y for w in west_windows)

diameter, depth, axis = 5.7, 45-18, 9
r = diameter / 2
# Take the guide's 6D as an inside radius. Keep the whole circular cable.
R = 6*diameter + r
tangent = axis + R
# Local room coordinates u,v are distances from the two finished walls.
# Forbidden trim quadrant u,v >= depth; its corner is closest at 45 degrees.
diagonal_offset = R*(1-1/math.sqrt(2))
def trim_clearance(offset):
    return math.sqrt(2)*(depth-offset-diagonal_offset) - r

assert axis-r > 0 and trim_clearance(axis) > 7
assert trim_clearance(15) < 0
maximum_axis = depth-diagonal_offset-r/math.sqrt(2)
# A quarter turn in one strip towards a rear entry spans at least R, even
# with zero end, gland and tool allowances and no cable thickness.
assert R > depth
stations = [75, 325]  # same on both faces, distance from wall intersection
assert stations[0] > tangent
around_corner = 2*(stations[0]-tangent) + math.pi*R/2
assert max(around_corner, stations[1]-stations[0], 500-stations[1]) <= 450

def distance_to_rect(x, y, rect):
    u, v, width, height = rect
    return math.hypot(max(0,u-x,x-u-width), max(0,v-y,y-v-height))

cx, cy, body = 800, 2770, house["studyDoorOperation"]["bodyRadius"]
assert body == 300
wall_gap = min(cx-wall_x-45, wall_y-cy-45)-body
furniture_gap = min(distance_to_rect(cx, cy, rect)-body
                    for rect in house["groundFurniture"].values())
assert wall_gap > 25 and furniture_gap > 100
print(f"Study corner X{wall_x}/Y{wall_y}; 6D bend clears trim by {trim_clearance(axis):.2f} mm. "
      f"Maximum equal axis offset {maximum_axis:.2f} mm; at 15 mm: {trim_clearance(15):.2f} mm. "
      f"Support interval across corner {around_corner:.2f} mm. "
      f"Body to trim/furniture {wall_gap:.1f}/{furniture_gap:.1f} mm.")

# One continuous local lamp branch between matched, complete BG accessories.
# Finished house coordinates, not a proposed change to the source room.
# The knockout centre is allowed to vary within the actual 20 mm aperture
# bounds. The 15 mm independent mounting stand-off is a new fabrication.
from sys import argv

north_axis, west_axis = 1100, 2600
width, foot, stand, gauge = 81.5, 75, 15, 300
north_z, west_z, north_depth, west_depth = 1050, 550, 51, 46
shells = {
    "north": [north_axis-foot, wall_y-stand-north_depth, 2*foot, stand+north_depth],
    "west": [wall_x, west_axis-foot, stand+west_depth, 2*foot],
}
# For any full 20 mm bottom knockout, lateral offset <= 30.75 across the
# 81.5 mm assembly. Centring the whole box within our 150 mm station is optional.
lateral_max = width/2-10
assert width/2+lateral_max <= foot
frame_x = min(north["holes"])[0]
assert frame_x-(north_axis+foot) == 175
assert west_axis-foot-emitter[1]-emitter[3] == 125

# Opening one 150 mm wide room-facing riser leaves a normal step between
# the low 9 mm cable axis and its box. Two opposite tangent bends keep that
# adjustment entirely above the trim. The cut length is between entry planes;
# terminals, gland assembly, tails, upstream supply and waste are separate.
low_z = 75
horizontal = (north_axis-wall_x + wall_y-west_axis) - 2*(axis+2*R)
base = horizontal + 3*math.pi*R/2
vertical = sum(z-width/2-(low_z+R) for z in (north_z,west_z))
def offset_geometry(distance):
    angle = math.acos(1-distance/(2*R))
    height = 2*R*math.sin(angle)
    return height, 2*R*angle-height

distances = []
for depth in (north_depth, west_depth):
    lo,hi = stand+10,stand+depth-10  # projected back face is conservative
    assert lo-46/2 == 2             # Bahco 22 AF jaw width, wall-parallel
    distances.append([offset_geometry(edge-axis) for edge in (lo,hi)])
assert max(height for limits in distances for height,_ in limits) < 75
lengths = [base+vertical+sum(pair[i][1] for pair in distances) for i in (0,1)]
# Split dry cover and saddles; 300 mm station spacing also respects the
# 450 mm horizontal manufacturer limit used by the earlier corner study.
for run in (north_axis-wall_x,wall_y-west_axis):
    assert max(250,run-R-325) <= 450

# Closed-door route from the understood completion position to BOTH stations.
# Piecewise-linear point/box distance is 1-Lipschitz. Sampling at <=1 mm
# with half-spacing deduction gives a lower bound between samples.
door = house["studyDoorOperation"]
hinge_x,hinge_y=door["hinge"]
leaf_length,leaf_thickness=door["leaf"]
closed_leaf = [hinge_x-leaf_thickness/2,hinge_y-leaf_thickness/2,
               leaf_length+leaf_thickness,leaf_thickness]
centres = [tuple(door["bodyKnots"][0][1:]),(1750,2770),(1000,2720),(890,2740)]
assert door["bodyKnots"][0][0] == 0 and door["bodyRadius"]==gauge
items = {**house["groundFurniture"],**shells,"closed leaf":closed_leaf}
for i,rect in enumerate(door["checkedFramePieces"]):
    items[f"frame {i}"]=rect
for key,value in house["groundFurniture"].items():
    assert len(value)==4, key

east_return = min(next(w for w in house["groundWalls"] if w["id"]=="study-L-return")["finishedFaces"])

def approach_margin():
    best=(float("inf"),"")
    for (x1,y1),(x2,y2) in zip(centres,centres[1:]):
        steps=math.ceil(math.hypot(x2-x1,y2-y1))
        for n in range(steps+1):
            x=x1+(x2-x1)*n/steps
            y=y1+(y2-y1)*n/steps
            candidates=[(distance_to_rect(x,y,q)-gauge,name) for name,q in items.items()]
            candidates.extend([(x-wall_x-45-gauge,"west trim"),
                               (wall_y-45-y-gauge,"north trim"),
                               (east_return-18-x-gauge,"east return")])
            best=min(best,*candidates)
    return best[0]-.5,best[1]

# Both operator centres face into their own reserve. A 60 mm outward extension
# prices the plug without inheriting a real plug or claiming cord/hand clearance.
plug=[wall_x,west_axis-foot,stand+west_depth+60,2*foot]
items["plug gauge"]=plug
margin,closest=approach_margin()
assert margin>=5,(margin,closest)
reach_n=math.dist(centres[-2],(north_axis,wall_y-stand-north_depth))
reach_w=math.dist(centres[-1],(wall_x+stand+west_depth,west_axis))
assert max(reach_n,reach_w)<600

# Ordinary straight action uses a full-sized 225 mm handle. A conservative
# 46 mm-wide rectangular sweep, 0..30 deg OUTWARD with its length along the
# wall towards the corner, tests only the handle, not an electrician's hand.
tool_projection=stand+max(north_depth,west_depth)-10+225*math.sin(math.pi/6)+23*math.cos(math.pi/6)
assert tool_projection < 190
assert north_axis-225-23 > wall_x+45 and west_axis+225+23 < wall_y-45
print(f"Lamp branch length {lengths[0]:.1f}..{lengths[1]:.1f} mm to two entry planes; "
      f"closed-door path reserve >= {margin:.1f} mm ({closest}); reaches {reach_n:.1f}/{reach_w:.1f} mm.")

# Two orthographic views. Plan and vertical detail have separate labelled scales.
def lamp_drawing():
    p=.115
    X=lambda x: 21+(x-wall_x)*p
    Y=lambda y: 48+(wall_y-y)*p
    def rect(q,fill,stroke):
        x,y,w,h=q
        return f'<rect x="{X(x):.3f}" y="{Y(y+h):.3f}" width="{w*p:.3f}" height="{h*p:.3f}" fill="{fill}" stroke="{stroke}" stroke-width=".6"/>'
    marks=''.join(rect(q,'#deb58d','#814b2a') for q in shells.values())
    path=' '.join(f'{X(x):.3f},{Y(y):.3f}' for x,y in centres)
    turn_x,turn_y=wall_x+axis,wall_y-axis
    cable=(f'M{X(north_axis):.3f} {Y(turn_y):.3f} H{X(turn_x+R):.3f} '
           f'A{R*p:.3f} {R*p:.3f} 0 0 0 {X(turn_x):.3f} {Y(turn_y-R):.3f} V{Y(west_axis):.3f}')
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="230mm" viewBox="0 0 420 230" role="img" aria-labelledby="t d">
<title id="t">A switched lamp branch in the study</title><desc id="d">A cable follows the study's north and west walls between two independently supported metalclad stations. The switch is above the north skirting and the lighting outlet is above the west skirting.</desc>
<rect width="420" height="230" fill="#fbfaf6"/><g font-family="DejaVu Sans,Arial,sans-serif" fill="#20383d">
<text x="12" y="15" font-size="3.4" letter-spacing=".6">MAT  /  SERVICES  /  STUDY</text>
<text x="12" y="29" font-size="8" font-weight="bold">A switched lamp branch in the study</text>
<path d="M12 36h396" stroke="#355a62" stroke-width=".6"/>
<text x="12" y="44" font-size="4.4" font-weight="bold">Plan  ·  complete the door movement before servicing</text>
<path d="M{X(wall_x)} {Y(2000)} V{Y(wall_y)} H{X(frame_x)} M{X(2250)} {Y(wall_y)} H{X(2550)}" fill="none" stroke="#273e46" stroke-width="1"/>
{rect([emitter[0],2000,emitter[2],emitter[1]+emitter[3]-2000],"#cbdadb","#587677")}
{rect([900,2000,1000,300],"#e5e3dd","#8a8982")}
{marks}<path d="{cable}" fill="none" stroke="#a15428" stroke-width=".7"/>
<polyline points="{path}" fill="none" stroke="#2b777a" stroke-width=".7" stroke-dasharray="2 1.3"/>
<circle cx="{X(centres[-1][0])}" cy="{Y(centres[-1][1])}" r="{gauge*p}" fill="none" stroke="#2b777a" stroke-dasharray="2 1.3" stroke-width=".5"/>
<text x="{X(1300)}" y="61" font-size="3.5">North fused switch</text><path d="M{X(north_axis)} 55l8 5h12" fill="none" stroke="#814b2a" stroke-width=".45"/>
<text x="35" y="124" font-size="3.5">West lamp outlet</text><path d="M28 {Y(west_axis)}l5 10" fill="none" stroke="#814b2a" stroke-width=".45"/>
<text x="25" y="158" font-size="3.2">Emitter</text><text x="101" y="161" font-size="3.2">Chair</text>
<text x="170" y="103" font-size="3.3">Closed-door approach</text>
<text x="20" y="190" font-size="3.2">Furniture clipped at Y2000. Dashed circle shows the west standing position.</text>
<path d="M21 198h57.5" stroke="#20383d" stroke-width=".6"/><text x="22" y="205" font-size="3">500 mm in plan</text>
<path d="M272 42v166" stroke="#c0ccca" stroke-width=".5"/>
<text x="279" y="45" font-size="4.4" font-weight="bold">Wall section  ·  schematic</text>
<path d="M288 57v131" stroke="#36484b" stroke-width="1.2"/><rect x="290" y="65" width="4" height="14" fill="#9ba8a8"/><rect x="294" y="62" width="18" height="20" fill="#deb58d" stroke="#814b2a" stroke-width=".6"/>
<path d="M298 82v11h5V82m-3 11v34c0 8-6 9-6 17v28" fill="none" stroke="#a15428" stroke-width="1.2"/>
<rect x="298" y="157" width="4" height="30" fill="#cbdadb"/><path d="M288 187h26" stroke="#36484b"/>
<g font-size="3.4"><text x="317" y="68">15 mm open stand-off</text><text x="317" y="77">Factory box and face</text><text x="317" y="89">External gland below box</text><text x="317" y="110">Removable riser front</text><text x="317" y="136">Two bends shift the cable</text><text x="317" y="142">to the measured entry axis.</text><text x="317" y="166">Low run at Z75</text><text x="317" y="173">45 mm skirting at floor</text></g>
<path d="M12 211h396" stroke="#355a62" stroke-width=".5"/><text x="12" y="221" font-size="3.3">Design comparison. The layered gland, electrical protection, actual clearances and material exceptions require their own decisions.</text>
</g></svg>
'''

drawing=Path(__file__).with_name("study-lamp-branch.svg")
if "--draw" in argv:
    drawing.write_text(lamp_drawing())
else:
    assert drawing.read_text()==lamp_drawing(), "Regenerate with --draw"
