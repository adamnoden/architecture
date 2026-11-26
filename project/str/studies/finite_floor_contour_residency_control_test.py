import copy, io, json, tarfile, tempfile, unittest
from unittest.mock import patch
import finite_floor_contour_residency_control as observer
from pathlib import Path
from finite_floor_contour_residency_replay import check

class ResidencyReplayControls(unittest.TestCase):
    root=Path(__file__).resolve().parents[3]
    def test_actual_receipt_replays(self):
        r=check(self.root,self.root/'project/str/studies/finite-floor-contour-captures/residency-control.json')
        self.assertEqual([x['pitchMm'] for x in r['comparisons']],[140,70,50])
        self.assertFalse(r['physicalConvergenceAccepted'])

    def test_changed_metrics_condensation_fingerprint_method_and_claim_reject(self):
        receipt=json.loads((self.root/'project/str/studies/finite-floor-contour-captures/residency-control.json').read_bytes())
        mutations=[]
        r=copy.deepcopy(receipt);r['comparisons'][0]['metrics']['sameAssembledOperators']['allRelativeMotionEnergySensitivity']=.001;mutations.append(r)
        r=copy.deepcopy(receipt);r['comparisons'][0]['predecessorCondensation']['condensedStiffness'][0][0]+=10;mutations.append(r)
        r=copy.deepcopy(receipt);r['comparisons'][0]['predecessorCondensation']['condensedStiffness'][0][1]+=1e9;mutations.append(r)
        r=copy.deepcopy(receipt);r['comparisons'][0]['predecessorCondensation']['condensedStiffness'][100][100]+=100;mutations.append(r)
        r=copy.deepcopy(receipt);r['comparisons'][0]['predecessorCondensation']['consistentLoad'][2]+=1;mutations.append(r)
        r=copy.deepcopy(receipt);r['comparisons'][0]['physicalLoad']['rawSHA256']='0'*64;mutations.append(r)
        r=copy.deepcopy(receipt);r['observerMethodSHA256']='0'*64;mutations.append(r)
        r=copy.deepcopy(receipt);r['comparisons'][2]['captureSHA256']='0'*64;mutations.append(r)
        r=copy.deepcopy(receipt);r['physicalConvergenceAccepted']=True;mutations.append(r)
        r=copy.deepcopy(receipt);r['comparisons'][0]['metrics']['sameAssembledOperators']['allRelativeMotionEnergySensitivity']=float('nan');mutations.append(r)
        with tempfile.TemporaryDirectory() as tmp:
            path=Path(tmp)/'receipt.json'
            for r in mutations:
                path.write_text(json.dumps(r))
                with self.assertRaises(ValueError):check(self.root,path)

class HistoricalContourSourceControls(unittest.TestCase):
    root=Path(__file__).resolve().parents[3]
    def test_original_archive_and_full58_tuple_authenticate_at_exact_frozen_anchor(self):
        raw=(self.root/'project/str/studies/finite-floor-contour-residency-history.tar.xz').read_bytes()
        control=observer.historical_source_control(self.root,raw)
        self.assertEqual(control['commit'],'f2acb9e7d7e07aca7108771ea594f38c4d633178')
        self.assertEqual(len(control['nativeSourceSHA256']),58)
        self.assertFalse(control['currentNativeApplicability'])
    def test_changed_archive_or_source_anchor_rejects(self):
        raw=(self.root/'project/str/studies/finite-floor-contour-residency-history.tar.xz').read_bytes()
        with self.assertRaisesRegex(ValueError,'archive changed'):
            observer.historical_source_control(self.root,raw+b'changed')
        with patch.object(observer,'HISTORY_ANCHOR','0'*40):
            with self.assertRaisesRegex(ValueError,'anchor required'):
                observer.historical_source_control(self.root,raw)
    def test_only_separately_authenticated_provenance_is_excluded_from_physical_domain(self):
        path=self.root/'project/str/studies/finite-floor-contour-residency-history.tar.xz'
        with tarfile.open(path) as archive:
            old=json.load(archive.extractfile('finite-floor-contour-captures/contour140.json'))
        current=copy.deepcopy(old)
        current['inputs']['sourceAuditSHA256']='0'*64
        observer.same_physical_domain(current,old)
        mutations=[]
        changed=copy.deepcopy(current);changed['inputs']['wallUnitWeightKNPerM3']+=1;mutations.append(changed)
        changed=copy.deepcopy(current);changed['youngKNPerM2']+=1;mutations.append(changed)
        changed=copy.deepcopy(current);changed['distributedLoadWrenchKN_KNM'][2]+=.1;mutations.append(changed)
        changed=copy.deepcopy(current);changed['inputs']['unexpectedGeometry']=True;mutations.append(changed)
        changed=copy.deepcopy(current);changed['ports']=changed['ports'][:-1];mutations.append(changed)
        for value in mutations:
            with self.assertRaises(ValueError):observer.same_physical_domain(value,old)

if __name__=='__main__':unittest.main()
