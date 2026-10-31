# Validation Execution Register

**Status:** active evidence-control register  
**Applicability reconciled:** 2026-10-29

**Development-policy amendment:** 2026-10-31. Follow the [owner's development and assurance policy](../../project/owner-house-charter.md#development-and-assurance--31-october-2026). Internal research, calculation and challenge may complete without an external response. The rows below track distinct evidence events, not a competing execution queue; canonical PCO nodes and live ACO claims govern dispatch.

**Purpose:** distinguish prepared work from issued work, physical work and actual evidence after RH-11.

The accepted house is RH-LAYOUT-REVISION-02 / RH-LAYOUT-FAMILY-02. Historical gate closure and maturity do not validate its changed geometry or selected assemblies. The current physical findings still require architectural decisions as well as competent external findings, calculations and physical evidence.

A document being ready is not evidence that the underlying proposition passed.

**Canonical workstreams:**

- [#912 — PHY physical validation](https://github.com/adamnoden/architecture/issues/912)
- [#913 — EPR external professional review](https://github.com/adamnoden/architecture/issues/913)

**Live execution issues:**

- [#30 — PHY-03 floor-edge research, calculations and provisional option reduction](https://github.com/adamnoden/architecture/issues/30) — legacy `P03`
- [#31 — PHY-04 wall/ceiling movement-junction build and test](https://github.com/adamnoden/architecture/issues/31) — legacy `P04`
- [#32 — RH-11 competent external-review execution](https://github.com/adamnoden/architecture/issues/32) — Reference House gate executed through EPR

Historical `P01`–`P04`, derived `P03-*` / `P04-*` identifiers and existing evidence filenames remain valid provenance aliases. New live packet control uses `PHY-*`. `RH-11` is not renamed because it belongs to the Reference House gate sequence.

## State vocabulary

- **PREPARED / UNISSUED** — current questions are written; source manifest and remaining issue inputs must be confirmed before authorised issue;
- **READY** — sufficient at the package’s recorded historical scope; current issue/build release requires explicit applicability, not just the inherited label;
- **UNISSUED** — ready package has not yet been given to the relevant competent reviewer;
- **INTERNAL DEVELOPMENT** — research/calculation work can proceed under its canonical packet; no external or physical result is implied;
- **BLOCKED — EXTERNAL** — a named acceptance/evidence event requires an external input not yet received; this does not prohibit preceding internal development;
- **BLOCKED — BUILD** — protocol exists but physical specimen has not been built;
- **IN REVIEW / IN TEST** — evidence generation has actually started;
- **FINDING OPEN** — material negative/qualifying result received and not closed;
- **EVIDENCED** — result exists, scope is explicit and required findings are closed;
- **HELD** — no present Reference House dependency justifies active work.

---

## A. EPR — external professional review

| ID | Work | Current state | Prepared package | Next evidence event | Rewind owner if material failure |
|---|---|---|---|---|---|
| `ER-STR-01` | structural engineering review | **PREPARED / UNISSUED** | `external-review-structural-rh11.md` | source-bound response on actual support/aperture/member envelopes and service crossings; engineering release before any relevant prototype | structural owner / HAD / IAS / OAS / ROF / RWT, through BCR and HRS |
| `ER-FIRE-01` | fire / building-control review | **PREPARED / UNISSUED** | `external-review-fire-building-control-rh11.md` | actual escape/smoke, guard/access, primary closure and opening/security strategy | HAD / OAS / IAS / services / DPL; BCR routes material findings |
| `ER-MEP-01` | MEP / acoustic review | **PREPARED / UNISSUED** | `external-review-mep-acoustic-rh11.md` | selected duties, continuous routes, real connections, acoustic/support/renewal evidence; no inherited MVHR/ASHP selection | services / HAD / IAS / structure / OAS / RWT / DPL |
| `ER-BPE-01` | building physics / energy review | **PREPARED / UNISSUED** | `external-review-building-physics-energy-rh11.md` | actual layered enclosure, current roof/court/opening model, climate/site and applicable calculation basis | OAS / IAS / ROF / RWT / services / HAD / DPL |
| `ER-HFI-01` | human-factors / inclusive-design review | **PREPARED / UNISSUED** | `external-review-human-factors-inclusive-design-rh11.md` | complete occupied actions with actual leaves/furniture/guards/products, adaptation and renewal; retained adverse cases | HAD / IAS / OAS / services; real-site approach remains DPL |

Workstream owner: [EPR #913](https://github.com/adamnoden/architecture/issues/913).  
Reference House execution gate: [RH-11 #32](https://github.com/adamnoden/architecture/issues/32).

No row above may move to **EVIDENCED** because an email was sent or a meeting occurred. Record the actual finding and closure evidence.

`EPR-DESK-REVIEW` is the separate self-service investigation of these five question sets under the [EPR internal-review contract](../../project/epr/external-professional-review-programme.md#epr-desk-review--internal-technical-answers-and-challenge). Its supported, contradicted or unresolved findings must answer the questions and route design consequences. It does not change the external response state in this table.

---

## Baseline applicability before issue or build

The [EPR applicability result](../../project/epr/current-house-review-applicability.md) records the corrected five briefs, exact source identities and remaining issue prerequisites. Their preparation does not authorise contact or establish professional evidence. Fix the actual reviewed source and selected-system manifest, identify missing information and recheck changes before issue.

The PHY-04 READY labels below describe retained historical preparation, not release of a current-house specimen. Current applicability requires selected receiving/support/closure geometry and engineer-defined structural scope for the floor edge, or the current ordinary/optional upper-joint occurrence and actual movement basis for the wall/ceiling study. The retained 2950 mm rig, ±5 mm capability and old SVGs do not prove the current 3100 mm room or its movement demand. Height difference alone proves neither adequacy nor failure. The [PHY applicability result](../../project/phy/current-house-prototype-applicability.md) owns that separate reconciliation and release; no prototype is built or passed here. Historical document bodies, P01/P02 holds and actual manual evidence gates remain intact; internal floor-edge investigation is explicitly separated below.

The [DEL inventory](../../project/del/del-00-delivery-baseline.md) routes delivery consequences. The current-house design and physical findings remain applicable inputs; no prepared brief or test protocol closes them.

---

## B. PHY-03 — structural floor edge

Historical evidence identity: `P03`.

### `PHY-03A` — internal calculations and provisional option reduction

Historical alias: `P03-A`.  
**State:** **INTERNAL DEVELOPMENT** — canonical `PHY-03-ENGINEERING` is self-service
**Execution issue:** [#30](https://github.com/adamnoden/architecture/issues/30)

Retained historical inputs:

- [P03 Engineering Brief](../prototypes/p03-floor-edge-engineering-brief.md);
- [P03 Test Protocol](../prototypes/p03-floor-edge-test-protocol.md);
- [P03 option diagram](../prototypes/p03-floor-edge-options.svg);
- RH-05 structural geometry;
- conventional restraint-hanger baseline;
- direct/seated-bearing comparator;
- bespoke shoe/ledge only as earned challenger.

Current inputs must first apply STR/material direction and a named source revision. The retained timber/hanger families are not a compulsory baseline for the later non-timber structural brief. Follow the [PHY internal-development contract](../../project/phy/physical-validation-programme.md#phy-03-engineering--internal-development-contract).

Next development result:

> An internally challenged options study with reproducible preliminary calculations, failure/sensitivity checks, a reasoned recommendation and proposed test scope. External response is not a completion condition; structural/specimen acceptance remains separate.

### `PHY-03B` — full-scale junction evidence

Historical alias: `P03-B`.  
**State:** **BLOCKED — EXTERNAL**

Internal PHY-03A completion does **not** release geometry. Before building/loading a structural specimen, obtain the competent source-bound structural/specimen release through **ER-STR-01 / EPR-RH11**, including accepted actions, detail, safe method and limits in the [PHY release conditions](../../project/phy/current-house-prototype-applicability.md#p03-engineering-release-before-any-structural-claim). A physical connection assembled without that release cannot establish structural evidence.

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

Retained historical build target:

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
