import ast
import copy
import math
from pathlib import Path
import unittest

import numpy as np

from roof_floor_compatibility import build_roof_only_operator, load_roof_only_source, roof_operator_summary, roof_pressure_load


ROOT=Path(__file__).resolve().parents[3]


def port_wrench(operator,loads):
    total=np.zeros(6)
    for i,(x,y) in enumerate(operator['ringPointsXYMm']):
        fx,fy,mz,down,slope_x,slope_y=loads[6*i:6*i+6]
        force=np.array([fx,fy,-down]);moment=np.array([-slope_y,slope_x,mz])
        total[:3]+=force;total[3:]+=(moment+np.cross([x,y,6600],force))/1000
    return total


def origin_wrench(origins):
    total=np.zeros(6)
    for row in origins:
        total[:3]+=row['forceKN'];total[3:]+=np.cross(row['pointXYZMm'],row['forceKN'])/1000
    return total


class RoofOnlyCompatibilityTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.source=load_roof_only_source(ROOT)
        cls.operator=build_roof_only_operator(cls.source)

    def test_actual_roof_has_six_rigid_modes_after_all_old_supports_removed(self):
        r=roof_operator_summary(self.operator)
        self.assertEqual(r['activeCoordinateCount'],456)
        self.assertEqual(r['retainedRingCoordinateCount'],348)
        self.assertEqual(r['internalCoordinateCount'],108)
        self.assertEqual(r['ringPointCount'],58)
        self.assertEqual(len(r['actualUpperSupportPointsXYMm']),22)
        self.assertEqual(r['removedInheritedBoundaryTerms'],{'lowerL':1,'verticalGround':1,'unusedGauge':1,'oldFloor':1})
        self.assertLess(r['rigidModeRelativeResidual'],1e-10)
        self.assertFalse(r['roofAdoption'])

    def test_correlated_roof_family_conserves_actual_origin_wrench_through_condensation(self):
        for index in (0,3,7,31,35,48,79,95):
            r=roof_pressure_load(self.operator,index)
            before=origin_wrench(r['origins']);after=port_wrench(self.operator,r['condensedForceKN'])
            self.assertLess(float(np.max(np.abs(before-after))),1e-7)
            self.assertEqual(r['courtProjection'],index>=48)
            self.assertNotIn('P1',' '.join(row['kind'] for row in r['origins']))

    def test_pressure_adapter_matches_actual_unmodified_native_load_construction(self):
        # Execute the original source load loop as an oracle, without its
        # solved displacements or old supports. Only its P1 work map is empty.
        tree=ast.parse((ROOT/'project/str/studies/current-house-roof-bracing.py').read_text())
        state=next(n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name=='state')
        loop=copy.deepcopy(next(n for n in state.body if isinstance(n,ast.For)))
        original=[]
        for node in loop.body:
            if isinstance(node,ast.Assign) and any(isinstance(t,ast.Name) and t.id=='u' for t in node.targets):break
            original.append(node)
        loop.body=original+ast.parse('cases.append((axbits,f))').body
        function=ast.FunctionDef(name='native_pressure_oracle',args=ast.arguments(posonlyargs=[],
            args=[ast.arg(arg='inside')],kwonlyargs=[],kw_defaults=[],defaults=[]),
            body=ast.parse('cases=[]').body+[loop]+ast.parse('return cases').body,decorator_list=[])
        scope={**self.operator['scope'],'roofspace':True,'wdof':lambda point,high: [[],[]]}
        exec(compile(ast.fix_missing_locations(ast.Module(body=[function],type_ignores=[])),
                     'unchanged-native-roof-load-oracle','exec'),scope)
        for court in (False,True):
            for index,(bits,force) in enumerate(scope['native_pressure_oracle'](court)):
                current=roof_pressure_load(self.operator,index+(48 if court else 0))
                self.assertEqual(current['programme'],list(bits))
                self.assertLess(float(np.max(np.abs(current['fullForceN']-force))),1e-8)

    def test_roof_schur_operator_is_work_dual_and_recovery_matches_full_energy(self):
        op=self.operator;load=roof_pressure_load(op,31)
        # An explicit small non-rigid port displacement tests the *operator*,
        # not a support-constrained or previously solved roof response.
        u=np.array([.0001*math.sin(i*.31) if i%6 in (0,1,3) else 1e-7*math.cos(i*.17)
                    for i in range(len(op['retainedIndices']))])
        internal=np.linalg.solve(op['interiorStiffnessN'],load['fullForceN'][op['interiorIndices']]-op['interiorCouplingN']@u)
        full=np.zeros(len(op['fullMatrixN']));full[op['retainedIndices']]=u;full[op['interiorIndices']]=internal
        physical_energy=float(full@op['fullMatrixN']@full/2000)
        expected=float(u@op['condensedStiffnessKN']@u/2)+load['loadOnlyEnergyKNmm']
        self.assertAlmostEqual(physical_energy,expected,9)
        residual=op['fullMatrixN']@full-load['fullForceN']
        self.assertLess(float(np.max(np.abs(residual[op['interiorIndices']]))),1e-6)
        port_reaction=op['condensedStiffnessKN']@u-load['condensedForceKN']
        work=float(u@port_reaction+full@load['fullForceN']/1000)
        self.assertAlmostEqual(2*physical_energy,work,8)

    def test_stiffness_edit_changes_operator_but_preserves_external_source_origins(self):
        changed=build_roof_only_operator(self.source,.65,.6)
        self.assertGreater(float(np.max(np.abs(changed['condensedStiffnessKN']-self.operator['condensedStiffnessKN']))),1)
        original=roof_pressure_load(self.operator,31);trial=roof_pressure_load(changed,31)
        self.assertEqual(original['origins'],trial['origins'])
        self.assertLess(float(np.max(np.abs(port_wrench(changed,trial['condensedForceKN'])-origin_wrench(trial['origins'])))),1e-7)
        for value in (0.,math.nan,1.01):
            with self.assertRaises(ValueError):build_roof_only_operator(self.source,value,1.)

    def test_stale_source_and_missing_programme_fail_closed(self):
        source=copy.deepcopy(self.source);source['identities'][next(iter(source['identities']))]='0'*64
        with self.assertRaises(ValueError):build_roof_only_operator(source)
        for index in (-1,96,True,2.5):
            with self.assertRaises(ValueError):roof_pressure_load(self.operator,index)


class RetainedPhysicalRoofPointTest(unittest.TestCase):
    def test_all_eighteen_actual_receiver_traces_are_frozen_before_schur(self):
        from roof_floor_compatibility import roof_floor_receiver_points
        from vertical_rc_floor import load_vertical_rc_floor_source,build_vertical_rc_floor
        from vertical_rc_floor_proof import numerical_case
        source=load_vertical_rc_floor_source(ROOT);case=numerical_case(source)
        points=roof_floor_receiver_points(ROOT)
        model=build_vertical_rc_floor(case,source,retained_point_receivers=points)
        data=model['verticalFloor'];traces=data['retainedPointReceivers']
        self.assertEqual(len(points),18);self.assertEqual(set(traces),{r['id'] for r in points})
        self.assertEqual(len(data['ports']),len(data['portTerms']))
        self.assertEqual(len(data['ports']),len(data['operator']['condensedStiffness']))
        self.assertEqual(len(data['ports']),len(data['operator']['condensedSelfG']))
        self.assertAlmostEqual(data['mass']['newPlatePhysicalSelfGKN'],493.79690625,8)
        self.assertLess(data['portFrameRigidWorkResidual'],1e-9)
        self.assertLess(max(data['operator']['rigidModeResidualKN']),1e-3)
        for trace in traces.values():
            self.assertFalse(trace['rotationRestraintAdded'])
            self.assertTrue(all(node in model['model'].nodes for node,_ in trace['terms']))
        north=traces['ROOF/FLOOR/5925,8082.5']
        self.assertEqual(north['route'],'actual-north-upstand-work-trace')
        self.assertTrue(any(abs(value)>1 for _,row in north['terms'] for value in row[3:]))
        # An actual receiving foot removed into the courtyard must diagnose;
        # no nearest cell, padded matrix or imaginary spring is admitted.
        adverse=copy.deepcopy(points);adverse[0]['xyMm']=[6000,6000]
        with self.assertRaisesRegex(ValueError,'no actual plate or north-upstand body'):
            build_vertical_rc_floor(case,source,retained_point_receivers=adverse)


if __name__=='__main__':unittest.main()
