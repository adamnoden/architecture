import { createHash } from 'node:crypto'

const canonicalValue = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(canonicalValue)

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, child]) => child !== undefined)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, child]) => [key, canonicalValue(child)])
    )
  }

  return value
}

export const stableJsonStringify = (value: unknown): string => {
  const serialized = JSON.stringify(canonicalValue(value))
  if (serialized === undefined) throw new Error('Cannot fingerprint an undefined root value.')
  return serialized
}

export const sha256SemanticFingerprint = (value: unknown): string =>
  createHash('sha256').update(stableJsonStringify(value)).digest('hex')
