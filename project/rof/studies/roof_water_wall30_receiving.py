"""All22 historical and25/30mm court-wall receiving rows at20kN/mm.

These are unadmitted numerical action comparisons. The historical baseline
has40kN/mm springs and220mm court width. A change from it includes loads,
section and, for both new cases, stiffness; it is not a roof-goods-only increment.
The two wall cases do not establish an envelope over intermediate wall thickness or support stiffness.
"""
from pathlib import Path
import argparse
import hashlib
import json

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--check', action='store_true')
args = parser.parse_args()
names = ['roof_water_current_trial_280_25_60_20_independent.json',
         'roof_water_wall30_trial_280_30_60_20_independent.json']
baseline_path = HERE/'roof_water_receiving_baseline.json'
paths = [baseline_path, *[HERE/name for name in names]]
inputs = [json.loads(path.read_text()) for path in paths]
for path, data in zip(paths, inputs):
    for source, digest in data['sourceHashes'].items():
        assert hashlib.sha256((ROOT/source).read_bytes()).hexdigest() == digest, (path.name, source)
baseline, *cases = inputs
tables = [{tuple(row['xy']): row for row in data['supportReactionRanges']} for data in inputs]
assert all(len(table) == 22 and table.keys() == tables[0].keys() for table in tables)
for case in cases:
    assert case['courtWidthMM'] == 280 and case['courtWallMM'] in (25,30) and case['receivingSpringKNPerMM'] == 20
    assert case['installedOuterHeadDryDomain'] == 'independent'
    assert len(case['installedOuterHeadMassGroups']) == 134
    assert case['weatherRoofRetainedForIndependentMassDomain']

case_ids = [f"wall{case['courtWallMM']:g}_spring{case['receivingSpringKNPerMM']:g}" for case in cases]
rows = []
for xy in sorted(tables[0]):
    historical = tables[0][xy]
    candidates = {}
    for identity, table in zip(case_ids, tables[1:]):
        row = table[xy]
        candidates[identity] = {
            'rangeKN': row['rangeKN'], 'controllingCases': row['controllingCases'],
            'compressionDifferenceFromHistoricalKN': row['rangeKN'][1]-historical['rangeKN'][1],
            'tensionDifferenceFromHistoricalKN': historical['rangeKN'][0]-row['rangeKN'][0],
        }
    rows.append({'xy': list(xy), 'historicalRangeKN': historical['rangeKN'],
                 'historicalControllingCases': historical['controllingCases'],
                 'candidateCases': candidates})

output = {
    'status': 'UNADMITTED25/30MM WALL RECEIVING-ACTION COMPARISONS; NO CAPACITY OR REAL SUPPORT STIFFNESS SELECTED',
    'stationCount': len(rows), 'stations': rows,
    'historicalBaseline': {'courtWidthMM': baseline['courtWidthMM'], 'receivingSpringKNPerMM': 40.,
                          'source': str(baseline_path.relative_to(ROOT))},
    'candidateCases': {identity: {
        'source': str(path.relative_to(ROOT)), 'courtWidthMM': case['courtWidthMM'],
        'courtWallMM': case['courtWallMM'], 'receivingSpringKNPerMM': case['receivingSpringKNPerMM'],
        'maximumCompressionKN': case['worstUpperCompressionKN'],
        'maximumTensionKN': case['worstUpperTensionKN'],
        'M24OriginalComparisonResistanceKN': case['existingM24ComparisonResistanceKN'],
        'M24RemainingKN': case['existingM24ComparisonResistanceKN']-case['worstUpperTensionKN'],
        'screens': case['comparisonScreens'], 'maximumPortalNormalTieKN': case['maximumPortalNormalTieKN'],
        'retainedNativeVerticalWindKN': case['retainedNativeVerticalWindKN'],
        'addedExplicitFloorWindGrossKN': case['addedExplicitFloorWindGrossKN'],
    } for identity, path, case in zip(case_ids, paths[1:], cases)},
    'upperCompressionResistanceKN': None,
    'receivingDuty': cases[0]['upperCompressionDuty'],
    'qualifications': [
        'Both new wall-thickness cases use the same symmetric20kN/mm numerical hypothesis; actual tension/compression/contact assembly stiffness remains unqualified.',
        'No interpolation or complete stiffness-interval envelope is inferred from these wall comparisons.',
        'Historical differences include changed load, collector section and potentially stiffness; they are not attributed solely to roof goods.',
        'All134 exterior/head dry masses vary0..cap at their declared source points; actual residual-piece centroids and roots remain to be joined.',
        'The whole weather roof is retained. Independent mass uncertainty authorises no simultaneous physical renewal operations.',
        'The retained native vertical projection is62.622225kN; added floor gross is19.940625kN under24 independent cassette sign groups. No area-only cancellation is credited.',
        'Frozen4eb pressure inputs omit the primary120mm roof lap aboveZ7290.188718 up to7340.902909 and secondary baffle above7107.33 up to7145; no shielding is proved.',
        'Actual apron rib/standoff contacts, local wind return, graded skins, complete corner articulation and renewal routes remain unqualified.',
        'Same-diameter higher-strength rod material, if considered separately, does not increase elastic modulus or qualify the eight corner load paths.',
    ],
    'sourceHashes': {str(path.relative_to(ROOT)): hashlib.sha256(path.read_bytes()).hexdigest()
                     for path in [*paths, Path(__file__)]},
}


def rounded(value):
    if isinstance(value, dict):
        return {key: rounded(item) for key, item in value.items()}
    if isinstance(value, (tuple, list)):
        return [rounded(item) for item in value]
    return round(value, 9) if isinstance(value, float) else value


target = Path(__file__).with_suffix('.json')
text = json.dumps(rounded(output), indent=2)+'\n'
if args.check:
    assert target.read_text() == text, 'Regenerate the unadmitted receiving-action sensitivities'
else:
    target.write_text(text)
print(json.dumps({'stationCount': len(rows), 'cases': output['candidateCases']}, indent=2))
