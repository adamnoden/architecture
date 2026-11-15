import json
import math
import runpy
import sys
from contextlib import redirect_stdout
from io import StringIO
from pathlib import Path


def current_case(request, model):
    if not isinstance(request, dict) or set(request) != {'schema', 'windIndex', 'combination'} or request['schema'] != 'str-head-case/1':
        raise ValueError('Expected exact str-head-case/1 fields')

    wind = request['windIndex']
    patterns = model['plane']['actual']
    if type(wind) is not int or not 0 <= wind < len(patterns):
        raise ValueError('Choose a named wind pattern from the retained model')

    combination = request['combination']
    if not isinstance(combination, dict):
        raise ValueError('Explicit signed load combination required')

    fields = set(combination)
    if fields == {'id', 'gravityFactor', 'imposedFactor'} and combination['id'] == 'GQ+wind':
        factors = [('G', combination['gravityFactor'], 1.35), ('Q', combination['imposedFactor'], 1.5)]
    elif fields == {'id', 'suctionFactor'} and combination['id'] in ('stripped suction+wind', 'retained suction+wind'):
        factors = [('U', combination['suctionFactor'], 1.0)]
        if combination['id'] == 'retained suction+wind':
            factors.append(('retainedMin', 1.0, 1.0))
    else:
        raise ValueError('Unsupported load combination for the fixed-base comparison')

    if any(type(value) not in (int, float) or not math.isfinite(value) or not 0 <= value <= maximum
           for _, value, maximum in factors):
        raise ValueError('Load factor outside the existing source envelope')

    ground, _, released, vertical = model['realState']({key: value for key, value, _ in factors}, wind)
    horizontal_heads, horizontal_totals = model['horizontal'](wind)
    return {
        'schema': 'str-head-case-result/1',
        'windIndex': wind,
        'windProgramme': patterns[wind][0],
        'combination': combination,
        'admitted': False,
        'headComponentOrder': ['N', 'Cx', 'Cy', 'Vx', 'Vy'],
        'heads': [
            {'id': head, 'xy': model['xy'](head), 'actions': [*ground[head], *horizontal_heads[head]]}
            for head in sorted(model['heads'])
        ],
        'releasedPassivePads': [{'xy': position, 'signedBeforeRelease': force} for position, force in sorted(released)],
        'verticalEquilibrium': vertical,
        'horizontalEquilibrium': horizontal_totals,
    }


if __name__ == '__main__':
    try:
        request = json.load(sys.stdin)
        with redirect_stdout(StringIO()):
            model = runpy.run_path(str(Path(__file__).with_name('current-house-joined-foundation.py')))
        result = current_case(request, model)
    except ValueError as error:
        raise SystemExit(str(error)) from None
    print(json.dumps(result, allow_nan=False))
