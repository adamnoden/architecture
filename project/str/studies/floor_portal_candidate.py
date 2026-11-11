"""Shared leading comparator and guide-response recovery for STR-FLOOR-PORTAL.

The leading comparator is an analysis configuration, not a fabricated detail or
construction adoption. Its high tangential stiffness brackets guide forces while
the radial release preserves the intended thermal kinematics.
"""
from collections import defaultdict
import numpy as np

from floor_portal_house import Parameters


SIX_L_KEYS=((200.,70.),(475.,70.),(725.,70.),(70.,200.),(70.,475.),(70.,725.))
GUIDE_TRAVEL_RESERVE_MM=10.


def leading_parameters():
    return Parameters(
        corner_width=250.,corner_haunch=120.,
        cap_key_width=50.,cap_key_thickness=20.,cap_key_depth=60.,
        L_key_width=70.,L_key_thickness=20.,L_key_depth=60.,
        L_key_centres=SIX_L_KEYS,
        key_profile='triangular depth bearing',
        key_direction_mode='radial-guide',
    )


def named_parameters(name):
    if name!='guided-t20':raise ValueError(name)
    return leading_parameters()


def guide_state(h,u):
    groups=defaultdict(lambda:np.zeros(6));active=defaultdict(float);released=defaultdict(float)
    for e in h.cap_links:
        name=e['name']
        if not (name.startswith('cap-key-') or name.startswith('L-cap-key-')):continue
        relative=e['t']@u[e['ids']];groups[name]+=e['k']@relative
        trans=e['k'][:3,:3];values,vectors=np.linalg.eigh(trans)
        ids=np.flatnonzero(values>max(1.,values.max()*1e-12))
        if len(ids):
            active[name]=max(active[name],max(abs(float(vectors[:,i]@relative[:3])) for i in ids))
        if h.p.key_direction_mode=='radial-guide':
            values2,vectors2=np.linalg.eigh(trans[:2,:2]);radial=vectors2[:,int(np.argmin(values2))]
            released[name]=max(released[name],abs(float(radial@relative[:2])))
    return {name:dict(
        forceAndMoment=np.asarray(force),
        activeShearMM=float(active[name]),
        releasedTravelMM=float(released[name]),
    ) for name,force in groups.items()}


def root_stress_mpa(h,name,force):
    if name.startswith('L-cap-key-'):
        width,thickness,depth=h.p.L_key_width,h.p.L_key_thickness,h.p.L_key_depth
    else:
        width,thickness,depth=h.p.cap_key_width,h.p.cap_key_thickness,h.p.cap_key_depth
    lever=depth*(2/3 if h.p.key_profile=='triangular depth bearing' else .5)
    modulus=width*thickness**2/6
    return float(force*lever/modulus)


def update_bounds(bounds,h,u,case_index,case_name):
    for name,state in guide_state(h,u).items():
        row=bounds.setdefault(name,dict(
            maximumDirectionalForceN=0.,forceCase=None,forceCaseName=None,
            maximumActiveShearMM=0.,activeCase=None,activeCaseName=None,
            maximumReleasedTravelMM=0.,releasedCase=None,releasedCaseName=None,
        ))
        force=float(np.max(abs(state['forceAndMoment'][:2])))
        if force>row['maximumDirectionalForceN']:
            row.update(maximumDirectionalForceN=force,forceCase=case_index,forceCaseName=case_name)
        if state['activeShearMM']>row['maximumActiveShearMM']:
            row.update(maximumActiveShearMM=state['activeShearMM'],activeCase=case_index,activeCaseName=case_name)
        if state['releasedTravelMM']>row['maximumReleasedTravelMM']:
            row.update(maximumReleasedTravelMM=state['releasedTravelMM'],releasedCase=case_index,releasedCaseName=case_name)


def finalise_bounds(bounds,h):
    out={}
    for name,row in bounds.items():
        item=dict(row)
        item['maximumDirectionalForceKN']=item.pop('maximumDirectionalForceN')/1000
        item['elasticPlateRootScreenMPa']=root_stress_mpa(h,name,item['maximumDirectionalForceKN']*1000)
        assert item['maximumReleasedTravelMM']<=GUIDE_TRAVEL_RESERVE_MM,(name,item['maximumReleasedTravelMM'],GUIDE_TRAVEL_RESERVE_MM)
        item['declaredReleasedTravelReservePlusMinusMM']=GUIDE_TRAVEL_RESERVE_MM
        out[name]=item
    return out
