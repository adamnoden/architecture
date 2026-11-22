"""Actual wet-pad captures -> bounded numerical comparison and replay evidence.

The writer verifies complete native capture bytes. The checker replays lossless
cropped native inputs; those inputs do not reconstruct the complete response.
Neither operation executes a nonlinear solve or supplies material resistance.
"""
import argparse
import base64
import copy
import hashlib
import json
import math
from pathlib import Path
import zlib

from floor_section_model import load_source
from floor_section_proof import cases, validate_full
from wet_bearing_refinement import assess_contact, compare_contacts


D = Path(__file__).resolve().parent
ROOT = D.parents[2]
PROOF = D / 'wet-bearing-refinement-proof.json'
INPUTS = D / 'wet-bearing-refinement-inputs.json'
FLOOR = D / 'floor-section-proof.json'
METHOD_PATHS = (
    'project/str/studies/wet_bearing_refinement_proof.py',
    'project/str/studies/wet_bearing_refinement.py',
    'project/str/studies/floor_section_proof.py',
    'project/str/studies/wet-bearing-refinement-inputs.json',
    'project/str/studies/floor-section-proof.json',
)
NAMES = (
    'wet-aligned-quadrature16', 'wet-aligned-quadrature32',
    'wet-aligned-quadrature64',
    'wet-aligned-concrete27-quadrature16',
    'wet-aligned-concrete27-quadrature32',
    'wet-aligned-concrete27-quadrature64',
    'wet-zeroG-roof-suction-quadrature32',
    'wet-zeroG-roof-suction-quadrature64',
    'wet-aligned-quadrature8-restored',
)
PAIRS = (
    ('wet25-16-to-32', NAMES[0], NAMES[1]),
    ('wet25-32-to-64', NAMES[1], NAMES[2]),
    ('wet27-16-to-32', NAMES[3], NAMES[4]),
    ('wet27-32-to-64', NAMES[4], NAMES[5]),
    ('zeroG-32-to-64', NAMES[6], NAMES[7]),
)


def encoded(value):
    return json.dumps(value, separators=(',', ':'), allow_nan=False).encode()


def sha(value):
    return hashlib.sha256(value).hexdigest()


def file_sha(path):
    digest = hashlib.sha256()
    with Path(path).open('rb') as stream:
        for part in iter(lambda: stream.read(1024 * 1024), b''):
            digest.update(part)
    return digest.hexdigest()


def method_sources():
    return {path: file_sha(ROOT / path) for path in METHOD_PATHS}


def expected_native_request(name, source):
    if name not in NAMES:
        raise ValueError('Unknown named wet-bearing development control')
    base = ('wet-aligned-concrete27' if 'concrete27' in name else
            'wet-zeroG-roof-suction' if 'zeroG' in name else 'wet-aligned-quadrature8')
    request = copy.deepcopy(dict(cases(source))[base])
    request['wetSupport']['bearingQuadratureOrder'] = (8 if name.endswith('-restored')
                                                     else int(name.rsplit('quadrature', 1)[1]))
    return request


def crop_native(result):
    """Retain every actual contact observation, not a fitted replacement field."""
    support = result['seatedWetSupport']
    posts = []
    for post in support['posts']:
        row = {key: copy.deepcopy(post[key]) for key in (
            'id', 'rectangleXYMm', 'padCentreXYMm', 'padPhysicalGKN',
            'physicalGKN', 'physicalBottomZMm', 'physicalTopZMm')}
        row['padFit'] = {'nominalRectangleXYMm': copy.deepcopy(post['padFit']['nominalRectangleXYMm'])}
        row['recovery'] = {'physicalEndWrenchesKN_KNmm': copy.deepcopy(post['recovery']['physicalEndWrenchesKN_KNmm'])}
        posts.append(row)
    contacts = [{key: copy.deepcopy(row[key]) for key in (
        'id', 'receiverIndex', 'pointXYZMm', 'areaMm2',
        'relativeDisplacementMm', 'normalCompressionKN')}
        for row in support['contactFibres']]
    return {'schema': result['schema'], 'sourceSHA256': copy.deepcopy(result['sourceSHA256']),
            'request': copy.deepcopy(result['request']),
            'seatedWetSupport': {'settings': copy.deepcopy(support['settings']),
                                'physicalAcceptance': support['physicalAcceptance'],
                                'posts': posts, 'contactFibres': contacts},
            'nativeVertical': {'native': {
                'caseId': result['nativeVertical']['native']['caseId'],
                'heads': copy.deepcopy(result['nativeVertical']['native']['heads'])}}}


def pack_native(value):
    raw = encoded(value)
    return {'schema': 'str-wet-bearing-lossless-cropped-native/1',
            'encoding': 'base64-zlib-json', 'decodedBytes': len(raw),
            'decodedSHA256': sha(raw),
            'data': base64.b64encode(zlib.compress(raw, 9)).decode('ascii'),
            'reconstructsCompleteNativeResponse': False}


def unpack_native(value):
    if not isinstance(value, dict) or value.get('schema') != 'str-wet-bearing-lossless-cropped-native/1' \
            or value.get('encoding') != 'base64-zlib-json' \
            or value.get('reconstructsCompleteNativeResponse') is not False \
            or type(value.get('decodedBytes')) is not int or not 0 < value['decodedBytes'] <= 32 * 1024 * 1024:
        raise ValueError('Versioned bounded lossless cropped-native replay required')
    try:
        compressed = base64.b64decode(value['data'], validate=True)
        decoder = zlib.decompressobj()
        raw = decoder.decompress(compressed, value['decodedBytes'] + 1)
        if decoder.unconsumed_tail or not decoder.eof or decoder.unused_data \
                or len(raw) != value['decodedBytes'] or sha(raw) != value['decodedSHA256']:
            raise ValueError('Cropped-native decoded size/checksum mismatch')
        result = json.loads(raw)
    except (KeyError, TypeError, zlib.error, UnicodeError, json.JSONDecodeError) as error:
        raise ValueError('Invalid lossless cropped-native replay') from error
    return result


def post_head_duties(result):
    """Independent traction origins + pad G, compared with actual finite posts."""
    support = result['seatedWetSupport']
    g = result['request']['bearingCase']['masonryCase']['verticalCase']['monolithicCase']['houseCase']['boundary']['physicalGFactor']
    if type(g) not in (int, float) or not math.isfinite(g) or g < 0:
        raise ValueError('Actual nonnegative physical gravity factor required')
    rows = []
    for index, post in enumerate(support['posts']):
        rectangle = post['rectangleXYMm']
        axis = [(rectangle[j] + rectangle[j + 2]) / 2 for j in (0, 1)]
        fibres = [row for row in support['contactFibres'] if row['receiverIndex'] == index]
        force = sum(row['normalCompressionKN'] for row in fibres)
        pad_g = g * post['padPhysicalGKN']
        first = [sum(row['normalCompressionKN'] * (row['pointXYZMm'][j] - axis[j]) for row in fibres)
                 + pad_g * (post['padCentreXYMm'][j] - axis[j]) for j in (0, 1)]
        reconstructed = [0., 0., -force - pad_g, -first[1] / 1000, first[0] / 1000, 0.]
        actual = post['recovery']['physicalEndWrenchesKN_KNmm']
        if len(actual) != 12 or any(not math.isfinite(v) for v in actual):
            raise ValueError('Both actual finite-post six-wrenches required')
        base, top = [[v if j < 3 else v / 1000 for j, v in enumerate(actual[k:k + 6])] for k in (0, 6)]
        residual = [a - b for a, b in zip(reconstructed, top)]
        height_m = (post['physicalTopZMm'] - post['physicalBottomZMm']) / 1000
        # Transport the top wrench to the post base. Body G is centred on that axis.
        transported = [*top[:3], top[3] - height_m * top[1],
                       top[4] + height_m * top[0], top[5]]
        equilibrium = [a + b for a, b in zip(base, transported)]
        equilibrium[2] -= g * post['physicalGKN']
        if max(map(abs, residual)) > 1e-6 or max(map(abs, equilibrium)) > 1e-6:
            raise ValueError('Independent pad/post six-wrench closure failed')
        rows.append({'id': post['id'], 'postAxisXYMm': axis,
                     'quadratureNormalForceKN': force, 'factoredPadGKN': pad_g,
                     'reconstructedTopWrenchKN_KNm': reconstructed,
                     'actualTopWrenchKN_KNm': top, 'actualBaseWrenchKN_KNm': base,
                     'topReconstructionResidualKN_KNm': residual,
                     'postBodyEquilibriumResidualKN_KNm': equilibrium,
                     'physicalPadContactAndPostHeadResistanceAccepted': False})
    return {'schema': 'str-wet-bearing-post-head-wrench-replay/1', 'posts': rows,
            'scope': 'Actual signed Gauss forces and pad gravity recover the post-head six-wrench; post own G is added only between top and base. No splitting, bond, material or resistance proof.'}


def read_capture(directory, name, source):
    request_path, full_path, manifest_path = [Path(directory) / (name + suffix) for suffix in
                                              ('.request.json', '.full.json', '.capture.json')]
    if not all(path.is_file() for path in (request_path, full_path, manifest_path)):
        raise ValueError('Missing complete actual capture: ' + name)
    request = json.loads(request_path.read_bytes())
    manifest = json.loads(manifest_path.read_bytes())
    if request != expected_native_request(name, source) \
            or manifest.get('schema') != 'str-full-native-control-capture/1' \
            or manifest.get('sourceSHA256') != source['identities'] \
            or manifest.get('request') != request or manifest.get('nativeCaseId') != name:
        raise ValueError('Capture source/request/case mismatch: ' + name)
    full_hash = file_sha(full_path)
    if manifest.get('fullResultSHA256') != full_hash:
        raise ValueError('Complete actual native response checksum mismatch: ' + name)
    result = json.loads(full_path.read_bytes())
    summary = validate_full(result, request, source, name)
    if summary != manifest.get('summary'):
        raise ValueError('Capture summary differs from verified actual native response: ' + name)
    return result, {'fullNativeResponseSHA256': full_hash,
                    'actualRequestFileSHA256': file_sha(request_path),
                    'captureManifestSHA256': file_sha(manifest_path)}


def restore_reference():
    parent = json.loads(FLOOR.read_bytes())
    candidates = [row for row in parent['controls'] if row['nativeCaseId'] == 'wet-aligned-quadrature8']
    if len(candidates) != 1:
        raise ValueError('One actual current aligned-eight parent control required')
    row = candidates[0]
    return {'receipt': 'project/str/studies/floor-section-proof.json', 'receiptSHA256': file_sha(FLOOR),
            'nativeCaseId': row['nativeCaseId'], 'sourceSHA256': row['sourceSHA256'],
            'executedRequest': row['executedRequest'], 'heads': row['heads']}


def derive(controls, reference, criteria):
    natives = {row['caseId']: unpack_native(row['exactCroppedNativeInput']) for row in controls}
    assessments = []
    for row in controls:
        native = natives[row['caseId']]
        assessments.append({'caseId': row['caseId'], 'assessment': assess_contact(native, criteria),
                            'postHeadDuties': post_head_duties(native)})
    comparisons = [{'id': identity, 'coarseCaseId': coarse, 'fineCaseId': fine,
                    'comparison': compare_contacts(natives[coarse], natives[fine], criteria)}
                   for identity, coarse, fine in PAIRS]
    restored = natives[NAMES[-1]]
    if restored['sourceSHA256'] != reference['sourceSHA256'] or restored['request'] != reference['executedRequest']:
        raise ValueError('Restored-eight comparison changed physical request or current sources')
    old = {row['id']: row['reactionKN_KNm'] for row in reference['heads']}
    new = {row['id']: row['reactionKN_KNm'] for row in restored['nativeVertical']['native']['heads']}
    new_rows = restored['nativeVertical']['native']['heads']
    if len(reference['heads']) != 52 or len(new_rows) != 52 or len(old) != 52 or set(old) != set(new) \
            or any(len(wrench) != 6 or any(not math.isfinite(v) for v in wrench)
                   for wrench in [*old.values(), *new.values()]):
        raise ValueError('Restored-eight comparison lost actual52 head identities')
    maximum = max(abs(v - w) for identity in old for v, w in zip(old[identity], new[identity]))
    if maximum > 1e-6:
        raise ValueError('Restored-eight head parity fails unchanged1e-6 comparison')
    return {'assessments': assessments, 'comparisons': comparisons,
            'restoredEight': {'referenceCaseId': reference['nativeCaseId'],
                             'restoredCaseId': NAMES[-1], 'physicalHeadCount': 52,
                             'componentComparisons': 312,
                             'maximumHeadComponentDifferenceKN_KNm': maximum,
                             'maximumPermittedDifferenceKN_KNm': 1e-6}}


def check(proof):
    source = load_source(ROOT)
    authored = json.loads(INPUTS.read_bytes())
    if proof.get('schema') != 'str-wet-bearing-refinement-proof/1' \
            or proof.get('processingSourceSHA256') != method_sources() \
            or proof.get('nativeSourceSHA256') != source['identities'] \
            or proof.get('authored') != authored:
        raise ValueError('Stale current source or authored numerical refinement evidence')
    controls = proof.get('controls')
    if not isinstance(controls, list) or [row.get('caseId') for row in controls] != list(NAMES):
        raise ValueError('All nine named actual native captures required')
    for row in controls:
        native = unpack_native(row['exactCroppedNativeInput'])
        if native.get('sourceSHA256') != source['identities'] \
                or native.get('request') != expected_native_request(row['caseId'], source) \
                or native['nativeVertical']['native']['caseId'] != row['caseId'] \
                or row.get('retainedInputsReconstructFullNativeResponse') is not False \
                or any(not isinstance(row.get(k), str) or len(row[k]) != 64
                       or any(c not in '0123456789abcdef' for c in row[k]) for k in
                       ('fullNativeResponseSHA256', 'actualRequestFileSHA256', 'captureManifestSHA256')):
            raise ValueError('Lost actual source/case/capture identities or replay scope')
    reference = restore_reference()
    if proof.get('restoredEightReference') != reference:
        raise ValueError('Stale or altered actual restored-eight parent')
    if proof.get('derived') != derive(controls, reference, authored['criteria']):
        raise ValueError('Stored refinement result differs from actual cropped-input replay')
    if proof.get('nonlinearSolvesExecutedByThisProducer') != 0 \
            or proof.get('physicalContactAccepted') is not False \
            or proof.get('wholeHouseAccepted') is not False \
            or proof.get('completeSignedActionEnvelopeAvailable') is not False:
        raise ValueError('Unearned physical/whole-house acceptance or native execution claim')
    return proof


def write(directory):
    source = load_source(ROOT)
    controls = []
    for name in NAMES:
        result, identity = read_capture(directory, name, source)
        controls.append({'caseId': name, **identity,
                         'exactCroppedNativeInput': pack_native(crop_native(result)),
                         'retainedInputsReconstructFullNativeResponse': False})
        print(name + ': full source/request/checksum and physical capture checked', flush=True)
    if load_source(ROOT)['identities'] != source['identities']:
        raise ValueError('Native sources changed during actual capture processing')
    authored = json.loads(INPUTS.read_bytes())
    reference = restore_reference()
    proof = {'schema': 'str-wet-bearing-refinement-proof/1',
             'processingSourceSHA256': method_sources(),
             'nativeSourceSHA256': source['identities'], 'authored': authored,
             'controls': controls, 'restoredEightReference': reference,
             'derived': derive(controls, reference, authored['criteria']),
             'nonlinearSolvesExecutedByThisProducer': 0,
             'physicalContactAccepted': False, 'wholeHouseAccepted': False,
             'completeSignedActionEnvelopeAvailable': False,
             'scope': 'Nine actually executed native responses were verified before lossless contact/head crop retention. The retained crop replays numerical and post-head action checks but cannot reconstruct complete native bytes, plate fields or an omitted signed envelope. Full response SHA256 values identify external capture provenance; absent full captures require actual native reruns, never hash rebinding.'}
    check(proof)
    PROOF.write_text(json.dumps(proof, indent=2, allow_nan=False) + '\n')
    return proof


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument('--write', action='store_true')
    mode.add_argument('--check', action='store_true')
    parser.add_argument('--captures', type=Path)
    args = parser.parse_args()
    if args.write:
        if args.captures is None:
            parser.error('--write requires the actual complete --captures directory')
        result = write(args.captures)
    else:
        if args.captures is not None:
            parser.error('--check replays retained cropped inputs; it does not read a capture directory')
        result = check(json.loads(PROOF.read_bytes()))
    print(json.dumps({'controls': len(result['controls']),
                      'comparisons': {row['id']: row['comparison']['numericalRefinementPassing']
                                      for row in result['derived']['comparisons']},
                      'restoredEight': result['derived']['restoredEight']}))
