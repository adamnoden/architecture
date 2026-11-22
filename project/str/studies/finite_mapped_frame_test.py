import unittest
from joined_successor_kernel import FrameModel,rectangle_section,cross
from finite_mapped_frame import mapped_frame_member,node_trace,mapped_load,recover_mapped_member
from rc_member_load_test import LAW


class ActualMappedFrameTest(unittest.TestCase):
    def test_actual_cantilever_matches_direct_member_in_all_six_coordinates(self):
        direct=FrameModel();mapped=FrameModel()
        for frame in (direct,mapped):
            frame.node('a',[0,0,-180]);frame.node('b',[0,0,3010])
            for i in range(6):frame.fixed['a',i]=0
        section=rectangle_section(450,260)
        direct.member('post','a','b',section,LAW,y_axis=[1,0,0])
        member=mapped_frame_member(mapped,'post',[0,0,-180],[0,0,3010],section,LAW,node_trace('a')+node_trace('b'),[1,0,0])
        vector=[0]*6+[1.2,-2.3,-50,110,-230,310]
        direct.load('b',vector[6:]);loads={};mapped_load(loads,member,vector)
        for node,row in loads.items():mapped.load(node,row)
        a=direct.solve();b=mapped.solve()
        for node in ('a','b'):
            for x,y in zip(a['displacements'][node],b['displacements'][node]):self.assertAlmostEqual(x,y,10)
        recovered=recover_mapped_member(member,b['displacements'])
        for x,y in zip(a['memberEndWrenchesKN_KNmm']['post'],recovered['physicalEndWrenchesKN_KNmm']):self.assertAlmostEqual(x,y,6)
        self.assertLess(member['energyReconstructionRelativeError'],1e-10)

    def test_substitution_preserves_all_six_rigid_modes_and_load_work(self):
        frame=FrameModel();frame.node('a',[-30,40,0]);frame.node('b',[70,-80,3000])
        points=[[0,0,0],[0,0,3000]];maps=[]
        from joined_successor_kernel import offset_matrix
        for node,point in zip(('a','b'),points):maps.extend([[(node,row)] for row in offset_matrix([a-b for a,b in zip(point,frame.nodes[node])])])
        member=mapped_frame_member(frame,'post',*points,rectangle_section(450,260),LAW,maps,[1,0,0])
        for i in range(6):
            t=[1 if j==i else 0 for j in range(3)];r=[1 if j+3==i else 0 for j in range(3)]
            u={node:[*[a+b for a,b in zip(t,cross(r,p))],*r] for node,p in frame.nodes.items()}
            recovered=recover_mapped_member(member,u)
            self.assertLess(max(abs(v) for v in recovered['physicalEndWrenchesKN_KNmm']),1e-5)
            for spring in frame.springs:self.assertAlmostEqual(sum(v*u[n][j] for n,row in spring['terms'] for j,v in enumerate(row)),0.,6)


if __name__=='__main__':unittest.main()
