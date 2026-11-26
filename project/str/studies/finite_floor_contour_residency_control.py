"""Same assembled-operator control for bounded direct condensation residency.

The immutable predecessor is a numerical control, never a current input or a
fallback. Execute both condensations on the identical observed K/T/boundary/F.
"""
import argparse, hashlib, io, json, os, subprocess, tarfile, types
from pathlib import Path
import numpy as np
from scipy.linalg import eigvalsh
import finite_floor_contour_run as producer
from finite_floor_contour_ordering_control import sparse_identity, array_identity

def sha(raw): return hashlib.sha256(raw).hexdigest()

HISTORY_ANCHOR='f2acb9e7d7e07aca7108771ea594f38c4d633178'
HISTORY_OBJECTS={
 'project/str/studies/finite-floor-contour-residency-history.tar.xz':'70989262be4b97aecbf47047e2ad4ee0da54babd',
 'project/str/studies/fixed-normal-experiment-captures.tar.xz':'ad8c7c4a1734f2b43d0780bc99d23c238c3b98e5',
 'project/str/studies/four-l-joint-material-audit.json':'c7fc98758b2d9bdc3bb0b6b7a80b6397fe40b0f1',
}
PROVENANCE_FIELDS={'sourceAuditSHA256','captureSHA256','archiveSHA256','nativeSourceSHA256'}

def historical_source_control(root,raw):
    # This one immutable predecessor is historical performance evidence only.
    # Current geometry and sources still enter exclusively through source_input.
    def frozen(path):
        try:
            identity=subprocess.check_output(['git','rev-parse',HISTORY_ANCHOR+':'+path],cwd=root,text=True).strip()
            if path in HISTORY_OBJECTS and identity!=HISTORY_OBJECTS[path]:raise ValueError('changed frozen contour source object')
            return subprocess.check_output(['git','cat-file','blob',HISTORY_ANCHOR+':'+path],cwd=root)
        except subprocess.CalledProcessError as error:
            raise ValueError('exact frozen contour history source objects required') from error
    try:
        commit=subprocess.check_output(['git','rev-parse',HISTORY_ANCHOR+'^{commit}'],cwd=root,text=True).strip()
    except subprocess.CalledProcessError as error:
        raise ValueError('exact frozen contour history anchor required') from error
    if commit!=HISTORY_ANCHOR:raise ValueError('changed frozen contour history anchor')
    history=frozen('project/str/studies/finite-floor-contour-residency-history.tar.xz')
    if raw!=history:raise ValueError('original immutable contour history archive changed')
    audit_raw=frozen('project/str/studies/four-l-joint-material-audit.json');audit=json.loads(audit_raw)
    stock_raw=frozen('project/str/studies/fixed-normal-experiment-captures.tar.xz')
    with tarfile.open(fileobj=io.BytesIO(stock_raw),mode='r:xz') as tar:
        capture_ids={f'v{p}.full.json':sha(tar.extractfile(f'v{p}.full.json').read()) for p in [500,250]}
    native=audit['sourceSHA256']
    if len(native)!=58 or any(sha(frozen(path))!=digest for path,digest in native.items()):
        raise ValueError('original full historical native58 source tuple changed')
    with tarfile.open(fileobj=io.BytesIO(history),mode='r:xz') as tar:
        archived_method=tar.extractfile('finite_floor_contour.py').read()
        for pitch in [140,70,50]:
            retained=json.load(tar.extractfile(f'finite-floor-contour-captures/contour{pitch}.json'));inputs=retained['inputs']
            if retained['methodSHA256']['finite_floor_contour.py']!=sha(archived_method) or inputs['sourceAuditSHA256']!=sha(audit_raw) or inputs['archiveSHA256']!=sha(stock_raw) or inputs['captureSHA256']!=capture_ids or inputs['nativeSourceSHA256']!=native:
                raise ValueError('original contour method/input provenance differs from frozen source')
    return {'commit':HISTORY_ANCHOR,'gitBlobs':HISTORY_OBJECTS,'archivedCondensationMethodSHA256':sha(archived_method),'nativeSourceSHA256':native,'currentNativeApplicability':False}

def same_physical_domain(current,retained):
    # Only authenticated historical/current provenance differs. No physical,
    # mesh, material, operator, port, load or numerical field is removed.
    a,b=current['inputs'],retained['inputs']
    if set(a)!=set(b) or not PROVENANCE_FIELDS<=set(a):
        raise ValueError('changed contour input extent')
    if {k:v for k,v in a.items() if k not in PROVENANCE_FIELDS}!={k:v for k,v in b.items() if k not in PROVENANCE_FIELDS}:
        raise ValueError('changed predecessor physical inputs')
    for field in ['ports','runtime','meshControls','pitchMm','youngKNPerM2','poisson','floorLiveKPa','nodes','elements','unknowns','volumeM3','positiveRelativeModes','freeRigidModes','distributedLoadWrenchKN_KNM','scope']:
        if current[field]!=retained[field]:raise ValueError('changed predecessor physical domain: '+field)


def differences(a,b,keep):
    return {
        'allRelativeMotionEnergySensitivity':float(abs(eigvalsh(np.asarray(a['condensedStiffness'])[np.ix_(keep,keep)],np.asarray(b['condensedStiffness'])[np.ix_(keep,keep)])-1).max()),
        'maximumConsistentPortLoadDeltaKN_KNM':float(abs(np.asarray(a['consistentLoad'])-b['consistentLoad']).max()),
        'particularLoadPotentialConstantDeltaKNM':abs(a['loadPotentialConstantKNM']-b['loadPotentialConstantKNM']),
    }

def run(root,pitches):
    if any(os.environ.get(k)!='1' for k in ['OPENBLAS_NUM_THREADS','OMP_NUM_THREADS']):
        raise ValueError('single-thread numerical control required')
    method_sha=sha(Path(__file__).read_bytes())
    archive=root/'project/str/studies/finite-floor-contour-residency-history.tar.xz';raw=archive.read_bytes()
    history_control=historical_source_control(root,raw)
    with tarfile.open(fileobj=io.BytesIO(raw),mode='r:xz') as tar:
        old_bytes=tar.extractfile('finite_floor_contour.py').read()
        old_captures={p:json.load(tar.extractfile(f'finite-floor-contour-captures/contour{p}.json')) for p in pitches}
        old_ordering=json.load(tar.extractfile('finite-floor-contour-captures/ordering-control.json'))
    old=types.ModuleType('immutable_predecessor_contour')
    exec(compile(old_bytes,'immutable-history/finite_floor_contour.py','exec'),old.__dict__)
    rows=[];original=producer.condense
    for pitch in pitches:
        observed={}
        def observe(k,transform,boundary,force=None,ordering='MMD_AT_PLUS_A'):
            if observed:raise ValueError('one observed condensation required')
            result=original(k,transform,boundary,force,ordering=ordering)
            predecessor=old.condense(k,transform,boundary,force,ordering=ordering)
            observed.update(predecessor=predecessor,physicalOperator=sparse_identity(k),physicalTrace=sparse_identity(transform),physicalBoundary=array_identity(boundary),physicalLoad=array_identity(force))
            return result
        try:
            producer.condense=observe;current=producer.run(root,pitch)
        finally:producer.condense=original
        retained=old_captures[pitch]
        if current['inputs']!=producer.source_input(root):raise ValueError('stale current source inputs')
        same_physical_domain(current,retained)
        if sha(old_bytes)!=retained['methodSHA256']['finite_floor_contour.py']:
            raise ValueError('invalid immutable predecessor method')
        keep=[i for i,p in enumerate(current['ports']) if not p['id'].startswith('wall/0/')]
        result=observed.pop('predecessor')
        old_result={'condensedStiffness':result['stiffness'].tolist(),'consistentLoad':result['force'].tolist(),'loadPotentialConstantKNM':result['energyConstant']}
        metrics={'sameAssembledOperators':differences(old_result,current,keep),'retainedExecutedPredecessor':differences(retained,current,keep)}
        for group in metrics.values():
            if any(not np.isfinite(v) or v>1e-7 for v in group.values()):raise ValueError('unchanged numerical reproducibility screen failed')
        if pitch==140:
            for key,value in observed.items():
                if value!=old_ordering[key]:raise ValueError('changed actual140 assembled fingerprint: '+key)
        target=root/f'project/str/studies/finite-floor-contour-captures/contour{pitch}.json'
        target.write_text(json.dumps(current,indent=2)+'\n')
        rows.append({'pitchMm':pitch,'captureSHA256':sha(target.read_bytes()),'executionMethodSHA256':current['methodSHA256'],'predecessorCondensation':old_result,'metrics':metrics,**observed})
    if sha(Path(__file__).read_bytes())!=method_sha or archive.read_bytes()!=raw:raise ValueError('control method/history changed during execution')
    return {'schema':'ovids-house/str-finite-floor-contour-residency-control/1','historyArchiveSHA256':sha(raw),'historySourceControl':history_control,'observerMethodSHA256':method_sha,'comparisons':rows,'numericalReproducibilityTolerance':1e-7,'physicalConvergenceAccepted':False,'jointResistanceAvailable':False,'globalReplacementAvailable':False}

def check(root,path):
    result=json.loads(path.read_bytes())
    archive=root/'project/str/studies/finite-floor-contour-residency-history.tar.xz'
    if result.get('historySourceControl')!=historical_source_control(root,archive.read_bytes()):raise ValueError('changed frozen contour history source control')
    if result['schema']!='ovids-house/str-finite-floor-contour-residency-control/1' or result['historyArchiveSHA256']!=sha(archive.read_bytes()) or result['observerMethodSHA256']!=sha(Path(__file__).read_bytes()):raise ValueError('stale residency control')
    if result['numericalReproducibilityTolerance']!=1e-7 or any(result[k] for k in ['physicalConvergenceAccepted','jointResistanceAvailable','globalReplacementAvailable']):raise ValueError('unsupported acceptance')
    if [r['pitchMm'] for r in result['comparisons']]!=[140,70,50]:raise ValueError('all current predecessor controls required')
    with tarfile.open(archive,mode='r:xz') as tar:
        retained={p:json.load(tar.extractfile(f'finite-floor-contour-captures/contour{p}.json')) for p in [140,70,50]}
        old_ordering=json.load(tar.extractfile('finite-floor-contour-captures/ordering-control.json'))
    for row in result['comparisons']:
        capture=root/f"project/str/studies/finite-floor-contour-captures/contour{row['pitchMm']}.json";current=json.loads(capture.read_bytes())
        if row['captureSHA256']!=sha(capture.read_bytes()) or row['executionMethodSHA256']!=current['methodSHA256'] or current['inputs']!=producer.source_input(root):raise ValueError('stale actual capture')
        for name,digest in row['executionMethodSHA256'].items():
            if sha(Path(__file__).with_name(name).read_bytes())!=digest:raise ValueError('stale current method')
        old=retained[row['pitchMm']]
        same_physical_domain(current,old)
        if row['pitchMm']==140:
            for key in ['physicalOperator','physicalTrace','physicalBoundary','physicalLoad']:
                if row[key]!=old_ordering[key]:raise ValueError('changed140 assembled fingerprint')
        previous=row['predecessorCondensation'];n=len(current['ports'])
        if np.asarray(previous['condensedStiffness']).shape!=(n,n) or np.asarray(previous['consistentLoad']).shape!=(n,) or not all(np.isfinite(np.asarray(previous[k])).all() for k in previous):raise ValueError('invalid retained predecessor condensation')
        keep=[i for i,p in enumerate(current['ports']) if not p['id'].startswith('wall/0/')]
        actual={'sameAssembledOperators':differences(previous,current,keep),'retainedExecutedPredecessor':differences(old,current,keep)}
        if set(row['metrics'])!=set(actual):raise ValueError('changed numerical metrics')
        for group,values in actual.items():
            if set(row['metrics'][group])!=set(values):raise ValueError('changed numerical metrics')
            for key,v in values.items():
                saved=row['metrics'][group][key]
                if type(saved) not in (int,float) or not np.isfinite(saved) or abs(saved-v)>1e-12 or v>1e-7:raise ValueError('numerical control does not replay: '+key)
    return result

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--root',type=Path,required=True);p.add_argument('--out',type=Path,required=True);p.add_argument('--check',action='store_true');a=p.parse_args()
    if a.check:r=check(a.root,a.out)
    else:
        r=run(a.root,[140,70,50]);a.out.write_text(json.dumps(r,indent=2)+'\n');check(a.root,a.out)
    print(json.dumps([{'pitchMm':row['pitchMm'],'metrics':row['metrics']} for row in r['comparisons']]))
