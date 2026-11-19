"""Compare located north uplift routes with the raised roof and fixed band."""
from hashlib import sha256
import json
from math import atan, degrees, hypot, pi
from pathlib import Path
import sys


ROOT = Path(sys.argv[1]).resolve()
SOURCES = (
    'project/had/studies/open-north-loggia.json',
    'project/str/studies/open-loggia-support.json',
    'project/str/studies/reconciled-house-interface.json',
    'project/str/studies/current-house-welded-heel.json',
    'project/str/studies/current-house-welded-network.json',
    'project/str/studies/current-house-grid.json',
    'project/str/studies/current-house-floor-closure.json',
    'project/str/studies/floor-portal-fixed-wall-head.json',
)
raw = {name: (ROOT / name).read_bytes() for name in SOURCES}
had, support, portal, heel, roof, ground, closure, roof_trial = [json.loads(raw[name]) for name in SOURCES]
arch = support['north_arches']
pier = next(row['piers'] for row in had.values() if isinstance(row, dict) and 'piers' in row
            and 'gardenNS' in row['piers'])
world_y = pier['gardenNS']
q_min, q_max = portal['jambAndTies']['ordinaryWallCoreQ']
upper = [12000 - q_max, 12000 - q_min]
old_bore_nr = arch['tie_and_bore']
bore_y = world_y[0] + old_bore_nr['bore_axis_NS']
assert sum(upper) / 2 == bore_y == sum(world_y) / 2 == 11667.5


def sleeve_trial(cover_setting, relative_bore_setting):
    cover = 25.
    sleeve_radius = 16.
    edge = cover + sleeve_radius + cover_setting
    upper_centres = [upper[0] + edge, upper[1] - edge]
    lower_centres = [world_y[0] + edge, world_y[1] - edge]
    bore_exclusion = old_bore_nr['bore_dia'] / 2 + sleeve_radius + relative_bore_setting
    lower_off_bore = [[lower_centres[0], bore_y - bore_exclusion],
                      [bore_y + bore_exclusion, lower_centres[1]]]
    available_offset = upper_centres[1] - bore_y
    assert available_offset < bore_exclusion
    return {'upperCentreIntervalYmm': upper_centres, 'lowerBoreClearIntervalsYmm': lower_off_bore,
            'maxOffsetAtUpperCoreMm': available_offset, 'minOffsetToClearBoreMm': bore_exclusion,
            'straightRouteDeficitMm': bore_exclusion - available_offset}


north = heel['ring']['faces']['outer-north']
west, east = [row['u'] for row in north['supports'] if row['upperLowerType'] == 'existing north pier']
seat_west, seat_east = roof['ordinaryStations']
span_m = (east - west) / 1000
seat_lever = (seat_west - west) / 1000
assert seat_lever == (east - seat_east) / 1000
ordinary = next(row for row in roof['frames'] if row['id'] == 'ordinary')
seat_force = ordinary['actualUniformULS']['RA']
ring_weight_kN_per_m = 1.35 * heel['ring']['section']['lineG']
vertical_each = seat_force + ring_weight_kN_per_m * span_m / 2
swing_lever = (sum(pier['westEW']) / 2 - west) / 1000
assert swing_lever == (east - sum(pier['eastEW']) / 2) / 1000
near_far = portal['jambAndTies']['axes'][1]
other_span = (west - near_far) / 1000
facade_kN_per_m = 2.25 * (6600 - 3370) / 2000
transverse_each = facade_kN_per_m * (span_m + other_span) / 2
assert (span_m, other_span, seat_lever) == (3.245, 1.675, .3225)
relative_settings = 10.
upper_adverse = sleeve_trial(5., relative_settings)
flank_y = upper_adverse['lowerBoreClearIntervalsYmm'][0][1]
local_x, local_y = west - pier['westEW'][0], flank_y - world_y[0]
bar_centre_clearance = min(hypot(local_x - bx, local_y - by) for bx in (39, 173.5) for by in (39, 176))
bar_gap = bar_centre_clearance - 16 - 6 - relative_settings
link_inset = 25 + 4
link_gap = min(local_x - link_inset, local_y - link_inset) - 16 - 4 - relative_settings
assert bar_gap > 6 and link_gap == 2.5
return_y = world_y[0] - 30
walls = next(rows for rows in had.values() if isinstance(rows, list)
             and any(isinstance(row, dict) and row.get('id') == 'loggia-west-weather' for row in rows))
returns = []
for direction, beam in [('west','loggia-W'), ('east','loggia-E')]:
    wall = next(row for row in walls if row['id'] == f'loggia-{direction}-weather')
    assert wall['a'][1] < return_y < wall['b'][1] and wall['holes'] == []
    wall_x = wall['a'][0]
    assert wall_x - wall['structuralCore'][0] == wall['structuralCore'][1] - wall_x == 70.
    g = ground['girders'][beam]
    assert g['extent'][0] < return_y < g['extent'][1]
    head = next(row for row in g['heads'] if row['u'] == g['extent'][1])
    x_d, y_d = abs(wall_x - g['datum']), abs(return_y - head['u'])
    returns.append({'returnSleeveCandidateXYmm': [wall_x, return_y], 'receiverGirder': beam,
                    'nearestEndHead': head['id'], 'girderAxisAndHeadLongitudeMm': [g['datum'], head['u']],
                    'leverComponentsToHeadMm': [x_d, y_d], 'resultantLeverToHeadMm': hypot(x_d, y_d),
                    'directProuteThroughFootUnverified': True})
finished_face = 12000 - roof_trial['existingSection']['roomFinishQmm']
band_z = roof_trial['existingSection']['roofRingZmm']
upper_z = band_z[0]
floor_z = closure['rcEdgeAlternative']['floorTopBottom'][0]
run = upper_z - floor_z
offset = bore_y - return_y
room_cover = 70.
sleeve_radius = 16.
relative_allowance = 10.
finish_lining = 15.
max_projection = finished_face - return_y + sleeve_radius + relative_allowance
finished_envelope = max_projection + finish_lining
assert 0 < max_projection <= room_cover < finished_envelope

north_windows = [r for r in had['openings']['FIRST'] if r['wall'] == 'outer-north']
for row in returns:
    x = row['returnSleeveCandidateXYmm'][0]
    margin = min(abs(r['centre'] - x) - r['width'] / 2 for r in north_windows)
    assert margin > room_cover / 2 + relative_allowance
    row['nearestRawUpperWindowXMarginMm'] = margin
    receiver = ground['girders'][row['receiverGirder']]
    upper_head = receiver['heads'][-1]
    previous = receiver['heads'][-2]
    length = upper_head['u'] - previous['u']
    fraction = (return_y - previous['u']) / length
    row['simpleLongitudinalLeverOnly'] = {
        'spanMm': length, 'otherHead': previous['id'],
        'reactionFractionOtherHead': 1 - fraction, 'reactionFractionNearestHead': fraction,
        'localGirderMomentKNmPerKN': (return_y - previous['u']) * (upper_head['u'] - return_y) / length / 1000,
        'transverseGirderTorsionKNmPerKN': abs(x - receiver['datum']) / 1000,
    }

old_north_pad = next(row for row in closure['lowerPads'] if row['xy'] == [west, bore_y])
uplift_witness = -old_north_pad['strippedAdverse'][0]
for row in returns:
    head = next(entry for entry in ground['heads'] if entry['id'] == row['nearestEndHead'])
    away_x, away_y = row['leverComponentsToHeadMm']
    shaft_margin = head['shaftDiameter'] / 2 - row['resultantLeverToHeadMm'] - sleeve_radius
    cap_margins = [dimension / 2 - away - sleeve_radius for dimension, away
                   in zip(head['capXY'], (away_x, away_y))]
    assert shaft_margin < 0 < min(cap_margins)
    row['footTransfer'] = {
        'nominalBareSleeveToShaftEdgeMarginMm': shaft_margin,
        'bareSleeveToCapEdgesMarginXYmm': cap_margins,
        'grossCapPlanXYmm': head['capXY'], 'shaftDiameterMm': head['shaftDiameter'],
        'momentAboutXKNmAtReferenceUplift': uplift_witness * away_y / 1000,
        'momentAboutYKNmAtReferenceUplift': uplift_witness * away_x / 1000,
        'straightShaftCageEntryFits': False,
    }
leg_force_ratio = hypot(run, offset) / run
roof_rise = next(row for row in roof_trial['raisedRoofOptions'] if row['datumRiseMm'] == 100)
offset_route = {
    'coordinateWitness': {'roofBandCentreYmm': bore_y, 'roofBandBaseZmm': upper_z,
        'floorLinkDatumZmm': floor_z, 'groundReturnYmm': return_y, 'ordinaryFinishedWallYmm': finished_face},
    'historicStrippedNorthPadReferenceUpliftKN': uplift_witness,
    'shortTransfer': {
        'floorEccentricMomentKNmAtReference': uplift_witness * offset / 1000,
        'forcePairKNAt130MmCoupleArm': uplift_witness * offset / 130,
        'minimumYBodyMmForTwo32ODTerminationsWith25CoverAnd5Setting': offset + 2 * (16 + 25 + 5),
        'minimumBodyYmm': [return_y - 46, bore_y + 46],
        'roomwardFinishingExtentMmIncluding15Lining': finished_face - (return_y - 46) + finish_lining,
    },
    'inclinedTie': {
        'verticalRunMm': run, 'lateralShiftMm': offset, 'normalForceAtEachEndKNPerKNUplift': offset / run,
        'opposingNormalForceAtEachEndAtReferenceKN': uplift_witness * offset / run,
        'axialTieKNAtReference': uplift_witness * leg_force_ratio,
        'globalHorizontalCoupleKNmAtReference': uplift_witness * offset / 1000,
        'roomwardEnvelopeBeyondFinishMm': max_projection,
        'localRemovableCoverDepthTrialMm': room_cover,
        'roomwardFinishedEnvelopeMmIncluding15Lining': finished_envelope,
        'deficitWithin70CoverMm': finished_envelope - room_cover,
        'maximumTieInclinationDegrees': degrees(atan(offset / run)),
        'centreEntersStructuralCoverExclusionAboveFloorMm': run * (1 - upper_adverse['maxOffsetAtUpperCoreMm'] / offset),
    },
    'roofHardwareGrossZoneUnderRaisedHipMm': roof_rise['grossZoneMm'],
    'roofHardwareNetAfterSettingsMm': roof_rise['netAfterSettingsMm'],
    'roofHardware70mmEnvelopeMm': 70.,
    'scope': 'Offset retention and room envelope comparison. The vertical-only girder reactions omit torsion redistribution. The historic reference action is a sizing sensitivity; do not combine it with the roof downward or facade result.',
}
floor_bars = {
    'minimumSlipFreeCoupleArmMm': 130.,
    'trialLongitudinalBarsPerFace': 2,
    'trialBarDiameterMm': 12.,
    'trialLinkDiameterMm': 8.,
    'barCoverScreenMm': 25.,
    'coverSettingMm': 5.,
    'retainedAggregateClearanceComparisonMm': 21.,
}
bar_r = floor_bars['trialBarDiameterMm'] / 2
bar_offset = sleeve_radius + bar_r + relative_allowance + floor_bars['retainedAggregateClearanceComparisonMm']
centre_cover = bar_r + floor_bars['trialLinkDiameterMm'] + floor_bars['barCoverScreenMm'] + floor_bars['coverSettingMm']
half_width = bar_offset + centre_cover
slab_bottom = closure['rcEdgeAlternative']['floorTopBottom'][1]
slab_depth = floor_z - slab_bottom
minimum_depth = 130 + 2 * centre_cover
minimum_bottom = floor_z - minimum_depth
floor_bars['centreLevelsZmm'] = [minimum_bottom + centre_cover, floor_z - centre_cover]
floor_bars['minimumBodyBottomTopZmm'] = [minimum_bottom, floor_z]
floor_bars['minimumDepthMm'] = minimum_depth
floor_bars['centreFromFaceWithLinkCoverAndSettingMm'] = centre_cover
floor_bars['headroomLossIfTopRemainsAtSlabTopMm'] = slab_bottom - minimum_bottom
floor_bars['barXOffsetsFromBothNorthAxesMm'] = [-bar_offset, bar_offset]
floor_bars['minimumLocalWidthXmmBeforeSleeveHead'] = 2 * half_width
floor_bars['extraWidthEachSideOver140HostCoreMm'] = half_width - 70
couple_force = offset_route['shortTransfer']['forcePairKNAt130MmCoupleArm']
bond_trial = 2.1
required_length = couple_force * 1000 / (2 * pi * 12 * bond_trial)
north_edge = offset_route['shortTransfer']['minimumBodyYmm'][1]
available_tail = north_edge - bore_y - (25 + 5)
assert floor_bars['centreLevelsZmm'][1] - floor_bars['centreLevelsZmm'][0] == 130
assert required_length > available_tail
slab_lever = slab_depth - 2 * centre_cover
slab_force = uplift_witness * offset / slab_lever
floor_bars['currentSlabDepthControl'] = {
    'depthMm': slab_depth, 'maximumCoupleArmMm': slab_lever, 'forcePairKN': slab_force,
    'requiredStraightBondLengthAtReferenceMm': slab_force * 1000 / (2 * pi * 12 * bond_trial),
}
floor_bars['poorBondStressTrialMPa'] = bond_trial
floor_bars['requiredStraightBondLengthBeyondOuterLoadLineAtReferenceMm'] = required_length
floor_bars['availableStraightLengthFromOuterLoadLineToCoverPlaneMm'] = available_tail
floor_bars['straightBarsTerminateBeforeDevelopingOuterNode'] = True
floor_bars['scope'] = 'Equilibrium screen. Clearance omits terminal heads, transverse bars and links at the bend. Available length is generously measured from the force line.'
offset_route['shortTransfer']['floorCoupleBarTrial'] = floor_bars
dpc_grid_top = ground['girders']['loggia-W']['z'][1]
assert dpc_grid_top == -180 and ground['girders']['loggia-E']['z'][1] == dpc_grid_top
assert '150 above grid top -180..-30' in support['lower_grid']['masonry_DPC']
offset_route['candidateMoistureCrossing'] = {
    'gridTopZmm': dpc_grid_top,
    'olderOpenLoggiaMineralBandZmm': [dpc_grid_top, dpc_grid_top + 150],
    'candidateSleevePlanOriginsXYmm': [row['returnSleeveCandidateXYmm'] for row in returns],
    'scope': 'Historical geometric crossing only. Resolve the actual warm/cold layout and complete capillary, air and thermal continuity with positive structural connectors.',
}
assert abs(offset_route['shortTransfer']['floorEccentricMomentKNmAtReference'] -
           offset_route['inclinedTie']['opposingNormalForceAtEachEndAtReferenceKN'] * run / 1000) < 1e-10

output = {
    'scope': 'Located northern support controls. The three load components are separate comparisons.',
    'offsetTransferComparison': offset_route,
    'sourcesSHA256': {name: sha256(raw[name]).hexdigest() for name in SOURCES},
    'northSupportAxesXmm': [west, east],
    'downwardRoofSeatAxesXmm': [seat_west, seat_east],
    'eachSourceUniformDownwardSeatKN': seat_force,
    'isolatedBandUniformDoubleSeatPlusWeight': {
        'simpleSpanMm': span_m * 1000, 'roofSeatOffsetIntoBayMm': seat_lever * 1000,
        'momentKNm': seat_force * seat_lever + ring_weight_kN_per_m * span_m**2 / 8,
        'reactionEachPierKN': vertical_each,
        'originalLowerPierCentreOffsetAlongWallMm': swing_lever * 1000,
        'correspondingLocalMomentEachPierKNm': vertical_each * swing_lever,
    },
    'independentOutOfPlaneFacadeHeadShare': {
        'eachSourceFacadeHeadShareKN': transverse_each,
        'isolatedCantileverLeverageToCollectorTopMm': 6600 - 3920,
        'momentIfNoPerpendicularReturnKNm': transverse_each * (6600 - 3920) / 1000,
    },
    'straightSleeveGeometricControl': {
        'upperCoreYmm': upper, 'lowerGardenPierYmm': world_y,
        'lowerBoreAxisYAndZmm': [bore_y, old_bore_nr['bore_axis_z']],
        'lowerBoreODmm': old_bore_nr['bore_dia'], 'trialSleeveODmm': 32,
        'upperSleeveCoverScreenMm': 25, 'relativeSettingsMm': [5, 10],
        'noSetting': sleeve_trial(0., 0.), 'includingSetting': upper_adverse,
        'minimumOneSideCoreWideningMm': upper_adverse['straightRouteDeficitMm'],
        'insideFinishThicknessRemainingIfWidenedByMinimumMm': 27 - upper_adverse['straightRouteDeficitMm'],
        'atMinimumWideningAdverseBoreClearPositionXYInLowerPierMm': [local_x, local_y],
        'lowerH12SurfaceClearAfterSettingsMm': bar_gap,
        'lowerStraightH8LinkClearAfterSettingsMm': link_gap,
    },
    'candidateFloorCollectorToPerpendicularReturn': {
        'planOffsetFromUpperBoreLineMm': bore_y - return_y,
        'eccentricMomentOnTransferKNmPerKN': (bore_y - return_y) / 1000,
        'returns': returns,
    },
}
if sys.argv[2:] == ['--svg']:
    def x(y):
        return 188 + (y - 11430) * .86

    def y(z):
        if z >= upper_z:
            return 165 - (z - upper_z) * .33
        return 165 + (upper_z - z) * .075

    def line(x1, y1, x2, y2, stroke, dashed=False):
        dash = ' stroke-dasharray="5 4"' if dashed else ''
        return f'<line x1="{x1:.2f}" y1="{y1:.2f}" x2="{x2:.2f}" y2="{y2:.2f}" stroke="{stroke}" stroke-width="2"{dash}/>'

    def box(y0, y1, z0, z1, color):
        return f'<rect x="{x(y0):.2f}" y="{y(z1):.2f}" width="{(y1-y0)*.86:.2f}" height="{y(z0)-y(z1):.2f}" fill="{color}"/>'

    def label(x0, y0, value):
        return f'<text x="{x0:.2f}" y="{y0:.2f}" fill="#18262a">{value}</text>'

    g = ground['girders']['loggia-W']
    elements = [
        '<svg xmlns="http://www.w3.org/2000/svg" width="845" height="765" viewBox="0 0 845 765" role="img" aria-labelledby="title">',
        '<title id="title">North retaining routes, at the west loggia return</title>',
        '<rect width="845" height="765" fill="#faf7ee"/>',
        '<g font-family="sans-serif" font-size="14">',
        label(32, 32, 'North retaining routes · X4377.5'), label(32, 57, 'North is to the right. Vertical scale changes at Z6540.'),
        box(bore_y - 110, bore_y + 110, band_z[0], band_z[1], '#79a6a0'),
        box(bore_y - 35, bore_y + 35, band_z[1], band_z[1] + 70, '#d3a658'),
        box(upper[0], upper[1], floor_z, upper_z, '#ddd5bf'),
        box(11430, upper[1], 3170, floor_z, '#8d9287'),
        box(return_y - 46, bore_y + 46, minimum_bottom, floor_z, '#d3a658'),
        line(x(return_y - 36), y(floor_bars['centreLevelsZmm'][0]), x(bore_y + 36), y(floor_bars['centreLevelsZmm'][0]), '#765b07'),
        line(x(return_y - 36), y(floor_bars['centreLevelsZmm'][1]), x(bore_y + 36), y(floor_bars['centreLevelsZmm'][1]), '#765b07'),
        box(return_y - 50, return_y + 40, g['z'][1], 3170, '#ddd5bf'),
        box(world_y[0], world_y[1], g['z'][1], 3170, '#ddd5bf'),
        box(11430, bore_y + 95, g['z'][0], g['z'][1], '#8d9287'),
        box(return_y - 40, return_y + 40, dpc_grid_top, dpc_grid_top + 150, '#bd7caa'),
        line(x(finished_face), y(floor_z), x(finished_face), y(upper_z), '#333333', True),
        line(x(bore_y), y(upper_z), x(bore_y), y(g['z'][1]), '#a53034', True),
        line(x(bore_y), y(upper_z), x(return_y), y(floor_z), '#055186'),
        line(x(bore_y), y(floor_z), x(return_y), y(floor_z), '#765b07'),
        line(x(return_y), y(floor_z), x(return_y), y(g['z'][1]), '#216861'),
        f'<circle cx="{x(bore_y):.2f}" cy="{y(old_bore_nr["bore_axis_z"]):.2f}" r="8" fill="#a53034"/>',
        label(503, 76, '+100 roof raised, 70 mm seat envelope'), label(503, 132, 'Existing 220 × 120 band zone, fixed'),
        label(503, 253, 'Blue: inclined tie and normal endpoint couple'), label(503, 275, 'Dashed black: ordinary interior finish face'),
        label(503, 397, 'Ochre: 218 mm minimum transfer at floor datum'),
        label(503, 494, 'Red: through-route clashes with Ø40 arch bore'),
        label(503, 632, 'Purple: older mineral band, Z−180 to −30'),
        label(503, 657, 'Green: shared lower return for both offset routes'),
        label(503, 680, 'Cap accepts footprint; straight drop misses shaft'),
        label(32, 729, 'Located demand comparison. Retention, cage anchorage and the moisture crossing remain to be joined.'),
        '</g></svg>',
    ]
    print('\n'.join(elements))
elif sys.argv[2:]:
    raise SystemExit('Expected root path, optionally followed by --svg')
else:
    print(json.dumps(output, indent=2))
