import copy
import hashlib
import json
from pathlib import Path
import unittest

from joined_rc_floor import _continuous_contact, _exact_patch_springs, build_joined_rc_floor, joined_physical_schedule, load_joined_rc_floor_source, reference_joined_rc_floor_case, seed_joined_rc_floor_contact, solve_joined_rc_floor
from joined_rc_floor_proof import numerical_case
from joined_successor_kernel import FrameModel


D=Path(__file__).resolve().parent
ROOT=D.parents[2]


class JoinedRCFloorTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.source=load_joined_rc_floor_source(ROOT)
        cls.case=numerical_case(cls.source)
        cls.model=build_joined_rc_floor(cls.case,cls.source)

    def test_exact_affine_half_contact_and_triangle_tangent_independent_control(self):
        pier={'low':'lo','high':'hi','pointMm':[5,10,0],'footprintXYMm':[0,0,10,20]}
        values={'lo':[0]*6,'hi':[0,0,0,0,-1,0]}
        result=_continuous_contact(pier,values,2)
        self.assertEqual(result['contactAreaMm2'],100)
        self.assertAlmostEqual(result['normalCompressionKN'],500,10)
        self.assertAlmostEqual(result['momentAboutPierCutKNm'][0],0,10)
        self.assertAlmostEqual(result['momentAboutPierCutKNm'][1],5/3,10)
        self.assertEqual(result['maximumOpeningGapMm'],5)
        frame=FrameModel();frame.node('lo',[5,10,-1]);frame.node('hi',[5,10,1])
        model={'model':frame,'dpcNodes':[pier],'request':{'dpcLaw':{'normalStiffnessKNPerMm3':2}}}
        _exact_patch_springs(model,{'portalNormalContactResults':[{'continuousPlaneContactInspection':result}]})
        wrench=[0.]*6
        for spring in frame.springs:
            relative=sum(coefficient*values[node][axis] for node,row in spring['terms'] for axis,coefficient in enumerate(row))
            force=spring['stiffness']*relative;terms=next(row for node,row in spring['terms'] if node=='hi')
            wrench=[a-force*b for a,b in zip(wrench,terms)]
        self.assertAlmostEqual(wrench[2],500,10)
        self.assertAlmostEqual(wrench[4]/1000,5/3,10)

    def test_exact_current_source_and_unqualified_authored_inputs_required(self):
        with self.assertRaises(ValueError):build_joined_rc_floor(reference_joined_rc_floor_case(self.source),self.source)
        for change in ({'sourceSHA256':{}},{'accepted':True},{'northUnion':'full-band-plus-full-upstand'},{'portalDPCNormalMode':'installed'}):
            altered=copy.deepcopy(self.case);altered.update(change)
            with self.assertRaises(ValueError):build_joined_rc_floor(altered,self.source)
        stale=copy.deepcopy(self.source);stale['floor']['retained']['values']['project/had/studies/water-replan.json']['model']['insulatedPortal']['rawSpan']=3060
        with self.assertRaisesRegex(ValueError,'Source portal geometry changed'):build_joined_rc_floor(self.case,stale)
        with self.assertRaises(ValueError):seed_joined_rc_floor_contact(self.model,self.source,{'sourceSHA256':{}})

    def test_actual_floor_union_and_work_planes_are_explicit(self):
        joined=self.model['joinedFloor'];floor=joined['floor']
        self.assertEqual(len(floor['ports']),26)
        self.assertEqual(len(joined['corners']),4)
        self.assertEqual(len(self.model['ports']),4)
        self.assertEqual(len(floor['finiteBeamBoundaryReceivers']),2)
        self.assertEqual(sum(len(row['stations']) for row in floor['finiteBeamBoundaryReceivers']),22)
        self.assertLess(max(floor['rigidModeResidualKN']),1e-3)
        self.assertLess(floor['modeReconstructionRelativeError'],1e-8)
        self.assertTrue(all(receiver['width']==140 for receiver in floor['finiteBeamBoundaryReceivers']))
        schedule=joined_physical_schedule(self.model)
        self.assertAlmostEqual(schedule['physicalGKN'],-sum(row[2] for row in self.model['families']['physical-G'].values()),9)
        terms=joined['portTerms']
        self.assertTrue(any(abs(row[4])==275 for entry in terms for node,row in entry))
        self.assertTrue(any(abs(row[4])==225 for entry in terms for node,row in entry))

    def test_aperture_cannot_borrow_full_upstand_material(self):
        case=copy.deepcopy(self.case)
        case['floor']['componentCase']['edits']['floorApertures']=[{'id':'FLOOR-APERTURE/plant-riser','shape':{'kind':'rectangle','boundsXYMm':[5000,11590,5600,11660]}}]
        with self.assertRaisesRegex(ValueError,'APERTURE_INTERSECTS_STRUCTURAL_PATH'):build_joined_rc_floor(case,self.source)

    def test_real_depth_edit_updates_members_centroids_and_own_mass(self):
        case=copy.deepcopy(self.case);case['geometry']['outerUpstandDepthMm']=850
        changed=build_joined_rc_floor(case,self.source)
        a=joined_physical_schedule(self.model);b=joined_physical_schedule(changed)
        self.assertAlmostEqual(b['physicalGKN']-a['physicalGKN'],3.385*.14*.1*25,10)
        self.assertEqual(changed['wallFrames']['outer-north']['west']['beamZMm'],3595)
        self.assertEqual(changed['wallFrames']['court-north']['west']['beamZMm'],3495)
        self.assertEqual(changed['members']['outer-north/upstand/0']['depthMm'],850)
        self.assertEqual(self.model['joinedFloor']['floor']['finiteBeamBoundaryReceivers'],changed['joinedFloor']['floor']['finiteBeamBoundaryReceivers'])
        self.assertNotEqual(self.model['joinedFloor']['portTerms'],changed['joinedFloor']['portTerms'])
        old_member=next(row for row in self.model['model'].members if row[0]=='outer-north/upstand/0')
        new_member=next(row for row in changed['model'].members if row[0]=='outer-north/upstand/0')
        self.assertAlmostEqual(new_member[3][0][0]/old_member[3][0][0],850/750,10)
        self.assertEqual([member for member in self.model['model'].members if member[0].startswith('GRID/')],[member for member in changed['model'].members if member[0].startswith('GRID/')])

    def test_actual_joined_bilateral_challenge_has_52head_force_and_energy_balance(self):
        case=copy.deepcopy(self.case);case.update(portalDPCNormalMode='bilateral',portalDPCNormalIntegration='fixed-gauss',portalDPCQuadratureOrder=2,portalDPCNormalSubdivisions=1)
        model=build_joined_rc_floor(case,self.source)
        result=solve_joined_rc_floor(model,self.source,'bilateral-pressure-regression',{'pressure-positive':1.})
        self.assertEqual(len(result['heads']),52)
        self.assertLess(max(abs(v) for v in result['equilibriumResidualKN_KNm']),1e-7)
        self.assertLess(max(abs(v) for v in result['floorInterfaceWrenchResidualKN_KNm']),1e-6)
        self.assertLess(result['energyRelativeResidual'],1e-8)
        self.assertLess(result['maximumFrameTranslationMm'],3)
        self.assertTrue(result['bilateralFullContactDomainRejected'])
        self.assertIsNone(result['freeFloorCompressionOnlyEquilibriumRejected'])
        self.assertFalse(result['candidateAccepted'])
        self.assertEqual(result['unresolvedReceivingPortCount'],28)
        self.assertEqual(len(model['ports']),4)

    def test_source_bound_proof_preserves_signed_contact_and_real_propagation(self):
        proof=json.loads((D/'joined-rc-floor-proof.json').read_text())
        self.assertEqual(proof['sourceSHA256'],self.source['identities'])
        self.assertEqual(proof['proofProducerSHA256'],hashlib.sha256((D/'joined_rc_floor_proof.py').read_bytes()).hexdigest())
        self.assertEqual(proof['floorSvgSHA256'],hashlib.sha256((D/'joined-rc-floor.svg').read_bytes()).hexdigest())
        for name in ('0.9physicalG-noQ-positive2.25kPa','0.9physicalG-noQ-negative2.25kPa','0.9physicalG-5mm-edge-loss-positive2.25kPa'):
            result=proof['cases'][name]
            self.assertEqual(result['contactIntegrationStatus'],'exact-positive-affine-patch-compatible')
            self.assertLess(result['exactPatchIterations'][-1]['maximumExactNOrMomentResidualKN_KNm'],1e-7)
            self.assertTrue(all(row['minimumSampleNormalForceKN']>=-1e-8 for row in result['portalNormalContactResults']))
        zero=proof['cases']['zero-favourableG-positive2.25kPa']
        self.assertTrue(any(row['shearWithoutNormalCompression'] for row in zero['portalNormalContactResults']))
        self.assertGreater(proof['upstandDepthPerturbation']['all52HeadMaximumDeltaKN_KNm'],1e-5)
        self.assertGreater(proof['aperturePerturbation']['all52HeadMaximumDeltaKN_KNm'],1e-6)
        self.assertTrue(proof['aperturePerturbation']['actualGridMembersUnchanged'])
        self.assertTrue(proof['aperturePerturbation']['physicalPortalMassUnchanged'])
        self.assertFalse(proof['completeHouseProof'])


if __name__=='__main__':unittest.main()
