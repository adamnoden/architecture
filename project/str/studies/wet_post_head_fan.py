"""Pure nominal compression-fan prototype. No file I/O, builder or resistance proof.

Coordinates mm; force kN; moments kNm. Virtual targets are intersections of
extended straight hoop-leg axes, not actual anchored or finite concrete nodes.
"""
import copy
import hashlib
import json
import math
import re


class Unsupported(ValueError):
    def __init__(self, code, message):
        super().__init__(message)
        self.code = code


def finite(v):
    return type(v) in (int, float) and math.isfinite(v)


def vector(v, length):
    return isinstance(v, (list, tuple)) and len(v) == length and all(finite(x) for x in v)


def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(',', ':'), allow_nan=False).encode()).hexdigest()


def cage_geometry_digest(cage):
    # JSON crosses JavaScript: integral floats return as integers. Bind numeric
    # values, including all nonintegral path coordinates, rather than spelling.
    def normalized(value):
        if isinstance(value, dict):return {k:normalized(v) for k,v in value.items()}
        if isinstance(value, list):return [normalized(v) for v in value]
        if type(value) is float and math.isfinite(value) and value.is_integer():return int(value)
        return value
    return digest(normalized({key: cage[key] for key in ('settings', 'mainBars', 'links')}))


def cross(a, b):
    return [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]]


def wrench(force, point_mm):
    return [*force, *cross([v/1000 for v in point_mm], force)]


def transport(w, from_mm, to_mm):
    m = cross([(a-b)/1000 for a, b in zip(from_mm, to_mm)], w[:3])
    return [*w[:3], *[a+b for a,b in zip(w[3:], m)]]


def summed(rows, count):
    return [math.fsum(r[i] for r in rows) for i in range(count)]


def unsupported(code, message, **extra):
    return {'status': 'unsupported', 'diagnostics': [{'code': code, 'message': message}], **extra,
            'finiteCCTNodesAccepted': False, 'anchorageAccepted': False,
            'fullSectionContinuationAccepted': False, 'toleranceDomainAccepted': False,
            'resistanceAccepted': False, 'completeSignedLoadEnvelope': False}


def compression_fan(loads, half_axes_xy_mm, depth_mm):
    """Positive-weight four-target truss from explicit vertical top forces.

    loads: unique {id, xyMm:[x,y], forceDownKN}, relative to the head centroid.
    This method requires every actual force nonnegative; it never clips one.
    """
    try:
        if not vector(half_axes_xy_mm, 2) or min(half_axes_xy_mm) <= 0 or not finite(depth_mm) or depth_mm <= 0:
            raise Unsupported('FAN_GEOMETRY_UNSUPPORTED', 'Positive finite virtual half axes and depth required')
        if not isinstance(loads, list) or not loads or any(not isinstance(r, dict) or not isinstance(r.get('id'), str)
                or not vector(r.get('xyMm'), 2) or not finite(r.get('forceDownKN')) for r in loads):
            raise Unsupported('FAN_INPUT_MISSING', 'Explicit unique actual vertical load origins required')
        if len({r['id'] for r in loads}) != len(loads):
            raise Unsupported('FAN_INPUT_DUPLICATED', 'Repeated actual force origin')
        if any(r['forceDownKN'] < 0 for r in loads):
            raise Unsupported('FAN_TENSION_UNSUPPORTED', 'Raw negative forces retained; a compression fan cannot carry them')
        a, b = half_axes_xy_mm
        outside = [r['id'] for r in loads if r['forceDownKN'] > 0 and (abs(r['xyMm'][0]) > a or abs(r['xyMm'][1]) > b)]
        if outside:
            return unsupported('FAN_NEGATIVE_WEIGHT_DOMAIN', 'Actual loads exceed this virtual fan; do not clip or reject the whole post', outboardLoadIds=outside)
        total = math.fsum(r['forceDownKN'] for r in loads)
        if total == 0:
            return {'status': 'not-loaded-not-applicable', 'centreOfPressureMm': None, 'nodes': [], 'ties': [],
                    'finiteCCTNodesAccepted': False, 'anchorageAccepted': False, 'resistanceAccepted': False,
                    'toleranceDomainAccepted': False, 'completeSignedLoadEnvelope': False}
        terms = {(sx,sy): [] for sx in (-1,1) for sy in (-1,1)}
        minimum_weight = 1.; maximum_top_h = 0.
        for load in loads:
            x,y = load['xyMm']; F = load['forceDownKN']; top = []
            for sx,sy in terms:
                weight = (1+sx*x/a)*(1+sy*y/b)/4
                minimum_weight = min(minimum_weight, weight)
                force = F*weight
                row = [force*(sx*a-x)/depth_mm, force*(sy*b-y)/depth_mm, -force]
                terms[sx,sy].append(row); top.append(row)
            top_sum = summed(top,3)
            maximum_top_h = max(maximum_top_h, abs(top_sum[0]), abs(top_sum[1]))
        nodes = {k: {'signXY': list(k), 'virtualXYZMm': [k[0]*a,k[1]*b,-depth_mm],
                     'incomingStrutForceKN': summed(v,3)} for k,v in terms.items()}
        ties = []
        for axis in (0,1):
            for fixed in (-1,1):
                negative = nodes[-1,fixed] if axis == 0 else nodes[fixed,-1]
                positive = nodes[1,fixed] if axis == 0 else nodes[fixed,1]
                left, right = negative['incomingStrutForceKN'][axis], positive['incomingStrutForceKN'][axis]
                if abs(left+right) > 1e-10 or right < 0:
                    raise Unsupported('FAN_TIE_EQUILIBRIUM_FAILED', 'Opposite actual node forces do not form a tension tie')
                ties.append({'axis': 'X' if axis == 0 else 'Y', 'fixedSign': fixed,
                             'forceKN': right, 'oppositeNodeResidualKN': left+right})
        top_wrench = summed([wrench([0,0,-r['forceDownKN']], [*r['xyMm'],0]) for r in loads],6)
        bottom_wrench = summed([wrench([0,0,-r['incomingStrutForceKN'][2]], r['virtualXYZMm']) for r in nodes.values()],6)
        residual = summed([top_wrench,bottom_wrench],6)
        if max(abs(v) for v in residual) > 1e-8 or maximum_top_h > 1e-8:
            raise Unsupported('FAN_EQUILIBRIUM_FAILED', 'Explicit force and moment closure failed')
        return {'status': 'computed-nominal-equilibrium', 'halfAxesXYMm': list(half_axes_xy_mm), 'depthMm': depth_mm,
                'inputLoads': copy.deepcopy(loads), 'nodes': list(nodes.values()), 'ties': ties,
                'centreOfPressureMm': [math.fsum(r['forceDownKN']*r['xyMm'][i] for r in loads)/total for i in (0,1)],
                'inputHeadWrenchKN_KNm': top_wrench, 'bottomFanReactionWrenchAtHeadKN_KNm': bottom_wrench,
                'freeBodyResidualKN_KNm': residual, 'maximumTopHorizontalResidualKN': maximum_top_h,
                'minimumBranchWeight': minimum_weight, 'finiteCCTNodesAccepted': False, 'anchorageAccepted': False,
                'fullSectionContinuationAccepted': False, 'toleranceDomainAccepted': False,
                'resistanceAccepted': False, 'completeSignedLoadEnvelope': False}
    except Unsupported as exc:
        return unsupported(exc.code, str(exc))


def hoop_geometry(links, post_index, centroid, post_top, post_bottom):
    perimeters = [r for r in links if r['id'].startswith(f'STR/WET-CAGE/post/{post_index}/link/') and '/cross/' not in r['id']]
    def plane(path):
        points = [p for part in path['parts'] for p in part['points']]
        if not points or not all(vector(p,3) for p in points):
            raise Unsupported('FAN_CAGE_GEOMETRY_MISSING', 'Finite actual path coordinates required')
        return (min(p[2] for p in points)+max(p[2] for p in points))/2
    if len(perimeters) < 2:
        raise Unsupported('FAN_CAGE_GEOMETRY_MISSING', 'At least two actual perimeter levels required')
    perimeters.sort(key=plane, reverse=True); path=perimeters[1]; level=plane(path)
    if not post_bottom < level < post_top:
        raise Unsupported('FAN_CAGE_LEVEL_UNSUPPORTED', 'The actual second-highest hoop must lie inside the post')
    legs=[]
    for part in path['parts']:
        if part['kind'] != 'line' or len(part['points']) != 2: continue
        p,q=part['points']
        if max(abs(p[2]-level),abs(q[2]-level)) > 1e-7: continue
        if abs(p[0]-q[0]) < 1e-7 and abs(p[1]-q[1]) > 1e-7:
            legs.append({'axis':'Y','constantMm':p[0]-centroid[0],'actualEndpointsXYZMm':[p,q]})
        elif abs(p[1]-q[1]) < 1e-7 and abs(p[0]-q[0]) > 1e-7:
            legs.append({'axis':'X','constantMm':p[1]-centroid[1],'actualEndpointsXYZMm':[p,q]})
    xs=sorted(set(r['constantMm'] for r in legs if r['axis']=='Y')); ys=sorted(set(r['constantMm'] for r in legs if r['axis']=='X'))
    if len(xs)!=2 or len(ys)!=2 or min(xs[1],ys[1])<=0 or max(abs(xs[0]+xs[1]),abs(ys[0]+ys[1]))>1e-8:
        raise Unsupported('FAN_CAGE_AXES_UNSUPPORTED', 'Actual centred orthogonal straight-leg axes required')
    return {'hoopId':path['id'],'levelZMm':level,'depthMm':post_top-level,'halfAxesXYMm':[xs[1],ys[1]],'actualStraightLegs':legs,
            'virtualTargetsAreActualAnchoredNodes':False}


def pad_placement_domain(support_settings, cage_settings, pad_centre, post_centre, half_axes):
    """Necessary geometric containment in a virtual fan, never a node/bar pass.

    Independent pad-to-post, whole-cage and link-fabrication bounds are charged
    once each. Main-bar placement is not a virtual hoop-axis displacement and
    is not silently substituted for the independently authored cage bound.
    """
    pad = [support_settings['padWidthMm'], support_settings['padLengthMm']]
    allowances = {
        'padToPostRelative': support_settings['combinedRelativePlacementToleranceMm'],
        'cageInstallation': cage_settings['cageInstallationToleranceMm'],
        'linkFabrication': cage_settings['linkFabricationToleranceMm'],
    }
    if (not vector(pad, 2) or min(pad) <= 0 or not vector(pad_centre, 2)
            or not vector(post_centre, 2) or not vector(half_axes, 2) or min(half_axes) <= 0
            or any(not finite(value) or value < 0 for value in allowances.values())):
        raise Unsupported('FAN_PLACEMENT_INPUT_UNSUPPORTED', 'Actual pad, virtual axes and explicit independent nonnegative source bounds required')
    offset = [a-b for a,b in zip(pad_centre,post_centre)]
    independent_bound = math.fsum(allowances.values())
    reserve = [a-abs(d)-p/2-independent_bound for a,d,p in zip(half_axes,offset,pad)]
    return {
        'schema': 'str-wet-fan-necessary-placement-domain/1',
        'actualPadRelativeCentreXYMm': offset, 'padDimensionsXYMm': pad,
        'virtualHalfAxesXYMm': list(half_axes), 'independentBoundsMm': allowances,
        'combinedIndependentBoundMm': independent_bound,
        'positiveFanDomainEnvelopeReserveXYMm': reserve,
        'minimumReserveMm': min(reserve),
        'wholePadEnvelopeWithinVirtualDomain': min(reserve) >= 0,
        'toleranceDomainAccepted': False, 'finiteCCTNodesAccepted': False,
        'anchorageAccepted': False,
        'scope': 'Necessary whole-pad outline containment in extended straight-leg virtual axes under the declared independent coordinate bounds. No re-equilibrated placement state, finite rounded node, bar force introduction or complete tolerance/resistance acceptance.',
    }


def recover_wet_head_fans(native, cage, binding):
    """Source/request/cage-bound wrapper, called after native-floor validation.

    binding = {sourceSHA256, request, nativeCaseId, cageGeometrySHA256}. It is
    supplied by the authoritative caller, never inferred from the result.
    """
    try:
        if not all(isinstance(v,dict) for v in (native,cage,binding)):
            raise Unsupported('FAN_BINDING_MISSING','Explicit native, cage paths and caller binding required')
        required={'sourceSHA256','request','nativeCaseId','cageGeometrySHA256'}
        if set(binding)!=required or not isinstance(binding['sourceSHA256'],dict) or not binding['sourceSHA256']:
            raise Unsupported('FAN_BINDING_MISSING','Complete explicit caller binding required')
        if any(not isinstance(path,str) or not path.startswith('project/') or '..' in path.split('/') or not isinstance(sha,str) or not re.fullmatch('[a-f0-9]{64}',sha) for path,sha in binding['sourceSHA256'].items()) or not isinstance(binding['nativeCaseId'],str) or not re.fullmatch('[A-Za-z][A-Za-z0-9._:-]*',binding['nativeCaseId']):
            raise Unsupported('FAN_BINDING_MALFORMED','Stable source paths, SHA256 values and case ID required')
        if native.get('sourceSHA256')!=binding['sourceSHA256'] or cage.get('nativeSourceSHA256')!=binding['sourceSHA256']:
            raise Unsupported('FAN_NATIVE_SOURCE_STALE','Native/cage sources differ from the current caller binding')
        if native.get('request')!=binding['request'] or native['request'].get('sourceSHA256')!=binding['sourceSHA256']:
            raise Unsupported('FAN_REQUEST_STALE','Actual native request differs from the current caller binding')
        if native['nativeVertical']['native']['caseId']!=binding['nativeCaseId'] or cage.get('nativeCaseId')!=binding['nativeCaseId']:
            raise Unsupported('FAN_CASE_STALE','Actual native/cage case identity differs')
        if cage_geometry_digest(cage)!=binding['cageGeometrySHA256']:
            raise Unsupported('FAN_CAGE_SOURCE_STALE','Supplied paths/settings differ from explicit current geometry')
        if native.get('schema')!='str-coupled-floor-section-result/1' or native.get('candidateAccepted') is not False or native.get('completeHouseProof') is not False:
            raise Unsupported('FAN_NATIVE_UNSUPPORTED','Explicit unadopted native floor response required')
        wet=native['seatedWetSupport']; settings=cage['settings']
        if wet['physicalAcceptance'] is not False or wet['settings']!=native['request']['wetSupport']:
            raise Unsupported('FAN_SUPPORT_STALE','Actual support settings and unqualified status required')
        posts=wet['posts']; contacts=wet['contactFibres']; links=cage['links']
        if len(posts)!=2 or len({p['id'] for p in posts})!=2 or not isinstance(contacts,list) or not isinstance(links,list) or any(not isinstance(p,dict) or not isinstance(p.get('id'),str) for p in links) or len({p['id'] for p in links})!=len(links):
            raise Unsupported('FAN_INPUT_MISSING','Both actual posts, contact inventory and unique cage paths required')
        order=wet['settings']['bearingQuadratureOrder']
        if type(order) is not int or order not in (2,4,8,16,32,64) or len(contacts)!=2*order*order or len({r['id'] for r in contacts})!=len(contacts):
            raise Unsupported('FAN_CONTACT_INVENTORY_MISSING','All actual unique quadrature observations required')
        if any(not vector(r['pointXYZMm'],3) or not finite(r['normalCompressionKN']) or r['receiverIndex'] not in (0,1) for r in contacts):
            raise Unsupported('FAN_CONTACT_INPUT_UNSUPPORTED','Finite actual contact force and origin required')
        g=native['request']['bearingCase']['masonryCase']['verticalCase']['monolithicCase']['houseCase']['boundary']['physicalGFactor']
        if not finite(g) or g<0:raise Unsupported('FAN_GRAVITY_UNSUPPORTED','Actual finite nonnegative gravity factor required')
        rows=[]
        for index,post in enumerate(posts):
            rect=post['rectangleXYMm']; top=post['physicalTopZMm']; bottom=post['physicalBottomZMm']; raw=post['recovery']['physicalEndWrenchesKN_KNmm']
            if not vector(rect,4) or rect[2]<=rect[0] or rect[3]<=rect[1] or not all(finite(v) for v in (top,bottom)) or top<=bottom or not vector(raw,12):
                raise Unsupported('FAN_POST_INPUT_UNSUPPORTED','Actual finite post geometry and both six-actions required')
            if not finite(post['physicalGKN']) or post['physicalGKN']<0 or not finite(post['padPhysicalGKN']) or post['padPhysicalGKN']<0 or not vector(post['padCentreXYMm'],2):
                raise Unsupported('FAN_MASS_INPUT_MISSING','Actual separate post and pad gravity origins required')
            centre=[(rect[0]+rect[2])/2,(rect[1]+rect[3])/2]; geom=hoop_geometry(links,index,centre,top,bottom)
            loaded=[r for r in contacts if r['receiverIndex']==index]
            if len(loaded)!=order*order:raise Unsupported('FAN_CONTACT_INVENTORY_MISSING','Missing actual post quadrature samples')
            loads=[{'id':r['id'],'xyMm':[r['pointXYZMm'][i]-centre[i] for i in (0,1)],'forceDownKN':r['normalCompressionKN']} for r in loaded]
            loads.append({'id':'actual-factored-pad-G','xyMm':[post['padCentreXYMm'][i]-centre[i] for i in (0,1)],'forceDownKN':g*post['padPhysicalGKN']})
            placement=pad_placement_domain(wet['settings'],settings,post['padCentreXYMm'],centre,geom['halfAxesXYMm'])
            fan=compression_fan(loads,geom['halfAxesXYMm'],geom['depthMm']); row={'id':post['id'],'geometry':geom,'fan':fan,'necessaryPlacementDomain':placement}
            if fan['status']=='computed-nominal-equilibrium':
                body=g*post['physicalGKN']; height=top-bottom; H=geom['depthMm']; q=body/height; top_w=[*raw[6:9],*[v/1000 for v in raw[9:12]]]
                expected_base=transport(top_w,[0,0,top],[0,0,bottom]);expected_base[2]-=body
                base=[*raw[:3],*[v/1000 for v in raw[3:6]]];base_residual=summed([base,expected_base],6)
                head_residual=[a-b for a,b in zip(fan['inputHeadWrenchKN_KNm'],top_w)]
                if max(abs(v) for v in [*base_residual,*head_residual])>1e-6:
                    raise Unsupported('FAN_SOURCE_ACTION_MISMATCH','Actual contact/pad/body origins do not recover the source post six-actions')
                body_top=wrench([0,0,-q*H],[0,0,-H/2]);body_bottom=wrench([0,0,q*H],[0,0,-H])
                total_residual=summed([fan['freeBodyResidualKN_KNm'],body_top,body_bottom],6)
                section=transport(top_w,[0,0,top],[0,0,top-H]);section[2]-=q*H
                reaction=transport(fan['bottomFanReactionWrenchAtHeadKN_KNm'],[0,0,top],[0,0,top-H]);reaction[2]+=q*H
                row.update(actualHeadWrenchKN_KNm=top_w,actualBaseWrenchKN_KNm=base,postBodyGravityInTopZoneKN=q*H,
                    actualBodyWrenchAtHeadKN_KNm=body_top,uniformBodyBottomReactionAtHeadKN_KNm=body_bottom,
                    fullFreeBodyResidualKN_KNm=total_residual,sourceHeadResidualKN_KNm=head_residual,sourceBaseResidualKN_KNm=base_residual,
                    transportedSourceSectionWrenchKN_KNm=section,bottomInterfaceSourceResidualKN_KNm=summed([section,reaction],6),
                    bodyGravityRoute='Centred uniform post self-G once, retained as a separate vertical field and its centroidal bottom reaction. No force spreading or compatible B-region law is earned.')
                diameter=settings['linkDiameterMm'];fy=settings['sourceSteelYieldMPa'];fraction=settings['comparisonSteelFraction'];bond=settings['sourcePoorBondMPa']
                if not all(finite(v) and v>0 for v in (diameter,fy,fraction,bond)) or fraction>1:
                    raise Unsupported('FAN_MATERIAL_INPUT_UNSUPPORTED','Explicit existing necessary steel comparison inputs required')
                area=math.pi*diameter**2/4;cap=area*fy*fraction/1000
                for tie in fan['ties']:
                    stress=tie['forceKN']*1000/(area*fraction)
                    tie.update(nominalSingleLegSteelOnlyCapacityKN=cap,necessarySteelOnlyRatio=tie['forceKN']/cap,
                        requiredStressAtComparisonFractionMPa=stress,basicPoorBondLengthMm=diameter*stress/(4*bond),anchorageAccepted=False)
            elif fan['status']=='not-loaded-not-applicable':
                if max(abs(v) for v in raw)>1e-6 or g*post['physicalGKN']!=0:
                    raise Unsupported('FAN_UNLOADED_SOURCE_MISMATCH','No invented unloaded state may erase actual post actions or body G')
            rows.append(row)
        return {'schema':'str-nominal-wet-post-head-fan/1','status':'unsupported' if any(r['fan']['status']=='unsupported' for r in rows) else 'computed-nominal-demand',
                'sourceBinding':copy.deepcopy(binding),'posts':rows,'finiteCCTNodesAccepted':False,'anchorageAccepted':False,
                'fullSectionContinuationAccepted':False,'toleranceDomainAccepted':False,'resistanceAccepted':False,'completeSignedLoadEnvelope':False,
                'scope':'Nominal virtual-fan equilibrium only. Actual rounded bend/node stress, hook development, post-section continuation, placement domain and complete signed loading remain unsupported.'}
    except Unsupported as exc:
        return unsupported(exc.code,str(exc))
    except (KeyError,TypeError,ValueError,IndexError) as exc:
        return unsupported('FAN_INPUT_MISSING_OR_MALFORMED',str(exc))
