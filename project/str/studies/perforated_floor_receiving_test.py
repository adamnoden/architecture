import copy
import unittest

from perforated_floor_condensation import compile_perforated_floor


def fixture():
    patches=[{'id':str(i),'originXYMm':[x,y],'rectangles':[[x-50,y-50,x+50,y+50]]} for i,(x,y) in enumerate([(0,0),(1000,0)])]
    stations=[]
    for i,x in enumerate((0,500,1000)):
        identifier='N'+str(i);patches.append({'id':identifier,'originXYMm':[x,1000],'rectangles':[]});stations.append({'id':identifier,'x':x})
    receiver={'id':'north','axis':0,'datum':1000,'width':140,'lo':0,'hi':1000,'stations':stations,'shearPhi':[.2,.2]}
    loop={'id':'outer-north','axis':0,'datum':1000,'width':140,'depth':200,'lo':0,'hi':1000}
    law={'elasticModulusMPa':1200,'poissonRatio':.15,'shearModulusMPa':440,'thicknessMm':200,'edgeElasticModulusMPa':33000,'edgeFlexuralFactor':.25,'edgeAxialRigidityKN':180000}
    return [[0,0,1000,1000]],[[0,930,1000,1070]],[loop],patches,law,250,[receiver]


class PerforatedFloorReceivingTest(unittest.TestCase):
    def test_y_receiver_preserves_the_physical_operator_under_axis_interchange(self):
        import numpy as np
        bodies,holes,loops,patches,law,pitch,receivers=fixture()
        pressure=[{'forceKN':[0,10,0],'pointXYZMm':[500,1000,3270],'loadedAlongIntervalMm':[0,1000]}]
        original=compile_perforated_floor(bodies,holes,loops,patches,law,pitch,pressure,receivers)
        # Interchanging X/Y preserves the actual triangular diagonals. A ninety
        # degree rotation retriangulates those diagonals and is not an exact
        # same-mesh test. Reflection reverses the axial rotation sign.
        def rectangle(r):return [r[1],r[0],r[3],r[2]]
        rotated_patches=[{**p,'originXYMm':[p['originXYMm'][1],p['originXYMm'][0]],
            'rectangles':[rectangle(r) for r in p['rectangles']]} for p in patches]
        rotated_receivers=[{**r,'axis':1,'datum':r['datum'],
            'stations':[{'id':p['id'],'u':p['x']} for p in r['stations']]} for r in receivers]
        rotated_loops=[{**r,'axis':1,'datum':r['datum']} for r in loops]
        rotated_pressure=[{**pressure[0],'forceKN':[10,0,0],'pointXYZMm':[1000,500,3270]}]
        rotated=compile_perforated_floor([rectangle(r) for r in bodies],[rectangle(r) for r in holes],
            rotated_loops,rotated_patches,law,pitch,rotated_pressure,rotated_receivers)
        # Transform every retained translation and its work-dual load, with
        # the actual rotation in milliradians and the reflected axial sign.
        turn=np.kron(np.eye(len(patches)),np.array([[0,1,0],[1,0,0],[0,0,-1]]))
        expected=turn@np.array(original['condensedStiffnessKNPerMm'])@turn.T
        np.testing.assert_allclose(rotated['condensedStiffnessKNPerMm'],expected,rtol=1e-8,atol=1e-7)
        np.testing.assert_allclose(rotated['condensedForceKN'],turn@original['condensedForceKN'],rtol=1e-8,atol=1e-7)
        self.assertLess(max(rotated['rigidModeResidualKN']),1e-5)

    def test_finite_boundary_retains_rigid_modes_and_work_dual_pressure(self):
        bodies,holes,loops,patches,law,pitch,receivers=fixture()
        pressure=[{'forceKN':[0,10,0],'pointXYZMm':[500,1000,3270],'loadedAlongIntervalMm':[0,1000]}]
        result=compile_perforated_floor(bodies,holes,loops,patches,law,pitch,pressure,receivers)
        self.assertLess(max(result['rigidModeResidualKN']),1e-5)
        forces=result['condensedForceKN']
        self.assertAlmostEqual(sum(forces[3*i] for i in range(5)),0.,8)
        self.assertAlmostEqual(sum(forces[3*i+1] for i in range(5)),10.,8)
        moment=sum(patch['originXYMm'][0]*forces[3*i+1]-patch['originXYMm'][1]*forces[3*i]+1000*forces[3*i+2] for i,patch in enumerate(patches))
        self.assertAlmostEqual(moment,5000.,6)
        self.assertLess(result['modeReconstructionRelativeError'],1e-8)

    def test_full_upstand_replacement_does_not_retain_band_stiffness(self):
        bodies,holes,loops,patches,law,pitch,receivers=fixture()
        a=compile_perforated_floor(bodies,holes,loops,patches,law,pitch,boundary_receivers=receivers)
        changed=copy.deepcopy(law);changed['edgeAxialRigidityKN']*=100;changed['edgeElasticModulusMPa']*=100
        b=compile_perforated_floor(bodies,holes,loops,patches,changed,pitch,boundary_receivers=receivers)
        self.assertEqual(a['condensedStiffnessKNPerMm'],b['condensedStiffnessKNPerMm'])
        self.assertEqual(a['meshTrianglesXYMm'],b['meshTrianglesXYMm'])

    def test_boundary_domain_rejects_missing_port_or_invalid_interpolation(self):
        bodies,holes,loops,patches,law,pitch,receivers=fixture()
        for update in ({'axis':1},{'width':float('nan')},{'shearPhi':[-1,.2]},{'stations':[{'id':'missing','x':0},{'id':'N1','x':500}]}):
            altered=copy.deepcopy(receivers);altered[0].update(update)
            with self.assertRaises(ValueError):compile_perforated_floor(bodies,holes,loops,patches,law,pitch,boundary_receivers=altered)

    def test_explicit_empty_hook_preserves_default_exact_result(self):
        bodies,holes,loops,patches,law,pitch,receivers=fixture()
        default_patches=[{'id':str(i),'originXYMm':[x,y],'rectangles':[[x-50,y-50,x+50,y+50]]} for i,(x,y) in enumerate([(0,0),(1000,0),(0,1000),(1000,1000)])]
        a=compile_perforated_floor(bodies,holes,loops,default_patches,law,pitch)
        b=compile_perforated_floor(bodies,holes,loops,default_patches,law,pitch,boundary_receivers=[])
        self.assertEqual(a,b)


if __name__=='__main__':unittest.main()
