"""Actual source cap/grid RC union and a conservative-origin gravity load adapter.

The disjoint solid partition prevents overlap being counted twice. Its allocation
at intersections is a declared beam-model load introduction, not a 3D joint law.
"""
import hashlib
import json
import math
from pathlib import Path
import sys

METHOD = 'project/str/studies/foundation_solid_weight.py'
GRID = 'project/str/studies/current-house-grid.json'
DPC = 'project/str/studies/current-house-lateral.json'


def load_foundation_solid_weight_source(root):
    root = Path(root)
    return {'root': root, 'grid': json.loads((root / GRID).read_text()),
            'dpcIntervalZMm': json.loads((root / DPC).read_text())['capillarySplice']['plateZ'],
            'identities': {path: hashlib.sha256((root / path).read_bytes()).hexdigest() for path in (GRID, DPC, METHOD)}}


def reference_foundation_solid_weight_case(source):
    return {'schema': 'str-foundation-solid-weight-case/1', 'sourceSHA256': source['identities'],
            'unitWeightKNPerM3': 25, 'gravityFactor': 1,
            'ownershipPolicy': 'caps-first-then-lexical-source-beams-disjoint-solid',
            'use': 'below-cut-source-gravity-only-not-cap-grid-resistance'}


def _settings(settings):
    if not isinstance(settings, dict) or set(settings) != {'unitWeightKNPerM3', 'gravityFactor'}:
        raise ValueError('Exact authored foundation density/gravity factor required; no injected geometry or approvals')
    if any(type(value) not in (int, float) or not math.isfinite(value) for value in settings.values()):
        raise ValueError('Finite foundation weight controls required')
    if not 20 <= settings['unitWeightKNPerM3'] <= 30 or not 0 <= settings['gravityFactor'] <= 1:
        raise ValueError('Foundation comparison density20..30kN/m3 and gravity factor0..1 required')


def _box(box):
    if len(box) != 6 or any(type(value) not in (int, float) or not math.isfinite(value) for value in box) or any(box[i + 3] <= box[i] for i in range(3)):
        raise ValueError('Finite positive axis-aligned solid box required')
    return list(box)


def subtract_box(box, removed):
    """Disjoint decomposition of box minus removed, at most six boxes."""
    box, removed = _box(box), _box(removed)
    overlap = [max(box[i], removed[i]) for i in range(3)] + [min(box[i + 3], removed[i + 3]) for i in range(3)]
    if any(overlap[i + 3] <= overlap[i] for i in range(3)):
        return [box]
    pieces, remainder = [], box[:]
    for axis in range(3):
        if remainder[axis] < overlap[axis]:
            piece = remainder[:]; piece[axis + 3] = overlap[axis]; pieces.append(piece); remainder[axis] = overlap[axis]
        if remainder[axis + 3] > overlap[axis + 3]:
            piece = remainder[:]; piece[axis] = overlap[axis + 3]; pieces.append(piece); remainder[axis + 3] = overlap[axis + 3]
    return pieces


def disjoint_solid_union(solids):
    """Return exact nonoverlapping fragments with first-owner provenance."""
    fragments, previous = [], []
    for solid in solids:
        box = _box(solid['boxXYZMm']); pending = [box]
        for other in previous:
            pending = [piece for item in pending for piece in subtract_box(item, other)]
            if not pending: break
        fragments.extend({'ownerId': solid['id'], 'ownerKind': solid['kind'], 'boxXYZMm': piece} for piece in pending)
        previous.append(box)
    return fragments


def _volume(box):
    return math.prod(box[i + 3] - box[i] for i in range(3)) / 1e9


def source_foundation_solids(grid):
    solids = []
    heads = grid.get('heads')
    if not isinstance(heads, list) or len(heads) != 52 or len({row['id'] for row in heads}) != 52:
        raise ValueError('Actual named52-head grid required; no historical foundation substitute')
    for head in sorted(heads, key=lambda row: row['id']):
        x, y = head['xy']; w, d = head['capXY']; z0, z1 = head['capZ']
        solids.append({'id': 'CAP/' + head['id'], 'kind': 'cap', 'boxXYZMm': [x-w/2, y-d/2, z0, x+w/2, y+d/2, z1]})
    beams = {}
    for name, row in grid['girders'].items():
        lo, hi = row['extent']; datum, half = row['datum'], row['width']/2
        bounds = [lo, datum-half, hi, datum+half] if row['axis'] == 'x' else [datum-half, lo, datum+half, hi]
        beams[name] = [bounds[0], bounds[1], row['z'][0], bounds[2], bounds[3], row['z'][1]]
    for name, row in grid['crossBeams'].items():
        (x,y), (u,v) = row['a'], row['b']; half = row['width']/2
        if (x == u) == (y == v): raise ValueError('Only actual axis-aligned finite ground members supported')
        beams[name] = [min(x,u) if x != u else x-half, min(y,v) if y != v else y-half, row['z'][0],
                       max(x,u) if x != u else x+half, max(y,v) if y != v else y+half, row['z'][1]]
    for name, box in sorted(beams.items()): solids.append({'id': 'GRID/' + name, 'kind': 'beam', 'boxXYZMm': box})
    for row in solids: _box(row['boxXYZMm'])
    return solids


def foundation_solid_inventory(case, source):
    expected = reference_foundation_solid_weight_case(source)
    if not isinstance(case, dict) or set(case) != set(expected) or any(case[key] != expected[key] for key in ('schema', 'sourceSHA256', 'ownershipPolicy', 'use')):
        raise ValueError('Exact current source-bound foundation solid case required')
    settings = {key: case[key] for key in ('unitWeightKNPerM3', 'gravityFactor')}; _settings(settings)
    solids = source_foundation_solids(source['grid']); fragments = disjoint_solid_union(solids)
    volume = math.fsum(_volume(row['boxXYZMm']) for row in fragments)
    first = [math.fsum(_volume(row['boxXYZMm'])*(row['boxXYZMm'][i]+row['boxXYZMm'][i+3])/2 for row in fragments) for i in range(3)]
    weight = volume * settings['unitWeightKNPerM3'] * settings['gravityFactor']
    cut = source['dpcIntervalZMm']
    if len(cut) != 2 or any(type(value) not in (int,float) or not math.isfinite(value) for value in cut) or cut[1] <= cut[0]:
        raise ValueError('Actual source DPC interval is unavailable')
    cut_z = (cut[0] + cut[1])/2
    if max(row['boxXYZMm'][5] for row in fragments) > cut[0]:
        raise ValueError('Foundation source material reaches actual DPC interval; explicit origin partition required before credit')
    naive = math.fsum(_volume(row['boxXYZMm']) for row in solids)
    return {'schema': 'str-foundation-solid-inventory/1', 'sourceSHA256': source['identities'], 'request': case,
            'solidCount': len(solids), 'fragmentCount': len(fragments), 'RCVolumeM3': volume,
            'naiveOverlappingVolumeM3': naive, 'removedOverlapVolumeM3': naive-volume,
            'centroidXYZMm': [value/volume for value in first], 'physicalGKN': weight,
            'verticalExtentZMm': [min(row['boxXYZMm'][2] for row in fragments), max(row['boxXYZMm'][5] for row in fragments)],
            'firstVolumeMomentsM3Mm': first, 'aboveSourceDPCCompressionCreditKN': 0,
            'sourceDPCPlaneZMm': cut_z, 'completeSolidAboveCut': False,
            'fragments': fragments, 'solids': solids, 'candidateAccepted': False, 'capGridResistanceAccepted': False,
            'scope': 'Physical RC cap/grid union only. All material is below source portalDPC; it cannot precompress that cut. Pile shafts, slab, superstructure and soil are excluded.'}


def _add(family, node, wrench):
    target = family.setdefault(node, [0.]*6)
    for axis, value in enumerate(wrench): target[axis] += value


def add_foundation_solid_weight(model, source, settings):
    """Add actual disjoint-solid G to the same compatible native model once."""
    from vertical_rc_floor import grid_member_geometry, grid_vertical_point_terms
    from joined_successor_compatibility import _wrench_at
    from rc_floor_house_loads import _family_wrench
    _settings(settings)
    if 'foundationWeight' in model: raise ValueError('Foundation solid gravity already added; duplicate load rejected')
    current = load_foundation_solid_weight_source(source['root'])
    if model['grid'] != current['grid']: raise ValueError('Foundation solid inventory differs from actual solved grid')
    case = {**reference_foundation_solid_weight_case(current), **settings}
    inventory = foundation_solid_inventory(case, current); frame = model['model']; members = grid_member_geometry(model)
    before = _family_wrench(model, model['families']['physical-G']); family = {}; routes = {}; maximum_error = 0.
    density = settings['unitWeightKNPerM3'] * settings['gravityFactor']
    for fragment in inventory['fragments']:
        box = fragment['boxXYZMm']; owner = fragment['ownerId']; x0,y0,z0,x1,y1,z1 = box
        if fragment['ownerKind'] == 'cap':
            head = owner[4:]; point = [(x0+x1)/2, (y0+y1)/2, (z0+z1)/2]; weight = _volume(box)*density
            _add(family, head, _wrench_at([0,0,-weight], point, frame.nodes[head])); routes[owner] = routes.get(owner,0.) + weight
            continue
        selected = {name: row for name,row in members.items() if name.rsplit('/',1)[0] == owner}
        if not selected: raise ValueError('Missing finite source member for actual foundation solid: '+owner)
        horizontal = next(iter(selected.values()))['physicalStartMm'][0] != next(iter(selected.values()))['physicalEndMm'][0]
        axis = 0 if horizontal else 1; cuts = sorted({box[axis],box[axis+3],*[p[axis] for row in selected.values() for p in (row['physicalStartMm'],row['physicalEndMm']) if box[axis]<p[axis]<box[axis+3]]})
        for lo,hi in zip(cuts,cuts[1:]):
            piece = box[:]; piece[axis],piece[axis+3] = lo,hi
            # Two-point quadrature exactly integrates the cubic finite beam load
            # shapes and the affine transverse eccentricity on each segment.
            for xi in (-1/math.sqrt(3),1/math.sqrt(3)):
                for eta in (-1/math.sqrt(3),1/math.sqrt(3)):
                    point = [(piece[0]+piece[3])/2+xi*(piece[3]-piece[0])/2, (piece[1]+piece[4])/2+eta*(piece[4]-piece[1])/2]
                    route = grid_vertical_point_terms(model, selected, point)
                    if route is None or route['memberId'] not in selected: raise ValueError('Solid G has no actual finite beam route')
                    weight = _volume(piece)*density/4
                    for node,row in route['terms']: _add(family,node,[-weight*value for value in row])
                    maximum_error = max(maximum_error,route['unitWrenchResidualKN_KNmm']); routes[owner] = routes.get(owner,0.)+weight
    for node,wrench in family.items(): _add(model['families']['physical-G'],node,wrench)
    after = _family_wrench(model,model['families']['physical-G']); weight = inventory['physicalGKN']; x,y,z = inventory['centroidXYZMm']; expected = [0,0,-weight,-weight*y/1000,weight*x/1000,0]
    residual = [b-a-c for a,b,c in zip(before,after,expected)]
    if max(abs(value) for value in residual) > 1e-7: raise ValueError('Foundation solid gravity loses exact force/first moments: '+str(residual))
    model['foundationWeight'] = {**{key:value for key,value in inventory.items() if key not in ('fragments','solids')},
        'sourceSHA256': current['identities'], 'loadsBySourceOwnerKN': routes, 'addedPhysicalFamilyWrenchKN_KNm': expected,
        'sourceSelfGAndFirstMomentResidualKN_KNm': residual, 'maximumUnitPointWrenchResidualKN_KNmm': maximum_error,
        'loadAllocation': 'Disjoint cap material acts at its same named head with preserved moments; remaining source-beam material uses its own finite Timoshenko member, including transverse eccentricity. No new support or fixed reaction is inserted.',
        'local3DIntersectionTransferAccepted': False, 'pileCapacityAccepted': False,
        'gravityCombinationFactor': model['houseLoadCase']['boundary']['physicalGFactor']}
    return model['foundationWeight']


if __name__ == '__main__':
    source = load_foundation_solid_weight_source(Path(__file__).resolve().parents[3])
    if sys.argv[1:] == ['--read']: print(json.dumps(reference_foundation_solid_weight_case(source),allow_nan=False))
    else:
        request = json.load(sys.stdin)
        if set(request) != {'case'}: raise ValueError('Exact case request required')
        print(json.dumps(foundation_solid_inventory(request['case'],source),allow_nan=False))
