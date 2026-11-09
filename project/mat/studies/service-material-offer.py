"""Source-bound service quantities, local heat budgets and pipe/finish interface."""
import argparse
import json
from math import acos, hypot, log
from pathlib import Path
from kitchen_transfer_pressure import standby

HERE = Path(__file__).resolve().parent
PROJECT = HERE.parents[1]

def read(path):
    return json.loads((PROJECT / path).read_text())

def opening_area(window):
    width = window['width'] / 1000
    rise = (window['head'] - window['spring']) / 1000
    radius = width**2 / (8 * rise) + rise / 2
    cap = radius**2 * acos((radius-rise)/radius) - (radius-rise)*width/2
    return width*(window['spring']-window['sill'])/1000 + cap

def comparison():
    service = read('mat/studies/whole-house-service-baseline.json')
    house = read('had/studies/water-replan.json')['model']
    structure = read('str/studies/reconciled-house-interface.json')
    local = read('mat/studies/tempered-kitchen-air.json')
    store = read('mat/studies/local-extract-heat-and-store.json')['mineralReplan']
    joined = read('mat/studies/joined-cooker-system.json')
    schedule = service['heat']['emitterSchedule']
    rooms = ['bed2','bed3','bed4','principal','study','living']
    # The independent kitchen command replaces bit 2. Use each state of the OTHER
    # five fans exactly once. No additional kitchen makeup or cooker exhaust here.
    masks = [mask for mask in range(64) if not mask & 4]
    cases = [standby(mask, 0, kitchen_duty=5.) for mask in masks]
    limits = {}
    for index, room in enumerate(rooms):
        inlet = max(row['sixRoomInletLps'][index] for row in cases)
        emitters = [e for e in schedule if e['room']==room]
        t = emitters[0]['roomTargetC']
        lmtd = 10/log((55-t)/(45-t))
        watts = sum(e['nominalDelta50W']*(lmtd/50)**e['nCoefficient'] for e in emitters)
        limits[room] = dict(inletLps=inlet,outputW=watts,maxFabricInfiltrationWK=watts/(t+10)-1.2*inlet)
    inactive_q = [sum(row['sixRoomInletLps']) for row in cases]
    assert abs(min(inactive_q)-70)<1e-4 and abs(max(inactive_q)-85)<1e-4
    bounds = [min(c['kitchenPa'] for c in cases),max(c['kitchenPa'] for c in cases)]
    assert -5 < bounds[0] < bounds[1] < 0
    # At fixed room pressure, changing ONLY the local kitchen fan changes the
    # required direct kitchen supply one-for-one. Reduce to zero direct supply.
    residual = {}
    for mode,old in [('normal',13),('allBoost',16)]:
        reference = joined['pressureTargetSensitivity']['-5'][mode]['directMakeupLps']
        residual[mode] = 70 - reference + old - 5
    assert 0 < residual['allBoost'] < .7 < residual['normal']
    # Hold each source hood pressure/weather case. At fixed kitchen pressure
    # its independent local extract change is met by the same added supply.
    hot = []
    for row in joined['SwegonExternalMotorCandidate']['all256Modes']:
        if row['manualCommandV'] != 10 or row['fanMask'] not in masks:
            continue
        added = 20-13  # these 32 masks carry the original low kitchen bit
        hot.extend((v['directMakeupLps']+added, (v['physicalWholeHouseW']+1.2*30*added)/1000)
                   for v in row['variants'])
    assert len(hot)==96
    hot_q=max(q for q,_ in hot)
    hot_kw=max(kw for _,kw in hot)
    assert 13 < hot_kw < 14
    duty = dict(otherFanMasks=len(masks), hotPressureCases=len(hot), kitchenSetpointsLps=[5,16,20],
                kitchenPa=bounds, aggregateHealthyIdleLps=[70,85], roomCaps=limits,
                minimumWholeDwellingLps=service['air']['floorCriterionLps'],
                residualHoodLpsAtMinus5=residual, hotDirectLps=hot_q, hotWholeKW=hot_kw,
                hotCoilKW=1.2*hot_q*28/1000, hotEastEmitterDutyKW=1.14+1.2*hot_q*2/1000)
    # Only the three upper NE openings are charged to the Principal. The two
    # moved corner centres change their location; their size and area are retained.
    windows=[o for o in house['openings']['FIRST'] if
             (o['wall']=='outer-east' and o['centre']>9000) or
             (o['wall']=='outer-north' and o['centre']>8000)]
    assert len(windows)==3 and all(o['kind']=='window' for o in windows)
    walls={w['id']:w for w in house['upperWalls']}
    edge=house['shell']-house['envelope']
    x=(edge-walls['rear-divider']['finishedFaces'][1])/1000
    y=(edge-walls['rear-east-principal']['finishedFaces'][1])/1000
    glazing=sum(opening_area(w) for w in windows)
    height=max(w['head'] for w in windows)/1000
    u_wall=read('mat/studies/loggia-soffit.json')['thermal']['wallU110']
    u_window=1.6  # whole-frame requirement of the MAT glass comparison
    walls_and_windows=u_wall*((x+y)*height-glazing)+u_window*glazing
    budget=limits['principal']['maxFabricInfiltrationWK']
    ordinary=structure['principalBed']['ordinaryBed']
    parked=structure['principalBed']['servicePark']
    min_x=parked[0]+parked[2]+25
    existing=next(e for e in schedule if e['id']=='principal-N')
    longer=next(e for e in schedule if e['id']=='kitchen-E')
    assert existing['length']==1000 and longer['length']==1200 and existing['family']==longer['family']
    box=[min_x,existing['completePlanWithValvesAndBrackets'][1],max(longer['completePlanWithValvesAndBrackets'][2:]),200]
    watts=local['thermal']['existingKitchenRadiatorKW']*1000
    principal=dict(roomM=[x,y],openingAreaM2=glazing, heightPricedM=height, wholeWindowTarget=u_window,
        wallU=u_wall, wallWindowWK=walls_and_windows, allRemainingWK=budget-walls_and_windows,
        maxEquivalentRoofUWithZeroOtherLosses=(budget-walls_and_windows)/(x*y),
        originalH600L1000=existing['completePlanWithValvesAndBrackets'], trialH600L1200=box, newOutputW=watts,
        newLocalWK=watts/30-1.2*limits['principal']['inletLps'], toParkedBed=box[0]-parked[0]-parked[2],
        toEastWall=edge-box[0]-box[2], toOrdinaryBed=box[1]-ordinary[1]-ordinary[3],
        dryRadiatorKg=longer['dryMassKg'], servicePark=parked)
    assert 0 < principal['maxEquivalentRoofUWithZeroOtherLosses'] < .12
    assert principal['toParkedBed']==25 and principal['toEastWall']>50
    internal={w['id']:w for w in house['groundWalls']}
    cores=[internal[k]['structuralCore'][1]-internal[k]['structuralCore'][0] for k in ['utility-north','plant-intermediate-arch']]
    pipe_d=22; min_wool=30; aperture=100; insulated=pipe_d+2*min_wool
    sleeve=dict(assumedBore=aperture, copperOD=pipe_d, houseCore=cores, studiedTubeCompleteOD=74,
                assessedMortarDepth=150, throughWoolOD=insulated, remainingRadial=(aperture-insulated)/2,
                shortCoreMM=150-min(cores), localInsulationLengthMinMM=1000, straightUtilityTipToPierAxis=2550-2380)
    assert cores==[140,140] and sleeve['shortCoreMM']==10 and sleeve['remainingRadial']==9
    # The ground straight at R-01 has no other branch in this height interval.
    stack=next(d['path'] for d in service['otherDuties'] if d['id']=='rear-soil')
    assert stack[0][:2]==stack[1][:2]==[567.5,11177.5] and stack[0][2]>1700 and stack[1][2]<800
    furn=house['groundFurniture']
    cabinet=furn['rear-stack']; table=furn['reading-side-table300']; sofa=furn['reading-sofa1900x850']
    table_park=[1800,table[1],*table[2:]]
    assert table[1]-sofa[1]-sofa[3]==25 and table_park[0]>table[0]+table[2]
    task=[1075,11225]; radius=300
    cabinet_front=cabinet[0]+cabinet[2]
    # The worker stays 325 east of the moving table's east edge at Y11250.
    # The observed sofa/table clearances and north wall bound every intermediate X.
    assert all(rect[1]+rect[3]<=10900 or rect[0]>=2625 or rect==table or rect==cabinet
               for rect in furn.values() if isinstance(rect,list) and len(rect)==4 and all(isinstance(n,(int,float)) for n in rect))
    rack=[1035,11177.5]; head=[1450,11250]
    def circle_box(point, rect):
        x,y=point; left,bottom,w,h=rect
        return hypot(max(left-x,0,x-left-w),max(bottom-y,0,y-bottom-h))-radius
    fixed=[r for r in furn.values() if isinstance(r,list) and len(r)==4 and r!=table and all(isinstance(n,(int,float)) for n in r)]
    remote_furniture=min(circle_box(head,r) for r in fixed+[table_park])
    remote_table=circle_box(head,table_park)
    assert remote_furniture>=25 and remote_table>50
    assert min(circle_box(task,r) for r in fixed+[table_park])>=25
    foul=dict(axis=stack[0][:2],cabinet=cabinet,proposedStraightZ=[950,1550],clearTailZones=[[800,950],[1550,1700]],
              couplingOverall=130,reservedParkingEach=150, measuredSpigotToleranceAndGap=None,
              table=table,tablePark=table_park,tableToSofa=table[1]-sofa[1]-sofa[3],
              tablePullCentres=[[table[0]+table[2]+325,11250],[table_park[0]+table_park[2]+325,11250]],
              tablePullNorthReserve=edge-11250-radius, remoteToParkedTable=remote_table,
              remoteToFixedFurniture=remote_furniture,task=task,
              taskToCupboard=task[0]-radius-cabinet_front,taskToNorthWall=edge-task[1]-radius,
              taskToSofa=task[1]-radius-sofa[1]-sofa[3],rackCentre=rack,rackHalfWidth=90,
              remoteOperator=head,operatorClearOfRack=head[0]-radius-(rack[0]+90),
              minProposedClearOpening=[200,900],proposedOpeningY=[11077.5,11277.5],
              proposedOpeningZ=[800,1700],comparisonRingCountForTwoDoubleSockets=4)
    assert min(foul['taskToCupboard'],foul['taskToNorthWall'],foul['taskToSofa'],foul['operatorClearOfRack'])>=25
    return dict(scope='Materials comparison on six-extract source, no installation approval',
        counts=dict(cold=sum(f['count'] for f in service['fixtures'] if 'cold' in f['duties']),
          hot=sum(f['count'] for f in service['fixtures'] if 'hot' in f['duties']), radiators=len(schedule),
          localFans=len(service['extract']), backgroundInlets=len(service['supply'])),
        comparedStore=store, localAirAndHeat=duty, principal=principal, copperFireInterface=sleeve,
        rearFoulService=foul, followOn='HAD-SERVICES-ADOPTION', approvedExceptions=[])

if __name__=='__main__':
    options=argparse.ArgumentParser()
    options.add_argument('--check',action='store_true')
    check=options.parse_args().check
    result=comparison()
    from service_material_figure import figure
    for name,data in [('service-material-offer.json', json.dumps(result,indent=2)+'\n'),
                      ('service-material-offer.svg', figure(result))]:
        destination=HERE/name
        if check:
            if destination.read_text()!=data:raise SystemExit('Stale '+name)
        else:destination.write_text(data)
    print('Ten-family material offer: fixture counts, protected stops, principal room and copper penetration reproduced.')
