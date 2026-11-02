#!/usr/bin/env python3
"""Finite SW RC-pier / warm-cold connector comparison, not a member design."""
import hashlib,json,math,sys
from pathlib import Path
R=Path(__file__).resolve().parents[3]
paths=['project/had/studies/open-north-loggia.json','project/str/studies/open-loggia-support.json','project/str/studies/disjoint-house-actions.json','project/mat/studies/warm-receiving-grid.json']
expected=['542781c6bb1d277b20492e8433cea498e98eaea5db2e737a5ec7e9655f9d18fd','b5f08104c0da327613b84e055420d58f7709c354facd205634bcfd69a05e09b5','3906870b991841aba7769a4d913dce15113ba4a7f8c4f800913d2d86fecaa3a9','a2b15c9505ee3888ffb892aa7e5182f80f4aa5a70bd5058a915df6e3bec4de99'];raw=[(R/p).read_bytes() for p in paths];sha=[hashlib.sha256(x).hexdigest() for x in raw]
assert sha==expected,'Source changed: re-evaluate before updating source identity '+str(sha)
h,roof,disjoint,mat=map(json.loads,raw)
exit=next(e for e in roof['lower_grid']['current_house_concept_join']['roof_control_exits'] if e['id']=='corner-SW-outer')
assert exit['xy']==[332.5,332.5] and math.isclose(exit['roof_ULS'],68.110875)
uplift=roof['actual_roof']['cases']['uplift-stress']['corner_action_envelope']['RA']
assert math.isclose(uplift,-24.3253125)
assert h['shell']==12000 and h['envelope']==429.5
assert h['sections']['firstFloorRC']=={'top':3370,'bottom':3170}
# Trial RC pier/receiving square replaces, not adds to, intersecting masonry.
# No finished plan or material choice is changed without HAD/MAT reconciliation.
pier=[262.5,262.5,562.5,562.5]; centre=[412.5,412.5]; roofxy=exit['xy']; coldaxis=[300,300]
inner_core=[262.5,402.5]; interior_face=429.5
patch=[(322.5,322.5),(322.5,502.5),(502.5,322.5),(502.5,502.5)];rod_d=20; bore_d=60
for x,y in patch:
 assert min(x-pier[0],pier[2]-x,y-pier[1],pier[3]-y)>=bore_d/2
assert all(math.dist(a,b)>=bore_d for i,a in enumerate(patch) for b in patch[i+1:])
# Compare only the nominal enclosed rectangles, not unmodelled full apparatus.
def boxgap(a,b):return math.hypot(max(a[0]-b[2],b[0]-a[2],0),max(a[1]-b[3],b[1]-a[3],0))
near=[]
for level in ['groundFurniture','upperFurniture']:
 for name,v in h[level].items():
  if isinstance(v,list) and len(v)==4 and all(isinstance(x,(int,float)) for x in v):
   x,y,w,d=v; gap=boxgap(pier,[x,y,x+w,y+d]); near.append((gap,level,name))
near.sort();assert near[0][0]>0
# Actual candidate retained HAD routes: exact segment/rectangle distance for
# a round-plan body against this new solid. This does not reprove whole paths.
def pbox(p):return math.hypot(max(pier[0]-p[0],p[0]-pier[2],0),max(pier[1]-p[1],p[1]-pier[3],0))
def pseg(p,a,b):
 dx=b[0]-a[0];dy=b[1]-a[1];den=dx*dx+dy*dy
 t=max(0,min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/den)) if den else 0
 return math.hypot(p[0]-(a[0]+t*dx),p[1]-(a[1]+t*dy))
def segbox(a,b):
 # Liang-Barsky intersection, otherwise nearest endpoint/corner.
 dx=b[0]-a[0];dy=b[1]-a[1];lo=0.;hi=1.
 for p,q in [(-dx,a[0]-pier[0]),(dx,pier[2]-a[0]),(-dy,a[1]-pier[1]),(dy,pier[3]-a[1])]:
  if p==0:
   if q<0:lo=2;break
  elif p<0:lo=max(lo,q/p)
  else:hi=min(hi,q/p)
 if lo<=hi:return 0.
 corners=[(pier[0],pier[1]),(pier[0],pier[3]),(pier[2],pier[1]),(pier[2],pier[3])]
 return min(pbox(a),pbox(b),*(pseg(p,a,b) for p in corners))
routes=[]
for w in h['actions']['witnesses']:
 pts=w['points'];dist=min(segbox(a,b) for a,b in zip(pts,pts[1:]));routes.append({'id':w['id'],'level':w['level'],'radius_mm':w['bodyRadius'],'reserve_to_pier_mm':dist-w['bodyRadius']})
minroute=min(routes,key=lambda x:x['reserve_to_pier_mm']);assert minroute['reserve_to_pier_mm']>0
# One roof point, not a whole-node reaction; moments must combine with all
# wall/floor/wind actions. Two-axis moment signs follow r × vertical force.
def moments(F,origin,point=roofxy):
 rx=(point[0]-origin[0])/1000;ry=(point[1]-origin[1])/1000
 return [-ry*F,rx*F]
loads={'roof_down_ULS_kN':exit['roof_ULS'],'roof_uplift_no_favourable_G_kN':uplift,'roof_only_about_warm_centroid_down_kNm':moments(exit['roof_ULS'],centre),'roof_only_about_warm_centroid_uplift_kNm':moments(uplift,centre),'roof_only_about_cold_corner_axes_down_kNm':moments(exit['roof_ULS'],coldaxis),'roof_only_about_cold_corner_axes_uplift_kNm':moments(uplift,coldaxis),'translated_force_only_about_cold_down_kNm':moments(exit['roof_ULS'],coldaxis,centre),'translated_force_only_about_cold_uplift_kNm':moments(uplift,coldaxis,centre),'station_horizontal_unit_kN':1,'height_primary_above_cold_top_m':(roof['actual_roof']['primary_centre']+765)/1000}
for case in ['down','uplift']:
 warm=loads['roof_only_about_warm_centroid_'+case+'_kNm']; translated=loads['translated_force_only_about_cold_'+case+'_kNm']; cold=loads['roof_only_about_cold_corner_axes_'+case+'_kNm']
 assert all(math.isclose(warm[i]+translated[i],cold[i],abs_tol=1e-12) for i in range(2))
# A tension-only bilinear reaction distribution is a static witness, not a
# predicted distribution: equal elastic stiffness would require one negative
# reaction and hence contact, redistribution or a different stiffness model.
u=abs(uplift); lo=322.5; hi=502.5; tx=(roofxy[0]-lo)/(hi-lo);ty=(roofxy[1]-lo)/(hi-lo)
weights=[(1-tx)*(1-ty),(1-tx)*ty,tx*(1-ty),tx*ty]
T=[u*w for w in weights]
assert all(t>=0 for t in T) and math.isclose(sum(T),u)
assert math.isclose(sum(T[i]*patch[i][0] for i in range(4)),u*roofxy[0])
assert math.isclose(sum(T[i]*patch[i][1] for i in range(4)),u*roofxy[1])
elastic=[u/4 + u*((roofxy[0]-centre[0])*(x-centre[0])+(roofxy[1]-centre[1])*(y-centre[1]))/(4*90**2) for x,y in patch]
assert min(elastic)<0 and math.isclose(sum(elastic),u)
old_two_near=u*(487.5-332.5)/(487.5-337.5);old_two_far=u-old_two_near
assert old_two_far<0
# Optimistic fixed/fixed equal-split steel beam sensitivity: NOT a designed
# anchor, bearing, grout, cage, strength, cyclic or creep verification.
L=385.;E=200000.;I=math.pi*rod_d**4/64;Z=math.pi*rod_d**3/32
shear_each=250.; bend=shear_each*L/2; delta=shear_each*L**3/(12*E*I)
axial_each=max(T)*1000;A=math.pi*rod_d**2/4
# Trial RC pier gross: masonry and slab overlap must be removed in any total.
column_top=6410;column_bottom=-80
roof_comparator_underside=roof['actual_roof']['primary_centre']-60
nominal_seat_gap=roof_comparator_underside-column_top
# The old +6640 pier is rejected after hip seating: see finite roof trial.
assert nominal_seat_gap>0;gross_volume=.3*.3*(column_top-column_bottom)/1000
core_overlap_area=(2*300*140-140*140)/1e6
trial={'pier_bounds_mm':pier,'pier_bottom_top_mm':[column_bottom,column_top],'pier_centroid_mm':centre,'room_projection_mm':pier[2]-interior_face,'roof_point_offset_from_pier_mm':[roofxy[i]-centre[i] for i in range(2)],'cold_axis_offset_from_pier_mm':[centre[i]-coldaxis[i] for i in range(2)],'corner_SHS120_comparator_underside_if_same_centre_mm':roof_comparator_underside,'nominal_pier_to_comparator_gap_mm':nominal_seat_gap,'trial_plate_mm':20,'old_parent_SHS120_underside_gap_not_seat_mm':nominal_seat_gap-20,'pier_gross_volume_m3':gross_volume,'pier_gross_G_kN_at_25':gross_volume*25,'core_plan_overlap_m2':core_overlap_area,'upper_slab_plan_overlap_m2':((pier[2]-332.5)/1000)**2,'nearest_furniture_proxy':{'name':near[0][2],'level':near[0][1],'rectangular_gap_mm':near[0][0]},'minimum_retained_route':minroute,'all_route_reserves':routes}
assert math.isclose(60-rod_d/2-8,42)
connector={'warm_RC_z_mm':[-380,-80],'cold_RC_z_mm':[-1215,-765],'gap_mm':L,'bar_centres_mm':patch,'bar_diameter_mm':rod_d,'bore_diameter_mm':bore_d,'annulus_radial_mm':(bore_d-rod_d)/2,'nominal_bar_bottom_top_mm':[-990,column_top],'nominal_cold_RC_embed_mm':225,'bar_length_mm':column_top+990,'trial_links_diameter_mm':8,'nominal_cover_outside_link_mm':42,'gross_bar_area_mm2':4*A,'gross_bar_mass_G_kN_at_78p5':4*A/1e6*((column_top+990)/1000)*78.5,'unit_station_H_kN':1,'ideal_four_bar_moment_each_kNm':bend/1e6,'ideal_gross_bending_stress_MPa':bend/Z,'ideal_elastic_translation_mm':delta,'bilinear_tension_only_witness_kN':T,'equal_elastic_unilateral_ignored_kN':elastic,'two_tie_tension_only_control_kN':[old_two_near,old_two_far],'largest_witness_gross_tensile_stress_MPa':axial_each/A,'nominal_bore_area_fraction':4*math.pi*(bore_d/2)**2/(300*300),'scope':'Continuous rods connect cold receiver to the underside of a trial cap plate; actual cold anchorage, plate connection, construction sequence and bar material remain unqualified. Fixed-fixed, equal split and nominal smooth gross sections are stress sensitivities only. Real fixity, embedment, shear, tension, fatigue, slip, ductility, reinforcement, DPC, gas, moisture, fire and thermal qualification are absent. The bars and bores are not selected.'}
# Explicit cold-node geometric replacement for the rejected translated bent
# starters. This is a construction proposal, not headed-anchor capacity.
def segdist(p0,p1,q0,q1):
 sub=lambda a,b:tuple(x-y for x,y in zip(a,b));dot=lambda a,b:sum(x*y for x,y in zip(a,b));u=sub(p1,p0);v=sub(q1,q0);w=sub(p0,q0);a=dot(u,u);b=dot(u,v);c=dot(v,v);d=dot(u,w);e=dot(v,w)
 def at(t,z):return math.dist(tuple(p0[i]+t*u[i] for i in range(3)),tuple(q0[i]+z*v[i] for i in range(3)))
 vals=[at(0,max(0,min(1,e/c))),at(1,max(0,min(1,(e+b)/c))),at(max(0,min(1,-d/a)),0),at(max(0,min(1,(b-d)/a)),1)];det=a*c-b*b
 if det>1e-10:
  t=(b*e-c*d)/det;z=(a*e-b*d)/det
  if 0<=t<=1 and 0<=z<=1:vals.append(at(t,z))
 return min(vals)
def clear(a,b):
 return min(segdist(p,q,r,t) for p,q in zip(a['points'],a['points'][1:]) for r,t in zip(b['points'],b['points'][1:]))-(a['dia']+b['dia'])/2-.1
def minimum(A,B):
 v,a,b=min((clear(a,b),a['id'],b['id']) for a in A for b in B);return {'clear_mm':v,'a':a,'b':b}
# Hold-downs/heads are separated from 8 source pile axes; the exact concrete
# and reinforcement resistance is NOT inferred from this clearance screen.
coldrods=[{'id':f'R{i+1}','dia':20,'points':[(x,y,-990),(x,y,-765)]} for i,(x,y) in enumerate(patch)]
legacy=roof['cap']['named_starter_profiles'][0]['starters']
assert roof['cap']['named_starter_profiles'][0]['id']=='SW-regular'
old=[]
for bar in legacy:
 old.append({'id':bar['id'],'dia':bar['dia'],'points':[(x,y,z-585) for x,y,z in bar['points']]})
old_clear=minimum(old,coldrods);assert old_clear['clear_mm']<22
axes=roof['cap']['pile_vertical_bar_centres'];assert len(axes)==8
pileheads=[];piles=[]
for i,(x,y) in enumerate(axes):
 z=-1030 if i%2==0 else -1075
 pileheads.append({'id':f'H{i+1}','x':x,'y':y,'z':z,'r':60,'thickness':12})
 piles.append({'id':f'P{i+1}','dia':22,'points':[(x,y,-1215),(x,y,z)]})
holdheads=[{'id':f'A{i+1}','x':x,'y':y,'z':-990,'r':40,'thickness':12} for i,(x,y) in enumerate(patch)]
top=[];bottom=[]
for q0 in [60,270,550]:
 top += [{'id':f'TE{q0}','dia':20,'points':[(0,q0,-823),(2050,q0,-823)]},{'id':f'TN{q0}','dia':20,'points':[(q0,0,-866),(q0,2050,-866)]}]
for q0 in [60,110,300,490,540]:
 bottom += [{'id':f'BE{q0}','dia':20,'points':[(0,q0,-1165),(2050,q0,-1165)]},{'id':f'BN{q0}','dia':20,'points':[(q0,0,-1114),(q0,2050,-1114)]}]
hoops=[]
for z in [-809,-903,-950,-1030,-1100,-1151]:
 hoops.append({'id':f'HL{z}','dia':8,'points':[(44,44,z),(556,44,z),(556,556,z),(44,556,z),(44,44,z)]})
checks={'pile_to_holddown':minimum(piles,coldrods),'pile_to_bottom':minimum(piles,bottom),'pile_to_top':minimum(piles,top),'pile_to_hoops':minimum(piles,hoops),'holddown_to_top':minimum(coldrods,top),'holddown_to_hoops':minimum(coldrods,hoops),'top_crossing':minimum(top[::2],top[1::2]),'bottom_crossing':minimum(bottom[::2],bottom[1::2])}
# Selected hoop/mat contacts are deliberate tangencies: top EW at −809,
# bottom NS at −1100 and bottom EW at −1151. Check all other pairs.
intentional={('HL-809','TE'),('HL-1100','BN'),('HL-1151','BE')}
other=[(clear(h,b),h['id'],b['id']) for h in hoops for b in top+bottom if not any(h['id']==hh and b['id'].startswith(prefix) for hh,prefix in intentional)]
v,a,b=min(other);checks['hoop_to_unrelated_mat']={'clear_mm':v,'a':a,'b':b}
contacts=[clear(h,b) for h in hoops for b in top+bottom if any(h['id']==hh and b['id'].startswith(prefix) for hh,prefix in intentional)]
assert min(contacts)>=-.100001
# For axis-aligned straight steel, minimum distance to a finite circular head
# is found from segment endpoints and projections on centre/slab faces.
def headseg(h,a,b,dia):
 dx=b[0]-a[0];dy=b[1]-a[1];dz=b[2]-a[2];cand=[0.,1.]
 for A0,D,C in [(a[0],dx,h['x']),(a[1],dy,h['y']),(a[2],dz,h['z']-h['thickness']/2),(a[2],dz,h['z']+h['thickness']/2)]:
  if D and 0<(t:=(C-A0)/D)<1:cand.append(t)
 best=1e9
 for t in cand:
  x=a[0]+dx*t;y=a[1]+dy*t;z=a[2]+dz*t
  radial=max(math.hypot(x-h['x'],y-h['y'])-h['r'],0);vertical=max(abs(z-h['z'])-h['thickness']/2,0)
  best=min(best,math.hypot(radial,vertical)-dia/2-.1)
 return best
def headbars(H,B,exclude_own=False):
 vals=[(headseg(h,a,b,bar['dia']),h['id'],bar['id']) for h in H for bar in B if not(exclude_own and h['id'][1:]==bar['id'][1:]) for a,b in zip(bar['points'],bar['points'][1:])]
 v,a,b=min(vals);return {'clear_mm':v,'a':a,'b':b}
for label,H,B in [('pile_head_to_hold',pileheads,coldrods),('pile_head_to_top',pileheads,top),('pile_head_to_bottom',pileheads,bottom),('pile_head_to_hoops',pileheads,hoops),('hold_head_to_pile',holdheads,piles),('hold_head_to_top',holdheads,top),('hold_head_to_bottom',holdheads,bottom),('hold_head_to_hoops',holdheads,hoops)]:checks[label]=headbars(H,B)
checks['pile_head_to_other_pile']=headbars(pileheads,piles,True)
checks['hold_head_to_other_hold']=headbars(holdheads,coldrods,True)
def within(B):
 v,a,b=min((clear(a,b),a['id'],b['id']) for i,a in enumerate(B) for b in B[i+1:]);return {'clear_mm':v,'a':a,'b':b}
checks['perimeter_hoops_each_other']=within(hoops)
checks['pile_bars_each_other']=within(piles)
checks['holddowns_each_other']=within(coldrods)
def headhead(A,B,same=False):
 vals=[]
 for i,a in enumerate(A):
  for j,b in enumerate(B):
   if same and j<=i:continue
   radial=max(math.hypot(a['x']-b['x'],a['y']-b['y'])-a['r']-b['r'],0)
   vertical=max(abs(a['z']-b['z'])-(a['thickness']+b['thickness'])/2,0)
   vals.append((math.hypot(radial,vertical)-.1,a['id'],b['id']))
 v,a,b=min(vals);return {'clear_mm':v,'a':a,'b':b}
checks['pile_heads_each_other']=headhead(pileheads,pileheads,True)
checks['hold_heads_each_other']=headhead(holdheads,holdheads,True)
checks['pile_to_hold_heads']=headhead(pileheads,holdheads)
assert min(v['clear_mm'] for v in checks.values())>=22
assert all(h['x']-h['r']>=0 and h['y']-h['r']>=0 and h['x']+h['r']<=600 and h['y']+h['r']<=600 for h in pileheads+holdheads)
old_demand=roof['cap']['pile_bar_development']['full_yield_bend_force_kN'];pile_net=math.pi*(120**2-22**2)/4;hold_net=math.pi*(80**2-20**2)/4
cold_cage={'status':'headed straight-bar candidate, not a foundation, head or node adequacy pass','cold_node_bounds_xy_mm':[0,0,600,600],'cold_node_z_mm':[-1215,-765],'legacy_bent_starter_translated_minus585_min_clear':old_clear,'minimum_geometry_checks':checks,'pile_H22_axes_heads':pileheads,'holddown_H20_heads':holdheads,'top_bars':top,'bottom_bars':bottom,'horizontal_perimeter_hoops':hoops,'intentional_mat_hoop_contacts':sorted(intentional),'head_compression_sensitivity':{'old_H22_full_yield_kN':old_demand,'pile_head_net_face_mm2':pile_net,'pile_head_mean_MPa':old_demand*1000/pile_net,'old_authored_fcd_MPa':17,'hold_roof_witness_max_kN':max(T),'hold_head_net_face_mm2':hold_net,'hold_head_mean_MPa':max(T)*1000/hold_net},'scope':'Twelve 12 mm circular heads are trial geometry: no proprietary head, weld, anchorage, concrete strut/tie, bearing, splitting, breakout, fatigue, cover tolerance or pile capacity is accepted. Selected hoop/mat tangencies are intentionally tied contacts, not unrelated-bar clashes. Six horizontal perimeter hoops provide a finite vertical-bar confinement geometry but do not prove joint shear or replace required arm links. Actual joint shear steel, pours, mechanical attachment and full 3D concrete remain to qualify.'}
# Explicit outer-SW roof triangle. The candidate retains 25° face planes,
# diagonal hip from the actual outer seat to the 2125 ridge and an 80 mm
# jack family. At each strip, transverse purlins cantilever at most 500 mm to
# the jack; this is a deliberate structural substitution, not MAT roof proof.
tan=math.tan(math.radians(25)); hipang=math.atan(tan/math.sqrt(2));hiphalf=60/math.cos(hipang); jackhalf=40/math.cos(math.radians(25));faceoffset=60*math.sqrt(2);hipdrop=195.
base=roof['actual_roof']['primary_centre'];hip_z=base-hipdrop;hip_under=hip_z-hiphalf;hip_top=hip_z+hiphalf
jack_face_under=base-tan*faceoffset-jackhalf;seat_gap=jack_face_under-hip_top
assert seat_gap>10 and math.isclose(faceoffset,84.8528137423857,abs_tol=1e-8)
cap_top=column_top+20;hip_bearing_gap=hip_under-cap_top
assert hip_bearing_gap>20
ring={'section_mm':[120,120,6.3],'south_plan':[562.5,272.5,4800,392.5],'west_plan':[272.5,562.5,392.5,3247.5],'z_bottom_top_mm':[6540,6660], 'south_support_axes_mm':[597.5,4800], 'west_support_axes_mm':[597.5,3247.5], 'corner_wing_contact_mm':[70,120], 'ring_to_jack_underside_gap_mm':base-jackhalf-6660,'upper_arch_extrados_mm':6515,'arch_clearance_mm':25, 'scope':'Conventional steel ring candidate substitutes a concrete eave collector at SW, remains inside nominal 140 core. End steel saddles, ring anchorage, casing, fire, local source changes and full member actions are not designed.'}
assert ring['ring_to_jack_underside_gap_mm']>30
# Exact polygon centroid for a straight-face triangular roof strip; clip at
# jack-to-hip face. Other roof facets and whole hip forces remain separate.
def polygon(poly):
 twice=0.;cx=0.;cy=0.
 for (x,y),(X,Y) in zip(poly,poly[1:]+poly[:1]):
  c=x*Y-X*y;twice+=c;cx+=(x+X)*c;cy+=(y+Y)*c
 if abs(twice)<1e-9:return (0.,0.,0.)
 return (abs(twice)/2,cx/(3*twice),cy/(3*twice))
def clip_y(poly,cap,below=True):
 out=[]
 for a,b in zip(poly,poly[1:]+poly[:1]):
  ia=a[1]<=cap if below else a[1]>=cap;ib=b[1]<=cap if below else b[1]>=cap
  if ia:out.append(a)
  if ia!=ib:
   t=(cap-a[1])/(b[1]-a[1]);out.append((a[0]+t*(b[0]-a[0]),cap))
 return out
strips=[]
for a,b in [(0,500),(500,1000),(1000,1500),(1500,2000),(2000,2125)]:
 poly=[(a,-200),(b,-200),(b,b),(a,a)];face=b-faceoffset
 A,x,y=polygon(poly);A1,x1,y1=polygon(clip_y(poly,face,True));A2,x2,y2=polygon(clip_y(poly,face,False))
 assert math.isclose(A1+A2,A,abs_tol=1e-6)
 # Half of the 80 section nominally occupies each support end. The x500
 # pair would leave only 2.65 mm clear and is replaced by a single hip
 # cantilever, with the exact moment carried into its hip bracket.
 L=face-332.5;clear=L-80
 item={'x_band_mm':[a,b],'jack_axis_x_mm':b,'roof_area_m2':A/1e6,'jack_loaded_area_m2':A1/1e6,'direct_hip_area_m2':A2/1e6,'hip_axis_y_mm':b,'jack_face_y_mm':face,'eave_axis_y_mm':332.5,'support_axis_span_mm':L,'nominal_between_80_seat_envelopes_mm':clear,'mode':'hip-fixed cantilever; eave support deliberately omitted' if b==500 else 'eave ring and hip-face seat'}
 for name,q in [('down',6.3),('uplift',-2.25)]:
  f1=A1/1e6*q; f2=A2/1e6*q
  if b==500: re=0.;rh=f1
  else: rh=f1*(y1-332.5)/L;re=f1-rh
  # Vertical force at hip is relocated from face to diagonal axis, while
  # purlin cantilevers relocate x to jack axis. Preserve the missing couples.
  hipforce=rh+f2
  cx=(A1*x1+A2*x2)/A;cy=(A1*y1+A2*y2)/A
  fx=q*A/1e6
  item[name]={'strip_force_kN':fx,'eave_ring_force_kN':re,'hip_force_kN':hipforce,'relocated_x_first_moment_kNm':fx*(cx-b)/1000,'relocated_y_first_moment_kNm':(fx*cy-re*332.5-hipforce*b)/1000}
  assert math.isclose(re+hipforce,fx,abs_tol=1e-10)
  assert math.isclose(re*332.5+hipforce*b+item[name]['relocated_y_first_moment_kNm']*1000,fx*cy,abs_tol=1e-7)
 strips.append(item)
assert strips[0]['nominal_between_80_seat_envelopes_mm']<3
assert math.isclose(sum(x['roof_area_m2'] for x in strips),2.6828125,abs_tol=1e-9)
# The two eave-ring spans use actual aligned wall intersections. This is only
# the outer triangular SOUTH face; the reflected west face repeats it, while
# eave rectangles, inner valley/roof facets and all other actions are omitted.
for item in strips:
 for name in ['down','uplift']:
  F=item[name]['eave_ring_force_kN']; left=F*(4800-item['jack_axis_x_mm'])/(4800-597.5);right=F-left
  item[name]['south_ring_SW_seat_kN']=left;item[name]['south_ring_x4800_seat_kN']=right
  assert math.isclose(left+right,F,abs_tol=1e-10)
# One deliberate force route: jack/purlin relocation couples pass through
# fixed hip endplates into the closed hip; the far hip end is a torsional
# release, so those couples are equilibrated by its two vertical supports.
# South and west eave rings have different actual next supports. Their local
# seats are 265 mm from the corner axis and transfer that couple into the cap.
partial_routes={}
for name in ['down','uplift']:
 hip_total=2*sum(t[name]['hip_force_kN'] for t in strips)
 hip_couple=sum(t[name]['relocated_x_first_moment_kNm']+t[name]['relocated_y_first_moment_kNm'] for t in strips)
 about_A=2*sum(t[name]['hip_force_kN']*(t['jack_axis_x_mm']-332.5)/1000 for t in strips)+hip_couple
 hip_B=about_A/3.585;hip_A=hip_total-hip_B
 sL=sum(t[name]['south_ring_SW_seat_kN'] for t in strips);sR=sum(t[name]['south_ring_x4800_seat_kN'] for t in strips)
 wL=sum(t[name]['eave_ring_force_kN']*(3247.5-t['jack_axis_x_mm'])/(3247.5-597.5) for t in strips)
 wR=sum(t[name]['eave_ring_force_kN'] for t in strips)-wL
 source=2*sum(t[name]['strip_force_kN'] for t in strips)
 assert math.isclose(hip_A+hip_B+sL+sR+wL+wR,source,abs_tol=1e-9)
 # Both source first moments of mirrored faces are equal. Force through the
 # ring saddle at x/y597.5 keeps its 265 mm cap offset, not a fictitious point.
 source_xy=sum(t[name]['strip_force_kN']*t['jack_axis_x_mm']+1000*t[name]['relocated_x_first_moment_kNm']+t[name]['eave_ring_force_kN']*332.5+t[name]['hip_force_kN']*t['jack_axis_x_mm']+1000*t[name]['relocated_y_first_moment_kNm'] for t in strips)
 rx=(hip_A+sL+wL)*332.5+hip_B*3917.5+sL*265+sR*4800+wR*332.5
 ry=(hip_A+sL+wL)*332.5+hip_B*3917.5+wL*265+sR*332.5+wR*3247.5
 assert math.isclose(rx,source_xy,abs_tol=1e-6) and math.isclose(ry,source_xy,abs_tol=1e-6)
 nodeF=hip_A+sL+wL
 nodeX=(hip_A*332.5+sL*597.5+wL*332.5)/nodeF
 nodeY=(hip_A*332.5+sL*332.5+wL*597.5)/nodeF
 partial_routes[name]={'two_faces_total_kN':source,'hip_SW_kN':hip_A,'hip_court_kN':hip_B,'south_ring_SW_saddle_kN':sL,'south_ring_x4800_kN':sR,'west_ring_SW_saddle_kN':wL,'west_ring_y3247p5_kN':wR,'hip_relocated_first_moment_kNm':hip_couple,'SW_node_vertical_kN':nodeF,'SW_node_resultant_xy_mm':[nodeX,nodeY], 'SW_warm_Mx_My_kNm':[-(nodeY-412.5)*nodeF/1000,(nodeX-412.5)*nodeF/1000], 'SW_cold_Mx_My_kNm':[-(nodeY-300)*nodeF/1000,(nodeX-300)*nodeF/1000]}
# A q450 cold post belongs on the top-flush below-AVCL purlin/jack,
# not on the setback ring. Check the complete diagonal hip-width crossover.
q=450.;purlin_under=base+tan*(q-332.5)-80/math.cos(math.radians(25))
hip_at_axis=base-hipdrop+tan*(q-332.5)+hiphalf
centre_gap=purlin_under-hip_at_axis
far_face_gap=centre_gap-tan*faceoffset/2
assert math.isclose(centre_gap,43.5522718,abs_tol=.001) and far_face_gap>10
postfoot=base+tan*(q-332.5)+jackhalf
posttop_q=q-346*math.sin(math.radians(25));posttop_z=postfoot+346*math.cos(math.radians(25))
# The short x500 jack continues to the hip axis above the hip; the q450
# node is 34.853 mm beyond the face seat and requires a tapered steel root.
seat_bounds=[470,435,510,465]
def jack_hip_gap(x,y):return hipdrop-hiphalf-jackhalf+tan*(y-x)/2
seat_min=jack_hip_gap(seat_bounds[2],seat_bounds[1]);seat_max=jack_hip_gap(seat_bounds[0],seat_bounds[3])
assert seat_min>10 and seat_max>seat_min
# A comparator force is traced only; it is not added to the roof q budgets.
edge=roof['actual_roof']['ordinary_edge_development'];sample=edge['cases']['cover-and-wet-gutter']
Fv=sample['first_vertical']; Fy=sample['first_horizontal'];hipface=500-faceoffset
hiptop_at_root=base-hipdrop+tan*((500+hipface)/2-332.5)+hiphalf
lever_v=(q-hipface)/1000;lever_h=(postfoot-hiptop_at_root)/1000
q450={'post_foot_q_mm':q,'post_foot_z_mm':postfoot,'post_normal_length_mm':346,'rail_head_q_mm':posttop_q,'rail_head_z_mm':posttop_z,'ring_centre_q_mm':332.5,'ring_inner_face_q_mm':392.5,'post_25mm_square_near_face_gap_to_ring_mm':q-12.5-392.5,'purlin_section_mm':[120,60,5],'purlin_under_z_mm':purlin_under,'hip_centreline_top_z_mm':hip_at_axis,'purlin_to_hip_centreline_gap_mm':centre_gap,'purlin_to_hip_far_face_gap_mm':far_face_gap,'trial_seat_thickness_mm':10,'remaining_worst_nominal_gap_mm':far_face_gap-10,'x500_jack_ends_at_hip_axis_y_mm':500,'x500_hip_face_y_mm':hipface,'x500_q450_overhang_from_hip_face_mm':q-hipface,'trial_hip_to_jack_seat_plan_mm':seat_bounds,'seat_gap_min_max_mm':[seat_min,seat_max], 'purlin_butt_to_jack_face_x_mm':540,'purlin_scope':'At x500/q450 the cold post bears on the top-flush jack/purlin node, not directly on the eave ring. EW purlin approaches adjacent jack face x540; its below-AVCL steel may pass over the hip within the checked vertical envelope. Moment seat, post base, 50 mm channels, warm AVCL collars, weather, tolerance and actual full 3D section remain unqualified.', 'north_module_comparator':{'first_vertical_kN':Fv,'first_horizontal_along_q_kN':Fy,'vertical_lever_to_hip_face_m':lever_v,'horizontal_lever_to_hip_top_m':lever_h,'Mx_from_vertical_kNm':-Fv*lever_v,'Mx_from_horizontal_kNm':-Fy*lever_h,'source':'Parent ordinary_edge_development cover-and-wet-gutter; single module comparator only, not an SW action or extra roof load.'}}
roof_candidate={'status':'one finite outer-SW triangular face and mirrored west counterpart, not complete corner/roof load path','hip':{'outer_seat_xy_mm':[332.5,332.5],'ridge_xy_mm':[2125,2125],'court_seat_xy_mm':[3917.5,3917.5],'primary_SHS_mm':[120,120,6.3],'centre_drop_below_parent_mm':hipdrop,'outer_centre_z_mm':hip_z,'outer_bottom_z_mm':hip_under,'outer_top_z_mm':hip_top,'hip_section_angle_degrees':math.degrees(hipang),'actual_end_extension_plan_mm':332.5,'roof_secondary_edge_extension_mm':200,'scope':'Axis and section are explicit candidate; separate inner valley, hip tie, crown, steel node and external edge remain to design.'},'jack':{'section_mm':[80,80,5],'hip_plan_face_offset_mm':faceoffset,'first_x500_clear_between_support_envelopes_mm':strips[0]['nominal_between_80_seat_envelopes_mm'],'first_x500_decision':'Reject two independent seats; hip-rooted cantilever, eave contact omitted, requires moment connection.','face_seat_gap_mm':seat_gap,'trial_hip_seat_plate_mm':10,'remaining_nominal_shim_clear_mm':seat_gap-10,'support_x_stations_mm':[x['jack_axis_x_mm'] for x in strips],'purlin_cantilever_max_mm':500,'generic_purlin_section_mm':[120,60,4],'q450_purlin_section_mm':[120,60,5],'purlin_rows_from_outer_wall_mm':[0,450,950,1450,1950,2125], 'outer_edge_extension_mm':200, 'purlin_ULS_UDL_kN_m':6.3*.5, 'purlin_ULS_cantilever_M_kNm':6.3*.5*.5**2/2, 'purlin_ULS_root_shear_kN':6.3*.5*.5, 'purlin_elastic_bending_stress_MPa':(6.3*.5*.5**2/2)*1e6/40100, 'purlin_SLS_elastic_tip_mm':((3+1.5)*.5)*500**4/(8*210000*2.41e6), 'purlin_screen_scope':'Trial full UDL, gross major axis and fixed-end geometry only; weld/cleat, torsion, actual loaded rows, second axis, restraints and deflection limits are not qualified.', 'scope':'Below AVCL/glass. Moment connection, member resistance, steel torsion, lateral restraints, penetrations and exact rail/purlin geometry unproved.'},'cap':{'pier_top_mm':column_top,'cap_plate_z_mm':[column_top,cap_top],'hip_bearing_gap_mm':hip_bearing_gap,'trial_hip_bearing_block_mm':20,'remaining_hip_packing_mm':hip_bearing_gap-20,'east_wing_plan_mm':[562.5,272.5,632.5,392.5],'north_wing_plan_mm':[272.5,562.5,392.5,632.5],'ring_saddle_height_mm':110,'ceiling_box_finish_mm':6375,'ceiling_clear_above_first_FFL_mm':6375-3450,'scope':'Wing overhang and 110 mm saddle are explicit steel bracket candidates, not anchored/capacity-qualified. Proposed 15 mm ceiling liner top6390 leaves20 below pier top; actual ceiling/fire/service layers require review.'},'ring':ring,'q450_interface':q450,'tributary_strips':strips,'partial_south_west_route':partial_routes,'outer_eave_corner_tip_triangle_m2':.02,'outer_triangle_modeled_strip_area_m2':sum(x['roof_area_m2'] for x in strips),'outer_triangle_full_area_m2':2.7028125,'scope':'One strip family and its mirror preserve vertical force and signed first moments in each assigned strip. The 0.02 m² tip, central eave rectangles, ridge/inner valley facets and cantilever-rail torque need their stated independent supports; they are not replaced by the old collapsed corner endpoint. No whole-corner endpoint, capacity or site acceptance is claimed.'}
result={'status':'finite SW corner constructive comparison; incomplete, no structural or building acceptance','sources':dict(zip(paths,sha)),'trial_pier':trial,'signed_actions':loads,'connector_sensitivity':connector,'cold_cage_candidate':cold_cage,'finite_roof_candidate':roof_candidate,'decision':'Inward 300 square and straight roof-to-pier-to-grid route are a source-bound candidate for joint STR/MAT/HAD challenge, not a selected design. The four-bar crossing is unqualified; direct full RC bypass remains a thermal/capillary adverse comparator. No actual ground/support capacity is asserted.'}
out=R/'project/str/studies/sw-corner-station.json';txt=json.dumps(result,indent=2,sort_keys=True)+'\n'
# Diagram is schematic, dimensions and elevations explicitly stated; never a
# substitute for detailed reinforcement, DPC, architectural or site drawings.
svg='''<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="210mm" viewBox="0 0 420 210"><rect width="420" height="210" fill="#fff"/><style>text{font-family:Arial,sans-serif;fill:#182b36;font-size:3px}.t{font-size:5px;font-weight:bold}.s{font-size:2.6px}.line{stroke:#526772;stroke-width:.45;fill:none}.rc{fill:#bbc9ce;stroke:#344f5c;stroke-width:.45}.core{fill:#d6c3a5;stroke:#705942;stroke-width:.35}.warning{fill:#903f2f}</style><text x="10" y="10" class="t">SW corner: conditional roof-to-grid station</text><text x="10" y="16" class="s">Source-bound structural trial · no selection, capacity or construction release</text><text x="10" y="25">A  PLAN · structural/core footprint</text><rect x="12" y="31" width="92" height="92" fill="#eff4f5" stroke="#526772"/><rect x="12" y="31" width="92" height="21.5" class="core"/><rect x="12" y="31" width="21.5" height="92" class="core"/><rect x="12" y="31" width="46" height="46" class="rc"/><circle cx="21.2" cy="40.2" r="1.55" fill="#903f2f"/><circle cx="48.8" cy="40.2" r="1.55" fill="#903f2f"/><circle cx="21.2" cy="67.8" r="1.55" fill="#903f2f"/><circle cx="48.8" cy="67.8" r="1.55" fill="#903f2f"/><circle cx="22.7" cy="41.7" r="1.4" fill="#172b36"/><text x="12" y="132">300 × 300 pier; 133 projects into room.</text><text x="12" y="138">Black: roof action axis. Red: trial tie centres.</text><text x="12" y="144">Core 140; pier centroid +80 x/y from roof axis.</text><text x="12" y="150">Furniture and body-path checks are proxy geometry.</text><text x="128" y="25">B  SECTION · conceptual force route</text><rect x="141" y="34" width="35" height="46" class="rc"/><text x="181" y="43">RC pier: −80 to +6410 trial</text><text x="181" y="49">Roof +68.111 / −24.325 kN control</text><rect x="141" y="80" width="35" height="16" class="rc"/><text x="181" y="89">Warm RC −80 to −380</text><rect x="141" y="96" width="35" height="25" fill="#efe2c6" stroke="#705942"/><text x="181" y="105">AAC + beds + mineral DPC</text><text x="181" y="111">385 gap to cold RC; no shear/tension credit</text><rect x="141" y="121" width="35" height="24" class="rc"/><text x="181" y="130">Cold RC −765 to −1215</text><line x1="152" y1="38" x2="152" y2="133" stroke="#903f2f" stroke-width="1"/><line x1="165" y1="38" x2="165" y2="133" stroke="#903f2f" stroke-width="1"/><text x="128" y="154">4 × Ø20 continuous ties; Ø60 bores; 225 cold embed trial.</text><text x="128" y="160" class="warning">Bores breach DPC/air-gas boundary; seal, anchor,</text><text x="128" y="166" class="warning">lateral transfer and thermal performance unproved.</text><text x="10" y="185">C  SIGNED ACTIONS AND LIMITS</text><text x="10" y="191">Roof-only eccentric moments: warm ±5.449 / ±1.946 kNm; cold ±2.214 / ±0.791 kNm (down / uplift magnitudes).</text><text x="10" y="197">1 kN lateral unit: ideal fixed-ended bars ~61.3 MPa bending, ~0.76 mm drift. No wind, support share or capacity inferred.</text><text x="10" y="203">Actual roof corner, pier/slab cages, cap-plate weld, wet boundary, diaphragm, site supports and occupied section remain to be resolved.</text></svg>'''
# A second schematic makes the finite roof path and its partial coverage
# inspectable. The mirrored west facet is calculated, not drawn twice.
def xy(x,y):return (16+x*.052,148-y*.052)
def line(a,b,style):
 x,y=xy(*a);X,Y=xy(*b);return f'<line x1="{x:.3f}" y1="{y:.3f}" x2="{X:.3f}" y2="{Y:.3f}" {style}/>'
parts=[]
parts.append(line((0,0),(2125,2125),'stroke="#a25842" stroke-width="1.5"'))
parts.append(line((332.5,332.5),(2125,2125),'stroke="#a25842" stroke-width="2"'))
parts.append(line((562.5,332.5),(2125,332.5),'stroke="#37546a" stroke-width="2"'))
for j in strips:
 x=j['jack_axis_x_mm']; end=j['jack_face_y_mm']
 parts.append(line((x,0),(x,x),'stroke="#326b65" stroke-width="1"'))
 parts.append(line((x,-200),(x,0),'stroke="#326b65" stroke-width=".6" stroke-dasharray="1 1"'))
 px,py=xy(x,end);parts.append(f'<circle cx="{px:.3f}" cy="{py:.3f}" r="1.1" fill="#a25842"/>')
for y in [0,450,950,1450,1950,2125]:
 if y>2000:continue
 parts.append(line((max(0,y),y),(min(2125,math.ceil(max(y,1)/500)*500),y),'stroke="#95aab2" stroke-width=".5" stroke-dasharray="1 1"'))
roof_svg='''<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="210mm" viewBox="0 0 420 210"><rect width="420" height="210" fill="white"/><style>text{font-family:Arial,sans-serif;fill:#182b36;font-size:3px}.title{font-size:5px;font-weight:bold}.small{font-size:2.6px}.warn{fill:#a04430}</style><text x="10" y="10" class="title">SW roof: finite outer-face construction trial</text><text x="10" y="16" class="small">One south triangular facet and its mirrored west facet · not a completed corner or construction detail</text><text x="12" y="24">A  PLAN · one 25° outer triangular face</text><path d="M 16 158.4 L 126.5 158.4 L 126.5 37.5 Z" fill="#edf4f4" stroke="#a7b8bb" stroke-width=".4"/>''' + ''.join(parts) + '''<text x="12" y="165">Green: SHS80 jacks, dashed 200 secondary edge; rust: SHS120 hip.</text><text x="12" y="171">Blue: 120-square eave ring; grey: purlin cantilever example.</text><text x="12" y="177">First x500 jack is hip-rooted, not two-seat.</text><text x="155" y="24">B  ACTUAL JOIN ENVELOPES · schematic, not to scale</text><rect x="160" y="37" width="34" height="18" fill="#becbd0" stroke="#37546a"/><text x="199" y="42">SHS80 jack underside</text><text x="199" y="48">10 seat + 38.120 nominal clearance</text><rect x="160" y="59" width="34" height="22" fill="#d7c5ae" stroke="#795a40"/><text x="199" y="65">SHS120 hip top at face</text><text x="199" y="71">centre 195 below parent primary line</text><rect x="160" y="92" width="34" height="16" fill="#becbd0" stroke="#37546a"/><text x="199" y="97">SHS120 eave ring +6540..+6660</text><text x="199" y="103">25 above trial window-ring extrados</text><rect x="160" y="119" width="34" height="14" fill="#becbd0" stroke="#37546a"/><text x="199" y="124">20 cap +6410..+6430; 70 × 120 wings</text><text x="199" y="130">110 saddle to ring; hip bearing gap 58.544</text><text x="155" y="148">Local finished ceiling box +6375 = 2925 above upper FFL.</text><text x="155" y="155" class="warn">Roof edge, counterrail ventilation, welds, anchored</text><text x="155" y="161" class="warn">steel, wall/subfloor and inner valley remain unqualified.</text><text x="10" y="190">C  FORCE ROUTE</text><text x="10" y="196">Five source-face strips: signed resultants, eave-ring seats, hip seats and their relocation couples are conserved.</text><text x="10" y="202">This excludes the outer tip, central roof and inner valley: do not add the partial node to the old collapsed-corner envelope.</text></svg>'''
roofsvgpath=R/'project/str/studies/sw-corner-roof.svg'
# Plan draws head projections; different elevations deliberately overlap in
# projection. The section is schematic and labels those levels explicitly.
def cage_xy(x,y):return (18+x*.15,132-y*.15)
cageparts=[]
for head in pileheads:
 x,y=cage_xy(head['x'],head['y']);fill='#95aebd' if head['z']==-1030 else '#d5bda1'
 cageparts.append(f'<circle cx="{x:.3f}" cy="{y:.3f}" r="9" fill="{fill}" fill-opacity=".57" stroke="#526772" stroke-width=".35"/>')
for head in holdheads:
 x,y=cage_xy(head['x'],head['y']);cageparts.append(f'<circle cx="{x:.3f}" cy="{y:.3f}" r="6" fill="#b3553d" fill-opacity=".65" stroke="#873b2a" stroke-width=".4"/>')
cage_svg='''<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="210mm" viewBox="0 0 420 210"><rect width="420" height="210" fill="white"/><style>text{font-family:Arial,sans-serif;fill:#182b36;font-size:3px}.title{font-size:5px;font-weight:bold}.small{font-size:2.6px}.warn{fill:#a04430}</style><text x="10" y="10" class="title">SW cold node: headed-bar geometric challenger</text><text x="10" y="16" class="small">600 × 600 trial · all head/anchor/node resistances unqualified</text><text x="18" y="25">A  PLAN · projected steel heads</text><rect x="18" y="42" width="90" height="90" fill="#f4f7f7" stroke="#526772" stroke-width=".5"/>''' + ''.join(cageparts) + '''<text x="18" y="141">Blue: H22 head −1030; tan: −1080.</text><text x="18" y="147">Red: Ø20 hold-down head −990.</text><text x="18" y="153">Projected circles overlap; elevations are staggered.</text><text x="135" y="25">B  SECTION · absolute elevations</text><rect x="145" y="33" width="50" height="99" fill="#d8e2e4" stroke="#526772" stroke-width=".5"/><line x1="149" y1="45.76" x2="191" y2="45.76" stroke="#34596c" stroke-width="1"/><line x1="149" y1="55.22" x2="191" y2="55.22" stroke="#34596c" stroke-width="1"/><line x1="149" y1="109.78" x2="191" y2="109.78" stroke="#34596c" stroke-width="1"/><line x1="149" y1="121" x2="191" y2="121" stroke="#34596c" stroke-width="1"/><line x1="157" y1="33" x2="157" y2="82.5" stroke="#a04430" stroke-width="1"/><rect x="153" y="81.5" width="8" height="2" fill="#a04430"/><line x1="175" y1="132" x2="175" y2="91.3" stroke="#526772" stroke-width="1"/><rect x="169" y="90.3" width="12" height="2"/><line x1="185" y1="132" x2="185" y2="101.2" stroke="#795a40" stroke-width="1"/><rect x="179" y="100.2" width="12" height="2" fill="#526772"/><text x="202" y="37">Cold top −765 / bottom −1215</text><text x="202" y="49">Top H20 EW −823 / NS −866</text><text x="202" y="61">Ø20 hold-down head −990</text><text x="202" y="73">Ø120 pile heads −1030 / −1080</text><text x="202" y="85">Bottom H20 EW −1165 / NS −1114</text><text x="202" y="103">Six horizontal Ø8 perimeter hoops:</text><text x="202" y="109">−809 / −903 / −950 / −1030 / −1100 / −1151</text><text x="135" y="145" class="warn">Minimum 22.9 nominal unrelated-steel clearance;</text><text x="135" y="151" class="warn">only 0.9 above comparator before placement tolerance.</text><text x="10" y="181">C  DESIGN BOUNDARY</text><text x="10" y="188">Old translated bent starters fail the 22 mm control; straight headed bars are a different, unselected detail.</text><text x="10" y="195">Head bearing, weld, anchorage/breakout, strut/tie, confinement, pile capacity and construction remain unproved.</text><text x="10" y="202">Section is a level schematic, not a dimensional reinforcement shop drawing.</text></svg>'''
cagesvgpath=R/'project/str/studies/sw-corner-cage.svg'

svgpath=R/'project/str/studies/sw-corner-station.svg'
if '--check' in sys.argv:
 assert out.read_text()==txt and svgpath.read_text()==svg and roofsvgpath.read_text()==roof_svg and cagesvgpath.read_text()==cage_svg;print('SW station source, geometry and signed action sensitivities verified')
else:out.write_text(txt);svgpath.write_text(svg);roofsvgpath.write_text(roof_svg);cagesvgpath.write_text(cage_svg);print(json.dumps(result,indent=2))
