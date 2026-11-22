"""Exact work-dual finite frame attachment to existing distributed receivers.

Physical endpoint coordinates remain explicit. The member energy is substituted
through the endpoint displacement maps; no penalty, nearest support or added
restraint is used. Rotations are radians at this boundary.
"""
import math
from joined_successor_kernel import frame_matrix


def node_trace(node):
    return [[(node,[1. if i==j else 0. for j in range(6)])] for i in range(6)]


def combine(rows,coefficients):
    terms={}
    for coefficient,trace in zip(coefficients,rows):
        for node,row in trace:
            target=terms.setdefault(node,[0.]*6)
            for i,value in enumerate(row):target[i]+=coefficient*value
    return [(node,row) for node,row in terms.items() if any(row)]


def mapped_frame_member(frame,identifier,start,end,section,material,end_maps,y_axis):
    """Add the true 12-coordinate frame energy after exact map substitution."""
    import numpy as np
    if len(end_maps)!=12 or identifier in getattr(frame,'mappedMembers',{}):raise ValueError('Unique actual mapped frame and twelve physical coordinate maps required')
    for trace in end_maps:
        if not trace:raise ValueError('Missing actual finite member coordinate map')
        for node,row in trace:
            if node not in frame.nodes or len(row)!=6 or any(not math.isfinite(v) for v in row):raise ValueError('Finite actual frame work map required')
    k=np.array(frame_matrix(start,end,section,material,y_axis));scale=np.array([1,1,1,.001,.001,.001]*2)
    scaled=scale[:,None]*k*scale[None,:];values,vectors=np.linalg.eigh((scaled+scaled.T)/2)
    maximum=float(np.max(abs(scaled)))
    if min(values)<-maximum*1e-9:raise ValueError('Negative physical mapped member energy')
    selected=values>maximum*1e-12
    modes=(vectors[:,selected]*np.sqrt(values[selected])).T/scale[None,:]
    error=float(np.max(abs(modes.T@modes-k))/max(1.,float(np.max(abs(k)))))
    if error>1e-9:raise ValueError('Mapped finite frame operator failed physical energy reconstruction')
    for i,mode in enumerate(modes):frame.springs.append({'id':identifier+'/energy/'+str(i),'terms':combine(end_maps,mode),'stiffness':1.,'mode':'bilateral','gap':0.})
    if not hasattr(frame,'mappedMembers'):frame.mappedMembers={}
    result={'id':identifier,'physicalStartMm':list(start),'physicalEndMm':list(end),'physicalK':k.tolist(),'endMaps':end_maps,'energyReconstructionRelativeError':error}
    frame.mappedMembers[identifier]=result
    return result


def mapped_load(target,member,vector):
    for node,row in combine(member['endMaps'],vector):
        total=target.setdefault(node,[0.]*6)
        for i,value in enumerate(row):total[i]+=value


def recover_mapped_member(member,displacements,equivalent_load=None):
    u=[sum(v*displacements[node][i] for node,row in trace for i,v in enumerate(row)) for trace in member['endMaps']]
    equivalent_load=equivalent_load or [0.]*12
    return {'physicalEndDisplacementsMmRad':u,'physicalEndWrenchesKN_KNmm':[sum(a*b for a,b in zip(row,u))-f for row,f in zip(member['physicalK'],equivalent_load)]}
