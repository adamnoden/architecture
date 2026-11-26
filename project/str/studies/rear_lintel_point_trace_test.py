"""Independent ordinary beam/contact and complete physical point-cut controls."""
import copy,math,unittest
import numpy as np
from joined_successor_kernel import FrameModel,rectangle_section,cross
from rear_direct_bearing import lintel_point_trace,register_solved_lintel_contacts,verify_solved_lintel_contacts
from rc_floor_house_loads import recovered_member_actions,member_load_equilibrium,_member_left_resultant
import rear_direct_bearing_test as fixture
LAW=fixture.LAW

class OrdinaryBeamPointOracle(unittest.TestCase):
    def model(self):
        frame=FrameModel();nodes=[frame.node('beam/'+str(i),[0.,500.*i,0.]) for i in range(5)]
        model={'model':frame,'members':{},'request':{'frameLaw':copy.deepcopy(LAW)}};names=[]
        for i,(a,b) in enumerate(zip(nodes,nodes[1:])):
            name='beam/member/'+str(i);names.append(name);frame.member(name,a,b,rectangle_section(300,200),LAW,y_axis=[1,0,0])
            model['members'][name]={'a':a,'b':b,'physicalStartMm':list(frame.nodes[a]),'physicalEndMm':list(frame.nodes[b]),
                'depthMm':300.,'breadthMm':200.,'yAxisGlobal':[1,0,0],'kind':'seated-wet-beam'}
        return model,names,nodes

    def solved(self,y,load=10.):
        model,names,nodes=self.model();frame=model['model'];trace=lintel_point_trace(model,names,[0.,y,-150.])
        body=frame.node('body',[0.,y,-160.])
        for node in nodes:
            for axis in (0,1,4,5):frame.fixed[node,axis]=0.
        for node in (nodes[0],nodes[-1]):frame.fixed[node,2]=0.
        for axis in (0,1,3,4,5):frame.fixed[body,axis]=0.
        frame.springs=[{'id':'body','terms':[[body,[0.,0.,1.,0.,0.,0.]]],'stiffness':1.3,'mode':'bilateral','gap':0.},
            {'id':'contact','terms':[*trace['upperTerms'],[body,[0.,0.,-1.,0.,0.,0.]]],'stiffness':3.7,'mode':'compression','gap':0.}]
        frame.load(nodes[2],[0.,0.,-load,0.,0.,0.]);frame.load(body,[0.,0.,-.01,0.,0.,0.])
        raw=frame.solve()
        # Independent closed-form Timoshenko element in the physical w/thetaX plane.
        e=8250./1000;ei=e*200*300**3/12;ga=e/(2*1.2)*(5/6)*200*300;length=500.
        phi=12*ei/(ga*length**2);factor=ei/((1+phi)*length**3)
        element=factor*np.array([[12,6*length,-12,6*length],[6*length,(4+phi)*length**2,-6*length,(2-phi)*length**2],
            [-12,-6*length,12,-6*length],[6*length,(2-phi)*length**2,-6*length,(4+phi)*length**2]],float)
        matrix=np.zeros((11,11))
        for i in range(4):
            indices=[2*i,2*i+1,2*i+2,2*i+3]
            matrix[np.ix_(indices,indices)]+=element
            native=np.array(frame.members[i][3]);native_plane=native[np.ix_([2,3,8,9],[2,3,8,9])]
            np.testing.assert_allclose(native_plane,element,rtol=1e-12,atol=1e-8)
        matrix[10,10]+=1.3
        shape=np.zeros(11)
        # Native trace is tested against an independent closed polynomial.
        segment=min(int(y/500),3);v=(y-segment*500)/500;den=1+phi
        n=np.array([(1-3*v*v+2*v**3+phi*(1-v))/den,
            length*(v-2*v*v+v**3+phi*(v-v*v)/2)/den,
            (3*v*v-2*v**3+phi*v)/den,length*(-v*v+v**3+phi*(-v+v*v)/2)/den])
        shape[2*segment:2*segment+4]=n;shape[10]=-1.
        mapped=np.zeros(11)
        for node,row in trace['upperTerms']:
            i=nodes.index(node);mapped[2*i]+=row[2];mapped[2*i+1]+=row[3]
        np.testing.assert_allclose(mapped[:10],shape[:10],rtol=1e-12,atol=1e-9)
        active=next(s for s in raw['springs'] if s['id']=='contact')['active']
        if active:matrix+=3.7*np.outer(shape,shape)
        force=np.zeros(11);force[4]=-load;force[10]=-.01
        free=[i for i in range(11) if i not in (0,8)];solution=np.zeros(11)
        solution[free]=np.linalg.solve(matrix[np.ix_(free,free)],force[free])
        actual=np.array([v for node in nodes for v in (raw['displacements'][node][2],raw['displacements'][node][3])]+[raw['displacements'][body][2]])
        np.testing.assert_allclose(actual,solution,rtol=1e-9,atol=1e-9)
        spring=next(s for s in raw['springs'] if s['id']=='contact')
        self.assertAlmostEqual(spring['forceKN'],3.7*float(shape@solution) if active else 0.,places=8)
        return model,trace,raw,spring

    def test_independent_dense_Timoshenko_body_contact_oracle(self):
        _,_,_,state=self.solved(713.25)
        self.assertTrue(state['active']);self.assertLess(state['forceKN'],0.)
        _,_,_,state=self.solved(713.25,0.)
        self.assertFalse(state['active']);self.assertEqual(state['forceKN'],0.)

    def test_physical_fibre_crosses_segment_boundary_without_node_or_force_jump(self):
        cases=[self.solved(y) for y in (500.-1e-5,500.,500.+1e-5)]
        values=[v[3]['forceKN'] for v in cases]
        self.assertLess(max(values)-min(values),1e-7)
        self.assertNotEqual(cases[0][1]['memberId'],cases[-1][1]['memberId'])
        model,names,_=self.model();count=len(model['model'].nodes)
        for y in (499.999,500.,500.001):lintel_point_trace(model,names,[0.,y,-150.])
        self.assertEqual(len(model['model'].nodes),count)
        for p in ([0.,2000.01,-150.],[101.,700.,-150.],[0.,float('nan'),-150.]):
            with self.assertRaises(ValueError):lintel_point_trace(model,names,p)

class CompleteSolvedSupportPointCuts(unittest.TestCase):
    def solved(self):
        model,_,_,_=fixture.PhysicalAdapterControls().built();frame=model['model'];factor=1.35
        for node in ('grid/a','grid/b'):
            for axis in range(6):frame.fixed[node,axis]=0.
        for node in frame.nodes:
            if node.startswith('REAR-LINTEL/section/'):
                for axis in (0,1,4,5):frame.fixed[node,axis]=0.
        for node,row in model['families']['physical-G'].items():frame.load(node,[factor*v for v in row])
        middle=model['seatedWetSupport']['receiver']['stations'][2]['node'];frame.load(middle,[0,0,-1,0,0,0])
        model['rearDirectBearing']['memberRecoveryMultipliers']={'physical-G':factor,'rear-bearing-solved-top':1.}
        raw=frame.solve();before=copy.deepcopy((frame.loads,model['families'],raw))
        register_solved_lintel_contacts(model,raw)
        self.assertEqual(before,(frame.loads,model['families'],raw))
        return model,raw

    def test_actual_support_force_origins_and_independent_opposite_end_cuts(self):
        model,raw=self.solved();data=model['rearDirectBearing'];mult=data['memberRecoveryMultipliers']
        self.assertEqual(data['solvedTopLoadRecovery']['actualContactCount'],32)
        self.assertTrue(all(r['forceOnBeamKN'][2]>=0 for r in data['solvedTopLoadRecovery']['physicalRows']))
        recovered=recovered_member_actions(model,raw,mult)
        self.assertLess(member_load_equilibrium(model,recovered,mult)['maximumResidualKN_KNm'],1e-7)
        for name,member in model['members'].items():
            p,q=member['physicalStartMm'],member['physicalEndMm'];length=q[1]-p[1]
            stations={length/2}
            for family in model['memberPointLoads']:
                stations.update(c['pointXYZMm'][1]-p[1] for c in model['memberPointLoads'][family].get(name,[]))
            end=recovered['memberEndWrenchesKN_KNmm'][name][6:]
            for s in stations:
                for side in ('left','right'):
                    at=[p[0],p[1]+s,p[2]];force=[-v for v in end[:3]]
                    moment=[-v for v in end[3:]]
                    shift=cross([a-b for a,b in zip(model['model'].nodes[member['b']],at)],[-v for v in end[:3]])
                    moment=[a+b for a,b in zip(moment,shift)]
                    for family,factor in mult.items():
                        for card in model.get('memberPointLoads',{}).get(family,{}).get(name,[]):
                            y=card['pointXYZMm'][1]-p[1]
                            if y<s-1e-7 or (side=='right' and abs(y-s)<1e-7):continue
                            f=[factor*v for v in card['forceKN']]
                            m=cross([a-b for a,b in zip(card['pointXYZMm'],at)],f)
                            force=[a-b for a,b in zip(force,f)]
                            moment=[a-b-factor*c for a,b,c in zip(moment,m,card['momentKNmm'])]
                        for card in model.get('memberDistributedLoads',{}).get(family,{}).get(name,[]):
                            lo=max(s,card['s0Mm']);hi=card['s1Mm']
                            if hi<=lo:continue
                            f=[factor*(hi-lo)*v for v in card['forceDensityKNPerMm']]
                            point=[p[0],p[1]+(lo+hi)/2,p[2]];m=cross([a-b for a,b in zip(point,at)],f)
                            force=[a-b for a,b in zip(force,f)]
                            moment=[a-b-factor*(hi-lo)*c for a,b,c in zip(moment,m,card['momentDensityKNmmPerMm'])]
                    left_f,left_m=_member_left_resultant(model,name,member,recovered,mult,s,side)
                    np.testing.assert_allclose(left_f,force,atol=1e-7,rtol=1e-9)
                    np.testing.assert_allclose(left_m,moment,atol=1e-4,rtol=1e-9)

    def test_missing_doubled_moved_or_refactored_point_origins_reject(self):
        model,raw=self.solved();family='rear-bearing-solved-top'
        for label in ('omit','double','force','point','factor','equivalent','body-point','bedding'):
            changed=copy.deepcopy(model);cards=next(v for v in changed['memberPointLoads'][family].values() if v)
            if label=='omit':cards.pop()
            elif label=='double':cards.append(copy.deepcopy(cards[0]))
            elif label=='force':cards[0]['forceKN'][2]+=1
            elif label=='point':cards[0]['pointXYZMm'][1]+=1
            elif label=='factor':changed['rearDirectBearing']['memberRecoveryMultipliers'][family]=1.35
            elif label=='equivalent':next(iter(changed['memberEquivalentLoads'][family].values()))[2]+=1
            elif label=='body-point':changed['rearDirectBearing']['bearingBodies'][0]['xyMm'][1]+=1
            else:next(c for cs in changed['memberPointLoads']['physical-G'].values() for c in cs if 'bedding-top-G' in c.get('id',''))['forceKN'][2]+=1
            with self.subTest(label=label),self.assertRaises(ValueError):verify_solved_lintel_contacts(changed,raw)

if __name__=='__main__':unittest.main()
