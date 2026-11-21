"""Execute signed roof pressures through the SAME actual A/RC200/52-head model."""
import copy
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import time

from masonry_frame_a import load_masonry_frame_a_source,run_masonry_frame_a
from masonry_frame_a_proof import numerical_case,summarize,_audit_head_wrench
from roof_floor_compatibility import load_roof_only_source,build_roof_only_operator
from roof_surface_pressure import reference_roof_surface_pressure_settings,roof_surface_rows

ROOT=Path(__file__).resolve().parents[3]


def pressure_controls(source):
    base=numerical_case(source)
    operator=build_roof_only_operator(load_roof_only_source(ROOT))
    settings=reference_roof_surface_pressure_settings(operator)
    controls=[('default-null',copy.deepcopy(base))]
    suction=copy.deepcopy(base);suction['roofCoupling']['roofSurfacePressure']=copy.deepcopy(settings)
    suction['roofCoupling']['roofSurfacePressure']['uniformKPa']=-2.25
    controls.append(('uniform-suction',suction))
    half=copy.deepcopy(suction)
    for row in roof_surface_rows(operator):half['roofCoupling']['roofSurfacePressure']['rowMultipliers'][row['id']]=float(row['pointXYZMm'][0]<6000)
    half['verticalCase']['monolithicCase']['houseCase']['joinedCase']['floor']['boundaryCase']['windIndex']=79
    controls.append(('half-roof-suction-court-W79',half))
    positive=copy.deepcopy(base);positive['roofCoupling']['roofSurfacePressure']=copy.deepcopy(settings)
    positive['roofCoupling']['roofSurfacePressure']['uniformKPa']=1.5
    controls.append(('positive-PLAN-pressure',positive))
    adverse=copy.deepcopy(suction);adverse['verticalCase']['monolithicCase']['houseCase']['boundary']['physicalGFactor']=0.
    controls.append(('suction-zero-physical-G',adverse))
    return controls


def verify_change_propagation(result):
    cases={row['controlName']:row for row in result['cases']};comparisons=[]
    if 'default-null' not in cases:return comparisons
    baseline=cases['default-null']
    for name in ('uniform-suction','positive-PLAN-pressure'):
        if name not in cases:continue
        case=cases[name]
        if case['mass']!=baseline['mass']:raise ValueError('Signed surface pressure changed physical mass')
        before={r['id']:r['reactionKN_KNm'] for r in baseline['headWrenches']}
        delta=max(abs(x-y) for row in case['headWrenches'] for x,y in zip(before[row['id']],row['reactionKN_KNm']))
        if delta<1e-6:raise ValueError('Actual52head response did not consume changed roof pressure')
        pressure=case['roofCoupling']['roofSurfacePressure']
        difference=[a-b-c for a,b,c in zip(case['externalWrenchKN_KNm'],baseline['externalWrenchKN_KNm'],pressure['pressureWrenchKN_KNm'])]
        if max(map(abs,difference))>1e-6:raise ValueError('Actual joined external load change does not equal the separate physical roof-pressure wrench')
        if len(pressure['actualLocalActions'])!=24:raise ValueError('Missing combined-load primary cuts')
        comparisons.append({'controlName':name,'maximum52HeadComponentChangeKN_KNm':delta,
            'physicalGUnchanged':True,'additionalExternalPressureWrenchResidualKN_KNm':difference})
    return comparisons


def proof(output,extra_only=False):
    source=load_masonry_frame_a_source(ROOT);controls=pressure_controls(source)
    if extra_only:controls=controls[2:]
    result={'schema':'str-roof-surface-pressure-proof/1','sourceSHA256':source['identities'],
        'methodSHA256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
        'expectedControls':[name for name,_ in controls],
        'coverage':'three-additional-controls-only' if extra_only else 'five-joined-controls',
        'scope':'Executed mechanical load controls, independently authored from facade wind. No site wind/snow, weather adoption or installed resistance qualification.',
        'cases':[],'candidateAccepted':False,'completeHouseProof':False}
    for name,case in controls:
        start=time.monotonic();print('START '+name,flush=True)
        # Release the complete native frame/condensation graph at worker exit;
        # do not retain its cyclic Python objects through the next control.
        with tempfile.TemporaryDirectory(prefix='roof-surface-control-') as directory:
            response=Path(directory)/'response.json'
            subprocess.run([sys.executable,'-B',str(Path(__file__).resolve()),'--solve-control',name,str(response)],check=True)
            solved=json.loads(response.read_text())
            if solved['sourceSHA256']!=source['identities'] or solved['request']!=case:raise ValueError('Worker changed the source or authored pressure request')
            if case['roofCoupling']['roofSurfacePressure'] is not None:
                shutil.copyfile(response,output.with_name(output.stem+'-'+name+'-full.json'))
        summary=summarize(solved);_audit_head_wrench(summary)
        summary['controlName']=name;summary['executedRequest']=case;result['cases'].append(summary)
        output.write_text(json.dumps(result,indent=2,sort_keys=True,allow_nan=False)+'\n')
        svg=solved['drawings']['masonry-frame-a-roof.svg']
        output.with_name(output.stem+'-'+name+'.svg').write_text(svg)
        print(json.dumps({'case':name,'seconds':time.monotonic()-start,
            'minimumHeadKN':summary['minimumHeadVerticalKN'],
            'maxRoofMm':summary['roofCoupling']['maximumRingTranslationMm'],
            'surfaceKN':None if summary['roofCoupling']['roofSurfacePressure'] is None else summary['roofCoupling']['roofSurfacePressure']['verticalDownKN'],
            'equilibrium':summary['equilibriumResidualKN_KNm'],
            'roofWorkResidual':summary['roofCoupling']['roofPhysicalWorkRelativeResidual']}),flush=True)
    if len(result['cases'])!=len(controls):raise ValueError('Missing actual joined pressure controls')
    result['changePropagation']=verify_change_propagation(result)
    output.write_text(json.dumps(result,indent=2,sort_keys=True,allow_nan=False)+'\n')
    return result


def solve_one_control(name,output):
    source=load_masonry_frame_a_source(ROOT);cases=dict(pressure_controls(source))
    if name not in cases:raise ValueError('Unknown authored roof-pressure control')
    result=run_masonry_frame_a(cases[name],source,'roof-surface-'+name)
    if source['identities']!=load_masonry_frame_a_source(ROOT)['identities']:raise ValueError('Source changed during pressure solve; stale result is not written')
    output.write_text(json.dumps(result,allow_nan=False)+'\n')


def join_fresh_native_controls(output,native_path,extra_path):
    """Reuse only exact current-source/executed-request native controls."""
    source=load_masonry_frame_a_source(ROOT);controls=pressure_controls(source)
    native=json.loads(native_path.read_text());extra=json.loads(extra_path.read_text())
    method_hash=hashlib.sha256(Path(__file__).read_bytes()).hexdigest()
    if native.get('schema')!='str-masonry-frame-a-proof/1' or extra.get('schema')!='str-roof-surface-pressure-proof/1':raise ValueError('Expected exact native and additional roof proof families')
    if any(value.get('sourceSHA256')!=source['identities'] for value in (native,extra)) or extra.get('methodSHA256')!=method_hash:raise ValueError('Stale source/method proof cannot be reused')
    if extra.get('expectedControls')!=[name for name,_ in controls[2:]] or len(extra['cases'])!=3:raise ValueError('Missing fresh additional pressure cases')
    result=copy.deepcopy(extra);result['cases']=[];result['expectedControls']=[name for name,_ in controls]
    result['coverage']='five-joined-controls-with-exact-native-reuse'
    for index,(name,request) in enumerate(controls):
        if index<2:
            suffix='/'+('baseline' if index==0 else 'roof-plan-uniform-minus2p25')
            matches=[row for row in native['cases'] if row['caseId'].endswith(suffix)]
        else:matches=[row for row in extra['cases'] if row['controlName']==name]
        if len(matches)!=1 or matches[0].get('executedRequest')!=request:raise ValueError('Fresh proof executed-request mismatch: '+name)
        row=copy.deepcopy(matches[0]);row['controlName']=name;_audit_head_wrench(row);result['cases'].append(row)
    result['reusedNativeEvidence']={'schema':native['schema'],'path':str(native_path),
        'sha256':hashlib.sha256(native_path.read_bytes()).hexdigest(),'caseCount':2,
        'binding':'Exact current source inventory and every authored executed-request field; no result/hash patching'}
    result['changePropagation']=verify_change_propagation(result)
    output.write_text(json.dumps(result,indent=2,sort_keys=True,allow_nan=False)+'\n')
    return result


if __name__=='__main__':
    if len(sys.argv)==4 and sys.argv[1]=='--solve-control':
        solve_one_control(sys.argv[2],Path(sys.argv[3]));raise SystemExit(0)
    path=Path(sys.argv[1]) if len(sys.argv)>1 else Path(__file__).with_name('roof-surface-pressure-proof.json')
    if '--join-native' in sys.argv:
        i=sys.argv.index('--join-native');join_fresh_native_controls(path,Path(sys.argv[i+1]),Path(sys.argv[i+2]))
    else:proof(path,extra_only='--extra-only' in sys.argv[2:])
