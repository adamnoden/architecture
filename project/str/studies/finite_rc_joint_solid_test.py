"""Small real-solid controls, independent of any retained house result."""
import copy
import unittest
import numpy as np

from finite_rc_joint_solid import (build_joint, condense_load, top_patch_load,
                                  line_load, recover)


class SolidJointControls(unittest.TestCase):
    def settings(self):
        return dict(patch_xy_mm=[0,0,600,700], slab_z_mm=[200,300],
                    l_rectangles_xy_mm=[[0,0,100,300],[100,0,300,100]],
                    wall_centroid_xy_mm=[110,110], upper_end_z_mm=500,
                    contours_mm={'east':[0,50,100,300,500,700], 'north':[0,50,100,300,600]},
                    normal_points_xy_mm=[[450,450],[550,600]], chord_axis_xy_mm=[50,50],
                    chord_axial_rigidity_kn=180955., pitch_mm=200., slab_live_kpa=3.)

    @classmethod
    def setUpClass(cls):
        cls.engine = build_joint(**cls().settings())

    def test_exact_volume_consistent_G_Q_wrenches_and_all_six_rigid_modes(self):
        e = self.engine
        self.assertAlmostEqual(e['volumeM3'], .052, places=12)
        self.assertAlmostEqual(e['slabVolumeM3'], .042, places=12)
        self.assertAlmostEqual(e['wallVolumeM3'], .01, places=12)
        expected_g = .042*27+.01*25
        self.assertLess(e['physicalTraceResidual'], 1e-12)
        self.assertLess(e['relativeRigidModeResidual'], 1e-10)
        np.testing.assert_allclose(e['rigidModes'].T@e['gravityLoad'],
            [0,0,-expected_g,-(.042*27*.35+.01*25*.11),.042*27*.3+.01*25*.11,0],atol=1e-11)
        np.testing.assert_allclose(e['rigidModes'].T@e['liveLoad'],
            [0,0,-1.26,-1.26*.35,1.26*.3,0],atol=1e-11)
        values = np.linalg.eigvalsh(e['condensedStiffness'])
        self.assertEqual(np.count_nonzero(values > values[-1]*1e-9), len(e['ports'])-6)
        self.assertFalse(e['candidateAccepted'])

    def test_scalar_normal_ports_leave_actual_tangential_coordinates_free(self):
        e = self.engine
        from finite_rc_joint_solid import _node_lookup
        for i, point in enumerate([[.45,.45,.2],[.55,.6,.2]]):
            node = _node_lookup(e['mesh'], point)
            u,v,w = e['basis'].nodal_dofs[:,node]
            self.assertIn(w, e['boundary'])
            self.assertNotIn(u, e['boundary'])
            self.assertNotIn(v, e['boundary'])
            index = next(j for j,p in enumerate(e['ports']) if p['kind']=='normal' and p['contactIndex']==i)
            self.assertEqual(e['transform'][w,index], 1.)
            self.assertEqual(e['transform'][:,index].count_nonzero(), 1)
        # Arbitrary generalised displacement and arbitrary physical force have
        # exact transpose virtual work; there is no nearest-node load transfer.
        rng = np.random.default_rng(1801)
        q = rng.normal(size=len(e['ports']))*.0001
        f = rng.normal(size=e['basis'].N)
        self.assertAlmostEqual(float(f@(e['response']@q)), float(condense_load(e,f)@q), places=10)

    def test_band_has_inplane_yaw_but_independent_vertical_shell_rotations(self):
        e = self.engine
        bands = [p for p in e['ports'] if p['kind']=='band']
        self.assertEqual(len(bands), 6)
        self.assertEqual({p['coordinate'] for p in bands}, {'u','v','rz'})
        vertical = [p for p in e['ports'] if p['kind']=='shell' and p['xyM'][0]==.6 and p['xyM'][1]<=.1]
        self.assertEqual(len(vertical), 9)
        self.assertEqual({p['coordinate'] for p in vertical}, {'w','rx','ry'})
        q = np.zeros(len(e['ports']))
        j = next(i for i,p in enumerate(e['ports']) if p['kind']=='shell' and p['xyM']==[.6,.05] and p['coordinate']=='w')
        q[j] = 1.
        field = e['transform']@q
        from finite_rc_joint_solid import _node_lookup
        a = _node_lookup(e['mesh'], [.6,0,.25]);b = _node_lookup(e['mesh'], [.6,.05,.25])
        self.assertEqual(field[e['basis'].nodal_dofs[2,a]],0.)
        self.assertEqual(field[e['basis'].nodal_dofs[2,b]],1.)

    def test_real_top_patch_and_midplane_line_have_independent_force_moments(self):
        e = self.engine
        top = top_patch_load(e,[310,320,590,650],2e-6)
        load = .28*.33*2
        np.testing.assert_allclose(e['rigidModes'].T@condense_load(e,top),
                                  [0,0,-load,-load*.485,load*.45,0],atol=1e-11)
        line = line_load(e,axis=0,fixed_coordinate_mm=50,z_mm=250,interval_mm=[80,580],
                         force_density_kn_per_mm=[.001,.002,-.003])
        force = np.array([.5,1.,-1.5]);point = np.array([.33,.05,.25])
        np.testing.assert_allclose(e['rigidModes'].T@condense_load(e,line),
                                  np.r_[force,np.cross(point,force)],atol=1e-11)
        combined = 1.35*e['physicalLoads']['gravity']+e['physicalLoads']['live']+top+line
        q = np.sin(np.arange(len(e['ports'])))*.00001
        result = recover(e,q,combined)
        self.assertLess(result['relativeWorkResidual'], 1e-10)

    def test_chord_changes_stiffness_without_inventing_gravity_or_restraint(self):
        e = self.engine
        no_chord = build_joint(**{**self.settings(),'chord_axial_rigidity_kn':0.})
        self.assertEqual(e['volumeM3'],no_chord['volumeM3'])
        np.testing.assert_array_equal(e['physicalLoads']['gravity'], no_chord['physicalLoads']['gravity'])
        self.assertGreater(np.max(abs(e['condensedStiffness']-no_chord['condensedStiffness'])),1.)
        self.assertLess(no_chord['relativeRigidModeResidual'],1e-10)

    def test_duplicate_contact_and_missing_native_band_edge_reject(self):
        for edit in [
            {'normal_points_xy_mm':[[450,450],[450,450]]},
            {'normal_points_xy_mm':[[50,50]]},
            {'contours_mm':{'east':[0,50,300,500,700],'north':[0,50,100,300,600]}},
        ]:
            with self.assertRaises(ValueError):build_joint(**{**self.settings(),**edit})


if __name__=='__main__':unittest.main()
