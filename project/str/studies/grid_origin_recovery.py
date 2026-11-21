"""Physical load origins on the two wet-post receiving grid members.

This is postprocessing of the existing solve. It introduces no force, spring,
restraint, foundation resistance or alternative house source. Characteristic
body loads and solved interface forces have distinct factors.
"""
import copy
import math

from rc_floor_house_loads import (consistent_member_point_load, _consistent_point, _consistent_line,
    recovered_member_actions, _member_cuts, _interior_member_cuts,
    member_load_equilibrium)


def initialise_grid_origins(model, geometry, member_ids):
    if 'wetGridOrigins' in model:raise ValueError('Wet receiving-grid origin ledger already exists')
    metadata={}
    for name in sorted(set(member_ids)):
        row=geometry[name]
        metadata[name]={**row,'depthMm':row['widthMm'],'breadthMm':row['heightMm'],
            'yAxisGlobal':[0,0,1],'kind':'wet-post-receiving-grid'}
    model['wetGridOrigins']={'members':metadata,'points':[],'lines':[],'adapters':{}}


def record_grid_gravity(model, adapter, member_id, point_xy, force_z, equivalent_terms, origin_id):
    """Record the exact origin while its owning adapter applies that load."""
    ledger=model.get('wetGridOrigins')
    if ledger is None or member_id not in ledger['members']:return
    row=ledger['members'][member_id];point=[*point_xy,row['topZMm']]
    context={'model':model['model'],'request':{'frameLaw':model['request']['gridLaw']}}
    vector=consistent_member_point_load(context,row,point,[0,0,force_z])
    actual={n:[force_z*v for v in values] for n,values in equivalent_terms}
    if any(abs(a-b)>1e-8 for i,n in enumerate((row['a'],row['b']))
           for a,b in zip(vector[6*i:6*i+6],actual.get(n,[0.]*6))):
        raise ValueError('Receiving-grid origin differs from actually applied work map')
    origin={'id':origin_id,'adapter':adapter,
        'memberId':member_id,'pointXYZMm':point,'forceKN':[0.,0.,force_z],
        'momentKNmm':[0.,0.,0.],'family':'physical-G'}
    ledger['points'].append(origin)


def _origin_wrench(origin,members):
    from joined_successor_kernel import cross
    if origin.get('kind')=='uniform-line':
        member=members[origin['memberId']];p,q=member['physicalStartMm'],member['physicalEndMm'];length=math.dist(p,q)
        axis=[(b-a)/length for a,b in zip(p,q)];middle=(origin['s0Mm']+origin['s1Mm'])/2
        point=[a+middle*b for a,b in zip(p,axis)];span=origin['s1Mm']-origin['s0Mm']
        force=[span*v for v in origin['forceDensityKNPerMm']];moment=[span*v for v in origin['momentDensityKNmmPerMm']]
    else:point=origin['pointXYZMm'];force=origin['forceKN'];moment=origin['momentKNmm']
    return [*force,*[(a+b)/1000 for a,b in zip(moment,cross(point,force))]]


def _validate_adapter(ledger,adapter,expected_origins):
    actual=[r for r in ledger['points']+ledger['lines'] if r['adapter']==adapter]
    expected=[r for r in expected_origins if r['memberId'] in ledger['members']]
    ids=[r['id'] for r in expected]
    if len(ids)!=len(set(ids)) or sorted(ids)!=sorted(r['id'] for r in actual):
        raise ValueError('Missing, duplicate or changed receiving-grid source-piece capture: '+adapter)
    expected_wrench=[0.]*6;actual_wrench=[0.]*6
    for row in expected:
        point=[*row['centroidXYMm'],ledger['members'][row['memberId']]['topZMm']];fz=-row['physicalDownKN']
        for i,v in enumerate([0,0,fz,point[1]*fz/1000,-point[0]*fz/1000,0]):expected_wrench[i]+=v
    for row in actual:
        for i,v in enumerate(_origin_wrench(row,ledger['members'])):actual_wrench[i]+=v
    if max(abs(a-b) for a,b in zip(expected_wrench,actual_wrench))>1e-7:
        raise ValueError('Captured receiving-grid source-body inventory loses G or first moments: '+adapter)
    return {'sourcePieceIds':ids,'sourcePieceCount':len(expected),'independentSourceWrenchKN_KNm':expected_wrench,
        'capturedWrenchKN_KNm':actual_wrench,'expectedSourcePieces':copy.deepcopy(expected)}


def finish_grid_gravity_adapter(model, adapter, expected_origins):
    ledger=model.get('wetGridOrigins')
    if ledger is None:return
    if adapter in ledger['adapters']:raise ValueError('Receiving-grid adapter already completed')
    ledger['adapters'][adapter]=_validate_adapter(ledger,adapter,expected_origins)


def record_grid_uniform_gravity(model, adapter, member_id, rectangle, weight, applied_equivalents, origin_id):
    """Retain a physical uniform rectangular body's exact line distribution.

    Original two-point quadrature supplies its work-equivalent end vector, not
    literal point-load jumps. The body has uniform section along its real beam.
    """
    from joined_successor_kernel import cross
    ledger=model.get('wetGridOrigins')
    if ledger is None or member_id not in ledger['members']:return
    row=ledger['members'][member_id];p,q=row['physicalStartMm'],row['physicalEndMm']
    length=math.dist(p,q);axis=[(b-a)/length for a,b in zip(p,q)]
    along=0 if p[0]!=q[0] else 1
    a,b=sorted((axis[along]*(rectangle[along]-p[along]),axis[along]*(rectangle[along+2]-p[along])))
    if a < -1e-7 or b>length+1e-7 or b<=a or not math.isfinite(weight) or weight<0:
        raise ValueError('Actual uniform body piece must be contained in its finite receiver')
    centre=[(rectangle[0]+rectangle[2])/2,(rectangle[1]+rectangle[3])/2,row['topZMm']]
    at=[v+(a+b)/2*u for v,u in zip(p,axis)];offset=[v-u for v,u in zip(centre,at)]
    force=[0.,0.,-weight/(b-a)];moment=cross(offset,force)
    context={'model':model['model'],'request':{'frameLaw':model['request']['gridLaw']}}
    _consistent_line(context,{},'physical-G',member_id,row,a,b,force,moment,apply=False)
    vector=context['memberEquivalentLoads']['physical-G'][member_id]
    if any(abs(x-y)>1e-7 for i,n in enumerate((row['a'],row['b']))
           for x,y in zip(vector[6*i:6*i+6],applied_equivalents.get(n,[0.]*6))):
        raise ValueError('Uniform body origin differs from actual quadrature work vector')
    ledger['lines'].append({'id':origin_id,'adapter':adapter,
        'memberId':member_id,'family':'physical-G','kind':'uniform-line',
        'sourceRectangleXYMm':list(rectangle),'physicalDownKN':weight,'s0Mm':a,'s1Mm':b,
        'forceDensityKNPerMm':force,'momentDensityKNmmPerMm':moment})


def _spring_origin(model, raw_springs, fibre, body_index, row):
    spring_id=fibre['id'] if body_index is None else 'LOWER-CORE/axial/'+str(body_index)
    spring=raw_springs[spring_id];point=[*fibre['xyMm'],row['topZMm']]
    context={'model':model['model'],'request':{'frameLaw':model['request']['gridLaw']}}
    unit=consistent_member_point_load(context,row,point,[0,0,1.])
    terms={n:values for n,values in spring['terms']}
    # Both combined contact and separated body springs contain -ground_trace.
    if any(abs(a+b)>1e-8 for i,n in enumerate((row['a'],row['b']))
           for a,b in zip(unit[6*i:6*i+6],terms.get(n,[0.]*6))):
        raise ValueError('Receiving-grid solved spring has a different actual lower work trace')
    return {'id':'solved/'+spring_id,'memberId':fibre['gridMemberId'],
        'pointXYZMm':point,'forceKN':[0.,0.,spring['forceKN']],
        'momentKNmm':[0.,0.,0.],'family':'solved-interface'}


def recover_wet_receiving_grid(model, raw, post_responses, gravity_factor):
    """Recover physical cuts only after every declared origin family closes.

    Existing endpoint attachments remain nodal; only loads introduced within a
    member require fixed-end subtraction and physical interior cut origins.
    """
    ledger=model.get('wetGridOrigins')
    if ledger is None:raise ValueError('Missing receiving-grid origin ledger')
    if not math.isfinite(gravity_factor) or gravity_factor<0:raise ValueError('Finite nonnegative physical-G factor required')
    required=[]
    if model.get('lowerCoreBodies') is not None:required.extend(('lower-core/base-G','lower-core/free-G'))
    if model.get('foundationWeight') is not None:required.append('foundation/solid-G')
    for adapter in required:
        expected=ledger['adapters'].get(adapter)
        if expected is None:raise ValueError('Missing receiving-grid origin adapter: '+adapter)
        actual=_validate_adapter(ledger,adapter,expected['expectedSourcePieces'])
        if actual!=expected:raise ValueError('Changed receiving-grid source-piece inventory: '+adapter)
    if {r['id'] for r in post_responses}!={r['id'] for r in model['seatedWetSupport']['posts']} or len(post_responses)!=len(model['seatedWetSupport']['posts']):
        raise ValueError('All actual wet-post base responses are required')
    origins=copy.deepcopy(ledger['points']+ledger['lines']);springs={r['id']:r for r in raw['springs']}
    fibres=model['verticalFloor']['fibres'];fibre_ids=[f['id'] for f in fibres]
    actual_springs={r['id'] for r in model['model'].springs if r['id'].startswith('VERTICAL-FLOOR/bearing/')}
    if len(fibre_ids)!=len(set(fibre_ids)) or set(fibre_ids)!=actual_springs:
        raise ValueError('Actual source normal-contact fibre identities do not cover the assembled physical springs')
    body_rows=model.get('lowerCoreBodies',{}).get('contactBodies',[])
    bodies={r['fibreId']:i for i,r in enumerate(body_rows)}
    if len(bodies)!=len(body_rows) or not set(bodies)<=set(fibre_ids):raise ValueError('Actual lower-body source fibre identities are missing or duplicated')
    target_fibre_ids=[]
    for fibre in fibres:
        member_id=fibre['gridMemberId']
        if member_id in ledger['members']:
            target_fibre_ids.append(fibre['id'])
            origins.append(_spring_origin(model,springs,fibre,bodies.get(fibre['id']),ledger['members'][member_id]))
    for post in post_responses:
        name=post['sourceGridMemberId'];member=model['model'].mappedMembers[post['id']]
        wrench=[-v for v in post['recovery']['physicalEndWrenchesKN_KNmm'][:6]]
        point=member['physicalStartMm'];row=ledger['members'][name]
        context={'model':model['model'],'request':{'frameLaw':model['request']['gridLaw']}}
        vector=consistent_member_point_load(context,row,point,wrench[:3],wrench[3:])
        actual={}
        for force,trace in zip(wrench,member['endMaps'][:6]):
            for n,values in trace:
                target=actual.setdefault(n,[0.]*6)
                for i,v in enumerate(values):target[i]+=force*v
        if any(abs(a-b)>1e-7 for i,n in enumerate((row['a'],row['b'])) for a,b in zip(vector[6*i:6*i+6],actual.get(n,[0.]*6))):
            raise ValueError('Mapped post-base origin loses its actual six-component work map')
        origins.append({'id':'solved/'+post['id']+'/base','memberId':name,'pointXYZMm':point,
            'forceKN':wrench[:3],'momentKNmm':wrench[3:],'family':'solved-interface'})
    result=recover_grid_cuts(model,raw,ledger['members'],origins,gravity_factor)
    result['gravitySourceInventories']=copy.deepcopy(ledger['adapters'])
    result['actualNormalContactOriginIds']=[r['id'] for r in origins if r['id'].startswith('solved/LOWER-CORE/') or r['id'].startswith('solved/VERTICAL-FLOOR/')]
    result['actualSourceNormalFibreIds']=target_fibre_ids
    result['actualWetPostBaseOriginIds']=[r['id'] for r in origins if r['id'].startswith('solved/WET-SUPPORT/')]
    return result


def recover_grid_cuts(model, raw, members, origins, gravity_factor):
    """Pure cut adapter, also exercised by analytical force/couple fixtures."""
    before_heads=copy.deepcopy(raw['supportWrenches']);before_loads=copy.deepcopy(model['model'].loads)
    context={'model':model['model'],'members':members,'request':{'frameLaw':model['request']['gridLaw']}}
    for family,loads in model.get('memberEquivalentLoads',{}).items():
        if any(name in members and any(v) for name,v in loads.items()):
            raise ValueError('Existing receiving-grid member-load family needs explicit integration: '+family)
    identifiers=set()
    for origin in origins:
        if origin['id'] in identifiers or origin['memberId'] not in members or origin['family'] not in ('physical-G','solved-interface'):
            raise ValueError('Unique supported receiving-grid physical origin required')
        identifiers.add(origin['id'])
        keys=('forceDensityKNPerMm','momentDensityKNmmPerMm') if origin.get('kind')=='uniform-line' else ('pointXYZMm','forceKN','momentKNmm')
        for key in keys:
            if not isinstance(origin[key],(list,tuple)) or len(origin[key])!=3 or any(type(v) not in (int,float) or not math.isfinite(v) for v in origin[key]):
                raise ValueError('Finite three-component physical grid origin required')
        if origin.get('kind')=='uniform-line':
            _consistent_line(context,{},origin['family'],origin['memberId'],members[origin['memberId']],
                origin['s0Mm'],origin['s1Mm'],origin['forceDensityKNPerMm'],origin['momentDensityKNmmPerMm'],apply=False)
        else:
            _consistent_point(context,{},origin['family'],origin['memberId'],members[origin['memberId']],
                origin['pointXYZMm'],origin['forceKN'],origin['momentKNmm'],apply=False)
    factors={'physical-G':gravity_factor,'solved-interface':1.}
    recovered=recovered_member_actions(context,raw,factors)
    try:
        equilibrium=member_load_equilibrium(context,recovered,factors)
    except ValueError as error:
        if raw['supportWrenches']!=before_heads or model['model'].loads!=before_loads:raise ValueError('Incomplete grid postprocessing changed native reactions or applied forces')
        return {'schema':'str-wet-receiving-grid-cut-comparison/1','physicalElementCutsAvailable':False,
            'completePhysicalGridDemandEnvelopeAvailable':False,'diagnostics':[str(error)],
            'originCount':len(origins),'memberIds':sorted(members),'candidateAccepted':False,
            'gridResistanceAccepted':False,'localJointAccepted':False,'soilOrPileResistanceAccepted':False,
            'memberCuts':[],'interiorMemberCuts':[],'nativeSupportReactionsUnchanged':True}
    rows=_member_cuts(context,recovered);interior=_interior_member_cuts(context,recovered,factors)
    if raw['supportWrenches']!=before_heads or model['model'].loads!=before_loads:raise ValueError('Grid postprocessing changed the native solution or applied forces')
    return {'schema':'str-wet-receiving-grid-cut-comparison/1','physicalElementCutsAvailable':True,
        'completePhysicalGridDemandEnvelopeAvailable':False,'candidateAccepted':False,
        'gridResistanceAccepted':False,'localJointAccepted':False,'soilOrPileResistanceAccepted':False,
        'memberIds':sorted(members),'originCount':len(origins),'origins':origins,
        'memberCuts':rows,'interiorMemberCuts':interior,'memberLoadEquilibrium':equilibrium,
        'nativeSupportReactionCountUnchanged':len(before_heads),'nativeSupportReactionsUnchanged':True,
        'scope':'Only the two actual wet-post receiving members in the declared discrete model and executed simultaneous case. Existing nodal attachments plus captured interior body gravity and solved normal/post-base interactions; no local joint, cage, resistance, soil or complete signed load-envelope acceptance.'}
