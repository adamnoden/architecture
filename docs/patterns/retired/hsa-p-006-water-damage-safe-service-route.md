---
id: HSA-P-006
title: Water-Damage-Safe Service Route
kind: pattern
state: retired
evidence: established
maturity: []
scales:
  - building
  - zone
domains:
  - water
  - maintenance
  - lifecycle
principles:
  - 4
  - 5
  - 9
requires: []
completes: []
alternative_to: []
tension_with: []
sequences: []
---

# HSA-P-006 — Water-Damage-Safe Service Route

**State: retired. This ID is permanently reserved and must never be reused.**

## Why the pattern was retired

The old pattern grouped several materially different responses under one identity:

- accessible distribution;
- joint-minimised runs;
- pipe-in-pipe;
- drained containment;
- local trays/channels;
- visible leakage paths;
- leak sensing and automatic isolation.

Phase 6 found that their common invariant is not one recurring architectural relationship. The durable proposition is broader:

> credible water leakage should not remain hidden long enough to damage vulnerable long-lived fabric where proportionate alternatives exist.

That proposition now lives as the canonical [Fail-Safe Water Distribution strategy](../strategies/fail-safe-water-distribution.md).

More specific recurring relationships are represented separately where they pass the admission test, including the admitted **Visible Leakage Path** and **Failure-Tolerant Wet Service Room** patterns.

## Historical value

The original `HSA-P-006` was useful because it forced the project to treat concealed water failure as an architectural problem rather than only a plumbing-quality problem. Retirement corrects the category without discarding that insight.

## Evidence boundary

Norwegian TEK17 and narrower UK visible-discharge precedents support the failure-legibility principle, but do not establish one universal domestic routing system. That over-broad transfer was another reason to move the durable content to strategy level.

## Reference House consequence

The Reference House Phase-5 run rejected blanket containment everywhere. It instead starts with joint-minimised and accessible routes, then adds local visible/containment/isolation measures where consequence justifies them.

---

**Historical source:** Pattern 06 in [`../core-12.md`](../core-12.md).  
**Superseding strategy:** [Fail-Safe Water Distribution](../strategies/fail-safe-water-distribution.md).  
**Retirement authority:** [Phase 6 Gate Review](../../development/pattern-language-phase6-review.md).
