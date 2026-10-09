export type PublicationEntryKind =
  | 'preface'
  | 'part'
  | 'insert'
  | 'pattern'
  | 'smoke-fixture'

export interface PublicationEntry {
  source: string
  title: string
  kind: PublicationEntryKind
  smokeOnly?: boolean
}

/**
 * G1 renderer-compatibility slice only.
 *
 * This is deliberately not the book manifest. The final mechanical reading
 * order is admitted only after the renderer path passes G1 and is reconciled
 * against docs/manuscript/publication-architecture.md in G2.
 */
export const smokePublicationEntries: readonly PublicationEntry[] = [
  {
    source: 'docs/manuscript/preface.md',
    title: 'Preface',
    kind: 'preface'
  },
  {
    source: 'docs/manuscript/part-i.md',
    title: 'Part I — The Proposition',
    kind: 'part'
  },
  {
    source: 'docs/manuscript/governing-principles.md',
    title: 'Eleven Governing Principles',
    kind: 'insert'
  },
  {
    source: 'docs/manuscript/principle-08-repose.md',
    title: 'Principle 8 — Design for Repose',
    kind: 'insert'
  },
  {
    source: 'docs/patterns/controlled-utility-entry.md',
    title: 'HSA-P-001 — Controlled Utility Entry',
    kind: 'pattern'
  },
  {
    source: 'README.md',
    title: 'Mermaid compatibility fixture',
    kind: 'smoke-fixture',
    smokeOnly: true
  }
] as const
