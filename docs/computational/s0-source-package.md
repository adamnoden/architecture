# Domain S0 — Frozen Source Package v0.1

**Status:** frozen paper-compilation input package  
**Purpose:** provide one explicit, reproducible source model for the first manual compilation.  
**Date frozen:** 2026-10-03  
**Implementation:** none  
**Important:** dimensions below are either inherited project hypotheses or explicit **TEST ASSUMPTIONS**. They are not construction instructions.

> **The point of S0 is to test compilation semantics, not to smuggle an unfinished detail into the project as a specification.**

## 1. Build identity

~~~text
source package        S0-SOURCE-01
source model          S0-MODEL-01
target                T-ENG-NDW-2026-10-03-S0
supported domain      DOMAIN-S0
grammar               G-01-RESEARCH-PARTIAL
doctrine              LLH-01
baseline variant      S0-A
comparison variant    S0-B
lifecycle phase       DESIGN / PAPER COMPILE
~~~

The source package is immutable once referenced by a paper-compilation run.

A changed dimension or assumption creates a new source-package version.

## 2. Test-bay extent

The fixture represents one upper-floor external-wall bay and enough adjoining room/floor geometry to exercise:

- external wall;
- window opening;
- floor support;
- lateral wall restraint;
- weather/thermal/air boundaries;
- one intentional service penetration;
- maintenance/window replacement clearance;
- conventional wall finish versus selective tectonic lining.

### Nominal bay geometry — TEST ASSUMPTION

| Parameter | Value | Status |
|---|---:|---|
| bay width | 3000 mm | TEST ASSUMPTION |
| storey height represented | 3300 mm | TEST ASSUMPTION |
| nominal room clear height | 2850 mm | TEST ASSUMPTION |
| interior analysis depth | 1500 mm | TEST ASSUMPTION |
| principal floor span to opposite support | 4000 mm | TEST ASSUMPTION |

These values are intentionally ordinary rather than optimised.

They exist so geometric and quantity consequences can actually be calculated.

## 3. External wall family W-S0-01

Outside → inside:

| Layer | Nominal thickness | Status |
|---|---:|---|
| facing brick outer leaf | 102.5 mm | inherited Reference House hypothesis |
| residual drained cavity | 50 mm | inherited Reference House hypothesis |
| mineral-wool partial-fill insulation | 150 mm | inherited Reference House hypothesis |
| dense masonry inner leaf | 215 mm | inherited Reference House hypothesis |
| permanent parge / air-control layer | 8 mm | TEST ASSUMPTION based on coordination drawing |
| room-side finish | variant-specific | below |

Interpretation:

- the cavity zone is treated as **150 mm partial-fill insulation + 50 mm residual drained cavity**;
- the dense inner leaf is the enduring structural/mass wall;
- the parge layer is the provisional primary air-control surface;
- no routine service chasing is part of the source model.

### S0-A room-side finish

- conventional direct mineral/plaster finish;
- nominal finish thickness: **15 mm TEST ASSUMPTION**;
- no general-purpose service void.

### S0-B room-side finish

Replace the direct finish with a deliberately provisional W2 research assembly:

| Component | Nominal depth | Status |
|---|---:|---|
| sparse adjustable rail/backplane | 15 mm | TEST ASSUMPTION |
| service / absorption zone | 42 mm | inherited indicative coordination geometry |
| removable mineral panel | 18 mm | inherited indicative coordination geometry |
| total nominal W2 zone beyond parge | 75 mm | TEST ASSUMPTION / rounded research value |

The W2 dimensions exist only to test:

- boundary independence;
- tolerance logic;
- quantity consequences;
- mutation M4.

They are not a promoted pattern specification.

## 4. Window/opening O-S0-01

### Nominal geometry — TEST ASSUMPTION

| Parameter | Value |
|---|---:|
| masonry opening width | 1200 mm |
| masonry opening height | 1800 mm |
| sill above finished floor | 750 mm |
| head above finished floor | 2550 mm |
| side pier each side in 3000 mm bay | 900 mm |

The opening is centred in the bay for this fixture.

That centring is a **project-test condition**, not a promoted G-01 rule.

### Window semantics

- OPENING-O01 belongs to enduring masonry architecture;
- WINDOW-WIN01 is a shorter-lived replaceable component;
- exact frame material/profile/product: **UNSELECTED**;
- exact fixing interface: **UNRESOLVED**;
- exact Uw value: **UNRESOLVED**;
- exact lintel/head support: **UNRESOLVED**;
- weather/air/thermal transitions must remain explicit.

### Maintenance geometry — TEST ASSUMPTION

Reserve inside the room:

- working zone: 1400 mm wide × 1000 mm deep × 2200 mm high;
- withdrawal zone: 1400 mm wide × 1200 mm deep × 2200 mm high.

These are research clearances for mutation testing, not industry standards.

## 5. Floor F-S0-01

### Nominal geometry — TEST ASSUMPTION

- engineered timber I-joist family;
- nominal overall depth: **240 mm**;
- nominal centres: **400 mm**;
- nominal span to opposite support: **4000 mm**;
- nominal structural deck: **26 mm**;
- lower ceiling build-up: **30 mm nominal research allowance**;
- routine service distribution through I-joist webs: **PROHIBITED BY DOCTRINE PROFILE unless explicitly engineered**.

### Wall connection

Use a generic **restraint-type masonry joist-hanger family**.

This source package does **not** choose a commercial product.

Semantic claims:

- gravity support exists through the hanger family;
- wall-restraint role is declared;
- member/hanger capacity remains an external structural proof obligation;
- exact diaphragm connection remains external;
- every represented joist in the 3 m bay uses the restraint-type condition for the fixture.

At 400 mm nominal centres the research bay contains approximately eight joist occurrences crossing the external-wall line.

The count is a quantity-test assumption, not a framing layout.

## 6. Opening head support L-S0-01

For geometry only:

- nominal lintel/head-support length: **1500 mm TEST ASSUMPTION**;
- this represents 1200 mm clear opening + 150 mm nominal bearing each side.

This does **not** assert that 150 mm is adequate for a selected lintel/product/load case.

Head-support selection and bearing adequacy remain external structural evidence obligations.

## 7. Primary boundaries

### WEATHER-B01

Conceptual path:

~~~text
outer brick
→ drained residual cavity
→ opening head/jamb/sill water-management details
→ discharge to exterior
~~~

### THERMAL-B02

Conceptual path:

~~~text
150 mm insulation field
→ insulated opening transition
→ window frame/glazing
→ floor-edge/junction treatment
~~~

No U-value is authored as passed.

### AIR-B03

Primary proposed path:

~~~text
permanent parge on inner masonry
→ taped/sealed transition to window frame/interface
→ sealed controlled service sleeve
→ continuity across floor-edge detail
~~~

The removable S0-B lining is intentionally **not** the primary air barrier.

### MOISTURE-B04

Includes:

- precipitation management;
- cavity drainage;
- head/sill/reveal strategy;
- interstitial-condensation obligation.

### FIRE-B06

For S0, exercise only:

- internal lining reaction-to-fire/classification obligation;
- cavity/opening closure applicability;
- service-entry/cavity consequence.

Whole-house compartmentation is outside the slice.

### ACOUSTIC-B05

For this detached external-wall slice:

- model acoustic function as a **project performance boundary**;
- do not falsely attribute a separating-wall/floor Part E obligation to it.

## 8. Service route SR-S0-01

The source contains one deliberately sparse crossing.

### Purpose

A small electrical/data conduit feeds an exterior wall fitting/sensor.

### Geometry — TEST ASSUMPTION

- sleeved core diameter: **32 mm**;
- located in the right-hand masonry pier;
- centre approximately midway across the 900 mm pier;
- centreline 450 mm above finished floor;
- sleeve falls outward;
- location must remain outside lintel/hanger/no-go zones.

### Semantic route

~~~text
room-side low-level service route
→ controlled sleeve P01
→ AIR-B03 sealed transition
→ THERMAL-B02 local continuity obligation
→ WEATHER-B01 external termination obligation
→ exterior fitting
~~~

Exact electrical design/test remains external.

The source model allows this penetration because it is:

- explicit;
- sparse;
- located;
- inspectable;
- evidence-bearing.

This is materially different from arbitrary chasing.

## 9. Workmanship/tolerance inputs

### Common baseline

- nominal masonry geometry is not assumed perfect;
- room-side finished datum is explicit;
- window opening is measured before unit release/manufacture;
- hidden boundary conditions have pre-closure inspection obligations.

### S0-B W2 test envelope — TEST ASSUMPTION

For the paper test only:

- incoming room-face masonry deviation: **±10 mm**;
- available backplane adjustment: **±15 mm**;
- deviation > ±15 mm: remediation required rather than concealed adjustment.

These numbers exist solely to exercise the logic.

They must not be copied into a construction detail without prototype/manufacturer/workmanship research.

## 10. Site/context assumptions

S0 has no real site.

Therefore the following remain explicit.

### Known for target selection

- jurisdiction: England;
- new detached dwelling;
- ordinary low-rise/non-HRB context;
- hypothetical building-control application: 3 October 2026.

### Unknown / external

- driving-rain exposure;
- wind pressure;
- actual ground conditions;
- orientation;
- local noise;
- radon/flood conditions;
- whole-house fire strategy;
- whole-dwelling energy model.

### Consequence

The paper compile may use a generic cavity-wall route for exploration.

It may **not** claim the opening weather detail is release-grade until exposure is known.

## 11. Regulatory route anchors exercised by S0

These are target inputs, not copied standards.

### Structure

Approved Document A gives a route for small buildings in which floors provide lateral support to walls and recognises restraint-type joist hangers. It also places limits on masonry chases.

S0 exercises:

- lateral-support semantics;
- restraint-hanger route;
- chase mutation.

### Fire

Approved Document B Volume 1 exercises:

- internal lining classification;
- cavity closure around openings / service-entry conditions;
- the masonry-cavity-wall exception route where applicable.

### Moisture

Approved Document C exercises:

- drained cavity;
- residual-cavity geometry;
- protection of the inner leaf;
- window/reveal joints resisting precipitation.

### Energy / airtightness

Under the frozen S0 target, Approved Document L Volume 1 (2021 edition incorporating 2023 amendments) exercises:

- limiting wall/window U-value obligations;
- explicit air-barrier continuity;
- sealed service penetrations;
- window-to-primary-air-barrier connection;
- parge/plaster strategy on dense blockwork.

### Electrical

Part P interaction remains external except for the building-fabric consequences of route/penetration.

## 12. Key target values used as obligations, not authored results

Under the frozen S0 target:

- maximum limiting U-value for new external wall: **0.26 W/(m²·K)**;
- maximum limiting U-value for window: **1.6 W/(m²·K)**;
- whole-dwelling air-permeability limiting value exists but is outside this isolated bay proof.

S0 does not invent U-values for unselected materials/products.

## 13. Derived geometry/quantities — source stage

From the frozen nominal geometry:

- gross wall-bay area: **9.90 m²**;
- window/opening area: **2.16 m²**;
- net opaque wall area: **7.74 m²**;
- outer-brick volume within net bay: **0.793 m³**;
- 50 mm residual-cavity volume within net bay: **0.387 m³**;
- 150 mm insulation volume within net bay: **1.161 m³**;
- 215 mm inner-masonry volume within net bay: **1.664 m³**;
- room-side finish/parge field area, before reveals: **7.74 m²**.

For S0-B:

- removable panel field, before reveals/cuts: **7.74 m²**;
- exact rail quantity remains dependent on the rail/module layout and is not fabricated here.

These are geometric quantities, not procurement quantities.

They exclude:

- waste;
- returns/reveals;
- mortar;
- wall ties;
- cavity trays/closers;
- lintel volume;
- fixings;
- cutting allowances.

## 14. Source-level invariants

The paper compiler should treat these as authored constraints.

1. WINDOW-WIN01 must remain replaceable separately from WALL-W01.
2. primary air/weather/thermal boundaries may not depend solely on removable S0-B panels.
3. routine services may not be created by arbitrary masonry chasing.
4. every permanent-fabric penetration is explicit and typed.
5. floor support and wall restraint are distinct obligations even if one hanger family contributes to both.
6. geometry may be assumed; proof may not.
7. unknown site conditions remain visible dependencies.
8. no G-01 research observation is elevated to statutory or physical authority.

## 15. Deliberate mutations frozen for Run 01

### M1 — window widening

Change opening width:

**1200 → 1800 mm**

Consequences expected:

- each side pier: 900 → 600 mm;
- window area: 2.16 → 3.24 m²;
- net opaque wall area: 7.74 → 6.66 m²;
- lintel/head-support evidence stale;
- residual-pier structural evidence stale;
- thermal/weather/window evidence stale;
- wall quantities update;
- service penetration remains geometrically unchanged unless no-go zone expands.

### M2 — ad-hoc horizontal masonry chase

Attempt:

- 25 mm deep horizontal chase through 215 mm inner leaf for service routing.

This is deliberately chosen because it demonstrates authority separation.

Approved Document A's small-building guidance limits horizontal chase depth to one-sixth of leaf thickness, which is approximately **35.8 mm** for a 215 mm leaf.

Therefore the mutation may remain within that single dimensional guidance limit while still:

- violating the Long-Life House doctrine profile;
- potentially creating other structural/boundary obligations;
- being rejected as the wrong service strategy.

### M3 — obstruct withdrawal volume

Place a fixed joinery element 500 mm into the required 1200 mm withdrawal depth.

Expected:

- ordinary geometry remains buildable;
- maintenance/replacement obligation fails.

### M4 — W2 tolerance excursion

Change incoming masonry deviation:

**+10 → +20 mm**

against the paper-test W2 adjustment envelope of ±15 mm.

Expected:

- structural/boundary source geometry remains unchanged;
- W2 workmanship/interface obligation fails;
- remediation required;
- compiler must not silently enlarge adjustment.

## 16. What is deliberately still absent

The source package does not select:

- an I-joist manufacturer;
- a hanger product;
- a lintel product;
- window product;
- cavity closer;
- insulation product;
- exact block density/conductivity;
- panel product;
- air-sealing tape/sealant;
- electrical fitting;
- fire/acoustic tested build-up.

Those belong to evidence resolution, not source intent.

If Run 01 “passes” those obligations without external evidence, the paper compiler has failed its own epistemic rules.

---

## Source anchors

- Reference House vertical bay coordination: ../reference-house/vertical-bay-coordination.md
- Reference House vertical bay options: ../reference-house/vertical-bay-options.md
- Working floor baseline: ../research/primary-floor-structure-baseline.md
- Workmanship robustness: ../research/workmanship-robustness.md
- S0 target snapshot: s0-target-snapshot.md
- Approved Document A: https://www.gov.uk/government/collections/approved-document-a-structure-and-associated-documents
- Approved Document B: https://www.gov.uk/government/publications/fire-safety-approved-document-b
- Approved Document C: https://www.gov.uk/government/publications/site-preparation-and-resistance-to-contaminates-and-moisture-approved-document-c
- Approved Document L: https://www.gov.uk/government/publications/conservation-of-fuel-and-power-approved-document-l
