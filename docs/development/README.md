# Development

This directory contains **internal integration and programme-control material**: documents used to move an architectural proposition from idea toward coordinated publication, testing or delivery.

Typical contents include integration plans, coordination registers, manufacturing strategy, prototype programmes and working architectural notes whose purpose is to drive changes elsewhere.

It does **not** contain the prototype artefacts themselves. Build packs, drawings, protocols and test results belong in [`../prototypes/`](../prototypes/). It is also not the canonical public doctrine.

## Live controls

- [Architectural Specificity Boundary](architectural-specificity-boundary.md) — continuing scope firewall between general HSA propositions, technical-domain restrictions, architectural grammars and Reference House choices.
- [Tectonic Prototype Programme](tectonic-prototype-programme.md) — physical/engineering validation programme, including the separation between general HSA evidence and Reference House/G-01 fit.
- [Manufacturing Strategy](manufacturing-strategy.md) — implementation/manufacturing thinking where it remains relevant to current prototype and delivery decisions.

Project-wide maturity and priorities are owned by [`../../STATUS.md`](../../STATUS.md).

## Completed controls retained for provenance

### Architectural-specificity audit

The repo-wide specificity audit is complete. These records explain the method, findings and closure state; they are not an open work queue.

- [Programme Control](architectural-specificity-audit.md)
- [Claim Ledger](architectural-specificity-ledger.md)
- [Adversarial Verification](architectural-specificity-adversarial-test.md)

### Pattern-language migration and computational crosswalk

Phases 0–8 are complete at current internal scope. The migration control remains the durable summary; phase plans/reviews are historical execution records.

- [Pattern Language Overhaul — Migration Control](pattern-language-overhaul.md)
- [Phase 7 Gate Review](pattern-language-phase7-review.md)
- [Phase 8 Gate Review](pattern-language-phase8-review.md)
- [Phase 8 Pilot Red-Team](pattern-language-phase8-pilot-review.md)
- [Corpus Audit](pattern-language-corpus-audit.md)
- earlier Phase-5/6 records and execution plans retained alongside them

The completed migration established 21 active canonical patterns, three strategies, four held candidates, the Reference House occurrence model and the pattern→computational handoff. Subsequent P0 and `PAT-XW-01` executable results live in [`../computational/p0-pat-xw-01-result.md`](../computational/p0-pat-xw-01-result.md).

## Rule for old control documents

A historical plan or gate review may correctly say “next: X” relative to the moment when it was written. Do not read that as current project status after a later gate has closed X.

For present tense questions use, in order:

1. [`../../STATUS.md`](../../STATUS.md);
2. the latest explicit gate/result record for the workstream;
3. the historical plan/review for provenance only.

When development work settles an architectural position, absorb the result into the appropriate manuscript, pattern, reference-house, prototype or delivery document and leave only the necessary provenance here.

See [`../README.md`](../README.md) for the repository-wide documentation model.
