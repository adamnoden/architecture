---
id: HSA-P-017
title: Visible Leakage Path
kind: pattern
state: active
evidence: supported
maturity: []
scales:
  - assembly
  - room
  - zone
domains:
  - water
  - maintenance
  - lifecycle
  - architecture
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

# HSA-P-017 — Visible Leakage Path

## Context

A water-bearing component or route contains a credible concealed failure whose first uncontrolled destination would otherwise be vulnerable building fabric.

## Problem

Small concealed leaks can remain unnoticed for long periods. Damage may become visible only after timber, insulation, finishes or structure have already been wetted.

Electronic sensing can help, but a sensor does not change where water physically goes when a leak occurs.

## Pattern

**Where consequence justifies it, give credible concealed leakage a deliberate passive path to a safe, legible location where the failure becomes visible before it silently consumes vulnerable fabric.**

The invariant is the physical leakage path, not a particular sensor, tray or pipe-in-pipe product.

## Forces

- the path needs fall or another reliable physical mechanism;
- channels and outlets can block or become dirty;
- discharge must not create a second moisture, pest or freezing problem;
- permanent containment adds material and space;
- not every pipe or joint warrants a dedicated secondary path;
- the visible point must be recognisable as abnormal rather than mistaken for normal condensate or drainage.

## Variants

- drained manifold or service cabinet;
- pipe-in-pipe outer conduit terminating visibly;
- local tray/channel beneath a high-consequence concealed joint;
- concealed cistern/service enclosure draining to a visible wet-room location.

Electronic leak detection may supplement these variants but does not replace the passive path where the pattern is selected.

## Proportionality

Use the pattern where leakage probability, consequence, concealment and repair difficulty justify permanent provision. It should not become a universal trough beneath every pipe.

## Boundary debt

The route must not weaken waterproofing, fire, acoustic or pest boundaries. Any discharge crossing the envelope must address weather and freezing risk.

## Permanent-fabric impact

The pattern can add sleeves, channels or drains to long-lived construction. Keep them local to credible high-consequence conditions and make blockage/cleaning implications explicit.

## Workmanship and tolerance

Verify actual fall and discharge before enclosure. A nominal drainage path that ponds, terminates short or becomes blocked by sealant is worse than no claimed path because it creates false confidence.

## Occupation / repose impact

Failure indication should be unmistakable when abnormal without creating constant visible technical clutter. The path should reduce vigilance during normal life rather than demand regular attention.

## Failure modes

- no effective fall;
- blocked outlet;
- leaked water escapes the containment before reaching the tell-tale point;
- discharge is hidden behind storage;
- normal condensate makes the signal ambiguous;
- outlet freezes or admits pests;
- sensor presence creates false confidence in a failed physical path.

## Evidence

Norwegian TEK17 provides direct precedent for making leakage easy to detect and preventing damage to building elements, including visible drainage from concealed water installations and wet-room conditions. The precedent supports the physical invariant strongly, while transfer into a UK domestic house remains project-specific.

## Does not prove

The evidence does not establish that every concealed water route needs secondary drainage or that one Norwegian implementation should be copied wholesale. Primary plumbing quality and joint minimisation remain the first defence.

## Reference House application

The Reference House uses this pattern selectively at concealed high-consequence locations rather than blanket containment, under the broader [Fail-Safe Water Distribution](strategies/fail-safe-water-distribution.md) strategy.

## Formalisation boundary

Leak source, containment extent, drainage destination, continuity and visible endpoint can be represented formally. Hydraulic reliability, material durability and actual failure performance still require technical evidence.

---

**Provenance:** admitted by the Phase-6 targeted evidence review as a narrower pattern extracted from retired `HSA-P-006`. Stable identity does not increase evidence or maturity.
