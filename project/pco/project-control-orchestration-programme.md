# PCO — Project Control & Orchestration

**State:** complete / self-hosted control plane  
**Issue:** [#953](https://github.com/adamnoden/architecture/issues/953)  
**Date:** 2026-10-28

## Purpose

PCO creates the deterministic project-control plane for Ovid’s House.

Its purpose is not to add project-management ceremony. It is to make the execution structure the project already uses explicit enough that many agents can work concurrently without stale status, invented readiness, duplicate work or conflicting dependency assumptions.

The governing doctrine is:

> **The repository has one machine-readable project control model. Workstream identity and execution state live there; readiness and blockage are derived; maturity remains an independent evidence judgement; human-readable status is a projection, never an authority.**

Execution state and epistemic maturity are deliberately different. Finishing work does not automatically raise maturity. Reopening work does not automatically lower maturity.

## Existing foundation

PCO did not start from nothing.

The repository already had:

- a typed maturity model in `project/maturity.ts`;
- a generated maturity block in `STATUS.md`;
- repository validation that checked maturity evidence paths and rendered-block drift;
- a manual workstream-code register in `project/workstream-codes.md`;
- lifecycle-sensitive programme records in `project/programme-controls.ts`;
- dependency/state statements in programme documents and GitHub issues;
- an `AGENTS.md` constitution that already required bounded packets, authority checks, restart-safe records, reconciliation and closeout.

The problem was that these controls overlapped without one execution authority. PCO consolidates the execution model while preserving the independent authority of maturity, architecture, evidence and narrative history.

## Fixed boundaries

PCO owns:

- first-class workstream registration;
- executable packet/gate identity;
- hard dependency structure;
- deliberate lifecycle state;
- derived readiness/blockage/frontier;
- deterministic execution-status projections;
- repository checks that prevent control-plane drift.

PCO does **not** own:

- architectural decisions;
- evidence quality judgements;
- engineering or statutory adequacy;
- physical/professional validation;
- publication acceptance;
- detailed narrative history of why a packet reached its result.

Issues, programme records and closeout/result documents continue to carry reasoning and provenance. They cease to be parallel authorities for executable state once migrated.

## Three-letter identity rule

New first-class workstreams use exactly three uppercase letters.

Historical exceptions such as `RH` are grandfathered and are not renamed solely for conformity. Historical aliases remain provenance identities rather than duplicate live workstreams.

Every live first-class three-letter workstream must be present in the typed registry. Unknown workstream codes are invalid.

PCO itself was the one bootstrap exception while the registry did not yet exist. PCO is now registered and self-hosted in the new control plane, so that exception has ended; no permanent unregistered-workstream exception remains.

## Target control architecture

The semantic separation is fixed:

```text
project/control/
  workstreams.ts       canonical workstream identity / ownership
  nodes/               sharded executable node manifests
  derive.ts            readiness, blockers, frontier, dependency paths
  validate.ts          structural / lifecycle / projection invariants
  render.ts            human-readable projections

project/maturity.ts    epistemic maturity only
STATUS.md              generated present-state projection
project/workstream-codes.md  generated naming projection
```

### Concurrency is a first-class design constraint

A single frequently edited `graph.ts` containing every node and lifecycle state is rejected as the default design. It would create a merge-conflict hotspot precisely when PCO is intended to increase parallelism.

Executable definitions/state are therefore physically sharded by node family and aggregated deterministically by tooling. Routine packet/lifecycle changes occur in the owning sharded node module rather than a central state file.

Generated status has the same constraint. Concurrent feature branches are not forced to rewrite a large shared `STATUS.md` merely because one node changed. PR CI renders projections ephemerally for validation; a serial main-branch workflow reconciles canonical projections after merge.

## Workstream registry

The registry owns durable identity. A record can state, where applicable:

- canonical three-letter code;
- title;
- owning GitHub issue;
- canonical programme/control source;
- historical aliases;
- workstream-level lifecycle/retirement metadata only where that concept is genuinely workstream-wide.

The registry, not Markdown, is the source for the live code table.

## Executable node model

A DAG node represents a **substantial bounded packet or gate at approximately useful agent-execution scale**.

It does not represent every commit, lookup, discussion or implementation sub-step.

A node identifies at least:

- stable id;
- owning workstream or explicit shared ownership;
- bounded title/question;
- hard dependencies;
- deliberate lifecycle;
- expected durable output / closeout evidence;
- optional effort metadata where useful for scheduling.

Effort estimates are planning metadata, not evidence. Structural scheduling continues to work when no estimate exists.

Shared gates may belong to multiple workstreams. Do not invent fake umbrella workstreams merely to make the graph convenient.

## Lifecycle and derived state

Persist only deliberate lifecycle decisions:

```text
planned
started
held
complete
cancelled
```

`READY`, `BLOCKED` and similar scheduler states are derived facts and must never be canonical hand-authored values.

Conceptually:

```text
READY   = planned + all hard dependencies complete
BLOCKED = planned + one or more hard dependencies incomplete
ACTIVE  = started
DONE    = complete
```

`started` must not be allowed to create false confidence about live global agent occupancy. Unmerged branch state is not a globally authoritative lease, so PCO distinguishes durable lifecycle from ephemeral orchestration assignment rather than creating a second canonical status source.

**READY means structurally dependency-eligible, not globally unclaimed.** Live agent leasing remains a separate orchestration concern unless a reliable mechanism and concrete coordination failure earn further formalisation.

## Dependency semantics

The hard-dependency model remains intentionally small.

An edge means the downstream node cannot legitimately reach its claimed result until the upstream node is complete.

Do not add a vocabulary of soft/finish/advisory dependency types when a real gate can instead be represented as a separate node.

For example, current PLT work can continue while final PLT freeze depends on HRS:

```text
PLT-CURRENT-WORK -----------┐
                            v
HRS ----------------> PLT-FINAL-FREEZE
```

Conditional future evidence work is not a dependency until earned. BCR may discover that a selected detail needs PHY, EPR or DEL work. Until BCR admits a concrete obligation, the possibility of such work must not block the graph.

## Scheduler outputs

The control plane derives at least:

- ready frontier;
- exact blockers for blocked nodes;
- active/held/complete/cancelled counts;
- dependency chains;
- downstream nodes unlocked by a completion;
- useful safe-concurrency frontier;
- structural critical path;
- optional weighted critical path only where explicit non-authoritative effort estimates exist.

The scheduler output is the primary operational payoff: the repository can answer what can be worked on now without reconstructing that answer from chat context or prose tables.

## Maturity remains independent

`project/maturity.ts` remains an evidence-led authority with cumulative maturity typing.

PCO does not use historical maturity `currentState` / `nextGate` prose as execution authority. The generated status presents execution from `project/control/` and maturity as a separate epistemic judgement. The legacy verbose maturity renderer remains collapsed temporarily as compatibility for existing repository-integrity checks; it is non-authoritative for scheduling.

A maturity assessment answers questions of the form:

- which proposition/scope is assessed;
- which M-level is judged earned;
- when the judgement was reviewed;
- which cumulative evidence supports it.

A workstream can be complete at M2. An M4 proposition can reopen for new work without automatic demotion.

### Evidence-staleness guard

A dated review alone does not prove that the reviewed evidence is unchanged.

PCO therefore monitors registered maturity evidence content from the PCO baseline. If referenced evidence changes after that baseline, the affected assessment becomes **stale / reassessment required** rather than being automatically demoted or silently treated as freshly reviewed.

The monitoring baseline does not retroactively claim independent revalidation of historical evidence. It prevents future silent content drift from masquerading as a fresh assessment.

## Projection model

`STATUS.md` is no longer an independent authority for mutable project state.

Its role is a human/agent-readable projection assembled from:

- PCO execution state;
- `project/maturity.ts` maturity state;
- genuinely durable explanatory context only where that context is not mutable execution status.

No hand-authored READY/BLOCKED/NEXT table controls the programme when the graph can derive it.

`project/workstream-codes.md` similarly becomes a generated view of the typed workstream registry.

Mermaid/SVG dependency diagrams may be rendered from the same data, but remain projections rather than authority.

## Required guardrails

PCO validation enforces, where technically proportionate:

1. new first-class workstream codes are exactly three uppercase letters;
2. every live first-class three-letter workstream is registered;
3. every substantial bounded packet/gate intended for execution maps to a node;
4. every node has registered workstream ownership;
5. every dependency resolves;
6. the graph is acyclic;
7. node ids are unique;
8. started nodes do not have unmet hard dependencies except for an explicit temporary migration case;
9. complete nodes satisfy their declared closeout/output-evidence contract;
10. ready/blocked are derived rather than persisted;
11. generated projections are reproducible from canonical sources;
12. historical aliases do not become duplicate live identities;
13. speculative evidence routes do not become blockers until concretely admitted;
14. real owner-review/integration gates that block downstream work exist as graph nodes rather than prose-only obligations.

## Agent operating loop

The durable agent loop is:

```text
identify node
  -> verify runnable
  -> execute bounded work
  -> record durable result
  -> transition lifecycle if warranted
  -> validate control plane
  -> reconcile projection / closeout
```

This applies to substantial bounded work, not trivial implementation actions.

`project/control/README.md` records the operational mechanics. Root `AGENTS.md` remains the repository-wide constitution rather than duplicating a second control doctrine.

## Migration principles

Migration preserves provenance.

Do not bulk-rename historical packet files, releases or evidence merely to satisfy a cleaner namespace. Register aliases where needed.

Do not import every historical micro-step into the DAG. The graph is an executable programme model, not a forensic reconstruction of repository history.

The current frontier was migrated first so PCO became useful quickly; wider coverage was added only where needed to make scheduling and control coherent.

## Execution packets

### PCO-00 — control-plane inventory and authority map

Inventory all present control/status surfaces, first-class workstreams, active/held/closed programme records, historical aliases and current dependency claims. Record contradictions rather than silently selecting one source.

**Exit:** one reconciled migration inventory with explicit authority decisions and no hidden source family.

### PCO-01 — schema and concurrency-safe storage

Implement the typed workstream registry, node schema and sharded physical storage. Prove independent sibling-node edits do not require all concurrent agents to modify one central hot file.

**Exit:** schema compiles, representative node files validate, workstream identity is typed, and concurrency/merge behaviour is demonstrated.

### PCO-02 — derivation engine

Implement graph validation and derived readiness, blockers, frontier, unlocks and dependency-path reporting. Add structural critical-path reporting and optional weighted analysis without requiring false-precision estimates.

**Exit:** deterministic tests demonstrate correct results for representative ready/blocked/held/cancelled/complete graphs, cycles and missing dependencies.

### PCO-03 — live-frontier migration

Self-host PCO and migrate the current execution frontier first: IAS/OAS/HAD, their shared interface/triad gates, BCR, HRS, relevant final PLT gates and any directly blocking active work.

Validate the derived frontier against the intended programme before migrating wider history.

**Exit:** the current architecture programme can be scheduled from PCO without relying on hand-maintained dependency prose.

PCO-03 is the threshold after which deep high-concurrency agent fan-out should prefer the PCO frontier.

### PCO-04 — status and naming projections

Make mutable execution sections of `STATUS.md` and the live workstream-code table deterministic projections. Implement the main-safe rendering/update strategy so concurrent node branches do not all fight over generated files.

**Exit:** canonical source changes produce deterministic projections; stale projection behaviour is caught or automatically reconciled without making the projection a branch-level contention point.

### PCO-05 — maturity separation and stale-evidence guard

Separate visible epistemic maturity from PCO scheduling and add deterministic evidence-content drift surveillance.

**Exit:** execution does not derive from maturity prose, and evidence changes cannot silently masquerade as freshly reviewed maturity.

### PCO-06 — repository / CI / agent guardrails

Integrate PCO validation into the repository health path and record the minimal PCO-specific agent operating contract.

**Exit:** unknown codes, broken ownership, cycles/dangling deps, invalid lifecycle states, missing closeout contracts and relevant projection drift fail at the owning boundary.

### PCO-07 — wider migration and overlap removal

Register/migrate remaining live and held first-class workstreams plus completed/historical identities needed for coherent status. Reconcile `programme-controls.ts` and other overlapping lifecycle registries so each concept has one canonical owner.

**Exit:** no live first-class programme depends on an unregistered parallel lifecycle/status source.

### PCO-08 — adversarial closeout

Attack the control plane with at least:

- concurrent agents modifying sibling nodes;
- branch/main movement;
- stale projections;
- changed evidence beneath a maturity assessment;
- unknown workstream code;
- cycle and dangling dependency;
- speculative PHY/EPR/DEL route incorrectly treated as a blocker;
- completed node missing declared closeout evidence;
- historical alias mistaken for a live identity;
- clean-room restart by an agent with no chat context.

**Exit:** failures are caught at the correct boundary, recovery is legible, and the resulting system is simpler than the machinery it replaced.

Detailed closeout evidence is recorded in [`pco-08-adversarial-closeout.md`](pco-08-adversarial-closeout.md).

## Relationship to IAS/OAS/HAD/BCR/HRS

PCO is a project-control overlay, not a redesign dependency of the architecture itself.

IAS/OAS/HAD remain substantively governed by their architectural dependencies and shared interface/triad gates. PCO represents those gates and exposes their runnable frontier; it does not invent architectural decisions or turn possible future evidence routes into blockers.

PCO does not raise architectural, technical or publication maturity.

## Closeout

PCO-00 through PCO-08 are complete. The control plane is self-hosted, PR CI validates it, `main` serially reconciles generated status/naming projections, evidence-side work is represented without contaminating the book-resolution hard path, and clean-room restart from repository state has been demonstrated.

The bootstrap authority of this programme and #953 has therefore ended. Future execution state belongs to `project/control/`; this programme remains the durable rationale and design record for that system.

## Exit gate

PCO closes with the following conditions satisfied:

- all live first-class three-letter workstreams are registry-controlled;
- PCO has registered itself and its executable packets in the new system;
- the bootstrap exception has been removed;
- current executable work is represented at useful bounded-packet granularity;
- readiness, blockage, frontier and dependency paths are derived and demonstrably correct;
- graph structure is acyclic and validated;
- physical control storage does not create a monolithic parallel-edit hotspot;
- mutable execution/naming projections are generated from canonical sources;
- maturity is operationally independent from execution scheduling and future evidence drift is surfaced for reassessment;
- CI/agent guardrails catch the principal drift classes;
- a clean-room agent can recover what is runnable, blocked, complete and next from the repository alone;
- adversarial closeout passes;
- overlapping status machinery is removed, reduced to projection, or explicitly retained for a distinct non-overlapping compatibility role.

PCO closeout proves project-control coherence only. It does not prove architectural quality, construction adequacy, external validation or publication readiness.