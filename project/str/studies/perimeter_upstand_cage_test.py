"""Targeted exact-profile controls; no native house solve."""
import copy,json,math,unittest
import perimeter_upstand_cage as p
class CageControls(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.c=json.loads(p.INPUT.read_bytes());s,raw=p.source.load()
        cls.base,*_=p.source.derive(s,raw);cls.r=p.assess(cls.c,cls.base)
    def test_actual_levels_and_four_source_mirrors(self):
        self.assertEqual(self.r['geometry']['slabZMm'],[3170,3370])
        self.assertEqual(self.r['sourceCornerMirrors'][0]['outerFaceXYMm'],[262.5,262.5])
        self.assertEqual(len(self.r['sourceCornerMirrors']),4)
        self.assertFalse(self.r['newInnerMasonrySeatUsed'])
        self.assertFalse(self.r['nativeHouseSolveExecuted'])
    def test_exact_circle_box_distance_analytic_controls(self):
        self.assertAlmostEqual(p.arc_box_distance([0,0],10,0,math.pi/2,[15,0],0),5)
        self.assertAlmostEqual(p.arc_box_distance([0,0],10,0,math.pi/2,[15,0],2),3)
        self.assertAlmostEqual(p.arc_box_distance([0,0],10,0,math.pi/2,[10,0],2),0)
        self.assertAlmostEqual(p.arc_box_distance([0,0],10,0,math.pi/2,[-5,0],0),math.sqrt(125))
    def test_main_bar_routes_clear_real_column_holes(self):
        self.assertEqual(self.r['columnBarsNominalCount'],16)
        self.assertTrue(self.r['cornerMainBarHoleChecksPass'])
        self.assertGreater(self.r['beamColumnWitness']['adverseCylinderClearMm'],0)
        self.assertGreater(self.r['floorColumnWitness']['adverseProjectedCylinderClearMm'],0)
    def test_small_outer_ring_bend_is_an_actual_collision(self):
        c=copy.deepcopy(self.c);c['geometry']['beamPlanRadiiMm'][0]=89
        self.assertLess(p.assess(c,self.base)['beamColumnWitness']['adverseCylinderClearMm'],0)
    def test_finer_uniform_tail_rows_hit_the_column_bends(self):
        c=copy.deepcopy(self.c);c['geometry']['floorBarNominalMm']=12;c['geometry']['floorBarOutsideMm']=14
        c['geometry']['floorPitchMm']=45;c['geometry']['floorAlongCoordinatesMm']=list(range(315,901,45))
        self.assertLess(p.assess(c,self.base)['floorColumnWitness']['adverseProjectedCylinderClearMm'],0)
    def test_opposed_returns_are_real_connected_profiles(self):
        for bar in self.r['cornerFloorPaths']:
            for a,b in zip(bar['primitives'],bar['primitives'][1:]):
                self.assertLess(math.dist(p.sample_primitive(a)[-1],p.sample_primitive(b)[0]),1e-8)
        bottom=[x for x in self.r['cornerFloorPaths'] if '/bottom/' in x['id']]
        top=[x for x in self.r['cornerFloorPaths'] if '/top/' in x['id']]
        self.assertLess(max(x['verticalTailZMm'][1] for x in bottom),3170)
        self.assertGreater(min(x['verticalTailZMm'][0] for x in top),3370)
    def test_field_area_and_actual_parallel_clearances(self):
        b=self.r['materialBounds']
        self.assertGreater(b['floorAreaMm2PerM'],b['legacyH16Per80AreaMm2PerM'])
        self.assertGreaterEqual(self.r['parallelFloorBarAdverseClearMm'],21)
        self.assertGreaterEqual(self.r['interMatAdverseParallelClearMm'],21)
    def test_corner_bond_and_bend_are_not_only_drawn(self):
        b=self.r['materialBounds'];self.assertGreater(b['cornerStraightTailReserveMm'],0)
        self.assertGreater(b['cornerMandrelReserveMm'],0)
        c=copy.deepcopy(self.c);c['geometry']['cornerFloorMandrelMm']=160
        self.assertLess(p.material_bounds(c)['cornerMandrelReserveMm'],0)
    def test_350_top_anchor_failure_is_preserved(self):
        b=self.r['materialBounds'];x=next(x for x in b['ordinary350Anchorage'] if x['layer']=='X-top')
        self.assertEqual(x['straightAfterBendMm'],62)
        self.assertEqual(x['minimumStandardBendTailMm'],70)
        self.assertFalse(x['standardBendTailFits'])
        self.assertEqual(b['prospective360MinimumStraightTailMm'],72)
        self.assertTrue(b['360GeometryIsAnUnselectedComparison'])
    def test_no_complete_cage_or_demand_acceptance_injection(self):
        c=copy.deepcopy(self.c);c['scope']['wholeCagePlacingAccepted']=True
        with self.assertRaises(ValueError):p.assess(c,self.base)
        c=copy.deepcopy(self.c);c['geometry']['ordinaryBandDepthMm']=360
        with self.assertRaises(ValueError):p.assess(c,self.base)
if __name__=='__main__':unittest.main(verbosity=2)
