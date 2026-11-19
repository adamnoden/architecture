import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { test } from 'node:test'

test('selected HAD services source reproduces from corrected current MAT and rejects drift', { timeout: 180000 }, () => {
  const run = spawnSync(process.execPath, ['project/had/studies/check-services-source-auth.mjs'], {
    cwd: process.cwd(), encoding: 'utf8', timeout: 150000
  })
  assert.equal(run.status, 0, run.stderr || run.stdout)
  assert.deepEqual(JSON.parse(run.stdout), {
    defaultCurrent: 'pass', exactHistoricalOverride: 'pass', unknownProse: 'rejected',
    numericMutation: 'rejected', historicalOverrideMutation: 'rejected', generatedFiles: 'unchanged by --check'
  })
})
