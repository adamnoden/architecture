import json
import math
import runpy
import sys
from pathlib import Path

from retained_components import evaluate_retained_components, load_retained_source, retained_replacement_delta


def evaluate_contact(request, source):
    if not isinstance(request, dict) or set(request) != {'schema', 'componentCase', 'originAccount'} or request['schema'] != 'str-retained-contact-replay/1':
        raise ValueError('Expected an explicit retained-component case and native originating account')
    account = request['originAccount']
    contact = account.get('globalContact') if isinstance(account, dict) else None
    if not isinstance(account, dict) or account.get('schema') != 'str-origin-load-account-result/1' or account.get('admitted') is not False or not isinstance(contact, dict):
        raise ValueError('The retained comparison requires the actual native signed upper-cut account')
    if contact.get('schema') != 'str-upper-cut-compression-result/1' or contact.get('admitted') is not False or contact.get('additionalRetainedNKN') != 0:
        raise ValueError('The native upper-cut baseline must have no hypothetical added weight')
    rows = contact.get('cases')
    if not isinstance(rows, list) or len(rows) != 96 or contact.get('windCaseCount') != len(rows) or {row['wind'] for row in rows} != set(range(96)):
        raise ValueError('Retain all actual 96 signed wind cases')
    retained = [math.fsum(origin['N_Xmoment_Ymoment'][axis] for origin in account['origins'] if origin['case'] == 'retainedMin') for axis in range(3)]
    if any(abs(a-b) > 1e-8 for a, b in zip(retained, contact['sourceRetainedMinimum'])):
        raise ValueError('The component replacement account differs from the native retained gravity')
    components = evaluate_retained_components(request['componentCase'], source)
    replacement = retained_replacement_delta(components, account['origins'])
    delta = replacement['deltaN_Xfirst_Yfirst']
    if len(delta) != 3 or not all(type(value) in (int, float) and math.isfinite(value) for value in delta):
        raise ValueError('The retained replacement must conserve finite force and both first moments')
    adverse_deltas = replacement['adverseDeltaVerticesN_Xfirst_Yfirst']
    if len(adverse_deltas) != 4 or any(len(vector) != 3 or not all(type(value) in (int, float) and math.isfinite(value) for value in vector) for vector in adverse_deltas):
        raise ValueError('Retain all four adverse wall-loss first-moment vertices')
    methods = runpy.run_path(str(Path(__file__).with_name('current-house-structural-case.py')))
    hull = [[x/1000, y/1000] for x, y in contact['innerContactConvexHullXYMm']]
    centroid = [math.fsum(point[axis] for point in hull)/len(hull) for axis in range(2)]
    results = []
    for row in rows:
        baseline = row['baselineN_Xfirst_Yfirst']
        candidate = [a+b for a, b in zip(baseline, delta)]
        adverses = []
        for vertex, adverse_delta in enumerate(adverse_deltas):
            vector = [a+b for a, b in zip(baseline, adverse_delta)]
            adverses.append({'vertex': vertex, 'candidateN_Xfirst_Yfirst': vector,
                             'contact': methods['_upper_contact'](vector, centroid, hull)})
        results.append({'wind': row['wind'], 'programme': row['programme'], 'courtProjection': row['courtProjection'],
                        'baselineN_Xfirst_Yfirst': baseline, 'candidateN_Xfirst_Yfirst': candidate,
                        'nominalCandidate': methods['_upper_contact'](candidate, centroid, hull),
                        'adverseCandidates': adverses,
                        'candidate': {'passesNecessaryVerticalCondition': all(value['contact']['passesNecessaryVerticalCondition'] for value in adverses)}})
    return {
        'schema': 'str-retained-contact-result/1', 'components': components, 'replacement': replacement,
        'contact': {'cutZMm': contact['cutZMm'], 'roofRiseMm': contact['roofRiseMm'],
                    'windCaseCount': len(results), 'baselinePassingCount': contact['baselinePassingCount'],
                    'candidatePassingCount': sum(row['candidate']['passesNecessaryVerticalCondition'] for row in results),
                    'innerContactConvexHullXYMm': contact['innerContactConvexHullXYMm'],
                    'nativeUpperCutReplayResidual': contact['nativeUpperCutReplayResidual'], 'cases': results},
        'installedAcceptance': False, 'completeHouseProof': False, 'completeSpliceDemand': None,
        'sourceAuthority': 'The signed account is trusted derived input supplied by the sealed current-design adapter; this numerical kernel does not authenticate a standalone supplied load account.',
        'scope': 'Necessary global vertical/contact equilibrium with net source components, declared comparison retention paths and all four adverse wall-loss first-moment vertices. Both old retained floor/core families are replaced, including when every new path withholds. No local DPC bearing/shear, diaphragm/roof anchorage, whole-house compatibility, ground-floor moisture or installation acceptance.',
    }


if __name__ == '__main__':
    try:
        result = evaluate_contact(json.load(sys.stdin), load_retained_source(Path(__file__).resolve().parents[3]))
    except ValueError as error:
        raise SystemExit(str(error)) from None
    print(json.dumps(result, allow_nan=False))
