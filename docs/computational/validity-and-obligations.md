# Validity and Obligations — Conceptual v0.1

**Status:** foundational research draft  
**Purpose:** define what “valid”, “failed”, “unsupported” and “compiled” mean before the project attempts to encode rules.

## 1. The central warning

A single green/red notion of validity would be dangerously crude.

A house can be:

- geometrically well formed but structurally unresolved;
- structurally adequate but outside the selected architectural grammar;
- compliant with one prescriptive guidance route but not another;
- compliant yet inconsistent with the Long-Life House doctrine;
- technically valid yet poorly evidenced;
- fully resolved digitally but badly constructed;
- beautiful but non-compliant;
- compliant but architecturally poor.

Therefore:

> **Valid is not synonymous with good. Good is not synonymous with compliant. Compliant is not synonymous with approved. Compiled is not synonymous with built.**

The system must preserve those distinctions.

## 2. Compilation as obligation discharge

A design decision creates consequences.

Those consequences should become explicit **obligations**.

Example:

~~~text
User enlarges opening O17
        │
        ├─► architectural-grammar obligation
        ├─► structural-support obligation
        ├─► bearing/reaction obligation
        ├─► thermal-junction obligation
        ├─► water-management obligation
        ├─► ventilation/daylight consequence
        ├─► quantity/cost consequence
        └─► maintenance/replacement consequence
~~~

Compilation is the process of:

1. determining which obligations apply;
2. attempting to discharge them;
3. preserving the evidence of discharge;
4. refusing to hide obligations that remain unresolved.

This framing is stronger than “run a collection of checks”.

## 3. Obligation object

A future obligation should conceptually carry:

- stable identifier;
- subject entity/entities;
- obligation class;
- source;
- applicability conditions;
- target/profile version;
- required proposition;
- resolution method;
- dependency obligations;
- assumptions;
- evidence;
- result;
- status;
- explanation;
- supersession/version history.

Illustrative record:

~~~text
Obligation: STR-017
Subject: Opening O17 / Wall W04
Class: structural
Source: supported structural family SF-03
Requires: head support for opening width 2100 mm
Method: lookup + reaction propagation
Evidence: CALC-STR-221
Status: PASS
Depends on:
  - MAT-004 masonry strength assumption
  - GEO-119 clear bearing geometry
~~~

No syntax is proposed here.

## 4. Sources of obligation

Obligations should retain their origin because different origins have different authority.

### Model-integrity obligations

Created by the formal model itself.

Example: a relationship may not point to a missing entity.

### Physical / engineering obligations

Created by structural behaviour, geometry, materials or building physics.

Example: a floor requires support.

### Regulatory obligations

Created by applicable legal requirements and the selected compliance route.

### Standards obligations

Created because the chosen calculation/design route incorporates a standard or a declared standard-based method.

### Product-evidence obligations

Created by limitations or installation conditions attached to a selected product/system.

### Long-Life House doctrine obligations

Created only when the project claims conformance with the doctrine.

### Architectural-grammar obligations

Created by the selected architectural language.

### Project requirements

Created by the client's brief or project-specific performance targets.

### Process / evidence obligations

Created because a claim requires inspection, test, commissioning, professional review or another evidence-producing act.

These sources should remain distinguishable in outputs.

## 5. Dimensions of validity

The proposed model should report validity across dimensions rather than collapse everything into one score.

### V0 — Model integrity

Is the semantic model well formed?

Examples:

- identities resolve;
- required relationships exist;
- graph structure is coherent;
- values have valid units/types.

### V1 — Supported-domain status

Is the proposition within a domain the system claims to understand?

Examples:

- supported house type;
- supported structural family;
- span inside verified parameter envelope;
- recognised construction family.

Leaving the domain is not necessarily a design failure.

It is a **proof-system boundary**.

### V2 — Geometric / spatial validity

Are mandatory geometric and spatial relationships satisfied?

Examples:

- non-zero spaces;
- required clearance;
- no impossible physical intersection;
- maintenance working volume;
- stair geometry.

### V3 — Structural resolution

Are structural obligations resolved within the supported engineering envelope?

Examples:

- continuous load path;
- member capacity;
- bearing;
- stability;
- reaction transfer;
- foundation support.

### V4 — Boundary / building-physics resolution

Are required boundaries and performance conditions resolved?

Examples:

- thermal continuity;
- air barrier;
- water shedding/drainage;
- condensation/moisture strategy;
- acoustic separation;
- fire/smoke boundary.

### V5 — Regulatory-route conformance

Does the model satisfy the explicit selected target and route under declared assumptions?

This should never be reported without naming the target.

### V6 — Doctrine conformance

Does the building satisfy whichever Long-Life House propositions have been formalised as mandatory for this project?

Examples:

- prohibited routine service route through permanent fabric;
- required maintenance access;
- boundary independence across removable layers.

### V7 — Architectural-grammar conformance

Does the design conform to the selected architectural grammar?

Failure here means:

> not a valid member of this declared architectural language.

It does **not** mean objectively ugly or legally invalid.

### V8 — Constructability / workmanship resolution

Have consequential assemblies declared:

- datum;
- tolerance envelope;
- adjustment;
- sequence;
- remediation threshold;
- inspection point?

### V9 — Evidence completeness

Is every mandatory claim backed by evidence of the correct scope and version?

This is where a technically plausible design may still be un-releasable.

## 6. Status vocabulary

Avoid vague “pass / fail” where more precision is available.

### PASS

The obligation has been discharged by an accepted method within the system's supported scope.

### PASS — EXTERNAL EVIDENCE

The system cannot itself establish the proposition, but an explicitly referenced external evidence item accepted by the project discharges it.

Examples:

- engineer's calculation;
- specialist fire analysis;
- site investigation;
- accredited test result.

This status should remain visibly different from native proof.

### WARNING

The proposition is valid but departs from a preference, target quality or recommended condition.

Warnings must never stand in for unresolved safety/compliance obligations.

### FAIL

A known applicable requirement is violated.

### UNSUPPORTED

The condition lies outside what the system knows how to reason about.

Unsupported is epistemic, not normative.

It means:

> **the compiler cannot establish this claim.**

### UNRESOLVED

The system understands the required obligation but lacks information or evidence needed to determine it.

Examples:

- soil parameter missing;
- product not selected;
- external calculation promised but absent.

### NOT APPLICABLE

The rule exists in the target but its applicability condition is false for this project/entity.

The reason should be traceable.

### SUPERSEDED

The obligation/evidence belongs to an earlier building or target version.

It is retained historically but does not govern the current release.

## 7. Hard error versus design feedback

The authoring environment should distinguish:

### Immediate invalid relationship

A state that should ideally never persist.

Example:

- linking a drainage outlet to an incompatible network type.

### Compile error

A representable design state that cannot produce a successful compile.

Example:

- opening exceeds the supported lintel/span envelope.

### External proof obligation

A valid route forward that requires evidence outside the native compiler.

### Warning

A non-blocking departure.

### Optimisation feedback

A suggestion about competing objectives.

The UI may display all of these beautifully.

The semantics must remain distinct.

## 8. Architectural quality must not be smuggled into physics

The system is intentionally opinionated.

But it should state the authority of each opinion.

Example:

~~~text
ERROR — required landing depth not achieved
  authority: regulatory target

ERROR — room leaves selected Georgian proportion grammar
  authority: architectural grammar G-01

WARNING — circulation efficiency below preferred objective
  authority: project preference

INFO — alternative bay arrangement would reduce steel tonnage
  authority: optimisation suggestion
~~~

This is a crucial trust feature.

## 9. Evidence types

An obligation may be discharged by different evidence classes.

### Deterministic semantic inference

Example: a prohibited service does not traverse the permanent structural zone.

### Geometry query

Example: clear stair width.

### Calculation

Example: beam utilisation.

### Table / bounded design rule

Example: supported lintel family within declared span/loading conditions.

### Tested/certified assembly

Example: a fire-resistance claim within the tested scope.

### Product declaration / manufacturer evidence

Subject to exact applicability and version.

### Inspection evidence

Example: photographed and measured cavity closure before concealment.

### Commissioning result

Example: measured ventilation flow.

### External professional determination

Example: project structural engineer validates an out-of-domain connection.

Every evidence item should declare its scope.

## 10. Proof and evidence are not the same thing

The word “proof” should be reserved carefully.

A deterministic geometry result may be very close to mathematical proof.

A structural calculation is proof only relative to:

- its model;
- load assumptions;
- material properties;
- calculation method;
- relevant safety factors;
- domain applicability.

A product test is evidence for the tested system and permitted extensions.

An inspection is evidence about physical reality at a particular time.

Therefore the compiled building is better understood as a **structured argument with auditable evidence** than as one universal mathematical proof.

“Proof-carrying building” remains a useful aspiration if this nuance is preserved.

## 11. Dependency graph

Obligations can depend on other obligations.

Example:

~~~text
REG-A-017 structure adequate
      │
      └─ depends on STR-021 beam adequate
                     │
                     ├─ depends on LOAD-004 design actions
                     ├─ depends on MAT-003 material grade
                     ├─ depends on GEO-014 span
                     └─ depends on SUP-007 bearing support
~~~

If a dependency changes, downstream evidence may become stale.

This is the basis of future **incremental recompilation** and change impact.

## 12. Evidence invalidation

A major requirement for versioned architecture is knowing when evidence stops applying.

Evidence should be invalidated or flagged for review when relevant dependencies change.

Examples:

- opening widened;
- product substituted;
- floor loading changed;
- target standard version changed;
- supporting wall material changed;
- site assumption replaced by investigation result.

The system should never carry forward a green result merely because an old PDF still exists.

## 13. Compile levels

The project should eventually distinguish at least conceptual compile modes.

### Exploratory compile

May run with named assumptions and unresolved external obligations.

Purpose: design exploration.

Output must visibly state that it is not release-grade.

### Coordinated design compile

Requires major technical systems to be resolved but may still contain controlled external evidence obligations.

Purpose: design coordination / review.

### Release-grade compile

Provisional definition:

- model integrity passes;
- all mandatory obligations are PASS, PASS—EXTERNAL EVIDENCE, NOT APPLICABLE or otherwise explicitly accepted by a defined governance mechanism;
- no hidden UNRESOLVED obligations;
- no unsupported condition is being represented as proven;
- evidence/provenance manifest is complete;
- assumptions are frozen and visible;
- outputs derive from the same source version.

The exact release contract requires substantial later work.

## 14. Compilation does not equal statutory approval

A release-grade compile may eventually mean:

> **the design conforms to the rules and proof system represented by Target T, Domain D and Project Configuration P, under assumptions A, with evidence set E.**

It does not mean:

> building control has legally approved the project.

Nor does it mean:

> the physical building was constructed correctly.

Those are separate events with their own evidence.

## 15. Physical conformance

The digital proof boundary should eventually connect to the site.

Potential feedback evidence:

- material/product identity;
- dimensional inspection;
- photographs before closure;
- test certificates;
- commissioning measurements;
- deviation records;
- as-built changes.

Conceptually:

~~~text
DESIGN OBLIGATION
      ↓
DESIGN EVIDENCE
      ↓
RELEASED DESIGN
      ↓
CONSTRUCTION
      ↓
PHYSICAL VERIFICATION
      ↓
AS-BUILT / COMMISSIONED EVIDENCE
~~~

The long-term ambition is one evidence graph spanning design and stewardship.

## 16. Human judgement

Some obligations should explicitly require judgement rather than fake automation.

Potential examples:

- whether an unusual alternative solution satisfies a functional regulation;
- heritage significance;
- subtle architectural composition;
- novel fire-engineered strategy;
- unusual geotechnical interpretation.

A legitimate obligation method may therefore be:

REQUIRES_AUTHORISED_HUMAN_DETERMINATION

The important thing is that the human determination is explicit, scoped and recorded.

## 17. No aggregate “quality score”

The system should resist turning the house into a single numerical score.

A scalar hides trade-offs and authority.

Prefer:

- explicit pass/fail dimensions;
- objective vectors;
- warnings;
- comparative alternatives;
- provenance.

If optimisation is introduced later, the weights should be declared and adjustable rather than masquerading as universal architectural truth.

## 18. Example compile summary

~~~text
HOUSE RELEASE CANDIDATE — V0.17

Target
  England / New Dwelling / target snapshot T-2026-01

Model integrity                 PASS
Supported domain                PASS
Geometry / spatial              PASS
Structure                       PASS
Boundary / building physics     PASS WITH 1 EXTERNAL EVIDENCE ITEM
Regulatory route                PASS
Long-Life House doctrine        PASS
Architectural grammar G-01      PASS WITH 2 WARNINGS
Constructability / tolerance    PASS
Evidence completeness           FAIL

Blocking obligation:
  GEO-EXT-004
  Ground bearing capacity is still assumed.
  Site investigation evidence required.

Result:
  RELEASE FAILED
~~~

A failure like this is a feature.

## 19. Open questions

- Can regulatory applicability itself always be deterministic?
- What governance is required to accept external evidence?
- How should professional judgement be scoped and versioned?
- When should a warning escalate to a hard failure?
- What evidence can be inherited from a family/type to occurrences?
- How are probabilistic engineering conditions represented?
- How should tolerances affect binary geometric checks?
- How should conflicts between doctrine and project brief be surfaced?
- Can evidence be cryptographically signed or otherwise made tamper-evident later?
- What constitutes sufficient evidence for a product substitution?
- How should the system report regulatory ambiguity or conflicting interpretations?
- What does recompilation against a newer target mean for an existing lawful building?

## 20. Next work

The immediate successor to this document should be a dedicated **Evidence and Provenance Architecture**.

It should turn the conceptual obligation/evidence relationship into a precise model and test it on the Reference House paper compilation.

## External anchors

- Purushotham, Kailashnath & Mutis, “Framework for automated building code compliance checking to improve transparency, trust, validation, and design interpretation”, Automation in Construction 181 (2026), 106598: https://doi.org/10.1016/j.autcon.2025.106598
- Zentgraf, Hagedorn & König, “A BIM-based framework for automated building code extraction and compliance checking”, Advanced Engineering Informatics 74 (2026), 104735: https://doi.org/10.1016/j.aei.2026.104735
- UK Government, Building Regulations 2010: https://www.legislation.gov.uk/uksi/2010/2214
- UK Government, Approved Documents: https://www.gov.uk/government/collections/approved-documents
- UK Government, golden-thread guidance: https://www.gov.uk/guidance/keeping-information-about-a-higher-risk-building-the-golden-thread
