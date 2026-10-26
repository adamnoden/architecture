import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { createReferenceHouseSource } from './fixture.js'
import {
  auditReferenceHouseInternalPartitionSource,
  createReferenceHouseInternalPartitionSource
} from './internal-partitions.js'
import { mm } from './units.js'

describe('ADE-05A Reference House internal-partition source', () => {
  test('classifies every current internal planning boundary as physical nonloadbearing partition intent', () => {
    const house = createReferenceHouseSource()
    const partitions = createReferenceHouseInternalPartitionSource()
    const internalBoundaryIds = house.boundaries
      .filter((boundary) => boundary.kind === 'internal-planning')
      .map((boundary) => boundary.id)
      .sort()

    assert.equal(internalBoundaryIds.length, 16)
    assert.deepEqual(
      partitions.intents.map((intent) => intent.boundaryId).sort(),
      internalBoundaryIds
    )
    assert.ok(
      partitions.intents.every(
        (intent) =>
          intent.intent === 'physical-nonloadbearing-partition' &&
          intent.familyId === 'RH-PART-DRY-01' &&
          intent.openingSelection === 'unresolved'
      )
    )
    assert.deepEqual(auditReferenceHouseInternalPartitionSource(house, partitions), [])
  })

  test('owns a bounded dry family without reviving the historical 125 mm publication proxy', () => {
    const family = createReferenceHouseInternalPartitionSource().family

    assert.equal(family.constructionFamily, 'dry-framed-nonloadbearing')
    assert.equal(family.loadbearing, false)
    assert.deepEqual(family.coordinationThickness, { kind: 'range', min: 100, max: 150 })
    assert.equal(family.datumRelation, 'centred-on-planning-datum')
    assert.equal(family.replaceability, 'bounded-rebuildable-assembly')
    assert.equal(family.servicePolicy, 'service-free')
    assert.equal(family.relocatableSystemSelected, false)
    assert.equal(family.proprietarySystemSelected, false)
    assert.equal('nominalThickness' in family, false)
    assert.equal('studMaterial' in family, false)
    assert.equal('boardBuildUp' in family, false)
  })

  test('keeps performance obligations explicit while technical construction remains unmodelled', () => {
    const family = createReferenceHouseInternalPartitionSource().family

    assert.deepEqual(family.performanceObligations, [
      'acoustic-privacy',
      'impact-and-fixing-robustness',
      'fire-where-required',
      'moisture-where-required',
      'door-set-stability'
    ])
    assert.ok(family.notModelled.includes('tested-acoustic-rating'))
    assert.ok(family.notModelled.includes('tested-fire-rating'))
    assert.ok(family.notModelled.includes('wet-area-board-and-membrane-build-up'))
    assert.ok(family.notModelled.includes('door-jamb-and-head-reinforcement'))
    assert.ok(family.notModelled.includes('service-routes'))
  })

  test('does not turn required adjacency into a selected internal opening or door', () => {
    const house = createReferenceHouseSource()
    const partitions = createReferenceHouseInternalPartitionSource()

    assert.ok(house.requiredAdjacencies.length > 0)
    assert.ok(partitions.intents.every((intent) => intent.openingSelection === 'unresolved'))
    assert.equal(partitions.intents.some((intent) => 'doorId' in intent), false)
    assert.equal(partitions.intents.some((intent) => 'openingId' in intent), false)
  })

  test('rejects missing, duplicate and non-internal boundary classifications', () => {
    const house = createReferenceHouseSource()

    const missing = createReferenceHouseInternalPartitionSource()
    const removed = missing.intents.pop()
    assert.ok(removed)
    assert.ok(
      auditReferenceHouseInternalPartitionSource(house, missing).some(
        (item) =>
          item.code === 'INTERNAL_PARTITION_INTENT_MISSING' &&
          item.subjectIds.includes(removed.boundaryId)
      )
    )

    const duplicate = createReferenceHouseInternalPartitionSource()
    duplicate.intents.push({ ...duplicate.intents[0] })
    assert.ok(
      auditReferenceHouseInternalPartitionSource(house, duplicate).some(
        (item) => item.code === 'DUPLICATE_PARTITION_INTENT'
      )
    )

    const wrongBoundary = createReferenceHouseInternalPartitionSource()
    wrongBoundary.intents[0] = { ...wrongBoundary.intents[0], boundaryId: 'G-OUTER-SOUTH' }
    assert.ok(
      auditReferenceHouseInternalPartitionSource(house, wrongBoundary).some(
        (item) => item.code === 'PARTITION_BOUNDARY_NOT_INTERNAL_PLANNING'
      )
    )
  })

  test('rejects invalid coordination range and family references', () => {
    const house = createReferenceHouseSource()

    const badRange = createReferenceHouseInternalPartitionSource()
    badRange.family.coordinationThickness.min = mm(160)
    assert.ok(
      auditReferenceHouseInternalPartitionSource(house, badRange).some(
        (item) => item.code === 'INVALID_PARTITION_COORDINATION_RANGE'
      )
    )

    const badFamily = createReferenceHouseInternalPartitionSource()
    ;(badFamily.intents[0] as { familyId: string }).familyId = 'OTHER'
    assert.ok(
      auditReferenceHouseInternalPartitionSource(house, badFamily).some(
        (item) => item.code === 'PARTITION_FAMILY_MISMATCH'
      )
    )
  })
})
