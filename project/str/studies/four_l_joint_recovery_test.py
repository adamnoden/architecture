import copy
import math
import unittest

from four_l_joint_recovery import add, recover, recover_joint, scale, transport, verify_passivity


def specimen():
    # Known joint actions: lower +20kN, upper -3kN, floor -10kN,
    # independently applied -7kN. End cards additionally contain member G.
    return {'id':'SW','referenceXYZMm':[500,600,3170], 'memberEnds':[
        {'memberId':'SW/upper-wall','role':'lower','masterXYZMm':[500,600,3170],
            'physicalCutXYZMm':[500,600,3170], 'rawMasterWrenchKN_KNmm':[0,0,-22,0,0,0],
            'equivalentBodyLoadMasterKN_KNmm':[0,0,-2,0,0,0]},
        {'memberId':'JOINED-ROOF/upper-L/SW','role':'upper','masterXYZMm':[500,600,3170],
            'physicalCutXYZMm':[500,600,3370], 'rawMasterWrenchKN_KNmm':[0,0,2,0,0,0],
            'equivalentBodyLoadMasterKN_KNmm':[0,0,-1,0,0,0]}],
        'componentReactions':[{'id':'plate','originXYZMm':[500,600,3170],
            'forceOnComponentKN_KNm':[0,0,10,0,0,0]}],
        'directAppliedLoads':[{'id':'independently-authored-card','originXYZMm':[500,600,3170],
            'wrenchKN_KNm':[0,0,-7,0,0,0]}]}


class JointRecovery(unittest.TestCase):
    def test_member_body_g_is_removed_once_and_actions_reversed(self):
        result=recover_joint(specimen())
        self.assertEqual(result['freeBodyResidualKN_KNm'],[0]*6)
        self.assertEqual(result['memberCuts'][0]['forceOnMemberAtPhysicalCutKN_KNm'],[0,0,-20,0,0,0])
        self.assertEqual(result['memberCuts'][1]['memberOnJointAtReferenceKN_KNm'],[0,0,-3,0,0,0])
        self.assertFalse(result['finiteJointCapacityAvailable'])

    def test_transport_units_sign_and_work_conjugacy(self):
        wrench=[3,5,7,11,13,17]; origin=[230,450,3370]; destination=[570,680,3170]
        shifted=transport(wrench,origin,destination)
        self.assertAlmostEqual(shifted[3],11-.23*7-.2*5)
        self.assertAlmostEqual(shifted[4],13+.2*3+.34*7)
        # Virtual rigid motion: velocity at origin = v_dest + theta x r.
        v=[.31,-.11,.27]; theta=[.02,.03,-.04]
        r=[(a-b)/1000 for a,b in zip(origin,destination)]
        vo=[v[0]+theta[1]*r[2]-theta[2]*r[1],v[1]+theta[2]*r[0]-theta[0]*r[2],v[2]+theta[0]*r[1]-theta[1]*r[0]]
        work=lambda f,p:sum(a*b for a,b in zip(f[:3],p))+sum(a*b for a,b in zip(f[3:],theta))
        self.assertAlmostEqual(work(wrench,vo),work(shifted,v))
        self.assertLess(max(abs(a-b) for a,b in zip(transport(shifted,destination,origin),wrench)),1e-12)

    def test_physical_cut_offsets_preserve_full_reference_wrench(self):
        row=specimen(); member=row['memberEnds'][1]
        # An actual horizontal member action creates a cut couple over 200mm.
        member['rawMasterWrenchKN_KNmm']=[4,-6,2,700,1100,-500]
        result=recover_joint(row)['memberCuts'][1]
        for actual,expected in zip(result['forceOnMemberAtPhysicalCutKN_KNm'],[4,-6,3,-.5,.3,-.5]):
            self.assertAlmostEqual(actual,expected)
        for actual,expected in zip(result['memberOnJointAtReferenceKN_KNm'],[-4,6,-3,-.7,-1.1,.5]):
            self.assertAlmostEqual(actual,expected)

    def test_real_load_change_is_not_fitted_away_and_reversal_restores(self):
        row=specimen(); unchanged=copy.deepcopy(row)
        row['directAppliedLoads'][0]['wrenchKN_KNm'][2]-=2
        self.assertEqual(recover_joint(row)['freeBodyResidualKN_KNm'],[0,0,-2,0,0,0])
        row['directAppliedLoads'][0]['wrenchKN_KNm'][2]+=2
        self.assertEqual(recover_joint(row),recover_joint(unchanged))
        self.assertEqual(unchanged,specimen())

    def test_all_six_components_survive_recovery(self):
        row=specimen(); load=[2,3,5,7,11,13]
        row['directAppliedLoads'][0]['wrenchKN_KNm']=add(row['directAppliedLoads'][0]['wrenchKN_KNm'],load)
        self.assertEqual(recover_joint(row)['freeBodyResidualKN_KNm'],load)

    def test_topology_and_nonfinite_are_rejected(self):
        row=specimen(); row['memberEnds'].pop()
        with self.assertRaises(ValueError):recover_joint(row)
        with self.assertRaises(ValueError):transport([math.nan]*6,[0]*3,[0]*3)
        with self.assertRaises(ValueError):recover({'schema':'str-four-L-joint-observation/1','joints':[specimen()]})

    def test_full_native_passivity_join_rejects_stale_or_partial_controls(self):
        joints=[]
        for identity in ('SW','SE','NW','NE'):
            row=specimen();row['id']=identity;joints.append(row)
        observation={'schema':'str-four-L-joint-observation/1','joints':joints,
            'sourceSHA256':{'native.py':'source'},'requestSHA256':'request','caseId':'bounded-case',
            'fullNativeResultSHA256':'entire-result','physicalCutSHA256':'all-physical-cuts',
            'physicalHeadCount':52,'heads':[{'id':'P'+str(i),'reactionKN_KNm':[0]*6} for i in range(52)]}
        observed={'observation':observation,'freeBodies':recover(observation)}
        ordinary={**{k:v for k,v in observation.items() if k not in ('schema','joints')},
            'schema':'str-four-L-joint-ordinary-control/1'}
        self.assertTrue(verify_passivity(ordinary,observed)['exactFullResultEqualityVerified'])
        for key in ('sourceSHA256','requestSHA256','caseId','fullNativeResultSHA256','physicalCutSHA256'):
            changed=copy.deepcopy(ordinary);changed[key]='changed'
            with self.subTest(key=key),self.assertRaises(ValueError):verify_passivity(changed,observed)
        changed=copy.deepcopy(observed);changed['freeBodies']['joints'][0]['freeBodyResidualKN_KNm'][0]=1
        with self.assertRaises(ValueError):verify_passivity(ordinary,changed)
        changed=copy.deepcopy(observed)
        changed['observation']['joints'][0]['directAppliedLoads'][0]['wrenchKN_KNm'][0]+=1
        changed['freeBodies']=recover(changed['observation'])
        with self.assertRaises(ValueError):verify_passivity(ordinary,changed)


if __name__=='__main__':unittest.main()
