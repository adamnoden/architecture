#!/usr/bin/env python3
"""SW outer cold arms, two next nodes and partial roof-action study.

A bounded conditional comparison; not structural, envelope or site approval.
"""
import hashlib,json,math,runpy,sys
from pathlib import Path
R=Path(__file__).resolve().parents[3];O=Path(__file__).resolve().parent
sources=['project/str/studies/sw-corner-station.json','project/str/studies/sw-corner-cold-node.py','project/str/studies/open-loggia-support.json','project/had/studies/open-north-loggia.json','project/mat/studies/warm-receiving-grid.json','project/mat/studies/sw-corner-envelope.json','project/str/studies/disjoint-house-actions.json']
expected=['d3f65aa4866b0137f94a03fd3ff61089a782106c181fcfc1b16caec6c0f82d47','aff65c2b86cef733a8fd10eaa592edb0af33d6e16fd8f13e4a1b075e8af42b08','b5f08104c0da327613b84e055420d58f7709c354facd205634bcfd69a05e09b5','542781c6bb1d277b20492e8433cea498e98eaea5db2e737a5ec7e9655f9d18fd','a2b15c9505ee3888ffb892aa7e5182f80f4aa5a70bd5058a915df6e3bec4de99','77c38720b158d068e740bfb35f8ea52b8959abbbe50cf7bacd06f5af35442af4','8eb7f71f0c59362438e2a992c97ce03bce2eaeac9b6411233654501d7b887abe']
raw=[(R/p).read_bytes() for p in sources];sha=[hashlib.sha256(x).hexdigest() for x in raw]
assert sha==expected,('Source changed: reconsider topology before rebind',sha)
station,_,roof,had,mat,mat_corner,disjoint=(json.loads(raw[i]) if i!=1 else None for i in range(7))
cage=station['cold_cage_candidate'];patch=[tuple(x) for x in station['connector_sensitivity']['bar_centres_mm']]
m=runpy.run_path(str(R/sources[1]),init_globals={'roof':roof,'patch':patch});assert m['cold_cage']['node_xy_mm']==[-50,-50,777,777]
assert cage['node_z_mm']==[-1257,-765] and mat['recipe']['coldBeamSoffitHypothesis']==-1215
layers=mat_corner['occurrence']['ordinaryPerpendicularLayers_mm'];assert layers==[['weather brick',0,102.5],['drained cavity',102.5,152.5],['bare glass',152.5,262.5],['140 core',262.5,402.5],['27 finish',402.5,429.5]]
assert mat_corner['plan']['warmPadXY']==[262.5,262.5,562.5,562.5] and mat_corner['plan']['coldReceiverXY']==[-50,-50,777,777]
# The selected HAD slab datum differs from the older MAT floor comparator.
# Project the FIRST-floor SW-L rectangle onto the ground as an explicit
# hypothetical footprint only; no actual ground slab plan is inferred.
assert had['sections']['groundFloorRC']=={'top':-180,'bottom':-380}
assert station['connector_sensitivity']['warm_RC_z_mm']==[-380,-80]
sw_field=next(f for f in roof['floor_fields'] if f['id']=='SW-L');assert sw_field['rectangle']==[332.5,332.5,2817.5,3247.5]
pad=[262.5,262.5,562.5,562.5];field=sw_field['rectangle']
ix=max(0,min(pad[2],field[2])-max(pad[0],field[0]));iy=max(0,min(pad[3],field[3])-max(pad[1],field[1]));intersection=ix*iy/1e6
pad_area=.3*.3;pad_gross=pad_area*.3;overlap_volume=intersection*.2;increment=pad_gross-overlap_volume
assert math.isclose(intersection,.0529) and math.isclose(increment,.01642)
pad_slab={'HAD_slab_z_mm':[-380,-180],'prior_MAT_slab_comparator_z_mm':[-280,-80],'trial_pad_z_mm':[-380,-80],'pad_plan_mm':pad,'projected_first_floor_overlap_m2':intersection,'pad_outside_projected_field_m2':pad_area-intersection,'pad_upstand_above_slab_top_mm':100,'pad_top_below_FFL_mm':80,'pad_gross_m3':pad_gross,'conditional_projected_overlap_m3':overlap_volume,'conditional_pad_increment_m3':increment,'conditional_pad_increment_G_kN_at_25':25*increment,'scope':'Conditional geometric union IF the ground slab locally occupies the projected FIRST-floor SW-L rectangle and is homogeneous monolithic RC. The actual ground slab plan has not been established here. Excludes overlapping warm arms or other concrete; no ground takeoff, upstand, floor build-up, reinforcement, field/patch, construction or capacity is proved.'}

assert roof['lower_grid']['width']==600
nodes={(tuple(n['xy'])):n for n in roof['lower_grid']['actual_cap_nodes']}
assert all(x in nodes for x in ((300,300),(3150,300),(300,3150)))
assert all(nodes[x]['cap_size']==[600,600] for x in ((3150,300),(300,3150)))
for wall in ('outer-south','outer-west'):
 for level in ('GROUND','FIRST'):
  a=[o for o in had['openings'][level] if o['wall']==wall and o['centre']==1800]
  assert len(a)==1 and a[0]['width']==1000 and a[0]['kind']=='window'
# Source-tested 330 mm inside diameter for the prior corner comparison.
assert roof['cap']['terminal_corner_mandrel']==330
radius=181.; numerics=.1
# C1-continuous S-curve with straight middle and equal opposite round bends.
def curve(start,length,change,step=.5):
 if change==0:return [(start,0),(start+length,0)]
 sign=1 if change>0 else -1;h=abs(change);lo=0.;hi=.5
 def rise(a):return 2*radius*(1-math.cos(a))+(length-2*radius*math.sin(a))*math.tan(a)
 for _ in range(80):
  x=(lo+hi)/2
  if rise(x)<h:lo=x
  else:hi=x
 a=(lo+hi)/2;L=(length-2*radius*math.sin(a))/math.cos(a);assert L>0
 n=max(1,math.ceil(math.degrees(a)/step));pts=[]
 for i in range(n+1):
  t=a*i/n;pts.append((start+radius*math.sin(t),sign*radius*(1-math.cos(t))))
 x1=start+radius*math.sin(a);z1=radius*(1-math.cos(a));x2=x1+L*math.cos(a);z2=z1+L*math.sin(a)
 pts.append((x2,sign*z2))
 for i in range(1,n+1):
  t=a*i/n;pts.append((x2+radius*(math.sin(a)-math.sin(a-t)),sign*(z2+radius*(math.cos(a-t)-math.cos(a)))))
 assert abs(pts[-1][0]-(start+length))<1e-8 and abs(pts[-1][1]-change)<1e-8
 return pts
plan=curve(1000,1000,-85);slope=curve(2050,1000,41);late_slope=curve(3450,1000,41)

def leg(q,scenario,shift):
 # x coordinate along arm, q transverse. Starts at the SW corner arc.
 start=q+radius;pts=[(start,q,-1200)]
 if shift:
  pts.append((1000,q,-1200));pts += [(x,q+v,-1200) for x,v in plan[1:]];q-=85
 pts.append((2050,q,-1200))
 if scenario=='taper':
  pts += [(x,q,-1200+v) for x,v in slope[1:]];pts.append((3450,q,-1159))
 else:
  pts.append((3050,q,-1200));pts.append((3450,q,-1200))
  pts += [(x,q,-1200+v) for x,v in late_slope[1:]]
 # The line runs to the next node footprint. Its continuation inside that
 # node is not shown or counted as a developed free end.
 pts.append((5700,q,-1159));return pts

def full_bottom(q,scenario,repair):
 orig=next(b for b in m['bottom'] if b['id']==f'B{q}');east=leg(q,scenario,repair and q==385)
 # Original source contains the same circular SW corner with two straight ends.
 corner=orig['points'][1:-1];north=[(y,x,z) for x,y,z in east]
 pts=list(reversed(east))+corner[1:]+north[1:]
 return {'id':f'B{q}','dia':32,'points':pts}

def full_top(q):
 orig=next(b for b in m['top'] if b['id']==f'T{q}');return {'id':f'T{q}','dia':20,'points':[(5700,q,-870)]+orig['points'][1:-1]+[(q,5700,-870)]}

def translate(item,axis):
 dx,dy=(2850,0) if axis=='E' else (0,2850);out={**item,'id':axis+'-'+item['id'],'owner':axis+'-'+item['owner']}
 if 'points' in out:out['points']=[(x+dx,y+dy,z) for x,y,z in item['points']]
 if 'center' in out:
  x,y,z=item['center'];out['center']=(x+dx,y+dy,z)
 return out
# No next-node cage is authored. This explicit cloned candidate is a
# geometric challenge only; it neither asserts pile existence nor capacity.
next_piles=[translate(p,a) for a in ('E','N') for p in m['piles']]
next_pile_heads=[translate(h,a) for a in ('E','N') for h in m['heads'] if h['id'].startswith('PH')]
next_pile_necks=[translate(h,a) for a in ('E','N') for h in m['necks'] if h['id'].startswith('PN')]
all_piles=m['piles']+next_piles;all_heads=m['heads']+next_pile_heads;all_necks=m['necks']+next_pile_necks
# A minimal geometric confinement challenger, not a qualified full cage:
# two closed circular Ø8 hoops at each hypothetical next pile. Their 163.5
# centre radius is tangent to the eight H25 bars at radius 147. The lower
# hoop lies inside the assumed 420 pile, below the −1257 node soffit.
def pile_hoop(axis,z):
 cx,cy=(3150,300) if axis=='E' else (300,3150)
 points=[(cx+163.5*math.cos(math.radians(i*2)),cy+163.5*math.sin(math.radians(i*2)),z) for i in range(181)]
 return {'id':f'{axis}-H{z}','dia':8,'points':points}
trial_hoops=[pile_hoop(a,z) for a in ('E','N') for z in (-1150,-1300)]
assert math.isclose(163.5-147,12.5+4,abs_tol=1e-12)
checks={};profiles={}
for scenario in ('taper','constant'):
 for repair in (False,True):
  key=scenario+('_plan_repair' if repair else '_unshifted');bottom=[full_bottom(q,scenario,repair) for q in (100,385,540)];top=[full_top(q) for q in (80,210,520)]
  bp=m['minimum'](bottom,all_piles);bn=m['minimum'](bottom,all_necks);bh=m['headbars'](all_heads,bottom);tp=m['minimum'](top,all_piles);th=m['headbars'](all_heads,top);bb=m['within'](bottom);tt=m['within'](top);bt=m['minimum'](bottom,top);br=m['minimum'](bottom,m['rods']);tr=m['minimum'](top,m['rods'])
  checks[key]={'bottom_to_pile':bp,'bottom_to_thread':bn,'bottom_to_head':bh,'top_to_pile':tp,'top_to_head':th,'bottom_each':bb,'top_each':tt,'bottom_top':bt,'bottom_to_SW_hold':br,'top_to_SW_hold':tr,'limit':'All stems/heads are represented finite cylinders with 0.1 mm numerical allowance; no pile hoop, adjacent-node tie, extra arm steel, head-group or actual tolerance model.'}
  profiles[key]={'bottom':bottom,'top':top}
# The selected hoop locations are only a finite fit challenger. A close
# approach to the tapered arm rejects that specific hoop arrangement, not
# every possible tapered cage. Butt-weld closure and full confinement remain
# unqualified, and no manufacturing tolerance is included.
for key in ('taper_plan_repair','constant_plan_repair'):
 checks[key]['bottom_to_trial_next_hoop']=m['minimum'](profiles[key]['bottom'],trial_hoops)
checks['constant_plan_repair']['top_to_trial_next_hoop']=m['minimum'](profiles['constant_plan_repair']['top'],trial_hoops)
def hoop_head_clear(h,axis,z):
 cx,cy=(3150,300) if axis=='E' else (300,3150)
 x,y,zh=h['center'];d=math.hypot(x-cx,y-cy)
 radial=max(abs(d-163.5)-h['radius'],0)
 vertical=max(abs(zh-z)-h['thick']/2,0)
 return math.hypot(radial,vertical)-4-.1
hh=min((hoop_head_clear(h,a,z),h['id'],f'{a}-H{z}') for a in ('E','N') for z in (-1150,-1300) for h in next_pile_heads if h['id'].startswith(a+'-'))
checks['constant_plan_repair']['trial_hoop_to_head']={'clear_mm':hh[0],'a':hh[1],'b':hh[2]}
assert checks['taper_unshifted']['bottom_to_pile']['clear_mm']<22
assert checks['constant_unshifted']['bottom_to_pile']['clear_mm']<22
for key in ('taper_plan_repair','constant_plan_repair'):
 assert all(checks[key][k]['clear_mm']>=22 for k in ('bottom_to_pile','bottom_to_thread','bottom_to_head','top_to_pile','top_to_head','bottom_each','top_each','bottom_top','bottom_to_SW_hold','top_to_SW_hold')),checks[key]
assert checks['constant_plan_repair']['bottom_to_trial_next_hoop']['clear_mm']>=22
assert checks['constant_plan_repair']['trial_hoop_to_head']['clear_mm']>=22
# Physical sampled clear cover along the sloping bottom; adjacent transverse
# and vertical arm bars and the node cage closure remain separately unsolved.
cover=min((-1200+v-16)-(-1257+42*(x-2050)/1000) for x,v in slope)
assert 39.89<=cover-.1<40
late_cover=min((-1200+v-16)-(-1257+42*(x-3450)/1000) for x,v in late_slope)
assert math.isclose(late_cover,cover,abs_tol=1e-9)
# Exact local union comparison; cold node's part outside the old ring must
# carry its complete 492 mm depth, not only the 42 mm increment.
node=.827**2;within_ring=.777**2-.177**2;outside=node-within_ring
base_node=.6*.6*.45
base_arms=2*(3.45-.6)*.6*.45
base=base_node+base_arms
node_only=within_ring*.042+outside*.492
common_taper=node_only+2*.6*(2.05-.777)*.042+2*.6*.5*.042
common_constant=node_only+2*.6*(3.45-.777)*.042
constant_with_late_transition=common_constant+2*.6*.5*.042
ring_area=12**2-10.8**2
full_constant=ring_area*.042+outside*.492
old_record=cage['concrete_comparison']['difference_m3'];assert math.isclose(common_taper,old_record,abs_tol=1e-9)
# The actual next-node footprints are 2850..3450, not a point at 3150.
assert 3150-300==2850 and 3050-2850==200
# Projected 420 pile reaches 2940, so candidate vertical transition enters
# its concrete footprint. This is a geometry intersection, not a clash.
assert 3150-210==2940 and 3050-2940==110
# Source action: two partial outer faces, not whole-house / whole-corner force.
routes=cage['partial_roof_three_node_equilibrium_witness'];cases={}
for case in ('down','uplift'):
 f=routes[case]['signed_forces_kN'];F=cage['partial_roof_axial_equilibrium_witness'][case]['F_kN']
 sw=f['SW_300_300'];east=f['E_3150_300'];north=f['N_300_3150']
 assert math.isclose(sw+east+north,F,abs_tol=1e-10)
 groups={'SW':m['piles'],'E':[p for p in next_piles if p['id'].startswith('E-')],'N':[p for p in next_piles if p['id'].startswith('N-')]}
 shares={'SW':sw,'E':east,'N':north}
 resultant_x=sum(shares[g]/8*sum(p['points'][0][0] for p in bars) for g,bars in groups.items())
 resultant_y=sum(shares[g]/8*sum(p['points'][0][1] for p in bars) for g,bars in groups.items())
 xy0=cage['partial_roof_axial_equilibrium_witness'][case]['resultant_xy_mm']
 assert math.isclose(resultant_x,F*xy0[0],abs_tol=1e-8) and math.isclose(resultant_y,F*xy0[1],abs_tol=1e-8)
 cases[case]={'source_SW_vertical_kN':F,'SW_pile_axis_kN':sw,'east_node_kN':east,'north_node_kN':north,'east_arm_end_actions_kN':[-east,east],'north_arm_end_actions_kN':[-north,north],'east_arm_My_kNm':east*2.85,'north_arm_Mx_kNm':-north*2.85,'uniform_eight_bar_witness_each_kN':{g:shares[g]/8 for g in groups},'route':'Roof partial action → four SW trial ties → warm/cold station → two arm end couples plus SW group → three ideal pile-axis groups; equal pile-bar forces are a statics witness only.','scope':'Partial-roof force and first moment only; no predicted stiffness, contact, compression in heads, arm resistance, anchorage, actual pile or whole-house load.'}
windows={}
for wall,second in [('outer-south',[3400,4400]),('outer-west',[4100,5100])]:
 for level in ('GROUND','FIRST'):
  a=[o for o in had['openings'][level] if o['wall']==wall and o['centre']==(3900 if wall=='outer-south' else 4600)]
  assert len(a)==1 and a[0]['width']==1000 and a[0]['kind']=='window'
 windows[wall]={'first_window_mm':[1300,2300],'second_window_mm':second,'first_window_plan_shift_overlap_mm':[1300,2000],'first_window_taper_only_overlap_mm':[2050,2300],'second_window_late_transition_overlap_mm':[max(second[0],3450),min(second[1],4450)]}
window={'ground_and_first':windows,'scope':'Under-window plan overlap only; head, sill, actual distributed reactions, warm/cold and service geometry require source-specific design.'}
# A bounded, disjoint first-storey core piece over each first exterior window.
# This is not the entire head, wall, ground-storey, floor or roof action.
assert disjoint['method']['storey_height_mm']==3100 and disjoint['method']['density_kN_m3']==20
spandrels={}
for wall in ('outer-south','outer-west'):
 o=next(o for o in had['openings']['FIRST'] if o['wall']==wall and o['centre']==1800)
 assert o['head']==2850 and o['width']==1000
 volume=o['width']*140*(3100-o['head'])/1e9;g=volume*20;uls=1.35*g
 assert volume<=disjoint['per_occurrence_core_volume_m3'][wall]
 left,right=1200.,2400.;load=uls/2
 sw=load*(3150-left)/2850+load*(3150-right)/2850;adj=uls-sw
 assert math.isclose(sw+adj,uls,abs_tol=1e-12)
 assert math.isclose(sw*300+adj*3150,uls*1800,abs_tol=1e-9)
 spandrels[wall]={'source_first_window_mm':[1300,2300],'trial_rectangular_core_band_local_z_mm':[2850,3100],'core_width_mm':140,'volume_m3':volume,'G_kN':g,'ULS_1p35G_kN':uls,'trial_jamb_axes_mm':[left,right],'trial_jamb_each_kN':load,'simple_SW_kN':sw,'simple_adjacent_kN':adj,'scope':'Source-disjoint FIRST core over rectangular window trial only. The 1200/2400 jamb axes and beam reactions are a statics comparison, not an accepted head, sill, ground-wall, load path or combined design. True segmental arch material, finishes, weather leaf and all other wall/slab/roof actions excluded.'}
# Two omitted outer-corner tip triangles are a separate finite trial. The
# existing hip extends from its 332.5 seat to (0,0). Propose two 200 mm
# orthogonal SHS80 jack cantilevers from one shared cross-node at (0,0),
# with tip purlins cantilevering at most 200 mm from the relevant jack.
assert math.isclose(roof['actual_roof']['roof_extent_from_seat'],532.5)
assert math.isclose(station['finite_roof_candidate']['hip']['actual_end_extension_plan_mm'],332.5)
assert station['finite_roof_candidate']['jack']['section_mm']==[80,80,5]
assert math.isclose(station['finite_roof_candidate']['outer_eave_corner_tip_triangle_m2'],.02)
tip_area=.04;tip_centroid=(-100.,-100.);tip={}
assert math.isclose(next(r['plan_area'] for r in roof['actual_roof']['regions'] if r['id']=='corner-SW'),21.6225)
hip=station['finite_roof_candidate']['hip'];tan=math.tan(math.radians(25))
hip_top_at_zero=hip['outer_top_z_mm']-332.5*tan
roof_base=roof['actual_roof']['primary_centre'];jack_axis_at_zero=roof_base-332.5*tan
jack_under_at_zero=jack_axis_at_zero-40/math.cos(math.radians(25))
seat_gap=jack_under_at_zero-hip_top_at_zero
assert seat_gap>80 and seat_gap-80>0
# Plan envelope of an RHS120x60 rotated with the 25-degree roof. A
# conservative 105.09 mm projected body fits inside the triangular face.
# The inner end at x=-40 meets the 80 mm jack's west face. Deck support and
# the exact 3D top face are not derived from this body footprint.
projected_width=60*math.cos(math.radians(25))+120*math.sin(math.radians(25))
row_y=-140.;row_hi=row_y+projected_width/2;row_lo=row_y-projected_width/2
assert row_lo>=-200 and row_hi<-40
row_length=-40-row_hi;assert row_length>0
for case,q in [('down',roof['actual_roof']['cases']['ULS-down']['q_horizontal']),('uplift',roof['actual_roof']['cases']['uplift-stress']['q_horizontal'])]:
 Ftip=q*tip_area;Fface=Ftip/2
 # The inherited hip is supported at SW A=(332.5,332.5) and court
 # B=(3917.5,3917.5). The overhang creates an opposite-signed B reaction;
 # it is not a fixed-end moment deposited entirely at the SW node.
 hipAxy=station['finite_roof_candidate']['hip']['outer_seat_xy_mm'];hipBxy=station['finite_roof_candidate']['hip']['court_seat_xy_mm']
 assert hipAxy==[332.5,332.5] and hipBxy==[3917.5,3917.5]
 hipB=Ftip*(tip_centroid[0]-hipAxy[0])/(hipBxy[0]-hipAxy[0]);hipA=Ftip-hipB
 assert math.isclose(hipA*hipAxy[0]+hipB*hipBxy[0],Ftip*tip_centroid[0],abs_tol=1e-9)
 assert math.isclose(hipA*hipAxy[1]+hipB*hipBxy[1],Ftip*tip_centroid[1],abs_tol=1e-9)
 before=cage['partial_roof_axial_equilibrium_witness'][case];F=before['F_kN']+hipA
 x=(before['F_kN']*before['resultant_xy_mm'][0]+hipA*hipAxy[0])/F
 y=(before['F_kN']*before['resultant_xy_mm'][1]+hipA*hipAxy[1])/F
 east=F*(x-300)/2850;north=F*(y-300)/2850;sw=F-east-north
 assert math.isclose(sw*300+east*3150+north*300,F*x,abs_tol=1e-8)
 assert math.isclose(sw*300+east*300+north*3150,F*y,abs_tol=1e-8)
 tip[case]={'tip_force_kN':Ftip,'tip_hip_SW_increment_kN':hipA,'tip_hip_court_increment_kN':hipB,'hip_reaction_scope':'Two-support static comparison with the inherited hip far-end release; no actual seat, court hold-down or stiffness is inferred.','per_face_force_kN':Fface,'jack_root_cantilever_M_kNm':Fface*(2/3*.2),'jack_root_south_Mx_west_My_kNm':[Fface*(2/3*.2),-Fface*(2/3*.2)],'purlin_relocation_couple_kNm':Fface*(1/3*.2),'purlin_relocation_south_My_west_Mx_kNm':[-Fface*(1/3*.2),Fface*(1/3*.2)],'tip_cold_Mx_My_kNm':[-(tip_centroid[1]-300)*Ftip/1000,(tip_centroid[0]-300)*Ftip/1000],'combined_partial_SW_kN':F,'combined_resultant_xy_mm':[x,y],'combined_three_node_kN':{'SW':sw,'E':east,'N':north}}
roof_tip={'status':'unaccepted conventional tip-support challenger, not a selected roof','south_triangle_xy_mm':[[-200,-200],[0,-200],[0,0]],'west_triangle_xy_mm':[[-200,-200],[-200,0],[0,0]],'two_tip_area_m2':tip_area,'combined_centroid_xy_mm':tip_centroid,'hip_end_xy_mm':[0,0],'hip_outer_seat_xy_mm':[332.5,332.5],'jack_cantilevers_plan_mm':[[[0,0],[0,-195]],[[0,0],[-195,0]]],'jack_section_mm':[80,80,5],'jack_nominal_weather_edge_margin_mm':5,'purlin_body_section_mm':[120,60,4],'purlin_projected_body_width_mm':projected_width,'south_purlin_body_plan_mm':[row_hi,row_lo,-40,row_hi],'west_purlin_body_plan_mm':[row_lo,row_hi,row_hi,-40],'purlin_stub_length_mm':row_length,'purlin_body_nominal_weather_edge_margin_mm':row_lo+200,'purlin_max_roof_plan_cantilever_mm':200,'root_node':'One shared, welded SHS80 cross-node above the existing diagonal SHS120 hip end; not two overlapping SHS volumes.','jack_to_hip_axis_gap_mm':seat_gap,'trial_root_stack_mm':{'steel_block':70,'plate':10,'remaining_nominal_packing':seat_gap-80},'actions':tip,'scope':'The tip cantilevers and their shared node are explicit geometry/stress-path challengers. The purlin rectangle bounds the rotated member body in plan, not its deck-bearing face; it is a short stub, and actual roof-deck support to the diagonal edge, full 3D seat/purlin/hip and adjacent-strip clashes, signed weld/anchorage, restraint, weather, ventilation, tolerance, product and capacity remain unproved. Faces beyond these tips remain unmodelled. Extra steel weight remains within/subject to the source G budget, not added again.'}

result={'status':'Joined SW arm/node geometric challenger; no HOUSE, construction, or foundation acceptance','sources':dict(zip(sources,sha)),'source_nodes':{'SW':[300,300],'east':[3150,300],'north':[300,3150],'next_node_footprint_along_arm_mm':[2850,3450],'hypothetical_420_pile_footprint_along_arm_mm':[2940,3360]},'decision':'Prefer constant-depth local three-node challenger for further joined design; it removes the vertical bar/soffit taper within the next nodes. This is not a foundation selection, capacity pass or decision to deepen the full perimeter. Transition beyond this group and all interfaces remain open.','comparison':{'old_cold_z_mm':[-1215,-765],'local_new_z_mm':[-1257,-765],'local_arm_width_mm':600,'taper_transition_mm':[2050,3050],'constant_depth_to_mm':3450,'common_domain':'SW node plus the E/N arm runs through their adjacent-node far edges; node/arms union, no piles or other intersections','base_volume_m3':base,'taper_added_m3':common_taper,'constant_added_m3':common_constant,'constant_minus_taper_m3':common_constant-common_taper,'constant_minus_taper_G_kN':25*(common_constant-common_taper),'late_transition_mm':[3450,4450],'late_transition_domain':'SW node plus E/N arms through coordinate 4450; excludes piles and other intersections','late_transition_reference_volume_m3':base+2*.6*.45,'constant_with_late_transition_added_m3':constant_with_late_transition,'constant_with_late_transition_minus_taper_m3':constant_with_late_transition-common_taper,'constant_with_late_transition_minus_taper_G_kN':25*(constant_with_late_transition-common_taper),'whole_ideal_perimeter_ring_area_m2':ring_area,'whole_ring_constant_added_m3':full_constant,'whole_ring_constant_G_kN':25*full_constant,'whole_ring_scope':'Separate larger counterfactual: 600-wide closed rectangular cold ring and SW local node only, all original 450 mm deep. Excludes internal branches, other enlarged nodes, ground, soil and all pile volumes; not a complete takeoff.'},'repair':{'unshifted_bar_q_mm':385,'plan_repair_mm':[385,300],'plan_curve_longitudinal_mm':[1000,2000],'taper_vertical_transition_mm':[2050,3050],'constant_option_late_transition_mm':[3450,4450],'modeled_bar_end_mm':5700,'bend_inside_diameter_mm':330,'transition_raw_sampled_cover_mm':cover,'transition_numerical_lower_bound_mm':cover-.1,'late_transition_numerical_lower_bound_mm':late_cover-.1,'placement_tolerance':'not included','scope':'Actual continuous point paths include candidate plan and vertical curves to the next-node footprint at 5700; further continuation is unmodelled. Next pile cage is a hypothetical SW-pattern clone, not source-authored reinforcement.'},'HAD_aligned_pad_slab_comparison':pad_slab,'represented_constant_steel_paths':profiles['constant_plan_repair'],'hypothetical_next_pile_stems':next_piles,'hypothetical_next_pile_heads':next_pile_heads,'hypothetical_next_pile_thread_envelopes':next_pile_necks,'hypothetical_next_pile_hoops':{'centres_mm':[[3150,300],[300,3150]],'diameter_mm':8,'centre_radius_mm':163.5,'levels_mm':[-1150,-1300],'pile_diameter_mm':420,'concrete_radial_cover_mm':42.5,'intentional_P25_bar_tangencies':32,'scope':'Two finite closed circles per hypothetical next pile, including one below the node soffit. Closure, pitch, full cage, stress-spread, sequencing and actual pile existence remain unqualified.'},'window_overlap':window,'upper_window_spandrel_trials':spandrels,'roof_tip_challenger':roof_tip,'envelope_plan_interface':{'ordinary_layers_mm':layers,'cold_arm_inward_mm':[0,600],'weather_leaf_inward_mm':[0,102.5],'warm_pad_projection_inward_mm':[262.5,562.5],'pad_to_cold_arm_inner_margin_mm':37.5,'scope':'Plan overlap only. Independent weather-leaf bearing, cavity drainage, thermal breaks, DPC/contact, field interface and structural restraint are not proved. MAT 850 mm loggia-sidewall hypothesis is not this ordinary wall.'},'checks':checks,'partial_roof_statics':cases,'roof_scope':{'SW_corner_source_m2':21.6225,'solved_two_outer_strip_faces_m2':2*station['finite_roof_candidate']['outer_triangle_modeled_strip_area_m2'],'remaining_corner_area_m2':21.6225-2*station['finite_roof_candidate']['outer_triangle_modeled_strip_area_m2'],'after_conditional_tip_candidate_m2':21.6225-2*station['finite_roof_candidate']['outer_triangle_modeled_strip_area_m2']-tip_area,'scope':'Tip support is a challenger, not a solved selected roof. All other remaining roof faces are unmodelled. No partial load is added to the original collapsed-corner action.'},'holds':['Actual next-node pile support, size, reinforcement and hold-down forces are unselected; local H25 cages are hypothetical clones','Next-node bars, link bends/closures, full arm/slab cage and service clashes not screened','Window heads, wall bearing, non-overlapping floor/wall loads and whole-house signed load patterns unresolved','Arm bending/torsion, contact, displacement and joint force transfer are not proven by equilibrium','DPC, wet-wall weather leaf, cavity drainage, field/patch and 3D thermal/ground interfaces require MAT/HAD','Actual pile length, ground motion, capacities, construction and physical acceptance remain open']}
# Compact point summaries keep exact source geometry reproducible without
# treating the unqualified 3D rebar paths as selected shop drawings.
for key in checks:
 checks[key]['bar_points_sha256']=hashlib.sha256(json.dumps(profiles[key],sort_keys=True,separators=(',',':')).encode()).hexdigest()
text=json.dumps(result,indent=2,sort_keys=True)+'\n'
out=O/'sw-grid-arm-join.json'
def xy(x,y):return (20+(x+50)*.032,155-(y+50)*.032)
def path(bar):return ' '.join(('M' if i==0 else 'L')+' %.3f %.3f'%xy(x,y) for i,(x,y,z) in enumerate(bar['points']))
parts=[]
for b in profiles['constant_plan_repair']['bottom']:
 parts.append('<path d="%s" stroke="#a94d35" stroke-width=".8" fill="none"/>'%path(b))
for x,y in ((300,300),(3150,300),(300,3150)):
 px,py=xy(x,y);parts.append('<circle cx="%.3f" cy="%.3f" r="6.72" fill="none" stroke="#516b76" stroke-width=".5"/>'%(px,py))
svg='''<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="210mm" viewBox="0 0 420 210"><rect width="420" height="210" fill="white"/><style>text{font-family:Arial,sans-serif;fill:#1c3541;font-size:3px}.title{font-size:5px;font-weight:bold}.small{font-size:2.6px}.warn{fill:#a04430}</style><defs><clipPath id="arm-plan"><rect x="20" y="43" width="112" height="112"/></clipPath></defs><text x="10" y="10" class="title">SW cold grid: joined local arm and node comparison</text><text x="10" y="16" class="small">Development candidate only · no selected foundation, load capacity or site approval</text><text x="15" y="26">A  PLAN · three node axes and actual window intervals</text><rect x="31.2" y="134.2" width="100.8" height="19.2" fill="#dce7e9" stroke="#8da2aa" stroke-width=".3"/><rect x="21.6" y="43" width="19.2" height="100.8" fill="#dce7e9" stroke="#8da2aa" stroke-width=".3"/><rect x="20" y="128.536" width="26.464" height="26.464" fill="#bdcfd4" stroke="#526772" stroke-width=".4"/><rect x="112.8" y="134.2" width="19.2" height="19.2" fill="#c8d9dc" stroke="#526772" stroke-width=".4"/><rect x="21.6" y="43" width="19.2" height="19.2" fill="#c8d9dc" stroke="#526772" stroke-width=".4"/>''' + '<g clip-path="url(#arm-plan)">' + ''.join(parts) + '</g>' + '''<line x1="63.2" y1="153.4" x2="95.2" y2="153.4" stroke="#bc8738" stroke-width="1.4"/><line x1="21.6" y1="79.8" x2="21.6" y2="111.8" stroke="#bc8738" stroke-width="1.4"/><text x="15" y="164">Rust: 3 continuous H32 bottom returns and plan shift.</text><text x="15" y="170">Gold: 1300..2300 south/west windows, both levels.</text><text x="15" y="176">Circles: hypothetical 420 pile; next cage is not authored.</text><text x="150" y="26">B  ALTERNATIVES · local arm depth</text><rect x="153" y="34" width="95" height="25" fill="#dce7e9" stroke="#526772" stroke-width=".4"/><text x="255" y="40">Preferred: constant cold soffit −1257</text><text x="255" y="46">through next-node far edge 3450.</text><text x="255" y="52">Then taper beyond next node: 3450..4450.</text><path d="M153 70 H248 V85 H224 L205 90 H153 Z" fill="#e7ddca" stroke="#705942" stroke-width=".4"/><text x="255" y="76">Comparator: −1257 to −1215</text><text x="255" y="82">over 2050..3050; next node begins 2850.</text><text x="150" y="103">C  QUANTITY AND CLEARANCE</text><text x="150" y="110">Through 3450: extra vs early taper 0.045360 m³ / 1.134 kN.</text><text x="150" y="116">To 4450, extra vs early taper: 0.070560 m³ / 1.764 kN.</text><text x="150" y="122">Unshifted q385: 0.146 mm; shifted q300: 27.654 mm.</text><text x="150" y="128">Trial hoop: constant +29.9 mm; early taper −11.1 mm.</text><text x="150" y="134">Numerical allowance 0.1 mm; placing tolerance excluded.</text><text x="150" y="141">D  PARTIAL ROOF FORCE · SW / E / N nodes</text><text x="150" y="148">Down: +22.308 / +1.164 / +1.001 kN.</text><text x="150" y="154">Uplift: −7.967 / −0.416 / −0.357 kN.</text><text x="150" y="160" class="warn">Statics only; other roof faces and all other actions omitted.</text><text x="10" y="185">HAD slab −380..−180; trial pad −380..−80 leaves a 100 mm upstand to reconcile.</text><text x="10" y="192">Actual next pile/cage, continuation beyond 5700, all links, window loads, MAT cavity/DPC/field and soil acceptance remain open.</text><text x="10" y="199">Full-ring deepening is a separate quantified comparator, not selected. The 39.9 mm taper cover bound is not a tolerance or fabrication pass.</text><text x="10" y="206">The selected roof corner has 16.256875 m² outside the solved strips; no collapsed-roof action is added to this partial route.</text></svg>'''
svgpath=O/'sw-grid-arm-join.svg'
# A second plan makes the omitted-tip support proposal and its very short
# projected purlin body inspectable; it is not an accepted roof detail.
def tip_xy(x,y):return (15+(x+200)*.23,160-(y+200)*.23)
def tip_rect(rect,color):
 x0,y0,x1,y1=rect;X,Y=tip_xy(x0,y1);return '<rect x="%.3f" y="%.3f" width="%.3f" height="%.3f" fill="%s" fill-opacity=".75" stroke="#526772" stroke-width=".4"/>'%(X,Y,(x1-x0)*.23,(y1-y0)*.23,color)
def tip_poly(points,color):
 return '<polygon points="%s" fill="%s" stroke="#9caeb2" stroke-width=".4"/>'%(' '.join('%.3f,%.3f'%tip_xy(x,y) for x,y in points),color)
tip_parts=[tip_poly(roof_tip['south_triangle_xy_mm'],'#e8f0f1'),tip_poly(roof_tip['west_triangle_xy_mm'],'#f0eadc'),tip_rect([-40,-195,40,0],'#bacbd0'),tip_rect([-195,-40,0,40],'#bacbd0'),tip_rect(roof_tip['south_purlin_body_plan_mm'],'#b65d43'),tip_rect(roof_tip['west_purlin_body_plan_mm'],'#b65d43')]
a0,b0=tip_xy(0,0);a1,b1=tip_xy(332.5,332.5)
tip_parts.append('<line x1="%.3f" y1="%.3f" x2="%.3f" y2="%.3f" stroke="#775346" stroke-width="2"/>'%(a0,b0,a1,b1))
tip_svg='''<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="210mm" viewBox="0 0 420 210"><rect width="420" height="210" fill="white"/><style>text{font-family:Arial,sans-serif;fill:#1c3541;font-size:3px}.title{font-size:5px;font-weight:bold}.small{font-size:2.6px}.warn{fill:#a04430}</style><text x="10" y="10" class="title">SW roof outer tip: conditional finite support challenger</text><text x="10" y="17" class="small">Two source triangles, 0.04 m² total · not an accepted roof, construction or weather detail</text><text x="15" y="27">A  PLAN · weather edges −200, axes in mm</text>''' + ''.join(tip_parts) + '''<text x="15" y="171">Brown: existing hip axis to SW seat (332.5,332.5).</text><text x="15" y="177">Grey: shared SHS80 cross-node and 195 mm jack arms.</text><text x="15" y="183">Rust: rotated RHS120×60 body footprints; not deck contact.</text><text x="160" y="27">B  ROOT AND EDGE FIT · nominal only</text><rect x="165" y="37" width="28" height="16" fill="#bdcfd4" stroke="#526772"/><text x="202" y="43">SHS80 jack underside at hip axis</text><rect x="165" y="70" width="28" height="17" fill="#d5c1a8" stroke="#705942"/><text x="202" y="76">SHS120 hip top at (0,0)</text><text x="202" y="55">87.687 mm nominal vertical gap.</text><text x="202" y="62">70 block + 10 plate + 7.687 packing trial.</text><text x="160" y="100">Rotated purlin body: 105.093 mm plan width.</text><text x="160" y="106">One stub each face, length 47.454 mm nominal.</text><text x="160" y="112">Body-to-weather edge 7.454 mm; jack edge 5 mm.</text><text x="160" y="121" class="warn">Deck contact, diagonal-edge support, 3D junction,</text><text x="160" y="127" class="warn">fabrication, tolerance and weather are not qualified.</text><text x="160" y="143">C  SOURCE HORIZONTAL LOAD CHALLENGES</text><text x="160" y="150">Tips +0.252 / −0.090 kN; court −0.030 / +0.011 kN.</text><text x="160" y="156">Partial SW incl. tips +24.755 / −8.841 kN.</text><text x="160" y="162">SW / E / N equilibrium: +22.584/+1.167/+1.004 kN.</text><text x="160" y="168">Uplift: −8.066/−0.417/−0.359 kN; no capacity claim.</text><text x="10" y="198">Adding the tip is a conditional route, not proof of the remaining 16.216875 m² of the SW corner; no load is added to the older collapsed endpoint.</text><text x="10" y="205">Roof steel, plate/weld restraint, purlin/deck support, vent/air/weather junction, walls, grid, piles and site remain to be joined and checked.</text></svg>'''
tippath=O/'sw-roof-tip-join.svg'
if '--check' in sys.argv:
 assert out.read_text()==text and svgpath.read_text()==svg+'\n' and tippath.read_text()==tip_svg+'\n'
 print('SW arm/node alternatives, collisions and partial signed equilibrium verified')
else:
 out.write_text(text);svgpath.write_text(svg+'\n');tippath.write_text(tip_svg+'\n')
 print(json.dumps({'checks':checks,'comparison':result['comparison']},indent=2))
