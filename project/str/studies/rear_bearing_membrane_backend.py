"""Exact failed rear-component backend comparison; no house-force reuse."""
import argparse,hashlib,json,math,subprocess,zipfile
from pathlib import Path
ARTIFACT_SHA='9be9d30d90849fe4eef97e3799dd81cccb34d6afef6b3896abd7f2adade5083c'
EXACT={'project/str/studies/rear_direct_bearing.py':'7bb3dbf3ab6e4f6b05110be01c27968af9607202641a1fa5425fa868e6f34cc1','project/str/studies/rear_bearing_plan.py':'a005206e76ac1f778bb248f9b9e56c62cab9f2fd318d1cf2c402cc0ea68f6446'}
def read(path):return json.loads(Path(path).read_text())
def sha(path):return hashlib.sha256(Path(path).read_bytes()).hexdigest()
def write(path,v):Path(path).write_text(json.dumps(v,allow_nan=False))
class ComponentCaptured(Exception):pass
def main(folder):
    archive=folder/'retained-zero-W31.zip'
    if sha(archive)!=ARTIFACT_SHA:raise ValueError('Exact failed rear raw artifact changed')
    with zipfile.ZipFile(archive) as z:
        for name in ['zero-W31-paired-input.json','rear-pre-guard-checkpoint.json','new-distributed_floor_compatibility.py','new-perforated_floor_condensation.py']:
            if z.namelist().count(name)!=1:raise ValueError('Exact captured archive member required')
            (folder/name).write_bytes(z.read(name))
    packet=read(folder/'zero-W31-paired-input.json');checkpoint=read(folder/'rear-pre-guard-checkpoint.json')
    for p,h in EXACT.items():
        if sha(p)!=h:raise ValueError('Physical producer or plan changed')
    for row in packet['sourceReview']:
        source=folder/('new-'+Path(row['path']).name)
        if sha(source)!=row['newSHA256']:raise ValueError('Captured native method bytes changed')
        Path(row['path']).write_bytes(source.read_bytes())
    # No native imports before the recorded two-method transition.
    from floor_section_model import load_source
    from current_finite_rc_joint import method_identities,runtime_versions
    if load_source(Path('.'))['identities']!=packet['sourceSHA256'] or method_identities(Path('.'))!=packet['methodSHA256'] or runtime_versions()!=packet['runtime']:
        raise ValueError('Exact captured native58/finite6/runtime required')
    from rear_bearing_interface_probe import diagnose
    import finite_joint_membrane_trace as trace
    from rear_direct_bearing import run_rear_direct_bearing
    compile_original=trace.compile_perforated_floor;captured={}
    def capture(*args,**kwargs):
        captured.update(args=args,kwargs=kwargs)
        write(folder/'exact-membrane-compile-input.json',{'args':args,'kwargs':kwargs})
        captured['python']=compile_original(*args,**kwargs)
        raise ComponentCaptured()
    try:
        trace.compile_perforated_floor=capture
        try:run_rear_direct_bearing(packet['nativeCase'],packet['choices'],packet['settings'],Path('.'),folder/'unused-checkpoint.json')
        except ComponentCaptured:pass
        else:raise ValueError('Expected actual finite exterior component interception before solid/global solve')
    finally:trace.compile_perforated_floor=compile_original
    actual=checkpoint['postprocessingModel']['joinedFloor']['floor'];python=captured['python']
    geometry=['ports','meshTrianglesXYMm','coordinateColumns','bands','omissionsXYMm','unqualifiedLaw']
    for key in geometry+['condensedStiffnessKNPerMm','condensedForceKN']:
        if actual[key]!=python[key]:raise ValueError('Rebuilt operator differs from EXACT captured component: '+key)
    sparse=compile_original(*captured['args'],**{**captured['kwargs'],'numerical_backend':'scipy-sparse'})
    for key in geometry:
        if sparse[key]!=python[key]:raise ValueError('Backend changed physical geometry/law/maps: '+key)
    model=checkpoint['postprocessingModel'];raw=checkpoint['rawResponse'];mid=3270.
    def diagnostic(component):
        shadow={**model,'joinedFloor':{**model['joinedFloor'],'floor':component}}
        return diagnose(shadow,raw,mid)
    py_diag=diagnostic(python);sp_diag=diagnostic(sparse)
    maximum_k=max(abs(a-b) for r,s in zip(python['condensedStiffnessKNPerMm'],sparse['condensedStiffnessKNPerMm']) for a,b in zip(r,s))
    maximum_f=max(abs(a-b) for a,b in zip(python['condensedForceKN'],sparse['condensedForceKN']))
    magnitude=max(1.,max(abs(v) for r in python['condensedStiffnessKNPerMm'] for v in r))
    if maximum_k/magnitude>1e-8 or maximum_f>1e-6:raise ValueError('Existing backends fail bounded same-operator equivalence')
    if max(abs(v) for v in sp_diag['actualCompleteWrenchResidualKN_KNm'])>1e-5:raise ValueError('Existing sparse operator still fails original guard on exact captured physical displacement')
    write(folder/'exact-python-component.json',python);write(folder/'exact-sparse-component.json',sparse)
    summary={'schema':'str-rear-exact-membrane-backend-comparison/1','capturedArtifactId':15124951816,'capturedArchiveSHA256':ARTIFACT_SHA,
        'sourceCommit':subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip(),
        'sameActualCapturedPythonOperatorAndForceExactly':True,'sameGeometryLawPortMapsPressure':True,
        'pythonPolicy':python['numericalCondensation'],'sparsePolicy':sparse['numericalCondensation'],
        'python':py_diag,'sparseOnCapturedDisplacement':sp_diag,'maximumKDifferenceKNPerMm':maximum_k,'relativeMaximumKDifference':maximum_k/magnitude,'maximumForceDifferenceKN':maximum_f,
        'sourceSHA256':packet['sourceSHA256'],'methodSHA256':packet['methodSHA256'],'runtime':packet['runtime'],
        'noGlobalSolvePerformed':True,'freshSparseHouseStillRequired':True,
        'sourceAccountMigrationRequired':True,'candidateAccepted':False,'strengthAccepted':False,'ownerAccepted':False}
    write(folder/'exact-backend-summary.json',summary)
    print('REAR_EXACT_BACKEND_SUMMARY '+json.dumps(summary,allow_nan=False),flush=True)
if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--folder',type=Path,required=True);main(p.parse_args().folder)
