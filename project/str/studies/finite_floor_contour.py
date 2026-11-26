"""Exploratory solid with distributed shell-contour ports; no native admission."""
from __future__ import annotations
import numpy as np
from scipy.sparse import coo_matrix
from scipy.sparse.linalg import splu
from skfem import Basis, ElementHex1, ElementVector, MeshHex, asm
from skfem.models.elasticity import lame_parameters, linear_elasticity


def memory_phase(phase, **values):
    """Opt-in execution observations only; never semantic/physical evidence."""
    import json,os,resource,time
    path=os.environ.get('STR_FINITE_MEMORY_TRACE')
    if not path:return
    rss=None
    try:
        with open('/proc/self/status') as stream:
            for line in stream:
                if line.startswith('VmRSS:'):rss=int(line.split()[1]);break
    except OSError:pass
    row={'phase':phase,'monotonicSeconds':time.monotonic(),'rssKiB':rss,'maximumRssKiB':resource.getrusage(resource.RUSAGE_SELF).ru_maxrss,**values}
    with open(path,'a') as stream:stream.write(json.dumps(row,allow_nan=False)+'\n');stream.flush()


def axis(breaks, pitch):
    points = sorted(set(float(v) for v in breaks))
    return np.concatenate([np.linspace(a, b, int(np.ceil((b-a)/pitch))+1)[:-1]
                           for a, b in zip(points, points[1:])] + [[points[-1]]])


def solid_boxes(boxes, pitch_m, young_kn_m2, poisson, extra_axes=((), (), ())):
    boxes = np.asarray(boxes, dtype=float)
    if (boxes.ndim != 2 or boxes.shape[1] != 6 or not np.isfinite(boxes).all()
        or np.any(boxes[:, 3:] <= boxes[:, :3]) or not np.isfinite(pitch_m) or pitch_m <= 0
        or not np.isfinite(young_kn_m2) or young_kn_m2 <= 0 or not np.isfinite(poisson)
        or not -1 < poisson < .5):
        raise ValueError('unsupported box geometry/material')
    for i, a in enumerate(boxes):
        for b in boxes[i+1:]:
            if np.all(np.minimum(a[3:], b[3:]) > np.maximum(a[:3], b[:3])):
                raise ValueError('overlapping box material')
    axes = []
    for k in range(3):
        lo, hi = boxes[:, k].min(), boxes[:, k+3].max()
        extra = list(extra_axes[k])
        if any(not np.isfinite(x) or not lo <= x <= hi for x in extra):
            raise ValueError('extra axis outside actual material bounds')
        axes.append(axis([*boxes[:, k], *boxes[:, k+3], *extra], pitch_m))
    mesh = MeshHex.init_tensor(*axes)
    centers = mesh.p[:, mesh.t].mean(axis=1)
    occupied = np.zeros(mesh.nelements, dtype=bool)
    for box in boxes:
        occupied |= np.all((centers > box[:3, None]) & (centers < box[3:, None]), axis=0)
    mesh = mesh.remove_elements(np.flatnonzero(~occupied)).remove_unused_nodes()
    basis = Basis(mesh, ElementVector(ElementHex1()), intorder=3)
    k = asm(linear_elasticity(*lame_parameters(young_kn_m2, poisson)), basis).tocsc()
    expected = float(np.prod(boxes[:, 3:]-boxes[:, :3], axis=1).sum())
    if not np.isclose(float(basis.dx.sum()), expected, atol=1e-12, rtol=1e-11):
        raise ValueError('solid mesh does not preserve actual material union')
    return mesh, basis, k, expected


def shell_trace(zeta):
    # q=[u0,v0,w,rx,ry]; U=u0+zeta*ry,V=v0-zeta*rx,W=w.
    return np.array([[1, 0, 0, 0, zeta], [0, 1, 0, -zeta, 0], [0, 0, 1, 0, 0]], float)


def rigid_trace(point, origin):
    x, y, z = np.asarray(point)-origin
    return np.array([[1, 0, 0, 0, z, -y], [0, 1, 0, -z, 0, x], [0, 0, 1, y, -x, 0]], float)


def contour_ports(mesh, basis, patch_xy, slab_z, contours, wall_origins):
    """Actual north/east edge station interpolation, in SI work-conjugate units.

    End-face rigid traces and shell side traces are independent. West/south edges
    are free here: a native insertion still needs actual band/chord interfaces.
    """
    patch = np.asarray(patch_xy, float); low, high = slab_z; middle=(low+high)/2
    if patch.shape != (4,) or not np.isfinite(patch).all() or low >= high:
        raise ValueError('unsupported physical patch')
    expected = {'east', 'north'}
    if set(contours) != expected:
        raise ValueError('explicit east/north contours required')
    catalog=[];lookup={};sides={}
    for side in ['east', 'north']:
        points=np.asarray(contours[side], float)
        if points.ndim != 1 or len(points)<2 or not np.isfinite(points).all() or np.any(np.diff(points)<=0):
            raise ValueError('finite strictly increasing actual contour stations required')
        a, b=(patch[1],patch[3]) if side=='east' else (patch[0],patch[2])
        if abs(points[0]-a)>1e-12 or abs(points[-1]-b)>1e-12:
            raise ValueError('contour stations must span physical edge exactly')
        side_rows=[]
        for value in points:
            xy=(patch[2],value) if side=='east' else (value,patch[3])
            if xy not in lookup:
                index=len(catalog);lookup[xy]=index
                catalog.extend({'id':f'floor/{xy[0]:.12g}/{xy[1]:.12g}/{coordinate}',
                                'kind':'shell','xyM':list(xy),'coordinate':coordinate,'zM':middle}
                               for coordinate in ['u','v','w','rx','ry'])
            side_rows.append(lookup[xy])
        sides[side]=(points,side_rows)
    wall_indices=[]
    for end, origin in enumerate(wall_origins):
        if np.asarray(origin).shape != (3,) or not np.isfinite(origin).all():
            raise ValueError('finite actual wall end origin required')
        wall_indices.append(len(catalog))
        catalog.extend({'id':f'wall/{end}/{coordinate}','kind':'wall','originM':list(origin),'coordinate':coordinate}
                       for coordinate in ['u','v','w','rx','ry','rz'])
    rows=[];cols=[];values=[];constrained=[]
    def add(node, transform, start, factor=1):
        for d in range(3):
            for q,value in enumerate(transform[d]):
                if value:
                    rows.append(int(basis.nodal_dofs[d,node]));cols.append(start+q);values.append(value*factor)
    for node, p in enumerate(mesh.p.T):
        wall=[e for e,origin in enumerate(wall_origins) if abs(p[2]-origin[2])<1e-12]
        side=None
        if low-1e-12 <= p[2] <= high+1e-12:
            side='east' if abs(p[0]-patch[2])<1e-12 else 'north' if abs(p[1]-patch[3])<1e-12 else None
        if wall and side: raise ValueError('overlapping physical boundary duties')
        if wall:
            if len(wall)!=1:raise ValueError('duplicate wall end plane')
            e=wall[0];add(node,rigid_trace(p,np.asarray(wall_origins[e])),wall_indices[e])
        elif side:
            stations,starts=sides[side];value=p[1] if side=='east' else p[0]
            i=min(max(np.searchsorted(stations,value,side='right')-1,0),len(stations)-2)
            weight=(value-stations[i])/(stations[i+1]-stations[i])
            if weight < -1e-10 or weight > 1+1e-10:raise ValueError('no contour extrapolation')
            trace=shell_trace(p[2]-middle)
            add(node,trace,starts[i],1-weight);add(node,trace,starts[i+1],weight)
        else:continue
        constrained.extend(basis.nodal_dofs[:,node])
    transform=coo_matrix((values,(rows,cols)),shape=(basis.N,len(catalog))).tocsc()
    boundary=np.array(sorted(set(constrained)))
    if not len(boundary) or np.any(np.diff(boundary)<=0):raise ValueError('empty/invalid boundary')
    # Every authored boundary coordinate must have physical work participation.
    if np.any(np.asarray(abs(transform).sum(axis=0)).ravel()==0):raise ValueError('orphan contour port')
    return transform,boundary,catalog


def condense(k, transform, boundary, force=None, ordering="MMD_AT_PLUS_A", rhs_batch_size=16):
    if type(rhs_batch_size) is not int or not 1<=rhs_batch_size<=128:raise ValueError('Explicit bounded direct RHS batch size required')
    interior=np.setdiff1d(np.arange(k.shape[0]),boundary)
    if ordering not in ["MMD_AT_PLUS_A", "COLAMD"]:raise ValueError("unsupported factorization ordering")
    memory_phase('factor:start',fullDofs=k.shape[0],interiorDofs=len(interior),ports=transform.shape[1],matrixNonzeros=k.nnz)
    factor=splu(k[interior][:,interior],permc_spec=ordering)
    memory_phase('factor:complete',factorNonzeros=int(factor.nnz))
    response=transform.toarray()
    port_rhs=(k @ transform)[interior].tocsc()
    for start in range(0,transform.shape[1],rhs_batch_size):
        stop=min(transform.shape[1],start+rhs_batch_size)
        rhs=port_rhs[:,start:stop].toarray(order='F')
        solution=factor.solve(rhs);solution*=-1
        response[interior,start:stop]=solution
        del rhs,solution
        memory_phase('rhs:batch',start=start,stop=stop)
    del port_rhs
    condensed=np.empty((transform.shape[1],transform.shape[1]))
    for start in range(0,transform.shape[1],rhs_batch_size):
        stop=min(transform.shape[1],start+rhs_batch_size)
        work=k @ response[:,start:stop]
        condensed[:,start:stop]=response.T @ work
        del work
    force=np.zeros(k.shape[0]) if force is None else np.asarray(force)
    if force.shape!=(k.shape[0],) or not np.isfinite(force).all():raise ValueError('invalid actual distributed load')
    particular=np.zeros(k.shape[0]);particular[interior]=factor.solve(force[interior])
    memory_phase('condensation:complete',responseBytes=response.nbytes,rhsBatchSize=rhs_batch_size)
    return {'stiffness':condensed,'response':response,'particular':particular,
            'force':response.T @ force,'energyConstant':float(-.5*force @ particular),
            'interior':interior}


def rigid_port_modes(catalog):
    modes=[]
    coordinates=['u','v','w','rx','ry','rz']
    for port in catalog:
        coordinate=coordinates.index(port['coordinate'])
        if coordinate<3:
            point=port['originM'] if port['kind']=='wall' else [*port['xyM'],port['zM']]
            modes.append(rigid_trace(point,np.zeros(3))[coordinate])
        else:
            row=np.zeros(6);row[coordinate]=1;modes.append(row)
    return np.asarray(modes)
