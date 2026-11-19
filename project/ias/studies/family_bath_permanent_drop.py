"""Real family-bath outlet and release below it. Relative setout is millimetres."""
import math


def gap(a,b):
    return math.hypot(max(a[0]-b[0]-b[2],b[0]-a[0]-a[2],0),
                      max(a[1]-b[1]-b[3],b[1]-a[1]-a[3],0))


def margins(small,big):
    x,y,w,h=small;X,Y,W,H=big
    return [x-X,y-Y,X+W-x-w,Y+H-y-h]


def family_drop(house, services):
    bath=services['interfaces']['familyBathDrop'];plant=services['plant']
    assert bath==house['architecturalServices']['familyBathDrop']
    native,lower=bath['primarySource'],bath['lower']
    assert native['nativeModel']=='363-1' and native['body']==house['upperFurniture']['family-bath1700']
    wx,wy,hole=native['nativeWasteHole'];assert hole==52
    direction=(.6,.8)
    def pos(rad):return [wx+direction[0]*rad,wy+direction[1]*rad]
    # The figure's bare threaded face excludes the loose compression nut.
    # "Inset" is measured only from that exact face to the supplied PE-HD tip.
    def radius(i):return 240+54-i
    x,y=pos(radius(24));assert (x,y)==(11012,4366)
    ox,oy=bath['port']['centre'];dx,dy=x-ox,y-oy
    ex,ey,ez=lower['route'][-1]
    tt=ez+(abs(ey-y)+abs(x-ex))/lower['gradient']
    assert abs(tt-2733.65)<1e-6
    floor=lower['finishedPanelUnderside']
    assert floor==2587.5
    work=lower['qualifiedEquipmentField']
    fixture={'cupTrialEntryBeyondBareFace':24,'hypotheticalEntriesAndFloorCentres':[
        [i,radius(i),*pos(radius(i))] for i in (20,24,27)],
        'wasteHole':[wx,wy,hole],'nativeTip':pos(240),'newFloorPort':[x,y,110],
        'nativeTurnDeg':math.degrees(math.acos(-direction[0])),'availableOnFavouredSide':130,
        'sealToFront':native['body'][1]+native['body'][3]-y-100,
        'sealToEast':native['body'][0]+native['body'][2]-x-100,
        'sealEastOfNearestFootAxis':x-100-max(pt[0] for pt in native['nativeFootAxes']),
        'downlegEndAt560NoSlope':native['nativeWasteHoleLocalZ']-89+59-64.5,
        'upperPlainTipStrokeTrial':24+5,'upperTrialShiftXY':[-29*direction[0],-29*direction[1]],
        'downLeg':{'diameter':44,'axisToTip':64.5,'straightAtEnd':40},
        'requiredReturn_m':((abs(ey-y)+abs(x-ex))/1000),'turnZ':tt}
    # Keep the body and its compression tail at the matched elevation until the shell flange has cleared.
    # Lowering the still-connected trap first would shear the 43 horizontal connection.
    stand=[11020,4845,550];grips=[[11010,4380,380],[11062,4385,450]]
    fixture['upperFirstRelease']={'fixedElbowAndStemStay':True,'independentShellVerticalLift':40,
          'maximumRetainedFlangeProjection':25,'pairedAfterTwo5':40-25-10,
          'frontPanel':bath['upperConfiguredKit']['upperServicePanel'],'existingFirstCouplingXZ':[10994,120],
          'postFlangeDryPullAlongAxis':29,'operator':stand,'extendedToolGripTargets':grips,
          'maxGripReach':max(math.dist(stand,t) for t in grips),
          'bodyToRoomSideAtBathFront':stand[1]-(native['body'][1]+native['body'][3])-300,
          'originalFootCentres':native['nativeFootAxes']}
    assert fixture['upperFirstRelease']['maxGripReach']<600
    # One 110 opening eliminates a clear interval on each pitch. A 12 bar centre must be
    # outside radius61. Compare translations modulo150 without pretending to know mesh phase.
    allowed=150-2*(55+6)
    mods=[abs(dx)%150,abs(dy)%150]
    no_common=all(allowed<q<150-allowed for q in mods)
    assert no_common
    uls=1.35*7.5+1.5*2
    span=2367.5
    structure={'shift':[dx,dy],'centreDistance':math.hypot(dx,dy),'holeEdgeSeparation':math.hypot(dx,dy)-110,
          'nominalFourMatLayers':'H12 at 150, top/bottom in X and Y. Cage phase is unknown.',
          'safePhaseWidth':allowed,'phaseShiftXY':mods,'noCommonClearPhaseOnEitherAxis':no_common,
          'onEachFaceMaxOneEachAxis':110+12<150,'preformedVolume_l':math.pi*(.055**2)*.2*1000,
          'clearEWSpan':span,'ulsCorridor_kN':uls*.110*(span/1000),
          'edgeToOuterCollectorFace':11597.5-(x+55)}
    assert abs(structure['edgeToOuterCollectorFace']-530.5)<1e-6
    deck=870;head=deck+1750;shoulder=deck+1450; arm=600
    cases=[]
    for A in (2830,2860,3000):
        dz=A-shoulder
        arm_at=lambda z: 200+(90-200)*(z-shoulder)/dz
        cases.append({'A':A,'verticalToT':A-tt,'spaceAfter54BareFace':A-tt-54,
          'bareReach':math.hypot(110,dz),'armRadiusAtCeiling':arm_at(floor),
          'armToTurnWith40Arm50TurnAndTwo5':arm_at(tt+50)-50-40-10,
          'toHeadAtRest':tt-50-head,'comparison':arm-dz,
          'upperStemStrokeTo100':house['sections']['firstFFL']-A+100})
    assert cases[1]['bareReach']<555 and cases[1]['spaceAfter54BareFace']>72
    assert cases[1]['upperStemStrokeTo100']==690 and cases[2]['bareReach']>600
    extents={'stair water riser':plant['riserGross'],'cylinder station':plant['cylinder']['station'],
             'buffer station':plant['primaryBuffer']['station'],'controls':plant['controlsHydraulics'],
             'north radiator':plant['emitterJoin']['radComplete'],'empty north rack':[11458,3760,74,347],
             'selected cold bridge envelope':[10053,3933,1059,74],'old cold leg at 500':[11188,3150,24,1150]}
    frame=[10560,4131,860,470]
    ladder={'model':'Werner AdjustaStepPRO 75076','unfolded':frame,'platformHeight':870,
            'overallHeight':1500,'folded':[1640,470,140],'net_kg':5.7,'workingHeight':2620,
            'positionInField':margins(frame,work),'gapToObjects':{k:gap(frame,b) for k,b in extents.items()},
            'nativeDeckRegistrationToVerify':[x-frame[0],y-frame[1]],'shankTarget':2860,
            'supportedDriveGrip':2550,'driveDrop':310,'headTop':head}
    assert ladder['gapToObjects']['old cold leg at 500']==0
    # Imported baseline's incoming water is expressly incompatible; later bridge is an alternative.
    assert min(v for k,v in ladder['gapToObjects'].items() if k!='old cold leg at 500')>40
    hatches=[]
    for size in (400,450):
        clear=[x-size/2,y+10-size/2,size,size]
        # Both alternatives centre 10 north of the pipe at Y4376.
        outer=[clear[0]-20,clear[1]-20,size+40,size+40]
        hatches.append({'clear':clear,'gross':outer,'toWorkField':margins(outer,work),
            'headClear':min(margins([x-150,y-150,300,300],clear)),
            'armAfterAllowance':size/2-cases[1]['armRadiusAtCeiling']-40-10,
            'wholeSweptSpoolClear':min(margins([x-50,y-70,100,220],clear)),
            'lowestMovingLeaf':floor-size,'headToNorthLeaf':clear[1]+size-y-150-20-10,
            'outerToMainPipe':outer[0]-10510,'outerToSecondary':outer[0]-10584,
            'toEastDryWall':11570.5-outer[0]-outer[2],
            'extraClear_m2':(size**2-400**2)/1e6,'extraGross_m2':((size+40)**2-440**2)/1e6})
    assert hatches[1]['clear']==[10787,4151,450,450] and min(hatches[1]['toWorkField'])>=79
    assert hatches[1]['armAfterAllowance']>29 and hatches[1]['wholeSweptSpoolClear']>=85
    return {'fixture':fixture,'structure':structure,'upperUnionCases':cases,'hatches':hatches,
            'ladder':ladder,'postReleaseOperator':[10580,4450],'spoolStrokes':[[0,-20,0],[0,0,-20],[0,0,-450]],
            'sourceHatch':lower['clearHatch'],'sourceTerminal':lower['route'][-1],
            'scope':'A prepared source change, including fixed independent support. No cross-brand fitting, structural bar, protected hatch or temporary work has a site approval.'}
