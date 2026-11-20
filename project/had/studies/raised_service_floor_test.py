import copy
import hashlib
import json
import math
from pathlib import Path
import subprocess
import unittest

from raised_service_floor import compile_service_floor, render_service_floor


class RaisedServiceFloorTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.folder=Path(__file__).resolve().parent
        cls.root=cls.folder.parents[2]
        cls.case=json.loads((cls.folder/'raised-service-floor.json').read_text())
        cls.raw={name:(cls.root/name).read_bytes() for name in cls.case['sources']}
        cls.result=compile_service_floor(cls.case,cls.raw)

    def changed(self,**settings):
        case=copy.deepcopy(self.case);case['settings'].update(settings)
        return compile_service_floor(case,self.raw)

    def test_actual_layer_sum_storeys_and_architectural_costs(self):
        z=self.result['levelsMm']
        self.assertEqual(z['ffl'],150+200+100+250+15)
        self.assertEqual(z['RC'],[150,350]);self.assertEqual(z['glass'],[350,450])
        self.assertEqual(z['courtSouth']-z['courtNorth'],110)
        self.assertEqual(z['firstFFL']-z['ffl'],3450)
        self.assertEqual(z['firstAboveNominalExterior'],4315)
        self.assertEqual(z['groundCoreHeightAdditionVsSourceMm'],185)
        self.assertEqual(self.result['approaches']['front']['totalReservationMm'],20900)
        self.assertEqual(self.result['approaches']['garden']['totalReservationMm'],17850)
        self.assertIsNone(z['actualLowestAdjacentGround'])

    def test_source530_stack_rejects_without_stealing_insulation(self):
        failed=self.changed(accessibleZoneMm=65)
        self.assertEqual(failed['levelsMm']['ffl'],530)
        self.assertEqual(failed['levelsMm']['glass'],[350,450])
        self.assertEqual(failed['comparisonStatus'],'rejected')
        self.assertIn('closedCoverToWetCrest',failed['blockers'])
        self.assertIn('designWaterToQuietAfterReserve',failed['blockers'])

    def test_half_blockage_energy_agrees_with_independent_darcy_form(self):
        r=self.result['hydraulics']['scenarios']['half-plus20pct-width']
        q=3.60375/1000;area=.24*.052;radius=area/(.24+2*.052)
        velocity=q/area
        friction=(.025*q/(area*radius**(2/3)))**2*5*1000
        minor=4.8*velocity**2/(2*9.81)*1000
        self.assertAlmostEqual(r['frictionHeadMm'],friction,places=10)
        self.assertAlmostEqual(r['minorHeadMm'],minor,places=10)
        self.assertGreater(r['headReserveMm'],6)
        self.assertFalse(self.changed(bedDebrisMm=35)['hydraulics']['scenarios']['half-plus20pct-width']['comparisonPass'])
        self.assertIn('HYDRAULIC_DOMAIN_REJECTED',self.changed(roughness=.04)['blockers'])

    def test_short_modules_real_finite_wall_arch_and_adverse_lift(self):
        walls=self.result['route']['newWallOpenings']
        self.assertEqual([r['wallXmm'] for r in walls],[[7750,8179.5],[9203,9722.5]])
        for r in walls:
            self.assertTrue(r['noRCorDPCcut']);self.assertGreater(r['bodyLiftToFiniteIntradosAfter5Mm'],10)
            self.assertGreater(r['parkToGalleryAfter10Mm'],0)
            self.assertFalse(r['ringLoadsQualified']);self.assertFalse(r['firstGripAndLoadedHandlerQualified'])
        self.assertTrue(any(code.startswith('MODULE_LIFT:')for code in self.changed(renewalLiftMm=100)['blockers']))
        self.assertTrue(any(code.startswith('WALL_MODULE_GEOMETRY:')for code in self.changed(renewalLiftMm=350)['blockers']))
        self.assertLess(max(r['bareUStockMassKgPerChannel']for r in self.result['route']['modules']),4)
        self.assertEqual(len(self.result['route']['modules']),10)

    def test_cover_point_load_and_no_favourable_stone_or_wet_pan_support(self):
        ordinary=self.result['covers']['ordinary'];header=self.result['covers']['header']
        self.assertGreater(ordinary['stressMPa'],133)
        self.assertLess(ordinary['stressMPa'],135)
        self.assertTrue(ordinary['comparisonPass']);self.assertTrue(header['comparisonPass'])
        self.assertEqual(header['controllingNetWidthPer100Mm'],18.75)
        self.assertLess(ordinary['panelMassKgBeforeHardware']+1,15)
        self.assertLess(header['panelMassKgBeforeHardware']+1,15)
        self.assertIn('FLOOR_COVER_COMPARISON_REJECTED',self.changed(coverPlateMm=8)['blockers'])
        self.assertIn('HEADER_GRATE_COMPARISON_REJECTED',self.changed(headerPlateMm=25)['blockers'])
        self.assertFalse(self.result['covers']['glassCreepAndConfinementQualified'])
        self.assertGreater(self.result['covers']['conservativePointBearingOnGlassMPa'],.13)

    def test_actualN_is_translated_and_not_approved_by_old_sources(self):
        n=self.result['north']
        self.assertEqual(n['translatedCarrierBottomYZMm'][1],[7750,501.25])
        self.assertEqual(n['translatedOutletZMm'],115)
        self.assertEqual(n['newHeaderOverlapWithActualNInletRegions'],[])
        self.assertEqual(n['source110PedestalReserveAboveHypotheticalContinuous100GlassAtHouseEdgeMm'],-104.25)
        self.assertFalse(n['fullDutyAndMaintenanceAdmitted'])
        self.assertTrue(n['actualFixedGridCrossings'])
        self.assertTrue(all(r['conservativeTranslatedBareBedReserveMm']>0 for r in n['actualFixedGridCrossings']))

    def test_ground_bound_and_receiver_are_actual_conditions_not_new_site_facts(self):
        g=self.result['ground'];e=self.result['eastReceiver']
        self.assertEqual(g['oldCatchLowMm'],-1188)
        self.assertEqual(g['knownEnvelopeRequiredDmm'],750+300+50+150)
        self.assertIsNone(g['completeInterfaceMinimumDmm'])
        self.assertEqual(e['sourceTerritoryXYMm'],[12500,6100,2000,1600])
        self.assertAlmostEqual(e['requiredMaximumReceivingWaterZMm'],543.5-5000/85-200)
        self.assertFalse(e['passiveSpillSupportAndActualOutfallAdmitted'])
        self.assertIn('outletInsideExistingReceiverAfter100Mm',self.changed(routeEndXmm=12250)['blockers'])

    def test_perturbation_changes_actual_section_while_untouched_hydraulics_remain(self):
        changed=self.changed(accessibleZoneMm=275)
        self.assertEqual(changed['levelsMm']['ffl'],740)
        self.assertNotEqual(changed['approaches'],self.result['approaches'])
        self.assertNotEqual(changed['caseDigest'],self.result['caseDigest'])
        self.assertNotEqual(render_service_floor(changed),render_service_floor(self.result))
        self.assertEqual(changed['hydraulics']['scenarios'],self.result['hydraulics']['scenarios'])
        self.assertEqual(changed['route']['fixedGridCrossings'],self.result['route']['fixedGridCrossings'])

    def test_complete_thermal_returns_are_charged_not_bare_pipe_optimism(self):
        thermal=self.result['covers']['thermalCassette']
        self.assertEqual(thermal['glassCoreMm'],50)
        self.assertAlmostEqual(thermal['coreOnlyResistanceM2KperW'],.05/.041)
        self.assertEqual(self.result['route']['checks']['closedCoverToWetCrest'],3)
        self.assertTrue(any(code.startswith('WALL_MODULE_GEOMETRY:')for code in self.changed(scupperRawSpanMm=1000)['blockers']))
        self.assertIn('closedCoverToWetCrest',self.changed(coverInsulationMm=100)['blockers'])
        self.assertIn('closedCoverToWetCrest',self.changed(settingLossMm=20)['blockers'])
        self.assertIn('NO_DECLARED_50MM_INSULATED_COVER_COMPARISON',self.changed(coverInsulationMm=0)['blockers'])
        self.assertFalse(thermal['assembledAirThermalAndCondensationAdmitted'])
        self.assertEqual(self.result['route']['newWallOpenings'][0]['localGlassReductionMm'],90)

    def test_source_connected_quiet_pool_rejects_whole_open_header_arrangement(self):
        self.assertEqual(self.result['comparisonStatus'],'rejected')
        self.assertIn('OPEN_HEADER_CONNECTS_SOURCE_QUIET_STAGE_ABOVE_U_CREST',self.result['blockers'])
        b=self.result['headerBackwaterRejection']
        self.assertEqual(b['sourceQuietStageMm'],680)
        self.assertEqual(b['sourceLocatedProtectionCrestMm'],730)
        self.assertEqual(b['quietStageAboveUcrestMm'],51.5)
        self.assertFalse(b['physicalAirbreakOrBackwaterBarrierPresent'])
        self.assertGreater(self.result['route']['newWallOpenings'][0]['aboveFloorScupperHeightMm'],290)

    def test_supported_inlet_domain_and_result_derived_drawing_labels(self):
        with self.assertRaisesRegex(ValueError,'north-falling'):self.changed(headerFrontYMm=[5500,6200])
        with self.assertRaisesRegex(ValueError,'north-falling'):self.changed(headerFrontYMm=[7400,7900])
        changed=self.changed(accessibleZoneMm=275)
        drawing=render_service_floor(changed)
        self.assertIn('FFL740',drawing)
        self.assertIn('retained window sill1490',drawing)

    def test_missing_stale_nonfinite_and_approval_fields_fail_closed(self):
        for key,value in [('accessibleZoneMm',math.nan),('coverPlateMm',0),('remainingWidthFraction',1.2)]:
            with self.assertRaises(ValueError):self.changed(**{key:value})
        bad=copy.deepcopy(self.case);bad['approved']=True
        with self.assertRaisesRegex(ValueError,'exact'):compile_service_floor(bad,self.raw)
        bad=copy.deepcopy(self.case);bad['sources'].pop(next(iter(bad['sources'])))
        with self.assertRaisesRegex(ValueError,'source identities'):compile_service_floor(bad,self.raw)
        raw=dict(self.raw);raw[next(iter(raw))]+=b' '
        with self.assertRaisesRegex(ValueError,'stale source'):compile_service_floor(self.case,raw)

    def test_native_read_replay_and_frozen_reference_outputs(self):
        script=str(self.folder/'raised_service_floor.py')
        read=subprocess.check_output(['python3','-B',script,'--read'],text=True,cwd=self.root)
        replay=json.loads(subprocess.check_output(['python3','-B',script],input=read,text=True,cwd=self.root))
        self.assertEqual(replay['result'],self.result)
        self.assertEqual(replay['sectionPlanSvg'],render_service_floor(self.result))
        self.assertEqual(json.loads((self.folder/'raised-service-floor.results.json').read_text()),self.result)
        self.assertEqual((self.folder/'raised-service-floor.svg').read_text(),render_service_floor(self.result))
        self.assertFalse(self.result['selected']);self.assertFalse(self.result['completeReplacementAdmitted'])


if __name__=='__main__':unittest.main()
