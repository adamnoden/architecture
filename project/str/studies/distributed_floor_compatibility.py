import ast
import copy
import hashlib
from itertools import pairwise, product
import json
import math
from pathlib import Path
import sys

from joined_successor_compatibility import _admit, _grid, _wrench_at, load_successor_source, reference_successor_request
from joined_successor_kernel import FrameModel, cross, l_section, rectangle_contact_quadrature, rectangle_section
from perforated_floor_condensation import compile_perforated_floor
from retained_components import evaluate_retained_components, load_retained_source, reference_retained_request


EXTRA_SOURCES = ('project/str/studies/current-house-roof-bracing.py',
                 'project/str/studies/distributed_floor_compatibility.py',
                 'project/str/studies/perforated_floor_condensation.py',
                 'project/str/studies/joined_successor_compatibility.py',
                 'project/str/studies/joined_successor_kernel.py',
                 'project/str/studies/retained_components.py',
                 'project/str/studies/distributed_floor_views.py')
CORNERS = ('SW','SE','NW','NE')


def load_distributed_floor_source(root):
    root = Path(root)
    successor, retained = load_successor_source(root), load_retained_source(root)
    identities = {**successor['identities'], **retained['identities']}
    for path in EXTRA_SOURCES:
        identities[path] = hashlib.sha256((root/path).read_bytes()).hexdigest()
    return {'schema':'str-distributed-floor-source/1','successor':successor,'retained':retained,'identities':identities,
            'windMethodText':(root/EXTRA_SOURCES[0]).read_text()}


def reference_distributed_floor_request(source):
    return {'schema':'str-distributed-floor-case/1','sourceSHA256':source['identities'],
            'cornerWidthsMm':{'NW':240,'NE':240,'SW':140,'SE':140},
            'memberLaw':None,'jointLaw':None,'membraneLaw':None,
            'edgeBand':None,'maxPitchMm':1400,
            'componentCase':reference_retained_request(source['retained']),
            'boundaryCase':{'kind':'native-floor-wind-band-only','windIndex':0},
            'receivingLaws':{'successorRoof':None,'verticalFloor':None,'dryGround':None,
                             'intermediateSupports':{port['id']:None for port in native_intermediate_support_ports(source)}},
            'use':'bounded-diaphragm-comparison'}


def _finite(value):
    return type(value) in (int,float) and math.isfinite(value)


def _exact(value, fields, label):
    if not isinstance(value,dict) or set(value)!=set(fields):
        raise ValueError('Expected exact '+label+' fields')


def _admit_distributed(request, source):
    _exact(request,('schema','sourceSHA256','cornerWidthsMm','memberLaw','jointLaw','membraneLaw','edgeBand','maxPitchMm','componentCase','boundaryCase','receivingLaws','use'),'distributed-floor comparison')
    if request['schema']!='str-distributed-floor-case/1' or request['sourceSHA256']!=source['identities']:
        raise ValueError('Stale or unsupported distributed-floor source')
    if request['use']!='bounded-diaphragm-comparison':
        raise ValueError('Complete-house use rejects: successor roof, intermediate support, vertical plate and dry-side joint laws are missing')
    _exact(request['receivingLaws'],('successorRoof','verticalFloor','dryGround','intermediateSupports'),'unresolved receiving laws')
    if any(request['receivingLaws'][key] is not None for key in ('successorRoof','verticalFloor','dryGround')):
        raise ValueError('Unsupported receiving law: successor roof, vertical floor and dry ground remain explicit missing proofs')
    ports = {port['id'] for port in native_intermediate_support_ports(source)}
    _exact(request['receivingLaws']['intermediateSupports'],ports,'actual intermediate receiving ports')
    if any(value is not None for value in request['receivingLaws']['intermediateSupports'].values()):
        raise ValueError('Finite intermediate receiving laws are not implemented; no numerical value earns automatic acceptance')
    _exact(request['cornerWidthsMm'],CORNERS,'four corner widths')
    for corner,width in request['cornerWidthsMm'].items():
        if not _finite(width) or not 140 <= width <= 240:
            raise ValueError('Corner width must remain in the explicit140..240mm comparison domain')
        legacy = reference_successor_request(source['successor'])
        legacy.update(northWallWidthMm=width,memberLaw=request['memberLaw'],jointLaw=request['jointLaw'])
        _admit(legacy,source['successor'])
    law = request['membraneLaw']
    _exact(law,('mode','elasticModulusMPa','poissonRatio','shearModulusMPa'),'authored membrane law')
    if law['mode']!='authored-linear-comparison' or not all(_finite(law[key]) for key in ('elasticModulusMPa','poissonRatio','shearModulusMPa')) or law['elasticModulusMPa'] <= 0 or law['shearModulusMPa'] <= 0 or not 0 <= law['poissonRatio'] < .5:
        raise ValueError('Missing or unsupported explicit membrane comparison law')
    band = request['edgeBand']
    _exact(band,('mode','widthMm','depthMm','elasticModulusMPa','flexuralFactor','axialRigidityKN'),'authored slab-level band')
    if band['mode']!='authored-conventional-slab-level-band' or not all(_finite(band[key]) for key in band if key!='mode') or not 140 <= band['widthMm'] <= 300 or band['depthMm'] != 200 or band['elasticModulusMPa'] <= 0 or band['axialRigidityKN'] <= 0 or not 0 < band['flexuralFactor'] <= 1:
        raise ValueError('The explicit conventional band must have width140..300mm and depth200mm; source upstand height is not borrowed')
    if not _finite(request['maxPitchMm']) or not 250 <= request['maxPitchMm'] <= 1800:
        raise ValueError('Mesh pitch must remain within the declared250..1800mm comparison range')
    _exact(request['boundaryCase'],('kind','windIndex'),'native first-floor wind boundary')
    wind = request['boundaryCase']['windIndex']
    if request['boundaryCase']['kind']!='native-floor-wind-band-only' or type(wind) is not int or not 0 <= wind < 96:
        raise ValueError('Choose one of the actual96 native signed floor-band programmes')


def _bounds(shape):
    if shape['kind']=='rectangle':
        return shape['boundsXYMm']
    x,y = shape['centreXYMm'];radius = shape['diameterMm']/2
    return [x-radius,y-radius,x+radius,y+radius]


def _native_floor_wind(source, wind, axes):
    tree = ast.parse(source['windMethodText'])
    scalar = {}
    p1 = []
    for node in ast.walk(tree):
        if not isinstance(node,ast.Assign):
            continue
        if len(node.targets)==1 and isinstance(node.targets[0],ast.Name):
            name = node.targets[0].id
            if name in ('base','ff','rr'):
                scalar[name] = ast.literal_eval(node.value)
            if name=='P1':
                p1.append(node.value)
    functions = [node for node in tree.body if isinstance(node,ast.FunctionDef) and node.name=='pt']
    expected_pt = ast.parse('def pt(face,normal,u):\n return [(u,normal),(12000-normal,u),(12000-u,12000-normal),(normal,12000-u)][face]').body[0]
    if len(functions)!=1 or ast.dump(functions[0],include_attributes=False)!=ast.dump(expected_pt,include_attributes=False):
        raise ValueError('The native face-coordinate recipe changed; no half-face load is silently mirrored')
    recipes = {}
    for node in ast.walk(tree):
        if isinstance(node,ast.Assign) and len(node.targets)==1 and isinstance(node.targets[0],ast.Name) and node.targets[0].id in ('low','high'):
            recipes.setdefault(node.targets[0].id,[]).append(node.value)
    for key,expression in [('low','-200 if mode!=2 else 6000'),('high','12200 if mode!=1 else 6000')]:
        if len(recipes.get(key,[]))!=1 or ast.dump(recipes[key][0],include_attributes=False)!=ast.dump(ast.parse(expression,mode='eval').body,include_attributes=False):
            raise ValueError('The native pressure extent recipe changed; update the explicit adapter')
    expected = ast.parse('s*2.25*dl*(rr-base)/2',mode='eval').body
    if set(scalar)!=set(('base','ff','rr')) or len(p1)!=1 or ast.dump(p1[0],include_attributes=False)!=ast.dump(expected,include_attributes=False):
        raise ValueError('The native floor-pressure recipe changed; update the explicit adapter instead of retaining old actions')
    programmes = [bits for bits in product(range(7),repeat=2) if bits!=(0,0)]
    bits = programmes[wind%48]
    rows = []
    for axis,code in enumerate(bits):
        if not code:
            continue
        sign = 1 if code < 4 else -1
        mode = (code-1)%3
        low = -200 if mode!=2 else 6000
        high = 12200 if mode!=1 else 6000
        length_m = (high-low)/1000
        source_interval = [low,high]
        if axis==0 and sign==1 or axis==1 and sign==-1:
            low,high = 12000-high,12000-low
        along = (low+high)/2
        if axis==0:
            point = [axes['A'] if sign==1 else axes['B'],along,scalar['ff']]
        else:
            point = [along,axes['A'] if sign==1 else axes['B'],scalar['ff']]
        force = [0.,0.,0.]
        force[axis] = sign*2.25*length_m*(scalar['rr']-scalar['base'])/2000
        rows.append({'id':'native-floor-pressure/'+str(axis),'pointXYZMm':point,'forceKN':force,
                     'pressureKPa':2.25,'loadedAlongIntervalMm':[low,high],'sourceLocalAlongIntervalMm':source_interval,
                     'sourceVerticalBandMm':[scalar['base'],scalar['rr']],
                     'sourceForceApplicationZMm':scalar['ff']})
    return {'windIndex':wind,'programme':list(bits),'courtProjection':wind>=48,'sourceDatumsMm':scalar,'rows':rows,
            'scope':'Exact native first-floor lateral pressure resultant and first moment only. No roof-level pressure, vertical roof reactions, below-floor wall pressure, retained floor/core gravity or existing fixed-base foundation action is imported.'}



def native_intermediate_support_ports(source):
    tree = ast.parse(source['retained']['texts']['project/str/studies/current-house-floor-closure.py'])
    selected = []
    first = True
    for node in tree.body:
        if isinstance(node,ast.Assign) and any(isinstance(target,ast.Name) and target.id=='INF' for target in node.targets):
            break
        if isinstance(node,ast.Assign):
            names = [target.id for target in node.targets if isinstance(target,ast.Name)]
            tuples = [[part.id for part in target.elts if isinstance(part,ast.Name)] for target in node.targets if isinstance(target,ast.Tuple)]
            if names and set(names)<=set(('walls','coords','allLower')) or ['A','B','C','E'] in tuples:
                selected.append(node)
        if isinstance(node,ast.For) and isinstance(node.target,ast.Tuple) and [part.id for part in node.target.elts if isinstance(part,ast.Name)]==['kind','lo','hi'] and first:
            selected.append(node);first = False
    if first or len(selected)!=5:
        raise ValueError('Native intermediate support geometry requires an explicitly updated adapter')
    scope = {'H':source['retained']['values']['project/had/studies/water-replan.json']['model']}
    exec(compile(ast.Module(body=selected,type_ignores=[]),'native-support-geometry','exec'),scope)
    result = []
    corners = {(scope['A'],scope['A']),(scope['A'],scope['B']),(scope['B'],scope['A']),(scope['B'],scope['B'])}
    for wall,(axis,datum,low,high,stations) in sorted(scope['walls'].items()):
        for station in stations:
            point = (station,datum) if axis==0 else (datum,station)
            if point in corners:
                continue
            result.append({'id':'FLOOR/RECEIVER/'+wall+'/'+str(station),'wallId':wall,'xyMm':list(point),
                           'source':'project/str/studies/current-house-floor-closure.py',
                           'law':None,'status':'missing-finite-masonry-arch-portal-and-contact-law'})
    return result

def compile_distributed_floor(request, source):
    _admit_distributed(request,source)
    retained = evaluate_retained_components(request['componentCase'],source['retained'])
    bodies = [row['geometry']['bodyRectangleXYMm'] for row in retained['components'] if row['kind']=='first-floor']
    physical_holes = [{'id':row['id'],'bounds':_bounds(row['shape'])} for row in retained['floorApertures']]
    holes = [row['bounds'] for row in physical_holes]
    h = source['retained']['values']['project/had/studies/water-replan.json']['model']
    principal = h['rooms']['principalBath']
    unknown = [principal['westFinishedFace'],principal['southFinishedFace'],principal['eastFinishedFace'],principal['northFinishedFace']]
    holes.append(unknown)
    physical_holes.append({'id':'FLOOR-UNKNOWN/principal-wet-territory','bounds':unknown})
    def reject_intersections(rectangles, path):
        for rectangle in rectangles:
            for aperture in physical_holes:
                bounds = aperture['bounds']
                if min(rectangle[2],bounds[2])-max(rectangle[0],bounds[0])>1e-6 and min(rectangle[3],bounds[3])-max(rectangle[1],bounds[1])>1e-6:
                    raise ValueError('APERTURE_INTERSECTS_STRUCTURAL_PATH: '+aperture['id']+' intersects '+path+'; provide an authored clear band/corner or a qualified local trimmer, not stiffness through the aperture')
    axes = source['retained']['policy']['axes'];a,b,c,e = [axes[key] for key in ('A','B','C','E')]
    band = request['edgeBand'];half = band['widthMm']/2
    loops = []
    for family,low,high in [('outer',a,b),('court',c,e)]:
        for face,axis,datum in [('south',0,low),('east',1,high),('north',0,high),('west',1,low)]:
            loops.append({'id':family+'-'+face,'axis':axis,'datum':datum,'lo':low,'hi':high,'width':band['widthMm'],'depth':band['depthMm']})
            band_rectangle = [low,datum-half,high,datum+half] if axis==0 else [datum-half,low,datum+half,high]
            reject_intersections([band_rectangle],'FLOOR/BAND/'+family+'-'+face)
            holes.append(band_rectangle)
        junctions = [[x-half,y-half,x+half,y+half] for x in (low,high) for y in (low,high)]
        reject_intersections(junctions,'FLOOR/BAND/'+family+'-junctions')
        holes.extend(junctions)
    collector = source['successor']['values']['floor-portal-monolithic-drag']
    geometry = collector['geometry']
    slab_bottom,slab_top = geometry['soffitAndOrdinarySlabTopZMm']
    if slab_top-slab_bottom!=band['depthMm']:
        raise ValueError('The candidate band must stay within the actual slab thickness')
    slab_z = (slab_bottom+slab_top)/2
    grid = source['successor']['values']['current-house-grid']
    joint_law,material = request['jointLaw'],request['memberLaw']
    model = FrameModel();_grid(model,grid,material)
    corners = []
    joints = []
    for corner,head_id,sx,sy in [('SW','P01',1,1),('SE','P04',-1,1),('NW','P07',1,-1),('NE','P10',-1,-1)]:
        head = next(row for row in grid['heads'] if row['id']==head_id)
        origin = head['xy']
        def world(u,v,z):
            return [origin[0]+sx*u,origin[1]+sy*v,z]
        section = l_section(geometry['wallUAndLegVLimitsMm'][0][0],request['cornerWidthsMm'][corner],geometry['wallUAndLegVLimitsMm'][1][1])
        cx,cy = section['centreUV']
        if abs(cx)>head['capXY'][0]/2 or abs(cy)>head['capXY'][1]/2:
            raise ValueError('The centroidal lower transfer falls outside the actual corner cap')
        plate = source['successor']['values']['current-house-lateral']['capillarySplice']['plateZ']
        top = model.node(corner+'/collector',world(cx,cy,slab_bottom))
        upper = model.node(corner+'/DPC-upper',world(cx,cy,plate[1]))
        lower = model.node(corner+'/DPC-lower',world(cx,cy,plate[0]))
        bottom = model.node(corner+'/wall-foot',world(cx,cy,head['capZ'][1]))
        orientation = [sx*section['principalYUV'][0],sy*section['principalYUV'][1],0]
        model.member(corner+'/upper-wall',upper,top,section,material,y_axis=orientation)
        model.member(corner+'/lower-wall',bottom,lower,section,material,y_axis=orientation)
        cap_grid_z = sum(grid['girders']['outer-W']['z'])/2
        model.member(corner+'/corner-cap',head_id,bottom,rectangle_section(*head['capXY']),material,
                     physical_start=[*head['xy'],cap_grid_z],physical_end=[*head['xy'],head['capZ'][1]],y_axis=[0,1,0])
        for index,rectangle in enumerate(section['rectangles']):
            for sample,(u,v,area) in enumerate(rectangle_contact_quadrature(rectangle)):
                model.spring(corner+'/compression/'+str(index)+'/'+str(sample),upper,lower,world(u,v,sum(plate)/2),[0,0,1],joint_law['compressionStiffnessKNPerMm3']*area,'compression')
        for index,(u,v) in enumerate([row['legacyBlindBoreXYMm'] for row in collector['groundSplice']['knownMainBarAxes']]):
            model.spring(corner+'/tie/'+str(index),upper,lower,world(u,v,sum(plate)/2),[0,0,1],joint_law['tieStiffnessKNPerMm'],'tension')
        blocks = source['successor']['values']['current-house-ground-ties']['outer']['DPC']['threeThickBlocksPlanLocal']
        block_offset = blocks[0][2]/2
        for index,(u,v,width,depth) in enumerate(blocks):
            for axis in (0,1):
                direction = [0,0,0];direction[axis] = 1
                model.spring(corner+'/key/'+str(index)+'/'+str(axis),upper,lower,world(u+width/2-block_offset,v+depth/2-block_offset,sum(plate)/2),direction,joint_law['shearKeyStiffnessKNPerMm'])
        rectangles = []
        for u,v,U,V in section['rectangles']:
            x,y,_ = world(u,v,0);X,Y,_ = world(U,V,0)
            rectangles.append([min(x,X),min(y,Y),max(x,X),max(y,Y)])
        reject_intersections(rectangles,'FLOOR/CORNER/'+corner)
        corners.append({'id':corner,'originXYMm':origin,'rectangles':rectangles,'node':top})
        joints.append({'id':corner,'upper':upper,'lower':lower,'originXYZMm':world(cx,cy,sum(plate)/2)})
    law = {key:value for key,value in request['membraneLaw'].items() if key!='mode'}
    law.update(thicknessMm=slab_top-slab_bottom,edgeElasticModulusMPa=band['elasticModulusMPa'],edgeFlexuralFactor=band['flexuralFactor'],edgeAxialRigidityKN=band['axialRigidityKN'])
    wind = _native_floor_wind(source,request['boundaryCase']['windIndex'],axes)
    wind['planeProjection'] = {'forceApplicationZMm':wind['sourceDatumsMm']['ff'],'membraneMidplaneZMm':slab_z,
                               'offsetMm':wind['sourceDatumsMm']['ff']-slab_z,
                               'coupleRoute':'Explicit external force-offset couples split by source face position between that face’s two finite corner ports; no vertical slab receiving proof follows.'}
    floor = compile_perforated_floor(bodies,holes,loops,corners,law,request['maxPitchMm'],wind['rows'])
    modes = floor.pop('energyModes')
    port_terms = []
    for corner in corners:
        node = corner['node'];master = model.nodes[node]
        point = [*corner['originXYMm'],slab_z]
        dx,dy,dz = [x-y for x,y in zip(point,master)]
        port_terms.extend([[(node,[1,0,0,0,dz,-dy])],[(node,[0,1,0,-dz,0,dx])],[(node,[0,0,0,0,0,1000])]])
    for index,vector in enumerate(modes):
        by_node = {}
        for coefficient,terms in zip(vector,port_terms):
            for node,row in terms:
                target = by_node.setdefault(node,[0.]*6)
                for axis,value in enumerate(row):
                    target[axis] += coefficient*value
        model.springs.append({'id':'FLOOR/condensed-energy/'+str(index),'terms':list(by_node.items()),'stiffness':1.,'mode':'bilateral','gap':0.})
    for coefficient,terms in zip(floor['condensedForceKN'],port_terms):
        for node,row in terms:
            model.load(node,[coefficient*value for value in row])
    applied = wind['rows']
    projection_couples = []
    for row in applied:
        p = row['pointXYZMm']
        axis = 0 if row['forceKN'][0] else 1
        side = [corner for corner in corners if abs(corner['originXYMm'][axis]-p[axis])<1e-6]
        side.sort(key=lambda corner:corner['originXYMm'][1-axis])
        lo,hi = [corner['originXYMm'][1-axis] for corner in side]
        fraction = (p[1-axis]-lo)/(hi-lo)
        couple = cross([0,0,p[2]-slab_z],row['forceKN'])
        for corner,factor in zip(side,[1-fraction,fraction]):
            moment = [value*factor for value in couple]
            model.load(corner['node'],[0,0,0,*moment])
            projection_couples.append({'node':corner['node'],'momentKNmm':moment,'sourceId':row['id']})
    result = model.solve()
    equilibrium = [0.]*6
    for load in applied:
        equilibrium = [a+b for a,b in zip(equilibrium,_wrench_at(load['forceKN'],load['pointXYZMm'],[0,0,0]))]
    heads = []
    for head in grid['heads']:
        node = head['id'];wrench = result['supportWrenches'][node]
        global_wrench = _wrench_at(wrench[:3],model.nodes[node],[0,0,0])
        global_wrench[3:] = [a+b for a,b in zip(global_wrench[3:],wrench[3:])]
        equilibrium = [a+b for a,b in zip(equilibrium,global_wrench)]
        heads.append({'id':node,'xyzMm':model.nodes[node],'reactionKN_KNm':[*wrench[:3],*[value/1000 for value in wrench[3:]]],
                      'displacementMmRad':result['displacements'][node]})
    if max(abs(value) for value in equilibrium[:3])>.001 or max(abs(value)/1000 for value in equilibrium[3:])>.01:
        raise ValueError('Distributed-floor coupling loses global six-component equilibrium')
    interfaces = []
    for joint in joints:
        wrench = [0.]*6
        springs = [spring for spring in result['springs'] if spring['id'].startswith(joint['id']+'/')]
        for spring in springs:
            row = next(row for node,row in spring['terms'] if node==joint['upper'])
            wrench = [value-spring['forceKN']*coefficient for value,coefficient in zip(wrench,row)]
        shift = cross([a-b for a,b in zip(model.nodes[joint['upper']],joint['originXYZMm'])],wrench[:3])
        wrench[3:] = [a+b for a,b in zip(wrench[3:],shift)]
        interfaces.append({**joint,'forceOnUpperKN_KNm':[*wrench[:3],*[value/1000 for value in wrench[3:]]],
                           'compressionPatchCount':sum(spring['mode']=='compression' for spring in springs),
                           'activeCompressionPatchCount':sum(spring['mode']=='compression' and spring['active'] for spring in springs),
                           'totalTieTensionKN':math.fsum(spring['forceKN'] for spring in springs if spring['mode']=='tension'),
                           'upperDisplacementMmRad':result['displacements'][joint['upper']],
                           'lowerDisplacementMmRad':result['displacements'][joint['lower']]})
    port_displacements = []
    for terms in port_terms:
        port_displacements.append(math.fsum(value*result['displacements'][node][axis] for node,row in terms for axis,value in enumerate(row)))
    port_forces = [math.fsum(value*u for value,u in zip(row,port_displacements))-applied for row,applied in zip(floor['condensedStiffnessKNPerMm'],floor['condensedForceKN'])]
    floor['compatiblePortDisplacements'] = port_displacements
    floor['forceOnFloorAtPortsKN_KNmm'] = [{'id':corner['id'],'forceXYZKN':[port_forces[3*index],port_forces[3*index+1],0.],
                                          'momentXYZKNmm':[0.,0.,1000*port_forces[3*index+2]]}
                                         for index,corner in enumerate(corners)]
    floor['condensedPortStrainEnergyKNmm'] = math.fsum(port_displacements[i]*value*port_displacements[j]/2 for i,row in enumerate(floor['condensedStiffnessKNPerMm']) for j,value in enumerate(row))
    output = {'schema':'str-distributed-floor-result/1','sourceSHA256':source['identities'],'status':'four-wall-diaphragm-coupled-comparison',
            'request':request,'floor':floor,'unmodelledIntermediateReceivingPorts':native_intermediate_support_ports(source),'windBoundary':wind,'applied':applied,'projectionCouples':projection_couples,'heads':heads,'interfaces':interfaces,
            'nodeCount':len(model.nodes),'memberCount':len(model.members),'activeSetIterations':result['iterations'],
            'equilibriumResidualKN_KNm':[*equilibrium[:3],*[value/1000 for value in equilibrium[3:]]],
            'maximumFreeResidualKNOrKNmm':result['maximumFreeResidualKNOrKNmm'],
            'installedAcceptance':False,'completeHouseProof':False,'completeSpliceDemand':None,
            'missingPorts':[
                {'id':'ROOF/successor','missing':'Actual tied-roof stiffness, changed vertical datums, six-component wall-head actions and connections.'},
                {'id':'FLOOR/intermediate-wall-supports','missing':'Finite masonry/arch/portal vertical and lateral receiving laws and stiffness; these are not assigned invented restraints.'},
                {'id':'FLOOR/vertical-plate-and-upstands','missing':'Slab plate flexure, full750/650mm upstand eccentricity, combined strong/weak-axis reinforcement, gravity seating and local collector actions.'},
                {'id':'GROUND/dry-side-floor','missing':'The new moisture section and complete gravity/precompression path; no retained floor/core families or dry-ground-slab mass are imported.'},
                {'id':'DPC/physical-joint','missing':'Qualified spring/contact/shear/retention behavior, pressure/shear resistance, partial-contact convergence and thermal/shrinkage stages.'}],
            'diagnostics':[
                'Explicit200mm-deep conventional slab-level bands replace the union-cut collector regions; no RC field or full upstand stiffness is counted twice. Axial rigidity is separately authored steel-only chordEA, not gross uncracked RC tension stiffness.',
                'Width140..300mm is an authored conventional replacement, not approval of reinforcement, cage, arch, sill, services, rooms or construction. All such applicability is invalidated.',
                'All actual retained source floor bodies and known apertures are used. Circular apertures are removed as bounding squares. This omits additional material but is not a guaranteed conservative bound on individual reactions or local stress; the entire unknown principal wet territory is withheld.',
                'This is membrane and edge-plan stiffness only. No vertical plate stiffness or existing upstand stiffness is inferred. condensedPortStrainEnergyKNmm excludes the load-only internal condensation energy and is not total physical floor strain energy.',
                f'Native first-floor pressure acts continuously on actual band nodes and is condensed with the perforated floor. Its{wind["planeProjection"]["offsetMm"]:g}mm force-to-midplane offset is preserved as explicit external couples split along the loaded corner line; this boundary projection is not local vertical slab proof.',
                f'Only the source native first-floor lateral wind band is applied. Source roof{wind["sourceDatumsMm"]["rr"]:g}/floor{wind["sourceDatumsMm"]["ff"]:g}mm remain inherited comparison datums, not reconciled roof/occupied-floor heights. All96 native programme identities are supported; courtProjection has no effect on this floor-only external band.',
                'The same52-head grid, four finite L walls and explicit unqualified joint laws share one compatible solution. Ideal head translation restraint and rigid lower cap transfers remain comparison assumptions.',
                'Aperture edits invalidate source service-route, host, local trimmer and reinforcement applicability. No existing clearance or local resistance result is inherited.',
                'No roof reaction, old floor/core retained family, gravity/precompression, filled-opening weight or historical foundation action is imported. Complete-house use rejects explicitly.'
            ]}
    from distributed_floor_views import render_distributed_floor
    output['drawings'] = {'floor.svg':render_distributed_floor(output)}
    return output


def compile_distributed_floor_sweep(request, source):
    _admit_distributed(request,source)
    cases = []
    baseline = None
    for wind in range(48):
        case = copy.deepcopy(request)
        case['boundaryCase']['windIndex'] = wind
        result = compile_distributed_floor(case,source)
        if baseline is None:
            baseline = result
        cases.append({key:result[key] for key in ('windBoundary','heads','interfaces','equilibriumResidualKN_KNm','maximumFreeResidualKNOrKNmm','activeSetIterations')})
    for wind in range(48,96):
        case = copy.deepcopy(cases[wind-48])
        projection = case['windBoundary']['planeProjection']
        case['windBoundary'] = _native_floor_wind(source,wind,source['retained']['policy']['axes'])
        case['windBoundary']['planeProjection'] = projection
        case['windBoundary']['planeProjection'] = copy.deepcopy(cases[wind-48]['windBoundary']['planeProjection'])
        case['reuseReason'] = 'Same exact floor-only external pressure and constitutive geometry as windIndex−48; court projection affects omitted roof actions only.'
        cases.append(case)
    return {'schema':'str-distributed-floor-sweep/1','sourceSHA256':source['identities'],'caseCount':len(cases),
            'headCountPerCase':52,'floor':baseline['floor'],'drawings':baseline['drawings'],'missingPorts':baseline['missingPorts'],
            'unmodelledIntermediateReceivingPorts':baseline['unmodelledIntermediateReceivingPorts'],
            'maximumEquilibriumResidualKN_KNm':max(abs(value) for case in cases for value in case['equilibriumResidualKN_KNm']),
            'cases':cases,'installedAcceptance':False,'completeHouseProof':False,
            'scope':'All96 native signed first-floor lateral band programme identities on the same actual52-head, four-wall, perforated-diaphragm comparison. No complete source house gravity/roof/wind proof is inferred.'}


if __name__=='__main__':
    source = load_distributed_floor_source(Path(__file__).resolve().parents[3])
    if sys.argv[1:]==['--read']:
        print(json.dumps(reference_distributed_floor_request(source),allow_nan=False))
    elif sys.argv[1:]==['--sweep']:
        print(json.dumps(compile_distributed_floor_sweep(json.load(sys.stdin),source),allow_nan=False))
    else:
        print(json.dumps(compile_distributed_floor(json.load(sys.stdin),source),allow_nan=False))
