import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { describe, test } from 'node:test'
import {
  controlledPlanningTargetIds,
  expectedPlanningCoverageIds,
  loadPlanningCoverageRegistry,
  planningCoverageEntry,
  type PlanningCoverageRegistry
} from './planning-coverage.js'

const readJson = (path: string): unknown => JSON.parse(readFileSync(resolve(process.cwd(), path), 'utf8')) as unknown

describe('DPL-10E planning SCREENING coverage registry', () => {
  test('covers the controlled 16-family DPL-10 planning universe exactly once', () => {
    const registry = loadPlanningCoverageRegistry().registry

    assert.equal(registry.jurisdictionContext, 'GREATER_LONDON')
    assert.equal(registry.assuranceProfile, 'SCREENING')
    assert.equal(registry.entries.length, 16)
    assert.deepEqual(
      registry.entries.map((entry) => entry.id),
      [...expectedPlanningCoverageIds].sort((a, b) => a.localeCompare(b))
    )
  })

  test('maps the current strategic target only as bounded partial planning coverage', () => {
    const registry = loadPlanningCoverageRegistry().registry
    const design = planningCoverageEntry(registry, 'DPL10-COV-STRATEGIC-DESIGN-CONTEXT-CAPACITY')
    const housing = planningCoverageEntry(registry, 'DPL10-COV-HOUSING-QUALITY-ACCESSIBILITY')

    assert.ok(design)
    assert.ok(housing)
    assert.equal(design.implementationState, 'STRATEGIC_TARGET_SLICE_PARTIAL')
    assert.equal(housing.implementationState, 'STRATEGIC_TARGET_SLICE_PARTIAL')
    assert.deepEqual(design.representedTargetIds, [controlledPlanningTargetIds[0]])
    assert.deepEqual(housing.representedTargetIds, [controlledPlanningTargetIds[0]])
    assert.match(design.claimBoundary, /selected|not establish|bounded/i)
    assert.equal(registry.entries.some((entry) => entry.implementationState === ('COMPLETE_PLANNING' as never)), false)
  })

  test('keeps Croydon and Bromley as bounded borough exemplars, never generic local completion', () => {
    const registry = loadPlanningCoverageRegistry().registry
    const localQuant = planningCoverageEntry(registry, 'DPL10-COV-LOCAL-QUANTITATIVE-POLICY')
    const localQual = planningCoverageEntry(registry, 'DPL10-COV-LOCAL-QUALITATIVE-EVIDENCE-POLICY')

    assert.ok(localQuant)
    assert.ok(localQual)
    for (const entry of [localQuant, localQual]) {
      assert.equal(entry.implementationState, 'BOROUGH_EXEMPLAR_PARTIAL')
      assert.ok(entry.representedTargetIds.includes(controlledPlanningTargetIds[1]))
      assert.ok(entry.representedTargetIds.includes(controlledPlanningTargetIds[2]))
      assert.equal(entry.defaultScreeningDisposition, 'DUE_CLASSIFICATION_UNRESOLVED')
      assert.match(entry.claimBoundary, /borough|local|not|example/i)
    }
  })

  test('makes the synthetic Reference Site no-borough state explicit', () => {
    const registry = loadPlanningCoverageRegistry().registry

    assert.equal(registry.canonicalFixture.siteId, 'DPL-RS-01')
    assert.equal(registry.canonicalFixture.localPlanningTargetState, 'NO_REAL_BOROUGH_ASSIGNED')
    assert.deepEqual(registry.canonicalFixture.localPlanningTargetIds, [])
    assert.equal(
      registry.entries.some((entry) => entry.representedTargetIds.some((id) => id.includes('DPL-RS-01'))),
      false
    )
  })

  test('maps heritage/noise/ecology claims without laundering ASSUMED or UNKNOWN into planning discharge', () => {
    const registry = loadPlanningCoverageRegistry().registry
    const raw = readJson(registry.canonicalFixture.siteManifestPath) as {
      claims: Array<{ id: string; basis: string; state: string }>
    }
    const claims = new Map(raw.claims.map((claim) => [claim.id, claim]))

    const heritage = planningCoverageEntry(registry, 'DPL10-COV-HERITAGE-DESIGNATION-SETTING')
    const noise = planningCoverageEntry(registry, 'DPL10-COV-AIR-QUALITY-NOISE-AGENT-OF-CHANGE')
    const ecology = planningCoverageEntry(registry, 'DPL10-COV-ECOLOGY-BIODIVERSITY-GREEN-INFRASTRUCTURE')

    assert.ok(heritage)
    assert.ok(noise)
    assert.ok(ecology)
    assert.ok(heritage.referenceSiteClaimIds.includes('RS-HERITAGE-01'))
    assert.ok(noise.referenceSiteClaimIds.includes('RS-NOISE-01'))
    assert.ok(ecology.referenceSiteClaimIds.includes('RS-ECO-01'))
    assert.equal(claims.get('RS-HERITAGE-01')?.basis, 'ASSUMED')
    assert.equal(claims.get('RS-HERITAGE-01')?.state, 'AUTHORED')
    assert.equal(claims.get('RS-NOISE-01')?.state, 'UNKNOWN')
    assert.equal(claims.get('RS-ECO-01')?.state, 'UNKNOWN')

    for (const entry of [heritage, noise, ecology]) {
      assert.equal(Object.prototype.hasOwnProperty.call(entry, 'result'), false)
      assert.equal(entry.defaultScreeningDisposition, 'FUTURE_DUE')
    }
  })

  test('preserves multi-owner site facts without transferring DPL-08/09/11 authority into planning', () => {
    const registry = loadPlanningCoverageRegistry().registry
    const neighbours = planningCoverageEntry(registry, 'DPL10-COV-NEIGHBOUR-AMENITY-PRIVACY-DAYLIGHT')
    const trees = planningCoverageEntry(registry, 'DPL10-COV-TREES-LANDSCAPE-URBAN-GREENING')
    const flood = planningCoverageEntry(registry, 'DPL10-COV-FLOOD-DRAINAGE-SUDS-PLANNING')
    const access = planningCoverageEntry(registry, 'DPL10-COV-TRANSPORT-ACCESS-HIGHWAY-PARKING')

    assert.ok(neighbours)
    assert.ok(trees)
    assert.ok(flood)
    assert.ok(access)
    assert.ok(neighbours.ownerBoundaries.some((boundary) => /DPL-11/.test(boundary)))
    assert.ok(trees.ownerBoundaries.some((boundary) => /DPL-11/.test(boundary)))
    assert.ok(flood.ownerBoundaries.some((boundary) => /DPL-09/.test(boundary)))
    assert.ok(flood.ownerBoundaries.some((boundary) => /DPL-08/.test(boundary)))
    assert.ok(access.ownerBoundaries.some((boundary) => /DPL-11/.test(boundary)))
    assert.ok(access.ownerBoundaries.some((boundary) => /DPL-08/.test(boundary)))
  })

  test('keeps emerging policy non-operative and judgement-led', () => {
    const registry = loadPlanningCoverageRegistry().registry
    const emerging = planningCoverageEntry(registry, 'DPL10-COV-EMERGING-POLICY-MATERIAL-WEIGHT')

    assert.ok(emerging)
    assert.deepEqual(emerging.sourceClasses, ['EMERGING_NON_OPERATIVE_POLICY'])
    assert.ok(emerging.resolutionClasses.includes('P5_QUALITATIVE_PLANNING_JUDGEMENT'))
    assert.equal(emerging.resolutionClasses.includes('P3_BOUNDED_QUANTITATIVE_POLICY'), false)
    assert.match(emerging.claimBoundary, /cannot assign scalar weight|cannot.*operative/i)
  })

  test('quarantines P6 statutory determination from every P1-P5 coverage path', () => {
    const registry = loadPlanningCoverageRegistry().registry
    const determination = planningCoverageEntry(registry, 'DPL10-COV-EXTERNAL-DETERMINATION-HISTORY-CONDITIONS')

    assert.ok(determination)
    assert.deepEqual(determination.resolutionClasses, ['P6_STATUTORY_DETERMINATION'])
    assert.equal(determination.implementationState, 'EXTERNAL_ONLY')
    assert.equal(
      registry.entries
        .filter((entry) => entry.id !== determination.id)
        .some((entry) => entry.resolutionClasses.includes('P6_STATUTORY_DETERMINATION')),
      false
    )
    assert.equal(Object.prototype.hasOwnProperty.call(registry, 'planningPermission'), false)
    assert.equal(Object.prototype.hasOwnProperty.call(registry, 'determination'), false)
  })

  test('registry ordering is identity-neutral while planning semantics are identity-bearing', () => {
    const loaded = loadPlanningCoverageRegistry()
    const registry = loaded.registry
    const dir = mkdtempSync(join(tmpdir(), 'dpl10e-'))

    try {
      const reorderedPath = join(dir, 'reordered.json')
      writeFileSync(
        reorderedPath,
        JSON.stringify({
          ...registry,
          authoritySources: [...registry.authoritySources].reverse(),
          entries: [...registry.entries].reverse().map((entry) => ({
            ...entry,
            sourceClasses: [...entry.sourceClasses].reverse(),
            accelerationTriggers: [...entry.accelerationTriggers].reverse(),
            resolutionClasses: [...entry.resolutionClasses].reverse(),
            representedTargetIds: [...entry.representedTargetIds].reverse(),
            referenceSiteClaimIds: [...entry.referenceSiteClaimIds].reverse(),
            ownerBoundaries: [...entry.ownerBoundaries].reverse()
          }))
        })
      )
      const reordered = loadPlanningCoverageRegistry(reorderedPath)
      assert.equal(loaded.fingerprint, reordered.fingerprint)
      assert.equal(loaded.authoritySetFingerprint, reordered.authoritySetFingerprint)
      assert.equal(loaded.canonicalSiteClaimSetFingerprint, reordered.canonicalSiteClaimSetFingerprint)
      assert.equal(loaded.targetIdentitySetFingerprint, reordered.targetIdentitySetFingerprint)

      const changedPath = join(dir, 'changed.json')
      writeFileSync(
        changedPath,
        JSON.stringify({
          ...registry,
          entries: registry.entries.map((entry) =>
            entry.id === 'DPL10-COV-HERITAGE-DESIGNATION-SETTING'
              ? { ...entry, defaultScreeningDisposition: 'DUE_CLASSIFICATION_UNRESOLVED' }
              : entry
          )
        })
      )
      const changed = loadPlanningCoverageRegistry(changedPath)
      assert.notEqual(loaded.fingerprint, changed.fingerprint)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  test('fails closed on missing/duplicate families and unknown planning vocabulary', () => {
    const registry: PlanningCoverageRegistry = loadPlanningCoverageRegistry().registry
    const dir = mkdtempSync(join(tmpdir(), 'dpl10e-invalid-'))

    try {
      const duplicatePath = join(dir, 'duplicate.json')
      writeFileSync(duplicatePath, JSON.stringify({ ...registry, entries: [...registry.entries, registry.entries[0]] }))
      assert.throws(() => loadPlanningCoverageRegistry(duplicatePath), /Duplicate DPL-10E coverage id/)

      const missingPath = join(dir, 'missing.json')
      writeFileSync(
        missingPath,
        JSON.stringify({ ...registry, entries: registry.entries.filter((entry) => entry.id !== expectedPlanningCoverageIds[5]) })
      )
      assert.throws(() => loadPlanningCoverageRegistry(missingPath), /missing family DPL10-COV-HERITAGE-DESIGNATION-SETTING/)

      const badSourcePath = join(dir, 'bad-source.json')
      writeFileSync(
        badSourcePath,
        JSON.stringify({
          ...registry,
          entries: registry.entries.map((entry) =>
            entry.id === expectedPlanningCoverageIds[5]
              ? { ...entry, sourceClasses: ['GENERIC_PLANNING'] }
              : entry
          )
        })
      )
      assert.throws(() => loadPlanningCoverageRegistry(badSourcePath), /Unsupported DPL-10E source class/)

      const badResolutionPath = join(dir, 'bad-resolution.json')
      writeFileSync(
        badResolutionPath,
        JSON.stringify({
          ...registry,
          entries: registry.entries.map((entry) =>
            entry.id === expectedPlanningCoverageIds[1]
              ? { ...entry, resolutionClasses: ['P7_PERMISSION_PREDICTION'] }
              : entry
          )
        })
      )
      assert.throws(() => loadPlanningCoverageRegistry(badResolutionPath), /Unsupported DPL-10E resolution class/)

      const badDispositionPath = join(dir, 'bad-disposition.json')
      writeFileSync(
        badDispositionPath,
        JSON.stringify({
          ...registry,
          entries: registry.entries.map((entry) =>
            entry.id === expectedPlanningCoverageIds[1]
              ? { ...entry, defaultScreeningDisposition: 'PASS' }
              : entry
          )
        })
      )
      assert.throws(() => loadPlanningCoverageRegistry(badDispositionPath), /Unsupported DPL-10E screening disposition/)

      const badImplementationPath = join(dir, 'bad-implementation.json')
      writeFileSync(
        badImplementationPath,
        JSON.stringify({
          ...registry,
          entries: registry.entries.map((entry) =>
            entry.id === expectedPlanningCoverageIds[1]
              ? { ...entry, implementationState: 'COMPLETE_PLANNING' }
              : entry
          )
        })
      )
      assert.throws(() => loadPlanningCoverageRegistry(badImplementationPath), /Unsupported DPL-10E implementation state/)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  test('rejects hidden borough assignment and mixed/native P6 authority', () => {
    const registry = loadPlanningCoverageRegistry().registry
    const dir = mkdtempSync(join(tmpdir(), 'dpl10e-boundary-'))

    try {
      const boroughPath = join(dir, 'borough.json')
      writeFileSync(
        boroughPath,
        JSON.stringify({
          ...registry,
          canonicalFixture: {
            ...registry.canonicalFixture,
            localPlanningTargetIds: [controlledPlanningTargetIds[1]]
          }
        })
      )
      assert.throws(() => loadPlanningCoverageRegistry(boroughPath), /cannot assign a local planning target/)

      const p6Path = join(dir, 'p6.json')
      writeFileSync(
        p6Path,
        JSON.stringify({
          ...registry,
          entries: registry.entries.map((entry) =>
            entry.id === expectedPlanningCoverageIds[1]
              ? { ...entry, resolutionClasses: [...entry.resolutionClasses, 'P6_STATUTORY_DETERMINATION'] }
              : entry
          )
        })
      )
      assert.throws(() => loadPlanningCoverageRegistry(p6Path), /P6 determination family/)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  test('coverage registry carries no whole-site or permission result', () => {
    const registry = loadPlanningCoverageRegistry().registry
    assert.equal(Object.prototype.hasOwnProperty.call(registry, 'compatibility'), false)
    assert.equal(Object.prototype.hasOwnProperty.call(registry, 'deploymentConclusion'), false)
    assert.equal(Object.prototype.hasOwnProperty.call(registry, 'planningPermission'), false)
    assert.equal(registry.entries.some((entry) => Object.prototype.hasOwnProperty.call(entry, 'result')), false)
  })
})
