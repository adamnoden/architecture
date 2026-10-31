import assert from 'node:assert/strict'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, test } from 'node:test'
import {
  englandCoverageEntry,
  expectedEnglandCoverageIds,
  loadEnglandCoverageRegistry,
  type EnglandCoverageRegistry
} from './england-coverage.js'
import { loadTargetSlice } from './load.js'

const target09b = () =>
  loadTargetSlice(
    'project/dpl/targets/england-structure-ground-moisture-materials-v1.json',
    'ENGLAND_BUILDING_CONTROL'
  )

const target09c = () =>
  loadTargetSlice(
    'project/dpl/targets/england-drainage-waste-water-v1.json',
    'ENGLAND_BUILDING_CONTROL'
  )

describe('DPL-09D England SCREENING family coverage registry', () => {
  test('covers the controlled England family universe exactly once', () => {
    const registry = loadEnglandCoverageRegistry().registry

    assert.equal(registry.jurisdiction, 'ENGLAND')
    assert.equal(registry.assuranceProfile, 'SCREENING')
    assert.equal(registry.entries.length, expectedEnglandCoverageIds.length)
    assert.deepEqual(
      registry.entries.map((entry) => entry.id),
      [...expectedEnglandCoverageIds].sort((a, b) => a.localeCompare(b))
    )
  })

  test('maps DPL-09B and DPL-09C target slices to their bounded families without claiming family completion', () => {
    const registry = loadEnglandCoverageRegistry().registry
    const nineB = target09b()
    const nineC = target09c()

    assert.equal(nineB.target.id, 'ENG-BC-STRUCTURE-GROUND-MOISTURE-MATERIALS-2026-10-20')
    assert.equal(nineC.target.id, 'ENG-BC-DRAINAGE-WASTE-WATER-2026-10-21')

    for (const id of ['ENG-COV-A', 'ENG-COV-C', 'ENG-COV-D', 'ENG-COV-REG7']) {
      const entry = englandCoverageEntry(registry, id)
      assert.ok(entry, `Expected ${id}`)
      assert.equal(entry.implementationState, 'TARGET_SLICE_PARTIAL')
      assert.deepEqual(entry.representedTargetIds, [nineB.target.id])
      assert.match(entry.claimBoundary, /not|bounded|selected/i)
    }

    const h = englandCoverageEntry(registry, 'ENG-COV-H')
    assert.ok(h)
    assert.equal(h.implementationState, 'TARGET_SLICE_PARTIAL')
    assert.deepEqual(h.representedTargetIds, [nineC.target.id])
    assert.match(h.claimBoundary, /selected H1-H5|does not/i)
  })

  test('keeps RH-C5 as a selected Part K method rather than a deployment-family PASS', () => {
    const registry = loadEnglandCoverageRegistry().registry
    const k = englandCoverageEntry(registry, 'ENG-COV-K')

    assert.ok(k)
    assert.equal(k.implementationState, 'SELECTED_METHOD_ONLY')
    assert.deepEqual(k.representedTargetIds, [])
    assert.ok(k.selectedMethodRefs?.some((ref) => /RH-C5/.test(ref)))
    assert.ok(k.resolutionAuthorities.includes('NATIVE_BOUNDED_METHOD'))
    assert.match(k.claimBoundary, /not a generic Part K compliance result/i)
    assert.equal(Object.prototype.hasOwnProperty.call(k, 'result'), false)
  })

  test('unimplemented technical families remain visible and future-due rather than disappearing', () => {
    const registry = loadEnglandCoverageRegistry().registry
    for (const id of ['ENG-COV-B', 'ENG-COV-E', 'ENG-COV-F', 'ENG-COV-G', 'ENG-COV-L', 'ENG-COV-M', 'ENG-COV-O', 'ENG-COV-P', 'ENG-COV-Q', 'ENG-COV-R']) {
      const entry = englandCoverageEntry(registry, id)
      assert.ok(entry, `Expected ${id}`)
      assert.equal(entry.implementationState, 'NO_TARGET_SLICE')
      assert.equal(entry.defaultScreeningDisposition, 'FUTURE_DUE')
      assert.equal(entry.positiveCompatibilityBlockingWhenDue, true)
    }
  })

  test('conditional families never become not-applicable merely because applicability evidence is absent', () => {
    const registry = loadEnglandCoverageRegistry().registry
    for (const id of ['ENG-COV-D', 'ENG-COV-J', 'ENG-COV-S']) {
      const entry = englandCoverageEntry(registry, id)
      assert.ok(entry, `Expected ${id}`)
      assert.equal(entry.applicabilityClass, 'CONDITIONAL')
      assert.notEqual(entry.defaultScreeningDisposition, 'NOT_APPLICABLE_PROVED')
      assert.ok(entry.resolutionAuthorities.includes('NATIVE_APPLICABILITY_ONLY'))
    }
  })

  test('project-class exclusion is narrow, explicit and identity-bearing', () => {
    const registry = loadEnglandCoverageRegistry().registry
    const hrb = englandCoverageEntry(registry, 'ENG-COV-PROCESS-HRB')

    assert.ok(hrb)
    assert.equal(hrb.applicabilityClass, 'PROJECT_CLASS_EXCLUDED')
    assert.equal(hrb.defaultScreeningDisposition, 'NOT_APPLICABLE_PROVED')
    assert.equal(hrb.implementationState, 'PROJECT_CLASS_EXCLUDED')
    assert.equal(hrb.positiveCompatibilityBlockingWhenDue, false)
    assert.match(hrb.claimBoundary, /project-class-specific/i)
  })

  test('source/applicability selection is due now but does not discharge substantive technical families', () => {
    const registry = loadEnglandCoverageRegistry().registry
    const source = englandCoverageEntry(registry, 'ENG-COV-SOURCE-APPLICABILITY')

    assert.ok(source)
    assert.equal(source.defaultScreeningDisposition, 'DUE_NOW_REPRESENTED')
    assert.equal(source.implementationState, 'SOURCE_APPLICABILITY_SPINE')
    assert.ok(source.resolutionAuthorities.includes('STATUTORY_SOURCE_RECORD'))
    assert.match(source.claimBoundary, /does not discharge substantive technical requirements/i)
  })

  test('process families remain present while later certification stays future-due', () => {
    const registry = loadEnglandCoverageRegistry().registry
    for (const id of ['ENG-COV-PROCESS-CONTROL', 'ENG-COV-PROCESS-DUTYHOLDER', 'ENG-COV-PROCESS-COMPLETION']) {
      const entry = englandCoverageEntry(registry, id)
      assert.ok(entry, `Expected ${id}`)
      assert.equal(entry.applicabilityClass, 'PROCESS_CORE')
      assert.equal(entry.defaultScreeningDisposition, 'FUTURE_DUE')
      assert.equal(entry.implementationState, 'REGISTRY_ONLY')
      assert.ok(entry.resolutionAuthorities.includes('STATUTORY_PROCESS'))
    }
  })

  test('registry ordering is semantically irrelevant while profile/implementation semantics change identity', () => {
    const loaded = loadEnglandCoverageRegistry()
    const registry = loaded.registry
    const dir = mkdtempSync(join(tmpdir(), 'dpl09d-'))

    try {
      const reorderedPath = join(dir, 'reordered.json')
      writeFileSync(
        reorderedPath,
        JSON.stringify({
          ...registry,
          authoritySources: [...registry.authoritySources].reverse(),
          entries: [...registry.entries].reverse()
        })
      )
      const reordered = loadEnglandCoverageRegistry(reorderedPath)
      assert.equal(loaded.fingerprint, reordered.fingerprint)
      assert.equal(loaded.authoritySetFingerprint, reordered.authoritySetFingerprint)

      const changedPath = join(dir, 'changed.json')
      writeFileSync(
        changedPath,
        JSON.stringify({
          ...registry,
          entries: registry.entries.map((entry) =>
            entry.id === 'ENG-COV-L'
              ? { ...entry, defaultScreeningDisposition: 'DUE_CLASSIFICATION_UNRESOLVED' }
              : entry
          )
        })
      )
      const changed = loadEnglandCoverageRegistry(changedPath)
      assert.notEqual(loaded.fingerprint, changed.fingerprint)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  test('fails closed on missing/duplicate families and unknown coverage vocabulary', () => {
    const registry: EnglandCoverageRegistry = loadEnglandCoverageRegistry().registry
    const dir = mkdtempSync(join(tmpdir(), 'dpl09d-invalid-'))

    try {
      const duplicatePath = join(dir, 'duplicate.json')
      writeFileSync(duplicatePath, JSON.stringify({ ...registry, entries: [...registry.entries, registry.entries[0]] }))
      assert.throws(() => loadEnglandCoverageRegistry(duplicatePath), /Duplicate DPL-09D coverage id/)

      const missingPath = join(dir, 'missing.json')
      writeFileSync(
        missingPath,
        JSON.stringify({ ...registry, entries: registry.entries.filter((entry) => entry.id !== 'ENG-COV-B') })
      )
      assert.throws(() => loadEnglandCoverageRegistry(missingPath), /missing family ENG-COV-B/)

      const badApplicabilityPath = join(dir, 'bad-applicability.json')
      writeFileSync(
        badApplicabilityPath,
        JSON.stringify({
          ...registry,
          entries: registry.entries.map((entry) =>
            entry.id === 'ENG-COV-J' ? { ...entry, applicabilityClass: 'ASSUME_NOT_APPLICABLE' } : entry
          )
        })
      )
      assert.throws(() => loadEnglandCoverageRegistry(badApplicabilityPath), /Unsupported DPL-09D applicability class/)

      const badDispositionPath = join(dir, 'bad-disposition.json')
      writeFileSync(
        badDispositionPath,
        JSON.stringify({
          ...registry,
          entries: registry.entries.map((entry) =>
            entry.id === 'ENG-COV-B' ? { ...entry, defaultScreeningDisposition: 'PASS' } : entry
          )
        })
      )
      assert.throws(() => loadEnglandCoverageRegistry(badDispositionPath), /Unsupported DPL-09D screening disposition/)

      const badImplementationPath = join(dir, 'bad-implementation.json')
      writeFileSync(
        badImplementationPath,
        JSON.stringify({
          ...registry,
          entries: registry.entries.map((entry) =>
            entry.id === 'ENG-COV-B' ? { ...entry, implementationState: 'COMPLETE_COMPLIANCE' } : entry
          )
        })
      )
      assert.throws(() => loadEnglandCoverageRegistry(badImplementationPath), /Unsupported DPL-09D implementation state/)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  test('coverage registry carries no whole-site or family compliance result', () => {
    const registry = loadEnglandCoverageRegistry().registry
    assert.equal(Object.prototype.hasOwnProperty.call(registry, 'compatibility'), false)
    assert.equal(Object.prototype.hasOwnProperty.call(registry, 'deploymentConclusion'), false)
    assert.equal(registry.entries.some((entry) => Object.prototype.hasOwnProperty.call(entry, 'result')), false)
  })
})