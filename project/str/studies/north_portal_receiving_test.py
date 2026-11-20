import copy
import hashlib
import json
import math
from pathlib import Path
import unittest

from north_portal_receiving import compile_north_receiving, load_north_receiving_source, portal_geometry, pier_compliance, receiving_path_catalogue, reference_north_receiving_case, solve_north_receiving_boundary
from joined_successor_kernel import rectangle_section


from north_portal_receiving_proof import MATERIAL, DPC, numerical_case


class FinitePierTest(unittest.TestCase):
    def prismatic(self):
        return {'footprintXYMm':[-100,-150,100,150],'baseZMm':0,'rawSpringZMm':4000,'shoulderTopZMm':5000,
                'skewbackXYZMm':[0,0,3000],'side':'west'}

    def test_prismatic_limit_matches_axial_timoshenko_and_twist_closed_forms(self):
        pier = self.prismatic();law = copy.deepcopy(MATERIAL)
        result = pier_compliance(pier,law,[1000,1000],DPC)
        matrix = result['rcOnlyComplianceMmMradPerKNKNm']
        elastic = law['elasticModulusMPa']/1000
        shear = elastic/(2*(1+law['poissonRatio']))
        area = 200*300;ix = 200*300**3/12;iy = 300*200**3/12
        self.assertAlmostEqual(matrix[0][0],3000**3/(3*elastic*.25*iy)+3000/(shear*.5*area),places=12)
        self.assertAlmostEqual(matrix[2][2],3000/(elastic*area),places=12)
        self.assertAlmostEqual(matrix[0][4],1000*3000**2/(2*elastic*.25*iy),places=12)
        self.assertAlmostEqual(matrix[3][3],1000**2*3000/(elastic*.25*ix),places=12)
        self.assertAlmostEqual(matrix[5][5],1000**2*3000/(shear*.25*rectangle_section(200,300)['J']),places=12)

    def test_actual_eccentricity_conserves_work_and_axial_bending_coupling(self):
        pier = self.prismatic();pier['skewbackXYZMm'][0] = 70
        result = pier_compliance(pier,MATERIAL,[1000,1000],DPC)
        elastic = MATERIAL['elasticModulusMPa']/1000
        area,iy = 200*300,300*200**3/12
        expected = 3000/(elastic*area)+70**2*3000/(elastic*.25*iy)
        self.assertAlmostEqual(result['rcOnlyComplianceMmMradPerKNKNm'][2][2],expected,places=12)
        matrix = result['complianceMmMradPerKNKNm']
        self.assertLess(max(abs(matrix[i][j]-matrix[j][i]) for i in range(6) for j in range(6)),1e-12)
        self.assertNotEqual(matrix[2][4],0)


class ActualReceivingTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.source = load_north_receiving_source(Path(__file__).resolve().parents[3])
        cls.case = numerical_case(cls.source)
        cls.result = compile_north_receiving(cls.case,cls.source)

    def test_actual_lower_rc_stops_at_skewback_and_maps_to_existing_caps(self):
        result = self.result
        self.assertEqual(len(result['ports']),4)
        self.assertEqual({port['headId'] for port in result['ports']},{'P25','P26','P28','P30'})
        for port in result['ports']:
            self.assertAlmostEqual(port['skewbackXYZMm'][2],2327.1518193224592,places=9)
            self.assertAlmostEqual(port['missingVerticalToFloorMm'],842.8481806775408,places=9)
            self.assertEqual(abs(port['floorToPierCentroidAlongMm']),36.25)
            self.assertEqual(port['sourceRCSectionMm'],[212.5,215])
            section = next(member['topRCSection'] for member in result['partialPierMembers'] if member['topRCSection']['centroidXYZMm'][1]==port['skewbackXYZMm'][1] and (member['topRCSection']['centroidXYZMm'][0]<6000)==(port['side']=='west'))
            self.assertLess(section['widthXMm'],212.5)
        self.assertEqual(result['finiteLowerRCSubpaths'],4)
        self.assertEqual(result['completeFloorReceiverPaths'],0)
        self.assertFalse(result['installedAcceptance'])
        self.assertIn('unresolved floor ports',result['geometrySvg'])

    def test_all_24_unit_wrenches_retain_52_actual_heads_and_reciprocal_work(self):
        result = self.result
        self.assertEqual(len(result['grid']['unitCases']),24)
        self.assertEqual(len(result['grid']['headIds']),52)
        self.assertTrue(all(len(case['heads'])==52 for case in result['grid']['unitCases']))
        self.assertLess(max(abs(value) for case in result['grid']['unitCases'] for value in case['equilibriumResidualKN_KNm']),1e-6)
        self.assertLess(result['reciprocityRelativeResidual'],1e-8)
        c,k = result['complianceMmMradPerKNKNm'],result['stiffnessKNKNmPerMmMrad']
        for i in range(24):
            for j in range(24):
                self.assertAlmostEqual(sum(c[i][a]*k[a][j] for a in range(24)),float(i==j),places=8)
        for phase in range(5):
            vector = [math.sin(i+phase) for i in range(24)]
            self.assertGreater(sum(vector[i]*c[i][j]*vector[j] for i in range(24) for j in range(24)),0)

    def test_source_taper_volume_and_flexibility_converge_without_full_height_credit(self):
        for pier in self.result['ports']:
            coarse = pier_compliance(pier,MATERIAL,[-50,-30],DPC)
            fine = pier_compliance(pier,MATERIAL,[-50,-30],DPC,subdivisions=8)
            a,b = coarse['complianceMmMradPerKNKNm'],fine['complianceMmMradPerKNKNm']
            scale = max(abs(value) for row in b for value in row)
            self.assertLess(max(abs(x-y) for row,other in zip(a,b) for x,y in zip(row,other))/scale,1e-9)
            height = pier['rawSpringZMm']-pier['baseZMm']-20
            width = pier['sourceRCSectionMm'][0];depth = pier['sourceRCSectionMm'][1]
            top_width = fine['topRCSection']['widthXMm']
            expected = ((height*width+(pier['skewbackXYZMm'][2]-pier['rawSpringZMm'])*(width+top_width)/2)*depth-math.pi*(pier['tieBoreDiameterMm']/2)**2*width)/1e9
            self.assertAlmostEqual(fine['integratedPartialRCVolumeM3'],expected,places=12)
            self.assertLess(expected,212.5*215*3170/1e9)

    def test_prescribed_boundary_responds_to_pier_change_while_force_control_preserves_grid(self):
        changed_case = copy.deepcopy(self.case);changed_case['pierLaw']['flexuralFactor'] = .125
        changed = compile_north_receiving(changed_case,self.source)
        self.assertEqual(changed['grid'],self.result['grid'])
        self.assertEqual(changed['geometrySvg'],self.result['geometrySvg'])
        boundary = {'schema':'str-north-portal-boundary/1','mode':'authored-port-displacements','values':[0.]*24}
        boundary['values'][2] = .01
        a = solve_north_receiving_boundary(self.result,boundary)
        b = solve_north_receiving_boundary(changed,boundary)
        self.assertGreater(max(abs(x-y) for x,y in zip(a['portWrenchesKN_KNm'],b['portWrenchesKN_KNm'])),1e-5)
        self.assertGreater(max(abs(x-y) for old,new in zip(a['heads'],b['heads']) for x,y in zip(old['reactionKN_KNm'],new['reactionKN_KNm'])),1e-5)
        self.assertLess(max(abs(value) for value in a['equilibriumResidualKN_KNm']),1e-6)
        force = {'schema':'str-north-portal-boundary/1','mode':'authored-port-wrenches','values':[0.]*24}
        force['values'][0] = 1.
        first = solve_north_receiving_boundary(self.result,force)
        second = solve_north_receiving_boundary(changed,force)
        self.assertEqual(first['heads'],second['heads'])
        self.assertNotEqual(first['portDisplacementsMmMrad'],second['portDisplacementsMmMrad'])
        self.assertGreater(a['strainEnergyKNmm'],0)
        self.assertEqual(a['completeFloorReceiverPaths'],0)

    def test_actual_internal_tie_station_cannot_be_collapsed_for_deformation(self):
        result = self.result
        boundary = {'schema':'str-north-portal-boundary/1','mode':'authored-port-wrenches','values':[0.]*24,'tieForcesKN':[0.]*4}
        boundary['values'][0] = 1.
        boundary['tieForcesKN'][0] = -1.
        pair = solve_north_receiving_boundary(result,boundary)
        self.assertEqual(len(pair['tieDisplacementsMm']),4)
        collapsed = {'schema':'str-north-portal-boundary/1','mode':'authored-port-wrenches','values':[0.]*24}
        collapsed['values'][4] = (result['ports'][0]['skewbackXYZMm'][2]-result['ports'][0]['tieForceXYZMm'][2])/1000
        substitute = solve_north_receiving_boundary(result,collapsed)
        self.assertLess(max(abs(a-b) for old,new in zip(pair['heads'],substitute['heads']) for a,b in zip(old['reactionKN_KNm'],new['reactionKN_KNm'])),1e-9)
        self.assertGreater(max(abs(a-b) for a,b in zip(pair['portDisplacementsMmMrad'],substitute['portDisplacementsMmMrad'])),1e-6)
        self.assertGreater(abs(pair['strainEnergyKNmm']-substitute['strainEnergyKNmm']),1e-7)
        self.assertLess(max(abs(value) for value in pair['equilibriumResidualKN_KNm']),1e-6)
        for member in result['partialPierMembers']:
            self.assertGreater(member['tieBoreSection']['tieBoreVoidWidthYMm'],0)
            self.assertLess(member['tieBoreSection']['A'],212.5*215)

    def test_affine_normal_pressure_exposes_the_unqualified_bilateral_tension_branch(self):
        boundary = {'schema':'str-north-portal-boundary/1','mode':'authored-port-wrenches','values':[0.]*24}
        boundary['values'][2] = -1.
        compression = solve_north_receiving_boundary(self.result,boundary)
        self.assertFalse(compression['jointNormalComparisons'][0]['requiresBilateralNormalTension'])
        self.assertGreater(compression['jointNormalComparisons'][0]['fullContactAffinePressureRangeMPa'][0],0)
        boundary['values'][2] = 1.
        tension = solve_north_receiving_boundary(self.result,boundary)
        self.assertTrue(tension['jointNormalComparisons'][0]['requiresBilateralNormalTension'])
        self.assertLess(tension['jointNormalComparisons'][0]['fullContactAffinePressureRangeMPa'][1],0)
        self.assertTrue(all(not joint['localResistanceAcceptance'] for joint in tension['jointNormalComparisons']))
        self.assertFalse(tension['installedAcceptance'])

    def test_recorded_proof_is_bound_to_actual_methods_and_geometry(self):
        directory = Path(__file__).parent
        proof = json.loads((directory/'north-portal-receiving-proof.json').read_text())
        self.assertEqual(proof['sourceSHA256'],self.source['identities'])
        self.assertEqual(proof['proofProducerSHA256'],hashlib.sha256((directory/'north_portal_receiving_proof.py').read_bytes()).hexdigest())
        self.assertEqual(proof['caseDigest'],hashlib.sha256(json.dumps(self.case,sort_keys=True,separators=(',',':'),allow_nan=False).encode()).hexdigest())
        self.assertEqual((directory/'north-portal-receiving.svg').read_text(),self.result['geometrySvg'])
        self.assertEqual(proof['derivedSvgSHA256'],hashlib.sha256(self.result['geometrySvg'].encode()).hexdigest())
        self.assertTrue(proof['gridUnchanged'] and proof['geometryUnchanged'])
        self.assertEqual(proof['completeFloorReceiverPaths'],0)

    def test_actual_28_port_catalogue_does_not_confuse_upper_arches_with_ground_paths(self):
        catalogue = receiving_path_catalogue(self.source)
        self.assertEqual(catalogue['namedPortCount'],28)
        self.assertEqual(catalogue['physicalLocationCount'],24)
        self.assertEqual(catalogue['pathKinds'],{'court-clear-pier':2,'court-corner-wall-union':8,
            'north-rc-pier-masonry-spandrel-chain':4,'outer-clear-pier':12,'south-court-arch-and-bridge-jamb':2})
        self.assertTrue(all(not port['completeFloorReceiverPath'] and port['law'] is None and port['lowerMaterialLaw'] is None for port in catalogue['ports']))

    def test_missing_or_stale_constitutive_and_whole_floor_claims_reject(self):
        with self.assertRaisesRegex(ValueError,'grid material law'):
            compile_north_receiving(reference_north_receiving_case(self.source),self.source)
        for field,value,message in [('use','complete-floor-receiving','Complete floor receiving'),('sourceSHA256',{},'Stale'),('dpcIntervalZMm',None,'explicit portal DPC')]:
            case = copy.deepcopy(self.case);case[field] = value
            with self.assertRaisesRegex(ValueError,message):compile_north_receiving(case,self.source)
        case = copy.deepcopy(self.case);case['dpcLaw']['mode'] = 'qualified-compression-only'
        with self.assertRaisesRegex(ValueError,'finite bilateral'):compile_north_receiving(case,self.source)
        boundary = {'schema':'str-north-portal-boundary/1','mode':'authored-port-wrenches','values':[0.]*23}
        with self.assertRaisesRegex(ValueError,'six finite'):solve_north_receiving_boundary(self.result,boundary)


if __name__=='__main__':
    unittest.main()
