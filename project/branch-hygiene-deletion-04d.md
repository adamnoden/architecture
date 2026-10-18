# BRH-04D — controlled deletion batch 4 preflight

BRH-04D continues the **A-first** deletion phase under issue #161. It freezes the next bounded tranche of **25 historical class-A refs** after completed BRH-04A through BRH-04C.

## Execution baseline

- `main`: `2e9b4768c049cd3b5b8db15c34b73ba5bcab7321`
- namespace at packet start: **89 refs including `main`**
- open PRs at packet start: **1** — #213, `drw-04d-plan-pair-proof` @ `8074dbe26da62e2858031ba49eb074850184cc17`
- source classification: BRH-01A at `b8e842cee5beef6981f1e075cd06a1c080fbfe3a`
- source baseline → current `main`: **ahead 190 / behind 0**
- deletion cap: **25**
- candidate-set SHA-256: `549792fc53e179de3a3a24198c947fedaa56231495239847d88bb5b28c1aa2f5`

Every candidate below was class **A — fully integrated** in BRH-01A (`ancestor=yes`, `branch-only=0`), still exists at exactly the same head, and is not an open-PR branch.

| Branch | Exact deletion head |
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

## Protected namespace

The packet explicitly excludes active/current DRW work, BRH authority and stale-draft refs requiring separate re-proof, and all B/C branches. In particular, `pub-san-back-matter` is class B, while `pub-san-computational-surface`, `pub-san-research-evidence`, and `pub-san-rh-technical` are class C; none is authorised for this A-only deletion packet.

## Destructive gate

The connected GitHub capability still has no first-class branch/ref deletion action, so the repository owner must perform the destructive mutation manually.

Immediately before manual deletion:

1. `main` must still equal the execution baseline above;
2. all 25 candidate refs must still exist at the exact heads above;
3. no candidate may have an open PR;
4. if any lease fails, stop and recompute.

After deletion, the full namespace must be re-enumerated and reconciled against independently observed concurrent DRW/HFI ref turnover. BRH-04D is not complete until that proof is committed, validated, merged, and recorded on issue #161.
