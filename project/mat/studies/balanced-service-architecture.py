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
for name, other, kitchen in [('background',13,13),('wet-boost',16,16),('cooking-plus-all-wet-boost',16,48)]:
    total = 5*other+kitchen
    modes.append({'id':name,'fiveOtherWetRoomsEachLps':other,'kitchenTotalExtractLps':kitchen,
      'totalExtractLps':total,'totalBalancedSupplyLps':total,
      'sixHabitableSupplyEachLpsIfEqual':total/6,
      'existingKitchenTransferIdealDropPa':pressure(kitchen,7600),
      'round160VelocityMps':speed(total,math.pi*.16**2/4),
      'round200VelocityMps':speed(total,math.pi*.2**2/4),
      'rect160By180VelocityMps':speed(total,.16*.18)})
assert [m['totalExtractLps'] for m in modes] == [78,96,128]

# Dedicated kitchen supply uses a native two-position flow regulator, not a
# second room-pressure loop. GMB125 terminal3 floating -> Vmin, terminal2
# fullwave AC/DC bridged to3 -> Vmax (IOMp6 Figure9). No diode force-open
# substitution. ExtOut is a floating NO contact,30V/5A maximum.
kitchen_supply=[]
for m in modes:
    qs=48 if m['kitchenTotalExtractLps']==48 else 13
    residual=m['kitchenTotalExtractLps']-qs
    other=m['totalExtractLps']-qs
    kitchen_supply.append({'mode':m['id'],'kitchenSupplyLps':qs,
      'sixOtherHabitableTotalSupplyLps':other,'sixOtherHabitableEachLps':other/6,
      'kitchenTransferLps':residual,'ideal7600TransferDropPa':pressure(residual,7600),
      'worstResidualWith2LpsDamperError':abs(residual)+2,
      'ideal7600DropWith2LpsErrorPa':pressure(abs(residual)+2,7600),
      'massBalanceLps':qs+other-m['totalExtractLps']})
assert all(m['massBalanceLps']==0 for m in kitchen_supply)
assert [m['kitchenTransferLps'] for m in kitchen_supply]==[0,3,0]
assert 48-13>=.2*108
control={'device':'REACT V GMB125','nativeRangeLps':[9,108],
 'VminLps':13,'VmaxLps':48,'minimumRecommendedSpanLps':.2*108,
 'normal':'Terminal3 Y floating selects Vmin in either native0..10 or2..10 mode.',
 'cooking':'Salsa floating NO ExtOut bridges the isolated24V terminal2 to terminal3 Y: native fullwave AC/DC Vmax override, not halfwave force-open.',
 'supply':'IEC61558-1 isolation transformer; independent support/access/cleaning and native controls retained.',
 'noRoomPressureController':True,'factoryQualifiedFaultInterlock':False,
 'fault':'Loss of hood contact/cable leaves Vmin13 even if hood mechanically open: capture/makeup failure is NOT automatically safe. U actual-flow feedback is available, but no qualified fault inhibit is claimed.',
 'remaining':'Actual native fan mode presets/commissioned fixed branch network, startup/damper travel, fan/filter/frost/power failure and cooking inhibit remain to be bound.'}
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
 'modes':modes,'dedicatedKitchenSupplyModes':kitchen_supply,'twoPositionKitchenControl':control,'protectedStairRule':fire_rule,'hoodBranchPressureScreen':hood_branch,'spineCrossings':air_crossings,
 'W9VestibuleHost':host,'fireSmokeTransferComparison':transfer,'heatSensitivity':energy,
 'requiredEffectiveRecoveryFor8kWAt128And30K':1-(8000-220*30)/(1.2*128*30),
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
print('PASS: pinned actual geometry,78/96/128 conservation, pressure/heat sensitivities and explicit host negative controls; architecture not adopted')
