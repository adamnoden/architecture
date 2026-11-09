"""Joint cold-day design screen, not an installed heat-pump selection. mm, kW, kWh, minutes."""
import argparse
import hashlib
import json
from math import dist, exp, hypot, log, pi
from pathlib import Path
import runpy
import sys
from contextlib import redirect_stdout
from io import StringIO

HERE = Path(__file__).resolve().parent
def read(name):
    return json.loads((HERE / name).read_text())

service = read('whole-house-service-baseline.json')
air = read('balanced-service-architecture.json')['nativeW9HeatContract']
dock = read('plant-threshold.json')['dock']
plant, heat = service['plant']['cylinder'], service['heat']
water = service['hotWater']
cp = 4.186 / 3600                    # kWh/(litre K), source comparison
flow = heat['fluidFlowBoundary']
winter = {r['totalLps']: r for r in air['sensitivities']
          if (r['insideC'],r['outsideC'],r['effectiveRecovery']) == (20,-10,.7)}
normal, cooking = [winter[f]['roomHeatIf16SupplyAnd220WK_W']/1000 for f in (96,128)]
assert (round(normal,4),round(cooking,4))==(7.0608,7.2144)
room_day = 22*normal+2*cooking
draw_day = max(water['deliveredDailyRangeLitres40C'])*cp*(40-10)
emitters = heat['roomOutputCompatibilityBudgetsKW']
summed = {k:sum(e['screenOutputW']/1000 for e in heat['emitterSchedule'] if e['room']==k) for k in emitters}
assert abs(sum(emitters.values())-8)<1e-6
min_emitter_scale = min(summed[k]/v for k,v in emitters.items())

# Manufacturer data book PUZ-WZ Vol.1.0 pp A-37/38, maximum-output block at A-10.
# Each tuple is heat kW, COP. Rows are not seasonal ratings, nor a guarantee on glycol.
machines = {
    'PUZ-WZ85VAA': {'W45':[8.7,2.22], 'W50':[8.5,2.08], 'W65':[7.6,1.75], 'W70':[6.8,1.64], 'maxA':23,'maxLmin':27.2},
    'PUZ-WZ100VAA': {'W45':[10.5,2.34], 'W50':[10.4,2.22], 'W65':[9.6,1.80], 'W70':[9.1,1.64], 'maxA':30,'maxLmin':34.4},
    'PUZ-WZ120VAA': {'W45':[12.1,2.11], 'W50':[11.7,1.94], 'W65':[10.7,1.75], 'W70':[10.6,1.66], 'maxA':37,'maxLmin':34.4}}
cv = flow['primaryRequiredHeatCapacityKJkgKAtWorkingTemperature']*flow['primaryRequiredDensityKgLMinimum']
volume_lps = flow['primaryGlycolTargetLps']
primary_kw = cv*volume_lps*5
assert primary_kw==8
for m in machines.values():
    max_flow = min(volume_lps,m['maxLmin']/60)
    m['roomKW_at15pctAllowance'] = min(8.,m['W50'][0]*.85,cv*max_flow*5)
    m['dhwKW_at15pctAllowance'] = min(6.,m['W70'][0]*.85,cv*max_flow*5)
    m['W50TableElectricKW'] = m['W50'][0]/m['W50'][1]
    m['W70TableElectricKW'] = m['W70'][0]/m['W70'][1]

# Proposed manufacturer's dimensions, not approval of a pressure vessel or field modification.
bore, barrel, shell, insulation, jacket = 484,1800,490,50,2
coil_area, coil_od, coil_axis_diameter, pitch = 3.,.028,.420,.036
gross_l = pi*(bore/2000)**2*barrel                     # m² x mm = litres
displaced_l = coil_area*coil_od/4*1000
net_l = gross_l-displaced_l-8                           # uncredited internal fittings/dead space
length = coil_area/(pi*coil_od)
turns = length/hypot(pi*coil_axis_diameter,pitch)
outside = shell+2*(insulation+jacket)
height = barrel+2*85+2*(insulation+jacket)+80            # external dished ends, envelope and feet
station = plant['station']
assert net_l>=300 and outside<600.69 and height+100<plant['requiredFinishedClearHeight']
ua_room = 8/5                                            # primary 50/45 vs secondary 45/40
ua_dhw_plate = 6/((5-3)/log(5/3))                      # primary 70/65 vs secondary 65/62
caprate = 2.                                             # kW/K, 6 kW through 3 K at the coil
ua_coil = -caprate*log(1-6/(caprate*(65-60)))
# Side conduction and area of TWO flat bounding ends. Reference outer surface at room temperature.
# The separate bridge allowance is an adverse input for feet, connections, jacket seams and edges.
radius=shell/2000
def jacket_loss(conductivity,thermal_bridges=0.5):
    side=2*pi*conductivity*(barrel+2*85)/1000/log((radius+insulation/1000)/radius)
    ends=2*pi*radius**2*conductivity/(insulation/1000)
    return 24*40*(side+ends+thermal_bridges)/1000

# A causal, mixed 300 L energy store. Conservation tracks water actually delivered at 40°C.
# Lower room debt is recovered at most at the installed family budget: no credit for primary buffer.
draws = {7*60:80,7*60+45:80,8*60+30:70,19*60:70}
assert sum(draws.values())==max(water['deliveredDailyRangeLitres40C'])
# This is an authored supervisory request, not a claimed menu on the factory FTC.
morning_windows=[(30,15),(180,15),(380,15),(425,20),(495,10),(645,15),(795,15),(945,15),(1095,15),(1245,15)]
def simulate(room_kw,charge_kw,loss,distribution=0.,coil_ua=ua_coil,starts=morning_windows,
             restart_drop=None,changeover_minutes=0,days=8,initial_c=60):
    full=300*cp*(60-10); energy=300*cp*(initial_c-10); debt=0.; dt=1/60
    calling=False; active_minutes=0
    history=[]; daytotals=[]
    # Eight full days distinguish a repeating operating pattern from using up a precharged tank or room.
    for day in range(days):
        totals={'roomStartDebt':debt,'storeStartKWh':energy,'roomMaxDebtKWh':debt,'minimumTankC':60.,
                'drawnKWh':0.,'missed40C_KWh':0.,'chargedKWh':0.,'roomDeliveredKWh':0.,'lossKWh':0.,'dhwMinutes':0}
        profile=[]
        for t in range(1440):
            tank=10+energy/(300*cp)
            litres=draws.get(t,0)
            if litres:
                # Continuous draw from a well-mixed store plus blending with 10°C water.
                # Max volume delivered at 40 before the store reaches that temperature.
                usable=max(0,energy-300*cp*30)
                demand=litres*cp*30; available=min(demand,usable)
                energy-=available; totals['drawnKWh']+=available; totals['missed40C_KWh']+=demand-available
                tank=10+energy/(300*cp)
            totals['minimumTankC']=min(totals['minimumTankC'],tank)
            removed=(loss*max(tank-20,0)/40+distribution)/1440
            energy-=removed;totals['lossKWh']+=removed
            slot=any(start<=t<start+duration for start,duration in starts)
            transfer=min(charge_kw,caprate*(65-tank)*(1-exp(-coil_ua/caprate)))
            if not slot:
                calling=False; active_minutes=0
            elif restart_drop is None or (not calling and tank<60-restart_drop):
                calling=True
            delivering=slot and calling and active_minutes>=changeover_minutes
            added=min(max(0,full-energy),max(0,transfer)*dt) if delivering else 0.
            if slot and calling:active_minutes+=1
            if slot:
                energy+=added;totals['chargedKWh']+=added;totals['dhwMinutes']+=1
                if energy>=full-1.e-10:
                    calling=False; active_minutes=0
            load=cooking if 17*60<=t<19*60 else normal
            wanted=load*dt+debt
            delivered=0. if slot else min(room_kw*dt,wanted)
            debt=wanted-delivered;totals['roomDeliveredKWh']+=delivered
            totals['roomMaxDebtKWh']=max(totals['roomMaxDebtKWh'],debt)
            if t%10==0:profile.append([t,10+energy/(300*cp),debt])
        totals.update(roomEndDebt=debt,storeEndKWh=energy)
        assert abs(energy-totals['storeStartKWh']+totals['drawnKWh']+totals['lossKWh']-totals['chargedKWh'])<1e-8
        assert abs(debt-totals['roomStartDebt']-room_day+totals['roomDeliveredKWh'])<1e-8
        daytotals.append(totals);history=profile
    end=daytotals[-1]
    end['maxSampleTankC']=max(row[1] for row in history)
    end['lastDayChangeKWh'] = energy-end['storeStartKWh']
    end['roomDriftKWh'] = debt-end['roomStartDebt']
    end['previousDayStoreChangeKWh'] = daytotals[-2]['storeEndKWh']-daytotals[-2]['storeStartKWh']
    if restart_drop is not None:
        end['maxMissLastWeekKWh']=max(d['missed40C_KWh'] for d in daytotals[-7:])
        end['maxStoreDriftLastWeekKWh']=max(abs(d['storeEndKWh']-d['storeStartKWh']) for d in daytotals[-7:])
    return end,history

bounded_loss=jacket_loss(.040)
cases={}
for name,m in machines.items():
    cases[name],_=simulate(m['roomKW_at15pctAllowance'],m['dhwKW_at15pctAllowance'],bounded_loss,1.)
reference,profile=simulate(8,6,bounded_loss,1.)
even,_=simulate(8,6,bounded_loss,1.,starts=[((420+144*i)%1440,15) for i in range(10)])
weak,_=simulate(8,6,bounded_loss,1.,coil_ua=ua_coil/2)
high,_=simulate(8,6,jacket_loss(.045,1),2.)
old,_=simulate(8,4,bounded_loss,1.)
# FTC7 menu allows four prohibited intervals. At a 60 C setpoint the restart must be below 50 C.
# A prohibition drops the request. A new period therefore waits for sensed temperature below 49 C.
# Reserve the entire permitted period from space heating, including start-up and idle time.
controller_windows=[(0,50),(440,50),(970,30),(1160,20)]
controller_cases={}
for label,drop,delay,initial in [('permittedFour',11,2,60),('coolStart',11,2,45),
                                 ('instantSwitch',11,0,60),('largerDeadband',15,2,60),
                                 ('slowerSwitch',11,5,60)]:
    case,trace=simulate(8,6,bounded_loss,1.,starts=controller_windows,restart_drop=drop,
                        changeover_minutes=delay,days=28,initial_c=initial)
    controller_cases[label]=case
    if label=='permittedFour':controller_profile=trace
local_non_recovery_load=.220*30+1.2*.078*30
# Annual energy, mixed-store outlet quality and factory FTC control availability are outside this model.
budget={amp:amp-30-13-16-3 for amp in [60,80,100]}    # 3A auxiliaries, 16A design allowance for W9
physical={'houseStation':station,'sourceDoorHead':plant['requiredFinishedClearHeight'],'proposedDiameter':outside,
    'proposedHeight':height,'roomStationRadialGap':(station[2]-outside)/2,'clearOn100Trolley':2300-height-100,
    'bridgeDiameterGap':600.69-outside,'grossBarrelLitres':gross_l,'coilDisplacedLitres':displaced_l,
    'allowanceNetLitres':net_l,'coilLengthM':length,'coilTurns':turns,'coilOverallHm':turns*pitch+coil_od,
    'radialCoilToInnerWallMm':(bore-1000*(coil_axis_diameter+coil_od))/2,
    'stockPackageXYZ':[748,755,2075],'stockTestHotL':301,'stockReheatMinutes':172,'stockLossKWhDay':2.09,
    'radialCartNeededWithExistingTail':outside/2+2*37+2*25}
site={'old':heat['outdoorStation'],'existingDock':dock['plan'],'lift':[14230,3450,1600,1800],
    'machineFacingEast':[16950,3675,480,1050],'equipmentPad':[16650,3375,1100,1650],
    'openGroundZone':[15950,2675,2480,3050],'reservedToZoneEast':18500-18430,
    'liftToZone':15950-15830,'sourceRiserAtDock':heat['outdoorStation']['hydraulicPath'][2]}
assert site['sourceRiserAtDock']==[12500,4300,300] and dock['plan']==[12130,14230,3400,5350]
assert site['machineFacingEast'][0]-1000==site['openGroundZone'][0]
assert sum(summed.values())>8 and min_emitter_scale>1
result={'basis':{'ordinaryRoomKW':normal,'cookingRoomKW':cooking,'dailyRoomKWh':room_day,'dailyDrawKWh':draw_day,
        'roomKWCeiling':8,'primaryMinimumCV':cv,'designPrimaryKW':primary_kw,'screenHeatEmitterKW':sum(summed.values()),
        'leastRoomRatio':min_emitter_scale,'localExtractNoRecoveryKW':local_non_recovery_load,'testLossKWh24At60':bounded_loss},
    'machines':machines,'vessel':physical,'site':site,'supplyResidualA':budget,
    'exchangers':{'roomPlateUAKWperK':ua_room,'waterPlateUAKWperK':ua_dhw_plate,'coilUAKWperK':ua_coil,
       'coilRequiredWm2K':1000*ua_coil/coil_area,'coilLmin':60*caprate/4.186,'glycolRoomLmin':60*8/(cv*5),
       'glycolWaterLmin':60*6/(cv*5),'losses':{str(k):jacket_loss(k) for k in [.035,.040,.045]}},
    'lastDay':cases,'comparison':{'evenlyTimed':even,'oldFourKW':old,'halfCoilUA':weak,'lossPlusCirculation':high},'windows':morning_windows,'profile10min':profile,
    'fourPeriodControl':{'windows':controller_windows,'lastDay':controller_cases,'profile10min':controller_profile,
                        'stopInhibitionAtMidnight':1440,'restartBelowC':49,'changeoverMinutesPerStart':2,
                        'installedControlProved':False}}
# Rebind the first movable bridge and cabinet to their actual house coordinates.
saved_argv=sys.argv
try:
    script=HERE/'plant-inlet-route.py';sys.argv=[str(script),'--check']
    with redirect_stdout(StringIO()): inlet=runpy.run_path(str(script))
finally:sys.argv=saved_argv
centre=[inlet['centre'][0]-15,inlet['centre'][1]]
seat_gap=lambda point:inlet['point_segment'](point,inlet['apparatus'],inlet['west_clear'])-inlet['R']-outside/2
physical.update(centre=centre,originalBridgeFreeMm=seat_gap(inlet['centre']),shiftedBridgeFreeMm=seat_gap(centre),
    shiftedLeftStationClear=centre[0]-outside/2-station[0],cartRiserAtStart=4700-centre[1]-425,
    coilPressureDropKPa=None,pressureVesselAndFactoryRating=None)
assert physical['originalBridgeFreeMm']<35<physical['shiftedBridgeFreeMm']
# Local open-zone proposal. The projected old riser passes through the dock at FFL.
# Stack the pair horizontally in plan but at DIFFERENT levels across the lift/soil throat.
room=read('../../had/studies/water-replan.json')['model']
rewind=read('plant-room-rewind.json'); grid=read('../../str/studies/current-house-grid.json')
point_segment=inlet['point_segment']
def point_rect(point,rect):
    x,y,w,h=rect
    return hypot(max(x-point[0],0,point[0]-x-w),max(y-point[1],0,point[1]-y-h))
room_plant=room['servicesInterface']['plant']
boxes=[room_plant['riser'],room_plant['controls'],plant['station'],room_plant['buffer']['station'],
       plant['workingEast'],rewind['proposal']['W9FrontSouth600'],rewind['wallNorth60Control']['controlsRect_mm']]
boxes += [v['rect'] for v in rewind['proposal']['permanentBodies'].values() if 'rect' in v]
w9=rewind['W9CarrierBodyOnly']['polyline_mm']
for a,b in zip(w9,w9[1:]):boxes.append([min(a[0],b[0])-625,min(a[1],b[1])-304.5,abs(b[0]-a[0])+1250,abs(b[1]-a[1])+609])
paths=[(plant['replacementCentrePath'],425),(room_plant['buffer']['replacementCentrePath'],425),
       (rewind['wallNorth60Control']['cylinder425Revised4600Line']['polyline_mm'],425),
       (rewind['buffer425RenewalClosedDoor']['polyline_mm'],425),
       (room['plantReferenceDoor']['operatorCentrePath'],room['plantReferenceDoor']['retainedBodyRadius'])]
spans=[]
for girder in grid['girders'].values():
    v=girder['datum'];a,b=girder['extent']
    ends=((v,a),(v,b)) if girder['axis']=='y' else ((a,v),(b,v))
    spans.append((*ends,girder['width']/2))
spans += [(b['a'],b['b'],b['width']/2) for b in grid['crossBeams'].values()]
for h in grid['heads']:
    x,y=h['xy'];w,d=h['capXY'];boxes.append([x-w/2,y-d/2,w,d])
pipe_routes=[]
for y,z,port_y in [(5500,-940,4190),(5650,-1090,4210)]:
    sleeve=(9950,y)
    raw=min([point_rect(sleeve,b) for b in boxes]+[point_segment(sleeve,a,b)-w for a,b,w in spans]+
            [point_segment(sleeve,a,b)-radius_ for path,radius_ in paths for a,b in zip(path,path[1:])]+
            [dist(sleeve,(10035,4800))-60,5780.5-y])
    path=[(16950,port_y,z),(16300,port_y,z),(16300,5370,z),(11000,5370,z),(11000,y,z),(9950,y,z),(9950,y,300)]
    shaft_gap=min(point_segment(h['xy'],a[:2],b[:2])-h['shaftDiameter']/2-45 for h in grid['heads'] for a,b in zip(path,path[1:]))
    assert raw-60>=40 and shaft_gap>=380
    pipe_routes.append({'centreline':path,'lengthM':sum(dist(a,b) for a,b in zip(path,path[1:]))/1000,
                        'sleevePerimeterClear':raw-60,'shaftClear':shaft_gap})
site.update(routes=pipe_routes,pipeEnvelopeOD=90,formedSleeveOD=120,adjacentSleevesEdgeGap=30,
    liftToPipeY=5370-45-5250,foulStackToPipeY=5475-5370-45,
    pairVerticalClear=150-90,pipeCrownBelowCap=-750-(-940+45))
# The port positions are terminal allowances. Charge two additional metre-long tails, the heat
# exchanger and a named pressure budget; no flange, closed isolation or pump curve is inferred.
velocity=.0005/(pi*.026**2/4)
length_m=sum(r['lengthM'] for r in pipe_routes)+2
site['hydraulicScreen']={'IDmm':26,'designLps':.5,'density':1035,'darcyF':.04,'sumK':12,'lengthM':length_m,
    'velocityMps':velocity,'tubeAndFittingsKPa':(.04*length_m/.026+12)*1035*velocity**2/2000,
    'additionalHXFilterValveKPa':35}
assert site['liftToPipeY']>=75 and site['foulStackToPipeY']>=60 and site['pipeCrownBelowCap']>=145
result['sourceHouseBlobs']={}
for f in ['whole-house-service-baseline.json','balanced-service-architecture.json','plant-room-rewind.json','plant-inlet-route.py',
          'plant-threshold.json','../../had/studies/water-replan.json','../../str/studies/current-house-grid.json']:
    raw=(HERE/f).read_bytes();result['sourceHouseBlobs'][f]=hashlib.sha1(b'blob '+str(len(raw)).encode()+b'\0'+raw).hexdigest()
selected_control=controller_cases['permittedFour']
assert len(controller_windows)==4 and sum(length for _,length in controller_windows)==150
assert selected_control['maxMissLastWeekKWh']==0 and selected_control['maxStoreDriftLastWeekKWh']<1.e-7
assert 5.88<selected_control['roomMaxDebtKWh']<5.89 and selected_control['roomDriftKWh']==0
assert abs(selected_control['storeEndKWh']-controller_cases['coolStart']['storeEndKWh'])<1.e-7
assert controller_cases['largerDeadband']['missed40C_KWh']>1.8 and controller_cases['slowerSwitch']['missed40C_KWh']>.58
assert cases['PUZ-WZ85VAA']['roomDriftKWh']>14 and cases['PUZ-WZ85VAA']['roomEndDebt']>110
assert cases['PUZ-WZ100VAA']==cases['PUZ-WZ120VAA']==reference
assert reference['dhwMinutes']==150 and abs(reference['drawnKWh']-draw_day)<1e-8
assert abs(reference['roomDeliveredKWh']-room_day)<1e-8
assert abs(reference['previousDayStoreChangeKWh'])<1e-6
assert 55<site['hydraulicScreen']['tubeAndFittingsKPa']+site['hydraulicScreen']['additionalHXFilterValveKPa']<56
assert reference['missed40C_KWh']==0 and reference['minimumTankC']>43
assert reference['maxSampleTankC']>59.9 and abs(reference['lastDayChangeKWh'])<1e-6
assert abs(reference['roomDriftKWh'])<1e-6 and 4<reference['roomMaxDebtKWh']<4.1
assert even['missed40C_KWh']>0 and old['missed40C_KWh']>3 and high['missed40C_KWh']>0
def export(path,content,check):
    if check:
        assert path.read_text()==content, f'Generated result differs: {path}'
    else:path.write_text(content)
if __name__=='__main__':
    ap=argparse.ArgumentParser();ap.add_argument('--check',action='store_true');check=ap.parse_args().check
    export(HERE/'winter-heat-and-water.json',json.dumps(result,indent=2)+'\n',check)
    from winter_heat_figure import render
    export(HERE/'winter-heat-and-water.svg',render(result),check)
    print('A-10 room and DHW comparison reproduced; heat-pump rating, mixed-water delivery and house authority are separate.')
