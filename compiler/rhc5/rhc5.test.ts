import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { cloneReferenceHouseSource, createReferenceHouseSource } from '../reference-house/fixture.js'
import { mm } from '../units.js'
import { compileReferenceHouseBoundaryView } from '../rhc4/compile.js'
import { runCalculationCheck } from '../calculation-slice/compile.js'
import type { CalculationCheckInput, CalculationMethod } from '../calculation-slice/model.js'
import { compileReferenceHouseTargetCalculations } from './compile.js'
import {
  createReferenceHousePrivateStairInput,
  privateStairGeometryMethod
} from './method.js'

const canonicalInput = (): CalculationCheckInput => {
  const source = createReferenceHouseSource()
  const c4 = compileReferenceHouseBoundaryView(source)
  return createReferenceHousePrivateStairInput(c4)
}

const withValue = (
  input: CalculationCheckInput,
  key: string,
  value: number
): CalculationCheckInput => ({
  ...input,
  values: {
    ...input.values,
    [key]: {
      ...input.values[key],
      value
    }
  }
})

const criterion = (
  result: ReturnType<typeof runCalculationCheck>,
  id: string
) => {
  const found = result.criteria.find((item) => item.criterionId === id)
  assert.ok(found, `Expected criterion ${id}`)
  return found
}

describe('RH-C5 selected target calculations', () => {
  test('passes the canonical Reference House private-stair geometry against the selected numeric guidance family', () => {
    const result = compileReferenceHouseTargetCalculations(createReferenceHouseSource())
    const stair = result.calculations.privateStairGeometry

    assert.equal(result.status, 'PASS')
    assert.equal(stair.status, 'PASS')
    assert.equal(stair.criteria.length, 4)
    assert.ok(stair.criteria.every((item) => item.status === 'PASS'))
    assert.equal(criterion(stair, 'ADK-K1-PRIVATE-RISE').observed, 3300 / 18)
    assert.equal(criterion(stair, 'ADK-K1-PRIVATE-GOING').observed, 300)
    assert.ok(Math.abs((criterion(stair, 'ADK-K1-PRIVATE-PITCH').observed ?? 0) - 31.429565614838516) < 1e-9)
    assert.ok(Math.abs((criterion(stair, 'ADK-K1-PRIVATE-2R+G').observed ?? 0) - 666.6666666666667) < 1e-9)
  })

  test('carries explicit guidance authority and refuses to call the result Building Regulations compliance', () => {
    const result = compileReferenceHouseTargetCalculations(createReferenceHouseSource())
    const stair = result.calculations.privateStairGeometry

    assert.equal(stair.authority.kind, 'statutory-guidance')
    assert.equal(stair.authority.jurisdiction, 'England')
    assert.equal(stair.authority.edition, '2013 edition')
    assert.equal(stair.authority.paragraph, '1.3')
    assert.equal(stair.authority.table, 'Table 1.1')
    assert.equal(stair.authority.sourceCheckedOn, '2026-10-13')
    assert.ok(stair.authority.sourceUrl.includes('approved-document-k'))
    assert.ok(stair.nonClaims.includes('Building Regulations compliance'))
    assert.ok(stair.nonClaims.includes('release-grade compiler-target applicability or transitional basis'))
    assert.equal(result.proofBoundary.selectedNumericMethodCorrespondence, 'MACHINE-CHECKED')
    assert.equal(result.proofBoundary.releaseGradeCompilerTarget, 'NOT-ESTABLISHED')
    assert.equal(result.proofBoundary.buildingRegulationsCompliance, 'NOT-PROVED')
    assert.equal('isBuildingRegulationsCompliant' in result, false)
  })

  test('checks the private-stair rise band inclusively', () => {
    const input = canonicalInput()
    const atMin = runCalculationCheck(privateStairGeometryMethod, withValue(input, 'rise', 150))
    const atMax = runCalculationCheck(privateStairGeometryMethod, withValue(input, 'rise', 220))
    const below = runCalculationCheck(privateStairGeometryMethod, withValue(input, 'rise', 149.9))
    const above = runCalculationCheck(privateStairGeometryMethod, withValue(input, 'rise', 220.1))

    assert.equal(criterion(atMin, 'ADK-K1-PRIVATE-RISE').status, 'PASS')
    assert.equal(criterion(atMax, 'ADK-K1-PRIVATE-RISE').status, 'PASS')
    assert.equal(criterion(below, 'ADK-K1-PRIVATE-RISE').status, 'FAIL')
    assert.equal(criterion(above, 'ADK-K1-PRIVATE-RISE').status, 'FAIL')
  })

  test('checks the private-stair going band inclusively', () => {
    const input = canonicalInput()
    const atMin = runCalculationCheck(privateStairGeometryMethod, withValue(input, 'going', 220))
    const atMax = runCalculationCheck(privateStairGeometryMethod, withValue(input, 'going', 300))
    const below = runCalculationCheck(privateStairGeometryMethod, withValue(input, 'going', 219.9))
    const above = runCalculationCheck(privateStairGeometryMethod, withValue(input, 'going', 300.1))

    assert.equal(criterion(atMin, 'ADK-K1-PRIVATE-GOING').status, 'PASS')
    assert.equal(criterion(atMax, 'ADK-K1-PRIVATE-GOING').status, 'PASS')
    assert.equal(criterion(below, 'ADK-K1-PRIVATE-GOING').status, 'FAIL')
    assert.equal(criterion(above, 'ADK-K1-PRIVATE-GOING').status, 'FAIL')
  })

  test('fails the selected target when pitch exceeds 42 degrees even if other values are independently valid', () => {
    const input = withValue(canonicalInput(), 'pitch', 42.01)
    const result = runCalculationCheck(privateStairGeometryMethod, input)

    assert.equal(criterion(result, 'ADK-K1-PRIVATE-PITCH').status, 'FAIL')
    assert.equal(result.status, 'FAIL')
  })

  test('fails the selected target when the normal 2R+G relationship leaves 550–700 mm', () => {
    const input = withValue(canonicalInput(), 'twoRPlusG', 549.9)
    const result = runCalculationCheck(privateStairGeometryMethod, input)

    assert.equal(criterion(result, 'ADK-K1-PRIVATE-2R+G').status, 'FAIL')
    assert.equal(result.status, 'FAIL')
  })

  test('returns UNSUPPORTED rather than applying private-stair guidance outside its declared domain', () => {
    const input = canonicalInput()
    const result = runCalculationCheck(privateStairGeometryMethod, {
      ...input,
      context: { ...input.context, stairCategory: 'utility' }
    })

    assert.equal(result.status, 'UNSUPPORTED')
    assert.deepEqual(result.criteria, [])
    assert.ok(result.diagnostics.some((item) => item.code === 'CALCULATION_METHOD_OUTSIDE_APPLICABILITY'))
  })

  test('returns UNSUPPORTED rather than guessing a missing method input', () => {
    const input = canonicalInput()
    const { pitch: _pitch, ...values } = input.values
    const result = runCalculationCheck(privateStairGeometryMethod, { ...input, values })

    assert.equal(result.status, 'UNSUPPORTED')
    assert.equal(criterion(result, 'ADK-K1-PRIVATE-PITCH').status, 'UNSUPPORTED')
    assert.ok(result.diagnostics.some((item) => item.code === 'CALCULATION_METHOD_INPUT_UNSUPPORTED'))
  })

  test('lets incomplete method evidence dominate a simultaneous failing criterion', () => {
    const input = withValue(canonicalInput(), 'rise', 149)
    const { pitch: _pitch, ...values } = input.values
    const result = runCalculationCheck(privateStairGeometryMethod, { ...input, values })

    assert.equal(criterion(result, 'ADK-K1-PRIVATE-RISE').status, 'FAIL')
    assert.equal(criterion(result, 'ADK-K1-PRIVATE-PITCH').status, 'UNSUPPORTED')
    assert.equal(result.status, 'UNSUPPORTED')
  })

  test('rejects non-finite numeric inputs as unsupported evidence rather than arithmetic failure', () => {
    const result = runCalculationCheck(
      privateStairGeometryMethod,
      withValue(canonicalInput(), 'pitch', Number.NaN)
    )

    assert.equal(criterion(result, 'ADK-K1-PRIVATE-PITCH').status, 'UNSUPPORTED')
    assert.equal(result.status, 'UNSUPPORTED')
  })

  test('rejects malformed encoded methods instead of evaluating them', () => {
    const malformed: CalculationMethod = {
      ...privateStairGeometryMethod,
      criteria: [
        {
          ...privateStairGeometryMethod.criteria[0],
          min: 221,
          max: 220
        }
      ]
    }
    const result = runCalculationCheck(malformed, canonicalInput())

    assert.equal(result.status, 'UNSUPPORTED')
    assert.deepEqual(result.criteria, [])
    assert.ok(result.diagnostics.some((item) => item.code === 'CALCULATION_METHOD_INVALID'))
  })

  test('turns a source going mutation into a C5 failure while upstream topology remains coherent', () => {
    const source = cloneReferenceHouseSource(createReferenceHouseSource())
    source.stair.goingTopology.value.going = mm(210)

    const result = compileReferenceHouseTargetCalculations(source)
    assert.equal(result.c4.status, 'PASS')
    assert.equal(result.calculations.privateStairGeometry.status, 'FAIL')
    assert.equal(criterion(result.calculations.privateStairGeometry, 'ADK-K1-PRIVATE-GOING').status, 'FAIL')
    assert.equal(result.status, 'FAIL')
  })

  test('preserves an upstream architectural REVIEW even when the selected calculation passes', () => {
    const source = cloneReferenceHouseSource(createReferenceHouseSource())
    source.court.value.depth = mm(source.court.value.depth + 400)

    const result = compileReferenceHouseTargetCalculations(source)
    assert.equal(result.c4.status, 'REVIEW')
    assert.equal(result.calculations.privateStairGeometry.status, 'PASS')
    assert.equal(result.status, 'REVIEW')
  })

  test('preserves an upstream source FAIL instead of letting a passing calculation erase it', () => {
    const source = cloneReferenceHouseSource(createReferenceHouseSource())
    source.stair.riseTopology.value.riserCount = 17

    const result = compileReferenceHouseTargetCalculations(source)
    assert.equal(result.c4.status, 'FAIL')
    assert.equal(result.status, 'FAIL')
  })

  test('is deeply deterministic for unchanged source and method authority', () => {
    const source = createReferenceHouseSource()
    const a = compileReferenceHouseTargetCalculations(source)
    const b = compileReferenceHouseTargetCalculations(source)

    assert.deepEqual(a, b)
  })

  test('keeps unearned calculation families absent', () => {
    const result = compileReferenceHouseTargetCalculations(createReferenceHouseSource())
    const serialized = JSON.stringify(result)

    assert.equal('uValue' in result.calculations, false)
    assert.equal('drainageCapacity' in result.calculations, false)
    assert.equal('structuralCapacity' in result.calculations, false)
    assert.equal('mepSizing' in result.calculations, false)
    assert.equal(serialized.includes('isBuildingRegulationsCompliant'), false)
  })
})