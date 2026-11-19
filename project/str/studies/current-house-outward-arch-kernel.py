from pathlib import Path
import runpy,sys
D=Path(__file__).resolve().parent
arguments=sys.argv[:]
results=[]
sys.argv=['test','--check']
s=runpy.run_path(str(D/'current-house-coupled-arches.py'),init_globals={'arch_model_only':True})
Spatial=runpy.run_path(str(D/'arch-space-kernel.py'))['SpaceArch']
Normal=runpy.run_path(str(D/'arch-normal-kernel.py'))['NormalArch']
for crack in [.2,.35]:
    one=Spatial(s,140,crack,False);weak=Normal(s,crack)
    err=max(abs(one.columns[6+i][6+j]-weak.kend[i][j]) for i in range(6) for j in range(6))
    cross=max(abs(one.columns[i][j]) for i in range(6) for j in range(6,12))
    assert err<.00001 and cross<.00001,(err,cross)
    weak_error=err
    # Refine only the 2D jamb mesh to match the same new 3D stations.
    g=s['solve_arch'].__globals__
    old={key:g[key] for key in ['right','nodes','ind','n','factors']}
    g['right']=one.jamb;g['nodes']=sorted(set(g['arch']+one.jamb));g['ind']={q:i for i,q in enumerate(g['nodes'])}
    g['n']=len(g['nodes'])*3;g['factors']={}
    fixed=s['subframe']([0.]*6,crack,0,[0,0])[1]
    strong=[]
    for i in range(6):
        end=[float(i==j) for j in range(6)]
        strong.append([a-b for a,b in zip(s['subframe'](end,crack,0,[0,0])[1],fixed)])
    err=max(abs(one.columns[i][j]-strong[i][j]) for i in range(6) for j in range(6))
    assert err<.00001,err
    g.update(old)
    physical=Spatial(s,160,crack,True);load,local=physical.gravity(lambda x:0.)
    u,reaction=physical.response([0.]*12,load)
    total=physical.global_totals(load)
    assert total[2]<0 and abs(total[3])>0
    reaction_total=physical.applied_reaction_totals(reaction)
    assert max(abs(a+b) for a,b in zip(total,reaction_total))<1e-6,(total,reaction_total)
    maximum=max(abs(a+b) for a,b in zip(total,reaction_total))
    # A physical off-centre point creates both overturning and yaw. Check all
    # six global components independently of the member's local unit ratios.
    for sign in (-1,1):
        point=physical.jamb[-3];position=(point[0]+55,75,point[1]+140)
        force=(700*sign,1500*sign,-1100)
        load=[0.]*physical.size;physical.point(load,point,force,position)
        applied=physical.global_totals(load)
        cross=runpy.run_path(str(D/'arch-space-kernel.py'))['cross'](position,force)
        expected=[*(v/1000 for v in force),*(v/1e6 for v in cross)]
        assert max(abs(a-b) for a,b in zip(applied,expected))<1e-6
        _,reaction=physical.response([0.]*12,load)
        recovered=physical.applied_reaction_totals(reaction)
        residual=max(abs(a+b) for a,b in zip(applied,recovered))
        maximum=max(maximum,residual)
        assert residual<1e-5,(applied,recovered)
    # An independently condensed fixed-end stiffness gives the response
    # of the same member with exactly zero transverse moment. Compare
    # against the direct solve with that physical DOF left free.
    released=Spatial(s,160,crack,release_near_rotation=True)
    pivot=physical.columns[2]
    condensed=[[r-pivot[i]*row[2]/pivot[2] for i,r in enumerate(row)]
               for row in physical.columns]
    hinge_error=max(abs(a-b) for row,other in zip(condensed,released.columns) for a,b in zip(row,other))
    assert hinge_error < 1e-5
    ends=[.12*i for i in range(12)]
    _,fixed_r=physical.response(ends,load)
    _,released_r=released.response(ends,load)
    corrected=[r-v*fixed_r[2]/pivot[2] for r,v in zip(fixed_r,pivot)]
    assert max(abs(a-b) for a,b in zip(corrected,released_r)) < 1e-5
    assert abs(released_r[2]) < 1e-6
    results.append({'crackedEI':crack,'releasedColumnError':hinge_error,'strongLimitError':err,'weakLimitError':weak_error,
                    'maximumSixComponentEquilibriumResidual':maximum,'actualCGGravity':total})

geometry=runpy.run_path(str(D/'arch-width-geometry.py'))
foot=geometry['cage'](180,'jamb',3500)
adverse=geometry['cage'](180,'jamb',3500,True)
assert abs(foot['cellNormal']-74)<1e-9
assert abs(foot['cellRadial']-125.2352941176468)<1e-9
assert adverse['cellNormal']==54
assert foot['cellNormal'] < 225-76
# This is the actual q and tie change caused by restoring the missing cell.
T=1e6
actual=T/(2*foot['cellArea']);old=T/(2*(205-76)*(225-76))
assert actual>2*old
import json,hashlib
result={'role':'Six-degree beam limit and independent global equilibrium checks; actual H16/H6 cell falsifier.',
        'kernel':results,'footCell':foot,'footAdverseCell':adverse,
        'oneKNmFootFlowNPerMM':actual,'rejectedGrossBoxFlowNPerMM':old,
        'sources':{name:hashlib.sha256((D/name).read_bytes()).hexdigest() for name in ['arch-space-kernel.py','arch-width-geometry.py','current-house-arch-detail.json']},'admitted':False}
path=Path(__file__).with_suffix('.json');text=json.dumps(result,indent=2,sort_keys=True)+'\n'
if '--check' in arguments:assert path.read_text()==text
else:path.write_text(text)
