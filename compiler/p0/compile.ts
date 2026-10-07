import { areAdjacent, boxesIntersect, containsBox, isBox2D, isValidBox, overlapArea } from './geometry.js'
import { dependencyValue, evidenceStates } from './evidence.js'
import { deriveObligations, resolveObligations } from './obligations.js'
import type {
  CompileResult,
  CompileStatus,
  Diagnostic,
  Entity,
  Obligation,
  SourceModel
} from './model.js'

const diagnostic = (
  code: string,
  status: CompileStatus,
  subjectIds: string[],
  message: string,
  severity: Diagnostic['severity'] = 'error'
): Diagnostic => ({ code, status, subjectIds: [...subjectIds].sort(), message, severity })

const duplicates = (ids: string[]): string[] =>
  [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))].sort()

const modelDiagnostics = (source: SourceModel): Diagnostic[] => {
  const diagnostics: Diagnostic[] = []
  const entityById = new Map(source.entities.map((entity) => [entity.id, entity]))

  for (const id of duplicates(source.entities.map((entity) => entity.id))) {
    diagnostics.push(diagnostic('DUPLICATE_ENTITY_ID', 'FAIL', [id], `Entity ID ${id} is duplicated.`))
  }

  for (const id of duplicates(source.relationships.map((relationship) => relationship.id))) {
    diagnostics.push(
      diagnostic('DUPLICATE_RELATIONSHIP_ID', 'FAIL', [id], `Relationship ID ${id} is duplicated.`)
    )
  }

  for (const entity of source.entities) {
    if (!entity.geometry) continue

    if (!source.target.supportedGeometryKinds.includes(entity.geometry.kind)) {
      diagnostics.push(
        diagnostic(
          'UNSUPPORTED_GEOMETRY',
          'UNSUPPORTED',
          [entity.id],
          `${entity.id} uses geometry kind ${entity.geometry.kind}, which target ${source.target.id}@${source.target.version} does not support.`,
          'warning'
        )
      )
      continue
    }

    if (isBox2D(entity.geometry) && !isValidBox(entity.geometry)) {
      diagnostics.push(
        diagnostic('INVALID_BOX_GEOMETRY', 'FAIL', [entity.id], `${entity.id} has invalid Box2D geometry.`)
      )
    }
  }

  for (const relationship of source.relationships) {
    const from = entityById.get(relationship.from)
    const to = entityById.get(relationship.to)

    if (!from || !to) {
      const missing = [!from ? relationship.from : null, !to ? relationship.to : null].filter(
        (id): id is string => Boolean(id)
      )
      diagnostics.push(
        diagnostic(
          'MISSING_RELATIONSHIP_ENDPOINT',
          'FAIL',
          [relationship.id, ...missing],
          `${relationship.id} references missing source entity ${missing.join(', ')}.`
        )
      )
      continue
    }

    if (
      relationship.type !== 'contains' &&
      from.levelId &&
      to.levelId &&
      from.levelId !== to.levelId
    ) {
      diagnostics.push(
        diagnostic(
          'LEVEL_MISMATCH',
          'FAIL',
          [relationship.id, from.id, to.id],
          `${relationship.id} relates ${from.id} on ${from.levelId} to ${to.id} on ${to.levelId}.`
        )
      )
    }

    if (relationship.type === 'contains' && isBox2D(from.geometry) && isBox2D(to.geometry)) {
      if (!containsBox(from.geometry, to.geometry)) {
        diagnostics.push(
          diagnostic(
            'CONTAINMENT_MISMATCH',
            'FAIL',
            [relationship.id, from.id, to.id],
            `${to.id} lies outside declared container ${from.id}.`
          )
        )
      }
    }

    if (relationship.type === 'adjacent-to' && isBox2D(from.geometry) && isBox2D(to.geometry)) {
      if (!areAdjacent(from.geometry, to.geometry)) {
        diagnostics.push(
          diagnostic(
            'FALSE_ADJACENCY',
            'FAIL',
            [relationship.id, from.id, to.id],
            `${from.id} and ${to.id} are declared adjacent but their Box2D geometry does not share an edge.`
          )
        )
      }
    }

    if (relationship.type === 'hosts') {
      if (from.type !== 'Wall' || (to.type !== 'Opening' && to.type !== 'Penetration')) {
        diagnostics.push(
          diagnostic(
            'INVALID_HOST_RELATION',
            'FAIL',
            [relationship.id, from.id, to.id],
            `${relationship.id} must run from a Wall to an Opening or Penetration.`
          )
        )
      } else if (isBox2D(from.geometry) && isBox2D(to.geometry) && !containsBox(from.geometry, to.geometry)) {
        diagnostics.push(
          diagnostic(
            'HOST_GEOMETRY_MISMATCH',
            'FAIL',
            [relationship.id, from.id, to.id],
            `${to.id} is hosted by ${from.id} but lies outside the host envelope.`
          )
        )
      }
    }

    if (relationship.type === 'crosses' && isBox2D(from.geometry) && isBox2D(to.geometry)) {
      if (!boxesIntersect(from.geometry, to.geometry)) {
        diagnostics.push(
          diagnostic(
            'CROSSING_GEOMETRY_MISMATCH',
            'FAIL',
            [relationship.id, from.id, to.id],
            `${from.id} is declared to cross ${to.id} but their Box2D geometry does not intersect.`
          )
        )
      }
    }
  }

  const spacesByLevel = new Map<string, Entity[]>()
  for (const entity of source.entities) {
    if (entity.type !== 'Space' || !entity.levelId || !isBox2D(entity.geometry)) continue
    const spaces = spacesByLevel.get(entity.levelId) ?? []
    spaces.push(entity)
    spacesByLevel.set(entity.levelId, spaces)
  }

  for (const [levelId, spaces] of spacesByLevel) {
    const ordered = [...spaces].sort((a, b) => a.id.localeCompare(b.id))
    for (let index = 0; index < ordered.length; index += 1) {
      for (let other = index + 1; other < ordered.length; other += 1) {
        const a = ordered[index]
        const b = ordered[other]
        if (!isBox2D(a.geometry) || !isBox2D(b.geometry)) continue
        if (overlapArea(a.geometry, b.geometry) <= 0) continue

        diagnostics.push(
          diagnostic(
            'SPACE_OVERLAP',
            'FAIL',
            [a.id, b.id],
            `${a.id} and ${b.id} overlap in area on ${levelId}.`
          )
        )
      }
    }
  }

  for (const relationship of source.relationships.filter((item) => item.type === 'crosses')) {
    const route = entityById.get(relationship.from)
    const wall = entityById.get(relationship.to)
    if (!route || !wall || route.type !== 'ServiceRoute' || wall.type !== 'Wall') continue

    const penetration = source.entities.find(
      (entity) =>
        entity.type === 'Penetration' &&
        source.relationships.some(
          (candidate) => candidate.type === 'hosts' && candidate.from === wall.id && candidate.to === entity.id
        ) &&
        source.relationships.some(
          (candidate) => candidate.type === 'carries' && candidate.from === entity.id && candidate.to === route.id
        )
    )

    if (!penetration) {
      diagnostics.push(
        diagnostic(
          'UNCONTROLLED_CROSSING',
          'FAIL',
          [relationship.id, route.id, wall.id],
          `${route.id} crosses ${wall.id} without an identified Penetration hosted by the wall and carrying the route.`
        )
      )
    }
  }

  return diagnostics
}

const requirementReferenceDiagnostics = (source: SourceModel): Diagnostic[] => {
  const ids = new Set(source.entities.map((entity) => entity.id))
  const diagnostics: Diagnostic[] = []

  for (const id of duplicates(source.requirements.map((requirement) => requirement.id))) {
    diagnostics.push(
      diagnostic('DUPLICATE_REQUIREMENT_ID', 'FAIL', [id], `Project requirement ID ${id} is duplicated.`)
    )
  }

  for (const requirement of source.requirements) {
    const missing = [requirement.from, requirement.to].filter((id) => !ids.has(id))
    if (!missing.length) continue

    diagnostics.push(
      diagnostic(
        'REQUIREMENT_MISSING_SUBJECT',
        'FAIL',
        [requirement.id, ...missing],
        `${requirement.id} references missing source entity ${missing.join(', ')}.`
      )
    )
  }

  return diagnostics
}

const evidenceDiagnostics = (source: SourceModel, obligations: Obligation[]): Diagnostic[] => {
  const diagnostics: Diagnostic[] = []
  const obligationKeys = new Set(obligations.map((obligation) => obligation.key))

  for (const id of duplicates(source.evidence.map((evidence) => evidence.id))) {
    diagnostics.push(diagnostic('DUPLICATE_EVIDENCE_ID', 'FAIL', [id], `Evidence ID ${id} is duplicated.`))
  }

  for (const evidence of source.evidence) {
    for (const dependency of evidence.dependencies) {
      if (dependencyValue(source, dependency) !== undefined) continue
      diagnostics.push(
        diagnostic(
          'EVIDENCE_MISSING_DEPENDENCY',
          'FAIL',
          [evidence.id, dependency.id],
          `${evidence.id} depends on missing ${dependency.kind} ${dependency.id}${dependency.path ? ` at ${dependency.path}` : ''}.`
        )
      )
    }

    for (const key of evidence.obligationKeys) {
      if (obligationKeys.has(key)) continue
      diagnostics.push(
        diagnostic(
          'EVIDENCE_UNKNOWN_OBLIGATION',
          'FAIL',
          [evidence.id],
          `${evidence.id} claims unsupported obligation key ${key}.`
        )
      )
    }
  }

  for (const state of evidenceStates(source)) {
    if (state.current) continue
    diagnostics.push(
      diagnostic(
        'EVIDENCE_STALE',
        'UNRESOLVED',
        [state.id],
        `${state.id} is stale because ${state.staleDependencies.join(', ')} changed.`,
        'warning'
      )
    )
  }

  return diagnostics
}

const aggregate = (statuses: CompileStatus[], empty: CompileStatus = 'PASS'): CompileStatus => {
  if (!statuses.length) return empty
  if (statuses.includes('FAIL')) return 'FAIL'
  if (statuses.includes('UNSUPPORTED')) return 'UNSUPPORTED'
  if (statuses.includes('UNRESOLVED')) return 'UNRESOLVED'
  if (statuses.includes('EXTERNALLY_DISCHARGED')) return 'EXTERNALLY_DISCHARGED'
  return 'PASS'
}

const sortedDiagnostics = (diagnostics: Diagnostic[]): Diagnostic[] =>
  [...diagnostics].sort((a, b) => {
    const byCode = a.code.localeCompare(b.code)
    if (byCode) return byCode
    const bySubjects = a.subjectIds.join('|').localeCompare(b.subjectIds.join('|'))
    if (bySubjects) return bySubjects
    return a.message.localeCompare(b.message)
  })

export const compile = (source: SourceModel): CompileResult => {
  const sourceDiagnostics = [...modelDiagnostics(source), ...requirementReferenceDiagnostics(source)]
  const rawObligations = deriveObligations(source)
  const obligations = resolveObligations(source, rawObligations)
  const evidenceIssues = evidenceDiagnostics(source, rawObligations)
  const diagnostics = sortedDiagnostics([...sourceDiagnostics, ...evidenceIssues])

  const modelStatus = sourceDiagnostics.some((item) => item.status === 'FAIL')
    ? 'FAIL'
    : sourceDiagnostics.some((item) => item.status === 'UNSUPPORTED')
      ? 'UNSUPPORTED'
      : 'PASS'

  const architecture = aggregate(
    obligations.filter((obligation) => obligation.dimension === 'architecture').map((item) => item.status)
  )
  const technical = aggregate(
    obligations.filter((obligation) => obligation.dimension === 'technical').map((item) => item.status)
  )
  const evidence = evidenceIssues.some((item) => item.status === 'FAIL')
    ? 'FAIL'
    : evidenceIssues.some((item) => item.status === 'UNRESOLVED')
      ? 'UNRESOLVED'
      : 'PASS'

  return {
    target: `${source.target.id}@${source.target.version}`,
    validity: {
      model: modelStatus,
      architecture,
      technical,
      evidence
    },
    obligations,
    evidence: evidenceStates(source),
    diagnostics
  }
}
