"""Compare the Acorn split sink bench with the fixed services and four floor seats."""
import json
from pathlib import Path
import runpy
import sys

here = Path(__file__).resolve().parent
geometry = runpy.run_path(str(here / 'utility-host-revised-route.py'))
gap, sweep = geometry['box_gap'], geometry['minimum_sweep']
reserve = geometry['CLEARANCE']
host = json.loads((here / 'utility-host-revised-route.json').read_text())
house = json.loads((here.parents[1] / 'had/studies/water-replan.json').read_text())['model']
washer = json.loads((here / 'utility-first-release.json').read_text())['native']
fixtures = house['groundFurniture']
carrier = host['geometry']['carrier']
left_post = carrier['compact carrier post']
wall = house['shell'] - house['envelope']
# Product: 600 square top; add an authored 5 mm per side to moving gear.
size = 600
width = size + 10
unchanged = wall - (left_post[0] + left_post[3]) - 2 * reserve
assert unchanged == 595.5 < size

# Design alternative: new rack independent of the movable bench. Fixed water
# and waste stay in place. These are required support territories, not ratings.
retained = {key: [x, y, 0, w, d, 3500] for key, (x, y, w, d) in fixtures.items()
            if key not in {'service-utility-sink', 'service-utility-washer', 'service-utility-valveBay'}}
x, y, w, d = fixtures['service-utility-washer']
retained['closed washer'] = [x, y, 0, w, d, washer['height']]
emitter = next(e for e in house['servicesInterface']['emitters'] if e['id'] == 'utility-E')
x, y, w, d = emitter['plan']
assert emitter['plan'] == fixtures['service-emitter-utility-E']
z0, z1 = emitter['z']
retained['service-emitter-utility-E'] = [x, y, z0, w, d, z1 - z0]
retained['east wall'] = [wall, 0, 0, 300, 2500, 3500]
retained['retained waste cap'] = host['geometry']['retainedPipes']['retained accessible waste cap domain']
retained['fixed water riser'] = [10775, 1225, 750, 50, 50, 2200]
retained['fixed water fitting'] = carrier['water fitting and cap domain']
# Shorten the horizontal arms to the new post. Its two return links carry
# reactions to an independent rear rack, with the accessible waste floor bay free.
for name in ('lower pipe arm', 'middle pipe arm', 'valve reaction arm'):
    ax, ay, az, aw, ad, ah = carrier[name]
    retained[name] = [ax, ay, az, aw-30, ad, ah]
    retained[name + ' return'] = [10875, 1165, az, 20, 70, ah]
retained['rack post'] = [10875, 1165, 0, 20, 20, 850]
retained['rack foot'] = [10835, 1100, 0, 70, 100, 10]
for rz in (300, 800):
    retained['rear link ' + str(rz)] = [10875, 700, rz, 20, 485, 20]
access = host['floorAndWall']['wasteAccessTerritory']
assert gap(retained['rack foot'], [*access[:2], 0, *access[2:], 1]) == reserve

# Gross whole package, including restrained taps/feet and transport device.
# No person is treated as part of this 5 mm-per-side allowance.
body = [10930, 735, 0, width, width, 1200]
start, pulled = [0, 0, 0], [0, 400, 0]
whole = sweep({'bench': body}, [start, pulled], retained)
assert whole['clearance'] >= reserve
straight_limit = emitter['plan'][1] - reserve - (body[1] + width)
assert straight_limit == 408
assert sweep({'bench': body}, [start, [0, straight_limit+1, 0]], retained)['clearance'] == reserve-1

# The nominal product sits 5 mm inside the carrying envelope. A complete foot
# must land on its actual proposed seat; the catalogue does not locate all feet.
foot_radius = 20  # inspection case only
seats = host['floorAndWall']['seatPlan']
seat_windows = [[x+foot_radius, x+w-foot_radius, y+foot_radius, y+d-foot_radius] for x,y,w,d in seats]
assert seat_windows == [[10950,11000,720,880], [10950,11000,1220,1380],
                        [11500,11550,720,880], [11500,11550,1220,1380]]
# The 400 mm pull takes each foot off its installed seat. A second force path
# must be in place before moving the supported head or loaded underframe.
assert all(w[2]+pulled[1] > seat[1]+seat[3] for w,seat in zip(seat_windows,seats))

# After four top screws release and the integral head is captured, bound the
# raised package from its lowest point upward. The native frame stays put.
# The vertical pickup through the native brackets needs the actual components.
frame = [body[0]+5, body[1]+5, 0, size, size, 900]
fixed = dict(retained, frame=frame)
head = [body[0], body[1], 925, width, width, 600]
head_path = [[0,0,0], [0,760,0], [-730,760,0]]
head_move = sweep({'head': head}, head_path, fixed)
assert head_move['clearance'] >= reserve
stand = [10170,1465,0,670,670,700]
assert min(gap(stand, b) for b in fixed.values()) >= reserve
# The saddle accepts the rim at 700 with up to 250 mm retained below it;
# intentional contact/void in the receiver is excluded from the obstruction sweep.
land = [*head_path[-1][:2], 700-250-head[2]]
assert sweep({'head': head}, [head_path[-1],land], fixed)['clearance'] >= reserve
assert [head[i]+land[i]-stand[i] for i in (0,1)] == [30,30]
assert [stand[i]+stand[i+3]-(head[i]+land[i]+width) for i in (0,1)] == [30,30]
# Two independent longitudinal rails beneath the top. Positive geometry is a
# receiving specification; it does not certify the manufacturer's underside.
rail_width, outer_margin, body_side_gap = 15, 10, 10
throat = size - 2*(outer_margin + rail_width)
assert throat == 550 and throat - 2*body_side_gap == 530


def drawing():
    svg = ['<svg xmlns="http://www.w3.org/2000/svg" width="960" height="560" viewBox="0 0 960 560">',
           '<title>Utility bench and independently supported sink top</title>',
           '<desc>Plan of the retained underframe and top path. A receiving section shows the two bearing strips and the open throat.</desc>',
           '<rect width="960" height="560" fill="#fffdf8"/><g font-family="sans-serif" fill="#25342f">']
    def label(x,y,t,sz=14):
        svg.append(f'<text x="{x:g}" y="{y:g}" font-size="{sz}">{t}</text>')
    scale = .195
    def xy(x,y): return (55+(x-9900)*scale, 493-(y-450)*scale)
    def rect(box,fill,stroke='#667770'):
        x,y,w,d = box
        px,py = xy(x,y+d)
        svg.append(f'<rect x="{px:g}" y="{py:g}" width="{w*scale:g}" height="{d*scale:g}" fill="{fill}" stroke="{stroke}"/>')
    def plan(b): return [b[0],b[1],b[3],b[4]]
    label(35,38,'Utility sink  /  first supported release',26)
    label(35,64,'Floor plan, north up. The factory frame remains on its four seats.')
    for key in ['closed washer','service-utility-rearServiceChase','service-emitter-utility-E']:
        rect(plan(retained[key]), '#e5e6de')
    rect(plan(stand), '#f4ead8');rect(plan(frame),'#f3f4ee')
    for seat in seats:rect(seat,'#c5b294')
    rect(plan(retained['rack foot']), '#a5654b');rect(plan(retained['fixed water riser']), '#a5654b')
    path=[xy(head[0]+width/2+dx,head[1]+width/2+dy) for dx,dy,_ in head_path]
    pts=' '.join(f'{x:g},{y:g}' for x,y in path)
    svg.append(f'<polyline points="{pts}" fill="none" stroke="#216b62" stroke-width="4"/>')
    xx,yy=path[-1];svg.append(f'<path d="M{xx+10:g},{yy-6:g} L{xx:g},{yy:g} L{xx+10:g},{yy+6:g}" fill="#216b62"/>')
    label(*xy(10150,1030),'Washer');label(*xy(10955,840),'Frame')
    label(*xy(10235,1640),'Head rest');label(*xy(11320,2500),'Radiator')
    label(56,103,'Brown: installed foot seats',13)
    label(56,124,'Rust: fixed services',13)
    label(520,112,'TRANSVERSE SECTION AT THE RECEIVER',15)
    centre,scale=710,.59
    def panel(x,y,w,h,colour):
        svg.append(f'<rect x="{x:g}" y="{y:g}" width="{w:g}" height="{h:g}" fill="{colour}"/>')
    panel(centre-size*scale/2,186,size*scale,5,'#296e66')
    for sign in (-1,1):
        x=centre + sign * (throat+rail_width)*scale/2
        panel(x-rail_width*scale/2,191,rail_width*scale,35,'#9b7853')
    label(520,158,'600 mm integral top, supported at two lands')
    label(622,250,'550 mm clear between rails')
    label(520,293,'Each bearing strip is 15 mm wide.')
    label(520,321,'530 mm maximum lower body at 10 mm each side.')
    label(520,370,'Before the last of four top screws comes out,')
    label(520,393,'capture the head against both fall and tipping.')
    label(520,431,'Verify underside contacts, actual feet and load;')
    label(520,454,'the supplier does not rate these receiving lands.')
    label(35,533,'Five millimetres of handling equipment per side. Mounted taps, pickup and projections must fit the measured package.',13)
    return '\n'.join([*svg,'</g></svg>',''])

asset = here / 'utility-bench-release.svg'
if '--check' in sys.argv:
    assert asset.read_text() == drawing(), 'Regenerate the utility bench drawing.'
else:
    asset.write_text(drawing())
print(f'Factory head: four M6 releases; unchanged whole width fails by {size-unchanged:g} mm. '
      f'Held whole draw ends at {straight_limit} mm. Stationary head transfer: {head_move}. '
      f'Receiver throat {throat} mm; foot-centre windows {seat_windows}.')
