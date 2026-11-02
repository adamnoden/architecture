#!/usr/bin/env python3
"""Source-bound combined gravity screen at the selected service-spine opening.

A statically determinate line-load thought experiment, not an arch or bearing design.
"""
import hashlib,json,math,sys
from pathlib import Path
R=Path(__file__).resolve().parents[3]
paths=['project/had/studies/open-north-loggia.json','project/str/studies/whole-house-reaction-join.json','project/str/studies/physical-slab-join.json']
expected=['542781c6bb1d277b20492e8433cea498e98eaea5db2e737a5ec7e9655f9d18fd','d48f810099cfbe36c3762955bc272df7b8c9fcd222a6bf0ef4c54fdb3a02e97b','9740fa55322013fd642bf33d09fbedcad447e4dd9c3edd390488bf6e41f2f45c']
raw=[(R/p).read_bytes() for p in paths]
actual=[hashlib.sha256(b).hexdigest() for b in raw]
assert actual==expected, 'Source changed; re-evaluate topology before updating fingerprints: '+str(actual)
h,j,s=map(json.loads,raw)
w=next(w for w in h['groundWalls'] if w['id']=='service-spine')
door=next(d for d in h['protectedRoute']['doors'] if d['id']=='PLANT')
assert door['host']=='service-spine' and door['rough']==[2750,3650] and h['protectedRoute']['rectangularAssemblyHeightMaximum']==2250
assert w['a']==[9300,0] and w['b']==[9300,8290] and w['holes']==[[2750,3650]] and w['structuralCore']==[9230,9370]
e=next(e for e in j['axis_floor']['support_edges'] if e['field']=='east-strip' and e['ground']['route']=='spine')
assert e['segment']==[9300,332.5,9300,8290]
t=next(t for t in s['upper_wall_opening_transfers'] if t['upper']=='wet-spine' and t['lower']=='service-spine')
assert t['hole']==w['holes'][0] and t['overlap']==t['hole']
L=(t['hole'][1]-t['hole'][0])/1000
span=(e['segment'][3]-e['segment'][1])/1000
floor_line=e['vertical_ULS_kN']/span
wall_line=t['gross_head_challenge_kN']/L
floor=floor_line*L; wall=wall_line*L
load=floor+wall
assert math.isclose(floor/2+wall/2,load/2)
assert math.isclose(2*(load/2),load)
result={'status':'conditional source-bound line-load sensitivity; no capacity or HOUSE pass','sources':dict(zip(paths,actual)), 'opening_mm':t['hole'], 'protected_boundary_door':door, 'rectangular_assembly_height_maximum_mm':2250, 'clear_span_m':L, 'floor_edge_total_kN':e['vertical_ULS_kN'], 'floor_edge_length_m':span, 'assumed_uniform_floor_edge_kN_m':floor_line, 'floor_over_opening_kN':floor, 'upper_wall_gross_over_opening_kN':wall, 'combined_kN':load, 'symmetric_reaction_each_kN':load/2, 'simply_supported_sagging_kNm':load*L/8, 'parabolic_three_hinge_unit_rise_thrust_kN_m':load*L/8, 'scope':'Upper gross wall is adverse full-height challenge, not measured spandrel. The 7.5 G floor allowance may overlap some wall loads: this is a potentially overlapping sensitivity, not a disjoint design case or complete upper bound. Floor edge uniformity, head span, pier contact, arch and bearing remain unproved. Do not add transferred actions to their originating floor/wall totals.'}
# Trial bearing patches lie wholly outside the opening; centre span is 1.1 m.
# Model the specified uniform action over the central 0.9 m only.
bearing=.2
centres=L+bearing
M=load*(2*centres-L)/8
rise=.3
result['trial']={'bearing_each_m':bearing,'bearing_axes_m':[2.65,3.75], 'centre_span_m':centres,'loaded_width_m':L,'midspan_moment_kNm':M,'mean_vertical_contact_MPa':(load/2)/(.14*bearing)/1000,'three_hinge_horizontal_kN':M/rise,'trial_rise_m':rise,'qualifier':'200 mm plan bearing and 300 mm rise are an unadopted geometric trial; thrust uses symmetric three-hinge crown equilibrium, not an assembled arch or anchor design. No bearing strength, lateral sharing or installed capacity is established.'}
# Apply the same source-edge idealisation to all eight recorded transfers. This
# is not a complete floor traction model: residual slab, beams and point loads
# are not included. Patch geometry is tested in plan, never for capacity.
joined=[]
for t in s['upper_wall_opening_transfers']:
    a,b=t['left_pier'],t['right_pier']; horizontal=a[1]==b[1]
    ix=0 if horizontal else 1; fixed=1-ix
    lo,hi=sorted((a[ix],b[ix])); centre=(lo+hi)/2
    segments=[]
    for edge in j['axis_floor']['support_edges']:
        v=edge['segment']; A=v[:2]; B=v[2:]
        if A[fixed]!=B[fixed] or A[fixed]!=a[fixed]: continue
        start=max(lo,min(A[ix],B[ix])); end=min(hi,max(A[ix],B[ix]))
        if end<=start: continue
        load=edge['vertical_ULS_kN']*(end-start)/abs(B[ix]-A[ix])
        segments.append({'field':edge['field'],'interval_mm':[start,end],'ULS_kN':load})
    over=t['overlap']; wall=t['gross_head_challenge_kN']
    segments.append({'field':'upper-wall-gross','interval_mm':over,'ULS_kN':wall})
    left=lo-100; right=hi+100; span=(right-left)/1000
    total=sum(x['ULS_kN'] for x in segments)
    rright=sum(x['ULS_kN']*((sum(x['interval_mm'])/2-left)/1000) for x in segments)/span
    rleft=total-rright
    ground=next(x for x in h['groundWalls'] if x['id']==t['lower'])
    ends=sorted((ground['a'][ix],ground['b'][ix]))
    # Check whether any other hole overlaps a patch, as well as wall ends.
    patches=[[lo-200,lo],[hi,hi+200]]
    patch_fit=[v[0]>=ends[0] and v[1]<=ends[1] and all(v[1]<=hole[0] or v[0]>=hole[1] for hole in ground['holes']) for v in patches]
    assert math.isclose(rleft+rright,total,rel_tol=1e-12)
    assert math.isclose(rright*span,sum(x['ULS_kN']*((sum(x['interval_mm'])/2-left)/1000) for x in segments),rel_tol=1e-12)
    joined.append({'upper':t['upper'],'lower':t['lower'],'hole_mm':[lo,hi],'trial_bearing_patches_mm':patches,'patches_within_source_wall_plan':patch_fit,'included_actions':segments,'total_kN':total,'left_reaction_kN':rleft,'right_reaction_kN':rright})
assert len(joined)==8 and next(x for x in joined if x['upper']=='bed2-east')['patches_within_source_wall_plan']==[True,False]
result['eight_opening_comparison']={'rows':joined,'scope':'Conditional uniform edge-action over overlap plus prior gross wall challenge; potentially overlapping sensitivity, not a disjoint design case or complete head-load bound. Patch plan fit is not capacity or joint proof; any false patch rejects that simple trial.'}
out=R/'project/str/studies/spine-opening-join.json'
text=json.dumps(result,indent=2,sort_keys=True)+'\n'
if '--check' in sys.argv:
 assert out.read_text()==text, 'output differs';print('spine opening join verified')
else: out.write_text(text);print(text)
