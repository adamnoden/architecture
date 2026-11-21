import test from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../../../', import.meta.url))

test('straight-frame candidate: independent geometry/equilibrium, actual source-bound adverse proof and changed section', () => {
  const result = spawnSync('python3', ['-B', 'project/str/studies/masonry_frame_a_test.py'], {
    cwd: root, encoding: 'utf8', timeout: 30000, maxBuffer: 1024 * 1024,
  })
  assert.equal(result.status, 0, result.stdout + result.stderr)
  assert.match(result.stderr, /Ran 8 tests/)
  assert.doesNotMatch(result.stderr, /skipped=/)
})
