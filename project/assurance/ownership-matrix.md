# Project Assurance Ownership Matrix

**Purpose:** make every material architectural or technical concern visibly owned without turning the project into a collection of discipline programmes.  
**Baseline `main`:** `19170e6cac52a54e751ade0ccd0899cc6ee13ec4`  
**Governing invariant:** **nothing may be declared out of scope without identifying where it is in scope.**

This is a governance map. It does not create technical adequacy, increase maturity, redesign the Reference House or appoint a specialist by implication.

The repository remains organised by the role a document plays. This matrix therefore points to existing owners rather than copying their content.

---

## 1. Status vocabulary

| Status | Meaning |
|---|---|
| `OWNED` | current architectural/project owner and closure route are explicit |
| `OWNED — EXTERNAL PROOF` | architecture/assumptions are coordinated, but competent specialist evidence is deliberately still required |
| `OWNED — REAL PROJECT` | the generic project can state the question, but a real site, brief, product or appointed team must supply the deciding facts |
| `OWNED — THIN` | ownership and closure route exist, but the present corpus is materially lighter than neighbouring disciplines |
| `UNOWNED` | no credible current owner or closure route exists; this requires a bounded follow-up issue |

`OWNED` never means technically proved. A represented assumption, review brief, compiler check or reserved volume is not validation.

---

## 2. Assurance matrix

| Concern family | Current architectural / project owner | Principal current authority | Present assurance state | Closure route / responsible future gate | Status |
|---|---|---|---|---|---|
| **Structure** | Reference House structural concept; later structural engineer | `docs/reference-house/structural-coordination.md`; `docs/reference-house/external-review-structural-rh11.md` | load path/topology coordinated; no member, connection, stability, foundation or capacity claim | RH-11 competent structural review → engineering design; material findings rewind owning RH geometry; P03 where physical interface evidence is needed | `OWNED — EXTERNAL PROOF` |
| **Fire / escape / Building Control** | Reference House life-safety geometry; architect + fire/building-control reviewer | `docs/reference-house/external-review-fire-building-control-rh11.md`; `docs/reference-house/external-review-regulatory-baseline-rh11.md` | credible questions and rewind conditions explicit; no compliance claim | RH-11 fire/building-control review → later project compliance/design route; architectural findings rewind RH-03/RH-04/RH-06/RH-09/RH-10 as applicable | `OWNED — EXTERNAL PROOF` |
| **Thermal performance / comfort / overheating** | Reference House environmental/envelope strategy; architect + building physicist | `docs/reference-house/environmental-coordination.md`; `docs/reference-house/envelope-coordination-rh10.md`; `docs/reference-house/external-review-building-physics-energy-rh11.md`; Repose research | passive hierarchy and geometry coordinated; no thermal/dynamic-model result | RH-11 building-physics review → real-site thermal/Part O modelling and technical design; geometry rewinds if fabric/court/openings/roof fail | `OWNED — EXTERNAL PROOF` |
| **Ventilation / IAQ** | Reference House service/environmental strategy; MEP designer | `docs/reference-house/service-topology-rh07-mvhr-addendum.md`; `docs/reference-house/environmental-coordination.md`; `docs/reference-house/external-review-mep-acoustic-rh11.md` | MVHR baseline and MEV fallback coordinated; no sizing/commissioning claim | RH-11 MEP review → real duct sizing, pressure-loss, commissioning and product design; system fallback before architectural growth | `OWNED — EXTERNAL PROOF` |
| **Acoustics** | Architect for spatial separation/repose; MEP + acoustic specialist for technical performance | `docs/reference-house/external-review-mep-acoustic-rh11.md`; `docs/research/repose-and-low-vigilance.md`; RH-11 fire review where Part E interfaces arise | dedicated plant, duct, drainage, ASHP, crosstalk, vibration and residential-target questions already exist | RH-11 acoustic review → later detailed acoustic design/testing; material enclosure/space findings rewind architecture | `OWNED — EXTERNAL PROOF` |
| **Daylight / glare / solar control** | Reference House environmental/opening strategy; architect + building physicist | `docs/reference-house/environmental-coordination.md`; `docs/reference-house/external-review-building-physics-energy-rh11.md`; Repose research | courtyard/opening/shading hypotheses explicit; no real-site daylight model | RH-11 building-physics review → real-site daylight/solar modelling; court/opening geometry rewinds if necessary | `OWNED — EXTERNAL PROOF` |
| **Moisture / envelope / airtightness** | Reference House envelope/interface strategy; architect + building physicist | `docs/reference-house/envelope-coordination-rh10.md`; `docs/reference-house/external-review-building-physics-energy-rh11.md`; boundary semantics where represented | wall/roof/opening boundary duties coordinated; no hygrothermal/airtightness proof | RH-11 building-physics review → junction analysis, airtightness/hygrothermal design and later testing | `OWNED — EXTERNAL PROOF` |
| **Foul drainage / rainwater / discharge** | Reference House service and roof/failure geography; MEP/drainage designer | `docs/reference-house/service-topology-rh06.md`; `docs/reference-house/roof-drainage-access-rh08.md`; `docs/reference-house/external-review-mep-acoustic-rh11.md`; regulatory baseline Part H | topology, access and catchments coordinated; capacity and discharge not proved | RH-11 MEP review for internal drainage → real-site civil/drainage design for rainfall, levels, sewer/soakaway/discharge and approvals | `OWNED — EXTERNAL PROOF` / `OWNED — REAL PROJECT` |
| **Water / hot water / leakage containment** | Reference House service/failure geography; MEP designer | service topology; wet/failure patterns and strategy; RH-11 MEP brief; delivery maintenance-task requirements | routes/isolation/failure principles coordinated; no hydraulic sizing/product design | MEP design, product selection and commissioning; physical/interface testing where non-standard | `OWNED — EXTERNAL PROOF` |
| **Building services / controls** | Reference House service geography; MEP designer; architect retains spatial/replacement consequences | `docs/reference-house/service-topology-rh06.md`; `docs/reference-house/energy-heat-coordination-rh10.md`; `docs/reference-house/external-review-mep-acoustic-rh11.md` | system families/topology/fallbacks coordinated; no detailed MEP design | RH-11 MEP review → appointed project MEP design, controls, commissioning and handover | `OWNED — EXTERNAL PROOF` |
| **Electrical safety / isolation / PV electrical interfaces** | MEP/electrical designer inside controlled service geography; architect for access/location consequences | RH service topology; RH-11 regulatory baseline Part P; RH-11 fire/building-control PV/isolation questions; delivery boundary register | safety duty recognised; detailed circuits, protective devices, earthing and product design not modelled | appointed electrical designer / Building Regulations route at real project; PV specialist where selected | `OWNED — REAL PROJECT` |
| **Accessibility / human factors / low-friction inhabitation** | HFI for research and diagnosis; existing RH gates retain architectural authority; Building Control/access reviewer retains regulatory proof | `docs/development/human-factors-low-friction-inhabitation-programme.md`; `docs/development/human-factors-low-friction-inhabitation-execution-plan.md`; RH-11 fire/building-control access questions | HFI-00 authority/baseline/inventory complete; no new HFI target implied by this matrix | HFI research/audit → controlled rewind to RH-02/RH-03/RH-09/RH-10/RH-11 owner; real-project statutory/access proof remains separate | `OWNED` |
| **Maintenance / replacement / working access** | Ovid’s House maintenance geography + Reference House occurrence; architect + relevant technical designer | `docs/research/external-maintenance-access.md`; `docs/reference-house/external-access-maintenance-plan.md`; `docs/delivery/external-maintenance-access-requirements.md`; delivery task tests | unusually strong architectural/task ownership; real-site access conditions remain open | project technical design and task-by-task verification; real-site scaffold/MEWP/ground/boundary permissions where applicable | `OWNED` / `OWNED — REAL PROJECT` |
| **Security** | Architect owns access/opening strategy; fire/building-control route owns Part Q compatibility; later door/window/security specification owns product performance | `docs/reference-house/external-review-fire-building-control-rh11.md` questions 6, 19 and rewind 7; `docs/reference-house/external-review-regulatory-baseline-rh11.md` Part Q; delivery boundary register includes security | security is explicit at doors/windows/escape and boundary interfaces, but has no broad stand-alone security doctrine or specialist brief | RH-11 Part Q/opening compatibility → real-project site risk and product/hardware specification; commission specialist security advice only where project risk warrants it | `OWNED — THIN` |
| **Windows / doors / thresholds / product-specific interfaces** | architect owns permanent opening/interface geometry; later specialist/product designer owns selected system | opening/threshold patterns; `docs/reference-house/tectonic-integration-rh09.md`; RH-10 envelope/elevation coordination; RH-11 fire/building-physics reviews | architectural interface/failure/replacement obligations coordinated; actual products deliberately unselected | technical design + product evidence/mock-up; reopen architecture only if product families cannot satisfy the controlled opening/interface | `OWNED — REAL PROJECT` |
| **Workmanship / tolerance / constructability / physical testing** | architect/design team for tolerance strategy; fabricator/contractor for execution evidence; prototype programme for selected non-standard interfaces | `docs/research/workmanship-robustness.md`; `docs/development/tectonic-prototype-programme.md`; `docs/delivery/riba-implementation-brief-template.md` | method and prototype gates explicit; selected physical results not yet available | Stage 4/5 tolerance schedules, first articles, representative-installer trials and P03/P04 or other earned prototypes | `OWNED` |
| **Energy / plant sizing / renewables** | Reference House energy/service strategy; MEP + building physicist | `docs/reference-house/energy-heat-coordination-rh10.md`; RH-11 MEP and building-physics/energy briefs | ASHP/emitter/PV families and geometry reservations coordinated; no sizing/compliance result | RH-11 specialist review → real-site heat loss, plant/DHW/emitter/PV design and applicable compliance model | `OWNED — EXTERNAL PROOF` |
| **Cost / proportionality / whole-life carbon** | client + architect own value decision; QS/cost and carbon expertise supplied by real project where material | `docs/delivery/riba-implementation-brief-template.md` governing constraints and Stage 0/1 requirements; project proportionality rules | costs/carbon are decision criteria, not presently quantified whole-house results | real project option comparison/QS/LCA at appropriate RIBA stages; unusual serviceability provision must earn burden before adoption | `OWNED — REAL PROJECT` |
| **Planning / orientation / neighbours / utilities / ground / site access / landscape** | real site + real brief; architect/consultant team | `docs/reference-house/README.md` authority stack and proof limits; `docs/reference-house/external-review-brief.md` real-site questions | intentionally unknowable for site-agnostic Reference House | site selection/survey/planning/utility/ground/drainage/noise/solar/access evidence on actual project; findings may change Reference House-derived geometry | `OWNED — REAL PROJECT` |

### Audit result

**No initial concern family is `UNOWNED`.**

That does not mean the current project is technically complete. It means each material concern tested here has a credible owner and closure route.

Two suspected gaps resolve differently:

- **Acoustics:** not a gap. RH-11 already contains a dedicated MEP & acoustic review brief and explicit architectural rewind conditions.
- **Security:** thinner than neighbouring disciplines, but not ownerless at current scope. Part Q compatibility, escape/security hardware and opening consequences are already explicit. A separate security programme would be disproportionate without a real site/risk profile. If a real project or later audit reveals threats beyond ordinary domestic Part Q/product design, open a bounded security issue then.

No follow-up issue is therefore justified by this audit alone.

---

## 3. Cross-discipline interfaces

Some questions are deliberately not closeable by one row.

| Interface | Required owners |
|---|---|
| window / masonry opening | architect + structure + building physics + fire/security/product design |
| principal entrance / level threshold | architect + HFI/access + drainage/weathering + thermal + door/security product design |
| courtyard | architect + structure + daylight/overheating + drainage + maintenance + real-site orientation |
| plant room / service riser | architect + MEP + structure + fire + acoustics + maintenance/access |
| low-slope roof / PV | architect + structure + building physics/waterproofing + drainage + fire/electrical + maintenance |
| service penetration | MEP + structure + fire/acoustic + air/water/thermal boundary owner |
| stair / upper circulation | architect + HFI + structure + fire/access + later joinery/guarding design |

Where an interface spans rows, **no discipline may treat the other columns as already proved**. The owning architectural gate remains open to rewind until the relevant evidence converges.

---

## 4. Computational boundary

`docs/computational/README.md` remains binding.

The compiler may represent or check bounded plan, structural topology, service topology, boundary obligations and admitted numeric methods. It does not become the owner of structural capacity, fire compliance, acoustic adequacy, building physics, MEP sizing, product performance or site evidence merely because those facts could eventually be represented.

A new computational proof family is demand-led: admit it only after authoritative inputs, a method contract, supported domain and explicit proof boundary exist.

---

## 5. How active programmes use this matrix

When an active programme says a concern is out of scope, it must do one of three things:

1. point to the more specific existing owner/gate;
2. point to the relevant row here when the ownership chain is cross-disciplinary;
3. record `UNOWNED` and open a narrowly bounded issue before relying on the exclusion.

Do not create a new programme simply because a concern crosses disciplines. Prefer the existing architectural owner plus the appropriate evidence/closure gate.

When later work changes ownership materially, update this matrix in the same change that creates the new owner. Do not leave an orphaned obligation between programmes.

---

## 6. Assurance rules

- **Architectural ownership is not specialist proof.**
- **Research evidence is not design authority.**
- **A review brief is not a review result.**
- **A compiler check is not professional certification outside its bounded method.**
- **A reserved volume is not proof that plant, structure or access fits.**
- **Generic project doctrine must not absorb facts that belong to a real site, product or brief.**
- **Product selection stays downstream until the architectural/system family genuinely requires it.**
- **External findings are allowed to rewind architecture.** Downstream drawings or publication work never immunise upstream assumptions.
- **Documenting ownership does not increase project maturity.**

The purpose of this matrix is therefore modest but strict: an unresolved concern may remain unresolved; it may not remain ownerless.