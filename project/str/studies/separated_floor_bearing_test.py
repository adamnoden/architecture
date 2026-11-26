import copy,unittest,xml.etree.ElementTree as ET
from separated_floor_bearing import load,derive,three_constraints,source_wind,uncovered_area,plan_svg,section_svg

class SeparatedBearingControls(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.settings,cls.raw=load();cls.value,cls.house,cls.grid,cls.floors=derive(cls.settings,cls.raw)
    def test_every_actual_new_arm_has_full_actual_ground_bearing(self):
        v=self.value
        self.assertEqual(len(v['corners']),4)
        self.assertTrue(v['allNewCornerGravityFootprintsOnActualGroundGirders'])
        self.assertEqual([r['completeArmGroundEdgeMarginsMm'] for r in v['corners']],[[70.,70.],[170.,70.],[70.,70.],[170.,70.]])
        self.assertTrue(all(r['missingGroundBearingAreaMm2']==0 for r in v['corners']))
        self.assertEqual(v['newLowerBodyWeightIsNetGChange'],False)
    def test_widening_to_off_girder_gravity_arm_rejects(self):
        s=copy.deepcopy(self.settings);s['proposal']['masonryWidthMm']=230.
        with self.assertRaisesRegex(ValueError,'ground girder|complete girder'):derive(s,self.raw)
    def test_geometry_edit_propagates_to_seat_finish_weight_and_svg(self):
        s=copy.deepcopy(self.settings);s['proposal']['isolationGapMm']=20.;s['proposal']['extraLeafEndGapMm']=20.
        v,h,g,f=derive(s,self.raw)
        self.assertEqual(v['newGroundFinishedFaceSWMm'],649.5)
        self.assertEqual(v['newFinishedToeSWMm'],1309.5)
        self.assertNotEqual(v['newLowerBodyEnvelopeComparisonGKN'],self.value['newLowerBodyEnvelopeComparisonGKN'])
        svg=section_svg(v,h,g);self.assertIn('649.5',svg);self.assertIn('1309.5',svg);self.assertIn('−',svg)
    def test_actual_three_constraint_statics_and_unclosed_six_wrench_are_distinct(self):
        v=self.value
        self.assertEqual(len(v['sourceFloorPressureOnlyStatics']),96)
        self.assertLess(v['maximumThreeConstraintFloorPressureEquilibriumResidualKN_KNm'],1e-8)
        self.assertGreater(v['maximumUnclosedOutOfPlanePressureMomentKNm'],9.)
        self.assertFalse(v['fullHouseReactionsCalculated'])
        self.assertFalse(v['allFourFiniteJointsResolved'])
    def test_real_torsion_lever_and_changed_pressure_recompute(self):
        p=self.value['horizontalConstraintPointsXYMm']
        self.assertEqual(three_constraints([0.,0.,10.],p)['torsionLeverMm'],10175.)
        a=three_constraints([10.,20.,30.],p);b=three_constraints([20.,40.,60.],p)
        for x,y in zip(a['onFloorKN'],b['onFloorKN']):self.assertAlmostEqual(y,2*x)
        with self.assertRaises(ValueError):three_constraints([0.,0.,10.],[p[0],p[1],p[0]])
    def test_native_pressure_recipe_change_rejects_instead_of_reusing_old_pressure(self):
        r=copy.deepcopy(self.raw);path='project/str/studies/current-house-roof-bracing.py'
        old=r[path];r[path]=old.replace(b'12200 if mode!=1 else 6000',b'12201 if mode!=1 else 6000')
        self.assertNotEqual(r[path],old)
        with self.assertRaisesRegex(ValueError,'native pressure extent recipe changed'):source_wind(r,31,{'A':332.5,'B':11667.5})
    def test_three_constraints_allow_uniform_thermal_expansion_four_tight_ones_do_not(self):
        t=self.value['thermalIllustration']
        self.assertEqual(t['threeConstraintResidualMm'],[0.,0.,0.])
        self.assertAlmostEqual(t['NEFreeMovementXYMm'][0],3.3225)
        self.assertGreater(t['NEFreeMovementXYMm'][0],0.)
    def test_no_room_service_or_upper_wall_pass_is_invented(self):
        v=self.value
        conflicts={x['id'] for c in v['corners'] for x in c['groundCurrentFurnitureConflicts']}
        self.assertTrue({'study-desk','service-utility-sink','rear-stack','north-cooking-station','service-kitchen-feed-column'}<=conflicts)
        self.assertFalse(v['newFirstGravityWallsAdded'])
        self.assertFalse(v['ownerAccepted'])
        for svg in (plan_svg(v,self.house,self.grid,self.floors),section_svg(v,self.house,self.grid)):
            ET.fromstring(svg)
            self.assertIn('UNCALCULATED',svg)
    def test_missing_physical_support_cannot_be_replaced_by_a_nearest_centroid(self):
        self.assertEqual(uncovered_area([[0.,0.,100.,100.]],[[0.,0.,50.,100.]]),5000.)
if __name__=='__main__':unittest.main()
