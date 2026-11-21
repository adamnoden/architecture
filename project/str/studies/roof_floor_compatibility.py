"""Actual roof-only stiffness for composition with the current floor/frame.

The historical roof recipe remains unchanged. Its grounded L compliance,
separate floor and grounded vertical springs are deliberately removed before
the roof is condensed. The new joined comparison must supply those paths.
"""
import ast
import copy
import hashlib
from itertools import pairwise, product
import json
import math
from pathlib import Path


METHOD='project/str/studies/roof_floor_compatibility.py'
ROOF_METHOD='project/str/studies/current-house-roof-bracing.py'
ROOF_INPUTS=(ROOF_METHOD,'project/str/studies/current-house-welded-network.json',
    'project/str/studies/current-house-welded-heel.json','project/had/studies/water-replan.json',
    'project/str/studies/roof_stock_gravity.py','project/str/studies/roof_surface_pressure.py',METHOD)


class _RoofOnly(ast.NodeTransformer):
    def __init__(self):
        self.removed={key:0 for key in ('lowerL','verticalGround','unusedGauge','oldFloor')}

    def visit_If(self,node):
        node=self.generic_visit(node)
        if not node.body:node.body=[ast.Pass()]
        return node

    def visit_For(self,node):
        if isinstance(node.target,ast.Name) and isinstance(node.iter,ast.Name):
            key={('p','corners'):'lowerL',('p','upperSupports'):'verticalGround'}.get((node.target.id,node.iter.id))
            if key:
                self.removed[key]+=1
                return None
        if (isinstance(node.target,ast.Name) and node.target.id=='j'
                and isinstance(node.iter,ast.Call) and isinstance(node.iter.func,ast.Name)
                and node.iter.func.id=='range' and len(node.iter.args)==1
                and isinstance(node.iter.args[0],ast.Constant)):
            size=node.iter.args[0].value
            text=ast.dump(node)
            if size==8 and "id='membrane'" in text:
                self.removed['oldFloor']+=1
                return None
            if size==3 and "id='nr'" in text:
                self.removed['unusedGauge']+=1
                return None
        return self.generic_visit(node)


def load_roof_only_source(root):
    root=Path(root)
    return {'root':root,'identities':{p:hashlib.sha256((root/p).read_bytes()).hexdigest() for p in ROOF_INPUTS}}


def _scope(source):
    root=source['root']
    if source['identities']!=load_roof_only_source(root)['identities']:
        raise ValueError('Stale roof source; no historical operator substitution')
    path=root/ROOF_METHOD
    tree=ast.parse(path.read_text());selected=[];removed_imports=[];transformer=_RoofOnly();found=False
    for node in tree.body:
        if isinstance(node,ast.Assign):
            names=[target.id for target in node.targets if isinstance(target,ast.Name)]
            if len(names)==1 and names[0] in ('fac','membrane'):
                removed_imports+=names
                continue
        if isinstance(node,ast.FunctionDef) and node.name=='build':
            selected.append(transformer.visit(copy.deepcopy(node)));found=True;break
        selected.append(node)
    if not found or sorted(removed_imports)!=['fac','membrane'] or any(value!=1 for value in transformer.removed.values()):
        raise ValueError('Roof boundary recipe changed; explicitly reintegrate its actual physical terms')
    scope={'__file__':str(path),'fac':lambda matrix:matrix}
    exec(compile(ast.fix_missing_locations(ast.Module(body=selected,type_ignores=[])),str(path),'exec'),scope)
    if (scope['base'],scope['ff'],scope['rr'],scope['zheel'],scope['seatZ'])!=(-180.,3370.,6600.,6860,200.):
        raise ValueError('Changed roof/floor/support datums require explicit joined geometry integration')
    if len(scope['upperSupports'])!=22 or len(scope['nodes'])!=58 or len(scope['crowns'])!=12:
        raise ValueError('Changed roof support/member catalogue requires explicit mapping to the actual current floor')
    return scope,transformer.removed


def build_roof_only_operator(source,ring_plan_ei_ratio=1.,ridge_joint_k_ratio=1.):
    import numpy as np
    for value in (ring_plan_ei_ratio,ridge_joint_k_ratio):
        if type(value) not in (int,float) or not math.isfinite(value) or not .25<=value<=1:
            raise ValueError('Explicit bounded0.25..1 roof stiffness comparison required')
    scope,removed=_scope(source)
    raw,_,springs=scope['build'](False,True,None,ring_plan_ei_ratio,ridge_joint_k_ratio)
    if springs:raise ValueError('Inherited grounded roof supports survived extraction')
    full=np.asarray(raw,dtype=float)
    dropped=[scope['nr']+j for j in range(3)]+list(range(scope['spaceSize']-8,scope['spaceSize']))
    roof_indices=[i for i in range(len(full)) if i not in dropped]
    if np.max(np.abs(full[dropped,:]))>1e-10 or np.max(np.abs(full[:,dropped]))>1e-10:
        raise ValueError('Removed floor/gauge coordinates still carry roof stiffness')
    # Retained raw order at each ring point: ux,uy,rz,wDown,slopeX,slopeY.
    retained=[i for p in scope['nodes'] for i in (*[scope['dof'](p,j) for j in range(3)],
                                                *[scope['vDO'](p,j) for j in range(3)])]
    interior=[i for i in roof_indices if i not in retained]
    rii=full[np.ix_(interior,interior)];kir=full[np.ix_(interior,retained)]
    particular=np.linalg.solve(rii,kir)
    condensed=full[np.ix_(retained,retained)]-kir.T@particular
    condensed=(condensed+condensed.T)/2
    block=full[np.ix_(roof_indices,roof_indices)]
    scale=1/np.sqrt(np.diag(block))
    eigenvalues=np.linalg.eigvalsh(scale[:,None]*block*scale[None,:])
    if np.min(eigenvalues)<-1e-9 or sum(eigenvalues<1e-10)!=6:
        raise ValueError('Roof-only physical stiffness does not have exactly six rigid-body modes')
    modes=[]
    for translation,rotation in (((1,0,0),(0,0,0)),((0,1,0),(0,0,0)),((0,0,1),(0,0,0)),
                                 ((0,0,0),(1,0,0)),((0,0,0),(0,1,0)),((0,0,0),(0,0,1))):
        vector=[]
        tx,ty,tz=translation;rx,ry,rz=rotation
        for x,y in scope['nodes']:
            dx,dy=x-6000,y-6000
            ux,uy,uz=tx-rz*dy,ty+rz*dx,tz+rx*dy-ry*dx
            vector.extend((ux,uy,rz,-uz,ry,-rx))
        modes.append(vector)
    residuals=[float(np.max(np.abs(condensed@np.asarray(mode)))) for mode in modes]
    relative=max(residuals)/max(1.,float(np.max(np.abs(condensed)))*6000)
    if relative>1e-10:raise ValueError('Roof raw/global coordinate map restrains a physical rigid mode')
    return {'scope':scope,'sourceSHA256':source['identities'],'removedInheritedBoundaryTerms':removed,
        'fullMatrixN':full,'roofIndices':roof_indices,'retainedIndices':retained,'interiorIndices':interior,
        'interiorStiffnessN':rii,'interiorCouplingN':kir,'condensedStiffnessKN':condensed/1000,
        'ringPointsXYMm':[list(p) for p in scope['nodes']],
        'actualUpperSupportPointsXYMm':[list(p) for p in sorted(scope['upperSupports'])],
        'scaledEigenvalues':eigenvalues,'rigidModeResidualN_NMm':residuals,'rigidModeRelativeResidual':relative}


def roof_pressure_load(operator,wind_index):
    """Actual correlated P2 and crown-overturning family; never the old P1."""
    import numpy as np
    if type(wind_index) is not int or not 0<=wind_index<96:
        raise ValueError('Actual source wind programme0..95 required')
    p=operator['scope'];programmes=[bits for bits in product(range(7),repeat=2) if bits!=(0,0)]
    bits=programmes[wind_index%48];inside=wind_index>=48
    f=np.zeros(p['spaceSize']);origins=[]
    def load(index,value,point,axis,kind):
        f[index]+=value
        force=[0.,0.,0.];force[axis]=value/1000
        origins.append({'pointXYZMm':list(point),'forceKN':force,'kind':kind})
    for axis,code in enumerate(bits):
        if not code:continue
        sign=1 if code<4 else -1;mode=(code-1)%3
        face=(3 if sign==1 else 1) if axis==0 else (0 if sign==1 else 2)
        cut=p['sides'][face,'outer'];low=-200 if mode!=2 else 6000;high=12200 if mode!=1 else 6000
        boundaries=sorted({low,high,*[u for u in [*cut,*p['sides'][face,'inner'],4250,7750,
            (p['A']+p['C'])/2,12000-(p['A']+p['C'])/2] if low<u<high]})
        for a,b in pairwise(boundaries):
            at=(a+b)/2;i=next((j for j in range(len(cut)-1) if at<=cut[j+1]),len(cut)-2)
            left,right=cut[i:i+2];fraction=(at-left)/(right-left);length=(b-a)/1000
            roof_force=sign*2.25*length*((p['rr']-p['ff'])/2+(p['peak']-p['rr']))
            roof_moment=sign*2.25*length*((p['peak']-p['rr'])/1000)**2/2
            crown_force=roof_moment*1e6/(p['zhigh']+p['seatZ']-p['rr'])
            centre=(p['A']+p['C'])/2;crown_stations=[centre,4700,7300,12000-centre]
            j=0 if at<=crown_stations[0] else next((k for k in range(3) if at<=crown_stations[k+1]),2)
            lo,hi=crown_stations[j:j+2];part=(at-lo)/(hi-lo)
            for u,share in ((lo,1-part),(hi,part)):
                point=p['pt'](face,centre,u)
                load(p['highD'](point,axis),crown_force*share,(*point,p['zhigh']+p['seatZ']),axis,'source-crown-overturning')
            if not inside or not 4250<at<7750:
                for share,u in ((1-fraction,left),(fraction,right)):
                    point=p['pt'](face,p['A'],u)
                    load(p['dof'](point,axis),(roof_force-crown_force)*share,(*point,p['rr']),axis,'source-outer-P2')
            else:
                inner=p['sides'][face,'inner'];j=next(k for k in range(len(inner)-1) if at<=inner[k+1])
                lo,hi=inner[j:j+2];part=(at-lo)/(hi-lo)
                for share,u in ((1-part,lo),(part,hi)):
                    point=p['pt'](face,p['C'],u)
                    load(p['dof'](point,axis),(roof_force-crown_force)*share,(*point,p['rr']),axis,'source-court-P2')
    retained=operator['retainedIndices'];interior=operator['interiorIndices']
    fi=f[interior];particular=np.linalg.solve(operator['interiorStiffnessN'],fi)
    condensed=f[retained]-operator['interiorCouplingN'].T@particular
    return {'windIndex':wind_index,'programme':list(bits),'courtProjection':inside,
        'fullForceN':f,'condensedForceKN':condensed/1000,'interiorParticularMmRad':particular,
        'loadOnlyEnergyKNmm':float(fi@particular/2000),'origins':origins,
        'scope':'Source P2 projected upper-wall/roof-height pressure and actual crown-overturning programme only. '
                'P1 remains with the current floor. Roof vertical gravity, actual opening pressure and weather adoption are not supplied.'}


def roof_operator_summary(operator):
    return {'schema':'str-roof-only-operator/1','sourceSHA256':operator['sourceSHA256'],
        'activeCoordinateCount':len(operator['roofIndices']),'retainedRingCoordinateCount':len(operator['retainedIndices']),
        'internalCoordinateCount':len(operator['interiorIndices']),'ringPointCount':len(operator['ringPointsXYMm']),
        'actualUpperSupportPointsXYMm':operator['actualUpperSupportPointsXYMm'],
        'removedInheritedBoundaryTerms':operator['removedInheritedBoundaryTerms'],
        'rigidBodyModeCount':6,'rigidModeRelativeResidual':operator['rigidModeRelativeResidual'],
        'roofGravityIntegrated':False,'roofAdoption':False,'completeHouseProof':False}


def roof_floor_receiver_points(root):
    source=load_roof_only_source(root);scope,_=_scope(source)
    outer={(scope['A'],scope['A']),(scope['A'],scope['B']),(scope['B'],scope['A']),(scope['B'],scope['B'])}
    return [{'id':'ROOF/FLOOR/'+','.join(f'{v:g}' for v in point),'xyMm':list(point)}
            for point in sorted(scope['upperSupports']-outer)]


def reference_roof_coupling_settings(root):
    return {'schema':'str-roof-floor-coupling-settings/1','upperFrameLaw':None,
        'upperUnitWeightKNPerM3':None,'ringPlanEIRatio':1.,'ridgeJointKRatio':1.,'roofWindFactor':1.,
        'roofSteelGravity':None,'roofSurfacePressure':None,
        'intermediateSupportLaws':{row['id']:None for row in roof_floor_receiver_points(root)},
        'use':'unqualified-source0-roof-P2-and-crown-coupling'}


def _roof_energy_modes(matrix):
    import numpy as np
    a=np.asarray(matrix);scale=1/np.sqrt(np.diag(a));normalized=scale[:,None]*a*scale[None,:]
    values,vectors=np.linalg.eigh((normalized+normalized.T)/2)
    if np.min(values)<-1e-8 or sum(values<1e-9)!=6:raise ValueError('Condensed roof lost its six physical rigid modes')
    selected=values>1e-9;modes=(vectors[:,selected]*np.sqrt(values[selected])).T/scale
    residual=float(np.max(np.abs(modes.T@modes-a))/max(1.,float(np.max(np.abs(a)))))
    if residual>1e-8:raise ValueError('Roof energy modes do not reconstruct the physical matrix')
    return modes.tolist(),residual


def _admit_coupling(model,source,settings):
    expected=reference_roof_coupling_settings(source['root'])
    if not isinstance(settings,dict) or set(settings)!=set(expected) or any(settings[k]!=expected[k] for k in ('schema','use')):
        raise ValueError('Exact authored roof settings required; no sources/results/approval')
    roof_source=load_roof_only_source(source['root'])
    if any(source['identities'].get(path)!=value for path,value in roof_source['identities'].items()):raise ValueError('Assembled A source must bind every actual roof method/input')
    law=settings['upperFrameLaw'];base=model['request']['frameLaw']
    if (not isinstance(law,dict) or set(law)!=set(base)
            or law.get('mode')!=base.get('mode')
            or any(type(v) not in (int,float) or not math.isfinite(v) or v<=0 for k,v in law.items() if k!='mode')
            or not 0<law['poissonRatio']<.5
            or any(law[k]>1 for k in ('flexuralFactor','torsionFactor','shearAreaFactor'))):raise ValueError('Explicit finite upper-L frame law required')
    density=settings['upperUnitWeightKNPerM3'];factor=settings['roofWindFactor']
    if type(density) not in (int,float) or not math.isfinite(density) or not 18<=density<=30:raise ValueError('Explicit18..30kN/m3 upper-L own-weight comparison required')
    if type(factor) not in (int,float) or not math.isfinite(factor) or not 0<=factor<=2:raise ValueError('Explicit0..2 roof pressure factor required')
    if model['houseLoadCase']['boundary']['includeExternalGMAXQ']:raise ValueError('Replace gross upper GMAX before joining actual upper-L ownG')
    points=roof_floor_receiver_points(source['root']);laws=settings['intermediateSupportLaws']
    if not isinstance(laws,dict) or set(laws)!={r['id'] for r in points}:raise ValueError('Exact eighteen intermediate roof receiving laws required')
    for identifier,item in laws.items():
        if (not isinstance(item,dict) or set(item)!={'stiffnessKNPerMm','mode'}
                or type(item['stiffnessKNPerMm']) not in (int,float) or not math.isfinite(item['stiffnessKNPerMm'])
                or not 1<=item['stiffnessKNPerMm']<=1000 or item['mode'] not in ('bilateral','compression','tension')):
            raise ValueError('Finite explicit zero-gap axial roof law required: '+identifier)
    traces=model['verticalFloor'].get('retainedPointReceivers',{})
    if set(traces)!={r['id'] for r in points}:raise ValueError('Retain actual roof feet in the sole plate before condensation')
    return roof_source,points,traces


def apply_roof_floor_coupling(model,source,settings):
    """Add actual roof and upper paths to the already built A/plate/grid."""
    roof_source,points,traces=_admit_coupling(model,source,settings)
    operator=build_roof_only_operator(roof_source,settings['ringPlanEIRatio'],settings['ridgeJointKRatio'])
    p=operator['scope'];frame=model['model'];ring_nodes={}
    for point in operator['ringPointsXYMm']:
        name='JOINED-ROOF/ring/'+','.join(f'{v:g}' for v in point)
        ring_nodes[tuple(point)]=frame.node(name,[*point,p['rr']])
    modes,reconstruction=_roof_energy_modes(operator['condensedStiffnessKN'])
    for index,mode in enumerate(modes):
        terms=[]
        for i,point in enumerate(operator['ringPointsXYMm']):
            ux,uy,rz,down,sx,sy=mode[6*i:6*i+6]
            terms.append((ring_nodes[tuple(point)],[ux,uy,-down,-sy,sx,rz]))
        frame.springs.append({'id':'JOINED-ROOF/energy/'+str(index),'terms':terms,'stiffness':1.,'mode':'bilateral','gap':0.})
    upper,upper_weight=_add_upper_L(model,operator,ring_nodes,settings)
    receivers=[]
    for point in points:
        identifier=point['id'];trace=traces[identifier];law=settings['intermediateSupportLaws'][identifier]
        if trace['xyMm']!=point['xyMm']:raise ValueError('Stale/displaced actual plate receiver')
        roof_node=ring_nodes[tuple(point['xyMm'])];terms={roof_node:[0,0,1,0,0,0]}
        for node,row in trace['terms']:
            target=terms.setdefault(node,[0.]*6)
            for axis,value in enumerate(row):target[axis]-=value
        spring_id='JOINED-ROOF/axial/'+identifier
        frame.springs.append({'id':spring_id,'terms':list(terms.items()),'stiffness':law['stiffnessKNPerMm'],'mode':law['mode'],'gap':0.})
        receivers.append({'id':identifier,'springId':spring_id,'xyMm':point['xyMm'],'roofNode':roof_node,
            'plateTrace':{k:v for k,v in trace.items() if k!='terms'},'law':law,'physicalAcceptance':False})
    floor=model['houseLoadCase']['joinedCase']['floor'];load=roof_pressure_load(operator,floor['boundaryCase']['windIndex']);additional={}
    for i,point in enumerate(operator['ringPointsXYMm']):
        ux,uy,rz,down,sx,sy=[settings['roofWindFactor']*float(v) for v in load['condensedForceKN'][6*i:6*i+6]]
        additional[ring_nodes[tuple(point)]]=[ux,uy,-down,-sy,sx,rz]
    surface=None
    if settings['roofSurfacePressure'] is not None:
        from roof_surface_pressure import assemble_roof_surface_pressure
        from rc_floor_house_loads import _add
        surface=assemble_roof_surface_pressure(operator,settings['roofSurfacePressure'])
        for i,point in enumerate(operator['ringPointsXYMm']):
            ux,uy,rz,down,sx,sy=[float(v) for v in surface['condensedForceKN'][6*i:6*i+6]]
            _add(additional,ring_nodes[tuple(point)],[ux,uy,-down,-sy,sx,rz])
    stock=None
    if settings['roofSteelGravity'] is not None:
        from roof_stock_gravity import assemble_roof_stock_gravity
        from rc_floor_house_loads import _add
        stock=assemble_roof_stock_gravity(operator,settings['roofSteelGravity'])
        for i,point in enumerate(operator['ringPointsXYMm']):
            ux,uy,rz,down,sx,sy=[float(v) for v in stock['condensedForceKN'][6*i:6*i+6]]
            _add(model['families']['physical-G'],ring_nodes[tuple(point)],[ux,uy,-down,-sy,sx,rz])
    total=-sum(row[2] for row in model['families']['physical-G'].values())
    model['verticalFloor']['mass'].update(upperLPhysicalGKN=upper_weight,joinedPhysicalGKN=total,
        roofSteelPhysicalGKN=0. if stock is None else stock['physicalGKN'],
        appliedPhysicalGKN=total*model['houseLoadCase']['boundary']['physicalGFactor'])
    result={'settings':copy.deepcopy(settings),'operator':operator,'pressure':load,'ringNodes':ring_nodes,
        'upperL':upper,'receivers':receivers,'upperLPhysicalGKN':upper_weight,'additionalNodalLoads':additional,
        'stockGravity':stock,'surfacePressure':surface,'energyModeReconstructionRelativeError':reconstruction,'roofGravityIntegrated':False}
    model['roofFloorCoupling']=result
    return result


def _add_upper_L(model,operator,ring_nodes,settings):
    from joined_successor_kernel import l_section
    from joined_successor_compatibility import _wrench_at
    from rc_floor_house_loads import _add
    p=operator['scope'];frame=model['model'];rows=[];total=0.
    top=p['heel']['node']['ordinary']['ringZ'][0];bottom=3370.
    if top!=6540 or p['heel']['node']['hip']['ringZ'][0]!=top:raise ValueError('Changed metal ring underside requires an actual new upper-wall section')
    floor=model['houseLoadCase']['joinedCase']['floor']
    for corner in model['joinedFloor']['corners']:
        origin=corner['originXYMm'];sx=1 if origin[0]<6000 else -1;sy=1 if origin[1]<6000 else -1
        local=[]
        for a,b,c,d in corner['rectangles']:
            xs=sorted(((a-origin[0])*sx,(c-origin[0])*sx));ys=sorted(((b-origin[1])*sy,(d-origin[1])*sy))
            local.append([xs[0],ys[0],xs[1],ys[1]])
        low=min(r[0] for r in local);end=max(r[2] for r in local)
        section=l_section(low,floor['cornerWidthsMm'][corner['id']],end)
        if sorted(local)!=sorted([list(r) for r in section['rectangles']]):raise ValueError('Upper L must use the actual current lower L footprint')
        lower=corner['node'];master=frame.nodes[lower];roof_node=ring_nodes[tuple(origin)]
        if master[2]!=3170:raise ValueError('Upper L requires source0 lower floor master3170')
        start=[master[0],master[1],bottom];finish=[master[0],master[1],top]
        orientation=[sx*section['principalYUV'][0],sy*section['principalYUV'][1],0]
        name='JOINED-ROOF/upper-L/'+corner['id']
        frame.member(name,lower,roof_node,section,settings['upperFrameLaw'],physical_start=start,physical_end=finish,y_axis=orientation)
        volume=section['A']*(top-bottom)/1e9;weight=volume*settings['upperUnitWeightKNPerM3'];total+=weight;equivalents=[]
        for node,point in ((lower,start),(roof_node,finish)):
            wrench=_wrench_at([0,0,-weight/2],point,frame.nodes[node]);_add(model['families']['physical-G'],node,wrench);equivalents.append(wrench)
        rows.append({'id':name,'cornerId':corner['id'],'lowerNode':lower,'roofNode':roof_node,
            'physicalStartXYZMm':start,'physicalEndXYZMm':finish,'physicalRCUnionVolumeM3':volume,
            'physicalSelfGKN':weight,'equivalentGKN_KNmm':equivalents,'sectionAreaMm2':section['A'],
            'slabDepthTransfer':'Current rigid RC corner-patch trace3170..3370; local joint/cage unqualified.',
            'ringHeadTransfer':'Body ends6540 beneath actual ring6540..6660, work-dual master6600. No old guide/welded-heel approval transferred.'})
    return rows,total


def finish_roof_floor_coupling(model,raw):
    import numpy as np
    data=model['roofFloorCoupling'];operator=data['operator'];load=data['pressure'];factor=data['settings']['roofWindFactor'];u=[]
    for point in operator['ringPointsXYMm']:
        ux,uy,uz,rx,ry,rz=raw['displacements'][data['ringNodes'][tuple(point)]];u.extend((ux,uy,rz,-uz,ry,-rx))
    stock=data['stockGravity'];surface=data['surfacePressure'];g_factor=model['houseLoadCase']['boundary']['physicalGFactor']
    applied=factor*load['fullForceN']+(0. if stock is None else g_factor*stock['fullForceN'])+(0. if surface is None else surface['fullForceN'])
    applied_port=factor*load['condensedForceKN']+(0. if stock is None else g_factor*stock['condensedForceKN'])+(0. if surface is None else surface['condensedForceKN'])
    u=np.asarray(u);internal=np.linalg.solve(operator['interiorStiffnessN'],applied[operator['interiorIndices']]-operator['interiorCouplingN']@u)
    full=np.zeros(len(operator['fullMatrixN']));full[operator['retainedIndices']]=u;full[operator['interiorIndices']]=internal
    reaction=operator['condensedStiffnessKN']@u-applied_port
    energy=float(full@operator['fullMatrixN']@full/2000)
    work=float(u@reaction+full@applied/1000);residual=abs(2*energy-work)/max(1.,abs(work))
    if residual>1e-7:raise ValueError('Actual joined roof recovery loses physical work/energy')
    springs={r['id']:r for r in raw['springs']};receivers=[]
    for row in data['receivers']:
        state=springs[row['springId']];receivers.append({**row,'active':state['active'],
            'relativeExtensionMm':state['relativeMm'],'forceKN':state['forceKN']})
    ring=[{'id':data['ringNodes'][tuple(point)],'xyMm':point,
        'displacementMmRad':raw['displacements'][data['ringNodes'][tuple(point)]]} for point in operator['ringPointsXYMm']]
    origins=[{**r,'forceKN':[factor*v for v in r['forceKN']]} for r in load['origins']]
    wrench=np.zeros(6)
    for row in origins:wrench[:3]+=row['forceKN'];wrench[3:]+=np.cross(row['pointXYZMm'],row['forceKN'])/1000
    result={'schema':'str-roof-floor-coupling-result/1','request':data['settings'],'sourceSHA256':operator['sourceSHA256'],
        'operator':roof_operator_summary(operator),'windIndex':load['windIndex'],'programme':load['programme'],
        'courtProjection':load['courtProjection'],'sourcePressureOrigins':origins,'additionalPressureWrenchKN_KNm':wrench.tolist(),
        'upperL':data['upperL'],'upperLPhysicalGKN':data['upperLPhysicalGKN'],'receivers':receivers,'ringDisplacements':ring,
        'maximumRingTranslationMm':max(math.sqrt(sum(v*v for v in r['displacementMmRad'][:3])) for r in ring),
        'roofPhysicalStrainEnergyKNmm':energy,'roofPhysicalWorkRelativeResidual':residual,
        'energyModeReconstructionRelativeError':data['energyModeReconstructionRelativeError'],
        'modeledSteelGravityIntegrated':stock is not None,'roofSteelGravity':None,
        'roofSurfacePressure':None,'roofSurfacePressureIntegrated':surface is not None,
        'actualHeadCount':len(model['grid']['heads']),'roofGravityIntegrated':False,'roofAdoption':False,
        'completeHouseProof':False,'candidateAccepted':False,'installedAcceptance':False,
        'datumsMm':{'floorSlabZMm':[3170,3370],'upperLBodyZMm':[3370,6540],
            'metalRingZMm':[6540,6660],'ringMasterZMm':6600,'heelZMm':6860,'roofWeatherDatumMm':None},
        'diagnostics':['Inherited tied-roof geometry is an unselected mechanical control. Old radial-guide/collar/welded-heel/clearance acceptance is not transferred.',
            'Upper four-L ownG is charged once above RC200; overlapping gross upper GMAX rejects. Modeled steel ownG, when requested, is separate from unmodeled weather layers and connecting-stock allowances; other upper-wall gravity remains integration debt.',
            'Source P2/crown pressure uses the sole floor wind index. Ordinary lower P0/opening pressure, wet/material/weather coordination and complete-house acceptance remain absent.']}
    if stock is not None:
        from roof_stock_gravity import serial_roof_stock_gravity,recover_roof_stock_local_actions
        result['roofSteelGravity']={**serial_roof_stock_gravity(stock),
            'appliedPhysicalGFactor':g_factor,'appliedPhysicalGKN':g_factor*stock['physicalGKN'],
            'actualLocalActions':recover_roof_stock_local_actions(stock,operator,full,g_factor)}
    if surface is not None:
        from roof_surface_pressure import serial_roof_surface_pressure,recover_combined_roof_primary_actions
        actions=recover_combined_roof_primary_actions(surface,operator,full,stock,g_factor)
        result['roofSurfacePressure']={**serial_roof_surface_pressure(surface),'actualLocalActions':actions}
        if stock is not None:
            result['roofSteelGravity']['actualLocalActions']=actions
            result['roofSteelGravity']['actualLocalActionScope']='Actual combined steel-G and signed surface-pressure cuts; the steel origin ledger remains G only.'
        result['diagnostics'].append('Signed roof PLAN-pressure is an independently authored executed control. It supplies no site snow/wind coefficient or automatic correlation with the facade wind programme.')
    result['roofSvg']=draw_roof_floor_support(model,result)
    return result


def draw_roof_floor_support(model,result):
    """Computed source0 topology; no invented weather skin or section detail."""
    from html import escape
    from vertical_rc_floor import grid_member_geometry
    data=model['roofFloorCoupling'];p=data['operator']['scope'];frame=model['model']
    def xy(point):
        x,y,z=point;return 600+.032*(x-y),520+.015*(x+y-12000)-.035*z
    def line(a,b,color,width=1.,dash=''):
        x,y=xy(a);u,v=xy(b);return f'<path d="M{x:.3f},{y:.3f} L{u:.3f},{v:.3f}" fill="none" stroke="{color}" stroke-width="{width}"'+(f' stroke-dasharray="{dash}"' if dash else '')+'/>'
    rows=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 950"><rect width="1200" height="950" fill="#faf8f2"/>',
        '<style>text{font:14px sans-serif;fill:#263d43}.small{font-size:12px}.hold{fill:#a14c3d}</style>',
        '<text x="35" y="35" font-size="21">ACTUAL ROOF / RC200 FLOOR / 52-HEAD COUPLED CONTROL</text>',
        '<text x="35" y="61">Source ground0 / one solved frame and plate / inherited roof geometry unselected</text>']
    for member in grid_member_geometry(model).values():rows.append(line(member['physicalStartMm'],member['physicalEndMm'],'#b0aaa0',.8))
    for name,a,b,_ in frame.members:
        if any(name.startswith(corner+'/') for corner in ('SW','SE','NW','NE')):
            rows.append(line(frame.nodes[a],frame.nodes[b],'#7e978a',2.4))
    for member in model['members'].values():
        if member['kind']=='post':rows.append(line(member['physicalStartMm'],member['physicalEndMm'],'#9aaa92',1.8))
    for a,b in p['rings']:rows.append(line([*a,6600],[*b,6600],'#496e78',1.6))
    for a,b in p['radials']:
        middle=[(a[i]+b[i])/2 for i in (0,1)]
        rows.append(line([*a,6860],[*middle,p['zhigh']],'#496e78',1.7));rows.append(line([*middle,p['zhigh']],[*b,6860],'#496e78',1.7))
        tie_z=p['heel']['node']['ordinary']['tieCentre']
        rows.append(line([*a,tie_z],[*b,tie_z],'#67878c',.9))
        for point in (a,b):rows.append(line([*point,6600],[*point,6860],'#8e9fa0',.8,'2 2'))
    for a,b in p['ridgePairs']:rows.append(line([*a,p['zhigh']+p['seatZ']],[*b,p['zhigh']+p['seatZ']],'#496e78',1.))
    for point in p['crowns']:rows.append(line([*point,p['zhigh']],[*point,p['zhigh']+p['seatZ']],'#8e9fa0',.7,'2 2'))
    for row in result['receivers']:rows.append(line([*row['xyMm'],3270],[*row['xyMm'],6600],'#a76d43',1.,'4 3'))
    for row in result['upperL']:rows.append(line(row['physicalStartXYZMm'],row['physicalEndXYZMm'],'#718f85',4.))
    for family,low,high in [('outer',332.5,11667.5),('court',3917.5,8082.5)]:
        points=[[low,low,3270],[high,low,3270],[high,high,3270],[low,high,3270]]
        for a,b in zip(points,points[1:]+points[:1]):rows.append(line(a,b,'#778c82',2.))
    for head in model['grid']['heads']:
        x,y=xy(frame.nodes[head['id']]);rows.append(f'<circle cx="{x:.3f}" cy="{y:.3f}" r="2.3" fill="#737c74"/>')
    labels=[f"Source programme {result['windIndex']} / {result['programme']} / courtyard projection {result['courtProjection']}",
        f"58 roof ring points; 4 finite upper L + 18 explicit axial paths; {result['actualHeadCount']} actual named heads",
        f"Upper L selfG {result['upperLPhysicalGKN']:.3f} kN; modeled steel G {0. if result['roofSteelGravity'] is None else result['roofSteelGravity']['physicalGKN']:.3f} kN; roof translation {result['maximumRingTranslationMm']:.4f} mm",
        'Datums: RC3170..3370; upper-L3370..6540; metal ring6540..6660; heel6860 mm.',
        'Blue: modeled roof. Green: finite RC paths. Gray: actual grid/heads. Brown dashed: unqualified axial work paths.',
        ('Modeled steel G is joined; weather-layer G and ordinary lower P0 remain absent.' if result['modeledSteelGravityIntegrated'] else 'Roof steel G and ordinary lower P0 remain unjoined.')+' No weather or hardware approval.',
        'Source0 mechanical control; water/material/thermal and raised-house applicability remain unqualified.']
    for i,text in enumerate(labels):rows.append(f'<text x="35" y="{765+23*i}" class="small {"hold" if i>=5 else ""}">{escape(text)}</text>')
    rows.append('</svg>');return '\n'.join(rows)+'\n'
