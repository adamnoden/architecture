# Metamorph Compiler

**Metamorph Compiler** is the executable machinery under `compiler/`.

It sits inside a deliberately bounded hierarchy:

```text
Ovid’s House
    ↓
House Kernel
    ↓
Metamorph Compiler
    ↓
compiled architectural state + diagnostics + bounded evidence
```

**Ovid’s House** is the architectural research project. **House Kernel** is the formal architectural/computational system used where facts, relationships, invariants, obligations and proof boundaries can legitimately be made explicit. **Metamorph Compiler** is the software that compiles and checks those representations.

A successful compile establishes only the claims owned by the relevant supported domain and proof contract. It is not architectural merit, engineering adequacy, regulatory approval or a building-release certificate.

## What `compiler/` owns

This tree owns executable source, tests, deterministic renderers, proof fixtures and local implementation contracts.

It does **not** own:

- the public architectural proposition — see [`../docs/manuscript/`](../docs/manuscript/);
- pattern validity or architectural grammar — see [`../docs/patterns/`](../docs/patterns/) and [`../docs/grammar/`](../docs/grammar/);
- Reference House architectural decisions merely because they are represented — see [`../docs/reference-house/`](../docs/reference-house/);
- current project-wide status — see [`../STATUS.md`](../STATUS.md);
- publication layout/build authority — see [`../publication/`](../publication/).

Local chapter, RH-C and COA READMEs define narrower proof contracts where those distinctions are materially useful. Their packet names are durable provenance, not a live roadmap.

## Naming boundary

`Metamorph Compiler` is the human-facing system name. Existing implementation names such as `compiler/`, `compileReferenceHouseSystem()`, RH-C, CH and COA identities remain descriptive technical/provenance names rather than a vocabulary that must be themed for consistency.

Metamorphosis is not itself a compiler primitive. The software checks a bounded set of architectural states, relationships and obligations for which deterministic representation has earned its place.

## Canonical Reference House compile

The controlled Reference House source is compiled through the canonical Reference House system path rather than through parallel authored projections.

Human-readable semantic inspection outputs are emitted under [`../docs/reference-house/generated/`](../docs/reference-house/generated/). The output contract and deterministic renderers live under `compiler/reference-house/output/`, and the generated manifest binds successor artefacts to compile/render identities.

The generated inspection family is downstream evidence for human checking. It is not architectural source authority and it is not a construction drawing set.

## Ordinary workflow

Use [`../package.json`](../package.json) as command authority.

```sh
npm run outputs:generate   # regenerate the complete semantic-inspection family + manifest
npm run outputs:check      # verify committed generated outputs without mutating them
npm run check              # canonical repository-health entry point
```

Change the owning source or renderer first, then regenerate. Do not patch a generated artefact to hide a source/model defect.

Publication drawings are a separate representation boundary. Their authority/proof records live in [`../docs/publication/`](../docs/publication/) and their build/layout machinery under [`../publication/`](../publication/).

## Proof boundary

The compiler may prove deterministic relationships that have explicit source authority, supported-domain scope and encoded checks. It cannot manufacture missing engineering, building-physics, regulatory, product or professional evidence.

A machine-checked weak assumption remains a weak assumption. Missing evidence should remain unsupported or unresolved rather than being replaced by a plausible value.

The computational conceptual model and its limits are documented in [`../docs/computational/README.md`](../docs/computational/README.md).

## Targets, jurisdiction and deployment

The separate DPL programme is establishing how external targets, jurisdiction, site evidence, scenarios and deployment results should relate to the controlled architectural proposition.

Nothing in this README implies that a release-grade site/jurisdiction deployment compiler already exists. Such capability should enter `compiler/` only when the owning DPL/evidence work creates a concrete deterministic obligation worth implementing.

For present project state, maturity and active programme gates, use [`../STATUS.md`](../STATUS.md).
