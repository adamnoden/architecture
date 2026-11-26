"""Exact-zero admission and input-provenance controls; no house solve."""
import copy
import gzip
import hashlib
import json
import os
from pathlib import Path
import unittest
import numpy as np
from current_zero_chord_control import GUARD,NEW_GUARD,OLD_GUARD,MEMBRANE,OLD_MEMBRANE,NEW_MEMBRANE,current_sources,derive_inputs,digest,floor,read,without_identities
from distributed_floor_compatibility import _admit_distributed

class ExactZeroChord(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.wrapper=read(os.environ['STR_ZERO_CHORD_PARENT']);cls.parent=cls.wrapper['result']
        cls.summary=read(os.environ['STR_ZERO_CHORD_SUMMARY']);cls.packet=derive_inputs(cls.parent,cls.summary)
        source,_,_=current_sources();cls.owner=source['bearing']['base']['vertical']['parent']['house']['joined']['floor']

    def test_zero_and_unchanged_positive_are_genuinely_admitted(self):
        for name in ('positive','zero'):_admit_distributed(floor(self.packet['cases'][name]),self.owner)
        self.assertEqual(floor(self.packet['cases']['zero'])['edgeBand']['axialRigidityKN'],0)
        self.assertGreater(floor(self.packet['cases']['positive'])['edgeBand']['axialRigidityKN'],0)

    def test_negative_nan_and_infinite_additional_chord_reject(self):
        for value in (-1.,float('nan'),float('inf')):
            case=copy.deepcopy(self.packet['cases']['zero']);floor(case)['edgeBand']['axialRigidityKN']=value
            with self.subTest(value=value),self.assertRaises(ValueError):_admit_distributed(floor(case),self.owner)

    def test_zero_does_not_allow_zero_or_negative_concrete_modulus(self):
        for value in (0.,-1.):
            case=copy.deepcopy(self.packet['cases']['zero']);floor(case)['edgeBand']['elasticModulusMPa']=value
            with self.subTest(value=value),self.assertRaises(ValueError):_admit_distributed(floor(case),self.owner)

    def test_only_authorised_guard_byte_changed(self):
        for path,old_guard,new_guard in ((GUARD,OLD_GUARD,NEW_GUARD),(MEMBRANE,OLD_MEMBRANE,NEW_MEMBRANE)):
            text=Path(path).read_text()
            self.assertEqual(text.count(new_guard),1);self.assertNotIn(old_guard,text)
            self.assertEqual(hashlib.sha256(text.replace(new_guard,old_guard).encode()).hexdigest(),self.summary['sourceSHA256'][path])

    def test_inputs_change_only_fresh_identity_and_explicit_extra_chord(self):
        old_digest=digest(self.parent);packet=derive_inputs(self.parent,self.summary)
        self.assertEqual(without_identities(packet['cases']['positive']),without_identities(self.parent['authoredNativeCase']))
        check=copy.deepcopy(packet['cases']['zero']);floor(check)['edgeBand']['axialRigidityKN']=floor(packet['cases']['positive'])['edgeBand']['axialRigidityKN']
        self.assertEqual(check,packet['cases']['positive']);self.assertEqual(digest(self.parent),old_digest)
        self.assertFalse(packet['currentSavedEngineeringDocumentAdmitted'])

    def test_retained_rc_has_positive_relative_extension_and_rigid_null(self):
        ea=8250.*140.*200./1000.;self.assertEqual(ea,231000.)
        base=np.array([[1.,-1.],[-1.,1.]])
        for length in (140.,200.,1000.):
            k=ea/length*base
            np.testing.assert_allclose(k@np.ones(2),[0.,0.],atol=1e-9,rtol=0)
            e=np.linalg.eigvalsh(k);self.assertGreaterEqual(e[0],-1e-9);self.assertAlmostEqual(e[1],2*ea/length,delta=1e-9)
            u=np.array([0.,.1]);self.assertGreater(float(.5*u@k@u),0.)
        young=8250.;poisson=.2
        self.assertGreater(young/(2*(1+poisson)),0.);self.assertGreater(young/(3*(1-2*poisson)),0.)

    def membrane_fixture(self,extra):
        law={'elasticModulusMPa':8250.,'poissonRatio':.2,'shearModulusMPa':3437.5,'thicknessMm':200.,
             'edgeElasticModulusMPa':8250.,'edgeFlexuralFactor':1.,'edgeAxialRigidityKN':extra}
        ports=[{'id':name,'originXYMm':[x,y],'rectangles':[[x-70,y-70,x+70,y+70]],'node':name}
               for name,x,y in (('SW',70.,70.),('SE',930.,70.),('NE',930.,930.),('NW',70.,930.))]
        loops=[{'id':name,'axis':axis,'datum':datum,'lo':70.,'hi':930.,'width':140.,'depth':200.}
               for name,axis,datum in (('south',0,70.),('north',0,930.),('west',1,70.),('east',1,930.))]
        return [[0.,0.,1000.,1000.]],loops,ports,law

    def test_actual_native_kernel_accepts_zero_with_concrete_relative_energy(self):
        from perforated_floor_condensation import compile_perforated_floor
        body,loops,ports,law=self.membrane_fixture(0.)
        zero=compile_perforated_floor(body,[],loops,ports,law,250.)
        law=copy.deepcopy(law);law['edgeAxialRigidityKN']=180955.73684677208
        positive=compile_perforated_floor(body,[],loops,ports,law,250.)
        kz=np.array(zero['condensedStiffnessKNPerMm']);kp=np.array(positive['condensedStiffnessKNPerMm'])
        self.assertGreater(zero['membraneAreaM2'],0.);self.assertEqual(zero['unqualifiedLaw']['edgeAxialRigidityKN'],0.)
        u=np.zeros(12);u[3]=1.;self.assertGreater(float(.5*u@kz@u),0.)
        self.assertLess(max(zero['rigidModeResidualKN']),1e-3)
        scale=max(1.,float(abs(kp-kz).max()))
        self.assertGreaterEqual(float(np.linalg.eigvalsh((kp-kz+kp.T-kz.T)/2).min()),-scale*1e-8)

    def test_native_kernel_zero_exception_cannot_zero_other_laws(self):
        from perforated_floor_condensation import compile_perforated_floor
        body,loops,ports,law=self.membrane_fixture(0.)
        for value in (-1.,float('nan'),float('inf'),False):
            bad=copy.deepcopy(law);bad['edgeAxialRigidityKN']=value
            with self.subTest(extra=value),self.assertRaises(ValueError):compile_perforated_floor(body,[],loops,ports,bad,250.)
        for key in law:
            if key in ('edgeAxialRigidityKN','poissonRatio'):continue
            bad=copy.deepcopy(law);bad[key]=0.
            with self.subTest(law=key),self.assertRaises(ValueError):compile_perforated_floor(body,[],loops,ports,bad,250.)
        for value in (-.1,.5,float('nan')):
            bad=copy.deepcopy(law);bad['poissonRatio']=value
            with self.subTest(poisson=value),self.assertRaises(ValueError):compile_perforated_floor(body,[],loops,ports,bad,250.)


if __name__=='__main__':unittest.main()
