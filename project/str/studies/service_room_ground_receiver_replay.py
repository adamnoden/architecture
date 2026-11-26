"""Independent opposite-end cut equilibrium replay; no production imports/solve.

This checks the supplied discrete receiver result, not its source provenance,
material/contact convergence, resistance or complete load envelope.
"""
import argparse
import copy
import json
import math
from collections import defaultdict


FIELDS = ('axialCompressionKN', 'shearYKN', 'shearZKN',
          'torsionKNm', 'bendingYKNm', 'bendingZKNm')


def vector(value, size=3):
    if not isinstance(value, (list, tuple)) or len(value) != size or any(
        type(v) not in (int, float) or not math.isfinite(v) for v in value
    ):
        raise ValueError('Finite physical vector required')
    return list(value)


def add(a, b):
    return [v + w for v, w in zip(a, b)]


def sub(a, b):
    return [v - w for v, w in zip(a, b)]


def scale(a, factor):
    return [factor * v for v in a]


def cross(a, b):
    return [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2],
            a[0]*b[1]-a[1]*b[0]]


def dot(a, b):
    return math.fsum(v*w for v, w in zip(a, b))


def check(result, gravity_factor, tolerance=1e-8):
    if type(gravity_factor) not in (int, float) or not math.isfinite(gravity_factor) or gravity_factor < 0:
        raise ValueError('Finite nonnegative physical gravity factor required')
    if not result['physicalElementCutsAvailable']:
        raise ValueError('Actual discrete physical cuts are unavailable')
    names = result['memberIds']
    if not names or len(names) != len(set(names)):
        raise ValueError('Unique actual receiver member IDs required')
    origins = result['origins']
    if len(origins) != result['originCount'] or len({o['id'] for o in origins}) != len(origins):
        raise ValueError('Unique complete origin catalogue required')
    ends = defaultdict(dict)
    loads = defaultdict(list)
    cuts = defaultdict(list)
    for row in result['memberCuts']:
        name, end = row['memberId'], row['end']
        if name not in names or end not in (0, 1) or end in ends[name]:
            raise ValueError('Exactly two distinct physical endpoint rows required')
        vector(row['physicalPointMm'])
        vector(row['globalPhysicalEndWrenchKN_KNm'], 6)
        ends[name][end] = row
    if set(ends) != set(names) or any(set(v) != {0, 1} for v in ends.values()):
        raise ValueError('Missing receiver physical end')
    for origin in origins:
        if origin['memberId'] not in names or origin['family'] not in ('physical-G', 'solved-interface'):
            raise ValueError('Unsupported receiver origin/factor family')
        loads[origin['memberId']].append(origin)
    for row in result['interiorMemberCuts']:
        if row['memberId'] not in names or row['cutSide'] not in ('left', 'right'):
            raise ValueError('Unsupported actual interior section')
        vector(row['physicalPointMm'])
        vector([row[k] for k in FIELDS], 6)
        cuts[row['memberId']].append(row)
    if not result['interiorMemberCuts']:
        raise ValueError('Actual interior sections required')
    worst_end = worst_cut = worst_end_projection = 0.
    governing_end = governing_cut = None
    for name in names:
        e0, e1 = ends[name][0], ends[name][1]
        p, q = e0['physicalPointMm'], e1['physicalPointMm']
        length = math.dist(p, q)
        if length <= 0 or q[2] != p[2] or sum(q[i] != p[i] for i in (0, 1)) != 1:
            raise ValueError('Actual horizontal orthogonal receiver required')
        axis = scale(sub(q, p), 1/length)
        normal = [0., 0., 1.]
        radial = cross(axis, normal)
        f0, f1 = e0['globalPhysicalEndWrenchKN_KNm'][:3], e1['globalPhysicalEndWrenchKN_KNm'][:3]
        m0, m1 = scale(e0['globalPhysicalEndWrenchKN_KNm'][3:], 1000), scale(e1['globalPhysicalEndWrenchKN_KNm'][3:], 1000)
        for end, row, force, moment in ((0, e0, f0, m0), (1, e1, f1, m1)):
            actual = [dot(force, axis)*(1 if end == 0 else -1), dot(force, normal), dot(force, radial)]
            actual += [dot(moment, d)/1000 for d in (axis, normal, radial)]
            published = vector([row[k] for k in FIELDS], 6)
            worst_end_projection = max(worst_end_projection, max(abs(a-b) for a, b in zip(actual, published)))
        prepared = []
        for origin in loads[name]:
            factor = gravity_factor if origin['family'] == 'physical-G' else 1.
            if origin.get('kind') == 'uniform-line':
                a, b = origin['s0Mm'], origin['s1Mm']
                if not 0 <= a < b <= length + 1e-7:
                    raise ValueError('Contained physical line interval required')
                force = vector(origin['forceDensityKNPerMm'])
                moment = vector(origin['momentDensityKNmmPerMm'])
                prepared.append(('line', a, b, scale(force, factor), scale(moment, factor)))
            else:
                at = vector(origin['pointXYZMm'])
                station = dot(sub(at, p), axis)
                if not -1e-7 <= station <= length + 1e-7:
                    raise ValueError('Contained physical point origin required')
                prepared.append(('point', station, at, scale(vector(origin['forceKN']), factor),
                                 scale(vector(origin['momentKNmm']), factor)))

        def right_of(point, side):
            # Start from the opposite end. Return the negative free body on
            # that side, so its result uses the published left-section sign.
            station = dot(sub(point, p), axis)
            force = f1[:]
            moment = add(m1, cross(sub(q, point), f1))
            for kind, a, b, f, m in prepared:
                if kind == 'line':
                    lo, hi = max(station, a), b
                    if hi <= lo:
                        continue
                    at = add(p, scale(axis, (lo+hi)/2))
                    f, m = scale(f, hi-lo), scale(m, hi-lo)
                else:
                    if not (a > station+1e-7 or (side == 'left' and abs(a-station) < 1e-7)):
                        continue
                    at = b
                force = add(force, f)
                moment = add(moment, add(m, cross(sub(at, point), f)))
            return scale(force, -1), scale(moment, -1)

        # Independent all-origin endpoint closure. This also detects an old
        # omitted distributed source when all new contacts remain present.
        total_f, total_m = add(f0, f1), add(add(m0, cross(sub(p, q), f0)), m1)
        for kind, a, b, f, m in prepared:
            if kind == 'line':
                at = add(p, scale(axis, (a+b)/2))
                f, m = scale(f, b-a), scale(m, b-a)
            else:
                at = b
            total_f = add(total_f, f)
            total_m = add(total_m, add(m, cross(sub(at, q), f)))
        end_error = max(abs(v) for v in [*total_f, *scale(total_m, .001)])
        if end_error > worst_end:
            worst_end, governing_end = end_error, name
        for row in cuts[name]:
            point = row['physicalPointMm']
            station = dot(sub(point, p), axis)
            if not 0 < station < length or abs(station/length-row['fraction']) > 1e-10:
                raise ValueError('Actual cut coordinate/fraction mismatch')
            if math.dist(add(p, scale(axis, station)), point) > 1e-7:
                raise ValueError('Interior section must lie on physical member axis')
            force, moment = right_of(point, row['cutSide'])
            actual = [dot(force, d) for d in (axis, normal, radial)] + [dot(moment, d)/1000 for d in (axis, normal, radial)]
            error = max(abs(v-row[k]) for v, k in zip(actual, FIELDS))
            if error > worst_cut:
                worst_cut = error
                governing_cut = {'memberId': name, 'fraction': row['fraction'], 'side': row['cutSide']}
    if max(worst_end, worst_cut, worst_end_projection) > tolerance:
        raise ValueError(f'Independent right-end equilibrium/cut mismatch: ends={worst_end}, cuts={worst_cut}, endpointProjection={worst_end_projection}')
    return {'receiverMemberCount': len(names), 'interiorCutCount': len(result['interiorMemberCuts']),
            'maximumEndpointResidualKN_KNm': worst_end, 'governingEndpoint': governing_end,
            'maximumEndpointProjectionResidualKN_KNm': worst_end_projection,
            'maximumOppositeEndCutResidualKN_KNm': worst_cut, 'governingCut': governing_cut,
            'sourceProvenanceAuthenticatedByThisMethod': False, 'resistanceAccepted': False}


def extract(payload):
    # The two known capture formats: raw additive native response and actual
    # saved-document API capture. No historical/native response fallback.
    owner = payload['groundPocketLoads'] if 'groundPocketLoads' in payload else payload
    comparison = owner['comparison']
    return comparison['receiverCutRecovery'], comparison['physicalGFactorApplied']


def adversarial(result, factor):
    changed = copy.deepcopy(result)
    changed['interiorMemberCuts'][0]['bendingYKNm'] += .1
    missing = copy.deepcopy(result)
    old_line = next(o for o in missing['origins'] if o.get('kind') == 'uniform-line'
                    and o.get('adapter') == 'foundation/solid-G')
    missing['origins'].remove(old_line)
    missing['originCount'] -= 1  # Defeat the trivial extent check on purpose.
    for name, candidate in [('changed-cut', changed), ('missing-old-foundation-line', missing)]:
        try:
            check(candidate, factor)
        except ValueError as error:
            if 'equilibrium/cut mismatch' not in str(error):
                raise ValueError('Adverse control failed before independent force/moment check: '+name) from error
        else:
            raise ValueError('Adverse control was not detected: '+name)
    return {'changedInteriorMomentRejected': True, 'missingOldFoundationLineRejected': True}


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('capture')
    parser.add_argument('--adversarial', action='store_true')
    args = parser.parse_args()
    with open(args.capture) as stream:
        result, factor = extract(json.load(stream))
    report = check(result, factor)
    if args.adversarial:
        report['adverseControls'] = adversarial(result, factor)
    print(json.dumps(report, indent=2, allow_nan=False))
