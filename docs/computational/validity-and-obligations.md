# Validity and Obligations

A single green/red result would hide distinctions the computational system must preserve.

A design can be geometrically coherent but structurally unresolved; technically adequate but outside the selected architectural grammar; correctly represented but poorly evidenced; digitally resolved but incorrectly built; legally compliant but inconsistent with a project requirement.

The model therefore treats validity as **multidimensional and authority-bearing**.

In particular:

- **good** is not the same as **valid**;
- **valid** is not the same as **compliant**;
- **compliant** is not the same as **approved**;
- **compiled** is not the same as **built**.

## Compilation means discharging obligations

A represented relationship creates consequences. The system turns those consequences into explicit **obligations**.

For example:

```text
opening enlarged
        │
        ├─ architectural-order obligation
        ├─ structural-support obligation
        ├─ bearing / reaction obligation
        ├─ thermal-junction obligation
        ├─ weather-management obligation
        ├─ air-boundary obligation
        ├─ service / environmental consequence
        └─ maintenance / replacement consequence
```

Compilation then:

1. determines which obligations apply;
2. attempts to resolve them using methods it legitimately owns;
3. accepts scoped external evidence where the model allows it;
4. preserves the evidence and assumptions used;
5. keeps unresolved or unsupported obligations visible.

This is stronger than a bag of unrelated checks because each obligation retains its subject, source authority, dependencies and evidence.

## Obligation anatomy

A significant obligation should answer:

> **What must be true, why, for what, under which authority or target, and how can it be established?**

Useful fields may include:

- stable identity;
- subject entity or entities;
- obligation class and source;
- applicability condition;
- target or method version;
- required proposition;
- resolution method;
- dependencies and assumptions;
- evidence;
- result and explanation;
- supersession/version state where relevant.

Illustratively:

```text
Obligation: STR-017
Subject: Opening O17 / Wall W04
Class: structural
Requires: head support
Method: external engineering determination
Status: UNRESOLVED
Depends on:
  - opening geometry
  - wall/support family
```

The exact storage schema is an implementation concern. The semantic distinction is not.

## Sources of obligation

Authority should remain explicit.

### Model integrity

Created by the formal model itself: identities resolve, relationships are well formed, required geometry is finite, types/units are valid and source constraints are coherent.

### Physical / engineering

Created by geometry, material behaviour, structure, services or building physics.

### Regulatory

Created by applicable legal requirements and the selected compliance route.

### Standards

Created because a selected route or method incorporates a standard-based requirement.

### Product evidence

Created by installation limits, field of application, declared performance or other conditions belonging to a product/system.

### Ovid’s House / project architectural requirement

Created only where the project has adopted a formal proposition as a concrete requirement.

### Architectural grammar

Created by the selected design language.

### Client / project requirement

Created by the brief or another job-specific target.

### Process / evidence

Created because a proposition requires inspection, test, commissioning, professional review or another evidence-producing act.

Two obligations may both block progress without sharing the same authority. A grammar failure should never be presented as if it were a regulatory failure.

## Dimensions of validity

The exact software data model need not expose these as one fixed enum, but the conceptual dimensions remain useful.

### Model integrity

Is the semantic source coherent? Do identities, relationships, units and geometry resolve?

### Supported-domain status

Does the proposition lie inside the area the compiler claims to understand?

Leaving the domain is not necessarily a design failure. It is a **proof-system boundary**.

### Geometric / spatial validity

Are represented mandatory geometric relationships satisfied: containment, non-overlap, host relationships, clearances, maintenance volumes, stair geometry and other controlled spatial conditions?

### Structural resolution

Are represented structural-topology obligations coherent, and where capacity is claimed is there valid engineering evidence for it?

### Boundary / building-physics resolution

Are applicable weather, air, thermal, moisture, acoustic, fire/smoke and related boundary obligations represented and appropriately evidenced?

### Regulatory-route conformance

Does the represented design satisfy the named target and selected method within the scope actually encoded?

Never report this dimension without naming the target and proof boundary.

### Ovid’s House / project conformance

Does the design satisfy the formal project requirements it has actually adopted?

A design may satisfy technical obligations while failing an architectural commitment, or vice versa.

### Architectural-grammar conformance

Is the design a valid member of the selected architectural language?

Failure means exactly that; it does not mean objectively ugly or legally invalid.

### Constructability / workmanship resolution

Where the model claims a consequential non-standard assembly is controlled, are the datum, tolerance envelope, adjustment, sequence, remediation threshold and inspection needs explicit enough for that claim?

### Evidence completeness

Is each due proposition backed by evidence of the right scope, version and state?

A plausible design can still be unready for release because the evidence chain is incomplete.

## Status vocabulary

Status should communicate epistemic state, not simply colour a user interface.

### `PASS`

Resolved by an accepted method within the supported authority of that method.

### `EXTERNALLY_DISCHARGED`

Resolved by explicitly referenced external evidence accepted for the subject: for example structural engineering, specialist analysis, site investigation, accredited test or another competent determination.

The authority boundary remains visible even if a human report renders this as “pass — external evidence”.

### `FAIL`

A known applicable requirement is violated.

### `UNSUPPORTED`

The system does not have an admitted method or sufficient domain authority to establish the proposition.

This is epistemic rather than normative: unsupported does not mean wrong.

### `UNRESOLVED`

The system understands the obligation but necessary information or evidence is absent.

### `NOT_APPLICABLE`

A known rule or method exists but its applicability condition is false. Where material, preserve the reason.

### `WARNING`

A represented condition is valid but departs from a preference, target quality or recommended condition. Warning must never hide a mandatory unresolved obligation.

### `SUPERSEDED`

The result or evidence belongs to an earlier source/target state and remains historical rather than current.

The current executable compiler uses a deliberately smaller subset of this vocabulary. The wider distinctions describe the model contract; they should enter software only when a concrete case needs them.

## Authoring feedback and release semantics

Several states that may look similar in a UI are semantically different:

- **immediate invalid relationship** — a source state the system should reject or refuse to preserve;
- **compile failure** — a representable state known to violate a mandatory condition;
- **unsupported condition** — no legitimate native conclusion is available;
- **external proof obligation** — a route forward exists through scoped outside evidence;
- **warning** — non-blocking departure;
- **optimisation feedback** — comparative suggestion.

The interface can make these easy to understand. It should not collapse them.

## State the authority of architectural judgement

An opinionated design system is legitimate. Hidden authority is not.

For example:

```text
FAIL — private stair numeric method outside selected band
  authority: selected guidance-method correspondence

FAIL — opening relationship leaves selected G-01 rule
  authority: architectural grammar

WARNING — circulation less direct than project preference
  authority: project objective

INFO — alternative arrangement may reduce material
  authority: optimisation suggestion
```

This lets the system remain architecturally committed without pretending its preferences are physics or law.

## Evidence classes

An obligation may be resolved by different epistemic acts:

- deterministic semantic inference;
- geometry query;
- calculation;
- bounded design table or verified envelope;
- tested or classified assembly;
- product/manufacturer evidence;
- inspection evidence;
- commissioning result;
- external professional determination.

Every evidence item should declare enough scope to establish what it can and cannot support.

## Proof is scoped

The system should use the word **proof** carefully.

A geometry query can be close to mathematical proof about represented geometry. A structural calculation establishes adequacy only relative to its analytical model, actions, material properties, method and applicability. A product test supports the tested system within its field of application. An inspection establishes something about physical reality at a particular time.

A compiled building is therefore better understood as a **structured argument with auditable evidence** than as one universal proof.

## Dependency graph

Obligations and evidence depend on other facts.

```text
STRUCTURAL CONDITION
      │
      ├─ depends on span geometry
      ├─ depends on design actions
      ├─ depends on material / family
      └─ depends on support condition
```

Change a dependency and downstream evidence may become stale. Unrelated evidence should remain current.

Selective invalidation is essential. A change to room finish should not force a structural recalculation unless it changes structural geometry, loading or another declared dependency.

## Evidence invalidation

Evidence may need review when a dependency it relies on changes, including:

- opening geometry;
- span;
- product;
- load;
- target/method version;
- supporting material;
- boundary geometry;
- site condition;
- another referenced evidence item.

The continued existence of an old calculation or PDF is not evidence that its conclusion still applies.

## Time-phased obligations

Some evidence cannot exist at design stage: installation inspection, pre-closure verification, commissioning or completion evidence.

Those should be represented as **planned future evidence obligations** rather than either ignored or treated as generic failure.

A useful future-evidence record may include:

- due phase;
- evidence method;
- responsible party;
- hold point where relevant;
- failure/remediation consequence.

This allows a design state to be honest about what is resolved now and what can only be known after manufacture or construction.

## Compile modes

Different uses can legitimately tolerate different evidence states.

### Exploration

May contain named assumptions and unresolved external obligations. It must not masquerade as a released technical conclusion.

### Coordinated design

Requires major represented relationships to be coherent while allowing explicitly owned external proof that belongs to competent specialists or later project stages.

### Release-grade concept

A future release contract would require, at minimum:

- source/model integrity passes;
- every due mandatory obligation is resolved by an admitted method or accepted external evidence;
- no hidden due `UNRESOLVED` state;
- no `UNSUPPORTED` state is presented as proven;
- future evidence obligations are explicit;
- assumptions and target/method identity are frozen and visible;
- all generated outputs refer to the same source state.

The present Metamorph Compiler is **not a building-release compiler**. This release distinction exists to preserve the meaning of the model, not to claim current capability.

## Compilation, approval and physical conformance

A future high-authority compile might legitimately claim:

> the represented model conforms to Target T, Domain D and Project Configuration P under assumptions A with evidence set E.

It would still not claim statutory approval or correct physical construction.

Those belong to different processes.

```text
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
```

The same evidence graph can continue through product identity, dimensional inspection, concealed-work records, certificates, commissioning results, deviations and later alterations.

## Human judgement is a legitimate method

Some questions should remain explicitly human: unusual alternative compliance, geotechnical interpretation, subtle architectural composition, novel engineering and other conditions that cannot be represented honestly as a deterministic rule.

The computational model can still record:

- that a determination is required;
- who or what authority made it;
- its subject and scope;
- assumptions;
- evidence artefact;
- which source state it applies to.

The objective is not universal automation. It is visible authority and traceable reasoning.

## No aggregate quality score

Do not collapse architecture into one scalar.

Prefer explicit validity dimensions, warnings, objective vectors, alternative comparisons and provenance. Where optimisation is useful, weights and objective functions should be declared rather than presented as universal architectural truth.

## Example summary

A useful future summary might read:

```text
MODEL INTEGRITY                    PASS
PLAN / SPATIAL                     PASS
STRUCTURAL TOPOLOGY                PASS
STRUCTURAL CAPACITY                EXTERNAL EVIDENCE REQUIRED
BOUNDARY TOPOLOGY                  PASS
SELECTED STAIR METHOD              PASS
WHOLE-BUILDING REGULATORY STATUS   NOT PROVED
ARCHITECTURAL GRAMMAR              PASS
EVIDENCE COMPLETENESS              UNRESOLVED
```

The value is not the dashboard. It is the refusal to let one green result consume the distinctions beneath it.

## Current executable boundary

The present implementation already distinguishes source/model failure, architectural review conditions, unsupported method states, selected calculation results and accepted external evidence at bounded scope.

It does not implement the full conceptual validity lattice or a statutory/building-release mode. New states should be added only when they clarify a real architectural, technical or evidence distinction rather than making the system appear more complete.

See [Evidence and Provenance](evidence-and-provenance.md) for evidence scope and lifecycle in more detail.

## Reference points

- Purushotham, Kailashnath & Mutis, framework for transparent automated code-compliance checking, *Automation in Construction* 181 (2026), 106598.
- Zentgraf, Hagedorn & König, BIM-based automated code extraction/compliance framework, *Advanced Engineering Informatics* 65 (2025), 103270.
- buildingSMART, Information Delivery Specification (IDS).
