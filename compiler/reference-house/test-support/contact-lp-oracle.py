import itertools
import json
import math
import sys


def solve_three(matrix, rhs):
    augmented = [list(row) + [value] for row, value in zip(matrix, rhs)]
    for column in range(3):
        pivot = max(range(column, 3), key=lambda row: abs(augmented[row][column]))
        if abs(augmented[pivot][column]) < 1e-12:
            return None
        augmented[column], augmented[pivot] = augmented[pivot], augmented[column]
        divisor = augmented[column][column]
        augmented[column] = [value / divisor for value in augmented[column]]
        for row in range(3):
            if row != column:
                factor = augmented[row][column]
                augmented[row] = [a - factor * b for a, b in zip(augmented[row], augmented[column])]
    return [augmented[index][3] for index in range(3)]


def minimum_added_load(hull_m, centroid_m, vector):
    columns = [[1., x, y] for x, y in hull_m] + [[-1., -centroid_m[0], -centroid_m[1]]]
    best = None
    for basis in itertools.combinations(range(len(columns)), 3):
        matrix = [[columns[column][row] for column in basis] for row in range(3)]
        solution = solve_three(matrix, vector)
        if solution is None or min(solution) < -1e-9:
            continue
        full = [0.] * len(columns)
        for index, value in zip(basis, solution):
            full[index] = max(0., value)
        residual = [math.fsum(value * column[row] for value, column in zip(full, columns)) - vector[row] for row in range(3)]
        if max(map(abs, residual)) > 1e-7:
            continue
        if best is None or full[-1] < best['minimumAdditionalRetainedNKN']:
            best = {'minimumAdditionalRetainedNKN': full[-1], 'reactionsAtHullVerticesKN': full[:-1], 'equilibriumResidual': residual}
    return best or {'minimumAdditionalRetainedNKN': None, 'reactionsAtHullVerticesKN': None, 'equilibriumResidual': None}


def run(request):
    if not isinstance(request, dict) or set(request) != {'hullXYMm', 'centroidXYMm', 'vectors'}:
        raise ValueError('Expected hullXYMm, centroidXYMm and vectors')
    hull, centroid, vectors = (request[key] for key in ('hullXYMm', 'centroidXYMm', 'vectors'))
    finite = lambda value: type(value) in (int, float) and math.isfinite(value)
    if not isinstance(hull, list) or len(hull) < 3 or any(not isinstance(point, list) or len(point) != 2 or not all(map(finite, point)) for point in hull):
        raise ValueError('Expected at least three finite hull vertices in XY millimetres')
    if not isinstance(centroid, list) or len(centroid) != 2 or not all(map(finite, centroid)):
        raise ValueError('Expected a finite added-load centroid in XY millimetres')
    if not isinstance(vectors, list) or not vectors or any(not isinstance(vector, list) or len(vector) != 3 or not all(map(finite, vector)) for vector in vectors):
        raise ValueError('Expected nonempty finite N/X-first/Y-first vectors in kN/kNm/kNm')
    hull_m = [[x / 1000, y / 1000] for x, y in hull]
    centroid_m = [value / 1000 for value in centroid]
    return {'method': 'nonnegative hull reactions and added load, equality LP by basic feasible solutions',
            'componentOrder': ['N_kN', 'X_first_moment_kNm', 'Y_first_moment_kNm'],
            'cases': [minimum_added_load(hull_m, centroid_m, vector) for vector in vectors]}


if __name__ == '__main__':
    try:
        print(json.dumps(run(json.load(sys.stdin)), allow_nan=False))
    except ValueError as error:
        raise SystemExit(str(error)) from None
