"""Reproduce the compact retained-arm audit from the exact native row extract.

The input records their full source receipt hashes. This does not rerun or admit
the global pressure comparison; it verifies the twelve queried rigid-arm corners
and calculates their use in the independent local clearance comparison.
"""
from pathlib import Path
import argparse
import hashlib
import json

HERE=Path(__file__).resolve().parent
parser=argparse.ArgumentParser()
parser.add_argument('--check',action='store_true')
args=parser.parse_args()
inp=HERE/'native-arm-inputs.json'
data=json.loads(inp.read_text())
local=json.loads((HERE/'outer-renewal-path-checks.json').read_text())
arm=next(r for r in local['retainedArmTrials'] if r['centreZMM']==6200)
cases=[]
for case in data['cases']:
    rows=case['headCornerQueries']
    assert len(rows)==12
    heads=[]
    for head in ['south normal','north normal']:
        h=[r for r in rows if r['label'].startswith(head+' retained-arm corner ')]
        assert len(h)==6
        for radial in [-332.5,1000.0,1260.0]:
            for along in [-125.0,125.0]:
                assert sum(r['label']==f'{head} retained-arm corner R{radial} pOffset{along} absolute' for r in h)==1
        bounds=[min(r['rangeMM'][0] for r in h),max(r['rangeMM'][1] for r in h)]
        peak=max(abs(x) for x in bounds)
        heads.append({'head':head,'absoluteCornerRangeMM':bounds,'peakAbsoluteMM':peak,
            'reserveWithin50MM':50-peak,
            'lowerCarrierReserveAfterExactPeak6Local10SettingMM':arm['lowerCarrierClearanceAfter50Native6Local10SettingMM']+50-peak,
            'trayRimReserveAfterExactPeak6Local10SettingMM':arm['tray6025RimClearanceAfterSame66MM']+50-peak,
            'source12RowExtractVerified':True})
    cases.append({'receivingSpringKNPerMM':case['receivingSpringKNPerMM'],
        'sourceReceiptSHA256':case['sourceReceiptSHA256'],'heads':heads,
        'allHeadCornersWithin50MM':all(r['reserveWithin50MM']>0 for r in heads)})
assert all(r['allHeadCornersWithin50MM'] for r in cases)
result={'status':'UNSELECTED NATIVE SENSITIVITY AND LOCAL CLEARANCE COMPARISON',
    'cases':cases,'source6200LocalCandidate':arm,
    'fullRetainedEnvelope':{'radialMM':[-332.5,1260],'alongMM':[-125,125],
        'basis':'160-wide arm + two30-wide forks at+/-110 +240-wide split plate. High450-wide catch is removed first.'},
    'original6240ArmWith100LowerPanLift':{
        'lowestCarrierBeforeLiftZMM':6375.275005,'proposedFirstLiftMM':100,
        'nominalPostLiftToOriginal6340ArmTopMM':135.275005,
        'postLiftReserveAfter50Native6Arm10SettingMM':69.275005,
        'postLiftReserveAlsoCharging8PanAnd5FittingsMM':56.275005,
        'originalArmTo6025TrayAfter50Native6Local10SettingMM':49,
        'status':'POST-LIFT GEOMETRIC CANDIDATE ONLY',
        'firstReleaseGate':'The original40 mm horizontal fork release, weight handoff and retained secondary rails/clips must be joined. '
            'A later safe lift does not prove the first opening or earlier path. No new attachment or guided vertical release is inferred.'},
    'qualifications':[
        'Both280x120x25 global variants remain unadmitted. Their exported pressure still has named actual lap/baffle/contact joins pending.',
        'Weather roof and independent water remain available;134 installed outer/head dry-mass intervals conservatively contain the old finite144 source-point removals.',
        'The6200/drop400 arm is a local unselected change; original6240 remains the source control.',
        'Absolute50 assumes a transfer path controlled to the ground datum. A guide frozen at its first captured deflected height needs the whole subsequent movement excursion or a real normalization step.',
        'The6 mm arm allowance does not establish stiffness/capacity of a new moving pan rig. Complete grip, hardware, pan and rig movements still need charging.',
        'Vertical clearance does not establish horizontal sway, weather capture, first release, complete module departure or reverse installation.'
    ],
    'inputHashes':{inp.name:hashlib.sha256(inp.read_bytes()).hexdigest(),
        'outer-renewal-path-checks.json':hashlib.sha256((HERE/'outer-renewal-path-checks.json').read_bytes()).hexdigest(),
        Path(__file__).name:hashlib.sha256(Path(__file__).read_bytes()).hexdigest()},
    'completeRenewalAccepted':False}

def rounded(x):
    if isinstance(x,dict):return {k:rounded(v) for k,v in x.items()}
    if isinstance(x,list):return [rounded(v) for v in x]
    return round(x,9) if isinstance(x,float) else x

contents=json.dumps(rounded(result),indent=2)+'\n'
target=HERE/'native-arm-checks.json'
if args.check:assert target.read_text()==contents,'Rebuild native-arm compact audit'
else:target.write_text(contents)
print(json.dumps({'status':result['status'],'cases':cases,'completeRenewalAccepted':False},indent=2))
