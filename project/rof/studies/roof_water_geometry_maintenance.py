"""Finite local roof-goods renewal and an independent-removal rejection control.

Use the recovered native stiffness, loads, portal condensation, fixed-end
recovery and interaction functions without modifying their source or globals.
The weather roof remains present. Retain all 96 signed storm programmes and
the added goods-wind and independently variable water comparisons. No working
wind restriction qualifies the unattended state.
"""
from pathlib import Path
import argparse
import hashlib
import json
import math
import runpy
import sys

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--scope', choices=('finite', 'independent'), default='finite')
parser.add_argument('--court-width', type=int, choices=(280,), default=280)
parser.add_argument('--inner-dry-kg-per-m', type=float, default=60.)
parser.add_argument('--check', action='store_true')
args = parser.parse_args()
assert math.isfinite(args.inner_dry_kg_per_m) and args.inner_dry_kg_per_m > 0
mass_tag = format(args.inner_dry_kg_per_m, '.12g').replace('.', 'p')
selected_path = HERE/f'roof_water_geometry_trial_{args.court_width}_{mass_tag}.json'
selected = json.loads(selected_path.read_text())
for name, digest in selected['sourceHashes'].items():
    assert hashlib.sha256((ROOT/name).read_bytes()).hexdigest() == digest, f'Stale selected source: {name}'
saved_args = sys.argv[:]
try:
    sys.argv = [str(HERE/'roof_water_geometry_trial.py'), f'--court-width={args.court_width}',
                f'--inner-dry-kg-per-m={args.inner_dry_kg_per_m}']
    m = runpy.run_path(str(HERE/'roof_water_geometry_trial.py'))
finally:
    sys.argv = saved_args
weighted_sum, linear_combination = m['weighted_sum'], m['linear_combination']

dry_points = [row for row in m['dry'].placed if row['downN'] > 0]
primary = [row for row in dry_points if row['tag'] == 'outer primary']
lower = [row for row in dry_points if row['tag'] == 'outer lower']
heads = [row for row in dry_points if row['tag'].endswith('head and leader')]
normal_heads = [row for row in heads if row['ring'] == 'outer' and 'normal' in row['tag']]
assert (len(primary), len(lower), len(heads), len(normal_heads)) == (64, 64, 6, 2)


def remove(rows, label, kg=None):
    load = m['Load'](label)
    for row in rows:
        force = row['downN'] if kg is None else 1.35*kg*9.81
        assert force <= row['downN']
        load.place(row['ring'], row['face'], row['radial'], row['station'],
                   down=-force, z=row['source'][2], root_station=row['rootStation'], tag=row['tag'])
    return load


groups = []
if args.scope == 'independent':
    groups = [(f'independent-{j:03d}', [remove([row], row['tag'])]) for j, row in enumerate(dry_points)]
    assert len(groups) == 134
else:
    choices = []
    for row in primary:
        choices.append(remove([row], 'one exterior primary tributary'))
        other = min((v for v in lower if v['face'] == row['face']), key=lambda v: abs(v['station']-row['station']))
        choices.append(remove([row, other], 'one paired exterior primary/lower tributary bay'))
    for head in normal_heads:
        choices.append(remove([head], 'one captured normal head/upper spool, 25 kg', kg=25.))
        near = sorted((v for v in primary if v['face'] == head['face']), key=lambda v: abs(v['station']-head['station']))[:2]
        for row in near:
            for paired in (False, True):
                rows = [row]
                if paired:
                    rows.append(min((v for v in lower if v['face'] == row['face']), key=lambda v: abs(v['station']-row['station'])))
                load = remove(rows, ('paired' if paired else 'primary')+' bay plus adjacent 25 kg normal head/spool')
                load.place(head['ring'], head['face'], head['radial'], head['station'],
                           down=-1.35*25*9.81, z=head['source'][2], root_station=head['rootStation'], tag=head['tag'])
                choices.append(load)
    choices.extend(remove([head], 'one complete head plus 8.4m leader dry bound') for head in heads)
    assert len(choices) == 144
    groups = [('one-local-renewal-state', choices)]

panel_responses = dict(m['panel_responses'])
panel_specs = {programme: list(specs) for programme, specs in m['panel_specs'].items()}
group_records = []
for index, (identity, loads) in enumerate(groups):
    key = ('maintenance dry absence', args.scope, index)
    panel_responses[key] = [m['solve_load'](load) for load in loads]
    for specs in panel_specs.values():
        specs.append(key)
    group_records.append({'id': identity, 'zeroOption': 'No change to installed dry goods.',
                          'choices': [{'id': f'{identity}/{j:03d}', 'label': load.label,
                                       'removedMassKg': -sum(row['downN'] for row in load.placed)/(1.35*9.81),
                                       'loads': load.placed} for j, load in enumerate(loads)]})


def bound_choices(rows):
    return ([min(column) for column in zip(*rows)], [max(column) for column in zip(*rows)])


def sum_bounds(groups):
    return tuple(weighted_sum([(1., group[side]) for group in groups]) for side in (0, 1))


def add_bounds(left, right):
    return tuple([a+b for a, b in zip(left[side], right[side])] for side in (0, 1))


station_ranges = [{'xy': point, 'rangeKN': [math.inf, -math.inf], 'controllingCases': [None, None]}
                  for point in m['support_points']]
tie_ranges = [{**description, 'rangeKN': [math.inf, -math.inf], 'controllingCases': [None, None]}
              for description in m['interface_descriptions']]
results = {}
for crack in (.2, .35):
    portal, units, coupled, guards = m['portal_model'](crack)
    zero_weights = [[0., 0., 0., 0.] for _ in range(8)]
    panels, reactions, ties = {}, {}, {}
    for key, responses in panel_responses.items():
        fields = [m['zero_features']]
        reaction_choices = [m['zero_supports']]
        tie_choices = [[0.]*32]
        for displacement, background, field in responses:
            _, actions = coupled(background, zero_weights)
            fields.append(weighted_sum([(1., field), (-1., linear_combination(actions, m['host_f']))]))
            reaction_choices.append(weighted_sum([(1., m['support_reactions'](displacement)),
                                                  (-1., linear_combination(actions, m['host_reactions']))]))
            tie_choices.append([v/1000 for v in actions])
        panels[key], reactions[key], ties[key] = map(bound_choices, (fields, reaction_choices, tie_choices))
    body = {prog: sum_bounds([panels[key] for key in keys]) for prog, keys in panel_specs.items()}
    body_reactions = {prog: sum_bounds([reactions[key] for key in keys]) for prog, keys in panel_specs.items()}
    body_ties = {prog: sum_bounds([ties[key] for key in keys]) for prog, keys in panel_specs.items()}
    water = (m['zero_features'][:], m['zero_features'][:])
    water_reactions = (m['zero_supports'][:], m['zero_supports'][:])
    water_ties = ([0.]*32, [0.]*32)
    for _, (displacement, background, field) in m['water_responses']:
        _, actions = coupled(background, zero_weights)
        field = weighted_sum([(1., field), (-1., linear_combination(actions, m['host_f']))])
        reaction = weighted_sum([(1., m['support_reactions'](displacement)),
                                  (-1., linear_combination(actions, m['host_reactions']))])
        water = add_bounds(water, bound_choices([m['zero_features'], field]))
        water_reactions = add_bounds(water_reactions, bound_choices([m['zero_supports'], reaction]))
        water_ties = add_bounds(water_ties, bound_choices([[0.]*32, [v/1000 for v in actions]]))
    centroid_fields = []
    for displacement, background, field in m['centroid_responses']:
        _, actions = coupled(background, zero_weights)
        field = weighted_sum([(1., field), (-1., linear_combination(actions, m['host_f']))])
        reaction = weighted_sum([(1., m['support_reactions'](displacement)),
                                  (-1., linear_combination(actions, m['host_reactions']))])
        centroid_fields.append(([abs(v) for v in field], [abs(v) for v in reaction], [abs(v/1000) for v in actions]))
    for programme, indices in m['centroid_programmes'].items():
        for index in indices:
            for table, delta in zip((body, body_reactions, body_ties), centroid_fields[index]):
                table[programme] = add_bounds(table[programme], ([-v for v in delta], delta))

    # Ordinary roof-present modes only. Negative removals are differences
    # from installed goods, so applying them to the already goods-free
    # stripped comparison would manufacture negative dead mass.
    for label, wind_sign in (('partial water down', 1.), ('partial water up', -1.)):
        for specials in (0., 1.35):
            key = f'{crack}|{label}|specials={specials}'
            peaks = {name: {'interaction': 0.} for name in m['models']}
            for wi, state in enumerate(m['p']['space']):
                programme = tuple(state[0])
                active = [m['sap']['load_scope'](programme, opening) for opening in m['sap']['ground']]
                weights = [[1., float(on), 0., 0.] for on in active]
                hor_u, hor_bg, hor_f = m['horizontal'][programme][2]
                uncertainty = add_bounds(body[programme], water)
                reaction_uncertainty = add_bounds(body_reactions[programme], water_reactions)
                tie_uncertainty = add_bounds(body_ties[programme], water_ties)
                background = weighted_sum([(1., m['source_bg'][wi]), (1., m['dry_bg']),
                                           (wind_sign, m['vertical_bg']), (1., hor_bg), (specials, m['special_bg'])])
                _, actions = coupled(background, weights)
                removed = [value*float(on) for (_, old), on in zip(units, active) for value in old]
                current_ties = [(a-b)/1000 for a, b in zip(actions, removed)]
                values = weighted_sum([(1., m['screen_f'][wi]), (1., m['dry_f']), (wind_sign, m['vertical_f']),
                                       (1., hor_f), (specials, m['special_f']), (-1., linear_combination(actions, m['host_f']))])
                current_reactions = weighted_sum([(1., m['screen_reactions'][wi]), (1., m['support_reactions'](m['dry_u'])),
                                                  (wind_sign, m['support_reactions'](m['vertical_u'])),
                                                  (1., m['support_reactions'](hor_u)), (specials, m['support_reactions'](m['special_d'])),
                                                  (-1., linear_combination(actions, m['host_reactions']))])
                for guard in [None, *guards]:
                    for sign in ([0] if guard is None else (-1, 1)):
                        actual = values if guard is None else [a+sign*b for a, b in zip(values, guard[4])]
                        actual_reactions = current_reactions if guard is None else [a+sign*b for a, b in zip(current_reactions, guard[5])]
                        actual_ties = current_ties if guard is None else [a+sign*b/1000 for a, b in zip(current_ties, guard[3])]
                        control = {'case': key, 'windIndex': wi, 'programme': state[0],
                                   'guard': None if guard is None else guard[:2], 'guardSign': sign}
                        for i, row in enumerate(station_ranges):
                            for side in (0, 1):
                                value = actual_reactions[i]+m['support_bounds'][False][side][i]+reaction_uncertainty[side][i]
                                better = value < row['rangeKN'][side] if side == 0 else value > row['rangeKN'][side]
                                if better:
                                    row['rangeKN'][side], row['controllingCases'][side] = value, control
                        for i, row in enumerate(tie_ranges):
                            for side in (0, 1):
                                value = actual_ties[i]+tie_uncertainty[side][i]
                                better = value < row['rangeKN'][side] if side == 0 else value > row['rangeKN'][side]
                                if better:
                                    row['rangeKN'][side], row['controllingCases'][side] = value, control
                        ratios = m['interaction'](actual, m['full_bounds'], uncertainty)
                        for name, indices in m['member_indices'].items():
                            index = max(indices, key=lambda j: ratios[j])
                            if ratios[index] > peaks[name]['interaction']:
                                peaks[name] = {'interaction': ratios[index], **control,
                                               'actions': actual[6*index:6*index+6],
                                               'boundedActions': m['bounded_actions'](index, actual, m['full_bounds'], uncertainty),
                                               **m['location'](index)}
            results[key] = peaks
        print('Finished maintenance', args.scope, crack, label, flush=True)

worst = {name: max((dict(row[name], case=case) for case, row in results.items()), key=lambda row: row['interaction'])
         for name in m['models']}
resistance = selected['existingM24ComparisonResistanceKN']
floor_limit, roof_limit = json.loads((m['D']/'reconciled-house-interface.json').read_text())['jambAndTies']['symmetricTieQualificationKN']
tie_max = {level: max(abs(v) for row in tie_ranges if row['level'] == level for v in row['rangeKN']) for level in ('floor', 'roof')}
tension = -min(row['rangeKN'][0] for row in station_ranges)
critical_station = min(range(len(station_ranges)), key=lambda i: station_ranges[i]['rangeKN'][0])
critical_case = station_ranges[critical_station]['controllingCases'][0]
_, _, coupled, _ = m['portal_model'](float(critical_case['case'].split('|')[0]))
dry_controls = []
for index, (identity, _) in enumerate(groups):
    alternatives = [(0., None)]
    for choice, (displacement, background, _) in enumerate(panel_responses[('maintenance dry absence', args.scope, index)]):
        _, actions = coupled(background, zero_weights)
        reaction = m['support_reactions'](displacement)[critical_station]-linear_combination(actions, m['host_reactions'])[critical_station]
        alternatives.append((reaction, choice))
    contribution, choice = min(alternatives, key=lambda row: row[0])
    if choice is not None:
        dry_controls.append({'group': identity, 'choice': group_records[index]['choices'][choice]['id'],
                             'reactionDeltaKN': contribution})
output = {
    'role': 'Bounded ordinary local roof-goods renewal, with an unrestricted independent-removal rejection control.',
    'designStatus': 'New 350/425 wet geometry and160/190 water trial; original roots retained; independent inner wind addition pending.',
    'scope': args.scope, 'courtWidthMM': args.court_width, 'innerDryKgPerM': [args.inner_dry_kg_per_m]*2, 'roofWeatherRetained': True, 'windProgrammes': len(m['p']['space']),
    'addedGoodsWindRetained': True, 'workingWindRestriction': None, 'independentWaterGroups': len(m['water_responses']),
    'dryRemovalGroups': group_records, 'finiteAlternativeCount': 144 if args.scope == 'finite' else None,
    'oneLocalOperationAtATime': args.scope == 'finite', 'originalInnerCassetteBoundsRetained': True,
    'worst': worst, 'worstUpperTensionKN': tension, 'M24ComparisonResistanceKN': resistance,
    'M24RemainingKN': resistance-tension, 'maximumPortalNormalTieKN': tie_max,
    'criticalTensionStation': station_ranges[critical_station], 'criticalDryRemovalChoices': dry_controls,
    'supportReactionRanges': station_ranges, 'portalNormalTieRanges': tie_ranges, 'cases': results,
    'screens': {'outer': worst['outer']['interaction'] < 1, 'court': worst['court']['interaction'] < 1,
                'M24': tension < resistance, 'floorTies': tie_max['floor'] < floor_limit, 'roofTies': tie_max['roof'] < roof_limit},
    'conditions': ['The finite scope admits exactly one of its identified local states, or the unchanged zero option. Reinstate the previous bay/head before another remote operation.',
                   'The 64 primary units are the source 793.125 mm tributaries; paired lower units are the nearest 799.6875 mm tributaries on the same face. Actual moving-part mass, centroid and root allocation must fit the represented loads.',
                   'The captured normal head and upper spool are at most25 kg. The six complete head/leader alternatives retain the larger75 kg head plus8.4 m copper-leader dry bound.',
                   'Transfer removed parts completely to independent ground support before moving them away from their source load location. Temporary roof-supported apparatus or water needs its own load case.',
                   'Inner cassette remaining dry mass and centroid stay within the original independent cassette rectangles. Those cassette bounds do not themselves include head/leader removal.',
                   'The retained added-wind and water stress comparisons do not prove arbitrary absent-body wind redistribution, fabrication, connection, site actions or the local temporary works.',
                   'The independent scope permits arbitrary remote removals simultaneously and is a rejected comparison, not the ordinary renewal sequence.'],
    'sourceHashes': {**selected['sourceHashes'],
                     str(selected_path.relative_to(ROOT)): hashlib.sha256(selected_path.read_bytes()).hexdigest(),
                     str(Path(__file__).relative_to(ROOT)): hashlib.sha256(Path(__file__).read_bytes()).hexdigest()}}


def rounded(value):
    if isinstance(value, dict):
        return {key: rounded(item) for key, item in value.items()}
    if isinstance(value, (tuple, list)):
        return [rounded(item) for item in value]
    return round(value, 9) if isinstance(value, float) else value


target = HERE/f'roof_water_geometry_maintenance_{args.court_width}_{mass_tag}_{args.scope}.json'
contents = json.dumps(rounded(output), indent=2)+'\n'
if args.check:
    assert target.read_text() == contents, 'Rebuild the bounded roof-goods renewal comparison'
else:
    target.write_text(contents)
# A trial reports the screens and retains a failed result; it does not assume admission.
print(json.dumps({key: output[key] for key in ('scope', 'worstUpperTensionKN', 'M24RemainingKN',
                                               'maximumPortalNormalTieKN', 'screens')}, indent=2))
