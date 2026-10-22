# Deployment Programme

**Programme code:** DPL  
**Owning issue:** [#299 — DPL — deployment, jurisdiction and real-site integration programme](https://github.com/adamnoden/architecture/issues/299)  
**Latest gate:** [#458 — DPL-G](https://github.com/adamnoden/architecture/issues/458)  
**Programme state:** canonical synthetic compile complete; four owner-side SCREENING coverage registries complete; DPL-G holds DPL-13B on one planning target-identity edge and authorises DPL-10F only  
**Programme maturity:** **M4 — Internally validated / controlled at bounded canonical synthetic deployment-case integration scope; whole-site conclusion readiness excluded**

## Purpose

DPL establishes the machinery required to ask whether the controlled Ovid’s House Reference House can be deployed honestly onto land under declared site, jurisdiction, evidence and assurance conditions without confusing architectural authorship, site truth, external authority, compiler proof or professional judgement.

The eventual deployment question remains:

> **Can this controlled Reference House revision be deployed on this site, under this exact target composition and evidence state, while preserving its architectural identity and satisfying every obligation due for the requested assurance profile?**

The eventual whole-site conclusions remain `COMPATIBLE`, `UNRESOLVED` and `INCOMPATIBLE`.

**No current runtime is authorised to emit those whole-site conclusions.**

The controlled baseline is narrower: DPL can deterministically assemble and boundedly evaluate one explicit Reference House × synthetic Reference Site deployment case while preserving provenance, unknowns, candidate authorship, target/interface authority and declared coverage gaps.

## Governing rules

> **Compatibility before adaptation.**

> **The compiler evaluates architecture; it does not silently author it.**

> **A deterministic ledger is not a deployment conclusion unless the scope over which that conclusion is derived is itself proved.**

---

# Canonical foundation

The semantic foundation remains owned by:

- [DPL-01 — deployment ontology](dpl-01-deployment-ontology.md);
- [DPL-02 — Reference House conformance](dpl-02-reference-house-conformance.md);
- [DPL-03 — assurance/result semantics](dpl-03-assurance-result-semantics.md);
- [DPL-04 — assurance profiles](dpl-04-compilation-maturity.md);
- [DPL-05 — target composition](dpl-05-target-stack-model.md);
- [DPL-06 — site manifest](dpl-06-site-manifest-model.md).

Frozen consequences include:

- deployment freedoms are opt-in;
- site claims, evidence, rules and conclusions remain different objects;
- unknown is first-class;
- target composition is typed rather than list-order inheritance;
- evidence lifecycle remains independent from obligation result;
- candidate failure is not site incompatibility;
- `INCOMPATIBLE` requires route exhaustion or invariant blocking proof;
- `COMPATIBLE @ <profile>` requires complete resolution of all applicable due-now blocking obligations at that profile;
- synthetic site provenance remains synthetic.

Assurance profiles remain:

`SCREENING / FEASIBILITY / PLANNING_CASE / TECHNICAL_DESIGN / CONSTRUCTION / COMMISSIONED_AS_BUILT`

---

# Controlled programme history

## Foundation through Wave D — complete

DPL-01 through DPL-12C and DPL-14A/C established the deployment ontology, Reference Site, target/interface inventories and bounded target slices, real-site adversarial corpus, authored candidate/conformance runtime, Croydon→Bromley local-planning replay and Wave-C runtime composition.

The detailed restart-safe records remain under `project/dpl/`.

## DPL-13A — complete

[DPL-13A](dpl-13a-canonical-reference-site-compile.md) establishes the first controlled Reference House × synthetic DPL-RS-01 canonical deployment case with:

- all 29 frozen DPL-07 site claims;
- 11 explicit unknowns;
- one authored unmirrored 180° `RH-V02` candidate;
- bounded DPL-02 conformance;
- DPL-08B/C interface identities;
- DPL-09B/C England target slices;
- bounded London strategic planning;
- deterministic site/candidate/deployment/coverage/canonical identities;
- explicit absence of whole-site conclusion authority.

## DPL-E — complete

[DPL-E](dpl-e-post-13a-review.md) promoted DPL to M4 at bounded canonical-compile / no-conclusion scope and authorised owner-side coverage foundations.

## Coverage Foundations — complete

Four owner-side SCREENING coverage registries are now controlled:

- [DPL-02C — Reference House conformance coverage](dpl-02c-conformance-coverage.md);
- [DPL-09D — England technical/process coverage](dpl-09d-england-screening-coverage.md);
- [DPL-10E — planning coverage](dpl-10e-planning-screening-coverage.md);
- [DPL-11B — non-planning due-diligence coverage](dpl-11b-nonplanning-screening-coverage.md).

They encode **coverage authority**, not blanket substantive PASS results.

[DPL-F](dpl-f-coverage-foundations-integration-review.md) identified planning as the missing owner-side registry. DPL-10E closed that family-coverage gap.

## DPL-G — current gate

[DPL-G](dpl-g-post-planning-coverage-integration-review.md) concludes:

> **PASS WITH HOLD — THE FOUR OWNER-SIDE COVERAGE FOUNDATIONS ARE COHERENT, BUT DPL-13B IS NOT YET ADMITTED. AUTHORISE DPL-10F PLANNING TARGET IDENTITY RECONCILIATION ONLY.**

DPL-10E closes the prior planning-family gap, including explicit ownership of `RS-NOISE-01` and `RS-ECO-01`.

The remaining blocker is narrower: Croydon and Bromley both declare a `parentStrategicTargetId` that does not identify the London strategic target actually composed by the runtime and controlled by DPL-10E.

---

# Current controlled baseline

## Canonical integration

DPL can reproduce one exact synthetic canonical deployment case deterministically.

The controlled proof boundary remains:

```text
wholeSiteCompatibilityConclusion = NOT_IMPLEMENTED
conclusionReadiness = NOT_ESTABLISHED
coverageCompleteness = NOT_ESTABLISHED
routeExhaustion = NOT_IMPLEMENTED
architecturalCandidateSelection = NOT_IMPLEMENTED
```

This boundary is part of the M4 baseline.

## Reference House coverage

DPL-02C exposes all current DPL-02 clauses/routes under stable machine-readable authority. Registry presence never means `CONFORMS`.

## England coverage

DPL-09D exposes the controlled England technical/process family universe at SCREENING. DPL-09B/C remain bounded partial slices and RH-C5 remains one selected Part K method only.

## Planning coverage

DPL-10E exposes the controlled planning family universe at SCREENING, preserves the synthetic fixture's explicit `NO_REAL_BOROUGH_ASSIGNED` state, keeps planning judgement/statutory determination external, and maps the bounded London/Croydon/Bromley targets only as partial implementations.

The planning family universe is now sufficiently visible for later generic coverage composition.

### Current planning identity defect

The controlled London strategic target id is:

```text
LON-STRATEGIC-RESIDENTIAL-DESIGN-2021-2026-10-20
```

Both current borough targets instead declare:

```text
parentStrategicTargetId = LON-PLAN-2021-RESIDENTIAL-DESIGN-2026-10-20
```

`compiler/dpl/wavec.ts` validates only that this parent field is non-empty. It does not prove that the parent equals the strategic target actually composed by `loadB2TargetComposition()`.

DPL-10E proves the three controlled planning target node identities but does not prove the borough→strategic parent edge.

A generic DPL-13B composer must not invent an alias to bridge that mismatch.

## Non-planning coverage

DPL-11B exposes the controlled title/private-rights/sewer/utilities/ground/flood/access/logistics families while preserving external legal/professional/provider authority.

## Site-claim ownership

The canonical 29-claim DPL-RS-01 set is now sufficiently assigned across the four owner domains for later SCREENING coverage composition work.

The former material gaps `RS-NOISE-01` and `RS-ECO-01` are now owned by DPL-10 planning coverage without being converted into policy discharge.

---

# Coverage/readiness semantics

Future generic composition may normalise only the profile-level posture needed for integration while preserving owner-specific semantics.

The current common vocabulary includes:

- `DUE_NOW_REPRESENTED`;
- `DUE_NOW_MISSING`;
- `FUTURE_DUE`;
- `DUE_CLASSIFICATION_UNRESOLVED`;
- `NOT_APPLICABLE_PROVED`;
- `ADVISORY_NON_BLOCKING`;
- later `ACCELERATION_REVIEW_REQUIRED` where opaque/non-native acceleration metadata may be engaged.

Future coverage-universe state should distinguish:

- `PROFILE_UNIVERSE_COMPLETE`;
- `PROFILE_UNIVERSE_INCOMPLETE`;
- `PROFILE_DISPOSITION_UNRESOLVED`.

These are coverage/readiness states, not substantive deployment conclusions.

Opaque acceleration-trigger prose must never be parsed into native rules by convenience.

---

# Current authorised work — DPL-10F only

## DPL-10F — planning strategic/local target identity reconciliation

DPL-10F must:

1. treat `project/dpl/targets/london-strategic-residential-design-v1.json` as the controlled strategic target identity source;
2. reconcile Croydon and Bromley `parentStrategicTargetId` values to that exact id;
3. add a fail-closed proof that every borough target admitted to Wave-C composition declares the exact strategic target actually composed with it;
4. add DPL-10E regression proof that controlled borough target identities and their declared parent reconcile to the controlled strategic target;
5. preserve normal fingerprint invalidation when target identity changes;
6. preserve all planning policy/evidence semantics unchanged;
7. add no aliases, fuzzy id matching or generic name normalisation.

DPL-10F must not change policy content, source status, planning family scope, borough abstraction, planning prediction, Reference House geometry or DRW.

### After DPL-10F

Run:

> **DPL-H — post-planning-identity repair / DPL-13B admission gate.**

**DPL-13B remains held until DPL-H.**

If DPL-H admits it, the expected smallest 13B scope is still coverage/readiness only:

- compose owner-registry identities;
- prove site-claim ownership coverage;
- derive profile-universe completeness/disposition state;
- expose due-now/future/missing/review-required references;
- fingerprint the readiness proposition;
- retain `wholeSiteCompatibilityConclusion = NOT_IMPLEMENTED`.

---

# Whole-site conclusion boundary

`UNRESOLVED @ SCREENING` remains held. A conservative-looking result is still too strong until coverage/readiness machinery itself is admitted and challenged.

`COMPATIBLE @ SCREENING` remains materially further downstream and requires complete scope plus positive resolution/discharge of every due-now blocker at appropriate evidence quality.

`INCOMPATIBLE` still requires route exhaustion or an independently controlled invariant blocker. Route search is not current work.

---

# Programme maturity

DPL remains:

> **M4 — Internally validated / controlled at bounded canonical synthetic deployment-case integration scope, explicitly excluding whole-site conclusion readiness.**

DPL-G neither demotes nor broadens that claim. The current controlled baseline exposed a downstream authority-edge defect rather than hiding it.

M5 requires competent independent / real-world validation and remains unavailable.

---

# Held work

Until DPL-10F lands and DPL-H reviews the repaired planning identity graph, hold:

- DPL-13B+;
- runtime whole-site `COMPATIBLE / UNRESOLVED / INCOMPATIBLE`;
- route exhaustion/search/optimisation;
- DPL-14D / bulk corpus expansion;
- DPL-15 real-site deployment trials;
- DPL-16 deployment-envelope derivation;
- DPL-17 publication integration;
- DPL-18 final closeout;
- generic all-borough planning ontology;
- unrelated technical/interface expansion;
- DRW changes.

---

# Packet discipline

Every DPL packet remains restart-safe and must preserve authority ownership.

Split or refuse work that:

- converts external professional/legal/planning judgement into native truth;
- makes missing evidence look not applicable;
- broadens one borough/site/target accident into generic doctrine;
- silently authors architecture;
- changes claimed evaluation scope without invalidating case identity;
- treats a deterministic set of nodes as a coherent authority graph without proving its controlled edges;
- emits a whole-site conclusion before the profile coverage universe and result semantics are proved.
