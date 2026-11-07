#!/usr/bin/env python3
"""A forkable raised receiver, with an explicit incomplete whole handover."""
from pathlib import Path
import argparse, hashlib, html, json, math, subprocess

ROOT=Path(__file__).resolve().parents[3]
BASE=Path(__file__).with_suffix('')

def immutable(s):
    raw=subprocess.check_output(['git','show',s['commit']+':'+s['path']],cwd=ROOT)
    assert hashlib.sha1(b'blob '+str(len(raw)).encode()+b'\0'+raw).hexdigest()==s['blob']
    return json.loads(raw)

def rhs(section):
    h,b,t=section
    return h*b-(h-2*t)*(b-2*t),(b*h**3-(b-2*t)*(h-2*t)**3)/12

def produce():
    raw=BASE.with_name(BASE.name+'-sources').with_suffix('.json').read_bytes();c=json.loads(raw)
    m=immutable(c['sources']['HAD'])['model'];arch=immutable(c['sources']['balancedArchitecture'])
    folded=immutable(c['sources']['foldedRenewal']);a=c['authoredReceiver'];n=c['nativeNumbers']
    current_raw=(ROOT/'project/had/studies/water-replan.json').read_bytes();current=json.loads(current_raw)['model']
    # Current utility working-prose/source-identity correction does not silently
    # widen this immutable geometric case. Check every actual domain used here.
    for key in ['plantReferenceDoor','sections','groundWalls','utilityDisposition']:
      assert current[key]==m[key],f'Current HAD {key} changed: replan receiver'
    assert current['servicesInterface']['plant']==m['servicesInterface']['plant']
    assert current['gardenFailureBypass']['frontApproach']==m['gardenFailureBypass']['frontApproach']
    w,d=a['outside_mm'];plate=a['topPlateThickness_mm'];lane=a['nominalForkLaneUnderside_mm']
    rail_h,rail_w,_=a['bottomRailRHS_mm'];beam_h,beam_b,_=a['crossbeamRHS_mm']
    assert lane==rail_h+a['postLength_mm']
    height=lane+beam_h+plate
    opening=a['accessOpening'];ow,od=opening['clear_mm'];rh,rt=opening['rimFlatBar_mm']
    ox,oy,_,_=opening['plateRect_mm'];inlet=opening['trialInletAxis_mm'];body=opening['trialBodyAxis_mm']
    assert opening['rimOuter_mm']==[ow+2*rt,od+2*rt]
    assert opening['rimLength_mm']==2*od+2*(ow+2*rt)
    assert body[1]-inlet[1]==n['UVLLInletToBodyAxis_mm'] and inlet[0]==body[0]
    assert 100<ox-rt<ox+ow+rt<w-100
    assert a['transverseBeamY_mm']==[[0,40],[d-40,d]]
    assert oy-rt>40 and oy+od+rt<d-40
    rim_bottom=height-plate-rh
    assert rim_bottom>lane # new rim stays above nominal fork-top plane
    for px,py in [inlet,body]:assert ox<px<ox+ow and oy<py<oy+od
    volume={'plate':(w*d-ow*od)*plate,
      'openingRim':opening['rimLength_mm']*rh*rt,
      'topCrossbeams':rhs(a['crossbeamRHS_mm'])[0]*a['crossbeamCount']*a['crossbeamLength_mm'],
      'bottomRails':rhs(a['bottomRailRHS_mm'])[0]*a['bottomRailCount']*a['bottomRailLength_mm'],
      'posts':rhs(a['postSHS_mm'])[0]*a['postCount']*a['postLength_mm']}
    mass={k:v/1e9*a['density_kg_per_m3'] for k,v in volume.items()};fixture=sum(mass.values())
    listed=n['W9ListedUnit_kg'];payload=listed+fixture;capacity=n['GL4Capacity_kg']
    assert payload<capacity and height==226
    # Geometry alone is not actual CG. A combined measured loadcentre must satisfy
    # the native chart, including any base mass omitted by the listed unit scope.
    nominal_centre=d/2
    assert nominal_centre<n['GL4MaxLoadCentre_mm']
    inner=w-2*rail_w;fw=n['GL4Fork_mm'][1];toolw=n['GL4FullWidth_mm']
    assert inner>toolw>fw
    release=a['nominalForkReleaseDrop_mm'];deck=n['cartDeck_mm'][2]
    fork_deposit=deck+lane;fork_released=fork_deposit-release
    assert fork_released>deck and lane>release
    assert 0-release<0 # flat plate cannot release forks above a solid deck
    assert n['GL4MinimumLift_mm']>max(n['nativeBaseFootRange_mm'])
    assert fw<600<toolw # fitting only forks does not fit complete tool
    h=arch['W9VestibuleHost'];assert h['unitAndBasePlan']==[9677,2672,1006,597]
    wall=next(v for v in current['groundWalls'] if v['id']=='utility-north')
    opening_x=current['utilityDisposition']['opening'];assert wall['holes']==[opening_x]
    north_face=wall['finishedFaces'][1];host_x,host_y,host_w,_=h['unitAndBasePlan']
    trial_radius=300+25;corner_dy=host_y-north_face
    assert 0<corner_dy<trial_radius
    corner_min_x=host_x+host_w+math.sqrt(trial_radius**2-corner_dy**2)
    jamb_max_x=opening_x[1]-trial_radius
    assert corner_min_x>jamb_max_x # a real shared-interface negative, not a route pass
    assert m['plantReferenceDoor']['effectiveOpenClearWidth']==742.5
    conservative_native=h['conservativeTotalHeight']
    # Retain the deliberately conservative existing height sum. Do not silently
    # replace it with assembled1417 whose foot/seating datum is not fully bound.
    installed=conservative_native+height;cart_height=installed+deck
    rho_g=n['g_m_per_s2'];P=a['staticPointChallenge_N'];E=a['elasticModulus_N_per_mm2']
    area,I=rhs(a['crossbeamRHS_mm']);Z=I/(beam_h/2)
    post_centre=rail_w/2;support_span=w-2*post_centre
    parked_M=P*support_span/4
    # Authored support-line sensitivity is separate from native521 outside width;
    # actual fork blade width/contact and mounting origins remain unbound.
    overhang=(w-400)/2;lift_M=P*overhang
    structural={'challenge_N':P,'role':a['challengeRole'],'idealCrossbeamArea_mm2':area,
      'idealCrossbeamI_mm4':I,'idealCrossbeamZ_mm3':Z,
      'parkedWorstPoint':{'supportSpan_mm':support_span,'moment_Nmm':parked_M,
        'elasticBendingStress_N_per_mm2':parked_M/Z,'elasticDeflection_mm':P*support_span**3/(48*E*I)},
      'restrainedEndPointNegativeControl':{'authoredSupportLineSpan_mm':400,'endOverhang_mm':overhang,
        'moment_Nmm':lift_M,'elasticBendingStress_N_per_mm2':lift_M/Z,
        'elasticDeflection_mm':P*overhang**2*(overhang+400)/(3*E*I),
        'nearReaction_N':P*(1+overhang/400),'farReaction_N':-P*overhang/400,
        'role':'This isolated end point requires a negative far reaction: free forks cannot supply that hold-down. Elastic component arithmetic is not a stable load case for an unrestrained receiver; actual distributed loads/CG/capture must be proved.'},
      'centredSupportEndMomentSensitivity':[{'authoredSupportLineSpan_mm':v,'endOverhang_mm':(w-v)/2,'elasticBendingStress_N_per_mm2':P*(w-v)/2/Z} for v in [0,300,400,521]],
      'forkSupportRole':'Restrained component models only; unilateral fork bearing cannot provide the isolated end-case negative reaction.400mm bearing-line span and0..521mm sensitivity are authored centred-support models. Native521 is outside fork width, not measured bearing-line spacing. Actual section/contact/local stability must bind.',
      'onePostAxialStress_N_per_mm2':P/rhs(a['postSHS_mm'])[0],
      'grossTwoRailArea_m2':2*rail_w*d/1e6,
      'grossDeadLoadPressure_kPa':payload*rho_g/(2*rail_w*d/1e6)/1000,
      'grossChallengePressure_kPa':P/(2*rail_w*d/1e6)/1000,
      'notProved':['actual RHS corner radii/grade/section properties and tolerances',
        'plate/native-foot load spreading, local bearing, torsion, welds, capture and sliding/overturning',
        'actual uneven tile/screed/insulation/RC contact and movement; gross rail area is not proven effective bearing area',
        'handling impact, fatigue, appliance approval or an installed support rating']}
    old_loaded=listed+n['cart_kg'];new_loaded=payload+n['cart_kg']
    sine=1/math.sqrt(20**2+1)
    assert structural['restrainedEndPointNegativeControl']['farReaction_N']<0
    assert new_loaded>old_loaded and new_loaded<n['cartCapacity_kg']+n['cart_kg']
    bounds=folded['carrier']
    # Do not infer an actual wheel polygon or slope result from this same-envelope
    # comparison: the fixture adds substantial mass and changes the loaded CG.
    sequence=[
      {'state':'Installed','duty':'Native base/adjustable feet on proposed apertured plate. Actual foot/contact/capture patches must avoid the opening and qualify local plate/rim/weld bearing. Exact cover/setter/float access, independent frame/floor stability and ports remain to prove; no loose hatch or assumed base-seat datum.'},
      {'state':'Prepare and engage','duty':'Isolate power and support/release actual ducts. Support the fixed condensate tail independently before loosening the accessible native outlet connection, counterhold without loading unit/trap and collect finite drips. Keep native trap/captive parts with appliance only if captured and weighed. Verify fixed tail cannot enter fork/receiver travel. Bind combined mass/CG, capture and configured GL geometry, then engage140mm lane. No native thin-base lifting assumption.'},
      {'state':'Lift and dock','duty':'Lift only enough for the270mm deck plus a trial20mm approach clearance. Positively secure actual cart/dock; complete wheel/leg/cylinder/leaf/operator entry is still unproved. Native raised travel is limited to minor loading/unloading positioning.'},
      {'state':'Set down and withdraw','duty':'Lower receiver bottom to270mm deck. Fork top at410mm supports the beam; lower20mm to390mm and withdraw through the retained lane. Actual tine thickness, vertical geometry, clearances and support handover must be measured; no unsupported slide.'},
      {'state':'Cart route and reverse','duty':'Actual cart restraint/wheel polygon, protected head/closer, all folded flights/turns and positive capture remain required. Incoming installation repeats the supported sequence in reverse; no unattended raised load.'}]
    return {'status':c['status'],'sources':c['sources'],'nativeEvidence':c['nativeEvidence'],
      'sourceExtractSHA256':hashlib.sha256(raw).hexdigest(),
      'currentHADReview':{'path':'project/had/studies/water-replan.json','blob':hashlib.sha1(b'blob '+str(len(current_raw)).encode()+b'\0'+current_raw).hexdigest(),
        'unchangedGeometricDomains':['plantReferenceDoor','sections','groundWalls','utilityDisposition','servicesInterface.plant','gardenFailureBypass.frontApproach'],
        'role':'Retain the immutable2eb8 geometric case and prove the actual current consumed domains equal. Utility working-prose/source-identity correction changes no geometry or numerical duty.'},
      'decision':'Develop the forkable receiver with a bounded permanently open, rimmed service aperture beneath native UVLL. A full plate raises support and trap together and does not improve their clearance. Retain native base/feet and reversible supported cart handover; qualify actual contacts, clocking, withdrawal and fixed discharge before machining or installation.',
      'receiver':{'authored':a,'height_mm':height,'coarseIdealMemberMass_kg':mass,
        'coarseTotal_kg':fixture,'unpricedResidues':'Weld metal, actual radiused sections, capture/dock parts, fixings and any surface treatment are additional. Native feet/seals/electronics/filter residues remain unapproved; no blanket metal or material exception.',
        'nativeBase_mm':n['nativeBase_mm'],'nativeCabinetPlan_mm':[1000,597],
        'actualBearingHold':'Native feet/base retained, but exact foot/contact/capture patches must be outside aperture and satisfy actual local plate/rim/weld bearing. Continuous-plate predecessor is a comparison, not automatic load-path credit for this opening. No lifting directly under native base skin.'},
      'lift':{'nativeGL4StandardMass_kg':n['GL4Standard_kg'],'nativeCapacity_kg':capacity,
        'listedUnitPlusIdealFixture_kg':payload,'remainingForUnscopedBaseAndAllCaptureHardware_kg':capacity-payload,
        'capacityRole':'Listed156kg unit scope must be reconciled with actual supplied native base and captured fixture.227kg rating is not a whole floor, cart or handling rating.',
        'nativeMaximumCombinedLoadCentre_mm':n['GL4MaxLoadCentre_mm'],
        'geometricDepthMidpointOnly_mm':nominal_centre,'midpointToLimit_mm':n['GL4MaxLoadCentre_mm']-nominal_centre,
        'CGHold':'Actual combined CG measured/bound from load face nearest carriage, load centred laterally, native chart and lifting configuration verified. Geometric midpoint is not actual CG; no core-removal mass credit.',
        'directNativeFloorBaseEntryShortfallAtMaximumFoot_mm':n['GL4MinimumLift_mm']-max(n['nativeBaseFootRange_mm']),
        'nativeForkMinLift_mm':n['GL4MinimumLift_mm'],'nominalEngageTop_mm':lane,'nominalHeightAboveMinimum_mm':lane-n['GL4MinimumLift_mm'],
        'innerRailLaneWidth_mm':inner,'forkOutsideWidth_mm':fw,'nominalEachForkSideGap_mm':(inner-fw)/2,
        'completeGLWidth_mm':toolw,'nominalEachFullToolSideGap_mm':(inner-toolw)/2,
        'wholeToolHold':'629x883 operating outline alone does not locate forks, legs, wheels, winch/handle or operator. Actual complete vertical and plan geometry and safe minor positioning remain to prove.'},
      'handover':{'cartDeck_mm':n['cartDeck_mm'],'palletLengthOverhangEach_mm':(w-n['cartDeck_mm'][0])/2,
        'palletTransverseDeckReserveEach_mm':(n['cartDeck_mm'][1]-d)/2,
        'forkTopAtDeposit_mm':fork_deposit,'forkTopAfterRelease_mm':fork_released,
        'maximumTineThicknessBeforeTolerance_mm':lane-release,
        'flatPlateNegativeControl':'With zero underside lane, fork release below the support face intersects the solid cart deck. A flat lifting plate alone does not solve setdown/withdrawal.',
        'nativeCartPayloadCapacity_kg':n['cartCapacity_kg'],
        'planComparison':'1006x597 receiver fits within the retained1250x609 conservative complete-carrier rectangle only before any added projecting capture hardware.3mm end overhang and1.5mm deck side reserve are nominal dimensions, not a support/tolerance pass.',
        'actualCartWheelAndCaptureHold':'Native200x40 wheels have no dimensioned contact centres here. Complete four-swivel entry, caster sweep, wheel/GL-leg contact, positive restraint/dock and independent support handover remain open.'},
      'height':{'existingConservativeNative_mm':conservative_native,'installedPortTopBound_mm':installed,
        'to3100Ceiling_mm':3100-installed,'cartPortTopBound_mm':cart_height,
        'trialLifted20ClearanceTopBound_mm':cart_height+20,
        'hold':'Actual protected door/closer/head clearance, ports/diverging fittings/insulation/attenuator withdrawal and condensate disconnection/annual access must bind. No complete door-head or duct geometry pass.'},
      'structuralComparison':structural,
      'externalConsequences':{'oldListedUnitPlusCart_kg':old_loaded,'newListedUnitFixtureCart_kg':new_loaded,
        'oneIn20GravityOnlyForceBefore_N':old_loaded*rho_g*sine,'oneIn20GravityOnlyForceAfter_N':new_loaded*rho_g*sine,
        'coarseMassIncrease_fraction':new_loaded/old_loaded-1,
        'uniformSlopeCGShiftExamples_mm':{str(h):h/20 for h in [800,1000,1200]},
        'role':'Gravity-force and authored CG-height challenges only, no rolling resistance/braking/tipping pass. Actual wheel support polygon and complete CG/dynamics unknown. Native TU8 WLL anchor/redirect duties and independent capture remain unchanged; no downrated anchor credit.'},
      'condensate':{'nativeUnitConnection':'Rear under heat exchanger,3/8inch male;minimum12mmID downstream discharge,no horizontal run/second trap/direct drain. Current W9 IOM also states minimum100mm damming height; supplied looped hose and expressly offered mechanical UVLL are distinct assemblies.72mm external UVLL depth is not a water-seal height or permission to waive native pressure/discharge duty.',
        'nominalDrawingReference':{'assembledCabinetTop_mm':n['nativeAssembledCabinetTopFromDrawnBaseLowerLine_mm'],'cabinetBodyHeight_mm':n['nativeCabinetBodyHeight_mm'],'cabinetPortTopHeight_mm':n['nativeCabinetPortTopHeight_mm'],'unitBottomAboveDrawnAssembledLowerLine_mm':n['nativeAssembledCabinetTopFromDrawnBaseLowerLine_mm']-n['nativeCabinetBodyHeight_mm'],'role':'Same cabinet-top arrows exclude spigots.103mm is a nominal offset to the depicted assembled lower line, not actual native foot-to-receiver contact or an installed trap clearance. The configured lower-line/feet/base seat and extraction stroke remain unbound.'},'nativeCoverBelowUnitBottom_mm':n['UVLLCoverBelowUnitBottom_mm'],
        'nativeInletToBodyAxis_mm':n['UVLLInletToBodyAxis_mm'],
        'nativeBodyHeight_mm':n['UVLLBodyHeight_mm'],
        'datum':'Let d be ACTUAL unit-bottom height above receiver top after native base seating and foot adjustment. Native base123/feet15..50 and illustrated assembled1417 do not establish d by addition. No installed d selected.',
        'fullPlateNegativeControl':{'coverAbovePlateExpression':'d -72','afterRaisingReceiverExpression':'(receiverHeight+d-72)-receiverHeight = d-72',
          'raisingChangesClearance_mm':0,'role':'Exact translation cancellation; no assumed actual base seat. Raising a continuous plate cannot earn annual downward access.'},
        'aperture':{'clear_mm':[ow,od],'trialPlateRect_mm':opening['plateRect_mm'],
          'nativeAxisSeparationOnly_mm':n['UVLLInletToBodyAxis_mm'],
          'axisMargins_mm':[inlet[0]-ox,ox+ow-inlet[0],inlet[1]-oy,oy+od-inlet[1],body[1]-oy,oy+od-body[1]],
          'authoredRimBottomAboveReceiverBottom_mm':rim_bottom,'rimAboveNominalForkTop_mm':rim_bottom-lane,
          'nearestAuthoredRearBeamGap_mm':oy-rt-40,
          'role':'200x220 opening reserves axis space, not actual whole trap/cover/hand fit. Clocking,12Cu bends/couplings, body width, extraction stroke, front-edge access, tools and full lateral hand route remain to bind. No scaled drawing dimensions.',
          'bearingHold':'Actual native foot/contact/capture polygons must avoid aperture; local plate/rim/weld bearing and bracing must be recalculated. Polygons are not supplied here, so opening/support admission remains false.'},
        'annualDuty':'At least annually twist open underside cover, withdraw setter and float, remove dirt and check movement. Required extraction stroke/hand envelope are not stated in native drawing. A projected aperture and72mm installed depth are not that proof. Native front-edge screw loosening for connection does not prove complete annual removal access.',
        'fixedRelease':{'moving':'Native unit/base/receiver and attached UVLL/captive inlet stay captured together only after actual mass/retention proved.',
          'fixed':'Downstream tail, actual minimum-ID line, receptor and support remain independent of moving appliance; no existing plant floor drain or sanitary/RWT/heat-pump receptor assumed.',
          'firstRelease':'Before lifting: power isolated, actual fixed tail independently held/supported, finite drain inventory captured, native outlet coupling accessible and counterheld; separate tail without loading trap/unit, then prove tail clear of all fork/cart motion. No generic hose pull.',
          'restoration':'Reconnect actual matched coupling/seal and independent support, restore specified trap orientation/discharge, inspect and water-test native outlet before ordinary operation.',
          'holds':['Actual native12mm Cu output-to-minimum12mm-ID downstream connection, pressure/100mm damming duty and all seals/float/setter constituents',
            'Fixed bracket/substrate, actual union/tool space and independent tail restraint; connection cannot serve as structural pipe support',
            'Actual frost-safe receiving/outfall, indirect connection and floor/air/water closure; no borrowed floor drain',
            'Finite drain-down volume/catch capacity, actual cover/setter/float withdrawal and reassembly without moving native feet/base support']},
        'admitted':False},
      'utilityApproachNegative':{'role':'IAS-coordinated concrete joint negative for an authored600mm body plus25mm reserve. It rejects this utility-arch approach at proposed W9 host, not every actual person or another qualified route.',
        'currentUtilityOpeningX_mm':opening_x,'northFinishedFaceY_mm':north_face,
        'proposedW9SouthEastCorner_mm':[host_x+host_w,host_y],
        'authoredBodyDiameter_mm':600,'reserve_mm':25,'inflatedRadius_mm':trial_radius,
        'eastJambMaximumCentreX_mm':jamb_max_x,'W9CornerMinimumCentreX_mm':corner_min_x,
        'incompatibleCentreInterval_mm':corner_min_x-jamb_max_x,
        'eastOfW9ToEastJamb_mm':opening_x[1]-(host_x+host_w),
        'approachPass':False,'adoptedRelocation':False,
        'next':'Resolve actual complete operator/device entry through protected Plant door or a coherent new host arrangement, preserving600 host-front trial, cylinder/leaf/ports and ordinary maintenance duties. Do not shrink a person or borrow unproved arch access.'},
      'sequence':sequence,'systemDuties':c['systemDuties'],
      'admission':{'nativeBearingAndCGVerified':False,'frameAndFloorAdmitted':False,'completeToolCartOperatorGeometryProved':False,
        'portsCondensateAndHeadProved':False,'cartOrExteriorHandlingAdmitted':False,'materialException':False,'HADorServicesGeometryChanged':False,'packetComplete':False}}

def figure(r):
    out=['<svg xmlns="http://www.w3.org/2000/svg" width="1250" height="1250" viewBox="0 0 1250 1250">','<rect width="1250" height="1250" fill="#f4f1e9"/>']
    def text(x,y,t,size=18,color='#21363b'):
      out.append(f'<text x="{x}" y="{y}" font-size="{size}" fill="{color}" font-family="Arial,sans-serif">{html.escape(t)}</text>')
    def rect(x,y,w,h,fill='#b4cec4',stroke='#21363b'):
      out.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{fill}" stroke="{stroke}"/>')
    def line(x,y,xx,yy,color='#21363b'):
      out.append(f'<path d="M{x},{y} L{xx},{yy}" stroke="{color}" fill="none"/>')
    text(35,43,'A retained condensate service opening in the forkable receiver',28)
    text(35,76,'Native UVLL dimensions joined to a priced, unadopted support proposal',19)
    text(35,119,'Plan: authored receiver coordinates / native foot contacts still unknown',21)
    q=r['receiver']['authored']['accessOpening'];scale=.55;px=40;py=157
    rect(px,py,1006*scale,597*scale,'#c6d2ce')
    for x in [0,906]:rect(px+x*scale,py,100*scale,597*scale,'#91aaa9')
    for y in [0,557]:rect(px,py+y*scale,1006*scale,40*scale,'#7e969c')
    x,y,w,d=q['plateRect_mm']
    rect(px+(x-6)*scale,py+(y-6)*scale,(w+12)*scale,(d+12)*scale,'#d4a766')
    rect(px+x*scale,py+y*scale,w*scale,d*scale,'#f4f1e9')
    for label,(xx,yy) in [('inlet axis',q['trialInletAxis_mm']),('cover axis',q['trialBodyAxis_mm'])]:
      out.append(f'<circle cx="{px+xx*scale}" cy="{py+yy*scale}" r="4" fill="#8c402e"/>')
      text(px+xx*scale+12,py+yy*scale+5,label,15)
    line(px+603*scale,py+122*scale,px+603*scale,py+220*scale,'#8c402e')
    text(40,516,'1006 × 597 plate; clear opening200 × 220; rim40 high × 6 thick',17)
    text(40,545,'98 mm native axis separation; trial position/clocking is NOT certified.',17,'#8c402e')
    text(650,158,'Full plate: raising both does not buy access',21)
    text(650,201,'Let d = actual unit bottom above receiver top.',18)
    text(650,237,'Cover-to-plate clearance = d −72.',21)
    text(650,274,'Raise by R: (R+d−72) −R = d−72.',20)
    text(650,312,'Base123 + feet15…50 does not establish d.',18)
    text(650,350,'1417−1314=103 to drawn lower line, not actual d.',18)
    text(650,389,'No actual d or extraction stroke is selected.',18,'#8c402e')
    text(650,429,'Opening axes ≠ whole body / hand / tool clearance.',18)
    text(650,468,'Actual feet, capture and local plate/rim welds',18)
    text(650,495,'must retain their load path before machining.',18)
    text(35,601,'Section obligations: preserve support and fork withdrawal',23)
    # Schematic datum diagram: d variable; no invented native base-seat dimension.
    line(55,647,520,647);text(65,639,'Actual unit bottom',17)
    line(90,647,90,719);line(80,719,100,719);text(104,691,'native72 below unit bottom',17)
    text(65,744,'Cleaning cover → setter / float downward',17)
    rect(55,783,178,6,'#7e969c');rect(355,783,165,6,'#7e969c')
    rect(227,789,6,40,'#d4a766');rect(355,789,6,40,'#d4a766')
    text(65,859,'Schematic d varies; plate opening keeps no loose hatch.',17)
    text(650,629,'Rim bottom180 / nominal fork top140 →40 mm.',18)
    text(650,665,'Authored rear-beam gap26 mm; no beam cut.',18)
    text(650,701,'This does not locate actual fork/leg/caster geometry.',18)
    text(650,737,'Before lift: support fixed tail, counterhold coupling,',18)
    text(650,768,'capture finite drain-down; release and clear travel.',18)
    text(650,806,'Receptor / bracket / seals / minimum-ID line remain open.',18,'#8c402e')
    a=r['receiver'];l=r['lift']
    text(35,914,'Whole-system price and decision',24)
    rows=[f"Ideal plate + rim receiver {a['coarseTotal_kg']:.3f} kg; listed unit+frame {l['listedUnitPlusIdealFixture_kg']:.3f} kg.",
      f"Only {l['remainingForUnscopedBaseAndAllCaptureHardware_kg']:.3f} kg remains below227 kg for native base/capture and all unscoped parts.",
      'Keep native base/feet; no foot/capture patch may cross the aperture. Local plate/rim/weld bearing is NOT proved.',
      'Keep96/128 capture/control/heat, actual unit CG, complete tool/cart/door/ports and folded-route capture duties.',
      'UVLL72 external depth is not100mm water-seal height; actual native accessory/pressure/discharge scope must join.',
      '12mm Cu connection is not a12mm-ID downstream line; actual transition, seals and float/setter constituents remain.',
      'No existing floor drain, sanitary/RWT/heat-pump receptor, floor/air/water closure or material exception is borrowed.']
    for i,row in enumerate(rows):text(35,954+i*34,row,17)
    text(35,1220,'No apparatus, support, cleaning/handling pass, selected air target or MAT completion.',19,'#8c402e')
    out.append('</svg>');return '\n'.join(out)+'\n'

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--check',action='store_true');args=ap.parse_args()
    r=produce();products={BASE.with_suffix('.json'):json.dumps(r,indent=2)+'\n',BASE.with_suffix('.svg'):figure(r)}
    for p,s in products.items():
      if args.check:assert p.read_text()==s,f'Stale {p.name}'
      else:p.write_text(s)
    print('PASS: forkable receiver section/handover negatives, ideal mass/static arithmetic and unchanged whole-system admission holds')

if __name__=='__main__':main()
