import copy
import math
from pathlib import Path
import unittest
from unittest.mock import patch

from floor_reinforcement import reference_floor_reinforcement_settings
from floor_section_model import load_source, reference_case, run
from floor_section_successor import necessary_strain_section
from vertical_floor_plate import mitc4_element


class FloorSectionTest(unittest.TestCase):
    def test_strain_equilibrium_exposes_overreinforced_shallow_and_near_exhausted_deep_strips(self):
        settings=reference_floor_reinforcement_settings()
        for h,pitch,capacity in ((200,80,86.833302372),(200,100,74.268783155),(250,100,114.48116912),(250,80,137.15647638)):
            area=math.pi*16**2/4*1000/pitch;d=h-50-24-10
            r=necessary_strain_section({'settings':settings,'section':{'adverseInnerEffectiveDepthMm':d,'barAreaPerMetreEachFaceDirectionMm2':area},'momentInspectionKNmPerM':113.92391522})
            self.assertAlmostEqual(r['strainCompatibleCapacityKNmPerM'],capacity,delta=2e-6)
            self.assertLess(abs(r['forceResidualN']),1e-7)
            self.assertFalse(r['reinforcementAccepted']);self.assertFalse(r['localStressConvergenceProven'])
            if h==200 and pitch==80:self.assertFalse(r['steelYields'])
            if h==250 and pitch==100:self.assertLess(r['reserveRatio'],.005)

    def test_independent_shear_and_bending_thickness_scaling_in_actual_mitc4_operator(self):
        law={'elasticModulusMPa':33000.,'poissonRatio':.2,'thicknessMm':200.,'flexuralFactor':.25,'shearFactor':.5,'unitWeightKNPerM3':25.}
        rect=[0,0,800,1100]
        old,_=mitc4_element(rect,law);new,_=mitc4_element(rect,{**law,'thicknessMm':250.})
        shear,_=mitc4_element(rect,{**law,'flexuralFactor':0.})
        for i in range(12):
            for j in range(12):
                expected=shear[i][j]*1.25+(old[i][j]-shear[i][j])*1.25**3
                self.assertAlmostEqual(new[i][j],expected,delta=max(1e-7,abs(expected)*1e-12))

    def test_unsupported_thickness_and_stale_sources_reject_before_any_physical_build(self):
        source=load_source(Path(__file__).resolve().parents[3]);base=reference_case(source)
        with patch('floor_section_model._build_base',side_effect=AssertionError('Must reject before assembly')):
            for invalid in (True,199.9,250.1,float('nan'),float('inf')):
                case=copy.deepcopy(base);case['thicknessMm']=invalid
                with self.assertRaisesRegex(ValueError,'200..250'):run(case,source,'invalid')
            case=copy.deepcopy(base);case['sourceSHA256']={}
            with self.assertRaisesRegex(ValueError,'Exact current'):run(case,source,'stale')


if __name__=='__main__':unittest.main()
