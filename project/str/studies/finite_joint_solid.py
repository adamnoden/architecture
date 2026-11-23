"""Exploratory finite L component, using scikit-fem's established solid operator.

SI geometry; kN/m² modulus; kN/m³ unit weight. This is an isotropic elastic
comparison, NOT the native cracked slab/CST/frame law or a capacity model.
The end ports permit wall calibration. Distributed slab-edge ports and exact
global material/operator replacement are deliberately not implemented here.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

import numpy as np
from scipy.sparse import coo_matrix
from scipy.sparse.linalg import splu
from skfem import Basis, ElementHex1, ElementVector, LinearForm, MeshHex, asm
from skfem.models.elasticity import lame_parameters, linear_elasticity


def _axis(breaks, pitch):
    values = sorted(set(float(x) for x in breaks))
    return np.concatenate([np.linspace(a, b, int(np.ceil((b-a)/pitch))+1)[:-1]
                           for a, b in zip(values, values[1:])] + [[values[-1]]])


def component(rectangles_m, z_breaks_m, pitch_m, young_kn_m2, poisson):
    """Mesh the exact non-overlapping rectangle union; no filled re-entrant void."""
    r = np.asarray(rectangles_m, dtype=float)
    z = np.asarray(z_breaks_m, dtype=float)
    if (r.ndim != 2 or r.shape[1] != 4 or not np.isfinite(r).all()
            or np.any(r[:, 2:] <= r[:, :2]) or len(z) < 2
            or not np.isfinite(z).all() or np.any(np.diff(z) <= 0)
            or not np.isfinite(pitch_m) or pitch_m <= 0
            or not np.isfinite(young_kn_m2) or young_kn_m2 <= 0
            or not np.isfinite(poisson) or not -1 < poisson < .5):
        raise ValueError('unsupported geometry/material')
    for i, a in enumerate(r):
        for b in r[i+1:]:
            if np.all(np.minimum(a[2:], b[2:]) > np.maximum(a[:2], b[:2])):
                raise ValueError('overlapping authored rectangles would double-count material')
    mesh = MeshHex.init_tensor(_axis(r[:, [0, 2]].ravel(), pitch_m),
                               _axis(r[:, [1, 3]].ravel(), pitch_m),
                               _axis(z, pitch_m))
    centers = mesh.p[:, mesh.t].mean(axis=1)
    occupied = np.zeros(mesh.nelements, dtype=bool)
    for a, b, c, d in r:
        occupied |= ((centers[0] > a) & (centers[0] < c)
                     & (centers[1] > b) & (centers[1] < d))
    mesh = mesh.remove_elements(np.flatnonzero(~occupied)).remove_unused_nodes()
    basis = Basis(mesh, ElementVector(ElementHex1()), intorder=3)
    stiffness = asm(linear_elasticity(*lame_parameters(young_kn_m2, poisson)), basis).tocsc()
    volume = float(basis.dx.sum())
    authored_volume = float(np.prod(r[:, 2:]-r[:, :2], axis=1).sum()*(z[-1]-z[0]))
    if not np.isclose(volume, authored_volume, rtol=1e-11, atol=1e-13):
        raise ValueError('solid volume differs from exact authored union')
    return mesh, basis, stiffness, volume


def rigid_trace(points, origin):
    """u(point) = translation + rotation × (point-origin), in conjugate SI ports."""
    traces = []
    for x, y, z in (points-np.asarray(origin)[:, None]).T:
        traces.append([[1, 0, 0, 0, z, -y], [0, 1, 0, -z, 0, x],
                       [0, 0, 1, y, -x, 0]])
    return np.asarray(traces)


def condense_end_ports(mesh, basis, stiffness, port_origin_xy=None):
    """Static Schur complement with exact rigid end faces; interior remains free.

    These 12 end ports do not supply the missing distributed floor interfaces.
    No grounding, diagonal regularisation or stiffness clipping is permitted.
    """
    ends = [np.flatnonzero(np.isclose(mesh.p[2], level, rtol=0, atol=1e-12))
            for level in (mesh.p[2].min(), mesh.p[2].max())]
    boundary = np.unique(np.concatenate([basis.nodal_dofs[:, ids].ravel() for ids in ends]))
    interior = np.setdiff1d(np.arange(basis.N), boundary)
    # Use physical area centroid, passed independently by the caller if needed;
    # this node mean is only the explicit port origin, not a mass centroid.
    xy = ((mesh.p[:2].min(axis=1)+mesh.p[:2].max(axis=1))/2
          if port_origin_xy is None else np.asarray(port_origin_xy, dtype=float))
    if xy.shape != (2,) or not np.isfinite(xy).all():
        raise ValueError('unsupported port origin')
    origins = [np.array([*xy, mesh.p[2, ids[0]]]) for ids in ends]
    rows, cols, values = [], [], []
    for end, (ids, origin) in enumerate(zip(ends, origins)):
        for node, trace in zip(ids, rigid_trace(mesh.p[:, ids], origin)):
            for direction in range(3):
                for port in range(6):
                    if trace[direction, port]:
                        rows.append(int(basis.nodal_dofs[direction, node]))
                        cols.append(end*6+port)
                        values.append(trace[direction, port])
    transform = coo_matrix((values, (rows, cols)), shape=(basis.N, 12)).tocsc()
    imposed = stiffness @ transform
    displacement = transform.toarray()
    displacement[interior] = -splu(stiffness[interior][:, interior]).solve(imposed[interior].toarray())
    condensed = np.asarray(displacement.T @ (stiffness @ displacement))
    residual = np.max(np.abs((stiffness @ displacement)[interior]))
    return condensed, displacement, np.asarray(origins), float(residual)


def gravity_force(basis, unit_weight):
    """Consistent body-G vector, including work, rather than half-weight end lumps."""
    @LinearForm
    def form(v, w):
        return -unit_weight(w.x)*v[2]
    force = asm(form, basis)
    if not np.isfinite(force).all():
        raise ValueError('unsupported body-G')
    return force


def condensed_load(stiffness, basis, mesh, displacement, force):
    ends = np.isclose(mesh.p[2], mesh.p[2].min(), rtol=0, atol=1e-12) | np.isclose(
        mesh.p[2], mesh.p[2].max(), rtol=0, atol=1e-12)
    interior = np.setdiff1d(np.arange(basis.N), basis.nodal_dofs[:, ends].ravel())
    particular = np.zeros(basis.N)
    particular[interior] = splu(stiffness[interior][:, interior]).solve(force[interior])
    return displacement.T @ force, particular, float(-.5*force @ particular)


def authored_sw_geometry(audit_path):
    path = Path(audit_path)
    audit = json.loads(path.read_text())
    joint = next(j for j in audit['joints'] if j['id'] == 'SW')
    if audit['plateThicknessMm'] != 200 or joint['volumeM3'] != .05208:
        raise ValueError('unsupported source revision; re-coordinate the component extent')
    return np.asarray(joint['footprintRectanglesXYMm'])/1000, hashlib.sha256(path.read_bytes()).hexdigest()
