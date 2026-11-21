"""Vertical plate traces on actual orthogonal finite frame members.

The displacement map is the transpose of the member's consistent point-load
map. No extra scalar support or penalty stiffness is introduced.
"""
import math

from rc_floor_house_loads import consistent_member_point_load


def vertical_receiver_trace(model, receiver, point, coordinate):
    """Return plate-coordinate coefficients (w, rx, ry), rotations in radians."""
    axis=receiver['axis']; transverse=1-axis;r=receiver['rectangleXYMm']
    if axis not in (0,1) or coordinate not in (0,1,2):raise ValueError('Orthogonal receiver and actual plate coordinate required')
    if not r[0]-1e-7<=point[0]<=r[2]+1e-7 or not r[1]-1e-7<=point[1]<=r[3]+1e-7:return None
    stations=receiver['stations'];u=point[axis];frame=model['model']
    if u<=stations[0]['u'] or u>=stations[-1]['u']:
        station=stations[0] if u<=stations[0]['u'] else stations[-1]
        node=frame.nodes[station['node']];w,rx,ry=station['indices']
        return [(w,1.),(rx,(point[1]-node[1])/1000),(ry,-(point[0]-node[0])/1000)] if coordinate==0 else [(rx if coordinate==1 else ry,.001)]
    i=next(i for i,(a,b) in enumerate(zip(stations,stations[1:])) if a['u']<=u<=b['u'])
    a,b=stations[i:i+2];name=receiver['memberNames'][i];member=model['members'][name]
    if (member['a'],member['b'])!=(a['node'],b['node']):raise ValueError('Actual receiver member does not join its named ports')
    if any(abs(member['physicalStartMm'][j]-member['physicalEndMm'][j])>1e-7 for j in (transverse,2)):
        raise ValueError('Only actual horizontal orthogonal receivers supported')
    p=[point[0],point[1],receiver['centroidZMm']]
    force=[0.,0.,1.] if coordinate==0 else [0.,0.,0.]
    moment=[1.,0.,0.] if coordinate==1 else [0.,1.,0.] if coordinate==2 else [0.,0.,0.]
    vector=consistent_member_point_load(model,member,p,force,moment);terms=[]
    for end,station in enumerate((a,b)):
        row=vector[6*end:6*end+6]
        if max(abs(row[j]) for j in (0,1,5))>1e-9:raise ValueError('Vertical receiver introduced an unrepresented in-plane coordinate')
        w,rx,ry=station['indices'];terms.extend(((w,row[2]),(rx,row[3]/1000),(ry,row[4]/1000)))
    return [(i,v) for i,v in terms if v]
