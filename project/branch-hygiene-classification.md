# BRH-01A — obvious integrated branches

Mechanical classification only. No semantic supersession decisions, salvage, or branch deletion occur in this packet.

## Baseline

- current main: `b8e842cee5beef6981f1e075cd06a1c080fbfe3a`
- current non-main branches: **156**
- open PRs at classification time: **1**
- enumeration SHA-256: `8104f89d6aca7396af0878ad4977227edfd2339d13839db2fd5410886aaf2768`
- classification JSON SHA-256: `2511dbb030fa9c7c350de8fedc24b1db7928885cd210a25abcb615994e8b6be6`
- restart: PR #171 / DRW-02D moved main after the first successful classification run; stale result discarded and full audit recomputed.

## A classification rule

A branch is classified **A — fully integrated** only when its current head is an ancestor of current `main`, it has zero branch-only commits, it has no open PR, and it is not the active packet branch. A ref first observed after BRH-00C additionally needs exact merged-PR-head proof before it can leave provisional X.

## A — fully integrated (110)

| Branch | Head | Behind main | Evidence |
| --- | --- | ---: | --- |
| `architectural-specificity-audit-execution` | `dd5e50ffbe48b2cea1b7045e43b140839e7f7a29` | 1135 | ancestor=yes; branch-only=0 |
| `architectural-specificity-boundary` | `186f8d6b38d9add87d601149e370e6b2870cd9a7` | 1161 | ancestor=yes; branch-only=0 |
| `brh-00a-audit-method` | `1485ce3e009ac6a4801625b61a546c9ee68ed63a` | 22 | ancestor=yes; branch-only=0 |
| `brh-00b-full-inventory` | `bcca81ed13d63397afd3e085224b5d557e372935` | 14 | ancestor=yes; branch-only=0 |
| `brh-00c-completeness-verification` | `454daa685156ac3e73777239e588c66b91838534` | 4 | ancestor=yes; branch-only=0 |
| `candidate-pattern-hardening` | `67dee3992d8353185233ee3e13fabfb88089d3df` | 1431 | ancestor=yes; branch-only=0 |
| `ch-00-baseline-freeze` | `88af7b7c721b539eb7f219c93f42c1c3939db39a` | 712 | ancestor=yes; branch-only=0 |
| `ch-01-fail-closed` | `2888761157163453f094abbfa023a7951a3844bf` | 701 | ancestor=yes; branch-only=0 |
| `ch-02-runtime-architecture` | `6e2f1b413fd42cca3b344099d8c77765b3142ccc` | 680 | ancestor=yes; branch-only=0 |
| `ch-03-single-pass-reference-house` | `ae462eab87319f37f0d594021dcf6a0e276c991e` | 662 | ancestor=yes; branch-only=0 |
| `ch-04-strengthen-representation` | `8d9c5a93dde026ebe78c50ff459b3603d8f8b4f5` | 628 | ancestor=yes; branch-only=0 |
| `ch-06-housekeeping-sync` | `658c947f8a0608dcfc8c8db8d19271087ebebc76` | 614 | ancestor=yes; branch-only=0 |
| `ch-06-strengthen-test-kinds` | `5909864f4a48e016ae737a6a4d6b668448fadc79` | 620 | ancestor=yes; branch-only=0 |
| `ch-07-housekeeping-sync` | `d278ed1d42c2cb633a815b9a699d060bcfcb6d9c` | 589 | ancestor=yes; branch-only=0 |
| `ch-07-toolchain-ergonomics` | `30068c9303e2ebcab58e24c005ec06f1f38ad863` | 595 | ancestor=yes; branch-only=0 |
| `ci-pull-request-gate` | `693b8e08923fc108ab232c4d067642017a7ddc66` | 1190 | ancestor=yes; branch-only=0 |
| `coa-00-output-audit` | `836cf9624d90bd8f0dfa71e26b25bc718d1c6911` | 514 | ancestor=yes; branch-only=0 |
| `coa-00-output-audit-2` | `836cf9624d90bd8f0dfa71e26b25bc718d1c6911` | 514 | ancestor=yes; branch-only=0 |
| `coa-00-output-audit-final` | `ac2e608b505cae5297d3afbaf7772ee581d2d93e` | 507 | ancestor=yes; branch-only=0 |
| `coa-01-output-contract` | `1868936d8ab36222bfb36ace873d94c5ab0d2651` | 499 | ancestor=yes; branch-only=0 |
| `coa-02-report-extraction` | `814f020d858f2e26aa0547abc4f596aaf3f57455` | 486 | ancestor=yes; branch-only=0 |
| `coa-03-drawing-language` | `d7e1a1c42e9aaa94d9482579e5952e1f23585fa1` | 479 | ancestor=yes; branch-only=0 |
| `coa-05-topology-successors` | `5f76fc014c4754939afecb3e0cdd733d6bbc5e71` | 477 | ancestor=yes; branch-only=0 |
| `coa-05-topology-successors-2` | `5f76fc014c4754939afecb3e0cdd733d6bbc5e71` | 477 | ancestor=yes; branch-only=0 |
| `coa00-tmp` | `836cf9624d90bd8f0dfa71e26b25bc718d1c6911` | 514 | ancestor=yes; branch-only=0 |
| `compiler-p0-kernel` | `deb524ba727b90992a75450d8c35acbe27746bed` | 1179 | ancestor=yes; branch-only=0 |
| `compiler-p0-pat-xw-checkpoint` | `d7d42e8ae03ddec156c0e22773365de28f61179a` | 1168 | ancestor=yes; branch-only=0 |
| `compiler-pat-xw-01` | `4643bd1edeb7edc0ff67cc5955349024f7563c9f` | 1173 | ancestor=yes; branch-only=0 |
| `drw-01c` | `a1da0f3aaa287b4a93bdb79b183463d95ce0d7c7` | 40 | ancestor=yes; branch-only=0 |
| `drw-01d` | `ba82786f3caef9f543d4a8810e25ef51489118f7` | 38 | ancestor=yes; branch-only=0 |
| `drw-01e` | `5e6cbbd8c1d391127dc231aaeb584b008617ade1` | 32 | ancestor=yes; branch-only=0 |
| `drw-02a` | `b77aac7bb33ddec4ac6185ef6b42cf4841343f13` | 30 | ancestor=yes; branch-only=0 |
| `drw-02b` | `28bd93b54152161411436da4ece6309774a3dc57` | 19 | ancestor=yes; branch-only=0 |
| `drw-02c` | `509be1384cce76d8ee19b584344d4490f9b2d08e` | 9 | ancestor=yes; branch-only=0 |
| `drw-02d` | `b1067ec01574ab6ec1f639d8556e07581506bb07` | 1 | ancestor=yes; branch-only=0; post-00C merged-head-proof=yes |
| `editorial-overhaul` | `b238c4dbb98bc24e44808ca385326cff36a14116` | 1274 | ancestor=yes; branch-only=0 |
| `fix-publication-credibility-navigation` | `22ac81cabdfe37b367f1a3297f292a8750ae978c` | 608 | ancestor=yes; branch-only=0 |
| `fix-sanitation-record-surface` | `ba0270e133ea8ddf876d0000180654c6a5726181` | 372 | ancestor=yes; branch-only=0 |
| `ovids-house-migration` | `e6a8a9a75ad0a97bd28232c8f7539e6987bb541d` | 568 | ancestor=yes; branch-only=0 |
| `pattern-language-phase7-close` | `bac80230ffbca080fb4c262eb41fb08ebd3574a4` | 1192 | ancestor=yes; branch-only=0 |
| `pattern-language-phase7-integration` | `e2971075966bb5df9e9cbbfa875de34155d82503` | 1200 | ancestor=yes; branch-only=0 |
| `pattern-language-phase7-new-identities` | `c50f30b3a96a73326f8bed8489c3ad63ce7d6e3d` | 1223 | ancestor=yes; branch-only=0 |
| `pattern-language-phase7-nonpattern-homes` | `0f421c2d5f6c9c71f0b5f9940a6beef6be5f8a64` | 1209 | ancestor=yes; branch-only=0 |
| `pattern-language-phase7-validation` | `ea9211d407f3da8b30085050157680c535e57d00` | 1198 | ancestor=yes; branch-only=0 |
| `pr00-candidate-book-freeze-programme` | `315304bf41313f47c1ccf361d058397b4302c872` | 556 | ancestor=yes; branch-only=0 |
| `pr00a-candidate-book-ledger` | `882e640cf646da2d0b42a604ae927ef08625b0db` | 553 | ancestor=yes; branch-only=0 |
| `pr00b-back-matter` | `ecd55f8f31db0fd623dbc948c02f5651678aae66` | 529 | ancestor=yes; branch-only=0 |
| `pr00b-part-iii-framing` | `ea1d2ab1a6c0aa93060c49bab34472047c058ffc` | 541 | ancestor=yes; branch-only=0 |
| `pr00b-part-iv-authorship` | `b1dcb3e1f8ff405bffe8e69da21b724da22c9174` | 548 | ancestor=yes; branch-only=0 |
| `pr00b-part-v-recheck` | `4c637309c1c1aa75ece6c152d754718d57e4a7de` | 527 | ancestor=yes; branch-only=0 |
| `pr00c-authority-reconciliation` | `4ea8ca63d1414f1261677b2cb9aac5c19670ecf0` | 524 | ancestor=yes; branch-only=0 |
| `pr00c-closeout` | `09c5f61d900c9763ddacd1a020b6f097a6c1f37c` | 515 | ancestor=yes; branch-only=0 |
| `pr00d-d1-core-figures` | `8c7d67c8fc4fdc78f693201e0d0950b6f95be867` | 460 | ancestor=yes; branch-only=0 |
| `pr00d-d2-pattern-language-figure` | `c260b849f22378d536c440a7aff31198b9858648` | 456 | ancestor=yes; branch-only=0 |
| `pr00d-figure-inventory` | `891565673355421d3618421c2fece07fb75a6b9f` | 474 | ancestor=yes; branch-only=0 |
| `pr00g-candidate-proof` | `f9ed50f2217d848e04bef8d0dd76e8dadd7c1775` | 445 | ancestor=yes; branch-only=0 |
| `pr00h-candidate-freeze` | `36634ee2f224a3059410a8a31d7af73c87a245bd` | 442 | ancestor=yes; branch-only=0 |
| `pr01-adversarial-programme` | `460070c5b0597ef7525e65786a4bc189f779f4c8` | 440 | ancestor=yes; branch-only=0 |
| `pr01-r0-review-map` | `cb86869765f24b2a5fd336343c6e24f1655caadd` | 438 | ancestor=yes; branch-only=0 |
| `pr01-r1-core-proposition` | `f98421cae79adafc34eb50241274f98423bf1f0e` | 436 | ancestor=yes; branch-only=0 |
| `pr01-r2-pattern-method` | `99b0166fcb2832b4aa25a7c05fb5a1fe6c972b1d` | 434 | ancestor=yes; branch-only=0 |
| `pr01-r3-reference-house` | `fd0104d4593e1b31e7f51680a034b244cb9a5c90` | 432 | ancestor=yes; branch-only=0 |
| `pr01-r4-hostile-architect` | `001b41431c934199134b5eb17ce76296efc378ac` | 430 | ancestor=yes; branch-only=0 |
| `pr01-r5-steelman-opposition` | `4bb8a47cfe93d66cd3198e096138b864f652e6d3` | 428 | ancestor=yes; branch-only=0 |
| `pr01-r6-cross-book` | `3a0495a52df8157a5c752aabcc737d8d3652b555` | 426 | ancestor=yes; branch-only=0 |
| `pr01-r7-findings-freeze` | `fc0a0ed24f791e929ae126b0066b7046d407dac5` | 424 | ancestor=yes; branch-only=0 |
| `pr01-r8a-proportionality` | `c9f1c717412241ae535aeeafbcd6e24ad742ddd1` | 418 | ancestor=yes; branch-only=0 |
| `pr01-r8b-life-course` | `e9adc414fc585e3b602f542fde0ca19ec25797c6` | 414 | ancestor=yes; branch-only=0 |
| `pr01-r8c-transfer` | `f06593358bec6ac03fc959c2d21a2e9087e67603` | 413 | ancestor=yes; branch-only=0 |
| `pr01-r8d-pattern-taxonomy` | `9e2e9848237f378af27ed7924fcaf142b77c8260` | 410 | ancestor=yes; branch-only=0 |
| `pr01-r8e-delivery-stewardship` | `8eace9665206c4b0e86ddf379a777511ebd50800` | 409 | ancestor=yes; branch-only=0 |
| `pr01-r8f-reconciliation` | `d4cd8474c329a87a26ba900d3fb3f6c02c32b57b` | 394 | ancestor=yes; branch-only=0 |
| `pr01-r9-reproof-refreeze` | `c0ca5d571fecb1793136ecd67e44a3426d47a653` | 386 | ancestor=yes; branch-only=0 |
| `pr01-status-reconciliation` | `6466f64ff739489bfe49b86c130058821d9815b7` | 382 | ancestor=yes; branch-only=0 |
| `preface-the-obvious-eventually` | `b3fa7550e2ccf985b2ec765e5a07e646f77d3089` | 1414 | ancestor=yes; branch-only=0 |
| `print-publication-pipeline` | `ecbaf05fbcf20bd863b6c38e58188ffbc6cdaf56` | 934 | ancestor=yes; branch-only=0 |
| `project-dataplate` | `7e207c178a807deed09356c7c780ded6b99dd275` | 194 | ancestor=yes; branch-only=0 |
| `prototype-w2-evidence-protocol` | `29c47b2ee3b836a6489c792e92269fcf19ab0b54` | 1163 | ancestor=yes; branch-only=0 |
| `pub-figure-hardening` | `6e893eba90cb054f74ede59a264b5e45a0979801` | 355 | ancestor=yes; branch-only=0 |
| `pub-nom` | `e4d46792221bb1801d5f2ed0fa04ecf94a9cf5f0` | 45 | ancestor=yes; branch-only=0 |
| `pub-nom-actual` | `e031fbabcb17724fb5561839fb4ff0ec27bd9790` | 191 | ancestor=yes; branch-only=0 |
| `pub-nom-audit-temp` | `e031fbabcb17724fb5561839fb4ff0ec27bd9790` | 191 | ancestor=yes; branch-only=0 |
| `pub-nom-enough` | `e031fbabcb17724fb5561839fb4ff0ec27bd9790` | 191 | ancestor=yes; branch-only=0 |
| `pub-nom-finalwork` | `e031fbabcb17724fb5561839fb4ff0ec27bd9790` | 191 | ancestor=yes; branch-only=0 |
| `pub-nom-last` | `e031fbabcb17724fb5561839fb4ff0ec27bd9790` | 191 | ancestor=yes; branch-only=0 |
| `pub-nom-no` | `e031fbabcb17724fb5561839fb4ff0ec27bd9790` | 191 | ancestor=yes; branch-only=0 |
| `pub-nom-real` | `e031fbabcb17724fb5561839fb4ff0ec27bd9790` | 191 | ancestor=yes; branch-only=0 |
| `pub-nom-scan` | `e031fbabcb17724fb5561839fb4ff0ec27bd9790` | 191 | ancestor=yes; branch-only=0 |
| `pub-nom-stage` | `e031fbabcb17724fb5561839fb4ff0ec27bd9790` | 191 | ancestor=yes; branch-only=0 |
| `pub-nom-work` | `e031fbabcb17724fb5561839fb4ff0ec27bd9790` | 191 | ancestor=yes; branch-only=0 |
| `pub-nom-x` | `e031fbabcb17724fb5561839fb4ff0ec27bd9790` | 191 | ancestor=yes; branch-only=0 |
| `pub-nom-z` | `e031fbabcb17724fb5561839fb4ff0ec27bd9790` | 191 | ancestor=yes; branch-only=0 |
| `pub-nom-zz` | `e031fbabcb17724fb5561839fb4ff0ec27bd9790` | 191 | ancestor=yes; branch-only=0 |
| `pub-san-closeout` | `f7bc2ea2cc741d8d54e294de96f8de1412b54fb6` | 213 | ancestor=yes; branch-only=0 |
| `pub-san-first-reader` | `e035264695ea88c1100ef92e45f988dee225586f` | 274 | ancestor=yes; branch-only=0 |
| `pub-san-prototype-surface` | `74fcf25db99715819826513f231d49f0219fa5c5` | 294 | ancestor=yes; branch-only=0 |
| `pub-san-public-cleanup` | `ec95c9f67cd77214845f299eab7a780147e75afe` | 308 | ancestor=yes; branch-only=0 |
| `pub-san-publication-surfaces` | `bd3a87bc1b1fa6ca6ac063ca12389661b453a5a2` | 290 | ancestor=yes; branch-only=0 |
| `pub-san-reference-coordination` | `ac0d82b5b0eb51f563b721a97ad753c940856d86` | 299 | ancestor=yes; branch-only=0 |
| `pub-san-reference-review` | `817c6c5befb2878abe8be31045fd678e0e561d17` | 303 | ancestor=yes; branch-only=0 |
| `pub-san-resolved-work-cleanup` | `cac29844392a07d735b244c25f6636cc62d68d77` | 328 | ancestor=yes; branch-only=0 |
| `pub-san-semantic-coherence` | `8e9b1dc14b7710e8b18f057d4cfb761fe830d9ec` | 313 | ancestor=yes; branch-only=0 |
| `pub-san-source-link-cleanup` | `aff9deae0b3e34b1c86d2e8f215e967d25f329f8` | 285 | ancestor=yes; branch-only=0 |
| `publication-pdf-metadata` | `7267aba14c78c6c8551fa7559f8c7bd3a68d54d3` | 201 | ancestor=yes; branch-only=0 |
| `record-post-freeze-figure-defect` | `6c1b081d5161ab7719dd7c5c0a1ff37c9a485f71` | 353 | ancestor=yes; branch-only=0 |
| `site-build-timestamp` | `378028f2ad8f8745b750b86f2076a962245360ab` | 375 | ancestor=yes; branch-only=0 |
| `status-hygiene-2026-10-17` | `8da95e7428e155945f83fc14c6b2514a02ae2fef` | 209 | ancestor=yes; branch-only=0 |
| `tectonic-honesty` | `28386a2debd5318a2680bcdae636120ceb7b48fb` | 1445 | ancestor=yes; branch-only=0 |
| `vertical-bay-coordination` | `55f6a11f982d27c4b7c2c00c1b3cf2e5fed05eff` | 1426 | ancestor=yes; branch-only=0 |
| `wall-bay-prototype-v1` | `b9d433220c507bc53433d7227aaeb5162a9ccd8c` | 1421 | ancestor=yes; branch-only=0 |

## Deferred from BRH-01A (46)

These branches are **not** classified A in this packet. They remain for BRH-01B/01C or provisional X handling.

| Branch | Head | Reason(s) |
| --- | --- | --- |
| `brh-01a-obvious-integrated` | `0ad1e2067344918289374064d3bd3741d11e0935` | active-packet-branch, open-pr, post-BRH-00C-ref-without-merged-head-proof, head-not-ancestor-of-main, branch-only-commits |
| `cf-01-contrast-fixture` | `66470917264edf3419ebda2886fbf42c2466a125` | head-not-ancestor-of-main, branch-only-commits |
| `ch-05-determinism-identity-provenance` | `77d0d0521a6ddbd6f7f27ac7d324247be1932721` | head-not-ancestor-of-main, branch-only-commits |
| `ch-05-housekeeping-sync` | `4971c87e788b814dfde1d111399edc64663d6c86` | head-not-ancestor-of-main, branch-only-commits |
| `ch-08-distillation-deletion` | `4d7749f3cbb39a8b10defb8effa9c3a988482708` | head-not-ancestor-of-main, branch-only-commits |
| `ch00-compiler-hardening-plan` | `23360b57002dd674abd48d8fc4ddf65b4eddc27a` | head-not-ancestor-of-main, branch-only-commits |
| `coa-04-plan-section-successors` | `95da828b7087abab7b66df763a18eee276c56202` | head-not-ancestor-of-main, branch-only-commits |
| `coa-05-topology-successors-final` | `1a2cd8719791c50f3b5f29fb98436a3b657bfe11` | head-not-ancestor-of-main, branch-only-commits |
| `coa-06-output-integration` | `3ee3a9a501267ea2ca6b7b7d1f55d68cbd2bd585` | head-not-ancestor-of-main, branch-only-commits |
| `external-maintenance-geography` | `2b7edc1583b70da90315efe91f63a7566aabaed9` | head-not-ancestor-of-main, branch-only-commits |
| `g01-completion-programme` | `0efb277130c59b7042726c3121f0529c011c2eb1` | head-not-ancestor-of-main, branch-only-commits |
| `g01-d10-normative` | `8b59b09bcf3a47b190c9d6f0e0a849b5f5f997ad` | head-not-ancestor-of-main, branch-only-commits |
| `g01-d10s-specificity` | `7cca300e719497230e8b9778037cd3379ef1bae4` | head-not-ancestor-of-main, branch-only-commits |
| `g01-d11-v01-freeze` | `8adc19b0daa40a3615f9114453250c4ab2593fe9` | head-not-ancestor-of-main, branch-only-commits |
| `g01-d12-reference-house` | `172957fb8fa568ba682908e3cf78a29cbc80460d` | head-not-ancestor-of-main, branch-only-commits |
| `g01-d13-closeout` | `6969c24301619ddeb92f3f18ef72fad69b5ccfc9` | head-not-ancestor-of-main, branch-only-commits |
| `g01-d8-falsification` | `89aab07fca5debbf77c35f0b6d713683a645163f` | head-not-ancestor-of-main, branch-only-commits |
| `g01-d9-holdout` | `c1cc56d17cd616a648e78d0a1851c39c05faa7ba` | head-not-ancestor-of-main, branch-only-commits |
| `maturity-model-enforcement` | `fb1a57750332c27485223a020eb8375a9a5683bf` | head-not-ancestor-of-main, branch-only-commits |
| `pattern-language-overhaul` | `12af047641ef08f2f5a21a9621dbfc668abd48fc` | head-not-ancestor-of-main, branch-only-commits |
| `pattern-language-phase6-audit` | `0c08c98d4792ccb63a24185303fe9295f36d8384` | head-not-ancestor-of-main, branch-only-commits |
| `pattern-language-phase7` | `18c55e5b66bf1dcb04ddb42fa9850d3535a296f9` | head-not-ancestor-of-main, branch-only-commits |
| `pattern-language-phase7-migration` | `876d43c6878b5e0ba5111f5634f69514d77966bd` | head-not-ancestor-of-main, branch-only-commits |
| `pattern-language-phase8-crosswalk` | `69dd1d10041b8c930c05a2eb2015d8357e887e67` | head-not-ancestor-of-main, branch-only-commits |
| `pr00b-part-iv-synthesis` | `4907af4556e2c546721fcfba6b7f29853014f935` | head-not-ancestor-of-main, branch-only-commits |
| `pr00d-d3-reference-house-architecture` | `1789943590256278cd6152cb414c137634b8a7b7` | head-not-ancestor-of-main, branch-only-commits |
| `pr00d-d3-reference-house-figures` | `53097a2a42faa8488b7d528388ef45903c93e138` | head-not-ancestor-of-main, branch-only-commits |
| `pr00d-d4-reference-house-systems` | `064bdce830ea76c4ffa49737ee72d7092470619b` | head-not-ancestor-of-main, branch-only-commits |
| `pr00d-d5-visual-integration` | `d377665ae095b604979956d61dd36803ae7b3f6f` | head-not-ancestor-of-main, branch-only-commits |
| `pr00e-e2-e4-editorial-hardening` | `514d6ae7b6dfeca79f498e45a127f995972aef32` | head-not-ancestor-of-main, branch-only-commits |
| `pr00e-editorial-hardening` | `3e16b1cecde03dbdaa21becc6f8a02eaa4306d40` | head-not-ancestor-of-main, branch-only-commits |
| `pr00f-integrity` | `ebd9d34497e83c3158915e98cd120e1fb296675f` | head-not-ancestor-of-main, branch-only-commits |
| `project-integrity-refactor` | `5f3ddadab402daaf9f01a3ea99531fc65734302d` | head-not-ancestor-of-main, branch-only-commits |
| `prototype-p03-engineer-review-brief` | `1fe68d1f4da1531cc273573ea098709e3d6a1302` | head-not-ancestor-of-main, branch-only-commits |
| `pub-san-back-matter` | `f519e6de4b5491be6f6aefce438c72e88e02dcf7` | head-not-ancestor-of-main, branch-only-commits |
| `pub-san-computational-surface` | `fd527ace394db25b6ddb1c6c6de65728ce48cf0c` | head-not-ancestor-of-main, branch-only-commits |
| `pub-san-research-evidence` | `3090a7ed89f5e0a84d54eecedebf8ad82b5ca42f` | head-not-ancestor-of-main, branch-only-commits |
| `pub-san-rh-technical` | `023094149a998126ae8bf1389be8fc0ecd9fdd79` | head-not-ancestor-of-main, branch-only-commits |
| `public-url-phase-1` | `45fcb14128ae055a8b0724cbfbbc31bbc8758ceb` | head-not-ancestor-of-main, branch-only-commits |
| `reference-house-phase5` | `456edac937e0de604f3983a6344902b8862fa761` | head-not-ancestor-of-main, branch-only-commits |
| `rh-c1` | `330e7bc0d0eda6a0ec33b51afed09c733c2dd4bd` | head-not-ancestor-of-main, branch-only-commits |
| `rh-c2-structural-view` | `9be3155dd8ff34dd21ae5ea80c7ec8f94e8e6d20` | head-not-ancestor-of-main, branch-only-commits |
| `rh-c3-service-view` | `3226aa325190aa94803c18535d49b5951afe5458` | head-not-ancestor-of-main, branch-only-commits |
| `rh-c4-boundary-view` | `b3740c8196ad2a7ba969e27b89f304841fc94f8f` | head-not-ancestor-of-main, branch-only-commits |
| `rh-c5-target-calculations` | `bc219a9060316f023e90a06709999254bda6766a` | head-not-ancestor-of-main, branch-only-commits |
| `workmanship-robustness` | `a049e8da6cd9133dcbbb654e2fc703a1c5baf712` | head-not-ancestor-of-main, branch-only-commits |

## Safety boundary

- No branch was deleted or rewritten.
- No B/C/D semantic or patch-equivalent classification is assigned here.
- A classification is mechanical integration evidence only; deletion remains gated to BRH-04.
- New/live refs remain X unless this packet has current merged-head proof plus the normal A evidence.
