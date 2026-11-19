"""Bind the original and joined roof actions at all 22 receiving stations."""
from pathlib import Path
import hashlib
import json
import sys

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
baseline_path = HERE/'roof_water_receiving_baseline.json'
joined_path = HERE/'roof_water_structure.json'
baseline = json.loads(baseline_path.read_text())
joined = json.loads(joined_path.read_text())
for result in (baseline, joined):
    for name, digest in result['sourceHashes'].items():
        assert hashlib.sha256((ROOT/name).read_bytes()).hexdigest() == digest, f'Stale receiving source: {name}'
old_rows = {tuple(row['xy']): row for row in baseline['supportReactionRanges']}
new_rows = {tuple(row['xy']): row for row in joined['supportReactionRanges']}
assert len(old_rows) == len(new_rows) == 22
assert old_rows.keys() == new_rows.keys()
rows = []
for xy in sorted(old_rows):
    old, new = old_rows[xy], new_rows[xy]
    rows.append({'xy': list(xy), 'originalRangeKN': old['rangeKN'], 'joinedRangeKN': new['rangeKN'],
                 'compressionIncreaseKN': new['rangeKN'][1]-old['rangeKN'][1],
                 'tensionIncreaseKN': old['rangeKN'][0]-new['rangeKN'][0],
                 'originalControllingCases': old['controllingCases'],
                 'joinedControllingCases': new['controllingCases']})
output = {
    'role': 'Receiving action comparison at unchanged physical roof support stations; no receiving resistance is selected.',
    'baselineCourtWidthMM': baseline['courtWidthMM'], 'joinedCourtWidthMM': joined['courtWidthMM'],
    'stationCount': len(rows), 'stations': rows,
    'originalMaximumCompressionKN': baseline['maximumUpperCompressionKN'],
    'joinedMaximumCompressionKN': joined['worstUpperCompressionKN'],
    'largestCompressionIncrease': max(rows, key=lambda row: row['compressionIncreaseKN']),
    'upperCompressionResistanceKN': None, 'receivingDuty': joined['upperCompressionDuty'],
    'sourceHashes': {str(path.relative_to(ROOT)): hashlib.sha256(path.read_bytes()).hexdigest()
                     for path in (baseline_path, joined_path, Path(__file__))}}

def rounded(value):
    if isinstance(value, dict):
        return {key: rounded(item) for key, item in value.items()}
    if isinstance(value, (tuple, list)):
        return [rounded(item) for item in value]
    return round(value, 9) if isinstance(value, float) else value

target = HERE/'roof_water_receiving_comparison.json'
contents = json.dumps(rounded(output), indent=2)+'\n'
if '--check' in sys.argv:
    assert target.read_text() == contents, 'Rebuild the receiving comparison'
else:
    target.write_text(contents)
print(json.dumps({'stations': len(rows), 'largestCompressionIncrease': output['largestCompressionIncrease']}, indent=2))
