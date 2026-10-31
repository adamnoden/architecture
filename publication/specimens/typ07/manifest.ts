export type Typ07ProofClass =
  | 'continuous-prose-spread'
  | 'division-entry-opening'
  | 'contents-navigation'
  | 'compact-table'
  | 'mixed-technical-page'
  | 'inline-flow-figure'
  | 'dedicated-architectural-plate'
  | 'paired-plate-spread'
  | 'caption-heavy-page'
  | 'dense-evidence-reference-page'

export type Typ07FontFace =
  | 'source-serif-4-regular'
  | 'source-serif-4-italic'
  | 'source-serif-4-bold'
  | 'source-sans-3-regular'
  | 'source-sans-3-bold'

export type Typ07Selector =
  | { readonly kind: 'heading-section'; readonly heading: string }
  | { readonly kind: 'first-markdown-table-after'; readonly heading: string }
  | { readonly kind: 'publication-contents'; readonly partEntryIds: readonly string[] }
  | { readonly kind: 'figure-placement'; readonly image: string }
  | { readonly kind: 'plate-placement'; readonly title: string; readonly pageClass: 'PLATE_SINGLE' | 'PLATE_PAIR' | 'PLATE_SPREAD' }
  | { readonly kind: 'long-url-reference-set'; readonly minimumUrls: number }

export interface Typ07ProofUnit {
  readonly id: string
  readonly proofClasses: readonly Typ07ProofClass[]
  readonly source: string
  readonly entryId?: string
  readonly selector: Typ07Selector
  readonly fontFaces: readonly Typ07FontFace[]
  readonly notes: string
}

/**
 * TYP-07A freezes source identity and semantic selection only.
 * TYP-07B owns extraction/composition and must not silently substitute other content.
 */
export const typ07ProofUnits: readonly Typ07ProofUnit[] = [
  {
    id: 'prose-part-i-house-after-completion',
    proofClasses: ['continuous-prose-spread'],
    source: 'docs/manuscript/part-i.md',
    entryId: 'part-i',
    selector: { kind: 'heading-section', heading: '# 1. The house after completion' },
    fontFaces: [
      'source-serif-4-regular',
      'source-serif-4-italic',
      'source-serif-4-bold',
      'source-sans-3-regular'
    ],
    notes: 'Sustained real prose with block quotation, emphasis, numbered evidence references and ordinary section rhythm.'
  },
  {
    id: 'opening-part-i',
    proofClasses: ['division-entry-opening'],
    source: 'docs/manuscript/part-i.md',
    entryId: 'part-i',
    selector: { kind: 'heading-section', heading: '# 1. The house after completion' },
    fontFaces: ['source-serif-4-regular', 'source-sans-3-bold'],
    notes: 'Uses the real Part I identity plus its first chapter as the division/entry threshold specimen.'
  },
  {
    id: 'contents-working-edition',
    proofClasses: ['contents-navigation'],
    source: 'publication/publication.ts',
    selector: {
      kind: 'publication-contents',
      partEntryIds: ['part-i', 'part-ii', 'part-iii', 'part-iv', 'part-v']
    },
    fontFaces: ['source-serif-4-regular', 'source-sans-3-regular', 'source-sans-3-bold'],
    notes: 'TOC rows must be derived from the canonical Working Edition manifest and real Part headings; no invented sample titles or dot leaders.'
  },
  {
    id: 'table-part-v-burden-classes',
    proofClasses: ['compact-table'],
    source: 'docs/manuscript/part-v.md',
    entryId: 'part-v',
    selector: { kind: 'first-markdown-table-after', heading: '## Four burdens of provision' },
    fontFaces: ['source-sans-3-regular', 'source-sans-3-bold'],
    notes: 'The real B0–B3 analytical matrix; preserves the TYP-05 compact-table decision.'
  },
  {
    id: 'technical-appendix-c-schedule',
    proofClasses: ['mixed-technical-page'],
    source: 'docs/manuscript/reference-house-implementation-schedule.md',
    entryId: 'reference-house-implementation-schedule',
    selector: { kind: 'first-markdown-table-after', heading: '## Implementation schedule' },
    fontFaces: ['source-serif-4-regular', 'source-serif-4-bold', 'source-sans-3-bold'],
    notes: 'Uses the real Appendix C schedule semantics, composed as the frozen TYP-05 labelled-record treatment rather than a miniaturised five-column grid.'
  },
  {
    id: 'flow-failure-architecture',
    proofClasses: ['inline-flow-figure'],
    source: 'docs/manuscript/part-ii.md',
    entryId: 'part-ii',
    selector: { kind: 'figure-placement', image: 'figures/failure-architecture-sequence.svg' },
    fontFaces: ['source-serif-4-regular', 'source-sans-3-regular'],
    notes: 'Real controlled FLOW asset plus its canonical publication caption in prose context.'
  },
  {
    id: 'plate-principal-front-elevation',
    proofClasses: ['dedicated-architectural-plate'],
    source: 'docs/manuscript/part-iv.md',
    entryId: 'part-iv',
    selector: { kind: 'plate-placement', title: 'Principal front elevation', pageClass: 'PLATE_SINGLE' },
    fontFaces: ['source-sans-3-regular', 'source-sans-3-bold'],
    notes: 'Real DRW v1 plate asset and book furniture; drawing-internal Arial-era text is rebound only in a temporary proof copy using the proven TYP-06 seam.'
  },
  {
    id: 'plate-pair-ground-first-floor',
    proofClasses: ['paired-plate-spread'],
    source: 'docs/manuscript/part-iv.md',
    entryId: 'part-iv',
    selector: { kind: 'plate-placement', title: 'Ground-floor plan', pageClass: 'PLATE_PAIR' },
    fontFaces: ['source-sans-3-regular', 'source-sans-3-bold'],
    notes: 'Canonical facing plan pair: Ground-floor plan + First-floor plan. Preserve existing paper-space drawing geometry while rebinding only the temporary proof typography seam.'
  },
  {
    id: 'caption-pattern-language-fields',
    proofClasses: ['caption-heavy-page'],
    source: 'publication/part-iii.md',
    entryId: 'part-iii',
    selector: { kind: 'figure-placement', image: '../docs/manuscript/figures/pattern-language-fields-sequence.svg' },
    fontFaces: ['source-serif-4-regular', 'source-sans-3-regular'],
    notes: 'Uses the longest current controlled inline-figure caption and the real Part III figure asset.'
  },
  {
    id: 'references-long-urls',
    proofClasses: ['dense-evidence-reference-page'],
    source: 'docs/manuscript/sources-and-further-reading.md',
    entryId: 'sources-and-further-reading',
    selector: { kind: 'long-url-reference-set', minimumUrls: 8 },
    fontFaces: ['source-serif-4-regular', 'source-serif-4-italic', 'source-sans-3-regular'],
    notes: 'Dense real bibliography/evidence material with long reader-facing URLs and italic work titles.'
  }
] as const

export const typ07RequiredProofClasses: readonly Typ07ProofClass[] = [
  'continuous-prose-spread',
  'division-entry-opening',
  'contents-navigation',
  'compact-table',
  'mixed-technical-page',
  'inline-flow-figure',
  'dedicated-architectural-plate',
  'paired-plate-spread',
  'caption-heavy-page',
  'dense-evidence-reference-page'
] as const

export const typ07RequiredFontFaces: readonly Typ07FontFace[] = [
  'source-serif-4-regular',
  'source-serif-4-italic',
  'source-serif-4-bold',
  'source-sans-3-regular',
  'source-sans-3-bold'
] as const

/**
 * These are audited present-production seams, not desired TYP-07 output.
 * TYP-07B must bypass them in proof space rather than mutating production globally.
 */
export const typ07ProductionDebt = {
  theme: 'publication/theme.css',
  requiredLegacyMarkers: [
    '--hk-serif: Georgia, Cambria',
    '--hk-sans: Arial, Helvetica',
    '--hk-mono:',
    'hyphens: auto',
    "content: leader('.')",
    'font-size: 34pt',
    'font-size: 28pt',
    'font-size: 21pt'
  ],
  plates: 'publication/plates.ts',
  plateLegacyMarkers: [
    'font-family: Arial, Helvetica, sans-serif',
    'font: 700 11pt/1.15 Arial, Helvetica, sans-serif',
    'font: 8.3pt/1 Arial, Helvetica, sans-serif'
  ]
} as const
