# Computational track

The computational track asks a narrow question within Ovid’s House:

> **Which architectural relationships can be represented strongly enough that invalid arrangements, unresolved obligations or missing evidence are exposed deterministically?**

**House Kernel** is the formal architectural/computational system used where facts, relationships, invariants, obligations and proof boundaries can legitimately be explicit. **Metamorph Compiler** is the implementation under `compiler/` that compiles and checks those representations.

The computational system is deliberately narrower than the architecture. Architectural judgement is not converted into machine rules merely to make the model look complete.

## What this area owns

`docs/computational/` owns the conceptual and evidential record for executable architecture:

- semantic modelling and supported-domain boundaries;
- validity, obligations and fail-closed behaviour;
- evidence/provenance contracts;
- bounded calculation-method reasoning;
- compiler research and hardening records;
- output/proof architecture and the limits of deterministic checks.

Executable TypeScript, tests and renderers live in `compiler/`. Current project-wide status lives in `STATUS.md`.

## Demonstrated capability

At its bounded scope, the current system can represent and check selected relationships across:

- plan geometry and spatial relationships;
- qualitative structural topology;
- service topology and registered crossings;
- envelope and boundary obligations;
- selected versioned numeric methods;
- deterministic human-readable inspection outputs.

The historical Reference House technical model is the principal controlled compiler fixture. Its checks do not establish technical coordination of the accepted current house; [Current House Basis](../reference-house/current-house-basis.md) owns that applicability boundary. Contrast fixtures are used where needed to test that shared semantics do not silently depend on its grammar, courtyard morphology or other project-specific choices.

These are claims about **representation, traceability and internal coherence**. They do not establish structural capacity, environmental performance, fire adequacy, MEP sizing, product suitability, planning acceptability or regulatory approval.

## Proof boundary

The computational model follows several durable rules:

- a pattern is not a compiler primitive merely because the Reference House selects it;
- architectural grammar is not owned by the compiler;
- Reference House preferences are not universal or statutory rules;
- guidance is not silently promoted into law;
- representability is not evidence of adequacy;
- deterministic output is not automatically physical truth;
- missing or out-of-domain evidence should remain unsupported rather than being guessed.

A successful compile establishes only the claims encoded by the relevant supported domain and proof contract.

## Selected numeric methods

The system can admit a numeric method only when:

1. the owning architectural source supplies sufficiently controlled inputs;
2. the external method/authority and applicability are explicit;
3. unsupported and out-of-domain states fail closed;
4. the result’s proof boundary can be stated without implying whole-building compliance.

The private-stair correspondence is the current worked example. Its dimensions are **not repeated here**: they are controlled by the Reference House source and derived calculation chain, so copying them into this README would create another drift surface. The executable selected-method contract lives at `compiler/rhc5/`.

A passing selected calculation remains bounded method correspondence. It is not a Building Regulations compliance certificate.

## Semantic layers

The executable architecture separates several kinds of knowledge rather than collapsing the building into one pass/fail object.

- **Plan** — spaces, voids, boundaries, openings and shared geometry needed by downstream checks.
- **Structure** — support, span, reaction, interruption and gravity-handoff topology without pretending to prove member capacity.
- **Services** — nodes, routes, networks, access obligations and registered crossings without automatic sizing/routing claims.
- **Boundaries** — weather, air, thermal and moisture duties, including opening and penetration reinstatement obligations.
- **Calculations** — bounded versioned methods with explicit authority, applicability, inputs and unsupported states.

The vocabulary may be capable of representing more than has been proved in a concrete case. Capability of representation must not be reported as demonstrated adequacy.

## Output architecture

Machine proof, human inspection and publication graphics have different jobs:

1. **machine/proof artefacts** preserve exact identity, regression and traceability;
2. **semantic inspection outputs** expose what a compiled model knows and does not know;
3. **publication drawings** communicate architectural arguments and have their own drawing/publication authority.

The generated Reference House inspection surface is under [`../reference-house/generated/`](../reference-house/generated/). It is downstream from the canonical compile and must not be hand-edited to conceal a source problem.

Drawing/publication records live under `docs/publication/`; publication build machinery lives at top-level `publication/`.

## Deployment and external targets

A target, jurisdiction or site rule is not architecture merely because it may later be machine-checkable. The DPL programme under `project/dpl/` records the separate target/site/deployment model and its completed conditional design-study scope; real-site verification remains deferred.

The bounded deployment runtime now checks authored candidate conformance and composes selected target obligations. It is not a release-grade jurisdiction/site compiler. [Deployment under explicit assumptions](deployment-exploration.md) adds conditional exploration while preserving evidence-backed site unknowns. Target and site checks retain explicit authority, applicability, evidence and proof contracts.

## Verification

Repository-wide automated health begins with:

```sh
npm run check
```

Generated Reference House semantic inspection can be checked with:

```sh
npm run outputs:check
```

The canonical command list is `package.json`. Local compiler directories retain narrower proof contracts where they are materially useful.

A green check proves only the assertions actually encoded. Architectural quality, engineering adequacy, regulatory acceptance and physical performance remain outside that claim unless separately evidenced.

## Further technical detail

- [Executable Architecture](executable-architecture.md)
- [Formal Architectural Model](formal-architectural-model.md)
- [Validity and Obligations](validity-and-obligations.md)
- [Evidence and Provenance Architecture](evidence-and-provenance.md)
- [Compiler Targets](compiler-targets.md)
- [Structural Semantics](structural-semantics.md)
- [Boundary Semantics](boundary-semantics.md)
- [Interface Obligation Bundles](interface-obligation-bundles.md)
- [Supported Domain](supported-domain.md)
