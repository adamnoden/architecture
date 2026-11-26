"""Authenticate actual RC200 controls and replay a common slab-law comparison.

--check/--write never execute a native solve. --capture-to explicitly executes
the changed case into a separate directory without replacing retained evidence.
"""
from __future__ import annotations
import argparse,copy,hashlib,json,math,os,tarfile
from pathlib import Path

from floor_section_model import load_source,run
from floor_section_proof import validate_full
from wet_bearing_refinement_proof import expected_native_request
from uniform_slab_law import compare,differences

ROOT=Path(__file__).resolve().parents[3]
D=Path(__file__).resolve().parent
INPUT=D/'uniform-slab-law-inputs.json'
ARCHIVE=D/'uniform-slab-law-native-captures.tar.xz'
PROOF=D/'uniform-slab-law-proof.json'
METHODS=['project/str/studies/uniform_slab_law.py','project/str/studies/uniform_slab_law_proof.py',
    'project/str/studies/floor_section_proof.py','project/str/studies/wet_bearing_refinement_proof.py',
    'compiler/reference-house/current-design/structural-slab-constitutive.ts']
sha=lambda data:hashlib.sha256(data).hexdigest()
def methods():return {p:sha((ROOT/p).read_bytes()) for p in METHODS}
def encode(value):return (json.dumps(value,indent=2,allow_nan=False)+'\n').encode()

def read_controls(value=None):
    c=json.loads(INPUT.read_bytes()) if value is None else value
    if (not isinstance(c,dict) or set(c)!={'schema','id','units','datum','control','uniformSlabLaw',
        'changedNativeCaseId','purpose','materialQualified','stiffnessSelected','floorSelected'}
        or c['schema']!='str-uniform-slab-law-input/1'
        or c['id']!='STR/FLOOR/RC200/uniform8250-constitutive-comparison'
        or c['units']!='mm-N-kN-MPa' or c['datum']!='source-ground-zero'
        or c['purpose']!='explicit-unselected-constitutive-comparison'
        or any(c[k] is not False for k in ['materialQualified','stiffnessSelected','floorSelected'])
        or c['changedNativeCaseId']!='UNIFORM8250-RC200-WET120-SOUTH40-q32'
        or c['control']!={'nativeFamily':'wet-aligned-concrete27','bearingQuadratureOrder':32,
            'padWidthMm':120,'padCentreOffsetsYMm':[40,0],'nativeCaseId':'WET120-SOUTH40-q32',
            'fullNativeSHA256':'ed5439632702f32a3b96edaa5c0b097c3affde49ebe7dac149b785b4912de097'}
        or c['uniformSlabLaw']!={'elasticModulusMPa':8250,'poissonRatio':.2,'shearModulusMPa':3437.5,
            'flexuralFactor':1,'transverseShearCorrectionFactor':5/6}):
        raise ValueError('explicit supported unselected uniform8250 RC200 controls required')
    return copy.deepcopy(c)

def expected_control(source,c):
    control=c['control']
    result=expected_native_request(control['nativeFamily']+'-quadrature'+str(control['bearingQuadratureOrder']),source)
    result['wetSupport']['padWidthMm']=control['padWidthMm']
    result['wetSupport']['padCentreOffsetsYMm']=copy.deepcopy(control['padCentreOffsetsYMm'])
    return result

def changed_request(control,c):
    result=copy.deepcopy(control);v=result['bearingCase']['masonryCase']['verticalCase'];p=v['plateLaw']
    m=v['monolithicCase']['houseCase']['joinedCase']['floor']['membraneLaw'];law=c['uniformSlabLaw']
    if (result['thicknessMm']!=200 or p!={'elasticModulusMPa':33000,'poissonRatio':.2,'thicknessMm':200,
        'flexuralFactor':.25,'shearFactor':.5,'unitWeightKNPerM3':27}
        or m!={'mode':'authored-linear-comparison','elasticModulusMPa':1200,'poissonRatio':.15,'shearModulusMPa':440}):
        raise ValueError('actual source200 independent plate/membrane control required')
    p.update(elasticModulusMPa=law['elasticModulusMPa'],poissonRatio=law['poissonRatio'],
        flexuralFactor=law['flexuralFactor'],shearFactor=law['transverseShearCorrectionFactor'])
    m.update(elasticModulusMPa=law['elasticModulusMPa'],poissonRatio=law['poissonRatio'],shearModulusMPa=law['shearModulusMPa'])
    if len(differences(control,result))!=6:raise ValueError('uniform law transform changed unexpected authored fields')
    return result

def load_captures(source,c):
    raw=ARCHIVE.read_bytes()
    with tarfile.open(ARCHIVE,mode='r:xz') as tar:
        manifest=json.load(tar.extractfile('archive-manifest.json'))
        expected_files={stem+suffix for stem in ['control','uniform200'] for suffix in ['.full.json','.request.json','.capture.json']}
        if (manifest['schema']!='str-uniform-slab-law-native-archive/1'
            or manifest['nativeCases']!=[c['control']['nativeCaseId'],c['changedNativeCaseId']]
            or manifest['nativeSolveExecutedForChangedCase'] is not True or manifest['candidateAccepted'] is not False
            or set(manifest['files'])!=expected_files):raise ValueError('unsupported actual native archive extent/claims')
        files={}
        for name,identity in manifest['files'].items():
            if Path(name).name!=name:raise ValueError('nonlocal archive member')
            data=tar.extractfile(name).read()
            if identity!={'bytes':len(data),'sha256':sha(data)}:raise ValueError('native archive member identity mismatch: '+name)
            files[name]=data
    control=expected_control(source,c);changed=changed_request(control,c);natives={};provenance={}
    for stem,request,name in [('control',control,c['control']['nativeCaseId']),('uniform200',changed,c['changedNativeCaseId'])]:
        full=files[stem+'.full.json'];capture=json.loads(files[stem+'.capture.json']);native=json.loads(full)
        summary=validate_full(native,request,source,name)
        if (capture['schema']!='str-full-native-control-capture/1' or capture['nativeCaseId']!=name
            or json.loads(files[stem+'.request.json'])!=request or capture['request']!=request
            or capture['sourceSHA256']!=source['identities'] or capture['fullResultSHA256']!=sha(full)
            or capture['summary']!=summary or capture['drawings']!=native['drawings']):
            raise ValueError('actual current source/request/full/capture join failed: '+stem)
        if stem=='control' and sha(full)!=c['control']['fullNativeSHA256']:
            raise ValueError('changed retained controlling native full response')
        natives[stem]=native
        provenance[stem]={'nativeCaseId':name,'fullSHA256':sha(full),'captureSHA256':sha(files[stem+'.capture.json'])}
    return natives,{'archiveSHA256':sha(raw),'actualNativeCaptures':provenance,
        'originalNativeControlProvenance':manifest['originalNativeControlProvenance']}

def produce():
    before=methods();input_bytes=INPUT.read_bytes();c=read_controls();source=load_source(ROOT)
    natives,provenance=load_captures(source,c)
    result=compare(natives['control'],natives['uniform200'],provenance,ROOT)
    result.update(processingMethodSHA256=before,authoredInputSHA256=sha(input_bytes),authoredControls=c,
        nativeSolveExecutedByThisReplay=False)
    if before!=methods() or INPUT.read_bytes()!=input_bytes or source['identities']!=load_source(ROOT)['identities']:
        raise ValueError('uniform slab comparison source/method/input changed during replay')
    return result

def capture_to(directory):
    directory=Path(directory);directory.mkdir(parents=True,exist_ok=True)
    c=read_controls();source=load_source(ROOT);request=changed_request(expected_control(source,c),c)
    request_file=directory/'uniform200.request.json';full_file=directory/'uniform200.full.json';capture_file=directory/'uniform200.capture.json'
    if any(p.exists() for p in [request_file,full_file,capture_file]):raise ValueError('capture output already exists; preserve prior actual evidence')
    request_file.write_bytes(encode(request));result=run(request,source,c['changedNativeCaseId'])
    summary=validate_full(result,request,source,c['changedNativeCaseId'])
    if source['identities']!=load_source(ROOT)['identities']:raise ValueError('native source changed during execution')
    full=encode(result);full_file.write_bytes(full)
    capture_file.write_bytes(encode({'schema':'str-full-native-control-capture/1','nativeCaseId':c['changedNativeCaseId'],
        'sourceSHA256':source['identities'],'request':request,'fullResultSHA256':sha(full),
        'summary':summary,'drawings':result['drawings']}))
    return {'nativeSolveExecuted':True,'fullResultSHA256':sha(full),'outputDirectory':str(directory)}

if __name__=='__main__':
    parser=argparse.ArgumentParser();group=parser.add_mutually_exclusive_group(required=True)
    group.add_argument('--write',action='store_true');group.add_argument('--check',action='store_true');group.add_argument('--capture-to',type=Path)
    args=parser.parse_args()
    if args.capture_to:print(json.dumps(capture_to(args.capture_to)))
    else:
        result=produce()
        if args.check:
            if json.loads(PROOF.read_bytes())!=result:raise SystemExit('stale uniform slab-law comparison')
        else:
            temporary=PROOF.with_suffix('.writing.json');temporary.write_bytes(encode(result));os.replace(temporary,PROOF)
        print(json.dumps({'changedCase':result['authoredControls']['changedNativeCaseId'],
            'commonUniformSlabOperators':result['constitutive']['uniformIsotropicSlabOperatorsMatch'],
            'maximumHeadComponentDifference':result['actualNativeResponseDifferences']['heads']['reactionKN_KNm']['absoluteDifference'],
            'materialQualified':result['materialQualified'],'nativeSolveExecutedByThisReplay':False}))
