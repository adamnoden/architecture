import copy
import math
from pathlib import Path
import unittest

import numpy as np

from roof_floor_compatibility import load_roof_only_source,build_roof_only_operator
from roof_surface_pressure import (roof_surface_rows,reference_roof_surface_pressure_settings,
    assemble_roof_surface_pressure,recover_combined_roof_primary_actions)
from roof_stock_gravity import assemble_roof_stock_gravity

ROOT=Path(__file__).resolve().parents[3]


class RoofSurfacePressureTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.op=build_roof_only_operator(load_roof_only_source(ROOT))

    def setting(self,q):
        s=reference_roof_surface_pressure_settings(self.op);s['uniformKPa']=q;return s

    def test_actual_source_row_areas_and_uniform_signed_origins(self):
        up=assemble_roof_surface_pressure(self.op,self.setting(-2.25))
        down=assemble_roof_surface_pressure(self.op,self.setting(1.5))
        self.assertEqual(len(up['origins']),108)
        self.assertAlmostEqual(up['planAreaM2'],144.15,10)
        self.assertAlmostEqual(up['verticalDownKN'],-324.3375,9)
        self.assertAlmostEqual(down['verticalDownKN'],216.225,9)
        self.assertLess(float(np.max(np.abs(up['fullForceN']+1.5*down['fullForceN']))),1e-7)
        self.assertFalse(up['siteSnowQualified']);self.assertFalse(up['siteWindQualified'])
        self.assertFalse(up['facadePressureCorrelationQualified'])

    def test_zero_and_half_territory_controls_keep_signed_first_moments(self):
        zero=assemble_roof_surface_pressure(self.op,self.setting(0.))
        self.assertEqual(float(np.max(np.abs(zero['fullForceN']))),0.)
        s=self.setting(-2.25)
        for row in roof_surface_rows(self.op):s['rowMultipliers'][row['id']]=float(row['pointXYZMm'][0]<6000)
        half=assemble_roof_surface_pressure(self.op,s)
        self.assertAlmostEqual(half['verticalDownKN'],-162.16875,8)
        self.assertGreater(abs(half['pressureWrenchKN_KNm'][4]+6*half['pressureWrenchKN_KNm'][2]),100.)
        self.assertLess(max(map(abs,half['originAndCondensedWrenchResidualKN_KNm'])),1e-7)
        self.assertLess(max(map(abs,half['sixRigidWorkResidualKN_KNmm'])),1e-5)

    def test_sparse_patch_is_its_actual_origin_not_nearest_support(self):
        s=self.setting(6.3);s['rowMultipliers']={k:0. for k in s['rowMultipliers']};s['rowMultipliers']['ROOF-ROW/0/0']=1.
        patch=assemble_roof_surface_pressure(self.op,s);origin=next(r for r in patch['origins'] if r['multiplier'])
        self.assertAlmostEqual(patch['verticalDownKN'],origin['planAreaM2']*6.3,10)
        self.assertTrue(any(r['position']<0 for r in roof_surface_rows(self.op)))
        self.assertLess(max(map(abs,patch['sixRigidWorkResidualKN_KNmm'])),1e-5)

    def test_pressure_changes_load_only_and_does_not_modify_G_or_stiffness(self):
        before=self.op['fullMatrixN'].copy();g=assemble_roof_stock_gravity(self.op,{'unitWeightKNPerM3':78.5})
        surface=assemble_roof_surface_pressure(self.op,self.setting(-2.25))
        after=assemble_roof_stock_gravity(self.op,{'unitWeightKNPerM3':78.5})
        self.assertTrue(np.array_equal(before,self.op['fullMatrixN']))
        self.assertTrue(np.array_equal(g['fullForceN'],after['fullForceN']))
        self.assertEqual(g['physicalGKN'],after['physicalGKN'])
        self.assertNotIn('physicalGKN',surface)

    def test_combined_signed_load_recovery_subtracts_all_applied_loads(self):
        op=self.op;g=assemble_roof_stock_gravity(op,{'unitWeightKNPerM3':78.5})
        s=assemble_roof_surface_pressure(op,self.setting(-2.25));full=np.zeros(op['scope']['spaceSize'])
        loads=s['fullForceN']+.9*g['fullForceN']
        full[op['interiorIndices']]=np.linalg.solve(op['interiorStiffnessN'],loads[op['interiorIndices']])
        rows=recover_combined_roof_primary_actions(s,op,full,g,.9)
        self.assertEqual(len(rows),24)
        finite=[r for r in rows if r['physicalHalfKind']=='finite-outer'];pin=[r for r in rows if r['physicalHalfKind']=='pin-ended-inner']
        self.assertLess(max(abs(r['rightEndMomentResidualNmm']) for r in finite),1e-5)
        self.assertTrue(all(r['localReleasedBending']['releasedRotationLawPreserved'] for r in pin))
        self.assertGreater(max(r['localReleasedBending']['maximumAbsoluteLocalMomentKNm'] for r in pin),1.)
        self.assertTrue(all(not r['strengthAccepted'] for r in rows))

    def test_missing_guessed_nonfinite_and_out_of_domain_controls_reject(self):
        for bad in (-2.251,6.301,math.nan,True):
            s=self.setting(bad)
            with self.assertRaises(ValueError):assemble_roof_surface_pressure(self.op,s)
        s=self.setting(1.5);s['rowMultipliers'].pop('ROOF-ROW/0/0')
        with self.assertRaises(ValueError):assemble_roof_surface_pressure(self.op,s)
        s=self.setting(1.5);s['rowMultipliers']['ROOF-ROW/0/0']=-.1
        with self.assertRaises(ValueError):assemble_roof_surface_pressure(self.op,s)
        s=self.setting(1.5);s['siteApproved']=True
        with self.assertRaises(ValueError):assemble_roof_surface_pressure(self.op,s)


if __name__=='__main__':unittest.main()
