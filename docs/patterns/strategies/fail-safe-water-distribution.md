---
title: Fail-Safe Water Distribution
kind: strategy
state: active
evidence: established
principles:
  - 4
  - 5
  - 9
---

# Strategy — Fail-Safe Water Distribution

## Purpose

Pressurised water and wet appliances can cause disproportionate damage when failure remains concealed. House Systems Architecture therefore treats water distribution as a **failure-management problem**, not merely a routing problem.

This strategy preserves the durable content formerly carried by `HSA-P-006 Water-Damage-Safe Service Route`. Phase 5 and Phase 6 showed that the valid physical responses differ too much by route and risk for that material to remain one architectural pattern.

## Strategy

> **First reduce the opportunity for hidden leakage; then arrange credible failures so they are detectable, containable, isolatable and locally repairable before they consume long-lived fabric. Choose the physical response according to the route and consequence rather than forcing one containment detail everywhere.**

The hierarchy matters. Sensors and trays should not compensate for unnecessarily concealed joints or poor isolation geography.

## Common moves

Depending on context, a project may use:

- accessible joints and valves;
- joint-minimised or continuous concealed runs;
- local isolation close to the served zone;
- manifold/home-run topology where proportionate;
- pipe-in-pipe or sleeved/withdrawable runs;
- a [Visible Leakage Path](../visible-leakage-path.md) once that canonical pattern is migrated;
- drained or otherwise failure-tolerant service cabinets;
- local containment beneath high-consequence joints/appliances;
- a failure-tolerant wet service room;
- electronic leak sensing and automatic isolation as an additional layer;
- inspectable, roddable and tested drainage rather than applying pressurised-water containment logic to waste pipework.

These are not interchangeable. Their suitability depends on service type, route, access, consequence, cost, carbon and boundary conditions.

## Route-specific logic

### Plant / manifold geography

Prefer accessible joints, clear isolation, visible failure management and drainage/containment where credible failure justifies it.

### Concealed pressurised distribution

Minimise concealed joints first. Where routes are inaccessible and consequences are high, investigate continuous runs, pipe-in-pipe or another method that reveals/controls leakage without opening permanent fabric.

### Kitchen / utility branches

Keep branches short. Bias joints/valves into accessible cabinet or service-wall geography. Provide local appliance isolation. Do not add continuous containment where simple accessibility already controls the risk better.

### Bathroom branches

Bias maintainable valves/joints to a dry-side service zone where practical. Keep final concealed runs simple and joint-minimised. Waterproofing remains a separate wet-zone boundary obligation.

### Soil / waste drainage

Use correct falls, support, accessible rodding/inspection and tested joints. A gravity-drainage system has different failure modes from a pressurised supply and should not inherit a generic trough/sleeve solution by analogy.

## Forces

- concealment protects domestic appearance but can hide leakage;
- accessibility can consume space or create boundary debt;
- containment can trap dirt, condensation or standing water;
- drainage paths need fall, outlets and maintenance;
- electronic sensors can fail, lose power or create false confidence;
- automatic valves add components and maintenance;
- added material has cost/carbon;
- visible tell-tales/discharges can stain, freeze or admit pests if badly designed;
- simpler routing and fewer joints can outperform elaborate secondary protection.

## Evidence

Norwegian TEK17 provides unusually direct precedent: water installations should be arranged so leakage is easy to detect and does not damage other installations/building elements. Related wet-room guidance requires leakage water in specified concealed conditions to become visible and be led safely to a drain.

Approved Document G provides narrower British examples of deliberately visible discharge through tundish arrangements in relevant hot-water safety systems.

The Phase-6 targeted evidence review records the scoped transfer of these precedents to HSA.

## Does not prove

This strategy does not establish:

- continuous metal troughs beneath every pipe;
- pipe-in-pipe as universally superior;
- mandatory electronic leak detection everywhere;
- manifold distribution for every domestic system;
- that one water-failure detail should be repeated across supply, waste, plant and appliances.

## Reference House application

The Phase-5 Reference House run deliberately applies different responses to five route classes (`WF-01..05`) rather than forcing one universal water-safe route:

- accessible plant/manifold geography;
- joint-minimised vertical pressurised run;
- short accessible kitchen/utility branches;
- dry-side bathroom maintenance;
- ordinary but inspectable/testable soil/waste drainage.

That integration test is why this content is now a strategy rather than a pattern.

## Formalisation boundary

The strategy itself is not a compiler entity.

Selected implementations can create formal consequences such as:

- concealed-joint counts;
- isolation relationships;
- leak-path geometry;
- containment/drainage fall;
- sensor/valve dependencies;
- access volumes;
- scoped evidence obligations.

The choice among those responses remains a design/risk decision.