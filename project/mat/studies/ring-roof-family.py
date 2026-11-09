"""Two full covering families on the joined square roof. Dimensions mm unless noted."""
import argparse
import json
import math
from pathlib import Path
from ring_roof_family_figure import draw

HERE = Path(__file__).resolve().parent
PROJECT = HERE.parents[1]


def read(name):
    return json.loads((PROJECT / name).read_text())


def bending(span, width, depth, gauge, ultimate_kpa, service_kpa):
    # Simple span strip. The uniform pressure times slope area bounds the smaller
    # plan area for gravity. This is not a site uplift or timber design.
    section = width*depth**2/6
    inertia = width*depth**3/12
    return {'span':span,'uniformStressMPa':ultimate_kpa/1000*gauge*span**2/(8*section),
            'deflectionAtE10000':5*(service_kpa/1000*gauge)*span**4/(384*10000*inertia),
            'oneKNPointStressMPa':1000*span/(4*section)}


def opening(length, gross, foot, pitch, closed_ends=0, mesh=.5, adverse=10):
    feet = math.ceil((length-2*closed_ends)/pitch)
    clear = length-2*closed_ends-feet*foot
    return {'gross':gross,'usableLength':clear,'numberOfFeet':feet,
            'screenFraction':mesh,'adverseNetMm2':(gross-adverse)*clear*mesh}


def compare():
    native=read('mat/studies/ring-roof-family-sources.json')
    slate,board=native['slate'],native['sarket']
    rewind=read('str/studies/house-corner-rewind.json')
    roof=read('had/studies/water-replan.json')['model']['roofDevelopment']
    edge=read('mat/studies/raised-roof-edge.json')
    detail=read('mat/studies/loggia-roof-section.json')
    steel=read('str/studies/current-house-welded-network.json')
    storm=read('mat/studies/front-threshold.json')['water']['rainMmH']
    assert roof['pitch']==detail['pitch']==25 and storm==216
    c=math.cos(math.radians(roof['pitch']))
    t=math.tan(math.radians(roof['pitch']))
    levels=edge['fieldVentRoutes']['levels']
    outer,court=levels['outerFaceWidthsMm'][0], levels['courtFaceWidthsMm'][0]
    ridge=edge['fieldVentRoutes']['ridgeAxisAreaBookkeeping']['sideLengthMm']
    run=(outer-ridge)/2
    assert run==(ridge-court)/2==2325
    chord=math.sqrt(2+t*t)
    diagonal=run*chord
    plan=(outer**2-court**2)/1e6
    surface=plan/c
    valley=run**2/1e6  # Two triangular half-faces per physical valley.
    straight=court*run/1e6
    court_roof=4*(valley+straight)
    assert math.isclose(plan,steel['globalOrigins']['planArea'])
    assert math.isclose(court_roof,steel['rainCatchment']['offsetInnerRoofM2'])
    assert math.isclose(court_roof+court**2/1e6,steel['rainCatchment']['combinedM2'])
    flow=storm*valley/3600
    catch={'outerCourtRidgeSides':[outer,court,ridge],'perpendicularRun':run,'slopeLength':run/c,
           'fullValleyLength':diagonal,'valleyPitch':math.degrees(math.atan(t/math.sqrt(2))),
           'planM2':plan,'surfaceM2':surface,'valleyPlanM2':valley,'directCourtStripPerFaceM2':straight,
           'innerRoofPlanM2':court_roof,'courtWithOpenSkyM2':court_roof+court**2/1e6,
           'valleyLps':flow,'combinedCourtLps':storm*(court_roof+court**2/1e6)/3600}
    # A 50 mm slate nose leaves 150 of the prior 200 for a fascia-to-wall soffit.
    # Preserve two dry 25 mm mounting margins; extend only the COURT eave.
    add_eave=75
    inner_eave=court-2*add_eave
    inner_run=(ridge-inner_eave)/2
    new_plan=(outer**2-inner_eave**2)/1e6
    new_surface=new_plan/c
    new_valley=inner_run**2/1e6
    new_inner=4*(new_valley+inner_eave*inner_run/1e6)
    assert math.isclose(new_inner+inner_eave**2/1e6,steel['rainCatchment']['combinedM2'])
    catch['revisedCourt']={'overhang':200+add_eave,'openSide':inner_eave,'openCourtM2':inner_eave**2/1e6,
                           'clearSoffitBetween25Margins':200+add_eave-50-2*25,'oldClearSoffit':200-50-2*25,
                           'innerFaceLength':inner_run/c,'valleyLength':inner_run*chord,'valleyPlanM2':new_valley,
                           'innerRoofPlanM2':new_inner,'roofPlanM2':new_plan,'roofSlopeM2':new_surface,
                           'valleyLps':storm*new_valley/3600,'extraRoofPlanM2':new_plan-plan,
                           'normalInnerRoofLps':storm*new_inner/3600,'oldNormalInnerRoofLps':storm*court_roof/3600,
                           'unchangedCourtFailureLps':storm*(new_inner+inner_eave**2/1e6)/3600}
    # Penrhyn Capital, 500x300, nominal 5.5, +/-35% thickness on its Kitemark.
    # Worst three-ply local geometry does not multiply published mean unit mass.
    thick=3*slate['capitalThickness']*(1+slate['thicknessToleranceFraction'])
    retained_depth=edge['retainedDepthToLowerBoardUndersideNormal']
    original_upper=sum(d[1] for d in detail['layersWeatherToRoom'][:4])
    assert math.isclose(original_upper,75.7) and math.isclose(retained_depth,420.7)
    steel_grid=detail['counterrailGrid']
    rail=steel_grid['section'][0]
    free_cross=60
    void=rail+free_cross
    batten=25
    felt=3  # Dimensional ceiling for the installed product/laps, not a TDS thickness.
    reference_corner=edge['upperClearanceNormal']
    base_wall,base_ridge=edge['trialWallLineAndFieldRidgeZ']
    old_cap=edge['trialRidgeCapApexAndEdgeZ'][0]
    assert rewind['roof']['northField']==edge['trialWallLineAndFieldRidgeZ']
    assert rewind['roof']['northCap']==edge['trialRidgeCapApexAndEdgeZ'] and not rewind['adopted']
    assert rewind['newSignedWholeHouseRegister'] is None
    cap_lift,cap_drop,weather_up=236,120,120
    high_slots={'curb':250,'newCut':360,'lip':520}
    assert high_slots['lip']-high_slots['newCut']>=150*c
    envelope=[]
    # Same lower board, AVCL, glass and steel; only the weather-side layers change.
    for name,upper in [('zinc with 18 mm Sarket',.7+24+50+18),
                       ('slate on 36 mm one-way rails',thick+batten+felt+36),
                       ('slate and HR, cold wind closure still due',thick+batten+felt+void),
                       ('slate and combined Sarket below two-direction airspace',thick+batten+void+18)]:
        add=upper-original_upper
        rise=add/c
        envelope.append({'family':name,'upperNormal':upper,'extraNormal':add,
                         'oldCrownNormalGapIfTopHeld':reference_corner-add,'verticalFieldRise':rise,
                         'requiredWallLine':base_wall+rise,'fieldRidge':base_ridge+rise,
                         'capIfOldWeatherProfileRetained':old_cap+rise})
    chosen=envelope[-1]
    chosen['newWeatherCapApex']=chosen['fieldRidge']+cap_lift
    chosen['visibleChangeFromRaisedCap']=chosen['newWeatherCapApex']-old_cap
    # Keep the secondary wet line between the covering and the underfelt airspace.
    # Heights refer to the FIELD surface at their actual q. The hood projects
    # farther downslope than the upper wet upstand, providing an overlap in z.
    chosen['hoodOverFieldAtLip']=cap_lift-cap_drop
    chosen['clearAboveUpstand']=cap_lift-weather_up
    chosen['wetOverlapVertical']=weather_up+(high_slots['lip']-high_slots['newCut'])*t-chosen['hoodOverFieldAtLip']
    chosen['leadCoverDownSlope']=(high_slots['lip']-high_slots['newCut'])/c
    assert chosen['wetOverlapVertical']>65 and min(chosen['clearAboveUpstand'],chosen['hoodOverFieldAtLip'])>110
    # Equal-area collection target is intentionally stronger than the 5 mm ridge
    # ventilation benchmark. It does not assert balanced flow or pressure.
    inner_cut=ridge-2*high_slots['newCut']
    outer_cut=ridge+2*high_slots['newCut']
    orphan=(inner_cut-inner_eave)/2
    assert (outer-outer_cut)/2==1965 and orphan==2040
    one_corner=25*orphan
    design_half=25*inner_cut/2
    new_court_intake=opening(inner_eave/2,160,50,550)
    new_outer_intake=opening(outer,80,50,550)
    outer_high=opening(levels['outerFaceWidthsMm'][2],110,50,550,100)
    inner_high=opening(levels['courtFaceWidthsMm'][2],110,50,550,100)
    # Each face takes low air from two half-eaves. The last lower transverse
    # transfer occurs beneath the raised rails over a 1250 mm slopewise band.
    width=1250
    feet=math.ceil(width/(steel_grid['postRowPitchPlan']/c))
    side_transfer=(free_cross-10)*(width-50*feet)
    reduced=(free_cross-10)*(1000-50*math.ceil(1000/(steel_grid['postRowPitchPlan']/c)))
    assert new_court_intake['adverseNetMm2']>=design_half and side_transfer>=one_corner>reduced
    assert new_outer_intake['adverseNetMm2']>=25*outer
    assert outer_high['adverseNetMm2']>25*outer and inner_high['adverseNetMm2']>25*inner_cut
    cap_vent_duty=5*ridge  # Additional design allowance per face, not another inlet assigned to the field.
    collar_slot=opening(levels['outerFaceWidthsMm'][2],20,50,550,100,mesh=.5,adverse=5)
    court_collar_slot=opening(levels['courtFaceWidthsMm'][2],20,50,550,100,mesh=.5,adverse=5)
    assert min(collar_slot['adverseNetMm2'],court_collar_slot['adverseNetMm2'])>cap_vent_duty
    assert outer_high['adverseNetMm2']>25*outer+cap_vent_duty and inner_high['adverseNetMm2']>25*inner_cut+cap_vent_duty
    board_below_weather=(thick+batten+void)/c
    # The inner raised substrate carries the original structural clearance. The
    # field discharge is outside its curb, and the upper chamber cross-vents above it.
    raised_board_at_curb=edge['additionalCapLiftVertical']-board_below_weather
    # Raised steel plus companion timber at the top of the chamber; the narrowest
    # uninterrupted clear EAVE section occurs above/below both at the same station.
    upper_clear=rail*(1-100/steel_grid['NSrailCentres'])
    lower_clear=(free_cross-10)*(1-50/steel_grid['NSrailCentres'])
    minimum_court_gross=25*inner_cut/inner_eave
    assert upper_clear+lower_clear>=minimum_court_gross
    air={'nhbcHRLowHighPerMetreMm2':[25000,5000],'curbCutLipOffsets':high_slots,'lowerCrossLayer':free_cross,
         'upperRailLayer':rail,'retainedDrapeLimit':10,'effectiveCourtCutWidth':inner_cut,
         'outerCutWidth':outer_cut,'cornerWidthPerFace':orphan,'additionalLowAreaPerCourtCorner':one_corner,
         'courtHalfTarget':design_half,'outerFaceTarget':25*outer,'innerFaceTarget':25*inner_cut,
         'courtHalfSoffit':new_court_intake,'outerSoffit':new_outer_intake,
         'outerCurbOutlet':outer_high,'innerCurbOutlet':inner_high,
         'separateCapCrossflow':{'targetEachSide':cap_vent_duty,'outerSlot':collar_slot,'courtSlot':court_collar_slot,
                                'eavesPlusCapOuterResidue':outer_high['adverseNetMm2']-25*outer-cap_vent_duty,
                                'courtPlusCapResidue':inner_high['adverseNetMm2']-25*inner_cut-cap_vent_duty,
                                'raisedBoardTopAboveFieldAtSameQ':raised_board_at_curb,
                                'underHoodAboveRaisedBoard':cap_lift-raised_board_at_curb},
         'oldCourtThroatEvenAt63Percent':edge['ventThroatAndNet'][0]*.63,
         'courtEquivalentLowRequired':minimum_court_gross,'eaveCombinedFreeSectionPerMm':upper_clear+lower_clear,
         'transferBands':{'width':width,'effectiveFeet':feet,'area':side_transfer,'oneMetreBandArea':reduced},
         'criticalCapClearWidths':[high_slots['newCut']-high_slots['curb'],chosen['clearAboveUpstand'],chosen['hoodOverFieldAtLip']]}
    # Whole-roof mass ledger: replace only STR's existing sloping area allowance.
    # The 30 kg/m² historic secondary allowance is held as a lump, with no claim
    # to its unallocated contents. The existing real purlins/ties/rails are not
    # independently added again. Quote explicitly scheduled weight as a bound.
    layers=detail['loads']; common=sum(layers[k] for k in ['glassKgM2','lowerBoardsKgM2','metalAvclKgM2','secondaryAllowanceKgM2'])
    kg_to_kn=9.81/1000
    roof_g=steel['globalOrigins']
    existing_g=roof_g['G']
    prior_background=sum(row['count']*row['backgroundG'] for row in steel['frames'])
    assert math.isclose(prior_background,1.5*surface)
    conserved_steel=existing_g-prior_background
    rows=[]
    for grade,unit in slate['gradesKg'].items():
        for exposure,lap in slate['headlapAt25'].items():
            length,width=slate['size']
            gauge=(length-lap)/2
            count=1e6/(gauge*(width+slate['coverageSideJoint']))
            field=unit*count
            # Keep the authored 30 kg/m² allowance intact; explicitly charge
            # new wood battens, new companion nailers and extensions in addition.
            batten_kg=(50*25/gauge+50*50/steel_grid['NSrailCentres'])*550/1000
            # Areas above are mm²/mm, i.e. equivalent thickness in mm.
            # The extensions repeat on the actual ordinary plan grid.
            extension=(25**2-21**2)*free_cross*7850/1e9/(steel_grid['NSrailCentres']*steel_grid['postRowPitchPlan']/c/1e6)
            felt_kg=(22.5/15)*1.25  # 25% lap/cut allowance, not a procurement layout.
            hr=common+field+batten_kg+extension+felt_kg
            board_support=50*50/steel_grid['NSrailCentres']*550/1000
            q=hr-felt_kg+board['massKgM2']+board_support  # No credit for displaced glass; keep the full 30 kg/m² secondary reserve.
            total=conserved_steel+q*kg_to_kn*new_surface
            rows.append({'grade':grade,'exposure':exposure,'lap':lap,'gauge':gauge,'piecesPerSlopeM2':count,
                         'slateKgM2':field,'slateTonnes':field*new_surface/1000,'newTimberKgM2':batten_kg,
                         'postExtensionKgM2':extension,'feltWithLapsKgM2':felt_kg,'hrWithUnchargedWindClosureKgM2':hr,
                         'sarketPlusTimberSupportKgM2':board['massKgM2']+board_support,'chargedLayersKgM2':q,
                         'slopeGkPa':q*kg_to_kn,'remainingWithin1p5KgM2':1.5/kg_to_kn-q,
                         'wholeWithScheduledLayersKN':total,'marginTo3kPaHouseKN':roof_g['G3Budget']-total})
    # Three stock <=1.5 m pieces can cover a real sloping valley after two 300 mm
    # laps; choose 300 mm as a study requirement for the 18.25° diagonal, verify on site.
    lap=300
    revised_diagonal=inner_run*chord
    piece=(revised_diagonal+2*lap)/3
    assert 2*1500-lap<revised_diagonal and piece<1500
    gutter_width=200
    h=1500*((catch['revisedCourt']['valleyLps']/1000)**2/(9.81*(gutter_width/1000)**2))**(1/3)
    # A raised outer gutter cannot silently retain the old underlay drip. The
    # field is raised first; its redesigned lower wet board remains near glass.
    # Independent eaves discharge must be set up against both receiver datums.
    valley_record={'openWidth':gutter_width,'publishedMinimum100':100,'lapTrial':lap,'lengthEachOfThree':piece,
                  'twoMaxPiecesNet':2*1500-lap,'idealCriticalHeadMm':h,'localRainMmH':storm,
                  'developedLeadWidthTrial':600,'leadKgM2Code4':20.41,'eachValleyPieceKg':piece/1000*.60*20.41,
                  'allFourValleysKg':4*3*piece/1000*.60*20.41}
    # Record a real path around the solid diagonal. Local x,q run from the NW
    # masonry corner inward. All field points remain on the north face (x>=q).
    # The inner transverse turn stays outside a 300 mm half-width wet valley.
    court_q=levels['courtQ'][0]+add_eave
    inner_turn=3400-330*math.sqrt(2)
    outer_path=[[1000,-200],[1000,650],[2075,650],[2075,1875]]
    inner_path=[[4600,court_q],[4600,inner_turn],[3400,inner_turn],[3400,2375]]
    assert all(x>=q for x,q in inner_path+outer_path) and 2075>1875+100
    air['tracedPathsXQ']={'outer':outer_path,'court':inner_path,
                          'insideTurnToValleyCentre':(3400-inner_turn)/math.sqrt(2)}
    # Separate dry outlet: local secondary-drip height in the prior outer
    # receiver is checked explicitly. The new drip cannot be inferred from
    # the unchanged global court dose or from the positive slate lap.
    old_edge_z=edge['zincAndBreatherDripZ']
    edge_q=edge['zincAndBreatherDripQ']
    gutter=edge['gutterBottomFrontBackZ']
    inner_secondary_depth=thick+batten+void  # Top face of the combined underlay below the fully open airspace.
    new_secondary=chosen['requiredWallLine']+edge_q[1]*t-inner_secondary_depth/c
    new_primary=chosen['requiredWallLine']+edge_q[0]*t
    chosen['outerReceiver']={'oldPrimarySecondaryZ':old_edge_z,'dripQ':edge_q,'gutterBottomFrontBack':gutter,
                             'newPrimarySecondaryZ':[new_primary,new_secondary],
                             'newSecondaryAboveFixedBack':new_secondary-gutter[2],
                             'newSecondaryAboveRaisedBack':new_secondary-(gutter[2]+chosen['verticalFieldRise']),
                             'oldPrimaryToBottom':old_edge_z[0]-gutter[0],
                             'newPrimaryToFixedBottom':new_primary-gutter[0]}
    # The native ordinary outer steel/wood grid is the local thermal witness.
    thick_m=0.05
    f=50/steel_grid['NSrailCentres']
    current_u=detail['thermalProbe']['planarU']
    u_wood=1/(detail['thermalProbe']['Rother']+(.320-thick_m)/.041+thick_m/.13)
    thermal_add=f*(u_wood-current_u)
    chosen['courtEndLevelRiseAgainstOld']=chosen['verticalFieldRise']-add_eave*t
    grade_case=next(row for row in rows if row['grade']=='Capital' and row['exposure']=='severe')
    assert grade_case['remainingWithin1p5KgM2']>0 and rows[-1]['remainingWithin1p5KgM2']<0
    purlin_pitch=steel_grid['postRowPitchPlan'];rail_pitch=steel_grid['NSrailCentres']
    demand=6.3*rail_pitch*purlin_pitch/1e6
    zinc_mass=layers['subtotalKgM2']+board['massKgM2']  # Add native board; historic breather mass was not itemised.
    supports={'sourceBackgroundGkPa':1.5,'sourceWeldedG':existing_g,'separateSteelWithinRoofG':conserved_steel,
              'sourceG3Budget':roof_g['G3Budget'],'fixedLowerPlusAllowanceKgM2':common,'slate':rows,
              'zincPlusBoardIndicativeKgM2':zinc_mass,'oldPostLength':detail['standoff']['physicalPostAbovePrimary'],
              'raisedPostLength':detail['standoff']['physicalPostAbovePrimary']+free_cross,
              'oldToNewEulerCapacityRatio':(detail['standoff']['physicalPostAbovePrimary']/(detail['standoff']['physicalPostAbovePrimary']+free_cross))**2,
              'regularGravityULSPerColdFootKN':demand,'eccentricMomentAt50mmKNm':demand*.05,
              'batten':bending(rail_pitch,50,25,202.5,6.3,4.5),
              'originalPlanarPlusPostU':detail['thermalProbe']['sum'],'addedColdWoodLayerU':thermal_add,
              'simpleCompositeU':detail['thermalProbe']['sum']+thermal_add}
    # Native ridge/hip lead clip and length comparator; twin removable cheeks,
    # with the final fitting and supported stage still requiring design.
    cheek=(high_slots['lip']/c+cap_drop+30)/1000
    ridge_piece=(ridge+7*150)/8
    hip_piece=(diagonal+2*200)/3
    assert ridge_piece<1500 and hip_piece<1500
    cap_mass=2*cheek*(4*8*ridge_piece/1000)*20.41
    hip_mass=4*3*hip_piece/1000*.50*20.41
    roll_mass=(4*8*ridge_piece/1000)*.30*20.41
    saddle_mass=12*.60**2*20.41  # Separate trial material allowance for corner and terminal blanks.
    field_skin_totals=valley_record['allFourValleysKg']+cap_mass+hip_mass+roll_mass+saddle_mass
    for row in rows:
        row['remainingAfterSpecialsKgM2']=row['remainingWithin1p5KgM2']-field_skin_totals/new_surface
        row['g3MarginAfterSpecialsKN']=row['marginTo3kPaHouseKN']-field_skin_totals*kg_to_kn
    supports['joints']={'oneCheekWettedWidth':cheek*1000,'ridgePieceMm':ridge_piece,'oneCheekKg':cheek*20.41*ridge_piece/1000,
                        'ridgeLeadWithLapsKg':cap_mass,'outerHipPieceMm':hip_piece,
                        'outerHipLeadKg':hip_mass,'crownRollKg':roll_mass,'twelveSaddleBlankKg':saddle_mass,
                        'totalValleyHipRidgeAndSaddleKg':field_skin_totals,
                        'severeCapitalG3MarginAfterThoseItemsKN':grade_case['marginTo3kPaHouseKN']-field_skin_totals*kg_to_kn,
                        'remainingSlopeAllowanceAfterThoseItemsKgM2':grade_case['remainingWithin1p5KgM2']-field_skin_totals/new_surface}
    cover=read('rwt/studies/over-roof-service.json')
    cfg=cover['assumptions']
    def cover_under(x):
        distance=min(x-cfg['xMm'][0],cfg['xMm'][1]-x)
        return cfg['eaveZmm']+distance*math.tan(math.radians(cfg['pitchDegrees']))-cfg['beamHeightMm']
    assert cfg['houseShellMm']==12000 and cfg['xMm']==[-1700,13700]
    centre=cfg['houseShellMm']/2
    corner=centre-ridge/2
    apex=chosen['newWeatherCapApex']
    absolute=cover['derived']['assumedBeamLowerEnvelopeZmm']
    assert absolute==9300
    stage_z=apex-450
    stage_q=710
    reach=math.hypot(stage_q-0,apex-stage_z)
    renewal={'fixedCoverMinimumGap':absolute-apex,'centreX':centre,'northWestRidgeX':corner,
             'pitchedEnvelopeGapsAtCentreAndCorner':[cover_under(centre)-apex,cover_under(corner)-apex],
             'cornerAdditionalRiseForTwoMetres':apex+2000-cover_under(corner),
             'cornerAfter250CoverRiseAndTwoMetres':cover_under(corner)+250-apex-2000,
             'lowToolAndLiftAllowance':400,'residualUnderGlobalMinimumAfterToolAndLift':absolute-apex-400,
             'uprightRidgePieceDeficit':ridge_piece-(absolute-apex),
             'sideStageZ':stage_z,'sideStageQ':stage_q,'stageUndersideToField':stage_z-80-(chosen['fieldRidge']-stage_q*t),
             'sideStageEdgeToApexStraightMm':reach}
    assert renewal['cornerAdditionalRiseForTwoMetres']>0 and min(renewal['pitchedEnvelopeGapsAtCentreAndCorner'])>=1800
    assert renewal['stageUndersideToField']>25 and reach>600
    metal={'shownCopperValleyMinimumInPerFt':4.5,'houseDiagonalInPerFt':12*t/math.sqrt(2),
           'minimumEqualFaceForShownCopperDetailDeg':math.degrees(math.atan(4.5*math.sqrt(2)/12)),
           'additionalFieldRiseAtQ2125For28Deg':2125*(math.tan(math.radians(28))-t),
           'sarketOtherUndeclaredKgInFlatArea':board['otherKgM2']*new_surface,'sarketBitumenKgInFlatArea':board['bitumenKgM2']*new_surface}
    assert metal['houseDiagonalInPerFt']<4.5 and 27<metal['minimumEqualFaceForShownCopperDetailDeg']<28
    return {'materials':metal,'renewal':renewal,'catchment':catch,'existingCrown':old_cap,'originalUpperStack':original_upper,'families':envelope,
            'air':air,'openValley':valley_record,'load':supports}


if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--check',action='store_true')
    args=parser.parse_args()
    result=compare()
    body=json.dumps(result,indent=2,ensure_ascii=False)+'\n'
    for suffix,content in [('json',body),('svg',draw(result))]:
        out=HERE/f'ring-roof-family.{suffix}'
        if args.check:
            assert out.read_text()==content, f'Stale {out.name}'
        else:
            out.write_text(content)
