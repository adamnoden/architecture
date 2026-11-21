"""Named nonuniform loads on the actual condensed plate, including recovery.

The force vector is assembled on the existing physical elements. Condensation
must retain its particular displacement; moving only its total to supports is
not an equivalent bending problem. No material or resistance is supplied here.
"""
import math

from vertical_floor_plate import GAUSS, rectangle_shapes, recover_vertical_plate


def _intersection(a, b):
    r = [max(a[0], b[0]), max(a[1], b[1]), min(a[2], b[2]), min(a[3], b[3])]
    return r if r[2] > r[0] and r[3] > r[1] else None


def patch_force(assembled, patches):
    """Integrate authored rectangular pressure patches on existing MITC4 cells.

    Positive pressure is downwards, in kN/mm2. Uncovered area and load remain
    explicit; the caller must route them to a real receiver or reject the case.
    Shared edges have zero area and never create duplicate load.
    """
    force = {}; origins = []; coverage = []
    identifiers = set()
    for patch in patches:
        if not isinstance(patch, dict) or set(patch) != {'id', 'rectangleXYMm', 'pressureKNPerMm2'}:
            raise ValueError('Exact named rectangular pressure patch required')
        identifier = patch['id']; rectangle = patch['rectangleXYMm']; pressure = patch['pressureKNPerMm2']
        if not isinstance(identifier, str) or not identifier or identifier in identifiers:
            raise ValueError('Unique stable pressure patch IDs required')
        identifiers.add(identifier)
        if (not isinstance(rectangle, (list, tuple)) or len(rectangle) != 4
                or any(type(v) not in (int, float) or not math.isfinite(v) for v in rectangle)
                or rectangle[2] <= rectangle[0] or rectangle[3] <= rectangle[1]
                or type(pressure) not in (int, float) or not math.isfinite(pressure)):
            raise ValueError('Finite pressure and positive finite physical patch required')
        covered = 0.; mx = my = 0.
        for element in assembled['elements']:
            cell = element['rectangleXYMm']; overlap = _intersection(rectangle, cell)
            if overlap is None: continue
            x0, y0, x1, y1 = overlap; area = (x1-x0)*(y1-y0)
            covered += area; mx += area*(x0+x1)/2; my += area*(y0+y1)/2
            width, height = cell[2]-cell[0], cell[3]-cell[1]
            for xi in GAUSS:
                for eta in GAUSS:
                    x = (x0+x1)/2 + xi*(x1-x0)/2
                    y = (y0+y1)/2 + eta*(y1-y0)/2
                    n, _, _ = rectangle_shapes(2*(x-cell[0])/width-1, 2*(y-cell[1])/height-1, width, height)
                    for local, coefficient in enumerate(n):
                        for index, value in element['terms'][3*local]:
                            force[index] = force.get(index, 0.) - pressure*area/4*coefficient*value
        full_area = (rectangle[2]-rectangle[0])*(rectangle[3]-rectangle[1])
        if covered > full_area + 1e-6: raise ValueError('Overlapping physical elements duplicate a patch')
        coverage.append({'id': identifier, 'authoredAreaMm2': full_area, 'coveredAreaMm2': covered,
            'uncoveredAreaMm2': max(0., full_area-covered),
            'authoredDownKN': pressure*full_area, 'coveredDownKN': pressure*covered,
            'uncoveredDownKN': pressure*(full_area-covered)})
        if covered:
            origins.append({'id': identifier, 'pointXYMm': [mx/covered, my/covered],
                'forceZKN': -pressure*covered})
    return {'force': force, 'origins': origins, 'coverage': coverage,
        'coveredDownKN': -math.fsum(row['forceZKN'] for row in origins),
        'uncoveredDownKN': math.fsum(row['uncoveredDownKN'] for row in coverage)}


def condense_named_force(operator, force):
    """Reuse the same stiffness factorisation; preserve arbitrary interior work."""
    assembled = operator['assembled']; count = assembled['dofCount']; n = assembled['portCount']
    if not isinstance(force, dict) or any(type(i) is not int or not 0 <= i < count
            or type(v) not in (int, float) or not math.isfinite(v) for i, v in force.items()):
        raise ValueError('Finite actual plate-coordinate force vector required')
    if 'sparseRecovery' in operator:
        import numpy as np
        r = operator['sparseRecovery']
        interior = np.array([force.get(i, 0.) for i in range(n, count)]) * r['interiorScale']
        particular = r['factor'].solve(interior)
        load = np.array([force.get(i, 0.) for i in range(n)]) - r['interiorCoupling'].T @ particular
        energy = float(interior @ particular/2)
        return {'condensedForceKN': load.tolist(), 'loadOnlyEnergyKNmm': energy}
    if 'steps' not in operator: raise ValueError('Physical plate condensation recovery is missing')
    remaining = dict(force); energy = 0.
    for index, pivot, neighbours in operator['steps']:
        value = remaining.pop(index, 0.); energy += value*value/(2*pivot)
        for target, stiffness in neighbours:
            remaining[target] = remaining.get(target, 0.) - stiffness*value/pivot
    return {'condensedForceKN': [remaining.get(i, 0.) for i in range(n)], 'loadOnlyEnergyKNmm': energy}


def recover_named_loads(operator, port_displacements, self_weight_factor, named_loads):
    """Recover the final simultaneous field, with each named load's own factor."""
    if type(self_weight_factor) not in (int, float) or not math.isfinite(self_weight_factor):
        raise ValueError('Finite physical self-weight combination factor required')
    assembled = operator['assembled']
    force = {i: self_weight_factor*v for i, v in assembled['force'].items()}
    for vector, factor in named_loads:
        if type(factor) not in (int, float) or not math.isfinite(factor): raise ValueError('Finite named load factor required')
        condense_named_force(operator, vector)  # Reject invalid coordinate indices/values; the caller binds sources.
        for index, value in vector.items(): force[index] = force.get(index, 0.) + factor*value
    return recover_vertical_plate({**operator, 'assembled': {**assembled, 'force': force}}, port_displacements)
