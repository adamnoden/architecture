import copy
import json
from pathlib import Path
import tempfile
import unittest
from floor_section_model import load_source,reference_case
from floor_section_proof import capture


class FullNativeCaptureRejectionTest(unittest.TestCase):
    def test_complete_source_request_and_full_result_checksum_are_required_before_reuse(self):
        source=load_source(Path(__file__).resolve().parents[3]);case=reference_case(source)
        with tempfile.TemporaryDirectory(prefix='reject-native-capture-') as directory:
            d=Path(directory);request=d/'request.json';request.write_text(json.dumps(case));full=d/'full.json';full.write_text('incomplete')
            manifest=d/'capture.json';valid={'schema':'str-full-native-control-capture/1','sourceSHA256':source['identities'],'request':case,'nativeCaseId':'probe','fullResultSHA256':'0'*64}
            manifest.write_text(json.dumps(valid))
            with self.assertRaisesRegex(ValueError,'checksum mismatch'):capture('probe',request,full,manifest,verify=True)
            for field,value in [('sourceSHA256',{}),('request',{}),('nativeCaseId','different')]:
                changed=copy.deepcopy(valid);changed[field]=value;manifest.write_text(json.dumps(changed))
                with self.assertRaisesRegex(ValueError,'stale or different'):capture('probe',request,full,manifest,verify=True)
            self.assertEqual(full.read_text(),'incomplete')


if __name__=='__main__':unittest.main()
