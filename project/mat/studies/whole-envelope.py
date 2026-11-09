"""Finite house-scale alternatives. All distances mm unless the key says otherwise."""
import argparse
import json
from math import cos, hypot, pi, radians, sin, sqrt
from pathlib import Path

HERE=Path(__file__).resolve().parent
PROJECT=HERE.parents[1]
def read(rel): return json.loads((PROJECT/rel).read_text())


def garden():
    a=read('mat/studies/loggia-soffit.json'); portal=read('had/studies/water-replan.json')['model']['insulatedPortal']
    beam=read('str/studies/current-house-floor-stops.json')['newLoops']['outer']
    st=read('str/studies/open-loggia-support.json')['north_arches']
    assert beam['coreWidthDepth']==[140,750] and beam['topBottomZ']==[3920,3170]
    assert 'H8 closed at100' in beam['reinforcement'] and a['northShoulder']['overlapUpperLowerGlass']==72.5
    cold=a['northShoulder']['trialReceiverFaceY']
    # Clear the 220-wide original spreader reservations at 4700 and 7300.
    reserve=read('str/studies/current-house-floor-closure.json')['rcEdgeAlternative']['ordinaryPositiveRodDetail']
    assert '220x100x30' in reserve['studPair']
    posts=[4875+450*i for i in range(6)]
    margin=min(abs(x-station)-110-40 for x in posts for station in (4700,7300))
    end_tributary=(posts[0]-4500+(posts[1]-posts[0])/2)/1000
    service=.1025*4*20*end_tributary
    design=1.35*service
    top_bearing_y=cold-70
    eccentric=(11948.75-top_bearing_y)/1000
    reaction=design*eccentric/.495
    # Plate/angle shelf at one bracket. Two 8 x 120-deep vertical gussets.
    toe_moment=design*(11948.75-cold)/1000
    gusset_stress=toe_moment*1e6/(2*8*120**2/6)
    # Over- and under-straps are built against the form / top bed. Two 80 x 6
    # saddle legs share the vertical tension only if the fabricated frame does so.
    hold=st['tie_and_bore']['tie_tension_max']*1000
    assert st['tie_and_bore']['plate']==[150,150,15] and st['tie_and_bore']['nut']==[50,30]
    pin=28; eye=24; ear=10; side_gap=2
    pins=[5200,6800]; spring_z=portal['tie']['centre']
    half_span=eye/2+side_gap+ear/2
    def finish(x):return portal['centreZ']+sqrt(portal['finishedRadius']**2-(x-6000)**2)
    vmax=hold/(2*pi*pin**2/4)
    m=hold*(2*half_span+5)/4
    bend=m/(pi*pin**3/32)
    after_lift=min(finish(pins[0]-40),finish(pins[1]+40))-(spring_z+30+65)
    fixed_alias=portal['piers']['gardenNS'][0]+st['tie_and_bore']['bore_axis_NS']
    assert fixed_alias==11667.5 and after_lift>65 and sqrt(bend**2+3*vmax**2)<200/1.1
    assert margin==25 and end_tributary==.600
    return {'ring':{'widthDepth':beam['coreWidthDepth'],'topBottom':beam['topBottomZ'],'coldFaceY':cold,
                    'bearingAtY':top_bearing_y,'bracketX':posts,'rodCrossbarToCollarMM':margin,'endTributaryM':end_tributary,'toeY':11977.5,'adverseBrickBearing':75,
                    'serviceKN':service,'factoredKN':design,'pairKN':reaction,'toeMomentKNm':toe_moment,
                    'gussetMPa':gusset_stress,'topBearingMPa':design*1000/(80*120),
                    'padMPa':reaction*1000/(80*80),'grossBrickRenewalTonnes':3*4*.1025*2000/1000,
                    'grossSaddleSteelKg':6*(2*.75+2*.14)*.08*.006*8000},
            'tie':{'thrustKN':hold/1000,'pinX':pins,'pinDia':pin,'earEyeEar':[ear,eye,ear],
                   'bendMPaAdverse':bend,'doubleShearMPa':vmax,'vonMisesMPa':sqrt(bend**2+3*vmax**2),
                   'eyeBearingMPa':hold/(pin*eye),'earBearingMPa':hold/(2*pin*ear),
                   'eyeNetMPa':hold/((60-pin)*eye),'lift':65,'movingBottomClearsEye':65-60,
                   'archClearAfterLift':after_lift,'lowerHeadroomCourtGarden':[portal['tie']['courtCentralHeadroom']-5,portal['tie']['gardenCentralHeadroom']-5],
                   'gardenTieY':fixed_alias,'northRoomFaceY':12000-429.5,
                   'plateNearestY':fixed_alias-75,'dryFaceMissingBy':fixed_alias-75-(12000-429.5)}}


def roof():
    r=read('mat/studies/ring-roof-family.json')
    chosen=read('had/studies/court-intake-selection.json')
    c=r['catchment']['revisedCourt']; joints=r['load']['joints']; v=r['openValley']
    assert chosen['id']=='HAD-COURT-INTAKE-01' and c['openSide']==2950 and v['openWidth']==200
    old=joints['totalValleyHipRidgeAndSaddleKg']; area=old/v['leadKgM2Code4']
    length=c['valleyLength']; blank=length+250; secondary=.760*blank/1000*4
    expansion=blank*.000016*80
    angle=radians(r['catchment']['valleyPitch'])
    # The continuous lower strip arrives as unprofiled coil around a 300 mm mandrel.
    # Conservation of cross-sectional strip area gives the loaded outer radius.
    od=2*sqrt(300**2+blank*.5/pi)
    # SW trial and its mirrors, on the selected eave deck. The original rest
    # is retained below the elevated coil. No support foot can occupy it.
    frame=chosen['frame']; capture=frame['capture']; station=[]
    gross_square=(760+od)/sqrt(2)+100
    coil_top=capture['secondaryZ']+75
    lower_clear=coil_top-od-25-max(capture['carrierMovementZ'])
    for case in frame['cases']:
        east=case['corner'] in ('SE','NE'); north=case['corner'] in ('NW','NE')
        def locate(x,y):return [12000-x if east else x,12000-y if north else y]
        center=locate(5300,5300); feet=[locate(x,y) for x,y in ((4750,4750),(5850,5050),(5050,5850),(5950,5950))]
        rx,ry,rw,rh=case['rest']; dx,dy,dw,dh=case['deck']
        for x,y in feet:
            assert dx<=x-80 and x+80<=dx+dw and dy<=y-80 and y+80<=dy+dh
            assert x+80<=rx or x-80>=rx+rw or y+80<=ry or y-80>=ry+rh
        assert all(v>=gross_square/2 for v in (center[0]-dx,dx+dw-center[0],center[1]-dy,dy+dh-center[1]))
        station.append({'corner':case['corner'],'rollXY':center,'feet':feet})
    assert lower_clear>35 and 5300-gross_square/2-capture['existingGutterFront']>60
    net_mass=(area+secondary)*4
    heat_growth_normal=expansion*cos(angle)/sqrt(2)
    steel_bed=2*.001*8000*secondary       # fully supported metal bed, separate from 0.5 ply
    gage=.5
    bend_strain=gage/(2*300)
    costs={'steelSheetM2':area+secondary,'changeFor10GBPperM2':10*(area+secondary),
           'steelBedM2':secondary,'individualValleyPrimaryKg':v['lengthEachOfThree']/1000*.6*4}
    assert 300*sin(angle)>90 and od+150+250>r['renewal']['fixedCoverMinimumGap']
    assert all(row['deck'][2:]==[1800,1800] for row in chosen['frame']['cases'])
    return {'leadReferenceKg':old,'exposedDevelopedM2':area,'steelSpecialsKg':area*4,
            'lowerTraysM2':secondary,'lowerTraysKg':secondary*4,'steelSupportBedsKg':steel_bed,
            'reductionBeforeClipsAndNewFramingKg':old-net_mass-steel_bed,
            'valleyLength':length,'valleyPitch':r['catchment']['valleyPitch'],'continuousBlank':blank,
            'primaryLapVertical':300*sin(angle),'primaryFreeLapAfter10And80K':300-10-v['lengthEachOfThree']*.000016*80,
            'fullLowerTrayExpansion80K':expansion,'primarySecondary20LessMotionAndTwo5':20-heat_growth_normal-10,
            'rollOD':od,'coilMassKg':blank/1000*.760*4,'coilOuterElasticStressMPaAt193GPa':193000*bend_strain,
            'genericCoverShortBy':od+400-r['renewal']['fixedCoverMinimumGap'],
            'pitchedCornerAfter250LiftMm':r['renewal']['pitchedEnvelopeGapsAtCentreAndCorner'][1]+250,
            'loadedCradlePlanSquare':gross_square,'cradleTop':coil_top,'undersideToCarriage':lower_clear,
            'cradleToFixedGutterFront':5300-gross_square/2-capture['existingGutterFront'],
            'eaveStations':station,'upperMaintenanceDeckSide':1800,'costSensitivity':costs,
            'boardOtherKg':r['materials']['sarketOtherUndeclaredKgInFlatArea'],'valleyLps':c['valleyLps']}


def opening():
    w=read('mat/studies/study-coupled-window.json'); g=w['glass']; s=w['section']
    assert s['frontY']==220 and s['rearY']==348 and s['depth']==128
    deck=g['openInner']; cut=deck['cutWH']; area=g['openOuter']['visibleM2']
    result=[]
    initial=1.9*g['glassOverlapM2']+1.4*g['remainingOpaqueM2']-1.6*g['frameAreaM2']
    for extra_r in (.0,.15,.25,.35):
        ug=1/(1/1.9+extra_r)
        result.append({'extraEffectiveR':extra_r,'centreU':ug,'extraLossBudgetWK':area*(1.9-ug)-initial})
    goal=lambda bridge:1/(1.9-(initial+bridge)/area)-1/1.9
    new_mass=g['glassOnlyOpenKg']+deck['glassKg']
    y=[[237,241],[259,263],[279,283]]
    assert 220<=y[0][0] and y[-1][1]<=348 and g['closedLeafRelease']['afterTwo2']==[7.,7.]
    assert abs(new_mass-g['warmStraightVig']['coupledGlassOnlyKg'])<1e-5
    structural=read('str/studies/reconciled-house-interface.json')
    edit=next(o for o in structural['openingEdits'] if o['level']=='GROUND' and o['id']==w['current'])
    assert [edit['old'],edit['new']]==[1800,2100]
    shift=edit['new']-edit['old']; ramp=read('mat/studies/front-threshold.json')['foldRepair']
    hinge=s['movingHingeX']+shift; extent=hinge+hypot(s['movingWidth'],s['depth'])
    approach=hypot(2580-(2220+shift),765-429.5)
    # Support each of the two independently removable warm panes; the middle
    # ring is the only extra object which must pass the 810 x 1124 throat.
    middle=[794,1108]; throat=g['closedLeafRelease']['clearThroatAfterInnerRingWH']
    middle_clear=[(t-z)/2-2*2 for t,z in zip(throat,middle)]
    assert middle_clear==[4,4]
    full=45*9.81/1000
    return {'paneY':y,'addedPaneMM':cut,'windowCentreX':edit['new'],'hingeX':hinge,
            'controlReachAtExistingStance':approach,'movingXBound':extent,
            'lowerTurnRailMargin':ramp['revisedLandingsXYWH'][0][0]-ramp['guardEach']-extent,
            'middleRingOuter':middle,'middleRingAfterTwo2':middle_clear,'glassKg':new_mass,'sourcePairGlassKg':g['glassOnlyOpenKg'],
            'clearLightM2':area,'grossGlassM2':cut[0]*cut[1]/1e6,'massTargetKg':45,
            'targetWeightKN':full,'exampleHingeCoupleKN':full*.426/.98,
            'windMomentKNmAt1p5':1.5*.852*1.160*.426,
            'wholeWindowFrameArea':g['frameAreaM2'],'options':result,'minimumExtraR':goal(0),
            'minimumExtraRWithPoint15WKOtherLosses':goal(.15),
            'extraLeakM3hAfterPoint15AtR025':max(0,result[2]['extraLossBudgetWK']-.15)*3600/(1.2*1005),
            'thirdPaneTradeRateExVATperM2':34.18,'addedGlassSupplyAtRateGBP':cut[0]*cut[1]/1e6*34.18,
            'clearThroat':g['closedLeafRelease']['clearThroatAfterInnerRingWH']}


def seal():
    j=read('had/studies/water-replan.json')['renewal']['joint']
    f=read('mat/studies/upper-access-renewal.results.json')['frameScreen']
    assert j['splitX']==10050 and j['gasket']['sealLand']==20 and j['preliminaryFrameCase']['totalBoltPreloadAssumedN']==8000
    width=6.35; bottom=600; sides=j['reinforcingUFrame']['sideHeight']; path=bottom+2*sides
    loads=[]
    for kpa in (62,100,200,300):
        line=kpa/1000*width
        bottom_force=bottom*line
        # Take the whole distributed bottom magnitude on either simplified
        # bottom frame (conservative for a symmetric component comparison).
        # Side point-load cantilever comparison bounds more than the side UDL.
        delta=2*max(f['crossDeflection_mm']*bottom_force/4000,f['sideDeflection_mm']*sides*line/4000)
        loads.append({'pressureKPa':kpa,'bottomForceN':bottom_force,'totalN':path*line,
                      'twoFaceOpeningMM':delta,'largestGapMM':.480+.030+delta,
                      'minimumCompressionFraction':1-(.480+.030+delta)/.740})
    # 0.42 lower limit from 50% of 0.84; 0.555 upper limit from 75% of 0.74.
    allowed_delta=.555-(.480+.030)
    limit=100*allowed_delta/loads[1]['twoFaceOpeningMM']
    assert loads[1]['minimumCompressionFraction']>.25 and loads[-1]['minimumCompressionFraction']<.25
    return {'jointX':j['splitX'],'gasketWidthMM':width,'availableLandMM':j['gasket']['sealLand'],
            'edgeMarginMM':(20-width)/2,'activeCentrelineMM':path,'sealVolumeCM3':path*width*.79/1000,
            'foamMassAt352g':path*width*.79/1e9*352*1000,'workingGap':.480,'flatnessAndSettingPlusMinus':.030,
            'minimumGapMM':.450,'maxCompression':1-.450/.840,'openingBudgetMM':allowed_delta,
            'framePressureCeilingKPa':limit,'loads':loads,'broadMetalMeanMPa':8000/(path*20),
            'maxBandAt135MPa':8000/(path*135),'bore':j['boltDiameter']}


def build():
    house=read('had/studies/water-replan.json')['model']
    edits={(r['level'],r['id']):r for r in read('str/studies/reconciled-house-interface.json')['openingEdits']}
    occurrences=[]
    for level, cuts in house['openings'].items():
        for o in cuts:
            selected=edits.get((level,o['id']))
            if selected:
                assert selected['old']==o['centre']
            occurrences.append([level,o['id'],o['kind'],selected['new'] if selected else o['centre']])
    assert len(occurrences)==49 and len(edits)==16
    assert sum(o[2]=='window' for o in occurrences)==43
    return {'garden':garden(),'roof':roof(),'studyWindow':opening(),'eastJoint':seal(),'occurrences':occurrences}


if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--check',action='store_true')
    parser.add_argument('--frame-audit',action='store_true')
    options=parser.parse_args()
    result=build()
    frame=HERE/'whole-envelope-roof.json'
    if options.frame_audit:
        from whole_envelope_roof import readback
        text=json.dumps(readback(result['roof']),indent=2)+'\n'
        if options.check:
            if frame.read_text()!=text:raise SystemExit('Stale incremental roof reactions')
        else:frame.write_text(text)
    card=json.loads(frame.read_text())
    assert len(card['rows'])==22 and abs(card['totalNewKN']-(result['roof']['steelSpecialsKg']+result['roof']['lowerTraysKg']+result['roof']['steelSupportBedsKg'])*.00981)<.001
    from whole_envelope_figure import figure
    for name,content in [('whole-envelope.json',json.dumps(result,indent=2)+'\n'),('whole-envelope.svg',figure(result))]:
        dest=HERE/name
        if options.check:
            if dest.read_text()!=content:raise SystemExit('Stale '+name)
        else:dest.write_text(content)
    print('Envelope: matched shelf, accessible tie, secondary valley, three-pane opening and stopped E joint reproduced.')
