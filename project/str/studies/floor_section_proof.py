"""Current-source actual section edits, matched load controls and reversal."""
import copy
import json
from pathlib import Path
import subprocess
import sys
import tempfile

from floor_section_model import load_source, reference_case, run

D=Path(__file__).resolve().parent
PROOF=D/'floor-section-proof.json'


def cases(source):
    base=reference_case(source)
    heavy=copy.deepcopy(base);b=heavy['bearingCase']['masonryCase'];v=b['verticalCase']
    v['freshUniformLiveKPa']=2.;v['plateLaw']['unitWeightKNPerM3']=27.
    v['monolithicCase']['houseCase']['boundary']['physicalGFactor']=1.35
    b['floorReinforcement'].update(barDiameterMm=16.,pitchMm=80.)
    deep=copy.deepcopy(heavy);deep['thicknessMm']=250.
    return [('current200',base),('matched200-G135-Q2-rho27',heavy),('matched250-G135-Q2-rho27',deep),('restored200',copy.deepcopy(base))]


def summarize(result):
    native=result['nativeVertical']['native'];positions={r['id']:r['xyzMm'] for r in result['nativeVertical']['headPositions']};total=[0.]*6
    for row in native['heads']:
        x,y,z=positions[row['id']];fx,fy,fz,mx,my,mz=row['reactionKN_KNm']
        for i,v in enumerate((fx,fy,fz,mx+(y*fz-z*fy)/1000,my+(z*fx-x*fz)/1000,mz+(x*fy-y*fx)/1000)):total[i]+=v
    residual=[a+b for a,b in zip(total,native['externalWrenchKN_KNm'])]
    return {'executedRequest':result['request'],'sourceSHA256':result['sourceSHA256'],'heads':native['heads'],
        'independent52HeadBalanceResidualKN_KNm':residual,'floorSection':result['floorSection'],'mass':result['mass'],
        'momentInspectionKNmPerM':result['plateBending']['maximumAbsoluteBendingPlusTwistingKNmPerM'],
        'governing':result['plateBending']['governing'],'necessaryStrainCompatibleSection':result['floorReinforcement']['necessaryStrainCompatibleSection'],
        'physicalRecovery':{k:v for k,v in result['nativeVertical']['plate']['physicalRecovery'].items() if k!='points'},
        'candidateAccepted':False,'completeHouseProof':False,'localStressConvergenceProven':False}


def check(proof,source):
    if proof['schema']!='str-coupled-floor-section-proof/1' or proof['sourceSHA256']!=source['identities']:raise ValueError('Stale floor-section evidence')
    rows=proof['controls'];expected=cases(source)
    if len(rows)!=4:raise ValueError('Missing matched/reversal native states')
    for row,(name,request) in zip(rows,expected):
        if row['executedRequest']!=request or row['sourceSHA256']!=source['identities']:raise ValueError('Evidence does not execute actual current section inputs')
        if len(row['heads'])!=52 or len({h['id'] for h in row['heads']})!=52:raise ValueError('Not the actual52physicalheads')
        if max(abs(v) for v in row['independent52HeadBalanceResidualKN_KNm'])>1e-5:raise ValueError('Global source wrench lost')
        for key in ('sourceGravityResidualKN_KNm','sourcePressureResidualKN_KNm','sourceUpperMaterialResidualKN_KNm'):
            if max(abs(v) for v in row['floorSection'][key])>1e-6:raise ValueError('Section edit loses physical source work/load transfer')
        if row['candidateAccepted'] or row['completeHouseProof'] or row['localStressConvergenceProven']:raise ValueError('Unearned section acceptance')
    old={h['id']:h['reactionKN_KNm'] for h in rows[0]['heads']}
    for row in rows:
        row['maximum52HeadComponentDeltaFromBaseline']=max(abs(a-b) for h in row['heads'] for a,b in zip(h['reactionKN_KNm'],old[h['id']]))
    if rows[-1]['maximum52HeadComponentDeltaFromBaseline']>1e-6:raise ValueError('Real section reversal failed')
    if rows[2]['maximum52HeadComponentDeltaFromBaseline']<1e-5 or rows[1]['heads']==rows[2]['heads']:raise ValueError('Actual section edit did not change coupled52headresponse')
    a,b=rows[1]['floorSection'],rows[2]['floorSection']
    if abs(b['plateSelfGKN']/a['plateSelfGKN']-1.25)>1e-10 or b['midplaneZMm']!=3295 or b['topZMm']!=3420:raise ValueError('Thickness edit did not change actual mass/datums')
    if a['steelChordAxialRigidityKN']!=b['steelChordAxialRigidityKN']:raise ValueError('Concrete thickness improperly changes independently authored steel chord')
    if b['remainingSourceFinishDepthMm']!=30 or b['finishStairServiceEvidenceApplicable']:raise ValueError('Unadopted finish/stair/services silently retained')
    old_proof=json.loads((D/'upper-roof-bearing-proof.json').read_text())
    if old_proof['sourceSHA256']!=source['bearing']['identities']:raise ValueError('Baseline upper-bearing receipt is stale')
    predecessor={h['id']:h['reactionKN_KNm'] for h in old_proof['controls'][0]['heads']}
    proof['baselineMaximum312ComponentDifferenceFromCurrent52Source']=max(abs(a-b) for h in rows[0]['heads'] for a,b in zip(h['reactionKN_KNm'],predecessor[h['id']]))
    if proof['baselineMaximum312ComponentDifferenceFromCurrent52Source']>1e-6:raise ValueError('RC200 no longer reproduces existing current method')
    return proof


def write():
    source=load_source(D.parents[2]);rows=[]
    for name,case in cases(source):
        with tempfile.TemporaryDirectory(prefix='actual-section-') as folder:
            request=Path(folder)/'request.json';response=Path(folder)/'response.json';request.write_text(json.dumps(case))
            subprocess.run([sys.executable,'-B',str(Path(__file__)),'--solve',name,str(request),str(response)],check=True)
            result=json.loads(response.read_text())
        rows.append(summarize(result));print(name,'moment',rows[-1]['momentInspectionKNmPerM'],'straincapacity',rows[-1]['necessaryStrainCompatibleSection']['strainCompatibleCapacityKNmPerM'],flush=True)
        if case['thicknessMm']==250.:(D/'floor-section-250.svg').write_text(result['drawings']['floor-section-floor.svg'])
    proof=check({'schema':'str-coupled-floor-section-proof/1','sourceSHA256':source['identities'],'controls':rows},source)
    PROOF.write_text(json.dumps(proof,indent=2,allow_nan=False)+'\n')


if __name__=='__main__':
    if sys.argv[1:]==['--write']:write()
    elif sys.argv[1:]==['--check']:check(json.loads(PROOF.read_text()),load_source(D.parents[2]))
    elif sys.argv[1]=='--solve':
        result=run(json.loads(Path(sys.argv[3]).read_text()),load_source(D.parents[2]),sys.argv[2]);Path(sys.argv[4]).write_text(json.dumps(result,allow_nan=False))
    else:raise SystemExit('Use --write or --check')
