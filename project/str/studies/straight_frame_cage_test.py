import copy
import json
import math
from pathlib import Path
import unittest

from straight_frame_cage import (assess_straight_frame_cage, reference_straight_frame_cage_settings,
    _pairs, _path, _bar_paths, _main_bar_cover, reference_straight_frame_cage_result,
    reference_six_bar_straight_frame_cage_settings, _mixed_layer_capacity,
    _station_bars, _segment_box_distance, _admit)
from continuous_rc_cage import _layer_capacity

ROOT=Path(__file__).resolve().parents[3]

class StraightFrameCageTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.actual=reference_straight_frame_cage_result()
        cls.settings=reference_straight_frame_cage_settings()
        cls.reference=assess_straight_frame_cage(cls.actual)

    def test_whole_route_has_straight_posts_separate_hairpins_and_downturned_beams(self):
        r=self.reference
        self.assertEqual(len(r['longitudinalBars']),28)
        self.assertEqual(len([x for x in r['longitudinalBars'] if x['kind']=='straight-post']),16)
        self.assertEqual(len([x for x in r['longitudinalBars'] if x['kind']=='independent-direct-bearing-abutment-hairpin']),4)
        self.assertEqual(len([x for x in r['longitudinalBars'] if x['kind']=='ordinary-downturned-beam-bar']),8)
        self.assertEqual(r['failedMainBarPairCount'],0)
        self.assertGreater(r['minimumMainBarAdverseClearanceMm'],21)
        self.assertTrue(all(d.get('tailReserveMm',d.get('capReserveMm'))>0 for d in r['fullForceDevelopment']))
        self.assertTrue(r['beamFullYieldMandrelComparatorPasses'])
        self.assertFalse(r['closedLinkHookClosure']['hookClosureGeometryAccepted'])
        self.assertFalse(r['reinforcementAccepted'])

    def test_source200_joint_rejects_straight_290_post_bar_cover(self):
        # Labelled geometry control; no old forces qualify a changed beam.
        candidate=copy.deepcopy(self.actual)
        for row in candidate['nativeVertical']['native']['memberCuts']:
            if row['kind']=='upstand':row['breadthMm']=200
        _,_,_,_,geometry=_bar_paths(candidate,self.settings)
        self.assertEqual(geometry['source200BeamPostBarCoverMm'],18)
        self.assertEqual(geometry['actualBeamPostBarAdverseCoverMm'],8)

    def test_width290_is_only_an_explicit_geometry_control_not_reused_native_force_approval(self):
        # Synthetic geometry control, not an actual new structural solve.
        candidate=copy.deepcopy(self.actual)
        for row in candidate['nativeVertical']['native']['memberCuts']:
            if row['kind']=='upstand':row['breadthMm']+=10
        with self.assertRaisesRegex(ValueError,'old-force geometry substitution'):
            assess_straight_frame_cage(candidate)
        # Pure geometry inspection is explicitly separate from force assessment.
        for row in candidate['nativeVertical']['native']['memberCuts']:
            if row['kind']=='upstand':row['breadthMm']=290
        bars,_,_,_,geometry=_bar_paths(candidate,self.settings)
        self.assertEqual(geometry['actualBeamPostBarAdverseCoverMm'],53)
        covers=_main_bar_cover(candidate,bars,geometry,self.settings)
        self.assertGreater(min(r['adverseSurfaceCoverLowerBoundMm'] for r in covers),40)

    def test_signed_reversal_recomputes_actual_vectors_without_component_envelope(self):
        candidate=copy.deepcopy(self.actual)
        for row in candidate['nativeVertical']['native']['memberCuts']:
            for field in ('shearYKN','shearZKN','torsionKNm','bendingYKNm','bendingZKNm'):row[field]*=-1
        r=assess_straight_frame_cage(candidate)
        self.assertNotEqual(r['simultaneousCutDigest'],self.reference['simultaneousCutDigest'])
        self.assertAlmostEqual(r['worstSectionScreen']['linearUniaxialRatio'],self.reference['worstSectionScreen']['linearUniaxialRatio'],10)
        self.assertEqual(r['allSectionComparisonsWithinOne'],self.reference['allSectionComparisonsWithinOne'])

    def test_tail_and_mandrel_adverse_cases_do_not_inherit_pass(self):
        r=assess_straight_frame_cage(self.actual,{**self.settings,'beamMandrelMm':100,'beamStraightTailMm':400})
        self.assertFalse(r['beamFullYieldMandrelComparatorPasses'])
        self.assertTrue(any(x.get('tailReserveMm',1)<0 for x in r['fullForceDevelopment']))
        self.assertEqual(r['nativeSourceSHA256'],self.reference['nativeSourceSHA256'])

    def test_actual_named_caps_have_new_mat_routes_clearing_every_starter(self):
        r=self.reference
        self.assertEqual({x['id'] for x in r['capInterfaces']},{'P25','P26','P28','P30'})
        self.assertGreater(min(x['minimumStarterMatAdversePlanClearanceMm'] for x in r['capInterfaces']),21)
        self.assertTrue(all(x['newFabricationSchedule'] for x in r['capInterfaces']))
        self.assertTrue(all(x['pileInterfaceAccepted'] is False for x in r['capInterfaces']))

    def test_whole_cap_return_rejection_and_manufactured_headed_alternative_remain_distinct(self):
        for cap in self.reference['capInterfaces']:
            self.assertFalse(cap['fullForceMatHookAssemblyPasses'])
            self.assertLess(cap['minimumTopBottomMatAdverseClearanceMm'],0)
            self.assertLess(cap['minimumWithinLayerHookAdverseClearanceMm'],0)
            self.assertGreater(cap['deeperConventionalCapComparison']['minimumTopBottomMatAdverseClearanceMm'],21)
            self.assertFalse(cap['deeperConventionalCapComparison']['completeHookAssemblyPasses'])
            head=cap['headedStraightMatComparison']
            for key in ('minimumHeadHeadAdverseEnvelopeClearMm','minimumHeadStarterAdverseClearMm','minimumMatStarterAdverseClearMm'):
                self.assertGreater(head[key],21)
            self.assertGreater(head['minimumHeadSurfaceAdverseCoverMm'],40)
            self.assertEqual(head['manufacturerMinimumConcreteGrade'],'C32/40')
            self.assertFalse(head['concreteGradeEstablished'])
            self.assertFalse(head['localBearingBurstingAccepted'])
            self.assertFalse(head['candidateAccepted'])

    def test_path_distance_conservatively_bounds_independent_orthogonal_crossing(self):
        a=_path('outer-north/a',12,[[0,0,0],[100,0,0]],'test')
        b=_path('outer-north/b',10,[[50,0,-50],[50,0,50]],'test')
        r=_pairs([a,b],self.settings)[0]
        self.assertEqual(r['nominalSurfaceClearanceMm'],-11)
        self.assertLess(r['adverseSurfaceClearanceLowerBoundMm'],0)
        b['pointsXYZMm']=[[50,100,-50],[50,100,50]]
        r=_pairs([a,b],self.settings)[0]
        self.assertAlmostEqual(r['adverseSurfaceClearanceLowerBoundMm'],79)

    def test_source_injection_nonfinite_and_invalid_settings_reject(self):
        for mutate in (lambda r:r['sourceSHA256'].__setitem__('project/str/studies/continuous_rc_cage.py','0'*64),
                       lambda r:r['nativeVertical']['native']['memberCuts'][0].__setitem__('bendingYKNm',math.nan)):
            r=copy.deepcopy(self.actual);mutate(r)
            with self.assertRaises(ValueError):assess_straight_frame_cage(r)
        for s in ({**self.settings,'approved':True},{**self.settings,'steelYieldMPa':500},{**self.settings,'beamMandrelMm':float('nan')}):
            with self.assertRaises(ValueError):assess_straight_frame_cage(self.actual,s)

    def test_mixed_diameter_section_reduces_to_existing_uniform_source_method(self):
        for axial in (-20.,0.,100.):
            for reverse in (False,True):
                positions=[69.,69.,323.5,323.5]
                actual=_mixed_layer_capacity(290.,392.5,[(v,12.) for v in positions],axial,reverse,self.settings)
                expected=_layer_capacity(290.,392.5,positions,axial,reverse,12.,self.settings['strengthSteelFraction'])
                self.assertAlmostEqual(actual,expected,6)

    def test_station_intersections_do_not_credit_curtailed_wing_bars_above_their_end(self):
        bars=[_path('outer-north/west/post/0',16,[[1,2,-680],[1,2,3800]],'straight-post'),
              _path('outer-north/west/wing-straight/-1',16,[[3,4,-680],[3,4,2250]],'straight-lower-wing'),
              _path('outer-north/west/wing-bend',16,[[5,6,2200],[6,7,2300]],'unsupported-inclined-bar')]
        row={'memberId':'outer-north/west/A-post/0','physicalPointMm':[0,0,-180]}
        self.assertEqual(len(_station_bars(row,bars)),2)
        row['physicalPointMm'][2]=2251
        self.assertEqual(len(_station_bars(row,bars)),1)
        row['physicalPointMm'][2]=2250
        self.assertEqual(len(_station_bars(row,bars)),2)

    def test_segment_box_oracle_handles_crossing_skew_and_point(self):
        box=[-1.,-1.,-1.,1.,1.,1.]
        self.assertEqual(_segment_box_distance([-2,0,0],[2,0,0],box),0.)
        self.assertEqual(_segment_box_distance([-2,2,0],[2,2,0],box),1.)
        self.assertEqual(_segment_box_distance([3,4,0],[3,4,0],box),math.sqrt(13))
        self.assertAlmostEqual(_segment_box_distance([-3,2,0],[3,8,0],box),math.sqrt(4.5),12)

    def test_finite_wing_head_cover_sees_the_sloping_face_above_its_top(self):
        # Entire head is below2250, but nearest concrete face is diagonal above
        # the spring. A rectangular lower-post slice would overstate its cover.
        box=[4600.,0.,2217.,4650.,0.,2250.]
        actual=_segment_box_distance([4700.,0.,2250.],[4520.,0.,2600.],box)
        self.assertAlmostEqual(actual,50*350/math.hypot(180,350),10)
        self.assertLess(actual-10,40.)

    def test_new_authored_route_admits_actual_manufactured_family_not_arbitrary_head_reduction(self):
        c=reference_six_bar_straight_frame_cage_settings();_admit(c)
        with self.assertRaises(ValueError):_admit({**c,'headDiameterMm':40.})
        with self.assertRaises(ValueError):_admit({**c,'lowerWingEndZMm':2600.})
        self.assertEqual(c['postBarMm'],16.)

    def test_six_bar_authored_route_remains_source_bound_and_cannot_qualify_source200(self):
        controls=reference_six_bar_straight_frame_cage_settings()
        value=assess_straight_frame_cage(self.actual,controls)
        self.assertEqual(value['schema'],'str-straight-frame-cage-result/1')
        self.assertEqual(value['settings'],controls)
        self.assertEqual(value['nativeSourceSHA256'],self.reference['nativeSourceSHA256'])
        self.assertEqual(len(value['longitudinalBars']),32)
        self.assertEqual(len(value['starterAndWingHeads']),32)
        self.assertTrue(all(b['diameterMm']==16 for b in value['longitudinalBars'] if '/beam/' not in b['id']))
        self.assertFalse(value['reinforcementAccepted'])
        self.assertFalse(value['candidateAccepted'])
        # This source fixture can legitimately change in main. Its actual width,
        # never an old-force replacement, determines this geometric diagnostic.
        if value['geometry']['beamNormalWidthMm']==200:
            self.assertFalse(value['completeNecessaryGeometricPathComparisonPasses'])
            self.assertLess(value['minimumMainBarAdverseCoverMm'],40)
        native={(r['memberId'],r['end']):r for r in self.actual['nativeVertical']['native']['memberCuts']}
        for row in value['sectionScreens']:
            source=native[(row['memberId'],row['end'])]
            self.assertEqual(row['simultaneousActions'],{key:source[key] for key in ('axialCompressionKN','shearYKN','shearZKN','torsionKNm','bendingYKNm','bendingZKNm')})
        details=value['sixBarConventionalComparison']
        self.assertGreater(min(r['adverseClearanceLowerBoundMm'] for r in details['headHeadComparisons']),21)
        self.assertGreater(min(r['adverseClearanceLowerBoundMm'] for r in details['mainIdealLinkComparisons']),0)
        self.assertGreater(min(r['adverseBeamReserveMm'] for r in value['fullForceDevelopment'] if 'adverseBeamReserveMm' in r),0)

if __name__=='__main__':unittest.main()
