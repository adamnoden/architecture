import copy
import math
import unittest
from perimeter_upstand import (settings_defaults,read_settings,subtract_boxes,
    union_boxes,volume,wrench_of_weight,section_properties,rigid_point_trace,
    geometry_from_model)


def built_model_fixture(north_width=290.):
    # Explicit analytical fixture, not a captured house or physical proof.
    corners={}
    base=[[262.5,262.5,1262.5,562.5],[262.5,562.5,562.5,1262.5]]
    for name,sx,sy in [('SW',1,1),('SE',-1,1),('NW',1,-1),('NE',-1,-1)]:
        rects=[]
        for r in base:
            a=[r[0] if sx==1 else 12000-r[2],r[1] if sy==1 else 12000-r[3]]
            b=[r[2] if sx==1 else 12000-r[0],r[3] if sy==1 else 12000-r[1]]
            rects.append(a+b)
        corners[name]={'id':name,'rectangles':rects}
    members={};walls={}
    for wall,y,depth in [('outer-north',11667.5,750.),('court-north',7332.5,650.)]:
        walls[wall]={}
        members[wall+'/upstand/0']={'kind':'upstand','physicalStartMm':[4307.5,y,3170+depth/2],
            'physicalEndMm':[7692.5,y,3170+depth/2],'breadthMm':north_width,'depthMm':depth}
    return {'model':object(),'joinedFloor':{'corners':list(corners.values())},
        'houseLoadCase':{'joinedCase':{'floor':{'cornerWidthsMm':dict.fromkeys(corners,300.)}}},
        'wallFrames':walls,'members':members}


class PerimeterTests(unittest.TestCase):
    def test_settings_strict(self):
        self.assertEqual(read_settings(settings_defaults())['widthMm'],300)
        for patch in ({'unknown':0},{'widthMm':True},{'depthMm':float('nan')},{'wind':'catalogue0-is-gravity'},{'execution':'accepted'}):
            with self.assertRaises(ValueError):read_settings({**settings_defaults(),**patch})

    def test_material_partition_exact_oracle(self):
        boxes=[[0,0,0,4,4,4],[2,2,2,6,6,6]]
        out=union_boxes(boxes)
        self.assertEqual(volume(out),120/1e9)
        self.assertEqual(sum(1 for x in range(6) for y in range(6) for z in range(6)
            if any(all(b[i]<=p<b[i+3] for i,p in enumerate((x+.5,y+.5,z+.5))) for b in out)),120)
        for i,a in enumerate(out):
            for b in out[i+1:]:
                self.assertTrue(any(min(a[j+3],b[j+3])<=max(a[j],b[j]) for j in range(3)))
        self.assertEqual(subtract_boxes(out,boxes),[])

    def test_six_action_work_dual(self):
        origin=[100.,200.,3270.];point=[150.,240.,3345.]
        force=[2.,-3.,4.];moment=[7.,11.,-13.];omega=[.02,-.03,.01];u=[.4,-.7,.2]
        d=[point[i]-origin[i] for i in range(3)]
        at=[u[0]+omega[1]*d[2]-omega[2]*d[1],
            u[1]+omega[2]*d[0]-omega[0]*d[2],
            u[2]+omega[0]*d[1]-omega[1]*d[0]]
        mapped=rigid_point_trace(origin,point,force,moment)
        self.assertAlmostEqual(sum(a*b for a,b in zip(at+omega,force+moment)),
                               sum(a*b for a,b in zip(u+omega,mapped)),places=12)
        self.assertNotEqual(mapped[3:],moment)

    def test_real_composite_section_not_sum_torsions(self):
        b=300.;d=350.;base=200.;rib=d-base
        actual=section_properties(b,d)
        centroid=(b*base*base/2+b*rib*(base+rib/2))/(b*d)
        iy=b*base**3/12+b*base*(base/2-centroid)**2
        iy+=b*rib**3/12+b*rib*(base+rib/2-centroid)**2
        self.assertAlmostEqual(centroid,d/2)
        self.assertAlmostEqual(actual['Iy'],iy)
        self.assertNotAlmostEqual(actual['J'],section_properties(b,base)['J']+section_properties(b,rib)['J'])
        self.assertGreater(actual['J'],0)

    def test_actual_north_width_no_assumption(self):
        g=geometry_from_model(built_model_fixture(),settings_defaults())
        self.assertEqual({m['breadthMm'] for m in g['retainedNorthMembers']},{290.})
        self.assertEqual(g['bandZMm'],[3170.,3520.])
        self.assertEqual(g['outerEnvelopeXYMm'],[262.5,262.5,11737.5,11737.5])
        self.assertEqual(g['settings']['widthMm'],300.)
        self.assertFalse(g['materialInstalledInNativeModel'])
        self.assertFalse(g['nativeSolveAvailable'])

    def test_material_added_once_and_force_moment(self):
        g=geometry_from_model(built_model_fixture(),settings_defaults())
        expected=subtract_boxes(g['fullRingUnionBoxesXYZMm'],
            [[262.5,262.5,3170,11737.5,11737.5,3370],
             *g['existingUpperCoreBoxesXYZMm'],*g['retainedNorthUnionBoxesXYZMm']])
        self.assertEqual(subtract_boxes(g['addedConcreteBoxesXYZMm'],expected),[])
        self.assertEqual(subtract_boxes(expected,g['addedConcreteBoxesXYZMm']),[])
        self.assertAlmostEqual(wrench_of_weight(expected,25)[2],-25*g['addedConcreteVolumeM3'],places=10)
        for b in expected:self.assertGreaterEqual(b[2],3370)
        self.assertLess(g['addedConcreteVolumeM3'],volume(g['fullRingUnionBoxesXYZMm'])*150/350)

    def test_width_change_rebuilds_actual_union(self):
        model=built_model_fixture()
        wide=geometry_from_model(model,settings_defaults())
        narrow=geometry_from_model(model,{**settings_defaults(),'widthMm':200.})
        self.assertGreater(wide['addedConcreteVolumeM3'],narrow['addedConcreteVolumeM3'])
        self.assertNotEqual(wide['section'],narrow['section'])
        self.assertEqual(wide['cornerRectanglesXYMm'],narrow['cornerRectanglesXYMm'])

    def test_missing_or_mixed_corner_and_fake_north_fail(self):
        m=built_model_fixture()
        m['houseLoadCase']['joinedCase']['floor']['cornerWidthsMm']['SE']=200
        with self.assertRaises(ValueError):geometry_from_model(m,settings_defaults())
        m=built_model_fixture();m['members']['outer-north/upstand/0']['physicalEndMm'][2]+=1
        with self.assertRaises(ValueError):geometry_from_model(m,settings_defaults())


if __name__=='__main__':unittest.main()
