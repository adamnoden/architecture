import copy
import unittest
from types import SimpleNamespace
from fixed_normal_experiment import upper_trace,install,uncovered


def fixture():
    points=[(0.,0.),(200.,0.),(200.,100.),(0.,100.)]
    data={'cells':[(0.,0.,200.,100.)],'portTerms':[[(str(i),[0.,0.,1.,0.,0.,0.])] for i in range(4)],
      'operator':{'assembled':{'pointTerms':{(p,0):[(i,1.)] for i,p in enumerate(points)}}},
      'cores':[{'id':'core','materialKind':'source-core-material-unqualified'}],
      'request':{'bearingLaw':{'masonryModulusMPa':20000.,'jointNormalComplianceMmPerMPa':.1}},
      'fibres':[{'id':'normal'}],'missingGroundContactFibres':[]}
    frame=SimpleNamespace(nodes={**{str(i):[x,y,1000.] for i,(x,y) in enumerate(points)},'G':[50.,25.,0.]},
      springs=[{'id':'normal','old':True},{'id':'other','stiffness':7.}])
    model={'verticalFloor':data,'model':frame,'request':{'frameLaw':{'elasticModulusMPa':30000.}},'seatedWetSupport':{'receiver':{'stations':[{'u':0.},{'u':1.}]}}}
    fibre={'id':'normal','ownerId':'core','xyMm':[50.,25.],'areaMm2':100.,'heightMm':1000.,'stiffnessKNPerMm':100./(1000./20000.+.1)/1000.}
    ledger={'bearingLaw':copy.deepcopy(data['request']['bearingLaw']),'frameLaw':copy.deepcopy(model['request']['frameLaw']),'beamStationsYMm':[0.,1.],
      'rows':[{'fibre':fibre,'groundTerms':[('G',[0.,0.,1.,0.,0.,0.])],'groundCoordinatesMm':{'G':[50.,25.,0.]}}]}
    return model,ledger


class TraceTest(unittest.TestCase):
    def test_physical_first_moments_and_rigid_work(self):
        m,_=fixture();terms,audit=upper_trace(m['verticalFloor'],[50.,25.])
        self.assertEqual({n:r[2] for n,r in terms},{'0':.5625,'1':.1875,'2':.0625,'3':.1875})
        value=sum(r[2]*(1+.001*m['model'].nodes[n][1]-.002*m['model'].nodes[n][0]) for n,r in terms)
        self.assertAlmostEqual(value,1+.001*25-.002*50)
        self.assertLess(audit['partitionResidual'],1e-12);self.assertLess(audit['firstMomentResidualMm'],1e-12)
    def test_void_or_outside_is_not_a_nearest_node(self):
        m,_=fixture()
        for p in ([201,50],[-1,50],[50,101]):
            with self.assertRaisesRegex(ValueError,'no current plate material'):upper_trace(m['verticalFloor'],p)
    def test_six_coordinate_ground_work_and_failed_install_does_not_mutate(self):
        m,l=fixture();before=copy.deepcopy(l);install(m,l)
        self.assertEqual(m['model'].springs[0],{'id':'other','stiffness':7.})
        self.assertEqual(m['model'].springs[1]['terms'][-1],('G',[0.,0.,-1.,0.,0.,0.]))
        self.assertAlmostEqual(sum(r[2] for _,r in m['model'].springs[1]['terms']),0.)
        self.assertEqual(l,before)
        m,l=fixture();l['rows'][0]['groundCoordinatesMm']['G'][0]+=1;before=copy.deepcopy(m)
        with self.assertRaisesRegex(ValueError,'Changed actual ground receiver'):install(m,l)
        self.assertEqual(m['model'].springs,before['model'].springs);self.assertEqual(m['verticalFloor'],before['verticalFloor'])
    def test_identical_volume_is_not_identical_body_geometry(self):
        a=[{'boxXYZMm':[0,0,0,4,3,2]}];b=[{'boxXYZMm':[0,0,0,2,3,2]},{'boxXYZMm':[2,0,0,4,3,2]}];c=[{'boxXYZMm':[1,0,0,5,3,2]}]
        self.assertEqual(uncovered(a,b),0);self.assertEqual(uncovered(b,a),0)
        self.assertEqual(uncovered(a,c),6);self.assertEqual(uncovered(c,a),6)


if __name__=='__main__':unittest.main()
