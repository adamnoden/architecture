"""Private finite outer renewal checks; no ordinary renewal route is accepted.

Run with --repo pointing to the owning architecture checkout. This reads only
repository files and writes this script's adjacent receipt. The pressure trial
is an unadmitted sensitivity, not an adopted structural source.
"""
from pathlib import Path
import argparse
import hashlib
import importlib
import json
import math
import sys

HERE = Path(__file__).resolve().parent
parser = argparse.ArgumentParser()
parser.add_argument('--repo', type=Path, required=True)
parser.add_argument('--check', action='store_true')
args = parser.parse_args()
ROOT = args.repo.resolve()
sys.dont_write_bytecode = True
sys.path.insert(0, str(ROOT/'project/rof/studies'))
e = importlib.import_module('roof_water_edges')
h = importlib.import_module('roof_water_heads')
movement_path = ROOT/'project/rof/studies/roof_water_joined_pressure_movement_280_60.json'
movement = json.loads(movement_path.read_text())
queries = {r['label']: r for r in movement['queries']}
inventory_path = HERE/'outer-module-inventory.json'
inventory = json.loads(inventory_path.read_text())


def interval_sum(terms):
    return [sum(min(c*a, c*b) for c, (a, b) in terms),
            sum(max(c*a, c*b) for c, (a, b) in terms)]


def interval_intersection(rows):
    result = [max(r[0] for r in rows), min(r[1] for r in rows)]
    assert result[0] <= result[1]
    return result


head_bounds = []
for label, face in [('south normal', 0), ('north normal', 2)]:
    roll_label = label+' widest return R1260 minus lower back R125'
    roll = queries[roll_label]['rangeMM']
    options = []
    for k in [1, 2]:
        relative_label = label+f' head at R1130 minus primary front R520, root {k}'
        relative = queries[relative_label]
        point = relative['references'][1][1]
        u = point[0] if face == 0 else 12000-point[0]
        absolute_label = f'outer face{face} primary root u{u} R520.0 absolute'
        absolute = queries[absolute_label]['rangeMM']
        r1260 = interval_sum([(1, absolute), (1, relative['rangeMM']), (130/1135, roll)])
        r1000 = interval_sum([(1, absolute), (1, relative['rangeMM']), (-130/1135, roll)])
        base = f'outer face{face} primary root u{u}'
        root_relative_label = label+f' head root minus primary root {k}'
        root = interval_sum([(1, queries[base+' R170.0 absolute']['rangeMM']),
            (-502.5/350, queries[base+' cross-section R520 minus R170']['rangeMM']),
            (1, queries[root_relative_label]['rangeMM'])])
        options.append({'neighbourRootAlongMM': u, 'R1260AbsoluteBoundMM': r1260,
            'R1000AbsoluteBoundMM': r1000, 'rootAbsoluteBoundMM': root,
            'sourceLabels': [absolute_label, relative_label, roll_label,
                base+' R170.0 absolute', base+' cross-section R520 minus R170', root_relative_label]})
    envelope = {key: interval_intersection([row[key] for row in options]) for key in
        ['rootAbsoluteBoundMM', 'R1000AbsoluteBoundMM', 'R1260AbsoluteBoundMM']}
    peak = max(abs(x) for bound in envelope.values() for x in bound)
    head_bounds.append({'head': label, 'options': options, 'centrelineEnvelope': envelope,
        'peakAbsoluteCentrelineMM': peak, 'reserveWithin50MM': 50-peak,
        'scope': 'Exact rigid-arm linear identities, conservatively summed scalar intervals. '
            'Only the centreline is bounded. The along +/-125 mm fork/plate extrema require longitudinal rotation.'})

body_bounds = []
for name in ['primary', 'lower']:
    rows = [r for r in queries.values() if r['label'].startswith('outer') and name in r['label'] and 'absolute' in r['label']]
    body_bounds.append({'circuit': name, 'edgeQueryCount': len(rows),
        'rangeMM': [min(r['rangeMM'][0] for r in rows), max(r['rangeMM'][1] for r in rows)]})

arm_trials = []
for centre in [6240, 6200]:
    drop = 6600-centre
    wind_couple = h.leader_wind*1000*(7400-centre)
    moment = h.top_vertical_load*h.top_lever+wind_couple
    deflection = h.top_vertical_load*h.top_lever**3/(3*180000*h.top_arm['I'])
    deflection += wind_couple*h.top_lever**2/(2*180000*h.top_arm['I'])
    deflection += moment*drop*h.top_lever/(180000*h.top_arm['I'])
    deflection += h.top_vertical_load*drop/(180000*h.top_arm['area'])
    mass = h.top_arm['area']*.008*(h.top_lever+drop)/1000
    arm_trials.append({'centreZMM': centre, 'topZMM': centre+100, 'bottomZMM': centre-100,
        'armMassKG': mass, 'wholeHeadMassKG': sum(h.head_mass_schedule.values())-h.top_arm_mass+mass,
        'wholeLocalDeflectionMM': deflection+h.fork_deflection+h.plate_deflection,
        'lowerCarrierClearanceAfter50Native6Local10SettingMM': e.lower_min-27-(centre+100)-66,
        'tray6025RimClearanceAfterSame66MM': centre-100-6025-66,
        'status': 'SOURCE CONTROL' if centre == 6240 else 'UNSELECTED LOCAL CANDIDATE'})
assert arm_trials[0]['lowerCarrierClearanceAfter50Native6Local10SettingMM'] < 0
assert min(arm_trials[1]['lowerCarrierClearanceAfter50Native6Local10SettingMM'],
           arm_trials[1]['tray6025RimClearanceAfterSame66MM']) > 0
assert arm_trials[1]['wholeLocalDeflectionMM'] < 6 and arm_trials[1]['wholeHeadMassKG'] < 75

positions = [0., 12000., *range(0, 12001, 50)]
bed_samples = [e.primary['bed']]
for face, station in e.pstations.items():
    bed_samples.extend(e.p_bed(face, u) for u in positions+[station-.001, station+.001])
pan_z = 7200.
apron_crossings = [200+60*(7325-pan_z)/(7325-(bed+95)) for bed in bed_samples]
apron_lengths = [math.hypot(60, 7325-(bed+95)) for bed in bed_samples]
assert 170 < min(apron_crossings) < max(apron_crossings) < 625

installed_inventory = []
for name, perimeter, original in [('primary', e.p_perimeter, e.p_dry), ('lower', e.f_perimeter, e.f_dry)]:
    rows = [r for r in inventory['modules'] if r['circuit'] == name]
    moving = sum(r['movingDryMaterialKG']['total'] for r in rows)
    fixed = (e.p_brackets-64*e.moving_crossarm_kg*.4/e.p_perimeter+e.p_apron+e.f_apron+e.secondary_apron_ribs
             if name == 'primary' else e.f_brackets-64*e.moving_crossarm_kg*.6/e.f_perimeter)
    total = moving/perimeter+fixed
    installed_inventory.append({'circuit': name, 'originalScheduledKGPerM': original,
        'physicalMovingBodyInventoryKG': moving, 'retainedFixedScheduleKGPerM': fixed,
        'trialTotalKGPerM': total, 'remainingTo50KGPerM': 50-total,
        'leastExisting600BayClearanceAfter10EachMM': min(r['existing600AlongBayReserveAfter10EachMM'] for r in rows),
        'leastTrial1200BayClearanceAfter10EachMM': min(r['trial1200AlongBayReserveAfter10EachMM'] for r in rows),
        'qualification': 'No new corner reinforcement, temporary rain tools or extra thermal guides priced. '
            'This reconciles the enumerated metal only; it does not establish local frame or native load-resultant adequacy.'})
assert all(r['leastExisting600BayClearanceAfter10EachMM'] < 0 for r in installed_inventory)

source_paths = ['project/rof/studies/roof_water_edges.py', 'project/rof/studies/roof_water_heads.py',
    'project/rof/studies/roof_water_movement.json',
    'project/rof/studies/roof_water_joined_pressure_movement_280_60.json',
    'project/mat/studies/ring-roof-family.json', 'project/had/studies/water-replan.json',
    'project/had/studies/current-house-services.json', 'project/rwt/studies/selected-water-event.json',
    'project/rwt/studies/court-service-selection.json', 'project/rwt/studies/over-roof-site-envelope.json',
    'project/mat/studies/plant-threshold.json', 'project/str/studies/reconciled-house-interface.json']
result = {
    'status': 'UNSELECTED PRIVATE COMPARISON; NO COMPLETE ORDINARY RENEWAL ROUTE',
    'basis': {'developmentCommit': 'f49968e96ad7dceb35ea448d87d20c851d337b40',
        'sourceIdentityRule': 'The exact per-file hashes below govern reproduction; this is the reviewed development checkpoint.',
        'pressureTrialOnly': '280x20 collector and 40 kN/mm receiving spring; full added inner pressure and170/190 water.',
        'pressureQualification': movement['windQualification'],
        'pressureInnerDryKGPerM': movement['innerDryKgPerM'],
        'nativeFiniteRemovalChoices': movement['finiteRemovalChoices']},
    'centrelineMovementIdentity': 'w(R1260,head) = w(R520,neighbour) + '
        '[w(R1130,head)-w(R520,neighbour)] +130/1135*[w(R1260,head)-w(R125,head)]. '
        'Every bracket uses its exact existing source query. No single favourable load state is substituted.',
    'nativeCentrelineSensitivity': head_bounds, 'nativeBodyEdgeSensitivity': body_bounds,
    'retainedArmTrials': arm_trials,
    'wholeApronTransfer': {'sourceDrawnTopRadialZMM': [200, 7325],
        'sourceDrawnToeRadialAboveBedMM': [260, 95], 'foldHalfEnvelopeMM': 12.85,
        'drawnLineLengthRangeMM': [min(apron_lengths), max(apron_lengths)],
        'sourceUnbracedAndPricedLengthMM': 580,
        'missingCompleteUpperLapAndClipGeometry': True,
        'toeMaximumAfter400OutMM': 260+400+12.85,
        'toeBeyondIntactLowerR670MM': 260+400+12.85-670,
        'meaning': 'The entire folded part reaches beyond the lower collector before the proposed400 mm transfer finishes. '
            'A receiving catch must already exist. The drawn two-point line is shorter than the580 mm stock bound; '
            'unshown lap/clip stock may not be discarded from a collision check.'},
    'flatUpperPanCounterexample': {'proposedPanZMM': pan_z, 'proposedPanRadialMM': [170, 625],
        'existingApronCrossingRadialRangeMM': [min(apron_crossings), max(apron_crossings)],
        'rejected': True,
        'reason': 'A closed horizontal pickup at7200 physically crosses the retained primary apron. '
            'It cannot be introduced before first release without an authored dry slot or different assembly sequence.'},
    'fixedApronDropComparison': [{'dropMM': drop, 'nominalRearToToeClearanceMM': 95-(230-drop),
        'sourceAfter10OnlyMM': 95-(230-drop)-10,
        'afterHypothesised50Native6Local10SettingMM': 95-(230-drop)-66}
        for drop in [165, 161]],
    'lowTrayCoverageCounterexample': {'floorZMM': 5900, 'rimZMM': 6025,
        'outboardOnlyRadialMM': [625, 3250], 'secondaryApronToeRadialMM': 146,
        'lowerInnerEdgeRadialMM': 125,
        'missedSecondaryDripDistanceMM': 625-146,
        'trialExtendedBackRMM': 115, 'facadeFaceMaximumProjectionMM': 100,
        'trialBackToFacadeClearanceAfter10SettingMM': 115-100-10,
        'trialOverlapBehindLowerBackBeforeAnySplashMM': 125-115,
        'reason': 'The outboard tray catches transferred bodies but does not catch the retained secondary rain path. '
            'An extension to115 has only5 mm after setting beside the source facade projections and10 mm behind the lower back. '
            'Neither a rain-tight back wall nor horizontal wind/splash capture follows from the vertical arm clearance.'},
    'perBayInventoryReconciliation': installed_inventory,
    'physicalJointThermalInterface': {'trialFabricationGapMM': 10,
        'independentPrimaryBayFull80KExpansionMM': 793.125*17e-6*80,
        'independentLowerBayFull80KExpansionMM': 799.6875*17e-6*80,
        'sourceHeadEndMinimumTravelMM': 30, 'sourceOpposedLongArmLipGapMM': 60,
        'longArmThermalTrainOption': 'Soldered sacrificial per-bay cover strips may retain a continuous wet liner train. '
            'Then crown fixation, every carrier longitudinal slide/capture, the two head end joints and installation thermal datum '
            'must be authored. The10 mm fabrication seam is not itself an expansion joint.',
        'independentModuleOption': 'If each module is longitudinally fixed at its own root, every sealed seam needs a real compliant '
            'metal joint, its complete backing/folds and thermal-cycle check. The current90 mm stock allowance does not establish that detail.',
        'jointAccepted': False},
    'headSequenceInventory': {'fourLocatedLeaderAndGroundLanes': 4,
        'explicitNormalHeadSpoolCatchTransferExamples': len(h.renewal_geometry),
        'explicitReliefHeadTransferExamples': 0,
        'missing': 'The two relief heads at11750 need their actual removable body/spout, upper spool, first rest, '
            'retained pipe support and contained rain path before release. The four-head load bound does not define these parts.'},
    'remainingAuthoring': [
        'Contained roof and underlay interception must be operating before either apron weatherlap or first wet joint is released.',
        'Retained neighbouring open ends need continuous reception; do not invent transverse walls in a continuous gutter.',
        'Complete physical corner and head-straddling pan surfaces must reconcile their grades, stepped beds, rail ends and native root couples.',
        'One-root rails are cantilevers from their own crossarm after adjacent seams are released. The continuous-span source check is not their corner check.',
        'The1200 mm body bay is an unselected plan envelope; complete grips, first rest, worker, gate, site and ground-nest geometry still need joining.',
        'Use the full added-pressure movement family and full head/leader absence. The current280x20 spring40 comparison is not admitted.',
        'The reverse installation must restore every wet joint, apron lap, head connection and receiving path before temporary rain interception is removed.'
    ],
    'sourceHashes': {p: hashlib.sha256((ROOT/p).read_bytes()).hexdigest() for p in source_paths},
    'privateInputHashes': {inventory_path.name: hashlib.sha256(inventory_path.read_bytes()).hexdigest(),
        Path(__file__).name: hashlib.sha256(Path(__file__).read_bytes()).hexdigest()},
}


def rounded(value):
    if isinstance(value, dict): return {k: rounded(v) for k, v in value.items()}
    if isinstance(value, list): return [rounded(v) for v in value]
    return round(value, 9) if isinstance(value, float) else value


target = HERE/'outer-renewal-path-checks.json'
contents = json.dumps(rounded(result), indent=2)+'\n'
if args.check:
    assert target.read_text() == contents, 'Regenerate the private finite path comparison'
else:
    target.write_text(contents)
print(json.dumps({'status': result['status'],
    'headCentrelineAbsolutePeaksMM': {r['head']: r['peakAbsoluteCentrelineMM'] for r in head_bounds},
    'wholeArmAndRouteAccepted': False, 'receipt': str(target)}, indent=2))
