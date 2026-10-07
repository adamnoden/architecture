import type {
  CompileResult,
  CompileStatus,
  ObligationAuthority,
  SourceModel
} from '../p0/model.js'

export interface CrosswalkFormalCommitment {
  requirementId: string
  status: CompileStatus
  authority: 'project'
  provenance: string
  subjectIds: string[]
  message: string
}

export interface CrosswalkTechnicalObligation {
  key: string
  status: CompileStatus
  authority: ObligationAuthority
  subjectIds: string[]
  evidenceIds: string[]
  message: string
}

export interface PatternCrosswalkReport {
  patternId: string
  scopeEntityIds: string[]
  formalCommitments: CrosswalkFormalCommitment[]
  inducedTechnicalObligations: CrosswalkTechnicalObligation[]
  architecturalJudgement: 'HUMAN_DETERMINATION'
}

export const buildPatternCrosswalkReport = (
  source: SourceModel,
  result: CompileResult,
  patternId: string,
  scopeEntityIds: string[]
): PatternCrosswalkReport => {
  const obligationByKey = new Map(result.obligations.map((obligation) => [obligation.key, obligation]))
  const scope = new Set(scopeEntityIds)

  const formalCommitments = source.requirements
    .filter((requirement) => requirement.provenance === patternId)
    .map((requirement): CrosswalkFormalCommitment => {
      const obligation = obligationByKey.get(`requirement:${requirement.id}`)
      if (!obligation) {
        throw new Error(`Missing compiled obligation for project requirement ${requirement.id}.`)
      }

      return {
        requirementId: requirement.id,
        status: obligation.status,
        authority: 'project',
        provenance: patternId,
        subjectIds: [...obligation.subjectIds],
        message: obligation.message
      }
    })
    .sort((a, b) => a.requirementId.localeCompare(b.requirementId))

  const inducedTechnicalObligations = result.obligations
    .filter((obligation) => obligation.dimension === 'technical')
    .filter((obligation) => obligation.subjectIds.some((id) => scope.has(id)))
    .map((obligation): CrosswalkTechnicalObligation => ({
      key: obligation.key,
      status: obligation.status,
      authority: obligation.authority,
      subjectIds: [...obligation.subjectIds],
      evidenceIds: [...obligation.evidenceIds],
      message: obligation.message
    }))
    .sort((a, b) => a.key.localeCompare(b.key))

  return {
    patternId,
    scopeEntityIds: [...scopeEntityIds].sort(),
    formalCommitments,
    inducedTechnicalObligations,
    architecturalJudgement: 'HUMAN_DETERMINATION'
  }
}
