import hashlib
import json
from pathlib import Path
import sys

from native_rc_cage_envelope import assess_worked_cage_detail
from continuous_rc_cage import barrier_bar_crossings, cage_geometry, proposed_cap_cages, reference_cage_case, review_native_actions, screen_cap_cuts, screen_member_cuts


METHOD = 'project/str/studies/current_rc_cage.py'
PATHS = [METHOD, 'project/str/studies/continuous_rc_cage.py', 'project/had/studies/water-replan.json', 'project/str/studies/current-house-grid.json', 'project/str/studies/native_rc_cage_envelope.py']


def current_cage(native, root):
    if not isinstance(native, dict) or native.get('candidateAccepted') is not False or native.get('completeHouseProof') is not False:
        raise ValueError('Actual unqualified current native RC result required')
    sources = {path: hashlib.sha256((root / path).read_bytes()).hexdigest() for path in PATHS}
    for path, expected in native.get('sourceSHA256', {}).items():
        if hashlib.sha256((root / path).read_bytes()).hexdigest() != expected:
            raise ValueError('Stale native producer input: ' + path)
    for path in PATHS[2:4]:
        if native.get('sourceSHA256', {}).get(path) != sources[path]:
            raise ValueError('Current cage and native structural source differ: ' + path)
    case = reference_cage_case()
    request = native.get('request', {})
    house = request.get('houseCase', {})
    joined = house.get('joinedCase', {})
    expected_bars = {'diameterMm': 12, 'nominalCoverMm': 45, 'minimumCoverMm': 40, 'roundedLinkBarFaceMm': 69}
    if request.get('schema') != 'str-monolithic-rc-portal-case/1' or request.get('barGeometry') != expected_bars:
        raise ValueError('Current cage requires its actual finite RC topology and authored bar geometry')
    water = json.loads((root / PATHS[2]).read_text())['model']
    applicable = house.get('coreAxialWidthMm') == case['normalCoreMm'] and house.get('northUpstandWidthMm') == case['upstandWidthMm']
    applicable = applicable and joined.get('geometry') == {'outerUpstandDepthMm': 750, 'courtUpstandDepthMm': 650}
    applicable = applicable and water['sections']['firstFloorRC'] == {'top': 3370, 'bottom': 3170}
    common = {'schema': 'str-current-rc-cage-result/1', 'sourceSHA256': sources,
        'nativeCaseId': native.get('caseId'), 'case': case, 'structureSelected': False,
        'jointPanelAccepted': False, 'waterstopAccepted': False, 'installedAcceptance': False}
    if not applicable:
        return {**common, 'status': 'unsupported-geometry', 'diagnostics': ['CAGE_GEOMETRY_REAUTHORING_REQUIRED'],
            'scope': 'The worked cage covers only290/200 cores,750/650 upstands and3170..3370 RC. No reference strength substitutes for an edited structural geometry.'}
    portal = water['insulatedPortal']
    grid = json.loads((root / PATHS[3]).read_text())
    caps = proposed_cap_cages(case, portal, grid)
    review = review_native_actions(native, case, portal)
    review.pop('nativeRequest')
    cuts = [*native['memberCuts'], *native.get('interiorMemberCuts', [])]
    screens = screen_member_cuts(case, portal, cuts)
    review.update(screens=screens, actualSimultaneousCutCount=len(cuts),
        nativeCutDigest=hashlib.sha256(json.dumps(cuts, sort_keys=True, separators=(',', ':'), allow_nan=False).encode()).hexdigest(),
        worstUniaxialComparison=max(screens, key=lambda row: row['linearUniaxialRatio']),
        worstClosedLinkFlowComparison=max(screens, key=lambda row: row['linkFlowRatio']))
    review['cutScope'] = 'All native endpoint cuts plus analytic component-moment stationary cuts, member load boundaries and both sides of point loads. This is not a proof of maximum nonlinear cage interaction between stations.'
    cap_screens = screen_cap_cuts(case, caps, native['capCuts'])
    for cap in caps:
        cap.pop('matBarPaths')
    assessment = assess_worked_cage_detail(case, sources)
    return {**common, 'status': assessment['status'], 'detailAssessment': assessment,
        'diagnostics': [item['code'] for item in assessment['rejectionReasons']] + ['CAGE_JOINT_BARRIER_AND_FULL_STRENGTH_UNQUALIFIED'],
        'geometry': cage_geometry(case, portal), 'barrierCrossings': barrier_bar_crossings(case, portal),
        'capCages': caps, 'memberReview': review, 'capScreens': cap_screens,
        'worstCapComparison': max(cap_screens, key=lambda row: row['linearUniaxialRatio']),
        'scope': 'Fresh simultaneous native member/cap actions, actual H12 positions and bond limits. Necessary member/link/bend/cap screens do not prove joint panels, cap/grid/pile transfer, link closures, cracked stiffness or the actual waterstop.'}


if __name__ == '__main__':
    value = json.load(sys.stdin)
    if not isinstance(value, dict) or set(value) != {'schema', 'native'} or value['schema'] != 'str-current-rc-cage-request/1':
        raise ValueError('Exact current native request required, without source or acceptance injection')
    print(json.dumps(current_cage(value['native'], Path(__file__).resolve().parents[3]), allow_nan=False))
