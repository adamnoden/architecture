import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';

test('floor reinforcement separates conventional straight paths, real depth and rejected returns', () => {
  for (const args of [['project/str/studies/floor_reinforcement_test.py'],
    ['project/str/studies/floor_reinforcement_proof.py', '--check']]) {
    const result = spawnSync('python3', ['-B', ...args], { encoding: 'utf8' });
    assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  }
});
