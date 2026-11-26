import copy
import unittest
import numpy as np

from finite_joint_membrane_trace import compile_point_trace_floor
from perforated_floor_condensation import compile_perforated_floor


def inputs():
    patches = [{'id': str(i), 'originXYMm': p, 'rectangles': [r], 'node': 'node/'+str(i)}
               for i, (p, r) in enumerate([
                   ([0, 0], [0, 0, 100, 100]), ([1000, 0], [900, 0, 1000, 100]),
                   ([0, 1000], [0, 900, 100, 1000]), ([1000, 1000], [900, 900, 1000, 1000])])]
    law = {'elasticModulusMPa': 8250., 'poissonRatio': .2, 'shearModulusMPa': 3437.5,
           'thicknessMm': 200., 'edgeElasticModulusMPa': 8250., 'edgeFlexuralFactor': 1.,
           'edgeAxialRigidityKN': 180955.73684677208}
    return [[[0., 0., 1000., 1000.]], [], [], patches, law, 500.]


class NativePointComposition(unittest.TestCase):
    def test_exact_mesh_and_independent_outer_schur_energy_with_no_new_restraint(self):
        args = inputs()
        source = copy.deepcopy(args)
        base = compile_perforated_floor(*args)
        retained = compile_point_trace_floor(*args, retained_point_ports=[
            {'id': 'centre', 'originXYMm': [500., 500.], 'node': 'physical-centre'}])
        a, b = np.array(base['condensedStiffnessKNPerMm']), np.array(retained['condensedStiffnessKNPerMm'])
        keep, extra = list(range(12)), [12, 13]
        condensed = b[np.ix_(keep, keep)] - b[np.ix_(keep, extra)] @ np.linalg.solve(
            b[np.ix_(extra, extra)], b[np.ix_(extra, keep)])
        np.testing.assert_allclose(condensed, a, rtol=1e-10, atol=1e-9)
        self.assertTrue(np.array_equal(b[14], np.zeros(15)))
        self.assertEqual(retained['meshTrianglesXYMm'], base['meshTrianglesXYMm'])
        self.assertEqual(retained['membraneAreaM2'], base['membraneAreaM2'])
        self.assertEqual(retained['retainedPointParticipation'][0]['activeCoordinates'], [0, 1])
        self.assertEqual(args, source)

    def test_actual_band_cut_keeps_yaw_and_source_load_work(self):
        args = inputs()
        args[1] = [[100., 0., 900., 140.]]
        args[2] = [{'id': 'outer-south', 'axis': 0, 'datum': 70., 'lo': 100.,
                    'hi': 900., 'width': 140., 'depth': 200.}]
        result = compile_point_trace_floor(*args, retained_point_ports=[
            {'id': 'band-cut', 'originXYMm': [500., 70.], 'node': 'physical-band-cut'}])
        self.assertEqual(result['retainedPointParticipation'][0]['activeCoordinates'], [0, 1, 2])
        self.assertLess(max(result['rigidModeResidualKN']), 1e-3)
        self.assertLess(max(abs(v) for v in result['numericalCondensation']['sourceRigidWorkResidualKNmm']), 1e-6)

    def test_numerical_partition_changes_mesh_without_changing_material_union(self):
        args = inputs()
        base = compile_point_trace_floor(*args)
        changed = compile_point_trace_floor(*args, extra_coordinates=([350.], [650.]))
        self.assertNotEqual(base['meshTrianglesXYMm'], changed['meshTrianglesXYMm'])
        self.assertEqual(base['membraneAreaM2'], changed['membraneAreaM2'])
        self.assertEqual(changed['pointTraceComposition']['bodyPartitionAreaSumResidualMm2'], 0.)
        self.assertEqual(changed['omissionsXYMm'], args[1])
        self.assertIn(350., changed['coordinateColumns'][0])
        self.assertIn(650., changed['coordinateColumns'][1])

    def test_unsupported_material_alias_and_receiver_override_reject(self):
        for points in [
            [{'id': 'outside', 'originXYMm': [1500., 500.], 'node': 'outside'}],
            [{'id': 'rigid', 'originXYMm': [50., 50.], 'node': 'old-body'}],
            [{'id': 'same', 'originXYMm': [500., 500.], 'node': 'a'},
             {'id': 'same', 'originXYMm': [600., 500.], 'node': 'b'}],
            [{'id': 'a', 'originXYMm': [500., 500.], 'node': 'a'},
             {'id': 'b', 'originXYMm': [500., 500.], 'node': 'b'}]]:
            with self.assertRaises(ValueError):
                compile_point_trace_floor(*inputs(), retained_point_ports=points)
        receiver = {'id': 'beam', 'axis': 0, 'datum': 500., 'width': 100., 'lo': 100., 'hi': 900., 'stations': [], 'shearPhi': 1.}
        with self.assertRaisesRegex(ValueError, 'override'):
            compile_point_trace_floor(*inputs(), boundary_receivers=[receiver], retained_point_ports=[
                {'id': 'in-beam', 'originXYMm': [500., 500.], 'node': 'beam-point'}])
        with self.assertRaises(ValueError):
            compile_point_trace_floor(*inputs(), extra_coordinates=([float('nan')], []))
        with self.assertRaises(ValueError):
            compile_point_trace_floor(*inputs(), retained_point_ports=[
                {'id': 'near', 'originXYMm': [500.+5e-7, 500.], 'node': 'near-midpoint'}])


if __name__ == '__main__':
    unittest.main()
