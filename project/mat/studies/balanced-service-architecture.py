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
      'actuatorRatedToleranceLps':max(2,.05*qs),
      'residualWithActuatorRatedToleranceLps':abs(residual)+max(2,.05*qs),
      'ideal7600DropWithActuatorTolerancePa':pressure(abs(residual)+max(2,.05*qs),7600),
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
 'decision':'Develop native unit/hood alarms plus one proportional visible local supply-boost indication and manual stop/repair response for this all-electric cooking strategy. Resolve the known silent16fallback meaningfully without demanding universal fault detection or an automatic hob interlock.'}
ready={'status':'Preferred proportional diagnostic development comparison; actual apparatus/constituents not admitted and no hob safety interlock',
 'source':'REACT V GMB IOM,2025-05-16,p11:U actual-flow feedback in selected0..10V mode maps0..Vnom108L/s; it does not indicate damper position.',
 'native0to10FeedbackVolts':{'normal16':10*16/108,'cooking48':10*48/108,'brokenContact16':10*16/108},
 'normalUpperWithRatedToleranceLps':16+max(2,.05*16),
 'cookingLowerWithRatedToleranceLps':48-max(2,.05*48),
 'authoredIndicationThresholdLps':40,'thresholdVoltsIn0to10Mode':10*40/108,
 'manualDisplayPrice':'Expose actual/setpoint LCD at ordinary height; user must recognise16versus48 and act. A steady16is normal to regulator; numerical premeal checks are not selected.',
 'singleReadyIndicationPrice':'Reuse nativeU through DUB01CD4810V and one XB4BVB3 visible indicator labelled SUPPLY BOOST. No new room pressure loop,sensor or BMS. Real power,materials,calibration and electrical enclosure/access are charged below.',
 'ordinaryUse':'During cooking, missing expected SUPPLY BOOST makes the silent16fallback meaningfully visible without reading flow numbers. Stop cooking on observed lost capture/makeup or native alarm; investigate/repair and recommission before resuming. Native full-stroke100s is not actual16to48settling time: commission the real transient and explain ordinary starting indication without a numerical premeal checklist.',
 'limits':'SUPPLY BOOST means reusedU is above its commissioned threshold only. It is not green-safe or proof of capture/extract, tube/calibration integrity, heat/frost or fire state. Stale-highU, shared measurement faults and welded relay contact can mislead; lamp/power loss can remove indication. Retain native protections and explicit response/maintenance; do not make infallible detection of every hood/sensor failure an admission condition for this limited diagnostic.'}
assert ready['normalUpperWithRatedToleranceLps']<ready['authoredIndicationThresholdLps']<ready['cookingLowerWithRatedToleranceLps']
monitor_threshold=ready['thresholdVoltsIn0to10Mode']
monitor_error=.005*10+.001*10*30 # repeatability + conservative30C drift sensitivity
monitor={'part':'CarloGavazziDUB01CD4810V',
 'source':'https://www.gavazziautomation.com/fileadmin/images/PIM/DATASHEET/ENG/DUB01CB%20DS%20ENG.pdf',
 'nativeIdentity':'Manufacturer03.03.2025datasheet,pp1..4;D48is24..48VAC/DC,notB23mains variant.',
 'nativeCaseMM':[22.5,80,99.5],'nativeMassG':150,'nativePowerDCW':3,'nativePowerACVA':4,
 'nativeInputResistanceMinimumOhm':200000,'selectedNativeRangeV':[1,10],
 'maximumLoadAt10VmA':10/200000*1000,'GMBNativeMaximumOutputLoadmA':.5,
 'nativeHousing':'PolyamideNylon or phenyleneether+polystyrene; exact supplied revision/BOM still required. Electronics,contacts and enclosure/wire insulation are retained,not stripped or excepted.',
 'nativeContact':'SPDT,5Aat24VDC;ordinary contact,not force-guided safety output.',
 'nativeSettings':'Overvoltage,normallydeenergized,nonlatching:energize output only whenU exceeds commissioned setpoint.5percent relative hysteresis and1sdelay are authored commissioning trials within native0..30percent/0.1..30s ranges.',
 'trialThresholdV':monitor_threshold,'trialEquivalentThresholdLps':40,
 'trialHysteresisV':.05*monitor_threshold,'trialDropoutEquivalentLps':38,
 'nativeRepeatabilityFullScalePercent':.5,'nativeDriftPPMperC':1000,'nativeAccuracyWarmupMinutes':15,
 'electronicsOnly30CDifferenceSensitivityV':monitor_error,
 'electronicsOnlyEquivalentTripBandLps':[(monitor_threshold-monitor_error)*108/10,(monitor_threshold+monitor_error)*108/10],
 'calibration':'Verify actual switching and return with measured branch flow/U in both modes after native warm-up; set knob against meter,not printedscale alone. Native repeatability/drift sensitivity is not total absolute accuracy or a GMBU accuracy guarantee. Preserve0..10mode/Vnom108 and recommission after replacement.',
 'GMBFullStrokeSeconds':100,'transientBoundary':'100sfor90degree fullstroke is native5Nm data,not the actual16to48flow settling time. Exercise hood opening/closing and known broken-contact16fallback with real pressure network and observe actualU/indication.',
 'placement':'Accessible dry control enclosure with DINrail,terminal/wire space,IP20module protection and required electrical clearances; no enclosure or support dimensions are adopted from bare22.5mm module size.'}
indicator={'part':'SchneiderHarmonyXB4BVB3','source':'https://www.proface.com/en/product/spec/XB4BVB3',
 'nativePlanHeightDepthMM':[30,47,54],'nativeMountDiameterMM':22.5,'nativeMassG':80,
 'nativeVoltageV':24,'nativeCurrentmA':18,'derivedNominalPowerDCW':24*.018,
 'nativeVoltageLimitsACV':[21.6,26.4],'nativeVoltageLimitsDCV':[19.2,30],
 'nativeFront':'Green integralLED,chromiumplatedmetal bezel,Zamak collar; metal front does not make the complete lamp metal. Native product page declares recycled plastic content; exact plastic/LED/electronic/seal constituents remain to bind.',
 'label':'SUPPLY BOOST','meaning':'Reused nativeU above commissioned threshold;no cooking-safe/capture/hob-enable meaning.',
 'mounting':'Ordinarily visible kitchen position with full54mm rear body,terminals and replaceable access; do not drill or modify a certified hood as an assumed mounting detail.'}
assert monitor['maximumLoadAt10VmA']<monitor['GMBNativeMaximumOutputLoadmA']
assert 1<ready['native0to10FeedbackVolts']['normal16']<monitor_threshold<ready['native0to10FeedbackVolts']['cooking48']<10
assert ready['normalUpperWithRatedToleranceLps']<monitor['electronicsOnlyEquivalentTripBandLps'][0]<monitor['electronicsOnlyEquivalentTripBandLps'][1]<ready['cookingLowerWithRatedToleranceLps']
ready['matchedNativeMonitorComparison']=monitor
ready['matchedNativeIndicatorComparison']=indicator
ready['realBurden']={'monitorAndIndicatorMassG':monitor['nativeMassG']+indicator['nativeMassG'],
 'additionalNominalDCWWhenLit':monitor['nativePowerDCW']+indicator['derivedNominalPowerDCW'],
 'monitorContinuousDCkWhPerYear':monitor['nativePowerDCW']*8760/1000,
 'GMBPlusMonitorPlusLampNominalACVA':3.5+4+24*.018,
 'massRole':'Approximate150g monitor plus nominal80g indicator only; not installed enclosure/supply/wire/support mass.',
 'powerBoundary':'Use requiredIEC61558-1isolated24Vsupply rated for full connectedVA/inrush,including indicator voltage window and wiring drop;7.932VA is nominal connected sum,not chosen transformer rating. No borrowed unrated W9accessory output. Transformer loss/fusing/enclosure,wire/terminals,fixings and complete mandatory constituents are additional real scope.',
 'choice':'Prefer this limited diagnostic over requiring routine16versus48LCD interpretation. Actual residues and installation still need their proper disposition; no blanket material exception or certified-internal modification.'}
failure['proportionalSupplyFlowReadyComparison']=ready
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
 'openProtectedLeafIntrudesTrialFrontFieldMM':[10159-9677,44],
 'doorStateHold':'Fully open native protected leaf occupies482x44mm of trial front field. Closed-door component service and reopened-door body withdrawal must be proved as separate supported states; full front access with door open is not earned.',
 'frontFitsIntermediateArchX':9677>=9650+27 and 9677+1006<=10925-27,
 '850CartWith25EdgesPassesEast':11570.5-(9677+1006)>=850+50,
 'scope':'Static challenger only. Native panel/component withdrawal, operator, supports, condensation, lifting and continuous renewal must be bound before fit selection.'}
assert host['rearToUtilityNorthFinishedFace']==25
assert host['frontToCylinderBody']==31
assert host['openProtectedLeafIntrudesTrialFrontFieldMM']==[482,44]
assert host['frontFitsIntermediateArchX']
assert not host['850CartWith25EdgesPassesEast']

# Actual intermediate wall has194mm finished thickness, not only27mm finish.
# A rotated W9 base clears the opening itself but its east front field crosses
# the solid east pier. Keep this plausible-looking geometric escape falsified.
plant_wall=next(w for w in h['groundWalls'] if w['a']==[9300,3700] and w['b']==[12000,3700])
assert plant_wall['finishedFaces']==[3603,3797]
arch_lo=10287.5-1275/2+27
arch_hi=10287.5+1275/2-27
rotated_w9=[10184,2672,597,1006]
rotated_w9_front=[10781,2672,600,1006]
host['rejectedEastFrontRotation']={
 'bodyBase':rotated_w9,'trial600FrontField':rotated_w9_front,
 'protectedLeafGapMM':10184-10159,
 'trialFrontFieldToEastWallMM':11570.5-11381,
 'intermediateFinishedWallFacesY':plant_wall['finishedFaces'],
 'finishedArchJambsX':[arch_lo,arch_hi],
 'frontFieldSolidEastPierOverlapMM':[11381-arch_hi,3678-plant_wall['finishedFaces'][0]],
 'decision':'Rejected complete front field despite body/leaf/cylinder clearance. Moving75mm south to clear finished wall would put body50mm inside2647south boundary; do not silently remove pier or shrink service field.'}
assert host['rejectedEastFrontRotation']['frontFieldSolidEastPierOverlapMM']==[483,75]
assert 3603-1006<2647

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
front_approach=h['gardenFailureBypass']['frontApproach']
front_route=front_approach['route']
front_travel=sum(math.dist(a,b) for a,b in zip(front_route,front_route[1:]))
assert len(front_approach['ramps'])==4 and len(front_approach['landings'])==5
assert all(r['plan'][2]==1200 and r['plan'][3]==9000 and r['slope']==20 for r in front_approach['ramps'])
assert math.isclose(front_travel,45944.97191010141,abs_tol=.001)
door=h['plantReferenceDoor']
lo,hi=door['effectiveOpenClearY'];cy=(lo+hi)/2
renewal={'status':'Component/body route development; no handling or incoming acceptance',
 'fullW9BodyIncludingBasePlanMM':[1006,597],'protectedDoorClearY':[lo,hi],
 'referenceBodyCrossingCentreY':cy,'eachTransverseBodyReserveMM':(hi-lo-597)/2,
 'centreLineXY':[[10180,2970.5],[10180,cy],[6000,cy],[6000,0]],
 'centralHallTurn':'Rotate in central front hall between finished4897..7103; do not turn1006body inside1023.5eastgallery.',
 'bodyTurningRadiusMM':math.hypot(1006,597)/2,
 'centralHallSideReserveForFullRotationMM':min(6000-4897,7103-6000)-math.hypot(1006,597)/2,
 'currentFrontApproach':{'source':'model.gardenFailureBypass.frontApproach',
   'routeXYZmm':front_route,'ramps':front_approach['ramps'],'landings':front_approach['landings'],
   'slopedRouteTravelMM':front_travel,'planRouteTravelMM':sum(math.dist(a[:2],b[:2]) for a,b in zip(front_route,front_route[1:])),
   'status':'Actual authored folded route:four9m1:20ramps with turns/landings; loaded carrier, operator, rope/anchors and turn/transition control remain unearned.'},
 'historicalStraightBudgetMM':h['approaches']['front']['totalStraightReservation'],
 'historicalStraightBudgetRole':'42m nominal straight-budget comparison only; not current folded route or a straight winch path.',
 'frontRampClearMM':h['approaches']['clearWidthReservation'],
 'gradeMM':h['approaches']['authoredExteriorGrade'],
 'handling':'156kg is not hand-carried. Uniform native bottom lifting, captured rated carrier, actual handles/wheels/driver, safe threshold, actual folded exterior turns/landings and1:20slope braking remain to be earned.',
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
renewal['nativeReplaceableAssemblyEvidence']={
 'manufacturerModelPage':'https://www.casastore.fi/swegon-casa-w9-genius?lang=en&region_selected=1',
 'accessed':'2026-11-06','modelBoundary':'Manufacturer page says Genius manufactured from2026; actual device typeplate/QR revision must match.',
 'fanPackage':{'part':'F230W','url':'https://www.casastore.fi/puhallinpakkaus-w9-r-l-mallin-tulo-poisto?id=61',
  'declared':'Complete fan,connector and fan seal; explicitly compatible with Genius and Smart. No exact seal formulation or handling mass/dimensions supplied.'},
 'core':{'part':'61030','url':'https://www.casastore.fi/lto-kenno3',
  'declared':'Manufacturer explicitly lists Genius and Smart compatibility; full core first-release/withdrawal envelope and supported mass remain unknown.'},
 'doors':{'part':'DW9RL','url':'https://www.casastore.fi/ovi-w9-r-ja-l-malli-32018-gt',
  'declared':'Both doors included; Genius and SmartA/B compatibility explicit. Not a measured hinge sweep, panel mass or support procedure.'},
 'linkedServiceManual':{'url':'https://serviceportal.swegon.com/fi//docs/TM_W9_EN',
  'identity':'Manufacturer Genius-page maintenance link resolves to2024-09-03 W9Smart manual,not current Genius instructions.',
  'boundedComparison':'Same-part compatibility supports examining core bracket/fan collar/connector release as a real predecessor method; actual current fasteners, seals, removal fields and safe supported handling still need confirmation.',
  'notTransferred':['155kgSmart mass','Smart firmware/control behaviour','unmeasured nativeGenius front clearance','unpublished component dimensions/masses']},
 'materialBoundary':'Replacement is a complete package including fan seal/connector, not bare metal impeller. No certified internals modified or hidden polymer assumption.'}
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
 'nativeWinterBoundary':'CurrentGeniusIOM2026-09-17p6 balancing-functions note calls for external duct battery especially belowminus10C. Actual coil power/envelope/control/renewal/constituents are not selected; labelledminus10C16C70percent point is not a complete winter guarantee.',
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
 'nativeOperatingPointNotProved':'602m3/h at100Pa is not144L/s at the actual dirty-filter/duct/terminal pressure and does not prove sound. The later manufacturer chart below is a digitised maximum envelope, not a commissioned selection.',
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

# Manufacturer-generated 11 November2024 card p5, not distributor opinion.
# Read its plotted maximum envelope, never interpolate from602m3/h headline.
# Quantise graph-derived data to10Pa and carry25Pa reading uncertainty; that
# uncertainty is not extra dirty-filter reserve. Native sound table is blank.
systemair['native2024PressureEnvelope']={
 'source':'https://www.puravent.co.uk/pub/media/resources/brand-pdfs/Systemair_SAVE_VTC_500_L_%281%29.pdf',
 'sha256':'0b343c023292e8f93227a47977253bd41fcc164c8c24e9fe09994760008409de',
 'sourceIdentity':'Systemair Online Catalogue,488843,pleated standard kit,2024-11-11,p5; manufacturer content recovered from mirror',
 'sampledMaximumExternalPressurePa':[
  {'flowLps':96,'supply':740,'extract':780},
  {'flowLps':144,'supply':310,'extract':370}],
 'readingUncertaintyPa':25,
 'method':'Linear interpolation of native PDF maximum-envelope boundary, quantised10Pa; supply144 gives310.9Pa before quantisation. Not an OEM selected speed or sound point.',
 'supply144ConservativeAvailablePa':310-25,
 'incrementalDirtyFilterSensitivity':[
  {'additionalFilterLossPa':dp,'maximumRemainingExternalNetworkPa':310-25-dp}
  for dp in [50,100,150]],
 'pressureBoundary':'Maximum chart envelope with the listed standard kit. Incremental dirty-filter loss must be charged once beyond the chart condition; exact clean-filter/rating condition still needs OEM confirmation.',
 'noiseBoundary':'No fan speed, octave sound power or144L/s sound-pressure result appears in the operating table.44dBA ErP sound power at reference conditions is not the actual plant/terminal sound or a limit.',
 'selection':'No pass: actual complete duct/terminal/silencer/hood pressure, dirty-filter condition and occupied-room noise targets remain unbound. Positive maximum margin alone is insufficient.',
 'massRevision':'2024card lists79kg versus82kg2023card. Retain82kg conservative handling until actual supplied revision/kit is matched; neither is an exact EPD assembly match.'}

# Separate capture produces unequal heat-capacity rates through the core.
# eta here is a fraction of min(streams)*temperature difference, not borrowed
# balanced supply-temperature effectiveness. It is a comparison, not an OEM
# VTC effectiveness prediction under unbalanced/defrost operation.
def separate_heat(qs, qe, eta, preheated_outside):
 outside, inside, target, loss = -10, 20, 16, 220
 recovered=1.2*min(qs,qe)*eta*(inside-preheated_outside)
 raw=preheated_outside+recovered/(1.2*qs)
 pre=1.2*qs*(preheated_outside-outside)
 post=max(0,1.2*qs*(target-raw))
 room=loss*(inside-outside)+1.2*qs*(inside-target)
 total=loss*(inside-outside)+1.2*qs*(inside-outside)-recovered
 assert abs(pre+post+room-total)<1e-8 # all cases here need reheat to16
 return {'centralSupplyLps':qs,'coreExtractLps':qe,'outsideC':outside,
  'insideC':inside,'preheaterLeavingC':preheated_outside,
  'smallerStreamRecoveryFraction':eta,'recoveredHeatW':recovered,
  'beforePostheatSupplyC':raw,'preheatW':pre,'postheatTo16W':post,
  'native1670PostheatReserveW':1670-post,
  'maximumSupplyWith1670PostheatC':raw+1670/(1.2*qs),
  'spaceEmitterDemandIf16SupplyW':room,'totalPhysicalHeatW':total}
vtc_heat={'status':'Unequal-stream sensitivity, not an installed efficiency or frost-safe setting',
 'nativeOptionalPostheaterW':1670,'nativeFansNameplateW':340,
 'nativeListedPreheaterComparatorsW':[2100,3000],
 'nativePostheaterSource':'Manufacturer2024card p10:1581091670W; preheater53703000W or53842100W listed, not yet selected with full connection/duct envelope.',
 'nativeFrostSource':'Manufacturer2023card p9:preheater required at-5C when unbalanced flow is not desired; supply fan can stop periodically in defrost. That statement does not define a guaranteed safe preheat leaving-air setpoint.',
 'scope':'16C supply/220WperK/30K and recovery60..80% of smaller-stream maximum are authored sensitivities. No credit for fan heat or assumption that balanced84%ErP ratio applies to144/96.',
 'cases':[separate_heat(qs,96,eta,pre) for qs in [96,144] for eta in [.6,.7,.8] for pre in [-10,-5]],
 'wholeSystemPrice':'Separate capture, extra hood fan,64kitchen supply, nativeCAV/branch control, preheater/relay/sensors and optional postheater have own power/space/renewal/material duties. No smaller-body simplicity claim.',
 'admission':'Complete144/96 OEM selection must bind recovered heat, frost and retained flow, selected heaters/connection, ducts/noise and failure response before a layout is adopted.'}
cold=next(x for x in vtc_heat['cases'] if x['centralSupplyLps']==144 and x['smallerStreamRecoveryFraction']==.7 and x['preheaterLeavingC']==-10)
warm=next(x for x in vtc_heat['cases'] if x['centralSupplyLps']==144 and x['smallerStreamRecoveryFraction']==.7 and x['preheaterLeavingC']==-5)
assert abs(cold['beforePostheatSupplyC']-4)<1e-8
assert abs(cold['postheatTo16W']-2073.6)<1e-8
assert abs(cold['totalPhysicalHeatW']-9364.8)<1e-8
assert cold['native1670PostheatReserveW']<0
assert abs(warm['preheatW']-864)<1e-8
assert abs(warm['postheatTo16W']-1612.8)<1e-8
assert abs(warm['totalPhysicalHeatW']-cold['totalPhysicalHeatW']-403.2)<1e-8
systemair['unequalStreamHeatComparison']=vtc_heat

result={'status':'Unselected whole-system challenger; no canonical numeric owner migration or material exception',
 'developmentDecision':{'leadingInvestigation':'W9directcapture96/128withdedicated16/48kitchensupply,fixed80elsewhere and limitedUboostindication',
  'reason':'Native cooking/paired-pressure direction retains cooking heat recovery and meets labelled16C/70percentcoldpoint with native900postheat; materials, supported renewal and true operating points remain unearned.',
  'challenger':'VTCseparatecapture96/96normal,144/96plus48hoodcooking; smaller/mineralcabinet remains promising but extra motor/64kitchensupply/unequalcore/preheatpostheat must be carried.',
  'decisiveChecks':['actualdirtyfilterpressureandnoiseatbothmodes','nativebranch/fault/visiblelostdutystates','actualwinterrecovery/defrost/source/emitterheat','supportedpanelcorefanwholebodyandupperrenewal','exactinstalledandreplacementconstituents'],
  'scope':'Prioritises whole-system development only; no selected apparatus, polymer exception, canonicalServices/HAD change or MAT-SERVICES completion.'},
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
# Deterministic inspection sheet: exact source geometry plus labelled thermal
# comparisons. This is an inspection output, not a selected plant drawing.
from html import escape
svg=['<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1360" viewBox="0 0 1200 1360">',
 '<rect width="1200" height="1360" fill="#fbfaf5"/>',
 '<style>text{font-family:Arial,sans-serif;fill:#202a31;font-size:16px}.h{font-size:24px;font-weight:700}.s{font-size:13px}.b{font-weight:700}</style>']
def label(x,y,value,cls=''):
 svg.append(f'<text x="{x}" y="{y}" class="{cls}">{escape(str(value))}</text>')
label(38,42,'Two whole cooker / ventilation / heat alternatives','h')
label(38,70,'UNSELECTED · current HAD / Services unchanged · source-bound comparison, not construction release','s')
for x,title,normal,cooking in [
 (38,'W9 + direct Salsa capture','96 supply / 96 extract','128 supply / 128 extract'),
 (628,'VTC 500 + separate capture','96 supply / 96 core extract','144 supply / 96 core + 48 hood extract')]:
 label(x,120,title,'h');label(x,155,'Normal: '+normal);label(x,184,'Cooking: '+cooking)
 label(x,217,'Other supplies fixed: 80 L/s; five wet extracts: 80 L/s','s')
 label(x,244,'Kitchen supply / extract: '+('16/16 → 48/48 L/s' if x==38 else '16/16 → 64/(16+48) L/s'))
label(38,294,'Cooking heat sensitivity: −10°C outside / 20°C inside / 16°C supply','b')
label(38,319,'220 W/K fabric + infiltration; recovery = 70% of smaller-stream maximum. No fan-heat credit.','s')
for y,name,pre,post,space,total in [
 (360,'W9 128/128',0,768,7214.4,7982.4),
 (397,'VTC 144/96',cold['preheatW'],cold['postheatTo16W'],cold['spaceEmitterDemandIf16SupplyW'],cold['totalPhysicalHeatW']),
 (434,'VTC with −5°C preheat trial',warm['preheatW'],warm['postheatTo16W'],warm['spaceEmitterDemandIf16SupplyW'],warm['totalPhysicalHeatW'])]:
 label(38,y,name);label(350,y,f'pre {pre:.0f} W');label(515,y,f'post {post:.1f} W');label(730,y,f'rooms {space:.1f} W');label(955,y,f'total {total:.1f} W','b')
label(38,469,'VTC native 1670 W postheater fails unpreheated 16°C trial. −5°C preheat trial is not frost qualification.','s')
label(38,493,'VTC 144 L/s maximum supply envelope ≈310 Pa ±25; actual dirty-filter network and sound remain unknown.','s')
def plan(px,title,body,field,field_note):
 label(px,548,title,'h')
 scale=.16;ox=px+15;oy=580
 def rect(box,fill,stroke,dash=''):
  x,y,w,d=box
  svg.append(f'<rect x="{ox+(x-9397)*scale:.2f}" y="{oy+(4700-y-d)*scale:.2f}" width="{w*scale:.2f}" height="{d*scale:.2f}" fill="{fill}" stroke="{stroke}" stroke-width="1.5"'+(f' stroke-dasharray="{dash}"' if dash else '')+'/>')
 rect([9397,2647,2173.5,2053],'#ffffff','#68747b')
 rect([9397,3603,arch_lo-9397,194],'#a7a7a1','#777770')
 rect([arch_hi,3603,11570.5-arch_hi,194],'#a7a7a1','#777770')
 rect([9510,3900,700,700],'#d8dde0','#68747b')
 rect([9397,3534,762,44],'#202a31','#202a31')
 rect(field,'#eef4ec','#66865a','7 4')
 rect(body,'#dbe9ec','#326b7c')
 label(ox+25,oy+38,'Retained cylinder','s')
 label(ox+12,oy+174,'Open protected leaf','s')
 label(ox+360,oy+48,'N ↑','b')
 label(ox+360,oy+83,'Same scale','s')
 label(ox+360,oy+107,'1 m = 160 px','s')
 label(ox+360,oy+158,'Body: blue','s')
 label(ox+360,oy+182,'Front: dashed','s')
 label(ox+360,oy+206,'Wall: grey','s')
 label(px,946,field_note,'s')
plan(38,'W9 north-front trial',host['unitAndBasePlan'],host['frontTrialField'],'600 mm front trial: 31 mm to cylinder; open leaf intrudes 482 × 44 mm.')
plan(628,'VTC east-front offset trial',systemair['minimalEastShiftTrial']['body'],systemair['minimalEastShiftTrial']['frontField'],'750 mm native front field; 25 mm leaf gap; 21.5 mm east-wall reserve.')
label(38,985,'No cart, supported loading, hinged-door swing, complete ports, frost, sound or constituent admission is implied.','s')
label(38,1011,'Source: balanced-service-architecture.json; pinned HAD/Services geometry; Systemair native cards 2023/2024.','s')
label(38,1061,'W9 limited visible-loss diagnostic: preferred development comparison','h')
for x,w,title,line2,line3 in [
 (38,330,'Native GMB125 actual-flow U','0–10 V; Vnom108 L/s','<0.05 mA load vs0.5 mA native max'),
 (430,350,'DUB01CD4810V voltage monitor','3.70 V trial; overvoltage / N.D.','24 V; ≈150 g;3 W DC /4 VA AC'),
 (820,340,'SUPPLY BOOST indicator','XB4BVB3;80 g;24 V /18 mA','Reused U above threshold only')]:
 svg.append(f'<rect x="{x}" y="1080" width="{w}" height="100" fill="#eef4ec" stroke="#66865a"/>')
 label(x+12,1108,title,'b');label(x+12,1135,line2,'s');label(x+12,1162,line3,'s')
for x1,x2 in [(368,430),(780,820)]:
 svg.append(f'<path d="M{x1} 1130 H{x2-6} l-7 -5 m7 5 l-7 5" fill="none" stroke="#326b7c" stroke-width="2"/>')
label(38,1212,'Normal16: OFF · Cooking48: ON above threshold · Broken-contact16: OFF. Actual starting transient must be commissioned.','s')
label(38,1240,'Native alarms + stop/repair response retained. Stale-high U / common measurement faults / welded contact can still mislead.','s')
label(38,1267,'Real price: ≈230 g modules,3.432 W DC when lit; enclosure/wire/supply and known polymer/electronic residues remain.','s')
label(38,1294,'Calibration: actual flow/U, warm-up, switch/return and drift. 7.932 VA is nominal connected AC sum, not transformer selection.','s')
label(38,1324,'No green-safe, capture proof, BMS, room-pressure loop, hob interlock, material exception or installed diagnostic adoption.','s')
svg.append('</svg>');svg_data='\n'.join(svg)+'\n'
if '--check' in sys.argv:
    assert out.read_text()==data,'Stale balanced-service-architecture.json'
    assert BASE.with_suffix('.svg').read_text()==svg_data,'Stale balanced-service-architecture.svg'
else:
    out.write_text(data)
    BASE.with_suffix('.svg').write_text(svg_data)
print('PASS: pinned actual geometry,96/128 conservation, pressure/heat sensitivities and explicit host negative controls; architecture not adopted')
