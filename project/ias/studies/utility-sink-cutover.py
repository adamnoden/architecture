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
radiator = next(item for item in house['servicesInterface']['emitters'] if item['id'] == 'utility-E')
assert radiator['plan'] == fixtures['service-emitter-utility-E']
rad_x, rad_y, rad_w, rad_d = radiator['plan']
rad_base, rad_top = radiator['z']
rim_width, rim_depth = 440, 450  # Franke 127.0369.215, UK sheet 30 June 2026
post_inside = left[0] + left[3]
post_front = left[1] + left[4]
aperture = right[0] - post_inside
# In the front portal, the upright rim must span both obstacles at this y.
witness_y = (rad_y + post_front) / 2
assert witness_y - rim_depth / 2 < post_front and witness_y + rim_depth / 2 > rad_y
pinch = rad_x - post_inside
assert aperture == 510 and aperture > rim_width > pinch == 375.5
assert rim_depth - (rad_y - post_front) == 42
# The 250-high rectangular handling budget must overlap the radiator to fit
# between both front rails. The real bowl tapers and its rim alone can clear.
lower_rail = frame['EW rail at y1350 / z135']
upper_rail = frame['EW rail at y1350 / z850']
lowest_bottom = lower_rail[2] + lower_rail[5]
highest_top = upper_rail[2]
assert lowest_bottom + 250 > rad_base and highest_top - 250 < rad_top
assert rad_top + route['CLEARANCE'] <= highest_top - route['CLEARANCE']

# Upper route: rim plus an authored handling allowance, with all low plumbing
# already separately supported and disconnected. Actual clips and pickup must fit.
w, d, h = 450, 460, 250
x, y = 11250, 1050
top = 900
moving = [x-w/2, y-d/2, top, w, d, h]  # relative z=0 means underside at top
reserve = route['CLEARANCE']
raised = reserve
placements = [[0,0,raised], [0,750,raised], [-745,750,raised]]
obstacles = {key:[bx,by,0,bw,bd,3500] for key,(bx,by,bw,bd) in fixtures.items()
             if key not in {'service-utility-sink','service-utility-washer','service-utility-valveBay'}}
obstacles['service-emitter-utility-E'] = [rad_x, rad_y, rad_base, rad_w, rad_d, rad_top - rad_base]
washer_plan = fixtures['service-utility-washer']
obstacles['closed washer reservation'] = [*washer_plan[:2],0,*washer_plan[2:],washer['height']]
obstacles.update(host['carrier'])
obstacles.update(host['retainedPipes'])
obstacles['fixed upper water run through operating cabinet'] = [10775,1225,750,50,50,2200]
obstacles['worktop'] = [10950,700,870,600,700,30]
bowl = {'released bowl': moving}
route_test = sweep(bowl, placements, obstacles)
assert route_test['clearance'] == reserve and route_test['retained'] == 'worktop'
for name, expected_gap in [
    ('service-emitter-utility-E', 225),
    ('service-utility-rearServiceChase', 120),
    ('fixed upper water run through operating cabinet', 200),
]:
    assert sweep(bowl, placements, {name: obstacles[name]})['clearance'] == expected_gap
north_wall = next(wall for wall in house['groundWalls'] if wall['id'] == 'utility-north')
assert min(north_wall['finishedFaces']) - (y + 750 + d/2) == 423
assert house['shell'] - house['envelope'] - (x + w/2) == 95.5
direct = sweep(bowl, [[0,0,raised],[-745,0,raised]], obstacles)
assert direct['clearance'] == 0 and 'water' in direct['retained']

# Receiver contacts the rim at 700 via a matching cutout. Full rectangular
# stand including its feet is tested against fixed items, without counting
# its own intentional contact with the bowl as an obstruction.
receiver = [10250,1540,0,510,520,700]
landing = [10505-w/2,1800-d/2,700-h,w,d,h]
assert min(landing[i]-receiver[i] for i in (0,1)) == 30
assert min(receiver[i]+receiver[i+3]-landing[i]-landing[i+3] for i in (0,1)) == 30
land_test = sweep(bowl, [placements[-1],[-745,750,700-h-top]], obstacles)
assert land_test['clearance'] >= reserve
assert min(gap(receiver, item) for item in obstacles.values()) >= reserve
print(f'Front opening {aperture} mm, pinch {pinch} mm, front overlap 42 mm. '
      f'Upper transfer {route_test}; landing {land_test}; receiver edge budget 30 mm.')


def route_plan():
    # North is up. The same placements drive the sweep and the three outlines.
    scale = .21
    def xy(px, py):
        return 55 + (px-10050)*scale, 500 - (py-450)*scale

    def footprint(box, style):
        bx, by, _, bw, bd, _ = box
        left, upper = xy(bx, by+bd)
        return f'<rect x="{left:.2f}" y="{upper:.2f}" width="{bw*scale:.2f}" height="{bd*scale:.2f}" {style}/>'

    def text(px, py, label, size=14, weight='normal'):
        return f'<text x="{px}" y="{py}" font-size="{size}" font-weight="{weight}">{label}</text>'

    parts = ['<svg xmlns="http://www.w3.org/2000/svg" width="760" height="545" viewBox="0 0 760 545">',
             '<title>Utility sink withdrawal to the first dry rest</title>',
             '<desc>Plan of the raised bowl moving north, then west, to a stand beside the washer.</desc>',
             '<rect width="760" height="545" fill="#fffdf8"/>',
             '<g font-family="sans-serif" fill="#20312c">',
             text(35, 40, 'Utility sink withdrawal', 26, 'bold'),
             text(35, 64, 'Plan detail   /   north up   /   dimensions in millimetres', 14)]
    for name in ('closed washer reservation', 'worktop', 'service-utility-rearServiceChase', 'service-emitter-utility-E'):
        parts.append(footprint(obstacles[name], 'fill="#e4e5dd" stroke="#828a80"'))
    parts.append(footprint(obstacles['fixed upper water run through operating cabinet'], 'fill="#8f533a"'))
    parts.append(footprint(receiver, 'fill="#dce9e1" stroke="#31594b" stroke-width="2"'))
    points = []
    for dx, dy, dz in placements:
        parts.append(footprint([moving[0]+dx, moving[1]+dy, moving[2]+dz, w, d, h],
                               'fill="none" stroke="#496458" stroke-width="1.4" stroke-dasharray="5 4"'))
        points.append(xy(x+dx, y+dy))
    parts.append('<polyline points="' + ' '.join(f'{px:.2f},{py:.2f}' for px, py in points)
                 + '" fill="none" stroke="#244f42" stroke-width="3"/>')
    for step, (px, py) in enumerate(points, 1):
        parts.extend([f'<circle cx="{px:.2f}" cy="{py:.2f}" r="10" fill="#244f42"/>',
                      f'<text x="{px:.2f}" y="{py+4:.2f}" fill="white" font-size="12" text-anchor="middle">{step}</text>'])
    parts.extend([text(65, 419, 'Washer', 13), text(249, 441, 'Worktop', 13),
                  text(64, 482, 'Rear service chase', 13), text(270, 115, 'Radiator', 13),
                  '<path d="M323 111h13" fill="none" stroke="#828a80"/>',
                  text(405, 124, '1   Lift clear of the top', 17, 'bold'),
                  text(405, 148, 'Shell underside at +925. Worktop at +900.'),
                  text(405, 203, '2   Move 750 north', 17, 'bold'),
                  text(405, 227, 'Keep the fixed water pipe to the west.'),
                  text(405, 282, '3   Move 745 west and lower', 17, 'bold'),
                  text(405, 306, 'The stand receives the rim at +700.'),
                  text(405, 363, 'Moving shell', 15, 'bold'), text(405, 385, 'Dashed outline: 450 × 460 × 250.'),
                  text(405, 408, 'Receiver: 510 × 520. Pipe shown in brown.'),
                  text(405, 452, 'The bowl passes 225 mm above the radiator.'),
                  text(405, 474, 'Tap, pickup and crew access remain open.'),
                  '</g></svg>'])
    return '\n'.join(parts) + '\n'


if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--write-figure', action='store_true')
    figure = here / 'utility-sink-first-rest.svg'
    if parser.parse_args().write_figure:
        figure.write_text(route_plan())
    else:
        assert figure.read_text() == route_plan(), 'Regenerate utility-sink-first-rest.svg with --write-figure'
