# Architectural Pattern → Computational Crosswalk

**Status:** frozen Phase-8 crosswalk model; executable subset demonstrated by `PAT-XW-01`  
**Purpose:** define how selected HSA patterns can contribute to computational authoring and reporting without becoming compiler ontology.  
**Executable result:** [P0 + PAT-XW-01 — Executable Gate Result](p0-pat-xw-01-result.md)

The computational architecture is:

```text
architectural intent / project requirements
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

The pattern language is an architectural authoring and provenance layer above that machinery. It is not another graph of technical truth.

---

## 1. The central rule

> **A pattern selection is provenance and intended architectural commitment, not proof and not a substitute for source-model facts.**

Selecting `HSA-P-005 — Designed Structural Penetration` does not make a hole structurally adequate. Selecting `HSA-P-002 — Plant Room as Service Hub` does not prove working clearance or acoustic performance.

A selected pattern may explain why a project requirement exists. The actual building relationships then create their normal technical obligations.

---

## 2. Two obligation classes must not be conflated

### A. Architectural project requirement

Authority: **project architectural requirement**, with provenance to an HSA pattern where relevant.

Question:

> Did the project realise the formal subset of the architectural relationship it selected?

Examples:

- a claimed `P-002` occurrence contains real maintainable plant/equipment and a credible replacement path;
- a claimed `P-003` occurrence forms an explicit route/branch topology rather than unrelated service paths merely carrying the same label;
- a claimed `P-005` occurrence identifies the service, host and crossing relationship rather than being an undocumented hole.

Qualitative remainder may still require architectural judgement.

### B. Induced technical obligation

Authority: whatever actually creates the requirement — physical/engineering, regulation, product evidence, process, etc.

Question:

> What must be resolved because this building relationship exists?

Examples:

- a penetration through a fire boundary creates fire-continuity obligations whether or not `P-005` is selected;
- equipment requiring servicing creates access obligations whether or not it sits in a `P-002` hub;
- a route through structure creates structural obligations whether or not it belongs to `P-003`.

**Do not duplicate induced obligations once per contributing pattern.** Derive them from the composed semantic graphs.

---

## 3. Pattern provenance in implementation

Phase-8 red-team review rejected the need for a required `Pattern` or `PatternIntent` core building entity.

The demonstrated P0/PAT-XW approach uses ordinary project requirements with provenance:

```text
PROJECT REQUIREMENT PR-XW-003
provenance: HSA-P-003
scope: service route set SR-01
formal commitments:
  - route segments identified
  - branch relationships explicit
  - declared maintenance nodes represented
architectural judgement:
  - topology is proportionate/coherent in the house
```

The building facts remain ordinary semantic entities and relationships:

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

A later authoring UI may choose to expose a first-class pattern-selection record, but that is an interface convenience rather than required compiler truth.

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
- route reserve is heavily occupied at concept stage.

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

## 5. Phase-8 coverage states

The completed paper crosswalk used these states:

| State | Meaning |
|---|---|
| **NATIVE** | existing semantic/obligation/evidence model covers the important machine-readable consequences |
| **NATIVE + FIXTURE NEEDED** | representable in the paper model but not demonstrated in an executable fixture |
| **SMALL REFINEMENT** | model is sound but a bounded role/entity/relation may be missing |
| **EXTERNAL / ADVISORY HEAVY** | formal core is small; much validity remains external evidence or human judgement |
| **NO DIRECT CROSSWALK** | proposition is primarily architectural/stewardship intent and should not generate substantial compiler machinery |

These are mapping states, not quality or maturity ratings for the architectural proposition.

`PAT-XW-01` subsequently exercised a deliberately small subset rather than attempting to turn the whole mapping table into software.

---

## 6. Authority discipline

Pattern-derived formal commitments normally enter as **project requirements with pattern provenance**.

Do not create a pseudo-legal or technical authority called “pattern”.

A source occurrence can contribute simultaneously to HSA project intent and to technical validity while preserving different authorities:

```text
P-005 selected
   ↓
project requirement:
  claimed penetration occurrence must be deliberate / identified

PEN-17 crosses fire boundary FB-2
   ↓
fire obligation
  authority: regulatory / supported fire family

PEN-17 crosses external air/weather boundaries
   ↓
envelope obligations
  authority: physical / target / product evidence
```

---

## 7. Evidence discipline

Pattern evidence in the publication is **not** project evidence for an occurrence.

The pattern document may be provenance for why an architectural project requirement exists. Technical discharge still uses scoped evidence such as:

- semantic inference;
- geometric query;
- engineering calculation;
- bounded family/table;
- tested assembly;
- product evidence;
- site/survey evidence;
- inspection;
- commissioning;
- external professional determination;
- statutory/regulatory decision.

A pattern with `evidence: established` can still have an unresolved project occurrence.

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

This is the same correction established in the paper work on interface bundles: compose the building first, derive each real obligation once.

`PAT-XW-01` demonstrated this for the exercised P003/P005 slice without a pattern-specific technical rule pack.

---

## 9. Formal architectural commitment and technical proof may diverge

A selected architectural commitment may be resolved while a dependent technical obligation remains unresolved, or the technical model may remain acceptable while HSA project intent is violated.

`PAT-XW-01` demonstrated both cases:

- removing penetration evidence left the formal P005 commitment resolved while the technical obligation became `UNRESOLVED`;
- adding a technically acceptable branch could violate the selected P003 accessible-route project requirement.

This separation is intentional. There is no whole-pattern Boolean that can replace the underlying results.

---

## 10. Mutation requirement

Any future crosswalk fixture that claims machine value should name a mutation that changes a computational result.

Useful mutation classes include:

- delete a required semantic relationship;
- block an access/withdrawal path;
- move a route across a forbidden host/boundary;
- enlarge a component beyond its replacement envelope;
- change boundary role at a crossing;
- remove evidence or move outside evidence scope;
- create an unregistered penetration;
- change a physical identifier without updating the service index.

If no plausible mutation changes any machine result, the proposed formalisation is probably only documentation.

---

## 11. Anti-drift rules

Do not:

- create one compiler subsystem per pattern;
- add `hasPatternX` booleans as substitutes for building meaning;
- hard-code aesthetic thresholds because a pattern contains qualitative language;
- turn evidence maturity of the pattern into occurrence validity;
- encode the pattern-language graph (`requires`, `completes`, etc.) automatically as building-system dependency;
- make selected patterns mandatory globally;
- formalise generative-sequence chronology as source-model topology;
- duplicate technical obligations because several patterns touch the same boundary or service route;
- infer technical adequacy from a pattern reference.

---

## 12. Completed crosswalk record

The Phase-8 paper mapping comprises:

- [Service-Topology Pattern Crosswalk — Pilot 01](pattern-crosswalk-service-topology-pilot.md);
- [Remaining Active Language](pattern-crosswalk-remaining-active.md);
- [Strategies and Held Candidates Audit](pattern-crosswalk-strategies-candidates.md);
- [Implementation Handoff](pattern-crosswalk-implementation-handoff.md);
- [Phase-8 Gate Review](../development/pattern-language-phase8-review.md).

The first executable handoff, `PAT-XW-01`, later passed. Generic crosswalk expansion is frozen; another fixture should be added only when a real architectural, physical or professional-review question earns it.
