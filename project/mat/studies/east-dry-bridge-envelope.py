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
body=n['bodyX'];L=body[1]-body[0];park=n['selectedParkX'];beam=b['localSupportBeamZ'][0]
assert L==n['length']==park[1]-park[0] and park[0]-body[0]==n['withdrawalTranslation']
width=n['waterClearWidth'];depth=n['waterDepth']
ugross=width+2*a['liner_sheet']+2*a['outward_flange_each'];carriage=ugross+2*a['carriage_extra_width_each']
assert (ugross,carriage,a['carriage_total_below_bed'])==(n['wetBodyGrossWidth'],n['carriageWidthBudget'],n['carriageBelowBedBudget'])
beams=[[x-w/2,x+w/2] for x,w in zip(b['supportAxesX'],b['localSupportBeamWidths'])]
walls=[[b['coveredX'][0],b['permanentDryGalleryClearX'][0]],b['newEastWeatherWallX']]
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
 'body_x_mm':body,'length_mm':L,'bridge_beam_ranges_mm':beams,'complete_wall_bearing_margins_mm':bearing,
 'gross_liner_width_mm':ugross,'whole_carriage_width_mm':carriage,'gross_portal_width_mm':portal[1]-portal[0],
 'lateral_remainder_each_mm':((portal[1]-portal[0])-carriage)/2,'body_rim_ends_mm':rim,
 'minimum_gross_rim_to_beam_mm':beam-max(rim),'rejected_200_deep_body_overlap_mm':max(bed(x)+200 for x in body)-beam,
 'body_carriage_bottom_mm':[bottom(x) for x in body],'selected_park_x_mm':park,'actual_beam_to_hoist_park_mm':clearance,
 'translation_mm':n['withdrawalTranslation'],'translation_z_mm':bed(park[0])-bed(body[0]),
 'park_carriage_bottom_mm':[bottom(x) for x in park],'operator_deck_z_mm':n['operatorDeckZ'],
 'rejected_solid_deck_overlap_mm':n['operatorDeckZ']-min(bottom(x) for x in park),
 'fixed_track_bottom_mm':[track(x) for x in park],'complete_local_lowest_surface_mm':low,
 'complete_local_D_lower_bound_mm':D,'HAD_D_trial_mm':d['routeLocalDTrial'],'trial_residual_over_lower_bound_mm':d['routeLocalDTrial']-D,
 'sheet_only_mass_screen_kg':(width+2*depth+2*a['outward_flange_each'])*L*a['liner_sheet']*8000/1e9,
 'full_depth_prismatic_water_litres':width*depth*L/1e6,'court_intake_well':well,'shield_release':'Upward in isolated guarded well, outside beam; does not travel through the portal',
 'intake_flow_void':{'representation':shield['representation'],'shaft':shaft,'outlet':outlet,'result':'Connected geometric clear void only; no loss/splash/capacity rating'},
 'historical_rejected_west_park':oldwest,'historical_west_actual_beam_clearance_mm':min(q[0] for q in beams)-oldwest[1],
 'historical_rejected_east_shell_park':oldeast,'historical_east_shell_remaining_mm':12000-oldeast[1],
 'envelope_result':'Listed material/whole-carriage/support envelope checks pass only',
 'first_wetting':'U rim is overtop geometry, not safe stage. Inlet drop/splash can wet a beam/air joint before bulk overtop; actual shield/end transfer needs water testing.',
 'limits':['No structural capacity, complete material, air/gas, hydraulic, first-harm, lifting or real-site acceptance','Rail/keeper/joint/rigging/guard/step hardware must fit actual territories','D1600 is route-local; other real supports or site conditions can govern deeper']}
svg=['<svg xmlns="http://www.w3.org/2000/svg" width="1180" height="1240" viewBox="0 0 1180 1240"><rect width="100%" height="100%" fill="white"/><g font-family="sans-serif" font-size="14" fill="#17242e">']
def text(x,y,t,size=14,c='#17242e'):svg.append(f'<text x="{x}" y="{y}" font-size="{size}" fill="{c}">{t}</text>')
def rect(x,y,w,ht,fill,stroke='#334c60'):svg.append(f'<rect x="{x}" y="{y}" width="{w}" height="{ht}" fill="{fill}" stroke="{stroke}"/>')
X=lambda x:60+(x-4250)*.111;Z=lambda z:100-z*.20;Y=lambda y:540+(y-4250)*.10
text(30,30,'East dry bridge: actual HAD floor, supports and whole-carriage renewal',22)
text(30,55,'Unadopted development envelope; no qualified products, technical acceptance or actual plot',14,'#a12b23')
z=0
for (_,th),c in zip(b['floorLayers'],['#e9d6b5','#cecabd','#b3dfd8','#c4c8cc']):
 rect(X(b['coveredX'][0]),Z(z),.111*(b['coveredX'][1]-b['coveredX'][0]),th*.2,c);z-=th
for lo,hi in beams:rect(X(lo),Z(b['localSupportBeamZ'][1]),(hi-lo)*.111,(b['localSupportBeamZ'][1]-beam)*.2,'none')
text(30,205,'RC200 field ends at -380; actual 600 / 900 crossing beams reach -630',14)
for (lo,hi),c in [(body,'#67a8d5'),(park,'#c6e0cc')]:
 pts=[(X(lo),Z(bed(lo)+depth)),(X(hi),Z(bed(hi)+depth)),(X(hi),Z(bottom(hi))),(X(lo),Z(bottom(lo)))]
 svg.append('<polygon points="'+' '.join(f'{x},{y}' for x,y in pts)+f'" fill="{c}" stroke="#145c83"/>')
svg.append(f'<path d="M{X(plat[0])} {Z(n["operatorDeckZ"])} H{X(13500)}" stroke="#8f6354" stroke-dasharray="5 4"/>')
svg.append(f'<path d="M{X(park[0])} {Z(track(park[0]))} L{X(park[1])} {Z(track(park[1]))}" stroke="#a12b23" stroke-width="2"/>')
text(30,350,'Blue: installed body/backing. Green: separate east park. Brown: operator deck outside the depressed track.',13)
svg.append(f'<path d="M60 {Z(-d["routeLocalDTrial"])} H1110" stroke="#a12b23" stroke-dasharray="8 5"/>')
text(30,455,f'Lowest fixed track {low:.3f}; local D{d["routeLocalDTrial"]} trial has {d["routeLocalDTrial"]-D:.3f} over the stated stresses',14,'#a12b23')
text(30,495,'Plan: actual beam faces, guarded intake and new outboard site work field',18)
rect(X(4250),Y(4250),3500*.111,3500*.1,'#f6f0e2')
rect(X(b['coveredX'][0]),Y(portal[0]),(b['coveredX'][1]-b['coveredX'][0])*.111,(portal[1]-portal[0])*.1,'#d2d7dc')
rect(X(plat[0]),Y(plat[1]),plat[2]*.111,plat[3]*.1,'#f1e9dd')
rect(X(trackplan[0]),Y(trackplan[1]),trackplan[2]*.111,trackplan[3]*.1,'#dae7df')
rect(X(body[0]),Y(p['waterClear'][1]),L*.111,width*.1,'#67a8d5')
rect(X(park[0]),Y(portal[0]),L*.111,(portal[1]-portal[0])*.1,'none','#a12b23')
rect(X(op[0]),Y(op[1]),op[2]*.111,op[3]*.1,'#f3dca8')
rect(X(well[0]),Y(well[1]),well[2]*.111,well[3]*.1,'none','#a12b23')
q=shield['plan'];rect(X(q[0]),Y(q[1]),q[2]*.111,q[3]*.1,'#b0a4a1')
text(30,920,f'600 water / 663 U / 763 carriage / 900 portal; {clearance:g} actual beam-to-hoist park clearance',14)
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
svg.append('</g></svg>\n')
outputs={O/'east-dry-bridge-envelope.results.json':json.dumps(out,indent=2)+'\n',O/'east-dry-bridge-envelope.svg':'\n'.join(svg)}
if '--check' in sys.argv:
 for q,v in outputs.items():assert q.read_text()==v,q
 print('Actual HAD/MAT envelope join reproduces; listed checks pass, technical acceptance remains open')
else:
 for q,v in outputs.items():q.write_text(v)
 print('Wrote actual HAD/MAT material, support, renewal and ground envelope proof')
