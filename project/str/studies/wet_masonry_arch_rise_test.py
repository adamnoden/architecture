import copy
import json
import unittest
from wet_masonry_arch_rise import ROOT,lower_arch_house
from wet_masonry_arch_comparison import geometry,CHOICES


class DeeperArchGeometryTest(unittest.TestCase):
    def test_same_head_ring_offset_receivers_and_actual_added_material(self):
        h=json.loads((ROOT/'project/had/studies/water-replan.json').read_text())['model'];original=copy.deepcopy(h)
        c=json.loads(CHOICES.read_text());grid=json.loads((ROOT/'project/str/studies/current-house-grid.json').read_text());base=geometry(c,h,grid)
        previous=base['wallMinusOpeningGrossVolumeM3']
        for rise in (450,600):
            revised=lower_arch_house(h,rise);g=geometry(c,revised,grid)
            self.assertEqual(revised['internalArchControls']['plant'],h['internalArchControls']['plant'])
            self.assertEqual(g['lowerCoreRectangleXYMm'],base['lowerCoreRectangleXYMm'])
            self.assertEqual(g['sourceGravityEccentricityXMm'],-12)
            self.assertEqual(g['headZMm'],2850);self.assertEqual(g['radialRingMm'],215);self.assertEqual(g['ringToSlabReserveMm'],105)
            self.assertEqual(g['springZMm'],2850-rise);self.assertTrue(g['groundReceiverCoverageGeometric'])
            self.assertGreater(g['wallMinusOpeningGrossVolumeM3'],previous);previous=g['wallMinusOpeningGrossVolumeM3']
        self.assertEqual(h,original)
        with self.assertRaises(ValueError):lower_arch_house(h,300)


if __name__=='__main__':unittest.main()
