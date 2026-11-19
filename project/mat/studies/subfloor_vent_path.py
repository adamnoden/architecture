"""Finite free-air reservations below the suspended-floor comparison."""
from itertools import pairwise
from math import hypot, radians, sin


def rect(xywh):
    x, y, w, h = xywh
    return x, y, x + w, y + h


def upper_components(shell, obstacles, width, probes):
    """Rectilinear centre-space for a moving width-square. Edges must have positive length."""
    half = width / 2
    inner = (half, shell - half)
    boxes = [(x0 - half, y0 - half, x1 + half, y1 + half) for x0, y0, x1, y1 in obstacles]
    axes = [sorted({*inner, *(v for box in boxes for v in box[i::2] if inner[0] < v < inner[1])})
            for i in (0, 1)]
    xs, ys = axes
    free = {(i, j) for i, (x0, x1) in enumerate(pairwise(xs)) for j, (y0, y1) in enumerate(pairwise(ys))
            if not any(a < (x0 + x1) / 2 < c and b < (y0 + y1) / 2 < d for a, b, c, d in boxes)}
    groups = []
    while free:
        group = set()
        pending = [free.pop()]
        while pending:
            i, j = pending.pop()
            group.add((i, j))
            for other in ((i - 1, j), (i + 1, j), (i, j - 1), (i, j + 1)):
                if other in free:
                    free.remove(other)
                    pending.append(other)
        groups.append(sorted(name for name, (x, y) in probes.items()
                             if not any(a <= x <= c and b <= y <= d for a, b, c, d in boxes)
                             and any(xs[i] <= x <= xs[i+1] and ys[j] <= y <= ys[j+1] for i, j in group)))
    return sorted(groups)


def moving_bounds(rwt, x1):
    """Enclose every authored 0–90 degree pose and every allowed eastward displacement."""
    anchor_x, anchor_y, anchor_z = rwt['geometry']['axisAnchor']
    fall = rwt['geometry']['fall']
    movement = rwt['renewal']['translation']
    lock = min(rwt['positiveLockReference']['crownCases'], key=lambda case: case['playDegrees'])
    allowance = lock['allowancePerCoordinateMm']
    bounds = {}
    for body in rwt['completeAngularProof']['sweeps']:
        x, y, z = body['angular']
        assert [axis['axis'] for axis in (x, y, z)] == ['X', 'Y', 'Z']
        extrema = ('minimum', 'maximum')
        # Distance to the sloped rotation axis cannot exceed distance to its point at the same X.
        radius = hypot(max(abs(y[t] - anchor_y) for t in extrema),
                       max(abs(z[t] - (anchor_z - (x[u] - anchor_x) * fall)) for t in extrema for u in extrema))
        chord = 2 * radius * sin(radians(lock['playDegrees']) / 2)
        west = x['minimum'] - allowance - chord
        bounds[body['id']] = {'earliestX_mm': west, 'canReachCrossingFromWest': west <= x1,
                               'conservativeBottom_mm': z['minimum'] - movement * fall - allowance - chord}
    return bounds


def compare_path(control, had, grid, rwt, vent, void):
    x0, x1 = control['crossingBandX_mm']
    y0, y1 = control['crossExtentY_mm']
    bottom, top = control['lowerZ_mm']
    width = x1 - x0
    half = width / 2
    shell = vent['shell_mm']
    court = rect(had['model']['court'])
    loggia = rect(had['model']['loggia']['clear'])
    outside = rect(had['passage']['outdoor'])
    wet_south, wet_north = had['renewal']['outboardTrackClearY']
    sweep = (court[2], wet_south, shell, wet_north)
    shafts = []
    for head in grid['heads']:
        x, y = head['xy']
        radius = head['shaftDiameter'] / 2
        shafts.append((x - radius, y - radius, x + radius, y + radius))
    probes = {}
    for band in vent['opposedBands']:
        _, a, _, b = band['planXYXY_mm']
        assert width == b - a
        for side, x in [('W', half), ('E', shell - half)]:
            probes[band['id'] + side] = (x, (a + b) / 2)
    probes['lowerSouth'] = ((x0 + x1) / 2, y0 + half)
    probes['lowerNorth'] = ((x0 + x1) / 2, y1 - half)
    obstacles = [court, loggia, outside, sweep, *shafts]
    groups = upper_components(shell, obstacles, width, probes)
    # Verify the actual upper legs shown on the plan, including their elbows.
    front, rear = vent['opposedBands']
    wx, front_y0, _, front_y1 = front['planXYXY_mm']
    _, rear_y0, ex, rear_y1 = rear['planXYXY_mm']
    upper_legs = [(wx, front_y0, x1, front_y1), (x0, front_y0, x1, y0 + width),
                  (x0, y1 - width, x1, rear_y1), (x0, rear_y0, ex, rear_y1)]
    clear_legs = all(min(c, bx1) <= max(a, bx0) or min(d, by1) <= max(b, by0)
                     for a, b, c, d in upper_legs for bx0, by0, bx1, by1 in obstacles)
    joins = [group for group in groups if 'lowerNorth' in group or 'lowerSouth' in group]
    mouths_join = len(joins) == 2 and set().union(*map(set, joins)) == set(probes)
    gallery = had['bridge']['permanentDryGalleryClearX']
    post = rwt['postTranslation']
    shaft_gap = min(hypot(max(a-x1, x0-c, 0), max(b-y1, y0-d, 0)) for a, b, c, d in shafts)
    post_gap = min(max(x0-x, x-x1, 0) - post['actualPostSection'][0] / 2 for x in post['supportX'])
    bank_span = rwt['lowerTrackReference']['bankSpanComparison']['bankX']
    # The deeper bare replacement rail is confined to the outboard bank span.
    assert x1 < bank_span[0]
    track = rwt['lowerTrackReference']['loweredTrack']
    anchor_x, _, anchor_z = rwt['geometry']['axisAnchor']
    rail_top = anchor_z - (x1 - anchor_x) * track['travelFall'] - track['railTopBelowAxis']
    deflection = rwt['lowerTrackReference']['fixedSupport']['isolatedExistingSizeReference']['deflectionAlreadyAllowedPerFace']
    rail_bottom = rail_top - track['cap'][1] - track['trackSection'][0] - deflection
    clip = track['clipSection']
    movement_allowance = rwt['spatialStateProof']['rigidEnvelope'] + rwt['spatialStateProof']['deformationEnvelope']
    keeper_bottom = rail_top - track['cap'][1] - clip['underCapClearance'] - clip['keeperToeThickness'] - movement_allowance
    frame = rwt['nominalSpoolLoads']['frame']
    frame_bottom = anchor_z - (x1 - anchor_x) * track['travelFall'] - frame['pipeAxisAboveFrameTop'] - frame['depth'] - movement_allowance
    moving = moving_bounds(rwt, x1)
    overhead = min(void['clearanceCases']['separateFullWaterTrackComparison']['bottomZ_mm'],
                   rail_bottom, keeper_bottom, frame_bottom,
                   *(row['conservativeBottom_mm'] for row in moving.values() if row['canReachCrossingFromWest']))
    upper_low, upper_high = vent['control']['z_mm']
    ground = void['effectiveStressDatum_mm']
    fits = (x0 >= gallery[0] and x1 <= gallery[1] and shaft_gap > 0 and post_gap > 0
            and y0 + width < wet_south and y1 - width > wet_north and top < upper_low
            and top - bottom >= upper_high - upper_low and ground < bottom and top < overhead
            and vent['undersideReserve_mm'] > 0 and track['trackX'][0] <= x0 < x1 <= track['trackX'][1])
    return {'control': control, 'outboardBankSpanX_mm': bank_span, 'excludedXYWH_mm': [had['model']['court'], had['model']['loggia']['clear'], had['passage']['outdoor']],
            'trackY_mm': [wet_south, wet_north], 'z_mm': [bottom, top], 'width_mm': width,
            'upperProbeGroups': groups, 'upperLegsXYXY_mm': upper_legs, 'drawnUpperLegsClear': clear_legs,
            'twoUpperGroupsJoinedByLowerReservation': fits and mouths_join and clear_legs,
            'shaftBoxClearance_mm': shaft_gap, 'railPostFaceClearance_mm': post_gap,
            'railBottomWithDeflection_mm': rail_bottom, 'frameAndKeeperBottom_mm': [frame_bottom, keeper_bottom],
            'movingBounds': moving, 'lowerHeadroomBeyondPath_mm': overhead - top,
            'lowerSoilReserve_mm': bottom - ground,
            'scope': 'Known geometric airspace under the gallery. No liner, duct, air interchange, installed screens, footing, '
                     'plinth, handling hardware, physical drainage, threshold-seat coverage or verified air delivery to every bay.'}
