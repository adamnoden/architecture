# BRH-04C — controlled deletion batch 3

BRH-04C is complete under issue #161.

## Result

- authorised class-A refs removed: **25 / 25**
- B removed: **0**
- C removed: **0**
- D removed: **0**
- X removed: **0**
- candidate-set SHA-256: `e87c63fee13920b58a45b4c401db5d315a944b543d3d1ccc46a3bd4cc45c7e47`
- execution baseline: `79b55304b3d228b765a594f4495ed00acebcd8fd`
- source classification baseline: `b8e842cee5beef6981f1e075cd06a1c080fbfe3a`
- source baseline to execution baseline: **179 ahead / 0 behind**

Every candidate was class A in BRH-01A, remained at its exact frozen head immediately before the manual mutation, and was not an open-PR head. The exact candidate names and SHAs are preserved in `project/branch-hygiene-deletion-04c.json`.

## Namespace reconciliation

The namespace immediately before the authorised mutation contained **115 refs including `main`**. The post-mutation namespace contains **90 refs including `main`**.

The count reconciles exactly:

`115 - 25 BRH-04C refs - 1 independently retired DRW ref + 1 independently created HFI ref = 90`

Concurrent activity was independently identified:

- DRW #219 merged and `drw-04b1-south-landing-label-fit` retired; current `main` became `46a9bad2ff8af899111b44bceff17282f4961451`.
- HFI-02B created `hfi-02b-stairs-fall-risk` under PR #221.

Protected BRH/DRW refs and nearby semantic-review C refs remain present. Open PRs after reconciliation are #213, #220 and #221. No unintended BRH ref loss was observed.

No repository setting was changed and no historical branch content was salvaged, merged or cherry-picked as part of this packet.

## Next packet

BRH-04D must begin from a fresh `main`, open-PR and full-namespace lease. No BRH-04C lease carries forward.
