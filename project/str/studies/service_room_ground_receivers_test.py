"""Physical receiver origins; no second solve or installation qualification."""
import copy
import unittest
from unittest.mock import patch

from joined_successor_kernel import FrameModel,rectangle_section
from service_room_ground import install,prepare_receiver_origins,recover_receiver_cuts
from grid_origin_recovery import recover_grid_cuts

LAW={'elasticModulusMPa':33000,'poissonRatio':.2,'flexuralFactor':1,'shearAreaFactor':5/6,'torsionFactor':1}
CHOICE={'enabled':True,'platePitchMm':500,'contactPitchMm':500,'plateLaw':{'elasticModulusMPa':33000,'poissonRatio':.2,'flexuralFactor':1,'shearFactor':5/6},'mineralModulusMPa':1000,'jointComplianceMmPerMPa':.1}

def specimen(axis=0,factor=1.):
    frame=FrameModel();a=[0.,150.,-480.];b=[1000.,150.,-480.]
    if axis:a,b=[150.,0.,-480.],[150.,1000.,-480.]
    frame.node('a',a);frame.node('b',b)
    frame.member('GRID/control','a','b',rectangle_section(300,600),LAW,y_axis=[0,0,1])
    for node in ['a','b']:
        for degree in [0,1,2,3+axis]:frame.fixed[node,degree]=0.
    geometry={'GRID/control':{'a':'a','b':'b','physicalStartMm':a,'physicalEndMm':b,'widthMm':300,'heightMm':600,'topZMm':-180}}
    model={'model':frame,'families':{'physical-G':{}},'request':{'gridLaw':LAW},'grid':{'heads':[]},'verticalFloor':{'fibres':[]}}
    rect=[100.,50.,200.,250.] if not axis else [50.,100.,250.,200.]
    body={'id':'CONTROL','rcRectangleXYMm':rect,'rcZMm':[-30,170],'rcUnitWeightKNPerM3':25,'mineralZMm':[-180,-30],'mineralUnitWeightKNPerM3':20,'disjointContactRectanglesXYMm':[rect]}
    with patch('service_room_ground.grid_member_geometry',return_value=geometry):
        prepare_receiver_origins(model,[body],CHOICE)
        installed=install(model,[body],CHOICE)
    for node in frame.nodes:
        if '/plate-node/' in node:
            frame.fixed[node,2]=10.;frame.fixed[node,3]=0.;frame.fixed[node,4]=0.
    for node,force in model['families']['physical-G'].items():frame.load(node,[factor*v for v in force])
    raw=frame.solve()
    return model,installed,raw

class GroundReceiverControls(unittest.TestCase):
    def test_open_top_still_delivers_complete_mineral_own_gravity_on_both_axes(self):
        for axis in [0,1]:
            for factor in [1.,1.35]:
                model,installed,raw=specimen(axis,factor)
                before_raw=copy.deepcopy(raw);before_loads=copy.deepcopy(model['model'].loads)
                before_springs=copy.deepcopy(model['model'].springs)
                result=recover_receiver_cuts(model,raw,installed,[],factor)
                self.assertTrue(result['physicalElementCutsAvailable'],result.get('diagnostics'))
                springs={s['id']:s for s in raw['springs']}
                fibres=installed['bodies'][0]['fibres']
                self.assertTrue(all(not springs[f['id']+'/top']['active'] for f in fibres))
                external=sum(r['forceKN'][2]*(factor if r['family']=='physical-G' else 1.) for r in result['origins'])
                self.assertAlmostEqual(external,-.06*factor,places=10)
                self.assertAlmostEqual(sum(raw['supportWrenches'][n][2] for n in ['a','b']),.06*factor,places=10)
                self.assertEqual(raw,before_raw);self.assertEqual(model['model'].loads,before_loads)
                self.assertEqual(model['model'].springs,before_springs)
                self.assertFalse(result['gridResistanceAccepted'])

    def test_factored_solved_force_and_characteristic_half_G_equal_one_factored_base_force(self):
        model,installed,raw=specimen(factor=1.35)
        result=recover_receiver_cuts(model,raw,installed,[],1.35)
        springs={s['id']:s for s in raw['springs']};origins=[]
        for f in installed['bodies'][0]['fibres']:
            force=springs[f['id']+'/body']['forceKN']-1.35*f['serialLaw']['bodyPhysicalGKN']/2
            origins.append({'id':f['id']+'/one-factored-base','memberId':f['receiverId'],'pointXYZMm':[*f['xyMm'],-180.],'forceKN':[0,0,force],'momentKNmm':[0,0,0],'family':'solved-interface'})
        independent=recover_grid_cuts(model,raw,model['wetGridOrigins']['members'],origins,1.35)
        self.assertTrue(independent['physicalElementCutsAvailable'])
        for a,b in zip(result['memberCuts'],independent['memberCuts']):
            for k in ['axialCompressionKN','shearYKN','shearZKN','torsionKNm','bendingYKNm','bendingZKNm']:self.assertAlmostEqual(a[k],b[k],places=10)

    def test_old_G_family_cannot_be_omitted_after_adding_new_contacts(self):
        model,installed,raw=specimen();model['foundationWeight']={}
        with self.assertRaisesRegex(ValueError,'origin adapter'):recover_receiver_cuts(model,raw,installed,[],1.)

    def test_missing_duplicate_or_changed_actual_service_source_rejects(self):
        model,installed,raw=specimen()
        missing=copy.deepcopy(installed);missing['bodies'][0]['fibres'].pop()
        with self.assertRaises(ValueError):recover_receiver_cuts(model,raw,missing,[],1.)
        duplicate=copy.deepcopy(installed);duplicate['bodies'][0]['fibres'].append(duplicate['bodies'][0]['fibres'][0])
        with self.assertRaises(ValueError):recover_receiver_cuts(model,raw,duplicate,[],1.)
        model['wetGridOrigins']['points'].pop()
        with self.assertRaisesRegex(ValueError,'capture'):recover_receiver_cuts(model,raw,installed,[],1.)

    def test_duplicate_assembled_spring_and_changed_reported_work_map_reject(self):
        model,installed,raw=specimen()
        for end in ('body','top'):
            spring=next(s for s in model['model'].springs if '/mineral/' in s['id'] and s['id'].endswith('/'+end))
            model['model'].springs.append(spring)
            with self.assertRaisesRegex(ValueError,'service spring'):recover_receiver_cuts(model,raw,installed,[],1.)
            model['model'].springs.pop()
            raw_spring=next(s for s in raw['springs'] if s['id']==spring['id']);raw['springs'].append(raw_spring)
            with self.assertRaisesRegex(ValueError,'service spring'):recover_receiver_cuts(model,raw,installed,[],1.)
            raw['springs'].pop()
        changed=copy.deepcopy(installed);changed['bodies'][0]['fibres'][0]['receiverTerms'][0][1][2]+=.1
        with self.assertRaisesRegex(ValueError,'work trace'):recover_receiver_cuts(model,raw,changed,[],1.)

    def test_late_receiver_declaration_is_not_a_source_completeness_proof(self):
        for model in [{'lowerCoreBodies':{}},{'foundationWeight':{}},{'wetGridOrigins':{'adapters':{'completed':{}}}}]:
            with self.assertRaisesRegex(ValueError,'before source gravity'):prepare_receiver_origins(model,[],CHOICE)

if __name__=='__main__':unittest.main()
