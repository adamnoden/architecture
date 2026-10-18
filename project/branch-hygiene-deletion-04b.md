# BRH-04B — controlled deletion batch 2 preflight

BRH-04B continues the **A-first** deletion phase under issue #161. This preflight freezes the next natural bounded tranche of **25 historical class-A refs** after the completed BRH-04A batch.

## Execution baseline

- `main`: `be56783daa3b294721e5da4c0e1788b9563fbeb2`
- current namespace: **139 refs including `main` / 138 non-main**
- open PRs: **1** — #213, `drw-04d-plan-pair-proof` @ `9301935644f925473fd136941c5cee64bbf099fb`
- source classification: BRH-01A at `b8e842cee5beef6981f1e075cd06a1c080fbfe3a`
- source baseline → current `main`: **ahead 170 / behind 0**
- deletion cap: **25**
- candidate-set SHA-256: `84ddf9e8a8f2038ac208c78e0bfeb0790213616beb577ee066fe19cc78b88015`

Every candidate below was class **A — fully integrated** in BRH-01A (`ancestor=yes`, `branch-only=0`), still exists at exactly the same head, and is not an open-PR branch.

| Branch | Exact deletion head | Class |
| --- | --- | --- |
| `compiler-p0-kernel` | `deb524ba727b90992a75450d8c35acbe27746bed` | A |
| `compiler-p0-pat-xw-checkpoint` | `d7d42e8ae03ddec156c0e22773365de28f61179a` | A |
| `compiler-pat-xw-01` | `4643bd1edeb7edc0ff67cc5955349024f7563c9f` | A |
| `drw-01c` | `a1da0f3aaa287b4a93bdb79b183463d95ce0d7c7` | A |
| `drw-01d` | `ba82786f3caef9f543d4a8810e25ef51489118f7` | A |
| `drw-01e` | `5e6cbbd8c1d391127dc231aaeb584b008617ade1` | A |
| `drw-02a` | `b77aac7bb33ddec4ac6185ef6b42cf4841343f13` | A |
| `drw-02b` | `28bd93b54152161411436da4ece6309774a3dc57` | A |
| `drw-02c` | `509be1384cce76d8ee19b584344d4490f9b2d08e` | A |
| `drw-02d` | `b1067ec01574ab6ec1f639d8556e07581506bb07` | A |
| `editorial-overhaul` | `b238c4dbb98bc24e44808ca385326cff36a14116` | A |
| `fix-publication-credibility-navigation` | `22ac81cabdfe37b367f1a3297f292a8750ae978c` | A |
| `fix-sanitation-record-surface` | `ba0270e133ea8ddf876d0000180654c6a5726181` | A |
| `ovids-house-migration` | `e6a8a9a75ad0a97bd28232c8f7539e6987bb541d` | A |
| `pattern-language-phase7-close` | `bac80230ffbca080fb4c262eb41fb08ebd3574a4` | A |
| `pattern-language-phase7-integration` | `e2971075966bb5df9e9cbbfa875de34155d82503` | A |
| `pattern-language-phase7-new-identities` | `c50f30b3a96a73326f8bed8489c3ad63ce7d6e3d` | A |
| `pattern-language-phase7-nonpattern-homes` | `0f421c2d5f6c9c71f0b5f9940a6beef6be5f8a64` | A |
| `pattern-language-phase7-validation` | `ea9211d407f3da8b30085050157680c535e57d00` | A |
| `pr00-candidate-book-freeze-programme` | `315304bf41313f47c1ccf361d058397b4302c872` | A |
| `pr00a-candidate-book-ledger` | `882e640cf646da2d0b42a604ae927ef08625b0db` | A |
| `pr00b-back-matter` | `ecd55f8f31db0fd623dbc948c02f5651678aae66` | A |
| `pr00b-part-iii-framing` | `ea1d2ab1a6c0aa93060c49bab34472047c058ffc` | A |
| `pr00b-part-iv-authorship` | `b1dcb3e1f8ff405bffe8e69da21b724da22c9174` | A |
| `pr00b-part-v-recheck` | `4c637309c1c1aa75ece6c152d754718d57e4a7de` | A |

## Protected namespace

The active DRW branch `drw-04d-plan-pair-proof` is protected by open PR #213. `drw-04b1-south-landing-label-fit` is also kept outside this historical tranche. BRH authority/reconciliation refs are not opportunistically deleted here.

The packet remains **A-only**. In particular, nearby B/C refs such as `brh-01b-patch-equivalent`, `pattern-language-phase7-migration` and `pr00b-part-iv-synthesis` are outside scope.

## Destructive gate

The connected GitHub capability still has no first-class branch/ref deletion action, so the agent cannot execute the destructive mutation directly.

Immediately before manual deletion:

1. `main` must still be exactly `be56783daa3b294721e5da4c0e1788b9563fbeb2`;
2. all 25 refs must still exist at the exact heads above;
3. no candidate may have an open PR;
4. if any lease fails, stop and recompute rather than deleting a subset from stale evidence.

After deletion, the complete namespace must be re-enumerated and reconciled against any independently observed concurrent DRW/HFI ref turnover. BRH-04B is not complete until that post-delete proof is committed, validated and merged.
