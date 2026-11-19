import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {spawnSync} from 'node:child_process'
import {test} from 'node:test'

test('RWT-06 both-end blockage exposes finite gross time, not a capacity claim', () => {
  const model = JSON.parse(readFileSync('project/rwt/studies/over-roof-service.json', 'utf8'))
  const g = model.gutterTrial
  const blocked = g.bothEndsBlockedNoOutflow
  const lengthM = model.assumptions.lengthM
  const widthM = (g.westXMm[1] - g.westXMm[0]) / 1000
  const fullSideFlow = model.derived.flowLitresPerSecond / 2
  const linearGross = lengthM * widthM * (g.topZmm - (g.highInvertZmm + g.endInvertZmm) / 2)
  const impossibleDeepestGross = lengthM * widthM * (g.topZmm - g.endInvertZmm)
  assert.equal(blocked.idealLinearInvertGrossStorageLitres, linearGross)
  assert.equal(blocked.extremeDeepestInvertGrossUpperLitres, impossibleDeepestGross)
  assert.equal(blocked.idealTopFillSecondsAt216, linearGross / fullSideFlow)
  assert.equal(blocked.absoluteGrossUpperSecondsAt216, impossibleDeepestGross / fullSideFlow)
  assert.ok(blocked.idealTopFillSecondsAt216 < blocked.absoluteGrossUpperSecondsAt216)
  assert.ok(blocked.absoluteGrossUpperSecondsAt216 < 130, 'even the impossible gross upper volume is under 130 seconds')
  assert.match(blocked.limit, /first harmful spill may be lower/)
  const check = spawnSync(process.execPath, ['project/rwt/studies/over-roof-service.mjs', '--check'], {
    cwd: process.cwd(), encoding: 'utf8', timeout: 60000
  })
  assert.equal(check.status, 0, check.stderr || check.stdout)
})
