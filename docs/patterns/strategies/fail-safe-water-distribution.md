# Fail-Safe Water Distribution

**Kind:** strategy  
**Status:** canonical strategy  
**Origin:** durable content previously bundled into retired `HSA-P-006 — Water-Damage-Safe Service Route`

## Proposition

**Arrange water distribution so credible leakage is unlikely to remain hidden long enough to damage vulnerable long-lived fabric. Prefer eliminating concealed joints first, then use access, visible leakage paths, containment, isolation or other proportionate measures according to route and consequence.**

This is a strategy rather than one pattern because the valid physical responses are materially different.

## Why `HSA-P-006` was retired

The old pattern grouped together:

- fully accessible distribution;
- continuous or joint-minimised runs;
- pipe-in-pipe systems;
- drained containment;
- local trays or channels;
- visible leakage paths;
- leak sensing and automatic isolation;
- wet-room containment.

Those are not variants of one stable spatial relationship. Some expose pipes, some create a secondary drainage route, some rely on room geometry, and some are active control systems.

The common durable idea is therefore strategic:

> concealed water should not be able to fail silently into vulnerable fabric where proportionate alternatives exist.

## Design hierarchy

Use the least complex measure that adequately addresses the risk:

1. **Avoid the failure opportunity** — minimise concealed joints and unnecessary water routes.
2. **Make the route accessible** — where recurring inspection or intervention is justified.
3. **Make leakage visible** — deliberately lead concealed leakage to a safe, legible point where appropriate.
4. **Contain locally** — where a credible appliance/joint failure has a defined consequence zone.
5. **Isolate quickly** — manual or automatic isolation where consequence/occupancy warrants it.
6. **Provide room-scale tolerance** — in genuinely high-risk wet/service rooms where containment, drainage and drying can be designed coherently.

Do not stack every layer by default. Redundancy itself has cost, maintenance and failure modes.

## Forces

- water damage can propagate far from a small concealed failure;
- access and containment consume space/material;
- drainage channels need fall, drying and maintenance;
- sensors and automatic valves can fail or create false confidence;
- secondary sleeves can complicate insulation and installation;
- ordinary accessible pipework may outperform elaborate hidden protection where architecture permits it.

## Pattern-language consequences

The strategy may invoke several patterns, including:

- `HSA-P-004 — High-Service-Room Service Wall` where water-bearing components benefit from dry-side access;
- `HSA-P-017 — Visible Leakage Path` where concealed leakage needs a passive path to a legible destination;
- `HSA-P-018 — Failure-Tolerant Wet Service Room` where concentrated room-scale water risk justifies local failure tolerance;
- `HSA-P-005 — Designed Structural Penetration` where water routes cross permanent structure or boundaries.

It may also use implementation families that are not architectural patterns, such as pipe-in-pipe distribution or automatic shut-off systems.

## Evidence

Norwegian TEK17 provides a mature precedent for water installations arranged so leakage becomes detectable and does not damage building elements. UK visible-discharge requirements such as tundish arrangements provide narrower examples of the same failure-legibility principle.

The evidence supports the strategic outcome more strongly than any one HSA implementation.

## Does not prove

- every concealed pipe requires a drained secondary sleeve;
- every house needs automatic leak detection/isolation;
- one overseas regulatory solution should be copied wholesale into UK domestic construction;
- adding containment compensates for poor primary plumbing design.

## Reference House direction

The Reference House begins with joint-minimised and accessible distribution. Visible leakage paths or local containment are added only where the whole-house failure review shows enough consequence to justify them.

## Computational boundary

The semantic model may represent water routes, joints, isolation points, vulnerable fabric, leakage destinations and evidence obligations. A compiler should not infer that a chosen protective family actually performs unless scoped technical/product evidence exists.

---

**Provenance:** derived from Pattern 06 in [`../core-12.md`](../core-12.md), the Phase-6 corpus audit and targeted evidence review. Reclassification reduces conceptual overreach; it does not increase evidence maturity.
