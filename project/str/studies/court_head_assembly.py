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
