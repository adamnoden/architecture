# Deployment Programme

**Programme code:** DPL  
**Owning issue:** [#299 — DPL — deployment, jurisdiction and real-site integration programme](https://github.com/adamnoden/architecture/issues/299)  
**Foundation gate:** [#344 — DPL-FR](https://github.com/adamnoden/architecture/issues/344)  
**Wave-A gate:** [#356 — DPL-WA](https://github.com/adamnoden/architecture/issues/356)  
**Wave-B1 gate:** [#373 — DPL-B1](https://github.com/adamnoden/architecture/issues/373)  
**Wave-B2 gate:** [#390 — DPL-B2](https://github.com/adamnoden/architecture/issues/390)  
**Wave-C gate:** [#412 — DPL-C](https://github.com/adamnoden/architecture/issues/412)  
**Wave-D gate:** [#420 — DPL-D](https://github.com/adamnoden/architecture/issues/420)  
**Programme state:** foundation through Wave D complete; DPL-D admits **DPL-13A only** as the next bounded canonical integration compile  
**Programme maturity:** **M3 — Coordinated**

## Purpose

DPL establishes the machinery required to ask whether the controlled Ovid’s House Reference House can be deployed honestly onto land under declared site, jurisdiction, evidence and assurance conditions without confusing architectural authorship, site truth, external authority, compiler proof or professional judgement.

The eventual deployment question remains:

> **Can this controlled Reference House revision be deployed on this site, under this exact target composition and evidence state, while preserving its architectural identity and satisfying every obligation due for the requested assurance profile?**

The eventual whole-deployment conclusions remain:

- `COMPATIBLE`;
- `UNRESOLVED`;
- `INCOMPATIBLE`.

**No current runtime is authorised to emit those whole-site conclusions.**

DPL-D has now established that a canonical compile and a canonical conclusion are separate milestones. DPL-13A may assemble the first complete synthetic canonical case and ledger while whole-site conclusion readiness remains explicitly unproved.

DPL is not:

- a generic house generator;
- a Building Regulations product;
- a planning-permission predictor;
- a substitute for competent engineering, legal, planning or statutory review;
- permission to mutate the Reference House until a site passes;
- a property-ranking or acquisition-scoring system.

## Governing rules

> **Compatibility before adaptation.**

> **The compiler evaluates architecture; it does not silently author it.**

The governing authority chain remains:

```text
OVID'S HOUSE
    ↓
REFERENCE HOUSE
controlled authored architecture
    +
SITE MANIFEST / CLAIMS / EVIDENCE
    +
TYPED TARGET COMPOSITION
    +
ASSURANCE PROFILE
    ↓
DEPLOYMENT CASE
    ↓
AUTHORED DEPLOYMENT CANDIDATE
    ↓
METAMORPH COMPILER
    ↓
CONFORMANCE + OBLIGATIONS + EVIDENCE
    ↓
EVENTUAL WHOLE-SITE CONCLUSION
only when conclusion scope is itself proved
```

The diagram is an authority model, not a claim that every arrow is already executable.

---

# Canonical foundation

The semantic foundation remains owned by:

- [DPL-01 — deployment ontology](dpl-01-deployment-ontology.md);
- [DPL-02 — Reference House conformance](dpl-02-reference-house-conformance.md);
- [DPL-03 — assurance/result semantics](dpl-03-assurance-result-semantics.md);
- [DPL-04 — assurance profiles](dpl-04-compilation-maturity.md);
- [DPL-05 — target composition](dpl-05-target-stack-model.md);
- [DPL-06 — site manifest](dpl-06-site-manifest-model.md).

The [foundation coherence review](dpl-foundation-coherence-review.md) passed without reopening those contracts.

Key frozen consequences:

- deployment freedoms are opt-in;
- site claims, evidence, rules and conclusions remain different objects;
- unknown is first-class;
- target composition is typed rather than list-order inheritance;
- evidence lifecycle remains independent from obligation result;
- candidate failure is not site incompatibility;
- `INCOMPATIBLE` requires route exhaustion or an invariant blocking proof;
- `COMPATIBLE @ <profile>` requires complete resolution of all applicable due-now blocking obligations at that profile;
- a synthetic site must retain synthetic provenance.

Canonical obligation results remain:

`PASS / EXTERNALLY_DISCHARGED / FAIL / UNSUPPORTED / UNRESOLVED / NOT_APPLICABLE / WARNING / SUPERSEDED`

Assurance profiles remain:

`SCREENING / FEASIBILITY / PLANNING_CASE / TECHNICAL_DESIGN / CONSTRUCTION / COMMISSIONED_AS_BUILT`

---

# Controlled programme history

## Foundation — complete

DPL-01 through DPL-06 are complete.

## Wave A — complete

- [DPL-07 — Reference Site](dpl-07-reference-site.md) / #347;
- [DPL-09 — England regulatory target inventory](dpl-09-england-regulatory-target-inventory.md) / #348;
- [DPL-10 — London planning target inventory](dpl-10-london-planning-target-inventory.md) / #349;
- [DPL-11 — site due-diligence / non-planning model](dpl-11-site-due-diligence-model.md) / #350.

## Wave B1 — complete

- [DPL-08A — site-interface authority register](dpl-08a-site-interface-authority-register.md) / #358;
- [DPL-09A — England source/applicability spine](dpl-09a-england-source-applicability-spine.md) / #359;
- [DPL-10A — planning source/status spine](dpl-10a-planning-source-status-spine.md) / #360;
- [DPL-14A — real-plot corpus protocol](dpl-14a-real-plot-corpus-protocol.md) / #361.

DPL-B1 concluded:

> **PASS — HOLD DPL-12; AUTHORISE B2 ONLY.**

## Wave B2 — complete

- [DPL-08B — ground / datum / plinth / accessible approach](dpl-08b-ground-datum-plinth-approach-interface.md) / #376;
- [DPL-09B — structure / ground / moisture / materials](dpl-09b-structure-ground-moisture-materials.md) / #377;
- [DPL-10B — London strategic residential / design target](dpl-10b-london-strategic-residential-design.md) / #378;
- [DPL-14B — three-site real London corpus pilot](dpl-14b-three-site-real-corpus-pilot.md) / #379.

DPL-B2 concluded:

> **PASS — ADMIT DPL-12A; KEEP DPL AT M2; AUTHORISE WAVE C ONLY.**

## Wave C — complete

- [DPL-12A — minimal deployment orchestration](dpl-12a-minimal-orchestration.md) / #398;
- [DPL-08C — foul / surface / site-water interface](dpl-08c-foul-surface-site-water-interface.md) / #399;
- [DPL-09C — England drainage / waste-water target](dpl-09c-england-drainage-waste-water.md) / #400;
- [DPL-10C — Croydon borough planning plug-in](dpl-10c-croydon-planning-plugin.md) / #401;
- [DPL-14C — five-site corpus gap correction](dpl-14c-five-site-gap-correction.md) / #402.

The controlled real-site corpus now contains eight screening-level sites across seven boroughs.

The [post-Wave-C review](dpl-wave-c-integration-maturity-review.md) / #412 concluded:

> **PASS — PROMOTE DPL TO M3; HOLD DPL-13; AUTHORISE WAVE D ONLY.**

## Wave D — complete

- [DPL-12B — authored candidate + Reference House conformance](dpl-12b-authored-candidate-conformance.md) / #414;
- [DPL-10D — Bromley adversarial borough replay](dpl-10d-bromley-adversarial-replay.md) / #415;
- [DPL-12C — Wave-C runtime composition](dpl-12c-wave-c-runtime-composition.md) / #418.

The [post-Wave-D review](dpl-wave-d-integration-admission-review.md) / #420 concludes:

> **PASS — ADMIT DPL-13A ONLY; KEEP WHOLE-SITE CONCLUSIONS UNAUTHORISED; HOLD DPL-13B+ AND DPL-15+.**

---

# Current coordinated state

## Candidate / conformance

DPL-12B gives the runtime explicit authored candidate identity and bounded executable Reference House conformance.

Only earned clauses are native. Unrepresented DPL-02 authority remains `OPEN`; the runtime does not translate architectural prose into fake booleans.

The only currently licensed discrete architectural deployment variants remain:

- `RH-V01` — coherent whole-house mirror;
- `RH-V02` — rigid placement / orientation.

Candidate failure remains distinct from site incompatibility.

## England / site-water vertical

DPL-08B/C and DPL-09B/C now compose through one runtime while retaining distinct architecture/site-interface and England technical authority.

The compiler does not design foundations or drainage, choose discharge destinations, infer sewer capacity or perform professional judgement.

## London / borough planning

The London strategic target is executable at its admitted bounded methods.

Croydon + Bromley prove only a narrow reusable borough envelope. Borough policy families remain local.

Bromley Policy 30 remains a deliberate unsupported temporal/conflict case rather than a stale numeric rule silently treated as current.

## Real corpus

DPL-12C can load the current eight-site corpus deterministically without inventing site facts.

The current corpus index preserves site identity and challenge metadata but does **not** expose a complete machine-readable claim/unknown ledger. DPL-12C therefore refuses to mine prose for truth.

This limits whole-site conclusion coverage but does not block the synthetic DPL-RS-01 canonical fixture, whose claim register is already explicit.

## Reference Site

[DPL-RS-01](dpl-07-reference-site.md) is now admitted as the site fixture for DPL-13A.

It remains:

`SYNTHETIC_REFERENCE`

not a claim about a typical or real London parcel.

Its authored rigid 180° house placement may become the canonical authored DPL-13A candidate under `RH-V02`; the compiler does not choose that placement.

---

# DPL-D conclusion boundary

DPL-D separates three propositions that must not be collapsed.

## Canonical compile — admitted

The project now has enough controlled architecture, site claims, targets, interface authority and compiler substrate to assemble one deterministic Reference House × DPL-RS-01 canonical case.

That work is DPL-13A.

## Canonical `COMPATIBLE` / `INCOMPATIBLE` — not admitted

Positive compatibility remains blocked by incomplete executable due-now coverage, bounded DPL-02 conformance coverage, incomplete DPL-11 runtime coverage, partial target coverage and incomplete site-claim→obligation mapping.

Incompatibility remains blocked by absent route-exhaustion / invariant-blocker machinery.

## Canonical top-level `UNRESOLVED` — also not yet admitted as runtime conclusion

Although DPL-03 makes `UNRESOLVED` the semantic result when compatibility is unearned and incompatibility unproved, a deployment conclusion is still a derived result over a declared obligation scope.

The runtime does not yet prove that the represented obligation universe is complete for `SCREENING`.

DPL-13A must therefore preserve:

```text
wholeSiteCompatibilityConclusion: NOT_IMPLEMENTED
conclusionReadiness: NOT_ESTABLISHED
coverageCompleteness: NOT_ESTABLISHED
```

or an equivalent explicit non-conclusion boundary.

It may enumerate represented unresolved/open findings. It may not imply that the full screening scope has been evaluated.

---

# Current authorised work — DPL-13A only

## DPL-13A — canonical Reference Site case assembly and deterministic deployment ledger

DPL-13A must:

1. encode the existing DPL-RS-01 claim register into a machine-readable synthetic site manifest;
2. preserve each consequential claim's authored / derived / assumed / unknown basis;
3. encode one authored canonical candidate from DPL-07's current unmirrored rigid 180° placement under `RH-V02`;
4. compose DPL-08B + DPL-08C interface identities;
5. compose DPL-09B + DPL-09C England targets;
6. compose the London strategic planning target;
7. **not invent a local borough target** for DPL-RS-01;
8. preserve DPL-12B candidate/conformance findings;
9. add a controlled coverage manifest distinguishing represented obligations, site claims/unknowns, known DPL-11/target/conformance gaps and not-yet-established due classifications;
10. include that coverage scope in deterministic identity where material;
11. prove repeatable canonical case/result identity and relevant invalidation;
12. retain candidate generation/selection, route exhaustion and whole-site conclusion as unimplemented.

DPL-13A is an integration specimen, not a deployability declaration.

### DPL-13A success condition

A successful result may be full of unresolved, unsupported, open and future work.

The success criterion is that the canonical case exposes those states under the correct owners without filling them by assumption.

---

# Held work

Until DPL-13A lands and is reviewed, hold:

- DPL-13B+;
- any runtime `COMPATIBLE / UNRESOLVED / INCOMPATIBLE` whole-site conclusion;
- DPL-14D / bulk corpus expansion;
- DPL-15 real-site deployment trials;
- DPL-16 deployment-envelope derivation;
- DPL-17 publication integration;
- DPL-18 final adversarial closeout;
- additional DPL-08 / DPL-09 technical/interface families not demanded by DPL-13A;
- generic all-borough planning abstraction;
- DRW changes.

DPL-13A's result decides what comes next. Do not pre-author DPL-13B merely because its likely topic is visible.

---

# Programme maturity

DPL remains **M3 — Coordinated**.

Wave D strengthens the M3 case materially but does not establish an internally validated end-to-end deployment baseline.

M4 remains held until a canonical integrated deployment proposition exists and has been deliberately challenged against its declared scope. DPL-13A is the next experiment required before promotion can be reconsidered.

---

# DRW / publication boundary

DRW remains complete and frozen.

> **DPL may earn a future representational duty, but it may not silently mutate the released DRW pipeline.**

Any DPL-driven drawing change requires explicit new/reopened authority.

Most DPL machinery remains backstage. Reader-facing deployment treatment remains deferred to DPL-17 after the machinery has earned it.

---

# Packet discipline

Every DPL packet must remain restart-safe. Record at minimum:

`packet → baseline main SHA → authority recovered → exact question → source/evidence set → findings + rejected alternatives → artefacts/changes → checks → authority/proof consequences → downstream dependencies → exact next authorised packet`

Split a packet when it:

- mixes materially independent ontology, architectural, legal or site questions;
- freezes an abstraction before concrete evidence justifies it;
- requires unrelated Reference House rewinds;
- creates a new compiler proof family unexpectedly;
- treats professional/planning judgement as deterministic computation;
- makes a whole-site conclusion without first proving the scope over which that conclusion is derived.

# Current authorised work

**DPL-13A only after DPL-D merges.**

Do not open DPL-13B+, DPL-15, another corpus wave, another technical/interface family or any whole-site conclusion implementation until DPL-13A has landed and its canonical result has been reviewed.
