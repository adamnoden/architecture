"""Execute the labelled isotropic end-compliance comparison, never current native admission."""
import argparse
import hashlib
import json
import platform
from pathlib import Path
import time

import numpy as np
import scipy
import skfem

from finite_joint_solid import (authored_sw_geometry, component, condense_end_ports,
                               rigid_trace, gravity_force, condensed_load)


def run(pitch_mm):
    root = Path(__file__).resolve().parents[3]
    input_path = Path(__file__).with_name('finite-joint-solid-inputs.json')
    method_paths = [Path(__file__), Path(__file__).with_name('finite_joint_solid.py')]
    methods = {p.name: hashlib.sha256(p.read_bytes()).hexdigest() for p in method_paths}
    input_sha = hashlib.sha256(input_path.read_bytes()).hexdigest()
    inputs = json.loads(input_path.read_text())
    if (inputs['schema'] != 'ovids-house/str-isotropic-solid-end-compliance-input/1'
            or inputs['jointId'] != 'SW' or pitch_mm not in inputs['comparisonPitchesMm']
            or inputs['nativeConstitutiveEquivalence'] or inputs['globalReplacementAvailable']):
        raise ValueError('unsupported component request')
    audit = root/inputs['sourceAudit']
    source = json.loads(audit.read_text())
    for path, expected in source['sourceSHA256'].items():
        if hashlib.sha256((root/path).read_bytes()).hexdigest() != expected:
            raise ValueError('stale material audit source: '+path)
    rectangles, audit_sha = authored_sw_geometry(audit)
    joint = next(j for j in source['joints'] if j['id'] == inputs['jointId'])
    center = joint['gravityCentroidXYZMm'][2]/1000
    low = center-source['plateThicknessMm']/2000
    high = center+source['plateThicknessMm']/2000
    levels = [low-inputs['wallExtensionBelowMm']/1000, low, high,
              high+inputs['wallExtensionAboveMm']/1000]
    wall_weight = inputs['wallUnitWeightKNPerM3']
    slab_weight = source['plateUnitWeightKNPerM3']
    areas = np.prod(rectangles[:, 2:]-rectangles[:, :2], axis=1)
    centroid = np.sum(areas[:, None]*(rectangles[:, :2]+rectangles[:, 2:])/2, axis=0)/areas.sum()
    start = time.monotonic()
    mesh, basis, k, volume = component(rectangles, levels, pitch_mm/1000,
                                      inputs['youngKNPerM2'], inputs['poisson'])
    condensed, displacement, origins, residual = condense_end_ports(mesh, basis, k, centroid)
    force = gravity_force(basis, lambda x: np.where((x[2] > low) & (x[2] < high), slab_weight, wall_weight))
    port_force, particular, load_energy = condensed_load(k, basis, mesh, displacement, force)
    rotations = np.column_stack([np.zeros((3, 3)), np.eye(3)])
    modes = np.concatenate([np.vstack([rigid_trace(o[:, None], [0, 0, 0])[0], rotations])
                            for o in origins])
    eigenvalues = np.linalg.eigvalsh(condensed)
    rigid_residual = float(np.max(np.abs(condensed @ modes))/abs(condensed).max())
    if (rigid_residual > 1e-9 or eigenvalues[0] < -eigenvalues[-1]*1e-9
            or np.count_nonzero(eigenvalues > eigenvalues[-1]*1e-8) != 6):
        raise ValueError('component failed free-body rigid-mode/positivity control')
    wall_g = float(areas.sum()*(levels[-1]-levels[0]-(high-low))*wall_weight)
    slab_g = float(areas.sum()*(high-low)*slab_weight)
    expected_weight = wall_g+slab_g
    np.testing.assert_allclose(modes.T @ port_force,
                              [0, 0, -expected_weight, -centroid[1]*expected_weight,
                               centroid[0]*expected_weight, 0], atol=1e-9)
    if not np.isclose(-force[basis.nodal_dofs[2]].sum(), expected_weight, atol=1e-10):
        raise ValueError('body-G differs from exact source inventory')
    if (hashlib.sha256(input_path.read_bytes()).hexdigest() != input_sha
            or hashlib.sha256(audit.read_bytes()).hexdigest() != audit_sha
            or any(hashlib.sha256(p.read_bytes()).hexdigest() != methods[p.name] for p in method_paths)
            or any(hashlib.sha256((root/p).read_bytes()).hexdigest() != expected
                   for p, expected in source['sourceSHA256'].items())):
        raise ValueError('source/input/method changed during solve; result invalidated')
    return {
        'schema': 'ovids-house/str-isotropic-solid-end-compliance-experiment/1',
        'scope': 'Exact L footprint, authored wall stubs, rigid end planes; no distributed slab interface or global replacement',
        'nativeFloorAdmission': False, 'jointResistanceAvailable': False,
        'inputId': inputs['id'], 'inputSHA256': input_sha,
        'material': {'youngKNPerM2': inputs['youngKNPerM2'], 'poisson': inputs['poisson'],
                     'nativeCrackedSlabMembraneFrameEquivalence': False},
        'sourceAuditSHA256': audit_sha,
        'methodSHA256': methods,
        'runtime': {'python': platform.python_version(), 'numpy': np.__version__,
                    'scipy': scipy.__version__, 'scikit-fem': skfem.__version__},
        'pitchMm': pitch_mm, 'nodes': int(mesh.nvertices), 'elements': int(mesh.nelements),
        'unknowns': int(basis.N), 'volumeM3': volume,
        'physicalGInventoryKN': {'wallStubs': wall_g, 'jointAlreadyInPlate': slab_g},
        'gravityLoadCondensationAvailable': True,
        'consistentGravityEndLoad': port_force.tolist(),
        'particularGravityDisplacementMaxM': float(abs(particular).max()),
        'particularGravityEnergyConstantKNM': load_energy,
        'portOriginsM': origins.tolist(),
        'portOrder': ['lowerTx', 'lowerTy', 'lowerTz', 'lowerRx', 'lowerRy', 'lowerRz',
                      'upperTx', 'upperTy', 'upperTz', 'upperRx', 'upperRy', 'upperRz'],
        'portUnits': 'translations m, rotations rad, forces kN, moments kNm',
        'condensedStiffness': condensed.tolist(), 'eigenvalues': eigenvalues.tolist(),
        'interiorResidualKNPerUnitPort': residual, 'relativeRigidModeResidual': rigid_residual,
        'elapsedSeconds': time.monotonic()-start,
    }


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--pitch-mm', type=float, required=True)
    parser.add_argument('--out', type=Path, required=True)
    args = parser.parse_args()
    result = run(args.pitch_mm)
    args.out.write_text(json.dumps(result, indent=2)+'\n')
    print(json.dumps({k: result[k] for k in ['pitchMm', 'nodes', 'elements', 'volumeM3',
                                           'relativeRigidModeResidual', 'elapsedSeconds']}))
