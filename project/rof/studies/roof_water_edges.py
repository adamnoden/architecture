"""Read-only outer eaves proposal, current-source input. Millimetres and L/s.
This is a finite selection check, with explicit unresolved support and head details.
Run from any directory. The owning reconciliation source consumes this report.
"""
import json
import math
from pathlib import Path
ROOT = Path(__file__).resolve().parents[3]
def read(name):
    return json.loads((ROOT/'project'/name).read_text())
roof = read('mat/studies/ring-roof-family.json')
house = read('had/studies/water-replan.json')['model']
service = read('rwt/studies/court-service-selection.json')
eave = roof['families'][-1]['outerReceiver']
rain = read('rwt/studies/selected-water-event.json')['duty']['syntheticRainfallMmPerHour']/3600
outer, _, ridge = roof['catchment']['outerCourtRidgeSides']
sky = roof['catchment']['revisedCourt']['openSide']
shell = house['shell']
primary = {'inner':170, 'outer':520, 'width':350, 'radius':345,
           'bed':eave['gutterBottomFrontBack'][0]-80, 'frontDepth':130, 'backDepth':230}
fault = {'inner':125, 'outer':670, 'width':545, 'radius':397.5,
         'bed':6495, 'frontDepth':125}
primary['front'] = primary['bed']+primary['frontDepth']
primary['back'] = primary['bed']+primary['backDepth']
fault['front'] = fault['bed']+fault['frontDepth']
# Bounded head+spout plan envelope, each 250 along the facade, extending
# radially from its circuit's outer edge to1260. Normal upper spouts shadow
# 250x150 of the lower square annulus. Each N/S circuit has one of each head.
head = {'along':250,'highNormalCatchAlong':450,'axis':1130,'nearest':1000,'farthest':1260}
primary_side = shell+2*primary['outer']
fault_side = shell+2*fault['outer']
normal_area = (primary_side**2-ridge**2)/2e6
normal_head_area = (head['along']*(head['nearest']-primary['outer'])
                   +head['highNormalCatchAlong']*(head['farthest']-head['nearest']))/1e6
normal_shadow = head['along']*(fault['outer']-primary['outer'])/1e6
fault_head_extra = head['along']*(head['farthest']-fault['outer'])/1e6
fault_extra_area = (fault_side**2-primary_side**2)/2e6-normal_shadow+fault_head_extra
normal_q = (normal_area+normal_head_area)*rain
fault_q = normal_q+fault_extra_area*rain
normal_head_extra = normal_head_area-normal_shadow
whole_area = fault_side**2/1e6+2*(normal_head_extra+fault_head_extra)
assert abs(2*fault_q+(ridge**2/1e6)*rain-whole_area*rain)<1e-9
# Inner goods intercept sky: each projected annulus is counted once.
inner_normal = (ridge**2-2600**2)/1e6*rain
inner_fault = (ridge**2-2400**2)/1e6*rain
inner_court = 2400**2/1e6*rain
assert abs(inner_fault+inner_court-(ridge**2/1e6)*rain)<1e-9

def manning(width,depth,fall=.004,n=.020):
    w,h=width/1000,depth/1000
    area=w*h
    return 1000*area*(area/(w+2*h))**(2/3)*math.sqrt(fall)/n

def normal_depth(q,width):
    low,high=0,1000
    for _ in range(80):
        mid=(low+high)/2
        if manning(width,mid)>q:high=mid
        else:low=mid
    return (low+high)/2

def local_head(q,width,depth,K=4):
    velocity=q*1000/(width*depth)
    return K*velocity**2/(2*9.81)*1000

def weir_head(q,width):
    effective=(width-10)*.75
    return 2000*((q/effective)**2/9.81)**(1/3)

# Residual normal-flow check and separate named loss sensitivity. No installed
# inlet/turn/tail rating is inferred from Manning or the illustrative K.
pdepth = normal_depth(normal_q,primary['width']/2)
fdepth = normal_depth(fault_q,fault['width']/2)
p_local = local_head(normal_q,primary['width']/2,pdepth)
f_local = local_head(fault_q,fault['width']/2,fdepth)
body_deflection = 8
primary_cross_section_movement = 11
fault_cross_section_movement = 19
normal_reserve=primary['frontDepth']-(pdepth+p_local+10+25+primary_cross_section_movement)
fault_reserve=fault['frontDepth']-(fdepth+f_local+10+25+fault_cross_section_movement)
spill_head=weir_head(normal_q,1200)
spill_reserve=primary['back']-primary['front']-spill_head-6-10-25-10
assert min(normal_reserve,fault_reserve,spill_reserve)>0
pstations={'north':9025,'south':11150}
fstation=11750

def distance(face,x,normal):
    s=pstations[face] if normal else fstation
    r=primary['radius'] if normal else fault['radius']
    return 6000+x+2*r if x<=s else 18000-x+2*r

def p_bed(face,x):return primary['bed']-distance(face,x,True)/200

def f_rim(face,x):return fault['front']-distance(face,x,False)/200

first_drop = 165
carrier_below_bed = 27  # 2 mm backing on 25-deep rails and transverse ribs.
apron_toe_above_bed = 95
checks=[]
for face in ['north','south']:
    positions=[0,12000,pstations[face]-.001,pstations[face]+.001,
               fstation-.001,fstation+.001,*range(0,12001,50)]
    checks += [(p_bed(face,x)-first_drop-f_rim(face,x),face,x) for x in positions]
checks += [(primary['bed']-first_drop-fault['front'],side,6000) for side in ['west','east']]
min_drop=min(checks)
lower_min=min(f_rim(f,x)-fault['frontDepth'] for f in ['north','south']
              for x in [0,12000,11750-.001,11750+.001])
window_top=max(3450+o['head'] for o in house['openings']['FIRST']
               if 'head' in o and o['wall'].startswith('outer'))
assert min_drop[0]-carrier_below_bed-10-5-20>10
assert lower_min-carrier_below_bed-window_top-10-body_deflection-30>25
# The fixed primary apron ends 40 below the front lip. The whole moving
# carrier, its 5 mm fittings, 5 mm deflection and opposed setting are charged.
toe_over_front=primary['frontDepth']-apron_toe_above_bed
apron_drop_gap=apron_toe_above_bed-(primary['backDepth']-first_drop)
secondary_cross=7110+(170-140)/(220-140)*(eave['newPrimarySecondaryZ'][1]-7110)
primary_length=6000+11150+2*primary['radius']
radial_movement=(6000+primary['radius'])*17e-6*80
secondary_gap=primary['inner']-140-radial_movement-10
assert secondary_gap>10 and apron_drop_gap-10>0

exclusions=[*house['gardenFailureBypass']['groundPathEnvelope'],
            house['gardenFailureBypass']['usableGarden']['plan'],
            house['gardenFailureBypass']['frontApproach']['footprint']]
exclusions += [b['bounds'] for b in service['ground']['basins']]
for obj in read('rwt/studies/over-roof-site-envelope.json')['primitives']:
    if obj.get('kind')=='scaffold-sole-board':
        x1,x2=obj['x'];y1,y2=obj['y'];exclusions.append([x1,y1,x2-x1,y2-y1])
exclusions.append(read('mat/studies/plant-threshold.json')['dock']['plan'])
def overlap(a,b):
    x,y,w,h=a;u,v,bw,bh=b
    return max(0,min(x+w,u+bw)-max(x,u)),max(0,min(y+h,v+bh)-max(y,v))
lanes=[]
for face,x,name in [('north',9025,'normal'),('south',11150,'normal'),
                    ('north',11750,'relief'),('south',11750,'relief')]:
    # The fixed heads and spouts are removed first under independent diversion.
    lane=[x-200,12000+head['axis'] if face=='north' else -3250,400,3250-head['axis']]
    hits=[rect for rect in exclusions if all(overlap(lane,rect))]
    assert not hits,(face,name,hits)
    lanes.append({'face':face,'circuit':name,'plan':lane})

# Material schedule per continuous metre, plus64 separately rooted brackets
# per circuit. Project fabrication envelopes, not supplier-certified assemblies.
cu_density=8940
steel_density=8000
p_perimeter=4*(shell+2*primary['radius'])/1000
f_perimeter=4*(shell+2*fault['radius'])/1000
p_stock=(350+230+130+15+25+20)/1000
f_stock=(545+2*125+20)/1000
p_cu=p_stock*.001*cu_density
f_cu=f_stock*.001*cu_density
rhs_area=(50*100-42*92)
rhs_kg=rhs_area*steel_density/1e6
root_plate=.120*.100*.008*steel_density
gussets=2*.080*.080/2*.005*steel_density
moving_crossarm_kg = (160*25-152*17)*steel_density/1e6
lower_root_kg = rhs_kg
# Fixed roots stop behind each wet body. The shallow crossarm and its captured
# tray first move 40 out to release the fork, then descend. A fixed full-width
# seat would obstruct that first descent.
p_brackets=64*(rhs_kg*.9+moving_crossarm_kg*.4+root_plate+gussets)/p_perimeter+.5
f_brackets=64*(lower_root_kg*.8+moving_crossarm_kg*.6+root_plate+gussets)/f_perimeter+1.0
p_apron=.580*.0007*8000*math.hypot(25,25)/25
f_apron=.650*.0005*8000*math.hypot(25,6)/25
rail_kg = (80*25-76*21)*steel_density/1e6
rib_kg = (20*25-16*21)*steel_density/1e6
p_backing = primary['width']/1000*.002*steel_density
f_backing = fault['width']/1000*.002*steel_density
p_frame = 2*rail_kg + rib_kg*primary['width']/1000/.20
f_frame = 2*rail_kg + rib_kg*fault['width']/1000/.20
secondary_apron_ribs = 2*rib_kg + .25
# Fixed apron frames have their own clips and roots behind the wet bodies.
# Charge both aprons and their continuous rails to the upper50kg/m envelope.
p_dry=p_cu+p_brackets+p_apron+p_backing+p_frame+f_apron+secondary_apron_ribs
f_dry=f_cu+f_brackets+f_backing+f_frame
assert p_dry<50 and f_dry<50
water_p=primary['width']*primary['frontDepth']/1000
water_f=fault['width']*fault['frontDepth']/1000
# Circumferencewaterbased onfrontspilldepth andboundedmaxbothfilled.
wet_kN=(p_perimeter*(50+water_p)+f_perimeter*(50+water_f))*.00981

report={
 'primary':primary,'fault':fault,'headEnvelope':head,
 'hydrology':{'primaryCircuitAreaIncludingNormalHead':normal_area+normal_head_area,
              'faultAdditionalAreaEach':fault_extra_area,
              'primaryCircuitLps':normal_q,'faultCircuitLps':fault_q,
              'wholeCapturedAreaM2':whole_area,'wholeLps':whole_area*rain,
              'innerNormalWith2600SkyLps':inner_normal,'innerFaultWith2400SkyLps':inner_fault,
              'remaining2400CourtLps':inner_court},
 'hydraulicSensitivities':{'primaryHalfWidthNormalDepth':pdepth,'primaryK4':p_local,
            'primaryReserveAfter10Setting25Splash11Movement':normal_reserve,
            'faultHalfWidthNormalDepth':fdepth,'faultK4':f_local,
            'faultReserveAfter10Setting25Splash19Movement':fault_reserve,
            'primary1200SpillHead':spill_head,'primaryRearReserve':spill_reserve,
            'rejectedFault100Reserve':fault_reserve-25},
 'release':{'initialOutwardForkRelease':40,'firstDrop':first_drop,
            'subsequentOutwardDraw':360,'totalDrawOut':400,'leastWetBedToRimGap':min_drop,
            'carrierBelowBed':carrier_below_bed,
            'afterCarrier10Setting5Hardware20Movement':min_drop[0]-carrier_below_bed-35,
            'lowerMinimumBed':lower_min,'actualUpperWindowHead':window_top,
            'carrierGapToOpening':lower_min-carrier_below_bed-window_top,
            'carrierGapAfter10Setting8Body30CollectorMovement':lower_min-carrier_below_bed-window_top-48,
            'wetBedGapTo215ArchRing':lower_min-window_top-215,
            'apronToeBelowFront':toe_over_front,'movingRearBelowFixedToe':apron_drop_gap,
            'headToDrawnTray':head['nearest']-(primary['outer']+400),
            'secondaryAtPrimaryBack':secondary_cross,
            'secondaryHeightAbovePrimaryBack':secondary_cross-primary['back'],
            'secondaryRadialAfterThermalAndSetout':secondary_gap},
 'movement':{'longestPrimaryArm':primary_length,'alongArm80K':primary_length*17e-6*80,
             'radial80K':radial_movement,'endTravelMinimum':30,'opposedLipInitialGap':60},
 'groundLanes':lanes,
 'mass':{'primaryPerimeter':p_perimeter,'faultPerimeter':f_perimeter,
         'primary1mmCuKgM':p_cu,'fault1mmCuKgM':f_cu,
         'primaryBracketsKgM':p_brackets,'faultBracketsKgM':f_brackets,
         'primaryApronKgM':p_apron,'faultSecondaryApronKgM':f_apron,
         'primaryScheduledDryKgM':p_dry,'faultScheduledDryKgM':f_dry,
         'primaryBackingKgM':p_backing,'faultBackingKgM':f_backing,
         'primaryFrameKgM':p_frame,'faultFrameKgM':f_frame,
         'secondaryApronRibsAndClipsKgM':secondary_apron_ribs,
         'rootBracketsPerCircuit':64,'primaryDryAllowance':50,'faultDryAllowance':50,
         'bothAtFrontWaterKgM':[water_p,water_f],'bothFilledCharacteristicKN':wet_kN},
 'outstanding':[
 'Root must apply exact eccentric loads and added wind/uplift to actual collector kernel; no spare mass argument.',
 'The250head/catch width is rechecked against actual openings and service weather faces in roof_water_heads.py.',
 'Each normal outer collecting head and its cross-spout require an independently supported continuous undercatch draining inward to fault trough. Without it a failed/outlet-blocked outboard head bypasses the lower trough.',
 'Price normal-head walls high enough to send backed water to primaryfront spill first. Underhead leak return must pass full3.311Lps independently, be removable under temporary upstream diversion, and avoid normalbody/pipe joints.',
 'Secondaryapron140 lies25beyond proposed80intake35..115. Exactfittedventandflashingsupports mustretain that freearea.',
 'Root plates6550..6650 lie35above actualarchring6515. Cold/airbarrier return, welding, thermalbridge and corner continuity need a source section.',
 'No immunity to shared ice blanket, simultaneous loss of both circuits or siteflood established.',
 'The inner lower collector and its guarded transfer sequence are owned by the separate joined inner calculation.'
 ]}
if __name__ == '__main__':
    print(json.dumps(report, indent=2))
