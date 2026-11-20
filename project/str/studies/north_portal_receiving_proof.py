import copy
import hashlib
import json
from pathlib import Path
import sys

from north_portal_receiving import compile_north_receiving, load_north_receiving_source, reference_north_receiving_case, solve_north_receiving_boundary


MATERIAL = {'mode':'authored-linear-comparison','elasticModulusMPa':33000,'poissonRatio':.2,'flexuralFactor':.25,'torsionFactor':.25,'shearAreaFactor':.5}
DPC = {'mode':'authored-bilateral-elastic-comparison','normalStiffnessKNPerMm3':.5,'shearStiffnessKNPerMm3':.05}


def numerical_case(source):
    case = reference_north_receiving_case(source)
    case.update(gridLaw=copy.deepcopy(MATERIAL),pierLaw=copy.deepcopy(MATERIAL),dpcLaw=copy.deepcopy(DPC),dpcIntervalZMm=[-50,-30])
    return case


def proof_summary(case,result,changed):
    source = load_north_receiving_source(Path(__file__).resolve().parents[3])
    if result['sourceSHA256']!=source['identities'] or case['sourceSHA256']!=source['identities'] or changed['sourceSHA256']!=source['identities']:
        raise ValueError('The receiving proof must use the actual current source and methods')
    boundary = {'schema':'str-north-portal-boundary/1','mode':'authored-port-displacements','values':[0.]*24}
    boundary['values'][2] = .01
    a = solve_north_receiving_boundary(result,boundary)
    b = solve_north_receiving_boundary(changed,boundary)
    combined = {'schema':'str-north-portal-boundary/1','mode':'authored-port-wrenches','values':[0.]*24,'tieForcesKN':[-1.,0.,0.,0.]}
    combined['values'][0] = 1.
    actual = solve_north_receiving_boundary(result,combined)
    collapsed = {'schema':'str-north-portal-boundary/1','mode':'authored-port-wrenches','values':[0.]*24}
    collapsed['values'][4] = (result['ports'][0]['skewbackXYZMm'][2]-result['ports'][0]['tieForceXYZMm'][2])/1000
    control = solve_north_receiving_boundary(result,collapsed)
    return {'schema':'str-north-portal-receiving-proof/1','sourceSHA256':source['identities'],
            'proofProducerSHA256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
            'authoredNumericalCase':case,'caseDigest':hashlib.sha256(json.dumps(case,sort_keys=True,separators=(',',':'),allow_nan=False).encode()).hexdigest(),
            'sourceGeometry':result['ports'],'catalogue':result['receivingPathCatalogue'],
            'unitCaseCount':len(result['grid']['unitCases']),'actualHeadIds':result['grid']['headIds'],
            'maximumUnitWrenchEquilibriumResidualKN_KNm':max(abs(value) for case in result['grid']['unitCases'] for value in case['equilibriumResidualKN_KNm']),
            'reciprocityRelativeResidual':result['reciprocityRelativeResidual'],
            'partialRCVolumesM3':[member['integratedPartialRCVolumeM3'] for member in result['partialPierMembers']],
            'partialRCBoreSections':[member['tieBoreSection'] for member in result['partialPierMembers']],
            'prescribedBoundary':boundary,'pierFlexuralFactorChange':[case['pierLaw']['flexuralFactor'],changed['request']['pierLaw']['flexuralFactor']],
            'prescribedBoundaryResponse':a,
            'maximumPrescribedPortWrenchDeltaKN_KNm':max(abs(x-y) for x,y in zip(a['portWrenchesKN_KNm'],b['portWrenchesKN_KNm'])),
            'prescribedPortWrenchDeltaByComponentKN_KNm':[max(abs(a['portWrenchesKN_KNm'][index*6+axis]-b['portWrenchesKN_KNm'][index*6+axis]) for index in range(4)) for axis in range(6)],
            'maximumPrescribedHeadReactionDeltaKN_KNm':max(abs(x-y) for old,new in zip(a['heads'],b['heads']) for x,y in zip(old['reactionKN_KNm'],new['reactionKN_KNm'])),
            'gridUnchanged':result['grid']==changed['grid'],'geometryUnchanged':result['geometrySvg']==changed['geometrySvg'],
            'actualTieStationControl':{'sourceBoundary':combined,'collapsedBoundary':collapsed,
                'maximumHeadReactionDeltaKN_KNm':max(abs(x-y) for old,new in zip(actual['heads'],control['heads']) for x,y in zip(old['reactionKN_KNm'],new['reactionKN_KNm'])),
                'maximumPortTranslationDeltaMm':max(abs(actual['portDisplacementsMmMrad'][index*6+axis]-control['portDisplacementsMmMrad'][index*6+axis]) for index in range(4) for axis in range(3)),
                'maximumPortRotationDeltaMrad':max(abs(actual['portDisplacementsMmMrad'][index*6+axis]-control['portDisplacementsMmMrad'][index*6+axis]) for index in range(4) for axis in range(3,6)),
                'strainEnergyDeltaKNmm':actual['strainEnergyKNmm']-control['strainEnergyKNmm']},
            'derivedSvgSHA256':hashlib.sha256(result['geometrySvg'].encode()).hexdigest(),
            'finiteLowerRCSubpaths':4,'completeFloorReceiverPaths':0,'installedAcceptance':False,'completeHouseProof':False}


if __name__=='__main__':
    if sys.argv[1:]!=['--write']:
        raise SystemExit('Use --write to regenerate the explicit lower-receiver comparison and evidence')
    source = load_north_receiving_source(Path(__file__).resolve().parents[3]);case = numerical_case(source)
    result = compile_north_receiving(case,source)
    changed_case = copy.deepcopy(case);changed_case['pierLaw']['flexuralFactor'] = .125
    changed = compile_north_receiving(changed_case,source)
    summary = proof_summary(case,result,changed)
    directory = Path(__file__).parent
    (directory/'north-portal-receiving-proof.json').write_text(json.dumps(summary,sort_keys=True,indent=2,allow_nan=False)+'\n')
    (directory/'north-portal-receiving.svg').write_text(result['geometrySvg'])
    print(json.dumps({key:summary[key] for key in ('unitCaseCount','maximumUnitWrenchEquilibriumResidualKN_KNm','reciprocityRelativeResidual','maximumPrescribedHeadReactionDeltaKN_KNm','completeFloorReceiverPaths')}))
