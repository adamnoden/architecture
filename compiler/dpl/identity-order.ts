import { compareCanonicalStrings, sha256SemanticFingerprint } from '../core/identity.js'

// Existing DPL identity versions and their frozen evidence were authored with
// English collation. Freeze that contract instead of inheriting the process locale
// or silently changing accepted fingerprints to a different ordering algorithm.
// ICU remains part of this legacy contract; the frozen regressions detect drift
// during Node/ICU upgrades. New identity versions may choose code-unit order.
const legacyIdentityCollator = new Intl.Collator('en-US', {
  usage: 'sort',
  sensitivity: 'variant',
  ignorePunctuation: false,
  numeric: false,
  caseFirst: 'false'
})

/** Ambient-locale-independent DPL ordering with a total-order Unicode tie-break. */
export const compareDplIdentityStrings = (a: string, b: string): number =>
  legacyIdentityCollator.compare(a, b) || compareCanonicalStrings(a, b)

/** Preserve the existing DPL key-order contract as well as its set ordering. */
export const sha256DplSemanticFingerprint = (value: unknown): string =>
  sha256SemanticFingerprint(value, compareDplIdentityStrings)
