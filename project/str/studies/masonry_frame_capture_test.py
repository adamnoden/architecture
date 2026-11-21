"""Cache rejection tests; incomplete samples never pose as solved house proof."""
import copy
import hashlib
import json
from pathlib import Path
import tempfile
import unittest

from masonry_frame_a_proof import _capture_paths, read_capture, validate_full_capture


class MasonryFrameCaptureTest(unittest.TestCase):
    def specimen(self,directory):
        d=Path(directory);source={'identities':{'native-method.py':'a'*64}};case={'sourceSHA256':source['identities'],'control':'authored'}
        full=d/'response.json';full.write_text('deliberately not a solved native response')
        receipt={'schema':'str-masonry-full-control-capture/1','sourceSHA256':source['identities'],
            'request':case,'nativeCaseId':'MASONRY-FRAME-A/baseline',
            'fullResultSHA256':hashlib.sha256(full.read_bytes()).hexdigest()}
        manifest=d/'capture.json';manifest.write_text(json.dumps(receipt))
        return full,manifest,source,case,receipt

    def test_source_request_and_name_mutations_reject_before_result_reuse_and_preserve_files(self):
        with tempfile.TemporaryDirectory() as directory:
            full,manifest,source,case,receipt=self.specimen(directory);original=full.read_bytes()
            for key,value in [('sourceSHA256',{}),('request',{}),('nativeCaseId','MASONRY-FRAME-A/other')]:
                changed=copy.deepcopy(receipt);changed[key]=value;manifest.write_text(json.dumps(changed));saved=manifest.read_bytes()
                with self.assertRaisesRegex(ValueError,'stale or different'):
                    read_capture(full,manifest,case,source,'baseline')
                self.assertEqual(full.read_bytes(),original);self.assertEqual(manifest.read_bytes(),saved)

    def test_checksum_mutation_rejects_without_deleting_or_replacing_the_response(self):
        with tempfile.TemporaryDirectory() as directory:
            full,manifest,source,case,receipt=self.specimen(directory)
            full.write_text('changed after the checksum was recorded');saved=full.read_bytes();receipt_saved=manifest.read_bytes()
            with self.assertRaisesRegex(ValueError,'checksum mismatch'):
                read_capture(full,manifest,case,source,'baseline')
            self.assertEqual(full.read_bytes(),saved);self.assertEqual(manifest.read_bytes(),receipt_saved)

    def test_absent_capture_recomputes_but_a_stale_orphan_manifest_is_not_ignored(self):
        with tempfile.TemporaryDirectory() as directory:
            d=Path(directory);source={'identities':{}};case={'control':'authored'}
            self.assertIsNone(read_capture(d/'missing.json',d/'missing-manifest.json',case,source,'baseline'))
            receipt={'schema':'str-masonry-full-control-capture/1','sourceSHA256':{},'request':case,
                'nativeCaseId':'MASONRY-FRAME-A/baseline','fullResultSHA256':'0'*64}
            manifest=d/'capture.json';manifest.write_text(json.dumps(receipt))
            self.assertIsNone(read_capture(d/'missing.json',manifest,case,source,'baseline'))
            receipt['request']={};manifest.write_text(json.dumps(receipt))
            with self.assertRaisesRegex(ValueError,'stale or different'):
                read_capture(d/'missing.json',manifest,case,source,'baseline')
            self.assertTrue(manifest.exists())

    def test_request_file_identity_cannot_be_overwritten_in_its_content_addressed_directory(self):
        with tempfile.TemporaryDirectory() as directory:
            source={'identities':{'method':'hash'}};case={'control':250}
            request,full,manifest=_capture_paths(source,case,'probe',Path(directory))
            self.assertEqual(json.loads(request.read_text()),case)
            request.write_text(json.dumps({'control':500}));saved=request.read_bytes()
            with self.assertRaisesRegex(ValueError,'Stored capture request changed'):
                _capture_paths(source,case,'probe',Path(directory))
            self.assertEqual(request.read_bytes(),saved);self.assertFalse(full.exists());self.assertFalse(manifest.exists())

    def test_incomplete_result_cannot_earn_a_verified_capture(self):
        source={'identities':{str(i):'0'*64 for i in range(49)}};case={'sourceSHA256':source['identities']}
        for result in ({},{'schema':'str-masonry-frame-a-result/1','sourceSHA256':source['identities'],'request':case}):
            with self.assertRaisesRegex(ValueError,'exact49-source|native source'):
                validate_full_capture(result,case,source,'baseline')


if __name__=='__main__':unittest.main()
