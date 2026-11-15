"""Set out the paired garden tie, straight roof retention and north cap comparison."""
from hashlib import sha256
from math import cos, hypot, pi, radians, sin
from pathlib import Path
from sys import argv
import json


root = Path(argv[1])
sources = [
    'project/had/studies/open-north-loggia.json',
    'project/str/studies/open-loggia-support.json',
    'project/str/studies/current-house-grid.json',
    'project/str/studies/floor-portal-north-transfer.json',
    'project/str/studies/current-house-floor-stops.json',
    'project/mat/studies/loggia-soffit.json',
]
raw = [(root / name).read_bytes() for name in sources]
house, loggia, grid, north, floor_stops, soffit = map(json.loads, raw)
portal = house['insulatedPortal']
arch = loggia['north_arches']
west_rc_face, west_inner = portal['piers']['westEW']
y0, y1 = portal['piers']['gardenNS']
mid = (y0 + y1) / 2
shell = house['shell']
arch_outer_x = shell / 2 - (shell / 2 - west_inner) * arch['Ro'] / arch['Ri']
old_support_x = north['northSupportAxesXmm'][0]
roof_force = north['offsetTransferComparison']['historicStrippedNorthPadReferenceUpliftKN']
tie_z = arch['tie_and_bore']['bore_axis_z']
thrust = arch['tie_and_bore']['tie_tension_max']
sleeve_radius, relative, cover, cover_setting = 16, 10, 25, 5
sleeve_x = old_support_x - 37.5
sleeve_bare_ring_gap = arch_outer_x - (sleeve_x + sleeve_radius)
assert mid == north['offsetTransferComparison']['coordinateWitness']['roofBandCentreYmm']

# A wider pier encloses its outer link around the entire vertical sleeve.
new_face = west_rc_face - 37.5
near_link_x = new_face + 36
far_link_x = west_inner - 50
y_margin = 7.5
near_y, far_y = y0 - y_margin, y1 + y_margin
y_bar_offset = (y1 - y0) / 2 - 39
link_radius = 4
bar_radius = 6
links_y = [mid - y_bar_offset - bar_radius - link_radius,
           mid + y_bar_offset + bar_radius + link_radius]
main_x = [near_link_x + link_radius + bar_radius,
          far_link_x - link_radius - bar_radius]
main_y = [mid - y_bar_offset, mid + y_bar_offset]
strand_offset, slot_half_y, slot_half_z = 37.5, 8, 24
cover_after_setting = min(near_link_x - new_face, west_inner - far_link_x,
                          links_y[0] - near_y, far_y - links_y[1]) - link_radius - cover_setting
sleeve_link_gap = sleeve_x - near_link_x - sleeve_radius - link_radius - relative
closest_bar_y = y_bar_offset - strand_offset - slot_half_y - bar_radius - relative
closest_link_z = min(abs(tie_z-z) for z in arch['tie_and_bore']['near_bore_link_z'])
slot_link_gap = closest_link_z - slot_half_z - link_radius - relative
sleeve_slot_gap = strand_offset - slot_half_y - sleeve_radius - relative
assert cover_after_setting >= cover
assert min(sleeve_bare_ring_gap - relative, sleeve_link_gap, closest_bar_y, slot_link_gap, sleeve_slot_gap) > 0

# The clearance of the upper hoop includes distance normal to the bevel.
arch_origin_z = 1000*(arch['hinge_z'] + arch['rise'] - arch['Rm'])
bevel_slope = (portal['rawSpring'] - arch_origin_z) / (shell/2 - west_inner)
bevel_normal = hypot(1,bevel_slope)
upper_link_z = max(arch['tie_and_bore']['near_bore_link_z'])
old_arch_side_link_x = west_inner - 35
required_hoop_axis_cover = cover + link_radius + cover_setting
old_highest_allowed_link_z = portal['rawSpring'] + (west_inner-old_arch_side_link_x)*bevel_slope - required_hoop_axis_cover*bevel_normal
slot_lowest_allowed_link_z = tie_z + slot_half_z + link_radius + relative
old_bevel_cover = cover - (upper_link_z-old_highest_allowed_link_z)/bevel_normal
new_bevel_cover = (portal['rawSpring'] + (west_inner-far_link_x)*bevel_slope-upper_link_z)/bevel_normal - link_radius - cover_setting
assert old_highest_allowed_link_z < slot_lowest_allowed_link_z
assert min(new_bevel_cover,cover_after_setting) >= cover

outer_width, outer_depth = floor_stops['newLoops']['outer']['coreWidthDepth']
floor_nominal_cover = 35
each_floor_bar_setting = 5
floor_h12_centre_from_face = floor_nominal_cover + 2*link_radius + bar_radius
floor_nominal_lane = outer_width - 2*floor_h12_centre_from_face - 2*bar_radius
floor_adverse_lane = floor_nominal_lane-2*each_floor_bar_setting
floor_sleeve_diameter = sleeve_radius*2
floor_min_widening = floor_sleeve_diameter + relative-floor_adverse_lane
assert (floor_nominal_lane,floor_adverse_lane,floor_min_widening) == (30,20,22)

# Keep the original section depth and all main rows. Compare deliberately
# shifted longitudinal rows with a local stirrup phase on the straight part.
wide_width = 180
wide_half_row = wide_width/2-floor_h12_centre_from_face
wide_half_straight = 62
wide_taper_length = 10*(wide_width-outer_width)/2
wide_x = (sleeve_x-wide_half_straight-wide_taper_length,
          sleeve_x+wide_half_straight+wide_taper_length)
wide_east_x = (shell-wide_x[1],shell-wide_x[0])
wide_hoop_offset = 36
wide_rows_clear_to_sleeve = wide_half_row-bar_radius-sleeve_radius-each_floor_bar_setting
aggregate_clear = 21
wide_min_for_passing = 2*(floor_h12_centre_from_face+bar_radius+sleeve_radius+
                         each_floor_bar_setting+aggregate_clear)
passing_taper_extent = wide_half_straight + 10*(wide_min_for_passing-outer_width)/2
north_windows = [opening for opening in house['openings']['FIRST'] if opening['wall']=='outer-north']
windows = []
for section in (wide_x,wide_east_x):
    margins = []
    for opening in north_windows:
        opening_x = (opening['centre']-opening['width']/2,opening['centre']+opening['width']/2)
        gap = max(section[0]-opening_x[1], opening_x[0]-section[1])
        margins.append((gap,opening['id'],opening_x,opening['sill']))
    assert all(gap>0 for gap,*_ in margins)
    windows.append(min(margins))
assert len(north_windows)==4 and windows[0][0]==windows[1][0]==28
ordinary = soffit['section']['northOrdinaryY']
existing_soffit, existing_slab_top = soffit['section']['slabZ']
floor_top, floor_soffit = floor_stops['newLoops']['outer']['topBottomZ']
assert floor_soffit==existing_soffit and ordinary[1:3]==[mid-70,mid+70]
near_sleeve_slab_steel_x = [sleeve_x - 75, sleeve_x + 75]
discrete_floor_layout = {
    'trialCoreWidthDepthMm':[wide_width,outer_depth],
    'structuralBottomAndTopZmm':[floor_soffit,floor_top],
    'sameSlabSoffitDownstandMm':floor_soffit-existing_soffit,
    'firstFloorSlabTopZmm':existing_slab_top,
    'westStraightCageXmm':[sleeve_x-wide_half_straight,sleeve_x+wide_half_straight],
    'westAndEastFullTaperedXExtentsMm':[wide_x,wide_east_x],
    'outsideSleeveRawWebWidthMm':wide_width-floor_sleeve_diameter,
    'southAndNorthYFacesMm':[mid-wide_width/2,mid+wide_width/2],
    'longitudinalH12YAxesMm':[mid-wide_half_row,mid+wide_half_row],
    'adverseLaneMm':2*(wide_half_row-bar_radius-each_floor_bar_setting),
    'nearestTwoWestH8HoopXmm':[sleeve_x-wide_hoop_offset,sleeve_x+wide_hoop_offset],
    'nearestHoopClearAfter10SettingMm':wide_hoop_offset-link_radius-sleeve_radius-relative,
    'ordinaryRoomFinishRemainingIfNotMovedMm':mid-wide_width/2-ordinary[0],
    'ordinaryGlassThicknessIfOutsideFaceHeldMm':ordinary[3]-(mid+wide_width/2),
    'nearUpperWindowSetouts':[{'xClearMm':gap,'id':key,'rawOpeningXmm':x,
                               'rawSillClearFromCollectorTopMm':sill+soffit['section']['z']['floor']-floor_top}
                              for gap,key,x,sill in windows],
    'archMaxVerticalClearMm':floor_soffit-1000*(arch['hinge_z']+arch['rise']+arch['Ro']-arch['Rm']),
    'northSouthSlabH12CandidatePhaseAroundWestSleeveXmm':near_sleeve_slab_steel_x,
    'roomwardSlabH12EwCandidateEndYmm':mid-99,
    'alternativeOuterSlabH12Ymm':mid+51,
    'alternativeOuterSlabH12PlanSeparationToNewCollectorOuterRowMm':51-wide_half_row,
    'newCollectorRowsEachClearAfter5SettingMm':wide_rows_clear_to_sleeve,
    'placingGapTargetMm':aggregate_clear,
    'minimumTrialConcreteWidthForPlacingGapMm':wide_min_for_passing,
    'taperOverlapWithNearestWestRawWindowAtThatWidthMm':windows[0][2][1]-(sleeve_x-passing_taper_extent),
    'scope':'Unadopted local dimensions. Slab H12/150, discrete floor plan chords, longitudinal row returns, concrete placement, local bending and shear, fit in the existing solid eastern divider and all moisture/finish systems require coordinated detailed checks.',
}

# The exact minimum X of the annular sector occurs at the outer skewback.
ring_axis_x_max = arch_outer_x - sleeve_radius - relative
existing_axis_x_min = west_rc_face + cover + cover_setting + sleeve_radius
roof_x_ecc = old_support_x - sleeve_x
south_clear = portal['wrap']['faceNS'] - y_margin
room_face = west_rc_face - 27
metal_E, metal_proof, material_factor = 200_000, 200, 1.1
strap_width, strap_depth = 10, 40
paired_area = 2 * strap_width * strap_depth
fixed_pad_y, fixed_pad_z = 150, 150
bearing_length = (shell - 2 * new_face) + 2 * 85
joint = {
    'grossBendingDepthAlongXmm': 30, 'grossHeightZmm': 55,
    'outerSweepProjectionFromPierXmm': 110,
    'pivotDiameterMm': 24, 'doubleShearCheekCentreSpanMm': 40,
    'middleTongueBearingLengthMm': 24,
    'equalizerLimitDegreesEitherSide': 3.5,
}
half_thrust = thrust / 2
rocker_moment = half_thrust * strand_offset
pin_moment = thrust * (joint['doubleShearCheekCentreSpanMm'] / 4 -
                       joint['middleTongueBearingLengthMm'] / 8)
strap_stress = half_thrust * 1000 / (strap_width * strap_depth)
gross_rocker_modulus = joint['grossHeightZmm'] * joint['grossBendingDepthAlongXmm']**2 / 6
pivot_area = pi * joint['pivotDiameterMm'] ** 2 / 4
pivot_modulus = pi * joint['pivotDiameterMm'] ** 3 / 32
provision = {
    'westFaceAndHardwareLimitsXmm': [new_face-joint['outerSweepProjectionFromPierXmm'], new_face, room_face],
    'minimumRoomProjectionAtWestAndEastMm': room_face - new_face + joint['outerSweepProjectionFromPierXmm'],
    'grossBarSectionmm': [strap_width, strap_depth],
    'assumedElasticModulusMPa': metal_E,
    'assumedProofMPaAndMaterialFactor': [metal_proof, material_factor],
    'spanBetweenEffectiveHardwareSeatsMm': bearing_length,
    'pairElasticStiffnessKNPerMm': metal_E * paired_area / bearing_length / 1000,
    'equalEachStrandKN': half_thrust,
    'eachGrossStrandTensionMPa': strap_stress,
    'pairElasticExtensionMm': half_thrust * 1000 * bearing_length / (metal_E * strap_width * strap_depth),
    'oneStrandAbnormalGrossTensionMPa': 2 * strap_stress,
    'oneStrandAbnormalEccentricMomentKNm': thrust * strand_offset / 1000,
    'equalizerArmMomentKNm': rocker_moment / 1000,
    'equalizerGrossBendingMPa': rocker_moment * 1000 / gross_rocker_modulus,
    'centralPinDoubleShearAverageMPa': thrust * 1000 / (2 * pivot_area),
    'centralPinUniformBearingBendingMPa': pin_moment * 1000 / pivot_modulus,
    'bearingPadNetAreaExcludingStrapSlotsMm2': fixed_pad_y * fixed_pad_z - 4 * slot_half_y * slot_half_z * 2,
    'availableDifferentialAdjustmentMm': 2 * strand_offset * sin(radians(joint['equalizerLimitDegreesEitherSide'])),
    'maxFrictionMomentKNmAt10PercentArmImbalance': .10 * thrust * strand_offset * cos(radians(joint['equalizerLimitDegreesEitherSide'])) / 1000,
    'archThrustSourceSeparateCaseKN': thrust,
}
provision['grossPadContactMPa'] = thrust * 1000 / provision['bearingPadNetAreaExcludingStrapSlotsMm2']
# 40 K is a separate illustrative differential temperature challenge.
provision['differential40KTrialAt16eMinus6Mm'] = 40 * 16e-6 * bearing_length

# A segment is quadratic in its distance to a box between face crossings.
# Degenerate boxes also describe the sleeve centreline over its finite depth.
def segment_box_distance(start, end, bounds):
    delta = [b-a for a,b in zip(start,end)]
    cuts = {0., 1.}
    for coordinate, travel, faces in zip(start,delta,bounds):
        if travel:
            cuts.update(t for face in faces if 0 < (t := (face-coordinate)/travel) < 1)
    cuts = sorted(cuts)
    distances = []
    for a, b in zip(cuts,cuts[1:]):
        centre = [x + dx*(a+b)/2 for x,dx in zip(start,delta)]
        closest = [min(hi,max(lo,x)) for x,(lo,hi) in zip(centre,bounds)]
        active = [(x-c, dx) for x,c,dx,midpoint in zip(start,closest,delta,centre)
                  if c != midpoint]
        speed_squared = sum(speed**2 for _,speed in active)
        dot = sum(position*speed for position,speed in active)
        t = max(a,min(b,-dot/speed_squared)) if speed_squared else a
        distances.append(hypot(*(position+t*speed for position,speed in active)))
    return min(distances)


heads = {entry['id']: entry['xy'] for entry in grid['heads']}
older = next(profile for profile in loggia['cap']['named_starter_profiles']
             if profile['id'] == 'loggia-NW-lowreceiver')
current = heads['P25']
old_to_current_y = current[1] - older['xy'][1]
assert old_to_current_y == -32.5 and current[0] == older['xy'][0] and current[1] == mid
starters = []
for row in older['starters']:
    points = [(x, y + old_to_current_y, z) for x,y,z in row['points']]
    starters += [(row['id'], a, b) for a,b in zip(points, points[1:])]

foot = []
for depth in (-300, -320, -340, -400):
    sleeve_line = ((sleeve_x,sleeve_x),(mid,mid),(depth,-180))
    distance, bar = min((segment_box_distance(a,b,sleeve_line),name) for name,a,b in starters)
    foot.append({'endpointZmm': depth, 'sampleCentrelineDistanceMm': distance,
                 'closestOldBar': bar,
                 'clearanceAfterH22Sleeve10SettingAnd0p05ChordMm': distance - 11 - sleeve_radius - relative - .05})
assert foot[0]['clearanceAfterH22Sleeve10SettingAnd0p05ChordMm'] > 0
assert foot[-1]['clearanceAfterH22Sleeve10SettingAnd0p05ChordMm'] < 0
plate_replays = []
for width_y, top_z in ((50,-300),(60,-300),(72,-300),(50,-320),(50,-340)):
    plate_x, thickness = 120, 16
    box = ((sleeve_x-plate_x/2,sleeve_x+plate_x/2),
           (mid-width_y/2,mid+width_y/2),(top_z-thickness,top_z))
    distance, bar = min((segment_box_distance(a,b,box),name) for name,a,b in starters)
    plate_replays.append({
        'plateXYZmm': [plate_x,width_y,thickness], 'absoluteBoxXYZmm':box,
        'sampleBarCentrelineDistanceFromPlateMm':distance, 'closestOldBar':bar,
        'clearAfterH22Radius10SettingAnd0p05ChordMm':distance - 11 - relative - .05,
        'meanNetContactAt33p207KNWithTrial36mmHoleMPa':
            roof_force*1000/(plate_x*width_y - pi*18**2),
    })
assert plate_replays[0]['clearAfterH22Radius10SettingAnd0p05ChordMm'] > 10
assert 0 < plate_replays[2]['clearAfterH22Radius10SettingAnd0p05ChordMm'] < 1
assert plate_replays[-1]['clearAfterH22Radius10SettingAnd0p05ChordMm'] < 0
head_offset = abs(sleeve_x - current[0])
shaft_gap = 200-head_offset-sleeve_radius
assert shaft_gap == 24
branches = []
for near, outer, position_x in [('P25','P24',sleeve_x), ('P26','P27',shell-sleeve_x)]:
    ox, oy = heads[near]
    ax, ay = heads[outer]
    assert oy == ay == mid
    share = (position_x - ox) / (ax - ox)
    assert 0 < share < 1
    sides = []
    for signed_force in (roof_force, -roof_force):
        values = [signed_force * (1-share), signed_force*share]
        assert abs(sum(values)-signed_force) < 1e-9
        assert abs(values[1]*(ax-ox)-signed_force*(position_x-ox)) < 1e-9
        sides.append({'referenceVKN':signed_force, 'reactionsKN': dict(zip((near,outer), values))})
    branches.append({'sameYHeads': [near,outer], 'signedReactions': sides,
                     'nearCapEccentricityXmm': position_x-ox,
                     'nearCapMomentAboutYAtReferenceKNm': -roof_force*(position_x-ox)/1000})

# An ideal reversible diagonal carries only the earlier independent façade witness.
facade = north['independentOutOfPlaneFacadeHeadShare']
rise = north['offsetTransferComparison']['coordinateWitness']['roofBandBaseZmm'] - north['offsetTransferComparison']['coordinateWitness']['floorLinkDatumZmm']
diagonal_run = 1200
base_horizontal = facade['momentIfNoPerpendicularReturnKNm'] * 1000 / rise
base_vertical = base_horizontal * rise / diagonal_run
temporary = {
    'sameAxisFloorBraceFootYmm': mid - diagonal_run,
    'diagonalRunAndRiseMm': [diagonal_run, rise],
    'braceHorizontalVerticalAndAxialAtSeparateFacadeWitnessKN': [base_horizontal,base_vertical,hypot(base_horizontal,base_vertical)],
    'remainingCollectorHorizontalAtSameWitnessKN': facade['eachSourceFacadeHeadShareKN'] - base_horizontal,
    'scope': 'Indicative reversible erection diagonal position. Attachment, temporary wind, construction load and an anchored floor-to-girder brace before roof closure remain required. Independent falsework holds the ground arch until both straps engage.',
}

output = {
    'sourceHashes': {name:sha256(content).hexdigest() for name,content in zip(sources,raw)},
    'directSleeve': {
        'existingWestUnwidenedAxisRangeUsingFullRingAndCoverMm': [existing_axis_x_min, ring_axis_x_max],
        'existingIntervalDeficitMm': existing_axis_x_min-ring_axis_x_max,
        'fullAnnularSectorEdgeXmm': arch_outer_x,
        'newLowerPierXExtentsWestMm': [new_face, west_inner],
        'newLowerPierYExtentsMm': [near_y, far_y],
        'physicalMirrorAboutXmm': shell/2,
        'positiveTieXYWestThenEastMm': [[sleeve_x,mid],[shell-sleeve_x,mid]],
        'roofHoldDownShiftAwayFromOpeningXmm': roof_x_ecc,
        'oldSignedActionKN': roof_force,
        'newLocalRoofPointMomentKNmAtReference': roof_force * roof_x_ecc / 1000,
        'oldFloorOffsetMomentRemovedKNmAtReference': north['offsetTransferComparison']['shortTransfer']['floorEccentricMomentKNmAtReference'],
        'coverAndSettingMm': [cover,cover_setting,relative],
        'pierH8XAxesMmWest': [near_link_x,far_link_x], 'pierH8YAxesMm': links_y,
        'pierH12XAxesWestMm': main_x, 'pierH12YAxesMm': main_y,
        'linkCoverAfter5SettingMm': cover_after_setting,
        'upperHoopAtRadialBevel': {
            'oldArchSideLegXmm':old_arch_side_link_x, 'upperHoopZmm':upper_link_z,
            'oldPerpendicularCoverAfter5SettingMm':old_bevel_cover,
            'oldHighestZFor25After5SettingMm':old_highest_allowed_link_z,
            'slotLowestUpperLinkZWith10RelativeSettingMm':slot_lowest_allowed_link_z,
            'newArchSideLegXmm':far_link_x,
            'newPerpendicularCoverAfter5SettingMm':new_bevel_cover,
        },
        'sleeveRingClearAfter10SettingMm': sleeve_bare_ring_gap - relative,
        'sleeveLinkClearAfter10SettingMm': sleeve_link_gap,
        'axialWrapRemainingWithinUnchangedPortalFacesMm': south_clear,
    },
    'firstFloorCageRejection': {
        'canonicalCoreWidthDepthMm':[outer_width,outer_depth],
        'nominalAndAdverseCentralLanesMm':[floor_nominal_lane,floor_adverse_lane],
        'sleeveDiameterMm':floor_sleeve_diameter,
        'deficitsNominalAndAdverseBeforeInstallationMm':
            [floor_sleeve_diameter-floor_nominal_lane,floor_sleeve_diameter-floor_adverse_lane],
        'minimumWidthIncreaseFor42MmLaneAfterSettingsMm':floor_min_widening,
        'minimumTrialLocalCoreWidthMm':outer_width+floor_min_widening,
    },
    'localWidenedCollectorGeometryReservation':discrete_floor_layout,
    'pairedArchTie': {
        'shaftYAxesMm': [mid-strand_offset,mid+strand_offset], 'centreZmm': tie_z,
        'boreYandZOutsideMm': [2*slot_half_y,2*slot_half_z],
        'coreVerticalSlotExtentMm': [tie_z-slot_half_z,tie_z+slot_half_z],
        'sleeveToSlotClearAfter10SettingMm': sleeve_slot_gap,
        'slotToH12ClearAfter10SettingMm': closest_bar_y,
        'slotToNearH8ClearAfter10SettingMm': slot_link_gap,
        'loadPath': 'Independent horizontal flat straps; one central rocker at west equalizes by moment equilibrium; east fixed two-tail receiver addresses the net central thrust. Centre pivot and outside wedge plates bear on pier; temporary falsework remains until both straps are commissioned.',
        'hardwareEnvelope': joint, 'nominalElasticChecks': provision,
    },
    'constructionBraceComparison': temporary,
    'sameAxisCap': {
        'westTranslatedP25CageShiftYmm': old_to_current_y,
        'sleeveTopDatumZmm': -180,
        'westCageDepthBreaks': foot,
        'westShallowTopCapPlateTrials':plate_replays,
        'shaftEdgeReserveAfter10SettingMm': shaft_gap-relative,
        'shaftCoverCredit': False,
        'bareShaftEdgeReserveMm': shaft_gap,
        'sameYCapHeadPaths': branches,
        'scope': 'Sampled older P25 cage translated in Y only. Shallow cap head and transverse reinforcement require current as-designed joining; no deep sleeve, P26 cage or shaft anchorage adoption.',
    },
}
def drawing():
    earth, steel, red, void = '#857766', '#245c7b', '#9c4536', '#f4eee3'
    result = [
        '<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="775" viewBox="0 0 1280 775" role="img" aria-label="West north garden arch tie and straight uplift sleeve plan and section">',
        '<defs><pattern id="brick" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M0 8L8 0" stroke="#c49b89" stroke-width="1"/></pattern></defs>',
        '<rect width="1280" height="775" fill="#fffdf8"/>',
        '<g font-family="DejaVu Sans, Arial, sans-serif" fill="#22323a">',
    ]

    def label(x, y, content, size=17, color='#22323a'):
        result.append(f'<text x="{x}" y="{y}" font-size="{size}" fill="{color}">{content}</text>')

    def rect(x, y, w, h, fill, stroke, dashed=False):
        dash = ' stroke-dasharray="5 4"' if dashed else ''
        result.append(f'<rect x="{x:.2f}" y="{y:.2f}" width="{w:.2f}" height="{h:.2f}" fill="{fill}" stroke="{stroke}" stroke-width="1.7"{dash}/>')

    def line(x1, y1, x2, y2, color, width=2, dashed=False):
        dash = ' stroke-dasharray="5 4"' if dashed else ''
        result.append(f'<path d="M{x1:.2f} {y1:.2f} L{x2:.2f} {y2:.2f}" fill="none" stroke="{color}" stroke-width="{width}"{dash}/>')

    label(48, 53, 'GARDEN ARCH / SEPARATE HORIZONTAL THRUST AND VERTICAL HOLD-DOWN', 25)
    label(48, 81, 'West shown • east mirrors in X • comparison geometry and separate historical actions', 16)
    line(48, 104, 1232, 104, '#8e9a99')
    label(48, 139, 'A   PLAN THROUGH TIE Z2200', 19)
    label(670, 139, 'B   SECTION THROUGH Y11667.5', 19)

    px = lambda x: 56 + 1.23*(x-4130)
    py = lambda y: 206 + 1.23*(11820-y)
    rect(px(new_face), py(far_y), 1.23*(west_inner-new_face), 1.23*(far_y-near_y), void, earth)
    rect(px(west_rc_face), py(y1), 1.23*(west_inner-west_rc_face), 1.23*(y1-y0), 'none', '#9c978a', True)
    rect(px(near_link_x), py(links_y[1]), 1.23*(far_link_x-near_link_x), 1.23*(links_y[1]-links_y[0]), 'none', '#76553e')
    for bx in main_x:
        for by in main_y:
            result.append(f'<circle cx="{px(bx):.2f}" cy="{py(by):.2f}" r="{1.23*bar_radius}" fill="#76553e"/>')
    for offset in (-strand_offset, strand_offset):
        y = mid + offset
        rect(px(new_face), py(y+slot_half_y), 1.23*(west_inner-new_face), 1.23*2*slot_half_y, '#f5f4ee', steel)
        line(px(new_face-85), py(y), px(west_inner+45), py(y), steel, 4)
    result.append(f'<circle cx="{px(sleeve_x):.2f}" cy="{py(mid):.2f}" r="{1.23*sleeve_radius}" fill="#c8d8db" stroke="{steel}" stroke-width="2"/>')
    line(px(new_face-70), py(mid-58), px(new_face-70), py(mid+58), steel, 8)
    line(px(new_face-70), py(mid), px(new_face), py(mid), steel, 5)
    result.append(f'<circle cx="{px(new_face-70):.2f}" cy="{py(mid):.2f}" r="7" fill="#fffdf8" stroke="{steel}" stroke-width="2"/>')
    rect(px(new_face-110), py(mid+83), 110*1.23, 166*1.23, 'none', steel, True)
    line(px(arch_outer_x), py(far_y), px(arch_outer_x), py(near_y), red, 1.5, True)
    label(55, 180, 'West room')
    label(455, 180, 'Opening →')
    label(56, 555, 'A1  West receiver stays outside the reinforced bearing pier.')
    label(56, 584, 'A2  Twin Y11630 / 11705 slots flank the Ø32 vertical sleeve.')
    label(56, 613, 'A3  Shift the H8 face leg. Retain 4 mm sleeve/link gap after setting.')
    label(56, 642, 'A4  Access envelope extends 120.5 mm past the normal room face.')

    sx = lambda x: 676 + .96*(x-4210)
    sz = lambda z: 514 - .232*(z-2150)
    center_z = 1000*(arch['hinge_z'] + arch['rise'] - arch['Rm'])
    inside = 1000*arch['Ri']
    outside = 1000*arch['Ro']
    stop = 4700
    arch_inner_z = lambda x: center_z + (inside**2-(x-shell/2)**2)**.5
    arch_outer_z = lambda x: center_z + (outside**2-(x-shell/2)**2)**.5
    outer_xs = [arch_outer_x + (stop-arch_outer_x)*n/36 for n in range(37)]
    inner_xs = [west_inner + (stop-west_inner)*n/36 for n in range(36, -1, -1)]
    ring = ' '.join(f'{sx(x):.2f},{sz(depth(x)):.2f}' for xs, depth in ((outer_xs,arch_outer_z),(inner_xs,arch_inner_z)) for x in xs)
    result.append(f'<polygon points="{ring}" fill="url(#brick)" stroke="{red}" stroke-width="1.8"/>')
    rect(sx(new_face), sz(2250), .96*(west_inner-new_face), .232*130, void, earth)
    rect(sx(4250), sz(3370), .96*(stop-4250), .232*200, '#e5e0d4', earth)
    line(sx(sleeve_x), sz(3550), sx(sleeve_x), sz(2120), steel, 6)
    line(sx(old_support_x), sz(3540), sx(old_support_x), sz(3200), red, 2, True)
    line(sx(new_face), sz(tie_z), sx(west_inner+65), sz(tie_z), steel, 2, True)
    label(984, 232, 'Existing floor body')
    label(901, 416, 'Untouched brick ring', 17, red)
    label(880, 478, 'Paired tie plane', 16, steel)
    label(670, 555, 'B1  Exact sector edge X4370.282. No drilling into voussoirs.')
    label(670, 584, 'B2  New sleeve X4340 keeps 4.28 mm beyond relative setting.')
    label(670, 613, 'B3  Shift uplift at the roof 37.5 mm along the band.')
    label(670, 642, 'B4  Shallow cap termination at same Y as P25/P24 and P26/P27.')
    line(48, 684, 1232, 684, '#8e9a99')
    label(48, 719, 'Blue: positive steel path      Brown: concrete and cage      Red: masonry and former uplift axis', 15)
    result.append('</g></svg>')
    return '\n'.join(result)


print(drawing() if '--svg' in argv else json.dumps(output, indent=2))
