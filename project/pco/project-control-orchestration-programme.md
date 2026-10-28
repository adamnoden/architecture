# PCO — Project Control & Orchestration

**State:** authorised / bootstrap workstream  
**Issue:** [#953](https://github.com/adamnoden/architecture/issues/953)  
**Date:** 2026-10-28

## Purpose

PCO creates the deterministic project-control plane for Ovid’s House.

Its purpose is not to add project-management ceremony. It is to make the execution structure the project already uses explicit enough that many agents can work concurrently without stale status, invented readiness, duplicate work or conflicting dependency assumptions.

The governing doctrine is:

> **The repository has one machine-readable project control model. Workstream identity and execution state live there; readiness and blockage are derived; maturity remains an independent evidence judgement; human-readable status is a projection, never an authority.**

Execution state and epistemic maturity are deliberately different. Finishing work does not automatically raise maturity. Reopening work does not automatically lower maturity.

## Existing foundation

PCO is not starting from nothing.

The repository already has:

- a typed maturity model in `project/maturity.ts`;
- a generated maturity block in `STATUS.md`;
- repository validation that checks maturity evidence paths and rendered-block drift;
- a manual workstream-code register in `project/workstream-codes.md`;
- lifecycle-sensitive programme records in `project/programme-controls.ts`;
- dependency/state statements in programme documents and GitHub issues;
- an `AGENTS.md` constitution that already requires bounded packets, authority checks, restart-safe records, reconciliation and closeout.

The problem is that these controls overlap without one execution authority. PCO consolidates the execution model while preserving the independent authority of maturity, architecture, evidence and narrative history.

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

PCO is the one bootstrap exception: this programme and #953 temporarily authorise PCO until the new registry can register PCO itself. That exception must disappear before PCO closes.

## Target control architecture

The semantic separation is fixed even if PCO-01 refines exact filenames:

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

Executable definitions/state should therefore be physically sharded at roughly node/packet scale and aggregated deterministically by tooling. A plausible layout is `project/control/nodes/<CODE>/<NODE>.ts`, but PCO-01 may select a simpler equivalent if it preserves independent edits and strong validation.

Generated status has the same constraint. Concurrent feature branches must not all be forced to rewrite a large shared `STATUS.md` merely because one node changed. PCO-04 must implement a main-safe projection/update strategy that keeps the canonical branch current without making generated Markdown a routine merge-conflict surface.

## Workstream registry

The registry owns durable identity. A record must be able to state, where applicable:

- canonical three-letter code;
- title;
- owning GitHub issue;
- canonical programme/control source;
- historical aliases;
- workstream-level lifecycle/retirement metadata only where that concept is genuinely workstream-wide.

The registry, not Markdown, becomes the source for the live code table.

## Executable node model

A DAG node represents a **substantial bounded packet or gate at approximately useful agent-execution scale**.

It does not represent every commit, lookup, discussion or implementation sub-step.

A node must identify at least:

- stable id;
- owning workstream or explicit shared ownership;
- bounded title/question;
- hard dependencies;
- deliberate lifecycle;
- expected durable output / closeout evidence;
- optional effort metadata where useful for scheduling.

Effort estimates are planning metadata, not evidence. Structural scheduling must continue to work when no estimate exists.

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

`started` must not be allowed to create false confidence about live global agent occupancy. If unmerged branch state cannot reliably act as a global lease, PCO must distinguish durable lifecycle from ephemeral orchestration assignment rather than create a second canonical status source.

The initial PCO control plane only needs durable truth. Live agent leasing may remain an orchestration-layer concern until there is a reliable mechanism worth formalising.

## Dependency semantics

The hard-dependency model should remain intentionally small.

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

The control plane should derive at least:

- ready frontier;
- exact blockers for blocked nodes;
- active/held/complete/cancelled counts;
- dependency chains;
- downstream nodes unlocked by a completion;
- useful safe-concurrency frontier;
- structural critical path;
- optional weighted critical path only where explicit non-authoritative effort estimates exist.

The scheduler output is the primary operational payoff: the repository should be able to answer what can be worked on now without reconstructing that answer from chat context or prose tables.

## Maturity remains independent

`project/maturity.ts` remains an evidence-led authority with cumulative maturity typing.

Once equivalent execution truth exists in PCO, maturity should no longer duplicate roadmap concepts such as mutable `currentState` and `nextGate` prose.

A maturity assessment should answer only:

- which proposition/scope is assessed;
- which M-level is judged earned;
- when the judgement was reviewed;
- which cumulative evidence supports it.

A workstream can be complete at M2. An M4 proposition can reopen for new work without automatic demotion.

### Evidence-staleness guard

A dated review alone does not prove that the reviewed evidence is unchanged.

PCO should design for, and implement if proportionate, deterministic evidence fingerprints for maturity assessments. If referenced evidence changes after review, the assessment should become **stale / reassessment required** rather than being automatically demoted or silently treated as freshly reviewed.

An explicitly proven equivalent safeguard is acceptable if fingerprinting creates disproportionate complexity, but silent evidence drift is not.

## Projection model

`STATUS.md` should cease to be an independent authority for mutable project state.

Its target role is a human/agent-readable projection assembled from:

- PCO execution state;
- `project/maturity.ts` maturity state;
- genuinely durable explanatory context only where that context is not mutable execution status.

No hand-authored READY/BLOCKED/NEXT table should survive if the graph can derive it.

`project/workstream-codes.md` similarly becomes a generated view of the typed workstream registry.

Mermaid/SVG dependency diagrams may be rendered from the same data, but remain projections rather than authority.

## Required guardrails

PCO validation should enforce, where technically proportionate:

1. new first-class workstream codes are exactly three uppercase letters;
2. every live first-class three-letter workstream is registered;
3. every substantial bounded packet/gate intended for execution maps to a node;
4. every node has registered workstream ownership;
5. every dependency resolves;
6. the graph is acyclic;
7. node ids are unique;
8. started nodes do not have unmet hard dependencies except for an explicit temporary bootstrap/migration case;
9. complete nodes satisfy their declared closeout/output-evidence contract;
10. ready/blocked are derived rather than persisted;
11. generated projections are reproducible from canonical sources;
12. historical aliases do not become duplicate live identities;
13. speculative evidence routes do not become blockers until concretely admitted;
14. real owner-review/integration gates that block downstream work exist as graph nodes rather than prose-only obligations.

## Agent operating loop

After PCO is functioning, the durable agent loop becomes:

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

If useful without disproportionate friction, PR/branch metadata may declare its graph node (for example `Work: IAS-01V`). That is an integration aid, not a reason to create a large GitHub-specific control system.

## Migration principles

Migration preserves provenance.

Do not bulk-rename historical packet files, releases or evidence merely to satisfy a cleaner namespace. Register aliases where needed.

Do not import every historical micro-step into the DAG. The graph is an executable programme model, not a forensic reconstruction of repository history.

Migrate the current frontier first so PCO becomes useful quickly; widen coverage only enough to make scheduling and control coherent.

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

Remove duplicated execution/roadmap state from the maturity model once PCO owns it. Preserve cumulative evidence typing. Implement or explicitly bound the maturity-evidence fingerprint/reassessment mechanism.

**Exit:** maturity contains epistemic assessment rather than scheduling state, and evidence changes cannot silently masquerade as freshly reviewed maturity.

### PCO-06 — repository / CI / agent guardrails

Integrate PCO validation into the repository health path. Add only the minimal durable `AGENTS.md` requirements necessary for future agents to use the graph correctly.

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

## Relationship to IAS/OAS/HAD/BCR/HRS

PCO is a priority infrastructure overlay, not a redesign dependency of the architecture itself.

Already-authorised root exploration need not be thrown away. The intention is to land PCO-03 before deep high-concurrency fan-out so the larger swarm uses a deterministic frontier instead of prose reconstruction.

PCO does not raise architectural, technical or publication maturity.

## Exit gate

PCO may close only when:

- all live first-class three-letter workstreams are registry-controlled;
- PCO has registered itself and its executable packets in the new system;
- the bootstrap exception has been removed;
- current executable work is represented at useful bounded-packet granularity;
- readiness, blockage, frontier and dependency paths are derived and demonstrably correct;
- graph structure is acyclic and validated;
- physical control storage does not create a monolithic parallel-edit hotspot;
- mutable execution/naming projections are generated from canonical sources;
- maturity is independent and no longer duplicates roadmap state;
- changed maturity evidence cannot silently remain presented as a freshly reviewed assessment;
- CI/agent guardrails catch the principal drift classes above;
- a clean-room agent can recover what is runnable, blocked, complete and next from the repository alone;
- adversarial closeout passes;
- obsolete overlapping status machinery is removed, reduced to projection, or explicitly retained for a distinct non-overlapping role.

PCO closeout proves project-control coherence only. It does not prove architectural quality, construction adequacy, external validation or publication readiness.