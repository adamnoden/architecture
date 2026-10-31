export type ProgrammeControlLifecycle = 'active' | 'complete' | 'historical'

export interface ProgrammeControl {
  path: `docs/development/${string}.md`
  lifecycle: ProgrammeControlLifecycle
}

/**
 * Navigation/provenance lifecycle for selected docs/development control records.
 *
 * This is deliberately NOT workstream execution state. PCO owns executable
 * packet lifecycle, dependencies and derived readiness in `project/control/`.
 * This registry only answers whether a development-control document belongs in
 * the live or retained-provenance sections of docs/development/README.md.
 *
 * Keeping that distinction prevents a document being "active" for navigation
 * from silently asserting that an executable PCO node is active or ready.
 */
export const programmeControls = [
  { path: 'docs/development/architectural-specificity-boundary.md', lifecycle: 'active' },
  { path: 'docs/development/reference-house-design-programme.md', lifecycle: 'active' },
  { path: 'docs/development/tectonic-prototype-programme.md', lifecycle: 'active' },
  { path: 'docs/development/manufacturing-strategy.md', lifecycle: 'active' },

  { path: 'docs/development/human-factors-low-friction-inhabitation-programme.md', lifecycle: 'complete' },
  { path: 'docs/development/human-factors-low-friction-inhabitation-execution-plan.md', lifecycle: 'complete' },
  { path: 'docs/development/ovids-house-migration.md', lifecycle: 'complete' },
  { path: 'docs/development/architectural-specificity-audit.md', lifecycle: 'complete' },
  { path: 'docs/development/architectural-specificity-ledger.md', lifecycle: 'complete' },
  { path: 'docs/development/architectural-specificity-adversarial-test.md', lifecycle: 'complete' },
  { path: 'docs/development/pattern-language-overhaul.md', lifecycle: 'complete' },
  { path: 'docs/development/pattern-language-phase8-review.md', lifecycle: 'complete' },

  { path: 'docs/development/pattern-language-phase7-review.md', lifecycle: 'historical' },
  { path: 'docs/development/pattern-language-phase8-pilot-review.md', lifecycle: 'historical' },
  { path: 'docs/development/pattern-language-corpus-audit.md', lifecycle: 'historical' }
] as const satisfies readonly ProgrammeControl[]
