import copy,json,os,sys,unittest
from current_finite_joint_replay import replay


@unittest.skipUnless(os.environ.get('STR_CURRENT_FINITE_CAPTURE'),'Explicit actual whole-house captured response required')
class SavedActualControls(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        with open(os.environ['STR_CURRENT_FINITE_CAPTURE']) as stream:cls.capture=json.load(stream)
    def test_actual_loaded_capture(self):
        result=replay(self.capture)
        self.assertGreater(result['portCount'],100)
        self.assertEqual(result['actualNormalCount'],32)
        self.assertLess(max(map(abs,result['independentJointWrenchResidualKN_KNm'])),1e-6)
    def test_changed_head_reaction_rejects_even_with_untouched_saved_residual(self):
        x=copy.deepcopy(self.capture);x['native']['nativeVertical']['native']['heads'][0]['reactionKN_KNm'][2]+=100
        with self.assertRaisesRegex(ValueError,'house six-wrench'):replay(x)
    def test_changed_head_position_rejects(self):
        x=copy.deepcopy(self.capture);x['native']['nativeVertical']['headPositions'][0]['xyzMm'][0]+=100
        with self.assertRaisesRegex(ValueError,'house six-wrench'):replay(x)
    def test_duplicate_head_position_rejects(self):
        x=copy.deepcopy(self.capture);positions=x['native']['nativeVertical']['headPositions'];positions[-1]=copy.deepcopy(positions[0])
        with self.assertRaisesRegex(ValueError,'position catalogue'):replay(x)
    def test_changed_displacement_rejects(self):
        x=copy.deepcopy(self.capture);x['finiteJoint']['portDisplacementsM_Rad'][0]+=.0001
        with self.assertRaisesRegex(ValueError,'displacement'):replay(x)
    def test_dropped_or_double_load_family_rejects(self):
        for action in ('missing','twice'):
            x=copy.deepcopy(self.capture);families=x['finiteJoint']['loadFamilies']
            if action=='missing':families.pop('gravity')
            else:families['duplicate']=copy.deepcopy(families['gravity'])
            with self.assertRaisesRegex(ValueError,'families'):replay(x)
    def test_physical_port_coordinate_tamper_rejects_independent_freebody(self):
        x=copy.deepcopy(self.capture);p=next(p for p in x['finiteJoint']['ports'] if p['id']=='wall/lower/w')
        p['originM'][0]+=.01
        with self.assertRaisesRegex(ValueError,'six-wrench'):replay(x)
    def test_real_contact_missing_rejects(self):
        x=copy.deepcopy(self.capture);removed=x['audit']['actualNormalContactIds'][0]
        x['native']['nativeVertical']['bearings']=[b for b in x['native']['nativeVertical']['bearings'] if b['id']!=removed]
        with self.assertRaisesRegex(ValueError,'catalogue'):replay(x)

if __name__=='__main__':unittest.main()
