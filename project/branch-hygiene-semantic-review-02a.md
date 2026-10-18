# BRH-02A — prototype/research semantic review

Semantic review only. This packet resolves the two `prototype-research` entries frozen by BRH-01C. It performs no salvage and authorises no deletion.

## Baseline

- programme: issue #161
- current main at review start: `00a6f4c986b2fbbd2c71efca87bc99f8527dcc0f`
- open PRs at review start: **0**
- bounded branches reviewed: **2**
- final C: **2**
- final D: **0**
- final X: **0**
- review JSON SHA-256: `63c3d4a62ddafd637e68c11517d3dcdc9c4d0cb52980ed8978b35aef908e8c8e`

## Restart

DRW-03B PR #179 merged during the final lease and moved `main` from `cf99b2bf74cc1e4553b2a74a6cfd381b2739f73c` to `00a6f4c986b2fbbd2c71efca87bc99f8527dcc0f`. The intervening merge added only publication-plan source, tests and its audit record. Neither reviewed source head nor any P03/workmanship authority used here changed, so the semantic review was recomputed against the moved main and the C/C result was retained.

## Dispositions

| Branch | Head | Mechanical state | Final | Disposition |
| --- | --- | --- | --- | --- |
| `prototype-p03-engineer-review-brief` | `1fe68d1f4da1531cc273573ea098709e3d6a1302` | diverged; 1 ahead / 1204 behind; 1 unique branch-only commit | **C** | useful intent is superseded by current P03 authority; no salvage required |
| `workmanship-robustness` | `a049e8da6cd9133dcbbb654e2fc703a1c5baf712` | diverged; 20 ahead / 1455 behind; 20 unique branch-only commits | **C** | semantic contribution has been reimplemented and evolved throughout current Ovid’s House authority; no salvage required |

## `prototype-p03-engineer-review-brief` → C

The branch contains one branch-only commit adding `docs/prototypes/p03-floor-edge-engineer-review-brief.md`. The document is a competent preparatory options-study brief, but it is no longer the project authority.

Its durable ideas survive on `main`:

- the ordinary certified hanger is the baseline to beat;
- gravity support, joist stability, wall restraint, diaphragm action, movement, fire/acoustic closure, durability, tolerance, inspection and repair are allocated explicitly rather than bundled accidentally;
- direct/seated bearing remains a comparator rather than an assumed answer;
- a bespoke shoe/ledge survives only if it earns a material whole-life advantage;
- engineering precedes physical structural prototyping;
- a conventional result is explicitly a successful project outcome.

Current authority is stronger and more current:

- `docs/prototypes/p03-floor-edge-engineering-brief.md` uses the current Reference House geometry (`12.0 × 10.8 m`, `3.6 × 4.0 m` court, 350 mm floor/ceiling zone and current span cases), current RH authority and explicit `P03-E-*` outcome/rewind classes;
- `docs/prototypes/p03-floor-edge-test-protocol.md` separately controls P03-A option reduction and the P03-B specimen gate, including tolerance trials, representative-installer testing, engineer-defined loading and repair evidence;
- current structural coordination and seated-floor research remain the owning context.

The stale branch still carries HSA naming, superseded `12.6 × 11.4 m` / `3.6 × 3.6 m` geometry and older source/product framing. Merging or salvaging it would create a second, weaker P03 authority.

### Issue #30 disposition

Issue #30 remains **open**. It requires the actual competent structural-engineer response, selected/rejected connection families, any RH rewind and a P03-B release/unnecessary decision. The stale branch is a preparatory review brief, not that engineer response, so it neither closes nor satisfies #30.

**Final classification: C — unique branch content, semantically superseded by current authority. No salvage.**

## `workmanship-robustness` → C

The branch is a 20-commit integration campaign. Its contribution is not absent from `main`; it became part of the current project system and was subsequently edited into Ovid’s House form.

Current authority preserves and develops the branch’s key propositions:

- `docs/research/workmanship-robustness.md` carries the definition, ordinary-competence target, acceptable/correctable/out-of-range distinction, “Give variation somewhere to go”, tolerance strategy, buildability, mistake-proofing, human factors, workmanship-of-risk/certainty and representative-installer testing;
- `docs/manuscript/part-ii.md` makes workmanship robustness part of the designed-interface argument and carries the tolerance hierarchy and precision/workmanship allocation;
- `docs/development/manufacturing-strategy.md` allocates precision and craft, defines adjustment/remediation and keeps manufacture proportional rather than ideological;
- `docs/development/tectonic-prototype-programme.md` makes assembly robustness one of the common prototype acceptance categories;
- `docs/delivery/riba-implementation-brief-template.md` encodes tolerance strategy, representative-installer trials and pre-concealment inspection as project controls;
- `docs/reference-house/tectonic-architectural-language.md` makes architectural depth a real tolerance-capacity device while forbidding trim from hiding out-of-range work.

The branch’s older Long-Life House naming and earlier publication structure are therefore historical implementation state, not stranded authority. There is no coherent residue worth salvaging into `main`.

**Final classification: C — unique branch content, semantically reimplemented/evolved on current main. No salvage.**

## Safety boundary

- No branch was deleted.
- No branch was rewritten.
- No content was salvaged from either reviewed branch.
- No repository setting was changed.
- These C classifications are semantic dispositions only; deletion remains gated to BRH-04.

## Exact next packet

**BRH-02B — infrastructure/tooling semantic review**, bounded to:

- `project-integrity-refactor`
- `public-url-phase-1`

Stop after that packet’s semantic dispositions; no salvage or deletion in BRH-02B.
