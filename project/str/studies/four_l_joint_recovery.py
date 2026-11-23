"""Pure six-component free bodies for the existing rigid four-L floor joints.

Inputs are an observed, source-bound assembly, not independently authored loads.
This recovers the demand implied by that assembly; finite joint constitutive,
reinforcement, anchorage and bearing/contact resistance are outside its scope.
All public wrenches are kN/kNm; input native end cards remain kN/kNmm.
"""
import math


def _finite(values, count):
    if (not isinstance(values, (list, tuple)) or len(values) != count
            or any(type(v) not in (int, float) or not math.isfinite(v) for v in values)):
        raise ValueError('Explicit finite vector of length '+str(count)+' required')
    return list(values)


def add(*rows):
    checked = [_finite(row, 6) for row in rows]
    return [math.fsum(row[i] for row in checked) for i in range(6)]


def scale(row, factor):
    if type(factor) not in (int, float) or not math.isfinite(factor):
        raise ValueError('Finite load factor required')
    return [factor*v for v in _finite(row, 6)]


def transport(wrench, origin_mm, destination_mm):
    """Same action at another origin: M_to=M_from+(from-to) cross F."""
    f = _finite(wrench, 6); a = _finite(origin_mm, 3); b = _finite(destination_mm, 3)
    x, y, z = [(u-v)/1000 for u, v in zip(a, b)]
    return [*f[:3], f[3]+y*f[2]-z*f[1], f[4]+z*f[0]-x*f[2], f[5]+x*f[1]-y*f[0]]


def native_units(row):
    checked = _finite(row, 6)
    return [*checked[:3], *[v/1000 for v in checked[3:]]]


def recover_joint(row):
    """Recover physical cuts and balance independently observed load partitions.

    Members' raw K.u contain their equivalent body-load end cards. Subtract
    those cards exactly once before shifting to the physical cut. Component
    reactions act *on* the component; negate them to act on the joint. Direct
    loads are a partition of actual applied cards, never fitted to equilibrium.
    """
    reference = _finite(row['referenceXYZMm'], 3)
    if len(row['memberEnds']) != 2 or {r['role'] for r in row['memberEnds']} != {'lower', 'upper'}:
        raise ValueError('Exactly one actual lower and upper L end required')
    cuts = []
    for member in row['memberEnds']:
        corrected = add(member['rawMasterWrenchKN_KNmm'], scale(member['equivalentBodyLoadMasterKN_KNmm'], -1))
        physical = transport(native_units(corrected), member['masterXYZMm'], member['physicalCutXYZMm'])
        on_joint = scale(transport(physical, member['physicalCutXYZMm'], reference), -1)
        cuts.append({**member, 'forceOnMemberAtPhysicalCutKN_KNm':physical,
            'memberOnJointAtReferenceKN_KNm':on_joint})
    components = []
    for component in row['componentReactions']:
        on_joint = scale(transport(component['forceOnComponentKN_KNm'], component['originXYZMm'], reference), -1)
        components.append({**component, 'componentOnJointAtReferenceKN_KNm':on_joint})
    direct = [{**load, 'loadAtReferenceKN_KNm':transport(load['wrenchKN_KNm'], load['originXYZMm'], reference)}
        for load in row['directAppliedLoads']]
    terms = [r['memberOnJointAtReferenceKN_KNm'] for r in cuts]
    terms += [r['componentOnJointAtReferenceKN_KNm'] for r in components]
    terms += [r['loadAtReferenceKN_KNm'] for r in direct]
    residual = add(*terms)
    return {'id':row['id'], 'referenceXYZMm':reference, 'memberCuts':cuts, 'components':components,
        'directAppliedLoads':direct, 'freeBodyResidualKN_KNm':residual,
        'maximumAbsoluteResidualKN_KNm':max(abs(v) for v in residual),
        'rigidJointConstitutiveAssumptionRetained':True, 'finiteJointCapacityAvailable':False,
        'reinforcementAccepted':False, 'candidateAccepted':False}


def recover(observation):
    if observation.get('schema') != 'str-four-L-joint-observation/1':
        raise ValueError('Explicit source-bound four-L observation required')
    rows = observation['joints']
    if len(rows) != 4 or {r['id'] for r in rows} != {'SW','SE','NW','NE'}:
        raise ValueError('Exactly four distinct named physical L joints required')
    result = [recover_joint(row) for row in rows]
    return {'schema':'str-four-L-joint-free-bodies/1', 'joints':result,
        'maximumAbsoluteResidualKN_KNm':max(r['maximumAbsoluteResidualKN_KNm'] for r in result),
        'finiteJointCapacityAvailable':False, 'completeHouseProof':False, 'candidateAccepted':False}


def verify_passivity(ordinary, observed):
    """Join a genuinely executed ordinary control to its passive observation."""
    observation = observed['observation']
    if ordinary.get('schema') != 'str-four-L-joint-ordinary-control/1':
        raise ValueError('Executed ordinary full-result control required')
    for key in ('sourceSHA256','requestSHA256','caseId','runtimeThreads','fullNativeResultSHA256',
            'heads','physicalCutSHA256','physicalHeadCount','numericalRuntime'):
        if ordinary[key] != observation[key]:
            raise ValueError('Passive observer changed or mismatched ordinary native '+key)
    if ordinary['physicalHeadCount'] != 52 or len({r['id'] for r in ordinary['heads']}) != 52:
        raise ValueError('Actual52 distinct physical foundation heads required')
    regenerated = recover(observation)
    if regenerated != observed['freeBodies']:
        raise ValueError('Stored free bodies differ from pure recovery of observed input')
    if regenerated['maximumAbsoluteResidualKN_KNm'] > 1e-5:
        raise ValueError('Observed physical joint free body fails explicit1e-5kN/kNm closure')
    return {'ordinaryFullNativeResultSHA256':ordinary['fullNativeResultSHA256'],
        'observedFullNativeResultSHA256':observation['fullNativeResultSHA256'],
        'exactFullResultEqualityVerified':True,'physicalHeadCount':52,
        'exactPhysicalHeadAndCutEqualityVerified':True,'finiteJointCapacityAvailable':False}
