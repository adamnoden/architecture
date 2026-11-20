import assert from 'node:assert/strict'
import test from 'node:test'
import { readCurrentDesignResolution } from './current-design/resolve.js'
import { readGroundSectionCase, runGroundSectionCase } from './current-design/structural-ground.js'
import { readServiceFloorCase, runServiceFloorCase } from './current-design/service-floor.js'

function fixture() {
  const current = readCurrentDesignResolution()
  const { ground } = readGroundSectionCase(current)
  return { current, ground }
}

test('the adapter consumes actual source-bound ground levels and does not read a second floor authority', () => {
  const { current, ground } = fixture()
  const computed = runGroundSectionCase(current, ground)
  const request = readServiceFloorCase(current, computed)
  assert.equal(Object.hasOwn(request.serviceFloor.settings, 'accessibleZoneMm'), false)
  assert.equal(Object.hasOwn(request.serviceFloor.settings, 'exteriorGradeMm'), false)
  const output = runServiceFloorCase(current, computed, request.serviceFloor)
  assert.equal(output.native.levelsMm.ffl, computed.native.levelsMm.ffl)
  assert.deepEqual(output.native.groundStack.accessibleDistribution,
    (computed.native.levelsMm as unknown as Record<string, unknown>).accessibleDistribution)
  assert.equal(output.source.groundCaseDigest, computed.source.caseDigest)
  assert.equal(output.native.selectedHouseAdmitted, false)
  assert.equal(output.native.physicalInstallationAdmitted, false)
  assert.equal(output.native.status, 'rejected-numerical-comparison')
})

test('one actual ground service-zone edit drives715 split lids and invalidates the old service case', () => {
  const { current, ground } = fixture()
  const before = runGroundSectionCase(current, ground)
  const old = readServiceFloorCase(current, before).serviceFloor
  const actual = runGroundSectionCase(current, { ...ground, caseId: 'raised715-service-floor',
    settings: { ...ground.settings, serviceZoneMm: 250 } })
  assert.equal(actual.native.levelsMm.ffl, 715)
  const request = readServiceFloorCase(current, actual).serviceFloor
  const output = runServiceFloorCase(current, actual, request)
  assert.equal(output.native.levelsMm.ffl, 715)
  assert.deepEqual(output.native.groundStack.accessibleDistribution, [450, 700])
  assert.deepEqual(output.native.groundStack.glass, [350, 450])
  assert.deepEqual(output.native.diagnostics, [])
  assert.equal(output.diagnostics[0].code, 'SERVICE_FLOOR_ADMISSION_UNQUALIFIED')
  assert.ok(output.holds.length >= 6)
  assert.equal(output.native.selectedHouseAdmitted, false)
  assert.notEqual(output.source.groundCaseDigest, before.source.caseDigest)
  assert.throws(() => runServiceFloorCase(current, actual, old), /Stale service-floor/)
})

test('ground authority, current plan, sources and approval injection cannot be bypassed', () => {
  const { current, ground } = fixture()
  const computed = runGroundSectionCase(current, ground)
  const input = readServiceFloorCase(current, computed).serviceFloor
  assert.throws(() => runServiceFloorCase(current, computed, { ...input, groundResultDigest: 'stale' }), /Stale service-floor/)
  assert.throws(() => runServiceFloorCase(current, computed, { ...input, planDigest: 'stale' }), /Stale service-floor/)
  assert.throws(() => runServiceFloorCase(current, computed, { ...input, selectedHouseAdmitted: true }), /Stale service-floor/)
  assert.throws(() => runServiceFloorCase(current, computed, { ...input, settings: { ...input.settings, accessibleZoneMm: 250 } }), /only service-floor/)
  const missing = { ...current, disciplineBindings: current.disciplineBindings.map(row => ({ ...row,
    identities: Object.fromEntries(Object.entries(row.identities).filter(([path]) => path !== 'project/had/studies/closed_service_floor.py')) })) }
  assert.throws(() => readServiceFloorCase(missing, computed), /Stale service-floor or ground-section current source/)
})

test('a changed source-ground stack rejects explicitly and invalidates the previous service-floor case', () => {
  const { current, ground } = fixture()
  const before = runGroundSectionCase(current, ground)
  const input = readServiceFloorCase(current, before).serviceFloor
  const after = runGroundSectionCase(current, { ...ground, settings: { ...ground.settings, exteriorGradeMm: -250 } })
  assert.throws(() => runServiceFloorCase(current, after, input), /Stale service-floor/)
  const unsupported = runGroundSectionCase(current, { ...ground, settings: { ...ground.settings, courseBottomMm: 20 } })
  assert.throws(() => readServiceFloorCase(current, unsupported), /Unsupported ground-section stack/)
})
