import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import {
  BOX_GEOMETRY_EPSILON,
  MODEL_AREA_EPSILON_MM2,
  MODEL_COORDINATE_EPSILON_MM
} from '../core/numeric.js'
import { planBoundaryId } from '../plan-slice/model.js'
import type { PlanBoundaryId } from '../plan-slice/model.js'
import { createReferenceHouseSource } from '../reference-house/fixture.js'
import { compileReferenceHouseSystem } from '../reference-house/system-compile.js'
import { serviceCrossingId } from '../service-slice/model.js'
import type { ServiceCrossingId } from '../service-slice/model.js'
import { structuralInterruptionId, structuralLineId } from '../structure-slice/model.js'
import type { StructuralInterruptionId, StructuralLineId } from '../structure-slice/model.js'
import type { Millimetres } from '../units.js'

const boundaryRef = planBoundaryId('BND')
const lineRef = structuralLineId('LINE')
const interruptionRef = structuralInterruptionId('INT')
const crossingRef = serviceCrossingId('CROSS')

// These are compile-time contracts: cross-domain IDs share a runtime string representation
// but must not be assignable to one another accidentally.
// @ts-expect-error Plan boundary IDs are not structural line IDs.
const boundaryAsLine: StructuralLineId = boundaryRef
// @ts-expect-error Structural interruption IDs are not structural line IDs.
const interruptionAsLine: StructuralLineId = interruptionRef
// @ts-expect-error Service crossing IDs are not plan boundary IDs.
const crossingAsBoundary: PlanBoundaryId = crossingRef
// @ts-expect-error Structural line IDs are not service crossing IDs.
const lineAsCrossing: ServiceCrossingId = lineRef
void boundaryAsLine
void interruptionAsLine
void crossingAsBoundary
void lineAsCrossing

const acceptsMillimetres = (value: Millimetres): Millimetres => value

describe('CH-04 representation hardening', () => {
  test('canonical compilation does not mutate its source authority', () => {
    const source = createReferenceHouseSource()
    const before = structuredClone(source)

    const result = compileReferenceHouseSystem(source)

    assert.equal(result.status, 'PASS')
    assert.deepEqual(source, before)
  })

  test('validated cross-domain references retain their exact runtime identities', () => {
    const result = compileReferenceHouseSystem(createReferenceHouseSource())
    const bearingOpening = result.structure.derived.bearingOpenings.find(
      (item) => item.openingId === 'G-FRONT-D01'
    )
    assert.ok(bearingOpening)
    assert.equal(bearingOpening.planBoundaryId, 'G-OUTER-SOUTH')
    assert.equal(bearingOpening.structuralLineId, 'LB-OUTER-S')

    const crossing = result.services.derived.crossings.find((item) => item.id === 'PEN-UE-01')
    assert.ok(crossing)
    assert.equal(crossing.host.kind, 'plan-boundary')
    if (crossing.host.kind === 'plan-boundary') {
      assert.equal(crossing.host.boundaryId, 'G-OUTER-EAST')
    }

    const obligation = result.boundary.derived.serviceObligations.find(
      (item) => item.serviceCrossingId === crossing.id
    )
    assert.ok(obligation)
    assert.equal(obligation.serviceCrossingId, 'PEN-UE-01')
    assert.equal(obligation.hostPlanBoundaryId, 'G-OUTER-EAST')
  })

  test('keeps important Reference House coordination lengths branded as millimetres', () => {
    const result = compileReferenceHouseSystem(createReferenceHouseSource())
    assert.equal(
      acceptsMillimetres(result.coordination.boundary.wallPlanningStressThicknessMm),
      600
    )
  })

  test('records separate numeric tolerance classes without changing their established values', () => {
    assert.equal(BOX_GEOMETRY_EPSILON, 1e-9)
    assert.equal(MODEL_COORDINATE_EPSILON_MM, 1e-6)
    assert.equal(MODEL_AREA_EPSILON_MM2, 1e-6)
    assert.notEqual(BOX_GEOMETRY_EPSILON, MODEL_COORDINATE_EPSILON_MM)
  })
})
