"""Rear-west corner restraint and access screens on the selected house."""
from html import escape
from pathlib import Path
import json
import subprocess
import sys
import math


def evaluate(repo_root):
    project = Path(repo_root) / 'project'
    studies = project / 'str/studies'
    def read(path):
        return json.loads(path.read_text())
    house = read(project/'had/studies/water-replan.json')['model']
    services = read(project/'mat/studies/whole-house-service-baseline.json')
    crossing = read(project/'mat/studies/services-b-joined-inventory.json')['rearCrossingProposal']
    arch = read(studies/'current-house-coupled-arches.json')['geometry']
    renewal = read(studies/'current-house-window-renewal.json')
    guard = read(studies/'current-house-window-receivers.json')['guard']
    heel = read(studies/'current-house-welded-heel.json')
    pin = json.loads(subprocess.check_output([sys.executable, '-B', str(studies/'corner-pivot-pin.py')], text=True))
    radius = pin['pinDiameter']/2
    span = house['shell']
    ffl = house['sections']['firstFFL']
    window = next(o for o in house['openings']['FIRST'] if o['id'] == 'west-window-3')
    centre, half = window['centre'], window['width']/2
    jamb = centre+half
    furniture = house['upperFurniture']
    cabinet, low_box = [furniture[k] for k in ('rear-cabinet','rear-west-low-box')]
    source27 = services['interfaces']['rearSource27']
    assert [cabinet,low_box] == [source27['upperCabinet'],source27['lowBox']]
    strip = [jamb,cabinet[1]]
    assert low_box[1]+low_box[3] == strip[1] and low_box[1] < strip[0]
    pin_y, pin_z = span-arch['leftSpringX'],arch['springZ']
    centre_gap = strip[1]-pin_y
    assert 0 < centre_gap < radius and low_box[0] == cabinet[0]
    def centres(extra):
        return [strip[0]+radius+extra,strip[1]-radius-extra]
    centre_ranges = {k:centres(x) for k,x in [('bare',0),('with15Setout',15),
                                               ('with25WorkingGap',25),('withBoth',40)]}
    mid = sum(strip)/2
    stack = next(d['path'] for d in services['otherDuties'] if d['id']=='rear-soil')
    (sx,sy,z1),(xx,yy,z0) = stack[:2]
    assert [sx,sy] == [xx,yy] == crossing['centre'] == source27['retainedFloorPort'][:2]
    cover = crossing['maintenanceWitness']['panel']
    barrier = renewal['temporaryBarrier']
    rear = next(a for a in barrier['occupied'] if a['face']=='west' and a['centre']==centre)
    socket = next(a['xy'] for a in rear['socketAccess'] if 'rear-cabinet' in a['furnitureAtFinishFace'])
    rows = [z+ffl for z in barrier['rowsLocalZ']]
    rods = guard['proposedContact']['centreGlobalZ']
    core = guard['proposedContact']['outsideInnerCoreFaces']
    ring = heel['ring']['z']
    # A straight warm-face approach spans the current cabinet depth. If its
    # along-wall Y is the stack station it crosses the pipe axis, at every Z
    # below, irrespective of the unknown cabinet height or exact pipe OD.
    assert core[1] < cabinet[0] < sx < cabinet[0]+cabinet[2]
    assert all(z0 < z < z1 for z in [*rows,*rods,pin_z,*ring])
    r = (half**2/(2*(window['head']-window['spring'])) +
         (window['head']-window['spring'])/2)
    arc_centre = ffl+window['head']-r
    clear_at_pin = span-(centre+math.sqrt(r*r-(pin_z-arc_centre)**2))-arch['leftSpringX']
    # The straight-jamb rectangle is not the opening's actual boundary at
    # this elevation. Test the full circular working gauge against the finite
    # intrados, not just the larger horizontal distance to its edge.
    trial_y, gauge = jamb+40, radius+15+25
    along, high = trial_y-centre, pin_z-arc_centre
    to_intrados = math.hypot(along,high)-r
    spring_rise = ffl+window['spring']-arc_centre
    sector_end = (half*high-spring_rise*along)/r
    assert 0 < sector_end < gauge and gauge < to_intrados < arch['arch'][1]-gauge
    assert trial_y+gauge < cabinet[1] and pin_y-trial_y > gauge
    crown = ffl+window['head']+arch['arch'][1]
    assert crown == heel['height']['lowestProtectedReturn'] and ring[0]-crown == 25
    assert 125 < clear_at_pin < 126 and crossing['proposedFormedDiameter']==160
    assert set(rear['unboundHeightAtPanel']) == {'rear-cabinet','rear-west-low-box'}
    return {'corner':{'face':'rear-west first floor','ffl':ffl,'shell':span,'rawJambY':[centre-half,jamb],
                      'rawSillSpringHeadZ':[ffl+window[k] for k in ('sill','spring','head')],
                      'coreX':core,'cabinetPlan':cabinet,'lowBoxPlan':low_box},
            'pin':{'u':arch['leftSpringX'],'y':pin_y,'z':pin_z,'diameter':2*radius,
                   'axisToCabinetPlan':centre_gap,'nominalCabinetPlanOverlap':radius-centre_gap,
                   'lowestPinZ':pin_z-radius,'axisToRawOpeningAtPinZ':clear_at_pin,
                   'scope':'Plan overlap only. Cabinet and low-box upper heights remain unbound.'},
            'strip':{'alongY':strip,'width':strip[1]-strip[0],'midY':mid,
                     'midEdgeReserveAfterPinRadius':mid-strip[0]-radius,'axisIntervals':centre_ranges,
                     'combined104mmTrialDeficit':centre_ranges['withBoth'][0]-centre_ranges['withBoth'][1],
                     'scope':'Raw jamb to cabinet in plan. Low boxing occupies the same band. '
                             'The 15 mm setout and 25 mm working gap per side are trial allowances.'},
            'atSpring':{'offsetTrialCentreYZ':[trial_y,pin_z],'workingGaugeDiameter':2*gauge,
                        'radialEdgeToFiniteRawIntrados':to_intrados-gauge,
                        'workingEdgeToCabinetPlan':cabinet[1]-trial_y-gauge,
                        'centreToIntrados':to_intrados,'centreToSpringEndPlane':sector_end,
                        'centreToOriginalPinAxis':pin_y-trial_y,
                        'scope':'Fits the projected face between the opening and cabinet. Its centre is in the RC '
                                'arch sector and the gauge crosses the end plane. It cannot be drilled as a clear '
                                'core or used to draw the original pin. Actual room-face and low-box access are unresolved.'},
            'stack':{'xy':[sx,sy],'u':span-sy,'verticalZ':[z0,z1],
                     'pipeBodyComparator':crossing['pipeBodyComparator'],
                     'formedDiameterAtFloorOnly':crossing['proposedFormedDiameter'],
                     'warmFaceStraightRouteHitsStackAtZ':[*rows,*rods,pin_z,*ring]},
            'access':{'socketXY':socket,'socketZ':rows,'barrierPlan':rear['plan'],
                      'coverHistoricalZ':cover['z'],'coverHistoricalFaceX':cover['face'],
                      'coverHistoricalY':[cover['plan'][1],cover['plan'][1]+cover['plan'][3]],
                      'aboveHistoricalCoverZ':[z-cover['z'][1] for z in [*rows,pin_z]],
                      'permanentGuardRodY':span-guard['proposedContact']['tubeCentreXs']['near'],
                      'permanentGuardRodZ':rods,'guardBracketDraw':guard['bracketWithdrawal'],
                      'guardOutwardDraw':renewal['capture']['guardDraw'],'frameOutwardDraw':renewal['capture']['closedFrameDraw'],
                      'scope':'Historical face predates the 12 mm cabinet shift. It supplies no current straight tool slot.'},
            'roof':{'archExtradosCrownZ':crown,'collectorZ':ring,'gap':ring[0]-crown,
                    'afterTrialPinDiameter':ring[0]-crown-2*radius,
                    'scope':'At crown and overlapping wall-normal planes only.'}}


def figure(s):
    c,p,g,t,a,r = [s[k] for k in ('corner','pin','strip','stack','access','roof')]
    parts = ['<svg xmlns="http://www.w3.org/2000/svg" width="1260" height="770" viewBox="0 0 1260 770" role="img" aria-labelledby="title desc">',
             '<title id="title">Rear-west window restraint and access</title>',
             '<desc id="desc">The transverse spring pin grazes the cabinet in plan. A separate radial access line at the stack station crosses the vertical foul pipe. A longitudinal section shows the crown, roof collector, sockets and historical cabinet cover at different elevations.</desc>',
             '<style>text{font-family:DejaVu Sans,Arial,sans-serif;fill:#19353d}.title{font-size:32px;font-weight:bold}.sect{font-size:21px;font-weight:bold}.head{font-size:16px;font-weight:bold}.body{font-size:15px}.small{font-size:13px}.muted{fill:#485f66}.pin{fill:#94451a}.water{fill:#175e6b}</style>']
    def text(x,y,label,cls='body',anchor='start'):
        parts.append(f'<text x="{x:.2f}" y="{y:.2f}" class="{cls}" text-anchor="{anchor}">{escape(str(label))}</text>')
    def rect(x,y,w,h,fill,stroke='none'):
        parts.append(f'<rect x="{x:.2f}" y="{y:.2f}" width="{w:.2f}" height="{h:.2f}" fill="{fill}" stroke="{stroke}"/>')
    def line(x,y,xx,yy,colour='#879b9d',w=1,dash=''):
        parts.append(f'<line x1="{x:.2f}" y1="{y:.2f}" x2="{xx:.2f}" y2="{yy:.2f}" stroke="{colour}" stroke-width="{w}" stroke-dasharray="{dash}"/>')
    def dot(x,y,rad,fill,stroke='none'):
        parts.append(f'<circle cx="{x:.2f}" cy="{y:.2f}" r="{rad:.2f}" fill="{fill}" stroke="{stroke}"/>')
    pin,pipe,concrete,ink = '#bc612f','#2c7580','#d0dcd8','#233c43'
    rect(0,0,1260,770,'#fcfcf8')
    text(32,45,'Where can a rear-west restraint be reached?','title')
    text(33,76,'First-floor corner window  ·  Plan distances and elevations in mm  ·  Proposed structural and renewal interfaces','body muted')
    line(32,95,1228,95,ink,1.5)
    text(33,130,'Plan  |  Approach from the room','sect')
    text(34,155,'North points right. The plan shows the straight raw jamb projected from below.','small muted')
    # Equal plan scale for the pipe circle. Plan coverage does not assign a height.
    py = lambda y: 40+(y-10440)*.495
    px = lambda x: 190+(x-300)*.495
    cabinet, low = c['cabinetPlan'], c['lowBoxPlan']
    jamb, start = g['alongY']
    x1,x2 = c['coreX']
    rect(py(jamb),px(x1),py(11565)-py(jamb),px(x2)-px(x1),concrete)
    rect(py(jamb),px(x2),py(11565)-py(jamb),px(cabinet[0])-px(x2),'#e7e8dd')
    rect(py(10440),px(low[0]),py(start)-py(10440),low[2]*.495,'#e8d9bc')
    rect(py(start),px(cabinet[0]),cabinet[3]*.495,cabinet[2]*.495,'#ddc8a3')
    text(py(10609),px(541),'Low box','small','middle')
    text(py(11350),px(659),'Fixed cabinet','head','middle')
    text(py(11350),px(693),'height unbound','small muted','middle')
    line(py(10440),px(x2),py(jamb),px(x2),'#5f787b',1,'5 4')
    line(py(jamb),px(x1)-4,py(jamb),px(cabinet[0])+5,ink)
    line(py(jamb),px(306),py(start),px(306),ink)
    for y in (jamb,start): line(py(y),px(306)-4,py(y),px(306)+4,ink)
    text(py(10920),px(294),'100 between jamb and cabinet','small','middle')
    for y in (p['y']-p['diameter']/2,p['y']+p['diameter']/2):
        line(py(y),px(316),py(y),px(775),pin,1)
    line(py(p['y']),px(315),py(p['y']),px(775),pin,1,'4 3')
    line(py(g['midY']),px(335),py(g['midY']),px(732),'#7f784c',1,'3 4')
    sx,sy=t['xy']
    dot(py(sy),px(sx),t['pipeBodyComparator']*.495/2,'#a3c7ca',pipe)
    line(py(sy),px(317),py(sy),px(768),pipe,2,'5 4')
    dot(py(sy),px(sx),3,pipe)
    dot(py(a['socketXY'][1]),px(a['socketXY'][0]),4,ink)
    text(py(a['socketXY'][1])-6,px(a['socketXY'][0])-9,'Near barrier socket','small','end')
    text(py(10750),449,'Y 10750','small muted','end')
    text(py(p['y'])+6,470,f"Pin Y {p['y']:.2f}",'head pin')
    text(py(sy)+6,449,f"Stack Y {sy:g}",'head water')
    text(34,498,'The Ø24 withdrawal crosses 6.85 mm of the cabinet footprint.','body')
    text(34,520,'Actual cabinet and low-box heights govern contact at the spring.','small muted')

    line(628,114,628,530,'#bfcac5')
    text(648,130,'West elevation  |  What stays in place','sect')
    text(649,155,'Looking through the room face. The axis scales differ.','small muted')
    ey = lambda y: 664+(y-9640)*.246
    ez = lambda z: 493-(z-c['ffl'])*.092
    level = lambda y0,y1,z,col,w=1:line(ey(y0),ez(z),ey(y1),ez(z),col,w)
    for z in [c['ffl'],r['archExtradosCrownZ']]:
        level(9640,11555,z,'#cbd5d1')
    rect(ey(9640),ez(r['collectorZ'][1]),ey(11555)-ey(9640),
         ez(r['collectorZ'][0])-ez(r['collectorZ'][1]),'#485f65')
    text(ey(9770),ez(r['collectorZ'][1])-7,'Roof collector Z6540–6660','small')
    lo,hi=c['rawJambY']
    sill,spring,head=c['rawSillSpringHeadZ']
    rise=head-spring; half=(hi-lo)/2; arc_r=(half**2+rise**2)/(2*rise)
    centre=(lo+hi)/2
    verts=[(lo,sill),(lo,spring)]+[(lo+i*(hi-lo)/60,
           head-arc_r+math.sqrt(arc_r**2-(lo+i*(hi-lo)/60-centre)**2)) for i in range(61)]+[(hi,sill)]
    coords=' '.join(f'{ey(y):.2f},{ez(z):.2f}' for y,z in verts)
    parts.append(f'<polygon points="{coords}" fill="#e6efec" stroke="#628285"/>')
    text(ey(centre),ez(5000),'Raw opening','head','middle')
    rect(ey(sy-t['pipeBodyComparator']/2),ez(6630),t['pipeBodyComparator']*.246,
         ez(c['ffl'])-ez(6630),'#b8d4d4')
    line(ey(sy),ez(6660),ey(sy),ez(c['ffl']),pipe,1.5,'5 3')
    cy=a['coverHistoricalY']; cz=a['coverHistoricalZ']
    rect(ey(cy[0]),ez(cz[1]),ey(cy[1])-ey(cy[0]),ez(cz[0])-ez(cz[1]),'none','#9b8060')
    for z in a['socketZ']:dot(ey(a['socketXY'][1]),ez(z),3.5,ink)
    for z in a['permanentGuardRodZ']:dot(ey(a['permanentGuardRodY']),ez(z),3.5,'#627c54')
    dot(ey(p['y']),ez(p['z']),5,pin)
    test=s['atSpring']; ty,tz=test['offsetTrialCentreYZ']; rad=test['workingGaugeDiameter']/2
    parts.append(f'<ellipse cx="{ey(ty):.2f}" cy="{ez(tz):.2f}" rx="{rad*.246:.2f}" ry="{rad*.092:.2f}" fill="none" stroke="#43764d" stroke-width="2"/>')
    for y,z,dy,label,clr in [(p['y'],p['z'],-9,f"Spring {p['z']:.1f}",pin),
                             (a['permanentGuardRodY'],a['permanentGuardRodZ'][0],12,'Guard rods',ink),
                             (a['socketXY'][1],a['socketZ'][0],6,'Barrier sockets',ink),
                             (cy[1],cz[0],0,'Old cover',ink)]:
        line(ey(y)+6,ez(z),1137,ez(z)+dy,clr)
        text(1141,ez(z)+dy+4,label,'small')
    text(650,519,'The earlier cover ended at Z4300. The socket rows are at Z4400 and Z4720.','small muted')
    line(32,548,1228,548,'#9baea8')
    text(33,578,'The room-side strip','head')
    text(33,602,'The Ø104 trial costs Ø24 + 2 × (15 setout + 25 work).','small')
    text(33,623,'The straight-jamb strip is 4 mm short. At spring height,','small')
    text(33,644,'the green offset trial clears the arch opening by 7.63 mm.','small')
    text(445,578,'The stack station','head')
    text(445,602,'The straight approach crosses the retained pipe axis','small')
    text(445,623,'at the spring, guard and barrier levels. Removing','small')
    text(445,644,'the cabinet cover leaves the pipe in place.','small')
    text(842,578,'The gap over the crown','head')
    text(842,602,'The arch reaches Z6515 at its crown, 25 mm below','small')
    text(842,623,'the collector. A Ø24 transverse member in that','small')
    text(842,644,'same strip would leave 1 mm total.','small')
    line(32,665,1228,665,'#b8c6c0')
    text(33,691,'The green Ø104 gauge at Y10740 clears the cabinet by 8 mm. Its centre lands inside the RC arch and 54.85 mm off the pin. It is a face-space control only.','small')
    text(33,718,'For arch work, shore both arms independently. For window work, fit the room barrier and capture the guard before either jamb releases.','small muted')
    text(33,746,'Sources  ·  HAD water-replan  /  MAT whole-house services and rear-crossing proposal  /  STR corner pivot, window renewal, guard receivers and welded roof heel','small muted')
    return '\n'.join([*parts,'</svg>'])+'\n'
