"""Replay cage geometry and simultaneous actions from verified native captures.

This producer never executes a native solve. CI replays exact retained cage
inputs and joins source/request/full-result identities to the canonical floor
receipt; full-capture verification additionally needs the external capture files.
"""
import argparse
import copy
import hashlib
import json
from pathlib import Path

import floor_section_proof as floor
import wet_support_cage_comparison as cage

D=Path(__file__).resolve().parent
ROOT=D.parents[2]
PROOF=D/'wet-support-cage-comparison-proof.json'
SCHEMA='str-wet-support-cage-comparison-proof/1'
PROCESSING_FILES=('project/str/studies/wet_support_cage_comparison_proof.py',
    'project/str/studies/wet_support_cage_comparison.py',
    'project/str/studies/wet-support-cage-comparison-settings.json',
    'project/str/studies/floor_section_proof.py')


def digest(value):
    return hashlib.sha256(json.dumps(value,sort_keys=True,separators=(',',':'),allow_nan=False).encode()).hexdigest()


def processing_sources():
    return {name:floor.file_sha(ROOT/name) for name in PROCESSING_FILES}


def capture_relative_directory(source,name,request):
    # Exact existing native-capture addressing, not a new capture convention.
    identity=hashlib.sha256(json.dumps(source['identities'],sort_keys=True).encode()).hexdigest()
    request_identity=hashlib.sha256(json.dumps({'caseId':name,'request':request},sort_keys=True).encode()).hexdigest()
    return Path(identity)/(name+'-'+request_identity)


def minimal_support_input(wet):
    fields=('id','rectangleXYMm','physicalBottomZMm','physicalTopZMm','sourceGridMemberId')
    posts=[]
    for p in wet['posts']:
        posts.append({**{k:copy.deepcopy(p[k]) for k in fields},
            'recovery':{'physicalEndWrenchesKN_KNmm':copy.deepcopy(p['recovery']['physicalEndWrenchesKN_KNmm'])}})
    return {'settings':copy.deepcopy(wet['settings']),'posts':posts}


def minimal_native_input(native):
    """Retain exactly the currently consumed geometry, actions and source IDs."""
    rows=native['nativeVertical']['native']
    cut_fields=('memberId','end','physicalPointMm','breadthMm','depthMm','axialCompressionKN',
        'shearYKN','shearZKN','torsionKNm','bendingYKNm','bendingZKNm')
    def cuts(key):
        return [{k:copy.deepcopy(r[k]) for k in cut_fields} for r in rows[key]
            if r['memberId'].startswith('WET-SUPPORT/beam/')]
    return {'sourceSHA256':copy.deepcopy(native['sourceSHA256']),
        'seatedWetSupport':minimal_support_input(native['seatedWetSupport']),
        'nativeVertical':{'native':{'caseId':rows['caseId'],
            'memberCuts':cuts('memberCuts'),'interiorMemberCuts':cuts('interiorMemberCuts')}}}


def beam_cut_origin_audit(support):
    audit=support['plateAttachmentAudit']
    keys=('allPlateAttachmentsAtRealBeamNodes','missingAttachmentCoordinatesYMm',
        'maximumAttachmentToNodeDistanceMm','physicalBeamElementCutsAvailable','completePhysicalBeamDemandEnvelopeAvailable')
    return {k:copy.deepcopy(audit[k]) for k in keys}


def check_beam_cut_origin(audit):
    if (audit.get('allPlateAttachmentsAtRealBeamNodes') is not True or audit.get('missingAttachmentCoordinatesYMm')!=[]
            or audit.get('maximumAttachmentToNodeDistanceMm',1)>1e-7 or audit.get('physicalBeamElementCutsAvailable') is not True
            or audit.get('completePhysicalBeamDemandEnvelopeAvailable') is not False):
        raise ValueError('Cage beam actions lack actual discrete nodal recovery or invent a complete envelope')


def projection(native,grid,settings):
    result=cage.assess(native,grid,settings,with_collisions=False)
    # Caller has verified raw grid bytes against the actual native source tuple.
    result['rawGridIdentityVerified']=True
    return result


def geometry_inputs(result,native,grid,settings):
    return {'mainBars':result['mainBars'],'links':result['links'],
        'sourceSolids':cage.support_solids(native['seatedWetSupport'],grid),'settings':settings}


def geometry_evidence(inputs):
    return {'collisions':cage.collision_report(inputs['mainBars'],inputs['links'],inputs['settings']),
        'internalClosures':cage.internal_closure_report(inputs['mainBars'],inputs['links'],inputs['settings']),
        'cover':cage.cover_report(inputs['mainBars']+inputs['links'],inputs['sourceSolids'],inputs['settings'])}


def without_paths(result):
    return {k:v for k,v in result.items() if k not in ('mainBars','links')}


def source_and_grid():
    source=floor.load_source(ROOT)
    raw=(D/'current-house-grid.json').read_bytes()
    if hashlib.sha256(raw).hexdigest()!=source['identities']['project/str/studies/current-house-grid.json']:
        raise ValueError('Current grid bytes do not match native source identity')
    return source,json.loads(raw)


def verify_capture(captures,source,name,request):
    directory=Path(captures)/capture_relative_directory(source,name,request)
    request_path=directory/'request.json';full_path=directory/'result.full.json';manifest_path=directory/'capture.json'
    actual_request=json.loads(request_path.read_text());manifest=json.loads(manifest_path.read_text())
    if actual_request!=request or manifest.get('schema')!='str-full-native-control-capture/1':
        raise ValueError('Capture request/schema differs from actual current control: '+name)
    if manifest['sourceSHA256']!=source['identities'] or manifest['request']!=request or manifest['nativeCaseId']!=name:
        raise ValueError('Capture source/request/case identity differs: '+name)
    full_sha=floor.file_sha(full_path)
    if manifest['fullResultSHA256']!=full_sha:raise ValueError('Native full-result checksum differs: '+name)
    with full_path.open() as stream:native=json.load(stream)
    summary=floor.validate_full(native,request,source,name)
    if manifest['summary']!=summary or manifest['drawings']!=native['drawings']:
        raise ValueError('Capture manifest does not reproduce its full result: '+name)
    if request['wetSupport'] is not None:check_beam_cut_origin(beam_cut_origin_audit(native['seatedWetSupport']))
    binding={'nativeCaseId':name,'captureRelativeDirectory':str(capture_relative_directory(source,name,request)),
        'requestCanonicalSHA256':digest(request),'requestFileSHA256':floor.file_sha(request_path),
        'captureManifestSHA256':floor.file_sha(manifest_path),'fullResultSHA256':full_sha}
    return native,binding


def expected_controls(source):
    controls=floor.cases(source)
    if len(controls)!=11 or sum(request['wetSupport'] is not None for _,request in controls)!=7:
        raise ValueError('This receipt requires the actual11 controls, including7 wet-support cases')
    return controls


def check_inputs(proof,source=None,grid=None):
    if source is None:source,grid=source_and_grid()
    if proof['schema']!=SCHEMA or proof['sourceSHA256']!=source['identities'] or proof['processingSourceSHA256']!=processing_sources():
        raise ValueError('Stale cage native or processing source identity')
    settings=cage.comparison_settings()
    if proof['settings']!=settings or proof['settingsCanonicalSHA256']!=digest(settings):raise ValueError('Cage choices differ from versioned default')
    expected=expected_controls(source);rows=proof['controls']
    if len(rows)!=len(expected):raise ValueError('Missing actual cage control coverage')
    geometries={};wet_count=0
    for row,(name,request) in zip(rows,expected):
        if row['nativeCaseId']!=name or row['requestCanonicalSHA256']!=digest(request) or row['captureRelativeDirectory']!=str(capture_relative_directory(source,name,request)):
            raise ValueError('Cage row request/order differs from current control')
        for key in ('requestFileSHA256','captureManifestSHA256','fullResultSHA256'):
            if not isinstance(row[key],str) or len(row[key])!=64 or any(c not in '0123456789abcdef' for c in row[key]):raise ValueError('Missing actual capture identity')
        if request['wetSupport'] is None:
            if row['status']!='not-applicable-no-seated-wet-support' or set(row)!={'nativeCaseId','captureRelativeDirectory','requestCanonicalSHA256','requestFileSHA256','captureManifestSHA256','fullResultSHA256','status'}:
                raise ValueError('Non-wet predecessor fabricated cage evidence')
            continue
        wet_count+=1;native=row['exactAssessmentInput']
        check_beam_cut_origin(row['beamCutOriginAudit'])
        if row['status']!='assessed-incomplete-design' or row['exactAssessmentInputSHA256']!=digest(native):raise ValueError('Retained cage input checksum differs')
        if native['sourceSHA256']!=source['identities'] or native['nativeVertical']['native']['caseId']!=name or native['seatedWetSupport']['settings']!=request['wetSupport']:
            raise ValueError('Cage input does not represent its own actual support case')
        result=projection(native,grid,settings);inputs=geometry_inputs(result,native,grid,settings);key=digest(inputs)
        if row['geometryInputSHA256']!=key or row['assessment']!=without_paths(result):raise ValueError('Cage assessment differs from the same method/input row')
        if key not in geometries:geometries[key]=geometry_evidence(inputs)
        if any(result[k] is not False for k in ('cageAccepted','postBaseGridJointAccepted','beamEndDRegionAccepted','postHeadDRegionAccepted','completeSignedLoadEnvelope')):
            raise ValueError('Cage control fabricated physical acceptance')
    if proof['wetCaseCount']!=wet_count or proof['geometryChecks']!=geometries or proof['uniqueGeometryCheckCount']!=len(geometries):
        raise ValueError('Actual geometry deduplication/check evidence differs')
    if proof['completeHouseProof'] is not False or proof['cageAccepted'] is not False or proof['nativeSolvesExecuted']!=0:
        raise ValueError('Batch receipt fabricated house/design acceptance or native execution')
    return proof


def check_parent_join(proof,parent):
    if parent.get('schema')!='str-coupled-floor-section-proof/1' or parent['sourceSHA256']!=proof['sourceSHA256']:
        raise ValueError('Canonical11-case floor receipt is not current for this cage batch')
    controls=parent['controls']
    if len(controls)!=len(proof['controls']):raise ValueError('Canonical floor/cage control count differs')
    for actual,row in zip(controls,proof['controls']):
        name=row['nativeCaseId']
        if actual['nativeCaseId']!=name or actual['sourceSHA256']!=proof['sourceSHA256'] or digest(actual['executedRequest'])!=row['requestCanonicalSHA256']:
            raise ValueError('Canonical floor/cage source/request identity differs')
        if parent['fullResultCaptureSHA256ByCase'].get(name)!=row['fullResultSHA256']:
            raise ValueError('Canonical floor/cage native full-result checksum differs')
        if row['status']=='assessed-incomplete-design':
            support=actual['seatedWetSupport'];audit=beam_cut_origin_audit(support);check_beam_cut_origin(audit)
            if audit!=row['beamCutOriginAudit'] or minimal_support_input(support)!=row['exactAssessmentInput']['seatedWetSupport']:
                raise ValueError('Canonical floor/cage actual post wrench/geometry or beam-origin audit differs')
    return True


def write(captures):
    source,grid=source_and_grid();settings=cage.comparison_settings();rows=[];geometries={}
    for name,request in expected_controls(source):
        native,binding=verify_capture(captures,source,name,request)
        if request['wetSupport'] is None:
            rows.append({**binding,'status':'not-applicable-no-seated-wet-support'})
        else:
            retained=minimal_native_input(native);actual=projection(native,grid,settings);result=projection(retained,grid,settings)
            if result!=actual:raise ValueError('Minimal retained input does not reproduce full-capture cage projection: '+name)
            inputs=geometry_inputs(result,retained,grid,settings);key=digest(inputs)
            if key not in geometries:geometries[key]=geometry_evidence(inputs)
            rows.append({**binding,'status':'assessed-incomplete-design','exactAssessmentInput':retained,
                'exactAssessmentInputSHA256':digest(retained),'geometryInputSHA256':key,
                'beamCutOriginAudit':beam_cut_origin_audit(native['seatedWetSupport']),'assessment':without_paths(result)})
        print(name,'verified-native-capture',binding['fullResultSHA256'],flush=True)
        del native
    proof={'schema':SCHEMA,'sourceSHA256':source['identities'],'processingSourceSHA256':processing_sources(),
        'settings':settings,'settingsCanonicalSHA256':digest(settings),'controls':rows,
        'wetCaseCount':sum(r['status']=='assessed-incomplete-design' for r in rows),
        'geometryChecks':geometries,'uniqueGeometryCheckCount':len(geometries),'nativeSolvesExecuted':0,
        'cageAccepted':False,'completeHouseProof':False,
        'scope':'Current-source cage postprocessing of verified complete native captures. Each retained minimal input exactly reproduced the full-capture assess projection when written. Geometry reuse requires identical actual path/solid/settings inputs. Native input authentication is anchored by exact request/source/full-result capture checksums; CI replays retained inputs and joins these checksums to the canonical11-case floor receipt. Physical D-regions, full signed envelope, grid cage, bond/anchorage and installed mass remain unqualified.'}
    # Full current-input replay is intentionally independent of ancestor receipts.
    check_inputs(proof,source,grid)
    PROOF.write_text(json.dumps(proof,indent=2,allow_nan=False)+'\n')


if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    modes=parser.add_mutually_exclusive_group(required=True)
    modes.add_argument('--write',action='store_true');modes.add_argument('--check',action='store_true');modes.add_argument('--check-inputs',action='store_true');modes.add_argument('--check-captures',action='store_true')
    parser.add_argument('--captures-root',type=Path,default=Path('/tmp/ovid-seated-wet-controls'))
    args=parser.parse_args()
    if args.write:write(args.captures_root)
    else:
        proof=check_inputs(json.loads(PROOF.read_text()))
        if args.check:check_parent_join(proof,json.loads(floor.PROOF.read_text()))
        if args.check_captures:
            source,_=source_and_grid()
            for row,(name,request) in zip(proof['controls'],expected_controls(source)):
                native,binding=verify_capture(args.captures_root,source,name,request)
                if any(row[k]!=v for k,v in binding.items()):raise ValueError('Retained capture binding changed')
                if request['wetSupport'] is not None and minimal_native_input(native)!=row['exactAssessmentInput']:raise ValueError('Retained cage input differs from actual full capture')
                del native
