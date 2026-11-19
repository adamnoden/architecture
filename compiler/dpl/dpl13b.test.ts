import { sha256DplSemanticFingerprint } from './identity-order.js'
import assert from 'node:assert/strict'
import test from 'node:test'
import { loadCanonicalReferenceSiteManifest } from './canonical.js'
import { composeScreeningCoverageReadiness } from './coverage-readiness.js'
import { loadEnglandCoverageRegistry } from './england-coverage.js'
import { loadPlanningCoverageRegistry } from './planning-coverage.js'
import { loadWaveCBoroughTarget } from './wavec.js'

const clone = <T>(value: T): T => structuredClone(value)

test('DPL-13B canonical readiness result is deterministic and preserves the no-conclusion boundary', () => {
  const first = composeScreeningCoverageReadiness()
  const second = composeScreeningCoverageReadiness()

  assert.equal(first.resultFingerprint, second.resultFingerprint)
  assert.equal(first.identityFingerprint, second.identityFingerprint)
  assert.equal(first.assuranceProfile, 'SCREENING')
  assert.deepEqual(first.proofBoundary, {
    wholeSiteCompatibilityConclusion: 'NOT_IMPLEMENTED',
    substantiveConclusionAggregation: 'NOT_ADMITTED',
    routeExhaustion: 'NOT_IMPLEMENTED',
    architecturalCandidateSelection: 'NOT_IMPLEMENTED'
  })
})

test('DPL-13B canonical scope is complete but disposition remains unresolved pending opaque acceleration review', () => {
  const result = composeScreeningCoverageReadiness()
  assert.deepEqual(result.uncoveredClaimIds, [])
  assert.ok(result.dispositionCounts.ACCELERATION_REVIEW_REQUIRED > 0)
  assert.equal(result.profileUniverseState, 'PROFILE_DISPOSITION_UNRESOLVED')
  assert.equal(result.conclusionReadiness, 'NOT_READY_PROFILE_DISPOSITION_UNRESOLVED')
  assert.equal(result.proofBoundary.substantiveConclusionAggregation, 'NOT_ADMITTED')
})

test('DPL-13B composes exactly four controlled owner registries', () => {
  const result = composeScreeningCoverageReadiness()
  assert.deepEqual(result.ownerRegistries.map((owner) => owner.owner), [
    'REFERENCE_HOUSE',
    'ENGLAND',
    'PLANNING',
    'NON_PLANNING'
  ])
  assert.equal(new Set(result.ownerRegistries.map((owner) => owner.registryFingerprint)).size, 4)
})

test('DPL-13B preserves the direct DPL-08B owner of the authored absolute FFL datum', () => {
  const result = composeScreeningCoverageReadiness()
  const ffl = result.claimOwnership.find((entry) => entry.claimId === 'RS-FFL-01')
  assert.ok(ffl)
  assert.deepEqual(ffl.owners, ['SITE_INTERFACE'])
  assert.deepEqual(ffl.ownerEntryIds, ['SITE_INTERFACE:DPL-08B:GI-D02-DATUM'])
  assert.deepEqual(result.siteInterfaceClaimAuthorities, [{
    claimId: 'RS-FFL-01',
    owner: 'SITE_INTERFACE',
    authorityId: 'DPL-08B:GI-D02-DATUM',
    authoritySource: 'project/dpl/dpl-08b-ground-datum-plinth-approach-interface.md',
    claimBoundary: 'Owns the authored absolute site datum response only; does not prove ground, access, weathering, foundation or whole-site compatibility.'
  }])
})

test('DPL-13B preserves the repaired planning strategic/local authority graph', () => {
  const result = composeScreeningCoverageReadiness()
  assert.equal(result.planningAuthorityGraph.strategicTargetId, 'LON-STRATEGIC-RESIDENTIAL-DESIGN-2021-2026-10-20')
  assert.deepEqual(result.planningAuthorityGraph.localEdges.map((edge) => [edge.borough, edge.strategicTargetId]), [
    ['Bromley', 'LON-STRATEGIC-RESIDENTIAL-DESIGN-2021-2026-10-20'],
    ['Croydon', 'LON-STRATEGIC-RESIDENTIAL-DESIGN-2021-2026-10-20']
  ])
})

test('DPL-13B accounts for the complete 29-claim canonical site universe', () => {
  const result = composeScreeningCoverageReadiness()
  assert.equal(result.site.claimCount, 29)
  assert.equal(result.claimOwnership.length, 29)
  assert.deepEqual(result.uncoveredClaimIds, [])
})

test('DPL-13B keeps noise and ecology under planning coverage without treating mapping as discharge', () => {
  const result = composeScreeningCoverageReadiness()
  for (const claimId of ['RS-NOISE-01', 'RS-ECO-01']) {
    const claim = result.claimOwnership.find((entry) => entry.claimId === claimId)
    assert.ok(claim)
    assert.ok(claim.owners.includes('PLANNING'))
    const refs = result.normalizedCoverage.filter((entry) => entry.claimRefs.includes(claimId))
    assert.ok(refs.some((entry) => entry.owner === 'PLANNING'))
    assert.ok(refs.every((entry) => !('result' in entry.ownerSemantic)))
  }
})

test('DPL-13B preserves synthetic no-borough state', () => {
  const result = composeScreeningCoverageReadiness()
  assert.equal(result.site.localPlanningTargetState, 'NO_REAL_BOROUGH_ASSIGNED')
  assert.ok(!result.normalizedCoverage.some((entry) => entry.ownerEntryId.includes('CROYDON') || entry.ownerEntryId.includes('BROMLEY')))
})

test('DPL-13B reports a removed consequential claim mapping as an incomplete universe', () => {
  const planning = loadPlanningCoverageRegistry()
  const registry = {
    ...clone(planning.registry),
    entries: planning.registry.entries.map((entry) => entry.id === 'DPL10-COV-ECOLOGY-BIODIVERSITY-GREEN-INFRASTRUCTURE'
      ? { ...entry, referenceSiteClaimIds: entry.referenceSiteClaimIds.filter((id) => id !== 'RS-ECO-01') }
      : entry)
  }
  const mutated = {
    ...planning,
    registry,
    fingerprint: sha256DplSemanticFingerprint(registry)
  }

  const baseline = composeScreeningCoverageReadiness()
  const result = composeScreeningCoverageReadiness({ planning: mutated })
  assert.ok(result.uncoveredClaimIds.includes('RS-ECO-01'))
  assert.equal(result.profileUniverseState, 'PROFILE_UNIVERSE_INCOMPLETE')
  assert.equal(result.conclusionReadiness, 'NOT_READY_PROFILE_UNIVERSE_INCOMPLETE')
  assert.notEqual(result.resultFingerprint, baseline.resultFingerprint)
})

test('DPL-13B fails closed on a stale borough strategic-parent edge', () => {
  const bromley = loadWaveCBoroughTarget('Bromley')
  const croydon = loadWaveCBoroughTarget('Croydon')
  const target = clone(bromley.target) as unknown as Record<string, unknown>
  target.parentStrategicTargetId = 'STALE-STRATEGIC-ID'
  const staleBromley = {
    ...bromley,
    target: target as typeof bromley.target,
    targetFingerprint: sha256DplSemanticFingerprint(target)
  }

  assert.throws(
    () => composeScreeningCoverageReadiness({ boroughTargets: [staleBromley, croydon] }),
    /declares strategic parent STALE-STRATEGIC-ID/
  )
})

test('DPL-13B canonicalizes owner entry ordering', () => {
  const england = loadEnglandCoverageRegistry()
  const registry = { ...england.registry, entries: [...england.registry.entries].reverse() }
  const reordered = { ...england, registry }
  const baseline = composeScreeningCoverageReadiness()
  const result = composeScreeningCoverageReadiness({ england: reordered })
  assert.equal(result.identityFingerprint, baseline.identityFingerprint)
  assert.equal(result.resultFingerprint, baseline.resultFingerprint)
})

test('DPL-13B preserves owner semantics rather than flattening registry entries into PASS/FAIL', () => {
  const result = composeScreeningCoverageReadiness()
  const planning = result.normalizedCoverage.find((entry) => entry.owner === 'PLANNING')
  const england = result.normalizedCoverage.find((entry) => entry.owner === 'ENGLAND')
  const conformance = result.normalizedCoverage.find((entry) => entry.owner === 'REFERENCE_HOUSE')
  assert.ok(planning && 'resolutionClasses' in planning.ownerSemantic)
  assert.ok(england && 'implementationState' in england.ownerSemantic)
  assert.ok(conformance && 'conformanceClass' in conformance.ownerSemantic)
  assert.ok(!result.normalizedCoverage.some((entry) => 'PASS' in entry.ownerSemantic || 'FAIL' in entry.ownerSemantic))
})

test('DPL-13B preserves UNKNOWN and synthetic assumption provenance', () => {
  const site = loadCanonicalReferenceSiteManifest()
  const result = composeScreeningCoverageReadiness()
  assert.deepEqual(result.site.unknownClaimIds, site.claims.filter((claim) => claim.state === 'UNKNOWN').map((claim) => claim.id).sort())
  assert.deepEqual(
    result.site.assumedClaimIds,
    site.claims
      .filter((claim) => claim.basis === 'ASSUMED' || claim.basis === 'ASSUMED_DEPLOYMENT_DATUM')
      .map((claim) => claim.id)
      .sort()
  )
  for (const claim of result.claimOwnership.filter((entry) => entry.state === 'UNKNOWN')) assert.equal(claim.basis, 'UNKNOWN')
})

test('DPL-13B distinguishes profile disposition uncertainty from substantive UNRESOLVED', () => {
  const england = loadEnglandCoverageRegistry()
  const registry = {
    ...clone(england.registry),
    entries: england.registry.entries.map((entry, index) => index === 0
      ? { ...entry, defaultScreeningDisposition: 'DUE_CLASSIFICATION_UNRESOLVED' as const }
      : entry)
  }
  const mutated = { ...england, registry, fingerprint: sha256DplSemanticFingerprint(registry) }
  const result = composeScreeningCoverageReadiness({ england: mutated })
  assert.ok(result.normalizedCoverage.some((entry) => entry.normalizedDisposition === 'DUE_CLASSIFICATION_UNRESOLVED'))
  assert.equal(result.profileUniverseState, 'PROFILE_DISPOSITION_UNRESOLVED')
  assert.equal(result.conclusionReadiness, 'NOT_READY_PROFILE_DISPOSITION_UNRESOLVED')
  assert.equal(result.proofBoundary.wholeSiteCompatibilityConclusion, 'NOT_IMPLEMENTED')
})

test('DPL-13B never executes opaque acceleration prose', () => {
  const result = composeScreeningCoverageReadiness()
  const acceleration = result.normalizedCoverage.filter((entry) => entry.normalizedDisposition === 'ACCELERATION_REVIEW_REQUIRED')
  assert.ok(acceleration.length > 0)
  for (const entry of acceleration) {
    assert.equal(entry.ownerSemantic.triggerKind, 'OPAQUE_OWNER_METADATA_NOT_EXECUTED')
    assert.ok(!('triggerResult' in entry.ownerSemantic))
  }
})

test('DPL-13B identity changes with material registry/profile semantics', () => {
  const planning = loadPlanningCoverageRegistry()
  const first = planning.registry.entries[0]
  assert.ok(first)
  const changedDisposition = first.defaultScreeningDisposition === 'FUTURE_DUE'
    ? 'DUE_NOW_MISSING' as const
    : 'FUTURE_DUE' as const
  const registry = {
    ...clone(planning.registry),
    entries: planning.registry.entries.map((entry, index) => index === 0
      ? { ...entry, defaultScreeningDisposition: changedDisposition }
      : entry)
  }
  const mutated = { ...planning, registry, fingerprint: sha256DplSemanticFingerprint(registry) }
  const baseline = composeScreeningCoverageReadiness()
  const result = composeScreeningCoverageReadiness({ planning: mutated })
  assert.notEqual(result.identityFingerprint, baseline.identityFingerprint)
  assert.notEqual(result.resultFingerprint, baseline.resultFingerprint)
})

test('DPL-13B treats the site-interface claim bridge as identity-bearing authority', () => {
  const baseline = composeScreeningCoverageReadiness()
  const changed = composeScreeningCoverageReadiness({
    siteInterfaceClaimAuthorities: baseline.siteInterfaceClaimAuthorities.map((authority) => ({
      ...authority,
      authorityId: 'DPL-08B:GI-D02-DATUM-CHANGED'
    }))
  })
  assert.notEqual(changed.identityFingerprint, baseline.identityFingerprint)
  assert.notEqual(changed.resultFingerprint, baseline.resultFingerprint)
})
