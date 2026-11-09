"""One signed design card for the outer-pier end of the haunched window arch."""
from bisect import bisect_right
from contextlib import redirect_stdout
from io import StringIO
from itertools import pairwise
from pathlib import Path
import json
import math
import runpy
import sys

D = Path(__file__).resolve().parent

def study(name, parameters=None):
    """The historical producers read argv. Load only their checked model/function paths."""
    args = sys.argv
    try:
        sys.argv = [str(D/name), '--check']
        with redirect_stdout(StringIO()):
            return runpy.run_path(str(D/name), init_globals=parameters)
    finally:
        sys.argv = args


SPACE_KERNEL = study('arch-space-kernel.py')


class HaunchedArch(SPACE_KERNEL['SpaceArch']):
    def __init__(self, model, refinement, extra, width, cracked_ei):
        self.station = {point: index/refinement for index, point in enumerate(model['arch'])}
        self.extra = extra
        super().__init__(model, width, cracked_ei)

    def position(self, point):
        x, y, z = super().position(point)
        if point not in self.station:
            return x, y, z
        # Keep the opening's intrados and add concrete at the extrados.
        angle = math.atan2(x - 1800, z - self.model['cz'])
        radial_shift = self.extra(self.station[point])/2
        return x + radial_shift*math.sin(angle), y, z + radial_shift*math.cos(angle)

    def member(self, left, right, width, depth, kind):
        if kind == 'arch':
            depth += self.extra((self.station[left] + self.station[right])/2)
        # The common member kernel builds EA, both EI, and GJ on this actual chord.
        super().member(left, right, width, depth, kind)

    def end_transform(self, end):
        # Reference/support forces and movements share the same rigid XYZ arm.
        # House rotations are mrad and positive strong rotation is about -normal.
        ref = self.supports[end]
        x, dy, z = self.position(ref)
        dx, dz = x - ref[0], z - ref[1]
        i, j = 3*end, 6 + 3*end
        return [[(i, 1.), (i+2, -dz/1000), (j+2, -dy/1000)],
                [(j, 1.), (j+2, dx/1000), (j+1, -dz/1000)],
                [(i+1, 1.), (j+1, dy/1000), (i+2, dx/1000)],
                [(j+1, .001)], [(i+2, -.001)], [(j+2, .001)]]




def remap_forces(old, new, rhs):
    """Preserve each applied force at its physical locus plus its original free moment."""
    moved = [0.]*new.size
    for point, i in old.index.items():
        new.point(moved, point, rhs[i:i+3], old.position(point))
        j = new.index[point]
        for k in range(3):
            moved[j+3+k] += rhs[i+3+k]
    error = max(abs(a-b) for a, b in zip(old.global_totals(rhs), new.global_totals(moved)))
    assert error < 1e-8, error
    return moved


def remap_local_dead(old, new, loads, cross, dot):
    """Transform the consistent dead-load end wrenches used for section recovery."""
    output = []
    for a, b, q in zip(old.elements, new.elements, loads):
        axis, normal, radial = a['axes']
        u, n, r = b['axes']
        force = [1000*(q['axialHalf']*axis[k]+q['weak'][0]*normal[k]+q['strong'][0]*radial[k])
                 for k in range(3)]
        moved = {'axialHalf': dot(force, u)/1000, 'strong': [], 'weak': []}
        for point, i in [(a['left'], 1), (a['right'], 3)]:
            arm = [p-v for p, v in zip(old.position(point), new.position(point))]
            couple = cross(arm, force)
            moment = [1e6*(q['weak'][i]*radial[k]-q['strong'][i]*normal[k])+couple[k] for k in range(3)]
            moved['weak'].extend((dot(force, n)/1000, dot(moment, r)/1e6))
            moved['strong'].extend((dot(force, r)/1000, -dot(moment, n)/1e6))
            # The changed chords and gravity forces are in the wall plane.
            assert abs(dot(moment, u)) < 1e-5
        output.append(moved)
    return output


def near_section(mr, original, addition, following, action):
    """At the constant-depth near spring, surface-normal and radial offsets coincide."""
    b, h = original['b'], original['h'] + addition
    x0, x1 = original['xs']
    if following:
        x1 += addition
    y0, y1 = original['ys']
    radial = x1-x0+22  # H16 radius 8 plus H6 radius 3, both sides.
    normal = original['cellNormal']
    tie = abs(action['torsionKNm'])*1e6*(radial+normal)/(radial*normal)
    torsion_debit = tie/(4*math.pi*16**2/4*(500/1.15))
    exact_fraction = .95-torsion_debit
    fraction = math.floor(exact_fraction*100)/100
    axial, ms, mw = action['compressionKN'], action['minusNormalKNm'], action['radialKNm']
    def capacity(load, steel):
        # At the near end the member is loaded on the -tangent face. Positive
        # moment about -normal compresses the intrados; positive radial moment
        # compresses the weather face. Retained radial bars are asymmetric.
        return (mr(b, h, x0, x1, load, ms<0, steel), mr(h, b, y0, y1, load, mw<0, steel))
    def interaction(rs, rw):
        return abs(ms)/rs + abs(mw)/rw
    rs, rw = capacity(axial, fraction)
    n0 = 2*math.floor(axial/2)
    bins = [capacity(v, fraction) for v in (n0, n0+2)]
    return {'asCastSectionMm': [b, h], 'adverseRadialBarAxesMm': [x0, x1],
            'torsionCellMm': [radial, normal], 'torsionDebit': torsion_debit, 'steelFraction': fraction,
            'exactAxialResistanceKNm': [rs, rw], 'exactAxialInteraction': interaction(rs, rw),
            'binnedInteraction': interaction(*(min(pair) for pair in zip(*bins))),
            'withoutPercentRoundingInteraction': interaction(*capacity(axial, exact_fraction))}


def run_card(s, api, kernel, normal_class, cage, shape, refinement, addition):
    coarse = s['arch']
    count = len(coarse)-1
    angle = math.asin(s['w']/2/s['ri'])
    def node(i):
        part, rem = divmod(i, refinement)
        if not rem:
            return coarse[part]
        phi = angle*(2*i/(count*refinement)-1)
        radius = s['ri']+107.5
        return 1800+radius*math.sin(phi), s['cz']+radius*math.cos(phi)
    model = {**s, 'arch': [node(i) for i in range(count*refinement+1)]}
    width, crack, torsion = 180, .35, .25
    space = kernel['SpaceArch']
    old = space(model, width, crack)
    new = HaunchedArch(model, refinement, lambda t: shape(t, addition), width, crack)
    normal = normal_class(model, crack)
    house = api['Structure'](s, torsion)
    modes = house.coords[:104]  # all lower bearings and joined yaw, as in the archived card
    ids = [list(range(6*i, 6*i+6))+list(range(48+6*i, 54+6*i)) for i in range(8)]
    F = [[house.flexibility(a, b, True) for b in modes] for a in modes]
    K = [[0.]*96 for _ in range(96)]
    for ix in ids:
        for j, right in enumerate(ix):
            for i, left in enumerate(ix):
                K[left][right] = new.columns[j][i]
    # Solve (I + F K) for the 96 end movements and eight yaw coordinates,
    # using the same block order as the archived eight-window solve.
    M = [[F[i][j] if j>=96 else float(i==j)+sum(F[i][k]*K[k][j] for k in ids[(j%48)//6])
          for j in range(len(modes))] for i in range(len(modes))]
    solve = s['p']['fac'](M)
    def embed(index, values):
        output = [0.]*len(modes)
        for i, v in zip(ids[index], values):
            output[i] = v
        return output
    zero = [0.]*12
    fixed = [0.]*len(modes)
    gravity = []
    midpoints = [(a[0]+b[0])/2 for a, b in pairwise(coarse)]
    xs = [a[0] for a in coarse]
    for a in range(8):
        def ceiling(x):
            i = min(count-1, max(0, bisect_right(xs, x)-1))
            return s['ceiling_actions'][a][midpoints[i]]
        reference, local = old.gravity(ceiling)
        applied = remap_forces(old, new, reference)
        recovered = remap_local_dead(old, new, local, kernel['cross'], s['dot'])
        rx = new.response(zero, applied)[1]
        error = max(abs(f+r) for f, r in zip(new.global_totals(applied), new.applied_reaction_totals(rx)))
        assert error < 1e-6, error
        gravity.append((applied, recovered))
        fixed = [f+r for f, r in zip(fixed, embed(a, rx))]
    dead = solve([-v for v in s['mul'](F, fixed)])

    def external(a, pressure, point):
        load, near, origin = normal.loads(api['layouts'][a][4], pressure, point)
        reference = [0.]*old.size
        for p, i in normal.index.items():
            for k, j in [(0,1), (1,3), (2,5)]:
                reference[old.index[p]+j] = load[i+k]
        load = remap_forces(old, new, reference)
        rx = embed(a, new.response(zero, load)[1])
        direct = [0.]*len(modes)
        for x, z, force in near:
            loc = house.near_normal(a, x, z)
            house.prepare(loc)
            for i, mode in enumerate(modes):
                direct[i] += force*house.flexibility(mode, loc, True)
        if pressure:
            removed = api['withdraw_old'](house, a, origin)
            for i, mode in enumerate(modes):
                direct[i] += house.flexibility(mode, removed, True)
        return solve([v-r for v, r in zip(direct, s['mul'](F, rx))]), load

    wind_code, roof_wind = s['updated_wind'][55][:2]
    floor = s['m']['recover']([0.]*8, s['p']['floorLoadCases'][id(roof_wind)])[0]
    wind = solve([house.background(mode, roof_wind, floor) for mode in modes])
    state = [a+b for a, b in zip(dead, wind)]
    observed = 5
    rhs, local_dead = gravity[observed]
    for a in range(8):
        if api['active'](wind_code, a):
            step, load = external(a, 2.25, None)
            state = [v+d for v, d in zip(state, step)]
            if a == observed:
                rhs = [v+f for v, f in zip(rhs, load)]
    step, load = external(observed, 0, (1500, 2240))
    ends = [state[i]+step[i] for i in ids[observed]]
    local = new.local_actions(new.response(ends, [v+f for v, f in zip(rhs, load)])[0], local_dead)[0]
    signed = {'compressionKN': -local['endAxial'][0], 'minusNormalKNm': local['strong'][1],
              'radialKNm': local['weak'][1], 'torsionKNm': local['torsion']}
    section = cage(180, 'arch', 6000, True)
    return {'additionMm': addition, 'archElements': count*refinement, 'signedEnd': signed,
            'retained': near_section(api['mr'], section, addition, False, signed),
            'relaid': near_section(api['mr'], section, addition, True, signed)}


def compare_cards(extra_depth=None):
    if extra_depth is None:
        extra_depth = study('corner-arch-haunch-profile.py')['extra_depth']
    s = study('current-house-coupled-arches.py', {'arch_model_only': True, 'arch_normal_width': 180})
    api = study('current-house-spatial-arches.py', {'SPATIAL_FUNCTIONS_ONLY': True, 'ARCH_CONTEXT': s})
    kernel = SPACE_KERNEL
    normal = study('arch-normal-kernel.py')['NormalArch']
    cage = study('arch-width-geometry.py')['cage']
    cases = [run_card(s, api, kernel, normal, cage, extra_depth, refine, addition)
             for refine, addition in [(1,0), (1,45), (2,45), (4,45)]]
    archive = json.loads((D/'current-house-outward-arches.json').read_text())
    control = next(c for c in archive['controls'] if c['geometry']['normalWidthNominal']==180)
    old = next(r for r in control['coupled'] if r['crackedEI']==.35 and r['allLowerBearings'])
    witness = old['governingStates']['adverseRatio/0']
    assert witness[:7] == [55,5,5,2240,1,1,0] and witness[-1]==0
    baseline = cases[0]
    computed = baseline['signedEnd']
    assert all(math.isclose(a,b,abs_tol=1e-7) for a,b in zip(
        [computed['compressionKN'],abs(computed['minusNormalKNm']),abs(computed['radialKNm']),
         computed['torsionKNm'],baseline['retained']['binnedInteraction']],
        [witness[7],witness[8],witness[9],witness[12],old['maximumSameStateActions']['adverseRatio'][0]]))
    return {'card': {'EI': .35, 'nearLTorsion': .25, 'allLowerBearings': True, 'joinedYaw': True,
                     'windIndex': 55, 'positivePressureKPa': 2.25, 'loadedAndObservedWindow': 5,
                     'guardPositiveN': 1500, 'guardXmm': 2240, 'archEnd': 'near spring'},
            'cases': cases, 'authority': 'One coupled historical action state. Reference gross dead and facade loads '
            'retain their original wrenches on each comparison mesh. No new gravity credit, force-path selection '
            'or relaid-cage acceptance. Refined meshes resample the reference fields consistently.'}


if __name__ == '__main__':
    print(json.dumps(compare_cards(), indent=2))
