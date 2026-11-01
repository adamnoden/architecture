# Deployment compiler

This directory contains the bounded executable deployment layer admitted by the DPL programme.

The sections below retain the DPL-12/13 foundations. Current programme authority and real-control results are owned by [`project/dpl/deployment-programme.md`](../../project/dpl/deployment-programme.md).

[Assumption-based exploration](../../project/dpl/exploration/README.md) adds explicit conditional geometry, level and access studies. It does not feed assumptions into the evidence-backed obligation ledger or change the verified readiness contract.

It is still intentionally narrower than an eventual whole-site deployment compiler.

## Semantic identity ordering

Existing DPL identity versions retain their established English collation for both object keys and declarative collections through `identity-order.ts`, with explicit options and a code-unit tie-break for distinct strings that collate equally. Canonical identities therefore no longer inherit the process locale or retain input order for equivalent Unicode spellings. The shared core defaults to code-unit key order for new identities; DPL explicitly supplies its existing ordering contract. Authored array sequence is preserved.

English ICU collation remains part of these existing DPL versions. Node/ICU upgrades must pass the retained frozen-identity regressions; this change does not claim independence from arbitrary runtime upgrades. Changing the legacy ordering algorithm would require a versioned evidence migration. The [SWE identity result](../../project/swe/identity-result.md) records why that migration was unnecessary for the ambient-locale defect and verifies compatibility with the current frozen chain.

## DPL-12A — obligation / evidence orchestration

DPL-12A composes controlled Reference House, site, interface, England and London target inputs into a deterministic obligation/evidence ledger.

It preserves:

- target authority and applicability;
- method class;
- obligation result;
- evidence lifecycle independently of result;
- missing inputs;
- cross-target edges;
- semantic case/result fingerprints.

It does not infer absent site facts or turn external judgement into native truth.

## DPL-12B — authored candidate / Reference House conformance

DPL-12B adds an explicit **authored deployment candidate** as compiler input.

The candidate is never compiler-authored or selected.

Current native conformance is deliberately bounded to:

- `RH-I02` — open-to-sky courtyard;
- `RH-PROT-01` — controlled gross shell/courtyard/storey morphology;
- `RH-PROT-04` — controlled principal-stair topology and 300 mm going;
- `RH-PROT-06` — controlled four-bay front field / ranked entrance;
- `RH-V01` — coherent whole-house mirror route admission;
- `RH-V02` — rigid site placement/orientation route admission.

Other DPL-02 authority remains explicit rather than passing by omission.

## DPL-12C — Wave-C composition

DPL-12C composes the actual Wave-C water/interface target, borough-target envelope and controlled eight-site corpus identities through the same runtime.

It does not turn the corpus into a property shortlist or borough examples into one generic policy engine.

## DPL-13A — canonical synthetic deployment case

DPL-13A assembles the first controlled Reference House × synthetic `DPL-RS-01` case.

It preserves:

- all 29 frozen Reference Site claims;
- explicit `UNKNOWN` / synthetic-assumption provenance;
- the authored `RH-V02` placement;
- DPL-08B/C interface identity;
- DPL-09B/C England target identity;
- London strategic planning without fabricating a local borough;
- independent site/candidate/deployment/coverage/canonical fingerprints.

DPL-13A explicitly does **not** establish coverage completeness or whole-site conclusion readiness.

## Owner-side SCREENING coverage

The generic readiness layer consumes, but does not replace, the controlled owner registries:

- DPL-02C — Reference House conformance coverage;
- DPL-09D — England technical/process coverage;
- DPL-10E — planning coverage;
- DPL-11B — non-planning due-diligence coverage.

DPL-10F separately proves the exact London strategic → local borough target graph.

DPL-08B remains the direct owner of the canonical authored absolute-datum claim `RS-FFL-01` under `GI-D02 — DATUM`; this site-interface ownership is preserved explicitly rather than forced into one of the four coverage registries.

## DPL-13B — SCREENING coverage / conclusion readiness

`coverage-readiness.ts` composes those controlled authorities into one deterministic profile-universe proposition.

It may normalise owner posture into:

- `DUE_NOW_REPRESENTED`;
- `DUE_NOW_MISSING`;
- `FUTURE_DUE`;
- `DUE_CLASSIFICATION_UNRESOLVED`;
- `NOT_APPLICABLE_PROVED`;
- `ADVISORY_NON_BLOCKING`;
- `ACCELERATION_REVIEW_REQUIRED`.

Owner-specific semantics remain alongside that integration view.

The canonical DPL-RS-01 result currently has:

```text
uncoveredClaimIds = []
profileUniverseState = PROFILE_DISPOSITION_UNRESOLVED
conclusionReadiness = NOT_READY_PROFILE_DISPOSITION_UNRESOLVED
```

The unresolved disposition comes from opaque owner acceleration metadata that may be relevant to unresolved/synthetic case facts. DPL-13B surfaces those questions for review but never parses prose into executable rules.

### DPL-13B proof boundary

The runtime retains:

```text
wholeSiteCompatibilityConclusion = NOT_IMPLEMENTED
substantiveConclusionAggregation = NOT_ADMITTED
routeExhaustion = NOT_IMPLEMENTED
architecturalCandidateSelection = NOT_IMPLEMENTED
```

Therefore DPL-13B does not emit whole-site `COMPATIBLE`, `UNRESOLVED` or `INCOMPATIBLE`.

## What this layer still does not do

The deployment compiler does not:

- author, generate, optimise or rank architecture;
- infer missing site facts;
- convert registry presence into substantive PASS;
- perform structural, geotechnical, drainage, legal or planning judgement;
- grant or predict statutory/planning approval;
- implement the full England technical corpus;
- rank land;
- compute a scalar compliance/confidence score;
- parse human-language acceleration triggers;
- assign a real borough to the synthetic Reference Site;
- prove route exhaustion;
- emit an authorised whole-site deployment result.

A failed candidate is not site incompatibility. A complete profile universe is not positive compatibility. A conservative-looking unknown result is not authorised until substantive aggregation semantics are separately proved.

## Tests

Run:

```sh
npm run test:dpl
```

The DPL suite now includes regression proof for orchestration, candidate conformance, Wave-C composition, owner coverage registries, planning target identity, canonical DPL-13A integration and DPL-13B coverage/readiness composition.
