# Ovid’s House Pattern System — Model and Authoring Contract

This document defines what an Ovid’s House pattern is, how patterns relate, how generative sequences are represented and how canonical pattern records are authored. It controls the pattern layer without replacing the governing constitution, research evidence, implementation families, Reference House decisions or computational semantic model.

The system is capable of supporting a pattern language. The **current corpus is not claimed to be one uniformly mature language**. Service topology presently provides the strongest demonstrated generative sequence; other fields contain valid patterns with less-complete relationship and sequence structure. That asymmetry is evidence about maturity, not a reason to invent links.

## 1. Role of the pattern layer

Ovid’s House needs a layer between durable doctrine and project-specific construction.

A constitutional provision such as **Preserve the permanent fabric** is intentionally broad. A project still needs reusable architectural moves that resolve recurring situations: utility entry, service concentration, accessible high-service walls, designed crossings, replacement access and so on.

The pattern layer owns those reusable responses.

A mature pattern language adds two things that a catalogue does not:

1. **relationships** — patterns state which other patterns they normally depend on, complete, compete with or place in tension;
2. **generation** — sequences use those relationships to help a designer make consequential decisions in a productive order.

The present system demonstrates those qualities most clearly in service topology. An individual pattern can remain valid even when its wider field has not yet earned a mature generative sequence.

The pattern system should support design judgement, not substitute for it.

## 2. Conceptual stack

```text
GOVERNING CONSTITUTION
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

### Governing constitution

Durable propositions and standing disciplines that constrain the architecture. The constitution should change rarely.

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

## 3. Pattern identity

Canonical patterns receive stable IDs:

```text
HSA-P-001
HSA-P-002
...
```

The number is identity only. It does **not** encode category, scale, evidence state or publication order. Pattern names are the primary reader-facing identity; IDs provide durable cross-reference across patterns, evidence, project selections and computational representations.

A pattern should keep its identity only while its recurring problem and invariant response remain substantially the same. If one proposition actually contains materially different recurring relationships, conceptual clarity outranks preserving one identifier.

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

The pattern can state what it improves, what it costs and what new obligations or boundary debt it creates.

### Composition

It participates meaningfully in the wider pattern system. This does not require every pattern to belong to one mature sequence.

### Evidential honesty

Its evidence state can be stated without laundering preference into fact.

A proposition can remain valuable while failing the admission test. Keep it as a strategy, held candidate, implementation family, rule or research question rather than forcing it into the canonical pattern set.

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

## 6. Scale and domain

Scale and domain are independent metadata.

### Suggested scales

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

Examples include architecture, services, structure, envelope, water, maintenance, lifecycle, environment, fire, acoustics, workmanship, stewardship and repose.

Domains are filters, not ownership boundaries. A good pattern commonly spans several. Do not create a taxonomy more detailed than the work needs.

## 7. Evidence and maturity

Preserve two independent axes.

### Evidence

- **Established** — strong professional, regulatory, empirical or long-standing practice basis for the underlying proposition within its stated scope.
- **Supported** — credible evidence and precedent exist, but important transfer, scope or comparative questions remain.
- **Proposed** — plausible and reasoned, but evidence is incomplete.
- **Experimental** — intentionally under test; should not be presented as a general project requirement.

### Maturity

Useful project maturity states include:

- Drawn
- Calculated
- Costed
- Mocked-up
- Maintenance-tested
- Built
- Observed in use

Evidence describes confidence in the proposition. Maturity describes what the project has actually done with it.

Language-level maturity is separate again: a field may contain valid patterns without yet possessing demonstrated generative ordering across them.

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

`principles` refers to the numbered provisions of the governing constitution.

### Deliberately excluded

Do not encode prose, evidence citations, implementation options, failure modes, compiler rules or Reference House occurrences in frontmatter.

Those belong in readable content or separate domain-specific records. Frontmatter should help navigate and validate the pattern system, not become a second ontology.

## 9. Canonical pattern anatomy

Each mature pattern page should contain, where applicable:

1. **Context** — when this pattern is relevant.
2. **Problem** — recurring failure or design difficulty.
3. **Pattern** — the invariant response in a short, forceful statement.
4. **Forces** — competing pressures the response must balance.
5. **Relationships** — why linked patterns matter; frontmatter alone is not enough.
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

## 10. Pattern versus strategy

A proposition is probably a strategy when its apparent “variants” solve the problem through fundamentally different relationships.

[Fail-Safe Water Distribution](strategies/fail-safe-water-distribution.md), for example, can be realised through joint minimisation, accessible routing, visible leakage paths, local containment, isolation or room-scale failure tolerance. Those are not one stable spatial relationship. The common outcome is therefore strategic, with narrower patterns beneath it where recurring physical relationships exist.

Do not force useful prose into pattern form merely to enlarge the canonical set.

## 11. Pattern versus implementation family

A proposition is probably an implementation family when its identity depends on one assembly concept rather than the general relationship being solved.

A direct/seated floor connection, for example, may expose a wider lesson: separate gravity support, restraint, movement and boundary obligations before selecting the connection. That knowledge is captured by [Decompose Structural Interface Functions](strategies/decompose-structural-interface-functions.md), while the physical connection remains one implementation family to compare with conventional engineered alternatives.

The pattern system should preserve reusable architectural knowledge without promoting every promising construction family into a pattern.

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

Do not create a new sequence merely to make a pattern family appear more mature. Sequence authority should come from repeated design work that demonstrates consequential ordering.

## 13. Reference House relationship

The Reference House is a **pattern-system integration test**. Its [Pattern Selection](../reference-house/pattern-occurrence-register.md) records which current patterns materially shape the house, the project consequences and the outstanding proof attached to them.

Use in the house does not validate the general pattern. A Reference House occurrence is evidence about coordination in one project; general pattern evidence remains separately controlled.

## 14. Computational boundary

The computational track models the building through stable semantic identity, typed relationships, geometry, overlapping domain graphs, obligations and scoped evidence.

Pattern pages may identify formalisable consequences such as:

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

This separation is a hard project constraint. A selected architectural pattern may explain why a project requirement exists, but technical obligations derive from the composed building relationships represented in the model.

## 15. Current system

The current system contains **21 active canonical patterns**, **3 canonical strategies** and **4 held candidates**.

The active pattern list is generated from individual frontmatter in [Patterns and generative sequences](README.md). Held candidates remain outside the canonical identity set until their stated admission questions are resolved.

Language-level maturity is intentionally uneven:

- service topology has one mature documented generative sequence;
- other fields contain useful relationships but do not claim equivalent generative completeness;
- no relationship edge or sequence is added solely to improve apparent graph density.

## 16. Change discipline

- relationship changes require a reason in prose, not just frontmatter edits;
- new patterns require the admission test;
- new relationship types require evidence from repeated worked cases;
- a renamed pattern retains its identity only when its invariant remains materially the same;
- a split or materially changed invariant receives a new identity;
- sequences remain separate from graph relationships;
- the Reference House remains an integration test, not evidence for general pattern validity;
- current corpus status must be stated at the maturity actually demonstrated, even if the long-term ambition is a richer pattern language.
