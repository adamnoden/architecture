# House Systems Architecture

Most architectural information describes a house at or near completion, while the building spends almost all of its life in use. Pipes leak, equipment is replaced, finishes wear, rooms are altered, and access that looked adequate on a drawing can prove useless once a person, tool or replacement component has to pass through it. Structure, envelope, services and fit-out change at different rates, but they continue to occupy the same building.

**House Systems Architecture (HSA)** is a design-research programme for that longer life. It treats the house as a set of interacting architectural and technical systems with different jobs, lifetimes and rates of change. The central problem is how those systems should meet: how repair and replacement can remain local, how foreseeable failures can be detected and contained, how maintenance can be given real working space, and how one changing layer can avoid needlessly consuming another.

Change is concentrated where it earns its cost rather than spread indiscriminately through the building. Serviceability therefore sits alongside settled spatial order, passive-first environmental design, ordinary replaceable parts, explicit interfaces, workmanship robustness and architectural repose. Non-standard propositions still have to earn their place against life safety, building physics, whole-life cost, carbon, construction reality and architectural quality.

The work moves from governing principles to strategies and a canonical pattern language, then into one deliberately specific Reference House, physical prototypes, an implementation brief and a bounded computational track. The Reference House is one interpretation, not proof. The compiler formalises only the subset of relationships that benefit from becoming explicit and testable; it is not the project’s governing model.

## Architectural position

The canonical public doctrine is the [eleven governing principles](docs/manuscript/governing-principles.md). The recurring moves are:

- **Design for the building after handover.** Maintenance, repair, replacement, adaptation and renewal are design events.
- **Separate lifetimes where separation buys something.** Short-lived services, fittings and replaceable assemblies should not routinely require long-lived fabric to be chased, perforated or demolished with them.
- **Design the interface.** Support, restraint, movement, sealing, tolerance, access and disassembly are relationships to resolve explicitly.
- **Give failure and maintenance real geometry.** Approach, working space, isolation, disconnection and withdrawal have to fit in the building and, where necessary, around it.
- **Prefer ordinary parts in robust arrangements.** Novelty belongs where an arrangement or interface earns it, and details should tolerate ordinary competent workmanship.
- **Keep the house architectural.** Serviceability cannot justify poor rooms, technical clutter, hollow construction, fragile comfort or needless complexity.

Evidence, context-sensitive findings and architectural hypotheses are kept distinct. A pattern or prototype may fail without invalidating the principle it was intended to serve.

## Project outputs

| Output | Role | Current state |
|---|---|---|
| **Illustrated monograph** | Develops the architectural argument for a professional reader | structurally mature; figures, evidence presentation and final integration remain |
| **Pattern language** | Records reusable responses, forces, trade-offs, evidence, maturity and relationships | canonical 21-pattern language complete at current internal scope |
| **Reference House** | Forces the doctrine, patterns, technical systems and an architectural grammar to coexist | provisional and actively developing |
| **Prototype programme** | Subjects uncertain/non-standard assemblies to 1:1 comparison and attack | W2 wall-bay pack/protocol ready; physical results not yet recorded |
| **Implementation brief** | Translates mature findings into requirements and RIBA-stage decisions | framework exists; populate as decisions mature |
| **Computational track** | Tests bounded semantic relationships, obligations and evidence | paper model, P0 kernel and first pattern crosswalk passed; generic growth frozen |

The design-research chain is:

**Doctrine → Strategy → Pattern language → Generative sequence → Reference implementation → Delivery requirement → Test**

Evidence, professional review, physical testing and later conflicts can send work upstream.

## Current phase

**Validation / implementation falsification.** The central doctrine, canonical pattern-language migration, pattern→computational crosswalk, architectural-specificity audit, paper compiler research and first executable compiler gate are complete at their stated internal scopes.

The highest-value unfinished work is now:

1. **Reference House coordination** — challenge the provisional footprint; resolve circulation, courtyard, structure, openings, services, drainage, external maintenance and passive-first environmental strategy as one house.
2. **Physical / engineering validation** — build and test the W2 wall bay; engineer the floor-edge proposition; test the floor platform and representative tectonic joints against strong conventional comparators.
3. **Competent external attack** — structural, building-control/fire and building-services/ventilation review.
4. **Publication development** — finish Part III/IV figures and pages, integrate evidence, close citation/glossary/back-matter gaps and proof the book after validation findings land.
5. **Delivery translation** — turn surviving propositions into explicit requirements, responsibilities and evidence gates for an appointed design team.

The computational track is no longer the default growth path. P0 passed 17 executable tests and `PAT-XW-01` added six passing crosswalk tests. Further compiler fixtures should be added only when architectural, physical or professional work exposes a concrete high-value question.

For the canonical maturity map, stop rules, unresolved risks and next gates, see **[STATUS.md](STATUS.md)**.

## Authority boundary

HSA is intentionally architecturally opinionated without making one historical style doctrinal.

The current Reference House selects a **Georgian-derived G-01 grammar**, courtyard project morphology and its own tectonic dialect. Those are downstream project choices. They may realise HSA principles, but they are not evidence that Georgian architecture, symmetry, cavity masonry, courtyard planning, pitched roofs or brass details are HSA requirements.

The rule is: **generalise the reason; localise the taste.** See the [Architectural Specificity Boundary](docs/development/architectural-specificity-boundary.md).

## Repository map

| Area | Purpose | Start here |
|---|---|---|
| **Project state** | Current maturity, risks and next gates | [STATUS.md](STATUS.md) |
| **Documentation model** | Canonicality, placement and authority rules | [`docs/README.md`](docs/README.md) |
| **Manuscript** | Public architectural argument and book structure | [Publication architecture](docs/manuscript/publication-architecture.md) · [Governing principles](docs/manuscript/governing-principles.md) · [Preface](docs/manuscript/preface.md) |
| **Patterns** | Canonical pattern language, strategies, candidates and sequences | [Pattern language](docs/patterns/README.md) · [Language model](docs/patterns/language-model.md) |
| **Reference House** | Worked architectural/technical interpretation | [Reference House](docs/reference-house/README.md) · [Pattern Occurrence Register](docs/reference-house/pattern-occurrence-register.md) |
| **Research** | Evidence synthesis, precedent and claim hardening | [`docs/research/`](docs/research/) |
| **Development** | Programme control, completed migrations/audits and prototype strategy | [`docs/development/README.md`](docs/development/README.md) |
| **Prototypes** | Build packs, drawings, test protocols and later results | [`docs/prototypes/README.md`](docs/prototypes/README.md) · [W2 wall-bay build pack](docs/prototypes/w2-wall-bay-build-pack.md) |
| **Delivery** | Requirements for an appointed design team | [RIBA implementation brief template](docs/delivery/riba-implementation-brief-template.md) |
| **Computational** | Bounded executable-architecture research and compiler fixtures | [Computational track](docs/computational/README.md) · [P0 + PAT-XW-01 result](docs/computational/p0-pat-xw-01-result.md) |
| **Source** | Frozen original doctrine retained for provenance | [House Design Doctrine v7](docs/source/house-design-doctrine-v7.md) |

## Repository rules

- **`STATUS.md` owns current project state.** Track documents may contain historical sequencing; when they disagree about what is current, `STATUS.md` and later explicit gate-result records control.
- **The governing principles are the primary public doctrine.** The v7 doctrine is preserved source material, not the live book.
- **Pattern identity does not imply truth.** Evidence and maturity remain separate from inclusion in the canonical language.
- **The Reference House is a coordination vehicle, not evidence for doctrine or pattern validity.**
- **The language is not the compiler.** Pattern provenance may inform project requirements; technical obligations derive from actual composed building relationships.
- **Architectural quality remains a hard constraint.** Maintainability and reversibility do not justify a spatially poor, visually unsettled, acoustically hollow or disproportionately complex house.
- **Repository structure and publication navigation are separate concerns.** The repository remains the source of truth; the documentation site is a curated reading interface over it.
