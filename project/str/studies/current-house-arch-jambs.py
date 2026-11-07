"""Locate the eight corner window arches, their ceiling reactions and starter bars."""
import hashlib
import itertools
import json
import math
from pathlib import Path
import runpy
import sys

STUDIES = Path(__file__).resolve().parent
HOUSE = STUDIES.parents[1] / 'had/studies/water-replan.json'
WINDOW = STUDIES.parents[1] / 'oas/studies/north-export-occurrence.json'
MODEL = json.loads(HOUSE.read_bytes())['model']
OUTER = json.loads((STUDIES / 'current-house-ground-ties.json').read_bytes())['outer']
ROOF = json.loads((STUDIES / 'current-house-ring-space.json').read_bytes())['rings']['outer']
# Read the owning ceiling selection and the exact cell boundaries used by its ledger.
prior_args = sys.argv[:]
sys.argv = [prior_args[0], '--check']
ledger = runpy.run_path(str(STUDIES / 'current-house-head-actions.py'))
sys.argv = prior_args


def ceiling_load(face, along, coordinate):
    """ULS ceiling load per metre of this wall at one longitudinal coordinate."""
    across = 1 - along
    result = 0.0
    for low, high in itertools.pairwise(ledger['cuts'][across]):
        point = [0, 0]
        point[along] = coordinate
        point[across] = (low + high) / 2
        if ledger['inside'](point, ledger['court']):
            continue
        # Use the same shortest available span and tie-breaker as ceiling().
        options = []
        for axis in range(2):
            crossing = [(datum, index, wall) for index, (wall, direction, datum, start, end)
                        in enumerate(ledger['ceillines'])
                        if direction != axis and start <= point[1-axis] <= end]
            left = max((q for q in crossing if q[0] <= point[axis]),
                       default=None, key=lambda q: q[0])
            right = min((q for q in crossing if q[0] >= point[axis]),
                        default=None, key=lambda q: q[0])
            if left and right and left[0] < right[0]:
                options.append((right[0] - left[0], axis, left, right))
        if not options:
            continue
        span, axis, left, right = min(options, key=lambda q: q[0])
        if axis == across:
            fraction = (point[axis] - left[0]) / span
            for endpoint, share in [(left, 1-fraction), (right, fraction)]:
                if endpoint[2] == face:
                    result += 1.35 * 1.5 * (high-low) / 1000 * share
    return result


openings = [q for q in MODEL['openings']['FIRST'] if q['wall'].startswith('outer-')
            and q['centre'] in (1800, 10200)]
assert len(openings) == 8
rows = []
for opening in openings:
    assert (opening['width'], opening['head'], opening['spring']) == (1000, 2850, 2550)
    centre, face = opening['centre'], opening['wall']
    along = int(face.endswith(('west', 'east')))
    datum = 332.5 if face.endswith(('south', 'west')) else 11667.5
    inner_radius = 1000**2 / (8*300) + 300/2
    angle = math.asin(500/inner_radius)
    mean_radius = inner_radius + 215/2
    half_span = mean_radius * math.sin(angle)
    ring_edge = (inner_radius+215) * math.sin(angle)
    supports = sorted(x[along] for x in ROOF['windStationOrder'] if x[1-along] == datum)
    nearest = min(abs(x-centre)-ring_edge for x in supports)
    assert nearest > 0
    # Split at all finite ceiling wall endpoints. A change of shortest span
    # within the arch must not be hidden behind a single centre-line sample.
    cuts = sorted({centre-half_span, centre+half_span,
                   *(t for t in ledger['cuts'][along] if abs(t-centre)<half_span)})
    bands = [{'interval': [l, r], 'ulsKNPerM': ceiling_load(face, along, (l+r)/2)}
             for l, r in itertools.pairwise(cuts)]
    rows.append({'wall': face, 'centre': centre, 'skewbacks': [centre-half_span, centre+half_span],
                 'skewbackElevation': 3450+2850-inner_radius+mean_radius*math.cos(angle),
                 'outsideRingToNearestRoofStation': nearest, 'ceilingBands': bands})

# Straight extensions of the two curved H16 face bars travel down and into
# the L. Its H20 longitudinal bars are already at fixed physical positions.
# Check the shortest distance of the perpendicular bar centre lines, including
# the transverse coordinate, before granting any development length.
starter_conflicts = []
for radius in (inner_radius+49, inner_radius+215-49):
    start = 1800 - radius*math.sin(angle)
    end = start - 550*math.cos(angle)
    for x, y in OUTER['primaryBarXY']:
        if end <= 262.5+x <= start:
            for lane in (49, 91):
                clear = abs(y-lane) - 10 - 8
                if clear < 0:
                    starter_conflicts.append({'barStartX': start, 'barEndX': end, 'pierBarLocalXY':[x,y],
                                              'archLane': lane, 'surfaceClearance': clear})
assert starter_conflicts and min(c['surfaceClearance'] for c in starter_conflicts) == -12
source_files = [HOUSE, WINDOW, STUDIES/'current-house-ground-ties.json',
                STUDIES/'current-house-ring-space.json', STUDIES/'current-house-head-actions.py']
result = {'role': 'Proposed first-floor corner arch geometry and force inputs. The reinforcement clash prevents using the straight development detail.',
          'sources': {str(f.relative_to(STUDIES.parents[2])): hashlib.sha256(f.read_bytes()).hexdigest() for f in source_files},
          'openings': rows, 'componentAction': 'The independent ceiling uses 1.5 kPa G. The actual roof rings deliver the roof reactions at their 22 stations. The historical 22+7 kN/m arch challenge remains a separate comparator.',
          'pierCage': {'H20CentreFromFace': 43, 'coverOutsideH8': 43-10-8, 'coverOutsideH10':43-10-10,
                       'qualification':'Interior exposure, fire, placement tolerance and actual hoop bends remain to be specified.'},
          'archCage': {'section':[140,215], 'trial':'2H16 at each radial face. H6 hoops, maximum cover 35. Two lanes across the width at 49 and 91.',
                       'clearAcrossParallelBars': 91-49-16, 'straightExtensionMM':550, 'collisions': starter_conflicts},
          'remaining':'Resolve the physical corner reinforcement, complete the coupled arch and right jamb forces, outer masonry thrust, guard brackets, independent window support and accessible renewal.',
          'admitted':False}
output = Path(__file__).with_suffix('.json')
contents = json.dumps(result, indent=2, sort_keys=True) + '\n'
if '--check' in sys.argv:
    assert output.read_text() == contents
else:
    output.write_text(contents)
print('Eight upper corner arches. Straight H16 bars clash with the corner reinforcement by 12 mm.')
