"""East plant opening, removable sill crossing and raised exchange dock. Dimensions in mm."""
from pathlib import Path
import argparse
import json
import math

HERE = Path(__file__).resolve().parent
PROJECT = HERE.parents[1]


def read(path):
    return json.loads((PROJECT/path).read_text())


def result():
    house = read('had/studies/water-replan.json')['model']
    steel = read('str/studies/current-house-grid.json')['girders']['outer-E']
    room = read('mat/studies/plant-room-rewind.json')
    fixture = read('mat/studies/w9-forkable-receiver.json')
    native = read('mat/studies/w9-forkable-receiver-sources.json')
    front = read('mat/studies/front-threshold.json')
    site = read('rwt/studies/over-roof-site-envelope.json')
    wall, east = house['shell'], house['architecturalServices']['eastWaterJoin']
    opening = next(r for r in house['archOpeningRegister']['GROUND'] if r['id']=='plant-replacement')
    door = east['replacementDoor']
    rough = [opening['centre'] + sign*opening['width']/2 for sign in (-1,1)]
    clear = door['finishedClearY']
    assert opening['wall']=='outer-east' and opening['leaves']==1 and rough==door['rawY']==[3900,5300]
    assert (wall,clear,door['requiredClearHeight'])==(12000,[4100,5100],2300)
    # Complete apparatus envelopes; option with north wall moved has a different centreline.
    cyl = house['architecturalServices']['plant']['cylinder']
    alt = room['wallNorth60Control']['cylinder425Revised4600Line']
    cart = room['W9CarrierBodyOnly']
    assert cyl['replacementCentrePath']==room['cylinder425Renewal']['polyline_mm']
    assert cyl['handlingRadius']==alt['radius_mm']==425 and cart['completeCarrier_mm']==[1250,609]
    assert not room['W9Crew300Complete700StationControl']['planPass']
    carrier = [('Cylinder',cyl['replacementCentrePath'][-1],425,425),
               ('Cylinder, wall moved',alt['polyline_mm'][-1],425,425),
               ('W9 and cart', cart['polyline_mm'][-1],625,304.5)]
    assert [p for _,p,_,_ in carrier]==[[12500,4575],[12500,4600],[12500,4575]]
    assert (opening['head'],opening['spring'])==(2850,2550)
    # New sill cut rather than transplanting the front collector. A flat work
    # plate bears over both sides of the channel when the weather rail is out.
    trough = [wall+30,wall+130]
    seats = [[trough[0]-20,trough[0]],[trough[1],trough[1]+20]]
    beam = [steel['datum']+s*steel['width']/2 for s in (-1,1)]
    assert steel['axis']=='y' and steel['z'][1]==-180 and beam==[11217.5,12117.5]
    strip=[4112.5,5062.5]
    dock=[trough[1],trough[1]+2100,3400,5350]
    down=house['architecturalServices']['eastFoulExit']['externalDownstackBodyTerritory']
    board=next(p for p in site['primitives'] if p['id']=='board-12335-4715')
    assert down==[12000,5475,450,300] and board['x']==[12135,12535] and board['y']==[4515,4915]
    records=[]
    for name,(x,y),hx,hy in carrier:
        full = [y-hy,y+hy]
        side = [full[0]-strip[0],strip[1]-full[1]]
        parked = trough[1]+25+hx
        nose = parked+hx
        south = full[0]-(dock[2]+50)
        # x=12500 is merely the final centre in the indoor route study.
        records.append({'item':name,'centreY':y,'fullY':full,'doorMargins':[full[0]-clear[0],clear[1]-full[1]],
                        'plateMargins':side,'plateMarginAfterTwo5':min(side)-10,
                        'oldTailX':x-hx,'requiredCentreX':parked,'addedTravel':max(0,parked-x),
                        'parkedNoseX':nose,'dockEndBeyondNose':dock[1]-nose,
                        'southStripInsideGuard':south,'crewBeyondTwo25':south-600-2*25})
    assert min(r['plateMarginAfterTwo5'] for r in records)>=25 and min(r['crewBeyondTwo25'] for r in records)>0
    assert all(r['dockEndBeyondNose']>=650 for r in records)
    assert all(board['x'][0] < r['parkedNoseX'] and board['x'][1] > trough[1]+25
               and board['y'][0] < r['fullY'][1] and board['y'][1] > r['fullY'][0] for r in records)
    grade=house['approaches']['authoredExteriorGrade']
    ext_end_z=-(dock[1]-seats[1][1])/80  # The outer 20 mm plate ledge remains level.
    # A short undropped service grate and the manufacturer's full wheel, as an
    # ideal rigid wheel meeting a square step. It is not a measured push force.
    assert '200x40 wheels' in next(s for s in native['nativeEvidence'] if 'Fetra25011401' in s['name'])['scope']
    g=native['nativeNumbers']['g_m_per_s2']
    mass=fixture['lift']['listedUnitPlusIdealFixture_kg']+native['nativeNumbers']['cart_kg']
    load=mass*g*1.5
    radius, h=100,15
    thickness=12
    span=(sum(seats[1])-sum(seats[0]))/2
    moment=load*span/4
    def strip_value(width):
        return 6*moment/(width*thickness**2)
    # No assumed wheel centres and no benefit from transverse plate action.
    # A single strip screen is valid only if its assumed effective width is
    # achieved. Missing bearing, fixings, moving boards and workers are separate.
    pressure=front['water']['rainMmH']
    area=(dock[1]-dock[0])*(dock[3]-dock[2])/1e6
    deck_q=area*pressure/3600
    door_area=opening['width']*opening['head']/1e6
    q=(area+door_area)*pressure/3600
    # Keep the front study's full bounding wet face as an additional challenge.
    # The 100 mm overfall is confined to the channel width at its north end.
    energy=1500*((q/1000)**2/(9.81*.1**2))**(1/3)
    trial_high=-85+energy+5
    high=-95+energy+5
    assert trial_high >= -60 > high and dock[3]+75<down[1]
    return {'opening':{'roughY':rough,'clearY':clear,'height':door['requiredClearHeight'],'singleLeaf':'remove for exchange'},
            'section':{'collectorX':trough,'bearingX':seats,'span':span,'outerBeamX':beam,'innerSeatToBeamEdge':beam[1]-seats[0][1],
                       'beamTop':steel['z'][1],'collectorLowestOuterSkin':-115,'verticalOverBeam':-115-steel['z'][1],
                       'normalCrest':15,'serviceTop':0,'servicePlateWidthY':strip,'plateThickness':thickness,
                       'jambToPlateMargins':[strip[0]-clear[0],clear[1]-strip[1]]},
            'dock':{'plan':dock,'fallStartsX':seats[1][1],'outsideGrade':grade,'outerEdgeZ':ext_end_z,'outerTransferRise':ext_end_z-grade,'rampAt1in20Mm':20*(ext_end_z-grade),
                    'foulStack':down,'oldNorthEdge':5500,'oldStackOverlap':5500-down[1],'northBayToStack':down[1]-dock[3],
                    'reliefWorkStripToStack':down[1]-(dock[3]+75),'scaffoldBoardPlan':[board['x'],board['y']]},
            'cargo':records,'carrierHeight':{'W9OnCart':fixture['height']['cartPortTopBound_mm'],
                     'W9HeadAllowance':door['requiredClearHeight']-fixture['height']['cartPortTopBound_mm'],
                     'cylinderBody':cyl['height'],'remainingForTrolleyFittingsAndClearance':door['requiredClearHeight']-cyl['height']},
            'plateComparison':{'coarseMassKg':mass,'oneWheelIncluding1p5_N':load,'widthMm':[25,40],
                'stripStressMPa':[strip_value(25),strip_value(40)],'requiredWidthAt200over1p1':6*moment/(thickness**2*(200/1.1)),
                'plateMassAt8000KgM3':(strip[1]-strip[0])*(seats[1][1]-seats[0][0])*thickness*8000/1e9,
                'squareStepForceFractionOfWheelReaction':math.sqrt(2*radius*h-h*h)/(radius-h)},
            'water':{'testRainMmH':pressure,'deckM2':area,'wholeDeckLitresPerSecond':deck_q,'additionalDoorRectangleM2':door_area,
                     'deckAndDoorLitresPerSecond':q,'rejectedReliefCrest':-85,'rejectedLevel':trial_high,
                     'reliefWidth':100,'reliefCrest':-95,
                     'idealHeadMm':energy,'adverse5Level':high,'panToeAboveReliefLevel':-60-high,'dryBackdam':-20},
            'scope':'Development geometry. A level temporary deck needs an external load-rated lift or dock; actual wheels, operator, supports, positive wet and dry joints, receiving levels and water tests remain to be qualified.'}


def figure(record):
    """Two metric views. The section exaggerates vertical dimensions."""
    s, dock = record['section'], record['dock']
    indigo,green,umber,blue,red='#463d68','#176455','#8c5930','#247597','#ad493e'
    svg=['<svg xmlns="http://www.w3.org/2000/svg" width="1210" height="625" viewBox="0 0 1210 625" role="img" aria-labelledby="title desc">',
         '<title id="title">East plant threshold and receiving dock</title>',
         '<desc id="desc">The full cylinder and ventilation carrier clear the channel onto a guarded dock. An exchange plate replaces the normal grate, and two separate external water outlets remain accessible.</desc>',
         '<rect width="1210" height="625" fill="#fbfaf6"/><g font-family="Arial,sans-serif" fill="#233539">']
    def label(x,y,t,size=15,colour='#233539',bold=False):
        weight='bold' if bold else 'normal'
        svg.append(f'<text x="{x:.2f}" y="{y:.2f}" fill="{colour}" font-size="{size}" font-weight="{weight}">{t}</text>')
    def rect(x,y,w,h,col,stroke='none'):
        svg.append(f'<rect x="{x:.2f}" y="{y:.2f}" width="{w:.2f}" height="{h:.2f}" fill="{col}" stroke="{stroke}"/>')
    def line(points,col,w=1,dash=''):
        xy=' '.join(f'{x:.2f},{y:.2f}' for x,y in points)
        svg.append(f'<polyline points="{xy}" fill="none" stroke="{col}" stroke-width="{w}" stroke-dasharray="{dash}"/>')
    label(28,42,'East plant door   ·   A level crossing and a place to receive the whole load',26,bold=True)
    label(28,72,'Development comparison, millimetres. Separate the weather seal in daily use from the temporary load surface during exchange.',15)
    line([(28,89),(1182,89)],'#aabbbc')
    label(28,118,'01   Exchange plan',19,bold=True)
    label(643,118,'02   Sill section at the crossing',19,bold=True)
    k=.156
    X=lambda x:38+k*(x-11650)
    Y=lambda y:148+k*(5760-y)
    def plan(x0,y0,x1,y1,fill,stroke='none'):
        rect(X(x0),Y(y1),(x1-x0)*k,(y1-y0)*k,fill,stroke)
    q=dock['plan']
    plan(*[q[0],q[2],q[1],q[3]],'#e5eee8',green)
    plan(11650,5300,12000,5760,'#d1ccc3')
    plan(11650,3300,12000,3900,'#d1ccc3')
    plan(12030,3800,12130,5400,'#b9dce6',blue)
    a,b=s['servicePlateWidthY']
    plan(12010,a,12150,b,'#789b9c',green)
    stack=dock['foulStack'];plan(stack[0],stack[1],stack[0]+stack[2],stack[1]+stack[3],'#e6c1b3',umber)
    label(X(12500),Y(5595),'Fixed foul stack',13,umber)
    label(X(12450),Y(5160),'W9 on cart at its new receiving position',13,green)
    last=record['cargo'][-1]
    plan(last['requiredCentreX']-625,last['fullY'][0],last['parkedNoseX'],last['fullY'][1],'#bfd9ca',green)
    line([(X(11700),Y(4575)),(X(last['parkedNoseX']),Y(4575))],green,1.6,'6 4')
    bx,by=dock['scaffoldBoardPlan']
    line([(X(bx[0]),Y(by[0])),(X(bx[0]),Y(by[1])),(X(bx[1]),Y(by[1])),(X(bx[1]),Y(by[0])),(X(bx[0]),Y(by[0]))],red,2,'5 3')
    label(X(12570),Y(4150),'Optional scaffold board in red',12,red)
    label(X(12570),Y(4015),'at the door approach.',12,red)
    label(X(12240),Y(3495),'South handling strip inside the guard',13,green)
    label(28,555,'House wall at X12000. The raised platform ends at X14230.',13)
    label(28,579,'Receiving lift, edge gate and nominated ground remain to be joined.',13)
    # x increases outward, z increases upward. Two independent structural supports.
    xx=lambda x:660+.66*(x-11520)
    zz=lambda z:252-1.42*z
    def sec(x0,z0,x1,z1,fill,stroke='none'):
        rect(xx(x0),zz(z1),.66*(x1-x0),1.42*(z1-z0),fill,stroke)
    sec(11520,-222,12117.5,-180,'#d1ccc3')
    sec(11520,-172,12025,-87,'#e3d6bf',umber)
    sec(11520,-57,12010,-4,'#ddcfba')
    line([(xx(11565),zz(-20)),(xx(11565),zz(-55)),(xx(12040),zz(-60))],blue,3)
    line([(xx(12030),zz(-72)),(xx(12030),zz(-110)),(xx(12130),zz(-110)),(xx(12130),zz(-72))],blue,3)
    sec(12010,-22,12030,-12,'#546765')
    sec(12130,-22,12150,-12,'#546765')
    sec(12010,-12,12150,0,'#4e8b7c',green)
    line([(xx(11520),zz(0)),(xx(12010),zz(0))],umber,2)
    line([(xx(12150),zz(0)),(xx(12290),zz(-1.75))],green,3)
    line([(xx(11740),zz(0)),(xx(11740),zz(15)),(xx(11810),zz(15)),(xx(11810),zz(0))],indigo,2,'5 3')
    label(651,155,'Dashed crest +15 removed for transport',14,indigo)
    line([(791,163),(xx(11778),zz(19))],indigo)
    label(938,195,'Flush 12 mm plate',14,green,True)
    line([(1049,201),(xx(12085),zz(2))],green)
    label(645,393,'Secondary pan, toe −60',13,blue)
    line([(809,383),(xx(11785),zz(-58))],blue)
    label(928,434,'Fixed collector below the plate',13,blue)
    line([(1025,417),(xx(12080),zz(-111))],blue)
    label(658,536,'Outer beam top −180',13,umber)
    label(836,573,'Section enlarged vertically. Outer dock support independent.',12)
    line([(28,590),(1182,590)],'#aabbbc')
    label(28,612,'Normal service: weather rail and grate fitted. Exchange: leaf and rail removed, both plate seats engaged, controlled external handoff.',14)
    return '\n'.join(svg+['</g></svg>'])+'\n'


if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--check',action='store_true')
    args=parser.parse_args()
    model=result()
    for suffix,text in [('json',json.dumps(model,indent=2)+'\n'),('svg',figure(model))]:
        out=HERE/f'plant-threshold.{suffix}'
        if args.check:
            assert out.read_text()==text
        else:
            out.write_text(text)
