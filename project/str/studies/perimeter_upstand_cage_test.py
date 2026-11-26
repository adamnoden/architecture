"""Targeted exact-profile controls; no native house solve."""
import copy,json,math,unittest
import perimeter_upstand_cage as p
class CageControls(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.c=json.loads(p.INPUT.read_bytes());s,raw=p.source.load()
        cls.base,*_=p.source.derive(s,raw);cls.r=p.assess(cls.c,cls.base,full_geometry=True)
    def test_actual_levels_and_four_source_mirrors(self):
        self.assertEqual(self.r['geometry']['slabZMm'],[3170,3370])
        self.assertEqual(self.r['sourceCornerMirrors'][0]['outerFaceXYMm'],[262.5,262.5])
        self.assertEqual(len(self.r['sourceCornerMirrors']),4)
        self.assertFalse(self.r['newInnerMasonrySeatUsed'])
        self.assertFalse(self.r['nativeHouseSolveExecuted'])
    def test_exact_circle_box_distance_analytic_controls(self):
        self.assertAlmostEqual(p.arc_box_distance([0,0],10,0,math.pi/2,[15,0],0),5)
        self.assertAlmostEqual(p.arc_box_distance([0,0],10,0,math.pi/2,[15,0],2),3)
        self.assertAlmostEqual(p.arc_box_distance([0,0],10,0,math.pi/2,[10,0],2),0)
        self.assertAlmostEqual(p.arc_box_distance([0,0],10,0,math.pi/2,[-5,0],0),math.sqrt(125))
    def test_main_bar_routes_clear_real_column_holes(self):
        self.assertEqual(self.r['columnBarsNominalCount'],12)
        self.assertTrue(self.r['cornerMainBarHoleChecksPass'])
        self.assertGreater(self.r['beamColumnWitness']['adverseCylinderClearMm'],0)
        self.assertGreater(self.r['floorColumnWitness']['adverseProjectedCylinderClearMm'],0)
    def test_small_outer_ring_bend_is_an_actual_collision(self):
        c=copy.deepcopy(self.c);c['geometry']['beamPlanRadiiMm'][1]=89
        self.assertLess(p.assess(c,self.base)['beamColumnWitness']['adverseCylinderClearMm'],0)
    def test_finer_uniform_tail_rows_hit_the_column_bends(self):
        c=copy.deepcopy(self.c);c['geometry']['floorBarNominalMm']=12;c['geometry']['floorBarOutsideMm']=14
        c['geometry']['floorPitchMm']=45;c['geometry']['floorAlongCoordinatesMm']=list(range(315,901,45))
        self.assertLess(p.assess(c,self.base)['floorColumnWitness']['adverseProjectedCylinderClearMm'],0)
    def test_opposed_returns_are_real_connected_profiles(self):
        for bar in self.r['cornerFloorPaths']:
            for a,b in zip(bar['primitives'],bar['primitives'][1:]):
                self.assertLess(math.dist(p.sample_primitive(a)[-1],p.sample_primitive(b)[0]),1e-8)
        bottom=[x for x in self.r['cornerFloorPaths'] if '/bottom/' in x['id']]
        top=[x for x in self.r['cornerFloorPaths'] if '/top/' in x['id']]
        self.assertLess(max(x['verticalTailZMm'][1] for x in bottom),3170)
        self.assertGreater(min(x['verticalTailZMm'][0] for x in top),3370)
    def test_field_area_and_actual_parallel_clearances(self):
        b=self.r['materialBounds']
        self.assertLess(b['floorAreaMm2PerM'],b['legacyH16Per80AreaMm2PerM'])
        self.assertFalse(b['floorStockStrengthSelectedFromActualNewDemands'])
        self.assertGreaterEqual(self.r['parallelFloorBarAdverseClearMm'],21)
        self.assertGreaterEqual(self.r['interMatAdverseParallelClearMm'],21)
    def test_corner_bond_and_bend_are_not_only_drawn(self):
        b=self.r['materialBounds'];self.assertGreater(b['cornerStraightTailReserveMm'],0)
        self.assertGreater(b['cornerMandrelReserveMm'],0)
        c=copy.deepcopy(self.c);c['geometry']['cornerFloorMandrelMm']=160
        self.assertLess(p.material_bounds(c)['cornerMandrelReserveMm'],0)
    def test_actual_hook_rule_and_old160_failure_are_both_preserved(self):
        b=self.r['materialBounds'];x=next(x for x in b['ordinary350Anchorage'] if x['layer']=='X-top')
        self.assertEqual(x['straightAfterBendMm'],72)
        self.assertEqual(x['minimumStandardBendTailMm'],70)
        self.assertTrue(x['standardBendTailFits'])
        self.assertEqual(b['legacy160MandrelMinimumStraightTailMm'],62)
        self.assertFalse(b['legacy160MandrelFitsChosen5Phi'])
        self.assertTrue(b['current140FitsChosen5Phi'])
        self.assertEqual(b['prospective360MinimumStraightTailMm'],82)
        self.assertTrue(b['360GeometryIsAnUnselectedComparison'])
    def test_connected_closed_links_and_standard_hooks(self):
        links,levels=p.link_paths(self.c)
        self.assertGreater(len(links),30)
        for link in links:
            for a,b in zip(link['primitives'],link['primitives'][1:]):
                self.assertLess(math.dist(p.sample_primitive(a)[-1],p.sample_primitive(b)[0]),1e-7,link['id'])
        self.assertLessEqual(self.r['maximumColumnLinkFamilyPitchMm'],180)
        self.assertGreaterEqual(self.c['links']['columnHookTailMm'],50)
        self.assertLessEqual(self.r['maximumOrdinaryBeamStirrupPitchMm'],self.c['links']['beamOrdinaryPitchMm'])
    def test_parameter_box_certifier_keeps_real_adverse_witnesses(self):
        a=p.line([0,0,0],[10,0,0]);b=p.line([0,3,0],[10,3,0])
        self.assertEqual(p.certify_primitive_pair(a,b,2,0)['state'],'clear')
        bad=p.certify_primitive_pair(a,b,2,2)
        self.assertEqual(bad['state'],'collision')
        self.assertLess(bad['adverseSurfaceClearMm'],0)
        self.assertTrue(all(abs(v)<=2 for v in bad['relativeShiftMm']))
    def test_full_node_has_no_unclassified_bar_collisions(self):
        for key in ('beamFloorThreeDimensionalBoxAudit','linksAgainstBeamThreeDimensionalAudit','linksAgainstFloorThreeDimensionalAudit','ordinaryBeamLinksAgainstFloorAudit','allLinksAgainstEachOtherAudit','ordinaryFloorAgainstBeamAudit','allFloorProfilesAgainstEachOtherAudit'):
            self.assertTrue(self.r[key]['allCertified'],str((key,self.r[key]['failures'][:2])))
    def test_tied_contacts_still_reject_cylinder_intrusion(self):
        r=self.r['intendedLinkMainContacts']
        self.assertTrue(r['allNominalContactsNonpenetrating'],str(r['failures'][:2]))
        links,levels=p.link_paths(self.c)
        points=p.column_points(self.c);points[0]=[points[0][0]-5,points[0][1]-5]
        bad=p.intended_link_main_contact_audit(self.c,points,links,[])
        self.assertFalse(bad['allNominalContactsNonpenetrating'])
    def test_locked_normal_contact_is_explicit_and_not_a_waiver(self):
        self.assertGreater(self.r['linksAgainstBeamThreeDimensionalAudit']['lockedNormalContactCertificates'],0)
        self.assertGreater(self.r['allLinksAgainstEachOtherAudit']['lockedNormalContactCertificates'],0)
        for field in ('commonNodeJigRequired',):
            c=copy.deepcopy(self.c);c['geometry'][field]=False
            with self.assertRaises(ValueError):p.assess(c,self.base)
        c=copy.deepcopy(self.c);c['links']['matchedJointContactPlanesZMm']['crossTie']-=1
        with self.assertRaises(ValueError):p.assess(c,self.base)
    def test_matched_contact_certificate_rejects_actual_path_intrusion(self):
        links,_=p.link_paths(self.c)
        link=copy.deepcopy(next(x for x in links if x['id'].startswith('cross-tie/0/3274.5/')))
        for primitive in link['primitives']:
            if primitive['kind']=='line':
                for q in primitive['points']:q[2]-=1
            else:primitive['other']-=1
        bad=p.audit_path_groups([link],p.beam_paths(self.c),10,matched_contacts=True)
        self.assertFalse(bad['allCertified'])
        self.assertEqual(bad['lockedNormalContactCertificates'],0)
        self.assertTrue(any(x['state']=='collision' for x in bad['failures']))
    def test_cover_deducts_both_setting_allowances_and_rejects_old_65mm_row(self):
        self.assertTrue(self.r['externalConcreteCoverAudit']['allCheckedProfilesMeetMinimum'],str(self.r['externalConcreteCoverAudit']))
        self.assertGreaterEqual(self.r['externalConcreteCoverAudit']['worst']['adverseExternalConcreteCoverMm'],40)
        c=copy.deepcopy(self.c);c['geometry']['columnFaceRowsMm'][0]=65;c['geometry']['columnAlongStationsMm'][0]=65
        links,_=p.link_paths(c)
        bad=p.external_cover_audit(c,p.column_points(c),links,p.ordinary_beam_links(c))
        self.assertFalse(bad['allCheckedProfilesMeetMinimum'])
        self.assertAlmostEqual(bad['worst']['adverseExternalConcreteCoverMm'],24)
    def test_corner_returns_have_cover_to_actual_concrete_union(self):
        self.assertTrue(self.r['cornerFloorConcreteUnionCoverAudit']['allCertified'],str(self.r['cornerFloorConcreteUnionCoverAudit']))
        c=copy.deepcopy(self.c);c['geometry']['floorNominalSurfaceCoverMm']=49
        bad=p.corner_floor_surface_cover_audit(c,p.corner_floor_paths(c))
        self.assertFalse(bad['allCertified'])
        self.assertTrue(any(x['state']=='insufficient-cover' for x in bad['failures']))
    def test_aggregate_assumption_is_explicit_and_larger_stock_rejects(self):
        c=copy.deepcopy(self.c);c['materials']['maximumAggregateMm']=20
        with self.assertRaisesRegex(ValueError,'aggregate'):p.assess(c,self.base)
    def test_same_row_ordinary_upturns_really_interpenetrate_top_mat(self):
        c=copy.deepcopy(self.c)
        c['geometry']['ordinaryFloorAlongCoordinatesMm']['top']=c['geometry']['ordinaryFloorAlongCoordinatesMm']['bottom']
        bad=p.floor_floor_audit(c,p.ordinary_floor_paths(c))
        self.assertFalse(bad['allCertified'])
        self.assertTrue(any(x['state']=='collision' for x in bad['failures']))
    def test_actual_tied_mat_crossings_are_explicit(self):
        self.assertGreater(self.r['allFloorProfilesAgainstEachOtherAudit']['lockedMatContactCertificates'],0)
        c=copy.deepcopy(self.c);c['geometry']['crossedMatsRequireTiedNormalContact']=False
        with self.assertRaises(ValueError):p.floor_floor_audit(c,p.corner_floor_paths(c))
    def test_continuous_ring_bends_have_explicit_concrete_bearing_bounds(self):
        bounds=self.r['materialBounds']['continuousRingCornerBendBearingBounds']
        self.assertTrue(all(x['noCrossBarExemptionBearingStressCapMPa']>=400 for x in bounds))
        c=copy.deepcopy(self.c);c['geometry']['beamPlanRadiiMm'][0]=89
        self.assertLess(p.material_bounds(c)['continuousRingCornerBendBearingBounds'][0]['noCrossBarExemptionBearingStressCapMPa'],400)
    def test_shape_error_is_within_total_independent_allowance(self):
        c=copy.deepcopy(self.c);c['links']['hookShapeToleranceMm']=6
        with self.assertRaisesRegex(ValueError,'Forming'):p.assess(c,self.base)
    def test_generated_visual_is_valid_xml_from_same_geometry(self):
        root=p.ET.fromstring(p.draw(self.c,self.r))
        self.assertEqual(root.tag,'{http://www.w3.org/2000/svg}svg')
        self.assertEqual(root.attrib['viewBox'],'0 0 1500 1240')
    def test_no_complete_cage_or_demand_acceptance_injection(self):
        c=copy.deepcopy(self.c);c['scope']['wholeCagePlacingAccepted']=True
        with self.assertRaises(ValueError):p.assess(c,self.base)
        c=copy.deepcopy(self.c);c['geometry']['ordinaryBandDepthMm']=360
        with self.assertRaises(ValueError):p.assess(c,self.base)
if __name__=='__main__':unittest.main(verbosity=2)
