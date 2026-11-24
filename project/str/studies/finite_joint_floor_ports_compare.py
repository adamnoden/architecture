"""Reproduce the predeclared all-port energy screen from complete solid captures."""
import argparse
import hashlib
import json
from pathlib import Path
import tarfile

import numpy as np
from scipy.linalg import eigvalsh


def compare(root):
    root = Path(root)
    directory = root/'project/str/studies'
    inputs = json.loads((directory/'finite-joint-floor-port-inputs.json').read_text())
    archive = directory/'finite-joint-floor-port-captures.tar.xz'
    captures = []
    with tarfile.open(archive) as stream:
        for pitch in inputs['comparisonPitchesMm']:
            name = f'finite-joint-floor-ports-{pitch}.json'
            raw = stream.extractfile(name).read();data = json.loads(raw)
            if (data['schema'] != 'str-finite-L-slab-contour-component-experiment/1'
                    or data['pitchMm'] != pitch or data['ordinaryNativeAdmissionApplicable']
                    or data['globalReplacementAvailable'] or data['jointResistanceAvailable']):
                raise ValueError('unsupported component capture')
            for path, expected in data['sourceSHA256'].items():
                if hashlib.sha256((root/path).read_bytes()).hexdigest() != expected:
                    raise ValueError('stale component source/method: '+path)
            if captures and any(data[key] != captures[0][2][key] for key in ['sourceSHA256', 'runtime', 'ports']):
                raise ValueError('different ports/source/method/runtime cannot form this comparison')
            matrix = np.asarray(data['condensedStiffness'])
            if (matrix.shape != (len(data['ports']), len(data['ports'])) or not np.isfinite(matrix).all()
                    or not np.allclose(matrix, matrix.T, atol=1e-7, rtol=1e-10)):
                raise ValueError('unsupported component matrix')
            captures.append((name, raw, data))
    changes = []
    for (_, _, a), (_, _, b) in zip(captures, captures[1:]):
        # Fixing the actual lower six ports removes the same six global rigid modes.
        values = eigvalsh(np.asarray(a['condensedStiffness'])[6:, 6:],
                         np.asarray(b['condensedStiffness'])[6:, 6:])-1
        worst = float(abs(values).max())
        changes.append({'fromPitchMm': a['pitchMm'], 'toPitchMm': b['pitchMm'],
                        'maximumRelativePortEnergyChange': worst,
                        'allPortEnergyChangeEigenvalues': values.tolist(),
                        'declaredComponentTolerance': inputs['componentEnergyRelativeChangeTolerance'],
                        'componentEnergyScreenPasses': worst <= inputs['componentEnergyRelativeChangeTolerance']})
    return {'schema': 'str-finite-floor-port-development-comparison/1',
            'archiveSHA256': hashlib.sha256(archive.read_bytes()).hexdigest(),
            'capturesSHA256': {name: hashlib.sha256(raw).hexdigest() for name, raw, _ in captures},
            'sourceSHA256': captures[0][2]['sourceSHA256'],
            'processingMethodSHA256': hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
            'portCount': len(captures[0][2]['ports']), 'comparisons': changes,
            'nativeConstitutiveEquivalence': False, 'globalReplacementAvailable': False,
            'jointResistanceAvailable': False,
            'scope': 'All relative end/contour motions after fixing lower six gauge coordinates. A component energy screen is separate from native head/cut convergence and physical joint resistance.'}


if __name__ == '__main__':
    parser = argparse.ArgumentParser();parser.add_argument('--check', action='store_true');args = parser.parse_args()
    root = Path(__file__).resolve().parents[3]
    result = json.dumps(compare(root), indent=2)+'\n'
    target = root/'project/str/studies/finite-joint-floor-port-comparison.json'
    if args.check:
        if target.read_text() != result:raise SystemExit('stale finite contour comparison')
    else:target.write_text(result)
    print('Finite contour comparison verified' if args.check else 'Finite contour comparison written')
