import copy
import hashlib
import json
from pathlib import Path
import sys

from rc_portal_monolithic import build_monolithic_rc_portals, load_monolithic_rc_source, solve_monolithic_rc_portals


D=Path(__file__).resolve().parent
COLUMNS=('axialCompressionKN','shearYKN','shearZKN','torsionKNm','bendingYKNm','bendingZKNm')


def replay(source,proof,case_ids):
    if proof['sourceSHA256']!=source['identities']:raise ValueError('Governing replay rejects stale source sweep')
    available={row['caseId']:(row,False) for row in proof['cases']}
    available.update({row['caseId']:(row,True) for row in proof['GMAXQCases']})
    if not case_ids:case_ids=[max(proof['cases']+proof['GMAXQCases'],key=lambda row:row['maximumFrameTranslationMm'])['caseId']]
    records=[];actions=[]
    for name in sorted(set(case_ids)):
        if name not in available:raise ValueError('Replay name is not an actually executed sweep case: '+name)
        expected,external=available[name];case=copy.deepcopy(proof['authoredBaseCase'])
        case['houseCase']['joinedCase']['floor']['boundaryCase']['windIndex']=expected['windIndex']
        case['houseCase']['boundary'].update(physicalGFactor=1.35 if external else .9,includeExternalGMAXQ=external)
        model=build_monolithic_rc_portals(case,source);result=solve_monolithic_rc_portals(model,source,name)
        deltas={}
        for key,stored in (('memberCuts','memberCutVectors'),('capCuts','capCutVectors'),('adjacentGridMemberCuts','adjacentGridCutVectors')):
            actual=[[row[column] for column in COLUMNS] for row in result[key]]
            if len(actual)!=len(expected[stored]):raise ValueError('Governing replay changed physical membercut count')
            delta=max((abs(a-b) for old,new in zip(expected[stored],actual) for a,b in zip(old,new)),default=0.)
            if delta>1e-7:raise ValueError('Uncached governing actual membercut replay disagrees: '+str((name,key,delta)))
            deltas[key]=delta
        actual={row['id']:row['reactionKN_KNm'] for row in result['heads']}
        delta=max(abs(a-b) for head,old in zip(proof['headIds'],expected['headVectorsKN_KNm']) for a,b in zip(old,actual[head]))
        if delta>1e-7:raise ValueError('Uncached governing52head replay disagrees: '+str((name,delta)))
        deltas['heads']=delta
        before={};after={}
        for table,rows in ((before,expected['interiorMemberCuts']),(after,result['interiorMemberCuts'])):
            for row in rows:
                member=table.setdefault(row['memberId'],{})
                for column in COLUMNS:
                    values=member.setdefault(column,[]);values.append(row[column])
        if before.keys()!=after.keys():raise ValueError('Replay interiorsection domains changed')
        delta=max((abs(function(before[name][column])-function(after[name][column])) for name in before for column in COLUMNS for function in (min,max)),default=0.)
        if delta>1e-7:raise ValueError('Uncached governing interiorcomponentextrema disagree: '+str((name,delta)))
        deltas['interiorComponentExtrema']=delta
        records.append({'caseId':name,'windIndex':expected['windIndex'],'physicalGFactor':case['houseCase']['boundary']['physicalGFactor'],
            'includeExternalGMAXQ':external,'maximumActionReplayDeltaKN_KNm':deltas,
            'equilibriumResidualKN_KNm':result['equilibriumResidualKN_KNm'],'memberLoadEquilibrium':result['memberLoadEquilibrium'],
            'energyRelativeResidual':result['energyRelativeResidual'],'nativeFactorMemoUsed':False})
        keys=('sourceSHA256','caseId','request','memberCuts','interiorMemberCuts','capCuts','adjacentGridMemberCuts','heads','externalWrenchKN_KNm','equilibriumResidualKN_KNm','memberLoadEquilibrium','pressureBoundary','portalNormalContactResults')
        actions.append({key:result[key] for key in keys})
        print('Freshuncachedgoverningreplay',name,deltas,flush=True)
    return {'schema':'str-monolithic-rc-governing-replay/1','sourceSHA256':source['identities'],'proofProducerSHA256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
        'sourceSweepSHA256':hashlib.sha256((D/'monolithic-rc-native96-proof.json').read_bytes()).hexdigest(),'executedUncachedCases':len(records),'records':records,
        'selectionScope':'Namedactuallyexecutedcomponent/cagegoverningcases; defaultislargestactualtranslation. Individualcomponentextrema arenot universalnonlinearcapacityextrema.',
        'candidateAccepted':False,'completeHouseProof':False,'waterControlAccepted':False,'thermalAccepted':False,'roofAdoption':False,'installedAcceptance':False},actions


if __name__=='__main__':
    if not sys.argv[1:] or sys.argv[1]!='--write':raise SystemExit('Use --write [ACTUAL_CASE_ID ...] for fresh uncached governing replay')
    source=load_monolithic_rc_source(D.parents[2]);proof=json.loads((D/'monolithic-rc-native96-proof.json').read_text())
    receipt,actions=replay(source,proof,sys.argv[2:])
    if source['identities']!=load_monolithic_rc_source(D.parents[2])['identities']:raise SystemExit('Sources changed during governing replay')
    (D/'monolithic-rc-governing-replay.json').write_text(json.dumps(receipt,indent=2,allow_nan=False)+'\n')
    (D/'monolithic-rc-governing-actions.json').write_text(json.dumps(actions,indent=2,allow_nan=False)+'\n')
