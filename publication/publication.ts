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
  | 'smoke-fixture'

export type PublicationAdapter =
  | 'part-i-composite'
  | 'part-ii-composite'
  | 'part-v-wrapper'
  | 'pattern-index'
  | 'pattern-page'
  | 'reference-house-overview'
  | 'reference-house-page'

export interface PublicationEntry {
  id: string
  source: string
  title: string
  kind: PublicationEntryKind
  adapter?: PublicationAdapter
  patternId?: string
  smokeOnly?: boolean
}

export const canonicalPatternOrder = [
  'HSA-P-001',
  'HSA-P-002',
  'HSA-P-014',
  'HSA-P-003',
  'HSA-P-015',
  'HSA-P-004',
  'HSA-P-005',
  'HSA-P-016',
  'HSA-P-017',
  'HSA-P-018',
  'HSA-P-009',
  'HSA-P-007',
  'HSA-P-019',
  'HSA-P-020',
  'HSA-P-008',
  'HSA-P-022',
  'HSA-P-010',
  'HSA-P-021',
  'HSA-P-011',
  'HSA-P-013',
  'HSA-P-012'
] as const

const pattern = (id: string, source: string, title: string): PublicationEntry => ({
  id: `pattern-${id.toLowerCase()}`,
  source: `docs/patterns/${source}`,
  title: `${id} — ${title}`,
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
    title: 'Eleven Governing Principles',
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
    title: 'HSA-P-001 — Controlled Utility Entry',
    kind: 'pattern',
    patternId: 'HSA-P-001'
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
    id: 'part-iii-index',
    source: 'docs/patterns/README.md',
    title: 'Part III — Pattern Language',
    kind: 'index',
    adapter: 'pattern-index'
  },
  {
    id: 'pattern-language-model',
    source: 'docs/patterns/language-model.md',
    title: 'Pattern Language — Model and Authoring Contract',
    kind: 'method'
  },
  {
    id: 'service-topology-sequence',
    source: 'docs/patterns/service-topology-sequence.md',
    title: 'Service Topology — Generative Sequence',
    kind: 'method'
  },

  pattern('HSA-P-001', 'controlled-utility-entry.md', 'Controlled Utility Entry'),
  pattern('HSA-P-002', 'plant-room-service-hub.md', 'Plant Room as Service Hub'),
  pattern('HSA-P-014', 'accessible-vertical-service-zone.md', 'Accessible Vertical Service Zone'),
  pattern('HSA-P-003', 'coherent-horizontal-service-route.md', 'Coherent Horizontal Service Route'),
  pattern('HSA-P-015', 'accessible-room-service-route.md', 'Accessible Room Service Route'),
  pattern('HSA-P-004', 'high-service-room-service-wall.md', 'High-Service-Room Service Wall'),
  pattern('HSA-P-005', 'designed-structural-penetration.md', 'Designed Structural Penetration'),
  pattern('HSA-P-016', 'compartmented-service-void.md', 'Compartmented Service Void'),
  pattern('HSA-P-017', 'visible-leakage-path.md', 'Visible Leakage Path'),
  pattern('HSA-P-018', 'failure-tolerant-wet-service-room.md', 'Failure-Tolerant Wet Service Room'),
  pattern('HSA-P-009', 'accessible-rainwater-route.md', 'Accessible Rainwater Route'),
  pattern('HSA-P-007', 'permanent-opening-replaceable-window.md', 'Permanent Opening / Replaceable Window'),
  pattern('HSA-P-019', 'permanent-opening-replaceable-door.md', 'Permanent Opening / Replaceable Door'),
  pattern('HSA-P-020', 'designed-threshold.md', 'Designed Threshold'),
  pattern('HSA-P-008', 'movement-slip-junction.md', 'Movement / Slip Junction'),
  pattern('HSA-P-022', 'controlled-attachment-plane.md', 'Controlled Attachment Plane'),
  pattern('HSA-P-010', 'source-capture-kitchen-extract.md', 'Source-Capture Kitchen Extract'),
  pattern('HSA-P-021', 'source-capture-bathroom-extract.md', 'Source-Capture Bathroom Extract'),
  pattern('HSA-P-011', 'roof-maintenance-route.md', 'Roof Maintenance Route'),
  pattern('HSA-P-013', 'ground-supported-facade-access.md', 'Ground-Supported Façade Access'),
  pattern('HSA-P-012', 'physical-service-index.md', 'Physical Service Index'),

  {
    id: 'strategies-index',
    source: 'docs/patterns/strategies/README.md',
    title: 'Strategies',
    kind: 'strategy'
  },
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
    id: 'candidates-index',
    source: 'docs/patterns/candidates/README.md',
    title: 'Held Pattern Candidates',
    kind: 'candidate'
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
    id: 'part-iv-overview',
    source: 'docs/reference-house/README.md',
    title: 'Part IV — Reference House',
    kind: 'reference-house',
    adapter: 'reference-house-overview'
  },
  {
    id: 'reference-house-tectonic-language',
    source: 'docs/reference-house/tectonic-architectural-language.md',
    title: 'Tectonic Architectural Language',
    kind: 'reference-house',
    adapter: 'reference-house-page'
  },
  {
    id: 'reference-house-vertical-options',
    source: 'docs/reference-house/vertical-bay-options.md',
    title: 'Vertical Bay Options',
    kind: 'reference-house',
    adapter: 'reference-house-page'
  },
  {
    id: 'reference-house-vertical-coordination',
    source: 'docs/reference-house/vertical-bay-coordination.md',
    title: 'Vertical Bay Coordination',
    kind: 'reference-house',
    adapter: 'reference-house-page'
  },
  {
    id: 'reference-house-whole-house',
    source: 'docs/reference-house/whole-house-coordination-fixture.md',
    title: 'Whole-House Coordination Fixture 01',
    kind: 'reference-house',
    adapter: 'reference-house-page'
  },
  {
    id: 'reference-house-pattern-register',
    source: 'docs/reference-house/pattern-occurrence-register.md',
    title: 'Pattern Occurrence Register',
    kind: 'reference-house',
    adapter: 'reference-house-page'
  },
  {
    id: 'reference-house-external-maintenance',
    source: 'docs/reference-house/external-access-maintenance-plan.md',
    title: 'External Access & Maintenance Plan',
    kind: 'reference-house',
    adapter: 'reference-house-page'
  },

  {
    id: 'part-v',
    source: 'docs/manuscript/part-v.md',
    title: 'Part V — Making and Testing the Platform',
    kind: 'part',
    adapter: 'part-v-wrapper'
  }
] as const
