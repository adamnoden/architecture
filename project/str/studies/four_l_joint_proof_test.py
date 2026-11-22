import copy
import json
from pathlib import Path
import tempfile
import unittest

from four_l_joint_proof import PROOF, check, write


class ActualJointProof(unittest.TestCase):
    @classmethod
    def setUpClass(cls):cls.proof=json.loads(PROOF.read_bytes())

    def test_actual_eight_physical_member_ends_and_four_closed_free_bodies_replay(self):
        proof=check(self.proof);joints=proof['exactObservedInput']['freeBodies']['joints']
        self.assertEqual(sum(len(row['memberCuts']) for row in joints),8)
        self.assertLess(proof['exactObservedInput']['freeBodies']['maximumAbsoluteResidualKN_KNm'],1e-8)
        self.assertEqual(proof['ordinaryControl']['physicalHeadCount'],52)
        self.assertTrue(proof['witness']['exactFullResultEqualityVerified'])
        self.assertTrue(proof['verifiedFullCaptures']['exactFullNativeBytesEqual'])
        self.assertFalse(proof['finiteJointCapacityAvailable'])

    def test_changed_source_method_runtime_and_stored_byte_claim_reject(self):
        for mutation in ('source','method','runtime','bytes','complete-crop','acceptance'):
            proof=copy.deepcopy(self.proof)
            if mutation=='source':proof['sourceSHA256'][next(iter(proof['sourceSHA256']))]='0'*64
            elif mutation=='method':proof['processingSourceSHA256'][next(iter(proof['processingSourceSHA256']))]='0'*64
            elif mutation=='runtime':proof['ordinaryControl']['runtimeThreads']['OPENBLAS_NUM_THREADS']='2'
            elif mutation=='bytes':proof['verifiedFullCaptures']['observedFullCaptureFileSHA256']='0'*64
            elif mutation=='complete-crop':proof['verifiedFullCaptures']['retainedCropReconstructsCompleteNativeBytes']=True
            else:proof['finiteJointCapacityAvailable']=True
            with self.subTest(mutation=mutation),self.assertRaises(ValueError):check(proof)

    def test_actual_raw_end_action_or_derived_demand_cannot_be_relabelled(self):
        for location in ('observation','freeBodies'):
            proof=copy.deepcopy(self.proof)
            if location=='observation':proof['exactObservedInput'][location]['joints'][0]['memberEnds'][0]['rawMasterWrenchKN_KNmm'][2]+=1
            else:proof['exactObservedInput'][location]['joints'][0]['memberCuts'][0]['memberOnJointAtReferenceKN_KNm'][2]+=1
            with self.subTest(location=location),self.assertRaises(ValueError):check(proof)

    def test_actual_node_admission_and_exact_request_are_bound(self):
        proof=copy.deepcopy(self.proof);proof['actualNodeAdmission']['actualNodeAdmissionPassing']=False
        with self.assertRaises(ValueError):check(proof)
        proof=copy.deepcopy(self.proof);proof['witness']['executedRequest']['thicknessMm']=250
        with self.assertRaises(ValueError):check(proof)

    def test_unverified_complete_native_capture_cannot_generate_a_new_receipt(self):
        with tempfile.TemporaryDirectory() as directory:
            paths=[Path(directory)/str(i) for i in range(5)]
            native={'sourceSHA256':self.proof['sourceSHA256'],'request':self.proof['witness']['executedRequest'],
                'nativeVertical':{'native':{'caseId':self.proof['witness']['caseId']}}}
            paths[0].write_text(json.dumps(native));paths[1].write_text(json.dumps({
                'schema':'str-full-native-control-capture/1','fullResultSHA256':'0'*64,
                'sourceSHA256':native['sourceSHA256'],'request':native['request'],
                'nativeCaseId':self.proof['witness']['caseId']}))
            paths[2].write_text(json.dumps(native));paths[3].write_text(json.dumps(self.proof['exactObservedInput']))
            paths[4].write_text(json.dumps(self.proof['actualNodeAdmission']))
            with self.assertRaisesRegex(ValueError,'manifest mismatch'):write(*paths)


if __name__=='__main__':unittest.main()
