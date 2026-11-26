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
                    chord_axial_rigidity_kn=180955., band_width_mm=100., pitch_mm=200., slab_live_kpa=3.)

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

    def test_external_port_wrench_changes_reaction_and_work_but_not_fixed_q_solid(self):
        e = self.engine
        q = np.sin(np.arange(len(e['ports'])))*.00001
        physical = 1.35*e['physicalLoads']['gravity']+e['physicalLoads']['live']
        before = recover(e,q,physical)
        port_load = np.zeros(len(e['ports']))
        force = np.array([1.5,-2.,3.]);moment = np.array([.1,-.2,.3])
        for i,port in enumerate(e['ports']):
            if port['id'].startswith('wall/lower/'):
                port_load[i] = np.r_[force,moment][('u','v','w','rx','ry','rz').index(port['coordinate'])]
        expected_wrench = np.r_[force,moment+np.cross([.11,.11,.2],force)]
        np.testing.assert_allclose(e['rigidModes'].T@port_load,expected_wrench,atol=1e-12)
        after = recover(e,q,physical,external_port_load=port_load)
        np.testing.assert_array_equal(after['physicalDisplacementsM'],before['physicalDisplacementsM'])
        self.assertEqual(after['strainEnergyKNm'],before['strainEnergyKNm'])
        np.testing.assert_allclose(after['portReactionKN_KNm'],before['portReactionKN_KNm']-port_load,atol=1e-12)
        self.assertAlmostEqual(after['externalLoadWorkKNm'],before['externalLoadWorkKNm']+q@port_load,places=12)
        np.testing.assert_allclose(e['rigidModes'].T@after['portReactionKN_KNm']+
            e['rigidModes'].T@condense_load(e,physical)+expected_wrench,np.zeros(6),atol=1e-9)
        self.assertLess(after['relativeWorkResidual'],1e-10)
        for invalid in (port_load[:-1],np.full(len(port_load),float('nan')),
                        np.full(len(port_load),float('inf'))):
            with self.assertRaises(ValueError):recover(e,q,physical,external_port_load=invalid)

    def test_wider_actual_wall_preserves_source_band_chord_and_exact_material_load(self):
        e = self.engine
        widened = build_joint(**{**self.settings(),
            'l_rectangles_xy_mm':[[0,0,150,300],[150,0,300,150]],
            'wall_centroid_xy_mm':[125,125]})
        self.assertEqual([p for p in e['ports'] if p['kind']!='wall'],
                         [p for p in widened['ports'] if p['kind']!='wall'])
        self.assertEqual(e['slabVolumeM3'],widened['slabVolumeM3'])
        self.assertAlmostEqual(widened['wallVolumeM3'],.0135,places=12)
        self.assertAlmostEqual(widened['volumeM3']-e['volumeM3'],.0035,places=12)
        np.testing.assert_allclose(widened['rigidModes'].T@widened['gravityLoad'],
            [0,0,-(.042*27+.0135*25),-(.042*27*.35+.0135*25*.125),
             .042*27*.3+.0135*25*.125,0],atol=1e-11)
        np.testing.assert_allclose(widened['rigidModes'].T@widened['liveLoad'],
                                  e['rigidModes'].T@e['liveLoad'],atol=1e-11)
        self.assertLess(widened['physicalTraceResidual'],1e-12)
        self.assertLess(widened['relativeRigidModeResidual'],1e-10)
        values = np.linalg.eigvalsh(widened['condensedStiffness'])
        self.assertEqual(np.count_nonzero(values > values[-1]*1e-9),len(widened['ports'])-6)
        self.assertGreater(np.max(abs(widened['condensedStiffness']-e['condensedStiffness'])),1.)
        q = np.sin(np.arange(len(widened['ports'])))*.00001
        result = recover(widened,q,1.35*widened['physicalLoads']['gravity']+widened['physicalLoads']['live'])
        self.assertGreater(result['strainEnergyKNm'],0.)
        self.assertLess(result['relativeWorkResidual'],1e-10)

    def test_duplicate_contact_and_missing_native_band_edge_reject(self):
        for edit in [
            {'normal_points_xy_mm':[[450,450],[450,450]]},
            {'normal_points_xy_mm':[[50,50]]},
            {'contours_mm':{'east':[0,50,300,500,700],'north':[0,50,100,300,600]}},
            {'band_width_mm':0.},
            {'band_width_mm':-100.},
            {'band_width_mm':float('nan')},
            {'band_width_mm':float('inf')},
            {'band_width_mm':701.},
            {'band_width_mm':150.},
        ]:
            with self.assertRaises(ValueError):build_joint(**{**self.settings(),**edit})


if __name__=='__main__':unittest.main()
