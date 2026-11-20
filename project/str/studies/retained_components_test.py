import copy
from contextlib import redirect_stdout
from io import StringIO
import math
from pathlib import Path
import runpy
import unittest

from retained_component_geometry import circle_rectangle_moments, net_rectangle_moments
import retained_components as rc


ROOT = Path(__file__).resolve().parents[3]


def declared_request(source, base=None):
    request = copy.deepcopy(base or rc.reference_retained_request(source))
    catalogue = rc.evaluate_retained_components(request, source)
    request['retentionPaths'] = [{
        'id': 'comparison-retained-diaphragm-and-aligned-walls',
        'state': 'declared-comparison',
        'routeDescription': 'Unqualified comparison: intact first-floor diaphragm and source full-height inner cores retained above the upper cut; continuity, bearing and tie capacities remain unproved.',
        'sourceRefs': copy.deepcopy(source['identities']),
        'componentDigests': {row['id']: row['componentDigest'] for row in catalogue['components']},
    }]
    return request


def components(result):
    return {row['id']: row for row in result['components']}


class GeometryTests(unittest.TestCase):
    def test_circle_clips_have_analytic_area_and_first_moments(self):
        radius = 3.
        full = circle_rectangle_moments([7., 11.], radius, [0., 0., 20., 20.])
        expected = math.pi*radius**2
        for actual, target in zip(full, [expected, expected*7, expected*11]):
            self.assertAlmostEqual(actual, target, places=10)
        quarter = circle_rectangle_moments([0., 0.], radius, [0., 0., radius, radius])
        for actual, target in zip(quarter, [math.pi*radius**2/4, radius**3/3, radius**3/3]):
            self.assertAlmostEqual(actual, target, places=10)
        translated = circle_rectangle_moments([570., 11177.5], 80., [570., 11177.5, 650., 11257.5])
        area = math.pi*80**2/4
        for actual, target in zip(translated, [area, area*570+80**3/3, area*11177.5+80**3/3]):
            self.assertAlmostEqual(actual, target, delta=1e-5)
        nested = net_rectangle_moments([0., 0., 10., 10.], [[2., 2., 8., 8.]], [
            {'kind': 'circle', 'centreXYMm': [5., 5.], 'diameterMm': 2.},
        ])
        self.assertEqual(nested, [64., 320., 320.])
        with self.assertRaisesRegex(ValueError, 'Overlapping circular'):
            net_rectangle_moments([0, 0, 10, 10], [], [
                {'kind': 'circle', 'centreXYMm': [4, 5], 'diameterMm': 4},
                {'kind': 'circle', 'centreXYMm': [6, 5], 'diameterMm': 4},
            ])


class RetainedCatalogueTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.source = rc.load_retained_source(ROOT)
        cls.request = rc.reference_retained_request(cls.source)
        cls.result = rc.evaluate_retained_components(cls.request, cls.source)

    def test_actual_net_catalogue_and_lower_policy_are_source_bound(self):
        source_before, request_before = copy.deepcopy(self.source), copy.deepcopy(self.request)
        result = rc.evaluate_retained_components(self.request, self.source)
        floor = [row for row in result['components'] if row['kind'] == 'first-floor']
        reserved_area = (11.335**2-11.175**2)+4*4.165*.160-4*.080**2-.010*4.335
        expected_area = 100.6602-.4*.4-.465*.545-.015*4.335-2*math.pi*.08**2-math.pi*.055**2-reserved_area
        self.assertAlmostEqual(math.fsum(row['geometry']['netAreaM2'] for row in floor), expected_area, places=10)
        self.assertAlmostEqual(math.fsum(row['lowerWeightKN'] for row in floor), expected_area*.9*.190*23, places=9)
        self.assertAlmostEqual(math.fsum(row['lowerWeightKN'] for row in result['components'] if row['kind'] == 'upper-wall'), 98.0555544, places=9)
        self.assertEqual(result['lowerBoundPolicies']['floor'], {'comparisonFactor': .9, 'minimumThicknessMm': 190., 'minimumUnitWeightKNPerM3': 23, 'materialReservationEachSideMm': 80.})
        self.assertEqual(result['lowerBoundPolicies']['wall']['minimumCoreWidthMm'], 120.)
        self.assertTrue(all(row['creditedWeightKN'] == 0 for row in result['components']))
        self.assertFalse(result['installedAcceptance'])
        self.assertIsNone(result['completeSpliceDemand'])
        self.assertEqual(self.source, source_before)
        self.assertEqual(self.request, request_before)
        self.assertEqual(result, self.result)
        self.assertTrue(all(len(row['geometry']['outerPolygonXYMm']) == 4 for row in floor))
        self.assertEqual(len(result['floorMaterialReservations']), 8)
        self.assertTrue(any(row['geometry']['materialReservations'] for row in floor))

    def test_actual_service_opening_changes_geometry_centroid_and_invalidates_only_affected_evidence(self):
        request = declared_request(self.source)
        before = components(rc.evaluate_retained_components(request, self.source))
        request['edits']['floorApertures'] = [{
            'id': 'FLOOR-APERTURE/rear-soil',
            'shape': {'kind': 'circle', 'centreXYMm': [687.5, 11177.5], 'diameterMm': 200},
        }]
        after_result = rc.evaluate_retained_components(request, self.source)
        after = components(after_result)
        target = 'FF/FIELD/NW-W'
        self.assertIn(target, before)
        self.assertAlmostEqual(before[target]['geometry']['netAreaM2']-after[target]['geometry']['netAreaM2'], math.pi*(.1**2-.08**2), places=10)
        self.assertNotEqual(before[target]['geometry']['centroidXYMm'], after[target]['geometry']['centroidXYMm'])
        self.assertNotEqual(before[target]['componentDigest'], after[target]['componentDigest'])
        self.assertEqual(after[target]['creditedWeightKN'], 0)
        self.assertIn('RETENTION_PATH_EVIDENCE_STALE', after[target]['retention']['reasons'])
        self.assertEqual(before['FF/FIELD/SE-front'], after['FF/FIELD/SE-front'])
        self.assertEqual(before['WALL/FULL-HEIGHT/outer-south'], after['WALL/FULL-HEIGHT/outer-south'])
        aperture = next(row for row in after[target]['geometry']['apertures'] if row['id'] == 'FLOOR-APERTURE/rear-soil')
        self.assertEqual(aperture['shape']['diameterMm'], 200)
        request['retentionPaths'][0]['componentDigests'][target] = after[target]['componentDigest']
        renewed = components(rc.evaluate_retained_components(request, self.source))
        self.assertEqual(renewed[target]['creditedWeightKN'], after[target]['lowerWeightKN'])

    def test_actual_wall_opening_removes_clear_band_material_without_gross_fill(self):
        request = declared_request(self.source)
        before = components(rc.evaluate_retained_components(request, self.source))
        request['edits']['wallOpenings'] = [{'id': 'south-window-0', 'centreMm': 1875, 'widthMm': 1100}]
        after = components(rc.evaluate_retained_components(request, self.source))
        target = 'WALL/FULL-HEIGHT/outer-south'
        self.assertNotEqual(before[target]['geometry']['clearIntervalsMm'], after[target]['geometry']['clearIntervalsMm'])
        self.assertNotEqual(before[target]['lowerWeightKN'], after[target]['lowerWeightKN'])
        self.assertNotEqual(before[target]['geometry']['centroidXYMm'], after[target]['geometry']['centroidXYMm'])
        self.assertEqual(after[target]['creditedWeightKN'], 0)
        self.assertEqual(before['WALL/FULL-HEIGHT/outer-north'], after['WALL/FULL-HEIGHT/outer-north'])
        self.assertEqual(before['FF/FIELD/SW-L'], after['FF/FIELD/SW-L'])

    def test_declared_path_cannot_override_unknown_wet_floor_or_ground_bypass(self):
        result = rc.evaluate_retained_components(declared_request(self.source), self.source)
        by_id = components(result)
        self.assertIn('PRINCIPAL_WET_FLOOR_APERTURE_INVENTORY_INCOMPLETE', by_id['FF/FIELD/east-strip']['retention']['reasons'])
        self.assertEqual(by_id['FF/FIELD/east-strip']['creditedWeightKN'], 0)
        ground = by_id['GROUND-SLAB/current-connected-RC200']
        self.assertEqual(ground['creditedWeightKN'], 0)
        self.assertIsNone(ground['lowerWeightKN'])
        self.assertIn('GROUND_SLAB_BYPASSES_WALL_DPC', ground['retention']['reasons'])
        self.assertAlmostEqual(result['replacement']['creditedByFamily'][rc.FLOOR_FAMILY][0], 299.682948711748, places=9)
        self.assertAlmostEqual(result['replacement']['creditedByFamily'][rc.WALL_FAMILY][0], 98.0555544, places=9)
        request = declared_request(self.source)
        request['retentionPaths'][0]['state'] = 'unresolved'
        disabled = rc.evaluate_retained_components(request, self.source)
        self.assertEqual(disabled['replacement']['creditedByFamily'], {rc.FLOOR_FAMILY: [0., 0., 0.], rc.WALL_FAMILY: [0., 0., 0.]})
        self.assertEqual(disabled['replacement']['replacedFamilies'], [rc.FLOOR_FAMILY, rc.WALL_FAMILY])

    def test_stale_source_and_unsupported_edits_reject_and_stale_paths_withhold(self):
        request = copy.deepcopy(self.request)
        request['sourceSHA256'][rc.SOURCE_PATHS[0]] = '0'*64
        with self.assertRaisesRegex(ValueError, 'Stale'):
            rc.evaluate_retained_components(request, self.source)
        request = declared_request(self.source)
        request['retentionPaths'][0]['sourceRefs'][rc.SOURCE_PATHS[0]] = '0'*64
        stale = rc.evaluate_retained_components(request, self.source)
        self.assertTrue(all(row['creditedWeightKN'] == 0 for row in stale['components']))
        self.assertIn('RETENTION_PATH_EVIDENCE_STALE', components(stale)['FF/FIELD/SW-L']['retention']['reasons'])
        next_source = copy.deepcopy(self.source)
        next_source['identities'][rc.SOURCE_PATHS[0]] = '1'*64
        fresh_request = declared_request(self.source)
        fresh_request['sourceSHA256'] = next_source['identities']
        fresh_result = rc.evaluate_retained_components(fresh_request, next_source)
        self.assertTrue(all(row['creditedWeightKN'] == 0 for row in fresh_result['components']))
        request = copy.deepcopy(self.request)
        request['edits']['floorApertures'] = [{'id': 'FLOOR-VOID/stair', 'shape': {'kind': 'rectangle', 'boundsXYMm': [400, 4400, 2800, 8800]}}]
        with self.assertRaisesRegex(ValueError, 'regenerated'):
            rc.evaluate_retained_components(request, self.source)
        request = copy.deepcopy(self.request)
        request['edits']['wallOpenings'] = [{'id': 'south-window-0', 'centreMm': 10, 'widthMm': 1000}]
        with self.assertRaisesRegex(ValueError, 'inside'):
            rc.evaluate_retained_components(request, self.source)

    def test_unrecognized_source_hole_grammar_cannot_silently_restore_material(self):
        changed = copy.deepcopy(self.source)
        path = 'project/str/studies/current-house-membrane.py'
        original = changed['texts'][path]
        changed['texts'][path] = original.replace('+[[1812.5,9252.5,2212.5,9652.5]]', '+[[1812.5,9252.5,2212.5,9652.5]]+[[1000,1000,1100,1100]]')
        with self.assertRaisesRegex(ValueError, 'silently dropped'):
            rc.evaluate_retained_components(rc.reference_retained_request(changed), changed)
        changed['texts'][path] = original+'\nholes.append([1000,1000,1100,1100])\n'
        with self.assertRaisesRegex(ValueError, 'mutation'):
            rc.evaluate_retained_components(rc.reference_retained_request(changed), changed)

    def test_unknown_wall_loss_has_exact_adverse_band_extremes_and_known_ports_are_removed(self):
        bands = [[0., 2.], [4., 8.], [10., 14.]]
        low = rc.retained_interval_extreme(bands, .75)
        high = rc.retained_interval_extreme(bands, .75, True)
        self.assertEqual(low, [[0., 2.], [4., 8.], [10., 11.5]])
        self.assertEqual(high, [[4.5, 8.], [10., 14.]])
        self.assertAlmostEqual(rc._moment_of_bands(low), 42.125)
        self.assertAlmostEqual(rc._moment_of_bands(high), 69.875)
        result = rc.evaluate_retained_components(declared_request(self.source), self.source)
        walls = [row for row in result['components'] if row['kind']=='upper-wall']
        east = components(result)['WALL/FULL-HEIGHT/outer-east']
        west = components(result)['WALL/FULL-HEIGHT/outer-west']
        self.assertAlmostEqual(east['geometry']['netLengthM'], 5.095)
        self.assertAlmostEqual(west['geometry']['netLengthM'], 5.130)
        self.assertIn([5610.,5890.], east['geometry']['omittedOpeningIntervalsMm'])
        self.assertIn([5930.,5970.], east['geometry']['omittedOpeningIntervalsMm'])
        self.assertIn([9160.,9440.], west['geometry']['omittedOpeningIntervalsMm'])
        self.assertIn([9480.,9520.], west['geometry']['omittedOpeningIntervalsMm'])
        for row in walls:
            lower = row['lowerVectorEnvelopeN_Xfirst_Yfirst']['minimum']
            upper = row['lowerVectorEnvelopeN_Xfirst_Yfirst']['maximum']
            self.assertEqual(lower[0], upper[0])
            self.assertTrue(all(a<=b<=c for a,b,c in zip(lower,row['lowerVectorN_Xfirst_Yfirst'],upper)))
            full_length = row['geometry']['netLengthM']*1000
            for extreme in row['geometry']['extremeRetainedIntervalsMm'].values():
                self.assertAlmostEqual(math.fsum(b-a for a,b in extreme), .75*full_length, places=7)
        request = copy.deepcopy(self.request)
        request['edits']['floorApertures'] = [{'id': 'FLOOR-APERTURE/rear-soil', 'shape': {'kind': 'circle', 'centreXYMm': [0, 0], 'diameterMm': 160}}]
        with self.assertRaisesRegex(ValueError, 'inside'):
            rc.evaluate_retained_components(request, self.source)

    def test_real_96_case_consumer_replaces_both_actual_native_families(self):
        with redirect_stdout(StringIO()):
            model = runpy.run_path(str(ROOT/'project/str/studies/current-house-joined-foundation.py'))
        native = runpy.run_path(str(ROOT/'project/str/studies/current-house-structural-case.py'))
        trial = native['upper_cut_compression']({
            'schema': 'str-upper-cut-compression/1', 'cutZMm': -40, 'roofRiseMm': 0,
            'additionalRetainedNKN': 0, 'additionalRetainedCentroidXYMm': [6000, 6000],
        }, model)
        origins = native['origin_load_account']({'schema': 'str-origin-load-account/1'}, model)['origins']
        baseline_before = copy.deepcopy(trial)
        zero_delta = rc.retained_replacement_delta(self.result, origins)
        self.assertAlmostEqual(zero_delta['removedByFamily'][rc.FLOOR_FAMILY][0], 118.9531425375, places=9)
        self.assertAlmostEqual(zero_delta['removedByFamily'][rc.WALL_FAMILY][0], 100.46268, places=9)
        self.assertEqual(zero_delta['creditedTotal'], [0., 0., 0.])
        self.assertAlmostEqual(zero_delta['deltaN_Xfirst_Yfirst'][0], -219.4158225375, places=9)
        declared = rc.evaluate_retained_components(declared_request(self.source), self.source)
        supported_delta = rc.retained_replacement_delta(declared, origins)
        hull = [[x/1000, y/1000] for x, y in trial['innerContactConvexHullXYMm']]
        def passing(delta):
            return sum(native['_upper_contact']([a+b for a, b in zip(row['baselineN_Xfirst_Yfirst'], delta)], [6., 6.], hull)['passesNecessaryVerticalCondition'] for row in trial['cases'])
        self.assertEqual(trial['baselinePassingCount'], 4)
        self.assertEqual(passing(zero_delta['deltaN_Xfirst_Yfirst']), 0)
        self.assertEqual(passing(supported_delta['deltaN_Xfirst_Yfirst']), 96)
        self.assertEqual(len(supported_delta['adverseDeltaVerticesN_Xfirst_Yfirst']), 4)
        self.assertEqual([passing(delta) for delta in supported_delta['adverseDeltaVerticesN_Xfirst_Yfirst']], [96]*4)
        self.assertEqual(trial, baseline_before)
        self.assertLess(trial['nativeUpperCutReplayResidual']['momentKNm'], 1e-6)
        with self.assertRaisesRegex(ValueError, 'missing or duplicated'):
            rc.retained_replacement_delta(self.result, origins+origins)
        altered = copy.deepcopy(self.result)
        altered['replacement']['creditedByFamily'][rc.FLOOR_FAMILY][0] = 1
        with self.assertRaisesRegex(ValueError, 'actual retained component sum'):
            rc.retained_replacement_delta(altered, origins)


if __name__ == '__main__':
    unittest.main()
