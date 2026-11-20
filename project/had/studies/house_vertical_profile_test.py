import copy
from pathlib import Path
import unittest
from house_vertical_profile import derive_profile, load_profile_source, reference_profile_case, render_profile


class HouseVerticalProfileTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.source=load_profile_source(Path(__file__).resolve().parents[3]);cls.case=reference_profile_case(cls.source)

    def result(self,zone=65,**settings):
        case=copy.deepcopy(self.case);case['groundCase']['settings'].update(serviceZoneMm=zone,**settings)
        return derive_profile(case,self.source)

    def test_one_floor_authority_preserves_actual_structural_and_occupied_offsets(self):
        r=self.result();g=r['groundLevelsMm'];p=r['occupied']
        self.assertEqual(g['coldGridTop'],-180);self.assertEqual(g['wetRCPlinth'],[-180,0])
        self.assertEqual(g['mineralCourse'],[0,150]);self.assertEqual(g['dryRC'],[150,350]);self.assertEqual(g['glass'],[350,450])
        self.assertEqual(p['groundFFLMm'],530);self.assertEqual(p['firstRCMm'],[3700,3900]);self.assertEqual(p['firstFFLMm'],3980)
        self.assertEqual(p['firstFinishAboveRCMm'],80);self.assertEqual(p['storeyIntervalMm'],3450)
        self.assertEqual(r['walls']['ordinaryGroundStructuralHeightMm'],3880)

    def test_ground_250_to270_drives_whole_house_and_front_approach(self):
        before=self.result(250);after=self.result(270)
        self.assertEqual(before['occupied']['groundFFLMm'],715);self.assertEqual(after['occupied']['groundFFLMm'],735)
        for key in ['groundFFLMm','firstFFLMm','atticDatumMm']:self.assertEqual(after['occupied'][key]-before['occupied'][key],20)
        self.assertEqual(after['occupied']['firstRCMm'],[3905,4105])
        self.assertEqual(after['walls']['ordinaryGroundStructuralHeightMm']-before['walls']['ordinaryGroundStructuralHeightMm'],20)
        self.assertEqual(after['walls']['northPortal']['rawCrownMm']-before['walls']['northPortal']['rawCrownMm'],20)
        self.assertEqual(after['approaches']['front']['slopingRunMm']-before['approaches']['front']['slopingRunMm'],400)
        self.assertEqual(before['groundLevelsMm']['coldGridTop'],after['groundLevelsMm']['coldGridTop'])
        self.assertEqual(before['waterstop'],after['waterstop'])
        self.assertNotEqual(before['groundAuthority']['caseDigest'],after['groundAuthority']['caseDigest'])
        self.assertIn('Ground FFL735',render_profile([after]));self.assertNotIn('Ground FFL715',render_profile([after]))

    def test_fixed_foundations_do_not_silently_translate_dpc_or_forces(self):
        r=self.result(250)
        self.assertEqual(r['transforms']['coldGridTranslationMm'],0)
        self.assertEqual(r['waterstop']['sourceReferenceIntervalMm'],[-50,-30]);self.assertEqual(r['waterstop']['candidateConceptIntervalMm'],[130,150])
        self.assertFalse(r['waterstop']['candidateConceptIsNativeDPCRelocation'])
        self.assertEqual(r['walls']['ordinaryGroundStructuralHeightMm'],4065)
        self.assertTrue(all(v is False for k,v in r['forceReplay'].items() if k!='groundVerticalConsumer'))

    def test_walking_plane_does_not_hide_exposed_plinth(self):
        r=self.result(250);self.assertEqual(r['wind']['exposedGradeToFFLEnvelopeMm'],865)
        self.assertFalse(r['wind']['occlusionAccepted']);self.assertIsNone(r['wind']['appliedRaisedPressure'])
        after=self.result(250,exteriorGradeMm=-250);self.assertEqual(after['wind']['exposedGradeToFFLEnvelopeMm'],965)
        self.assertIn('PROFILE_WIND_OCCLUSION_UNPROVEN',[d['code'] for d in after['diagnostics']])

    def test_distinct_roof_assembly_datums_do_not_become_one_weather_profile(self):
        roof=self.result(250)['roof'];rows={r['id']:r for r in roof['assemblyDatums']}
        self.assertEqual(rows['STR-ring-centre']['translatedComparisonMm'],7315)
        self.assertAlmostEqual(rows['MAT-required-wall-line']['translatedComparisonMm'],8133.423322641297)
        self.assertEqual(rows['HAD-weather-eave']['translatedComparisonMm'],7815)
        self.assertIsNone(roof['coherentWeatherProfile']);self.assertIsNone(roof['wholeHouseWeatherHeightAboveAuthoredGradeMm'])

    def test_arithmetic_pressure_levers_are_not_inherited_force_budgets(self):
        a=self.result(250)
        for key in ['old52HeadActionsReusable','oldMemberStiffnessReusable','oldRoofPressureReusable']:self.assertFalse(a['forceReplay'][key])
        self.assertTrue(a['diagnostics']);self.assertFalse(a['selectedHouseAdmitted']);self.assertFalse(a['installedAcceptance'])
        self.assertIsNone(a['heights']['actualLowestAdjacentGroundMm'])
        self.assertGreaterEqual(len(a['groundHolds']),10)
        self.assertIn('actual 52-head compatible actions/movement',a['groundInvalidatedEvidence'])

    def test_stale_sources_and_direct_level_injection_reject(self):
        bad=copy.deepcopy(self.case);bad['ffl']=715
        with self.assertRaisesRegex(ValueError,'no injected levels'):derive_profile(bad,self.source)
        bad=copy.deepcopy(self.case);bad['groundCase']['settings']['ffl']=715
        with self.assertRaises(ValueError):derive_profile(bad,self.source)
        bad=copy.deepcopy(self.case);bad['groundCase']['sources']={}
        with self.assertRaisesRegex(ValueError,'ground source authority'):derive_profile(bad,self.source)
        bad=copy.deepcopy(self.case);bad['sources']['project/had/studies/water-replan.json']='stale'
        with self.assertRaises(ValueError):derive_profile(bad,self.source)
        bad={**self.source,'raw':dict(self.source['raw'])};bad['raw']['project/str/studies/current-house-grid.json']+=b' '
        with self.assertRaisesRegex(ValueError,'Stale profile source'):derive_profile(self.case,bad)


if __name__=='__main__':unittest.main()
