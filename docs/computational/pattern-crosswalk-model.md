# Architectural Pattern → Computational Crosswalk

**Status:** Phase-8 working model; pilot-gated  
**Purpose:** define how selected HSA patterns may contribute to the computational system without becoming the compiler ontology.

The canonical architecture remains:

```text
architectural intent
      ↓
source semantic model
      ↓
shared derived graphs
      ↓
canonical obligations
      ↓
evidence / determination
      ↓
validity + diagnostics
```

The pattern language is an architectural authoring layer above that machinery. It is not another graph of technical truth.

---

## 1. The central rule

> **A pattern selection is provenance and intended architectural commitment, not proof and not a substitute for source-model facts.**

Selecting `HSA-P-005 — Designed Structural Penetration` does not make a hole structurally adequate. Selecting `HSA-P-002 — Plant Room as Service Hub` does not prove working clearance or acoustic performance.

A selected pattern may help author the semantic model and may create a project requirement to demonstrate pattern conformance. The actual building relationships then create their normal technical obligations.

---

## 2. Two obligation classes must not be conflated

### A. Pattern-conformance obligation

Authority: **project architectural requirement**, with provenance to an HSA pattern.

Question:

> Did the claimed occurrence actually realise the invariant architectural relationship selected by the project?

Examples:

- a claimed `P-002` occurrence contains real maintainable plant/equipment and a credible replacement path;
- a claimed `P-003` occurrence forms a coherent route/branch topology rather than unrelated service paths merely carrying the same label;
- a claimed `P-005` occurrence identifies the service, host and crossing relationship rather than being an undocumented hole.

This obligation is conditional on the project selecting/claiming that pattern occurrence.

### B. Induced technical obligation

Authority: whatever actually creates the requirement — physical/engineering, regulation, product evidence, doctrine, process, etc.

Question:

> What must be resolved because this building relationship exists?

Examples:

- a penetration through a fire boundary creates fire-continuity obligations whether or not `P-005` is selected;
- equipment requiring servicing creates access obligations whether or not it sits in a `P-002` hub;
- a route through structure creates structural obligations whether or not it belongs to `P-003`.

**Do not duplicate induced obligations once per contributing pattern.** Derive them from the composed semantic graphs.

---

## 3. Pattern selection and occurrence

The computational model may retain a lightweight pattern-intent record for provenance and reporting:

```text
PatternIntent
  pattern_ref: HSA-P-002
  project_scope: HOUSE-R01
  intended_occurrence: RH-P002-01
  status: selected
```

This is not a new building-physics object and should not accumulate technical facts.

The occurrence is realised by ordinary model entities:

```text
SPACE / ZONE
EQUIPMENT
NETWORK
ACCESS PATH
WORKING VOLUME
WITHDRAWAL PATH
BOUNDARY
...
```

Pattern conformance is a **derived view over those facts**.

If retaining `PatternIntent` proves unnecessary in implementation, provenance can live in project requirements/change records instead. Phase 8 does not mandate storage syntax.

---

## 4. Crosswalk output classes

A pattern statement may produce one or more of four computational outputs.

### S — source semantic commitment

Something the author/project must state as ordinary building meaning.

Examples:

- route `R-17` serves rooms `A/B/C`;
- component `V-04` requires access from service zone `SZ-2`;
- penetration `PEN-3` crosses wall `W-8` and interrupts air/fire boundaries.

### O — derived obligation

A proposition created from source facts and context.

Examples:

- withdrawal route must clear all obstructions;
- boundary continuity must be reinstated at penetration;
- service route must remain inside the permitted host/zone envelope.

### D — diagnostic / optimisation signal

Useful feedback that is not machine proof of architectural quality.

Examples:

- this topology creates 14 boundary crossings versus 6 for comparator B;
- replacement path passes through a principal bedroom;
- route reserve is 80% occupied at concept stage.

Diagnostics must state their authority and remain non-blocking unless the project deliberately turns one into a requirement.

### J — judgement retained for humans

A proposition the compiler should not pretend to settle.

Examples:

- the plant hub earns its area;
- the service route is architecturally subordinate;
- the service wall still feels like a convincing domestic wall;
- the riser does not create institutional character.

A useful crosswalk makes `J` explicit rather than treating it as failure to automate.

---

## 5. Crosswalk coverage states

Use only these Phase-8 states:

| State | Meaning |
|---|---|
| **NATIVE** | existing semantic/obligation/evidence model already covers the important machine-readable consequences |
| **NATIVE + FIXTURE NEEDED** | representable now but not demonstrated in a worked executable fixture |
| **SMALL REFINEMENT** | model is sound but a bounded role/entity/relation is genuinely missing |
| **EXTERNAL / ADVISORY HEAVY** | formal core is small; much validity remains external evidence or human judgement |
| **NO DIRECT CROSSWALK** | pattern is primarily architectural/stewardship intent and should not generate substantial compiler machinery |

Do not use these as quality or maturity ratings for the architectural pattern.

---

## 6. Authority discipline

Pattern-derived architectural conformance normally enters as a **project requirement with pattern provenance**.

Do not create a new pseudo-legal authority called “pattern”.

An obligation produced by the realised building still preserves its real authority:

```text
P-005 selected
   ↓
project requirement:
  claimed penetration occurrence must be deliberate/identified

PEN-17 crosses fire boundary FB-2
   ↓
fire obligation
  authority: regulatory / supported fire family

PEN-17 crosses external air/weather boundaries
   ↓
envelope obligations
  authority: physical / target / product evidence
```

The same source entity can therefore contribute to pattern conformance and technical validity without confusing the two.

---

## 7. Evidence discipline

Pattern evidence in the publication is **not** project evidence for an occurrence.

The compiler may reference the pattern document as provenance for why an architectural project requirement exists. Technical discharge still uses scoped evidence:

- E1 semantic inference;
- E2 geometric query;
- E3 engineering calculation;
- E4 bounded family/table;
- E5 tested assembly;
- E6 product evidence;
- E7 site/survey evidence;
- E8 inspection;
- E9 commissioning;
- E10 external professional determination;
- E11 statutory/regulatory decision.

A pattern with `evidence: established` can still have an unresolved Reference House occurrence.

---

## 8. Shared-graph rule

Patterns may contribute authoring intent and semantic graph fragments. They must not emit final technical checklists independently.

Preferred flow:

```text
PATTERN-GUIDED AUTHORING
        ↓
SOURCE ENTITIES / RELATIONSHIPS
        ↓
COMPOSED SERVICE / BOUNDARY / STRUCTURE / MAINTENANCE GRAPHS
        ↓
CANONICAL OBLIGATION DERIVATION
```

This is the same correction already established by Interface Obligation Bundles: compose the building first, derive each real obligation once.

---

## 9. Conformance is allowed to be partial

A claimed pattern occurrence may be structurally meaningful but not fully resolved.

Example:

```text
HSA-P-002 / RH-P002-01

pattern invariant realised           PASS
replacement path geometry            PASS
working volumes                      UNRESOLVED
drainage consequence                 UNRESOLVED
acoustic evidence                    EXTERNAL EVIDENCE REQUIRED
plant selection                      UNRESOLVED
architectural proportionality        HUMAN JUDGEMENT
```

Reporting must preserve these differences. Avoid one green `P-002 = true` value.

---

## 10. Mutation requirement

Every crosswalk that claims machine value should name at least one mutation that changes the computational result.

Useful mutation classes include:

- delete a required semantic relationship;
- block an access/withdrawal path;
- move a route across a forbidden host/boundary;
- enlarge a component beyond its replacement envelope;
- change boundary role at a crossing;
- remove evidence or move outside evidence scope;
- create an unregistered penetration;
- change a physical identifier without updating the service index.

If no plausible mutation changes any machine result, the crosswalk is probably only documentation.

---

## 11. What Phase 8 must not do

- create one compiler subsystem per pattern;
- add `hasPatternX` booleans as substitutes for building meaning;
- hard-code aesthetic thresholds because a pattern contains qualitative language;
- turn evidence maturity of the pattern into occurrence validity;
- encode the pattern-language graph (`requires`, `completes`, etc.) as building-system dependency automatically;
- make selected patterns mandatory globally;
- formalise generative-sequence chronology as source-model topology;
- duplicate technical obligations because several patterns touch the same boundary or service route.

---

## 12. Pilot

The first worked application is [Service-Topology Pattern Crosswalk — Pilot 01](pattern-crosswalk-service-topology-pilot.md), covering the seven canonical patterns with current Reference House occurrences.

The pilot is the gate for whether this model is useful enough to apply to the remaining language.