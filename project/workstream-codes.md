# Workstream code register

**State:** canonical naming/alias register for live programme control  
**Date:** 2026-10-27

Use three-letter workstream codes for current programme control where a first-class workstream exists. Historical packet identifiers, filenames and evidence records are not rewritten merely to improve naming consistency; retain them as aliases when provenance depends on them.

| Code | Workstream | Canonical packet family | Historical / compatibility identifiers |
|---|---|---|---|
| `PUB` | Publication credibility and release | `PUB-00` … `PUB-06` | `PR-00` … `PR-06` are historical aliases; `PUB-SAN` and `PUB-NOM` remain completed auxiliary packets |
| `PHY` | Physical validation | `PHY-01` … `PHY-04` | `P01` … `P04` and derived identifiers remain historical aliases/evidence identities |
| `EPR` | External professional review | workstream umbrella | `RH-11` remains the Reference House gate executed through EPR; existing `ER-*` identifiers remain review-item identities |

Existing three-letter workstreams such as `PLT`, `DEL`, `DPL`, `ADE`, `EDA`, `TYP`, `ILA`, `HFI`, `OCG` and `DRW` retain their current identities. `RH` remains a deliberate two-letter Reference House gate family rather than being renamed cosmetically.

## Migration rule

For new/live control surfaces, use the canonical code. When referring to historical evidence whose recorded identity used an earlier code, preserve that identity and, where useful, state the canonical alias once.

Do not bulk-rewrite old commits, frozen proof names, release identities or evidence filenames. The goal is a clean live namespace without damaging provenance.