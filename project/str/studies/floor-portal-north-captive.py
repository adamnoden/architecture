"""Geometry, gross supports and static balance at the north hold-down transfer."""
from hashlib import sha256
from math import pi, sqrt
from pathlib import Path
from sys import argv
import json


root = Path(argv[1])
sources = [
    'project/str/studies/floor-portal-north-transfer.json',
    'project/str/studies/current-house-grid.json',
    'project/str/studies/open-loggia-support.json',
    'project/had/studies/open-north-loggia.json',
    'project/mat/studies/loggia-soffit.json',
]
raw = [(root / name).read_bytes() for name in sources]
north, grid, loggia, house, soffit = map(json.loads, raw)
transfer = north['offsetTransferComparison']
comparison = transfer['shortTransfer']
bars = comparison['floorCoupleBarTrial']
uplift = transfer['historicStrippedNorthPadReferenceUpliftKN']
force = comparison['forcePairKNAt130MmCoupleArm']
outboard = transfer['coordinateWitness']['roofBandCentreYmm']
inboard = transfer['coordinateWitness']['groundReturnYmm']
min_y, max_y = comparison['minimumBodyYmm']
bottom, top = bars['minimumBodyBottomTopZmm']
lo, hi = bars['centreLevelsZmm']
r = (hi - lo) / 2
centre_cover = bars['centreFromFaceWithLinkCoverAndSettingMm']
outer_raw_room = max_y - outboard
floor_finish = transfer['coordinateWitness']['floorLinkDatumZmm'] + 80
slab_cover_max = 15
bearing_hole_radius = 18
vertical_package = [12, 8, 19]
stack = sum(vertical_package)
crown = 1000 * (loggia['north_arches']['hinge_z'] + loggia['north_arches']['rise']
                + loggia['north_arches']['Ro'] - loggia['north_arches']['Rm'])
pier = next(row['piers'] for row in house.values() if isinstance(row, dict) and 'piers' in row
            and 'gardenNS' in row['piers'])
x = north['northSupportAxesXmm'][0]
outboard_head = [x, outboard]
inboard_head = [x, inboard]
bar_axes_x = [x + dx for dx in bars['barXOffsetsFromBothNorthAxesMm']]

def gross_contact(plate_x, plate_y):
    area = plate_x * plate_y - pi * bearing_hole_radius**2
    resultant = sqrt(uplift**2 + force**2)
    projected_area = area * uplift / resultant
    return {
        'grossPlatePlanXYmm': [plate_x, plate_y],
        'oneDiagonalStrutGrossProjectedDemandMPa': resultant * 1000 / projected_area,
        'oneDiagonalResultantKN': resultant,
        'oneDiagonalScope': 'Lumped plate footprint projected normal to a 130 by 137.5 force path; no load-spreading or strut confinement is credited.',
        'assumingUniformNetContactDemandMPa': uplift * 1000 / area,
        'grossSideGapToNearestH12After10SettingMm': min(abs(bx - x) for bx in bar_axes_x) - plate_x/2 - 6 - 10,
        'longitudinalEdgeReserveAtOutboardAfter10SettingMm': outer_raw_room - plate_y/2 - 10,
    }

literal_left, literal_right = pier['westEW']
lower_y0, lower_y1 = pier['gardenNS']
big_plate = gross_contact(120, 72)
small_plate = gross_contact(70, 72)
# A flush larger capture moves the contact surface up into the 218 mm body.
vertical_bar_gap_recessed = lo - (bottom + stack) - 6
pocket_opening_x = 120 + 20
pocket_opening_y = 72 + 20
lower_left_margin = x - pocket_opening_x/2 - literal_left
pocket_gross_area = pocket_opening_x * pocket_opening_y
pier_gross_area = (literal_right - literal_left) * (lower_y1 - lower_y0)
assert vertical_bar_gap_recessed < 0
assert small_plate['grossSideGapToNearestH12After10SettingMm'] == 2
assert abs(max_y - outboard - centre_cover - 2) < 1e-9

foundations = {row['id']: row for row in grid['heads']}
triangles = []
for side, row in zip(['outer-NW', 'outer-NE'], north['candidateFloorCollectorToPerpendicularReturn']['returns']):
    near_id = row['nearestEndHead']
    inward_id = row['simpleLongitudinalLeverOnly']['otherHead']
    branch_ids = [entry['id'] for entry in grid['girders'][side]['heads']]
    outer_id = branch_ids[-2] if side == 'outer-NW' else branch_ids[1]
    ids = [near_id, inward_id, outer_id]
    (ox, oy), (ix, iy), (ax, ay) = [foundations[n]['xy'] for n in ids]
    px, py = row['returnSleeveCandidateXYmm']
    assert ix == ox and ay == oy
    r_y = (py - oy) / (iy - oy)
    r_x = (px - ox) / (ax - ox)
    weights = [1 - r_y - r_x, r_y, r_x]
    assert min(weights) > 0 and abs(sum(weights)-1) < 1e-12
    stages = []
    for signed_action in (-uplift, uplift):
        values = [weight * signed_action for weight in weights]
        support_mx = sum(f * (foundations[n]['xy'][1] - oy) / 1000 for n, f in zip(ids, values))
        support_my = -sum(f * (foundations[n]['xy'][0] - ox) / 1000 for n, f in zip(ids, values))
        target = [signed_action, signed_action * (py - oy) / 1000, -signed_action * (px - ox) / 1000]
        residuals = [a - b for a, b in zip([sum(values), support_mx, support_my], target)]
        assert max(map(abs, residuals)) < 1e-9
        stages.append({'referenceVKNandMxMyKNm': target,
                       'signedSupportVKN': dict(zip(ids, values)), 'forceAndMomentResiduals': residuals})
    triangles.append({
        'pointXYmm': [px, py], 'referenceOriginAtCentreHeadXYmm': [ox, oy],
        'signedConservationChecks': stages,
        'verticalOnlyUpliftFractions': dict(zip(ids, weights)),
        'referenceUpliftKN': dict(zip(ids, [f * uplift for f in weights])),
        'xBranchMaxPointMomentKNmAtReference': uplift * r_x * (abs(ax-ox)-abs(px-ox))/1000,
        'yBranchMaxPointMomentKNmAtReference': uplift * r_y * (abs(iy-oy)-abs(py-oy))/1000,
        'assumesPositiveAnchorageAtAllThreeHeads': True,
    })

def segment_distance(a, b, c, d):
    def diff(x, y):
        return tuple(v - w for v, w in zip(x, y))

    def dot(x, y):
        return sum(v * w for v, w in zip(x, y))

    def unit(value):
        return max(0, min(1, value))

    u, v, w = diff(b, a), diff(d, c), diff(a, c)
    uu, uv, vv, uw, vw = dot(u, u), dot(u, v), dot(v, v), dot(u, w), dot(v, w)
    candidates = [(0., unit(vw/vv)), (1., unit((vw+uv)/vv)),
                  (unit(-uw/uu), 0.), (unit((uv-uw)/uu), 1.)]
    det = uu*vv - uv*uv
    if det > 1e-8:
        e, f = (uv*vw-vv*uw)/det, (uu*vw-uv*uw)/det
        if 0 <= e <= 1 and 0 <= f <= 1:
            candidates.append((e, f))
    return min(sqrt(sum((t + e * q - f * r)**2 for t, q, r in zip(w, u, v)))
               for e, f in candidates)


historic_profile = next(row for row in loggia['cap']['named_starter_profiles']
                        if row['id'] == 'loggia-NW-lowreceiver')
current_p25 = foundations['P25']['xy']
profile_shift = [a-b for a, b in zip(current_p25, historic_profile['xy'])]
assert profile_shift == [0, -32.5]
shifted_starters = [(starter['id'],
                     [(px + profile_shift[0], py + profile_shift[1], pz) for px, py, pz in starter['points']])
                    for starter in historic_profile['starters']]

def cap_sleeve_clearance(px, end_z):
    p = (px, inboard, -180.)
    q = (px, inboard, end_z)
    return min((segment_distance(p, q, v, w), starter_id)
               for starter_id, pts in shifted_starters
               for v, w in zip(pts, pts[1:]))

center_distance, center_bar = cap_sleeve_clearance(x, -300)
max_x_shift = int(north['straightSleeveGeometricControl']['includingSetting']['maxOffsetAtUpperCoreMm'])
max_witness = max((cap_sleeve_clearance(x + dx, -400)[0], dx)
                  for dx in range(-max_x_shift, max_x_shift + 1))
between_sample_bound = .5
starter_arc_chord_allowance = .05
max_continuous_clearance = max_witness[0] + between_sample_bound + starter_arc_chord_allowance - 16 - 11
assert center_distance < 16 + 11 and max_continuous_clearance < 10
vertical_sleeve = {
    'olderStarterCentreXYmm': historic_profile['xy'],
    'currentP25CentreXYmm': current_p25,
    'referenceTranslationXYmm': profile_shift,
    'centralSleeveZExtentsMm': [-300, -180],
    'centrelineDistanceMm': center_distance, 'nearestOldStarterId': center_bar,
    'centralSleeveBareClearanceMm': center_distance - 16 - 11,
    'sleeveDepthControlZmm': -400,
    'maxLocalShiftEitherSideMm': max_x_shift,
    'maximumSampleCentrelineDistanceMm': max_witness[0],
    'XShiftAtMaximumSampleDistanceMm': max_witness[1],
    'maximumContinuousBareClearanceBoundMm': max_continuous_clearance,
    'chordEnvelopeAllowanceMm': starter_arc_chord_allowance,
    'maximumContinuousClearanceAfter10SettingMm': max_continuous_clearance - 10,
    'assessment': 'Translated historical H22 starter lines only. The central 120 mm embedment hits an old starter. All same-Y shifts permitted in the 140 mm core fail the 10 mm relative setting screen at 220 mm embedment. Do not treat the translated cage as current structure.'
}
flat = soffit['section']['flat']
trial_half_width = bars['minimumLocalWidthXmmBeforeSleeveHead'] / 2
flat_gap_x = flat[0] - (x + trial_half_width)
flat_gap_y = min_y - (flat[1] + flat[3])
assert flat_gap_x > 0 and flat_gap_y > 0
local_depths = []
for depth in (218, 230, 245):
    local_bottom = top - depth
    bare_clash = lo - 6 - (local_bottom + stack)
    usable = bare_clash - 10
    local_depths.append({
        'trialDepthMm': depth, 'newLocalSoffitZmm': local_bottom,
        'localSoffitDropBelowOrdinarySlabMm': soffit['section']['slabZ'][0] - local_bottom,
        'clearToClosestBottomH12After10SettingMm': usable,
        'lowerRecessHardwareCrownComparatorClearanceMm': local_bottom - crown,
        'availableToolHeightBeyondStackIfAccessUsesSameCavityMm': 0,
        'planClearanceToFlatSoffitMm': [flat_gap_x, flat_gap_y],
    })
assert [r['clearToClosestBottomH12After10SettingMm'] for r in local_depths] == [-11., 1., 16.]
output = {
    'sourceHashes': {n: sha256(b).hexdigest() for n,b in zip(sources,raw)},
    'frozenOldNorthUpliftReferenceKN': uplift,
    'outerUBar': {
        'pairedBarAxesXmmAtWest': bar_axes_x,
        'circleCentreYZmm': [outboard-r, (lo+hi)/2],
        'outerTangentYmm': outboard,
        'bendCentrelineRadiusMm': r,
        'arcTopBottomZmm': [hi, lo],
        'spareOuterCoverBeyondScreenMm': outer_raw_room - centre_cover,
        'sameForcePairKN': force,
        'barStressAtEqualShareMPa': force * 1000 / (2 * pi * 6**2),
        'minimumBondTrialPastInboardLoadLineMm': bars['requiredStraightBondLengthBeyondOuterLoadLineAtReferenceMm'],
        'inboardBarTailTargetYmm': inboard - bars['requiredStraightBondLengthBeyondOuterLoadLineAtReferenceMm'],
        'scope': 'Position comparator; the bend mandrel, concrete split/bearing, link leg, manufacturing and node loading path are unqualified.',
    },
    'outerUnderBodyCapture': {
        'rodAxisXYmm': outboard_head, 'plate12Washer8Nut19Only': vertical_package,
        'remainingVerticalToolSpaceAboveCrownComparatorMm': bottom - stack - crown,
        'maxCrownExtradosComparatorZmm': crown,
        'lowerSolidPierWindowXBoundsMm': [literal_left, literal_right],
        'minimumOpeningWithSettingMm': [pocket_opening_x, pocket_opening_y],
        'pierPocketNominalBodyFractionWithinClearanceOpening': pocket_gross_area / pier_gross_area,
        'pierStructuralWestSideMarginAfterOpeningMm': lower_left_margin,
        'belowSlabPierPocketRejected': True,
        'surfacePlate120x72': big_plate,
        'flush120x72ClashesInCageByMm': -vertical_bar_gap_recessed,
        'flush70x72': small_plate,
        'scope': 'Separate end unit. Pocket on the retained compression pier is a geometry cost, contact demand is a gross average and no concrete splitting/bolt/plate capacity is established.',
    },
    'innerOverBodyCapture': {
        'rodAxisXYmm': inboard_head, 'stackTopZmm': top + stack,
        'remainingTo15MmFinishUndersideBeforeToolsMm': floor_finish - slab_cover_max - top - stack,
        'requiresLocalDistributionRecess': True,
    },
    'capLoadPaths': triangles,
    'P25HistoricalStarterCollision': vertical_sleeve,
    'recessedWiderPlateDepthComparisons': local_depths,
    'limits': 'Positive three-head vertical solution only; does not establish actual distribution, stiffness, cap struts, overlapping bar paths, uplift capacity, moisture crossing or foundation response.',
}
if argv[2:] == ['--svg']:
    def py(z):
        return 287 - (z - 3120) * .7

    def sx(y, base):
        return base + (y - 11470) * 1.10

    def size(y0, y1, z0, z1, base, color):
        return f'<rect x="{sx(y0,base):.2f}" y="{py(z1):.2f}" width="{(y1-y0)*1.10:.2f}" height="{py(z0)-py(z1):.2f}" fill="{color}"/>'

    def label(x, y, value):
        return f'<text x="{x}" y="{y}">{value}</text>'

    parts = [
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 815 405" width="815" height="405" role="img" aria-labelledby="title">',
        '<title id="title">Alternative captive hold-down at the north collector</title>',
        '<rect width="815" height="405" fill="#fcfaf2"/>',
        '<g font-family="sans-serif" font-size="14" fill="#18262a">',
        label(31, 31, 'North floor-transfer pocket at the garden pier · Y increases right'),
    ]
    for base, depth in [(32, 218), (425, 245)]:
        shape_bottom = top - depth
        centre_y = outboard-r
        centre_z = (hi+lo)/2
        points = ' '.join(f'{sx(centre_y + dy, base):.2f},{py(centre_z+dz):.2f}'
                          for dy,dz in [(0,r),(39,52),(56,33),(65,0),(56,-33),(39,-52),(0,-r)])
        parts.extend([
            label(base, 60, f"{depth} mm body, {'plate below the collector' if depth == 218 else 'plate held in collector pocket'}"),
            size(min_y,max_y,shape_bottom,top,base,'#d8d4c9'),
            size(lower_y0,lower_y1,3065,shape_bottom,base,'#ebddbc'),
            f'<polyline points="{sx(inboard-15,base):.2f},{py(hi):.2f} {points} {sx(inboard-15,base):.2f},{py(lo):.2f}" fill="none" stroke="#15516e" stroke-width="3"/>',
            size(outboard-36,outboard+36,shape_bottom-stack if depth==218 else shape_bottom,
                 shape_bottom if depth==218 else shape_bottom+stack,base,'#b65542'),
            size(inboard-16,inboard+16,top,top+stack,base,'#36686b'),
            label(base, 351, 'Red: outer bearing and nut package'),
            label(base, 374, 'Blue: bar centreline; green: upper capture'),
        ])
    parts.append('</g></svg>')
    print('\n'.join(parts))
elif argv[2:]:
    raise SystemExit('Expected root path, optionally followed by --svg')
else:
    print(json.dumps(output, indent=2))
