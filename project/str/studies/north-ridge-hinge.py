"""Cross-section of the lowered ridge collector at an ordinary north crown."""
import json
from math import cos, isclose, radians, tan
from pathlib import Path
import sys

D = Path(__file__).resolve().parent


def read(path):
    return json.loads(path.read_text())


roof = read(D.parents[1]/'had/studies/water-replan.json')['model']['roofDevelopment']
edge = read(D.parents[1]/'mat/studies/raised-roof-edge.json')
network = read(D/'current-house-welded-network.json')
route = read(D/'current-house-roof-route.json')
pitch = radians(roof['pitch'])
slope = tan(pitch)
purlin = network['sections']['secondary']
pin_z = route['referenceElevations']['rafterCrownCentre']
pin_r = 22.5  # current route replaces the earlier 40 mm diameter pin
assert '45pinCombined' in route['crown'] and isclose(pin_z, edge['crownPinZ'])
wall = purlin['t']
half = purlin['B']/2
bottom, top = edge['loweredPurlinBoundsZ']
floor = bottom+wall
deck = edge['fieldDeckAtRidgeCentreAndCorner'][0]
packing_z = edge['fieldLiftVertical']
assert isclose(top, deck-half*slope-packing_z)
# Each opposing ray drops away from the shared crown in the section across the ridge.
web_z = [pin_z-d*slope for d in (half-wall, half)]
bottom_cross = [(pin_z-z)/slope for z in (floor, bottom)]
assert floor < min(web_z) <= max(web_z) < top-wall
assert min(bottom_cross) > half
rolled_top = deck-purlin['H']/2*slope-packing_z
rolled_underside = rolled_top-purlin['B']
pin_top = pin_z+pin_r
trial_gap = 10  # desired steel-to-steel vertical separation for this comparison
gross_top = pin_z+network['sections']['primary']['H']/2/cos(pitch)
result = {
    'pinZ': pin_z, 'loweredOutsideZ': [bottom,top],
    'nominalPinClearanceToBoreSideBottomTop': [half-wall-pin_r, pin_z-pin_r-floor, top-wall-pin_top],
    'rafterAxisZAtInsideAndOutsideWeb': web_z, 'axisDistanceToLowerInnerAndOuterFaces': bottom_cross,
    'rolledTopAndBottomZ': [rolled_top, rolled_underside], 'rolledSoffitToPinTopMm': rolled_underside-pin_top,
    'rolledVerticalSecondMomentFraction': purlin['Iminor']/purlin['I'],
    'verticalLiftForBarePinAndTrialGap': pin_top+trial_gap-bottom,
    'verticalLiftForFullRafterEnvelopeAndTrialGap': gross_top+trial_gap-bottom,
    'grossEnvelopeSavingFromRaisedCap': edge['additionalCapLiftVertical']-(gross_top+trial_gap-bottom),
    'admitted': False
}
assert 9.4 < min(result['nominalPinClearanceToBoreSideBottomTop']) < 9.6
assert -9.2 < result['rolledSoffitToPinTopMm'] < -9.0
assert 4.6 < result['grossEnvelopeSavingFromRaisedCap'] < 4.7
if '--svg' not in sys.argv and '--check' not in sys.argv:
    print(json.dumps(result, indent=2))
    raise SystemExit

scale = 1.75
x = lambda q: 255+scale*q
y = lambda z: 366-scale*(z-pin_z)
def outline(points,color,width=2,dash=''):
    coords=' '.join(f'{x(a):.2f},{y(b):.2f}' for a,b in points)
    return f'<polyline points="{coords}" fill="none" stroke="{color}" stroke-width="{width}" stroke-dasharray="{dash}"/>'
def box(a,b,z1,z2,fill):
    return f'<rect x="{x(a):.1f}" y="{y(z2):.1f}" width="{scale*(b-a):.1f}" height="{scale*(z2-z1):.1f}" fill="{fill}"/>'
def label(a,b,words,size=15,fill='#253b41'):
    return f'<text x="{a}" y="{b}" font-size="{size}" fill="{fill}">{words}</text>'

rust, green, ink, paper = '#a0442b','#44706b','#263b43','#faf8f2'
parts=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 510" role="img" aria-labelledby="title desc">',
       '<title id="title">A lower ridge collector around the crown pin</title>',
       '<desc id="desc">Two sloping rafter centrelines leave the pin in opposite directions and cross the longitudinal webs of the lowered hollow section. The pin alone fits in its bore.</desc>',
       '<rect width="1000" height="510" fill="#faf8f2"/><g font-family="sans-serif">',
       label(32,44,'A lower ridge collector around the crown pin',28),
       label(32,74,'Ordinary north frame. Cut perpendicular to the ridge and pin axes. Dimensions in mm.',16),
       box(-half,half,bottom,top,ink),box(-half+wall,half-wall,floor,top-wall,paper),
       outline([(-90,deck-90*slope),(0,deck),(90,deck-90*slope)],green,3),
       f'<circle cx="{x(0)}" cy="{y(pin_z)}" r="{pin_r*scale:g}" fill="#d6dacb" stroke="#546662" stroke-width="2"/>',
       outline([(-100,pin_z-100*slope),(0,pin_z),(100,pin_z-100*slope)],rust,2.5,'6 3'),
       label(31,128,'Board underside',15,green), label(341,225,'150 × 80 × 8 RHS',15),
       label(341,370,'Ø45 pin',16),label(32,467,'Rafter force axes cross the two webs.',16,rust),
       label(520,132,'The shaft fits. The rafter routes cross steel.',20)]
for i,line in enumerate([
    'The nominal square-corner bore leaves 9.50 mm',
    'beside the pin and 9.78 mm below it.',
    'The axes meet the web 32–40 mm from the crown.',
    'They remain above the hollow floor on both sides.',
    'Rolling the section through 90° leaves its underside',
    '9.10 mm below the pin top with the same weather field.',
    'Actual clevis plates, end gaps, axial restraint and',
    'the continuous collector force path need a joint detail.'
]):
    parts.append(label(520,174+i*30,line))
parts += [label(520,467,'Pin, bearing and roof construction remain unselected.',14),'</g></svg>']
drawing='\n'.join(parts)+'\n'
if '--check' in sys.argv:
    assert Path(__file__).with_suffix('.svg').read_text() == drawing
else:
    print(drawing,end='')
