import copy
import hashlib
import json
from pathlib import Path
import unittest
import math
from closed_service_tool_geometry import sector_point_distance, point_segment, segment_box, floor_opening_body_clearance

from closed_service_floor import beam, compile_closed, plate_strip, render_closed, transfer_e_gravity, head_global_wrench

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
            for r in case.get('railResults',[])+case.get('fieldStringerResults',[])+case.get('crossbeamResults',[]):
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
            self.assertLess(row['maximumAllBoltToolReachMm'],600)
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

    def test_independent_eccentric_load_preserves_column_face_and_head_couples(self):
        grid={'heads':[{'id':'A','xy':[0,-1000],'capZ':[-1000,0]},{'id':'B','xy':[0,1000],'capZ':[-1000,0]}]}
        g={'datum':0,'width':600,'heads':[{'id':'A','u':-1000},{'id':'B','u':1000}]}
        result=transfer_e_gravity([{'id':'twoKN','downwardKN':2,'xyMm':[1500,250]}],grid,g,500,[-500,500])
        self.assertAlmostEqual(sum(v['rootMyKNm'] for v in result['seatActions']),2)
        self.assertAlmostEqual(sum(v['faceMyKNm'] for v in result['seatActions']),2.4)
        actions=result['source52SLSHeadLoadAdditions']
        self.assertAlmostEqual(actions['A']['FzKN'],-.75)
        self.assertAlmostEqual(actions['B']['FzKN'],-1.25)
        self.assertAlmostEqual(sum(v['MyKNm'] for v in actions.values()),3)
        self.assertEqual(result['equilibrium']['appliedGlobalWrench'],[0,0,-2,-.5,3,0])

    def test_full_n_e_wrenches_and_actual_crew_point_location(self):
        for value in self.result['joinedGravityEquilibrium'].values():
            self.assertLess(value['maximumAbsoluteResidual'],1e-6)
        n=self.result['north']['loadCases']
        grid=json.loads(self.raw['project/str/studies/current-house-grid.json'])
        before=head_global_wrench(n['SLS-gravity']['source52HeadLoadAdditions'],grid)
        after=head_global_wrench(n['SLS-endoperator2kN']['source52HeadLoadAdditions'],grid)
        delta=[b-a for a,b in zip(before,after)]
        self.assertAlmostEqual(delta[2],-2,places=7)
        self.assertAlmostEqual(delta[3],-2*12.35,places=6)
        self.assertAlmostEqual(delta[4],2*5.025,places=6)
        self.assertTrue(n['STABILITY-dry-min-stock-platform-west2kN-no-field-live']['minimumDeadCase'])
        self.assertTrue(self.result['east']['crewFloorLoadPorts'])

    def test_all_actual_field_stringer_positions_are_challenged(self):
        family=self.result['north']['fieldPointFamily']
        self.assertEqual(len(family['stringerAxesXmm']),7)
        self.assertEqual(len(family['positionsYmm']),4)
        self.assertEqual(len(family['cases']),56)
        worst=max(family['cases'],key=lambda v:v['maximumMemberStressMPa'])
        self.assertAlmostEqual(worst['pointXYmm'][0],5930.357142857143)
        self.assertEqual(worst['pointXYmm'][1],8962.5)
        self.assertGreater(worst['maximumMemberStressMPa'],50)

    def test_corroded_stiffness_does_not_erase_nominal_gravity(self):
        altered=self.changed(metalLossMm=.8)
        self.assertAlmostEqual(altered['north']['loadCases']['SLS-gravity']['totalAddedDownwardKN'],self.result['north']['loadCases']['SLS-gravity']['totalAddedDownwardKN'],places=6)
        self.assertAlmostEqual(altered['east']['exteriorTerminalSupport']['totalSLSDownwardKN'],self.result['east']['exteriorTerminalSupport']['totalSLSDownwardKN'],places=8)

    def test_continuous_stroke_catches_between_the_three_witnesses(self):
        point=[100*math.cos(math.radians(5)),100*math.sin(math.radians(5)),0]
        witnessed=min(point_segment(point,[0,0,0],[600*math.cos(math.radians(a)),600*math.sin(math.radians(a)),0]) for a in [-10,0,10])
        self.assertGreater(witnessed,8)
        self.assertEqual(sector_point_distance(point,[0,0,0],600,0,math.radians(10)),0)
        self.assertEqual(segment_box([-5,0,0],[5,0,0],[-1,-1,-1],[1,1,1]),0)
        self.assertEqual(segment_box([-5,5,0],[5,5,0],[-1,-1,-1],[1,1,1]),4)

    def test_capture_and_complete_tools_coexist_through_return(self):
        h=self.result['east']['pressure']['handling']
        for a in h['operators']:
            self.assertEqual(a['toolCaptureGeometryFailureBolts'],[])
            self.assertTrue(all(b['continuousStroke']['minimumCaptureClearanceAfter5Mm']>5 for b in a['allBoltControls']))
            self.assertGreater(a['minimumAllBoltCaptureClearanceAfter5Mm'],5)
            self.assertGreaterEqual(a['captureGeometry']['minimumContinuousLiftThroughFloorClearanceAfter5Mm'],5)
            c=a['captureInstallation']
            self.assertGreater(c['minimumContinuousForkInsertionToRetainedBoltClearanceAfter5Mm'],20)
            self.assertGreater(c['minimumPinToolCaptureClearanceAfter5Mm'],5)
            self.assertTrue(all(p['minimumGuidedBitToOwnForkAfter1Mm']>=2 for p in c['pinActuation']))
        bad=self.changed(bailLegHalfSpanMm=240,bailPinHalfSpanMm=240,bailOffsetFraction=0)
        self.assertIn('SPLIT_LID_SOCKET_BAIL_COEXISTENCE_FAILS',bad['diagnostics'])

    def test_actual_550_opening_rejects_old_tangent_body_stance(self):
        opening=[[-275,-363],[275,363]]
        self.assertEqual(floor_opening_body_clearance([575,0],[575,0],opening),-5)
        self.assertEqual(floor_opening_body_clearance([585,0],[585,0],opening),5)

    def test_every_tool_and_carry_body_clears_the_actual_open_floor(self):
        for row in self.result['east']['pressure']['handling']['operators']:
            opening=row['floorOpeningPlanBoundsMm']
            self.assertEqual(opening[1][0]-opening[0][0],550)
            self.assertGreaterEqual(row['minimumBodyToOpenFloorAfter5Mm'],5)
            self.assertGreaterEqual(floor_opening_body_clearance(*row['bodyCarryPathMm'],opening),5)
            for bolt in row['allBoltControls']:
                body=bolt['operatorBodyCentreXYmm']
                self.assertGreaterEqual(floor_opening_body_clearance(body,body,opening),5)

    def test_body_carry_path_checks_between_its_endpoints(self):
        opening=[[-275,-363],[275,363]]
        self.assertGreater(floor_opening_body_clearance([-600,0],[-600,0],opening),0)
        self.assertGreater(floor_opening_body_clearance([600,0],[600,0],opening),0)
        self.assertEqual(floor_opening_body_clearance([-600,0],[600,0],opening),-305)

    def test_wider_opening_repositions_gallery_body_and_regenerates_crew_ports(self):
        altered=self.changed(waterWidthMm=620)
        self.assertEqual(altered['diagnostics'],[])
        for row in altered['east']['pressure']['handling']['operators']:
            self.assertGreaterEqual(row['minimumBodyToOpenFloorAfter5Mm'],5)
        ports=self.result['east']['crewFloorLoadPorts']
        xs={p['xyMm'][0] for p in ports}
        self.assertIn(10635,xs);self.assertIn(11615,xs)
        self.assertNotIn(10625,xs);self.assertNotIn(11625,xs)
        self.assertTrue(all(p['downwardKN']==2 for p in ports))
        for row in self.result['east']['pressure']['handling']['operators']:
            self.assertTrue(any(p['xyMm']==row['bodyStageCentreXYmm'] and 'stage-return' in p['phases'] for p in ports))

    def test_width_and_scupper_edits_update_panel_and_drawing(self):
        altered=self.changed(waterWidthMm=620,scupperSpringMm=720)
        panel=altered['east']['walkingCassettes']
        self.assertEqual(panel['walkingPanelMaximumXYmm'],[240,373])
        svg=render_closed(altered)
        self.assertIn('620 water clear /706 frame /866 gross',svg)
        self.assertIn('spring720/crown870/ring1085',svg)

    def test_walking_points_are_an_independent_explicit_law(self):
        a=self.changed(pointLoadKN=5)
        self.assertEqual(a['east']['dryFloorGrid']['pointLoadLaw'],self.result['east']['dryFloorGrid']['pointLoadLaw'])
        b=self.changed(walkingCoverPointLoadKN=6)
        self.assertIn('METAL_COMPONENT_NUMERICAL_SCREEN_FAILS',b['diagnostics'])
        self.assertEqual(b['east']['dryFloorGrid']['pointLoadLaw']['gridPointResultantKN'],12)

    def test_nominal_weld_deposit_is_in_charged_lifting_mass(self):
        h=self.result['east']['pressure']['handling']
        self.assertGreater(h['doublerFilletNominalDepositKg'],.2)
        self.assertGreater(h['captureAdditionalWeldBudgetKg'],.09)
        self.assertLess(h['chargedLiftingMassKg'],15)
        bad=self.changed(weldMassAllowanceKg=.1)
        self.assertIn('LID_WELD_MASS_ALLOWANCE_BELOW_NOMINAL_FILLET_AND_CAPTURE_BUDGET',bad['diagnostics'])

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
