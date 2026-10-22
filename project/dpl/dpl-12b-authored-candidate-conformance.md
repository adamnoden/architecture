# DPL-12B — authored candidate and Reference House conformance orchestration

**Issue:** #414  
**Parent programme:** #299  
**Authorised by:** DPL-C / #412  
**Baseline `main`:** `dad549526651675e9400224f68dbdcd101a181a5`  
**Scope:** bounded executable candidate identity + Reference House conformance only

## Decision

> **Represent the deployment candidate as explicit authored input; evaluate only conformance clauses for which controlled authority is computationally representable; leave every other clause open rather than manufacturing architectural proof.**

DPL-12A could identify the controlled Reference House, real site, targets, evidence and proposal facts, but there was no exact site-conditioned architectural candidate in the case identity and no runtime representation of DPL-02 conformance.

DPL-12B closes that seam without turning the compiler into an architect.

The candidate is supplied by an author. Metamorph fingerprints and evaluates it. Metamorph does not create, search, rank or repair it.

---

## Authority recovered

Primary authority:

- `project/dpl/dpl-02-reference-house-conformance.md`;
- `project/dpl/dpl-01-deployment-ontology.md`;
- `project/dpl/dpl-03-assurance-result-semantics.md`;
- `project/dpl/dpl-12a-minimal-orchestration.md`;
- current controlled `compiler/reference-house/` source identity;
- DPL-08B / DPL-08C boundaries where a referenced site-interface response remains external/open.

The key DPL-02 constraints remain:

1. **deployment freedoms are opt-in**;
2. controlled source is not automatically architectural identity;
3. conformance is revision-relative;
4. a failed candidate is not automatically an incompatible site;
5. Reference House correction remains owned upstream by the relevant RH gate.

---

## Candidate identity

`DeploymentCandidateInput` now carries:

- immutable candidate id/revision;
- authored-source id/revision;
- exact Reference House source fingerprint the candidate claims to instantiate;
- a bounded candidate-fact set;
- selected admitted DPL-02 variant routes;
- referenced site-interface response classes;
- referenced implementation-choice classes.

The complete canonicalised candidate is semantically fingerprinted. That fingerprint is included in the deployment-case identity manifest.

Set-like route references are sorted/deduplicated before fingerprinting, so their input order does not create false identity changes.

Changing a meaningful authored candidate input or revision invalidates candidate identity, deployment-case identity and result identity.

If the candidate references a different Reference House source fingerprint, DPL-12B refuses to substitute the current house and returns an explicit `RH-REVISION / OPEN` finding instead.

---

## Conformance findings

DPL-12B adds a candidate-specific architectural finding vocabulary:

- `CONFORMS`;
- `NON_CONFORMING`;
- `REQUIRES_REFERENCE_HOUSE_REVISION`;
- `OPEN`.

These findings are deliberately **not** added to the general obligation-result lattice. They answer a different question: whether this authored candidate is inside the current Reference House contract at a particular clause.

There is no aggregate conformance score or whole-candidate percentage.

### Native fact checks

Only four DPL-02 clauses currently have adequate controlled computational facts for native evaluation.

| Clause | Native representation | Result boundary |
|---|---|---|
| `RH-I02` | explicit candidate `courtyardOpenToSky` | `false` is `NON_CONFORMING`; missing is `OPEN` |
| `RH-PROT-01` | shell width/depth, courtyard width/depth/placement, two-storey count | deviation is `REQUIRES_REFERENCE_HOUSE_REVISION`; missing is `OPEN` |
| `RH-PROT-04` | riser count, flight-rise groups, going | deviation is `REQUIRES_REFERENCE_HOUSE_REVISION`; missing is `OPEN` |
| `RH-PROT-06` | front-bay count/spacing and entrance-bay index | deviation is `REQUIRES_REFERENCE_HOUSE_REVISION`; missing is `OPEN` |

The protected numeric values are read from the controlled Reference House source where represented rather than copied from incidental drawing geometry.

The only bounded literal not supplied directly by that source is the DPL-02 statement that the current house has **two principal storeys**.

### Admitted discrete routes

DPL-02 currently licenses only:

- `RH-V01` — coherent whole-house left/right mirror;
- `RH-V02` — rigid site placement / cardinal orientation.

Selecting either route receives a clause-level `CONFORMS` route-admission finding. This means only that the route exists in DPL-02.

It does not prove site suitability, target compliance or the detailed coherence of every transformed subsystem.

`RH-V01` is nevertheless strong enough to affect the native `RH-PROT-06` front-field check: the controlled bay-3 entrance becomes the mirror-equivalent bay 2 in a four-bay field.

### Clauses intentionally left open

The remaining identity/protected clauses are represented as known DPL-02 authority but have no trustworthy DPL-12B native evaluator:

- `RH-I01`, `RH-I03` → `RH-I07`;
- `RH-PROT-02`, `RH-PROT-03`, `RH-PROT-05`, `RH-PROT-07` → `RH-PROT-15`.

Each remains an explicit `OPEN / EXTERNAL_OR_UNMODELLED` finding.

This is intentional. For example, service topology, environmental hierarchy, structural concept, maintenance geography and tectonic hierarchy cannot be proved by comparing a handful of scalar candidate facts.

A later packet may make one of those clauses executable only after a controlled representation is earned.

### Site-interface and implementation references

A candidate may record use of `RH-SI01` → `RH-SI06` or `RH-IMP01` → `RH-IMP08`.

DPL-12B returns those references as `OPEN` rather than `CONFORMS`.

The existence of a site-interface or implementation freedom proves only that a bounded response domain exists. Whether one actual response stays inside the protected-house boundary still depends on DPL-08, specialist evidence and/or later technical representation.

---

## Runtime composition

When a candidate is supplied to `compileDeploymentCase(...)`:

1. the current controlled Reference House source is loaded;
2. candidate identity is canonicalised/fingerprinted;
3. the candidate's claimed Reference House fingerprint is checked exactly;
4. bounded native and route-admission conformance findings are evaluated;
5. unrepresented clauses remain open;
6. candidate identity enters deployment-case identity;
7. open candidate clauses are surfaced in `unresolvedInputs` as `candidateConformance.<clause>`;
8. the candidate-conformance evaluation enters result identity.

When no candidate is supplied, the DPL-12A path remains available unchanged. That preserves the earlier vertical proof rather than pretending 12A always had candidate semantics.

---

## Rejected alternatives

### Candidate self-certifies a conformance class

Rejected.

The candidate does not say “this is a permitted variant” and thereby make it true. Variant/site-interface ids are checked against the DPL-02-owned bounded type set, and native clauses use controlled source facts.

### Encode every DPL-02 sentence as a boolean

Rejected.

That would turn rich architectural topology and qualitative order into pseudo-precision merely to make the runtime look complete.

### Treat all controlled compiler geometry as conformance

Rejected.

DPL-02 explicitly forbids this. Reference House compiler source contains provisional/representational coordinates that are not identity.

### Search variants until something passes

Rejected.

DPL-12B evaluates authored candidates. It does not generate candidates or perform route search/exhaustion.

### Candidate failure means site incompatibility

Rejected.

A protected change may require an upstream Reference House revision, and another already-admitted route may remain. Route exhaustion remains unimplemented.

---

## Proof boundary after DPL-12B

Still explicitly absent:

- architectural candidate generation/selection;
- route search or route exhaustion;
- whole DPL-02 computational coverage;
- site-interface technical proof;
- whole-site `COMPATIBLE / UNRESOLVED / INCOMPATIBLE`;
- canonical Reference House × Reference Site compile;
- real-site deployment trial.

The existing deployment proof boundary therefore remains:

```text
wholeSiteCompatibilityConclusion = NOT_IMPLEMENTED
architecturalCandidateSelection  = NOT_IMPLEMENTED
routeExhaustion                   = NOT_IMPLEMENTED
```

DPL-12B adds **candidate evaluation**, not candidate selection.

---

## Regression proof

`compiler/dpl/dpl12b.test.ts` covers:

1. deterministic canonical candidate identity;
2. native conformance of represented current-house facts;
3. explicit open/unmodelled clauses;
4. coherent `RH-V01` mirror admission and mirror-equivalent entrance bay;
5. protected shell narrowing → `REQUIRES_REFERENCE_HOUSE_REVISION`;
6. loss of open-to-sky courtyard → `NON_CONFORMING`;
7. missing candidate facts → `OPEN`;
8. site-interface/implementation references remain `OPEN`;
9. stale Reference House fingerprint refuses substitution;
10. route-reference order independence;
11. authored candidate revision invalidates case/result identity;
12. continued absence of whole-site compatibility.

The pre-existing DPL-12A regression suite remains in the same `test:dpl` command and must continue to pass without a candidate input.

---

## DPL-12C handoff

DPL-12C may now assume only the following candidate/conformance seam:

- one exact authored candidate can be part of deployment-case identity;
- candidate/source revision identity is deterministic and fail-closed;
- four controlled DPL-02 clauses have native checks;
- `RH-V01/V02` are explicit enumerable route ids;
- unrepresented conformance remains open rather than silently passing;
- site-interface/implementation response references do not self-discharge their boundaries;
- no route exhaustion or whole-site conclusion has been earned.

DPL-12C should compose this seam with the landed Wave-C water, borough and eight-site corpus objects. It must not broaden candidate generation or conformance coverage merely for convenience.

## Acceptance position

DPL-12B is acceptable only if exact-head validation proves the implementation and the existing DPL-12A path remain green together.

A green DPL-12B means:

> **Metamorph can now identify and evaluate one authored candidate against a deliberately bounded subset of Reference House conformance authority without becoming the author and without laundering candidate failure into site incompatibility.**

It does not mean that the Reference House has been canonically deployed.