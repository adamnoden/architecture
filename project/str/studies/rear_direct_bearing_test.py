import copy
import math
import unittest
from unittest.mock import patch

from joined_successor_kernel import FrameModel,rectangle_section,cross
from rear_direct_bearing import DirectBearing,_joint_origin,_joint_gravity_adapter,verify_direct_joint_origins
from rear_bearing_plan import choices_defaults
from rc_floor_house_loads import _family_wrench


LAW={'elasticModulusMPa':8250.,'poissonRatio':.2,'flexuralFactor':1.,'torsionFactor':1.,'shearAreaFactor':5/6}


class PhysicalAdapterControls(unittest.TestCase):
    def model(self):
        frame=FrameModel();a=frame.node('grid/a',[2902.5,8500.,-405.]);b=frame.node('grid/b',[2902.5,12000.,-405.])
        frame.member('GRID/test',a,b,rectangle_section(600,450),LAW,y_axis=[0,0,1])
        members={'GRID/test':{'a':a,'b':b,'physicalStartMm':list(frame.nodes[a]),'physicalEndMm':list(frame.nodes[b]),
            'widthMm':600.,'heightMm':450.,'topZMm':-180.}}
        model={'model':frame,'grid':{'heads':[]},'families':{'physical-G':{}},'members':{},
            'request':{'frameLaw':copy.deepcopy(LAW),'gridLaw':copy.deepcopy(LAW)},
            'joinedFloor':{'floor':{'omissionsXYMm':[],'ports':[],'finiteBeamBoundaryReceivers':[]}}}
        plan={'axisXMm':2914.5,'wallRectangleXYMm':[2844.5,8627.5,2984.5,11737.5],
            'fullHeightTailRectanglesXYMm':[[2844.5,8627.5,2984.5,8900.],[2844.5,11150.,2984.5,11737.5]],
            'bearingRectanglesXYMm':[[2844.5,8900.,2984.5,9100.],[2844.5,10950.,2984.5,11150.]],
            'lintelRectangleXYMm':[2814.5,8900.,3014.5,11150.],'lintelTopZMm':3370.,
            'lintelBottomZMm':3070.,'masonryBearingTopZMm':3060.,'baseZMm':-180.,'floorSoffitZMm':3170.}
        return model,members,plan

    def built(self):
        model,members,plan=self.model();adapter=DirectBearing(choices_defaults(),plan,{'masonryModulusMPa':1000.,'jointNormalComplianceMmPerMPa':.01},20.)
        with patch('rear_direct_bearing.grid_member_geometry',return_value=members):adapter.build(model)
        return model,members,plan,adapter

    def test_independent_complete_new_material_g_and_first_moments(self):
        model,_,plan,_=self.built();data=model['rearDirectBearing']
        concrete=.2*.3*2.25*25;body=.14*.2*3.24*20*2;bedding=.14*.2*.01*20*2
        expected=[0,0,-(concrete+body+bedding),-(concrete+body+bedding)*10.025,(concrete+body+bedding)*2.9145,0]
        actual=_family_wrench(model,model['families']['physical-G'])
        for a,b in zip(actual,expected):self.assertAlmostEqual(a,b,places=9)
        self.assertAlmostEqual(data['lintelPhysicalGKN'],concrete,places=12)
        self.assertAlmostEqual(data['bearingBodyPhysicalGKN'],body,places=12)
        self.assertAlmostEqual(data['beddingPhysicalGKN'],bedding,places=12)

    def test_all_actual_body_and_contact_rows_have_rigid_work_duality(self):
        model,_,_,_=self.built();frame=model['model']
        for spring in frame.springs:
            for mode in range(6):
                value=0.
                for node,row in spring['terms']:
                    xyz=frame.nodes[node];omega=[float(mode==i+3) for i in range(3)]
                    t=[float(mode==i) for i in range(3)];r=cross(omega,xyz)
                    displacement=[*[a+b for a,b in zip(t,r)],*omega]
                    if node.startswith('LOWER-CORE/body-top/'):displacement=[0,0,displacement[2],0,0,0]
                    value+=sum(a*b for a,b in zip(row,displacement))
                self.assertLess(abs(value),2e-9,(spring['id'],mode,value))

    def test_no_masonry_bending_or_lateral_restraint_is_created(self):
        model,_,_,_=self.built();frame=model['model']
        self.assertTrue(all(n.startswith('REAR-LINTEL/') or n=='GRID/test' for n,*_ in frame.members))
        self.assertTrue(all(n.startswith('LOWER-CORE/body-top/REAR-BEARING/') and axis in (0,1,3,4,5) for n,axis in frame.fixed))
        self.assertEqual(len(model['rearDirectBearing']['bearingBodies']),32)
        self.assertEqual(len(frame.springs),64)
        self.assertTrue(all(s['mode']==('compression' if s['id'].endswith('/top') else 'bilateral') for s in frame.springs))
        self.assertTrue(all(s['gap']==0 for s in frame.springs))

    def test_bearing_quadrature_uses_real_beam_point_traces_without_structural_nodes(self):
        model,_,plan,_=self.built();stations=model['seatedWetSupport']['receiver']['stations']
        self.assertEqual(len(stations),6)
        for row in model['rearDirectBearing']['bearingBodies']:
            member=model['members'][row['upperMemberId']]
            self.assertLessEqual(member['physicalEndMm'][1]-member['physicalStartMm'][1],500.)
            self.assertLessEqual(member['physicalStartMm'][1],row['xyMm'][1])
            self.assertGreaterEqual(member['physicalEndMm'][1],row['xyMm'][1])
            self.assertEqual(row['upperPointXYZMm'],[*row['xyMm'],plan['lintelBottomZMm']])
            self.assertNotIn(row['xyMm'][1],[s['u'] for s in stations])
            self.assertEqual(len(row['upperTerms']),2)
        with self.assertRaisesRegex(ValueError,'twice'):
            DirectBearing(choices_defaults(),self.model()[2],{'masonryModulusMPa':1000.,'jointNormalComplianceMmPerMPa':.01},20.).build(model)

    def test_contact_quadrature_does_not_refine_beam_or_membrane_ports(self):
        model,members,plan=self.model()
        settings={**choices_defaults(),'bearingQuadratureOrder':8}
        with patch('rear_direct_bearing.grid_member_geometry',return_value=members):
            DirectBearing(settings,plan,{'masonryModulusMPa':1000.,'jointNormalComplianceMmPerMPa':.01},20.).build(model)
        self.assertEqual(len(model['rearDirectBearing']['bearingBodies']),128)
        self.assertEqual(len(model['seatedWetSupport']['receiver']['stations']),6)
        self.assertEqual(len(model['joinedFloor']['floor']['ports']),6)
        self.assertTrue(model['rearDirectBearing']['pointTraceRepresentation']['quadratureCannotAddStructuralNodes'])

    def test_old_wet_rc_and_overlapping_source_masonry_replaced_once(self):
        _,_,p,adapter=self.built()
        cores=[{'id':'old/rc','sourceWallId':'wet-south','materialKind':'source-RC-column','rectangleXYMm':[2772.5,8627.5,3032.5,9077.5]},
            {'id':'old/masonry','sourceWallId':'protected-stair-east','materialKind':'source-core-material-unqualified','rectangleXYMm':[2844.5,8500.,2944.5,8949.5]},
            {'id':'other/rc','sourceWallId':'stair-mid-post','materialKind':'source-RC-column','rectangleXYMm':[2817.5,7132.5,3067.5,7382.5]}]
        out=adapter.cores(cores,{})
        self.assertNotIn('old/rc',[r['id'] for r in out]);self.assertIn(cores[2],out)
        other=next(r for r in out if r['sourceWallId']=='protected-stair-east')
        self.assertEqual(other['rectangleXYMm'],[2844.5,8500.,2944.5,8627.5])
        self.assertEqual([r['rectangleXYMm'] for r in out if r['sourceWallId']=='rear-direct-bearing'],p['fullHeightTailRectanglesXYMm'])

    def test_missing_real_ground_coverage_rejects(self):
        model,members,p=self.model();members['GRID/test']['widthMm']=80.
        adapter=DirectBearing(choices_defaults(),p,{'masonryModulusMPa':1000.,'jointNormalComplianceMmPerMPa':.01},20.)
        with patch('rear_direct_bearing.grid_member_geometry',return_value=members):
            with self.assertRaisesRegex(ValueError,'unsupported finite'):adapter.build(model)

    def test_transverse_source_wall_t_is_not_double_counted_below_lintel(self):
        model,members,p=self.model()
        old={'id':'transverse','sourceWallId':'rear-west','materialKind':'source-core-material-unqualified',
            'rectangleXYMm':[0.,8782.5,3100.,8922.5]}
        adapter=DirectBearing(choices_defaults(),p,{'masonryModulusMPa':1000.,'jointNormalComplianceMmPerMPa':.01},20.,[old])
        self.assertEqual(sorted(adapter.wings),[[2814.5,8900.,2844.5,8922.5],[2984.5,8900.,3014.5,8922.5]])
        cores=adapter.cores([old],model)
        self.assertFalse(any(r['rectangleXYMm'][0]<2829.5<r['rectangleXYMm'][2] and
            r['rectangleXYMm'][1]<8910<r['rectangleXYMm'][3] for r in cores))
        with patch('rear_direct_bearing.grid_member_geometry',return_value=members):adapter.build(model)
        # Two retained30x22.5mm source wings, only3240mm high below bedding.
        self.assertAlmostEqual(model['rearDirectBearing']['bearingBodyPhysicalGKN'],
            .14*.2*3.24*20*2+2*.03*.0225*3.24*20,places=12)


class DirectJointOriginControls(unittest.TestCase):
    def actual(self):
        from vertical_rc_floor import grid_vertical_point_terms
        frame=FrameModel();frame.node('P47',[2942.5,8852.5,-405.])
        member={'a':'P47','b':'P47','physicalStartMm':[2902.5,8852.5,-405.],
            'physicalEndMm':[2942.5,8852.5,-405.],'widthMm':600.,'heightMm':450.,'topZMm':-180.}
        model={'model':frame,'request':{'gridLaw':LAW},'grid':{'heads':[]},
            'rearDirectJointOrigins':{'members':{'GRID/rear-W/1':member},'origins':[],'adapters':{}}}
        point=[2903.5414776630446,8824.449194352357];force=-.0024223524305555548
        route=grid_vertical_point_terms(model,{'GRID/rear-W/1':member},point);actual={}
        for n,row in route['terms']:
            total=actual.setdefault(n,[0.]*6)
            for i,v in enumerate(row):total[i]+=force*v
        self.assertEqual([n for n,row in route['terms']],['P47','P47'])
        _joint_origin(model,'GRID/rear-W/1','body-G','lower-core/base-G',point,force,actual,'physical-G')
        expected=[{'id':'body-G','memberId':'GRID/rear-W/1','centroidXYMm':point,'physicalDownKN':-force}]
        _joint_gravity_adapter(model,'lower-core/base-G',expected)
        return model['rearDirectJointOrigins'],expected

    def test_two_actual_end_maps_coalesce_once_on_existing_master(self):
        ledger,_=self.actual();result=verify_direct_joint_origins(ledger,1.35)
        self.assertEqual(set(result),{'P47'})
        self.assertAlmostEqual(result['P47']['actualNodalWrenchKN_KNmm'][2],-.0024223524305555548*1.35,places=15)
        self.assertLess(max(map(abs,result['P47']['sixComponentWorkClosureKN_KNmm'])),1e-12)

    def test_omitted_or_doubled_actual_joint_nodal_load_cannot_pass(self):
        ledger,_=self.actual()
        for factor in (0.,2.):
            bad=copy.deepcopy(ledger);bad['origins'][0]['actualNodalWrenchKN_KNmm'][2]*=factor
            with self.assertRaisesRegex(ValueError,'omission/double count'):verify_direct_joint_origins(bad,1.35)

    def test_missing_duplicated_or_moved_source_origin_cannot_pass(self):
        ledger,expected=self.actual()
        for origins in ([],ledger['origins']*2):
            model={'rearDirectJointOrigins':{'members':ledger['members'],'origins':origins,'adapters':{}}}
            with self.assertRaisesRegex(ValueError,'Missing or duplicated'):_joint_gravity_adapter(model,'lower-core/base-G',expected)
        bad=copy.deepcopy(ledger);bad['origins'][0]['receiverPointXYZMm'][0]+=100
        with self.assertRaisesRegex(ValueError,'work mismatch'):verify_direct_joint_origins(bad,1.35)


if __name__=='__main__':unittest.main()
