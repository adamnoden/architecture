import copy
import json
import math
import itertools
import hashlib
from pathlib import Path
import unittest

from continuous_rc_cage import _layer_capacity, _path_distance, arch_bar_paths, barrier_bar_crossings, bounded_corner_contact, cage_geometry, frame_bar_paths, geometric_report, post_hoop_layout, proposed_cap_cages, rectangular_capacity, reference_cage_case, review_native_actions, screen_member_cuts


D=Path(__file__).resolve().parent
PORTAL=json.loads((D.parents[2]/'project/had/studies/water-replan.json').read_text())['model']['insulatedPortal']


class ContinuousRCCageTest(unittest.TestCase):
    def setUp(self):self.case=reference_cage_case()

    def test_complete_rounded_joint_and_real_conservative_cover(self):
        g=cage_geometry(self.case,PORTAL)
        self.assertEqual(g['mainBarCentreFaceMm'],69)
        self.assertAlmostEqual(g['worstIndependentBarPair']['adverseBoxClearMm'],28+2/3)
        self.assertAlmostEqual(g['minimumRoundedHoopToMainBarSurfaceMm'],10-5*math.sqrt(2))
        self.assertEqual(g['minimumActualLinkCoverMm'],40)
        self.assertTrue(g['upperJointFitsAdverseBox'])
        self.assertTrue(g['upstandBarRowFitsAdverseBox'])

    def test_actual_three_dimensional_arch_tail_nesting(self):
        r=geometric_report(self.case,PORTAL)
        self.assertGreater(r['minimumNominal3DJointMainBarClearanceMm'],30)
        self.assertTrue(all(p['conservativeBoxBoundClearMm']>21 for p in r['jointPathPairs']))
        a=arch_bar_paths(self.case,PORTAL)
        inner=next(p for p in a if p['id']=='intrados/1')
        outer=next(p for p in a if p['id']=='extrados/1')
        self.assertGreater(inner['leftVerticalTailTopMm'][0],outer['leftVerticalTailTopMm'][0])
        self.assertTrue(all(p['straightTailMm']==500 for p in a))

    def test_h16_control_rejects_real_foot_loop(self):
        changed=copy.deepcopy(self.case);changed.update(barDiameterMm=16,barMandrelMm=160)
        r=cage_geometry(changed,PORTAL)
        self.assertTrue(r['upperJointFitsAdverseBox'])
        self.assertFalse(r['footLoopFitsAdverseBox'])
        self.assertLess(r['minimumFootLoopToRoundedHoopSurfaceMm'],0)

    def test_dpc_is_not_crossed_by_frame_loop_or_cap_starter(self):
        historical=copy.deepcopy(self.case);historical.update(supportMode='historical-rocking-DPC-upper-loops',barMandrelMm=120.)
        rows=frame_bar_paths(historical,PORTAL,3920)
        self.assertTrue(all(not r['crossesDPC'] for r in rows))
        self.assertTrue(all(r['lowestSteelSurfaceNominalMm']-5>-30+40 for r in rows))
        self.assertLess(max(r['centrelineLengthMm'] for r in rows),12000)

    def test_active_starters_explicitly_cross_former_dpc_and_end_inside_cap(self):
        rows=frame_bar_paths(self.case,PORTAL,3920)
        self.assertEqual(len(rows),8)
        self.assertTrue(all(r['crossesDPC'] for r in rows))
        self.assertTrue(all(r['minimumSteelCentreZMm']==-680 for r in rows))
        self.assertLess(max(r['centrelineLengthMm'] for r in rows),12000)

    def test_poor_bond_and_true_lap_lengths(self):
        r=cage_geometry(self.case,PORTAL)
        self.assertAlmostEqual(r['goodBondFullYieldDevelopmentMm'],434.7826086956522)
        self.assertAlmostEqual(r['lapRequiredConservativePoorBondMm'],931.6770186335405)
        self.assertGreater(r['lapReserveMm'],60)

    def test_cap_mats_avoid_real_starters_and_the_authored_vertical_cage(self):
        grid=json.loads((D/'current-house-grid.json').read_text())
        rows=proposed_cap_cages(self.case,PORTAL,grid)
        self.assertEqual({r['headId'] for r in rows},{'P25','P26','P28','P30'})
        self.assertTrue(all(r['meshToVerticalBarMinimumAdversePlanClearMm']>=27 for r in rows))
        self.assertTrue(all(r['minimumMeshSurfaceCoverAfterSettingAndBarBoxMm']==40 for r in rows))
        self.assertTrue(all(r['starterFullYieldBondReserveMm']>45 for r in rows))
        self.assertTrue(all(not r['capGridJointAccepted'] for r in rows))

    def test_barrier_crossings_keep_actual_warm_core_clip(self):
        rows=barrier_bar_crossings(self.case,PORTAL)
        self.assertEqual(len(rows),16)
        self.assertTrue(all(r['nominalBarProjectionIntersectsWarmClip'] for r in rows))
        self.assertEqual(sum(r['nominalBarProjectionCrossesClipEdge'] for r in rows),8)
        self.assertTrue(all(not r['barToWaterstopSealOrWeldStrengthAccepted'] for r in rows))

    def test_exact_pressure_bound_is_attained_by_uniform_corner_triangle(self):
        contact={'pierId':'test','normalCompressionKN':18.,'effectiveContactFootprintXYMm':[0.,0.,200.,300.],
            'resultantEccentricityXYMm':[-90.,-130.]}
        r=bounded_corner_contact(contact,17.)
        self.assertEqual(r['uniformOptimalTriangleInterceptsMm'],[30.,60.])
        self.assertEqual(r['minimumPossiblePeakPressureMPaAtTheseResultants'],20.)
        self.assertTrue(r['boundedPressureEquilibriumImpossibleForCurrentResultants'])
        self.assertAlmostEqual(.5*30*60*20/1000,contact['normalCompressionKN'])
        contact['normalCompressionKN']=9
        self.assertFalse(bounded_corner_contact(contact,17.)['boundedPressureEquilibriumImpossibleForCurrentResultants'])

    def test_adverse_bar_setting_and_upstand_width_really_fail(self):
        changed=copy.deepcopy(self.case);changed['relativeBarBoxToleranceMm']=8
        self.assertFalse(cage_geometry(changed,PORTAL)['upperJointFitsAdverseBox'])
        changed=copy.deepcopy(self.case);changed['upstandWidthMm']=180
        self.assertFalse(cage_geometry(changed,PORTAL)['upstandBarRowFitsAdverseBox'])

    def test_no_source_result_injection_or_support_topology_substitution(self):
        changed=copy.deepcopy(self.case);changed['sourceSHA256']={}
        with self.assertRaises(ValueError):cage_geometry(changed,PORTAL)
        with self.assertRaisesRegex(ValueError,'support topology'):
            review_native_actions({'sourceSHA256':{},'memberCuts':[{}],'request':{'schema':'str-rc-floor-house-load-case/1'}},self.case,PORTAL)

    def test_general_cap_bar_law_reproduces_the_four_bar_rectangle_control(self):
        for n,reverse in itertools.product((-20.,0.,25.,75.),(False,True)):
            actual=_layer_capacity(290,215,[69.,69.,146.,146.],n,reverse,12.,.92)
            expected=rectangular_capacity(290,215,69,146,n,reverse,12.,.92)
            self.assertAlmostEqual(actual,expected,places=6)

    def test_actual_top_cap_mesh_bends_do_not_double_up_at_corners(self):
        grid=json.loads((D/'current-house-grid.json').read_text())
        cap=next(row for row in proposed_cap_cages(self.case,PORTAL,grid) if row['headId']=='P28')
        ew=[r for r in cap['matBarPaths'] if r['id'].startswith('top/EW')]
        ns=[r for r in cap['matBarPaths'] if r['id'].startswith('top/NS')]
        distances=[_path_distance(a['pointsLocalXYWorldZMm'],b['pointsLocalXYWorldZMm']) for a,b in itertools.product(ew,ns)]
        self.assertGreaterEqual(min(distances),12-1e-8)
        self.assertEqual(cap['matBarEndCoordinatesMm'],{'EW':244.,'NS':185.})
        changed=copy.deepcopy(self.case);changed['lapLengthMm']=800;changed['lapIntervalsXMm']=[[4550,5350],[6450,7250]]
        self.assertLess(cage_geometry(changed,PORTAL)['lapReserveMm'],0)

    def test_edited_width_and_adverse_placement_fail_for_specific_reasons(self):
        changed=copy.deepcopy(self.case);changed['normalCoreMm']=240
        self.assertFalse(cage_geometry(changed,PORTAL)['upperJointFitsAdverseBox'])
        changed=copy.deepcopy(self.case);changed['upstandWidthMm']=180
        self.assertFalse(cage_geometry(changed,PORTAL)['upstandBarRowFitsAdverseBox'])
        changed=copy.deepcopy(self.case);changed['relativeBarBoxToleranceMm']=8
        self.assertLess(cage_geometry(changed,PORTAL)['minimumRoundedHoopToMainBarSurfaceMm'],0)

    def test_h16_capacity_exact_source_control_and_h12_not_inherited(self):
        from continuous_rc_portal import _strength_function, load_continuous_rc_source
        source=load_continuous_rc_source(D.parents[2]);mr=_strength_function(source)
        for n in (0,10,50):
            self.assertAlmostEqual(rectangular_capacity(215,212.5,56,156.5,n,False,16),mr(215,212.5,56,156.5,n,False),places=5)
        self.assertLess(rectangular_capacity(215,212.5,69,143.5,10,False,12),rectangular_capacity(215,212.5,56,156.5,10,False,16))

    def test_stale_source_core_never_acquires_new_cage_capacity(self):
        row={'kind':'post','physicalPointMm':[4400,8000,2250],'breadthMm':215,'depthMm':212.5}
        with self.assertRaisesRegex(ValueError,'stale215/240'):screen_member_cuts(self.case,PORTAL,[row])
        changed=copy.deepcopy(self.case);changed['results']={}
        with self.assertRaises(ValueError):cage_geometry(changed,PORTAL)


    def test_actual_source_cut_edits_leave_the_receipt_unchanged(self):
        path=D/'continuous-rc-cage-actions.json';original=path.read_bytes();fixture=json.loads(original)
        native=next(r for r in fixture['cases'] if r['authoredCageSupportMode']==self.case['supportMode'])
        row=next(r for r in native['memberCuts'] if r['kind']=='upstand')
        changed=copy.deepcopy(row);changed['breadthMm']-=20
        with self.assertRaisesRegex(ValueError,'upstand differs'):
            screen_member_cuts(self.case,PORTAL,[changed])
        changed=copy.deepcopy(row);changed['physicalPointMm'][2]+=10
        with self.assertRaisesRegex(ValueError,'underside'):
            screen_member_cuts(self.case,PORTAL,[changed])
        self.assertEqual(hashlib.sha256(original).hexdigest(),hashlib.sha256(path.read_bytes()).hexdigest())

    def test_actual_joint_force_transfer_uses_the_physical_face_offset(self):
        fixture=json.loads((D/'continuous-rc-cage-actions.json').read_text())
        native=next(r for r in fixture['cases'] if r['authoredCageSupportMode']==self.case['supportMode'])
        review=review_native_actions(native,self.case,PORTAL)
        for row in review['actualArchColumnJointActions']:
            self.assertAlmostEqual(abs(row['columnFaceEccentricityMm']),106.25)
            source=row['actualArchPhysicalCutWrenchKN_KNm'];target=row['sameArchActionTransferredToColumnAxisKN_KNm']
            dx=row['columnFaceEccentricityMm']/1000
            self.assertAlmostEqual(target[4],source[4]-dx*source[2])
            self.assertAlmostEqual(target[5],source[5]+dx*source[1])
            self.assertFalse(row['physicalHorizontalEndBearingCredited'])
            self.assertFalse(row['rigidOffsetJointPanelResistanceAccepted'])

    def test_real_post_hoop_stations_avoid_arch_bars_and_barrier_working_band(self):
        layout=post_hoop_layout(self.case,PORTAL)
        self.assertIn(2300,layout['blockedStationsZMm'])
        self.assertNotIn(2300,layout['stationsZMm'])
        self.assertLessEqual(layout['maximumActualPitchMm'],100)
        self.assertLessEqual(layout['maximumJointActualPitchMm'],100)
        self.assertGreater(layout['minimumAdverseArchToHoopSurfaceClearMm'],0)
        self.assertTrue(all(z<=-80 or z>=0 for z in layout['stationsZMm']))


if __name__=='__main__':unittest.main()
