"""Locate the H25 cutoff and near-pier transfer at the 180 mm corner arch."""
import json
import math
from pathlib import Path
import runpy
import sys

D = Path(__file__).resolve().parent
def read(name):
    return json.loads((D / (name + '.json')).read_text())

arch = read('current-house-coupled-arches')['geometry']
detail = read('current-house-arch-detail')['archBars']
guard = read('current-house-window-receivers')['guard']['proposedContact']
solve = next(c for c in read('current-house-outward-arches')['controls']
             if c['geometry']['normalWidthNominal'] == 180)
geometry = solve['geometry']
profile = solve['coupled'][0]['centralH25Arch']
op = next(row for row in read('../../had/studies/water-replan')['model']['openings']['FIRST']
          if row['wall'] == 'outer-south' and row['centre'] == 1800)
half = op['width']/2
rise = op['head']-op['spring']
radius = (half**2+rise**2)/(2*rise)
angle = math.asin(half/radius)
dx, dz = math.cos(angle), math.sin(angle)  # positive magnitudes on the near tangent
mid_radius = radius + arch['arch'][1]/2
x0, z0 = arch['leftSpringX'], arch['springZ']
y0 = sum(geometry['normalH16Centres'])/2
origin = guard['outsideInnerCoreFaces'][0]
diameter, stress = profile['barDiameterMm'], profile['stressCapMPa']
bar_area = math.pi*diameter**2/4
bar_r = diameter/2
tail, cut_tolerance = 640, 10
longest = tail+cut_tolerance
end_x = x0-dx*longest
placing = 25  # parallel-bar comparison in the jamb placing study
spacing_error = 10  # two independent 5 mm setout allowances per coordinate
cast_shift = 5      # centred 10 mm section contraction for interference
required = diameter*stress/(.95*4*2.1)
last_credit, tip = profile['lastCreditedStation'], profile['freeTipStation']
intervals = len(profile['adverseFourBarProfile'])-1
arc_step = 2*angle/intervals
# Subtract 5 for formed midline, 5 for radial bar position, 5 for the tip cut.
available_arc = (tip-last_credit)*arc_step*(mid_radius-10)-5
assert available_arc-required > arch['arch'][1]

stations = [entry['upper'] for entry in detail['upperLStations']]
crossings = [{'x': origin+s, 'z': z0-(x0-origin-s)*dz/dx} for s in stations]
low, high = 5400, 5950
assert all(low < crossing['z'] < high for crossing in crossings)
outer_lane, inner_lane, proposed_lane = 43, 97, 6
pier_diameter = detail['upperLComparedOnPreviousBiaxialDomain']['diameter']
radii = bar_r + pier_diameter/2
def tangent_distance(x,z):
    chain = max(0,min(longest,(x0-x)*dx+(z0-z)*dz))
    return math.hypot(x-x0+dx*chain,z-z0+dz*chain)

# On either side of the constant-lane plateau, discard helpful Y separation.
# The unsloped H20 / tangent crossing lies inside the plateau, so the closest
# point of each ramp's vertical projection is its boundary at low or high.
ramp_clear = min(tangent_distance(row['x'],z) for row in crossings for z in (low,high))
ramp_clear -= math.sqrt(2)*spacing_error + cast_shift + radii
near_sleeve_d = next(s['sleeveOD'] for s in read('current-house-guard-bracket')['new']['formedSleeves']
                     if s['side']=='near')
guard_clear = min(tangent_distance(guard['tubeCentreXs']['near'],z) for z in guard['centreGlobalZ'])
guard_clear -= math.sqrt(2)*spacing_error + cast_shift + bar_r + near_sleeve_d/2
h10_cover = proposed_lane - pier_diameter/2 - 10 - geometry['outsideConcreteFace']
band_low,band_high = detail['localToe']['z']
tail_start_at_shortest = tail-cut_tolerance
assert z0-dz*longest > band_low and z0 < band_high

# Reuse the signed historic force cards and their original moment datum. Only
# the section polygon and four bar positions change in this local comparison.
args = sys.argv[:]
sys.argv = [args[0],'--check']
ground = runpy.run_path(str(D/'current-house-ground-ties.py'))
sys.argv = args
outside = geometry['outsideConcreteFace']
inside = geometry['insideConcreteFace']
leg = geometry['nearLInsideLegEnds']
concrete = [[(outside,outside),(leg,outside),(leg,inside),(outside,inside)],
            [(outside,inside),(inside,inside),(inside,leg),(outside,leg)]]
original = ground['bars'](stations)
revised = [(proposed_lane if x==outer_lane and y in stations else x,
            proposed_lane if y==outer_lane and x in stations else y) for x,y in original]
assert sum(a!=b for a,b in zip(original,revised))==4
def pier_screen(bars):
    hulls = {n:ground['curve'](n,bars,pier_diameter,concrete) for n in ground['Ndomain']}
    ratio,n,moment,location,wind = max((ground['utilisation'](m,hulls[n]),n,m,p,i)
                                       for n,m,_,p,i in ground['dem'])
    return {'ratio':ratio,'axialKN':n,'momentsKNm':moment,'corner':location,'wind':wind}

# Alternative: turn the H25 down before it reaches the upright H20s. Only
# straight length after the bend develops the bar. Its projection stays in the
# widened band, so the same H16, H20 and through-sleeves face every such leg.
def vertical_return():
    h16 = min(detail['legs'], key=lambda leg: leg['startVertical'][0])
    x16, top16 = h16['startVertical']
    x20 = max(row['x'] for row in crossings)
    sleeve_x = guard['tubeCentreXs']['near']
    earliest_start = band_low + required
    highest_tip = z0 - required
    assert max(highest_tip, h16['endVertical'][1]) < min(guard['centreGlobalZ'])
    assert min(earliest_start, top16) > max(guard['centreGlobalZ'])
    assert x20 < x16 < sleeve_x < x0
    assert abs(y0-outer_lane) < radii  # a route crossing X20 strikes the upright

    # Apply the project's 25 mm placing comparison to parallel uprights only.
    # A through-sleeve needs only positive separation. Keep all Y exact; each
    # pair can independently experience the adverse relative error in X.
    relative_x = 2 * read('current-house-jamb-placement')['barsAndFormAdverseSetout']
    h16_radii = bar_r + detail['diameter']/2
    dy16 = min(abs(y-y0) for y in geometry['normalH16Centres'])
    pitch16 = math.sqrt((placing+h16_radii)**2 - dy16**2)
    pitch20 = math.sqrt((placing+radii)**2 - (y0-outer_lane)**2)
    sleeve_radii = bar_r + near_sleeve_d/2
    # Right of X20, the nominal H16 exclusion already meets the H20 exclusion
    # on its left; the only possible pocket lies to the right of the H16.
    assert x20 + pitch20 > x16 - pitch16
    assert x0 < sleeve_x + sleeve_radii
    nominal = [x16+pitch16, sleeve_x-sleeve_radii]
    adverse = [nominal[0]+relative_x, nominal[1]-relative_x]
    witness_x = sum(nominal)/2

    # One realizable nominal pocket rather than an arbitrary straight line.
    # At the end of a circular turn the tangent is exactly vertical.
    radius = 300
    tangent = (x0-witness_x-radius*(1-dz))/dx
    straight_start = z0-tangent*dz-radius*dx
    straight = 650
    assert tangent > 0 and straight-cut_tolerance > required
    assert straight_start-straight-cut_tolerance > band_low
    force = stress*bar_area/1000
    return {
        'minimumVerticalStartZ':earliest_start, 'maximumTipZ':highest_tip,
        'h20X':x20, 'h16X':x16, 'sleeveX':sleeve_x,
        'parallelPlacingMm':placing, 'perItemXToleranceMm':relative_x/2,
        'h20RightLimitNominalMm':x20+pitch20, 'h16LeftLimitNominalMm':x16-pitch16,
        'nominalPocketX':nominal, 'requiredPocketXAtTolerance':adverse,
        'nominalPocketWidthMm':nominal[1]-nominal[0],
        'perItemXToleranceCeilingMm':(nominal[1]-nominal[0])/4,
        'witness':{
            'verticalX':witness_x, 'centrelineRadiusMm':radius,
            'initialTangentMm':tangent, 'verticalStartZ':straight_start,
            'verticalEndZ':straight_start-straight, 'straightLengthMm':straight,
            'h16ClearNominalMm':math.hypot(witness_x-x16,dy16)-h16_radii,
            'sleeveClearNominalMm':sleeve_x-witness_x-sleeve_radii,
            'h16ClearAtAdverseXMm':math.hypot(witness_x-x16-relative_x,dy16)-h16_radii,
            'sleeveClearAtAdverseXMm':sleeve_x-witness_x-sleeve_radii-relative_x,
        },
        'bendDeviationKN':{'horizontalMagnitude':force*dx, 'verticalMagnitude':force*(1-dz),
                           'resultant':force*math.hypot(dx,1-dz)},
    }

def forged_head():
    # Peikko PSB Single 25, Technical Manual 03/2026 table 1 and
    # ETA 21/0463 v03 annex 1. Station s is the full-diameter plane on the
    # tangent beyond the spring, not the overall length of the headed bar.
    head_r, thickness = 79/2, 13
    min_station = 2*diameter
    near20_x = max(row['x'] for row in crossings)
    crossing_station = (x0-near20_x)/dx
    last_station = crossing_station + thickness
    h16 = min(detail['legs'], key=lambda leg: leg['startVertical'][0])

    # ONE admissible card throughout. Positive radial offsets go left and up
    # in elevation; normal offsets act independently through wall thickness.
    head_x, head_y, head_z = x0-5*dz, y0-5, z0+5*dx
    x16, y16 = h16['startVertical'][0]+2*dz, min(geometry['normalH16Centres'])+5
    def collision_interval(x_bar, y_bar, upright_r, y_on_disk, half_chord, z_range):
        assert y_on_disk**2 + half_chord**2 < head_r**2
        # Chord and circular upright are cut by the same global Y plane.
        bar_half_width = math.sqrt(upright_r**2-(head_y+y_on_disk-y_bar)**2)
        reach = dz*half_chord + bar_half_width
        limits = [(head_x-x_bar-reach)/dx, (head_x-x_bar+reach)/dx]
        low, high = max(min_station, limits[0]), min(last_station, limits[1])
        assert low < high
        # The overlapping part cannot escape an upright end in elevation.
        assert z_range[0] < head_z-high*dz-half_chord*dx
        assert head_z-low*dz+half_chord*dx < z_range[1]
        return limits

    h16_interval = collision_interval(
        x16, y16, detail['diameter']/2, -27, 28.8,
        [h16['endVertical'][1]-2*dx, h16['startVertical'][1]-2*dx])
    h20_interval = collision_interval(
        near20_x, outer_lane, pier_diameter/2, -2, 39.4, [band_low, band_high])
    return {
        'headDiameterMm':2*head_r, 'headThicknessMm':thickness,
        'firstPermittedStationMm':min_station, 'firstH20CrossingMm':crossing_station,
        'lastStationIncludingHeadThicknessMm':last_station,
        'h16CollisionStationsMm':h16_interval, 'h20CollisionStationsMm':h20_interval,
        'meanAnnularPressureMPa':stress*bar_area/(math.pi*(head_r**2-bar_r**2)),
    }

def in_plane_cage():
    # Move the two end pairs along each arm, keeping the warm/cold lanes.
    # The transition starts above the lower temporary barrier pin and ends
    # below the H25 tip. Two equal circular bends meet a common straight.
    upper = [station-50 for station in stations]
    bottom, top = 4450, 5050
    crank_radius = 400
    height = top-bottom
    renewal = read('current-house-window-renewal')['temporaryBarrier']
    socket_x = renewal['postSocketsX'][0]
    pin_rows = [row['z'] for row in renewal['coverAndBarChecks'] if row['socketX']==socket_x]
    cranks = []
    for row, new_station in zip(detail['upperLStations'], upper):
        travel = row['station'] - new_station
        # t = tan(theta/2) on the shallow branch of the tangent construction.
        t = travel/(height+math.sqrt(height**2-travel*(4*crank_radius-travel)))
        theta = 2*math.atan(t)
        bend_rise = crank_radius*math.sin(theta)
        assert 2*bend_rise < height
        def offset(z):
            u = min(height,max(0,z-bottom))
            h = min(u,height-u)
            if h < bend_rise:
                bend_dx = crank_radius-math.sqrt(crank_radius**2-h**2)
                return bend_dx if u < height/2 else travel-bend_dx
            return u*math.tan(theta)-crank_radius*(1/math.cos(theta)-1)
        # Expand vertically for both bar radii and the relative setout. Then
        # bound the monotone centreline in X even at different elevations.
        pin_radius, half_pin = 5, 25
        z_margin = pin_radius+pier_diameter/2+spacing_error
        pin_clear = min(origin+row['station']-offset(z+z_margin)-socket_x
                        for z in pin_rows) - half_pin-z_margin
        crank_force = ground['fy']*math.pi*pier_diameter**2/4000
        cranks.append({'lowerStation':row['station'], 'upperStation':new_station,
                       'angleDeg':math.degrees(theta), 'straightLengthMm':(height-2*bend_rise)/math.cos(theta),
                       'barForceCapKN':crank_force, 'deviationPerBendAtCapKN':2*crank_force*math.sin(theta/2),
                       'pinGapLowerBoundMm':pin_clear})
    assert min(c['pinGapLowerBoundMm'] for c in cranks)>0

    # An interval for the H25 leg under independent relative X/Y losses.
    # Add 5 mm to the two opposed 5 mm steel errors for differential datum
    # shift. This is a comparison even if the two bars share a form datum.
    allowance = spacing_error + cast_shift
    h16 = min(leg['startVertical'][0] for leg in detail['legs'])
    row20 = origin+max(upper)
    dy16 = min(abs(y0-y) for y in geometry['normalH16Centres'])
    dy20 = min(abs(y0-y) for y in (outer_lane,inner_lane))
    def needed_pitch(d, transverse):
        clear = placing+(diameter+d)/2
        return allowance+math.sqrt(clear**2-max(0,transverse-allowance)**2)
    lane = [row20+needed_pitch(pier_diameter,dy20), h16-needed_pitch(detail['diameter'],dy16)]
    x, radius = 1091, 225
    assert lane[0] < x < lane[1]
    tangent = (x0-x-radius*(1-dz))/dx
    bend_start = [x0-tangent*dx,z0-tangent*dz]
    bend_end_z = bend_start[1]-radius*dx
    low_tip = bend_end_z-longest
    assert tangent>0 and low_tip-top > placing+radii+allowance
    # Interior of the arc and initial tangent lie on the opening side of
    # the leg. Only the H16 can cross in elevation. Its normal separation
    # applies along the entire bar; near/through-sleeves lie below the turn.
    sleeve_z = max(guard['centreGlobalZ'])
    bend_sleeve_gap = bend_end_z-sleeve_z-bar_r-near_sleeve_d/2-allowance
    leg_sleeve_gap = guard['tubeCentreXs']['near']-x-bar_r-near_sleeve_d/2-allowance
    def clear_to_leg(other_x, delta_y, d):
        return math.hypot(max(0,abs(x-other_x)-allowance),max(0,delta_y-allowance))-(diameter+d)/2
    # A point on the bend at 20 degrees to the vertical lies alongside
    # the straight H16, well inside its actual finite height. Compare it
    # on a single adverse placement card without any form shift.
    beta = math.radians(20)
    assert beta < math.acos(dz)
    point = [x+radius*(1-math.cos(beta)),bend_end_z+radius*math.sin(beta)]
    leg16 = min(detail['legs'],key=lambda leg:leg['startVertical'][0])
    assert leg16['endVertical'][1] < point[1] < leg16['startVertical'][1]
    admissible_gap = math.hypot(h16-point[0]-spacing_error,dy16-spacing_error)-bar_r-detail['diameter']/2
    assert admissible_gap < placing
    # The tangent crosses both members of the H16 pair at the same X,Z.
    # Bring each H16 in by its permitted 5 mm while leaving H25 nominal.
    # This one configuration narrows BOTH local throats simultaneously.
    cross_z = z0-(x0-h16)*dz/dx
    assert bend_start[0] < h16 < x0 and leg16['endVertical'][1] < cross_z < leg16['startVertical'][1]
    cold16,warm16 = geometry['normalH16Centres']
    surfaces = bar_r + detail['diameter']/2
    two_gaps = [y0-(cold16+spacing_error/2)-surfaces,(warm16-spacing_error/2)-y0-surfaces]
    force = stress*bar_area/1000
    # Tension pulls the bend towards the arch and down its tail. Each
    # developed tail pulls upwards on the pier. These are internal actions.
    horizontal, down = force*dx, force*(1-dz)
    mandrel = 2*radius-diameter
    # 2004 EC2 8.3(3), Eq 8.1, rearranged for ab on the historical C30
    # comparison. This is a required input, not an assumed spacing or pass.
    min_ab = 1/(mandrel*ground['fc']/(1000*force)-1/(2*diameter))
    return {
        'stationPairBefore':stations,'stationPairAfter':upper,'crankZ':[bottom,top],
        'crankCentreRadiusMm':crank_radius,'cranks':cranks,'socketPinRowsZ':pin_rows,
        'relativeXYAllowanceMm':allowance,'verticalLaneIntervalX':lane,
        'legX':x,'bendStartXZ':bend_start,'bendEndXZ':[x,bend_end_z],
        'bendRadiusMm':radius,'mandrelDiameterMm':mandrel,'bearingRequiredAbMm':min_ab,
        'tangentLengthMm':tangent,'lowestTipZ':low_tip,'tipToCranksMm':low_tip-top,
        'clearToH16LegMm':clear_to_leg(h16,dy16,detail['diameter']),
        'clearToH20LegMm':clear_to_leg(row20,dy20,pier_diameter),
        'bendAt20DegXZ':point,'bendToH16At20DegOnSteelErrorCardMm':admissible_gap,
        'steelKgAcrossEight':8*(tip*arc_step*mid_radius+tangent+radius*math.acos(dz)+tail)*bar_area*7850/1e9,
        'tangentCrossingXZ':[h16,cross_z],'bothThroatsOnOneSteelErrorCardMm':two_gaps,
        'crossingH16NormalGapMm':dy16-allowance-bar_r-detail['diameter']/2,
        'minGuardSleeveGapMm':min(bend_sleeve_gap,leg_sleeve_gap),
        'pairedArmBendForcesLocalXYZkN':[[horizontal,0,-down],[0,horizontal,-down]],
        'tailBondUpwardKNPerArm':force,'pier':pier_screen(ground['bars'](upper)),
    }

result = {
    'role':'Unadopted trial. Near spring and first interior station only receive H25 strength credit.',
    'stationCount':intervals+1,'nearSpringXZ':[x0,z0],'normalLane':y0,'barRadiusInElevationMm':mid_radius,
    'cutStation':tip,'lastCreditedStation':last_credit,'nominalCurveLengthMm':tip*arc_step*mid_radius,
    'nominalStraightTailMm':tail,'cutToleranceMm':cut_tolerance,'nearTailMinMm':tail_start_at_shortest,
    'nearTailMaxMm':longest,'nearEndNominalXZ':[x0-dx*tail,z0-dz*tail],
    'requiredBarForceKN':stress*bar_area/1000,'requiredBondLengthMm':required,
    'nearBondLengthReserveMm':tail_start_at_shortest-required,'curveAvailableFromLastCreditMm':available_arc,
    'curveBondLengthReserveMm':available_arc-required,
    'steelKgAcrossEight':8*(tail+tip*arc_step*mid_radius)*bar_area*7850/1e9,
    'nearH20Crossings':crossings,'baselineNominalSignedGapMm':abs(y0-outer_lane)-radii,
    'outerH20NormalLaneBeforeAfter':[outer_lane,proposed_lane],'constantLaneZ':[low,high],
    'crankRisesMm':[low-band_low,band_high-high],
    'trialH20PlateauGapMm':min(abs(y0-proposed_lane),abs(y0-inner_lane))-radii-spacing_error-cast_shift,
    'trialH20RampGapMm':ramp_clear,
    'existingH16CrossingGapMm':min(abs(y-y0) for y in geometry['normalH16Centres'])
                               - bar_r-detail['diameter']/2-spacing_error-cast_shift,
    'nearH12At600GapMm':end_x-(origin+600)-bar_r-6-spacing_error-cast_shift,
    'nearGuardSleeveGapMm':guard_clear,'nominalH10CoverMm':h10_cover,
    'outsideH10CoverAfter10FaceAnd5LinkMm':h10_cover-10-5,
    'historicalActionCount':len(ground['dem']),'momentDatumMm':ground['cent'],
    'pierOriginal':pier_screen(original),'pierRevised':pier_screen(revised),
    'verticalReturn':vertical_return(),
    'inPlaneCage':in_plane_cage(),
    'psbSingle25':forged_head(),
    'held':['Load transfer, in-arch bond and shear shift, bend forces and confinement.',
            'H20 cranks and transverse links, cover, concrete placing and durability at the actual crossings.',
            'Intermediate element extrema, cracked stiffness, paired pier actions and signed foundation delivery.'],
    'admitted':False,
}
out = Path(__file__).with_suffix('.json')
encoded = json.dumps(result,indent=2,sort_keys=True)+'\n'
if '--check' in args:
    assert out.read_text()==encoded
else:
    out.write_text(encoded)
