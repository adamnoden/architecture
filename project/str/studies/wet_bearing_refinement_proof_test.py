"""Retained actual numerical evidence rejects corruption and changed scope."""
import copy
import json
from pathlib import Path
import tempfile
import unittest

from floor_section_model import load_source
from wet_bearing_refinement_proof import (
    PROOF, ROOT, NAMES, check, derive, expected_native_request, pack_native,
    post_head_duties, read_capture, unpack_native)


class WetBearingRefinementProofTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.proof = json.loads(PROOF.read_bytes())

    def test_actual_cropped_replay_retains_failed16_to32_and_unchanged64_screens(self):
        proof = check(self.proof)
        results = {row['id']: row['comparison'] for row in proof['derived']['comparisons']}
        self.assertFalse(results['wet27-16-to-32']['numericalRefinementPassing'])
        self.assertFalse(results['wet27-16-to-32']['coarse']['numericalSamePlaneIntegrationPassing'])
        for name in ('wet25-16-to-32', 'wet25-32-to-64', 'wet27-32-to-64', 'zeroG-32-to-64'):
            self.assertTrue(results[name]['numericalRefinementPassing'])
        self.assertEqual(results['zeroG-32-to-64']['maximum52HeadComponentDifferenceKN_KNm'], 0)
        self.assertEqual(proof['derived']['restoredEight']['maximumHeadComponentDifferenceKN_KNm'], 0)
        self.assertEqual(proof['nonlinearSolvesExecutedByThisProducer'], 0)
        self.assertFalse(proof['physicalContactAccepted'])
        self.assertFalse(proof['wholeHouseAccepted'])

    def test_lossless_cropped_input_round_trip_and_corruption_rejection(self):
        crop = self.proof['controls'][0]['exactCroppedNativeInput']
        native = unpack_native(crop)
        self.assertEqual(unpack_native(pack_native(native)), native)
        for field, value in [('decodedBytes', crop['decodedBytes'] + 1),
                             ('decodedSHA256', '0' * 64),
                             ('data', 'not valid base64!'),
                             ('reconstructsCompleteNativeResponse', True)]:
            changed = {**crop, field: value}
            with self.assertRaises(ValueError):
                unpack_native(changed)

    def test_method_source_parent_or_stored_verdict_change_rejects(self):
        proof = copy.deepcopy(self.proof)
        proof['processingSourceSHA256']['project/str/studies/wet_bearing_refinement.py'] = '0' * 64
        with self.assertRaisesRegex(ValueError, 'Stale'):
            check(proof)
        proof = copy.deepcopy(self.proof)
        proof['restoredEightReference']['heads'][0]['reactionKN_KNm'][0] += 1
        with self.assertRaisesRegex(ValueError, 'parent'):
            check(proof)
        proof = copy.deepcopy(self.proof)
        proof['derived']['comparisons'][2]['comparison']['numericalRefinementPassing'] = True
        with self.assertRaisesRegex(ValueError, 'replay'):
            check(proof)

    def test_named_request_cannot_hide_changed_mass_or_load(self):
        proof = copy.deepcopy(self.proof)
        native = unpack_native(proof['controls'][0]['exactCroppedNativeInput'])
        native['request']['wetSupport']['concreteUnitWeightKNPerM3'] = 27
        native['seatedWetSupport']['settings']['concreteUnitWeightKNPerM3'] = 27
        proof['controls'][0]['exactCroppedNativeInput'] = pack_native(native)
        with self.assertRaisesRegex(ValueError, 'identities'):
            check(proof)

    def test_actual_post_head_traction_and_pad_weight_match_full_native_six_actions(self):
        for row in self.proof['controls']:
            native = unpack_native(row['exactCroppedNativeInput'])
            result = post_head_duties(native)
            self.assertEqual(len(result['posts']), 2)
            for post in result['posts']:
                self.assertLess(max(map(abs, post['topReconstructionResidualKN_KNm'])), 1e-6)
                self.assertLess(max(map(abs, post['postBodyEquilibriumResidualKN_KNm'])), 1e-6)
        native = unpack_native(self.proof['controls'][0]['exactCroppedNativeInput'])
        native['seatedWetSupport']['posts'][0]['recovery']['physicalEndWrenchesKN_KNmm'][8] += .01
        with self.assertRaisesRegex(ValueError, 'six-wrench'):
            post_head_duties(native)

    def test_missing_or_corrupted_complete_capture_cannot_create_a_new_actual_receipt(self):
        source = load_source(ROOT)
        with tempfile.TemporaryDirectory(prefix='wet-bearing-capture-rejection-') as temporary:
            directory = Path(temporary)
            name = NAMES[0]
            with self.assertRaisesRegex(ValueError, 'Missing complete'):
                read_capture(directory, name, source)
            request = expected_native_request(name, source)
            (directory / (name + '.request.json')).write_text(json.dumps(request))
            (directory / (name + '.full.json')).write_text('incomplete native bytes')
            manifest = {'schema': 'str-full-native-control-capture/1', 'sourceSHA256': source['identities'],
                        'request': request, 'nativeCaseId': name, 'fullResultSHA256': '0' * 64}
            (directory / (name + '.capture.json')).write_text(json.dumps(manifest))
            with self.assertRaisesRegex(ValueError, 'checksum'):
                read_capture(directory, name, source)

    def test_duplicate_restored_head_and_unsupported_acceptance_are_not_hidden(self):
        proof = copy.deepcopy(self.proof)
        row = proof['controls'][-1]
        native = unpack_native(row['exactCroppedNativeInput'])
        native['nativeVertical']['native']['heads'].append(copy.deepcopy(native['nativeVertical']['native']['heads'][0]))
        row['exactCroppedNativeInput'] = pack_native(native)
        with self.assertRaisesRegex(ValueError, 'actual52'):
            derive(proof['controls'], proof['restoredEightReference'], proof['authored']['criteria'])
        proof = copy.deepcopy(self.proof)
        proof['wholeHouseAccepted'] = True
        with self.assertRaisesRegex(ValueError, 'Unearned'):
            check(proof)


if __name__ == '__main__':
    unittest.main()
