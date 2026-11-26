"""Meaningful geometry, origin, propagation and adverse L-node controls."""
import copy
import json
import os
from pathlib import Path
import unittest
import numpy as np
from current_l200_node import assess,compatible_section,controls,digest,node_transfer,section_geometry,read_capture

class ActualL200Node(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.summary=json.loads(Path(os.environ['STR_L200_SUMMARY']).read_text())
        cls.capture=read_capture(os.environ['STR_L200_CAPTURE'])
        cls.before=(digest(cls.summary),digest(cls.capture));cls.result=assess(cls.summary,cls.capture)
        cls.settings=controls();cls.geometry=section_geometry(cls.capture,cls.settings)

    def test_actual_all96_cases_have192_distinct_biaxial_witnesses(self):
        r=self.result
        self.assertEqual({(x['windIndex'],x['cut']) for x in r['sectionCases']},{(i,c) for i in range(96) for c in ('lower','upper')})
        self.assertTrue(r['allBiaxialCompatibleSectionWitnessesExist'])
        self.assertFalse(r['resistanceAccepted']);self.assertFalse(r['anchorageAccepted'])
        self.assertEqual(self.before,(digest(self.summary),digest(self.capture)))

    def test_pure_axial_rectangle_matches_linear_constitutive_solution(self):
        c=controls();area=200*1000.;bararea=np.pi*12**2/4
        g={'rectanglesXYMm':[[0.,0.,200.,1000.]],'centroidXYMm':[100.,500.],
           'barCoordinatesXYMm':[[50.,100.],[150.,100.],[50.,900.],[150.,900.]]}
        r=compatible_section(g,c,[100.,0.,0.])
        strain=100000/((area-4*bararea)*c['concreteCompressionMPa']/c['concretePlateauStrain']+4*bararea*c['steelModulusMPa'])
        self.assertAlmostEqual(r['maximumConcreteCompressionStrain'],strain,delta=1e-10)
        self.assertLess(r['equilibriumResidualKN_KNm'],1e-7)

    def test_global_translation_preserves_section_stresses(self):
        g=copy.deepcopy(self.geometry);shift=[13000.,-17000.]
        g['centroidXYMm']=[a+b for a,b in zip(g['centroidXYMm'],shift)]
        g['rectanglesXYMm']=[[r[i]+shift[i%2] for i in range(4)] for r in g['rectanglesXYMm']]
        g['barCoordinatesXYMm']=[[a+b for a,b in zip(p,shift)] for p in g['barCoordinatesXYMm']]
        target=[50.,54.,-35.]
        a=compatible_section(self.geometry,self.settings,target);b=compatible_section(g,self.settings,target)
        np.testing.assert_allclose(a['barStressesMPa'],b['barStressesMPa'],atol=1e-6,rtol=0)

    def test_quarter_turn_rotates_biaxial_moments(self):
        g=copy.deepcopy(self.geometry);cx,cy=g['centroidXYMm'];g['centroidXYMm']=[-cy,cx]
        g['rectanglesXYMm']=[[-r[3],r[0],-r[1],r[2]] for r in g['rectanglesXYMm']]
        g['barCoordinatesXYMm']=[[-y,x] for x,y in g['barCoordinatesXYMm']]
        a=compatible_section(self.geometry,self.settings,[50.,54.,-35.]);b=compatible_section(g,self.settings,[50.,35.,54.])
        np.testing.assert_allclose(a['barStressesMPa'],b['barStressesMPa'],atol=1e-6,rtol=0)

    def test_larger_bars_recompute_at_same_actual_demand(self):
        c=controls();c['barDiameterMm']=16.;g=section_geometry(self.capture,c)
        row=self.result['governingCompatibleSectionStress'];target=row['section']['demandN_Mx_MyKN_KNm']
        result=compatible_section(g,c,target)
        self.assertLess(result['maximumAbsoluteBarStressMPa'],row['section']['maximumAbsoluteBarStressMPa'])
        self.assertEqual(self.before,(digest(self.summary),digest(self.capture)))

    def test_extreme_biaxial_overload_has_no_accepted_witness(self):
        r=compatible_section(self.geometry,self.settings,[100.,1000.,-1000.])
        self.assertFalse(r['compatibleSectionWitnessExists'])

    def test_changed_geometry_source_and_missing_programme_reject(self):
        cap=copy.deepcopy(self.capture);cap['audit']['solidGeometry']['lowerLRectanglesXYMm'][0][2]+=1
        with self.assertRaisesRegex(ValueError,'L200 geometry'):section_geometry(cap,self.settings)
        s=copy.deepcopy(self.summary);s['sourceSHA256']['missing-source']='bad'
        with self.assertRaisesRegex(ValueError,'Same source'):assess(s,self.capture)
        s=copy.deepcopy(self.summary);s['cases'].pop()
        with self.assertRaisesRegex(ValueError,'actual96'):assess(s,self.capture)

    def test_material_strength_cannot_be_injected(self):
        c=controls();c['concreteCompressionMPa']=100
        with self.assertRaisesRegex(ValueError,'Material/cover'):assess(self.summary,self.capture,c)

    def test_wrench_transfer_retains_actual_cut_arm(self):
        lower=[10.,20.,30.,1.,2.,3.];upper=[-4.,5.,-20.,7.,8.,9.]
        g=self.capture['audit']['solidGeometry'];got=node_transfer(lower,upper,g)
        expected=[6.,25.,10.,1+.1*20+7-1.1*5,2-.1*10+8+1.1*(-4),12.]
        np.testing.assert_allclose(got,expected,atol=1e-12,rtol=0)

    def test_stripped_edge_detail_is_rejected_at_actual_chord_bound(self):
        for row in self.result['floorTrials']:
            self.assertFalse(row['straightFreeEdgeAnchoragePasses'])
            self.assertGreater(row['straightDevelopmentAtChordStressMm'],row['actualStraightWallWidthAvailableMm'])
        source=next(x for x in self.result['floorTrials'] if x['barDiameterMm']==16)
        self.assertFalse(source['twoHoopsFitInterMatWindow'])

    def test_actual_vertical_tail_alternative_records_concrete_failures(self):
        r=self.result['verticalTailTrial']
        self.assertTrue(r['allTailBondLengthsSufficient'])
        self.assertLess(r['minimumTailWallEndAdverseCoverMm'],self.settings['minimumCoverMm'])
        self.assertGreater(r['parallelPairsBelow21Mm'],0)
        self.assertFalse(r['candidateAccepted'])

    def test_governing_section_quadrature_refinement(self):
        row=self.result['governingCompatibleSectionStress'];target=row['section']['demandN_Mx_MyKN_KNm']
        fine=compatible_section(self.geometry,self.settings,target,pitch=12.5)
        self.assertLess(abs(fine['maximumAbsoluteBarStressMPa']-row['section']['maximumAbsoluteBarStressMPa']),.01*row['section']['maximumAbsoluteBarStressMPa'])
        self.assertTrue(fine['compatibleSectionWitnessExists'])

if __name__=='__main__':unittest.main()
