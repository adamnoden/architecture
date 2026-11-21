import math
import unittest

from joined_successor_kernel import FrameModel
from lower_core_bodies import serial_body_law, add_lower_core_bodies, ground_receiver_footprints, partition_free_body_receivers
from vertical_floor_numerics import solve_vertical_frame


def specimen(weight=10,area=10000,height=3000,modulus=1000,compliance=.01,body_clamped=False,top_force=0,scale=True):
    law=serial_body_law(area,height,modulus,compliance,weight);frame=FrameModel()
    for name,z in [('base',0),('LOWER-CORE/body-top/0',height),('floor',height)]:
        frame.node(name,[0,0,z])
        for axis in (0,1,3,4,5):frame.fixed[name,axis]=0.
    frame.fixed['base',2]=0.
    if body_clamped:frame.fixed['LOWER-CORE/body-top/0',2]=0.
    frame.spring('body','LOWER-CORE/body-top/0','base',[0,0,0],[0,0,1],law['bodyAxialStiffnessKNPerMm'])
    frame.spring('top','floor','LOWER-CORE/body-top/0',[0,0,height],[0,0,1],law['topContactStiffnessKNPerMm'],'compression')
    if top_force:frame.load('floor',[0,0,-top_force,0,0,0])
    elif not body_clamped:frame.fixed['floor',2]=0.
    frame.load('LOWER-CORE/body-top/0',[0,0,-weight/2,0,0,0]);frame.load('base',[0,0,-weight/2,0,0,0])
    if scale and not body_clamped:frame.internalScalarCoordinateScales={'LOWER-CORE/body-top/0':1/math.sqrt(law['bodyAxialStiffnessKNPerMm']+law['topContactStiffnessKNPerMm'])}
    vertical={'ports':[{}],'portTerms':[[('base',[0,0,1,0,0,0])]],'operator':{'condensedStiffness':[[0.]]}}
    return frame,vertical,law


class LowerCoreBodyTest(unittest.TestCase):
    def test_free_top_shortens_and_all_own_weight_reaches_base(self):
        frame,vertical,law=specimen();r=solve_vertical_frame(frame,vertical)
        self.assertAlmostEqual(r['displacements']['LOWER-CORE/body-top/0'][2],-law['freeTopSelfShorteningMm'],places=11)
        self.assertAlmostEqual(r['supportWrenches']['base'][2],10,places=11)
        self.assertFalse(next(row for row in r['springs'] if row['id']=='top')['active'])
        self.assertAlmostEqual(r['supportWrenches']['floor'][2],0,places=11)

    def test_truly_clamped_top_shares_consistent_uniform_gravity(self):
        frame,vertical,_=specimen(body_clamped=True);r=solve_vertical_frame(frame,vertical)
        self.assertAlmostEqual(r['supportWrenches']['base'][2],5,places=11)
        self.assertAlmostEqual(r['supportWrenches']['LOWER-CORE/body-top/0'][2],5,places=11)

    def test_compressed_top_transfers_only_actual_floor_load(self):
        frame,vertical,law=specimen(top_force=6);r=solve_vertical_frame(frame,vertical)
        expected_wall_top=-(6+5)/law['bodyAxialStiffnessKNPerMm']
        self.assertAlmostEqual(r['displacements']['LOWER-CORE/body-top/0'][2],expected_wall_top,places=11)
        self.assertAlmostEqual(r['displacements']['floor'][2],expected_wall_top-6/law['topContactStiffnessKNPerMm'],places=11)
        self.assertAlmostEqual(r['supportWrenches']['base'][2],16,places=11)

    def test_zero_density_reproduces_combined_series_compliance(self):
        frame,vertical,law=specimen(weight=0,top_force=6);r=solve_vertical_frame(frame,vertical)
        self.assertAlmostEqual(r['displacements']['floor'][2],-6/law['seriesCombinedStiffnessKNPerMm'],places=11)

    def test_reversible_scaling_preserves_ordinary_solved_work_and_forces(self):
        scaled,vertical,_=specimen(top_force=6);unscaled,_,_=specimen(top_force=6,scale=False)
        a=solve_vertical_frame(scaled,vertical);b=solve_vertical_frame(unscaled,vertical)
        for name,row in a['displacements'].items():
            for x,y in zip(row,b['displacements'][name]):self.assertAlmostEqual(x,y,places=11)
        for node,wrench in a['supportWrenches'].items():
            for x,y in zip(wrench,b['supportWrenches'][node]):self.assertAlmostEqual(x,y,places=11)

    def test_actual_machine_small_fibre_has_finite_physical_shortening(self):
        area=2.0634671492235035e-13;weight=area*3000/1e9*20
        frame,vertical,law=specimen(weight=weight,area=area);r=solve_vertical_frame(frame,vertical)
        self.assertAlmostEqual(r['displacements']['LOWER-CORE/body-top/0'][2],-law['freeTopSelfShorteningMm'],places=12)
        self.assertAlmostEqual(r['supportWrenches']['base'][2],weight,places=25)
        self.assertGreater(law['bodyAxialStiffnessKNPerMm'],0)

    def test_scaling_does_not_rescue_a_real_unrestrained_degree(self):
        frame,vertical,_=specimen();frame.springs=[row for row in frame.springs if row['id']!='body']
        with self.assertRaises((ValueError,RuntimeError)):solve_vertical_frame(frame,vertical)

    def test_invalid_authored_scaling_is_rejected(self):
        for name,value in [('base',1),('LOWER-CORE/body-top/0',0),('LOWER-CORE/body-top/0',float('inf'))]:
            frame,vertical,_=specimen();frame.internalScalarCoordinateScales={name:value}
            with self.assertRaises(ValueError):solve_vertical_frame(frame,vertical)

    def test_thin_unsupported_strip_is_partitioned_exactly_before_gauss_points(self):
        # Both original two-point Gauss abscissae miss the49..50 unsupported
        # strip. Exact receiver edges expose its entire 1% area regardless.
        fragments=[{'boxXYZMm':[0,0,0,100,100,3000]}]
        receivers=[{'id':'left','kind':'beam','boundsXYMm':[0,0,49,100]}, {'id':'right','kind':'beam','boundsXYMm':[50,0,100,100]}]
        cells=partition_free_body_receivers(fragments,receivers)
        missing=[row for row in cells if not row['supported']]
        self.assertEqual([row['boxXYZMm'] for row in missing],[[49,0,0,50,100,3000]])
        self.assertEqual(sum((r['boxXYZMm'][3]-r['boxXYZMm'][0])*(r['boxXYZMm'][4]-r['boxXYZMm'][1]) for r in missing),100)
        gauss=[50+value*50/math.sqrt(3) for value in (-1,1)]
        self.assertTrue(all(x<49 or x>50 for x in gauss))

    def test_beam_width_cap_and_closure_edges_cover_exact_cells(self):
        model={'grid':{'heads':[{'id':'P','xy':[70,50],'capXY':[20,100]}]},'courtCornerClosure':{'addedSolid':{'id':'corner','boxXYZMm':[40,0,0,60,100,10]}}}
        members={'beam':{'physicalStartMm':[0,50,0],'physicalEndMm':[40,50,0],'widthMm':100}}
        receivers=ground_receiver_footprints(model,members);cells=partition_free_body_receivers([{'boxXYZMm':[0,0,0,100,100,10]}],receivers)
        self.assertEqual({tuple(row['boundsXYMm']) for row in receivers},{(0,0,40,100),(60,0,80,100),(40,0,60,100)})
        unsupported=[r['boxXYZMm'] for r in cells if not r['supported']]
        self.assertEqual(unsupported,[[80,0,0,100,100,10]])
        self.assertEqual([r['receiverIds']['cap'] for r in cells if r['receiverIds']['cap']],[['P']])
        self.assertEqual([r['receiverIds']['closure'] for r in cells if r['receiverIds']['closure']],[['corner']])

    def test_ambiguous_cap_overlap_is_not_invented_support(self):
        receivers=[{'id':name,'kind':'cap','boundsXYMm':[0,0,10,10]} for name in ('a','b')]
        cells=partition_free_body_receivers([{'boxXYZMm':[0,0,0,10,10,1]}],receivers)
        self.assertFalse(cells[0]['supported'])
        with self.assertRaises(ValueError):partition_free_body_receivers([],[{'id':'bad','kind':'beam','boundsXYMm':[0,0,0,1]}])

    def test_null_noop_and_bad_density_or_duplicate_reject(self):
        m={'kept':True};self.assertIsNone(add_lower_core_bodies(m,None,None));self.assertEqual(m,{'kept':True})
        for setting in ({'masonryUnitWeightKNPerM3':-1},{'masonryUnitWeightKNPerM3':float('nan')},{'masonryUnitWeightKNPerM3':31},{'masonryUnitWeightKNPerM3':20,'approved':True}):
            with self.assertRaises(ValueError):add_lower_core_bodies({},None,setting)
        with self.assertRaises(ValueError):add_lower_core_bodies({'lowerCoreBodies':{}},None,{'masonryUnitWeightKNPerM3':20})

if __name__=='__main__':unittest.main()
