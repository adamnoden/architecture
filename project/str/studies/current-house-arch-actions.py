"""Carry wind redistributed by eight RC arches to the 52 proposed foundation heads.

Subtract the unloaded-wind response with the same arch dead load. This isolates
wind, so the prior maximum gravity budgets and retained minimum weights keep
their original meaning. New gravity quantities are a separate joining duty.
"""
from collections import defaultdict
from pathlib import Path
import hashlib
import json
import runpy
import sys

D=Path(__file__).resolve().parent
args=sys.argv[:]
sys.argv=[args[0],'--check']
foundation=runpy.run_path(str(D/'current-house-joined-foundation.py'))
calm={}; envelopes={}; largest_error=0.; roof_change=0.; foot_offset_moment=0.
critical={}; states=0
gravity={};calm_full={};gravity_balance={}; gravity_global={}

def observe(s,case,wind_index,reactions,crack,bearing,ceiling):
    global largest_error,roof_change,foot_offset_moment,states
    if ceiling and wind_index>=0:return
    controls=(crack,bearing)
    # The frame exerts the opposite of the support reactions. Reconstruct
    # the new solution at every original roof and floor degree of freedom.
    displacement=[v-sum(col[j]*f for col,f in zip(s['full'],reactions)) for j,v in enumerate(case[1])]
    end=[s['dot'](v,displacement) for v in s['terminal']]
    pier_moments={}; pier_shears={}; loads=defaultdict(float); far_vertical={}
    for index,corner in enumerate(s['corner_keys']):
        stiffness=s['new_stiffness'][corner]
        end_forces=s['mul'](stiffness,end[4*index:4*index+4]);vertical=0.;moments=[0.,0.];shears=[0.,0.]
        for i,(owner,jamb,ax,coordinate,terms,*_) in enumerate(s['modes']):
            if owner!=corner:continue
            if coordinate==1:vertical+=reactions[i]/1000
            if coordinate==4:far_vertical[jamb]=reactions[i]/1000
            for axis,derivative,factor in terms:
                # Recover real forces at the two original diaphragm levels
                # after the intermediate spring force and moment are introduced.
                projection=s['mul'](stiffness,s['terminal_cross'](corner,s['h0'],derivative,axis))
                end_forces=[x+y*reactions[i]*factor for x,y in zip(end_forces,projection)]
                arm=1 if derivative else s['zs']+750
                moments[axis]-=reactions[i]*factor*arm/1e6
                if not derivative:shears[axis]-=reactions[i]*factor/1000
        for axis in range(2):
            centroid=(s['c0']-foundation['A'])*(1 if corner[axis]==foundation['A'] else -1)
            moments[axis]+=(end_forces[axis]*(3370+750)+end_forces[axis+2]*(6600+750))/1e6+vertical*centroid/1000
            shears[axis]+=(end_forces[axis]+end_forces[2+axis])/1000
        pier_shears[corner]=shears
        pier_moments[corner]=moments;loads[corner]+=vertical
    # Recover roof support forces from the actual deflected springs and lower
    # reactions from the newly loaded edge beam before releasing passive seats.
    roof={q:40*displacement[s['p']['vDO'](q,0)] for q in s['p']['upperSupports']}
    for q,force in roof.items():
        for pad,share,dx,dy in foundation['routes']([(foundation['virtual'](q),q,1.)]):
            assert isinstance(pad,tuple) and abs(dx)+abs(dy)<1e-8
            loads[pad]+=force*share
    for (two_ends,i,pad),influence in s['floor_unit_reactions'].items():
        if two_ends==bool(bearing):loads[pad]-=reactions[i]*influence/1000
    if wind_index<0:
        if ceiling:
            if not gravity:gravity.update(runpy.run_path(str(D/'arch-gravity-routing.py'))['build'](s,foundation))
            full_load=[sum(loads.values()),*[sum(p[j]*n/1000 for p,n in loads.items())+sum(v[j] for v in pier_moments.values()) for j in [0,1]]]
            residual=[x-y for x,y in zip(full_load,gravity['frameExternalULS'])]
            assert max(map(abs,residual))<.001,(controls,residual,full_load,gravity['frameExternalULS'])
            gravity_balance[str(controls)]=residual
            calm_full[controls]=(dict(loads),pier_moments,pier_shears)
            return
        calm[controls]=(dict(loads),pier_moments,roof,far_vertical,pier_shears)
        return
    states+=1
    base,base_moment,base_roof,base_jamb,base_shear=calm[controls]
    old=foundation['plane']['actual'][wind_index]
    added={q:n-base.get(q,0.) for q,n in loads.items()}
    moment={q:[x-y for x,y in zip(v,base_moment[q])] for q,v in pier_moments.items()}
    shear={q:[x-y for x,y in zip(v,base_shear[q])] for q,v in pier_shears.items()}
    for ring in foundation['rings'].values():
        for row in foundation['windrows'](ring,wind_index):
            q=tuple(row['xy'])
            for pad,share,_,_ in foundation['routes']([(foundation['virtual'](q),q,1.)]):
                added[pad]-=row['n']*share
    for q,forces in old[3].items():
        for j in range(2):
            moment[q][j]-=(forces[j]*(3370+750)+forces[j+2]*(6600+750))/1e6
            shear[q][j]-=(forces[j]+forces[j+2])/1000
    net=sum(added.values())
    first=[sum(q[j]*n/1000 for q,n in added.items())+sum(v[j] for v in moment.values()) for j in range(2)]
    error=max(abs(net),*map(abs,first));largest_error=max(error,largest_error)
    assert abs(net)<.003 and max(map(abs,first))<.006,(controls,wind_index,net,first)
    for q,n in roof.items():
        old_force=40*old[1][s['p']['vDO'](q,0)]
        roof_change=max(roof_change,abs(n-base_roof[q]-old_force))
    # A lower 225 mm foot has its centroid 42.5 mm toward the cavity.
    # Keep this local transfer moment even though the equivalent resultant on
    # the original wall centre line already preserves the global first moment.
    foot_offset_moment=max(foot_offset_moment,*(abs(f-base_jamb[q])*.0425 for q,f in far_vertical.items()))
    head_shears,external=foundation['horizontal'](wind_index,shear)
    _,previous_external=foundation['horizontal'](wind_index)
    assert max(abs(x-y) for x,y in zip(external,previous_external))<.001
    for name,factors in [('suction',{'U':1}),('retained',{'retainedMin':1,'U':1}),('gravity',{'G':1.35,'Q':1.5})]:
        key=f'{crack:.2f}/'+('two-ends' if bearing else 'mapped-pads')+'/'+name
        bearing_delta=added
        pier_delta=moment
        extra_routed=None
        case_shear=head_shears
        if name=='gravity':
            absolute,absolute_moment,absolute_shear=calm_full[controls]
            bearing_delta={p:n+absolute.get(p,0.) for p,n in added.items()}
            pier_delta={p:[x+y for x,y in zip(v,absolute_moment[p])] for p,v in moment.items()}
            extra_routed=gravity['book']
            case_shear,fxy=foundation['horizontal'](wind_index,{p:[x+y for x,y in zip(v,absolute_shear[p])] for p,v in shear.items()})
            assert max(abs(x-y) for x,y in zip(fxy,previous_external))<.001
        ground,pads,lifted,global_action=foundation['realState'](factors,wind_index,bearing_delta,pier_delta,extra_routed)
        if name=='gravity':gravity_global[key]=global_action[0]
        previous=foundation['realState'](factors,wind_index)[0]
        table=envelopes.setdefault(key,{})
        for head in foundation['heads']:
            actions=ground[head]
            n=actions[0];delta=n-previous[head][0]
            row=table.setdefault(head,{'compressionRange':[n,n],'windIndexAtEnds':[wind_index,wind_index],'largestSignedChange':delta,'windIndexAtChange':wind_index})
            full=[*actions,*case_shear[head]]
            ranges=row.setdefault('signedComponentRanges',[[x,x] for x in full])
            for pair,x in zip(ranges,full):pair[0]=min(pair[0],x);pair[1]=max(pair[1],x)
            for limit,worse in [(0,n<row['compressionRange'][0]),(1,n>row['compressionRange'][1])]:
                if worse:row['compressionRange'][limit]=n;row['windIndexAtEnds'][limit]=wind_index
            if abs(delta)>abs(row['largestSignedChange']):row['largestSignedChange']=delta;row['windIndexAtChange']=wind_index
            if abs(delta)>critical.get(key,[0])[0]:critical[key]=[abs(delta),head,wind_index,delta]

runpy.run_path(str(D/'current-house-coupled-arches.py'),init_globals={'arch_observer':observe})
sys.argv=args
assert states==4*96 and all(len(table)==52 for table in envelopes.values()),(states,{k:len(v) for k,v in envelopes.items()})
result={'role':'Wind redistribution through the proposed eight in-plane arch/jamb frames. Real inner opening masses and routed ceiling/arch gravity are joined once on the maximum-G branch. Installed guard/window/steel masses use explicit upper budgets. Façade-normal bending, lower external masonry geometry and soil response remain separate.',
        'componentOrder':['N','Cx','Cy','Vx','Vy'],'units':'N columns positive compression in kN; first moments about physical global X and Y in kNm.',
        'states':states,'sourceCase':'Four integration stiffness/bearing states, 96 directional wind cases each. The previous suction, retained-shell and maximum-G/Q forces are combined separately with the new wind; do not add independently governing head minima/maxima.',
        'maximumResidualForceOrFirstMoment':largest_error,'maximumChangeAtRoofStationKN':roof_change,'maxWindMomentFromJambFootCentroidOffsetKNm':foot_offset_moment,
        'gravityReplacement':{k:v for k,v in gravity.items() if k!='book'},'calmFrameIndependentlyRecoveredResiduals':gravity_balance,'maxGravityNetKNByControl':gravity_global,'maximumHeadChanges':critical,'heads':envelopes,'sources':{f:hashlib.sha256((D/f).read_bytes()).hexdigest() for f in ['current-house-coupled-arches.py','current-house-joined-foundation.py','current-house-arch-detail.json','arch-gravity-routing.py']},'admitted':False}
output=Path(__file__).with_suffix('.json');text=json.dumps(result,indent=2,sort_keys=True)+'\n'
if '--check' in sys.argv:assert output.read_text()==text
else:output.write_text(text)
print('Arch wind change at roof and heads',roof_change,max(v[0] for v in critical.values()),largest_error)
