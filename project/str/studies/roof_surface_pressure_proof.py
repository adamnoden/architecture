"""Execute signed roof pressures through the SAME actual A/RC200/52-head model."""
import copy
import hashlib
import json
from pathlib import Path
import sys
import time

from masonry_frame_a import load_masonry_frame_a_source,run_masonry_frame_a
from masonry_frame_a_proof import numerical_case,summarize,_audit_head_wrench
from roof_floor_compatibility import load_roof_only_source,build_roof_only_operator
from roof_surface_pressure import reference_roof_surface_pressure_settings,roof_surface_rows

ROOT=Path(__file__).resolve().parents[3]


def proof(output):
    source=load_masonry_frame_a_source(ROOT);base=numerical_case(source)
    operator=build_roof_only_operator(load_roof_only_source(ROOT))
    settings=reference_roof_surface_pressure_settings(operator)
    controls=[('default-null',copy.deepcopy(base))]
    suction=copy.deepcopy(base);suction['roofCoupling']['roofSurfacePressure']=copy.deepcopy(settings)
    suction['roofCoupling']['roofSurfacePressure']['uniformKPa']=-2.25
    controls.append(('uniform-suction',suction))
    half=copy.deepcopy(suction)
    for row in roof_surface_rows(operator):half['roofCoupling']['roofSurfacePressure']['rowMultipliers'][row['id']]=float(row['pointXYZMm'][0]<6000)
    half['verticalCase']['monolithicCase']['houseCase']['joinedCase']['floor']['boundaryCase']['windIndex']=79
    controls.append(('half-roof-suction-court-W79',half))
    positive=copy.deepcopy(base);positive['roofCoupling']['roofSurfacePressure']=copy.deepcopy(settings)
    positive['roofCoupling']['roofSurfacePressure']['uniformKPa']=1.5
    controls.append(('positive-PLAN-pressure',positive))
    adverse=copy.deepcopy(suction);adverse['verticalCase']['monolithicCase']['houseCase']['boundary']['physicalGFactor']=0.
    controls.append(('suction-zero-physical-G',adverse))
    result={'schema':'str-roof-surface-pressure-proof/1','sourceSHA256':source['identities'],
        'methodSHA256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
        'scope':'Executed mechanical load controls, independently authored from facade wind. No site wind/snow, weather adoption or installed resistance qualification.',
        'cases':[],'candidateAccepted':False,'completeHouseProof':False}
    for name,case in controls:
        start=time.monotonic();print('START '+name,flush=True)
        solved=run_masonry_frame_a(case,source,'roof-surface-'+name)
        summary=summarize(solved);_audit_head_wrench(summary)
        summary['controlName']=name;result['cases'].append(summary)
        output.write_text(json.dumps(result,indent=2,sort_keys=True,allow_nan=False)+'\n')
        svg=solved['drawings']['masonry-frame-a-roof.svg']
        output.with_name(output.stem+'-'+name+'.svg').write_text(svg)
        print(json.dumps({'case':name,'seconds':time.monotonic()-start,
            'minimumHeadKN':summary['minimumHeadVerticalKN'],
            'maxRoofMm':summary['roofCoupling']['maximumRingTranslationMm'],
            'surfaceKN':None if summary['roofCoupling']['roofSurfacePressure'] is None else summary['roofCoupling']['roofSurfacePressure']['verticalDownKN'],
            'equilibrium':summary['equilibriumResidualKN_KNm'],
            'roofWorkResidual':summary['roofCoupling']['roofPhysicalWorkRelativeResidual']}),flush=True)
    if len(result['cases'])!=5:raise ValueError('Missing actual joined pressure controls')
    baseline=result['cases'][0];comparisons=[]
    for case in (result['cases'][1],result['cases'][3]):
        if case['mass']!=baseline['mass']:raise ValueError('Signed surface pressure changed physical mass')
        before={r['id']:r['reactionKN_KNm'] for r in baseline['headWrenches']}
        delta=max(abs(x-y) for row in case['headWrenches'] for x,y in zip(before[row['id']],row['reactionKN_KNm']))
        if delta<1e-6:raise ValueError('Actual52head response did not consume changed roof pressure')
        pressure=case['roofCoupling']['roofSurfacePressure']
        difference=[a-b-c for a,b,c in zip(case['externalWrenchKN_KNm'],baseline['externalWrenchKN_KNm'],pressure['pressureWrenchKN_KNm'])]
        if max(map(abs,difference))>1e-6:raise ValueError('Actual joined external load change does not equal the separate physical roof-pressure wrench')
        if len(pressure['actualLocalActions'])!=24:raise ValueError('Missing combined-load primary cuts')
        comparisons.append({'controlName':case['controlName'],'maximum52HeadComponentChangeKN_KNm':delta,
            'physicalGUnchanged':True,'additionalExternalPressureWrenchResidualKN_KNm':difference})
    result['changePropagation']=comparisons
    output.write_text(json.dumps(result,indent=2,sort_keys=True,allow_nan=False)+'\n')
    return result


if __name__=='__main__':
    path=Path(sys.argv[1]) if len(sys.argv)>1 else Path(__file__).with_name('roof-surface-pressure-proof.json')
    proof(path)
