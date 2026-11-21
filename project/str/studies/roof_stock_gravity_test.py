import math
from pathlib import Path
import unittest

import numpy as np

from roof_floor_compatibility import build_roof_only_operator,load_roof_only_source
from roof_stock_gravity import _maps,_point_load,assemble_roof_stock_gravity,pin_half_bending,recover_roof_stock_local_actions


ROOT=Path(__file__).resolve().parents[3]


def port_wrench(operator,vector):
    total=np.zeros(6)
    for i,(x,y) in enumerate(operator['ringPointsXYMm']):
        fx,fy,mz,down,sx,sy=vector[6*i:6*i+6]
        force=np.array([fx,fy,-down]);moment=np.array([-sy,sx,mz])
        total[:3]+=force;total[3:]+=(moment+np.cross([x,y,6600],force))/1000
    return total


class RoofStockGravityTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.operator=build_roof_only_operator(load_roof_only_source(ROOT))
        cls.gravity=assemble_roof_stock_gravity(cls.operator,{'unitWeightKNPerM3':78.5})

    def test_physical_stock_enum_and_all_four_families_are_once_only(self):
        g=self.gravity
        expected={'primary':40.92577343970018,'secondary':75.3132768,'twin-rails':20.169880149265737,'ring':58.404}
        self.assertEqual(set(g['categories']),set(expected))
        for key,value in expected.items():self.assertAlmostEqual(g['categories'][key]['physicalGKN'],value,9)
        self.assertAlmostEqual(g['physicalGKN'],194.81293038896595,9)
        self.assertAlmostEqual(g['physicalVolumeM3']*78.5,g['physicalGKN'],9)
        self.assertFalse(g['completeRoofGravity']);self.assertFalse(g['retainedMinimumGQualified'])
        self.assertEqual(len({r['id'] for r in g['stockLedger']}),len(g['stockLedger']))

    def test_origin_force_and_first_moments_survive_actual_roof_condensation(self):
        before=np.zeros(6)
        for row in self.gravity['origins']:
            before[:3]+=row['forceKN'];before[3:]+=np.cross(row['pointXYZMm'],row['forceKN'])/1000
        after=port_wrench(self.operator,self.gravity['condensedForceKN'])
        self.assertLess(float(np.max(np.abs(before-after))),1e-7)
        self.assertAlmostEqual(before[2],-self.gravity['physicalGKN'],9)
        self.assertAlmostEqual(before[3],-6*self.gravity['physicalGKN'],8)
        self.assertAlmostEqual(before[4],6*self.gravity['physicalGKN'],8)

    def test_density_change_rescales_loads_and_keeps_geometry_and_source_control(self):
        trial=assemble_roof_stock_gravity(self.operator,{'unitWeightKNPerM3':75.})
        ratio=75/78.5
        self.assertAlmostEqual(trial['physicalGKN'],self.gravity['physicalGKN']*ratio,9)
        self.assertLess(float(np.max(np.abs(trial['fullForceN']-ratio*self.gravity['fullForceN']))),1e-7)
        self.assertEqual(trial['physicalVolumeM3'],self.gravity['physicalVolumeM3'])
        self.assertEqual(trial['sourceSHA256'],self.gravity['sourceSHA256'])
        for setting in ({'unitWeightKNPerM3':0.},{'unitWeightKNPerM3':math.nan},{'unitWeightKNPerM3':78.5,'roofApproved':True}):
            with self.assertRaises(ValueError):assemble_roof_stock_gravity(self.operator,setting)

    def test_pin_half_exact_closed_form_and_free_tail_do_not_add_fixity(self):
        r=pin_half_bending(4000,[[0,4000,-.5]],[])
        self.assertAlmostEqual(r['heelReactionN'],1000,9);self.assertAlmostEqual(r['crownReactionN'],1000,9)
        self.assertAlmostEqual(r['maximumAbsoluteLocalMomentKNm'],1.,9)
        tail=pin_half_bending(4000,[[-1000,4000,-.5]],[])
        self.assertAlmostEqual(tail['heelReactionN'],1562.5,9);self.assertAlmostEqual(tail['crownReactionN'],937.5,9)
        samples={row['axisMm']:row['momentKNm'] for row in tail['samples']}
        self.assertAlmostEqual(samples[-1000],0.,9);self.assertAlmostEqual(samples[0],-.25,9);self.assertAlmostEqual(samples[4000],0.,9)
        self.assertEqual(tail['forceResidualN'],0.);self.assertEqual(tail['momentResidualNmm'],0.)

    def test_free_axial_tail_enters_root_only_and_finite_midspan_load_has_exact_work_map(self):
        p=self.operator['scope'];outer,inner=p['radials'][0];crown=tuple((a+b)/2 for a,b in zip(outer,inner))
        m=_maps(p,inner,crown);f=np.asarray(m['X'])*1000;vector=np.zeros(p['spaceSize'])
        _point_load(vector,m,-.2,f,False)
        # Pure axial load beyond a free heel cannot create a fictitious crown
        # axial load by extrapolating the pin-beam transverse shape functions.
        self.assertLess(max(abs(vector[p['highD'](crown,j)]) for j in range(3)),1e-9)
        m=_maps(p,outer,crown);vector=np.zeros(p['spaceSize']);force=np.asarray(m['Z'])*1000
        local=_point_load(vector,m,.5,force,True);length=m['lengthMm']
        for value,exact in zip(local,(500,1000*length/8,500,-1000*length/8)):self.assertAlmostEqual(value,exact,8)
        uniform=np.zeros(4)
        for xi in (-1/math.sqrt(3),1/math.sqrt(3)):
            uniform+=_point_load(np.zeros(p['spaceSize']),m,(1+xi)/2,np.asarray(m['Z'])*length/2,True)
        for value,exact in zip(uniform,(length/2,length*length/12,length/2,-length*length/12)):
            self.assertAlmostEqual(value,exact,7)

    def test_actual_internal_steel_G_state_recovers_all_half_member_cuts(self):
        op=self.operator;g=self.gravity;u=np.zeros(op['scope']['spaceSize'])
        # Component unit check with physical ring ports held. This is not the
        # actual joined-house response or a release of that support condition.
        u[op['interiorIndices']]=np.linalg.solve(op['interiorStiffnessN'],g['fullForceN'][op['interiorIndices']])
        rows=recover_roof_stock_local_actions(g,op,u,1.)
        self.assertEqual(len(rows),24)
        finite=[row for row in rows if row['physicalHalfKind']=='finite-outer']
        pin=[row for row in rows if row['physicalHalfKind']=='pin-ended-inner']
        self.assertEqual(len(finite),12);self.assertEqual(len(pin),12)
        self.assertLess(max(abs(row['rightEndMomentResidualNmm']) for row in finite),1e-5)
        self.assertGreater(max(row['maximumAbsoluteStrongMomentKNm'] for row in finite),1.)
        self.assertTrue(all(row['localGravityBending']['releasedRotationLawPreserved'] for row in pin))
        self.assertTrue(all(not row['strengthAccepted'] for row in rows))

    def test_axial_cut_uses_same_source_modulus_as_the_actual_roof_method(self):
        op=self.operator;g=self.gravity;u=np.zeros(op['scope']['spaceSize'])
        u[op['interiorIndices']]=np.linalg.solve(op['interiorStiffnessN'],g['fullForceN'][op['interiorIndices']])
        # Prescribed displacements isolate the constitutive recovery from a
        # new equilibrium solve. The source's steel E is not a second constant.
        before=recover_roof_stock_local_actions(g,op,u,0.);e=op['scope']['Es']
        try:
            op['scope']['Es']=e/2
            after=recover_roof_stock_local_actions(g,op,u,0.)
        finally:op['scope']['Es']=e
        maximum=max(abs(v) for row in before for v in row['actualAxialEndForcesN'])
        self.assertGreater(maximum,1.)
        for a,b in zip(before,after):
            for x,y in zip(a['actualAxialEndForcesN'],b['actualAxialEndForcesN']):self.assertAlmostEqual(y,x/2,7)


if __name__=='__main__':unittest.main()
