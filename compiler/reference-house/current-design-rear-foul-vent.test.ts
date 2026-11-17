import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { prepareCurrentDesignCompile } from './current-design/compile.js'
import { readGeorgianDesignSnapshot } from './current-design/georgian-source.js'

const design = readGeorgianDesignSnapshot()
const receipt = JSON.parse(readFileSync(new URL(
  '../../project/mat/studies/rear-wc-west-roof-interface.json', import.meta.url,
), 'utf8')).dryReturnComparison

test('the current compiler recomputes the low oblique dry return and its independent roof and head reservations', async () => {
  const compile = prepareCurrentDesignCompile(design)
  const request = await compile.readRearFoulVentCase()
  assert.ok('vent' in request)
  assert.deepEqual(request.vent.riserAxisXYMm, [775, 9090])
  const result = await compile.rearFoulVent(request.vent)
  assert.equal(result.status, 'computed-comparison')
  assert.deepEqual(result.comparison, receipt.lowObliqueReturn)
  assert.equal(result.comparison.state, 'bounded-dry-return-comparison')
  assert.equal(result.comparison.installedAcceptance, false)
  assert.ok(result.comparison.clearanceMm.westWindowRawPlan >= 25)
  assert.ok(result.comparison.clearanceMm.rearRadiatorAndCarrier >= 25)
  assert.equal(result.comparison.clearanceMm.westPurlinsCompleteFlashingPlan, 30)
  assert.ok(result.comparison.clearanceMm.headRenewalDeck > 390)
  assert.ok(result.comparison.hostAndRenewalUnresolved?.some(duty => duty.startsWith('NW port stays')))
  assert.equal(result.drawing?.viewId, 'MAT-REAR-FOUL-VENT-PLAN')
  assert.deepEqual(JSON.parse(execFileSync(process.execPath, [
    '--import', 'tsx', 'scripts/compile-current-design.ts', '--rear-foul-vent', '-',
  ], { input: JSON.stringify(request), encoding: 'utf8' })), result)
})

test('the two rejected dry alternatives preserve the wet stack and both branch duties', async () => {
  const compile = prepareCurrentDesignCompile(design)
  const request = await compile.readRearFoulVentCase()
  assert.ok('vent' in request)
  const direct = await compile.rearFoulVent({ ...request.vent, riserAxisXYMm: [670, 9400] })
  assert.equal(direct.status, 'computed-comparison')
  assert.deepEqual(direct.comparison.failedChecks, receipt.directFormerAxis.failedChecks)
  assert.ok(direct.comparison.clearanceMm.rearBathExtractFullCollar < -148)
  assert.equal(direct.comparison.clearanceMm.westPurlinsCompleteFlashingPlan, -75)

  const high = await compile.rearFoulVent({
    ...request.vent, riserAxisXYMm: [775, 9140], wetStackAirTakeoffZMm: 5550,
  })
  assert.equal(high.status, 'computed-comparison')
  assert.deepEqual(high.comparison.failedChecks, receipt.highReturn.failedChecks)
  assert.ok(high.comparison.clearanceMm.rearBathExtractFullCollar >= 25)
  assert.ok(high.comparison.clearanceMm.headRenewalDeck < -106)
  for (const compared of [direct.comparison, high.comparison]) {
    assert.equal(compared.state, 'geometric-failure')
    assert.deepEqual(compared.wet, receipt.lowObliqueReturn.wet)
  }
})

test('a supported dry offset recomputes clearances, while missing tangent, stale and unbound cases fail closed', async () => {
  const compile = prepareCurrentDesignCompile(design)
  const request = await compile.readRearFoulVentCase()
  assert.ok('vent' in request)
  const moved = await compile.rearFoulVent({ ...request.vent, riserAxisXYMm: [775, 9085] })
  assert.equal(moved.status, 'computed-comparison')
  assert.equal(moved.comparison.state, 'bounded-dry-return-comparison')
  assert.ok(moved.comparison.clearanceMm.westWindowRawPlan > receipt.lowObliqueReturn.clearanceMm.westWindowRawPlan)
  assert.deepEqual(moved.comparison.wet, receipt.lowObliqueReturn.wet)

  const short = await compile.rearFoulVent({ ...request.vent, wetStackAirTakeoffZMm: 3650 })
  assert.equal(short.status, 'computed-comparison')
  assert.deepEqual(short.comparison.failedChecks, ['BEND_TANGENT_LENGTH'])
  await assert.rejects(compile.rearFoulVent({ ...request.vent, bindingDigest: 'stale' }), /source binding/)
  const candidate = prepareCurrentDesignCompile({
    ...design, source: { kind: 'contrast-specimen', id: 'SPECIMEN-NO-OCCUPIED-FOUL-BASIS', state: 'candidate' },
    envelope: { ...design.envelope, widthMm: design.envelope.widthMm + 10 },
  })
  assert.equal((await candidate.rearFoulVent(request.vent)).status, 'unavailable')
})
