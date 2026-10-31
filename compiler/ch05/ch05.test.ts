import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, test } from 'node:test'

import type { CalculationMethod } from '../calculation-slice/model.js'
import { sha256SemanticFingerprint } from '../core/identity.js'
import { createReferenceHouseSource } from '../reference-house/fixture.js'
import type { ReferenceHouseSource } from '../reference-house/model.js'
import {
  calculationMethodSemanticFingerprint,
  linkReferenceHouseArtefacts,
  referenceHouseSourceFingerprint
} from '../reference-house/identity.js'
import { compileReferenceHouseSystem } from '../reference-house/system-compile.js'
import { privateStairGeometryMethod } from '../rhc5/method.js'

const reversedVariant = (
  mutate: (source: ReferenceHouseSource) => void
): ReferenceHouseSource => {
  const source = structuredClone(createReferenceHouseSource())
  mutate(source)
  return source
}

const declarativePermutations = (): ReferenceHouseSource[] => [
  reversedVariant((source) => source.spaces.reverse()),
  reversedVariant((source) => source.boundaries.reverse()),
  reversedVariant((source) => source.requiredAdjacencies.reverse()),
  reversedVariant((source) => source.openingFamilies.reverse()),
  reversedVariant((source) => source.openings.reverse()),
  reversedVariant((source) => source.qualitativeOpeningRelationships.reverse()),
  reversedVariant((source) => {
    source.spaces.reverse()
    source.boundaries.reverse()
    source.requiredAdjacencies.reverse()
    source.openingFamilies.reverse()
    source.openings.reverse()
    source.qualitativeOpeningRelationships.reverse()
  })
]

const baselineManifest = JSON.parse(
  readFileSync('compiler/ch00/reference-house-baseline.json', 'utf8')
) as {
  manifestVersion: string
  artefacts: Readonly<Record<string, { path: string; gitBlobSha1: string }>>
}

describe('CH-05 determinism, identity and provenance', () => {
  test('semantically unordered Reference House collections are permutation-invariant', () => {
    const canonicalSource = createReferenceHouseSource()
    const canonicalFingerprint = referenceHouseSourceFingerprint(canonicalSource)
    const canonicalResult = compileReferenceHouseSystem(canonicalSource)

    for (const permutedSource of declarativePermutations()) {
      assert.equal(referenceHouseSourceFingerprint(permutedSource), canonicalFingerprint)
      assert.deepEqual(compileReferenceHouseSystem(permutedSource), canonicalResult)
    }
  })

  test('authored sequence remains identity-bearing rather than being globally sorted', () => {
    const a = createReferenceHouseSource()
    a.stair.riseTopology.value.flightRiseGroups = [5, 6, 7]
    const b = structuredClone(a)
    b.stair.riseTopology.value.flightRiseGroups = [7, 6, 5]

    assert.notEqual(referenceHouseSourceFingerprint(a), referenceHouseSourceFingerprint(b))
  })

  test('calculation method identity ignores criterion presentation order but detects method changes', () => {
    const method: CalculationMethod = structuredClone(privateStairGeometryMethod)
    const reordered: CalculationMethod = {
      ...method,
      criteria: [...method.criteria].reverse()
    }
    const changed: CalculationMethod = {
      ...method,
      criteria: method.criteria.map((criterion) =>
        criterion.id === 'ADK-K1-PRIVATE-PITCH'
          ? { ...criterion, max: 41.5 }
          : criterion
      )
    }

    assert.equal(
      calculationMethodSemanticFingerprint(reordered),
      calculationMethodSemanticFingerprint(method)
    )
    assert.notEqual(
      calculationMethodSemanticFingerprint(changed),
      calculationMethodSemanticFingerprint(method)
    )
  })

  test('canonical compile exposes stable source, method, result and combined identities', () => {
    const first = compileReferenceHouseSystem(createReferenceHouseSource())
    const second = compileReferenceHouseSystem(createReferenceHouseSource())

    assert.deepEqual(first.identity, second.identity)
    assert.equal(first.identity.schemaVersion, 'HK-RH-COMPILE-1')
    assert.equal(first.identity.methods.privateStairGeometry.id, 'ADK-2013-PRIVATE-STAIR-GEOMETRY')
    assert.equal(first.identity.methods.privateStairGeometry.version, '1.0.0')
    assert.equal(
      first.identity.result.semanticFingerprint,
      sha256SemanticFingerprint(first.identity.result.manifest)
    )
    assert.equal(
      first.identity.compile.fingerprint,
      sha256SemanticFingerprint(first.identity.compile.manifest)
    )

    for (const fingerprint of [
      first.identity.source.semanticFingerprint,
      first.identity.methods.privateStairGeometry.semanticFingerprint,
      first.identity.result.semanticFingerprint,
      first.identity.compile.fingerprint
    ]) {
      assert.match(fingerprint, /^[0-9a-f]{64}$/)
    }
  })

  test('selected important outputs expose lightweight lineage to existing authority', () => {
    const result = compileReferenceHouseSystem(createReferenceHouseSource())

    assert.deepEqual(result.lineage.floorZoneDepth.sourceFactIds, ['RHCF-CEIL-G', 'RHCF-FFL-1'])
    assert.deepEqual(
      result.lineage.boundaryCoordination.wallPlanningStressThickness.sourceFactIds,
      ['RHCF-WALL-STRESS']
    )
    assert.equal(
      result.lineage.privateStairGeometry.methodId,
      'ADK-2013-PRIVATE-STAIR-GEOMETRY'
    )
    assert.deepEqual(
      result.lineage.privateStairGeometry.criteria['ADK-K1-PRIVATE-RISE'].sourceFactIds,
      ['RHCF-FFL-1', 'RHCF-STAIR-N']
    )
    assert.deepEqual(
      result.lineage.privateStairGeometry.criteria['ADK-K1-PRIVATE-GOING'].sourceFactIds,
      ['RHCF-STAIR-G']
    )
  })

  test('CH-00 artefact identities can be bound to the same canonical compile identity', () => {
    const result = compileReferenceHouseSystem(createReferenceHouseSource())
    const link = linkReferenceHouseArtefacts(result.identity, baselineManifest.artefacts)

    assert.equal(baselineManifest.manifestVersion, 'CH00-1')
    assert.equal(link.compileFingerprint, result.identity.compile.fingerprint)
    assert.equal(link.sourceFingerprint, result.identity.source.semanticFingerprint)
    assert.equal(Object.keys(link.artefacts).length, 6)
    assert.equal(
      link.artefacts.rhc4BoundaryTopology.gitBlobSha1,
      '00081babcb91c241f9bbbad31930c9f3796b322d'
    )
  })
})
