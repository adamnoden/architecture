"""Synthetic method controls are deliberately not structural sweep evidence."""
import copy
import hashlib
import itertools
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest

from continuous_rc_cage import proposed_cap_cages, rectangular_capacity, reference_cage_case
from native_rc_cage_envelope import CAGE, COLUMNS, FALSE_FLAGS, GRID, METHOD, PRODUCER, WATER, reconstruct_cuts, review_native_sweep, screen_case


ROOT = Path(__file__).resolve().parents[3]


class NativeCageEnvelopeTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.native = json.loads((ROOT / 'project/str/studies/monolithic-rc-native31-actions.json').read_text())
        cls.portal = json.loads((ROOT / WATER).read_text())['model']['insulatedPortal']
        cls.grid = json.loads((ROOT / GRID).read_text())
        cls.geometry = {key: [{k: v for k, v in row.items() if k not in COLUMNS and k != 'globalPhysicalEndWrenchKN_KNm'} for row in cls.native[key]] for key in ('memberCuts', 'capCuts')}

    def setUp(self):
        self.case = reference_cage_case()
        self.caps = proposed_cap_cages(self.case, self.portal, self.grid)

    def one_case(self):
        return {'caseId': self.native['caseId'], 'windIndex': 31, 'programme': [4, 4],
            'memberCutVectors': [[row[key] for key in COLUMNS] for row in self.native['memberCuts']],
            'capCutVectors': [[row[key] for key in COLUMNS] for row in self.native['capCuts']],
            'interiorMemberCuts': copy.deepcopy(self.native['interiorMemberCuts'])}

    def fixture(self, root):
        source = copy.deepcopy(self.native['sourceSHA256'])
        for path in {*source, METHOD, CAGE, PRODUCER}:
            target = root / path; target.parent.mkdir(parents=True, exist_ok=True); shutil.copyfile(ROOT / path, target)
        proof = {'schema': 'str-monolithic-rc-native96-sweep/1', 'sourceSHA256': source,
            'proofProducerSHA256': hashlib.sha256((root / PRODUCER).read_bytes()).hexdigest(),
            'authoredBaseCase': copy.deepcopy(self.native['request']), 'programmeIdCount': 96,
            'uniquePhysicalWindSolveCount': 48, 'additionalGMAXQCaseCount': 2,
            'actionColumns': list(COLUMNS), 'cutGeometry': copy.deepcopy(self.geometry),
            'pairedProgrammeIds': [{'windIndex': i + 48, 'reuseExecutedWindIndex': i} for i in range(48)],
            'GMAXQSelectionScope': 'SYNTHETIC method control; no executed structural evidence',
            **{key: False for key in FALSE_FLAGS}}
        programmes = [list(bits) for bits in itertools.product(range(7), repeat=2) if bits != (0, 0)]
        proof['cases'] = []
        for i in range(48):
            row = self.one_case(); row.update(caseId='MONOLITHIC-G0.9-W' + str(i), windIndex=i, programme=programmes[i]); proof['cases'].append(row)
        proof['GMAXQCases'] = []
        for i in (7, 31):
            row = copy.deepcopy(proof['cases'][i]); row['caseId'] = 'MONOLITHIC-GMAXQ-W' + str(i); proof['GMAXQCases'].append(row)
        return proof

    def write(self, root, proof):
        path = root / 'synthetic-method-control.json'; path.write_text(json.dumps(proof, allow_nan=False)); return path

    def test_exact_signed_reconstruction_rejects_truncation_and_competing_actions(self):
        vector = [-1, 2, -3, 4, -5, 6]
        self.assertEqual([reconstruct_cuts([{'memberId': 'x'}], [vector])[0][key] for key in COLUMNS], vector)
        for geometry, vectors in (([{}], []), ([{}], [[1] * 5]), ([{'bendingYKNm': 1}], [[1] * 6]), ([{}], [[True] * 6]), ([{}], [[float('nan')] * 6])):
            with self.assertRaises(ValueError): reconstruct_cuts(geometry, vectors)

    def test_zero_and_hand_uniaxial_controls_use_same_signed_row(self):
        body = copy.deepcopy(self.geometry['memberCuts'][0]); body['physicalPointMm'][2] = 1000
        cap = copy.deepcopy(self.geometry['capCuts'][0])
        interior = {**body, 'end': None, 'fraction': .5, 'cutSide': 'right', **dict.fromkeys(COLUMNS, 0.)}
        row = {'caseId': 'HAND', 'windIndex': 0, 'programme': [0, 1], 'memberCutVectors': [[0.] * 6], 'capCutVectors': [[0.] * 6], 'interiorMemberCuts': [interior]}
        geometry = {'memberCuts': [body], 'capCuts': [cap]}
        zero = screen_case(self.case, self.portal, self.caps, geometry, row, physical_g_factor=.9, include_external_gmaxq=False)
        self.assertTrue(all(item['value'] == 0 for item in zero['governing'].values()))
        row['memberCutVectors'][0] = [0, 0, 0, 0, -2, 1]
        answer = screen_case(self.case, self.portal, self.caps, geometry, row, physical_g_factor=.9, include_external_gmaxq=False)
        worst = answer['governing']['memberUniaxial']['simultaneousCut']
        cy = rectangular_capacity(290, 212.5, 69, 212.5 - 69, 0, True, 12, .92)
        fz = worst['actualBarCentreFaceZBreadthMm']
        cz = rectangular_capacity(212.5, 290, fz, 290 - fz, 0, False, 12, .92)
        self.assertAlmostEqual(answer['governing']['memberUniaxial']['value'], 2 / cy + 1 / cz, 12)
        self.assertEqual([worst[key] for key in COLUMNS], [0, 0, 0, 0, -2, 1])

    def test_real_one_state_and_authored_link_pitch_perturbation(self):
        row = self.one_case(); first = screen_case(self.case, self.portal, self.caps, self.geometry, row, physical_g_factor=.9, include_external_gmaxq=False)
        changed = copy.deepcopy(self.case); changed['ordinaryLinkPitchMm'] = 125
        second = screen_case(changed, self.portal, self.caps, self.geometry, row, physical_g_factor=.9, include_external_gmaxq=False)
        self.assertEqual(first['memberEndpointCutCount'], 192); self.assertEqual(first['memberInteriorCutCount'], 128)
        self.assertAlmostEqual(second['governing']['memberClosedLinkFlow']['value'], first['governing']['memberClosedLinkFlow']['value'] * 1.25, 12)
        self.assertEqual(second['governing']['memberUniaxial']['value'], first['governing']['memberUniaxial']['value'])
        for key in (*COLUMNS, 'memberId', 'end', 'physicalPointMm', 'uniaxialCapacityYKNm', 'uniaxialCapacityZKNm'):
            self.assertEqual(second['governing']['memberUniaxial']['simultaneousCut'][key], first['governing']['memberUniaxial']['simultaneousCut'][key])
        self.assertEqual(first['simultaneousCutsSHA256'], second['simultaneousCutsSHA256'])

    def test_interior_cut_is_included_and_cannot_belong_to_another_member(self):
        row = self.one_case(); row['interiorMemberCuts'][0]['bendingYKNm'] = 1000
        answer = screen_case(self.case, self.portal, self.caps, self.geometry, row, physical_g_factor=.9, include_external_gmaxq=False)
        self.assertIsNone(answer['governing']['memberUniaxial']['simultaneousCut']['end'])
        self.assertFalse(answer['allNecessaryScreensWithinOne'])
        row['interiorMemberCuts'][0]['memberId'] = 'not-present'
        with self.assertRaisesRegex(ValueError, 'absent'): screen_case(self.case, self.portal, self.caps, self.geometry, row, physical_g_factor=.9, include_external_gmaxq=False)

    def test_all_cases_aggregate_actual_simultaneous_governor_and_bind_authored_change(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory); proof = self.fixture(root)
            proof['cases'][17]['memberCutVectors'][0][4] = 50
            result = review_native_sweep(self.write(root, proof), root)
            governor = result['governing']['memberUniaxial']
            self.assertEqual(governor['caseId'], 'MONOLITHIC-G0.9-W17'); self.assertEqual(governor['physicalGFactor'], .9)
            self.assertFalse(governor['includeExternalGMAXQ']); self.assertEqual(governor['simultaneousCut']['bendingYKNm'], 50)
            self.assertEqual(governor['simultaneousCut']['bendingZKNm'], proof['cases'][17]['memberCutVectors'][0][5])
            self.assertEqual(len(result['caseSummaries']), 50); self.assertEqual(result['selectedGMAXQWindIndices'], [7, 31])
            changed = copy.deepcopy(self.case); changed['ordinaryLinkPitchMm'] = 125
            edited = review_native_sweep(self.write(root, proof), root, changed)
            self.assertNotEqual(edited['authoredCageCaseSHA256'], result['authoredCageCaseSHA256'])
            self.assertEqual(edited['nativeProofSHA256'], result['nativeProofSHA256'])
            self.assertFalse(edited['structureSelected']); self.assertIn('not maximum nonlinear interaction', edited['scope'])
            proof['cases'][17]['memberCutVectors'][0][0] = 1e6
            adverse = review_native_sweep(self.write(root, proof), root)
            self.assertFalse(adverse['allNecessaryScreensWithinOne'])
            self.assertTrue(adverse['nonFiniteCapacityScreenPresent'])
            self.assertIsNone(adverse['governing']['memberUniaxial']['value'])
            self.assertTrue(adverse['governing']['memberUniaxial']['exceedsOne'])
            json.dumps(adverse, allow_nan=False)

    def test_stale_or_missing_source_producer_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory); proof = self.fixture(root)
            (root / WATER).write_text((root / WATER).read_text() + '\n')
            with self.assertRaisesRegex(ValueError, 'Stale native producer/source'): review_native_sweep(self.write(root, proof), root)
            shutil.copyfile(ROOT / WATER, root / WATER)
            proof['proofProducerSHA256'] = '0' * 64
            with self.assertRaisesRegex(ValueError, 'sweep producer'): review_native_sweep(self.write(root, proof), root)

    def test_documented_cli_emits_one_json_document_and_consumes_authored_case(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory); proof = self.fixture(root)
            changed = copy.deepcopy(self.case); changed['ordinaryLinkPitchMm'] = 125
            case_path = root / 'authored-cage.json'; case_path.write_text(json.dumps(changed))
            process = subprocess.run([sys.executable, '-B', str(root / METHOD), str(self.write(root, proof)), '--cage-case', str(case_path)], check=True, capture_output=True, text=True)
            result = json.loads(process.stdout)
            self.assertEqual(process.stderr, '')
            self.assertEqual(result['authoredCageCase']['ordinaryLinkPitchMm'], 125)
            self.assertEqual(len(result['caseSummaries']), 50)
            self.assertFalse(result['structureSelected'])

    def test_missing_cases_relabelled_strength_acceptance_and_unsupported_law_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory); base = self.fixture(root)
            edits = []
            missing = copy.deepcopy(base); missing['cases'].pop(); edits.append(missing)
            relabelled = copy.deepcopy(base); relabelled['GMAXQCases'][0]['caseId'] = 'MONOLITHIC-G0.9-W7'; edits.append(relabelled)
            approved = copy.deepcopy(base); approved['candidateAccepted'] = True; edits.append(approved)
            unordered = copy.deepcopy(base); unordered['actionColumns'][0:2] = reversed(unordered['actionColumns'][0:2]); edits.append(unordered)
            wrong_programme = copy.deepcopy(base); wrong_programme['cases'][0]['programme'] = [6, 6]; edits.append(wrong_programme)
            for proof in edits:
                with self.assertRaises(ValueError): review_native_sweep(self.write(root, proof), root)
            changed = copy.deepcopy(self.case); changed['concreteCompressionMPa'] = 30
            with self.assertRaisesRegex(ValueError, 'capacity-law'): review_native_sweep(self.write(root, base), root, changed)


if __name__ == '__main__':
    unittest.main()
