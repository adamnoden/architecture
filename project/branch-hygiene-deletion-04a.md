# BRH-04A — controlled deletion batch 1

BRH-04A is the first destructive packet in the branch-hygiene programme. It was deliberately limited to **25 class-A branches**: refs mechanically proven fully integrated, with exact heads re-read before the deletion set was frozen.

## Result

**BRH-04A is complete: 25 / 25 intended class-A refs were deleted.**

Deletion was performed manually by the repository owner through GitHub because the connected GitHub capability available to the agent exposes branch creation/update but no first-class branch/ref deletion action. The missing connector mutation was not bypassed through an indirect workflow.

- programme: issue #161
- planning baseline `main`: `19170e6cac52a54e751ade0ccd0899cc6ee13ec4`
- source classification: BRH-01A at `b8e842cee5beef6981f1e075cd06a1c080fbfe3a`
- branch count at planning: **164 including `main` / 163 non-main**
- deletion cap: **25**
- deleted: **25 A / 0 B / 0 C / 0 D / 0 X**
- candidate-set SHA-256: `cd9f328d8d0c7cbccc599c5e5f87a359de78fd9493f64af2d6713dfffacf50d9`

## Deleted refs

| Branch | Frozen head |
| --- | --- |
| `architectural-specificity-audit-execution` | `dd5e50ffbe48b2cea1b7045e43b140839e7f7a29` |
| `architectural-specificity-boundary` | `186f8d6b38d9add87d601149e370e6b2870cd9a7` |
| `brh-00a-audit-method` | `1485ce3e009ac6a4801625b61a546c9ee68ed63a` |
| `brh-00b-full-inventory` | `bcca81ed13d63397afd3e085224b5d557e372935` |
| `brh-00c-completeness-verification` | `454daa685156ac3e73777239e588c66b91838534` |
| `candidate-pattern-hardening` | `67dee3992d8353185233ee3e13fabfb88089d3df` |
| `ch-00-baseline-freeze` | `88af7b7c721b539eb7f219c93f42c1c3939db39a` |
| `ch-01-fail-closed` | `2888761157163453f094abbfa023a7951a3844bf` |
| `ch-02-runtime-architecture` | `6e2f1b413fd42cca3b344099d8c77765b3142ccc` |
| `ch-03-single-pass-reference-house` | `ae462eab87319f37f0d594021dcf6a0e276c991e` |
| `ch-04-strengthen-representation` | `8d9c5a93dde026ebe78c50ff459b3603d8f8b4f5` |
| `ch-06-housekeeping-sync` | `658c947f8a0608dcfc8c8db8d19271087ebebc76` |
| `ch-06-strengthen-test-kinds` | `5909864f4a48e016ae737a6a4d6b668448fadc79` |
| `ch-07-housekeeping-sync` | `d278ed1d42c2cb633a815b9a699d060bcfcb6d9c` |
| `ch-07-toolchain-ergonomics` | `30068c9303e2ebcab58e24c005ec06f1f38ad863` |
| `ci-pull-request-gate` | `693b8e08923fc108ab232c4d067642017a7ddc66` |
| `coa-00-output-audit` | `836cf9624d90bd8f0dfa71e26b25bc718d1c6911` |
| `coa-00-output-audit-2` | `836cf9624d90bd8f0dfa71e26b25bc718d1c6911` |
| `coa-00-output-audit-final` | `ac2e608b505cae5297d3afbaf7772ee581d2d93e` |
| `coa-01-output-contract` | `1868936d8ab36222bfb36ace873d94c5ab0d2651` |
| `coa-02-report-extraction` | `814f020d858f2e26aa0547abc4f596aaf3f57455` |
| `coa-03-drawing-language` | `d7e1a1c42e9aaa94d9482579e5952e1f23585fa1` |
| `coa-05-topology-successors` | `5f76fc014c4754939afecb3e0cdd733d6bbc5e71` |
| `coa-05-topology-successors-2` | `5f76fc014c4754939afecb3e0cdd733d6bbc5e71` |
| `coa00-tmp` | `836cf9624d90bd8f0dfa71e26b25bc718d1c6911` |

## Post-delete proof

A fresh complete branch enumeration contains **141 refs including `main`** and none of the 25 candidate names.

The count reconciles with concurrent work rather than pretending the namespace was static:

`164 planning refs - 25 BRH deletions - 1 independently retired DRW ref + 3 independently created DRW/HFI refs = 141 current refs`.

The concurrent turnover observed outside BRH-04A is:

- retired: `drw-04b-first-floor-renderer`;
- created: `drw-04b1-south-landing-label-fit`, `drw-04d-plan-pair-proof`, `hfi-01d-proportionality-method`.

Nearby non-target branches survived, providing useful anti-sweep sentinels: `ch-05-determinism-identity-provenance`, `ch-05-housekeeping-sync`, `ch-08-distillation-deletion`, `coa-04-plan-section-successors`, `coa-05-topology-successors-final`, and `coa-06-output-integration`. The recent BRH reconciliation refs `brh-02g-publication-editorial-review` and `brh-03-salvage-necessity-proof` also remain present, as does this packet branch. Live DRW work remains present.

Current `main` observed during closeout was `13b86f65a5824f8b0c22edfa6c9a56cf7f97110f`; its movement is concurrent programme work, not part of this deletion packet.

## Safety conclusion

The intended 25 class-A refs are gone. No B, C, D or X branch was authorised or observed deleted by BRH-04A. `main` is intact, open/current work remains protected, repository settings were not changed, and no historical branch content was merged or cherry-picked as part of deletion.

## Exact next packet

**BRH-04B — next bounded controlled deletion batch.** Recover the then-current complete branch namespace and open PR set from scratch, select no more than 25 already-authorised A/B/C candidates whose live heads still satisfy their proof, take a fresh deletion lease, and do not reuse any BRH-04A head or baseline assumption.
