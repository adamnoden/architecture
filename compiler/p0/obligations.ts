import { evidenceState } from './evidence.js'
import type {
  BoundaryRole,
  CompileStatus,
  Entity,
  Obligation,
  ObligationAuthority,
  SourceModel
} from './model.js'
import { boundaryRolesOf } from './model.js'

const boundaryAuthority = (role: BoundaryRole): ObligationAuthority =>
  role === 'fire' ? 'regulatory' : 'physical'

const relationshipExists = (
  source: SourceModel,
  type: string,
  from: string,
  to: string
): boolean =>
  source.relationships.some(
    (relationship) =>
      relationship.type === type && relationship.from === from && relationship.to === to
  )

const boundaryObligationsForHostedEntity = (
  source: SourceModel,
  subject: Entity,
  host: Entity
): Obligation[] =>
  boundaryRolesOf(host).map((role) => ({
    key: `boundary:${subject.id}:${role}`,
    code: 'BOUNDARY_CONTINUITY',
    dimension: 'technical',
    authority: boundaryAuthority(role),
    resolution: 'evidence',
    subjectIds: [subject.id, host.id],
    message: `${subject.id} interrupts the ${role} boundary carried by ${host.id}.`,
    status: 'UNRESOLVED',
    evidenceIds: []
  }))

export const deriveObligations = (source: SourceModel): Obligation[] => {
  const obligations: Obligation[] = []
  const entityById = new Map(source.entities.map((entity) => [entity.id, entity]))

  for (const requirement of source.requirements) {
    if (requirement.kind === 'relationship-present') {
      const present = relationshipExists(
        source,
        requirement.relationshipType,
        requirement.from,
        requirement.to
      )

      obligations.push({
        key: `requirement:${requirement.id}`,
        code: 'PROJECT_RELATIONSHIP_REQUIREMENT',
        dimension: 'architecture',
        authority: 'project',
        resolution: 'machine',
        subjectIds: [requirement.from, requirement.to],
        message: requirement.message,
        status: present ? 'PASS' : 'FAIL',
        evidenceIds: []
      })
    }
  }

  for (const relationship of source.relationships) {
    if (relationship.type !== 'hosts') continue

    const host = entityById.get(relationship.from)
    const subject = entityById.get(relationship.to)
    if (!host || !subject || host.type !== 'Wall') continue
    if (subject.type !== 'Opening' && subject.type !== 'Penetration') continue

    obligations.push(...boundaryObligationsForHostedEntity(source, subject, host))

    if (subject.type === 'Penetration' && host.attributes?.structural === true) {
      obligations.push({
        key: `structural:${subject.id}:${host.id}`,
        code: 'STRUCTURAL_PENETRATION',
        dimension: 'technical',
        authority: 'physical',
        resolution: 'evidence',
        subjectIds: [subject.id, host.id],
        message: `${subject.id} requires structural adequacy evidence for its opening through ${host.id}.`,
        status: 'UNRESOLVED',
        evidenceIds: []
      })
    }
  }

  return obligations.sort((a, b) => a.key.localeCompare(b.key))
}

const resolvedStatus = (
  source: SourceModel,
  obligation: Obligation
): { status: CompileStatus; evidenceIds: string[] } => {
  if (obligation.resolution === 'machine') {
    return { status: obligation.status, evidenceIds: [] }
  }

  const candidates = source.evidence
    .filter((evidence) => evidence.obligationKeys.includes(obligation.key))
    .filter((evidence) => obligation.subjectIds.every((id) => evidence.subjectIds.includes(id)))
    .filter((evidence) => evidenceState(source, evidence).current)
    .sort((a, b) => a.id.localeCompare(b.id))

  const failed = candidates.filter((evidence) => evidence.result === 'fail')
  if (failed.length) {
    return { status: 'FAIL', evidenceIds: failed.map((evidence) => evidence.id) }
  }

  const passed = candidates.filter((evidence) => evidence.result === 'pass')
  if (!passed.length) {
    return { status: 'UNRESOLVED', evidenceIds: [] }
  }

  const nonExternal = passed.filter((evidence) => evidence.resolver !== 'external-determination')
  if (nonExternal.length) {
    return { status: 'PASS', evidenceIds: nonExternal.map((evidence) => evidence.id) }
  }

  return {
    status: 'EXTERNALLY_DISCHARGED',
    evidenceIds: passed.map((evidence) => evidence.id)
  }
}

export const resolveObligations = (source: SourceModel, obligations: Obligation[]): Obligation[] =>
  obligations
    .map((obligation) => ({
      ...obligation,
      ...resolvedStatus(source, obligation)
    }))
    .sort((a, b) => a.key.localeCompare(b.key))
