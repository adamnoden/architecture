"""Recover physical MITC4 bending resultants from the solved rotation field.

This is a postprocessor of the existing plate constitutive law, not a new
structural solver or a reinforcement/anchorage design method. kN.mm/mm and
kN.m/m are numerically identical. No stress smoothing or cell-size exemption
is applied: very narrow source cells remain visible in the governing result.
"""
import math

from vertical_floor_plate import GAUSS, rectangle_shapes


def _finite_vector(value, length, label):
    if (not isinstance(value, (list, tuple)) or len(value) != length
            or any(type(x) not in (int, float) or not math.isfinite(x) for x in value)):
        raise ValueError('Finite ' + label + ' required')
    return value


def recover_plate_bending(result):
    plate = result['plate']
    law = result['request']['plateLaw']
    e, nu, thickness, factor = (law[k] for k in
        ('elasticModulusMPa', 'poissonRatio', 'thicknessMm', 'flexuralFactor'))
    _finite_vector([e, nu, thickness, factor], 4, 'plate bending law')
    if e <= 0 or not 0 <= nu < .5 or thickness <= 0 or not 0 < factor <= 1:
        raise ValueError('Unsupported physical plate bending law')
    rigidity = e / 1000 * factor * thickness ** 3 / (12 * (1 - nu ** 2))
    points = {}
    for row in plate['physicalRecovery']['points']:
        xy = tuple(_finite_vector(row['xyMm'], 2, 'plate point'))
        if xy in points:
            raise ValueError('Duplicate recovered plate point')
        points[xy] = _finite_vector(row['displacementMmRad'], 3, 'plate displacement and rotations')
    cells = []
    used = set()
    bending_energy = 0.
    for rectangle in plate['cellsXYMm']:
        x0, y0, x1, y1 = _finite_vector(rectangle, 4, 'physical plate cell')
        width, height = x1 - x0, y1 - y0
        if min(width, height) <= 0 or tuple(rectangle) in used:
            raise ValueError('Positive unique physical plate cells required')
        used.add(tuple(rectangle))
        corners = ((x0, y0), (x1, y0), (x1, y1), (x0, y1))
        if any(p not in points for p in corners):
            raise ValueError('Missing physical plate corner recovery')
        samples = []
        for xi in GAUSS:
            for eta in GAUSS:
                _, dx, dy = rectangle_shapes(xi, eta, width, height)
                # Exact same rotation/curvature convention as mitc4_element.
                kx = sum(dx[i] * points[p][2] for i, p in enumerate(corners))
                ky = -sum(dy[i] * points[p][1] for i, p in enumerate(corners))
                kxy = sum(dy[i] * points[p][2] - dx[i] * points[p][1]
                          for i, p in enumerate(corners))
                mx = rigidity * (kx + nu * ky)
                my = rigidity * (nu * kx + ky)
                mxy = rigidity * (1 - nu) * kxy / 2
                energy_density = (mx * kx + my * ky + mxy * kxy) / 2
                bending_energy += energy_density * width * height / 4
                samples.append({'xyMm': [(x0 + x1 + xi * width) / 2,
                                          (y0 + y1 + eta * height) / 2],
                    'curvaturePerMm': [kx, ky, kxy],
                    'momentKNmPerM': [mx, my, mxy],
                    'absoluteBendingPlusTwistingKNmPerM': [abs(mx) + abs(mxy), abs(my) + abs(mxy)]})
        cells.append({'rectangleXYMm': list(rectangle), 'minimumCellWidthMm': min(width, height),
                      'gaussSamples': samples})
    if not cells:
        raise ValueError('Actual nonempty physical plate field required')
    governing = max(({'cellIndex': i, 'direction': axis, **sample}
        for i, cell in enumerate(cells) for sample in cell['gaussSamples'] for axis in (0, 1)),
        key=lambda row: row['absoluteBendingPlusTwistingKNmPerM'][row['direction']])
    maximum = governing['absoluteBendingPlusTwistingKNmPerM'][governing['direction']]
    energy = plate['physicalRecovery'].get('physicalPlateStrainEnergyKNmm')
    if energy is not None:
        _finite_vector([energy], 1, 'physical plate strain energy')
        # Plate total energy also includes nonnegative transverse shear.
        if bending_energy > energy + 1e-7 * max(1, abs(energy)):
            raise ValueError('Recovered bending exceeds the actual plate strain energy')
    return {'schema': 'str-physical-plate-bending-recovery/1',
        'cellCount': len(cells), 'sampleCount': 4 * len(cells), 'cells': cells,
        'bendingStrainEnergyKNmm': bending_energy,
        'maximumAbsoluteBendingPlusTwistingKNmPerM': maximum, 'governing': governing,
        'localStressConvergenceProven': False, 'reinforcementAccepted': False,
        'anchorageAccepted': False,
        'scope': 'Constitutive cell-quadrature moments from the actual solved rotations. '
                 'Absolute bending plus absolute twisting is an inspection envelope, not a complete '
                 'reinforcement design or resistance check. Narrow cells and mesh dependence remain visible.'}
