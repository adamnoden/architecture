"""Analytical/local-coupled fixtures; none is a52-head house execution."""
import copy
import json
from pathlib import Path
import unittest
from seated_wet_support import bearing_quadrature
from wet_support_contact_semantics_test import normal_pad
from wet_bearing_refinement import assess_contact, compare_contacts


CRITERIA = json.loads((Path(__file__).parent / 'wet-bearing-refinement-inputs.json').read_text())['criteria']


def fixture(order, coupled=False, plane=(-.1, 0, 0), rectangle=(-110, -50, 110, 50)):
    """Two translated local pads with explicit synthetic house-interface rows.

    When coupled=True each plane/force is obtained from FrameModel's actual
    compression-only equilibrium, not a reintegration of another order's plane.
    The52 zero rows exercise identity/reaction-comparison mechanics only.
    """
    settings = {'bearingQuadratureOrder': order, 'jointNormalComplianceMmPerMPa': .1}
    sources = {'analytical-local-fixture': '0' * 64}
    r = {'schema': 'str-coupled-floor-section-result/1', 'sourceSHA256': sources,
         'request': {'sourceSHA256': sources, 'wetSupport': settings},
         'seatedWetSupport': {'settings': settings, 'physicalAcceptance': False, 'posts': [], 'contactFibres': []},
         'nativeVertical': {'native': {'caseId': f'ANALYTICAL-ORDER-{order}',
             'heads': [{'id': f'H{i}', 'reactionKN_KNm': [0.] * 6} for i in range(52)]}}}
    solved = None
    if coupled:
        if rectangle != (-110, -50, 110, 50):
            raise ValueError('Local coupled fixture uses its actual220by100pad')
        frame = normal_pad(order)
        frame.load('beam', [0, 0, -10, 0, 800, 0])
        solved = frame.solve()
    for post_index, (cx, cy) in enumerate(((0, 0), (350, 200))):
        rect = [rectangle[0] + cx, rectangle[1] + cy, rectangle[2] + cx, rectangle[3] + cy]
        r['seatedWetSupport']['posts'].append({'id': f'post/{post_index}', 'padCentreXYMm': [cx, cy],
             'padFit': {'nominalRectangleXYMm': rect},
             'rectangleXYMm': [rect[0] - 20, rect[1] - 175, rect[2] + 20, rect[3] + 175]})
        for k, (x, y, area) in enumerate(bearing_quadrature(rectangle, order)):
            gap = solved['springs'][k]['relativeMm'] if coupled else plane[0] + plane[1] * x + plane[2] * y
            force = -solved['springs'][k]['forceKN'] if coupled else max(-gap, 0) / .1 * area / 1000
            r['seatedWetSupport']['contactFibres'].append({'id': f'contact/{post_index}/{k}', 'receiverIndex': post_index,
                'pointXYZMm': [x + cx, y + cy, 10], 'areaMm2': area, 'relativeDisplacementMm': gap,
                'normalCompressionKN': force})
    return r


class WetBearingRefinementTest(unittest.TestCase):
    def test_uniform_pressure_analytical_force_centroid_and_different_rectangle(self):
        for rectangle, force in [((-110, -50, 110, 50), 22), ((-100, -40, 100, 40), 16)]:
            result = assess_contact(fixture(16, rectangle=rectangle), CRITERIA)
            self.assertTrue(result['numericalSamePlaneIntegrationPassing'])
            for row in result['posts']:
                self.assertAlmostEqual(row['normalCompressionKN'], force, 10)
                self.assertLess(max(map(abs, row['centreOfPressureFromPadCentreMm'])), 1e-10)
        for order in (2, 4):
            self.assertTrue(assess_contact(fixture(order), CRITERIA)['numericalSamePlaneIntegrationPassing'])

    def test_actual_local_nonlinear_orders_re_equilibrate_before_comparison(self):
        a, b = fixture(16, coupled=True), fixture(32, coupled=True)
        result = compare_contacts(a, b, CRITERIA)
        # Fixed applied force/centre can hide an inaccurate integrated gap law.
        # The authored limits are retained when this local coupled fixture fails.
        self.assertFalse(result['numericalRefinementPassing'])
        self.assertNotEqual(result['coarse']['posts'][0]['reconstructedActualGapPlaneMm'],
                            result['fine']['posts'][0]['reconstructedActualGapPlaneMm'])
        for row in result['posts']:
            self.assertLess(abs(row['normalForceDifferenceKN']), 1e-10)
            self.assertLess(max(map(abs, row['centreOfPressureDifferenceMm'])), 1e-9)
        self.assertFalse(result['physicalContactAccepted'])
        self.assertFalse(result['postHeadResistanceAccepted'])
        sixty_four = fixture(64, coupled=True)
        self.assertTrue(assess_contact(sixty_four, CRITERIA)['numericalSamePlaneIntegrationPassing'])
        self.assertFalse(compare_contacts(b, sixty_four, CRITERIA)['numericalRefinementPassing'])
        self.assertTrue(compare_contacts(fixture(16), fixture(32), CRITERIA)['numericalRefinementPassing'])

    def test_global_zero_difference_does_not_hide_local_clipped_patch_error(self):
        # Independent triangular patch:70by70mm, linear peak.7MPa.
        result = assess_contact(fixture(8, plane=(.09, -.001, .001)), CRITERIA)
        row = result['posts'][0]
        self.assertAlmostEqual(row['exactSamePlaneCompressionKN'], .7 * 70 * 70 / 6 / 1000, 10)
        self.assertAlmostEqual(row['exactSamePlaneCentreFromPadCentreMm'][0], 92.5, 9)
        self.assertAlmostEqual(row['exactSamePlaneCentreFromPadCentreMm'][1], -32.5, 9)
        self.assertFalse(result['numericalSamePlaneIntegrationPassing'])
        self.assertGreater(abs(row['forceErrorKN']), row['forceErrorLimitKN'])

    def test_zero_gap_or_positive_gap_has_no_centroid_and_is_not_a_physical_open_verdict(self):
        for plane in ((0, 0, 0), (.1, 0, 0)):
            a, b = fixture(16, plane=plane), fixture(32, plane=plane)
            r = compare_contacts(a, b, CRITERIA)
            self.assertTrue(r['numericalRefinementPassing'])
            self.assertIsNone(r['fine']['posts'][0]['centreOfPressureFromPadCentreMm'])
            self.assertNotIn('physicalContactOpen', r)

    def test_missing_or_contradictory_actual_samples_sources_and_controls_reject(self):
        good = fixture(16)
        for change in ('missing', 'negative', 'non-affine', 'wrong-force', 'outside'):
            r = copy.deepcopy(good)
            c = r['seatedWetSupport']['contactFibres']
            if change == 'missing': c.pop()
            elif change == 'negative': c[0]['normalCompressionKN'] = -1
            elif change == 'non-affine': c[5]['relativeDisplacementMm'] += .01
            elif change == 'wrong-force': c[5]['normalCompressionKN'] += .01
            else: c[5]['pointXYZMm'][0] = 10000
            with self.assertRaises(ValueError): assess_contact(r, CRITERIA)
        bad = fixture(32)
        bad['request']['otherPhysicalChange'] = 1
        with self.assertRaisesRegex(ValueError, 'Identical'): compare_contacts(good, bad, CRITERIA)
        bad = fixture(32)
        bad['nativeVertical']['native']['heads'].pop()
        with self.assertRaisesRegex(ValueError, 'All52'): compare_contacts(good, bad, CRITERIA)
        with self.assertRaisesRegex(ValueError, 'doubling'): compare_contacts(good, good, CRITERIA)
        with self.assertRaisesRegex(ValueError, 'criteria'): assess_contact(good, {**CRITERIA, 'forceRelative': False})

    def test_refined_rule_preserves_area_and_first_moments_and_rejects_unsupported_order(self):
        for order in (16, 32, 64):
            rule = bearing_quadrature([10, 20, 230, 120], order)
            self.assertEqual(len(rule), order ** 2)
            self.assertAlmostEqual(sum(a for _, _, a in rule), 22000, 7)
            self.assertAlmostEqual(sum(x * a for x, _, a in rule), 120 * 22000, 6)
            self.assertAlmostEqual(sum(y * a for _, y, a in rule), 70 * 22000, 6)
        for order in (0, 3, 12, 128, True):
            with self.assertRaises(ValueError): bearing_quadrature([10, 20, 230, 120], order)

    def test_balanced_weight_corruption_cannot_masquerade_as_the_declared_rule(self):
        r = fixture(16)
        c = r['seatedWetSupport']['contactFibres']
        # Preserves total area and both first moments of this tensor-product cell.
        for k, sign in ((0, 1), (1, -1), (16, -1), (17, 1)):
            c[k]['areaMm2'] += sign * .01
            c[k]['normalCompressionKN'] = c[k]['areaMm2'] / 1000
        with self.assertRaisesRegex(ValueError, 'Gauss rule'): assess_contact(r, CRITERIA)

    def test_eccentric_pad_retains_actual_post_axis_moment_and_pair_geometry(self):
        a, b = fixture(16), fixture(32)
        for r in (a, b):
            # Same pad/traction field160mm north of the actual receiver axis.
            post = r['seatedWetSupport']['posts'][0]
            post['rectangleXYMm'][1] -= 160
            post['rectangleXYMm'][3] -= 160
        row = assess_contact(a, CRITERIA)['posts'][0]
        self.assertAlmostEqual(row['padRelativeFirstMomentsKNmm'][1], 0, 8)
        self.assertAlmostEqual(row['postRelativeFirstMomentsKNmm'][1], 22 * 160, 8)
        self.assertTrue(compare_contacts(a, b, CRITERIA)['numericalRefinementPassing'])
        b['seatedWetSupport']['posts'][0]['rectangleXYMm'][1] -= 1
        with self.assertRaisesRegex(ValueError, 'origins'): compare_contacts(a, b, CRITERIA)

    def test_native_active_set_deadband_retains_raw_negative_residual_without_tension_credit(self):
        r = fixture(16, plane=(1e-11, 0, 0))
        for sample in r['seatedWetSupport']['contactFibres']:
            sample['normalCompressionKN'] = -1e-11 / .1 * sample['areaMm2'] / 1000
        a = assess_contact(r, CRITERIA)
        row = a['posts'][0]
        self.assertLess(row['minimumRawNormalCompressionKN'], 0)
        self.assertGreater(row['maximumRawTensileResidualKN'], 0)
        self.assertIsNone(row['centreOfPressureFromPadCentreMm'])
        self.assertFalse(a['physicalContactAccepted'])
        self.assertTrue(a['numericalSamePlaneIntegrationPassing'])


if __name__ == '__main__':
    unittest.main()
