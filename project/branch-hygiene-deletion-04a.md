# BRH-04A — controlled deletion batch 1

BRH-04A is the first destructive packet in the branch-hygiene programme. It is deliberately limited to **25 class-A branches**: refs already mechanically proven fully integrated, with live heads re-read unchanged before the batch was frozen.

## Execution baseline

- programme: issue #161
- packet baseline `main`: `19170e6cac52a54e751ade0ccd0899cc6ee13ec4`
- branch count at packet start: **164 including `main` / 163 non-main**
- open PRs at packet start: **0**
- source classification: **BRH-01A** at `b8e842cee5beef6981f1e075cd06a1c080fbfe3a`
- source-baseline → execution-main proof: **ahead 149 / behind 0**, so the BRH-01A baseline is an ancestor of execution `main`
- candidate-set SHA-256: `cd9f328d8d0c7cbccc599c5e5f87a359de78fd9493f64af2d6713dfffacf50d9`

Each branch below was class A under BRH-01A (`ancestor=yes`, `branch-only=0`), and its live head was re-read unchanged during BRH-04A planning.

| Branch | Exact deletion head | Class | Historical PR if recorded |
| --- | --- | --- | ---: |
| `architectural-specificity-audit-execution` | `dd5e50ffbe48b2cea1b7045e43b140839e7f7a29` | A | — |
| `architectural-specificity-boundary` | `186f8d6b38d9add87d601149e370e6b2870cd9a7` | A | — |
| `brh-00a-audit-method` | `1485ce3e009ac6a4801625b61a546c9ee68ed63a` | A | #164 |
| `brh-00b-full-inventory` | `bcca81ed13d63397afd3e085224b5d557e372935` | A | #168 |
| `brh-00c-completeness-verification` | `454daa685156ac3e73777239e588c66b91838534` | A | #170 |
| `candidate-pattern-hardening` | `67dee3992d8353185233ee3e13fabfb88089d3df` | A | — |
| `ch-00-baseline-freeze` | `88af7b7c721b539eb7f219c93f42c1c3939db39a` | A | — |
| `ch-01-fail-closed` | `2888761157163453f094abbfa023a7951a3844bf` | A | — |
| `ch-02-runtime-architecture` | `6e2f1b413fd42cca3b344099d8c77765b3142ccc` | A | — |
| `ch-03-single-pass-reference-house` | `ae462eab87319f37f0d594021dcf6a0e276c991e` | A | — |
| `ch-04-strengthen-representation` | `8d9c5a93dde026ebe78c50ff459b3603d8f8b4f5` | A | — |
| `ch-06-housekeeping-sync` | `658c947f8a0608dcfc8c8db8d19271087ebebc76` | A | — |
| `ch-06-strengthen-test-kinds` | `5909864f4a48e016ae737a6a4d6b668448fadc79` | A | — |
| `ch-07-housekeeping-sync` | `d278ed1d42c2cb633a815b9a699d060bcfcb6d9c` | A | — |
| `ch-07-toolchain-ergonomics` | `30068c9303e2ebcab58e24c005ec06f1f38ad863` | A | — |
| `ci-pull-request-gate` | `693b8e08923fc108ab232c4d067642017a7ddc66` | A | — |
| `coa-00-output-audit` | `836cf9624d90bd8f0dfa71e26b25bc718d1c6911` | A | — |
| `coa-00-output-audit-2` | `836cf9624d90bd8f0dfa71e26b25bc718d1c6911` | A | — |
| `coa-00-output-audit-final` | `ac2e608b505cae5297d3afbaf7772ee581d2d93e` | A | — |
| `coa-01-output-contract` | `1868936d8ab36222bfb36ace873d94c5ab0d2651` | A | — |
| `coa-02-report-extraction` | `814f020d858f2e26aa0547abc4f596aaf3f57455` | A | — |
| `coa-03-drawing-language` | `d7e1a1c42e9aaa94d9482579e5952e1f23585fa1` | A | — |
| `coa-05-topology-successors` | `5f76fc014c4754939afecb3e0cdd733d6bbc5e71` | A | — |
| `coa-05-topology-successors-2` | `5f76fc014c4754939afecb3e0cdd733d6bbc5e71` | A | — |
| `coa00-tmp` | `836cf9624d90bd8f0dfa71e26b25bc718d1c6911` | A | — |

## Destructive gate

No deletion is allowed until an armed execution proves, in one preflight before the first delete:

1. `main` is still exactly the frozen execution baseline;
2. all 25 refs still exist at the exact recorded heads;
3. every head remains an ancestor of that exact `main`;
4. no candidate has an open PR;
5. candidate count does not exceed 25.

After deletion, the complete remote-head namespace must equal the pre-delete namespace **minus exactly these 25 refs**. Any other ref movement is a packet failure requiring reconciliation before closeout.

## Explicit protections

`drw-04b-first-floor-renderer` is recent/live and protected. The recent reconciliation ref `brh-02g-publication-editorial-review` and superseded `brh-03-salvage-necessity-proof` draft are also outside this batch and receive no deletion decision here.

Only class A is in scope. **No B, C, D or X branch is authorised for deletion by BRH-04A.**
