"""Bounded source, geometry, mechanics and adverse controls; no house solver."""
import copy,math,unittest
import three_clevis as t

class ClevisControls(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.c,cls.base,cls.h,cls.grid,cls.furniture,cls.cage,cls.floor=t.load()
        cls.r=t.assess(cls.c,cls.base,cls.cage,cls.floor)

    def test_actual_source_pressure_and_datums(self):
        self.assertEqual(self.base['slabZMm'],[3170,3370])
        self.assertEqual(self.base['firstFFLMm'],3450)
        self.assertAlmostEqual(max(self.base['maximumAbsoluteThreeConstraintForceKN']),94.581,places=9)
        self.assertEqual(self.r['screenNormalForceKN'],94.581*1.5)
        self.assertFalse(self.r['evidence']['nativeHouseSolved'])

    def test_dense_known_equilibrium_and_work(self):
        k=[[4.,-1.,0.],[-1.,4.,-1.],[0.,-1.,3.]]
        f=[2.,4.,7.];u=t.dense_solve(k,f)
        self.assertEqual(len(u),3)
        for a,b in zip([sum(a*b for a,b in zip(row,u)) for row in k],f):self.assertAlmostEqual(a,b,places=12)
        self.assertAlmostEqual(sum(u[i]*sum(k[i][j]*u[j] for j in range(3)) for i in range(3)),sum(a*b for a,b in zip(f,u)),places=10)
        with self.assertRaises(ValueError):t.dense_solve([[1.,1.],[1.,1.]],[1.,2.])

    def test_plate_without_contact_matches_hand_simply_supported_beam(self):
        p=100000.;b=95.;th=40.;e=200000.;kb=400000.
        r=t.plate_strip(p,b,th,e,kb,8250.,300.,contact=False)
        expected=p*160**3/(48*e*b*th**3/12)+p/(2*kb)
        self.assertAlmostEqual(r['centreDeflectionMm'],expected,places=10)
        self.assertAlmostEqual(r['perRodTensionN'],p/2,places=7)
        self.assertAlmostEqual(r['pryingRatio'],1.,places=12)
        self.assertAlmostEqual(r['maxElasticBendingMPa'],(p*160/4)/(b*th**2/6),places=7)

    def test_actual_prying_contact_force_and_work_close(self):
        r=t.plate_strip(100000.,95.,40.,200000.,374000.,8250.,300.)
        self.assertGreater(r['pryingRatio'],1.)
        self.assertGreater(r['perHalfContactCompressionN'],0.)
        self.assertLess(abs(r['forceResidualN']),1e-5)
        self.assertLess(abs(r['workResidualNmm']),1e-5)
        self.assertTrue(all(y>=80 for y in r['contactNodeYmm']))
        self.assertFalse(r['localModelQualified'])

    def test_n_to_kn_scaling_does_not_invent_work(self):
        a=t.plate_strip(1000.,95.,40.,200000.,374000.,8250.,300.)
        b=t.plate_strip(100000.,95.,40.,200000.,374000.,8250.,300.)
        self.assertAlmostEqual(b['perRodTensionN']/a['perRodTensionN'],100,places=7)
        self.assertAlmostEqual(b['twiceEnergyNmm']/a['twiceEnergyNmm'],10000,places=4)
        for ec in (0.,-1.,float('nan')):
            with self.assertRaises(ValueError):t.plate_strip(1000.,95.,40.,200000.,374000.,ec,300.)

    def test_preserve_200_cover_rejection_and_300_section_cost(self):
        p=self.r['placing']
        self.assertEqual(p['unchanged200RecessedPlateAdverseConcreteCoverMm'],0.)
        self.assertFalse(p['unchanged200RouteMeetsCover'])
        self.assertEqual(p['comparison300RecessedPlateAdverseConcreteCoverMm'],50.)
        self.assertTrue(p['comparison300RouteMeetsCover'])
        self.assertEqual(len(p['prospectiveOriginal16H12CoordinatesRelativeOuterCornerMm']),16)
        self.assertFalse(p['completeCageQualified'])

    def test_pin_diameter_failure_is_not_a_favourable_scaling(self):
        g=copy.deepcopy(self.c['geometry']);m=self.c['material']
        r=t.pin_screen(g,m,self.r['screenNormalForceKN']*1000)
        g['pinDiameterMm']=30
        self.assertLess(r['vonMisesMPa'],300)
        self.assertGreater(t.pin_screen(g,m,self.r['screenNormalForceKN']*1000)['vonMisesMPa'],1000)

    def test_shoulder_and_matched_axis_are_real_requirements(self):
        g,v=self.c['geometry'],copy.deepcopy(self.c['movement'])
        self.assertTrue(t.movement(g,v)['allSpecifiedTravelGeometricallyPossible'])
        self.assertFalse(t.movement(g,v)['unmatchedIndependent10MmAxisWouldFit'])
        v['commonPinAxisAlignmentMm']=10.
        self.assertFalse(t.movement(g,v)['allSpecifiedTravelGeometricallyPossible'])
        c=copy.deepcopy(self.c);c['movement']['shoulderPinClampsCheeks']=True
        with self.assertRaises(ValueError):t.admit(c)

    def test_slot_end_and_keeper_are_not_infinite_travel(self):
        g=copy.deepcopy(self.c['geometry'])
        g['slotHeightMm']=84
        self.assertLess(t.movement(g,self.c['movement'])['verticalReserveMm'],0)
        g=copy.deepcopy(self.c['geometry']);g['pinLengthMm']=150
        self.assertLess(t.movement(g,self.c['movement'])['keeperTravelReserveMm'],0)

    def test_rib_envelope_can_reject_the_unmeasured_cage(self):
        p=self.r['placing'];self.assertGreater(p['sourceH8MandrelAndRibEnvelopeCornerReserveMm'],0)
        c=copy.deepcopy(self.c);c['geometry']['linkExternalEnvelopeMm']=10
        self.assertLess(t.placing(c,self.cage,self.floor)['sourceH8MandrelAndRibEnvelopeCornerReserveMm'],0)

    def test_true_rod_link_interpenetration_rejects(self):
        c=copy.deepcopy(self.c);c['geometry']['westRodZMm'][0]=c['geometry']['westOldLinkZMm'][1]
        self.assertLess(t.placing(c,self.cage,self.floor)['rodToLinkCylinderAdverseClearMm'],0)
        self.assertGreater(self.r['placing']['rodToLinkCylinderAdverseClearMm'],0)

    def test_parallel_layers_keep_21mm_criterion(self):
        p=self.r['placing'];self.assertGreaterEqual(p['floorAnchorParallelAdverseClearMm'],21)
        self.assertGreaterEqual(self.r['floorLocalMat']['adverseInterMatParallelClearMm'],21)
        c=copy.deepcopy(self.c);c['geometry']['transverseMatExternalEnvelopeMm']=18
        g=c['geometry'];cover=self.floor['mainBarNominalCoverMm'];tol=self.floor['independentBarToleranceMm']
        gap=200-2*(cover+g['floorAnchorExternalEnvelopeMm']+g['transverseMatExternalEnvelopeMm']/2)-g['transverseMatExternalEnvelopeMm']-2*tol
        self.assertLess(gap,21)

    def test_seizure_is_not_bounded_by_coulomb_scenarios(self):
        self.assertGreater(self.r['seizure']['pinOnlyAdditionalVerticalYieldCapacityAtScreenHKN'],100)
        self.assertFalse(self.r['seizure']['globalLockedKeyForcesCalculated'])
        self.assertGreater(self.r['keeperM24PureAxialStressAtMu1MPa'],300)
        self.assertFalse(self.r['decisions']['wholeSeparatedHouseSolveFundedByThisScreen'])

    def test_real_side_force_and_sw_cylinders_are_not_waived(self):
        p=self.r['physicalRejections']
        self.assertEqual(p['twoIndependentSWNormalAnchorCylinderCrossingCount'],72)
        self.assertEqual(p['twoIndependentSWNormalAnchorCrossingClearMm'],-18)
        self.assertGreater(p['twoSWRootPlatesInterpenetrateMm3'],0)
        self.assertGreater(p['rawPressureMu06BestEqualShareCheekWeakAxisMPa'],300)
        self.assertTrue(self.r['decisions']['currentUnbracedFlatCheekFamilyRejectedAtMu06EvenEqualShare'])
        self.assertTrue(self.r['decisions']['currentSWTwoIndependentFloorAnchorDetailsRejected'])

    def test_actual_three_pockets_and_all_four_ground_footprints(self):
        p=t.physical_geometry(self.c,self.base,self.h,self.grid,self.furniture)
        self.assertTrue(p['fullNew140GravityFootprintsOnActualGrid'])
        self.assertEqual([r['comparisonCoreWidthMm'] for r in p['allFourCornerFootprints']],[300,200,300,200])
        self.assertGreater(p['SWTwoServicePocketsOverlapMm2'],0)
        self.assertGreater(p['rodNutToMovingCheekAdverseNormalGapMm'],0)
        self.assertGreater(p['coverToWallPlateAdverseVerticalGapMm'],0)
        self.assertGreater(p['movingBladeToNotchedSeatVerticalReserveMm'],0)
        self.assertEqual(p['NWToiletToPocketNominalGapMm'],17.)
        self.assertFalse(p['allServiceAndBodyRenewalSweepsQualified'])

    def test_no_nan_or_acceptance_injection(self):
        for kind in ('nan','approval'):
            c=copy.deepcopy(self.c)
            if kind=='nan':c['geometry']['pinDiameterMm']=float('nan')
            else:c['evidence']['physicalAccepted']=True
            with self.assertRaises(ValueError):t.admit(c)

if __name__=='__main__':unittest.main(verbosity=2)
