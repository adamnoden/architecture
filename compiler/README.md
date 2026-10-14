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
- RH-C, CF, CH and COA regression/gate identities;
- `HK-RH-COMPILE-1` and other stable semantic/provenance identifiers.

Those names describe domains, operations or durable history. Renaming them for thematic consistency would add churn without adding architectural or software meaning.

Likewise, **metamorphosis is not a compiler primitive**. The software does not attempt to model every future transformation of a house. It checks a deliberately bounded set of architectural states, relationships and obligations for which deterministic representation has earned its place.

## Current authority

Compiler Hardening CH-00 through CH-08 is complete. The hardening programme strengthened fail-closed behaviour, runtime boundaries, single-pass compilation, representation, determinism, identity/provenance, test quality, tooling and final codebase distillation while preserving the frozen Reference House semantics and proof boundaries.

Compiler Output Architecture COA-00 through COA-06 is the downstream inspection/output programme over that same controlled compile. It does not add building capability or technical authority. It separates machine identity, non-spatial semantic reports and spatial inspection drawings, while preserving the six CH-frozen RH-C1–RH-C4 SVGs as historical executable evidence.

Computational maturity remains **M4 — Internally validated / controlled** at the same bounded scope. There is no CH-09, RH-C6 or standing COA-07.

## Canonical Reference House output surface

The canonical production source remains `createReferenceHouseSource()` and the canonical production compile remains `compileReferenceHouseSystem(source)`.

The successor human-inspection outputs are downstream of that single-pass result:

- `docs/reference-house/generated/ground-floor-plan.svg`;
- `docs/reference-house/generated/first-floor-plan.svg`;
- `docs/reference-house/generated/principal-section.svg`;
- `docs/reference-house/generated/first-floor-structure.svg`;
- `docs/reference-house/generated/service-register.md`;
- `docs/reference-house/generated/boundary-register.md`.

`compiler/reference-house/output/` owns their output contract, shared build path and deterministic renderers. The machine-readable `docs/reference-house/generated/output-manifest.json` binds each successor artefact to the canonical compile fingerprint, renderer version and content hash.

Normal commands are:

```text
npm run outputs:generate   # regenerate the complete successor family + manifest
npm run outputs:check      # verify committed outputs without mutating them
npm run check              # canonical repository health command
```

Output medium follows information character rather than compiler-domain symmetry: metric/spatial views use SVG; service and boundary registers use generated Markdown. Publication figures remain downstream editorial work rather than compiler output authority.

For current computational authority, programme history and proof boundaries, use [`../docs/computational/README.md`](../docs/computational/README.md), [`../docs/computational/compiler-hardening-programme.md`](../docs/computational/compiler-hardening-programme.md), [`../docs/computational/compiler-output-architecture-programme.md`](../docs/computational/compiler-output-architecture-programme.md) and [`../STATUS.md`](../STATUS.md).
