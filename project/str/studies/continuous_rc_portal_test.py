import copy
import hashlib
import json
import math
from pathlib import Path
import unittest

from continuous_rc_portal import build_continuous_rc_portal, load_continuous_rc_source, physical_schedule, reference_continuous_rc_case, solve_continuous_rc_case
from continuous_rc_portal_proof import numerical_case


ROOT=Path(__file__).resolve().parents[3]
D=Path(__file__).resolve().parent


class ContinuousRCPortalTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.source=load_continuous_rc_source(ROOT)
        cls.case=numerical_case(cls.source)
        cls.model=build_continuous_rc_portal(cls.case,cls.source)
        cls.positive=solve_continuous_rc_case(cls.model,cls.source,'positive',{'pressure-positive':1.})
        cls.negative=solve_continuous_rc_case(cls.model,cls.source,'negative',{'pressure-negative':1.})

    def test_unqualified_default_and_source_method_identity_are_mandatory(self):
        with self.assertRaises(ValueError):build_continuous_rc_portal(reference_continuous_rc_case(self.source),self.source)
        for change in ({'candidateAccepted':True},{'sourceSHA256':{}},{'jointZone':'rigid-accepted'},{'dpcLaw':{'mode':'approved'}}):
            case=copy.deepcopy(self.case);case.update(change)
            with self.assertRaises(ValueError):build_continuous_rc_portal(case,self.source)

    def test_exact_physical_union_mass_and_no_old_tie_or_bore(self):
        schedule=physical_schedule(self.model)
        self.assertAlmostEqual(schedule['fullheightPierVolumeM3'],4*.2125*.215*(3.35-.02),12)
        self.assertAlmostEqual(schedule['floorUpstandVolumeM3'],3.385*.14*(.75+.65),12)
        p=self.model['portal'];ri=p['rawRadius'];ro=ri+215;a=1480
        def cap(r):return a*math.sqrt(r*r-a*a)+r*r*math.asin(a/r)
        ring=2*(cap(ro)-cap(ri))*.215/1e6
        self.assertAlmostEqual(schedule['ringOutsidePierUnionVolumeM3'],ring,12)
        self.assertAlmostEqual(schedule['physicalGKN'],-sum(v[2] for v in self.model['families']['physical-G'].values()),10)
        self.assertEqual(schedule['removedHardware']['structuralTieCount'],0)
        self.assertEqual(schedule['removedHardware']['boreDiameterMm'],0)
        self.assertFalse(schedule['removedHardware']['ownerAppearanceApproval'])
        self.assertTrue(all(joint['oldTaperRemoved'] for joint in self.model['joints']))

    def test_exact_solid_face_pressure_area_and_six_component_wrench(self):
        p=self.model['portal'];r=p['finishedRadius'];a=1200
        opening=2400*p['centreZ']+a*math.sqrt(r*r-a*a)+r*r*math.asin(a/r)
        expected=2*2.25*(3385*3170-opening)/1e6
        self.assertAlmostEqual(self.positive['externalWrenchKN_KNm'][1],expected,9)
        self.assertAlmostEqual(self.positive['externalWrenchKN_KNm'][5],expected*6,9)
        for result in (self.positive,self.negative):
            self.assertEqual(len(result['heads']),52)
            self.assertLess(max(abs(v) for v in result['equilibriumResidualKN_KNm']),1e-7)
            self.assertLess(result['energyRelativeResidual'],1e-8)
            self.assertGreater(result['strainEnergyKNmm'],0)
        for a,b in zip(self.positive['heads'],self.negative['heads']):
            self.assertEqual(a['id'],b['id'])
            for x,y in zip(a['reactionKN_KNm'],b['reactionKN_KNm']):self.assertAlmostEqual(x,-y,8)

    def test_unanchored_DPC_is_rejected_without_fabricated_floor_restraint(self):
        self.assertTrue(self.positive['bilateralFullContactDomainRejected'])
        self.assertTrue(self.positive['freeFloorCompressionOnlyEquilibriumRejected'])
        for row in self.positive['freeFloorPortalStatics']:
            self.assertGreater(abs(row['normalOverturningAtDPCMidplaneKNm']),row['maximumCompressionOnlyNormalMomentKNm'])
        self.assertTrue(any(row['requiresNormalTension'] for row in self.positive['dpc']))
        self.assertLess(min(v for row in self.positive['dpc'] for v in row['cornerNormalCompressionMPa']),-6)
        self.assertFalse(self.positive['candidateAccepted'])
        self.assertFalse(self.positive['completeHouseProof'])
        self.assertFalse(self.positive['roofAdoption'])
        self.assertEqual(len(self.model['ports']),4)
        self.assertTrue(all(port['pointMm'][2]==3170 for port in self.model['ports']))
        self.assertFalse(any('diaphragm' in spring['id'] for spring in self.model['model'].springs))

    def test_full_contact_failure_does_not_reject_partial_compression_contact(self):
        result=solve_continuous_rc_case(self.model,self.source,'selfweight',{'physical-G':1.})
        self.assertTrue(result['bilateralFullContactDomainRejected'])
        self.assertFalse(result['freeFloorCompressionOnlyEquilibriumRejected'])
        self.assertTrue(all(not row['compressionOnlyEquilibriumImpossible'] for row in result['freeFloorPortalStatics']))

    def test_rebar_fit_is_distinct_from_unearned_anchorage(self):
        steel=physical_schedule(self.model)['steel']
        self.assertEqual(steel['minimumPostClearBarSpacingMm'],84.5)
        self.assertEqual(steel['minimumRingClearBarSpacingMm'],87)
        self.assertGreater(steel['anchorDevelopmentRequiredMm'],steel['foundationAvailableStraightEmbedmentMm'])
        self.assertFalse(steel['anchorageAccepted'])
        self.assertFalse(steel['archColumnBarTransitionAccepted'])
        self.assertFalse(steel['jointPanelAccepted'])

    def test_material_perturbation_reaches_heads_and_actual_floor_ports(self):
        case=copy.deepcopy(self.case);case['frameLaw']['flexuralFactor']=.125
        model=build_continuous_rc_portal(case,self.source)
        changed=solve_continuous_rc_case(model,self.source,'changed',{'pressure-positive':1.})
        delta=max(abs(x-y) for a,b in zip(self.positive['heads'],changed['heads']) for x,y in zip(a['reactionKN_KNm'],b['reactionKN_KNm']))
        self.assertGreater(delta,.05)
        self.assertGreater(max(abs(x-y) for a,b in zip(self.positive['portMovementsMmMrad'],changed['portMovementsMmMrad']) for x,y in zip(a['value'],b['value'])),10)
        old_grid=[member for member in self.model['model'].members if member[0].startswith('GRID/')]
        new_grid=[member for member in model['model'].members if member[0].startswith('GRID/')]
        self.assertEqual(old_grid,new_grid)
        self.assertEqual(physical_schedule(self.model),physical_schedule(model))

    def test_incoming_native_actions_retain_offsets_and_withhold_duplicates(self):
        self.assertEqual(len(self.model['admittedNativeActions']),100)
        self.assertTrue(all('residualOffsetXYMm' in row for row in self.model['admittedNativeActions']))
        slab=[row for row in self.model['withheldNativeActions'] if row['category']=='first-floor fields' and row['programme']=='G' and row['receivingKind']=='north-wall']
        self.assertEqual(len(slab),1)
        self.assertIn('overlap',slab[0]['reason'])
        self.assertTrue(any(row['receivingKind']=='unresolved-loggia-sidewall' for row in self.model['withheldNativeActions']))
        self.assertFalse(any(row['category'].startswith('roof') for row in self.model['admittedNativeActions']))

    def test_proof_is_bound_and_has_refinement_with_unchanged_control(self):
        proof=json.loads((D/'continuous-rc-portal-proof.json').read_text())
        self.assertEqual(proof['sourceSHA256'],self.source['identities'])
        self.assertEqual(proof['proofProducerSHA256'],hashlib.sha256((D/'continuous_rc_portal_proof.py').read_bytes()).hexdigest())
        self.assertEqual(proof['sectionSvgSHA256'],hashlib.sha256((D/'continuous-rc-portal.svg').read_bytes()).hexdigest())
        self.assertEqual(len(proof['cases']),7)
        self.assertEqual(proof['unresolvedReceivingPortCount'],28)
        self.assertEqual(proof['completeReceivingPaths'],0)
        self.assertLess(proof['archRefinement']['all52HeadMaximumDeltaKN_KNm'],.001)
        self.assertTrue(proof['perturbation']['actualGridMembersUnchanged'])


if __name__=='__main__':unittest.main()
