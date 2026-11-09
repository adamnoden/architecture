"""Heating and first removal of the local kitchen supply unit. Coordinates in mm."""
import argparse
import json
from math import ceil, cos, dist, hypot, isclose, log, pi, radians, sin
from pathlib import Path

HERE = Path(__file__).resolve().parent
def read(name):
    return json.loads((HERE / name).read_text())

house = read('../../had/studies/water-replan.json')['model']
service = read('whole-house-service-baseline.json')
joined = read('joined-cooker-system.json')
hood = joined['SwegonExternalMotorCandidate']
plant = read('local-extract-heat-and-store.json')['preferredThreePhase']
kitchen = read('kitchen-replan-heat.json')['recommendedDevelopment']
all_rows = hood['all256Modes']
assert len(all_rows)==256 and set(r['manualCommandV'] for r in all_rows)=={2,5,8,10}
active = [v for r in all_rows if r['manualCommandV']==10 for v in r['variants']]
assert len(active)==192 and all(v['flowLps']>=48 for v in active)
def span(values):
    values = list(values)
    return [min(values),max(values)]
direct = span(v['directMakeupLps'] for v in active)
exhaust = span(v['flowLps'] for v in active)
supply_c, air_cv = 18., 1.2   # kJ per m³ K
coil = span(air_cv*v['directMakeupLps']*(supply_c+10)/1000 for v in active)
room = span(1.14 + air_cv*v['directMakeupLps']*(20-supply_c)/1000 for v in active)
physical = span(v['physicalWholeHouseW']/1000 for v in active)
water_cv = 4.186
nominal = next(e for e in service['heat']['emitterSchedule'] if e['id']=='kitchen-E')
east = nominal['nominalDelta50W']*((10/log(35/25))/50)**nominal['nCoefficient']/1000
assert east>room[1] and plant['usefulRoomTargetKW']>physical[1]
background = span(v['directMakeupLps']-v['flowLps'] for v in active)
idle_loss = 1.14 + air_cv*background[1]*30/1000
hyd = {'activeHighestV':10, 'masks':64, 'hotCookSamples':len(active),'hoodLps':exhaust,'outsideSupplyLps':direct,
       'coilKW':coil,'kitchenRadiatorKW':room,'existingKitchenRadiatorKW':east,
       'kitchenMinSupplyC':20-(east-1.14)*1000/(air_cv*direct[1]),
       'localRadiatorMarginW':1000*(east-room[1]),'wholeHouseHeatKW':physical,
       'maxWholeHouseKWhAt22Ordinary2Hot':22*9.408+2*physical[1],
       'minMachineMarginKW':plant['usefulRoomTargetKW']-physical[1],
       'othersAtPeakKW':max(v['physicalWholeHouseW']/1000-air_cv*v['directMakeupLps']*30/1000-1.14 for v in active),
       'coilLminAt10K':coil[1]*60/(water_cv*10),'injection55CInto35ReturnLmin':coil[1]*60/(water_cv*20),
       'hoodOffMakeupAtMinus4PaLps':background,'hoodOffColdKitchenKW':idle_loss,
       'untemperedPeakKitchenKW':1.14+air_cv*direct[1]*30/1000}
other = 0
ratios=[]
for label,budget in service['heat']['roomOutputCompatibilityBudgetsKW'].items():
    if label=='kitchenDining':continue
    watts=0
    for e in service['heat']['emitterSchedule']:
        if e['room']==label:
            target=e['roomTargetC']
            watts += e['nominalDelta50W']*(10/log((55-target)/(45-target))/50)**e['nCoefficient']
    other+=watts/1000
    ratios.append((watts/1000/budget,label))
hyd['otherEmitterKW']=other
hyd['minimumOtherToOldRoomBudget']=min(ratios)
assert other>=hyd['othersAtPeakKW'] and idle_loss>east
# Pressure envelope. The 700 coarse-filter catalogue curve reads above 350 Pa within the
# accepted 280–362 m³/h band. Pressure increments below are explicit procurement allowances.
duct_d=.25
velocity=direct[1]/1000/(pi*duct_d**2/4)
dynamic=.5*1.2*velocity**2
pressure={'maxVelocityMps':velocity,'netDirtyLouvreFreeAreaM2':.375*pi*duct_d**2/4,
          'louvrePa':1.2/2*(direct[1]/1000/(.61*.375*pi*duct_d**2/4))**2,
          'ductAndFittingsPa':dynamic*(.03*3/duct_d+4),
          'dirtyFilterIncrementPa':100,'otherLossAllowancePa':50,'adverseWindPa':50,'minimumChartAvailablePa':350}
pressure['grossRequiredPa']=sum(pressure[k] for k in ('louvrePa','ductAndFittingsPa','dirtyFilterIncrementPa','otherLossAllowancePa','adverseWindPa'))
pressure['remainingPa']=350-pressure['grossRequiredPa']
assert pressure['remainingPa']>80
# The physical controls use three different measurements: hood capture, entering supply
# temperature and kitchen/outdoor differential pressure. These inequalities are necessary
# gates, not simulated actuator dynamics or certified sensor/timing performance.
modes={}
for command in (2,5,8,10):
    data=[v for r in all_rows if r['manualCommandV']==command for v in r['variants']]
    modes[str(command)]={'exhaustLps':span(v['flowLps'] for v in data),'intakeLps':span(v['directMakeupLps'] for v in data),
                         'reaches48EverySample':all(v['flowLps']>=48 for v in data),
                         'allIntakesInSelectedCoilChart':all(v['directMakeupLps']*3.6>=280 for v in data)}
assert modes['10']['allIntakesInSelectedCoilChart'] and not modes['8']['allIntakesInSelectedCoilChart']

# In standby a separate warm-side calibration plate runs continuously while the main
# outlet is closed. Solve the actual 14-node transfer tree at fixed total kitchen supply.
# Every extract other than kitchen is a terminal, reducing the graph to one ring pressure.
netmodel=read('connected-cooker-network.json')
pairs={(e['from'],e['to']):e['finishedEquivalentAreaMM2'] for e in netmodel['edges']}
assert len(pairs)==13 and pairs['upperRing','hall']==90000
assert all(v==7600 for k,v in pairs.items() if k!=('upperRing','hall'))
assert set(netmodel['roomInletsMM2'].values())=={15000}
def dp(q,area):
    return .6*q*abs(q)/(.61*area/1000)**2
def room_supply(node_p,wet):
    # Each bedroom supply q crosses the exterior inlet, then its remaining q-wet
    # crosses the room door. The monotone pressure drop also allows reversed transfer.
    lo,hi=0.,50.
    for _ in range(34):
        q=(lo+hi)/2
        if dp(q,15000)+dp(q-wet,7600)<-node_p:lo=q
        else:hi=q
    return (lo+hi)/2
def standby(mask,makeup):
    guest,utility,kitchen_fan,rear,family,principal=[13+3*((mask>>i)&1) for i in range(6)]
    exhaust=guest+utility+kitchen_fan+rear+family+principal
    lo,hi=-30.,-.001
    for _ in range(38):
        ring=(lo+hi)/2
        bedrooms=[room_supply(ring,k) for k in (0,0,rear,principal)]
        hall=ring-dp(sum(bedrooms)-rear-family-principal,90000)
        ground=room_supply(hall,0)
        residual=sum(bedrooms)+2*ground+makeup-exhaust
        if residual>0:lo=ring
        else:hi=ring
    assert abs(residual)<1.e-6
    return {'kitchenPa':hall-dp(kitchen_fan-makeup,7600),'sixRoomInletLps':bedrooms+[ground]*2}
for mask,k in [(0,'normalHoodOff'),(63,'allBoostHoodOff')]:
    assert abs(standby(mask,0)['kitchenPa']-netmodel[k]['nodePa']['kitchen'])<1.e-6
idle=[standby(mask,flow) for mask in range(64) for flow in (12.,15.)]
idle_result={'measuredTotalFreshLps':[12.,15.],'kitchenPa':span(v['kitchenPa'] for v in idle),
    'freshestAndLeastRoomInletLps':span(q for v in idle for q in v['sixRoomInletLps']),
    'plateIDmm':50,'platePressurePaAtCd061':span(.6*(f/1000/(.61*pi*.05**2/4))**2 for f in (12,15)),
    'minStandbySupplyC':12.,'maxStandbyKitchenKW':1.14+1.2*15*(20-12)/1000,
    'maxStandbyCoilKW':1.2*15*(12+10)/1000}
assert -5<idle_result['kitchenPa'][0] < idle_result['kitchenPa'][1]<0 and idle_result['maxStandbyKitchenKW']<east

# The south face of the kitchen is solid between its two raw openings.
wall=next(w for w in house['groundWalls'] if w['id']=='rear-east')
south=wall['finishedFaces'][1]
left,right=wall['holes'][0][1],wall['holes'][1][0]
fixed = house['groundFurniture']
assert [south,left,right]==[8424.5,9150,10450]
standoff=260
unit=[9400,south+standoff,972,370]
middle=unit[0]+unit[2]/2
# Housing rotated on its native mounting wall, horizontal flow east to west.
geometry={'unitPlan':unit,'unitConservativeZ':[2150,2755],'nativeControlHand':'above',
          'spigotAxis':[south+standoff+175,2400],'sleeveAxis':[12000,8600,2400],
          'axisDifferenceY':abs(south+standoff+175-8600),'minimumInletStraightMM':250,'minimumOutletStraightMM':750,
          'cleanInlet':[10372,10672], 'cleanOutlet':[8600,9400],
          'bracketEdgeToRawJambIf903Span':min(middle-903/2-left,right-(middle+903/2)),
          'ceilingClear':3170-2755,'headroomUnderCase':2150,'reachableField':[9476,9090,820,1450],
          'clearFloorForFullLift':[middle-315,8740,630,880],
          'outletFace':[8060,south+standoff+175,2400],'minMetalScreenAreaM2At1point5Mps':direct[1]/1500}
trunk=next(t for t in service['trunks'] if t['id']=='ground-rear-east')
assert [8700,8500,2500] in trunk['selected3DProfile'] and trunk['ordinaryBand']==[320,260]
axis_y=geometry['spigotAxis'][0]
geometry.update(firstDesignRiserGap=abs(8600-8500)-160-150,offsetRiserGap=axis_y-8500-160-150,
    midLevelDuctODmm=300,caseTopToHighTrunk=2945-130-2755,
    intakeOffsetRoute=[[12000,8600,2400],[11250,8600,2400],[11250-(axis_y-8600),axis_y,2400],[10372,axis_y,2400]],
    offsetNominalBendDeg=45,standoff=standoff,wetLoadedMassTrialKg=39,bracketTwoGTotalKN=2*39*9.81/1000,
    bracketTwoGTotalMomentKNm=2*39*9.81/1000*(standoff+185)/1000,
    waterTapTrial=[[10200,8500,2945],[10200,8790,2945],[10050,8790,2945]],
    highTubeODmm=50,highTubeToSoffitMM=3170-2945-25)
assert geometry['firstDesignRiserGap']<0 and geometry['offsetRiserGap']>45 and geometry['caseTopToHighTrunk']>=60
assert unit[0]>left and unit[0]+unit[2]<right and geometry['bracketEdgeToRawJambIf903Span']>100
assert geometry['cleanInlet'][1]-geometry['cleanInlet'][0]>=250 and geometry['cleanOutlet'][1]-geometry['cleanOutlet'][0]>=750
def rect_gap(a,b):
    return hypot(max(a[0]-b[0]-b[2],b[0]-a[0]-a[2],0),max(a[1]-b[1]-b[3],b[1]-a[1]-a[3],0))
furniture={k:v for k,v in fixed.items() if k in ('dining-table1200x800','dining-chair-west-south',
    'dining-chair-west-north','cold-storage','north-sink-station','north-cooking-station','low-food-larder','service-emitter-kitchen-E')}
chairs=[[7800,10340,500,500],[7800,10890,500,500]]
all_solids=list(furniture.values())+chairs
checks={}
for name in ('reachableField','clearFloorForFullLift'):
    checks[name]=min(rect_gap(geometry[name],r) for r in all_solids)
assert min(checks.values())>25
# Chair moves run square along orthogonal axes. Move away from the original table contact
# before travelling north; the east-north chair is moved first into the further west park.
def chair_sweep(points,obstacles):
    gaps=[]
    for a,b in zip(points,points[1:]):
        assert a[0]==b[0] or a[1]==b[1]
        sweep=[min(a[0],b[0])-250,min(a[1],b[1])-250,abs(a[0]-b[0])+500,abs(a[1]-b[1])+500]
        gaps.append(min(rect_gap(sweep,o) for o in obstacles))
    return min(gaps)
chair_paths=[]
for k,park_y in [('dining-chair-east-north',11140),('dining-chair-east-south',10590)]:
    f=fixed[k];x,y=f[0]+250,f[1]+250
    path=[[x,y],[9625,y],[9625,10590],[8050,10590]]
    if park_y!=10590:path.append([8050,park_y])
    obstacles=list(furniture.values())+([fixed['dining-chair-east-south']] if park_y==11140 else [chairs[1]])
    # The initial 75 mm pull deliberately opens the chair-to-table contact.
    assert chair_sweep(path[1:],obstacles)>25
    chair_paths.append(path)

# Low supported transport to the east gallery. An OBB separating-axis distance is a
# lower bound on Euclidean separation; subtract half the maximum point movement per
# sample to bound the continuous translation and turn between samples.
length,width=1020,450
def case_gap(p,o):
    x,y,a=p
    c,s=cos(radians(a)),sin(radians(a))
    dx,dy=x-o[0]-o[2]/2,y-o[1]-o[3]/2
    w,h=o[2]/2,o[3]/2
    return max(abs(dx)-w-length/2*abs(c)-width/2*abs(s),abs(dy)-h-length/2*abs(s)-width/2*abs(c),
               abs(dx*c+dy*s)-length/2-w*abs(c)-h*abs(s),abs(-dx*s+dy*c)-width/2-w*abs(s)-h*abs(c))
route=[[9886,south+standoff+185,0],[9886,9080,0],[9950,9080,0],[9950,8800,0],[8625,8725,-5],[8625,8725,-10],[8550,8575,-55],[8550,8200,-90],[8700,7725,-90]]
spine=next(w for w in house['groundWalls'] if w['id']=='service-spine')
loggia=next(w for w in house['groundWalls'] if w['id']=='loggia-east-weather')
assert spine['finishedFaces'][0]==9203 and loggia['finishedFaces'][1]==7719.5
obs=all_solids+[[wall['a'][0],wall['finishedFaces'][0],8250+27-wall['a'][0],wall['t']],
    [9150-27,wall['finishedFaces'][0],10450-9150+27,wall['t']],
    [9203,6500,300,1655.5],[7500,6500,403,1655.5],[7500,8400,219.5,3500]]
lower=[]
for a,b in zip(route,route[1:]):
    motion=dist(a[:2],b[:2])+hypot(length/2,width/2)*abs(radians(b[2]-a[2]))
    steps=max(1,ceil(motion/2))
    sample=min(case_gap([a[i]+(b[i]-a[i])*j/steps for i in range(3)],o)
               for j in range(steps+1) for o in obs)
    lower.append(sample-motion/(2*steps))
assert min(lower)>17
trial_force=geometry['bracketTwoGTotalKN']*1000
geometry['straightDownRelease']={'cradleAndWetCaseMassLimitKg':39,'factoredTrialForceN':trial_force,
    'fourHorizontalRetractingPinsODmm':8,'pinEngagedLengthTrialMM':12,'requiredRetractMM':20,
    'throughLugThicknessMM':3,'onePinDoubleShearMPa':trial_force/(2*pi*8**2/4),
    'oneLugBearingMPa':trial_force/(8*3),'geometricDropAtOriginalXY':True,
    'cradleNosePlusCasingDepthMM':410,'forkReachMM':570,'maxAcceptedLoadCentreMM':300,
    'rearToFrontCradleClearMM':standoff,'operationalInterlockQualified':False}
assert geometry['straightDownRelease']['requiredRetractMM']-12>=5
geometry.update(parkedChairs=chairs,chairPaths=chair_paths,clearances=checks,
                loadedCartMax=[length,width],lowExport=route,continuousExportClearanceMM=min(lower))
cross=next(d for d in house['protectedRoute']['doors'] if d['id']=='FD-EAST-CROSS')
front=next(d for d in house['openings']['GROUND'] if d['id']=='front-door')
assert cross['open']==[9091.75,4250,44,845] and front['width']==1800
south_walls=[]
for w in house['groundWalls']:
    a,b=w['a'],w['b']
    if a[1]==b[1]:
        y0,y1=w['finishedFaces']; left=min(a[0],b[0]);end=max(a[0],b[0])
        for begin,stop in w.get('holes',[]):
            trim=27
            south_walls.append([left,y0,begin+trim-left,y1-y0])
            left=stop-trim
        if end>left:south_walls.append([left,y0,end-left,y1-y0])
    else:
        x0,x1=w['finishedFaces']
        # No vertical door penetration is needed on this centre line.
        south_walls.append([x0,min(a[1],b[1]),x1-x0,abs(a[1]-b[1])])
# Conservative dry outer ring to garden/court and both solid sides of front entrance.
# Outward-swinging/parked front leaves must be secured clear of the stated opening.
south_walls += [cross['open'],[0,0,5150,429.5],[6850,0,5150,429.5],
                [3850,3920,4200,4050]]
south_walls += [v for v in fixed.values() if v[0]<9300 and v[0]+v[2]>4800 and v[1]<8500]
front_route=[route[-1],[8700,3750,-90],[8600,3420,-90],[8600,3420,0],
             [6000,3200,0],[6000,3200,-90],[6000,-600,-90]]
def certify(path,obstacles):
    results=[]
    for a,b in zip(path,path[1:]):
        motion=dist(a[:2],b[:2])+hypot(length/2,width/2)*abs(radians(b[2]-a[2]))
        steps=max(1,ceil(motion/2))
        gs=[case_gap([a[i]+(b[i]-a[i])*j/steps for i in range(3)],o) for j in range(steps+1) for o in obstacles]
        results.append(min(gs)-motion/(2*steps))
    return min(results)
front_bound=certify(front_route,south_walls)
assert front_bound>10,front_bound
geometry.update(frontExitRoute=front_route,frontExitLowerBoundMM=front_bound)

# Independent ordinary gross phase allocations. Room circuit and coil share the 14 kW thermal source.
phase={'twoElectricMakeupHeatersDeletedA':2*3000/230,'nativeSupplyUnitA':1.05,
       'proposedCookingA':[19+32,19+1.05,19+3],'with9kWBackupA':[19+32+13.1,19+1.05+13.1,19+3+13.1]}
result={'thermal':hyd,'standby':idle_result,'nativeCommands':modes,'pressure':pressure,'roomAndRelease':geometry,'supply':phase}
render=json.dumps(result,indent=2)+'\n'
dest=HERE/'tempered-kitchen-air.json'
parser=argparse.ArgumentParser()
parser.add_argument('--check',action='store_true')
check=parser.parse_args().check
from tempered_kitchen_figure import figure
svg=figure(result,furniture)
if check:
    assert dest.read_text()==render and dest.with_suffix('.svg').read_text()==svg, 'Regenerate tempered kitchen study'
else:
    dest.write_text(render)
    dest.with_suffix('.svg').write_text(svg)
