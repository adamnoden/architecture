"""Shared leading comparator and guide-response recovery for STR-FLOOR-PORTAL.

The leading comparator is an analysis configuration, not a fabricated detail or
construction adoption. Its high tangential stiffness brackets guide forces while
the radial release preserves the intended thermal kinematics.
"""
from collections import defaultdict
import math
import numpy as np

from floor_portal_house import Parameters,ContactSolve


SIX_L_KEYS=((200.,70.),(475.,70.),(725.,70.),(70.,200.),(70.,475.),(70.,725.))
GUIDE_TRAVEL_RESERVE_MM=10.
JAMB_GUIDE_WIDTH_MM=45.
# Conservative H12-equivalent axial length: 621 development comparison +
# 159.3 P13LN open envelope + 100 threaded stub + 40 C13N + 25 cap.
JAMB_CAP_ANCHOR_EQUIVALENT_LENGTH_MM=945.3
GUIDE_FRICTION_PTFE_BENCHMARK=0.08
# Current GGB-CBM graphite/bronze sliding-plate family gives dry f=0.10..0.20.
# Use the upper end so the structural design does not depend on a polymer liner.
GUIDE_FRICTION_COMPARATOR=0.20


def leading_parameters():
    return Parameters(
        corner_width=250.,corner_haunch=120.,
        cap_key_width=JAMB_GUIDE_WIDTH_MM,cap_key_thickness=20.,cap_key_depth=60.,
        cap_anchor_length=JAMB_CAP_ANCHOR_EQUIVALENT_LENGTH_MM,
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


def guide_sliding_signs(h,u,deadband=1e-7):
    signs={}
    for index,e in enumerate(h.cap_links):
        if not (e['name'].startswith('cap-key-') or e['name'].startswith('L-cap-key-')):continue
        relative=e['t']@u[e['ids']];values,vectors=np.linalg.eigh(e['k'][:2,:2])
        radial=vectors[:,int(np.argmin(values))];slip=float(radial@relative[:2])
        signs[index]=0. if abs(slip)<=deadband else math.copysign(1.,slip)
    return signs


def guide_friction_vector(h,u,coefficient,signs=None):
    """Equal/opposite guide-friction bound in a fixed released-axis direction.

    The optional signs freeze physical sliding direction from the zero-friction
    state. That prevents a static/stick transition becoming numerical Coulomb
    chatter while the force magnitude follows the current guide force.
    """
    rhs=np.zeros(h.f.size);rows=[];maximum=0.;total=0.
    for index,e in enumerate(h.cap_links):
        if not (e['name'].startswith('cap-key-') or e['name'].startswith('L-cap-key-')):continue
        relative=e['t']@u[e['ids']]
        plan=e['k'][:2,:2];values,vectors=np.linalg.eigh(plan)
        active=int(np.argmax(values));released=int(np.argmin(values))
        normal_force=abs(float(vectors[:,active]@(e['k']@relative)[:2]))
        radial=vectors[:,released];slip=float(radial@relative[:2])
        direction=(signs or {}).get(index)
        if direction is None:direction=0. if abs(slip)<1e-9 else math.copysign(1.,slip)
        if normal_force<1e-9 or not direction:continue
        force2=-coefficient*normal_force*direction*radial
        force=np.r_[force2,0.]
        for port_sign,(ids,t) in zip((1.,-1.),e['ports']):
            np.add.at(rhs,ids,t.T@np.r_[port_sign*force,[0.,0.,0.]])
        magnitude=float(np.linalg.norm(force2));maximum=max(maximum,magnitude);total+=magnitude
        rows.append(dict(index=index,name=e['name'],normalGuideForceN=normal_force,
                         releasedSlipMM=slip,initialSlidingSign=direction,
                         reversedRelativeToInitial=bool(slip*direction<0),
                         frictionForceN=magnitude))
    balance=h.rigid.T@rhs
    assert max(abs(balance[:3]),default=0.)<.01,balance
    assert max(abs(balance[3:]),default=0.)<1.,balance
    return rhs,dict(maximumPointFrictionN=maximum,sumPointFrictionMagnitudesN=total,
                    directionReversalCount=sum(r['reversedRelativeToInitial'] for r in rows),
                    sixInternalResultantN_Nmm=balance.tolist(),points=rows)


class GuideFrictionSolve:
    """Adverse full-friction perturbation with a fixed physical direction.

    Sliding direction is frozen from the zero-friction state and the full
    friction bound is retained even if the perturbed response crosses through
    zero. Such a reversal means real Coulomb friction would enter stick before
    reaching this force; retaining it is therefore an intentional overdrive,
    not a claim to an exact sliding solution. Magnitude follows the current
    tangential guide reaction.
    """

    def __init__(self,h,coefficient=GUIDE_FRICTION_COMPARATOR):
        self.h=h;self.coefficient=float(coefficient);self.base=ContactSolve(h.k,h.fixed,h.contacts)

    def __call__(self,f,prescribed=None):
        u0,r0,c0=self.base(f,prescribed);signs=guide_sliding_signs(self.h,u0)
        friction=np.zeros(self.h.f.size);meta={};final_error=float('inf')
        for iterations in range(80):
            u,r,c=self.base(np.asarray(f)+friction,prescribed)
            target,meta=guide_friction_vector(self.h,u,self.coefficient,signs)
            error=float(np.max(abs(target-friction),initial=0.))
            if error<1.:
                friction=target
                u,r,c=self.base(np.asarray(f)+friction,prescribed)
                verify,meta=guide_friction_vector(self.h,u,self.coefficient,signs)
                final_error=float(np.max(abs(verify-friction),initial=0.))
                if final_error<2.:break
            friction=.65*friction+.35*target
        else:raise AssertionError(('Guide friction fixed-sign follower did not settle',error,meta.get('directionReversalCount')))
        c['guideFriction']=dict(meta,coefficient=self.coefficient,iterations=iterations+1,
                                followerResidualN=final_error,
                                initialSlidingPoints=sum(bool(v) for v in signs.values()),
                                interpretation='Full fixed-direction sliding-friction bound; any direction reversal is an intentionally retained overdrive beyond the physical stick transition.')
        return u,r,c
