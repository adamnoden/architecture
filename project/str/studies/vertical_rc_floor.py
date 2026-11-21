import copy
import hashlib
import json
import math
import re
from pathlib import Path
import sys

from distributed_floor_compatibility import native_intermediate_support_ports
from joined_successor_compatibility import _grid
from joined_successor_kernel import FrameModel, cross, rectangle_section
from rc_floor_house_loads import _beam_point, _family_wrench, _physical_cut_rows, _timoshenko_shapes
from rc_portal_monolithic import build_monolithic_rc_portals, load_monolithic_rc_source, reference_monolithic_rc_case, solve_monolithic_rc_portals
from retained_components import evaluate_retained_components
from vertical_floor_numerics import solve_vertical_frame
from vertical_floor_plate import GAUSS, assemble_vertical_plate, condense_vertical_plate, plate_cells, rectangle_shapes, recover_vertical_plate


METHOD='project/str/studies/vertical_rc_floor.py'
KERNEL='project/str/studies/vertical_floor_plate.py'


def load_vertical_rc_floor_source(root):
    root=Path(root);parent=load_monolithic_rc_source(root)
    return {'root':root,'parent':parent,'identities':{**parent['identities'],**{p:hashlib.sha256((root/p).read_bytes()).hexdigest() for p in (METHOD,KERNEL,'project/str/studies/vertical_floor_numerics.py','project/str/studies/vertical-floor-requirements.txt','project/str/studies/vertical_floor_views.py')}}}


def reference_vertical_rc_floor_case(source):
    return {'schema':'str-vertical-rc-floor-case/1','sourceSHA256':source['identities'],'monolithicCase':reference_monolithic_rc_case(source['parent']),
        'plateLaw':None,'bearingLaw':None,'maxPitchMm':1000,'bearingQuadratureOrder':4,'freshUniformLiveKPa':0,
        'geometryPolicy':'actual-source-voids-and-service-envelopes-plus-slab-band-union-with-withheld-wet-domain','supportPolicy':'finite-clear-core-vertical-compression-only',
        'use':'unqualified-vertical-floor-gravity-comparison'}


def inside(point,rectangle,tolerance=0):return rectangle[0]-tolerance<=point[0]<=rectangle[2]+tolerance and rectangle[1]-tolerance<=point[1]<=rectangle[3]+tolerance


def intersect(a,b):
    r=[max(a[0],b[0]),max(a[1],b[1]),min(a[2],b[2]),min(a[3],b[3])]
    return r if r[2]-r[0]>1e-7 and r[3]-r[1]>1e-7 else None


def clear_intervals(lo,hi,holes):
    cuts=sorted({lo,hi,*[x for pair in holes for x in pair if lo<x<hi]})
    return [(a,b) for a,b in zip(cuts,cuts[1:]) if not any(left<(a+b)/2<right for left,right in holes)]


def normal_point_port_id(point):
    """Equal numeric XY values must name the same physical scalar coordinate.

    Float repr retains the full binary value; no decimal rounding merges nearby
    physical points. int3800 and float3800.0 deliberately have one identity.
    """
    if len(point)!=2 or any(type(v) not in (int,float) or not math.isfinite(v) for v in point):raise ValueError('Finite physical normal-port XY required')
    return 'NORMAL/'+str(tuple(0. if v==0 else float(v) for v in point))


def retained_physical_receiver_coefficients(receiver_points,physical_traces,boundary,port_count):
    """Reuse the actual mesh trace; an equal-XY orphan is not a receiver."""
    result={}
    for point,identifier in receiver_points.items():
        before=port_count()
        coefficients=physical_traces[point] if point in physical_traces else boundary(point,0)
        if port_count()!=before:raise ValueError('Retained receiver created an orphan coordinate instead of reusing a physical mesh/member trace: '+identifier)
        if not coefficients or not any(value for _,value in coefficients):raise ValueError('Retained receiver has no actual work-dual physical trace: '+identifier)
        result[identifier]=list(coefficients)
    return result


def retained_receiver_operator_participation(point,coefficients,assembled,operator):
    """Source-derived participation audit, not an invented support stiffness."""
    physical=assembled['pointTerms'].get((point,0));trace_source='existing-finite-rc-member-trace'
    if physical is not None:
        if coefficients!=physical:raise ValueError('Retained receiver differs from the actual assembled physical-point trace')
        trace_source='actual-physical-mesh-point-trace'
    used={i for element in assembled['elements'] for terms in element['terms'] for i,value in terms if value}
    active=[(i,value) for i,value in coefficients if value]
    if not active or any(i not in used or assembled['matrix'].get(i,{}).get(i,0.)<=0 for i,_ in active):raise ValueError('Retained receiver has an unused/zero physical plate row')
    assembled_row={}
    for i,coefficient in active:
        for j,value in assembled['matrix'][i].items():assembled_row[j]=assembled_row.get(j,0.)+coefficient*value
    condensed=operator['condensedStiffness'];assembled_max=max(abs(v) for v in assembled_row.values())
    condensed_max=max(abs(math.fsum(coefficient*condensed[i][j] for i,coefficient in active)) for j in range(len(condensed)))
    if assembled_max<=0 or condensed_max<=0:raise ValueError('Retained receiver has no actual assembled/condensed plate participation')
    return {'schema':'str-retained-plate-operator-participation/1','physicalTraceConfirmed':True,
        'traceSource':trace_source,'createdScalarCoordinateCount':0,'participatingPortCount':len(active),
        'allCoefficientRowsUsedByPhysicalElements':True,'assembledTraceRowMaxAbs':assembled_max,
        'condensedTraceRowMaxAbs':condensed_max,'portIndices':[i for i,_ in active],
        'scope':'Native mixed-coordinate matrix participation only; no physical receiving law, stiffness or resistance is earned.'}


def clear_ground_core_rectangles(source):
    parent=source['parent']['house']['joined']['floor'];h=parent['retained']['values']['project/had/studies/water-replan.json']['model'];axes=parent['retained']['policy']['axes'];rows=[]
    text=parent['retained']['texts']['project/str/studies/current-house-head-actions.py']
    if "wallrect(i,lo,hi,d,140)" not in text or "CORE_HEIGHTS_MM = {'ground': 3350, 'upper': 3170}" not in text:raise ValueError('Actual140groundcore/3350height source recipe changed')
    for family,lo,hi in (('outer',axes['A'],axes['B']),('court',axes['C'],axes['E'])):
        for face,axis,datum in (('south',0,lo),('east',1,hi),('north',0,hi),('west',1,lo)):
            name=family+'-'+face;holes=[]
            for opening in h['archOpeningRegister']['GROUND']:
                if opening['wall']==name:
                    reserve=opening['radialRingTrial'];holes.append((opening['centre']-opening['width']/2-reserve,opening['centre']+opening['width']/2+reserve))
            for a,b in clear_intervals(lo-70,hi+70,holes):
                r=[a,datum-70,b,datum+70] if axis==0 else [datum-70,a,datum+70,b]
                rows.append({'id':'GROUND-CLEAR/'+name+'/'+str(a),'rectangleXYMm':r,'materialKind':'source-core-material-unqualified','sourceWallId':name,'archProjectionOmitted':True})
    for wall in h['groundWalls']:
        if wall['id']=='gallery-east-water-weather':continue
        axis=0 if wall['a'][0]!=wall['b'][0] else 1;lo=min(wall['a'][axis],wall['b'][axis]);hi=max(wall['a'][axis],wall['b'][axis]);a0,a1=wall['structuralCore']
        for a,b in clear_intervals(lo,hi,wall.get('holes',[])):
            r=[a,a0,b,a1] if axis==0 else [a0,a,a1,b]
            rows.append({'id':'GROUND-CLEAR/'+wall['id']+'/'+str(a),'rectangleXYMm':r,'materialKind':'source-core-material-unqualified','sourceWallId':wall['id'],'archProjectionOmitted':False})
    changes=h['structuralChanges'];p=changes['stairMidPost']['concrete'];rows.append({'id':'GROUND-CLEAR/stair-mid-post','rectangleXYMm':[p[0],p[1],p[0]+p[2],p[1]+p[3]],'materialKind':'source-RC-column','sourceWallId':'stair-mid-post'})
    for side in ('south','north'):
        p=changes['newWetWallBeam'][side+'ReceiverCore'];rows.append({'id':'GROUND-CLEAR/wet-'+side+'-receiver','rectangleXYMm':[p[0],p[1],p[0]+p[2],p[1]+p[3]],'materialKind':'source-RC-column','sourceWallId':'wet-'+side})
    return rows


def grid_member_geometry(model):
    class Recorder(FrameModel):
        def __init__(self):super().__init__();self.geometry={}
        def member(self,name,a,b,section,material,physical_start=None,physical_end=None,y_axis=None):
            self.geometry[name]={'a':a,'b':b,'physicalStartMm':list(physical_start or self.nodes[a]),'physicalEndMm':list(physical_end or self.nodes[b])}
            super().member(name,a,b,section,material,physical_start,physical_end,y_axis)
    recorder=Recorder();lines=_grid(recorder,model['grid'],model['request']['gridLaw']);actual={name:(a,b,k) for name,a,b,k in model['model'].members};result={}
    for name,a,b,k in recorder.members:
        if actual[name]!=(a,b,k):raise ValueError('Actual finite ground member does not match source geometry')
        row=recorder.geometry[name];line=lines[name[5:].rsplit('/',1)[0]];result[name]={**row,'widthMm':line['width'],'heightMm':line['z'][1]-line['z'][0],'topZMm':line['z'][1]}
    return result


def grid_vertical_point_terms(model,members,point):
    choices=[];frame=model['model'];law=model['request']['gridLaw']
    for name,row in members.items():
        p,q=row['physicalStartMm'],row['physicalEndMm'];length=math.dist(p,q);axis=[(b-a)/length for a,b in zip(p,q)];s=sum((point[i]-p[i])*axis[i] for i in (0,1));at=[p[i]+s*axis[i] for i in range(3)];offset=[point[0]-at[0],point[1]-at[1],0.]
        distance=math.hypot(*offset[:2])
        if -1e-7<=s<=length+1e-7 and distance<=row['widthMm']/2+1e-7:choices.append((distance,name,row,length,axis,s,offset))
    if not choices:
        caps=[head for head in model['grid']['heads'] if inside(point,[head['xy'][0]-head['capXY'][0]/2,head['xy'][1]-head['capXY'][1]/2,head['xy'][0]+head['capXY'][0]/2,head['xy'][1]+head['capXY'][1]/2])]
        if len(caps)!=1:return None
        head=caps[0];registry=model.setdefault('verticalGroundCaps',{})
        if head['id'] not in registry:
            source_caps=[(name,a,b,k) for name,a,b,k in frame.members if name.endswith('/finite-cap') and a==head['id']]
            if len(source_caps)>1:raise ValueError('Multiple existing finite uppercap paths would duplicate material')
            if source_caps:
                name,a,b,k=source_caps[0];at=frame.nodes[b];metadata=None
            else:
                at=[*head['xy'],head['capZ'][1]];b=frame.node('VERTICAL-FLOOR/cap-top/'+head['id'],at);name='VERTICAL-FLOOR/finite-upper-cap/'+head['id'];a=head['id'];z=sum(model['grid']['girders']['outer-W']['z'])/2
                start=[*head['xy'],z];frame.member(name,a,b,rectangle_section(*head['capXY']),law,physical_start=start,physical_end=at,y_axis=[0,1,0])
                metadata={'a':a,'b':b,'physicalStartMm':start,'physicalEndMm':at,'breadthMm':head['capXY'][1],'depthMm':head['capXY'][0],'kind':'source-finite-upper-cap-normal-receiver'}
            registry[head['id']]={'node':b,'memberId':name,'metadata':metadata,'sourceCapFootprintXYMm':[head['xy'][0]-head['capXY'][0]/2,head['xy'][1]-head['capXY'][1]/2,head['xy'][0]+head['capXY'][0]/2,head['xy'][1]+head['capXY'][1]/2]}
        cap=registry[head['id']];node=cap['node'];at=frame.nodes[node];dx,dy=point[0]-at[0],point[1]-at[1]
        return {'memberId':cap['memberId'],'terms':[(node,[0,0,1,dy,-dx,0])],'topZMm':head['capZ'][1],'overlapMemberCount':1,'unitWrenchResidualKN_KNmm':max(abs(at[1]+dy-point[1]),abs(-at[0]-dx+point[0])),'routeKind':'actual-source-cap-finite-upper-body/rigid-plane-trace'}
    _,name,row,length,axis,s,offset=min(choices,key=lambda value:(value[0],value[1]));v=max(0,min(1,s/length));radial=cross(axis,[0,0,1])
    e=law['elasticModulusMPa'];g=e/(2*(1+law['poissonRatio']));area=row['widthMm']*row['heightMm'];inertia=row['widthMm']*row['heightMm']**3/12;phi=12*e*law['flexuralFactor']*inertia/(g*law['shearAreaFactor']*area*length**2)
    shapes,_=_timoshenko_shapes(v,length,phi);torsion=axis[0]*offset[1]-axis[1]*offset[0];terms=[]
    for end,node in enumerate((row['a'],row['b'])):
        coefficient=shapes[2*end];moment=shapes[2*end+1];weight=(1-v) if end==0 else v;physical=row['physicalStartMm'] if end==0 else row['physicalEndMm'];master=frame.nodes[node];dx,dy=physical[0]-master[0],physical[1]-master[1]
        rotation=[moment*radial[i]+weight*torsion*axis[i] for i in range(3)];rotation[0]+=coefficient*dy;rotation[1]-=coefficient*dx
        terms.append((node,[0,0,coefficient,*rotation]))
    wrench=[0.]*6
    for node,row0 in terms:
        moment0=cross(frame.nodes[node],row0[:3]);wrench=[a+b for a,b in zip(wrench,[*row0[:3],*[a+b for a,b in zip(moment0,row0[3:])]])]
    expected=[0,0,1,point[1],-point[0],0];error=max(abs(a-b) for a,b in zip(wrench,expected))
    if error>1e-7:raise ValueError('Finite ground member interpolation loses physical point force/first moments')
    return {'memberId':name,'terms':terms,'topZMm':row['topZMm'],'overlapMemberCount':len(choices),'unitWrenchResidualKN_KNmm':error}


def _combine_port_terms(port_terms,coefficients):
    result={}
    for port,coefficient in coefficients:
        for node,row in port_terms[port]:
            target=result.setdefault(node,[0.]*6)
            for i,value in enumerate(row):target[i]+=coefficient*value
    return list(result.items())


def _replace_legacy_floor_cards(model):
    removed=[row for row in model['admittedNativeActions'] if row['category'].startswith('first-floor')];kept=[row for row in model['admittedNativeActions'] if not row['category'].startswith('first-floor')]
    for family in ('external-GMAX','external-Q'):
        model['families'][family]={}
        for key in ('memberEquivalentLoads','memberPointLoads','memberDistributedLoads'):model.setdefault(key,{})[family]={}
    for row in kept:
        family='external-GMAX' if row['programme']=='G' else 'external-Q';x,y=row['receivingXYMm'];dx,dy=row['residualOffsetXYMm'];force=[0,0,-row['valueKN']]
        _beam_point(model,model['families'][family],family,row['wallId'],[x,y,3370],force,moment=cross([dx,dy,0],force))
    model['admittedNativeActions']=kept
    return {'removedPreviouslyAdmittedFloorCards':removed,'previouslyWithheldFloorCardsRemainAbsent':[row for row in model['withheldNativeActions'] if row['category'].startswith('first-floor')],
        'physicalGWasSlabFree':True,'oldFloorAndFinishBudgetsAdded':False,'newFreshUniformLiveIsNetPlateAreaOnly':True}


def build_vertical_rc_floor(case,source,retained_point_receivers=None,pre_plate_model_transform=None,portal_builder=None):
    expected=reference_vertical_rc_floor_case(source)
    if not isinstance(case,dict) or set(case)!=set(expected) or any(case[k]!=expected[k] for k in ('schema','sourceSHA256','geometryPolicy','supportPolicy','use')):raise ValueError('Exact current source-bound verticalfloor case required; no injected result')
    law=case['bearingLaw']
    if not isinstance(law,dict) or set(law)!={'masonryModulusMPa','jointNormalComplianceMmPerMPa'} or any(type(v) not in (int,float) or not math.isfinite(v) or v<=0 for v in law.values()):raise ValueError('Finite authored masonry and normaljoint compliance comparison required; no physical material resistance supplied')
    versions=__import__('vertical_floor_numerics').runtime_versions();pins=dict(line.split('==') for line in (source['root']/'project/str/studies/vertical-floor-requirements.txt').read_text().splitlines() if line)
    if any(versions[key]!=value for key,value in pins.items()):raise ValueError('Pinnedverticalnumericalruntime drift; regenerateevidenceafterexplicitdependencychange')
    if type(case['bearingQuadratureOrder']) is not int or case['bearingQuadratureOrder'] not in (2,4):raise ValueError('Normal contact quadrature order2or4 must be explicit')
    if type(case['maxPitchMm']) not in (int,float) or not 500<=case['maxPitchMm']<=1800:raise ValueError('Bounded500..1800mm vertical mesh pitch required')
    if not isinstance(case['plateLaw'],dict) or case['plateLaw'].get('thicknessMm')!=200:raise ValueError('ActualRC200 source floor required')
    if type(case['freshUniformLiveKPa']) not in (int,float) or not 0<=case['freshUniformLiveKPa']<=5:raise ValueError('Explicit0..5kPa netplate live challenge required')
    if case['monolithicCase']['houseCase']['boundary']['includeExternalGMAXQ'] and case['monolithicCase']['houseCase']['joinedCase']['floor']['componentCase']['edits']['wallOpenings']:raise ValueError('Changedupperwallopenings need regeneratedupperwallGMAXcards; oldfloorcards are separatelyremoved')
    builder=build_monolithic_rc_portals if portal_builder is None else portal_builder
    if not callable(builder):raise ValueError('An internal source-owned portal builder must be callable')
    model=builder(case['monolithicCase'],source['parent'])
    if pre_plate_model_transform is not None:
        if not callable(pre_plate_model_transform):raise ValueError('An internal source-owned pre-plate transform must be callable')
        pre_plate_model_transform(model)
    frame=model['model'];floor_source=source['parent']['house']['joined']['floor'];request=case['monolithicCase']['houseCase']['joinedCase']['floor'];retained=evaluate_retained_components(request['componentCase'],floor_source['retained'])
    bodies=[row['geometry']['bodyRectangleXYMm'] for row in retained['components'] if row['kind']=='first-floor']
    for loop in model['joinedFloor']['floor']['bands']:
        axis,datum,lo,hi,width=loop['axis'],loop['datum'],loop['lo'],loop['hi'],loop['width'];half=width/2
        bodies.append([lo,datum-half,hi,datum+half] if axis==0 else [datum-half,lo,datum+half,hi])
        bodies.extend([[x-half,y-half,x+half,y+half] for x in (lo,hi) for y in (lo,hi)])
    physical_holes=copy.deepcopy(model['joinedFloor']['physicalHoles']);h=floor_source['retained']['values']['project/had/studies/water-replan.json']['model'];x,y,w,d=h['stair'];stair=[x,y,x+w,y+d];old_stair=next(row for row in physical_holes if row['id']=='FLOOR-VOID/stair');old_bounds=old_stair['bounds']
    if old_bounds[1:]!=stair[1:] or old_bounds[0]>stair[0]:raise ValueError('Unrecognised inplane stair interpretation; physicalHATsource cannotbesilentlysubstituted')
    stair_reservation=[old_bounds[0],stair[1],stair[0],stair[3]];old_stair['bounds']=stair
    holes=[row['bounds'] for row in physical_holes];north=[];ports=[];port_terms=[];port_map={};rc_rectangles=[]
    def port(identifier,point,node=None,axis=None):
        key=identifier
        if key in port_map:return port_map[key]
        index=len(ports);port_map[key]=index;ports.append({'id':identifier,'xyMm':list(point),'coordinate':axis})
        if node is None:
            node=frame.node('VERTICAL-FLOOR/normal/'+str(index),[*point,3270])
            for unused in (0,1,3,4,5):frame.fixed[node,unused]=0.
            terms=[(node,[0,0,1,0,0,0])]
        else:
            x,y,z=frame.nodes[node]
            terms=[(node,[0,0,1,point[1]-y,x-point[0],0])] if axis==0 else [(node,[0,0,0,1000. if axis==1 else 0,1000. if axis==2 else 0,0])]
        port_terms.append(terms);return index
    corners=[]
    for corner in model['joinedFloor']['corners']:
        point=corner['originXYMm'];indices=[port('CORNER/'+corner['id']+'/'+str(a),point,corner['node'],a) for a in range(3)];corners.append((corner,indices));rc_rectangles.extend(corner['rectangles'])
    for wall,row in model['wallFrames'].items():
        stations=[]
        for node in row['beamNodes']:
            point=list(frame.nodes[node][:2]);indices=[port('NORTH/'+node+'/'+str(a),point,node,a) for a in range(3)];stations.append({'x':point[0],'indices':indices,'node':node})
        y=frame.nodes[row['beamNodes'][0]][1];width=model['widthEdit']['northUpstandWidthMm'];lo=row['west']['pier']['footprintXYMm'][0];hi=row['east']['pier']['footprintXYMm'][2];rectangle=[lo,y-width/2,hi,y+width/2];holes.append(rectangle)
        north.append({'wallId':wall,'rectangle':rectangle,'stations':stations,'frame':row})
        rc_rectangles.extend(model['widthEdit']['footprints'][i]['authoredCoreFootprintXYMm'] for i in range(len(model['widthEdit']['footprints'])) if model['widthEdit']['footprints'][i]['pierId'].split('/')[-2]==wall)
    cores=clear_ground_core_rectangles(source);members=grid_member_geometry(model);ground_rectangles=[]
    for row in members.values():
        a,b=row['physicalStartMm'],row['physicalEndMm'];half=row['widthMm']/2
        ground_rectangles.append([min(a[0],b[0]),a[1]-half,max(a[0],b[0]),a[1]+half] if a[0]!=b[0] else [a[0]-half,min(a[1],b[1]),a[0]+half,max(a[1],b[1])])
    cap_rectangles=[[head['xy'][0]-head['capXY'][0]/2,head['xy'][1]-head['capXY'][1]/2,head['xy'][0]+head['capXY'][0]/2,head['xy'][1]+head['capXY'][1]/2] for head in model['grid']['heads']]
    extra=[[],[]]
    for rectangle in [*rc_rectangles,*[r['rectangle'] for r in north]]:
        for axis in (0,1):extra[axis].extend(rectangle[axis::2])
    for receiver in north:extra[0].extend(row['x'] for row in receiver['stations'])
    receiver_points={};receiver_ids=set()
    if retained_point_receivers is not None:
        if not isinstance(retained_point_receivers,list) or len(retained_point_receivers)>64:raise ValueError('Explicit bounded retained vertical receiver list required')
        for receiver in retained_point_receivers:
            if not isinstance(receiver,dict) or set(receiver)!={'id','xyMm'} or not isinstance(receiver['id'],str) or not re.fullmatch(r'[A-Za-z][A-Za-z0-9._:/,-]*',receiver['id']):raise ValueError('Stable retained point ID and explicit XY millimetres required')
            point=receiver['xyMm']
            if not isinstance(point,(list,tuple)) or len(point)!=2 or any(type(v) not in (int,float) or not math.isfinite(v) for v in point):raise ValueError('Finite retained receiver XY millimetres required')
            point=tuple(point)
            if point in receiver_points or receiver['id'] in receiver_ids:raise ValueError('Duplicate retained physical receiver point or ID')
            on_north=any(inside(point,row['rectangle'],1e-7) for row in north)
            if not on_north and (not any(inside(point,r,1e-7) for r in bodies) or any(inside(point,r,-1e-7) for r in holes)):raise ValueError('Retained receiver has no actual plate or north-upstand body: '+receiver['id'])
            receiver_points[point]=receiver['id'];receiver_ids.add(receiver['id'])
            for axis in (0,1):extra[axis].append(point[axis])
    cells,columns=plate_cells(bodies,holes,case['maxPitchMm'],extra);contacts=[];contact_points=set()
    for cell_index,rectangle in enumerate(cells):
        pieces=[(core,intersect(rectangle,core['rectangleXYMm'])) for core in cores];pieces=[(core,r) for core,r in pieces if r]
        if not pieces:continue
        local=[sorted({rectangle[axis],rectangle[axis+2],*[x for _,r in pieces for x in r[axis::2]],*[x for r in rc_rectangles+ground_rectangles+cap_rectangles if intersect(rectangle,r) for x in r[axis::2] if rectangle[axis]<x<rectangle[axis+2]]}) for axis in (0,1)]
        for x0,x1 in zip(local[0],local[0][1:]):
            for y0,y1 in zip(local[1],local[1][1:]):
                point=((x0+x1)/2,(y0+y1)/2)
                if any(inside(point,r) for r in rc_rectangles):continue
                owners=[core for core,r in pieces if inside(point,r)]
                if owners:
                    contacts.append({'cellIndex':cell_index,'rectangleXYMm':[x0,y0,x1,y1],'owner':sorted(owners,key=lambda row:row['id'])[0]})
                    a,b,c,d=rectangle;contact_points.update(((a,b),(c,b),(c,d),(a,d)))
    def boundary(point,axis):
        x,y=point
        for receiver in north:
            if not inside(point,receiver['rectangle'],1e-7):continue
            stations=receiver['stations'];dy=y-frame.nodes[stations[0]['node']][1]
            if x<=stations[0]['x'] or x>=stations[-1]['x']:
                station=stations[0] if x<=stations[0]['x'] else stations[-1];w,rx,ry=station['indices'];dx=x-station['x'];return [(w,1),(rx,dy/1000),(ry,-dx/1000)] if axis==0 else [(rx if axis==1 else ry,.001)]
            i=next(i for i,(a,b) in enumerate(zip(stations,stations[1:])) if a['x']<=x<=b['x']);a,b=stations[i:i+2];length=b['x']-a['x'];v=(x-a['x'])/length
            member=next(m for m in model['members'].values() if m['kind']=='upstand' and m['a']==a['node'] and m['b']==b['node']);material=model['request']['frameLaw'];e=material['elasticModulusMPa'];g=e/(2*(1+material['poissonRatio']));area=member['breadthMm']*member['depthMm'];iy=member['breadthMm']*member['depthMm']**3/12;phi=12*e*material['flexuralFactor']*iy/(g*material['shearAreaFactor']*area*length**2)
            n,r=_timoshenko_shapes(v,length,phi);wa,rxa,rya=a['indices'];wb,rxb,ryb=b['indices']
            return [(wa,n[0]),(rya,-n[1]/1000),(wb,n[2]),(ryb,-n[3]/1000),(rxa,dy*(1-v)/1000),(rxb,dy*v/1000)] if axis==0 else [(rxa,(1-v)/1000),(rxb,v/1000)] if axis==1 else [(wa,-r[0]),(rya,r[1]/1000),(wb,-r[2]),(ryb,r[3]/1000)]
        for receiver in north:
            for side,index in (('west',0),('east',-1)):
                footprint=next(row['authoredCoreFootprintXYMm'] for row in model['widthEdit']['footprints'] if row['pierId'].endswith('/'+receiver['wallId']+'/'+side))
                if inside(point,footprint,1e-7):
                    station=receiver['stations'][index];w,rx,ry=station['indices'];cx,cy=frame.nodes[station['node']][:2]
                    return [(w,1),(rx,(y-cy)/1000),(ry,-(x-cx)/1000)] if axis==0 else [(rx if axis==1 else ry,.001)]
        for corner,indices in corners:
            if any(inside(point,r,1e-7) for r in corner['rectangles']):
                w,rx,ry=indices;cx,cy=corner['originXYMm'];return [(w,1),(rx,(y-cy)/1000),(ry,-(x-cx)/1000)] if axis==0 else [(rx if axis==1 else ry,.001)]
        if axis==0 and point in contact_points:return [(port(normal_point_port_id(point),point),1)]
        if axis==0 and point in receiver_points:return [(port('POINT/'+receiver_points[point],point,axis=0),1)]
        return None
    physical_mesh_points={p for a,b,c,d in cells for p in ((a,b),(c,b),(c,d),(a,d))}
    physical_boundary_traces={}
    for point in sorted(physical_mesh_points):
        for axis in range(3):
            coefficients=boundary(point,axis)
            if axis==0:physical_boundary_traces[point]=coefficients
    receiver_coefficients=retained_physical_receiver_coefficients(receiver_points,physical_boundary_traces,boundary,lambda:len(ports))
    frozen_port_count=len(ports)
    assembled=assemble_vertical_plate(cells,case['plateLaw'],boundary,frozen_port_count);rigid=[]
    if len(ports)!=frozen_port_count:raise ValueError('Physical plate assembly created an unregistered boundary port')
    retained_receiver_traces={}
    for point,identifier in receiver_points.items():
        coefficients=receiver_coefficients[identifier]
        retained_receiver_traces[identifier]={'id':identifier,'xyMm':list(point),'units':'mm',
            'terms':_combine_port_terms(port_terms,coefficients),
            'route':'actual-north-upstand-work-trace' if any(inside(point,r['rectangle'],1e-7) for r in north) else 'actual-plate-retained-vertical-coordinate',
            'rotationRestraintAdded':False}
    for kind in range(3):
        vector=[]
        for row in ports:
            x,y=row['xyMm'];axis=row['coordinate'];vector.append((1 if kind==0 else .001*y if kind==1 else -.001*x) if axis in (None,0) else (1 if axis==kind else 0))
        rigid.append(vector)
    binding_error=0.
    for kind,vector in enumerate(rigid):
        rotation=[0.,.001 if kind==1 else 0.,.001 if kind==2 else 0.]
        omega=[rotation[1],rotation[2],0.]
        for index,terms in enumerate(port_terms):
            value=0.
            for node,row in terms:
                xyz=frame.nodes[node];translation=[0.,0.,1.] if kind==0 else cross(omega,xyz);u=[*translation,*omega]
                value+=sum(a*b for a,b in zip(row,u))
            binding_error=max(binding_error,abs(value-vector[index]))
    if binding_error>1e-9:raise ValueError('Verticalfloor port/frame rigid virtualwork units mismatch')
    operator=condense_vertical_plate(assembled,rigid)
    for point,identifier in receiver_points.items():
        retained_receiver_traces[identifier]['physicalPlateParticipation']=retained_receiver_operator_participation(point,receiver_coefficients[identifier],assembled,operator)
    for index,mode in enumerate(operator['energyModes']):frame.springs.append({'id':'VERTICAL-FLOOR/energy/'+str(index),'terms':_combine_port_terms(port_terms,enumerate(mode)),'stiffness':1.,'mode':'bilateral','gap':0.})
    ledger=_replace_legacy_floor_cards(model);old_weight=-sum(row[2] for row in model['families']['physical-G'].values());old_wrench=_family_wrench(model,model['families']['physical-G'])
    for index,value in enumerate(operator['condensedSelfG']):
        for node,row in port_terms[index]:
            target=model['families']['physical-G'].setdefault(node,[0.]*6)
            for axis,coefficient in enumerate(row):target[axis]+=value*coefficient
    fibres=[];missing=[];quadrature=[(-1/math.sqrt(3),1.),(1/math.sqrt(3),1.)] if case['bearingQuadratureOrder']==2 else [(-.8611363115940526,.3478548451374538),(-.3399810435848563,.6521451548625461),(.3399810435848563,.6521451548625461),(.8611363115940526,.3478548451374538)]
    for contact in contacts:
        rect=contact['rectangleXYMm'];cell=cells[contact['cellIndex']];x0,y0,x1,y1=cell;owner=contact['owner'];area=(rect[2]-rect[0])*(rect[3]-rect[1])/4
        for xi,wx in quadrature:
            for eta,wy in quadrature:
                point=[(rect[0]+rect[2])/2+xi*(rect[2]-rect[0])/2,(rect[1]+rect[3])/2+eta*(rect[3]-rect[1])/2];ground=grid_vertical_point_terms(model,members,point);weight_area=area*wx*wy
                if ground is None:missing.append({'xyMm':point,'areaMm2':weight_area,'ownerId':owner['id'],'contactSubrectangleXYMm':rect});continue
                n,_,_=rectangle_shapes(2*(point[0]-x0)/(x1-x0)-1,2*(point[1]-y0)/(y1-y0)-1,x1-x0,y1-y0);coefficients=[]
                for p,value in zip(((x0,y0),(x1,y0),(x1,y1),(x0,y1)),n):coefficients.extend((i,value*c) for i,c in assembled['pointTerms'][p,0])
                upper=_combine_port_terms(port_terms,coefficients);terms={node:list(row) for node,row in upper}
                for node,row in ground['terms']:
                    target=terms.setdefault(node,[0.]*6)
                    for axis,value in enumerate(row):target[axis]-=value
                height=3170-ground['topZMm'];e=model['request']['frameLaw']['elasticModulusMPa'] if owner['materialKind']=='source-RC-column' else law['masonryModulusMPa'];stiffness=weight_area/(height/e+law['jointNormalComplianceMmPerMPa'])/1000
                name='VERTICAL-FLOOR/bearing/'+str(len(fibres));frame.springs.append({'id':name,'terms':list(terms.items()),'stiffness':stiffness,'mode':'compression','gap':0.})
                fibres.append({'id':name,'xyMm':point,'areaMm2':weight_area,'ownerId':owner['id'],'sourceWallId':owner['sourceWallId'],'gridMemberId':ground['memberId'],'overlapMemberCount':ground['overlapMemberCount'],'heightMm':height,'stiffnessKNPerMm':stiffness,'unitWrenchResidualKN_KNmm':ground['unitWrenchResidualKN_KNmm']})
    new_weight=-sum(row[2] for row in model['families']['physical-G'].values());new_wrench=_family_wrench(model,model['families']['physical-G']);weight=assembled['physicalSelfGKN'];cx,cy=assembled['centroidXYMm'];expected=[0,0,-weight,-weight*cy/1000,weight*cx/1000,0]
    gravity_residual=[b-a-c for a,b,c in zip(old_wrench,new_wrench,expected)]
    if max(abs(v) for v in gravity_residual)>1e-5:raise ValueError('Verticalfloorcondensation loses actualgravity force or first moments: '+str(gravity_residual))
    if abs(new_weight-old_weight-assembled['physicalSelfGKN'])>1e-6:raise ValueError('NewphysicalfloorG is duplicated or lost during condensation')
    model['verticalFloor']={'request':case,'operator':operator,'ports':ports,'portTerms':port_terms,'fibres':fibres,'missingGroundContactFibres':missing,'cores':cores,'cells':cells,'holes':holes,'inPlaneStairCreditReservationXYMm':stair_reservation,'principalWetReservation':next(row['bounds'] for row in physical_holes if row['id']=='FLOOR-UNKNOWN/principal-wet-territory'),'openingInventory':[{'id':row['id'],'sourceServiceShape':({'kind':'rectangle','boundsXYMm':stair} if row['id']=='FLOOR-VOID/stair' else row['shape']),'structuralOpeningEnvelopeXYMm':next(item['bounds'] for item in physical_holes if item['id']==row['id']),'policy':'explicitformedrectangularstructuralopeningcomparison' if row['shape']['kind']=='circle' else 'actualsourceaperture'} for row in retained['floorApertures']],
        'northUpstandStrips':[{'wallId':receiver['wallId'],'rectangleXYMm':receiver['rectangle'],'centroidZMm':frame.nodes[receiver['stations'][0]['node']][2],'depthMm':model['members'][next(name for name,m in model['members'].items() if m['kind']=='upstand' and name.startswith(receiver['wallId']+'/'))]['depthMm']} for receiver in north],'legacyReplacement':ledger,
        'retainedPointReceivers':retained_receiver_traces,
        'portFrameRigidWorkResidual':binding_error,'mass':{'sourceRCAndInfillBeforeSlabKN':old_weight,'newPlatePhysicalSelfGKN':assembled['physicalSelfGKN'],'joinedPhysicalGKN':new_weight,'newPlateAreaM2':assembled['areaM2'],'newPlateCentroidXYMm':assembled['centroidXYMm'],'floorSlabThicknessMm':200,'northUpstandOwnsRemovedStripMaterial':True,'authoredSlabLevelBandsUnionIncluded':True,'sourceSelfGCondensationResidualKN_KNm':gravity_residual}}
    return model



def fresh_net_floor_live_load(model):
    """Independent factored Q on this same actual plate, never a grossG flag.

    Uniform Q reuses the exact linear plate load operator. The ratio is against
    its actual assembled selfG pressure; characteristic Q is not physical mass.
    """
    data=model['verticalFloor'];q=data['request']['freshUniformLiveKPa'];assembled=data['operator']['assembled']
    if type(q) not in (int,float) or not math.isfinite(q) or not 0<=q<=5:raise ValueError('Finite independent net floor live pressure0..5kPa required')
    area=assembled['areaM2'];self_g=assembled['physicalSelfGKN'];factor=1.5
    if not math.isfinite(area) or area<=0 or not math.isfinite(self_g) or self_g<=0:raise ValueError('Actual positive net plate area/selfG load operator required for independentQ')
    ratio=factor*q*area/self_g;loads={}
    if q:
        if len(data['operator']['condensedSelfG'])!=len(data['portTerms']):raise ValueError('Actual plate Q port map is incomplete')
        for index,value in enumerate(data['operator']['condensedSelfG']):
            for node,row in data['portTerms'][index]:
                target=loads.setdefault(node,[0.]*6)
                for axis,coefficient in enumerate(row):target[axis]+=ratio*value*coefficient
    applied=factor*q*area;cx,cy=assembled['centroidXYMm'];expected=[0.,0.,-applied,-applied*cy/1000,applied*cx/1000,0.]
    actual=_family_wrench(model,loads);residual=[a-b for a,b in zip(actual,expected)]
    if max(abs(value) for value in residual)>1e-6:raise ValueError('Independent net floor Q loses physical force or source first moments')
    return {'loads':loads,'pressureRatioToSelfG':ratio,'evidence':{
        'schema':'str-independent-net-floor-live-load/1','characteristicPressureKPa':q,'combinationFactor':factor,
        'factoredPressureKPa':factor*q,'actualNetPlateAreaM2':area,'plateCentroidXYMm':[cx,cy],
        'characteristicQKN':q*area,'appliedQKN':applied,'appliedWrenchKN_KNm':actual,
        'sourceForceAndFirstMomentResidualKN_KNm':residual,'legacyGrossGFlagRequired':False,
        'addedPhysicalMassKN':0.,'candidateAccepted':False,
        'scope':'Uniform characteristic live pressure on the actual known net plate only, with the existing explicit1.5Q comparison factor. Withheld wet territory and unknown openings remain absent. Q is separate from physicalG and gross upper-wall/legacy floor budgets.'}}


def solve_vertical_rc_floor(model,source,name,additional_nodal_loads=None,result_observer=None):
    data=model['verticalFloor'];frame=model['model'];original=frame.solve;captured={};live_load=fresh_net_floor_live_load(model)
    if additional_nodal_loads is not None:
        if not isinstance(additional_nodal_loads,dict) or any(node not in frame.nodes or not isinstance(row,(list,tuple)) or len(row)!=6 or any(type(v) not in (int,float) or not math.isfinite(v) for v in row) for node,row in additional_nodal_loads.items()):raise ValueError('Finite source-derived additional nodal KN/KNmm loads at actual nodes required')
    if result_observer is not None and not callable(result_observer):raise ValueError('An internal frame result observer must be callable')
    def record():
        for node,wrench in (additional_nodal_loads or {}).items():frame.load(node,wrench)
        for node,wrench in live_load['loads'].items():frame.load(node,wrench)
        result=solve_vertical_frame(frame,data);captured['raw']=result;return result
    try:
        frame.solve=record;native=solve_monolithic_rc_portals(model,source['parent'],name)
    finally:frame.solve=original
    native['parentMonolithicControlSourceSHA256']=source['parent']['identities'];native['sourceSHA256']=source['identities'];native['request']=data['request'];native['verticalGravityMethod']='str-vertical-rc-floor-case/1'
    raw=captured['raw']
    if result_observer is not None:result_observer(raw)
    gauge=max((abs(value) for name,row in raw['supportWrenches'].items() if name.startswith('VERTICAL-FLOOR/normal/') for value in row),default=0.)
    if gauge>1e-9:raise ValueError('Unusednormal-coordinategauges are carrying fictitiousphysicalreaction')
    u=[]
    for terms in data['portTerms']:u.append(sum(value*raw['displacements'][node][axis] for node,row in terms for axis,value in enumerate(row)))
    factor=model['houseLoadCase']['boundary']['physicalGFactor'];load_factor=factor+live_load['pressureRatioToSelfG']
    recovery_operator={**data['operator'],'assembled':{**data['operator']['assembled'],'force':{i:load_factor*v for i,v in data['operator']['assembled']['force'].items()}}}
    recovered=recover_vertical_plate(recovery_operator,u);springs={row['id']:row for row in raw['springs']};bearings=[]
    for fibre in data['fibres']:
        row=springs[fibre['id']];bearings.append({**fibre,'active':row['active'],'relativeClosureMm':-row['relativeMm'],'normalCompressionKN':-row['forceKN'],'normalPressureMPa':-row['forceKN']*1000/fibre['areaMm2']})
    return {'schema':'str-vertical-rc-floor-result/1','sourceSHA256':source['identities'],'request':data['request'],'native':native,'mass':data['mass'],'legacyReplacement':data['legacyReplacement'],
        'headPositions':[{'id':row['id'],'xyMm':row['xy']} for row in model['grid']['heads']],
        'floorLiveLoad':live_load['evidence'],
        'numericalRuntime':__import__('vertical_floor_numerics').runtime_versions(),'auxiliaryGaugeMaximumReactionKN_KNmm':gauge,'portFrameRigidWorkResidual':data['portFrameRigidWorkResidual'],
        'plate':{'cellCount':len(data['cells']),'pointCount':len(data['operator']['assembled']['points']),'retainedCoordinateCount':len(data['ports']),
            'rigidModeResidualKN':data['operator']['rigidModeResidualKN'],'modeReconstructionRelativeError':data['operator']['modeReconstructionRelativeError'],'assemblySymmetryRelativeError':data['operator']['assembled']['assemblySymmetryRelativeError'],
            'physicalRecovery':recovered,'cellsXYMm':data['cells'],'holesXYMm':data['holes']},
        'inPlaneStairCreditReservationXYMm':data['inPlaneStairCreditReservationXYMm'],'principalWetReservationXYMm':data['principalWetReservation'],
        'normalCoreGeometry':data['cores'],'northUpstandStrips':data['northUpstandStrips'],'openingInventory':data['openingInventory'],
        'bearings':bearings,'missingGroundContactFibres':data['missingGroundContactFibres'],'missingGroundContactAreaMm2':sum(row['areaMm2'] for row in data['missingGroundContactFibres']),
        'additionalGroundCapCuts':_physical_cut_rows(model,raw,{row['memberId']:row['metadata'] for row in model.get('verticalGroundCaps',{}).values() if row['metadata'] is not None}),
        'unresolvedReceivingPorts':native_intermediate_support_ports(source['parent']['house']['joined']['floor']),'unresolvedReceivingPortCount':28,'completeReceivingPaths':0,
        'groundCapNormalReceivingPaths':[{key:value for key,value in row.items() if key!='metadata'} for row in model.get('verticalGroundCaps',{}).values()],
        'candidateAccepted':False,'floorGravityAccepted':False,'masonryConstitutiveLawAccepted':False,'completeHouseProof':False,'roofAdoption':False,'waterControlAccepted':False,'thermalAccepted':False,'installedAcceptance':False,
        'diagnostics':['Actualnetknown-domainRC200plateG addedonce; oldsourcefloor/finishGMAXandalladmittedfloorQremovedbeforefreshnetareaQ. No grossfilledopeninggravity or oldfixedbasereaction is added.',
            'Sourceprincipalwetapertureinventory remainsincomplete; its territory is withheld, not silentlyfilled or certifieda realhole. Roundservicebounds are explicitrectangularstructuralopening comparisons, notexactcirclegeometry.',
            'Ordinaryactualclearcores usefiniteaxialnormalfibres only, withauthoredmasonry/jointcompliance and unilateralcompression. No masonrylateral/tensile/bendingcapacity or installedslate/DPCproperties is credited. Adjacentarch/headwallownG remainsseparate.',
            'Auxiliarynormalnodes haveonlyone physicalscalarcoordinate. Otherfivecoordinates areunusedgaugeswithzero springs/loads, not physicalfloorclamps. Plate rotations outsideactualRCpatches remainfree.',
            'Eachlowerfibre usesactualfinitegroundbeam Timoshenkoworkinterpolation within itsphysicalwidth, includingoffaxis torsion andactualmasteroffset. Overlappinggroundgrillagematerial selects the containedmembernearest itsownaxis, never a nearesthead; intersectionlocal3Dtransfer is unqualified.',
            'Actualsourcecaps canreceive throughfiniteuppercapbodycomparisons when no beamfootprintowns thepoint; existingnorthcapmembers are reused. Lowercaprigidtransfer andlocal3Dcap/gridunion remainunqualified. Groundcapmass remains outside this floor-onlyGaddition. Footprintswithoutamodelledbeam/caproute receive noinventedrestraint. Missingnormalroutes, sourceground0, inheritedlowercap/soil, fourLties/keys, capcages, roof andsiteacceptance remainexplicit.']}


def run_vertical_rc_floor(case,source,name):
    from vertical_floor_views import draw_vertical_floor
    result=solve_vertical_rc_floor(build_vertical_rc_floor(case,source),source,name)
    result['drawings']={'vertical-floor.svg':draw_vertical_floor(result)}
    return result


if __name__=='__main__':
    source=load_vertical_rc_floor_source(Path(__file__).resolve().parents[3])
    if sys.argv[1:]==['--read']:print(json.dumps(reference_vertical_rc_floor_case(source),allow_nan=False))
    else:
        value=json.load(sys.stdin)
        if set(value)!={'case','name'}:raise ValueError('Exactcase/name request required')
        print(json.dumps(run_vertical_rc_floor(value['case'],source,value['name']),allow_nan=False))
