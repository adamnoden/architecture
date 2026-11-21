"""Actual source normal-route and own-gravity before/after in one finite model."""
import hashlib
import json
from pathlib import Path
import sys
from court_corner_closure import MODE, apply_court_corner_closure
from foundation_solid_weight_proof import head_delta, summary
from vertical_rc_floor import build_vertical_rc_floor, load_vertical_rc_floor_source, solve_vertical_rc_floor
from vertical_rc_floor_proof import numerical_case

D=Path(__file__).resolve().parent

if __name__=='__main__':
    if sys.argv[1:]!=['--write']:raise SystemExit('Use --write to execute actual paired native normal-route proof')
    source=load_vertical_rc_floor_source(D.parents[2]);case=numerical_case(source);model=build_vertical_rc_floor(case,source)
    null=apply_court_corner_closure(model,source,None,{'unitWeightKNPerM3':25,'gravityFactor':1})
    before=summary(solve_vertical_rc_floor(model,source,'COURT-CORNER/source-open-control'))
    closure=apply_court_corner_closure(model,source,{'mode':MODE},{'unitWeightKNPerM3':25,'gravityFactor':1})
    after=summary(solve_vertical_rc_floor(model,source,'COURT-CORNER/explicit-formed-node'))
    if abs(before['missingGroundContactAreaMm2']-10506.25)>1e-7 or after['missingGroundContactAreaMm2']!=0:raise ValueError('Actual source normal contact gap not explicitly closed')
    delta=head_delta(before,after)
    if delta<1e-5:raise ValueError('Actual receiving-path/body edit did not propagate into compatible heads')
    result={'schema':'str-court-sw-closure-proof/1','sourceSHA256':{**source['identities'],**closure['sourceSHA256']},
        'proofProducerSHA256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'authoredNativeCase':case,
        'open':before,'closed':after,'closure':closure,'maximumHeadComponentDeltaKN_KNm':delta,
        'candidateAccepted':False,'localJointRigidityAccepted':False,'jointReinforcementAccepted':False,'completeHouseProof':False}
    (D/'court-corner-closure-proof.json').write_text(json.dumps(result,indent=2,allow_nan=False)+'\n')
    print('Actual courtSW node proof: gap',before['missingGroundContactAreaMm2'],'->',after['missingGroundContactAreaMm2'],'headDelta',delta,flush=True)
