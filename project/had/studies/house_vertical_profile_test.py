import copy
import hashlib
import json
from pathlib import Path
import unittest
from house_vertical_profile import derive_profile, load_profile_source, reference_profile_case, render_profile, WET_SUPPORT_RECEIPT


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

    def test_actual_common_wet_beam_lowers_local_clearance_without_selecting_a_case(self):
        r=self.result();wet=r['wetSupportProfile'];beam=wet['beam']
        self.assertEqual(beam['sourceTopMm'],3370);self.assertEqual(beam['sourceSoffitMm'],3020)
        self.assertEqual(beam['translatedTopMm'],3900);self.assertEqual(beam['translatedSoffitMm'],3550)
        self.assertEqual(beam['undersideBelowOrdinarySlabMm'],150)
        self.assertEqual(beam['localGroundStructuralClearHeightMm'],3020)
        self.assertEqual(len(wet['geometrySource']['consistentControlIds']),7)
        self.assertEqual(wet['geometrySource']['receiptSHA256'],self.source['identities'][WET_SUPPORT_RECEIPT])
        self.assertFalse(wet['geometrySource']['numericalCaseSelected']);self.assertFalse(wet['raisedGeometryAdopted'])
        self.assertFalse(wet['raisedForcesReplayed']);self.assertFalse(beam['finishedCeilingClearanceQualified'])
        for post in wet['posts']:
            self.assertEqual(post['fixedBottomMm'],-180);self.assertEqual(post['translatedTopMm'],3540)
            self.assertEqual(post['heightIncreaseMm'],530);self.assertEqual(post['knownSectionMm'],[260,450])
        self.assertAlmostEqual(wet['quantities']['additionalGrossPostConcreteEnvelopeM3'],.124020)
        self.assertIn('Wet beam soffit 3550',render_profile([r]))
        self.assertIn('PROFILE_WET_SUPPORT_REPLAY_REQUIRED',[d['code'] for d in r['diagnostics']])

    def test_service_zone_edit_extends_fixed_base_posts_but_keeps_local_clearance_and_no_force_receipt(self):
        before=self.result(250);after=self.result(270);a=before['wetSupportProfile'];b=after['wetSupportProfile']
        self.assertEqual(a['beam']['translatedSoffitMm'],3735);self.assertEqual(a['posts'][0]['translatedTopMm'],3725)
        self.assertEqual(b['beam']['translatedSoffitMm']-a['beam']['translatedSoffitMm'],20)
        self.assertEqual(a['beam']['localGroundStructuralClearHeightMm'],b['beam']['localGroundStructuralClearHeightMm'])
        self.assertEqual(a['posts'][0]['fixedBottomMm'],b['posts'][0]['fixedBottomMm'])
        self.assertEqual(b['posts'][0]['translatedTopMm']-a['posts'][0]['translatedTopMm'],20)
        self.assertAlmostEqual(a['quantities']['additionalGrossPostConcreteEnvelopeM3'],.167310)
        self.assertAlmostEqual(b['quantities']['additionalGrossPostConcreteEnvelopeM3']-a['quantities']['additionalGrossPostConcreteEnvelopeM3'],2*.260*.450*.020)
        self.assertEqual([x['authoredBulkUnitWeightKNPerM3'] for x in a['quantities']['additionalCharacteristicWeightComparisons']],[25,27])
        for old,new in zip(a['quantities']['additionalCharacteristicWeightComparisons'],b['quantities']['additionalCharacteristicWeightComparisons']):
            self.assertAlmostEqual(new['additionalGrossWeightKN']-old['additionalGrossWeightKN'],2*.260*.450*.020*old['authoredBulkUnitWeightKNPerM3'])
        self.assertEqual(before['groundQuantityReceipt'],after['groundQuantityReceipt'])
        self.assertIsNone(after['roof']['coherentWeatherProfile']);self.assertFalse(after['forceReplay']['raisedCaseSolved'])
        self.assertIn('Wet beam soffit 3755',render_profile([after]))

    def test_bound_wet_receipt_rejects_missing_or_contradictory_control_geometry(self):
        def changed_receipt(change):
            source={**self.source,'raw':dict(self.source['raw']),'identities':dict(self.source['identities'])}
            receipt=json.loads(source['raw'][WET_SUPPORT_RECEIPT]);change(receipt)
            raw=json.dumps(receipt).encode();source['raw'][WET_SUPPORT_RECEIPT]=raw;source['identities'][WET_SUPPORT_RECEIPT]=hashlib.sha256(raw).hexdigest()
            return source
        def contradictory(receipt):
            row=next(r for r in receipt['controls'] if r['nativeCaseId']=='wet-aligned-concrete27')
            row['seatedWetSupport']['posts'][0]['physicalTopZMm']+=1
        source=changed_receipt(contradictory)
        with self.assertRaisesRegex(ValueError,'Contradictory actual wet-beam/pad/post'):derive_profile(reference_profile_case(source),source)
        def missing(receipt):receipt['controls']=[r for r in receipt['controls'] if r['nativeCaseId']!='wet-aligned-concrete27']
        source=changed_receipt(missing)
        with self.assertRaisesRegex(ValueError,'All seven'):derive_profile(reference_profile_case(source),source)
        stale={**self.source,'raw':dict(self.source['raw'])};stale['raw'][WET_SUPPORT_RECEIPT]+=b' '
        with self.assertRaisesRegex(ValueError,'Stale profile source'):derive_profile(self.case,stale)


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
