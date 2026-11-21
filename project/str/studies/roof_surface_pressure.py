"""Signed authored PLAN pressures on the actual source roof row origins.

This is a mechanical load control, independently authored alongside facade
wind. It supplies neither aerodynamic coefficients nor a site snow case.
"""
import copy
import hashlib
import math
from pathlib import Path

import numpy as np

from roof_stock_gravity import (_maps, _point_load, _axial_load,
    recover_roof_stock_local_actions)

METHOD='project/str/studies/roof_surface_pressure.py'


def roof_surface_rows(operator):
    p=operator['scope'];result=[]
    for index,(outer,inner) in enumerate(p['radials']):
        ordinary=outer[0]==inner[0] or outer[1]==inner[1]
        family=next(row for row in p['w']['frames'] if row['id']==('ordinary' if ordinary else 'hip'))
        crown=tuple((a+b)/2 for a,b in zip(outer,inner));plan=math.dist(outer,inner)
        for row_index,row in enumerate(family['rows']):
            along=row['x']*1000;label='inner' if along<=plan/2 else 'outer'
            maps=_maps(p,inner if label=='inner' else outer,crown)
            t=(along if label=='inner' else plan-along)/(plan/2)
            at=np.asarray([*maps['heel'],p['zheel']])+t*(np.asarray([*crown,p['zhigh']])-np.asarray([*maps['heel'],p['zheel']]))
            result.append({'id':f'ROOF-ROW/{index}/{row_index}','frameIndex':index,
                'rowIndex':row_index,'frameFamily':family['id'],'planAreaM2':row['area'],
                'pointXYZMm':at.tolist(),'halfKind':label,'position':t,'maps':maps})
    if len(result)!=108 or len({r['id'] for r in result})!=108:raise ValueError('Expected actual twelve by nine roof row origins')
    if abs(sum(r['planAreaM2'] for r in result)-p['w']['globalOrigins']['planArea'])>1e-9:raise ValueError('Roof row area does not conserve source plan area')
    return result


def reference_roof_surface_pressure_settings(operator):
    return {'kind':'authored-equivalent-plan-pressure-control','uniformKPa':0.,
        'rowMultipliers':{r['id']:1. for r in roof_surface_rows(operator)}}


def assemble_roof_surface_pressure(operator,settings):
    rows=roof_surface_rows(operator)
    if not isinstance(settings,dict) or set(settings)!={'kind','uniformKPa','rowMultipliers'} or settings['kind']!='authored-equivalent-plan-pressure-control':raise ValueError('Exact authored roof PLAN-pressure control required')
    q=settings['uniformKPa'];multipliers=settings['rowMultipliers']
    if type(q) not in (int,float) or not math.isfinite(q) or not -2.25<=q<=6.3:raise ValueError('Roof pressure must remain in explicit source comparison range -2.25..+6.3kPa; positive is down')
    if not isinstance(multipliers,dict) or set(multipliers)!={r['id'] for r in rows}:raise ValueError('Exact actual roof row IDs required; no guessed/missing pressure territory')
    if any(type(v) not in (int,float) or not math.isfinite(v) or not 0<=v<=1 for v in multipliers.values()):raise ValueError('Explicit finite row multipliers0..1 required')
    p=operator['scope'];vector=np.zeros(p['spaceSize']);origins=[];halves={}
    for index,(outer,inner) in enumerate(p['radials']):
        crown=tuple((a+b)/2 for a,b in zip(outer,inner))
        for label,heel in (('outer',outer),('inner',inner)):
            halves[index,label]={'id':f'ROOF-PRIMARY/{index}/{label}','finite':label=='outer',
                'maps':_maps(p,heel,crown),'lineLoads':[],'pointLoads':[],
                'equivalentStrongN_Nmm':[0.]*4,'equivalentAxialN':[0.,0.],
                'physicalGKN':0.,'appliedVerticalDownKN':0.}
    for row in rows:
        magnitude=q*row['planAreaM2']*multipliers[row['id']];force=[0.,0.,-magnitude*1000]
        local=_point_load(vector,row['maps'],row['position'],force,row['halfKind']=='outer')
        half=halves[row['frameIndex'],row['halfKind']]
        half['appliedVerticalDownKN']+=magnitude
        half['pointLoads'].append([row['position']*row['maps']['lengthMm'],float(np.dot(force,row['maps']['Z']))])
        half['equivalentStrongN_Nmm']=[a+b for a,b in zip(half['equivalentStrongN_Nmm'],local)]
        axial=_axial_load(row['maps'],row['position'],force)
        half['equivalentAxialN']=[a+b for a,b in zip(half['equivalentAxialN'],axial)]
        origins.append({k:v for k,v in row.items() if k not in ('maps','position')})
        origins[-1].update(multiplier=multipliers[row['id']],pressureKPa=q*multipliers[row['id']],forceKN=[0.,0.,-magnitude])
    retained=operator['retainedIndices'];interior=operator['interiorIndices']
    particular=np.linalg.solve(operator['interiorStiffnessN'],vector[interior])
    condensed=(vector[retained]-operator['interiorCouplingN'].T@particular)/1000
    wrench=np.zeros(6);ports=np.zeros(6)
    for row in origins:
        wrench[:3]+=row['forceKN'];wrench[3:]+=np.cross(row['pointXYZMm'],row['forceKN'])/1000
    for i,(x,y) in enumerate(operator['ringPointsXYMm']):
        fx,fy,mz,down,sx,sy=condensed[6*i:6*i+6];force=np.asarray([fx,fy,-down])
        ports[:3]+=force;ports[3:]+=(np.asarray([-sy,sx,mz])+np.cross([x,y,p['rr']],force))/1000
    residual=wrench-ports
    if float(np.max(np.abs(residual)))>1e-7:raise ValueError('Roof pressure origins lose six-force/moment balance during condensation')
    # Independent physical-origin virtual work for all six rigid movements.
    port_modes=[]
    for j in range(6):
        tx,ty,tz=[float(j==k) for k in range(3)];rx,ry,rz=[float(j==k) for k in range(3,6)];mode=[]
        for x,y in operator['ringPointsXYMm']:
            dx,dy=x-6000,y-6000
            mode.extend((tx-rz*dy,ty+rz*dx,rz,-tz-rx*dy+ry*dx,ry,-rx))
        port_modes.append(mode)
    mode_matrix=np.asarray(port_modes).T
    inner_modes=-np.linalg.solve(operator['interiorStiffnessN'],operator['interiorCouplingN']@mode_matrix)
    physical_work=np.zeros(6)
    for row in origins:
        physical_work[:3]+=row['forceKN']
        physical_work[3:]+=np.cross(np.asarray(row['pointXYZMm'])-[6000,6000,p['rr']],row['forceKN'])
    raw_work=(mode_matrix.T@vector[retained]+inner_modes.T@vector[interior])/1000
    rigid_residual=raw_work-physical_work
    if float(np.max(np.abs(rigid_residual)))>1e-5:raise ValueError('Roof surface point work map loses a physical rigid movement')
    return {'schema':'str-roof-surface-pressure/1','request':copy.deepcopy(settings),
        'sourceSHA256':{**operator['sourceSHA256'],METHOD:hashlib.sha256(Path(__file__).read_bytes()).hexdigest()},
        'planAreaM2':sum(r['planAreaM2'] for r in rows),
        'loadedWeightedPlanAreaM2':sum(r['planAreaM2']*multipliers[r['id']] for r in rows),
        'verticalDownKN':-float(wrench[2]),'origins':origins,'pressureWrenchKN_KNm':wrench.tolist(),
        'originAndCondensedWrenchResidualKN_KNm':residual.tolist(),
        'sixRigidWorkResidualKN_KNmm':rigid_residual.tolist(),
        'fullForceN':vector,'condensedForceKN':condensed,'halves':halves,
        'loadOnlyEnergyKNmm':float(vector[interior]@particular/2000),
        'siteWindQualified':False,'siteSnowQualified':False,'facadePressureCorrelationQualified':False,
        'roofLayerGravityIncluded':False,'candidateAccepted':False,
        'scope':'Actual source rows carry signed equivalent PLAN-pressure controls through the same finite outer/released inner roof and retained ring. Row multipliers define executed mechanical patterns; they are not independent maxima summed into an invented code case. Positive pressure acts down. No normal-surface coefficient, roof weather adoption, site snow map, suction fixing resistance or favourable G is inferred.'}


def serial_roof_surface_pressure(value):
    return {k:v for k,v in value.items() if k not in ('fullForceN','condensedForceKN','halves')}


def recover_combined_roof_primary_actions(surface,operator,full_displacements,stock=None,g_factor=0.):
    """Recover cuts after subtracting ALL actually applied row/body loads."""
    combined=copy.deepcopy(surface)
    for key,half in combined['halves'].items():
        if stock is None:continue
        body=stock['halves'][key]
        half['lineLoads']=[[a,b,g_factor*q] for a,b,q in body['lineLoads']]
        half['pointLoads'] += [[x,g_factor*f] for x,f in body['pointLoads']]
        for name in ('equivalentStrongN_Nmm','equivalentAxialN'):
            half[name]=[a+g_factor*b for a,b in zip(half[name],body[name])]
        half['physicalGKN']=g_factor*body['physicalGKN']
    actions=recover_roof_stock_local_actions(combined,operator,full_displacements,1.)
    for row,half in zip(actions,combined['halves'].values()):
        row['appliedSteelGKN']=row.pop('physicalGKN');row['appliedSurfaceVerticalDownKN']=half['appliedVerticalDownKN']
        if 'gravityEquivalentStrongEndVectorN_Nmm' in row:row['appliedEquivalentStrongEndVectorN_Nmm']=row.pop('gravityEquivalentStrongEndVectorN_Nmm')
        if 'localGravityBending' in row:row['localReleasedBending']=row.pop('localGravityBending')
        row['scope']='Same coupled state; primary cuts subtract actual signed surface pressures and factored modeled-steel body loads. Facade P2/crown enters through nodal actions. Unmodeled weather gravity and installed resistance remain absent.'
    return actions
