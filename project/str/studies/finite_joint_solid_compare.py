"""Reproduce energy comparisons from actual labelled end-compliance captures."""
import argparse
import hashlib
import json
from pathlib import Path

import numpy as np
from scipy.linalg import eigvalsh


def compare(directory):
    root = Path(__file__).resolve().parents[3]
    captures = []
    identities = None
    for pitch in [140, 70, 35]:
        path = directory/f'finite-joint-solid-{pitch}.json'
        data = json.loads(path.read_text())
        if data['schema'] != 'ovids-house/str-isotropic-solid-end-compliance-experiment/1':
            raise ValueError('unsupported response schema')
        if data['nativeFloorAdmission'] or data['jointResistanceAvailable'] or data['pitchMm'] != pitch:
            raise ValueError('incompatible comparison or unearned admission')
        identity = {k: data[k] for k in ['inputSHA256', 'sourceAuditSHA256', 'methodSHA256', 'runtime']}
        if identities is not None and identity != identities:
            raise ValueError('incompatible input/source/method/runtime')
        identities = identity
        for name, expected in data['methodSHA256'].items():
            if hashlib.sha256(Path(__file__).with_name(name).read_bytes()).hexdigest() != expected:
                raise ValueError('stale component method: '+name)
        for name, expected in [('project/str/studies/finite-joint-solid-inputs.json', data['inputSHA256']),
                               ('project/str/studies/four-l-joint-material-audit.json', data['sourceAuditSHA256'])]:
            if hashlib.sha256((root/name).read_bytes()).hexdigest() != expected:
                raise ValueError('stale component input/source: '+name)
        captures.append((path, data))
    changes = []
    for (_, a), (_, b) in zip(captures, captures[1:]):
        # Fix lower six ports only to remove the identical six global rigid modes.
        # The generalised eigenvalues bound energy changes for every relative end motion.
        coarse = np.asarray(a['condensedStiffness'])[6:, 6:]
        fine = np.asarray(b['condensedStiffness'])[6:, 6:]
        ratios = eigvalsh(coarse, fine)-1
        changes.append({'fromPitchMm': a['pitchMm'], 'toPitchMm': b['pitchMm'],
                        'relativeEnergyChangeEigenvalues': ratios.tolist(),
                        'maxAbsoluteRelativeEnergyChange': float(abs(ratios).max())})
    return {'schema': 'ovids-house/str-isotropic-solid-end-compliance-comparison/1',
            'sourceIdentities': identities,
            'captureSHA256': {p.name: hashlib.sha256(p.read_bytes()).hexdigest() for p, _ in captures},
            'processingMethodSHA256': hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
            'comparisons': changes, 'nativeFloorAdmission': False,
            'scope': 'End-compliance energy sensitivity only; no floor-interface/global/strength qualification'}


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('directory', type=Path)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    target = args.directory/'finite-joint-solid-comparison.json'
    result = json.dumps(compare(args.directory), indent=2)+'\n'
    if args.check:
        if target.read_text() != result:
            raise SystemExit('stale end-compliance comparison; regenerate actual producer')
    else:
        target.write_text(result)
    print('End-compliance comparison verified' if args.check else 'End-compliance comparison written')
