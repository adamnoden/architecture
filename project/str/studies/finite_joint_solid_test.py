import unittest

import numpy as np
from scipy.sparse.linalg import splu
from skfem.models.elasticity import lame_parameters

from finite_joint_solid import component, condense_end_ports, rigid_trace, gravity_force, condensed_load


class SolidControls(unittest.TestCase):
    def test_six_rigid_modes_and_affine_patch(self):
        mesh, basis, k, volume = component([[0, 0, 1, 1]], [0, .4, 1], .25, 33e6, .2)
        rigid = np.zeros((basis.N, 6))
        for node, trace in enumerate(rigid_trace(mesh.p, [0, 0, 0])):
            rigid[basis.nodal_dofs[:, node]] = trace
        self.assertLess(np.max(np.abs(k @ rigid))/abs(k).max(), 1e-12)
        gradient = np.array([[.001, .0003, -.0002], [.0001, -.0004, .0002], [0, .0001, .0007]])
        affine = np.zeros(basis.N)
        affine[basis.nodal_dofs] = gradient @ mesh.p
        interior = np.setdiff1d(np.arange(basis.N), basis.get_dofs().all())
        solution = affine.copy()
        solution[interior] = 0
        solution[interior] = splu(k[interior][:, interior]).solve(-(k @ solution)[interior])
        np.testing.assert_allclose(solution, affine, atol=1e-15)
        strain = (gradient+gradient.T)/2
        lam, mu = lame_parameters(33e6, .2)
        exact_energy = volume*(lam*np.trace(strain)**2+2*mu*np.sum(strain**2))/2
        self.assertAlmostEqual(float(affine @ (k @ affine))/2, exact_energy, places=10)

    def test_ports_preserve_energy_work_and_six_rigid_modes(self):
        mesh, basis, k, _ = component([[0, 0, .2, 1], [.2, 0, 1, .2]], [0, .2, 1], .2, 33e6, .2)
        condensed, displacement, origins, residual = condense_end_ports(mesh, basis, k)
        self.assertLess(residual/abs(k).max(), 1e-11)
        rotations = np.column_stack([np.zeros((3, 3)), np.eye(3)])
        modes = np.concatenate([np.vstack([rigid_trace(origin[:, None], [0, 0, 0])[0], rotations])
                                for origin in origins])
        self.assertLess(np.max(np.abs(condensed @ modes))/abs(condensed).max(), 1e-11)
        eigenvalues = np.linalg.eigvalsh(condensed)
        self.assertEqual(int(np.count_nonzero(eigenvalues > eigenvalues[-1]*1e-9)), 6)
        self.assertGreater(eigenvalues[0], -eigenvalues[-1]*1e-11)
        q = np.arange(12)*.00001
        u = displacement @ q
        self.assertAlmostEqual(float(q @ condensed @ q), float(u @ k @ u), places=10)
        reactions = k @ u
        np.testing.assert_allclose(displacement.T @ reactions, condensed @ q, atol=1e-10)
        force = gravity_force(basis, lambda x: np.full(x.shape[1:], 25.))
        port_force, particular, energy_constant = condensed_load(k, basis, mesh, displacement, force)
        # Distributed G and condensed ports have identical six rigid-body work.
        nodal_modes = np.zeros((basis.N, 6))
        for node, trace in enumerate(rigid_trace(mesh.p, [0, 0, 0])):
            nodal_modes[basis.nodal_dofs[:, node]] = trace
        np.testing.assert_allclose(modes.T @ port_force, nodal_modes.T @ force, atol=1e-10)
        # Static condensation preserves the complete potential including particular load work.
        loaded_u = displacement @ q+particular
        actual = .5*loaded_u @ k @ loaded_u-force @ loaded_u
        expected = .5*q @ condensed @ q-port_force @ q+energy_constant
        self.assertAlmostEqual(float(actual), float(expected), places=10)

    def test_exact_void_volume_material_perturbation_and_overlap_rejection(self):
        args = ([[0, 0, .14, 1], [.14, 0, 1, .14]], [0, .2], .1)
        mesh, _, k, volume = component(*args, 33e6, .2)
        self.assertAlmostEqual(volume, .2604*.2, places=13)
        centers = mesh.p[:, mesh.t].mean(axis=1)
        self.assertFalse(np.any((centers[0] > .14) & (centers[1] > .14)))
        _, _, doubled, _ = component(*args, 66e6, .2)
        np.testing.assert_allclose(doubled.toarray(), 2*k.toarray(), rtol=1e-13)
        with self.assertRaisesRegex(ValueError, 'overlapping'):
            component([[0, 0, 1, 1], [.5, .5, 2, 2]], [0, 1], .1, 33e6, .2)
        with self.assertRaises(ValueError):
            component(*args, 33e6, .5)


if __name__ == '__main__':
    unittest.main()
