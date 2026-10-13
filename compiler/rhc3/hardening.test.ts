import assert from 'node:assert/strict'
import { test } from 'node:test'

import { createReferenceHouseSource } from '../reference-house/fixture.js'
import { mm } from '../units.js'
import { compileReferenceHouseServiceView } from './compile.js'
import { cloneReferenceHouseServiceSource, createReferenceHouseServiceSource } from './fixture.js'

const codes = (result: ReturnType<typeof compileReferenceHouseServiceView>): string[] =>
  result.services.diagnostics.map((item) => item.code)

test('RH-C3 derives external bearing obligations for selected east-wall service crossings', () => {
  const result = compileReferenceHouseServiceView(createReferenceHouseSource())

  assert.equal(result.services.status, 'PASS')
  assert.deepEqual(
    result.services.derived.bearingCrossings.map((item) => [item.crossingId, item.structuralLineId, item.proof]),
    [
      ['PEN-HS-01', 'LB-OUTER-E', 'EXTERNAL-STRUCTURAL-OPENING-AND-BEARING'],
      ['PEN-KX-01', 'LB-OUTER-E', 'EXTERNAL-STRUCTURAL-OPENING-AND-BEARING'],
      ['PEN-MV-01', 'LB-OUTER-E', 'EXTERNAL-STRUCTURAL-OPENING-AND-BEARING'],
      ['PEN-UE-01', 'LB-OUTER-E', 'EXTERNAL-STRUCTURAL-OPENING-AND-BEARING']
    ]
  )
  assert.equal(result.services.derived.bearingCrossings.some((item) => item.crossingId === 'PEN-BX-01'), false)
})

test('RH-C3 checks the 900 x 700 service reservation inside the 1050 x 850 structural opening envelope', () => {
  const result = compileReferenceHouseServiceView(createReferenceHouseSource())
  const riser = result.services.derived.nodes.find((item) => item.id === 'SV-01')

  assert.ok(riser?.coordinationEnvelope)
  assert.equal(riser.coordinationEnvelope.width, 900)
  assert.equal(riser.coordinationEnvelope.depth, 700)
  assert.equal(riser.coordinationEnvelope.structuralInterruptionId, 'PEN-SV-01')
  assert.equal(codes(result).includes('SERVICE_RESERVATION_EXCEEDS_STRUCTURAL_OPENING'), false)
})

test('RH-C3 fails if the service reservation grows beyond the represented structural opening', () => {
  const house = createReferenceHouseSource()
  const source = cloneReferenceHouseServiceSource(createReferenceHouseServiceSource(house))
  const riser = source.nodes.find((item) => item.id === 'SV-01')!
  riser.coordinationEnvelope = {
    width: mm(1100),
    depth: mm(900),
    structuralInterruptionId: 'PEN-SV-01'
  }

  const result = compileReferenceHouseServiceView(house, source)
  assert.equal(result.status, 'FAIL')
  assert.ok(codes(result).includes('SERVICE_RESERVATION_EXCEEDS_STRUCTURAL_OPENING'))
})

test('RH-C3 rejects a false declared bearing-line identity for a service crossing', () => {
  const house = createReferenceHouseSource()
  const source = cloneReferenceHouseServiceSource(createReferenceHouseServiceSource(house))
  source.crossings.find((item) => item.id === 'PEN-KX-01')!.bearingLineId = 'LB-OUTER-W'

  const result = compileReferenceHouseServiceView(house, source)
  assert.equal(result.status, 'FAIL')
  assert.ok(codes(result).includes('SERVICE_BEARING_HOST_MISMATCH'))
})
