"""Coupled arch normal/strong bending, torsion, end restraints and actual wind area."""
from pathlib import Path
import math,sys,runpy,itertools,json
D=Path(__file__).resolve().parent;args=sys.argv[:];sys.argv=[args[0],'--check']
s=globals().get('ARCH_CONTEXT') or runpy.run_path(str(D/'current-house-coupled-arches.py'));p=s['p'];m=s['m'];guard=json.loads((D/'current-house-window-receivers.json').read_text())['guard'];s['guard_body_area']=guard['body']['steelProjectedAreaM2'];spec=runpy.run_path(str(D/'arch-space-flexibility.py'));Normal=runpy.run_path(str(D/'arch-normal-kernel.py'))['NormalArch'];Coord=spec['Coordinate'];Structure=spec['Structure'];dot=s['dot'];mul=s['mul'];A,B=s['A'],s['B'];
# All eight upper openings share geometry. Two north sills and six other sills differ.
layouts=[]
for a,(P,J,L0,axis,sg) in enumerate(s['corner_windows']):
 face=('outer-south' if P[1]==A else 'outer-north') if axis==0 else ('outer-west' if P[0]==A else 'outer-east');ff=['outer-south','outer-east','outer-north','outer-west'].index(face);sn=1 if P[1-axis]==A else -1;op=next(q for q in s['H']['openings']['FIRST'] if q['wall']==face and q['centre']==(1800 if sg>0 else 10200));layouts.append((ff,axis,sg,sn,3450+op['sill'],op['centre']))

def withdraw_old(structure,a,origin):
 ff,axis,sg,sn,_,_=layouts[a];direction=1-axis;floor={};roof={};cut=p['sides'][ff,'outer']
 for x,z,F in origin:
    along=x if sg>0 else 12000-x;face_u=along if ff<2 else 12000-along
    l,h=next((l,h) for l,h in itertools.pairwise(cut) if l<=face_u<=h);v=(face_u-l)/(h-l);fq=(p['rr']-z)/(p['rr']-p['ff'])
    for at,w in [(l,1-v),(h,v)]:
        q=p['pt'](ff,A,at);k=p['dof'](q,direction)
        floor[q,direction]=floor.get((q,direction),0)-sn*F*w*fq;roof[k]=roof.get(k,0)-sn*F*w*(1-fq)
 c=Coord(floor=floor,roof=roof);structure.prepare(c);return c

def active(wind,a):
 ff,ax,sg,sn,z,c=layouts[a];cc=wind[1-ax]
 if not cc:return False
 sign=1 if cc<4 else -1;mode=(cc-1)%3
 face=(3 if sign==1 else 1) if 1-ax==0 else (0 if sign==1 else 2)
 u=c if ff<2 else 12000-c
 return face==ff and (mode==0 or mode==1 and u<6000 or mode==2 and u>6000)

from functools import lru_cache
@lru_cache(None)
def mr(rect_b,depth,face1,face2,axial,reverse,steel_fraction=.92,extra_bar=None):
    if reverse:face1,face2=depth-face2,depth-face1
    steel=2*math.pi*16**2/4
    limit=steel_fraction*500/1.15
    layers=[(face1,steel,limit,limit),(face2,steel,limit,limit)]
    if extra_bar:
        position,diameter,stress_cap=extra_bar
        layers.append((depth-position if reverse else position,math.pi*diameter**2/4,stress_cap,0.))
    def eval_at(x):
        width=min(depth,.8*x);F=17*width*rect_b;M=F*(depth/2-width/2)
        for bar,area,tension_limit,compression_limit in layers:
            stress=max(-tension_limit,min(compression_limit,.0035*(1-bar/x)*200000))
            n=area*(stress-(17 if bar<width else 0));F+=n;M+=n*(depth/2-bar)
        return F/1000,M/1e6
    low,high=.001,2500.
    for _ in range(30):
        mid=(low+high)/2
        if eval_at(mid)[0]<axial:low=mid
        else:high=mid
    return eval_at((low+high)/2)[1]
if not globals().get('SPATIAL_FUNCTIONS_ONLY',False):
    shared=__import__('runpy').run_path(str(D/'arch-link-schedule.py'))
    MemberRecovery=runpy.run_path(str(D/'arch-member-recovery.py'))['MemberRecovery']
    results=[]
    foundation=runpy.run_path(str(D/'current-house-joined-foundation.py'))
    gravity=runpy.run_path(str(D/'arch-gravity-routing.py'))['build'](s,foundation)
    Transfer=runpy.run_path(str(D/'arch-spatial-reactions.py'))['Transfer']
    full_register={};axial_witness={};max_gravity=0.;count_cases=0
    for crack,torsion,positive_floor,lock in [(.2,.15,True,True),(.35,.25,True,True),(.2,.08,False,False),(.35,.25,False,True)]:
     st=Structure(s,torsion);fc=0 if positive_floor else 1;weak=Normal(s,crack);N=st.physical+(8 if lock else 0);modes=st.coords[:N]
     C=[[st.flexibility(q,z,positive_floor) for z in modes] for q in modes]
     assert max(abs(C[i][j]-C[j][i]) for i in range(N) for j in range(N))<2e-8
     # Reproduce the old complete strong-plane flexibility exactly before joining new freedoms.
     assert max(abs(C[i][j]-s['C'][i][j]-s['floor_cases'][fc][0][i][j]) for i in range(48) for j in range(48))<2e-9
     zero=[0.]*6;selfR=s['subframe'](zero,crack,0,[0,0])[1];ks=[]
     for k in range(6):ks.append([a-b for a,b in zip(s['subframe']([int(i==k) for i in range(6)],crack,0,[0,0])[1],selfR)])
     kernels=[ks]*8+[weak.kend]*8
     tr=Transfer(s,foundation,st,modes,crack,fc)
     residual=[0.] * 6
     def compare_global(actual,expected):
         for axis,(value,want) in enumerate(zip(actual,expected)):
             residual[axis]=max(residual[axis],abs(value-want))
         assert max(residual)<.002,(actual,expected,residual)
     mat=[]
     for i in range(N):
        row=[]
        for j in range(N):
            if j<96:row.append((int(i==j) if i<96 else 0)+sum(C[i][j//6*6+k]*kernels[j//6][k][j%6] for k in range(6)))
            else:row.append(C[i][j]) # Lagrange reaction makes the joined yaw difference zero.
        mat.append(row)
     solve=p['fac'](mat);ceiling=[lambda x,a=a:s['ceiling_actions'][a][x] for a in range(8)];g=sum((s['subframe'](zero,crack,act,[0,0])[1] for act in ceiling),[])+[0.]*(N-48)
     dG=solve([-x for x in mul(C,g)])
     zero_primary=[0.]*tr.size
     gravity_raw=tr.result(dG,g[:96],kernels,zero_primary)
     compare_global(tr.totals(gravity_raw),[*gravity['frameExternalULS'],0.,0.,0.])

     # Build physical unit pressure for each separate opening, with near-pier and
     # far-jamb transfers and its exact share removed from the older facade force.
     def unit(a,wind,point,remove):
        _,_,_,_,sill,_=layouts[a];load,near,origin=weak.loads(sill,wind,point);fixed=weak.response(zero,load)[1];before=[0.]*N;primary=[0.]*tr.size;rm_primary=primary[:]
        for x,z,force in near:
            c=st.near_normal(a,x,z);st.prepare(c)
            component=tr.primary(c.response,c);primary=[v+force*f for v,f in zip(primary,component)]
            for i,v in enumerate(modes):before[i]+=force*st.flexibility(v,c,positive_floor)
        removed=[0.]*N
        if remove:
            c=withdraw_old(st,a,origin)
            rm_primary=tr.primary(c.response,c);primary=[v+y for v,y in zip(primary,rm_primary)]
            for i,v in enumerate(modes):removed[i]=st.flexibility(v,c,positive_floor);before[i]+=removed[i]
        for i in range(N):before[i]-=dot(C[i][48+6*a:54+6*a],fixed)
        du=solve(before);dr=solve(removed);fixed_all=[0.]*96
        fixed_all[48+6*a:54+6*a]=fixed
        raw=tr.result(du,fixed_all,kernels,primary);rm_raw=tr.result(dr,[0.]*96,kernels,rm_primary)
        expected=tr.applied(a,origin)
        wanted=[0.]*6 if remove else expected
        compare_global(tr.totals(raw),wanted)
        if remove:compare_global(tr.totals(rm_raw),[-v for v in expected])
        return du,load,dr,raw,rm_raw

     pressures=[unit(a,2.25,None,True) for a in range(8)]
     points={(a,x):unit(a,0,(1500,x),False) for a in range(8) for x in [1360,2240]}
     recovery=MemberRecovery(s,weak)
     empty=[0.]*weak.n
     reference=recovery.signed(zero,zero,0,empty)
     guard_increment={}
     for (loaded,x), (delta,load,_,_,_) in points.items():
         for a in range(8):
             signed=recovery.signed(delta[6*a:6*a+6],delta[48+6*a:54+6*a],0,load if a==loaded else empty)
             guard_increment[loaded,x,a]=[tuple(y-v for y,v in zip(row,old)) for row,old in zip(signed,reference)]
     # Cache section resistance at the lower and upper neighbouring 2 kN axial
     # values, including both bending signs. Tensile/compressive roles stay signed.
     @lru_cache(None)
     def section_resistance(e, lower, inward=0):
         _, _, (_,midz,h,b,xs,ys)=recovery.rows[e]
         xs=(xs[0]+inward,xs[1]-inward);ys=(ys[0]+inward,ys[1]-inward)
         rs=min(mr(round(b,2),h,*xs,n,sgn) for n in (lower,lower+2) for sgn in (False,True))
         rw=min(mr(h,round(b,2),*(round(t,2) for t in ys),n,sgn) for n in (lower,lower+2) for sgn in (False,True))
         return rs,rw
     flow_by_location={place:[0.,0.] for place in ['direct','remote']}
     flow_witness=[None,None]
     adverse_flow=[0.,0.];adverse_ratio=[0.,0.];adverse_witness=[None,None]
     maxweak=[0,0];maxtorsion=[0,0];maxnormalV=[0,0];maxstrong=[0,0];bounds={};target=[];maxyaw=0.;normApplied=0;max_link=[0.,0.];max_interaction=[0.,0.];governs=[None,None]
     for wi,case in enumerate(s['updated_wind']):
        wfloor=m['recover']([0.]*8,p['floorLoadCases'][id(case[1])])[0]
        wind=solve([st.background(v,case[1],wfloor) for v in modes]);base=[x+y for x,y in zip(dG,wind)];exposed=[a for a in range(8) if active(case[0],a)]
        house_wind=tr.result(wind,[0.]*96,kernels,tr.primary(case[1]));old_wind=tr.old_wind(wi)
        compare_global(tr.totals(house_wind),tr.totals(old_wind))
        prior_base=base
        for pressure_sign in [1,-1]:
         base=prior_base[:]
         wind_delta=[x-y for x,y in zip(house_wind,old_wind)]
         for a in exposed:wind_delta=[x+pressure_sign*y+(1-pressure_sign)*z for x,y,z in zip(wind_delta,pressures[a][3],pressures[a][4])]
         for a in exposed:base=[x+pressure_sign*y+(1-pressure_sign)*z for x,y,z in zip(base,pressures[a][0],pressures[a][2])]
         # Point guard actions on either end, either direction, at each affected
         # jamb. Other openings still contribute to the compatible body response.
         backgrounds=[]
         for a in range(8):
             load=[pressure_sign*q for q in pressures[a][1]] if a in exposed else empty
             backgrounds.append(recovery.signed(base[6*a:6*a+6],base[48+6*a:54+6*a],ceiling[a],load))
         for loaded in range(8):
           for x,sign in itertools.product([1360,2240],[-1,1]):
             point_raw=points[loaded,x][3]
             extra=[v+sign*t for v,t in zip(wind_delta,point_raw)]
             # Keep all five signed components at all 52 heads, with the actual
             # contacts released separately under each simultaneous state.
             for state_name,factors in [('suction',{'U':1}),('retained',{'U':1,'retainedMin':1}),('gravity',{'G':1.35,'Q':1.5})]:
                 key=(crack,torsion,positive_floor,lock,state_name)
                 table=full_register.setdefault(key,{})
                 vv=[a0+b0 for a0,b0 in zip(extra,gravity_raw)] if state_name=='gravity' else extra
                 heads,global_actions=tr.at_heads(wi,vv,gravity['book'] if state_name=='gravity' else None,factors)
                 if state_name=='gravity':max_gravity=max(max_gravity,global_actions[0])
                 for hd,card in heads.items():
                     pair=axial_witness.setdefault(state_name,{}).setdefault(hd,[None,None])
                     for direction,replace in enumerate([pair[0] is None or card[0]<pair[0]['card'][0],pair[1] is None or card[0]>pair[1]['card'][0]]):
                         if replace:pair[direction]={'control':[crack,torsion,positive_floor,lock],'windIndex':wi,'pressureSign':pressure_sign,'guardWindow':loaded,'pointX':x,'pointSign':sign,'card':card}
                     rr=table.setdefault(hd,[[v,v] for v in card])
                     for pair,v in zip(rr,card):pair[0]=min(pair[0],v);pair[1]=max(pair[1],v)
                 count_cases+=1
             for a,background in enumerate(backgrounds):
                 change=guard_increment[loaded,x,a]
                 for e,(start,increment) in enumerate(zip(background,change)):
                     ms1,vs1,n1,ms2,vs2,n2,mw1,mw2,vw1,vw2,tor=(v+sign*d for v,d in zip(start,increment))
                     kind,midz,h,b,xs,ys=recovery.rows[e][2]
                     k=int(kind=='jamb');weak_m=max(abs(mw1),abs(mw2));weak_v=max(abs(vw1),abs(vw2));tor=abs(tor)
                     strong_m=max(abs(ms1),abs(ms2));strong_v=max(abs(vs1),abs(vs2))
                     maxweak[k]=max(maxweak[k],weak_m);maxnormalV[k]=max(maxnormalV[k],weak_v)
                     maxtorsion[k]=max(maxtorsion[k],tor);maxstrong[k]=max(maxstrong[k],strong_m)
                     for n,ms in ((-n1,abs(ms1)),(-n2,abs(ms2))):
                         rs,rw=section_resistance(e,2*math.floor(n/2));ratio=ms/rs+weak_m/rw
                         ra,rb=section_resistance(e,2*math.floor(n/2),5)
                         adverse_ratio[k]=max(adverse_ratio[k],ms/ra+weak_m/rb)
                         if ratio>max_interaction[k]:
                             max_interaction[k]=ratio
                             governs[k]=[wi,loaded,a,x,sign,pressure_sign,midz,n,ms,weak_m,tor,rs,rw]
                     flow=tor*1e6/(2*(h-76)*(b-76))+max(strong_v*1000/(2*.85*(h-xs[0])),weak_v*1000/(2*.85*min(b-ys[0],ys[1])))
                     # +5 inward on each opposite face shifts both the link
                     # centre and the H16 axis. Ac loses 10 in each dimension.
                     # Keep the same external states and this explicitly reduced
                     # lever, independently of the 5.7 dia / 58 pitch challenge.
                     cover_flow=tor*1e6/(2*(h-86)*(b-86))+max(strong_v*1000/(2*.85*(h-xs[0]-5)),weak_v*1000/(2*.85*min(b-ys[0]-5,ys[1]-5)))
                     if cover_flow>adverse_flow[k]:
                         adverse_flow[k]=cover_flow
                         adverse_witness[k]=[wi,loaded,a,x,sign,pressure_sign,midz]
                     location='direct' if loaded==a else 'remote'
                     flow_by_location[location][k]=max(flow_by_location[location][k],flow)
                     if flow>max_link[k]:
                         max_link[k]=flow
                         flow_witness[k]=[wi,loaded,a,x,sign,pressure_sign,midz]
                     bb=bounds.setdefault(e,[1e10,-1e10]);bb[0]=min(bb[0],-n1,-n2);bb[1]=max(bb[1],-n1,-n2)
         if lock:maxyaw=max(maxyaw,max(abs(q) for q in base[96:])/1000) # N m -> kNm
     row={'crackedEI':crack,'torsionFraction':torsion,'allLowerBearings':positive_floor,'positiveFloorRoofYawJoin':lock,
          'maxStrongArchJamb':maxstrong,'maxWeakArchJamb':maxweak,'maxTorsionArchJamb':maxtorsion,'maxWeakShearArchJamb':maxnormalV,
          'sameStateLinearBiaxialInteractionArchJamb':max_interaction,'criticalCases':governs,'fiveInwardEachOppositeFace':{'maxClosedLinkFlowNPerMM':adverse_flow,'maxBiaxialRatio':adverse_ratio,'flowWitness':adverse_witness,'holds':'Member stiffness and outer dimensions fixed. Change the link-cell area plus both longitudinal bar-layer lever arms, keeping diameter and pitch challenge independent.'},'maxClosedLinkFlowNPerMM':max_link,'closedLinkGoverningWitnesses':flow_witness,'flowByPointLocationNPerMM':flow_by_location,'sourceComparedEquilibriumResiduals':[round(v,12) for v in residual],'H6Delivered55Plus3At95PercentDiameter':shared['schedule']['H6AdverseResistanceNPerMM'],
          'H6at75FlowResistance':math.pi*6**2/4*500/1.15/75,'H6at60FlowResistance':math.pi*6**2/4*500/1.15/60,'H6at60With3PitchAnd5PercentDiameterLoss':math.pi*(6*.95)**2/4*500/1.15/63,'maximumBackgroundYawReactionExcludingGuardPointKNm':maxyaw,
          'sectionAxialNRange':[min(v[0] for v in bounds.values()),max(v[1] for v in bounds.values())]}
     assert all(math.isfinite(v) for v in max_link+max_interaction)
     results.append(row);print('SPATIAL ARCH',crack,torsion,max_interaction,max_link,flush=True)
    sys.argv=args
    out={'role':'Spatial research controls for the eight proposed inner arches. Force and rotation from both planes, real L torsion, upstand torsion, floor membrane and 96 wind patterns. One independently signed 1.5 kN guard point at either physical end, projected local panel pressure/suction, both upper jambs present. Lower-bound components and ideal upper connections remain comparisons.', 'results':results,'responseStates':count_cases,'memberWindowRecoveries':count_cases*8//3,'criticalCaseOrder':['windIndex','windowWithGuardPoint','memberWindow','pointX','pointSign','pressureSign','elementMidZ','N','Mstrong','Mweak','torsion','Rstrong','Rweak'],'maxNetGravity':max_gravity,'headComponentOrder':['N','Cx','Cy','Vx','Vy'],'fullCardAtAxialMinMaxForEveryHead':axial_witness,'spatialHeadRanges':{'/'.join(map(str,k)):v for k,v in full_register.items()},'linkDetail':{'sharedCage':shared['schedule'],'reference':'H6/75 yields 163.91 N/mm and fails the combined torque/shear screen. Retain H6 to preserve the 140 mm bar lanes; use 55 mm ordinary spacing and the common actual sleeve/placing schedule, with 58 mm maximum delivery. The minimum diameter comparison is 95% of 6 mm.','around26Sleeves':'At the opposite jamb reserve Z5401/5459 around the5430 sleeve and Z5541/5599 around5570. Insert a link at5500. Both port spacings are58, intermediate spacings41. Actual separation29 minus13 minus3 =13 and after two adverse5 offsets 3. Rephase the rest of the upper jamb to maximum58 delivered while preserving actual cover and hoops.'},'remaining':'Compare exact strain-compatible biaxial domain, local torsion reinforcement, finite delivered connection stiffness, off-plane housing and three-dimensional soffit/jamb/foot detailing; complete site/cage adjoining-node checks before choosing a foundation. No credit for transverse slab torsion in the floor-edge-only return model.', 'admitted':False}
    output=Path(__file__).with_suffix('.json');content=json.dumps(out,indent=2,sort_keys=True)+'\n'
    if '--check' in sys.argv:assert output.read_text()==content
    else:output.write_text(content)
