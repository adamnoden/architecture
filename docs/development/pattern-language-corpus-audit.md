# Pattern-Language Overhaul — Phase 6 Corpus Audit

**Status:** working classification matrix; canonical pattern prose remains untouched  
**Phase:** 6 — corpus audit  
**Prerequisite:** [Phase 5 PASS](pattern-language-phase5-review.md)  
**Controlling contract:** [HSA Pattern Language — Model and Authoring Contract](../patterns/language-model.md)

## Purpose

This audit decides what the House Systems Architecture pattern language actually contains before any full migration is allowed.

The old Core 12, reversible-assembly candidates and 30-item publication outline were created for different purposes at different moments. Their labels are therefore not authoritative. This document tests each proposition against the same conceptual stack:

```text
DOCTRINE
   ↓
STRATEGY
   ↓
PATTERN
   ↓
IMPLEMENTATION FAMILY
   ↓
PROJECT OCCURRENCE
```

Rules/obligations and evidence sit alongside that stack rather than being forced into it.

The objective is **fewer, clearer, more composable concepts**. Preserving the old count is explicitly not a goal.

---

# 1. Decision vocabulary

**RETAIN** — current pattern identity survives substantially intact.  
**RENAME** — pattern identity survives, but the present name creates a misleadingly narrow or broad reading.  
**DEMOTE** — useful proposition belongs at strategy / implementation / project level rather than as a pattern.  
**MERGE** — two or more current propositions are better understood as one reusable invariant.  
**SPLIT** — current proposition hides multiple materially different reusable relationships.  
**HOLD** — plausible pattern candidate, but evidence/scope is not strong enough for canonical admission.  
**RETIRE** — no separate language object is justified; retain source/history where useful.

Stable IDs are assigned only during Phase 7. Existing IDs survive only where identity survives. Retired IDs are never reused.

---

# 2. Executive audit findings

The current corpus does **not** want to become a 30-pattern language unchanged.

The strongest emerging shape is:

- the existing Core 12 mostly survives;
- one Core 12 item (`Water-Damage-Safe Service Route`) should become a **strategy**;
- `Horizontal Service Spine` survives but needs a name/scope correction so it does not imply one mixed-services duct;
- the Reference House exposed a genuine new candidate: **Accessible Vertical Service Zone**;
- `Service Skirting` and `Vertical Joinery Route` are better treated as implementations/variants of a broader **Accessible Room Service Route** pattern;
- `Fixing Infrastructure` and `Architectural Backplane` converge on one stronger pattern: **Controlled Attachment Plane**;
- `Seated Floor Structure`, `Finish-Agnostic Floor Platform` and `Functional Cornice` are presently implementation-shaped propositions, not canonical patterns;
- several old publication slots (`local deep zone`, `undercroft`, `floor access`, `withdrawable pipe`) are useful design options but have not earned standalone pattern identity;
- several missing/underdeveloped patterns are real enough to retain as **candidates**, not yet canonical objects.

This is already a reduction in conceptual clutter rather than a catalogue expansion.

---

# 3. Core 12 audit

| Current | Decision | Recommended kind/name | Evidence | Reason / migration action |
|---|---|---|---|---|
| **01 Controlled Utility Entry** | **RETAIN** | Pattern — `Controlled Utility Entry` | Established | Clear recurring external-to-internal relationship; multiple supplier/interface implementations; strong composition with hub and penetrations. Preserve `HSA-P-001`. |
| **02 Plant Room as Service Hub** | **RETAIN** | Pattern — `Plant Room as Service Hub` | Established | Strong spatial pattern with area/acoustic/replacement forces. Preserve `HSA-P-002`. |
| **03 Horizontal Service Spine** | **RENAME** | Pattern — **`Coherent Horizontal Service Route`** | Supported | Phase-5 run showed the invariant is coherent route topology, not one shared mixed-services duct. Preserve `HSA-P-003` if body is rewritten around service-specific routes and short branches. |
| **04 High-Service-Room Service Wall** | **RETAIN** | Pattern — `High-Service-Room Service Wall` | Supported | Clear recurring room/interface relationship; multiple dry-side/service-wall constructions. Preserve `HSA-P-004`. |
| **05 Designed Structural Penetration** | **RETAIN** | Pattern — `Designed Structural Penetration` | Established | Strong interface pattern that follows topology rather than creating it. Preserve `HSA-P-005`. |
| **06 Water-Damage-Safe Service Route** | **DEMOTE** | Strategy — **`Fail-Safe Water Distribution`** / working title | Established principle; implementations vary | Phase-5 house uses fundamentally different physical responses for plant, riser, kitchen, bathroom and drainage. Common invariant is performance, not one spatial relationship. Retire `HSA-P-006` as pattern; do not reuse ID. Child candidates assessed separately below. |
| **07 Permanent Opening / Replaceable Window** | **RETAIN** | Pattern — `Permanent Opening / Replaceable Window` | Supported | Strong lifespan/interface invariant; many frame/subframe/weathering implementations. Preserve `HSA-P-007`. |
| **08 Movement / Slip Junction** | **RETAIN** | Pattern — `Movement / Slip Junction` | Established principle | Recurring interface relationship with multiple gap/overlap/trim/seal implementations. Preserve `HSA-P-008`. |
| **09 Accessible Rainwater Route** | **RETAIN** | Pattern — `Accessible Rainwater Route` | Established principle | Coherent route/failure relationship; external/internal variants remain within same invariant. Preserve `HSA-P-009`. |
| **10 Source-Capture Kitchen Extract** | **RETAIN** | Pattern — `Source-Capture Kitchen Extract` | Established | Distinct geometry/maintenance/air-replacement forces justify separate pattern rather than generic ventilation advice. Preserve `HSA-P-010`. |
| **11 Roof Maintenance Route** | **RETAIN** | Pattern — `Roof Maintenance Route` | Established principle | Clear task-to-access geometry; implementation can be hatch, scaffold/interface, safe position etc. Preserve `HSA-P-011`. |
| **12 Physical Service Index** | **RETAIN** | Pattern — `Physical Service Index` | Proposed | Stewardship-scale pattern; recurrence and physical/digital resilience justify identity. Preserve `HSA-P-012`, but evidence remains Proposed. |

## Core-12 consequence

Ten existing IDs survive unchanged; one survives with a clearer name (`P-003`); one (`P-006`) should cease to be a pattern.

That is a useful sign: the migration is correcting taxonomy without gratuitously renaming mature material.

---

# 4. Developed specialised pattern

| Current | Decision | Recommended kind/name | Evidence | Reason / migration action |
|---|---|---|---|---|
| **Ground-Supported Façade Access** | **RETAIN** | Pattern — `Ground-Supported Façade Access` | Supported | Excellent pattern anatomy: task-specific context, spatial access/support relationship, variants, proportionality and evidence. Assign new stable ID in Phase 7. |

This pattern also confirms that HSA patterns need not all be interior/component patterns. Site + ground + façade relationships properly belong in the language when they are reusable architectural moves.

---

# 5. Reversible-assembly candidates audit

## 5.1 Seated Floor Structure

**Decision: DEMOTE current item; retain the stronger abstraction as a strategy under review.**

The document itself states that evidence supports the **decomposition principle** more strongly than a bespoke seated connection.

Recommended classification:

- **Strategy:** `Decompose Structural Interface Functions` — distinguish gravity support, restraint, diaphragm transfer, movement and boundary duties rather than collapsing them into one vague “fixed connection”;
- **Implementation candidates:** certified restraint hanger; direct bearing + separate restraint; seated/captured shoe/ledge; other engineer-supported variants;
- **Reference House decision:** baseline remains ordinary certified hardware until a challenger proves an advantage.

Why not a pattern yet: the reusable proposition is currently closer to engineering/design strategy than one recurring spatial relationship. If future floor/wall worked cases reveal a consistent architectural interface invariant, Phase 7+ may admit a narrower pattern.

**Migration action:** remove `Seated Floor Structure` from the future pattern list; keep its research/prototype track intact.

---

## 5.2 Architectural Backplane

**Decision: MERGE + RENAME.**

The reusable invariant is stronger than one specific rail/frame arrangement:

> provide a durable, load-classified attachment plane between permanent fabric and faster-changing fit-out so repeated occupation/renewal does not repeatedly consume the permanent wall.

Recommended pattern candidate:

**`Controlled Attachment Plane`**

This absorbs the old publication placeholder **Fixing Infrastructure**.

Implementation families may include:

- timber grounds;
- metal rails;
- slotted sections;
- local heavy-load plates;
- joinery-integrated fixing zones;
- picture/dado rails where they genuinely carry load.

**Evidence:** Supported.  
**Action:** admit as a strong pattern candidate; stable ID only in Phase 7 after final matrix review.

---

## 5.3 Replaceable Wall Lining

**Decision: RENAME + HOLD as strong pattern candidate.**

Recommended name:

**`Replaceable Architectural Lining`**

The reusable relationship is not “wall panels” as a product type. It is separation of a room-facing, shorter-lived architectural surface from slower primary boundaries where service/access/lifecycle conditions justify it.

It passes the admission test conceptually, but physical/repose quality remains a major unresolved gate. A pattern can be evidence-supported while project-immature, but here the risk is central to whether the proposition should be recommended at all.

**Evidence:** Supported direction.  
**Maturity:** prototype pending.  
**Action:** hold as candidate through physical wall-bay comparison; do not promote merely through Phase 7 prose migration.

---

## 5.4 Finish-Agnostic Floor Platform

**Decision: DEMOTE current item to implementation candidate.**

The current identity depends too heavily on one low-profile removable-platform concept.

Stronger general proposition under review:

**Strategy:** separate primary structural floor from shorter-lived finish/access layers where service/renewal value justifies it.

Potential future pattern candidate:

**`Selective Accessible Floor Zone`** — provide local accessible floor geography where actual service/change demand justifies it, rather than assuming full-room removability.

The Phase-5 discipline points toward selective depth/access, not maximal platformisation.

**Action:** keep the full-room finish-agnostic platform as a prototype challenger; do not admit it to the canonical pattern language yet.

---

# 6. New Phase-5 candidate

| Current | Decision | Recommended kind/name | Evidence | Reason / migration action |
|---|---|---|---|---|
| **Accessible Vertical Service Zone** | **HOLD / likely admit** | Pattern candidate — `Accessible Vertical Service Zone` | Supported direction | Passes admission test; two internal whole-house studies demonstrate usefulness; domestic proportionality and external professional challenge remain. Keep unnumbered through final Phase-6 review. |

The name deliberately avoids implying that every house needs a commercial-style riser or continuously accessible shaft.

---

# 7. Publication-inventory audit — Service topology

| Inventory item | Classification | Action | Notes |
|---|---|---|---|
| utility entry | Pattern | **Mapped to `HSA-P-001`** | No duplicate. |
| plant hub | Pattern | **Mapped to `HSA-P-002`** | No duplicate. |
| riser / vertical service zone | Pattern candidate | **Mapped to Accessible Vertical Service Zone** | Do not use generic `riser` as the canonical invariant. |
| horizontal spine / route | Pattern | **Mapped to `HSA-P-003` rename** | Coherent service-specific route topology. |
| high-service wall | Pattern | **Mapped to `HSA-P-004`** | No duplicate. |
| local deep zone | Pattern candidate / project tactic | **HOLD** | Recurring response where local duct/drainage depth would otherwise deepen a whole storey. Needs own forces/evidence before admission. May become `Local Deep Service Zone`. |
| undercroft option | Implementation/topology family | **DEMOTE / HOLD outside language** | A crawlspace/undercroft is one way to realise maintenance geography and drainage/service access, but currently too construction/site-specific to be a pattern. |

### Service-topology finding

The language should describe **where services are concentrated and how routes relate**, not canonise every possible place to put them.

---

# 8. Publication-inventory audit — Distribution and access

| Inventory item | Classification | Action | Notes |
|---|---|---|---|
| service skirting | Implementation variant | **MERGE upward** | Strong source material, but best understood as one implementation of broader room-scale accessible routing. |
| vertical joinery route | Implementation variant | **MERGE upward** | Door surrounds/panelling solve the same room-scale problem in the vertical direction. |
| **new combined abstraction** | Pattern candidate | **`Accessible Room Service Route`** | Local room distribution uses removable architectural joinery/fit-out rather than chasing permanent fabric. Skirting, door surrounds and local panels become variants. Strong candidate. |
| controlled penetration | Pattern | **Mapped to `HSA-P-005`** | No duplicate. |
| compartmented void | Pattern candidate | **HOLD / likely admit as `Compartmented Service Void`** | Clear recurring boundary relationship: services cross, open void stops. Strong fire/acoustic/pest composition; needs evidence page. |
| floor access | Strategy / pattern candidate | **HOLD / redefine** | Too vague. If retained, likely `Selective Floor Access` tied to actual service/change geography, not generic removable flooring. Must be reconciled with floor-platform prototype. |

### Distribution finding

This category should likely collapse from five catalogue slots to roughly three reusable concepts:

1. Accessible Room Service Route;
2. Designed Structural Penetration;
3. Compartmented Service Void;

plus a still-unproven selective floor-access candidate.

---

# 9. Publication-inventory audit — Water and failure

| Inventory item | Classification | Action | Notes |
|---|---|---|---|
| manifold | Pattern candidate | **HOLD as `Individually Isolatable Manifold Distribution`** | Recurring network/maintenance relationship, multiple products/materials. Strong but should not imply a manifold is universally superior for every domestic system. |
| withdrawable pipe | Implementation family | **DEMOTE** | Pipe-in-pipe/conduit/withdrawable run is one implementation of replaceable/joint-minimised distribution, not yet a distinct architectural pattern. |
| water-damage-safe route | Strategy | **DEMOTE Core P-006** | Becomes umbrella failure strategy. |
| leak detection path | Pattern candidate | **RENAME / HOLD as `Visible Leakage Path`** | Passive path from concealed-risk geography to a legible safe point is a real recurring physical relationship. Electronic sensing remains supplemental implementation. |
| wet-service room | Pattern candidate | **RENAME / HOLD as `Failure-Tolerant Wet Service Room`** | Utility/laundry/service rooms have recurring high-consequence water/appliance forces. Strong candidate; bathrooms may share some but not all invariant. |

### Water finding

A cleaner hierarchy is emerging:

```text
FAIL-SAFE WATER DISTRIBUTION  [strategy]
        │
        ├── Individually Isolatable Manifold Distribution  [candidate]
        ├── Visible Leakage Path                            [candidate]
        ├── Failure-Tolerant Wet Service Room               [candidate]
        └── implementation families: accessible joints / pipe-in-pipe / sensing / containment / etc.
```

This is materially clearer than one overloaded `Water-Damage-Safe Service Route` pattern.

---

# 10. Publication-inventory audit — Openings and interfaces

| Inventory item | Classification | Action | Notes |
|---|---|---|---|
| window | Pattern | **Mapped to `HSA-P-007`** | Preserve. |
| door | Pattern candidate | **HOLD / likely admit as `Permanent Opening / Replaceable Door`** | Shares lifespan logic with window but has materially different adjustment, wear, privacy/security and repeated-use forces. Separate pattern justified. |
| threshold | Pattern candidate | **HOLD / likely admit as `Designed Threshold`** | Recurring junction between floor assemblies / exterior weathering / wear / movement. Internal/external variants should remain within one interface pattern if possible. |
| slip/movement joint | Pattern | **Mapped to `HSA-P-008`** | Preserve. |
| experimental functional cornice | Implementation family / Reference House expression | **DEMOTE** | A cornice may realise a movement/access/route interface, but “functional cornice” is not itself the reusable invariant. Keep in Reference House/prototype work. |

### Openings finding

Do not create a generic abstract “replaceable opening” pattern merely to reduce the count. Windows and doors share ancestry but carry sufficiently different forces to remain separate usable patterns.

---

# 11. Publication-inventory audit — Envelope and environment

| Inventory item | Classification | Action | Notes |
|---|---|---|---|
| perimeter dry zone | Pattern candidate | **HOLD as `Perimeter Dry / Inspection Zone`** | Potentially strong multi-function site/envelope relationship: wall-base drying/drainage/inspection + latent access territory. Needs evidence and definition to avoid becoming a universal gravel strip. |
| rainwater route | Pattern | **Mapped to `HSA-P-009`** | Preserve. |
| kitchen source capture | Pattern | **Mapped to `HSA-P-010`** | Preserve. |
| bathroom extraction | Pattern candidate | **HOLD as `Source-Capture Bathroom Extract`** | Recurring moisture-plume + transfer-air + maintainable fan/duct relationship. Different enough from grease-laden kitchen extract to merit separate treatment if evidence remains strong. |
| roof-maintenance route | Pattern | **Mapped to `HSA-P-011`** | Preserve. |
| ground-supported façade access | Pattern | **RETAIN specialised developed pattern** | Assign stable ID in Phase 7. |

---

# 12. Publication-inventory audit — Occupation and stewardship

| Inventory item | Classification | Action | Notes |
|---|---|---|---|
| fixing infrastructure | Pattern candidate | **MERGE with Architectural Backplane → `Controlled Attachment Plane`** | One stronger invariant avoids two overlapping records. |
| physical service index | Pattern | **Mapped to `HSA-P-012`** | Preserve. |

---

# 13. Provisional target language after classification

This is **not** the Phase-7 final pattern list. It is the smallest useful picture after removing obvious category errors.

## A. Existing patterns likely to survive

1. `HSA-P-001` Controlled Utility Entry
2. `HSA-P-002` Plant Room as Service Hub
3. `HSA-P-003` Coherent Horizontal Service Route — renamed identity
4. `HSA-P-004` High-Service-Room Service Wall
5. `HSA-P-005` Designed Structural Penetration
6. `HSA-P-007` Permanent Opening / Replaceable Window
7. `HSA-P-008` Movement / Slip Junction
8. `HSA-P-009` Accessible Rainwater Route
9. `HSA-P-010` Source-Capture Kitchen Extract
10. `HSA-P-011` Roof Maintenance Route
11. `HSA-P-012` Physical Service Index
12. Ground-Supported Façade Access — new ID later

`HSA-P-006` would be retired as a pattern ID.

## B. Strong pattern candidates

- Accessible Vertical Service Zone
- Accessible Room Service Route
- Compartmented Service Void
- Controlled Attachment Plane
- Replaceable Architectural Lining
- Individually Isolatable Manifold Distribution
- Visible Leakage Path
- Failure-Tolerant Wet Service Room
- Permanent Opening / Replaceable Door
- Designed Threshold
- Perimeter Dry / Inspection Zone
- Source-Capture Bathroom Extract

## C. Weaker / unresolved candidates

- Local Deep Service Zone
- Selective Floor Access / Selective Accessible Floor Zone

These need evidence/precedent and worked cases before Phase 7 should create canonical pattern pages.

## D. Strategies, not patterns

- Fail-Safe Water Distribution
- Decompose Structural Interface Functions
- separate primary structural floor from shorter-lived finish/access layers where proportionate

These may be publication strategies or Part-II material rather than Part-III pattern pages.

## E. Implementation families / experimental expressions

- undercroft service topology;
- withdrawable / pipe-in-pipe distribution;
- Seated Floor Structure;
- Finish-Agnostic Floor Platform;
- functional cornice;
- service skirting as one room-route implementation;
- door-surround vertical electrical route as one room-route implementation.

---

# 14. Graph discipline emerging from the audit

The audit does **not** authorise a dense relationship graph.

A likely sparse backbone is enough:

```text
Controlled Utility Entry
        ↓ completes / feeds context for
Plant Room as Service Hub
        ↓
Accessible Vertical Service Zone [candidate]
        ↓
Coherent Horizontal Service Route
        ↓
Accessible Room Service Route [candidate]
        ↓
High-Service-Room Service Wall
```

This is illustrative, not yet canonical graph metadata.

Cross-cutting patterns such as `Designed Structural Penetration`, `Compartmented Service Void`, `Visible Leakage Path` and `Physical Service Index` attach only where their problem actually occurs.

Do not encode sequence order as graph dependency merely to reproduce the service-topology diagram.

---

# 15. Formalisation boundary

The audit confirms three classes of relationship to the computational track.

### Patterns with obvious formal consequences

Examples:

- utility-entry occurrence has boundary transitions and isolation geography;
- service hub has access/working/replacement volumes;
- horizontal/vertical routes have continuity, clearance and crossing implications;
- structural penetrations create boundary/structural obligations;
- maintenance routes have approach/working/withdrawal geometry;
- physical index requires stable identities shared with records.

These consequences can map to semantic relationships/obligations later.

### Patterns only partly formalizable

Examples:

- Controlled Attachment Plane;
- Replaceable Architectural Lining;
- Permanent Opening / Replaceable Window/Door;
- Designed Threshold.

Geometry and replacement dependencies may be checked; architectural quality, repose and proportionality remain judgement.

### Strategies that should not become compiler entities

Examples:

- Fail-Safe Water Distribution;
- Decompose Structural Interface Functions.

Their selected implementations may create formal rules, but the strategy itself is not an object in the building model.

This supports the existing rule: **the pattern language is not the compiler ontology**.

---

# 16. Phase-6 unresolved questions

Before Phase 6 can close, the following need targeted evidence/source review rather than broad new taxonomy work:

1. Does `Local Deep Service Zone` recur strongly enough outside the current doctrine to earn pattern status, or is it merely one drainage/duct coordination tactic?
2. Is `Selective Floor Access` a genuine reusable pattern distinct from replaceable floor-platform implementations?
3. Should `Individually Isolatable Manifold Distribution` be an architectural pattern or a services implementation family in a domestic house?
4. Does `Visible Leakage Path` have enough robust precedents to stand independently from the water-failure strategy?
5. Is `Perimeter Dry / Inspection Zone` one coherent pattern or an accidental bundling of drainage, moisture and maintenance benefits?
6. Can `Replaceable Architectural Lining` meet the project's repose/solidity threshold in physical testing strongly enough to be recommended rather than merely possible?
7. Should `Accessible Room Service Route` contain skirting + door-surround routes as variants, or do worked-room cases show that horizontal and vertical routes deserve separate identities?
8. What exact scope separates `Compartmented Service Void` from ordinary fire/acoustic compartmentation requirements so that it adds architectural knowledge rather than restating compliance?

These questions are small enough to answer deliberately. They do not justify reopening general doctrine discovery.

---

# 17. Current Phase-6 decision

**Do not start Phase 7 yet.**

The classification pass is coherent and materially reduces category confusion, but targeted evidence review of the eight questions above should occur before stable IDs/new canonical pages are created.

Once those questions are answered:

1. freeze the migration matrix;
2. record the Phase-6 gate decision;
3. update migration control + `STATUS.md`;
4. only then begin Phase 7 canonical migration on a fresh branch.