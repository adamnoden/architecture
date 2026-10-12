# RH-C0 — Reference House Model Freeze

**Status:** active pre-compiler hardening programme  
**Date:** 2026-10-12  
**Purpose:** make the coordinated Reference House precise enough to become the controlled regression fixture for RH-C1 without confusing model certainty with technical validation.  
**Next gate:** [RH-C1 — Reference House Executable Slice](reference-house-executable-slice.md)

## Position

The Reference House is currently **M3 — Coordinated at virtual-design scope**. That is sufficient to justify computational work, but not sufficient to treat every number, drawing and downstream assumption as a canonical machine fact.

RH-C0 therefore asks a narrower question than external validation:

> **Do we know exactly which house we mean, which facts are authoritative, which facts are derived, which remain provisional, and whether the current plans, sections, elevations and schedules actually describe the same building?**

RH-C0 does **not** attempt to prove structural capacity, building-physics performance, fire compliance, MEP adequacy, construction quality or statutory approval. Those remain engineering, simulation, prototype or competent-review obligations.

The intended outcome is a **controlled reference fixture**, not a claim that the Reference House is a universally correct or construction-ready house.

---

# Working rules

1. **Repository state outranks chat.** Start from current controlling RH authorities and recorded supersessions.
2. **Do not average contradictions.** If two current authorities conflict, identify the owner and repair the owning RH gate or explicitly supersede it.
3. **Do not freeze a duplicated fact.** Every compiler-bound value must be clearly authored once or derived from authored facts.
4. **Do not promote technical assumptions through coding.** A provisional joist depth, wall family or opening product does not become proven because TypeScript represents it.
5. **Reconstruction must be independent of the drawings being checked.** Use controlling dimensions and relationships first; compare drawings afterwards.
6. **Architectural review remains architectural.** Domestic quality, proportion and repose are reviewed explicitly rather than converted into arbitrary numeric pass rules.
7. **Negative findings are progress.** A clean rewind is preferable to encoding a contradiction.
8. **RH-C1 remains blocked until the RH-C0 gate passes.**

---

# Stage RH-C0.1 — Authority consolidation

## Question

What are the current controlling facts of the Reference House, and which document owns each one after all RH-00→RH-11 supersessions?

## Work

Read the current authority stack, including at minimum:

- Reference House README;
- Reference House design programme;
- RH-02 ground-floor authority;
- RH-03 stair / upper-floor authority;
- RH-04 plan-section-elevation authority, with later roof supersession noted;
- RH-05 structural coordination;
- RH-06/RH-07/RH-10 service and energy authorities;
- RH-08 roof/access authority;
- RH-09 occupied-interface authority;
- RH-10 whole-house audit, envelope and outer-elevation coordination;
- RH-11 review package where it clarifies unresolved status.

Create a fact schedule covering the compiler-bound architectural baseline. Each record should contain, where applicable:

```text
fact ID
semantic subject
value / relationship
unit
owning authority
source location
status: CONTROLLED / PROVISIONAL / OPEN
supersedes / superseded-by
notes / dependencies
```

The schedule should cover at least:

- shell and courtyard;
- storey and ceiling datums;
- wall planning thickness assumptions;
- room/circulation topology and gross geometry;
- stair geometry;
- principal axes/bays;
- major openings and opening families;
- current roof family and gross roof datums;
- major structural support lines needed to interpret plan geometry;
- major service/plant/riser zones where they constrain architecture.

## Output

Create/update:

`docs/reference-house/model-baseline-rhc0.md`

## Gate

PASS only when every RH-C1 source fact has one identifiable current owner or is explicitly marked unresolved/provisional.

---

# Stage RH-C0.2 — Independent dimensional reconstruction

## Question

If the current controlling documents are treated as instructions rather than pictures, do they reconstruct one coherent house?

## Method

Reconstruct the Reference House **without using the existing SVG geometry as source truth**.

Start from controlling dimensions, topology and relationships. Recalculate, as applicable:

- outer shell and courtyard placement;
- side/front/rear wing depths;
- enclosed gross plate area;
- principal room/circulation fields;
- stair run/rise/landing geometry;
- wall planning offsets;
- principal opening/bay centres;
- plan-to-section vertical relationships.

Then compare the reconstruction with the current drawings.

Do not change the reconstruction merely to resemble an SVG. If a drawing differs, record the discrepancy first and determine which authority is wrong or stale.

## Output

Add an **Independent reconstruction** section to `model-baseline-rhc0.md` and create, if useful:

`docs/reference-house/rhc0-discrepancy-register.md`

For every discrepancy record:

```text
ID
subject
controlling fact
observed conflicting representation
severity
owning RH gate
smallest correction
stale downstream documents
status
```

## Gate

PASS when the current authorities reconstruct one geometrically coherent house or every remaining discrepancy is explicitly open and blocks the affected fact from RH-C1.

---

# Stage RH-C0.3 — Authored vs derived closure

## Question

Which values are genuine design inputs, and which should exist only as consequences of those inputs?

## Work

Classify every RH-C1 fact as one of:

- **AUTHORED** — intentional source input;
- **DERIVED** — deterministic consequence of authored facts;
- **EVIDENCE-BACKED** — imported result whose validity depends on declared source facts;
- **PROVISIONAL ASSUMPTION** — useful working value, not yet evidence;
- **OUTSIDE RH-C1** — deliberately excluded from the first executable slice.

Examples of the intended discipline:

```text
shell width                  AUTHORED
courtyard width              AUTHORED
west wing gross width        DERIVED
first-floor FFL              AUTHORED
stair riser count            AUTHORED
stair rise                   DERIVED
front bay axes               AUTHORED or grammar-derived — choose one authority
opening centre               DERIVED where governed by bay axis
```

Eliminate duplicated authorship. If two source values can contradict while supposedly describing the same relationship, one should normally become derived.

## Output

Add authored/derived classification and dependency notes to `model-baseline-rhc0.md`.

## Gate

PASS when no RH-C1 fact is unknowingly authored twice and every derived value has a clear dependency path.

---

# Stage RH-C0.4 — Mutation and dependency red-team

## Question

Do we understand the consequences of changing the high-leverage source facts before encoding them?

## Minimum mutations

Test at least these conceptual mutations against the current design:

1. shell width `-300 mm`;
2. courtyard width or depth `+400 mm`;
3. wall planning thickness `450 → 500 mm`;
4. first-floor FFL `+150 mm`;
5. stair riser count `18 → 17`;
6. front bay/axis spacing changed materially;
7. service riser clear dimension `-150 mm` on its critical axis;
8. representative major opening width `+250 mm`;
9. roof fall/catchment logic reversed toward the courtyard;
10. plant/service-room gross area reduced materially.

For each mutation, state before implementation:

```text
source fact changed
expected direct derived changes
expected obligations made stale
expected architectural conflicts
owning gate(s) that would need review
facts that should remain unaffected
```

This is not optimisation. It is a dependency test.

## Output

Create:

`docs/reference-house/rhc0-mutation-map.md`

## Gate

PASS when the major dependencies of RH-C1 source facts are understood well enough to write meaningful mutation tests rather than only snapshot tests.

---

# Stage RH-C0.5 — Fresh domestic and architectural adversarial review

## Question

Before freezing the house into software, does it still work convincingly as a house rather than merely as a coordinated systems diagram?

## Review from first principles

Do a fresh whole-house read deliberately separate from subsystem optimisation. At minimum test:

- ordinary furniture layouts and usable clearances;
- door swings and circulation conflicts;
- room proportions after conservative wall assumptions;
- bedroom usefulness rather than nominal fit;
- kitchen/dining/family relationships;
- stair arrival and upper circulation;
- storage and mundane domestic functions;
- daylight dependence on outer façades versus courtyard;
- courtyard usefulness, shade and psychological/spatial value relative to its cost;
- service-room/plant/riser area proportionality;
- whether technical geography is bullying principal rooms;
- whether any circulation is dead or overlong;
- whether the approximately 230 m² gross house is proportionate to the four-bedroom brief;
- whether later simplifications remain simplifications in lived use;
- whether G-01 or Georgian taste has leaked upstream into House Kernel reasoning;
- whether any House Kernel principle is being performed theatrically rather than earning its space/material/complexity.

Use excellent ordinary domestic architecture as the implicit comparator. House Kernel-specific complexity receives no credit merely for expressing the project philosophy.

If the review finds a real architectural defect, repair it through the owning RH gate and propagate the consequences before model freeze.

## Output

Create:

`docs/reference-house/rhc0-domesticity-audit.md`

## Gate

PASS when no known domestic or architectural defect is being frozen merely because previous coordination gates happened to pass.

---

# Stage RH-C0.6 — Drawing parity and cross-view audit

## Question

Do the current plan, section and elevation representations describe the same controlled geometry?

## Checks

Audit at minimum:

```text
plan ↔ plan
plan ↔ section
plan ↔ elevation
section ↔ elevation
opening ↔ host room/wall
opening ↔ architectural axis
wall ↔ structural support line
stair ↔ storey datums
courtyard ↔ section height
roof ↔ cornice/parapet/elevation
service zones ↔ room geometry
```

Check dimensions and semantic identity, not merely visual plausibility.

Classify each existing SVG/drawing as:

- **CURRENT GEOMETRIC AUTHORITY**;
- **CURRENT DIAGRAM / NON-GEOMETRIC**;
- **STALE — REPLACE/CORRECT**;
- **HISTORICAL / PROVENANCE ONLY**.

A diagram may remain useful without being allowed to supply canonical coordinates.

## Output

Create:

`docs/reference-house/rhc0-drawing-parity-audit.md`

Update/correct owning drawings or documents where discrepancies are resolved.

## Gate

PASS when every drawing that will act as the visual comparator for RH-C1 is geometrically consistent with the controlled baseline, and stale drawings are clearly demoted rather than left ambiguously authoritative.

---

# Stage RH-C0.7 — Controlled fixture freeze

## Question

Which parts of the Reference House are safe to encode as RH-C1 source truth, and which must remain provisional or outside the slice?

## Classification

Every relevant object/fact should be classified as:

### `FROZEN_FOR_RH_C1`
Stable enough to act as the canonical regression-fixture source.

Expected examples, subject to the preceding audits:

- outer shell;
- courtyard gross geometry;
- storey datums;
- room/circulation topology;
- principal stair geometry;
- major wall locations at planning level;
- principal architectural axes;
- major opening positions.

### `PROVISIONAL_BUT_REPRESENTABLE`
May be encoded because the current design depends on it, but the compiler and documentation must preserve its provisional authority.

Possible examples:

- planning wall-thickness family;
- some gross opening sizes;
- roof gross geometry;
- plant/riser reservation sizes.

### `OUTSIDE_RH_C1`
Do not turn into first-slice source truth.

Expected examples:

- engineered joist/member sizes;
- foundation design;
- final window product geometry;
- final thermal build-up and junction values;
- final duct sizing;
- heat emitters and heat-loss sizing;
- detailed drainage sizing;
- technical details dependent on competent review or simulation.

## Final outputs

`model-baseline-rhc0.md` becomes the canonical pre-compiler baseline and must include:

- authority/fact schedule;
- authored/derived classification;
- frozen/provisional/out-of-scope classification;
- unresolved items;
- supersession notes;
- RH-C1 source contract.

The RH-C0 closeout must also link:

- discrepancy register;
- mutation map;
- domesticity audit;
- drawing parity audit;
- any rewound RH gates and their closure evidence.

## RH-C0 PASS gate

RH-C0 passes only when all of the following are true:

1. every RH-C1 fact has one current authority;
2. current authorities reconstruct one coherent house;
3. no compiler-bound fact is unknowingly authored twice;
4. high-leverage mutation consequences are recorded well enough to become tests;
5. the house has survived a fresh domestic/architectural adversarial review;
6. current comparator drawings agree with the baseline or are explicitly demoted;
7. every fact is classified `FROZEN_FOR_RH_C1`, `PROVISIONAL_BUT_REPRESENTABLE` or `OUTSIDE_RH_C1`;
8. unresolved technical proof is still visible and has not been converted into machine certainty;
9. any material contradiction discovered by RH-C0 has been repaired in its owning RH gate and propagated forward;
10. the Reference House remains at whatever maturity its actual evidence supports — RH-C0 does not automatically promote M3.

Only then may issue **#33 / RH-C1** begin encoding the fixture.

---

# Restart protocol

A fresh session undertaking RH-C0 should read, in order:

1. `STATUS.md`;
2. `docs/development/reference-house-design-programme.md`;
3. `docs/reference-house/README.md`;
4. `docs/reference-house/whole-house-coordination-audit.md`;
5. this RH-C0 programme;
6. `docs/computational/reference-house-executable-slice.md` for the downstream contract;
7. then the owning RH documents required by the active RH-C0 stage.

Work one RH-C0 stage at a time. Commit the outputs and update the programme state after each stage so interruption does not lose the chain of reasoning.

Do not start RH-C1 code until RH-C0 is explicitly closed PASS.