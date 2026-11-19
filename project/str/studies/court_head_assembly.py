"""P32 shop-threading, side-entry steel stock and continuity of the moisture plane."""
import json
import math
from pathlib import Path

HERE = Path(__file__).resolve().parent


def circle_cap(radius, offset):
    half_chord = math.sqrt(radius**2 - offset**2)
    area = radius**2 * math.acos(offset/radius) - offset*half_chord
    centroid = 2*half_chord**3/(3*area)
    return area, centroid


def pressures(load, radius, half_throat, error):
    # The two compressive resultants balance axial force AND moment about the
    # centre of the round head. Assume constant pressure within each contact cap.
    rp, yp = circle_cap(radius, half_throat-error)
    rn, yn = circle_cap(radius, half_throat+error)
    fp = load * yn/(yp+yn)
    fn = load-fp
    assert abs(fp*yp-fn*yn) < 1e-6
    return [fp/rp, fn/rn]


def evaluate():
    ground = json.loads((HERE/'current-house-ground-ties.json').read_text())
    grid = json.loads((HERE/'current-house-grid.json').read_text())
    tie = max(ground['court'], key=lambda r:r['jointUpliftKN'])
    assert tie['head']=='P32'
    cap = next(h for h in grid['heads'] if h['id']==tie['head'])
    cx, cy = tie['floorRodGroup']
    group = tie['headLocalRodEnds']
    centres = [[cap['xy'][0]+a,cap['xy'][1]+b] for a,b in group]
    pitch = math.dist(*centres)
    length, width, old_height = tie['DPCBlockPlanThickness']
    assert cap['shaftDiameter']==400 and cap['capXY']==[600,600] and pitch==120
    load = tie['worstRodAt60Percent']*1000
    assert math.isclose(load, .6*tie['jointUpliftKN']*1000)
    # In-place rotation about one axis also moves the other bore centre.
    off_axis = [2*pitch*math.sin(math.radians(a)/2) for a in (15,90)]
    cage_radius = math.hypot(*tie['originalBarXYLocal'][0])
    rotating_axis = group[1]
    sweep = math.dist(rotating_axis,tie['originalBarXYLocal'][1])
    other = [[cage_radius*math.cos(math.radians(22.5+45*i)),cage_radius*math.sin(math.radians(22.5+45*i))]
             for i in range(8) if i not in tie['originalPileBarIndicesZeroBased']]
    spin_clear = min(abs(math.dist(rotating_axis,p)-sweep)-22 for p in other)

    # Proposed wet-side head and slotted block. Long direction Y, entry from
    # the open court side. The intact separating band aligns with the earlier upper DPC at Z-40.
    shaft, head_diameter, head_height = 24,70,50
    throat, chamber, lip = 42,84,40
    bottom, top = -150,30
    bearing = bottom+lip
    chamber_roof = -53
    upper_bore_floor = top-57
    water_plane = -40
    assert chamber_roof < water_plane < upper_bore_floor
    assert head_height>=tie['twoBlindFullThreadsMM'] and upper_bore_floor-chamber_roof==26
    challenge = 5
    radius = head_diameter/2
    overhang = (chamber-throat)/2
    # At |e|<=5 the smaller cap carries at most half the force, since the
    # centroid of a smaller circular segment lies farther from the head axis.
    # The larger cap has at least the centred area even if assigned all T.
    conservative_pressure = max(load/(2*circle_cap(radius,throat/2+challenge)[0]),
                                load/circle_cap(radius,throat/2)[0])
    lip_stress = 3*conservative_pressure*(overhang/lip)**2
    applied = {str(e):pressures(load,radius,throat/2,e) for e in (0,challenge)}
    assert max(max(p) for p in applied.values()) <= conservative_pressure
    assert lip_stress < 200/1.1
    # At the lower mouth the last 30 mm of the radius-200 S approaches
    # the vertical tangent. Bound even the enlarged M24 diameter there.
    dz = max(0,tie['bendStartFinishZ'][1]-bottom)
    bend_r = tie['centrelinedBendRadius']
    curve_loss = bend_r-math.sqrt(bend_r**2-dz**2)
    sweep_x = 140
    block = [cx-width/2,cy-length/2,cx+width/2,cy+length/2]
    swept = [block[0],block[1],block[2]+sweep_x,block[3]]
    reserve = [(cap['xy'][i]+cap['capXY'][i]/2)-swept[i+2] for i in range(2)]
    reserve += [swept[i]-(cap['xy'][i]-cap['capXY'][i]/2) for i in range(2)]
    assert min(reserve)>0
    slot_length = width/2+chamber/2
    stock_area = length*width-2*chamber*slot_length
    # The shaft is below its cap. A position splice can bypass bar rotation
    # only where the real straight run, cover, bolts and installation tool fit.
    splice_width, splice_length = 48,248
    ref = {
        'source':'https://www.ancon.co.uk/downloads/83/Ancon_MBT_Couplers_International_Version.pdf.pdf',
        'ukAvailability':'https://www.ancon.co.uk/products/reinforcing-bar-couplers/mbt-couplers',
        'outsideDiameter':splice_width, 'length':splice_length,'bolts':10,
        'straightCapDepthBeforeBend':tie['bendStartFinishZ'][0]-cap['capZ'][0],
        'shaftCoverToBareSleeve':cap['shaftDiameter']/2-cage_radius-splice_width/2}
    return {
        'head':tie['head'], 'capAxis':cap['xy'], 'barCentres':centres,
        'strippedComparisonKN':tie['jointUpliftKN'],'singleMostLoadedBarKN':load/1000,
        'secondBarAtSameSplitKN':tie['jointUpliftKN']-load/1000,
        'twoEqualRodStiffnessTimesMaximumInitialMismatchKN':.2*tie['jointUpliftKN'],
        'singleM20ResistanceKN':tie['M20A4_80Resistance'],
        'original':{'stock':[length,width,old_height],'barPitch':pitch,
                    'secondAxisShiftAt15And90':off_axis,'preformedBarOffsetRadius':sweep,
                    'rotatingBarClearanceWithSixVertical':spin_clear},
        'candidate':{'stockXYZ':[width,length,top-bottom],'stockZ':[bottom,top],
            'threadedRoundHead':[head_diameter,head_height],'upperM20LowerM24FullEngagement':45,
            'throat':throat,'chamberWidth':chamber,'shoulderThickness':lip,
            'headBearingZ':bearing,'headTopZ':bearing+head_height,'lowerPocketRoofZ':chamber_roof,
            'upperBoreFloorZ':upper_bore_floor,'imperforateBand':[chamber_roof,upper_bore_floor],
            'proposedSheetZ':water_plane,'heightClearAboveHead':chamber_roof-bearing-head_height,
            'clearEachSideOfHeadAfterSetout':(chamber-head_diameter)/2-challenge,
            'throatSideClearAfterSetoutAndBend':(throat-shaft)/2-challenge-curve_loss,
            'remainingSteelInPlanBetweenPockets':pitch-chamber,
            'localBearingPressureMPa':applied,'continuousPressureUpperBoundMPa':conservative_pressure,
            'cantileverStripStressUpperMPa':lip_stress,'comparisonDesignStressMPa':200/1.1,
            'grossVerticalLigamentAreaMm2':stock_area,'averageNetSteelStressMPa':tie['jointUpliftKN']*1000/stock_area,
            'entryTravelWestMm':sweep_x,'sweptWorldBoundsXYXY':swept,
            'minimumPlanReserveToCapOutline':min(reserve),
            'initialClearToNominalHeads':sweep_x-width/2-radius,
            'clearOverCapConcreteBeforeBedding':bottom-cap['capZ'][1]},
        'nonrotatingSpliceComparator':ref,
        'scope':'Trial threaded heads, keeper and shoulder geometry. Band pressure is a two-patch comparison. No stock, nut, field tolerances, anchorage, bearing, moisture or pile proof.'}


def figure(result):
    """Plan during entry and transverse section through one seated head."""
    from html import escape
    c = result['candidate']
    w,l,h = c['stockXYZ']
    pitch = result['original']['barPitch']
    dia,hh = c['threadedRoundHead']
    throat,ch = c['throat'],c['chamberWidth']
    bottom,top = c['stockZ']
    bearing,roof = c['headBearingZ'],c['lowerPocketRoofZ']
    bore = c['upperBoreFloorZ']
    stroke = c['entryTravelWestMm']
    dark, light, steel, head, seal = '#24343b','#e9eeed','#92aaac','#a45825','#18786e'
    out = ['<svg xmlns="http://www.w3.org/2000/svg" width="1120" height="640" viewBox="0 0 1120 640" role="img">',
           '<title>P32 court hold-down, side-entry block and blind moisture band</title>',
           '<rect width="1120" height="640" fill="#fbfaf6"/><g font-family="sans-serif">']
    def label(x,y,s,size=15,col=dark,bold=False):
        out.append(f'<text x="{x}" y="{y}" font-size="{size}" font-weight="{700 if bold else 400}" fill="{col}">{escape(s)}</text>')
    def rect(x,y,width,height,fill,stroke='none',dash=''):
        out.append(f'<rect x="{x:.2f}" y="{y:.2f}" width="{width:.2f}" height="{height:.2f}" fill="{fill}" stroke="{stroke}" stroke-width="1.4" stroke-dasharray="{dash}"/>')
    def line(x1,y1,x2,y2,col,weight=1.5,dash=''):
        out.append(f'<path d="M{x1:.2f} {y1:.2f}L{x2:.2f} {y2:.2f}" fill="none" stroke="{col}" stroke-width="{weight}" stroke-dasharray="{dash}"/>')
    def circle(x,y,r,fill,stroke='none'):
        out.append(f'<circle cx="{x:.2f}" cy="{y:.2f}" r="{r:.2f}" fill="{fill}" stroke="{stroke}" stroke-width="1.4"/>')
    label(32,40,'How the P32 block meets two fixed starters',29,bold=True)
    label(32,68,'Court-west head at X3950 / Y4332.5. Proposed steel stock and working space in millimetres.')
    line(32,86,1088,86,steel)
    label(32,120,'01  Plan through both lower head pockets',20,bold=True)
    label(584,120,'02  Transverse section at one head',20,bold=True)
    line(553,103,553,500,steel)
    def x(u): return 198+1.18*u
    def y(v): return 328-1.18*v
    rect(x(-w/2+stroke),y(l/2),1.18*w,1.18*l,'none','#829291','6 4')
    rect(x(-w/2),y(l/2),1.18*w,1.18*l,steel,dark)
    for v in (-pitch/2,pitch/2):
        rect(x(-w/2),y(v+ch/2),1.18*(w/2+ch/2),1.18*ch,light)
        line(x(-w/2),y(v-throat/2),x(ch/2),y(v-throat/2),dark,1,'3 3')
        line(x(-w/2),y(v+throat/2),x(ch/2),y(v+throat/2),dark,1,'3 3')
        circle(x(0),y(v),1.18*dia/2,'#e8c6a9',head)
        circle(x(0),y(v),1.18*12,head)
    line(x(150),y(0),x(73),y(0),seal,3)
    line(x(73),y(0),x(82),y(5),seal,3)
    line(x(73),y(0),x(82),y(-5),seal,3)
    label(312,315,'140 west',15,seal,True)
    label(296,176,'Starting position',14)
    label(175,152,'Final block',14,dark,True)
    label(32,510,'Two 70 mm heads on 120 mm centres. The fixed bars stay still.',14)
    factor=1.35
    def u(v):return 702+factor*v
    def z(v):return 257-factor*v
    rect(u(-60),z(top),120*factor,h*factor,steel,dark)
    rect(u(-ch/2),z(roof),ch*factor,(roof-bearing)*factor,light)
    rect(u(-throat/2),z(bearing),throat*factor,(bearing-bottom)*factor,light)
    rect(u(-dia/2),z(bearing+hh),dia*factor,hh*factor,'#e8c6a9',head)
    rect(u(-12),z(bearing+45),24*factor,(bearing+45-bottom+25)*factor,head)
    rect(u(-10),z(top),20*factor,(top-bore)*factor,light)
    rect(u(-8),z(top+18),16*factor,(18+45)*factor,'#40585a')
    rect(u(-60),z(bore),120*factor,(bore-roof)*factor,'#6caaa3')
    line(u(-66),z(c['proposedSheetZ']),u(66),z(c['proposedSheetZ']),seal,2)
    for val,tx in [(top,'Top Z+30'),(bore,'End of upper drilling Z−27'),
                   (roof,'Lower pocket roof Z−53'),(bearing,'Head bears at Z−110'),(bottom,'Underside Z−150')]:
        line(u(61),z(val),822,z(val),dark,1)
        label(830,z(val)+5,tx,14)
    label(600,173,'Upper M20',14)
    label(600,510,'The 26 mm solid band contains the proposed barrier at Z−40.',14)
    line(32,535,1088,535,steel)
    label(32,565,'Construction order',17,bold=True)
    label(223,565,'Level the individual heads. Slide the block west. Fit a positive wet-side keeper. Install upper rods.')
    label(32,595,'The drawn pocket is a trial. Survey both head elevations and demonstrate load sharing, keeper access and perimeter continuity before bedding.',14)
    label(32,620,'Steel geometry only. The keeper, thread form, grout and wall finish are outside this drawing.',13,'#506269')
    return '\n'.join([*out,'</g></svg>',''])
