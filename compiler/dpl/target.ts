import type { RawTargetSlice } from './model.js'

const record = (value: unknown, label: string): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label} must be an object.`)
  return value as Record<string, unknown>
}

const string = (value: unknown, label: string): string => {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${label} must be a non-empty string.`)
  return value
}

const array = (value: unknown, label: string): unknown[] => {
  if (!Array.isArray(value)) throw new Error(`${label} must be an array.`)
  return value
}

const strings = (value: unknown, label: string): void => {
  array(value, label).forEach((item, index) => string(item, `${label}[${index}]`))
}

const uniqueRecords = (value: unknown, label: string): Record<string, unknown>[] => {
  const ids = new Set<string>()
  return array(value, label).map((entry, index) => {
    const item = record(entry, `${label}[${index}]`)
    const id = string(item.id, `${label}[${index}].id`)
    if (ids.has(id)) throw new Error(`${label} contains duplicate id ${id}.`)
    ids.add(id)
    return item
  })
}

/** Admit the fields the runtime consumes; retain extensible source metadata unchanged. */
export const validateTargetSlice = (value: unknown, path: string): RawTargetSlice => {
  const label = `Target ${path}`
  const target = record(value, label)
  if (!['dpl.englandTechnicalSlice.v1', 'dpl.londonStrategicPlanningSlice.v1'].includes(string(target.schemaVersion, `${label} schemaVersion`))) {
    throw new Error(`Unsupported DPL target schema ${String(target.schemaVersion)} at ${path}.`)
  }
  string(target.id, `${label} id`)
  const methods = uniqueRecords(target.methodClasses, `${label} methodClasses`)
  const sources = uniqueRecords(target.sourceSnapshots, `${label} sourceSnapshots`)
  const obligations = uniqueRecords(target.obligations, `${label} obligations`)
  for (const method of methods) string(method.kind, `${label} method ${method.id} kind`)
  const sourceIds = new Set(sources.map((source) => source.id))
  for (const item of obligations) {
    const owner = `${label} obligation ${item.id}`
    for (const field of ['sourceSnapshot', 'title', 'applicability', 'resolutionMethod']) string(item[field], `${owner} ${field}`)
    if (!sourceIds.has(item.sourceSnapshot)) throw new Error(`${owner} references missing source snapshot ${String(item.sourceSnapshot)}.`)
    // Unknown method IDs/kinds remain admissible: the evaluator reports UNSUPPORTED.
    if (item.requiredInputs !== undefined) strings(item.requiredInputs, `${owner} requiredInputs`)
    for (const field of ['sourceProvision', 'applicabilityMethod', 'deterministicRule', 'crossTargetOutput']) {
      if (item[field] !== undefined) string(item[field], `${owner} ${field}`)
    }
    if (item.deterministicApplicabilityRule !== undefined) {
      const rule = record(item.deterministicApplicabilityRule, `${owner} deterministicApplicabilityRule`)
      for (const field of ['input', 'true', 'false', 'unknown']) string(rule[field], `${owner} deterministicApplicabilityRule.${field}`)
    }
  }
  if (target.spaceTable !== undefined) {
    const tuples = new Set<string>()
    array(target.spaceTable, `${label} spaceTable`).forEach((value, index) => {
      const row = record(value, `${label} spaceTable[${index}]`)
      for (const field of ['bedrooms', 'bedspaces', 'storeys', 'minGIA', 'minBuiltInStorage', 'minGIAWithShowerInsteadOfBathroom']) {
        if (field === 'minGIAWithShowerInsteadOfBathroom' && row[field] === undefined) continue
        const n = row[field]
        if (typeof n !== 'number' || !Number.isFinite(n) || n < 0) throw new Error(`${label} spaceTable[${index}].${field} must be finite and non-negative.`)
        if (['bedrooms', 'bedspaces', 'storeys'].includes(field) && !Number.isInteger(n)) throw new Error(`${label} spaceTable[${index}].${field} must be an integer.`)
      }
      const tuple = `${row.bedrooms}/${row.bedspaces}/${row.storeys}`
      if (tuples.has(tuple)) throw new Error(`${label} spaceTable contains duplicate dwelling tuple ${tuple}.`)
      tuples.add(tuple)
    })
  }
  return target as unknown as RawTargetSlice
}
