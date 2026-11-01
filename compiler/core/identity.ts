import { createHash } from 'node:crypto'

type CanonicalValue = null | boolean | string | number | CanonicalValue[] | { [key: string]: CanonicalValue }

/** Total UTF-16 code-unit order. Never consult the host locale or ICU collation. */
export const compareCanonicalStrings = (a: string, b: string): number =>
  a < b ? -1 : a > b ? 1 : 0

const canonicalize = (value: unknown, compareKeys: (a: string, b: string) => number): { value: CanonicalValue; nonFinite: boolean } => {
  const ancestors = new Set<object>()
  let nonFinite = false
  const visit = (item: unknown): CanonicalValue => {
    if (item === null || typeof item === 'boolean' || typeof item === 'string') return item
    if (typeof item === 'number') {
      if (!Number.isFinite(item)) nonFinite = true
      return item
    }
    if (typeof item !== 'object') throw new Error(`Cannot fingerprint unsupported ${typeof item} value.`)
    if (ancestors.has(item)) throw new Error('Cannot fingerprint cyclic data.')
    if (!Array.isArray(item) && Object.getPrototypeOf(item) !== Object.prototype && Object.getPrototypeOf(item) !== null) {
      throw new Error('Cannot fingerprint a non-plain object; supply explicit semantic data.')
    }
    ancestors.add(item)
    try {
      if (Array.isArray(item)) return Array.from(item, visit)
      return Object.fromEntries(Object.entries(item)
        .filter(([, child]) => child !== undefined)
        .sort(([a], [b]) => compareKeys(a, b))
        .map(([key, child]) => [key, visit(child)]))
    } finally {
      ancestors.delete(item)
    }
  }
  return { value: visit(value), nonFinite }
}

/** Canonical JSON for finite plain data; absent object properties are omitted.
 * Non-index keys use code-unit order; integer-index keys retain JSON's ECMAScript
 * property order. Arrays and Unicode spelling remain authored, without normalization. */
export const stableJsonStringify = (value: unknown): string => {
  const canonical = canonicalize(value, compareCanonicalStrings)
  if (canonical.nonFinite) throw new Error('Non-finite numbers cannot be represented in canonical JSON.')
  return JSON.stringify(canonical.value)
}

// Tag the entire tree, not just exceptional leaves: authored objects cannot imitate
// a non-finite sentinel. Used only for diagnostic identities of invalid numeric input.
const numericFailureTree = (value: CanonicalValue): unknown => {
  if (value === null) return ['null']
  if (Array.isArray(value)) return ['array', value.map(numericFailureTree)]
  if (typeof value === 'object') return ['object', Object.entries(value).map(([key, child]) => [key, numericFailureTree(child)])]
  if (typeof value === 'number') return ['number', Number.isFinite(value) ? value : String(value)]
  return [typeof value, value]
}

/** Finite data hashes its canonical JSON bytes. Failed numeric inputs use a
 * disjoint hash domain so NaN/infinities never alias null or sentinel-shaped data. */
// A caller with an existing versioned identity may supply its explicitly fixed
// key-order contract. New identities use the locale/ICU-independent default.
export const sha256SemanticFingerprint = (
  value: unknown,
  compareKeys: (a: string, b: string) => number = compareCanonicalStrings
): string => {
  const canonical = canonicalize(value, compareKeys)
  const hash = createHash('sha256')
  if (canonical.nonFinite) {
    hash.update('HK-NONFINITE-1\0').update(JSON.stringify(numericFailureTree(canonical.value)))
  } else {
    hash.update(JSON.stringify(canonical.value))
  }
  return hash.digest('hex')
}
