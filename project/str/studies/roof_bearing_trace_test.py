import math
import unittest

from roof_bearing_trace import ring_vertical_trace


class RoofBearingTraceTest(unittest.TestCase):
    def test_six_rigid_modes_and_virtual_work_on_both_member_orientations(self):
        for a,b,p in [([0,0],[1000,0],[450,30]),([0,1000],[0,0],[-40,610]),
                ([1000,0],[0,0],[450,-30])]:
            nodes={tuple(a):'A',tuple(b):'B'}; trace=ring_vertical_trace([(a,b)],nodes,p)
            for t,r in [([1,0,0],[0,0,0]),([0,1,0],[0,0,0]),([0,0,1],[0,0,0]),
                    ([0,0,0],[1,0,0]),([0,0,0],[0,1,0]),([0,0,0],[0,0,1])]:
                value=0.
                for xy,name in nodes.items():
                    x,y=xy;u=[t[0]-r[2]*y,t[1]+r[2]*x,t[2]+r[0]*y-r[1]*x,*r]
                    value+=sum(c*v for n,row in trace if n==name for c,v in zip(row,u))
                self.assertAlmostEqual(value,t[2]+r[0]*p[1]-r[1]*p[0],10)
            # The same coefficient vector transfers the virtual work of a point force.
            u={'A':[.1,.2,.3,.004,.005,.006],'B':[.2,.3,.4,.007,.008,.009]};f=7.3
            displacement=sum(v*u[n][i] for n,row in trace for i,v in enumerate(row))
            work=sum(f*v*u[n][i] for n,row in trace for i,v in enumerate(row))
            self.assertAlmostEqual(work,f*displacement,12)
            self.assertTrue(any(row[3] or row[4] for _,row in trace))

    def test_shared_endpoint_is_one_existing_node(self):
        a,b,c=[0,0],[500,0],[1000,0];nodes={tuple(a):'A',tuple(b):'B',tuple(c):'C'}
        self.assertEqual(ring_vertical_trace([(a,b),(b,c)],nodes,b),[('B',[0.,0.,1.,0.,0.,0.])])

    def test_outside_member_or_width_and_nonfinite_reject(self):
        rings=[([0,0],[1000,0])];nodes={(0,0):'A',(1000,0):'B'}
        for p in ([1001,0],[500,111],[float('nan'),0]):
            with self.assertRaises(ValueError):ring_vertical_trace(rings,nodes,p)


if __name__=='__main__':unittest.main()
