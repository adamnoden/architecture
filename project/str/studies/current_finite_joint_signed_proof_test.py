import copy,json,tempfile,unittest
from pathlib import Path
from current_finite_joint_signed_proof import current_document_identity,require_document_bundle_identity,require_document_snapshot,digest,digest_bytes

DOCUMENT=Path('project/ccr/studies/working-house-comparison.json')

class SavedDocumentProvenance(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.document=json.loads(DOCUMENT.read_text());cls.identity=current_document_identity(DOCUMENT)
    def test_unchanged_document_matches_the_actual_shared_admission(self):
        self.assertEqual(require_document_bundle_identity(DOCUMENT,{'documentIdentity':self.identity}),self.identity)
        self.assertEqual(len(self.identity['digest']),64)
    def test_old_bundle_cannot_acquire_changed_width_or_live_load_identity(self):
        with tempfile.TemporaryDirectory() as directory:
            path=Path(directory)/'changed.json'
            for edit in ('width','live-load'):
                changed=copy.deepcopy(self.document)
                if edit=='width':changed['stages']['distributedFloor']['cornerWidthsMm']['SW']+=20
                else:changed['stages']['masonryFrame']['freshUniformLiveKPa']+=1
                path.write_text(json.dumps(changed))
                with self.assertRaisesRegex(ValueError,'supplied saved document'):
                    require_document_bundle_identity(path,{'documentIdentity':self.identity})
    def test_current_snapshot_is_checked_after_preparation(self):
        with tempfile.TemporaryDirectory() as directory:
            path=Path(directory)/'source.json';path.write_text(json.dumps(self.document))
            packet={'documentPath':str(path),'documentSnapshotSHA256':digest_bytes(path.read_bytes()),
                    'controllingChoicesSHA256':digest({'design':self.document['design'],'stages':self.document['stages']})}
            require_document_snapshot(packet)
            changed=copy.deepcopy(self.document);changed['stages']['distributedFloor']['cornerWidthsMm']['SW']+=20
            path.write_text(json.dumps(changed))
            with self.assertRaisesRegex(ValueError,'prepared snapshot'):require_document_snapshot(packet)

if __name__=='__main__':unittest.main()
