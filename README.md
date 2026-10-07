# House Systems Architecture

Most architectural information describes a house at or near completion, while the building spends almost all of its life in use. Pipes leak, equipment is replaced, finishes wear, rooms are altered, and access that looked adequate on a drawing can prove useless once a person, tool or replacement component has to pass through it. Structure, envelope, services and fit-out change at different rates, but they continue to occupy the same building.

**House Systems Architecture** is a design-research programme for that longer life. It treats the house as a set of interacting architectural and technical systems with different jobs, lifetimes and rates of change. The central design problem is how those systems should meet: how repair and replacement can remain local, how foreseeable failures can be detected and contained, how maintenance can be given real working space, and how one changing layer can avoid needlessly consuming another.

Change is concentrated where it is useful rather than spread indiscriminately through the building. The project therefore pairs serviceability with settled spatial order, passive-first environmental design, ordinary replaceable parts and explicit interfaces. Any non-standard proposition still has to earn its place against life safety, building physics, whole-life cost, carbon, workmanship and architectural quality.

The work moves from architectural principles to strategies and reusable patterns, then asks whether those patterns form a coherent **language**: which recur together, which conflict, and in what order consequential decisions should be made. Generative sequences are being tested against the Reference House before the existing catalogue is migrated wholesale. Research, physical prototypes and professional review qualify the patterns; the Reference House tests whether they can coexist. A parallel computational track investigates the smaller subset of architectural relationships that can be represented strongly enough for invalid arrangements to fail during authoring or compilation.

## Architectural position

The canonical public doctrine is the [eleven governing principles](docs/manuscript/governing-principles.md). At root level, the recurring moves are:

- **Design for the building after handover.** Maintenance, repair, replacement, adaptation and renewal are design events. Cheap provision for foreseeable change is valuable; speculative flexibility must justify itself.
- **Separate lifetimes where separation buys something.** Short-lived services, fittings and replaceable assemblies should not routinely require long-lived fabric to be chased, perforated or demolished with them.
- **Design the interface.** Support, restraint, movement, sealing, tolerance, access and disassembly are relationships to resolve explicitly rather than leftovers between components.
- **Give failure and maintenance real geometry.** A visible component is not necessarily maintainable. Approach, working space, isolation, disconnection and withdrawal have to fit in the building and, where necessary, around it.
- **Prefer ordinary parts in robust arrangements.** Standard components, familiar fabrication and clear datums are the default. Novelty belongs where an arrangement or interface earns it, and details should tolerate ordinary competent workmanship.
- **Keep the house architectural.** Serviceability cannot justify poor rooms, technical clutter, hollow construction or fragile comfort. Repose, passive-first environmental design and tectonic honesty remain constraints on the system.

Evidence, context-sensitive findings and architectural hypotheses are kept distinct. A pattern may fail without invalidating the principle it was intended to serve.

## How the project is organised

The programme has six linked outputs:

| Output | Role |
|---|---|
| **Illustrated monograph** | Develops the architectural argument and governing principles for a professional reader. |
| **Pattern language** | Records reusable responses with their forces, trade-offs, evidence, maturity and failure modes; typed relationships and generative sequences are added only where they survive worked design. |
| **Reference house** | Forces the principles and patterns to coexist in one coordinated house so that cross-system conflicts become visible. It is a worked interpretation and language-integration test, not evidence for the doctrine. |
| **Prototype programme** | Subjects non-standard assemblies and details to 1:1 testing, conventional comparators and competent external attack before promotion. |
| **Implementation brief** | Translates mature findings into project requirements, evidence, responsibilities and RIBA-stage decisions for an appointed design team. |
| **Computational track** | Tests which bounded parts of the architecture can be expressed as semantic building relationships, obligations and evidence strongly enough to produce useful compile failures. |

The intended design-research chain is:

**Doctrine → Strategy → Pattern language → Generative sequence → Reference implementation → Delivery requirement → Test**

This is not a rigid waterfall. Evidence, professional review, physical testing and later conflicts can send the work upstream. The current pattern-language migration is deliberately held at a Reference House gate before the full catalogue is reclassified or moved.

## Current phase

**Convergence → validation.** The governing position is established. The main unanswered questions now require coordination, physical work or competent external judgement rather than more doctrine.

The highest-value work is to:

- complete enough of the Reference House to run the service-topology pattern-language gate honestly, then decide whether full pattern-corpus migration is earned;
- test the non-standard assemblies and technical assumptions through prototypes and professional review;
- complete the Reference House and feed those findings back into the patterns and publication;
- externally review the computational model and build only the minimal executable kernel needed to test whether the formal proposition survives contact with software.

For the canonical maturity map, risks, stop rules and next gates, see **[STATUS.md](STATUS.md)**. The pattern-language migration has its own durable control document at **[docs/development/pattern-language-overhaul.md](docs/development/pattern-language-overhaul.md)**.

## Repository map

| Area | Purpose | Start here |
|---|---|---|
| **Project state** | Current maturity, risks and next gates | [STATUS.md](STATUS.md) |
| **Documentation model** | What each documentation area owns, canonicality and placement rules | [`docs/README.md`](docs/README.md) |
| **Source** | Preserved original doctrine; provenance rather than current publication | [House Design Doctrine v7](docs/source/house-design-doctrine-v7.md) |
| **Manuscript** | Public architectural argument, governing principles and book structure | [Publication architecture](docs/manuscript/publication-architecture.md) · [Governing principles](docs/manuscript/governing-principles.md) · [Preface](docs/manuscript/preface.md) |
| **Editorial** | Canonical prose modes, stylistic controls and rewrite protocol | [Editorial doctrine](docs/editorial/editorial-doctrine.md) |
| **Patterns** | Reusable architectural responses; current language model, service-topology pilot and existing developed catalogue | [Pattern-language model](docs/patterns/language-model.md) · [Service-topology pilot](docs/patterns/pilot/README.md) · [Core patterns](docs/patterns/core-12.md) |
| **Reference house** | Worked architectural/technical interpretation and coordination studies | [Reference House](docs/reference-house/README.md) · [Service-topology coordination](docs/reference-house/service-topology-coordination.md) |
| **Research** | Evidence synthesis, precedent, options appraisal and claim hardening | [`docs/research/`](docs/research/) |
| **Development** | Internal integration, migration controls, manufacturing strategy and prototype/test programme control | [`docs/development/README.md`](docs/development/README.md) · [Pattern-language overhaul](docs/development/pattern-language-overhaul.md) · [Prototype programme](docs/development/tectonic-prototype-programme.md) |
| **Prototypes** | Build packs, drawings, test details and later test records/results | [`docs/prototypes/README.md`](docs/prototypes/README.md) · [W2 wall-bay build pack](docs/prototypes/w2-wall-bay-build-pack.md) |
| **Delivery** | Translation into requirements for an appointed design team | [RIBA implementation brief template](docs/delivery/riba-implementation-brief-template.md) |
| **Computational** | Executable-architecture research, evidence model, paper compilation and compiler gates | [Computational track index](docs/computational/README.md) |

## Repository rules

- **The governing principles are the primary public doctrine.** [`docs/source/house-design-doctrine-v7.md`](docs/source/house-design-doctrine-v7.md) is preserved source material and should not be rewritten in place.
- **Pattern identity does not imply truth.** Patterns carry evidence and maturity separately; experimental responses remain experimental until calculation, representative workmanship and physical or professional evidence justify promotion.
- **The language is not the compiler.** Pattern relationships and generative sequences guide architectural design; only scoped formal consequences should become semantic rules, obligations or queries.
- **The reference house is a coordination and test vehicle.** Project-specific choices and pattern occurrences must remain distinguishable from general doctrine.
- **Architectural quality remains a hard constraint.** Maintainability, reversibility and technical legibility do not justify a house that is spatially poor, visually unsettled, acoustically hollow or disproportionately complex.
- **The computational track remains subordinate to the architecture.** Its current purpose is to falsify or strengthen a bounded formal model, not to turn the project into a software pitch.
- **Repository structure and publication navigation are separate concerns.** The repository remains the source of truth even where the documentation site presents a different reading order.
- **`STATUS.md` owns current project state.** Track-specific documents own detailed TODOs; this README should remain a durable explanation of what the project is, how the work fits together and where to go next.
