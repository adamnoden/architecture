"""Execute the explicitly separate finite wall/slab contour component."""
import argparse
import hashlib
import json
from pathlib import Path
import time

import numpy as np
import skfem

from finite_joint_floor_ports import read_current_patch_geometry, assemble_patch, condense_patch, rigid_port_modes
from four_l_joint_observer import numerical_runtime, require_runtime_threads


def sha(path):return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def run(root, inputs_path, pitch_mm):
    require_runtime_threads()
    root, inputs_path = Path(root), Path(inputs_path)
    inputs = json.loads(inputs_path.read_text())
    if (inputs.get('schema') != 'ovids-house/str-finite-joint-floor-port-development-input/1'
            or pitch_mm not in inputs['comparisonPitchesMm']
            or inputs['contourPolicy'] != 'east-north-five-coordinate-midplane-trace'
            or any(inputs[k] is not False for k in ['nativeConstitutiveEquivalence', 'nativeBandYawMappingAvailable',
                                                    'globalReplacementAvailable', 'jointResistanceAvailable'])):
        raise ValueError('unsupported finite contour request')
    geometry = read_current_patch_geometry(root, inputs)
    source_paths = ['project/str/studies/'+name for name in [
        'finite_joint_floor_ports.py', 'finite_joint_floor_ports_run.py', 'finite_joint_solid.py',
        'finite-joint-floor-port-inputs.json', 'finite-joint-solid-requirements.txt', 'four-l-joint-material-audit.json']]
    identities = {**geometry['sourceSHA256'], **{p: sha(root/p) for p in source_paths}}
    package = Path(skfem.__file__).parent
    package_digest = hashlib.sha256()
    for path in sorted(package.rglob('*.py')):
        package_digest.update(str(path.relative_to(package)).encode()+b'\0'+path.read_bytes())
    runtime = {**numerical_runtime(), 'scikitFemVersion': skfem.__version__,
               'scikitFemPythonSourcesSHA256': package_digest.hexdigest()}
    start = time.monotonic()
    mesh, basis, stiffness = assemble_patch(geometry, pitch_mm/1000, inputs['youngKNPerM2'], inputs['poisson'])
    result = condense_patch(mesh, basis, stiffness, geometry, inputs['wallUnitWeightKNPerM3'])
    matrix = result['stiffness'];modes = rigid_port_modes(result['ports'])
    relative_rigid = float(abs(matrix @ modes).max()/abs(matrix).max())
    values = np.linalg.eigvalsh(matrix)
    if (relative_rigid > 1e-9 or values[0] < -values[-1]*1e-9
            or np.count_nonzero(values > values[-1]*1e-9) != len(result['ports'])-6):
        raise ValueError('free-body component lost rigid modes or positive energy')
    rectangles = geometry['rectangles'];areas = np.prod(rectangles[:, 2:]-rectangles[:, :2], axis=1)
    wall_centroid = np.sum(areas[:, None]*(rectangles[:, :2]+rectangles[:, 2:])/2, axis=0)/areas.sum()
    z = geometry['levels'];wall_g = float(areas.sum()*(z[1]-z[0]+z[3]-z[2])*inputs['wallUnitWeightKNPerM3'])
    slab_g = float(geometry['actualPatchAreaM2']*(z[2]-z[1])*geometry['slabUnitWeight'])
    first_xy = wall_g*wall_centroid+slab_g*(geometry['lowXY']+geometry['highXY'])/2
    expected_wrench = np.array([0, 0, -wall_g-slab_g, -first_xy[1], first_xy[0], 0])
    gravity_work = modes.T @ result['gravity']
    np.testing.assert_allclose(gravity_work, expected_wrench, atol=1e-8)
    if any(sha(root/path) != identity for path, identity in identities.items()):
        raise ValueError('source/method changed during finite component solve')
    if sha(root/inputs['geometryArchive']) != inputs['geometryArchiveSHA256']:
        raise ValueError('source geometry archive changed during component solve')
    return {'schema': 'str-finite-L-slab-contour-component-experiment/1',
            'sourceSHA256': identities, 'runtime': runtime,
            'geometryCaptureSHA256': geometry['geometryCaptureSHA256'],
            'geometryArchiveSHA256': inputs['geometryArchiveSHA256'],
            'pitchMm': pitch_mm, 'nodes': int(mesh.nvertices), 'elements': int(mesh.nelements),
            'unknowns': int(basis.N), 'ports': result['ports'], 'condensedStiffness': matrix.tolist(),
            'consistentGravityPortLoad': result['gravity'].tolist(),
            'loadEnergyConstantKNM': result['loadEnergyConstant'],
            'volumeM3': float(basis.dx.sum()), 'wallGKN': wall_g, 'slabGKN': slab_g,
            'gravityRigidWorkKN_KNm': gravity_work.tolist(),
            'gravityRigidWorkResidualKN_KNm': (gravity_work-expected_wrench).tolist(),
            'relativeRigidModeResidual': relative_rigid, 'energyEigenvalues': values.tolist(),
            'actualNormalContactsInsidePatch': geometry['actualNormalContactsInsidePatch'],
            'commonNativeContourKnotsM': geometry['axisKnots'],
            'nativeConstitutiveEquivalence': False, 'nativeBandYawMappingAvailable': False,
            'nativeUnitAdapterAvailable': False, 'globalReplacementAvailable': False,
            'jointResistanceAvailable': False, 'ordinaryNativeAdmissionApplicable': False,
            'scope': 'Isotropic finite wall/slab component, shared127-port contour, SI coordinates. Midplane shell trace suppresses contour thickness warping. No native exterior/frame/band/chord operator replacement, actual floor pressure family or design-strip demand is solved.',
            'elapsedSeconds': time.monotonic()-start}


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--pitch-mm', type=float, required=True)
    parser.add_argument('--out', type=Path, required=True)
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[3]
    result = run(root, Path(__file__).with_name('finite-joint-floor-port-inputs.json'), args.pitch_mm)
    args.out.write_text(json.dumps(result, indent=2)+'\n')
    print(json.dumps({k: result[k] for k in ['pitchMm', 'nodes', 'elements', 'volumeM3', 'wallGKN', 'slabGKN',
                                          'relativeRigidModeResidual', 'elapsedSeconds']}))
