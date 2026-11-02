#!/usr/bin/env python3
"""Source-bound SW roof surface partition and signed statics witness; no design acceptance."""
from pathlib import Path
import hashlib,json,math,sys
R=Path(__file__).resolve().parents[3]
paths=['project/str/studies/sw-corner-station.json','project/str/studies/sw-grid-arm-join.json','project/had/studies/open-north-loggia.json','project/str/studies/open-loggia-support.json','compiler/reference-house/georgian/roof-surfaces.ts']
expected=['d3f65aa4866b0137f94a03fd3ff61089a782106c181fcfc1b16caec6c0f82d47','ba4176d5cb1c39bef27d7011a34d03dd4f72a708b26050cb1a4ac9036e4df2ec','542781c6bb1d277b20492e8433cea498e98eaea5db2e737a5ec7e9655f9d18fd','b5f08104c0da327613b84e055420d58f7709c354facd205634bcfd69a05e09b5','cd2e3becfe2a206679e563ceade9128f739b525fef4b2023e3c0cf0d7d2583af']
raw=[(R/p).read_bytes() for p in paths]; assert [hashlib.sha256(b).hexdigest() for b in raw]==expected
station,arm,h,roof=map(json.loads,raw[:4]); cand=station['finite_roof_candidate']; old=cand['partial_south_west_route']; tip=arm['roof_tip_challenger']['actions']
assert math.isclose(next(x for x in roof['actual_roof']['regions'] if x['id']=='corner-SW')['plan_area'],21.6225)
u={w['id']:w for w in h['upperWalls']};g={w['id']:w for w in h['groundWalls']}
assert u['bed2-east']['a']==[4800,0] and u['bed2-east']['b']==[4800,2650] and u['bed2-east']['structuralCore']==[4730,4870]
assert u['bed2-L-north']['a']==[0,3247.5] and u['bed2-L-north']['b']==[2817.5,3247.5] and u['bed2-L-north']['structuralCore']==[3177.5,3317.5]
west_window=next(w for w in h['archOpeningRegister']['FIRST'] if w['id']=='west-window-1');assert (west_window['centre'],west_window['width'],west_window['head'],west_window['radialRingTrial'])==(4600,1000,2850,215)
assert g['cloak-east']['holes']==[[1700,2500]] and g['study-L-north']['holes']==[[1350,2250]]
# All forces vertical, down positive. Explicit point actions preserve two first moments.
A=(332.5,332.5);B=(3917.5,3917.5); apex=(2125.,2125.);L=2325.; area=L*L/1e6; triangle=area/2
assert math.isclose(2*area+2*triangle,16.216875)
rect_c=3287.5; tri_c=3675.; normal_c=962.5; lo=295.; hi=2125.
ridge_fraction=(normal_c-lo)/(hi-lo)
def split(F,t,a,b):
 k=(t-a)/(b-a);return F*(1-k),F*k
def ledger(q,case):
 # Outer triangles and two tip triangles were already explicitly resolved.
 o=old[case];t=tip[case]; pts=[]
 def add(name,F,x,y,mx=0.,my=0.):pts.append({'destination':name,'force_kN':F,'xy_mm':[x,y],'first_moment_x_offset_kNm':mx,'first_moment_y_offset_kNm':my})
 add('SW station, prior strips',o['SW_node_vertical_kN'],*o['SW_node_resultant_xy_mm'])
 add('court diagonal seat, prior strips',o['hip_court_kN'],*B)
 add('south eave x4800, prior strips',o['south_ring_x4800_kN'],4800,332.5)
 add('west eave y3247.5, prior strips',o['west_ring_y3247p5_kN'],332.5,3247.5)
 add('SW station, prior tips',t['tip_hip_SW_increment_kN'],*A);add('court diagonal seat, prior tips',t['tip_hip_court_increment_kN'],*B)
 detail=[]
 for orientation,end in [('south',4800.),('west',3247.5)]:
  # Uniform outer rectangle: eave and ridge simple supports, with the
  # actual 495 mm projection from the q295 jack support to the weather edge.
  # q295 reaction transfers into q332.5 ring as force plus signed couple.
  F=q*area;Fr=F*ridge_fraction;Fe=F-Fr
  e0,e1=split(Fe,rect_c,597.5,end)
  ra,rb=split(Fr,rect_c,2125,end)
  # Inner triangular field: equal joist reactions at ridge and valley.
  Ft=q*triangle;fv=Ft/2;fr=Ft/2
  ta,tb=split(fr,tri_c,2125,end)
  va,vb=split(fv,tri_c,332.5,3917.5)
  # Both ridge and valley apex loads are on the shared diagonal girder;
  # its stipulated two supports are A and B, with no intermediate bearing.
  aa,ab=split(ra+ta,2125,332.5,3917.5)
  if orientation=='south':
   add('south eave SW saddle',e0,597.5,332.5,my=e0*(295-332.5)/1000);add('south eave x4800',e1,4800,332.5,my=e1*(295-332.5)/1000);add('south ridge post x4800',rb+tb,4800,2125)
  else:
   add('west eave SW saddle',e0,332.5,597.5,mx=e0*(295-332.5)/1000);add('west eave y3247.5',e1,332.5,3247.5,mx=e1*(295-332.5)/1000);add('west ridge post y3247.5',rb+tb,2125,3247.5)
  add(orientation+' diagonal SW',aa+va,*A);add(orientation+' diagonal court',ab+vb,*B)
  detail.append({'face':orientation,'outer_rectangle_force_kN':F,'outer_ridge_reaction_kN':Fr,'outer_eave_reaction_kN':Fe,'inner_triangle_force_kN':Ft,'inner_valley_reaction_kN':fv,'ridge_post_reaction_kN':rb+tb,'ridge_apex_reaction_kN':ra+ta,'eave_end_reactions_kN':[e0,e1],'valley_seat_reactions_kN':[va,vb]})
 total=sum(p['force_kN'] for p in pts);mx=sum(p['force_kN']*p['xy_mm'][0]/1000+p['first_moment_x_offset_kNm'] for p in pts);my=sum(p['force_kN']*p['xy_mm'][1]/1000+p['first_moment_y_offset_kNm'] for p in pts)
 assert math.isclose(total,q*21.6225,abs_tol=1e-9),(total,q*21.6225)
 assert math.isclose(mx,total*2.125,abs_tol=1e-9) and math.isclose(my,total*2.125,abs_tol=1e-9),(mx,my,total)
 return {'faces':detail,'terminal_actions':pts,'total_kN':total,'first_moment_x_kNm':mx,'first_moment_y_kNm':my}
assert math.isclose(roof['actual_roof']['cases']['ULS-down']['q_horizontal'],6.3)
assert math.isclose(roof['actual_roof']['cases']['uplift-stress']['q_horizontal'],-2.25)
cases={'down':ledger(6.3,'down'),'uplift':ledger(-2.25,'uplift')}
# Vertical ridge post locations are *over actual ground openings*. The jamb
# points below are proposed statics axes, not proof of a head/column.
def jamb(F,x,left,right):return dict(zip(['left','right'],split(F,x,left,right)))
for case,v in cases.items():
 v['proposed_ground_head_jamb_statics']={'cloak_east_y1600_2575':jamb(v['faces'][0]['ridge_post_reaction_kN'],2125,1600,2575),'study_L_north_x1250_2350':jamb(v['faces'][1]['ridge_post_reaction_kN'],2125,1250,2350)}
ridge_z=roof['actual_roof']['primary_centre']+(2125-332.5)*math.tan(math.radians(25));post_top=ridge_z-60
out={'status':'full region static route challenger; no seat, capacity, foundation or HOUSE acceptance','sources':dict(zip(paths,expected)),'partition_m2':{'outer_two_original_triangles':5.405625,'outer_two_rectangles':2*area,'inner_two_valley_triangles':2*triangle,'total':21.6225},'geometry':{'square_mm':[-200,-200,4450,4450],'ridge_apex_mm':[2125,2125],'SW_diagonal_seats_mm':[list(A),list(B)],'outer_eave_axes_mm':332.5,'trial_jack_support_q_mm':295,'trial_jack_longitudinal_region_mm':[2125,4450],'trial_jack_seat_80mm_q_band_proxy_mm':[255,335],'nominal_glass_intrusion_mm':7.5,'SW_local_sheet_longitudinal_extent_mm':[262.5,562.5],'nominal_longitudinal_gap_to_SW_sheet_mm':1562.5,'trial_support_to_ring_axis_offset_mm':-37.5,'jack_support_first_moments':'Force plus explicit signed offset couple retained at the two ring end reactions.','south_ridge_intersection_mm':[4800,2125],'west_ridge_intersection_mm':[2125,3247.5],'trial_SHS_ridge_post_mm':[120,120],'upper_wall_core_mm':140,'nominal_post_core_edge_each_mm':10,'ridge_centre_z_mm':ridge_z,'trial_post_top_z_mm':post_top,'illustrative_upper_wall_top_z_mm':6550,'trial_clear_post_length_mm':post_top-6550,'west_ring_source_ends_y_mm':3247.5,'west_rectangle_boundary_y_mm':4450,'west_ring_required_extension_to_boundary_mm':1202.5,'west_ring_extension_window_raw_overlap_mm':[4100,4450],'west_ring_trial_extrados_z_mm':3450+2850+215,'west_ring_to_upper_arch_crown_extrados_conservative_nominal_mm':6540-(3450+2850+215),'original_eave_axis_to_weather_edge_mm':532.5,'trial_jack_seat_to_weather_edge_mm':495,'trial_cantilever_reserve_to_500mm_mm':5,'trial_tapered_shoe_q_band_mm':[280,310],'trial_shoe_ring_outer_edge_nominal_margin_mm':7.5,'trial_shoe_z_on_ring_top_mm':6660,'jack_under_at_support_mm':6685.099435131205,'shoe_taper_thickness_end_mm':[10,23.989229744649958],'remaining_nominal_vertical_fit_mm':8.10482025887935,'trial_pack_shim_range_mm':[5,12],'nominal_pack_shim_thickness_mm':8.10482025887935,'shim_adjustment_margin_low_high_mm':[3.10482025887935,3.89517974112065],'scope':'Ridge post and extended eave ring are unqualified geometric candidates. z6550 is a local 3100 wall-height comparator; actual seat, head and continuity through floors must be authored. A 120 post is not a sized member.'},'cases':cases,'failure_and_holds':['Ridge intersections lie above ground door openings: direct uninterrupted pier route fails. Jamb axes are proposed outside rough openings; wall/arch, reinforcement and load transfer must be designed.','Ridge-post, cap, valley/apex node, diagonal continuity and west-ring extension have no finite 3D joint or steel clearance proof. The hip rises to the ridge and the valley falls to court; an A–B straight member is geometrically wrong. The kinked two-member node and its signed horizontal thrust/tie remain undesigned.',
'Original ring-axis reach is 532.5 mm; the q295 jack seat reduces this to 495 mm with only 5 mm comparator reserve. The small tapered shoe, 7.5 mm ring-edge margin, roughly 8.1 mm vertical gap must be closed by the shown variable steel shim stack rather than being treated as bearing; actual survey, shimming and signed eave torsion, roof edge and thermal interfaces require actual design and tolerances. A nominal 80 mm seat band spans q255..335, intruding 7.5 mm into glass; this is a proxy, not the full 3D sloped jack footprint. The trial belongs to longitudinal 2125..4450 and does not directly meet the separately scoped SW sheet 262.5..562.5.','The west ring extension overlaps y4100..4450 of the FIRST west-window-1 rough opening in plan. The 25 mm crown-extrados clearance is a conservative elevation comparator only; actual radial ring, frame, fire, weather and member tolerances require a section.',
'Wall head/first slab transfer, jamb footings, wind/diaphragm and signed tie/hold-down paths remain unproved.','Static force and first-moment balance does not establish stiffness, load distribution, capacities or constructibility. Adjacent roof areas and their endpoint actions are excluded.','No physical roof, water, thermal, fire, service, ground or site qualification is implied.']}
text=json.dumps(out,indent=2,sort_keys=True)+'\n';target=R/'project/str/studies/sw-roof-region-route.json'
svg=f"""<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="210mm" viewBox="0 0 840 420"><rect width="840" height="420" fill="white"/><style>text{{font:13px sans-serif;fill:#173040}}.t{{font-size:19px;font-weight:bold}}.s{{font-size:11px}}.w{{fill:#9b3a2b}}.l{{stroke:#344e5b;stroke-width:2;fill:none}}</style><text x="20" y="25" class="t">SW roof region: signed-route challenger</text><text x="20" y="43" class="s">One 4.65 m square · projected areas · sources and unproved connections in companion JSON</text><g transform="translate(40 360) scale(.065 -.065)"><rect x="-200" y="-200" width="4650" height="4650" fill="#eff5f4" stroke="#425e69" stroke-width="25"/><path d="M-200 -200 L2125 -200 L2125 2125 Z M-200 -200 L-200 2125 L2125 2125 Z" fill="#bcd5d0"/><path d="M2125 -200 H4450 V2125 H2125 Z M-200 2125 H2125 V4450 H-200 Z" fill="#e5d7ae"/><path d="M2125 2125 H4450 V4450 Z M2125 2125 V4450 H4450 Z" fill="#c4d2e8"/><path d="M-200 -200 L4450 4450 M2125 2125 H4800 M2125 2125 V4450 M332.5 332.5 H4800 M332.5 332.5 V4450" stroke="#284b5a" stroke-width="32" fill="none"/><circle cx="332.5" cy="332.5" r="75" fill="#993d31"/><circle cx="3917.5" cy="3917.5" r="75" fill="#993d31"/><circle cx="4800" cy="2125" r="75" fill="#993d31"/><circle cx="2125" cy="3247.5" r="75" fill="#993d31"/></g><text x="410" y="80">Green: previously represented outer triangles</text><text x="410" y="102">Ochre: 2 outer rectangles, {2*area:.6f} m²</text><text x="410" y="124">Blue: 2 inner valley triangles, {2*triangle:.6f} m²</text><text x="410" y="158">Red: proposed or inherited support points</text><text x="410" y="180">Apex is a junction; no bearing assumed there.</text><text x="410" y="212">Full region: +{cases['down']['total_kN']:.3f} / {cases['uplift']['total_kN']:.3f} kN</text><text x="410" y="234">1st moments: +{cases['down']['first_moment_x_kNm']:.3f} / {cases['uplift']['first_moment_x_kNm']:.3f} kNm</text><text x="410" y="267" class="w">Both ridge-post points lie above ground openings.</text><text x="410" y="289" class="w">West eave needs a 1202.5 mm extension.</text><text x="410" y="321" class="s">No 3D steel joints, wall heads, foundation or capacity pass.</text><text x="410" y="341" class="s">Neighbouring roof regions and wind remain separate.</text><text x="20" y="402" class="s">NOT TO SCALE FOR MEMBER FIT · static equilibrium is not stiffness or construction evidence</text></svg>"""
svgpath=R/'project/str/studies/sw-roof-region-route.svg'
if '--check' in sys.argv:
 assert target.read_text()==text and svgpath.read_text()==svg;print('SW roof region area and signed first-moment witness verified')
else:target.write_text(text);svgpath.write_text(svg);print('wrote',target,svgpath)
