# CH-03 — single-pass Reference House compiler

**Gate:** CH-03  
**Baseline:** CH-02 merge `6d1341aae34d88f581956b82d6733ef1dcf83239`  
**Computational maturity:** M3  
**Reference House capability sequence:** closed at RH-C5; no RH-C6 authorised

CH-03 replaces the historical nested RH-C2 → RH-C5 production path with one coherent Reference House orchestration result. The historical gate wrappers remain intact as regression/provenance surfaces.

## Result

The canonical production entrypoint is now:

```text
compileReferenceHouseSystem(source)
```

It returns direct domain state:

```text
status
house
plan
structure
services
boundary
calculations
coordination
floorZoneDepth
diagnostics
proof
```

There is no `c4.c3.c2...` production-result archaeology.

The compile path is:

```text
ReferenceHouseSource
  ↓
adapt plan source
  ↓
compile plan                 [once]
  ├─→ derive Reference House from that same plan result
  ├─→ compile structure      [once]
  │     ↓
  ├─→ compile services       [once]
  │     ↓
  ├─→ compile boundary       [once]
  │
  └─→ selected calculation   [once]
```

The plan result used by Reference House derivation is the same object passed to structure, services and boundary. The duplicate plan compilation present in every historical RH-C2-or-later path is therefore absent from the canonical path.

## Historical wrappers

`compiler/rhc2`, `rhc3`, `rhc4` and `rhc5` remain useful evidence. Their compile wrappers still express the original gate chronology and their tests continue to prove the bounded claims that each gate originally established.

They are no longer the canonical production orchestration architecture. CH-03 deliberately avoids rewriting every historical gate around the new result shape because that would add migration churn without increasing semantic confidence.

`compiler/ch03/ch03.test.ts` compares the new canonical result directly against the complete historical RH-C2 → RH-C5 chain for the canonical source and for a known architectural REVIEW mutation. The projections are deeply equal for status, every domain result, calculations, boundary coordination, floor-zone depth and proof boundaries.

## Coordination dependencies

CH-03 removes two pieces of result archaeology from live coordination code without changing their rules:

- Reference House boundary coordination now receives the actual upstream values it consumes — `plan` and `services` — rather than an RH-C3 wrapper only so it can reach `c3.c2.plan` and `c3.services`.
- the private-stair calculation input can now be derived directly from the coherent Reference House result rather than requiring an RH-C4 wrapper only so it can reach `c4.c3.c2.house`.

Service and boundary hardening logic itself remains unchanged in meaning. CH-03 does not attempt the broader placement/distillation work reserved for later hardening.

## Frozen baseline ownership

The CH-00 semantic/artefact test now compiles the canonical fixture through `compileReferenceHouseSystem`.

This makes the single-pass compiler the controlled path for the frozen Reference House semantic baseline rather than merely an alternate implementation. The same CH-00 manifest continues to assert:

- canonical statuses;
- proof boundaries;
- diagnostic-code sets;
- selected derived values/counts;
- exact hashes and byte-for-byte regeneration of all six committed SVG artefacts.

No baseline value was changed for CH-03.

## Mechanical single-pass check

The CH-03 test also inspects the canonical orchestration source and requires exactly one call to each generic compile operation:

- plan;
- structure;
- services;
- boundary;
- selected calculation.

It requires one `compileReferenceHouseFromPlan` call and rejects calls to the historical RH-C2/RH-C3/RH-C4/RH-C5 compile wrappers or `.c2/.c3/.c4` result access in the production orchestration file.

This is intentionally a small architecture contract rather than an orchestration framework.

## Deliberate non-moves

CH-03 does not:

- change generic domain boundaries established by CH-02;
- redesign IDs, units, numeric tolerance or readonly policy;
- add provenance/fingerprinting machinery;
- centralise diagnostics/status helpers;
- delete the historical RH-C gates;
- change drawing/generation policy;
- add a technical method or building claim;
- increase computational maturity;
- create RH-C6.

## Preservation contract

CH-03 passes only if:

- CH-00 semantic values, diagnostic sets, proof boundaries and six SVG identities remain exact through the new canonical path;
- CH-01 fail-closed behaviour remains green;
- CH-02 dependency boundaries remain green;
- CF-01 remains green;
- every historical RH-C gate remains green;
- the new canonical result is deeply equivalent to the historical RH-C2 → RH-C5 result projection;
- M3 remains unchanged and no RH-C6 appears.

## Next gate

After CH-03 passes, **CH-04 — strengthen representation — is NEXT**. CH-04 owns selective branded IDs, unit retention, explicit tolerance policy and practical readonly/immutability hardening. None of that work is pre-authorised by CH-03.
