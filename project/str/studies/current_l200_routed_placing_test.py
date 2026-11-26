import math,unittest
from current_l200_routed_placing import paired_bend_crossing,arc_column_clear

class PlacingControls(unittest.TestCase):
    def test_original_exact_crossing_is_on_both_arcs(self):
        r=paired_bend_crossing(3314.,3226.,106.,100.,100.,100.)
        self.assertTrue(r['samePlaneCentrelineCrossing'])
        x,z=r['crossingAcrossMm'],r['crossingZMm']
        self.assertAlmostEqual(x,120.02325895918129)
        self.assertAlmostEqual(z,3270.)
        self.assertAlmostEqual((x-206.)**2+(z-3208.)**2,106.**2)
        self.assertAlmostEqual((x-206.)**2+(z-3332.)**2,106.**2)
    def test_skew_planes_remove_centreline_intersection(self):
        r=paired_bend_crossing(3314.,3226.,106.,100.,100.,135.)
        self.assertFalse(r['samePlaneCentrelineCrossing'])
        self.assertEqual(r['crossingPlaneSeparationMm'],35.)
    def test_large_vertical_separation_does_not_invent_crossing(self):
        self.assertFalse(paired_bend_crossing(4000.,3200.,106.,100.,100.,100.)['samePlaneCentrelineCrossing'])
    def test_arc_crosses_actual_vertical_main_when_projected_x_is_inside_range(self):
        r=arc_column_clear(100.,158.,375.,'x',(135.,375.),16.,12.,10.)
        self.assertEqual(r['nominalCylinderClearMm'],-14.)
        self.assertEqual(r['adverseCylinderClearLowerMm'],-14.)
    def test_vertical_column_outside_projection_has_real_positive_clearance(self):
        r=arc_column_clear(100.,158.,375.,'x',(65.,375.),16.,12.,10.)
        self.assertEqual(r['nominalCylinderClearMm'],21.)
        self.assertEqual(r['adverseCylinderClearLowerMm'],11.)
    def test_independent_setting_can_turn_small_nominal_gap_into_true_overlap(self):
        r=arc_column_clear(100.,158.,375.,'x',(135.,392.5),16.,12.,10.)
        self.assertEqual(r['nominalCylinderClearMm'],3.5)
        self.assertEqual(r['adverseCylinderClearLowerMm'],-6.5)
    def test_rotating_bend_and_main_preserves_clearance(self):
        x=arc_column_clear(100.,158.,375.,'x',(135.,392.5),16.,12.,10.)
        y=arc_column_clear(100.,158.,375.,'y',(392.5,135.),16.,12.,10.)
        self.assertEqual(x,y)
    def test_invalid_geometry_rejected(self):
        for args in [(3314.,3226.,0.,100.,100.,100.),(3314.,3226.,math.nan,100.,100.,100.),(3200.,3300.,106.,100.,100.,100.)]:
            with self.assertRaises(ValueError):paired_bend_crossing(*args)
if __name__=='__main__':unittest.main()
