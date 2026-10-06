# Long-Life House

An architectural design-research project about **selective permanence**: make the durable architecture genuinely durable by giving shorter-lived systems, foreseeable failure, maintenance and change deliberate places to occur.

> **Change should be given deliberate places to occur so that architecture can afford to remain permanent elsewhere.**
>
> **Build the permanent house. Assemble the changeable house inside it.**

The project is not a universal-flexibility system, a manifesto for exposed services, or a software project disguised as architecture. It asks how a domestic building can remain architecturally settled while being unusually maintainable, repairable and adaptable over a long life.

## Architectural position

The public doctrine is the [eleven governing principles](docs/manuscript/governing-principles.md). In compressed form:

- **Protect slow layers from fast ones.** Short-lived services, fittings and replaceable assemblies should not routinely consume long-lived fabric. Serviceability is pursued proportionately to the frequency, consequence and retrofit difficulty of the future event.
- **Design interfaces, not just components.** Support, restraint, movement, sealing, finish, tolerance, access and disassembly should be deliberately resolved rather than left to brittle continuity or site improvisation.
- **Design failure and maintenance spatially.** Foreseeable failures should be detectable, containable and repairable; maintenance needs approach routes, working space, isolation and withdrawal paths. This geography extends outside the envelope to façades, roofs, supporting ground, landscape, courtyards and site logistics.
- **Prefer ordinary parts in robust arrangements.** Use standard components, familiar fabrication and clear datums where possible; concentrate invention where architectural arrangement or an interface genuinely earns it. The design should tolerate ordinary competent workmanship without depending on continual designer supervision.
- **Let permanence remain architectural.** Adaptability belongs where change is useful; rooms, axes, stairs, structure and other defining relationships may deliberately endure. Maintainability must not make the house feel temporary, hollow or technical.
- **Design for repose.** Ordinary domestic space should minimise unnecessary vigilance through physical comfort, spatial comprehensibility, privacy and retreat, local control and perceptual settlement. Richness is compatible with repose; gratuitous instability is not.
- **Let passive architecture do the first work.** Form, envelope, orientation, shading, mass, openings, drainage and gravity should reduce dependence on active systems, while measured performance, health and resilience outrank ideological simplicity.
- **Make construction and stewardship legible.** Tectonic honesty permits concealment but not falsification. Future owners and trades should be able to understand, isolate, maintain and alter the building without rediscovering it destructively.

No longevity measure receives a free pass from life safety, legal compliance, structural integrity, health, building physics, whole-life cost, carbon or construction risk. Evidence, context-sensitive findings and architectural hypotheses are kept distinct.

## Project form

The project is deliberately split into different kinds of output rather than forcing everything into one document:

1. **Illustrated monograph** — the architectural argument and governing principles.
2. **Pattern catalogue** — reusable responses with forces, trade-offs, evidence, maturity and failure modes.
3. **Reference house** — one coordinated worked interpretation used to expose cross-system conflicts; never evidence for the doctrine itself.
4. **Prototype programme** — 1:1 and professional testing of the non-standard propositions before promotion.
5. **Implementation brief** — architect-facing translation into project requirements, evidence, responsibilities and RIBA-stage decisions.
6. **Computational track** — a parallel research programme asking which formal subset of the doctrine can become executable architecture: semantic building primitives, obligations, evidence and useful compile failures rather than arbitrary geometry checked only afterwards.

The working chain is:

**Doctrine → Strategy → Pattern → Reference implementation → Delivery requirement → Test**

## Current phase

**Convergence → validation.** The central architectural position is established; the project should no longer respond to every question by inventing another principle.

The highest-value work now is to:

- complete and coordinate the reference house;
- physically and professionally attack the non-standard assemblies and environmental/technical assumptions;
- finish the pattern catalogue and publication against those results;
- run competent external review of the computational model and build only the minimal executable kernel needed to falsify or strengthen it before considering heavy CAD/compiler implementation.

For the canonical maturity map, risks, stop rules and next gates, see **[STATUS.md](STATUS.md)**.

## Repository map

| Area | Purpose | Start here |
|---|---|---|
| **Project state** | Current maturity, risks and next gates | [STATUS.md](STATUS.md) |
| **Source** | Preserved original doctrine; provenance rather than current publication | [House Design Doctrine v7](docs/source/house-design-doctrine-v7.md) |
| **Manuscript** | Public architectural argument, governing principles and book structure | [Publication architecture](docs/manuscript/publication-architecture.md) · [Governing principles](docs/manuscript/governing-principles.md) · [Preface](docs/manuscript/preface.md) |
| **Editorial** | Canonical prose modes, stylistic controls and rewrite protocol | [Editorial doctrine](docs/editorial/editorial-doctrine.md) |
| **Patterns** | Reusable architectural responses and experimental candidates | [Core patterns](docs/patterns/core-12.md) · [`docs/patterns/`](docs/patterns/) |
| **Reference house** | Worked architectural/technical interpretation and coordination studies | [`docs/reference-house/`](docs/reference-house/) |
| **Research** | Evidence syntheses, precedent, options appraisals and claim hardening | [`docs/research/`](docs/research/) |
| **Development / prototypes** | Integration controls, manufacturing strategy, test programmes and build packs | [Prototype programme](docs/development/tectonic-prototype-programme.md) · [`docs/prototypes/`](docs/prototypes/) |
| **Delivery** | Translation into requirements for an appointed design team | [RIBA implementation brief template](docs/delivery/riba-implementation-brief-template.md) |
| **Computational** | Executable-architecture research, paper compilation, evidence model and compiler gates | [Computational track index](docs/computational/README.md) |

## Repository rules

- **`docs/source/house-design-doctrine-v7.md` is source material, not the live book.** Preserve it for traceability rather than rewriting it in place.
- **The governing principles are the primary public doctrine.** The older detailed register remains useful as traceability, not as the publication's front-end structure.
- **A pattern may fail without invalidating the principle it serves.** Experimental systems stay experimental until calculation, representative-installer work and physical testing justify promotion.
- **The reference house is a test vehicle and worked interpretation, not proof.** Project-specific choices must remain distinguishable from general doctrine.
- **Negative evidence is useful.** A prototype, engineer or external reviewer killing an attractive idea is successful research.
- **Architectural quality remains the constraint.** Maintainability, reversibility and technical legibility do not justify a house that is spatially poor, visually unsettled, acoustically hollow or disproportionately complex.
- **The computational track remains subordinate to the architecture.** Its internal paper-compilation phase is complete; post-freeze doctrine changes are audited explicitly, external review and a minimal executable vertical slice come next, and heavy implementation remains gated.
- **`STATUS.md` is the canonical answer to “where are we now?”** Track-specific documents own detailed TODOs; the root README should remain a durable map of what the project is and how the repo is organised.
