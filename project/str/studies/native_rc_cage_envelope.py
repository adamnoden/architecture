"""Necessary cage screens of simultaneous cuts in the executed native sweep.

This consumes results; it never calls, modifies or substitutes for a solver.
"""
import argparse
import copy
import hashlib
import itertools
import json
import math
from pathlib import Path

import continuous_rc_cage
from continuous_rc_cage import cage_geometry, proposed_cap_cages, reference_cage_case, screen_cap_cuts, screen_member_cuts


METHOD = 'project/str/studies/native_rc_cage_envelope.py'
CAGE = 'project/str/studies/continuous_rc_cage.py'
WATER = 'project/had/studies/water-replan.json'
GRID = 'project/str/studies/current-house-grid.json'
PRODUCER = 'project/str/studies/monolithic_rc_sweep.py'
COLUMNS = ('axialCompressionKN', 'shearYKN', 'shearZKN', 'torsionKNm', 'bendingYKNm', 'bendingZKNm')
FALSE_FLAGS = ('candidateAccepted', 'completeHouseProof', 'roofAdoption', 'installedAcceptance', 'waterControlAccepted', 'thermalAccepted')
REJECTED_DETAIL_CASE_SHA256 = 'e7dabdef8687db90bfb84db7753b838e3926c950a0fbe81985ae1f5f033ea258'
REJECTED_DETAIL_METHOD_SHA256 = 'a55fb1a4b945c165504fafa224eef95bb3ac46aa79fb3e831fd5c25ea915077c'
REJECTED_DETAIL_WATER_SHA256 = '735bdb0475c25ff2b83426152b5545d583b8d175fc4549f4c6a0ac6055da54bc'


def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(',', ':'), allow_nan=False).encode()).hexdigest()


def _finite(value):
    return type(value) in (int, float) and math.isfinite(value)


def assess_worked_cage_detail(case, controlling_sources=None):
    if controlling_sources is None:
        root = Path(continuous_rc_cage.__file__).resolve().parents[3]
        controlling_sources = {path: hashlib.sha256((root / path).read_bytes()).hexdigest() for path in (CAGE, WATER)}
    case_sha = digest(case)
    method_sha = controlling_sources.get(CAGE)
    water_sha = controlling_sources.get(WATER)
    rejected = case_sha == REJECTED_DETAIL_CASE_SHA256 and method_sha == REJECTED_DETAIL_METHOD_SHA256 and water_sha == REJECTED_DETAIL_WATER_SHA256
    return {'status': 'rejected-detail' if rejected else 'unqualified-detail', 'assemblyAccepted': False,
        'authoredCageCaseSHA256': case_sha, 'geometryMethodSHA256': method_sha,
        'portalSourceSHA256': water_sha,
        'reviewedRejectedCaseSHA256': REJECTED_DETAIL_CASE_SHA256,
        'reviewedRejectedGeometryMethodSHA256': REJECTED_DETAIL_METHOD_SHA256,
        'reviewedRejectedPortalSourceSHA256': REJECTED_DETAIL_WATER_SHA256,
        'reviewEvidence': {'path': 'project/str/studies/continuous-rc-closed-links-proof.json',
            'sha256': 'd883f33e0c75f0366ff2ff65aaf7eaf3ea29306db9b674f4ef7313c35782d32c',
            'record': 'project/str/continuous-rc-closed-links.md',
            'scope': 'Historical69mm-face lap rejection and explicit rejected71mm-face replacement joint trials; the latter are not relabelled as source69mm geometry.'},
        'basis': 'Owning geometric review of the exact worked69mm-face/4550mm-lap reference detail, separate from necessary section-action comparisons.',
        'rejectionReasons': [
            {'code': 'REFERENCE_ARCH_POST_JOINT_TIES_INCOMPATIBLE',
                'detail': 'The reference horizontal hoops do not provide a constructible closed-tie assembly through the eight-bar arch/post joint when actual rib/hook envelopes and at-most100mm spacing are included.'},
            {'code': 'REFERENCE_NEAR_BEND_LAP_APPROACH_INCOMPATIBLE',
                'detail': 'The reference near4550mm staggered lap has only13mm ramp: its4mm jog radius lower bound is7.041666667mm against86mm required; the mirrored16mm jog gives1.760416667mm. This is not a feasible formed-bar continuation.'},
        ] if rejected else [],
        'sectionScreenApplicability': 'Existing source/geometry checks still govern; passing necessary action screens do not admit the assembly.',
        'requiredNextProof': 'Reauthor and geometrically prove the actual joint ties, hook/rib envelopes, transitions and formed lap approaches. A custom cage remains unqualified until its own complete geometry and action applicability are demonstrated.',
        'scope': 'The exact default joint assembly is rejected, not merely awaiting fabrication approval.' if rejected else 'No geometric approval or default-detail rejection is inherited by an edited cage case, changed geometry method or changed portal source.'}


def reconstruct_cuts(geometry, vectors):
    if not isinstance(geometry, list) or not geometry or not isinstance(vectors, list) or len(geometry) != len(vectors):
        raise ValueError('Every physical cut must have exactly one simultaneous six-action vector')
    rows = []
    for body, vector in zip(geometry, vectors):
        if not isinstance(body, dict) or any(key in body for key in COLUMNS):
            raise ValueError('Cut geometry must not contain competing authored/result actions')
        if not isinstance(vector, list) or len(vector) != 6 or not all(_finite(x) for x in vector):
            raise ValueError('Six finite signed native actions required, without truncation or component envelope substitution')
        rows.append({**body, **dict(zip(COLUMNS, vector))})
    return rows


def _validate_rows(rows, interior=False):
    if not isinstance(rows, list) or not rows:
        raise ValueError('Actual physical section rows required')
    for row in rows:
        if not isinstance(row.get('memberId'), str) or not row['memberId']:
            raise ValueError('Stable member identity required')
        if not all(_finite(row.get(key)) for key in (*COLUMNS, 'breadthMm', 'depthMm')):
            raise ValueError('Finite actual cut actions and section dimensions required')
        if min(row['breadthMm'], row['depthMm']) <= 0:
            raise ValueError('Positive actual section dimensions required')
        point = row.get('physicalPointMm')
        if not isinstance(point, list) or len(point) != 3 or not all(_finite(x) for x in point):
            raise ValueError('Actual three-dimensional physical cut required')
        if interior and (row.get('end') is not None or not _finite(row.get('fraction')) or not 0 < row['fraction'] < 1 or row.get('cutSide') not in ('left', 'right')):
            raise ValueError('Native interior fraction and cut side required')


def _governing(rows, field, direction=None):
    row = max(rows, key=lambda item: item[field] if direction is None else item['matChordComparisons'][direction][field])
    value = row[field] if direction is None else row['matChordComparisons'][direction][field]
    return {'comparison': field, 'value': value, 'exceedsOne': value > 1, 'direction': direction, 'simultaneousCut': row}


def screen_case(case, portal, caps, cut_geometry, native_case, *, physical_g_factor, include_external_gmaxq):
    """Screen one executed case; useful independently for analytical hand controls."""
    ends = reconstruct_cuts(cut_geometry['memberCuts'], native_case['memberCutVectors'])
    cap_rows = reconstruct_cuts(cut_geometry['capCuts'], native_case['capCutVectors'])
    interior = native_case['interiorMemberCuts']
    _validate_rows(ends); _validate_rows(cap_rows); _validate_rows(interior, interior=True)
    member_ids = {row['memberId'] for row in ends}
    if any(row['memberId'] not in member_ids for row in interior):
        raise ValueError('Interior cut belongs to an absent physical member')
    members = screen_member_cuts(case, portal, [*ends, *interior])
    cap_screens = screen_cap_cuts(case, caps, cap_rows)
    for row in cap_screens:
        for comparison in row['matChordComparisons'].values():
            comparison['hookTailBondRatio'] = comparison['poorBondDevelopmentRequiredMm'] / comparison['conservativelyCreditedStraightHookTailMm']
            comparison['bendMandrelRatio'] = comparison['bendMandrelRequiredForChordMm'] / comparison['authoredMandrelMm']
    governing = {
        'memberUniaxial': _governing(members, 'linearUniaxialRatio'),
        'memberClosedLinkFlow': _governing(members, 'linkFlowRatio'),
        'capUniaxial': _governing(cap_screens, 'linearUniaxialRatio'),
        'capClosedLinkFlow': _governing(cap_screens, 'closedLinkFlowRatio'),
    }
    for field in ('ratio', 'hookTailBondRatio', 'bendMandrelRatio'):
        candidates = [_governing(cap_screens, field, axis) for axis in ('NS', 'EW')]
        governing['capMat/' + field] = max(candidates, key=lambda item: item['value'])
    return {'caseId': native_case['caseId'], 'windIndex': native_case['windIndex'], 'programme': native_case['programme'],
        'physicalGFactor': physical_g_factor, 'includeExternalGMAXQ': include_external_gmaxq,
        'memberEndpointCutCount': len(ends), 'memberInteriorCutCount': len(interior), 'capCutCount': len(cap_rows),
        'simultaneousCutsSHA256': digest({'memberCuts': ends, 'interiorMemberCuts': interior, 'capCuts': cap_rows}),
        'allNecessaryScreensWithinOne': all(item['value'] <= 1 for item in governing.values()), 'governing': governing}


def _safe_json(value):
    if isinstance(value, float) and not math.isfinite(value):
        return None
    if isinstance(value, dict):
        return {key: _safe_json(item) for key, item in value.items()}
    if isinstance(value, (tuple, list)):
        return [_safe_json(item) for item in value]
    return value


def _source_hash(root, relative):
    path = Path(relative)
    if path.is_absolute() or '..' in path.parts or not path.parts or path.parts[0] != 'project':
        raise ValueError('Repository-relative project source identity required')
    return hashlib.sha256((root / path).read_bytes()).hexdigest()


def review_native_sweep(proof_path, root, cage_case=None):
    root = Path(root).resolve(); proof_path = Path(proof_path)
    raw = proof_path.read_bytes(); proof = json.loads(raw)
    for relative, actual in ((METHOD, Path(__file__)), (CAGE, Path(continuous_rc_cage.__file__))):
        if _source_hash(root, relative) != hashlib.sha256(actual.read_bytes()).hexdigest():
            raise ValueError('Verified source differs from the executed cage consumer: ' + relative)
    if not isinstance(proof, dict) or proof.get('schema') != 'str-monolithic-rc-native96-sweep/1' or any(proof.get(key) is not False for key in FALSE_FLAGS):
        raise ValueError('Actual unqualified native96 sweep required; no acceptance injection')
    sources = proof.get('sourceSHA256')
    if not isinstance(sources, dict) or not sources or any(_source_hash(root, path) != expected for path, expected in sources.items()):
        raise ValueError('Stale native producer/source: regenerate the actual sweep')
    if proof.get('proofProducerSHA256') != _source_hash(root, PRODUCER):
        raise ValueError('Stale native sweep producer')
    for required in (WATER, GRID, 'project/str/studies/rc_floor_house_loads.py', 'project/str/studies/rc_portal_monolithic.py', 'project/str/studies/joined_successor_kernel.py', 'project/str/studies/structural-linear.py'):
        if required not in sources:
            raise ValueError('Missing controlling native source: ' + required)
    base = proof.get('authoredBaseCase', {}); house = base.get('houseCase', {}); joined = house.get('joinedCase', {})
    house_sources = {key: value for key, value in sources.items() if key != 'project/str/studies/rc_portal_monolithic.py'}
    if base.get('schema') != 'str-monolithic-rc-portal-case/1' or base.get('sourceSHA256') != sources or house.get('sourceSHA256') != house_sources:
        raise ValueError('Actual authored native case and identical source bindings required')
    if tuple(proof.get('actionColumns', [])) != COLUMNS:
        raise ValueError('Native action order changed; no silent sign or unit remapping')
    if base.get('barGeometry') != {'diameterMm': 12, 'nominalCoverMm': 45, 'minimumCoverMm': 40, 'roundedLinkBarFaceMm': 69}:
        raise ValueError('Actual native H12/45/40/69 geometry contract required')
    case = copy.deepcopy(reference_cage_case() if cage_case is None else cage_case)
    if case.get('supportMode') != 'continuous-rc-through-former-DPC':
        raise ValueError('Continuous native frame cannot inherit a historical rocking-DPC cage')
    if case.get('concreteCompressionMPa') != 17 or case.get('steelYieldMPa') != 500 / 1.15:
        raise ValueError('Unsupported capacity-law edit: current kernels require17MPa concrete and500/1.15MPa steel')
    water = json.loads((root / WATER).read_text())['model']; grid = json.loads((root / GRID).read_text())
    if house.get('coreAxialWidthMm') != case['normalCoreMm'] or house.get('northUpstandWidthMm') != case['upstandWidthMm'] or joined.get('geometry') != {'outerUpstandDepthMm': 750, 'courtUpstandDepthMm': 650} or water['sections']['firstFloorRC'] != {'top': 3370, 'bottom': 3170}:
        raise ValueError('Unsupported cage/native source geometry: explicitly reauthor the worked cage')
    boundary = house.get('boundary', {})
    if boundary.get('physicalGFactor') != .9 or boundary.get('includeExternalGMAXQ') is not False:
        raise ValueError('Native sweep baseline must be actual0.9physicalG without externalGMAXQ')
    cases = proof.get('cases', []); strength = proof.get('GMAXQCases', [])
    if proof.get('programmeIdCount') != 96 or proof.get('uniquePhysicalWindSolveCount') != 48 or len(cases) != 48 or {row.get('windIndex') for row in cases} != set(range(48)):
        raise ValueError('Require48 actually executed unique physical wind cases for96 source identities')
    if proof.get('additionalGMAXQCaseCount') != len(strength) or not strength or len({row.get('windIndex') for row in strength}) != len(strength) or any(row.get('windIndex') not in range(48) for row in strength):
        raise ValueError('Exact, separately labelled selectedGMAXQ execution set required')
    if len({row.get('caseId') for row in cases + strength}) != len(cases) + len(strength):
        raise ValueError('Duplicate/missing executed case identity')
    pairs = proof.get('pairedProgrammeIds', [])
    if len(pairs) != 48 or {(row.get('windIndex'), row.get('reuseExecutedWindIndex')) for row in pairs} != {(i + 48, i) for i in range(48)}:
        raise ValueError('Actual paired source identities required, without claiming96 physical solves')
    portal = water['insulatedPortal']; geometry = cage_geometry(case, portal); caps = proposed_cap_cages(case, portal, grid)
    cut_geometry = proof.get('cutGeometry', {})
    if len(cut_geometry.get('memberCuts', [])) != 192 or len(cut_geometry.get('capCuts', [])) != 8:
        raise ValueError('Actual192 endpoint/eight finite-cap-cut topology required')
    summaries = []
    programmes = [list(bits) for bits in itertools.product(range(7), repeat=2) if bits != (0, 0)]
    for rows, g_factor, external in ((cases, .9, False), (strength, 1.35, True)):
        for row in rows:
            expected_id = ('MONOLITHIC-GMAXQ-W' if external else 'MONOLITHIC-G0.9-W') + str(row['windIndex'])
            if row.get('caseId') != expected_id:
                raise ValueError('Case identity disagrees with its executed wind/G allocation')
            programme = row.get('programme')
            if not isinstance(programme, list) or len(programme) != 2 or any(type(value) is not int or not 0 <= value <= 6 for value in programme):
                raise ValueError('Actual two-axis source wind programme required')
            if programme != programmes[row['windIndex']]:
                raise ValueError('Executed wind identity disagrees with its actual source programme')
            summaries.append(screen_case(case, portal, caps, cut_geometry, row, physical_g_factor=g_factor, include_external_gmaxq=external))
    governors = {}
    for name in summaries[0]['governing']:
        winner = max(summaries, key=lambda row: row['governing'][name]['value'])
        governors[name] = {key: winner[key] for key in ('caseId', 'windIndex', 'programme', 'physicalGFactor', 'includeExternalGMAXQ')}
        governors[name].update(winner['governing'][name])
    unbounded = any(not math.isfinite(row['governing'][name]['value']) for row in summaries for name in governors)
    detail = assess_worked_cage_detail(case, {CAGE: _source_hash(root, CAGE), WATER: sources[WATER]})
    result = {'schema': 'str-native-rc-cage-envelope/1', 'status': 'computed-necessary-comparison',
        'nativeProofSHA256': hashlib.sha256(raw).hexdigest(), 'nativeProofProducerSHA256': proof['proofProducerSHA256'],
        'nativeSourceSHA256': sources, 'sourceSHA256': {path: _source_hash(root, path) for path in (METHOD, CAGE, WATER, GRID)},
        'authoredNativeBaseCaseSHA256': digest(base), 'authoredCageCase': case, 'authoredCageCaseSHA256': digest(case),
        'geometry': geometry, 'executedWindCaseCount': len(cases), 'pairedSourceProgrammeIdCount': 96,
        'selectedGMAXQCaseCount': len(strength), 'selectedGMAXQWindIndices': [row['windIndex'] for row in strength],
        'GMAXQSelectionScope': proof.get('GMAXQSelectionScope'), 'caseSummaries': summaries, 'governing': governors,
        'allNecessaryScreensWithinOne': all(row['allNecessaryScreensWithinOne'] for row in summaries),
        'detailAssessment': detail,
        'nonFiniteCapacityScreenPresent': unbounded,
        'diagnostics': ['CAGE_JOINT_BARRIER_AND_FULL_STRENGTH_UNQUALIFIED'] + (['CAGE_REFERENCE_JOINT_DETAIL_REJECTED'] if detail['status'] == 'rejected-detail' else ['CAGE_EDITED_DETAIL_GEOMETRY_UNQUALIFIED']) + (['CAGE_ZERO_OR_UNBOUNDED_CAPACITY_SCREEN'] if unbounded else []),
        'structureSelected': False, 'jointPanelAccepted': False, 'waterstopAccepted': False, 'installedAcceptance': False,
        'scope': 'All actual simultaneous endpoint, analytic component-moment stationary, load-boundary and point-load-side cuts from48 physical wind solves plus the explicitly selectedGMAXQ cases. Necessary member/link/cap/mat/bond/bend comparisons only; not maximum nonlinear interaction between stations or an exhaustive48-caseGMAXQ capacity envelope. No joint-panel, diagonal-strut, cap/grid/pile, link-closure, cracked-stiffness, thermal/waterstop, fabrication or installed acceptance.'}
    return _safe_json(result)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('proof', type=Path)
    parser.add_argument('--cage-case', type=Path, help='Exact authored cage case JSON; defaults to the worked reference case')
    parser.add_argument('--output', type=Path, help='Write receipt here; otherwise print JSON')
    args = parser.parse_args()
    case = json.loads(args.cage_case.read_text()) if args.cage_case else None
    result = review_native_sweep(args.proof, Path(__file__).resolve().parents[3], case)
    encoded = json.dumps(result, indent=2, allow_nan=False) + '\n'
    if args.output:
        args.output.write_text(encoded)
    else:
        print(encoded, end='')
