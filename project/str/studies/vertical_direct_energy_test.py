"""Exact direct-plate representation controls, without a house solve."""
import gc
import math
import weakref
import unittest

from joined_successor_kernel import FrameModel,rectangle_section
from vertical_floor_numerics import (DIRECT_PLATE_POLICY,LEGACY_PLATE_POLICY,
    VERTICAL_ENERGY_PREFIX,install_vertical_plate_energy,solve_vertical_frame)
from floor_section_successor import _replace_vertical_plate_energy


LAW={'elasticModulusMPa':33000,'poissonRatio':.2,'flexuralFactor':.25,'torsionFactor':.25,'shearAreaFactor':.5}


def operator(k):
    return {'condensedStiffness':[[k,-k],[-k,k]],'energyModes':[[math.sqrt(k),-math.sqrt(k)]]}


def specimen(policy,load=-10,head_count=1):
    frame=FrameModel();heads=[]
    for i in range(head_count):
        name='P'+str(i);heads.append(name);frame.node(name,[100*(i%13),100*(i//13),0])
        for axis in (range(6) if head_count==1 else range(3)):frame.fixed[name,axis]=0
    frame.node('top',[600,150,1200]);frame.node('normal',[600,150,1100])
    for axis in (0,1,3,4,5):frame.fixed['normal',axis]=0
    for i,head in enumerate(heads):
        frame.member('WET-SUPPORT/beam/'+str(i),head,'top',rectangle_section(200,300),LAW)
    frame.springs.append({'id':'WET-SUPPORT/normal/control','terms':[('normal',[0,0,1,0,0,0]),(heads[0],[0,0,-1,0,0,0])],
        'stiffness':20.,'mode':'compression','gap':0.})
    for name,k in (('ROOF/FLOOR/energy/control',.5),('JOINED-FLOOR/energy/control',.25)):
        frame.springs.append({'id':name,'terms':[('top',[0,0,1,0,0,0]),('normal',[0,0,-1,0,0,0])],
            'stiffness':k,'mode':'bilateral','gap':0.})
    frame.load('normal',[0,0,load,0,0,0])
    terms=[[('top',[0,0,1,0,0,0])],[('normal',[0,0,1,0,0,0])]]
    op=operator(15);install_vertical_plate_energy(frame,op,terms,policy)
    data={'ports':[{},{}],'portTerms':terms,'operator':op,'plateEnergyRepresentationPolicy':policy}
    return frame,data,heads


def energy_check(test,frame,result):
    external=.5*sum(f*u for node,row in frame.loads.items() for f,u in zip(row,result['displacements'][node]))
    internal=.5*sum(f*u for name,a,b,_ in frame.members for f,u in zip(result['memberEndWrenchesKN_KNmm'][name],result['displacements'][a]+result['displacements'][b]))
    internal+=.5*sum(s['forceKN']*s['relativeMm'] for s in result['springs'])
    test.assertLess(abs(internal-external)/max(1,abs(external)),1e-7)
    return internal


class DirectVerticalEnergyTest(unittest.TestCase):
    def assert_same_physics(self,legacy,direct,heads):
        for key in ('displacements','memberEndWrenchesKN_KNmm'):
            self.assertEqual(set(legacy[key]),set(direct[key]))
            self.assertLess(max(abs(a-b) for name,row in legacy[key].items() for a,b in zip(row,direct[key][name])),1e-8)
        self.assertLess(max(abs(a-b) for name in heads for a,b in zip(legacy['supportWrenches'][name],direct['supportWrenches'][name])),1e-8)
        old={s['id']:s for s in legacy['springs']};new={s['id']:s for s in direct['springs']}
        self.assertEqual(set(old),set(new))
        for name,row in old.items():
            self.assertEqual(row['active'],new[name]['active']);self.assertAlmostEqual(row['forceKN'],new[name]['forceKN'],8)
            self.assertAlmostEqual(row['relativeMm'],new[name]['relativeMm'],8)

    def test_direct_matches_legacy_frame_oracle_contacts_members_and_global_energy(self):
        for load in (-10,10):
            legacy,data,heads=specimen(LEGACY_PLATE_POLICY,load);native=legacy.solve();sparse_legacy=solve_vertical_frame(legacy,data)
            direct,vertical,_=specimen(DIRECT_PLATE_POLICY,load);fast=solve_vertical_frame(direct,vertical)
            self.assert_same_physics(native,fast,heads);self.assert_same_physics(sparse_legacy,fast,heads)
            energy_check(self,legacy,native);energy_check(self,direct,fast)
            self.assertEqual(fast['verticalEnergyRowsInPhysicalSpringMatrix'],0)
            self.assertEqual(sparse_legacy['verticalEnergyRowsInPhysicalSpringMatrix'],0)
            self.assertEqual(fast['physicalSpringMatrixRows'],3)
            self.assertFalse(any(s['id'].startswith(VERTICAL_ENERGY_PREFIX) for s in direct.springs))
            diagnostic=next(s for s in fast['springs'] if s['id'].startswith(VERTICAL_ENERGY_PREFIX))
            self.assertEqual(diagnostic['terms'],[]);self.assertTrue(diagnostic['diagnosticOnly'])
            with self.assertRaisesRegex(ValueError,'Direct vertical plate block'):direct.solve()

    def test_matched_52_head_fixture_preserves_all312_reaction_components(self):
        for load in (-10,10):
            legacy,data,heads=specimen(LEGACY_PLATE_POLICY,load,52)
            direct,vertical,_=specimen(DIRECT_PLATE_POLICY,load,52)
            a=legacy.solve();b=solve_vertical_frame(direct,vertical)
            self.assertEqual(len(heads)*6,312);self.assert_same_physics(a,b,heads)
            self.assert_same_physics(solve_vertical_frame(legacy,data),b,heads)
            energy_check(self,legacy,a);energy_check(self,direct,b)

    def test_actual_offset_rotations_preserve_work_dual_modal_force_diagnostics(self):
        for load in (-10,10):
            results=[]
            for policy in (LEGACY_PLATE_POLICY,DIRECT_PLATE_POLICY):
                frame,data,heads=specimen(policy,load)
                # Actual normal displacement at a point75mm east/160mm north
                # of the master: uz+160rx−75ry, work-dual to nodal moments.
                data['portTerms'][0]=[('top',[0,0,1,160,-75,0])]
                install_vertical_plate_energy(frame,data['operator'],data['portTerms'],policy)
                result=frame.solve() if policy==LEGACY_PLATE_POLICY else solve_vertical_frame(frame,data)
                energy_check(self,frame,result);results.append(result)
            self.assert_same_physics(results[0],results[1],heads)

    def test_section_operator_replacement_retains_both_explicit_policies(self):
        for policy in (DIRECT_PLATE_POLICY,LEGACY_PLATE_POLICY):
            frame,data,heads=specimen(policy);before=solve_vertical_frame(frame,data)
            old=data['operator'];fresh=operator(30)
            self.assertEqual(_replace_vertical_plate_energy(frame,data,fresh),policy)
            self.assertIs(data['operator'],fresh)
            after=solve_vertical_frame(frame,data);energy_check(self,frame,after)
            self.assertNotEqual(before['displacements']['normal'][2],after['displacements']['normal'][2])
            if policy==LEGACY_PLATE_POLICY:self.assert_same_physics(frame.solve(),after,heads)
            else:
                with self.assertRaisesRegex(ValueError,'stale'):solve_vertical_frame(frame,{**data,'operator':old})
                self.assertFalse(any(s['id'].startswith(VERTICAL_ENERGY_PREFIX) for s in frame.springs))
                with self.assertRaises(ValueError):frame.solve()

    def test_legacy_policy_can_be_restored_and_direct_guard_has_no_self_cycle(self):
        frame,data,heads=specimen(DIRECT_PLATE_POLICY)
        install_vertical_plate_energy(frame,data['operator'],data['portTerms'],LEGACY_PLATE_POLICY)
        self.assert_same_physics(frame.solve(),solve_vertical_frame(frame,data),heads)
        frame,data,_=specimen(DIRECT_PLATE_POLICY);reference=weakref.ref(frame)
        enabled=gc.isenabled();gc.disable()
        try:
            del frame
            self.assertIsNone(reference())
        finally:
            if enabled:gc.enable()
        with self.assertRaises(ValueError):install_vertical_plate_energy(FrameModel(),operator(15),[],DIRECT_PLATE_POLICY)


if __name__=='__main__':unittest.main()
