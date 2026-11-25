"""Synthetic analytical mechanics controls; actual captures tested separately."""
import copy
import math
import unittest
from wet_post_head_fan import compression_fan,recover_wet_head_fans,cage_geometry_digest,cross,transport,pad_placement_domain


def fixture(unloaded=False):
    source={'project/fixture.py':'0'*64};g=0. if unloaded else 1.
    settings={'bearingQuadratureOrder':2,'padWidthMm':140.,'padLengthMm':100.,'combinedRelativePlacementToleranceMm':10.}
    request={'sourceSHA256':source,'wetSupport':settings,'bearingCase':{'masonryCase':{'verticalCase':{'monolithicCase':{'houseCase':{'boundary':{'physicalGFactor':g}}}}}}}
    native={'schema':'str-coupled-floor-section-result/1','sourceSHA256':source,'request':request,'candidateAccepted':False,'completeHouseProof':False,
      'nativeVertical':{'native':{'caseId':'SYNTHETIC-LOCAL-FAN'}},'seatedWetSupport':{'physicalAcceptance':False,'settings':settings,'posts':[],'contactFibres':[]}}
    links=[]
    for i,cx in enumerate((0.,500.)):
        post={'id':f'WET-SUPPORT/post/{i}','rectangleXYMm':[cx-130,-225,cx+130,225],'physicalTopZMm':1100.,'physicalBottomZMm':0.,
              'physicalGKN':1.,'padPhysicalGKN':1.,'padCentreXYMm':[cx,0.],'recovery':{'physicalEndWrenchesKN_KNmm':[0,0,12*g,0,0,0,0,0,-11*g,0,0,0]}}
        native['seatedWetSupport']['posts'].append(post)
        for k,(x,y) in enumerate(((-30.,-20.),(-30.,20.),(30.,-20.),(30.,20.))):
            native['seatedWetSupport']['contactFibres'].append({'id':f'contact/{i}/{k}','receiverIndex':i,'pointXYZMm':[cx+x,y,1110.],'normalCompressionKN':2.5*g})
        for j,z in enumerate((900.,1000.)):
            points=[[cx-79,-174,z],[cx+79,-174,z],[cx+79,174,z],[cx-79,174,z],[cx-79,-174,z]]
            links.append({'id':f'STR/WET-CAGE/post/{i}/link/{j}','kind':'post-link',
                          'parts':[{'kind':'line','points':[a,b]} for a,b in zip(points,points[1:])]})
    cage={'nativeSourceSHA256':source,'nativeCaseId':'SYNTHETIC-LOCAL-FAN','settings':{'linkDiameterMm':8.,'sourceSteelYieldMPa':500/1.15,'comparisonSteelFraction':.92,'sourcePoorBondMPa':2.1,'cageInstallationToleranceMm':5.,'linkFabricationToleranceMm':1.},'mainBars':[],'links':links}
    binding={'sourceSHA256':source,'request':copy.deepcopy(request),'nativeCaseId':'SYNTHETIC-LOCAL-FAN','cageGeometrySHA256':cage_geometry_digest(cage)}
    return native,cage,binding


class FanTest(unittest.TestCase):
    def test_shared_driver_rejects_path_edits_with_unchanged_saved_choices(self):
        from wet_post_head_fan_driver import recover_request
        from wet_support_cage_comparison import build_paths, comparison_settings
        from wet_support_cage_comparison_test import source_geometry
        wet,_=source_geometry();settings=comparison_settings()
        main,links=build_paths(wet,settings)
        native,cage,binding=fixture()
        # Only the geometry binding is exercised here; this is not a native
        # mechanics fixture. Actual native replay is a separate integration proof.
        native['seatedWetSupport']=wet
        cage.update(settings=settings,mainBars=main,links=links)
        for path in cage['links']:
            if path['id'].endswith('/link/30'):
                for part in path['parts']:
                    for point in part['points']:point[2]-=50
        result=recover_request({'schema':'str-wet-head-fan-request/1','native':native,'cage':cage,'binding':binding})['result']
        self.assertEqual(result['status'],'unsupported')
        self.assertEqual(result['diagnostics'][0]['code'],'FAN_CAGE_SOURCE_STALE')

    def test_cage_digest_binds_numeric_paths_across_javascript_json(self):
        _,cage,_=fixture();encoded=copy.deepcopy(cage)
        point=encoded['links'][0]['parts'][0]['points'][0]
        point[0]=int(point[0]);point[2]=int(point[2])
        self.assertEqual(cage_geometry_digest(cage),cage_geometry_digest(encoded))
        point[2]-=50
        self.assertNotEqual(cage_geometry_digest(cage),cage_geometry_digest(encoded))

    def test_central_point_analytic_force_and_four_ties(self):
        r=compression_fan([{'id':'point','xyMm':[0,0],'forceDownKN':8.}],[50.,100.],200.)
        self.assertEqual(r['status'],'computed-nominal-equilibrium')
        self.assertEqual(len(r['ties']),4)
        for t in r['ties']:self.assertAlmostEqual(t['forceKN'],8*(50 if t['axis']=='X' else 100)/(4*200))
        self.assertEqual(r['centreOfPressureMm'],[0.,0.]);self.assertEqual(r['freeBodyResidualKN_KNm'],[0.]*6)

    def test_eccentric_first_moments_and_independent_cross_product(self):
        r=compression_fan([{'id':'off-axis','xyMm':[20.,-30.],'forceDownKN':7.}],[50.,100.],160.)
        self.assertEqual(r['centreOfPressureMm'],[20.,-30.])
        force=[0,0,-7];oracle=cross([.02,-.03,0],force)
        for x,y in zip(r['inputHeadWrenchKN_KNm'][3:],oracle):self.assertAlmostEqual(x,y)
        self.assertLess(max(abs(x) for x in r['freeBodyResidualKN_KNm']),1e-12)
        self.assertAlmostEqual(sum(-n['incomingStrutForceKN'][2] for n in r['nodes']),7)
        a=transport([1,2,3,4,5,6],[100,200,300],[50,60,70])
        self.assertEqual(a[3:],[4+(.14*3-.23*2),5+(.23*1-.05*3),6+(.05*2-.14*1)])

    def test_depth_perturbation_recomputes_ties_without_changing_vertical_force(self):
        load=[{'id':'p','xyMm':[10,20],'forceDownKN':3}]
        a,b=[compression_fan(load,[50,100],h) for h in (100,200)]
        for x,y in zip(a['ties'],b['ties']):self.assertAlmostEqual(x['forceKN'],2*y['forceKN'])
        self.assertEqual(a['inputHeadWrenchKN_KNm'],b['inputHeadWrenchKN_KNm'])

    def test_body_gravity_counted_once_and_source_six_actions_recover(self):
        native,cage,binding=fixture();before=copy.deepcopy((native,cage,binding));r=recover_wet_head_fans(native,cage,binding)
        self.assertEqual(r['status'],'computed-nominal-demand')
        for p in r['posts']:
            self.assertAlmostEqual(p['postBodyGravityInTopZoneKN'],200/1100)
            self.assertAlmostEqual(p['transportedSourceSectionWrenchKN_KNm'][2],-11-200/1100)
            self.assertLess(max(abs(x) for x in p['bottomInterfaceSourceResidualKN_KNm']),1e-12)
            self.assertLess(max(abs(x) for x in p['sourceBaseResidualKN_KNm']),1e-12)
        self.assertEqual((native,cage,binding),before)

    def test_actual_source_placement_envelope_changes_without_force_or_acceptance_credit(self):
        native,cage,binding=fixture();before=copy.deepcopy((native,cage,binding))
        result=recover_wet_head_fans(native,cage,binding)
        domain=result['posts'][0]['necessaryPlacementDomain']
        self.assertEqual(domain['positiveFanDomainEnvelopeReserveXYMm'],[-7.,108.])
        self.assertFalse(domain['wholePadEnvelopeWithinVirtualDomain'])
        self.assertEqual((native,cage,binding),before)
        settings=copy.deepcopy(native['request']['wetSupport']);settings['padWidthMm']=120
        trial=pad_placement_domain(settings,cage['settings'],[0,0],[0,0],[79,174])
        self.assertEqual(trial['positiveFanDomainEnvelopeReserveXYMm'],[3.,108.])
        self.assertTrue(trial['wholePadEnvelopeWithinVirtualDomain'])
        self.assertFalse(trial['toleranceDomainAccepted']);self.assertFalse(trial['finiteCCTNodesAccepted'])
        self.assertFalse(trial['anchorageAccepted'])
        shifted=pad_placement_domain(settings,cage['settings'],[4,-2],[0,0],[79,174])
        self.assertEqual(shifted['positiveFanDomainEnvelopeReserveXYMm'],[-1.,106.])
        self.assertFalse(shifted['wholePadEnvelopeWithinVirtualDomain'])
        restored=pad_placement_domain(settings,cage['settings'],[0,0],[0,0],[79,174])
        self.assertEqual(restored,trial)
        with self.assertRaises((KeyError,ValueError)):
            pad_placement_domain(settings,{},[0,0],[0,0],[79,174])
        for bad in (-1,float('nan')):
            settings['combinedRelativePlacementToleranceMm']=bad
            with self.assertRaises(ValueError):pad_placement_domain(settings,cage['settings'],[0,0],[0,0],[79,174])

    def test_actual_140_extent_plus10_placement_and_220_extent_are_rejected_not_clipped(self):
        nominal=[{'id':'edge','xyMm':[70,0],'forceDownKN':1}]
        self.assertEqual(compression_fan(nominal,[79,174],172)['status'],'computed-nominal-equilibrium')
        for x in (80,110):
            r=compression_fan([{'id':'actual-edge','xyMm':[x,0],'forceDownKN':1}],[79,174],172)
            self.assertEqual(r['status'],'unsupported');self.assertEqual(r['diagnostics'][0]['code'],'FAN_NEGATIVE_WEIGHT_DOMAIN')
            self.assertEqual(r['outboardLoadIds'],['actual-edge']);self.assertNotIn('ties',r)

    def test_zero_g_has_null_centroid_and_no_invented_resistance(self):
        n,c,b=fixture(True);r=recover_wet_head_fans(n,c,b)
        self.assertEqual(r['status'],'computed-nominal-demand')
        for p in r['posts']:
            self.assertEqual(p['fan']['status'],'not-loaded-not-applicable');self.assertIsNone(p['fan']['centreOfPressureMm'])
        self.assertFalse(r['resistanceAccepted']);self.assertFalse(r['toleranceDomainAccepted'])

    def test_stale_source_request_cage_and_missing_contact_reject(self):
        for kind in ('source','request','cage','contact','body','head'):
            n,c,b=fixture()
            if kind=='source':n['sourceSHA256']={'project/fixture.py':'1'*64}
            elif kind=='request':n['request']['otherPhysicalChange']=1
            elif kind=='cage':c['links'][0]['parts'][0]['points'][0][0]+=1
            elif kind=='contact':n['seatedWetSupport']['contactFibres'].pop()
            elif kind=='body':n['seatedWetSupport']['posts'][0]['physicalGKN']=2
            else:n['seatedWetSupport']['posts'][0]['recovery']['physicalEndWrenchesKN_KNmm'][9]=1000
            r=recover_wet_head_fans(n,c,b)
            self.assertEqual(r['status'],'unsupported',kind)
        self.assertEqual(recover_wet_head_fans({}, {}, {})['status'],'unsupported')

    def test_missing_leg_negative_force_and_nonfinite_reject(self):
        for load in ([{'id':'tension','xyMm':[0,0],'forceDownKN':-.001}], [{'id':'invalid','xyMm':[math.nan,0],'forceDownKN':1}]):
            self.assertEqual(compression_fan(load,[79,174],172)['status'],'unsupported')
        n,c,b=fixture();c['links'][0]['parts'].pop();b['cageGeometrySHA256']=cage_geometry_digest(c)
        self.assertEqual(recover_wet_head_fans(n,c,b)['status'],'unsupported')


if __name__=='__main__':unittest.main()
