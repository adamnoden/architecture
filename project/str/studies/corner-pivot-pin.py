"""A two-eye pin at the near arch spring, using the recorded paired reactions."""
from itertools import product
import json
from math import cos, hypot, sin, sqrt
from pathlib import Path
import runpy
import sys

D = Path(__file__).resolve().parent
source = json.loads((D / 'current-house-arch-bearing.json').read_text())['controls'][0]
width = source['geometry']['normalWidthNominal']
geometry = runpy.run_path(str(D / 'arch-width-geometry.py'))
links = runpy.run_path(str(D / 'arch-link-schedule.py'))
cage = geometry['cage'](width, 'arch', links['spring'])
centre = (source['geometry']['insideConcreteFace'] + source['geometry']['outsideConcreteFace']) / 2
link_y = [centre - cage['cellNormal']/2, centre + cage['cellNormal']/2]
link_r = 3
pin_r = 12
pin_y = [centre - 36, centre + 36]
eyes = [[centre - 34, centre - 22], [centre + 22, centre + 34]]
eye_centres = [sum(eye)/2 for eye in eyes]
first, second = links['schedule']['archH6CentrelineChainageFromNearSpring'][:2]
assert first == 0
records = next(c['nearBearing'] for c in source['coupled']
               if c['crackedEI'] == .2 and not c['allLowerBearings'] and not c['floorRoofYawJoin'])
witness = records['edge']
reverse = records['compression']
assert (reverse['wind'], reverse['window'], reverse['otherWindow']) == (10, 7, 3)
assert (witness['wind'], witness['window'], witness['otherWindow']) == (31, 7, 3)


def resolve(seat, cold, warm):
    # Right-handed moments about the original centre. Axial thrust Fy is separate.
    fx, fy, fz = seat['forceXYZkN']
    mx, my, mz = seat['centroidMomentsXYZkNm']
    assert abs(my) < 1e-8
    span = warm - cold
    wx = (-1000*mz - (cold-centre)*fx) / span
    wz = (1000*mx - (cold-centre)*fz) / span
    vectors = [[fx-wx, fz-wz], [wx, wz]]
    assert abs(sum((y-centre)*v[1] for y,v in zip((cold,warm),vectors))/1000-mx) < 1e-9
    assert abs(sum((centre-y)*v[0] for y,v in zip((cold,warm),vectors))/1000-mz) < 1e-9
    normal = [cos(geometry['angle']), sin(geometry['angle'])]
    return {'normalKN': [v[0]*normal[0] + v[1]*normal[1] for v in vectors], 'XZkN': vectors, 'resultantsKN': [hypot(*v) for v in vectors], 'thrustYkN': fy}


def reactions(seat):
    cases = [resolve(seat, a, b) for a,b in product(*eyes)]
    # Each reaction is a constant vector plus a fixed vector times a scalar
    # when just one contact line moves. Its norm therefore peaks at an end.
    return {'centre': resolve(seat, *eye_centres),
            'maxWithinEachStripKN': [max(row['resultantsKN'][i] for row in cases) for i in (0,1)]}


# The closed H6 plane follows a radial line around the arch centre. Project
# its innermost point onto the spring tangent, normal to the original end face.
shift = 30
min_tangent = (links['centre_radius'] - cage['cellRadial']/2) * sin(shift/links['centre_radius'])
arch = json.loads((D / 'current-house-coupled-arches.json').read_text())['geometry']
opening = geometry['opening']
spring_elevation = arch['springZ']
arc_centre_z = 3450 + opening['head']-geometry['radius']
jamb_side = opening['centre'] - sqrt(geometry['radius']**2 - (spring_elevation-arc_centre_z)**2)
gap_to_loop = min(pin_y[0]-link_y[0], link_y[1]-pin_y[1]) - link_r
first_eye_release = min(pin_y[1]-eyes[1][0], eyes[0][1]-pin_y[0])
result = {
    'pinAxisToClearOpeningXmm': jamb_side-arch['leftSpringX'], 'springNormalCentre': centre, 'endLinkY': link_y, 'endLinkHalfRadial': cage['cellRadial']/2,
    'pinDiameter': 2*pin_r, 'pinY': pin_y, 'eyeStripsY': eyes, 'reactionLinesY': eye_centres,
    'firstLinkContactOnAxialDrawMm': gap_to_loop, 'firstEyeReleaseMm': first_eye_release,
    'trialFirstLinkChainageMm': shift, 'nextLinkChainageMm': second,
    'firstLinkTangentGapAfterTwoFiveMm': min_tangent - pin_r - link_r - 10,
    'east': reactions(witness['seat']), 'north': reactions(witness['otherSeat']),
    'gapAfter15MmRelativeSetout': gap_to_loop-15,
    'reverseEast': resolve(reverse['seat'], *eye_centres),
    'reverseNorth': resolve(reverse['otherSeat'], *eye_centres),
    'admitted': False
}
if '--svg' not in sys.argv:
    print(json.dumps(result, indent=2))
    raise SystemExit

def x(y):
    return 70 + (y + 40)*3

def rect(y1, y2, top, height, fill):
    return f'<rect x="{x(y1):g}" y="{top}" width="{x(y2)-x(y1):g}" height="{height}" fill="{fill}"/>'

def label(px, py, words, size=15, anchor='start'):
    return f'<text x="{px}" y="{py}" font-size="{size}" text-anchor="{anchor}">{words}</text>'

svg = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 890 420" role="img" aria-labelledby="title description">',
       '<title id="title">The corner-window pivot at the end link</title>',
       '<desc id="description">Section through the pin axis at the near spring. Two bearing eyes lie between the sides of a closed reinforcing link. That link blocks withdrawal in either direction.</desc>',
       '<rect width="890" height="420" fill="#faf8f2"/>',
       '<g fill="#263a40" font-family="sans-serif">',
       label(42,46,'The pivot at the corner window',28),
       label(42,75,'Across the 180 mm arch at the near spring. Horizontal dimensions in mm. Heights schematic.',15),
       rect(-40,140,104,174,'#e5e2d9'), label(x(-40),304,'Cold face −40'),
       label(x(140),304,'Room face +140',15,'end')]
for line in link_y:
    svg += [rect(line-link_r,line+link_r,112,156,'#825841'),
            label(x(line),332,f'H6 at Y{line:g}',14,'middle')]
for a,b in eyes:
    svg += [rect(a,b,148,72,'#477174')]
svg += [rect(*pin_y,169,30,'#313e45'),
        label((x(pin_y[0])+x(pin_y[1]))/2,191,'Ø24 pin',14,'middle').replace('<text','<text fill="white"'),
        label(635,126,'Two pier eyes',20), label(635,157,'12 mm wide each.'),
        label(635,186,'Axial thrust needs a'), label(635,207,'separate restraint.')]
for line in eye_centres:
    svg += [f'<path d="M{x(line)} 222v22" stroke="#36464b"/>']
svg += [f'<path d="M{x(eye_centres[0])} 239H{x(eye_centres[1])}" stroke="#36464b"/>',
        label(x(centre),264,'56 mm between eye centres',14,'middle'),
        label(42,378,'The pin meets the H6 after 13 mm of axial travel. It needs 14 mm to clear even the first eye.',17),
        '</g></svg>']
print('\n'.join(svg))
