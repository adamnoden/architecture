# HFI-09C — Computational Admission

**Packet:** HFI-09C  
**Programme:** `docs/development/human-factors-low-friction-inhabitation-programme.md`  
**Execution plan:** `docs/development/human-factors-low-friction-inhabitation-execution-plan.md`  
**Owning issue:** #195  
**Baseline `main`:** `10443671d8f08659f3f0e9feeb5fa0e247040e92`

## Question

Which accepted HFI propositions are machine-checkable from controlled source inputs at the current computational boundary, and which must remain architectural, delivery-stage or external-review obligations?

## Result

**No new computational proof family is earned. HFI does not create RH-C6.**

The existing Reference House/compiler model already machine-checks the HFI facts that are genuinely represented as controlled source geometry. The stronger HFI questions that motivated the programme depend on finished interfaces, products, occupied action sequences, user/site facts or balanced design judgement that the current semantic model intentionally does not claim to know.

Expanding the compiler merely to turn those questions from `NOT-MODELLED` into machine fields would be proof-scope inflation, not stronger evidence.

## Admitted now

### 1. Canonical Reference House stair source

The Reference House source controls:

- 18 risers;
- flight rise groups 6 / 6 / 6;
- **300 mm going**;
- five goings per flight;
- clear-width target as a source reservation;
- stair reservation range.

The compiler derives from controlled source:

- rise ≈ 183.33 mm;
- flight run = 1500 mm;
- landing datums;
- `2R+G ≈ 666.67 mm`;
- pitch ≈ 31.43°.

These are legitimate machine facts because the source model actually owns the inputs and the derivation is deterministic.

### 2. RH-C5 bounded external-guidance correspondence

RH-C5 may continue to machine-check the represented private-stair rise, going, pitch and `2R+G` against its explicitly versioned Approved Document K numeric method.

This remains exactly what the existing proof boundary says:

- selected numeric method correspondence: `MACHINE-CHECKED`;
- Approved Document guidance coverage: `BOUNDED-METHOD-ONLY`;
- release-grade compiler target: `NOT-ESTABLISHED`;
- Building Regulations compliance: `NOT-PROVED`;
- whole-building technical adequacy: `EXTERNAL-NOT-PROVED`.

HFI does not alter those semantics.

### 3. Deterministic source/output propagation

Current machine infrastructure may continue to prove that controlled stair/source facts propagate deterministically into committed computational and drawing successors. This is source/output parity, not an ergonomic claim.

## Explicitly not admitted

### HFI preferred 300 mm going as a universal calculation method

The current house uses 300 mm because HFI selected it as a project preference after a bounded full-system comparison.

**Do not rewrite the Approved Document K method to `min = 300` or otherwise encode the HFI preference as if it were the external guidance rule.**

The existing method correctly accepts the external private-stair going range it represents. The project preference belongs to Reference House source authority and HFI/project-target provenance.

### Complete-action verification / N17

N17 asks whether repeated-use routes, controls and interfaces work as complete occupied actions. Current compiler inputs do not represent enough of the following to make that a legitimate generic machine proof:

- finished frames / stops / ironmongery;
- strings, guards, handrails and actual clear envelopes;
- product operating forces and feedback;
- wet-handed / occupied-handed sequences;
- sanitaryware and support geometry;
- appliance open states;
- furniture/object swept paths at sufficient detail;
- task staging / set-down / regrip behaviour;
- user-specific or temporary capability states.

N17 therefore remains a **delivery verification family**, not a compiler target.

### Finished stair human-use adequacy

RH-C5 already refuses to claim:

- headroom adequacy;
- landing adequacy;
- handrail/guard adequacy;
- construction tolerance/workmanship compliance;
- accessibility compliance;
- fire/means-of-escape compliance.

HFI-09C preserves those non-claims. The fact that the arithmetic passes cannot prove the complete occupied stair.

### Stairlift compatibility

Nominal width is insufficient. Rail/chair family, parking, transfer, residual route, door conflicts and power are product-specific later facts.

**Not admitted.**

### Through-floor lift reservation

HFI has no adopted target for a reservation.

**Not admitted.**

### Laundry trade-off

The burden is real but the correct remedy depends on a balanced comparison across task frequency, storage/staging, moisture/failure geography, ventilation/drying, noise/vibration, services, structure, replacement and garden/dirty-work relationships.

This is architectural judgement informed by later evidence, not a current scalar compiler rule.

**Not admitted.**

### Real-site approach / set-down / gradient

The Reference House has no real site.

**Not admitted.** A synthetic site or setting diagram must not manufacture site accessibility facts merely to satisfy a checker.

### General HFI principles

“Design for foreseeable human variance”, “test complete actions” and “correct the causal bottleneck” are architectural/delivery rules. They are not truth-valued compiler invariants without a much richer and separately justified model.

**Not admitted as machine proofs.**

## Why no RH-C6

A new computational family would currently have to do one of three bad things:

1. pretend missing product/site/user facts are known;
2. reduce multi-variable human-use judgement to pseudo-precise scalar thresholds; or
3. duplicate delivery-stage verification under a weaker virtual model.

None is earned.

If a future project develops a reusable, well-evidenced semantic model for a specific human-factors condition—e.g. a bounded door-operating assembly or a real-site route model—that capability should enter through a separately scoped computational gate with explicit authority, applicability and non-claims. It should not be smuggled into HFI closeout.

## Computational admission register

| HFI proposition / fact | Current machine status | Route |
|---|---|---|
| RH principal stair going = 300 mm | represented controlled source | admitted |
| 18 risers / 3×6 / five goings per flight | represented controlled source | admitted |
| rise / run / pitch / `2R+G` derivation | deterministic derivation | admitted |
| AD K numeric-method correspondence | bounded RH-C5 method | admitted with existing non-claims |
| HFI `300 mm preferred` as universal rule | project preference, not external method | not admitted |
| finished stair human-use adequacy | insufficient finished inputs | delivery / specialist review |
| stairlift compatibility | product-specific inputs absent | not admitted |
| complete-action / N17 | insufficient semantic model | delivery |
| laundry topology decision | unresolved multi-system trade-off | architecture / review |
| future through-floor lift | no adopted target | not admitted |
| real-site approach | site absent | real-project/site |
| general HFI principles | architectural reasoning | not compiler proof |

## Authority / maturity consequences

This packet adds no compiler code, schema field, target, proof family or maturity claim.

It confirms that the existing machine boundary is sufficient for accepted represented HFI facts and that broader human-factors proof remains correctly outside the current compiler.

`HFI-09C → baseline 10443671d8f08659f3f0e9feeb5fa0e247040e92 → audit accepted HFI propositions against current controlled semantic inputs → retain canonical stair + bounded RH-C5 correspondence as machine-checkable; reject RH-C6 / N17 / laundry / lift / site / complete-action proof inflation → no code/schema/maturity change → exact next packet HFI-09D — regression locks`

**Exact next packet:** **HFI-09D — regression locks.**
