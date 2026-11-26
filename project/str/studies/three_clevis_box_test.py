"""One boxed family and actual monolithic geometry controls. No native solve."""
import copy,json,math,unittest
import three_clevis as a
import three_clevis_box as b
class BoxControls(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.c=json.loads(b.INPUT.read_bytes())
        cls.a,cls.base,cls.h,cls.grid,cls.furniture,cls.cage,cls.fc=a.load()
        cls.r=b.assess(cls.c,cls.a,cls.base,cls.h,cls.cage,cls.fc)
    def test_disjoint_plate_section_area_centroid(self):
        p=b.section(self.c['box'])
        self.assertEqual(p['areaMm2'],10500.)
        self.assertAlmostEqual(p['centroidFromInnerFaceMm'],397500/10500,places=10)
        self.assertGreater(p['IstrongMm4'],p['IweakMm4'])
        self.assertGreater(p['IweakMm4'],1e6)
    def test_closed_box_does_not_launder_pin_eccentricity(self):
        r=next(x for x in self.r['frictionScenarioSummary'] if x['mu']==.6)
        self.assertLess(r['boxVMMaxMPa'],300)
        self.assertGreater(r['pinVMIncludingSurfaceFrictionMaxMPa'],300)
        self.assertTrue(self.r['decision']['closedBoxCarriesSideFrictionInSectionAction'])
        self.assertTrue(self.r['decision']['sameD60PinFailsDevelopmentMu06WhenRealSurfaceFrictionCoupleIncluded'])
        self.assertFalse(self.r['decision']['boxedFamilyEarnsNewHouseSolve'])
    def test_pin_adverse_has_compressive_normal_reactions(self):
        row=max((x for x in self.r['simultaneousComponentScenarios'] if x['mu']==.6),key=lambda x:x['pin']['vonMisesMPa'])
        self.assertTrue(row['pin']['oneSidedAxialSlipHasCompressionOnlyNormalReactions'])
        self.assertGreater(row['pin']['eccentricAxialFrictionBendingNmm'],0)
        self.assertGreater(abs(row['localAppliedWrenchAtPinN_Nmm'][5]),0)
    def test_real_stacked_crossings_not_zero_diameter_waiver(self):
        p=self.r['matGeometry'];self.assertEqual(p['XLayerZMm'],[3229,3311])
        self.assertEqual(p['YLayerZMm'],[3246,3294])
        self.assertEqual(p['nominalTiedCrossingSurfaceGapMm'],0)
        self.assertFalse(p['independentCrossingLayerTranslationsAllowed'])
        lower=p['YLayerZMm'][0]-p['XLayerZMm'][0]-(18+16)/2
        self.assertEqual(lower,0)
        self.assertLess(lower-1,0) # real1mm intrusion remains collision
        self.assertEqual((p['YLayerZMm'][0]+5)-(p['XLayerZMm'][0]+5)-(18+16)/2,0)
        self.assertGreaterEqual(p['adverseInterMatParallelClearMm'],21)
        self.assertGreaterEqual(p['adverseIndependentParallelClearMm'],21)
    def test_centred_group_avoids_companion_root_plate(self):
        p=self.r['matGeometry']
        self.assertEqual(sum(x-912.5 for x in p['anchorAlongCoordinatesMm']),0)
        self.assertEqual(p['adverseAnchorToCompanionRootPlateGapMm'],11)
        bad=copy.deepcopy(self.c['box']);bad['anchorAlongOffsetsMm']=[(i-4)*50 for i in range(9)]
        self.assertLess(b.mat_geometry(bad,self.fc)['adverseAnchorToCompanionRootPlateGapMm'],0)
    def test_shared_root_union_deducts_real_overlap(self):
        p=self.r['placing'];z=self.c['box']
        independent=2*z['rootDistributionPlateWidthMm']*z['rootThicknessMm']*z['heightMm']
        self.assertEqual(independent-p['sharedRootSteelEnvelopeVolumeMm3'],304000.)
        self.assertTrue(p['commonRootIsOneDisjointSteelUnionNotTwoOverlappingSolids'])
        self.assertGreater(p['SWOrthogonalBoxCylinderEnvelopeAdverseGapMm'],0)
    def test_access_port_and_pin_extraction_have_real_reserve(self):
        p=self.r['placing']
        self.assertEqual(p['accessPortToInsideFrontClosureNominalGapMm'],5.)
        self.assertEqual(p['completePinExtractionBeyondBoxReserveMm'],15.)
        self.assertEqual(p['pinKeeperToCheekNominalGapMm'],25.)
        self.assertTrue(p['SWPinSouthExtractionWouldHitPerpendicular300Core'])
        self.assertEqual(p['SWNorthExtractionAndToolMaxYmm'],1367.5)
    def test_upstand_preserves_actual_levels_and_downstand_hits_ring(self):
        p=self.r['monolithicAlternative']
        self.assertEqual(p['perimeterOrdinaryBeamZMm'],[3170,3520])
        self.assertEqual(p['unchangedFIRSTMm'],3450)
        self.assertEqual(p['upstandAboveFinishedFloorMm'],70)
        self.assertEqual(p['roomwardPlinthProjectionBeyondActual140WallMm'],60)
        self.assertEqual(p['maximumActualRingCollisionMm'],45)
        self.assertTrue(p['existingCourt650Garden750UpstandsRetained'])
        self.assertFalse(p['otherThreeCornerJointsClosed'])
    def test_no_false_extra_pin_support_or_duplicate_steel(self):
        for field in ('independentOverlappingPlatesCredited','bearingTubeOrOuterFaceFalseExtraPinSupportCredited'):
            c=copy.deepcopy(self.c);c['box'][field]=True
            with self.assertRaises(ValueError):b.admit(c)
        c=copy.deepcopy(self.c);c['evidence']['houseAccepted']=True
        with self.assertRaises(ValueError):b.admit(c)
    def test_no_nonfinite_or_open_box(self):
        c=copy.deepcopy(self.c);c['box']['innerBearingFaceMm']=float('nan')
        with self.assertRaises(ValueError):b.admit(c)
        c=copy.deepcopy(self.c['box']);c['innerBearingFaceMm']=95
        with self.assertRaises(ValueError):b.section(c)
if __name__=='__main__':unittest.main(verbosity=2)
