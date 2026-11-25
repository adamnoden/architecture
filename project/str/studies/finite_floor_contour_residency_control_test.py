import copy, json, tempfile, unittest
from pathlib import Path
from finite_floor_contour_residency_control import check

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

if __name__=='__main__':unittest.main()
