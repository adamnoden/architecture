# Workstream code register

**State:** canonical naming/alias register for live programme control pending PCO migration  
**Date:** 2026-10-28

Use exactly three uppercase letters for new first-class workstream codes. Historical packet identifiers, filenames and evidence records are not rewritten merely to improve naming consistency; retain them as aliases when provenance depends on them. Deliberate historical exceptions such as `RH` remain grandfathered rather than being renamed cosmetically.

| Code | Workstream | Canonical packet family | Historical / compatibility identifiers |
|---|---|---|---|
| `PUB` | Publication credibility and release | `PUB-00` … `PUB-06` | `PR-00` … `PR-06` are historical aliases; `PUB-SAN` and `PUB-NOM` remain completed auxiliary packets |
| `PHY` | Physical validation | `PHY-01` … `PHY-04` | `P01` … `P04` and derived identifiers remain historical aliases/evidence identities |
| `EPR` | External professional review | workstream umbrella | `RH-11` remains the Reference House gate executed through EPR; existing `ER-*` identifiers remain review-item identities |
| `BSR` | Book Structure Refactor | `BSR-00` … `BSR-03` | new 2026-10-28; no historical alias |
| `PCO` | Project Control & Orchestration | `PCO-00` … `PCO-08` | bootstrap workstream under #953; no historical alias |
| `IAS` | Interior Architecture System | `IAS-00` … `IAS-06` | new 2026-10-28; no historical alias |
| `OAS` | Opening Assembly System | `OAS-00` … `OAS-06` | new 2026-10-28; no historical alias |
| `HAD` | House Architectural Design | `HAD-00` … `HAD-06` | new 2026-10-28; no historical alias |
| `BCR` | Buildability & Construction Resolution | `BCR-00` … `BCR-05` | new 2026-10-28; no historical alias |
| `HRS` | House Resolution & Synthesis | `HRS-00` … `HRS-05` | new 2026-10-28; no historical alias |

The six book/house-resolution streams are coordinated by [`book-resolution-programme.md`](book-resolution-programme.md). `BSR` is the root structural refactor; `IAS`, `OAS` and `HAD` are parallel design streams; `BCR` is the construction-resolution convergence gate; `HRS` is the final architectural synthesis before definitive PLT/EDA/PUB work.

`PCO` is the priority project-control infrastructure workstream defined by [`pco/project-control-orchestration-programme.md`](pco/project-control-orchestration-programme.md) and [#953](https://github.com/adamnoden/architecture/issues/953). It is intended to replace this manual live register with a typed workstream registry and generated projection. Until that migration lands, this file remains the bootstrap naming authority.

Existing three-letter workstreams such as `PLT`, `DEL`, `DPL`, `ADE`, `EDA`, `TYP`, `ILA`, `HFI`, `OCG` and `DRW` retain their current identities. `RH` remains a deliberate two-letter Reference House gate family rather than being renamed cosmetically.

## Migration rule

For new/live control surfaces, use the canonical code. When referring to historical evidence whose recorded identity used an earlier code, preserve that identity and, where useful, state the canonical alias once.

Do not bulk-rewrite old commits, frozen proof names, release identities or evidence filenames. The goal is a clean live namespace without damaging provenance.

PCO closeout must migrate every live first-class three-letter workstream into the typed registry, turn this file into a generated view, and remove the bootstrap exception for PCO itself.