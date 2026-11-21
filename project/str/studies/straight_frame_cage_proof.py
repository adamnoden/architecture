import hashlib
import json
from pathlib import Path
import sys

from straight_frame_cage import assess_straight_frame_cage, reference_straight_frame_cage_result, render_straight_frame_cage

D=Path(__file__).resolve().parent
P='project/str/studies/masonry-frame-a-proof.json'


def proof():
    result=reference_straight_frame_cage_result()
    authored=result['request'].get('straightFrameCage')
    assessment=assess_straight_frame_cage(result,authored)
    root=D.parents[2]
    for path,identity in result['sourceSHA256'].items():
        if hashlib.sha256((root/path).read_bytes()).hexdigest()!=identity:raise ValueError('Stale actual A proof input; rerun native model before cage assessment: '+path)
    return {'schema':'str-straight-frame-cage-proof/1','sourceSHA256':assessment['sourceSHA256'],
        'cageControlsProvenance':'actual authored A case' if authored is not None else 'explicit historical control; this old A case contains no authored cage variant',
        'actualNativeProof':{'path':P,'sha256':hashlib.sha256((root/P).read_bytes()).hexdigest()},
        'proofProducerSHA256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
        'assessment':assessment,'candidateAccepted':False,'reinforcementAccepted':False,'installedAcceptance':False},render_straight_frame_cage(result,assessment)


if __name__=='__main__':
    if sys.argv[1:] not in (['--write'],['--check']):raise SystemExit('Use --write or --check')
    value,svg=proof();encoded=json.dumps(value,indent=2,allow_nan=False)+'\n'
    if sys.argv[1:] == ['--write']:
        (D/'straight-frame-cage-proof.json').write_text(encoded);(D/'straight-frame-cage.svg').write_text(svg)
    else:
        if json.loads((D/'straight-frame-cage-proof.json').read_text())!=value or (D/'straight-frame-cage.svg').read_text()!=svg:raise SystemExit('Stale straight frame cage source/output')
