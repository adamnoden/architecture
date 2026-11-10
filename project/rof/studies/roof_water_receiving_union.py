"""Union installed and admitted finite-renewal actions at all 22 receivers.

The original no-new-goods baseline remains a separate source. This ledger
adds no receiving resistance and never admits the unrestricted independent
dry-removal comparison. Each side retains its actual source and load case.
"""
from pathlib import Path
import argparse
import hashlib
import json

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--installed', default='roof_water_structure.json')
parser.add_argument('--maintenance', default='roof_water_maintenance_finite.json')
parser.add_argument('--output', default='roof_water_receiving_union.json')
parser.add_argument('--check', action='store_true')
args = parser.parse_args()
for name in (args.installed, args.maintenance, args.output):
    assert Path(name).name == name, 'Use study-local filenames for portable source identity'
paths = {'baseline': HERE/'roof_water_receiving_baseline.json',
         'installed': HERE/args.installed, 'finiteRenewal': HERE/args.maintenance}
inputs = {key: json.loads(path.read_text()) for key, path in paths.items()}
for label, result in inputs.items():
    for name, digest in result['sourceHashes'].items():
        assert hashlib.sha256((ROOT/name).read_bytes()).hexdigest() == digest, f'Stale {label} source: {name}'
baseline, installed, finite = (inputs[key] for key in ('baseline', 'installed', 'finiteRenewal'))
assert finite['scope'] == 'finite' and finite['oneLocalOperationAtATime']
assert finite['finiteAlternativeCount'] == 144
assert len(finite['dryRemovalGroups']) == 1
assert len(finite['dryRemovalGroups'][0]['choices']) == 144
assert all(finite['screens'].values()), 'Only a passing finite comparison may enter this admitted action union'
assert finite['courtWidthMM'] == installed['courtWidthMM']
assert finite['sourceHashes'][str(paths['installed'].relative_to(ROOT))] == hashlib.sha256(paths['installed'].read_bytes()).hexdigest()
by_source = {label: {tuple(row['xy']): row for row in result['supportReactionRanges']}
             for label, result in inputs.items()}
assert all(len(table) == 22 for table in by_source.values())
assert by_source['baseline'].keys() == by_source['installed'].keys() == by_source['finiteRenewal'].keys()
rows = []
for xy in sorted(by_source['baseline']):
    original, current, renewal = (by_source[label][xy] for label in ('baseline', 'installed', 'finiteRenewal'))
    controls = []
    joined = []
    for side in (0, 1):
        choices = [(current['rangeKN'][side], 'installed', current['controllingCases'][side]),
                   (renewal['rangeKN'][side], 'finiteRenewal', renewal['controllingCases'][side])]
        value, source, case = (min if side == 0 else max)(choices, key=lambda item: item[0])
        joined.append(value)
        controls.append({'source': source, 'case': case})
    rows.append({'xy': list(xy), 'originalRangeKN': original['rangeKN'],
                 'installedRangeKN': current['rangeKN'], 'finiteRenewalRangeKN': renewal['rangeKN'],
                 'admittedRangeKN': joined, 'admittedControllingCases': controls,
                 'originalControllingCases': original['controllingCases'],
                 'installedControllingCases': current['controllingCases'],
                 'finiteRenewalControllingCases': renewal['controllingCases'],
                 'compressionIncreaseFromOriginalKN': joined[1]-original['rangeKN'][1],
                 'tensionIncreaseFromOriginalKN': original['rangeKN'][0]-joined[0],
                 'compressionIncreaseFromInstalledKN': joined[1]-current['rangeKN'][1],
                 'tensionIncreaseFromInstalledKN': current['rangeKN'][0]-joined[0]})
output = {
    'role': 'All-station receiving action union of installed and bounded finite local renewal; no receiver resistance is selected.',
    'baselineCourtWidthMM': baseline['courtWidthMM'], 'joinedCourtWidthMM': installed['courtWidthMM'],
    'admittedSources': {label: str(paths[label].relative_to(ROOT)) for label in ('installed', 'finiteRenewal')},
    'excludedScope': 'Unrestricted independent simultaneous dry removals are outside the permitted one-local-operation sequence and are not in this union.',
    'stationCount': len(rows), 'stations': rows,
    'originalMaximumCompressionKN': max(row['originalRangeKN'][1] for row in rows),
    'admittedMaximumCompressionKN': max(row['admittedRangeKN'][1] for row in rows),
    'admittedMaximumTensionKN': -min(row['admittedRangeKN'][0] for row in rows),
    'M24ComparisonResistanceKN': installed['existingM24ComparisonResistanceKN'],
    'M24RemainingKN': installed['existingM24ComparisonResistanceKN']+min(row['admittedRangeKN'][0] for row in rows),
    'largestCompressionIncrease': max(rows, key=lambda row: row['compressionIncreaseFromOriginalKN']),
    'upperCompressionResistanceKN': None, 'receivingDuty': installed['upperCompressionDuty'],
    'maintenanceConditions': finite['conditions'],
    'sourceHashes': {str(path.relative_to(ROOT)): hashlib.sha256(path.read_bytes()).hexdigest()
                     for path in (*paths.values(), Path(__file__))}}


def rounded(value):
    if isinstance(value, dict):
        return {key: rounded(item) for key, item in value.items()}
    if isinstance(value, (tuple, list)):
        return [rounded(item) for item in value]
    return round(value, 9) if isinstance(value, float) else value


contents = json.dumps(rounded(output), indent=2)+'\n'
target = HERE/args.output
if args.check:
    assert target.read_text() == contents, 'Rebuild the installed plus finite-renewal receiving union'
else:
    target.write_text(contents)
print(json.dumps({key: output[key] for key in ('stationCount', 'admittedMaximumCompressionKN',
                                               'admittedMaximumTensionKN', 'M24RemainingKN')}, indent=2))
