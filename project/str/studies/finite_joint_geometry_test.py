import json,os,unittest
from pathlib import Path
from finite_joint_geometry import read_SW_geometry,read_corner_geometry

class ExistingNativeGeometryControls(unittest.TestCase):
    root=Path(__file__).resolve().parents[3]
    def test_existing_width_changes_real_disjoint_section_without_moving_outside_or_toes(self):
        a=read_SW_geometry(self.root,140);b=read_SW_geometry(self.root,200)
        self.assertEqual(a['originXYMm'],b['originXYMm']);self.assertEqual(a['sourceSHA256'],b['sourceSHA256'])
        self.assertEqual(a['rectanglesXYMm'][0][0],b['rectanglesXYMm'][0][0]);self.assertEqual(a['rectanglesXYMm'][0][3],b['rectanglesXYMm'][0][3])
        self.assertEqual(b['areaMm2']-a['areaMm2'],99600.)
        self.assertEqual(b['slabZMm'],[3170,3370]);self.assertEqual(b['groundCapZMm'],[-750,-180])
        self.assertEqual(b['rectanglesXYMm'],[[262.5,262.5,462.5,1262.5],[462.5,262.5,1262.5,462.5]])
    def test_all_four_native_sections_share_one_standard_and_actual_head_mirror(self):
        areas=[]
        for corner in ('SW','SE','NW','NE'):
            g=read_corner_geometry(self.root,200,corner);areas.append(g['areaMm2'])
            self.assertEqual(g['areaMm2'],sum((r[2]-r[0])*(r[3]-r[1]) for r in g['rectanglesXYMm']))
            self.assertEqual(g['sourceSHA256'],read_SW_geometry(self.root,200)['sourceSHA256'])
        self.assertEqual(areas,[360000.]*4)
        self.assertEqual(read_corner_geometry(self.root,200,'SE')['rectanglesXYMm'],[[11537.5,262.5,11737.5,1262.5],[10737.5,262.5,11537.5,462.5]])
        with self.assertRaises(ValueError):read_corner_geometry(self.root,200,'invented')
    def test_missing_or_unadmitted_width_cannot_fabricate_geometry(self):
        for value in (None,True,139,241,float('nan')):
            with self.assertRaises(ValueError):read_SW_geometry(self.root,value)
    @unittest.skipUnless(os.environ.get('STR_CURRENT_FINITE_CAPTURE'),'Explicit actual native joint capture required')
    def test_reader_equals_actual_executed_physical_joint(self):
        with open(os.environ['STR_CURRENT_FINITE_CAPTURE']) as f:x=json.load(f)
        width=x['executedConventionalCase']['bearingCase']['masonryCase']['verticalCase']['monolithicCase']['houseCase']['joinedCase']['floor']['cornerWidthsMm']['SW']
        actual=read_SW_geometry(self.root,width);joint=x['audit']['solidGeometry']
        self.assertEqual(actual['rectanglesXYMm'],joint['lowerLRectanglesXYMm']);self.assertEqual(actual['centroidXYMm'],joint['wallCentroidXYMm'])
        self.assertEqual(actual['slabZMm'],joint['slabZMm'])
        self.assertTrue(all(x['sourceSHA256'][p]==v for p,v in actual['sourceSHA256'].items()))

if __name__=='__main__':unittest.main()
