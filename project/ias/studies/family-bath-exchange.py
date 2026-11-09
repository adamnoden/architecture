"""Family bath-shell carriage and house geometry in millimetres. Device envelopes are design checks."""
import hashlib
import json
import math
from pathlib import Path
import sys

HERE=Path(__file__).resolve().parent
def read(p):return json.loads(p.read_text())
source={s:HERE/s for s in ('../../mat/studies/front-threshold.json','../../had/studies/water-replan.json','shared-family-bathing.json',
    'stair-rail-renewal.json','../../mat/studies/plant-threshold.json','../../mat/studies/winter-heat-and-water.json')}
house=read(source['../../had/studies/water-replan.json'])['model']; room=read(source['shared-family-bathing.json'])['room']
stair=house['stairGuard'];dock=read(source['../../mat/studies/plant-threshold.json'])['dock']
study=read(source['../../mat/studies/winter-heat-and-water.json'])
def rectangle(x,y,w,h):return [(x,y),(x+w,y),(x+w,y+h),(x,y+h)]
def rotated(cx,cy,w,h,deg):
    a=math.radians(deg);c,s=math.cos(a),math.sin(a)
    return [(cx+c*x-s*y,cy+s*x+c*y) for x,y in rectangle(-w/2,-h/2,w,h)]
def box(poly):return min(x for x,y in poly),min(y for x,y in poly),max(x for x,y in poly),max(y for x,y in poly)
def gap_box(a,b):return math.hypot(max(a[0]-b[2],b[0]-a[2],0),max(a[1]-b[3],b[1]-a[3],0))
def segment_distance(p,a,b):
    dx=b[0]-a[0];dy=b[1]-a[1]
    f=max(0,min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy or 1)))
    return math.hypot(p[0]-a[0]-f*dx,p[1]-a[1]-f*dy)
def poly_gap(a,b):
    # Convex polygons. Separating axes distinguish contact from a vertex-to-edge near miss.
    for poly in [a,b]:
        for p,q in zip(poly,poly[1:]+poly[:1]):
            dx,dy=p[1]-q[1],q[0]-p[0]
            u=[dx*x+dy*y for x,y in a];v=[dx*x+dy*y for x,y in b]
            if min(u)>max(v) or min(v)>max(u):
                return min(segment_distance(p,l,r) for one,two in [(a,b),(b,a)] for p in one
                           for l,r in zip(two,two[1:]+two[:1]))
    return 0.
fixed={}
for w in house['upperWalls']:
    along=0 if w['a'][1]==w['b'][1] else 1
    start,end=sorted([w['a'][along],w['b'][along]]);u,v=w['finishedFaces']
    cuts=[start,*[c for gap in w['holes'] for c in gap],end]
    for i in range(0,len(cuts)-1,2):
        x,y=cuts[i:i+2];rect=(x-18,u-18,y-x+36,v-u+36) if along==0 else (u-18,x-18,v-u+36,y-x+36)
        # The detailed family jamb replaces the generic trim on both faces of this opening.
        if w['id']=='wet-spine':
            rect=(u,x-18,v-u,(5516.5 if i==0 else y+18)-(x-18 if i==0 else 6283.5))
            if i!=0:rect=(u,6283.5,v-u,y+18-6283.5)
        fixed[w['id']+str(i)]=rectangle(*rect)
for name,r in {**house['upperFurniture'],**dict(house['fixedObstacles']['FIRST']),**dict(stair['firstFloorGuards'])}.items():
    if name!='family-bath1700' and len(r)==4:fixed[name]=rectangle(*r)
fixed['family-WC']=rectangle(10907.5,5722.5,650,355)
fixed['court']=rectangle(3802.5,3802.5,4395,4395)
fixed['open stair']=rectangle(*house['stair'])
fixed['entry void']=rectangle(*house['void'])
def door(rect,angle):
    c,s=math.cos(math.radians(angle)),math.sin(math.radians(angle))
    return [(9409+x*s+y*c,6281-x*c+y*s) for x,y in rectangle(*rect)]
door_local={'family leaf':(0,0,762,44),'south grip':(650,-90,85,90),'north grip':(650,44,85,90)}
fixed.update({name:door(r,85) for name,r in door_local.items()})
def clear_path(path,w,h,items=fixed,step=6):
    bodies=[(k,p,box(p)) for k,p in items.items()]
    best=10000.;who=''
    for aa,bb in zip(path,path[1:]):
        dx,dy,da=(b-a for a,b in zip(aa,bb))
        speed=math.hypot(dx,dy)+math.hypot(w,h)/2*abs(math.radians(da))
        pieces=max(1,math.ceil(speed/step));near=10000.;label=''
        for i in range(pieces+1):
            t=i/pieces;pp=rotated(aa[0]+t*dx,aa[1]+t*dy,w,h,aa[2]+t*da);bound=box(pp)
            for k,p,bbound in bodies:
                if gap_box(bound,bbound)>=near:continue
                d=poly_gap(pp,p)
                if d<near:near=d;label=k
        # Bound the untested half-step by the maximum speed of any point on the load.
        d=near-speed/(2*pieces)
        if d<best:best=d;who=label
    return {'minimumContinuousGap':best,'nearest':who}
# Actual vertical shell package. Heading zero has its 510 side in X and 730 side in Y.
old_depth,ph,height=room['transportPack'];pw=480
assert [old_depth,ph,height]==[510,730,1690]
keeper=[10585,6065]
def circle(p,r,div=32):
    radius=r/math.cos(math.pi/div)
    return [(p[0]+radius*math.cos(i*math.tau/div),p[1]+radius*math.sin(i*math.tau/div)) for i in range(div)]
def capsule(a,b,r):
    length=math.dist(a,b);nx=r*(a[1]-b[1])/length;ny=r*(b[0]-a[0])/length
    return [(p[0]+sign*nx,p[1]+sign*ny) for p,sign in [(a,1),(b,1),(b,-1),(a,-1)]]
grip=door([700,-70,0,0],85)[0]
with_keeper={**fixed,'attendant body':circle(keeper,300),'attendant arm':capsule(keeper,grip,40),
             'hand':circle(grip,40)}
keeper_checks={'shoulderToGripCentre':math.dist(keeper,grip),
    'bodyToFixed':min((poly_gap(circle(keeper,300),v),k) for k,v in fixed.items()),
    'previousWait':read(source['shared-family-bathing.json'])['access']['familyArrivalAfterDoor']}
room_path=[(9775,4215,0),(10485,4215,0),(10485,4995,0),(10235,5525,30),(10195,5585,35),
           (10135,5645,50),(10035,5695,65),(9765,5815,80),(9765,5815,90)]
gallery=[room_path[-1],(8780,5815,90),(8780,3290,90),(3390,3290,90),(3390,3800,90),
         (1450,3800,90),(1450,4110,90)]
sections={'room':clear_path(room_path,pw,ph,with_keeper,step=1),'gallery':clear_path(gallery,pw,ph,with_keeper),
          'earlier510SameDoorSweep':clear_path(room_path,old_depth,ph,with_keeper)}
# Bounded rotating shell in X/Z about the WEST rim line. The frame carries its underside on two saddles.
# Local sides are [-20,1670] and [-455,25], including toe, padding and attachments.
pivot=[9560,4215,580];rx=math.hypot(1670,455);rz=math.hypot(1670,25)
tip={'pivot':pivot,'cornersXZ':[-20,1670,-455,25],'maxX':pivot[0]+rx,'minX':pivot[0]-math.hypot(20,25),
     'maxZ':pivot[2]+rz,'minZ':pivot[2]-math.hypot(20,455),'yRange':[4215-ph/2,4215+ph/2],
     'startSideShiftNorth':65,'radiatorWestReserve':11367.5-(pivot[0]+rx),
     'roomSouthReserve':4215-ph/2-3800,'ceilingAt3100Reserve':3100-pivot[2]-rz,
     'uprightBottomBeforeLower':pivot[2]-20,'uprightTopBeforeLower':pivot[2]+1670,
     'lowerTo100Trolley':pivot[2]-20-100}
# Nominal aperture applies only with the delayed closer fully managed. Price actual 85° handle at its
# closest projected point along the shell's thru-path; the detailed jamb, hand and arm are independent.
south=min(y for x,y in fixed['south grip'])
throat={'frameNet':6283.5-5516.5,'southGripEdgeY':south,'southPassageToJamb':south-5516.5,
        'old730CrossingConflict':(5535+730)-south,'new480SouthClear':5815-pw/2-5516.5,
        'new480NorthGripClear':south-5815-pw/2}
# Complete landed load may grow 30 mm at each end of the native 956 footprint. The end
# positions are inset 60 in the actual 984-wide lanes, allowing both turns with the rails intact.
def obstacle_gap(p,bb):
    return math.hypot(max(bb[0]-p[0],0,p[0]-bb[2]),max(bb[1]-p[1],0,p[1]-bb[3]))
lc=stair['handrail']['declaredCombinedPositionLoss']/2;rail=stair['handrail']['wallsideProjection']
lx,ux=stair['lowerFlightX'],stair['upperFlightX']
left=[lx[0]+rail+lc,lx[1]-lc];right=[ux[0]+lc,ux[1]-rail-lc]
y_start=stair['treadGeometry']['midlandingNose'][0];finish=stair['finishedAperture']
# The newel end has a 100 projection. Hold 10 mm setout at the rear rail also.
newel=read(source['stair-rail-renewal.json'])['transfer']['returnOuterProjection']
landing_obstacles={'west grip':rectangle(-500,0,left[0]+500,10000),'east grip':rectangle(right[1],0,6000,10000),
    'rear grip':rectangle(-500,finish[1]+finish[3]-rail-lc,6600,2500),
    'well and rail end':rectangle(left[1],0,right[0]-left[1],y_start+newel)}
rects={k:box(v) for k,v in landing_obstacles.items()}
def turn(length=1016):
    width=730;east=sum(right)/2-60;west=sum(left)/2+60;r=425;y0=7670
    l,r0=east-r,west+r;poses=[]
    # Two tangent 90-degree curves and a straight cross-run. The final straight aligns ahead of the stairs.
    for j in range(361):
        angle=j/4;a=math.radians(angle);poses.append((l+r*math.cos(a),y0+r*math.sin(a),angle,-min(670,angle*11),True))
    for j in range(1,101):
        t=j/100;poses.append((l+(r0-l)*t,y0+r,90,-670+65*math.sin(math.pi*t),True))
    for j in range(1,361):
        angle=90+j/4;a=math.radians(angle);poses.append((r0+r*math.cos(a),y0+r*math.sin(a),angle,-670,True))
    for j in range(1,224):
        advance=445*j/223;poses.append((west,y0-advance,180,-670*max(0,min(1,(445-advance)/230)),False))
    load_gap=staff_gap=level_gap=straight_staff=10000.;reach=0.;track=[];previous=None
    for x,y,angle,lat,steering in poses:
        a=math.radians(angle);c,s=math.cos(a),math.sin(a);pp=rotated(x,y,width,length,angle)
        # Station outside the rear/inside corner while the load is on the level. Re-centre on lower lane.
        by=length/2+math.sqrt(315**2-max(0,abs(lat)-width/2)**2)
        worker=(x+lat*c+by*s,y+lat*s-by*c);rear=(x+(length/2+315)*s,y-(length/2+315)*c)
        straight_staff=min(straight_staff,min(obstacle_gap(rear,b) for b in rects.values())-300)
        survey=min(poly_gap(pp,b) for b in landing_obstacles.values())
        person=min(obstacle_gap(worker,b) for b in rects.values())-300
        needed=math.hypot(math.hypot(lat+260,by-478)-90,90)
        # Each path segment has bounded rigid point speed. Include variable attendant offset:
        # |d(by)/d(lat)| <=305/sqrt(315²-305²)<4; rotation radius <1 m.
        if previous:
            x0,y1,a0,h0=previous;ds=math.hypot(x-x0,y-y1);da=abs(math.radians(angle-a0));dl=abs(lat-h0)
            # The chord differs from arc by <.002 mm per quarter-degree at 425 radius.
            load_tax=(ds+math.hypot(width,length)/2*da)/2+.003
            staff_tax=(ds+1050*da+math.sqrt(17)*dl)/2+.015
            load_gap=min(load_gap,previous_load-load_tax,survey-load_tax)
            staff_gap=min(staff_gap,previous_person-staff_tax,person-staff_tax)
            if steering:level_gap=min(level_gap,min(p[1] for p in pp)-y_start-load_tax)
            reach=max(reach,needed+math.sqrt(17)*dl/2)
        previous=(x,y,angle,lat);previous_load=survey;previous_person=person
        if len(track)==0 or math.dist((x,y),track[-1][:2])>=35:track.append([x,y,angle,*worker])
    return {'envelopeWidth':width,'envelopeLength':length,'loadGap':load_gap,'attendantGap':staff_gap,
            'entireKitOnLevelWhileSteering':level_gap,'fixedRearOperatorGapSampled':straight_staff,
            'shoulderToGrip3DUpper':reach,'upperAxis':east,'lowerAxis':west,'route':track}
landing=turn();long_case=turn(1076)
# Compact boarding envelope on the upper landing. Price the control at the native REAR LEFT
# and the shell on the forward part of the 630-long platen; the actual handle datum must qualify.
# The 480 mm shell sits forward on the platen, leaving the rear chassis narrower than the load.
machine_x=landing['upperAxis'];machine_y=3920;body_w,body_l=556,956
pack_offset=190;deck_width,deck_length=530,630
support={'stockKg':107,'batteryKg':9,'bathKg':46,'tareBudget':25,'bodyWidth':body_w,'bodyLength':body_l,
         'platenSize':[deck_width,deck_length,135],'platenOffsetRequired':(body_l-deck_length)/2,
         'packageAheadOfBackMm':body_l/2+pack_offset-pw/2,'sideOverhangEach':(ph-deck_width)/2,
         'platenRearPurchase':(deck_length-pw)/2+(pack_offset-(body_l-deck_length)/2),
         'platenFrontPurchase':(deck_length-pw)/2-(pack_offset-(body_l-deck_length)/2)}
# For first release, two positive under-body saddles and a separate locked trunnion/rest take the shell.
# Two 40x20x2 rails plus cross-members, including four 700 rails and 1.9 m additional bracing.
steel_area=40*20-36*16;members_m=2*1.64+4*.70+1.90
support.update(frameSteelArea=steel_area,railLengthM=members_m,steelKg=steel_area*members_m*7850/1e6)
gross=46+25;support.update(loadedKg=gross,grossCarrierKg=gross+107+9,
    factoredUpendMomentKNm=1.5*gross*9.81*.92/1000,
    jackRequiredKN=1.5*gross*9.81*.92/.33/1000,
    trackActionKN=(gross+107+9)*9.81*1.5/1000)
top_station=[machine_x,machine_y+pack_offset]
# Cargo and motor have distinct occupied areas until the pack is captured on the platform.
boarding={'loadBayCentre':gallery[-1][:2],'machineLevelPosition':[machine_x,machine_y],
          'loadOnPlatenCentre':top_station,'sideTransferLength':top_station[0]-gallery[-1][0],
          'dollyRiseToPlaten':135-100,'rearToFinishedTrim':machine_y-body_l/2-(3344.5+18),
          'frontToFirstNose':4432.5-machine_y-body_l/2,
          'bareGapBetweenParkedLoadAndChassis':machine_x-body_w/2-(gallery[-1][0]+ph/2),
          'cargoParksBeforeEmptyCarrierArrives':True}
def bodyrect(x,y,w,h):return rectangle(x-w/2,y-h/2,w,h)
# Only the selected stair is traversable. All other solid walls, fixtures and original guards
# remain in place. Operators may use the current upper stairs once the first nose is passed.
top_fixed={k:v for k,v in fixed.items() if k not in ('open stair','family leaf','south grip','north grip')}
top_fixed['lower flight and open well']=rectangle(429.5,4432.5,1723.5-429.5,4323)
top_boxes={k:box(v) for k,v in top_fixed.items()}
def disk_gap(p,items):return min(obstacle_gap(p,b) for b in items)-300
def top_attendant():
    body_gap=arm_gap=9999.;reach=0;prev=None;worst=None
    # 1 mm movement steps. First use the open rear side, then move behind as the nose advances.
    for advance in range(801):
        x=machine_x;y=machine_y+advance
        if advance<=340:lat=-670;by=220+(478+math.sqrt(315**2-305**2)-220)*advance/340
        elif advance<=520:lat=-670;by=478+math.sqrt(315**2-305**2)
        else:
            lat=-670*(800-advance)/280;by=478+math.sqrt(315**2-max(0,abs(lat)-365)**2)
        pos=(x+lat,y-by);handle=(x-260,y-478)
        chassis=box(bodyrect(x,y,body_w,body_l));pack=box(bodyrect(x,y+pack_offset,ph,pw))
        gap=min(disk_gap(pos,top_boxes.values()),disk_gap(pos,[chassis,pack]))
        # First and last 110 mm at the product grip are a required open hand pocket. The
        # remaining 40-radius forearm line must pass outside both moving prisms and fixed work.
        dist=math.dist(pos,handle);dir_=[(pos[k]-handle[k])/dist for k in (0,1)]
        palm=[handle[k]+110*dir_[k] for k in (0,1)]
        arm=capsule(pos,palm,40);armbox=box(arm)
        geom=[rectangle(t[0],t[1],t[2]-t[0],t[3]-t[1]) for t in [chassis,pack]]
        nearby=[v for k,v in top_fixed.items() if gap_box(armbox,top_boxes[k])<100]
        ag=min(poly_gap(arm,v) for v in geom+nearby)
        if gap<body_gap:
            worst=(advance,pos,min([(obstacle_gap(pos,b)-300,k) for k,b in top_boxes.items()]+[(obstacle_gap(pos,chassis)-300,'chassis'),(obstacle_gap(pos,pack)-300,'shell')]))
        body_gap=min(body_gap,gap);arm_gap=min(arm_gap,ag)
        # Shoulder moves at most 90 toward the control, with the adjusted handle 90 lower.
        reach=max(reach,math.hypot(dist-90,90))
        if prev:
            assert math.dist(pos,prev)<12
        prev=pos
    # Maximum reciprocal slope of by(lat) <4, dlat/dadvance <=670/280.
    return {'worst':worst,'bodyClearLowerMm':body_gap-6,'armClearLowerMm':arm_gap-6,'reachUpper3DMm':reach+6,
        'start':[machine_x-670,machine_y-220],'end':[machine_x,machine_y+800-793],
        'gripLateralFromAxis':-260,'gripAftOfAxis':478,'requiredClearTerminalHandPocket':110}
boarding['attendant']=top_attendant()
front=read(HERE/'../../mat/studies/front-threshold.json')
def floor_walls():
    items={}
    for w in house['groundWalls']:
        k=0 if w['a'][1]==w['b'][1] else 1
        lo,hi=sorted([w['a'][k],w['b'][k]]);u,v=w['finishedFaces']
        # Fill every room opening in this comparison as the route stays in the protected hall.
        r=(lo-18,u-18,hi-lo+36,v-u+36) if k==0 else (u-18,lo-18,v-u+36,hi-lo+36)
        items[w['id']]=rectangle(*r)
    for k,r in {**house['groundFurniture'],**dict(house['fixedObstacles']['GROUND'])}.items():
        if isinstance(r,list) and len(r)==4:items[k]=rectangle(*r)
    items['court']=fixed['court'];items['stair']=fixed['open stair']
    xlo,xhi=front['occurrence']['doorX']
    items['front west wall']=rectangle(0,0,xlo,430);items['front east wall']=rectangle(xhi,0,12000-xhi,430)
    return items
ground=[(1950,3730,90),(3400,3730,90),(3400,3330,90),(6000,3330,90),(6000,-600,90)]
ground_clear=clear_path(ground,pw,ph,floor_walls())
front_lands=front['foldRepair']['revisedLandingsXYWH'];flight_axes=front['foldRepair']['revisedFlightAxes']
# Transfer cart stays holonomic and translates transversely on the actual 1200-deep landings.
front_result={'doorGross':front['occurrence']['doorX'],'upperLanding':front_lands[0],'flightAxes':flight_axes,
    'lowestLanding':front_lands[-1],'newFoot':front['foldRepair']['newFoot'],
    'clearNominalEachSideOn1200Flight':(1200-ph)/2,'axialDepthOn1200Landing':(1200-pw)/2,
    'dynamicLongGradeLoadN':(gross+20)*9.81*(1/20+.03)/math.sqrt(1+1/20**2),
    'approachLengths':house['approaches']['front']['flights'],'groundClear':ground_clear}
# Fixed headroom under the lower flight's first header; allow the load to project the entire
# declared 1.30 m from its supporting tread and the foot to rise 250 above that tread.
head=house['stairCarryVolume']['overhead'][0]
flight={'riser':stair['treadGeometry']['rise'],'going':stair['treadGeometry']['going'],
        'pitch':stair['treadGeometry']['pitchDegrees'],'availableWidth':right[1]-right[0],
        'reducedClearAt60InsetEach':[(984-ph)/2+60,(984-ph)/2-60],
        'maxBodyHeightRotatingOnFlight':math.hypot(height,pw),'horizontalOverhangBudget':1300,
        'maxPlatenAboveReferenceTread':250}
flight['headerReserve']=head['underside']-head['walkingMaximumInZone']-math.ceil(1300/300)*172.5-250-flight['maxBodyHeightRotatingOnFlight']
window=next(w for w in house['archOpeningRegister']['FIRST'] if w['id']=='east-window-1')
east={'window':window['centre'],'roughWidth':window['width'],'trialEachFrame':75,'netIfFrame75':window['width']-150,
      'sectionEverySide':(window['width']-150-ph)/2,'sillAboveGrade':3450+window['sill']-dock['outsideGrade'],
      'dock':dock['plan'],'liftBudget':study['site']['lift'],'edgeReserveIf730':(1950-ph)/2,
      'horizontalPackLength':height,'minimumCabinetOverlapX':9997-(11567.5-25-height),
      'minimumCabinetOverlapY':(window['centre']-425+ph)-4675}
# Select the geometry of an EXTERNAL upright exchange. The tracked carrier remains a rejected
# installed-operation claim. Its control position is prescribed in Zonzini Rev.19_TER §2 & §5.
east_route=[(9775,4215,0),(10525,4215,0),(10525,4600,0),(10525,4600,90),(10970,4600,90)]
# The east radiator remains. At this point the pack is elevated before crossing its footprint.
east_fixed={**fixed,**{name:door(r,0) for name,r in door_local.items()}}
east_station_clear=clear_path(east_route,pw,ph,east_fixed,step=2)
W=window['width'];rise=window['head']-window['spring'];radius=(W/2)**2/(2*rise)+rise/2
centre_z=window['head']-radius;liner=75
def arch_half(local_z):
    return W/2-liner if local_z<=window['spring'] else math.sqrt(max(0,(radius-liner)**2-(local_z-centre_z)**2))
def rail(width,depth,thickness,span,point):
    inertia=(width*depth**3-(width-2*thickness)*(depth-2*thickness)**3)/12
    return {'section':[width,depth,thickness],'span':span,'singleRailPointN':point,
            'inertia':inertia,'stressMPa':point*span/4*(depth/2)/inertia,
            'deflectionMm':point*span**3/(48*200000*inertia)}
east.update(roomPose=east_route,roomGap=east_station_clear,roofOfPackLocal=990+height,
    transferPlaneLocal=990,minimumUnderside=950,standingSillReserve=950-window['sill']-75,
    uprightCornerGap=arch_half(990+height)-pw/2,
    pairedUprightCornerGap=arch_half(990+height+5)-pw/2-5,
    deep150CornerGap=arch_half(950+150+height)-pw/2,
    archRadius=radius,archCentreZ=centre_z,archLiner=liner,
    railA=rail(50,40,4,1250,2000),railB=rail(75,150,5,2000,2000),
    railSupports=[11020,12270,14270],railYs=[4380,4820],
    dockIndependentPadSize=250,portalColumns=[[x,y] for x in [12270,14120] for y in [2850,5930]],
    northPadToFoulStack=5930-125-5775,northPadToY6100=6100-5930-125,
    dockToSouthPad=3400-(2850+125),southPadToRoomFace=12270-125-12000,
    transferZ=3450+990,gradeFloorZ=dock['outsideGrade'],totalLift=3450+990-dock['outsideGrade'],
    hoistBase=[14270,2550,1600,1660],hoistToPrimaryPair=5370-50-4210,
    groundRampTipY=2550-(2590-1660),southGoodsLanding=[14120,420,1320,1200],baseToDock=14270-14230,
    baseToOpenR290=study['site']['openGroundZone'][0]-15870,
    rightGateRunMm=1950,unloadNorth=True,loadSouth=True,
    grossPlatformUK=[1350,950],manualPlatform=[1320,960],baseWeightKg=730,
    manual10mFoundationKPa=73,mastTiesRequired=True,unsupportedFreeStandingRejected=True,temporarySleeveOrWallTieApproved=False,
    angleOrSashProved=False)
# BL121 Fig. 3.9.2 has opposite-facing ground and landing gates. Page top is site north.
# The manufacturer gives dimensions of the base, not a centred cage. X14770 is a setting-out
# requirement to check on the actual cage. It must be within +/-50 of the clear floor centre.
east.update(groundFloorLocalToBase=350,carTravel=4440-(-1800+350),
    newSouthGroundBeyondReserved=2500-420,carriageClearanceAcross=(950-800)/2,
    cageFloorCentreTargetX=14770,centreToleranceFor25Each=(950-800)/2-25,
    mastFirstBracketMax=4000,subsequentBracketMax=6000,workingMastOversailMax=3000,
    manufacturerScaffoldTieABCm=[2.50,2.48,.20],manufacturerTopForcesWindKN=[[5.4,5.7],[8.6,8.6]],
    stopBarHeadroomMinimum=1250,portalRowSpan=5930-2850,postFaceLimit=190,
    southPadToPotable=3150-(2850+125)-100,
    postToD2=12450-60-(12270+190/2),supportTableXY=[13150,4300,1150,1450],
    upperLoadRoute=[[10970,4600],[13670,4600],[13670,5440],[14770,5440],[14770,4870],[14770,3380]],
    upperLanding=[14180,4800,1370,1280],upperFirstLowerCartY=[5440-615,5440+615],
    upperDeckToRain=6100-6080,northGateMaximumTargetY=4800,
    additionalColumns=[[15780,4770],[15780,5900]],outerBeam=rail(75,150,5,1660,2000),secondPadToHoist=14270-(14120+125),railSeatOffset=14270-14120,seatMomentKNm=2*.150,
    preliminaryCageCentre=[14770,3380],longStopAllowanceFor25=45-25)
# A secured shipping trolley can fit the actual cage and extend the wheelbase for the native ramp.
cart_mass=gross+20;ramp_slope=350/(2590-1660);cosine=1/math.hypot(1,ramp_slope)
east['lowerShipping']={'grossKg':cart_mass,'size':[800,1230],'wheelbaseMm':1100,'cgHeightBudget':920,
    'lateralOffsetBudget':50,'rampHorizontalRun':930,'rise':350,'slope':ramp_slope,
    'rearWheelReserveUnder0point1g':1100/2-50-920*(ramp_slope+.1/cosine),
    'short480SameLoadingReserve':480/2-50-920*(ramp_slope+.1/cosine),
    'lineForceAt0point03RollingN':cart_mass*9.81*cosine*(ramp_slope+.03),
    'arrestDesignKN':1.5*cart_mass*9.81/1000,'minLongitudinalCageGap':(1320-1230)/2}
portal=rail(100,160,6,3080,4000);I=portal['inertia'];L=3080;w=1.5
portal['stressWith1point5KNmLine']=portal['stressMPa']+w*L**2/8*80/I
portal['deflectionWithLine']=portal['deflectionMm']+5*w*L**4/(384*200000*I)
portal['reactionKN']=2+w*L/2000
east['crossBeamComponent']=portal
# The scored article's radius/normal inset remains a conditional OAS target, not a new product profile.
east['westSeat']= {'footCentres':[[11020,4170],[11020,5010]],'pads':[160,160],
                    'sealCentre':[11030,4390],'sealRadius':100,
                    'nearestFootToSealKeepout':4390-4170-80-100}
east['tailRunway']={'bathCradleKg':gross,'widthAcrossWindow':pw,'lengthAlongRails':ph,
                     'goodsDollyKgAllowance':20,'loadedCageKg':gross+20,
                     'minCagePlanEachSide':(min(950,960)-pw)/2,'shelfHeightBudget':990}
material={'comparison':'No exemption for transit equipment or permanently retained constituents',
          'permanentChanges':'OAS removable infill and weather/guard restoration; no cut to slab/structural arch selected'}
control={'makerControl':'upstream in front of the handle; one operator near the moving machine',
         'nominalPositionQualified':False,'sideOnlyPlanIsNotManufacturerMethod':True,'upstreamControlAndSingleOperatorRequired':True,
         'loadedStairSelected':False,'routeChosen':'guarded upright east-window exchange, conditional on aperture and site',
         'historicalSaniformLength':1700,'historicalSaniformBareKg':41}
registry={}
for key,p in source.items():
    raw=p.read_bytes();registry[key]=hashlib.sha1(b'blob '+str(len(raw)).encode()+b'\0'+raw).hexdigest()
result={'sources':registry,'package':[pw,ph,height],'approach':room_path,'upperGallery':gallery,'groundPath':ground,
        'limits':control,'firstRelease':tip,'support':support,'throat':throat,'keeper':keeper_checks,'sections':sections,
        'boarding':boarding,'turn':landing,'longTurn':{k:v for k,v in long_case.items() if k!='route'},
        'stairs':flight,'front':front_result,'east':east,'material':material}
assert 11<sections['room']['minimumContinuousGap']<13 and sections['gallery']['minimumContinuousGap']>30
assert sections['earlier510SameDoorSweep']['minimumContinuousGap']<0 and throat['old730CrossingConflict']>130
assert 35<landing['loadGap']<37 and landing['attendantGap']>40 and landing['entireKitOnLevelWhileSteering']>25
assert long_case['entireKitOnLevelWhileSteering']<0 and landing['fixedRearOperatorGapSampled']<-200
assert landing['shoulderToGrip3DUpper']<600 and boarding['attendant']['armClearLowerMm']>40
assert ground_clear['minimumContinuousGap']>30 and 10<flight['headerReserve']<15
assert east_station_clear['minimumContinuousGap']>15 and east['pairedUprightCornerGap']>35
assert east['southPadToPotable']==75 and east['postToD2']==25 and east['hoistToPrimaryPair']==1110
assert east['secondPadToHoist']==25 and east['railSeatOffset']==150
assert east['newSouthGroundBeyondReserved']==2080 and east['lowerShipping']['rearWheelReserveUnder0point1g']>55
assert east['deep150CornerGap']<0 and east['railA']['deflectionMm']<3 and east['westSeat']['nearestFootToSealKeepout']>=35
def emit(path,data,check):
    if check:
        if not path.exists() or path.read_text()!=data:raise SystemExit(f'Stale generated file {path.name}')
    else:path.write_text(data)
if __name__=='__main__':
    from family_bath_exchange_figure import figure,site_plan
    check='--check' in sys.argv
    emit(HERE/'family-bath-exchange.json',json.dumps(result,indent=2)+'\n',check)
    emit(HERE/'family-bath-exchange.svg',figure(result),check)
    emit(HERE/'family-bath-exchange-site.svg',site_plan(result),check)
    print('Bath exchange: checked occupied door, two landing turns, native-control veto, arched window, two bridges and ground receivers.')
