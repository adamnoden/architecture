# BRH-01B — patch-equivalent branches

Mechanical classification only. BRH-01B proves patch equivalence; it does not make semantic supersession decisions and authorises no branch deletion.

## Baseline

- current main: `b80920f74a677c3ddc0ebf70884ca3e0da02ca89`
- current non-main branches: **158**
- open PRs at classification time: **1**
- A classifications carried with unchanged heads: **110**
- prior A classifications invalidated: **0**
- B — patch-equivalent: **5**
- unresolved after A/B: **43**
- new refs since BRH-01A: **2**
- changed heads since BRH-01A: **1**
- post-01A integrated signal: **2**
- enumeration SHA-256: `78d91064b94c81b0ebc56b3125d503b0ac74baefdf53b64ada890d202b00d2ac`
- classification JSON SHA-256: `079cba26f53430db7b626403abb8092d0ec882113f5bba2e8eda54394548f8cb`
- restart: BRH-01B restarted twice: first when PR #174 / drw-02e appeared after the initial audit, then again when PR #174 merged and moved main from ce7f522e3b3bec286746fd093d21764670419e20 to b80920f74a677c3ddc0ebf70884ca3e0da02ca89. All stale results were discarded.

## B — patch-equivalent

| Branch | Head | Non-merge patches | Equivalent | Unique |
| --- | --- | ---: | ---: | ---: |
| `ch00-compiler-hardening-plan` | `23360b57002dd674abd48d8fc4ddf65b4eddc27a` | 1 | 1 | 0 |
| `external-maintenance-geography` | `2b7edc1583b70da90315efe91f63a7566aabaed9` | 1 | 1 | 0 |
| `maturity-model-enforcement` | `fb1a57750332c27485223a020eb8375a9a5683bf` | 1 | 1 | 0 |
| `pr00e-e2-e4-editorial-hardening` | `514d6ae7b6dfeca79f498e45a127f995972aef32` | 1 | 1 | 0 |
| `pub-san-back-matter` | `f519e6de4b5491be6f6aefce438c72e88e02dcf7` | 1 | 1 | 0 |

## Post-01A integrated signal (2)

These are mechanically A-shaped now but remain outside BRH-01B classification. BRH-01C must reconcile them explicitly.

- `brh-01a-obvious-integrated` @ `bbaf9b72df7758b4ff4d97d89ee6a798789b2c41`
- `drw-02e` @ `374c5db6e5b559e58cbc6a54106fc64786d3b9e6`

## Unresolved after A/B (43)

| Branch | Head | Reason(s) |
| --- | --- | --- |
| `brh-01a-obvious-integrated` | `bbaf9b72df7758b4ff4d97d89ee6a798789b2c41` | head-changed-since-BRH-01A, head-ancestor-of-main-not-B |
| `brh-01b-patch-equivalent` | `4bb220acdff95aba037f689bc21b14f09a7b90db` | active-packet-branch, open-pr, post-BRH-01A-ref, unique-patch-signal, mixed-or-unique-git-cherry |
| `cf-01-contrast-fixture` | `66470917264edf3419ebda2886fbf42c2466a125` | unique-patch-signal, mixed-or-unique-git-cherry |
| `ch-05-determinism-identity-provenance` | `77d0d0521a6ddbd6f7f27ac7d324247be1932721` | unique-patch-signal, mixed-or-unique-git-cherry |
| `ch-05-housekeeping-sync` | `4971c87e788b814dfde1d111399edc64663d6c86` | unique-patch-signal, mixed-or-unique-git-cherry |
| `ch-08-distillation-deletion` | `4d7749f3cbb39a8b10defb8effa9c3a988482708` | unique-patch-signal, mixed-or-unique-git-cherry |
| `coa-04-plan-section-successors` | `95da828b7087abab7b66df763a18eee276c56202` | unique-patch-signal, mixed-or-unique-git-cherry |
| `coa-05-topology-successors-final` | `1a2cd8719791c50f3b5f29fb98436a3b657bfe11` | unique-patch-signal, mixed-or-unique-git-cherry |
| `coa-06-output-integration` | `3ee3a9a501267ea2ca6b7b7d1f55d68cbd2bd585` | unique-patch-signal, mixed-or-unique-git-cherry |
| `drw-02e` | `374c5db6e5b559e58cbc6a54106fc64786d3b9e6` | post-BRH-01A-ref, head-ancestor-of-main-not-B |
| `g01-completion-programme` | `0efb277130c59b7042726c3121f0529c011c2eb1` | unique-patch-signal, mixed-or-unique-git-cherry |
| `g01-d10-normative` | `8b59b09bcf3a47b190c9d6f0e0a849b5f5f997ad` | unique-patch-signal, mixed-or-unique-git-cherry |
| `g01-d10s-specificity` | `7cca300e719497230e8b9778037cd3379ef1bae4` | unique-patch-signal, mixed-or-unique-git-cherry |
| `g01-d11-v01-freeze` | `8adc19b0daa40a3615f9114453250c4ab2593fe9` | unique-patch-signal, mixed-or-unique-git-cherry |
| `g01-d12-reference-house` | `172957fb8fa568ba682908e3cf78a29cbc80460d` | unique-patch-signal, mixed-or-unique-git-cherry |
| `g01-d13-closeout` | `6969c24301619ddeb92f3f18ef72fad69b5ccfc9` | unique-patch-signal, mixed-or-unique-git-cherry |
| `g01-d8-falsification` | `89aab07fca5debbf77c35f0b6d713683a645163f` | unique-patch-signal, mixed-or-unique-git-cherry |
| `g01-d9-holdout` | `c1cc56d17cd616a648e78d0a1851c39c05faa7ba` | unique-patch-signal, mixed-or-unique-git-cherry |
| `pattern-language-overhaul` | `12af047641ef08f2f5a21a9621dbfc668abd48fc` | unique-patch-signal, mixed-or-unique-git-cherry |
| `pattern-language-phase6-audit` | `0c08c98d4792ccb63a24185303fe9295f36d8384` | unique-patch-signal, mixed-or-unique-git-cherry |
| `pattern-language-phase7` | `18c55e5b66bf1dcb04ddb42fa9850d3535a296f9` | unique-patch-signal, mixed-or-unique-git-cherry |
| `pattern-language-phase7-migration` | `876d43c6878b5e0ba5111f5634f69514d77966bd` | unique-patch-signal, mixed-or-unique-git-cherry |
| `pattern-language-phase8-crosswalk` | `69dd1d10041b8c930c05a2eb2015d8357e887e67` | unique-patch-signal, mixed-or-unique-git-cherry |
| `pr00b-part-iv-synthesis` | `4907af4556e2c546721fcfba6b7f29853014f935` | unique-patch-signal, mixed-or-unique-git-cherry |
| `pr00d-d3-reference-house-architecture` | `1789943590256278cd6152cb414c137634b8a7b7` | unique-patch-signal, mixed-or-unique-git-cherry |
| `pr00d-d3-reference-house-figures` | `53097a2a42faa8488b7d528388ef45903c93e138` | unique-patch-signal, mixed-or-unique-git-cherry |
| `pr00d-d4-reference-house-systems` | `064bdce830ea76c4ffa49737ee72d7092470619b` | unique-patch-signal, mixed-or-unique-git-cherry |
| `pr00d-d5-visual-integration` | `d377665ae095b604979956d61dd36803ae7b3f6f` | unique-patch-signal, mixed-or-unique-git-cherry |
| `pr00e-editorial-hardening` | `3e16b1cecde03dbdaa21becc6f8a02eaa4306d40` | unique-patch-signal, mixed-or-unique-git-cherry |
| `pr00f-integrity` | `ebd9d34497e83c3158915e98cd120e1fb296675f` | unique-patch-signal, mixed-or-unique-git-cherry |
| `project-integrity-refactor` | `5f3ddadab402daaf9f01a3ea99531fc65734302d` | unique-patch-signal, mixed-or-unique-git-cherry |
| `prototype-p03-engineer-review-brief` | `1fe68d1f4da1531cc273573ea098709e3d6a1302` | unique-patch-signal, mixed-or-unique-git-cherry |
| `pub-san-computational-surface` | `fd527ace394db25b6ddb1c6c6de65728ce48cf0c` | unique-patch-signal, mixed-or-unique-git-cherry |
| `pub-san-research-evidence` | `3090a7ed89f5e0a84d54eecedebf8ad82b5ca42f` | unique-patch-signal, mixed-or-unique-git-cherry |
| `pub-san-rh-technical` | `023094149a998126ae8bf1389be8fc0ecd9fdd79` | unique-patch-signal, mixed-or-unique-git-cherry |
| `public-url-phase-1` | `45fcb14128ae055a8b0724cbfbbc31bbc8758ceb` | unique-patch-signal, mixed-or-unique-git-cherry |
| `reference-house-phase5` | `456edac937e0de604f3983a6344902b8862fa761` | unique-patch-signal, mixed-or-unique-git-cherry |
| `rh-c1` | `330e7bc0d0eda6a0ec33b51afed09c733c2dd4bd` | unique-patch-signal, mixed-or-unique-git-cherry |
| `rh-c2-structural-view` | `9be3155dd8ff34dd21ae5ea80c7ec8f94e8e6d20` | unique-patch-signal, mixed-or-unique-git-cherry |
| `rh-c3-service-view` | `3226aa325190aa94803c18535d49b5951afe5458` | unique-patch-signal, mixed-or-unique-git-cherry |
| `rh-c4-boundary-view` | `b3740c8196ad2a7ba969e27b89f304841fc94f8f` | unique-patch-signal, mixed-or-unique-git-cherry |
| `rh-c5-target-calculations` | `bc219a9060316f023e90a06709999254bda6766a` | unique-patch-signal, mixed-or-unique-git-cherry |
| `workmanship-robustness` | `a049e8da6cd9133dcbbb654e2fc703a1c5baf712` | unique-patch-signal, mixed-or-unique-git-cherry |

## Safety boundary

- No remote branch was deleted, rewritten or salvaged.
- No C/D semantic supersession or value judgement is made here.
- The merged `drw-02e` branch is not opportunistically reclassified in this B-only packet; its new A-shaped state is handed to BRH-01C.
- Deletion remains gated to BRH-04.
