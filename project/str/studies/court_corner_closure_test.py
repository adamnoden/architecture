import copy
import unittest
from pathlib import Path
from court_corner_closure import MODE, apply_court_corner_closure, corner_closure_geometry
from foundation_solid_weight import load_foundation_solid_weight_source, source_foundation_solids

ROOT=Path(__file__).resolve().parents[3]

class CourtCornerClosureTest(unittest.TestCase):
    def test_body_is_derived_disjoint_real_quarter_of_existing_node(self):
        source=load_foundation_solid_weight_source(ROOT);row=corner_closure_geometry(source['grid'])
        self.assertEqual(row['boxXYZMm'],[3650,3650,-630,3950,3950,-180]);self.assertEqual(row['newRCVolumeM3'],.0405)
        for solid in source_foundation_solids(source['grid']):
            a,b=row['boxXYZMm'],solid['boxXYZMm'];self.assertFalse(all(min(a[i+3],b[i+3])-max(a[i],b[i])>1e-8 for i in range(3)))

    def test_null_does_not_mutate_existing_model(self):
        model={'unchanged':[1,2,3]};before=copy.deepcopy(model)
        self.assertIsNone(apply_court_corner_closure(model,None,None,None));self.assertEqual(model,before)

    def test_injected_mode_and_approval_reject_before_any_geometry_mutation(self):
        for setting in ({'mode':'invented'},{'mode':MODE,'approved':True},False):
            model={}
            with self.assertRaises(ValueError):apply_court_corner_closure(model,{},setting,{'unitWeightKNPerM3':25,'gravityFactor':1})
            self.assertEqual(model,{})

    def test_unjoined_axes_and_existing_body_overlap_reject(self):
        source=load_foundation_solid_weight_source(ROOT);grid=copy.deepcopy(source['grid']);grid['girders']['court-S']['extent'][0]-=1
        with self.assertRaises(ValueError):corner_closure_geometry(grid)
        grid=copy.deepcopy(source['grid']);grid['heads'][0]['xy']=[3800,3800]
        with self.assertRaises(ValueError):corner_closure_geometry(grid)

    def test_duplicate_body_does_not_mutate_twice(self):
        with self.assertRaises(ValueError):apply_court_corner_closure({'courtCornerClosure':{}},{},{'mode':MODE},{'unitWeightKNPerM3':25,'gravityFactor':1})

if __name__=='__main__':unittest.main()
