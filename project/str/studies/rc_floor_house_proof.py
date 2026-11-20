import copy
import hashlib
import json
from pathlib import Path
import sys

from distributed_floor_compatibility import _native_floor_wind
from joined_rc_floor_proof import numerical_case as joined_case
from joined_rc_floor_views import draw_joined_rc_floor
from rc_floor_house_loads import _family_wrench, _origin_wrench, build_rc_floor_house, load_rc_floor_house_source, rc_floor_house_diagnostics, reference_rc_floor_house_case, solve_rc_floor_house


D=Path(__file__).resolve().parent


def numerical_case(source,wind_index=31):
    case=reference_rc_floor_house_case(source)
    case['joinedCase']=joined_case(source['joined'])
    case['joinedCase']['floor']['boundaryCase']['windIndex']=wind_index
    case.update(coreAxialWidthMm=290,northUpstandWidthMm=200)
    case['boundary']['physicalGFactor']=.9
    return case


def proof(source):
    case=numerical_case(source);model=build_rc_floor_house(case,source)
    result=solve_rc_floor_house(model,source,'RC290-UPSTAND200-native31-G0.9')
    print('Actual native31 signedphysicalcuts and contact recovered',flush=True)
    axes=source['joined']['floor']['retained']['policy']['axes'];recipes=[]
    for index in range(96):
        wind=_native_floor_wind(source['joined']['floor'],index,axes)
        recipes.append({'windIndex':index,'programme':wind['programme'],'courtProjection':wind['courtProjection'],'sourceFloorWrenchKN_KNm':_origin_wrench(wind['rows'])})
    if any(recipes[i]['sourceFloorWrenchKN_KNm']!=recipes[i+48]['sourceFloorWrenchKN_KNm'] for i in range(48)):
        raise ValueError('Native courtprojection changes actualfloorforce; pairedreuse is invalid')
    operator_checks=[]
    for index in (3,32,33,79):
        changed=numerical_case(source,index);operator=build_rc_floor_house(changed,source)
        a=_family_wrench(operator,operator['families']['native-floor-reconciled']);b=_origin_wrench(operator['housePressure']['reconciledFloorRows'])
        residual=[x-y for x,y in zip(a,b)]
        if max(abs(value) for value in residual)>1e-6:raise ValueError('Actual half/signedpressure condensation loses sourcewrench')
        operator_checks.append({'windIndex':index,'programme':operator['housePressure']['nativeWind']['programme'],
            'floorWrenchResidualKN_KNm':residual,'removedGrossLowerPortalShares':operator['housePressure']['removedGrossLowerPortalShares'],
            'actualPortalWrenchKN_KNm':_origin_wrench(operator['housePressure']['actualPortalWindOrigins']),
            'floorLoadDigest':hashlib.sha256(json.dumps(operator['families']['native-floor-reconciled'],sort_keys=True,separators=(',',':')).encode()).hexdigest(),
            'scope':'Actual CST/Schur load-condensation check; no additional nonlinear52-head solve is claimed.'})
    drawing=draw_joined_rc_floor(model,result)
    return {'schema':'str-rc-floor-house-load-proof/1','sourceSHA256':source['identities'],
        'proofProducerSHA256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'authoredNumericalCase':case,
        'executedJoinedStructuralCaseCount':1,'sourceRecipeCount':96,'actualLoadCondensationChecks':operator_checks,
        'sourceRecipes':recipes,'result':result,'schedule':result['schedule'],
        'floor':{key:model['joinedFloor']['floor'][key] for key in ('triangleCount','membraneAreaM2','rigidModeResidualKN','modeReconstructionRelativeError','finiteBeamBoundaryReceivers')},
        'floorSvgSHA256':hashlib.sha256(drawing.encode()).hexdigest(),'diagnostics':rc_floor_house_diagnostics(),
        'unresolvedReceivingPortCount':28,'completeReceivingPaths':0,'candidateAccepted':False,'installedAcceptance':False,'roofAdoption':False,'completeHouseProof':False},drawing


if __name__=='__main__':
    if sys.argv[1:]!=['--write']:raise SystemExit('Use --write for actual source-loaded29method proof')
    source=load_rc_floor_house_source(D.parents[2]);result,drawing=proof(source)
    if source['identities']!=load_rc_floor_house_source(D.parents[2])['identities']:raise SystemExit('Native source drifted during calculation; staleproof notwritten')
    (D/'rc-floor-house-proof.json').write_text(json.dumps(result,indent=2,allow_nan=False)+'\n')
    (D/'rc-floor-house.svg').write_text(drawing)
    (D/'rc-floor-house-native31-actions.json').write_text(json.dumps({key:result['result'][key] for key in ('sourceSHA256','caseId','request','memberCuts','capCuts','portalNormalContactResults')},indent=2,allow_nan=False)+'\n')
    print('One actual52headcase;96source recipes and4load-condensation checks; no physicalstrength acceptance')
