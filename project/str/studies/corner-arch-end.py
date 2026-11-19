"""One signed wind / guard case for three near supports at the two NE openings."""
from bisect import bisect_right
from itertools import pairwise
from pathlib import Path
import json
import math
import runpy
import sys

from corner_end_occupation import evaluate, figure

D = Path(__file__).resolve().parent
WINDOWS = (7, 3)


def add(*vectors):
    return [sum(v) for v in zip(*vectors)]


def arch_mesh(s, refinement):
    coarse = s['arch']
    n = (len(coarse)-1)*refinement
    angle = math.asin(s['w']/2/s['ri'])
    r = s['ri'] + 107.5
    return [coarse[i//refinement] if i % refinement == 0 else
            (1800+r*math.sin(angle*(2*i/n-1)), s['cz']+r*math.cos(angle*(2*i/n-1)))
            for i in range(n+1)]


def end_boundary(model, member, topology):
    """Condense the chosen free coordinates in the historical 12-port matrix."""
    if topology == 'hinge':
        return member.response, member.columns
    # A unit house-port rotation is 1 mrad. For RX or RZ at the *physical*
    # centroid supply the compensating old-reference vertical or X movement.
    offset = member.offset(member.arc[0]) / 1000
    rotations = [[(7,1.),(1,-offset)], [(2,1.)], [(8,1.),(0,offset)]]
    directions = rotations if topology == 'pin' else [[(i,1.)] for i in (0,1,2,6,7,8)]
    def work(direction, force):
        return sum(value*force[i] for i,value in direction)
    stiffness = member.columns
    r_unit = [[sum(value*stiffness[j][i] for j,value in d) for i in range(12)] for d in directions]
    solve_free = model['p']['fac']([[work(d,col) for col in r_unit] for d in directions])
    def correction(force):
        return solve_free([-work(d,force) for d in directions])
    def response(imposed, load):
        end = list(imposed)
        _, fixed = member.response(end,load)
        for d,q in zip(directions,correction(fixed)):
            for i,value in d:
                end[i] += value*q
        return member.response(end,load)
    columns = []
    for col in stiffness:
        free = correction(col)
        columns.append([f+sum(q*k[i] for q,k in zip(free,r_unit)) for i,f in enumerate(col)])
    return response, columns


def card(s, api, kernel, normal_type, refinement, topology):
    model = {**s, 'arch': arch_mesh(s, refinement)}
    member = kernel['SpaceArch'](model, 180, .2, release_near_rotation=(topology == 'hinge'))
    response, columns = end_boundary(model, member, topology)
    detached = topology == 'free'
    normal = normal_type(model, .2)
    house = api['Structure'](s, .08)
    modes = house.coords[:96]  # two lower bearings; no floor/roof yaw join
    ids = [list(range(a*6, a*6+6))+list(range(48+a*6, 54+a*6)) for a in range(8)]
    F = [[house.flexibility(a, b, False) for b in modes] for a in modes]
    zero = [0.]*12
    if detached:
        # A single encastre can move rigidly without inducing member forces.
        # The entire free end follows that motion. No artificial bypass spring.
        solve = lambda v: v
        probe = [v*.19-.7 for v in range(12)]
        check = response(probe, [0.]*member.size)[1]
        assert max(abs(x) for x in check) < 2e-4
    else:
        K = [[0.]*96 for _ in range(96)]
        for ix in ids:
            for j, right in enumerate(ix):
                for i, left in enumerate(ix):
                    K[left][right] = columns[j][i]
        solve = s['p']['fac']([[float(i==j)+sum(F[i][k]*K[k][j] for k in ids[(j%48)//6])
                                for j in range(96)] for i in range(96)])
    wind_code, wind = s['updated_wind'][31][:2]
    floor = s['m']['recover']([0.]*8, s['p']['floorLoadCases'][id(wind)])[0]
    bg = [house.background(mode, wind, floor) for mode in modes]
    components = {key: [0.]*96 for key in ('dead','houseWind','aperture','guard')}
    components['houseWind'] = bg
    pressures = [a for a in range(8) if api['active'](wind_code, a)]
    saved, direct = {}, {}
    xs = [p[0] for p in s['arch']]
    mid = [(a+b)/2 for a,b in pairwise(xs)]
    for a in range(8):
        def ceiling(x):
            i = min(len(mid)-1, max(0, bisect_right(xs, x)-1))
            return s['ceiling_actions'][a][mid[i]]
        gravity, local = member.gravity(ceiling)
        inputs = {'dead': gravity, 'houseWind': [0.]*member.size}
        for key, magnitude, guard in (('aperture', -2.25 if a in pressures else 0., None),
                                      ('guard', 0., (-1500,2240) if a==7 else None)):
            nr, near, _ = normal.loads(api['layouts'][a][4], magnitude, guard)
            if key=='aperture' and a in pressures:
                # Original global wind patch is removed once, independent of
                # the sign chosen for the replacement local pressure.
                _, _, previous = normal.loads(api['layouts'][a][4], 2.25, None)
                remove = api['withdraw_old'](house, a, previous)
                bg[:] = add(bg,[house.flexibility(mode, remove, False) for mode in modes])
            rhs = [0.]*member.size
            for pt,i in normal.index.items():
                for k,j in ((0,1),(1,3),(2,5)):
                    rhs[member.index[pt]+j] = nr[i+k]
            inputs[key] = rhs
            for x,z,force in near:
                c = house.near_normal(a,x,z)
                house.prepare(c)
                for i,m in enumerate(modes):
                    components[key][i] += force*house.flexibility(m,c,False)
            direct[a,key] = sum(force for x,z,force in near)/1000
        for key, rhs in inputs.items():
            r = response(zero, rhs)[1]
            assert max(abs(u+v) for u,v in zip(member.global_totals(rhs),member.applied_reaction_totals(r))) < 1e-6
            for i,row in enumerate(F):
                components[key][i] -= sum(row[k]*force for k,force in zip(ids[a],r))
        saved[a] = inputs, local
    movements = {key:solve(v) for key,v in components.items()}
    sine = s['w']/2/s['ri']
    def seat(r):
        fx,fy,fz = [r[i]/1000 for i in (0,6,1)]
        offset = member.offset(member.arc[0])
        mx,my,mz = (r[7]-offset*fz)/1000,-r[2]/1000,(r[8]+offset*fx)/1000
        cos = math.sqrt(1-sine*sine)
        comp = cos*fx+sine*fz
        rad = -sine*mx+cos*mz
        result = {'F': [fx,fy,fz], 'M': [mx,my,mz]}
        if topology == 'hinge':
            result['edges'] = [comp/2-rad/.18, comp/2+rad/.18]
        elif topology == 'pin':
            tangential = math.hypot(-sine*fx+cos*fz, fy)
            result.update(cutNormalKN=comp, cutTangentialKN=tangential,
                          frictionRatioIfUnrestrained=tangential/comp)
        return result
    def mech_action(row, end):
        # Section convention is the force delivered by the member's local end.
        return {'N': -row['endAxial'][end], 'Ms':row['strong'][2*end+1],
                'Mw':row['weak'][2*end+1],'T':row['torsion']}
    result = {}
    for a in WINDOWS:
        inputs, local = saved[a]
        def get(movement):
            return [movement[i] for i in ids[a]]
        allends = get(add(*movements.values()))
        load = add(*inputs.values())
        disp, reaction = response(allends, load)
        received = member.applied_reaction_totals(reaction)
        residual = add(member.global_totals(load), received)
        errors = [max(map(abs, residual[:3])), max(map(abs, residual[3:]))]
        assert max(errors) < 3e-6, errors
        relative = []
        i = member.index[member.arc[0]]
        for j,terms in enumerate(member.end_transform(0)):
            relative.append(disp[i+j]-sum(allends[k]*w for k,w in terms))
        local_actions = member.local_actions(disp,local)
        root = next(row for row in local_actions if row['kind'] == 'jamb')
        knee_i = len(member.arc)-2
        rootWrench = [reaction[i]/1000 for i in (3,9,4,10,5,11)]
        rootWrench[4] *= -1
        # The near cut's inward/upward normal is the tangent to the
        # spring circle. Positive separation opens the gap, negative closes it.
        tangent = (math.sqrt(1-sine*sine), 0., sine)
        radial = (-sine, 0., tangent[0])
        def project(t):
            return sum(i*j for i,j in zip(t,tangent))
        centre_gap = project(relative[:3])
        corner_gaps = [centre_gap+project(kernel['cross'](relative[3:],
                       (r*radial[0],y,r*radial[2]))) for r in (-107.5,107.5) for y in (-90.,90.)]
        physical_near=seat(reaction)
        if topology != 'hinge':
            axis_moments = [reaction[7]/1000, -reaction[2]/1000, reaction[8]/1000]
            physical_near['houseAxisM'] = axis_moments
            eccentric = kernel['cross']((0.,member.offset(member.arc[0])/1000,0.),physical_near['F'])
            assert max(abs(v-w) for v,w in zip(axis_moments,eccentric)) < 1e-6
            assert max(abs(v) for v in physical_near['M']) < 1e-6
            if detached:
                assert max(abs(v) for v in physical_near['F']) < 1e-6
        if not detached:
            assert max(abs(v) for v in relative[:3]) < 1e-7
        case = {'near':physical_near, 'rootAtHouseAxis':rootWrench, 'nearGapXYZmm':relative[:3], 'relativeRotationXYZrad':relative[3:],
                'faceNormalCentreMM':centre_gap, 'faceNormalCornerRangeMM':[min(corner_gaps),max(corner_gaps)],
                'forceMomentBalanceErrorKN_KNm':errors,
                'rootMember':mech_action(root,0),'archAtKnee':mech_action(local_actions[knee_i],1),
                'directNearPierNormalKN':{k:direct[a,k] for k in ('aperture','guard')}}
        if topology=='hinge':
            case['components'] = {key:seat(response(get(movements[key]),inputs[key])[1]) for key in movements}
        result[a]=case
    return result


def compare(studies=D):
    source=runpy.run_path(str(studies/'arch-haunch-card.py'))
    study=source['study']
    s=study('current-house-coupled-arches.py', {'arch_model_only':True,'arch_normal_width':180})
    api=study('current-house-spatial-arches.py', {'SPATIAL_FUNCTIONS_ONLY':True,'ARCH_CONTEXT':s})
    n=study('arch-normal-kernel.py')['NormalArch']
    results = {key:card(s,api,source['SPACE_KERNEL'],n,m,style)
            for key,m,style in [('hinge18',1,'hinge'),('pin18',1,'pin'),('pin36',2,'pin'),
                                ('separated18',1,'free'),('separated36',2,'free')]}
    archive = json.loads((studies/'current-house-arch-bearing.json').read_text())
    control = next(state for state in archive['controls'][0]['coupled']
                   if state['crackedEI'] == .2 and not state['allLowerBearings'] and not state['floorRoofYawJoin'])
    witness = control['nearBearing']['edge']
    assert (witness['wind'],witness['window'],witness['otherWindow'],witness['loadedWindow'],
            witness['pointX'],witness['pointSign'],witness['pressureSign']) == (31,7,3,7,2240,-1,-1)
    for a, seat in zip(WINDOWS, (witness['seat'],witness['otherSeat'])):
        current = results['hinge18'][a]['near']
        for used, stored in [('F','forceXYZkN'),('M','centroidMomentsXYZkNm'),('edges','edgeEquivalentKN')]:
            assert max(abs(x-y) for x,y in zip(current[used], seat[stored])) < 2e-7
    return results


def rounded(value):
    if isinstance(value, float):
        return round(value, 6) or 0.0
    if isinstance(value, list):
        return [rounded(v) for v in value]
    if isinstance(value, dict):
        return {key: rounded(v) for key, v in value.items()}
    return value


if __name__ == '__main__':
    check = '--check' in sys.argv
    geometry = evaluate(D.parents[2])
    cases = compare()
    record = {
        'case': 'Wind 31, active aperture pressure -2.25 kPa and guard -1.5 kN at W7 X2240; all eight inner arches re-solved. W7 and W3 are the same north-east pier. Local negative Y points outward.',
        'options': {'hinge': 'Near rotation about wall normal free.',
                    'pin': 'Three rotations free at physical centroid; retain three translations.',
                    'separated': 'All six near degrees of freedom free. Far root only.'},
        'units': 'Local spring XYZ in mm, relative rotations rad, support force kN and moment kNm. House-axis and physical-centre moments use their recorded references.',
        'cards': rounded(cases), 'occupation': rounded(geometry), 'admitted': False}
    outputs = {'json': json.dumps(record, indent=2, ensure_ascii=False)+'\n', 'svg':figure(geometry)}
    for ext, body in outputs.items():
        path = Path(__file__).with_suffix('.'+ext)
        if check:
            if path.read_text() != body:
                raise ValueError(f'Stale {path.name}')
        else:
            path.write_text(body)
    print('Corner arch end actions, movements and occupied geometry reproduce.')
