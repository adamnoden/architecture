import { compareDplIdentityStrings, sha256DplSemanticFingerprint } from './identity-order.js'
import type { ReferenceHouseSource } from '../reference-house/model.js'
import { referenceHouseSourceFingerprint } from '../reference-house/identity.js'
import { evaluateCandidateConformance } from './conformance.js'
import {
  DPL12A_SCHEMA_VERSION,
  DPL12B_CANDIDATE_SCHEMA_VERSION,
  type ApplicabilityResolution,
  type CrossTargetEdge,
  type DeploymentCaseIdentityManifest,
  type DeploymentCaseInput,
  type DeploymentLedger,
  type DeploymentObligationLedgerEntry,
  type EvidenceItem,
  type MethodKind,
  type ObligationResult,
  type ProposalFacts,
  type RawObligation,
  type RawTargetSlice
} from './model.js'

const factIdPattern = /^[A-Za-z][A-Za-z0-9_]*$/

const canonicalEvidence = (items: readonly EvidenceItem[]): EvidenceItem[] =>
  [...items]
    .map((item) => ({
      ...item,
      dischargesObligationIds: item.dischargesObligationIds
        ? [...item.dischargesObligationIds].sort()
        : undefined,
      sourceRefs: item.sourceRefs ? [...item.sourceRefs].sort() : undefined
    }))
    .sort((a, b) => {
      const byId = compareDplIdentityStrings(a.id, b.id)
      if (byId) return byId
      return compareDplIdentityStrings(a.version, b.version)
    })

const requiredFactIds = (obligation: RawObligation): string[] =>
  (obligation.requiredInputs ?? []).filter((input) => factIdPattern.test(input)).sort()

const missingFacts = (factIds: readonly string[], facts: ProposalFacts): string[] =>
  factIds.filter((id) => facts[id] === undefined).sort()

const resolveApplicability = (
  obligation: RawObligation,
  facts: ProposalFacts
): ApplicabilityResolution => {
  const rule = obligation.deterministicApplicabilityRule
  if (rule) {
    const value = facts[rule.input]
    if (value === undefined) {
      return {
        state: 'UNRESOLVED',
        reason: `Applicability requires explicit fact ${rule.input}.`,
        missingFactIds: [rule.input]
      }
    }

    const outcome = value === true ? rule.true : value === false ? rule.false : rule.unknown
    if (outcome === 'APPLIES') {
      return { state: 'APPLIES', reason: `Fact ${rule.input} resolves applicability.`, missingFactIds: [] }
    }
    if (outcome === 'NOT_APPLICABLE') {
      return {
        state: 'NOT_APPLICABLE',
        reason: `Fact ${rule.input} resolves the obligation as not applicable.`,
        missingFactIds: []
      }
    }
    return {
      state: 'UNRESOLVED',
      reason: `Fact ${rule.input} does not resolve applicability.`,
      missingFactIds: []
    }
  }

  if (obligation.applicability.startsWith('APPLIES')) {
    return { state: 'APPLIES', reason: obligation.applicability, missingFactIds: [] }
  }

  if (obligation.id === 'LON-D6-PRIVATE-OUTSIDE-SPACE') {
    const localStatus = facts.localHigherStandardStatus
    if (localStatus === false || localStatus === 'NONE' || localStatus === 'NO_HIGHER_STANDARD') {
      return {
        state: 'APPLIES',
        reason: 'No higher local private-outside-space standard is admitted for this case.',
        missingFactIds: []
      }
    }
    if (localStatus === true || localStatus === 'HIGHER_STANDARD_APPLIES') {
      return {
        state: 'NOT_APPLICABLE',
        reason: 'A higher local private-outside-space standard is admitted and must be composed separately.',
        missingFactIds: []
      }
    }
    return {
      state: 'UNRESOLVED',
      reason: 'London baseline applicability depends on whether a higher local standard applies.',
      missingFactIds: ['localHigherStandardStatus']
    }
  }

  if (obligation.applicability.startsWith('CONDITIONAL')) {
    return {
      state: 'UNRESOLVED',
      reason: `Conditional applicability is not resolved by the admitted DPL-12A facts: ${obligation.applicability}.`,
      missingFactIds: missingFacts(requiredFactIds(obligation), facts)
    }
  }

  return {
    state: 'UNRESOLVED',
    reason: `Unsupported applicability expression: ${obligation.applicability}.`,
    missingFactIds: []
  }
}

const knownMethodKinds = new Set<MethodKind>([
  'NATIVE_DETERMINISTIC',
  'EXTERNAL_PROFESSIONAL_EVIDENCE',
  'EXTERNAL_EVIDENCE_AND_INSPECTION',
  'EXTERNAL_PLANNING_OR_ARCHITECTURAL_JUDGEMENT',
  'EXTERNAL_PLANNING_OR_INCLUSIVE_DESIGN_JUDGEMENT',
  'EXTERNAL_PLANNING_DETERMINATION'
])

const resolveMethodKind = (target: RawTargetSlice, methodId: string): MethodKind => {
  const method = target.methodClasses.find((candidate) => candidate.id === methodId)
  if (!method) return 'UNSUPPORTED'
  return knownMethodKinds.has(method.kind as MethodKind) ? (method.kind as MethodKind) : 'UNSUPPORTED'
}

const acceptedDischargeEvidence = (
  obligationId: string,
  evidence: readonly EvidenceItem[]
): EvidenceItem[] =>
  evidence.filter(
    (item) =>
      item.state === 'ACCEPTED' && item.dischargesObligationIds?.includes(obligationId) === true
  )

const numberFact = (facts: ProposalFacts, id: string): number | undefined => {
  const value = facts[id]
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

const integerFact = (facts: ProposalFacts, id: string): number | undefined => {
  const value = numberFact(facts, id)
  return value !== undefined && Number.isInteger(value) ? value : undefined
}

const evaluateLondonNumeric = (
  target: RawTargetSlice,
  obligation: RawObligation,
  facts: ProposalFacts
): { readonly result: ObligationResult; readonly reason: string } => {
  if (obligation.id === 'LON-D6-GIA-STORAGE') {
    const bedroomCount = integerFact(facts, 'bedroomCount')
    const bedspaceCount = integerFact(facts, 'bedspaceCount')
    const dwellingStoreys = integerFact(facts, 'dwellingStoreys')
    const gia = numberFact(facts, 'policyDefinedGIA')
    const storage = numberFact(facts, 'builtInStorageArea')

    if (
      bedroomCount === undefined ||
      bedspaceCount === undefined ||
      dwellingStoreys === undefined ||
      gia === undefined ||
      storage === undefined
    ) {
      return { result: 'UNRESOLVED', reason: 'Required D6 GIA/storage proposal facts are missing.' }
    }

    const row = target.spaceTable?.find(
      (candidate) =>
        candidate.bedrooms === bedroomCount &&
        candidate.bedspaces === bedspaceCount &&
        candidate.storeys === dwellingStoreys
    )
    if (!row) {
      return { result: 'UNSUPPORTED', reason: 'No admitted London Plan space-table row matches the proposal tuple.' }
    }

    const passes = gia >= row.minGIA && storage >= row.minBuiltInStorage
    return {
      result: passes ? 'PASS' : 'FAIL',
      reason: `D6 Table 3.1 requires GIA >= ${row.minGIA} m² and built-in storage >= ${row.minBuiltInStorage} m² for ${bedroomCount}b/${bedspaceCount}p/${dwellingStoreys}s; admitted proposal provides ${gia} m² and ${storage} m².`
    }
  }

  if (obligation.id === 'LON-D6-CEILING-HEIGHT') {
    const gia = numberFact(facts, 'policyDefinedGIA')
    const qualifyingArea = numberFact(facts, 'areaWithFinishedFloorToCeilingHeightAtLeast2_5m')
    if (gia === undefined || qualifyingArea === undefined || gia <= 0) {
      return { result: 'UNRESOLVED', reason: 'Required D6 ceiling-height proposal facts are missing.' }
    }
    const ratio = qualifyingArea / gia
    return {
      result: ratio >= 0.75 ? 'PASS' : 'FAIL',
      reason: `Qualifying 2.5 m finished-height coverage is ${(ratio * 100).toFixed(2)}%; D6 requires at least 75%.`
    }
  }

  if (obligation.id === 'LON-D6-PRIVATE-OUTSIDE-SPACE') {
    const people = integerFact(facts, 'bedspaceOrOccupantCount')
    const area = numberFact(facts, 'qualifyingPrivateOutdoorArea')
    const depth = numberFact(facts, 'minimumQualifyingDepth')
    const width = numberFact(facts, 'minimumQualifyingWidth')
    if (people === undefined || area === undefined || depth === undefined || width === undefined) {
      return { result: 'UNRESOLVED', reason: 'Required D6 private-outside-space proposal facts are missing.' }
    }
    const minimumArea = 5 + Math.max(0, people - 2)
    const passes = area >= minimumArea && depth >= 1.5 && width >= 1.5
    return {
      result: passes ? 'PASS' : 'FAIL',
      reason: `London baseline requires >= ${minimumArea} m² and >= 1.5 m minimum width/depth for ${people} people; admitted proposal provides ${area} m², ${width} m width and ${depth} m depth.`
    }
  }

  return {
    result: 'UNSUPPORTED',
    reason: `DPL-12A has no admitted native evaluator for ${obligation.id}.`
  }
}

const evaluateObligation = (
  target: RawTargetSlice,
  obligation: RawObligation,
  facts: ProposalFacts,
  evidence: readonly EvidenceItem[]
): Omit<DeploymentObligationLedgerEntry, 'targetId' | 'authorityClass'> => {
  if (!target.sourceSnapshots.some((source) => source.id === obligation.sourceSnapshot)) {
    throw new Error(`Obligation ${obligation.id} references missing source snapshot ${obligation.sourceSnapshot}.`)
  }

  const applicability = resolveApplicability(obligation, facts)
  const methodKind = resolveMethodKind(target, obligation.resolutionMethod)
  const requiredInputs = [...(obligation.requiredInputs ?? [])]
  const missingInputs = missingFacts(requiredFactIds(obligation), facts)
  const dischargeEvidence = acceptedDischargeEvidence(obligation.id, evidence)

  let result: ObligationResult
  let resultReason: string

  if (applicability.state === 'NOT_APPLICABLE') {
    result = 'NOT_APPLICABLE'
    resultReason = applicability.reason
  } else if (applicability.state === 'UNRESOLVED') {
    result = 'UNRESOLVED'
    resultReason = applicability.reason
  } else if (dischargeEvidence.length > 0) {
    result = 'EXTERNALLY_DISCHARGED'
    resultReason = `Accepted external evidence discharges this obligation: ${dischargeEvidence
      .map((item) => item.id)
      .sort()
      .join(', ')}.`
  } else if (methodKind === 'NATIVE_DETERMINISTIC') {
    const native = evaluateLondonNumeric(target, obligation, facts)
    result = native.result
    resultReason = native.reason
  } else if (
    methodKind === 'EXTERNAL_PLANNING_OR_ARCHITECTURAL_JUDGEMENT' ||
    methodKind === 'EXTERNAL_PLANNING_OR_INCLUSIVE_DESIGN_JUDGEMENT'
  ) {
    result = 'UNRESOLVED'
    resultReason = 'Planning/architectural judgement is required; DPL-12A does not convert judgement into a score.'
  } else if (methodKind === 'EXTERNAL_PLANNING_DETERMINATION') {
    result = 'UNRESOLVED'
    resultReason = 'External planning determination/assignment is required.'
  } else if (
    methodKind === 'EXTERNAL_PROFESSIONAL_EVIDENCE' ||
    methodKind === 'EXTERNAL_EVIDENCE_AND_INSPECTION'
  ) {
    result = 'UNRESOLVED'
    resultReason = 'Competent external evidence is required and no accepted discharging evidence is admitted.'
  } else {
    result = 'UNSUPPORTED'
    resultReason = `Resolution method ${obligation.resolutionMethod} is not supported by DPL-12A.`
  }

  return {
    obligationId: obligation.id,
    sourceSnapshotId: obligation.sourceSnapshot,
    sourceProvision: obligation.sourceProvision,
    title: obligation.title,
    methodId: obligation.resolutionMethod,
    methodKind,
    applicability,
    result,
    resultReason,
    requiredInputs,
    missingInputs,
    evidenceIds: dischargeEvidence.map((item) => item.id).sort(),
    crossTargetOutput: obligation.crossTargetOutput
  }
}

const crossTargetEdges = (
  targets: DeploymentCaseInput['targets'],
  facts: ProposalFacts
): CrossTargetEdge[] =>
  targets
    .flatMap(({ target }) =>
      target.obligations
        .filter((obligation) => obligation.crossTargetOutput)
        .map((obligation): CrossTargetEdge => {
          const category = facts.planningM4Category
          const resolved = category === 'M4(2)' || category === 'M4(3)'
          return {
            fromTargetId: target.id,
            fromObligationId: obligation.id,
            output: obligation.crossTargetOutput as string,
            state: resolved ? 'RESOLVED' : 'UNRESOLVED',
            value: resolved ? category : undefined,
            reason: resolved
              ? 'An explicit planning category assignment is admitted as an output fact; technical Part M compliance remains separate.'
              : 'No explicit planning M4 category assignment is admitted.'
          }
        })
    )
    .sort((a, b) => {
      const byTarget = compareDplIdentityStrings(a.fromTargetId, b.fromTargetId)
      return byTarget || compareDplIdentityStrings(a.fromObligationId, b.fromObligationId)
    })

const canonicalTargets = (targets: DeploymentCaseInput['targets']) =>
  [...targets].sort((a, b) => {
    const byAuthority = compareDplIdentityStrings(a.authorityClass, b.authorityClass)
    return byAuthority || compareDplIdentityStrings(a.target.id, b.target.id)
  })

const canonicalInterfaces = (interfaces: DeploymentCaseInput['interfaceContracts']) =>
  [...interfaces].sort((a, b) => compareDplIdentityStrings(a.id, b.id))

export const evaluateDeploymentCase = (
  input: DeploymentCaseInput,
  referenceHouseSource: ReferenceHouseSource
): DeploymentLedger => {
  const facts = input.proposalFacts ?? {}
  const evidence = canonicalEvidence(input.evidence ?? [])
  const targets = canonicalTargets(input.targets)
  const interfaceContracts = canonicalInterfaces(input.interfaceContracts)
  const currentReferenceHouseFingerprint = referenceHouseSourceFingerprint(referenceHouseSource)
  const candidateConformance = input.candidate
    ? evaluateCandidateConformance(input.candidate, referenceHouseSource)
    : undefined

  const identityManifest: DeploymentCaseIdentityManifest = {
    schemaVersion: DPL12A_SCHEMA_VERSION,
    referenceHouseSourceFingerprint: currentReferenceHouseFingerprint,
    assuranceProfile: input.assuranceProfile,
    site: {
      id: input.site.indexEntry.id,
      indexEntryFingerprint: input.site.indexEntryFingerprint,
      recordFingerprint: input.site.recordFingerprint
    },
    interfaceContracts,
    targets: targets.map(({ authorityClass, target }) => ({
      authorityClass,
      targetId: target.id,
      targetFingerprint: sha256DplSemanticFingerprint(target)
    })),
    ...(candidateConformance
      ? {
          candidate: {
            id: candidateConformance.candidate.id,
            revision: candidateConformance.candidate.revision,
            authoredSource: candidateConformance.candidate.authoredSource,
            candidateFingerprint: candidateConformance.candidate.fingerprint,
            referenceHouseSourceFingerprint: candidateConformance.candidate.referenceHouseSourceFingerprint,
            conformanceMethodVersion: DPL12B_CANDIDATE_SCHEMA_VERSION
          }
        }
      : {}),
    proposalFactsFingerprint: sha256DplSemanticFingerprint(facts),
    evidenceSetFingerprint: sha256DplSemanticFingerprint(evidence),
    methodVersion: DPL12A_SCHEMA_VERSION
  }

  const caseFingerprint = sha256DplSemanticFingerprint(identityManifest)

  const obligations = targets
    .flatMap(({ authorityClass, target }) =>
      target.obligations.map((obligation): DeploymentObligationLedgerEntry => ({
        targetId: target.id,
        authorityClass,
        ...evaluateObligation(target, obligation, facts, evidence)
      }))
    )
    .sort((a, b) => {
      const byTarget = compareDplIdentityStrings(a.targetId, b.targetId)
      return byTarget || compareDplIdentityStrings(a.obligationId, b.obligationId)
    })

  const edges = crossTargetEdges(targets, facts)
  const unresolvedInputs = [...new Set([
    ...input.site.indexEntry.decisionCriticalUnknowns.map((id) => `site.${id}`),
    ...obligations.flatMap((entry) => [
      ...entry.missingInputs.map((id) => `proposal.${id}`),
      ...entry.applicability.missingFactIds.map((id) => `proposal.${id}`)
    ]),
    ...(candidateConformance?.openClauseIds.map((id) => `candidateConformance.${id}`) ?? [])
  ])].sort()

  const resultManifest = {
    schemaVersion: DPL12A_SCHEMA_VERSION,
    caseFingerprint,
    siteId: input.site.indexEntry.id,
    targetComposition: targets.map(({ authorityClass, target }) => ({ authorityClass, targetId: target.id })),
    ...(candidateConformance ? { candidateConformance } : {}),
    obligations,
    crossTargetEdges: edges,
    unresolvedInputs,
    evidence,
    proofBoundary: {
      wholeSiteCompatibilityConclusion: 'NOT_IMPLEMENTED' as const,
      architecturalCandidateSelection: 'NOT_IMPLEMENTED' as const,
      routeExhaustion: 'NOT_IMPLEMENTED' as const
    }
  }

  return {
    schemaVersion: DPL12A_SCHEMA_VERSION,
    caseIdentity: {
      algorithm: 'sha256',
      fingerprint: caseFingerprint,
      manifest: identityManifest
    },
    site: {
      id: input.site.indexEntry.id,
      displayName: input.site.indexEntry.displayName,
      borough: input.site.indexEntry.borough,
      primaryIdentityBasis: input.site.indexEntry.primaryIdentityBasis,
      decisionCriticalUnknowns: [...input.site.indexEntry.decisionCriticalUnknowns].sort(),
      recordFingerprint: input.site.recordFingerprint
    },
    targetComposition: resultManifest.targetComposition,
    ...(candidateConformance ? { candidateConformance } : {}),
    obligations,
    crossTargetEdges: edges,
    unresolvedInputs,
    evidence,
    resultFingerprint: sha256DplSemanticFingerprint(resultManifest),
    proofBoundary: resultManifest.proofBoundary
  }
}
