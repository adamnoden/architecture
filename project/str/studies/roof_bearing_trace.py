"""Work-dual vertical traces on the existing continuous Euler roof ring."""
import math


def ring_vertical_trace(rings, ring_nodes, point, half_width_mm=110.):
    if len(point) != 2 or any(type(v) not in (int,float) or not math.isfinite(v) for v in point):
        raise ValueError('Finite physical ring bearing XY required')
    candidates = []
    for a,b in rings:
        if (a[0] == b[0]) == (a[1] == b[1]): raise ValueError('Actual axis-aligned ring member required')
        axis = 0 if a[0] != b[0] else 1; transverse = 1-axis
        if not min(a[axis],b[axis]) <= point[axis] <= max(a[axis],b[axis]): continue
        offset = point[transverse]-a[transverse]
        if abs(offset) <= half_width_mm: candidates.append((abs(offset),a,b,axis,offset))
    if not candidates: raise ValueError('Bearing has no actual finite ring member')
    minimum = min(r[0] for r in candidates)
    candidates = [r for r in candidates if abs(r[0]-minimum) < 1e-9]
    # At a real shared node both adjacent traces are the identical nodal trace.
    traces = []
    for _,a,b,axis,offset in candidates:
        length = math.dist(a,b); sign = 1 if b[axis] > a[axis] else -1
        t = (point[axis]-a[axis])/(b[axis]-a[axis])
        h = [1-3*t*t+2*t**3,length*(t-2*t*t+t**3),3*t*t-2*t**3,length*(-t*t+t**3)]
        left = [0.,0.,h[0],0.,0.,0.];right = [0.,0.,h[2],0.,0.,0.]
        rotation_axis = 4 if axis == 0 else 3
        left[rotation_axis] = (-sign if axis == 0 else sign)*h[1]
        right[rotation_axis] = (-sign if axis == 0 else sign)*h[3]
        # Actual normal offset; ring torsion interpolation is linear.
        torsion_axis = 3 if axis == 0 else 4
        left[torsion_axis] += (offset if axis == 0 else -offset)*(1-t)
        right[torsion_axis] += (offset if axis == 0 else -offset)*t
        trace = [(ring_nodes[tuple(p)],row) for p,row in ((a,left),(b,right)) if any(row)]
        traces.append(trace)
    def normalized(trace):return sorted((node,tuple(row)) for node,row in trace)
    if any(normalized(trace) != normalized(traces[0]) for trace in traces[1:]):
        raise ValueError('Ambiguous ring bearing trace; no nearest-node substitution')
    return traces[0]
