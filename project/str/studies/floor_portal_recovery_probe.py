"""Bounded generation-3 sensitivity probes for STR-FLOOR-PORTAL.

These probes compare finite model alternatives without adopting any of them.
They intentionally solve only the two adverse cases needed to expose the
corner, cap-key and joint-rigidity levers. Full signed domains and publication
checks remain separate gates.
"""
from collections import defaultdict
import argparse,json,math
import numpy as np

from floor_portal_house import House,Parameters,ContactSolve
from floor_portal_loads import Case,gravity,roof_gravity,roof_goods,wind
from floor_portal_roof_fields import spandrel_clearance
from floor_portal_movements import roof_strain,superstructure_strain


SIX_L_KEYS=((200.,70.),(475.,70.),(725.,70.),(70.,200.),(70.,475.),(70.,725.))
RADIAL_GUIDES={'radial-guide-60':(10.,60.),'radial-guide-80':(8.,80.),'radial-guide-60-t12':(12.,60.),'radial-guide-60-t16':(16.,60.),'radial-guide-60-t20':(20.,60.)}
CANDIDATES=('baseline','square','short-key','joint-half','joint-zero','mesh-half','flex-key-80','flex-key-100','flex-key-120',*RADIAL_GUIDES,'radial-guide-j50-t20')


def parameters(name):
    common={}
    if name!='baseline':
        common.update(corner_width=250.,corner_haunch=120.)
    if name in ('short-key','joint-half','joint-zero','mesh-half'):
        common.update(
            cap_key_width=90.,cap_key_thickness=12.,cap_key_depth=30.,
            L_key_width=70.,L_key_thickness=12.,L_key_depth=30.,
            L_key_centres=SIX_L_KEYS,key_profile='triangular depth bearing')
    if name.startswith('flex-key-'):
        depth=float(name.rsplit('-',1)[1])
        common.update(
            cap_key_width=90.,cap_key_thickness=8.,cap_key_depth=depth,
            L_key_width=70.,L_key_thickness=8.,L_key_depth=depth,
            L_key_centres=SIX_L_KEYS,key_profile='triangular depth bearing')
    if name in RADIAL_GUIDES:
        thickness,depth=RADIAL_GUIDES[name]
        common.update(
            cap_key_width=90.,cap_key_thickness=thickness,cap_key_depth=depth,
            L_key_width=70.,L_key_thickness=thickness,L_key_depth=depth,
            L_key_centres=SIX_L_KEYS,key_profile='triangular depth bearing',key_direction_mode='radial-guide')
    if name=='radial-guide-j50-t20':
        common.update(
            cap_key_width=50.,cap_key_thickness=20.,cap_key_depth=60.,
            L_key_width=70.,L_key_thickness=20.,L_key_depth=60.,
            L_key_centres=SIX_L_KEYS,key_profile='triangular depth bearing',key_direction_mode='radial-guide')
    if name=='joint-half':common['joint_rigid_scale']=.5
    if name=='joint-zero':common['joint_rigid_scale']=0.
    if name=='mesh-half':common['mesh']=700.
    if name not in CANDIDATES:raise ValueError(name)
    return Parameters(**common)


def cases(h):
    G,Q,base=gravity(h)
    Rg,Rq,Ru,_=roof_gravity(h)
    Dg,Wq,extra,_,_=roof_goods(h)
    totalG=Case.combination(h,'G characteristic with declared adverse budgets',[(1,G),(1,Rg),(1,Dg)])
    totalQ=Case.combination(h,'Q characteristic including blocked water',[(1,Q),(1,Rq),(1,Wq)])
    pressure=wind(h,(1,0))
    suction=Case.combination(h,'source and added roof suction',[(1,Ru),(-1,extra)])
    return [
        Case.combination(h,'ULS simultaneous gravity and full blocked water',[(1.35,totalG),(1.5,totalQ)]),
        Case.combination(h,'positive X wind and roof suction without favourable G',[(1,pressure),(1,suction)]),
    ],base,totalG


def key_groups(h,u):
    groups=defaultdict(lambda:np.zeros(6))
    slips=defaultdict(float);released=defaultdict(float)
    for e in h.cap_links:
        if not (e['name'].startswith('cap-key-') or e['name'].startswith('L-cap-key-')):continue
        relative=e['t']@u[e['ids']]
        groups[e['name']]+=e['k']@relative
        translational=e['k'][:3,:3]
        values,vectors=np.linalg.eigh(translational)
        active=np.flatnonzero(values>max(1.,values.max()*1e-12))
        if len(active):
            slip=max(abs(float(vectors[:,i]@relative[:3])) for i in active)
            slips[e['name']]=max(slips[e['name']],slip)
        if h.p.key_direction_mode=='radial-guide':
            plan_values,plan_vectors=np.linalg.eigh(translational[:2,:2])
            radial=plan_vectors[:,int(np.argmin(plan_values))]
            released[e['name']]=max(released[e['name']],abs(float(radial@relative[:2])))
    return groups,slips,released


def key_stress(force_n,width,thickness,depth,profile):
    lever=depth*(2/3 if profile=='triangular depth bearing' else .5)
    modulus=width*thickness**2/6
    return abs(force_n)*lever/modulus


def solve(name):
    p=parameters(name);h=House(p);loadcases,base,Gref=cases(h);solver=ContactSolve(h.k,h.fixed,h.contacts)
    rows=[]
    for case in loadcases:
        u,reaction,contact=solver(case.f)
        balance=h.rigid.T@(case.f+reaction)
        assert np.max(abs(balance[:3]))<.02 and np.max(abs(balance[3:]))<20.,balance

        collector=np.zeros(6)
        for e in h.members['collector']:
            action=e['k']@e['t']@u[e['ids']]-case.ends.get(id(e),np.zeros(12))
            collector=np.maximum(collector,np.max(abs(action.reshape(2,6)),axis=0))

        groups,slips,released=key_groups(h,u)
        jamb=[v for k,v in groups.items() if k.startswith('cap-key-')]
        lkeys=[v for k,v in groups.items() if k.startswith('L-cap-key-')]
        jamb_force=max((float(np.max(abs(v[:2]))) for v in jamb),default=0.)
        l_force=max((float(np.max(abs(v[:2]))) for v in lkeys),default=0.)
        jamb_slip=max((v for k,v in slips.items() if k.startswith('cap-key-')),default=0.)
        l_slip=max((v for k,v in slips.items() if k.startswith('L-cap-key-')),default=0.)
        jamb_release=max((v for k,v in released.items() if k.startswith('cap-key-')),default=0.)
        l_release=max((v for k,v in released.items() if k.startswith('L-cap-key-')),default=0.)
        jamb_stress=key_stress(jamb_force,p.cap_key_width,p.cap_key_thickness,p.cap_key_depth,p.key_profile)
        l_stress=key_stress(l_force,p.L_key_width,p.L_key_thickness,p.L_key_depth,p.key_profile)

        m24=max((float(contact['force'][i]) for i,e in enumerate(h.contacts) if e['name'].startswith('upper-M24-')),default=0.)
        core=max((float(contact['force'][i]) for i,e in enumerate(h.contacts) if e['name'].startswith('upper-core-bearing-')),default=0.)
        gap=spandrel_clearance(h,case,u)['minimumGap']['gapMM']
        head_tension=max(0.,-min(float(reaction[node+2]/1000) for node in h.heads.values()))
        translation=max(float(np.max(abs(u[6*i:6*i+3]))) for i in range(len(h.f.points)))

        rows.append(dict(
            name=case.name,
            collectorTorqueKNm=float(collector[3]/1e6),
            collectorStrongMomentKNm=float(max(collector[4],collector[5])/1e6),
            maximumHeadTensionKN=head_tension,
            maximumTranslationMM=translation,
            maximumUpperM24ForceKN=m24/1000,
            maximumUpperCoreCompressionKN=core/1000,
            minimumUpperSpandrelGapMM=float(gap),
            maximumJambKeyDirectionalForceKN=jamb_force/1000,
            maximumLKeyDirectionalForceKN=l_force/1000,
            maximumJambKeyRelativeShearMM=float(jamb_slip),
            maximumLKeyRelativeShearMM=float(l_slip),
            maximumJambKeyReleasedTravelMM=float(jamb_release),
            maximumLKeyReleasedTravelMM=float(l_release),
            jambKeyElasticRootStressMPa=float(jamb_stress),
            LKeyElasticRootStressMPa=float(l_stress),
            activeContacts=int(sum(contact['active'])),
            balanceMaximumForceN=float(np.max(abs(balance[:3]))),
            balanceMaximumMomentNmm=float(np.max(abs(balance[3:]))),
        ))
    movement=[]
    movement_specs=[]
    for strain in (-720e-6,720e-6):
        movement_specs.append((f'roof actual axial strain {strain:g}',roof_strain(h,strain,False)))
        movement_specs.append((f'roof reference affine strain {strain:g}',roof_strain(h,strain,True)))
    for strain in (-300e-6,300e-6):
        movement_specs.append((f'superstructure net strain {strain:g}',superstructure_strain(h,strain)))
    for label,eigen in movement_specs:
        case=Case.combination(h,'G reference; '+label,[(1,Gref),(1,eigen)])
        u,reaction,contact=solver(case.f)
        groups,slips,released=key_groups(h,u)
        jamb=[v for k,v in groups.items() if k.startswith('cap-key-')]
        lkeys=[v for k,v in groups.items() if k.startswith('L-cap-key-')]
        jamb_force=max((float(np.max(abs(v[:2]))) for v in jamb),default=0.)
        l_force=max((float(np.max(abs(v[:2]))) for v in lkeys),default=0.)
        jamb_slip=max((v for k,v in slips.items() if k.startswith('cap-key-')),default=0.)
        l_slip=max((v for k,v in slips.items() if k.startswith('L-cap-key-')),default=0.)
        jamb_release=max((v for k,v in released.items() if k.startswith('cap-key-')),default=0.)
        l_release=max((v for k,v in released.items() if k.startswith('L-cap-key-')),default=0.)
        balance=h.rigid.T@(case.f+reaction)
        movement.append(dict(
            name=label,
            maximumHeadTensionKN=max(0.,-min(float(reaction[node+2]/1000) for node in h.heads.values())),
            maximumTranslationMM=max(float(np.max(abs(u[6*i:6*i+3]))) for i in range(len(h.f.points))),
            maximumJambKeyDirectionalForceKN=jamb_force/1000,
            maximumLKeyDirectionalForceKN=l_force/1000,
            maximumJambKeyRelativeShearMM=float(jamb_slip),
            maximumLKeyRelativeShearMM=float(l_slip),
            maximumJambKeyReleasedTravelMM=float(jamb_release),
            maximumLKeyReleasedTravelMM=float(l_release),
            jambKeyElasticRootStressMPa=float(key_stress(jamb_force,p.cap_key_width,p.cap_key_thickness,p.cap_key_depth,p.key_profile)),
            LKeyElasticRootStressMPa=float(key_stress(l_force,p.L_key_width,p.L_key_thickness,p.L_key_depth,p.key_profile)),
            activeContacts=int(sum(contact['active'])),
            balanceMaximumForceN=float(np.max(abs(balance[:3]))),
            balanceMaximumMomentNmm=float(np.max(abs(balance[3:]))),
        ))

    return dict(
        candidate=name,
        parameters={
            'cornerWidthMM':p.corner_width,'cornerEndMM':p.corner_end,'cornerHaunchMM':p.corner_haunch,
            'jointRigidScale':p.joint_rigid_scale,'keyProfile':p.key_profile,'keyDirectionMode':p.key_direction_mode,
            'jambKey':[p.cap_key_width,p.cap_key_thickness,p.cap_key_depth],
            'LKey':[p.L_key_width,p.L_key_thickness,p.L_key_depth],
            'LKeyCentres':[list(v) for v in p.L_key_centres],
        },
        physicalRCVolumeM3=base['RC']['totalM3'],
        cases=rows,
        movementCases=movement,
        status='SENSITIVITY ONLY; NO DESIGN ADOPTION',
    )


if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--candidate',required=True,choices=CANDIDATES)
    args=parser.parse_args()
    result=solve(args.candidate)
    print('STR_PROBE='+json.dumps(result,separators=(',',':')),flush=True)
