import { execFileSync } from 'node:child_process';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

test('structural LU retains pivoting, sparse fill and repeated right-hand-side solves', () => {
  const solver = fileURLToPath(new URL('./structural-linear.py', import.meta.url));
  execFileSync('python3', ['-B', '-c', `
import runpy
import sys

factor = runpy.run_path(sys.argv[1])['factor']
matrix = [
    [0.0, 1.0, 0.0, 0.0],
    [4.0, 2.0, 0.0, 0.0],
    [2.0, 0.0, 4.0, 0.0],
    [0.0, 0.0, 2.0, 2.0],
]
solve = factor(matrix)
assert solve([2.0, 8.0, 14.0, 14.0]) == [1.0, 2.0, 3.0, 4.0]
assert solve([0.0, -8.0, 0.0, 10.0]) == [-2.0, 0.0, 1.0, 4.0]
assert solve([0.0, 0.0, 0.0, 0.0]) == [0.0] * 4
assert matrix[0] == [0.0, 1.0, 0.0, 0.0]

try:
    factor([[0.0, 0.0], [1.0, 1.0]])
except ValueError as error:
    assert str(error) == 'singular/unrestrained model'
else:
    raise AssertionError('expected the singular matrix to fail')
`, solver]);
});
