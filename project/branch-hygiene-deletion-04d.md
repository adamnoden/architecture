# BRH-04D — controlled deletion batch 4 preflight

BRH-04D continues the **A-first** deletion phase under issue #161. It freezes the next bounded tranche of **25 historical class-A refs** after completed BRH-04A through BRH-04C.

## Final destructive lease candidate

Two earlier leases were discarded before any deletion because `main` moved while concurrent HFI/DRW work completed. The current recomputed state is:

- execution `main`: `b53f5c500babe107f98d50ba2c81f1afcd4f6796`
- source classification: BRH-01A at `b8e842cee5beef6981f1e075cd06a1c080fbfe3a`
- source baseline → execution `main`: **ahead 194 / behind 0**
- namespace now: **90 refs including `main`**
- open PRs: #213 `drw-04d-plan-pair-proof` @ `d5ad0993e759d307e1b9a478dd65788a97a7fc55`; #223 `brh-04d-controlled-deletion-4`
- fresh HFI ref `hfi-02c-vertical-life-course` @ `223ccafae614e22c265f76e1d98de6fa02dabf9c` is explicitly protected
- DRW-04B.2 PR #222 merged and its corrective branch retired before this lease
- deletion cap: **25**
- candidate-set SHA-256: `549792fc53e179de3a3a24198c947fedaa56231495239847d88bb5b28c1aa2f5`

Every candidate below was class **A — fully integrated** in BRH-01A (`ancestor=yes`, `branch-only=0`), and every live head was re-read after the latest `main` movement.

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

This packet excludes all active DRW/HFI work, BRH authority/stale-draft refs requiring separate re-proof, and every B/C branch. In particular, `pub-san-back-matter` is class B, while `pub-san-computational-surface`, `pub-san-research-evidence`, and `pub-san-rh-technical` are class C.

## Manual destructive gate

The connected GitHub capability has no first-class branch/ref deletion action. The repository owner may delete exactly the 25 refs above only after a final check confirms `main` is still `b53f5c500babe107f98d50ba2c81f1afcd4f6796`, the candidates remain at the recorded heads, and none has acquired an open PR.

After deletion, the complete namespace must be re-enumerated and reconciled against concurrent DRW/HFI turnover. BRH-04D is not complete until the proof is committed, validated, merged, and recorded on #161.
