"""Exact B slab surface partition and preliminary receiving routes.

The output is a disjoint mass/action and topology check, not plate, joint,
masonry, thermal-break or foundation adequacy. --check verifies its JSON.
"""
from pathlib import Path
import hashlib
import json
import math
import sys

ROOT=Path(__file__).resolve().parents[3]
OUT=Path(__file__).resolve().parent/'physical-slab-join.json'
SOURCES={
 'project/had/studies/open-north-loggia.json':'542781c6bb1d277b20492e8433cea498e98eaea5db2e737a5ec7e9655f9d18fd',
 'project/str/studies/open-loggia-support.json':'b5f08104c0da327613b84e055420d58f7709c354facd205634bcfd69a05e09b5',
 'project/str/studies/whole-house-reaction-join.json':'d48f810099cfbe36c3762955bc272df7b8c9fcd222a6bf0ef4c54fdb3a02e97b',
}
data={}
for path,digest in SOURCES.items():
 raw=(ROOT/path).read_bytes()
 if hashlib.sha256(raw).hexdigest()!=digest:raise SystemExit(f'source changed: rebind {path}')
 data[path]=json.loads(raw)
had=data['project/had/studies/open-north-loggia.json']
struc=data['project/str/studies/open-loggia-support.json']
join=data['project/str/studies/whole-house-reaction-join.json']
fields=[f['rectangle'] for f in struc['floor_fields']]
bridge=[4885,2735,7115,3832.5]
void=had['void'];court=had['court'];stair=had['stair']
holes=[[void[0],void[1],void[0]+void[2],void[1]+void[3]],
       [court[0],court[1],court[0]+court[2],court[1]+court[3]],
       [stair[0],stair[1],stair[0]+stair[2],stair[1]+stair[3]]]
assert holes==[[4885,417.5,7115,2735],[4250,4250,7750,7750],[417.5,4432.5,2817.5,8767.5]]
routes=struc['lower_grid']['actual_routes']
def contains(p,r):return r[0]<=p[0]<r[2] and r[1]<=p[1]<r[3]
def distance(point,route):
 _,a,b,_=route
 axis=0 if a[0]!=b[0] else 1
 t=max(0,min(1,(point[axis]-a[axis])/(b[axis]-a[axis])))
 foot=[a[i]+t*(b[i]-a[i]) for i in range(2)]
 return math.dist(point,foot)
def near(point):return min(routes,key=lambda r:distance(point,r))
def close(a,b):return math.isclose(a,b,rel_tol=1e-10,abs_tol=1e-10)

# The RC200 floor may extend to the inner structural axes. The exterior
# 0..332.5/11667.5..12000 perimeter is cavity/weather-leaf territory, not a
# legitimate continuous concrete slab merely because the shell is 12x12.
inner=[332.5,332.5,11667.5,11667.5]
xs=sorted({inner[0],inner[2],4377.5,7622.5,*[v for r in fields+[bridge]+holes for v in (r[0],r[2]) if inner[0]<v<inner[2]]})
ys=sorted({inner[1],inner[3],7750,*[v for r in fields+[bridge]+holes for v in (r[1],r[3]) if inner[1]<v<inner[3]]})
cells=[]
for xa,xb in zip(xs,xs[1:]):
 for ya,yb in zip(ys,ys[1:]):
  centre=[(xa+xb)/2,(ya+yb)/2]
  if any(contains(centre,r) for r in fields+[bridge]+holes):continue
  area=(xb-xa)*(yb-ya)/1e6
  if area==0:continue
  if 4377.5<=xa and xb<=7622.5 and 7750<=ya and yb<=8082.5:
   mode='loggia-transverse-end'
  elif ((xa,xb) in [(4800,4885),(7115,7200)]) and 2650<=ya and yb<=3917.5:
   mode='bridge-side-beam-top-already-counted'
  elif 2817.5<=xa and xb<=2917.5 and 3247.5<=ya and yb<=3917.5:
   mode='SW-return-plate-and-collector'
  else:mode='direct-width-candidate'
  corners=[[xa,ya],[xa,yb],[xb,ya],[xb,yb]]
  max_nearest=max(min(distance(p,r) for r in routes) for p in corners)
  if mode=='direct-width-candidate' and max_nearest>300+1e-7:
   raise AssertionError(f'unrouted slab cell {(xa,ya,xb,yb)} max {max_nearest}')
  route=near(centre)
  cells.append(dict(rect=[xa,ya,xb,yb],area_m2=area,mode=mode,
                    nearest_axis=route[0],max_corner_to_any_route_mm=max_nearest,
                    G_RC200_kN=area*5,
                    maximum_assumed_ULS_kN=area*(1.35*8.5+1.5*2),
                    credit='Physical RC200 volume only; finish/live maximum is an authored challenge, not an occupied-area allocation'))

mode_area={name:sum(c['area_m2'] for c in cells if c['mode']==name) for name in sorted({c['mode'] for c in cells})}
assert len(cells)>30 and close(sum(mode_area.values()),7.634225)
assert close(mode_area['bridge-side-beam-top-already-counted'],.215475)
assert close(mode_area['loggia-transverse-end'],3.245*.3325)
assert close(mode_area['SW-return-plate-and-collector'],.067)
assert close(mode_area['direct-width-candidate'],6.2727875)

# No RC top is counted twice. The former bridge ledger has two member gross
# volumes less the 115-mm overlap with the adjacent axis fields; the remaining
# 85-mm beam top on each side belongs to those member volumes, not new slab RC.
already_counted_beam_top=mode_area['bridge-side-beam-top-already-counted']*5
assert close(already_counted_beam_top,1.077375)
assert close(join['entrance_bridge']['two_member_incremental_G_kN'],already_counted_beam_top+1.90125)
additional_RC_area=sum(c['area_m2'] for c in cells if c['mode']!='bridge-side-beam-top-already-counted')
additional_RC_G=additional_RC_area*5
gross_slab_area=join['axis_floor']['area_m2']+join['entrance_bridge']['area_m2']+sum(mode_area.values())
gross_slab_RC_G=gross_slab_area*5
parent_axis_RC_G=sum((f['rectangle'][2]-f['rectangle'][0])*(f['rectangle'][3]-f['rectangle'][1])/1e6*5 for f in struc['floor_fields'])
assert close(parent_axis_RC_G+join['entrance_bridge']['area_m2']*5+additional_RC_G+already_counted_beam_top,gross_slab_RC_G)
assert close(gross_slab_area,100.6602)
exterior_band_area=144-(inner[2]-inner[0])*(inner[3]-inner[1])/1e6
assert close(exterior_band_area,15.517775)
assert close(join['axis_floor']['surface_audit']['remaining_surface_domain_m2']-sum(mode_area.values()),exterior_band_area)

# The one south loggia strip spans east-west from actual ground-loggia inner
# cores. Its cold grid begins 300 mm beyond the southern physical edge.
loggia=[]
for name,y0,y1,node_y in [('south',7750,8082.5,8050)]:
 area=3.245*(y1-y0)/1000
 G=8.5*area;Q=2*area;ULS=1.35*G+1.5*Q
 wall_R=ULS/2
 ends=[]
 for wall_x,grid_x in [(4377.5,4500),(7622.5,7500)]:
  ends.append(dict(wall_x=wall_x,cold_grid_axis_x=grid_x,cold_grid_end_y=node_y,
                   vertical_ULS_kN=wall_R,
                   longitudinal_M_kNm=wall_R*abs((y0+y1)/2-node_y)/1000,
                   transverse_M_kNm=wall_R*abs(wall_x-grid_x)/1000,
                   status='Two-axis endpoint action; actual warm spreader, wall, grid arm and node sharing not sized'))
 q=ULS/3.245
 section=struc['floor_fields'][14]['section']
 assert struc['floor_fields'][14]['id']=='above-loggia'
 member_M=q*3.245**2/8
 assert member_M<section['MR']*(y1-y0)/1000
 loggia.append(dict(id=name,span_x_mm=3245,y=[y0,y1],area_m2=area,G_kN=G,Q_kN=Q,ULS_kN=ULS,
                    simple_transverse_M_kNm=member_M,
                    scaled_RC200_section_MR_kNm=section['MR']*(y1-y0)/1000,
                    section_scope='First-order strip bending only; end anchorage, edge torsion, wall/plate and return joints unqualified',
                    wall_reactions=ends))
 assert close(sum(e['vertical_ULS_kN'] for e in ends),ULS)
assert close(sum(x['area_m2'] for x in loggia),mode_area['loggia-transverse-end'])

# CW originally collects the two *axis* fields only. Trace that load once:
# east end to court-W, west end through the finite west return to south support
# and stair header. Additional SW strip mass is a separate increment and must
# re-enter the members' actual load cases rather than inherit their pass.
frame=struc['finite_floor_frame'];cw=next(c for c in frame['corner_collectors'] if c['id']=='CW')
ret=frame['west_return'];head=frame['stair_header']
assert close(cw['action']['V'],5.689453125)
assert close(ret['reactions'][1],ret['north_reaction'])
assert close(head['points'][0][0]-ret['north_reaction'],frame['long_trimmer']['reaction_envelope'][0])
sw_extra=sum(c['maximum_assumed_ULS_kN'] for c in cells if c['mode']=='SW-return-plate-and-collector')
return_span=(ret['y_supports'][1]-ret['y_supports'][0])/1000
patch_y=(3247.5+3917.5)/2
patch_a=(patch_y-ret['y_supports'][0])/1000
extra_north=sw_extra*patch_a/return_span;extra_south=sw_extra-extra_north
header_span=(head['x_supports'][1]-head['x_supports'][0])/1000
header_a=(ret['axis_x']-head['x_supports'][0])/1000
extra_header_e=extra_north*header_a/header_span
extra_header_w=extra_north-extra_header_e
assert close(extra_south+extra_header_w+extra_header_e,sw_extra)
assert close(extra_south*ret['y_supports'][0]+extra_north*ret['y_supports'][1],sw_extra*patch_y)
assert close(extra_header_w*head['x_supports'][0]+extra_header_e*head['x_supports'][1],extra_north*ret['axis_x'])
return_M_upper=ret['M']+sw_extra*return_span/4
header_M_upper=head['M']+extra_north*header_a*(header_span-header_a)/header_span
assert return_M_upper<ret['section']['MR'] and header_M_upper<head['section']['MR']
southwest=dict(source_axis_field_CW_end_reaction_kN=cw['action']['V'],
               CW_west_end_to_return_y3917p5_kN=cw['action']['V'],
               CW_east_end_to_courtW_kN=cw['action']['V'],
               west_return_existing_south_y2650_kN=ret['reactions'][0],
               west_return_existing_north_y4332p5_kN=ret['reactions'][1],
               header_existing_point_x2917p5_kN=head['points'][0][0],
               header_existing_W_E_reactions_kN=head['reactions'],
               residual_patch_area_m2=mode_area['SW-return-plate-and-collector'],
               residual_patch_RC_G_kN=mode_area['SW-return-plate-and-collector']*5,
               residual_patch_maximum_ULS_challenge_kN=sw_extra,
               supplemental_return_south_north_kN=[extra_south,extra_north],
               supplemental_header_W_E_kN=[extra_header_w,extra_header_e],
               revised_return_south_north_kN=[ret['reactions'][0]+extra_south,ret['reactions'][1]+extra_north],
               revised_header_W_E_kN=[head['reactions'][0]+extra_header_w,head['reactions'][1]+extra_header_e],
               return_M_conservative_additive_bound_kNm=return_M_upper,
               header_M_conservative_additive_bound_kNm=header_M_upper,
               existing_return_MR_kNm=ret['section']['MR'],existing_header_MR_kNm=head['section']['MR'],
               eccentric_strip_torsion_kNm=sw_extra*.05,
               chain='Residual patch to west return/CW then south support and header; header to outer-W/court-W warm lines, cold grid and actual supports',
               status='Incremental return/header static actions and conservative bending screen; existing CW axis-field reactions counted once. Torsion, plate anchorage, continuous joint and ground node remain unqualified.')

# Upper wall gross load over each lower opening is an adverse head-transfer
# challenge, not extra mass. Preserve first moment, actual pier-end coordinates
# and same-parent wall identity. A matching upper opening still needs its real
# spandrel/head weight in place of this gross trial.
def line(w):
 a,b=w['a'],w['b'];axis=0 if a[0]==b[0] else 1
 return axis,a[axis],min(a[1-axis],b[1-axis]),max(a[1-axis],b[1-axis])
opening_transfers=[]
for upper in had['upperWalls']:
 axis,datum,lo,hi=line(upper)
 row=next(w for w in join['upper_internal_wall_challenge']['rows'] if w['id']==upper['id'])
 q=row['line_ULS_kN_per_m']
 for ground in had['groundWalls']:
  if line(ground)[:2]!=(axis,datum):continue
  for a,b in ground['holes']:
   low=max(a,lo);high=min(b,hi)
   if high<=low:continue
   load=q*(high-low)/1000
   right=load*((low+high)/2-a)/(b-a);left=load-right
   assert close(left+right,load)
   assert close(left*a+right*b,load*(low+high)/2)
   opening_transfers.append(dict(upper=upper['id'],lower=ground['id'],hole=[a,b],
        overlap=[low,high],gross_head_challenge_kN=load,
        left_pier=[a,datum] if axis==1 else [datum,a],
        right_pier=[b,datum] if axis==1 else [datum,b],
        left_ground_route=near([a,datum] if axis==1 else [datum,a])[0],
        right_ground_route=near([b,datum] if axis==1 else [datum,b])[0],
        left_kN=left,right_kN=right,
        source_qualifier='Already within upper gross wall row; real opening/head/spandrel mass and arch thrust must replace this gross challenge'))
assert len(opening_transfers)==8

# A preferred *mechanism*, including its failure condition. Neither AAC nor
# ordinary mineral beds are credited as tensile/shear connectors under uplift.
warm=struc['lower_grid']['current_house_concept_join']
thermal=join['preferred_foundation']['authored_vertical_z']
corner_crossings=[]
for x in [300,11700]:
 for y in [300,11700]:
  assert any(n['xy']==[x,y] for n in struc['lower_grid']['actual_cap_nodes'])
  corner_crossings.append(dict(cold_grid_station=[x,y],
       nearest_inner_leaf_axis=[332.5 if x==300 else 11667.5,332.5 if y==300 else 11667.5],
       status='Candidate combined shear/tension crossing station only; old cap dimensions and capacity not inherited'))
unit_couple=join['lateral']['unit_boundary_couple_kN']
assert close(unit_couple,join['lateral']['roof_application_height_m']/join['lateral']['outer_axis_separation_m'])
result=dict(status='Inner-axis RC200 trial mass closed; exterior wall/cavity, members and site capacities remain open',
 sources=SOURCES,method='Exact x/y partition of B inner structural-axis rectangle outside three disjoint openings, then 16 axis fields and entrance bridge; every residual cell appears once',
 inner_axis_rectangle_mm=inner,exterior_shell_perimeter_band_m2=exterior_band_area,
 exterior_band_status='Not RC slab mass. Weather leaf/cavity/actual upper floor edge and support geometry remain separate.',
 gross_surface_m2=gross_slab_area,axis_fields_m2=join['axis_floor']['area_m2'],bridge_m2=join['entrance_bridge']['area_m2'],
 residual_m2=sum(mode_area.values()),residual_modes_m2=mode_area,cells=cells,
 RC200_mass=dict(physical_gross_slab_G_kN=gross_slab_RC_G,parent_axis_fields_G_kN=parent_axis_RC_G,
                 bridge_slab_RC_G_kN=join['entrance_bridge']['area_m2']*5,
                 bridge_slab_total_authored_G_kN=join['entrance_bridge']['slab_G_kN'],
                 bridge_member_top_already_counted_G_kN=already_counted_beam_top,
                 new_residual_RC_G_kN=additional_RC_G,
                 bridge_downstand_increment_G_kN=1.90125,
                 slab_plus_bridge_downstand_G_kN=gross_slab_RC_G+1.90125,
                 limit='Exact geometric RC200 volume under the continuous-trial assumption; ports/edge beams/actual arch cutouts and constructed thickness remain to adjust. No finish/live or wall mass silently included.'),
 maximum_surface_action=dict(inner_residual_all_8p5G_2Q_kN=sum(mode_area.values())*(1.35*8.5+1.5*2),
                              limit='Conditional trial on the inner-axis remainder, includes bridge member top already counted and is NOT a ceiling on unknown wall/cavity/ceiling/site loads; not an additive mass total. The prior 23.152m² shell residual was a deliberately broader bounding audit.'),
 loggia_transverse_edges=loggia,southwest_collector=southwest,upper_wall_opening_transfers=opening_transfers,
 selected_lateral_foundation_mechanism=dict(
   primary='Connected RC200 first-floor diaphragm and warm RC roof/window collector return signed H/uplift around void/court/loggia to selected inner-core RC boundary piers and paired orthogonal wall lines.',
   floor='Actual slab edge/corner/end strips and CW/return/header load into continuous warm RC ground grid; 215 mm rear-east wall and eight opened lower lines need independent head/pier joining before wall-line shares are credited.',
   thermal_interface_z=thermal,
   candidate_four_outer_corner_crossings=corner_crossings,
   symmetric_unit_H_sensitivity=dict(total_opposing_side_couple_kN_per_1kN_H=unit_couple,
       if_two_equal_corner_stations_each_kN=unit_couple/2,
       if_only_one_corner_station_kN=unit_couple,
       status='Equilibrium and sensitivity only. Real diaphragm/wall stiffness, torsion and individual site actions govern; no equal-share capacity credit.'),
   crossing='AAC and mineral DPC bear vertical compression only in this preliminary model. Localised designed shear/tension crossing at selected robust inner-core/grid nodes is REQUIRED for reversed H/uplift, with explicit MAT thermal/moisture/air/gas/fire source rewind and tested performance; no unqualified steel starter or friction credit.',
   cold='Connected cold RC grid distributes combined N/M/H/uplift to actual deep supports under G1 pre-site hypothesis, with independent weather leaf route; raft/piled raft remains a site challenger.',
   unit_global_lateral=join['lateral'],
   failed_control=['No AAC/DPC tensile or frictional shear path under no-favourable-G uplift',
                   'Old 400 pile joint and low ties/cage do not carry these loads',
                   'D1800 member-only depth does not cover lowest actual node plus heave/ventilation',
                   'SW and loggia end reactions cannot stop at nearest drawn cold centreline'],
   internal_next=['Select actual wall-line stiffness/distribution and finite diaphragm/chord/roof-corner joint forces',
                  'Design localised warm/cold crossing and its MAT source amendment, inspect thermal and DPC breach',
                  'Reanalyse SW collector/return/header with residual mass and combined wall/roof actions',
                  'Reconcile slab ports/arch cuts, first-floor edge top steel and permanent joint/temporary load paths'],
   later_acceptance=['Site wind/snow/seismic where applicable, soil/tree/water and pile group actions',
                     'Physical materials, fabrication, inspection, actual unit/connection ratings and competent acceptance']),
 no_house_or_foundation_pass=True)
text=json.dumps(result,indent=2,ensure_ascii=False)+'\n'
if '--check' in sys.argv:
 if OUT.read_text()!=text:raise SystemExit('stale physical-slab-join.json')
else:OUT.write_text(text)
print('physical slab join: 100.6602 m² inner-axis trial; 7.634225 residual; '
      f'{additional_RC_G:.3f} kN new RC G; south loggia end; eight opening transfers; no joint pass')
