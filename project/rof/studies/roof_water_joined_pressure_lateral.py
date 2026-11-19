"""New trial: signed inner normal movement, including the finite renewal states.

Values are relative to the native fixed-base datum. No cancellation with an
unmodelled moving facade is credited. Local frame flexibility is separate.
"""
from pathlib import Path
from contextlib import redirect_stdout
from io import StringIO
import json
import hashlib
import math
import runpy
import sys

HERE = Path(__file__).resolve().parent
ARGS = sys.argv[:]
width = int(next((arg.split('=')[1] for arg in ARGS if arg.startswith('--court-width=')), '280'))
inner_dry_kg_per_m = float(next((arg.split('=')[1] for arg in ARGS if arg.startswith('--inner-dry-kg-per-m=')), '60'))
sys.argv = ['roof_water_joined_pressure_trial.py', f'--court-width={width}', f'--inner-dry-kg-per-m={inner_dry_kg_per_m}']
m = runpy.run_path(str(HERE/'roof_water_joined_pressure_trial.py'))
weighted_sum, linear_combination = m['weighted_sum'], m['linear_combination']
p, models, segments = m['p'], m['models'], m['segments']


def root_point(face, station, name='outer'):
    cuts = p['sides'][face, 'outer' if name == 'outer' else 'inner']
    normal = p['A'] if name == 'outer' else p['C']
    return p['pt'](face, normal, max(cuts[0], min(cuts[-1], station)))


def root_state(displacement, point, load=None, ring_self=None):
    if point in p['nodes']:
        return [displacement[p['vDO'](point, j)] for j in range(3)]
    name = 'court' if all(p['C'] <= value <= p['E'] for value in point) else 'outer'
    seg = m['find_segment'](name, point)
    key, a, b, length, axis = (seg[k] for k in ('key', 'a', 'b', 'length', 'axis'))
    x = point[axis]-a[axis]
    t = x/length
    h, slope = m['shape'](length, x)
    nodal = [displacement[p['vDO'](a, 0)], displacement[p['vDO'](a, axis+1)],
             displacement[p['vDO'](b, 0)], displacement[p['vDO'](b, axis+1)]]
    result = [0.]*3
    result[0] = sum(q*v for q, v in zip(h, nodal))
    result[axis+1] = sum(q*v for q, v in zip(slope, nodal))
    result[2-axis] = (1-t)*displacement[p['vDO'](a, 2-axis)]+t*displacement[p['vDO'](b, 2-axis)]
    sec = models[name]['section']
    EI = p['Es']*sec['I']
    if ring_self == name:
        result[0] += sec['lineG']*x*x*(length-x)**2/(24*EI)
        result[axis+1] += sec['lineG']*x*(length-x)*(length-2*x)/(12*EI)
    if load is not None:
        equivalent = load.vertical[key]
        crossed = [v for v in load.points_v[key] if v[0] < x]
        result[0] += (equivalent[1]*x*x/2-equivalent[0]*x**3/6
                      + sum(force*(x-at)**3/6-moment*(x-at)**2/2 for at, force, moment, _ in crossed))/EI
        result[axis+1] += (equivalent[1]*x-equivalent[0]*x*x/2
                           + sum(force*(x-at)**2/2-moment*(x-at) for at, force, moment, _ in crossed))/EI
        b0, h0, thickness = sec['B'], sec['H'], sec['t']
        J = 4*((b0-thickness)*(h0-thickness))**2/(2*(b0-thickness+h0-thickness)/thickness)
        result[2-axis] += (equivalent[4]*x-sum(torque*(x-at) for at, _, _, torque in crossed))/(77000*J)
    return result


def plan_root_state(displacement, point, load=None):
    if point in p['nodes']:
        return [displacement[p['dof'](point, j)] for j in range(3)]
    name = 'court' if all(p['C'] <= value <= p['E'] for value in point) else 'outer'
    seg = m['find_segment'](name, point)
    key, a, b, length, axis = (seg[k] for k in ('key', 'a', 'b', 'length', 'axis'))
    x = point[axis]-a[axis]; t = x/length
    h, slope = m['shape'](length, x); normal = seg['normal']
    nodal = []
    for endpoint in (a, b):
        nodal.extend((sum(normal[j]*displacement[p['dof'](endpoint,j)] for j in (0,1)),
                      displacement[p['dof'](endpoint,2)]))
    un = sum(v*w for v,w in zip(h,nodal)); yaw = sum(v*w for v,w in zip(slope,nodal))
    axial = (1-t)*displacement[p['dof'](a,axis)]+t*displacement[p['dof'](b,axis)]
    if load is not None:
        sec = models[name]['section']; eq = load.horizontal[key]
        crossed = [row for row in load.points_h[key] if row[0] < x]
        un += load.local_normal_displacement(seg,x)
        yaw += (eq[1]*x-eq[0]*x*x/2+sum(force*(x-at)**2/2-moment*(x-at) for at,force,moment,_ in crossed))/(p['Es']*sec['Iminor'])
        axial += (eq[4]*x-sum(force*(x-at) for at,_,_,force in crossed))/(p['Es']*sec['A'])
    result = [normal[j]*un+(axial if j == axis else 0.) for j in (0,1)]
    return [*result,yaw]


def reference(face, root_at, station=None, q=4325., z=6600., component='body'):
    root = root_point(face,root_at,'court')
    return dict(face=face,root=root,rootStation=root_at,
                source=[*p['pt'](face,q,root_at if station is None else station),z],component=component,q=q)


def at(displacement, ref, load=None, ring_self=None):
    root,source = ref['root'],ref['source']
    normal = (((1.,0.),(0.,1.),(-1.,0.),(0.,-1.)) if ref['component'] == 'tangent'
              else ((0.,1.),(-1.,0.),(0.,-1.),(1.,0.)))[ref['face']]
    ux,uy,yaw = plan_root_state(displacement,root,load)
    translation = normal[0]*ux+normal[1]*uy
    vertical = root_state(displacement,root,load,ring_self)
    tilt = normal[0]*vertical[1]+normal[1]*vertical[2]
    if ref['component'] == 'translation': return translation
    if ref['component'] == 'yaw': return 1000*yaw
    if ref['component'] == 'tilt': return 1000*tilt
    dx,dy,dz = source[0]-root[0],source[1]-root[1],source[2]-6600.
    extension = tilt*dz+yaw*(-normal[0]*dy+normal[1]*dx)
    return extension if ref['component'] == 'extension' else translation+extension


queries=[]
query_units={}
pair_metadata={}
def add(label,ref):
    queries.append((label,ref,None))
    query_units[label] = 'mrad' if ref['component'] in ('yaw','tilt') else 'mm'
for face in range(4):
    for circuit in m['court_circuits']:
        name=circuit['name']; modules=circuit['modules']
        for cassette in [row for row in m['court_support_cassettes'] if row['circuit']==name]:
            root=cassette['rootStation']; owned=[row for row in modules if row['rootStation']==root]
            low,high=owned[0]['pRange'][0],owned[-1]['pRange'][1]
            if owned[0] is modules[0]: low=circuit['centre']-circuit['width']/2
            if owned[-1] is modules[-1]: high=12000-(circuit['centre']-circuit['width']/2)
            prefix=f'face{face} {name} root{root}'
            for component in ('translation','yaw','tilt'):
                add(prefix+' '+component,reference(face,root,component=component))
            for station in (low,high):
                for z in (6000.,7400.):
                    add(prefix+f' full body p{station} z{z}',reference(face,root,station,z=z))
                    add(prefix+f' body relative to root p{station} z{z}',reference(face,root,station,z=z,component='extension'))
                body_z=(6605.75,6795.) if name=='primary' else (6386.25,6540.)
                for z in body_z:
                    add(prefix+f' wet body p{station} z{z}',reference(face,root,station,q=circuit['centre']-circuit['width']/2,z=z))
            if name=='lower':
                for module in owned:
                    for station in (module['armStation']-100,module['armStation']+100):
                        for z in (6372.25,6730.):
                            add(prefix+f' lower hanger p{station} z{z}',reference(face,root,station,z=z))

# Exact relative p movement of the new primary arm and each closest lower
# hanger. Bound both member cross-sections, and include the full29.25mm
# possible primary bed grade in the primary arm's Z envelope.
definitions = m['inner_pressure']['inputManifest']['candidateDefinitions']
primary_definition, lower_definition = (definitions[name] for name in ('primary','lower'))
for face in range(4):
    for primary_p in primary_definition['stations']:
        separation = min(abs(primary_p-p0) for p0 in lower_definition['stations'])
        for lower_p in lower_definition['stations']:
            if abs(abs(primary_p-lower_p)-separation) > 1e-7:
                continue
            primary_root = min(primary_definition['roots'], key=lambda root:abs(root-primary_p))
            lower_root = min(lower_definition['roots'], key=lambda root:abs(root-lower_p))
            direction = 1 if primary_p > lower_p else -1
            primary_edge = primary_p-direction*75.
            lower_edge = lower_p+direction*100.
            for pq in (4325.,4345.):
                for lq in (4325.,4345.):
                    for pz in (6579.25,6633.5):
                        for lz in (6579.25,6633.5):
                            a = reference(face,primary_root,primary_edge,q=pq,z=pz,component='tangent')
                            b = reference(face,lower_root,lower_edge,q=lq,z=lz,component='tangent')
                            label = f'face{face} adjacent arm gap primary{primary_p} lower{lower_p} pq{pq} lq{lq} pz{pz} lz{lz}'
                            queries.append((label,a if direction>0 else b,b if direction>0 else a))
                            query_units[label]='mm'
                            pair_metadata[label]={'primaryP':primary_p,'lowerP':lower_p,
                                'nominalEdgeGapMM':separation-75.-100.,
                                'positive':'Gap increases: right member moves in+p relative to left member.',
                                'primaryZIncludesFullBedGrade':True}

# Exact virtual-work check for the normal rigid-arm query and the native
# consistent load interpolation. This checks yaw and vertical-rotation signs.
work_error=0.
for _,first,second in queries:
    for ref in (first,second):
        if ref is None or ref['component'] not in ('body','tangent'): continue
        normal=(((1.,0.),(0.,1.),(-1.,0.),(0.,-1.)) if ref['component']=='tangent'
                else ((0.,1.),(-1.,0.),(0.,-1.),(1.,0.)))[ref['face']]
        point=ref['source'];station=(point[0],point[1],12000-point[0],12000-point[1])[ref['face']]
        test=m['Load']('normal or tangential displacement work identity')
        test.place('court',ref['face'],-ref['q'],station,fx=normal[0],fy=normal[1],z=point[2],root_station=ref['rootStation'])
        work=sum(a*b for a,b in zip(test.vector,m['dry_u']))
        work_error=max(work_error,abs(work-at(m['dry_u'],ref)))
assert work_error < 1e-9,work_error
interface_error=0.
for i,point in enumerate(m['interface_points']):
    if point is None:continue
    seg,x,normal=point;xy=tuple(seg['a'][j]+(x if j==seg['axis'] else 0.) for j in (0,1))
    for u,load in zip(m['host_units'],m['host_loads']):
        plan=plan_root_state(u,xy,load)
        interface_error=max(interface_error,abs(sum(normal[j]*plan[j] for j in (0,1))-m['interface_values'](u,load)[i]))
assert interface_error < 1e-9,interface_error

def values(displacement, load=None, ring_self=None):
    return [at(displacement, a, load, ring_self)-(0. if b is None else at(displacement, b, load, ring_self))
            for _, a, b in queries]


native_bounds = {}
for stripped in (False, True):
    low = [0.]*len(queries)
    high = low.copy()
    for name, model in models.items():
        for label, loads, lo, hi in model['cases']:
            if stripped and (label == 'ringG' or label.startswith('bracemass')):
                continue
            if stripped and label.startswith('F'):
                hi = 0.
            local = model['solve']([loads[j] for j in model['free']])
            full = [0.]*p['spaceSize']
            for value, dof in zip(local, model['free']):
                node, axis = divmod(dof, 3)
                full[p['vDO'](model['nodes'][node], axis)] = value
            response = values(full, ring_self=name if label == 'ringG' else None)
            low = [a+min(lo*b, hi*b) for a, b in zip(low, response)]
            high = [a+max(lo*b, hi*b) for a, b in zip(high, response)]
    native_bounds[stripped] = (low, high)

host = [values(u, load) for u, load in zip(m['host_units'], m['host_loads'])]
screen = [values(u) for u in m['screen']]
wet, dry, vertical = (values(m[key+'_u'], m[load]) for key, load in
                     [('wet', 'wet'), ('dry', 'dry'), ('vertical', 'wind_vertical')])
strip, special = values(m['strip_d']), values(m['special_d'])
horizontal = {prog: [values(response[0], load) for response, load in zip(m['horizontal'][prog], rows)]
              for prog, rows in m['horizontal_cases'].items()}
panels = {spec: [values(response[0], load) for response, load in zip(m['panel_responses'][spec], rows)]
          for spec, rows in m['panel_loads'].items()}
water = [(response[1], values(response[0], load)) for load, response in m['water_responses']]
centroid = [(response[1], values(response[0], load))
            for load, response in zip(m['centroid_loads'], m['centroid_responses'])]
finite_path=HERE/f"roof_water_joined_pressure_maintenance_{width}_{m['MASS_TAG']}_finite.json"
finite_receipt=json.loads(finite_path.read_text())
assert finite_receipt['scope']=='finite' and finite_receipt['finiteAlternativeCount']==144
for source,digest in finite_receipt['sourceHashes'].items():
    assert hashlib.sha256((m['ROOT']/source).read_bytes()).hexdigest()==digest,source
renewal_responses=[]
for choice in finite_receipt['dryRemovalGroups'][0]['choices']:
    load=m['Load'](choice['id'])
    for row in choice['loads']:
        load.place(row['ring'],row['face'],row['radial'],row['station'],down=row['downN'],
                   fx=row['FxN'],fy=row['FyN'],z=row['source'][2],root_station=row['rootStation'],tag=row['tag'])
    u,bg,_=m['solve_load'](load)
    renewal_responses.append((bg,values(u,load)))

records = [{'label': label, 'unit': query_units[label], 'references': [a, b], 'range': [math.inf, -math.inf],
            'dryDiversionRange': [math.inf, -math.inf],
            'control': [None, None], 'pairedGap':pair_metadata.get(label)}
           for label, a, b in queries]
modes = [('partial water down', m['dry_bg'], dry, 1., 1., False),
         ('partial water up', m['dry_bg'], dry, -1., 1., False),
         ('dry down', m['dry_bg'], dry, 1., 1., False),
         ('dry up', m['dry_bg'], dry, -1., 1., False),
         ('stripped up', [0.]*32, [0.]*len(queries), -1., 0., True)]
for crack in (.2, .35):
    portal, units, coupled, guards = m['portal_model'](crack)
    guard_values = [linear_combination([-v for v in row[3]], host) for row in guards]
    # Only one signed guard acts at a time. For a scalar query its exact
    # extrema are +/- the largest absolute of the sixteen linear responses.
    # This preserves the original 33-state set without repeating every
    # wind/mode loop 33 times.
    guard_indices = [max(range(len(guard_values)), key=lambda j: abs(guard_values[j][i]))
                     for i in range(len(queries))]
    guard_peaks = [abs(guard_values[j][i]) for i, j in enumerate(guard_indices)]
    zero_weights = [[0., 0., 0., 0.] for _ in range(8)]
    renewal_choices=[[0.]*len(queries)]
    for background,value in renewal_responses:
        _,actions=coupled(background,zero_weights)
        renewal_choices.append(weighted_sum([(1.,value),(-1.,linear_combination(actions,host))]))
    renewal_bounds=([min(column) for column in zip(*renewal_choices)],[max(column) for column in zip(*renewal_choices)])
    panel_bounds = {}
    for spec, rows in panels.items():
        choices = [[0.]*len(queries)]
        for response, value in zip(m['panel_responses'][spec], rows):
            _, actions = coupled(response[1], zero_weights)
            choices.append(weighted_sum([(1., value), (-1., linear_combination(actions, host))]))
        panel_bounds[spec] = ([min(column) for column in zip(*choices)], [max(column) for column in zip(*choices)])
    body_bounds = {prog: (weighted_sum([(1., panel_bounds[spec][0]) for spec in specs]),
                         weighted_sum([(1., panel_bounds[spec][1]) for spec in specs]))
                   for prog, specs in m['panel_specs'].items()}
    water_low, water_high = [0.]*len(queries), [0.]*len(queries)
    for background, value in water:
        _, actions = coupled(background, zero_weights)
        response = weighted_sum([(1., value), (-1., linear_combination(actions, host))])
        water_low = [a+min(0., b) for a, b in zip(water_low, response)]
        water_high = [a+max(0., b) for a, b in zip(water_high, response)]
    centroid_fields = []
    for background, value in centroid:
        _, actions = coupled(background, zero_weights)
        centroid_fields.append([abs(v) for v in weighted_sum([(1., value), (-1., linear_combination(actions, host))])])
    for programme, indices in m['centroid_programmes'].items():
        for index in indices:
            lo, hi = body_bounds[programme]
            body_bounds[programme] = ([a-b for a, b in zip(lo, centroid_fields[index])],
                                      [a+b for a, b in zip(hi, centroid_fields[index])])
    for mode, goods_bg, goods, wind_sign, portal_g, stripped in modes:
        for extra_specials in ((0.,) if stripped else (0., 1.35)):
            for wi, state in enumerate(p['space']):
                programme = tuple(state[0])
                active = [m['sap']['load_scope'](programme, opening) for opening in m['sap']['ground']]
                weights = [[portal_g, float(on), 0., 0.] for on in active]
                _, hor_bg, _ = m['horizontal'][programme][2]
                court_scale = 1. if stripped else 0.
                background = weighted_sum([(1., m['source_bg'][wi]), (1., goods_bg), (wind_sign, m['vertical_bg']),
                                           (1., hor_bg), (court_scale, m['strip_bg']), (extra_specials, m['special_bg'])])
                _, actions = coupled(background, weights)
                base = weighted_sum([(1., screen[wi]), (1., goods), (wind_sign, vertical), (1., horizontal[programme][2]),
                                     (court_scale, strip), (extra_specials, special), (-1., linear_combination(actions, host))])
                lo = [a+b+c-g for a, b, c, g in zip(base, native_bounds[stripped][0], body_bounds[programme][0], guard_peaks)]
                hi = [a+b+c+g for a, b, c, g in zip(base, native_bounds[stripped][1], body_bounds[programme][1], guard_peaks)]
                if not stripped:
                    lo=[a+b for a,b in zip(lo,renewal_bounds[0])]
                    hi=[a+b for a,b in zip(hi,renewal_bounds[1])]
                if mode.startswith('partial'):
                    lo = [a+b for a, b in zip(lo, water_low)]
                    hi = [a+b for a, b in zip(hi, water_high)]
                for i, row in enumerate(records):
                    if mode.startswith('dry'):
                        row['dryDiversionRange'][0] = min(row['dryDiversionRange'][0], lo[i])
                        row['dryDiversionRange'][1] = max(row['dryDiversionRange'][1], hi[i])
                    for side, value in enumerate((lo[i], hi[i])):
                        better = value < row['range'][side] if side == 0 else value > row['range'][side]
                        if better:
                            row['range'][side] = float(value)
                            guard_id = guard_indices[i] if guard_peaks[i] else None
                            guard_direction = 1 if guard_id is not None and guard_values[guard_id][i] > 0 else -1
                            sign = (1 if side else -1)*guard_direction if guard_id is not None else 0
                            row['control'][side] = {'crack': crack, 'mode': mode, 'specials': extra_specials,
                                                  'windIndex': wi, 'guard': guard_id, 'sign': sign}
output = {'windQualification':'Original house wind PLUS exported inner horizontal pressure and24 independently signed actual floor groups; no vertical-area cancellation; actual graded-skin/contact joins pending.', 'role':'Signed native inner normal motion and root rotations with one finite local renewal state.',
          'positive':'Normal millimetres increase court q, away from the nominal facade. Rotations are explicitly mrad.',
          'datum':'Absolute native fixed-base datum. Facade deformation is not modelled or cancelled. Add local frame flex and any opposing facade motion to clearance.',
          'courtWidthMM':width,'innerDryKgPerM':[inner_dry_kg_per_m]*2,'queries':records,
          'normalVirtualWorkError':work_error,'nativeInterfaceRecoveryError':interface_error,
          'finiteRemovalChoices':144,'oneLocalOperationAtATime':True,'nativeGravityIntervalsRetained':True,
          'hangerGeometry':{'qMinMM':4325,'pHalfWidthMM':100,'zBoundsMM':[6372.25,6730],
                            'facadeQMM':4250,'separateProjectionAndSetoutMM':25,'staticClearanceMM':50},
          'sourceHashes':{**finite_receipt['sourceHashes'],str(finite_path.relative_to(m['ROOT'])):hashlib.sha256(finite_path.read_bytes()).hexdigest(),
                         str(Path(__file__).relative_to(m['ROOT'])):hashlib.sha256(Path(__file__).read_bytes()).hexdigest()}}

def rounded(value):
    if isinstance(value, dict):
        return {key: rounded(item) for key, item in value.items()}
    if isinstance(value, (tuple, list)):
        return [rounded(item) for item in value]
    return round(value, 9) if isinstance(value, float) else value


target = HERE/f"roof_water_joined_pressure_lateral_{width}_{m['MASS_TAG']}.json"
contents = json.dumps(rounded(output), indent=2)+'\n'
if '--check' in ARGS:
    assert target.read_text() == contents, 'Rebuild the joined collector movement comparison'
else:
    target.write_text(contents)
print(f'{len(records)} signed normal/rotation queries checked at court width {width} mm.')
