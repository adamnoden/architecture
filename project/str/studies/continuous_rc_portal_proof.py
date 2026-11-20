import copy
import hashlib
import json
from pathlib import Path
import sys

from continuous_rc_portal import build_continuous_rc_portal, compile_continuous_rc_portal, load_continuous_rc_source, reference_continuous_rc_case, solve_continuous_rc_case


D=Path(__file__).resolve().parent


def numerical_case(source):
    case=reference_continuous_rc_case(source)
    material={'mode':'authored-linear-comparison','elasticModulusMPa':33000,'poissonRatio':.2,'flexuralFactor':.25,'torsionFactor':.25,'shearAreaFactor':.5}
    case.update(gridLaw=copy.deepcopy(material),frameLaw=copy.deepcopy(material),
        dpcLaw={'mode':'authored-bilateral-elastic-comparison','normalStiffnessKNPerMm3':.5,'shearStiffnessKNPerMm3':.05},
        dpcIntervalZMm=[-50,-30],coverMm=40)
    return case


def compact_case(result):
    screens=result['memberNecessaryScreens']
    flex=[row for row in screens if row['linearUniaxialScreenRatio'] is not None]
    result={key:value for key,value in result.items() if key!='memberNecessaryScreens'}
    result['maximumUniaxialLinearScreen']=max(flex,key=lambda row:row['linearUniaxialScreenRatio'])
    result['maximumShearScreenKN']=max(screens,key=lambda row:row['shearKN'])
    result['maximumTorsionScreenKNm']=max(screens,key=lambda row:row['torsionKNm'])
    return result


def proof(source):
    case=numerical_case(source);result=compile_continuous_rc_portal(case,source)
    changed_case=copy.deepcopy(case);changed_case['frameLaw']['flexuralFactor']=.125
    changed_model=build_continuous_rc_portal(changed_case,source)
    changed=solve_continuous_rc_case(changed_model,source,'half-frame-EI-positive-pressure',{'pressure-positive':1.})
    old=next(row for row in result['cases'] if row['name']=='positive-solid-face-pressure-no-favourable-G')
    refined_case=copy.deepcopy(case);refined_case['archSegments']=48
    refined_model=build_continuous_rc_portal(refined_case,source)
    refined=solve_continuous_rc_case(refined_model,source,'arch48-positive-pressure',{'pressure-positive':1.})
    inventories={}
    for row in result['withheldNativeActions']:
        key=row['category']+'/'+row['programme']+'/'+row['receivingKind']
        target=inventories.setdefault(key,{'rows':0,'signedValueKN':0.})
        target['rows']+=1;target['signedValueKN']+=row['valueKN']
    original_model=build_continuous_rc_portal(case,source)
    grid_names={name for name,a,b,matrix in original_model['model'].members if name.startswith('GRID/')}
    original_grid=[member for member in original_model['model'].members if member[0] in grid_names]
    changed_grid=[member for member in changed_model['model'].members if member[0] in grid_names]
    return {'schema':'str-continuous-rc-portal-proof/1','sourceSHA256':source['identities'],
        'proofProducerSHA256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'authoredNumericalCase':case,
        'status':result['status'],'nodeCount':result['nodeCount'],'memberCount':result['memberCount'],
        'schedule':result['schedule'],'cases':[compact_case(row) for row in result['cases']],
        'admittedNativeActions':result['admittedNativeActions'],'withheldNativeActionInventory':inventories,
        'withheldInventoryDigest':hashlib.sha256(json.dumps(result['withheldNativeActions'],sort_keys=True,separators=(',',':')).encode()).hexdigest(),
        'perturbation':{'frameFlexuralFactor':[.25,.125],
            'all52HeadMaximumDeltaKN_KNm':max(abs(a-b) for left,right in zip(old['heads'],changed['heads']) for a,b in zip(left['reactionKN_KNm'],right['reactionKN_KNm'])),
            'actualFloorPortMaximumDeltaMmMrad':max(abs(a-b) for left,right in zip(old['portMovementsMmMrad'],changed['portMovementsMmMrad']) for a,b in zip(left['value'],right['value'])),
            'actualGridMembersUnchanged':original_grid==changed_grid,'physicalMassScheduleUnchanged':result['schedule']['physicalGKN']==sum(-v[2] for v in changed_model['families']['physical-G'].values()),
            'changedPressureCase':compact_case(changed)},
        'archRefinement':{'segments':[24,48],
            'all52HeadMaximumDeltaKN_KNm':max(abs(a-b) for left,right in zip(old['heads'],refined['heads']) for a,b in zip(left['reactionKN_KNm'],right['reactionKN_KNm'])),
            'actualFloorPortMaximumDeltaMmMrad':max(abs(a-b) for left,right in zip(old['portMovementsMmMrad'],refined['portMovementsMmMrad']) for a,b in zip(left['value'],right['value'])),
            'refinedPressureCase':compact_case(refined)},
        'unresolvedReceivingPortCount':result['unresolvedReceivingPortCount'],'completeReceivingPaths':0,
        'sectionSvgSHA256':hashlib.sha256(result['drawings']['section.svg'].encode()).hexdigest(),
        'diagnostics':result['diagnostics'],'candidateAccepted':False,'roofAdoption':False,'installedAcceptance':False,'completeHouseProof':False},result['drawings']['section.svg']


if __name__=='__main__':
    source=load_continuous_rc_source(D.parents[2]);summary,svg=proof(source)
    text=json.dumps(summary,indent=2,allow_nan=False)+'\n'
    path=D/'continuous-rc-portal-proof.json';drawing=D/'continuous-rc-portal.svg'
    if sys.argv[1:]==['--write']:path.write_text(text);drawing.write_text(svg)
    elif sys.argv[1:]==['--check']:
        if path.read_text()!=text or drawing.read_text()!=svg:raise SystemExit('Stale continuous RC portal proof/drawing')
    else:raise SystemExit('Use --write or --check')
    print('Seven signed/scoped cases, all52heads, EIperturbation and arch refinement; rejected free-floor DPC domain, no house adoption')
