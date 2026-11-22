"""Source clear masonry bodies: independent ownG and unilateral floor contact.

A wall's selfweight is not a floor load. Explicit serial scalar body/top-contact
coordinates let its free top shorten while its own weight reaches the real base.
"""
import hashlib
import json
import math
from pathlib import Path

from foundation_solid_weight import disjoint_solid_union, subtract_box

METHOD='project/str/studies/lower_core_bodies.py'


def _settings(setting):
    if not isinstance(setting,dict) or set(setting)!={'masonryUnitWeightKNPerM3'}:raise ValueError('Exact authored lower masonry density required; no source/approval injection')
    value=setting['masonryUnitWeightKNPerM3']
    if type(value) not in (int,float) or not math.isfinite(value) or not 0<=value<=30:raise ValueError('Explicit lower masonry density0..30kN/m3 required; zero is a mechanical control')


def serial_body_law(area_mm2,height_mm,modulus_mpa,joint_compliance_mm_per_mpa,weight_kn):
    values=(area_mm2,height_mm,modulus_mpa,joint_compliance_mm_per_mpa)
    if any(type(value) not in (int,float) or not math.isfinite(value) or value<=0 for value in values) or type(weight_kn) not in (int,float) or not math.isfinite(weight_kn) or weight_kn<0:raise ValueError('Positive finite body/contact geometry and nonnegativeG required')
    kb=area_mm2*modulus_mpa/height_mm/1000;kc=area_mm2/joint_compliance_mm_per_mpa/1000
    return {'bodyAxialStiffnessKNPerMm':kb,'topContactStiffnessKNPerMm':kc,'seriesCombinedStiffnessKNPerMm':1/(1/kb+1/kc),
            'consistentUniformBodyGTopKN':weight_kn/2,'consistentUniformBodyGBaseKN':weight_kn/2,
            'freeTopSelfShorteningMm':weight_kn/(2*kb),'bodyPhysicalGKN':weight_kn}


def _inside(point,box,tol=1e-8):return box[0]-tol<=point[0]<=box[3]+tol and box[1]-tol<=point[1]<=box[4]+tol


def _area(box):return (box[3]-box[0])*(box[4]-box[1])


def _add(family,node,row,factor=1):
    target=family.setdefault(node,[0.]*6)
    for axis,value in enumerate(row):target[axis]+=factor*value


def _subtract_all(boxes,removed):
    result=boxes
    for other in removed:
        result=[{**row,'boxXYZMm':piece} for row in result for piece in subtract_box(row['boxXYZMm'],other)]
    return result



def ground_receiver_footprints(model,members):
    """Physical planar receiver catalogue; no tolerance creates support area."""
    rows=[]
    for name,member in members.items():
        a,b=member['physicalStartMm'],member['physicalEndMm'];half=member['widthMm']/2
        if (a[0]==b[0])==(a[1]==b[1]):raise ValueError('Only finite axis-aligned ground receiver footprints supported')
        bounds=[min(a[0],b[0]),a[1]-half,max(a[0],b[0]),a[1]+half] if a[0]!=b[0] else [a[0]-half,min(a[1],b[1]),a[0]+half,max(a[1],b[1])]
        rows.append({'id':name,'kind':'beam','boundsXYMm':bounds})
    for head in model['grid']['heads']:
        x,y=head['xy'];w,h=head['capXY'];rows.append({'id':head['id'],'kind':'cap','boundsXYMm':[x-w/2,y-h/2,x+w/2,y+h/2]})
    if model.get('courtCornerClosure'):
        closure=model['courtCornerClosure'];b=closure['addedSolid']['boxXYZMm']
        rows.append({'id':closure['addedSolid']['id'],'kind':'closure','boundsXYMm':[b[0],b[1],b[3],b[4]]})
    return rows


def partition_free_body_receivers(fragments,receivers):
    """Exact rectangular coverage arrangement before any load quadrature.

    Every physical footprint edge is a cut. Full-cell containment therefore
    decides coverage, including arbitrarily thin unsupported strips. Overlap
    branch selection is a separate explicit finite-frame idealisation.
    """
    for receiver in receivers:
        r=receiver['boundsXYMm']
        if receiver['kind'] not in ('beam','cap','closure') or len(r)!=4 or any(type(v) not in (int,float) or not math.isfinite(v) for v in r) or r[2]<=r[0] or r[3]<=r[1]:raise ValueError('Exact positive finite ground receiver footprint required')
    cuts=[sorted({value for row in receivers for value in row['boundsXYMm'][axis::2]}) for axis in (0,1)];result=[]
    for fragment in fragments:
        box=fragment['boxXYZMm'];xx=[box[0],*[v for v in cuts[0] if box[0]<v<box[3]],box[3]];yy=[box[1],*[v for v in cuts[1] if box[1]<v<box[4]],box[4]]
        for x0,x1 in zip(xx,xx[1:]):
            for y0,y1 in zip(yy,yy[1:]):
                contained=[row for row in receivers if row['boundsXYMm'][0]<=x0 and row['boundsXYMm'][1]<=y0 and row['boundsXYMm'][2]>=x1 and row['boundsXYMm'][3]>=y1]
                ids={kind:[row['id'] for row in contained if row['kind']==kind] for kind in ('beam','cap','closure')}
                # Multiple overlapping caps without a physical beam are not a
                # source-qualified receiver; the original route also rejects.
                supported=bool(ids['beam'] or len(ids['cap'])==1 or ids['closure'])
                result.append({'boxXYZMm':[x0,y0,box[2],x1,y1,box[5]],'receiverIds':ids,'supported':supported})
    return result


def lower_core_inventory(model,source,setting):
    _settings(setting);root=Path(source['root']);h=json.loads((root/'project/had/studies/water-replan.json').read_text())['model'];top=h['sections']['firstFloorRC']['bottom'];bottom=h['sections']['groundSupport']['top'];height=top-bottom
    if height<=0:raise ValueError('Actual lower clearcore height is unavailable')
    cores=model['verticalFloor']['cores'];ordinary=[row for row in cores if row['materialKind']=='source-core-material-unqualified'];excluded_rc=[]
    for corner in model['joinedFloor']['corners']:excluded_rc.extend(corner['rectangles'])
    excluded_rc.extend(row['authoredCoreFootprintXYMm'] for row in model['widthEdit']['footprints'])
    # The separate A abutment projects inward beyond the source ordinary loggia
    # core. Its new tapered territory contains no ordinary-core material here;
    # the old physical post rectangle removes the full actual intersection.
    if model.get('masonryFrameA'):
        g=model['masonryFrameA'].get('geometry',{})
        if g and 'westPolygonXZMm' in g:
            polygon=g['westPolygonXZMm'];old_west=min(row['authoredCoreFootprintXYMm'][2] for row in model['widthEdit']['footprints'] if '/west' in row['pierId'])
            ordinary_loggia=[row for row in ordinary if row['sourceWallId']=='loggia-west-weather']
            if ordinary_loggia and max(row['rectangleXYMm'][2] for row in ordinary_loggia)>old_west+1e-8:raise ValueError('Changed A taper overlaps ordinary core outside old post; exact3D union required')
    solids=[{'id':row['id'],'kind':'ordinary-clear-masonry','boxXYZMm':[row['rectangleXYMm'][0],row['rectangleXYMm'][1],bottom,row['rectangleXYMm'][2],row['rectangleXYMm'][3],top]} for row in sorted(ordinary,key=lambda r:r['id'])]
    union=disjoint_solid_union(solids);bodies=_subtract_all(union,[[r[0],r[1],bottom,r[2],r[3],top] for r in excluded_rc]);volume=math.fsum(_area(row['boxXYZMm'])*height/1e9 for row in bodies)
    free=_subtract_all(bodies,[[r[0],r[1],bottom,r[2],r[3],top] for r in model['verticalFloor']['cells']])
    return {'sourceBodyBoxes':bodies,'freeTopBodyBoxes':free,'bodyHeightMm':height,'bodyTopZMm':top,'bodyBottomZMm':bottom,'netClearCoreVolumeM3':volume,
            'netClearCoreAreaMm2':volume*1e9/height,'freeTopAreaMm2':math.fsum(_area(row['boxXYZMm']) for row in free),
            'physicalGKN':volume*setting['masonryUnitWeightKNPerM3'],'excludedRCStiffnessPathRectanglesXYMm':excluded_rc,
            'excludedSourceRCColumnIds':[row['id'] for row in cores if row['materialKind']=='source-RC-column'],
            'sourceOrdinaryCoreIds':[row['id'] for row in ordinary]}


def add_lower_core_bodies(model,source,setting):
    # Only the floor-section wet-support builder installs this ledger and owns
    # the helper dependency. Non-wet predecessor paths neither import nor call it.
    capture_grid_origins='wetGridOrigins' in model
    if capture_grid_origins:
        from grid_origin_recovery import record_grid_gravity,record_grid_uniform_gravity,finish_grid_gravity_adapter
    from rc_floor_house_loads import _family_wrench
    from vertical_rc_floor import grid_member_geometry, grid_vertical_point_terms
    if setting is None:return None
    _settings(setting)
    if 'lowerCoreBodies' in model:raise ValueError('Lower clearcore bodies already added; duplicate weight rejected')
    if any(row['category'].startswith('ground core') for row in model['admittedNativeActions']):raise ValueError('Old groundcore budget is already admitted; remove source load before adding actual bodies')
    inventory=lower_core_inventory(model,source,setting);frame=model['model'];data=model['verticalFloor'];law=data['request']['bearingLaw'];density=setting['masonryUnitWeightKNPerM3'];height=inventory['bodyHeightMm'];owners={row['id']:row for row in data['cores']};spring_by_id={row['id']:row for row in frame.springs}
    initial=_family_wrench(model,model['families']['physical-G']);added={};rows=[];contact_area=0.;missing_area=0.;unsupported=[]
    base_gravity_sources=[];free_gravity_sources=[]
    def eligible(fibre):return owners[fibre['ownerId']]['materialKind']=='source-core-material-unqualified'
    for fibre in data['fibres']:
        if not eligible(fibre):continue
        point=fibre['xyMm']
        if not any(_inside(point,row['boxXYZMm']) for row in inventory['sourceBodyBoxes']):raise ValueError('Normal fibre intersects RC stiffness paths or unknown core; reconcile body/contact inventory')
        old=spring_by_id[fibre['id']]
        if old['mode']!='compression' or old['gap']!=0:raise ValueError('Only source zero-gap compression-only top contact supported')
        upper,lower=[],[]
        for node,vector in old['terms']:
            z=frame.nodes[node][2]
            if z>=inventory['bodyTopZMm']:upper.append((node,list(vector)))
            elif z<=inventory['bodyBottomZMm']:lower.append((node,list(vector)))
            else:raise ValueError('Ambiguous normal-contact source layer; no nearest-node split')
        if not upper or not lower:raise ValueError('Actual upperplate/lowergrid terms are unavailable')
        weight=fibre['areaMm2']*height/1e9*density;body=serial_body_law(fibre['areaMm2'],height,law['masonryModulusMPa'],law['jointNormalComplianceMmPerMPa'],weight)
        if abs(body['seriesCombinedStiffnessKNPerMm']-old['stiffness'])>1e-9*max(1,old['stiffness']):raise ValueError('Serial body differs from inherited combined physical spring')
        node=frame.node('LOWER-CORE/body-top/'+str(len(rows)),[*point,inventory['bodyTopZMm']])
        for axis in (0,1,3,4,5):frame.fixed[node,axis]=0.
        if not hasattr(frame,'internalScalarCoordinateScales'):frame.internalScalarCoordinateScales={}
        frame.internalScalarCoordinateScales[node]=1/math.sqrt(body['bodyAxialStiffnessKNPerMm']+body['topContactStiffnessKNPerMm'])
        old['terms']=upper+[(node,[0,0,-1,0,0,0])];old['stiffness']=body['topContactStiffnessKNPerMm']
        frame.springs.append({'id':'LOWER-CORE/axial/'+str(len(rows)),'terms':[(node,[0,0,1,0,0,0]),*lower],'stiffness':body['bodyAxialStiffnessKNPerMm'],'mode':'bilateral','gap':0.})
        _add(added,node,[0,0,-weight/2,0,0,0])
        for lower_node,vector in lower:_add(added,lower_node,vector,weight/2)
        ground_terms=[(lower_node,[-v for v in vector]) for lower_node,vector in lower]
        origin_id='lower-core/base-G/'+fibre['id']
        base_gravity_sources.append({'id':origin_id,'memberId':fibre['gridMemberId'],'centroidXYMm':list(point),'physicalDownKN':weight/2})
        if capture_grid_origins:record_grid_gravity(model,'lower-core/base-G',fibre['gridMemberId'],point,-weight/2,ground_terms,origin_id)
        fibre['seriesCombinedStiffnessKNPerMm']=body['seriesCombinedStiffnessKNPerMm'];fibre['stiffnessKNPerMm']=body['topContactStiffnessKNPerMm'];fibre['topContactSeparatedFromBody']=True
        rows.append({'fibreId':fibre['id'],'bodyTopNodeId':node,'xyMm':point,'areaMm2':fibre['areaMm2'],'ownerId':fibre['ownerId'],**body})
        contact_area+=fibre['areaMm2']
    for fibre in data['missingGroundContactFibres']:
        if eligible(fibre):missing_area+=fibre['areaMm2'];unsupported.append({'xyMm':fibre['xyMm'],'physicalGKN':fibre['areaMm2']*height/1e9*density,'reason':'source clearcore has no actual lower ground route'})
    if capture_grid_origins:finish_grid_gravity_adapter(model,'lower-core/base-G',base_gravity_sources)
    if abs(contact_area+missing_area+inventory['freeTopAreaMm2']-inventory['netClearCoreAreaMm2'])>1e-5:raise ValueError('Whole clearcore body/contact/free-top partition does not conserve area')
    members=grid_member_geometry(model);receiver_footprints=ground_receiver_footprints(model,members)
    partitions=partition_free_body_receivers(inventory['freeTopBodyBoxes'],receiver_footprints);free_weight=0.;receiver_allocations={}
    # Decide actual full-cell coverage and one receiving branch BEFORE sampling
    # loads. This is an explicit cell-wise branch allocation, not a claim to
    # integrate a continuous nearest-axis selector inside a joint intersection.
    for cell_index,cell in enumerate(partitions):
        box=cell['boxXYZMm'];x0,y0,z0,x1,y1,z1=box;centre=[(x0+x1)/2,(y0+y1)/2];ids=cell['receiverIds'];weight=(x1-x0)*(y1-y0)*height/1e9*density
        if not cell['supported']:
            unsupported.append({'xyMm':centre,'boxXYZMm':box,'areaMm2':(x1-x0)*(y1-y0),'physicalGKN':weight,'reason':'whole free-top body cell has no exact contained beam, unique cap or authored closure'})
            continue
        if ids['beam']:
            candidates={name:members[name] for name in ids['beam']};chosen=grid_vertical_point_terms(model,candidates,centre)
            if chosen is None or chosen['memberId'] not in candidates:raise ValueError('Exact covered freebody cell has no contained finite-beam route')
            selected={chosen['memberId']:candidates[chosen['memberId']]}
            def route(point):return grid_vertical_point_terms(model,selected,point)
            route_id=chosen['memberId']
        elif len(ids['cap'])==1:
            # Restrict the cap catalogue to the already-proved full-cell owner;
            # the point mapper's tolerance cannot introduce a neighbouring cap.
            registry=model.setdefault('verticalGroundCaps',{});cap_model={**model,'grid':{**model['grid'],'heads':[head for head in model['grid']['heads'] if head['id']==ids['cap'][0]]},'verticalGroundCaps':registry}
            def route(point):return grid_vertical_point_terms(cap_model,{},point)
            route_id='CAP/'+ids['cap'][0]
        else:
            closure=model.get('courtCornerClosure')
            if closure is None or ids['closure']!=[closure['addedSolid']['id']]:raise ValueError('Ambiguous authored closure receiver')
            node=closure['existingGridNodeId'];p=frame.nodes[node]
            def route(point):return {'terms':[(node,[0,0,1,point[1]-p[1],p[0]-point[0],0])],'memberId':closure['addedSolid']['id']}
            route_id=closure['addedSolid']['id']
        receiver_allocations[route_id]=receiver_allocations.get(route_id,0.)+weight
        origin_id='lower-core/free-G/cell/'+str(cell_index)
        free_gravity_sources.append({'id':origin_id,'memberId':route_id,'centroidXYMm':centre,'physicalDownKN':weight})
        applied_equivalents={}
        for xi in (-1/math.sqrt(3),1/math.sqrt(3)):
            for eta in (-1/math.sqrt(3),1/math.sqrt(3)):
                point=[(x0+x1)/2+xi*(x1-x0)/2,(y0+y1)/2+eta*(y1-y0)/2];lower=route(point)
                if lower is None:raise ValueError('Exact covered freebody cell lost its preselected physical receiver during quadrature')
                for node,vector in lower['terms']:_add(added,node,vector,-weight/4)
                for node,vector in lower['terms']:_add(applied_equivalents,node,vector,-weight/4)
        if capture_grid_origins:record_grid_uniform_gravity(model,'lower-core/free-G',route_id,[x0,y0,x1,y1],weight,applied_equivalents,origin_id)
        free_weight+=weight
    if capture_grid_origins:finish_grid_gravity_adapter(model,'lower-core/free-G',free_gravity_sources)
    for node,vector in added.items():_add(model['families']['physical-G'],node,vector)
    after=_family_wrench(model,model['families']['physical-G']);added_wrench=[b-a for a,b in zip(initial,after)]
    expected_weight=inventory['physicalGKN']-math.fsum(row['physicalGKN'] for row in unsupported)
    mx=math.fsum(_area(row['boxXYZMm'])*height/1e9*density*(row['boxXYZMm'][0]+row['boxXYZMm'][3])/2 for row in inventory['sourceBodyBoxes'])-math.fsum(row['physicalGKN']*row['xyMm'][0] for row in unsupported)
    my=math.fsum(_area(row['boxXYZMm'])*height/1e9*density*(row['boxXYZMm'][1]+row['boxXYZMm'][4])/2 for row in inventory['sourceBodyBoxes'])-math.fsum(row['physicalGKN']*row['xyMm'][1] for row in unsupported)
    expected=[0,0,-expected_weight,-my/1000,mx/1000,0];origin_residual=[a-b for a,b in zip(added_wrench,expected)]
    if max(abs(value) for value in origin_residual)>1e-6:raise ValueError('Independent source lower body G or first moments are duplicated/lost: '+str(origin_residual))
    source_paths=(METHOD,'project/str/studies/vertical_rc_floor.py','project/str/studies/vertical_floor_numerics.py','project/had/studies/water-replan.json','project/str/studies/current-house-grid.json')
    result={'schema':'str-lower-clearcore-body-comparison/1','request':setting,'sourceSHA256':{p:hashlib.sha256((Path(source['root'])/p).read_bytes()).hexdigest() for p in source_paths},
            'inventory':inventory,'contactBodyCount':len(rows),'contactBodyAreaMm2':contact_area,'sourceMissingGroundAreaMm2':missing_area,'contactBodies':rows,
            'addedPhysicalGKN':expected_weight,'freeTopPhysicalGKN':free_weight,'unsupportedBodyPhysicalGKN':math.fsum(row['physicalGKN'] for row in unsupported),'unsupportedBodies':unsupported,
            'freeTopReceiverCellCount':len(partitions),'freeTopReceiverLoadsKN':receiver_allocations,'freeTopCoveragePolicy':'exact-physical-footprint-arrangement/full-cell-containment; one declared centre-nearest contained finite beam per overlap cell',
            'addedPhysicalFamilyWrenchKN_KNm':added_wrench,'sourceSelfGAndFirstMomentResidualKN_KNm':origin_residual,'noNewLateralStiffness':True,'noMasonryTopTension':True,'bodyAxialComparisonLawAccepted':False,'candidateAccepted':False,
            'scope':'Actual ordinary clearcore union excluding RC stiffness paths, openings and arch reservations. Serial axial body and independent compression-only top contact; uniform bodyG reaches real lower paths. Finishes, masonry arches/spandrels, excluded RC columns, upper walls, roof and unsupported lower paths remain outside this added gravity.'}
    model['lowerCoreBodies']=result
    return result


def summarize_lower_core_body_response(model,result):
    data=model.get('lowerCoreBodies')
    if data is None:return None
    by_id={row['id']:row for row in result['bearings']};factor=model['houseLoadCase']['boundary']['physicalGFactor'];responses=[]
    for row in data['contactBodies']:
        bearing=by_id[row['fibreId']];p=bearing['normalCompressionKN'];weight=row['bodyPhysicalGKN']*factor
        if p < -1e-8:raise ValueError('Lower masonry body received an inadmissible tensile top action')
        responses.append({'fibreId':row['fibreId'],'topCompressionKN':p,'baseCompressionKN':p+weight,
            'bodyShorteningMm':(p+weight/2)/row['bodyAxialStiffnessKNPerMm'],'topContactActive':bearing['active'],'topRelativeClosureMm':bearing['relativeClosureMm']})
    return {'schema':'str-lower-clearcore-response/1','topCompressionKN':math.fsum(row['topCompressionKN'] for row in responses),
            'baseCompressionKN':math.fsum(row['baseCompressionKN'] for row in responses),'maximumBodyShorteningMm':max((row['bodyShorteningMm'] for row in responses),default=0),
            'activeTopContactCount':sum(row['topContactActive'] for row in responses),'openTopContactCount':sum(not row['topContactActive'] for row in responses),
            'minimumBodyEndCompressionKN':min((min(row['topCompressionKN'],row['baseCompressionKN']) for row in responses),default=0),
            'gaugeReactionsAcceptedAsSupport':False,'candidateAccepted':False,'response':responses}
