import copy
import unittest
from joined_successor_kernel import FrameModel
from finite_mapped_frame import node_trace
from wet_masonry_arch_bed import add_normal_bed,admit_bed


class NormalBedTest(unittest.TestCase):
    def model(self,cells=8,moment=0):
        frame=FrameModel();lower=frame.node('LOWER',[0,0,0]);foot=frame.node('FOOT',[0,0,0])
        for i in range(6):frame.fixed[(lower,i)]=0.
        for i in (0,1,5):frame.fixed[(foot,i)]=0.
        bed=add_normal_bed(frame,'BED',foot,[-70,-225,70,225],lambda point:([(lower,[0,0,1,point[1],-point[0],0])],'actual-fixed-control'),cells,.1)
        frame.load(foot,[0,0,-10,moment,0,0]);return frame,bed

    def test_centred_rigid_foot_has_independent_uniform_pressure_and_compliance(self):
        frame,bed=self.model();raw=frame.solve();states={s['id']:s for s in raw['springs']}
        self.assertAlmostEqual(raw['displacements']['FOOT'][2],-10*.1*1000/(140*450),places=12)
        self.assertAlmostEqual(sum(-states[f['id']]['forceKN'] for f in bed['fibres']),10,places=10)
        self.assertLess(bed['maximumRigidWorkResidual'],1e-12)
        self.assertTrue(all(abs(raw['supportWrenches']['FOOT'][i])<1e-12 for i in range(6)))

    def test_eccentric_rigid_foot_closes_actual_force_and_first_moment(self):
        frame,bed=self.model(moment=200);raw=frame.solve();states={s['id']:s for s in raw['springs']}
        force=sum(-states[f['id']]['forceKN'] for f in bed['fibres'])
        mx=sum(-states[f['id']]['forceKN']*f['xyMm'][1] for f in bed['fibres'])
        self.assertAlmostEqual(force,10,places=10);self.assertAlmostEqual(mx,-200,places=8)
        self.assertTrue(all(states[f['id']]['forceKN']<0 for f in bed['fibres']))
        # Independent exact discrete stiffness of the midpoint footprint.
        krot=sum(f['stiffnessKNPerMm']*f['xyMm'][1]**2 for f in bed['fibres'])
        self.assertAlmostEqual(raw['displacements']['FOOT'][3],200/krot,places=12)

    def test_partial_contact_refines_toward_independent_triangular_pressure_oracle(self):
        # e=100mm >450/6: exact compression block length3*(225-100)=375mm.
        # pmax=2*10000/(140*375), theta=pmax*compliance/375.
        theta=(2*10000/(140*375))*.1/375
        exact_uz=-150*theta;errors=[]
        for cells in (4,8,16):
            frame,bed=self.model(cells=cells,moment=1000);raw=frame.solve()
            states={s['id']:s for s in raw['springs']}
            forces=[-states[f['id']]['forceKN'] for f in bed['fibres']]
            self.assertTrue(any(not states[f['id']]['active'] for f in bed['fibres']))
            self.assertAlmostEqual(sum(forces),10,places=9)
            self.assertAlmostEqual(sum(n*f['xyMm'][1] for n,f in zip(forces,bed['fibres'])),-1000,places=7)
            errors.append(abs(raw['displacements']['FOOT'][3]-theta)+abs(raw['displacements']['FOOT'][2]-exact_uz))
        self.assertGreater(errors[0],errors[1]);self.assertGreater(errors[1],errors[2])
        self.assertLess(errors[2],.00005)

    def test_adverse_uplift_has_no_normal_resistance(self):
        frame,bed=self.model();frame.loads['FOOT']=[0,0,10,0,0,0]
        with self.assertRaises(ValueError):frame.solve()

    def test_missing_key_or_invalid_compliance_is_not_implicitly_friction(self):
        value={'enabled':True,'cellsPerAxis':8,'normalComplianceMmPerMPa':.1,
               'tangentialKeyHypothesis':'ideal-work-dual-centroid-ux-uy-rz'}
        self.assertEqual(admit_bed(value),value)
        for field,changed in [('normalComplianceMmPerMPa',0),('normalComplianceMmPerMPa',float('nan')),
                              ('cellsPerAxis',3),('tangentialKeyHypothesis','friction'),('enabled',1)]:
            trial=copy.deepcopy(value);trial[field]=changed
            with self.assertRaises(ValueError):admit_bed(trial)
        frame=FrameModel();foot=frame.node('F',[0,0,0])
        def missing(point):raise ValueError('No contained finite receiver')
        with self.assertRaises(ValueError):add_normal_bed(frame,'X',foot,[-1,-1,1,1],missing,2,.1)


if __name__=='__main__':unittest.main()
