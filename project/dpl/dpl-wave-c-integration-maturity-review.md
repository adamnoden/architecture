# DPL-C — post-Wave-C integration, maturity and DPL-13 admission review

**Parent programme:** #299  
**Gate issue:** #412  
**Review date:** 2026-10-22  
**Baseline `main`:** `6582b8aa953109a5c9cf5052f5ddc0c24b611c18`

## Decision

> **PASS — PROMOTE DPL TO M3; HOLD DPL-13; AUTHORISE WAVE D ONLY.**

Wave C has crossed the boundary from a developed deployment architecture into a coordinated one. The programme now has an executable orchestration substrate that consumes controlled Reference House identity, real-site evidence and substantive England/London target objects, alongside two substantive site-interface families, two substantive England technical families, one borough planning proof and eight controlled real-site records.

That is sufficient for **M3 — Coordinated** at DPL's present bounded scope. It is not sufficient for M4, a canonical deployment compile, a real-site deployment trial or a whole-site compatibility conclusion.

The blocking gap is now narrow and explicit rather than architectural ambiguity: the runtime does not yet represent an authored deployment candidate, evaluate Reference House conformance, enumerate admitted conformance-preserving routes or prove route exhaustion/invariance. Wave-C drainage, borough and expanded-corpus objects are also only partly composed through the runtime.

DPL-13 therefore remains held.

---

## Authority reviewed

This gate reviewed the landed Wave-C system as one programme, including:

- DPL-12A / #398 — minimal deployment orchestration substrate;
- DPL-08C / #399 — foul / surface / site-water interface;
- DPL-09C / #400 — England drainage / waste-water target slice;
- DPL-10C / #401 — Croydon borough planning plug-in proof;
- DPL-14C / #402 — five-site corpus gap-correction cohort;
- DPL-02 — Reference House conformance contract;
- DPL-03 / DPL-04 — result and assurance semantics;
- DPL-05 / DPL-06 — target-composition and site-manifest semantics;
- current `compiler/dpl/` implementation and tests;
- the canonical project maturity model;
- the completed/frozen DRW authority boundary.

The review distinguishes **programme coordination** from **runtime composition**. An artefact can be coordinated into the programme without yet being executable input to DPL-12A; those two facts are not conflated below.

---

## 1. Executable integration proof

DPL-12A is a real executable vertical slice rather than a type skeleton or documentation proxy.

It consumes controlled B2 objects and proves, in executable tests, that one deployment case can simultaneously carry:

- controlled Reference House identity;
- a genuine Croydon real-site screening record and its decision-critical unknowns;
- the England structure / ground / moisture / materials target;
- the London strategic residential/design target;
- DPL-08B's ground/datum/plinth/approach interface authority;
- deterministic case/source/target/evidence/method fingerprints;
- native numeric, fact-gated, external-evidence and judgement-led method classes;
- cross-target output without transferring authority ownership;
- stable repeated compile identity and relevant invalidation when admitted inputs change.

The runtime also explicitly refuses to claim more than this. Its proof boundary marks whole-site compatibility, candidate selection and route exhaustion as `NOT_IMPLEMENTED`.

### Wave-C runtime position

| Wave-C packet | Landed authority | Runtime position at this gate | Gate finding |
|---|---|---|---|
| DPL-12A | executable mixed B2 obligation/evidence orchestration | **Integrated** | proves the shared orchestration seam is real |
| DPL-08C | foul/surface/site-water interface contract | **Adjacent authority** | mature enough to compose next; not yet a runtime input |
| DPL-09C | `dpl.englandTechnicalSlice.v1` drainage target | **Schema-compatible but not admitted/loaded** | no new primitive is required merely to represent the target |
| DPL-10C | `dpl.boroughPlanningSlice.v1` Croydon target | **Not runtime-supported** | new bounded borough-target composition is required; genericity is not yet earned |
| DPL-14C | controlled eight-site corpus/index | **Not the DPL-12A corpus input** | runtime still proves against the earlier pilot shape/site selection |

The important result is therefore neither "everything is integrated" nor "Wave C is still only documents". DPL now contains an executable coordination spine, and Wave C has exposed the next concrete seams that spine must absorb.

---

## 2. M2 → M3 decision

The canonical project maturity definition for **M3 — Coordinated** is:

> The workstream has been reconciled with adjacent parts of the project and is internally coherent at its stated scope.

DPL now meets that criterion.

The evidence is stronger than document volume:

1. Reference House identity, site evidence, external target authority, method class, evidence lifecycle and result state coexist in one executable deployment case without collapsing into one truth type.
2. Real-site unknowns propagate fail-closed rather than disappearing at the compiler boundary.
3. Planning judgement remains judgement-led while bounded numeric planning policy can execute natively.
4. External technical evidence can discharge an admitted obligation without pretending the compiler performed the professional method.
5. Cross-target relationships are represented without transferring statutory/planning authority.
6. Wave C has independently exercised the same programme architecture with drainage, local planning and a broader empirical site corpus without exposing a contradiction requiring foundation or Reference House repair.
7. DRW closed without borrowing construction/site authority that DPL had not earned, leaving a clean adjacent-programme boundary.

### Promotion

**DPL is promoted from M2 — Developed to M3 — Coordinated.**

### Why not M4

M4 requires deliberate internal challenge sufficient to establish a controlled baseline at the stated proposition. DPL has not yet earned that claim for deployment machinery because:

- no canonical Reference House × Reference Site deployment candidate is represented end-to-end;
- Reference House conformance is not executable in the deployment runtime;
- admitted alternative routes are not enumerated or exhausted;
- the Wave-C local/drainage/corpus objects are not yet all composed through the runtime;
- no whole-deployment conclusion has been exercised, let alone adversarially validated.

M3 is therefore a real promotion, not an inflationary one.

---

## 3. Whole-site conclusion boundary

Whole-site `COMPATIBLE / UNRESOLVED / INCOMPATIBLE` remains **forbidden at runtime**.

Four missing semantics are independently material:

1. **Authored deployment-candidate identity** — the runtime knows the controlled Reference House, but not one explicit site-conditioned architectural candidate being evaluated.
2. **Reference House conformance evaluation** — DPL-02's invariants, protected order, permitted variants, site-interface freedoms and open implementation choices remain prose authority rather than executable candidate findings.
3. **Admitted-route enumeration** — there is no bounded representation of which conformance-preserving deployment responses are actually available for the case.
4. **Route exhaustion / invariant blocker proof** — a failed candidate cannot establish `INCOMPATIBLE` unless relevant admitted routes have been exhausted or the blocker is proved invariant across them.

Likewise, a green represented obligation subset cannot establish `COMPATIBLE`: unsupported/unrepresented obligation families and absent candidate semantics remain outside the proof.

`UNKNOWN` remains ignorance, not failure; `FAIL` remains an obligation result, not automatically site incompatibility.

---

## 4. Candidate / conformance seam

The next compiler packet should be a bounded candidate/conformance packet **before DPL-13**.

### Authorised packet: DPL-12B — authored candidate + Reference House conformance orchestration

DPL-12B should implement only the semantics already earned by DPL-02 and the existing compiler identity model:

- explicit authored deployment-candidate identity and revision;
- explicit relationship to one controlled Reference House revision;
- clause-level conformance findings against admitted DPL-02 authority;
- separate handling of identity invariants, protected order, discrete variants, site-interface freedoms and open/implementation choices;
- explicit `CONFORMS / NON_CONFORMING / REQUIRES_REFERENCE_HOUSE_REVISION / OPEN`-class architectural findings, reconciled with existing status architecture rather than creating a competing general truth lattice;
- candidate/conformance fingerprints in deployment-case identity;
- explicit admitted route identifiers only where an existing site-interface/conformance authority genuinely defines them;
- fail-closed treatment where conformance is not machine-representable.

DPL-12B must **not**:

- generate architecture;
- optimise or rank variants;
- silently mutate the Reference House;
- invent site-interface responses merely to make a case pass;
- infer that one non-conforming candidate makes the site incompatible;
- emit whole-site compatibility.

This is evaluation machinery for authored architecture, not a parametric-house generator.

---

## 5. DPL-13 admission

**DPL-13 remains held.**

The canonical Reference House × Reference Site compile becomes admissible only after the following bounded prerequisites have landed and passed a new integration gate:

1. **DPL-12B** — authored candidate + conformance orchestration;
2. **DPL-10D** — Bromley adversarial borough replay;
3. **DPL-12C** — Wave-C runtime composition expansion;
4. **DPL-D** — post-Wave-D integration / DPL-13 admission gate.

This is intentionally stronger than saying "DPL-13 later". The missing work is named and finite.

---

## 6. Planning anti-overfit

The predeclared **Bromley replay should run next**.

Croydon proves that a borough plug-in can preserve development-plan membership, guidance, numeric policy, design judgement and external decision evidence without collapsing them. It does **not** prove that the resulting local-target shape is generic.

Bromley is a useful adversarial replay because its pilot evidence stresses materially different seams:

- backland/private-access relationships;
- tree/TPO history;
- different refusal/permission history;
- drainage-condition history;
- different local-policy and source ecology.

### Authorised packet: DPL-10D — Bromley adversarial borough replay

DPL-10D may reuse only generic seams that survive contact with Bromley. Croydon-specific semantics stay Croydon-specific. It must not yet create a broad "all London boroughs" abstraction.

DPL-10D may proceed laterally with DPL-12B.

---

## 7. Water vertical integration

DPL-08C and DPL-09C are now sufficiently authoritative to become the first additional runtime vertical. A new drainage research or technical-family packet is **not** justified before that composition is attempted.

DPL-09C deliberately reuses the existing England technical-slice schema and existing DPL method classes. The missing work is therefore primarily orchestration:

- admit the drainage target through the loader;
- connect its site/evidence inputs to the DPL-08C interface facts without transferring ownership;
- preserve sewer/invert/capacity/permeability/consent unknowns;
- prove no hydraulic, civil or statutory result is fabricated;
- expose interface and statutory obligations together without calling the combination a drainage design.

This belongs in DPL-12C rather than a new DPL-08/DPL-09 research packet.

---

## 8. Corpus sufficiency

DPL-14C has materially reduced the original pilot bias. The controlled corpus now contains eight sites across seven boroughs and includes ordinary street-front replacement, corner/dual-frontage, topographic and stronger water/environmental conditions alongside the original difficult infill/backland cases.

One residual ordinary-control gap remains, alongside useful future opportunities for stronger survey/orientation, width and second-water cases.

**Do not open DPL-14D now.**

The empirical corpus is sufficient to pressure the next compiler proof. Further collection should be demand-led by a concrete blocker exposed by DPL-12B/12C or the next integration gate rather than by the original 24-site aspiration alone.

The 24-site Corpus 1 target remains a later programme target, not a quota that outranks integration value.

---

## 9. Next technical / interface family

**Authorise no new technical or site-interface family in Wave D.**

Wave C already produced more substantive authority than the current runtime composes. Opening fire, energy, ventilation, utilities, construction logistics or another interface family now would widen the frontier faster than the integration machinery can prove it.

The highest-value next move is vertical integration of what already exists.

---

## 10. DRW boundary after closure

DRW is now closed/frozen.

DPL-08C records legitimate future analytical representation duties around external discharge handoff, inspection geography and unresolved site-water relationships. Those are **handoffs, not permission to alter released DRW artefacts**.

Any future DPL-earned drawing change requires one of:

- an explicit DRW reopen with named authority and proof consequence; or
- a new separately owned post-DRW representation authority.

Silent mutation of the frozen drawing pipeline is forbidden.

---

## 11. Wave D — exact authorised next work

After this gate merges, authorise **only**:

```text
DPL-12B   authored candidate + Reference House conformance orchestration
DPL-10D   Bromley adversarial borough replay
     \     /
      \   /
      DPL-12C   Wave-C runtime composition expansion
          |
          v
       DPL-D     post-Wave-D integration / DPL-13 admission gate
```

Dependency intent:

- DPL-12B and DPL-10D may proceed laterally;
- DPL-12C follows DPL-12B and DPL-10D, and composes the landed DPL-08C/09C/10C/10D/14C objects through the shared runtime;
- DPL-D follows all three and decides whether DPL-13 is finally admitted.

### DPL-12C bounded scope

DPL-12C should prove the smallest runtime expansion required to compose Wave C:

- DPL-08C water-interface facts/obligations;
- DPL-09C England drainage target;
- Croydon plus the Bromley-tested borough-target seam;
- the controlled eight-site corpus/index shape;
- candidate/conformance identity from DPL-12B;
- deterministic provenance and invalidation across those additions.

It must not:

- add a new technical family;
- implement a generic borough rules engine;
- perform DPL-13;
- run real-site deployment trials;
- emit whole-site compatibility unless a later gate separately proves all required semantics and explicitly authorises it.

---

## 12. Held work

Until DPL-D passes, hold:

- DPL-13 canonical deployment compile;
- DPL-14D / bulk corpus expansion;
- DPL-15 real-site deployment trials;
- DPL-16 deployment-envelope derivation;
- DPL-17 publication integration;
- DPL-18 final adversarial closeout;
- additional DPL-08 / DPL-09 technical-interface families;
- generic all-borough planning abstraction;
- whole-site compatibility output.

---

## Maturity consequence

Promote the typed DPL workstream to:

> **M3 — Coordinated**

with this review, DPL-12A executable orchestration and the landed Wave-C records as coordination evidence.

This promotion claims only that DPL is internally coherent and reconciled with adjacent project parts at its present scope. It does **not** claim canonical deployment, regulatory compliance, planning permission, site compatibility, external validation or release readiness.

---

## Restart handoff

Once this gate is merged:

1. open only DPL-12B and DPL-10D as lateral Wave-D packets;
2. do not open DPL-12C until both prerequisite seams have landed;
3. do not open DPL-13 until DPL-D explicitly admits it;
4. keep whole-site compatibility forbidden unless a later gate demonstrates candidate/conformance, due-obligation completeness and route-exhaustion semantics rather than inferring them from a green subset.

The next programme problem is therefore no longer "what is deployment?". It is the much narrower question:

> **Can one authored deployment candidate be evaluated for Reference House identity and then composed with the full authority already earned by Wave C without turning the compiler into an architect or overstating the resulting proof?**
