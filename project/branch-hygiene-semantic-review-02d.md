# BRH-02D — G01 completion semantic review

Semantic review only. This packet resolves the eight G01 completion-stage entries frozen by BRH-01C. It performs no salvage and authorises no deletion.

## Baseline

- programme: issue #161
- review baseline: `3f8103c638249e2dbbf257edefd56e111953321f`
- open PRs at review start: **0**
- reviewed: **8**
- C: **8**
- D: **0**
- X: **0**
- salvage required: **0**
- review JSON SHA-256: `efea146f54d3a75e4ac81a4046c4421a4e8e40682e752ca7038770934a2ecb99`

## Result

The eight branches are not eight competing grammars. They are historical stage heads from one bounded completion sequence. Current `main` contains the resolved products of that sequence, usually byte-for-byte; where the current file differs, the change is deliberate evolution from workflow-stage wording into current controlled-authority wording.

| Branch | Mechanical state | Final | Core proof |
| --- | --- | --- | --- |
| `g01-completion-programme` | 2 ahead / 653 behind | **C** | completion programme preserved byte-identically |
| `g01-d8-falsification` | 5 / 652 | **C** | D8 result preserved byte-identically |
| `g01-d9-holdout` | 2 / 651 | **C** | D9 result preserved byte-identically |
| `g01-d10-normative` | 2 / 650 | **C** | D10 reduction preserved byte-identically |
| `g01-d10s-specificity` | 4 / 649 | **C** | programme, frozen register and validation result all byte-identical |
| `g01-d11-v01-freeze` | 2 / 648 | **C** | same canonical G01 v0.1 evolved in place from stage wording to controlled specification |
| `g01-d12-reference-house` | 3 / 647 | **C** | same RH conformance PASS evolved in place into current authority wording |
| `g01-d13-closeout` | 4 / 646 | **C** | adversarial closeout preserved byte-identically |

## Preserved stage evidence

Direct blob identity on current `main` includes:

- completion programme — `f24182bad52bae43b014f5e5dc9e3c8a8b6a085b`;
- D8 falsification result — `f38d7ceff8017be72e400c0751dddfc67b260e2d`;
- D9 held-out validation — `f496164a8e8cbe6fccaefc21ad162665b66db8c8`;
- D10 normative reduction — `0d99600f58174d0b53953f6a5f0b76e7c362b6b3`;
- D10-S programme — `06d77dd637a7f2c9aea3f9b06ebfb4de32fa5136`;
- D10-S frozen register — `8d51a4e98a6bb5f89114648b40176b5baba1478c`;
- D10-S validation result — `267075cb74ea215979f2f7249b61b45e23ba717c`;
- D13 adversarial closeout — `ad69c7ee0ff57d8a47833d1f39923009920703df`.

Those exact matches establish that the key evidence products were not merely paraphrased or accidentally approximated later; they remain in the repository.

## D11 and D12 evolution

D11 and D12 are the two places where exact byte identity would be the wrong target.

`g01-d11-v01-freeze` froze `docs/grammar/g01-v0.1.md` with stage-facing status **“FROZEN D11 RELEASE”**. Current `main` retains the same canonical specification path but presents it as a **controlled specification**. The branch blob `894290f…` has therefore evolved to current blob `e56d40f…`. D12 and D13 subsequently validate and close the same baseline. Reinstating the branch file would reintroduce process history into current authority rather than recover design content.

`g01-d12-reference-house` similarly introduced the Reference House conformance trial. Current `docs/reference-house/g01-v0.1-conformance-d12.md` keeps the same **PASS at coordinated virtual-design scope**, but its title/status framing has been distilled from D12 workflow language into current conformance authority. Branch blob `4d0d21f…` evolved to current blob `2a63c8f…`.

This is exactly the desired project posture: retain the resolved work, not the scaffolding by which it was resolved.

## Branch-by-branch disposition

### `g01-completion-programme` → C
The programme document itself remains byte-identical. The branch README edit was an early navigation/programme-state change now superseded by the completed sequence.

### `g01-d8-falsification` → C
The controlled falsification result remains exact on `main`, along with its evidence figures. Later stages consume its PASS rather than replace it.

### `g01-d9-holdout` → C
The held-out validation result remains exact on `main`; later normative reduction depends on it.

### `g01-d10-normative` → C
The normative reduction remains exact. Its temporary D11 block is resolved by D10-S, whose evidence is also preserved.

### `g01-d10s-specificity` → C
All three defining artefacts — programme, candidate register and validation result — remain exact. Their successful specificity recovery is incorporated into G01 v0.1.

### `g01-d11-v01-freeze` → C
The canonical G01 v0.1 specification survives and has deliberately evolved in presentation. The stage branch is not a missing alternate grammar.

### `g01-d12-reference-house` → C
The Reference House conformance PASS survives as current authority, with workflow-stage language distilled away.

### `g01-d13-closeout` → C
The adversarial closeout remains byte-identical and records retention of G01 v0.1 at M4 internal scope. STATUS/README/maturity edits on the branch are historical project state.

## Safety boundary

- No branch was deleted.
- No branch was rewritten.
- No content was salvaged.
- No repository setting was changed.
- These C classifications are semantic dispositions only; deletion remains gated to BRH-04.

## Exact next packet

**BRH-02E — Reference House executable semantic review**, bounded to six branches:

- `reference-house-phase5`
- `rh-c1`
- `rh-c2-structural-view`
- `rh-c3-service-view`
- `rh-c4-boundary-view`
- `rh-c5-target-calculations`

BRH-02E remains semantic review only; no salvage or deletion.
