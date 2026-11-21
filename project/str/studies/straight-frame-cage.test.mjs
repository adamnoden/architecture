import { spawnSync } from 'node:child_process';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../../../', import.meta.url));
test('straight-frame cage consumes actual signed cuts and rejects inherited joint/cap fit', () => {
  for (const args of [[], ['--check']]) {
    const file = args.length ? 'straight_frame_cage_proof.py' : 'straight_frame_cage_test.py';
    const r = spawnSync('python3', ['-B', `project/str/studies/${file}`, ...args], {cwd:root,encoding:'utf8'});
    assert.equal(r.status,0,`${r.stdout}\n${r.stderr}`);
  }
});
