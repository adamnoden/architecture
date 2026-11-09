"""Proposed four-bore transition and first lift above the W9; dimensions in mm."""
import itertools
import json
import math
from pathlib import Path

here = Path(__file__).parent
def read(name):
    return json.loads((here / name).read_text())

ports = read("w9-network-development.json")["nativePortTrial"]["ports"]
room = read("plant-room-rewind.json")["coherentCandidate"]
height = read("w9-forkable-receiver.json")["height"]
east_face = 12000 - read("../../had/studies/water-replan.json")["model"]["envelope"]
assert [p["domain"] for p in ports] == ["supply","extract","outdoor","exhaust"]
top_x = [64, 332, 649, 974]
run, per_axis = 500, 5
steel_od = 200
max_travel = max(abs(p["centreMM"][0]-x) for p,x in zip(ports,top_x))
# Between vertical tangencies set X = X0+(X1-X0)*(3u²-2u³), u=z/run.
max_slope = 1.5*max_travel/run
min_radius = run**2/(6*max_travel)
assert min_radius > steel_od/2

bores, jackets = [], []
for i,j in itertools.combinations(range(4),2):
    (x,y),(xx,yy) = (ports[k]["centreMM"] for k in (i,j))
    # Same-height X separation interpolates between the endpoint gaps.
    # For different heights h, move only the less steep path: horizontal
    # separation >= d0-k*abs(h). Minimising its 3D distance gives the bound.
    delta = 2*per_axis
    dy = max(0,abs(y-yy)-delta)
    dx = min(xx-x,top_x[j]-top_x[i])-delta
    d0 = math.hypot(dx,dy)
    k = 1.5*min(abs(top_x[i]-x),abs(top_x[j]-xx))/run
    bores.append(d0/math.hypot(1,k)-steel_od)
    top_distance = math.hypot(top_x[j]-top_x[i]-delta,dy)
    jackets.append(top_distance-sum(ports[k]["trialFullODMM"]/2 for k in (i,j)))
assert min(bores)>31 and min(jackets)>=28
sleeves = [p["trialFullODMM"]/2 for p in ports]
# A true tube lies within the radius of its centreline in every direction.
# Across the smooth section each centre stays between its start and finish.
left = min(min(p["centreMM"][0],x)-r for p,x,r in zip(ports,top_x,sleeves))
right = max(max(p["centreMM"][0],x)+r for p,x,r in zip(ports,top_x,sleeves))
body_x,_,base_width,_ = room["W9BodyFrontSouth"]
body_freedom = base_width-1000  # entire 6 mm discrepancy assigned east
east_clear = east_face-body_x-body_freedom-right-per_axis
assert east_clear>33 and left == -63
z_tip = height["installedPortTopBound_mm"]
lift, spigot = 45, 28
first_clear = lift-spigot-2*per_axis
remaining = height["to3100Ceiling_mm"]-run-lift
assert first_clear==7 and remaining<5*steel_od
print(f"W9 conditional bare-bore separation >= {min(bores):.2f}, exit jacket gap >= {min(jackets):.1f}; "
      f"R >= {min_radius:.1f}, max slope {max_slope:.3f}. "
      f"East-face clearance >= {east_clear:.1f}. First slide {lift}, cap clearance {first_clear}. "
      f"After release Z{z_tip+run+lift}, remaining {remaining} before ceiling.")
