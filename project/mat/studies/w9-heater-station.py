"""Locate a conditional Ø200 supply heater and its temperature sensor in the plant-room trial."""
import math
from html import escape
from pathlib import Path
import runpy
import sys

here = Path(__file__).resolve().parent
transition = runpy.run_path(str(here/'w9-port-transition.py'))
room = transition['room']
had = transition['read']('../../had/studies/water-replan.json')['model']
services = transition['read']('whole-house-service-baseline.json')['interfaces']['architecturalServices']
assert had['architecturalServices'] == services
arch = had['internalArchControls']
wall_s, wall_n = room['intermediateFinishedFacesY_mm']
west_jamb, east_jamb = services['eastWaterJoin']['intermediateArch']['rawOpeningX']
finish = arch['actualRadialFinish']
west_jamb += finish
east_jamb -= finish
dry_room = services['eastWaterJoin']['plantDryRoom']
west, north = dry_room[0], dry_room[1]+dry_room[3]
east = west+dry_room[2]
south = wall_s-transition['read']('plant-room-rewind.json')['wallNorth60Control']['southCellDepth_mm']
body_x, body_y, _, depth = room['W9BodyFrontSouth']
supply = transition['ports'][0]
p = (body_x+transition['top_x'][0],body_y+supply['centreMM'][1])
base_dx = transition['body_freedom']
base_dy = depth-2*supply['centreMM'][1]  # allow either depth datum for this plan comparison
assert (base_dx,base_dy) == (6,15)
d = transition['steel_od']
r = supply['trialFullODMM']/2
heater_length, straight = 370, 5*d  # OEM overall length and Genius Fig. 2 spacing at each face
trunk = transition['read']('east-water-plant.json')['frontPlantArchCrossing']
band, depth_z = trunk['completeBand']
profile = trunk['newLowCentreProfile']
nx, ny, _ = profile[0]
sx, sy, _ = next(v for v in profile if v[0] < nx)
assert [sx,sy,2500] in profile and [nx,ny,2500] in profile
riser = room['riser']
rx = riser[0]+riser[2]

# One vertical-to-southwest elbow in the R-hand west lane. At the axis
# height, every horizontal oblique slice of the duct is at least 2r wide.
# Give the first warm shoulder zero projection beyond its centre in Y,
# and the second only the smaller half-dimension of its reserved band in X.
min_slope = (p[0]+r-(nx-band/2))/(p[1]-ny)
max_slope = (p[0]-r-(sx+min(band,depth_z)/2))/(p[1]-sy)
assert min_slope > max_slope
jamb_slope_limit = (p[0]-r-west_jamb)/(p[1]-wall_s)
assert p[1]-(150+2*straight+heater_length-r*jamb_slope_limit)/math.hypot(1,jamb_slope_limit) < sy

# A fabricated compound branch replaces the single elbow. The first R150
# quarter-turn leaves the vertical running 5 degrees south of west. A 20.5
# tangent and a horizontal R150 turn bring it to 6 degrees west of south.
a = math.radians(5)
b = math.radians(6)
ca,sa = math.cos(a),math.sin(a)
cb,sb = math.cos(b),math.sin(b)
slope = sb/cb
bend_r,join,slip = 150,20.5,60
z = transition['z_tip']+transition['run']+slip+bend_r
first = [p[0]-bend_r*ca,p[1]-bend_r*sa]
joint = [first[0]-join*ca,first[1]-join*sa]
start = [joint[0]-bend_r*(cb-sa),joint[1]-bend_r*(ca-sb)]
def at(station):
    return [start[0]-station*sb,start[1]-station*cb]
def x_at_y(y):
    return start[0]+(y-start[1])*slope
inlet, outlet, sensor = (at(n) for n in (straight, straight+heater_length, 2*straight+heater_length))
# Reserve BOTH longitudinal shoulders out to 160 mm even where the formed
# part could turn tighter. Two opposed 5 mm XY errors can shrink an X gap
# by 10+10*t at a fixed obstacle face. Include the independent base offsets.
err = 2*transition['per_axis']
lateral = r/cb
near_warm = nx-band/2-(x_at_y(ny+band/2)+base_dx)-err*(1+slope)
near_riser = x_at_y(riser[1])-base_dy*slope-rx-err*(1+slope)
far_warm = x_at_y(sy-band/2)-base_dy*slope-(sx+band/2)-err*(1+slope)
gaps = [near_riser-lateral,near_warm-lateral,far_warm-lateral]
heater_width_limit = 2*cb*near_warm
assert min(gaps)>0 and heater_width_limit > 2*r
# The westbound entry bends are north of the riser turn onto the final
# line; their X never falls below start X. All other outlet axes lie east.
assert start[0]-r-err>rx
assert min(transition['top_x'][i]-transition['top_x'][0]-err-r-
           transition['ports'][i]['trialFullODMM']/2 for i in (1,2,3))>0
# Worst complete oblique duct ellipse lies inside its circumscribed
# circle on each reveal plane. Test the full wall, including the datum box.
span = arch['plant']['rawSpan']
rise = arch['rise']
ri = span**2/(8*rise)+rise/2
cx,cz = arch['plant']['centre'],arch['head']-ri
reach = max(abs(x_at_y(y)+dx-cx) for y in (wall_s,wall_n)
            for dx in (-base_dy*slope-err*(1+slope),base_dx+err*(1+slope)))
intrados = ri-finish-math.hypot(reach,z+err-cz)-lateral
assert intrados>0
cyl = services['plant']['cylinder']
headroom = z-r-err-max(2250,cyl['height']+cyl['requiredTopService'])
# A possible further R150 turn reaches a west-facing tangent. This says
# nothing about the reducer, T7 body, clear straight after T7 or remaining
# offset to the protected spine. Do not terminate the installation at a dot.
turn_end = [sensor[0]-bend_r*cb,sensor[1]-bend_r*(1-sb)]
south_gap = turn_end[1]-r-err-south
assert headroom>0 and south_gap>0
max_north_ray = max(math.dist([p[0]+dx,p[1]+dy],[x,y]) for dx in (0,base_dx)
                    for dy in (0,base_dy) for x in (west,east) for y in (wall_n,north))
assert max_north_ray < 2*straight
print(f'North-cell ray {max_north_ray:.1f} mm. West slope {min_slope:.5f} minimum, {max_slope:.5f} maximum.')
print(f'Offset run Z{z:g}, inlet {inlet}, outlet {outlet}, T7 {sensor}; lateral gaps {gaps}.')
print(f'Arch radial bound {intrados:.1f}, casing-width limit {heater_width_limit:.1f}, '
      f'headroom {headroom:.1f}, south turn {south_gap:.1f} mm.')

# After T7 allow no unpriced length. Charge a possible extra 10 mm straight
# for the probe assembly before the turn. Then reduce on the west-facing
# reach and use two circular rectangular bends to match the existing crossing.
after_probe, reducer = 10,100
spine = transition['read']('balanced-service-architecture.json')['spineCrossings'][0]
target_y,target_z = spine['centreYZ']
turn_end[0] -= after_probe*sb
turn_end[1] -= after_probe*cb
remaining_south = turn_end[1]-r-err-south
shift = target_y-turn_end[1]
offset_angle = math.acos(1-shift/(2*bend_r))
offset_length = 2*bend_r*math.sin(offset_angle)
end_x = turn_end[0]-reducer-offset_length
# The two bends have to be fitted to the measured target ordinate.
# An opposed Y error can also LENGTHEN the S-offset, not only move it.
# The cabinet's allowed positive Y shift shortens that offset.
adverse_angle = math.acos(1-(shift+err)/(2*bend_r))
spare = turn_end[0]-reducer-2*bend_r*math.sin(adverse_angle)-west-err
rect_width = spine['fullJacketYZ'][2]
trunk_side = sy-band/2-target_y-rect_width/2-err
assert min(remaining_south,spare,trunk_side)>0
print(f'Trial after T7: {remaining_south:.1f} mm to south finish, {offset_length:.1f} mm '
      f'for the two bends, {spare:.1f} mm to spine face, {trunk_side:.1f} mm to the warm crossing.')

# Ground-floor plan. East is right and north is up. Footprints below the
# service plane are drawn pale so they remain distinct from occupied duct bands.
parts=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1150 1000" width="1150" height="1000" role="img" aria-labelledby="title desc">',
       '<title id="title">Plant-room heater and sensor comparison</title>',
       '<desc id="desc">Plan of the angled supply route through the intermediate arch, with a dimensioned chain and the two warm pipe shoulders shown.</desc>',
       '<rect width="1150" height="1000" fill="#faf8f2"/>',
       '<style>text{font-family:Arial,sans-serif;fill:#20343a}.title{font-size:29px;font-weight:bold}.h{font-size:20px;font-weight:bold}.body{font-size:15px}.small{font-size:13px}</style>']
scale=.225
def plot(x,y):
    return (44+(x-west)*scale,106+(north-y)*scale)
def txt(x,y,s,cls='body'):
    parts.append(f'<text x="{x:.1f}" y="{y:.1f}" class="{cls}">{escape(s)}</text>')
def rect(x,y,w,h,colour):
    px,py=plot(x,y+h)
    parts.append(f'<rect x="{px:.2f}" y="{py:.2f}" width="{w*scale:.2f}" height="{h*scale:.2f}" fill="{colour}"/>')
def path(points,colour,width):
    pts=' '.join('%.2f,%.2f'%plot(*pt) for pt in points)
    parts.append(f'<polyline points="{pts}" fill="none" stroke="{colour}" stroke-width="{width:.2f}" stroke-linejoin="round"/>')
def dot(point,colour):
    px,py=plot(*point)
    parts.append(f'<circle cx="{px:.2f}" cy="{py:.2f}" r="4.3" fill="{colour}"/>')
def note(point,words,dx,dy):
    x,y=plot(*point)
    txt(x+dx,y+dy,words,'small')
txt(34,40,'A supply heater through the plant arch','title')
txt(34,68,'R-hand W9 development comparison  ·  Ground-floor plan  ·  Dimensions in millimetres')
rect(west,south,east-west,north-south,'#eceae3')
for x,y,w,h in [room['W9BodyFrontSouth'],room['riser'],room['cylinderStation'],room['controls'],room['emitter']]:
    rect(x,y,w,h,'#c9d2d0')
rect(west,wall_s,west_jamb-west,wall_n-wall_s,'#53676b')
rect(east_jamb,wall_s,east-east_jamb,wall_n-wall_s,'#53676b')
rect(nx-band/2,3400-band/2,band,ny-3400+band,'#c79772')
rect(west,sy-band/2,sx+band/2-west,band,'#c79772')
rect(sx-band/2,sy-band/2,band,band,'#b58563')
for x in (10590,10750):rect(x-42,wall_s-25,84,wall_n-wall_s+50,'#8c6d50')
curve=[(p[0]-bend_r*(1-math.cos(i*math.pi/64))*ca,p[1]-bend_r*(1-math.cos(i*math.pi/64))*sa) for i in range(33)]
curve.extend([joint]+[(joint[0]-bend_r*(math.sin(q)-sa),joint[1]-bend_r*(ca-math.cos(q)))
                     for q in [a+(math.pi/2-b-a)*i/32 for i in range(1,33)]])
path(curve+[sensor],'#99bbb9',2*r*scale)
path(curve+[sensor],'#166368',1.8)
path([inlet,outlet],'#246366',9)
dot(sensor,'#a33e29')
path([at(2*straight+heater_length+after_probe)]+[
    (at(2*straight+heater_length+after_probe)[0]-bend_r*(cb-math.cos(q)),
     at(2*straight+heater_length+after_probe)[1]-bend_r*(math.sin(q)-sb))
    for q in [b+(math.pi/2-b)*i/32 for i in range(1,33)]],'#166368',2)
x,y=turn_end
pts=[(x,y),(x-reducer,y)]
for i in range(1,33):
    q=offset_angle*i/32
    pts.append((x-reducer-bend_r*math.sin(q),y+bend_r*(1-math.cos(q))))
x,y=pts[-1]
for i in range(1,33):
    q=offset_angle*(1-i/32)
    pts.append((x-bend_r*(math.sin(offset_angle)-math.sin(q)),y+bend_r*(math.cos(q)-math.cos(offset_angle))))
path(pts+[(west,target_y)],'#166368',2)
dot((west,target_y),'#166368')
note(p,'W9',25,-15)
note((rx,riser[1]),'Riser',-93,-20)
note(inlet,'Heater',-63,10)
note(sensor,'T7',15,12)
note((nx,ny),'Warm pipes',25,-45)
txt(595,128,'Two protected lengths','h')
for i,line in enumerate(['A 60 mm vertical slip space and two R150 turns feed the station.',
                         'The 20.5 mm tangent joins the two fabricated turn planes.',
                         'Both ends of the heater retain 1,000 mm of straight duct.',
                         'The plotted 370 mm body includes its connections.',
                         'The control box, hatch and tools require a measured envelope.']):
    txt(595,162+26*i,line)
txt(595,345,'Installed geometry','h')
for i,line in enumerate([f'Round jacket Ø254. Trial horizontal axis Z{z:.0f}.',
                         f'Riser / first warm shoulder / second shoulder gaps',
                         '   %.1f / %.1f / %.1f mm after the stated setout.'%tuple(gaps),
                         f'Heater transverse envelope limit at the first shoulder: {heater_width_limit:.1f} mm.',
                         f'Circular duct to finished intrados: at least {intrados:.1f} mm radially.',
                         f'Service-height reserve over the 2,250 mm field: {headroom:.0f} mm.']):
    txt(595,379+26*i,line)
txt(595,585,'After the sensor','h')
for i,line in enumerate(['Thin line = further routing comparison, centreline only.',
                         'A 10 mm probe allowance precedes the R150 west turn.',
                         'A 100 mm reducer drops the branch axis 6 mm. Two turns',
                         'meet the proposed 214 × 234 jacket at the spine.',
                         f'Allowance to the south wall: {remaining_south:.1f} mm.',
                         'Test the real probe, bend loss, firestop and removal before selection.']):
    txt(595,619+26*i,line)
txt(44,858,'Ochre = retained low-level pipework and shoulder reservations. Grey = other apparatus / walls.','small')
txt(44,889,'The other three ducts, full hatch opening, access platform and support frame are outside this route proof.','small')
txt(44,945,'Pre-site reference study. The house model still represents local extract.','body')
parts.extend(['</svg>',''])
svg=Path(__file__).with_suffix('.svg')
content='\n'.join(parts)
if '--write' in sys.argv:svg.write_text(content)
else:assert svg.read_text()==content
