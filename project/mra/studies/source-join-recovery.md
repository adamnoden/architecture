# MRA source-identity join recovery evidence

Status: proposed integration patch, preserved after the execution environment became unavailable on 2026-11-11. This evidence branch starts from main commit `a264371b14a3d33ecc61d9f5c7e4d15726f39019`. It does not contain the full f794 ROF input join. The branch itself is not a validated integrated successor and is not intended for direct merge.

## Preserved changes

Only these two existing code files form the proposed implementation patch:

- `project/mra/studies/internal-leak-study.mjs`: preserve the original a060 observation and reconcile exactly three house input identities and two embedded receiver identities from the independently reproduced f794 pre-water-correction house. The corresponding three schedule source identities are normalized to the old schedule only after asserting both exact old/new maps and the complete current schedule blob.
- `project/had/studies/selected-water-duties.test.mjs`: retain all existing controls and add known house-input, known receiver-input and unlisted input tamper controls.

Original source blobs at a264: MRA `05ae3eb083a0a5b824e56e286f49a17cf3f6304b`; test `1bcc1a7164f52b44d3b9cfdf838894d4851593e7`.
Preserved new blobs: MRA `5b76318d0e756fcb4f8be81c9bfe58e29df2fa2e`; test `3484a7cb5eb12967f93f110bc71d7aaf99ea57e0`.

The actual leak computations are unchanged. Only the two already-declared internal water duties and their adoption blocker remain excluded from the physical comparison. All other model data and source identities remain guarded. No new inlet route, roof geometry, load, or structural admission is introduced.

## Independent observations completed before the outage

Three isolated trees were assembled from exact Git objects, including their static JavaScript import closure and all 17 JSON inputs:

1. Original pre-water correction main: `a06013820dfdc2b5ee1918abf42abce8423eb0ad`.
2. Published pre-water correction ROF source join: `f7942830ae24ef1d308f01e71a4f87f306f37ab0`.
3. Joined comparison: f794 inputs/helpers with a264's current-house producer and selected-water-duties implementation.

The original-to-published comparison outside the existing water exclusions contained exactly the five named metadata changes. The published-to-joined comparison outside those exclusions was empty. The joined and published schedules were byte-identical and matched f794's committed schedule. These observations were completed and read back before runtime access failed.

All SHA256 model digests use JSON.stringify, matching the MRA producer. Schedule SHA256 values are over raw file bytes.

| Observation | a060 original | f794 published | f794 inputs plus a264 water correction |
| --- | --- | --- | --- |
| Producer SHA256 | 6f983def825e3cd6b94e12410b8057fb902c62e28fe3365598a3d1ea69eef021 | 6f983def825e3cd6b94e12410b8057fb902c62e28fe3365598a3d1ea69eef021 | d4aaa78821f1fea4da3412a3d780fe3f30b2f852e76bb29abcc744e0e41443dd |
| Raw schedule SHA256 | 0d973ddcef7cab30ca28030f015e52a4649d948e072bbf0665a3536f3aa7e149 | fa820740d3c6b55917715945b158bc4ad1005ab80306fb3165b59c0136d31a84 | fa820740d3c6b55917715945b158bc4ad1005ab80306fb3165b59c0136d31a84 |
| Full house SHA256 | 1389191175f7d613ccae147ed00f6b7e5c1b16384828641a3246cdf9ca8ab820 | f9f7b2b4d81898b2232ad246cd208f2966ac66fa0c005139b121a76fac3c314c | 7e73e08b8f4759b0638a0da67258034c80c2098c8e4259c15038d1ec6ea9719b |
| House outside declared water changes SHA256 | a602a4d87257d73fefa378d84eba7c96cd458e68378fd5ee136e55a7b3a77f49 | 1db7717297d3e984954c70f41454aafbc6a8ee47c2bfae3eee4b31cd9009ac31 | 1db7717297d3e984954c70f41454aafbc6a8ee47c2bfae3eee4b31cd9009ac31 |

The selected-water-duties source SHA256 in the joined comparison was `833347613d0c80d870b21632b069ee63a2f2be183428828d6d903a65561d5c00`.

All three observations have these identical protected interface hashes:

| Protected data | SHA256 |
| --- | --- |
| Exterior ports | 9d16691683c6255acad78736c3f6a77ac3c27d01e5f6d7ab908fab1e8fdffabb |
| Weather faces | 1155d413b399a8ea93c4097f402e2089ded7131a68177b93a37d881216d7986f |
| Selected service interfaces | aefbf9f05d1dd275b0aebd6393a3c7fe09b31c6220ee0303424aff46bbb9deaa |

The unnormalized f794 schedule Git blob is `248c8281369d16a8885506660f740c1f66462d9d`; the original a060 schedule Git blob is `3f9de5555c01f39f5c666dfd49e4e6b87f0b9624`. The proposed verifier asserts the former before normalization and the latter afterward.

## Exact normalization boundary

| House location | a060 identity | f794 identity |
| --- | --- | --- |
| inputs["project/had/studies/receiver-selection.json"] | 5408aac3d43c95e3f5240f8510f91fb04d7a23cd | 2def3f7221d55b180cd46392a227b8c56972d03f |
| inputs["project/ias/studies/shared-family-bathing.json"] | 08d6d466d515804a58d6cbd22a5f45188af7f56e | f89302f9d87708b5314bd68a768c976efcd07b8d |
| inputs["project/str/studies/reconciled-house-interface.json"] | 66143efe1bf357fe3b373777c93bdb25f861e11d | 4d3080dc4540ce7218b86f1d27518fbeb1f8e85d |
| courtReceiver.inputs["had/studies/court-intake-selection"] | 80a8481b4e5a508164eff51b596e5a954c152a30 | 887a3df5b7a335b3eaafc7c8de4529a339428cbc |
| courtReceiver.inputs["rwt/studies/court-bypass-choice"] | 164cbc28358aed78335f59c6856e5ee0ab8fd274 | 450d121b5c70d95073f1daadd1332c789751156d |

The first three identities are also asserted and normalized at the matching schedule.sources keys. No unlisted key is omitted from hashing.

## Validation actually completed

In the private joined comparison, before the outage:

- `node project/mra/studies/internal-leak-study.mjs --write` completed with exit code 0.
- `node --test project/had/studies/selected-water-duties.test.mjs` completed: 6 passed, 0 failed, including all three new provenance tamper controls.
- The original preFix object was preserved exactly.

After that, the environment became unavailable while a command attempted the generated-receipt byte check and complete receipt comparison against a264. Neither completion was observed. No generated MRA receipt hash was read back. The generated private JSON is therefore not reconstructed or represented as verified here. Tests have not been rerun on this evidence branch.

The code and tests were reconstructed from the original a264 GitHub blobs plus the exact previously tested edits preserved in the agent handoff. GitHub readback is required to confirm the stored bytes; final integration still requires execution.

## Required integration and remaining checks

Apply only the two code-file changes to the actual f794 plus main integration, retaining f794's current source-identity chain. Do not replace that chain with the older a264 receipts to make the check pass. The original a060 preFix observation remains historical and immutable.

Regenerate `project/mra/studies/internal-leak-study.json` against the final integrated documentation, since the MRA source list includes `inhabited-services-selection.md`. Then run the study's `--check` and its 6-test selected-water suite. Compare the MRA numerical receipt against the a264 result after accounting only for legitimately changed source identities and the new sourceCorrection reconciliation metadata. Any further difference needs explanation.

The integration owner separately handles BCR metadata and the service applicability documentation. The #1476 incoming-water adoption blocker does not resolve STR-FLOOR-PORTAL or restore coherent structural/support/movement acceptance. The previously empty adoption-blocker list is historical.

No canonical #1472 branch, main branch, review record, or claim was changed by this recovery preservation.
