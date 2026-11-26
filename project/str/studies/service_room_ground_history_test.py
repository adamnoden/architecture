"""Only the already-historical three-body specimen uses immutable source objects."""
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

import service_room_ground_proof as replay


class ImmutableThreeBodyHistory(unittest.TestCase):
    def test_actual_frozen_replay_preserves_original_receipt_and_current_kernels(self):
        root=replay.D.parents[2]
        receipt=replay.PROOF.read_bytes();archive=replay.ARCHIVE.read_bytes()
        result=replay.produce()
        self.assertEqual(result,json.loads(receipt))
        self.assertEqual(receipt,replay.frozen_blob(root,replay.PROOF_PATH))
        self.assertEqual(archive,replay.frozen_blob(root,replay.ARCHIVE_PATH))
        self.assertIn('three-body historical',result['scope'])
        self.assertFalse(result['candidateAccepted']);self.assertFalse(result['wholeHouseAccepted'])
        # The current source has the separately admitted correction; the
        # historical replay must not ask it to impersonate the original tuple.
        source,_=replay.historical_inputs(root)
        name='project/str/studies/distributed_floor_compatibility.py'
        self.assertNotEqual(replay.digest((root/name).read_bytes()),source['identities'][name])
        self.assertEqual(replay.PROOF.read_bytes(),receipt);self.assertEqual(replay.ARCHIVE.read_bytes(),archive)

    def test_tampered_historical_archive_cannot_inherit_original_identity(self):
        with tempfile.TemporaryDirectory() as directory:
            archive=Path(directory)/'archive.tar.xz';archive.write_bytes(replay.ARCHIVE.read_bytes()+b'changed')
            with patch.object(replay,'ARCHIVE',archive),self.assertRaisesRegex(ValueError,'historical three-body archive changed'):
                replay.historical_inputs(replay.D.parents[2])

    def test_tampered_original_native_object_rejects(self):
        original=replay.frozen_blob;target='project/str/studies/perforated_floor_condensation.py'
        def changed(root,path):
            data=original(root,path)
            return data+b'changed' if path==target else data
        with patch.object(replay,'frozen_blob',side_effect=changed),self.assertRaisesRegex(ValueError,'Historical native source object differs'):
            replay.historical_inputs(replay.D.parents[2])

    def test_changed_source_anchor_rejects_before_reading_historical_inputs(self):
        with patch.object(replay.subprocess,'check_output',return_value='0'*40+'\n'),self.assertRaisesRegex(ValueError,'historical source anchor changed'):
            replay.historical_inputs(replay.D.parents[2])


if __name__=='__main__':unittest.main()
