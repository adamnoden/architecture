import copy
import unittest

import numpy as np

from finite_joint_solid import rigid_trace
from finite_joint_floor_ports import assemble_patch, condense_patch, _linear_weights, rigid_port_modes


def geometry():
    return {'rectangles': np.array([[0, 0, .14, 1], [.14, 0, 1, .14]]),
            'lowXY': np.array([0., 0.]), 'highXY': np.array([1.5, 1.5]),
            'axisKnots': [[0., .14, .5, 1., 1.5], [0., .14, .5, 1., 1.5]],
            'levels': [.1, .5, .7, 1.1], 'slabUnitWeight': 27.}


class DistributedPortControls(unittest.TestCase):
    def test_solid_union_and_all_six_rigid_modes_with_distributed_floor_ports(self):
        g = geometry()
        mesh, basis, k = assemble_patch(g, .25, 33e6, .2)
        result = condense_patch(mesh, basis, k, g, 25.)
        self.assertAlmostEqual(float(basis.dx.sum()), 1.5**2*.2+.2604*.8, places=12)
        modes = rigid_port_modes(result['ports'])
        condensed = result['stiffness']
        self.assertLess(abs(condensed @ modes).max()/abs(condensed).max(), 1e-10)
        eigenvalues = np.linalg.eigvalsh(condensed)
        self.assertEqual(int(np.count_nonzero(eigenvalues > eigenvalues[-1]*1e-9)), len(result['ports'])-6)
        self.assertGreater(eigenvalues[0], -eigenvalues[-1]*1e-10)
        exact = np.zeros((basis.N, 6))
        for node, trace in enumerate(rigid_trace(mesh.p, [0, 0, 0])):
            exact[basis.nodal_dofs[:, node]] = trace
        np.testing.assert_allclose(result['displacement'] @ modes, exact, atol=1e-11)
        np.testing.assert_allclose(modes.T @ result['gravity'], exact.T @ result['bodyForce'], atol=1e-9)
        self.assertAlmostEqual(-result['bodyForce'][basis.nodal_dofs[2]].sum(), 1.5**2*.2*27+.2604*.8*25, places=10)

    def test_full_condensed_potential_and_unclamped_joint_footprint(self):
        g = geometry();mesh, basis, k = assemble_patch(g, .25, 33e6, .2)
        result = condense_patch(mesh, basis, k, g, 25.)
        q = np.sin(np.arange(len(result['ports'])))*1e-4
        u = result['displacement'] @ q+result['particular']
        actual = .5*u @ k @ u-result['bodyForce'] @ u
        reduced = (.5*q @ result['stiffness'] @ q-result['gravity'] @ q+result['loadEnergyConstant'])
        self.assertAlmostEqual(float(actual), float(reduced), places=10)
        nodes = np.flatnonzero(np.isclose(mesh.p[2], .7) & ((mesh.p[0] <= .14+1e-12) | (mesh.p[1] <= .14+1e-12)))
        trace = np.concatenate(list(rigid_trace(mesh.p[:, nodes], [0, 0, .7])))
        deformation = u[basis.nodal_dofs[:, nodes].T.ravel()]
        rigid_fit = trace @ np.linalg.lstsq(trace, deformation, rcond=None)[0]
        self.assertGreater(np.linalg.norm(deformation-rigid_fit), 1e-9,
                           'Finite solid must permit actual joint distortion, not restore its rigid footprint')

    def test_exact_linear_trace_rejects_snap_and_geometry_overreach(self):
        weights = _linear_weights(.3, [0., .2, .8])
        self.assertAlmostEqual(sum(w for _, w in weights), 1.)
        self.assertAlmostEqual(sum([0., .2, .8][i]*w for i, w in weights), .3)
        with self.assertRaises(ValueError):_linear_weights(.9, [0., .2, .8])
        g = copy.deepcopy(geometry());g['highXY'] = np.array([.8, .8])
        with self.assertRaises(ValueError):assemble_patch(g, .25, 33e6, .2)


if __name__ == '__main__':unittest.main()
