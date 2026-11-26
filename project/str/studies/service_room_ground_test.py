import copy,unittest
from unittest.mock import patch
import numpy as np
from service_room_ground import body_geometry,stock_wrench,element_energy,partition_contact,plate_trace,settings,distinct_bodies
from vertical_floor_plate import mitc4_element
from joined_successor_kernel import FrameModel,rectangle_section
from service_room_ground import install

class GroundPocketControls(unittest.TestCase):
    body={'id':'CONTROL','rcRectangleXYMm':[100,200,1100,1200],'rcZMm':[-30,170],'rcUnitWeightKNPerM3':25,'mineralZMm':[-180,-30],'mineralUnitWeightKNPerM3':20,'disjointContactRectanglesXYMm':[[100,200,300,1200]]}
    law={'elasticModulusMPa':33000,'poissonRatio':.2,'thicknessMm':200,'flexuralFactor':1,'shearFactor':5/6,'unitWeightKNPerM3':25}
    def test_independent_force_density_volume_and_global_wrench_without_kg_conversion(self):
        rows,w=stock_wrench(body_geometry(self.body))
        np.testing.assert_allclose(w,[0,0,-5.6,-3.92,3.12,0],atol=1e-12)
        self.assertAlmostEqual(rows[0]['physicalGKN'],5)
        self.assertAlmostEqual(rows[1]['physicalGKN'],.6)
        changed=copy.deepcopy(self.body);changed['rcUnitWeightKNPerM3']=30
        self.assertAlmostEqual(stock_wrench(body_geometry(changed))[1][2],-6.6)

    def test_physical_plate_rigid_planes_units_and_exact_full_energy(self):
        for r in [[0,0,250,250],[0,0,75,350]]:
            k,unit=mitc4_element(r,self.law);modes,error=element_energy(k)
            self.assertEqual(modes.shape,(9,12));self.assertLess(error,1e-9)
            a,b,c,d=r;points=[(a,b),(c,b),(c,d),(a,d)]
            for dz,rx,ry in [(1,0,0),(0,1,0),(0,0,1)]:
                q=np.array([v for x,y in points for v in [dz+rx*y-ry*x,rx,ry]])
                self.assertLess(float(abs(np.asarray(k) @ q).max()),1e-6)
            q=np.sin(np.arange(12))*.0001
            self.assertAlmostEqual(float(q @ np.asarray(k) @ q),float((modes @ q) @ (modes @ q)),places=10)
            self.assertAlmostEqual(sum(unit[::3]),(c-a)*(d-b))
            twice=mitc4_element(r,{**self.law,'elasticModulusMPa':66000})[0]
            np.testing.assert_allclose(twice,2*np.asarray(k),atol=1e-10)

    def test_exact_footprint_coverage_not_a_sampled_or_nearest_support_pass(self):
        cells=partition_contact([0,0,1000,100],[[0,0,500,100],[500,0,1000,100]],137)
        self.assertAlmostEqual(sum((c-a)*(d-b) for a,b,c,d in cells),100000)
        with self.assertRaisesRegex(ValueError,'uncovered'):partition_contact([0,0,1000,100],[[0,0,499,100],[501,0,1000,100]],500)

    def test_bilinear_vertical_trace_preserves_virtual_work_and_rigid_plane(self):
        points={(0,0):'a',(1000,0):'b',(1000,800):'c',(0,800):'d'}
        terms=plate_trace(points,[[0,0,1000,800]],237,419)
        for dz,rx,ry in [(1,0,0),(0,.003,0),(0,0,-.002)]:
            values={node:dz+rx*y-ry*x for (x,y),node in points.items()}
            self.assertAlmostEqual(sum(row[2]*values[node] for node,row in terms),dz+rx*419-ry*237)
        with self.assertRaisesRegex(ValueError,'No physical plate'):plate_trace(points,[[0,0,1000,800]],1001,419)

    def test_adverse_geometry_rejects_overlap_empty_contacts_and_hidden_translation(self):
        for edit in [{'rcZMm':[-560,-360]},{'disjointContactRectanglesXYMm':[]},{'disjointContactRectanglesXYMm':[[99,200,300,1200]]},{'disjointContactRectanglesXYMm':[[100,200,300,1200],[100,200,300,1200]]}]:
            with self.assertRaises(ValueError):body_geometry({**self.body,**edit})
        for bodies in [[],[self.body,self.body],[self.body,{**self.body,'id':'OTHER'}]]:
            with self.assertRaises(ValueError):distinct_bodies(bodies)

    def test_notched_union_owns_stock_mesh_and_contact_without_bounding_box_fallback(self):
        from vertical_floor_plate import plate_cells
        body={**self.body,'rcRectangleXYMm':[0,0,1000,1000],'rcPlanRectanglesXYMm':[[0,0,800,1000],[800,200,1000,1000]],'disjointContactRectanglesXYMm':[[0,0,200,1000]]}
        actual=body_geometry(body);rows,w=stock_wrench(actual)
        np.testing.assert_allclose(w,[0,0,-5.4,-2.78,2.38,0],atol=1e-12)
        self.assertEqual(len(rows),3)
        cells,_=plate_cells(actual['rcPlanRectanglesXYMm'],[],300)
        self.assertAlmostEqual(sum((r[2]-r[0])*(r[3]-r[1]) for r in cells),960000)
        self.assertTrue(all(not (r[0]<1000 and r[2]>800 and r[1]<200 and r[3]>0) for r in cells))
        for edit in [{'disjointContactRectanglesXYMm':[[850,0,900,100]]},{'rcPlanRectanglesXYMm':[[0,0,800,1000],[700,200,1000,1000]]},{'rcPlanRectanglesXYMm':[[0,0,800,1000]]}]:
            with self.assertRaises(ValueError):body_geometry({**body,**edit})
        with self.assertRaises(ValueError):body_geometry({**self.body,'rcRectangleIsEnvelopeOnly':True})

    def test_open_top_contact_keeps_all_mineral_own_weight_at_actual_grid(self):
        frame=FrameModel();a=frame.node('a',[0,150,-480]);b=frame.node('b',[1000,150,-480])
        law={'elasticModulusMPa':33000,'poissonRatio':.2,'flexuralFactor':1,'shearAreaFactor':5/6,'torsionFactor':1}
        frame.member('GRID/control',a,b,rectangle_section(300,600),law)
        for node in [a,b]:
            for axis in range(6):frame.fixed[node,axis]=0.
        member={'GRID/control':{'a':a,'b':b,'physicalStartMm':[0,150,-480],'physicalEndMm':[1000,150,-480],'widthMm':300,'heightMm':600,'topZMm':-180}}
        model={'model':frame,'families':{'physical-G':{}},'request':{'gridLaw':law},'grid':{'heads':[]}}
        body={**self.body,'rcRectangleXYMm':[100,50,200,250],'disjointContactRectanglesXYMm':[[100,50,200,250]]}
        choice={'enabled':True,'platePitchMm':500,'contactPitchMm':500,'plateLaw':{k:self.law[k] for k in ['elasticModulusMPa','poissonRatio','flexuralFactor','shearFactor']},'mineralModulusMPa':1000,'jointComplianceMmPerMPa':.1}
        # Only the source-geometry catalogue is a bounded unit fixture. The
        # finite beam trace and both solvers' physical spring laws are real.
        with patch('service_room_ground.grid_member_geometry',return_value=member):installed=install(model,[body],choice)
        for node in frame.nodes:
            if '/plate-node/' in node:
                frame.fixed[node,2]=10.;frame.fixed[node,3]=0.;frame.fixed[node,4]=0.
        for node,row in model['families']['physical-G'].items():frame.load(node,row)
        raw=frame.solve();states={s['id']:s for s in raw['springs']}
        fibres=installed['bodies'][0]['fibres'];base=0.
        for f in fibres:
            self.assertFalse(states[f['id']+'/top']['active'])
            self.assertAlmostEqual(states[f['id']+'/top']['forceKN'],0)
            base+=-states[f['id']+'/body']['forceKN']+f['serialLaw']['bodyPhysicalGKN']/2
        self.assertAlmostEqual(base,.06,places=10)
        self.assertAlmostEqual(sum(raw['supportWrenches'][n][2] for n in [a,b]),.06,places=10)
        self.assertAlmostEqual(-sum(row[2] for row in model['families']['physical-G'].values()),.16,places=10)

    def test_installed_tiny_contact_uses_existing_reversible_scalar_class(self):
        from vertical_floor_numerics import solve_vertical_frame
        def specimen(width,scaled):
            frame=FrameModel();a=frame.node('a',[0,150,-480]);b=frame.node('b',[1000,150,-480])
            law={'elasticModulusMPa':33000,'poissonRatio':.2,'flexuralFactor':1,'shearAreaFactor':5/6,'torsionFactor':1}
            frame.member('GRID/control',a,b,rectangle_section(300,600),law)
            for node in [a,b]:
                for axis in range(6):frame.fixed[node,axis]=0.
            member={'GRID/control':{'a':a,'b':b,'physicalStartMm':[0,150,-480],'physicalEndMm':[1000,150,-480],'widthMm':300,'heightMm':600,'topZMm':-180}}
            model={'model':frame,'families':{'physical-G':{}},'request':{'gridLaw':law},'grid':{'heads':[]}}
            body={**self.body,'rcRectangleXYMm':[100,50,200,250],'disjointContactRectanglesXYMm':[[100,50,100+width,250]]}
            choice={'enabled':True,'platePitchMm':500,'contactPitchMm':500,'plateLaw':{k:self.law[k] for k in ['elasticModulusMPa','poissonRatio','flexuralFactor','shearFactor']},'mineralModulusMPa':1000,'jointComplianceMmPerMPa':.1}
            with patch('service_room_ground.grid_member_geometry',return_value=member):installed=install(model,[body],choice)
            for node in frame.nodes:
                if '/plate-node/' in node:
                    for axis in (2,3,4):frame.fixed[node,axis]=0.
            for node,row in model['families']['physical-G'].items():frame.load(node,row)
            if not scaled:frame.internalScalarCoordinateScales={}
            vertical={'ports':[{}],'portTerms':[[('a',[0,0,1,0,0,0])]],'operator':{'condensedStiffness':[[0.]]}}
            return solve_vertical_frame(frame,vertical),installed
        ordinary,_=specimen(100,True);unscaled,_=specimen(100,False)
        for node,row in ordinary['displacements'].items():np.testing.assert_allclose(row,unscaled['displacements'][node],atol=1e-12,rtol=1e-12)
        tiny,installed=specimen(1e-10,True)
        with self.assertRaisesRegex(ValueError,'Singular/unrestrained'):specimen(1e-10,False)
        for fibre in installed['bodies'][0]['fibres']:
            self.assertAlmostEqual(tiny['displacements'][fibre['bodyNode']][2],-fibre['serialLaw']['freeTopSelfShorteningMm'],places=12)
            self.assertFalse(next(s for s in tiny['springs'] if s['id']==fibre['id']+'/top')['active'])
        expected=stock_wrench(installed['bodies'][0]['geometry'])[0][1]['physicalGKN']
        self.assertAlmostEqual(sum(tiny['supportWrenches'][n][2] for n in ['a','b']),expected,places=20)

if __name__=='__main__':unittest.main()
