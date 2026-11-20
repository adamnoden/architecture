import { spawnSync } from 'node:child_process';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../../', import.meta.url));
test('Joined RC receiving paths conserve work and retain actual contact and source boundaries', () => {
  for (const file of ['perforated_floor_receiving_test.py', 'joined_rc_floor_test.py']) {
    const result = spawnSync('python', [`project/str/studies/${file}`], {
      cwd: root,
      env: { ...process.env, OPENBLAS_NUM_THREADS: '1', OMP_NUM_THREADS: '1' },
      encoding: 'utf8',
    });
    assert.equal(result.status, 0, `${file}\n${result.stdout}\n${result.stderr}`);
  }
});
