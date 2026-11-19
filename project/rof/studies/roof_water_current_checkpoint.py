"""Reproduce the source-bound 25 mm collector / receiving-stiffness checkpoint.

This checks stored identities, parameter-seam parity and finite-state containment.
It does not replace the separately listed full native numerical replay commands.
All comparisons remain unadmitted; known omitted physical pressure stays explicit.
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

NATIVE_INPUTS = [{'path': 'project/str/studies/structural-linear.py', 'sha256': '96e27fef3c808aa66822d0941a23fc551ea0139ee34a81960a6bc80441863d1f'}, {'path': 'project/str/studies/current-house-roof-bracing.py', 'sha256': 'df77f0ce0f45f0d47049b4eb2eeda80fa7dca9306cce94270290778c2d154db1'}, {'path': 'project/str/studies/current-house-membrane.py', 'sha256': '1602b0dec2cd69fe0b142a64052ff76f57cf5f045ea6d8924efa51c27d3c1a5e'}, {'path': 'project/str/studies/current-house-ring-return.py', 'sha256': 'e0e81c445ae210fc43f3335f1a6d8aac6faa7026af755fa4f1282eceeaa39cb6'}, {'path': 'project/str/studies/current-house-welded-network.json', 'sha256': '57b1428c1da1675e5db0a164bfa9a1b38b43a9bab91e9282287a83855106ce0b'}, {'path': 'project/str/studies/current-house-welded-heel.json', 'sha256': '8fcf08da15083f1f28ed1f7696621efa87c8db4e2197bc5274834c6539b6676e'}, {'path': 'project/str/studies/current-house-ring-space.json', 'sha256': '28dd034381847b786a31a4f38ffe95d83b948f08bda5f9fe8a6337118584a574'}, {'path': 'project/str/studies/reconciled-corner-portals.py', 'sha256': 'a0c158fbff68bc250e6ab64ab6251cc396abc7efb6ef3f398325629e678b92bd'}, {'path': 'project/str/studies/reconciled-corner-portals.json', 'sha256': 'd0fa19a7f772094610bdc67adadfcdb352923c825869e617b66a9f55a4d0d848'}, {'path': 'project/str/studies/arch-space-kernel.py', 'sha256': 'ed07cf97bfa1d8359a97486a679d3220bbd81c14cccfabc8eed9a01717bd3a24'}, {'path': 'project/str/studies/reconciled-slate-roof.py', 'sha256': '7f42a9c530092e077e5052f5e1f0c1872186790726cda31bb0a800902e031643'}, {'path': 'project/str/studies/house-corner-rewind.json', 'sha256': '0a927d781097f01693195bae56712204abd8d5c6d7335a56038d3ea3d26007a1'}, {'path': 'project/str/studies/current-house-window-receivers.json', 'sha256': '7968c876c4926fe5c266e4486aac04afd063ee55993bd95c2dfdff9522162294'}, {'path': 'project/str/studies/current-house-guard-bracket.json', 'sha256': '8ced0fe445a04f7133cbe737c47ed3f34046f6994f3b33c257b93677b483dd8c'}, {'path': 'project/str/studies/current-house-joined-foundation.json', 'sha256': '1b21b4215bc1d5b164f7d50c705617a2014d91e6fe00e0cc4f6b58a37586a648'}, {'path': 'project/str/studies/open-loggia-support.json', 'sha256': 'b5f08104c0da327613b84e055420d58f7709c354facd205634bcfd69a05e09b5'}, {'path': 'project/str/studies/current-house-arch-jambs.py', 'sha256': '108e5bf4f246aa1629ffbb3f26b12fbf6a4a1e2543b4b2bda7c76bef2d149426'}, {'path': 'project/str/studies/current-house-arch-jambs.json', 'sha256': '5398e4b04c1af76cf7fd8beab4d15950983b446487f310a5e6879b69ae1f1f2a'}, {'path': 'project/str/studies/current-house-head-actions.py', 'sha256': 'ca6b7f7f97aab3a7bbba605d2b0d2f2bc32c83ddb4e36f4c4eb2c9c604e1eb52'}, {'path': 'project/str/studies/current-house-head-actions.json', 'sha256': '43d040f17f42663cf0afdca2a026fa6fd9605fa7876b149dbcfb02c7b30384b6'}, {'path': 'project/str/studies/current-house-ground-ties.json', 'sha256': '9374b5566bd3c0a034b872618030ee6de71e718fb035771530ecf853a7590bb6'}, {'path': 'project/str/studies/current-house-grid.json', 'sha256': 'c191ab9814463f92962213e1938f441aef3108cfaca8a463be7081477c538294'}, {'path': 'project/str/studies/current-house-roof-network.json', 'sha256': '557de43293e636fbe7e84e007d899d7fbcd4ca29d4af4e1eab0866501c1103a7'}, {'path': 'project/str/studies/physical-slab-join.json', 'sha256': '9740fa55322013fd642bf33d09fbedcad447e4dd9c3edd390488bf6e41f2f45c'}, {'path': 'project/str/studies/current-house-lateral.json', 'sha256': '7ba767e896aaf97952cd36af9c4ff7b330bbda1412d4eb51ae84da7d0e468574'}, {'path': 'project/str/studies/current-house-roof-connection.json', 'sha256': '9de2bb56a68d3a234cdf4fb8cdc657434340329bbfb93e4febeef464ac0ddfff'}, {'path': 'project/str/studies/reconciled-house-interface.json', 'sha256': 'ae17f6de977de58ae54f25edfc67c48c36f348cffc288e839f25a8b4143c16cf'}, {'path': 'project/str/studies/current-house-floor-closure.json', 'sha256': '5f57557852c07f43bcf56253a3b50506a730631a8e3019359a9131677bb3bb09'}, {'path': 'project/had/studies/water-replan.json', 'sha256': '735bdb0475c25ff2b83426152b5545d583b8d175fc4549f4c6a0ac6055da54bc'}, {'path': 'project/oas/studies/north-export-occurrence.json', 'sha256': '0dc62373393811e3103800b9d8e3ed8bc0b2beb278503816695370122c434eb9'}, {'path': 'project/mat/studies/whole-envelope.json', 'sha256': 'a7d959b109a55cbf7bd8538894bcbc942ce9de84b2b40259530f6794f6665e15'}, {'path': 'project/rof/studies/roof_water_structure.py', 'sha256': 'b70d9141fc8394ca80e911ba3f2fa001ddc58d05a2943150f208629dcf36e9fa'}, {'path': 'project/rof/studies/roof_water_receiving_baseline.py', 'sha256': '5ebdafb4861f10cc099986aa2e0af6cbae1e7fc9768fef366f02207b8fec54d9'}, {'path': 'project/rof/studies/roof_water_receiving_baseline.json', 'sha256': '8d9c3200f9cea459454884b5d569235286f2522cc7766eb999934f0001334c0d'}]

FILES = [
    'roof_water_current_trial.py',
    'roof_water_current_trial_280_25_60_40_fixed.json',
    'roof_water_current_trial_280_25_60_40_independent.json',
    'roof_water_current_trial_280_25_60_20_independent.json',
    'roof_water_current_movement.py',
    'roof_water_current_movement_280_25_60_40_independent.json',
    'roof_water_current_movement_280_25_60_20_independent.json',
    'roof_water_current_lateral.py',
    'roof_water_current_lateral_280_25_60_40_independent.json',
    'roof_water_current_lateral_280_25_60_20_independent.json',
    'roof_water_current_receiving.py', 'roof_water_current_receiving.json',
    'roof_water_thick_pressure_trial.py', 'roof_water_thick_pressure_trial_280_25_60.json',
    'roof_water_thick_pressure_maintenance.py', 'roof_water_thick_pressure_maintenance_280_25_60_finite.json',
    'stiffness_inputs/roof.py', 'stiffness_inputs/ring.py',
    'stiffness_inputs/slate.py', 'stiffness_inputs/portals.py', 'stiffness_inputs/manifest.json',
]

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def read(name):
    return json.loads((HERE/name).read_text())

for row in NATIVE_INPUTS:
    assert sha(ROOT/row['path']) == row['sha256'], row['path']
for name in FILES:
    if not name.endswith('.json'):
        continue
    data = read(name)
    for source, digest in data.get('sourceHashes', {}).items():
        assert sha(ROOT/source) == digest, (name, source)

fixed = read('roof_water_current_trial_280_25_60_40_fixed.json')
previous = read('roof_water_thick_pressure_trial_280_25_60.json')
parity_fields = ['supportReactionRanges', 'portalNormalTieRanges', 'cases', 'worst',
                'nativeEndParity', 'portalLocalFlexibilityParity',
                'maximumSixComponentBalanceError', 'independentWaterSuperpositionError',
                'maximumPortalNormalTieKN', 'worstUpperTensionKN', 'worstUpperCompressionKN']
for key in parity_fields:
    assert fixed[key] == previous[key], key
finite = read('roof_water_thick_pressure_maintenance_280_25_60_finite.json')
assert finite['finiteAlternativeCount'] == 144
choices = finite['dryRemovalGroups'][0]['choices']
assert len(choices) == 144
case40 = read('roof_water_current_trial_280_25_60_40_independent.json')
case20 = read('roof_water_current_trial_280_25_60_20_independent.json')
assert case40['installedOuterHeadMassGroups'] == case20['installedOuterHeadMassGroups']

identity_fields = ['tag', 'ring', 'face', 'radial', 'station', 'rootStation', 'source', 'root']
force_fields = ['downN', 'FxN', 'FyN', 'MxGradientNmm', 'MyGradientNmm', 'yawNmm']
def identity(row):
    return json.dumps([row[k] for k in identity_fields], separators=(',', ':'))

groups = case40['installedOuterHeadMassGroups']
assert len(groups) == 134
by_point = {identity(row['zeroMassPerturbation']): row for row in groups}
assert len(by_point) == 134
containment = []
for choice in choices:
    fractions = {}
    for load in choice['loads']:
        group = by_point[identity(load)]
        endpoint = group['zeroMassPerturbation']
        fraction = load['downN']/endpoint['downN']
        assert 0 <= fraction <= 1
        for field in force_fields:
            # Stored inputs are rounded to nine decimals; scaling a rounded force also scales its moment lever.
            tolerance = 2e-9+2e-12*max(abs(load[field]), abs(fraction*endpoint[field]))
            assert abs(load[field]-fraction*endpoint[field]) <= tolerance, (choice['id'], field)
        fractions[group['id']] = fractions.get(group['id'], 0.)+fraction
    assert max(fractions.values()) <= 1
    containment.append({'finiteChoice': choice['id'], 'label': choice['label'],
                        'removedFractionsOfIndependentMassGroups': fractions})


def extremes(rows, key):
    assert rows
    a = min(rows, key=lambda row: row[key][0])
    b = max(rows, key=lambda row: row[key][1])
    return {'range': [a[key][0], b[key][1]],
            'minimumQuery': a['label'], 'maximumQuery': b['label'],
            'minimumControl': a['control'][0], 'maximumControl': b['control'][1]}

summaries = {}
for stiffness, data in [(40, case40), (20, case20)]:
    suffix = f'280_25_60_{stiffness}_independent'
    movement = read(f'roof_water_current_movement_{suffix}.json')
    lateral = read(f'roof_water_current_lateral_{suffix}.json')
    assert len(movement['queries']) == 920 and len(lateral['queries']) == 1112
    assert len(data['supportReactionRanges']) == 22 and len(data['portalNormalTieRanges']) == 32
    assert data['weatherRoofRetainedForIndependentMassDomain']
    widths, absolutes = {}, {}
    for family in ('primary', 'lower'):
        widths[family] = extremes([row for row in movement['queries']
            if row['label'].startswith('inner ') and f' {family} width ' in row['label']], 'rangeMM')
        absolutes[family] = extremes([row for row in movement['queries']
            if row['label'].startswith('inner ') and f' {family} ' in row['label']
            and row['label'].endswith('absolute')], 'rangeMM')
    heads = {}
    for side in ('south', 'north'):
        rows = [row for row in movement['queries'] if row['label'].startswith(side+' normal retained-arm corner')]
        assert len(rows) == 6
        heads[side] = {'full': extremes(rows, 'rangeMM'),
                      'waterZero': {'range': [min(row['dryDiversionRangeMM'][0] for row in rows),
                                             max(row['dryDiversionRangeMM'][1] for row in rows)]},
                      'allSixRows': rows}
    pair_rows = [row for row in lateral['queries'] if row.get('pairedGap')]
    assert len(pair_rows) == 640
    pair = {str(gap): extremes([row for row in pair_rows
        if row['pairedGap']['nominalEdgeGapMM'] == gap], 'range') for gap in (25., 50.)}
    summaries[str(stiffness)] = {
        'source': f'roof_water_current_trial_{suffix}.json',
        'outerInteraction': data['worst']['outer']['interaction'],
        'courtInteraction': data['worst']['court']['interaction'],
        'maximumTensionKN': data['worstUpperTensionKN'],
        'maximumCompressionKN': data['worstUpperCompressionKN'],
        'originalM24ResistanceKN': data['existingM24ComparisonResistanceKN'],
        'maximumPortalNormalTieKN': data['maximumPortalNormalTieKN'],
        'screens': data['comparisonScreens'],
        'innerWidthMM': widths, 'innerAbsoluteVerticalMM': absolutes,
        'retainedOuterHeadCornersMM': heads,
        'pairedNativeAlongGapChangeMM': pair,
        'normalVirtualWorkError': lateral['normalVirtualWorkError'],
        'nativeInterfaceRecoveryError': lateral['nativeInterfaceRecoveryError'],
    }

commands = []
for stiffness in (40, 20):
    flags = ('--court-width=280 --court-wall-mm=25 --inner-dry-kg-per-m=60 '
             f'--receiving-spring-kn-per-mm={stiffness} --outer-head-dry-domain=independent')
    for source in ('trial', 'movement', 'lateral'):
        commands.append(f'python -S project/rof/studies/roof_water_current_{source}.py {flags} --check')
commands += ['python -S project/rof/studies/roof_water_current_receiving.py --check',
             'python -S project/rof/studies/roof_water_current_checkpoint.py --check']

output = {
    'status': 'UNADMITTED 280x120x25 FROZEN-EXPORT / INSTALLED-MASS / RECEIVING-STIFFNESS COMPARISONS',
    'cases': summaries,
    'physicalGeometry': {'courtBoundsQMM': [3777.5, 4057.5], 'courtZMM': [6540, 6660],
                         'courtWallMM': 25, 'courtInternalClearHeightMM': 70,
                         'nominal300HeelShoulderEachSideMM': 10,
                         'outerSectionUnchangedMM': [220, 120, 20],
                         'courtAndHeelDeclaredStressBudgetMPa': 200/1.1,
                         'actual25To20SkinAnd16WebTransitionQualified': False},
    'receivingStiffnessQualification': '20 and40kN/mm are symmetric numerical hypotheses, not admitted actual tension/compression/contact chains or a proved intermediate-stiffness envelope.',
    'windDomain': {'localInputSourceSHA256': '4eb505e4349b1af1eaa98c96b0aa7174a8b6e3c4210628a969cc10c8252e7eba',
                   'retainedNativeVerticalProjectionKN': case40['retainedNativeVerticalWindKN'],
                   'addedExplicitFloorGrossKN': case40['addedExplicitFloorWindGrossKN'],
                   'addedFloorSignGroups': 24,
                   'areaCancellationCredited': False,
                   'knownMissingPhysicalRows': [
                       'Primary120mm roof lap aboveZ7290.188718 to7340.902909; no shielding/load route earned.',
                       'Secondary baffle aboveZ7107.33 to7145; no shielding/load route earned.',
                   ],
                   'missingLocalReturn': 'Exported apron-rib/standoff pressure is included globally but has not yet been returned through the local main-frame/contact model.'},
    'massDomain': {'outerHeadIndependentIntervals': 134, 'eachInterval': '0..source cap',
                   'wholeWeatherRoofRetained': True,
                   'finite144ContainedAtSourcePoints': containment,
                   'roundedReceiptComparisonTolerance': {'absolute': 2e-9, 'relative': 2e-12},
                   'notPhysicalPermission': 'Only one local operation at a time. Broad installed-mass uncertainty authorises no simultaneous physical removals.',
                   'remainingPhysicalQualification': 'Actual residual-piece centroids/root allocation, new head topology, added joining stock and temporary equipment must separately fit the declared contract.'},
    'parameterSeamParity40Fixed': {'previousSource': 'roof_water_thick_pressure_trial_280_25_60.json',
                                  'exactlyEqualNumericalFields': parity_fields,
                                  'all22ReceiverAnd32TieRowsEqual': True},
    'movementScope': {'verticalQueries': 920, 'lateralQueries': 1112,
                      'newOuterRetainedHeadCorners': 12, 'newOuterRadialMM': [-332.5, 1000, 1260],
                      'newOuterAlongOffsetsMM': [-125, 125], 'nativeRootZMM': 6600,
                      'localFrameAxis6200IsSeparate': True,
                      'datum': 'Absolute native fixed-base datum; facade co-motion is not credited.'},
    'upperCompressionResistanceKN': None,
    'all22Rows': 'roof_water_current_receiving.json',
    'unchangedControls': ['Original220/240/260 source-faithful recovery, old134-removal rejection and 280/20,300/20 frozen-pressure failures remain unchanged.',
                          'No M24,8kN floor-tie,3kN roof-tie,collector or receiving resistance limit is raised.'],
    'fullNumericalReplayCommandsFromRepositoryRoot': commands,
    'nativeInputs': NATIVE_INPUTS,
    'sourceHashes': {str((HERE/name).relative_to(ROOT)): sha(HERE/name) for name in FILES},
}
output['sourceHashes'][str(Path(__file__).relative_to(ROOT))] = sha(Path(__file__))
text = json.dumps(output, indent=2)+'\n'
target = Path(__file__).with_suffix('.json')
if args.check:
    assert target.read_text() == text, 'Regenerate the current checkpoint'
else:
    target.write_text(text)
print(json.dumps({'finiteStatesContained': len(containment), 'nativeInputs': len(NATIVE_INPUTS),
                  'cases': {key: {k: value[k] for k in ('courtInteraction', 'maximumTensionKN', 'maximumPortalNormalTieKN', 'screens')} for key, value in summaries.items()}}, indent=2))
