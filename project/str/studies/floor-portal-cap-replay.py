"""Replay unselected L-pier comparisons on the pinned coupled-house worktree."""
import argparse
from contextlib import redirect_stdout
from dataclasses import replace
import json
from pathlib import Path
import subprocess
import sys

SOURCE_COMMIT = '7a1b697431e9c1556f426068068b96356d3158ca'
PATCH = Path(__file__).with_suffix('.patch')


def checked_source(worktree):
    def git(*args):
        return subprocess.run(['git', '-C', worktree, *args], check=True, capture_output=True).stdout

    head = git('rev-parse', 'HEAD').decode().strip()
    diff = git('diff', '--no-ext-diff', '--binary', '--full-index', '--no-renames',
               '--diff-algorithm=myers', '--no-indent-heuristic', '-U3', 'HEAD', '--')
    if head != SOURCE_COMMIT or diff != PATCH.read_bytes():
        raise ValueError('Use the exact pinned predecessor with only the companion patch applied.')
    sys.path.insert(0, str(Path(worktree).resolve() / 'project' / 'str' / 'studies'))


def parameters(variant):
    from floor_portal_candidate import SIX_L_KEYS, leading_parameters

    base = leading_parameters()
    if variant == '140':
        return base
    stations = tuple((x + 40., y + 20.) if x > y else (x + 20., y + 40.)
                     for x, y in SIX_L_KEYS)
    return replace(base, L_arm_width=180., L_outward_extension=40., L_key_centres=stations,
                   L_cap_block_depth=300. if variant.startswith('cap300') else 0.,
                   L_projected_bearing_gap=5. if variant == 'cap300-relief5' else 0.)


def check_contact_gap():
    import numpy as np
    from floor_portal_frame import Frame
    from floor_portal_house import ContactSolve

    frame = Frame()
    lower = frame.node('fixed', [0, 0, 0])
    upper = frame.node('sliding', [0, 0, 0])
    frame.link(frame.port(upper), frame.port(lower), [10, 0, 0, 0, 0, 0], 'elastic reference')
    contact = {'ids': np.r_[np.arange(6, 12), np.arange(6)],
               'row': np.r_[[1, 0, 0, 0, 0, 0], [-1, 0, 0, 0, 0, 0]],
               'stiffness': 90., 'initial_gap': 5.}
    solve = ContactSolve(frame.matrix(), [*range(6), *range(7, 12)], [contact])
    for load, expected in [(-40., (-4., 1., 0.)), (-60., (-5.1, -.1, 9.))]:
        rhs = np.zeros(12)
        rhs[upper] = load
        movement, _, contact_state = solve(rhs)
        actual = (movement[upper], contact_state['gap'][0], contact_state['force'][0])
        assert np.allclose(actual, expected, atol=1e-10), actual


def signed_screen(config):
    from floor_portal_domain import run

    result = run(config)
    cases = result['caseNames']
    reaction, head, index = result['minimumHeadN_KN_Id_Case']
    members = {}
    for family in ('L', 'collector'):
        bounds = result['memberBounds'][family]
        torsion = bounds['witness'][3]
        members[family] = {
            'maximumAbsoluteTorsionKNm': bounds['maxAbsLocal_N_Vy_Vz_T_My_Mz'][3] / 1e6,
            'case': cases[torsion['case']],
            'simultaneousLocalActionNAndNmm': torsion['actions'],
            'atMm': torsion['at'],
        }
    return {
        'cases': result['caseCount'],
        'headCount': result['controls']['heads'],
        'maximumBalanceResidualNAndNmm': result['maximumBalanceResidual'],
        'minimumHeadReaction': {'valueKN': reaction, 'head': head, 'case': cases[index]},
        'memberTorsion': members,
        'maximumLGuideForceKN': max(
            row['maximumDirectionalForceKN'] for name, row in result['guideBounds'].items()
            if name.startswith('L-cap-key-')
        ),
        'capTransition': result['capTransition'],
        'sourceHashes': result['sourceHashes'],
    }


def movement_screen(config):
    import numpy as np
    from floor_portal_candidate import finalise_bounds, update_bounds
    from floor_portal_house import ContactSolve, House
    from floor_portal_loads import Case, gravity, roof_gravity, roof_goods
    from floor_portal_movements import roof_strain, superstructure_strain

    house = House(config)
    house.controls()
    floor_g, _, _ = gravity(house)
    roof_g, *_ = roof_gravity(house)
    goods_g, *_ = roof_goods(house)
    gravity_case = Case.combination(house, 'G', [(1, floor_g), (1, roof_g), (1, goods_g)])
    solve = ContactSolve(house.k, house.fixed, house.contacts)
    strains = [roof_strain(house, strain, affine)
               for strain in (-720e-6, 720e-6) for affine in (False, True)]
    strains.extend(superstructure_strain(house, strain) for strain in (-300e-6, 300e-6))
    cases = [(strain.name, Case.combination(house, strain.name, [(1, gravity_case), (1, strain)]), None)
             for strain in strains]
    for name, node in house.heads.items():
        for amount in (-1., 1.):
            given = np.array([amount if i == node + 2 else 0. for i in house.fixed])
            cases.append((f'{name} {amount:+g} mm', gravity_case, given))

    peaks = {'minimumHeadReactionKN': None, 'maximumLGuideForceKN': None,
             'maximumLReleasedTravelMM': None}
    max_balance = np.zeros(6)
    projected = [index for index, contact in enumerate(house.contacts)
                 if contact['name'].startswith('L-cap-projected-bearing-')]
    minimum_gap = None
    for index, (name, case, given) in enumerate(cases):
        movement, reactions, contact_state = solve(case.f, given)
        if projected:
            limiting = min(projected, key=lambda point: contact_state['gap'][point])
            gap = float(contact_state['gap'][limiting])
            if minimum_gap is None or gap < minimum_gap['gapMM']:
                minimum_gap = {'gapMM': gap, 'case': name,
                               'bearingForceN': float(contact_state['force'][limiting]),
                               'contact': house.contacts[limiting]['name']}
        balance = abs(house.rigid.T @ (case.f + reactions))
        assert max(balance[:3]) < .01 and max(balance[3:]) < 10, (name, balance)
        max_balance = np.maximum(max_balance, balance)
        head, node = min(house.heads.items(), key=lambda item: reactions[item[1] + 2])
        guide_bounds = {}
        update_bounds(guide_bounds, house, movement, index, name)
        l_guides = {key: value for key, value in finalise_bounds(guide_bounds, house).items()
                    if key.startswith('L-cap-key-')}
        force_guide = max(l_guides, key=lambda key: l_guides[key]['maximumDirectionalForceKN'])
        travel_guide = max(l_guides, key=lambda key: l_guides[key]['maximumReleasedTravelMM'])
        values = (
            ('minimumHeadReactionKN', reactions[node + 2] / 1000., head),
            ('maximumLGuideForceKN', l_guides[force_guide]['maximumDirectionalForceKN'], force_guide),
            ('maximumLReleasedTravelMM', l_guides[travel_guide]['maximumReleasedTravelMM'], travel_guide),
        )
        for metric, value, location in values:
            peak = peaks[metric]
            if peak is None or (value < peak['value'] if metric.startswith('minimum') else value > peak['value']):
                peaks[metric] = {'value': float(value), 'case': name, 'location': location}
    return {'cases': len(cases), 'headCount': len(house.heads),
            'maximumBalanceResidualNAndNmm': max_balance.tolist(), 'witnesses': peaks,
            'minimumProjectedGap': minimum_gap}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('worktree', type=Path)
    parser.add_argument('variant', choices=('140', 'outward180', 'cap300', 'cap300-relief5'))
    parser.add_argument('screen', choices=('signed', 'movement'))
    args = parser.parse_args()
    try:
        checked_source(args.worktree)
    except ValueError as error:
        parser.error(str(error))
    with redirect_stdout(sys.stderr):
        check_contact_gap()
        config = parameters(args.variant)
        result = signed_screen(config) if args.screen == 'signed' else movement_screen(config)
    print(json.dumps({
        'sourceCommit': SOURCE_COMMIT, 'variant': args.variant, 'screen': args.screen,
        'status': 'comparison only', 'result': result,
    }, indent=2))


if __name__ == '__main__':
    main()
