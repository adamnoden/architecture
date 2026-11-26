import copy
import hashlib
import json
from pathlib import Path
import unittest
from house_vertical_profile import derive_profile, dry_support_transfer, load_profile_source, reference_profile_case, render_profile, WET_SUPPORT_RECEIPT


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
        self.assertEqual(r['walls']['ordinaryGroundStructuralHeightMm'],3350)
        self.assertEqual(r['walls']['coldGridToFirstSoffitSeparationMm'],3880)
        self.assertEqual(r['walls']['candidateDryPostIntervalMm'],[350,3700])
        self.assertEqual(r['transforms']['drySupportTranslationMm'],530)

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

    def test_storey_local_arches_become_actual_absolute_datums(self):
        rows={r['id']:r for r in self.result()['arches']}
        ground=rows['GROUND/south-window-0'];first=rows['FIRST/south-window-0']
        self.assertEqual(ground['datumsMm'],{'sill':1280,'spring':3080,'head':3380})
        self.assertEqual(first['datumsMm'],{'sill':4730,'spring':6530,'head':6830})
        self.assertEqual(rows['FIRST/south-window-1']['datumsMm']['sill'],4830)
        self.assertEqual(first['sourceDatum'],'storey-local');self.assertEqual(first['outputDatum'],'source-ground')
        self.assertEqual(first['sourceStoreyFFLMm'],3450);self.assertEqual(first['raisedStoreyFFLMm'],3980)

    def test_arch_height_edit_preserves_the_real_storey_interval(self):
        before={r['id']:r for r in self.result(250)['arches']}
        after={r['id']:r for r in self.result(270)['arches']}
        self.assertEqual(before['FIRST/south-window-0']['datumsMm'],{'sill':4915,'spring':6715,'head':7015})
        self.assertEqual(after['FIRST/south-window-0']['datumsMm'],{'sill':4935,'spring':6735,'head':7035})
        for key in ('sill','spring','head'):
            self.assertEqual(after['FIRST/south-window-0']['datumsMm'][key]-before['FIRST/south-window-0']['datumsMm'][key],20)
            self.assertEqual(after['FIRST/south-window-0']['datumsMm'][key]-after['GROUND/south-window-0']['datumsMm'][key],3450)

    def test_fixed_foundations_do_not_silently_translate_dpc_or_forces(self):
        r=self.result(250)
        self.assertEqual(r['transforms']['coldGridTranslationMm'],0)
        self.assertEqual(r['waterstop']['sourceReferenceIntervalMm'],[-50,-30]);self.assertEqual(r['waterstop']['candidateConceptIntervalMm'],[0,150])
        self.assertFalse(r['waterstop']['candidateConceptIsNativeDPCRelocation'])
        self.assertFalse(r['waterstop']['oldColumnCutRetained'])
        self.assertEqual(r['walls']['ordinaryGroundStructuralHeightMm'],3535)
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
            self.assertEqual(post['sourcePhysicalBottomMm'],-180);self.assertEqual(post['dryBottomMm'],350)
            self.assertEqual(post['translatedTopMm'],3540)
            self.assertEqual(post['heightIncreaseMm'],0);self.assertEqual(post['knownSectionMm'],[260,450])
            self.assertEqual(post['translatedHeightMm'],3190)
        self.assertEqual(wet['quantities']['additionalGrossPostConcreteEnvelopeM3'],0)
        self.assertIn('Wet beam soffit 3550',render_profile([r]))
        self.assertIn('PROFILE_WET_SUPPORT_REPLAY_REQUIRED',[d['code'] for d in r['diagnostics']])

    def test_service_zone_edit_moves_occupied_plane_independently_of_dry_support_plane(self):
        before=self.result(250);after=self.result(270);a=before['wetSupportProfile'];b=after['wetSupportProfile']
        self.assertEqual(a['beam']['translatedSoffitMm'],3735);self.assertEqual(a['posts'][0]['translatedTopMm'],3725)
        self.assertEqual(b['beam']['translatedSoffitMm']-a['beam']['translatedSoffitMm'],20)
        self.assertEqual(a['beam']['localGroundStructuralClearHeightMm'],b['beam']['localGroundStructuralClearHeightMm'])
        self.assertEqual(a['posts'][0]['dryBottomMm'],350)
        self.assertEqual(a['posts'][0]['dryBottomMm'],b['posts'][0]['dryBottomMm'])
        self.assertEqual(a['posts'][0]['translatedHeightMm'],3375)
        self.assertEqual(b['posts'][0]['translatedHeightMm'],3395)
        self.assertEqual(b['posts'][0]['translatedTopMm']-a['posts'][0]['translatedTopMm'],20)
        self.assertAlmostEqual(a['quantities']['additionalGrossPostConcreteEnvelopeM3'],.043290)
        self.assertAlmostEqual(b['quantities']['additionalGrossPostConcreteEnvelopeM3']-a['quantities']['additionalGrossPostConcreteEnvelopeM3'],2*.260*.450*.020)
        self.assertEqual([x['authoredBulkUnitWeightKNPerM3'] for x in a['quantities']['additionalCharacteristicWeightComparisons']],[25,27])
        for old,new in zip(a['quantities']['additionalCharacteristicWeightComparisons'],b['quantities']['additionalCharacteristicWeightComparisons']):
            self.assertAlmostEqual(new['additionalGrossWeightKN']-old['additionalGrossWeightKN'],2*.260*.450*.020*old['authoredBulkUnitWeightKNPerM3'])
        self.assertEqual(before['groundQuantityReceipt'],after['groundQuantityReceipt'])
        self.assertIsNone(after['roof']['coherentWeatherProfile']);self.assertFalse(after['forceReplay']['raisedCaseSolved'])
        self.assertIn('Wet beam soffit 3755',render_profile([after]))

    def test_full_cold_to_dry_stack_is_separate_from_the_restart_of_dry_members(self):
        r=self.result();s=r['drySupportTransfer']
        self.assertEqual(s['verticalStackMm'],{'wetRCPlinth':[-180,0],'mineralCourse':[0,150],'dryRC':[150,350]})
        self.assertEqual(s['drySupportTranslationMm'],s['occupiedTranslationMm'])
        self.assertEqual(s['relativeLowerMemberHeightChangeMm'],0)
        self.assertEqual(s['ordinaryDryMemberHeightMm'],3350)
        self.assertEqual(r['walls']['northPortal']['dryBaseMm'],350)
        self.assertFalse(s['nativeInsertionImplemented']);self.assertFalse(s['oldForcesReusable'])
        self.assertFalse(s['mineralBearingLawQualified']);self.assertFalse(s['mineralShearOrUpliftResistanceProvided'])
        for zone,growth in [(250,185),(270,205)]:
            v=self.result(zone)['drySupportTransfer']
            self.assertEqual(v['drySupportTranslationMm'],530)
            self.assertEqual(v['relativeLowerMemberHeightChangeMm'],growth)
            self.assertEqual(v['ordinaryDryMemberHeightMm'],3350+growth)
        # A site-grade edit changes approach/wind exposure, not the dry transfer.
        self.assertEqual(self.result(exteriorGradeMm=-250)['drySupportTransfer'],s)
        # Raising the actual mineral stack moves both receiving and occupied
        # planes, preserving dry member lengths while changing the wet plinth.
        raised=self.result(courseBottomMm=10)
        self.assertEqual(raised['drySupportTransfer']['dryMemberBaseMm'],360)
        self.assertEqual(raised['occupied']['groundFFLMm'],540)
        self.assertEqual(raised['drySupportTransfer']['ordinaryDryMemberHeightMm'],3350)
        self.assertEqual(raised['wetSupportProfile']['posts'][0]['translatedHeightMm'],3190)
        self.assertGreater(raised['groundQuantityReceipt']['additionalWetRCPlinthM3'],r['groundQuantityReceipt']['additionalWetRCPlinthM3'])

    def test_support_stack_gaps_overlap_missing_layer_and_nonfinite_plane_reject(self):
        levels=self.result()['groundLevelsMm']
        for key,index,value in [('wetRCPlinth',0,-181),('wetRCPlinth',1,1),('mineralCourse',1,149),('dryRC',0,151),('mineralCourse',1,0)]:
            bad=copy.deepcopy(levels);bad[key][index]=value
            with self.assertRaisesRegex(ValueError,'stack'):
                dry_support_transfer(bad,-180,0,530,3170)
        with self.assertRaisesRegex(ValueError,'Finite'):
            dry_support_transfer(levels,float('nan'),0,530,3170)
        missing=copy.deepcopy(levels);missing.pop('mineralCourse')
        with self.assertRaisesRegex(ValueError,'Complete'):
            dry_support_transfer(missing,-180,0,530,3170)
        low=copy.deepcopy(levels)
        low.update(wetRCPlinth=[-180,-180],mineralCourse=[-180,-30],dryRC=[-30,170],ffl=350)
        self.assertEqual(dry_support_transfer(low,-180,0,350,3170)['ordinaryDryMemberHeightMm'],3350)

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
