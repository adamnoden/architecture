import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { compile } from '../p0/compile.js'
import { cloneSource } from '../p0/fixture.js'
import type { SourceModel } from '../p0/model.js'
import { createPatXw01Fixture } from './pat-xw-01.fixture.js'
import { buildPatternCrosswalkReport } from './report.js'

const entity = (source: SourceModel, id: string) => {
  const found = source.entities.find((candidate) => candidate.id === id)
  assert.ok(found, `Expected entity ${id}`)
  return found
}

const obligation = (source: SourceModel, key: string) => {
  const found = compile(source).obligations.find((candidate) => candidate.key === key)
  assert.ok(found, `Expected obligation ${key}`)
  return found
}

const reportForP003 = (source: SourceModel) =>
  buildPatternCrosswalkReport(source, compile(source), 'HSA-P-003', ['SR-01', 'SR-02', 'SR-03'])

const reportForP005 = (source: SourceModel) =>
  buildPatternCrosswalkReport(source, compile(source), 'HSA-P-005', ['PEN-01'])

describe('PAT-XW-01 baseline', () => {
  test('keeps pattern provenance above the compiler ontology', () => {
    const source = createPatXw01Fixture()
    const result = compile(source)

    assert.deepEqual(result.validity, {
      model: 'PASS',
      architecture: 'PASS',
      technical: 'EXTERNALLY_DISCHARGED',
      evidence: 'PASS'
    })

    assert.equal(entity(source, 'SR-01').attributes?.routeRole, 'primary')
    assert.equal(entity(source, 'SR-02').attributes?.routeRole, 'local-branch')

    const p003 = reportForP003(source)
    assert.equal(p003.formalCommitments.length, 3)
    assert.ok(p003.formalCommitments.every((item) => item.status === 'PASS'))
    assert.ok(p003.formalCommitments.every((item) => item.authority === 'project'))
    assert.equal(p003.architecturalJudgement, 'HUMAN_DETERMINATION')
    assert.equal(Object.hasOwn(p003, 'status'), false)

    const p005 = reportForP005(source)
    assert.equal(p005.formalCommitments.length, 3)
    assert.ok(p005.formalCommitments.every((item) => item.status === 'PASS'))
    assert.deepEqual(
      p005.inducedTechnicalObligations.map((item) => [item.key, item.status, item.authority]),
      [
        ['boundary:PEN-01:air', 'PASS', 'physical'],
        ['boundary:PEN-01:thermal', 'PASS', 'physical'],
        ['boundary:PEN-01:weather', 'EXTERNALLY_DISCHARGED', 'physical'],
        ['structural:PEN-01:WALL-EXT-01', 'EXTERNALLY_DISCHARGED', 'physical']
      ]
    )
    assert.ok(p005.inducedTechnicalObligations.every((item) => item.authority !== 'project'))
    assert.equal(Object.hasOwn(p005, 'status'), false)
  })
})

describe('PAT-XW-01 mutations', () => {
  test('XW-M01 rejects a route crossing without an owned transition', () => {
    const source = createPatXw01Fixture()
    source.entities = source.entities.filter((candidate) => candidate.id !== 'PEN-01')
    source.relationships = source.relationships.filter(
      (relationship) => relationship.id !== 'HOST-PEN' && relationship.id !== 'CARRIES-PEN'
    )
    source.evidence = source.evidence.filter((record) => !record.subjectIds.includes('PEN-01'))

    const result = compile(source)
    assert.equal(result.validity.model, 'FAIL')
    const uncontrolled = result.diagnostics.find((item) => item.code === 'UNCONTROLLED_CROSSING')
    assert.ok(uncontrolled)
    assert.match(uncontrolled.message, /SR-01 crosses WALL-EXT-01/)
  })

  test('XW-M02 keeps P-005 formal commitments resolved when one technical evidence item is absent', () => {
    const source = createPatXw01Fixture()
    source.evidence = source.evidence.filter((record) => record.id !== 'E-PEN-AIR-01')

    const result = compile(source)
    const p005 = reportForP005(source)

    assert.equal(result.validity.model, 'PASS')
    assert.equal(result.validity.architecture, 'PASS')
    assert.equal(result.validity.technical, 'UNRESOLVED')
    assert.ok(p005.formalCommitments.every((item) => item.status === 'PASS'))
    assert.equal(
      p005.inducedTechnicalObligations.find((item) => item.key === 'boundary:PEN-01:air')?.status,
      'UNRESOLVED'
    )
  })

  test('XW-M03 lets technical state survive an HSA route-geography departure', () => {
    const baseline = compile(createPatXw01Fixture())
    const source = createPatXw01Fixture()

    source.entities.push({
      id: 'SR-03',
      type: 'ServiceRoute',
      levelId: 'STOREY-01',
      geometry: { kind: 'box2d', x: 3500, y: 6000, width: 1000, height: 100 },
      attributes: {
        serviceClass: 'electrical',
        routeRole: 'ad-hoc-branch',
        serviceNetwork: 'NET-01'
      }
    })
    source.relationships.push(
      { id: 'CONTAINS-SR-03', type: 'contains', from: 'STOREY-01', to: 'SR-03' },
      { id: 'ADJ-SR-02-03', type: 'adjacent-to', from: 'SR-02', to: 'SR-03' }
    )
    source.requirements.push({
      id: 'REQ-XW-P003-ACCESS-ADHOC',
      kind: 'relationship-present',
      dimension: 'architecture',
      relationshipType: 'accessible-via',
      from: 'SR-03',
      to: 'ACCESS-01',
      message: 'Any added branch must remain inside the selected accessible service geography or declare a departure.',
      provenance: 'HSA-P-003'
    })

    const result = compile(source)
    const p003 = reportForP003(source)

    assert.equal(result.validity.model, 'PASS')
    assert.equal(result.validity.architecture, 'FAIL')
    assert.equal(result.validity.technical, baseline.validity.technical)
    assert.equal(
      p003.formalCommitments.find((item) => item.requirementId === 'REQ-XW-P003-ACCESS-ADHOC')?.status,
      'FAIL'
    )
    assert.equal(p003.inducedTechnicalObligations.length, 0)
  })

  test('XW-M04 derives a new technical obligation without changing P-005 project authority or old evidence scope', () => {
    const source = createPatXw01Fixture()
    const wall = entity(source, 'WALL-EXT-01')
    const boundaryRoles = wall.attributes?.boundaryRoles as Record<string, boolean>
    boundaryRoles.fire = true

    const result = compile(source)
    const p005 = reportForP005(source)
    const fire = p005.inducedTechnicalObligations.find((item) => item.key === 'boundary:PEN-01:fire')

    assert.ok(p005.formalCommitments.every((item) => item.status === 'PASS'))
    assert.ok(fire)
    assert.equal(fire.status, 'UNRESOLVED')
    assert.equal(fire.authority, 'regulatory')
    assert.equal(obligation(source, 'boundary:PEN-01:air').status, 'PASS')
    assert.equal(result.evidence.find((item) => item.id === 'E-PEN-AIR-01')?.current, true)
  })

  test('the crosswalk result is deterministic for a frozen source', () => {
    const source = createPatXw01Fixture()
    const left = buildPatternCrosswalkReport(
      cloneSource(source),
      compile(cloneSource(source)),
      'HSA-P-005',
      ['PEN-01']
    )
    const right = buildPatternCrosswalkReport(
      cloneSource(source),
      compile(cloneSource(source)),
      'HSA-P-005',
      ['PEN-01']
    )

    assert.deepEqual(left, right)
  })
})
