#!/usr/bin/env python3
"""Pinned allocation and manual pre-arm screen, not installed system approval."""
import contextlib,hashlib,io,json,math,pathlib,runpy,sys

P=pathlib.Path(__file__).resolve().parent
def pinned(path,expected):
    raw=path.read_bytes()
    sha=hashlib.sha1(b'blob '+str(len(raw)).encode()+b'\0'+raw).hexdigest()
    assert sha==expected,(str(path),sha,expected)
    return json.loads(raw) if path.suffix=='.json' else path

b=pinned(P/'whole-house-service-baseline.json','2d8f7243fb87d350763f2bca3d103b89b9d14b7d')
n=pinned(P/'connected-cooker-network.json','50af6c4734488210e4d0dec8d7b8f4d4d3a9e3c0')
h=pinned(P.parent.parent/'had/studies/open-north-loggia.json','25faad2c4d40df2b7da7212f73808843a88d2f52')
pinned(P/'connected-cooker-network.py','f99d727872069e35b74c7d80c7b19fe384f85c9e')
saved_argv=sys.argv[:]
try:
    sys.argv=['connected-cooker-network.py','--check']
    with contextlib.redirect_stdout(io.StringIO()): solver=runpy.run_path(str(P/'connected-cooker-network.py'))
finally:sys.argv=saved_argv

budgets={key:round(val*1000) for key,val in b['heat']['roomOutputCompatibilityBudgetsKW'].items()}
assert sum(budgets.values())==8000 and n['normalHoodOff']['totalHabitableInletLps']-78<1e-6
vents=tuple(n['roomInletsMM2'])
normal_off=n['normalHoodOff']['roomSupplyLps']
base={room:budgets[room]-30*normal_off[room] if room in vents else budgets[room] for room in budgets}
assert abs(sum(base.values())-5660)<1e-5 and abs(base['kitchenDining']-950)<1e-8

def ledger(row,kelvin,hood):
    scale=kelvin/25
    q=row['roomSupplyLps']
    direct=row['cookerModes']['upperSensitivity']['requiredDirectMakeupLps'] if hood else 0
    room={room:base_w*scale+(1.2*kelvin*q[room] if room in vents else 0) for room,base_w in base.items()}
    room['kitchenDining']+=1.2*kelvin*direct
    total=sum(room.values())
    exterior=sum(q.values())+direct
    assert abs(exterior-(166 if hood and row['mask']==63 else 148 if hood else 78))<1e-5
    assert abs(total-(5660*scale+1.2*kelvin*exterior))<1e-4
    return {'deltaK':kelvin,'roomW':room,'directMakeupLps':direct,'exteriorLps':exterior,'totalAllocatedW':total,
            'wholeHouse220WKScreenW':(220+1.2*exterior)*kelvin,
            'allocationMarginW':total-(220+1.2*exterior)*kelvin}

normal=ledger(n['normalHoodOff'],25,False)
hood25=ledger(n['hoodOnAtKitchenMinus4_5Pa'][0],25,True)
boost25=ledger(n['hoodOnAtKitchenMinus4_5Pa'][-1],25,True)
boost30=ledger(n['hoodOnAtKitchenMinus4_5Pa'][-1],30,True)
assert abs(hood25['totalAllocatedW']-10100)<1e-4
assert abs(boost25['totalAllocatedW']-10640)<1e-4
assert abs(boost30['totalAllocatedW']-12768)<1e-4

# A separate manual pre-arm leaves the hood OFF while the factory damper's
# 150-second powered stroke completes. This uses only the authored clean K law;
# the actual damper/terminal resistance and pressure transients remain unknown.
prearm=[]
for mask in (0,63):
    lo,hi=-20.,0.
    for _ in range(24):
        kitchen=(lo+hi)/2
        row=solver['solve'](mask,kitchen)
        need=row['localExtractLps']['kitchen']-row['hallToKitchenLps']
        available=solver['full_flow'](400)*math.sqrt(-kitchen/4.5)
        if available>need:lo=kitchen
        else:hi=kitchen
    assert abs(available-need)<.001
    prearm.append({'localMask':mask,'hoodLps':0,'kitchenPa':kitchen,
                   'cleanDirectLps':available,'habitableSupplyLps':row['totalHabitableInletLps'],
                   'hallPa':row['nodePa']['hall'],'balanceResidualLps':available-need,
                   'coldDirect25KW':30*available})
    assert abs(available+row['totalHabitableInletLps']-(78 if mask==0 else 96))<.001

h600=2866.8
h700_900=2441
h700_1100=2983
def emitter(nominal,mean_delta,ncoef):return nominal*(mean_delta/50)**ncoef
old65=emitter(h600,40,1.32)
trial={str(length):{'at60_50W':emitter(h600,35,1.32)+emitter(nom,35,1.34),
                     'at65_55W':old65+emitter(nom,40,1.34),
                     'delta30AllBoostMarginAt65_55W':old65+emitter(nom,40,1.34)-boost30['roomW']['kitchenDining'],
                     'completePlanMM':[9675 if length==900 else 9600 if length==1000 else 9575,11370.5,length+150,200],
                     'dryMassKg':60.77*length/1000,
                     'filledMassKg':(60.77+11.37)*length/1000}
       for length,nom in [(900,h700_900),(1000,2712),(1100,h700_1100)]}
assert trial['900']['delta30AllBoostMarginAt65_55W']<0<trial['1000']['delta30AllBoostMarginAt65_55W']<trial['1100']['delta30AllBoostMarginAt65_55W']
def overlap(a,z):return a[0]<z[0]+z[2] and a[0]+a[2]>z[0] and a[1]<z[1]+z[3] and a[1]+a[3]>z[1]
for length,item in trial.items():
    plan=item['completePlanMM'];swept=[plan[0],plan[1]-200,plan[2],plan[3]+200]
    item['staticFurnitureCollisions']=[name for name,furn in h['groundFurniture'].items() if overlap(plan,furn)]
    item['renewalFurnitureCollisions']=[name for name,furn in h['groundFurniture'].items() if overlap(swept,furn)]
    if length!='1100':
        assert not item['staticFurnitureCollisions'] and not item['renewalFurnitureCollisions'],('radiator',length,item)
assert set(trial['1100']['staticFurnitureCollisions'])=={'north-sink-station','north-cooking-station'}
assert set(trial['1100']['renewalFurnitureCollisions'])=={'north-sink-station','north-cooking-station'}
assert trial['1000']['completePlanMM']==[9600,11370.5,1150,200]
assert h['groundFurniture']['north-sink-station'][0]+h['groundFurniture']['north-sink-station'][2]==9600
assert h['groundFurniture']['north-cooking-station'][0]==10750
assert trial['1100']['completePlanMM']==[9575,11370.5,1250,200]
window=next(x for x in h['openings']['GROUND'] if x['id']=='north-window-4')
assert window['centre']==10200 and window['width']==1000 and window['sill']==1050
assert (window['centre']-window['width']/2)-trial['1100']['completePlanMM'][0]==125
assert trial['1100']['completePlanMM'][0]+1250-(window['centre']+window['width']/2)==125
old_east=next(x for x in b['heat']['emitterSchedule'] if x['id']=='kitchen-E')
east_window=next(x for x in h['openings']['GROUND'] if x['id']=='east-window-3')
assert old_east['completePlanWithValvesAndBrackets']==[11370.5,9700,200,1350]
assert east_window['centre']==10200 and east_window['width']==1000 and east_window['sill']==850
assert old_east['completePlanWithValvesAndBrackets'][1]<east_window['centre']+east_window['width']/2
assert old_east['completePlanWithValvesAndBrackets'][1]+1350>east_window['centre']-east_window['width']/2
east_uprate={'listedH700L1200Delta50W':3254,'pairedH700L900At65_55W':emitter(3254,40,1.34)+emitter(2441,40,1.34),
 'allBoost30KMarginW':emitter(3254,40,1.34)+emitter(2441,40,1.34)-boost30['roomW']['kitchenDining'],
 'completeExistingPlanMM':old_east['completePlanWithValvesAndBrackets'],
 'eastWindowSillTopMM':east_window['sill'],'highestPossibleCillUndersideMM':east_window['sill'],
 'requiredUndersideForBottom100Top800Lift50Reserve50MM':900,
 'dryMassKg':60.77*1.2,'filledMassKg':(60.77+11.37)*1.2,
 'status':'Thermal arithmetic passes, but retained 100mm bottom and50mm lift+50mm reserve require underside900 while drawn east-window sill top is only850. The complete emitter overlaps that window; no zero-thickness cill can fix it. Reject this same-station uprate without explicit architectural/height/renewal redesign.'}
assert east_uprate['allBoost30KMarginW']>0 and east_uprate['highestPossibleCillUndersideMM']<900

out={'status':'Finite source-pinned constructive compatibility direction, not selected installed cooker, damper, heat plant or material exception.',
 'source':{'main':'207e8cd137f408dd94a0dff3db2f7ee015be1392',
           'baselineBlob':'2d8f7243fb87d350763f2bca3d103b89b9d14b7d',
           'networkJsonBlob':'50af6c4734488210e4d0dec8d7b8f4d4d3a9e3c0',
           'networkPythonBlob':'f99d727872069e35b74c7d80c7b19fe384f85c9e'},
 'HADBlob':'25faad2c4d40df2b7da7212f73808843a88d2f52',
 'allocation':{'sourceRoomBudgetsW':budgets,'sourceBudgetTotalW':8000,
   'baselineExternalVentLps':normal_off,'baselineVentilationWBySupplyRoom':{x:30*normal_off[x] for x in vents},
   'reconstructedOtherW':base,'reconstructedOtherTotalW':sum(base.values()),
   'cases':{'hoodOffNormal25':normal,'hoodOnNormal25':hood25,'hoodOnAllBoost25':boost25,'hoodOnAllBoost30':boost30},
   'basis':'A complete coherent accounting example: allocate all baseline exterior ventilation heat at actual six inlet rooms; kitchen950W remains other allocation. The author supplied no room-level fabric/ventilation split. Alternative credit of13 L/s kitchen extract (390W at25K) requires adding the same390W to upstream supplying-room budgets; it cannot reduce whole-house demand.'},
 'manualPreArmHoodOff':prearm,
 'candidate400':{'maker':'Lindab DTBCU Ø400, SF24A-SR factory listed option, not selected',
   'damperAxialMM':100,'bareMassKg':6.42,'motorSignalV':[2,10],
   'motorPoweredFullStrokeS':150,'failClosedSpringReturnAtMinus20To50S':'<20',
   'motorPositionFeedbackAccuracyPercent':5,'bladeSeal':'EPDM rubber; unapproved material residue',
   'continuousRegulationHold':'Underlying DTU manufacturer sheet describes blade regulation at rare occasions. A 2–10 V actuator option does not establish frequent closed-loop pressure duty; require explicit OEM lifecycle/duty-cycle approval or reject this RUN family.',
   'casingAndActuatorEnvelope':'Design 3 drawing calls out 230,140,105mm about mounted actuator; complete spatial orientation, connectors, insulation, tool and support still need OEM dimensional drawing and assembly.',
   'performance':'No evidenced full-open pressure loss, screen free area or capture margin at required81.550L/s/4.5Pa; the authored K2 screen cannot be assigned to this damper.'},
 'alternateReject':{'TROXTVR400':'Listed 500mm axial Easy/Compact with published low sizing point about165L/s; no stable commissioned76–82L/s passive pressure control proof.','LindabDTFU':'Fast 2.5s modulating but only Ø80–250 manufacturer listed, and no spring fail-closed version shown.'},
 'kitchenEmitterTrials':trial,
 'existingEastEmitterH700Uprate':east_uprate,
 'emitterGeometryLimit':'H700 L1100 plus150mm valve allowance occupies1250mm and collides25mm with sink and75mm with cooking furniture. H700 L1000 complete1150mm can only use exactly x9600–10750 between those stations, zero reserve for support/valves/tolerance and only about71W heat margin at65/55/30K allboost. The H700 L900 complete1050mm has some furniture clearance but misses that heat point by130W. Sill underside≥900mm, supports, valve/pipes, mass handling and IAS export remain unjoined.',
 'controlSequence':['IDLE: manually operated hood OFF, makeup spring CLOSED; background fans remain independent.',
 'PRE-ARM: separate user action requests makeup OPEN while hood stays manually OFF. SF24A-SR needs up to150s per90°; do not assert old5s proof. Show READY only after independently set full-open auxiliary switch and feedback/pressure agreement.',
 'RUN (unqualified): user manually starts hood after READY. A proposed pressure loop would frequently reposition the damper, preserving all factory hood speeds; full-open switch is not a continuous RUN requirement. DTU source only allows regulation on rare occasions, so OEM duty-cycle suitability must be proved or this family rejected. Verify pressure, independent position feedback and actual hood current/capture.',
 'FAULT: on loss of position, low supply, adverse wind/fouling or sensor/controller power fault, latch alarm and qualified protective hood power inhibition/trip with manual reset; no automatic hood ON. Actual OEM electrical permission and safe terminal behavior remain gates.',
 'STOP: user manually stops hood, current/airflow proves OFF, then makeup spring closes. On common power loss the hood also de-energises; do not treat spring travel as immediate if separately powered hood continues.'],
 'limits':'No installed pressure curve, wind/fouling capacity, OEM frequent-modulation duty cycle, hood power interruption approval, classified transfer/fan/capture commissioning, support/rebar/weather/thermal/acoustic/fire detail, actor/tool/cold-store-height/first-release proof, complete material admission or heat plant/emitter network selection. Baseline allocation is one explicit ledger, not measured room heat loss.'}
text=json.dumps(out,indent=2,ensure_ascii=False)+'\n'
target=P/'constructive-cooker-system.json'
if '--check' in sys.argv:assert target.read_text()==text,'stale constructive result'
else:target.write_text(text)
print(json.dumps({'prearmNormalLps':prearm[0]['cleanDirectLps'],
 'hoodBoostKitchen30W':boost30['roomW']['kitchenDining'],
 'H700L1100MarginW':trial['1100']['delta30AllBoostMarginAt65_55W']}))
