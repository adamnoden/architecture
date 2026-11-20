import hashlib
import json
from pathlib import Path
import unittest

from rc_portal_monolithic import load_monolithic_rc_source


D=Path(__file__).resolve().parent
COLUMNS=('axialCompressionKN','shearYKN','shearZKN','torsionKNm','bendingYKNm','bendingZKNm')


class ActualGoverningReplayTest(unittest.TestCase):
    def test_all_cage_and_translation_governors_have_source_bound_uncached_replays(self):
        source=load_monolithic_rc_source(D.parents[2]);proof=json.loads((D/'monolithic-rc-native96-proof.json').read_text());records=[]
        producer=hashlib.sha256((D/'monolithic_rc_governing_replay.py').read_bytes()).hexdigest();sweep=hashlib.sha256((D/'monolithic-rc-native96-proof.json').read_bytes()).hexdigest()
        for kind in ('governing','translation'):
            receipt=json.loads((D/('monolithic-rc-'+kind+'-replay.json')).read_text());self.assertEqual(receipt['sourceSHA256'],source['identities'])
            self.assertEqual(receipt['proofProducerSHA256'],producer);self.assertEqual(receipt['sourceSweepSHA256'],sweep)
            self.assertEqual(receipt['executedUncachedCases'],len(receipt['records']));records.extend(receipt['records'])
            self.assertFalse(receipt['candidateAccepted']);self.assertFalse(receipt['completeHouseProof'])
        self.assertEqual({r['caseId'] for r in records},{'MONOLITHIC-G0.9-W31','MONOLITHIC-G0.9-W35','MONOLITHIC-GMAXQ-W7','MONOLITHIC-GMAXQ-W31'})
        for row in records:
            self.assertFalse(row['nativeFactorMemoUsed']);self.assertLess(max(row['maximumActionReplayDeltaKN_KNm'].values()),1e-7)
            self.assertLess(max(abs(v) for v in row['equilibriumResidualKN_KNm']),1e-6)
            self.assertLess(row['memberLoadEquilibrium']['maximumResidualKN_KNm'],1e-8)

    def test_published_governing_actions_recover_every_simultaneous_sweep_cut_and_head(self):
        source=load_monolithic_rc_source(D.parents[2]);proof=json.loads((D/'monolithic-rc-native96-proof.json').read_text());cases={row['caseId']:row for row in proof['cases']+proof['GMAXQCases']}
        for kind in ('governing','translation'):
            for actual in json.loads((D/('monolithic-rc-'+kind+'-actions.json')).read_text()):
                self.assertEqual(actual['sourceSHA256'],source['identities']);expected=cases[actual['caseId']]
                self.assertEqual(len(actual['heads']),52)
                by_head={row['id']:row['reactionKN_KNm'] for row in actual['heads']}
                self.assertLess(max(abs(a-b) for head,old in zip(proof['headIds'],expected['headVectorsKN_KNm']) for a,b in zip(old,by_head[head])),1e-7)
                for key,stored in (('memberCuts','memberCutVectors'),('capCuts','capCutVectors'),('adjacentGridMemberCuts','adjacentGridCutVectors')):
                    vectors=[[row[column] for column in COLUMNS] for row in actual[key]];self.assertEqual(len(vectors),len(expected[stored]))
                    self.assertLess(max(abs(a-b) for old,new in zip(expected[stored],vectors) for a,b in zip(old,new)),1e-7)


if __name__=='__main__':unittest.main()
