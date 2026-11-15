"""Replay the separated support comparator and retain rejected solve cases."""

import argparse
from contextlib import redirect_stdout
from hashlib import sha256
import json
from pathlib import Path
import subprocess
import sys


PIN = '7a1b697431e9c1556f426068068b96356d3158ca'
MODULE_DIR = 'project/str/studies/'
NATIVE_HASHES = {
    'candidate': '549872e979d3ae6d3fdf610ab931d9f0f1bb1d3f23dc19b1f1fd112577e7549e',
    'coupled': 'ca34bb59ce453c40e57e329a60c8502697e0cfe2695702566281929191a101e9',
    'domain': 'c113c1e96ca06cdbc6b0016205c2da21d7689ad42be2846e957bfa1357e24034',
    'house': '2b731b27b90ff91027868243ed9f266f298d78549c2357ff213221e246fc9989',
    'loads': '7e395d4aa2c4e22541ba8ca6e3cbb42c2a31bd7c537e1acfd137a0ab7c25ffa5',
    'roof': '6e8ce0f8a01674120141a63f527865187af9da434f9477aa5a7c06b5b8b4edf9',
    'rewind_contact': 'ec00125e8c958ebacab21cca2df27a5e91b077bc364f9c0df697bf9b41595014',
}


def exact_source(worktree):
    root = worktree.resolve()

    def git(*args):
        return subprocess.run(['git', '-C', str(root), *args], check=True, capture_output=True, text=True).stdout

    if git('rev-parse', 'HEAD').strip() != PIN:
        raise ValueError('Expected exact floor-portal predecessor')
    paths = {f'{MODULE_DIR}floor_portal_{key}.py': value for key, value in NATIVE_HASHES.items()}
    expected = {f'M {name}' for name in paths if not name.endswith('rewind_contact.py')}
    expected.add(f'?? {MODULE_DIR}floor_portal_rewind_contact.py')
    observed = {line.strip() for line in git('status', '--porcelain=v1', '--untracked-files=all').splitlines()}
    if observed != expected:
        raise ValueError('Apply only the two companion patches in order to a clean pinned worktree')
    for name, expected_hash in paths.items():
        if sha256((root / name).read_bytes()).hexdigest() != expected_hash:
            raise ValueError(f'Patched source mismatch: {name}')
    sys.path.insert(0, str(root / MODULE_DIR))


def guide_peaks(bounds):
    return {
        label: dict(forceKN=round(value['maximumDirectionalForceKN'], 4), forceCase=value['forceCaseName'],
                    releasedTravelMm=round(value['maximumReleasedTravelMM'], 4), travelCase=value['releasedCaseName'],
                    rootScreenMPa=round(value['elasticPlateRootScreenMPa'], 3))
        for label, value in bounds.items()
    }


def signed(full=True):
    from floor_portal_candidate import leading_parameters
    from floor_portal_domain import run

    result = run(leading_parameters(), full=full)
    accepted = result['caseCount']
    withheld = result['withheldCases']
    assert result['attemptedCaseCount'] == accepted + len(withheld) == (579 if full else 21)
    assert len(result['all52HeadBounds']) == 52
    failures = {}
    for issue in withheld:
        reason = issue['reason']
        if reason not in failures:
            failures[reason] = 0
        failures[reason] += 1
    first = withheld[0] if withheld else None
    if first is not None and 'residual' in first:
        first = dict(first, residual=[round(x, 4) for x in first['residual']],
                     maximumGeneralizedDOF=round(first['maximumGeneralizedDOF'], 4),
                     contactResidualN=round(first['contactResidualN'], 6),
                     gauge=[round(x, 6) for x in first['gauge']])
    return {
        'attemptedCases': result['attemptedCaseCount'],
        'acceptedCases': accepted,
        'withheldCountsByReason': failures,
        'firstWithheldCase': first,
        'withheldCaseNames': [issue['case'] for issue in withheld],
        'maximumAcceptedGlobalResidualNAndNmm': [round(x, 5) for x in result['maximumBalanceResidual']],
        'maximumAcceptedVirtualGaugeResidualN': [round(x, 6) for x in result['maximumGaugeReactionsN']],
        'peakAcceptedMinimumHeadReactionKN': [round(result['minimumHeadN_KN_Id_Case'][0], 4),
                                             result['minimumHeadN_KN_Id_Case'][1],
                                             result['caseNames'][result['minimumHeadN_KN_Id_Case'][2]]],
        'acceptedGuidePeaks': guide_peaks(result['guideBounds']),
        'acceptedOtherPeaks': {key: dict(value, value=round(value['value'], 4))
                               for key, value in result['rewindWitnesses'].items()},
    }


def movement():
    import numpy as np
    from floor_portal_candidate import leading_parameters, update_bounds, finalise_bounds
    from floor_portal_house import House
    from floor_portal_loads import Case, gravity, roof_gravity, roof_goods
    from floor_portal_movements import roof_strain, superstructure_strain
    from floor_portal_rewind_contact import RewindContactSolve

    house = House(leading_parameters())
    assert house.controls()['heads'] == 52
    floor_g, _, _ = gravity(house)
    roof_g, *_ = roof_gravity(house)
    goods_g, *_ = roof_goods(house)
    gravity_case = Case.combination(house, 'G', [(1, floor_g), (1, roof_g), (1, goods_g)])
    solve = RewindContactSolve(house)
    strains = [roof_strain(house, strain, affine)
               for strain in (-720e-6, 720e-6) for affine in (False, True)]
    strains.extend(superstructure_strain(house, strain) for strain in (-300e-6, 300e-6))
    cases = [(strain.name, Case.combination(house, strain.name, [(1, gravity_case), (1, strain)]), None)
             for strain in strains]
    for name, node in house.heads.items():
        for amount in (-1., 1.):
            given = np.array([amount if i == node + 2 else 0. for i in house.fixed])
            cases.append((f'{name} {amount:+g} mm', gravity_case, given))
    peaks = {'headTensionKN': (0.,), 'cornerTopPlanDisplacementMm': (0.,)}
    bounds = {}
    max_balance = np.zeros(6)
    max_gauge = np.zeros(3)
    for i, (name, case, given) in enumerate(cases):
        displacement, reactions, contact = solve(case.f, given)
        balance = abs(house.rigid.T @ (case.f + reactions))
        assert max(balance[:3]) < .03 and max(balance[3:]) < 20, (name, balance)
        max_balance = np.maximum(max_balance, balance)
        max_gauge = np.maximum(max_gauge, abs(np.array(contact['gaugeResidual'])))
        update_bounds(bounds, house, displacement, i, name)
        head_peak = max((-float(reactions[node + 2]) / 1000, point) for point, node in house.heads.items())
        corner_peak = max((float(np.linalg.norm(displacement[wall['top']:wall['top'] + 2])), wall['corner'])
                          for wall in house.Ls)
        for key, peak in zip(peaks, (head_peak, corner_peak)):
            if peak[0] > peaks[key][0]:
                peaks[key] = (*peak, name)
    return {
        'cases': len(cases),
        'maximumGlobalResidualNAndNmm': [round(x, 5) for x in max_balance],
        'maximumVirtualGaugeResidualN': [round(x, 6) for x in max_gauge],
        'peaks': {key: [round(values[0], 4), *values[1:]] for key, values in peaks.items()},
        'guidePeaks': guide_peaks(finalise_bounds(bounds, house)),
    }


if __name__ == '__main__':
    cli = argparse.ArgumentParser()
    cli.add_argument('worktree', type=Path)
    cli.add_argument('mode', choices=('signed', 'signed-quick', 'movement'))
    cli.add_argument('--check', action='store_true')
    args = cli.parse_args()
    if args.check and args.mode == 'signed':
        cli.error('The retained receipt covers signed-quick and movement')
    exact_source(args.worktree)
    with redirect_stdout(sys.stderr):
        comparison = {'signed': signed, 'signed-quick': lambda: signed(False), 'movement': movement}[args.mode]()
    if args.check:
        receipt = json.loads(Path(__file__).with_suffix('.json').read_text())
        assert comparison == receipt[args.mode]
    else:
        print(json.dumps(comparison, indent=2))
