"""Current-builder metadata admission; no nonlinear native solve is requested."""
import copy
from pathlib import Path
import unittest

from floor_interface_manifest import observe
from floor_section_model import load_source, reference_case

ROOT=Path(__file__).resolve().parents[3]


class MetadataTest(unittest.TestCase):
    def test_actual_named_ports_and_physical_traces_without_solving(self):
        case=reference_case(load_source(ROOT))
        result=observe(case,'MANIFEST-CONTROL',ROOT)
        self.assertEqual(result['nonlinearSolvesExecuted'],0)
        self.assertFalse(result['wholeJointDemandAvailable'])
        self.assertEqual({r['id'] for r in result['corners']},{'SW','SE','NW','NE'})
        used=set()
        for row in result['corners']:
            self.assertEqual(row['collectorNodeId'],row['id']+'/collector')
            self.assertEqual([p['coordinate'] for p in row['ports']],[0,1,2])
            self.assertGreater(len(row['physicalPlatePointTraces']),2)
            local={p['index'] for p in row['ports']}
            self.assertFalse(used.intersection(local));used.update(local)
            for trace in row['physicalPlatePointTraces']:
                self.assertTrue(all(all(i in local for i,_ in terms) for terms in trace['plateCoordinateCoefficients']))
        self.assertEqual(result['request'],case)

    def test_stale_source_and_invalid_case_id_reject_before_reconstruction(self):
        case=reference_case(load_source(ROOT));stale=copy.deepcopy(case)
        stale['sourceSHA256']['project/str/studies/floor_section_model.py']='0'*64
        with self.assertRaisesRegex(ValueError,'Exact current native'):
            observe(stale,'STALE',ROOT)
        with self.assertRaisesRegex(ValueError,'stable native case ID'):
            observe(case,'bad id',ROOT)


if __name__=='__main__':unittest.main()
