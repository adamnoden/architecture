# Validation Execution Register

**Status:** active evidence-control register  
**Date:** 2026-10-27

**Purpose:** distinguish prepared work from issued work, physical work and actual evidence after RH-11.

The Reference House is M3 at coordinated virtual-design scope. The design-gate sequence is closed. Progress now means converting bounded uncertainties into competent external findings, calculations, simulations or physical results.

A document being ready is not evidence that the underlying proposition passed.

**Canonical workstreams:**

- [#912 — PHY physical validation](https://github.com/adamnoden/architecture/issues/912)
- [#913 — EPR external professional review](https://github.com/adamnoden/architecture/issues/913)

**Live execution issues:**

- [#30 — PHY-03 structural floor-edge engineering option reduction](https://github.com/adamnoden/architecture/issues/30) — legacy `P03`
- [#31 — PHY-04 wall/ceiling movement-junction build and test](https://github.com/adamnoden/architecture/issues/31) — legacy `P04`
- [#32 — RH-11 competent external-review execution](https://github.com/adamnoden/architecture/issues/32) — Reference House gate executed through EPR

Historical `P01`–`P04`, derived `P03-*` / `P04-*` identifiers and existing evidence filenames remain valid provenance aliases. New live packet control uses `PHY-*`. `RH-11` is not renamed because it belongs to the Reference House gate sequence.

## State vocabulary

- **READY** — brief/protocol is sufficient to issue/build;
- **UNISSUED** — ready package has not yet been given to the relevant competent reviewer;
- **BLOCKED — EXTERNAL** — next result requires competence/tooling not present inside the project;
- **BLOCKED — BUILD** — protocol exists but physical specimen has not been built;
- **IN REVIEW / IN TEST** — evidence generation has actually started;
- **FINDING OPEN** — material negative/qualifying result received and not closed;
- **EVIDENCED** — result exists, scope is explicit and required findings are closed;
- **HELD** — no present Reference House dependency justifies active work.

---

## A. EPR — external professional review

| ID | Work | Current state | Prepared package | Next evidence event | Rewind owner if material failure |
|---|---|---|---|---|---|
| `ER-STR-01` | structural engineering review | **READY / UNISSUED** | `external-review-structural-rh11.md` | competent structural response + PHY-03 engineering option reduction | RH-05, possibly RH-04 |
| `ER-FIRE-01` | fire / building-control review | **READY / UNISSUED** | `external-review-fire-building-control-rh11.md` | competent review of escape, Part M, service/interface closure | RH-03/RH-04/RH-09 as finding dictates |
| `ER-MEP-01` | MEP / acoustic review | **READY / UNISSUED** | `external-review-mep-acoustic-rh11.md` | plant-room packing, MVHR/ASHP/acoustic response | RH-06/RH-07/RH-10 |
| `ER-BPE-01` | building physics / energy review | **READY / UNISSUED** | `external-review-building-physics-energy-rh11.md` | envelope/junction/overheating/daylight/energy response | RH-02/RH-04/RH-07/RH-08/RH-10 |
| `ER-HFI-01` | human-factors / inclusive-design review | **READY / UNISSUED** | `external-review-human-factors-inclusive-design-rh11.md` | competent complete-action / finished-interface response; unresolved laundry and life-course questions retained | relevant RH plan/stair/interface owner; site approach stays with DPL |

Workstream owner: [EPR #913](https://github.com/adamnoden/architecture/issues/913).  
Reference House execution gate: [RH-11 #32](https://github.com/adamnoden/architecture/issues/32).

No row above may move to **EVIDENCED** because an email was sent or a meeting occurred. Record the actual finding and closure evidence.

---

## Baseline applicability before issue or build

READY describes the prepared package at its recorded source scope. The [current Georgian re-plan](../reference-house/georgian-replan.md) is an architectural proposal awaiting technical migration, with changed stair, attic, roof and service geometry. Before issuing any RH-11 brief or releasing a prototype for that proposal, the execution owner must declare its source revision and reconcile affected inputs, review questions and acceptance limits. Historical compiler passes and older review/prototype geometry do not validate the successor.

For P04, explicitly assess the applicability of the retained 2950 mm rig to the proposed 3100 mm clear rooms and the relevant movement demand before build. Height difference alone establishes neither adequacy nor failure. Retain the older baseline as provenance. The [DEL inventory](../../project/del/del-00-delivery-baseline.md) routes the delivery consequences without changing these execution states.

---

## B. PHY-03 — structural floor edge

Historical evidence identity: `P03`.

### `PHY-03A` — engineered option reduction

Historical alias: `P03-A`.  
**State:** **READY / BLOCKED — EXTERNAL**  
**Execution issue:** [#30](https://github.com/adamnoden/architecture/issues/30)

Inputs now frozen:

- [P03 Engineering Brief](../prototypes/p03-floor-edge-engineering-brief.md);
- [P03 Test Protocol](../prototypes/p03-floor-edge-test-protocol.md);
- [P03 option diagram](../prototypes/p03-floor-edge-options.svg);
- RH-05 structural geometry;
- conventional restraint-hanger baseline;
- direct/seated-bearing comparator;
- bespoke shoe/ledge only as earned challenger.

Next evidence event:

> competent structural engineer reduces the set to calculable geometries and states what, if anything, a full-scale specimen can prove.

### `PHY-03B` — full-scale junction evidence

Historical alias: `P03-B`.  
**State:** **BLOCKED — EXTERNAL**

Do not build until PHY-03A releases the geometry. A physical connection assembled before engineering is an architectural mock-up, not structural evidence.

---

## C. PHY-04 — wall / ceiling movement junction

Historical evidence identity: `P04`.

### `PHY-04-BUILD`

Historical alias: `P04-BUILD`.  
**State:** **READY / BLOCKED — BUILD**  
**Execution issue:** [#31](https://github.com/adamnoden/architecture/issues/31)

Inputs:

- [P04 Build Pack](../prototypes/p04-wall-ceiling-build-pack.md);
- [P04 rig diagram](../prototypes/p04-wall-ceiling-rig.svg);
- RH-09 `WCJ-01` architectural location;
- three families: conventional control / concealed slip / functional metal challenger.

Build target:

- full-height **2950 mm** room-corner specimen;
- ≥1200 mm wall width;
- ≥1000 mm ceiling projection;
- independently adjustable ceiling edge with at least ±5 mm rig capability.

### `PHY-04-TEST`

Historical alias: `P04-TEST`.  
**State:** **READY / BLOCKED — BUILD**

Protocol:

- [P04 Test Protocol](../prototypes/p04-wall-ceiling-test-protocol.md).

Evidence sequence includes:

- baseline room-quality comparison;
- project-derived movement envelope where available;
- exploratory ±1/2/3 mm screen if it is not;
- 20 movement cycles;
- decoration-lock test;
- 10 local removal/reinstatement cycles;
- imperfect-background trial;
- sound/tactile screen;
- over-range failure and repair;
- later specialist check that primary fire/acoustic/air duties remain independent of decorative trim.

A visually attractive specimen with no movement/reinstatement evidence remains **BLOCKED**, not passed.

---

## D. Other PHY work

### PHY-01 — W2 wall bay

Historical alias: `P01`.  
**State:** **HELD / OPTIONAL RESEARCH**

The build pack and protocol remain valid. The Reference House does not depend on W2; W0/W1 are complete architectural baselines.

Resume PHY-01 when resources justify the generic evidence question or if a later project condition creates a real high-change lining task.

### PHY-02 — selective floor access

Historical alias: `P02`.  
**State:** **HELD**

No current Reference House service task earns it. Reopen only if later service coordination places a genuinely maintainable component beneath a bounded circulation/floor zone.

---

## E. Evidence-processing rule

For every external or physical result, create a result record containing:

```text
question
→ evidence source / competence
→ result
→ scope / limitations
→ finding classification
→ affected RH object / pattern occurrence
→ owning gate
→ correction or confirmation
→ downstream documents made stale
→ closure evidence
→ maturity consequence, if any
```

Negative evidence is progress when it causes a clean rejection or rewind.

Do not promote the Reference House above M3 until the evidence required by the project's maturity definition actually exists. Do not promote a House Kernel pattern merely because one Reference House specimen passes.