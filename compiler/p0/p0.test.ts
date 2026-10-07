import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { compile } from './compile.js'
import { captureDependency } from './evidence.js'
import { cloneSource, createP0Fixture } from './fixture.js'
import type { EvidenceRecord, SourceModel } from './model.js'

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

const evidenceRecord = (source: SourceModel, id: string) => {
  const found = source.evidence.find((candidate) => candidate.id === id)
  assert.ok(found, `Expected evidence ${id}`)
  return found
}

const diagnosticCodes = (source: SourceModel): string[] => compile(source).diagnostics.map((item) => item.code)

describe('P0 baseline', () => {
  test('compiles one semantic source with separate model, architecture, technical and evidence state', () => {
    const result = compile(createP0Fixture())

    assert.deepEqual(result.validity, {
      model: 'PASS',
      architecture: 'PASS',
      technical: 'UNRESOLVED',
      evidence: 'PASS'
    })

    assert.equal(obligation(createP0Fixture(), 'boundary:PEN-01:air').status, 'PASS')
    assert.equal(
      obligation(createP0Fixture(), 'boundary:PEN-01:weather').status,
      'EXTERNALLY_DISCHARGED'
    )
    assert.equal(obligation(createP0Fixture(), 'boundary:PEN-01:thermal').status, 'UNRESOLVED')
    assert.equal(
      obligation(createP0Fixture(), 'structural:PEN-01:WALL-EXT-01').status,
      'EXTERNALLY_DISCHARGED'
    )
  })

  test('uses relationships for contextual roles rather than duplicating the wall', () => {
    const source = createP0Fixture()
    const wallRoles = source.relationships.filter(
      (relationship) => relationship.from === 'WALL-EXT-01' || relationship.to === 'WALL-EXT-01'
    )

    assert.deepEqual(
      wallRoles.map((relationship) => relationship.type).sort(),
      ['contains', 'crosses', 'hosts', 'hosts'].sort()
    )
    assert.equal(source.entities.filter((candidate) => candidate.id === 'WALL-EXT-01').length, 1)
  })
})

describe('P0.1 source and geometry', () => {
  test('rejects duplicate stable entity IDs', () => {
    const source = createP0Fixture()
    source.entities.push(cloneSource(source).entities[1])

    assert.equal(compile(source).validity.model, 'FAIL')
    assert.ok(diagnosticCodes(source).includes('DUPLICATE_ENTITY_ID'))
  })

  test('rejects a relationship pointing at a missing source entity', () => {
    const source = createP0Fixture()
    source.relationships.push({
      id: 'BROKEN-REL',
      type: 'adjacent-to',
      from: 'ROOM-01',
      to: 'ROOM-MISSING'
    })

    assert.equal(compile(source).validity.model, 'FAIL')
    assert.ok(diagnosticCodes(source).includes('MISSING_RELATIONSHIP_ENDPOINT'))
  })

  test('P0-M01 rejects overlapping peer spaces', () => {
    const source = createP0Fixture()
    entity(source, 'ROOM-02').geometry = { kind: 'box2d', x: 4500, y: 200, width: 4800, height: 5000 }

    assert.equal(compile(source).validity.model, 'FAIL')
    assert.ok(diagnosticCodes(source).includes('SPACE_OVERLAP'))
  })

  test('P0-M02 rejects false declared adjacency', () => {
    const source = createP0Fixture()
    entity(source, 'ROOM-02').geometry = { kind: 'box2d', x: 5200, y: 200, width: 4600, height: 5000 }

    const result = compile(source)
    assert.equal(result.validity.model, 'FAIL')
    const diagnostic = result.diagnostics.find((item) => item.code === 'FALSE_ADJACENCY')
    assert.ok(diagnostic)
    assert.deepEqual(diagnostic.subjectIds, ['ADJ-ROOMS', 'ROOM-01', 'ROOM-02'].sort())
  })

  test('P0-M03 rejects an opening outside its declared host wall', () => {
    const source = createP0Fixture()
    entity(source, 'WIN-01').geometry = { kind: 'box2d', x: 300, y: 1500, width: 200, height: 1200 }

    const result = compile(source)
    assert.equal(result.validity.model, 'FAIL')
    assert.ok(result.diagnostics.some((item) => item.code === 'HOST_GEOMETRY_MISMATCH'))
  })

  test('keeps a project architectural requirement separate from model well-formedness', () => {
    const source = createP0Fixture()
    source.relationships = source.relationships.filter((relationship) => relationship.id !== 'ADJ-ROOMS')

    const result = compile(source)
    assert.equal(result.validity.model, 'PASS')
    assert.equal(result.validity.architecture, 'FAIL')
    assert.equal(obligation(source, 'requirement:REQ-ADJ-01').status, 'FAIL')
  })
})

describe('P0.2 crossing and obligation derivation', () => {
  test('P0-M04 rejects an anonymous service crossing', () => {
    const source = createP0Fixture()
    source.entities = source.entities.filter((candidate) => candidate.id !== 'PEN-01')
    source.relationships = source.relationships.filter(
      (relationship) => relationship.id !== 'HOST-PEN' && relationship.id !== 'CARRIES-PEN'
    )
    source.evidence = source.evidence.filter((record) => !record.subjectIds.includes('PEN-01'))

    const result = compile(source)
    assert.equal(result.validity.model, 'FAIL')
    const crossing = result.diagnostics.find((item) => item.code === 'UNCONTROLLED_CROSSING')
    assert.ok(crossing)
    assert.match(crossing.message, /SR-01 crosses WALL-EXT-01/)
  })

  test('P0-M05 derives a new obligation when a new boundary role appears without broadening old evidence', () => {
    const source = createP0Fixture()
    const wall = entity(source, 'WALL-EXT-01')
    const boundaryRoles = wall.attributes?.boundaryRoles as Record<string, boolean>
    boundaryRoles.fire = true

    const result = compile(source)
    assert.equal(result.validity.model, 'PASS')
    assert.equal(obligation(source, 'boundary:PEN-01:fire').status, 'UNRESOLVED')
    assert.equal(obligation(source, 'boundary:WIN-01:fire').status, 'UNRESOLVED')
    assert.equal(obligation(source, 'boundary:PEN-01:air').status, 'PASS')
    assert.equal(evidenceRecord(source, 'E-PEN-AIR-01').dependencies[1].value, true)
    assert.equal(result.evidence.find((state) => state.id === 'E-PEN-AIR-01')?.current, true)
  })
})

describe('P0.3 evidence scope and selective invalidation', () => {
  test('evidence cannot discharge an obligation outside its declared subject scope', () => {
    const source = createP0Fixture()
    evidenceRecord(source, 'E-PEN-AIR-01').subjectIds = ['PEN-01']

    assert.equal(obligation(source, 'boundary:PEN-01:air').status, 'UNRESOLVED')
  })

  test('P0-M06 stales only evidence whose captured dependencies changed', () => {
    const source = createP0Fixture()
    entity(source, 'PEN-01').geometry = { kind: 'box2d', x: 0, y: 6020, width: 200, height: 80 }

    const result = compile(source)
    assert.equal(result.validity.model, 'PASS')
    assert.equal(result.validity.evidence, 'UNRESOLVED')

    for (const id of ['E-PEN-AIR-01', 'E-PEN-WEATHER-01', 'E-PEN-STRUCT-01']) {
      assert.equal(result.evidence.find((state) => state.id === id)?.current, false)
    }

    for (const id of ['E-WIN-AIR-01', 'E-WIN-WEATHER-01', 'E-WIN-THERMAL-01']) {
      assert.equal(result.evidence.find((state) => state.id === id)?.current, true)
    }

    assert.equal(obligation(source, 'boundary:PEN-01:air').status, 'UNRESOLVED')
    assert.equal(obligation(source, 'boundary:WIN-01:air').status, 'PASS')
  })

  test('P0-M07 records accepted external determination as EXTERNALLY_DISCHARGED', () => {
    const source = createP0Fixture()

    assert.equal(
      obligation(source, 'structural:PEN-01:WALL-EXT-01').status,
      'EXTERNALLY_DISCHARGED'
    )
    assert.equal(
      obligation(source, 'boundary:PEN-01:weather').status,
      'EXTERNALLY_DISCHARGED'
    )
  })

  test('P0-M08 keeps explicit technical failure distinct from well-formed source geometry', () => {
    const source = createP0Fixture()
    const current = evidenceRecord(source, 'E-PEN-AIR-01')
    current.result = 'fail'

    const result = compile(source)
    assert.equal(result.validity.model, 'PASS')
    assert.equal(obligation(source, 'boundary:PEN-01:air').status, 'FAIL')
    assert.equal(result.validity.technical, 'FAIL')
  })

  test('scoped evidence can be created against the current source without hidden global dependency', () => {
    const source = createP0Fixture()
    const record: EvidenceRecord = {
      id: 'E-PEN-THERMAL-01',
      resolver: 'inspection',
      proposition: 'PEN-01 thermal transition is accepted for the P0 fixture.',
      subjectIds: ['PEN-01', 'WALL-EXT-01'],
      source: { name: 'P0 inspection', version: '1.0' },
      result: 'pass',
      obligationKeys: ['boundary:PEN-01:thermal'],
      dependencies: [
        captureDependency(source, { kind: 'entity', id: 'PEN-01', path: 'geometry' }),
        captureDependency(source, {
          kind: 'entity',
          id: 'WALL-EXT-01',
          path: 'attributes.boundaryRoles.thermal'
        })
      ]
    }
    source.evidence.push(record)

    assert.equal(obligation(source, 'boundary:PEN-01:thermal').status, 'PASS')
  })
})

describe('P0.4 unsupported domain and reproducibility', () => {
  test('P0-M09 returns a clean unsupported result instead of guessing', () => {
    const source = createP0Fixture()
    entity(source, 'WIN-01').geometry = {
      kind: 'unsupported',
      description: 'curved opening requiring geometry outside P0'
    }

    const result = compile(source)
    assert.equal(result.validity.model, 'UNSUPPORTED')
    const unsupported = result.diagnostics.find((item) => item.code === 'UNSUPPORTED_GEOMETRY')
    assert.ok(unsupported)
    assert.equal(unsupported.status, 'UNSUPPORTED')
  })

  test('P0-M10 produces deterministic deep-equal output for the same frozen input', () => {
    const source = createP0Fixture()

    assert.deepEqual(compile(cloneSource(source)), compile(cloneSource(source)))
  })
})
