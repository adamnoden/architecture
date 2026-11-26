"""Actual-source geometry, continuous motion and matched drawing controls."""
import copy
import json
from pathlib import Path
import unittest

from rear_bearing_plan import (choices_defaults,admit_choices,geometry,render_plan,
                              render_section,_pose,_polygon_gap,_rect,_sweep)
from seated_wet_support import reference_support

ROOT=Path(__file__).resolve().parents[3]


class RearBearingPlanControls(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.h=json.loads((ROOT/'project/had/studies/water-replan.json').read_text())['model']
        cls.grid=json.loads((ROOT/'project/str/studies/current-house-grid.json').read_text())
        cls.renewal=json.loads((ROOT/'project/ias/studies/selected-family-convergence.json').read_text())['rearRenewal']['firstReleaseInterface']
        cls.native={'wetSupport':reference_support(cls.h)}
        cls.g=geometry(cls.h,cls.grid,choices_defaults(),cls.renewal,cls.native)

    def test_source_anchors_material_partition_and_full_footprint(self):
        g=self.g
        self.assertEqual(g['wallRectangleXYMm'],[2844.5,8627.5,2984.5,11737.5])
        self.assertEqual(g['axisXMm'],2914.5)
        self.assertEqual(g['lintelRectangleXYMm'],[2814.5,8900.,3014.5,11150.])
        self.assertEqual(g['fullHeightTailRectanglesXYMm'],[[2844.5,8627.5,2984.5,8900.],[2844.5,11150.,2984.5,11737.5]])
        self.assertEqual(g['bearingRectanglesXYMm'],[[2844.5,8900.,2984.5,9100.],[2844.5,10950.,2984.5,11150.]])
        self.assertEqual((g['lintelTopZMm'],g['lintelBottomZMm'],g['masonryBearingTopZMm']),(3370,3070,3060))
        self.assertEqual(g['lowerFinishedWestXMm'],g['protectedStairFinishedXMm'])
        self.assertEqual(g['upperLowerCoreOverlapMm'],128.)
        self.assertTrue(g['groundFootprintCoverage']['completePhysicalFootprintCovered'])
        self.assertEqual(g['finishedClearWidthMm'],1796.)
        self.assertEqual(g['southCrossPassageMm'],673.)

    def test_actual_sofa_rotation_and_replacement_renewal_state(self):
        g=self.g;route=g['familySofaRenewalRoute']
        self.assertTrue(g['planPass']);self.assertTrue(route['pass_'])
        self.assertGreater(route['clearanceLowerBoundMm'],33.)
        self.assertEqual(g['familySofaRenewalParkXYMm'],[3075.,9250.,3825.,11150.])
        self.assertFalse(g['oldFamilyNorth650Park']['pass_'])
        self.assertLess(g['oldFamilyNorth650Park']['northPierSignedClearanceMm'],0.)
        self.assertEqual(g['rearSpoolRenewal']['platformGapsMm']['reading-sofa1900x850'],25.)
        self.assertEqual(g['westSofaRenewal']['bodyCentrePath'],[[1975,9475.],[2625,9475.]])
        self.assertEqual(g['westSofaRenewal']['bodyFixedGapsMm']['family-sofa1900x750'],25.)
        self.assertEqual(g['westSofaRenewal']['southJambRectangularBodyReserveMm'],48.)
        self.assertEqual(g['westSofaRenewal']['parkedSofaBGapMm'],37.5)
        self.assertFalse(g['appearanceAccepted']);self.assertFalse(g['physicalHandlingAccepted'])

    def test_motion_adverse_obstacle_cannot_inherit_nominal_pass(self):
        room=[0.,0.,3000.,3000.];stages=[[1500.,1500.,0.],[1500.,1500.,90.]]
        good=_sweep(stages,[1900.,750.],{},room,samples=90)
        bad=_sweep(stages,[1900.,750.],{'intrusion':[2100.,2000.,2300.,2200.]},room,samples=90)
        self.assertTrue(good['pass_']);self.assertFalse(bad['pass_'])
        self.assertLess(bad['clearanceLowerBoundMm'],0.)

    def test_real_rectangle_clearance_does_not_use_circumscribed_sofa_circle(self):
        sofa=_pose([0.,0.],[1900.,750.],90.)
        obstacle=_rect([500.,-100.,600.,100.])
        self.assertGreater(_polygon_gap(sofa,obstacle),100.)
        self.assertLess(500-(1900**2+750**2)**.5/2,0.)

    def test_input_perturbation_propagates_and_missing_actual_reference_withholds(self):
        changed={**choices_defaults(),'openingYMm':[9125.,10925.],'lintelDepthMm':350.}
        g=geometry(self.h,self.grid,changed,self.renewal,self.native)
        self.assertEqual(g['finishedClearWidthMm'],1746.)
        self.assertEqual(g['lintelBottomZMm'],3020.)
        self.assertEqual(g['masonryBearingTopZMm'],3010.)
        self.assertEqual(g['bearingRectanglesXYMm'][0][1:4:2],[8925.,9125.])
        self.assertNotEqual(g['sourceGeometryDigest'],self.g['sourceGeometryDigest'])
        without=geometry(self.h,self.grid,choices_defaults())
        self.assertFalse(without['planPass'])
        self.assertEqual(without['rearSpoolRenewal']['state'],'unsupported-missing-IAS-reference')
        self.assertEqual(without['oldSeatedReference']['state'],'unsupported-missing-executed-native-wetSupport')

    def test_choice_adverse_and_source_dimension_guards(self):
        for edit in ({'openingYMm':[10950.,9100.]},{'masonryUnitWeightKNPerM3':19.},
                     {'bearingQuadratureOrder':3},{'jointThicknessMm':float('nan')}):
            with self.assertRaises(ValueError):admit_choices({**choices_defaults(),**edit})
        for edit in ({'openingYMm':[9100.,11700.]},{'lintelWidthMm':140.}):
            with self.assertRaises(ValueError):geometry(self.h,self.grid,{**choices_defaults(),**edit},self.renewal,self.native)

    def test_matched_drawings_own_executed250_not_stale_HAD200(self):
        g=self.g;old=g['oldSeatedReference']
        self.assertEqual(old['settings']['beamWidthMm'],250.)
        self.assertEqual(old['sourceHADWidthMm'],200)
        self.assertFalse(old['sourceHADWidthDescribesExecutedBeam'])
        plan=render_plan(g);section=render_section(g)
        self.assertIn('250 × 350 RC beam',plan)
        self.assertIn('200 × 300 short lintel',plan)
        self.assertIn('3020',section);self.assertIn('3070',section);self.assertIn('3060',section)
        for svg in (plan,section):self.assertIn(g['sourceGeometryDigest'],svg)
        self.assertEqual(g['stairRectangleXYMm'][3],self.h['stair'][1]+self.h['stair'][3])


if __name__=='__main__':unittest.main()
