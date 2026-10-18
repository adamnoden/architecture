# BRH-04C — controlled deletion batch 3 preflight

BRH-04C continues the **A-first** deletion phase under issue #161. This preflight freezes the next bounded tranche of **25 historical class-A refs** after completed BRH-04A and BRH-04B.

## Execution baseline

- `main`: `79b55304b3d228b765a594f4495ed00acebcd8fd`
- namespace at packet start: **114 refs including `main`**
- open PRs at packet start: **1** — #213, `drw-04d-plan-pair-proof` @ `9301935644f925473fd136941c5cee64bbf099fb`
- source classification: BRH-01A at `b8e842cee5beef6981f1e075cd06a1c080fbfe3a`
- source baseline → current `main`: **ahead 179 / behind 0**
- deletion cap: **25**
- candidate-set SHA-256: `e87c63fee13920b58a45b4c401db5d315a944b543d3d1ccc46a3bd4cc45c7e47`

Every candidate below was class **A — fully integrated** in BRH-01A (`ancestor=yes`, `branch-only=0`), still exists at exactly the same head, and is not an open-PR branch.

| Branch | Exact deletion head |
| --- | --- |
| `pr00c-authority-reconciliation` | `4ea8ca63d1414f1261677b2cb9aac5c19670ecf0` |
| `pr00c-closeout` | `09c5f61d900c9763ddacd1a020b6f097a6c1f37c` |
| `pr00d-d1-core-figures` | `8c7d67c8fc4fdc78f693201e0d0950b6f95be867` |
| `pr00d-d2-pattern-language-figure` | `c260b849f22378d536c440a7aff31198b9858648` |
| `pr00d-figure-inventory` | `891565673355421d3618421c2fece07fb75a6b9f` |
| `pr00g-candidate-proof` | `f9ed50f2217d848e04bef8d0dd76e8dadd7c1775` |
| `pr00h-candidate-freeze` | `36634ee2f224a3059410a8a31d7af73c87a245bd` |
| `pr01-adversarial-programme` | `460070c5b0597ef7525e65786a4bc189f779f4c8` |
| `pr01-r0-review-map` | `cb86869765f24b2a5fd336343c6e24f1655caadd` |
| `pr01-r1-core-proposition` | `f98421cae79adafc34eb50241274f98423bf1f0e` |
| `pr01-r2-pattern-method` | `99b0166fcb2832b4aa25a7c05fb5a1fe6c972b1d` |
| `pr01-r3-reference-house` | `fd0104d4593e1b31e7f51680a034b244cb9a5c90` |
| `pr01-r4-hostile-architect` | `001b41431c934199134b5eb17ce76296efc378ac` |
| `pr01-r5-steelman-opposition` | `4bb8a47cfe93d66cd3198e096138b864f652e6d3` |
| `pr01-r6-cross-book` | `3a0495a52df8157a5c752aabcc737d8d3652b555` |
| `pr01-r7-findings-freeze` | `fc0a0ed24f791e929ae126b0066b7046d407dac5` |
| `pr01-r8a-proportionality` | `c9f1c717412241ae535aeeafbcd6e24ad742ddd1` |
| `pr01-r8b-life-course` | `e9adc414fc585e3b602f542fde0ca19ec25797c6` |
| `pr01-r8c-transfer` | `f06593358bec6ac03fc959c2d21a2e9087e67603` |
| `pr01-r8d-pattern-taxonomy` | `9e2e9848237f378af27ed7924fcaf142b77c8260` |
| `pr01-r8e-delivery-stewardship` | `8eace9665206c4b0e86ddf379a777511ebd50800` |
| `pr01-r8f-reconciliation` | `d4cd8474c329a87a26ba900d3fb3f6c02c32b57b` |
| `pr01-r9-reproof-refreeze` | `c0ca5d571fecb1793136ecd67e44a3426d47a653` |
| `pr01-status-reconciliation` | `6466f64ff739489bfe49b86c130058821d9815b7` |
| `preface-the-obvious-eventually` | `b3fa7550e2ccf985b2ec765e5a07e646f77d3089` |

## Protected namespace

The active DRW branch `drw-04d-plan-pair-proof` is protected by open PR #213. `drw-04b1-south-landing-label-fit` remains outside this historical tranche. BRH authority/reconciliation refs are not opportunistically deleted.

The packet remains **A-only**. Nearby semantic-review C refs such as `pr00d-d3-reference-house-architecture`, `pr00d-d3-reference-house-figures`, `pr00d-d4-reference-house-systems`, and `pr00d-d5-visual-integration` are explicitly outside scope.

## Destructive gate

The connected GitHub capability has no first-class branch/ref deletion action, so the repository owner must perform the destructive mutation manually.

Immediately before manual deletion:

1. `main` must still be exactly `79b55304b3d228b765a594f4495ed00acebcd8fd`;
2. all 25 refs must still exist at the exact heads above;
3. no candidate may have an open PR;
4. if any lease fails, stop and recompute rather than deleting from stale evidence.

After deletion, the complete namespace must be re-enumerated and reconciled against independently observed concurrent DRW/HFI ref turnover. BRH-04C is not complete until that proof is committed, validated, merged, and recorded on issue #161.
