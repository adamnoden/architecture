import assert from 'node:assert/strict'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, test } from 'node:test'
import { loadCanonicalReferenceSiteManifest } from './canonical.js'
import {
  expectedNonPlanningCoverageIds,
  loadNonPlanningCoverageRegistry,
  nonPlanningCoverageEntry,
  type NonPlanningCoverageRegistry
} from './nonplanning-coverage.js'

describe('DPL-11B non-planning SCREENING family coverage registry', () => {
  test('covers the complete controlled DPL-11 non-planning family universe exactly once', () => {
    const registry = loadNonPlanningCoverageRegistry().registry

    assert.equal(registry.assuranceProfile, 'SCREENING')
    assert.equal(registry.entries.length, expectedNonPlanningCoverageIds.length)
    assert.deepEqual(
      registry.entries.map((entry) => entry.id),
      [...expectedNonPlanningCoverageIds].sort((a, b) => a.localeCompare(b))
    )
  })

  test('all Reference Site claim mappings resolve to the controlled DPL-RS-01 claim register', () => {
    const registry = loadNonPlanningCoverageRegistry().registry
    const site = loadCanonicalReferenceSiteManifest()
    const claimIds = new Set(site.claims.map((claim) => claim.id))

    for (const entry of registry.entries) {
      for (const claimId of entry.referenceSiteClaimIds) {
        assert.ok(claimIds.has(claimId), `${entry.id} references unknown site claim ${claimId}`)
      }
    }
  })

  test('claim mappings are references only and preserve UNKNOWN / ASSUMED provenance rather than discharging families', () => {
    const registry = loadNonPlanningCoverageRegistry().registry
    const site = loadCanonicalReferenceSiteManifest()
    const claims = new Map(site.claims.map((claim) => [claim.id, claim]))

    const groundFamily = nonPlanningCoverageEntry(registry, 'DPL11-COV-GROUND-ENVIRONMENT')
    assert.ok(groundFamily)
    const ground = claims.get('RS-GROUND-01')
    const tree = claims.get('RS-TREE-01')
    assert.ok(ground)
    assert.ok(tree)
    assert.equal(ground.state, 'UNKNOWN')
    assert.equal(ground.basis, 'UNKNOWN')
    assert.equal(tree.state, 'AUTHORED')
    assert.equal(tree.basis, 'ASSUMED')
    assert.equal(Object.prototype.hasOwnProperty.call(groundFamily, 'result'), false)
    assert.equal(Object.prototype.hasOwnProperty.call(groundFamily, 'discharged'), false)

    const control = claims.get('RS-TITLE-CONTROL-01')
    assert.ok(control)
    assert.equal(control.state, 'AUTHORED')
    assert.equal(control.basis, 'ASSUMED')
    assert.match(
      nonPlanningCoverageEntry(registry, 'DPL11-COV-SITE-CONTROL')?.claimBoundary ?? '',
      /synthetic assumption.*not real title\/control evidence/i
    )
  })

  test('detailed title, utilities, sewer, ground and construction work remain visible as future-due families', () => {
    const registry = loadNonPlanningCoverageRegistry().registry
    for (const id of [
      'DPL11-COV-LEGAL-BOUNDARY-TITLE',
      'DPL11-COV-PRIVATE-RIGHTS',
      'DPL11-COV-NEIGHBOUR-PRIVATE-PROCESS',
      'DPL11-COV-SEWER-UNDERTAKER',
      'DPL11-COV-UTILITIES',
      'DPL11-COV-GROUND-ENVIRONMENT',
      'DPL11-COV-CONSTRUCTION-LOGISTICS'
    ]) {
      const entry = nonPlanningCoverageEntry(registry, id)
      assert.ok(entry, `Expected ${id}`)
      assert.equal(entry.defaultScreeningDisposition, 'FUTURE_DUE')
      assert.equal(entry.positiveCompatibilityBlockingWhenDue, true)
      assert.ok(entry.accelerationTriggers.length > 0)
    }
  })

  test('high-level site control, physical flood/water and access status are represented as due-now screening families', () => {
    const registry = loadNonPlanningCoverageRegistry().registry
    for (const id of [
      'DPL11-COV-SITE-CONTROL',
      'DPL11-COV-PHYSICAL-FLOOD-WATER',
      'DPL11-COV-ACCESS-STATUS'
    ]) {
      const entry = nonPlanningCoverageEntry(registry, id)
      assert.ok(entry, `Expected ${id}`)
      assert.equal(entry.defaultScreeningDisposition, 'DUE_NOW_REPRESENTED')
      assert.equal(entry.positiveCompatibilityBlockingWhenDue, true)
      assert.equal(entry.runtimeRepresentationState, 'SITE_CLAIM_REFERENCED')
    }
  })

  test('acceleration triggers are registry metadata and never self-activate without case facts', () => {
    const registry = loadNonPlanningCoverageRegistry().registry
    const ground = nonPlanningCoverageEntry(registry, 'DPL11-COV-GROUND-ENVIRONMENT')
    assert.ok(ground)
    assert.equal(ground.defaultScreeningDisposition, 'FUTURE_DUE')
    assert.ok(ground.accelerationTriggers.some((trigger) => /tree\/ground|mining|contamination/i.test(trigger)))
    assert.equal(Object.prototype.hasOwnProperty.call(ground, 'acceleratedDueNow'), false)
    assert.equal(Object.prototype.hasOwnProperty.call(ground, 'applicabilityResult'), false)
  })

  test('absence of evidence never becomes static NOT_APPLICABLE_PROVED', () => {
    const registry = loadNonPlanningCoverageRegistry().registry
    assert.equal(
      registry.entries.some((entry) => entry.defaultScreeningDisposition === 'NOT_APPLICABLE_PROVED'),
      false
    )
  })

  test('owner boundaries keep sewer, planning, technical and architectural interface authority separate', () => {
    const registry = loadNonPlanningCoverageRegistry().registry
    const sewer = nonPlanningCoverageEntry(registry, 'DPL11-COV-SEWER-UNDERTAKER')
    const ground = nonPlanningCoverageEntry(registry, 'DPL11-COV-GROUND-ENVIRONMENT')
    const access = nonPlanningCoverageEntry(registry, 'DPL11-COV-ACCESS-STATUS')

    assert.ok(sewer)
    assert.ok(ground)
    assert.ok(access)
    assert.match(sewer.ownerBoundaries.join(' '), /Part H.*DPL-09/i)
    assert.match(sewer.ownerBoundaries.join(' '), /DPL-08C/i)
    assert.match(ground.ownerBoundaries.join(' '), /DPL-09/i)
    assert.match(access.ownerBoundaries.join(' '), /DPL-08B/i)
    assert.match(access.ownerBoundaries.join(' '), /DPL-10/i)
  })

  test('registry ordering is semantically irrelevant while timing and resolution authority remain identity-bearing', () => {
    const loaded = loadNonPlanningCoverageRegistry()
    const registry = loaded.registry
    const dir = mkdtempSync(join(tmpdir(), 'dpl11b-'))

    try {
      const reorderedPath = join(dir, 'reordered.json')
      writeFileSync(
        reorderedPath,
        JSON.stringify({
          ...registry,
          authoritySources: [...registry.authoritySources].reverse(),
          entries: [...registry.entries].reverse().map((entry) => ({
            ...entry,
            resolutionAuthorities: [...entry.resolutionAuthorities].reverse(),
            referenceSiteClaimIds: [...entry.referenceSiteClaimIds].reverse(),
            ownerBoundaries: [...entry.ownerBoundaries].reverse(),
            accelerationTriggers: [...entry.accelerationTriggers].reverse()
          }))
        })
      )
      const reordered = loadNonPlanningCoverageRegistry(reorderedPath)
      assert.equal(loaded.fingerprint, reordered.fingerprint)
      assert.equal(loaded.authoritySetFingerprint, reordered.authoritySetFingerprint)

      const changedPath = join(dir, 'changed.json')
      writeFileSync(
        changedPath,
        JSON.stringify({
          ...registry,
          entries: registry.entries.map((entry) =>
            entry.id === 'DPL11-COV-UTILITIES'
              ? { ...entry, defaultScreeningDisposition: 'DUE_CLASSIFICATION_UNRESOLVED' }
              : entry
          )
        })
      )
      const changed = loadNonPlanningCoverageRegistry(changedPath)
      assert.notEqual(loaded.fingerprint, changed.fingerprint)

      const authorityChangedPath = join(dir, 'authority-changed.json')
      writeFileSync(
        authorityChangedPath,
        JSON.stringify({
          ...registry,
          entries: registry.entries.map((entry) =>
            entry.id === 'DPL11-COV-UTILITIES'
              ? { ...entry, resolutionAuthorities: ['SURVEY_EVIDENCE'] }
              : entry
          )
        })
      )
      const authorityChanged = loadNonPlanningCoverageRegistry(authorityChangedPath)
      assert.notEqual(loaded.fingerprint, authorityChanged.fingerprint)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  test('fails closed on duplicate/missing families and unknown coverage/resolution vocabulary', () => {
    const registry: NonPlanningCoverageRegistry = loadNonPlanningCoverageRegistry().registry
    const dir = mkdtempSync(join(tmpdir(), 'dpl11b-invalid-'))

    try {
      const duplicatePath = join(dir, 'duplicate.json')
      writeFileSync(duplicatePath, JSON.stringify({ ...registry, entries: [...registry.entries, registry.entries[0]] }))
      assert.throws(() => loadNonPlanningCoverageRegistry(duplicatePath), /Duplicate DPL-11B coverage id/)

      const missingPath = join(dir, 'missing.json')
      writeFileSync(
        missingPath,
        JSON.stringify({ ...registry, entries: registry.entries.filter((entry) => entry.id !== 'DPL11-COV-UTILITIES') })
      )
      assert.throws(() => loadNonPlanningCoverageRegistry(missingPath), /missing family DPL11-COV-UTILITIES/)

      const badDispositionPath = join(dir, 'bad-disposition.json')
      writeFileSync(
        badDispositionPath,
        JSON.stringify({
          ...registry,
          entries: registry.entries.map((entry) =>
            entry.id === 'DPL11-COV-UTILITIES' ? { ...entry, defaultScreeningDisposition: 'PASS' } : entry
          )
        })
      )
      assert.throws(() => loadNonPlanningCoverageRegistry(badDispositionPath), /Unsupported DPL-11B screening disposition/)

      const badAuthorityPath = join(dir, 'bad-authority.json')
      writeFileSync(
        badAuthorityPath,
        JSON.stringify({
          ...registry,
          entries: registry.entries.map((entry) =>
            entry.id === 'DPL11-COV-UTILITIES' ? { ...entry, resolutionAuthorities: ['COMPILER_DECIDES'] } : entry
          )
        })
      )
      assert.throws(() => loadNonPlanningCoverageRegistry(badAuthorityPath), /Unsupported DPL-11B resolution authority/)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  test('registry carries no legal/professional determination or whole-site conclusion', () => {
    const registry = loadNonPlanningCoverageRegistry().registry
    assert.equal(Object.prototype.hasOwnProperty.call(registry, 'compatibility'), false)
    assert.equal(Object.prototype.hasOwnProperty.call(registry, 'deploymentConclusion'), false)
    assert.equal(registry.entries.some((entry) => Object.prototype.hasOwnProperty.call(entry, 'result')), false)
    assert.equal(registry.entries.some((entry) => Object.prototype.hasOwnProperty.call(entry, 'discharged')), false)
  })
})
