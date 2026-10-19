export type ProgrammeControlLifecycle = 'active' | 'complete' | 'historical'

export interface ProgrammeControl {
  path: `docs/development/${string}.md`
  lifecycle: ProgrammeControlLifecycle
}

/**
 * Lifecycle-sensitive programme controls surfaced by docs/development/README.md.
 *
 * This is intentionally not a registry of every development note. It covers the
 * records whose current/closed state is part of project navigation and authority.
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
