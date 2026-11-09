"""Rear 5940: source-bound flush control and a raised whole-trap exchange. Millimetres."""
import math


def point_rect(p, rect):
    x,y,w,h = rect
    return math.hypot(max(x-p[0], p[0]-x-w, 0), max(y-p[1], p[1]-y-h, 0))


def rear_section(house, services, tray_first, structure, segbox):
    upper=house['upperFurniture']
    tray=upper['rear-shower1000']
    drop=services['interfaces']['rearShowerDrop']
    assert tray==[1802.5,8952.5,1000,1000] and drop['port']==[2122.5,9452.5,110]
    assert tray_first['tray']['drainLandLowerY']==-41.1
    assert tray_first['change']['well']==[1812.5,9252.5,400,400]
    assert structure['formedShowerOpening']['status'].startswith('formed 400x400')
    x,y = drop['trayDrainEvidence']['drainCentre']
    px,py,diameter=drop['port']
    assert (x,y)==(2012.5,9452.5)
    # The 2-inch U references are between axes (152.4) and to OUTSIDE the back (127).
    # Roll the entire almost-horizontal U about the X axis. The sockets remain parallel,
    # while the two ends have different invert elevations without an additional water seal.
    od, wall, spacing, outside_depth = 50.8, 1.65, 152.4, 127
    bore=od-2*wall
    radius=spacing/2
    tangent=outside_depth-radius-od/2
    angle=math.radians(6)
    lateral=spacing*math.cos(angle)
    crossfall=spacing*math.sin(angle)
    tip=x-167.5
    u_end=1815
    socket_face=tip+35
    u_run=2*(tip-u_end+tangent)+math.pi*radius
    turn_radius=75
    fixed_run=(px-tip-turn_radius)+math.pi*turn_radius/2+(lateral-turn_radius)
    assert min(px-tip-turn_radius,lateral-turn_radius)>0
    assert crossfall-4>u_run/40
    # Both cylindrical mating lands and the welded tangent stubs are level. Price the dry-down
    # of the complete removable part; the accumulated fall alone does not prove a clean outlet.
    housing_od=66
    cases=[]
    for rim in (0,55,65,120,135,145,155):
        seat=rim+tray_first['tray']['drainLandLowerY']
        bottom=seat-55
        outgoing=bottom+25
        back_axis=outgoing-crossfall-fixed_run/40
        low=back_axis-housing_od/2
        cases.append(dict(rim=rim,seat=seat,bodyBottom=bottom,firstAxis=outgoing,
                          secondAxis=outgoing-crossfall,axisAtDownturn=back_axis,
                          minHousingAboveFloor=low,marginAt8LinerWithTwo5=low-8-10,
                          bodyLowered15Above10Support=bottom-15-10))
    assert cases[-1]['marginAt8LinerWithTwo5']>7 and cases[-2]['marginAt8LinerWithTwo5']<0
    moving=[u_end-outside_depth-25,y-34,socket_face+20,y+lateral+34]
    off=55
    final=125
    assert moving[2]-off>tray[0] and tray[0]-(moving[2]-final)>25
    # A retained tube in the northern lane lets the complete drain body and uncut tail depart WEST.
    stroke=420; body=[tip-stroke,y-57.5,x+57.5-stroke,y+57.5]
    branch_clear=y+lateral-(y+57.5)-housing_od/2-10
    stand=[1395,9360,305,215]
    assert min(body[0]-stand[0],body[1]-stand[1],
               stand[0]+stand[2]-body[2],stand[1]+stand[3]-body[3])>=25
    assert branch_clear>50
    fixed={k:upper[k] for k in ('rear-shower1000','rear-WC','rear-basin','rear-cabinet',
                                'rear-west-low-box','service-emitter-rear-N')}
    assert house['sections']['firstFFL']==3450 and house['sections']['firstFloorRC']['top']==3370
    fixed.update({'open privacy door':[2072.5,10363,830,44],'normal service enclosure':[1590,9360,212.5,385]})
    def route(points,solids):
        return min((segbox(a,b,box)-300,name) for a,b in zip(points,points[1:]) for name,box in solids.items())
    entry=[[2500,10800],[1600,10800],[1550,10220],[1250,9850],[1225,9530]]
    retreat=[entry[-1],[1100,9860],[980,9850]]
    late=[[980,9850],[995,9550],[1050,9530]]
    parked={**fixed,'drain stand':stand}
    crew={'entry':entry,'entryClear':route(entry,fixed),'withdrawBeforeLowering':retreat,
          'retreatClear':route(retreat,fixed),'approachAfterCapture':late,'restClear':route(late,parked),
          'firstGripReach':math.dist([*entry[-1],460],[1575,9530,125]),
          'restGripReach':math.dist([*late[-1],460],[1430,9500,95])}
    assert min(crew['entryClear'][0],crew['retreatClear'][0],crew['restClear'][0])>=30
    # First shift two real mating sleeves together, then extract the U through the outer frame.
    # The portable return can fit a 300 x 280 cradle clear of the north/top foot and the open door.
    loop_route=[[((moving[0]+moving[2])/2)-final,(moving[1]+moving[3])/2],[1620,(moving[1]+moving[3])/2],[1620,10130]]
    def swept(a,b,w,h):
        return [min(a[0],b[0])-w/2,min(a[1],b[1])-h/2,abs(a[0]-b[0])+w,abs(a[1]-b[1])+h]
    def gap(a,b):
        return math.hypot(max(a[0]-b[0]-b[2],b[0]-a[0]-a[2],0),
                          max(a[1]-b[1]-b[3],b[1]-a[1]-a[3],0))
    loop_sweeps=[swept(a,b,280,285) for a,b in zip(loop_route,loop_route[1:])]
    # The independent supports remain below the package; the room-side facing is removed for this lift.
    safe={k:v for k,v in fixed.items() if k!='normal service enclosure'}
    loop_min=min((gap(box,v),k) for box in loop_sweeps for k,v in safe.items())
    assert loop_min[0]>0
    # The shower surface is the destination, so the raised threshold is intentional on this leg.
    # All other bodies, including the actual inward-facing open privacy leaf, remain obstacles.
    daily=entry[:3]+[[1740,10145],[1937,10055],[2120,9975],[2290,9900],[2320,9580]]
    obstacles={k:v for k,v in fixed.items() if k!='rear-shower1000'}
    daily_clear=route(daily,obstacles)
    assert daily_clear[0]>36
    # A separate wall-supported assist bar projects 130 from the finished east face. A north
    # curtain retracts to this end. Do not claim this small shower to be a wheelchair transfer.
    ax,ay=2120,9975;bx,by=2290,9900;frac=(tray[1]+tray[3]-ay)/(by-ay)
    tx=ax+frac*(bx-ax)
    grip=[2675,tray[1]+tray[3],1000]
    entry_reach=math.dist([tx,grip[1],1350],grip)
    # A nearer supplementary end on a positively locked wall rail is needed for the step itself.
    near_grip=[2580,grip[1],1000]
    near_reach=math.dist([tx,grip[1],1350],near_grip)
    assert near_reach<600
    rates={}
    for demand in (.15,.25,.5):
        speed=(demand/1000)/(math.pi*(bore/1000)**2/4)
        velocity_head=speed*speed/(2*9.81)*1000
        friction=.035*(u_run+fixed_run)/bore
        rates[str(demand)]={'speedAtFullBore':speed,
            'headAtK4PlusFriction':(4+friction)*velocity_head,
            'headAtK7PlusFriction':(7+friction)*velocity_head}
    # This sensitivity is not a model of the factory water seal or an open-channel certification.
    def half_q(mm):
        d=mm/1000
        return 1000*math.pi*d*d/8*(d/4)**(2/3)*math.sqrt(1/40)/.013
    return {'tray':tray,'apron':fixed['normal service enclosure'],'nativeFootRangeAboveSeat':[80,200],
            'nativeFeetInCaseA':4,'old400Well':tray_first['change']['well'],'unchangedSmallPort':drop['port'],
            'originalHatch':drop['clearHatch'],'keptLowerRoute':drop['branch'],'nativeDrainCentre':[x,y],
            'u':{'OD':od,'wallTrial':wall,'centres':spacing,'outsideDepth':outside_depth,'radius':radius,
                 'straightTangent':tangent,'rollDegrees':6,'planSpacing':lateral,'axisFall':crossfall,
                 'developed':u_run,'fallRequiredOneIn40':u_run/40,'afterOppositeTwo':crossfall-4,
                 'matingX':tip,'weldEndX':u_end,'mouthX':socket_face,'firstTipY':y,'returnTipY':y+lateral,
                 'outside':moving,'pairedWithdrawal':off,'freeFrameWithdrawal':final,
                 'gateClearAfter125':tray[0]-(moving[2]-final),'routeToFirstRest':loop_route,
                 'firstRestRouteClear':loop_min,'storedU':swept(loop_route[-1],loop_route[-1],280,285)},
            'fixedReturn':{'arcR':turn_radius,'afterU':fixed_run,'completeLength':u_run+fixed_run,
                           'fallOnGradedFixedPart':fixed_run/40,'bodyClearAfterPaired10':branch_clear},
            'entry':{'dailyPath':daily,'dailyBodyClear':daily_clear,'crossing':[tx,grip[1]],
                 'firstEastGrip':grip,'firstGripReach':entry_reach,
                 'wallCantileverGrip':near_grip,'nearStepGripReach':near_reach,
                 'nativeWallFace':2805.5,'requiredReachFromWall':2805.5-near_grip[0]},
            'water':{'sourceRatedLps':.5,'fullBoreHeadScreen':rates,'pipeOnlyHalfFullAtIDs':{str(mm):half_q(mm) for mm in (44,46,47.5,48)},
                     'fallInUIsNotFittingLossProof':True},'vertical':cases,'crew':crew,
            'withdrawnBody':body,'drainRest':stand,'bodyReleaseDrop':15,'bodySlide':stroke}
