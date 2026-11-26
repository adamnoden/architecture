"""Current actual q32/q64 normal-contact comparison for the uniform slab law.

--check/--write replay authenticated actual captures without a native solve.
--capture-to explicitly executes only the q64 counterpart into fresh paths.
"""
from __future__ import annotations
import argparse,copy,hashlib,json,os,tarfile
from pathlib import Path

from floor_section_model import load_source,run
from floor_section_proof import validate_full,capture as capture_native
from uniform_slab_law import differences,metrics,require,row_deltas
from uniform_slab_law_proof import load_captures,read_controls as uniform_controls,expected_control,changed_request
from wet_bearing_refinement import compare_contacts
from wet_post_head_duties import post_duty

ROOT=Path(__file__).resolve().parents[3];D=Path(__file__).resolve().parent
INPUT=D/'uniform-slab-contact-refinement-inputs.json'
ARCHIVE=D/'uniform-slab-contact-refinement-native-captures.tar.xz'
PROOF=D/'uniform-slab-contact-refinement.json'
METHODS=['project/str/studies/uniform_slab_contact_refinement.py',
    'project/str/studies/uniform_slab_law.py','project/str/studies/uniform_slab_law_proof.py',
    'project/str/studies/wet_bearing_refinement.py','project/str/studies/wet_post_head_duties.py',
    'project/str/studies/floor_section_proof.py','project/str/studies/wet_bearing_refinement_proof.py']
INPUTS=['project/str/studies/uniform-slab-contact-refinement-inputs.json',
    'project/str/studies/uniform-slab-law-inputs.json','project/str/studies/wet-bearing-refinement-inputs.json']
sha=lambda data:hashlib.sha256(data).hexdigest()
def identities(paths):return {p:sha((ROOT/p).read_bytes()) for p in paths}
def encode(value):return (json.dumps(value,indent=2,allow_nan=False)+'\n').encode()

def read_controls(value=None):
    c=json.loads(INPUT.read_bytes()) if value is None else value
    expected={'schema':'str-uniform-slab-contact-refinement-input/1',
        'id':'STR/FLOOR/RC200/uniform8250-normal-bearing-refinement','units':'mm-kN-kNm-MPa','datum':'source-ground-zero',
        'coarseOrder':32,'fineOrder':64,'coarseNativeCaseId':'UNIFORM8250-RC200-WET120-SOUTH40-q32',
        'coarseFullNativeSHA256':'53cec76f8c001c66776b38423e99dccb190b27a25622cacf912539e2bc37afad',
        'fineNativeCaseId':'UNIFORM8250-RC200-WET120-SOUTH40-q64',
        'comparisonScope':'normal-bearing-quadrature-only-fixed-slab-frame-laws-and-mesh',
        'materialQualified':False,'globalStressConverged':False,'floorSelected':False}
    require(c==expected and all(c[k] is False for k in ['materialQualified','globalStressConverged','floorSelected'])
        and type(c['coarseOrder']) is int and type(c['fineOrder']) is int,'explicit supported unselected q32/q64 normal-contact controls required')
    return copy.deepcopy(c)

def requests(source,c):
    controls=uniform_controls();coarse=changed_request(expected_control(source,controls),controls);fine=copy.deepcopy(coarse)
    require(coarse['wetSupport']['bearingQuadratureOrder']==c['coarseOrder'],'actual uniform q32 controlling request required')
    fine['wetSupport']['bearingQuadratureOrder']=c['fineOrder']
    require(differences(coarse,fine)==[{'path':'/wetSupport/bearingQuadratureOrder','control':32,'changed':64}],
        'contact refinement changed other physical choices')
    return coarse,fine

def load_fine(source,c,request):
    raw=ARCHIVE.read_bytes()
    with tarfile.open(ARCHIVE,'r:xz') as tar:
        manifest=json.load(tar.extractfile('archive-manifest.json'))
        require(manifest['schema']=='str-uniform-slab-contact-native-archive/1'
            and manifest['nativeCaseId']==c['fineNativeCaseId'] and manifest['nativeSolveExecuted'] is True
            and manifest['contactRefinementOnly'] is True and manifest['candidateAccepted'] is False
            and set(manifest['files'])=={'q64.request.json','q64.full.json','q64.capture.json','execution-start.json'},
            'unsupported fine native archive extent/claims')
        files={}
        for name,identity in manifest['files'].items():
            require(Path(name).name==name,'nonlocal fine archive member');data=tar.extractfile(name).read()
            require(identity=={'bytes':len(data),'sha256':sha(data)},'fine native archive member identity mismatch: '+name)
            files[name]=data
    full=files['q64.full.json'];native=json.loads(full);capture=json.loads(files['q64.capture.json']);start=json.loads(files['execution-start.json'])
    summary=validate_full(native,request,source,c['fineNativeCaseId'])
    require(json.loads(files['q64.request.json'])==request and capture['schema']=='str-full-native-control-capture/1'
        and capture['request']==request and capture['sourceSHA256']==source['identities']
        and capture['nativeCaseId']==c['fineNativeCaseId'] and capture['fullResultSHA256']==sha(full)
        and capture['summary']==summary and capture['drawings']==native['drawings'],'actual q64 source/request/full/capture join failed')
    require(start['sourceSHA256']==source['identities'] and start['caseId']==c['fineNativeCaseId']
        and start['requestSHA256']==sha(files['q64.request.json'])
        and start['captureProducerSHA256']==sha((D/'floor_section_proof.py').read_bytes()),
        'fine execution-start source/request/capture-producer identity mismatch')
    return native,{'archiveSHA256':sha(raw),'fullSHA256':sha(full),'captureSHA256':sha(files['q64.capture.json']),
        'executionStartSHA256':sha(files['execution-start.json']),'executedNumericalRuntime':start['numericalRuntime']}

def produce():
    before=identities(METHODS);inputs=identities(INPUTS);source=load_source(ROOT);c=read_controls();coarse_request,fine_request=requests(source,c)
    natives,coarse_provenance=load_captures(source,uniform_controls());coarse=natives['uniform200']
    require(coarse['request']==coarse_request and coarse_provenance['actualNativeCaptures']['uniform200']['fullSHA256']==c['coarseFullNativeSHA256'],
        'actual q32 controlling result changed')
    fine,fine_provenance=load_fine(source,c,fine_request)
    criteria=json.loads((D/'wet-bearing-refinement-inputs.json').read_bytes())['criteria']
    contact=compare_contacts(coarse,fine,criteria)
    require(coarse['nativeVertical']['plate']['cellsXYMm']==fine['nativeVertical']['plate']['cellsXYMm']
        and coarse['nativeVertical']['plate']['holesXYMm']==fine['nativeVertical']['plate']['holesXYMm'],
        'normal quadrature edit changed slab mesh/void geometry')
    mass=differences(coarse['mass'],fine['mass'])
    require(all(isinstance(r['control'],(int,float)) and abs(r['changed']-r['control'])<1e-8 for r in mass),'contact refinement changed physical mass')
    a,b=[x['nativeVertical']['native'] for x in [coarse,fine]]
    wrench=[y-x for x,y in zip(a['externalWrenchKN_KNm'],b['externalWrenchKN_KNm'])]
    require(max(map(abs,wrench))<1e-8,'contact refinement changed external source-origin wrench')
    coarse_duties=[post_duty(p) for p in coarse['seatedWetSupport']['posts']];fine_duties=[post_duty(p) for p in fine['seatedWetSupport']['posts']]
    post_differences=row_deltas(coarse_duties,fine_duties,['headWrenchKN_KNmm','baseWrenchKN_KNmm','compressionKN'],['id'])
    head_differences=row_deltas(a['heads'],b['heads'],['reactionKN_KNm'],['id'])
    result={'schema':'str-uniform-slab-contact-refinement/1','nativeSourceSHA256':source['identities'],
        'processingMethodSHA256':before,'authoredInputSHA256':inputs,'authoredControls':c,
        'coarseNativeProvenance':coarse_provenance,'fineNativeProvenance':fine_provenance,
        'contactRefinement':contact,'coarsePostHeadDuties':coarse_duties,'finePostHeadDuties':fine_duties,
        'postPhysicalWrenchDifferences':post_differences,'all52HeadComponentDifferences':head_differences,
        'coarseActualHeads':a['heads'],'fineActualHeads':b['heads'],
        'coarseMonitoredResponse':metrics(coarse),'fineMonitoredResponse':metrics(fine),
        'unchangedControls':{'onlyAuthoredEdit':differences(coarse_request,fine_request),
            'slabMeshCellsAndVoidsIdentical':True,'fullMassLedgerWithin1eMinus8KN':True,'massRoundoffDifferences':mass,
            'externalSourceWrenchWithin1eMinus8KN_KNm':True,'externalWrenchRoundoffDifferencesKN_KNm':wrench},
        'nativeSolveExecutedByThisReplay':False,'actualFineNativeSolveRetained':True,
        'normalContactRefinementPassing':contact['numericalRefinementPassing'],
        'materialQualified':False,'globalStressConverged':False,'asymptoticErrorBoundAvailable':False,
        'bendPressureAccepted':False,'bondAndAnchorageAccepted':False,'physicalContactAccepted':False,
        'completeSignedLoadEnvelope':False,'floorSelected':False,'candidateAccepted':False,
        'scope':'One actually re-equilibrated normal-pad order32-to64 doubling at unchanged uniform8250 slab/frame laws, geometry, loads, supports and slab mesh. Uses the existing unmodified normal-contact criteria and exact clipped-affine same-plane checks. This is not material identification, global slab/corner stress convergence, finite-node/anchorage resistance, signed-envelope or whole-house acceptance.'}
    require(before==identities(METHODS) and inputs==identities(INPUTS) and source['identities']==load_source(ROOT)['identities'],
        'source/method/input changed during contact refinement replay')
    return result

def capture_to(directory):
    directory=Path(directory);directory.mkdir(parents=True,exist_ok=True);source=load_source(ROOT);c=read_controls();_,request=requests(source,c)
    paths=[directory/n for n in ['q64.request.json','q64.full.json','q64.capture.json']]
    start_file=directory/'execution-start.json'
    require(not any(p.exists() for p in [*paths,start_file]),'refuse overwriting prior actual fine evidence')
    paths[0].write_bytes(encode(request))
    from datetime import datetime,timezone
    from vertical_floor_numerics import runtime_versions
    start_file.write_bytes(encode({'schema':'str-uniform-slab-contact-native-execution/1',
        'state':'request-saved-before-execution','startedAt':datetime.now(timezone.utc).isoformat(),
        'caseId':c['fineNativeCaseId'],'sourceRoot':str(ROOT),'sourceSHA256':source['identities'],
        'requestSHA256':sha(paths[0].read_bytes()),'captureProducerSHA256':sha((D/'floor_section_proof.py').read_bytes()),
        'numericalRuntime':runtime_versions(),'nativeSolveExecuted':False,'contactRefinementOnly':True,
        'materialQualified':False,'localStressConverged':False}))
    capture_native(c['fineNativeCaseId'],paths[0],paths[1],paths[2])
    require(source['identities']==load_source(ROOT)['identities'],'source changed during actual fine native execution')
    return {'nativeSolveExecuted':True,'fullSHA256':sha(paths[1].read_bytes()),'outputDirectory':str(directory)}

if __name__=='__main__':
    p=argparse.ArgumentParser();g=p.add_mutually_exclusive_group(required=True);g.add_argument('--write',action='store_true');g.add_argument('--check',action='store_true');g.add_argument('--capture-to',type=Path);args=p.parse_args()
    if args.capture_to:print(json.dumps(capture_to(args.capture_to)))
    else:
        result=produce()
        if args.check:require(json.loads(PROOF.read_bytes())==result,'stale uniform normal-contact refinement receipt')
        else:
            temp=PROOF.with_suffix('.writing.json');temp.write_bytes(encode(result));os.replace(temp,PROOF)
        print(json.dumps({'normalContactRefinementPassing':result['normalContactRefinementPassing'],
            'maximum52HeadComponentDifferenceKN_KNm':result['contactRefinement']['maximum52HeadComponentDifferenceKN_KNm'],
            'materialQualified':False,'globalStressConverged':False,'nativeSolveExecutedByThisReplay':False}))
