# Architectural Specificity Boundary

**Status:** active integration rule  
**Purpose:** prevent project-specific taste, morphology or construction choices from being promoted accidentally into general House Systems Architecture doctrine, patterns or computational capability.

## The problem

The project began with a concrete house in mind. That was useful: a real architectural preference forced technical ideas to meet an actual domestic language rather than an abstract diagram.

It also created a predictable risk. Features of that imagined house can migrate upstream and begin to look like properties of House Systems Architecture itself.

The clearest case is Georgian architecture. The Reference House may legitimately be Georgian-derived. House Systems Architecture is not.

The same test applies to less obvious inherited assumptions: symmetry, courtyard planning, red brick, classical hierarchy, masonry construction, two storeys, a pitched roof, particular window proportions or any other feature that might belong to one house, one grammar or one supported technical family rather than the general proposition.

## The dependency rule

Architectural specificity should enter as late as the claim permits.

```text
HOUSE SYSTEMS ARCHITECTURE
        │
        ├── Doctrine
        │     durable, style-neutral propositions
        │
        ├── Strategies / pattern language
        │     reusable responses; style-neutral unless explicitly scoped
        │
        ├── Computational semantics / supported domain
        │     what the system can represent or prove
        │
        ├── Architectural grammar
        │     selected spatial, compositional and tectonic language
        │
        ├── Project + site configuration
        │     brief, plot, climate, programme, morphology
        │
        └── Reference implementation
              one coordinated house
```

The arrows are dependencies, not a rigid design sequence. Evidence and conflicts can move upstream. A downstream preference must not silently become an upstream requirement.

## Layer tests

### Doctrine

Doctrine should survive a change of architectural style.

A proposition belongs here only if the project would still defend it in, for example, a contemporary, Arts and Crafts, vernacular Mediterranean or Japanese-derived house.

Appropriate doctrine includes serviceability, lifespan separation, designed interfaces, failure tolerance, maintenance geography, repose, passive-first environmental design, legibility and architectural resolution of technology.

Inappropriate doctrine includes Georgian proportions, classical mouldings, symmetry, sash-window composition, red brick or a courtyard.

### Strategies and patterns

A pattern should solve a recurring architectural problem without requiring one stylistic vocabulary unless its scope explicitly says otherwise.

For example, using architectural depth to absorb tolerance may be general. Using a Georgian cornice to perform that work is one implementation.

If a response only makes sense inside one architectural language, it should be marked as grammar-specific or kept with that project rather than promoted as a general pattern.

### Supported domain

The supported domain defines technical competence, not taste.

A first implementation may support only detached cavity-masonry houses with simple pitched roofs because narrow competence makes strong claims possible. That is a computational boundary, not a doctrine that good houses must be masonry, detached or pitched-roofed.

Technical-family restrictions must therefore remain labelled as domain restrictions.

### Architectural grammar

This is the correct place for strong architectural opinion that is not universal doctrine.

A grammar may legitimately constrain hierarchy, topology, axes, bay relationships, dimensional families, opening composition, vertical order, element families and stylistic lineage. Those constraints define membership in that selected language; they do not define House Systems Architecture.

The first research grammar, **G-01**, is Georgian-derived because the Reference House is Georgian-derived. G-01 is a selectable architectural language, not the default meaning of the project.

### Project and reference implementation

The Reference House may be highly specific. It can select G-01, a courtyard morphology, particular materials, a two-storey organisation and a tectonic dialect using traditional joinery and restrained metalwork.

Its job is to expose conflicts by making choices concrete. It is not evidence that those choices are generally required.

## Promotion rule

A downstream feature may move upstream only after abstraction and independent justification.

The promotion test is:

1. identify the underlying effect or problem;
2. remove the historical or stylistic implementation from the statement;
3. test whether the generalised proposition survives materially different architectural languages;
4. establish evidence appropriate to the stronger claim;
5. promote only the general proposition, retaining the original example as precedent or implementation.

Example:

```text
Georgian cornice conceals a movement junction
        ↓
architectural depth can resolve a real movement/tolerance interface
        ↓
possible doctrine/pattern proposition
```

The cornice remains an implementation. The interface principle may be general.

## Contamination tests

When reviewing a supposedly general document, ask:

- Would this still make sense if the Reference House were not Georgian?
- Is this statement about architectural quality, or merely about membership in G-01?
- Is a construction family being mistaken for an architectural value?
- Is a Reference House morphology being treated as a reusable rule?
- Has a precedent supplied a general principle, or merely a persuasive example?
- Would rejecting this feature invalidate House Systems Architecture, or only this grammar/house?

If the latter, move it downstream.

## Audit result — 2026-10-07

### Clean or correctly scoped

- `docs/manuscript/governing-principles.md` — style-neutral public doctrine.
- `docs/manuscript/part-i.md` — explicitly distinguishes Georgian implementations from doctrine.
- `docs/manuscript/part-ii.md` — treats traditional details as examples and labels the Reference House language as a project choice.
- `docs/computational/supported-domain.md` — explicitly separates doctrine, grammar, technical domain and project configuration, and states that H1 must not encode Georgian/classical rules.
- `docs/reference-house/tectonic-architectural-language.md` — correctly states that Georgian language belongs to the Reference House rather than universal doctrine.
- `docs/source/house-design-doctrine-v7.md` — contains genuine historical contamination, but is frozen provenance and must not be rewritten as though it were current doctrine.

### Corrected by this audit

- `docs/computational/architectural-grammar-and-proportion.md` previously mixed the general concept of an architectural grammar with extensive G-01/Georgian content. The framework is now style-neutral; G-01-specific derivation remains in the dedicated `g01-*` research records.
- repository documentation now states the architectural-specificity placement rule explicitly.
- the Reference House index now declares its Georgian-derived grammar selection as project-specific.

## Residual watch list

Future reviews should challenge, rather than automatically remove, assumptions involving:

- detached-house morphology;
- one/two-storey organisation;
- cavity masonry and dense inner leaves;
- simple pitched/hipped roofs;
- courtyard planning;
- symmetry and axial ordering;
- traditional joinery elements;
- brass/bronze interface language;
- room hierarchy derived from historical domestic types.

Some belong legitimately to H1, G-01 or the Reference House. The risk is not their presence. The risk is losing their scope label.

## Governing rule

> **Generalise the reason; localise the taste.**

House Systems Architecture should be opinionated about how a house survives, works, fails, changes and feels to inhabit. A selected architectural grammar may be equally opinionated about what that house looks like and how it is composed. The project is stronger when those two kinds of opinion remain distinguishable.
