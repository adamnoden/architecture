import copy
import hashlib
import json
from pathlib import Path
import unittest

from rc_floor_house_loads import _family_wrench, _origin_wrench, build_rc_floor_house, load_rc_floor_house_source, rc_house_schedule, reference_rc_floor_house_case
from rc_floor_house_proof import numerical_case


D=Path(__file__).resolve().parent
ROOT=D.parents[2]


class RCFloorHouseTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.source=load_rc_floor_house_source(ROOT);cls.case=numerical_case(cls.source)
        cls.model=build_rc_floor_house(cls.case,cls.source)

    def test_source_bound_null_default_and_no_injected_results(self):
        with self.assertRaises(ValueError):build_rc_floor_house(reference_rc_floor_house_case(self.source),self.source)
        for update in ({'sourceSHA256':{}},{'accepted':True},{'finishedAxialWidthMm':800},{'courtyardPressure':2.25}):
            case=copy.deepcopy(self.case);case.update(update)
            with self.assertRaises(ValueError):build_rc_floor_house(case,self.source)

    def test_real_widths_mass_cap_faces_and_775wrap(self):
        model=self.model;schedule=rc_house_schedule(model)
        self.assertAlmostEqual(schedule['physicalGKN'],-sum(row[2] for row in model['families']['physical-G'].values()),9)
        self.assertAlmostEqual(schedule['physicalGKN'],62.61764681339025,9)
        edit=schedule['widthEdit'];self.assertEqual(edit['cellularGlassFaceThicknessMm'],202.5)
        self.assertEqual(290+2*(202.5+40),775)
        self.assertEqual(edit['cellularGlassThicknessLossFraction'],.15625)
        for row in edit['footprints']:
            a=row['authoredCoreFootprintXYMm'];b=row['actualCapFootprintXYMm']
            self.assertTrue(a[0]>=b[0] and a[1]>=b[1] and a[2]<=b[2] and a[3]<=b[3])
            self.assertEqual(a[3]-a[1],290)
        self.assertTrue(all(member['breadthMm']==(200 if member['kind']=='upstand' else 290) for member in model['members'].values()))

    def test_no_CST_or_extra_chord_inside_widened_north_upstands(self):
        floor=self.model['joinedFloor']['floor']
        for receiver in floor['finiteBeamBoundaryReceivers']:
            self.assertEqual(receiver['width'],200)
            for triangle in floor['meshTrianglesXYMm']:
                x=sum(point[0] for point in triangle)/3;y=sum(point[1] for point in triangle)/3
                self.assertFalse(receiver['lo']<x<receiver['hi'] and abs(y-receiver['datum'])<100-1e-7)

    def test_real_exposure_and_independent_circularsegment_force_moments(self):
        pressure=self.model['housePressure'];self.assertEqual(pressure['actualGardenWalkingZMm'],-152.5)
        self.assertEqual(pressure['belowWalkingBandHeightMm'],27.5)
        removal=pressure['removedGrossLowerPortalShares'][0]
        self.assertAlmostEqual(removal['sourceGrossFullFaceBelowWalkKN'],-.209446875,12)
        self.assertAlmostEqual(removal['sourceGrossLowerFloorShareBelowWalkKN'],-.1047234375,12)
        analytic=pressure['analyticActualPortalChecks'][0]
        self.assertLess(max(abs(value) for value in analytic['quadratureWrenchResidualKN_KNm']),1e-9)
        actual=_family_wrench(self.model,self.model['families']['actual-outer-portal-ground-pressure'])
        for a,b in zip(actual,analytic['wrenchKN_KNm']):self.assertAlmostEqual(a,b,8)
        self.assertAlmostEqual(actual[1],-12.88217475858052,10)
        self.assertAlmostEqual(actual[3],27.232931915936767,10)
        floor_actual=_family_wrench(self.model,self.model['families']['native-floor-reconciled'])
        floor_expected=_origin_wrench(pressure['reconciledFloorRows'])
        self.assertLess(max(abs(a-b) for a,b in zip(floor_actual,floor_expected)),1e-6)
        self.assertTrue(any(row['route']=='actual-finite-north-upstand-torsion-stations' for row in pressure['projectionCouples']))

    def test_world_half_face_orientation_is_preserved(self):
        right=build_rc_floor_house(numerical_case(self.source,32),self.source)
        left=build_rc_floor_house(numerical_case(self.source,33),self.source)
        self.assertEqual(right['housePressure']['removedGrossLowerPortalShares'][0]['intervalMm'],[6000,7692.5])
        self.assertEqual(left['housePressure']['removedGrossLowerPortalShares'][0]['intervalMm'],[4307.5,6000])
        a=_family_wrench(right,right['families']['actual-outer-portal-ground-pressure'])
        b=_family_wrench(left,left['families']['actual-outer-portal-ground-pressure'])
        self.assertAlmostEqual(a[1],b[1],10)
        self.assertNotAlmostEqual(a[5],b[5],4)

    def test_actual29proof_has_full_physical_cuts_and_honest_case_counts(self):
        proof=json.loads((D/'rc-floor-house-proof.json').read_text());result=proof['result']
        self.assertEqual(proof['sourceSHA256'],self.source['identities'])
        self.assertEqual(proof['proofProducerSHA256'],hashlib.sha256((D/'rc_floor_house_proof.py').read_bytes()).hexdigest())
        self.assertEqual(proof['executedJoinedStructuralCaseCount'],1)
        self.assertEqual(proof['sourceRecipeCount'],96)
        self.assertEqual(len(result['heads']),52);self.assertEqual(len(result['capCuts']),8)
        self.assertTrue(all(row['physicalPointMm'][2] in (-405,-180) for row in result['capCuts']))
        self.assertTrue(all('shearYKN' in row and 'torsionKNm' in row for row in result['memberCuts']))
        self.assertTrue(result['inheritedFourH16StrengthScreensDiscarded'])
        self.assertLess(max(abs(value) for value in result['equilibriumResidualKN_KNm']),1e-6)
        self.assertFalse(result['candidateAccepted']);self.assertFalse(result['completeHouseProof'])


if __name__=='__main__':unittest.main()
