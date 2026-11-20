import copy
import json
from pathlib import Path
import subprocess
import sys
import unittest

from dry_side_ground_section import derive_comparison, derive_section, read_section_case, render_section, sha256, union_area


class DrySectionTests(unittest.TestCase):
    def setUp(self):
        self.folder = Path(__file__).resolve().parent
        root = self.folder.parents[2]
        self.document = json.loads((self.folder / 'dry-side-ground-section.json').read_text())
        self.case = read_section_case(self.document)
        self.raw = {p: (root / p).read_bytes() for p in self.case['sources']}

    def result(self, case=None, raw=None):
        return derive_section(case or self.case, raw or self.raw)

    def change_source(self, path, mutate):
        value = json.loads(self.raw[path])
        mutate(value)
        raw = dict(self.raw)
        raw[path] = json.dumps(value).encode()
        case = copy.deepcopy(self.case)
        case['sources'][path] = sha256(raw[path])
        return case, raw

    def test_raised_geometry_union_and_member_comparison(self):
        r = self.result()
        self.assertEqual(r['diagnostics'], ['UNCOORDINATED_SERVICE_ROOF_FOUNDATION_LEVELS',
                                          'LOWER_STAIR_TOE_CONTACT_UNLOCATED',
                                          'UPPER_COMPONENT_WITHOUT_DIRECT_MINERAL_SUPPORT:court-south-native-ground-core-0',
                                          'UPPER_COMPONENT_WITHOUT_DIRECT_MINERAL_SUPPORT:court-west-native-ground-core-0'])
        self.assertTrue(r['quantities']['sourceEvidenceCurrent'])
        self.assertEqual(r['levelsMm']['mineralCourse'], [0, 150])
        self.assertEqual(r['levelsMm']['dryRC'], [150, 350])
        self.assertEqual(r['levelsMm']['ffl'], 530)
        self.assertAlmostEqual(r['quantities']['addedRCCausedBySeparationM3'], 11.35531025)
        self.assertAlmostEqual(r['quantities']['additionalWetRCPlinthM3'], 10.291599225)
        self.assertAlmostEqual(r['quantities']['additionalWetRCPlinthWeightKN'], 257.289980625)
        self.assertEqual(r['approaches']['front']['totalStraightReservationMm'], 17200)
        self.assertEqual(r['approaches']['garden']['totalStraightReservationMm'], 14150)
        self.assertEqual(r['coldBeam']['remainingUnsupportedSeatM2'], 0)
        self.assertTrue(all(q['pass'] for q in r['coldBeam']['comparisons']))
        self.assertAlmostEqual(r['coldBeam']['endReactionEnvelopeULSKN'], 39.727125)
        self.assertFalse(r['coldBeam']['physicalEndBearingCredited'])
        self.assertIsNone(r['supportTopology']['mineralShearResistance'])
        self.assertFalse(r['supportTopology']['retentionQualified'])

    def test_deep_exterior_retained_as_special_site_comparison(self):
        comparison = derive_comparison(self.document, self.raw)
        low = comparison['cases']['low-350-deep-exterior']
        high = comparison['cases']['raised-530-local-solum']
        self.assertEqual(comparison['recommendedCaseId'], 'raised-530-local-solum')
        self.assertEqual(low['levelsMm']['ffl'], 350)
        self.assertEqual(low['quantities']['additionalWetRCPlinthM3'], 0)
        self.assertEqual(low['approaches']['front']['totalStraightReservationMm'], 50200)
        self.assertEqual(low['sourceSupportControl'], high['sourceSupportControl'])
        self.assertEqual(low['quantities']['wetPlinthUnion'], high['quantities']['wetPlinthUnion'])
        self.assertEqual(low['levelsMm']['localSolum'], high['levelsMm']['localSolum'])
        self.assertNotEqual(low['levelsMm']['authoredExteriorGrade'], high['levelsMm']['authoredExteriorGrade'])

    def test_union_quantities_do_not_double_count_corners(self):
        self.assertEqual(union_area([[0, 0, 2, 2], [1, 1, 3, 3]]), 7)
        self.assertEqual(union_area([[0, 0, 3, 3], [1, 1, 2, 2]]), 9)

    def test_stale_and_missing_sources_reject(self):
        path = 'project/had/studies/water-replan.json'
        raw = dict(self.raw)
        raw[path] += b' '
        with self.assertRaisesRegex(ValueError, 'stale source'):
            self.result(raw=raw)
        del raw[path]
        with self.assertRaisesRegex(ValueError, 'missing or stale'):
            self.result(raw=raw)

    def test_level_edit_recomputes_plinth_access_drawing_and_keeps_support_control(self):
        baseline = self.result()
        case = copy.deepcopy(self.case)
        case['settings']['courseBottomMm'] += 25
        r = self.result(case)
        self.assertEqual(r['levelsMm']['ffl'], 555)
        self.assertEqual(r['approaches']['front']['slopingRunMm'], 14100)
        self.assertAlmostEqual(r['quantities']['additionalWetRCPlinthM3'] - baseline['quantities']['additionalWetRCPlinthM3'], baseline['quantities']['fullWidthBearingFootprintM2'] * .025)
        self.assertEqual(r['sourceSupportControl'], baseline['sourceSupportControl'])
        self.assertEqual(r['threshold']['northDrawMm'], baseline['threshold']['northDrawMm'])
        self.assertIn('FFL +555', render_section(r))
        self.assertNotEqual(render_section(r), render_section(baseline))

    def test_beam_width_edit_changes_actual_cage_and_drawing_with_unchanged_source(self):
        baseline = self.result()
        case = copy.deepcopy(self.case)
        case['settings']['newBeam']['widthMm'] = 250
        r = self.result(case)
        self.assertNotEqual(r['coldBeam']['comparisons'][-1]['MR'], baseline['coldBeam']['comparisons'][-1]['MR'])
        self.assertNotEqual(r['coldBeam']['planMm'], baseline['coldBeam']['planMm'])
        self.assertIn('250 × 450', render_section(r))
        self.assertNotEqual(render_section(r), render_section(baseline))
        self.assertEqual(r['sourceSupportControl'], baseline['sourceSupportControl'])
        self.assertEqual(r['levelsMm'], baseline['levelsMm'])

    def test_narrow_beam_removes_support_and_mineral_bearing(self):
        case = copy.deepcopy(self.case)
        case['settings']['newBeam']['widthMm'] = 180
        r = self.result(case)
        self.assertIn('THRESHOLD_DRY_SLAB_CANTILEVER_REMAINS', r['diagnostics'])
        self.assertIn('MINERAL_HEADER_OVERHANGS_NEW_BEAM', r['diagnostics'])
        self.assertLess(r['quantities']['additionalWetRCPlinthM3'], self.result()['quantities']['additionalWetRCPlinthM3'])

    def test_dense_cage_negative_control(self):
        case = copy.deepcopy(self.case)
        case['settings']['newBeam']['barsEachFace'] = 4
        case['settings']['newBeam']['barDiameterMm'] = 16
        r = self.result(case)
        self.assertIn('NEW_BEAM_COMPARISON_FAILS', r['diagnostics'])
        self.assertLess(r['coldBeam']['comparisons'][-1]['mainBarHorizontalClearMm'], 21)

    def test_exterior_edit_never_changes_local_solum_or_occupied_geometry(self):
        baseline = self.result()
        case = copy.deepcopy(self.case)
        case['settings']['exteriorGradeMm'] = -100
        r = self.result(case)
        self.assertIn('EXTERIOR_GRADE_BRIDGES_LOW_MINERAL_COURSE', r['diagnostics'])
        self.assertEqual(r['levelsMm']['ffl'], baseline['levelsMm']['ffl'])
        self.assertEqual(r['levelsMm']['localSolum'], -1800)
        self.assertEqual(r['sourceSupportControl'], baseline['sourceSupportControl'])
        self.assertEqual(r['coldBeam'], baseline['coldBeam'])
        self.assertNotEqual(r['approaches'], baseline['approaches'])
        self.assertIn('exterior', render_section(r))
        self.assertNotEqual(render_section(r), render_section(baseline))

    def test_real_source_seat_edit_changes_quantities_and_invalidates_old_receipt(self):
        path = 'project/had/studies/water-replan.json'
        case, raw = self.change_source(path, lambda x: x['model']['southCourtThresholdReference']['pan']['permanentSeat']['plan'].__setitem__(3, 500))
        r = self.result(case, raw)
        self.assertGreater(r['coldBeam']['remainingUnsupportedSeatM2'], 0)
        self.assertIn('THRESHOLD_DRY_SLAB_CANTILEVER_REMAINS', r['diagnostics'])
        self.assertFalse(r['quantities']['sourceEvidenceCurrent'])
        self.assertGreater(r['quantities']['floorAreaM2'], self.result()['quantities']['floorAreaM2'])
        self.assertEqual(r['sourceSupportControl'], self.result()['sourceSupportControl'])

    def test_result_and_unknown_settings_injection_reject(self):
        case = copy.deepcopy(self.case)
        case['result'] = {}
        with self.assertRaisesRegex(ValueError, 'unsupported section document'):
            self.result(case)
        case = copy.deepcopy(self.case)
        case['settings']['source'] = 'fabricated'
        with self.assertRaisesRegex(ValueError, 'unsupported section settings'):
            self.result(case)

    def test_native_read_and_stdin_replay(self):
        command = [sys.executable, '-B', str(self.folder / 'dry_side_ground_section.py')]
        read = subprocess.run(command + ['--read'], text=True, capture_output=True, check=True)
        authored = json.loads(read.stdout)
        self.assertEqual(authored['schema'], 'dry-side-ground-section/2')
        self.assertNotIn('result', authored)
        replay = subprocess.run(command, input=read.stdout, text=True, capture_output=True, check=True)
        envelope = json.loads(replay.stdout)
        self.assertEqual(envelope['schema'], 'dry-side-ground-section-replay/1')
        self.assertEqual(envelope['result']['levelsMm']['ffl'], 530)
        self.assertEqual(envelope['sectionSvg'], render_section(envelope['result']))

    def test_complete_edge_conservation_preserves_open_portals(self):
        r = self.result()
        q = r['quantities']
        self.assertAlmostEqual(q['additionalDrySlabCoreEdgeAreaM2'], 2.9143575)
        self.assertAlmostEqual(q['additionalDrySlabCoreEdgeVolumeM3'], .5828715)
        self.assertAlmostEqual(q['removedOldFreeFieldGrossM3'], 10.20660625)
        self.assertAlmostEqual(q['newDrySlabGrossM3'] - q['removedOldFreeFieldGrossM3'], q['addedRCCausedBySeparationM3'])
        for row in r['supportTopology']['exteriorCoreFootprints']:
            x0, y0, x1, y1 = row['planMm']
            if row['id'].startswith('outer-north'):
                self.assertFalse(x0 < 6000 < x1)
            if row['id'].startswith('outer-east'):
                self.assertFalse(y0 < 6900 < y1)
        unsupported = [row for row in r['supportTopology']['upperComponentFootprints'] if row['unsupportedAreaM2'] > 1e-8]
        self.assertEqual(len(unsupported), 2)
        self.assertTrue(all(abs(row['unsupportedAreaM2'] - .01050625) < 1e-10 for row in unsupported))
        self.assertEqual(r['levelsMm']['firstFloorAboveAuthoredGeneralGrade'], 4130)
        self.assertEqual(r['levelsMm']['firstFloorAboveLocalSolum'], 5780)
        self.assertIsNone(r['levelsMm']['actualLowestAdjacentGround'])

    def test_nonfinite_and_injected_values_reject(self):
        case = copy.deepcopy(self.case)
        case['settings']['exteriorGradeMm'] = float('nan')
        with self.assertRaisesRegex(ValueError, 'nonfinite'):
            self.result(case)


if __name__ == '__main__':
    unittest.main()
