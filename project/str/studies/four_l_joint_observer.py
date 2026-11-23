"""Passive observation of actual solved L member ends and floor work maps.

No native source changes or load injection. Runtime wrappers are restored even
on failure. Invoke in a dedicated process: these temporary module/class hooks
are deliberately not a concurrent service API. JSON {case,caseId} on stdin;
--ordinary emits only the unchanged ordinary full-result checksum/control cuts.
"""
import hashlib
import json
import os
from pathlib import Path
import re
import sys

from four_l_joint_recovery import add, native_units, recover, scale

METHOD = 'project/str/studies/four_l_joint_observer.py'
RECOVERY = 'project/str/studies/four_l_joint_recovery.py'


def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(',', ':'), allow_nan=False).encode()).hexdigest()


def _map(values, terms, node):
    return [sum(value*row[axis] for value, entries in zip(values, terms)
        for target, row in entries if target == node) for axis in range(6)]


def _coordinates(raw, terms):
    return [sum(v*raw['displacements'][node][axis] for node, row in entries for axis, v in enumerate(row))
        for entries in terms]


def _multiply(matrix, vector):
    return [sum(a*b for a,b in zip(row,vector)) for row in matrix]


def numerical_runtime():
    """Fixed installed numerical inventory; identical before/after native work.

    Necessary evidence domain only, never a guarantee of bitwise portability.
    Paths, process identity and addresses are deliberately excluded.
    """
    import platform
    import numpy as np
    import scipy
    from scipy.linalg import _fblas
    from scipy.sparse.linalg._dsolve import _superlu
    modules={'numpy/core':Path(np._core._multiarray_umath.__file__),
        'scipy/fblas':Path(_fblas.__file__),'scipy/superlu':Path(_superlu.__file__)}
    for package,module in (('numpy',np),('scipy',scipy)):
        directory=Path(module.__file__).resolve().parent.parent/(package+'.libs')
        for path in sorted(directory.glob('*.so*')):
            if path.is_file():modules[package+'.libs/'+path.name]=path
    libraries={key:hashlib.sha256(path.read_bytes()).hexdigest() for key,path in sorted(modules.items())}
    return {'schema':'str-four-L-numerical-runtime/1','pythonImplementation':platform.python_implementation(),
        'pythonVersion':platform.python_version(),'numpyVersion':np.__version__,'scipyVersion':scipy.__version__,
        'system':platform.system(),'machine':platform.machine(),'byteorder':sys.byteorder,
        'cpuFeatures':dict(sorted(np._core._multiarray_umath.__cpu_features__.items())),
        'sharedLibrariesSHA256':libraries}


def _controls(result):
    native = result['nativeVertical']['native']
    return {'fullNativeResultSHA256':digest(result), 'heads':native['heads'], 'numericalRuntime':numerical_runtime(),
        'physicalCutSHA256':digest({key:native[key] for key in
            ('memberCuts','interiorMemberCuts','capCuts','adjacentGridMemberCuts')}),
        'physicalHeadCount':len(native['heads'])}


def require_runtime_threads():
    settings={name:os.environ.get(name) for name in ('OPENBLAS_NUM_THREADS','OMP_NUM_THREADS')}
    if any(value!='1' for value in settings.values()):
        raise ValueError('Native floor runtime requires explicit OPENBLAS_NUM_THREADS=1 OMP_NUM_THREADS=1 before Python starts')
    return settings


def _capture_full(result,path):
    if path is None:return
    path=Path(path)
    if path.exists():raise ValueError('Refusing to overwrite an existing full native capture')
    path.parent.mkdir(parents=True,exist_ok=True)
    temporary=path.with_suffix('.writing.json')
    with temporary.open('w') as stream:json.dump(result,stream,allow_nan=False)
    os.replace(temporary,path)


def observe(case, case_id, root, ordinary=False, full_capture_path=None, include_native=False):
    runtime_threads=require_runtime_threads()
    import floor_section_model as builder
    from joined_successor_kernel import FrameModel
    root = Path(root)
    source = builder.load_source(root)
    methods = {p:hashlib.sha256((root/p).read_bytes()).hexdigest() for p in (METHOD,RECOVERY)}
    if (not isinstance(case_id,str) or not re.fullmatch(r'[A-Za-z][A-Za-z0-9._:-]*',case_id)
            or not isinstance(case,dict) or case.get('sourceSHA256') != source['identities']):
        raise ValueError('Exact explicit current native source, request and stable case ID required')
    if ordinary:
        result = builder.run(case,source,case_id)
        _capture_full(result,full_capture_path)
        if source['identities'] != builder.load_source(root)['identities']:
            raise ValueError('Native source changed during ordinary control')
        return {'schema':'str-four-L-joint-ordinary-control/1','sourceSHA256':source['identities'],
            'requestSHA256':digest(case),'caseId':case_id,'runtimeThreads':runtime_threads,**_controls(result)}
    captured = {}; models = {}; current = {}
    previous_member = FrameModel.member
    previous_base = builder._build_base
    previous_free = builder._free_top_load
    previous_live = builder.fresh_net_floor_live_load
    previous_solve = builder.solve_vertical_frame

    def member(frame,name,a,b,section,material,physical_start=None,physical_end=None,y_axis=None):
        value = previous_member(frame,name,a,b,section,material,physical_start,physical_end,y_axis)
        models.setdefault(id(frame),{})[name] = {'id':name,'a':a,'b':b,
            'physicalStartXYZMm':list(physical_start or frame.nodes[a]),
            'physicalEndXYZMm':list(physical_end or frame.nodes[b]),'sectionAreaMm2':section['A']}
        return value

    def base(*args,**kwargs):
        value = previous_base(*args,**kwargs); current['model'] = value
        # Common-coordinate rebuilds are discarded; keep metadata for the actual
        # surviving frame only. No model/member/property is edited by this hook.
        actual = id(value['model']); saved = models[actual]; models.clear(); models[actual] = saved
        return value

    def free(*args,**kwargs):
        value = previous_free(*args,**kwargs); current['free'] = value; return value

    def live(*args,**kwargs):
        value = previous_live(*args,**kwargs); current['live'] = value; return value

    def solved(frame,data):
        raw = previous_solve(frame,data)
        model = current['model']; g = model['houseLoadCase']['boundary']['physicalGFactor']
        floor = model['joinedFloor']; membrane_u = _coordinates(raw,floor['portTerms'])
        membrane_k_u = _multiply(floor['floor']['condensedStiffnessKNPerMm'],membrane_u)
        plate_u = _coordinates(raw,data['portTerms'])
        plate_k_u = _multiply(data['operator']['condensedStiffness'],plate_u)
        plate_g = data['operator']['condensedSelfG']; plate_upper = current['free']['condensation']['condensedForceKN']
        plate_factor = g+current['live']['pressureRatioToSelfG']
        plate_net = [a-plate_factor*b-g*c for a,b,c in zip(plate_k_u,plate_g,plate_upper)]
        membrane_load = floor['floor']['condensedForceKN']
        membrane_net = [a-b for a,b in zip(membrane_k_u,membrane_load)]
        geometry = models[id(frame)]; members = {name:(a,b) for name,a,b,_ in frame.members}
        lower = {r['memberId']:r for r in model['lowerLWeight']['members']}
        upper = {r['id']:r for r in model['roofFloorCoupling']['upperL']}
        rows = []
        for corner in floor['corners']:
            identity = corner['id']; node = corner['node']; master = list(frame.nodes[node]); ends = []; body_cards = []
            expected_members = {identity+'/upper-wall','JOINED-ROOF/upper-L/'+identity}
            incident = {name for name,(a,b) in members.items() if node in (a,b)}
            if incident != expected_members:
                raise ValueError('Changed incident member topology at L joint; recover actual new members explicitly')
            for name,role in ((identity+'/upper-wall','lower'),('JOINED-ROOF/upper-L/'+identity,'upper')):
                a,b = members[name]; end = 0 if a==node else 1; meta = geometry[name]
                if name in model.get('memberEquivalentLoads',{}).get('physical-G',{}):
                    raise ValueError('L body load now registered natively; update observer to avoid duplicate subtraction')
                if any(name in cards for cards in model.get('memberEquivalentLoads',{}).values()):
                    raise ValueError('New L member load family needs explicit physical recovery')
                if role == 'lower':
                    own = [0,0,-lower[name]['physicalGKN']/2,0,0,0]
                else:
                    own = list(upper[name]['equivalentGKN_KNmm'][end])
                own = scale(own,g); body_cards.append(own)
                ends.append({'memberId':name,'role':role,'end':end,'masterNodeId':node,'masterXYZMm':master,
                    'physicalCutXYZMm':meta['physicalStartXYZMm'] if end==0 else meta['physicalEndXYZMm'],
                    'rawMasterWrenchKN_KNmm':raw['memberEndWrenchesKN_KNmm'][name][6*end:6*end+6],
                    'equivalentBodyLoadMasterKN_KNmm':own})
            spring_cards = []
            for spring in raw['springs']:
                terms = [(n,row) for n,row in spring['terms'] if n==node]
                if not terms:continue
                if not spring['id'].startswith('JOINED-FLOOR/energy/'):
                    raise ValueError('New incident spring at L joint needs explicit physical interpretation')
                spring_cards.extend(scale(row,spring['forceKN']) for _,row in terms)
            membrane_elastic = _map(membrane_k_u,floor['portTerms'],node)
            spring_delta = add(add(*spring_cards),scale(membrane_elastic,-1))
            if max(abs(v) for v in spring_delta)>1e-5:
                raise ValueError('Actual membrane energy spring force differs from retained work map')
            plate_equiv = _map([plate_factor*b+g*c for b,c in zip(plate_g,plate_upper)],data['portTerms'],node)
            membrane_equiv = _map(membrane_load,floor['portTerms'],node)
            families = {family:list(loads.get(node,[0.]*6)) for family,loads in model['families'].items()}
            # These are *actual applied card* partitions, independent of K.u.
            # They must not be replaced by a closure residual fitted to forces.
            direct_g = add(scale(families.get('physical-G',[0.]*6),g),scale(add(*body_cards),-1),
                scale(_map([g*(b+c) for b,c in zip(plate_g,plate_upper)],data['portTerms'],node),-1))
            direct_pressure = add(families.get('native-floor-reconciled',[0.]*6),scale(membrane_equiv,-1))
            direct_live = add(current['live']['loads'].get(node,[0.]*6),
                scale(_map([current['live']['pressureRatioToSelfG']*v for v in plate_g],data['portTerms'],node),-1))
            direct = [('physical-G-other-actual-collector-cards',direct_g),
                ('source-pressure-explicit-offset-couples',direct_pressure),
                ('fresh-Q-other-actual-collector-cards',direct_live),
                ('roof-additional-actual-collector-cards',model['roofFloorCoupling']['additionalNodalLoads'].get(node,[0.]*6))]
            unapplied = {}
            for family,cards in families.items():
                if family in ('physical-G','native-floor-reconciled'):continue
                if any(cards):
                    if family in ('actual-outer-portal-ground-pressure','wet-support-Q'):
                        direct.append((family,cards))
                    else:
                        # The admitted floor-section solve applies only its
                        # explicit multipliers; historical family cards may
                        # remain stored without being applied. Never promote
                        # such a card into the recovered joint load.
                        unapplied[family]=cards
            actual_applied = frame.loads.get(node,[0.]*6)
            partition = add(*body_cards,plate_equiv,membrane_equiv,*[cards for _,cards in direct])
            partition_delta = add(partition,scale(actual_applied,-1))
            if max(abs(v) for v in partition_delta)>1e-7:
                raise ValueError('Independent collector applied-card partition loses actual load')
            raw_delta = add(*[e['rawMasterWrenchKN_KNmm'] for e in ends],membrane_elastic,
                _map(plate_k_u,data['portTerms'],node),scale(actual_applied,-1))
            ports = [{'id':port['id'],'index':i,'nodeDisplacementCoefficients':list(row)}
                for i,(port,terms) in enumerate(zip(data['ports'],data['portTerms']))
                for n,row in terms if n==node]
            rows.append({'id':identity,'collectorNodeId':node,'referenceXYZMm':master,'memberEnds':ends,
                'componentReactions':[
                    {'id':'actual-vertical-plate','originXYZMm':master,
                        'forceOnComponentKN_KNm':native_units(_map(plate_net,data['portTerms'],node))},
                    {'id':'actual-in-plane-membrane','originXYZMm':master,
                        'forceOnComponentKN_KNm':native_units(_map(membrane_net,floor['portTerms'],node))}],
                'directAppliedLoads':[{'id':name,'originXYZMm':master,'wrenchKN_KNm':native_units(cards)} for name,cards in direct],
                'actualAppliedMasterWrenchKN_KNmm':list(actual_applied),'appliedCardPartitionResidualKN_KNmm':partition_delta,
                'storedButUnappliedCollectorFamiliesKN_KNmm':unapplied,
                'rawNodalEquilibriumResidualKN_KNmm':raw_delta,'actualIncidentMembraneEnergySpringCount':len(spring_cards),
                'membraneEnergyWorkMapResidualKN_KNmm':spring_delta,'verticalPortMaps':ports,
                'jointFootprintRectanglesXYMm':corner['rectangles'],
                'excludedRigidJointVolumeM3':sum((r[2]-r[0])*(r[3]-r[1]) for r in corner['rectangles'])*case['thicknessMm']/1e9,
                'jointBodyGravityInsertedByObserverKN':0.})
        captured.update(schema='str-four-L-joint-observation/1',joints=rows,
            observedPlateGeneralizedReactions=plate_net, nonlinearSolvesExecuted=1)
        return raw

    FrameModel.member = member; builder._build_base = base; builder._free_top_load = free
    builder.fresh_net_floor_live_load = live; builder.solve_vertical_frame = solved
    try:
        result = builder.run(case,source,case_id)
    finally:
        FrameModel.member = previous_member; builder._build_base = previous_base; builder._free_top_load = previous_free
        builder.fresh_net_floor_live_load = previous_live; builder.solve_vertical_frame = previous_solve
    # Retain the actual completed full bytes before assessing passivity. Failed
    # comparison/identity checks must not leave the only useful fields in RAM.
    _capture_full(result,full_capture_path)
    if source['identities'] != builder.load_source(root)['identities']:
        raise ValueError('Native source changed during passive joint observation')
    if methods != {p:hashlib.sha256((root/p).read_bytes()).hexdigest() for p in (METHOD,RECOVERY)}:
        raise ValueError('Observer/recovery source changed during observation')
    physical = result['nativeVertical']['plate']['physicalRecovery']['portGeneralizedReactions']
    error = max(abs(a-b) for a,b in zip(physical,captured.pop('observedPlateGeneralizedReactions')))
    if error>1e-5:
        raise ValueError('Observed condensed plate net reactions differ from actual physical recovery')
    captured.update(sourceSHA256=source['identities'],request=case,requestSHA256=digest(case),caseId=case_id,
        methodSourceSHA256=methods,runtimeThreads=runtime_threads,
        **_controls(result), maximumPlateReactionDifferenceFromNativePhysicalRecovery=error,
        finiteJointCapacityAvailable=False, completeHouseProof=False, candidateAccepted=False)
    envelope={'observation':captured,'freeBodies':recover(captured)}
    if include_native:
        # Retain the Python numeric JSON representation as exact bytes for the
        # Node checksum join (JSON.parse/stringify would change1.0/-0.0).
        envelope['nativeResultJSON']=json.dumps(result,sort_keys=True,separators=(',',':'),allow_nan=False)
    return envelope


if __name__=='__main__':
    payload=json.load(sys.stdin)
    if set(payload)!={'case','caseId'}:raise ValueError('Exact {case,caseId} request required')
    arguments=sys.argv[1:];ordinary='--ordinary' in arguments;include_native='--return-native' in arguments
    if ordinary:arguments.remove('--ordinary')
    if include_native:arguments.remove('--return-native')
    if arguments and (len(arguments)!=2 or arguments[0]!='--capture-full'):
        raise ValueError('Use [--ordinary] [--return-native] [--capture-full NEW_PATH]')
    full=arguments[1] if arguments else None
    json.dump(observe(payload['case'],payload['caseId'],Path(__file__).resolve().parents[3],ordinary,full,include_native),
        sys.stdout,allow_nan=False)
