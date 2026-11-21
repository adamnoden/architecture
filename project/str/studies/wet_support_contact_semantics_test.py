"""Small mechanics witnesses; no stored house reaction is a solver input."""
import unittest

from joined_successor_kernel import FrameModel
from seated_wet_support import bearing_quadrature, exact_bearing_field
from wet_support_cage_comparison import gross_compression_kern_screen


def normal_pad(order=8):
    frame=FrameModel();frame.node('beam',[0,0,10]);frame.node('post',[0,0,0])
    for axis in range(6):frame.fixed['post',axis]=0.
    # Zero-work gauges in directions a normal-only pad cannot restrain.
    for axis in (0,1,5):frame.fixed['beam',axis]=0.
    for i,(x,y,area) in enumerate(bearing_quadrature([-110,-50,110,50],order)):
        frame.spring(str(i),'beam','post',[x,y,10],[0,0,1],area/.1/1000,'compression')
    return frame


class WetSupportContactSemanticsTest(unittest.TestCase):
    def test_partial_normal_contact_carries_an_eccentric_vertical_force_without_tension_or_shear(self):
        frame=normal_pad();frame.load('beam',[0,0,-10,0,800,0]);result=frame.solve()
        forces=[-s['forceKN'] for s in result['springs']]
        self.assertGreaterEqual(min(forces),0.)
        self.assertAlmostEqual(sum(forces),10.,10)
        self.assertGreater(sum(s['active'] for s in result['springs']),0)
        self.assertLess(sum(s['active'] for s in result['springs']),64)
        reaction=result['supportWrenches']['post']
        for value,expected in zip(reaction,[0,0,10,0,-800,0]):self.assertAlmostEqual(value,expected,9)
        # This necessary uncracked-section condition fails, although the actual
        # finite-pad tractions above are nonnegative and equilibrated. Neither
        # proposition establishes concrete-head resistance.
        kern=gross_compression_kern_screen(10,0,800,260,450)
        self.assertFalse(kern['grossFullCompressionNecessaryCondition'])

    def test_open_normal_only_pad_does_not_create_a_tensile_uplift_route(self):
        frame=normal_pad(4);frame.load('beam',[0,0,10,0,0,0])
        with self.assertRaisesRegex(ValueError,'singular/unrestrained'):frame.solve()

    def test_clipped_affine_contact_integral_is_not_a_full_face_gauss_rule(self):
        rectangle=[-110,-50,110,50];plane=[.09,-.001,.001]
        exact=exact_bearing_field(rectangle,plane,.1)
        # Independent triangle: legs70mm, peak0.7MPa, linear pressure.
        self.assertAlmostEqual(exact['compressedAreaMm2'],70*70/2,10)
        self.assertAlmostEqual(exact['normalCompressionKN'],.7*(70*70/2)/3/1000,12)
        force=exact['normalCompressionKN']
        self.assertAlmostEqual(exact['compressionFirstMomentXKNmm']/force,92.5,10)
        self.assertAlmostEqual(exact['compressionFirstMomentYKNmm']/force,-32.5,10)
        errors=[]
        for order in (4,8):
            q=sum(max(0,-(plane[0]+plane[1]*x+plane[2]*y)/.1)*area/1000 for x,y,area in bearing_quadrature(rectangle,order))
            errors.append(abs(q/force-1))
        self.assertGreater(errors[1],.01)
        self.assertLess(errors[1],errors[0])


if __name__=='__main__':unittest.main()
