"""Bind the actual fine-mesh sparse runtime from its first public consumer."""
import hashlib
from pathlib import Path
import unittest
from unittest.mock import patch

import distributed_floor_compatibility as distributed
from north_portal_receiving import load_north_receiving_source
from continuous_rc_portal import load_continuous_rc_source
from joined_rc_floor import load_joined_rc_floor_source
from rc_floor_house_loads import load_rc_floor_house_source
from rc_portal_monolithic import load_monolithic_rc_source
from vertical_rc_floor import load_vertical_rc_floor_source
from floor_section_model import load_source


ROOT=Path(__file__).resolve().parents[3]
PIN='project/str/studies/vertical-floor-requirements.txt'
LOADERS=(distributed.load_distributed_floor_source,load_north_receiving_source,load_continuous_rc_source,
    load_joined_rc_floor_source,load_rc_floor_house_source,load_monolithic_rc_source,
    load_vertical_rc_floor_source,load_source)


class DistributedSparseDependencyTest(unittest.TestCase):
    def test_actual_pin_is_inherited_once_and_late_union_is_not_inflated(self):
        expected=hashlib.sha256((ROOT/PIN).read_bytes()).hexdigest()
        current=[f(ROOT)['identities'] for f in LOADERS]
        for row in current:self.assertEqual(row[PIN],expected)
        self.assertEqual(sum(path==PIN for path in distributed.EXTRA_SOURCES),1)
        # Independent control restores only the previous inventory declaration;
        # it does not mutate any source file or execute a native solve.
        with patch.object(distributed,'EXTRA_SOURCES',tuple(p for p in distributed.EXTRA_SOURCES if p!=PIN)):
            previous=[f(ROOT)['identities'] for f in LOADERS]
        for index,(old,new) in enumerate(zip(previous,current)):
            self.assertEqual(set(new)-set(old),{PIN} if index<6 else set())
            self.assertEqual(len(new)-len(old),1 if index<6 else 0)

    def test_pin_edit_changes_all_consuming_source_identities_without_new_counts(self):
        original=Path.read_bytes;before=[f(ROOT)['identities'] for f in LOADERS]
        def edited(path):
            raw=original(path)
            return raw+b'\n# explicit dependency change probe\n' if path==ROOT/PIN else raw
        with patch.object(Path,'read_bytes',edited):
            after=[f(ROOT)['identities'] for f in LOADERS]
        for old,new in zip(before,after):
            self.assertEqual(set(old),set(new));self.assertNotEqual(old[PIN],new[PIN])
            self.assertEqual({p for p in old if old[p]!=new[p]},{PIN})


if __name__=='__main__':unittest.main()
