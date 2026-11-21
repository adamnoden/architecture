import copy
import math
from pathlib import Path
import runpy
import unittest

from vertical_rc_floor import (normal_point_port_id, retained_physical_receiver_coefficients,
                               retained_receiver_operator_participation)
from vertical_floor_plate import assemble_vertical_plate
from vertical_floor_numerics import sparse_schur


LAW={'elasticModulusMPa':33000,'poissonRatio':.2,'thicknessMm':200,
     'flexuralFactor':.25,'shearFactor':.5,'unitWeightKNPerM3':25}


class RetainedPhysicalReceiverTest(unittest.TestCase):
    def test_equal_integer_float_and_signed_zero_points_have_one_unrounded_identity(self):
        self.assertEqual(normal_point_port_id((332.5,3800)),normal_point_port_id((332.5,3800.0)))
        self.assertEqual(normal_point_port_id((0,3800)),normal_point_port_id((-0.0,3800.0)))
        self.assertNotEqual(normal_point_port_id((332.5,3800)),normal_point_port_id((332.5,3800.000000000001)))
        with self.assertRaises(ValueError):normal_point_port_id((332.5,math.nan))

    def test_authored_integer_query_reuses_exact_mesh_trace_without_calling_boundary(self):
        mesh=(332.5,3800.0);authored=(332.5,3800);trace=[(7,1.)];calls=[]
        def boundary(point,axis):calls.append(point);return [(8,1.)]
        actual=retained_physical_receiver_coefficients({authored:'ROOF/FLOOR/332.5,3800'},{mesh:trace},boundary,lambda:8)
        self.assertEqual(actual['ROOF/FLOOR/332.5,3800'],trace)
        self.assertEqual(calls,[])

    def test_equal_xy_membership_does_not_authorise_creation_of_a_new_coordinate(self):
        count=[8]
        def orphan(point,axis):count[0]+=1;return [(8,1.)]
        with self.assertRaisesRegex(ValueError,'orphan coordinate'):
            retained_physical_receiver_coefficients({(332.5,3800):'ROOF/FLOOR/test'},{},orphan,lambda:count[0])

    def test_retained_unit_point_load_has_real_plate_stiffness_energy_and_response(self):
        # Four actual MITC4 cells with a simply supported outer perimeter.
        # Only the physical centre w is retained. This is independent of the
        # house's snapshots, roof load programme and foundation assumptions.
        centre=(332.5,3800.0);cells=[[x,y,x+100.,y+100.] for x in (232.5,332.5) for y in (3700.,3800.)]
        def boundary(point,axis):
            if axis!=0:return None
            if point==centre:return [(0,1.)]
            if point[0] in (232.5,432.5) or point[1] in (3700.,3900.):return []
            return None
        assembled=assemble_vertical_plate(cells,LAW,boundary,1)
        stiffness,load,recovery=sparse_schur(assembled)
        coefficients=retained_physical_receiver_coefficients({(332.5,3800):'roof'},{centre:boundary(centre,0)},boundary,lambda:1)['roof']
        audit=retained_receiver_operator_participation((332.5,3800),coefficients,assembled,{'condensedStiffness':stiffness})
        self.assertTrue(audit['physicalTraceConfirmed'])
        self.assertGreater(audit['assembledTraceRowMaxAbs'],0)
        self.assertGreater(audit['condensedTraceRowMaxAbs'],0)
        self.assertEqual(audit['createdScalarCoordinateCount'],0)
        # Independently solve the uncondensed element system for a unit point
        # load. Its displacement and strain energy must equal the Schur result.
        indices=list(assembled['matrix']);matrix=[[assembled['matrix'][i].get(j,0.) for j in indices] for i in indices]
        factor=runpy.run_path(str(Path(__file__).with_name('structural-linear.py')))['factor']
        full=factor(matrix)([1. if i==0 else 0. for i in indices]);displacement=1./stiffness[0][0]
        self.assertGreater(displacement,0)
        self.assertAlmostEqual(full[indices.index(0)],displacement,12)
        energy=sum(full[i]*v*full[j]/2 for i,row in enumerate(matrix) for j,v in enumerate(row))
        self.assertAlmostEqual(energy,displacement/2,12)
        self.assertGreater(energy,0)
        bad=copy.deepcopy(assembled);bad['pointTerms'][centre,0]=[(1,1.)];bad['matrix'][1]={}
        with self.assertRaises(ValueError):retained_receiver_operator_participation(centre,[(1,1.)],bad,{'condensedStiffness':[[stiffness[0][0],0.],[0.,0.]]})
        with self.assertRaisesRegex(ValueError,'condensed plate participation'):
            retained_receiver_operator_participation(centre,coefficients,assembled,{'condensedStiffness':[[0.]]})


if __name__=='__main__':unittest.main()
