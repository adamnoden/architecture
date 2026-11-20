import copy
import math
import unittest

from plate_bending_recovery import recover_plate_bending
from vertical_floor_plate import mitc4_element


LAW = {'elasticModulusMPa': 33000, 'poissonRatio': .2, 'thicknessMm': 200,
       'flexuralFactor': .25, 'shearFactor': .5, 'unitWeightKNPerM3': 25}


def specimen(kx=0., ky=0., twist=0., rect=(0, 0, 1000, 600), rigid=(0., 0., 0.)):
    x0, y0, x1, y1 = rect
    shift, rx, ry = rigid
    points = []
    for x, y in ((x0, y0), (x1, y0), (x1, y1), (x0, y1)):
        points.append({'xyMm': [x, y], 'displacementMmRad': [
            shift + rx*y - ry*x - kx*x*x/2 - ky*y*y/2 - twist*x*y/2,
            rx - ky*y - twist*x/2, ry + kx*x + twist*y/2]})
    return {'request': {'plateLaw': LAW}, 'plate': {'cellsXYMm': [list(rect)],
        'physicalRecovery': {'points': points}}}


class PhysicalBendingRecoveryTest(unittest.TestCase):
    def test_constant_curvature_matches_closed_form_and_element_energy(self):
        case = specimen(1e-6, -2e-6, 3e-6)
        result = recover_plate_bending(case)
        d = 33000/1000*.25*200**3/(12*(1-.2**2))
        expected = [d*(1e-6-.2*2e-6), d*(.2*1e-6-2e-6), d*(1-.2)*3e-6/2]
        for sample in result['cells'][0]['gaussSamples']:
            for value, exact in zip(sample['momentKNmPerM'], expected):
                self.assertAlmostEqual(value, exact, 11)
        # Independent matrix product from the actual plate element.
        matrix, _ = mitc4_element([0, 0, 1000, 600], LAW)
        u = [v for point in case['plate']['physicalRecovery']['points'] for v in point['displacementMmRad']]
        energy = sum(u[i]*matrix[i][j]*u[j]/2 for i in range(12) for j in range(12))
        self.assertAlmostEqual(result['bendingStrainEnergyKNmm'], energy, 8)

    def test_three_rigid_modes_do_not_create_moment(self):
        for rigid in ((8., 0., 0.), (0., .003, 0.), (0., 0., -.004)):
            self.assertLess(recover_plate_bending(specimen(rigid=rigid))
                ['maximumAbsoluteBendingPlusTwistingKNmPerM'], 1e-10)

    def test_rigid_addition_and_translation_preserve_physical_moments(self):
        a = recover_plate_bending(specimen(1e-6, 2e-6, -3e-6))
        b = recover_plate_bending(specimen(1e-6, 2e-6, -3e-6,
            rect=(1200, 800, 2200, 1400), rigid=(5., .002, -.001)))
        self.assertAlmostEqual(a['maximumAbsoluteBendingPlusTwistingKNmPerM'],
                               b['maximumAbsoluteBendingPlusTwistingKNmPerM'], 10)

    def test_actual_width_and_stiffness_change_result_with_twist_retained(self):
        case = specimen(1e-6, 0., 3e-6)
        before = recover_plate_bending(case)
        changed = copy.deepcopy(case)
        changed['request']['plateLaw'] = {**LAW, 'flexuralFactor': .5}
        after = recover_plate_bending(changed)
        self.assertAlmostEqual(after['maximumAbsoluteBendingPlusTwistingKNmPerM'],
            2*before['maximumAbsoluteBendingPlusTwistingKNmPerM'], 10)
        self.assertGreater(before['maximumAbsoluteBendingPlusTwistingKNmPerM'],
                           max(abs(v) for v in before['governing']['momentKNmPerM'][:2]))
        narrow = recover_plate_bending(specimen(1e-6, rect=(0, 0, 15, 600)))
        self.assertEqual(narrow['cells'][0]['minimumCellWidthMm'], 15)
        self.assertFalse(narrow['localStressConvergenceProven'])

    def test_missing_nonfinite_duplicate_and_false_energy_reject(self):
        for mutate in (
            lambda c: c['plate']['physicalRecovery']['points'].pop(),
            lambda c: c['plate']['physicalRecovery']['points'].append(c['plate']['physicalRecovery']['points'][0]),
            lambda c: c['plate']['physicalRecovery']['points'][0]['displacementMmRad'].__setitem__(2, math.nan),
            lambda c: c['plate']['cellsXYMm'].append(c['plate']['cellsXYMm'][0]),
            lambda c: c['plate']['physicalRecovery'].__setitem__('physicalPlateStrainEnergyKNmm', 0.),
        ):
            case = specimen(1e-6)
            mutate(case)
            with self.assertRaises(ValueError): recover_plate_bending(case)


if __name__ == '__main__': unittest.main()
