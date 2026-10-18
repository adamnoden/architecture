# BRH-04D — controlled deletion batch 4

BRH-04D completes the fourth bounded **A-first** deletion packet under issue #161.

## Authorised destructive lease

The final destructive lease was taken only after four earlier leases were discarded because concurrent HFI/DRW work moved `main`.

- final authorised `main`: `58fbf4fc96cbd6023d4ce4d1a0b95094e52a977e`
- source classification: BRH-01A at `b8e842cee5beef6981f1e075cd06a1c080fbfe3a`
- source baseline → authorised `main`: **ahead 200 / behind 0**
- pre-delete namespace: **89 refs including `main`**
- authorised deletion count: **25**
- candidate-set SHA-256: `549792fc53e179de3a3a24198c947fedaa56231495239847d88bb5b28c1aa2f5`
- every candidate was class **A — fully integrated**, was re-read at its exact frozen head immediately before authorisation, and had no open PR

## Deleted refs

The repository owner manually deleted exactly these 25 authorised refs:

| Branch | Frozen deletion head |
| --- | --- |
| `print-publication-pipeline` | `ecbaf05fbcf20bd863b6c38e58188ffbc6cdaf56` |
| `project-dataplate` | `7e207c178a807deed09356c7c780ded6b99dd275` |
| `prototype-w2-evidence-protocol` | `29c47b2ee3b836a6489c792e92269fcf19ab0b54` |
| `pub-figure-hardening` | `6e893eba90cb054f74ede59a264b5e45a0979801` |
| `pub-nom` | `e4d46792221bb1801d5f2ed0fa04ecf94a9cf5f0` |
| `pub-nom-actual` | `e031fbabcb17724fb5561839fb4ff0ec27bd9790` |
| `pub-nom-audit-temp` | `e031fbabcb17724fb5561839fb4ff0ec27bd9790` |
| `pub-nom-enough` | `e031fbabcb17724fb5561839fb4ff0ec27bd9790` |
| `pub-nom-finalwork` | `e031fbabcb17724fb5561839fb4ff0ec27bd9790` |
| `pub-nom-last` | `e031fbabcb17724fb5561839fb4ff0ec27bd9790` |
| `pub-nom-no` | `e031fbabcb17724fb5561839fb4ff0ec27bd9790` |
| `pub-nom-real` | `e031fbabcb17724fb5561839fb4ff0ec27bd9790` |
| `pub-nom-scan` | `e031fbabcb17724fb5561839fb4ff0ec27bd9790` |
| `pub-nom-stage` | `e031fbabcb17724fb5561839fb4ff0ec27bd9790` |
| `pub-nom-work` | `e031fbabcb17724fb5561839fb4ff0ec27bd9790` |
| `pub-nom-x` | `e031fbabcb17724fb5561839fb4ff0ec27bd9790` |
| `pub-nom-z` | `e031fbabcb17724fb5561839fb4ff0ec27bd9790` |
| `pub-nom-zz` | `e031fbabcb17724fb5561839fb4ff0ec27bd9790` |
| `pub-san-closeout` | `f7bc2ea2cc741d8d54e294de96f8de1412b54fb6` |
| `pub-san-first-reader` | `e035264695ea88c1100ef92e45f988dee225586f` |
| `pub-san-prototype-surface` | `74fcf25db99715819826513f231d49f0219fa5c5` |
| `pub-san-public-cleanup` | `ec95c9f67cd77214845f299eab7a780147e75afe` |
| `pub-san-publication-surfaces` | `bd3a87bc1b1fa6ca6ac063ca12389661b453a5a2` |
| `pub-san-reference-coordination` | `ac0d82b5b0eb51f563b721a97ad753c940856d86` |
| `pub-san-reference-review` | `817c6c5befb2878abe8be31045fd678e0e561d17` |

## Post-delete namespace proof

The first complete post-delete snapshot contained **64 refs including `main`**.

Comparing branch names against the frozen 89-ref pre-delete snapshot gives:

- missing refs: **25**
- authorised refs: **25**
- `missing == authorised`: **true**
- unexpected missing refs: **0**
- persistent added refs relative to the frozen pre-delete snapshot: **0**

The namespace therefore equals the frozen pre-delete namespace **minus exactly the authorised deletion set**.

All explicitly protected BRH/B/C/current-work refs remain present, including:

- `brh-01a-obvious-integrated`
- `brh-01b-patch-equivalent`
- `brh-02g-publication-editorial-review`
- `brh-03-salvage-necessity-proof`
- `brh-04d-controlled-deletion-4`
- `drw-05b-principal-section-source`
- `pub-san-back-matter`
- `pub-san-computational-surface`
- `pub-san-research-evidence`
- `pub-san-rh-technical`

No B, C, D or X ref was deleted and no repository setting was changed.

## Concurrent work during the manual window

The repository remained active while the owner performed the bounded deletion:

- HFI-02D PR #226 merged `58fbf4fc…` → `895d47d0ea356003eb5d37d4e1d2ce8a56df75a8`; the merge's first parent is the authorised BRH baseline, so this is independently attributable concurrent work rather than BRH mutation.
- `drw-05b-principal-section-source` remained present and advanced independently to `d34c19db5580fa0d8cea0ea82d0a2c2d37ec44aa`.
- no concurrent branch addition persisted in the complete post-delete branch snapshot.

These movements do not weaken the destructive proof because the exact pre/post namespace set difference remains the frozen 25-ref candidate set.

## Closeout gate

The destructive mutation is complete and lossless. BRH-04D closes only after this proof passes repository validation, PR #223 is merged under a fresh `main` + open-PR lease, the merge first parent is verified against that lease, and issue #161 receives the exact closeout evidence.
