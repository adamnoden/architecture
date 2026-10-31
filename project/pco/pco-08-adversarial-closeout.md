# PCO-08 — Adversarial closeout

**State:** complete  
**Date:** 2026-10-28  
**Parent:** PCO #953

## Purpose

Prove that the PCO control plane fails at the owning boundary rather than merely producing an attractive status table.

## Adversarial matrix

| Attack | Expected behaviour | Result / proof route |
|---|---|---|
| unknown first-class workstream ownership | reject | PASS — `project/control/control.test.ts` + `validateGraphStructure()` |
| duplicate node id / alias collision | reject | PASS — graph validator / adversarial test |
| dangling dependency | reject | PASS — graph validator / adversarial test |
| dependency cycle | reject | PASS — graph validator / adversarial test |
| node marked started while a hard prerequisite is incomplete | reject | PASS — graph validator / adversarial test |
| complete node with no closeout-evidence contract | reject | PASS — graph validator |
| held PHY research appears as runnable work | must remain held, never READY | PASS — PHY-01/02 remain held in the generated frontier |
| possible future PHY/EPR/DEL route blocks BCR before BCR earns it | must not create a dependency | PASS — BCR convergence blockers remain only BCR scaffold + triad gate |
| PHY-03 engineering silently creates/authorises a specimen | no `PHY-03B` execution node until engineering earns it | PASS — explicit adversarial test |
| IAS/OAS/HAD shared interface represented twice | one canonical multi-owner node; per-stream packet ids are aliases | PASS — canonical interface nodes + alias tests |
| missing effort estimates converted to false zero-duration work | weighted critical path withheld | PASS — derivation test |
| maturity evidence changes | assessment becomes stale/reassessment-required; M-level unchanged | PASS — pure maturity-freshness adversarial test + status rendering |
| projection file is stale on a feature branch | PR CI regenerates projections ephemerally before repository checks | PASS — PR #956 CI rendered projections before repository health |
| concurrent/main merges leave stale `STATUS.md` / code register | main-only serial projection reconciler regenerates and commits projections | PASS — workflow run `40779464496` completed successfully after #956 merge |
| two agents edit sibling execution packets | no single routinely edited graph-state hot file | PASS at structural design boundary — node state is sharded by family; real-world sibling edits can avoid a monolithic graph file |
| clean-room agent has no chat context | repository alone exposes frontier/blockers/operating loop | PASS — clean-room read of generated `STATUS.md` on `main` exposed ready nodes, blockers and structural critical path |

## Observed integration proof

The hardening PR #956 passed the full repository/publication CI with the PCO-specific gates enabled. The validated head was `a5290a9c5e100ccf3404e71aec1d6bf9b8412514`; it was squash-merged as `361cc504bdb461a895a2bcc659a10f7ea74f3650`.

The first real `main` reconciliation run for `.github/workflows/project-control-projections.yml` was workflow run `40779464496`. It completed successfully and committed the generated projections as `830fe28702169487c24c1846df7b84b4ea53461d`.

A clean-room read of that `main` state reported the execution frontier and exact direct blockers without relying on chat context. At that point the control plane reported eight structurally ready nodes, two active durable nodes, twenty-three blocked nodes, two held nodes and the complete structural critical path to `PUB-02-FINAL`.

## READY is not a lease

Real concurrent work exposed an important boundary: a live branch named `ias/00-baseline-challengers` existed while canonical `main` still correctly derived `IAS-00` as READY.

This is not a contradiction. PCO's durable graph answers **whether hard dependencies permit the node to execute**. It does not claim that no other live agent, branch or external session has started exploratory work against that node.

Therefore:

> **READY means structurally dependency-eligible, not globally unclaimed.**

A reliable live-agent/branch lease could be added later as a separate orchestration capability if a concrete coordination failure earns it. PCO deliberately does not invent a repository-local presence system that it cannot keep authoritative.

## Maturity safeguard boundary

The PCO maturity watch uses merge `c3701c5` as a deterministic **content-monitoring baseline**. It does not claim that PCO independently revalidated every historical maturity assessment at that commit.

From that baseline onward, a committed content change to a registered evidence path marks every affected assessment stale until explicitly reassessed. Staleness is a warning about applicability of the previous judgement, not an automatic demotion.

This is intentionally stronger than relying on `reviewedOn` alone for future drift because it catches same-day content changes and does not infer freshness from calendar dates.

## Projection-concurrency result

Feature branches are not required to commit `STATUS.md` or `project/workstream-codes.md` merely because a node changes. PR CI renders projections ephemerally before repository checks. After merge, one serial main-branch workflow owns projection reconciliation.

The #956 merge demonstrated that this arrangement works end to end: canonical state merged first, then `main` generated and committed the human-readable projection separately. The projection therefore does not become the routine merge-conflict hotspot PCO was created to remove.

## Compatibility residue

`project/maturity.ts` still contains historical `currentState` / `nextGate` prose and its legacy verbose renderer remains available in a collapsed compatibility block because existing repository-integrity checks still verify that renderer.

This residue is explicitly **non-authoritative for execution state**. The generated execution frontier comes from `project/control/`; visible maturity is presented separately as an epistemic judgement. The old fields can be removed later if a focused simplification earns the migration, but they no longer compete with PCO as the current scheduler.

## Result

PCO-00 through PCO-08 have established and adversarially exercised a deterministic project-control plane. The bootstrap exception has ended: PCO is registered and self-hosted in the same graph it created.

The remaining closeout action is repository hygiene only: merge this closeout record, allow the main projection reconciler to remove `PCO-08` from READY, close #953, and dispose of obsolete PCO implementation branches where safe.

PCO closeout proves project-control coherence only. It does not raise architectural, technical, evidential or publication maturity.