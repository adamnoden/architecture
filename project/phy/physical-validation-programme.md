# PHY — Physical validation

**State:** active evidence workstream; execution remains evidence-dependent  
**Maturity:** M2 at current project scope  
**Execution register:** `docs/development/validation-execution-register.md`

## Purpose

Own the project's physical evidence programme: representative or full-scale tests that can confirm, qualify or reject physical architectural and tectonic propositions.

PHY does not convert a prepared prototype into evidence merely because drawings, build packs or protocols exist. It does not replace competent engineering or specialist review where those are prerequisites to a meaningful physical test.

| Canonical code | Work | Current state | Historical alias |
|---|---|---|---|
| `PHY-01` | W2 wall bay | held / optional research | `P01` |
| `PHY-02` | Selective floor access | held | `P02` |
| `PHY-03` | Structural floor-edge validation | priority; engineering first | `P03` |
| `PHY-04` | Wall/ceiling movement junction | priority; build/test | `P04` |

Historical derived identifiers such as `P03-A`, `P03-B`, `P04-BUILD`, `P04-TEST` and existing `p03-*` / `p04-*` filenames remain valid evidence identities. New live control should use `PHY-*` and may include the historical alias where it materially aids recovery.

## Current priority

1. `PHY-03` — competent structural engineering must first reduce the floor-edge options to calculable/testable geometry. No structural specimen should be treated as evidence before that release.
2. `PHY-04` — build and test the wall/ceiling movement junction against the existing protocol.
3. `PHY-01` — optional challenger only when resources or a real high-change lining problem justify it.
4. `PHY-02` — reopen only when a real maintainable under-floor service condition earns it.

## Boundaries

- EPR owns competent external professional review; PHY may depend on EPR or specialist engineering where the test question requires it.
- Reference House gates own architectural rewinds caused by PHY findings.
- A successful Reference House specimen does not automatically validate a general House Kernel proposition.
- Negative evidence is a valid result when it cleanly rejects or narrows a proposition.

The historical `docs/development/tectonic-prototype-programme.md` remains substantive programme/evidence history. This file supplies the current three-letter workstream identity and packet namespace without rewriting that history.