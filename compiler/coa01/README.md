# COA-01 — output contract and dependency architecture

**Gate:** COA-01  
**Status:** PASS — accepted in the [completed COA programme](../../docs/computational/compiler-output-architecture-programme.md)\
**Starting main:** `114892835b7e0316579eeed3eafbf29969f83280`  
**Issue:** #95  
**Authority effect:** none

## Question

Can output generation become an explicit downstream system rather than a collection of historical drawing functions?

**Answer: yes.** COA-01 establishes the successor artefact contract, format policy, generation-state policy, stable successor paths and one canonical single-pass output context without changing any historical renderer or generated artefact.

## Output layer

The new generic downstream surface is deliberately small:

```text
compiler/output/
  model.ts    # artefact classes, formats and manifest identity shape
  policy.ts   # information-character → format and PASS/REVIEW/FAIL policy
```

Reference-House-specific output ownership is isolated below:

```text
compiler/reference-house/output/
  contract.ts # stable IDs, paths, formats, renderer/schema version
  context.ts  # one createReferenceHouseSource → compileReferenceHouseSystem pass
```

No scene graph, drawing framework, plugin model or general renderer abstraction has been introduced.

## Format contract

COA now encodes the root medium decision explicitly:

| Information character | Primary format |
|---|---|
| machine identity | JSON |
| non-spatial register | Markdown |
| metric spatial view | SVG |
| metric topology tied to coordinates | SVG |

Publication figures remain outside this generic format policy because PR-00D owns their editorial form.

## Successor family frozen at v1

Current schema: `RH-OUTPUT-1` (the original gate label was `OH-RH-OUTPUT-1`)\
Renderer family: `1.0.0`

Stable successor paths:

- `docs/reference-house/generated/ground-floor-plan.svg`
- `docs/reference-house/generated/first-floor-plan.svg`
- `docs/reference-house/generated/principal-section.svg`
- `docs/reference-house/generated/first-floor-structure.svg`
- `docs/reference-house/generated/service-register.md`
- `docs/reference-house/generated/boundary-register.md`
- `docs/reference-house/generated/output-manifest.json`

The family is intentionally asymmetric: services and boundary carriers begin as reports. COA-05 may add a service graph or drainage/boundary spatial companion only if it answers a question the reports cannot answer efficiently.

## Identity contract

Every generated successor artefact will carry:

- stable artefact ID;
- classes;
- format;
- stable path;
- renderer version;
- source compile fingerprint;
- SHA-256 content fingerprint.

The output manifest carries the Reference House compact compile schema/fingerprint plus the SHA-256 identities of actual generated content. The compile stamp is an association with the declared summary, not proof of complete runtime-state equality. The [CCR identity result](../../project/ccr/ccr-identity-result.md) records the tested limit; `outputs:check` separately regenerates and compares output bytes. Representation remains downstream of source authority.

## Canonical input contract

`createReferenceHouseOutputContext()` owns the successor entry path:

```text
createReferenceHouseSource()
  → compileReferenceHouseSystem(source)   # exactly one canonical system compile
  → ReferenceHouseOutputContext
  → downstream report/drawing renderers
```

The output context exposes the existing compile identity/lineage rather than rebuilding its own semantic fingerprint model.

Historical RH-C1…RH-C4 generators remain untouched and continue to exercise their historical wrappers as frozen evidence.

## Generation-state policy

- **PASS** — canonical inspection output generation allowed.
- **REVIEW** — output generation may proceed only when the view remains safely projectable, and visible REVIEW state is mandatory.
- **FAIL** — canonical successor generation is refused.

COA-03/04 renderers must make the REVIEW state visually unmistakable where it is allowed.

## Dependency boundary

The invariant is now executable:

> semantic runtime may not import the output layer.

Generic runtime domains and the Reference House semantic compiler remain upstream. Output code may depend on compiled semantic state; the reverse dependency is forbidden.

## Preservation

COA-01 changes no historical SVG, historical generator, Reference House source fact, semantic result, proof boundary or maturity assessment.

**Historical handoff:** [COA-02 — non-spatial report extraction](../coa02/README.md), subsequently completed.
