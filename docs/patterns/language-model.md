# HSA Pattern Language — Model and Authoring Contract

This document defines what a House Systems Architecture pattern is, how patterns relate, and how canonical pattern records are authored. It controls the pattern layer without replacing the governing principles, research evidence, implementation families, Reference House decisions or computational semantic model.

---

## 1. Role of the pattern layer

House Systems Architecture needs a layer between durable doctrine and project-specific construction.

A principle such as **Preserve the permanent fabric** is intentionally broad. A project still needs reusable architectural moves that resolve recurring situations: utility entry, service concentration, accessible high-service walls, designed crossings, replacement access and so on.

The pattern layer owns those reusable responses.

A pattern language adds two things that a catalogue does not:

1. **relationships** — patterns state which other patterns they normally depend on, complete, compete with or place in tension;
2. **generation** — sequences use those relationships to help a designer make consequential decisions in a productive order.

The language should support design judgement, not substitute for it.

---

## 2. Conceptual stack

```text
GOVERNING PRINCIPLE
        ↓
     STRATEGY
        ↓
      PATTERN
        ↓
IMPLEMENTATION FAMILY
        ↓
PROJECT OCCURRENCE
```

Alongside that stack:

```text
PATTERN ───────────────► EVIDENCE
   │
   └─ formal consequences ─► RULES / OBLIGATIONS / QUERIES
```

Neither evidence nor formalisation changes the identity of the architectural pattern.

### Governing principle

A durable proposition about the architecture. Principles should change rarely.

### Strategy

A broad approach that can be realised through substantially different spatial or technical patterns.

A strategy may therefore be too abstract to draw as one recurring architectural relationship.

### Pattern

A recurring architectural response to a recurring context and set of forces.

A pattern is specific enough to influence spatial or physical design, but general enough to admit materially different implementations.

### Implementation family

A specific construction or system family capable of realising a pattern.

Examples might include a timber service frame, masonry plumbing void, proprietary access wall or direct-bearing floor edge. Selection between families belongs to engineering, evidence, project constraints and architectural judgement.

### Occurrence

One application in one project: a particular service wall, window opening, maintenance route or utility-entry zone.

### Rule / obligation

A proposition precise enough to be checked or evidenced. The computational track may derive these from selected architectural relationships, but the pattern itself is not a software rule.

---

## 3. Pattern identity

Canonical patterns receive stable IDs:

```text
HSA-P-001
HSA-P-002
...
```

The number is identity only. It does **not** encode category, scale, evidence state or publication order.

A renamed pattern retains its ID if the recurring problem and invariant response remain substantially the same. `HSA-P-003`, for example, retained its identity when **Horizontal Service Spine** became **Coherent Horizontal Service Route** because route coherence, not one literal spine, was the stable architectural relationship.

A proposition that splits into two materially distinct patterns receives new IDs. Numbering should not be preserved at the cost of conceptual clarity.

IDs are never reused after retirement. `HSA-P-006` therefore remains retired permanently even though some of its durable content survives at strategy level and in narrower patterns.

---

## 4. Admission test

A canonical pattern should satisfy the following strongly enough to guide design.

### Recurrence

The condition plausibly appears across multiple houses, sites or assemblies.

### Context

The page can state when the pattern applies and meaningful conditions where it may not.

### Forces

There are competing demands to resolve. A sentence that simply says “always do X” is more likely a rule or doctrine proposition.

### Relationship

The pattern resolves a spatial, physical, lifecycle or operational relationship rather than merely naming a desirable outcome.

### Variation

More than one implementation can satisfy the invariant without making the pattern meaningless.

### Diagrammability

A useful diagram can show the relationship, topology, sequence or boundary condition.

### Consequences

The pattern can state what it improves, what it costs, and what new obligations or boundary debt it creates.

### Composition

It participates meaningfully in the larger language.

### Evidential honesty

Its evidence state can be stated without laundering preference into fact.

A proposition can remain valuable while failing the admission test. Reclassify it rather than forcing it into the language.

---

## 5. Relationship vocabulary

### `requires`

Use when another pattern or condition normally needs to exist or be resolved first for this pattern to make architectural sense.

This is not necessarily an absolute technical dependency. The prose should clarify exceptions where important.

### `completes`

Use when this pattern commonly develops, localises or carries another pattern into a finer scale or more specific condition.

### `alternative-to`

Use where two patterns address substantially overlapping problems and combining them by default would usually be redundant or self-defeating.

### `tension-with`

Use where two patterns can coexist but their forces pull against each other strongly enough that the conflict should be explicit.

### Relationship restraint

Do not add synonyms such as `supports`, `enables`, `related-to`, `parent-of`, `uses`, `precedes` or `depends-on` until repeated worked cases demonstrate that the four relations above cannot express the design knowledge clearly.

Sequence ordering belongs primarily in sequence documents, not in an ever-growing edge vocabulary.

---

## 6. Scale and domain

Scale and domain are independent metadata.

### Suggested scales

Use the smallest useful set that fits the actual pattern:

- `site`
- `building`
- `zone`
- `room`
- `assembly`
- `interface`
- `component`
- `stewardship`

Multiple scales are allowed where the invariant genuinely spans them.

### Suggested domains

Examples:

- architecture
- services
- structure
- envelope
- water
- maintenance
- lifecycle
- environment
- fire
- acoustics
- workmanship
- stewardship
- repose

Domains are filters, not ownership boundaries. A good pattern commonly spans several.

Do not create a domain taxonomy more detailed than the work needs.

---

## 7. Evidence and maturity

Preserve two independent axes.

### Evidence

- **Established** — strong professional, regulatory, empirical or long-standing practice basis for the underlying proposition within its stated scope.
- **Supported** — credible evidence and precedent exist, but important transfer, scope or comparative questions remain.
- **Proposed** — plausible and reasoned, but evidence is incomplete.
- **Experimental** — intentionally under test; should not be presented as a general project requirement.

### Maturity

Use the existing project vocabulary as applicable:

- Drawn
- Calculated
- Costed
- Mocked-up
- Maintenance-tested
- Built
- Observed in use

Evidence describes confidence in the proposition. Maturity describes what the project has actually done with it.

Reclassification or renaming does not increase either axis.

---

## 8. Pattern frontmatter contract

Use ordinary Markdown frontmatter as the machine-readable source.

```yaml
---
id: HSA-P-003
title: Coherent Horizontal Service Route
kind: pattern
state: active
evidence: supported
maturity: []
scales:
  - building
  - zone
domains:
  - services
  - maintenance
  - acoustics
principles:
  - 2
  - 5
  - 6
  - 8
requires: []
completes:
  - HSA-P-002
alternative_to: []
tension_with: []
sequences:
  - service-topology
---
```

### Required fields

- `id`
- `title`
- `kind`
- `state`
- `evidence`
- `maturity`
- `scales`
- `domains`
- `principles`
- the four relationship arrays
- `sequences`

### Deliberately excluded

Do not encode prose, evidence citations, implementation options, failure modes, compiler rules or Reference House occurrences in frontmatter.

Those belong in readable content or separate domain-specific records. Frontmatter should help navigate and validate the language, not become a second ontology.

---

## 9. Canonical pattern anatomy

Each mature pattern page should contain, where applicable:

1. **Context** — when this pattern is relevant.
2. **Problem** — recurring failure or design difficulty.
3. **Pattern** — the invariant response in a short, forceful statement.
4. **Forces** — competing pressures the response must balance.
5. **Relationships** — why the linked patterns matter; frontmatter alone is not enough.
6. **Variants / implementation families** — materially different ways the pattern may be realised.
7. **Proportionality** — what future task justifies permanent provision.
8. **Boundary debt** — structure / fire / smoke / acoustic / air / vapour / water / thermal / pest / security as relevant.
9. **Permanent-fabric impact** — irreversible work the pattern itself requires.
10. **Workmanship / tolerance** — how ordinary construction variation is absorbed.
11. **Occupation / repose impact** — where the pattern affects lived space.
12. **Architectural resolution** — how the condition becomes architecture rather than unresolved equipment.
13. **Assembly / maintenance / replacement sequence** — where a shorter-lived component is involved.
14. **Failure modes** — how the pattern itself can fail.
15. **Evidence** — scoped support, not a bibliography dump.
16. **Does not prove** — mandatory where evidence could be overextended.
17. **Reference House application** — one project interpretation, clearly not general proof.
18. **Formalisation boundary** — optional short note identifying consequences that may be formalised and judgements that should remain architectural.

Not every small pattern needs equal prose under all headings. Omit genuinely irrelevant sections rather than filling templates mechanically.

---

## 10. Pattern versus strategy test

A recurring warning sign is a proposition whose “variants” solve the problem through fundamentally different relationships.

The retired `HSA-P-006 — Water-Damage-Safe Service Route` grouped pipe-in-pipe, fully accessible distribution, drained containment, passive fall and electronic isolation. Those responses do not form one stable spatial relationship. The durable proposition therefore belongs to the [Fail-Safe Water Distribution](strategies/fail-safe-water-distribution.md) strategy, with narrower patterns beneath it where a recurring physical relationship exists.

Do not preserve a pattern identity merely because its prose remains useful.

---

## 11. Pattern versus implementation-family test

A proposition is probably an implementation family when its identity depends on a particular assembly concept rather than the more general relationship being solved.

**Seated Floor Structure**, for example, exposes a stronger general idea: separate gravity support, restraint, movement and boundary obligations before choosing the connection. That general knowledge is captured by the [Decompose Structural Interface Functions](strategies/decompose-structural-interface-functions.md) strategy, while a seated connection remains an implementation challenger to be compared with ordinary engineered alternatives.

The language should preserve the general architectural knowledge without promoting every promising construction family into a canonical pattern.

---

## 12. Generative sequences

A sequence is a separate canonical artefact that references patterns by stable ID.

A useful sequence should state:

- starting context;
- design move;
- why it occurs at this stage;
- patterns invoked;
- information created for later stages;
- checks before proceeding;
- rewind conditions;
- unresolved branches or alternatives.

Sequences may overlap. The [service-topology sequence](service-topology-sequence.md), for example, intersects with envelope, maintenance, environmental and room-order decisions without attempting to become a universal master sequence.

Keep graph relationships and sequence ordering separate: they answer different questions.

---

## 13. Reference House relationship

The Reference House is a **language integration test**. Its [Pattern Occurrence Register](../reference-house/pattern-occurrence-register.md) records selected pattern IDs, actual project occurrences, implementation directions and outstanding obligations.

The house can also expose rejected patterns, conflicts, rewind events and missing reusable knowledge. None of those outcomes validates or invalidates the language by project use alone.

A Reference House occurrence is evidence about coordination in one project. General pattern evidence remains separately controlled.

---

## 14. Computational boundary

The computational track models the building through stable semantic identity, typed relationships, geometry, overlapping domain graphs, obligations and scoped evidence.

Pattern pages may identify **formalisable consequences** such as:

- an access route must connect two occurrences;
- a replacement path must contain a withdrawal volume;
- an opening creates boundary transitions;
- a selected relationship creates an obligation for structural or environmental evidence.

But the following remain distinct:

```text
architectural pattern
      ≠
implementation family
      ≠
semantic relationship
      ≠
compiler rule
      ≠
evidence of adequacy
```

This separation is a hard project constraint. Pattern provenance may inform project requirements, but technical obligations derive from the composed building relationships represented in the model.

---

## 15. Canonical identities

The current language contains 21 active canonical patterns. `HSA-P-006` is retired permanently and its ID will not be reused.

The canonical active and retired lists are generated from individual pattern frontmatter in the [Pattern Index](README.md). Historical identity maps and development decisions remain in the development records as provenance rather than current language authority.

---

## 16. Change discipline

- relationship changes require a reason in prose, not just frontmatter edits;
- new patterns require the admission test;
- new relationship types require evidence from repeated worked cases;
- reclassification of an existing pattern must preserve provenance;
- reclassification or renaming does not increase evidence or maturity;
- retired IDs are never reused;
- sequences remain separate from graph relationships;
- the Reference House remains an integration test, not evidence for pattern validity.
