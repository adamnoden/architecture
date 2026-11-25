import json
import math
import unittest
from unittest.mock import patch
from pathlib import Path

from wet_masonry_arch_native import NativeArchAdapter, midpoint_integral, ROOT, CHOICES, run
from wet_masonry_arch_comparison import geometry
from joined_successor_kernel import rectangle_section


class ActualArchNativeAdapterTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.c=json.loads(CHOICES.read_text())
        cls.h=json.loads((ROOT/'project/had/studies/water-replan.json').read_text())['model']
        cls.grid=json.loads((ROOT/'project/str/studies/current-house-grid.json').read_text())

    def test_actual_finite_width_bearing_area_and_first_moments(self):
        a=NativeArchAdapter(self.c,16,3000,native_plate=True)
        points=a.floor_points(self.h,self.grid,8);g=geometry(self.c,self.h,self.grid)
        self.assertEqual(len(points),32)
        self.assertLessEqual(len(points)+18,64)
        area=140*3110
        self.assertAlmostEqual(sum(p['areaMm2'] for p in points),area)
        for axis,centre in ((0,g['lowerWallAxisXMm']),(1,g['centreYMm'])):
            self.assertAlmostEqual(sum(p['areaMm2']*(p['xyMm'][axis]-centre) for p in points),0,places=5)
        self.assertAlmostEqual(sum(p['areaMm2']*(p['xyMm'][0]-g['lowerWallAxisXMm'])**2 for p in points),area*140**2/12,places=4)
        self.assertAlmostEqual(sum(p['areaMm2']*(p['xyMm'][1]-g['centreYMm'])**2 for p in points),area*3110**2/12,places=2)
        with self.assertRaises(ValueError):a.floor_points(self.h,self.grid,12)

    def test_local_section_axes_match_real140_normal_and215_radial(self):
        # The established helper takes localZ depth first/localY breadth second.
        s=rectangle_section(215,140)
        self.assertEqual(s['A'],215*140)
        self.assertEqual(s['Iy'],140*215**3/12)
        self.assertEqual(s['Iz'],215*140**3/12)
        r=1000;span=500
        self.assertAlmostEqual(midpoint_integral(r,-span,span),r*r*math.asin(span/r)+span*math.sqrt(r*r-span*span))

    def test_scoped_native_hooks_restore_on_failure(self):
        import floor_section_model as native
        import upper_roof_bearing as roof
        original=roof.build_vertical_rc_floor;solve=native.solve_vertical_frame
        source=native.load_source(ROOT)
        request={'schema':'str-wet-masonry-arch-native-request/2','caseId':'TEST-ERROR-RESTORE',
            'archChoices':self.c,'archSegments':16,'masonryElasticModulusMPa':3000,
            'bearingCellsY':8,'floorNormalComplianceMmPerMPa':.1,
            'nativeCase':native.reference_case(source)}
        with patch.object(native,'run',side_effect=RuntimeError('deliberate-before-solve')):
            with self.assertRaisesRegex(RuntimeError,'deliberate-before-solve'):run(request)
        self.assertIs(roof.build_vertical_rc_floor,original)
        self.assertIs(native.solve_vertical_frame,solve)
        with self.assertRaises(ValueError):NativeArchAdapter(self.c,16,0,native_plate=True)


if __name__=='__main__':unittest.main()
