import hashlib
import json
from pathlib import Path
import unittest

from distributed_floor_compatibility import _native_floor_wind
from joined_successor_kernel import cross
from rc_portal_monolithic import load_monolithic_rc_source


D=Path(__file__).resolve().parent


class ActualMonolithicSweepTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.proof=json.loads((D/'monolithic-rc-native96-proof.json').read_text());cls.source=load_monolithic_rc_source(D.parents[2])

    def test_all_executed_cases_have_current_sources_and_actual_programme_ids(self):
        p=self.proof;self.assertEqual(p['sourceSHA256'],self.source['identities'])
        self.assertEqual(p['proofProducerSHA256'],hashlib.sha256((D/'monolithic_rc_sweep.py').read_bytes()).hexdigest())
        self.assertEqual(p['uniquePhysicalWindSolveCount'],48);self.assertEqual(p['programmeIdCount'],96)
        self.assertEqual({r['windIndex'] for r in p['cases']},set(range(48)));self.assertEqual(len(p['cases']),48)
        self.assertEqual({r['windIndex'] for r in p['pairedProgrammeIds']},set(range(48,96)))
        floor=self.source['house']['joined']['floor'];axes=floor['retained']['policy']['axes']
        for row in p['cases']:
            wind=_native_floor_wind(floor,row['windIndex'],axes);self.assertEqual(row['programme'],wind['programme'])
            paired=_native_floor_wind(floor,row['windIndex']+48,axes);self.assertEqual(wind['rows'],paired['rows'])
        for row in p['freshDirectProgrammeChecks']:
            self.assertLess(row['nodalLoadResidualKN_KNmm'],1e-7);self.assertLess(row['memberEquivalentLoadResidualKN_KNmm'],1e-7)
            self.assertTrue(row['pointAndDistributedLoadGeometryExactlyEqual'])
        self.assertFalse(p['candidateAccepted']);self.assertFalse(p['completeHouseProof']);self.assertFalse(p['roofAdoption'])

    def test_every_case_has_52_signed_head_wrenches_and_independent_global_balance(self):
        p=self.proof;grid=json.loads((D/'current-house-grid.json').read_text());positions={row['id']:[*row['xy'],-750] for row in grid['heads']}
        self.assertEqual(len(p['headIds']),52);self.assertEqual(set(p['headIds']),set(positions))
        for row in p['cases']+p['GMAXQCases']:
            self.assertEqual(len(row['headVectorsKN_KNm']),52);self.assertTrue(all(len(r)==6 for r in row['headVectorsKN_KNm']))
            balance=list(row['externalWrenchKN_KNm'])
            for head,wrench in zip(p['headIds'],row['headVectorsKN_KNm']):
                moment=cross(positions[head],wrench[:3])
                for axis in range(3):balance[axis]+=wrench[axis];balance[axis+3]+=wrench[axis+3]+moment[axis]/1000
            self.assertLess(max(abs(v) for v in balance),1e-6)
            self.assertLess(max(abs(v) for v in row['equilibriumResidualKN_KNm']),1e-6)
            self.assertLess(max(abs(v) for v in row['nativeFloorLoadWorkResidualKN_KNm']),1e-6)
            self.assertLess(max(abs(v) for v in row['floorInterfaceWrenchResidualKN_KNm']),1e-6)
            self.assertLess(row['memberLoadEquilibrium']['maximumResidualKN_KNm'],1e-8)
            self.assertLess(row['energyRelativeResidual'],1e-8)

    def test_component_envelopes_are_simultaneous_executed_actions(self):
        p=self.proof;columns=p['actionColumns'];cases={row['caseId']:row for row in p['cases']+p['GMAXQCases']}
        for family,geometry_key,vector_key in (('members','memberCuts','memberCutVectors'),('caps','capCuts','capCutVectors'),('adjacentGrid','adjacentGridMemberCuts','adjacentGridCutVectors')):
            geometry=p['cutGeometry'][geometry_key]
            for case in cases.values():self.assertEqual(len(case[vector_key]),len(geometry))
            for index,shape in enumerate(geometry):
                identity=shape['memberId']+'/'+str(shape['end'])
                for axis,column in enumerate(columns):
                    values=[row[vector_key][index][axis] for row in cases.values()];entry=p['governingActionEnvelopes'][family][identity][column]
                    self.assertAlmostEqual(entry['minimum']['value'],min(values),11);self.assertAlmostEqual(entry['maximum']['value'],max(values),11)
                    for which in ('minimum','maximum'):
                        witness=entry[which];actual=cases[witness['caseId']][vector_key][index]
                        self.assertEqual([witness['simultaneousCut'][key] for key in columns],actual)
        for member,entries in p['governingActionEnvelopes']['interiorMembers'].items():
            rows=[cut for case in cases.values() for cut in case['interiorMemberCuts'] if cut['memberId']==member]
            for column,entry in entries.items():
                self.assertAlmostEqual(entry['minimum']['value'],min(row[column] for row in rows),11);self.assertAlmostEqual(entry['maximum']['value'],max(row[column] for row in rows),11)
        self.assertLess(p['uncachedReplayMemberActionDeltaKN_KNm'],1e-7)


if __name__=='__main__':unittest.main()
