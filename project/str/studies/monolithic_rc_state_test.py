import hashlib
import json
from pathlib import Path
import unittest

from rc_portal_monolithic import load_monolithic_rc_source


D=Path(__file__).resolve().parent


class MonolithicCurrentStateTest(unittest.TestCase):
    def test_current_state_evidence_has_exact_source_and_producer_binding(self):
        receipt=json.loads((D/'monolithic-rc-native31-receipt.json').read_text());source=load_monolithic_rc_source(D.parents[2])
        self.assertEqual(receipt['sourceSHA256'],source['identities'])
        self.assertEqual(receipt['proofProducerSHA256'],hashlib.sha256((D/'monolithic_rc_state_proof.py').read_bytes()).hexdigest())
        self.assertEqual(receipt['actionFileSHA256'],hashlib.sha256((D/'monolithic-rc-native31-actions.json').read_bytes()).hexdigest())
        for name,value in receipt['drawingsSHA256'].items():self.assertEqual(value,hashlib.sha256((D/('monolithic-rc-native31-'+name)).read_bytes()).hexdigest())
        self.assertEqual(receipt['executedPhysicalCaseCount'],1);self.assertEqual(receipt['headCount'],52)
        self.assertLess(max(abs(value) for value in receipt['equilibriumResidualKN_KNm']),1e-6)
        self.assertLess(receipt['memberLoadEquilibrium']['maximumResidualKN_KNm'],1e-8)
        self.assertLess(receipt['energyRelativeResidual'],1e-8)
        for name in ('candidateAccepted','waterControlAccepted','thermalAccepted','completeHouseProof','roofAdoption','installedAcceptance'):self.assertFalse(receipt[name])

    def test_simultaneous_physical_cut_boundaries_remain_reviewable(self):
        actions=json.loads((D/'monolithic-rc-native31-actions.json').read_text())
        self.assertEqual(len(actions['heads']),52);self.assertEqual(len({row['id'] for row in actions['heads']}),52)
        self.assertTrue(all(len(row['reactionKN_KNm'])==6 for row in actions['heads']))
        self.assertLess(max(abs(value) for value in actions['equilibriumResidualKN_KNm']),1e-6)
        self.assertEqual(len(actions['capCuts']),8);self.assertEqual(len(actions['adjacentGridMemberCuts']),20)
        self.assertEqual({row['physicalPointMm'][2] for row in actions['capCuts']},{-405,-180})
        self.assertEqual(len(actions['portalNormalContactResults']),0)
        bridge=[row for row in actions['memberCuts'] if '/finite-continuous-RC-former-DPC' in row['memberId']]
        self.assertEqual(len(bridge),8);self.assertEqual({row['physicalPointMm'][2] for row in bridge},{-50,-30})
        self.assertTrue(all(row['breadthMm']==290 and row['depthMm']==212.5 for row in bridge))
        self.assertTrue(all('bendingZKNm' in row and 'torsionKNm' in row for row in actions['interiorMemberCuts']))
        for row in actions['pressureBoundary']['analyticActualPortalChecks']:self.assertLess(max(abs(v) for v in row['quadratureWrenchResidualKN_KNm']),1e-8)


if __name__=='__main__':unittest.main()
