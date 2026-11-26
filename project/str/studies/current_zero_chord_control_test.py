"""Exact-zero admission and input-provenance controls; no house solve."""
import copy
import gzip
import hashlib
import json
import os
from pathlib import Path
import unittest
import numpy as np
from current_zero_chord_control import GUARD,NEW_GUARD,OLD_GUARD,current_sources,derive_inputs,digest,floor,read,without_identities
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
        text=Path(GUARD).read_text()
        self.assertEqual(text.count(NEW_GUARD),1);self.assertNotIn(OLD_GUARD,text)
        self.assertEqual(hashlib.sha256(text.replace(NEW_GUARD,OLD_GUARD).encode()).hexdigest(),self.summary['sourceSHA256'][GUARD])

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

if __name__=='__main__':unittest.main()
