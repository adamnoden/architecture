# Metamorph Compiler

**Metamorph Compiler** is the human-facing name for the executable machinery under `compiler/`.

It sits inside a deliberately simple hierarchy:

```text
Ovid’s House
    ↓
House Kernel
    ↓
Metamorph Compiler
    ↓
compiled architectural state + diagnostics + bounded evidence
```

**Ovid’s House** is the architectural research project. **House Kernel** is its formal architectural/computational system: the bounded facts, relationships, invariants, obligations and proof boundaries that can legitimately be expressed explicitly. **Metamorph Compiler** is the software that compiles and checks those representations.

The names do not widen authority. A successful compile establishes only the claims owned by the relevant supported domain and proof boundary. It is not architectural merit, engineering adequacy, regulatory approval or a building-release certificate.

## Naming boundary

`Metamorph Compiler` is a system name, not a vocabulary migration through the source tree.

The implementation deliberately retains ordinary, descriptive names such as:

- `compiler/`;
- `compileReferenceHouse()`;
- `compile.ts`;
- `plan-slice`, `structure-slice`, `service-slice`, `boundary-slice` and `calculation-slice`;
- RH-C, CF and CH regression/gate identities;
- `HK-RH-COMPILE-1` and other stable semantic/provenance identifiers.

Those names describe domains, operations or durable history. Renaming them for thematic consistency would add churn without adding architectural or software meaning.

Likewise, **metamorphosis is not a compiler primitive**. The software does not attempt to model every future transformation of a house. It checks a deliberately bounded set of architectural states, relationships and obligations for which deterministic representation has earned its place.

## Current authority

Compiler Hardening CH-00 through CH-08 is complete. The hardening programme strengthened fail-closed behaviour, runtime boundaries, single-pass compilation, representation, determinism, identity/provenance, test quality, tooling and final codebase distillation while preserving the frozen Reference House semantics and proof boundaries.

Computational maturity is **M4 — Internally validated / controlled** at that bounded scope. There is no CH-09 and no standing RH-C6.

For current computational authority, programme history and proof boundaries, use [`../docs/computational/README.md`](../docs/computational/README.md), [`../docs/computational/compiler-hardening-programme.md`](../docs/computational/compiler-hardening-programme.md) and [`../STATUS.md`](../STATUS.md).
