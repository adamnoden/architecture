#!/usr/bin/env python3
"""Finite trial ridge crown and two door heads; not a structural design."""
import hashlib,json,math,sys
from pathlib import Path
R=Path(__file__).resolve().parents[3]
paths=['project/str/studies/sw-roof-region-route.json','project/str/studies/disjoint-house-actions.json','project/had/studies/open-north-loggia.json','project/str/studies/sw-corner-station.json','project/str/studies/open-loggia-support.json']
raw=[(R/p).read_bytes() for p in paths];route,disjoint,h,station,roof=map(json.loads,raw)
assert hashlib.sha256(raw[1]).hexdigest()=='8eb7f71f0c59362438e2a992c97ce03bce2eaeac9b6411233654501d7b887abe'
assert hashlib.sha256(raw[2]).hexdigest()=='542781c6bb1d277b20492e8433cea498e98eaea5db2e737a5ec7e9655f9d18fd'
assert hashlib.sha256(raw[3]).hexdigest()=='d3f65aa4866b0137f94a03fd3ff61089a782106c181fcfc1b16caec6c0f82d47'
heads={x['lower']:x for x in disjoint['head_actions']};p=math.atan(math.tan(math.radians(25))/math.sqrt(2));hip=station['finite_roof_candidate']['hip'];outer=hip['outer_centre_z_mm'];apex=outer+(2125-332.5)*math.tan(math.radians(25));hiptop=apex+60/math.cos(p);ridge=route['geometry']['ridge_centre_z_mm'];gap=ridge-60-hiptop
assert 70<gap<73
# The two opposed sloping SHS segments meet at the ridge plane. Rectangular
# pedestal volume between the peak vertical envelope and the ridge underside;
# exact saddle fit and its welds are not claimed by bounding boxes.
assert next(w for w in h['upperWalls'] if w['id']=='bed2-L-return')['a']==[2817.5,2650]
assert next(w for w in h['upperWalls'] if w['id']=='bed2-L-return')['b']==[2817.5,3247.5]
apex_F={case:sum(face['ridge_apex_reaction_kN'] for face in route['cases'][case]['faces']) for case in ['down','uplift']}
point_thrust={case:F/(2*math.tan(p)) for case,F in apex_F.items()}
joint={'ridge_apex_xy_mm':[2125,2125],'outer_hip_SHS_mm':[120,120,6.3],'inner_valley_SHS_mm':[120,120,6.3],'outer_hip_axis_end_xy_mm':[2125,2125],'outer_hip_axis_start_xy_mm':[332.5,332.5],'inner_valley_axis_start_xy_mm':[2125,2125],'inner_valley_axis_end_xy_mm':[3917.5,3917.5],'hip_valley_peak_centre_z_mm':apex,'outer_centre_z_mm':outer,'court_centre_z_mm':outer,'inclination_each_deg':math.degrees(p),'diagonal_top_at_peak_z_mm':hiptop,'ridge_SHS_mm':[120,120,6.3],'ridge_axis_z_mm':ridge,'pedestal_plan_mm':[2065,2065,2185,2185],'pedestal_vertical_bounding_gap_mm':gap,'ridge_point_apex_force_kN':apex_F,'two_force_pin_control_horizontal_each_kN':point_thrust,'two_force_control_scope':'Only the combined ridge-apex vertical point action, stipulated pinned two-force diagonal members and no other loads. Uplift reverses axial signs; real distributed roof actions, stiffness and all other lateral cases are excluded.', 'trial_straight_biaxial_tie_SHS_mm':[60,60],'trial_tie_axis_z_mm':6500,'trial_tie_plan_endpoints_mm':[[332.5,332.5],[3917.5,3917.5]],'trial_tie_crossing_upper_wall':'bed2-L-return at (2817.5,2817.5), inside core below trial +6550 wall top; a finite reinforced opening/replacement, air/fire seal and actual occupancy must be designed.','ridge_south_axis_segment_xy_mm':[[2185,2125],[4800,2125]],'ridge_west_axis_segment_xy_mm':[[2125,2185],[2125,4450]],'concept':'Separate opposed mitred hip and valley meet at their crown; a shaped welded saddle within the 120-square node supports two orthogonal ridge members. The listed gap is a bounding dimension, not a continuous level bearing surface. Exact plate facets, weld access, local load transfer, uplift and horizontal thrust tie remain to resolve.'}
# Trial head beam 140 x 250 in wall core, with 25 cover, 8 links and four
# 12 mm longitudinal bars. Hairpin geometry is a shape envelope only.
# Point and distributed rectangle loads retain their independent provenance.
def statics(a,b,rough,p0,Fpoint,Funiform):
 c=(rough[0]+rough[1])/2
 rb=(Fpoint*(p0-a)+Funiform*(c-a))/(b-a);ra=Fpoint+Funiform-rb
 w=Funiform/(rough[1]-rough[0]); candidates=[a,b,*rough,p0]
 if w:
  # Shear can cross zero on either side of the point load.
  for before in (True,False):
   x=rough[0]+(ra-(0 if before else Fpoint))/w
   if rough[0]<=x<=rough[1] and (x<=p0 if before else x>=p0):candidates.append(x)
 def moment(x):
  d=max(0,min(x-rough[0],rough[1]-rough[0]));return (ra*(x-a)-w*d*(x-rough[0]-d/2)-Fpoint*max(0,x-p0))/1000
 vals=[(x,moment(x)) for x in candidates if a<=x<=b]
 x,m=max(vals,key=lambda t:abs(t[1]));return {'support_forces_kN':[ra,rb],'largest_absolute_M_kNm':m,'governing_coordinate_mm':x}
items=[]
for name,lower,rough,bounds,axes,point,wallfaces in [
 ('south','cloak-east',[1700,2500],[1500,2650],[1600,2575],2125,[4730,4870]),
 ('west','study-L-north',[1350,2250],[1150,2450],[1250,2350],2125,[3177.5,3317.5])]:
 source=heads[lower];assert source['head_interval_mm']==rough
 roofdown=next(x for x in route['cases']['down']['faces'] if x['face']==name)['ridge_post_reaction_kN'];roofup=next(x for x in route['cases']['uplift']['faces'] if x['face']==name)['ridge_post_reaction_kN']
 # Hook returns: outer tangent 31 mm from each end; 48 mm inside bend.
 hooks={'bar_diameter_mm':12,'inside_bend_diameter_mm':48,'centerline_radius_mm':30,'left_outer_centre_mm':bounds[0]+31,'right_outer_centre_mm':bounds[1]-31,'outer_surface_end_cover_mm':25,'left_straight_tangent_mm':bounds[0]+61,'right_straight_tangent_mm':bounds[1]-61,'bottom_bar_centre_z_mm':2889,'bottom_hook_top_centre_z_mm':2949,'top_bar_centre_z_mm':3061,'top_hook_bottom_centre_z_mm':3001,'scope':'Two bottom and two top illustrative Ø12 longitudinal bars in distinct transverse lanes; 180-degree ends in vertical planes. Hook length, actual reinforcement, cage interaction, anchorage and fit at all ends are not established.'}
 assert hooks['left_outer_centre_mm']-6-bounds[0]>=25 and bounds[1]-hooks['right_outer_centre_mm']-6>=25
 assert bounds[0]<=rough[0]-200 and bounds[1]>=rough[1]+(150 if name=='south' else 200)
 items.append({'id':name,'wall':lower,'core_cross_axis_mm':wallfaces,'beam_along_axis_mm':bounds,'rough_opening_mm':rough,'bearing_lengths_mm':[rough[0]-bounds[0],bounds[1]-rough[1]],'trial_support_axes_mm':axes,'beam_z_mm':[2850,3100],'beam_section_mm':[140,250],'separation_below_first_floor_soffit_mm':70,'trial_continuous_head_top_plate_z_mm':[3100,3120],'trial_continuous_head_top_plate_width_mm':140,'trial_bearing_pack_z_mm':[3120,3170],'trial_pack_thickness_mm':50,'trial_head_gross_concrete_m3':(bounds[1]-bounds[0])*140*250/1e9,'trial_head_G_kN_at_25':25*(bounds[1]-bounds[0])*140*250/1e9,'trial_rc_minus_masonry_G_kN_at_25_20':5*(bounds[1]-bounds[0])*140*250/1e9,'trial_head_top_plate_G_kN_at_78p5':78.5*(bounds[1]-bounds[0])*140*20/1e9,'roof_point_axis_mm':point,'roof_increment_down_kN':roofdown,'roof_increment_uplift_kN':roofup,'source_upper_core_plus_floor_ULS_kN':source['sum_kN'],'downward_comparison':statics(*axes,rough,point,roofdown,source['sum_kN']),'roof_only_uplift_comparison':statics(*axes,rough,point,roofup,0),'trial_rebar':hooks,'limitations':'A continuous 20 mm top plate and 50 mm bearing pack occupy the 70 mm head-to-slab gap, with wide end caps coplanar and joined to it. Their bearing, tie continuity, uplift and interactions remain unproved. Ground head self-weight and added plate are listed separately and not included in the comparisons. Source wall/floor budget represented as a uniform opening load solely for this separate comparison; no claim of actual distribution, concrete properties, member capacity, bearing, development, full cage, fire, head/door fit or combined permanent/favourable loads.'})

# Cold rail extents are source-bound axes only. Their past warm/grid section
# is not assumed to be the current cold section, a pile or an adopted route.
assert hashlib.sha256(raw[4]).hexdigest()=='b5f08104c0da327613b84e055420d58f7709c354facd205634bcfd69a05e09b5'
routes=roof['lower_grid']['actual_routes']
rail={z[0]:z for z in routes}
assert rail['actual-cloak-east'][1:]==[[4800,1200],[4800,2650],600]
assert rail['actual-study-L-north'][1:]==[[332.5,3247.5],[2817.5,3247.5],600]
def cold_transfer(forces,axes,ends):
 result=[0.,0.]
 for f,x in zip(forces,axes):
  k=(x-ends[0])/(ends[1]-ends[0]);result[0]+=f*(1-k);result[1]+=f*k
 assert math.isclose(sum(result),sum(forces),abs_tol=1e-9)
 assert math.isclose(sum(result[i]*ends[i] for i in range(2)),sum(forces[i]*axes[i] for i in range(2)),abs_tol=1e-6)
 return result
for item in items:
 ends=[1200,2650] if item['id']=='south' else [332.5,2817.5]
 item['trial_cold_route']={'source_route':rail['actual-cloak-east' if item['id']=='south' else 'actual-study-L-north'],'cold_beam_trial_z_mm':[-1215,-765],'cold_width_mm':600,'source_node_axes_mm':ends,'downward_end_reactions_kN':cold_transfer(item['downward_comparison']['support_forces_kN'],item['trial_support_axes_mm'],ends),'roof_only_uplift_end_reactions_kN':cold_transfer(item['roof_only_uplift_comparison']['support_forces_kN'],item['trial_support_axes_mm'],ends),'scope':'Statically determinate line-route trial through four hypothetical jamb receivers; these are not established cold girders, actual piles, stiffness shares or ground reactions. Continuous cold reinforcement, local receiver and site must be developed.'}
 item['jamb_crossing_trial']={'number_of_jamb_receivers':2,'warm_pad_mm':[300,300],'warm_pad_z_mm':[-380,-80],'RC_jamb_section_mm':[300,150] if item['id']=='south' else [260,200],'ties_per_receiver':4,'tie_diameter_mm':20,'tie_centres_cross_wall_mm':[-75,75],'tie_centres_along_wall_mm':[-27,27],'nearest_longitudinal_head_bar_plan_clear_mm':28,'cross_wall_jamb_projection_beyond_each_finished_face_mm':53 if item['id']=='south' else 33,'nominal_link_diameter_mm':8,'nominal_link_cover_minimum_mm':25,'sleeve_outer_diameter_mm':32,'sleeve_to_sleeve_nominal_clear_mm':22,'door_projection_scope':'300-square pad projects beneath the door opening and ends at z−80, 80 mm below FFL. Actual ground slab, finish, services and door-floor interface are unknown. The jamb replaces wall core; its head cage, door movement and adjoining rooms remain to check.','cap_plate_plan_mm':[300,150] if item['id']=='south' else [260,200],'cap_plate_z_mm':[3100,3120],'cap_to_first_soffit_nominal_gap_mm':50,'scope':'Finite layout sensitivity only. A 20 mm thick cap plate spans the head and outboard tie lines; head anchorage, welding/fastening, access, forces, upper wall continuation and slab clearance remain to design. Sleeve, capillary/air/gas barrier, four tie anchorage, bars/links, wall-head joint, uplift transfer, constructibility and physical tolerances remain unproved; 22 mm nominal sleeve separation is not a placement allowance.'}

# Exact segment-to-rectangle clearance for the source's circular-body
# witness centrelines. It is not a door leaf or complete occupied-space test.
def segment_box(a,b,box):
 x0,y0,x1,y1=box;dx=b[0]-a[0];dy=b[1]-a[1];lo=0.;hi=1.
 for p,q in [(-dx,a[0]-x0),(dx,x1-a[0]),(-dy,a[1]-y0),(dy,y1-a[1])]:
  if p==0:
   if q<0:lo=2.;break
  elif p<0:lo=max(lo,q/p)
  else:hi=min(hi,q/p)
 if lo<=hi:return 0.
 def point_box(pt):return math.hypot(max(x0-pt[0],pt[0]-x1,0),max(y0-pt[1],pt[1]-y1,0))
 def point_segment(pt):
  den=dx*dx+dy*dy;t=max(0,min(1,((pt[0]-a[0])*dx+(pt[1]-a[1])*dy)/den)) if den else 0
  return math.hypot(pt[0]-a[0]-t*dx,pt[1]-a[1]-t*dy)
 return min(point_box(a),point_box(b),*(point_segment(pt) for pt in [(x0,y0),(x0,y1),(x1,y0),(x1,y1)]))
def witness_screen(box,level='GROUND'):
 rows=[]
 for w in h['actions']['witnesses']:
  if w['level']!=level:continue
  d=min(segment_box(a,b,box) for a,b in zip(w['points'],w['points'][1:]))-w['bodyRadius'];rows.append((d,w['id']))
 d,name=min(rows);return {'box_mm':box,'nearest_witness':name,'nominal_reserve_mm':d}
controls=[witness_screen(b) for b in [[1150,3097.5,1350,3397.5],[2250,3097.5,2450,3397.5]]]
study_screen=[witness_screen(b) for b in [[1150,3117.5,1350,3377.5],[2250,3117.5,2450,3377.5]]]
assert all(math.isclose(x['nominal_reserve_mm'],-2.5) for x in controls)
assert all(math.isclose(x['nominal_reserve_mm'],17.5) for x in study_screen)
# The court axis is a geometric wall junction, not an established bearing.
# A mirrored inner 300-square pier would obstruct a retained protected route;
# test an alternative narrow steel core and an illustrative 15 mm surround.
court_reject=witness_screen([3687.5,3687.5,3987.5,3987.5]);assert math.isclose(court_reject['nominal_reserve_mm'],-97.5)
court_core=witness_screen([3847.5,3847.5,3987.5,3987.5]);assert math.isclose(court_core['nominal_reserve_mm'],62.5)
court_case=witness_screen([3842.5,3842.5,3992.5,3992.5]);assert math.isclose(court_case['nominal_reserve_mm'],57.5)
court_upper=witness_screen([3842.5,3842.5,3992.5,3992.5],'FIRST')
court={
 'axis_mm':[3917.5,3917.5], 'rejected_inward_300mm_pier':court_reject,
 'core_140mm_body_screen':court_core,'illustrative_150mm_case_ground_screen':court_case,
 'illustrative_150mm_case_first_screen':court_upper,
 'candidate_SHS_mm':[120,120,6.3], 'SHS_plan_mm':[3857.5,3857.5,3977.5,3977.5],
 'wall_core_envelope_mm':[3847.5,3847.5,3987.5,3987.5],
 'illustrative_15mm_casing_plan_mm':[3842.5,3842.5,3992.5,3992.5],
 'casing_each_side_mm':15,'casing_core_intrusion_each_side_mm':5,
 'post_z_mm':[-80,6410],'first_floor_RC_z_mm':[3170,3370],
 'warm_pad_plan_mm':[3687.5,3687.5,3987.5,3987.5],'warm_pad_z_mm':[-380,-80],
 'candidate_cold_grid_axis_mm':[3950,3950],
 'vertical_action_kN':{case:sum(v['force_kN'] for v in route['cases'][case]['terminal_actions'] if v['xy_mm']==[3917.5,3917.5]) for case in ['down','uplift']},
 'scope':'Core-contained steel is a finite alternative, not a selected post. Illustrative casing thickness is not a fire specification. SHS runs through the FIRST RC slab envelope and requires a real reinforced opening, seal and load transfer. Below-floor pad needs actual slab, thermal, mineral DPC and protected-route junction. Shank/sealing/baseplate, head, restraints, hollow-section access and cold node are unproved. Adjacent roof, wall and wind actions excluded.'}
# Four central Ø20 rods fit nominally within a 107.4 mm hollow; this is
# geometric clearance, not bolt/weld accessibility or thermal sealing.
assert h['sections']['firstFloorRC']=={'top':3370,'bottom':3170}
assert math.isclose(120-2*6.3,107.4)
assert 27+10 < 107.4/2
court['base_crossing_trial']={'steel_post_clear_internal_width_mm':107.4,'tie_count':4,'tie_diameter_mm':20,'tie_offsets_xy_mm':[[-27,-27],[-27,27],[27,-27],[27,27]],'tie_outer_to_internal_face_nominal_mm':107.4/2-27-10,'sleeve_diameter_mm':32,'minimum_sleeve_clear_mm':22,'maximum_positive_side_sleeve_to_pad_edge_mm':3987.5-(3917.5+27)-16,'z_warm_RC_mm':[-380,-80],'z_cold_node_top_mm':-765,'unqualified_band_depth_mm':385,'cold_node_offset_xy_mm':[32.5,32.5],'post_nominal_first_floor_cut_area_m2':.12*.12,'first_floor_RC_removed_m3_if_cut_exactly':.12*.12*.2,'equal_tie_static_witness_kN':{case:F/4 for case,F in court['vertical_action_kN'].items()},'cold_axis_Mx_My_kNm':{case:[-(3917.5-3950)*F/1000,(3917.5-3950)*F/1000] for case,F in court['vertical_action_kN'].items()},'scope':'Four-rod equal split is a geometric equilibrium witness for an isolated centered vertical action only. An actual baseplate, bolt nuts or weld access, hole/slot, cage and anchorage are absent; straight steel pier is not continued through mineral/DPC band. Four sleeves pierce the barrier and have no qualified sealing. A 120-square slab cut excludes opening tolerance and trimming; slab/load continuity and actual FIRST floor geometry are not requalified.'}
out={'status':'finite roof junction and door-head development geometry; no node, opening, structure or site pass','source_sha256':dict(zip(paths,[hashlib.sha256(x).hexdigest() for x in raw])),'ridge_node':joint,'court_node':court,'heads':items,'study_300mm_jamb_rejected_controls':controls,'study_260mm_jamb_body_witness_screen':study_screen,'hold_down_and_path':'Four trial ties per jamb provide a bounded plan for an intended ridge/head/jamb/warm-pad/thermal-band/cold-rail path. Sleeve clearance is nominal and no actual connection, continuity, lateral resistance, bedding, seal or lower support is qualified.','limits':['Head replacements change local masonry and require source-bound door crown/frame, protected-route fire, wall/slab/cage and service compatibility; no raw door arch is assumed to be a 2250 rectangle.','The selected-source court core corner is not an earned bearing; core SHS and hypothetical 15 mm casing have only geometric body-path screens, and post-to-first-floor, fire and protected-route acceptance are unresolved.',
'The 300-wide cloak jamb projects 53 mm each side; the 260-wide study jamb projects 33 mm. Body-path proxy, door leaf and circulation require explicit screening.',
'The west ridge carries an overhang beyond its support; adjacent roof region forces are omitted.','Saddle, bearing, mitres, baseplates and finite bracing are not sized or checked. A 60-square horizontal tie at +6500 crosses the bed2-L-return core and demands an actual framed wall opening; the pin-control force is not a whole-roof thrust or tie capacity.','Candidate lintel bars are geometry sketches, not reinforcement design, anchorage or construction release.']}
text=json.dumps(out,indent=2,sort_keys=True)+'\n';path=R/'project/str/studies/sw-ridge-heads.json'
svg=f"""<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="210mm" viewBox="0 0 840 420"><rect width="840" height="420" fill="white"/><style>text{{font:12px sans-serif;fill:#173040}}.t{{font:bold 19px sans-serif}}.h{{font:bold 14px sans-serif}}.small{{font-size:11px}}.w{{fill:#983c30}}.rc{{fill:#ced9db;stroke:#3e5964;stroke-width:2}}.steel{{fill:#7f99a6;stroke:#243e4b;stroke-width:2}}</style><text x="20" y="25" class="t">SW ridge, opening heads and cold-route challenger</text><text x="20" y="44" class="small">Finite bounds and signed static comparisons; the joined construction is not qualified</text><text x="20" y="74" class="h">A  RIDGE CROWN · vertical section</text><path d="M30 195 L145 140 L260 195" fill="none" stroke="#3b5966" stroke-width="18"/><rect x="120" y="104" width="50" height="31" class="steel"/><rect x="105" y="82" width="80" height="22" class="steel"/><text x="20" y="228">SHS120 hip / valley, mitred crown</text><text x="20" y="245">Saddle bound {gap:.1f} mm; contact is shaped</text><text x="20" y="262">Ridge members turn 90° at upper saddle</text><text x="20" y="280" class="w">Mitre, tie/thrust and welds unproved</text><text x="300" y="74" class="h">B  CLOAK HEAD · elevation</text><rect x="315" y="115" width="215" height="45" class="rc"/><rect x="315" y="160" width="38" height="100" class="rc"/><rect x="500" y="160" width="30" height="100" class="rc"/><path d="M334 115 L334 260 M515 115 L515 260" stroke="#a04e3a" stroke-width="5"/><text x="300" y="285">140 × 250 head; 200 / 150 end bearing</text><text x="300" y="303">Rough opening 800; right jamb 150 long</text><text x="300" y="321">Prior core + floor and roof down: {items[0]['downward_comparison']['largest_absolute_M_kNm']:.2f} kNm</text><text x="300" y="339" class="w">Uplift needs anchored head and jambs</text><text x="575" y="74" class="h">C  WIDE JAMB · plan</text><rect x="610" y="105" width="150" height="75" class="rc"/><rect x="650" y="85" width="70" height="115" fill="none" stroke="#46616b" stroke-dasharray="5 4"/><circle cx="647.5" cy="129" r="6" fill="#a04e3a"/><circle cx="722.5" cy="129" r="6" fill="#a04e3a"/><circle cx="647.5" cy="156" r="6" fill="#a04e3a"/><circle cx="722.5" cy="156" r="6" fill="#a04e3a"/><text x="575" y="225">300 × 150 pier replaces 140 core</text><text x="575" y="243">Projects 53 each side of finish</text><text x="575" y="261">Ø32 sleeves: 22 nominal gap</text><text x="575" y="279">Door movement and floor untested</text><text x="20" y="380" class="small">SOURCE ROUTE: ridge → head → widened jamb → warm pad → penetrated thermal band → candidate cold rail → source node axes.</text><text x="20" y="400" class="small w">No connection, frame/arch fit, seal, fire, pile, ground or resistance pass; adjacent roof forces and lateral actions excluded.</text></svg>"""
svgpath=R/'project/str/studies/sw-ridge-heads.svg'
if '--check' in sys.argv:assert path.read_text()==text and svgpath.read_text()==svg;print('ridge/head source and geometry comparison verified')
else:path.write_text(text);svgpath.write_text(svg);print('wrote',path,svgpath)
