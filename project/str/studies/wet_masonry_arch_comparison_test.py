import copy
import json
import math
import unittest
from pathlib import Path

from wet_masonry_arch_comparison import assess, arch_equilibrium, choices, geometry, ROOT, CHOICES, EVIDENCE


class WetMasonryArchComparisonTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.c = json.loads(CHOICES.read_text())
        cls.h = json.loads((ROOT/'project/had/studies/water-replan.json').read_text())['model']
        cls.grid = json.loads((ROOT/'project/str/studies/current-house-grid.json').read_text())
        cls.native = json.loads(EVIDENCE.read_text())

    def test_actual_stair_sofa_and_finite_grid_geometry(self):
        g = geometry(self.c, self.h, self.grid)
        self.assertEqual(g['upperLowerCoreOverlapMm'], 128)
        self.assertEqual(g['stairPlaneIntrusionMm'], 0)
        self.assertEqual(g['body600PassageReserveMm'], [92.5, 107.5])
        self.assertTrue(g['groundReceiverCoverageGeometric'])
        self.assertIsNotNone(g['solidWallSofaOverlapXYMm'])
        self.assertTrue(g['sofaWithinClearOpening'])
        self.assertEqual(g['ringToSlabReserveMm'], 105)
        edited = {**self.c, 'lowerCoreEastOffsetMm': 0}
        self.assertEqual(geometry(edited, self.h, self.grid)['stairPlaneIntrusionMm'], 12)

    def test_crown_hinge_analytic_point_and_reversal(self):
        g = geometry(self.c, self.h, self.grid)
        p = g['archPhysicalGeometry']; rm = (p['sourceInnerRadiusMm']+p['sourceOuterRadiusMm'])/2000
        a = rm*math.sin(p['seatAngleRad']); rise = rm*(1-math.cos(p['seatAngleRad']))
        r = arch_equilibrium(g, [(0, 10)], 200)
        self.assertAlmostEqual(r['southVerticalKN'], 5)
        self.assertAlmostEqual(r['northVerticalKN'], 5)
        self.assertAlmostEqual(r['horizontalThrustKN'], 5*a/rise)
        left = arch_equilibrium(g, [(-a/3, 10)], 200)
        right = arch_equilibrium(g, [(a/3, 10)], 200)
        self.assertAlmostEqual(left['southVerticalKN'], right['northVerticalKN'])
        self.assertAlmostEqual(left['horizontalThrustKN'], right['horizontalThrustKN'])
        with self.assertRaisesRegex(ValueError, 'between physical'):
            arch_equilibrium(g, [(a+1, 10)], 200)

    def test_actual_upper_inventory_and_tied_untied_change(self):
        r = assess(self.c, self.h, self.grid, self.native)
        self.assertEqual(len(r['actualUpperGravityCards']), 7)
        self.assertAlmostEqual(r['exactUpperGravityFactoredKN'], 27.260415)
        for pier in r['tiedUntiedAbutmentDemands']:
            self.assertGreater(abs(pier['untiedBaseInPlaneMomentKNm']), abs(pier['tiedBaseInPlaneMomentKNm']))
            self.assertFalse(pier['tieAnchorageAccepted'])
            self.assertLess(pier['tiedNominalBiaxialGrossNoTensionRatio'], 1)
            self.assertTrue(pier['plusMinus10TieHeightNominalProbePassing'])
        self.assertAlmostEqual(sum(p['nominalActualUpperOriginNormalMomentKNm'] for p in r['tiedUntiedAbutmentDemands']), r['exactUpperGravityNormalMomentAboutLowerAxisKNm'])
        path = r['positiveTiePathComparison']
        self.assertGreater(path['northStackWeatherReserveMm'], 0)
        self.assertTrue(all(v>0 for v in path['southNorthReceiverEndReservesMm']))
        self.assertEqual(path['exposedTieUndersideRequirementMm'], 2535)
        self.assertAlmostEqual(sum(row['physicalGKN'] for row in r['sourceRingCourseSelfWeightWitnesses'])*1.35, r['gravityCases']['ring-only']['totalDownKN'], places=5)
        self.assertFalse(r['globalNativeReplacementExecuted'])
        self.assertFalse(r['candidateAccepted'])
        low = assess({**self.c, 'tieCentreZMm': 2500}, self.h, self.grid, self.native)
        high = assess({**self.c, 'tieCentreZMm': 2600}, self.h, self.grid, self.native)
        self.assertGreater(low['tiedUntiedAbutmentDemands'][1]['tiedNominalBiaxialGrossNoTensionRatio'], 1)
        self.assertGreater(high['tiedUntiedAbutmentDemands'][0]['tiedNominalBiaxialGrossNoTensionRatio'], 1)
        self.assertEqual(low['actualUpperGravityCards'], r['actualUpperGravityCards'])
        self.assertEqual(high['nativeEvidence'], r['nativeEvidence'])
        with self.assertRaisesRegex(ValueError, 'receiving territory'):
            assess({**self.c, 'tieBearingFacesYMm': [8700, 11720]}, self.h, self.grid, self.native)

    def test_source_changes_and_unchanged_control(self):
        control = assess(self.c, self.h, self.grid, self.native)
        changed = assess({**self.c, 'finishedClearSpanMm': 2000}, self.h, self.grid, self.native)
        self.assertNotEqual(control['gravityCases']['ring-spandrel-actual-upper']['horizontalThrustKN'], changed['gravityCases']['ring-spandrel-actual-upper']['horizontalThrustKN'])
        self.assertEqual(control['nativeEvidence'], changed['nativeEvidence'])
        self.assertEqual(control['retainedActualBeamEndActions'], changed['retainedActualBeamEndActions'])
        self.assertEqual(control, assess(self.c, self.h, self.grid, self.native))
        bad = copy.deepcopy(self.h); bad['upperWalls'] = [w for w in bad['upperWalls'] if w['id'] != 'rear-wet-east']
        with self.assertRaises(StopIteration):
            assess(self.c, bad, self.grid, self.native)
        with self.assertRaises(ValueError):
            choices({**self.c, 'selected': True})


if __name__ == '__main__':
    unittest.main()
