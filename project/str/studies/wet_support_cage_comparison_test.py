"""Geometry witnesses, not a signed house load envelope or fabrication approval."""
import copy
import hashlib
import json
import math
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

import wet_support_cage_comparison as cage
from seated_wet_support import reference_support


def source_geometry():
    root=Path(__file__).resolve().parents[3]
    house=json.loads((root/'project/had/studies/water-replan.json').read_text())['model']
    settings=reference_support(house)
    posts=[{'id':'WET-SUPPORT/post/'+str(i),'rectangleXYMm':r,
        'physicalBottomZMm':-180.,'physicalTopZMm':3010.,
        'sourceGridMemberId':name} for i,(r,name) in enumerate(zip(settings['receiverRectanglesXYMm'],('GRID/rear-W/0','GRID/wet/0')))]
    return {'settings':settings,'posts':posts},json.loads((root/'project/str/studies/current-house-grid.json').read_text())


class WetSupportCageComparisonTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.wet,cls.grid=source_geometry();cls.s=cage.comparison_settings()
        cls.main,cls.links=cage.build_paths(cls.wet,cls.s)

    def test_ordinary_loop_exact_length_full_lap_and_no_hidden_end_bar(self):
        self.assertEqual(len(self.main),18);self.assertEqual(len(self.links),220)
        for p in self.main[:2]:
            self.assertAlmostEqual(p['centrelineLengthUpperMm'],6839.579400659615,8)
            self.assertEqual(p['lapAdverseMainSurfaceClearMm'],22)
            self.assertEqual(p['actualLapAfterEndToleranceMm'],950)
            self.assertGreater(p['actualLapAfterEndToleranceMm'],1.5*12*(500/1.15)/(4*2.1))
            self.assertEqual(p['bendMandrelMm'],200)
        self.assertEqual(len(cage.longitudinal_intersections(self.main,1,9500,'beam-main-loop')),5)
        self.assertEqual(len(cage.longitudinal_intersections(self.main,1,10150,'beam-main-loop')),3)
        self.assertEqual(len(cage.longitudinal_intersections(self.main,1,9100,'beam-main-loop')),4)

    def test_same_bar_hook_and_lap_nonlocal_closures(self):
        report=cage.internal_closure_report(self.main,self.links,self.s)
        self.assertEqual(report['failures'],[])
        self.assertGreater(min(r['clearanceLowerMm'] for r in report['checks']),1.9)
        broken=copy.deepcopy(self.s);broken['linkHookPlaneOffsetMm']=0
        path=cage.closed_link('broken',148,248,[0,0,0],'y',broken,True)
        self.assertLess(cage.internal_closure_report([], [path],broken)['checks'][0]['clearanceLowerMm'],0)

    def test_exact_grid_union_cover_does_not_invent_deep_north_cap(self):
        solids=cage.support_solids(self.wet,self.grid)
        report=cage.cover_report(self.main+self.links,solids,self.s)
        self.assertEqual(report['failedPaths'],[])
        self.assertAlmostEqual(min(r['minimumAdverseCoverLowerMm'] for r in report['paths']),40)
        self.assertFalse(report['existingGridReinforcementClearanceKnown'])
        north=[p for p in self.main if p['kind']=='post-main' and p['postIndex']==1 and len(p['parts'])>1]
        self.assertEqual(len(north),2)
        for p in north:
            self.assertEqual(p['parts'][0]['points'][0][1],11359.5)
            self.assertLess(p['parts'][0]['points'][0][1],11367.5)
            self.assertEqual(p['gridDevelopmentStraightOnlyMm'],460)
            self.assertEqual(p['parts'][-1]['points'][-1][2],-586)
        cap_only=[r for r in solids if r['id']!='GRID/wet']
        self.assertTrue(cage.cover_report(north,cap_only,self.s)['failedPaths'])

    def test_independent_paths_include_hooks_and_diagonal_returns(self):
        report=cage.collision_report(self.main,self.links,self.s)
        self.assertEqual(report['failedPairCount'],0)
        self.assertEqual(report['checkedIndependentPathPairs'],238*237//2)
        broken=copy.deepcopy(self.s);broken['northShortGridOutwardAngleDeg']=28
        mains=cage.post_bars(self.wet['posts'],broken)
        north=next(p for p in mains if p['id'].endswith('/post/1/main/-1/0'))
        neighbour=next(p for p in mains if p['id'].endswith('/post/1/main/-1/1'))
        self.assertLess(cage.pair_clearance(north,neighbour,10)['clearanceLowerMm'],21)

    def test_mass25_is_conditional_and_counts_actual_bends_laps_hooks_and_grid_steel(self):
        q=cage.quantity(self.main,self.links,self.wet,self.s)
        self.assertAlmostEqual(q['grossBeamAndPostVolumeM3'],1.0050225)
        self.assertAlmostEqual(q['maximumPlainConcreteWeightCompatibleWithBulk25KNPerM3'],24.1211218254287,10)
        self.assertGreater(q['starterSteelInExistingGridM3'],.0009)
        self.assertFalse(q['installedMass25Qualified']);self.assertFalse(q['wireChairsAndExistingGridCageIncluded'])
        heavy=copy.deepcopy(self.s);heavy['plainConcreteWeightKNPerM3']=25
        self.assertLess(cage.quantity(self.main,self.links,self.wet,heavy)['conditionalMassBudgetReserveKN'],0)
        changed=copy.deepcopy(self.wet);changed['settings']['concreteUnitWeightKNPerM3']=27
        q27=cage.quantity(self.main,self.links,changed,self.s)
        self.assertAlmostEqual(q27['nativeWetBodiesWeightKN']-q['nativeWetBodiesWeightKN'],2*q['grossBeamAndPostVolumeM3'])

    def test_malformed_and_changed_sources_cannot_inherit_actions(self):
        native={'seatedWetSupport':self.wet};cage.validate_inputs(native,self.grid,self.s)
        bad=copy.deepcopy(self.s);bad['topLapIntervalsYMm'][0][0]=float('nan')
        with self.assertRaises(ValueError):cage.validate_inputs(native,self.grid,bad)
        bad=copy.deepcopy(self.wet);bad['settings']['beamWidthMm']=300
        with self.assertRaises(ValueError):cage.validate_inputs({'seatedWetSupport':bad},self.grid,self.s)
        bad=copy.deepcopy(self.s);bad['sourceConcreteCompressionMPa']=20
        with self.assertRaises(ValueError):cage.validate_inputs(native,self.grid,bad)

    def test_serialized_choices_and_cli_round_trip_before_solve(self):
        method=Path(cage.__file__)
        authored=json.loads(method.with_name('wet-support-cage-comparison-settings.json').read_text())
        self.assertEqual(authored,self.s)
        read=subprocess.run([sys.executable,'-B',str(method),'--read-settings'],check=True,text=True,capture_output=True)
        self.assertEqual(json.loads(read.stdout),self.s)
        changed=copy.deepcopy(self.s);changed['linkHookTailMm']=120
        result=subprocess.run([sys.executable,'-B',str(method),'--validate-settings'],input=json.dumps(changed),check=True,text=True,capture_output=True)
        self.assertEqual(json.loads(result.stdout),changed)
        main,links=cage.build_paths(self.wet,changed)
        self.assertGreater(cage.quantity(main,links,self.wet,changed)['actualSteelVolumeUpperM3'],cage.quantity(self.main,self.links,self.wet,self.s)['actualSteelVolumeUpperM3'])
        self.assertEqual(len(cage.internal_closure_report(main,links,changed)['failures']),128)
        for length in (79,121):
            changed['linkHookTailMm']=length
            with self.assertRaises(ValueError):cage.validate_settings(changed)

    def test_default_file_is_the_single_source_without_editable_safety_limits(self):
        with tempfile.TemporaryDirectory() as directory:
            source=Path(directory)/'choices.json';changed=copy.deepcopy(self.s);changed['linkHookTailMm']=120
            source.write_text(json.dumps(changed))
            with patch.object(cage,'DEFAULT_SETTINGS_PATH',source):
                self.assertEqual(cage.comparison_settings(),changed)
                first=cage.comparison_settings();first['linkHookTailMm']=80
                self.assertEqual(cage.comparison_settings()['linkHookTailMm'],120)
                changes=[('sourceConcreteCompressionMPa',18),('sourceSteelYieldMPa',500),
                    ('sourceGoodBondMPa',3.1),('sourcePoorBondMPa',2.2),
                    ('comparisonSteelFraction',1),('steelWeightKNPerM3',77),
                    ('comparisonSteelMassDensityKgPerM3',7800),('plainConcreteWeightKNPerM3',23),
                    ('cageInstallationToleranceMm',4),('mainRelativePositionToleranceMm',4),
                    ('linkFabricationToleranceMm',.5),('minimumConcreteCoverMm',39),
                    ('minimumIndependentMainClearMm',20),('extraField',1),('schema','other')]
                for key,value in changes:
                    with self.subTest(key=key):
                        edited={**changed,key:value};source.write_text(json.dumps(edited))
                        with self.assertRaises(ValueError):cage.comparison_settings()
                        # Explicit saved choices use the same fixed domain even
                        # when the default file itself has been edited.
                        with self.assertRaises(ValueError):cage.validate_settings(edited)
                        self.assertEqual(cage.validate_settings(copy.deepcopy(self.s)),self.s)
                source.write_text('{')
                with self.assertRaises(ValueError):cage.comparison_settings()
                edited=copy.deepcopy(changed);del edited['linkHookTailMm'];source.write_text(json.dumps(edited))
                with self.assertRaises(ValueError):cage.comparison_settings()

    def test_file_cli_accepts_explicit_settings_and_rejects_enhanced_material(self):
        method=Path(cage.__file__);grid_path=method.with_name('current-house-grid.json')
        wet=copy.deepcopy(self.wet)
        for p in wet['posts']:p['recovery']={'physicalEndWrenchesKN_KNmm':[0.]*12}
        native={'sourceSHA256':{'project/str/studies/current-house-grid.json':hashlib.sha256(grid_path.read_bytes()).hexdigest()},
            'seatedWetSupport':wet,'nativeVertical':{'native':{'caseId':'analytic-zero-only','memberCuts':[],'interiorMemberCuts':[]}}}
        with tempfile.TemporaryDirectory() as directory:
            directory=Path(directory);native_path=directory/'native.json';settings_path=directory/'settings.json';output=directory/'result.json'
            native_path.write_text(json.dumps(native));changed=copy.deepcopy(self.s);changed['linkHookTailMm']=120
            settings_path.write_text(json.dumps(changed))
            command=[sys.executable,'-B',str(method),'--native',str(native_path),'--grid',str(grid_path),
                '--settings',str(settings_path),'--output',str(output),'--skip-collisions']
            subprocess.run(command,check=True,text=True,capture_output=True)
            result=json.loads(output.read_text());self.assertEqual(result['settings'],changed)
            self.assertTrue(result['rawGridIdentityVerified']);self.assertFalse(result['cageAccepted'])
            output.unlink();changed['sourceGoodBondMPa']=4;settings_path.write_text(json.dumps(changed))
            run=subprocess.run(command,text=True,capture_output=True)
            self.assertNotEqual(run.returncode,0);self.assertFalse(output.exists())

    def test_stdin_is_explicit_same_case_and_does_not_claim_raw_authentication(self):
        wet=copy.deepcopy(self.wet)
        for p in wet['posts']:p['recovery']={'physicalEndWrenchesKN_KNmm':[0.]*12}
        native={'sourceSHA256':{},'seatedWetSupport':wet,
            'nativeVertical':{'native':{'caseId':'analytic-zero-only','memberCuts':[],'interiorMemberCuts':[]}}}
        payload={'native':native,'grid':self.grid,'settings':self.s}
        run=subprocess.run([sys.executable,'-B',str(Path(cage.__file__)),'--stdin','--skip-collisions'],
            input=json.dumps(payload),check=True,text=True,capture_output=True)
        result=json.loads(run.stdout)
        self.assertEqual(result['nativeCaseId'],'analytic-zero-only')
        self.assertFalse(result['rawGridIdentityVerified']);self.assertFalse(result['cageAccepted'])
        self.assertNotIn('collisions',result)
        for row in result['simultaneousSectionScreens']['postCuts']:
            if row['end']!=1:continue
            self.assertEqual(row['grossCompressionKernStatus'],'not-loaded-not-applicable')
            self.assertIsNone(row['grossUncrackedFullCompressionKernRatio'])
            self.assertIsNone(row['grossFullCompressionNecessaryCondition'])
            self.assertFalse(row['postHeadDRegionAccepted'])
            self.assertEqual(row['simultaneousGlobalWrenchKN_KNmm'],[0.]*6)
        expected=hashlib.sha256(json.dumps(self.grid,sort_keys=True,separators=(',',':'),allow_nan=False).encode()).hexdigest()
        self.assertEqual(result['parsedGridSemanticSHA256'],expected)

    def test_failed_hook_and_terminal_hoop_geometry_are_retained(self):
        broken=copy.deepcopy(self.s);broken['postMainFaceMm']=71
        mains,links=cage.build_paths(self.wet,broken)
        bar=next(p for p in mains if p['id'].endswith('/post/0/main/1/3'))
        hoop=next(p for p in links if p['id'].endswith('/post/0/link/0'))
        self.assertLess(cage.pair_clearance(bar,hoop,6)['clearanceLowerMm'],0)
        g=self.wet['settings'];inset=self.s['linkNominalCoverMm']+4
        terminal=cage.closed_link('failed-terminal',g['beamWidthMm']-2*inset,g['beamDepthMm']-2*inset,
            [g['beamAxisXMm'],11668.5,g['beamTopZMm']-g['beamDepthMm']/2],'y',self.s,True)
        self.assertLess(cage.pair_clearance(self.main[1],terminal,6)['clearanceLowerMm'],0)

    def test_distance_and_smooth_jog_bounds(self):
        self.assertAlmostEqual(cage._segment_box_distance([-2,0,0],[2,0,0],[-1,3,-1,1,4,1]),3)
        jog=cage._jog([0,0,0],[60,6,0],1,.01)
        self.assertGreaterEqual(jog['lengthLowerMm'],math.hypot(60,6)-1e-9)
        self.assertLess(jog['lengthUpperMm']-jog['lengthLowerMm'],.006)
        n=10000;integral=sum(math.hypot(60,36*((i+.5)/n)*(1-(i+.5)/n))/n for i in range(n))
        self.assertLessEqual(jog['lengthLowerMm'],integral)
        self.assertGreaterEqual(jog['lengthUpperMm'],integral)
        self.assertGreaterEqual(jog['minimumCurvatureRadiusLowerMm'],100)

    def test_kern_tolerance_does_not_turn_tension_or_zero_force_moment_into_a_pass(self):
        for n,mx,my in ((0,0,0),(-1e-9,1e-5,-1e-5)):
            row=cage.gross_compression_kern_screen(n,mx,my,260,450)
            self.assertEqual(row['grossCompressionKernStatus'],'not-loaded-not-applicable')
            self.assertIsNone(row['grossFullCompressionNecessaryCondition'])
        for n,mx,my,status in ((0,1,0,'unsupported-moment-without-compression'),
                (1e-9,0,.001,'unsupported-moment-without-compression'),(-.1,0,0,'unsupported-axial-tension')):
            row=cage.gross_compression_kern_screen(n,mx,my,260,450)
            self.assertEqual(row['grossCompressionKernStatus'],status)
            self.assertIsNone(row['grossUncrackedFullCompressionKernRatio'])
            self.assertIsNone(row['grossFullCompressionNecessaryCondition'])
        self.assertTrue(cage.gross_compression_kern_screen(10,0,0,260,450)['grossFullCompressionNecessaryCondition'])
        self.assertFalse(cage.gross_compression_kern_screen(10,1000,0,260,450)['grossFullCompressionNecessaryCondition'])


if __name__=='__main__':unittest.main()
