"""Six local extracts, independent electric storage and the actual east plant. Units mm, kW, kWh."""
import argparse
import json
from math import dist, hypot, isclose, log, pi
from pathlib import Path

HERE = Path(__file__).resolve().parent

def read(name):
    return json.loads((HERE / (name + '.json')).read_text())

services = read('whole-house-service-baseline')
prior = read('winter-heat-and-water')
cooker = read('joined-cooker-system')['compactTemperedCandidate']
kitchen = read('kitchen-replan-heat')['recommendedDevelopment']
plant = read('east-water-plant')['plant']
w9 = read('plant-room-rewind')['proposal']
normal = prior['basis']['localExtractNoRecoveryKW']
modes = [row for speed in cooker['all256Modes'] for row in speed['rows']]
peak = max(row['netHydronicW'] for row in modes) / 1000
daily = 22 * normal + 2 * peak
machine = prior['machines']['PUZ-WZ120VAA']
nameplate, cop, allowance = 11.2, 1.89, .15  # Mitsubishi PUZ-WZ Vol 1.0, A-38, A-10/W55 maximum
net = nameplate * (1 - allowance)
cv = prior['basis']['primaryMinimumCV']
max_flow = machine['maxLmin']
assert len(modes) == 256 and isclose(peak, 10.536)
assert machine['maxA'] == 37 and max_flow == 34.4
assert isclose(normal, 9.408) and net * 24 > daily
debt = 2 * (peak - net)
pipe = prior['site']['hydraulicScreen']
flow = net / (cv * 8)
line_kpa = pipe['tubeAndFittingsKPa'] * (flow / pipe['designLps']) ** 2
rated_flow = nameplate / (8 * cv)
hx = {'primaryC': [55,47], 'secondaryC': [50,42], 'netKW': net,
      'primaryLminAtNet': 60*flow, 'primaryLminAtNativeMaximum': 60*rated_flow,
      'maxLmin': max_flow, 'maxKWAt5K': max_flow*cv*5/60,
      'secondaryLmin': 60*net/(4.186*8), 'minimumUAKWperK': net/5,
      'netPipeLossKPa': line_kpa, 'netTotalKPaWithExistingAllowance': line_kpa+pipe['additionalHXFilterValveKPa'],
      'nativeTotalKPaWithExistingAllowance': pipe['tubeAndFittingsKPa']*(rated_flow/pipe['designLps'])**2+pipe['additionalHXFilterValveKPa']}
assert hx['maxKWAt5K'] < normal and hx['primaryLminAtNativeMaximum'] < max_flow
room = {'normalKW': normal, 'cookingKW': peak, 'dailyKWh': daily, 'dailySpareKWh': 24*net-daily,
        'requiredMeanKW': daily/24, 'deferredKWh': debt, 'recoveryHours': debt/(net-normal),
        'averageCapacityForHalfKDropKWhPerK': debt/.5, 'extraFullOutageMinutesPerDay': (24*net-daily)/net*60,
        'maxFabricWKAt2point5hHeatPumpWaterPriority': 220+(21.5*net-daily)/(.03*24),
        'nativeMaxPointInputKW': nameplate/cop}
outputs = dict.fromkeys(services['heat']['roomOutputCompatibilityBudgetsKW'], 0.)
def emitter(nominal, exponent, target):
    lm = 8/log((50-target)/(42-target))
    return nominal * (lm/50)**exponent / 1000
for e in services['heat']['emitterSchedule']:
    outputs[e['room']] += emitter(e['nominalDelta50W'], e['nCoefficient'], e['roomTargetC'])
outputs['kitchenDining'] += emitter(2983, 1.34, 20)
old = services['heat']['roomOutputCompatibilityBudgetsKW']
least = min(outputs[k]/(v*normal/sum(old.values())) for k,v in old.items())
assert least > 1 and outputs['kitchenDining'] > cooker['maximumLowLineKitchenW']/1000
assert outputs['kitchenDining'] < kitchen['zeroHeaterBandW']/1000 < cooker['singleHeaterFailureKitchenW']/1000

# Whole-store energy, heater hysteresis and a positively inhibited immersion during cooking.
# The native lower, right-angled element and its sensing pocket must substantiate usable heated depth.
capacity, cp, full_c = 300., 4.186/3600, 60.
draws = {420:80,465:80,510:70,1140:70}
assert sum(draws.values()) == max(services['hotWater']['deliveredDailyRangeLitres40C'])
def simulate(restart, initial, inhibit=True):
    max_e = capacity*cp*(full_c-10)
    e = capacity*cp*(initial-10)
    on = False
    final = []
    for day in range(84):
        start = e
        missed = charge = losses = served = 0.
        minimum = 60.
        for t in range(1440):
            request = draws.get(t,0)*30*cp
            take = min(request, max(0,e-capacity*cp*30))
            missed += (request-take)/(30*cp)
            served += take
            e -= take
            temp = 10+e/(capacity*cp)
            minimum = min(minimum,temp)
            loss = (2.28*max(0,temp-20)/40 + 1)/1440
            e -= loss
            losses += loss
            if temp < restart:
                on = True
            if on and not (inhibit and 1020 <= t < 1140):
                q = min(3*(216.2/240)**2/60, max_e-e)
                e += q
                charge += q
            if e >= max_e-1e-10:
                on = False
        assert isclose(e-start, charge-losses-served, abs_tol=1e-9)
        if day >= 77:
            final.append((missed,minimum,charge,e-start))
    return {'maxMissedL40FinalWeek': max(d[0] for d in final),'minCFinalWeek': min(d[1] for d in final),
            'maxChargeKWhFinalWeek': max(d[2] for d in final),'lastDayStorageChangeKWh': final[-1][3]}
control = {str(c):simulate(c,60) for c in (55,50,45)}
assert control['50']['maxMissedL40FinalWeek'] < 1e-7
# A colder starting tank may not settle on the same phase; test the service outcome independently.
cold_start = simulate(50,45)
assert cold_start['maxMissedL40FinalWeek'] < 1e-7

# Actual Y4575 apparatus exit. Compare the nominal Ø579 and a conservative Ø600 factory envelope.
centre = tuple(prior['vessel']['centre'])
assert centre == (9845,4250)
seat = (10090,3970)
def segment_gap(p,a,b):
    dx,dy = b[0]-a[0], b[1]-a[1]
    t = max(0,min(1,((p[0]-a[0])*dx + (p[1]-a[1])*dy)/(dx*dx+dy*dy)))
    return dist(p,(a[0]+t*dx,a[1]+t*dy))
def bridge_clear(s,r,c=centre):
    return segment_gap(c,s,(s[0]+120,s[1]+100))-r-37
body = {'centre': centre, 'nominalOD':579, 'trialCompleteOD':600, 'height':2052,
        'shiftedBridgeClearMM':bridge_clear(seat,300), 'heightOn100CartMargin':2300-2052-100,
        'oldWestStationMargin':centre[0]-300-plant['cylinder']['station'][0],
        'firstCartRiserMargin':plant['riserGross'][1]-centre[1]-425,
        'caseToEastWorkField':plant['cylinder']['workingEast'][0]-centre[0]-300,
        'fixedSeatPlusR37ToCartEdge':425-dist(centre,seat)-37}
assert body['shiftedBridgeClearMM'] > 35 and body['firstCartRiserMargin']==25
# The relief outlet port height in the older exact product card is 1674.
# Old Z1100 tundish and a hypothetical 300-radius OUTLET (no valve projection) cannot be joined within 600.
station = (10035,4800)
nearest_shell = dist(centre,station)-300
body['oldTundishStraightDatum'] = hypot(nearest_shell,1674-1100)
body['raisedTundishStraightDatum'] = hypot(nearest_shell,1674-1400)
assert body['oldTundishStraightDatum']>600>body['raisedTundishStraightDatum']
# Centreline return length on distinct branches. Keep the common trunk only once per floor.
# Summing full pipes can double-count. One branch alone is sufficient with its paired supply.
front_m = sum(dist(a,b) for x in services['hotWater']['loops'] if 'front-west' in x['route']
              for a,b in zip(x['separateReturnPath'],x['separateReturnPath'][1:]))/1000
body['distinctGroundAndUpperFrontRoutesM'] = front_m
body['frontSupplyAndReturnLAt20and13ID'] = front_m*pi*(.020**2+.013**2)/4*1000
assert body['frontSupplyAndReturnLAt20and13ID'] > 10
# Move the independently supported mineral-case seat 15 west of the slim trial.
# Move only the WEST wet joint 105 east; retain east pivot/rack. Support/drain and
# disconnect the downstream assembly before moving the vessel without a projecting tail.
wide_c=(9830,4250)
new_seat=(10195,3970)
wide_r=380
wide={'centre':wide_c,'installedOD':760,'height':1650,'nominalL':370,'newWestSeat':new_seat,
      'originalBridgeClearAtSlimStationMM':bridge_clear(seat,wide_r),
      'newBridgeClearMM':bridge_clear(new_seat,wide_r,wide_c),
      'newSeatExcessOverCartMM':dist(wide_c,new_seat)+37-425,'bareCaseToCartEdgeMM':425-wide_r,
      'attachmentsAfter25ReserveMM':425-wide_r-25,
      'caseToRiserMM':plant['riserGross'][1]-wide_c[1]-wide_r,
      'caseToSouthWallMM':wide_c[1]-3797-wide_r, 'caseToWestWallMM':wide_c[0]-9397-wide_r,
      'existingEastWorkFieldMarginMM':plant['cylinder']['workingEast'][0]-wide_c[0]-wide_r,
      'newWorkingEast':[10245,4025,900,700], 'operatorEntryClearMM':10545-wide_c[0]-wide_r-300}
def overlap(a,b):
    x,y,w,h=a
    u,v,s,t=b
    return [max(0,min(x+w,u+s)-max(x,u)),max(0,min(y+h,v+t)-max(y,v))]
wide['W9FootprintOverlapWithLocalBufferStationXY'] = overlap(w9['W9'],plant['primaryBuffer']['station'])
wide['W9FootprintOverlapWithLocalControlsXY'] = overlap(w9['W9'],plant['controlsHydraulics'])
assert all(wide['W9FootprintOverlapWithLocalBufferStationXY']) and all(wide['W9FootprintOverlapWithLocalControlsXY'])
assert wide['originalBridgeClearAtSlimStationMM']<0<35<wide['newBridgeClearMM'] and wide['newSeatExcessOverCartMM']>50
assert wide['operatorEntryClearMM']>=25 and wide['newWorkingEast'][0]-wide_c[0]-wide_r == 35
source = cooker['plantActualChallenger']
old_body = source['conditionalBodyPlanMM']
site = prior['site']
lift = site['lift']
new_body = [16950,3600,old_body[2],old_body[3]]
protect = [new_body[0]-1000,new_body[1]-1000,new_body[2]+2000,new_body[3]+2000]
reserve = site['old']['reservedClearSite']
assert overlap(old_body,lift)==old_body[2:] and not all(overlap(new_body,lift))
assert overlap(protect,reserve)==protect[2:] and overlap(new_body,site['equipmentPad'])==new_body[2:]
main_hp={'originalBodyMM':old_body,'overlapWithLiftXY':overlap(old_body,lift),'newBodyMM':new_body,'openGroundZone':protect,
         'zoneToCargoLift':protect[0]-lift[0]-lift[2],'zoneToEastLimit':reserve[0]+reserve[2]-protect[0]-protect[2],
         'usefulRoomTargetKW':14,'roomMarginAtPeakKW':14-peak,'dailyHeatSpareKWh':14*24-daily,
         'wholeDaySourceHoursRequired':daily/14,'primaryLmin':14*60/(10*cv),'secondaryLmin':14*60/(10*4.186),
         'requiredHXUAKWperK':14/10,'flowPathKPaWithAllowance':pipe['tubeAndFittingsKPa']*(14/(10*cv)/pipe['designLps'])**2+35}
assert main_hp['zoneToCargoLift']==main_hp['zoneToEastLimit']==120
cook_amps = 2*cooker['nominalElectricalCurrentPerHeaterA']
main_hp['cookingPhaseAllocationA'] = [19+32,19+cook_amps/2,19+cook_amps/2+3]
main_hp['phaseAllocationWith9KWIndoorBackupA'] = [v+13.1 for v in main_hp['cookingPhaseAllocationA']]
supply = {'maxHPA':37,'immersionAllowanceA':13,'makeupA':cook_amps,'auxAllowanceA':3,'cookerAllowanceA':32,
          'singlePhaseConcurrentA':37+13+cook_amps+3+32,'immersionsOffWhenCookingA':37+cook_amps+3+32}
result = {'preferredThreePhase':main_hp,'localRoom':room,'primary':hx,'emitterKW':outputs,'leastRatioToProRataNormal':least,
          'immersionLowLineKW':3*(216.2/240)**2, 'assumedHeaterOnBelowC':control,'coldStart50':cold_start,
          'directBody':body,'mineralReplan':wide,'current':supply}
content = json.dumps(result,indent=2,sort_keys=True)+'\n'
dest = HERE/'local-extract-heat-and-store.json'
# Both scaled panels use source coordinates; north is up. Shared features are labelled in the keys.
def panel(origin, scale, view, shapes):
    x0,y0 = origin
    xmin,ymin,xmax,ymax = view
    def point(x,y):
        return x0+(x-xmin)*scale, y0+(ymax-y)*scale
    items=[]
    for kind,coords,fill,stroke,style in shapes:
        if kind=='r':
            x,y,w,h=coords
            px,py=point(x,y+h)
            part=f'<rect x="{px:.2f}" y="{py:.2f}" width="{w*scale:.2f}" height="{h*scale:.2f}"'
        elif kind=='c':
            x,y,r=coords
            px,py=point(x,y)
            part=f'<circle cx="{px:.2f}" cy="{py:.2f}" r="{r*scale:.2f}"'
        else:
            path=' '.join(f'{px:.2f},{py:.2f}' for px,py in [point(*xy) for xy in coords])
            part=f'<polyline points="{path}"'
        items.append(f'{part} fill="{fill}" stroke="{stroke}" {style}/>')
    return ''.join(items)

def label(x,y,text,size=14,weight=400):
    return f'<text x="{x}" y="{y}" font-size="{size}" font-weight="{weight}">{text}</text>'
def rect(box,fill,stroke,extra=''):
    return ('r',box,fill,stroke,extra)
def circle(c,r,fill,stroke,extra=''):
    return ('c',(*c,r),fill,stroke,extra)
teal, red, grey, blue='#137466','#a44936','#70818b','#35688c'
site_shapes=[rect(reserve,'#f4f6f4','#aab5b2'),rect(lift,'#dee8ec',blue),
             rect(site['equipmentPad'],'#e1e8dc',grey),rect(protect,'none',teal,'stroke-dasharray="5 3"'),
             rect(old_body,'#efc6b5',red),rect(new_body,'#5f9b86',teal)]
ground = read('east-water-plant')['plantDryRoom']
room_shapes=[rect(ground,'#f4f6f4','#aab5b2'),rect(plant['riserGross'],'#dbe5e8',grey),
             rect(plant['primaryBuffer']['station'],'#dbe5e8',grey),rect(plant['controlsHydraulics'],'#dbe5e8',grey),
             rect(w9['W9'],'none',red,'stroke-dasharray="4 3"'),rect(wide['newWorkingEast'],'#e6ecdd','#8c9d85'),
             circle(wide_c,425,'none',grey,'stroke-dasharray="4 3"'),circle(wide_c,380,'#c4ded3',teal),
             ('p',[(11075,3970),seat],'none',red,'stroke-width="3"'),
             ('p',[(11075,3970),new_seat],'none',teal,'stroke-width="4"'),
             ('p',[new_seat,(new_seat[0]+120,new_seat[1]+100)],'none',teal,'stroke-width="3"'),
             circle(new_seat,37,teal,teal),circle(seat,28,'#efc6b5',red)]
svg = ''.join(['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 920 455" width="920" height="455" role="img"><title>East plant alternatives at the cargo lift and in the plant room</title><desc>The old outdoor unit overlaps the cargo lift. The new site lies east. The mineral tank requires a separate detachable bridge stand.</desc><rect width="920" height="455" fill="#fcfcf8"/><g font-family="DejaVu Sans, sans-serif" fill="#263b42">',
 label(26,31,'Six local extracts · plant and cargo access',22,700),
 label(26,59,'Outdoor equipment',16,700),label(477,59,'Mineral-cylinder renewal',16,700),
 panel((26,75),.074,(13000,2500,18500,6700),site_shapes),
 panel((477,75),.146,(9397,3797,11570.5,5780.5),room_shapes),
 label(125,204,'Lift',14,700),label(135,350,'Former unit',12),label(307,326,'New unit',12),
 label(518,300,'Ø760',13,700),label(634,315,'Work field',12),label(485,163,'Riser',11),label(591,148,'Buffer',11),label(702,102,'Controls',11),
 label(26,409,'Solid green unit, dashed 1 m protection zone.'),label(26,433,'The former footprint is wholly inside the lift.'),
 label(477,409,'Red marks the old bridge end and W9 footprint.'),label(477,433,'Green marks the new seat and first diagonal move.'),
 '</g></svg>\n'])

parser=argparse.ArgumentParser()
parser.add_argument('--check', action='store_true')
if parser.parse_args().check:
    assert dest.read_text()==content and dest.with_suffix('.svg').read_text()==svg, 'Regenerate local plant study'
else:
    dest.write_text(content)
    dest.with_suffix('.svg').write_text(svg)
