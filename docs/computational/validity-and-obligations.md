# Validity and Obligations — Conceptual v0.2

**Status:** foundational research draft  
**Purpose:** define what `valid`, `failed`, `unsupported` and `compiled` mean before rules are encoded

## 1. Validity is multidimensional

A single green/red result would hide distinctions the system needs to preserve.

A design can be geometrically well formed but structurally unresolved; structurally adequate but outside the selected grammar; technically compliant but poorly evidenced; digitally resolved but badly built; legally compliant but inconsistent with the Long-Life House doctrine.

The model therefore reports several kinds of validity rather than one universal score.

In particular:

- **good** is not the same as **valid**;
- **valid** is not the same as **compliant**;
- **compliant** is not the same as **approved**;
- **compiled** is not the same as **built**.

## 2. Compilation means discharging obligations

A design change creates consequences. The system should turn those consequences into explicit **obligations**.

For example:

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

Compilation then:

1. determines which obligations apply;
2. attempts to discharge them;
3. preserves the evidence used;
4. leaves unresolved obligations visible.

This is more useful than treating the compiler as a bag of unrelated checks because the obligation retains its subject, authority, dependencies and evidence.

## 3. Conceptual obligation record

A future obligation should carry enough information to answer: **what must be true, why, for what, under which target, and how do we know?**

Candidate fields include:

- stable identifier;
- subject entity/entities;
- obligation class and source;
- applicability condition;
- target/profile version;
- required proposition;
- resolution method;
- dependencies and assumptions;
- evidence;
- result/status/explanation;
- supersession/version history.

Illustratively:

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

No storage or syntax model is implied.

## 4. Sources of obligation

Keep source authority visible.

### Model integrity
Created by the formal model itself: identities resolve, relationships are well formed, units/types are valid.

### Physical / engineering
Created by geometry, material behaviour, structure or building physics.

### Regulatory
Created by applicable legal requirements and the selected compliance route.

### Standards
Created because the selected design/calculation route incorporates a standard-based method.

### Product evidence
Created by installation limits, conditions or declared performance of a selected product/system.

### Long-Life House doctrine
Created only where the project claims conformance with a formalised doctrine proposition.

### Architectural grammar
Created by the selected architectural language.

### Project requirement
Created by the client brief or project-specific target.

### Process / evidence
Created because a proposition requires inspection, test, commissioning, professional review or another evidence-producing act.

Outputs should preserve these distinctions. A grammar failure and a regulatory failure may both block a chosen compile mode without acquiring the same authority.

## 5. Dimensions of validity

### V0 — Model integrity

Is the semantic model coherent? Do identities, relationships, graph structure, units and types resolve?

### V1 — Supported-domain status

Does the proposition lie inside the domain the system claims to understand: supported house type, structural family, parameter range or construction family?

Leaving the domain is not necessarily a design failure. It is a **proof-system boundary**.

### V2 — Geometric / spatial validity

Are mandatory geometric relationships satisfied: clearances, non-intersection, maintenance volumes, stair geometry and other spatial conditions?

### V3 — Structural resolution

Are structural obligations resolved within the supported engineering envelope: load path, capacity, bearing, stability, reaction transfer and foundation support?

### V4 — Boundary / building-physics resolution

Are applicable thermal, air, water, moisture, acoustic, fire/smoke and related boundary obligations resolved?

### V5 — Regulatory-route conformance

Does the model satisfy the named target and compliance route under declared assumptions?

Never report this dimension without naming the target.

### V6 — Doctrine conformance

Does the design satisfy the Long-Life House propositions formalised as mandatory for this project?

### V7 — Architectural-grammar conformance

Is the design a valid member of the selected architectural language?

Failure here means exactly that. It does not mean objectively ugly or legally invalid.

### V8 — Constructability / workmanship resolution

Do consequential assemblies declare the datum, tolerance envelope, adjustment, sequence, remediation threshold and inspection point required by their chosen implementation?

### V9 — Evidence completeness

Is each mandatory proposition backed by evidence of the correct scope, version and lifecycle status?

A technically plausible design can still fail release here.

## 6. Status vocabulary

Use status to communicate epistemic state, not merely colour a UI.

### `PASS`
Resolved by an accepted method within native supported scope.

### `PASS — EXTERNAL EVIDENCE`
The proposition is discharged by an explicitly referenced external evidence item accepted by project governance: engineer calculation, specialist analysis, site investigation, accredited test, etc.

Keep this visibly distinct from native proof.

### `WARNING`
The design is valid but departs from a preference, target quality or recommended condition. Never use warning to hide a mandatory unresolved obligation.

### `FAIL`
A known applicable requirement is violated.

### `UNSUPPORTED`
The system does not know how to establish the proposition. This is epistemic, not normative.

### `UNRESOLVED`
The system understands the obligation but information or evidence is missing.

### `NOT APPLICABLE`
The rule exists but its applicability condition is false. Retain the reason.

### `SUPERSEDED`
The obligation/evidence belongs to an earlier model or target version and remains only as history.

## 7. Authoring feedback versus release semantics

Distinguish:

- **immediate invalid relationship** — a state that ideally cannot persist, such as connecting incompatible network types;
- **compile error** — a representable design state that fails the current compile, such as an opening beyond a supported lintel range;
- **external proof obligation** — a valid route forward requiring evidence outside native capability;
- **warning** — non-blocking departure;
- **optimisation feedback** — comparative suggestion.

The interface may render all of these elegantly. The semantics must remain distinct.

## 8. State the authority of architectural judgement

Opinionated architecture is allowed. Hidden authority is not.

For example:

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

This lets the system be architecturally committed without pretending its preferences are physics or law.

## 9. Evidence classes

An obligation may be discharged by:

- **deterministic semantic inference** — e.g. prohibited service route does not traverse permanent structure;
- **geometry query** — e.g. clear stair width;
- **calculation** — e.g. beam utilisation;
- **bounded design table/rule** — e.g. supported lintel family within stated limits;
- **tested/certified assembly** — within its evidenced scope;
- **product/manufacturer evidence** — with exact applicability/version;
- **inspection evidence** — e.g. measured cavity closure before concealment;
- **commissioning result** — e.g. measured ventilation flow;
- **external professional determination** — e.g. engineer validates an out-of-domain connection.

Every evidence item declares its scope.

## 10. Proof is scoped

The system should be careful with the word **proof**.

A geometry query can be close to mathematical proof. A structural calculation establishes adequacy only relative to its analytical model, loads, material properties, method, safety factors and applicability. A product test supports the tested system and permitted extensions. An inspection establishes something about physical reality at a particular time.

The compiled building is therefore better understood as a **structured argument with auditable evidence** than as one universal proof.

“Proof-carrying building” remains useful shorthand only if that qualification survives.

## 11. Dependency graph

Obligations depend on other propositions.

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

Change a dependency and downstream evidence may become stale. This graph supports future change-impact analysis and incremental recompilation.

## 12. Evidence invalidation

Evidence must be reviewed or invalidated when a dependency it relies on changes: opening width, product, loading, target version, supporting material, site condition or another scoped input.

An old PDF existing in the repository is not evidence that its conclusion still applies.

## 13. Compile modes

Different design stages can legitimately tolerate different evidence states.

### Exploratory compile

May run under named assumptions and contain unresolved external obligations. It is for design exploration and must be labelled non-release.

### Coordinated design compile

Requires major technical systems to be resolved while allowing controlled external evidence obligations appropriate to that phase.

### Release-grade compile

A provisional contract requires:

- model integrity passes;
- mandatory due-now obligations are `PASS`, `PASS — EXTERNAL EVIDENCE`, `NOT APPLICABLE`, or explicitly accepted through a defined governance route;
- no hidden due-now `UNRESOLVED` obligations;
- future evidence obligations have declared phase, method and owner;
- no `UNSUPPORTED` condition is presented as proven;
- provenance manifest is complete;
- assumptions are frozen and visible;
- outputs derive from the same source version.

The precise release contract remains research work.

## 14. Time-phased obligations

Some evidence cannot exist at design release: installation inspection, pre-closure verification, commissioning or completion evidence.

Represent these as **planned future evidence obligations**, not unresolved noise. Each should carry:

- due phase;
- evidence method;
- responsible party;
- hold point where relevant;
- failure/remediation response.

A design-stage release can then pass when everything due now is resolved and everything genuinely due later is explicitly planned.

See [Evidence and Provenance Architecture](evidence-and-provenance.md).

## 15. Compilation, approval and physical conformance

A release-grade compile may eventually claim:

> the model conforms to Target T, Domain D and Project Configuration P under assumptions A with evidence set E.

It does **not** claim statutory approval or correct physical construction.

Those remain separate processes.

The evidence chain can nevertheless continue onto site:

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

Product identity, dimensional inspection, pre-closure photographs, certificates, commissioning data, deviations and as-built changes can extend the same evidence graph through stewardship.

## 16. Human judgement is a legitimate resolution method

Some questions should remain explicitly human: unusual alternative compliance, heritage significance, subtle composition, novel fire engineering or geotechnical interpretation.

A legitimate method may therefore be conceptually represented as:

`REQUIRES_AUTHORISED_HUMAN_DETERMINATION`

The requirement is not to automate everything, but to record the judgement, authority and scope rather than hide it outside the model.

## 17. No aggregate quality score

Do not collapse architecture into one scalar.

Prefer explicit validity dimensions, objective vectors, warnings, alternative comparisons and provenance. If optimisation is introduced, weights should be declared and adjustable rather than presented as universal architectural truth.

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

This is a useful failure: the system distinguishes a resolved design from an evidenced release.

## 19. Open questions

- Can regulatory applicability always be deterministic?
- What governance accepts external evidence?
- How should professional judgement be scoped and versioned?
- When does a warning become a failure?
- What evidence can a family/type pass to its occurrences?
- How should probabilistic engineering conditions be represented?
- How should tolerances affect binary geometric checks?
- How should doctrine/brief conflicts surface?
- What is sufficient evidence for a product substitution?
- How should ambiguity or competing regulatory interpretations be reported?
- What does recompilation against a newer target mean for an existing lawful building?

## 20. Next work

The immediate companion is [Evidence and Provenance Architecture](evidence-and-provenance.md), which develops evidence scope, dependencies, lifecycle and invalidation in more detail.

## External anchors

- Purushotham, Kailashnath & Mutis, “Framework for automated building code compliance checking to improve transparency, trust, validation, and design interpretation”, *Automation in Construction* 181 (2026), 106598: https://doi.org/10.1016/j.autcon.2025.106598
- Zentgraf, Hagedorn & König, “A BIM-based framework for automated building code extraction and compliance checking”, *Advanced Engineering Informatics* 65 (2025), 103270: https://doi.org/10.1016/j.aei.2025.103270
- buildingSMART, Information Delivery Specification: https://www.buildingsmart.org/standards/bsi-standards/information-delivery-specification-ids/
