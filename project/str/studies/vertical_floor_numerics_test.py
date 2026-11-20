import copy
import math
import unittest

from joined_successor_kernel import FrameModel, rectangle_section
from vertical_floor_numerics import solve_vertical_frame
from vertical_floor_plate import assemble_vertical_plate, condense_vertical_plate, plate_cells, recover_vertical_plate
from vertical_floor_plate_test import LAW


class VerticalFloorNumericsTest(unittest.TestCase):
    def test_sparse_plate_matches_existing_schur_and_full_energy_recovery(self):
        corners=((0,0),(4000,0),(4000,4000),(0,4000));cells,_=plate_cells([[0,0,4000,4000]],[[1500,1500,2500,2500]],1000)
        def boundary(p,axis):
            if p in corners:return [(3*corners.index(p)+axis,1 if axis==0 else .001)]
        a=assemble_vertical_plate(cells,LAW,boundary,12);rigid=[[1 if i%3==0 else 0 for i in range(12)],
            [value for x,y in corners for value in (.001*y,1,0)],[value for x,y in corners for value in (-.001*x,0,1)]]
        reference=condense_vertical_plate(a,rigid,'stdlib');fast=condense_vertical_plate(a,rigid,'scipy')
        largest=max(abs(v) for row in reference['condensedStiffness'] for v in row)
        self.assertLess(max(abs(x-y) for a,b in zip(reference['condensedStiffness'],fast['condensedStiffness']) for x,y in zip(a,b))/largest,1e-10)
        self.assertLess(max(abs(x-y) for x,y in zip(reference['condensedSelfG'],fast['condensedSelfG'])),1e-8)
        u=[.3*math.sin(i+1) for i in range(12)];x=recover_vertical_plate(reference,u);y=recover_vertical_plate(fast,u)
        self.assertAlmostEqual(x['physicalPlateStrainEnergyKNmm'],y['physicalPlateStrainEnergyKNmm'],8)
        self.assertLess(y['workRelativeResidual'],1e-10)
        self.assertAlmostEqual(reference['loadOnlyCondensationEnergyKNmm'],fast['loadOnlyCondensationEnergyKNmm'],8)

    def test_coupled_sparse_route_matches_unchanged_native_frame_and_unilateral_laws(self):
        law={'elasticModulusMPa':33000,'poissonRatio':.2,'flexuralFactor':.25,'torsionFactor':.25,'shearAreaFactor':.5}
        for load in (-10,10):
            frame=FrameModel();frame.node('a',[0,0,0]);frame.node('b',[1000,0,0]);frame.node('normal',[500,0,0])
            for axis in range(6):frame.fixed['a',axis]=0
            for axis in (0,1,3,4,5):frame.fixed['normal',axis]=0
            frame.member('beam','a','b',rectangle_section(200,300),law)
            k=15;root=math.sqrt(k);terms=[('b',[0,0,root,0,0,0]),('normal',[0,0,-root,0,0,0])]
            frame.springs.append({'id':'VERTICAL-FLOOR/energy/0','terms':terms,'stiffness':1.,'mode':'bilateral','gap':0.})
            frame.spring('finite-normal-bearing','normal','a',[500,0,0],[0,0,1],20,'compression');frame.load('normal',[0,0,load,0,0,0])
            vertical={'ports':[{},{}],'portTerms':[[('b',[0,0,1,0,0,0])],[('normal',[0,0,1,0,0,0])]],'operator':{'condensedStiffness':[[k,-k],[-k,k]]}}
            native=frame.solve();fast=solve_vertical_frame(frame,vertical)
            self.assertEqual([s['active'] for s in native['springs']],[s['active'] for s in fast['springs']])
            self.assertLess(max(abs(a-b) for name in frame.nodes for a,b in zip(native['displacements'][name],fast['displacements'][name])),1e-9)
            self.assertLess(max(abs(a-b) for name in native['memberEndWrenchesKN_KNmm'] for a,b in zip(native['memberEndWrenchesKN_KNmm'][name],fast['memberEndWrenchesKN_KNmm'][name])),1e-8)
            self.assertLess(fast['maximumFreeResidualKNOrKNmm'],1e-8)


if __name__=='__main__':unittest.main()
