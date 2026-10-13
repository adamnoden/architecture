import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { createReferenceHouseSource } from '../reference-house/fixture.js'
import { renderStructuralTopologySvg } from '../structure-slice/drawing.js'
import type { StructuralTopologyCompileResult } from '../structure-slice/model.js'
import { mm, toSquareMetres } from '../units.js'
import { compileReferenceHouseStructuralView } from './compile.js'
import {
  cloneReferenceHouseStructuralSource,
  createReferenceHouseStructuralSource
} from './fixture.js'

const diagnosticCodes = (result: StructuralTopologyCompileResult): string[] =>
  result.diagnostics.map((item) => item.code)

const structuralLine = (result: StructuralTopologyCompileResult, id: string) => {
  const found = result.derived.lineElements.find((item) => item.id === id)
  assert.ok(found, `Expected structural line ${id}`)
  return found
}

const spanField = (result: StructuralTopologyCompileResult, id: string) => {
  const found = result.derived.spanFields.find((item) => item.id === id)
  assert.ok(found, `Expected span field ${id}`)
  return found
}

describe('RH-C2 bounded structural view', () => {
  test('compiles the RH-05 first-floor gravity topology without claiming adequacy', () => {
    const result = compileReferenceHouseStructuralView(createReferenceHouseSource())

    assert.equal(result.status, 'PASS')
    assert.equal(result.house.status, 'PASS')
    assert.equal(result.plan.status, 'PASS')
    assert.equal(result.structure.status, 'PASS')
    assert.deepEqual(result.structure.diagnostics, [])
    assert.equal(result.floorZoneDepth, 350)
    assert.deepEqual(result.proofBoundary, {
      topology: 'MACHINE-CHECKED',
      adequacy: 'EXTERNAL-NOT-PROVED'
    })
  })

  test('derives the four RH-05 gross span fields from the architectural planning lines', () => {
    const result = compileReferenceHouseStructuralView(createReferenceHouseSource()).structure

    assert.equal(spanField(result, 'F-W').grossSpan, 4200)
    assert.equal(spanField(result, 'F-E').grossSpan, 4200)
    assert.equal(spanField(result, 'F-S').grossSpan, 3400)
    assert.equal(spanField(result, 'F-N').grossSpan, 3400)
    assert.equal(toSquareMetres(spanField(result, 'F-W').area), 45.36)
    assert.equal(toSquareMetres(spanField(result, 'F-S').area), 12.24)
    assert.equal(toSquareMetres(result.derived.grossFieldArea), 115.2)
  })

  test('derives four short edge beams and the protected courtyard reaction nodes', () => {
    const result = compileReferenceHouseStructuralView(createReferenceHouseSource()).structure

    for (const id of ['EB-W-S', 'EB-E-S', 'EB-W-N', 'EB-E-N']) {
      assert.equal(structuralLine(result, id).length, 3400)
      assert.equal(structuralLine(result, id).protected, true)
    }
    assert.deepEqual(
      result.derived.reactionNodes.map((node) => [node.id, node.x, node.y]),
      [
        ['RN-CE-N', 7800, 7400],
        ['RN-CE-S', 7800, 3400],
        ['RN-CW-N', 4200, 7400],
        ['RN-CW-S', 4200, 3400]
      ]
    )
  })

  test('keeps exact stair and service trimming geometry absent when RH-05 does not control it', () => {
    const source = createReferenceHouseStructuralSource(createReferenceHouseSource())
    const stair = source.interruptions.find((item) => item.id === 'ST-01')
    const services = source.interruptions.find((item) => item.id === 'PEN-SV-01')

    assert.ok(stair)
    assert.ok(services)
    assert.deepEqual(stair.geometry, { kind: 'qualitative' })
    assert.deepEqual(services.geometry, {
      kind: 'approximate-envelope',
      width: 1050,
      depth: 850
    })
    assert.equal('x' in stair.geometry, false)
    assert.equal('y' in stair.geometry, false)
    assert.equal('x' in services.geometry, false)
    assert.equal('y' in services.geometry, false)
  })

  test('propagates courtyard-width mutation into structural spans and beam lines', () => {
    const house = createReferenceHouseSource()
    house.court.value.width = mm(4000)
    const result = compileReferenceHouseStructuralView(house)

    assert.equal(result.status, 'PASS')
    assert.equal(spanField(result.structure, 'F-W').grossSpan, 4000)
    assert.equal(spanField(result.structure, 'F-E').grossSpan, 4000)
    assert.equal(structuralLine(result.structure, 'EB-W-S').x1, 4000)
    assert.equal(structuralLine(result.structure, 'EB-E-S').x1, 8000)
    assert.equal(toSquareMetres(result.structure.derived.grossFieldArea), 113.6)
  })

  test('preserves an existing architectural REVIEW even when the structural topology remains coherent', () => {
    const house = createReferenceHouseSource()
    house.court.value.depth = mm(4400)
    const result = compileReferenceHouseStructuralView(house)

    assert.equal(result.house.status, 'REVIEW')
    assert.equal(result.structure.status, 'PASS')
    assert.equal(result.status, 'REVIEW')
    assert.ok(result.house.diagnostics.some((item) => item.code === 'STAIR_RESERVATION_REVIEW'))
    assert.equal(spanField(result.structure, 'F-S').grossSpan, 3200)
  })

  test('fails when an edge-beam segment is removed from a continuous support path', () => {
    const house = createReferenceHouseSource()
    const source = cloneReferenceHouseStructuralSource(createReferenceHouseStructuralSource(house))
    const path = source.supportPaths.find((item) => item.id === 'SP-W-COURT')
    assert.ok(path)
    path.segmentIds = path.segmentIds.filter((id) => id !== 'EB-W-S')

    const result = compileReferenceHouseStructuralView(house, source)
    assert.equal(result.status, 'FAIL')
    assert.ok(diagnosticCodes(result.structure).includes('SUPPORT_PATH_GAP'))
  })

  test('fails when an edge beam is moved off the support line it is meant to continue', () => {
    const house = createReferenceHouseSource()
    const source = cloneReferenceHouseStructuralSource(createReferenceHouseStructuralSource(house))
    const beam = source.lineElements.find((item) => item.id === 'EB-W-S')
    assert.ok(beam)
    beam.at = 'COURT_EAST'

    const result = compileReferenceHouseStructuralView(house, source)
    assert.equal(result.status, 'FAIL')
    assert.ok(diagnosticCodes(result.structure).includes('SUPPORT_PATH_MISALIGNMENT'))
    assert.ok(diagnosticCodes(result.structure).includes('REACTION_NODE_GEOMETRY_MISMATCH'))
  })

  test('fails closed when a bearing line loses its foundation destination', () => {
    const house = createReferenceHouseSource()
    const source = cloneReferenceHouseStructuralSource(createReferenceHouseStructuralSource(house))
    const wall = source.lineElements.find((item) => item.id === 'LB-COURT-W')
    assert.ok(wall)
    delete wall.foundationDestinationId

    const result = compileReferenceHouseStructuralView(house, source)
    assert.equal(result.status, 'FAIL')
    assert.ok(diagnosticCodes(result.structure).includes('BEARING_LINE_NO_FOUNDATION'))
    assert.ok(diagnosticCodes(result.structure).includes('GRAVITY_PATH_UNRESOLVED'))
  })

  test('fails when a span field is assigned to support paths that do not bound it', () => {
    const house = createReferenceHouseSource()
    const source = cloneReferenceHouseStructuralSource(createReferenceHouseStructuralSource(house))
    const field = source.spanFields.find((item) => item.id === 'F-W')
    assert.ok(field)
    field.supportPathIds = ['SP-W-OUTER', 'SP-E-OUTER']

    const result = compileReferenceHouseStructuralView(house, source)
    assert.equal(result.status, 'FAIL')
    assert.ok(diagnosticCodes(result.structure).includes('SPAN_SUPPORT_MISMATCH'))
  })

  test('fails when a structural interruption loses its declared local framing system', () => {
    const house = createReferenceHouseSource()
    const source = cloneReferenceHouseStructuralSource(createReferenceHouseStructuralSource(house))
    source.localFramingSystems = source.localFramingSystems.filter((item) => item.id !== 'TR-ST-01')

    const result = compileReferenceHouseStructuralView(house, source)
    assert.equal(result.status, 'FAIL')
    assert.ok(diagnosticCodes(result.structure).includes('INTERRUPTION_UNFRAMED'))
  })

  test('fails when the structural deck diaphragm silently drops a gross floor field', () => {
    const house = createReferenceHouseSource()
    const source = cloneReferenceHouseStructuralSource(createReferenceHouseStructuralSource(house))
    source.diaphragm.fieldIds = source.diaphragm.fieldIds.filter((id) => id !== 'F-N')

    const result = compileReferenceHouseStructuralView(house, source)
    assert.equal(result.status, 'FAIL')
    assert.ok(diagnosticCodes(result.structure).includes('DIAPHRAGM_FIELD_OMITTED'))
  })

  test('renders a deterministic topology view and refuses failed topology', () => {
    const house = createReferenceHouseSource()
    const baseline = compileReferenceHouseStructuralView(house)
    const first = renderStructuralTopologySvg(baseline.structure, baseline.plan, 'RH-C2 structural topology')
    const second = renderStructuralTopologySvg(baseline.structure, baseline.plan, 'RH-C2 structural topology')

    assert.equal(first, second)
    assert.match(first, /data-entity="EB-W-S"/)
    assert.match(first, /data-entity="RN-CW-S"/)
    assert.match(first, /exact trimming geometry deliberately absent/)
    assert.match(first, /EXTERNAL|does not establish strength/)

    const brokenSource = cloneReferenceHouseStructuralSource(createReferenceHouseStructuralSource(house))
    brokenSource.supportPaths.find((item) => item.id === 'SP-W-COURT')!.segmentIds = ['LB-COURT-W', 'EB-W-N']
    const broken = compileReferenceHouseStructuralView(house, brokenSource)
    assert.equal(broken.structure.status, 'FAIL')
    assert.throws(
      () => renderStructuralTopologySvg(broken.structure, broken.plan, 'broken'),
      /Refusing to render failed structural topology/
    )
  })

  test('does not smuggle member sizing or capacity claims into the RH-C2 source contract', () => {
    const serialized = JSON.stringify(createReferenceHouseStructuralSource(createReferenceHouseSource()))

    assert.equal(serialized.includes('utilisation'), false)
    assert.equal(serialized.includes('capacity'), false)
    assert.equal(serialized.includes('strengthClass'), false)
    assert.equal(serialized.includes('memberSection'), false)
    assert.equal(serialized.includes('connectionCapacity'), false)
  })
})
