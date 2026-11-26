"""Proposed captures cannot become saved-house admission by changing metadata."""
import copy,hashlib,unittest
from pathlib import Path
from service_room_ground_receiver_proof import proposed_capture_boundary,captured_proposed_geometry_sources

def capture():
    findings=[{'code':'SOURCE_CONTRADICTION','source':'actual-unit-fixture'}]
    return {'currentSavedDocumentAdmitted':False,'sourceAuditFindings':findings,
        'request':{'stockSource':{'currentSavedDocumentAdmitted':False,'sourceAuditFindings':copy.deepcopy(findings)}}}

class ProposedCaptureBoundaryTests(unittest.TestCase):
    def test_explicit_unadmitted_with_full_findings_is_retained(self):
        a=capture();b=copy.deepcopy(a);proposed_capture_boundary(a,b)
        self.assertEqual(a,b);self.assertFalse(a['currentSavedDocumentAdmitted'])
    def test_missing_or_true_saved_admission_is_rejected_for_both_actual_captures(self):
        for index in [0,1]:
            for value in [None,True]:
                rows=[capture(),capture()];rows[index]['currentSavedDocumentAdmitted']=value
                with self.assertRaisesRegex(ValueError,'impersonate'):proposed_capture_boundary(*rows)
    def test_native_input_admission_and_omitted_or_rewritten_audit_findings_reject(self):
        for change in ['admission','omit','rewrite']:
            rows=[capture(),capture()];source=rows[0]['request']['stockSource']
            if change=='admission':source['currentSavedDocumentAdmitted']=True
            elif change=='omit':source.pop('sourceAuditFindings')
            else:source['sourceAuditFindings']=[]
            with self.assertRaisesRegex(ValueError,'full audit'):proposed_capture_boundary(*rows)

    def test_captured_geometry_dependency_is_bound_to_actual_and_archived_bytes(self):
        root=Path(__file__).resolve().parents[3];path='compiler/reference-house/current-design/inlet-room-pocket.ts';data=(root/path).read_bytes()
        current={'request':{'stockSource':{'actualSource':{'actualSourceSHA256':{path:hashlib.sha256(data).hexdigest()}}}}}
        archive={'proposed-methods/'+path:data}
        self.assertEqual(captured_proposed_geometry_sources(current,archive),current['request']['stockSource']['actualSource']['actualSourceSHA256'])
        with self.assertRaisesRegex(ValueError,'Archived'):
            captured_proposed_geometry_sources(current,{'proposed-methods/'+path:data+b'changed'})
        changed=copy.deepcopy(current);changed['request']['stockSource']['actualSource']['actualSourceSHA256'][path]='0'*64
        with self.assertRaisesRegex(ValueError,'method/input changed'):captured_proposed_geometry_sources(changed,archive)
        with self.assertRaisesRegex(ValueError,'source map required'):captured_proposed_geometry_sources({},archive)

if __name__=='__main__':unittest.main()
