"""Apparent north roof outline at one ordinary section, on the study datum."""
import json
from math import atan2, degrees, radians, tan
from pathlib import Path
import sys

D = Path(__file__).resolve().parent
P = D.parents[1]
roof = json.loads((P/'had/studies/water-replan.json').read_text())['model']['roofDevelopment']
eave = json.loads((P/'mat/studies/ordinary-eave-joined.json').read_text())['cold']
edge = json.loads((P/'mat/studies/raised-roof-edge.json').read_text())
ridge_q = roof['ridgeInset']
slope = tan(radians(roof['pitch']))
cap_z = edge['trialRidgeCapApexAndEdgeZ'][0]
field_z = edge['trialWallLineAndFieldRidgeZ'][1]
hood_reach = edge['ventCurbPanelEndAndDripFromRidge'][-1]
bottom, front_z, back_z = edge['gutterBottomFrontBackZ']
zinc_z, breather_z = edge['zincAndBreatherDripZ']
points = {
    'gutter': (eave['gutterQ'][0], front_z),
    'gutter back': (eave['gutterQ'][1], back_z),
    'zinc': (eave['zincEdgeQWorldY'][0], zinc_z),
    'breather': (eave['breatherDripQWorldY'][0], breather_z),
    'field': (ridge_q, field_z),
    'hood': (ridge_q-hood_reach, cap_z-hood_reach*slope),
    'cap': (ridge_q, cap_z)
}
common = ['gutter','gutter back','zinc','breather']
eye = 1600  # comparison above ground-floor FFL; ground and viewpoint are unmeasured


def angle(qz, distance, eye_z):
    q,z = qz
    return degrees(atan2(z-eye_z, distance+q))


def outline(distance, names, eye_z=eye):
    return max((angle(points[n], distance, eye_z), n) for n in names)


def switch(a, b, eye_z=eye):
    x,z = points[a]
    y,w = points[b]
    return ((z-eye_z)*y-(w-eye_z)*x)/(w-z)


def difference(d, eye_z=eye):
    ref, ref_name = outline(d, common+['field'], eye_z)
    cap, cap_name = outline(d, common+['hood','cap'], eye_z)
    return [ref_name, cap_name, ref, cap, cap-ref]


limits = [switch(a,b) for a,b in [('gutter','zinc'),('zinc','hood'),('zinc','field'),('hood','cap')]]
assert 5900 < limits[0] < 5950 and 10400 < limits[1] < 10450
assert 12200 < limits[2] < 12250 and 12550 < limits[3] < 12650
assert difference(8000)[:2] == ['zinc','zinc'] and difference(12000)[:2] == ['zinc','hood']
assert difference(15000)[:2] == ['field','cap']
assert .492 < difference(12000)[-1] < .494
if '--svg' not in sys.argv and '--check' not in sys.argv:
    print(json.dumps({'pointsQZmm': points, 'eyeZmm': eye, 'transitionsFromWallMm': limits,
                      'samples': {d: difference(d) for d in [3000,8000,10000,12000,15000,20000]},
                      'hoodFirstSeenAtEye1400And1800': [switch('zinc','hood', z) for z in [1400,1800]]}, indent=2))
    raise SystemExit

# True, equal scales in the radial section. Plot angular differences separately.
def sx(q):
    return 39+(q+14500)*.029

def sy(z):
    return 364-z*.029

def path(coords, color, size, fill='none', dash=None):
    xy=' '.join(f'{x:.2f},{y:.2f}' for x,y in coords)
    stroke_dash = f' stroke-dasharray="{dash}"' if dash else ''
    return f'<polyline points="{xy}" fill="{fill}" stroke="{color}" stroke-width="{size}"{stroke_dash}/>'

def section(coords, color, size, **kwargs):
    return path([(sx(q),sy(z)) for q,z in coords],color,size,**kwargs)

def label(x,y,words,size=15,color='#263a40'):
    return f'<text x="{x}" y="{y}" fill="{color}" font-size="{size}">{words}</text>'

def dot(x,y,r,color):
    return f'<circle cx="{x:.2f}" cy="{y:.2f}" r="{r}" fill="{color}"/>'

cool, rust = '#44706b', '#a0442b'
svg=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1020 520" role="img" aria-labelledby="title desc">',
     '<title id="title">When does the north ridge cap change the skyline?</title>',
     '<desc id="desc">At a 1.6 metre eye height the cap first affects the ordinary north section from 10.43 metres outside the wall. At twelve metres the top of the hood is half a degree above the unhooded comparison.</desc>',
     '<rect width="1020" height="520" fill="#faf8f2"/><g font-family="sans-serif">',
     label(35,49,'When does the north ridge cap change the skyline?',29),
     label(36,81,'Ordinary north section at a 1.60 m eye level above ground-floor datum. Unobstructed sightlines.',16),
     label(36,119,'Eye 12 m outside the wall',19),label(570,119,'Change in apparent outline',19)]
svg += [section([(-14500,0),(2600,0)],'#8d9288',1),
        section([(0,0),(0,edge['trialWallLineAndFieldRidgeZ'][0])],'#43535a',2),
        section([points['zinc'],points['field']],cool,2.2),
        section([points['hood'],points['cap']],rust,3.4),
        section([points['gutter'],(eave['gutterQ'][0],bottom),(eave['gutterQ'][1],bottom),points['gutter back']],'#545f61',1.3)]
eye_pt=(-12000,eye)
for target,ink in [('zinc',cool),('hood',rust)]:
    svg.append(section([eye_pt,points[target]],ink,1.2,dash='5 4'))
svg += [dot(sx(-12000),sy(eye),4,'#293b40'),label(47,345,'Eye',13),label(392,383,'Wall',14),
        label(35,410,'At 12 m, the hood leads the capped outline.',15,rust),
        label(35,434,'The zinc drip leads the unhooded field.',15,cool)]
gx=lambda m: 595+(m-3)*18
gy=lambda a: 357-a*350
for y in [0,.25,.5]:
    svg += [path([(gx(3),gy(y)),(gx(25),gy(y))],'#d3d7cf',1),label(548,gy(y)+5,f'{y:.2f}°',13)]
for m in [5,10,15,20,25]:
    svg += [label(gx(m)-7,384,str(m),14)]
ds=sorted(set([3000+i*100 for i in range(221)]+limits))
svg += [path([(gx(d/1000),gy(difference(d)[-1])) for d in ds],rust,2.8),
        dot(gx(12),gy(difference(12000)[-1]),3,rust),label(620,163,'12 m  +0.49°',14,rust),
        label(619,410,'Distance outside the north wall (m)',15),
        label(35,480,'One radial cut. Actual land levels, closer obstructions, ends of the cap and hip closures can change the view.',15),
        '</g></svg>']
drawing = '\n'.join(svg)+'\n'
if '--check' in sys.argv:
    assert Path(__file__).with_suffix('.svg').read_text() == drawing
else:
    print(drawing, end='')
