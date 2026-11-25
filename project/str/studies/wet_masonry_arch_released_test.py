import unittest
from joined_successor_kernel import FrameModel,rectangle_section,cross
from finite_mapped_frame import recover_mapped_member
from wet_masonry_arch_released import released_member


class ReleasedRingMemberTest(unittest.TestCase):
    def test_actual_release_cannot_transmit_end_moment_and_preserves_shear(self):
        # Cantilever with an end rotation release; independent shear/bending
        # equilibrium supplies a control without solving the actual house.
        f=FrameModel();a=f.node('A',[0,0,0]);b=f.node('B',[0,1000,0])
        for i in range(6):f.fixed[(a,i)]=0.
        # Common B rotationX is an unused gauge for this isolated member.
        f.fixed[(b,3)]=0.
        law={'elasticModulusMPa':3000,'poissonRatio':.2,'flexuralFactor':1,'torsionFactor':1,'shearAreaFactor':5/6}
        m=released_member(f,'R',a,b,rectangle_section(215,140),law,[1],[1,0,0]);f.load(b,[0,0,-1,0,0,0])
        raw=f.solve();w=recover_mapped_member(m,raw['displacements'])['physicalEndWrenchesKN_KNmm']
        self.assertAlmostEqual(w[9],0,places=8)
        self.assertAlmostEqual(w[3],1000,places=6)
        self.assertAlmostEqual(w[2],1,places=8);self.assertAlmostEqual(w[8],-1,places=8)
        self.assertNotEqual(raw['displacements']['R/free-rx/1'][3],0)
        # The gauge coordinates have no support wrench or hidden restraint.
        self.assertTrue(all(abs(x)<1e-12 for x in raw['supportWrenches']['R/free-rx/1']))

    def test_six_rigid_motions_survive_independent_rotation_maps(self):
        f=FrameModel();a=f.node('A',[100,200,300]);b=f.node('B',[100,1000,600])
        law={'elasticModulusMPa':3000,'poissonRatio':.2,'flexuralFactor':1,'torsionFactor':1,'shearAreaFactor':5/6}
        m=released_member(f,'R',a,b,rectangle_section(215,140),law,[0,1],[1,0,0])
        for mode in range(6):
            omega=[float(mode==i+3) for i in range(3)];translation=[float(mode==i) for i in range(3)];u={}
            for node,xyz in f.nodes.items():
                u[node]=[0,0,0,omega[0],0,0] if '/free-rx/' in node else [*[x+y for x,y in zip(translation,cross(omega,xyz))],*omega]
            w=recover_mapped_member(m,u)['physicalEndWrenchesKN_KNmm']
            self.assertLess(max(map(abs,w)),1e-6)


if __name__=='__main__':unittest.main()
