import assert from 'node:assert/strict'
import { test } from 'node:test'

import { createReferenceHouseSource } from '../reference-house/fixture.js'
import { createReferenceHouseOutputContext } from '../reference-house/output/context.js'
import { compileReferenceHouseSystem } from '../reference-house/system-compile.js'
import { compileReferenceHouseServiceView } from '../rhc3/compile.js'
import { compileReferenceHouseBoundaryView } from './compile.js'
import { createReferenceHouseBoundarySource } from './fixture.js'

const outwardFixture = () => {
  const house = createReferenceHouseSource()
  const services = compileReferenceHouseServiceView(house)
  const boundary = createReferenceHouseBoundarySource(house, services.c2.plan, services.services)
  return { house, boundary }
}

test('CCR drainage rejects inward source through canonical system and output paths', () => {
  const source = createReferenceHouseSource()
  source.roof.value.drainageDirection = 'inward'
  const result = compileReferenceHouseSystem(source)
  assert.equal(result.house.derived.roofSection.direction, 'inward')
  assert.equal(result.status, 'FAIL')
  assert.ok(result.boundary.diagnostics.some(d => d.code === 'RH_ROOF_DRAINAGE_SOURCE_UNSUPPORTED'))
  assert.throws(() => createReferenceHouseOutputContext(source), /failed compile/)
})

test('an outward override cannot conceal an unsupported controlling roof source', () => {
  const { house, boundary } = outwardFixture()
  house.roof.value.drainageDirection = 'inward'
  const result = compileReferenceHouseBoundaryView(house, boundary)
  assert.equal(result.status, 'FAIL')
  assert.ok(result.boundaries.diagnostics.some(d => d.code === 'RH_ROOF_DRAINAGE_SOURCE_UNSUPPORTED'))
})

test('every roof and courtyard route needs both non-blank endpoint declarations', () => {
  const fixture = outwardFixture()
  for (const route of fixture.boundary.drainageRoutes) {
    for (const endpoint of ['from', 'to'] as const) {
      const boundary = structuredClone(fixture.boundary)
      boundary.drainageRoutes.find(r => r.id === route.id)![endpoint] = ' \t\n\u00a0 '
      const result = compileReferenceHouseBoundaryView(fixture.house, boundary)
      assert.equal(result.status, 'FAIL', `${route.id}.${endpoint}`)
      assert.ok(result.boundaries.diagnostics.some(d =>
        d.code === 'DRAINAGE_ENDPOINT_MISSING' && d.subjectIds.includes(route.id)))
    }
  }
})

test('superficial destination whitespace cannot establish declared courtyard separation', () => {
  for (const variant of [
    (s: string) => `${s} `,
    (s: string) => `\n ${s}\t`,
    (s: string) => s.replaceAll(' ', ' \t\n ')
  ]) {
    const { house, boundary } = outwardFixture()
    const primary = boundary.drainageRoutes.find(r => r.kind === 'courtyard-primary')!
    boundary.drainageRoutes.find(r => r.kind === 'courtyard-emergency')!.to = variant(primary.to)
    const result = compileReferenceHouseBoundaryView(house, boundary)
    assert.equal(result.status, 'FAIL')
    assert.ok(result.boundaries.diagnostics.some(d => d.code === 'RH_COURTYARD_DESTINATIONS_NOT_DISTINCT'))
  }
})

test('canonical outward declarations pass without certifying physical independence', () => {
  const { house, boundary } = outwardFixture()
  const result = compileReferenceHouseSystem(house)
  assert.equal(result.status, 'PASS')
  assert.deepEqual(result.boundary.diagnostics, [])
  assert.equal(result.boundary.derived.drainageRoutes.filter(r => r.kind === 'roof-field').length, 4)

  // Surrounding whitespace is harmless when descriptions remain genuinely distinct.
  for (const route of boundary.drainageRoutes) {
    route.from = ` ${route.from}\t`
    route.to = `\n${route.to} `
  }
  const declared = compileReferenceHouseBoundaryView(house, boundary)
  assert.equal(declared.status, 'PASS')
  assert.equal(declared.proofBoundary.performance, 'EXTERNAL-NOT-PROVED')
})
