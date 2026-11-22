"""Analytical physical cut witnesses; these are not whole-house evidence."""
import copy
import unittest
from unittest.mock import patch

from joined_successor_kernel import FrameModel,rectangle_section,cross
from rc_floor_house_loads import consistent_member_point_load
from rc_member_load_test import LAW
from grid_origin_recovery import (recover_grid_cuts,initialise_grid_origins,
    record_grid_gravity,record_grid_uniform_gravity,finish_grid_gravity_adapter,recover_wet_receiving_grid)


def specimen(point=(500.,0.,0.),force=(0.,0.,-1.),moment=(0.,0.,0.)):
    frame=FrameModel();frame.node('a',[0.,0.,0.]);frame.node('b',[1000.,0.,0.])
    frame.member('grid','a','b',rectangle_section(200,300),LAW,y_axis=[0,0,1])
    member={'a':'a','b':'b','physicalStartMm':[0.,0.,0.],'physicalEndMm':[1000.,0.,0.],
        'depthMm':200.,'breadthMm':300.,'yAxisGlobal':[0,0,1],'kind':'grid'}
    model={'model':frame,'request':{'gridLaw':LAW}}
    context={'model':frame,'request':{'frameLaw':LAW}}
    vector=consistent_member_point_load(context,member,point,force,moment)
    for i,node in enumerate(('a','b')):
        for axis in (0,1,2,3):frame.fixed[node,axis]=0.
        frame.load(node,vector[6*i:6*i+6])
    origin={'id':'known/point','memberId':'grid','pointXYZMm':list(point),
        'forceKN':list(force),'momentKNmm':list(moment),'family':'solved-interface'}
    return model,member,frame.solve(),origin


class ReceivingGridOriginTest(unittest.TestCase):
    def test_midpoint_force_recovers_zero_end_moment_and_PL_over_four(self):
        model,member,raw,origin=specimen()
        before=copy.deepcopy(raw);loads=copy.deepcopy(model['model'].loads)
        result=recover_grid_cuts(model,raw,{'grid':member},[origin],1.)
        self.assertTrue(result['physicalElementCutsAvailable'])
        self.assertLess(max(abs(row['bendingZKNm']) for row in result['memberCuts']),1e-12)
        self.assertAlmostEqual(max(abs(row['bendingZKNm']) for row in result['interiorMemberCuts']),.25,12)
        self.assertEqual(raw,before);self.assertEqual(model['model'].loads,loads)
        self.assertFalse(result['completePhysicalGridDemandEnvelopeAvailable'])
        self.assertFalse(result['gridResistanceAccepted'])

    def test_offset_six_component_source_preserves_reactions_and_actual_couple_jump(self):
        point=[370.,50.,100.];force=[1.2,-2.3,-3.4];moment=[110.,220.,-330.]
        model,member,raw,origin=specimen(point,force,moment)
        result=recover_grid_cuts(model,raw,{'grid':member},[origin],1.)
        self.assertTrue(result['physicalElementCutsAvailable'])
        reactions=[0.]*6
        for node,wrench in raw['supportWrenches'].items():
            translated=[a+b for a,b in zip(wrench[3:],cross(model['model'].nodes[node],wrench[:3]))]
            reactions=[a+b for a,b in zip(reactions,[*wrench[:3],*translated])]
        expected=[*force,*[a+b for a,b in zip(moment,cross(point,force))]]
        self.assertLess(max(abs(a+b) for a,b in zip(reactions,expected)),1e-8)
        sides={row['cutSide']:row for row in result['interiorMemberCuts'] if abs(row['fraction']-.37)<1e-10}
        # Source offset contributes r×F as well as its independently authored couple.
        physical_moment=[a+b for a,b in zip(moment,cross([0,50,100],force))]
        self.assertAlmostEqual(sides['right']['torsionKNm']-sides['left']['torsionKNm'],physical_moment[0]/1000,10)
        self.assertAlmostEqual(sides['right']['bendingYKNm']-sides['left']['bendingYKNm'],physical_moment[2]/1000,10)
        self.assertAlmostEqual(sides['right']['bendingZKNm']-sides['left']['bendingZKNm'],-physical_moment[1]/1000,10)

    def test_gravity_factor_is_applied_once_and_solved_interface_is_not_refactored(self):
        model,member,raw,origin=specimen(force=(0,0,-1.35))
        characteristic={**origin,'forceKN':[0.,0.,-1.],'family':'physical-G'}
        one=recover_grid_cuts(model,raw,{'grid':member},[characteristic],1.35)
        two=recover_grid_cuts(model,raw,{'grid':member},[origin],1.35)
        self.assertEqual(one['memberCuts'],two['memberCuts']);self.assertEqual(one['interiorMemberCuts'],two['interiorMemberCuts'])

    def test_actual_gravity_map_and_adapter_completeness_are_required(self):
        model,member,raw,origin=specimen()
        geometry={'grid':{**member,'widthMm':200.,'heightMm':300.,'topZMm':0.}}
        initialise_grid_origins(model,geometry,['grid'])
        context={'model':model['model'],'request':{'frameLaw':LAW}}
        unit=consistent_member_point_load(context,member,[500,0,0],[0,0,1])
        terms=[(node,unit[6*i:6*i+6]) for i,node in enumerate(('a','b'))]
        source={'id':'body/base-G','memberId':'grid','centroidXYMm':[500,0],'physicalDownKN':1.}
        record_grid_gravity(model,'lower-core/base-G','grid',[500,0],-1.,terms,source['id'])
        finish_grid_gravity_adapter(model,'lower-core/base-G',[source]);finish_grid_gravity_adapter(model,'lower-core/free-G',[])
        model['lowerCoreBodies']={'contactBodies':[]};model['verticalFloor']={'fibres':[]};model['seatedWetSupport']={'posts':[]}
        result=recover_wet_receiving_grid(model,raw,[],1.)
        self.assertTrue(result['physicalElementCutsAvailable'])
        model['wetGridOrigins']['points'].clear()
        with self.assertRaisesRegex(ValueError,'capture'):recover_wet_receiving_grid(model,raw,[],1.)

    def test_skipped_capture_cannot_self_certify_an_empty_or_partial_ledger(self):
        model,member,raw,origin=specimen()
        geometry={'grid':{**member,'widthMm':200.,'heightMm':300.,'topZMm':0.}}
        initialise_grid_origins(model,geometry,['grid'])
        expected=[{'id':'actual/source-piece','memberId':'grid','centroidXYMm':[500,0],'physicalDownKN':1.}]
        with self.assertRaisesRegex(ValueError,'capture'):
            finish_grid_gravity_adapter(model,'foundation/solid-G',expected)
        # A genuinely empty adapter is explicit and remains an empty result.
        finish_grid_gravity_adapter(model,'foundation/solid-G',[])
        self.assertEqual(model['wetGridOrigins']['adapters']['foundation/solid-G']['sourcePieceCount'],0)

    def test_omitted_source_normal_fibre_and_post_response_reject(self):
        model,member,raw,origin=specimen()
        initialise_grid_origins(model,{'grid':{**member,'widthMm':200.,'heightMm':300.,'topZMm':0.}},['grid'])
        model['verticalFloor']={'fibres':[]};model['seatedWetSupport']={'posts':[{'id':'actual-post'}]}
        with self.assertRaisesRegex(ValueError,'post'):recover_wet_receiving_grid(model,raw,[],1.)
        model['seatedWetSupport']['posts']=[]
        model['model'].springs.append({'id':'VERTICAL-FLOOR/bearing/actual-but-unrecorded'})
        with self.assertRaisesRegex(ValueError,'fibre identities'):recover_wet_receiving_grid(model,raw,[],1.)

    def test_uniform_body_is_a_line_load_not_quadrature_point_jumps_on_both_axes(self):
        import math
        for axis in (0,1):
            frame=FrameModel();end=[0.,0.,0.];end[axis]=1000.
            frame.node('a',[0.,0.,0.]);frame.node('b',end)
            frame.member('grid','a','b',rectangle_section(200,300),LAW,y_axis=[0,0,1])
            member={'a':'a','b':'b','physicalStartMm':[0.,0.,0.],'physicalEndMm':end,
                'widthMm':200.,'heightMm':300.,'topZMm':150.}
            model={'model':frame,'request':{'gridLaw':LAW}}
            initialise_grid_origins(model,{'grid':member},['grid'])
            metadata=model['wetGridOrigins']['members']['grid'];applied={n:[0.]*6 for n in ('a','b')}
            rectangle=[0.,40.,1000.,60.] if axis==0 else [40.,0.,60.,1000.]
            context={'model':frame,'request':{'frameLaw':LAW}}
            for xi in (-1/math.sqrt(3),1/math.sqrt(3)):
                for eta in (-1/math.sqrt(3),1/math.sqrt(3)):
                    point=[500+500*xi,50+10*eta,150] if axis==0 else [50+10*eta,500+500*xi,150]
                    vector=consistent_member_point_load(context,metadata,point,[0,0,-.5])
                    for i,node in enumerate(('a','b')):
                        for j,value in enumerate(vector[6*i:6*i+6]):applied[node][j]+=value
            free_rotation=4 if axis==0 else 3
            for node in ('a','b'):
                for j in range(6):
                    if j!=free_rotation:frame.fixed[node,j]=0.
                frame.load(node,applied[node])
            record_grid_uniform_gravity(model,'foundation/solid-G','grid',rectangle,2.,applied,'uniform/source-body')
            origins=model['wetGridOrigins']['lines'];self.assertEqual(len(origins),1)
            result=recover_grid_cuts(model,frame.solve(),{'grid':metadata},origins,1.)
            self.assertTrue(result['physicalElementCutsAvailable'])
            self.assertLess(max(abs(r['bendingYKNm'])+abs(r['bendingZKNm']) for r in result['memberCuts']),1e-12)
            self.assertAlmostEqual(max(abs(r['bendingZKNm']) for r in result['interiorMemberCuts']),.25,11)
            self.assertEqual({r['cutSide'] for r in result['interiorMemberCuts']},{'right'})

    def test_wrong_map_duplicate_unknown_and_nonfinite_origins_reject(self):
        model,member,raw,origin=specimen()
        for origins in ([origin,origin],[{**origin,'family':'guessed'}],[{**origin,'forceKN':[0,0,float('nan')]}]):
            with self.assertRaises(ValueError):recover_grid_cuts(model,raw,{'grid':member},origins,1.)
        geometry={'grid':{**member,'widthMm':200.,'heightMm':300.,'topZMm':0.}}
        initialise_grid_origins(model,geometry,['grid'])
        with self.assertRaisesRegex(ValueError,'actually applied'):
            record_grid_gravity(model,'bad','grid',[500,0],-1.,[('a',[0.]*6),('b',[0.]*6)],'bad/source')

    def test_incomplete_recovery_emits_no_cuts_and_still_guards_native_invariants(self):
        model,member,raw,origin=specimen()
        with patch('grid_origin_recovery.member_load_equilibrium',side_effect=ValueError('incomplete source')):
            result=recover_grid_cuts(model,raw,{'grid':member},[origin],1.)
            self.assertFalse(result['physicalElementCutsAvailable']);self.assertEqual(result['memberCuts'],[])
            self.assertTrue(result['nativeSupportReactionsUnchanged'])
        def illegal_mutation(*args):
            raw['supportWrenches']['a'][2]+=1
            raise ValueError('incomplete source')
        with patch('grid_origin_recovery.member_load_equilibrium',side_effect=illegal_mutation):
            with self.assertRaisesRegex(ValueError,'changed native reactions'):
                recover_grid_cuts(model,raw,{'grid':member},[origin],1.)


if __name__=='__main__':unittest.main()
