# DPL-12A — Minimal Deployment Orchestration Substrate

**Issue:** [#398 — DPL-12A — minimal deployment orchestration substrate](https://github.com/adamnoden/architecture/issues/398)  
**Parent gate:** [#390 — DPL-B2](https://github.com/adamnoden/architecture/issues/390)  
**Initial branch baseline:** `98e839c4550eff2802b77398b933cf12aecc0755`  
**Research / implementation date:** 2026-10-21  
**Disposition:** **PASS — bounded executable orchestration established; whole-site compatibility remains unimplemented**

## 1. Question

> **Can Metamorph compose one exact deployment-case identity, a real admitted site, the first England technical target and the first London strategic-planning target into a deterministic obligation/evidence ledger without inventing architecture, missing facts, professional judgement or a whole-site compatibility verdict?**

**Yes, at the deliberately narrow DPL-12A scope.**

The decisive change from DPL-B1 is that this is no longer an ontology or schema proposal. The runtime consumes the concrete artefacts already earned by B2 and exercises their mixed semantics in executable tests.

---

# 2. Controlled inputs used by the executable proof

DPL-12A consumes the existing controlled objects directly:

### Reference House

The current `createReferenceHouseSource()` fixture remains the architectural source representation. DPL-12A fingerprints it through the established `referenceHouseSourceFingerprint()` path.

The deployment layer does **not** duplicate or reinterpret Reference House geometry.

### Site

The executable proof uses real pilot site `DPL-RP-003` — Rear of 73A and 73B Woodside Green, Croydon — loaded through:

- `project/dpl/sites/corpus-1-pilot-index.json`;
- `project/dpl/sites/dpl-rp-003-rear-73a-73b-woodside-green-croydon.md`.

The runtime carries:

- the admitted site identity;
- borough;
- primary identity basis;
- index-entry fingerprint;
- full controlled-record fingerprint;
- the pilot’s decision-critical unknown list.

It does **not** parse prose into invented geometry, rights, levels, drainage or title facts.

### House ↔ land interface

DPL-08B is consumed as a controlled semantic input by fingerprinting:

`project/dpl/dpl-08b-ground-datum-plinth-approach-interface.md`

DPL-12A therefore knows the exact interface-contract revision admitted into the case without attempting to execute foundation/access design.

### England technical target

DPL-09B is loaded from:

`project/dpl/targets/england-structure-ground-moisture-materials-v1.json`

The runtime preserves exact target/method/source identity and the distinction between:

- native applicability gates;
- external structural/geotechnical evidence;
- external site/ground evidence;
- external building-physics evidence;
- external product/specification/inspection evidence.

### London strategic target

DPL-10B is loaded from:

`project/dpl/targets/london-strategic-residential-design-v1.json`

The runtime preserves:

- D3 design judgement;
- D5 inclusive-design judgement;
- D6 native policy arithmetic;
- D7 external category assignment and cross-target output.

No borough target is imported by DPL-12A.

---

# 3. Implementation boundary

The executable code lives under:

`compiler/dpl/`

This is deliberate.

`compiler/core/` remains limited to genuinely general deterministic primitives such as semantic identity, geometry and numeric operations. Jurisdiction/site/deployment semantics do not become “core” merely because DPL needs code.

DPL-12A adds:

- `model.ts` — the bounded orchestration/result contract;
- `load.ts` — fail-closed controlled-artifact loading;
- `compile.ts` — deterministic case composition and obligation evaluation;
- `dpl12a.test.ts` — executable regression proof;
- `README.md` — authority and proof-boundary statement.

The repository test chain gains a dedicated `test:dpl` command rather than hiding deployment tests inside an unrelated CH/RH-C gate.

---

# 4. Case identity

A DPL-12A deployment-case identity includes:

- schema/method version;
- current Reference House source fingerprint;
- assurance profile;
- admitted site-index entry fingerprint;
- admitted full site-record fingerprint;
- admitted site-interface contract fingerprint(s);
- typed target IDs + semantic target fingerprints;
- proposal-fact fingerprint;
- evidence-set fingerprint.

Target and interface collections are canonicalised by semantic identity before hashing, so incidental input ordering does not change the case identity.

The runtime uses the existing SHA-256 semantic-fingerprint primitive from `compiler/core/identity.ts` rather than creating a second hashing scheme.

A relevant admitted source/fact/evidence/version change therefore changes case identity; repeated identical inputs remain byte-stable at the semantic manifest level.

---

# 5. Obligation/result semantics

DPL-12A reuses the frozen DPL result vocabulary rather than inventing a second truth system:

- `PASS`;
- `EXTERNALLY_DISCHARGED`;
- `FAIL`;
- `UNSUPPORTED`;
- `UNRESOLVED`;
- `NOT_APPLICABLE`;
- `WARNING`;
- `SUPERSEDED`.

Evidence lifecycle remains independently represented:

- `PLANNED`;
- `PRESENT`;
- `ACCEPTED`;
- `REJECTED`;
- `STALE`;
- `SUPERSEDED`;
- `WITHDRAWN`.

An accepted external evidence item may discharge an obligation only when the compile input explicitly identifies it as discharging that obligation. DPL-12A does not decide professional competence or manufacture an evidence-acceptance process.

---

# 6. Applicability

Applicability is represented separately from technical result.

DPL-12A proves two useful classes immediately.

## Direct applicability

Obligations whose controlled target says they apply to the represented work/development class become `APPLIES` without implying adequacy.

For example:

- `ENG-BR-A1` applies;
- it remains `UNRESOLVED` because structural evidence is external.

## Explicit fact-gated applicability

Where the target artefact provides a deterministic applicability rule, DPL-12A may evaluate it.

`ENG-BR-D1` is the first proof:

```text
cavityInsulationInserted = true     → APPLIES
cavityInsulationInserted = false    → NOT_APPLICABLE
fact absent                          → UNRESOLVED
```

Missing is never coerced to false.

Other conditional obligations remain unresolved unless their controlled target and admitted facts provide an equally defensible gate.

---

# 7. Native deterministic methods

DPL-12A implements only the native methods already earned by the B2 London target.

## D6 Table 3.1 GIA / storage

For explicit admitted proposal facts:

- bedroom count;
- bedspace count;
- dwelling storeys;
- policy-defined GIA;
- built-in storage area;

DPL-12A resolves the exact controlled `spaceTable` row and evaluates GIA and storage independently.

The executable proof includes both PASS and FAIL cases for a `4b / 6p / 2s` dwelling.

If any required fact is absent, the obligation remains `UNRESOLVED`.

If the proposal tuple is outside the admitted table, the method is `UNSUPPORTED`, not extrapolated.

## D6 finished-height coverage

Where policy-defined GIA and qualifying >=2.5 m finished-height area are both supplied, DPL-12A evaluates the controlled 75% rule.

The existing Reference House floor-to-floor datum is never silently substituted for finished floor-to-ceiling evidence.

## D6 private outside space

The London baseline is evaluated only after its own applicability has been resolved against the presence/absence of a higher local standard.

No Croydon/Bromley standard is inferred by this packet.

---

# 8. Judgement and external evidence remain external

DPL-12A explicitly proves that heterogeneous obligations do not collapse into a common predicate.

### D3 / D5

These remain `UNRESOLVED` with judgement required. No character, inclusive-design or planning-quality score is created.

### England A / C / Regulation 7 evidence families

These remain `UNRESOLVED` unless accepted external evidence is explicitly admitted as discharging a named obligation.

Existing Reference House compiler checks may participate as bounded supporting evidence later; they are not promoted automatically into statutory proof here.

### D7

The strategic accessible-housing obligation remains an external planning determination/assignment.

If an exact planning M4 category is admitted, DPL-12A can resolve the **cross-target edge** carrying that category into a later England target.

The D7 obligation itself remains unresolved absent appropriate external determination evidence, and the receiving Part M technical requirement is not thereby proven.

---

# 9. Real-site unknowns

The Croydon pilot’s decision-critical unknowns are carried into the executable ledger, including items such as:

- current legal parcel;
- current physical build-out state;
- exact boundary geometry;
- topography;
- ground/geotechnics;
- drainage/sewers;
- utility routes/capacity.

They remain unresolved inputs.

DPL-12A does not create false facts from the planning record merely because a compile needs values.

---

# 10. Cross-target composition

DPL-12A represents cross-target edges explicitly instead of merging target authority.

The first concrete case is D7:

```text
London planning target
    planning M4 category assignment
              ↓
      cross-target output
              ↓
future England Part M obligation input
```

If no category assignment exists, the edge remains `UNRESOLVED`.

If an explicit category is supplied, the edge becomes `RESOLVED` with that value while still stating that technical compliance remains separate.

This proves target composition without an implicit “planning owns building control” hierarchy.

---

# 11. Whole-site compatibility is intentionally absent

The runtime contains an explicit proof-boundary object:

```text
wholeSiteCompatibilityConclusion = NOT_IMPLEMENTED
architecturalCandidateSelection   = NOT_IMPLEMENTED
routeExhaustion                    = NOT_IMPLEMENTED
```

The regression suite additionally proves that the ledger exposes no `compatibility` or `deploymentConclusion` field.

This is not an omission to fix inside DPL-12A.

A whole-site `COMPATIBLE` conclusion still requires at least:

- an authored deployment candidate;
- Reference House conformance evaluation;
- resolved/admitted site-interface responses;
- due-obligation completeness at the requested assurance profile.

`INCOMPATIBLE` additionally requires route exhaustion or proof that a blocker is invariant across relevant admitted conformance-preserving routes.

Those semantics remain future authority.

---

# 12. Regression proof

`npm run test:dpl` exercises the actual controlled B2 artefacts rather than duplicated mock target definitions.

It proves:

1. identical inputs produce stable case and result fingerprints;
2. target input order does not change identity or output;
3. real Croydon site unknowns survive into the ledger;
4. A1 remains an external-evidence obligation;
5. D1 missing applicability input remains unresolved rather than false;
6. D6 GIA/storage produces deterministic PASS when admitted facts satisfy the exact table row;
7. the same native rule produces deterministic FAIL below the minimum;
8. changing a fact changes identity/result appropriately;
9. accepted external evidence can discharge an external obligation without changing its method class;
10. a D7 category can resolve a cross-target edge without proving Part M;
11. evidence version changes invalidate case/result identity;
12. whole-site compatibility output remains absent.

The tests are part of the repository’s main `npm test` chain via dedicated `test:dpl` ownership.

---

# 13. Rejected expansions

DPL-12A deliberately does **not** add:

- a generic rules DSL;
- a database/site-ingest system;
- a planning scoring engine;
- a property search/ranking layer;
- whole Building Regulations encoding;
- borough policy;
- candidate generation;
- site adaptation selection;
- whole-site compatibility;
- a new compiler-core abstraction merely to make deployment code look generic.

The concrete B2 inputs did not earn those abstractions.

---

# 14. Consequences

## For DPL maturity

DPL-12A supplies the executable coordination evidence that the B2 gate identified as missing for M3 consideration.

It does **not itself promote DPL**. The mandatory post-Wave-C integration gate owns the M2 → M3 decision after the other Wave-C lanes have also landed.

## For DPL-08C / 09C

The water/drainage vertical now has a concrete orchestration destination. New target/interface records should preserve the same authority/method/unknown boundaries rather than special-case themselves into the runtime.

If they require a new orchestration primitive, that is evidence for a bounded DPL-12 follow-up—not permission to genericise DPL-12A retroactively.

## For DPL-10C

The Croydon borough target can compose as another planning target while leaving judgement and external permission distinct. DPL-10C must not weaken these semantics to obtain a machine pass.

## For DPL-14C

The new cohort can extend site provenance/unknown objects. DPL-12A currently fingerprints controlled site records and carries stable index unknowns; additional site-schema fields should enter executable orchestration only after repeated empirical evidence earns them.

## For DRW

No new construction/detail authority is created.

DPL-12A may consume controlled drawing/house evidence only within its existing proof boundary; entering a deployment ledger does not turn a drawing into construction or statutory proof.

---

# 15. Disposition

**DPL-12A passes at its bounded scope.**

The programme has now crossed an important threshold:

```text
B2 contracts + real instances
          ↓
actual executable composition
          ↓
deterministic obligation/evidence ledger
```

It has deliberately **not** crossed this threshold:

```text
obligation/evidence ledger
          ↓
whole-site deployment verdict
```

That boundary remains one of the programme’s principal safeguards.