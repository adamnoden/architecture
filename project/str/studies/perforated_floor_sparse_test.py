"""Independent condensation controls; never a native whole-house solve."""
import copy
from pathlib import Path
import unittest
from unittest.mock import patch

import numpy as np
import perforated_floor_condensation as core
from perforated_floor_receiving_test import fixture


def floor(backend='scipy-sparse',pressure=None,pitch=250,holes=None,law=None,patches=None):
    bodies,omissions,loops,ports,material,_,receivers=fixture()
    return core.compile_perforated_floor(bodies,omissions if holes is None else holes,loops,
        ports if patches is None else patches,material if law is None else law,pitch,
        pressure or (),receivers,numerical_backend=backend)


PRESSURE=[{'forceKN':[0,10,0],'pointXYZMm':[500,1000,3270],'loadedAlongIntervalMm':[0,1000]}]


class SparsePerforatedFloorTest(unittest.TestCase):
    def setUp(self):core._OPERATOR_CACHE.clear()

    def test_raw_sparse_matches_python_and_independent_dense_energy_source_work(self):
        k=np.array([[4.,-2,0,-1],[-2,5,-1,0],[0,-1,3,-1],[-1,0,-1,3]])
        matrix={i:{j:float(v) for j,v in enumerate(row) if v} for i,row in enumerate(k)}
        retained=[0,3];interior=[1,2];scale=[1.,.001,1.,.001];load={0:1.,1:4.,2:-2.,3:3.}
        expected_k,expected_f,_=core._schur(matrix,retained,scale,interior,load)
        actual,data=core._sparse_operator(matrix,retained,scale)
        cached={'backend':'scipy-sparse','sparse':data}
        force,particular_energy=core._reduced_force(cached,retained,load)
        np.testing.assert_allclose(actual,expected_k,rtol=1e-12,atol=1e-12)
        np.testing.assert_allclose(force,expected_f,rtol=1e-12,atol=1e-12)
        f=np.array([load[i] for i in range(4)]);q=np.array([.2,-.7]);u=np.zeros(4);u[retained]=np.array(scale)[retained]*q
        u[interior]=np.linalg.solve(k[np.ix_(interior,interior)],f[interior]-k[np.ix_(interior,retained)]@u[retained])
        physical=float(u@k@u/2-f@u)
        reduced=float(q@np.array(actual)@q/2-q@force-particular_energy)
        self.assertAlmostEqual(physical,reduced,12)
        expected_energy=float(f[interior]@np.linalg.solve(k[np.ix_(interior,interior)],f[interior])/2)
        self.assertAlmostEqual(particular_energy,expected_energy,12)

    def test_same_perforated_finite_boundary_pressure_and_exact_zero_port(self):
        ports=fixture()[3]+[{'id':'vertical-only','originXYMm':[400,400],'rectangles':[]}]
        holes=fixture()[1]+[[400,400,600,600]]
        a=floor('python',PRESSURE,holes=holes,patches=ports);b=floor('scipy-sparse',PRESSURE,holes=holes,patches=ports)
        self.assertEqual(a['meshTrianglesXYMm'],b['meshTrianglesXYMm']);self.assertEqual(a['coordinateColumns'],b['coordinateColumns'])
        np.testing.assert_allclose(a['condensedStiffnessKNPerMm'],b['condensedStiffnessKNPerMm'],rtol=1e-9,atol=1e-7)
        np.testing.assert_allclose(a['condensedForceKN'],b['condensedForceKN'],rtol=1e-9,atol=1e-8)
        for r in b['condensedStiffnessKNPerMm'][-3:]:self.assertEqual(r,[0.]*len(r))
        self.assertEqual(b['condensedForceKN'][-3:],[0.]*3)
        self.assertLess(max(b['rigidModeResidualKN']),1e-3)
        self.assertLess(b['modeReconstructionRelativeError'],1e-8)
        self.assertLess(max(abs(v) for v in b['numericalCondensation']['sourceRigidWorkResidualKNmm']),1e-6)
        self.assertAlmostEqual(sum(b['condensedForceKN'][1::3]),10,8)

    def test_changed_load_reuses_factor_but_reduces_actual_new_force_and_energy(self):
        a=floor(pressure=PRESSURE);key=a['numericalCondensation']['operatorCacheIdentity']
        factor=core._OPERATOR_CACHE[key]['sparse']['factor']
        negative=copy.deepcopy(PRESSURE);negative[0]['forceKN'][1]=-20
        b=floor(pressure=negative)
        self.assertEqual(key,b['numericalCondensation']['operatorCacheIdentity'])
        self.assertIs(factor,core._OPERATOR_CACHE[key]['sparse']['factor'])
        self.assertEqual(a['condensedStiffnessKNPerMm'],b['condensedStiffnessKNPerMm'])
        np.testing.assert_allclose(b['condensedForceKN'],-2*np.array(a['condensedForceKN']),rtol=1e-12,atol=1e-12)
        self.assertAlmostEqual(b['numericalCondensation']['loadOnlyParticularEnergyKNmm'],4*a['numericalCondensation']['loadOnlyParticularEnergyKNmm'],12)
        zero=floor();self.assertEqual(zero['condensedForceKN'],[0.]*len(a['condensedForceKN']))
        self.assertEqual(zero['numericalCondensation']['loadOnlyParticularEnergyKNmm'],0)

    def test_material_aperture_and_backend_policy_invalidate_operator_identity(self):
        a=floor();material=copy.deepcopy(fixture()[4]);material['elasticModulusMPa']*=2
        changed=floor(law=material);perforated=floor(holes=fixture()[1]+[[400,400,600,600]])
        automatic=floor('auto-fine-sparse-v1')
        identities={r['numericalCondensation']['operatorCacheIdentity'] for r in (a,changed,perforated,automatic)}
        self.assertEqual(len(identities),4)
        self.assertNotEqual(a['condensedStiffnessKNPerMm'],changed['condensedStiffnessKNPerMm'])

    def test_fine_only_policy_and_missing_sparse_dependency_never_fall_back(self):
        self.assertEqual(floor('auto-fine-sparse-v1',pitch=500)['numericalCondensation']['selectedBackend'],'python')
        self.assertEqual(floor('auto-fine-sparse-v1')['numericalCondensation']['selectedBackend'],'scipy-sparse')
        with self.assertRaises(ValueError):floor('unrecorded-backend')
        core._OPERATOR_CACHE.clear()
        with patch.object(core,'_sparse_operator',side_effect=ImportError('SciPy unavailable')):
            with self.assertRaises(ImportError):floor('auto-fine-sparse-v1')
            self.assertEqual(floor('auto-fine-sparse-v1',pitch=500)['numericalCondensation']['selectedBackend'],'python')

    def test_singular_indefinite_and_unscaled_small_pivots_are_not_regularised(self):
        for matrix in ({0:{0:1.},1:{1:0.}}, {0:{0:1.},1:{1:-1.}},
                {0:{0:1.},1:{2:1.},2:{1:1.}}, {0:{0:1.},1:{1:1e-10}}):
            n=len(matrix)
            with self.assertRaises(ValueError):core._sparse_operator(matrix,[0],[1.]+[.001]*(n-1))
        # A small normalised rotational pivot is accepted only when its
        # physical-unit pivot clears the unchanged1e-9 criterion.
        _,data=core._sparse_operator({0:{0:1.},1:{1:1e-8}},[0],[1.,.001])
        self.assertAlmostEqual(data['minimumPhysicalInteriorPivot'],1e-8,18)
        matrix,data=core._sparse_operator({0:{0:2.}},[0],[1.])
        self.assertEqual(matrix,[[2.]])
        self.assertEqual(core._reduced_force({'backend':'scipy-sparse','sparse':data},[0],{0:3.}),([3.],0.))

    def test_actual250_source_assembly_condenses_before_any_house_solve(self):
        import distributed_floor_compatibility as house
        from distributed_floor_proof import numerical_request
        class CondensationComplete(Exception):pass
        source=house.load_distributed_floor_source(Path(__file__).resolve().parents[3])
        request=numerical_request(source);request['maxPitchMm']=250;captured=[]
        def stop_after_kernel(*args,**kwargs):
            captured.append(core.compile_perforated_floor(*args,**kwargs));raise CondensationComplete()
        with patch.object(house,'compile_perforated_floor',side_effect=stop_after_kernel),\
                patch.object(house.FrameModel,'solve',side_effect=AssertionError('Native house solve forbidden')) as solve:
            with self.assertRaises(CondensationComplete):house.compile_distributed_floor(request,source)
        solve.assert_not_called();self.assertEqual(len(captured),1);result=captured[0]
        self.assertEqual(result['numericalCondensation']['selectedBackend'],'scipy-sparse')
        self.assertGreater(result['interiorDofCount'],7000);self.assertGreater(result['triangleCount'],6000)
        self.assertEqual(len(result['condensedForceKN']),12)
        self.assertLess(max(result['rigidModeResidualKN']),1e-3)
        self.assertLess(result['modeReconstructionRelativeError'],1e-8)
        self.assertLess(max(abs(v) for v in result['numericalCondensation']['sourceRigidWorkResidualKNmm']),1e-6)

    def test_actual500_source_python_oracle_matches_sparse_on_identical_geometry(self):
        import distributed_floor_compatibility as house
        from distributed_floor_proof import numerical_request
        class GeometryCaptured(Exception):pass
        source=house.load_distributed_floor_source(Path(__file__).resolve().parents[3])
        request=numerical_request(source);request['maxPitchMm']=500;captured=[]
        def stop_before_kernel(*args,**kwargs):captured.append((args,kwargs));raise GeometryCaptured()
        with patch.object(house,'compile_perforated_floor',side_effect=stop_before_kernel),\
                patch.object(house.FrameModel,'solve',side_effect=AssertionError('Native house solve forbidden')) as solve:
            with self.assertRaises(GeometryCaptured):house.compile_distributed_floor(request,source)
        solve.assert_not_called();args,kwargs=captured[0]
        a=core.compile_perforated_floor(*args,**kwargs)
        b=core.compile_perforated_floor(*args,**kwargs,numerical_backend='scipy-sparse')
        self.assertEqual(a['numericalCondensation']['selectedBackend'],'python')
        self.assertEqual(a['meshTrianglesXYMm'],b['meshTrianglesXYMm'])
        np.testing.assert_allclose(a['condensedStiffnessKNPerMm'],b['condensedStiffnessKNPerMm'],rtol=1e-9,atol=1e-7)
        np.testing.assert_allclose(a['condensedForceKN'],b['condensedForceKN'],rtol=1e-9,atol=1e-8)
        self.assertAlmostEqual(a['numericalCondensation']['loadOnlyParticularEnergyKNmm'],b['numericalCondensation']['loadOnlyParticularEnergyKNmm'],8)


if __name__=='__main__':unittest.main()
