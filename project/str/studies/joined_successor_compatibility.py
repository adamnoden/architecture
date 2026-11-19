import hashlib
import json
import math
from pathlib import Path
import sys

from joined_successor_kernel import FrameModel, cross, l_section, rectangle_contact_quadrature, rectangle_section


SOURCE_PATHS = (
    'project/str/studies/current-house-grid.json',
    'project/str/studies/current-house-lateral.json',
    'project/str/studies/current-house-ground-ties.json',
    'project/str/studies/floor-portal-monolithic-drag.json',
    'project/str/studies/current-house-floor-stops.json',
    'project/str/studies/structural-linear.py',
)


def load_successor_source(root):
    root = Path(root)
    values, identities = {}, {}
    for path in SOURCE_PATHS:
        raw = (root/path).read_bytes()
        identities[path] = hashlib.sha256(raw).hexdigest()
        if path.endswith('.json'):
            values[path.rsplit('/',1)[-1][:-5]] = json.loads(raw)
    return {'schema':'str-joined-successor-source/1','identities':identities,'values':values}


def _finite(value):
    return type(value) in (float,int) and math.isfinite(value)


def _keys(value, expected, label):
    if not isinstance(value,dict) or set(value) != set(expected):
        raise ValueError('Expected exact '+label+' fields')


def reference_successor_request(source):
    return {
        'schema':'str-joined-successor-case/1','sourceSHA256':source['identities'],
        'headBoundary':'ideal-pinned-at-all-52-heads',
        'floorConnection':'source-north-band-two-corner-support-trial',
        'northWallWidthMm':source['values']['floor-portal-monolithic-drag']['geometry']['wallUAndLegVLimitsMm'][0][1]
                           -source['values']['floor-portal-monolithic-drag']['geometry']['wallUAndLegVLimitsMm'][0][0],
        'memberLaw':None, 'jointLaw':None,
        'boundaryActions':{'activeCorner':'NW','sense':1,'demandFactor':1,'floorGravityFactor':1},
    }


def _admit(request, source):
    _keys(request, ('schema','sourceSHA256','headBoundary','floorConnection','northWallWidthMm','memberLaw','jointLaw','boundaryActions'), 'joined successor case')
    if request['schema'] != 'str-joined-successor-case/1' or request['sourceSHA256'] != source['identities']:
        raise ValueError('Stale or unsupported joined successor source')
    if request['headBoundary'] != 'ideal-pinned-at-all-52-heads':
        raise ValueError('Only the explicitly ideal pinned-head boundary is supported; no soil stiffness is supplied')
    if request['floorConnection'] != 'source-north-band-two-corner-support-trial':
        raise ValueError('The actual intermediate north support laws are unavailable; only the declared two-corner floorband trial is supported')
    width = request['northWallWidthMm']
    if not _finite(width) or not 140 <= width <= 240:
        raise ValueError('North wall width comparison must remain between 140 and 240 mm')
    material = request['memberLaw']
    _keys(material, ('mode','elasticModulusMPa','poissonRatio','flexuralFactor','torsionFactor','shearAreaFactor'), 'authored member law')
    if material['mode'] != 'authored-linear-comparison' or any(not _finite(material[key]) for key in material if key!='mode'):
        raise ValueError('Member rigidity needs an explicit finite authored comparison law')
    if material['elasticModulusMPa'] <= 0 or not 0 <= material['poissonRatio'] < .5 or any(not 0 < material[key] <= 1 for key in ('flexuralFactor','torsionFactor','shearAreaFactor')):
        raise ValueError('Unsupported member rigidity domain')
    joint = request['jointLaw']
    _keys(joint, ('mode','compressionStiffnessKNPerMm3','tieStiffnessKNPerMm','shearKeyStiffnessKNPerMm','compressionGapMm','tieGapMm'), 'authored DPC joint law')
    if joint['mode'] != 'authored-spring-comparison' or any(not _finite(joint[key]) for key in joint if key!='mode'):
        raise ValueError('DPC stiffness is missing; supply an explicit authored spring comparison')
    if any(joint[key] <= 0 for key in ('compressionStiffnessKNPerMm3','tieStiffnessKNPerMm','shearKeyStiffnessKNPerMm')) or min(joint['compressionGapMm'],joint['tieGapMm']) < 0:
        raise ValueError('Positive finite joint stiffness and nonnegative gaps are required')
    if joint['compressionGapMm'] != 0 or joint['tieGapMm'] != 0:
        raise ValueError('Only zero-gap DPC laws are supported; finite free-travel branches are outside this solver')
    actions = request['boundaryActions']
    _keys(actions, ('activeCorner','sense','demandFactor','floorGravityFactor'), 'collector boundary actions')
    if actions['activeCorner'] not in ('NW','NE','both') or type(actions['sense']) is not int or actions['sense'] not in (-1,1):
        raise ValueError('Choose the named north collector and signed local drag direction')
    if any(not _finite(actions[key]) or not 0 <= actions[key] <= 1 for key in ('demandFactor','floorGravityFactor')):
        raise ValueError('Boundary factors must remain inside the retained source demand')


def _point(line, parameter):
    return [line['a'][j]+parameter*(line['b'][j]-line['a'][j]) for j in range(2)]


def _parameter(line, point):
    d = [b-a for a,b in zip(line['a'],line['b'])]
    return sum((p-a)*v for p,a,v in zip(point,line['a'],d))/sum(v*v for v in d)


def _grid(model, grid, material):
    lines = {}
    for name,row in grid['girders'].items():
        lo,hi = row['extent']
        a,b = ([lo,row['datum']],[hi,row['datum']]) if row['axis']=='x' else ([row['datum'],lo],[row['datum'],hi])
        lines[name] = {'a':a,'b':b,'width':row['width'],'z':row['z'],'cuts':{0.,1.},'heads':row['heads']}
    for name,row in grid['crossBeams'].items():
        lines[name] = {**row,'cuts':{0.,1.},'heads':[]}
    head_by_id = {head['id']:head for head in grid['heads']}
    projected_heads = {}
    for name,line in lines.items():
        for entry in line['heads']:
            head = head_by_id[entry['id']]
            t = _parameter(line,head['xy'])
            line['cuts'].add(t)
            point = _point(line,t)
            projected_heads[tuple(round(v,6) for v in point)] = head['id']
    for name,line in lines.items():
        if 'start' not in line:
            continue
        for which,parent_name in [('a',line['start']),('b',line['end'])]:
            parent = lines[parent_name]
            t = _parameter(parent,line[which])
            if not -.000001 <= t <= 1.000001 or math.dist(_point(parent,t),line[which]) > parent['width']/2:
                raise ValueError('Named grid connection lies outside its physical receiving beam')
            parent['cuts'].add(max(0,min(1,t)))
    entries = list(lines.items())
    for i,(left_name,left) in enumerate(entries):
        for right_name,right in entries[i+1:]:
            lx = left['a'][0] != left['b'][0]
            rx = right['a'][0] != right['b'][0]
            if lx == rx:
                continue
            horizontal,vertical = (left,right) if lx else (right,left)
            point = [vertical['a'][0],horizontal['a'][1]]
            lt,rt = _parameter(left,point),_parameter(right,point)
            if 0 <= lt <= 1 and 0 <= rt <= 1:
                left['cuts'].add(lt);right['cuts'].add(rt)
    grid_z = sum(grid['girders']['outer-W']['z'])/2
    for head in grid['heads']:
        model.node(head['id'],[*head['xy'],head['capZ'][0]])
        for axis in range(3): model.fixed[head['id'],axis] = 0.
    def node(point):
        key = tuple(round(v,6) for v in point)
        if key in projected_heads:
            return projected_heads[key]
        name = 'GRID-'+str(key[0])+'-'+str(key[1])
        return model.node(name,[*key,grid_z])
    for name,line in lines.items():
        cuts = sorted(line['cuts'])
        section = rectangle_section(line['width'],line['z'][1]-line['z'][0])
        z = sum(line['z'])/2
        for index,(left,right) in enumerate(zip(cuts,cuts[1:])):
            a,b = _point(line,left),_point(line,right)
            master_a,master_b = node(a),node(b)
            if 'start' in line and index==0:
                parent = lines[line['start']]
                master_a = node(_point(parent,_parameter(parent,a)))
            if 'end' in line and index==len(cuts)-2:
                parent = lines[line['end']]
                master_b = node(_point(parent,_parameter(parent,b)))
            model.member('GRID/'+name+'/'+str(index),master_a,master_b,section,material,[*a,z],[*b,z])
    return lines


def _wrench_at(force, point, origin):
    return [*force,*cross([a-b for a,b in zip(point,origin)],force)]


def solve_successor_compatibility(request, source):
    _admit(request,source)
    values = source['values']
    grid = values['current-house-grid']
    if len(grid['heads']) != 52 or len({head['id'] for head in grid['heads']}) != 52:
        raise ValueError('Expected the actual named 52-head source grid')
    collector = values['floor-portal-monolithic-drag']
    geometry = collector['geometry']
    joint_law,material = request['jointLaw'],request['memberLaw']
    model = FrameModel()
    _grid(model,grid,material)
    section = l_section(geometry['wallUAndLegVLimitsMm'][0][0],request['northWallWidthMm'],geometry['wallUAndLegVLimitsMm'][1][1])
    plate = values['current-house-lateral']['capillarySplice']['plateZ']
    source_blocks = values['current-house-ground-ties']['outer']['DPC']['threeThickBlocksPlanLocal']
    block_offset = source_blocks[0][2]/2
    main_axes = [row['legacyBlindBoreXYMm'] for row in collector['groundSplice']['knownMainBarAxes']]
    source_top = geometry['soffitAndOrdinarySlabTopZMm'][0]
    load_z = collector['stack']['axesInSectionZMm'][3]
    all_applied = []
    joints = []
    cap_transfers = []
    for corner,head_id,sx,sy in [('NW','P07',1,-1),('NE','P10',-1,-1)]:
        head = next(head for head in grid['heads'] if head['id']==head_id)
        origin = head['xy']
        def world(u,v,z): return [origin[0]+sx*u,origin[1]+sy*v,z]
        cx,cy = section['centreUV']
        head_u = cx
        head_v = cy
        if abs(head_u) > head['capXY'][0]/2 or abs(head_v) > head['capXY'][1]/2:
            raise ValueError('The centroidal lower transfer falls outside the actual corner cap')
        top = model.node(corner+'/collector',world(cx,cy,source_top))
        upper = model.node(corner+'/DPC-upper',world(cx,cy,plate[1]))
        lower = model.node(corner+'/DPC-lower',world(cx,cy,plate[0]))
        bottom = model.node(corner+'/wall-foot',world(cx,cy,head['capZ'][1]))
        orientation = [sx*section['principalYUV'][0],sy*section['principalYUV'][1],0]
        model.member(corner+'/upper-wall',upper,top,section,material,y_axis=orientation)
        model.member(corner+'/lower-wall',bottom,lower,section,material,y_axis=orientation)
        cap_section = rectangle_section(head['capXY'][0],head['capXY'][1])
        cap_grid_z = sum(grid['girders']['outer-W']['z'])/2
        model.member(corner+'/corner-cap',head_id,bottom,cap_section,material,
                     physical_start=[*head['xy'],cap_grid_z],physical_end=[*head['xy'],head['capZ'][1]],y_axis=[0,1,0])
        cap_transfers.append({'corner':corner,'headId':head_id,
                              'rigidLowerTransferZMm':[head['capZ'][0],cap_grid_z],
                              'finiteUpperCapZMm':[cap_grid_z,head['capZ'][1]]})
        centres = []
        for rectangle in section['rectangles']:
            for u,v,area in rectangle_contact_quadrature(rectangle):
                point = world(u,v,sum(plate)/2)
                name = corner+'/compression/'+str(len(centres))
                model.spring(name,upper,lower,point,[0,0,1],joint_law['compressionStiffnessKNPerMm3']*area,'compression',joint_law['compressionGapMm'])
                centres.append(name)
        for index,(u,v) in enumerate(main_axes):
            model.spring(corner+'/tie/'+str(index),upper,lower,world(u,v,sum(plate)/2),[0,0,1],joint_law['tieStiffnessKNPerMm'],'tension',joint_law['tieGapMm'])
        for index,(u,v,width,depth) in enumerate(source_blocks):
            point = world(u+width/2-block_offset,v+depth/2-block_offset,sum(plate)/2)
            for axis in (0,1):
                direction = [0,0,0];direction[axis] = 1
                model.spring(corner+'/key/'+str(index)+'/'+str(axis),upper,lower,point,direction,joint_law['shearKeyStiffnessKNPerMm'])
        actions = request['boundaryActions']
        active = actions['activeCorner'] in (corner,'both')
        drag = collector['lateralClosure']['ownerHistoricalForceKN']*actions['demandFactor']*actions['sense'] if active else 0.
        gravity = next(row['wingReactionKN'] for row in collector['gravity']['records'] if row['field']==('NW-W' if corner=='NW' else 'NE'))*actions['floorGravityFactor']
        point = world(geometry['receivingUMm'],sum(collector['straightDrag']['barCentresAtReceivingPlaneVMm'])/len(collector['straightDrag']['barCentresAtReceivingPlaneVMm']),load_z)
        force = [0,sy*drag,0]
        wrench = _wrench_at(force,point,model.nodes[top])
        model.load(top,wrench)
        all_applied.append({'id':corner+'/collector-drag','pointXYZMm':point,'forceKN':force,'wrenchAtCollectorKN_KNmm':wrench})
        wing_head = next(entry for entry in grid['heads'] if entry['id']==('P09' if corner=='NW' else 'P12'))
        gravity_v = math.dist(origin,wing_head['xy'])/2
        point = world(sum(collector['gravity']['directBearingURangeMm'])/2,gravity_v,source_top)
        force = [0,0,-gravity]
        wrench = _wrench_at(force,point,model.nodes[top])
        model.load(top,wrench)
        all_applied.append({'id':corner+'/direct-gravity-seat','pointXYZMm':point,'forceKN':force,'wrenchAtCollectorKN_KNmm':wrench})
        joints.append({'id':corner,'upper':upper,'lower':lower,'originXYZMm':world(cx,cy,sum(plate)/2)})
    north_band = values['current-house-floor-stops']['newLoops']['outer']
    band_section = rectangle_section(*north_band['coreWidthDepth'])
    band_z = sum(north_band['topBottomZ'])/2
    west = next(head for head in grid['heads'] if head['id']=='P07')
    east = next(head for head in grid['heads'] if head['id']=='P10')
    model.member('FLOOR/outer-north-band','NW/collector','NE/collector',band_section,material,
                 physical_start=[*west['xy'],band_z],physical_end=[*east['xy'],band_z])
    result = model.solve()
    interface = []
    for joint in joints:
        wrench = [0.]*6
        springs = [spring for spring in result['springs'] if spring['id'].startswith(joint['id']+'/')]
        for spring in springs:
            upper_row = next(row for name,row in spring['terms'] if name==joint['upper'])
            for axis,value in enumerate(upper_row): wrench[axis] -= spring['forceKN']*value
        upper_point = model.nodes[joint['upper']]
        shift = cross([a-b for a,b in zip(upper_point,joint['originXYZMm'])],wrench[:3])
        wrench[3:] = [a+b for a,b in zip(wrench[3:],shift)]
        interface.append({**joint,'forceOnUpperKN_KNm':[*wrench[:3],*[value/1000 for value in wrench[3:]]],
                          'upperDisplacementMmRad':result['displacements'][joint['upper']],
                          'lowerDisplacementMmRad':result['displacements'][joint['lower']],
                          'compressionPatches':[{'id':s['id'],'active':s['active'],'relativeMm':s['relativeMm'],'compressionKN':-s['forceKN']} for s in springs if '/compression/' in s['id']],
                          'tensionTies':[{'id':s['id'],'active':s['active'],'relativeMm':s['relativeMm'],'tensionKN':s['forceKN']} for s in springs if '/tie/' in s['id']]})
    equilibrium = [0.]*6
    for load in all_applied:
        row = _wrench_at(load['forceKN'],load['pointXYZMm'],[0,0,0])
        equilibrium = [a+b for a,b in zip(equilibrium,row)]
    heads = []
    for head in grid['heads']:
        wrench = result['supportWrenches'][head['id']]
        row = _wrench_at(wrench[:3],model.nodes[head['id']],[0,0,0])
        row[3:] = [a+b for a,b in zip(row[3:],wrench[3:])]
        equilibrium = [a+b for a,b in zip(equilibrium,row)]
        heads.append({'id':head['id'],'xyzMm':model.nodes[head['id']],
                      'reactionKN_KNm':[*wrench[:3],*[value/1000 for value in wrench[3:]]],
                      'displacementMmRad':result['displacements'][head['id']]})
    if max(abs(value) for value in equilibrium[:3]) > .001 or max(abs(value)/1000 for value in equilibrium[3:]) > .01:
        raise ValueError('Joined successor replay loses global six-component equilibrium')
    return {
        'schema':'str-joined-successor-result/1','sourceSHA256':source['identities'],
        'status':'coupled-boundary-comparison','headBoundary':request['headBoundary'],
        'coordinates':{'axis':'Project X and Y; Z upward; rotations right-handed.',
                       'wrenchOrder':['Fx_kN','Fy_kN','Fz_kN','Mx_kNm','My_kNm','Mz_kNm'],
                       'headReaction':'Support force on the model, with upward Fz positive. This is not the legacy N/Cx/Cy/Vx/Vy ordering.',
                       'interfaceWrench':'Force on the upper joint body at the named joint origin; moment is r cross F.',
                       'displacementOrder':['ux_mm','uy_mm','uz_mm','rx_rad','ry_rad','rz_rad']},
        'section':section,'request':request,'nodeCount':len(model.nodes),'memberCount':len(model.members),
        'capTransfers':cap_transfers,
        'northBand':{'sourceSection':north_band['coreWidthDepth'],'physicalZMm':north_band['topBottomZ'],
                     'memberEndWrenchesAtWallCentroidsKN_KNmm':result['memberEndWrenchesKN_KNmm']['FLOOR/outer-north-band'],
                     'omittedIntermediateSupportLaws':'Source intermediate north bearing positions are not assigned invented vertical/lateral stiffness. This is the explicit two-corner support comparison, not actual complete floor support.'},
        'heads':heads,'interfaces':interface,'applied':all_applied,
        'nodes':[{'id':name,'xyzMm':point,'displacementMmRad':result['displacements'][name]} for name,point in model.nodes.items()],
        'activeSetIterations':result['iterations'],'maximumFreeResidualKNOrKNmm':result['maximumFreeResidualKNOrKNmm'],
        'equilibriumResidualKN_KNm':[*equilibrium[:3],*[value/1000 for value in equilibrium[3:]]],
        'installedAcceptance':False,'completeHouseProof':False,
        'diagnostics':[
            'The input DPC and cracked member laws are declared numerical comparisons, not qualified physical stiffness or resistance.',
            'Only zero-gap spring laws are supported. Finite free travel is rejected at native admission and kernel construction; no gap is clamped or regularised.',
            'Member and wall self-weight, other house gravity/precompression and roof loads are omitted. The only vertical loads are the stated source wing-seat boundary challenges; contact opening and tie forces apply only to this comparison.',
            'The 95.16 kN source quantity is historical horizontal collector drag. It is not the separate hypothetical 138.392 kN added vertical retained-load requirement from the global-contact envelope.',
            'activeCorner both applies the full authored drag to both north corners. This double-drag comparison is not a demonstrated whole-house wind allocation.',
            'The independent bilateral biaxial shear-key springs are a phenomenological law at historic block centres, not a physical key/contact model or qualified simultaneous shear/rotation transfer.',
            'Each rectangular DPC subdomain uses 2x2 Gaussian normal-contact points, reproducing full-contact area and second moments. Partial contact remains discretised without mesh-convergence proof; no local pressure or bearing-resistance pass follows.',
            'The L-section torsion constant is an additive rectangle estimate. Shear-centre eccentricity, warping and their bending/torsion coupling are omitted; isotropic shear modulus and the effective shear-area factor are authored comparisons.',
            'The actual widened north wall is a centroidal Timoshenko L member; the local collector is a rigid boundary section. The source 140x750 outer-north band joins the two corners with actual intermediate support laws explicitly omitted. Full slab/chord and intermediate-wall load sharing remain outside this method.',
            'The corner cap has a rigid lower transfer from the head master to the grid axis, then a finite upper segment to the wall foot. At the source levels these are -750 to -405 mm (345 mm rigid) and -405 to -180 mm (225 mm finite); the entire 570 mm cap is not modelled as finite. Local cap/girder/shaft stress fields and reinforcement need separate proof.',
            'All 52 actual heads have ideal pinned translation restraint and free rotations. No soil, shaft or foundation capacity is inferred.',
            'Successor fixed wall heads, moving tied roof sectors, masonry arches, moisture continuity, thermal/shrinkage and construction stages are unsupported; no old roof model is substituted.',
        ],
    }


if __name__ == '__main__':
    source = load_successor_source(Path(__file__).resolve().parents[3])
    if sys.argv[1:] == ['--read']:
        print(json.dumps(reference_successor_request(source)))
    else:
        print(json.dumps(solve_successor_compatibility(json.load(sys.stdin),source),allow_nan=False))
