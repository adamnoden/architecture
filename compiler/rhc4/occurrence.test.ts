import assert from 'node:assert/strict'
import { test } from 'node:test'

import { createReferenceHouseSource } from '../reference-house/fixture.js'
import { compileReferenceHouseServiceView } from '../rhc3/compile.js'
import { compileReferenceHouseBoundaryView } from './compile.js'
import { cloneReferenceHouseBoundarySource, createReferenceHouseBoundarySource } from './fixture.js'

const sourceFor = () => {
  const house = createReferenceHouseSource()
  const c3 = compileReferenceHouseServiceView(house)
  return { house, source: createReferenceHouseBoundarySource(house, c3.c2.plan, c3.services) }
}

const codes = (result: ReturnType<typeof compileReferenceHouseBoundaryView>): string[] =>
  result.boundaries.diagnostics.map((item) => item.code)

test('RH-C4 retains PEN-CD-01 as the registered owner of both courtyard drainage routes', () => {
  const result = compileReferenceHouseBoundaryView(createReferenceHouseSource())
  const occurrence = result.boundaries.derived.occurrenceObligations.find(
    (item) => item.projectOccurrenceId === 'PEN-CD-01'
  )

  assert.ok(occurrence)
  assert.deepEqual(occurrence.drainageRouteIds, ['RW-COURT-EMERGENCY', 'RW-COURT-PRIMARY'])
  assert.deepEqual(occurrence.roles, ['air', 'moisture', 'thermal', 'weather'])
  assert.ok(occurrence.obligations.includes('PRIMARY-AND-EMERGENCY-ROUTES-REMAIN-INDEPENDENT'))
})

test('RH-C4 fails if PEN-CD-01 disappears while the courtyard drainage routes remain', () => {
  const { house, source } = sourceFor()
  const mutated = cloneReferenceHouseBoundarySource(source)
  const id = 'INT-RW-PEN-CD-01'
  mutated.transitions = mutated.transitions.filter((item) => item.id !== id)
  for (const system of mutated.systems) {
    system.transitionIds = system.transitionIds.filter((transitionId) => transitionId !== id)
  }

  const result = compileReferenceHouseBoundaryView(house, mutated)
  assert.equal(result.status, 'FAIL')
  assert.ok(codes(result).includes('RH_COURTYARD_DRAINAGE_CROSSING_MISSING'))
})

test('RH-C4 fails if PEN-CD-01 stops owning the independent emergency overflow', () => {
  const { house, source } = sourceFor()
  const mutated = cloneReferenceHouseBoundarySource(source)
  mutated.transitions.find((item) => item.id === 'INT-RW-PEN-CD-01')!.drainageRouteIds = ['RW-COURT-PRIMARY']

  const result = compileReferenceHouseBoundaryView(house, mutated)
  assert.equal(result.status, 'FAIL')
  assert.ok(codes(result).includes('RH_COURTYARD_DRAINAGE_CROSSING_ROUTE_MISMATCH'))
})

test('RH-C4 fails when a transition touches a carrier but its boundary system drops ownership', () => {
  const { house, source } = sourceFor()
  const mutated = cloneReferenceHouseBoundarySource(source)
  mutated.systems.find((item) => item.id === 'BND-WEA-01')!.transitionIds =
    mutated.systems.find((item) => item.id === 'BND-WEA-01')!.transitionIds.filter(
      (id) => id !== 'INT-OPEN-G-FRONT-W01'
    )

  const result = compileReferenceHouseBoundaryView(house, mutated)
  assert.equal(result.status, 'FAIL')
  assert.ok(codes(result).includes('BOUNDARY_TRANSITION_NOT_OWNED_BY_SYSTEM'))
})
