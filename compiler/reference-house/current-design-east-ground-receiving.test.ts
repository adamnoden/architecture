import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import test from 'node:test'
import { eastGround } from '../../project/rwt/studies/east-ground-outfall.mjs'
import { prepareCurrentDesignCompile } from './current-design/compile.js'
import { readGeorgianDesignSnapshot } from './current-design/georgian-source.js'

test('the current east ground edit updates the native schedule and located section', async () => {
  const compile = prepareCurrentDesignCompile(readGeorgianDesignSnapshot())
  const request = await compile.readEastGroundReceivingCase()
  const baseline = await compile.eastGroundReceiving(request.receiving)
  assert.deepEqual(baseline.schedule, eastGround().wet)
  const edited = { ...request.receiving, farEndWaterLevelMm: -1620 }
  const after = await compile.eastGroundReceiving(edited)
  assert.equal(after.status, 'within-receiving-sensitivity')
  assert.equal(after.schedule.staticResidual, 30)
  assert.deepEqual(after.schedule.flows.map(row => row.flowLps), [3.60375, 4.43895])
  const [beforeLong, afterLong] = [baseline.schedule.flows[1], after.schedule.flows[1]]
  assert.ok(afterLong.low[0].requiredHead < beforeLong.low[0].requiredHead)
  assert.equal(afterLong.low[1].requiredHead, beforeLong.low[1].requiredHead)
  assert.ok(afterLong.downstreamSeparation > beforeLong.downstreamSeparation)
  assert.equal(after.source.bindingDigest, baseline.source.bindingDigest)
  assert.notEqual(after.source.caseDigest, baseline.source.caseDigest)
  const line = after.drawing.primitives.find(entry => entry.id === 'trial-level')
  const original = baseline.drawing.primitives.find(entry => entry.id === 'trial-level')
  assert.ok(line?.kind === 'line' && original?.kind === 'line')
  assert.equal(line.metadata?.xMm, 16000)
  assert.equal(line.metadata?.zMm, -1620)
  const scale = after.drawing.scaleDenominator
  assert.ok(typeof scale === 'number')
  assert.ok(Math.abs(line.a.y - original.a.y - 20 / scale) < 1e-9)

  const run = spawnSync(process.execPath, ['--import', 'tsx', 'scripts/compile-current-design.ts', '--east-ground-receiving', '-'],
    { input: JSON.stringify({ ...request, receiving: edited }), encoding: 'utf8' })
  assert.equal(run.status, 0, run.stderr)
  assert.deepEqual(JSON.parse(run.stdout), after)
})

test('a raised receiver, a critically shallow tail and a stale binding cannot emit an accepted result', async () => {
  const compile = prepareCurrentDesignCompile(readGeorgianDesignSnapshot())
  const { receiving } = await compile.readEastGroundReceivingCase()
  await assert.rejects(compile.eastGroundReceiving({ ...receiving, farEndWaterLevelMm: -1599 }), /exceeds the bound/)
  await assert.rejects(compile.eastGroundReceiving({ ...receiving, farEndWaterLevelMm: -1700 }), /above critical depth/)
  await assert.rejects(compile.eastGroundReceiving({ ...receiving, bindingDigest: 'old' }), /Stale east ground receiving/)
})
