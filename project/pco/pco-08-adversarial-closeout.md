# PCO-08 — Adversarial closeout

**State:** candidate; automated adversarial cases authored, merge/main-projection observation pending  
**Date:** 2026-10-28  
**Parent:** PCO #953

## Purpose

Prove that the PCO control plane fails at the owning boundary rather than merely producing an attractive status table.

## Adversarial matrix

| Attack | Expected behaviour | Proof route |
|---|---|---|
| unknown first-class workstream ownership | reject | `project/control/control.test.ts` + `validateGraphStructure()` |
| duplicate node id / alias collision | reject | graph validator / adversarial test |
| dangling dependency | reject | graph validator / adversarial test |
| dependency cycle | reject | graph validator / adversarial test |
| node marked started while a hard prerequisite is incomplete | reject | graph validator / adversarial test |
| complete node with no closeout-evidence contract | reject | graph validator |
| held PHY research appears as runnable work | must remain held, never READY | current-frontier adversarial test |
| possible future PHY/EPR/DEL route blocks BCR before BCR earns it | must not create a dependency | current-frontier adversarial test |
| PHY-03 engineering silently creates/authorises a specimen | no `PHY-03B` execution node until engineering earns it | current-frontier adversarial test |
| IAS/OAS/HAD shared interface represented twice | one canonical multi-owner node; per-stream packet ids are aliases | current-frontier adversarial test |
| missing effort estimates converted to false zero-duration work | weighted critical path withheld | derivation test |
| maturity evidence changes | assessment becomes stale/reassessment-required; M-level unchanged | pure maturity-freshness adversarial test + status rendering |
| projection file is stale on a feature branch | PR CI regenerates projections ephemerally before repository checks; feature branch need not commit projection churn | `validate-pr.yml` |
| concurrent merges produce stale `STATUS.md` / code register | main-only serial projection reconciler regenerates and commits projections | `project-control-projections.yml`; observe after merge before final PCO closeout |
| two agents edit sibling execution packets | sharded node modules avoid a single routinely edited graph-state file | `project/control/nodes/` layout; merge behaviour remains to be observed over real use |
| clean-room agent has no chat context | generated `STATUS.md` gives frontier/blockers; `project/control/README.md` gives operating loop; owning issue/programme supplies scope | repository restart-safety inspection |

## Maturity safeguard boundary

The PCO maturity watch uses merge `c3701c5` as a deterministic **content-monitoring baseline**. It does not claim that PCO independently revalidated every historical maturity assessment at that commit.

From that baseline onward, any committed content change to a registered evidence path marks every affected assessment stale until explicitly reassessed. Staleness is a warning about applicability of the previous judgement, not an automatic demotion.

This is intentionally stronger than a `reviewedOn` date for future drift because it detects same-day content changes and does not infer freshness from calendar dates.

## Projection-concurrency rule

Feature branches must not be required to commit `STATUS.md` or `project/workstream-codes.md` merely because a node changed. PR CI renders projections in its checkout before repository checks. After merge, one serial main-branch workflow owns projection reconciliation.

This prevents the human-readable projection from becoming the merge-conflict hotspot that PCO was created to remove.

## Remaining closeout observation

Before PCO-08 and parent PCO may close:

1. the hardening PR must pass the full repository/publication CI with the PCO-specific guard steps enabled;
2. the hardening PR must merge from its validated head;
3. the main-branch projection reconciler must run successfully and leave `STATUS.md` / `project/workstream-codes.md` generated from the merged canonical model;
4. a clean-room status query against main must expose the expected ready frontier and blockers without chat context;
5. cleanup must confirm no obsolete PCO implementation branches or temporary machinery remain.

Until those observations are made, PCO-08 remains open even though its automated attacks are authored.