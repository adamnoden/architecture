import copy
import math
from pathlib import Path
import unittest
from unittest.mock import patch

from joined_successor_compatibility import load_successor_source, reference_successor_request, solve_successor_compatibility
from joined_successor_kernel import FrameModel, frame_matrix, rectangle_section


MATERIAL = {'mode':'authored-linear-comparison','elasticModulusMPa':33000,'poissonRatio':.2,
            'flexuralFactor':.25,'torsionFactor':.25,'shearAreaFactor':.5}
JOINT = {'mode':'authored-spring-comparison','compressionStiffnessKNPerMm3':.5,
         'tieStiffnessKNPerMm':50,'shearKeyStiffnessKNPerMm':100,'compressionGapMm':0,'tieGapMm':0}


class KernelTest(unittest.TestCase):
    def test_cantilever_matches_timoshenko_displacement_and_signed_reactions(self):
        model = FrameModel()
        model.node('base',[0,0,0]);model.node('tip',[1000,0,0])
        section = rectangle_section(10,20)
        material = {**MATERIAL,'elasticModulusMPa':200000,'flexuralFactor':1,'torsionFactor':1,'shearAreaFactor':5/6}
        model.member('beam','base','tip',section,material)
        for axis in range(6):model.fixed['base',axis] = 0
        model.load('tip',[0,0,-.001,0,0,0])
        result = model.solve()
        expected = -.001*1000**3/(3*200*section['Iz'])-.001*1000/((200/2.4)*(5/6)*section['A'])
        self.assertAlmostEqual(result['displacements']['tip'][2],expected,places=10)
        self.assertAlmostEqual(result['supportWrenches']['base'][2],.001,places=10)
        self.assertAlmostEqual(result['supportWrenches']['base'][4],-1,places=10)

    def test_displaced_master_cantilever_matches_independent_offset_compliance(self):
        model = FrameModel()
        model.node('base',[0,0,0]);model.node('tip-master',[1000,100,0])
        section = rectangle_section(20,40)
        material = {**MATERIAL,'elasticModulusMPa':200000,'flexuralFactor':1,'torsionFactor':1,'shearAreaFactor':5/6}
        model.member('offset-beam','base','tip-master',section,material,
                     physical_start=[0,0,100],physical_end=[1000,0,100])
        for axis in range(6):model.fixed['base',axis] = 0
        force = .001
        model.load('tip-master',[0,0,-force,0,0,0])
        result = model.solve()
        elastic = material['elasticModulusMPa']/1000
        shear = elastic/(2*(1+material['poissonRatio']))
        rx = -100*force*1000/(shear*section['J'])
        ry = force*1000**2/(2*elastic*section['Iz'])
        physical_z = -force*1000**3/(3*elastic*section['Iz'])-force*1000/(shear*material['shearAreaFactor']*section['A'])
        expected = [-100*ry,100*rx,physical_z+100*rx,rx,ry,0]
        for actual,value in zip(result['displacements']['tip-master'],expected):
            self.assertAlmostEqual(actual,value,places=12)
        self.assertAlmostEqual(result['supportWrenches']['base'][2],force,places=12)
        self.assertAlmostEqual(result['supportWrenches']['base'][3],100*force,places=12)
        self.assertAlmostEqual(result['supportWrenches']['base'][4],-1000*force,places=12)

    def test_rigid_translation_and_rotation_produce_no_member_action(self):
        a,b = [20,40,60],[800,220,500]
        stiffness = frame_matrix(a,b,rectangle_section(140,750),MATERIAL)
        translation,rotation = [2,-1,3],[.0002,-.0001,.0003]
        def point(p):
            return [translation[0]+rotation[1]*p[2]-rotation[2]*p[1],
                    translation[1]+rotation[2]*p[0]-rotation[0]*p[2],
                    translation[2]+rotation[0]*p[1]-rotation[1]*p[0],*rotation]
        u = point(a)+point(b)
        self.assertLess(max(abs(sum(k*v for k,v in zip(row,u))) for row in stiffness),1e-7)

    def test_compression_contact_and_tension_tie_select_the_correct_load_path(self):
        for load, displacement in [(-5,-.5),(5,2.5)]:
            model = FrameModel()
            model.node('bottom',[0,0,0]);model.node('top',[0,0,10])
            for node in model.nodes:
                for axis in range(6):
                    if node=='bottom' or axis!=2:model.fixed[node,axis] = 0
            model.spring('contact','top','bottom',[0,0,5],[0,0,1],10,'compression')
            model.spring('tie','top','bottom',[0,0,5],[0,0,1],2,'tension')
            model.load('top',[0,0,load,0,0,0])
            result = model.solve()
            self.assertAlmostEqual(result['displacements']['top'][2],displacement,places=9)
            self.assertEqual(next(s['active'] for s in result['springs'] if s['id']=='contact'),load<0)
            self.assertEqual(next(s['active'] for s in result['springs'] if s['id']=='tie'),load>0)

    def test_nonzero_free_travel_is_explicitly_rejected_before_contact_solution(self):
        model = FrameModel()
        model.node('bottom',[0,0,0]);model.node('top',[0,0,10])
        for mode,stiffness in [('compression',10),('tension',2)]:
            with self.assertRaisesRegex(ValueError,'Only zero-gap'):
                model.spring(mode,'top','bottom',[0,0,5],[0,0,1],stiffness,mode,1)


class CurrentSourceTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.source = load_successor_source(Path(__file__).resolve().parents[3])
        cls.request = {**reference_successor_request(cls.source),'memberLaw':MATERIAL,'jointLaw':JOINT}
        cls.result = solve_successor_compatibility(cls.request,cls.source)

    def test_actual_unequal_ne_cap_has_analytic_global_x_and_y_compliance(self):
        captured = {}
        original = FrameModel.member
        def record(model, name, a, b, section, material, *args, **settings):
            if name=='NE/corner-cap':
                captured.update(section=section,material=material,**settings)
            return original(model,name,a,b,section,material,*args,**settings)
        with patch.object(FrameModel,'member',record):
            solve_successor_compatibility(self.request,self.source)
        head = next(head for head in self.source['values']['current-house-grid']['heads'] if head['id']=='P10')
        width_x,width_y = head['capXY']
        self.assertNotEqual(width_x,width_y)
        height = math.dist(captured['physical_start'],captured['physical_end'])
        material = captured['material']
        elastic = material['elasticModulusMPa']/1000
        flexural = elastic*material['flexuralFactor']
        shear = elastic/(2*(1+material['poissonRatio']))*material['shearAreaFactor']*width_x*width_y
        inertias = [width_y*width_x**3/12,width_x*width_y**3/12]
        measured = []
        for axis,inertia in enumerate(inertias):
            model = FrameModel()
            model.node('base',captured['physical_start']);model.node('top',captured['physical_end'])
            model.member('actual-cap','base','top',captured['section'],material,y_axis=captured.get('y_axis'))
            for component in range(6):model.fixed['base',component] = 0
            force = [0.]*6;force[axis] = 1
            model.load('top',force)
            result = model.solve()
            compliance = result['displacements']['top'][axis]
            expected = height**3/(3*flexural*inertia)+height/shear
            self.assertAlmostEqual(compliance,expected,places=12)
            measured.append(compliance)
        self.assertLess(measured[0],measured[1])

    def test_actual_l_joint_full_contact_area_centroid_and_rotation_stiffness(self):
        captured = []
        original = FrameModel.spring
        def record(model,name,a,b,point,direction,stiffness,mode='bilateral',gap=0):
            if name.startswith('NW/compression/'):
                upper = model.nodes[a]
                features = [1,point[1]-upper[1],-(point[0]-upper[0])]
                captured.append((stiffness,features,upper))
            return original(model,name,a,b,point,direction,stiffness,mode,gap)
        with patch.object(FrameModel,'spring',record):
            solve_successor_compatibility(self.request,self.source)
        matrix = [[math.fsum(k*features[i]*features[j] for k,features,_ in captured) for j in range(3)] for i in range(3)]
        geometry = self.source['values']['floor-portal-monolithic-drag']['geometry']
        low = geometry['wallUAndLegVLimitsMm'][0][0]
        end = geometry['wallUAndLegVLimitsMm'][1][1]
        width = self.request['northWallWidthMm']
        local_rectangles = [(low,low,low+width,end),(low+width,low,end,low+width)]
        head = next(head for head in self.source['values']['current-house-grid']['heads'] if head['id']=='P07')
        rectangles = [(head['xy'][0]+a,head['xy'][1]-d,head['xy'][0]+c,head['xy'][1]-b) for a,b,c,d in local_rectangles]
        areas = [(c-a)*(d-b) for a,b,c,d in rectangles]
        area = sum(areas)
        cx = sum(a*(r[0]+r[2])/2 for a,r in zip(areas,rectangles))/area
        cy = sum(a*(r[1]+r[3])/2 for a,r in zip(areas,rectangles))/area
        self.assertAlmostEqual(captured[0][2][0],cx,places=9)
        self.assertAlmostEqual(captured[0][2][1],cy,places=9)
        ixx = math.fsum((c-a)*(d-b)**3/12+ar*((b+d)/2-cy)**2 for ar,(a,b,c,d) in zip(areas,rectangles))
        iyy = math.fsum((d-b)*(c-a)**3/12+ar*((a+c)/2-cx)**2 for ar,(a,b,c,d) in zip(areas,rectangles))
        ixy = math.fsum(ar*((a+c)/2-cx)*((b+d)/2-cy) for ar,(a,b,c,d) in zip(areas,rectangles))
        k = JOINT['compressionStiffnessKNPerMm3']
        expected = [[k*area,0,0],[0,k*ixx,-k*ixy],[0,-k*ixy,k*iyy]]
        for row,reference in zip(matrix,expected):
            for value,exact in zip(row,reference):
                self.assertTrue(math.isclose(value,exact,rel_tol=1e-12,abs_tol=1e-5),(value,exact))

    def test_actual_grid_and_joint_contacts_are_solved_together_without_source_mutation(self):
        result = self.result
        self.assertEqual(len(result['heads']),52)
        self.assertEqual(len({head['id'] for head in result['heads']}),52)
        self.assertGreater(result['memberCount'],100)
        self.assertGreater(result['activeSetIterations'],1)
        self.assertLess(max(abs(value) for value in result['equilibriumResidualKN_KNm']),1e-6)
        self.assertFalse(result['installedAcceptance'])
        self.assertFalse(result['completeHouseProof'])
        self.assertTrue(any(not patch['active'] for joint in result['interfaces'] for patch in joint['compressionPatches']))
        self.assertTrue(any(tie['active'] for joint in result['interfaces'] for tie in joint['tensionTies']))
        snapshot = copy.deepcopy(self.source)
        repeated = solve_successor_compatibility(self.request,self.source)
        self.assertEqual(repeated,result)
        self.assertEqual(snapshot,self.source)

    def test_joint_stiffness_changes_feed_back_through_the_floorband_to_named_head_reactions(self):
        changed = solve_successor_compatibility({**self.request,'jointLaw':{**JOINT,'tieStiffnessKNPerMm':10}},self.source)
        delta = max(abs(a-b) for old,new in zip(self.result['heads'],changed['heads']) for a,b in zip(old['reactionKN_KNm'],new['reactionKN_KNm']))
        self.assertGreater(delta,1)
        self.assertNotEqual(self.result['interfaces'][0]['upperDisplacementMmRad'],changed['interfaces'][0]['upperDisplacementMmRad'])
        self.assertEqual(self.result['applied'],changed['applied'])
        self.assertEqual(self.result['sourceSHA256'],changed['sourceSHA256'])

    def test_wall_geometry_perturbation_changes_derived_section_and_compatible_movement(self):
        changed = solve_successor_compatibility({**self.request,'northWallWidthMm':200},self.source)
        self.assertLess(changed['section']['A'],self.result['section']['A'])
        self.assertNotEqual(changed['interfaces'][0]['upperDisplacementMmRad'],self.result['interfaces'][0]['upperDisplacementMmRad'])
        external = lambda result:[(load['id'],load['pointXYZMm'],load['forceKN']) for load in result['applied']]
        self.assertEqual(external(changed),external(self.result))
        self.assertLess(max(abs(value) for value in changed['equilibriumResidualKN_KNm']),1e-6)

    def test_missing_stale_or_unsupported_constitutive_inputs_fail_closed(self):
        for edits in [
            {'jointLaw':None}, {'memberLaw':None}, {'sourceSHA256':{}}, {'northWallWidthMm':300},
            {'headBoundary':'invented-soil'}, {'floorConnection':'complete-current-floor'},
            {'jointLaw':{**JOINT,'tieStiffnessKNPerMm':math.inf}},
            {'jointLaw':{**JOINT,'compressionGapMm':1}},
            {'jointLaw':{**JOINT,'tieGapMm':1}},
            {'boundaryActions':{**self.request['boundaryActions'],'demandFactor':2}},
        ]:
            with self.assertRaises(ValueError):solve_successor_compatibility({**self.request,**edits},self.source)


if __name__=='__main__':
    unittest.main()
