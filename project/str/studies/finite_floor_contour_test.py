import copy, unittest, json, os, tarfile, tempfile
from pathlib import Path
from finite_floor_contour_run import source_input, same_physics
import numpy as np
from skfem import LinearForm,asm
from finite_floor_contour import solid_boxes, contour_ports, condense, rigid_port_modes, rigid_trace, shell_trace

class DistributedContourControls(unittest.TestCase):
    def model(self,scale=1,young=33e6):
        patch=np.array([0,0,.5,.6])*scale;slab=np.array([.2,.3])*scale
        # Slab plus disjoint L arms above/below, preserving the re-entrant void.
        boxes=np.array([[0,0,.2,.5,.6,.3], [0,0,0,.1,.3,.2],[.1,0,0,.3,.1,.2],
                        [0,0,.3,.1,.3,.5],[.1,0,.3,.3,.1,.5]])*scale
        contours={'east':np.array([0,.2,.6])*scale,'north':np.array([0,.15,.5])*scale}
        origins=np.array([[.11,.11,0],[.11,.11,.5]])*scale
        mesh,basis,k,volume=solid_boxes(boxes,.1*scale,young,.2,(contours['north'],contours['east'],()))
        t,boundary,ports=contour_ports(mesh,basis,patch,slab,contours,origins)
        @LinearForm
        def body(v,w):return -25*v[2]
        force=asm(body,basis)
        return mesh,basis,k,volume,t,boundary,ports,force

    def test_distributed_trace_rigid_motion_and_independent_virtual_work(self):
        for scale in [1,1.7]:
            mesh,basis,k,volume,t,boundary,ports,force=self.model(scale)
            modes=rigid_port_modes(ports);native=np.zeros((basis.N,6))
            for i,point in enumerate(mesh.p.T):native[basis.nodal_dofs[:,i]]=rigid_trace(point,np.zeros(3))
            np.testing.assert_allclose((t @ modes)[boundary],native[boundary],atol=1e-15)
            # Arbitrary tractions and generalised motion: independent transpose work.
            q=np.sin(np.arange(t.shape[1]))*.00001;f=np.cos(np.arange(basis.N))*.01
            self.assertAlmostEqual(float(f @ (t @ q)),float((t.T @ f) @ q),places=13)
            # Actual port field is distributed: distinct neighbouring stations stay distinct.
            u=np.zeros(t.shape[1]);i=next(i for i,p in enumerate(ports) if p['kind']=='shell' and p['coordinate']=='w');u[i]=1
            self.assertGreater(np.ptp((t @ u)[basis.nodal_dofs[2, :]]),.9)
            self.assertGreater(len([p for p in ports if p['kind']=='shell']),5)

    def test_schur_full_potential_load_wrench_and_six_free_modes(self):
        mesh,basis,k,volume,t,boundary,ports,force=self.model()
        result=condense(k,t,boundary,force);c=result['stiffness'];modes=rigid_port_modes(ports)
        self.assertLess(float(abs(c @ modes).max()/abs(c).max()),1e-11)
        eigen=np.linalg.eigvalsh(c)
        self.assertEqual(np.count_nonzero(eigen>eigen[-1]*1e-9),len(ports)-6)
        # Ordering changes the sparse permutation, never the physical operator.
        alternate=condense(k,t,boundary,force,ordering='COLAMD')
        np.testing.assert_allclose(alternate['stiffness'],c,rtol=1e-10,atol=1e-8)
        np.testing.assert_allclose(alternate['force'],result['force'],atol=1e-10)
        with self.assertRaisesRegex(ValueError,'ordering'):
            condense(k,t,boundary,force,ordering='unqualified')
        q=np.sin(np.arange(t.shape[1]))*.00001
        u=result['response'] @ q+result['particular']
        actual=.5*u @ k @ u-force @ u
        expected=.5*q @ c @ q-result['force'] @ q+result['energyConstant']
        self.assertAlmostEqual(float(actual),float(expected),places=11)
        self.assertLess(float(abs((k @ u-force)[result['interior']]).max()),1e-9)
        native=np.zeros((basis.N,6))
        for i,point in enumerate(mesh.p.T):native[basis.nodal_dofs[:,i]]=rigid_trace(point,np.zeros(3))
        np.testing.assert_allclose(modes.T @ result['force'],native.T @ force,atol=1e-10)
        self.assertAlmostEqual(float((modes.T @ result['force'])[2]),-25*volume,places=11)
        # A material edit changes stiffness; unchanged geometry and G preserve condensed force.
        second=self.model(young=66e6);other=condense(second[2],second[4],second[5],second[7])
        np.testing.assert_allclose(other['stiffness'],2*c,rtol=1e-11,atol=1e-8)
        np.testing.assert_allclose(other['force'],result['force'],atol=1e-10)
        # Floor-only load is an independent distributed load, not an inferred end-force copy.
        @LinearForm
        def floor_load(v,w):return -30*((w.x[2]>.2)&(w.x[2]<.3))*v[2]
        changed=condense(k,t,boundary,force+asm(floor_load,basis))
        self.assertGreater(np.max(abs(changed['force']-result['force'])),.01)
        np.testing.assert_array_equal(changed['stiffness'],c)

    def test_authored_extent_edit_source_identity_and_unchanged_restoration(self):
        root=Path(os.environ.get('STR_CONTOUR_TEST_ROOT',Path(__file__).resolve().parents[3]))
        authored='project/str/studies/finite-floor-contour-inputs.json'
        archive='project/str/studies/fixed-normal-experiment-captures.tar.xz'
        audit='project/str/studies/four-l-joint-material-audit.json'
        with tarfile.open(root/archive,mode='r:xz') as tar:
            capture=json.load(tar.extractfile('v500.full.json'))
        paths=[*capture['methodSourceSHA256'],archive,audit]
        with tempfile.TemporaryDirectory() as directory:
            trial=Path(directory)
            for relative in paths:
                target=trial/relative;target.parent.mkdir(parents=True,exist_ok=True)
                if not target.exists():target.symlink_to(root/relative)
            path=trial/authored;path.parent.mkdir(parents=True,exist_ok=True);original=(root/authored).read_bytes();path.write_bytes(original)
            baseline=source_input(trial)
            changed=json.loads(original);changed['wallEndZMm'][1]+=100;path.write_text(json.dumps(changed))
            revised=source_input(trial)
            self.assertAlmostEqual(revised['wallOriginsMm'][1][2]-baseline['wallOriginsMm'][1][2],100)
            self.assertNotEqual(revised['authoredInputSHA256'],baseline['authoredInputSHA256'])
            self.assertEqual(revised['slabZMm'],baseline['slabZMm'])
            mesh_change=json.loads(original);mesh_change['meshControls']['slabMaximumPitchMm']=10
            path.write_text(json.dumps(mesh_change));mesh_revised=source_input(trial)
            self.assertNotEqual(mesh_revised['authoredInputSHA256'],baseline['authoredInputSHA256'])
            self.assertEqual(mesh_revised['boxesXYZMm'],baseline['boxesXYZMm'])
            self.assertEqual(mesh_revised['captureSHA256'],baseline['captureSHA256'])
            mesh_change['meshControls']['contourBoundaryLayerDepthsMm']=[15,7.5]
            path.write_text(json.dumps(mesh_change))
            with self.assertRaisesRegex(ValueError,'near-contour'):source_input(trial)
            changed['patchXYMm'][2]+=1;path.write_text(json.dumps(changed))
            with self.assertRaisesRegex(ValueError,'exact executed mesh axis'):source_input(trial)
            changed=json.loads(original);changed['units']='m-kN-kNm';path.write_text(json.dumps(changed))
            with self.assertRaisesRegex(ValueError,'units/datum'):source_input(trial)
            path.write_bytes(original)
            self.assertEqual(source_input(trial),baseline)
        self.assertTrue(same_physics({'value':1},{'value':1.0}))
        self.assertFalse(same_physics({'value':1},{'value':True}))

    def test_adverse_geometry_and_port_requests_reject(self):
        with self.assertRaisesRegex(ValueError,'overlapping'):
            solid_boxes([[0,0,0,1,1,1],[.5,.5,.5,2,2,2]],.2,33e6,.2)
        mesh,basis,k,volume,t,boundary,ports,force=self.model()
        with self.assertRaisesRegex(ValueError,'span physical edge'):
            contour_ports(mesh,basis,[0,0,.5,.6],[.2,.3],{'east':[0,.2,.59],'north':[0,.5]},[[.1,.1,0],[.1,.1,.5]])
        with self.assertRaisesRegex(ValueError,'strictly increasing'):
            contour_ports(mesh,basis,[0,0,.5,.6],[.2,.3],{'east':[0,0,.6],'north':[0,.5]},[[.1,.1,0],[.1,.1,.5]])
        with self.assertRaises(ValueError):condense(k,t,boundary,np.full(k.shape[0],np.nan))

if __name__=='__main__':unittest.main()
