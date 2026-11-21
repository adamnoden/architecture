import copy
import hashlib
import json
import math
from pathlib import Path
import unittest
import xml.etree.ElementTree as ET

from masonry_frame_a import (_add_lower_l_weight, _label_ground_element_actions, _ring_witness, build_masonry_frame_a, geometry, load_masonry_frame_a_source,
                             reference_masonry_frame_a_case, render_masonry_frame_a)

D=Path(__file__).resolve().parent
ROOT=D.parents[2]


class MasonryFrameTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.source=load_masonry_frame_a_source(ROOT);cls.case=reference_masonry_frame_a_case(cls.source)
        cls.portal=json.loads((ROOT/'project/had/studies/water-replan.json').read_text())['model']['insulatedPortal']
        cls.grid=json.loads((D/'current-house-grid.json').read_text())
        cls.g=geometry(cls.case,cls.portal,cls.grid)

    def test_actual_radial_seat_and_exact_union(self):
        g=self.g;ri=self.portal['rawRadius'];cz=self.portal['centreZ']
        for point,radius in ((g['innerSpringXZMm'],ri),(g['outerSeatXZMm'],ri+215)):
            self.assertAlmostEqual(math.hypot(point[0]-6000,point[1]-cz),radius)
        # Independent trapezoid integration of the explicit polygon section.
        left=4307.5;inner,spring=g['innerSpringXZMm'];clip=g['seatTopXAt2600Mm']
        area=(inner-left)*(spring+180)+(inner+clip-2*left)/2*(2600-spring)+(4520-left)*(3170-2600)
        self.assertAlmostEqual(g['fourRCPostUnionVolumeM3'],4*area*290/1e9)
        self.assertEqual(g['finishedWidthMm'],2400);self.assertEqual(g['localJambGlassMm'],60)

    def test_course_equilibrium_against_independent_area_quadrature(self):
        n=100;theta=self.g['seatAngleRad'];density=20
        for row in _ring_witness(self.g,density):
            r0,r1=row['innerRadiusMm'],row['outerRadiusMm'];rm=(r0+r1)/2;a=6000-row['westSeatXZMm'][0]
            rise=self.g['sourceCurveCentreZMm']+rm-row['westSeatXZMm'][1];weights=[];moments=[]
            for i in range(n):
                r=r0+(i+.5)*(r1-r0)/n
                for j in range(n):
                    t=(j+.5)*theta/n;w=r*(r1-r0)/n*theta/n*215*density/1e9
                    weights.append(w);moments.append(w*(a-r*math.sin(t)))
            self.assertAlmostEqual(math.fsum(weights),row['seatVerticalKN'],places=11)
            self.assertLess(abs(math.fsum(moments)/rise/row['seatHorizontalKN']-1),2e-6)
            self.assertFalse(row['strengthAccepted']);self.assertFalse(row['movementCompatibleArchAccepted'])

    def test_projection_changes_actual_body_ring_and_glass(self):
        changed=copy.deepcopy(self.case);changed['masonrySeatProjectionMm']=170;g=geometry(changed,self.portal,self.grid)
        self.assertLess(g['fourRCPostUnionVolumeM3'],self.g['fourRCPostUnionVolumeM3'])
        self.assertGreater(g['localJambGlassMm'],self.g['localJambGlassMm'])
        self.assertNotEqual(_ring_witness(g,20),_ring_witness(self.g,20))
        self.assertEqual(g['finishedWidthMm'],self.g['finishedWidthMm'])

    def test_unqualified_and_missing_input_cases_reject_before_solver(self):
        for key,value in (('masonrySeatProjectionMm',300),('masonryUnitWeightKNM3',float('nan')),('abutmentSlices',3),('sourceSHA256',{}),('accepted',True)):
            case=copy.deepcopy(self.case);case[key]=value
            with self.assertRaises(ValueError):build_masonry_frame_a(case,self.source)
        grid=copy.deepcopy(self.grid);next(r for r in grid['heads'] if r['id']=='P25')['capXY']=[400,400]
        with self.assertRaises(ValueError):geometry(self.case,self.portal,grid)

    def test_section_uses_actual_authored_upstand_depth(self):
        def specimen(depth):
            return {'geometry':self.g,'masonryCourses':_ring_witness(self.g,20),
                'nativeVertical':{'native':{'caseId':'SYNTHETIC-RENDER-UNIT','heads':[{'id':'P1','reactionKN_KNm':[0,0,1,0,0,0]}]},
                    'northUpstandStrips':[{'wallId':'outer-north','depthMm':depth,'centroidZMm':3170+depth/2,'rectangleXYMm':[0,0,3000,290]}],
                    'mass':{'newPlateAreaM2':1,'newPlatePhysicalSelfGKN':1}},
                'mass':{'RCPostVolumeM3':1,'masonryPhysicalGKN':1,'joinedPhysicalGKN':100},'foundationWeight':{'physicalGKN':1}}
        base=render_masonry_frame_a(specimen(750));edited=render_masonry_frame_a(specimen(650))
        self.assertNotEqual(base,edited);self.assertIn('Upstand depth 750 / normal 290 mm',base);self.assertIn('Upstand depth 650 / normal 290 mm',edited)
        ET.fromstring(base);ET.fromstring(edited)

    def test_actual_lower_L_mass_excludes_gap_and_conserves_moments(self):
        from types import SimpleNamespace
        nodes={};members=[];corners=[]
        for name,x,y in (('SW',0.,0.),('SE',10000.,0.),('NW',0.,10000.),('NE',10000.,10000.)):
            corners.append({'id':name,'rectangles':[[x,y,x+50,y+100],[x+50,y,x+100,y+50]]})
            for kind,lo,hi in (('lower-wall',-180.,-50.),('upper-wall',-30.,3170.)):
                a,b=name+'/'+kind+'/a',name+'/'+kind+'/b';nodes[a]=[x+40,y+40,lo];nodes[b]=[x+40,y+40,hi];members.append((name+'/'+kind,a,b,None))
        model={'model':SimpleNamespace(nodes=nodes,members=members),'joinedFloor':{'corners':corners},'families':{'physical-G':{}}}
        result=_add_lower_l_weight(model,{'unitWeightKNPerM3':25.})
        self.assertEqual(result['memberCount'],8);self.assertAlmostEqual(result['RCVolumeM3'],4*7500*3330/1e9)
        self.assertAlmostEqual(result['physicalGKN'],result['RCVolumeM3']*25)
        self.assertLess(max(abs(v) for v in result['sourceSelfGAndFirstMomentResidualKN_KNm']),1e-10)
        self.assertFalse(result['newUpperRoofLOwnGIncluded']);self.assertTrue(result['DPCGapOwnGExcluded'])
        with self.assertRaises(ValueError):_add_lower_l_weight(model,{'unitWeightKNPerM3':25.})

    def test_ground_action_scope_preserves_solved_values_and_rejects_local_recovery_claim(self):
        row={'memberId':'GRID/example','end':1,'physicalPointMm':[100.,200.,-180.],
            'axialCompressionKN':-12.5,'bendingYKNm':3.25,'scope':'old physical-cut claim'}
        native={'native':{'adjacentGridMemberCuts':[copy.deepcopy(row)],'capCuts':[copy.deepcopy(row)],
            'memberCuts':[copy.deepcopy(row)],'heads':[{'id':'P1','reactionKN_KNm':[1,2,-3,4,5,6]}]},
            'additionalGroundCapCuts':[copy.deepcopy(row)]}
        before=copy.deepcopy(native);_label_ground_element_actions(native)
        for after,previous in ((native['native']['adjacentGridMemberCuts'],before['native']['adjacentGridMemberCuts']),
                (native['native']['capCuts'],before['native']['capCuts']),
                (native['additionalGroundCapCuts'],before['additionalGroundCapCuts'])):
            self.assertEqual([{k:v for k,v in item.items() if k not in ('scope','localDistributedLoadRecoveryQualified')} for item in after],
                [{k:v for k,v in item.items() if k!='scope'} for item in previous])
            self.assertFalse(after[0]['localDistributedLoadRecoveryQualified'])
            self.assertIn('Elastic element-end actions',after[0]['scope'])
            self.assertIn('not recovered distributed physical local cuts',after[0]['scope'])
        self.assertEqual(native['native']['memberCuts'],before['native']['memberCuts'])
        self.assertEqual(native['native']['heads'],before['native']['heads'])

    def test_frozen_proof_binds_actual_joined_sources_and_adverse_results(self):
        path=D/'masonry-frame-a-proof.json'
        self.assertTrue(path.exists(),'Fresh source-bound numerical proof required')
        proof=json.loads(path.read_text());self.assertEqual(len(self.source['identities']),49);self.assertEqual(proof['sourceSHA256'],self.source['identities'])
        self.assertEqual(proof['proofProducerSHA256'],hashlib.sha256((D/'masonry_frame_a_proof.py').read_bytes()).hexdigest())
        self.assertEqual(proof['executedCoupledCaseCount'],8)
        for case in proof['cases']:
            self.assertEqual(len(case['headWrenches']),52);self.assertEqual(len({r['id'] for r in case['headWrenches']}),52)
            self.assertLess(max(abs(v) for v in case['equilibriumResidualKN_KNm']),1e-6)
            self.assertFalse(case['candidateAccepted']);self.assertFalse(case['completeHouseProof'])
            self.assertAlmostEqual(math.fsum(row['reactionKN_KNm'][2] for row in case['headWrenches']),-case['externalWrenchKN_KNm'][2],places=6)
            self.assertEqual(case['executedRequest']['sourceSHA256'],proof['sourceSHA256'])
            self.assertEqual(len(case['physicalPlateParticipation']),18)
            for audit in case['physicalPlateParticipation'].values():
                self.assertTrue(audit['physicalTraceConfirmed']);self.assertTrue(audit['allCoefficientRowsUsedByPhysicalElements'])
                self.assertEqual(audit['createdScalarCoordinateCount'],0)
                self.assertGreater(audit['assembledTraceRowMaxAbs'],0);self.assertGreater(audit['condensedTraceRowMaxAbs'],0)
            self.assertAlmostEqual(case['mass']['joinedPhysicalGKN'],sum(case['mass'][key] for key in ('referenceStructuralShellPhysicalGKN','foundationPhysicalGKN','cornerClosurePhysicalGKN','lowerLPhysicalGKN','lowerCorePhysicalGKN','roofAddedPhysicalGKN')))
        self.assertLess(proof['cases'][0]['minimumHeadVerticalKN'],0)
        self.assertGreater(proof['cases'][1]['maximum52HeadComponentDeltaFromBaselineKN_KNm'],1e-6)
        self.assertAlmostEqual(proof['aperturePhysicalSelfGDeltaKN'],-.545)
        self.assertGreater(proof['roofRingStiffnessHeadDeltaKN_KNm'],1e-6)
        self.assertLess(proof['actualFullCaseReversalHeadDeltaKN_KNm'],1e-6)
        base,live,surface=proof['cases'][0],proof['cases'][5],proof['cases'][6]
        self.assertEqual(live['floorLiveLoad']['characteristicPressureKPa'],2)
        self.assertAlmostEqual(live['floorLiveLoad']['appliedQKN'],3*live['floorLiveLoad']['actualNetPlateAreaM2'])
        self.assertEqual(live['floorLiveLoad']['addedPhysicalMassKN'],0)
        self.assertFalse(live['floorLiveLoad']['legacyGrossGFlagRequired'])
        for changed,ledger,key in ((live,live['floorLiveLoad'],'appliedWrenchKN_KNm'),(surface,surface['roofCoupling']['roofSurfacePressure'],'pressureWrenchKN_KNm')):
            for a,b,c in zip(changed['externalWrenchKN_KNm'],base['externalWrenchKN_KNm'],ledger[key]):self.assertAlmostEqual(a-b,c,places=6)
            self.assertAlmostEqual(changed['mass']['joinedPhysicalGKN'],base['mass']['joinedPhysicalGKN'])
        self.assertEqual(surface['roofCoupling']['roofSurfacePressure']['request']['uniformKPa'],-2.25)
        self.assertEqual(len(surface['roofCoupling']['roofSurfacePressure']['origins']),108)
        baseline=proof['baseline'];self.assertEqual(baseline['nativeVertical']['sourceSHA256'],proof['sourceSHA256'])
        for key in ('adjacentGridMemberCuts','capCuts'):
            for row in baseline['nativeVertical']['native'][key]:
                self.assertFalse(row['localDistributedLoadRecoveryQualified'])
                self.assertIn('Elastic element-end actions',row['scope'])
        self.assertEqual(baseline['nativeVertical']['schema'],'str-masonry-frame-a-vertical-result/1')
        cut_heights=[row['physicalPointMm'][2] for row in baseline['nativeVertical']['native']['memberCuts'] if '/A-post/' in row['memberId']]
        for course in baseline['masonryCourses']:
            self.assertTrue(any(abs(z-course['westSeatXZMm'][1])<1e-8 for z in cut_heights),'Actual masonry seat needs its own finite post station')
        case=proof['authoredNumericalCase'];house=case['verticalCase']['monolithicCase']['houseCase'];depths=house['joinedCase']['geometry']
        full_beam_volume=3385*house['northUpstandWidthMm']*(depths['outerUpstandDepthMm']+depths['courtUpstandDepthMm'])/1e9
        shell=25*(baseline['geometry']['fourRCPostUnionVolumeM3']+full_beam_volume)+baseline['mass']['masonryPhysicalGKN']+baseline['mass']['newPlatePhysicalSelfGKN']
        self.assertAlmostEqual(shell,baseline['mass']['referenceStructuralShellPhysicalGKN'],places=8)
        self.assertEqual(baseline['lowerLWeight']['memberCount'],8)
        self.assertEqual(len(baseline['roofCoupling']['receivers']),18);self.assertEqual(len(baseline['roofCoupling']['ringDisplacements']),58)
        self.assertTrue(baseline['roofCoupling']['modeledSteelGravityIntegrated']);self.assertFalse(baseline['roofCoupling']['roofGravityIntegrated'])
        self.assertTrue(baseline['loadIntroduction']['retainedOriginalMemberEquivalentLoads'])
        self.assertFalse(baseline['loadIntroduction']['changedPostDistributedPressureRecoveryQualified'])


if __name__=='__main__':unittest.main()
