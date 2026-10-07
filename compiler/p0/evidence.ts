import type {
  DependencyRef,
  DependencySnapshot,
  EvidenceRecord,
  EvidenceState,
  SourceModel
} from './model.js'

const stableValue = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(stableValue)
  if (!value || typeof value !== 'object') return value

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, child]) => [key, stableValue(child)])
  )
}

export const stableSerialize = (value: unknown): string => JSON.stringify(stableValue(value))

const readPath = (value: unknown, path?: string): unknown => {
  if (!path) return value

  return path.split('.').reduce<unknown>((current, segment) => {
    if (!current || typeof current !== 'object') return undefined
    return (current as Record<string, unknown>)[segment]
  }, value)
}

export const dependencyKey = (ref: DependencyRef): string =>
  `${ref.kind}:${ref.id}${ref.path ? `:${ref.path}` : ''}`

export const dependencyValue = (source: SourceModel, ref: DependencyRef): unknown => {
  if (ref.kind === 'target') {
    if (ref.id !== source.target.id) return undefined
    return readPath(source.target, ref.path)
  }

  if (ref.kind === 'entity') {
    return readPath(
      source.entities.find((entity) => entity.id === ref.id),
      ref.path
    )
  }

  return readPath(
    source.relationships.find((relationship) => relationship.id === ref.id),
    ref.path
  )
}

export const captureDependency = (source: SourceModel, ref: DependencyRef): DependencySnapshot => ({
  ...ref,
  value: stableValue(dependencyValue(source, ref))
})

export const evidenceState = (source: SourceModel, evidence: EvidenceRecord): EvidenceState => {
  const staleDependencies = evidence.dependencies
    .filter(
      (dependency) =>
        stableSerialize(dependencyValue(source, dependency)) !== stableSerialize(dependency.value)
    )
    .map(dependencyKey)
    .sort()

  return {
    id: evidence.id,
    current: staleDependencies.length === 0,
    staleDependencies
  }
}

export const evidenceStates = (source: SourceModel): EvidenceState[] =>
  source.evidence.map((evidence) => evidenceState(source, evidence)).sort((a, b) => a.id.localeCompare(b.id))
