"""Adverse changes to actual retained full-house evidence, not toy mechanics."""
import copy
import json
import os
from pathlib import Path
import unittest

from rear_direct_bearing_replay import replay,material_and_load_difference


@unittest.skipUnless(os.environ.get('STR_REAR_BEARING_CAPTURE'),'Explicit retained rear-bearing capture/checkpoint/control required')
class ActualRearResponseControls(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.root=Path(__file__).resolve().parents[3]
        cls.capture=json.loads(Path(os.environ['STR_REAR_BEARING_CAPTURE']).read_text())
        cls.checkpoint=json.loads(Path(os.environ['STR_REAR_BEARING_CHECKPOINT']).read_text())
        cls.control=json.loads(Path(os.environ['STR_REAR_BEARING_CONTROL']).read_text())

    def test_actual_complete_house_and_independent_material_load_replay(self):
        result=replay(self.capture,self.checkpoint,self.root)
        self.assertEqual(result['actualHeadCount'],52);self.assertEqual(result['actualBearingContactCount'],64)
        self.assertEqual(result['actualDirectJointOriginCount'],38)
        difference=material_and_load_difference(self.capture,self.control,self.root)
        self.assertAlmostEqual(difference['actualHousePhysicalGChangeKN'],-6.2705525,places=7)
        self.assertLess(max(map(abs,difference['independentAppliedWrenchResidualKN_KNm'])),1e-7)

    def test_changed_actual_head_rejects_even_when_both_copies_match(self):
        capture=copy.deepcopy(self.capture);checkpoint=copy.deepcopy(self.checkpoint)
        for value in (capture,checkpoint):value['finiteHouseResult']['native']['nativeVertical']['native']['heads'][0]['reactionKN_KNm'][2]+=100
        with self.assertRaisesRegex(ValueError,'house six-wrench'):replay(capture,checkpoint,self.root)

    def test_changed_bearing_spring_force_cannot_hide_in_saved_body_residual(self):
        checkpoint=copy.deepcopy(self.checkpoint)
        spring=next(s for s in checkpoint['rawResponse']['springs'] if s['id'].startswith('REAR-BEARING/') and s['id'].endswith('/top'))
        spring['forceKN']-=1.
        with self.assertRaisesRegex(ValueError,'bearing-body balance|Solved support point card'):replay(self.capture,checkpoint,self.root)

    def test_omitted_original_source_g_cannot_hide_in_global_saved_equilibrium(self):
        checkpoint=copy.deepcopy(self.checkpoint);points=checkpoint['postprocessingModel']['wetGridOrigins']['points']
        points.remove(next(r for r in points if r['adapter']=='lower-core/base-G'))
        with self.assertRaisesRegex(ValueError,'source-piece capture'):replay(self.capture,checkpoint,self.root)

    def test_changed_joint_nodal_card_rejects_with_unchanged_original_sources(self):
        checkpoint=copy.deepcopy(self.checkpoint)
        checkpoint['postprocessingModel']['rearDirectJointOrigins']['origins'][0]['actualNodalWrenchKN_KNmm'][2]=0.
        with self.assertRaisesRegex(ValueError,'omission/double count'):replay(self.capture,checkpoint,self.root)

    def test_changed_interior_grid_cut_rejects(self):
        capture=copy.deepcopy(self.capture);capture['actualReplacement']['receivingGridCuts']['interiorMemberCuts'][0]['shearYKN']+=1.
        with self.assertRaisesRegex(ValueError,'numerical evidence'):replay(capture,self.checkpoint,self.root)

    def test_double_applied_q_or_material_area_cannot_hide_in_mass(self):
        capture=copy.deepcopy(self.capture)
        capture['finiteHouseResult']['native']['nativeVertical']['native']['externalWrenchKN_KNm'][2]-=1.35
        with self.assertRaisesRegex(ValueError,'loses or double-applies'):material_and_load_difference(capture,self.control,self.root)
        capture=copy.deepcopy(self.capture);capture['finiteHouseResult']['native']['mass']['newPlateAreaM2']+=.45
        with self.assertRaisesRegex(ValueError,'material union'):material_and_load_difference(capture,self.control,self.root)


if __name__=='__main__':unittest.main()
