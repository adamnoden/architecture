"""Analytical geometry controls; native/action proof remains separate."""
import copy
import math
import unittest

from wet_beam_rectangular_return import rectangular_loop, source_cut_screens
from wet_support_cage_comparison import comparison_settings, beam_loop


class RectangularReturnTest(unittest.TestCase):
    def fixture(self):
        return {'beamWidthMm':250.,'beamDepthMm':350.,'beamAxisXMm':2902.5,
                'beamSouthEndYMm':8782.5,'beamNorthEndYMm':11737.5,'beamTopZMm':3370.},comparison_settings()

    def test_actual_rows_end_faces_complete_laps_and_ramp_are_preserved(self):
        g,s=self.fixture();before=copy.deepcopy((g,s))
        for index in (0,1):
            old=beam_loop(g,s,index);candidate=rectangular_loop(g,s,index,80)
            self.assertEqual(candidate['parts'][:4],old['parts'][:4])
            self.assertEqual(candidate['sourceTopAndBottomRowsZMm'],[3301.,3089.])
            self.assertEqual(candidate['southLowerStraightTangentYMm'],8897.5)
            self.assertEqual(candidate['northLowerStraightTangentYMm'],11622.5)
            self.assertEqual(candidate['lapIntervalYMm'],old['lapIntervalYMm'])
            self.assertEqual(candidate['coldBendRampIntervalYMm'],old['coldBendRampIntervalYMm'])
            points=[p for part in candidate['parts'] for p in part['points']]
            self.assertAlmostEqual(min(p[1] for p in points),8851.5)
            self.assertAlmostEqual(max(p[1] for p in points),11668.5)
            self.assertAlmostEqual(candidate['centrelineLengthUpperMm']-old['centrelineLengthUpperMm'],480-120*math.pi,places=9)
            self.assertFalse(candidate['bendPressureAccepted']);self.assertFalse(candidate['anchorageAccepted'])
        self.assertEqual((g,s),before)

    def test_mandrel_perturbation_changes_real_tangents_and_arcs_with_exact_restoration(self):
        g,s=self.fixture();baseline=rectangular_loop(g,s,0,80)
        revised=rectangular_loop(g,s,0,100)
        self.assertAlmostEqual(revised['southLowerStraightTangentYMm']-baseline['southLowerStraightTangentYMm'],10)
        self.assertNotEqual(revised['parts'],baseline['parts'])
        self.assertEqual(revised['sourceTopAndBottomRowsZMm'],baseline['sourceTopAndBottomRowsZMm'])
        self.assertEqual(rectangular_loop(g,s,0,80),baseline)
        for bad in (47,-1,float('nan'),300):
            with self.assertRaises(ValueError):rectangular_loop(g,s,0,bad)

    def source_fixture(self):
        g,s=self.fixture();main=[rectangular_loop(g,s,index,80) for index in (0,1)]
        row={'memberId':'WET-SUPPORT/beam/0','end':0,'physicalPointMm':[2902.5,9252.5,3195.],
             'breadthMm':250.,'depthMm':350.,'axialCompressionKN':-40.,'shearYKN':0.,'shearZKN':0.,
             'torsionKNm':0.,'bendingYKNm':0.,'bendingZKNm':0.}
        curved={**row,'physicalPointMm':[2902.5,8892.5,3195.]}
        native={'seatedWetSupport':{'settings':g,'posts':[{'padCentreXYMm':[2902.5,8892.5]}]},
                'nativeVertical':{'native':{'caseId':'SYNTHETIC-RECTANGULAR-END',
                    'memberCuts':[row,curved],'interiorMemberCuts':[]}}}
        return native,main,s

    def test_force_witness_never_crosses_the_missing_curved_bar_boundary(self):
        native,main,s=self.source_fixture();before=copy.deepcopy((native,main,s))
        result=source_cut_screens(native,main,s,80,cotangents=(1.,2.5))
        supported,curved=result['cuts']
        self.assertEqual(supported['equilibriumWitness']['maximumNecessaryTieTensionKN'],10.)
        self.assertLess(max(abs(x) for x in supported['equilibriumWitness']['normalAndTwoMomentResidualKN_KNm']),1e-12)
        for row in supported['comparisons']:
            self.assertEqual(row['declaredNominalForceComparisonKN'],10.)
            self.assertEqual(row['necessaryMandrelComparisonMm'],48.)
            self.assertFalse(row['bendPressureAccepted']);self.assertFalse(row['bondAndAnchorageAccepted'])
        self.assertEqual(curved['status'],'unsupported-curved-return-or-ramp')
        self.assertNotIn('comparisons',curved)
        self.assertEqual((native,main,s),before)
        self.assertFalse(result['beamEndDRegionAccepted'])

    def test_same_row_shear_and_torsion_additions_change_the_screen_without_assumed_yield(self):
        native,main,s=self.source_fixture()
        row=native['nativeVertical']['native']['memberCuts'][0]
        row.update(shearYKN=8.,shearZKN=12.,torsionKNm=2.)
        result=source_cut_screens(native,main,s,80,cotangents=(1.,2.))
        low,high=result['cuts'][0]['comparisons']
        self.assertEqual(low['orthogonalShearShiftPerTensionBarKN'],5.)
        self.assertAlmostEqual(high['thinCellTorsionPerCornerKN'],2*low['thinCellTorsionPerCornerKN'])
        self.assertAlmostEqual(high['declaredNominalForceComparisonKN']-10,2*(low['declaredNominalForceComparisonKN']-10))
        row.update(axialCompressionKN=-200.,shearYKN=0.,shearZKN=0.,torsionKNm=0.)
        bad=source_cut_screens(native,main,s,80,cotangents=(1.,2.5))['cuts'][0]['comparisons'][0]
        self.assertGreater(bad['necessaryMandrelComparisonMm'],180)
        self.assertFalse(bad['necessaryMandrelScreenPasses'])
        for cot in (0.,3.,float('nan')):
            with self.assertRaises(ValueError):source_cut_screens(native,main,s,80,cotangents=(cot,))
        row['depthMm']=351
        with self.assertRaisesRegex(ValueError,'same-case'):source_cut_screens(native,main,s,80,cotangents=(1.,2.5))


if __name__=='__main__':unittest.main()
