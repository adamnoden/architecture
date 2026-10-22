import assert from 'node:assert/strict'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, test } from 'node:test'
import {
  compileCanonicalReferenceSiteCase,
  createCanonicalReferenceSiteCandidate,
  loadCanonicalCoverageManifest,
  loadCanonicalInterfaces,
  loadCanonicalReferenceSiteManifest,
  loadCanonicalTargets,
  type CanonicalCoverageManifest,
  type ReferenceSiteManifest
} from './canonical.js'
import type { CandidateConformanceFinding, DeploymentCandidateInput } from './model.js'

describe('DPL-13A canonical Reference Site compile', () => {
  test('reproduces one exact synthetic canonical case deterministically', () => {
    const first = compileCanonicalReferenceSiteCase()
    const second = compileCanonicalReferenceSiteCase()

    assert.equal(first.schemaVersion, 'DPL-13A-1')
    assert.equal(first.site.manifest.siteId, 'DPL-RS-01')
    assert.equal(first.site.manifest.siteKind, 'SYNTHETIC_REFERENCE')
    assert.equal(first.site.manifest.manifestId, 'DPL-RS-01-SM-v0.1')
    assert.equal(first.canonicalCaseIdentity.fingerprint, second.canonicalCaseIdentity.fingerprint)
    assert.equal(first.site.fingerprint, second.site.fingerprint)
    assert.equal(first.authoredCandidate.fingerprint, second.authoredCandidate.fingerprint)
    assert.equal(first.coverage.fingerprint, second.coverage.fingerprint)
    assert.equal(first.deploymentLedger.caseIdentity.fingerprint, second.deploymentLedger.caseIdentity.fingerprint)
    assert.equal(first.resultFingerprint, second.resultFingerprint)
  })

  test('preserves all 29 frozen DPL-07 claims and keeps eleven explicit unknowns first-class', () => {
    const result = compileCanonicalReferenceSiteCase()

    assert.equal(result.site.manifest.claims.length, 29)
    assert.equal(result.site.authoredClaimIds.length, 18)
    assert.equal(result.site.unknownClaimIds.length, 11)
    assert.ok(result.site.unknownClaimIds.includes('RS-GROUND-01'))
    assert.ok(result.site.unknownClaimIds.includes('RS-SEWER-DETAIL-01'))
    assert.ok(result.site.unknownClaimIds.includes('RS-TITLE-DETAIL-01'))
    assert.ok(result.site.unknownClaimIds.includes('RS-FLOOD-01'))

    const ground = result.site.manifest.claims.find((claim) => claim.id === 'RS-GROUND-01')
    assert.ok(ground)
    assert.equal(ground.state, 'UNKNOWN')
    assert.equal(ground.basis, 'UNKNOWN')
    assert.equal(Object.prototype.hasOwnProperty.call(ground, 'value'), false)
  })

  test('uses the already-authored unmirrored 180° RH-V02 placement without compiler selection', () => {
    const result = compileCanonicalReferenceSiteCase()
    const candidate = result.authoredCandidate

    assert.deepEqual(candidate.input.variantSelections, ['RH-V02'])
    assert.equal(candidate.authoredPlacementClaimId, 'RS-HOUSE-XFORM-01')
    assert.equal(candidate.placement.referenceHouseHandedness, 'UNMIRRORED')
    assert.equal(candidate.placement.rotationDeg, 180)
    assert.deepEqual(candidate.placement.boundingBoxMm, {
      west: 3000,
      east: 15000,
      south: 14000,
      north: 24800
    })
    assert.equal(result.proofBoundary.architecturalCandidateSelection, 'NOT_IMPLEMENTED')

    const route = result.deploymentLedger.candidateConformance?.findings.find(
      (finding) => finding.clauseId === 'RH-V02'
    )
    assert.ok(route)
    assert.equal(route.result, 'CONFORMS')
  })

  test('the authored canonical candidate conforms on every currently native DPL-02 architectural clause', () => {
    const result = compileCanonicalReferenceSiteCase()
    const conformance = result.deploymentLedger.candidateConformance
    assert.ok(conformance)

    for (const clauseId of ['RH-I02', 'RH-PROT-01', 'RH-PROT-04', 'RH-PROT-06']) {
      const finding: CandidateConformanceFinding | undefined = conformance.findings.find(
        (item) => item.clauseId === clauseId
      )
      assert.ok(finding, `Expected ${clauseId}`)
      assert.equal(finding.result, 'CONFORMS')
    }
    assert.ok(conformance.openClauseIds.length > 0)
  })

  test('composes DPL-08B/C, DPL-09B/C and London strategic planning with no fabricated borough target', () => {
    const result = compileCanonicalReferenceSiteCase()
    const interfaces = result.canonicalCaseIdentity.manifest.interfaceIds
    const targets = result.canonicalCaseIdentity.manifest.targetIds

    assert.deepEqual(interfaces, [
      'DPL-08B-GROUND-DATUM-PLINTH-APPROACH',
      'DPL-08C-FOUL-SURFACE-SITE-WATER'
    ])
    assert.ok(targets.includes('ENG-BC-STRUCTURE-GROUND-MOISTURE-MATERIALS-2026-10-20'))
    assert.ok(targets.includes('ENG-BC-DRAINAGE-WASTE-WATER-2026-10-21'))
    assert.ok(targets.includes('LON-STRATEGIC-RESIDENTIAL-DESIGN-2021-2026-10-20'))
    assert.equal(targets.some((id) => /CROYDON|BROMLEY/i.test(id)), false)
    assert.equal(result.canonicalCaseIdentity.manifest.localBoroughTarget, 'NOT_ASSIGNED_SYNTHETIC_REFERENCE')
    assert.equal(result.deploymentLedger.site.borough, 'SYNTHETIC_REFERENCE_NO_BOROUGH')
  })

  test('coverage remains explicitly incomplete even while represented families are present', () => {
    const result = compileCanonicalReferenceSiteCase()
    const entries = result.coverage.manifest.entries

    assert.equal(result.coverage.manifest.assuranceProfile, 'SCREENING')
    assert.equal(result.coverage.manifest.coverageCompleteness, 'NOT_ESTABLISHED')
    assert.equal(result.coverage.manifest.conclusionReadiness, 'NOT_ESTABLISHED')
    assert.ok(entries.some((entry) => entry.id === 'COV-DPL11-TITLE-BOUNDARY'))
    assert.ok(entries.some((entry) => entry.id === 'COV-DPL11-SEWER-UNDERTAKER'))
    assert.ok(entries.some((entry) => entry.id === 'COV-ENGLAND-TARGET-COMPLETENESS'))
    assert.ok(entries.some((entry) => entry.id === 'COV-RH-CONFORMANCE-OPEN'))
    assert.ok(entries.some((entry) => entry.id === 'COV-ROUTE-EXHAUSTION'))
    assert.ok(entries.some((entry) => entry.classification === 'DUE_CLASSIFICATION_NOT_ESTABLISHED'))
    assert.ok(entries.some((entry) => entry.classification === 'FUTURE_DUE_WHERE_ESTABLISHED'))
  })

  test('whole-site conclusion authority remains visibly absent', () => {
    const result = compileCanonicalReferenceSiteCase()

    assert.deepEqual(result.proofBoundary, {
      wholeSiteCompatibilityConclusion: 'NOT_IMPLEMENTED',
      conclusionReadiness: 'NOT_ESTABLISHED',
      coverageCompleteness: 'NOT_ESTABLISHED',
      routeExhaustion: 'NOT_IMPLEMENTED',
      architecturalCandidateSelection: 'NOT_IMPLEMENTED',
      localBoroughTarget: 'NOT_ASSIGNED_SYNTHETIC_REFERENCE'
    })
    assert.equal(result.deploymentLedger.proofBoundary.wholeSiteCompatibilityConclusion, 'NOT_IMPLEMENTED')
    assert.equal(Object.prototype.hasOwnProperty.call(result, 'compatibility'), false)
    assert.equal(Object.prototype.hasOwnProperty.call(result, 'deploymentConclusion'), false)
    assert.equal(Object.prototype.hasOwnProperty.call(result, 'wholeSiteConclusion'), false)
  })

  test('semantically irrelevant claim, target and interface ordering does not change canonical identity', () => {
    const site = loadCanonicalReferenceSiteManifest()
    const first = compileCanonicalReferenceSiteCase({ siteManifest: site })
    const reorderedSite: ReferenceSiteManifest = {
      ...site,
      claims: [...site.claims].reverse()
    }
    const second = compileCanonicalReferenceSiteCase({
      siteManifest: reorderedSite,
      targets: [...loadCanonicalTargets()].reverse(),
      interfaces: [...loadCanonicalInterfaces()].reverse()
    })

    assert.equal(first.site.fingerprint, second.site.fingerprint)
    assert.equal(first.deploymentLedger.caseIdentity.fingerprint, second.deploymentLedger.caseIdentity.fingerprint)
    assert.equal(first.canonicalCaseIdentity.fingerprint, second.canonicalCaseIdentity.fingerprint)
    assert.equal(first.resultFingerprint, second.resultFingerprint)
  })

  test('coverage entry ordering is irrelevant but coverage scope changes invalidate canonical identity', () => {
    const coverage = loadCanonicalCoverageManifest()
    const reordered: CanonicalCoverageManifest = {
      ...coverage,
      entries: [...coverage.entries].reverse(),
      authoritySources: [...coverage.authoritySources].reverse()
    }
    const first = compileCanonicalReferenceSiteCase({ coverageManifest: coverage })
    const second = compileCanonicalReferenceSiteCase({ coverageManifest: reordered })
    assert.equal(first.coverage.fingerprint, second.coverage.fingerprint)
    assert.equal(first.canonicalCaseIdentity.fingerprint, second.canonicalCaseIdentity.fingerprint)

    const changed: CanonicalCoverageManifest = {
      ...coverage,
      entries: coverage.entries.map((entry) =>
        entry.id === 'COV-CLAIM-OBLIGATION-MAPPING'
          ? { ...entry, boundary: `${entry.boundary ?? ''} MATERIAL-SCOPE-CHANGE` }
          : entry
      )
    }
    const third = compileCanonicalReferenceSiteCase({ coverageManifest: changed })
    assert.notEqual(first.coverage.fingerprint, third.coverage.fingerprint)
    assert.notEqual(first.canonicalCaseIdentity.fingerprint, third.canonicalCaseIdentity.fingerprint)
    assert.notEqual(first.resultFingerprint, third.resultFingerprint)
  })

  test('changing a consequential Reference Site claim or its basis invalidates canonical case identity', () => {
    const site = loadCanonicalReferenceSiteManifest()
    const changed: ReferenceSiteManifest = {
      ...site,
      claims: site.claims.map((claim) =>
        claim.id === 'RS-STREET-01'
          ? { ...claim, basis: 'DERIVED_SITE_CLAIM' as const }
          : claim
      )
    }

    const first = compileCanonicalReferenceSiteCase({ siteManifest: site })
    const second = compileCanonicalReferenceSiteCase({ siteManifest: changed })
    assert.notEqual(first.site.fingerprint, second.site.fingerprint)
    assert.notEqual(first.canonicalCaseIdentity.fingerprint, second.canonicalCaseIdentity.fingerprint)
    assert.notEqual(first.resultFingerprint, second.resultFingerprint)
  })

  test('changing the authored placement invalidates canonical candidate/case identity without changing RH architecture', () => {
    const site = loadCanonicalReferenceSiteManifest()
    const first = compileCanonicalReferenceSiteCase({ siteManifest: site })
    const changedPlacement: ReferenceSiteManifest['housePlacement'] = {
      ...site.housePlacement,
      boundingBoxMm: {
        ...site.housePlacement.boundingBoxMm,
        west: site.housePlacement.boundingBoxMm.west + 100
      }
    }
    const second = compileCanonicalReferenceSiteCase({
      siteManifest: site,
      placement: changedPlacement
    })

    assert.notEqual(first.authoredCandidate.fingerprint, second.authoredCandidate.fingerprint)
    assert.equal(
      first.deploymentLedger.candidateConformance?.resultFingerprint,
      second.deploymentLedger.candidateConformance?.resultFingerprint
    )
    assert.notEqual(first.canonicalCaseIdentity.fingerprint, second.canonicalCaseIdentity.fingerprint)
  })

  test('a broken authored candidate remains a candidate-level finding and never becomes site incompatibility', () => {
    const canonical = createCanonicalReferenceSiteCandidate()
    const broken: DeploymentCandidateInput = {
      ...canonical.input,
      revision: 'broken-stair-proof',
      facts: {
        ...canonical.input.facts,
        stairGoingMm: 250
      }
    }
    const result = compileCanonicalReferenceSiteCase({ candidateInput: broken })
    const stair = result.deploymentLedger.candidateConformance?.findings.find(
      (finding) => finding.clauseId === 'RH-PROT-04'
    )

    assert.ok(stair)
    assert.equal(stair.result, 'REQUIRES_REFERENCE_HOUSE_REVISION')
    assert.equal(result.proofBoundary.wholeSiteCompatibilityConclusion, 'NOT_IMPLEMENTED')
    assert.equal(result.proofBoundary.routeExhaustion, 'NOT_IMPLEMENTED')
    assert.equal(Object.prototype.hasOwnProperty.call(result, 'incompatible'), false)
  })

  test('unknown claims are not laundered into proposal facts or false/zero defaults', () => {
    const result = compileCanonicalReferenceSiteCase()
    const unknowns = new Set(result.site.unknownClaimIds)

    assert.ok(unknowns.has('RS-GROUND-01'))
    assert.ok(unknowns.has('RS-FLOOD-01'))
    assert.ok(unknowns.has('RS-UTIL-CAP-01'))
    assert.equal(result.deploymentLedger.caseIdentity.manifest.proposalFactsFingerprint.length, 64)
    assert.equal(
      result.deploymentLedger.caseIdentity.manifest.proposalFactsFingerprint,
      compileCanonicalReferenceSiteCase().deploymentLedger.caseIdentity.manifest.proposalFactsFingerprint
    )
    assert.ok(result.coverage.manifest.entries.some((entry) => entry.id === 'COV-CLAIM-OBLIGATION-MAPPING'))
  })

  test('loaders fail closed on schema drift, duplicate claims and fabricated borough targets', () => {
    const dir = mkdtempSync(join(tmpdir(), 'dpl13a-'))
    try {
      const badSchemaPath = join(dir, 'bad-site.json')
      writeFileSync(badSchemaPath, JSON.stringify({ schemaVersion: 'dpl.referenceSiteManifest.v999' }))
      assert.throws(
        () => loadCanonicalReferenceSiteManifest(badSchemaPath),
        /Unsupported Reference Site manifest schema/
      )

      const site = loadCanonicalReferenceSiteManifest()
      const duplicatePath = join(dir, 'duplicate-site.json')
      writeFileSync(
        duplicatePath,
        JSON.stringify({ ...site, claims: [...site.claims, site.claims[0]] })
      )
      assert.throws(
        () => loadCanonicalReferenceSiteManifest(duplicatePath),
        /Duplicate Reference Site claim/
      )

      const coverage = loadCanonicalCoverageManifest()
      const badCoveragePath = join(dir, 'bad-coverage.json')
      writeFileSync(
        badCoveragePath,
        JSON.stringify({ ...coverage, coverageCompleteness: 'COMPLETE' })
      )
      assert.throws(
        () => loadCanonicalCoverageManifest(badCoveragePath),
        /must fail closed on completeness\/readiness/
      )
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }

    const croydonTarget = {
      authorityClass: 'LONDON_STRATEGIC_PLANNING' as const,
      target: {
        schemaVersion: 'test',
        id: 'CROYDON-FABRICATED-LOCAL-TARGET',
        methodClasses: [],
        sourceSnapshots: [],
        obligations: []
      }
    }
    assert.throws(
      () => compileCanonicalReferenceSiteCase({ targets: [...loadCanonicalTargets(), croydonTarget] }),
      /must not fabricate a local borough target/
    )
  })
})
