"""Intact 1700 SANIFORM 363-1, flat-to-edge indoors and edge-to-end outdoors.
Run from the architecture repository root. All new fixtures are priced project
bounds, not equipment certifications. Lengths/elevations mm, forces N.
"""
from math import hypot, sqrt, pi
from pathlib import Path
import json

def result(repo=Path('.')):
    def read(path): return json.loads((repo/path).read_text())
    house=read('project/had/studies/water-replan.json')['model']
    family=read('project/mat/studies/whole-house-service-baseline.json')['interfaces']['familyBathDrop']
    native=family['primarySource']; assert family==house['architecturalServices']['familyBathDrop']
    old=read('project/ias/studies/family-bath-exchange.json')['east']  # hardware/site only
    fx=house['upperFurniture']; bx,by,L,W=fx['family-bath1700'];D=native['depthIncludingWaste']
    assert(native['nativeModel'],L,W,D)==('363-1',1700,700,410)
    cabinet=fx['family-service-cabinet'];rad=next(v for v in house['architecturalServices']['emitters'] if v['id']=='family-E')
    wx=next(v for v in house['archOpeningRegister']['FIRST'] if v['id']=='east-window-1')
    # Gross transported bounds INCLUDE padding, brakes retained during travel,
    # trunnion bosses after external actuators detach, locks and bogie captures.
    grossL=L+90; grossY=W+20; grossD=D+40;cx=bx+L/2; cy=by+W/2
    rollY=(by+cabinet[1])/2; rollZ=850; cxr=hypot(grossY,grossD)/2
    initialZ=native['selectedRim']-D/2;sendY=4430;floor=3450; deck=old['transferZ'];out=deck-floor
    cross={'cx':cx,'initialCentreYZ':[cy,initialZ],'bareFirstNorth':rollY-cy,
      'axleYZ':[rollY,rollZ],'minMaxY':[rollY-cxr,rollY+cxr],'cabinetAndWall':rollY-by-cxr,
      'afterTwo5':rollY-by-cxr-10,'nominalStartingAxisWouldEnterFloor':max(0,cxr-initialZ),
      'minMaxZ':[rollZ-cxr,rollZ+cxr],'aboveMaxValve400AfterTwo5':rollZ-cxr-400-10,
      'shellLiftBeforeRoll':rollZ-initialZ,'grossEndClearToWestFace':cx-grossL/2-9397,
      'eastToRadiator':rad['completePlanWithValvesAndBrackets'][0]-(cx+grossL/2)}
    cyRollTop=rollZ+cxr
    # Vacuum grips and the enamel rim are not the primary support. Price an
    # independently fixed overhead frame and underpin both saddles before the
    # initial 87.5 slide. A bare first 20 north buys 20 south access before the
    # outer 10-gross frame is fitted. Project seat/contact and anchors stay gates.
    cross['bareFirst20SouthClear']=20
    cross['thinFrame']={'eachSideMM':[4,3,3],'sideOrder':'formed cheek, pad, complete fabrication reserve',
      'aboveBelowRimEnvelope':[15,25],'paddedBottomMember':[20,5],
      'initialGrossFrameCentreZ':initialZ-5,'grossLiftToRollAxis':rollZ-(initialZ-5),
      'twoInsideLongRails':'Keep 40x20 rails below the shell within its 700 plan. A 20-wide RHS and pad outside each shell side exceeds the 720 limit. Price 4 mm captured cheek plates with 3 mm pad and 3 mm fabrication allowance per side; verify local pressure, rigidity and every projecting lock.',
      'adverseRoomRollNm':1.5*76*9.81*cxr/1000}

    farFoot=min(native['nativeFootAxes'],key=lambda p:p[0])
    access=family['upperConfiguredKit']['upperServicePanel']
    cross['firstPurchase']={'oldFaceX':access['clearX'],'farFoot':farFoot,
      'distanceFromExistingOpening':hypot(access['clearX'][0]-farFoot[0],access['frontY']-farFoot[1]),
      'rareFrontPanelsX':[[9800,10140],[10540,11125]],
      'stationaryHotCold':family['upperConfiguredKit']['waterIsolationTargets'],
      'maximumCappedRelativeZ':100,'originalBodyLow':native['selectedRim']-D,
      'firstBareBodyToCapsPaired':native['selectedRim']-D-100-10,
      'order':'First remove apron and both upper heads, independently isolate the two removable valve stands upstream and take the tubes/retainers down to pressure-safe caps no higher than 100. Attach matched underside saddles through both access zones and take axle load before unfastening feet. Raise the shell off both original foot rails and their retainers before initial north travel. The current single 500 panel and unknown foot lengths do not establish those grips.'}

    cross['yokeExample']={'posts':[[10110,4800],[11000,4800]],'pad':160,
      'headerYSweep':[4550,4650],'headerBottom':1950,'cabinetPlanMargin':cabinet[1]-4650,
      'finalLiftTopBeforeSeating':1070+grossY,'clearToHeaderOnHardRest':1950-(1070+grossY),
      'operating':'Use positive independent end bearings and two mechanical locks. Centre-line trunnions only outside the shell ends; no axle through enamel. Release/end hanger must park before X translation.'}
    shellY=[sendY-grossD/2,sendY+grossD/2];net=wx['width']-2*old['archLiner'];lo=wx['centre']-net/2;hi=wx['centre']+net/2
    oldW=old['railYs'];railYs=[sendY-125,sendY+125];yb=125
    def section(w,h,t,span,P):
        inertia=(w*h**3-(w-2*t)*(h-2*t)**3)/12
        return {'I':inertia,'stress':P*span*h/(8*inertia),'deflection':P*span**3/(48*200000*inertia)}
    rail=section(50,40,4,1250,2000)
    west=[9550,10350,11020,12270,14270];bogies=[cx-650,cx+650]
    keep=[11012,4366];pads=[[9550,4135],[9550,4570],[10350,4135],[10350,4570],[11020,4135],[11020,4990]]
    def pointRect(p,r):
        return hypot(max(0,r[0]-p[0],p[0]-r[0]-r[2]),max(0,r[1]-p[1],p[1]-r[1]-r[3]))
    def footgap(pad,pt):return pointRect(pt,[pad[0]-80,pad[1]-80,160,160])
    bridge={'height':out,'minUnderside':out-40,'roofLocal':out+grossY,'netJambY':[lo,hi],'packY':shellY,
      'sideJambMargins':[shellY[0]-lo,hi-shellY[1]],'westCabinetGap':cabinet[1]-shellY[1],
      'aboveLinedSillBeforeDeflection':out-40-wx['sill']-old['archLiner'],
      'aboveLinedSillAfterBendAndTwo5':out-40-wx['sill']-old['archLiner']-rail['deflection']-10,
      'overRadiatorLifted':out-40-(rad['bottomLocal']+rad['bodyHeight']+rad['renewal']['requiredLift']),
      'belowArchSpringAfterTwo5':wx['spring']-(out+grossY)-10,'oldNorthRailOutsideShell':oldW[1]-shellY[1],
      'newRailYs':railYs,'newShoeOuterToShellEdge':grossD/2-(yb+25),'runwaySeatsX':west,
      'startingBogieX':bogies,'oldWestSeatAheadOfFrontBogie':old['railSupports'][0]-bogies[1],
      'startingRearBogieToNewRailEnd':bogies[0]-west[0],'westFeet':pads,'minimumPadToR270Seal':min(footgap(p,keep) for p in pads)-100,
      'nearestPadToCabinet':min(cabinet[1]-(y+80) for x,y in pads if x-80<cabinet[0]+cabinet[2]),'rail2kN':rail,
      'sequence':'Side-feed/lock the two tail rails remotely under the elevated doubly restrained package; no person underneath. Provide flush pre-purchased support seats in the exchange house. Land and prove both bogies before releasing the end bearings, remove the east yoke and draw east. Rebuild in reverse. A bare unsupported leading tip is rejected.'}
    # Actual earlier table is too short for this shell. Buy an extended locked
    # pivot/transfer bed, including the fully loaded cart route. All elevations world.
    pitchX=(west[-2]+west[-1])/2; pitchZ=5500; rot=hypot(grossL,grossY)/2
    steelLength=4*(grossL+grossY+grossD)/1000; steelMass=steelLength*(40*20-36*16)*7850/1e6
    bodyMass=41;frameMass=35;payload=bodyMass+frameMass;cart=20;factor=1.5
    mom=payload*9.81*factor*rot/1000; bearingN=2000;shaft=50
    ship=old['lowerShipping'];wheelbase=1130;cg=1000
    ramp=ship['rise']/ship['rampHorizontalRun'];cosine=1/sqrt(1+ramp*ramp);gweight=(payload+cart)*9.81
    first=[pitchX,sendY];axisY=[sendY-730,sendY+730]
    pitch={'centre':[pitchX,sendY,pitchZ],'YZaxis':'rotate about transverse Y; X-length becomes vertical',
      'radiusXZ':rot,'maxX':[pitchX-rot,pitchX+rot],'pairedTo2mEnds':1000-rot-10,
      'minBottomAboveDeck':pitchZ-rot-deck,'maxTop':pitchZ+rot,'shelterMinCeiling':pitchZ+rot+200,
      'liftHorizontalPackageCentreToAxis':pitchZ-(deck+grossY/2),'priorTableX':old['supportTableXY'][:1]+[sum(old['supportTableXY'][::2])],
      'firstRestBeforePitch':[pitchX-grossL/2,pitchX+grossL/2],'pivotPedestalCentreY':axisY,
      'portalIndependent':old['portalColumns'],'nativePortalSpansY':old['portalRowSpan'],'proposedPivotDeck':[12270,3580,2000,1700],
      'travelCartFirstRestAndNorthLane':[12820,3750,1450,2330],
      'brakeMomentNmWorst':mom,'singleSideCantileverMm':730-grossD/2,'earliestPivotSolidPastEave':pitchX-rot-(12000+house['roofDevelopment']['overhang']),'D50BendMPa':32*bearingN*(730-grossD/2)/(pi*shaft**3),
      'D50TwistMPa':16*mom*1000/(pi*shaft**3),'verticalPinRoot':pitchZ-grossL/2,
      'landingOnto100Cart':pitchZ-grossL/2-(deck+100),'sourceRailOffset':old['railSeatOffset'],'required2kNSeatMoment':2*old['railSeatOffset']/1000,
      'planCartToBearingInnerAfter25':730-615-50-25,'shaftScope':'Opposed external stubs, positive anti-drop and brake. Retained pedestal tubes must not cut through the loading cart or prevent it exiting. Remove/retract the clear-side crosshead and lock roll before accepting the load on the cart.'}
    sh={'bareShell':bodyMass,'frameMax':frameMass,'40x20x2LengthM':steelLength,'steelKg':steelMass,'hardwareBudget':frameMass-steelMass,
      'maxGoodsGross':payload+cart,'loadedFootprint':[800,1230],'uprightPack':[grossY,grossD,grossL],
      'uprightToCartSides':[(800-grossY)/2,(1230-grossD)/2], 'wheelbase':wheelbase,'maxWheelODFor1230':1230-wheelbase,
      'permittedLoadedCGHeight':cg,'fixedCageAcross':min(old['manualPlatform'][1],old['grossPlatformUK'][1]),
      'cageLong':min(old['manualPlatform'][0],old['grossPlatformUK'][0]),'cageSideEnd':[(950-800)/2,(1320-1230)/2],
      'maxVerticalGoodsAboveCageFloor':100+grossL,'brake0p1gRearMargin':wheelbase/2-50-cg*(ramp+.1/cosine),
      'maxCGfor25Rear':(wheelbase/2-50-25)/(ramp+.1/cosine),
      'lineUphillN':gweight*(ramp+.03)*cosine,'arrestDesignN':factor*gweight,
      'route':[[pitchX,sendY],[13780,sendY],[13780,5440],[14770,5440],[14770,4870],[14770,3380]],'groundRamp':ship['rampHorizontalRun'],
      'eastFirstBeforeNorth':13780-pitchX,'cartToNorthPivotPedestalWhenHeadingNorth':13780-400-(pitchX+50)-10,
      'bridgeDeckOverlap':14270-old['upperLanding'][0],'pairedNorthRunToLandingEdges':min(5440-615-old['upperLanding'][1],old['upperLanding'][1]+old['upperLanding'][3]-(5440+615))-10,
      'existingCageTravel':old['carTravel'],'status':'Check actual resultant CG, every rolling/retaining component, gatehead/strap allowances, mast ties, 10m foundation, emergency stop and protected access. No human rides in goods-only state.'}
    assert 2<cross['afterTwo5']<4 and cross['minMaxZ'][0]>400
    assert bridge['sideJambMargins']==[30,370] and bridge['westCabinetGap']==20 and bridge['minimumPadToR270Seal']>=50
    assert bridge['aboveLinedSillAfterBendAndTwo5']>12 and bridge['overRadiatorLifted']==200
    assert 25<pitch['pairedTo2mEnds']<27 and pitch['minBottomAboveDeck']>90
    assert sh['brake0p1gRearMargin']>30 and sh['maxWheelODFor1230']==100
    return {'native':{'model':native['nativeModel'],'body':native['body'],'depth':D,'footAxes':native['nativeFootAxes'],
         'selectedRim':native['selectedRim'],'groundUnchanged':True},'pack':[grossL,grossY,grossD],
         'inside':cross,'window':bridge,'outdoor':pitch,'shipping':sh,
         'states':{
          'ordinary':'Native feet and complete upper/lower wet system support the bath. Keep temporary machinery and portal rails out of normal room and east plant use.',
          'plannedExchange':'Keep the upper protected route and other available bathing places live. Close family bath, room operator zone, outside dock and landing to other users. Build/anchor/test outdoor mast, both divided runways, weather enclosure, temporary window guard and first rest before releasing the original guard or bath. Remove/dry waste head, mixer and tails; the actual cap envelope must clear the lifted shell.',
          'endHandoff':'Under positive double restraint pitch outdoors, place the upright independent cart under the shell from the WEST side, lower 65 to its 100-high deck, lock, then disengage stub shafts sideways. Translate the cart FIRST east 510 clear of the north pivot pedestal, THEN north. No person under a freely hanging shell or riding in the goods-only state. Restore bathroom against filled-overflow, floor boundaries and reconstructed window tests.',
          'absentSite':'No transfer of the 1600-shell stair, door, entrance-void lift, or intact-window cargo result. Where independent west runway, external tipping bay, earthing/anchorage, mast/ground and safe discharge cannot be furnished, reject this intact export.'}}
if __name__=='__main__':print(json.dumps(result(),indent=2))
