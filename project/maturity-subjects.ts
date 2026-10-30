import type { workstreamStatuses } from './maturity.js'

/** HRS inspected these sources here; this is not a new maturity assessment. */
export const maturitySubjectMonitoringBaseline = 'f75668d39bdebb389b12721c28230549566bf8b9'

export interface MaturitySubjectBinding {
  /** Named subject/revision actually described by the existing assessment. */
  assessedSubject: string
  /** Bounded source files or owning source directories, not a dependency graph. */
  controllingSources: readonly string[]
  /** Explicit applicability ceiling; unchanged bytes never discharge it. */
  applicabilityLimit: string
}

const currentHouseSources = [
  'compiler/reference-house/georgian/layout-revision.ts',
  'compiler/reference-house/georgian/layout-family.ts',
  'compiler/reference-house/georgian/layout-analysis.ts',
  'compiler/reference-house/georgian/section-exemplar.ts',
  'compiler/reference-house/georgian/source.ts',
  'project/triad-interface-contract.md',
  'project/design-constraints.ts'
] as const

const historicalHouseSources = [
  'compiler/reference-house/fixture.ts',
  'compiler/reference-house/model.ts',
  'compiler/reference-house/derive.ts',
  'compiler/reference-house/compile.ts'
] as const

const noCurrentHouseTransfer = 'Historical subject only; applicability to RH-LAYOUT-REVISION-02 is not established. HRS and the owning assessment must explicitly reassess it.'

/** Exhaustive binding of the existing assessments; no ratings or review dates change. */
export const maturitySubjectBindings = {
  'public-architectural-position': {
    assessedSubject: 'PR-01 controlled architectural proposition with HFI integration (reviewed 2026-10-19)',
    controllingSources: ['docs/manuscript/governing-principles.md', 'docs/manuscript/part-i.md', 'docs/manuscript/part-ii.md'],
    applicabilityLimit: 'Architectural doctrine at its stated scope; no particular house or construction acceptance.'
  },
  'pattern-language': {
    assessedSubject: '21 active patterns, three strategies and held candidates (reviewed 2026-10-12)',
    controllingSources: ['docs/patterns', 'project/patterns.ts'],
    applicabilityLimit: 'Pattern meanings and corpus only; occurrence in a changed house needs separate design evidence.'
  },
  'architectural-grammar-framework': {
    assessedSubject: 'Coordinated grammar framework (reviewed 2026-10-12)',
    controllingSources: ['docs/grammar/architectural-grammar-and-proportion.md', 'docs/grammar/architectural-grammar-modelling-corrections-v01.md'],
    applicabilityLimit: 'Framework scope only; neither a new grammar nor a house conformance result is admitted.'
  },
  'g01-grammar-instance': {
    assessedSubject: 'G-01 v0.1 frozen grammar and its historical D12/D13 tests (reviewed 2026-10-14)',
    controllingSources: ['docs/grammar/g01-v0.1.md', 'docs/grammar/g01-grammar-charter.md', ...currentHouseSources],
    applicabilityLimit: 'G-01 grammar evidence survives; historical conformance does not transfer automatically to revision 02.'
  },
  'reference-house': {
    assessedSubject: 'Historical RH-00–RH-10 technical house with HFI-RW-01 stair rewind (reviewed 2026-10-19)',
    controllingSources: [...historicalHouseSources, ...currentHouseSources],
    applicabilityLimit: noCurrentHouseTransfer
  },
  'physical-prototypes': {
    assessedSubject: 'P01/W2 challenger and P03/P04 prototype preparation (reviewed 2026-10-12)',
    controllingSources: ['docs/prototypes', 'docs/development/tectonic-prototype-programme.md', ...currentHouseSources],
    applicabilityLimit: 'Preparation at its historical configurations; no physical result or current-house prototype applicability is established.'
  },
  'external-professional-review': {
    assessedSubject: 'Historical RH-11 and H1 review preparation (reviewed 2026-10-12)',
    controllingSources: ['docs/reference-house/external-review-brief.md', 'docs/reference-house/external-review-regulatory-baseline-rh11.md', 'docs/computational/external-review-pack-h1-paper-v02.md', ...currentHouseSources],
    applicabilityLimit: 'No competent review response; historical packs are not issue-ready current-house professional acceptance.'
  },
  'computational-track': {
    assessedSubject: 'Historical Reference House/RH-C5 and CH-00–08 bounded compiler with finite CCR repairs (reviewed 2026-10-30)',
    controllingSources: [
      ...historicalHouseSources, ...currentHouseSources,
      'compiler/reference-house/system-compile.ts', 'compiler/reference-house/identity.ts',
      'compiler/reference-house/plan-adapter.ts', 'compiler/plan-slice',
      'compiler/boundary-slice', 'compiler/service-slice', 'compiler/core',
      'compiler/rhc2', 'compiler/rhc3', 'compiler/rhc4', 'compiler/rhc5'
    ],
    applicabilityLimit: 'Historical fixture/domain only. Geometry, implementation and controlling-input provenance can change applicability independently; no current-house technical pass follows.'
  },
  'evidence-research': {
    assessedSubject: 'Coordinated evidence/research corpus (reviewed 2026-10-12)',
    controllingSources: ['docs/research'],
    applicabilityLimit: 'Each study retains its own subject and evidence limits; corpus freshness is not a design approval.'
  },
  'publication': {
    assessedSubject: 'Controlled PR-01/publication object with later final-integration holds (reviewed 2026-10-28)',
    controllingSources: ['publication', 'docs/manuscript', ...currentHouseSources],
    applicabilityLimit: 'Internal object/process scope; changed house/content needs final PLT/EDA integration, not automatic release or maturity promotion.'
  },
  'deployment-real-site': {
    assessedSubject: 'DPL synthetic SCREENING and DPL-RS-01 UNRESOLVED/conditional evidence (reviewed 2026-10-27)',
    controllingSources: ['compiler/dpl', 'project/dpl/sites', ...historicalHouseSources, ...currentHouseSources],
    applicabilityLimit: 'Historical candidate and conditional/site-transform evidence only; no empirical compatibility, revision-02 site placement or real commission is established.'
  },
  'delivery': {
    assessedSubject: 'DEL-00 delivery inventory and provisional allocations (reviewed 2026-10-28)',
    controllingSources: ['docs/delivery', 'project/del/del-00-delivery-baseline.md', ...currentHouseSources],
    applicabilityLimit: 'Inventory/preparation only; current-house assemblies, professional/physical evidence and commission acceptance remain outstanding.'
  }
} as const satisfies Record<(typeof workstreamStatuses)[number]['id'], MaturitySubjectBinding>
