# BSR — Book Structure Refactor

**State:** active root workstream  
**Tracking:** [#940 — BSR book structure refactor](https://github.com/adamnoden/architecture/issues/940)  
**Programme map:** [`../book-resolution-programme.md`](../book-resolution-programme.md)

## Question and scope

How should the existing manuscript be refactored so the next systems/design work has one clean reader sequence and one unambiguous owner for each new chapter?

BSR owns manuscript topology only: part/chapter boundaries, stubs, moves, renumbering, navigation, crosswalks and downstream ownership. It must preserve settled doctrine and evidence boundaries rather than rewrite content merely to fit a new table of contents.

## Accepted target

1. Part I — The Proposition
2. Part II — Architecture of the Platform
3. Part III — Patterns and Generative Sequences
4. Part IV — The Reference House: Design Proposition
5. Part V — Making and Proving the Platform
6. Part VI — The House

## Work packets

- **BSR-00 — structural inventory:** map current chapters, duplicate scenario material, publication adapters/navigation and authority-sensitive references.
- **BSR-01 — six-part migration:** create the new part/chapter topology, rename Part III and move existing material without substantive design invention.
- **BSR-02 — new chapter stubs:** establish owned stubs for the Interior Architecture System, Openings as Replaceable Assemblies, Technical Closure and Construction Readiness, and Part VI.
- **BSR-03 — reconciliation:** update navigation/crosswalks/build inputs and verify that each moved/new section has one authority owner.

## Boundaries

- No design exploration belongs here.
- IAS #941, OAS #942 and HAD #943 begin substantive work only after BSR has made their manuscript interfaces stable enough to avoid topology churn.
- Existing PLT work may continue against the controlled Reference House, but final composition/freeze is downstream of HRS.
- Completed EDA evidence remains historical evidence; it is not the final editorial gate for the enlarged manuscript.

## Exit gate

BSR closes when the canonical repository expresses the accepted six-part sequence, new chapters are stubbed with explicit owners and proof boundaries, duplicated scenario material has one home, affected navigation/build/crosswalk references are coherent, and downstream work can proceed without inventing book structure.

BSR closure changes structure only. It raises no architectural, technical or publication maturity.