import copy
import hashlib
import json
import math
from pathlib import Path
import runpy
import unittest

from distributed_floor_compatibility import compile_distributed_floor, load_distributed_floor_source, reference_distributed_floor_request, _native_floor_wind
from perforated_floor_condensation import _schur, positive_energy_modes


from distributed_floor_proof import numerical_request


class CondensationTest(unittest.TestCase):
    def test_schur_energy_and_force_match_independent_dense_solution(self):
        matrix = [[4,-2,0,-1],[-2,5,-1,0],[0,-1,3,-1],[-1,0,-1,3]]
        sparse = {i:{j:float(value) for j,value in enumerate(row) if value} for i,row in enumerate(matrix)}
        load = [1,4,-2,3]
        condensed,force,_ = _schur(sparse,[0,3],[1,1,1,1],[1,2],dict(enumerate(load)))
        factor = runpy.run_path(str(Path(__file__).with_name('structural-linear.py')))['factor']
        solve = factor([[matrix[i][j] for j in (1,2)] for i in (1,2)])
        expected_k = [[matrix[i][j]-sum(matrix[i][k]*value for k,value in zip((1,2),solve([matrix[k][j] for k in (1,2)]))) for j in (0,3)] for i in (0,3)]
        expected_f = [load[i]-sum(matrix[i][k]*value for k,value in zip((1,2),solve([load[k] for k in (1,2)]))) for i in (0,3)]
        for row,other in zip(condensed,expected_k):
            for a,b in zip(row,other):
                self.assertAlmostEqual(a,b,places=12)
        for a,b in zip(force,expected_f):
            self.assertAlmostEqual(a,b,places=12)
        for prescribed in ([1.,0.],[-2.,3.],[.2,-.7]):
            internal = solve([-sum(matrix[i][j]*value for j,value in zip((0,3),prescribed)) for i in (1,2)])
            full = [prescribed[0],internal[0],internal[1],prescribed[1]]
            actual_energy = sum(full[i]*matrix[i][j]*full[j]/2 for i in range(4) for j in range(4))
            reduced_energy = sum(prescribed[i]*condensed[i][j]*prescribed[j]/2 for i in range(2) for j in range(2))
            self.assertAlmostEqual(actual_energy,reduced_energy,places=12)

    def test_energy_modes_preserve_nullspace_and_reject_negative_energy(self):
        matrix = [[2,-2,0],[-2,2,0],[0,0,0]]
        modes,error = positive_energy_modes(matrix)
        self.assertEqual(len(modes),1)
        self.assertLess(error,1e-12)
        self.assertAlmostEqual(sum(modes[0]),0,places=12)
        with self.assertRaisesRegex(ValueError,'negative strain energy'):
            positive_energy_modes([[1,0],[0,-1]])
        with self.assertRaisesRegex(ValueError,'singular'):
            _schur({0:{0:1},1:{1:0}},[0],[1,1],[1])

    def test_loaded_internal_energy_is_not_mislabelled_as_condensed_port_energy(self):
        matrix = {0:{0:12.,1:-12.},1:{0:-12.,1:24.,2:-12.},2:{1:-12.,2:12.}}
        condensed,force,_ = _schur(matrix,[0,2],[1,1,1],[1],{1:10.})
        self.assertEqual(force,[5.,5.])
        ports = [2.,-1.]
        middle = (10+12*ports[0]+12*ports[1])/24
        physical = 12*(ports[0]-middle)**2/2+12*(middle-ports[1])**2/2
        port_energy = sum(ports[i]*value*ports[j]/2 for i,row in enumerate(condensed) for j,value in enumerate(row))
        self.assertAlmostEqual(port_energy,27.,places=12)
        self.assertAlmostEqual(physical-port_energy,25/12,places=12)


class CurrentFloorTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.source = load_distributed_floor_source(Path(__file__).resolve().parents[3])
        cls.before = json.dumps(cls.source,sort_keys=True)
        cls.request = numerical_request(cls.source)
        cls.result = compile_distributed_floor(cls.request,cls.source)

    def test_native_signed_pressure_positions_and_six_component_offset_are_preserved(self):
        axes = self.source['retained']['policy']['axes']
        for wind in range(96):
            case = _native_floor_wind(self.source,wind,axes)
            for axis,code in enumerate(case['programme']):
                if not code:
                    continue
                row = next(row for row in case['rows'] if row['id'].endswith('/'+str(axis)))
                sign = 1 if code<4 else -1
                mode = (code-1)%3
                low,high = (-200 if mode!=2 else 6000),(12200 if mode!=1 else 6000)
                local = (low+high)/2
                face = (3 if sign==1 else 1) if axis==0 else (0 if sign==1 else 2)
                a = axes['A']
                independent = [(local,a),(12000-a,local),(12000-local,12000-a),(a,12000-local)][face]
                self.assertEqual(row['pointXYZMm'][:2],list(independent))
                expected = sign*2.25*(high-low)/1000*(6600-(-180))/2000
                self.assertAlmostEqual(row['forceKN'][axis],expected,places=12)
        floor = self.result['floor']
        forces = floor['condensedForceKN']
        result_force = [sum(forces[3*i+axis] for i in range(4)) for axis in range(2)]
        expected = [sum(row['forceKN'][axis] for row in self.result['applied']) for axis in range(2)]
        for a,b in zip(result_force,expected):
            self.assertAlmostEqual(a,b,places=7)
        yaw = sum(port['originXYMm'][0]*forces[3*i+1]-port['originXYMm'][1]*forces[3*i]+1000*forces[3*i+2] for i,port in enumerate(floor['ports']))
        expected_yaw = sum(row['pointXYZMm'][0]*row['forceKN'][1]-row['pointXYZMm'][1]*row['forceKN'][0] for row in self.result['applied'])
        self.assertAlmostEqual(yaw,expected_yaw,places=5)
        actual_couples = [sum(row['momentKNmm'][axis] for row in self.result['projectionCouples']) for axis in range(3)]
        expected_couples = [-100*expected[1],100*expected[0],0.]
        for a,b in zip(actual_couples,expected_couples):
            self.assertAlmostEqual(a,b,places=9)

    def test_actual_source_geometry_is_coupled_to_all_four_walls_and_52_heads(self):
        result = self.result
        self.assertEqual(len(result['heads']),52)
        self.assertEqual(len({head['id'] for head in result['heads']}),52)
        self.assertEqual({port['id'] for port in result['interfaces']},{'NW','NE','SW','SE'})
        self.assertGreater(result['floor']['triangleCount'],1000)
        self.assertGreater(result['floor']['interiorDofCount'],1000)
        self.assertLess(max(abs(value) for value in result['equilibriumResidualKN_KNm']),1e-6)
        self.assertLess(max(result['floor']['rigidModeResidualKN']),1e-6)
        self.assertLess(result['floor']['modeReconstructionRelativeError'],1e-8)
        self.assertTrue(all(port['law'] is None for port in result['unmodelledIntermediateReceivingPorts']))
        self.assertEqual(len(result['unmodelledIntermediateReceivingPorts']),28)
        self.assertFalse(result['installedAcceptance'])
        self.assertFalse(result['completeHouseProof'])
        self.assertIsNone(result['completeSpliceDemand'])
        self.assertIn('<svg',result['drawings']['floor.svg'])
        self.assertEqual(json.dumps(self.source,sort_keys=True),self.before)

    def test_aperture_edit_changes_real_head_and_joint_responses_with_unchanged_wind(self):
        request = copy.deepcopy(self.request)
        request['componentCase']['edits']['floorApertures'] = [{'id':'FLOOR-APERTURE/plant-riser','shape':{'kind':'rectangle','boundsXYMm':[9240,4760,9905,5305]}}]
        changed = compile_distributed_floor(request,self.source)
        self.assertNotEqual(changed['floor']['membraneAreaM2'],self.result['floor']['membraneAreaM2'])
        head_delta = max(abs(a-b) for old,new in zip(self.result['heads'],changed['heads']) for a,b in zip(old['reactionKN_KNm'],new['reactionKN_KNm']))
        joint_delta = max(abs(a-b) for old,new in zip(self.result['interfaces'],changed['interfaces']) for a,b in zip(old['upperDisplacementMmRad'],new['upperDisplacementMmRad']))
        self.assertGreater(head_delta,1e-6)
        self.assertGreater(joint_delta,1e-6)
        self.assertEqual(changed['windBoundary'],self.result['windBoundary'])
        self.assertNotEqual(changed['drawings']['floor.svg'],self.result['drawings']['floor.svg'])

    def test_court_projection_control_retains_same_floor_response_and_reverse_is_signed(self):
        request = copy.deepcopy(self.request)
        request['boundaryCase']['windIndex'] = 48
        control = compile_distributed_floor(request,self.source)
        self.assertEqual(control['heads'],self.result['heads'])
        self.assertEqual(control['interfaces'],self.result['interfaces'])
        request['boundaryCase']['windIndex'] = 3
        reverse = compile_distributed_floor(request,self.source)
        forward_y = sum(head['reactionKN_KNm'][1] for head in self.result['heads'])
        reverse_y = sum(head['reactionKN_KNm'][1] for head in reverse['heads'])
        self.assertLess(forward_y,0)
        self.assertGreater(reverse_y,0)
        self.assertAlmostEqual(forward_y,-reverse_y,places=7)
        self.assertLess(max(abs(value) for value in reverse['equilibriumResidualKN_KNm']),1e-6)

    def test_real_source_and_edited_apertures_cannot_borrow_band_or_corner_material(self):
        request = copy.deepcopy(self.request)
        request['edgeBand']['widthMm'] = 200
        with self.assertRaisesRegex(ValueError,'APERTURE_INTERSECTS_STRUCTURAL_PATH.*FLOOR-VOID/void.*outer-south'):
            compile_distributed_floor(request,self.source)
        request['edgeBand']['widthMm'] = 170
        with self.assertRaisesRegex(ValueError,'APERTURE_INTERSECTS_STRUCTURAL_PATH.*stair.*outer-west'):
            compile_distributed_floor(request,self.source)
        request = copy.deepcopy(self.request)
        request['cornerWidthsMm']['NW'] = 240
        with self.assertRaisesRegex(ValueError,'APERTURE_INTERSECTS_STRUCTURAL_PATH.*rear-soil.*NW'):
            compile_distributed_floor(request,self.source)
        request = copy.deepcopy(self.request)
        request['componentCase']['edits']['floorApertures'] = [{'id':'FLOOR-APERTURE/plant-riser','shape':{'kind':'rectangle','boundsXYMm':[5000,3800,5600,4030]}}]
        with self.assertRaisesRegex(ValueError,'APERTURE_INTERSECTS_STRUCTURAL_PATH.*plant-riser.*court-south'):
            compile_distributed_floor(request,self.source)
        self.assertNotIn('elasticStrainEnergyKNmm',self.result['floor'])
        self.assertGreater(self.result['floor']['condensedPortStrainEnergyKNmm'],0)

    def test_recorded_inspection_binds_current_methods_and_actual_drawing(self):
        directory = Path(__file__).parent
        proof = json.loads((directory/'distributed-floor-compatibility-proof.json').read_text())
        self.assertEqual(proof['sourceSHA256'],self.source['identities'])
        self.assertEqual(proof['proofProducerSHA256'],hashlib.sha256((directory/'distributed_floor_proof.py').read_bytes()).hexdigest())
        self.assertEqual(proof['baselineCaseDigest'],hashlib.sha256(json.dumps(self.request,sort_keys=True,separators=(',',':'),allow_nan=False).encode()).hexdigest())
        drawing = self.result['drawings']['floor.svg']
        self.assertEqual((directory/'distributed-floor-compatibility.svg').read_text(),drawing)
        self.assertEqual(proof['derivedSvgSha256'],hashlib.sha256(drawing.encode()).hexdigest())
        self.assertEqual(proof['sweep']['caseCount'],96)
        self.assertEqual(proof['sweep']['headIds'],[head['id'] for head in self.result['heads']])
        self.assertEqual({case['windIndex'] for case in proof['sweep']['cases']},set(range(96)))
        self.assertTrue(all(case['headCount']==52 and case['maximumEquilibriumResidualKN_KNm']<1e-6 for case in proof['sweep']['cases']))

    def test_missing_laws_stale_results_and_complete_house_claims_reject(self):
        with self.assertRaisesRegex(ValueError,'authored member law'):
            compile_distributed_floor(reference_distributed_floor_request(self.source),self.source)
        for field,value,message in [('use','complete-house','Complete-house use rejects'),('sourceSHA256',{},'Stale'),('edgeBand',None,'slab-level band')]:
            request = copy.deepcopy(self.request)
            request[field] = value
            with self.assertRaisesRegex(ValueError,message):
                compile_distributed_floor(request,self.source)
        request = copy.deepcopy(self.request)
        request['approval'] = True
        with self.assertRaisesRegex(ValueError,'exact'):
            compile_distributed_floor(request,self.source)


if __name__=='__main__':
    unittest.main()
