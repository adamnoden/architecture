"""Replace only a physical normal contact's upper plate trace.

The old MITC4 cell and its retained work map reconstruct the removed upper
trace.  The new scalar is an exact solid-surface point, not a nearest node.
Serial masonry body, own gravity, lower grid trace and unilateral law remain
unchanged.  This helper neither creates supports nor gauges unused coordinates.
Units are the native mm, kN and kNmm; solid SI conversion belongs to its caller.
"""
import copy
import math

from vertical_floor_plate import rectangle_shapes


def _number(value):
    return type(value) in (int, float) and math.isfinite(value)


def _terms(rows):
    result = {}
    for node, row in rows:
        if not isinstance(node, str) or len(row) != 6 or not all(_number(v) for v in row):
            raise ValueError('Finite six-component native work trace required')
        target = result.setdefault(node, [0.] * 6)
        for i, value in enumerate(row):
            target[i] += value
    return result


def _same_trace(left, right):
    return all(abs(left.get(n, [0.] * 6)[i] - right.get(n, [0.] * 6)[i])
               <= 1e-11 * max(1., abs(left.get(n, [0.] * 6)[i]), abs(right.get(n, [0.] * 6)[i]))
               for n in left.keys() | right.keys() for i in range(6))


def _upper_trace(original, xy):
    assembled = original['operator']['assembled']
    ports = original['portTerms']
    x, y = xy
    candidates = [e['rectangleXYMm'] for e in assembled['elements']
                  if e['rectangleXYMm'][0] <= x <= e['rectangleXYMm'][2]
                  and e['rectangleXYMm'][1] <= y <= e['rectangleXYMm'][3]]
    if not candidates:
        raise ValueError('Normal point has no original physical MITC4 cell')
    answers = []
    for a, b, c, d in candidates:
        if not all(_number(v) for v in (a, b, c, d)) or c <= a or d <= b:
            raise ValueError('Invalid original physical cell')
        corners = ((a, b), (c, b), (c, d), (a, d))
        weights, _, _ = rectangle_shapes(2 * (x - a) / (c - a) - 1,
                                        2 * (y - b) / (d - b) - 1, c - a, d - b)
        if min(weights) < 0 or abs(math.fsum(weights) - 1) > 1e-12:
            raise ValueError('Normal contact requires extrapolated plate weights')
        rows = []
        for p, weight in zip(corners, weights):
            coefficients = assembled['pointTerms'].get((p, 0))
            if not coefficients:
                raise ValueError('Original normal point lost its physical upper coordinate')
            for index, value in coefficients:
                if type(index) is not int or not 0 <= index < len(ports) or not _number(value):
                    raise ValueError('Original contact uses an unretained physical plate coordinate')
                rows.extend((node, [weight * value * q for q in row]) for node, row in ports[index])
        answers.append(_terms(rows))
    if any(not _same_trace(answers[0], other) for other in answers[1:]):
        raise ValueError('Original shared cell edge has inconsistent physical traces')
    return answers[0]


def _wrench(frame, terms):
    """Independent unit-load resultant about global origin (kN, kNm)."""
    result = [0.] * 6
    for node, row in terms:
        if node not in frame.nodes:
            raise ValueError('Work trace references a missing physical node')
        x, y, z = frame.nodes[node]
        fx, fy, fz, mx, my, mz = row
        for i, value in enumerate((fx, fy, fz,
                (mx + y * fz - z * fy) / 1000,
                (my + z * fx - x * fz) / 1000,
                (mz + x * fy - y * fx) / 1000)):
            result[i] += value
    return result


def remap_contacts(model, patch_xy_mm, normal_nodes, original_vertical):
    """Atomically replace all and only strictly interior top-contact traces.

    ``normal_nodes`` must contain exactly the interior fibre IDs.  Their unique
    scalar nodes already exist at exact fibre XY; only UZ is free.  The owning
    solid assembly is responsible for their actual surface Z and SI work map.
    ``original_vertical`` captures the old operator and portTerms before the
    exterior slab replacement.  No old contact row is guessed from node height.
    """
    if (not isinstance(patch_xy_mm, (list, tuple)) or len(patch_xy_mm) != 4
            or not all(_number(v) for v in patch_xy_mm)
            or patch_xy_mm[2] <= patch_xy_mm[0] or patch_xy_mm[3] <= patch_xy_mm[1]):
        raise ValueError('Positive finite solid patch XY required')
    if not isinstance(normal_nodes, dict) or not isinstance(original_vertical, dict):
        raise ValueError('Explicit original plate map and exact solid normal-node catalogue required')
    frame = model['model']
    data = model['verticalFloor']
    fibres = data['fibres']
    if len({f['id'] for f in fibres}) != len(fibres):
        raise ValueError('Duplicate physical normal fibre ID')
    a, b, c, d = patch_xy_mm
    for f in fibres:
        if len(f['xyMm']) != 2 or not all(_number(v) for v in f['xyMm']):
            raise ValueError('Finite physical normal fibre XY required')
    selected = [f for f in fibres if a < f['xyMm'][0] < c and b < f['xyMm'][1] < d]
    expected = {f['id'] for f in selected}
    if set(normal_nodes) != expected or len(set(normal_nodes.values())) != len(normal_nodes):
        raise ValueError('Solid normal ports must match every interior fibre once')
    springs = {s['id']: s for s in frame.springs}
    if len(springs) != len(frame.springs):
        raise ValueError('Duplicate source spring ID')
    old_port_nodes = {node for rows in original_vertical['portTerms'] for node, _ in rows}
    protected = copy.deepcopy((model.get('families'), model.get('lowerCoreBodies'),
                               frame.loads, frame.nodes, frame.fixed, frame.members))
    replacements = {}
    audits = []
    maximum_wrench_residual = 0.
    old_normal_candidates = set()
    for f in selected:
        node = normal_nodes[f['id']]
        if not isinstance(node, str) or node not in frame.nodes or node in old_port_nodes:
            raise ValueError('New solid normal scalar must be a distinct existing point')
        point = frame.nodes[node]
        if len(point) != 3 or not all(_number(v) for v in point) or list(point[:2]) != list(f['xyMm']):
            raise ValueError('Solid normal scalar is not at the exact physical contact XY')
        if (node, 2) in frame.fixed or any(frame.fixed.get((node, i)) != 0 for i in (0, 1, 3, 4, 5)):
            raise ValueError('Only the solid normal UZ coordinate may be free; no physical UZ restraint')
        spring = springs.get(f['id'])
        if (spring is None or spring.get('mode') != 'compression' or spring.get('gap') != 0
                or not _number(spring.get('stiffness')) or spring['stiffness'] <= 0
                or spring['stiffness'] != f['stiffnessKNPerMm']):
            raise ValueError('Original source contact law is unavailable or changed')
        upper = _upper_trace(original_vertical, f['xyMm'])
        actual = _terms(spring['terms'])
        if any(n not in actual or not _same_trace({n: actual[n]}, {n: row}) for n, row in upper.items()):
            raise ValueError('Original spring does not retain the authenticated upper plate trace')
        # Source upper and lower node catalogues are disjoint.  Preserve the
        # lower rows byte-for-byte instead of subtracting/rounding their terms.
        lower = copy.deepcopy([(n, row) for n, row in spring['terms'] if n not in upper])
        if not lower or node in {n for n, _ in lower}:
            raise ValueError('Missing or aliased independent lower body/grid trace')
        expected_wrench = [0., 0., 1., f['xyMm'][1] / 1000, -f['xyMm'][0] / 1000, 0.]
        new_upper = [(node, [0., 0., 1., 0., 0., 0.])]
        old_rows = list(upper.items())
        residual = max(abs(v - target) for rows in (old_rows, new_upper)
                       for v, target in zip(_wrench(frame, rows), expected_wrench))
        if residual > 1e-8:
            raise ValueError('Normal trace loses physical force or first moments')
        # Both sides must share rigid motion.  A false fixed lower trace cannot
        # be made to look like an ordinary compression spring by this helper.
        old_closure = _wrench(frame, [*old_rows, *lower])
        if max(abs(v) for v in old_closure) > 1e-8:
            raise ValueError('Original upper/lower normal law fails rigid virtual work')
        maximum_wrench_residual = max(maximum_wrench_residual, residual, max(abs(v) for v in old_closure))
        replacements[f['id']] = {**spring, 'terms': [*new_upper, *lower]}
        old_normal_candidates.update(n for n in upper if n.startswith('VERTICAL-FLOOR/normal/'))
        audits.append({'fibreId': f['id'], 'xyMm': list(f['xyMm']), 'solidSurfaceZMm': point[2],
                       'oldUpperTerms': old_rows, 'newUpperTerms': new_upper, 'unchangedLowerTerms': lower,
                       'stiffnessKNPerMm': spring['stiffness'], 'mode': spring['mode'], 'gapMm': spring['gap'],
                       'unitWrenchResidualKN_KNm': residual})
    # No mutation occurs before every mapping/law/work check has passed.
    frame.springs = [replacements.get(s['id'], s) for s in frame.springs]
    after = (model.get('families'), model.get('lowerCoreBodies'),
             frame.loads, frame.nodes, frame.fixed, frame.members)
    if protected != after:
        raise ValueError('Normal remap changed protected body/G/grid/frame state')
    return {'schema': 'str-finite-joint-normal-remap/1', 'patchXYMm': list(patch_xy_mm),
            'count': len(audits), 'fibreIds': sorted(expected), 'contacts': audits,
            'maximumUnitWrenchResidualKN_KNm': maximum_wrench_residual,
            'bodyOwnGAndDensityUnchanged': True, 'loadFamiliesAndFrameLoadsUnchanged': True,
            'lowerSerialBodyAndGridTraceUnchanged': True, 'contactLawsUnchanged': True,
            'nodeCoordinatesAndFixitiesUnchanged': True, 'physicalFrameMembersUnchanged': True,
            'oldNormalNodeCandidates': sorted(old_normal_candidates),
            'callerMustProveUnusedBeforeGaugeFixing': True,
            'scope': 'Only exact normal top-contact work traces replaced. No support resistance, material or joint acceptance.'}
