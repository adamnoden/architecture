"""Proposed captures cannot become saved-house admission by changing metadata."""
import copy,unittest
from service_room_ground_receiver_proof import proposed_capture_boundary

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

if __name__=='__main__':unittest.main()
