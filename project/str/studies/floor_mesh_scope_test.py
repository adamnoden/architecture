"""Bounded250mm numerical admission; this supplies no house/joint acceptance."""
import copy
from pathlib import Path
import unittest

from distributed_floor_compatibility import _admit_distributed, load_distributed_floor_source
from distributed_floor_proof import numerical_request
from perforated_floor_condensation import compile_perforated_floor
from perforated_floor_receiving_test import fixture
from vertical_floor_plate import assemble_vertical_plate, plate_cells
from vertical_floor_plate_test import LAW
from vertical_rc_floor import build_vertical_rc_floor, load_vertical_rc_floor_source
from vertical_rc_floor_proof import numerical_case as vertical_numerical_case


ROOT=Path(__file__).resolve().parents[3]


class ReachedPhysicalBuilder(Exception):
    """Stop after actual input admission, before any whole-house assembly."""


class FloorMeshScopeTest(unittest.TestCase):
    def test_distributed_mesh_admits250_and_unchanged500_but_rejects_outside_scope(self):
        source=load_distributed_floor_source(ROOT);case=numerical_request(source)
        original=copy.deepcopy(case)
        for pitch in (250,500,1800):
            candidate={**case,'maxPitchMm':pitch}
            _admit_distributed(candidate,source)
        self.assertEqual(case,original)
        for pitch in (249.999,1800.001,True,float('nan'),float('inf')):
            with self.assertRaisesRegex(ValueError,'Mesh pitch'):
                _admit_distributed({**case,'maxPitchMm':pitch},source)

    def test_vertical_mesh_admission_reaches_builder_without_claiming_a_solve(self):
        source=load_vertical_rc_floor_source(ROOT);case=vertical_numerical_case(source)
        def stop_before_assembly(*_):raise ReachedPhysicalBuilder()
        for pitch in (250,500,1800):
            with self.assertRaises(ReachedPhysicalBuilder):
                build_vertical_rc_floor({**case,'maxPitchMm':pitch},source,portal_builder=stop_before_assembly)
        for pitch in (249.999,1800.001,True,float('nan'),float('inf')):
            with self.assertRaisesRegex(ValueError,'vertical mesh pitch'):
                build_vertical_rc_floor({**case,'maxPitchMm':pitch},source,portal_builder=stop_before_assembly)

    def test250_plate_preserves_material_work_and_independent_constant_curvature_energy(self):
        bodies=[[0,0,2000,1000]];holes=[[750,250,1250,750]];kappa=1e-6
        # An aperture stays absent, including its gravity and first moments.
        for pitch in (500,250):
            cells,_=plate_cells(bodies,holes,pitch);a=assemble_vertical_plate(cells,LAW)
            self.assertAlmostEqual(a['areaM2'],1.75,12)
            self.assertAlmostEqual(a['physicalSelfGKN'],8.75,12)
            self.assertEqual(a['centroidXYMm'],[1000,500])
            force=[0.,0.,0.]
            for (point,axis),index in a['freePointDofs'].items():
                if axis==0:
                    p=a['force'].get(index,0.);force[0]+=p;force[1]+=point[1]*p;force[2]-=point[0]*p
            self.assertAlmostEqual(force[0],-8.75,10)
            self.assertAlmostEqual(force[1],-4375.,8)
            self.assertAlmostEqual(force[2],8750.,8)
            u={}
            for (point,axis),index in a['freePointDofs'].items():
                x,y=point;u[index]=(-kappa*x*x/2,0,kappa*x)[axis]
            energy=sum(u[i]*value*u[j]/2 for i,row in a['matrix'].items() for j,value in row.items())
            d=LAW['elasticModulusMPa']/1000*LAW['thicknessMm']**3/(12*(1-LAW['poissonRatio']**2))
            self.assertAlmostEqual(energy,d*kappa*kappa*1.75e6/2,8)
            for shift,rx,ry in ((1,0,0),(0,.001,0),(0,0,.001)):
                rigid={index:(shift+rx*point[1]-ry*point[0],rx,ry)[axis] for (point,axis),index in a['freePointDofs'].items()}
                self.assertLess(max(abs(sum(value*rigid[j] for j,value in row.items())) for row in a['matrix'].values()),1e-8)

    def test250_membrane_keeps_pressure_work_and_rigid_modes_of500_control(self):
        bodies,holes,loops,patches,law,_,receivers=fixture()
        pressure=[{'forceKN':[0,10,0],'pointXYZMm':[500,1000,3270],'loadedAlongIntervalMm':[0,1000]}]
        counts=[]
        for pitch in (500,250):
            r=compile_perforated_floor(bodies,holes,loops,patches,law,pitch,pressure,receivers)
            self.assertAlmostEqual(r['membraneAreaM2'],.93,12)
            self.assertLess(max(r['rigidModeResidualKN']),1e-5)
            self.assertLess(r['modeReconstructionRelativeError'],1e-8)
            f=r['condensedForceKN'];fx=sum(f[3*i] for i in range(len(patches)));fy=sum(f[3*i+1] for i in range(len(patches)))
            mz=sum(p['originXYMm'][0]*f[3*i+1]-p['originXYMm'][1]*f[3*i]+1000*f[3*i+2] for i,p in enumerate(patches))
            self.assertAlmostEqual(fx,0.,8);self.assertAlmostEqual(fy,10.,8);self.assertAlmostEqual(mz,5000.,6)
            counts.append(r['triangleCount'])
        self.assertGreater(counts[1],counts[0])


if __name__=='__main__':unittest.main()
