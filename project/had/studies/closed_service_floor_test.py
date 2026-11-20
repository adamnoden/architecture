import copy
import hashlib
import json
from pathlib import Path
import unittest

from closed_service_floor import beam, compile_closed, plate_strip, render_closed

ROOT=Path(__file__).resolve().parents[3]
FOLDER=Path(__file__).resolve().parent


class ClosedServiceFloorTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.case=json.loads((FOLDER/'closed-service-floor.json').read_text())
        cls.raw={p:(ROOT/p).read_bytes() for p in cls.case['sources']}
        cls.result=compile_closed(cls.case,cls.raw)

    def changed(self,**settings):
        case=copy.deepcopy(self.case)
        if 'accessibleZoneMm' in settings:
            zone=settings.pop('accessibleZoneMm');g=case['groundStack']['levelsMm'];g['accessibleDistribution']=[450,450+zone];g['finish']=[450+zone,465+zone];g['ffl']=465+zone
        if 'exteriorGradeMm' in settings:case['groundStack']['levelsMm']['authoredExteriorGrade']=settings.pop('exteriorGradeMm')
        case['settings'].update(settings)
        return compile_closed(case,self.raw)

    def test_independent_simple_span_point_energy_and_reactions(self):
        length=2400;point=2000;elastic=190000;inertia=1.8e6
        r=beam([0,1200,2400],[0,2400],[0,0],[(1200,point)],inertia,elastic)
        exact=point*length**3/(48*elastic*inertia)
        self.assertAlmostEqual(r['maximumDeflectionMm'],exact,places=10)
        self.assertAlmostEqual(r['maximumMomentNmm'],point*length/4,places=6)
        self.assertAlmostEqual(r['strainEnergyNmm'],point*exact/2,places=6)
        self.assertEqual(r['supportReactionsKN'],[1,1])

    def test_independent_uniform_span_interior_recovery(self):
        length=2000;q=1.7;elastic=190000;inertia=1.8e6
        r=beam([0,length],[0,length],[q],[],inertia,elastic)
        self.assertAlmostEqual(r['maximumDeflectionMm'],5*q*length**4/(384*elastic*inertia),places=10)
        self.assertAlmostEqual(r['maximumMomentNmm'],q*length**2/8,places=6)
        self.assertEqual(r['maximumNodeDeflectionMm'],0)

    def test_baseline_is_conditional_and_preserves_layers(self):
        r=self.result
        self.assertEqual(r['diagnostics'],[])
        self.assertFalse(r['selectedHouseAdmitted'])
        self.assertFalse(r['physicalInstallationAdmitted'])
        self.assertEqual(r['floorLayersZMm']['bareGlass'],[350,450])
        self.assertEqual(r['floorLayersZMm']['accessible'],[450,700])
        self.assertEqual(r['ground']['knownEnvelopeMinimumDmm'],1250)
        self.assertIsNone(r['ground']['completeSiteSolumMinimumDmm'])

    def test_source_pressure_not_open_u_crest(self):
        e=self.result['east'];p=e['pressure']
        self.assertEqual(e['headerWaterReturnsToMm'],730)
        self.assertGreater(p['authoredProofKPa'],p['maximumCalculatedKPa'])
        self.assertGreater(e['closedFlows']['one-half-plus-width-loss']['reserveMm'],50)
        self.assertGreater(e['intakeCoupling']['survivingInletLipToHeaderWaterMm'],8)
        self.assertGreater(e['intakeCoupling']['quietStageReserveMm'],0)

    def test_lid_clamp_and_pressure_fields_are_distinct(self):
        p=self.result['east']['pressure']
        self.assertEqual(p['lidCentralMm'],4)
        self.assertEqual(p['lidPerimeterDoublerMm'],10)
        self.assertLess(p['halfLidAndDoublerMassKgBeforeBolts'],12)
        self.assertLess(p['handling']['chargedLiftingMassKg'],15)
        self.assertEqual(p['pressureLidsPerStation'],2)
        self.assertEqual(p['centralFlangeBelowClearWaterRoofMm'],0)
        self.assertTrue(p['lidDoublerWeldScreen']['comparisonPass'])
        self.assertGreater(p['solid14LidAlternativeMassKg'],40)
        self.assertFalse(p['uniformContactOrWatertightnessProved'])
        self.assertEqual(p['boltCount'],20)
        self.assertGreater(p['minimumLocalTributaryGasketStressMPa'],15)
        self.assertAlmostEqual(plate_strip(258,3.5,3,190000)['stressMPa'],12.226040816326531)

    def test_thermal_pockets_are_real_local_reduction(self):
        r=self.result['east']['section']
        self.assertEqual(r['ordinaryCassetteCoreMm'],50)
        self.assertEqual(r['localBoltPocketCoreMm'],30)
        self.assertEqual(r['pressureLidFieldCoreMm'],40)
        self.assertAlmostEqual(r['boltToThermalAfter5Mm'],6.8)

    def test_actual_walls_have_joint_free_draw_and_no_above_floor_hatch(self):
        for o in self.result['east']['scuppers']:
            self.assertEqual(o['aboveFloorOpeningMm'],0)
            self.assertEqual(o['finishedCrownMm'],713)
            self.assertGreater(o['movingJointFreeBodyToIntradosAfter5Mm'],30)
            self.assertGreaterEqual(o['parkReserveAfter10Mm'],10)
            self.assertTrue(o['noRCorDPCcut'])
            self.assertEqual(o['thermalGlassReductionMm'],90)

    def test_actual_named_heads_and_joined_additions(self):
        n=self.result['north']
        self.assertEqual(n['actualSupportHeads'],['P28','P30','P29','P31','P25','P26'])
        self.assertEqual(n['terminalRailCantileverMm'],1882.5)
        self.assertEqual(n['peoplePlatformCantileverMm'],982.5)
        for case in self.result['joined52HeadLoadAdditions'].values():
            self.assertEqual(len(case),52)
            self.assertLess(case['P18']['FzKN'],0)
            self.assertLess(case['P25']['FzKN'],0)
            self.assertGreater(case['P25']['MyKNm'],0)
            self.assertLess(case['P26']['MyKNm'],0)

    def test_beam_load_and_moment_equilibrium_independently(self):
        for case in self.result['north']['loadCases'].values():
            for r in case['railResults']+case['fieldStringerResults']+case['crossbeamResults']:
                self.assertAlmostEqual(sum(r['supportReactionsKN']),r['appliedDownwardKN'],places=7)
                self.assertLess(r['freeEquilibriumResidualN'],1e-4)

    def test_actual_cold_face_brackets_do_not_borrow_cap_top(self):
        for seat in self.result['north']['supportSeats']:
            self.assertIn(seat['inwardFaceXmm'],[4800,7200])
            self.assertIn(seat['columnAxisXYmm'][0],[4900,7100])
            self.assertLess(seat['columnTopMm'],60)
            self.assertEqual(seat['authoredAnchorsZMm'],[-300,-500])
            self.assertFalse(seat['jointCapacityAdmitted'])

    def test_local_leak_scope_and_threshold_not_full_backup(self):
        c=self.result['east']['localLeakCatch']
        self.assertIsNone(c['acceptedPhysicalLeakDutyLps'])
        self.assertGreater(c['computedMaximumLocalLeakLps'],.1)
        self.assertLess(c['computedMaximumLocalLeakLps'],self.result['east']['dutyLps'])
        self.assertFalse(c['assignedFullRainDutyAdmitted'])
        self.assertIsNone(c['qualifiedFirstHarmZMm'])
        self.assertFalse(c['separateDrain']['oldNegative1300Or1400ReceiverBoundsTransferred'])

    def test_split_all_bolts_and_true_captive_handling_budget(self):
        p=self.result['east']['pressure'];h=p['handling']
        self.assertLess(h['chargedLiftingMassKg'],14)
        self.assertGreater(h['massReserveTo15Kg'],1)
        for row in h['operators']:
            self.assertEqual(len(row['allBoltControls']),20)
            self.assertLess(row['maximumAllBoltToolReachMm'],500)
            self.assertLess(row['standingCarryReachMm'],600)
            self.assertEqual(row['ratchetLeverMm'],600)
            self.assertFalse(row['physicalForceOrHandlingAccepted'])
        bad=self.changed(retainedWaterAllowanceKg=5)
        self.assertIn('SPLIT_LID_CHARGED_LIFT_EXCEEDS15KG',bad['diagnostics'])

    def test_actual_n_rails_clear_shoes_and_field_strings_clear_body(self):
        n=self.result['north']
        self.assertEqual(n['protectiveBoundary']['sourceSideShoeSoleMm'],350)
        self.assertEqual(n['railAxesXmm'],[4960,5275])
        self.assertGreaterEqual(n['railAxesXmm'][0]-50,4910)
        self.assertTrue(all(x-25>5225 for x in n['fieldStringerAxesXmm']))
        self.assertGreater(n['fieldStringerAxesXmm'][0]-25,n['railAxesXmm'][1]+50)
        self.assertEqual(n['primaryCrossbeamExtentXmm'],[4850,7150])
        self.assertLess(n['crossbearers']['sourceNcoverOneWayPlate12Screen']['ULSStressMPa'],150)
        self.assertIn('ULS-platform-west2kN-no-field-live',n['loadCases'])

    def test_exterior_drain_clears_primary_and_rails_and_passes_real_energy(self):
        e=self.result['east'];drain=e['localLeakCatch']['separateDrain']
        self.assertEqual(drain['invertEndsMm'],[390,345])
        self.assertGreater(drain['pipeClearBelowPrimaryAfter5Mm'],10)
        self.assertEqual(drain['endDropBox']['clearBeforeRailMm'],50)
        self.assertGreaterEqual(drain['pipeAdverseEnergyAtCatchThreshold']['reserveMm'],-1e-8)
        self.assertGreater(drain['pipeTrialHeadReserveMm'],90)
        self.assertEqual(e['exteriorTerminalSupport']['railStartXmm'],12150)

    def test_local_leak_trial_cannot_exceed_exported_envelope(self):
        r=self.changed(localLeakTrialLps=1)
        self.assertIn('AUTHORED_LOCAL_LEAK_EXCEEDS_SHALLOW_CATCH_ENVELOPE',r['diagnostics'])

    def test_larger_roughness_invalidates_closed_and_inlet_controls(self):
        r=self.changed(roughness=.04)
        self.assertIn('CLOSED_E_INLET_OR_FREE_OVERFALL_SCREEN_FAILS',r['diagnostics'])

    def test_reduced_floor_zone_rejects_real_bolt_clearance(self):
        r=self.changed(accessibleZoneMm=200)
        self.assertIn('PRESSURE_LID_BOLT_COLLIDES_THERMAL_COVER',r['diagnostics'])

    def test_preload_change_updates_flange_and_evidence_margin(self):
        r=self.changed(boltPreloadKN=10)
        self.assertIn('GASKET_LOCAL_PRELOAD_BELOW_SOURCE_BENCHMARK',r['diagnostics'])
        self.assertFalse(r['east']['pressure']['uniformContactOrWatertightnessProved'])

    def test_high_point_load_invalidates_real_frame(self):
        r=self.changed(pointLoadKN=100)
        self.assertTrue(any(k.startswith('N_MEMBER_STRESS_SCREEN_FAILS') for k in r['diagnostics']))

    def test_grade_only_control_keeps_water_and_recomputes_approach(self):
        r=self.changed(exteriorGradeMm=-250)
        self.assertEqual(r['east'],self.result['east'])
        self.assertEqual(r['approaches']['front']['riseMm'],965)
        self.assertEqual(r['sourceConsequences']['firstAboveNominalGradeMm'],4415)

    def test_renderer_uses_changed_level(self):
        r=self.changed(accessibleZoneMm=300)
        self.assertIn('FFL765',render_closed(r))

    def test_actual_source_deeper_cap_changes_solved_solum_envelope(self):
        raw=dict(self.raw);case=copy.deepcopy(self.case)
        path='project/str/studies/current-house-grid.json'
        grid=json.loads(raw[path]);grid['heads'][0]['capZ'][0]=-900
        raw[path]=json.dumps(grid).encode();case['sources'][path]=hashlib.sha256(raw[path]).hexdigest()
        result=compile_closed(case,raw)
        self.assertEqual(result['ground']['knownEnvelopeMinimumDmm'],1400)

    def test_source_shallower_rc_cannot_keep_old_anchor_rows(self):
        raw=dict(self.raw);case=copy.deepcopy(self.case)
        path='project/str/studies/current-house-grid.json'
        grid=json.loads(raw[path])
        for name in ['loggia-W','loggia-E']:grid['girders'][name]['z'][0]=-450
        raw[path]=json.dumps(grid).encode();case['sources'][path]=hashlib.sha256(raw[path]).hexdigest()
        result=compile_closed(case,raw)
        self.assertTrue(any(v.startswith('N_BRACKET_ANCHOR_OUTSIDE_ACTUAL_COLD_RC') for v in result['diagnostics']))

    def test_missing_or_stale_source_rejects(self):
        raw=dict(self.raw);raw.pop(next(iter(raw)))
        with self.assertRaisesRegex(ValueError,'Missing or stale'):compile_closed(self.case,raw)

    def test_explicit_ground_authority_and_actual_solum_are_required(self):
        case=copy.deepcopy(self.case);case.pop('groundStack')
        with self.assertRaises(ValueError):compile_closed(case,self.raw)
        case=copy.deepcopy(self.case);case['groundStack']['levelsMm']['glass']=[350,460]
        with self.assertRaisesRegex(ValueError,'Unsupported ground-section stack'):compile_closed(case,self.raw)
        case=copy.deepcopy(self.case);case['groundStack']['levelsMm']['localSolum']=-1000
        result=compile_closed(case,self.raw)
        self.assertIn('ACTUAL_GROUND_SOLUM_SHALLOWER_THAN_KNOWN_HEAVE_STRUCTURE_ENVELOPE',result['diagnostics'])

    def test_finite_domain_and_bolt_counts(self):
        with self.assertRaises(ValueError):self.changed(ventAreaFraction=0)
        with self.assertRaises(ValueError):self.changed(boltsOnLongSide=6.5)
        with self.assertRaises(ValueError):self.changed(endXmm=14000)


if __name__=='__main__':unittest.main()
