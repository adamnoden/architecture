#!/usr/bin/env python3
"""One joined geometry/renewal screen; no hydraulic or structural certification."""
import hashlib,json,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
HERE=Path(__file__).resolve().parent
src=json.loads((HERE/'east-dry-bridge-envelope.json').read_text())
raw=(ROOT/src['base_had_path']).read_bytes()
assert hashlib.sha1(f'blob {len(raw)}\0'.encode()+raw).hexdigest()==src['base_had_blob']
had=json.loads(raw);g=src['geometry_mm']
assert had['court']==[4250,4250,3500,3500]
spine=next(w for w in had['groundWalls'] if w['id']=='service-spine')
assert spine['finishedFaces'][0]==g['dry_gallery_east_warm_face']
assert had['sections']['groundFloorRC']=={'top':-180,'bottom':-380}
assert [x[1] for x in g['floor_layers']]==[15,65,100,200]
bridge=[g['court_east'],g['dry_gallery_east_warm_face']+g['new_weather_wall_depth']]
body=[bridge[0]-g['joint_setback'],bridge[1]+g['joint_setback']]
length=body[1]-body[0]
bed=lambda x:g['bed_control_z'][0]+(x-g['bed_control_x'][0])*(g['bed_control_z'][1]-g['bed_control_z'][0])/(g['bed_control_x'][1]-g['bed_control_x'][0])
width=g['water_y'][1]-g['water_y'][0]
ugross=width+2*g['liner_sheet']+2*g['outward_flange_each']
carriage=ugross+2*g['carriage_extra_width_each']
portal=g['portal_y'][1]-g['portal_y'][0]
assert (width,ugross,carriage,portal)==(600,663,763,900)
west=[body[0]-length,body[0]];east=[body[1],body[1]+length]
beam=g['local_beam_top']-g['local_beam_depth']
rim=[bed(x)+g['water_body_depth'] for x in body]
lowest=[bed(x)-g['carriage_total_below_bed'] for x in body]
soilallow=g['soil_heave_stress']+g['construction_loss']+g['residual_ventilation_comparison']
out={'identity':src['identity'],'status':src['status'],'base_had_blob':src['base_had_blob'],
 'bridge_x_mm':bridge,'liner_body_x_mm':body,'liner_length_mm':length,'bed_body_ends_mm':[bed(x) for x in body],
 'liner_rim_ends_mm':rim,'carriage_bottom_ends_mm':lowest,'water_clear_width_mm':width,'liner_gross_width_mm':ugross,
 'carriage_budget_width_mm':carriage,'portal_clear_width_mm':portal,'lateral_portal_remainder_each_mm':(portal-carriage)/2,
 'floor_depth_mm':sum(x[1] for x in g['floor_layers']),'field_soffit_mm':-sum(x[1] for x in g['floor_layers']),
 'local_trial_beam_soffit_mm':beam,'minimum_gross_rim_to_beam_mm':beam-max(rim),
 'rejected_200_deep_body_overlap_mm':max(bed(x)+200 for x in body)-beam,
 'west_park_x_mm':west,'east_park_x_mm':east,'east_remaining_to_12000_mm':12000-east[1],
 'west_park_area_m2':length*portal/1e6,'translation_rise_west_mm':bed(west[0])-bed(body[0]),
 'empty_liner_sheet_mass_screen_kg':(width+2*g['water_body_depth']+2*g['outward_flange_each'])*length*g['liner_sheet']*8000/1e9,
 'full_100mm_prismatic_water_volume_litres':width*g['water_body_depth']*length/1e6,
 'underbridge_local_D_lower_bound_mm':-min(lowest)+soilallow,
 'whole_route_local_D_lower_bound_mm':-g['bed_control_z'][1]+g['carriage_total_below_bed']+soilallow,
 'hypothetical_uniform_solum_D_if_prior_SW_node_retained_mm':1257+soilallow,
 'first_wetting':{'liner_overtop':'Geometric rim only, not an operating/admitted water level','beam':'Trial underside -630 can wet if surrounding water reaches it; wet-tolerant concrete is not necessarily first vulnerable fabric','first_harm':'Unknown: actual threshold, wall/air joints, cracks, penetrations and support interfaces must be located'},
 'rejections':['200-deep body clashes with the 450-deep beam trial','East-only park has 5 mm residual and no standing/hoist territory','30 mm prelift cannot be credited with clearing a 150 mm-deep backing carriage','No actual foundation/soil, qualified complete air/gas barrier, hydraulic capacity or lifting pass']}
assert west[0]>=4250 and west[1]<=7750
assert out['east_remaining_to_12000_mm']==5
assert out['minimum_gross_rim_to_beam_mm']>0 and out['rejected_200_deep_body_overlap_mm']>0
# One section and plan use the same source numbers. Deliberately no physical scale claim.
svg=['<svg xmlns="http://www.w3.org/2000/svg" width="1120" height="980" viewBox="0 0 1120 980"><rect width="100%" height="100%" fill="white"/><g font-family="sans-serif" font-size="14" fill="#17242e">']
def text(x,y,t,size=14,color='#17242e'):
 svg.append(f'<text x="{x}" y="{y}" font-size="{size}" fill="{color}">{t}</text>')
def rect(x,y,w,h,fill,stroke='#334c60'):
 svg.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{fill}" stroke="{stroke}"/>')
X=lambda x:70+(x-4250)*.12
Z=lambda z:100-z*.22
text(30,30,'East dry bridge B: permanent floor, exterior renewable water body',22)
text(30,54,'Unadopted feasibility hypothesis; gross territories are not qualified products or capacities',14,'#a12b23')
colors=['#e9d6b5','#cecabd','#b3dfd8','#c4c8cc'];z=0
for (name,d),c in zip(g['floor_layers'],colors):
 rect(X(bridge[0]),Z(z),.12*(bridge[1]-bridge[0]),d*.22,c);z-=d
rect(X(bridge[0]),Z(-180),.12*(bridge[1]-bridge[0]),450*.22,'none')
text(X(bridge[0])+4,90,'15 / 65 / 100 / RC200; FFL 0',13)
text(30,208,'Field soffit -380; separate local beam trial reaches -630',14)
for a,b,fill in [(body[0],body[1],'#67a8d5'),(west[0],west[1],'#bfe3ee')]:
 pts=[(X(a),Z(bed(a)+100)),(X(b),Z(bed(b)+100)),(X(b),Z(bed(b)-150)),(X(a),Z(bed(a)-150))]
 svg.append('<polygon points="'+' '.join(f'{x},{y}' for x,y in pts)+f'" fill="{fill}" fill-opacity=".55" stroke="#145c83"/>')
svg.append(f'<path d="M{X(7750)} {Z(-800)} L{X(12000)} {Z(-850)}" fill="none" stroke="#145c83" stroke-width="3"/>')
text(30,348,'Blue includes 100-high U and full 150-below-bed backing budget; west park is a separate state',13)
svg.append(f'<path d="M{X(4250)} {Z(-1500)} H{X(12000)}" stroke="#a12b23" stroke-dasharray="8 5"/>')
text(30,455,'-1500 route-local solum comparison only: actual supports / other nodes can govern deeper',14,'#a12b23')
text(30,490,'Plan: chosen west withdrawal, not an east-only handling claim',18)
Y=lambda y:520+(y-4250)*.1
rect(X(4250),Y(4250),3500*.12,3500*.1,'#f6f0e2')
rect(X(bridge[0]),Y(6450),(bridge[1]-bridge[0])*.12,900*.1,'#d2d7dc')
rect(X(9722.5),Y(6300),(12000-9722.5)*.12,1200*.1,'#e1edd6')
rect(X(body[0]),Y(6600),length*.12,600*.1,'#67a8d5')
rect(X(west[0]),Y(6450),length*.12,900*.1,'none','#a12b23')
text(X(west[0])+4,Y(6450)-12,'2172.5 x 900 opened outdoor court park',13,'#a12b23')
text(X(bridge[0])+4,Y(6450)-12,'Dry floor above / 900 gross portal below',13)
text(30,906,'First wetting: U rim about -699 upstream; beam underside -630 is a different boundary.',14)
text(30,931,'First vulnerable fabric, inlet/receiver capture, rail release, operator/hoist and temporary bypass remain open.',14,'#a12b23')
text(30,956,'No room hatch, custom gas lid, 200-deep hidden U, free D1300 or east-stage clearance is credited.',14)
svg.append('</g></svg>\n')
outputs={HERE/'east-dry-bridge-envelope.results.json':json.dumps(out,indent=2)+'\n',HERE/'east-dry-bridge-envelope.svg':'\n'.join(svg)}
if '--check' in sys.argv:
 for p,v in outputs.items():assert p.read_text()==v,p
 print('East dry bridge B: source-bound outputs and envelope checks reproduce')
else:
 for p,v in outputs.items():p.write_text(v)
 print('Wrote east dry bridge B section, plan and explicit limits')
