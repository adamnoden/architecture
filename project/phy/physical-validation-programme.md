# PHY — Physical validation

**State:** active evidence workstream; execution remains evidence-dependent  
**Maturity:** M2 at current project scope  
**Execution register:** `docs/development/validation-execution-register.md`  
**Current upstream design/convergence map:** [`../book-resolution-programme.md`](../book-resolution-programme.md)

## Purpose

Own the project's physical evidence programme: representative or full-scale tests that can confirm, qualify or reject physical architectural and tectonic propositions.

PHY does not convert a prepared prototype into evidence merely because drawings, build packs or protocols exist. It does not replace competent engineering or specialist review where those are prerequisites to a meaningful physical test.

| Canonical code | Work | Current state | Historical alias |
|---|---|---|---|
| `PHY-01` | W2 wall bay | held / optional research | `P01` |
| `PHY-02` | Selective floor access | held | `P02` |
| `PHY-03` | Floor-edge research and provisional engineering | self-service internal study; structural/specimen acceptance remains separate | `P03` |
| `PHY-04` | Wall/ceiling movement junction | priority; build/test | `P04` |

Historical derived identifiers such as `P03-A`, `P03-B`, `P04-BUILD`, `P04-TEST` and existing `p03-*` / `p04-*` filenames remain valid evidence identities. New live control should use `PHY-*` and may include the historical alias where it materially aids recovery.

## Current-house applicability

The [current-house applicability result](current-house-prototype-applicability.md) reconciles retained P03/P04 records with the current geometry and bounded dry selection after early physical feasibility. Use its release conditions before current-house issue/build; historical READY labels do not release a new specimen. No physical result, new prototype activation or maturity change follows.

## Current priority

1. `PHY-03-ENGINEERING` — internally reduce the floor-edge options through research and preliminary calculations under the contract below. Complete that development work without waiting for external review; competent structural/specimen acceptance remains required before a loaded test or reliance as verified structure.
2. `PHY-04` — build and test the wall/ceiling movement junction against the existing protocol.
3. `PHY-01` — optional challenger only when resources or a real high-change lining problem justify it.
4. `PHY-02` — reopen only when a real maintainable under-floor service condition earns it.

## Book / house-resolution interface

### PHY-03-ENGINEERING — internal development contract

Under the [owner's development policy](../owner-house-charter.md#development-and-assurance--31-october-2026), produce `project/phy/floor-edge-internal-study.md` after PHY-APPLICABILITY. Use current STR/material direction and source identities first: the legacy timber/hanger study is historical comparison, not a compulsory current baseline. Evaluate available floor/support families without waiting for final whole-house adoption; label trial geometry and assumptions and do not adopt them through this packet.

The study must separate gravity bearing, restraint, diaphragm action, movement, boundary closure and repair. Compare a credible conventional solution with the proposed alternatives; provide reproducible preliminary calculations with stated actions, dimensions, units, material/property sources, applicability and sensitivity. Cover ordinary edges, entrance/stair interruptions and service/wet penetrations where relevant. Use primary technical evidence, expose missing product/substrate/site information, and test the strongest failure case and conventional fallback. Do not invent loads or capacities as verified inputs.

Exit: a reasoned provisional recommendation or rejection; internally challenged calculations and dispositions; a proposed representative specimen with a precise account of what it could and could not prove, or an evidenced explanation that no specimen is warranted; and remaining evidence tied to decisions and resolution points. Completion means the internal investigation is complete, not that a connection is accepted. Actual structural acceptance and safe specimen release remain under **ER-STR-01 / EPR-RH11** and the [PHY release conditions](current-house-prototype-applicability.md#p03-engineering-release-before-any-structural-claim). The release must identify competent responsibility, the accepted detail and loads, safe method and acceptance limits before any loaded test. No generic disclaimer or second agent can supply that external evidence.

### Design and evidence ownership

`IAS` and `OAS` will develop selected interior/opening assembly families. Their existence does **not** automatically reactivate held tests or create a new prototype family. `BCR` owns the construction-resolution inventory and may route a new physical question here only when a selected design makes that question concrete and consequential.

Existing `PHY-03` / `PHY-04` remain current priorities at their stated source applicability. If selected IAS/OAS/HAD geometry supersedes a prepared specimen, check applicability before build/test rather than treating old geometry as evidence for the new detail.

Material PHY findings flow back through BCR to the owning IAS/OAS/HAD/Reference House decision and later HRS synthesis. PHY supplies evidence; it does not become the architectural designer.

## Boundaries

- EPR owns competent external professional review; PHY may depend on EPR or specialist engineering where the test question requires it.
- Reference House and new design-stream owners retain architectural rewinds caused by PHY findings.
- BCR owns construction-resolution classification and targeted evidence routing; it does not replace PHY.
- A successful Reference House specimen does not automatically validate a general House Kernel proposition.
- Negative evidence is a valid result when it cleanly rejects or narrows a proposition.

The historical `docs/development/tectonic-prototype-programme.md` remains substantive programme/evidence history. This file supplies the current three-letter workstream identity and packet namespace without rewriting that history.
