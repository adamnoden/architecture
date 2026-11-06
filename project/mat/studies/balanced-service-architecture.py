#!/usr/bin/env python3
"""Whole-system challenger calculations; no current Services/HAD adoption."""
import hashlib, json, math, pathlib, subprocess, sys

ROOT = pathlib.Path(__file__).resolve().parents[3]
BASE = pathlib.Path(__file__).with_suffix('')
HEAD = '8ab19d48ef16abaff39e7f49a3801d5dc5f65521'
def source(path, blob):
    raw = subprocess.check_output(['git', 'show', HEAD + ':' + path], cwd=ROOT)
    assert hashlib.sha1(b'blob '+str(len(raw)).encode()+b'\0'+raw).hexdigest() == blob
    return json.loads(raw)
h = source('project/had/studies/water-replan.json', 'f7324121f59cc5f1707ea47640dd2b20c26b9bbb')['model']
b = source('project/mat/studies/whole-house-service-baseline.json', '69c7b1b1e733b9ade2d8ae21c1552accf52a6261')
assert h['internalArchControls']['spine']['rawSpan'] == 900
assert h['internalArchControls']['plant']['rawSpan'] == 1275
assert b['air']['transfer']['minimumFinishedFreeArea'] == 7600

def pressure(q, area):
    return .6 * (q / (.61 * area / 1000)) ** 2
def speed(q, area):
    return q / 1000 / area

# Retain all six normal/boost duties. Cooking replaces the kitchen's closed-
# damper background flow with 48, it does NOT add 48 to a second kitchen extract.
modes = []
for name, other, kitchen in [('continuous',16,16),('cooking',16,48)]:
    total = 5*other+kitchen
    modes.append({'id':name,'fiveOtherWetRoomsEachLps':other,'kitchenTotalExtractLps':kitchen,
      'totalExtractLps':total,'totalBalancedSupplyLps':total,
      'sixHabitableSupplyEachLpsIfEqual':total/6,
      'existingKitchenTransferIdealDropPa':pressure(kitchen,7600),
      'round160VelocityMps':speed(total,math.pi*.16**2/4),
      'round200VelocityMps':speed(total,math.pi*.2**2/4),
      'rect160By180VelocityMps':speed(total,.16*.18)})
assert [m['totalExtractLps'] for m in modes] == [96,128]

# Dedicated kitchen supply uses a native two-position flow regulator, not a
# second room-pressure loop. GMB125 terminal3 floating -> Vmin, terminal2
# fullwave AC/DC bridged to3 -> Vmax (IOMp6 Figure9). No diode force-open
# substitution. ExtOut is a floating NO contact,30V/5A maximum.
kitchen_supply=[]
for m in modes:
    qs=m['kitchenTotalExtractLps']
    residual=m['kitchenTotalExtractLps']-qs
    other=m['totalExtractLps']-qs
    kitchen_supply.append({'mode':m['id'],'kitchenSupplyLps':qs,
      'sixOtherHabitableTotalSupplyLps':other,'sixOtherHabitableEachLps':other/6,
      'kitchenTransferLps':residual,'ideal7600TransferDropPa':pressure(residual,7600),
      'worstResidualWith2LpsDamperError':abs(residual)+2,
      'ideal7600DropWith2LpsErrorPa':pressure(abs(residual)+2,7600),
      'massBalanceLps':qs+other-m['totalExtractLps']})
assert all(m['massBalanceLps']==0 for m in kitchen_supply)
assert [m['kitchenTransferLps'] for m in kitchen_supply]==[0,0]
assert 48-16>=.2*108
assert all(x['sixOtherHabitableTotalSupplyLps']==80 for x in kitchen_supply)
control={'device':'REACT V GMB125','nativeRangeLps':[9,108],
 'VminLps':16,'VmaxLps':48,'minimumRecommendedSpanLps':.2*108,
 'normal':'Terminal3 Y floating selects Vmin in either native0..10 or2..10 mode.',
 'cooking':'Salsa floating NO ExtOut bridges the isolated24V terminal2 to terminal3 Y: native fullwave AC/DC Vmax override, not halfwave force-open.',
 'supply':'IEC61558-1 isolation transformer; independent support/access/cleaning and native controls retained.',
 'noRoomPressureController':True,'factoryQualifiedFaultInterlock':False,
 'fault':'Loss of hood contact/cable leaves Vmin16 even if hood mechanically open: capture/makeup failure is NOT automatically safe. U actual-flow feedback is available, but no qualified fault inhibit is claimed.',
 'remaining':'Actual commissioned fixed branch network, startup/damper travel and detectable duty-loss cooking-stop response remain to be bound; an automated hob inhibit is not assumed.'}
pressure_control={'candidate':'Native paired duct-pressure control, not a new room-pressure loop',
 'hardware':'Two CASA PTH kits, one sensor/tube/tap for each duct; native 300 Pa range and stable ambient reference.',
 'nativeAuthority':'Genius/SCB register manual 4.2 defines fixed duct-pressure control, Home/Away/Boost and Cooking supply/extract pressure targets; commission through the native wizard, no BMS required.',
 'nativeCookingRegisters':[5325,5326],
 'strategy':'Maintain each commissioned manifold pressure in both 96 and128 states, with fixed other-room branches and kitchen two-position regulator/hood. Equal target pressures do not guarantee equal downstream branch flows when shared losses change.',
 'networkHold':'Actual manifold/tap location, branch resistances, open/closed hood curves and attenuator/filter losses must demonstrate80 L/s retained outside kitchen. No native open-hood curve is invented.',
 'fault':'PTH pressure-control fault alarms and falls back to normal fan regulation; this is not an automatic safe capture state.',
 'compatibility':'W9 lists PTH; older PTH Smart menu screenshots are not claimed as exact current Genius menus. Current Genius register mapping is separate primary authority.'}
failure={'baseline':'Electric/no-combustion programme; no gas-appliance interlock is inferred.',
 'visibleManualComparison':'Native GC10/app displays unit alarms, including E181 pressure-sensor and E191 pressure-control failures; serious faults also flash hood LEDs. Stop cooking on alarm or lost capture, retain ventilation if available, and repair/recommission before cooking resumes.',
 'unearnedDetectability':'An open hood contact wire can silently leave the kitchen supply at16 while mechanical extract is48. Unit RPM and upstream duct pressure do not measure that branch loss. Hood LEDs alone are not a proven warning for every loss.',
 'decision':'Conventional visible warning plus manual stop remains preferable to an automatic hob interlock if every relevant failure is actually detected. A local branch-flow indication/comparison or native qualified equivalent is still required before this manual contract is admitted; no universal automated inhibit requirement is invented.'}
fire_rule={'primary':'https://assets.publishing.service.gov.uk/media/6aa3bb335f6e942efe37f150/AD_B1_2026.pdf',
 'paragraphs':['2.8','2.9a','2.9b','2.9c'],
 'actualFirstFloorAboveAuthoredGroundMM':3450+1800,
 'grilleRouteRejected':'Protected stair enclosure transfer grilles prohibited by2.9a for dwelling floor above4.5m; native tested LVN20S door assembly does not cure this route.',
 'ductRouteCondition':'Rigid steel through stair enclosure with firestopped boundary joints; ducts directly serving stair must not serve other areas. No terminal into protected stair is proposed.',
 'scope':'Current government collated2026 PDF paragraph verified, not an engineered departure or whole classified penetration approval.'}

# Source closed-damper eight-hole K=1.31; open-hood quadratic .032 is the
# inherited authored resistance comparator, NOT a new certified curve fit.
closed_k = 1/1.31**2
extra_k = (16**2*closed_k-48**2*.032)/(48**2-16**2)
hood_branch = {'closedEightHoleK':1.31,'closed13MeasuredPressurePa':(13/1.31)**2,
 'closed16MeasuredPressurePa':(16/1.31)**2,
 'openHoodAuthoredQuadratic':.032,'additionalQuadraticForEqualBranchPressure':extra_k,
 'commonBoostCookingBranchPressurePa':48**2*(.032+extra_k),
 'scope':'A useful fixed-network pressure screen, not an OEM damper/duct selection or factory control proof.'}

# Actual finished circle, not raw opening head. Full rectangular jackets can
# flank the retained warm packet at an arch bottleneck; this proves only that
# one section, not turns, supports, acoustics, fire closure or the whole route.
radius=900**2/(8*300)+300/2
finished_radius=radius-27
air_crossings=[]
for y in [2909,3491]:
    box=[y-107,2445-117,214,234]
    extreme=max(abs(box[0]-3200),abs(box[0]+box[2]-3200))
    intrados=2850-radius+math.sqrt(finished_radius**2-extreme**2)
    air_crossings.append({'centreYZ':[y,2445],'fullJacketYZ':box,
      'minimumFinishedIntrados':intrados,'topReserve':intrados-(box[1]+box[3]),
      'bottomAbove2250DoorAssembly':box[1]-2250})
assert all(x['topReserve']>25 and x['bottomAbove2250DoorAssembly']>25 for x in air_crossings)
assert 3040-(2909+107)==24 and (3491-107)-3360==24

# Proposed floor-standing W9 body/base reservation. Native 1000 body width
# does not erase 1006 base width or 597 overall depth; rear gap25 is authored,
# not a manufacturer minimum.600 front field is a trial, not native proof.
unit=[9677,2672,1006,597]
front=[9677,3269,1006,600]
host={'unitAndBasePlan':unit,'unitNativeWeightKg':156,
 'bodyHeight':1314,'nativeSpigotTop':1342,'baseHeight':123,'maximumFootAdjustment':50,
 'conservativeTotalHeight':1342+123+50,
 'frontTrialField':front,'frontTrialDepthNotNativeQualification':True,
 'rearToUtilityNorthFinishedFace':2672-2647,
 'eastOrdinaryPassage':11570.5-(9677+1006),
 'frontToCylinderBody':3900-(3269+600),
 'frontFitsIntermediateArchX':9677>=9650+27 and 9677+1006<=10925-27,
 '850CartWith25EdgesPassesEast':11570.5-(9677+1006)>=850+50,
 'scope':'Static challenger only. Native panel/component withdrawal, operator, supports, condensation, lifting and continuous renewal must be bound before fit selection.'}
assert host['rearToUtilityNorthFinishedFace']==25
assert host['frontToCylinderBody']==31
assert host['frontFitsIntermediateArchX']
assert not host['850CartWith25EdgesPassesEast']

# Prefer upper-only branch sizing and an east/north riser over a permanent
# bed shift. These are proposed actual component/tool states, not HAD adoption.
bed=h['upperFurniture']['bed3']
assert bed==[9942.5,1518,950,2055]
cabinet=[11032.5,3304,513,274]
upper_axis=2382
upper_supply=max(x['sixOtherHabitableEachLps']*4 for x in kitchen_supply)
platform=[10475,2558,1020,720]
parked_bed=[bed[0],bed[1]-1040,bed[2],bed[3]]
riser={'status':'Proposed smaller coherent geometry; actual matched components, access and structural admission remain open',
 'upperSupplyMaximumLps':upper_supply,'upperExtractMaximumLps':48,
 'eachClearDiameterMM':160,'eachFullJacketDiameterMM':214,
 'upperSupplyVelocityMps':speed(upper_supply,math.pi*.16**2/4),
 'upperExtractVelocityMps':speed(48,math.pi*.16**2/4),
 'cabinetPlan':cabinet,'twoDuctCentresXY':[[11169.5,3441],[11408.5,3441]],
 'betweenFullJacketsMM':25,'cabinetEdgeAllowanceMM':30,
 'northWallReserveMM':3603-(cabinet[1]+cabinet[3]),
 'eastWallReserveMM':11570.5-(cabinet[0]+cabinet[2]),
 'existingBedOrdinaryPlan':bed,'ordinaryBedChanged':False,
 'lowerGroundSpace':'Only overhead pipe/bend territory at or above2250; no full-height floor cabinet steals existing887.5ordinary passage.',
 'upperHorizontalAxisLocalMM':upper_axis,'fullDuctLowestMM':upper_axis-107,
 'reserveOver2250AssemblyMM':upper_axis-107-2250,
 'topElbowScope':'90degree upper elbow with160centreline radius is an authored long-radius requirement, not a matched native part. Full374x374side envelope extends south of cabinet; no cabinet-only component fit claimed.',
 'topElbowFullYZ':[3174,upper_axis-267,374,374],
 'nativeTool':{'part':'Werner31290026 adjustable OddJob600','source':'https://www.wernerco.com/uk/featured-products/adjustable-odd-job-600-work-platform',
   'maximumOpenedPlanMM':[1020,720],'deckMM':[600,600],'deckHeightRangeMM':[500,700],
   'foldedMM':[620,690,180],'massKg':7.35,'capacityKg':150,'nativeWorkingHeightMaximumMM':2450,
   'field':platform,'scope':'Actual full maximum opened dimensions from manufacturer. Native mounting/leg-swing procedure, operator/tool reach and full incoming path remain unqualified.'},
 'temporaryBedPlan':parked_bed,'temporarySouthTranslationMM':1040,
 'parkedBedSouthReserveMM':parked_bed[1]-429.5,
 'toolToParkedBedMM':platform[1]-(parked_bed[1]+parked_bed[3]),
 'toolToCabinetMM':cabinet[1]-(platform[1]+platform[3]),
 'toolToEastWallMM':11570.5-(platform[0]+platform[2]),
 'westMountingApronCentre':[10150,2918],'apronBodyRadiusTrial':300,
 'negativeControl':'QuickPod1440x740 alone is rejected: native overhead duty also requires491stabiliser deployment. No bare-platform pass or196kgPecolift upstairs credit.',
 'remaining':['actual platform erection/entry/full person and independent component support',
 'complete214jacketed elbow/coupling firstrelease and withdrawal into actual field, no unsupported hand-held module',
 'actual slab formed opening/trimmers and protected-boundary steel/firestop/air separation; no borrowed wet-shaft capacity',
 'route both lower unit spigots to overhead riser and upper ring without occupied warm packet, walls, bed or protected door intrusion']}
assert min(riser['northWallReserveMM'],riser['eastWallReserveMM'],riser['parkedBedSouthReserveMM'],riser['toolToParkedBedMM'],riser['toolToCabinetMM'],riser['toolToEastWallMM'])>=25
assert riser['reserveOver2250AssemblyMM']==25
assert upper_axis<riser['nativeTool']['nativeWorkingHeightMaximumMM']
# The narrower transverse body can use the protected plant door rather than
# assuming that the historical850cart is needed for every apparatus.
door=h['plantReferenceDoor']
lo,hi=door['effectiveOpenClearY'];cy=(lo+hi)/2
renewal={'status':'Component/body route development; no handling or incoming acceptance',
 'fullW9BodyIncludingBasePlanMM':[1006,597],'protectedDoorClearY':[lo,hi],
 'referenceBodyCrossingCentreY':cy,'eachTransverseBodyReserveMM':(hi-lo-597)/2,
 'centreLineXY':[[10180,2970.5],[10180,cy],[6000,cy],[6000,0]],
 'centralHallTurn':'Rotate in central front hall between finished4897..7103; do not turn1006body inside1023.5eastgallery.',
 'bodyTurningRadiusMM':math.hypot(1006,597)/2,
 'centralHallSideReserveForFullRotationMM':min(6000-4897,7103-6000)-math.hypot(1006,597)/2,
 'frontRamp':h['approaches']['front'],
 'frontRampClearMM':h['approaches']['clearWidthReservation'],
 'gradeMM':h['approaches']['authoredExteriorGrade'],
 'handling':'156kg is not hand-carried. Uniform native bottom lifting, captured rated carrier, actual handles/wheels/driver, safe threshold and1:20slope braking remain to be earned.',
 'negativeControl':'850cart remains rejected through742.5. Rotated597body is a different object; neither body geometry nor nominal trolley deck qualifies handling.',
 'externalEastAlternative':'A dense sampled1006x597body-only two-turn plant path exists, but no added east landing/1800lift/hoist is admitted. Prefer real front route if complete carrier and approach can be proved.'}
assert renewal['eachTransverseBodyReserveMM']==72.75
assert renewal['centralHallSideReserveForFullRotationMM']>500

# Complete native carrier dimensions and a full operator, rather than a body
# alone. Four swivels permit the initial north translation; they cannot be
# silently combined with the incompatible1280 dead-man option.
carrier_l,carrier_w=1125,609
carrier_end_bound=carrier_l-1000/2 #125extra may all lie at one end
turn_r=math.hypot(carrier_end_bound,carrier_w/2)
operator_r=300
handle_to_operator=325
rear_offset=carrier_end_bound+handle_to_operator
carrier={'status':'Indoor loaded-carrier/operator geometric comparison only; loading/capture and slope operation not admitted',
 'nativePart':'Fetra25011401','source':'https://www.fetra.com/carts/open_cart-25011401',
 'nativeDeckMM':[1000,600],'nativeCompletePlanMM':[carrier_l,carrier_w],
 'nativeDeckHeightMM':270,'conservativeDeckCentredEnvelopeMM':[1250,609],'reasonFor1250Bound':'Do not assume1125overall is centred on1000deck. Charge the whole125extra at either end:625maximum fromdeckcentre.','nativeCapacityKg':600,'W9MassKg':156,
 'unitBaseSeparated':'Native W9 base removal retained;1000x597body, not1006widebase, compared with1000x600deck. Exact bottom support/capture remains unearned.',
 'initialPlanCentre':[10180,2970.5],'firstNorthTranslationMM':cy-2970.5,
 'nativeSwivelOption':1288,'incompatibleDeadManOption':1280,
 'nativeSwivelLimitation':'Higher manoeuvrability but reduced directional stability;4swivels do not qualify external incline operation.',
 'actualProtectedDoorEachSideReserveMM':(hi-lo-carrier_w)/2,
 'authoredOperatorDiameterMM':600,'operatorEachSideDoorReserveMM':(hi-lo-600)/2,
 'initialOperatorCentreX':10180+rear_offset,
 'initialOperatorToEastWallMM':11570.5-(10180+rear_offset+operator_r),
 'indoorLoadDeckCentreLineXY':[[10180,2970.5],[10180,cy],[5700,cy],[5700,2700],[6000,2700],[6000,0]],
 'turn':'At5700/2700 rotate carrier and rear operator90degrees from west-going to south-going, then translate300east. Do not rotate at the original3162.75Y or in eastgallery.',
 'fullCarrierTurningRadiusMM':turn_r,
 'turnCarrierWestReserveMM':5700-turn_r-4897,
 'turnOperatorEastReserveMM':7103-(5700+rear_offset+operator_r),
 'turnOperatorNorthReserveMM':4110-(2700+rear_offset+operator_r),
 'operatorToWCWallDuringWestRunMM':cy-operator_r-2747,
 'negativeControl':'Rotating atY3162.75 would take the full rear operator beyond4110north boundary; the lower2700turn is necessary.',
 'loadingHold':'Actual156kg uniform bottom lifting, capture to deck, core/panel removal, hose/duct release, loadbearing and fully reversible transfer to/from native base are not solved by rated cart capacity.',
 'externalHold':'1280 native dead-man wheel lock explicitly is not a driving brake. Native2200 electric-drive PDF states5%/2degrees uphill at500kg, adds55kg and batteries; contradictory angle/percent and downhill braking/full modified envelope are not resolved. No1:20 loaded-slope qualification or silent ramp change.',
 'constituents':'Trolley timber deck, TPE wheels and any restraints are temporary-tool constituents, not hidden permanent-service material admission.'}
assert min(carrier['actualProtectedDoorEachSideReserveMM'],carrier['operatorEachSideDoorReserveMM'],carrier['initialOperatorToEastWallMM'],carrier['turnCarrierWestReserveMM'],carrier['turnOperatorEastReserveMM'],carrier['turnOperatorNorthReserveMM'],carrier['operatorToWCWallDuringWestRunMM'])>25
assert cy+rear_offset+operator_r>4110
# A native LCD placed behind a ceiling hatch is not ordinary visible feedback.
# This eye-level service cabinet is a physical alternative, not adopted HAD.
visibility={'status':'Unselected visible manual-operation comparison; no automatic alarm or hob interlock credit',
 'proposedCabinetXYZWHH':[7719.5,10300,1250,300,550,550],
 'regulatorNativeMountingLengthMM':485,'nativeActuatorEnvelopeMM':215,
 'displayHeightTrialMM':1500,'frontOperatorPlan':[8019.5,10325,600,600],
 'southwardBodyWithdrawalPlan':[7750,9800,215,500],
 'cabinetToNorthWallMM':11570.5-10850,
 'operatorToSinkMM':8700-8619.5,
 'operatorToTableNorthMM':10325-(9100+1200),
 'bodyWithdrawalToWestChairMM':8000-(7750+215),
 'actualNorthWindowOperatingBody':[8250,11235,300],
 'cabinetToActualWindowOperatorMM':math.hypot(8250-8019.5,11235-10850)-300,
 'rejectedNorthCornerCabinet':'PreviousY11000..11550 intersects the actual kitchen8300 window operator centred8250/11235: nearest230.5<300. Moving proposed cabinet south avoids that real body, not an invented leaf.',
 'mountingWall':'Actual loggia-east-weather east finished face7719.5; no wall penetration/thermal bridge/support qualification inferred.',
 'nativeIndication':'GMB IOMp7: LED off=no power,on=setpoint achieved,flashing=not achieved. IOMp8 display alternates actual/setpoint. A correctly regulating16fallback may be steady; no automatic fault alarm is claimed.',
 'manualBurden':'Reading16versus48 before/while cooking is attention-intensive and is a comparison, not a selected numerical pre-meal checklist. Compare a simple flow-ready indication with conventional hood operation before adding automated hob enable.',
 'routeHold':'Complete riser-to-cabinet branch, independent supports, acoustic treatment and actual component withdrawal remain open; no cabinetry is source-selected.',
 'selectedKitchenBodiesUnchanged':True}
assert visibility['operatorToSinkMM']>25 and visibility['operatorToTableNorthMM']>=25 and visibility['bodyWithdrawalToWestChairMM']>25 and visibility['cabinetToActualWindowOperatorMM']>25

transfer=[]
for side in [300,350,400]:
    transfer.append({'family':'Lorient LVN20S','nominalSquare':side,'doorApertureSquare':side+9,
      'approxGeometricFreeAreaMM2':side**2*.3,
      'idealOrificeDropAt48Pa':pressure(48,side**2*.3),
      'measuredFlowPressureQualified':False,'PVCSlatsDeclared':True,
      'mandatorySystem':'Talkback, smoke shutter, lined aperture/intumescent kit, conductor hinge or EA280; actual complete doorset evidence required.'})

energy=[]
for eta in [0,.6,.7,.8]:
    for mode in modes:
        q=mode['totalExtractLps'];d=30
        base_supply=-10+eta*d
        energy.append({'mode':mode['id'],'effectiveRecoverySensitivity':eta,
          'fabricPlusInfiltrationWK':220,'insideC':20,'outsideC':-10,
          'physicalHeatBeforeFanAndReheatW':220*d+1.2*q*d*(1-eta),
          'supplyBeforeReheatC':base_supply,
          'postheatTo18CW':max(0,1.2*q*(18-base_supply)),
          'status':'Sensitivity using inherited220W/K/30K, not climate, installed efficiency, heating loss or a W9 output claim.'})
assert abs(next(x for x in energy if x['mode']==modes[-1]['id'] and x['effectiveRecoverySensitivity']==.7)['physicalHeatBeforeFanAndReheatW']-7982.4)<1e-8

# Current W9 schematic, not borrowed W5 heater ratings. Supply16C is a
# proposed native-range comfort setting, not a guarantee through defrost.
w9_heating={'nativePreheaterW':750,'nativePostheaterW':900,'nativeFanNameplateW':960,'nativePCBW':20,
 'nativeConnectionW':2630,'proposedMinimumSupplyC':16,'sensitivities':[],
 'frostHold':'No published operating-point frost/recovery curve has yet earned continuous128 L/s through the chosen cold point. OEM reductions/stops remain intact; cooking must cease on loss of duty, not override protection.'}
assert 750+900+960+20==2630
for q in [96,128]:
 for eta in [.6,.7,.8]:
  raw=-10+30*eta
  post=max(0,1.2*q*(16-raw))
  w9_heating['sensitivities'].append({'totalLps':q,'effectiveRecovery':eta,'outsideC':-10,'insideC':20,
   'unheatedSupplyC':raw,'postheatTo16W':post,'native900PostheatReserveW':900-post,
   'postheatTo18W':max(0,1.2*q*(18-raw)),
   'maximumSupplyWith900PostheatC':raw+900/(1.2*q),
   'roomHeatIf16SupplyAnd220WK_W':220*30+1.2*q*(20-16),
   'totalPhysicalHeatBeforeFanW':220*30+1.2*q*30*(1-eta),
   'scope':'No preheater or fan-heat credit; ifpostheat reserve is negative this16C comparator fails at fixed flow.'})
assert next(x for x in w9_heating['sensitivities'] if x['totalLps']==128 and x['effectiveRecovery']==.7)['postheatTo16W']==768
selected_heat=b['heat'];kitchen_e=next(x for x in selected_heat['emitterSchedule'] if x['id']=='kitchen-E')
trial_room_loss=950
need=trial_room_loss+1.2*48*4
mean_rise=50*(need/kitchen_e['nominalDelta50W'])**(1/kitchen_e['nCoefficient'])
emitter={'selectedBodiesUnchanged':True,'selectedBodyCount':len(selected_heat['emitterSchedule']),
 'selectedConservativeTotalAt45_40_20_W':sum(x['screenOutputW'] for x in selected_heat['emitterSchedule']),
 'kitchenExisting45_40_20_W':kitchen_e['screenOutputW'],
 'kitchenMaximumNonVentilationLossAt16SupplyAnd16Lps_W':kitchen_e['screenOutputW']-1.2*16*4,
 'kitchenMaximumNonVentilationLossAt16SupplyAnd48Lps_W':kitchen_e['screenOutputW']-1.2*48*4,
 'declared950NonVentilationLossTrialOnly':trial_room_loss,
 'cookingRoomHeatUnder950TrialW':need,
 'sameSelectedBodyRequiredWaterAt5KTrialC':[20+mean_rise+2.5,20+mean_rise-2.5],
 'meaning':'The old950 room allocation is not an actual fabric loss and is not automatically added to ventilation. This deliberately labelled trial shows a modest water-regime change can be compared before adding a west radiator or16kW plant.',
 'remaining':'Actual room losses, heatpump output/COP at actual climate/water regime, HX/glycol and defrost margin, minimum flow and DHW recovery still determine selection; no8kW invariant.'}
materials={'nativeW9EPD':{'url':'https://www.swegon.com/globalassets/digizuite/19956-en-epd-swegon-casa-w9-en.pdf',
 'sha256':'d905af103c6c0f35196eb8f4bd0790d3a35c9981b02e7cc7bc899ec7f9cdabf3',
 'id':'HUB-7279','published':'2026-08-20','productionDataYear':2025,'declaredMassKg':147.3,
 'metalMassPercent':90,'fossilMaterialMassPercent':10,'fossilCategoryIndicativeKg':147.3*.1,
 'scope':'Same native1000x597x1314 geometry but no exact current-Genius GTIN/BOM match;147.3kgEPD does not replace156kghandling. Fossil category is not a polymer-specific component schedule.'},
 'policy':'No approved polymer exceptions and no hidden-parts exemption. Safety-certified internals remain intact; no material pass inferred from metal case or aluminium core.',
 'notAssumedSmallResidue':'Approximately14.73kg fossil-category material for the declared EPD unit prevents a few-gaskets-only narrative. Exact insulation, seals, fan/PCB/cable/filter constituents and replacements remain to be source-bound.',
 'alternatives':'Compare the full local-fan/heated-makeup train and a maintainable modular metal/mineral central arrangement at the same actual duties; no generic central-MVHR material advantage is claimed.',
 'serviceParts':['Original102W23S filter set, native interval and grease-cleaning duties retained; media/binder exact composition unresolved.',
 'Prefer nativeUVLL metal condensate trap toUVLM plastic comparator, but exact retained seal/tube/outfall still unqualified.',
 'Duct seals, native VAV electronics/cables/transformer, hood/control housings and mandatory safety parts stay declared, not concealed by removable cabinets.']}

# A conventional lower-mass, mineral-insulated counterflow alternative must
# pass its actual operating point before any plant replan or source migration.
systemair={'status':'Unselected actual alternative; current144 L/s pressure/noise point and complete host remain unearned',
 'nativeModel':'Systemair SAVE VTC500 L,488843,pleated standard filter kit',
 'manufacturerGeneratedCardDate':'2023-07-13','manufacturerCardRecoveredFrom':'https://www.watson-heatrecovery.co.uk/sites/watson/files/product-pdfs/Systemair_SAVE_VTC_500_L.pdf',
 'manufacturerCardSha256':'42f89d052b05bd31825ce90f62270ff07bd448d5abc65feeb2118668b386debe',
 'primaryDocumentProvenance':'Printed Systemair Online Catalogue generated primary product card, retrieved from distributor mirror because legacy shop asset returned400; no distributor performance claim substituted.',
 'nativeBodyMM':[880,615,880],'nativeHandlingKg':82,'nativePortsMM':[200,200,200,200],
 'nativeFrontServiceMM':750,'nativeMaximumAt100PaLps':602/3.6,
 'nativeOperatingPointNotProved':'602m3/h at100Pa is not144L/s at the actual dirty-filter/duct/terminal pressure and does not prove sound. No plot digitised or peak-range selection.',
 'sameNorthFrontHostRejected':{'body':[9677,2672,880,615],'frontField':[9677,3287,880,750],'cylinderStation':[9510,3900,700,700],'overlapDepthMM':4037-3900},
 'rotatedEastFrontTrial':{'body':[9677,2672,615,880],'frontField':[10292,2672,750,880],
 'actualProtectedDoorLeaf':[9397,3534,762,44],'northLeafOverlapMM':3552-3534,
 'rejected':'Cylinder avoided but actual open protected leaf intersects18mm; not adopted.'},
 'minimalEastShiftTrial':{'body':[10184,2672,615,880],'frontField':[10799,2672,750,880],
 'toOpenLeafMM':10184-(9397+762),'nativeFrontFieldToOuterEastMM':11570.5-11549,
 'hold':'Independent frame for native wall-hung bracket, complete hinged door removal/swing, ports, actual overhead four-duct routing and reversible handling remain unearned; no extra25mm invented outside native750field.'},
 'nativeConstituents':{'primary':'https://stepimassets.blob.core.windows.net/dsassetsprod/EPD_405011_SYSTEMAIR_SAVE_VTC_500.PDF',
 'sha256':'b8d9cf5b8f5b55b58a8afbfdd6bf5374f7e06d990a806de9ad06f3d48953035f',
 'id':'NEPD-7298-6566','issued':'2024-08-21','studyYear':2022,'declaredMassKg':79.29,
 'mineralInsulationKg':1.62,'mineralFilterKg':.64,
 'namedPlasticsAndSyntheticRubberKg':sum([.801,.052,.287,.0016,.04,.805,.6314]),
 'limit':'BOM categories do not resolve binders, electronics/motor polymers or exact currently supplied kit. No owner exception or direct mass ranking against W9 fossil category.'},
 'nativeControlEvidence':'Factory CAV kit measures both airflows. Service manual permits separate fan settings on configurable digital inputs. Default Cooker Hood maximum-fan function is not itself a144/96 configuration or permission to send grease through the core.',
 'separateCaptureTopology':{'normal':{'centralSupplyLps':96,'centralExtractLps':96,'kitchenSupplyLps':16,'kitchenBackgroundExtractLps':16,'separateCaptureLps':0},
 'cooking':{'centralSupplyLps':144,'centralExtractLps':96,'kitchenSupplyLps':64,'kitchenBackgroundExtractLps':16,'separateCaptureLps':48},
 'fixedOtherSuppliesLps':80,'fixedFiveWetExtractsLps':80,
 'meaning':'Keep background extraction active;48capture is deliberately a separate path, not accidentally added to the same hood background. No greasy cooking air assumed through Systemair core.',
 'cost':'One extra hood motor and64kitchen supply,144main flow, unrecovered cooking heat, actual capture/fan/terminal match and full fault response. Two modes do not make it automatically simpler than W9.',
 'synthetic30K70percentCorePhysicalCookingW':220*30+1.2*30*(144-.7*96),
 'sameAssumptionW9_128DifferenceW':1.2*30*(144-.7*96)-1.2*128*30*.3}}
assert systemair['rotatedEastFrontTrial']['northLeafOverlapMM']==18
assert systemair['minimalEastShiftTrial']['toOpenLeafMM']==25
assert systemair['minimalEastShiftTrial']['nativeFrontFieldToOuterEastMM']>0
for x in systemair['separateCaptureTopology'].values():
 if isinstance(x,dict) and 'centralSupplyLps' in x:
  assert x['centralSupplyLps']==x['centralExtractLps']+x['separateCaptureLps']
  assert x['kitchenSupplyLps']==x['kitchenBackgroundExtractLps']+x['separateCaptureLps']

result={'status':'Unselected whole-system challenger; no canonical numeric owner migration or material exception',
 'basis':{'main':HEAD,'hadBlob':'f7324121f59cc5f1707ea47640dd2b20c26b9bbb','servicesBlob':'69c7b1b1e733b9ade2d8ae21c1552accf52a6261'},
 'modes':modes,'dedicatedKitchenSupplyModes':kitchen_supply,'twoPositionKitchenControl':control,'nativePressureControlComparison':pressure_control,'failureResponseComparison':failure,'protectedStairRule':fire_rule,'hoodBranchPressureScreen':hood_branch,'spineCrossings':air_crossings,
 'W9VestibuleHost':host,'upperOnlyRiserComparison':riser,'plantRenewalComparison':renewal,'nativeCarrierAndOperatorComparison':carrier,'visibleKitchenControlComparison':visibility,'fireSmokeTransferComparison':transfer,'heatSensitivity':energy,'nativeW9HeatContract':w9_heating,'retainedEmitterCapacityComparison':emitter,'wholeSystemConstituentBoundary':materials,'conventionalLowerMassAlternative':systemair,
 'historical8kWSensitivityRequiredEffectiveRecoveryAt128And30K':1-(8000-220*30)/(1.2*128*30),
 'continuous96VersusHistorical78':{'additionalLps':18,'additionalHeatWAt30K70PercentRecovery':1.2*18*30*.3,'fanElectricity':'Native operating-point curve/commissioned measurement required; nameplate power is not annual demand.','comfort':'Continuous higher dry-air exchange can reduce winter humidity and adds terminal noise; no humidity comfort target or annual weather is invented.'},
 'heatDemandScalability':'Each additional1 W/K fabric/infiltration loss adds30 W at the30 K sensitivity; actual ground bridge, measured leakage and design climate remain inputs, not an8kW invariant.',
 'liveHADunchanged':True,'upperWetFieldsUnchanged':True,
 'remainingDesignTasks':['Complete native W9 front panel/core/fan/whole unit renewal and weight-supported method',
 'Earn actual native two-position kitchen supply/fan/fault contract; protected-stair grille comparator rejected by current2.9a',
 'Actual entire supply/extract/riser/cold terminal/cleaning/silencer/formed-opening layout and pressure/noise proof',
 'OEM cooking-mode and simultaneous humidity-control mapping, frost/dirty/wind/power/fan failure state proof',
 'Actual heating source/HX/emitter/DHW/defrost margin and constituent decision; no assumed8kW or polymer admission']}
out=BASE.with_suffix('.json');data=json.dumps(result,indent=2,ensure_ascii=False)+'\n'
if '--check' in sys.argv:
    assert out.read_text()==data,'Stale balanced-service-architecture.json'
else:out.write_text(data)
print('PASS: pinned actual geometry,96/128 conservation, pressure/heat sensitivities and explicit host negative controls; architecture not adopted')
