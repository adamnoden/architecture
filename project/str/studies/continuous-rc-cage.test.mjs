import { spawnSync } from 'node:child_process';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../../', import.meta.url));
test('Actual continuous RC cage, native cuts and bounded contact rejection reproduce', () => {
  for (const [file, args] of [
    ['continuous_rc_cage_test.py', []],
    ['continuous_rc_cage_proof.py', ['--check']],
  ]) {
    const result = spawnSync('python', ['-B', `project/str/studies/${file}`, ...args], {
      cwd: root,
      env: { ...process.env, OPENBLAS_NUM_THREADS: '1', OMP_NUM_THREADS: '1' },
      encoding: 'utf8',
    });
    assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  }
});
