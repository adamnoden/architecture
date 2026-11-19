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


def north_fixed_base_replays(request, model):
    if set(request) != {'schema', 'windIndex', 'sense', 'yawMagnitudeKNm', 'increments'}:
        raise ValueError('Expected exact str-head-north-fixed-base-replays/1 fields')
    wind = request['windIndex']
    return {
        'schema': 'str-head-north-fixed-base-replays-result/1',
        'yawProbe': north_yaw_probe({
            'schema': 'str-head-north-yaw-probe/1', 'windIndex': wind,
            'sense': request['sense'], 'yawMagnitudeKNm': request['yawMagnitudeKNm'],
        }, model),
        'deadLoadReplay': north_dead_load({
            'schema': 'str-head-north-dead-load/1', 'windIndex': wind, 'increments': request['increments'],
        }, model),
    }



def _upper_number(value):
    return type(value) in (int, float) and math.isfinite(value)


def _upper_hull(points):
    ordered = sorted(set(tuple(point) for point in points))
    def turn(a, b, c):
        return (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])
    lower, upper = [], []
    for point in ordered:
        while len(lower) >= 2 and turn(lower[-2], lower[-1], point) <= 0:
            lower.pop()
        lower.append(point)
    for point in reversed(ordered):
        while len(upper) >= 2 and turn(upper[-2], upper[-1], point) <= 0:
            upper.pop()
        upper.append(point)
    hull = lower[:-1]+upper[:-1]
    if len(hull) < 3:
        raise ValueError('A nondegenerate authored inner contact hull is required')
    return hull


def _upper_contact(vector, delta_centroid_m, hull_m):
    n, sx, sy = vector
    rows = [('positive-resultant', n, 1.)]
    for index, (a, b) in enumerate(zip(hull_m, hull_m[1:]+hull_m[:1])):
        dx, dy = b[0]-a[0], b[1]-a[1]
        rows.append((f'contact-hull-edge-{index}',
                     dx*(sy-n*a[1])-dy*(sx-n*a[0]),
                     dx*(delta_centroid_m[1]-a[1])-dy*(delta_centroid_m[0]-a[0])))
    required = 0.
    governing = None
    impossible = []
    for name, value, influence in rows:
        if influence < -1e-10:
            raise ValueError('The additional retained centroid lies outside the authored contact hull')
        if influence <= 1e-10:
            if value < -1e-7:
                impossible.append(name)
        elif -value/influence > required:
            required = -value/influence
            governing = name
    return {
        'passesNecessaryVerticalCondition': not any(value < -1e-7 for _, value, _ in rows),
        'failedConditions': [name for name, value, _ in rows if value < -1e-7],
        'minimumAdditionalRetainedNKN': None if impossible else required,
        'governingCondition': governing,
        'unreachableConditions': impossible,
    }


def upper_cut_compression(request, model):
    fields = {'schema', 'cutZMm', 'roofRiseMm', 'additionalRetainedNKN', 'additionalRetainedCentroidXYMm'}
    if not isinstance(request, dict) or set(request) != fields or request['schema'] != 'str-upper-cut-compression/1':
        raise ValueError('Expected exact str-upper-cut-compression/1 fields')
    cut, rise, added = (request[key] for key in ('cutZMm', 'roofRiseMm', 'additionalRetainedNKN'))
    centroid = request['additionalRetainedCentroidXYMm']
    if not all(_upper_number(value) for value in (cut, rise, added)) or not 0 <= rise <= 120 or not 0 <= added <= 1000000:
        raise ValueError('Use finite cut, retained load from zero to 1000000 kN and a roof rise from zero to 120 mm')
    if not isinstance(centroid, list) or len(centroid) != 2 or not all(map(_upper_number, centroid)):
        raise ValueError('An explicit finite additional retained load centroid in XY millimetres is required')
    lateral, plane = model['old']['lat'], model['plane']
    low, high = lateral['capillarySplice']['plateZ']
    if not low < cut < high:
        raise ValueError('The upper cut must lie inside the source DPC plate')
    hull_mm = _upper_hull(point for pier in lateral['RClegs']['piers'] for point in pier['polygon'])
    hull = [[x/1000, y/1000] for x, y in hull_mm]
    centroid_m = [value/1000 for value in centroid]
    _upper_contact([0., 0., 0.], centroid_m, hull)
    pressure = lateral['wind']['designPressure']
    width = (plane['H']['shell']+2*plane['H']['roofDevelopment']['overhang'])/1000
    if not math.isclose(pressure*width, model['old']['ww'], rel_tol=1e-12):
        raise ValueError('The source facade pressure or width differs from the retained native load method')
    peak, base, floor, roof = (plane[key] for key in ('peak', 'base', 'ff', 'rr'))
    retained = [math.fsum(vector[index] for (family, case), vector in model['orig'].items() if case == 'retainedMin') for index in range(3)]
    suction = model['orig']['shifted roof excluding global braces', 'U']
    original = [a+b for a, b in zip(retained, suction)]
    delta = [added, added*centroid_m[0], added*centroid_m[1]]
    rows, moment_errors, force_errors, vertical_errors = [], [], [], []
    for wind, case in enumerate(plane['actual']):
        vertical = [0., 0., 0.]
        for ring in model['rings'].values():
            for load in model['windrows'](ring, wind):
                n, point = load['n'], load['xy']
                vertical[0] += n
                for axis in (0, 1):
                    vertical[axis+1] += n*point[axis]/1000
        vertical_errors.append(abs(vertical[0]))
        moment, horizontal, checks = [], [], []
        for axis, mode in enumerate(case[0]):
            sense = 0 if not mode else 1 if mode < 4 else -1
            loaded_width = width if mode and (mode-1)%3 == 0 else width/2
            w = sense*pressure*loaded_width
            source_moment = math.fsum((forces[axis]*(floor-cut)+forces[axis+2]*(roof-cut))/1e6 for forces in case[3].values())
            source_force = math.fsum(forces[axis]+forces[axis+2] for forces in case[3].values())/1000
            lower_reaction = w*(floor-base)/2000
            translated_lower = lower_reaction*(base-cut)/1000
            removed_slice = w*((cut-base)/1000)**2/2
            native_upper_moment = source_moment+vertical[axis+1]+translated_lower+removed_slice
            native_upper_force = source_force+lower_reaction-w*(cut-base)/1000
            height = (peak-cut)/1000
            analytic_moment, analytic_force = w*height**2/2, w*height
            moment_errors.append(abs(native_upper_moment-analytic_moment))
            force_errors.append(abs(native_upper_force-analytic_force))
            changed_height = (peak+rise-cut)/1000
            moment.append(w*changed_height**2/2)
            horizontal.append(w*changed_height)
            checks.append({'sourceFloorRoofMomentKNm': source_moment, 'ringVerticalWindMomentKNm': vertical[axis+1],
                           'lowerReactionTranslationKNm': translated_lower, 'removedBelowCutMomentKNm': removed_slice,
                           'nativeUpperMomentKNm': native_upper_moment, 'analyticUpperMomentKNm': analytic_moment})
        current = [original[0], original[1]+moment[0], original[2]+moment[1]]
        candidate = [a+b for a, b in zip(current, delta)]
        baseline_check = _upper_contact(current, centroid_m, hull)
        trial_check = _upper_contact(candidate, centroid_m, hull)
        rows.append({'wind': wind, 'programme': list(case[0]), 'courtProjection': wind >= len(plane['actual'])//2,
                     'upperWindForceKN': horizontal, 'upperWindMomentKNm': moment,
                     'baselineN_Xfirst_Yfirst': current, 'candidateN_Xfirst_Yfirst': candidate,
                     'baseline': baseline_check, 'candidate': trial_check, 'nativeUpperCutReplay': checks})
    if max(moment_errors+force_errors+vertical_errors) > 1e-6:
        raise ValueError('The originating force/height cut does not reproduce the native external wind envelope')
    minimums = [row['baseline']['minimumAdditionalRetainedNKN'] for row in rows]
    governing = None if any(value is None for value in minimums) else max(range(len(rows)), key=lambda index: minimums[index])
    return {
        'schema': 'str-upper-cut-compression-result/1', 'cutZMm': cut, 'roofRiseMm': rise,
        'sourcePeakZMm': peak, 'innerContactConvexHullXYMm': hull_mm,
        'additionalRetainedNKN': added, 'additionalRetainedCentroidXYMm': centroid,
        'sourceRetainedMinimum': retained, 'sourceUniformSuction': suction,
        'componentOrder': ['N_kN', 'X_first_moment_kNm', 'Y_first_moment_kNm'],
        'sourcePressureKPa': pressure, 'sourceFacadeWidthM': width,
        'nativeUpperCutReplayResidual': {'momentKNm': max(moment_errors), 'forceKN': max(force_errors), 'netVerticalWindKN': max(vertical_errors)},
        'baselinePassingCount': sum(row['baseline']['passesNecessaryVerticalCondition'] for row in rows),
        'candidatePassingCount': sum(row['candidate']['passesNecessaryVerticalCondition'] for row in rows),
        'windCaseCount': len(rows), 'minimumAdditionalRetainedNKN': None if governing is None else minimums[governing],
        'governingWind': governing, 'cases': rows, 'completeSpliceDemand': None, 'admitted': False,
        'scope': 'Necessary global vertical/contact equilibrium over the convex hull of actual inner pier footprints only. Added load and centroid are explicit conditional demand inputs, not evidence of retained material or an adopted tie route. Roof rise changes the external pressure height only; it does not replay altered frame stiffness. No local DPC bearing/shear, sliding, masonry, connection, moisture or construction acceptance.',
    }


def origin_load_account(request, model):
    if set(request) not in ({'schema'}, {'schema', 'globalContactTrial'}):
        raise ValueError('Expected exact str-origin-load-account/1 fields')
    result = {
        'schema': 'str-origin-load-account-result/1',
        'admitted': False,
        'coreBudgetHeightsMm': model['old']['CORE_HEIGHTS_MM'],
        'origins': [{'family': family, 'case': case, 'N_Xmoment_Ymoment': vector}
                    for (family, case), vector in sorted(model['orig'].items())
                    if case in ('G', 'Q', 'U', 'retainedMin')],
    }
    if 'globalContactTrial' in request:
        if not isinstance(request['globalContactTrial'], dict):
            raise ValueError('Expected an explicit global contact trial')
        result['globalContact'] = upper_cut_compression({'schema': 'str-upper-cut-compression/1', **request['globalContactTrial']}, model)
    return result


if __name__ == '__main__':
    try:
        request = json.load(sys.stdin)
        with redirect_stdout(StringIO()):
            model = runpy.run_path(str(Path(__file__).with_name('current-house-joined-foundation.py')))
        schema = request.get('schema') if isinstance(request,dict) else None
        if not isinstance(schema,str):
            schema = None
        run = {
            'str-origin-load-account/1': origin_load_account,
            'str-upper-cut-compression/1': upper_cut_compression,
            'str-head-north-yaw-probe/1': north_yaw_probe,
            'str-head-north-dead-load/1': north_dead_load,
            'str-head-north-fixed-base-replays/1': north_fixed_base_replays,
        }.get(schema, current_case)
        result = run(request, model)
    except ValueError as error:
        raise SystemExit(str(error)) from None
    print(json.dumps(result, allow_nan=False))
