"""Passive actual-operator ordering control; no house or material change.

The observer retains arguments to the ordinary component's condensation call.
It changes no argument or result. Only the subsequent independent re-factor uses
COLAMD on those exact same assembled matrices and load vector.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path

import numpy as np
from scipy.linalg import eigvalsh

import finite_floor_contour_run as producer
from finite_floor_contour import condense


def digest_bytes(value):
    return hashlib.sha256(value).hexdigest()


def array_identity(value):
    array = np.ascontiguousarray(value)
    return {'shape': list(array.shape), 'dtype': str(array.dtype),
            'rawSHA256': digest_bytes(array.tobytes())}


def sparse_identity(value):
    matrix = value.tocsc(copy=True)
    matrix.sort_indices()
    return {'shape': list(matrix.shape), 'indices': array_identity(matrix.indices),
            'indptr': array_identity(matrix.indptr), 'data': array_identity(matrix.data)}


def run(root, retained_capture):
    if any(os.environ.get(name) != '1' for name in ['OPENBLAS_NUM_THREADS', 'OMP_NUM_THREADS']):
        raise ValueError('actual ordering control requires both numerical thread counts = 1')
    method_sha = digest_bytes(Path(__file__).read_bytes())
    retained_bytes = Path(retained_capture).read_bytes()
    retained = json.loads(retained_bytes)
    if retained['pitchMm'] != 140:
        raise ValueError('explicit current140 ordering control required')
    captured = {}
    original = producer.condense

    def observe(k, transform, boundary, force=None, ordering='MMD_AT_PLUS_A'):
        if captured or ordering != 'MMD_AT_PLUS_A':
            raise ValueError('exactly one actual ordinary MMD condensation required')
        result = original(k, transform, boundary, force, ordering=ordering)
        captured.update(k=k, transform=transform, boundary=boundary, force=force, result=result)
        return result

    try:
        producer.condense = observe
        ordinary = producer.run(root, 140)
    finally:
        producer.condense = original
    # Time is an observation, not semantic input. Everything else must repeat
    # exactly, including matrices, loads, methods, runtime and source identities.
    ignored = {'elapsedSeconds'}
    if ({k: v for k, v in ordinary.items() if k not in ignored}
            != {k: v for k, v in retained.items() if k not in ignored}):
        raise ValueError('passive ordinary140 result differs from retained executed capture')
    alternate = condense(captured['k'], captured['transform'], captured['boundary'],
                         captured['force'], ordering='COLAMD')
    baseline = captured['result']
    keep = [i for i, p in enumerate(ordinary['ports']) if not p['id'].startswith('wall/0/')]
    a = baseline['stiffness'][np.ix_(keep, keep)]
    b = alternate['stiffness'][np.ix_(keep, keep)]
    sensitivity = float(abs(eigvalsh(a, b)-1).max())
    load_delta = float(abs(baseline['force']-alternate['force']).max())
    potential_delta = float(abs(baseline['energyConstant']-alternate['energyConstant']))
    # A numerical reproducibility screen, not a physical convergence criterion.
    tolerance = 1e-7
    if sensitivity > tolerance or load_delta > tolerance or potential_delta > tolerance:
        raise ValueError('actual ordering numerical reproducibility screen failed')
    method = Path(__file__)
    if digest_bytes(method.read_bytes()) != method_sha:
        raise ValueError('ordering control method changed during execution')
    return {
        'schema': 'ovids-house/str-finite-floor-contour-ordering-control/1',
        'retainedCaptureSHA256': digest_bytes(retained_bytes),
        'observerMethodSHA256': method_sha,
        'executionMethodSHA256': ordinary['methodSHA256'],
        'authoredInputSHA256': ordinary['inputs']['authoredInputSHA256'],
        'nativeSourceSHA256': ordinary['inputs']['nativeSourceSHA256'],
        'runtime': ordinary['runtime'], 'pitchMm': 140,
        'physicalOperator': sparse_identity(captured['k']),
        'physicalTrace': sparse_identity(captured['transform']),
        'physicalBoundary': array_identity(captured['boundary']),
        'physicalLoad': array_identity(captured['force']),
        'actualOrdinaryRepeatExactExceptElapsedTime': True,
        'unchangedAssembledOperatorAndLoad': True,
        'ordinaryOrdering': 'MMD_AT_PLUS_A', 'comparisonOrdering': 'COLAMD',
        'comparisonCondensedStiffness': alternate['stiffness'].tolist(),
        'comparisonConsistentPortLoad': alternate['force'].tolist(),
        'comparisonLoadPotentialConstantKNM': alternate['energyConstant'],
        'allRelativeMotionEnergySensitivity': sensitivity,
        'maximumConsistentPortLoadDeltaKN_KNM': load_delta,
        'particularLoadPotentialConstantDeltaKNM': potential_delta,
        'numericalReproducibilityTolerance': tolerance,
        'numericalOrderingControlPassed': True,
        'physicalConvergenceAccepted': False, 'jointResistanceAvailable': False,
        'globalReplacementAvailable': False,
        'replayScope': 'Retained condensed ordering comparison plus current source/method join. The physical operator fingerprints do not reconstruct omitted assembled matrix bytes; full reproduction executes this producer.',
    }


def check(root, retained_capture, receipt_path):
    retained_bytes = Path(retained_capture).read_bytes()
    retained = json.loads(retained_bytes)
    result = json.loads(Path(receipt_path).read_bytes())
    if (result['schema'] != 'ovids-house/str-finite-floor-contour-ordering-control/1'
            or result['retainedCaptureSHA256'] != digest_bytes(retained_bytes)
            or result['observerMethodSHA256'] != digest_bytes(Path(__file__).read_bytes())
            or retained['inputs'] != producer.source_input(root)
            or result['authoredInputSHA256'] != retained['inputs']['authoredInputSHA256']
            or result['nativeSourceSHA256'] != retained['inputs']['nativeSourceSHA256']
            or result['runtime'] != retained['runtime'] or result['pitchMm'] != retained['pitchMm']
            or result['ordinaryOrdering'] != 'MMD_AT_PLUS_A' or result['comparisonOrdering'] != 'COLAMD'
            or not result['actualOrdinaryRepeatExactExceptElapsedTime'] or not result['unchangedAssembledOperatorAndLoad']
            or any(result[k] for k in ['physicalConvergenceAccepted','jointResistanceAvailable','globalReplacementAvailable'])):
        raise ValueError('stale or unsupported current ordering control')
    methods = {name: digest_bytes(Path(__file__).with_name(name).read_bytes())
               for name in ['finite_floor_contour.py','finite_floor_contour_run.py']}
    if methods != result['executionMethodSHA256'] or methods != retained['methodSHA256']:
        raise ValueError('stale actual component execution method')
    ports = retained['ports']
    keep = [i for i,p in enumerate(ports) if not p['id'].startswith('wall/0/')]
    baseline = np.asarray(retained['condensedStiffness'])
    alternate = np.asarray(result['comparisonCondensedStiffness'])
    other_force = np.asarray(result['comparisonConsistentPortLoad'])
    if (alternate.shape != baseline.shape or not np.isfinite(alternate).all()
            or other_force.shape != (len(ports),) or not np.isfinite(other_force).all()):
        raise ValueError('invalid retained ordering comparison arrays')
    actual = {
        'allRelativeMotionEnergySensitivity': float(abs(eigvalsh(baseline[np.ix_(keep,keep)], alternate[np.ix_(keep,keep)])-1).max()),
        'maximumConsistentPortLoadDeltaKN_KNM': float(abs(np.asarray(retained['consistentLoad'])-other_force).max()),
        'particularLoadPotentialConstantDeltaKNM': float(abs(retained['loadPotentialConstantKNM']-result['comparisonLoadPotentialConstantKNM'])),
    }
    for key,value in actual.items():
        if not np.isfinite(value) or abs(value-result[key]) > 1e-12 or value > 1e-7:
            raise ValueError('retained ordering comparison does not reproduce: '+key)
    if result['numericalReproducibilityTolerance'] != 1e-7 or not result['numericalOrderingControlPassed']:
        raise ValueError('numerical ordering screen changed')
    return actual


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--root', type=Path, required=True)
    parser.add_argument('--retained', type=Path, required=True)
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    if args.check:
        print(json.dumps(check(args.root,args.retained,args.out)));raise SystemExit(0)
    result = run(args.root, args.retained)
    args.out.write_text(json.dumps(result, indent=2)+'\n')
    check(args.root,args.retained,args.out)
    print(json.dumps({k: result[k] for k in ['allRelativeMotionEnergySensitivity',
                                            'maximumConsistentPortLoadDeltaKN_KNM',
                                            'numericalOrderingControlPassed']}))
