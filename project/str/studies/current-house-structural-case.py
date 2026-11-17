import json
import math
import runpy
import sys
from contextlib import redirect_stdout
from io import StringIO
from pathlib import Path


def wind_case(request, model):
    wind = request['windIndex']
    patterns = model['plane']['actual']
    if type(wind) is not int or not 0 <= wind < len(patterns):
        raise ValueError('Choose a named wind pattern from the retained model')
    return wind, patterns[wind][0]


def current_case(request, model):
    if not isinstance(request, dict) or set(request) != {'schema', 'windIndex', 'combination'} or request['schema'] != 'str-head-case/1':
        raise ValueError('Expected exact str-head-case/1 fields')

    wind, programme = wind_case(request, model)

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
        'windProgramme': programme,
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


def horizontal_equilibrium(vectors, xy, origin=(0, 0)):
    x, y = origin
    return [math.fsum(vector[0] for vector in vectors.values()),
            math.fsum(vector[1] for vector in vectors.values()),
            math.fsum(((xy(head)[0]-x)*vy-(xy(head)[1]-y)*vx)/1000
                      for head, (vx, vy) in vectors.items())]


def north_corner_groups(model):
    north_piers = sorted((pier['cornerPileGroup'] for pier in model['old']['lat']['RClegs']['piers']
                          if pier['cornerPileGroup'][0][1] == model['B']), key=lambda group: group[0][0])
    if len(north_piers) != 2 or any(len(group) != 3 for group in north_piers):
        raise ValueError('The retained model needs two north three-head groups')
    return north_piers


def north_yaw_probe(request, model):
    if set(request) != {'schema', 'windIndex', 'sense', 'yawMagnitudeKNm'}:
        raise ValueError('Expected exact str-head-north-yaw-probe/1 fields')
    wind, programme = wind_case(request, model)
    magnitude = request['yawMagnitudeKNm']
    if type(magnitude) not in (int, float) or not math.isfinite(magnitude) or magnitude < 0:
        raise ValueError('Use a finite nonnegative isolated yaw magnitude')
    factors = {'zero': 0, 'nw-positive': 1, 'ne-positive': -1}
    sense = request['sense']
    if not isinstance(sense, str) or sense not in factors:
        raise ValueError('Choose zero, nw-positive or ne-positive yaw')

    old = model['old']
    north_piers = north_corner_groups(model)
    north_corners = [tuple(pier[0]) for pier in north_piers]
    signed = magnitude*factors[sense]
    yaw = dict(zip(north_corners, (signed, -signed)))
    horizontal = model['horizontal']
    before, baseline_equilibrium = horizontal(wind)
    after, probed_equilibrium = horizontal(wind, addedYaw=yaw)
    assert len(before) == len(after) == len(model['heads']) == 52
    delta = {head: [probed-baseline for probed, baseline in zip(after[head], before[head])] for head in before}
    xy = model['xy']
    groups = []
    for label, origin, points in zip(('NW', 'NE'), north_corners, north_piers):
        ids = [old['coord'][tuple(point)] for point in points]
        loads = {head: delta[head] for head in ids}
        group_equilibrium = horizontal_equilibrium(loads, xy, origin)
        assert max(abs(group_equilibrium[0]), abs(group_equilibrium[1]),
                   abs(group_equilibrium[2]-yaw[origin])) < 1e-8
        groups.append({'id': label, 'cornerXYmm': origin, 'headIds': ids, 'appliedYawKNm': yaw[origin],
                       'deltaHorizontalEquilibrium': group_equilibrium})
    affected = {head for group in groups for head in group['headIds']}
    assert len(affected) == 6
    assert all(max(map(abs, vector)) < 1e-9 for head, vector in delta.items() if head not in affected)
    equilibrium_delta = horizontal_equilibrium(delta, xy)
    assert max(map(abs, equilibrium_delta)) < 1e-8
    assert all(abs((after_value-before_value)-change) < 1e-8
               for before_value, after_value, change in zip(baseline_equilibrium, probed_equilibrium, equilibrium_delta))
    return {
        'schema': 'str-head-north-yaw-probe-result/1',
        'windIndex': wind,
        'windProgramme': programme,
        'sense': sense,
        'yawMagnitudeKNm': magnitude,
        'admitted': False,
        'heads': [{'id': head, 'xy': xy(head), 'beforeHorizontalKN': before[head], 'probedHorizontalKN': after[head],
                   'deltaHorizontalKN': delta[head]} for head in sorted(model['heads'])],
        'groups': groups,
        'horizontalEquilibriumOrder': ['Fx_kN', 'Fy_kN', 'Mz_kNm'],
        'baselineHorizontalEquilibrium': baseline_equilibrium,
        'probedHorizontalEquilibrium': probed_equilibrium,
        'deltaHorizontalEquilibrium': equilibrium_delta,
    }


def north_dead_load(request, model):
    if set(request) != {'schema', 'windIndex', 'increments'}:
        raise ValueError('Expected exact str-head-north-dead-load/1 fields')
    wind, programme = wind_case(request, model)
    increments = request['increments']
    if not isinstance(increments, list) or len(increments) != 2:
        raise ValueError('Provide the two source-bound corner load increments')
    ids_at = model['old']['coord']
    nominal = {}
    for group, increment in zip(north_corner_groups(model), increments):
        if not isinstance(increment, dict) or set(increment) != {'cornerHeadId','centroidXYMm','characteristicKN'}:
            raise ValueError('Each corner increment needs a named head, centroid and characteristic weight')
        corner = tuple(group[0])
        if increment['cornerHeadId'] != ids_at[corner]:
            raise ValueError('The increment must identify the retained north corner')
        centroid = increment['centroidXYMm']
        weight = increment['characteristicKN']
        if not isinstance(centroid, list) or len(centroid) != 2 or not all(
            type(value) in (float,int) and math.isfinite(value) for value in centroid+[weight]
        ) or weight <= 0:
            raise ValueError('Use finite centroid coordinates and positive characteristic weight')
        x_toe = next(tuple(point) for point in group[1:] if point[1] == corner[1])
        y_toe = next(tuple(point) for point in group[1:] if point[0] == corner[0])
        fx = (centroid[0]-corner[0])/(x_toe[0]-corner[0])
        fy = (centroid[1]-corner[1])/(y_toe[1]-corner[1])
        shares = [1-fx-fy,fx,fy]
        if min(shares) < 0:
            raise ValueError('The added vertical resultant leaves its retained three-head comparison')
        nominal.update((ids_at[point], [weight*share,0,0]) for point, share in zip((corner,x_toe,y_toe), shares))
    real_state = model['realState']
    states = []
    for label, factors in (('GQ+wind',{'G':1.35,'Q':1.5}),
                           ('stripped suction+wind',{'U':1}),
                           ('retained suction+wind',{'U':1,'retainedMin':1})):
        factor = factors.get('G',0)
        baseline, _, released, baseline_equilibrium = real_state(factors,wind)
        increment = {head: [factor*n, cx, cy] for head,(n,cx,cy) in nominal.items()}
        candidate, _, candidate_released, equilibrium = real_state(factors,wind,addedRoutedActions=increment)
        assert candidate_released == released
        delta = [new-old for new,old in zip(equilibrium,baseline_equilibrium)]
        demands = [factor*row['characteristicKN'] for row in increments]
        expected = [sum(demands), *[sum(n*row['centroidXYMm'][axis]/1000 for n,row in zip(demands,increments))
                                   for axis in (0,1)]]
        assert max(abs(a-b) for a,b in zip(delta,expected)) < 1e-8
        states.append({
            'id':label, 'additionalGravityFactor':factor,
            'baselineVerticalEquilibrium':baseline_equilibrium, 'candidateVerticalEquilibrium':equilibrium,
            'deltaVerticalEquilibrium':delta, 'releasedPassivePadCount':len(released),
            'heads':[{'id':head, 'xy':model['xy'](head), 'baselineVertical':baseline[head],
                      'candidateVertical':candidate[head], 'deltaVertical':[a-b for a,b in zip(candidate[head],baseline[head])]}
                     for head in sorted(model['heads'])],
        })
    return {
        'schema':'str-head-north-dead-load-result/1', 'windIndex':wind, 'windProgramme':programme,
        'admitted':False, 'headActionOrder':['N_kN','Cx_kNm','Cy_kNm'],
        'equilibriumOrder':['N_kN','X_first_moment_kNm','Y_first_moment_kNm'],
        'states':states, 'horizontalEquilibrium':model['horizontal'](wind)[1],
    }


if __name__ == '__main__':
    try:
        request = json.load(sys.stdin)
        with redirect_stdout(StringIO()):
            model = runpy.run_path(str(Path(__file__).with_name('current-house-joined-foundation.py')))
        schema = request.get('schema') if isinstance(request,dict) else None
        if not isinstance(schema,str):
            schema = None
        run = {'str-head-north-yaw-probe/1':north_yaw_probe, 'str-head-north-dead-load/1':north_dead_load}.get(schema,current_case)
        result = run(request, model)
    except ValueError as error:
        raise SystemExit(str(error)) from None
    print(json.dumps(result, allow_nan=False))
