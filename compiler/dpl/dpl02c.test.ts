import assert from 'node:assert/strict'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, test } from 'node:test'
import { createReferenceHouseSource } from '../reference-house/fixture.js'
import { referenceHouseSourceFingerprint } from '../reference-house/identity.js'
import {
  expectedDpl02CoverageIds,
  loadConformanceCoverageRegistry,
  nativeConformanceCoverageIds,
  unresolvedPositiveConformanceBlockers,
  type ConformanceCoverageRegistry
} from './conformance-coverage.js'
import { evaluateCandidateConformance } from './conformance.js'
import type { DeploymentCandidateInput } from './model.js'

const canonicalCandidate = (): DeploymentCandidateInput => {
  const source = createReferenceHouseSource()
  return {
    id: 'DPL-02C-COVERAGE-PROBE',
    revision: '1',
    authoredSource: { id: 'dpl-02c-coverage-probe', revision: '1' },
    referenceHouseSourceFingerprint: referenceHouseSourceFingerprint(source),
    facts: {
      courtyardOpenToSky: true,
      shellWidthMm: Number(source.shell.width.value),
      shellDepthMm: Number(source.shell.depth.value),
      courtyardWidthMm: Number(source.court.value.width),
      courtyardDepthMm: Number(source.court.value.depth),
      courtyardPlacement: source.court.value.placement,
      storeys: 2,
      stairRiserCount: source.stair.riseTopology.value.riserCount,
      stairFlightRiseGroups: [...source.stair.riseTopology.value.flightRiseGroups],
      stairGoingMm: Number(source.stair.goingTopology.value.going),
      frontBayCount: source.frontField.value.count,
      frontBaySpacingMm: Number(source.frontField.value.spacing),
      entranceBayIndex: source.entranceBay.value.bayIndex
    }
  }
}

const evaluateCoverageProbe = (candidate: DeploymentCandidateInput = canonicalCandidate()) =>
  evaluateCandidateConformance(candidate, createReferenceHouseSource())

describe('DPL-02C Reference House conformance coverage registry', () => {
  test('covers the complete frozen 38-entry DPL-02 clause/route universe exactly once', () => {
    const loaded = loadConformanceCoverageRegistry()
    const registry = loaded.registry

    assert.equal(registry.entries.length, 38)
    assert.deepEqual(
      registry.entries.map((entry) => entry.id),
      [...expectedDpl02CoverageIds].sort((a, b) => a.localeCompare(b))
    )

    const counts = Object.fromEntries(
      ['IDENTITY_INVARIANT', 'PROTECTED_ORDER', 'PERMITTED_DISCRETE_VARIANT', 'SITE_INTERFACE_FREEDOM', 'IMPLEMENTATION_FREEDOM'].map(
        (kind) => [kind, registry.entries.filter((entry) => entry.conformanceClass === kind).length]
      )
    )
    assert.deepEqual(counts, {
      IDENTITY_INVARIANT: 7,
      PROTECTED_ORDER: 15,
      PERMITTED_DISCRETE_VARIANT: 2,
      SITE_INTERFACE_FREEDOM: 6,
      IMPLEMENTATION_FREEDOM: 8
    })
    assert.deepEqual(
      registry.nonClauseCategories.map((item) => item.id),
      ['OPEN', 'PREFERRED', 'SUPERSEDED']
    )
  })

  test('registry native coverage is exactly the current DPL-12B executable clause/route set', () => {
    const registry = loadConformanceCoverageRegistry().registry
    const runtime = evaluateCoverageProbe()

    assert.deepEqual(nativeConformanceCoverageIds(registry), runtime.executableClauseIds)
    assert.deepEqual(runtime.executableClauseIds, [
      'RH-I02',
      'RH-PROT-01',
      'RH-PROT-04',
      'RH-PROT-06',
      'RH-V01',
      'RH-V02'
    ])
  })

  test('registry metadata does not cause non-native clauses to become conformance findings', () => {
    const registry = loadConformanceCoverageRegistry().registry
    const runtime = evaluateCoverageProbe()

    const grammarCoverage = registry.entries.find((entry) => entry.id === 'RH-I01')
    assert.ok(grammarCoverage)
    assert.equal(grammarCoverage.executableStatus, 'NOT_NATIVE')
    assert.equal(grammarCoverage.resolutionMode, 'ARCHITECTURAL_REVIEW')

    const grammarFinding = runtime.findings.find((finding) => finding.clauseId === 'RH-I01')
    assert.ok(grammarFinding)
    assert.equal(grammarFinding.result, 'OPEN')
    assert.ok(runtime.openClauseIds.includes('RH-I01'))
  })

  test('unresolved positive-conformance blockers remain coverage semantics, not site-incompatibility authority', () => {
    const registry = loadConformanceCoverageRegistry().registry
    const blockers = unresolvedPositiveConformanceBlockers(registry)

    assert.ok(blockers.includes('RH-I01'))
    assert.ok(blockers.includes('RH-PROT-14'))
    assert.ok(blockers.includes('RH-SI04'))
    assert.equal(blockers.includes('RH-V01'), false)
    assert.equal(blockers.includes('RH-IMP07'), false)
    assert.equal(registry.entries.some((entry) => entry.canProveSiteIncompatibilityAlone), false)
    assert.equal(Object.prototype.hasOwnProperty.call(registry, 'compatibility'), false)
    assert.equal(Object.prototype.hasOwnProperty.call(registry, 'routeExhaustion'), false)
  })

  test('route entries remain authored route permissions rather than candidate selection or exhaustion', () => {
    const registry = loadConformanceCoverageRegistry().registry
    const routes = registry.entries.filter((entry) => entry.conformanceClass === 'PERMITTED_DISCRETE_VARIANT')

    assert.deepEqual(routes.map((entry) => entry.id), ['RH-V01', 'RH-V02'])
    for (const route of routes) {
      assert.equal(route.resolutionMode, 'AUTHORED_ROUTE_SELECTION')
      assert.equal(route.executableStatus, 'NATIVE_ROUTE')
      assert.equal(route.screeningCoveragePosture, 'ADMITTED_ROUTE_ONLY')
      assert.equal(route.unresolvedBlocksPositiveConformance, false)
    }

    const selected = evaluateCoverageProbe({
      ...canonicalCandidate(),
      variantSelections: ['RH-V02']
    })
    const v02 = selected.findings.find((finding) => finding.clauseId === 'RH-V02')
    assert.ok(v02)
    assert.equal(v02.result, 'CONFORMS')
    assert.equal(Object.prototype.hasOwnProperty.call(selected, 'routeExhaustion'), false)
  })

  test('implementation freedoms stay visible without becoming SCREENING pass conditions', () => {
    const registry = loadConformanceCoverageRegistry().registry
    const implementation = registry.entries.filter(
      (entry) => entry.conformanceClass === 'IMPLEMENTATION_FREEDOM'
    )

    assert.equal(implementation.length, 8)
    for (const entry of implementation) {
      assert.equal(entry.resolutionMode, 'IMPLEMENTATION_DETAIL_FUTURE')
      assert.equal(entry.screeningCoveragePosture, 'FUTURE_IMPLEMENTATION_BOUNDARY')
      assert.equal(entry.unresolvedBlocksPositiveConformance, false)
      assert.equal(entry.executableStatus, 'NOT_NATIVE')
    }
  })

  test('registry ordering is semantically irrelevant while coverage posture is identity-bearing', () => {
    const loaded = loadConformanceCoverageRegistry()
    const registry = loaded.registry

    const dir = mkdtempSync(join(tmpdir(), 'dpl02c-'))
    try {
      const reorderedPath = join(dir, 'reordered.json')
      writeFileSync(
        reorderedPath,
        JSON.stringify({
          ...registry,
          entries: [...registry.entries].reverse(),
          nonClauseCategories: [...registry.nonClauseCategories].reverse()
        })
      )
      const reordered = loadConformanceCoverageRegistry(reorderedPath)
      assert.equal(loaded.fingerprint, reordered.fingerprint)

      const changedPath = join(dir, 'changed.json')
      writeFileSync(
        changedPath,
        JSON.stringify({
          ...registry,
          entries: registry.entries.map((entry) =>
            entry.id === 'RH-PROT-14'
              ? { ...entry, screeningCoveragePosture: 'RESOLVE_IF_INVOKED' }
              : entry
          )
        })
      )
      const changed = loadConformanceCoverageRegistry(changedPath)
      assert.notEqual(loaded.fingerprint, changed.fingerprint)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  test('fails closed on duplicate/missing ids and unknown vocabulary values', () => {
    const registry = loadConformanceCoverageRegistry().registry
    const dir = mkdtempSync(join(tmpdir(), 'dpl02c-invalid-'))
    try {
      const duplicatePath = join(dir, 'duplicate.json')
      writeFileSync(
        duplicatePath,
        JSON.stringify({ ...registry, entries: [...registry.entries, registry.entries[0]] })
      )
      assert.throws(() => loadConformanceCoverageRegistry(duplicatePath), /Duplicate DPL-02C coverage id/)

      const missingPath = join(dir, 'missing.json')
      writeFileSync(
        missingPath,
        JSON.stringify({ ...registry, entries: registry.entries.filter((entry) => entry.id !== 'RH-I07') })
      )
      assert.throws(() => loadConformanceCoverageRegistry(missingPath), /missing conformance id RH-I07/)

      const badClassPath = join(dir, 'bad-class.json')
      writeFileSync(
        badClassPath,
        JSON.stringify({
          ...registry,
          entries: registry.entries.map((entry) =>
            entry.id === 'RH-I01' ? { ...entry, conformanceClass: 'SIMILARITY_SCORE' } : entry
          )
        })
      )
      assert.throws(() => loadConformanceCoverageRegistry(badClassPath), /Unsupported DPL-02C conformance class/)

      const badModePath = join(dir, 'bad-mode.json')
      writeFileSync(
        badModePath,
        JSON.stringify({
          ...registry,
          entries: registry.entries.map((entry) =>
            entry.id === 'RH-I01' ? { ...entry, resolutionMode: 'AUTO_PASS' } : entry
          )
        })
      )
      assert.throws(() => loadConformanceCoverageRegistry(badModePath), /Unsupported DPL-02C resolution mode/)

      const badPosturePath = join(dir, 'bad-posture.json')
      writeFileSync(
        badPosturePath,
        JSON.stringify({
          ...registry,
          entries: registry.entries.map((entry) =>
            entry.id === 'RH-I01' ? { ...entry, screeningCoveragePosture: 'PASS' } : entry
          )
        })
      )
      assert.throws(() => loadConformanceCoverageRegistry(badPosturePath), /Unsupported DPL-02C screening posture/)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  test('OPEN non-clause category remains a warning against permission, never a conformance result', () => {
    const registry: ConformanceCoverageRegistry = loadConformanceCoverageRegistry().registry
    const open = registry.nonClauseCategories.find((item) => item.id === 'OPEN')
    assert.ok(open)
    assert.match(open.rule, /not permission/i)
    assert.equal(Object.prototype.hasOwnProperty.call(open, 'result'), false)
  })
})
