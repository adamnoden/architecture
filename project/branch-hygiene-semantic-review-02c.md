# BRH-02C — compiler/computational semantic review

Semantic review only. This packet resolves the seven `compiler-computational` entries frozen by BRH-01C. It performs no salvage and authorises no deletion.

## Baseline and restart

The first read-only review pass began from `aead661ac4956fc90b2395e9f8532a345b815b91`. Before the durable record was frozen, DRW-03D / PR #181 merged and moved `main` to `a5fecb8d867efe944f26e8aa68e0987c96c8990c`.

DRW-03D added only the native publication ground-plan scene, its test and its audit record. It did not alter any reviewed branch head or the defining CF/CH/COA packet contracts used here. All seven mechanical comparisons were nevertheless recomputed against the moved `main` before classification.

Final review baseline: `a5fecb8d867efe944f26e8aa68e0987c96c8990c`.

- reviewed: **7**
- C: **7**
- D: **0**
- X: **0**
- salvage required: **0**
- review JSON SHA-256: `86327ddab3e07340d72979d8140f27e20545dbacb5d1b6345741eb5824861b43`

## Dispositions

| Branch | Mechanical state | Final | Core proof |
| --- | --- | --- | --- |
| `cf-01-contrast-fixture` | 18 ahead / 807 behind | **C** | defining fixture and acceptance test are byte-identical on current `main` |
| `ch-05-determinism-identity-provenance` | 9 / 710 | **C** | CH-05 README/test and core identity implementation are byte-identical |
| `ch-05-housekeeping-sync` | 3 / 709 | **C** | historical status/programme/maturity sync only; current authority has advanced |
| `ch-08-distillation-deletion` | 11 / 671 | **C** | CH-08 README/test are byte-identical; resulting compiler shape remains current |
| `coa-04-plan-section-successors` | 22 / 561 | **C** | COA-04 README/test are byte-identical; spatial output survives and evolved |
| `coa-05-topology-successors-final` | 5 / 560 | **C** | README/test and structural output implementation are byte-identical |
| `coa-06-output-integration` | 28 / 559 | **C** | packet contract and integrated build/generate/verify pipeline survive directly |

## CF-01 → C

The branch was the route by which the contrast fixture and reusable plan-slice architecture were first assembled. The strongest evidence is direct content identity rather than inference:

- `compiler/cf01/cf01.test.ts` is blob `a2f53fdef514a3de04272857d779dcbd4fa3da6c` on both branch and current `main`;
- `compiler/cf01/fixture.ts` is blob `4642a32e27ad2866a2fbe7cff762da3d8629d2cd` on both.

The plan-slice/reference-house adapter architecture introduced around that fixture was subsequently integrated and hardened on `main`. Its old STATUS/maturity edits are not missing capability.

**Final: C. No salvage.**

## CH-05 determinism / identity / provenance → C

The defining hardening packet survives directly:

- `compiler/ch05/README.md` — `4a55a89f7c8e07a3e2e687fa8933e07dbcef64d0` on branch and `main`;
- `compiler/ch05/ch05.test.ts` — `5e738bab208b1814b55f2e3d0635c1b68939adda` on both;
- `compiler/core/identity.ts` — `497e308dc522edd3988c6c4fce0f269635a03f9c` on both.

Reference House identity/provenance remains live compiler authority, with later hardening layered on top.

**Final: C. No salvage.**

## CH-05 housekeeping sync → C

This three-commit branch changes only `STATUS.md`, the compiler-hardening programme and project maturity state. It records a moment immediately after CH-05; current `main` has progressed through later CH phases and later project programmes. Replaying it would regress authoritative status rather than recover value.

**Final: C. No salvage.**

## CH-08 distillation / deletion → C

The distillation packet itself is still present byte-for-byte:

- `compiler/ch08/README.md` — `2704db9202175a1e577d8eb1b877a020c24e0437`;
- `compiler/ch08/ch08.test.ts` — `a5e7cf6e6b8ada88afd7893db265f9f0f8678032`.

The branch's deletion/distillation result is already embodied in the current compiler structure. Later work extends that result rather than replacing it with a competing implementation.

**Final: C. No salvage.**

## COA-04 → C

The packet contract is directly preserved:

- `compiler/coa04/README.md` — `3abdaf426ba7d2c7f0662057077dfe0821fce0c3`;
- `compiler/coa04/coa04.test.ts` — `3a2987621b9374ba62996a11ea08bf290f269ab9`.

The spatial output implementation remains in `compiler/reference-house/output/` and is subsequently extended by later COA and publication-drawing work. Historical generated SVGs are reproducible outputs, not stranded source authority.

**Final: C. No salvage.**

## COA-05 → C

The topology/structure successor survives directly:

- README/test blobs are unchanged from the branch;
- `compiler/reference-house/output/structure.ts` is blob `dd2f1ecf2aa3b69f61893638a4181dc409545d56` on both branch and current `main`.

**Final: C. No salvage.**

## COA-06 → C

This is the strongest preservation case in the group. The COA-06 README/test pair are byte-identical and the integrated Reference House output pipeline remains directly present. Among the branch-era output modules, `build.ts`, `generate.ts`, `verify.ts`, `spatial.ts`, `structure.ts`, `context.ts`, `generate-reports.ts` and `reports.ts` remain unchanged. `contract.ts` has evolved on later authority rather than disappearing.

The branch is therefore historical topology around a pipeline that is still live; its generated artefacts are products of that pipeline, not unique source requiring salvage.

**Final: C. No salvage.**

## Safety boundary

- No branch was deleted.
- No branch was rewritten.
- No content was salvaged.
- No repository setting was changed.
- The DRW lane was treated as concurrent protected work.
- These C classifications are semantic dispositions only; deletion remains gated to BRH-04.

## Exact next packet

**BRH-02D — G01 completion semantic review**, bounded to eight branches:

- `g01-completion-programme`
- `g01-d10-normative`
- `g01-d10s-specificity`
- `g01-d11-v01-freeze`
- `g01-d12-reference-house`
- `g01-d13-closeout`
- `g01-d8-falsification`
- `g01-d9-holdout`

BRH-02D remains semantic review only; no salvage or deletion.
