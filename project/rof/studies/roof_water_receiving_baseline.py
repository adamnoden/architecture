"""Original SAP-C1 upper receiving reactions, before new rainwater goods.

Recover the unchanged 220 mm native roof, raised cap, coupled portals,
source lead-special origins, independent heel intervals and one signed
guard. No new gutter, cassette, head, leader or new-goods wind load enters
these combinations. This establishes action differences, not resistance.
"""
from pathlib import Path
import hashlib
import json
import math
import runpy
import sys

HERE = Path(__file__).resolve().parent
ARGS = sys.argv[:]
sys.argv = ['roof_water_structure.py', '--court-width=220']
m = runpy.run_path(str(HERE/'roof_water_structure.py'))
weighted_sum, linear_combination = m['weighted_sum'], m['linear_combination']
p = m['p']
points = m['support_points']
lead_reactions = m['support_reactions'](m['lead_d'])
strip_reactions = m['support_reactions'](m['strip_d'])
records = [{'xy': point, 'rangeKN': [math.inf, -math.inf], 'controllingCases': [None, None]}
           for point in points]
for crack in (.2, .35):
    portal, units, coupled, guards = m['portal_model'](crack)
    guard_indices = [max(range(len(guards)), key=lambda j: abs(guards[j][5][i]))
                     for i in range(len(points))]
    guard_peaks = [abs(guards[j][5][i]) for i, j in enumerate(guard_indices)]
    for mode, stripped, portal_g, lead_factor, strip_factor in (
            ('original gravity', False, 1., 1.35, 0.),
            ('original stripped suction', True, 0., 0., 1.)):
        for wi, state in enumerate(p['space']):
            active = [m['sap']['load_scope'](state[0], opening) for opening in m['sap']['ground']]
            weights = [[portal_g, float(on), 0., 0.] for on in active]
            background = weighted_sum([(1., m['source_bg'][wi]),
                                       (lead_factor/1.35, m['source_lead_bg']),
                                       (strip_factor, m['source_strip_bg'])])
            _, actions = coupled(background, weights)
            base = weighted_sum([(1., m['screen_reactions'][wi]),
                                 (lead_factor, lead_reactions), (strip_factor, strip_reactions),
                                 (-1., linear_combination(actions, m['host_reactions']))])
            low, high = m['support_bounds'][stripped]
            for i, row in enumerate(records):
                for side, value in enumerate((base[i]+low[i]-guard_peaks[i],
                                               base[i]+high[i]+guard_peaks[i])):
                    better = value < row['rangeKN'][side] if side == 0 else value > row['rangeKN'][side]
                    if better:
                        row['rangeKN'][side] = value
                        guard_id = guard_indices[i] if guard_peaks[i] else None
                        direction = 1 if guard_id is not None and guards[guard_id][5][i] > 0 else -1
                        row['controllingCases'][side] = {
                            'crack': crack, 'mode': mode, 'windIndex': wi, 'programme': state[0],
                            'guard': None if guard_id is None else guards[guard_id][:2],
                            'guardSign': (1 if side else -1)*direction if guard_id is not None else 0}

paths = [HERE/'roof_water_structure.py', Path(__file__),
         m['D']/'current-house-roof-bracing.py', m['D']/'current-house-ring-return.py',
         m['D']/'reconciled-corner-portals.py', m['D']/'reconciled-slate-roof.py']
output = {
    'role': 'Original SAP-C1 receiving-action baseline; no new rainwater-goods loads.',
    'courtWidthMM': 220, 'outerWidthMM': 220, 'windProgrammes': len(p['space']),
    'sourceLeadCharacteristicKN': sum(lead_reactions),
    'native220Parity': m['frozen_parity'], 'supportReactionRanges': records,
    'maximumUpperTensionKN': -min(row['rangeKN'][0] for row in records),
    'maximumUpperCompressionKN': max(row['rangeKN'][1] for row in records),
    'upperCompressionResistanceKN': None,
    'receivingDuty': 'Actual steel load introduction, finite contact and bedding, core material and section, spreading, splitting, eccentricity/slenderness and downstream floor/foundation route remain unqualified. A 40 kN/mm stiffness spring and historical 200 kN collector screen are not receiving resistance.',
    'sourceHashes': {str(path.relative_to(m['ROOT'])): hashlib.sha256(path.read_bytes()).hexdigest()
                     for path in paths}}

def rounded(value):
    if isinstance(value, dict):
        return {key: rounded(item) for key, item in value.items()}
    if isinstance(value, (tuple, list)):
        return [rounded(item) for item in value]
    return round(value, 9) if isinstance(value, float) else value

target = HERE/'roof_water_receiving_baseline.json'
contents = json.dumps(rounded(output), indent=2)+'\n'
if '--check' in ARGS:
    assert target.read_text() == contents, 'Rebuild the original SAP-C1 receiving baseline'
else:
    target.write_text(contents)
print(json.dumps({key: output[key] for key in ('sourceLeadCharacteristicKN', 'native220Parity',
                                               'maximumUpperTensionKN', 'maximumUpperCompressionKN')}, indent=2))
