import copy
import json
from pathlib import Path
import unittest
from seated_wet_support import reference_support,_pad_fit,replacement_cores,bearing_quadrature


class SeatedWetSupportGeometryTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.h=json.loads((Path(__file__).resolve().parents[2]/'had/studies/water-replan.json').read_text())['model'];cls.s=reference_support(cls.h)

    def test_actual_receivers_and_window_register_replace_stale_reservations(self):
        s=self.s;self.assertEqual(s['beamAxisXMm'],2902.5)
        centres=[(r[1]+r[3])/2 for r in s['receiverRectanglesXYMm']];self.assertEqual(centres,[8852.5,11512.5])
        self.assertNotEqual(centres,self.h['structuralChanges']['newWetWallBeam']['supportAxesY'])
        window=next(o for o in self.h['archOpeningRegister']['GROUND'] if o['id']=='north-window-1')
        actual=window['centre']-window['width']/2-window['radialRingTrial']
        self.assertEqual(actual,3135);self.assertNotEqual(actual,self.h['structuralChanges']['newWetWallBeam']['northWindowStart'])
        finished=max(r[2] for r in s['receiverRectanglesXYMm'])+27
        self.assertEqual(actual-finished,75.5)
        rear=next(w for w in self.h['groundWalls'] if w['id']=='rear-west')
        self.assertEqual(rear['holes'][0][0]-finished,40.5)

    def test_one_combined_relative_tolerance_fits_and_two_independent_bounds_do_not(self):
        s=self.s;x=s['beamAxisXMm'];r=[x-125,s['beamSouthEndYMm'],x+125,s['beamNorthEndYMm']];p=s['receiverRectanglesXYMm'][0];centre=[(p[0]+p[2])/2,(p[1]+p[3])/2]
        _,fit=_pad_fit(s,r,p,centre)
        self.assertEqual(min(fit['remainingMarginsMm']['beam']),5)
        self.assertEqual(min(fit['remainingMarginsMm']['post']),10)
        bad={**s,'combinedRelativePlacementToleranceMm':20}
        with self.assertRaisesRegex(ValueError,'leaves beam'):_pad_fit(bad,r,p,centre)
        long={**s,'padLengthMm':300}
        with self.assertRaisesRegex(ValueError,'leaves beam'):_pad_fit(long,r,p,centre)

    def test_finite_bearing_quadrature_preserves_actual_area_and_first_moments(self):
        r=[-110,-50,110,50]
        for order in (2,4,8):
            rows=bearing_quadrature(r,order)
            self.assertEqual(len(rows),order**2);self.assertAlmostEqual(sum(a for x,y,a in rows),22000,8)
            self.assertAlmostEqual(sum(x*a for x,y,a in rows),0,8);self.assertAlmostEqual(sum(y*a for x,y,a in rows),0,8)
            self.assertAlmostEqual(sum(x*x*a for x,y,a in rows),22000*220**2/12,6)
        for bad in (True,1,3,9):
            with self.assertRaises(ValueError):bearing_quadrature(r,bad)

    def test_actual_posts_replace_old_scalar_RC_and_exact_masonry_territory_once(self):
        rows=[{'id':'ordinary','sourceWallId':'rear-west','materialKind':'source-core-material-unqualified','rectangleXYMm':[2700,8782.5,3100,8922.5]},
            {'id':'wet','sourceWallId':'wet-south','materialKind':'source-RC-column','rectangleXYMm':self.s['receiverRectanglesXYMm'][0]},
            {'id':'stair','sourceWallId':'stair-mid-post','materialKind':'source-RC-column','rectangleXYMm':[0,0,1,1]}]
        model={'seatedWetSupport':{}};out=replacement_cores(rows,self.s,model)
        self.assertEqual(sum(r['sourceWallId']=='wet-south' for r in out),0)
        self.assertEqual(sum(r['sourceWallId']=='stair-mid-post' for r in out),1)
        area=sum((r['rectangleXYMm'][2]-r['rectangleXYMm'][0])*(r['rectangleXYMm'][3]-r['rectangleXYMm'][1]) for r in out if r['sourceWallId']=='rear-west')
        self.assertAlmostEqual(area,(400-260)*140)
        removed=model['seatedWetSupport']['removedSourceMasonryTerritory'];self.assertEqual(len(removed),1)
        self.assertEqual(removed[0]['boxXYZMm'],[2772.5,8782.5,-180.,3032.5,8922.5,3170.])


if __name__=='__main__':unittest.main()
