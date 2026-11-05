#!/usr/bin/env python3
"""MAT layer/renewal envelope proof, consuming the actual HAD successor."""
import hashlib,json,sys
from pathlib import Path
R=Path(__file__).resolve().parents[3];O=Path(__file__).resolve().parent
s=json.loads((O/'east-dry-bridge-envelope.json').read_text())
blob=lambda b:hashlib.sha1(f'blob {len(b)}\0'.encode()+b).hexdigest()
base=(R/s['base_had_path']).read_bytes();assert blob(base)==s['base_had_blob']
raw=(R/s['joined_had_path']).read_bytes();h=json.loads(raw)
assert h['sources']['had']['blob']==s['base_had_blob']
p,b,n,d=h['passage'],h['bridge'],h['renewal'],h['groundEnvelope'];a=s['assembly_mm']
assert [q[1] for q in b['floorLayers']]==a['supported_floor_layer_depths']
assert b['slabZ']==[-380,-180] and n['selectedWithdrawal']=='EAST'
bed=lambda x:p['bedEnds'][0][1]+(x-p['bedEnds'][0][0])*(p['bedEnds'][1][1]-p['bedEnds'][0][1])/(p['bedEnds'][1][0]-p['bedEnds'][0][0])
support_raw=(R/s['retained_outer_support_reference_path']).read_bytes();support_ref=json.loads(support_raw)
outer=next(q for q in support_ref['foundation_routes'] if q['id']=='outer-east')
body=n['bodyX'];L=body[1]-body[0];park=n['selectedParkX'];beam=b['localSupportBeamZ'][0]
assert L==n['length']==park[1]-park[0] and park[0]-body[0]==n['withdrawalTranslation']
width=n['waterClearWidth'];depth=n['waterDepth']
ugross=width+2*a['liner_sheet']+2*a['outward_flange_each'];carriage=ugross+2*a['carriage_extra_width_each']
assert (ugross,carriage,a['carriage_total_below_bed'])==(n['wetBodyGrossWidth'],n['carriageWidthBudget'],n['carriageBelowBedBudget'])
beams=[[x-w/2,x+w/2] for x,w in zip(b['supportAxesX'],b['localSupportBeamWidths'])]
weather=h['model']['weather'];faces=[b['newEastWeatherWallX'][0]]
for _,th in weather['layersRoomToWeather']:faces.append(faces[-1]+th)
assert faces[-1]==b['newEastWeatherWallX'][1] and weather['total']==faces[-1]-faces[0]
glass_i=next(i for i,q in enumerate(weather['layersRoomToWeather']) if q[0]=='bareCellularGlass')
thermal_gap=faces[glass_i]-b['permanentDryGalleryClearX'][1]
assert thermal_gap>0,'Reassess the actual floor/wall thermal junction'
walls=[[b['coveredX'][0],b['permanentDryGalleryClearX'][0]],b['newEastWeatherWallX']]
assert b['permanentDryGalleryClearX'][0]>=walls[0][1] and b['permanentDryGalleryClearX'][1]<=walls[1][0],'Occupied floor layers overlap bearing wall territory'
bearing=[[wall[0]-q[0],q[1]-wall[1]] for wall,q in zip(walls,beams)]
assert min(v for q in bearing for v in q)>=0,'Unsupported complete wall/outer weather leaf'
portal=p['structuralClearY'];assert portal[1]-portal[0]>=carriage
assert n['withdrawalTrackClearY']==portal
bottom=lambda x:bed(x)-a['carriage_total_below_bed']
track=lambda x:bottom(x)-n['fixedTrackBelowCarriageBudget']
clearance=park[0]-max(q[1] for q in beams);assert clearance>0,'Hoist park still under a fixed support'
rim=[bed(x)+depth for x in body];assert beam>max(rim)
plat=n['servicePlatform'];op=n['operatorField'];box=n['hoistWorkingBox'];cy=sum(p['waterClear'][1:2])+width/2
contains=lambda outer,inner:outer[0]<=inner[0] and outer[1]<=inner[1] and inner[0]+inner[2]<=outer[0]+outer[2] and inner[1]+inner[3]<=outer[1]+outer[3]
overlap=lambda q,t:q[0]<t[0]+t[2] and q[0]+q[2]>t[0] and q[1]<t[1]+t[3] and q[1]+q[3]>t[1]
parkplan=[park[0],cy-carriage/2,L,carriage]
trackplan=[plat[0],portal[0],n['withdrawalTrackEndX']-plat[0],portal[1]-portal[0]]
assert contains(plat,trackplan) and contains(plat,op) and contains(trackplan,parkplan)
assert not overlap(op,trackplan),'Operator deck intersects the low withdrawal solid'
assert n['fixedTrackBelowCarriageBudget']>0
assert abs(track(park[1])-n['withdrawalTrackEndLowestZ'])<1e-8
assert contains([box[0],box[1],box[3],box[4]],parkplan)
assert min(bottom(x)+n['hoistLiftTranslation'] for x in park)>n['operatorDeckZ']
# Below-deck lift is contained by the open track, above-deck lift by the hoist box.
assert cy-carriage/2>=portal[0] and cy+carriage/2<=portal[1]
assert max(bed(x)+depth+n['hoistLiftTranslation'] for x in park)<box[2]+box[5]
well=n['courtIntakeWell'];shield=n['shield'];stand=n['courtIntakeOperatorPlatform']
assert contains(well,shield['plan']) and contains(well,stand)
assert stand[0]+stand[2]<=shield['plan'][0] and shield['plan'][0]+shield['plan'][2]<=body[0]
shaft=shield['clearGravityShaft'];outlet=shield['clearOutlet'];collector=n['courtCollector']
node_clashes=[]
for nx in b['supportAxesX']:
 for ny in b['supportAxesY']:
  np=[nx-b['supportNodes']['plan'][0]/2,ny-b['supportNodes']['plan'][1]/2,*b['supportNodes']['plan']]
  if overlap(well,np) and min(b['supportNodes']['z'][1],shield['z'][1])>max(b['supportNodes']['z'][0],n['courtIntakeWellFloorZ']):
   node_clashes.append({'node_axis':[nx,ny],'intersection_x':[max(well[0],np[0]),min(well[0]+well[2],np[0]+np[2])],'intersection_y':[max(well[1],np[1]),min(well[1]+well[3],np[1]+np[3])]})
if h['model']['wholeHouseFit']['pass']:assert not node_clashes,'Selected house retains intake well/support collision'
wl=h['model']['sections']['waterLevels'];court=h['model']['court']
landing_end=court[1]+wl['landingRun'];north_y=court[1]+court[3]
court_z=lambda y:wl['southLandingStart']-wl['landingDrop']+(y-landing_end)*(wl['courtNorth']-(wl['southLandingStart']-wl['landingDrop']))/(north_y-landing_end)
steps=n['courtIntakeAccess'];stepplan=steps['fixedSteps']
assert contains(well,stepplan) and not overlap(stepplan,stand)
assert stepplan[0]+stepplan[2]==stand[0] and stand[1]<=stepplan[1] and stepplan[1]+stepplan[3]<=stand[1]+stand[3]
assert steps['rises']*steps['riseMaximum']==steps['topLandingZ']-steps['lowerLandingZ']
assert steps['going']*(steps['rises']-1)==stepplan[2]
assert contains(n['guardOuterPlan'],well) and contains(n['guardOuterPlan'],shield['plan'])
assert not overlap(stand,shield['plan'])
access={'stair_run_mm':stepplan[2],'stair_rises':steps['rises'],'stair_rise_mm':steps['riseMaximum'],'platform_to_hood_gap_mm':shield['plan'][0]-(stand[0]+stand[2]),
 'top_adapter_to_local_court_mm':[steps['topLandingZ']-court_z(y) for y in [stepplan[1],stepplan[1]+stepplan[3]]],
 'gate_and_hardware_status':'West guard gate and actual posts/handholds/capture/adapter still need complete coordinates; no physical release acceptance',
 'boundary_status':'Well end shares x7650 beam/node face; zero gross reserve requires actual lining/support/joint resolution'}
well_north_z=court_z(well[1]+well[3]);collector_north_z=court_z(collector['plan'][1]+collector['plan'][3])
activation={'scope':'Effective-crest lower-bound screen only; stage uses declared 600-wide ideal head, not an earned inlet stage or universal hydraulic bound; actual cut/cover/lip and first harm remain open',
 'court_floor_at_well_north_mm':well_north_z,'court_floor_at_collector_north_mm':collector_north_z,
 'declared_crest_mm':h['hydraulicProbe']['independentCourtCrestTrialZ'],
 'direct_well_effective_crest_lower_bound_mm':max(well_north_z,h['hydraulicProbe']['independentCourtCrestTrialZ']),
 'collector_effective_crest_conditional_lower_bound_mm':max(collector_north_z,collector['northSurfaceLipZ']),
 'collector_north_plan_width_mm':collector['plan'][2],'declared_ideal_width_assumption_mm':h['hydraulicProbe']['effectiveWidthM']*1000,'ideal_head_screen_mm':h['hydraulicProbe']['idealBroadCrestHeadMm'],'qualified_first_harm_margin_mm':None}
for label,key in [('direct_well','direct_well_effective_crest_lower_bound_mm'),('collector_conditional','collector_effective_crest_conditional_lower_bound_mm')]:
 stage=activation[key]+activation['ideal_head_screen_mm'];activation[label+'_stage_at_declared_ideal_head_mm']=stage
 activation[label+'_margin_to_north_loggia_floor_mm']=wl['courtNorth']-stage

assert 'ENVELOPE' in shield['representation']
assert contains(shield['plan'],shaft['plan']) and contains(collector['plan'],shaft['plan'])
assert shaft['plan'][0]+shaft['plan'][2]==outlet['planeX']==body[0]
assert [shaft['plan'][1],shaft['plan'][1]+shaft['plan'][3]]==outlet['y']==[p['waterClear'][1],p['waterClear'][1]+width]
assert abs(shaft['z'][0]-bed(body[0]))<1e-8
assert all(abs(z-v)<1e-8 for z,v in zip(outlet['z'],[bed(body[0]),bed(body[0])+depth]))
assert shaft['z'][1]>=collector['lowChannelAtIntakeZ']>shaft['z'][0]
assert body[0]<=min(q[0] for q in beams)-100 and body[1]>=max(q[1] for q in beams)+100
# Existing support nodes are outside the entire 900-wide gross portal.
nodehalf=b['supportNodes']['plan'][1]/2
assert b['supportAxesY'][0]+nodehalf<portal[0] and b['supportAxesY'][1]-nodehalf>portal[1]
low=min(track(park[1]),min(bottom(x) for x in body),b['supportNodes']['z'][0],n['courtIntakeWellFloorZ'])
allow=d['heaveStress']+d['constructionLoss']+d['ventilationReserve'];D=-low+allow
assert d['routeLocalDTrial']>=D
oldwest=[7650-2172.5,7650];oldeast=[9822.5,11995]
out={'identity':s['identity'],'status':s['status'],'HAD_source':{'path':s['joined_had_path'],'blob':blob(raw),'declaredStatus':h['status']},
 'east_weather_layer_faces_mm':faces,'occupied_floor_clear_x_mm':b['permanentDryGalleryClearX'],'floor_glass_to_wall_glass_horizontal_gap_mm':thermal_gap,
 'body_x_mm':body,'length_mm':L,'bridge_beam_ranges_mm':beams,'complete_wall_bearing_margins_mm':bearing,
 'gross_liner_width_mm':ugross,'whole_carriage_width_mm':carriage,'gross_portal_width_mm':portal[1]-portal[0],
 'lateral_remainder_each_mm':((portal[1]-portal[0])-carriage)/2,'body_rim_ends_mm':rim,
 'minimum_gross_rim_to_beam_mm':beam-max(rim),'rejected_200_deep_body_overlap_mm':max(bed(x)+200 for x in body)-beam,
 'body_carriage_bottom_mm':[bottom(x) for x in body],'outer_support_reference':{'path':s['retained_outer_support_reference_path'],'blob':blob(support_raw),'reserved_axis_x_mm':outer['a'][0],'role':outer['role'],'park_straddles_reserved_line':park[0]<outer['a'][0]<park[1],'clear_profile_bound':False,'scope':'Historical continuous common-support reservation, not an adopted member size. Actual outer support/threshold and complete hoist sweep must join before acceptance.'},
 'selected_park_x_mm':park,'new_bridge_beam_to_hoist_park_mm':clearance,
 'translation_mm':n['withdrawalTranslation'],'translation_z_mm':bed(park[0])-bed(body[0]),
 'park_carriage_bottom_mm':[bottom(x) for x in park],'operator_deck_z_mm':n['operatorDeckZ'],
 'rejected_solid_deck_overlap_mm':n['operatorDeckZ']-min(bottom(x) for x in park),
 'fixed_track_bottom_mm':[track(x) for x in park],'complete_local_lowest_surface_mm':low,
 'complete_local_D_lower_bound_mm':D,'HAD_D_trial_mm':d['routeLocalDTrial'],'trial_residual_over_lower_bound_mm':d['routeLocalDTrial']-D,
 'sheet_only_mass_screen_kg':(width+2*depth+2*a['outward_flange_each'])*L*a['liner_sheet']*8000/1e9,
 'full_depth_prismatic_water_litres':width*depth*L/1e6,'court_intake_well':well,'shield_release':'Upward in isolated guarded well, outside beam; does not travel through the portal',
 'intake_access_check':access,'intake_support_collisions':node_clashes,'surface_activation_probe':activation,
 'intake_flow_void':{'representation':shield['representation'],'shaft':shaft,'outlet':outlet,'result':'Connected geometric clear void only; no loss/splash/capacity rating'},
 'historical_rejected_west_park':oldwest,'historical_west_actual_beam_clearance_mm':min(q[0] for q in beams)-oldwest[1],
 'historical_rejected_east_shell_park':oldeast,'historical_east_shell_remaining_mm':12000-oldeast[1],
 'envelope_result':('FAIL: intake well intersects fixed support nodes' if node_clashes else 'Listed local bridge/carriage checks pass; retained outer support/hoist join UNBOUND'),
 'first_wetting':'U rim is overtop geometry, not safe stage. Inlet drop/splash can wet a beam/air joint before bulk overtop; actual shield/end transfer needs water testing.',
 'limits':['No structural capacity, complete material, air/gas, hydraulic, first-harm, lifting or real-site acceptance','Rail/keeper/joint/rigging/guard/step hardware must fit actual territories','D1600 is route-local; other real supports or site conditions can govern deeper']}
svg=['<svg xmlns="http://www.w3.org/2000/svg" width="1180" height="1920" viewBox="0 0 1180 1920"><rect width="100%" height="100%" fill="white"/><g font-family="sans-serif" font-size="14" fill="#17242e">']
def text(x,y,t,size=14,c='#17242e'):svg.append(f'<text x="{x}" y="{y}" font-size="{size}" fill="{c}">{t}</text>')
def rect(x,y,w,ht,fill,stroke='#334c60'):svg.append(f'<rect x="{x}" y="{y}" width="{w}" height="{ht}" fill="{fill}" stroke="{stroke}"/>')
XMIN=min(court[0],well[0],plat[0]);XMAX=max(court[0]+court[2],plat[0]+plat[2],park[1]);SX=1050/(XMAX-XMIN)
YMIN=min(court[1],plat[1],well[1]);YMAX=max(court[1]+court[3],plat[1]+plat[3],max(b['supportAxesY'])+nodehalf);SY=360/(YMAX-YMIN)
X=lambda x:60+(x-XMIN)*SX;Z=lambda z:100-z*.20;Y=lambda y:540+(y-YMIN)*SY
text(30,30,'East dry bridge: actual HAD floor, supports and whole-carriage renewal',22)
text(30,55,'Unadopted development envelope; no qualified products, technical acceptance or actual plot',14,'#a12b23')
z=0
for (_,th),c in zip(b['floorLayers'],['#e9d6b5','#cecabd','#b3dfd8','#c4c8cc']):
 rect(X(b['permanentDryGalleryClearX'][0]),Z(z),.111*(b['permanentDryGalleryClearX'][1]-b['permanentDryGalleryClearX'][0]),th*.2,c);z-=th
for lo,hi in beams:rect(X(lo),Z(b['localSupportBeamZ'][1]),(hi-lo)*SX,(b['localSupportBeamZ'][1]-beam)*.2,'none')
text(30,205,'RC200 field ends at -380; actual 600 / 900 crossing beams reach -630',14)
for (lo,hi),c in [(body,'#67a8d5'),(park,'#c6e0cc')]:
 pts=[(X(lo),Z(bed(lo)+depth)),(X(hi),Z(bed(hi)+depth)),(X(hi),Z(bottom(hi))),(X(lo),Z(bottom(lo)))]
 svg.append('<polygon points="'+' '.join(f'{x},{y}' for x,y in pts)+f'" fill="{c}" stroke="#145c83"/>')
svg.append(f'<path d="M{X(plat[0])} {Z(n["operatorDeckZ"])} H{X(plat[0]+plat[2])}" stroke="#8f6354" stroke-dasharray="5 4"/>')
svg.append(f'<path d="M{X(park[0])} {Z(track(park[0]))} L{X(park[1])} {Z(track(park[1]))}" stroke="#a12b23" stroke-width="2"/>')
svg.append(f'<path d="M{X(outer["a"][0])} 130 V320" stroke="#a12b23" stroke-dasharray="4 4"/>')
text(30,385,f'Retained support reservation x{outer["a"][0]:g} crosses the park: actual profile / full hoist clearance UNBOUND.',13,'#a12b23')
text(30,350,'Blue: installed body/backing. Green: separate east park. Brown: operator deck outside the depressed track.',13)
svg.append(f'<path d="M60 {Z(-d["routeLocalDTrial"])} H1110" stroke="#a12b23" stroke-dasharray="8 5"/>')
text(30,455,f'Lowest fixed track {low:.3f}; local D{d["routeLocalDTrial"]} trial has {d["routeLocalDTrial"]-D:.3f} over the stated stresses',14,'#a12b23')
text(30,495,'Plan: actual beam faces, guarded intake and new outboard site work field',18)
rect(X(court[0]),Y(court[1]),court[2]*SX,court[3]*SY,'#f6f0e2')
rect(X(b['coveredX'][0]),Y(portal[0]),(b['coveredX'][1]-b['coveredX'][0])*SX,(portal[1]-portal[0])*SY,'#d2d7dc')
rect(X(plat[0]),Y(plat[1]),plat[2]*SX,plat[3]*SY,'#f1e9dd')
rect(X(trackplan[0]),Y(trackplan[1]),trackplan[2]*SX,trackplan[3]*SY,'#dae7df')
rect(X(body[0]),Y(p['waterClear'][1]),L*SX,width*SY,'#67a8d5')
rect(X(park[0]),Y(portal[0]),L*SX,(portal[1]-portal[0])*SY,'none','#a12b23')
rect(X(op[0]),Y(op[1]),op[2]*SX,op[3]*SY,'#f3dca8')
for nx in b['supportAxesX']:
 for ny in b['supportAxesY']:
  nw,nh=b['supportNodes']['plan'];rect(X(nx-nw/2),Y(ny-nh/2),nw*SX,nh*SY,'none','#654331')
for clash in node_clashes:
 q,t=clash['intersection_x'],clash['intersection_y'];rect(X(q[0]),Y(t[0]),(q[1]-q[0])*SX,(t[1]-t[0])*SY,'#bd342c')
rect(X(well[0]),Y(well[1]),well[2]*SX,well[3]*SY,'none','#a12b23')
rect(X(stepplan[0]),Y(stepplan[1]),stepplan[2]*SX,stepplan[3]*SY,'#d2b58c')
rect(X(stand[0]),Y(stand[1]),stand[2]*SX,stand[3]*SY,'#c6e0cc')
q=shield['plan'];rect(X(q[0]),Y(q[1]),q[2]*SX,q[3]*SY,'#b0a4a1')
text(30,920,f'600 water / 663 U / 763 carriage / 900 portal; {clearance:g} new bridge beam-to-park clearance',14)
text(30,945,'Intake splash and bulk first wetting differ. Complete joint/rail/guard/lift and air/thermal admission remain open.',14,'#a12b23')
text(30,970,'The old west park, 5 mm east-only park, solid -900 deck and free D1300 are rejected, not hidden.',14)
text(30,1020,'Intake section: HAD clear shaft and outlet, not a solid shield box',18)
IX=lambda x:160+(x-shield['plan'][0])*.9
IZ=lambda z:1060+(-110-z)*.16
q=shield['plan'];rect(IX(q[0]),IZ(shield['z'][1]),q[2]*.9,(shield['z'][1]-shield['z'][0])*.16,'none','#8f6354')
q=shaft['plan'];rect(IX(q[0]),IZ(shaft['z'][1]),q[2]*.9,(shaft['z'][1]-shaft['z'][0])*.16,'#dceff5')
svg.append(f'<path d="M{IX(outlet["planeX"])} {IZ(outlet["z"][1])} V{IZ(outlet["z"][0])}" stroke="#145c83" stroke-width="5"/>')
text(380,1080,'Open gravity shaft: 200 run x 600 clear width',14)
text(380,1105,f'Outlet x{outlet["planeX"]}: 600 wide x 100 high',14)
text(380,1130,f'Outlet bed {outlet["z"][0]:.3f}; rim {outlet["z"][1]:.3f}',14)
text(380,1155,'Hood sheet / deflector / capture remain a material and first-wetting hold.',14,'#a12b23')
text(30,1220,'The clear void proves continuity only; it does not qualify an inlet or an installed assembly.',14,'#a12b23')
text(30,1270,'Actual floor / east weather wall: no occupied finish or glass beneath bearing masonry',18)
WX=lambda x:80+(x-8000)*.38
WZ=lambda z:1410-z*.25
z=0
for (_,th),c in zip(b['floorLayers'],['#e9d6b5','#cecabd','#b3dfd8','#c4c8cc']):
 rect(WX(b['permanentDryGalleryClearX'][0]),WZ(z),(b['permanentDryGalleryClearX'][1]-b['permanentDryGalleryClearX'][0])*.38,th*.25,c);z-=th
rect(WX(beams[1][0]),WZ(-180),(beams[1][1]-beams[1][0])*.38,450*.25,'none')
colors=['#e3d2ba','#d9d2c4','#b3dfd8','white','#c8a28c']
for i,((name,th),c) in enumerate(zip(weather['layersRoomToWeather'],colors)):
 basez=0 if name=='mineralFinish' else -180
 rect(WX(faces[i]),WZ(400),th*.38,(400-basez)*.25,c)
 text(800,1310+24*i,f'{name}: {th:g} mm',13)
svg.append(f'<circle cx="{WX(faces[glass_i])}" cy="{WZ(-130)}" r="15" fill="none" stroke="#a12b23" stroke-width="2"/>')
text(30,1610,f'Floor glass ends at {b["permanentDryGalleryClearX"][1]}; vertical glass starts {faces[glass_i]:g}: {thermal_gap:g} horizontal separation.',14,'#a12b23')
text(30,1640,'RC / masonry thermal bridge, air line, DPC / cavity tray and first-wet closure remain unqualified.',14,'#a12b23')
text(30,1710,'Court activation and first-wet screen: actual surface before declared crest',18)
text(30,1745,f'Well north edge floor {well_north_z:g}; direct-well effective crest is at least {activation["direct_well_effective_crest_lower_bound_mm"]:g}.',14)
text(30,1775,f'Collector reaches real north floor {collector_north_z:g}; -110 crest remains conditional on actual open lip / cover / cut.',14)
text(30,1805,f'Declared 600-wide ideal head {activation["ideal_head_screen_mm"]:.3f}: direct-well probe {activation["direct_well_stage_at_declared_ideal_head_mm"]:.3f}; collector conditional {activation["collector_conditional_stage_at_declared_ideal_head_mm"]:.3f}.',14)
text(30,1835,f'Margins to -110 north approach floor: {activation["direct_well_margin_to_north_loggia_floor_mm"]:.3f} / {activation["collector_conditional_margin_to_north_loggia_floor_mm"]:.3f}; NOT qualified first-harm margins.',14,'#a12b23')
text(30,1870,f'Actual intake/support clashes: {len(node_clashes)} (red plan corners). A selected whole-house pass must have none.',14,'#a12b23')
text(30,1900,'Water loss / debris / splash and actual first vulnerable material remain RWT / MAT proof.',14,'#a12b23')
svg.append('</g></svg>\n')
outputs={O/'east-dry-bridge-envelope.results.json':json.dumps(out,indent=2)+'\n',O/'east-dry-bridge-envelope.svg':'\n'.join(svg)}
if '--check' in sys.argv:
 for q,v in outputs.items():assert q.read_text()==v,q
 print(f'Actual HAD/MAT outputs reproduce; intake/support falsifiers: {len(node_clashes)}; technical acceptance remains open')
else:
 for q,v in outputs.items():q.write_text(v)
 print('Wrote actual HAD/MAT material, support, renewal and ground envelope proof')
