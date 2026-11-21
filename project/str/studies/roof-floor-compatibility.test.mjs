import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';

test('roof operator and all eighteen real plate feet share source-bound work coordinates', () => {
  for (const file of ['roof_floor_compatibility_test.py', 'roof_stock_gravity_test.py']) {
    const result = spawnSync('python3', ['-B', `project/str/studies/${file}`], {
      encoding: 'utf8', env: { ...process.env, OPENBLAS_NUM_THREADS: '1', OMP_NUM_THREADS: '1' },
    });
    assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  }
});
