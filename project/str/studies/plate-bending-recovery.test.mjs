import { spawnSync } from 'node:child_process';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../../', import.meta.url));
test('physical plate bending recovery preserves curvature, work and adverse inputs', () => {
  const result = spawnSync('python3', ['-B', 'project/str/studies/plate_bending_recovery_test.py'], {
    cwd: root, encoding: 'utf8',
  });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
});
