#!/usr/bin/env python3
"""Finite cooker mode/first-release development; authored losses are not OEM curves."""
import hashlib,json,math,pathlib,subprocess,sys
P=pathlib.Path(__file__).resolve().parent
H='cfacc96c61ce1be5befa3bc0a10086c7cb6b4202'
PATH='project/had/studies/open-north-loggia.json'
raw=subprocess.check_output(['git','show',f'{H}:{PATH}'])
assert hashlib.sha1(b'blob '+str(len(raw)).encode()+b'\0'+raw).hexdigest()=='25faad2c4d40df2b7da7212f73808843a88d2f52'
h=json.loads(raw)
assert h['kitchenOccurrence']['cooking']['footprint']==[10750,10970.5,600,600]
rho=1.2
def area(d):return math.pi*(d/1000)**2/4
def dyn(q,d):return rho/2*(q/1000/area(d))**2
def makeup(q,d=300,free=.75):
    # Orifice includes the clean terminal; K2 separately covers open damper/entry.
    return rho/2*(q/1000/(.61*free*area(d)))**2+(2+.03*.60/(d/1000))*dyn(q,d)
def exhaust(q):
    # Complete path: 150mm120 throat; transition; 1219.5mm160 main; two bends;
    # outlet terminal/collars. The intact factory filter/fan is NOT added again.
    return (.03*.15/.12+.25)*dyn(q,120)+(.025*1.2195/.16+3+2+.5)*dyn(q,160)
flows={'publishedLow':125/3.6,'publishedBEP':160/3.6,'publishedHigh':224/3.6,'authoredUpperSensitivity':70}
rows=[{'mode':k,'lps':q,'externalExhaustPa':exhaust(q),'makeupPa':makeup(q),'roomPlusDuctPa':exhaust(q)+makeup(q)} for k,q in flows.items()]
assert makeup(70)<5
assert makeup(224/3.6,d=160)>5
assert makeup(224/3.6,free=.5)>5
# The one measured point is 44.44L/s at145Pa. Do not reuse145 at62.22 or35.
bep=rows[1]
bep['authoredFoulingAllowancePa']=25
bep['authoredAdverseWindAllowancePa']=20
bep['totalStressPa']=bep['roomPlusDuctPa']+45
assert bep['totalStressPa']<145
# Conservative FULL215ring bounding boxes, not just rectangular glass/head.
ring_checks=[]
for o in h['openings']['GROUND']:
    if o['wall']!='outer-east':continue
    lo=o['centre']-o['width']/2-215;hi=o['centre']+o['width']/2+215
    clearance=max(lo-(8700+225),(8700-225)-hi)
    assert clearance>0,(o['id'],clearance)
    ring_checks.append({'id':o['id'],'fullRingHorizontalBox':[lo,hi],'formed450HorizontalReserve':clearance})
cooker={
 'status':'Conditional complete development direction; actual configured kit/site/physical/material acceptance unearned.',
 'family':{'model':'Elica ERA GR/A/52','code':'PRF0142633','mode':'Ducted; three factory mechanical speeds retained; no recirculation credit.',
 'published':{'lowM3h':125,'highM3h':224,'BEPm3h':160,'BEPpa':145,'BEPw':73.5,'soundPowerDbA':[45,54],'greaseFilterEfficiencyPercent':56,'massKg':4.3,'outletDiameter':120,'inductionMinimumSeparation':500},
 'notEquivalent':'BEP is not low/high operating point; sound power is not room sound pressure; grease-filter efficiency is not plume-capture efficiency.',
 'visibleResidue':'Grey factory face/slider, coating and grid/plastics remain disclosed, unapproved. Surrounding removable metal canopy does not exempt or hide these constituents by claim.'},
 'extractPoint':[11200,12000,2400],'duct':160,'exhaustRadialInsulation':50,'metalJacketEachSide':1,'fullInsulatedOD':262,'formedWallTerritory':320,'minimumCaptureLps':30,
 'hood':{'canopyTerritory':[10750,10970.5,600,600],'undersideZ':1600,'hobTopZ':900,'separation':700,'completeUnitMaximum':[550,320,250],
 'bodyBoundStatus':'Inspected manual535x300 mainplan/177mainheight; cutout493x255 and4screws. Authored550x320x250 complete accommodation must include collar/leads/supports;177alone is not full installed height.',
 'outletTarget':[11050,11130.5,1850],'path':[[11050,11130.5,1850],[11050,11130.5,2400],[11200,11130.5,2400],[11200,12000,2400]],
 'pathLength':1569.5,'throatLength':150,'transitionLength':200,'mainLength':1219.5,'unitCentreXY':[11050,11130.5],'transition':'Unmodified120factory throat; supported smooth120→160 expansion; no smaller duct downstream.',
 'cleaning':'Monthly grease-grid cleaning per manual; grease capture56% demands inspectable duct, not a clean-duct assumption. No charcoal filter in selected ducted mode.'},
 'makeupPoint':[12000,8700,2400],'makeupFormedTerritory':450,'makeupAirDiameter':300,'makeupCompleteInsulatedOD':402,'makeupTerminalFace':[500,500],
 'makeupRequirement':'Dedicated passive pressure-driven air path, normally shut by separate powered damper; current sensing opens damper only while manually operated hood runs. Selected background remains78L/s. All factory speeds retained; actual commissioned capture≥30L/s and maximum flow≤70L/s must match this kit, otherwise reselect/enlarge explicitly.',
 'pressure':{'density':rho,'terminalCd':.61,'terminalMinimumFreeAreaFraction':.75,'makeupOtherK':2,'makeupLengthMetres':.60,'targetRoomDepressionMaximumPa':5,'rows':rows,
 'basis':'All loss coefficients, fouling/wind allowances and70upper sensitivity are authored compatibility requirements, not measured vendor data. Existing280formed/160air control and50%clogged screen fail. PublishedBEP alone provides a plausible margin; actual assembled curve/mode/capture commissioning remains required.',
 'failedOld160AirAtPublishedHighPa':makeup(224/3.6,d=160),'failedHalfFreeScreenAtPublishedHighPa':makeup(224/3.6,free=.5)},
 'controls':{'user':'Factory slider alone starts/stops hood; separate labelled manual double-pole isolation. No automatic hood start, timer/programmer or altered factory wiring.',
 'run':'Current sensor first commands separate makeup damper fully OPEN; full-open end switch proves the startup stroke within5s. Then pressure loop modulates effective conductance with separate position/command feedback and continuous kitchen pressure sensing. Full-open end switch is not claimed continuously made while modulating. BackgroundMEV remains independent. No supply fan or protected-corridor transfer is credited.',
 'fault':'Startup full-open proof absent by5s, subsequent position/command mismatch, pressure below−5Pa beyond5s, sensor/actuator fault or loss of power trips and latches hood supply OFF with visible fault. Manual reset only with factory slider OFF, then deliberate manual restart; no automatic energisation after power return. Startup transient and exact protective-control compatibility require qualified implementation; no OEM approval invented.',
 'stop':'On manual hood OFF close makeup damper after airflow stops. No timed automatic restart or invented hood run-on.',
 'fire':'No combustion selected. Fire alarm/required fire strategy can remove hood power/close damper; exact classified boundary/weather/seal and fire-control precedence remain explicit design interfaces, never ordinary silicone assumed as firestop.'},
 'interfaces':{
 'hoodFirstRelease':{'isolation':'Cool hob, electrical double-pole isolation/verify dead; grid/filter remove downward before service. No leaning/standing on hob.',
 'equipmentTerritory':[10595.5,10295.5,750,650],'equipmentHeightMaximum':300,'floorBodyForFasteners':[11045.5,10645],'holderFloorBody':[10425,11130.5],'access':'Rated steps/complete guards must fit750x650 for first duct/control task while hood remains FIXED. Remove steps before two floor handlers release unit. Authored front body/shoulder and side holder fields are checked; actual apparatus/humans/forces still qualify. Whole600canopy stays independently supported.',
 'connectionZone':[10950,11000,250,300,1850,2200],'sequence':'While four unit screws remain FIXED, access front duct panel from qualified steps, disconnect supported duct spool and isolated accessible electrical lead; then remove steps. Two qualified floor handlers support unit, release four supplied fixings from below through removed grid, lower250 then400S with front handler400S retreat. Hob cold/covered; no load on hob. Front shoulder200N of body is authored task geometry, never a universal human safety claim. Retained duct/canopy frame and supports remain.',
 'requiredSpool':'Zero-capture flat mating faces at supported160spool ends; clamps/grease seals renewed. Required100axial service zone, no nominal socket travel inferred.',
 'withdrawalEnvelope':[550,320,250],'direction':'Downward through493x255 factory mounting CUTOUT is NOT claimed: unit535x300 must lower below its own mounting flange into full600x400 removable lower-canopy bay; independent support frame remains; whole-room carrying remains IAS-owned.'},
 'makeupFirstRelease':{'innerBox':[11170.5,8450,400,500],'heightBand':[2150,2650],'clearFrontOpening':[450,450],'fullModuleMaximum':[400,400,300],
 'equipmentTerritory':[10145.5,8467.5,750,1100],'bodyCentre':[10595.5,8767.5],'shoulderTarget':[10795.5,8767.5,2100],'sequence':'Isolate hood/damper and wet affected zone if needed; remove independent metal front, support damper cartridge, unplug accessible lead, release two accessible clamps, withdraw300W into retained400service zone. Wall sleeve, thermal/water/air/fire perimeter stays fixed; temporarily cap any opened duct/boundary until resealed/tested. No screen is omitted.',
 'external':'Exterior500face/screen separately removable only from rated exterior access; indoor cleaning through sleeve must reach whole screen or exterior task is required.'},
 'controlsFirstRelease':{'station':[10750,10970.5,180,180],'heightBand':[1875,2075],'frontClearAperture':[200,220],'serviceEquipment':'Same hood first-task750x650 steps; hood remains fixed during control service','exposedMetalConduit20':[[10840,11060,1975],[10840,11060,3075],[11400,11060,3075],[11400,8700,3075],[11400,8700,2400],[11570.5,8700,2400]],'conduitRule':'Independent ceiling-hung complete20 envelope; top3085 leaves15 to3100 ceiling, above2850 moving-leaf heads. No attic/core/arch hole credited. Actual supports/fill/condensation/seals qualify.','sequence':'Accessible double-pole isolate, prove dead, support labelled removable control plate, unplug approved connectors and renew complete untouched certified module. Retained wiring/earth bonds stay supported; actual lead/terminal classification and owner residues remain disclosed.'}},
 'geometry':{'HADHead':H,'HADBlob':'25faad2c4d40df2b7da7212f73808843a88d2f52','ringConservativeChecks':ring_checks,'apertureStatus':'450port plus500face are a proposed rewind, not drilling/support/weather approval; exact joined HAD check remains required.'},
 'primarySources':{'family':'https://www.elica.com/IE-en/hoods/integrated/era','fiche':'https://damsrv.elica.com/doc/PLM_Documents/PF/PF-PRF0142633_A_21.pdf','manual':'https://damsrv.elica.com/doc/PLM_Documents/LibrettiWeb/LIB0142652A_D_2.pdf','comparator':'https://www.elica.com/GB-en/hoods/hidden-2-0'},
 'alternatives':{'recirculating':'Rejected as moisture/fume export; no30L/soutdoor capture credit.', 'Sleek':'Published300–690m3/h /83.33–191.67L/s,8.25kg/150outlet; excessive makeup territory compared with lower-flow family. Stainless finish alone is not constituent admission.', 'old30':'Thirty is minimum duty, not actual hood mode/makeup peak.'},
 'internalOpen':['Owning HAD composition must consume450makeup at8700 and exact maintenance/control fields; existing frozen280/8600 is an adverse control.','Render and independently review exact release/support/tool/three-dimensional occurrence sheet.'],
 'laterAdmission':['Actual mode/capture/pressure/noise measurements and supplier-compatible kit.','Exterior formed port/rebar/thermal/rain/air/fire boundaries and support design.','Apparatus stability, human handling and carrying; IAS owns full export.','Exact constituents and dated owner material exceptions; none approved.']}
# Axis-parallel whole body sweep vs every authored ground furniture occurrence.
def sweep_clear(x,y0,y1,r,box):
    bx,by,bw,bh=box
    dx=max(bx-x,x-(bx+bw),0);dy=max(by-max(y0,y1),min(y0,y1)-(by+bh),0)
    return math.hypot(dx,dy)-r
bodychecks=[]
for name,x,y0,y1 in [('front-handler',11045.5,10645,10245),('side-holder',10425,11130.5,10730.5)]:
    vals=[(sweep_clear(x,y0,y1,300,b),k) for k,b in h['groundFurniture'].items()]
    v,k=min(vals)
    assert v>=25-1e-7,(name,k,v)
    bodychecks.append({'id':name,'x':x,'yRange':[y0,y1],'radius':300,'governing':k,'minimumFurnitureReserve':v})
for name,field in [('hood-steps',cooker['interfaces']['hoodFirstRelease']['equipmentTerritory']),('makeup-steps',cooker['interfaces']['makeupFirstRelease']['equipmentTerritory'])]:
    x,y,w,d=field
    for k,b in h['groundFurniture'].items():
        assert not (x<b[0]+b[2] and x+w>b[0] and y<b[1]+b[3] and y+d>b[1]),(name,k)
assert cooker['interfaces']['makeupFirstRelease']['equipmentTerritory'][1]-(8424.5+18)==25
cooker['geometry']['firstReleaseFloorSweeps']=bodychecks
cooker['geometry']['makeupPlatformToRearWallBaseReserve']=25
cooker['geometry']['makeup500FaceToRearWallFinishReserve']=25.5
cooker['geometry']['hoodFastenerReachProxy']=math.sqrt(304.5**2+445.5**2+100**2)
assert cooker['geometry']['hoodFastenerReachProxy']<600
# This proxy supplies a finite task, not a universal safe-human reach criterion.
base=json.loads((P/'whole-house-service-baseline.json').read_text())
assert base['cooker']['makeupPoint']==[12000,8600,2400] and base['cooker']['makeupFormedTerritory']==280
assert h['servicesInterface']['cooker']['makeupPoint']==[12000,8600,2400]
assert h['groundFurniture']['service-emitter-kitchen-E']==[11370.5,9700,200,1350]
additional=[9675,11370.5,1050,200]
for name,box in h['groundFurniture'].items():
 x,y,w,d=box;a,b,c,e=additional
 assert not (x<a+c and x+w>a and y<b+e and y+d>b),(name,box)
window=next(o for o in h['openings']['GROUND'] if o['id']=='north-window-4')
assert window['centre']==10200 and window['width']==1000 and window['sill']==1050
assert additional[0]>=window['centre']-window['width']/2-25
assert additional[0]+additional[2]<=10750-25
assert additional[1]+additional[3]==11570.5
old=next(x for x in base['heat']['emitterSchedule'] if x['id']=='kitchen-E')
assert abs(old['nominalDelta50W']-2866.8)<1e-8 and old['screenOutputW']==980.4456
nominal_new=2389*.9
correction_60_50_20=((60+50)/2-20)/50
factor=correction_60_50_20**1.32
existing_60_50=old['nominalDelta50W']*factor
new_60_50=nominal_new*factor
assert existing_60_50<2900<existing_60_50+new_60_50
# 78 L/s background remains independently counted. Cooker intake is additional
# outdoor air at full capture; neither cooking gains nor a fabric improvement is credited.
base_wk=220+1.2*78
thermal=[{'cookerLps':q,'totalAt25K_W':(base_wk+1.2*q)*25,
          'additionalKitchenMakeupAt25K_W':1.2*q*25} for q in [160/3.6,224/3.6,70]]
assert thermal[-1]['totalAt25K_W']==9940
# Two-node monotone pressure network, exterior0 / hall / kitchen. The six
# existing13L/s local extract stations are independently switched; the
# 90,000mm² background inlet is assigned to the other-room/hall node, and
# the 7,600mm² finished kitchen door transfer is the only credited transfer.
# These are authored equivalent areas, not measured duct/door leakage curves.
def opening_flow(area_mm2,delta_pa):
 return .61*area_mm2/1000*math.copysign(math.sqrt(2*abs(delta_pa)/rho),delta_pa)
def hall_at_kitchen_pressure(other_extract,pk=-4.5):
 def balance(ph):return opening_flow(90000,-ph)-other_extract-opening_flow(7600,ph-pk)
 lo,hi=-30.,30.
 assert balance(lo)>0 and balance(hi)<0
 for _ in range(100):
  mid=(lo+hi)/2
  if balance(mid)>0:lo=mid
  else:hi=mid
 ph=(lo+hi)/2
 return ph,opening_flow(7600,ph-pk),opening_flow(90000,-ph)
def fixed_open_kitchen_pressure(other_extract,kitchen_background,hood,full_open=True):
 def residual(pk):
  ph,transfer,_=hall_at_kitchen_pressure(other_extract,pk)
  intake=math.sqrt(max(-pk,0)/makeup(70))*70 if full_open else 0
  return transfer+intake-kitchen_background-hood
 lo,hi=-30.,10.
 assert residual(lo)>0 and residual(hi)<0
 for _ in range(100):
  mid=(lo+hi)/2
  if residual(mid)>0:lo=mid
  else:hi=mid
 pk=(lo+hi)/2
 return {'kitchenPa':pk,'hallPa':hall_at_kitchen_pressure(other_extract,pk)[0],
         'massResidualLps':residual(pk)}
network=[]
for mask in range(64):
 kitchen_background=13 if mask&1 else 0
 others=13*(mask>>1).bit_count()
 ph,transfer,background=hall_at_kitchen_pressure(others)
 assert abs(background-others-transfer)<1e-9
 for mode,q in flows.items():
  demand=q+kitchen_background-transfer
  max_intake=70*math.sqrt(4.5/makeup(70))
  alpha=demand/max_intake
  assert 0<alpha<1,(mask,mode,demand,max_intake)
  network.append({'extractMask':mask,'otherExtractLps':others,'kitchenBackgroundLps':kitchen_background,
   'cookerMode':mode,'cookerLps':q,'kitchenPa':-4.5,'hallPa':ph,
   'backgroundInflowLps':background,'hallToKitchenLps':transfer,
   'requiredModulatedMakeupLps':demand,'fullOpenMakeupAt4_5PaLps':max_intake,
   'effectiveConductanceFraction':alpha,'kitchenMassResidualLps':transfer+demand-kitchen_background-q})
assert len(network)==256
assert max(abs(r['kitchenMassResidualLps']) for r in network)<1e-9
governing=max(network,key=lambda r:r['effectiveConductanceFraction'])
assert governing['extractMask']==63 and governing['cookerMode']=='authoredUpperSensitivity'
assert len(base['supply'])==6 and all(x['measuredEquivalentAreaRequired']==15000 for x in base['supply'])
room_supply=[{'room':x['id'],'equivalentInletAreaMM2':15000,'nominalAllocatedLps':13,
 'idealDirectAtGoverningHallPressureLps':opening_flow(15000,-governing['hallPa']),
 'closedDoorPressureAndDeliveredFlow':'Unsolved: actual room node and serial transfer are not represented by aggregate hall equivalent.'} for x in base['supply']]
assert sum(x['idealDirectAtGoverningHallPressureLps'] for x in room_supply)==governing['backgroundInflowLps']
assert all(x['idealDirectAtGoverningHallPressureLps']<13 for x in room_supply)
negative={'fullOpenPublishedLowAllExtracts':fixed_open_kitchen_pressure(65,13,125/3.6),
          'hoodOffDamperClosedAllExtracts':fixed_open_kitchen_pressure(65,13,0,False),
          'hoodOffDamperClosedAllLocalsOff':fixed_open_kitchen_pressure(0,0,0,False)}
assert negative['fullOpenPublishedLowAllExtracts']['kitchenPa']>-4.5
assert abs(negative['hoodOffDamperClosedAllLocalsOff']['kitchenPa'])<1e-8
cooker['successorCompatibility']={
 'sourceJoin':'Proposed MAT successor against immutable HAD source; frozen HAD servicesInterface and whole-house baseline remain historical 280/Y8600 controls, not silently edited.',
 'proposedMakeup':{'point':[12000,8700,2400],'formedTerritory':450,'face':500,
  'fullRingChecks':ring_checks,'rearInternalJunctionClearance':25.5,'firstReleaseBaseReserve':25},
 'kitchenEmitter':{'proposedAdditionalCompletePlan':additional,'family':'K3 H600 L900 comparison',
  'bottomZ':100,'topZ':700,'northWindowCill':1050,'northWindowHorizontalEdges':[9700,10700],
  'oldNominalDelta50W':old['nominalDelta50W'],'additionalNominalDelta50W':nominal_new,
  'screenAt45_40_20W':old['screenOutputW']+nominal_new*.342,
  'screenAt60_50_20W':existing_60_50+new_60_50,'targetAtFullPublishedHighAnd25KW':.95*1000+1.2*(224/3.6)*25,
  'targetAt70LpsAnd25KW':.95*1000+1.2*70*25,
  'coupledAllOn70LpsMakeupDutyW':.95*1000+1.2*governing['requiredModulatedMakeupLps']*25,
  'coupledAllOn70Lps60_50MarginW':existing_60_50+new_60_50-(.95*1000+1.2*governing['requiredModulatedMakeupLps']*25),
  'allocationCaveat':'950W inherited kitchen room budget is a compatibility allocation, not measured room loss. Its inherited13L/s kitchen extract was supplied via hall transfer. Conservatively add the entire72.043L/s direct cold makeup, not just70L/s hood flow; exact interroom heat balance and all-room loss distribution are unresolved.',
  'oldAt75_65_20W':old['nominalDelta50W'],
  'qualification':'The 60/50 comparison is conditional on actual net plant output at that water temperature, support/window/IAS renewal and all other room emitters. At the inherited45/40 design point the additional radiator still fails the cooker makeup duty.'},
 'wholeHouseHeat':{'fabricPlusInfiltrationWK':220,'backgroundLps':78,'deltaTK':25,
  'cases':thermal,'requiredNetDeliveredCapacityKW':12,'net12MarginAt70LpsW':12000-thermal[-1]['totalAt25K_W'],
  'tenKWAt200WK':'Conditional arithmetic only: actual envelope/control and mode data must earn that alternative; not adopted.',
  'waterSecondaryFlowAt12KW5K_Lps':12/(4.18*5),
  'waterSecondaryFlowAt12KW10K_Lps':12/(4.18*10),
  'primaryFlowAt12KW5KAnd3_2KJkgK_Lps':12/(3.2*5),
  'primaryFlowAt12KW10KAnd3_2KJkgK_Lps':12/(3.2*10),
  'oldSecondaryTargetLps':base['heat']['fluidFlowBoundary']['secondaryWaterTargetLps'],
  'oldPrimaryTargetLps':base['heat']['fluidFlowBoundary']['primaryGlycolTargetLps'],
  'qualification':'5K is inherited emitter/primary differential sensitivity, not compulsory12kW flow. At10K water flow halves but all emitter and pump/primary/heat-exchanger capacities must be re-proved. Existing0.4/0.5L/s targets cannot be carried over as certified12kW/5K capacities. Net12kW at required water temperature and room-by-room loads require a revised connected contract.'},
 'pressureNetwork':{'model':'Exterior0Pa; two monotone nodes hall and kitchen. Background90,000mm² equivalent inlet to hall, local kitchen7600mm² door transfer, six independently switched13L/s extracts. Cd0.61,rho1.2; cooker intake full-open K/terminal law from pressure screen, modulated effective conductance. No assumed leakage beyond these declared paths.',
  'targetKitchenPa':-4.5,'cases':network,'governing':governing,
  'supplyRoomGap':room_supply,
  'negativeAndOffControls':negative,
  'governingMakeupCapacityMarginLps':governing['fullOpenMakeupAt4_5PaLps']-governing['requiredModulatedMakeupLps'],
  'minimumFullOpenDeliveryFraction':governing['effectiveConductanceFraction'],
  'fullOpenFailure':'Fixed full-open300 intake overfeeds low modes; effective conductance must track measured kitchen pressure. The computed fraction is not a damper blade angle or supplied actuator curve.',
  'failureInterlock':'On manual hood start, demand full-open and prove startup stroke within5s, then modulate with separate position feedback and continuous pressure proof. The full-open end switch cannot be required made during normal part-open operation. Pressure below−5Pa for5s, subsequent position mismatch, sensor/actuator or supply failure trips latched hood power. Manual reset only after factory OFF; no automatic restart. Startup pressure transient requires configured test.',
  'acceptance':'The90,000mm² aggregate exterior area is not six proved supply-room paths. Closed bedroom and protected doors, actual supply-room minima, series transfer losses and local extract capacities require a room-by-room measured/connected network. Governing makeup margin is only2.68% of full-open capacity; screen fouling, wind or coefficient tolerance can erase it, forcing larger/more robust terminal or lower certified cooker ceiling. No fire-door cut or manufactured performance is accepted.'}}
out=json.dumps(cooker,indent=2,ensure_ascii=False)+'\n'
from html import escape
parts=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 850"><rect width="1200" height="850" fill="#fcfaf4"/><style>text{font:15px sans-serif;fill:#243238}.h{font:bold 21px sans-serif}.s{font:13px sans-serif}.label{font:12px sans-serif}</style>']
def text(x,y,t,cl=''):parts.append(f'<text x="{x}" y="{y}" class="{cl}">{escape(str(t))}</text>')
def box(x,y,w,d,fill,stroke='#52606b'):parts.append(f'<rect x="{x}" y="{y}" width="{w}" height="{d}" fill="{fill}" stroke="{stroke}"/>')
def planbox(b,fill,stroke='#52606b'):
 x,y,w,d=b;box(45+(x-10000)*.15,110+(12000-y-d)*.15,w*.15,d*.15,fill,stroke)
text(35,35,'Cooker capture / makeup / first release — conditional development','h')
text(35,63,'MM • ground FFL0 • HADcfacc fixed source • no kit, structural, material or physical acceptance')
text(40,95,'1. Kitchen plan / north ↑','h')
box(35,105,370,620,'none')
for key in ['north-cooking-station','cold-storage','service-emitter-kitchen-E']:
 planbox(h['groundFurniture'][key],'#ddd8ca')
planbox([11370.5,8155.5,200,269],'#b8b3a5')
for k in ['hoodFirstRelease','makeupFirstRelease']:
 planbox(cooker['interfaces'][k]['equipmentTerritory'],'#d3ebe5','#27746c')
planbox(cooker['hood']['canopyTerritory'],'none','#945a24')
planbox([10775,10970.5,550,320],'#f2cea4')
planbox(cooker['interfaces']['makeupFirstRelease']['innerBox'],'#f2cea4')
for x,y in [(11045.5,10645),(10425,11130.5)]:parts.append(f'<circle cx="{45+(x-10000)*.15}" cy="{110+(12000-y)*.15}" r="45" fill="none" stroke="#335b9e"/>')
text(162,192,'Cooker / canopy','label')
text(188,482,'Fridge','label')
text(285,330,'K3','label')
text(140,356,'Hood steps','label')
text(73,510,'Makeup steps','label')
text(280,598,'E wall','label')
text(48,745,'Green = COMPLETE equipment field; blue = R300 body','s')
text(48,765,'500 face at Y8450–8950 clears junction25.5.','s')
text(48,785,'Makeup steps Y8467.5 clear full18base25.','s')
text(450,100,'2. Fixed fabric and separated release duties','h')
box(450,115,710,290,'#fff')
for i,line in enumerate([
 'ERA GR/A/52 PRF0142633: grey factory face/slider retained and unapproved.',
 '535×300×177 MAIN body; full550×320×250 target includes collar/leads.',
 '600×600 metal canopy; underside1600 above hob900 by700 (OEM minimum500).',
 'First: isolate/cool; grid off; steps for duct/control while four unit screws FIXED.',
 'Then remove steps; two floor handlers support, release4screws,250DOWN/400S.',
 '600×400 lower bay is distinct from493×255 mounting cutout. No hob loading.',
 'Fixed160duct/support stays. Zero-capture removable spool; grease seals renewed.',
 'Makeup300air +50radial +1jacket =402OD in450formed enquiry;500face.',
 'Damper cartridge400×400×300 through450clear front; retained sleeve stays.',
 'Qualified equipment/forces/tool/actual complete parts still must match targets.'
]):text(465,143+i*25,line,'s')
text(450,445,'3. Mode / pressure comparison and control','h')
box(450,460,710,295,'#fff')
text(465,487,'Published BEP160m³/h =44.444L/s at145Pa /73.5W. Not a full fan curve.','s')
for i,r in enumerate(rows):text(465,515+i*24,f"{r['mode']}: {r['lps']:.2f}L/s | external exhaust{r['externalExhaustPa']:.2f}Pa | makeup{r['makeupPa']:.2f}Pa",'s')
text(465,620,f"BEP +25fouling +20wind stress = {bep['totalStressPa']:.2f}Pa <145 at THAT measured point.",'s')
text(465,646,'70L/s authored upper sensitivity: makeup4.023Pa <5; old160air/clogged control FAIL.','s')
text(465,672,'Factory MANUAL hood start/speeds. Current sensing commands separate damper only.','s')
text(465,698,'Missing proof / sustained <−5Pa → latched OFF; manual reset, no automatic restart.','s')
text(465,724,'78L/s background independent. Installed capture≥30 / all modes≤70 are kit requirements.','s')
text(40,802,f"NETWORK:256cases; all-on/70 kitchen−4.5/hall{governing['hallPa']:.2f}Pa; makeup{governing['requiredModulatedMakeupLps']:.2f}L/s, margin1.99L/s.",'s')
text(40,825,'Open: actual bedroom/door flows, damper/control test, owning HAD, hydraulics and physical admission.','s')
parts.append('</svg>');svg=''.join(parts)+'\n'
target=P/'cooker-capture-modes.json';svgpath=P/'cooker-capture-modes.svg'
if '--check' in sys.argv:
 assert target.read_text()==out,'Stale cooker JSON'
 assert svgpath.read_text()==svg,'Stale cooker drawing'
else:
 target.write_text(out);svgpath.write_text(svg)
print(json.dumps({'family':cooker['family']['code'],'BEPstressPa':bep['totalStressPa'],'makeup70Pa':makeup(70),'minimumPortRingReserve':min(x['formed450HorizontalReserve'] for x in ring_checks),'internalOpen':len(cooker['internalOpen'])}))
