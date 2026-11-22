import unittest
from joined_successor_kernel import FrameModel,cross,rectangle_section
from finite_plate_receiver import vertical_receiver_trace
from rc_member_load_test import LAW


class ActualVerticalReceiverTest(unittest.TestCase):
    def test_both_axes_match_independent_timoshenko_cantilever_deflection(self):
        for axis in (0,1):
            frame=FrameModel();a=[0.,0.,0.];b=[0.,0.,0.];b[axis]=1000.
            frame.node('a',a);frame.node('b',b)
            normal=[0,1,0] if axis==0 else [1,0,0]
            section=rectangle_section(350,250);frame.member('beam','a','b',section,LAW,y_axis=normal)
            for i in range(6):frame.fixed['a',i]=0.
            frame.load('b',[0,0,-1.,0,0,0]);raw=frame.solve()
            member={'a':'a','b':'b','physicalStartMm':a,'physicalEndMm':b,'depthMm':350,'breadthMm':250,'yAxisGlobal':normal}
            model={'model':frame,'request':{'frameLaw':LAW},'members':{'beam':member}}
            rectangle=[-125,-125,b[0]+125,b[1]+125]
            receiver={'axis':axis,'rectangleXYMm':rectangle,'centroidZMm':0,'stations':[{'u':0,'node':'a','indices':[0,1,2]},{'u':1000,'node':'b','indices':[3,4,5]}],'memberNames':['beam']}
            values=[]
            for node in ('a','b'):
                u=raw['displacements'][node];values.extend([u[2],u[3]*1000,u[4]*1000])
            point=[0.,0.];point[axis]=370.
            actual=sum(values[i]*v for i,v in vertical_receiver_trace(model,receiver,point,0))
            e=LAW['elasticModulusMPa']/1000;g=e/(2*(1+LAW['poissonRatio']));s=370.;length=1000.
            expected=-s*s*(3*length-s)/(6*e*LAW['flexuralFactor']*section['Iy'])-s/(g*LAW['shearAreaFactor']*section['A'])
            self.assertAlmostEqual(actual,expected,12)

    def test_both_actual_axes_reproduce_rigid_plate_work_at_edges_and_interior(self):
        for axis in (0,1):
            frame=FrameModel();normal=[0,1,0] if axis==0 else [1,0,0]
            a=[300,400,3270];b=list(a);b[axis]+=1000
            frame.node('a',a);frame.node('b',b)
            member={'a':'a','b':'b','physicalStartMm':a,'physicalEndMm':b,'depthMm':350,'breadthMm':250,'yAxisGlobal':normal}
            frame.member('beam','a','b',rectangle_section(350,250),LAW,y_axis=normal)
            model={'model':frame,'request':{'frameLaw':LAW},'members':{'beam':member}}
            r=[a[0]-125,a[1]-125,b[0]+125,b[1]+125]
            receiver={'axis':axis,'rectangleXYMm':r,'centroidZMm':3270,'stations':[{'u':a[axis],'node':'a','indices':[0,1,2]},{'u':b[axis],'node':'b','indices':[3,4,5]}],'memberNames':['beam']}
            for u in (a[axis]-100,a[axis],a[axis]+370,b[axis],b[axis]+100):
                point=list(a[:2]);point[axis]=u;point[1-axis]+=110
                for kind in range(3):
                    values=[]
                    for node in ('a','b'):
                        p=frame.nodes[node];values.extend([1 if kind==0 else .001*p[1] if kind==1 else -.001*p[0],1 if kind==1 else 0,1 if kind==2 else 0])
                    expected=[1 if kind==0 else .001*point[1] if kind==1 else -.001*point[0],.001 if kind==1 else 0,.001 if kind==2 else 0]
                    for coordinate in range(3):
                        terms=vertical_receiver_trace(model,receiver,point,coordinate)
                        self.assertAlmostEqual(sum(values[i]*v for i,v in terms),expected[coordinate],11)
            self.assertIsNone(vertical_receiver_trace(model,receiver,[r[2]+1,r[3]+1],0))


if __name__=='__main__':unittest.main()
