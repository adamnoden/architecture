"""Focused domain and independent existing-element checks; no native house solve."""
import copy,math,unittest
from pathlib import Path

from floor_section_model import load_source
from uniform_slab_law import differences,law,metrics,row_deltas
from uniform_slab_law_proof import changed_request,expected_control,read_controls
from vertical_floor_plate import mitc4_element

ROOT=Path(__file__).resolve().parents[3]

class UniformSlabLawTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.controls=read_controls();cls.control=expected_control(load_source(ROOT),cls.controls)

    def test_complete_actual_request_changes_only_six_authored_law_fields(self):
        old=copy.deepcopy(self.control);new=changed_request(old,self.controls)
        self.assertEqual(old,self.control)
        changed={r['path'] for r in differences(old,new)}
        prefix='/bearingCase/masonryCase/verticalCase/'
        self.assertEqual(changed,{prefix+'plateLaw/'+s for s in ['elasticModulusMPa','flexuralFactor','shearFactor']}|
            {prefix+'monolithicCase/houseCase/joinedCase/floor/membraneLaw/'+s
                for s in ['elasticModulusMPa','poissonRatio','shearModulusMPa']})
        self.assertEqual(old['wetSupport'],new['wetSupport'])
        self.assertEqual(new['thicknessMm'],200)

    def test_uniform_operators_match_independent_closed_form(self):
        changed=changed_request(self.control,self.controls);values=law(changed)
        e,nu,h=8250,.2,200;g=e/(2*(1+nu))
        self.assertAlmostEqual(values['A11_N_per_mm'],e*h/(1-nu**2))
        self.assertAlmostEqual(values['D11_N_mm'],e*h**3/(12*(1-nu**2)))
        self.assertAlmostEqual(values['A66_N_per_mm'],g*h)
        self.assertAlmostEqual(values['transverseS_N_per_mm'],5/6*g*h)
        self.assertAlmostEqual(values['positiveCommonModulusNecessaryRatio'],1/3)

    def test_equivalent_authored_representation_reproduces_actual_mitc4_stiffness_and_gravity(self):
        direct=changed_request(self.control,self.controls)['bearingCase']['masonryCase']['verticalCase']['plateLaw']
        alternative=copy.deepcopy(direct);alternative.update(elasticModulusMPa=33000,flexuralFactor=.25,shearFactor=5/24)
        a,ga=mitc4_element([1370,390,1620,740],direct);b,gb=mitc4_element([1370,390,1620,740],alternative)
        scale=max(abs(v) for row in a for v in row)
        self.assertLess(max(abs(v-w) for r,s in zip(a,b) for v,w in zip(r,s))/scale,1e-14)
        self.assertEqual(ga,gb)

    def test_membrane_only_change_cannot_preserve_old_transverse_shear_with_supported_correction(self):
        old=law(self.control);changed=law(changed_request(self.control,self.controls))
        uncorrected_uniform_shear=changed['A66_N_per_mm']
        self.assertAlmostEqual(old['transverseS_N_per_mm']/uncorrected_uniform_shear,2)
        self.assertAlmostEqual(changed['transverseS_N_per_mm']/old['transverseS_N_per_mm'],5/12)
        self.assertGreater(old['positiveCommonModulusNecessaryRatio'],1)

    def test_unsupported_or_overclaimed_controls_are_not_silently_adjusted(self):
        for edit in [lambda x:x.update(materialQualified=True),lambda x:x['uniformSlabLaw'].update(elasticModulusMPa=1200),
            lambda x:x['uniformSlabLaw'].update(transverseShearCorrectionFactor=2),
            lambda x:x['control'].update(padWidthMm=140),lambda x:x.update(extra='derived-pass')]:
            value=copy.deepcopy(self.controls);edit(value)
            with self.assertRaises(ValueError):read_controls(value)
        different=copy.deepcopy(self.control);different['thicknessMm']=250
        with self.assertRaises(ValueError):changed_request(different,self.controls)

    def test_distinct_moment_stationary_cuts_cannot_be_zipped_as_same_physical_section(self):
        a=[{'memberId':'beam','physicalPointMm':[0,0,0],'fraction':.5,'moment':3}]
        b=[{'memberId':'beam','physicalPointMm':[0,1,0],'fraction':.6,'moment':4}]
        with self.assertRaises(ValueError):row_deltas(a,b,['moment'],['memberId','physicalPointMm','fraction'])

if __name__=='__main__':unittest.main()
