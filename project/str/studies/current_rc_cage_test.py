import hashlib
import json
from pathlib import Path
import unittest

from current_rc_cage import current_cage


D = Path(__file__).resolve().parent


def native_fixture():
    receipt = json.loads((D / 'monolithic-rc-native31-receipt.json').read_text())
    raw = (D / 'monolithic-rc-native31-actions.json').read_bytes()
    if hashlib.sha256(raw).hexdigest() != receipt['actionFileSHA256']:
        raise ValueError('Changed actual native action receipt')
    return {**receipt, **json.loads(raw)}


class CurrentCageTest(unittest.TestCase):
    def test_actual_saved_cuts_recompute_members_interior_sections_and_caps(self):
        native = native_fixture()
        result = current_cage(native, D.parents[2])
        self.assertEqual(result['status'], 'rejected-detail')
        self.assertEqual(result['nativeCaseId'], native['caseId'])
        self.assertFalse(result['detailAssessment']['assemblyAccepted'])
        self.assertTrue(result['detailAssessment']['rejectionReasons'])
        self.assertEqual(result['memberReview']['actualSimultaneousCutCount'], len(native['memberCuts']) + len(native['interiorMemberCuts']))
        self.assertEqual(len(result['capScreens']), 8)
        self.assertEqual({row['headId'] for row in result['capScreens']}, {'P25', 'P26', 'P28', 'P30'})
        for key in ('structureSelected', 'jointPanelAccepted', 'waterstopAccepted', 'installedAcceptance'):
            self.assertFalse(result[key])

    def test_changed_member_geometry_cannot_inherit_reference_cage_strength(self):
        for change in ('core', 'upstand'):
            native = native_fixture()
            house = native['request']['houseCase']
            if change == 'core':
                house['coreAxialWidthMm'] = 300
            else:
                house['joinedCase']['geometry']['outerUpstandDepthMm'] = 755
            result = current_cage(native, D.parents[2])
            self.assertEqual(result['status'], 'unsupported-geometry')
            self.assertNotIn('memberReview', result)
            self.assertNotIn('worstCapComparison', result)

    def test_stale_native_sources_and_transferred_approval_are_rejected(self):
        native = native_fixture()
        native['sourceSHA256']['project/had/studies/water-replan.json'] = '0' * 64
        with self.assertRaisesRegex(ValueError, 'Stale native producer input'):
            current_cage(native, D.parents[2])
        native = native_fixture()
        native['candidateAccepted'] = True
        with self.assertRaisesRegex(ValueError, 'unqualified current native'):
            current_cage(native, D.parents[2])


if __name__ == '__main__':
    unittest.main()
