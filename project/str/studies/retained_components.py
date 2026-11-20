import ast
import copy
import hashlib
import json
import math
from pathlib import Path
import sys

from retained_component_geometry import net_rectangle_moments, rectangles_overlap


SOURCE_PATHS = (
    'project/had/studies/water-replan.json',
    'project/str/studies/open-loggia-support.json',
    'project/str/studies/physical-slab-join.json',
    'project/str/studies/current-house-head-actions.py',
    'project/str/studies/current-house-head-actions.json',
    'project/str/studies/current-house-floor-closure.py',
    'project/str/studies/current-house-floor-closure.json',
    'project/str/studies/current-house-membrane.py',
    'project/str/studies/current-house-lateral.json',
    'project/mat/studies/whole-house-service-baseline.json',
    'project/str/studies/retained_component_geometry.py',
)
FLOOR_FAMILY = 'retained RC floor edge share'
WALL_FAMILY = 'retained upper solid core'


def _digest(value):
    return hashlib.sha256(json.dumps(value,sort_keys=True,separators=(',',':'),allow_nan=False).encode()).hexdigest()


def _finite(value):
    return type(value) in (int,float) and math.isfinite(value)


def _exact(value, fields, name):
    if not isinstance(value,dict) or set(value)!=set(fields):
        raise ValueError('Expected exact '+name+' fields')


def _multiplication(node):
    if isinstance(node,ast.BinOp) and isinstance(node.op,ast.Mult):
        a,b = _multiplication(node.left),_multiplication(node.right)
        return [*a,*b]
    if isinstance(node,ast.Constant) and type(node.value) in (int,float):
        return [node.value]
    if isinstance(node,ast.Name):
        return [node.id]
    raise ValueError('The retained source minimum expression needs an explicitly updated adapter')


def _source_policy(text):
    tree = ast.parse(text)
    slab,wall,axes,reservation = None,None,None,None
    arch = set()
    end_clearance = set()
    for node in ast.walk(tree):
        if isinstance(node,ast.Assign):
            if any(isinstance(target,ast.Name) and target.id=='slabMin' for target in node.targets):
                slab = _multiplication(node.value)
            if any(isinstance(target,ast.Name) and target.id=='netTrib' for target in node.targets):
                expression = node.value
                calls = [child for child in ast.walk(expression) if isinstance(child,ast.Call) and isinstance(child.func,ast.Name) and child.func.id=='max']
                if len(calls)!=1 or len(calls[0].args)!=2 or not isinstance(calls[0].args[0],ast.Constant) or calls[0].args[0].value!=0:
                    raise ValueError('Unsupported source floor material reservation')
                subtraction = calls[0].args[1]
                if not isinstance(subtraction,ast.BinOp) or not isinstance(subtraction.op,ast.Sub) or not isinstance(subtraction.right,ast.Constant):
                    raise ValueError('Unsupported source floor material reservation')
                reservation = subtraction.right.value
            if any(isinstance(target,ast.Tuple) and [x.id for x in target.elts if isinstance(x,ast.Name)]==['A','B','C','E'] for target in node.targets):
                axes = ast.literal_eval(node.value)
            if any(isinstance(target,ast.Name) and target.id=='cuts' for target in node.targets) and isinstance(node.value,ast.Set):
                for value in node.value.elts:
                    if isinstance(value,ast.BinOp) and isinstance(value.left,ast.Name) and value.left.id in ('lo','hi') and isinstance(value.right,ast.Constant):
                        end_clearance.add(value.right.value)
            if any(isinstance(target,ast.Name) and target.id=='holes' for target in node.targets) and isinstance(node.value,ast.ListComp) and isinstance(node.value.elt,ast.Tuple):
                for value in node.value.elt.elts:
                    if isinstance(value,ast.BinOp) and isinstance(value.right,ast.Constant):
                        arch.add(value.right.value)
        if isinstance(node,ast.Call) and isinstance(node.func,ast.Name) and node.func.id=='feed' and node.args and isinstance(node.args[0],ast.Constant) and node.args[0].value==WALL_FAMILY:
            wall = _multiplication(node.args[2])
    if slab is None or len(slab)!=3 or wall is None or len(wall)!=6 or wall[-1]!='l' or axes is None or len(arch)!=1 or len(end_clearance)!=1 or not _finite(reservation) or reservation<=0:
        raise ValueError('The source retained-minimum policy is outside the supported declaration grammar')
    if not all(_finite(value) and value>0 for value in slab+wall[:-1]):
        raise ValueError('Invalid source lower-weight declaration')
    return {
        'floor':{'comparisonFactor':slab[0],'minimumThicknessMm':slab[1]*1000,'minimumUnitWeightKNPerM3':slab[2],
                 'materialReservationEachSideMm':reservation*1000},
        'wall':{'comparisonFactor':wall[0],'clearLengthFraction':wall[1],'minimumCoreWidthMm':wall[2]*1000,
                'minimumHeightMm':wall[3]*1000,'minimumUnitWeightKNPerM3':wall[4],
                'openingArchReservationEachSideMm':next(iter(arch)),'endExclusionMm':next(iter(end_clearance))},
        'axes':dict(zip(('A','B','C','E'),axes)),
        'authority':'Existing retained-shell comparison lower bounds and delivery conditions; no material, tie or installed-performance admission.',
    }


def load_retained_source(root):
    root = Path(root)
    identities,values,texts = {},{},{}
    for path in SOURCE_PATHS:
        raw = (root/path).read_bytes()
        identities[path] = hashlib.sha256(raw).hexdigest()
        if path.endswith('.json'):
            values[path] = json.loads(raw)
        else:
            texts[path] = raw.decode()
    policy = _source_policy(texts['project/str/studies/current-house-floor-closure.py'])
    return {'schema':'str-retained-component-source/1','identities':identities,'values':values,'texts':texts,'policy':policy}


def reference_retained_request(source):
    return {'schema':'str-retained-components-case/1','sourceSHA256':source['identities'],
            'edits':{'floorApertures':[],'wallOpenings':[]},'retentionPaths':[]}


def _literal_assignment(text, name):
    declarations = [node for node in ast.walk(ast.parse(text)) if isinstance(node,ast.Assign) and any(isinstance(target,ast.Name) and target.id==name for target in node.targets)]
    if len(declarations)!=1:
        raise ValueError('Expected one source geometry declaration '+name)
    return ast.literal_eval(declarations[0].value)


def _apertures(source):
    h = source['values']['project/had/studies/water-replan.json']['model']
    services = source['values']['project/mat/studies/whole-house-service-baseline.json']
    result = []
    for name in ('court','stair','void'):
        x,y,w,d = h[name]
        result.append({'id':'FLOOR-VOID/'+name,'shape':{'kind':'rectangle','boundsXYMm':[x,y,x+w,y+d]},'source':'project/had/studies/water-replan.json'})
    membrane = ast.parse(source['texts']['project/str/studies/current-house-membrane.py'])
    expected_base = ast.parse("[[r[0],r[1],r[0]+r[2],r[1]+r[3]] for r in [H['court'],H['stair'],H['void']]]",mode='eval').body
    definitions,adjustments = 0,0
    for node in membrane.body:
        if isinstance(node,ast.Assign) and any(isinstance(target,ast.Name) and target.id=='holes' for target in node.targets):
            definitions += 1
            if not isinstance(node.value,ast.BinOp) or not isinstance(node.value.op,ast.Add) or ast.dump(node.value.left)!=ast.dump(expected_base):
                raise ValueError('Unsupported source floor aperture expression; no holes may be silently dropped')
            extras = ast.literal_eval(node.value.right)
            if not isinstance(extras,list):
                raise ValueError('An explicit source extra-aperture list is required')
            for index,rectangle in enumerate(extras):
                _admit_shape({'kind':'rectangle','boundsXYMm':rectangle})
                result.append({'id':'FLOOR-APERTURE/rear-well-'+str(index),'shape':{'kind':'rectangle','boundsXYMm':rectangle},'source':'project/str/studies/current-house-membrane.py'})
        if isinstance(node,ast.Assign) and any(isinstance(target,ast.Subscript) and ast.unparse(target)=='holes[1][0]' for target in node.targets):
            adjustments += 1
            expression = node.value
            if not isinstance(expression,ast.BinOp) or not isinstance(expression.op,ast.Add) or not isinstance(expression.left,ast.Name) or expression.left.id!='A' or not isinstance(expression.right,ast.Constant):
                raise ValueError('Unsupported source stair edge interpretation')
            result[1]['shape']['boundsXYMm'][0] = source['policy']['axes']['A']+expression.right.value
    if definitions!=1 or adjustments!=1:
        raise ValueError('Exactly one supported source aperture definition and stair-edge adjustment are required')
    for node in ast.walk(membrane):
        if isinstance(node,(ast.AugAssign,ast.AnnAssign)) and ast.unparse(node.target).startswith('holes'):
            raise ValueError('Unsupported source aperture mutation')
        if isinstance(node,ast.Assign):
            for target in node.targets:
                if isinstance(target,ast.Subscript) and ast.unparse(target).startswith('holes[') and ast.unparse(target)!='holes[1][0]':
                    raise ValueError('Unsupported source aperture mutation')
        if isinstance(node,ast.Call) and isinstance(node.func,ast.Attribute) and isinstance(node.func.value,ast.Name) and node.func.value.id=='holes':
            raise ValueError('Unsupported source aperture mutation')
    x,y,w,d = services['plant']['formedOpeningProposal']
    result.append({'id':'FLOOR-APERTURE/plant-riser','shape':{'kind':'rectangle','boundsXYMm':[x,y,x+w,y+d]},'source':'project/mat/studies/whole-house-service-baseline.json'})
    for name,data in [('rear-soil',services['interfaces']['rearSource27']['retainedFloorPort']),
                      ('rear-shower',services['interfaces']['rearShowerDrop']['port']),
                      ('family-soil',services['interfaces']['familyWetRoom']['port'])]:
        x,y,diameter = data
        result.append({'id':'FLOOR-APERTURE/'+name,'shape':{'kind':'circle','centreXYMm':[x,y],'diameterMm':diameter},'source':'project/mat/studies/whole-house-service-baseline.json'})
    bath = services['interfaces']['familyBathDrop']['port']
    result.append({'id':'FLOOR-APERTURE/family-bath','shape':{'kind':'circle','centreXYMm':bath['centre'],'diameterMm':bath['formedDiameter']},'source':'project/mat/studies/whole-house-service-baseline.json'})
    return result


def _admit_shape(shape):
    if not isinstance(shape,dict):
        raise ValueError('A finite explicit aperture shape is required')
    if shape.get('kind')=='rectangle':
        _exact(shape,('kind','boundsXYMm'),'rectangle aperture')
        r = shape['boundsXYMm']
        if not isinstance(r,list) or len(r)!=4 or not all(map(_finite,r)) or not r[0]<r[2] or not r[1]<r[3]:
            raise ValueError('Invalid finite rectangular aperture')
    elif shape.get('kind')=='circle':
        _exact(shape,('kind','centreXYMm','diameterMm'),'circular aperture')
        if not isinstance(shape['centreXYMm'],list) or len(shape['centreXYMm'])!=2 or not all(map(_finite,shape['centreXYMm'])) or not _finite(shape['diameterMm']) or shape['diameterMm']<=0:
            raise ValueError('Invalid finite circular aperture')
    else:
        raise ValueError('Unsupported aperture topology')


def _admit(request, source):
    _exact(request,('schema','sourceSHA256','edits','retentionPaths'),'retained component case')
    if request['schema']!='str-retained-components-case/1' or request['sourceSHA256']!=source['identities']:
        raise ValueError('Stale or unsupported retained-component source identity')
    _exact(request['edits'],('floorApertures','wallOpenings'),'retained geometry edits')
    if not isinstance(request['retentionPaths'],list) or not all(isinstance(request['edits'][key],list) for key in ('floorApertures','wallOpenings')):
        raise ValueError('Explicit retention paths and edit lists are required')


def _floor_reservations(source):
    axes = source['policy']['axes']
    half = source['policy']['floor']['materialReservationEachSideMm']
    rows = []
    for family,lo,hi in [('outer',axes['A'],axes['B']),('court',axes['C'],axes['E'])]:
        for face,axis,datum in [('south',0,lo),('east',1,hi),('north',0,hi),('west',1,lo)]:
            rectangle = [lo,datum-half,hi,datum+half] if axis==0 else [datum-half,lo,datum+half,hi]
            rows.append({'id':'FLOOR-MATERIAL-RESERVATION/'+family+'-'+face,
                         'shape':{'kind':'rectangle','boundsXYMm':rectangle},
                         'source':'project/str/studies/current-house-floor-closure.py',
                         'meaning':'Source 80 mm each-side non-RC edge reservation; omit from RC credit without crediting replacement steel or selecting collector hardware.'})
    return rows


def _floor_components(source, apertures, reservations):
    floor = source['values']['project/str/studies/open-loggia-support.json']
    residual = source['values']['project/str/studies/physical-slab-join.json']
    rectangles = []
    for row in floor['floor_fields']:
        rectangles.append(('FF/FIELD/'+row['id'],row['rectangle']))
    rectangles.append(('FF/BRIDGE/entrance',_literal_assignment(source['texts']['project/str/studies/current-house-head-actions.py'],'bridge')))
    rectangles.extend(('FF/RESIDUAL/'+str(index).zfill(3),row['rect']) for index,row in enumerate(residual['cells']))
    for index,(name,left) in enumerate(rectangles):
        if any(rectangles_overlap(left,right) for _,right in rectangles[index+1:]):
            raise ValueError('Current floor component bodies overlap; their mass cannot be counted twice')
    h = source['values']['project/had/studies/water-replan.json']['model']
    principal = h['rooms']['principalBath']
    unknown = [principal['westFinishedFace'],principal['southFinishedFace'],principal['eastFinishedFace'],principal['northFinishedFace']]
    rectangular = [row['shape']['boundsXYMm'] for row in apertures+reservations if row['shape']['kind']=='rectangle']
    circular = [row['shape'] for row in apertures if row['shape']['kind']=='circle']
    policy = source['policy']['floor']
    rate = policy['comparisonFactor']*policy['minimumThicknessMm']/1000*policy['minimumUnitWeightKNPerM3']
    components = []
    for name,body in rectangles:
        area,mx,my = net_rectangle_moments(body,rectangular,circular)
        area_m2 = max(0.,area)/1e6
        centroid = [mx/area,my/area] if area>1e-6 else None
        reasons = ['PRINCIPAL_WET_FLOOR_APERTURE_INVENTORY_INCOMPLETE'] if rectangles_overlap(body,unknown) else []
        if centroid is None:reasons.append('NO_RETAINED_MATERIAL')
        weight = area_m2*rate
        applicable = []
        applicable_reservations = []
        for row in apertures+reservations:
            shape = row['shape']
            if shape['kind']=='rectangle':
                envelope = shape['boundsXYMm']
            else:
                x,y = shape['centreXYMm'];radius = shape['diameterMm']/2
                envelope = [x-radius,y-radius,x+radius,y+radius]
            if rectangles_overlap(body,envelope):
                target = applicable_reservations if row in reservations else applicable
                target.append({'id':row['id'],'shape':shape})
        a,b,c,d = body
        vector = [weight,weight*centroid[0]/1000,weight*centroid[1]/1000] if centroid else [0.,0.,0.]
        components.append({'id':name,'kind':'first-floor','replacementFamily':FLOOR_FAMILY,
                           'geometry':{'bodyRectangleXYMm':body,'netAreaM2':area_m2,'centroidXYMm':centroid,
                                       'outerPolygonXYMm':[[a,b],[c,b],[c,d],[a,d]],
                                       'apertures':applicable,'apertureIds':[row['id'] for row in applicable],
                                       'materialReservations':applicable_reservations},
                           'lowerBounds':policy,'lowerWeightKN':weight,
                           'lowerVectorN_Xfirst_Yfirst':vector,
                           'lowerVectorEnvelopeN_Xfirst_Yfirst':{'minimum':vector,'maximum':vector},
                           'intrinsicWithholding':reasons})
    return components


def _wall_services(source):
    rows = []
    for service in source['values']['project/mat/studies/whole-house-service-baseline.json']['extract']:
        if service['level']!=1:
            continue
        face = service['wall']
        if face not in ('south','east','north','west'):
            raise ValueError('Unsupported upper-wall service face')
        axis = 0 if face in ('south','north') else 1
        for suffix,point,width in [('extract',service['path'][-1],service['formedWallTerritory']),
                                   ('condensate',service['ceilingTrapDrainPort']['centre'],service['ceilingTrapDrainPort']['formedDiameter'])]:
            if not _finite(width) or width<=0 or len(point)!=3 or not all(map(_finite,point)):
                raise ValueError('Invalid source upper-wall service territory')
            rows.append({'id':'WALL-SERVICE/'+service['id']+'/'+suffix,'wall':'outer-'+face,
                         'intervalMm':[point[axis]-width/2,point[axis]+width/2],'sourceCentreXYZMm':point,
                         'source':'project/mat/studies/whole-house-service-baseline.json',
                         'meaning':'Full-height conservative omission of the actual authored along-wall service territory; no local lintel or penetration acceptance.'})
    return rows


def retained_interval_extreme(bands, fraction, high=False):
    if not _finite(fraction) or not 0<fraction<=1 or any(not left<right for left,right in bands):
        raise ValueError('Invalid retained clear-band fraction')
    remaining = math.fsum(right-left for left,right in bands)*fraction
    retained = []
    for left,right in reversed(bands) if high else bands:
        length = min(remaining,right-left)
        if length>1e-10:
            retained.append([right-length,right] if high else [left,left+length])
        remaining -= length
    if abs(remaining)>1e-7:
        raise ValueError('The retained clear-band extreme failed to conserve material')
    return sorted(retained)


def _moment_of_bands(bands):
    return math.fsum((right-left)*(left+right)/2 for left,right in bands)


def _wall_components(source, openings):
    axes = source['policy']['axes']
    a,b,c,e = (axes[key] for key in ('A','B','C','E'))
    policy = source['policy']['wall']
    clear,arch = policy['endExclusionMm'],policy['openingArchReservationEachSideMm']
    rate = policy['comparisonFactor']*policy['minimumCoreWidthMm']/1000*policy['minimumHeightMm']/1000*policy['minimumUnitWeightKNPerM3']
    services = _wall_services(source)
    components = []
    for family,lo,hi in [('outer',a,b),('court',c,e)]:
        for face,axis,datum in [('south',0,lo),('east',1,hi),('north',0,hi),('west',1,lo)]:
            wall = family+'-'+face
            holes = [(row['centre']-row['width']/2-arch,row['centre']+row['width']/2+arch) for row in openings if row['wall']==wall]
            service_holes = [row for row in services if row['wall']==wall]
            holes.extend(tuple(row['intervalMm']) for row in service_holes)
            cuts = sorted({lo+clear,hi-clear,*[value for pair in holes for value in pair if lo+clear<value<hi-clear]})
            bands = [(left,right) for left,right in zip(cuts,cuts[1:]) if not any(left0<(left+right)/2<right0 for left0,right0 in holes)]
            length = math.fsum(right-left for left,right in bands)
            along = math.fsum((right-left)*(left+right)/2 for left,right in bands)/length if length else None
            centroid = ([along,datum] if axis==0 else [datum,along]) if along is not None else None
            weight = length/1000*rate*policy['clearLengthFraction']
            low_bands = retained_interval_extreme(bands,policy['clearLengthFraction'])
            high_bands = retained_interval_extreme(bands,policy['clearLengthFraction'],True)
            low_along = _moment_of_bands(low_bands)/(length*policy['clearLengthFraction']) if length else None
            high_along = _moment_of_bands(high_bands)/(length*policy['clearLengthFraction']) if length else None
            low_centroid = ([low_along,datum] if axis==0 else [datum,low_along]) if length else None
            high_centroid = ([high_along,datum] if axis==0 else [datum,high_along]) if length else None
            low_vector = [weight,weight*low_centroid[0]/1000,weight*low_centroid[1]/1000] if length else [0.,0.,0.]
            high_vector = [weight,weight*high_centroid[0]/1000,weight*high_centroid[1]/1000] if length else [0.,0.,0.]
            polygons = []
            half = policy['minimumCoreWidthMm']/2
            for left,right in bands:
                a,b,c,d = [left,datum-half,right,datum+half] if axis==0 else [datum-half,left,datum+half,right]
                polygons.append([[a,b],[c,b],[c,d],[a,d]])
            components.append({'id':'WALL/FULL-HEIGHT/'+wall,'kind':'upper-wall','replacementFamily':WALL_FAMILY,
                               'geometry':{'wallId':wall,'clearIntervalsMm':[list(pair) for pair in bands],'netLengthM':length/1000,'centroidXYMm':centroid,
                                           'polygonsXYMm':polygons,'omittedOpeningIntervalsMm':[list(pair) for pair in holes],
                                           'serviceOmissions':service_holes,
                                           'centroidBasis':'Uniform remaining-material comparison only. Global contact must test the four combined adverse first-moment vertices.',
                                           'extremeRetainedIntervalsMm':{'minimumAlongMoment':low_bands,'maximumAlongMoment':high_bands},
                                           'retainedCentroidRangeXYMm':{'minimum':low_centroid,'maximum':high_centroid},
                                           'omittedMaterial':'All opening and radial arch projection zones, full-height known service territories, head masonry, weather leaf, end joints, corner overlaps and fitout.'},
                               'lowerBounds':policy,'lowerWeightKN':weight,
                               'lowerVectorN_Xfirst_Yfirst':[weight,weight*centroid[0]/1000,weight*centroid[1]/1000] if centroid else [0.,0.,0.],
                               'lowerVectorEnvelopeN_Xfirst_Yfirst':{'minimum':low_vector,'maximum':high_vector},
                               'intrinsicWithholding':[] if centroid else ['NO_RETAINED_MATERIAL']})
    return components


def evaluate_retained_components(request, source):
    _admit(request,source)
    apertures = copy.deepcopy(_apertures(source))
    by_aperture = {row['id']:row for row in apertures}
    seen = set()
    for edit in request['edits']['floorApertures']:
        _exact(edit,('id','shape'),'floor aperture edit')
        if edit['id'] not in by_aperture or edit['id'] in seen:
            raise ValueError('Unknown or duplicate stable floor aperture ID')
        if edit['id'].startswith('FLOOR-VOID/'):
            raise ValueError('Structural floor-void edits require regenerated source floor bodies')
        _admit_shape(edit['shape']);seen.add(edit['id'])
        if edit['shape']['kind']!=by_aperture[edit['id']]['shape']['kind']:
            raise ValueError('Changing aperture topology requires a new authored source')
        shape = edit['shape']
        if shape['kind']=='rectangle':
            bounds = shape['boundsXYMm']
        else:
            x,y = shape['centreXYMm'];radius = shape['diameterMm']/2
            bounds = [x-radius,y-radius,x+radius,y+radius]
        axes = source['policy']['axes']
        if bounds[0]<axes['A'] or bounds[1]<axes['A'] or bounds[2]>axes['B'] or bounds[3]>axes['B']:
            raise ValueError('The edited aperture must remain inside the source structural-axis floor envelope')
        by_aperture[edit['id']]['shape'] = edit['shape']
    h = source['values']['project/had/studies/water-replan.json']['model']
    openings = copy.deepcopy(h['openings']['FIRST'])
    by_opening = {row['id']:row for row in openings}
    seen = set()
    for edit in request['edits']['wallOpenings']:
        _exact(edit,('id','centreMm','widthMm'),'wall opening edit')
        if edit['id'] not in by_opening or edit['id'] in seen or not _finite(edit['centreMm']) or not _finite(edit['widthMm']) or edit['widthMm']<=0:
            raise ValueError('Unknown, duplicate or invalid stable wall opening edit')
        axes = source['policy']['axes']
        limits = (axes['A'],axes['B']) if by_opening[edit['id']]['wall'].startswith('outer-') else (axes['C'],axes['E'])
        if edit['centreMm']-edit['widthMm']/2 < limits[0] or edit['centreMm']+edit['widthMm']/2 > limits[1]:
            raise ValueError('The edited opening must remain inside its actual source wall')
        seen.add(edit['id']);by_opening[edit['id']].update(centre=edit['centreMm'],width=edit['widthMm'])
    reservations = _floor_reservations(source)
    components = [*_floor_components(source,apertures,reservations),*_wall_components(source,openings)]
    components.append({'id':'GROUND-SLAB/current-connected-RC200','kind':'ground-slab','replacementFamily':None,
                       'geometry':{'netAreaM2':source['values']['project/str/studies/current-house-head-actions.json']['surfaceComparators']['groundFields']['dry slab'],
                                   'centroidXYMm':None,'sourceDpcZMm':source['values']['project/str/studies/current-house-lateral.json']['capillarySplice']['plateZ']},
                       'lowerBounds':None,'lowerWeightKN':None,'lowerVectorN_Xfirst_Yfirst':[0.,0.,0.],
                       'lowerVectorEnvelopeN_Xfirst_Yfirst':{'minimum':[0.,0.,0.],'maximum':[0.,0.,0.]},
                       'intrinsicWithholding':['GROUND_SLAB_BYPASSES_WALL_DPC','NO_AUTHORED_DRY_SIDE_SECTION']})
    for component in components:
        component['componentDigest'] = _digest(component)
    by_component = {row['id']:row for row in components}
    paths = []
    seen = set()
    for path in request['retentionPaths']:
        _exact(path,('id','state','routeDescription','sourceRefs','componentDigests'),'declared retention path')
        if not isinstance(path['id'],str) or not path['id'] or path['id'] in seen or path['state'] not in ('declared-comparison','unresolved'):
            raise ValueError('Invalid or duplicate retention path identity/state')
        if not isinstance(path['routeDescription'],str) or (path['state']=='declared-comparison' and not path['routeDescription'].strip()):
            raise ValueError('A declared path must name its actual intended retention route')
        if not isinstance(path['sourceRefs'],dict) or set(path['sourceRefs'])!=set(source['identities']):
            raise ValueError('Retention path needs the complete controlling source reference set')
        if not isinstance(path['componentDigests'],dict) or not path['componentDigests'] or any(key not in by_component for key in path['componentDigests']):
            raise ValueError('Retention path needs known stable component identities')
        seen.add(path['id']);paths.append(path)
    credited = {FLOOR_FAMILY:[0.,0.,0.],WALL_FAMILY:[0.,0.,0.]}
    envelope = {family:{bound:[0.,0.,0.] for bound in ('minimum','maximum')} for family in credited}
    for component in components:
        reasons = list(component['intrinsicWithholding'])
        valid = []
        associated = [path for path in paths if component['id'] in path['componentDigests']]
        for path in associated:
            if path['state']=='unresolved':
                reasons.append('RETENTION_PATH_UNRESOLVED');continue
            if path['componentDigests'][component['id']]!=component['componentDigest'] or any(source['identities'][key]!=value for key,value in path['sourceRefs'].items()):
                reasons.append('RETENTION_PATH_EVIDENCE_STALE');continue
            valid.append(path['id'])
        if not associated:reasons.append('NO_DECLARED_RETENTION_PATH')
        accept = bool(valid) and not component['intrinsicWithholding']
        component['creditedVectorN_Xfirst_Yfirst'] = component['lowerVectorN_Xfirst_Yfirst'] if accept else [0.,0.,0.]
        component['creditedVectorEnvelopeN_Xfirst_Yfirst'] = component['lowerVectorEnvelopeN_Xfirst_Yfirst'] if accept else {'minimum':[0.,0.,0.],'maximum':[0.,0.,0.]}
        component['creditedWeightKN'] = component['creditedVectorN_Xfirst_Yfirst'][0]
        component['retention'] = {'state':'declared-comparison' if accept else 'withheld','pathIds':valid,'reasons':sorted(set(reasons))}
        if accept:
            family = component['replacementFamily']
            credited[family] = [a+b for a,b in zip(credited[family],component['creditedVectorN_Xfirst_Yfirst'])]
            for bound in ('minimum','maximum'):
                envelope[family][bound] = [a+b for a,b in zip(envelope[family][bound],component['creditedVectorEnvelopeN_Xfirst_Yfirst'][bound])]
    vertices = {family:[[bounds['minimum'][0],bounds[x][1],bounds[y][2]] for x,y in [('minimum','minimum'),('minimum','maximum'),('maximum','minimum'),('maximum','maximum')]] for family,bounds in envelope.items()}
    return {
        'schema':'str-retained-components-result/1','status':'conditional-retained-account','sourceSHA256':source['identities'],
        'caseDigest':_digest(request),'lowerBoundPolicies':source['policy'],'floorApertures':apertures,
        'floorMaterialReservations':reservations,'components':components,
        'replacement':{'replacedFamilies':[FLOOR_FAMILY,WALL_FAMILY],'creditedByFamily':credited,
                       'creditedEnvelopeVerticesByFamily':vertices,
                       'rule':'Remove both original retained floor/core families before inserting these credited vectors, including zero vectors when paths are unresolved.'},
        'installedAcceptance':False,'completeSpliceDemand':None,
        'diagnostics':[
            'Lower densities/thicknesses and reduction factors are the existing retained-shell comparison delivery bounds, not installed material evidence.',
            'A declared path is an explicit unqualified retention proposal, not proof of force distribution, joint capacity or physical acceptance.',
            'Principal wet-room floor aperture inventory is incomplete in these controlling sources; intersecting floor components remain withheld even with a declared path.',
            'The connected ground RC slab bypasses the wall DPC and cannot be credited without an actual authored dry-side section; this method supplies no such redesign.',
            'Upper wall quantities retain only source-declared clear full-height bands. They omit gross filled openings, head masonry, weather leaves, end zones, overlaps and fitout.',
            'Known level-1 ventilation and condensate wall territories are separately omitted for their full height. The remaining unknown 25 percent clear-band loss is not assumed uniformly positioned: test all four achievable combined XY first-moment vertices for every global contact case.',
            'Retention of at least 75 percent of each remaining wall clear-band material is an unproved source delivery condition. Actual loss beyond this bound invalidates the conditional first-moment envelope.',
            'Source 80 mm each-side collector reservations are union-subtracted separately from actual floor apertures. No rolled steel or replacement integral-RC collector mass is credited, and no hardware selection is implied.',
            'The catalogue provides signed replacement bookkeeping and global necessary-condition inputs only; it does not prove local DPC shear/bearing, diaphragm continuity, roof allocation or foundation capacity.',
        ],
    }


def retained_replacement_delta(result, origins):
    if not isinstance(result,dict) or result.get('schema')!='str-retained-components-result/1':
        raise ValueError('Expected an actual retained component result')
    removed = {}
    for family in (FLOOR_FAMILY,WALL_FAMILY):
        rows = [row for row in origins if row['family']==family and row['case']=='retainedMin']
        if len(rows)!=1 or len(rows[0]['N_Xmoment_Ymoment'])!=3 or not all(map(_finite,rows[0]['N_Xmoment_Ymoment'])):
            raise ValueError('The actual native retained family is missing or duplicated: '+family)
        removed[family] = rows[0]['N_Xmoment_Ymoment']
    credited = result['replacement']['creditedByFamily']
    if not isinstance(credited,dict) or set(credited)!={FLOOR_FAMILY,WALL_FAMILY} or result['replacement']['replacedFamilies']!=[FLOOR_FAMILY,WALL_FAMILY]:
        raise ValueError('Both actual retained families must be replaced exactly once')
    for family,vector in credited.items():
        if not isinstance(vector,list) or len(vector)!=3 or not all(map(_finite,vector)) or vector[0]<0:
            raise ValueError('Finite nonnegative component credit is required')
        expected = [math.fsum(row['creditedVectorN_Xfirst_Yfirst'][index] for row in result['components'] if row['replacementFamily']==family) for index in range(3)]
        if any(not math.isclose(actual,target,rel_tol=1e-12,abs_tol=1e-9) for actual,target in zip(vector,expected)):
            raise ValueError('Credited replacement must equal the actual retained component sum')
    removed_total = [math.fsum(row[index] for row in removed.values()) for index in range(3)]
    credited_total = [math.fsum(row[index] for row in credited.values()) for index in range(3)]
    vertices = result['replacement']['creditedEnvelopeVerticesByFamily']
    if set(vertices)!={FLOOR_FAMILY,WALL_FAMILY} or any(not isinstance(rows,list) or len(rows)!=4 or any(not isinstance(row,list) or len(row)!=3 or not all(map(_finite,row)) for row in rows) for rows in vertices.values()):
        raise ValueError('Four finite adverse retained first-moment vertices are required')
    adverse = [[math.fsum(rows[vertex][index] for rows in vertices.values())-removed_total[index] for index in range(3)] for vertex in range(4)]
    return {'removedByFamily':removed,'creditedByFamily':credited,'removedTotal':removed_total,'creditedTotal':credited_total,
            'deltaN_Xfirst_Yfirst':[a-b for a,b in zip(credited_total,removed_total)],
            'adverseDeltaVerticesN_Xfirst_Yfirst':adverse}


if __name__=='__main__':
    source = load_retained_source(Path(__file__).resolve().parents[3])
    if sys.argv[1:]==['--read']:
        print(json.dumps(reference_retained_request(source)))
    else:
        print(json.dumps(evaluate_retained_components(json.load(sys.stdin),source),allow_nan=False))
