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
column_top=6640;column_bottom=-80
roof_comparator_underside=roof['actual_roof']['primary_centre']-60
nominal_seat_gap=roof_comparator_underside-column_top
assert math.isclose(nominal_seat_gap,46.721089070517,abs_tol=1e-9);gross_volume=.3*.3*(column_top-column_bottom)/1000
core_overlap_area=(2*300*140-140*140)/1e6
trial={'pier_bounds_mm':pier,'pier_bottom_top_mm':[column_bottom,column_top],'pier_centroid_mm':centre,'room_projection_mm':pier[2]-interior_face,'roof_point_offset_from_pier_mm':[roofxy[i]-centre[i] for i in range(2)],'cold_axis_offset_from_pier_mm':[centre[i]-coldaxis[i] for i in range(2)],'corner_SHS120_comparator_underside_if_same_centre_mm':roof_comparator_underside,'nominal_pier_to_comparator_gap_mm':nominal_seat_gap,'trial_plate_mm':20,'remaining_bed_and_packing_mm':nominal_seat_gap-20,'pier_gross_volume_m3':gross_volume,'pier_gross_G_kN_at_25':gross_volume*25,'core_plan_overlap_m2':core_overlap_area,'upper_slab_plan_overlap_m2':((pier[2]-332.5)/1000)**2,'nearest_furniture_proxy':{'name':near[0][2],'level':near[0][1],'rectangular_gap_mm':near[0][0]},'minimum_retained_route':minroute,'all_route_reserves':routes}
assert math.isclose(60-rod_d/2-8,42)
connector={'warm_RC_z_mm':[-380,-80],'cold_RC_z_mm':[-1215,-765],'gap_mm':L,'bar_centres_mm':patch,'bar_diameter_mm':rod_d,'bore_diameter_mm':bore_d,'annulus_radial_mm':(bore_d-rod_d)/2,'nominal_bar_bottom_top_mm':[-990,column_top],'nominal_cold_RC_embed_mm':225,'bar_length_mm':column_top+990,'trial_links_diameter_mm':8,'nominal_cover_outside_link_mm':42,'gross_bar_area_mm2':4*A,'gross_bar_mass_G_kN_at_78p5':4*A/1e6*((column_top+990)/1000)*78.5,'unit_station_H_kN':1,'ideal_four_bar_moment_each_kNm':bend/1e6,'ideal_gross_bending_stress_MPa':bend/Z,'ideal_elastic_translation_mm':delta,'bilinear_tension_only_witness_kN':T,'equal_elastic_unilateral_ignored_kN':elastic,'two_tie_tension_only_control_kN':[old_two_near,old_two_far],'largest_witness_gross_tensile_stress_MPa':axial_each/A,'nominal_bore_area_fraction':4*math.pi*(bore_d/2)**2/(300*300),'scope':'Continuous rods connect cold receiver to the underside of a trial cap plate; actual cold anchorage, plate connection, construction sequence and bar material remain unqualified. Fixed-fixed, equal split and nominal smooth gross sections are stress sensitivities only. Real fixity, embedment, shear, tension, fatigue, slip, ductility, reinforcement, DPC, gas, moisture, fire and thermal qualification are absent. The bars and bores are not selected.'}
result={'status':'finite SW corner constructive comparison; incomplete, no structural or building acceptance','sources':dict(zip(paths,sha)),'trial_pier':trial,'signed_actions':loads,'connector_sensitivity':connector,'decision':'Inward 300 square and straight roof-to-pier-to-grid route are a source-bound candidate for joint STR/MAT/HAD challenge, not a selected design. The four-bar crossing is unqualified; direct full RC bypass remains a thermal/capillary adverse comparator. No actual ground/support capacity is asserted.'}
out=R/'project/str/studies/sw-corner-station.json';txt=json.dumps(result,indent=2,sort_keys=True)+'\n'
# Diagram is schematic, dimensions and elevations explicitly stated; never a
# substitute for detailed reinforcement, DPC, architectural or site drawings.
svg='''<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="210mm" viewBox="0 0 420 210"><rect width="420" height="210" fill="#fff"/><style>text{font-family:Arial,sans-serif;fill:#182b36;font-size:3px}.t{font-size:5px;font-weight:bold}.s{font-size:2.6px}.line{stroke:#526772;stroke-width:.45;fill:none}.rc{fill:#bbc9ce;stroke:#344f5c;stroke-width:.45}.core{fill:#d6c3a5;stroke:#705942;stroke-width:.35}.warning{fill:#903f2f}</style><text x="10" y="10" class="t">SW corner: conditional roof-to-grid station</text><text x="10" y="16" class="s">Source-bound structural trial · no selection, capacity or construction release</text><text x="10" y="25">A  PLAN · structural/core footprint</text><rect x="12" y="31" width="92" height="92" fill="#eff4f5" stroke="#526772"/><rect x="12" y="31" width="92" height="21.5" class="core"/><rect x="12" y="31" width="21.5" height="92" class="core"/><rect x="12" y="31" width="46" height="46" class="rc"/><circle cx="21.2" cy="40.2" r="1.55" fill="#903f2f"/><circle cx="48.8" cy="40.2" r="1.55" fill="#903f2f"/><circle cx="21.2" cy="67.8" r="1.55" fill="#903f2f"/><circle cx="48.8" cy="67.8" r="1.55" fill="#903f2f"/><circle cx="22.7" cy="41.7" r="1.4" fill="#172b36"/><text x="12" y="132">300 × 300 pier; 133 projects into room.</text><text x="12" y="138">Black: roof action axis. Red: trial tie centres.</text><text x="12" y="144">Core 140; pier centroid +80 x/y from roof axis.</text><text x="12" y="150">Furniture and body-path checks are proxy geometry.</text><text x="128" y="25">B  SECTION · conceptual force route</text><rect x="141" y="34" width="35" height="46" class="rc"/><text x="181" y="43">RC pier: −80 to +6640 trial</text><text x="181" y="49">Roof +68.111 / −24.325 kN only</text><rect x="141" y="80" width="35" height="16" class="rc"/><text x="181" y="89">Warm RC −80 to −380</text><rect x="141" y="96" width="35" height="25" fill="#efe2c6" stroke="#705942"/><text x="181" y="105">AAC + beds + mineral DPC</text><text x="181" y="111">385 gap to cold RC; no shear/tension credit</text><rect x="141" y="121" width="35" height="24" class="rc"/><text x="181" y="130">Cold RC −765 to −1215</text><line x1="152" y1="38" x2="152" y2="133" stroke="#903f2f" stroke-width="1"/><line x1="165" y1="38" x2="165" y2="133" stroke="#903f2f" stroke-width="1"/><text x="128" y="154">4 × Ø20 continuous ties; Ø60 bores; 225 cold embed trial.</text><text x="128" y="160" class="warning">Bores breach DPC/air-gas boundary; seal, anchor,</text><text x="128" y="166" class="warning">lateral transfer and thermal performance unproved.</text><text x="10" y="185">C  SIGNED ACTIONS AND LIMITS</text><text x="10" y="191">Roof-only eccentric moments: warm ±5.449 / ±1.946 kNm; cold ±2.214 / ±0.791 kNm (down / uplift magnitudes).</text><text x="10" y="197">1 kN lateral unit: ideal fixed-ended bars ~61.3 MPa bending, ~0.76 mm drift. No wind, support share or capacity inferred.</text><text x="10" y="203">Actual roof corner, pier/slab cages, cap-plate weld, wet boundary, diaphragm, site supports and occupied section remain to be resolved.</text></svg>'''
svgpath=R/'project/str/studies/sw-corner-station.svg'
if '--check' in sys.argv:
 assert out.read_text()==txt and svgpath.read_text()==svg;print('SW station source, geometry and signed action sensitivities verified')
else:out.write_text(txt);svgpath.write_text(svg);print(json.dumps(result,indent=2))
