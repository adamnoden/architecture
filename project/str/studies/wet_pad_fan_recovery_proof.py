"""Authenticate retained actual pads, then replay current shared fan mechanics.

No new native solve. Retained cropped inputs cannot reconstruct full responses;
the immutable upstream Git archives preserve those original bytes separately.
"""
from __future__ import annotations
import argparse, copy, hashlib, io, json, subprocess, tarfile
from pathlib import Path

from floor_section_model import load_source
from floor_section_proof import validate_full
from wet_bearing_refinement import assess_contact, compare_contacts
from wet_bearing_refinement_proof import crop_native, pack_native, unpack_native, expected_native_request
from wet_post_head_duties import post_duty
from wet_post_head_fan import cage_geometry_digest
from wet_post_head_fan_driver import recover_request
from wet_support_cage_comparison import build_paths, comparison_settings

ROOT=Path(__file__).resolve().parents[3]
D=Path(__file__).resolve().parent
PROOF=D/'wet-pad-fan-recovery-proof.json'
METHODS=[
 'project/str/studies/wet_pad_fan_recovery_proof.py',
 'project/str/studies/wet_post_head_fan.py','project/str/studies/wet_post_head_fan_driver.py',
 'project/str/studies/wet_support_cage_comparison.py','project/str/studies/wet_post_head_duties.py',
 'project/str/studies/wet_bearing_refinement.py','project/str/studies/wet_bearing_refinement_proof.py',
 'project/str/studies/floor_section_proof.py','project/str/studies/wet-bearing-refinement-inputs.json',
 'project/str/studies/wet-support-cage-comparison-settings.json',
 'compiler/reference-house/current-design/structural-wet-post-head-fan.ts',
 'compiler/reference-house/current-design/structural-wet-support-cage.ts',
]
EVIDENCE_REF='1aaf2f2961bebd67b3944ddc0c85b13120fd5115'
ARCHIVES={
 'width120':{'repositoryPath':'project/str/studies/captures/wet-pad-width120-20261123.tar.gz',
   'sha256':'adfc099abd34c10fa82b06386638f8284988bc6b58692221a31e68c789852ee8',
   'gitBlob':'1b988d5f1886f63b78f36535b6cff03f623bbe4c','prefix':'ovid-wet-pad-width120-20261123/',
   'manifest':'checkpoint-manifest.json'},
 'alternatives':{'repositoryPath':'project/str/studies/captures/wet-pad-development-20261123.tar.xz',
   'sha256':'2ed13dfb0b1d4ceda5e251567521e679cd72e9807641eabb22ec74a10c081691',
   'gitBlob':'0695409ce8288329580e2ad174a5007af236c367','prefix':'','manifest':'durable-capture-manifest.json'},
}
CASES={'width120-q32':('width120',120,32,'width120-q32'),
       'width120-q64':('width120',120,64,'width120-q64'),
       'width140-q64':('alternatives',140,64,'width140'),
       'width220-q64':('alternatives',220,64,'width220')}

def sha(data):return hashlib.sha256(data).hexdigest()
def encoded(value):return json.dumps(value,sort_keys=True,separators=(',',':'),allow_nan=False).encode()
def methods():return {p:sha((ROOT/p).read_bytes()) for p in METHODS}

def archive(path,which):
    spec=ARCHIVES[which];raw=Path(path).read_bytes()
    blob=hashlib.sha1(b'blob '+str(len(raw)).encode()+b'\0'+raw).hexdigest()
    if sha(raw)!=spec['sha256'] or blob!=spec['gitBlob']:raise ValueError('immutable archive identity mismatch: '+which)
    with tarfile.open(fileobj=io.BytesIO(raw),mode='r:*') as tar:
        manifest=json.load(tar.extractfile(spec['prefix']+spec['manifest']))
        files={}
        for name,entry in manifest['files'].items():
            if Path(name).name!=name:raise ValueError('nonlocal manifest entry')
            data=tar.extractfile(spec['prefix']+name).read()
            if len(data)!=entry['bytes'] or sha(data)!=entry['sha256']:raise ValueError('archive file identity mismatch: '+name)
            files[name]=data
    return files

def crop(native):
    result=crop_native(native)
    result.update(candidateAccepted=False,completeHouseProof=False)
    for row,post in zip(result['seatedWetSupport']['posts'],native['seatedWetSupport']['posts']):
        row['sourceGridMemberId']=post['sourceGridMemberId']
    return result

def expected(name,source):
    _,width,order,_=CASES[name]
    result=expected_native_request('wet-aligned-concrete27-quadrature'+str(order),source)
    result['wetSupport']['padWidthMm']=width
    return result

def fan(native,settings):
    main,links=build_paths(native['seatedWetSupport'],settings)
    cage={'settings':settings,'mainBars':main,'links':links,
          'nativeSourceSHA256':native['sourceSHA256'],'nativeCaseId':native['nativeVertical']['native']['caseId']}
    binding={'sourceSHA256':native['sourceSHA256'],'request':native['request'],'nativeCaseId':cage['nativeCaseId']}
    result=recover_request({'schema':'str-wet-head-fan-request/1','native':native,'cage':cage,'binding':binding})['result']
    return result,cage_geometry_digest(cage)

def fan_summary(result):
    return {'status':result['status'],'posts':[
        {'id':p['id'],'geometry':p['geometry'],'necessaryPlacementDomain':p['necessaryPlacementDomain'],
         'fanStatus':p['fan']['status'],'ties':p['fan'].get('ties',[]),
         'minimumBranchWeight':p['fan'].get('minimumBranchWeight'),
         'freeBodyResidualKN_KNm':p.get('fullFreeBodyResidualKN_KNm'),
         'diagnostics':p['fan'].get('diagnostics',[])} for p in result['posts']],
        **{key:result[key] for key in ['finiteCCTNodesAccepted','anchorageAccepted','fullSectionContinuationAccepted',
                                      'toleranceDomainAccepted','resistanceAccepted','completeSignedLoadEnvelope']}}

def evaluate(natives,settings,source):
    criteria=json.loads((D/'wet-bearing-refinement-inputs.json').read_bytes())['criteria']
    records={};reference=None
    for name,native in natives.items():
        if native['sourceSHA256']!=source['identities'] or native['request']!=expected(name,source):
            raise ValueError('not the current independently derived actual control: '+name)
        result,geometry=fan(native,settings)
        if reference is not None and reference!=geometry:raise ValueError('pad comparison changed actual cage geometry')
        reference=geometry
        contact=assess_contact(native,criteria)
        compliance=native['request']['wetSupport']['jointNormalComplianceMmPerMPa']
        pressures=[]
        for post in contact['posts']:
            x0,y0,x1,y1=post['padRectangleXYMm'];plane=post['reconstructedActualGapPlaneMm']
            pressures.append({'id':post['id'],'maximumDeclaredAffinePressureMPa':
                max(max(0.,-(plane[0]+plane[1]*x+plane[2]*y)/compliance)
                    for x in (x0,x1) for y in (y0,y1)),
                'physicalPressureResistanceAccepted':False})
        records[name]={'fan':fan_summary(result),'cageGeometrySHA256':geometry,
                       'postGrossSectionDuties':[post_duty(p) for p in native['seatedWetSupport']['posts']],
                       'actualAffinePressureComparisons':pressures,'contact':contact}
    return {'controls':records,'width120Order32To64':compare_contacts(natives['width120-q32'],natives['width120-q64'],criteria)}

def write(width120,alternatives):
    before=methods();source=load_source(ROOT)
    files={'width120':archive(width120,'width120'),'alternatives':archive(alternatives,'alternatives')}
    settings=comparison_settings();settings['postTopLevelRaiseMm']=10.
    archived=json.loads(files['width120']['width120-q64.cage.json'])['settings']
    if settings!=archived:raise ValueError('archived authored cage choices differ from explicit current10mm comparison')
    natives={};provenance={}
    for name,(group,_,_,stem) in CASES.items():
        full=files[group][stem+'.full.json'];capture=files[group][stem+'.capture.json'];manifest=json.loads(capture)
        native=json.loads(full);case=expected(name,source);identity=native['nativeVertical']['native']['caseId']
        summary=validate_full(native,case,source,identity)
        if (manifest['fullResultSHA256']!=sha(full) or manifest['sourceSHA256']!=source['identities']
            or manifest['request']!=case or manifest['nativeCaseId']!=identity or manifest['summary']!=summary):
            raise ValueError('full native/capture manifest join failed: '+name)
        natives[name]=crop(native)
        provenance[name]={'fullNativeResponseSHA256':sha(full),'captureManifestSHA256':sha(capture),
                          'nativeCaseId':identity,'exactLosslessCroppedNative':pack_native(natives[name]),
                          'reconstructsCompleteNativeResponse':False}
    evaluated=evaluate(natives,settings,source)
    # Execute the actual shared Node cage and fan consumers on the complete120
    # response. This is postprocessing, never an invented fresh native solve.
    script="""import{readFileSync}from'node:fs';import{runWetSupportCageComparison}from'./compiler/reference-house/current-design/structural-wet-support-cage.ts';import{runWetPostHeadFan}from'./compiler/reference-house/current-design/structural-wet-post-head-fan.ts';const p=JSON.parse(readFileSync(0,'utf8'));const cage=runWetSupportCageComparison(p.native,p.settings);const fan=runWetPostHeadFan(p.native,cage);process.stdout.write(JSON.stringify({cageStatus:cage.status,cageGeometry:cage.geometry,fan}));"""
    shared_bytes=subprocess.check_output(['node','--import','tsx','--input-type=module','-e',script],cwd=ROOT,
        input=encoded({'native':json.loads(files['width120']['width120-q64.full.json']),'settings':settings}))
    shared=json.loads(shared_bytes);pure,_=fan(natives['width120-q64'],settings)
    if shared['cageStatus']!='computed-comparison' or any(shared['fan'].get(key)!=value for key,value in pure.items()):
        raise ValueError('current shared Node fan differs from pure current source replay')
    result={'schema':'str-current-wet-pad-fan-recovery-proof/1','nativeSourceSHA256':source['identities'],
            'processingMethodSHA256':before,'authoredCageComparisonSettings':settings,
            'upstreamEvidence':{'repository':'adamnoden/architecture','immutableRef':EVIDENCE_REF,'archives':ARCHIVES},
            'actualNativeCaptures':provenance,**evaluated,
            'sharedAdapterReplay':{'fullOutputSHA256':sha(shared_bytes),'sourceBoundCoreMatchesPure':True,
                                   'cageGeometry':shared['cageGeometry'],'nativeSolveExecuted':False},
            'completeSignedLoadEnvelope':False,'toleranceDomainAccepted':False,'resistanceAccepted':False,
            'wholeHouseAccepted':False,'nativeSolveExecuted':False,
            'scope':'Current methods replay immutable actually executed120/140/220 native controls. Lossless cropped mechanics inputs reproduce the retained comparisons, not omitted full response bytes. Positive virtual-domain containment is not a finite node, placement, anchorage or resistance pass.'}
    if before!=methods() or source['identities']!=load_source(ROOT)['identities']:raise ValueError('source changed during recovery')
    PROOF.write_text(json.dumps(result,indent=2,allow_nan=False)+'\n')
    check()
    return result

def check():
    value=json.loads(PROOF.read_bytes());source=load_source(ROOT)
    if (value['schema']!='str-current-wet-pad-fan-recovery-proof/1' or value['processingMethodSHA256']!=methods()
        or value['nativeSourceSHA256']!=source['identities'] or value['upstreamEvidence']!={'repository':'adamnoden/architecture','immutableRef':EVIDENCE_REF,'archives':ARCHIVES}
        or any(value[k] for k in ['completeSignedLoadEnvelope','toleranceDomainAccepted','resistanceAccepted','wholeHouseAccepted','nativeSolveExecuted'])
        or value['sharedAdapterReplay']['nativeSolveExecuted'] or not value['sharedAdapterReplay']['sourceBoundCoreMatchesPure']):
        raise ValueError('stale or overclaimed current pad recovery proof')
    natives={name:unpack_native(record['exactLosslessCroppedNative']) for name,record in value['actualNativeCaptures'].items()}
    for name,record in value['actualNativeCaptures'].items():
        if record['reconstructsCompleteNativeResponse'] or record['nativeCaseId']!=natives[name]['nativeVertical']['native']['caseId']:
            raise ValueError('cropped case identity/extent mismatch')
    evaluated=evaluate(natives,value['authoredCageComparisonSettings'],source)
    if any(value[key]!=record for key,record in evaluated.items()):raise ValueError('current retained mechanics do not reproduce')
    return {'numerical120Order32To64':value['width120Order32To64']['numericalRefinementPassing'],
            'minimumPlacementReserve120Mm':min(p['necessaryPlacementDomain']['minimumReserveMm'] for p in value['controls']['width120-q64']['fan']['posts'])}

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--write',action='store_true');p.add_argument('--check',action='store_true')
    p.add_argument('--width120-archive',type=Path);p.add_argument('--alternatives-archive',type=Path);a=p.parse_args()
    if a.write:
        if not a.width120_archive or not a.alternatives_archive:p.error('both immutable archive files required')
        write(a.width120_archive,a.alternatives_archive)
    elif not a.check:p.error('--write or --check required')
    print(json.dumps(check()))
