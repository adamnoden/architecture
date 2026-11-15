"""Detail the continuous cage around the north hold-down and record interface holds."""
from hashlib import sha256
from math import asin, cos, hypot, pi, radians, sin, sqrt
from pathlib import Path
from sys import argv
import json


root = Path(argv[1])
sources = [
    'project/str/studies/floor-portal-twin-garden-tie.json',
    'project/str/studies/current-house-floor-stops.json',
    'project/str/studies/current-house-lateral.json',
    'project/had/studies/open-north-loggia.json',
    'project/mat/studies/loggia-soffit.json',
]
raw = [(root / name).read_bytes() for name in sources]
tie, floor, lateral, house, soffit = map(json.loads, raw)
guide = tie['directSleeve']
x0, y0 = guide['positiveTieXYWestThenEastMm'][0]
mirror = guide['physicalMirrorAboutXmm']
old = floor['newLoops']['outer']
top, bottom = old['topBottomZ']
cover, stirrup_d, main_d = 35, 8, 12
sleeve_r, bar_side_setting, object_relative_setting = 16, 5, 10
placing = max(main_d, 16 + 5, 20)
old_half = old['coreWidthDepth'][0] / 2
row_from_face = cover + stirrup_d + main_d / 2
old_q, new_q = old_half-row_from_face, 51.
width = 2*(new_q+row_from_face)
swing = new_q-old_q
angle = radians(10)
radius = 220.
sweep_x, sweep_y = radius*sin(angle), radius*(1-cos(angle))
between = (swing-2*sweep_y)/sin(angle)
ramp = 2*sweep_x+between*cos(angle)
straight_half = 30.
limit = straight_half + ramp


def longitudinal_path(offset):
    """Return the continuous bar half-width and the unsigned tangent angle."""
    d = abs(offset)-straight_half
    if d <= 0:
        return new_q, 0.
    if d >= ramp:
        return old_q, 0.
    if d < sweep_x:
        a = asin(d/radius)
        return new_q-radius*(1-cos(a)), a
    if d > ramp-sweep_x:
        a = asin((ramp-d)/radius)
        return old_q+radius*(1-cos(a)), a
    return new_q-sweep_y-(d-sweep_x)*sin(angle)/cos(angle), angle


# The main corner bars sit against the long H8 legs, below/above each fillet.
link_corner_r = 20.
row_setback = 22.
row_pitch = 37.
top_rows = [top-row_from_face-row_setback-n*row_pitch for n in range(4)]
bottom_rows = [bottom+row_from_face+row_setback+n*row_pitch for n in range(4)]
fillet_intrusion = (stirrup_d+main_d)/2 - (link_corner_r-hypot(10, 10))
assert row_setback>link_corner_r-(stirrup_d+main_d)/2
assert min(b-a-main_d for a,b in zip(bottom_rows,bottom_rows[1:]))==25

# Put a stronger crossbar near each curved rail. Keep the next ordinary
# hoop sufficiently far away for the local transverse slab bars.
hoop_schedule = [(54.,12),(134.,8),(220.,12),(300.,8)]
hoops = []
for offset, diameter in hoop_schedule:
    q, a = longitudinal_path(offset)
    combined_radius = (main_d+diameter)/2
    # The stations are built in one cage fixture; no separate site translation
    # is credited inside this intentionally tied assembly.
    side_from_row = combined_radius/cos(a) + (1 if a else 0)
    corner_radius = 2.5*diameter
    assert row_setback+combined_radius>=corner_radius
    hoops.append({
        'westXPairMm':[x0-offset,x0+offset],
        'diameterMm':diameter, 'mandrelAndAxisRadiusMm':[4*diameter,corner_radius],
        'barAbsoluteYAxesMm':[y0-q,y0+q],
        'linkAbsoluteYLegsMm':[y0-q-side_from_row,y0+q+side_from_row],
        'linkZBottomAndTopAxisMm':[bottom+cover+diameter/2,top-cover-diameter/2],
        'localFormRequiredYHalfWidthAtHoopMm':q+side_from_row+(cover+diameter/2)/cos(a),
        'nominalBarToHoopSideClearanceMm':side_from_row*cos(a)-combined_radius,
    })
assert straight_half<hoop_schedule[0][0]<straight_half+sweep_x
assert limit-sweep_x<hoop_schedule[2][0]<limit
nearest_hoop_x, receiving_d = hoop_schedule[0]
sleeve_bar_clear = new_q-main_d/2-sleeve_r-bar_side_setting
sleeve_link_clear = nearest_hoop_x-receiving_d/2-sleeve_r-object_relative_setting
assert sleeve_bar_clear == 24 and sleeve_link_clear == 22

west_section = [x0-limit, x0+limit]
east_section = [2*mirror-west_section[1],2*mirror-west_section[0]]
windows = []
for start,end in [west_section,east_section]:
    col_edge = []
    for opening in house['openings']['FIRST']:
        if opening['wall']!='outer-north':
            continue
        o0=opening['centre']-opening['width']/2
        o1=opening['centre']+opening['width']/2
        col_edge.append((max(o0-end,start-o1),opening['id'],opening['sill']))
    closest = min(col_edge)
    assert closest[0]>17
    windows.append({'planGapMm':closest[0],'id':closest[1],
                    'sillAboveCollectorTopMm':soffit['section']['z']['floor']+closest[2]-top})

# The previous adverse section equations do not credit the adjacent slab or
# the upstand widening as counterweight. Preserve that basis at transitions.
steel_area = 8*pi*(main_d/2)**2
steel_design = 500/1.15
concrete_design = .85*30/1.5
effective = old['adverseSection']['d']-row_setback
full_yield = steel_design*pi*(main_d/2)**2/1000
minimum_mandrel = full_yield*1000*(1/(row_pitch/2)+1/(2*main_d))/concrete_design
mandrel = 2*radius-main_d
assert mandrel>minimum_mandrel
max_pitch = 2*nearest_hoop_x
gross = []
for b,pitch in ((old['coreWidthDepth'][0],86),(width-2*sleeve_r,max_pitch)):
    neutral = steel_area*steel_design/(.8*b*concrete_design)
    bending = steel_area*steel_design*(effective-.4*neutral)/1e6
    conservative_shear = old['shearResistanceAtAdverseD']*min(1,100/pitch)*effective/old['adverseSection']['d']
    assert bending>old['momentShearDemand'][0] and conservative_shear>old['momentShearDemand'][1]
    gross.append({'netWidthComparisonMm':b,'localPitchMm':pitch,
                  'adverseEffectiveDepthMm':effective,'MRdKNm':bending,
                  'shearCapacityReducedForPitchAndDepthKN':conservative_shear})

# First-floor orthogonal bars are a separate reinforcement system.
# Widen the local N/S sleeve bay, preserve area/width and reserve the anchorage.
slab_bar_offset = 94
slab_bar_x = [x0-slab_bar_offset,x0+slab_bar_offset]
slab_bar_r = 7
slab_bar_axis_z = [3201,3333]
inboard_axis_y = 11552
north_south_bar_to_sleeve = slab_bar_offset-slab_bar_r-sleeve_r-bar_side_setting
slab_bar_to_hoop = min(abs(slab_bar_offset-offset)-d/2 for offset,d in hoop_schedule)-slab_bar_r-bar_side_setting
slab_cage_crossing_gaps = [min(abs(z-c) for c in bottom_rows)-main_d/2-slab_bar_r-bar_side_setting for z in slab_bar_axis_z]
assert min(slab_cage_crossing_gaps)==0
assert 4*full_yield*sin(angle) < steel_design*pi*(receiving_d/2)**2/1000
assert north_south_bar_to_sleeve>=placing and slab_bar_to_hoop>=placing
chord_y = [inboard_axis_y-44*n for n in range(3,-1,-1)]
chord_z = (soffit['section']['slabZ'][0]+soffit['section']['slabZ'][1])/2
chord_neutral_y = sum(chord_y)/len(chord_y)
chord_gap = min(abs(chord_z-z) for z in slab_bar_axis_z)-10-slab_bar_r-bar_side_setting
assert chord_gap>=placing
chord_demand = lateral['horizontalRoute']['chordDemand']
anchor_trial = {
    'comparisonModel':'Ancon TTH12 negative control. It serves H12, not the local H14 candidate. Its minimum C32/40 also exceeds the C30/37 source.',
    'manufacturerMinimumConcreteClass':'C32/40', 'presentCollectorConcreteClass':'C30/37',
    'headDiameterMm':40,'axialLengthMm':27,'axisYLimitsMm':[11658,11685],
    'bottomStemAxisZmm':slab_bar_axis_z[0],
    'undersideCoverIfPlacedOnBottomAxisMm':slab_bar_axis_z[0]-20-bottom,
    'lowestAxisToRetain35CoverAnd5SettingMm':bottom+20+35+5,
}
assert anchor_trial['undersideCoverIfPlacedOnBottomAxisMm']==11

# Give concrete and reinforcement positions independently of the nominal wall finish.
ordinary = soffit['section']['northOrdinaryY']
behind_sill = {
    'ordinaryFaceYmm':ordinary[0], 'roomFinishYToRetain27ThicknessMm':y0-width/2-27,
    'outerConcreteYmm':y0+width/2,'glassThicknessIfFormerOutboardFaceHeldMm':ordinary[3]-(y0+width/2),
    'oldCavityGapMm':ordinary[4]-ordinary[3],
    'remainingCavityIf110GlassAndBrickSeatHeldMm':ordinary[4]-(y0+width/2+110),
    'minimumCavityAtHeavierHoopIfGlassAndBrickSeatHeldMm':
        ordinary[4]-(y0+hoops[0]['localFormRequiredYHalfWidthAtHoopMm']+110),
}

receipt = {
    'sourceHashes':dict(zip(sources,[sha256(b).hexdigest() for b in raw])),
    'decision':'Reject the 180 mm stop. Carry the bar and link arrangement below as a local fitting witness; hold the collector joint on actual slab and chord development, verified form and thermal return, and the adopted whole-house actions.',
    'geometry':{
        'straightWidthDepthMm':[width,top-bottom],
        'upperAndLowerZmm':[top,bottom],
        'westAxisXYmm':[x0,y0],
        'westAndEastMainBarTransitionXmm':[west_section,east_section],
        'minimumSameXRawWindowGaps':windows,
        'transitionInsideMandrelMm':mandrel,
        'transitionCentrelineRadiusMm':radius,
        'transitionAngleDegrees':10,
        'transitionHorizontalLengthMm':ramp,
        'straightBayLengthMm':2*straight_half,
        'mainH12YAxesAtSleeveMm':[y0-new_q,y0+new_q],
        'topAndBottomMainH12ZRowsMm':[top_rows,bottom_rows],
        'unchanged750MmSectionOriginalCoverAndRoundedCornerIntrusionMm':fillet_intrusion,
        'allRowsMovedInwardToRemainOutsideFilletMm':row_setback,
        'linkCentrelineCornerRadiusMm':link_corner_r,
                'sleeveToEachPrincipalH12After5CombinedJigSettingMm':sleeve_bar_clear,
        'sleeveToPrincipalH12AfterIndependent5Plus5MmSettingMm':sleeve_bar_clear-5,
        'sleeveToNearestH8HoopAfter10RelativeSettingMm':sleeve_link_clear,
        'placingGapComparatorMm':placing,
        'maximumCageHoopPitchMm':max_pitch,
        'sleeveToH12HoopAtFormer100MmCentredBayAfter10SettingMm':
            50-receiving_d/2-sleeve_r-object_relative_setting,
        'formWidthAtFirstHeavierHoopMm':2*hoops[0]['localFormRequiredYHalfWidthAtHoopMm'],
        'fabricationAndInsertionComparator':{
            'thinMetalSleeveTrialODandIDmm':[32,28],
            'plainM24EnvelopeRadialClearanceBeforeStraightnessMm':2,
            'couplerPassageProved':False,
            'scope':'Set the tube, principal rails and end markers in one indexed fixture, with a combined 5 mm relative limit and resurvey before pour. Price straight rod feed separately from rebar clearance; actual internal liner section, threaded-end shape, stroke, gauge and on-site tolerances remain open.',
        },
        'straightSleeveBayWestAndMirrorHoopLayout':hoops,
        'finishAndCavityReturn':behind_sill,
    },
    'localMemberComparison':{
        'oldSeparateGoverningMAndV':[float(v) for v in old['momentShearDemand']],
        'reducedGrossRCComparisons':gross,
        'bendMandrelNeedAtFullYieldAndHalfVerticalPitchMm':minimum_mandrel,
        'fullYieldBarTensionKN':full_yield,
        'fullYieldTransverseTurnForcePerBarKN':full_yield*sin(angle),
        'fullYieldTotalPerCurveFourSameFaceRailsKN':4*full_yield*sin(angle),
        'fullYieldRadialLoadPerBarKNPerMm':full_yield/radius,
        'confinementHoopH12SingleCrossbarSteelOnlyKN':steel_design*pi*(receiving_d/2)**2/1000,
        'gapForForceSpreadFromH12HoopToFarEndOfCurveMm':
            max(nearest_hoop_x-straight_half,straight_half+sweep_x-nearest_hoop_x,
                hoop_schedule[2][0]-(limit-sweep_x),limit-hoop_schedule[2][0]),
        'straightFullYieldPoorBondComparatorMm':main_d/4*steel_design/2.1,
        'scope':'Section/mandrel checks only. Bedding, developed receiving tie, full bar cut/splice schedule, shed force and splitting, sleeve/joint local stress and rotation require the joined transfer.',
    },
    'floorBarAndChordComparison':{
        'westLocalNSAxesXAndZmm':[slab_bar_x,slab_bar_axis_z],
        'normalH12Per150AreaRateMm2PerM':pi*6**2*1000/150,
        'localH14Per188AreaRateMm2PerM':pi*slab_bar_r**2*1000/(2*slab_bar_offset),
        'NSSlabH14ToCollectorMainBarsAtOrthogonalCrossingsAfter5SettingMm':slab_cage_crossing_gaps,
        'candidateTopSlabEWBarAxisToSitBelowH14Mm':slab_bar_axis_z[1]-main_d/2-slab_bar_r,
        'H14ToSleeveAfter5MmSettingMm':north_south_bar_to_sleeve,
        'H14ToNearestHoopAfter5MmSettingMm':slab_bar_to_hoop,
        'chord4H20InboardYAxesMm':chord_y,
        'chordAxisZmm':chord_z,
        'localChordToNorthSouthSteelAfter5SettingMm':chord_gap,
        'oldSeparatePlanChordForceKN':chord_demand,
        'oldPlanChordAxisToTrialChordCentroidMoveMm':y0-chord_neutral_y,
        'associatedPlanMomentWitnessKNm':(y0-chord_neutral_y)*chord_demand/1000,
        'negativeHeadingControl':anchor_trial,
        'scope':'A local obstacle-routing check, not substitution of slab bars by area alone. The outer E/W distribution row and N/S end anchorage need an actual developed node. Preserve the separate plan chord action and provide its return; treat the two former lateral and cost-ledger cages as separate comparisons pending reconciliation.',
    },
}
def svg():
    out = ['<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="670" viewBox="0 0 1200 670" role="img" aria-label="North collector cage plan and section">',
           '<rect width="1200" height="670" fill="#fffdf8"/>',
           '<g font-family="DejaVu Sans, Arial, sans-serif" fill="#22323a">']
    main, link, slab, warning = '#216082', '#786247', '#54784a', '#9a493a'

    def label(x,y,text,size=16,fill='#22323a'):
        out.append(f'<text x="{x}" y="{y}" font-size="{size}" fill="{fill}">{text}</text>')

    def path(points, color, weight=2):
        data = ' '.join(f'{x:.2f},{y:.2f}' for x,y in points)
        out.append(f'<polyline points="{data}" fill="none" stroke="{color}" stroke-width="{weight}"/>')

    def circle(cx,cy,r,fill):
        out.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{fill}"/>')

    label(38,42,'NORTH RING / CONTINUOUS STEEL AROUND THE STRAIGHT HOLD-DOWN',23)
    label(38,72,'West shown • east mirrors • the slab end, chord return and concrete faces are unadopted',16)
    path([(38,93),(1162,93)],'#829092')
    label(38,126,'A / PLAN AT THE COLLECTOR TIER')
    label(660,126,'B / ROUND HOOP AND MAIN STEEL')
    px = lambda x: 330+.85*x
    py = lambda y: 330-.85*y
    offsets = range(-338,339,2)
    for sign in (-1,1):
        path([(px(x),py(sign*longitudinal_path(x)[0])) for x in offsets],main,3)
        path([(px(x),py(sign*(longitudinal_path(x)[0]+row_from_face))) for x in offsets],link,1)
    for row in hoops:
        for x in row['westXPairMm']:
            low,high = row['linkAbsoluteYLegsMm']
            path([(px(x-x0),py(low-y0)),(px(x-x0),py(high-y0))],
                 link,3 if row['diameterMm']==12 else 1.6)
    for x in (-slab_bar_offset,slab_bar_offset):
        path([(px(x),py(-141)),(px(x),py(35))],slab,2)
    circle(px(0),py(0),.85*sleeve_r,main)
    label(38,193,'51.37 mm to nearest window range',15)
    label(38,219,'R220 / 10° rail turns into 200 mm main body',15)
    label(38,477,'Nearest H12 hoops at X4286 / X4394')
    label(38,502,'Slab H14 lines X4246 / X4434 in green')
    label(38,527,'Shaft and full-length sleeve at X4340',16,main)

    # A hoop section is shown 1.05x in Y and 0.48x in Z.
    sy = lambda y: 908+1.05*y
    sz = lambda z: 535-.48*(z-bottom)
    body_x,body_width = sy(-width/2),1.05*width
    out.append(f'<rect x="{body_x}" y="{sz(top)}" width="{body_width}" height="{sz(bottom)-sz(top)}" fill="none" stroke="{link}"/>')
    q,a = longitudinal_path(0)
    nominal_side = q+10
    out.append(f'<rect x="{sy(-nominal_side)}" y="{sz(top-cover-4)}" width="{2*1.05*nominal_side}" height="{sz(bottom+cover+4)-sz(top-cover-4)}" rx="{1.05*link_corner_r}" ry="{.48*link_corner_r}" fill="none" stroke="{link}" stroke-width="3"/>')
    for y in (-q,q):
        for z in top_rows+bottom_rows:
            circle(sy(y),sz(z),5,main)
    path([(sy(0),sz(top)),(sy(0),sz(bottom))],main,2)
    path([(sy(-100),sz(3370)),(sy(100),sz(3370))],slab,2)
    label(660,171,'Z3920 / top')
    label(660,535,'Z3170 / original soffit')
    label(1028,220,'8H12',16,main)
    label(1028,240,'top face')
    label(1028,485,'8H12',16,main)
    label(1028,505,'bottom face')
    label(1028,440,'Z3370 / slab',14,slab)
    label(660,575,'Hoop section superimposed. Offset the hoop from the sleeve in X.',14)
    path([(38,608),(1162,608)],'#829092')
    label(38,639,'Placing reserves after stated settings · 24 mm to H12 rows · 22 mm to first bend hoop · 21 mm compared',15)
    out.append('</g></svg>')
    return '\n'.join(out)


print(svg() if '--svg' in argv else json.dumps(receipt, indent=2))
