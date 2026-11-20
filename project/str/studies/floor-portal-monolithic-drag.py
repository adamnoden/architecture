"""Compare the north L collector against the live port and the full rear cabinet."""
from hashlib import sha256
from itertools import product
from json import dumps, loads
from math import ceil, cos, floor, hypot, isfinite, pi, radians, sin, sqrt, tan
from pathlib import Path
from sys import argv, stdin

from court_tie_starter_paths import segment_distance

SOURCES = (
    'project/str/studies/floor-portal-north-collar.json',
    'project/str/studies/current-house-ground-ties.json',
    'project/str/studies/open-loggia-support.json',
    'project/had/studies/open-north-loggia.json',
    'project/mat/studies/loggia-soffit.json',
    'project/str/studies/current-house-grid.json',
    'project/mat/studies/whole-house-service-baseline.json',
)
AXES_Z = (3206, 3218, 3260, 3284, 3308, 3350, 3362)
DIAMETERS = (12, 12, 20, 28, 20, 12, 12)
STATIONS_V = (338, 440, 542, 644, 746)
EDGE_V = (-70, 930)
RECEIVER_U = 170
BAR_DIAMETER = 20
REFERENCE_MAIN_BAR_SHIFT = 15
MAXIMUM_MAIN_BAR_SHIFT = 20
FORM_SETTING = 5
COVER = 25
PLACING = 21
POOR_BOND_MPA = 2.1
CONCRETE_BUDGET_KN_PER_M3 = 25
ANGLE = radians(62)
BOUND_ROUNDING_MM = 1e-8


def minimum_gap(left, right, combined_radii):
    return min(segment_distance(*p, *q) for p in left for q in right) - combined_radii - FORM_SETTING


def port_clearance(bounds, paths, port_radius):
    low_u, high_u, low_v, high_v = bounds
    if low_u > high_u or low_v > high_v:
        return {'state': 'no-port-territory', 'centreBoundsUVmm': bounds}

    axes = []
    for (au,av,_), (bu,bv,_) in paths:
        du, dv = bu-au, bv-av
        axes.append((au, av, du, dv, 1/(du*du+dv*dv)))

    def clearance(u, v):
        distances = []
        for au, av, du, dv, inverse_squared_length in axes:
            t = max(0, min(1, ((u-au)*du+(v-av)*dv)*inverse_squared_length))
            distances.append(hypot(u-au-t*du, v-av-t*dv))
        return min(distances) - port_radius - BAR_DIAMETER/2 - FORM_SETTING

    count_u, count_v = max(1, ceil(high_u-low_u)), max(1, ceil(high_v-low_v))
    step_u, step_v = (high_u-low_u)/count_u, (high_v-low_v)/count_v
    sample_clearance, u, v = max(
        (clearance(u, v), u, v)
        for u in (low_u+i*step_u for i in range(count_u+1))
        for v in (low_v+j*step_v for j in range(count_v+1))
    )
    interpolation_allowance = hypot(step_u, step_v)/2
    upper_bound = sample_clearance + interpolation_allowance
    if upper_bound < 0:
        state = 'overlap-throughout-territory'
    elif upper_bound < COVER:
        state = 'cover-shortfall-throughout-territory'
    else:
        state = 'cannot-exclude-cover-by-this-bound'
    return {
        'state': state, 'centreBoundsUVmm': bounds, 'barCount': len(axes),
        'bestSampleUVmm': [u, v], 'bestSampleGapMm': sample_clearance,
        'distanceToNearestSampleBoundMm': interpolation_allowance,
        'continuousUpperBoundGapMm': upper_bound, 'requiredCoverMm': COVER,
    }


def finite_number(value):
    return type(value) in (int, float) and isfinite(value)


def native_request(value, retained_port, cabinet):
    required = {'schema', 'portAxisXYMm', 'dragDemandFactor'}
    if not isinstance(value, dict) or not required <= set(value) <= required | {'remoteMainBarShiftMm'}:
        raise ValueError('Expected an explicit versioned north collector case')
    if value['schema'] != 'str-north-collector-native-case/1':
        raise ValueError('Unknown north collector case schema')
    axis, factor = value['portAxisXYMm'], value['dragDemandFactor']
    if not finite_number(factor) or not 0 < factor <= 1:
        raise ValueError('Demand factor must be greater than zero and at most the retained historical demand')
    if not isinstance(axis, list) or len(axis) != 2 or not all(map(finite_number, axis)):
        raise ValueError('Port axis requires two finite XY coordinates in millimetres')
    x, y, width, depth = cabinet
    radius = retained_port[2]/2
    if not (x+radius <= axis[0] <= x+width-radius and y+radius <= axis[1] <= y+depth-radius):
        raise ValueError('The formed port must fit entirely inside the source rear cabinet in this comparison')
    shift = value.get('remoteMainBarShiftMm', REFERENCE_MAIN_BAR_SHIFT)
    if not finite_number(shift) or not 0 <= shift <= MAXIMUM_MAIN_BAR_SHIFT:
        raise ValueError('Remote main bar shift must be between zero and 20 mm')
    return axis, factor, shift


def main_bar_axes(outer, shift):
    dpc = outer['DPC']
    corner_block = next(block for block in dpc['threeThickBlocksPlanLocal'] if block[:2] == [0, 0])
    offset = corner_block[2]/2
    toe_blocks = [block for block in dpc['threeThickBlocksPlanLocal'] if block is not corner_block]
    toe_start = min(max(block[:2]) for block in toe_blocks)
    axes = []
    for x, y in outer['primaryBarXY']:
        legacy = (x-offset, y-offset)
        upper = (legacy[0] + (shift if y >= toe_start else 0), legacy[1] + (shift if x >= toe_start else 0))
        axes.append({'id': f'H20-{x:g}-{y:g}', 'legacyBlindBoreXYMm': legacy, 'upperBarXYMm': upper,
                     'axisOffsetMm': hypot(upper[0]-legacy[0], upper[1]-legacy[1])})
    return axes


def rectangle_cells(rectangles, support=()):
    all_rectangles = [*rectangles, *support]
    cuts_x = sorted({coordinate for left, _, right, _ in all_rectangles for coordinate in (left, right)})
    cuts_y = sorted({coordinate for _, bottom, _, top in all_rectangles for coordinate in (bottom, top)})

    def contains(rects, x, y):
        return any(left < x < right and bottom < y < top for left, bottom, right, top in rects)

    for x0, x1 in zip(cuts_x, cuts_x[1:]):
        for y0, y1 in zip(cuts_y, cuts_y[1:]):
            x, y = (x0+x1)/2, (y0+y1)/2
            if contains(rectangles, x, y) and not contains(support, x, y):
                yield (x1-x0)*(y1-y0), x, y


def rectangle_area(rectangles, support=()):
    return sum(area for area, _, _ in rectangle_cells(rectangles, support))


def load_wrench(contacts, origin):
    rows = []
    for contact in contacts:
        x, y, z = (value-origin[i] for i, value in enumerate(contact['centreXYZMm']))
        fx, fy, fz = contact['forceKN']
        rows.append((fx, fy, fz, (y*fz-z*fy)/1000, (z*fx-x*fz)/1000, (x*fy-y*fx)/1000))
    return [sum(column) for column in zip(*rows)]


def key_load_path(blocks, width, end, plate, moment):
    toe_x = next(block for block in blocks if block[0] > 0 and block[1] == 0)
    toe_y = next(block for block in blocks if block[1] > 0 and block[0] == 0)
    old_width = toe_x[3]
    assert old_width == toe_y[2]
    web_bottom, web_top = plate['connectingContinuousWebZ']
    block_bottom, block_top = plate['thickBlockZ']
    web_mid = (web_bottom+web_top)/2
    levels = {'upper':(web_top, block_top), 'lower':(block_bottom, web_bottom)}

    def patch(label, block, axis, sign):
        x, y, dx, dy = block
        lows, highs = (x,y), (x+dx,y+dy)
        transverse = 1-axis
        coordinate = lows[axis] if sign > 0 else highs[axis]
        centre = [(lo+hi)/2 for lo,hi in zip(lows,highs)]
        centre[axis] = coordinate
        backing = [*lows,*highs]
        backing[axis] = coordinate-1 if sign > 0 else coordinate
        backing[axis+2] = coordinate if sign > 0 else coordinate+1
        return label, centre, axis, sign, highs[transverse]-lows[transverse], backing

    groups = {
        'positive': [patch('x-toe-end', toe_x, 0, 1), patch('y-toe-side', toe_y, 0, -1)],
        'negative': [patch('x-toe-side', toe_x, 1, -1), patch('y-toe-end', toe_y, 1, 1)],
    }
    patches = [face for group in groups.values() for face in group]

    def unavailable_faces(body_width):
        footprint = [(0,0,body_width,end),(0,0,end,body_width)]
        return [label for label, _, _, _, _, backing in patches if rectangle_area([backing], footprint) > 0]

    unsupported = unavailable_faces(width)
    if unsupported:
        return {'status':'backing-unavailable', 'unsupportedFaces':unsupported, 'runs':[]}
    old_unsupported = unavailable_faces(old_width)
    assert old_unsupported == ['y-toe-side', 'x-toe-side']

    def face_path(side, direction):
        z0, z1 = levels[side]
        pair = groups[direction]
        axis = pair[0][2]
        lever = abs(pair[0][1][1-axis]-pair[1][1][1-axis])
        force = moment*1000/lever
        records = []
        for label, centre, axis, sign, span, _ in pair:
            forces = [0,0,0]
            forces[axis] = sign*force
            area = span*(z1-z0)
            records.append({'id':label, 'centreXYZMm':[*centre,(z0+z1)/2], 'forceKN':forces,
                            'bearingAreaMm2':area, 'meanBearingDemandMPa':force*1000/area})
        wrench = load_wrench(records, (0,0,web_mid))
        target = moment if direction == 'positive' else -moment
        assert max(map(abs, wrench[:5])) < 1e-8 and abs(wrench[5]-target) < 1e-8
        return {'contacts':records,'wrench':wrench}

    runs = []
    for sign, top_direction, bottom_direction in ((1,'positive','negative'),(-1,'negative','positive')):
        upper, lower = face_path('upper', top_direction), face_path('lower', bottom_direction)
        contacts = upper['contacts']+lower['contacts']
        external = load_wrench(contacts, (0,0,web_mid))
        assert max(map(abs, external)) < 1e-8
        cuts = []
        for axis, toe in enumerate((toe_x,toe_y)):
            toe_contacts = [contact for contact in contacts if contact['id'][0] == 'xy'[axis]]
            for location, station in (('root',width),('toe',toe[axis])):
                origin = [width/2,width/2,web_mid]
                origin[axis] = station
                cuts.append({'arm':'xy'[axis], 'section':location, 'originXYZMm':origin,
                             'toeSideExternalWrench':load_wrench(toe_contacts, origin)})
        runs.append({'upperYawSign':sign, 'upper':upper, 'lower':lower, 'externalNetWrench':external,
                     'webCutDemands':cuts})
    return {
        'status':'balanced-compression-only-comparison',
        'coordinateBasis':'Local legacy DPC outer heel at [0,0]. Positive x/y extend into the two L legs, positive z is up.',
        'wrenchOrder':['Fx_kN','Fy_kN','Fz_kN','Mx_kNm','My_kNm','Mz_kNm'],
        'wrenchOriginXYZMm':[0,0,web_mid],
        'legacyControl': {'widthMm':old_width, 'status':'backing-unavailable', 'unsupportedFaces':old_unsupported},
        'widenedWidthMm':width,
        'widenedUnsupportedFaces':unsupported,
        'runs':runs,
        'scope':'Isolated equal and opposite yaw only. Web cut wrenches are external demands on the toe side. No strength, stiffness or concurrent splice actions are admitted.',
    }


def ground_splice(outer, grid, axes, shift, moment, soffit):
    dpc = outer['DPC']
    blocks = dpc['threeThickBlocksPlanLocal']
    size = next((width, height) for x, y, width, height in blocks if (x, y) == (0, 0))
    old_half = size[0]/2
    assert size[0] == size[1]
    end = max(x+width for x, _, width, _ in blocks)-old_half
    assert end == max(y+height for _, y, _, height in blocks)-old_half == EDGE_V[1]

    def body(inside):
        return [(-old_half, -old_half, inside, end), (-old_half, -old_half, end, inside)]

    old, widened = body(old_half), body(RECEIVER_U)
    extension = [(old_half, -old_half, RECEIVER_U, end), (-old_half, old_half, end, RECEIVER_U)]
    extended_plate = old + extension
    old_area = rectangle_area(old)
    wide_area = rectangle_area(widened)
    uncovered = rectangle_area(widened, old)
    additional_cells = list(rectangle_cells(widened, old))
    centroid_uv = [sum(area*cell[axis] for area,*cell in additional_cells)/uncovered for axis in (0,1)]
    head_by_id = {head['id']:head for head in grid['heads']}
    block_height = dpc['thickBlockZ'][1]-dpc['thickBlockZ'][0]
    web_thickness = dpc['connectingContinuousWebZ'][1]-dpc['connectingContinuousWebZ'][0]
    retained_stock_density = dpc['solid140ControlKgPerPier']/(old_area*block_height)
    extra_stock = uncovered*web_thickness*retained_stock_density
    receiving = []
    mass = []
    for ids, names, x_sign in (
        (('P07', 'P08', 'P09'), ('outer-W', 'outer-NW'), 1),
        (('P10', 'P11', 'P12'), ('outer-E', 'outer-NE'), -1),
    ):
        x, y = head_by_id[ids[0]]['xy']
        expanded = []
        for u0, v0, u1, v1 in widened:
            x0, x1 = sorted((x+x_sign*u0, x+x_sign*u1))
            expanded.append((x0-FORM_SETTING, y-v1-FORM_SETTING, x1+FORM_SETTING, y-v0+FORM_SETTING))
        seat = []
        receiving_levels = set()
        for name in names:
            girder = grid['girders'][name]
            low, high = girder['extent']
            centre, half = girder['datum'], girder['width']/2
            seat.append((low, centre-half, high, centre+half) if girder['axis'] == 'x' else
                        (centre-half, low, centre+half, high))
            receiving_levels.add(girder['z'][1])
        for id in ids:
            head = head_by_id[id]
            cx, cy = head['xy']
            half_x, half_y = (dimension/2 for dimension in head['capXY'])
            seat.append((cx-half_x, cy-half_y, cx+half_x, cy+half_y))
            receiving_levels.add(head['capZ'][1])
        if len(receiving_levels) != 1:
            raise ValueError('The north girder/cap projection needs a common receiving level')
        level = receiving_levels.pop()
        assert level <= dpc['connectingContinuousWebZ'][0] < dpc['connectingContinuousWebZ'][1] <= soffit
        concrete_volume = uncovered*(soffit-level-web_thickness)/1e9
        concrete_weight = concrete_volume*CONCRETE_BUDGET_KN_PER_M3
        web_weight = extra_stock*.00981
        mass.append({'cornerHeadId':ids[0], 'centroidXYMm':[x+x_sign*centroid_uv[0],y-centroid_uv[1]],
                     'verticalExtentZMm':[level,soffit], 'additionalConcreteM3':concrete_volume,
                     'additionalConcreteKN':concrete_weight, 'additionalWebKg':extra_stock,
                     'additionalWebKN':web_weight, 'characteristicKN':concrete_weight+web_weight})
        receiving.append({'heads': ids, 'girders': names, 'receivingLevelZMm': level,
                          'uncoveredWithSettingMm2': rectangle_area(expanded, seat),
                          'verticalGapToWebUndersideMm': dpc['connectingContinuousWebZ'][0]-level,
                          'verticalGapToBlockUndersideMm': dpc['thickBlockZ'][0]-level})

    corner_centroid = (old_half, old_half)
    key_arms = sorted(hypot(x+width/2-corner_centroid[0], y+height/2-corner_centroid[1])
                      for x,y,width,height in blocks if (x,y) != (0,0))
    lower_uncut = dpc['thickBlockZ'][0]+dpc['blindDrillDepthMax']
    upper_uncut = dpc['thickBlockZ'][1]-dpc['blindDrillDepthMax']
    assert lower_uncut <= dpc['connectingContinuousWebZ'][0] < dpc['connectingContinuousWebZ'][1] <= upper_uncut
    return {
        'remoteMainBarShiftMm': shift,
        'knownMainBarAxes': axes,
        'legacyBoreAlignment': {'comparisonBudgetMm': 1,
                                'axesOutsideBudgetCount': sum(row['axisOffsetMm'] > 1 for row in axes),
                                'maximumAxisOffsetMm': max(row['axisOffsetMm'] for row in axes)},
        'footprint': {'legacyMetalMm2': old_area, 'widenedBodyMm2': wide_area,
                      'uncoveredByLegacyMetalMm2': uncovered,
                      'uncoveredByExtendedWebMm2': rectangle_area(widened, extended_plate),
                      'extendedWebOverhangMm2': rectangle_area(extended_plate, widened)},
        'extendedWeb': {'thicknessMm': web_thickness, 'zMm': dpc['connectingContinuousWebZ'],
                        'retainedBlindBlockUncutCoreMm': dpc['remainingUncutCore'],
                        'retainedBlindBlockUncutCoreZMm': [lower_uncut, upper_uncut],
                        'extraUnboredStockKgPerCorner': extra_stock,
                        'totalUnboredStockKgPerCorner': dpc['netUnboredStockKgPerPier']+extra_stock},
        'receivingPlan': receiving,
        'nominalDeadLoadDelta': {
            'additionalFootprintMm2':uncovered, 'centroidUVMm':centroid_uv,
            'concreteUnitWeightKNPerM3':CONCRETE_BUDGET_KN_PER_M3,
            'geometryWithinRetainedReceivingProjection':all(row['uncoveredWithSettingMm2'] == 0 for row in receiving),
            'corners':mass, 'admitted':False,
            'scope':'Gross candidate concrete below the first-floor soffit, with added web stock replacing concrete in its 20 mm band. No stock, reinforcement or geometry is selected.',
        },
        'isolatedPositiveKeyCouple': {'historicalYawAboutU0KNm': moment, 'leverArmsMm': key_arms,
                                     'forceIfOneCoupleTakesWholeYawKN': [moment*1000/arm for arm in key_arms]},
        'isolatedKeyLoadPath': key_load_path(blocks, RECEIVER_U+old_half, end+old_half, dpc, moment),
        'scope': 'Geometry and isolated force demand only. Bearing spread, confinement, keys, bore strength, welds, moisture perimeter and coupled signed responses remain open.',
    }


def compare_collector(source_data, source_hashes, request=None):
    collar, ground, floor, house, section, grid, services = source_data
    retained_port = services['rewinds']['rearSource27']['retainedFloorPort']
    port_diameter = retained_port[2]
    cabinet = house['upperFurniture']['rear-cabinet']
    port_axis_xy, factor, shift = (native_request(request, retained_port, cabinet) if request is not None
                                   else (retained_port[:2], 1, REFERENCE_MAIN_BAR_SHIFT))
    corner_x, corner_y = next(head['xy'] for head in grid['heads'] if head['id'] == 'P07')
    port_u, port_v = port_axis_xy[0]-corner_x, corner_y-port_axis_xy[1]

    soffit, regular_top = section['section']['slabZ']
    finish = collar['cornerCandidate']['FFLAndFinishUndersideZmm'][1]
    reference_force = collar['old_new_chord'][1]
    force = reference_force*factor
    tension_per_bar = force/(len(STATIONS_V)*sin(ANGLE))
    required_bond = tension_per_bar*1000/(pi*BAR_DIAMETER*POOR_BOND_MPA)
    modelled_bond = required_bond+5
    bond_ratio = modelled_bond/required_bond if required_bond else None
    du, dv = modelled_bond*cos(ANGLE), modelled_bond*sin(ANGLE)
    return_compression = force/tan(ANGLE)
    cracked_strut_mpa = .6*(1-30/250)*17

    def drag(sign, swap=False, z=0):
        lines = [
            ((RECEIVER_U-du, v-sign*dv, z), (RECEIVER_U+du, v+sign*dv, z))
            for v in STATIONS_V
        ]
        return [((a[1], a[0], a[2]), (b[1], b[0], b[2])) for a, b in lines] if swap else lines

    def vertical(points):
        return [((u,v,3000),(u,v,3600)) for u,v in points]

    lower_z, upper_z = AXES_Z[2], AXES_Z[4]
    west_paths = drag(1, z=lower_z)+drag(-1, z=upper_z)
    lower_paths = drag(1, z=lower_z)+drag(-1, True, lower_z)
    upper_paths = drag(-1, z=upper_z)+drag(1, True, upper_z)
    axes = main_bar_axes(ground['outer'], shift)
    primary = [row['upperBarXYMm'] for row in axes]
    secondary = [(u,v) for u in (-12,42) for v in (280,530)]
    own_clear = min(b-a for a,b in zip(STATIONS_V, STATIONS_V[1:]))*cos(ANGLE)-BAR_DIAMETER-FORM_SETTING
    mixed = minimum_gap(drag(1), drag(-1, True), BAR_DIAMETER)
    upright = {
        'primaryH20': minimum_gap(west_paths, vertical(primary), 20),
        'secondaryH12': minimum_gap(west_paths, vertical(secondary+[(v,u) for u,v in secondary]), 16),
    }
    stack_top = AXES_Z[-1]+DIAMETERS[-1]/2+COVER+FORM_SETTING

    port_radius = port_diameter/2
    port_axis = [((port_u, port_v, soffit), (port_u, port_v, regular_top))]
    port_clearances = [{
        'levelZMm': z, 'direction': sign,
        'minimumClearToFormedEdgeAfter5Mm': minimum_gap(paths, port_axis, BAR_DIAMETER/2+port_radius),
    } for sign,z,paths in ((1,lower_z,lower_paths), (-1,upper_z,upper_paths))]
    x,y,width,depth = cabinet
    cabinet_centre_bounds = [
        max(RECEIVER_U, x-corner_x)+port_radius, x+width-corner_x-port_radius,
        corner_y-(y+depth)+port_radius, corner_y-y-port_radius,
    ]

    def gravity(name):
        row = next(r for r in floor['floor_fields'] if r['id']==name)
        amount = row['action']['V']*.86
        return {'field':name, 'wingReactionKN':amount, 'mean100WideSeatMPa':amount*1000/(100*860),
                'U190ToU20IndependentTieKN':amount*170/row['section']['z']}

    rails = [
        (u,z,d)
        for u,zs,d in [
            (-28,[3211,3251,3335],12), (26,[3211,3251,3335],12),
            (-30,[3293],16), (24,[3293],16),
            (-27,[3143,3443],10), (27,[3143,3443],10),
        ]
        for z in zs
    ]
    rail_witness = min(
        (minimum_gap(drag(sign, z=z), [((u,EDGE_V[0],z0),(u,EDGE_V[1],z0))], (BAR_DIAMETER+d)/2), sign,z,u,z0,d)
        for sign in (1,-1) for z in (lower_z,upper_z) for u,z0,d in rails
    )
    north_heads = [h for h in grid['heads'] if h['id'] in ('P07','P08','P09','P10','P11','P12')]
    cap_min_half_width = min(min(h['capXY']) for h in north_heads)/2
    nearest_raw_opening = min(
        row['nearestRawPlanReserveMm'] + row['wingAxisSpanMm'][1]-row['wingAxisSpanMm'][0]-EDGE_V[1]
        for row in collar['cornerCandidate']['allNearestApertures'].values()
    )
    yaw_at_ground = force*RECEIVER_U/1000
    return {
        'status':'Geometric and static monolithic redesign screen. Coupled wall, corner cage and splice loads unadmitted.',
        'sourceSHA256':source_hashes,
        'geometry':{'wallUAndLegVLimitsMm':[[-70,RECEIVER_U], EDGE_V], 'receivingUMm':RECEIVER_U,
                    'northNearestRawOpeningReserveAtOldToeMm':nearest_raw_opening,
                    'permanentWallRoomwardIncreaseMm':RECEIVER_U-70,
                    'unchangedExteriorGlassCavityBrickMm':collar['cornerCandidate']['unchangedExteriorGlassCavityAndBrickMm'],
                    'NWCornerOriginXYmm':[corner_x,corner_y], 'NWOriginalRearCabinetPlanMm':cabinet,
                    'soffitAndOrdinarySlabTopZMm':[soffit,regular_top], 'finishUndersideZMm':finish},
        'straightDrag':{'steel':'S500 H20; C30/37 and declared 2.1MPa poor-bond', 'anglesDeg':[-62,62],
                        'barCentresAtReceivingPlaneVMm':STATIONS_V, 'derivedTensionPerBarKN':tension_per_bar,
                        'requiredBondLengthEachSideMm':required_bond, 'modelledLengthEachSideMm':modelled_bond,
                        'projectionEachSideUAndVMm':[du,dv], 'diagonalRootsUMm':RECEIVER_U-du,
                        'stripExtentsVMm':[STATIONS_V[0]-dv, STATIONS_V[-1]+dv],
                        'lowerPathsLocalXYZMm':lower_paths, 'upperPathsLocalXYZMm':upper_paths,
                        'coverToActualToeEndAfter5mm':EDGE_V[1]-STATIONS_V[-1]-dv-FORM_SETTING-BAR_DIAMETER/2*cos(ANGLE),
                        'roomwardAffectedUAtMinimumMm':RECEIVER_U+du,
                        'basicPoorBondOnlySafetyRatio':bond_ratio if bond_ratio is not None and isfinite(bond_ratio) else None},
        'stack':{'axesInSectionZMm':AXES_Z, 'barDiametersMm':DIAMETERS,
                 'localSlabTopZMm':stack_top, 'slabDepthMm':stack_top-soffit,
                 'reserveToActualFinishUndersideMm':finish-stack_top,
                 'unrelatedDragPlanesClearShared5Mm':upper_z-lower_z-BAR_DIAMETER-FORM_SETTING,
                 'samePlaneWingPairClearShared5Mm':mixed, 'alongOneSignClearShared5Mm':own_clear,
                 'alongOneSignClearIndependent10Mm':own_clear-FORM_SETTING,
                 'uprightScreenClearShared5Mm':upright,
                 'primaryPlacingComparisonMm':PLACING,
                 'primaryPlacingComparisonMet':upright['primaryH20'] >= PLACING,
                 'commonJig':'Two opposed groups on each arm. Same level swaps signs on adjoining wings; each plane deliberately touches the intervening H28 at crossings. 5 mm total relative setting is binding.',
                 'wallLongitudinalTrial':{'governingGapAndAxes':rail_witness, 'minimumUnrelatedGapMm':rail_witness[0],
                                          'oneCourseReplacementAreaMM2':pi*8**2,
                                          'priorSeparateH12AndH10AreaMM2':pi*(6**2+5**2),
                                          'railAxesUMmZMmDiameterMm':rails}},
        'lateralClosure':{'ownerHistoricalForceKN':reference_force, 'comparisonForceKN':force, 'dragDemandFactor':factor,
                          'normalCompressionReturnKN':return_compression,
                          'minimumAreaAtDeclaredCrackedStrutMM2':return_compression*1000/cracked_strut_mpa,
                          'meanOnAdverseCommonWallFaceMPa':return_compression*1000/(850*(stack_top-soffit-10)*.75),
                          'momentAboutWidenedMidPlaneKNm':force*(RECEIVER_U+70)/2000,
                          'momentAboutUnchangedGroundAxisU0KNm':yaw_at_ground,
                          'scope':'No friction credit. Normal return balances at the same V centroid. Mean pressure only. The positive torque transfer and real L-ground stability splice are unproved.'},
        'retainedNWPort':{'referenceAxisXYmm':retained_port[:2], 'axisXYmm':port_axis_xy,
                          'axisUVAndDiameterMm':[port_u, port_v, port_diameter], 'levels':port_clearances,
                          'gapToWidenedWallUMm':port_u-port_radius-RECEIVER_U, 'admitted':False},
        'rearCabinetPortTerritory':port_clearance(cabinet_centre_bounds, lower_paths+upper_paths, port_radius),
        'gravity':{'directBearingURangeMm':[-30,70], 'records':[gravity(n) for n in ('NW-W','NE')]},
        'groundSplice': ground_splice(ground['outer'], grid, axes, shift, yaw_at_ground, soffit),
        'groundAlternative':{'retainedNorthCornerAndToeCapIDs':[h['id'] for h in north_heads],
                             'insidePlanGapToSmallestCapAfter5Mm':cap_min_half_width-RECEIVER_U-FORM_SETTING,
                             'outsidePlanGapToSmallestCapAfter5Mm':cap_min_half_width-70-FORM_SETTING,
                             'scope':'Plan-only alternative with actual continuous widened body onto a redesigned imperforate DPC plate and cap. Existing shallow node, anchors and soil capacities are not transferred.'},
    }


def diagram(result):
    soffit = result['geometry']['soffitAndOrdinarySlabTopZMm'][0]
    finish = result['geometry']['finishUndersideZMm']
    stack_top = result['stack']['localSlabTopZMm']
    heights = result['stack']['axesInSectionZMm']
    port_u, port_v, port_diameter = result['retainedNWPort']['axisUVAndDiameterMm']
    ink = []
    def line(x1,y1,x2,y2,role):
        ink.append(f'<path d="M{x1:g} {y1:g}L{x2:g} {y2:g}" class="{role}"/>')
    def box(x,y,w,h,role):
        ink.append(f'<rect x="{x:g}" y="{y:g}" width="{w:g}" height="{h:g}" class="{role}"/>')
    def circle(x,y,r,role):
        ink.append(f'<circle cx="{x:g}" cy="{y:g}" r="{r:g}" class="{role}"/>')
    def label(x,y,words,role='note'):
        ink.append(f'<text x="{x:g}" y="{y:g}" class="{role}">{words}</text>')

    box(0,0,420,297,'paper')
    label(14,20,'North collector · opposed straight steel','title')
    port_label = 'retained port' if result['retainedNWPort']['axisXYmm'] == result['retainedNWPort']['referenceAxisXYmm'] else 'trial port'
    label(14,30,f'Northwest comparison · {port_label} shown in red · print at actual A3 size.')
    line(14,37,406,37,'rule')
    for x, sign, heading in [(17,1,'Lower group at Z3260 · 1:10'),(148,-1,'Upper group at Z3308 · 1:10')]:
        y=58
        def plan(u,v):
            return x+(u+70)/10,y+(v+70)/10
        label(x,47,heading,'head')
        box(x,y,100,24,'concrete')
        box(x,y+24,24,76,'concrete')
        line(*plan(170,170),*plan(170,930),'face')
        line(*plan(170,170),*plan(930,170),'face')
        for a,b in result['straightDrag']['lowerPathsLocalXYZMm' if sign == 1 else 'upperPathsLocalXYZMm']:
            line(*plan(*a[:2]),*plan(*b[:2]),'steelPlan')
        circle(*plan(port_u,port_v),port_diameter/20,'port')
        mark=result['retainedNWPort']['levels'][0 if sign==1 else 1]['minimumClearToFormedEdgeAfter5Mm']
        label(x,170,f'Formed Ø{port_diameter} port signed gap: {mark:.2f} mm')
        label(x,178,'Both wing directions shown. Positive axes into the room.')
        line(x,184,x+50,184,'rule')
        label(x,190,'500 mm')
    line(270,42,270,208,'rule')
    label(285,47,'Local floor section · 1:5','head')
    base,datum=288,139
    def sx(u):
        return base+(u+70)/5
    def sz(z):
        return datum-(z-soffit)/5
    box(sx(-70),sz(stack_top),(170+70)/5,(stack_top-soffit)/5,'concrete')
    box(sx(-70),sz(soffit),(170+70)/5,25,'concrete')
    box(sx(170),sz(stack_top),32,(stack_top-soffit)/5,'slab')
    line(sx(170),sz(stack_top),sx(170),sz(soffit),'face')
    line(sx(-30),sz(soffit),sx(70),sz(soffit),'seat')
    for z,d in zip(heights,[12,12,20,28,20,12,12]):
        circle(sx(196),sz(z),d/10,'steelSection')
    line(sx(25),sz(finish),sx(265),sz(finish),'rule')
    label(373,sz(finish)+1,'Z3435 finish underside')
    label(373,sz(stack_top)+1,'Z3398 local slab top')
    label(373,sz(soffit)+1,'Z3170 soffit')
    label(287,174,'100 mm gravity seat centred over the old core.')
    label(287,182,'Dash marks the roomward wall face at U170.')
    label(287,190,'Lower and upper diagonal bars bear against H28 chord.')
    line(14,206,406,206,'rule')
    label(14,223,'Release conditions','head')
    if result['rearCabinetPortTerritory']['state'] == 'overlap-throughout-territory':
        label(14,234,'The existing cabinet has no clear port position. Resolve an independent route or redesign the cage.')
    else:
        label(14,234,'Any proposed port needs an independent service and cover check.')
    label(14,244,'Prove the widened body, full chord, round ties and imperforate DPC splice as one force path.')
    label(14,254,'This section screens geometry and isolated loads. Ground, roof and whole-house checks remain open.')
    splice = result['groundSplice']
    maximum_offset = splice['legacyBoreAlignment']['maximumAxisOffsetMm']
    uncovered = splice['footprint']['uncoveredByLegacyMetalMm2']
    label(14,263,f'Ground splice: {maximum_offset:g} mm maximum H20 axis offset; {uncovered:g} mm² outside the legacy plate.')
    label(14,280,'Plan coordinates U/V and levels Z are in millimetres.')
    return ('<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297" role="img" aria-labelledby="title">\n'
            '<title id="title">Opposed straight collector reinforcement and retained port</title>\n'
            '<style>.paper{fill:#f8f4eb}.rule,.face,.steelPlan,.seat{fill:none;stroke:#5b554c;stroke-width:.4}'
            '.face{stroke-dasharray:1 1}.concrete,.slab{fill:#dcd8cf;stroke:#777166;stroke-width:.3}.slab{fill:#e9e4db}'
            '.steelPlan{stroke:#244658;stroke-width:2;stroke-linecap:round}.steelSection,.seat{fill:#244658;stroke:#244658;stroke-width:.65}'
            '.port{fill:#a94d42;fill-opacity:.20;stroke:#a94d42;stroke-width:.7}.title{font:8px Georgia;fill:#302a24}'
            '.head{font:4.8px Georgia;fill:#302a24}.note{font:3.5px Arial;fill:#514639}</style>\n'
            +'\n'.join(ink)+'</svg>\n')


def capsule_slice_at_u(a, b, u, radius):
    du, dv = b[0]-a[0], b[1]-a[1]
    length = hypot(du, dv)
    values = []
    for x, y in (a, b):
        if abs(u-x) <= radius:
            half = sqrt(max(0, radius**2-(u-x)**2))
            values.extend((y-half, y+half))
    for sign in (-1, 1):
        offset_u = sign*radius*dv/length
        fraction = (u-a[0]-offset_u)/du
        if 0 <= fraction <= 1:
            values.append(a[1]+fraction*dv-sign*radius*du/length)
    return (min(values), max(values)) if values else None


def packing_witness(intervals, pitch):
    selected = []
    for low, high in intervals:
        start = max(low, selected[-1]+pitch) if selected else low
        if start <= high+BOUND_ROUNDING_MM:
            selected.extend(start+i*pitch for i in range(1+floor((high-start+BOUND_ROUNDING_MM)/pitch)))
    return selected


def station_capacity(result, port=None, relaxed_port_clearance_mm=0):
    drag = result['straightDrag']
    required = len(drag['barCentresAtReceivingPlaneVMm'])
    first_station = drag['barCentresAtReceivingPlaneVMm'][0]
    port_u, port_v, port_diameter = result['retainedNWPort']['axisUVAndDiameterMm'] if port is None else port
    heel, toe = result['geometry']['wallUAndLegVLimitsMm'][1]
    bar_radius = BAR_DIAMETER/2

    def group(path, band, swapped):
        normal_index, station_index = (1, 0) if swapped else (0, 1)
        a, b = [(p[normal_index], p[station_index]-first_station) for p in path]
        du, dv = b[0]-a[0], b[1]-a[1]
        normal_cosine = abs(du)/hypot(du, dv)
        face_pad = COVER+FORM_SETTING+bar_radius*normal_cosine
        low, high = heel+face_pad-min(a[1],b[1]), toe-face_pad-max(a[1],b[1])
        pitch = (BAR_DIAMETER+FORM_SETTING+PLACING)/normal_cosine
        normal, station = (port_v, port_u) if swapped else (port_u, port_v)
        profiles = []
        for port_cover in (0, COVER):
            radius = port_diameter/2+bar_radius+FORM_SETTING+port_cover-relaxed_port_clearance_mm-BOUND_ROUNDING_MM
            cut = capsule_slice_at_u(a, b, normal, radius) if radius > 0 else None
            blocked = [station-cut[1], station-cut[0]] if cut else None
            intervals = [] if low > high else [[low,high]]
            if blocked and blocked[0] < blocked[1] and intervals:
                intervals = [[low,min(high,blocked[0])], [max(low,blocked[1]),high]]
                intervals = [[lo,hi] for lo,hi in intervals if lo <= hi]
            selected = packing_witness(intervals, pitch)
            profiles.append({'portCoverMm':port_cover, 'openForbiddenStationIntervalMm':blocked,
                             'availableStationIntervalsMm':intervals, 'maximumStations':len(selected),
                             'exampleStationCentresMm':selected})
        return {'band':band,'leg':'north' if swapped else 'west','stationAxis':'U' if swapped else 'V',
                'endCoverStationIntervalMm':[low,high],'minimumStationPitchMm':pitch,'profiles':profiles}

    groups = [group(drag[band+'PathsLocalXYZMm'][required if swapped else 0], band, swapped)
              for band in ('lower','upper') for swapped in (False,True)]
    def first_station_interval(row):
        covered = row['profiles'][-1]
        if covered['maximumStations'] < required:
            return None
        mirrored = [[-hi,-lo] for lo,hi in reversed(covered['availableStationIntervalsMm'])]
        latest = -packing_witness(mirrored, row['minimumStationPitchMm'])[required-1]
        return [covered['exampleStationCentresMm'][0], latest]

    shared_planes = []
    for west, north in zip(groups[::2], groups[1::2]):
        west_interval, north_interval = first_station_interval(west), first_station_interval(north)
        if west_interval is None or north_interval is None:
            continue
        paths = drag[west['band']+'PathsLocalXYZMm']
        def clear_gap(west_station, north_station):
            west_path = [(u,v+west_station-first_station,z) for u,v,z in paths[0]]
            north_path = [(u+north_station-first_station,v,z) for u,v,z in paths[required]]
            return minimum_gap([west_path], [north_path], BAR_DIAMETER)

        shared_planes.append({'band':west['band'], 'westFirstStationIntervalMm':west_interval,
                              'northFirstStationIntervalMm':north_interval, 'requiredGapMm':PLACING,
                              'gapUpperBoundAfterSettingMm':max(clear_gap(w,n) for w,n in product(west_interval,north_interval))})

    if any(row['profiles'][-1]['maximumStations'] < required for row in groups):
        state = 'required-station-count-excluded'
    elif any(row['gapUpperBoundAfterSettingMm']+BOUND_ROUNDING_MM < PLACING for row in shared_planes):
        state = 'required-shared-plane-gap-excluded'
    else:
        state = 'placing-ranges-remain'
    return {'schema':'str-north-collector-station-capacity/1', 'requiredStationsPerGroup':required,
            'state':state, 'groups':groups, 'sharedPlanes':shared_planes, 'admitted':False,
            'scope':'Independent station packing and upper bounds for the first pair in each shared plane. The remaining pairs, other steel and force distribution can further limit placement.'}


def cabinet_station_capacity(result):
    bounds = result['rearCabinetPortTerritory']['centreBoundsUVmm']
    centre_diameter = result['retainedNWPort']['axisUVAndDiameterMm'][2]
    min_cell_mm = 1
    cells = [bounds]
    counts = {'required-station-count-excluded':0, 'required-shared-plane-gap-excluded':0}
    unresolved = None
    checked = 0
    state = 'excluded-throughout-territory'
    while cells:
        u0,u1,v0,v1 = box = cells.pop()
        width, depth = u1-u0, v1-v0
        if width < 0 or depth < 0:
            state = 'no-port-territory'
            break
        u,v = (u0+u1)/2, (v0+v1)/2
        checked += 1
        row = station_capacity(result, (u,v,centre_diameter), hypot(width,depth)/2)
        if row['state'] in counts:
            counts[row['state']] += 1
        elif max(width,depth) <= min_cell_mm:
            state, unresolved = 'unresolved-cell', box
            break
        elif width >= depth:
            cells.extend(([u,u1,v0,v1], [u0,u,v0,v1]))
        else:
            cells.extend(([u0,u1,v,v1], [u0,u1,v0,v]))
    return {'schema':'str-north-collector-cabinet-station-capacity/1',
            'state':state, 'centreBoundsUVmm':bounds, 'cellsChecked':checked, 'resolvedCells':counts,
            'minimumSubdivisionSideMm':min_cell_mm, 'unresolvedWitnessBoxUVmm':unresolved, 'admitted':False}


def main(root, flags):
    source_bytes = [(root / file).read_bytes() for file in SOURCES]
    source_data = list(map(loads, source_bytes))
    source_hashes = {path:sha256(raw).hexdigest() for path, raw in zip(SOURCES, source_bytes)}
    if flags == ['--current-request']:
        result = compare_collector(source_data, source_hashes, loads(stdin.read()))
        print(dumps({'schema':'str-north-collector-native-result/1', 'comparison':result, 'drawingSvg':diagram(result),
                     'placementReferences':{'relativeSettingMm':FORM_SETTING, 'concreteCoverMm':COVER},
                     'stationCapacity':station_capacity(result),
                     'cabinetStationCapacity':cabinet_station_capacity(result)}, allow_nan=False))
        return
    if flags not in ([], ['--check']):
        raise ValueError('Choose --check or --current-request')
    result = compare_collector(source_data, source_hashes)
    stack = result['stack']
    assert min(stack['alongOneSignClearShared5Mm'], stack['samePlaneWingPairClearShared5Mm'],
               *stack['uprightScreenClearShared5Mm'].values()) >= PLACING
    assert stack['alongOneSignClearIndependent10Mm'] < PLACING
    assert stack['wallLongitudinalTrial']['minimumUnrelatedGapMm'] >= PLACING
    assert result['straightDrag']['coverToActualToeEndAfter5mm'] >= COVER
    assert all(level['minimumClearToFormedEdgeAfter5Mm'] < 0 for level in result['retainedNWPort']['levels'])
    assert result['rearCabinetPortTerritory']['state'] == 'overlap-throughout-territory'
    reference_splice = result['groundSplice']
    assert len(reference_splice['knownMainBarAxes']) == 12
    assert reference_splice['legacyBoreAlignment']['axesOutsideBudgetCount'] == 8
    assert reference_splice['footprint']['uncoveredByLegacyMetalMm2'] > 0
    assert reference_splice['footprint']['uncoveredByExtendedWebMm2'] == 0
    assert all(not corner['uncoveredWithSettingMm2'] for corner in reference_splice['receivingPlan'])
    trial = {'schema':'str-north-collector-native-case/1',
             'portAxisXYMm':result['retainedNWPort']['referenceAxisXYmm'], 'dragDemandFactor':1}
    aligned = compare_collector(source_data, source_hashes, {**trial, 'remoteMainBarShiftMm':0})
    adverse = compare_collector(source_data, source_hashes, {**trial, 'remoteMainBarShiftMm':MAXIMUM_MAIN_BAR_SHIFT})
    assert aligned['groundSplice']['legacyBoreAlignment']['axesOutsideBudgetCount'] == 0
    assert aligned['stack']['primaryPlacingComparisonMet'] and not adverse['stack']['primaryPlacingComparisonMet']
    target = Path(__file__).with_suffix('.json')
    for output, data in [(target, dumps(result, indent=2, sort_keys=True)+'\n'), (target.with_suffix('.svg'), diagram(result))]:
        if flags == ['--check']:
            assert output.read_text() == data, output
        else:
            output.write_text(data)


if __name__ == '__main__':
    main(Path(argv[1]), argv[2:])
