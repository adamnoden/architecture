"""Actual authenticated development-parent controls; no structural solve."""
import copy,json,os,unittest
from pathlib import Path
import current_finite_joint_signed_proof as signed
INPUT=Path(os.environ['STR_REAR_DEVELOPMENT_INPUT'])
class DevelopmentAuthority(unittest.TestCase):
    @classmethod
    def setUpClass(cls):cls.packet=signed.read(INPUT)
    def test_actual_current_source_parent_and_saved_snapshot_are_bound(self):
        signed.admit_packet(self.packet)
        self.assertFalse(self.packet['currentSavedEngineeringDocumentAdmitted'])
        self.assertIsNone(self.packet['documentIdentity'])
    def test_changed_case_settings_choices_source_transition_or_adoption_cannot_inherit_parent(self):
        for label in ('native-case','settings','choices','source-transition','adoption','document-path','helper','ordinary-fallback'):
            p=copy.deepcopy(self.packet)
            if label=='native-case':p['nativeCase']['thicknessMm']=250.
            elif label=='settings':p['settings']['youngMPa']=16500.
            elif label=='choices':p['rearChoices']['openingYMm'][0]+=25.
            elif label=='source-transition':p['developmentAuthority']['nativeSourceTransition'][0]['newSHA256']='old'
            elif label=='adoption':p['currentSavedEngineeringDocumentAdmitted']=True
            elif label=='document-path':p['documentPath']='not-the-prepared-document.json'
            elif label=='helper':p['developmentAuthority']['helperSHA256']='old'
            else:p.pop('developmentAuthority');p.pop('currentSavedEngineeringDocumentAdmitted')
            with self.subTest(label=label),self.assertRaises((ValueError,FileNotFoundError)):signed.admit_packet(p)
    def test_actual_saved_source_cannot_be_edited_after_preparation(self):
        path=Path(self.packet['documentPath']);before=path.read_bytes()
        try:
            value=json.loads(before);value['stages']['distributedFloor']['cornerWidthsMm']['SW']+=20.
            path.write_text(json.dumps(value))
            with self.assertRaisesRegex(ValueError,'prepared snapshot'):signed.admit_packet(self.packet)
        finally:path.write_bytes(before)
if __name__=='__main__':unittest.main()
