import math


def point_segment(point,a,b):
    v=[y-x for x,y in zip(a,b)];d=sum(x*x for x in v)
    t=max(0,min(1,sum((p-x)*u for p,x,u in zip(point,a,v))/d)) if d else 0
    return math.sqrt(sum((p-x-t*u)**2 for p,x,u in zip(point,a,v)))


def segment_distance(a,b,c,d):
    u=[y-x for x,y in zip(a,b)];v=[y-x for x,y in zip(c,d)];w=[x-y for x,y in zip(a,c)]
    dot=lambda x,y:sum(a*b for a,b in zip(x,y))
    aa,bb,cc,dd,ee=dot(u,u),dot(u,v),dot(v,v),dot(u,w),dot(v,w)
    den=aa*cc-bb*bb
    candidates=[point_segment(a,c,d),point_segment(b,c,d),point_segment(c,a,b),point_segment(d,a,b)]
    if den>1e-12:
        t=(bb*ee-cc*dd)/den;q=(aa*ee-bb*dd)/den
        if 0<=t<=1 and 0<=q<=1:candidates.append(math.sqrt(sum((x+t*y-q*z)**2 for x,y,z in zip(w,u,v))))
    return min(candidates)


def segment_box(a,b,low,high):
    direction=[y-x for x,y in zip(a,b)];breaks=[0.,1.]
    for x,v,lo,hi in zip(a,direction,low,high):
        if v:
            breaks.extend(t for t in ((lo-x)/v,(hi-x)/v) if 0<t<1)
    breaks=sorted(set(breaks));best=math.inf
    for first,last in zip(breaks,breaks[1:]):
        mid=(first+last)/2;active=[]
        for x,v,lo,hi in zip(a,direction,low,high):
            p=x+v*mid
            if p<lo:active.append((x-lo,v))
            elif p>hi:active.append((x-hi,v))
        denominator=sum(v*v for _,v in active)
        stationary=-sum(x*v for x,v in active)/denominator if denominator else mid
        for t in [first,last,max(first,min(last,stationary))]:
            best=min(best,sum(max(lo-(x+v*t),0,x+v*t-hi)**2 for x,v,lo,hi in zip(a,direction,low,high)))
    return math.sqrt(best)


def floor_opening_body_clearance(start,end,opening,radius=300,setting=5):
    low,high=opening
    return segment_box([*start,0],[*end,0],[*low,0],[*high,0])-radius-setting


def half_coordinates(s,half):
    side=-1 if half=='south' else 1
    clear=(s['waterWidthMm']-s['centralFlangeMm'])/2
    clear_centre=s['centreYmm']+side*(s['centralFlangeMm']/2+clear/2)
    outer_centre=s['centreYmm']+side*(s['waterWidthMm']+2*s['bodyMm']+2*s['flangeWidthMm']+s['lidButtGapMm'])/4
    return clear,clear_centre,outer_centre


def capture_geometry(s,station,half,lid_z):
    clear,cy,_=half_coordinates(s,half)
    pitch=(clear+2*s['boltEdgeOffsetMm'])/(s['boltsOnShortSide']-1)
    offset=pitch*s['bailOffsetFraction'];span=s['bailLegHalfSpanMm'];pinspan=s['bailPinHalfSpanMm']
    capsules=[];boxes=[];pins=[];tongues=[];legs=[];footprints=[];attachment_ok=True
    for side in [-1,1]:
        px=station+side*pinspan;py=cy+side*offset
        lx=station+side*span;ly=py
        local_lid=lid_z-(px-station)/s['slopeRatio']
        footbottom=local_lid+s['lidRimMm']+s['bailTaperSeatMm']
        fork_low=footbottom-4;fork_high=footbottom+s['bailFootPlateMm']+4
        fx=px-side*15
        box=lambda name,low,high:{'id':name+str(side),'lowMm':low,'highMm':high}
        tongue=box('lifting-tongue',[px-40,py-s['bailFootWidthMm']/2,footbottom],[px+40,py+s['bailFootWidthMm']/2,footbottom+s['bailFootPlateMm']])
        boxes.append(tongue);tongues.append(tongue)
        seat_low=max(s['lidClearLengthMm']/2,pinspan-40);seat_high=min(s['lidClearLengthMm']/2+s['flangeWidthMm'],pinspan+40)
        attachment_ok=attachment_ok and seat_high-seat_low>=15
        seat_low=seat_high-15
        ends=sorted([station+side*seat_low,station+side*seat_high])
        rim_z=[lid_z-(xx-station)/s['slopeRatio']+s['lidRimMm'] for xx in ends]
        attachment_ok=attachment_ok and footbottom>max(rim_z)
        boxes.append(box('taper-seat',[ends[0],py-s['bailFootWidthMm']/2,min(rim_z)],[ends[1],py+s['bailFootWidthMm']/2,footbottom]))
        boxes.extend([box('fork-lower',[fx-30,py-s['bailFootWidthMm']/2,fork_low],[fx+30,py+s['bailFootWidthMm']/2,fork_low+3]),
                      box('fork-upper',[fx-30,py-s['bailFootWidthMm']/2,fork_high-3],[fx+30,py+s['bailFootWidthMm']/2,fork_high]),
                      box('fork-back',[fx-30,py-s['bailFootWidthMm']/2-3,fork_low],[fx+30,py-s['bailFootWidthMm']/2,fork_high])])
        pin_bottom=fork_low;pin_head=fork_high+1+7
        capsules.append({'id':'shoulder-pin'+str(side),'aMm':[px,py,pin_bottom],'bMm':[px,py,pin_head-7],'radiusMm':5})
        capsules.append({'id':'shoulder-pin-head'+str(side),'aMm':[px,py,pin_head-7],'bMm':[px,py,pin_head],'radiusMm':9})
        leg={'id':'bail-leg'+str(side),'aMm':[lx,ly,fork_high],'bMm':[lx,ly,lid_z+s['capturedBailHeightMm']],'radiusMm':8}
        capsules.append(leg);legs.append(leg)
        pins.append({'id':'capture-pin'+str(side),'xyMm':[px,py],'headZMm':pin_head,'holeDiameterMm':12,'shoulderDiameterMm':10,
                     'shoulderLengthMm':s['bailFootPlateMm']+6,'withdrawalMm':s['bailFootPlateMm']+9,'threadDiameterMm':8,'threadLengthMm':3,'upperForkHeadGapMm':1,
                     'threadTorqueNm':1,'primaryGravityPath':'Forklower bears under liftingtongue; threaded shoulder pin retains against withdrawal without clamping the jaw gap.'})
        footprints.append({'xyMm':[px,py],'rimOverlapXmm':ends,
                           'footPlateMm':[80,s['bailFootWidthMm'],s['bailFootPlateMm']],'weldedTaperSeatMm':[15,s['bailFootWidthMm'],s['bailTaperSeatMm']]})
    capsules.append({'id':'bail-crossbar','aMm':legs[0]['bMm'],'bMm':legs[1]['bMm'],'radiusMm':8})
    lid_length=s['lidClearLengthMm']+2*s['flangeWidthMm'];outer=(s['waterWidthMm']+2*s['bodyMm']+2*s['flangeWidthMm']-s['lidButtGapMm'])/2
    _,_,outer_centre=half_coordinates(s,half)
    low=[station-lid_length/2,outer_centre-outer/2];high=[station+lid_length/2,outer_centre+outer/2]
    for cap in capsules:
        for i in range(2):low[i]=min(low[i],cap['aMm'][i]-cap['radiusMm'],cap['bMm'][i]-cap['radiusMm']);high[i]=max(high[i],cap['aMm'][i]+cap['radiusMm'],cap['bMm'][i]+cap['radiusMm'])
    for box in boxes:
        for i in range(2):low[i]=min(low[i],box['lowMm'][i]);high[i]=max(high[i],box['highMm'][i])
    open_y=(s['waterWidthMm']+2*s['bodyMm']+2*s['flangeWidthMm']+2*s['frameGapMm'])/2
    lift_gap=min(low[0]-(station-275),(station+275)-high[0],low[1]-(s['centreYmm']-open_y),s['centreYmm']+open_y-high[1])-5
    return {'liftingTongueRimAttachmentGeometryPass':attachment_ok,'lidAndCapturePlanBoundsMm':[low,high],'minimumContinuousLiftThroughFloorClearanceAfter5Mm':lift_gap,'capsules':capsules,'boxes':boxes,'pins':pins,'tongues':tongues,'footprints':footprints,
            'forkSlideYMm':40,'mechanicalHolePlayMm':1,'roomSettingMm':5,
            'crossbarSpanMm':math.dist(legs[0]['bMm'],legs[1]['bMm']),
            'tubeStockLengthMm':sum(math.dist(c['aMm'],c['bMm']) for c in capsules if c['id'].startswith('bail-')),
            'positiveCaptureSequence':'Lid held by its pressurebolts. Lower horizontalforks40south of tongues into stated1mm jawplay, slide40north, thread both captive shoulderpins fromabove with800shaft. Keep capture through last pressurebolt and firstrefit; reverse slide onlyafter pressurebolts retain lid.',
            'availableStockOrPhysicalCaptureAccepted':False}


def clearance(tool,capture,setting=5):
    values=[]
    for item in tool:
        for target in capture['capsules']:
            values.append((segment_distance(item['aMm'],item['bMm'],target['aMm'],target['bMm'])-item['radiusMm']-target['radiusMm']-setting,item['id'],target['id']))
        for target in capture['boxes']:
            values.append((segment_box(item['aMm'],item['bMm'],target['lowMm'],target['highMm'])-item['radiusMm']-setting,item['id'],target['id']))
    return min(values)


def tool_parts(bolt,hand,shaft=350,pin=False):
    x,y,z=bolt;top=hand[2]
    if pin:
        return [{'id':'pinsetter-shaft','aMm':[x,y,z+8],'bMm':[x,y,top],'radiusMm':5},
                {'id':'pinsetter-handle','aMm':[x,y,top],'bMm':hand,'radiusMm':5}]
    return [{'id':'socket','aMm':[x,y,z-9],'bMm':[x,y,z+25],'radiusMm':13},
            {'id':'extension','aMm':[x,y,z+25],'bMm':[x,y,top-12.5],'radiusMm':10},
            {'id':'ratchet-head','aMm':[x,y,top-12.5],'bMm':[x,y,top+12.5],'radiusMm':25},
            {'id':'ratchet-handle','aMm':[x,y,top],'bMm':hand,'radiusMm':15}]


def room_clearance(tool,room):
    low,high=room
    return min(min(min(min(c['aMm'][i],c['bMm'][i])-low[i],high[i]-max(c['aMm'][i],c['bMm'][i]))-c['radiusMm']-5 for i in range(3)) for c in tool)


def bolt_access(s,station,half,operator,ffl,bolt_z,lid_z,gallery):
    clear,cy,_=half_coordinates(s,half)
    y0=cy-clear/2;y1=cy+clear/2
    xs=[station-s['lidClearLengthMm']/2-s['boltEdgeOffsetMm']+i*(s['lidClearLengthMm']+2*s['boltEdgeOffsetMm'])/(s['boltsOnLongSide']-1) for i in range(int(s['boltsOnLongSide']))]
    ys=[y0-s['boltEdgeOffsetMm']+i*(clear+2*s['boltEdgeOffsetMm'])/(s['boltsOnShortSide']-1) for i in range(int(s['boltsOnShortSide']))]
    positions=[(x,y) for x in xs for y in (ys[0],ys[-1])]+[(x,y) for x in (xs[0],xs[-1]) for y in ys[1:-1]]
    capture=capture_geometry(s,station,half,lid_z)
    room=([gallery[0],4250,350],[gallery[1],8155.5,ffl+3170]) if station==8650 else ([9722.5,6300,350],[13500 if station==12200 else 12000,7500,ffl+2550])
    bodies=[[x,operator[1]] for x in [8490,8650,8890]] if station==8650 else [[operator[0],y] for y in [operator[1],6610,6700,6875,7050,7190]]
    controls=[];failures=[]
    for x,y in positions:
        z=bolt_z-(x-station)/s['slopeRatio'];selected=None;best_score=-math.inf
        fixed=tool_parts([x,y,z],[x,y,z+375])[:-1]
        target_score=min(10,clearance(fixed,capture)[0],room_clearance(fixed,room))
        for body in (bodies if target_score>=0 else []):
            angle=math.atan2(body[1]-y,body[0]-x)
            for offset in [0,-10,10,-20,20,-30,30,-40,40,-50,50,-60,60]:
                poses=[]
                for sweep in [-10,0,10]:
                    a=angle+math.radians(offset+sweep);hand=[x+600*math.cos(a),y+600*math.sin(a),z+375]
                    reach=math.dist(hand,[body[0],body[1],ffl+640]);parts=tool_parts([x,y,z],hand)
                    gap,part,target=clearance(parts,capture)
                    poses.append({'sweepDeg':sweep,'handXYZmm':hand,'shoulderReachMm':reach,'captureClearanceAfter5Mm':gap,
                                  'controllingParts':[part,target],'roomClearanceAfter5Mm':room_clearance(parts,room),'toolParts':parts})
                continuous=continuous_stroke([x,y,z],body,ffl,angle+math.radians(offset),capture,room)
                if continuous['maximumShoulderReachMm']<=600 and min(continuous['minimumCaptureClearanceAfter5Mm'],continuous['roomClearanceAfter5Mm'])>=0:
                    score=min(continuous['minimumCaptureClearanceAfter5Mm'],continuous['roomClearanceAfter5Mm'],600-continuous['maximumShoulderReachMm'])
                    if score>best_score:
                        best_score=score;selected={'boltXYZmm':[x,y,z],'operatorBodyCentreXYmm':body,'ratchetOrientationOffsetDeg':offset,'staffSweep':poses,'continuousStroke':continuous}
                    if score>=target_score-1e-8:break
            if selected and best_score>=target_score-1e-8:break
        if not selected:
            failures.append([x,y,z]);selected={'boltXYZmm':[x,y,z],'operatorBodyCentreXYmm':operator,'ratchetOrientationOffsetDeg':None,'staffSweep':[]}
        controls.append(selected)
    valid=[p for b in controls for p in b['staffSweep']]
    installation=capture_installation(s,capture,[[x,y,bolt_z-(x-station)/s['slopeRatio']] for x,y in positions],operator,ffl,room)
    return {'captureInstallation':installation,'socketVerticalExtensionMm':350,'socketHeadAllowanceMm':25,'ratchetLeverMm':600,'ratchetSwingDegrees':20,
            'maximumAllBoltToolReachMm':max((p['shoulderReachMm'] for p in valid),default=0),
            'minimumAllBoltCaptureClearanceAfter5Mm':min((b['continuousStroke']['minimumCaptureClearanceAfter5Mm'] for b in controls if b.get('continuousStroke')),default=-1),
            'toolCaptureGeometryFailureBolts':failures,'allBoltControls':controls,'captureGeometry':capture,
            'trialTorqueRangeNm':[.15*s['boltPreloadKN']*10,.25*s['boltPreloadKN']*10],
            'requiredHandForceRangeN':[.15*s['boltPreloadKN']*10/.6,.25*s['boltPreloadKN']*10/.6],
            'capturedSocketToolRatingAccepted':False}


def capture_installation(s,capture,bolts,operator,ffl,room):
    slide=capture['forkSlideYMm'];checks=[]
    moving=[c if c['id'].startswith('bail-') else {**c,'aMm':[c['aMm'][0],c['aMm'][1],c['aMm'][2]+s['bailFootPlateMm']+9],'bMm':[c['bMm'][0],c['bMm'][1],c['bMm'][2]+s['bailFootPlateMm']+9]} for c in capture['capsules']]
    for item in moving:
        low=[min(a,b)-item['radiusMm'] for a,b in zip(item['aMm'],item['bMm'])]
        high=[max(a,b)+item['radiusMm'] for a,b in zip(item['aMm'],item['bMm'])]
        low[1]-=slide
        for bolt in bolts:
            x,y,z=bolt
            checks.append(segment_box([x,y,z-9],[x,y,z],low,high)-17/math.sqrt(3)-5)
    for item in capture['boxes']:
        if not item['id'].startswith('fork-'):continue
        low=list(item['lowMm']);high=list(item['highMm']);low[1]-=slide
        for x,y,z in bolts:checks.append(segment_box([x,y,z-9],[x,y,z],low,high)-17/math.sqrt(3)-5)
    pin_checks=[]
    for pin in capture['pins']:
        px,py=pin['xyMm']
        target_id='shoulder-pin'+pin['id'].replace('capture-pin','')
        target_head=target_id.replace('shoulder-pin','shoulder-pin-head')
        remaining={**capture,'capsules':[c for c in capture['capsules'] if c['id'] not in [target_id,target_head]]}
        poses=[]
        for withdrawal in [0,pin['withdrawalMm']]:
            z=pin['headZMm']+withdrawal
            angle=math.atan2(operator[1]-py,operator[0]-px)
            for sweep in [-10,0,10]:
                a=angle+math.radians(sweep);hand=[px+600*math.cos(a),py+600*math.sin(a),z+800]
                parts=tool_parts([px,py,z],hand,pin=True)
                gap,part,target=clearance(parts,remaining)
                reach=math.dist(hand,[operator[0],operator[1],ffl+640])
                poses.append({'withdrawalMm':withdrawal,'sweepDeg':sweep,'handXYZmm':hand,'reachMm':reach,
                              'captureClearanceAfter5Mm':gap,'roomClearanceAfter5Mm':room_clearance(parts,room),'controllingParts':[part,target]})
        pin_checks.append({'id':pin['id'],'verticalShaftMm':800,'horizontalLeverMm':600,'shaftDiameterMm':10,
                           'threadTorqueNm':1,'requiredHandForceN':1/.6,'strokeMm':pin['withdrawalMm'],'hexBitEnvelopeMm':[7,7,13],'bitInsertionIntoOwnPinHeadMm':5,'minimumGuidedBitToOwnForkAfter1Mm':pin['headZMm']-5-max(b['highMm'][2] for b in capture['boxes'] if b['id'].startswith('fork-upper') and b['lowMm'][0]<=px<=b['highMm'][0])-1,'poses':poses})
    return {'minimumContinuousForkInsertionToRetainedBoltClearanceAfter5Mm':min(checks),
            'continuousSlideYMm':slide,'pinsWithdrawnDuringForkSlideMm':s['bailFootPlateMm']+9,'pinActuation':pin_checks,
            'minimumPinToolCaptureClearanceAfter5Mm':min(v['captureClearanceAfter5Mm'] for c in pin_checks for v in c['poses']),
            'maximumPinToolReachMm':max(v['reachMm'] for c in pin_checks for v in c['poses']),
            'pinToolStockMassKg':math.pi*10**2/4*(800+600)*8e-6,
            'phaseRule':'Thread both captive shoulderpins before final pressurebolt release. Keep bail throughfirstrefit; unthread pins15 and reverse40slide onlyafter pressurebolts retain lid. Pinmate contact is intentional; all otherparts checked.'}


def angle_inside(angle,centre,half):
    return abs((angle-centre+math.pi)%(2*math.pi)-math.pi)<=half+1e-12


def sector_point_distance(point,origin,radius,centre,half):
    x,y,z=[a-b for a,b in zip(point,origin)];r=math.hypot(x,y)
    if r==0 or angle_inside(math.atan2(y,x),centre,half):horizontal=max(0,r-radius)
    else:
        horizontal=min(point_segment([x,y],[0,0],[radius*math.cos(a),radius*math.sin(a)]) for a in [centre-half,centre+half])
    return math.hypot(horizontal,z)


def sector_segment_distance(a,b,origin,radius,centre,half):
    if a[:2]==b[:2]:return sector_point_distance([a[0],a[1],max(min(a[2],b[2]),min(max(a[2],b[2]),origin[2]))],origin,radius,centre,half)
    low,high=0.,1.
    f=lambda t:sector_point_distance([x+t*(y-x) for x,y in zip(a,b)],origin,radius,centre,half)
    for _ in range(65):
        first=(2*low+high)/3;last=(low+2*high)/3
        if f(first)<f(last):high=last
        else:low=first
    return min(f(0),f(1),f((low+high)/2))-math.dist(a,b)*(2/3)**65


def continuous_stroke(bolt,body,ffl,centre,capture,room):
    origin=[bolt[0],bolt[1],bolt[2]+375];half=math.radians(10);radius=600
    angles=[centre-half,centre+half]+[a for a in [0,math.pi/2,math.pi,3*math.pi/2] if angle_inside(a,centre,half)]
    low=[origin[0]+min(0,*[radius*math.cos(a) for a in angles]),origin[1]+min(0,*[radius*math.sin(a) for a in angles]),origin[2]]
    high=[origin[0]+max(0,*[radius*math.cos(a) for a in angles]),origin[1]+max(0,*[radius*math.sin(a) for a in angles]),origin[2]]
    fixed=tool_parts(bolt,origin)[:-1];gaps=[clearance(fixed,capture)[0]]
    for c in capture['capsules']:
        vertical_gap=max(min(c['aMm'][2],c['bMm'][2])-origin[2],origin[2]-max(c['aMm'][2],c['bMm'][2]),0)
        if vertical_gap>15+c['radiusMm']+15:distance=vertical_gap
        else:distance=sector_segment_distance(c['aMm'],c['bMm'],origin,radius,centre,half)
        gaps.append(distance-15-c['radiusMm']-5)
    for b in capture['boxes']:
        distance=math.sqrt(sum(max(lo-hi2,lo2-hi,0)**2 for lo,hi,lo2,hi2 in zip(low,high,b['lowMm'],b['highMm'])))
        gaps.append(distance-15-5)
    room_gap=min(room_clearance(fixed,room),min(min(low[i]-room[0][i],room[1][i]-high[i])-15-5 for i in range(3)))
    direction=math.atan2(body[1]-origin[1],body[0]-origin[0])
    reach_angles=[centre-half,centre+half]+([direction+math.pi] if angle_inside(direction+math.pi,centre,half) else [])
    reach=max(math.dist([origin[0]+radius*math.cos(a),origin[1]+radius*math.sin(a),origin[2]],[body[0],body[1],ffl+640]) for a in reach_angles)
    return {'minimumCaptureClearanceAfter5Mm':min(gaps),'roomClearanceAfter5Mm':room_gap,'maximumShoulderReachMm':reach,
            'angleIntervalRadians':[centre-half,centre+half],'method':'Continuous filled20degree handle sector against vertical capsules exactly; separated horizontal bar/plate bounds conservative. Three rendered poses are witnesses, not the stroke proof.'}
