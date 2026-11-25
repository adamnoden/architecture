"""Source-bound local contour experiment; no current-house operator substitution."""
from __future__ import annotations
import argparse, hashlib, io, json, platform, tarfile, time
from pathlib import Path
import numpy as np
import scipy, skfem
from skfem import LinearForm, asm
from finite_floor_contour import solid_boxes, contour_ports, condense, rigid_port_modes


def sha(value):return hashlib.sha256(value).hexdigest()
def source_input(root, capture_archive=None):
    root=Path(root);authored_path=root/'project/str/studies/finite-floor-contour-inputs.json'
    authored=json.loads(authored_path.read_bytes())
    if (set(authored)!={'schema','id','jointId','units','datum','patchXYMm','wallEndZMm','wallUnitWeightKNPerM3','contourReferencePitchMm','meshControls'}
        or authored['schema']!='ovids-house/str-finite-floor-contour-input/1' or authored['id']!='STR/SW/floor-contour-development'
        or authored['jointId']!='SW' or authored['units']!='mm-kN-kNm' or authored['datum']!='source-ground-zero'
        or authored['contourReferencePitchMm']!=500):raise ValueError('unsupported authored contour occurrence or units/datum')
    patch=np.asarray(authored['patchXYMm'],float);ends=np.asarray(authored['wallEndZMm'],float)
    if (patch.shape!=(4,) or not np.isfinite(patch).all() or np.any(patch[2:]<=patch[:2])
        or ends.shape!=(2,) or not np.isfinite(ends).all() or ends[1]<=ends[0]
        or not isinstance(authored['wallUnitWeightKNPerM3'],(int,float)) or not np.isfinite(authored['wallUnitWeightKNPerM3'])
        or authored['wallUnitWeightKNPerM3']<=0):raise ValueError('unsupported authored contour geometry or density')
    mesh_controls=authored['meshControls']
    if (not isinstance(mesh_controls,dict) or set(mesh_controls)!={'contourBoundaryLayerDepthsMm','slabMaximumPitchMm','factorizationOrdering'}
        or mesh_controls['factorizationOrdering']!='MMD_AT_PLUS_A'):
        raise ValueError('explicit supported contour mesh/factorization controls required')
    depths=np.asarray(mesh_controls['contourBoundaryLayerDepthsMm'],float)
    slab_pitch=mesh_controls['slabMaximumPitchMm']
    if (depths.ndim!=1 or len(depths)<1 or not np.isfinite(depths).all() or depths[0]<=0 or np.any(np.diff(depths)<=0)
        or depths[-1]>=min(patch[2:]-patch[:2]) or not isinstance(slab_pitch,(int,float)) or not np.isfinite(slab_pitch) or not 5<=slab_pitch<=50):
        raise ValueError('finite positive bounded near-contour/depth resolution required')
    patch=patch.tolist();ends=ends.tolist()
    audit_path=root/'project/str/studies/four-l-joint-material-audit.json'
    audit=json.loads(audit_path.read_bytes())
    for p,expected in audit['sourceSHA256'].items():
        if sha((root/p).read_bytes()) != expected:raise ValueError('stale native source: '+p)
    archive=Path(capture_archive or root/'project/str/studies/fixed-normal-experiment-captures.tar.xz')
    raw=archive.read_bytes();sources={};capture_ids={}
    with tarfile.open(fileobj=io.BytesIO(raw),mode='r:xz') as tar:
        for pitch in [500,250]:
            name=f'v{pitch}.full.json';data=tar.extractfile(name).read();receipt=json.load(tar.extractfile(f'v{pitch}.receipt.json'))
            if sha(data)!=receipt['fullSHA256']:raise ValueError('invalid complete native capture: '+name)
            capture=json.loads(data)
            if capture['schema']!='str-fixed-normal-experiment/1' or capture['candidateAccepted'] or capture['ordinaryNativeAdmissionApplicable']:
                raise ValueError('unsupported experimental native identity')
            for p,expected in capture['methodSourceSHA256'].items():
                if sha((root/p).read_bytes())!=expected:raise ValueError('stale captured source/method: '+p)
            sources[pitch]=capture;capture_ids[name]=sha(data)
        ledger_bytes=tar.extractfile('fixed-normal-ledger.json').read();ledger=json.loads(ledger_bytes)
    joint=next(row for row in audit['joints'] if row['id']=='SW')
    if audit['plateThicknessMm']!=200:raise ValueError('unsupported slab material source')
    # Deliberate local extent at existing common axes, not a Saint-Venant assertion.
    axis_sets=[]
    for pitch,capture in sources.items():
        response=capture['response'];plate=response['nativeVertical']['plate']
        cells=plate['cellsXYMm'];points=plate['physicalRecovery']['points']
        axes=[sorted({row['xyMm'][k] for row in points}) for k in [0,1]]
        if any(patch[k] not in axes[k] or patch[k+2] not in axes[k] for k in [0,1]):
            raise ValueError('patch contour is not an exact executed mesh axis')
        area=sum(max(0,min(r[2],patch[2])-max(r[0],patch[0]))*max(0,min(r[3],patch[3])-max(r[1],patch[1])) for r in cells)
        if not np.isclose(area,(patch[2]-patch[0])*(patch[3]-patch[1]),rtol=0,atol=1e-6):
            raise ValueError('patch material is incomplete or duplicated')
        for r in plate['holesXYMm']:
            if min(r[2],patch[2])>max(r[0],patch[0]) and min(r[3],patch[3])>max(r[1],patch[1]):
                raise ValueError('patch intersects actual floor aperture')
        axis_sets.append(axes)
    if any(patch[0]<r['fibre']['xyMm'][0]<patch[2] and patch[1]<r['fibre']['xyMm'][1]<patch[3] for r in ledger['rows']):
        raise ValueError('unrepresented actual normal receiver in local patch')
    # Use literal executed500 contour stations, held fixed during solid refinement.
    points=sources[500]['response']['nativeVertical']['plate']['physicalRecovery']['points']
    east=sorted({r['xyMm'][1] for r in points if r['xyMm'][0]==patch[2] and patch[1]<=r['xyMm'][1]<=patch[3]})
    north=sorted({r['xyMm'][0] for r in points if r['xyMm'][1]==patch[3] and patch[0]<=r['xyMm'][0]<=patch[2]})
    section=sources[500]['response']['floorSection'];low=section['soffitZMm'];high=section['topZMm']
    if high-low!=audit['plateThicknessMm'] or not ends[0]<low<high<ends[1]:raise ValueError('authored wall ends do not surround actual slab section')
    boxes=[[patch[0],patch[1],low,patch[2],patch[3],high]]
    for z0,z1 in [(ends[0],low),(high,ends[1])]:
        boxes.extend([r[0],r[1],z0,r[2],r[3],z1] for r in joint['footprintRectanglesXYMm'])
    return {'patchXYMm':patch,'slabZMm':[low,high],'boxesXYZMm':boxes,
            'contoursMm':{'east':east,'north':north},
            'wallOriginsMm':[[*joint['gravityCentroidXYZMm'][:2],z] for z in ends],
            'slabUnitWeightKNPerM3':audit['plateUnitWeightKNPerM3'],'wallUnitWeightKNPerM3':authored['wallUnitWeightKNPerM3'],
            'meshControls':mesh_controls,'authoredInput':authored,'authoredInputSHA256':sha(authored_path.read_bytes()),'sourceAuditSHA256':sha(audit_path.read_bytes()),'captureSHA256':capture_ids,
            'archiveSHA256':sha(raw),'nativeSourceSHA256':audit['sourceSHA256']}


def reference_case(root):
    archive=Path(root)/'project/str/studies/fixed-normal-experiment-captures.tar.xz'
    with tarfile.open(archive,mode='r:xz') as tar:
        return json.load(tar.extractfile('v500.input.json'))['nativeRequest']

def same_physics(a,b):
    if isinstance(a,dict) and isinstance(b,dict):return a.keys()==b.keys() and all(same_physics(a[k],b[k]) for k in a)
    if isinstance(a,list) and isinstance(b,list):return len(a)==len(b) and all(same_physics(x,y) for x,y in zip(a,b))
    if type(a) in (int,float) and type(b) in (int,float):return np.isfinite(a) and np.isfinite(b) and a==b
    return type(a) is type(b) and a==b

def execute_request(root, request):
    if not isinstance(request,dict) or set(request)!={'schema','comparison','settings'} or request['schema']!='str-finite-floor-contour-execute/1':
        raise ValueError('versioned explicit finite contour request required')
    settings=request['settings']
    if not isinstance(settings,dict) or set(settings)!={'execution','pitchMm','youngKNPerM2','poisson','slabVolumeLoadEquivalentKPa'}:
        raise ValueError('explicit local contour controls required')
    if settings['execution']!='compute':raise ValueError('explicit compute execution required')
    # Full semantic request equality binds every actual load, support and topology input.
    # Hashes alone cannot transfer captured stations to a changed saved house case.
    if not same_physics(request['comparison'],reference_case(root)):
        return {'schema':'str-finite-floor-contour-response/1','status':'unsupported',
                'diagnostics':['FINITE_CONTOUR/changed-native-case-unsupported'],
                'globalReplacementAvailable':False,'nativeFloorAdmission':False,'jointResistanceAvailable':False}
    result=run(root,settings['pitchMm'],settings['youngKNPerM2'],settings['poisson'],settings['slabVolumeLoadEquivalentKPa'])
    return {'schema':'str-finite-floor-contour-response/1','status':'computed-local-comparison','result':result}

def run(root,pitch_mm,young_kn_m2=33e6,poisson=.2,floor_live_kpa=0):
    if pitch_mm not in [140,100,70,50,35] or not np.isfinite(floor_live_kpa) or floor_live_kpa<0:
        raise ValueError('explicit bounded pitch/nonnegative local load required')
    method_paths=[Path(__file__),Path(__file__).with_name('finite_floor_contour.py')]
    methods={p.name:sha(p.read_bytes()) for p in method_paths}
    inputs=source_input(root);start=time.monotonic()
    patch=np.array(inputs['patchXYMm'])/1000;slab=np.array(inputs['slabZMm'])/1000
    contours={k:np.array(v)/1000 for k,v in inputs['contoursMm'].items()}
    mesh_controls=inputs['meshControls']
    depths=np.array(mesh_controls['contourBoundaryLayerDepthsMm'])/1000
    through_depth=np.linspace(slab[0],slab[1],int(np.ceil((slab[1]-slab[0])*1000/mesh_controls['slabMaximumPitchMm']))+1)
    # Contour stations and local depth mesh remain literal, independently authored
    # controls while pitch_mm refines the remaining far field. This is not a
    # simultaneous near-field convergence claim.
    mesh,basis,k,volume=solid_boxes(np.array(inputs['boxesXYZMm'])/1000,pitch_mm/1000,young_kn_m2,poisson,
                                   ([*contours['north'],*(patch[2]-depths)],[*contours['east'],*(patch[3]-depths)],through_depth))
    t,boundary,ports=contour_ports(mesh,basis,patch,slab,contours,np.array(inputs['wallOriginsMm'])/1000)
    @LinearForm
    def body(v,w):
        in_slab=(w.x[2]>slab[0])&(w.x[2]<slab[1])
        weight=np.where(in_slab,inputs['slabUnitWeightKNPerM3']+floor_live_kpa/(slab[1]-slab[0]),inputs['wallUnitWeightKNPerM3'])
        return -weight*v[2]
    force=asm(body,basis);result=condense(k,t,boundary,force,ordering=mesh_controls['factorizationOrdering']);c=result['stiffness'];modes=rigid_port_modes(ports)
    relative_rigid=float(abs(c @ modes).max()/abs(c).max());eigen=np.linalg.eigvalsh(c)
    positive=int(np.count_nonzero(eigen>eigen[-1]*1e-9))
    if relative_rigid>1e-9 or eigen[0]<-eigen[-1]*1e-9 or positive!=len(ports)-6:
        raise ValueError('distributed component rigid modes/positivity failed')
    boxes=np.array(inputs['boxesXYZMm'])/1000;volumes=np.prod(boxes[:,3:]-boxes[:,:3],axis=1)
    weights=np.array([inputs['slabUnitWeightKNPerM3']+floor_live_kpa/(slab[1]-slab[0]),*[inputs['wallUnitWeightKNPerM3']]*(len(boxes)-1)])
    g=volumes*weights;centers=(boxes[:,:3]+boxes[:,3:])/2
    wrench=np.array([0,0,-g.sum(),-sum(g*centers[:,1]),sum(g*centers[:,0]),0])
    wrench_residual=float(abs(modes.T @ result['force']-wrench).max())
    if wrench_residual>1e-7:raise ValueError('local distributed load loses source wrench')
    # Repeat reader after solve; no stale source/method result survives a concurrent edit.
    if inputs!=source_input(root):raise ValueError('source changed during finite component solve')
    if methods!={p.name:sha(p.read_bytes()) for p in method_paths}:raise ValueError('method changed during finite component solve')
    return {'schema':'ovids-house/str-finite-floor-contour-experiment/1','nativeFloorAdmission':False,
            'globalReplacementAvailable':False,'jointResistanceAvailable':False,'nativeConstitutiveEquivalence':False,
            'outerBandAndChordInterfaceAvailable':False,'inputs':inputs,'methodSHA256':methods,
            'runtime':{'python':platform.python_version(),'numpy':np.__version__,'scipy':scipy.__version__,'scikit-fem':skfem.__version__},
            'meshControls':mesh_controls,'pitchMm':pitch_mm,'youngKNPerM2':young_kn_m2,'poisson':poisson,'floorLiveKPa':floor_live_kpa,
            'nodes':int(mesh.nvertices),'elements':int(mesh.nelements),'unknowns':int(basis.N),'volumeM3':volume,
            'ports':ports,'condensedStiffness':c.tolist(),'consistentLoad':result['force'].tolist(),
            'loadPotentialConstantKNM':result['energyConstant'],'distributedLoadWrenchKN_KNM':wrench.tolist(),
            'loadWrenchResidualKN_KNM':wrench_residual,'relativeRigidModeResidual':relative_rigid,
            'positiveRelativeModes':positive,'freeRigidModes':len(ports)-positive,'elapsedSeconds':time.monotonic()-start,
            'scope':'Exact source SW slab patch and L stubs; fixed literal native500 contour interpolation, free outer edges, isotropic elastic experiment. No band/chord/global insertion, contact, strength or native constitutive equivalence.'}

if __name__=='__main__':
    import sys
    p=argparse.ArgumentParser();p.add_argument('--root',type=Path,required=True);p.add_argument('--pitch-mm',type=float);p.add_argument('--floor-live-kpa',type=float,default=0);p.add_argument('--out',type=Path);p.add_argument('--adapter',action='store_true');p.add_argument('--read',action='store_true');a=p.parse_args()
    if a.read:
        source_input(a.root)
        print(json.dumps({'schema':'str-finite-floor-contour-reference/1','comparison':reference_case(a.root)}))
    elif a.adapter:
        print(json.dumps(execute_request(a.root,json.load(sys.stdin))))
    else:
        if a.pitch_mm is None or a.out is None:p.error('explicit --pitch-mm and --out required')
        output=run(a.root,a.pitch_mm,floor_live_kpa=a.floor_live_kpa)
        a.out.write_text(json.dumps(output,indent=2)+'\n')
        print(json.dumps({k:output[k] for k in ['pitchMm','nodes','elements','volumeM3','relativeRigidModeResidual','loadWrenchResidualKN_KNM','elapsedSeconds']}))
