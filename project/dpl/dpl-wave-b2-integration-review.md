# DPL-B2 — Concrete Vertical Integration and DPL-12 Admission Review

**Issue:** [#390 — DPL-B2 — concrete vertical integration and DPL-12 admission gate](https://github.com/adamnoden/architecture/issues/390)  
**Programme:** [#299 — DPL — deployment, jurisdiction and real-site integration programme](https://github.com/adamnoden/architecture/issues/299)  
**Baseline `main`:** `ca9ba246b3e1bf13e69069acd19707c2db11cbb2`  
**Review date:** 2026-10-21  
**Inputs:** DPL-08B #376, DPL-09B #377, DPL-10B #378, DPL-14B #379  
**Decision:** **PASS — ADMIT DPL-12A; KEEP DPL AT M2; AUTHORISE A BOUNDED WAVE C**

## 1. Question

> **Do the first concrete site-interface, technical-target, strategic-planning and real-site objects now justify a shared deployment orchestration substrate, and what is the smallest next wave that advances deployability without converting DPL into a generic rules engine?**

The answer is **yes, narrowly**.

B1 correctly held DPL-12 because the programme then had contracts but too few concrete instances. B2 changes that condition. DPL now has:

- one substantive conditional house↔land interface family;
- one machine-readable England technical target slice;
- one machine-readable London strategic planning target slice;
- three real London screening manifests derived from heterogeneous public evidence;
- explicit empirical provenance refinements earned by those manifests.

That is enough recurring structure to derive a minimal orchestration layer from evidence rather than invent one in the abstract.

It is **not** enough to emit a whole-site compatibility verdict or to claim the deployment programme is coordinated at M3.

---

# 2. B2 input review

## 2.1 DPL-08B — ground / datum / plinth / accessible approach

DPL-08B proves that one site-interface family can be represented as coupled duties without collapsing into a construction detail.

Its important contribution to DPL-12 is the distinction between:

- building-side authorised requirements;
- site-side facts/evidence required;
- specialist design boundaries;
- admissible response classes where authority genuinely exists;
- unresolved conditions;
- Reference House rewind triggers.

The packet also proves that `UNRESOLVED` is a legitimate useful result. The Reference Site does not become foundation-feasible or accessible merely because a synthetic geometry has been drawn.

## 2.2 DPL-09B — England structure / ground / moisture / materials

DPL-09B supplies the first technical target slice with exact authority and method classes.

It demonstrates that the orchestrator must distinguish:

- source/applicability resolution;
- native bounded checks;
- geometry/calculation methods;
- external structural/geotechnical/product evidence;
- unsupported or unavailable methods;
- partial evidence which informs but does not discharge a statutory obligation.

Most importantly, it demonstrates that identifying an applicable legal obligation does **not** imply that DPL can calculate or discharge it.

The existing Reference House structural checks may support an evidence chain while remaining insufficient to discharge the broader Part A obligation. DPL-12 must preserve that distinction.

## 2.3 DPL-10B — London strategic residential / design

DPL-10B proves that one planning target can contain several materially different evaluation classes simultaneously:

- exact policy arithmetic (`D6` numeric standards);
- qualitative design judgement (`D3`);
- inclusive-design judgement (`D5`);
- cross-target planning assignment (`D7` → Part M category);
- guidance/material-consideration evidence distinct from operative policy.

The orchestrator therefore cannot have one generic `evaluateRule()` semantics that implies every target item is a deterministic predicate.

The planning slice also demonstrates a genuine cross-target edge:

```text
planning policy / condition
        ↓
resolved M4 category
        ↓
England building-control obligation
```

The authorities remain distinct even where one creates an input for the other.

## 2.4 DPL-14B — three real London sites

DPL-14B proves that the site model survives genuine messy evidence.

The three admitted screening manifests cover Barnet, Bromley and Croydon and show materially different dominant uncertainties.

The pilot earns four provenance refinements as first-class orchestration concerns:

1. **source lineage** — two URLs may share one upstream marketing source;
2. **spatial scope** — an area/dimension belongs to a particular parcel/proposal extent;
3. **temporal state** — historic site conditions and approvals are not silently current;
4. **identity-link confidence** — marketing/planning/title records may overlap without proven exact identity.

These are not optional metadata niceties. Without them, a runtime can manufacture false corroboration or migrate facts between different parcels and dates.

---

# 3. Cross-object composition test

The B2 objects can participate in one deployment case without collapsing authority.

The minimum coherent composition is:

```text
DEPLOYMENT CASE IDENTITY
  controlled Reference House revision
  assurance profile
  target-composition identity
  site-manifest revision
  evidence-set revision
  method/runtime identity

SITE MANIFEST
  evidence-backed claims
  explicit unknowns
  assumptions
  source lineage / spatial / temporal scope
        │
        ├──────────────┐
        │              │
SITE INTERFACE      TARGET COMPOSITION
  architectural       England technical
  duties              London strategic planning
        │              │
        └──────┬───────┘
               ↓
          APPLICABILITY
               ↓
      OBLIGATIONS + METHODS
               ↓
       EVIDENCE RESOLUTION
               ↓
        OBLIGATION LEDGER
```

The following boundaries remain explicit:

- a **site claim** does not contain a normative conclusion;
- a **target** does not contain the site fact that triggers it;
- a **site-interface duty** does not become statutory compliance merely because it aligns with an obligation;
- a **planning judgement** does not become a numeric method;
- an **external evidence requirement** does not become `PASS` because a related internal calculation exists;
- a **cross-target edge** transfers a bounded fact/requirement, not authority ownership.

The composition test therefore passes.

---

# 4. DPL-12 admission decision

## Decision

**ADMIT DPL-12A.**

Only one narrow orchestration slice is authorised.

DPL-12A must derive its schema and runtime behaviour from the concrete B2 artefacts. It must not attempt to settle the whole future deployment compiler architecture.

## Minimum DPL-12A responsibilities

DPL-12A may implement only the recurring responsibilities now evidenced by B2:

1. **deployment-case identity**
   - controlled Reference House source/revision;
   - assurance profile;
   - site-manifest identity/revision;
   - target-composition identity;
   - evidence-set identity;
   - compiler/method version identity.

2. **source and provenance references**
   - external source snapshot identity;
   - source lineage;
   - spatial scope;
   - temporal state;
   - source-identity-link confidence where needed.

3. **target composition**
   - typed target membership;
   - no list-order/locality precedence;
   - cross-target edges represented explicitly.

4. **applicability**
   - resolved, conditional or unresolved applicability;
   - missing applicability facts remain visible;
   - future project events may keep target selection conditional.

5. **method class**
   - bounded native numeric/deterministic;
   - geometry/calculation;
   - external evidence;
   - planning/professional judgement;
   - external process/permission;
   - unsupported method.

6. **obligation/result state**
   - reuse the existing DPL/Metamorph obligation status lattice;
   - do not create a duplicate DPL-only status enum.

7. **evidence state**
   - link accepted/present/planned/stale/etc. evidence independently of obligation status;
   - preserve partial evidence and non-discharging evidence.

8. **missing evidence / unknowns**
   - missing facts do not default to false/zero/not-applicable;
   - decision-critical unknowns are surfaced explicitly.

9. **deterministic provenance**
   - the same admitted inputs/method versions produce the same obligation ledger identity;
   - source/target/method changes invalidate the relevant results rather than silently mutating them.

## Explicitly excluded from DPL-12A

DPL-12A must **not**:

- generate architecture;
- select site adaptations;
- author a deployment candidate;
- infer missing site facts;
- implement all Building Regulations;
- implement all London or borough policy;
- decide planning permission;
- decide foundation/drainage design;
- replace specialist evidence;
- create a property-ranking or land-search score;
- introduce an aggregate compliance/confidence score;
- emit a whole-site `COMPATIBLE` or `INCOMPATIBLE` verdict.

---

# 5. Top-level conclusion boundary

DPL-12A is an **obligation-ledger/proof substrate**, not yet a deployment-decision engine.

This is a deliberate restriction.

A whole-site `COMPATIBLE` conclusion requires more than all currently represented obligations being green. It also requires:

- a defined deployment candidate;
- Reference House conformance evaluation;
- the applicable site-interface responses;
- visibility of all due blocking obligations for the requested assurance profile;
- candidate/adaptation-route handling.

An `INCOMPATIBLE` conclusion is stricter still. DPL-03/DPL-02 require a genuine blocking condition plus exhaustion of relevant admitted conformance-preserving routes, or proof that the failure is invariant across them.

DPL-12A does not yet implement those semantics.

Therefore:

```text
DPL-12A OUTPUT
  obligation ledger
  evidence ledger
  applicability state
  unresolved inputs
  deterministic provenance

NOT YET
  COMPATIBLE
  INCOMPATIBLE
```

A ledger containing only `PASS` / `EXTERNALLY_DISCHARGED` for the currently modelled subset does **not** imply site compatibility.

---

# 6. Programme maturity

## Decision: remain M2 — Developed

B2 closes most of the specific absences recorded after B1:

- real site manifests now exist;
- substantive technical obligations now exist;
- substantive planning obligations/method classes now exist;
- one substantive site-interface family now exists.

However the workstream is not yet coordinated at the stated deployment scope because those objects are not yet reconciled through an executable shared orchestration layer.

The project-wide M3 criterion is:

> **The workstream has been reconciled with adjacent parts of the project and is internally coherent at its stated scope.**

DPL-12A is the concrete test of that coordination.

Therefore #390 does **not** promote DPL to M3. M3 should be reconsidered after DPL-12A has successfully orchestrated the B2 objects and survived a post-12A integration gate.

---

# 7. First borough decision

## Decision: select Croydon for the first DPL-10C proof

The B2 pilot now provides sufficient evidence to justify **Croydon as a proof target**, not as a claim of London representativeness.

Why Croydon:

- the pilot site has a clearly traceable planning identity;
- one-house permission and later two-house refusal/appeal dismissal expose proposal sensitivity;
- the public decision record contains local + strategic policy interaction;
- character/massing, amenity and parking reasoning create both bounded and judgement-led obligations;
- it is a strong test of the DPL-10A/10B distinction between policy membership, guidance, judgement and external permission.

The purpose is to prove the borough plug-in mechanism, not to optimise for a favourable borough.

## Predeclared adversarial second borough: Bromley

**Bromley is predeclared now as the second-borough replay** if Croydon DPL-10C succeeds.

Bromley is materially different in the pilot:

- backland/private-access condition rather than tight urban garage infill;
- tree/TPO history;
- larger-scheme refusal versus later one-house permission;
- drainage-condition history;
- different local-policy/source ecology.

Predeclaring Bromley before Croydon implementation prevents the first plug-in from quietly defining “borough planning” in Croydon-specific terms.

Do not open the Bromley replay until the Croydon proof closes and its abstractions can be attacked.

---

# 8. Next coupled site / technical vertical

## Decision: site water and drainage precedes fire

The next coupled vertical should be the DPL-08 `foul / surface / site water` package plus the matching bounded England drainage obligations.

Why this comes next:

- water/drainage is already central to Ovid’s House doctrine and Reference House geometry;
- DPL-14B produced genuine site evidence/unknowns around drainage and access;
- it exercises external-network facts, gravity/levels, planning/site interface and technical regulation at once;
- it creates high-value canonical-deployment inputs without requiring DPL to impersonate a fire engineer;
- the house already has mature roof-water/failure analytical work which can be consumed as evidence without making it a statutory proof.

### Authorised pair

**DPL-08C — foul / surface / site-water interface**

Owns the house↔land response contract:

- foul connection handoff;
- surface-water hierarchy / discharge-route handoff;
- courtyard/perimeter/roof-water site connection;
- levels/falls/inspection/maintenance territory;
- site facts needed before a solution can be selected;
- external sewer/authority/consent dependencies;
- rewind/incompatibility triggers without designing the drainage system.

**DPL-09C — England drainage / waste-water target slice**

Primary statutory family: **Part H** and directly relevant regulations/guidance/source relationships.

Part G may be represented only at explicit interface points genuinely needed for water/sanitation relationships. DPL-09C must not become a full Part G packet merely because the letter is adjacent.

The pair may proceed laterally but must not treat the other’s open findings as settled authority.

---

# 9. Corpus expansion decision

## Decision: run a bounded gap-correction mini-cohort before bulk 24-site collection

Do not jump directly from three difficult infill/backland sites to the remaining 21 Corpus 1 plots.

Authorise **DPL-14C — five-site corpus gap-correction cohort**.

The cohort should deliberately add up to five admitted sites covering the missing pilot archetypes, preferably one strong example for each:

1. ordinary street-front detached/replacement condition;
2. corner / dual-frontage condition;
3. reliably evidenced slope/topography;
4. authoritative flood/water/environmental trigger;
5. unusually clear public geometry + relatively sparse planning history as an “ordinary control”, with orientation materially different from the current pilot where possible.

One site may cover multiple axes, but do not reduce the cohort merely to avoid inconvenient examples.

The aim is to test the provenance/schema refinements and reduce pilot bias before scaling toward 24.

No purchase ranking, compatibility verdict or affordability admission criterion is authorised.

---

# 10. DRW rendezvous

DRW-11 is now closed and has strengthened rather than weakened the DPL boundary: the drawing programme repeatedly refused construction-style details where technical authority had not been earned.

The current concurrency rule remains:

> **DRW represents controlled architectural/analytical authority. DPL creates site/interface/target obligations. Neither may invent the other’s unresolved authority.**

Wave C therefore does not require DRW to pause.

DPL-08C / 09C may later earn new analytical drawing duties around external water/drainage geography. If they do, record those as explicit DRW handoffs rather than editing drawing artefacts inside the DPL packets.

DPL-12A consumes existing controlled drawing/house evidence only as bounded evidence inputs. It does not reinterpret DRW drawings as construction or compliance proof.

---

# 11. Authorised Wave C

After this gate merges, open **only**:

1. **DPL-12A — minimal deployment orchestration substrate**;
2. **DPL-08C — foul / surface / site-water interface**;
3. **DPL-09C — England drainage / waste-water target slice**;
4. **DPL-10C — Croydon borough planning plug-in proof**;
5. **DPL-14C — five-site corpus gap-correction cohort**.

Dependencies:

```text
DPL-12A ← DPL-B2 + DPL-08B + DPL-09B + DPL-10B + DPL-14B

DPL-08C ← DPL-B2 + DPL-08A + DPL-14B
DPL-09C ← DPL-B2 + DPL-09A/B + DPL-08C authority boundary
DPL-10C ← DPL-B2 + DPL-10A/B + DPL-14B
DPL-14C ← DPL-B2 + DPL-14A/B + DPL-06
```

`DPL-09C ← DPL-08C authority boundary` does not mean 09C must wait for 08C to finish. They may progress laterally after agreeing the ownership seam; unresolved cross-lane questions remain explicit.

The next mandatory integration gate occurs after these five packets.

---

# 12. Held work

Still held after #390:

- DPL-10D Bromley replay until Croydon proof closes;
- DPL-09D+ bulk technical families;
- DPL-08D+ other site-interface families;
- corpus expansion beyond DPL-14C;
- DPL-13 canonical deployment compile;
- DPL-15 real-site deployment trials;
- DPL-16 deployment-envelope derivation;
- DPL-17 publication integration;
- DPL-18 final adversarial closeout;
- whole-site compatibility output from the runtime.

DPL-12A admission is **not** permission to begin all downstream work.

---

# 13. Red-team findings

The decision hypothesis survives with several corrections.

## Hypothesis: admit DPL-12A

**SURVIVES.** Concrete B2 objects now exist.

## Hypothesis: promote to M3 at B2 gate

**REJECTED.** Coordination must be demonstrated in executable orchestration first.

## Hypothesis: allow whole-site compatibility from DPL-12A

**REJECTED.** Candidate/conformance-route and route-exhaustion semantics are absent.

## Hypothesis: Croydon first borough

**SURVIVES**, but only as a proof target. **Bromley is predeclared** as the adversarial second replay.

## Hypothesis: site water/drainage next

**SURVIVES.** It has stronger current integration value than selecting the next technical family alphabetically.

## Hypothesis: jump straight to 24 plots

**REJECTED.** The three-site pilot is too biased toward difficult infill/backland conditions. A five-site gap-correction cohort is earned first.

---

# 14. Gate disposition

**PASS — ADMIT DPL-12A; KEEP DPL AT M2; AUTHORISE WAVE C ONLY.**

The decisive programme transition is:

```text
FOUNDATION / CONTRACTS
        ↓
B2 CONCRETE INSTANCES
        ↓
B2 GATE
        ↓
MINIMAL ORCHESTRATION NOW EARNED
```

but not:

```text
MINIMAL ORCHESTRATION EARNED
        ↓
WHOLE BUILDING / WHOLE SITE COMPILER COMPLETE
```

That second transition remains future work and must be earned packet by packet.