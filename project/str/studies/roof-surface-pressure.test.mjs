import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';

test('actual signed roof row pressures preserve origins, rigid work and released local cuts', () => {
  const result = spawnSync('python3', ['-B', 'project/str/studies/roof_surface_pressure_test.py'], {
    encoding: 'utf8', env: { ...process.env, OPENBLAS_NUM_THREADS: '1', OMP_NUM_THREADS: '1' },
  });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
});
