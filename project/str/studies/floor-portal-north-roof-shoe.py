"""Separate bearing, sliding retention and wall-band ferrule at the north roof."""
from hashlib import sha256
from math import pi, sqrt
from pathlib import Path
from sys import argv
import json


root = Path(argv[1])
sources = [
    'project/str/studies/floor-portal-fixed-wall-head.json',
    'project/str/studies/floor-portal-north-transfer.json',
    'project/str/studies/floor-portal-twin-garden-tie.json',
    'project/str/studies/current-house-welded-heel.json',
    'project/str/studies/current-house-welded-network.json',
]
raw = [(root / name).read_bytes() for name in sources]
fixed, transfer, twin, heel, network = map(json.loads, raw)
lift = twin['directSleeve']['oldSignedActionKN']
gravity = transfer['eachSourceUniformDownwardSeatKN']
normal = transfer['independentOutOfPlaneFacadeHeadShare']['eachSourceFacadeHeadShareKN']
band_bottom, band_top = heel['ring']['z']
north_seats = fixed['reuseExistingFootprintAsFixedHead']['ordinaryVerticalRoofForceStationsMm']
tie_axes = twin['directSleeve']['positiveTieXYWestThenEastMm']
roof_y = tie_axes[0][1]
heel_endpoints = [p['u'] for p in heel['ring']['faces']['outer-north']['supports']]
assert north_seats == network['ordinaryStations'] and tie_axes[1][1]==roof_y
x_fixed, x_moving = north_seats
rise = next(o for o in fixed['raisedRoofOptions'] if o['datumRiseMm']==100)
stem = fixed['segmentMovementComparison']['freeStrain']
thermal_moving = abs(x_moving-x_fixed)*stem
thermal_far = max(abs(x-x_fixed)*stem for x in heel_endpoints)
reserve_x, set_x = 1., 3.
stage_z = 100
pin_d = 28.
pin_z = band_top+46
fork_centres = [-30.,30.]
cheek = 12.
tongue = 20.
pin_full_len = 96.
slot_x, slot_z = 60.,34.
relative_z = (slot_z-pin_d)/2
usable_x_at_vertical_limit = (slot_x-slot_z)/2
assert usable_x_at_vertical_limit > thermal_far+reserve_x+set_x
assert thermal_moving<thermal_far
bottom_lug_z, top_lug_z = band_top+21,band_top+70
lower_ligament = pin_z-slot_z/2-bottom_lug_z
upper_ligament = top_lug_z-pin_z-slot_z/2
assert min(lower_ligament,upper_ligament)>0

# Bearing and retaining hardware share the datum, with segregated contacts.
moving_pad = [90.,42.]
fixed_pad = [110.,44.]
assert (fixed_pad[0]-moving_pad[0])/2 > thermal_moving+set_x+reserve_x
sole_overlap_at_far_assembly = min(moving_pad[0],
    (moving_pad[0]+fixed_pad[0])/2-(thermal_far+set_x+reserve_x))
assert sole_overlap_at_far_assembly==moving_pad[0]
p_area = sole_overlap_at_far_assembly*moving_pad[1]

# Uplift spreads along the finite centre plate; a point load bounds the pin deflection.
steel_e = 200_000.
f355 = 355/1.1
f200 = 200/1.1
force = lift*1000
span = fork_centres[1]-fork_centres[0]
pin_i = pi*pin_d**4/64
pin_w = 2*pin_i/pin_d
pin_a = pi*pin_d**2/4
moment = force*(span/4-tongue/8)
pin_bending = moment/pin_w
pin_shear = force/(2*pin_a)
von_mises = sqrt(pin_bending**2+3*pin_shear**2)
pullout_shear = force/(2*tongue*lower_ligament)
assert von_mises<f355 and pullout_shear<f355/sqrt(3)
diaphragm_span, skin, effective_width, throat = 48.,20.,80.,5.
box = heel['ring']['section']
assert (box['B'],box['H'],box['t'])==(220,120,20)
local_i = effective_width*skin**3/12
face_width_inside = box['B']-2*skin
height_inside = box['H']-2*skin
webs = {
    'offsetFromRoofSeatXMm':[-diaphragm_span/2,diaphragm_span/2],
    'eachShopWeldedPlateXYZMm':[12,face_width_inside,height_inside],
    'effectiveThroatPerWebMm':throat,
    'effective80MmSkinStripUpliftMPa':force*diaphragm_span/4/(local_i/(skin/2)),
    'effective80MmSkinStripUpliftPointDeflectionMm':force*diaphragm_span**3/(48*steel_e*local_i),
    'eachWebMeanWeldShearIfBalancedMPa':force/(2*face_width_inside*throat),
    'twoLongitudinalSidewallsGrossDirectShearMPa':force/(2*skin*height_inside),
}
# The moving header reaches the two actual ordinary twin-rail centrelines.
ordinary = heel['node']['ordinary']
rail_axes = [sum(span)/2 for span in ordinary['railBoundsY']]
rail_centres = sorted(rail_axes)
rail_span = rail_centres[1]-rail_centres[0]
rail_underside = heel['height']['minimumTieUnderside']+stage_z
header_width, header_depth, header_wall, header_length = 100.,50.,6.,292.
header_lower = rail_underside-header_depth
header_i = (header_width*header_depth**3-
            (header_width-2*header_wall)*(header_depth-2*header_wall)**3)/12
header_a = header_width*header_depth-(header_width-2*header_wall)*(header_depth-2*header_wall)
header_w = header_i/(header_depth/2)
header_kg_per_mm3 = 7.85e-6
post = [40,40,5]
post_a = post[0]*post[1] - (post[0]-2*post[2])*(post[1]-2*post[2])
post_length = header_lower-top_lug_z
post_offset_x = 24.
post_edge_reserve = header_width/2-post_offset_x-post[0]/2
assert post_edge_reserve == 6
moving_tongue_length = 140
moving_tongue_volume = moving_tongue_length*tongue*(top_lug_z-bottom_lug_z) - (
    (slot_x-slot_z)*slot_z + pi*(slot_z/2)**2)*tongue
moving_volume = header_a*header_length + 2*post_a*post_length + moving_tongue_volume + p_area*10
moving_header = {
    'actualOrdinaryTwinRailYAxesRelativeToSeatMm':rail_centres,
    'raisedOrdinaryRailUndersideZmm':rail_underside,
    'movingCrossHeaderGrossRHSWidthDepthWallAndLengthMm':
        [header_width,header_depth,header_wall,header_length],
    'headerZmm':[header_lower,rail_underside],
    'twoMovingSHSWidthDepthWallAndLengthMm':post+[post_length],
    'postSpacingAlongShoeXmm':2*post_offset_x,
    'postFootprintReserveWithinHeaderWidthMm':post_edge_reserve,
    'centralOldUpliftGrossHeaderStressMPa':force*rail_span/(4*header_w),
    'oneSideUnseatedOldUpliftGrossHeaderStressMPa':force*rail_span/(2*header_w),
    'oldUpliftHeaderCentralPointDeflectionMm':force*rail_span**3/(48*steel_e*header_i),
    'eachPostAtHalfOldGravityStressMPa':gravity*1000/(2*post_a),
    'partialMovingAddedDeadKNScreen':moving_volume*header_kg_per_mm3*9.81/1000,
}
moving_header['residualToAuthoredOneKNHeelBudgetBeforeDetailedPartsKN'] = (
        heel['nodeGMaximum']-heel['nodeGkN']-moving_header['partialMovingAddedDeadKNScreen'])
assert rail_span==232 and post_length==30
assert moving_header['oneSideUnseatedOldUpliftGrossHeaderStressMPa']<f200
assert moving_header['residualToAuthoredOneKNHeelBudgetBeforeDetailedPartsKN']>0
ferrule_od, ferrule_id = 40.,32.
steel_thread_area = 353.  # Earlier M24 rod comparison.
hole_i = 2*(ferrule_od*skin**3/12 + ferrule_od*skin*((box['H']-skin)/2)**2)
net_band_w = (box['I']-hole_i)/(box['H']/2)
eye_to_ferrule = abs(north_seats[0]-tie_axes[0][0])
moment_to_ferrule = lift*eye_to_ferrule/1000
assert eye_to_ferrule==abs(north_seats[1]-tie_axes[1][0])
ferrule = {
    'positiveRodAxesXYmm':tie_axes,
    'tubeOuterAndInnerDiametersMm':[ferrule_od,ferrule_id],
    'fixedBoxZmm':[band_bottom,band_top],
    'bearingWasherODThicknessAndHoleMm':[60,15,33],
    'topNutAndThreadProjectionIf19Plus6Mm':15+19+6,
    'rodThreadStressAtOldWitnessMPa':force/steel_thread_area,
    'meanWasherOnBandNetContactMPa':force/(pi*(60**2-ferrule_od**2)/4),
    'meanOneFullCircular5MmEffectiveWeldShearMPa':force/(pi*ferrule_od*throat),
    'grossBandStrongAxisWWithoutFerruleCutMm3':box['W'],
    'netBandStrongAxisWWithUncreditedFerruleMetalMm3':net_band_w,
    'roofSeatToFerruleXmm':eye_to_ferrule,
    'localIsolatedAnchorMomentAtOldUpliftKNm':moment_to_ferrule,
    'grossNetSectionBendingFromThatMomentMPa':moment_to_ferrule*1e6/net_band_w,
    'existingBandSteelProofComparatorMPa':f200,
    'assembly':'Put the ferrule through both 20 mm skins. Locate it against the positive X-shifted wall rod. Use an independent top bearing washer and retained nut. The top plate and closed cell require actual continuity, weld and splitting checks.',
}
assert ferrule['grossNetSectionBendingFromThatMomentMPa']<f200
# The bore axis runs inward toward larger q, measured from the outside wall datum.
q_axis = 12000-roof_y
room_q = fixed['existingSection']['roomFinishQmm']
pin_y_range = [q_axis-pin_full_len/2,q_axis+pin_full_len/2]
inner_cheek_face = q_axis+fork_centres[1]+cheek/2
draw = inner_cheek_face-pin_y_range[0]+2
draw_tip = pin_y_range[1]+draw
q_opening = room_q
access = {
    'pinOperatingYDatumQAndZmm':[q_axis,pin_z],
    'pinAssembledQEnvelopeMm':pin_y_range,
    'minimumInwardDrawAllowing2MmAtFarEndMm':draw,
    'inwardTipAfterClearDrawQmm':draw_tip,
    'beyondOrdinaryFinishedFaceAtFullDrawMm':draw_tip-room_q,
    'separateInternalRetainerToolDatum':'Gedore 6134010, 17 mm AF socket 24 mm OD × 39.5 mm. 1/2 inch extension stays on extraction axis. Fastener torque and positive captive keeper are to be qualified.',
    'receiverSocketGeometryWith10MmDiametralSettingMm':34,
    'ferruleTopNutTool':'Gedore 3300501, 36 mm AF, Ø50 mm × 58 mm.',
    'ferruleSocketWhenEngagedZLimitsMm':[band_top+15,band_top+15+58],
    'ferruleSocketTopLifted25MmZmm':band_top+15+58+25,
    'netZReserveAfter25MmSocketLiftBeforeDriveMm':
        (band_top+rise['netAfterSettingsMm'])-(band_top+15+58+25),
    'movingPinDiameterWith10MmDiametralSettingMm':pin_d+10,
    'clearRoomSideAccessSlotXandZmm':[68,58],
    'unobstructedCandidatePassageStartQAndEndQmm':[q_opening,500],
    'scope':'Provide a removable enclosure independent of the wall and fire return. Check the seated operator reach, unloaded withdrawal and rated hatch in the built-up assembly.',
}
assert slot_z<pin_d+2*35  # Adverse historical vertical guide cannot be borrowed.
assert min(access['clearRoomSideAccessSlotXandZmm'])>pin_d+10
assert draw_tip<access['unobstructedCandidatePassageStartQAndEndQmm'][-1]

result = {
    'sourceSHA256':{n:sha256(b).hexdigest() for n,b in zip(sources,raw)},
    'axisAndIndependentLoadPaths':{
        'roofSeatXYmm':[[x,roof_y] for x in north_seats],
        'fixedOrdinarySeatXmm':x_fixed,'movingOrdinarySeatXmm':x_moving,
        'oldStrippedUpliftWitnessKN':lift,'oldSeparateGravityEachSeatKN':gravity,
        'oldSeparateFacadeNormalWitnessPerReturnKN':normal,
        'explicitLoadsSeparate':True,
        'route':'Movable roof tongue and slot into fixed pin and box; separate compression-only sliding sole below; Y guide pads on their own fixed axles, separately developed into the box. The fixed band joins the shifted separate wall rods.',
    },
    'movementAndEnvelope':{
        'sameSectorThermalStrain':stem,'movingOrdinarySeatFreeXmm':thermal_moving,
        'largestOnThatFaceWithChosenFixedPointXmm':thermal_far,
        'hypotheticalOrthogonalSeamRelativeMm':fixed['segmentMovementComparison']['relativeVectorWithOneAsymmetricNorthernAlongArmMm'],
        'ordinaryMovingSlotXandZFreeDimensionsMm':[slot_x,slot_z],
        'pinDiameterMm':pin_d,
        'relaxedXHalfStrokeAtZeroVerticalOffsetMm':(slot_x-pin_d)/2,
        'XHalfStrokeAtFullVerticalEccentricityMm':usable_x_at_vertical_limit,
        'ZHalfClearanceMm':relative_z,'setpointXAndEndRunningAllowanceMm':[set_x,reserve_x],
        'worstOnFaceResidualXAtFullVerticalEccentricityMm':usable_x_at_vertical_limit-thermal_far-set_x-reserve_x,
        'historical35MmEachWayNeedsAtLeast98MmSlotBeforeLigaments':pin_d+70,
        'hardwareLowestAndHighestZmm':[band_top,top_lug_z],
        'additionalRoofDatumMm':stage_z,
        'netAvailabilityAtGoverningBareHipMm':rise['netAfterSettingsMm'],
        'residualBeyondHardwareAfterSettingsMm':rise['netAfterSettingsMm']-70,
    },
    'compressionOnly':{
        'fixedAndMovingPadsXYmm':[fixed_pad,moving_pad],
        'contactAtDeclaredXMovementMm2':p_area,
        'oldGravityMeanPressureMPa':gravity*1000/p_area,
        'knownSeparateContact':True,
        'scope':'Compress the central sole alone. Pad material, creep/wear, action coupling, true flatness, rotation and axial friction need rating in the actual assembly.',
    },
    'independentNormal':{
        'stationsEachSideFromShoeXMm':[-70,70],
        'guideTargetsRelativeToBandCentreYMm':[-52,52],
        'reservedFaceEachXByZmm':[24,20],
        'scope':'Side guides carry reversible Y without crediting the uplift-pin cheeks. Develop attachment, travel, actual normal action and friction into the same band.',
    },
    'pinAndTongueUnderSeparateOldUplift':{
        'pinZmm':pin_z,'pinFullLengthMm':pin_full_len,'cheekCentreYOffsetsMm':fork_centres,
        'cheekAndTongueThicknessMm':[cheek,tongue],
        'outsideOfCheekNominalYmm':span+cheek,
        'lowerUpperClearLigamentsMm':[lower_ligament,upper_ligament],
        'pinIdealAverageDoubleShearMPa':pin_shear,
        'pinFiniteLoadingElasticBendingMPa':pin_bending,
        'pinGrossCombinedVonMisesComparisonMPa':von_mises,
        'pinPointLoadUpperDeflectionMm':force*span**3/(48*steel_e*pin_i),
        'slottedWebProjectedPinBearingMPa':force/(tongue*pin_d),
        'eachCheekProjectedPinBearingMPa':force/(2*cheek*pin_d),
        'meanTwoLowerLigamentShearMPa':pullout_shear,
        'conditionalS355ProofComparatorMPa':f355,
        'scope':'Requires a real graded plain pin and bearing qualification, milled shape, edge condition, stiffened base, retention, friction and the separate X fixed-seat forces.',
    },
    'movingRoofHeaderComparison':moving_header,
    'fixedBoxLoadSpread':webs,'throughBandFerrules':ferrule,'operatorRoute':access,
}
def svg():
    out = ['<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="680" viewBox="0 0 1200 680" role="img" aria-label="North bearing pin and band ferrule positions">',
           '<rect width="1200" height="680" fill="#fffdf8"/>',
           '<g font-family="DejaVu Sans, Arial, sans-serif" fill="#22323a">']
    navy, rust, green = '#226084','#9a4c3a','#527a54'

    def label(x,y,content,size=17,color='#22323a'):
        out.append(f'<text x="{x}" y="{y}" font-size="{size}" fill="{color}">{content}</text>')

    def line(x1,y1,x2,y2,color,weight=2,dash=False):
        extra = ' stroke-dasharray="6 4"' if dash else ''
        out.append(f'<path d="M{x1:.2f} {y1:.2f} L{x2:.2f} {y2:.2f}" fill="none" stroke="{color}" stroke-width="{weight}"{extra}/>')

    label(38,48,'NORTH ROOF / INDEPENDENT BEARING, RETENTION AND WALL TIE',24)
    label(38,76,'West shown along the band • ordinary seating stations retained • Z datums in millimetres',16)
    line(38,98,1162,98,'#829093')
    label(38,132,'A / LONGITUDINAL SECTION ALONG Y11667.5')
    zx = lambda x: 110+1.47*(x-4300)
    zz = lambda z: 480-1.06*(z-6540)
    xa, xb = zx(4285),zx(4745)
    out.append(f'<rect x="{xa:.2f}" y="{zz(band_top):.2f}" width="{xb-xa:.2f}" height="{zz(band_bottom)-zz(band_top):.2f}" fill="#ebe5da" stroke="#746653"/>')
    sleeve_x = tie_axes[0][0]
    out.append(f'<rect x="{zx(sleeve_x-20):.2f}" y="{zz(band_top):.2f}" width="{1.47*40:.2f}" height="{1.06*120:.2f}" fill="none" stroke="{rust}" stroke-width="2"/>')
    line(zx(sleeve_x),zz(6530),zx(sleeve_x),zz(band_top+40),rust,5)
    line(zx(sleeve_x-30),zz(band_top+7),zx(sleeve_x+30),zz(band_top+7),rust,7)
    for x in (x_fixed-24,x_fixed+24):
        line(zx(x),zz(band_bottom+20),zx(x),zz(band_top-20),navy,6)
    out.append(f'<rect x="{zx(x_fixed-55):.2f}" y="{zz(6680):.2f}" width="{1.47*110:.2f}" height="{1.06*8:.2f}" fill="{green}"/>')
    line(zx(x_fixed),zz(6680),zx(x_fixed),zz(top_lug_z),navy,4)
    out.append(f'<circle cx="{zx(x_fixed):.2f}" cy="{zz(pin_z):.2f}" r="{1.47*pin_d/2:.2f}" fill="{navy}" stroke="#fffdf8" stroke-width="2"/>')
    line(xa,zz(6784.75801),zx(4570),zz(6784.75801),'#8a8a87',1.5,True)
    out.append(f'<rect x="{zx(x_fixed-50):.2f}" y="{zz(rail_underside):.2f}" width="{1.47*100:.2f}" height="{zz(header_lower)-zz(rail_underside):.2f}" fill="none" stroke="{navy}" stroke-width="2"/>')
    for x in (x_fixed-post_offset_x,x_fixed+post_offset_x):
        line(zx(x),zz(top_lug_z),zx(x),zz(header_lower),navy,3)
    label(595,177,'Raised rail underside Z6810',14,navy)
    label(411,268,'Moving header and posts',15,navy)
    label(101,510,'X4340')
    label(671,510,'X4700')
    label(52,277,'Ø40/32 ferrule and M24 rod')
    label(439,379,'360 mm X offset',16)
    label(83,206,'Bare hip reference at its own cut',15)
    label(224,549,'Z6540–6660 fixed band',17)
    label(631,549,'Two internal webs under the shoe',15,navy)
    label(631,571,'Central compression sole in green',15,green)

    label(863,132,'B / MOVING SHOE AT X7300',17)
    mid_x,mid_y = 1010.,258.
    out.append('<rect x="897" y="189" width="226" height="147" fill="#ecf0ee" stroke="#648070"/>')
    out.append(f'<rect x="{mid_x-slot_x*1.5:.2f}" y="{mid_y-slot_z*1.5:.2f}" width="{3*slot_x:.2f}" height="{3*slot_z:.2f}" rx="{1.5*slot_z:.2f}" fill="#fffdf8" stroke="{navy}" stroke-width="2"/>')
    out.append(f'<circle cx="{mid_x:.2f}" cy="{mid_y:.2f}" r="{1.5*pin_d:.2f}" fill="{navy}"/>')
    label(875,367,'Ø28 pin · slot 60 X × 34 Z',16)
    label(875,392,'±13 mm X with ±3 mm Z',16)
    label(875,432,'Roomward pin draw 86 mm',15)
    label(875,454,'Clear access mouth 68 × 58',15)
    line(38,598,1162,598,'#829093')
    label(38,631,'Pin withdrawal is unloaded. Sole takes gravity. Separate guides take normal action. No enclosure rating or joined load replay.',15)
    out.append('</g></svg>')
    return '\n'.join(out)


print(svg() if '--svg' in argv else json.dumps(result,indent=2))
