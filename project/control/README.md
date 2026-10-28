# Project control

This directory is the machine-readable execution-control plane for Ovid’s House.

It does **not** own architectural truth, maturity judgement or narrative history.

## Agent operating loop

For substantial bounded project work:

1. identify the owning PCO node;
2. verify the node is `ready` (or already durably `active`) from the derived control state;
3. read the owning issue/programme/result sources for scope and authority;
4. execute the bounded work without silently changing another node/workstream’s owned decisions;
5. commit durable result / closeout evidence;
6. change only the owning sharded node lifecycle when the evidence warrants it;
7. run project-control validation and the applicable repository/workstream checks;
8. let main-branch projection reconciliation update `STATUS.md` and `project/workstream-codes.md`.

Do not hand-author `READY` or `BLOCKED`. Do not treat GitHub issue open/closed state as execution authority. Do not create a graph node for every implementation micro-step.

**READY means structurally dependency-eligible, not globally unclaimed.** PCO does not currently provide a live agent/branch lease. A separate session or branch may already be exploring a ready node without having established durable lifecycle state on `main`; check live concurrent work before launching duplicate execution when that matters.

If substantial authorised work has no suitable node, add a bounded node to the owning workstream before treating the work as part of the execution programme. New first-class workstreams must be registered with exactly three uppercase letters; historical exceptions/aliases are not precedents for new codes.

## Sources

- `workstreams.ts` — first-class workstream identity.
- `nodes/` — sharded executable packets/gates and deliberate lifecycle.
- `derive.ts` — readiness, blockers, frontier, unlocks and structural critical path.
- `validate.ts` — structural and evidence-contract guardrails.
- `render.ts` — human-readable projections.
- `../maturity.ts` — separate epistemic maturity authority.
- `../maturity-freshness.ts` — evidence-content drift surveillance for maturity reassessment.

Root `AGENTS.md` remains the repository-wide operating constitution. This README adds only the PCO-specific execution mechanics; it does not duplicate or weaken the root rules.