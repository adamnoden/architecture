import copy
import unittest
from finite_floor_contour_compare import check_receipt


class ContourScalarReplayTest(unittest.TestCase):
    def result(self):
        return {'comparisons':[{'fromPitchMm':140,'toPitchMm':70,
            'maximumRelativeEnergySensitivity':.12,'minimumRelativeEnergyChange':.00001,'maximumRelativeEnergyChange':.12}],
            'captureSHA256':{'coarse':'unchanged','fine':'unchanged'},'processingMethodSHA256':'unchanged',
            'convergenceAcceptanceClaimed':False}

    def test_runner_roundoff_is_not_physical_convergence(self):
        old=self.result();new=copy.deepcopy(old)
        new['comparisons'][0]['maximumRelativeEnergySensitivity']+=1e-14
        check_receipt(old,new)
        self.assertFalse(new['convergenceAcceptanceClaimed'])
        self.assertEqual(old,self.result())

    def test_changed_eigenvalue_or_nonfinite_does_not_hide_in_replay(self):
        for value in (.12000001,float('nan'),float('inf'),True):
            new=self.result();new['comparisons'][0]['maximumRelativeEnergySensitivity']=value
            with self.assertRaises(ValueError):check_receipt(self.result(),new)

    def test_all_provenance_mesh_and_claim_fields_remain_exact(self):
        for key,value in [('captureSHA256',{'coarse':'changed','fine':'unchanged'}),
                          ('processingMethodSHA256','changed'),('convergenceAcceptanceClaimed',True)]:
            new=self.result();new[key]=value
            with self.assertRaises(ValueError):check_receipt(self.result(),new)
        new=self.result();new['comparisons'][0]['toPitchMm']=50
        with self.assertRaises(ValueError):check_receipt(self.result(),new)


if __name__=='__main__':unittest.main()
