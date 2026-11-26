"""Adverse replay of real normal/base spring observations, no artificial activation."""
import copy,json,os,unittest


def check(packet):
    if len(packet['rows'])!=packet['actualContactCount'] or len({r['fibreId'] for r in packet['rows']})!=packet['actualContactCount']:
        raise ValueError('Missing/duplicate actual physical normal contact')
    for row in packet['rows']:
        g=row['appliedBodyOwnGKN'];top=row['topCompressionKN'];body=row['actualAxialSpringForceKN']
        if abs(row['actualBodyTopAppliedLoadKN']+g/2)>1e-9 or abs((-body+g/2)-top-g)>1e-7:
            raise ValueError('Actual body top/self-G/base spring equilibrium fails')
        if top < -1e-9 or (not row['topActive'] and abs(top)>1e-9):raise ValueError('Unilateral contact law fails')
    return True


@unittest.skipUnless(os.environ.get('STR_CURRENT_FINITE_OBSERVED'),'Actual full-house observed capture required')
class ActualSupportControls(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        with open(os.environ['STR_CURRENT_FINITE_OBSERVED']) as f:cls.packet=json.load(f)['normalSupportObservation']
    def test_actual_body_base_equals_top_plus_ownG(self):self.assertTrue(check(self.packet))
    def test_double_or_removed_ownG_rejects(self):
        for factor in (0,2):
            p=copy.deepcopy(self.packet);p['rows'][0]['appliedBodyOwnGKN']*=factor
            with self.assertRaises(ValueError):check(p)
    def test_changed_actual_axial_force_rejects(self):
        p=copy.deepcopy(self.packet);p['rows'][0]['actualAxialSpringForceKN']+=.01
        with self.assertRaises(ValueError):check(p)
    def test_missing_contact_rejects(self):
        p=copy.deepcopy(self.packet);p['rows'].pop()
        with self.assertRaises(ValueError):check(p)

if __name__=='__main__':unittest.main()
