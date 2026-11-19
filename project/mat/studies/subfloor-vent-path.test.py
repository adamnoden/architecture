"""Regression challenges for the finite under-gallery crossing."""
import json
import runpy
from copy import deepcopy
from pathlib import Path

from subfloor_vent_path import compare_path, upper_components


here = Path(__file__).resolve().parent
owner = runpy.run_path(str(here / 'floor-pour-boundary.py'))
control = json.loads((here / 'floor-pour-boundary.json').read_text())
result = owner['produce']()
had, grid, rail = [owner['read_source'](control['sources'][name]) for name in ('HAD', 'STRgrid', 'RWTlowerTrack')]
path, void = control['ventCrossing'], result['voidComparison']


def joins(trial=path, structure=grid, track=rail, ground=void):
    return compare_path(trial, had, structure, track, result['ventSliceTrial'], ground)['twoUpperGroupsJoinedByLowerReservation']


assert joins()
# The former D1300 stressed ground buries the lower air route.
assert not joins(ground={**void, 'effectiveStressDatum_mm': -950})
# Clears the nominal HAD track but conflicts with the deeper upper-first rail.
assert not joins(trial={**path, 'lowerZ_mm': [-1360, -1210]})
assert not joins(trial={**path, 'crossExtentY_mm': [6350, 7450]})

modified = deepcopy(grid)
modified['heads'][0]['xy'] = [8500, 6000]
assert not joins(structure=modified)
modified = deepcopy(rail)
outlet = next(s for s in modified['completeAngularProof']['sweeps'] if s['id'].startswith('native-outlet'))
outlet['angular'][0]['minimum'] = 8200
assert not joins(track=modified)

# Corner contact alone does not connect two rectilinear cells.
assert upper_components(1200, [(600, 0, 650, 550), (500, 650, 600, 1200)], 100,
                        {'left': (100, 100), 'right': (1100, 1100)}) == [['left'], ['right']]
print('Underfloor crossing and adverse ground, rail, riser, shaft, motion and contact controls reproduce.')
