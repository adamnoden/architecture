"""Actual fine-contact and end-witness checks, with no native or geometry solve."""
import copy,json,unittest
from pathlib import Path

from floor_section_model import load_source
from uniform_slab_law_proof import load_captures,read_controls as law_controls
from uniform_slab_contact_refinement import read_controls,requests,load_fine
from uniform_slab_contact_end import authenticate_geometry,produce
from wet_bearing_refinement import compare_contacts

ROOT=Path(__file__).resolve().parents[3];D=Path(__file__).resolve().parent

class UniformContactRefinementTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.source=load_source(ROOT);cls.controls=read_controls();cls.requests=requests(cls.source,cls.controls)
        natives,cls.coarse_provenance=load_captures(cls.source,law_controls());cls.coarse=natives['uniform200']
        cls.fine,_=load_fine(cls.source,cls.controls,cls.requests[1])
        cls.criteria=json.loads((D/'wet-bearing-refinement-inputs.json').read_bytes())['criteria']

    def test_actual_fixed_mesh_normal_order_doubling_meets_unchanged_contact_criteria(self):
        r=compare_contacts(self.coarse,self.fine,self.criteria)
        self.assertTrue(r['numericalRefinementPassing'])
        self.assertEqual((r['coarseOrder'],r['fineOrder']),(32,64))
        self.assertLess(r['maximum52HeadComponentDifferenceKN_KNm'],self.criteria['maximum52HeadComponentDifferenceKN_KNm'])
        self.assertTrue(all(p['coupledLocalComparisonPassing'] for p in r['posts']))
        self.assertEqual(self.coarse['nativeVertical']['plate']['cellsXYMm'],self.fine['nativeVertical']['plate']['cellsXYMm'])
        self.assertFalse(r['physicalContactAccepted']);self.assertFalse(r['postHeadResistanceAccepted'])

    def test_changed_law_cannot_be_disguised_as_normal_quadrature_refinement(self):
        bad=copy.deepcopy(self.fine)
        bad['request']['bearingCase']['masonryCase']['verticalCase']['plateLaw']['elasticModulusMPa']=33000
        with self.assertRaisesRegex(ValueError,'Identical current sources and physical requests'):compare_contacts(self.coarse,bad,self.criteria)
        bad=copy.deepcopy(self.fine);bad['seatedWetSupport']['contactFibres'][0]['normalCompressionKN']=-.001
        with self.assertRaisesRegex(ValueError,'tensile-residual'):compare_contacts(self.coarse,bad,self.criteria)

    def test_no_material_or_global_stress_claim_can_enter_authored_refinement_controls(self):
        for k in ['materialQualified','globalStressConverged','floorSelected']:
            bad=copy.deepcopy(self.controls);bad[k]=True
            with self.assertRaises(ValueError):read_controls(bad)

    def test_stale_geometry_methods_or_authored_choices_cannot_be_reused(self):
        prior=json.loads((D/'uniform-slab-law-end-consequence.json').read_bytes())
        authenticate_geometry(prior,self.source,self.coarse_provenance)
        bad=copy.deepcopy(prior);bad['processingMethodSHA256']['project/str/studies/wet_support_cage_comparison.py']='0'*64
        with self.assertRaisesRegex(ValueError,'geometry methods changed'):authenticate_geometry(bad,self.source,self.coarse_provenance)
        bad=copy.deepcopy(prior);bad['authoredInputSHA256']['project/str/studies/wet-support-cage-comparison-settings.json']='0'*64
        with self.assertRaisesRegex(ValueError,'authored controls changed'):authenticate_geometry(bad,self.source,self.coarse_provenance)

    def test_actual_fine_end_forces_keep_d100_direction_without_promoting_curved_force_or_resistance(self):
        r,_=produce()
        self.assertLess(abs(r['samePhysicalEndRefinementConsequences']['100']['governingNominalMandrelDifferenceMm']),1e-5)
        for mandrel,failures in [('80',3),('100',0)]:
            c=r['actualForceCases']['q64'][mandrel]['sourceCutComparisons']['cuts']
            self.assertEqual(sum(not v['necessaryMandrelScreenPasses']for row in c for v in row.get('comparisons',[])),failures)
            self.assertEqual(sum(row['status']=='unsupported-curved-return-or-ramp'for row in c),5)
        self.assertFalse(r['actualBarForceBoundsAvailable']);self.assertFalse(r['globalStressConverged'])
        self.assertFalse(r['candidateAccepted']);self.assertFalse(r['nativeSolveExecuted'])

if __name__=='__main__':unittest.main()
