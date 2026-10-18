# BRH-04E — controlled deletion batch 5 preflight

BRH-04E closes the remaining straightforward A-class tail and the two BRH refs deliberately retained for deletion-phase re-proof. It does **not** begin the general B/C deletion tranches.

## Final recomputed baseline

Several concurrent movements occurred before destructive authorisation; every stale lease was discarded and **no deletion occurred**. The current state is:

- execution `main`: `be0b328661e5fde92681c79082a8efec6775cd8a`
- prior baselines: `439eb718…` → `9379034a…` → `d7a6e556…`
- `d7a6e556…` → `be0b3286…`: **ahead 2 / behind 0 / zero net changed files**; an accidental noop file was added then removed
- namespace at recomputed checkpoint: **64 refs including `main` and this packet branch**
- fresh `drw-05c-principal-section-renderer` exists separately and is protected as active X
- open PRs: **only #229** (`brh-04e-controlled-deletion-5`)
- BRH-01A baseline `b8e842cee5beef6981f1e075cd06a1c080fbfe3a` → execution `main`: **ahead 227 / behind 0**
- candidate count: **16** under the 25-ref cap
- class mix: **15 A / 1 C / 0 B / 0 D / 0 X**
- candidate-set SHA-256: `2807c62f90e4bfb15cb422e0ae9403ce0669da2a363ad45ee370ee53ec8e9539`

## Special re-proof

`brh-02g-publication-editorial-review` is now **A — fully integrated**: its unchanged head is an exact ancestor of `main`.

`brh-03-salvage-necessity-proof` is **C — superseded evidence draft**. Its two branch-only commits add only stale `project/branch-hygiene-salvage-closeout.{json,md}` files. The later merged BRH-03A authority (`project/branch-hygiene-salvage-proof.{json,md,provenance.json}`) restarts from later `main`, reaches the same **D=0 / empty salvage / vacuous-complete** conclusion, and explicitly records the old branch and closed PR #201 as superseded. No unique architectural, computational or unresolved salvage work remains there.

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

## Exclusions and gate

Protected: `main`, this packet branch, `drw-05c-principal-section-renderer`, any new DRW/HFI ref, the five B refs (`ch00-compiler-hardening-plan`, `external-maintenance-geography`, `maturity-model-enforcement`, `pr00e-e2-e4-editorial-hardening`, `pub-san-back-matter`), and all other semantic-review C refs.

No branch has been deleted by this packet. Before owner-side deletion, BRH must take one final exact ref snapshot after these record writes and confirm `main`, open PRs and all 16 candidate heads remain unchanged. After manual deletion, BRH-04E must reconcile the complete namespace delta, validate, merge under a fresh lease, verify first-parent identity, and record closeout on #161.
