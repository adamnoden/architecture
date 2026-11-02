import { sha256SemanticFingerprint } from '../core/identity.js'
import { referenceHouseSourceFingerprint } from '../reference-house/identity.js'
import type { ReferenceHouseSource } from '../reference-house/model.js'
import {
  DPL12B_CANDIDATE_SCHEMA_VERSION,
  type CandidateConformanceEvaluation,
  type CandidateConformanceFinding,
  type DeploymentCandidateInput
} from './model.js'

const nativeClauseIds = ['RH-I02', 'RH-PROT-01', 'RH-PROT-04', 'RH-PROT-06'] as const
const admittedVariantIds = ['RH-V01', 'RH-V02'] as const

const externallyClassifiedClauses = [
  ['RH-I01', 'IDENTITY_INVARIANT'],
  ['RH-I03', 'IDENTITY_INVARIANT'],
  ['RH-I04', 'IDENTITY_INVARIANT'],
  ['RH-I05', 'IDENTITY_INVARIANT'],
  ['RH-I06', 'IDENTITY_INVARIANT'],
  ['RH-I07', 'IDENTITY_INVARIANT'],
  ['RH-PROT-02', 'PROTECTED_ORDER'],
  ['RH-PROT-03', 'PROTECTED_ORDER'],
  ['RH-PROT-05', 'PROTECTED_ORDER'],
  ['RH-PROT-07', 'PROTECTED_ORDER'],
  ['RH-PROT-08', 'PROTECTED_ORDER'],
  ['RH-PROT-09', 'PROTECTED_ORDER'],
  ['RH-PROT-10', 'PROTECTED_ORDER'],
  ['RH-PROT-11', 'PROTECTED_ORDER'],
  ['RH-PROT-12', 'PROTECTED_ORDER'],
  ['RH-PROT-13', 'PROTECTED_ORDER'],
  ['RH-PROT-14', 'PROTECTED_ORDER'],
  ['RH-PROT-15', 'PROTECTED_ORDER']
] as const

const sortedUnique = <T extends string>(values: readonly T[] | undefined): T[] =>
  [...new Set(values ?? [])].sort((a, b) => a.localeCompare(b))

const canonicalCandidate = (candidate: DeploymentCandidateInput): DeploymentCandidateInput => ({
  ...candidate,
  authoredSource: { ...candidate.authoredSource },
  facts: {
    ...candidate.facts,
    stairFlightRiseGroups: candidate.facts.stairFlightRiseGroups
      ? [...candidate.facts.stairFlightRiseGroups]
      : undefined
  },
  variantSelections: sortedUnique(candidate.variantSelections),
  siteInterfaceResponseRefs: sortedUnique(candidate.siteInterfaceResponseRefs),
  implementationChoiceRefs: sortedUnique(candidate.implementationChoiceRefs)
})

const missing = (entries: readonly [string, unknown][]): string[] =>
  entries.filter(([, value]) => value === undefined).map(([id]) => id)

const sameNumbers = (left: readonly number[] | undefined, right: readonly number[]): boolean =>
  left !== undefined && left.length === right.length && left.every((value, index) => value === right[index])

const nativeFindings = (
  candidate: DeploymentCandidateInput,
  source: ReferenceHouseSource
): CandidateConformanceFinding[] => {
  const facts = candidate.facts
  const findings: CandidateConformanceFinding[] = []

  if (facts.courtyardOpenToSky === undefined) {
    findings.push({
      clauseId: 'RH-I02',
      conformanceClass: 'IDENTITY_INVARIANT',
      checkKind: 'NATIVE_FACT',
      result: 'OPEN',
      reason: 'Candidate does not provide the bounded open-to-sky courtyard fact required for native evaluation.'
    })
  } else {
    findings.push({
      clauseId: 'RH-I02',
      conformanceClass: 'IDENTITY_INVARIANT',
      checkKind: 'NATIVE_FACT',
      result: facts.courtyardOpenToSky ? 'CONFORMS' : 'NON_CONFORMING',
      reason: facts.courtyardOpenToSky
        ? 'Candidate explicitly preserves a genuine open-to-sky courtyard.'
        : 'Candidate removes/roofs the open-to-sky courtyard and therefore ceases to satisfy RH-I02.'
    })
  }

  const morphologyInputs: readonly [string, unknown][] = [
    ['shellWidthMm', facts.shellWidthMm],
    ['shellDepthMm', facts.shellDepthMm],
    ['courtyardWidthMm', facts.courtyardWidthMm],
    ['courtyardDepthMm', facts.courtyardDepthMm],
    ['courtyardPlacement', facts.courtyardPlacement],
    ['storeys', facts.storeys]
  ]
  const morphologyMissing = missing(morphologyInputs)
  if (morphologyMissing.length > 0) {
    findings.push({
      clauseId: 'RH-PROT-01',
      conformanceClass: 'PROTECTED_ORDER',
      checkKind: 'NATIVE_FACT',
      result: 'OPEN',
      reason: `Candidate is missing protected gross-morphology facts: ${morphologyMissing.join(', ')}.`
    })
  } else {
    const expectedCourt = source.court.value
    const matches =
      facts.shellWidthMm === Number(source.shell.width.value) &&
      facts.shellDepthMm === Number(source.shell.depth.value) &&
      facts.courtyardWidthMm === Number(expectedCourt.width) &&
      facts.courtyardDepthMm === Number(expectedCourt.depth) &&
      facts.courtyardPlacement === expectedCourt.placement &&
      facts.storeys === 2
    findings.push({
      clauseId: 'RH-PROT-01',
      conformanceClass: 'PROTECTED_ORDER',
      checkKind: 'NATIVE_FACT',
      result: matches ? 'CONFORMS' : 'REQUIRES_REFERENCE_HOUSE_REVISION',
      reason: matches
        ? 'Candidate preserves the controlled 12.0 m × 10.8 m shell, centred 3.6 m × 4.0 m courtyard and two-storey gross morphology.'
        : 'Candidate changes protected gross morphology; deployment cannot treat shell/courtyard/storey geometry as a free parameter.'
    })
  }

  const stairInputs: readonly [string, unknown][] = [
    ['stairRiserCount', facts.stairRiserCount],
    ['stairFlightRiseGroups', facts.stairFlightRiseGroups],
    ['stairGoingMm', facts.stairGoingMm]
  ]
  const stairMissing = missing(stairInputs)
  if (stairMissing.length > 0) {
    findings.push({
      clauseId: 'RH-PROT-04',
      conformanceClass: 'PROTECTED_ORDER',
      checkKind: 'NATIVE_FACT',
      result: 'OPEN',
      reason: `Candidate is missing protected stair facts: ${stairMissing.join(', ')}.`
    })
  } else {
    const expectedRise = source.stair.riseTopology.value
    const expectedGoing = source.stair.goingTopology.value
    const matches =
      facts.stairRiserCount === expectedRise.riserCount &&
      sameNumbers(facts.stairFlightRiseGroups, expectedRise.flightRiseGroups) &&
      facts.stairGoingMm === Number(expectedGoing.going)
    findings.push({
      clauseId: 'RH-PROT-04',
      conformanceClass: 'PROTECTED_ORDER',
      checkKind: 'NATIVE_FACT',
      result: matches ? 'CONFORMS' : 'REQUIRES_REFERENCE_HOUSE_REVISION',
      reason: matches
        ? 'Candidate preserves the controlled three-flight 18-riser / 300 mm-going stair topology represented by the Reference House source.'
        : 'Candidate changes the protected principal-stair topology/going and therefore requires an explicit Reference House rewind.'
    })
  }

  const frontInputs: readonly [string, unknown][] = [
    ['frontBayCount', facts.frontBayCount],
    ['frontBaySpacingMm', facts.frontBaySpacingMm],
    ['entranceBayIndex', facts.entranceBayIndex]
  ]
  const frontMissing = missing(frontInputs)
  if (frontMissing.length > 0) {
    findings.push({
      clauseId: 'RH-PROT-06',
      conformanceClass: 'PROTECTED_ORDER',
      checkKind: 'NATIVE_FACT',
      result: 'OPEN',
      reason: `Candidate is missing protected front-field facts: ${frontMissing.join(', ')}.`
    })
  } else {
    const front = source.frontField.value
    const canonicalEntrance = source.entranceBay.value.bayIndex
    const mirrored = candidate.variantSelections?.includes('RH-V01') === true
    const expectedEntrance = mirrored ? front.count + 1 - canonicalEntrance : canonicalEntrance
    const matches =
      facts.frontBayCount === front.count &&
      facts.frontBaySpacingMm === Number(front.spacing) &&
      facts.entranceBayIndex === expectedEntrance
    findings.push({
      clauseId: 'RH-PROT-06',
      conformanceClass: 'PROTECTED_ORDER',
      checkKind: 'NATIVE_FACT',
      result: matches ? 'CONFORMS' : 'REQUIRES_REFERENCE_HOUSE_REVISION',
      reason: matches
        ? mirrored
          ? 'Candidate preserves the controlled four-bay front field with the mirror-equivalent ranked entrance under admitted RH-V01.'
          : 'Candidate preserves the controlled four-bay front field and ranked off-centre entrance.'
        : 'Candidate changes protected front-field count/spacing/entrance order outside the admitted whole-house mirror route.'
    })
  }

  return findings
}

const openAuthorityFindings = (): CandidateConformanceFinding[] =>
  externallyClassifiedClauses.map(([clauseId, conformanceClass]) => ({
    clauseId,
    conformanceClass,
    checkKind: 'EXTERNAL_OR_UNMODELLED',
    result: 'OPEN',
    reason: 'DPL-02 classifies this clause, but DPL-12B has no controlled native representation sufficient to evaluate it. No conformance is inferred.'
  }))

const routeFindings = (candidate: DeploymentCandidateInput): CandidateConformanceFinding[] => [
  ...sortedUnique(candidate.variantSelections).map((clauseId): CandidateConformanceFinding => ({
    clauseId,
    conformanceClass: 'PERMITTED_DISCRETE_VARIANT',
    checkKind: 'ADMITTED_ROUTE',
    result: 'CONFORMS',
    reason:
      clauseId === 'RH-V01'
        ? 'DPL-02 explicitly admits a coherent whole-house left/right mirror. This finding admits the route; downstream checks still own coherence and target/site adequacy.'
        : 'DPL-02 explicitly admits rigid site translation/cardinal orientation. This finding admits the route; downstream checks still own site-role coherence and target/site adequacy.'
  })),
  ...sortedUnique(candidate.siteInterfaceResponseRefs).map((clauseId): CandidateConformanceFinding => ({
    clauseId,
    conformanceClass: 'SITE_INTERFACE_FREEDOM',
    checkKind: 'EXTERNAL_OR_UNMODELLED',
    result: 'OPEN',
    reason: 'The site-interface domain is licensed in principle, but this candidate response requires DPL-08/site evidence before the compiler can say it remains within the protected-house boundary.'
  })),
  ...sortedUnique(candidate.implementationChoiceRefs).map((clauseId): CandidateConformanceFinding => ({
    clauseId,
    conformanceClass: 'IMPLEMENTATION_FREEDOM',
    checkKind: 'EXTERNAL_OR_UNMODELLED',
    result: 'OPEN',
    reason: 'The implementation domain is licensed in principle, but technical/professional evidence remains outside DPL-12B native conformance proof.'
  }))
]

export const evaluateCandidateConformance = (
  candidateInput: DeploymentCandidateInput,
  source: ReferenceHouseSource
): CandidateConformanceEvaluation => {
  const candidate = canonicalCandidate(candidateInput)
  const candidateFingerprint = sha256SemanticFingerprint(candidate)
  const currentFingerprint = referenceHouseSourceFingerprint(source)
  const referenceRevisionMatches = candidate.referenceHouseSourceFingerprint === currentFingerprint

  let findings: CandidateConformanceFinding[]

  if (!referenceRevisionMatches) {
    findings = [{
      clauseId: 'RH-REVISION',
      conformanceClass: 'REFERENCE_REVISION',
      checkKind: 'REVISION_GUARD',
      result: 'OPEN',
      reason: 'Candidate references a different Reference House source fingerprint. DPL-12B refuses to evaluate it against the current revision by substitution.'
    }]
  } else {
    findings = [
      ...nativeFindings(candidate, source),
      ...routeFindings(candidate),
      ...openAuthorityFindings()
    ].sort((a, b) => {
      const byClause = a.clauseId.localeCompare(b.clauseId)
      return byClause || a.checkKind.localeCompare(b.checkKind)
    })
  }

  const executableClauseIds = referenceRevisionMatches
    ? [...nativeClauseIds, ...admittedVariantIds].sort()
    : []
  const openClauseIds = [...new Set(findings.filter((finding) => finding.result === 'OPEN').map((finding) => finding.clauseId))].sort()

  const resultManifest = {
    schemaVersion: DPL12B_CANDIDATE_SCHEMA_VERSION,
    candidateFingerprint,
    currentReferenceHouseSourceFingerprint: currentFingerprint,
    referenceRevisionMatches,
    executableClauseIds,
    openClauseIds,
    findings
  }

  return {
    schemaVersion: DPL12B_CANDIDATE_SCHEMA_VERSION,
    candidate: {
      id: candidate.id,
      revision: candidate.revision,
      authoredSource: candidate.authoredSource,
      fingerprint: candidateFingerprint,
      referenceHouseSourceFingerprint: candidate.referenceHouseSourceFingerprint
    },
    currentReferenceHouseSourceFingerprint: currentFingerprint,
    referenceRevisionMatches,
    executableClauseIds,
    openClauseIds,
    findings,
    resultFingerprint: sha256SemanticFingerprint(resultManifest)
  }
}
