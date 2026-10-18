# BRH-04E — controlled deletion batch 5 preflight

BRH-04E closes the remaining straightforward A-class tail and the two BRH refs deliberately retained for deletion-phase re-proof. It does **not** begin the general B/C deletion tranches.

## Recomputed baseline

Two concurrent merges occurred before destructive authorisation and therefore invalidated earlier leases: first HFI-03A, then DRW-05B. No deletion occurred under either stale lease. The current frozen state is:

- execution `main`: `d7a6e556e59c27512d73fdd2c0028924c5aad5e7`
- previous intermediate `main`: `9379034a41b618191698e9842659c90ff69514b7`
- initial discovery `main`: `439eb71841dae16ad10cb675d5b94f0430a146ca`
- namespace at this refreshed checkpoint: **63 refs including `main` and this packet branch**
- open PRs at refresh: **1** — #229 `brh-04e-controlled-deletion-5`
- BRH-01A baseline `b8e842cee5beef6981f1e075cd06a1c080fbfe3a` → execution `main`: **ahead 225 / behind 0**
- deletion cap: **25**
- candidate count: **16**
- class mix: **15 A / 1 C / 0 B / 0 D / 0 X**
- candidate-set SHA-256: `2807c62f90e4bfb15cb422e0ae9403ce0669da2a363ad45ee370ee53ec8e9539`

DRW-05B PR #227 merged with `9379034a…` as its first parent and its source branch retired. It is not part of BRH-04E.

## Why one C appears in an A-tail packet

`brh-03-salvage-necessity-proof` was intentionally withheld from earlier deletion because it is not integrated history. It diverges from the BRH-02H baseline by two commits which add only the stale `project/branch-hygiene-salvage-closeout.{json,md}` proof draft.

The later merged BRH-03A authority, `project/branch-hygiene-salvage-proof.{json,md,provenance.json}`, restarts from later `main`, reaches the same **D=0 / salvage queue empty / vacuous-complete** conclusion, and explicitly identifies the old branch and closed PR #201 as superseded. The stale branch therefore contains no unique architectural, computational, or unresolved salvage work. Its correct deletion-phase classification is **C — superseded evidence draft**.

`brh-02g-publication-editorial-review`, also withheld for explicit re-proof, is simpler: its unchanged head is an exact ancestor of current `main`, so it is **A — fully integrated**.

## Authorised candidate set

| Branch | Class | Exact head |
| --- | --- | --- |
| `brh-01a-obvious-integrated` | A | `bbaf9b72df7758b4ff4d97d89ee6a798789b2c41` |
| `brh-01b-patch-equivalent` | A | `8ea68f5b5cfac84ea4aeb6b11ed24bd8fdca6660` |
| `brh-02g-publication-editorial-review` | A | `708ca16ac46ee40f0759a1825f557924cfd0694c` |
| `brh-03-salvage-necessity-proof` | C | `3043c99d360f17178332bf92a3294868abef506f` |
| `drw-02e` | A | `374c5db6e5b559e58cbc6a54106fc64786d3b9e6` |
| `drw-03a` | A | `bcc9b8a34469e1a9f2bebf65fdb0499f377248b8` |
| `pub-san-resolved-work-cleanup` | A | `cac29844392a07d735b244c25f6636cc62d68d77` |
| `pub-san-semantic-coherence` | A | `8e9b1dc14b7710e8b18f057d4cfb761fe830d9ec` |
| `pub-san-source-link-cleanup` | A | `aff9deae0b3e34b1c86d2e8f215e967d25f329f8` |
| `publication-pdf-metadata` | A | `7267aba14c78c6c8551fa7559f8c7bd3a68d54d3` |
| `record-post-freeze-figure-defect` | A | `6c1b081d5161ab7719dd7c5c0a1ff37c9a485f71` |
| `site-build-timestamp` | A | `378028f2ad8f8745b750b86f2076a962245360ab` |
| `status-hygiene-2026-10-17` | A | `8da95e7428e155945f83fc14c6b2514a02ae2fef` |
| `tectonic-honesty` | A | `28386a2debd5318a2680bcdae636120ceb7b48fb` |
| `vertical-bay-coordination` | A | `55f6a11f982d27c4b7c2c00c1b3cf2e5fed05eff` |
| `wall-bay-prototype-v1` | A | `b9d433220c507bc53433d7227aaeb5162a9ccd8c` |

## Explicit exclusions

The current packet branch and `main` are protected. Any new DRW/HFI ref created after this checkpoint is protected as active X until separately proven. The five BRH-01B patch-equivalent branches remain for the next ordered phase: `ch00-compiler-hardening-plan`, `external-maintenance-geography`, `maturity-model-enforcement`, `pr00e-e2-e4-editorial-hardening`, and `pub-san-back-matter`. The surviving semantic-review C branches also remain untouched except for the separately re-proven stale BRH-03 draft above.

## Destructive gate

No branch has been deleted by this packet. The connector does not expose a first-class branch-delete operation. Before owner-side deletion, BRH must re-read `main`, all open PR heads, and all 16 exact candidate heads after these refreshed record writes. Any movement invalidates the destructive lease until recomputed.

After manual deletion, BRH-04E must prove the complete namespace difference, account for unrelated concurrent DRW/HFI ref turnover, validate the durable proof, merge under a fresh `main` lease, verify merge-parent identity, and record closeout on issue #161.
