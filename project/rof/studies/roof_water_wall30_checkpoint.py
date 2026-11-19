"""Source-bound 30 mm wall comparison; frozen pressure and receiving physics remain open."""
from pathlib import Path
import argparse
import hashlib
import json

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--check', action='store_true')
args = parser.parse_args()
NAMES = [
    'roof_water_wall30_trial.py', 'roof_water_wall30_trial_280_30_60_20_independent.json',
    'roof_water_wall30_movement.py', 'roof_water_wall30_movement_280_30_60_20_independent.json',
    'roof_water_wall30_lateral.py', 'roof_water_wall30_lateral_280_30_60_20_independent.json',
    'roof_water_wall30_receiving.py', 'roof_water_wall30_receiving.json',
    'roof_water_current_checkpoint.py', 'roof_water_current_checkpoint.json',
    'roof_water_current_trial_280_25_60_20_independent.json',
]

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def read(name):
    return json.loads((HERE/name).read_text())

for name in NAMES:
    if name.endswith('.json'):
        for source, digest in read(name).get('sourceHashes', {}).items():
            assert sha(ROOT/source) == digest, (name, source)
old = read('roof_water_current_trial_280_25_60_20_independent.json')
current = read('roof_water_wall30_trial_280_30_60_20_independent.json')
previous_checkpoint = read('roof_water_current_checkpoint.json')
movement = read('roof_water_wall30_movement_280_30_60_20_independent.json')
lateral = read('roof_water_wall30_lateral_280_30_60_20_independent.json')
assert current['courtWidthMM'] == 280 and current['courtWallMM'] == 30
assert current['receivingSpringKNPerMM'] == 20
unchanged = ['installedOuterHeadMassGroups', 'addedInnerPressure', 'loadBounds',
             'courtModules', 'courtSupportCassettes', 'independentWaterTributaries',
             'retainedNativeVerticalWindKN', 'addedExplicitFloorWindGrossKN']
for key in unchanged:
    assert current[key] == old[key], key
assert len(current['installedOuterHeadMassGroups']) == 134
assert len(previous_checkpoint['massDomain']['finite144ContainedAtSourcePoints']) == 144
assert len(current['supportReactionRanges']) == 22 and len(current['portalNormalTieRanges']) == 32
assert len(movement['queries']) == 920 and len(lateral['queries']) == 1112
for item in previous_checkpoint['nativeInputs']:
    assert sha(ROOT/item['path']) == item['sha256']


def extremes(rows, key):
    low = min(rows, key=lambda row: row[key][0])
    high = max(rows, key=lambda row: row[key][1])
    return {'range': [low[key][0], high[key][1]],
            'minimumQuery': low['label'], 'maximumQuery': high['label'],
            'minimumControl': low['control'][0], 'maximumControl': high['control'][1]}

inner = {}
for family in ('primary', 'lower'):
    rows = [row for row in movement['queries'] if row['label'].startswith('inner ') and f' {family} ' in row['label']]
    inner[family] = {
        'absoluteVerticalMM': extremes([row for row in rows if row['label'].endswith('absolute')], 'rangeMM'),
        'widthDistortionMM': extremes([row for row in rows if f' {family} width ' in row['label']], 'rangeMM'),
    }
heads = {side: extremes([row for row in movement['queries']
    if row['label'].startswith(side+' normal retained-arm corner')], 'rangeMM') for side in ('north', 'south')}
pair_rows = [row for row in lateral['queries'] if row.get('pairedGap')]
assert len(pair_rows) == 640
pair = {str(gap): extremes([row for row in pair_rows if row['pairedGap']['nominalEdgeGapMM'] == gap], 'range')
        for gap in (25., 50.)}

commands = []
flags = '--court-width=280 --court-wall-mm=30 --inner-dry-kg-per-m=60 --receiving-spring-kn-per-mm=20 --outer-head-dry-domain=independent'
for kind in ('trial', 'movement', 'lateral'):
    commands.append(f'python -S project/rof/studies/roof_water_wall30_{kind}.py {flags} --check')
commands += ['python -S project/rof/studies/roof_water_wall30_receiving.py --check',
             'python -S project/rof/studies/roof_water_wall30_checkpoint.py --check']

output = {
    'status': 'UNADMITTED 280x120x30 / 20 kN/mm COMPARISON; BOTH TIE SCREENS STILL FAIL',
    'geometry': {'courtWidthMM': 280, 'heightMM': 120, 'wallMM': 30,
                 'courtQMM': [3777.5, 4057.5], 'courtZMM': [6540, 6660],
                 'internalClearHeightMM': 60, 'nominal300HeelShoulderEachSideMM': 10,
                 'outerSectionUnchangedMM': [220, 120, 20],
                 'sectionAreaMM2': current['sections']['court']['A'],
                 'characteristicLineWeightKNPerM': current['sections']['court']['lineG'],
                 'extraCharacteristicCourtWeightOver25MMKN':
                     (current['sections']['court']['lineG']-old['sections']['court']['lineG'])*16.66,
                 'declaredCollectorStressBudgetMPa': 200/1.1,
                 'actual30To20SkinAnd16WebHeelTransitionQualified': False},
    'receivingSpring': {'KNPerMM': 20, 'status': 'Symmetric numerical hypothesis only; actual tension/compression/contact and series connection stiffness remain unqualified.'},
    'outerInteraction': current['worst']['outer']['interaction'],
    'courtInteraction': current['worst']['court']['interaction'],
    'maximumUpperTensionKN': current['worstUpperTensionKN'],
    'maximumUpperCompressionKN': current['worstUpperCompressionKN'],
    'existingM24ComparisonResistanceKN': current['existingM24ComparisonResistanceKN'],
    'maximumPortalNormalTieKN': current['maximumPortalNormalTieKN'],
    'screens': current['comparisonScreens'],
    'upperCompressionResistanceKN': None,
    'all22ReceivingRows': 'roof_water_wall30_receiving.json',
    'unchangedInputFieldsComparedTo25MM': unchanged,
    'finiteRenewalContainment': {
        'source': 'roof_water_current_checkpoint.json', 'finiteStates': 144,
        'independentInstalledMassIntervals': 134,
        'proof': 'All134 zero-mass endpoint force/moment/source/root identities exactly equal the previously verified25mm case; its explicit144 finite-choice decompositions therefore remain contained before solving the changed30mm structure.',
        'weatherRoofRetained': True, 'singlePhysicalOperationRestrictionRetained': True,
        'actualResidualCentroidAndNewHeadRouteQualified': False,
    },
    'windDomain': previous_checkpoint['windDomain'],
    'movementScope': previous_checkpoint['movementScope'],
    'innerMovementMM': inner, 'outerRetainedHeadCornerVerticalMM': heads,
    'pairedNativeAlongGapChangeMM': pair,
    'lowerHangerAbsoluteNormalMM': extremes([row for row in lateral['queries'] if ' lower hanger ' in row['label']], 'range'),
    'normalVirtualWorkError': lateral['normalVirtualWorkError'],
    'nativeInterfaceRecoveryError': lateral['nativeInterfaceRecoveryError'],
    'newInnerPlus10ZAndChangedApronGeometryIncluded': False,
    'limitations': [
        'This comparison uses frozen4eb physical geometry and pressure export; later+10Z/apron/contact proposals have not been replayed.',
        'Missing roof-lap/baffle pressure and absent local apron-stock force return remain open; the windDomain lists them explicitly.',
        'The complete head/leader source point is unchanged. A relocated inner head requires a new root/mass/wind contract.',
        'No 8 kN floor-tie, 3 kN roof-tie, M24 or collector limit is raised. Passing a subset of screens is not structural qualification.',
        'Collector heel/root introduction, real receiving assembly stiffness, corner attachment and downstream compression paths remain unresolved.',
    ],
    'fullNumericalReplayCommandsFromRepositoryRoot': commands,
    'sourceHashes': {str((HERE/name).relative_to(ROOT)): sha(HERE/name) for name in NAMES},
}
output['sourceHashes'][str(Path(__file__).relative_to(ROOT))] = sha(Path(__file__))
text = json.dumps(output, indent=2)+'\n'
target = Path(__file__).with_suffix('.json')
if args.check:
    assert target.read_text() == text, 'Regenerate the30mm checkpoint'
else:
    target.write_text(text)
print(json.dumps({key: output[key] for key in ('courtInteraction','maximumUpperTensionKN','maximumPortalNormalTieKN','screens')}, indent=2))
