"""Additive, unselected RC/mineral ground-pocket gravity comparison.

Existing MITC4, serial bodies and actual finite grid traces own the mechanics.
No membrane, mineral shear, extra north strip or installed resistance is added.
"""
from __future__ import annotations
import copy,hashlib,json,math
from pathlib import Path
import numpy as np
from vertical_floor_plate import mitc4_element,rectangle_shapes,plate_cells,GAUSS
from vertical_rc_floor import grid_member_geometry,grid_vertical_point_terms
from lower_core_bodies import serial_body_law
from finite_mapped_frame import combine
from rc_floor_house_loads import _add,_family_wrench

METHOD='project/str/studies/service_room_ground.py'

def number(value,lo,hi):
    return type(value) in (int,float) and math.isfinite(value) and lo<=value<=hi

def settings(value):
    required={'enabled','platePitchMm','contactPitchMm','plateLaw','mineralModulusMPa','jointComplianceMmPerMPa'}
    if not isinstance(value,dict) or set(value)!=required or type(value['enabled']) is not bool or not number(value['platePitchMm'],100,500) or not number(value['contactPitchMm'],50,500) or not number(value['mineralModulusMPa'],10,100000) or not number(value['jointComplianceMmPerMPa'],.001,10):
        raise ValueError('Explicit bounded ground-pocket numerical comparison controls required')
    law=value['plateLaw']
    if not isinstance(law,dict) or set(law)!={'elasticModulusMPa','poissonRatio','flexuralFactor','shearFactor'} or not number(law['elasticModulusMPa'],1000,100000) or not number(law['poissonRatio'],0,.49) or not number(law['flexuralFactor'],.05,1) or not number(law['shearFactor'],.05,1):
        raise ValueError('Explicit unqualified elastic plate comparison law required')
    return copy.deepcopy(value)

def rectangle(value):
    if not isinstance(value,(list,tuple)) or len(value)!=4 or any(not number(v,-100000,100000) for v in value) or value[2]<=value[0] or value[3]<=value[1]:
        raise ValueError('Positive finite actual rectangle required')
    return list(value)

def body_geometry(value):
    required={'id','rcRectangleXYMm','rcZMm','rcUnitWeightKNPerM3','mineralZMm','mineralUnitWeightKNPerM3','disjointContactRectanglesXYMm'}
    if not isinstance(value,dict) or not required<=set(value) or not isinstance(value['id'],str) or not value['id']:
        raise ValueError('Explicit source-derived floor stock body required')
    result={k:copy.deepcopy(value[k]) for k in required}
    r=rectangle(result['rcRectangleXYMm']);result['rcRectangleXYMm']=r
    if value.get('rcRectangleIsEnvelopeOnly') and 'rcPlanRectanglesXYMm' not in value:raise ValueError('RC envelope cannot replace an actual notched plan')
    if 'rcPlanRectanglesXYMm' in value:
        plans=value['rcPlanRectanglesXYMm']
        if not isinstance(plans,list) or not plans:raise ValueError('Actual nonempty notched RC plan required')
        plans=[rectangle(p) for p in plans]
        for i,a in enumerate(plans):
            if a[0]<r[0] or a[1]<r[1] or a[2]>r[2] or a[3]>r[3]:raise ValueError('Notched RC plan outside its declared envelope')
            if any(min(a[2],b[2])>max(a[0],b[0]) and min(a[3],b[3])>max(a[1],b[1]) for b in plans[:i]):raise ValueError('Duplicate physical notched RC area')
        if [min(p[0] for p in plans),min(p[1] for p in plans),max(p[2] for p in plans),max(p[3] for p in plans)]!=r:raise ValueError('Notched RC envelope does not bound its actual plan')
        result['rcPlanRectanglesXYMm']=plans
    if result['rcZMm']!=[-30,170] or result['mineralZMm']!=[-180,-30]:
        raise ValueError('Only explicit530-profile stock on unchanged grid top−180 is supported; no Z translation')
    for key in ['rcUnitWeightKNPerM3','mineralUnitWeightKNPerM3']:
        if not number(result[key],1,40):raise ValueError('Actual source force-density stock required')
    contacts=result['disjointContactRectanglesXYMm']
    if not isinstance(contacts,list) or not contacts:raise ValueError('Actual nonempty finite contact union required')
    for i,raw in enumerate(contacts):
        a=rectangle(raw)
        if a[0]<r[0]-1e-8 or a[1]<r[1]-1e-8 or a[2]>r[2]+1e-8 or a[3]>r[3]+1e-8:raise ValueError('Mineral contact outside actual RC body')
        covered=sum(max(0,min(a[2],p[2])-max(a[0],p[0]))*max(0,min(a[3],p[3])-max(a[1],p[1])) for p in result.get('rcPlanRectanglesXYMm',[r]))
        if abs(covered-(a[2]-a[0])*(a[3]-a[1]))>1e-9*(a[2]-a[0])*(a[3]-a[1]):raise ValueError('Mineral contact crosses an actual RC notch')
        for b in contacts[:i]:
            if min(a[2],b[2])-max(a[0],b[0])>1e-8 and min(a[3],b[3])-max(a[1],b[1])>1e-8:raise ValueError('Duplicate physical mineral contact area')
    return result

def stock_wrench(body):
    """Independent physical volume/centroid ledger, unfactored kN/kNm about0."""
    r=body['rcRectangleXYMm'];z0,z1=body['rcZMm'];m0,m1=body['mineralZMm']
    rows=[]
    for identifier,a,depth,density in [(('rc' if 'rcPlanRectanglesXYMm' not in body else f'rc/{i}'),a,z1-z0,body['rcUnitWeightKNPerM3']) for i,a in enumerate(body.get('rcPlanRectanglesXYMm',[r]))]+[(f'mineral/{i}',a,m1-m0,body['mineralUnitWeightKNPerM3']) for i,a in enumerate(body['disjointContactRectanglesXYMm'])]:
        weight=(a[2]-a[0])*(a[3]-a[1])*depth/1e9*density;x=(a[0]+a[2])/2;y=(a[1]+a[3])/2
        rows.append({'id':body['id']+'/'+identifier,'physicalGKN':weight,'globalWrenchKN_KNm':[0,0,-weight,-weight*y/1000,weight*x/1000,0]})
    return rows,[sum(row['globalWrenchKN_KNm'][i] for row in rows) for i in range(6)]

def distinct_bodies(values):
    if not isinstance(values,list) or not values:raise ValueError('Explicit nonempty physical ground bodies required')
    bodies=[body_geometry(value) for value in values]
    for i,body in enumerate(bodies):
        for previous in bodies[:i]:
            plans=body.get('rcPlanRectanglesXYMm',[body['rcRectangleXYMm']]);prior=previous.get('rcPlanRectanglesXYMm',[previous['rcRectangleXYMm']])
            if body['id']==previous['id'] or any(min(a[2],b[2])-max(a[0],b[0])>1e-8 and min(a[3],b[3])-max(a[1],b[1])>1e-8 for a in plans for b in prior):
                raise ValueError('Duplicate or overlapping physical ground bodies')
    return bodies

def element_energy(matrix):
    """Same unit-scaled mapped-energy representation as the existing frame."""
    k=np.asarray(matrix,float);scale=np.array([1,.001,.001]*4)
    if k.shape!=(12,12) or not np.isfinite(k).all():raise ValueError('Finite actual MITC4 energy required')
    maximum=max(1.,float(abs(k).max()))
    if float(abs(k-k.T).max())/maximum>1e-10:raise ValueError('Plate energy loses symmetry')
    scaled=scale[:,None]*k*scale[None,:];values,vectors=np.linalg.eigh((scaled+scaled.T)/2);bound=max(1.,float(abs(scaled).max()))
    if values.min() < -bound*1e-9:raise ValueError('Negative MITC4 physical energy')
    selected=values>bound*1e-12
    if np.count_nonzero(selected)!=9:raise ValueError('MITC4 must retain nine positive and three rigid modes')
    modes=(vectors[:,selected]*np.sqrt(values[selected])).T/scale[None,:]
    error=float(abs(modes.T @ modes-k).max())/maximum
    if error>1e-9:raise ValueError('Full MITC4 energy reconstruction failed')
    return modes,error

def partition_contact(contact,beam_rectangles,pitch):
    """Exact footprint coverage before quadrature; cap fallback is forbidden."""
    x0,y0,x1,y1=contact
    axes=[]
    for lo,hi,axis in [(x0,x1,0),(y0,y1,1)]:
        raw=sorted({lo,hi,*[v for r in beam_rectangles for v in (r[axis],r[axis+2]) if lo<v<hi]});points=[]
        for a,b in zip(raw,raw[1:]):
            n=max(1,math.ceil((b-a)/pitch));points.extend(a+(b-a)*i/n for i in range(n))
        axes.append(points+[hi])
    cells=[]
    for a,c in zip(axes[0],axes[0][1:]):
        for b,d in zip(axes[1],axes[1][1:]):
            x,y=(a+c)/2,(b+d)/2
            if not any(r[0]<=x<=r[2] and r[1]<=y<=r[3] for r in beam_rectangles):raise ValueError('Contact has uncovered physical beam-only area')
            cells.append([a,b,c,d])
    return cells

def plate_trace(points,cells,x,y):
    for cell in cells:
        a,b,c,d=cell
        if a-1e-8<=x<=c+1e-8 and b-1e-8<=y<=d+1e-8:
            xi=2*(x-a)/(c-a)-1;eta=2*(y-b)/(d-b)-1;n,_,_=rectangle_shapes(xi,eta,c-a,d-b)
            return [(points[p],[0,0,v,0,0,0]) for p,v in zip([(a,b),(c,b),(c,d),(a,d)],n) if v]
    raise ValueError('No physical plate at mineral top contact')

def beam_footprints(members):
    beams=[]
    for row in members.values():
        a,b=row['physicalStartMm'],row['physicalEndMm'];half=row['widthMm']/2
        if a[0]==b[0]:beams.append([a[0]-half,min(a[1],b[1]),a[0]+half,max(a[1],b[1])])
        elif a[1]==b[1]:beams.append([min(a[0],b[0]),a[1]-half,max(a[0],b[0]),a[1]+half])
        else:raise ValueError('Only actual axis-aligned ground receivers supported')
    return beams

def contact_specifications(model,body,members,choice):
    """One physical partition and work-map route for preparation and assembly."""
    beams=beam_footprints(members)
    for ci,contact in enumerate(body['disjointContactRectanglesXYMm']):
        for si,cell in enumerate(partition_contact(contact,beams,choice['contactPitchMm'])):
            a,b,c,d=cell;area=(c-a)*(d-b)/4
            for ii,xi in enumerate(GAUSS):
                for jj,eta in enumerate(GAUSS):
                    x=(a+c)/2+xi*(c-a)/2;y=(b+d)/2+eta*(d-b)/2
                    route=grid_vertical_point_terms(model,members,[x,y,-180.])
                    if not route or 'routeKind'in route or route['memberId'] not in members or abs(route['topZMm']+180)>1e-7:raise ValueError('Actual beam-only mineral receiver at−180 required')
                    yield {'key':f'{ci}/{si}/{ii}/{jj}','xyMm':[x,y],'areaMm2':area,'route':route}

def prepare_receiver_origins(model,bodies,choice):
    """Declare all service receivers before old core/foundation G is applied."""
    from grid_origin_recovery import initialise_grid_origins
    if model.get('lowerCoreBodies') is not None or model.get('foundationWeight') is not None or model.get('wetGridOrigins',{}).get('adapters'):
        raise ValueError('Ground receivers must be declared before source gravity adapters complete')
    members=grid_member_geometry(model)
    ids=sorted({s['route']['memberId'] for body in bodies for s in contact_specifications(model,body,members,choice)})
    if not ids:raise ValueError('Actual nonempty service receiver set required')
    temporary={};initialise_grid_origins(temporary,members,ids)
    if 'wetGridOrigins' not in model:initialise_grid_origins(model,members,ids)
    else:model['wetGridOrigins']['members'].update(temporary['wetGridOrigins']['members'])
    model['serviceRoomGroundReceiverIds']=ids

def recover_receiver_cuts(model,raw,installed,post_responses,g_factor):
    """Postprocess real body forces once; never reapply them to the solve."""
    from grid_origin_recovery import _validate_adapter,recover_wet_receiving_grid
    from rc_floor_house_loads import consistent_member_point_load
    if not installed['enabled']:return None
    ids=model.get('serviceRoomGroundReceiverIds')
    fibres=[f for body in installed['bodies'] for f in body['fibres']]
    if not ids or sorted({f['receiverId'] for f in fibres})!=ids or len({f['id'] for f in fibres})!=len(fibres):raise ValueError('Actual service receiver/fibre catalogue differs from preparation')
    ledger=copy.deepcopy(model['wetGridOrigins']);expected=[{'id':f['id']+'/base-G','memberId':f['receiverId'],'centroidXYMm':f['xyMm'],'physicalDownKN':f['serialLaw']['bodyPhysicalGKN']/2} for f in fibres]
    adapter='ground-pocket/mineral-base-G'
    if _validate_adapter(ledger,adapter,expected)!=ledger['adapters'].get(adapter):raise ValueError('Service base-half gravity capture changed')
    actual_service=[s['id'] for s in model['model'].springs if s['id'].startswith('STR/HAD/GROUND/') and '/mineral/' in s['id']]
    expected_service={f['id']+'/'+end for f in fibres for end in ('body','top')}
    reported_service=[s['id'] for s in raw['springs'] if s['id'].startswith('STR/HAD/GROUND/') and '/mineral/' in s['id']]
    if len(actual_service)!=len(set(actual_service)) or set(actual_service)!=expected_service or len(reported_service)!=len(expected_service) or set(reported_service)!=expected_service:raise ValueError('Missing or duplicate actual service spring')
    states={r['id']:r for r in raw['springs']}
    for f in fibres:
        spring=states[f['id']+'/body'];row=ledger['members'][f['receiverId']];point=[*f['xyMm'],-180.]
        context={'model':model['model'],'request':{'frameLaw':model['request']['gridLaw']}}
        unit=consistent_member_point_load(context,row,point,[0,0,1.]);terms={n:v for n,v in spring['terms']};declared={n:v for n,v in f['receiverTerms']}
        if any(abs(a+b)>1e-8 or abs(a-c)>1e-8 for k,n in enumerate((row['a'],row['b'])) for a,b,c in zip(unit[6*k:6*k+6],terms.get(n,[0.]*6),declared.get(n,[0.]*6))):raise ValueError('Service body lower work trace changed')
        ledger['points'].append({'id':'solved/'+f['id']+'/body','adapter':'ground-pocket/solved-body','memberId':f['receiverId'],'pointXYZMm':point,'forceKN':[0,0,spring['forceKN']],'momentKNmm':[0,0,0],'family':'solved-interface'})
    shadow={**model,'wetGridOrigins':ledger}
    if 'seatedWetSupport' not in shadow:shadow['seatedWetSupport']={'posts':[]}
    result=recover_wet_receiving_grid(shadow,raw,post_responses,g_factor)
    result.update(serviceReceiverIds=ids,actualServiceBodyOriginIds=['solved/'+f['id']+'/body' for f in fibres],
        scope='Actual declared service and wet-post receiver members, discrete normal/body contacts, captured old core/foundation G and executed simultaneous case. No complete signed envelope, reinforcement, joint, ground or installation resistance is accepted.')
    return result

def install(model,bodies,choice):
    choice=settings(choice)
    if not choice['enabled']:return {'enabled':False,'removedNativeGKN':0,'bodies':[]}
    if not isinstance(bodies,list) or not 1<=len(bodies)<=3:raise ValueError('Explicit nonempty bounded physical body set required')
    bodies=distinct_bodies(bodies)
    frame=model['model'];members=grid_member_geometry(model)
    added={};output=[];expected=[0.]*6
    for body in bodies:
        identifier='STR/HAD/GROUND/'+body['id'];r=body['rcRectangleXYMm'];cells,_=plate_cells(body.get('rcPlanRectanglesXYMm',[r]),[],choice['platePitchMm'])
        points={};gauges=[]
        for i,p in enumerate(sorted({p for a,b,c,d in cells for p in [(a,b),(c,b),(c,d),(a,d)]})):
            node=frame.node(identifier+f'/plate-node/{i}',[*p,70.]);points[p]=node
            for axis in (0,1,5):frame.fixed[node,axis]=0.;gauges.append((node,axis))
        law={**choice['plateLaw'],'thicknessMm':200,'unitWeightKNPerM3':body['rcUnitWeightKNPerM3']};elements=[]
        for i,cell in enumerate(cells):
            a,b,c,d=cell;nodes=[points[p] for p in [(a,b),(c,b),(c,d),(a,d)]];k,unit=mitc4_element(cell,law);modes,error=element_energy(k)
            traces=[[(node,[float(j==axis) for j in range(6)])] for node in nodes for axis in (2,3,4)]
            for j,mode in enumerate(modes):frame.springs.append({'id':identifier+f'/plate/{i}/energy/{j}','terms':combine(traces,mode),'stiffness':1.,'mode':'bilateral','gap':0.})
            pressure=-body['rcUnitWeightKNPerM3']*200/1e9
            for node,value in zip(nodes,unit[::3]):_add(added,node,[0,0,value*pressure,0,0,0])
            elements.append({'rectangleXYMm':cell,'nodes':nodes,'physicalK':k,'unitPressureLoadMm2':unit,'energyReconstructionRelativeError':error})
        fibres=[]
        for spec in contact_specifications(model,body,members,choice):
            x,y=spec['xyMm'];area=spec['areaMm2'];route=spec['route']
            name=identifier+'/mineral/'+spec['key']
            weight=area*150/1e9*body['mineralUnitWeightKNPerM3'];serial=serial_body_law(area,150,choice['mineralModulusMPa'],choice['jointComplianceMmPerMPa'],weight)
            # This is the existing lower serial-body scalar class,
            # including its five absent-axis gauges and reversible
            # kb+kc coordinate scaling. Preserve even tiny exact
            # contact cells; neither physical stiffness nor G is
            # scaled in the model/independent source ledger.
            node=frame.node('LOWER-CORE/body-top/'+name,[x,y,-30.]);upper=[(node,[0,0,1,0,0,0])]
            for axis in (0,1,3,4,5):frame.fixed[node,axis]=0.;gauges.append((node,axis))
            if not hasattr(frame,'internalScalarCoordinateScales'):frame.internalScalarCoordinateScales={}
            coordinate_scale=1/math.sqrt(serial['bodyAxialStiffnessKNPerMm']+serial['topContactStiffnessKNPerMm'])
            frame.internalScalarCoordinateScales[node]=coordinate_scale
            frame.springs.append({'id':name+'/body','terms':combine([upper,route['terms']],[1.,-1.]),'stiffness':serial['bodyAxialStiffnessKNPerMm'],'mode':'bilateral','gap':0.})
            frame.springs.append({'id':name+'/top','terms':combine([plate_trace(points,cells,x,y),upper],[1.,-1.]),'stiffness':serial['topContactStiffnessKNPerMm'],'mode':'compression','gap':0.})
            _add(added,node,[0,0,-weight/2,0,0,0])
            for target,row in route['terms']:_add(added,target,[-weight/2*v for v in row])
            fibres.append({'id':name,'bodyNode':node,'xyMm':[x,y],'areaMm2':area,'receiverId':route['memberId'],'receiverTerms':route['terms'],'serialLaw':serial,'reversibleBodyScalarCoordinateScale':coordinate_scale})
            if 'serviceRoomGroundReceiverIds' in model:
                from grid_origin_recovery import record_grid_gravity
                record_grid_gravity(model,'ground-pocket/mineral-base-G',route['memberId'],[x,y],-weight/2,route['terms'],name+'/base-G')
        ledger,wrench=stock_wrench(body);expected=[a+b for a,b in zip(expected,wrench)]
        output.append({'id':body['id'],'geometry':body,'plateLaw':law,'elements':elements,'fibres':fibres,'gauges':gauges,'physicalStock':ledger,'unfactoredGlobalWrenchKN_KNm':wrench})
    if 'serviceRoomGroundReceiverIds' in model:
        from grid_origin_recovery import finish_grid_gravity_adapter
        expected_origins=[{'id':f['id']+'/base-G','memberId':f['receiverId'],'centroidXYMm':f['xyMm'],'physicalDownKN':f['serialLaw']['bodyPhysicalGKN']/2} for body in output for f in body['fibres']]
        finish_grid_gravity_adapter(model,'ground-pocket/mineral-base-G',expected_origins)
    actual=_family_wrench(model,added);residual=[a-b for a,b in zip(actual,expected)]
    if max(map(abs,residual))>1e-7:raise ValueError('Added physical stock loses independent six-wrench ledger')
    for node,row in added.items():_add(model['families']['physical-G'],node,row)
    return {'enabled':True,'settings':choice,'bodies':output,'removedNativeGKN':0,'addedPhysicalGKN':-expected[2],'independentUnfactoredWrenchKN_KNm':expected,'unfactoredWrenchResidualKN_KNm':residual,'sourceFFLMm':530,'gridTopMm':-180,'houseZTranslationApplied':False,'physicalAcceptance':False,'materialStiffnessQualified':False,'completeReceiverCutsAvailable':False}

def finish(installed,raw,g_factor):
    result=copy.deepcopy(installed)
    if not result['enabled']:return result
    states={r['id']:r for r in raw['springs']}
    for body in result['bodies']:
        gauge=max((abs(raw['supportWrenches'].get(node,[0.]*6)[axis]) for node,axis in body['gauges']),default=0.)
        if gauge>1e-7:raise ValueError('An unused local gauge carries physical reaction')
        top_total=base_total=0.;open_count=0;pressure=0.;top_wrench=np.zeros(6);base_wrench=np.zeros(6);contact_work=0.
        for fibre in body['fibres']:
            top=states[fibre['id']+'/top'];axial=states[fibre['id']+'/body'];weight=fibre['serialLaw']['bodyPhysicalGKN']*g_factor
            compression=-top['forceKN'];base=-axial['forceKN']+weight/2
            if compression < -1e-7 or abs(base-compression-weight)>1e-6:raise ValueError('Serial mineral top/base/own-G balance fails')
            fibre.update(topState=top,bodyState=axial,topCompressionKN=compression,baseCompressionKN=base,
                actualPressureMPa=compression*1000/fibre['areaMm2'],topOpeningMm=max(0.,top['relativeMm']))
            top_total+=compression;base_total+=base;open_count+=not top['active'];pressure=max(pressure,fibre['actualPressureMPa'])
            x,y=fibre['xyMm'];top_wrench+=np.array([0,0,compression,compression*y/1000,-compression*x/1000,0])
            base_wrench+=np.array([0,0,base,base*y/1000,-base*x/1000,0])
            plate_w=top['relativeMm']+raw['displacements'][fibre['bodyNode']][2]
            contact_work+=compression*plate_w
        plate_energy=rc_work=0.
        for element in body['elements']:
            q=[raw['displacements'][node][axis] for node in element['nodes'] for axis in (2,3,4)]
            element['displacementsMmRad']=q
            element['physicalEnergyKNmm']=float(.5*np.asarray(q) @ np.asarray(element['physicalK']) @ np.asarray(q))
            plate_energy+=element['physicalEnergyKNmm']
            rc_work+=float(np.dot(q,np.asarray(element['unitPressureLoadMm2'])*(-body['geometry']['rcUnitWeightKNPerM3']*200/1e9*g_factor)))
        own=-body['unfactoredGlobalWrenchKN_KNm'][2]*g_factor
        rc_wrench=np.array(body['physicalStock'][0]['globalWrenchKN_KNm'])*g_factor
        stock_wrench=np.array(body['unfactoredGlobalWrenchKN_KNm'])*g_factor
        top_residual=top_wrench+rc_wrench;base_residual=base_wrench+stock_wrench
        work_residual=2*plate_energy-rc_work-contact_work
        if max(abs(top_residual).max(),abs(base_residual).max(),abs(base_total-own))>1e-5:raise ValueError('Local plate/mineral independent six-wrench sourceG does not reach actual grid')
        if abs(work_residual)>1e-6*max(1.,abs(2*plate_energy),abs(rc_work),abs(contact_work)):raise ValueError('Plate full rotational energy/consistent G/contact work fails')
        body.update(unusedGaugeMaximumReactionKNOrKNmm=gauge,topCompressionKN=top_total,gridCompressionKN=base_total,
            openingFibreCount=open_count,peakSampledTopPressureMPa=pressure,sourceGToGridResidualKN=base_total-own,
            topGravitySixWrenchResidualKN_KNm=top_residual.tolist(),gridGravitySixWrenchResidualKN_KNm=base_residual.tolist(),
            plateEnergyKNmm=plate_energy,consistentRCGravityWorkKNmm=rc_work,topContactWorkKNmm=contact_work,plateWorkResidualKNmm=work_residual)
    result.update(physicalGFactorApplied=g_factor,appliedKnownStockGKN=result['addedPhysicalGKN']*g_factor,
        actualReceiverIds=sorted({f['receiverId'] for b in result['bodies'] for f in b['fibres']}),
        contactConverged=False,plateConverged=False,fullInstalledInventoryIncluded=False,siteOrJointResistanceAvailable=False)
    return result

def run(request,root=None):
    import floor_section_model as native
    from retained_components import load_retained_source,evaluate_retained_components
    root=Path(root or Path(__file__).resolve().parents[3])
    if not isinstance(request,dict) or set(request)!={'schema','caseId','nativeCase','structuralFloorBodies','settings','stockSource'} or request['schema']!='str-service-room-ground-request/1' or not isinstance(request['caseId'],str) or not request['caseId'] or not isinstance(request['stockSource'],dict):
        raise ValueError('Explicit versioned saved native request and supplied current HAD stock source required')
    choice=settings(request['settings']);bodies=distinct_bodies(request['structuralFloorBodies'])
    case=copy.deepcopy(request['nativeCase']);source=native.load_source(root)
    if case.get('sourceSHA256')!=source['identities']:raise ValueError('Current complete native source identity required')
    component=case['bearingCase']['masonryCase']['verticalCase']['monolithicCase']['houseCase']['joinedCase']['floor']['componentCase']
    retained=evaluate_retained_components(component,load_retained_source(root))
    old=next(r for r in retained['components'] if r['id']=='GROUND-SLAB/current-connected-RC200')
    if old['creditedWeightKN']!=0:raise ValueError('Native already credits ground-floor stock; explicit replacement reconciliation required')
    before=hashlib.sha256((root/METHOD).read_bytes()).hexdigest();captured={};build=native._build_base;solve=native.solve_vertical_frame
    def wrapped_build(*args,**kwargs):
        if choice['enabled']:
            previous=kwargs.get('additional_receiver_builder')
            def prepare(model):
                receivers=previous(model) if previous is not None else []
                prepare_receiver_origins(model,bodies,choice)
                return receivers
            kwargs['additional_receiver_builder']=prepare
        model=build(*args,**kwargs);model['serviceRoomGround']=install(model,bodies,choice);captured['model']=model;return model
    def wrapped_solve(frame,data):
        raw=solve(frame,data);captured['raw']=raw;return raw
    try:
        native._build_base=wrapped_build;native.solve_vertical_frame=wrapped_solve
        output=native.run(case,source,request['caseId'])
    finally:native._build_base=build;native.solve_vertical_frame=solve
    if hashlib.sha256((root/METHOD).read_bytes()).hexdigest()!=before or source['identities']!=native.load_source(root)['identities']:raise ValueError('Ground comparison source changed during execution')
    model=captured['model'];factor=model['houseLoadCase']['boundary']['physicalGFactor'];comparison=finish(model['serviceRoomGround'],captured['raw'],factor)
    comparison['receiverCutRecovery']=recover_receiver_cuts(model,captured['raw'],model['serviceRoomGround'],output.get('seatedWetSupport',{}).get('posts',[]),factor)
    return {'schema':'str-service-room-ground-response/1','experimentalRequest':copy.deepcopy(request),'sourceSHA256':source['identities'],
        'experimentalMethodSHA256':{METHOD:before},'baselineNativeGroundStockEvidence':old,'removedNativeGKN':0,
        'comparison':comparison,'native':output['nativeVertical']['native'],'mass':output['mass'],'baselineFloorSection':output['floorSection'],
        'candidateAccepted':False,'wholeHouseAccepted':False,'raisedHouseForceReplayAvailable':False,
        'diagnostics':['Only supplied known RC/contact-mineral gravity and explicitly unqualified vertical plate/contact stiffness added. No glass/finish/pan/frame/valve/store/pressure/hydrostatic or complete installed envelope is included.',
            'Actual cold grid remains−180. This is not a530mm translation or an adopted floor/roof/frame/stair revision.',
            ('Physical end/interior cuts are available on the declared wet/service receivers for this executed discrete case; complete signed demand envelopes and reinforcement/joint/ground resistance remain unqualified.' if comparison.get('receiverCutRecovery') and comparison['receiverCutRecovery']['physicalElementCutsAvailable'] else 'Physical receiver cuts are unavailable for this comparison; no reaction total substitutes for local demand or resistance.')]}

if __name__=='__main__':
    import argparse
    p=argparse.ArgumentParser();p.add_argument('--request',type=Path,required=True);p.add_argument('--out',type=Path,required=True);a=p.parse_args()
    if a.out.exists():raise ValueError('Refuse replacing a recoverable native capture')
    a.out.write_text(json.dumps(run(json.loads(a.request.read_bytes())),indent=2,allow_nan=False)+'\n')
