"""South Study occurrence: swept arch, ramp, paired glazing and inward head renewal, mm."""
import argparse
import json
import math
from pathlib import Path

HERE = Path(__file__).resolve().parent
PROJECT = HERE.parents[1]


def load(path):
    return json.loads((PROJECT / path).read_text())


def area(rad, centre_z, half_width, bottom):
    """Area under the upper circular arc between two vertical jambs."""
    return (half_width * math.sqrt(rad**2-half_width**2)
            + rad**2*math.asin(half_width/rad) + 2*half_width*(centre_z-bottom))


def segment_row(width, height, cols, rows, bar, bite):
    light_x = (width-(cols-1)*bar)/cols
    light_z = (height-(rows-1)*bar)/rows
    return {'count': cols*rows, 'clearWH': [light_x,light_z],
            'cutWH': [light_x+2*bite,light_z+2*bite],
            'visibleM2': cols*rows*light_x*light_z/1e6,
            'glassKg': cols*rows*(light_x+2*bite)*(light_z+2*bite)*0.00001}


def saturation(t):
    return 0.61094*math.exp(17.625*t/(t+243.04))  # kPa, water-surface comparison


def calculate():
    m=load('had/studies/water-replan.json')['model']
    old=load('mat/studies/study-window-glazing.json')
    ramp=load('mat/studies/front-threshold.json')
    native,section,manual,vig=load('mat/studies/study-coupled-window-sources.json')['sources']
    assert manual['ordinarySideHungReleaseDegrees']==90 and native['factoryBarFace']==19
    o=next(a for a in m['archOpeningRegister']['GROUND'] if a['id']=='south-window-0')
    req=next(a for a in m['windowRequirements'] if a['id']=='studySouth1800')
    assert o==old['opening'] and o['leaves']==1 and o['hinge']=='low' and o['width']==1000
    assert req['body']==[2580,765] and req['handle']==[2220,429.5]
    rad,centre_z=old['geometry']['rawRadius'],old['geometry']['centreZ']
    # OAS jamb depth 220..360, inner structural zone 262.5..402.5.
    setback,frame_depth,inner_zone=220,native['fixedFrameDepth'],262.5
    inset=old['geometry']['dryFinish']+manual['nominalPerimeterJoint']  # Proposed 12 mm fitting joint behind the lining.
    moving_inset=inset+section['outerJambFace']+section['sideGap']  # Native A-02-82 side frame face and operating gap; trial pivot at outer corner.
    half=o['width']/2-moving_inset
    hinge=o['centre']-half
    moving_rad=rad-moving_inset
    raw_at_hinge=centre_z+math.sqrt(rad**2-half**2)
    # Exact signed 90° witness. A developed point 10 mm inboard of the weather face
    # still traverses masonry. The glass and timber remain at their original height.
    u=setback-10
    old_z=centre_z+math.sqrt(moving_rad**2-(u-half)**2)
    max_depth=half-math.sqrt(moving_rad**2-(rad**2-half**2))
    assert old_z>raw_at_hinge and 90<max_depth<110
    turns=ramp['foldRepair']['revisedLandingsXYWH']
    upper_turn=turns[2]
    high_z=-sum(m['approaches']['front']['flights'][:2])/m['approaches']['front']['slope']
    assert upper_turn==[1800,-1200,2700,1200] and high_z==-900
    w=2*half
    angle=math.radians(30)
    witness=[hinge+w*math.cos(angle),setback-w*math.sin(angle)]
    assert upper_turn[0]<witness[0]<upper_turn[0]+upper_turn[2] and upper_turn[1]<witness[1]<0
    old_bottom=o['sill']+inset+section['sillFace']+section['sideGap']  # Native sill face, conservative full-leaf comparison.
    middle=[1250,2410]
    routine_hardware=50  # Maximum permitted hanging projection in the trial.
    # Head is fixed. The open rectangle stays below the raw spring throughout.
    # Rear moving parts sit 14 mm inside the front latch edge, even for the full depth bound.
    latch_allow=section['sideGap']
    latch_front=latch_allow+w-math.hypot(w,native['outerSashDepth'])
    latch_rear=latch_allow+w-math.hypot(w-14,frame_depth)
    assert min(latch_front,latch_rear)>2 and middle[1]<o['spring']
    assert ramp['foldRepair']['guardEach']==100 and turns[0][0]-ramp['foldRepair']['guardEach']>hinge+math.hypot(w,frame_depth)
    spec={'depth':frame_depth,'frontY':setback,'rearY':setback+frame_depth,
          'innerZoneBearingOverlap':setback+frame_depth-inner_zone,
          'exteriorAxisMaxFor90':max_depth,'overlapIfFrameMovedToMax':max(0,max_depth+frame_depth-inner_zone),
          'movingHingeX':hinge,'movingWidth':w,'roughArcAtHingeZ':raw_at_hinge,'initialShoulderX':hinge+u,
          'sweptShoulderXYZ':[hinge,10,old_z],'shoulderInterference':old_z-raw_at_hinge,
          'outerSightInset':moving_inset+52,
          'rectangleZ':middle,'middleToRawSpring':o['spring']-middle[1],'latchClearFrontRear':[latch_front,latch_rear]}
    clearance={'landing':upper_turn,'landingZ':high_z,'overLandingXYat30':witness,
               'oldHeightOnLanding':old_bottom-high_z,'newMinimumUnderHardware':middle[0]-routine_hardware-high_z,
               'newAfterTwo10':middle[0]-routine_hardware-high_z-20,
               'tipYat90':setback-w,'gapBetweenLowAndHalfLandings':
                   upper_turn[0]-(turns[-1][0]+turns[-1][2])-2*ramp['foldRepair']['guardEach']}
    assert clearance['oldHeightOnLanding']<2000<=clearance['newAfterTwo10']
    # One lower fixed tier, one rectangular opening tier and two fixed arched head cassettes.
    clear_half=half-native['outerSashFace']
    clear_r=moving_rad-native['outerSashFace']
    raw_half=o['width']/2
    bare_area=area(rad,centre_z,raw_half,o['sill'])/1e6
    frame_area=area(rad-inset,centre_z,raw_half-inset,o['sill']+inset)/1e6
    bar,bite=32,8
    sill=865
    lower_top=middle[0]-3-52
    upper_bottom=middle[1]+3+52
    lower=segment_row(2*clear_half,lower_top-sill,3,1,bar,bite)
    central=segment_row(2*clear_half,middle[1]-52-(middle[0]+46),3,3,bar,bite)
    inner=segment_row(2*clear_half,middle[1]-52-(middle[0]+46),1,1,0,bite)
    head_bar=64
    head_area=(area(clear_r,centre_z,clear_half,upper_bottom)-area(clear_r,centre_z,head_bar/2,upper_bottom))/1e6
    glazed=lower['visibleM2']+central['visibleM2']+head_area
    assert raw_half>clear_half>bar/2 and centre_z+math.sqrt(clear_r**2-clear_half**2)>upper_bottom
    pack=[374,310,100]  # One half-head module including its own frame, cut glass, handling and retained clips.
    max_rail_x=clear_half-head_bar/2
    max_rail_z=centre_z+math.sqrt(clear_r**2-(head_bar/2)**2)-upper_bottom
    assert max_rail_x+32<=pack[0] and max_rail_z+32<=pack[1]
    assert (pack[0]+12,pack[1]+12)==(386,322)
    # Independently removable cartridges. Concentric top arcs use normal offsets.
    bite_head,pocket_lead=16,6
    head_central_web=head_bar-2*(bite_head+pocket_lead)
    assert head_central_web==20 and bar-2*(bite_head+pocket_lead)<0
    half_pack_area=(area(clear_r+bite_head,centre_z,clear_half+bite_head,upper_bottom-bite_head)
                    -area(clear_r+bite_head,centre_z,head_bar/2-bite_head,upper_bottom-bite_head))/2e6
    full_pack_glass_bound=2*half_pack_area*10  # Two 4 mm panes, including the entire timber outline as glass.

    # Frame budget. Distinguish the glazed overlap of the two planes from timber/bar strips.
    fabric_limit=1.6
    frames=frame_area-glazed
    thermal=[]
    for centre_u,frame_u in [(1.6,1.1),(1.9,1.1),(1.9,1.4),(2.2,1.4)]:
        allowance=fabric_limit*frame_area-centre_u*glazed-frame_u*frames
        thermal.append({'centreU':centre_u,'opaqueU':frame_u,'remainingEdgeVentHardwareWK':allowance})
    climates=[]
    for outside in [-5,-10]:
        inside,ug=20,1.9
        cavity_face=outside+ug*(inside-outside)*(.04+.004)
        fraction=(saturation(cavity_face)-.8*saturation(outside))/(.6*saturation(inside)-.8*saturation(outside))
        climates.append({'outside':outside,'pairedRoomSurface':inside-.13*ug*(inside-outside),
                         'oldMonolithicRoomSurface':inside-.13*5.8*(inside-outside),
                         'outerPaneCavitySurface':cavity_face,'maximumRoomAirFraction':fraction})
    vig_u=vig['centreU']  # AGC FINEO 8 DoP A000522502. Credit only the aligned, unobscured central glass.
    gain=(1.9-vig_u)*central['visibleM2']
    baseline=next(e['remainingEdgeVentHardwareWK'] for e in thermal if e['centreU']==1.9 and e['opaqueU']==1.4)
    unit_mass=inner['glassKg']*sum(vig['glassPlyMm'])/4  # Four-plus-four product versus the four mm hard-coated inner glass.
    # The outside nine-pane weather lattice comes inward through the structural frame ONLY
    # after taking off the complete, independently captured warm inner sash, including its ring.
    lattice=[2*clear_half+40, central['clearWH'][1]*3+2*bar+40]
    throat=[810,1124]
    release=[(room-item)/2 for room,item in zip(throat,lattice)]
    assert min(release)-4>0 and min((w-throat[0])/2,(middle[1]-middle[0]-throat[1])/2)>=18
    glass={'frameAreaM2':frame_area,'rawM2':bare_area,'glassOverlapM2':glazed,'remainingOpaqueM2':frames,
           'outerBarWeb':bar-2*(bite+2),'oldVigWeb':old['geometry']['opposingRebateWeb'],
           'widenedVig':{'bar':52,'web':52-2*(15+3),'unit':[(810-104)/3+30,(2440-26-845-156)/4+30]},
           'lowerFixed':lower,'openOuter':central,'openInner':inner,'headOverlapM2':head_area,
           'glassOnlyOpenKg':central['glassKg']+inner['glassKg'],'halfHeadPackWHD':pack,
           'halfHeadSightWH':[max_rail_x,max_rail_z],'headCentreBar':head_bar,
           'oldHeadPocketWebAt32':bar-2*(bite_head+pocket_lead),'headPocketWeb':head_central_web,
           'halfPackTwoGlassKgUpperBound':full_pack_glass_bound,'pocketLeadMm':6,'adversePocketAfterTwo2':2,
           'thermalBudgetAgainst1p6':thermal,'humidity':climates,'warmStraightVig':{
               'ug':vig_u,'creditedM2':central['visibleM2'],'gainWK':gain,'edgeVentHardwareBudgetWK':baseline+gain,
               'innerKg':unit_mass,'coupledGlassOnlyKg':unit_mass+central['glassKg']},
           'closedLeafRelease':{'weatherLatticeWH':lattice,'clearThroatAfterInnerRingWH':throat,
                 'sideClearances':release,'afterTwo2':[n-4 for n in release],
                 'minimalSideAndHeadStructure':[(w-throat[0])/2,(middle[1]-middle[0]-throat[1])/2]},
           'stockReturnMaximumY':setback-w+w}
    desk,chair=m['groundFurniture']['study-desk'],m['groundFurniture']['study-chair']
    rad_body=m['studyDoorOperation']['bodyRadius']
    assert desk==[655,600,1600,700] and chair==[900,1400,1000,900] and rad_body==300
    # Move the CHAIR RESERVATION first, without asking that an actual chair fill it.
    chair_r=math.hypot(chair[2]/2,chair[3]/2)
    turn=[2250,2020]
    walls={a['id']:a for a in m['groundWalls']}
    cloak_w=walls['cloak-west']['finishedFaces'][0]-18
    cloak_n=walls['study-cloak-north']['finishedFaces'][0]-18
    wall_tip=walls['study-cloak-north']['a'][0]-18
    parked=[2325,1470,900,1000]
    chair_clear=[turn[1]-chair_r-(desk[1]+desk[3]),
                 math.hypot(wall_tip-turn[0],cloak_n-turn[1])-chair_r,
                 cloak_w-(parked[0]+parked[2]),cloak_n-(parked[1]+parked[3]),
                 parked[0]-(desk[0]+desk[2])]
    assert min(chair_clear)>25
    # A straight north desk shift follows. The operator enters east of the platform.
    platform=[1200,465,1200,700]
    desk_n=desk[1]+700
    emitter=m['groundFurniture']['service-emitter-study-W']
    margins=[desk[0]-(emitter[0]+emitter[2]), desk_n-(platform[1]+platform[3]),
             platform[1]-m['envelope']]
    assert min(margins)>=25
    shoulder_y=platform[1]+platform[3]/2
    shoulder_z=2500   # 1000 platform + 1500 shoulder trial; proof of actual kit remains due.
    max_reach=math.sqrt((pack[0]/2)**2+(shoulder_y-(setback+frame_depth))**2+
                        max(abs(upper_bottom-shoulder_z),abs(upper_bottom+pack[1]-shoulder_z))**2)
    assert max_reach<600
    service={'desk':desk,'chair':chair,'chairCentreTurn':turn,'chairRadiusBound':chair_r,'chairPark':parked,
             'chairClearances':chair_clear,'deskParkY':desk_n,'platformXYWH':platform,'platformMargins':margins,
             'roomShoulderZ':shoulder_z,'maximumGripReach':max_reach,'rejectedDraw150ToFinishedWall':setback+150-m['envelope'],
             'headAndLatticeDraw':250,'farFaceAfterDrawBeyondFinishedWall':setback+250-m['envelope'],
             'normalHandleReach':req['planReach'],'platformOverallToFace':shoulder_y-(setback+frame_depth)}
    return {'current':o['id'],'section':spec,'ramp':clearance,'glass':glass,'service':service}


def drawing(record):
    """Elevation and two dimensioned plans on independent scales."""
    s,r,g,service=(record[n] for n in ('section','ramp','glass','service'))
    ink,blue,green,red,oak='#243633','#356f80','#24624c','#ad4d3d','#84643c'
    svg=['<svg xmlns="http://www.w3.org/2000/svg" width="1250" height="650" viewBox="0 0 1250 650" role="img" aria-labelledby="t d">',
         '<title id="t">Study window and its two access routes</title><desc id="d">One short rectangular leaf moves between a fixed lower light and two fixed arch head modules. The retained arch shoulder would otherwise hit masonry. A raised ramp lies beneath the outward swing.</desc>',
         '<rect width="1250" height="650" fill="#faf9f4"/><g font-family="Arial,sans-serif">']
    def label(x,y,msg,size=14,col=ink,bold=False):
        weight='bold' if bold else 'normal'
        svg.append(f'<text x="{x:.1f}" y="{y:.1f}" fill="{col}" font-weight="{weight}" font-size="{size}">{msg}</text>')
    def rect(x,y,w,h,fill,stroke='none'):
        svg.append(f'<rect x="{x:.2f}" y="{y:.2f}" width="{w:.2f}" height="{h:.2f}" fill="{fill}" stroke="{stroke}"/>')
    def line(pts,col,sw=1,dash=''):
        pairs=' '.join(f'{x:.2f},{y:.2f}' for x,y in pts)
        svg.append(f'<polyline points="{pairs}" fill="none" stroke="{col}" stroke-width="{sw}" stroke-dasharray="{dash}"/>')
    label(30,38,'Study window   ·   Keep the arch fixed and the entrance ramp clear',27,bold=True)
    label(30,68,'One outward operating leaf, a fixed low light and two inward-removable head modules. Development geometry in millimetres.',16)
    line([(30,88),(1220,88)],'#a7b4ae')
    label(32,123,'01   South elevation',19,bold=True)
    label(436,123,'02   Swing over the ramp',19,bold=True)
    label(827,123,'03   Service from the room',19,bold=True)
    # All elevation curves use the same centre as the native segmental opening.
    k=.161
    X=lambda x:195+(x-1800)*k
    Z=lambda z:530-(z-750)*k
    rad,cz=1700/3,6850/3
    def arch(inset,bottom,colour):
        half,rr=500-inset,rad-inset
        side=cz+math.sqrt(rr*rr-half*half)
        svg.append(f'<path d="M {X(1800-half):.2f},{Z(bottom):.2f} L {X(1800-half):.2f},{Z(side):.2f} A {rr*k:.2f},{rr*k:.2f} 0 0 1 {X(1800+half):.2f},{Z(side):.2f} L {X(1800+half):.2f},{Z(bottom):.2f} Z" fill="{colour}"/>')
    def elev(x,z,w,h,fill):
        rect(X(x),Z(z+h),w*k,h*k,fill)
    arch(0,750,'#cec9bc'); arch(39,789,oak); arch(126,865,'#bad5d8')
    elev(1426,1195,748,101,oak);elev(1426,2358,748,107,oak)
    elev(1768,2465,64,255,oak)
    for x in [1654,1914]:
        elev(x,865,32,330,oak);elev(x,1296,32,1062,oak)
    for j in [1,2]:
        elev(1426,1296+j*(1062-64)/3+(j-1)*32,748,32,oak)
    line([(X(1374),Z(1250)),(X(2226),Z(1250)),(X(2226),Z(2410)),(X(1374),Z(2410)),(X(1374),Z(1250))],green,2.5)
    label(34,164,'Two half-heads seat inward',14,blue);line([(180,169),(182,Z(2660))],blue)
    label(281,Z(2410)+5,'+2410',14,green);label(281,Z(1250)+5,'+1250',14,green)
    label(34,563,'Green outline is the moving sash.',14,green)
    label(34,584,'Masonry sill +750, arch crown +2850.',13)
    # Scaled plan of the actual two overlapping approach levels and the swing.
    px=lambda x:440+.142*(x-1050)
    py=lambda y:233+.142*(500-y)
    def plan(a,colour,stroke='none'):
        xx,yy,w,h=a;rect(px(xx),py(yy+h),w*.142,h*.142,colour,stroke)
    plan([1050,-1200,450,1200],'#e6ddcc');plan([1800,-1200,1020,1200],'#e3cda9')
    line([(px(1050),py(0)),(px(2820),py(0))],oak,2)
    y=s['frontY'];xh=s['movingHingeX'];w=s['movingWidth']
    for deg in [0,30,90]:
        a=math.radians(deg)
        line([(px(xh),py(y)),(px(xh+w*math.cos(a)),py(y-w*math.sin(a)))],green,3 if deg in [0,90] else 1.4)
    arc=[(px(xh+w*math.cos(math.radians(i))),py(y-w*math.sin(math.radians(i)))) for i in range(91)]
    line(arc,green,1.5,'4 3')
    label(438,165,'Outside lies below the wall line.',14)
    label(438,191,'The tip crosses the higher landing at 30°.',13)
    label(px(1130),py(-1030),'−1800',13,oak);label(px(1885),py(-1030),'−900 landing',13,oak)
    label(438,522,'Old moving sill over the landing   1718 mm',14,red)
    label(438,547,'New hardware underside   2100 mm',14,green,True)
    label(438,571,'Two adverse 10 mm offsets leave 2080 mm.',13)
    # The revised room plan uses positive Y north/inward and the current desk.
    xx=lambda x:830+.115*(x-420)
    yy=lambda y:490-.115*(y-400)
    def room(a,col,stroke):
        x,y,w,h=a;rect(xx(x),yy(y+h),w*.115,h*.115,col,stroke)
    room(service['chairPark'],'#dbd0bf',oak)
    room([655,service['deskParkY'],1600,700],'#e9dfcd',oak)
    room(service['platformXYWH'],'#c3d9ce',green)
    line([(xx(520),yy(429.5)),(xx(3330),yy(429.5))],ink,2)
    line([(xx(1300),yy(429.5)),(xx(2300),yy(429.5))],blue,4)
    label(830,167,'Move the chair first, then slide the desk.',14)
    label(830,194,'Keep the glazed modules captured on the draw.',13)
    label(xx(800),yy(1560),'Desk',14,oak);label(xx(2460),yy(1910),'Chair',13,oak)
    label(xx(1285),yy(735),'Platform',14,green)
    label(830,522,'250 mm inward stroke clears the lining by 40.5.',14)
    label(830,547,'Platform, lifting fixture and restraint require',13)
    label(830,569,'verified support and installed access.',13)
    line([(30,601),(1220,601)],'#a7b4ae')
    label(30,628,'The 69 mm shoulder collision applies to the continuous moving arch at the 220 mm setback. The fixed head removes that swept interference.',14)
    return '\n'.join(svg+['</g></svg>'])+'\n'


if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--check',action='store_true')
    args=parser.parse_args()
    record=calculate()
    for suffix,body in [('json',json.dumps(record,indent=2,ensure_ascii=False)+'\n'),('svg',drawing(record))]:
        path=HERE/f'study-coupled-window.{suffix}'
        if args.check:
            assert path.read_text()==body, f'Stale {path.name}'
        else:
            path.write_text(body)
