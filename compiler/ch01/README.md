# CH-01 — total / fail-closed compilation

**Gate:** CH-01  
**Baseline:** CH-00 merge `7c0849907a2398c15c1280a72e94345bcc3804a6`  
**Computational maturity:** M3  
**Reference House capability sequence:** closed at RH-C5; no RH-C6 authorised

CH-01 hardens expected invalid-input behaviour. It does not change architectural source authority, canonical Reference House conclusions, proof boundaries or technical claims.

## Boundary established

The generic plan and structural compilers now separate source-integrity failure from derivation strongly enough that known malformed references cannot escape as incidental exceptions.

For both domains:

1. source/upstream integrity diagnostics run first;
2. any `FAIL` at that prerequisite stage prevents normal derivation;
3. the compiler returns a deterministic `FAIL` result with sorted diagnostics and deliberately empty derived collections;
4. only a source that clears the prerequisite gate enters ordinary derivation and derived/integration validation.

The empty derived collections in a prerequisite-failed result are a fail-closed sentinel, not substitute architectural facts. Consumers must treat the result status as authoritative and must not interpret those empty collections as a valid compiled model.

### Plan

The existing plan source validator already identifies the references that can make `derivePlanSlice` throw: unknown plan lines, levels, opening families and opening hosts. CH-01 now stops after those source diagnostics rather than calling derivation anyway.

Non-finite geometric values remain controlled compiler failures through derived validation. They do not escape as exceptions.

### Structure

The structural source validator previously did not validate the architectural plan-line references used by structural lines, support paths, span rectangles and reaction nodes even though the derivation helpers require them. CH-01 adds explicit `STRUCTURAL_PLAN_LINE_MISSING` diagnostics for those references and prevents structural derivation whenever source/upstream integrity has failed.

A failed upstream plan therefore produces a deterministic failed structural result instead of allowing structural derivation to walk an invalid/partial plan.

## Service and boundary audit

No equivalent throw path was found in `service-slice/derive.ts` or `boundary-slice/derive.ts`. Their derivation functions are deterministic normalisation/graph calculations over the typed source and do not use throwing required-reference helpers. Their compilers already turn broken node/route/network/crossing/carrier/system/transition references into controlled diagnostics, and the existing RH-C3/RH-C4 adversarial tests exercise those paths.

CH-01 therefore does not move or rewrite those domains merely to make their file shape resemble plan/structure. That broader architecture work belongs, if still justified, to later CH gates.

## Exceptions that remain legitimate

Normal compiler entry points are the fail-closed contract. Low-level derivation helpers still contain programmer-error exceptions for violated internal preconditions. Calling a derivation helper directly with a source that has not passed its compiler's source-integrity gate is outside the normal compilation contract.

CH-01 does not convert every impossible internal state into user-data diagnostics; doing so would hide programmer defects and exceed this gate.

## Adversarial gate

`compiler/ch01/ch01.test.ts` establishes that:

- a plan source with a missing plan-line reference returns `FAIL` rather than throwing;
- a non-finite plan coordinate remains a controlled `FAIL`;
- a structural source with a missing architectural plan-line reference returns `FAIL` rather than throwing;
- a failed plan compile propagates through structure without structural derivation.

The CH-00 semantic manifest remains the regression authority for valid canonical Reference House behaviour and generated artefact identity.

## Non-changes

CH-01 does not:

- flatten the RH-C2 → RH-C5 orchestration chain;
- remove duplicate plan compilation;
- relocate historical runtime modules;
- centralise diagnostics/status/tolerance helpers;
- introduce branded cross-domain IDs;
- change units, provenance or immutability policy;
- change generator policy;
- increase computational maturity;
- add any architectural or engineering capability.

Those are later-gate questions.
