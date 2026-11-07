"""Re-solve the same eight openings for one outward160/180 RC width control."""
from functools import lru_cache
from itertools import product
from pathlib import Path
import json
import hashlib
import math
import runpy
import sys

D=Path(__file__).resolve().parent
arguments=sys.argv[:]
sys.argv=[arguments[0],'--check']
Space=runpy.run_path(str(D/'arch-space-kernel.py'))['SpaceArch']
Normal=runpy.run_path(str(D/'arch-normal-kernel.py'))['NormalArch']
geometry_module=runpy.run_path(str(D/'arch-width-geometry.py'))
geometry=geometry_module['control'];cage=geometry_module['cage']
controls=[]
for width in (160,180):
    s=runpy.run_path(str(D/'current-house-coupled-arches.py'),init_globals={
        'arch_model_only':True,'arch_normal_width':width
    })
    api=runpy.run_path(str(D/'current-house-spatial-arches.py'),init_globals={
        'SPATIAL_FUNCTIONS_ONLY':True,'ARCH_CONTEXT':s
    })
    Structure=api['Structure'];capacity=api['mr'];p=s['p']
    width_results=[]
    for cracked,torsion,all_bearings,yaw_join in [(.2,.15,True,True),(.35,.25,True,True),(.2,.08,False,False),(.35,.25,False,True)]:
        structure=Structure(s,torsion)
        member=Space(s,width,cracked)
        normal=Normal(s,cracked)
        count=96+(8 if yaw_join else 0)
        modes=structure.coords[:count]
        flexible=[[structure.flexibility(left,right,all_bearings) for right in modes] for left in modes]
        assert max(abs(flexible[i][j]-flexible[j][i]) for i in range(count) for j in range(count))<2e-8
        window_indices=[list(range(6*a,6*a+6))+list(range(48+6*a,54+6*a)) for a in range(8)]
        stiffness=[[0.]*96 for _ in range(96)]
        for indices in window_indices:
            for column,j in enumerate(indices):
                for row,i in enumerate(indices):
                    stiffness[i][j]=member.columns[column][row]
        matrix=[]
        for i in range(count):
            row=[]
            for j in range(count):
                if j>=96:
                    row.append(flexible[i][j])
                    continue
                a=(j%48)//6
                row.append(float(i==j)+sum(flexible[i][k]*stiffness[k][j] for k in window_indices[a]))
            matrix.append(row)
        solve=p['fac'](matrix)
        def embed(a,values):
            out=[0.]*count
            for i,value in zip(window_indices[a],values):
                out[i]=value
            return out
        def ends(a,displacement):
            return [displacement[i] for i in window_indices[a]]
        def normal_rhs(load):
            out=[0.]*member.size
            for node,base in normal.index.items():
                for old,new in [(0,1),(1,3),(2,5)]:
                    out[member.index[node]+new]+=load[base+old]
            return out
        empty=[0.]*member.size
        zero=[0.]*12
        gravities=[]
        fixed_gravity=[0.]*count
        for a in range(8):
            ceiling=lambda x,a=a:s['ceiling_actions'][a][x]
            load,member_load=member.gravity(ceiling)
            gravities.append((load,member_load))
            reaction=embed(a,member.response(zero,load)[1])
            fixed_gravity=[x+y for x,y in zip(fixed_gravity,reaction)]
            measured=member.global_totals(load)
            recovered=member.applied_reaction_totals(member.response(zero,load)[1])
            assert max(abs(x+y) for x,y in zip(measured,recovered))<1e-6
        gravity_displacement=solve([-v for v in s['mul'](flexible,fixed_gravity)])

        def applied(a,pressure,point,remove_old):
            _,_,_,_,sill,_=api['layouts'][a]
            load,near,origin=normal.loads(sill,pressure,point)
            rhs=normal_rhs(load)
            fixed=embed(a,member.response(zero,rhs)[1])
            before=[0.]*count
            for x,z,force in near:
                coordinate=structure.near_normal(a,x,z)
                structure.prepare(coordinate)
                for i,mode in enumerate(modes):
                    before[i]+=force*structure.flexibility(mode,coordinate,all_bearings)
            removed=[0.]*count
            if remove_old:
                coordinate=api['withdraw_old'](structure,a,origin)
                for i,mode in enumerate(modes):
                    removed[i]=structure.flexibility(mode,coordinate,all_bearings)
                    before[i]+=removed[i]
            answer=solve([v-f for v,f in zip(before,s['mul'](flexible,fixed))])
            return answer,rhs,solve(removed)

        pressure=[applied(a,2.25,None,True) for a in range(8)]
        points={(a,x):applied(a,0,(1500,x),False) for a in range(8) for x in (1360,2240)}

        def flatten(displacement,load,local_load=None):
            response=member.local_actions(member.response(displacement,load)[0],local_load)
            return [(*r['endAxial'],*r['strong'],*r['weak'],r['torsion']) for r in response]
        increments={}
        for (loaded,x),(displacement,load,_) in points.items():
            for a in range(8):
                increments[loaded,x,a]=flatten(ends(a,displacement),load if a==loaded else empty)
        cells={(i,adverse):cage(width,e['kind'],(e['left'][1]+e['right'][1])/2,adverse)
               for i,e in enumerate(member.elements) for adverse in (False,True)}
        @lru_cache(None)
        def resistance(element,axial_lower,adverse,fraction):
            c=cells[element,adverse];b,h,xs,ys=(c[k] for k in ('b','h','xs','ys'))
            strong=min(capacity(round(b,4),h,*xs,n,sign,fraction) for n in (axial_lower,axial_lower+2) for sign in (False,True))
            weak=min(capacity(h,round(b,4),*(round(v,4) for v in ys),n,sign,fraction) for n in (axial_lower,axial_lower+2) for sign in (False,True))
            return strong,weak

        maxima={name:[0.,0.] for name in ('nominalRatio','adverseRatio','nominalLink','adverseLink','nominalLongitudinalRatio','adverseLongitudinalRatio','nominalStrut','adverseStrut')}
        witnesses={}
        observations=0
        for wind_index,wind_case in enumerate(s['updated_wind']):
            wind_code,roof_wind=wind_case[:2]
            floor=s['m']['recover']([0.]*8,p['floorLoadCases'][id(roof_wind)])[0]
            wind=solve([structure.background(mode,roof_wind,floor) for mode in modes])
            exposed=[a for a in range(8) if api['active'](wind_code,a)]
            base=[x+y for x,y in zip(gravity_displacement,wind)]
            for pressure_sign in (1,-1):
                normal_base=base[:]
                for a in exposed:
                    normal_base=[x+pressure_sign*y+(1-pressure_sign)*z for x,y,z in zip(normal_base,pressure[a][0],pressure[a][2])]
                background=[]
                for a,(gravity,gravity_local) in enumerate(gravities):
                    load=[x+pressure_sign*y for x,y in zip(gravity,pressure[a][1])] if a in exposed else gravity
                    background.append(flatten(ends(a,normal_base),load,gravity_local))
                for loaded,x,point_sign in product(range(8),(1360,2240),(1,-1)):
                    for a,base_actions in enumerate(background):
                        for element,(raw,delta) in enumerate(zip(base_actions,increments[loaded,x,a])):
                            e=member.elements[element]
                            if e['kind']=='knee':
                                continue
                            n1,n2,vs1,ms1,vs2,ms2,vw1,mw1,vw2,mw2,tor=(v+point_sign*d for v,d in zip(raw,delta))
                            kind=int(e['kind']=='jamb')
                            mw=max(abs(mw1),abs(mw2));vw=max(abs(vw1),abs(vw2));vs=max(abs(vs1),abs(vs2))
                            for adverse in (False,True):
                                prefix='adverse' if adverse else 'nominal'
                                c=cells[element,adverse];b,h,xs,ys=(c[k] for k in ('b','h','xs','ys'))
                                area,perimeter=c['cellArea'],c['cellPerimeter']
                                torsion_flow=abs(tor)*1e6/(2*area)
                                # At theta45 the total longitudinal tie is q*uk.
                                # Share it equally among four corner bars before
                                # evaluating flexure/axial with those SAME bars.
                                steel_area=4*math.pi*16**2/4
                                reserved=torsion_flow*perimeter/(steel_area*(500/1.15))
                                maxima[prefix+'LongitudinalRatio'][kind]=max(maxima[prefix+'LongitudinalRatio'][kind],reserved)
                                # Retain 5% authored steel-strength uncertainty,
                                # then round remaining strength DOWN to 1% bins.
                                fraction=max(.01,math.floor((.95-reserved)*100)/100)
                                for n,ms in ((-n1,abs(ms1)),(-n2,abs(ms2))):
                                    rs,rw=resistance(element,2*math.floor(n/2),adverse,fraction)
                                    ratio=ms/rs+mw/rw if reserved<.95 else 1e6
                                    if ratio>maxima[prefix+'Ratio'][kind]:
                                        maxima[prefix+'Ratio'][kind]=ratio
                                        witnesses[prefix+'Ratio/'+str(kind)]=[wind_index,loaded,a,x,point_sign,pressure_sign,element,n,ms,mw,rs,rw,tor,reserved,fraction]
                                zs=.85*min(h-xs[0],xs[1]);zw=.85*min(b-ys[0],ys[1])
                                flow=torsion_flow+max(vs*1000/(2*zs),vw*1000/(2*zw))
                                if flow>maxima[prefix+'Link'][kind]:
                                    maxima[prefix+'Link'][kind]=flow
                                    witnesses[prefix+'Link/'+str(kind)]=[wind_index,loaded,a,x,point_sign,pressure_sign,element,tor,vs,vw,area,perimeter]
                                # Dated theta45 thin-wall/variable-angle-truss
                                # comparison, conservative sum of both shear axes.
                                nu=.6*(1-30/250);fcd=17;teff=b*h/(2*(b+h))
                                strut=abs(tor)*1e6/(nu*fcd*area*teff)+vs*1000/(.5*nu*fcd*b*zs)+vw*1000/(.5*nu*fcd*h*zw)
                                maxima[prefix+'Strut'][kind]=max(maxima[prefix+'Strut'][kind],strut)

                        observations+=1
        row={'crackedEI':cracked,'LAndUpstandTorsionFactor':torsion,'allLowerBearings':all_bearings,'floorRoofYawJoin':yaw_join,
             'maximumSameStateActions':maxima,'governingStates':witnesses,'memberWindowRecoveries':observations,
             'H6Minimum5p7MaximumPitch58NPerMM':math.pi*5.7**2/4*500/1.15/58}
        width_results.append(row)
        print('OUTWARD ARCH',width,cracked,torsion,maxima,flush=True)
    controls.append({'geometry':geometry(width),'coupled':width_results})
sys.argv=arguments
source_names=['arch-space-kernel.py','arch-width-geometry.py','arch-space-flexibility.py','arch-normal-kernel.py','current-house-coupled-arches.py','current-house-spatial-arches.py','current-house-window-receivers.json','current-house-arch-detail.json']
result={'sources':{name:hashlib.sha256((D/name).read_bytes()).hexdigest() for name in source_names},'role':'Full member-centroid three-dimensional RC width control. Both widths move outward while the occupied inner face stays fixed. Includes the changed near-L Ixy/torsion band. Full foundation delivery, root stress fields, cage, mass intersections, shear-centre transition and thermal/weather/renewal joins remain under development.',
        'controls':controls,'method':'JRC Walraven 2008 slides83-87, thin-wall torsion at theta45; C30 fcd17/nu0.528, four H16 ties, same-state longitudinal reserve before biaxial bending. Authored comparison only, not current-code compliance. The 5% steel reserve and cast -10/setout5 challenges are requirements to qualify, not delivered bounds. K uses nominal sections; minimum-section stiffness, longitudinal shear-shift anchorage and full all-head transfer remain open.', 'methodSource':'https://eurocodes.jrc.ec.europa.eu/sites/default/files/2022-06/EN1992_1_Walraven.pdf','admitted':False}
path=Path(__file__).with_suffix('.json');text=json.dumps(result,indent=2,sort_keys=True)+'\n'
if '--check' in sys.argv:
    assert path.read_text()==text
else:
    path.write_text(text)
