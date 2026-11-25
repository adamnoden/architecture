"""Replay the actual south40 native controls and complete end-return alternatives."""
from __future__ import annotations
import argparse, copy, hashlib, json, os, tarfile
from pathlib import Path

from floor_section_model import load_source
from floor_section_proof import validate_full
from wet_bearing_refinement import compare_contacts
from wet_bearing_refinement_proof import expected_native_request
from wet_support_cage_comparison import comparison_settings
from wet_beam_rectangular_return import assess
from wet_beam_end_views import drawing

ROOT=Path(__file__).resolve().parents[3]
D=Path(__file__).resolve().parent
INPUT=D/'wet-beam-rectangular-return-inputs.json'
ARCHIVE=D/'wet-beam-end-native-captures.tar.xz'
PROOF=D/'wet-beam-end-development-proof.json'
DRAWING=D/'wet-beam-rectangular-return.svg'
METHODS=['project/str/studies/wet_beam_end_development_proof.py',
         'project/str/studies/wet_beam_rectangular_return.py','project/str/studies/wet_beam_end_views.py',
         'project/str/studies/wet_support_cage_comparison.py',
         'project/str/studies/continuous_rc_cage.py',
         'project/str/studies/wet_post_head_fan.py',
         'project/str/studies/wet_bearing_refinement.py',
         'project/str/studies/wet_bearing_refinement_proof.py',
         'project/str/studies/floor_section_proof.py',
         'project/str/studies/wet-support-cage-comparison-settings.json',
         'project/str/studies/wet-bearing-refinement-inputs.json']

def sha(data):return hashlib.sha256(data).hexdigest()
def methods():return {p:sha((ROOT/p).read_bytes()) for p in METHODS}

def read_controls():
    value=json.loads(INPUT.read_bytes())
    if (set(value)!={'schema','id','units','datum','nativeFamily','padWidthMm','padCentreOffsetsYMm',
        'bearingQuadratureOrders','endReturnMandrelMm','postTopLevelRaiseMm','purpose',
        'bendPressureAccepted','beamEndDRegionAccepted','comparisonEndMandrelsMm',
        'strutCotangentComparisons','reviewBoundaryPolicy'}
        or value['schema']!='str-wet-beam-rectangular-return-input/1'
        or value['id']!='STR/WET-CAGE/beam/rectangular-return-development'
        or value['units']!='mm-kN-kNm' or value['datum']!='source-ground-zero'
        or value['nativeFamily']!='wet-aligned-concrete27'
        or value['purpose']!='unadopted-geometry-and-same-case-force-development'
        or value['bendPressureAccepted'] or value['beamEndDRegionAccepted']
        or value['bearingQuadratureOrders']!=[32,64]
        or value['reviewBoundaryPolicy']!='first-actual-cut-at-or-beyond-south-pad-centre-plus-beam-depth'):
        raise ValueError('explicit supported source-bound end-development controls required')
    return value

def expected_case(source,controls,order):
    if order not in controls['bearingQuadratureOrders']:raise ValueError('unsupported authored quadrature')
    value=expected_native_request('wet-aligned-concrete27-quadrature'+str(order),source)
    value['wetSupport']['padWidthMm']=controls['padWidthMm']
    value['wetSupport']['padCentreOffsetsYMm']=copy.deepcopy(controls['padCentreOffsetsYMm'])
    return value

def load_captures(source,controls):
    raw=ARCHIVE.read_bytes();natives={};provenance={}
    with tarfile.open(ARCHIVE,mode='r:xz') as tar:
        manifest=json.load(tar.extractfile('archive-manifest.json'))
        if manifest['nativeCageMassFeedbackApplied'] or manifest['nativeFrameOrContactResistanceAccepted']:
            raise ValueError('native archive overclaims its scope')
        for name,identity in manifest['files'].items():
            if Path(name).name!=name:raise ValueError('nonlocal native archive member')
            data=tar.extractfile(name).read()
            if len(data)!=identity['bytes'] or sha(data)!=identity['sha256']:raise ValueError('native archive member changed: '+name)
        for order in controls['bearingQuadratureOrders']:
            stem='south40-q'+str(order)
            full=tar.extractfile(stem+'.full.json').read();capture=tar.extractfile(stem+'.capture.json').read()
            native=json.loads(full);receipt=json.loads(capture);case=expected_case(source,controls,order)
            name='WET120-SOUTH40-q'+str(order)
            summary=validate_full(native,case,source,name)
            if (receipt['fullResultSHA256']!=sha(full) or receipt['nativeCaseId']!=name
                or receipt['sourceSHA256']!=source['identities'] or receipt['request']!=case or receipt['summary']!=summary):
                raise ValueError('actual current native/capture join failed')
            natives[order]=native
            provenance[str(order)]={'caseId':name,'fullNativeResponseSHA256':sha(full),'captureManifestSHA256':sha(capture)}
    return natives,{'archiveSHA256':sha(raw),'controls':provenance}

def summary(result):
    comparisons=[(r,c) for r in result['sameCaseCutComparisons']['cuts'] for c in r.get('comparisons',[])]
    governor=max(comparisons,key=lambda pair:pair[1]['necessaryMandrelComparisonMm']) if comparisons else None
    return {'candidateCageGeometrySHA256':result['candidateCageGeometrySHA256'],
        'loopGeometry':[{key:p[key] for key in ['id','endReturnMandrelMm','lapRampMandrelMm','southLowerStraightTangentYMm',
                         'northLowerStraightTangentYMm','sourceTopAndBottomRowsZMm','lapIntervalYMm','coldBendRampIntervalYMm',
                         'centrelineLengthUpperMm']} for p in result['mainBars'] if p['kind']=='beam-main-loop'],
        'geometry':{'checkedIndependentPathPairs':result['collisions']['checkedIndependentPathPairs'],
                    'independentPathFailures':result['collisions']['failedPairCount'],
                    'internalClosureFailures':len(result['internalClosures']['failures']),
                    'coverFailures':len(result['cover']['failedPaths']),
                    'minimumReportedPairClearanceLowerMm':min(p['clearanceLowerMm'] for p in result['collisions']['governing']),
                    'minimumAdverseCoverLowerMm':min(p['minimumAdverseCoverLowerMm'] for p in result['cover']['paths'])},
        'quantities':result['quantities'],'sourceCutComparisons':result['sameCaseCutComparisons'],
        'supportedNominalMandrelGovernor':None if governor is None else {'sourceCut':governor[0]['simultaneousSourceCut'],'comparison':governor[1]},
        'postFan':{'status':result['sameCasePostHeadFan']['status'],'posts':[
                    {'id':p['id'],'necessaryPlacementDomain':p['necessaryPlacementDomain'],
                     'fanStatus':p['fan']['status'],'ties':p['fan'].get('ties',[])}
                    for p in result['sameCasePostHeadFan']['posts']]},
        **{k:result[k] for k in ['geometryChecksAvailable','nativeSolveExecuted','nativeCageMassFeedbackApplied','candidateAccepted',
                               'beamEndDRegionAccepted','bendPressureAccepted','bondAndAnchorageAccepted','toleranceDomainAccepted',
                               'completeSignedLoadEnvelope','continuousCutEnvelopeAvailable']}}

def produce():
    before=methods();input_bytes=INPUT.read_bytes();controls=read_controls();source=load_source(ROOT)
    natives,provenance=load_captures(source,controls)
    settings=comparison_settings();settings['postTopLevelRaiseMm']=controls['postTopLevelRaiseMm']
    criteria=json.loads((D/'wet-bearing-refinement-inputs.json').read_bytes())['criteria']
    refinement=compare_contacts(natives[32],natives[64],criteria)
    candidates={};drawing_text=None
    for mandrel in controls['comparisonEndMandrelsMm']:
        actual=assess(natives[64],json.loads((D/'current-house-grid.json').read_bytes()),settings,
                      mandrel,controls['strutCotangentComparisons'],with_geometry=True)
        candidates[str(mandrel)]=summary(actual)
        if mandrel==controls['endReturnMandrelMm']:drawing_text=drawing(actual)
    if before!=methods() or INPUT.read_bytes()!=input_bytes or source['identities']!=load_source(ROOT)['identities']:
        raise ValueError('end-development source/method changed during replay')
    if drawing_text is None:raise ValueError('primary authored comparison not executed')
    result={'schema':'str-wet-beam-end-development-proof/1','nativeSourceSHA256':source['identities'],
            'processingMethodSHA256':before,'authoredInputSHA256':sha(input_bytes),'authoredControls':controls,
            'actualNativeProvenance':provenance,'drawingSHA256':sha(drawing_text.encode()),'current32To64Comparison':refinement,'candidates':candidates,
            'completeSignedLoadEnvelope':False,'beamEndDRegionAccepted':False,
            'scope':'Actually executed width120/south40 source58 native controls plus current complete alternative geometric and nominal straight-cut witnesses. Neither a continuous source-cut envelope nor compatible finite curved-bar/node transfer, actual anchorage, mass feedback or a selected assembly is established.'}
    return result,drawing_text

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--write',action='store_true');p.add_argument('--check',action='store_true');a=p.parse_args()
    if not a.write and not a.check:p.error('--write or --check required')
    result,drawing_text=produce();text=json.dumps(result,indent=2,allow_nan=False)+'\n'
    if a.check:
        if json.loads(PROOF.read_bytes())!=result or DRAWING.read_text()!=drawing_text:raise SystemExit('stale end-development proof/drawing')
    else:
        drawing_temp=DRAWING.with_suffix('.writing.svg');drawing_temp.write_text(drawing_text);os.replace(drawing_temp,DRAWING)
        temporary=PROOF.with_suffix('.writing.json');temporary.write_text(text);os.replace(temporary,PROOF)
    print(json.dumps({'contactRefinementPassing':result['current32To64Comparison']['numericalRefinementPassing'],
        'candidates':{key:{'geometry':v['geometry'],'supportedNominalMandrelGovernor':v['supportedNominalMandrelGovernor']}
                      for key,v in result['candidates'].items()}}))
