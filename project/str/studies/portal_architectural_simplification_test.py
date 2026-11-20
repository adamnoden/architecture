import copy
import json
import math
import unittest

from portal_architectural_simplification import D, ROOT, canonical_comparison_receipt, derive, proof, reference_case


class ArchitecturalComparisonTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.model=json.loads((ROOT/'project/had/studies/water-replan.json').read_text())['model']
        cls.grid=json.loads((D/'current-house-grid.json').read_text());cls.r=proof()

    def test_a_actual_radial_seat_and_direct_support(self):
        a=self.r['A'];p=self.model['insulatedPortal']
        for point,radius in ((a['innerSpringXZMm'],p['rawRadius']),(a['outerSeatXZMm'],p['rawRadius']+p['ring'])):
            self.assertAlmostEqual(math.hypot(point[0]-6000,point[1]-p['centreZ']),radius)
        self.assertTrue(a['directBearingToCap']);self.assertEqual(a['capInwardPlanReserveMm'],100)
        self.assertEqual(a['localCellularGlassReserveMm'],60)
        self.assertFalse(a['abutmentReinforcementAccepted'])

    def test_b_preserves_room_and_finished_profile(self):
        b=self.r['B'];self.assertEqual(b['rawSpanMm'],2785);self.assertEqual(b['finishedWidthMm'],2400)
        self.assertEqual(b['outboardRoomProjectionMm'],0);self.assertEqual(b['newWestRoomFinishXMm'],4280.5)
        self.assertEqual(b['jambCellularGlassMm'],152.5);self.assertEqual(b['finishedAxialMm'],775)
        self.assertAlmostEqual(b['newCapEccentricityXMm'],42.5)

    def test_b_ring_post_union_does_not_double_count(self):
        b=self.r['B'];self.assertAlmostEqual(b['totalAdditionalRCUnionM3'],.3114735175043204)
        self.assertGreater(b['ringOverlapRemovedM3'],0)
        self.assertLess(b['totalAdditionalRCUnionM3'],b['fourPostGrossAdditionalRCM3'])

    def test_one_b_trial_is_rejected_not_every_possible_joint(self):
        trial=self.r['B']['barTieTrial'];self.assertFalse(trial['assemblyFabricationAccepted'])
        self.assertGreater(trial['maximumAcceptedTrialGapWithSettingMm'],100)
        self.assertLess(min(r['clearance']['nominalCentreDistanceMm'] for r in trial['negativeWitnesses']),11.25)

    def test_projection_perturbation_recomputes_and_unchanged_b_control(self):
        case=reference_case();case['masonrySeatProjectionMm']=150
        new=derive(case,self.model,self.grid)
        self.assertGreater(new['A']['rawStructuralSpanMm'],self.r['A']['rawStructuralSpanMm'])
        self.assertLess(new['A']['fourGrossAbutmentsRCM3'],self.r['A']['fourGrossAbutmentsRCM3'])
        self.assertEqual(new['B'],self.r['B'])

    def test_adverse_support_and_approval_refused(self):
        case=reference_case();case['masonrySeatProjectionMm']=300
        with self.assertRaises(ValueError):derive(case,self.model,self.grid)
        case=reference_case();case['assessed']=True
        with self.assertRaises(ValueError):derive(case,self.model,self.grid)
        grid=copy.deepcopy(self.grid);next(x for x in grid['heads'] if x['id']=='P25')['capXY']=[400,400]
        with self.assertRaises(ValueError):derive(reference_case(),self.model,grid)


    def test_receipt_precision_preserves_authored_controls_and_raw_decisions(self):
        before=copy.deepcopy(self.r);receipt=canonical_comparison_receipt(self.r)
        self.assertEqual(self.r,before)
        for key in ('case','sourcePortal','sourceSHA256'):
            self.assertEqual(receipt[key],before[key])
        self.assertFalse(receipt['selectedOrInstalled'])
        self.assertEqual([row['passes'] for row in receipt['B']['barTieTrial']['stationTrials']],
            [row['passes'] for row in before['B']['barTieTrial']['stationTrials']])
        changed=copy.deepcopy(before);changed['case']['masonrySeatProjectionMm']+=1e-10
        self.assertNotEqual(canonical_comparison_receipt(changed),receipt)
        changed=copy.deepcopy(before);changed['sourcePortal']['rawRadius']+=1e-10
        self.assertNotEqual(canonical_comparison_receipt(changed),receipt)
        changed=copy.deepcopy(before);changed['sourceSHA256']['changed']='stale'
        self.assertNotEqual(canonical_comparison_receipt(changed),receipt)

    def test_observed_clearance_noise_canonicalizes_but_geometry_and_decisions_do_not(self):
        before=copy.deepcopy(self.r);after=copy.deepcopy(self.r)
        for index in (0,1,2,3,4,5,12,13,14,15,16):
            before['B']['barTieTrial']['stationTrials'][index]['clearance']['adverseSurfaceLowerBoundMm']=1.405733448594022
            after['B']['barTieTrial']['stationTrials'][index]['clearance']['adverseSurfaceLowerBoundMm']=1.4057334485940203
        self.assertEqual(canonical_comparison_receipt(before),canonical_comparison_receipt(after))
        changed=copy.deepcopy(before);changed['B']['barTieTrial']['stationTrials'][0]['clearance']['adverseSurfaceLowerBoundMm']+=1e-8
        self.assertNotEqual(canonical_comparison_receipt(changed),canonical_comparison_receipt(before))
        changed=copy.deepcopy(before);changed['B']['barTieTrial']['stationTrials'][0]['passes']=False
        self.assertNotEqual(canonical_comparison_receipt(changed),canonical_comparison_receipt(before))

    def test_gravity_witness_is_not_wind_or_floor_acceptance(self):
        a=self.r['A'];w=a['ownRingOnlyThreeHingeWitness']
        self.assertAlmostEqual(2*w['verticalReactionKN'],a['oneRingTrialWeightKN'])
        self.assertGreater(w['horizontalReactionKN'],0)
        self.assertFalse(self.r['sourceNative48ForcesReused']);self.assertFalse(self.r['selectedOrInstalled'])


if __name__=='__main__':unittest.main()
