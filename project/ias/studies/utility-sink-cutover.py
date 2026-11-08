"""Bound the utility bowl's first release in the existing 40 mm cabinet frame."""
import json
from pathlib import Path
import runpy

here = Path(__file__).resolve().parent
route = runpy.run_path(str(here / 'utility-host-revised-route.py'))
gap, sweep = route['box_gap'], route['minimum_sweep']
host = json.loads((here / 'utility-host-revised-route.json').read_text())['geometry']
house = json.loads((here.parents[1] / 'had/studies/water-replan.json').read_text())['model']
washer = json.loads((here / 'utility-first-release.json').read_text())['native']
fixtures = house['groundFurniture']
frame = host['frame']
left, right = frame['leg 2'], frame['leg 4']
radiator = fixtures['service-emitter-utility-E']
rim_width, rim_depth = 440, 450  # Franke 127.0369.215, UK sheet 30 June 2026
post_inside = left[0] + left[3]
post_front = left[1] + left[4]
aperture = right[0] - post_inside
# In the front portal, the upright rim must span both obstacles at this y.
witness_y = (radiator[1] + post_front) / 2
assert witness_y - rim_depth / 2 < post_front and witness_y + rim_depth / 2 > radiator[1]
pinch = radiator[0] - post_inside
assert aperture == 510 and aperture > rim_width > pinch == 375.5
assert rim_depth - (radiator[1] - post_front) == 42

# Upper route: rim plus an authored handling allowance, with all low plumbing
# already separately supported and disconnected. Actual clips and pickup must fit.
w, d, h = 450, 460, 250
x, y = 11250, 1050
top = 900
moving = [x-w/2, y-d/2, top, w, d, h]  # relative z=0 means underside at top
reserve = route['CLEARANCE']
raised = reserve
placements = [[0,0,raised], [0,-95,raised], [-745,-95,raised], [-745,750,raised]]
obstacles = {key:[bx,by,0,bw,bd,3500] for key,(bx,by,bw,bd) in fixtures.items()
             if key not in {'service-utility-sink','service-utility-washer','service-utility-valveBay'}}
washer_plan = fixtures['service-utility-washer']
obstacles['closed washer reservation'] = [*washer_plan[:2],0,*washer_plan[2:],washer['height']]
obstacles.update(host['carrier'])
obstacles.update(host['retainedPipes'])
obstacles['fixed upper water run through operating cabinet'] = [10775,1225,750,50,50,2200]
obstacles['worktop'] = [10950,700,870,600,700,30]
route_test = sweep({'released bowl':moving}, placements, obstacles)
assert route_test['clearance'] >= reserve
direct = sweep({'released bowl':moving}, [[0,0,raised],[-745,0,raised]], obstacles)
assert direct['clearance'] == 0 and 'water' in direct['retained']

# Receiver contacts the rim at 700 via a matching cutout. Full rectangular
# stand including its feet is tested against fixed items, without counting
# its own intentional contact with the bowl as an obstruction.
receiver = [10250,1540,0,510,520,700]
landing = [10505-w/2,1800-d/2,700-h,w,d,h]
assert min(landing[i]-receiver[i] for i in (0,1)) == 30
assert min(receiver[i]+receiver[i+3]-landing[i]-landing[i+3] for i in (0,1)) == 30
land_test = sweep({'released bowl':moving}, [placements[-1],[-745,750,700-h-top]], obstacles)
assert land_test['clearance'] >= reserve
assert min(gap(receiver, item) for item in obstacles.values()) >= reserve
print(f'Front opening {aperture} mm, pinch {pinch} mm, front overlap 42 mm. '
      f'Upper transfer {route_test}; landing {land_test}; receiver edge budget 30 mm.')
