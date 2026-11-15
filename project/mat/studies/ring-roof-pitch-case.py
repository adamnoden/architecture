"""Nominal pitch and slate stock comparison with the selected roof axes held."""
import json
import math
from pathlib import Path
from runpy import run_path
import sys

HERE = Path(__file__).resolve().parent
PROJECT = HERE.parents[1]
course_layout = run_path(str(HERE / 'ring-roof-family.py'))['course_layout']


def read(path):
    return json.loads((PROJECT / path).read_text())


def run(case):
    if set(case) != {'schema', 'pitchDeg'} or case['schema'] != 'mat-ring-roof-pitch-case/1':
        raise ValueError('Expected the explicit roof pitch case')
    pitch = case['pitchDeg']
    if type(pitch) not in (int, float) or not math.isfinite(pitch) or not 0 < pitch < 45:
        raise ValueError('The nominal roof pitch comparison requires a finite pitch between 0 and 45 degrees')
    house = read('had/studies/water-replan.json')['model']
    reference = read('mat/studies/ring-roof-family.json')
    slate = read('mat/studies/ring-roof-family-sources.json')['slate']
    roof = reference['families'][-1]
    outer, _, ridge = reference['catchment']['outerCourtRidgeSides']
    inner = reference['catchment']['revisedCourt']['openSide']
    outer_courses_run = (outer - reference['air']['outerCutWidth']) / 2
    inner_courses_run = reference['air']['cornerWidthPerFace']
    inner_stock_width = inner - reference['openValley']['openWidth'] * math.sqrt(2)
    baseline_pitch = house['roofDevelopment']['pitch']
    shell = house['shell']
    wall_z = roof['requiredWallLine']
    q_outer, q_ridge, q_court = [(shell-side)/2 for side in (outer, ridge, inner)]

    def compare(degrees):
        angle = math.radians(degrees)
        cosine, tangent = math.cos(angle), math.tan(angle)
        z_ridge = wall_z + q_ridge*tangent
        courses = {
            exposure: {
                'outer': course_layout(outer_courses_run, outer, -2, cosine, (slate['size'][0]-limit)/2, slate),
                'court': course_layout(inner_courses_run, inner_stock_width, 2, cosine, (slate['size'][0]-limit)/2, slate),
            }
            for exposure, limit in slate['headlapAt25'].items()
        }
        return {
            'pitchDeg': degrees,
            'fieldSectionQZMm': [[q_outer, wall_z+q_outer*tangent], [0, wall_z], [q_ridge, z_ridge],
                                 [q_court, z_ridge-(q_court-q_ridge)*tangent]],
            'roofSlopeAreaM2': reference['catchment']['revisedCourt']['roofPlanM2']/cosine,
            'planCatchmentM2': reference['catchment']['revisedCourt']['roofPlanM2'],
            'slateStockComparisons': courses,
        }
    native = compare(baseline_pitch)
    if not math.isclose(native['fieldSectionQZMm'][2][1], roof['fieldRidge']) or \
            native['slateStockComparisons'] != reference['load']['slateCoverage']['layouts']:
        raise ValueError('Reference roof geometry or course schedule no longer reproduces the native comparison')
    return {
        'schema': 'mat-ring-roof-pitch-result/1',
        'referencePitchDeg': baseline_pitch,
        'referenceFieldSectionQZMm': native['fieldSectionQZMm'],
        'comparison': compare(pitch),
    }


if __name__ == '__main__':
    print(json.dumps(run(json.load(sys.stdin)), allow_nan=False))
