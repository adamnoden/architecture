"""Current exact-input replay and capture/parent binding; no native solves."""
import copy
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

import wet_support_cage_comparison_proof as batch


class CurrentCageBatchTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.proof=json.loads(batch.PROOF.read_text());cls.source,cls.grid=batch.source_and_grid()
        cls.wet=next(r for r in cls.proof['controls'] if r['status']=='assessed-incomplete-design')

    def test_current_native_and_processing_inputs_replay_once_per_actual_geometry(self):
        with patch.object(batch,'geometry_evidence',wraps=batch.geometry_evidence) as geometry:
            batch.check_inputs(self.proof,self.source,self.grid)
        self.assertEqual(len(self.proof['controls']),11);self.assertEqual(self.proof['wetCaseCount'],7)
        self.assertEqual(geometry.call_count,self.proof['uniqueGeometryCheckCount'])
        self.assertEqual(self.proof['uniqueGeometryCheckCount'],1)

    def test_missing_case_stale_method_and_changed_request_reject(self):
        for mutate in (
                lambda p:p['controls'].pop(),
                lambda p:p['processingSourceSHA256'].update({batch.PROCESSING_FILES[0]:'0'*64}),
                lambda p:p['controls'][0].update(requestCanonicalSHA256='0'*64),
                lambda p:p['controls'][3]['beamCutOriginAudit'].update(physicalBeamElementCutsAvailable=False)):
            p=copy.deepcopy(self.proof);mutate(p)
            with self.assertRaises(ValueError):batch.check_inputs(p,self.source,self.grid)

    def test_retained_simultaneous_action_cannot_change_under_its_projection(self):
        p=copy.deepcopy(self.proof);row=next(r for r in p['controls'] if r['status']=='assessed-incomplete-design')
        row['exactAssessmentInput']['nativeVertical']['native']['memberCuts'][0]['bendingYKNm']+=1
        with self.assertRaises(ValueError):batch.check_inputs(p,self.source,self.grid)
        row['exactAssessmentInputSHA256']=batch.digest(row['exactAssessmentInput'])
        with self.assertRaises(ValueError):batch.check_inputs(p,self.source,self.grid)

    def test_geometry_identity_contains_actual_paths_and_source_solids(self):
        native=self.wet['exactAssessmentInput'];settings=self.proof['settings']
        result=batch.projection(native,self.grid,settings)
        actual=batch.geometry_inputs(result,native,self.grid,settings)
        self.assertEqual(batch.digest(actual),self.wet['geometryInputSHA256'])
        shifted=copy.deepcopy(native)
        rect=shifted['seatedWetSupport']['posts'][0]['rectangleXYMm'];rect[0]+=1;rect[2]+=1
        result=batch.projection(shifted,self.grid,settings)
        changed=batch.geometry_inputs(result,shifted,self.grid,settings)
        self.assertNotEqual(batch.digest(changed),batch.digest(actual))

    def test_parent_join_requires_exact_current_11_requests_and_full_capture_hashes(self):
        controls=[{'nativeCaseId':name,'sourceSHA256':self.source['identities'],'executedRequest':request}
            for name,request in batch.expected_controls(self.source)]
        for actual,row in zip(controls,self.proof['controls']):
            if row['status']=='assessed-incomplete-design':
                actual['seatedWetSupport']={**copy.deepcopy(row['exactAssessmentInput']['seatedWetSupport']),
                    'plateAttachmentAudit':copy.deepcopy(row['beamCutOriginAudit'])}
        parent={'schema':'str-coupled-floor-section-proof/1','sourceSHA256':self.source['identities'],
            'controls':controls,'fullResultCaptureSHA256ByCase':{r['nativeCaseId']:r['fullResultSHA256'] for r in self.proof['controls']}}
        self.assertTrue(batch.check_parent_join(self.proof,parent))
        changed=copy.deepcopy(parent);changed['fullResultCaptureSHA256ByCase'][controls[0]['nativeCaseId']]='0'*64
        with self.assertRaises(ValueError):batch.check_parent_join(self.proof,changed)
        changed=copy.deepcopy(parent);changed['controls'][0]['executedRequest']['thicknessMm']=250
        with self.assertRaises(ValueError):batch.check_parent_join(self.proof,changed)
        changed=copy.deepcopy(parent);changed['controls'][3]['seatedWetSupport']['posts'][0]['recovery']['physicalEndWrenchesKN_KNmm'][3]+=1
        with self.assertRaises(ValueError):batch.check_parent_join(self.proof,changed)

    def test_external_capture_request_and_full_bytes_are_checked_before_projection(self):
        name,request=batch.expected_controls(self.source)[0]
        with tempfile.TemporaryDirectory() as temporary:
            directory=Path(temporary)/batch.capture_relative_directory(self.source,name,request);directory.mkdir(parents=True)
            (directory/'request.json').write_text(json.dumps(request));(directory/'result.full.json').write_text('{}')
            manifest={'schema':'str-full-native-control-capture/1','sourceSHA256':self.source['identities'],
                'request':request,'nativeCaseId':name,'fullResultSHA256':'0'*64}
            (directory/'capture.json').write_text(json.dumps(manifest))
            with self.assertRaisesRegex(ValueError,'checksum'):batch.verify_capture(temporary,self.source,name,request)
            (directory/'request.json').write_text('{}')
            with self.assertRaisesRegex(ValueError,'request'):batch.verify_capture(temporary,self.source,name,request)

    def test_actual_unloaded_head_and_unknown_mass_boundaries_survive_batch(self):
        row=next(r for r in self.proof['controls'] if r['nativeCaseId']=='wet-zeroG-roof-suction')
        heads=[r for r in row['assessment']['simultaneousSectionScreens']['postCuts'] if r['end']==1]
        self.assertTrue(all(r['grossCompressionKernStatus']=='not-loaded-not-applicable' for r in heads))
        for row in self.proof['controls']:
            if row['status']!='assessed-incomplete-design':continue
            result=row['assessment'];self.assertFalse(result['cageAccepted'])
            self.assertFalse(result['quantities']['installedMass25Qualified'])
            self.assertFalse(result['quantities']['wireChairsAndExistingGridCageIncluded'])
            self.assertTrue(all(r['postHeadDRegionAccepted'] is False for r in result['simultaneousSectionScreens']['postCuts']))


if __name__=='__main__':unittest.main()
