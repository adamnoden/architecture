"""Connected first release of two close-coupled WCs. Model dimensions in mm and loads in N."""
import json
import math
from pathlib import Path
import runpy
import sys

HERE = Path(__file__).resolve().parent
old = runpy.run_path(str(HERE / 'wc-service-stations.py'))
rooms = old['solution']()
house, upper, principal = old['H'], old['U'], old['P']
local, prism, ptbox, segbox = (old[k] for k in ('local','prism','ptbox','segbox'))


def span(solid):
    return [solid[0], solid[1], solid[0]+solid[2], solid[1]+solid[3]]


def rectangle_gap(a,b):
    x,y,X,Y=span(a); l,m,L,M=span(b)
    return math.hypot(max(l-X,x-L,0),max(m-Y,y-M,0))


def moving_box(start, stop, width, length):
    """Union of an axis-aligned rectangular package on one orthogonal translation."""
    x,y=start; X,Y=stop
    assert x==X or y==Y
    return [min(x,X)-width/2,min(y,Y)-length/2,abs(x-X)+width,abs(y-Y)+length]


def solve_room(room):
    family = room=='family'
    retained=rooms[room]
    back=(house['familyWetTrial']['eastWetFace']-10,5900) if family else (11130,house['rooms']['principalBath']['northFinishedFace']-10)
    front=(-1,0) if family else (0,-1)
    # The stainless adaptor and turned branch set the fixture position, not the gross plan box.
    original_back=back
    if family:
        back=(back[0],back[1]-25)
    else:
        back=(back[0]+20,back[1])
    column=upper['family-local-soil-column' if family else 'principal-local-soil-column']
    stack=[column[0]+column[2]/2,column[1]+column[3]/2]
    right=(-front[1],front[0])
    lateral=abs(sum((stack[i]-back[i])*right[i] for i in (0,1)))
    old_depth=sum((stack[i]-back[i])*front[i] for i in (0,1))
    roll=math.atan(1/40)
    drift=lateral*math.tan(math.radians(2.5))/math.cos(roll)
    # Type 820 X1=74 is measured to the socket's internal shoulder; X2=136 is its outgoing plain end.
    def offset(setback, ceramic_entry, adaptor_length, stop_gap):
        turn=setback+ceramic_entry-adaptor_length-74-stop_gap
        return old_depth-turn+drift
    shift=offset(205,35,125,3)
    back=tuple(back[i]+front[i]*shift for i in (0,1))
    side, depth = (-1,450) if family else (-1,145)
    shoulder=(10485,6075) if family else (10520,7780)
    local_xy=lambda d,r:local(back,front,d,r)
    box=lambda d,D,r,R:prism(back,front,d,D,min(r,R),max(r,R))
    suite=box(0,640,-170,170)
    if family:
        fixed=retained['obstacles']
        room_bounds=retained['walls']
        entry=retained['route'][0]
    else:
        fixed=[upper['principal-shower900'],upper['principal-basin'],upper['principal-local-soil-column'],principal['CORNER']]
        room_bounds=principal['ROOM']
        entry=retained['route'][0]
    # The return tube and fixed-port rail are inside this low service territory.
    service=box(80,depth+15,side*205,side*240)
    body_gap=old['route']([entry,shoulder],fixed+[suite,service],room_bounds)
    assert body_gap>0
    # Parallel, upward-facing detachable connections. Their separable bridge lifts normal to both faces.
    # A 65 mm lateral spacing leaves the permanent port clear of the moving tail during forward withdrawal.
    tail_r,fixed_r=side*210,side*275
    tail=local_xy(depth,tail_r)
    feed=local_xy(depth,fixed_r)
    # The fixed incoming terminal lies on the room side of the sleeve, outside the moving hardware.
    # Both wrenches enter from the front or open flank; a basin/shroud is not a tool access opening.
    arm_min=float('inf'); tip_reach=0.; sweep_gap=float('inf')
    for target_r in (tail_r,fixed_r):
        target=local_xy(depth,target_r)
        for deg in range(0,31):
            a=math.radians(deg)
            tip=local_xy(depth+155*math.cos(a),target_r+side*155*math.sin(a))
            tip_reach=max(tip_reach,math.dist([*shoulder,520],[*tip,315]))
            sweep_gap=min(sweep_gap,*(segbox(target,tip,k) for k in fixed+[suite]))
            arm_min=min(arm_min,*(segbox(shoulder,tip,k) for k in fixed+[suite]))
    # Bound continuous 1 degree angular samples by max 1/2 step shift of the 155 long handle.
    tangent_allow=155*math.radians(.5)
    tools={'bodyReserve':body_gap,'maxShoulderToGrip':tip_reach+tangent_allow,
           'handleGapAfter18Radius':sweep_gap-18-tangent_allow,
           'forearmGapAfter30Radius':arm_min-30-tangent_allow}
    assert min(tools[k] for k in ['handleGapAfter18Radius','forearmGapAfter30Radius'])>0 and tools['maxShoulderToGrip']<600
    # The fixed support lies wholly outboard. The travelling half stays attached to its independent cradle.
    # No flexible live line crosses this break. The width of the rear steel carrier and capped mobile tail are included.
    support_r=(side*260,side*290)
    fixed_support=box(depth-25,depth+15,*support_r)
    carried_r=(min(-180,side*230),max(180,side*230))
    width=carried_r[1]-carried_r[0]
    loaded=box(-5,715,*carried_r)
    shifted=box(145,865,*carried_r)
    withdrawal=box(-5,865,*carried_r)
    clear_fixed=min(rectangle_gap(withdrawal,k) for k in fixed+[fixed_support])
    # Once the pack is 150 forward, arrest it and remove the capped rear tail and side shoe on a separate support.
    # Then continue with the intact 340-wide ceramic tank+pan in a symmetric braked 390-wide carrier.
    assert clear_fixed>0
    if family:
        centre=[back[0]-470,back[1]]
        path=[centre,[10425,back[1]],[10425,5900]]
        moving=[moving_box(a,b,690,390) for a,b in zip(path,path[1:])]
        next_fixed=[*fixed,fixed_support]
    else:
        centre=[back[0],back[1]-470]
        # The first local 150 clears the soil spigot, but the original sideways path crosses the wall port.
        # Advance another 70 on the narrow carrier. Cross west first; retreat north only after the entire
        # caddy is outside the fixed bracket, with the actual slider and shower still present.
        path=[centre,[centre[0],centre[1]-70],[10537.5,centre[1]-70],[10537.5,8865]]
        moving=[moving_box(a,b,390,690) for a,b in zip(path,path[1:])]
        next_fixed=[upper['principal-shower900'],upper['principal-basin'],upper['principal-local-soil-column'],principal['CORNER'],fixed_support,
                    principal['MAT']['door']['openLeaf'],principal['MAT']['bedroomTrial']['maintenanceBed']]
    rests=min(rectangle_gap(v,k) for v in moving for k in next_fixed)
    assert rests>0
    if not family:
        opening=principal['MAT']['door']['netOpen']
        assert opening[0]<path[-1][0]-195 and path[-1][0]+195<opening[1]
        prior=moving_box(centre,[centre[0]-240,centre[1]],390,690)
        assert rectangle_gap(prior,fixed_support)==0
    # All ordinary body, tool and first-wet tests retain the room's basin, bath/shower, and local soil column.
    if family:
        use=[entry,[10395,5850],[back[0]-955,back[1]]]
        feed_run=[rooms[room]['valve'],[10650,6360],[feed[0],6360],feed]
    else:
        use=[entry,[10520,7780],[10640,7650],[10660,7310],[10700,7080],[11045,7080]]
        feed_run=[rooms[room]['valve'],[10875,8085],feed]
    # First edge is the existing valve zone on a fixed wall. Other legs are independent of the mobile tail.
    feed_clear=min(segbox(a,b,v) for a,b in zip(feed_run,feed_run[1:]) for v in [suite,*fixed])
    use_clear=old['route'](use, [suite, service, fixed_support, *fixed],room_bounds)
    lip=local_xy(depth+15,side*242)
    sight=min(segbox(shoulder,lip,v) for v in [suite,*fixed])
    lens={'soilWitnessTongueWidth':145,'adapterMaxOD':135,'requiredClearVoid':150,
          'formedWidths':{'outer':145,'innerBetween1_5Returns':142,'jointNominalOutside':133},
          'tongueToClayAtMinimumVoidEach':(150-145)/2,'stackOrSealToInnerReturnEach':(142-135)/2,
          'sideLip':lip,'sideLipSightPlanClearance':sight,'runLegs':[
             {'from':'under socket','to':'rear trough','run':155,'fall':5},
             {'from':'rear trough','to':'service-side gutter','run':280,'fall':7},
             {'from':'gutter','to':'visible lip','run':depth-60,'fall':8}],
          'smallEndSetoutEach':2,'minimumResidualFall':5-2*2,
          'clearPanHeelOnRearTrough':120-5-95,'foulInvertAboveCatcherTop':180-67.5-95}
    for value in [use_clear,sight,feed_clear-7.5]: assert value>0, (room,use_clear,sight,feed_clear)
    floor_fix={
        'deliveredFixedBracketPassWidth':150-2*5,'directReleaseRequiresFull150Stroke':True,
        'strips':{'count':2,'width':32,'thickness':6,'length':635,'centresAcross':[-85,85],
                  'depth':[80,715],'trackEnd':890,'pull':150,'endReserve':890-715-150,
                  'massOfTwoBareKg':2*635*32*6*7.85e-6},
        'visibleLockBolts':[local_xy(680,-85),local_xy(680,85)],
        'guideStripRunOutSurface':box(715,890,-110,110),'underlayMinimumToProve':18,
        'movingInitialLength':720,'remainingAboveMinimumRebateFloor':18-6,
        'wetBoundary':'All removable lock fixings above the continuous membrane. Permanent anchors and upstands detailed at construction; no later drilling.'}
    # An R300 operator can face the front of the suite; the two forward locking screws
    # are outside the ceramic. Check the complete driver position and horizontal approach.
    # Use a 280 high kneeling shoulder and 75 high driver grip as a dimensional trial.
    toe=use[-1]
    toe_reaches=[math.dist([*toe,280],[*a,75]) for a in floor_fix['visibleLockBolts']]
    floor_fix['kneelingFrontStation']=toe
    floor_fix['furthestFrontDriverReach']=max(toe_reaches)
    assert floor_fix['furthestFrontDriverReach']<600
    assert min(rectangle_gap(floor_fix['guideStripRunOutSurface'],k) for k in fixed)>0
    flow={'stackAxis':stack,'originalBack':original_back,'branchLateral':lateral,'obliqueDrift':drift,
          'branchAxisFall':lateral/40,'horizontalSpigotCentre':180,'nominalStackEntryAboveFFL':180-lateral/40,
          'requiredFixtureForward':shift,'pairedDimensionalExtremes':[offset(215,45,124,0),offset(190,30,126,5)],
          'declaredSpigotSetback':205,'declaredCeramicEntry':35,'adaptorLength':125,'stopGap':3,
          'elbowX1X2R':[74,136,110],'rolledElbowDegrees':math.degrees(roll),
          'backClearAtTurn':10+shift+38-55, 'pipeAfterBendToStackAxis':lateral-136*math.cos(roll)}
    return {'soil':flow,'floorFixing':floor_fix,'depth':depth,'back':back,'front':front,'serviceSide':side,'carrierSideLimits':carried_r,'packedWidth':width,
            'tailPort':tail,'fixedPort':feed,'portGroupElevation':300,'spoolVerticalRelease':25,
            'operator':shoulder,'entry':entry,'tools':tools,'ordinaryWCApproach':use,'ordinaryApproachReserve':use_clear,
            'feedCentreline':feed_run,'fixedFeedBeforeTubeRadius':feed_clear,'fixedTerminal':fixed_support,'suite':suite,
            'travelling':loaded,'first150Sweep':withdrawal,'after150':shifted,'minFirstSweep':clear_fixed,
            'trimmedCarrierCentrePath':path,'afterFirst150Min':rests,'fixed':fixed,'wetWitness':lens}


def bath_replay(room):
    # Replay the actual #1453 pack, held leaf, grip and all room obstacles in this changed bathroom.
    orig=runpy.run_path(str(HERE/'family-bath-exchange.py'))
    x,y=room['back']; permanent=room['fixedTerminal']
    fixed={**orig['fixed'],'family-WC':orig['rectangle'](*room['suite']),
           'fixed feed and post':orig['rectangle'](permanent[0],permanent[1],40,6400-permanent[1]),
           'wet service return':orig['rectangle'](x-465,y+205,465,35)}
    keeper=(10500,6060)
    old_gap=old['ptbox'](orig['keeper'],room['suite'])-300
    keeper_body=orig['circle'](keeper,300)
    reserve=min(orig['poly_gap'](keeper_body,v) for v in fixed.values())
    fixed.update({'door attendant':keeper_body,'holding arm':orig['capsule'](keeper,orig['grip'],40),
                  'hand':orig['circle'](orig['grip'],40)})
    path=orig['room_path'][:2]+[[10485,4995,0],[10382.1,5456.6,53.7],[10124.6,5645.9,53.3],
                 [10066,5681.6,56.9],[9798.1,5851.9,57.5],[9765,5815,90]]
    room_test=orig['clear_path'](path,480,730,fixed,step=1)
    assert old_gap< -70 and reserve>13 and room_test['minimumContinuousGap']>11
    return {'keeper':keeper,'oldKeeperOverlap':-old_gap,'newKeeperReserve':reserve,
            'shoulderToGrip':math.dist(keeper,orig['grip']),'path':path,'newRoom':room_test,
            'onwardRouteAtSamePose':orig['sections']['gallery']}


def study():
    data={name:solve_room(name) for name in ('family','principal')}
    d=data['principal']
    fixed=principal['FIXED']
    old_fixed=dict(fixed)
    try:
        fixed['WC']=d['suite']
        fixed['tank']=d['suite']  # use the whole 340 x 640 rectangular ceramic envelope
        # Recheck with the actual open slider and jambs. The boxed-room screen at its entrance
        # was deliberately conservative and cannot locate the boundary across an open doorway.
        fixed['service rail']=prism(d['back'],d['front'],80,160,-240,-205)
        fixed['fixed support']=d['fixedTerminal']
        actual=lambda pts:min(principal['route_reserve'](a,b) for a,b in zip(pts,pts[1:]))
        d['openSliderOperatorReserve']=actual([d['entry'],d['operator']])
        d['openSliderOrdinaryReserve']=actual(d['ordinaryWCApproach'])
        assert min(d['openSliderOperatorReserve'],d['openSliderOrdinaryReserve'])>0
        del fixed['service rail'],fixed['fixed support']
        for depth in [145,280,450]:
            # Include the low rail and the two outboard service terminals, with their full extremes.
            fixed['local rail']=prism(d['back'],d['front'],80,depth+15,-240,-205)
            fixed['service terminal']=prism(d['back'],d['front'],depth-25,depth+15,-290,-260)
            value=principal['verify'](principal['POSES'])
            d['showerAt'+str(depth)]=value
    finally:
        fixed.clear();fixed.update(old_fixed)
    assert d['showerAt145']['body to room/fixtures/glazing']>20
    assert d['showerAt280']['body to room/fixtures/glazing']<0
    data['bath']=bath_replay(data['family'])
    data['handling']={'packedGrossItemAllowances_kg':[24,13,3],'temporaryCarrier_kg':10,
            'screenVertical_kN':(24+13+3+10)*9.81*1.5/1000, 'oneSaddleTarget_kN':1,
            'stockJackBase':[24*25.4,14.375*25.4], 'stockJackMinMaxHeight':[6.5*25.4,25.875*25.4],
            'stockJackNet_kg':22.05*.45359237,'claimedCompatibleWithCeramic':False,
            'supportScreen':'Wearable/service-only equipment. Delivered gross masses are upper design comparisons; weigh the actual drained suite, parts, support and residual water.'}
    return data


if __name__=='__main__':
    from upper_wc_release_figure import figure
    result=study()
    for filename,body in [('upper-wc-release.json',json.dumps(result,indent=2)+'\n'),('upper-wc-release.svg',figure(result))]:
        path=HERE/filename
        if '--check' in sys.argv:
            if not path.exists() or path.read_text()!=body:
                raise SystemExit('Stale '+filename)
        else:
            path.write_text(body)
    print('Two upper WCs: connected isolation, first wetting, retained socket, complete carrier travel, shower operation and bath exchange.')
