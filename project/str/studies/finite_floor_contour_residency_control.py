"""Same assembled-operator control for bounded direct condensation residency.

The immutable predecessor is a numerical control, never a current input or a
fallback. Execute both condensations on the identical observed K/T/boundary/F.
"""
import argparse, hashlib, io, json, os, tarfile, types
from pathlib import Path
import numpy as np
from scipy.linalg import eigvalsh
import finite_floor_contour_run as producer
from finite_floor_contour_ordering_control import sparse_identity, array_identity

def sha(raw): return hashlib.sha256(raw).hexdigest()

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
        for field in ['inputs','ports','runtime','meshControls','pitchMm','youngKNPerM2','poisson','floorLiveKPa','nodes','elements','unknowns','volumeM3','positiveRelativeModes','freeRigidModes','distributedLoadWrenchKN_KNM','scope']:
            if current[field]!=retained[field]:raise ValueError('changed source/operator domain: '+field)
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
    return {'schema':'ovids-house/str-finite-floor-contour-residency-control/1','historyArchiveSHA256':sha(raw),'observerMethodSHA256':method_sha,'comparisons':rows,'numericalReproducibilityTolerance':1e-7,'physicalConvergenceAccepted':False,'jointResistanceAvailable':False,'globalReplacementAvailable':False}

def check(root,path):
    result=json.loads(path.read_bytes())
    archive=root/'project/str/studies/finite-floor-contour-residency-history.tar.xz'
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
        for field in ['inputs','ports','runtime','meshControls','pitchMm','youngKNPerM2','poisson','floorLiveKPa','nodes','elements','unknowns','volumeM3','positiveRelativeModes','freeRigidModes','distributedLoadWrenchKN_KNM','scope']:
            if current[field]!=old[field]:raise ValueError('changed predecessor physical domain: '+field)
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
