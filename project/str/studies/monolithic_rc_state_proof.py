import hashlib
import json
from pathlib import Path
import sys

from rc_floor_house_proof import numerical_case
from rc_portal_monolithic import load_monolithic_rc_source, reference_monolithic_rc_case, run_monolithic_rc_case


D=Path(__file__).resolve().parent


def proof(source):
    case=reference_monolithic_rc_case(source);case['houseCase']=numerical_case(source['house'],31)
    name='MONOLITHIC-CONSISTENT-G0.9-W31';result=run_monolithic_rc_case(case,source,name)
    native=result['native'];keys=('sourceSHA256','caseId','request','memberCuts','interiorMemberCuts','capCuts','adjacentGridMemberCuts','portalNormalContactResults','memberLoadEquilibrium','pressureBoundary','heads','externalWrenchKN_KNm','equilibriumResidualKN_KNm','nativeFloorLoadWorkResidualKN_KNm','floorInterfaceWrenchResidualKN_KNm','energyRelativeResidual')
    actions={key:native[key] for key in keys}
    receipt={'schema':'str-monolithic-rc-single-state-proof/1','sourceSHA256':source['identities'],'proofProducerSHA256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
        'request':case,'caseId':name,'executedPhysicalCaseCount':1,'nativeProgrammeIdentityCountExecuted':1,
        'actionFileSHA256':hashlib.sha256((json.dumps(actions,indent=2,allow_nan=False)+'\n').encode()).hexdigest(),
        'memberLoadEquilibrium':native['memberLoadEquilibrium'],'equilibriumResidualKN_KNm':native['equilibriumResidualKN_KNm'],
        'nativeFloorLoadWorkResidualKN_KNm':native['nativeFloorLoadWorkResidualKN_KNm'],'floorInterfaceWrenchResidualKN_KNm':native['floorInterfaceWrenchResidualKN_KNm'],
        'energyRelativeResidual':native['energyRelativeResidual'],'maximumFrameTranslationMm':native['maximumFrameTranslationMm'],
        'cutCounts':{key:len(native[key]) for key in ('memberCuts','interiorMemberCuts','capCuts','adjacentGridMemberCuts')},
        'headCount':len(native['heads']),'schedule':result['schedule'],'unresolvedReceivingPortCount':28,
        'drawingsSHA256':{key:hashlib.sha256(value.encode()).hexdigest() for key,value in result['drawings'].items()},
        'scope':'Sourceground0, actualwalking−152.5, floorFF3370→3270workcouple; actualopenportalreplacement; finite20RCbridges. Arch/infilllocaltransfer, fourLties/keys, lowercap/soil, waterstop/seals/thermal and28paths remainunqualified. No roof/P0/unjoinedG.',
        'candidateAccepted':False,'waterControlAccepted':False,'thermalAccepted':False,'completeHouseProof':False,'roofAdoption':False,'installedAcceptance':False}
    return receipt,actions,result['drawings']


if __name__=='__main__':
    if sys.argv[1:]!=['--write']:raise SystemExit('Use --write to execute the actual31source state')
    source=load_monolithic_rc_source(D.parents[2]);receipt,actions,drawings=proof(source)
    if source['identities']!=load_monolithic_rc_source(D.parents[2])['identities']:raise SystemExit('Sources changed while executing; staleproof rejected')
    for name,value in (('receipt',receipt),('actions',actions)):(D/('monolithic-rc-native31-'+name+'.json')).write_text(json.dumps(value,indent=2,allow_nan=False)+'\n')
    (D/'monolithic-rc-native31-request.json').write_text(json.dumps({'case':receipt['request'],'name':receipt['caseId']},indent=2,allow_nan=False)+'\n')
    for name,svg in drawings.items():(D/('monolithic-rc-native31-'+name)).write_text(svg)
    print('Actualconsistent31proof complete; onephysicalstate, not96executed',flush=True)
