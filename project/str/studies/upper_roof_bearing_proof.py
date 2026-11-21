"""Fresh source-bound full-system mutation/adverse/reversal evidence."""
import copy
import hashlib
import json
from pathlib import Path
import subprocess
import sys
import tempfile

from masonry_frame_a_proof import numerical_case
from upper_roof_bearing import load_source, reference_case, run

D=Path(__file__).resolve().parent
PROOF=D/'upper-roof-bearing-proof.json'


def worked_case(source):
    case=reference_case(source);base=numerical_case(source['base'])
    roof=base.pop('roofCoupling');roof.pop('intermediateSupportLaws');base['roofCoupling']=None
    case.update(masonryCase=base,roofControls=roof)
    return case


def summarize(result):
    n=result['nativeVertical'];native=n['native'];upper=result['upperMasonry']
    positions={r['id']:r['xyzMm'] for r in n['headPositions']};total=[0.]*6
    for row in native['heads']:
        x,y,z=positions[row['id']];fx,fy,fz,mx,my,mz=row['reactionKN_KNm']
        for i,v in enumerate((fx,fy,fz,mx+(y*fz-z*fy)/1000,my+(z*fx-x*fz)/1000,mz+(x*fy-y*fx)/1000)):total[i]+=v
    residual=[a+b for a,b in zip(total,native['externalWrenchKN_KNm'])]
    if max(abs(v) for v in residual)>1e-5:raise ValueError('Actual52-head originating wrench does not balance')
    return {'caseId':native['caseId'],'executedRequest':result['request'],'sourceSHA256':result['sourceSHA256'],
        'heads':native['heads'],'headPositions':n['headPositions'],'externalWrenchKN_KNm':native['externalWrenchKN_KNm'],
        'independentHeadBalanceResidualKN_KNm':residual,'mass':result['mass'],
        'minimumHeadVerticalKN':min(r['reactionKN_KNm'][2] for r in native['heads']),
        'upperMasonryPhysicalGKN':upper['inventory']['masonryPhysicalGKN'],
        'padsPhysicalGKN':sum(r['padPhysicalGKN'] for r in upper['seats']),
        'serviceColumnOmissions':upper['inventory']['serviceColumnOmissions'],
        'unroutedClearBodyGKN':upper['freeTopPlateLoad']['unroutedPhysicalGKN'],
        'sourceGravityWrenchKN_KNm':upper['sourceGravityWrenchKN_KNm'],
        'sourceSelfGAndFirstMomentResidualKN_KNm':upper['sourceSelfGAndFirstMomentResidualKN_KNm'],
        'seatResponses':upper['seats'],'plateRecovery':{k:v for k,v in n['plate']['physicalRecovery'].items() if k!='points'},
        'maximumAbsoluteBendingPlusTwistingKNmPerM':result['plateBending']['maximumAbsoluteBendingPlusTwistingKNmPerM'],
        'necessaryFloorSection':result['floorReinforcement']['section'],
        'candidateAccepted':False,'completeHouseProof':False,'finiteFootprintPressureAndRotationQualified':False}


def check(proof,source):
    if proof['schema']!='str-upper-masonry-roof-bearing-proof/1' or proof['sourceSHA256']!=source['identities']:
        raise ValueError('Stale upper-bearing proof; regenerate from its actual current methods/inputs')
    controls=proof['controls'];base=controls[0]
    if len(controls)!=6 or base['executedRequest']!=worked_case(source):raise ValueError('Missing actual default/current upper bearing case')
    before={r['id']:r['reactionKN_KNm'] for r in base['heads']}
    for row in controls:
        if row['sourceSHA256']!=source['identities'] or len(row['heads'])!=52 or len({r['id'] for r in row['heads']})!=52:
            raise ValueError('Proof changed source or physical head catalogue')
        if max(abs(v) for v in row['independentHeadBalanceResidualKN_KNm'])>1e-5 or max(abs(v) for v in row['sourceSelfGAndFirstMomentResidualKN_KNm'])>1e-6:
            raise ValueError('Proof loses source or global equilibrium')
        if len(row['seatResponses'])!=18 or any(s['contactCompressionKN'] < -1e-7 for s in row['seatResponses']):raise ValueError('Intermediate masonry seat transfers tension')
        if row['candidateAccepted'] or row['completeHouseProof'] or row['finiteFootprintPressureAndRotationQualified']:raise ValueError('Unearned upper-bearing acceptance')
        row['maximum52HeadComponentDeltaFromBaselineKN_KNm']=max(abs(a-b) for head in row['heads'] for a,b in zip(head['reactionKN_KNm'],before[head['id']]))
    if any(controls[i]['maximum52HeadComponentDeltaFromBaselineKN_KNm']<=1e-6 for i in (1,2,3,4)):raise ValueError('A real input edit did not propagate to52 heads')
    if controls[-1]['maximum52HeadComponentDeltaFromBaselineKN_KNm']>1e-6:raise ValueError('Actual full-case reversal failed')
    if abs(controls[1]['upperMasonryPhysicalGKN']-base['upperMasonryPhysicalGKN']/2)>1e-8:raise ValueError('Authored masonry density did not control actual mass')
    if abs(controls[2]['mass']['newPlatePhysicalSelfGKN']-base['mass']['newPlatePhysicalSelfGKN']+.545)>1e-8:raise ValueError('Actual floor aperture edit lost its physical material effect')
    for i in (3,4):
        if abs(controls[i]['mass']['joinedPhysicalGKN']-base['mass']['joinedPhysicalGKN'])>1e-8:raise ValueError('Applied load change altered physical inventory')
    return proof


def write(baseline_capture=None):
    source=load_source(D.parents[2]);base=worked_case(source);cases=[('base',base)]
    density=copy.deepcopy(base);density['masonryUnitWeightKNPerM3']=10.;cases.append(('density-half',density))
    opening=copy.deepcopy(base);opening['masonryCase']['verticalCase']['monolithicCase']['houseCase']['joinedCase']['floor']['componentCase']['edits']['floorApertures']=[{'id':'FLOOR-APERTURE/plant-riser','shape':{'kind':'rectangle','boundsXYMm':[9240,4760,9905,5305]}}];cases.append(('aperture-wider',opening))
    live=copy.deepcopy(base);live['masonryCase']['verticalCase']['freshUniformLiveKPa']=2.;cases.append(('net-floor-Q2',live))
    from roof_floor_compatibility import load_roof_only_source,_scope
    from roof_surface_pressure import reference_roof_surface_pressure_settings
    scope,_=_scope(load_roof_only_source(source['root']));pressure=reference_roof_surface_pressure_settings({'scope':scope});pressure['uniformKPa']=-2.25
    adverse=copy.deepcopy(base);adverse['masonryCase']['verticalCase']['monolithicCase']['houseCase']['boundary']['physicalGFactor']=0.;adverse['roofControls']['roofSurfacePressure']=pressure;cases.append(('zero-G-and-roof-suction',adverse))
    cases.append(('restored',copy.deepcopy(base)));summaries=[]
    for index,(name,case) in enumerate(cases):
        if index==0 and baseline_capture:
            result=json.loads(Path(baseline_capture).read_text())
            if result['sourceSHA256']!=source['identities'] or result['request']!=case:raise ValueError('Baseline capture differs from exact current inputs/methods')
        else:
            with tempfile.TemporaryDirectory(prefix='upper-bearing-proof-') as folder:
                request=Path(folder)/'request.json';response=Path(folder)/'response.json';request.write_text(json.dumps(case))
                subprocess.run([sys.executable,'-B',str(Path(__file__)),'--solve',name,str(request),str(response)],check=True)
                result=json.loads(response.read_text())
        summary=summarize(result);summaries.append(summary)
        print(name,'minhead',summary['minimumHeadVerticalKN'],'clear-masonryG',summary['upperMasonryPhysicalGKN'],flush=True)
        if index==0:
            for filename,svg in result['drawings'].items():
                if filename=='upper-roof-bearing.svg':(D/filename).write_text(svg)
        del result
    proof=check({'schema':'str-upper-masonry-roof-bearing-proof/1','sourceSHA256':source['identities'],
        'controls':summaries,'scope':'Six freshly executed coupled states; axial point-bearing comparison, not full pad or house acceptance.'},source)
    PROOF.write_text(json.dumps(proof,indent=2,allow_nan=False)+'\n')


if __name__=='__main__':
    if sys.argv[1:2]==['--solve']:
        source=load_source(D.parents[2]);result=run(json.loads(Path(sys.argv[3]).read_text()),source,'UPPER-SEAT-'+sys.argv[2].upper())
        Path(sys.argv[4]).write_text(json.dumps(result,allow_nan=False))
    elif sys.argv[1:2]==['--write']:write(sys.argv[2] if len(sys.argv)>2 else None)
    elif sys.argv[1:]==['--check']:
        check(json.loads(PROOF.read_text()),load_source(D.parents[2]));print('Current upper-bearing source and actual mutation/adverse/reversal evidence verified')
    else:raise SystemExit('Use --write [exact-baseline-capture], --check or internal --solve')
