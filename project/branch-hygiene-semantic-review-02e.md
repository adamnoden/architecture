# BRH-02E — Reference House executable semantic review

Semantic review only. This packet resolves the six `reference-house-executable` entries frozen by BRH-01C. It performs no salvage and authorises no deletion.

## Baseline

- programme: issue #161
- review baseline: `75780890b2cfffa8489181ba23aaac96c5fe8d1a`
- open PRs at review start: **0**
- reviewed: **6**
- C: **6**
- D: **0**
- X: **0**
- salvage required: **0**
- review JSON SHA-256: `3753d1f05f938f60cb85dfeedb5c17838e8cbe11dc9ef03994c9032912e2ebe9`

## Result

These branches are successive implementation stages of the Reference House, not abandoned alternate systems. Current `main` preserves their resolved capabilities and then hardens or extends them.

| Branch | Mechanical state | Final | Core proof |
| --- | --- | --- | --- |
| `reference-house-phase5` | 12 ahead / 1332 behind | **C** | whole-house fixture and service-topology authority survive; service-zone candidate was explicitly admitted as canonical PAT-014 |
| `rh-c1` | 8 / 817 | **C** | fixture/model/drawings/drawing tests exact; compiler stages evolved |
| `rh-c2-structural-view` | 23 / 814 | **C** | RH-C2 fixture/tests exact; structure slice remains live and hardened |
| `rh-c3-service-view` | 29 / 813 | **C** | most wrapper contracts exact; service slice remains live; old barrel deliberately distilled |
| `rh-c4-boundary-view` | 36 / 812 | **C** | wrapper tests/fixture/proof boundary exact; boundary slice remains live |
| `rh-c5-target-calculations` | 21 / 811 | **C** | README/full acceptance test exact; calculation implementation evolved with explicit proof boundary |

## `reference-house-phase5` → C

Phase 5 established a whole-house coordination fixture, a service-topology run and an Accessible Vertical Service Zone candidate. Those ideas are not stranded:

- `docs/reference-house/whole-house-coordination-fixture.md` remains the same canonical fixture, with its status generalized from “Phase-5 coordination fixture” to current whole-house authority;
- `docs/reference-house/service-topology-run-01.md` remains the same canonical coordination run with later edits;
- the historical candidate page now explicitly declares itself a **superseded pre-admission record** and points to canonical `PAT-014 — Accessible Vertical Service Zone`;
- the admitted pattern is active and supported at `docs/patterns/accessible-vertical-service-zone.md`.

This is a particularly strong semantic supersession chain: candidate → trial → admission → canonical pattern. Replaying the Phase-5 branch would restore stale workflow state rather than recover missing design intent.

**Final: C. No salvage.**

## `rh-c1` → C

RH-C1 established the executable Reference House core and drawing parity. Current `main` retains byte-identical:

- `compiler/reference-house/drawings.test.ts` — `14f1283f…`;
- `compiler/reference-house/drawings.ts` — `b49870fb…`;
- `compiler/reference-house/fixture.ts` — `79392358…`;
- `compiler/reference-house/model.ts` — `3e729512…`.

The compiler entrypoints have evolved rather than disappeared: `compile.ts`, `derive.ts` and `generate.ts` now have later hardened blobs, while the same Reference House model/fixture/drawing authority remains live.

**Final: C. No salvage.**

## `rh-c2-structural-view` → C

RH-C2’s defining structural fixture and acceptance contracts survive byte-identically:

- drawing test — `5055689f…`;
- fixture — `d0d7e3d4…`;
- full RH-C2 test — `071270e0…`;
- structure-slice drawing — `8db98be4…`.

The structure slice itself remains current. Its compile/derive/model layers have evolved and RH-C2 gained an explicit proof boundary during hardening. That is capability strengthening, not loss.

**Final: C. No salvage.**

## `rh-c3-service-view` → C

RH-C3 is still recognisably the live service-view wrapper. Current `main` retains byte-identical README, authority, compile wrapper, drawing test, fixture, hardening test, proof boundary and full RH-C3 acceptance test. Generate/hardening internals evolved; the old `index.ts` barrel was deliberately removed during CH distillation while the capability remained.

**Final: C. No salvage.**

## `rh-c4-boundary-view` → C

RH-C4 follows the same pattern. Current `main` retains byte-identical README, drawing test, fixture, occurrence test, proof boundary and full RH-C4 acceptance test. Compile/generate/hardening have evolved; the obsolete barrel disappeared without loss of the boundary slice.

**Final: C. No salvage.**

## `rh-c5-target-calculations` → C

The target-calculation capability remains live. Current `main` retains the RH-C5 README and full acceptance test byte-identically. `compile.ts` and `method.ts` evolved under later hardening, and `proof-boundary.ts` was added explicitly. The calculation slice therefore has a stronger proof boundary than the historical branch, not a missing one.

**Final: C. No salvage.**

## Safety boundary

- No branch was deleted.
- No branch was rewritten.
- No content was salvaged.
- No repository setting was changed.
- These C classifications are semantic dispositions only; deletion remains gated to BRH-04.

## Exact next packet

**BRH-02F — pattern-language semantic review**, bounded to:

- `pattern-language-overhaul`
- `pattern-language-phase6-audit`
- `pattern-language-phase7`
- `pattern-language-phase7-migration`
- `pattern-language-phase8-crosswalk`

BRH-02F remains semantic review only; no salvage or deletion.
