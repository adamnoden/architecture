import { patternPublicationOrder } from '../project/patterns.js'

export type PublicationEntryKind =
  | 'preface'
  | 'front-matter'
  | 'part'
  | 'index'
  | 'method'
  | 'pattern'
  | 'strategy'
  | 'candidate'
  | 'reference-house'
  | 'back-matter'
  | 'primer'
  | 'smoke-fixture'

export type PublicationAdapter =
  | 'part-i-composite'
  | 'part-ii-composite'
  | 'part-v-wrapper'
  | 'pattern-index'
  | 'pattern-page'
  | 'reference-house-overview'
  | 'reference-house-page'
  | 'primer-principles'
  | 'primer-patterns'
  | 'primer-reference-house'

export interface PublicationEntry {
  id: string
  source: string
  title: string
  kind: PublicationEntryKind
  adapter?: PublicationAdapter
  patternId?: string
  smokeOnly?: boolean
}

/** @deprecated Use patternPublicationOrder from project/patterns.ts. */
export const canonicalPatternOrder = patternPublicationOrder

const pattern = (id: string, source: string, title: string): PublicationEntry => ({
  id: `pattern-${id.toLowerCase()}`,
  source: `docs/patterns/${source}`,
  title,
  kind: 'pattern',
  adapter: 'pattern-page',
  patternId: id
})

/** G1 compatibility slice. It is deliberately not the book manifest. */
export const smokePublicationEntries: readonly PublicationEntry[] = [
  {
    id: 'smoke-preface',
    source: 'docs/manuscript/preface.md',
    title: 'Preface',
    kind: 'preface'
  },
  {
    id: 'smoke-part-i',
    source: 'docs/manuscript/part-i.md',
    title: 'Part I — The Proposition',
    kind: 'part'
  },
  {
    id: 'smoke-principles',
    source: 'docs/manuscript/governing-principles.md',
    title: 'Governing Constitution',
    kind: 'part'
  },
  {
    id: 'smoke-repose',
    source: 'docs/manuscript/principle-08-repose.md',
    title: 'Principle 8 — Design for Repose',
    kind: 'part'
  },
  {
    id: 'smoke-pattern',
    source: 'docs/patterns/controlled-utility-entry.md',
    title: 'Controlled Utility Entry',
    kind: 'pattern',
    patternId: 'PAT-001'
  },
  {
    id: 'smoke-mermaid',
    source: 'README.md',
    title: 'Mermaid compatibility fixture',
    kind: 'smoke-fixture',
    smokeOnly: true
  }
] as const

/**
 * Primer order. The two authored edge sections are intentionally small;
 * doctrine, pattern definitions and Reference House claims are derived from
 * their canonical sources through deterministic adapters.
 */
export const primerPublicationEntries: readonly PublicationEntry[] = [
  {
    id: 'primer-proposition',
    source: 'publication/primer/proposition.md',
    title: 'The proposition',
    kind: 'primer'
  },
  {
    id: 'primer-principles',
    source: 'docs/manuscript/governing-principles.md',
    title: 'Governing constitution',
    kind: 'primer',
    adapter: 'primer-principles'
  },
  {
    id: 'primer-patterns',
    source: 'docs/patterns/README.md',
    title: 'From doctrine to patterns',
    kind: 'primer',
    adapter: 'primer-patterns'
  },
  {
    id: 'primer-reference-house',
    source: 'docs/reference-house/README.md',
    title: 'The Reference House',
    kind: 'primer',
    adapter: 'primer-reference-house'
  },
  {
    id: 'primer-outlook',
    source: 'publication/primer/outlook.md',
    title: 'Making and proving the platform',
    kind: 'primer'
  }
] as const

/**
 * Mechanical Working Edition order.
 * Editorial meaning remains owned by docs/manuscript/publication-architecture.md.
 */
export const publicationEntries: readonly PublicationEntry[] = [
  {
    id: 'preface',
    source: 'docs/manuscript/preface.md',
    title: 'Preface — The Obvious, Eventually',
    kind: 'preface'
  },
  {
    id: 'readers-guide',
    source: 'docs/manuscript/readers-guide.md',
    title: "Reader's Guide",
    kind: 'front-matter'
  },
  {
    id: 'part-i',
    source: 'docs/manuscript/part-i.md',
    title: 'Part I — The Proposition',
    kind: 'part',
    adapter: 'part-i-composite'
  },
  {
    id: 'part-ii',
    source: 'docs/manuscript/part-ii.md',
    title: 'Part II — Architecture of the Platform',
    kind: 'part',
    adapter: 'part-ii-composite'
  },
  {
    id: 'part-iii',
    source: 'publication/part-iii.md',
    title: 'Part III — Patterns and Generative Sequences',
    kind: 'part'
  },

  pattern('PAT-001', 'controlled-utility-entry.md', 'Controlled Utility Entry'),
  pattern('PAT-002', 'plant-room-service-hub.md', 'Plant Room as Service Hub'),
  pattern('PAT-014', 'accessible-vertical-service-zone.md', 'Accessible Vertical Service Zone'),
  pattern('PAT-003', 'coherent-horizontal-service-route.md', 'Coherent Horizontal Service Route'),
  pattern('PAT-015', 'accessible-room-service-route.md', 'Accessible Room Service Route'),
  pattern('PAT-004', 'high-service-room-service-wall.md', 'High-Service-Room Service Wall'),
  pattern('PAT-005', 'designed-structural-penetration.md', 'Designed Structural Penetration'),
  pattern('PAT-016', 'compartmented-service-void.md', 'Compartmented Service Void'),
  pattern('PAT-017', 'visible-leakage-path.md', 'Visible Leakage Path'),
  pattern('PAT-018', 'failure-tolerant-wet-service-room.md', 'Failure-Tolerant Wet Service Room'),
  pattern('PAT-009', 'accessible-rainwater-route.md', 'Accessible Rainwater Route'),
  pattern('PAT-007', 'permanent-opening-replaceable-window.md', 'Permanent Opening / Replaceable Window'),
  pattern('PAT-019', 'permanent-opening-replaceable-door.md', 'Permanent Opening / Replaceable Door'),
  pattern('PAT-020', 'designed-threshold.md', 'Designed Threshold'),
  pattern('PAT-008', 'movement-slip-junction.md', 'Movement / Slip Junction'),
  pattern('PAT-022', 'controlled-attachment-plane.md', 'Controlled Attachment Plane'),
  pattern('PAT-010', 'source-capture-kitchen-extract.md', 'Source-Capture Kitchen Extract'),
  pattern('PAT-021', 'source-capture-bathroom-extract.md', 'Source-Capture Bathroom Extract'),
  pattern('PAT-011', 'roof-maintenance-route.md', 'Roof Maintenance Route'),
  pattern('PAT-013', 'ground-supported-facade-access.md', 'Ground-Supported Façade Access'),
  pattern('PAT-012', 'physical-service-index.md', 'Physical Service Index'),

  {
    id: 'strategy-fail-safe-water',
    source: 'docs/patterns/strategies/fail-safe-water-distribution.md',
    title: 'Fail-Safe Water Distribution',
    kind: 'strategy'
  },
  {
    id: 'strategy-interface-functions',
    source: 'docs/patterns/strategies/decompose-structural-interface-functions.md',
    title: 'Decompose Structural Interface Functions',
    kind: 'strategy'
  },
  {
    id: 'strategy-floor-layers',
    source: 'docs/patterns/strategies/separate-structural-floor-changeable-layers.md',
    title: 'Separate Structural Floor from Changeable Layers',
    kind: 'strategy'
  },

  {
    id: 'candidate-lining',
    source: 'docs/patterns/candidates/replaceable-architectural-lining.md',
    title: 'Replaceable Architectural Lining',
    kind: 'candidate'
  },
  {
    id: 'candidate-manifold',
    source: 'docs/patterns/candidates/individually-isolatable-manifold-distribution.md',
    title: 'Individually Isolatable Manifold Distribution',
    kind: 'candidate'
  },
  {
    id: 'candidate-deep-zone',
    source: 'docs/patterns/candidates/local-deep-service-zone.md',
    title: 'Local Deep Service Zone',
    kind: 'candidate'
  },
  {
    id: 'candidate-floor-access',
    source: 'docs/patterns/candidates/selective-floor-access.md',
    title: 'Selective Floor Access',
    kind: 'candidate'
  },

  {
    id: 'part-iv',
    source: 'docs/manuscript/part-iv.md',
    title: 'Part IV — The Reference House: Design Proposition',
    kind: 'part'
  },

  {
    id: 'part-v',
    source: 'docs/manuscript/part-v.md',
    title: 'Part V — Making and Proving the Platform',
    kind: 'part'
  },
  {
    id: 'part-vi',
    source: 'docs/manuscript/part-vi.md',
    title: 'Part VI — The House',
    kind: 'part'
  },
  {
    id: 'evidence-and-precedent-notes',
    source: 'docs/manuscript/evidence-and-precedent-notes.md',
    title: 'Appendix A — Evidence and Precedent Notes',
    kind: 'back-matter'
  },
  {
    id: 'research-agenda',
    source: 'docs/manuscript/research-agenda.md',
    title: 'Appendix B — Research Agenda',
    kind: 'back-matter'
  },
  {
    id: 'reference-house-implementation-schedule',
    source: 'docs/manuscript/reference-house-implementation-schedule.md',
    title: 'Appendix C — Reference House Implementation Schedule',
    kind: 'back-matter'
  },
  {
    id: 'glossary',
    source: 'docs/manuscript/glossary.md',
    title: 'Appendix D — Glossary',
    kind: 'back-matter'
  },
  {
    id: 'sources-and-further-reading',
    source: 'docs/manuscript/sources-and-further-reading.md',
    title: 'Appendix E — Sources and Further Reading',
    kind: 'back-matter'
  }
] as const
