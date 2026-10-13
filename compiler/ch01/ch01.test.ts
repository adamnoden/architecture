import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { compilePlanSlice } from '../plan-slice/compile.js'
import type { PlanSliceCompileResult } from '../plan-slice/model.js'
import { createReferenceHouseSource } from '../reference-house/fixture.js'
import { adaptReferenceHousePlanSource } from '../reference-house/plan-adapter.js'
import { createReferenceHouseStructuralSource } from '../rhc2/fixture.js'
import { compileStructuralTopology } from '../structure-slice/compile.js'
import type { StructuralTopologyCompileResult } from '../structure-slice/model.js'
import { mm } from '../units.js'

const planCodes = (result: PlanSliceCompileResult): string[] =>
  result.diagnostics.map((item) => item.code)

const structureCodes = (result: StructuralTopologyCompileResult): string[] =>
  result.diagnostics.map((item) => item.code)

const canonicalPlan = () => {
  const house = createReferenceHouseSource()
  const source = adaptReferenceHousePlanSource(house)
  return { house, source, result: compilePlanSlice(source) }
}

describe('CH-01 fail-closed compilation', () => {
  test('plan source with a missing plan-line reference returns FAIL instead of throwing', () => {
    const house = createReferenceHouseSource()
    const source = adaptReferenceHousePlanSource(house)
    source.planLines = source.planLines.filter((item) => item.id !== 'COURT_WEST')

    let result!: PlanSliceCompileResult
    assert.doesNotThrow(() => {
      result = compilePlanSlice(source)
    })

    assert.equal(result.status, 'FAIL')
    assert.ok(planCodes(result).includes('UNKNOWN_PLAN_LINE'))
    assert.deepEqual(result.derived.spaces, [])
    assert.deepEqual(result.derived.boundaries, [])
    assert.deepEqual(result.derived.openings, [])
  })

  test('plan non-finite geometry remains a controlled compiler failure', () => {
    const { source } = canonicalPlan()
    const line = source.planLines.find((item) => item.id === 'GALLERY_SERVICE')
    assert.ok(line)
    line.coordinate = mm(Number.NaN)

    let result!: PlanSliceCompileResult
    assert.doesNotThrow(() => {
      result = compilePlanSlice(source)
    })

    assert.equal(result.status, 'FAIL')
    assert.ok(planCodes(result).includes('INVALID_PLAN_LINE'))
  })

  test('structural source with a missing architectural plan-line reference returns FAIL instead of throwing', () => {
    const { house, result: plan } = canonicalPlan()
    assert.equal(plan.status, 'PASS')
    const source = createReferenceHouseStructuralSource(house)
    const line = source.lineElements[0]
    assert.ok(line)
    line.at = 'NOT-A-PLAN-LINE'

    let result!: StructuralTopologyCompileResult
    assert.doesNotThrow(() => {
      result = compileStructuralTopology(source, plan)
    })

    assert.equal(result.status, 'FAIL')
    assert.ok(structureCodes(result).includes('STRUCTURAL_PLAN_LINE_MISSING'))
    assert.deepEqual(result.derived.lineElements, [])
    assert.deepEqual(result.derived.spanFields, [])
  })

  test('a failed plan compile propagates through structure without attempting derivation', () => {
    const house = createReferenceHouseSource()
    const planSource = adaptReferenceHousePlanSource(house)
    planSource.planLines = planSource.planLines.filter((item) => item.id !== 'COURT_WEST')
    const plan = compilePlanSlice(planSource)
    assert.equal(plan.status, 'FAIL')

    let result!: StructuralTopologyCompileResult
    assert.doesNotThrow(() => {
      result = compileStructuralTopology(createReferenceHouseStructuralSource(house), plan)
    })

    assert.equal(result.status, 'FAIL')
    assert.ok(structureCodes(result).includes('PLAN_FAILED'))
    assert.deepEqual(result.derived.lineElements, [])
  })
})
