---
id: HSA-P-006
title: Water-Damage-Safe Service Route
kind: pattern
state: retired
evidence: established
retired_in: phase-6-corpus-audit
replacement_strategy: ../strategies/fail-safe-water-distribution.md
---

# HSA-P-006 — Water-Damage-Safe Service Route

**State: RETIRED. This ID is never reused.**

## Historical meaning

`HSA-P-006` originally described concealed water distribution that prevented credible leakage from silently wetting vulnerable construction. Its variants included pipe-in-pipe, accessible distribution, drained service cabinets, local containment, passive visible discharge and electronic isolation.

The underlying concern remains central to House Systems Architecture.

## Why the pattern identity was retired

The Phase-5 Reference House service-topology run showed that the original record was **not one reusable physical relationship**. Different route classes required materially different responses:

- plant/manifold geography benefited from accessible joints, isolation and local failure management;
- concealed vertical pressurised water suggested continuous/joint-minimised or pipe-in-pipe approaches;
- kitchen/utility branches were better made short and accessible;
- bathrooms benefited from dry-side access and simple concealed final runs;
- soil/waste drainage required falls, support, rodding and inspection rather than the same containment logic as pressurised supply.

Their shared invariant is a **failure-management strategy**, not a single pattern.

Phase 6 therefore retired this pattern identity rather than stretching the word “pattern” until it meant “achieve a desirable water outcome somehow”.

## Where the durable content went

The controlling replacement is:

- [Fail-Safe Water Distribution](../strategies/fail-safe-water-distribution.md) — active strategy.

Narrower canonical patterns authorised by Phase 6 include, once migrated:

- `HSA-P-017 Visible Leakage Path`;
- `HSA-P-018 Failure-Tolerant Wet Service Room`.

Other responses remain implementation families or held candidates, including:

- pipe-in-pipe / withdrawable runs;
- accessible joints;
- local containment;
- electronic leak sensing / automatic isolation;
- individually isolatable manifold distribution (held candidate).

## Evidence retained

The original evidence remains relevant to the strategy and narrower patterns. Norwegian TEK17 provides mature precedent for making leakage detectable and preventing damage to building elements; Approved Document G provides narrower British precedent for visible discharge in specific hot-water safety conditions.

Retirement does **not** mean the evidence was disproved. It means the evidence supported several physical responses rather than one coherent architectural pattern identity.

## Provenance

Historical developed prose remains preserved in:

- [`../core-12.md`](../core-12.md) — Pattern 06 in the pre-migration Core 12;
- [`../../reference-house/service-topology-run-01.md`](../../reference-house/service-topology-run-01.md) — worked-house test that exposed the category error;
- [`../../development/pattern-language-corpus-audit.md`](../../development/pattern-language-corpus-audit.md) — full Phase-6 classification;
- [`../../development/pattern-language-phase6-review.md`](../../development/pattern-language-phase6-review.md) — formal retirement decision.

## Identity rule

`HSA-P-006` remains a permanent historical identifier for this retired pattern. It must not be reassigned to a new proposition, even if doing so would make the active numbering contiguous.