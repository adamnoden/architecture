import { spawnSync } from 'node:child_process';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../../', import.meta.url));
test('Actual loaded RC floor and continuous portal preserve source and member work', () => {
  for (const file of ['rc_member_load_test.py', 'rc_floor_house_test.py', 'monolithic_rc_state_test.py', 'current_rc_cage_test.py', 'monolithic_rc_sweep_test.py', 'native_rc_cage_envelope_test.py', 'monolithic_rc_governing_test.py', 'continuous_rc_closed_links_test.py', 'portal_architectural_simplification_test.py']) {
    const result = spawnSync('python', [`project/str/studies/${file}`], {
      cwd: root,
      env: { ...process.env, OPENBLAS_NUM_THREADS: '1', OMP_NUM_THREADS: '1' },
      encoding: 'utf8',
    });
    assert.equal(result.status, 0, `${file}\n${result.stdout}\n${result.stderr}`);
  }
  for (const file of ['continuous_rc_closed_links_proof.py', 'portal_architectural_simplification.py']) {
    const result = spawnSync('python', ['-B', `project/str/studies/${file}`, '--check'], { cwd: root, encoding: 'utf8' });
    assert.equal(result.status, 0, `${file}\n${result.stdout}\n${result.stderr}`);
  }
});
