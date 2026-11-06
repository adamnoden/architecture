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

result={'status':'Unselected whole-system challenger; no canonical numeric owner migration or material exception',
 'basis':{'main':HEAD,'hadBlob':'f7324121f59cc5f1707ea47640dd2b20c26b9bbb','servicesBlob':'69c7b1b1e733b9ade2d8ae21c1552accf52a6261'},
 'modes':modes,'dedicatedKitchenSupplyModes':kitchen_supply,'twoPositionKitchenControl':control,'nativePressureControlComparison':pressure_control,'failureResponseComparison':failure,'protectedStairRule':fire_rule,'hoodBranchPressureScreen':hood_branch,'spineCrossings':air_crossings,
 'W9VestibuleHost':host,'upperOnlyRiserComparison':riser,'plantRenewalComparison':renewal,'fireSmokeTransferComparison':transfer,'heatSensitivity':energy,
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
