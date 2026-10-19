# HFI-09D — Regression Locks

**Packet:** HFI-09D  
**Programme:** `docs/development/human-factors-low-friction-inhabitation-programme.md`  
**Execution plan:** `docs/development/human-factors-low-friction-inhabitation-execution-plan.md`  
**Owning issue:** #195  
**Baseline `main`:** `c0c12629ec21befc68cef778396b7bad51207bb7`

## Question

Do accepted stronger HFI targets need additional machine regression controls to prevent silent retreat to minimum-compliance geometry or stale publication output?

## Result

**No additional HFI-specific regression code is earned. The accepted 300 mm principal-stair decision is already protected by multiple independent existing controls.**

Adding another HFI-only assertion would duplicate the same source fact without increasing the chance of catching a real regression. More importantly, encoding the preference inside the Approved Document K method would corrupt the authority boundary HFI-09C just froze.

## Existing lock 1 — canonical RH-C5 observation

`compiler/rhc5/rhc5.test.ts` compiles the canonical Reference House and explicitly requires:

- going = **300 mm**;
- rise = `3300 / 18`;
- pitch ≈ **31.429565614838516°**;
- `2R+G ≈ 666.6666666666667 mm`.

A silent source retreat to 280 mm therefore changes the canonical observation and fails this test unless the test is deliberately changed.

This lock does **not** redefine the external Approved Document K method. The same test suite separately verifies that the encoded guidance going range remains 220–300 mm inclusive.

That separation is correct and must remain.

## Existing lock 2 — deterministic successor drawing/output

`compiler/coa04/coa04.test.ts` requires the current rendered successor plan to contain:

> `Going 300 mm · width target ≈1000 mm`

and separately requires the committed successor SVGs to be exact deterministic renderer outputs.

Therefore a current source/output mismatch cannot silently preserve an old 280 mm label while the semantic source says 300, or vice versa, without breaking the successor checks.

## Existing lock 3 — CH-00 frozen baseline

`compiler/ch00/reference-house-baseline.json` records the accepted semantic baseline including:

- `goingMm: 300`;
- pitch `31.42956561483852`;
- `twoRPlusGMm: 666.6666666666667`;
- exact fixture/source and committed artefact identities.

The corresponding CH-00 test family treats baseline movement as an explicit semantic event rather than an incidental regeneration.

This is valuable because a future intentional source change can still happen, but it cannot masquerade as a no-op refactor.

## Existing lock 4 — semantic compile/output identity

HFI-08B demonstrated this control in practice: changing the canonical stair source altered the successor compile identity, which forced deterministic regeneration of the identity-bearing output bundle and project data plate before `outputs:check` would pass.

Thus source semantics, generated output and recorded compile identity move together.

## Existing lock 5 — physical drawing proof boundary

The affected principal-section publication path was re-proved at literal scale after the 300 mm change. HFI-09A/09B then established that no accepted HFI geometry remained stale in publication/DRW.

This is not a unit-test replacement; it is a separate physical-output control at the representation boundary.

## Regression threats and current coverage

| Threat | Existing control | Additional HFI lock? |
|---|---|---|
| canonical stair source silently returns to 280 mm | RH-C5 canonical observation + CH-00 semantic baseline | no |
| renderer still labels/draws stale stair | COA-04 exact successor assertions + deterministic output check | no |
| source changes but generated bundle/data plate stays stale | semantic compile fingerprint + `outputs:check` | no |
| HFI preference is confused with statutory minimum | RH-C5 method range tests + proof-boundary/non-claims | no — extra threshold rule would be harmful |
| physical principal-section spread remains stale | HFI-08B DRW re-proof + HFI-09A/B reconciliation | no |
| N17/complete-action questions disappear | delivery module is canonical public requirement; not presently machine-representable | no compiler lock earned |
| laundry trade-off is silently declared solved | remains explicit `UNRESOLVED — MATERIAL TRADE-OFF` in HFI records/review brief | no numeric lock possible/earned |
| stairlift/future lift overclaim | explicit non-proof/no-target records + external-review handoff | no machine lock earned |

## Why not add `HFI_MIN_GOING = 300`

A standalone machine constant named as a human-factors minimum would be wrong in three ways:

1. HFI adopted 300 mm as a **preferred project target**, not a universal minimum;
2. the current Reference House already carries the selected 300 mm value in source authority;
3. a second threshold would invite drift between architectural selection, external-guidance method and HFI target semantics.

The correct regression is: **the selected house must remain what the owning source says it is, and a change to that selection must be explicit.** Existing controls already enforce that.

## Future lock trigger

Add a new regression control only if a later accepted HFI proposition becomes both:

- represented by controlled deterministic inputs; and
- vulnerable to silent retreat in a way not already caught by source/output/baseline tests.

A future real-project door/threshold/route model might eventually earn such a lock. The current virtual Reference House does not.

## Authority / maturity consequences

No code, threshold, schema, compiler target, publication source or maturity level changes in this packet.

The packet closes the regression-control question by proving that the accepted machine-representable HFI change is already multiply locked and that adding a new HFI threshold would weaken rather than strengthen authority semantics.

`HFI-09D → baseline c0c12629ec21befc68cef778396b7bad51207bb7 → audit accepted HFI machine/publication regressions → existing RH-C5 + COA-04 + CH-00 + output identity + physical-proof controls already prevent silent 300 mm/stale-output retreat → add no duplicate HFI threshold/test → no code/schema/maturity change → exact next packet HFI-10 — adversarial closeout`

**Exact next packet:** **HFI-10 — adversarial closeout.**
