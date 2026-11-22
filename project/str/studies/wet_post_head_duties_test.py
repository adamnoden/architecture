import copy
import hashlib
import json
import unittest
from pathlib import Path
import wet_post_head_duties as duties

ROOT=Path(__file__).resolve().parents[3]
PROOF=json.loads(Path(__file__).with_name('wet-support-cage-comparison-proof.json').read_text())
ROW=next(r for r in PROOF['controls'] if r['nativeCaseId']=='wet-aligned-quadrature8')

class DutiesTest(unittest.TestCase):
    def test_actual_north_plane_and_body_retain_correct_units(self):
        p=ROW['exactAssessmentInput']['seatedWetSupport']['posts'][1]
        r=duties.post_duty(p)
        self.assertAlmostEqual(r['compressionKN'],.4466716096472316)
        self.assertAlmostEqual(r['headGrossFullCompressionRatio'],2.480092,places=5)
        self.assertGreater(r['fullCompressionFirstPossibleDepthMm'],160)
        self.assertLess(r['fullCompressionFirstPossibleDepthMm'],170)
        self.assertAlmostEqual(r['bodyGravityKN'],12.5965125)
        self.assertFalse(r['headDRegionAccepted'])
    def test_independent_post_gravity_changes_depth_without_recombining_moments(self):
        p=copy.deepcopy(ROW['exactAssessmentInput']['seatedWetSupport']['posts'][1])
        before=duties.post_duty(p)
        p['recovery']['physicalEndWrenchesKN_KNmm'][2]+=before['bodyGravityKN']
        after=duties.post_duty(p)
        self.assertAlmostEqual(after['fullCompressionFirstPossibleDepthMm'],before['fullCompressionFirstPossibleDepthMm']/2)
        self.assertEqual(after['headWrenchKN_KNmm'],before['headWrenchKN_KNmm'])
    def test_zero_gravity_is_not_a_kern_failure(self):
        row=next(r for r in PROOF['controls'] if r['nativeCaseId']=='wet-zeroG-roof-suction')
        for p in row['exactAssessmentInput']['seatedWetSupport']['posts']:
            r=duties.post_duty(p)
            self.assertEqual(r['status'],'not-loaded-not-applicable')
            self.assertIsNone(r['headGrossFullCompressionRatio'])
    def test_nonvertical_or_tensile_load_requires_new_model(self):
        for index,value in ((6,1),(8,1),(11,1)):
            p=copy.deepcopy(ROW['exactAssessmentInput']['seatedWetSupport']['posts'][1])
            p['recovery']['physicalEndWrenchesKN_KNmm'][index]=value
            with self.assertRaises(ValueError):duties.post_duty(p)
    def test_six_wrench_transport_matches_independent_cross_product(self):
        # Physical force2X/3Y at a point500mm above the new cut produces
        # r x F=(-1500,+1000,0)kNmm; centred2kN gravity changes onlyZ.
        self.assertEqual(duties.section_wrench([2,3,-4,10,20,30],.004,500),[2,3,-6,-1490,1020,30])
        # A bending moment20kNmm with shear -1kN erases the moment20mm
        # below the head. Holding head moment fixed would wrongly find none.
        top=[-1,0,-1,0,20,0]
        depth=duties.first_compression_depth(top,0,60,100,100)
        self.assertAlmostEqual(depth,10)
    def test_redistribution_retains_counts_lengths_and_does_not_hide_cover_limit(self):
        wet=ROW['exactAssessmentInput']['seatedWetSupport'];s=duties.cage.comparison_settings()
        m,a,ca=duties.redistribute_top_levels(wet,s,0)
        _,b,cb=duties.redistribute_top_levels(wet,s,15)
        _,_,cc=duties.redistribute_top_levels(wet,s,20)
        self.assertEqual(len(a),len(b))
        self.assertEqual([x['centrelineLengthUpperMm'] for x in a],[x['centrelineLengthUpperMm'] for x in b])
        for x,y,z in zip(ca,cb,cc):
            self.assertEqual(x['highestCrossTieDepthMm'],66)
            self.assertEqual(y['highestCrossTieDepthMm'],51)
            self.assertEqual(y['topPlaneCoverBeforeCurveBoundMm'],41)
            self.assertTrue(y['pitchWithinDuty']);self.assertTrue(y['topCoverWithinDuty'])
            self.assertFalse(z['topCoverWithinDuty'])
    def test_actual_top_paths_pass_15_but_cover_rejects_20(self):
        result=duties.review(PROOF,ROOT,True)
        # Reuse this complete four-variant replay for the committed receipt;
        # no second expensive geometry pass and no hand-rebound source hashes.
        recorded=json.loads(Path(__file__).with_name('wet-post-head-duties-proof.json').read_text())
        sources=recorded.pop('processingSourceSHA256')
        self.assertEqual(set(sources),{
            'project/str/studies/wet_post_head_duties.py',
            'project/str/studies/wet_support_cage_comparison.py',
            'project/str/studies/wet-support-cage-comparison-settings.json',
            'project/str/studies/wet-support-cage-comparison-proof.json'})
        for path,sha in sources.items():
            self.assertEqual(hashlib.sha256((ROOT/path).read_bytes()).hexdigest(),sha,path)
        self.assertEqual(recorded,result)
        baseline,moderate,raised,adverse=result['topLevelComparisons']
        for candidate in (baseline,moderate,raised):
            self.assertEqual(candidate['independentPairs']['failedPairCount'],0)
            self.assertEqual(candidate['cover']['failedPaths'],[])
            self.assertEqual(candidate['internalClosures']['failures'],[])
        self.assertEqual(len(adverse['cover']['failedPaths']),2)
        self.assertEqual(baseline['quantities']['actualSteelMassUpperKg'],raised['quantities']['actualSteelMassUpperKg'])
    def test_stale_choices_fail_closed(self):
        proof=copy.deepcopy(PROOF);proof['settings']['linkHookTailMm']=90
        with self.assertRaisesRegex(ValueError,'Stale cage choices'):duties.review(proof,ROOT,False)
    def test_stale_minimal_input_fails_closed(self):
        proof=copy.deepcopy(PROOF)
        row=next(r for r in proof['controls'] if 'exactAssessmentInput' in r)
        row['exactAssessmentInput']['seatedWetSupport']['posts'][0]['physicalTopZMm']+=1
        with self.assertRaisesRegex(ValueError,'Stale retained'):duties.review(proof,ROOT,False)

if __name__=='__main__':unittest.main()
