# PCO-00 — Control-plane inventory and authority map

**State:** complete  
**Date:** 2026-10-28  
**Parent:** PCO #953

## Question

What currently claims to describe workstream identity, execution state, dependency order or maturity, and which source should own each concept after PCO migration?

## Existing control surfaces

| Surface | Present role | PCO disposition |
|---|---|---|
| `project/workstream-codes.md` | manual live naming/alias register | bootstrap source only; replace with a projection of the typed workstream registry |
| GitHub workstream issues | purpose, scope, packets, dependencies, closeout and discussion | retain as narrative/provenance; executable lifecycle/dependencies migrate to PCO |
| workstream programme Markdown | durable programme reasoning, authority boundaries, packet descriptions | retain as narrative authority; mutable execution state becomes a PCO projection/reference |
| `project/book-resolution-programme.md` | cross-stream programme map | retain architectural/programme reasoning; PCO becomes execution scheduler for its graph |
| `STATUS.md` | project-wide present-state prose plus generated maturity block | convert mutable execution material to generated projection; keep only durable context that is not execution state |
| `project/maturity.ts` | typed maturity levels, evidence and currently some execution-like `currentState`/`nextGate` prose | remain canonical for epistemic maturity only; remove roadmap duplication after PCO projection is available |
| `scripts/update-status.ts` | renders maturity block into `STATUS.md` | evolve into/alongside deterministic control-plane rendering without creating a branch hot spot |
| `project/programme-controls.ts` | lifecycle-sensitive navigation register for selected development controls | preserve temporarily; reconcile in PCO-07 so navigation lifecycle is not mistaken for workstream execution lifecycle |
| `scripts/validate-repository.ts` | repository-wide integrity enforcement | integrate PCO structural/evidence/projection validation in PCO-06 |
| `AGENTS.md` | durable agent operating constitution | add only the minimal PCO operating rule after the control plane is proven |
| chat context | transient operational context | never canonical; clean-room restart must be possible from repository state |

## First-class workstream identities found

The current live naming surface explicitly recognises the following three-letter identities:

`ADE`, `BCR`, `BSR`, `DEL`, `DPL`, `DRW`, `EDA`, `EPR`, `HAD`, `HFI`, `HRS`, `IAS`, `ILA`, `OAS`, `OCG`, `PCO`, `PHY`, `PLT`, `PUB`, `TYP`.

`RH` remains a deliberate two-letter Reference House gate family and is grandfathered rather than cosmetically renamed.

Historical aliases such as `PR-*` for current `PUB-*` and `P01`…`P04` for current `PHY-*` are provenance identities, not additional live workstreams.

## Current executable frontier selected for PCO-03 migration

The first scheduler slice is deliberately narrow and useful:

- PCO itself, so the control plane self-hosts;
- completed BSR root as the established dependency for the current book-resolution programme;
- IAS, OAS and HAD Wave 0 roots;
- one shared Wave 0.5 interface-freeze gate;
- the Wave 1 core packets;
- stream-specific Wave 2 work plus one canonical node for each pairwise cross-stream interface, with the issue packet names retained as aliases;
- IAS/OAS/HAD convergence and one shared triad integration gate;
- BCR early scaffolding separately from post-triad substantive convergence;
- HRS synthesis;
- continuing PLT current-review work separately from final post-HRS plate freeze;
- renewed EDA assurance;
- content-independent PUB-02 preparation separately from the final manufacture gate.

PHY, EPR and DEL are registered but are **not** speculative hard dependencies of BCR. Concrete nodes/edges are added only if BCR earns a specific obligation.

## Authority decisions

1. **Workstream identity** moves to the typed PCO registry.
2. **Executable lifecycle and hard dependencies** move to sharded PCO node manifests.
3. **READY/BLOCKED/frontier** are always derived.
4. **Maturity** remains separately judged from evidence in `project/maturity.ts`.
5. **Narrative reasoning and provenance** stay in issues/programme/result records.
6. **Generated Markdown/diagrams** are projections and never become upstream authority.
7. **GitHub issue open/closed state** is useful corroboration, not the machine-readable execution source of truth.
8. **Historical packet identities** are retained as aliases where needed; PCO is not a nomenclature rewrite.
9. **Completed history** is registered at workstream level unless it is needed to explain the current dependency frontier; PCO is not a forensic reconstruction of every past packet.
10. **Parallel-edit safety** is an architectural requirement of PCO itself: routine node state changes must not require every agent to edit one central graph file.

## Contradictions / drift observed

The repository already demonstrates why PCO is required: some older issue/programme bodies still contain historically correct “current packet” language after newer status/closeout records have superseded it. No such prose is deleted merely to clean history; PCO instead establishes a current execution authority that future agents can query deterministically.

Likewise, `project/maturity.ts` already provides strong typed evidence discipline but also carries mutable `currentState` and `nextGate` prose. That overlap is accepted during bootstrap and is explicitly removed/reduced in PCO-05 after the execution projection exists.

## Result

The migration boundary is now explicit. No additional control surface is allowed to become a competing source of executable state during PCO implementation. PCO-01 may proceed against this authority map.