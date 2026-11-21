import copy
import math
import unittest

from named_plate_load import patch_force, condense_named_force, recover_named_loads
from vertical_floor_plate import assemble_vertical_plate, condense_vertical_plate


class NamedPlateLoadTest(unittest.TestCase):
    def specimen(self, backend='scipy'):
        corners = ((0,0), (1000,0), (1000,1000), (0,1000))
        cells = [[x,y,x+500,y+500] for x in (0,500) for y in (0,500)]
        law = dict(elasticModulusMPa=33000, poissonRatio=.2, thicknessMm=200,
            flexuralFactor=.25, shearFactor=.5, unitWeightKNPerM3=25)
        def boundary(point, axis): return [(corners.index(point), 1.)] if axis == 0 and point in corners else None
        assembled = assemble_vertical_plate(cells, law, boundary, 4)
        rigid = [[1.]*4, [p[1]/1000 for p in corners], [-p[0]/1000 for p in corners]]
        return assembled, condense_vertical_plate(assembled, rigid, backend)

    def test_asymmetric_patch_conserves_origin_and_changes_actual_particular_field(self):
        a, op = self.specimen(); original = copy.deepcopy(a['force'])
        q = patch_force(a, [dict(id='wall', rectangleXYMm=[50,100,350,600], pressureKNPerMm2=2e-6)])
        self.assertAlmostEqual(q['coveredDownKN'], .3)
        self.assertAlmostEqual(q['uncoveredDownKN'], 0)
        self.assertEqual(q['origins'][0]['pointXYMm'], [200,350])
        c = condense_named_force(op, q['force'])['condensedForceKN']
        self.assertAlmostEqual(sum(c), -.3, 9)
        self.assertAlmostEqual(sum(f*y/1000 for f,y in zip(c,[0,0,1000,1000])), -.105, 9)
        self.assertAlmostEqual(sum(f*x/1000 for f,x in zip(c,[0,1000,1000,0])), -.06, 9)
        zero = recover_named_loads(op, [0.]*4, 0., [])
        loaded = recover_named_loads(op, [0.]*4, 0., [(q['force'],1.)])
        self.assertEqual(zero['maximumDeflectionMm'], 0.)
        self.assertGreater(loaded['maximumDeflectionMm'], 0.)
        self.assertGreater(loaded['physicalPlateStrainEnergyKNmm'], 0.)
        self.assertLess(loaded['workRelativeResidual'], 1e-10)
        self.assertEqual(a['force'], original)
        self.assertEqual(recover_named_loads(op, [0.]*4, 0., []), zero)

    def test_matches_independent_uncondensed_small_plate(self):
        import numpy as np
        a, op = self.specimen()
        q = patch_force(a, [dict(id='off-centre', rectangleXYMm=[50,100,750,800], pressureKNPerMm2=3e-6)])
        n=a['dofCount']; k=np.zeros((n,n)); f=np.array([q['force'].get(i,0.) for i in range(n)])
        for i,row in a['matrix'].items():
            for j,v in row.items(): k[i,j]=v
        u=np.zeros(n);u[4:]=np.linalg.solve(k[4:,4:],f[4:]); reaction=k@u-f
        c=condense_named_force(op,q['force'])['condensedForceKN']
        np.testing.assert_allclose(c,-reaction[:4],atol=1e-10)
        result=recover_named_loads(op,[0.]*4,0.,[(q['force'],1.)])
        self.assertAlmostEqual(result['physicalPlateStrainEnergyKNmm'],float(u@k@u/2),10)
        for row in result['points']:
            for axis,value in enumerate(row['displacementMmRad']):
                expected=sum(v*u[i] for i,v in a['pointTerms'][tuple(row['xyMm']),axis])
                self.assertAlmostEqual(value,expected,10)

    def test_standard_and_sparse_routes_match_nonuniform_signed_combination(self):
        a, op = self.specimen(); _, other = self.specimen('stdlib')
        q=patch_force(a,[dict(id='one',rectangleXYMm=[0,0,800,300],pressureKNPerMm2=1e-5)])
        for left,right in zip(condense_named_force(op,q['force'])['condensedForceKN'],condense_named_force(other,q['force'])['condensedForceKN']): self.assertAlmostEqual(left,right,9)
        left=recover_named_loads(op,[0.]*4,.9,[(q['force'],1.35)])
        right=recover_named_loads(other,[0.]*4,.9,[(q['force'],1.35)])
        self.assertAlmostEqual(left['physicalPlateStrainEnergyKNmm'],right['physicalPlateStrainEnergyKNmm'],8)

    def test_holes_and_outside_are_reported_never_moved_to_a_support(self):
        a,_=self.specimen()
        q=patch_force(a,[dict(id='outside',rectangleXYMm=[900,0,1100,1000],pressureKNPerMm2=1e-5)])
        self.assertAlmostEqual(q['coveredDownKN'],1.)
        self.assertAlmostEqual(q['uncoveredDownKN'],1.)
        q=patch_force(a,[dict(id='no-floor',rectangleXYMm=[1100,0,1200,1000],pressureKNPerMm2=1e-5)])
        self.assertEqual(q['force'],{});self.assertAlmostEqual(q['uncoveredDownKN'],1.)

    def test_nonfinite_foreign_coordinate_and_duplicate_identifier_reject(self):
        a,op=self.specimen();p=dict(id='one',rectangleXYMm=[0,0,100,100],pressureKNPerMm2=1e-5)
        with self.assertRaises(ValueError):patch_force(a,[p,p])
        for bad in (float('nan'),True):
            with self.assertRaises(ValueError):patch_force(a,[{**p,'pressureKNPerMm2':bad}])
        for f in ({a['dofCount']:1.},{0:float('nan')},{True:1.}):
            with self.assertRaises(ValueError):condense_named_force(op,f)


if __name__=='__main__':unittest.main()
