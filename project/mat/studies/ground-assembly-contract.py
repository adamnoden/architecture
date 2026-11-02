#!/usr/bin/env python3
"""Development ground geometry contract derived once from HAD and STR sources."""
import hashlib,json,subprocess,sys
from pathlib import Path
R=Path(__file__).resolve().parents[3];O=Path(__file__).resolve().parent
pins={
 'project/had/studies/open-north-loggia.mjs':'92df870ae7ff8de65ea16566dda449cacc1c39b7',
 'project/had/studies/open-north-loggia.json':'25faad2c4d40df2b7da7212f73808843a88d2f52',
 'project/had/studies/open-north-facade-projection.json':'eb70d77ee57571088c4a73caa076681dc00590cd',
 'project/mat/studies/sw-corner-envelope.json':'e3655ddc0ba3369a433a482172cd6d636bad289b',
 'project/mat/studies/warm-receiving-grid.json':'a5bff9f37b8d78dfb32359427314b4013fe8a45e',
 'project/str/studies/sw-corner-station.json':'2c215912f4b55ca4587e32763bf66160d4b433d0',
 'project/str/studies/sw-grid-arm-join.json':'ee1d6cf0a4f27e5773ec37c83a8326f1caeddd1d'}
s={}
for p,want in pins.items():
 raw=(R/p).read_bytes(); got=hashlib.sha1(f'blob {len(raw)}\0'.encode()+raw).hexdigest()
 assert got==want and subprocess.check_output(['git','rev-parse','HEAD:'+p],cwd=R,text=True).strip()==want,p
 if p.endswith('.json'):s[p]=json.loads(raw)
h=s['project/had/studies/open-north-loggia.json'];fac=s['project/had/studies/open-north-facade-projection.json'];mat=s['project/mat/studies/sw-corner-envelope.json'];recipe=s['project/mat/studies/warm-receiving-grid.json']['recipe'];st=s['project/str/studies/sw-corner-station.json'];arms=s['project/str/studies/sw-grid-arm-join.json']
assert h['selection']['identity']==fac['selectedHAD']==mat['occurrence']['selectedHAD']
assert fac['courtSouth']['ground']['finishedFaces']==[3820.5,4250]
assert h['sections']['groundFloorRC']=={'top':-180,'bottom':-380}
assert mat['occurrence']['ordinaryPerpendicularLayers_mm'][2]==['bare glass',152.5,262.5]
q=mat['occurrence']['ordinaryPerpendicularLayers_mm'][2][2]
shell=h['shell'];cx,cy,cw,ch=h['court'];assert (shell,cx,cy,cw,ch)==(12000,4250,4250,3500,3500)
west=next(x for x in h['groundWalls'] if x['id']=='loggia-west-weather');east=next(x for x in h['groundWalls'] if x['id']=='loggia-east-weather')
outer=[q,q,shell-q,shell-q];court=[cx-q,cy-q,cx+cw+q,cy+ch+q];notch=[west['structuralCore'][1],court[3],east['structuralCore'][0],outer[3]]
assert (outer,court,notch)==([262.5,262.5,11737.5,11737.5],[3987.5,3987.5,8012.5,8012.5],[4447.5,8012.5,7552.5,11737.5])
area=lambda r:(r[2]-r[0])*(r[3]-r[1])/1e6
slab_area=area(outer)-area(court)-area(notch);assert abs(slab_area-103.908875)<1e-9
slabz=[h['sections']['groundFloorRC']['bottom'],h['sections']['groundFloorRC']['top']]
pad=st['trial_pier']['pier_bounds_mm'];padz=mat['vertical']['warmRC'];assert pad==mat['plan']['warmPadXY']==[262.5,262.5,562.5,562.5] and padz==[-380,-80]
assert pad[0]>=outer[0] and pad[1]>=outer[1] and pad[2]<court[0] and pad[3]<court[1]
pad_area=area(pad);shared=pad_area*(slabz[1]-slabz[0])/1000;upstand=pad_area*(padz[1]-slabz[1])/1000
assert abs(shared-.018)<1e-12 and abs(upstand-.009)<1e-12
cold=st['cold_cage_candidate'];assert cold['node_xy_mm']==[-50,-50,777,777] and cold['node_z_mm']==[-1257,-765]
assert arms['source_nodes']['SW']==[300,300] and arms['source_nodes']['east']==[3150,300] and arms['source_nodes']['north']==[300,3150]
assert arms['comparison']['local_arm_width_mm']==600 and arms['comparison']['local_new_z_mm']==[-1257,-765]
assert arms['comparison']['constant_depth_to_mm']==3450 and arms['comparison']['late_transition_mm']==[3450,4450] and arms['repair']['taper_vertical_transition_mm']==[2050,3050]
door=next(x for x in fac['courtSouth']['ground']['openings'] if x['id']=='grand-court-entry-south')
assert door['centre']==6000 and door['width']==1800
out={'interface':'MAT ground assembly development geometry, version 1','sources_git_blobs':pins,'selection':h['selection']['identity'],'coordinate_convention':'x east, y north, z up, mm; ground FFL 0','authority':'Preferred geometric development proposal derived from selected enclosure; the source HAD scene does not itself author a ground slab polygon. Coordinates are not structural, material, site or physical acceptance.',
 'slab':{'z_mm':slabz,'plan_definition':{'outer_rectangle_mm':outer,'excluded_court_rectangle_mm':court,'excluded_loggia_rectangle_mm':notch},'gross_plan_area_m2':slab_area,'gross_RC200_volume_m3':slab_area*(slabz[1]-slabz[0])/1000,'scope':'Gross conditional bounding footprint. Thresholds, openings, penetrations, cast splits, edge support, reinforcement, service boxes and as-built extents remain unassigned; not a construction takeoff.'},
 'SW_warm_pad':{'xy_mm':pad,'z_mm':padz,'plan_area_m2':pad_area,'shared_RC200_volume_m3_if_monolithic':shared,'upstand_above_slab_m3_if_monolithic':upstand,'upstand_height_mm':padz[1]-slabz[1],'top_below_FFL_mm':-padz[1],'scope':'Merged STR candidate at one location; union arithmetic only. Continuous reinforcement, pad/slab contact, floor build-up, field and all capacities remain open.'},
 'SW_cold_interface':{'node_xy_mm':cold['node_xy_mm'],'node_z_mm':cold['node_z_mm'],'arm_width_mm':arms['comparison']['local_arm_width_mm'],'arm_local_z_mm':arms['comparison']['local_new_z_mm'],'source_axes_mm':arms['source_nodes'],'preferred_constant_depth_to_axis_mm':arms['comparison']['constant_depth_to_mm'],'preferred_late_transition_axis_mm':arms['comparison']['late_transition_mm'],'rejected_early_transition_comparator_axis_mm':arms['repair']['taper_vertical_transition_mm'],'scope':'Merged STR development challenger, not site-foundation acceptance or a whole-house cold network. No insulation/bearing, tie, drainage or capacity is inferred.'},
 'threshold':{'court_south_rough_x_mm':[door['centre']-door['width']/2,door['centre']+door['width']/2],'slab_control_edge_y_mm':court[1],'weather_face_y_mm':h['court'][1],'intervening_mm':h['court'][1]-court[1],'status':'Unassigned; the slab boundary does not define sill, frame, support or weather connection.'},
 'prior_comparators':{'MAT_old_floor_z_mm':recipe['floorZ'],'historical_grid':'The older -180..-630 lower-grid and -750 nodes are a separate conditional comparator, not the preferred present network.','prior_first_floor_projection':'The former 230×230 mm SW projection was a conditional first-floor proxy; this explicit core-face candidate contains the 300×300 pad, without retroactively authoring the HAD ground slab.'},
 'unassigned':['All warm receivers beyond the single SW pad, including court-S and entrance nodes','Ground slab actual edge, structural reinforcement and all opening/penetration details','Whole-house cold routes, soil and site conditions','Thermal, DPC, capillary, water, gas and air continuity','Movement, construction, inspection, repair and all structural/material/site acceptance']}
svg=f'''<svg xmlns="http://www.w3.org/2000/svg" width="1040" height="900" viewBox="0 0 1040 900"><rect width="100%" height="100%" fill="white"/><g font-family="sans-serif"><text x="25" y="30" font-size="20">Ground assembly: preferred development footprint</text><text x="25" y="54" font-size="13">Derived from selected enclosure; slab edge, bearing, thresholds and receiver network remain unqualified</text><path d="M116 128 H804 V816 H116 Z M339.5 351.5 H581 V593 H339.5 Z M367 128 H554 V351.5 H367 Z" fill="#dce9f6" fill-rule="evenodd" stroke="#325a80" stroke-width="2"/><rect x="116" y="798" width="18" height="18" fill="#bc554f"/><text x="830" y="190" font-size="14">RC200 trial</text><text x="830" y="212" font-size="14">−380..−180</text><text x="830" y="260" font-size="14">SW pad</text><text x="830" y="282" font-size="14">−380..−80</text><text x="830" y="330" font-size="14">Court and</text><text x="830" y="352" font-size="14">loggia excluded</text><text x="25" y="865" font-size="14" fill="#a01818">Plan is a coordinate proposal, not an already-authored HAD slab or an accepted foundation.</text></g></svg>\n'''
outputs={O/'ground-assembly-contract.json':json.dumps(out,indent=2)+'\n',O/'ground-assembly-contract.svg':svg}
if '--check' in sys.argv:
 for p,v in outputs.items():assert p.read_text()==v,p
 print('Ground assembly contract: outputs reproduce')
else:
 for p,v in outputs.items():p.write_text(v)
 print('Wrote source-bound ground assembly contract and plan')
