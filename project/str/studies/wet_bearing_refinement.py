"""Numerical normal-pad convergence at unchanged physical geometry and laws.

Every input is an actually re-equilibrated native floor response. The exact
clipped affine field is a diagnostic of that same response, not a new solve or
a physical contact/material model. No method here supplies resistance.
"""
import copy
import math
from seated_wet_support import bearing_quadrature, exact_bearing_field


def _criteria(criteria):
    names = ('forceAbsoluteKN', 'forceRelative', 'centreOfPressureAbsoluteMm',
             'unloadedForceKN', 'maximum52HeadComponentDifferenceKN_KNm', 'maximumRawTensileResidualKN')
    if set(criteria) != set(names) or any(
            type(criteria[k]) not in (int, float) or not math.isfinite(criteria[k])
            or criteria[k] <= 0 for k in names):
        raise ValueError('Explicit finite positive numerical criteria required')


def assess_contact(result, criteria):
    _criteria(criteria)
    support = result.get('seatedWetSupport')
    if result.get('schema') != 'str-coupled-floor-section-result/1' or not support or support.get('physicalAcceptance') is not False:
        raise ValueError('Executed unqualified wet-support response required')
    settings = support['settings']
    if result.get('sourceSHA256') != result['request'].get('sourceSHA256') or result['request'].get('wetSupport') != settings:
        raise ValueError('Matching source/request/settings identities required')
    order = settings['bearingQuadratureOrder']
    if type(order) is not int or order not in (8, 16, 32, 64):
        raise ValueError('Explicit coupled refinement order8/16/32/64 required')
    posts = support['posts']
    if len(posts) != 2 or len({p['id'] for p in posts}) != 2:
        raise ValueError('Both actual unique wet posts required')
    contacts = support['contactFibres']
    if len(contacts) != len(posts) * order ** 2 or len({p['id'] for p in contacts}) != len(contacts):
        raise ValueError('Complete unique actual quadrature contact inventory required')
    rows = []
    for index, post in enumerate(posts):
        fibres = [r for r in contacts if r['receiverIndex'] == index]
        if len(fibres) != order ** 2:
            raise ValueError('Missing actual post contact samples')
        centre = post['padCentreXYMm']
        rectangle = post['padFit']['nominalRectangleXYMm']
        receiver = post['rectangleXYMm']
        if len(centre) != 2 or len(rectangle) != 4 or any(not math.isfinite(v) for v in [*centre, *rectangle]):
            raise ValueError('Actual pad coordinates required')
        if rectangle[2] <= rectangle[0] or rectangle[3] <= rectangle[1]:
            raise ValueError('Positive actual pad footprint required')
        if len(receiver) != 4 or any(not math.isfinite(v) for v in receiver) or receiver[2] <= receiver[0] or receiver[3] <= receiver[1]:
            raise ValueError('Positive actual receiving-post footprint required')
        post_centre = [(receiver[j] + receiver[j + 2]) / 2 for j in (0, 1)]
        coordinate_key = lambda x, y: (round(x, 8), round(y, 8))
        expected_rule = {coordinate_key(x, y): area for x, y, area in bearing_quadrature(rectangle, order)}
        observed_points = set()
        for r in fibres:
            if not math.isfinite(r['normalCompressionKN']) or r['normalCompressionKN'] < -criteria['maximumRawTensileResidualKN']:
                raise ValueError('Normal tractions exceed declared numerical tensile-residual bound')
            if len(r['pointXYZMm']) != 3 or any(not math.isfinite(v) for v in r['pointXYZMm']):
                raise ValueError('Finite actual contact origins required')
            if any(r['pointXYZMm'][j] < rectangle[j] or r['pointXYZMm'][j] > rectangle[j + 2] for j in (0, 1)):
                raise ValueError('Contact origin lies outside its actual pad')
            key = coordinate_key(*r['pointXYZMm'][:2])
            if key in observed_points or key not in expected_rule or not math.isfinite(r['areaMm2']) or abs(r['areaMm2'] - expected_rule[key]) > 1e-10 * max(1, expected_rule[key]):
                raise ValueError('Actual sample coordinates/weights differ from the declared Gauss rule')
            observed_points.add(key)
        # Recover the actual affine gap from non-collinear named physical samples;
        # do not trust a stored exact-force diagnostic as its own proof.
        origin = fibres[0]['pointXYZMm']
        gap0 = fibres[0]['relativeDisplacementMm']
        plane = None
        for u in fibres[1:]:
            ux, uy = [u['pointXYZMm'][j] - origin[j] for j in (0, 1)]
            for v in fibres[1:]:
                vx, vy = [v['pointXYZMm'][j] - origin[j] for j in (0, 1)]
                det = ux * vy - uy * vx
                if abs(det) <= 1e-8:
                    continue
                gu, gv = u['relativeDisplacementMm'] - gap0, v['relativeDisplacementMm'] - gap0
                px, py = (gu * vy - uy * gv) / det, (ux * gv - gu * vx) / det
                plane = [gap0 - px * origin[0] - py * origin[1], px, py]
                break
            if plane is not None:
                break
        if plane is None or any(not math.isfinite(v) for v in plane):
            raise ValueError('Three actual non-collinear finite gap samples required')
        compliance = settings['jointNormalComplianceMmPerMPa']
        if not math.isfinite(compliance) or compliance <= 0:
            raise ValueError('Actual positive normal compliance required')
        for r in fibres:
            x, y, _ = r['pointXYZMm']
            gap = plane[0] + plane[1] * x + plane[2] * y
            if not math.isfinite(r['relativeDisplacementMm']) or abs(gap - r['relativeDisplacementMm']) > 1e-9:
                raise ValueError('Contact samples contradict one actual affine gap plane')
            expected = max(-gap, 0) / compliance * r['areaMm2'] / 1000
            if not math.isfinite(expected) or r['areaMm2'] <= 0 or abs(expected - r['normalCompressionKN']) > criteria['maximumRawTensileResidualKN']:
                raise ValueError('Actual normal tractions contradict the declared unilateral law')
        exact = exact_bearing_field(rectangle, plane, compliance)
        f = sum(r['normalCompressionKN'] for r in fibres)
        m = [sum(r['normalCompressionKN'] * (r['pointXYZMm'][j] - centre[j]) for r in fibres) for j in (0, 1)]
        ef = exact['normalCompressionKN']
        em = [exact[k] - ef * centre[j] for j, k in enumerate(
            ('compressionFirstMomentXKNmm', 'compressionFirstMomentYKNmm'))]
        post_m = [m[j] + f * (centre[j] - post_centre[j]) for j in (0, 1)]
        exact_post_m = [em[j] + ef * (centre[j] - post_centre[j]) for j in (0, 1)]
        if any(not math.isfinite(v) for v in [f, *m, ef, *em]) or ef < 0:
            raise ValueError('Finite exact same-plane force and first moments required')
        force_limit = criteria['forceAbsoluteKN'] + criteria['forceRelative'] * ef
        loaded = max(f, ef) > criteria['unloadedForceKN']
        if loaded and min(f, ef) <= 0:
            cop = exact_cop = None
            cop_error = None
            moment_pass = False
        elif loaded:
            cop, exact_cop = [v / f for v in m], [v / ef for v in em]
            cop_error = [a - b for a, b in zip(cop, exact_cop)]
            moment_pass = max(abs(v) for v in cop_error) <= criteria['centreOfPressureAbsoluteMm']
        else:
            cop = exact_cop = cop_error = None
            # Bounded post-relative moments replace a centroid divided by near-zero N.
            limits = [criteria['forceAbsoluteKN'] * max(abs(rectangle[j] - post_centre[j]),
                       abs(rectangle[j + 2] - post_centre[j])) for j in (0, 1)]
            moment_pass = all(abs(a - b) <= lim for a, b, lim in zip(post_m, exact_post_m, limits))
        rows.append({'id': post['id'], 'padRectangleXYMm': rectangle, 'padCentreXYMm': centre,
                     'postRectangleXYMm': receiver, 'postAxisXYMm': post_centre,
                     'reconstructedActualGapPlaneMm': plane,
                     'normalCompressionKN': f, 'exactSamePlaneCompressionKN': ef,
                     'padRelativeFirstMomentsKNmm': m, 'exactSamePlanePadRelativeFirstMomentsKNmm': em,
                     'postRelativeFirstMomentsKNmm': post_m, 'exactSamePlanePostRelativeFirstMomentsKNmm': exact_post_m,
                     'minimumRawNormalCompressionKN': min(r['normalCompressionKN'] for r in fibres),
                     'maximumRawTensileResidualKN': max(0, -min(r['normalCompressionKN'] for r in fibres)),
                     'forceErrorKN': f - ef, 'forceErrorLimitKN': force_limit,
                     'centreOfPressureFromPadCentreMm': cop, 'exactSamePlaneCentreFromPadCentreMm': exact_cop,
                     'centreOfPressureErrorMm': cop_error, 'loadedForCentroidComparison': loaded,
                     'forceComparisonPassing': abs(f - ef) <= force_limit,
                     'firstMomentOrCentroidComparisonPassing': moment_pass,
                     'numericalSamePlaneIntegrationPassing': abs(f - ef) <= force_limit and moment_pass})
    return {'schema': 'str-wet-bearing-contact-integration/1', 'order': order, 'criteria': copy.deepcopy(criteria),
            'posts': rows, 'numericalSamePlaneIntegrationPassing': all(r['numericalSamePlaneIntegrationPassing'] for r in rows),
            'physicalContactAccepted': False, 'postHeadResistanceAccepted': False}


def compare_contacts(coarse, fine, criteria):
    """Compare re-equilibrated fields differing only in quadrature order."""
    a, b = assess_contact(coarse, criteria), assess_contact(fine, criteria)
    if b['order'] != 2 * a['order']:
        raise ValueError('One actual order doubling required')
    ca, cb = copy.deepcopy(coarse['request']), copy.deepcopy(fine['request'])
    ca['wetSupport'].pop('bearingQuadratureOrder')
    cb['wetSupport'].pop('bearingQuadratureOrder')
    if ca != cb or coarse['sourceSHA256'] != fine['sourceSHA256']:
        raise ValueError('Identical current sources and physical requests required')
    native_a, native_b = [r['nativeVertical']['native'] for r in (coarse, fine)]
    heads = []
    for native in (native_a, native_b):
        h = {row['id']: row['reactionKN_KNm'] for row in native['heads']}
        if len(native['heads']) != 52 or len(h) != 52 or any(
                len(w) != 6 or any(not math.isfinite(v) for v in w) for w in h.values()):
            raise ValueError('All52 actual finite six-component head reactions required')
        heads.append(h)
    if set(heads[0]) != set(heads[1]):
        raise ValueError('Unchanged actual head identities required')
    maximum_head = max(abs(v - w) for k in heads[0] for v, w in zip(heads[0][k], heads[1][k]))
    rows = []
    for x, y in zip(a['posts'], b['posts']):
        if any(x[k] != y[k] for k in ('id', 'padRectangleXYMm', 'padCentreXYMm', 'postRectangleXYMm', 'postAxisXYMm')):
            raise ValueError('Unchanged actual pad origins and footprints required')
        limit = criteria['forceAbsoluteKN'] + criteria['forceRelative'] * max(x['normalCompressionKN'], y['normalCompressionKN'])
        difference = y['normalCompressionKN'] - x['normalCompressionKN']
        xc, yc = x['centreOfPressureFromPadCentreMm'], y['centreOfPressureFromPadCentreMm']
        if xc is not None and yc is not None:
            centres = [v - w for v, w in zip(yc, xc)]
            moment_pass = max(abs(v) for v in centres) <= criteria['centreOfPressureAbsoluteMm']
        elif xc is None and yc is None and not x['loadedForCentroidComparison'] and not y['loadedForCentroidComparison']:
            centres = None
            r, c = x['padRectangleXYMm'], x['postAxisXYMm']
            moment_pass = all(abs(v - w) <= criteria['forceAbsoluteKN'] * max(abs(r[j] - c[j]), abs(r[j + 2] - c[j]))
                              for j, (v, w) in enumerate(zip(x['postRelativeFirstMomentsKNmm'], y['postRelativeFirstMomentsKNmm'])))
        else:
            centres, moment_pass = None, False
        rows.append({'id': x['id'], 'normalForceDifferenceKN': difference, 'forceDifferenceLimitKN': limit,
                     'centreOfPressureDifferenceMm': centres,
                     'coupledLocalComparisonPassing': abs(difference) <= limit and moment_pass})
    return {'schema': 'str-wet-bearing-coupled-refinement/1', 'coarseOrder': a['order'], 'fineOrder': b['order'],
            'coarse': a, 'fine': b, 'posts': rows, 'maximum52HeadComponentDifferenceKN_KNm': maximum_head,
            'numericalRefinementPassing': a['numericalSamePlaneIntegrationPassing'] and b['numericalSamePlaneIntegrationPassing']
                and all(r['coupledLocalComparisonPassing'] for r in rows)
                and maximum_head <= criteria['maximum52HeadComponentDifferenceKN_KNm'],
            'scope': 'Tested coupled quadrature refinement at fixed physical laws and floor discretisation; no asymptotic error bound, local concrete/material, corner-stress, resistance or whole-house acceptance.',
            'physicalContactAccepted': False, 'postHeadResistanceAccepted': False}
