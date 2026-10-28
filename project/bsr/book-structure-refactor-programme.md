# BSR — Book Structure Refactor

**State:** complete pending integration of this branch  
**Tracking:** [#940 — BSR book structure refactor](https://github.com/adamnoden/architecture/issues/940)  
**Programme map:** [`../book-resolution-programme.md`](../book-resolution-programme.md)

## Question and scope

How should the existing manuscript be refactored so the next systems/design work has one clean reader sequence and one unambiguous owner for each new chapter?

BSR owns manuscript topology only: part/chapter boundaries, stubs, moves, renumbering, navigation, crosswalks and downstream ownership. It preserves settled doctrine and evidence boundaries rather than rewriting content merely to fit a new table of contents.

## Canonical result

1. Part I — The Proposition
2. Part II — Architecture of the Platform
3. Part III — Patterns and Generative Sequences
4. Part IV — The Reference House: Design Proposition
5. Part V — Making and Proving the Platform
6. Part VI — The House

The reader-facing authority for this structure is `docs/manuscript/publication-architecture.md`; the mechanical Working Edition order is `publication/publication.ts`.

## Packet closeout

- **BSR-00 — structural inventory: complete.** The old five-part topology, publication manifest/adapters, navigation and duplicate Reference House scenario ownership were mapped before mutation.
- **BSR-01 — six-part migration: complete.** Parts III–V use the accepted titles; the Reference House future-intervention chapter has moved from the design-proposition part into the proving part; settled architectural prose was otherwise preserved.
- **BSR-02 — new chapter stubs: complete.** Part IV now contains explicit interfaces for **The Interior Architecture System** and **Openings as Replaceable Assemblies**; Part V contains **Technical Closure and Construction Readiness**; Part VI — **The House** is established as a deliberately restrained final architectural section.
- **BSR-03 — reconciliation: complete subject to repository CI on integration.** Manuscript overview, both reader guides, publication architecture, Working Edition manifest, Primer wording and VitePress navigation now express one six-part sequence and one authority boundary.

## Ownership handoff

BSR has intentionally left substantive design unresolved.

- `IAS` #941 now owns the interior-system chapter interface in Part IV.
- `OAS` #942 now owns the opening-assembly chapter interface in Part IV.
- `HAD` #943 may author the visible architectural design across Part IV and the future resolved-house source without using BSR as a design owner.
- `BCR` #944 owns the Part V technical/construction-resolution convergence and evidence routing once the selected systems exist.
- `HRS` #945 owns final post-BCR architectural synthesis and the admission of resolved material to Part VI.
- `PLT`, `PHY`, `EPR`, `DEL`, `EDA` and `PUB` retain their existing authorities.

IAS/OAS/HAD are therefore unblocked by book topology once this closeout is integrated. They work in parallel against the same controlled Reference House/PLT source and must raise explicit rewind requests rather than fork geometry silently.

## Proof boundary

This refactor creates places for later work; it does not perform that work.

The new chapter interfaces are deliberately explicit about incompleteness. Part VI is a structural conclusion, not a claim that the house is resolved. The move of the Reference House scenario ordeal into Part V changes ownership and reading sequence, not the evidential status of those scenarios.

No architectural, technical, physical, professional, regulatory, site or publication maturity is raised by BSR.

## Exit gate

**Satisfied at BSR scope, subject only to integration CI.** The canonical repository now expresses the accepted six-part sequence; new chapter interfaces have explicit downstream owners and proof boundaries; Reference House future-intervention scenarios have one home in Part V; affected navigation/build/reader references are reconciled; and IAS/OAS/HAD can proceed without inventing book structure.
