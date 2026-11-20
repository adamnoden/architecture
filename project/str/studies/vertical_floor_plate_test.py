import math
from pathlib import Path
import runpy
import unittest

from vertical_floor_plate import assemble_vertical_plate, mitc4_element, plate_cells


LAW={'elasticModulusMPa':33000,'poissonRatio':.2,'thicknessMm':200,'flexuralFactor':1,'shearFactor':5/6,'unitWeightKNPerM3':25}


def simply_supported_square(n,thickness=200):
    length=4000;law={**LAW,'thicknessMm':thickness};cells,_=plate_cells([[0,0,length,length]],[],length/n)
    def boundary(point,axis):
        x,y=point
        if axis==0 and (x in (0,length) or y in (0,length)):return []
        if axis==1 and x in (0,length):return []
        if axis==2 and y in (0,length):return []
    a=assemble_vertical_plate(cells,law,boundary);matrix=a['matrix'];factor=runpy.run_path(str(Path(__file__).with_name('structural-linear.py')))['factor']
    indices=list(matrix);u=factor([[matrix[i].get(j,0.) for j in indices] for i in indices])([a['force'].get(i,0.) for i in indices]);lookup=dict(zip(indices,u))
    centre=a['pointTerms'][((length/2,length/2),0)];value=-sum(lookup[i]*v for i,v in centre)
    e=law['elasticModulusMPa'];nu=law['poissonRatio'];t=thickness;d=e*t**3/(12*(1-nu*nu));shear=e/(2*(1+nu))*law['shearFactor']*t;q=25*t/1e6
    exact=0.
    for m in range(1,60,2):
        for n in range(1,60,2):
            wave=(m*m+n*n)/length**2;load=16*q/(m*n*math.pi**2);sign=math.sin(m*math.pi/2)*math.sin(n*math.pi/2)
            exact+=sign*load*(1/(d*math.pi**4*wave**2)+1/(shear*math.pi**2*wave))
    return value,exact


class VerticalPlateKernelTest(unittest.TestCase):
    def test_three_rigid_modes_and_constant_curvature_energy(self):
        rect=[0,0,1000,600];k,_=mitc4_element(rect,LAW);points=((0,0),(1000,0),(1000,600),(0,600))
        for shift,rx,ry in ((1,0,0),(0,.001,0),(0,0,.001)):
            u=[v for x,y in points for v in (shift+rx*y-ry*x,rx,ry)]
            self.assertLess(max(abs(sum(a*b for a,b in zip(row,u))) for row in k),1e-8)
        kappa=1e-6;u=[v for x,y in points for v in (-kappa*x*x/2,0,kappa*x)]
        actual=sum(u[i]*v*u[j]/2 for i,row in enumerate(k) for j,v in enumerate(row));d=33000/1000*200**3/(12*(1-.2**2))
        self.assertAlmostEqual(actual,d*kappa*kappa*1000*600/2,8)
        twist=[v for x,y in points for v in (-kappa*x*y/2,-kappa*x/2,kappa*y/2)]
        actual=sum(twist[i]*v*twist[j]/2 for i,row in enumerate(k) for j,v in enumerate(row))
        self.assertAlmostEqual(actual,d*(1-.2)/2*kappa*kappa*1000*600/2,8)

    def test_navier_square_refinement_and_thin_plate_does_not_lock(self):
        coarse,exact=simply_supported_square(4);fine,_=simply_supported_square(8)
        self.assertLess(abs(fine-exact),abs(coarse-exact));self.assertLess(abs(fine/exact-1),.025)
        thin,thin_exact=simply_supported_square(8,40);self.assertLess(abs(thin/thin_exact-1),.025)

    def test_one_way_free_strip_matches_closed_form_timoshenko_beam(self):
        length=4000;width=600;law={**LAW,'poissonRatio':0};values=[]
        for n in (8,16):
            cells=[[length*i/n,width*j/2,length*(i+1)/n,width*(j+1)/2] for i in range(n) for j in range(2)]
            def boundary(point,axis):
                if axis==0 and point[0] in (0,length):return []
            a=assemble_vertical_plate(cells,law,boundary);indices=list(a['matrix']);matrix=[[a['matrix'][i].get(j,0.) for j in indices] for i in indices]
            factor=runpy.run_path(str(Path(__file__).with_name('structural-linear.py')))['factor'];u=dict(zip(indices,factor(matrix)([a['force'].get(i,0.) for i in indices])))
            values.append(-sum(c*u[i] for i,c in a['pointTerms'][(length/2,width/2),0]))
        e=33000/1000;g=e/2;line=.003;inertia=width*200**3/12;area=width*200
        exact=5*line*length**4/(384*e*inertia)+line*length**2/(8*law['shearFactor']*g*area)
        self.assertLess(abs(values[1]-exact),abs(values[0]-exact));self.assertLess(abs(values[1]/exact-1),.01)

    def test_aperture_union_controls_area_mass_and_mesh(self):
        bodies=[[0,0,2000,2000],[2000,0,4000,2000]];holes=[[1500,500,2500,1500],[1800,800,2200,1200]]
        cells,_=plate_cells(bodies,holes,700);assembled=assemble_vertical_plate(cells,LAW)
        self.assertAlmostEqual(assembled['areaM2'],7,12);self.assertAlmostEqual(assembled['physicalSelfGKN'],35,12)
        self.assertEqual(assembled['centroidXYMm'],[2000,1000])
        for x0,y0,x1,y1 in cells:self.assertFalse(1500<(x0+x1)/2<2500 and 500<(y0+y1)/2<1500)


if __name__=='__main__':unittest.main()
