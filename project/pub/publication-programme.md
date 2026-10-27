# PUB — Publication credibility and release programme

**State:** active publication programme  
**Canonical issue:** #71  
**Detailed programme source:** `docs/manuscript/publication-credibility-release-programme.md`

This file establishes the live publication namespace. The substantive release sequence is unchanged; only the programme identity is normalised so publication stages cannot be confused with GitHub pull requests.

| Canonical code | Stage | State | Historical alias |
|---|---|---|---|
| `PUB-00` | Candidate-book freeze | complete | `PR-00` |
| `PUB-01` | Internal adversarial review | complete | `PR-01` |
| `PUB-02` | Private 12-copy object edition | **active / authorised** | `PR-02` |
| `PUB-03` | External critical circle | queued after `PUB-02` | `PR-03` |
| `PUB-04` | Criticism register + bounded upstream rewinds | queued after `PUB-03` | `PR-04` |
| `PUB-05` | Epistemic pull / pre-publisher credibility | future | `PR-05` |
| `PUB-06` | Public-edition / publisher-route decision | future | `PR-06` |

`PUB-SAN` and `PUB-NOM` remain completed auxiliary publication packets and are not renumbered into the main release sequence.

## Current gate

`PUB-02` may proceed with trim, paper, cloth, binding, book-block and printer/binder preparation using the accepted typography contract. Final 12-copy content/drawing freeze and manufacture remain gated by the independent PLT drawing freeze.

`PUB-03` and `PUB-04` remain required before any M5 or public-release claim.

## Provenance rule

Historical evidence is not renamed. Existing filenames and frozen records such as `publication/pr01-*` remain valid historical identities. Live programme control should use `PUB-*`; use the legacy alias only when locating or discussing a historical record that actually bears it.

The detailed programme document remains authoritative for the substance of each gate. Where it still uses `PR-*`, read those labels through the mapping above; future substantive edits to that document should use canonical `PUB-*` vocabulary.