import math
import unittest

from joined_successor_kernel import FrameModel, cross, rectangle_section
from rc_floor_house_loads import _consistent_line, _interior_member_cuts, consistent_member_point_load, member_load_equilibrium, recovered_member_actions


LAW={'elasticModulusMPa':30000,'poissonRatio':.2,'flexuralFactor':.5,'shearAreaFactor':5/6,'torsionFactor':.5}


def beam():
    frame=FrameModel();frame.node('a',[0,0,0]);frame.node('b',[1000,0,0])
    member={'a':'a','b':'b','physicalStartMm':[0,0,0],'physicalEndMm':[1000,0,0],'depthMm':200,'breadthMm':140,'kind':'upstand'}
    frame.member('beam','a','b',rectangle_section(200,140),LAW,y_axis=[0,1,0])
    model={'model':frame,'members':{'beam':member},'request':{'frameLaw':LAW}}
    return model,member


class ConsistentMemberLoadTest(unittest.TestCase):
    def test_uniform_consistent_vector_independent_fixedend_formula(self):
        model,member=beam();loads={};_consistent_line(model,loads,'test','beam',member,0,1000,[0,.01,0])
        self.assertAlmostEqual(loads['a'][1],5,12);self.assertAlmostEqual(loads['b'][1],5,12)
        self.assertAlmostEqual(loads['a'][5],.01*1000**2/12,9);self.assertAlmostEqual(loads['b'][5],-.01*1000**2/12,9)

    def test_simple_support_midspan_and_piecewise_moment_extremum(self):
        model,member=beam();frame=model['model'];loads={};_consistent_line(model,loads,'test','beam',member,0,1000,[0,.01,0])
        for node in frame.nodes:
            for axis in range(5):frame.fixed[node,axis]=0
            frame.load(node,loads[node])
        raw=frame.solve();r=recovered_member_actions(model,raw,{'test':1});self.assertLess(member_load_equilibrium(model,r,{'test':1})['maximumResidualKN_KNm'],1e-10)
        cuts=_interior_member_cuts(model,r,{'test':1});mid=min(cuts,key=lambda row:abs(row['fraction']-.5))
        self.assertAlmostEqual(mid['fraction'],.5,12);self.assertAlmostEqual(abs(mid['bendingZKNm']),.01*1000**2/8/1000,10)
        self.assertAlmostEqual(mid['shearYKN'],0,10)
        for row in r['memberEndWrenchesKN_KNmm']['beam'][5::6]:self.assertAlmostEqual(row,0,9)

    def test_internal_pointforce_and_couple_have_both_cut_limits(self):
        from rc_floor_house_loads import _consistent_point
        model,member=beam();loads={};_consistent_point(model,loads,'test','beam',member,[370,0,0],[0,2,0],[0,0,40])
        frame=model['model']
        for axis in range(6):frame.fixed['a',axis]=0
        for node,wrench in loads.items():frame.load(node,wrench)
        recovered=recovered_member_actions(model,frame.solve(),{'test':1})
        self.assertLess(member_load_equilibrium(model,recovered,{'test':1})['maximumResidualKN_KNm'],1e-9)
        rows=[row for row in _interior_member_cuts(model,recovered,{'test':1}) if abs(row['fraction']-.37)<1e-8]
        left=next(row for row in rows if row['cutSide']=='left');right=next(row for row in rows if row['cutSide']=='right')
        self.assertAlmostEqual(right['shearYKN']-left['shearYKN'],2,10)
        self.assertAlmostEqual(right['bendingZKNm']-left['bendingZKNm'],.04,10)

    def test_oblique_rigid_work_with_offset_masters(self):
        model,member=beam();member.update(physicalStartMm=[10,30,40],physicalEndMm=[610,30,840])
        model['model'].nodes={'a':(-20,10,-10),'b':(680,70,900)}
        point=[252,47,361];force=[1.2,-2.3,3.4];couple=[11,22,-33]
        vector=consistent_member_point_load(model,member,point,force,couple)
        actual=[vector[i]+vector[6+i] for i in range(3)];moment=[0.,0.,0.]
        for end,node in enumerate(('a','b')):
            addition=cross(model['model'].nodes[node],vector[end*6:end*6+3])
            moment=[a+b+c for a,b,c in zip(moment,addition,vector[end*6+3:end*6+6])]
        expected=[a+b for a,b in zip(cross(point,force),couple)]
        for a,b in zip(actual,force):self.assertAlmostEqual(a,b,12)
        for a,b in zip(moment,expected):self.assertAlmostEqual(a,b,9)
        translation=[.1,.2,-.3];rotation=[.002,-.003,.004];work=0
        for end,node in enumerate(('a','b')):
            displacement=[a+b for a,b in zip(translation,cross(rotation,model['model'].nodes[node]))]
            work+=sum(a*b for a,b in zip(vector[6*end:6*end+6],[*displacement,*rotation]))
        exact=sum(a*b for a,b in zip(force,[a+b for a,b in zip(translation,cross(rotation,point))]))+sum(a*b for a,b in zip(couple,rotation))
        self.assertAlmostEqual(work,exact,10)


if __name__=='__main__':unittest.main()
