import copy
import hashlib
import json
import math
from pathlib import Path
import sys

from distributed_floor_compatibility import compile_distributed_floor, compile_distributed_floor_sweep, load_distributed_floor_source, reference_distributed_floor_request


MEMBER = {'mode':'authored-linear-comparison','elasticModulusMPa':33000,'poissonRatio':.2,'flexuralFactor':.25,'torsionFactor':.25,'shearAreaFactor':.5}
JOINT = {'mode':'authored-spring-comparison','compressionStiffnessKNPerMm3':.5,'tieStiffnessKNPerMm':50,'shearKeyStiffnessKNPerMm':100,'compressionGapMm':0,'tieGapMm':0}
MEMBRANE = {'mode':'authored-linear-comparison','elasticModulusMPa':1200,'poissonRatio':.15,'shearModulusMPa':440}
BAND = {'mode':'authored-conventional-slab-level-band','widthMm':140,'depthMm':200,'elasticModulusMPa':33000,'flexuralFactor':.25,'axialRigidityKN':200000*8*math.pi*12**2/4/1000}


def numerical_request(source):
    request = reference_distributed_floor_request(source)
    request.update(cornerWidthsMm={'NW':200,'NE':200,'SW':140,'SE':140},memberLaw=copy.deepcopy(MEMBER),jointLaw=copy.deepcopy(JOINT),membraneLaw=copy.deepcopy(MEMBRANE),edgeBand=copy.deepcopy(BAND))
    return request


def proof_summary(request, result):
    source = load_distributed_floor_source(Path(__file__).resolve().parents[3])
    if result.get('schema')!='str-distributed-floor-sweep/1' or result['sourceSHA256']!=source['identities'] or request['sourceSHA256']!=source['identities'] or result['caseCount']!=96:
        raise ValueError('Only the exact current96-case sweep can write its source-bound proof')
    drawing = result['drawings']['floor.svg']
    refined_request = copy.deepcopy(request)
    refined_request['maxPitchMm'] = 700
    refined = compile_distributed_floor(refined_request,source)
    baseline = result['cases'][0]
    refinement = {'pitchMm':[request['maxPitchMm'],700],
                  'triangleCount':[result['floor']['triangleCount'],refined['floor']['triangleCount']],
                  'maximumHeadComponentDeltaKN_KNm':max(abs(a-b) for old,new in zip(baseline['heads'],refined['heads']) for a,b in zip(old['reactionKN_KNm'],new['reactionKN_KNm'])),
                  'maximumUpperTranslationDeltaMm':max(abs(a-b) for old,new in zip(baseline['interfaces'],refined['interfaces']) for a,b in zip(old['upperDisplacementMmRad'][:3],new['upperDisplacementMmRad'][:3]))}
    return {'schema':'str-distributed-floor-proof/1','sourceSHA256':result['sourceSHA256'],
            'proofProducerSHA256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
            'baselineCaseDigest':hashlib.sha256(json.dumps(request,sort_keys=True,separators=(',',':'),allow_nan=False).encode()).hexdigest(),
            'authoredNumericalCase':request,'derivedSvgSha256':hashlib.sha256(drawing.encode()).hexdigest(),
            'scope':result['scope'],'meshRefinement':refinement,'installedAcceptance':False,'completeHouseProof':False,
            'sweep':{'caseCount':96,'headIds':[head['id'] for head in result['cases'][0]['heads']],
                     'maximumEquilibriumResidualKN_KNm':result['maximumEquilibriumResidualKN_KNm'],
                     'headReactionMinimumMaximumKN_KNm':[[min(head['reactionKN_KNm'][axis] for case in result['cases'] for head in case['heads']),max(head['reactionKN_KNm'][axis] for case in result['cases'] for head in case['heads'])] for axis in range(6)],
                     'maximumUpperTranslationComponentMm':max(abs(value) for case in result['cases'] for port in case['interfaces'] for value in port['upperDisplacementMmRad'][:3]),
                     'maximumUnqualifiedJointGroupTieTensionKN':max(port['totalTieTensionKN'] for case in result['cases'] for port in case['interfaces']),
                     'activeCompressionSampleRange':[min(port['activeCompressionPatchCount'] for case in result['cases'] for port in case['interfaces']),max(port['activeCompressionPatchCount'] for case in result['cases'] for port in case['interfaces'])],
                     'cases':[{'windIndex':case['windBoundary']['windIndex'],'programme':case['windBoundary']['programme'],'courtProjection':case['windBoundary']['courtProjection'],
                               'headCount':len(case['heads']),'maximumEquilibriumResidualKN_KNm':max(abs(value) for value in case['equilibriumResidualKN_KNm']),
                               'maximumFreeResidualKNOrKNmm':case['maximumFreeResidualKNOrKNmm'],'activeSetIterations':case['activeSetIterations']} for case in result['cases']]}}


def write_proof(request,result):
    summary = proof_summary(request,result)
    directory = Path(__file__).parent
    (directory/'distributed-floor-compatibility-proof.json').write_text(json.dumps(summary,sort_keys=True,indent=2,allow_nan=False)+'\n')
    (directory/'distributed-floor-compatibility.svg').write_text(result['drawings']['floor.svg'])
    return summary


if __name__=='__main__':
    if sys.argv[1:]!=['--write']:
        raise SystemExit('Use --write to execute and save the explicitly unqualified96-programme numerical comparison')
    source = load_distributed_floor_source(Path(__file__).resolve().parents[3])
    request = numerical_request(source)
    result = compile_distributed_floor_sweep(request,source)
    summary = write_proof(request,result)
    print(json.dumps({'caseCount':summary['sweep']['caseCount'],'maximumEquilibriumResidualKN_KNm':summary['sweep']['maximumEquilibriumResidualKN_KNm']}))
