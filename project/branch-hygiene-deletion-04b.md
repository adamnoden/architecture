# BRH-04B — controlled deletion batch 2

BRH-04B continues the **A-first** deletion phase under issue #161. It deleted a second bounded tranche of **25 historical class-A refs** after re-proving every exact head against the frozen BRH-01A mechanical classification.

## Result

**BRH-04B is complete: 25 / 25 authorised class-A refs were deleted.**

Deletion was performed manually by the repository owner through GitHub because the connected GitHub capability exposed no first-class branch/ref deletion action. No B, C, D or X branch was deleted.

## Execution and destructive lease

- execution `main`: `be56783daa3b294721e5da4c0e1788b9563fbeb2`
- source classification: BRH-01A at `b8e842cee5beef6981f1e075cd06a1c080fbfe3a`
- source baseline → execution `main`: **ahead 170 / behind 0**
- namespace at packet start: **139 refs including `main`**
- namespace immediately before manual deletion, after creating the BRH-04B checkpoint branch: **140 refs including `main`**
- open PRs immediately before deletion: #213 (`drw-04d-plan-pair-proof`) and #217 (`brh-04b-controlled-deletion-2`)
- deletion cap: **25**
- candidate-set SHA-256: `84ddf9e8a8f2038ac208c78e0bfeb0790213616beb577ee066fe19cc78b88015`

Every candidate below was class **A — fully integrated** in BRH-01A (`ancestor=yes`, `branch-only=0`), still existed at exactly the same head immediately before deletion, and was not an open-PR branch.

| Branch | Frozen deletion head |
| --- | --- |
| `compiler-p0-kernel` | `deb524ba727b90992a75450d8c35acbe27746bed` |
| `compiler-p0-pat-xw-checkpoint` | `d7d42e8ae03ddec156c0e22773365de28f61179a` |
| `compiler-pat-xw-01` | `4643bd1edeb7edc0ff67cc5955349024f7563c9f` |
| `drw-01c` | `a1da0f3aaa287b4a93bdb79b183463d95ce0d7c7` |
| `drw-01d` | `ba82786f3caef9f543d4a8810e25ef51489118f7` |
| `drw-01e` | `5e6cbbd8c1d391127dc231aaeb584b008617ade1` |
| `drw-02a` | `b77aac7bb33ddec4ac6185ef6b42cf4841343f13` |
| `drw-02b` | `28bd93b54152161411436da4ece6309774a3dc57` |
| `drw-02c` | `509be1384cce76d8ee19b584344d4490f9b2d08e` |
| `drw-02d` | `b1067ec01574ab6ec1f639d8556e07581506bb07` |
| `editorial-overhaul` | `b238c4dbb98bc24e44808ca385326cff36a14116` |
| `fix-publication-credibility-navigation` | `22ac81cabdfe37b367f1a3297f292a8750ae978c` |
| `fix-sanitation-record-surface` | `ba0270e133ea8ddf876d0000180654c6a5726181` |
| `ovids-house-migration` | `e6a8a9a75ad0a97bd28232c8f7539e6987bb541d` |
| `pattern-language-phase7-close` | `bac80230ffbca080fb4c262eb41fb08ebd3574a4` |
| `pattern-language-phase7-integration` | `e2971075966bb5df9e9cbbfa875de34155d82503` |
| `pattern-language-phase7-new-identities` | `c50f30b3a96a73326f8bed8489c3ad63ce7d6e3d` |
| `pattern-language-phase7-nonpattern-homes` | `0f421c2d5f6c9c71f0b5f9940a6beef6be5f8a64` |
| `pattern-language-phase7-validation` | `ea9211d407f3da8b30085050157680c535e57d00` |
| `pr00-candidate-book-freeze-programme` | `315304bf41313f47c1ccf361d058397b4302c872` |
| `pr00a-candidate-book-ledger` | `882e640cf646da2d0b42a604ae927ef08625b0db` |
| `pr00b-back-matter` | `ecd55f8f31db0fd623dbc948c02f5651678aae66` |
| `pr00b-part-iii-framing` | `ea1d2ab1a6c0aa93060c49bab34472047c058ffc` |
| `pr00b-part-iv-authorship` | `b1dcb3e1f8ff405bffe8e69da21b724da22c9174` |
| `pr00b-part-v-recheck` | `4c637309c1c1aa75ece6c152d754718d57e4a7de` |

## Post-delete proof

A fresh complete enumeration contains **116 refs including `main`** and none of the 25 authorised candidate names.

The count reconciles exactly with concurrent work:

`140 refs immediately before deletion - 25 BRH-04B deletions + 1 independently created HFI ref = 116 current refs`.

The independently created ref was `hfi-02a-anthropometry-reach-force`, now represented by open PR #218. It was outside BRH-04B and survived. Open PR #213's `drw-04d-plan-pair-proof` and this packet's `brh-04b-controlled-deletion-2` also survived.

Useful non-target sentinels also remain, including `drw-02e`, `drw-03a`, `drw-04b1-south-landing-label-fit`, `pattern-language-phase7-migration`, `pr00b-part-iv-synthesis`, `brh-02g-publication-editorial-review`, and `brh-03-salvage-necessity-proof`. This rules out an accidental family/prefix sweep.

`main` remained `be56783daa3b294721e5da4c0e1788b9563fbeb2` through the destructive and post-delete proof window.

## Safety boundary

- deleted: **25 A / 0 B / 0 C / 0 D / 0 X**;
- `main` was not deleted or rewritten;
- no open-PR head was deleted;
- no repository setting changed;
- no historical branch content was merged or cherry-picked;
- the stale/superseded BRH reconciliation refs remain protected for later explicit re-proof.

## Next packet

**BRH-04C — recover the then-current namespace and continue the A-first deletion phase with a fresh bounded batch.** Do not reuse BRH-04B leases.
