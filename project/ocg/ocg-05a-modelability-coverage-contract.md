# OCG-05A — Reference House modelability / coverage contract

**Programme:** OCG — Occupied Change  
**Parent programme:** #547  
**OCG-05 parent:** #604  
**Packet issue:** #605  
**Depends on:** OCG-04E / PR #603 / merge `d1eb3f16c78eae95aea9dc7484862e3488900ec1`  
**Baseline `main`:** `28ebdd6086621926f84df31afe3897267abacfe8`  
**State:** OCG-05A controlled contract

## Purpose

Freeze what the current controlled Reference House representation can and cannot prove before OCG applies CI-01…CI-13 to it.

This is a **proof-boundary packet**, not a design review and not an intervention verdict.

The governing rule is:

> **Model silence is neither success nor failure. It is a boundary on what OCG is permitted to claim.**

The Reference House is an integration test of selected architectural propositions with explicit proof boundaries. It is not a complete construction model, product schedule, contractor method statement, real site or engineering proof. Generated drawings and deterministic `PASS` outputs are downstream semantic inspection of controlled sources; they do not silently enlarge those sources' authority.

No Reference House geometry, topology, detail, doctrine, pattern, compiler constraint, drawing, delivery requirement or publication prose is changed by this packet.

---

# 1. Controlled evidence hierarchy

OCG-05 must identify the evidence class of every material fact before assigning a finding.

## EH-1 — authoritative represented RH fact

A relationship is positively encoded in a controlled Reference House source at the audit baseline, for example a room relationship, selected service geography, declared route, opening, reservation or selected occurrence.

**Permitted use:** derive/check only the relationship actually represented.

**Not permitted:** infer unmodelled product, fixing, tolerance, performance, contractor or real-site facts merely because the represented relationship looks plausible.

## EH-2 — selected occurrence with unresolved owner proof

The Reference House deliberately selects an architectural occurrence or strategy, but the occurrence register or coordination record explicitly leaves technical closure to later detail, product, engineering, fire, acoustic, moisture, weather, thermal or other owner proof.

Examples include plant packing/withdrawal, service-zone technical closure, wet-side/dry-side technical independence and opening-interface mock-up.

**Permitted use:** prove that the house has selected the occurrence and any explicit geometry/topology that accompanies it.

**Not permitted:** promote the occurrence into technical performance proof.

## EH-3 — derived representation / deterministic semantic check

A drawing, SVG, generated report, PDF or deterministic check derives from controlled sources.

**Permitted use:** corroborate source relationships, expose inconsistency and support inspection.

**Not permitted:** become more authoritative than its source, create missing dimensions, or convert a semantic `PASS` into engineering, product or construction proof.

## EH-4 — upstream doctrine / pattern intent

A governing principle, pattern or strategy states what good architecture should do but does not itself establish that the Reference House physically achieves it.

**Permitted use:** define the proposition against which the RH instance is audited.

**Not permitted:** count as RH implementation evidence.

## EH-5 — held candidate / unselected architecture

A candidate exists in project records but the Reference House has not selected it.

Current examples include:

- Replaceable Architectural Lining;
- Individually Isolatable Manifold Distribution;
- Local Deep Service Zone;
- Selective Floor Access.

**Permitted use:** none as current RH capability. A held candidate may be mentioned only to prevent accidental assumption.

## EH-6 — product / detail / engineering fact not represented

The intervention depends on an exact component envelope, mass, withdrawal direction, support/fixing, seal, fire/acoustic/moisture/weather/thermal performance, electrical capacity, hydraulic behaviour, structural calculation or other technical fact not controlled by the present RH representation.

**Permitted use:** route the proof to the proper owner.

**Not permitted:** assume an ideal conventional solution or mark the architecture failed solely because the external proof has not yet been supplied.

## EH-7 — real-site / DPL fact

The intervention depends on actual boundaries, neighbours, ground bearing, scaffold/vehicle access, staging, utility/sewer positions, highways, rights, landscape maturity or other real-site fact not fixed by the site-agnostic Reference House.

**Permitted use:** identify the dependency and route it to DPL/site proof.

**Not permitted:** invent either a generous or hostile site.

## EH-8 — delivery / contractor-method fact

The consequence depends materially on temporary containment, protection, extraction, sequencing, temporary service, housekeeping, tool choice, work packaging, commissioning procedure or other competent delivery method.

**Permitted use:** distinguish the architectural preconditions from method-dependent consequence.

**Not permitted:** give architecture credit for competent temporary works or fail permanent architecture merely because temporary work is necessary.

---

# 2. Reference House proof-source inventory

The inventory below freezes the principal source classes relevant to OCG-05. It is intentionally selective: OCG needs the controlled source of a claim, not a catalogue of every rendered artefact in the repository.

| Source / authority | OCG use | Evidence class | Boundary |
|---|---|---|---|
| `docs/reference-house/README.md` | Reference House constitutional/proof posture | controlling meta-authority | establishes integration-test and proof-boundary semantics; not physical intervention proof |
| `docs/reference-house/brief-and-constraint-ledger.md` | controlled brief/constraint facts | EH-1 / EH-2 as stated | only explicit frozen constraints may be used |
| `docs/reference-house/pattern-occurrence-register.md` | selected occurrences, current RH service/interface/geography facts, held-candidate status | EH-1 / EH-2 / EH-5 | selected occurrence does not close its listed proof debt |
| `docs/reference-house/structural-coordination.md` | protected structure, designed penetration / structural coordination facts | EH-1 / EH-2 | not a substitute for project structural design or temporary works |
| `docs/reference-house/environmental-coordination.md` | environmental/service coordination relationships | EH-1 / EH-2 | technical performance remains limited to explicitly demonstrated relationships |
| `docs/reference-house/energy-heat-coordination-rh10.md` | current heating/energy topology relevant to CI-12 | EH-1 / EH-2 | no unrepresented plant/product/commissioning assumptions |
| `docs/reference-house/envelope-coordination-rh10.md` | envelope/opening/interface coordination relevant to CI-05 | EH-1 / EH-2 | no automatic weather/thermal/fixing/replacement proof |
| `docs/reference-house/external-access-maintenance-plan.md` | external maintenance geography relevant to CI-02/05 | EH-1 / EH-2 / EH-7 | site-agnostic route intent is not real-site scaffold/access feasibility |
| controlled RH SVGs/drawings/reports | derived inspection of the above | EH-3 | never outrank source/model authority |
| `docs/manuscript/governing-principles.md` | proposition against which RH is tested | EH-4 | not RH proof |
| `docs/manuscript/maintenance-geography-external.md` | complete maintenance-task geography proposition | EH-4 | not RH proof; real site remains external |
| `docs/patterns/service-topology-sequence.md` | service-space ordering proposition | EH-4 | not RH proof |
| `docs/development/manufacturing-strategy.md` | manufacturing/reversibility strategy | EH-4 | no claim that every relevant assembly is manufactured/removable |
| `docs/delivery/README.md` | delivery/method ownership boundary | EH-8 | temporary work does not become architecture |
| `project/dpl/deployment-programme.md` and controlled DPL records | real-site/jurisdiction ownership | EH-7 | site-agnostic RH cannot resolve omitted site facts |
| `docs/computational/README.md` | computation/proof-boundary discipline | meta-authority | representability is not evidence; no new OCG compiler proof is admitted here |
| `project/ocg/ocg-03-canonical-intervention-suite.md` | CI-01…CI-13 briefs | test authority | canonical scenario is not a solution or RH fact |
| `project/ocg/ocg-04e-cross-scenario-synthesis.md` | proof families A–G | audit handoff authority | defines proof debt; does not itself resolve it |

Where a later audit cites a more specific controlled RH source, that source may refine this inventory but may not silently change these evidence semantics.

---

# 3. Current RH facts that OCG may rely on — and their limits

This section freezes the material architectural facts already selected before OCG-05. It is not an assessment of whether they succeed under CI-01…CI-13.

## 3.1 Service geography

Current selected RH direction includes:

- grouped controlled utility entry into the plant/service hub, with separately penetrated/isolatable service intent;
- a plant room of approximately **2.9 × 2.2 m gross**, with plant/control/isolation/riser functions;
- distinct ground/upper dry distribution and low-temperature heating routes rather than one universal mixed duct;
- an accessible vertical service reservation of approximately **900 × 700 mm clear**;
- high-service-room service-wall relationships at the kitchen and upper family bathroom;
- bounded dry room-edge routes where proportionate;
- no generic whole-house service plenum;
- designed/registered primary structural crossings rather than arbitrary drilling.

These are represented architectural occurrences. They do **not** by themselves prove final containment, separation, support, fire/acoustic closure, live congestion, pullability, withdrawal, exact working space or future product compatibility.

## 3.2 Wet-service and water-failure intent

Current selected RH direction includes:

- dry-side maintainability intent for relevant wet-service components;
- fail-safe water-distribution intent;
- visible/recoverable leakage relationships where selected;
- inspectable rainwater routes and an independent visible emergency overflow relationship at the courtyard;
- bounded wet-service-room relationships.

These do not yet prove exact access-opening size, hand/tool clearance, waterproofing independence, component withdrawal, isolation dependency or commissioning procedure.

## 3.3 Openings and interfaces

Current selected RH direction includes:

- permanent masonry opening → tolerance/mounting zone → mechanically fixed replaceable window frame → removable internal trim;
- analogous replaceable-door intent;
- designed threshold and movement/slip-junction propositions;
- sparse controlled attachment planes.

These relationships do not yet prove a future whole-window replacement sequence, exact fixing/sealing continuity, frame withdrawal geometry, exterior access or finish-matching extent. Those are deliberate proof debts.

## 3.4 Floors and finish access

The current RH selects separation of structural floor from changeable layers **where proportionate**, but does **not** select a house-wide access floor. Principal-room floors remain conventional/continuous unless a local task later earns selective access.

OCG must therefore not assume Selective Floor Access, Local Deep Service Zone or Replaceable Architectural Lining simply because they would make a scenario easier.

## 3.5 Maintenance and external access

The RH has controlled external-maintenance geography and a roof-maintenance approach. These establish architectural intent/represented relationships, not actual scaffold, tower, vehicle, neighbour or ground-bearing feasibility on an unknown real site.

## 3.6 Plant replacement

The current plant room is intentionally associated with working and replacement geography. Nominal room dimensions and route labels are **not** proof that the largest controlled finite-life plant item can be disconnected, handled, turned, removed to outside and replaced.

## 3.7 Structural change

The RH protects primary structure from arbitrary service drilling/cutting and coordinates designed crossings. CI-13 is deliberately a slow-fabric structural-replanning control. OCG-05 must not redesign a wall or infer temporary works simply to make the control favourable.

---

# 4. RH finding / evidence vocabulary

These states answer different questions and may coexist at one proof unit. They are not a traffic light and must never be aggregated into a scenario score.

## `PROVEN`

The relevant RH relationship is explicitly represented in controlled authority and can be derived or checked at the current baseline **within the stated proof boundary**.

`PROVEN` must name what is proven. Example form: `PROVEN — route continuity between represented nodes`, not `PROVEN — intervention easy`.

## `PARTIAL`

A relevant subset of the required relationship is represented, but the complete intervention claim crosses one or more unproven facts.

`PARTIAL` must identify both represented subset and missing closure.

## `UNKNOWN`

A relevant real fact is currently unknown. This is appropriate where the fact exists conceptually but neither the RH nor another controlled authority establishes its value.

## `NOT_REPRESENTED`

The relevant fact may exist in a real project but is absent from the controlled RH model/source. This differs from `UNKNOWN`: the model itself does not encode the needed fact strongly enough for OCG to derive it.

## `OWNER_PROOF_REQUIRED`

The occurrence/geometry may be represented, but the decisive technical performance belongs to another authority: for example fire, acoustic, moisture, weather, structural, product, manufacturer or specialist design.

This is **not automatically a defect**.

## `SITE_PROOF_REQUIRED`

Resolution depends on actual site/project facts outside the site-agnostic Reference House.

This is **not automatically a defect**.

## `DELIVERY_METHOD_REQUIRED`

Resolution depends materially on competent temporary works, sequencing, protection, extraction, work packaging, testing/commissioning procedure or other delivery method.

This is **not automatically a defect**.

## `DEFECT_CANDIDATE`

A currently represented RH relationship appears to contradict or materially fail a selected upstream proposition strongly enough to require OCG-05E owner routing.

This state has a high evidential bar. It may be used only when:

1. the challenged upstream proposition is identified;
2. the relevant RH relationship is positively represented rather than merely omitted;
3. the contradiction/failure follows without importing an idealised product/site/method assumption; and
4. the finding states which owner must investigate it.

`DEFECT_CANDIDATE` authorises **routing**, not a design fix.

---

# 5. Proof-unit schema

The smallest OCG-05 audit record is:

`canonical scenario × proof family × exact RH source/fact × intervention-sequence step × consequence dimension × evidence/finding state × owner/proof route`

Each proof unit must contain:

| Field | Required content |
|---|---|
| Scenario | stable `OCG-CI-xx` ID and unchanged canonical purpose |
| Proof family | A–G from OCG-04E |
| RH source/fact | exact controlled path plus the specific represented relationship, or explicit absence |
| Sequence step | the relevant step from the canonical/full intervention sequence |
| Consequence dimension | fabric; service; occupancy; contamination/work; logistics; recovery — one or more named, never collapsed |
| Evidence class | EH-1…EH-8 |
| Finding/evidence state | one or more exact states from §4, with scope |
| Owner/proof route | architecture/detail/specialist/delivery/site/unresolved as applicable |
| Nonclaim | what the evidence does not establish where overclaim is plausible |

There is **no scenario-level aggregate status**. A scenario can simultaneously contain a `PROVEN` architectural route, `OWNER_PROOF_REQUIRED` technical boundary, `SITE_PROOF_REQUIRED` external continuation and `DELIVERY_METHOD_REQUIRED` containment consequence.

The audit is complete when the material proof units are explicit enough to support 05E routing, not when every unit says `PROVEN`.

---

# 6. OCG-04E proof-family contract

The seven recurring proof families remain exactly the OCG-04E handoff.

## A — live packing / withdrawal reserve

Tests actual working, disconnection, handling and withdrawal/replacement geography. Nominal room size, opening label or route existence is insufficient.

Typical owner boundary: RH geometry can establish represented clearances/routes; product envelope/mass/handling may require owner proof; exterior continuation may require site proof.

## B — service-zone closure

Tests whether vertical/horizontal/local service geography closes under actual containment, separation, support, congestion, crossings, maintenance and live-route obligations.

Typical owner boundary: RH can prove represented topology/reservations; specialist/fire/acoustic/detail proof may remain external.

## C — local closure / reinstatement

Tests how a bounded route, interface or access point is opened and returned to finished use without avoidable propagation into adjacent fabric/finish fields.

Typical owner boundary: architecture/detail can establish interfaces; actual temporary protection/finish workmanship remains method/product dependent.

## D — wet-side / dry-side independence

Tests whether a wet-service intervention can be reached/worked/reclosed while waterproofing and other wet technical boundaries remain genuinely independent where that independence is claimed.

Typical owner boundary: represented access side is not waterproofing-performance proof.

## E — opening / component mock-up

Tests replaceable window/door/threshold/component relationships as real fixing, continuity, withdrawal and reinstatement sequences.

Typical owner boundary: represented opening hierarchy is not a tested future product/interface mock-up.

## F — isolation / test procedure closure

Tests the architectural isolation geography and outage boundary while preserving the distinction between architecture and competent technical procedure/recommissioning.

Typical owner boundary: represented isolation point/topology can be architectural evidence; actual safe isolation, draining, testing and commissioning may require technical/delivery proof.

## G — occupied work / recovery boundary

Tests containment, route occupation, room/function continuity, making-good, cleaning and adjacent-finish consequence without attributing method/site facts to permanent architecture.

Typical owner boundary: architecture can bound or enlarge the territory; contractor method controls much of temporary containment/housekeeping; real external staging may be site-dependent.

---

# 7. CI-01…CI-13 modelability map

Legend:

- **M** — material proof family for the scenario;
- **m** — secondary/material only if the instantiated RH path invokes it;
- **—** — not expected to control the scenario at this gate.

The map identifies **where to look**, not whether the house succeeds.

| Scenario | A | B | C | D | E | F | G | Current modelability boundary |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|---|
| CI-01 inspect/clear foul drainage | m | M | M | — | — | m | M | drainage geography can be tested where represented; actual blockage/site continuation, hygiene method and some access details may remain external |
| CI-02 inspect/clear roof rainwater collection/outlet | m | m | M | — | — | — | M | represented roof/rainwater/access relationships are auditable; real scaffold/ground/neighbour/weather method requires site/delivery proof |
| CI-03 replace concealed shower control/mixing valve | M | M | M | M | m | M | M | dry-side/service-wall intent is auditable; exact product, opening, waterproofing and isolation closure are not assumed |
| CI-04 replace largest bounded finite-life plant module | M | M | M | — | m | M | M | plant room/routes are auditable; exact controlled product envelope/mass/handling and exterior continuation require proof |
| CI-05 replace complete window assembly | M | — | M | — | M | — | M | opening/interface hierarchy is auditable; fixing/seal/withdrawal/mock-up and exterior access remain bounded proof debts |
| CI-06 renew leaking upper water branch | m | M | M | m | — | M | M | selected service routes/reservations are auditable; exact branch routing, closure, isolation and leak-repair method may be partial/unrepresented |
| CI-07 add new data branch to occupied bedroom | m | M | M | — | — | m | M | room-edge/dry distribution intent is auditable; pullability, endpoint/furniture conflicts and unrepresented crossings must remain explicit |
| CI-08 complete family-bathroom refit | m | M | M | M | m | M | M | room/service relationships are auditable; full fixture/product/waterproofing/curing/material-route facts are not presumed |
| CI-09 complete kitchen refit | M | M | M | m | m | M | M | kitchen service edge/plant relationship is auditable; cabinetry/appliance/product/logistics/method facts may remain external |
| CI-10 create remote en-suite outside selected wet-service geography | m | M | M | M | — | M | M | deliberate non-provision can be established; 05C must not redesign or grant speculative service geography to improve outcome |
| CI-11 renew primary electrical distribution | m | M | M | — | — | M | M | selected dry routes/service hub are auditable; real cable/pull/separation/capacity/temporary supply/detail facts need owner/method proof |
| CI-12 renew/materially upgrade primary space-heating system | M | M | M | m | m | M | M | current energy/heat topology and routes are auditable; future plant/emitter/product/system design is not represented merely because space exists |
| CI-13 major load-bearing-wall replanning control | M | m | M | — | — | M | M | present structure/service crossings can be inspected; proposed redesign, temporary works and altered structural solution are intentionally outside the current model |

The matrix deliberately marks many scenarios modelable only in **parts**. That is the expected condition of a legitimate Reference House at this maturity.

---

# 8. Anti-overclaim rules

These rules are binding on 05B/05C/05D/05E.

1. **Doctrine/pattern language is not RH geometry proof.** Use it as the proposition being tested, never as evidence that the instance already complies.
2. **Derived representation does not outrank its source.** A drawing or `PASS` cannot create a relationship absent from controlled authority.
3. **An opening is not working clearance.** Access aperture, hand/tool space, disconnection space and withdrawal geometry are distinct facts.
4. **A route is not route capacity.** Route existence does not prove bend/pull/handling envelope, congestion, support, separation or complete old-out/new-in renewability.
5. **Isolation intent is not all outage dependency.** A represented valve/switch/topology does not prove every coupled service or safe technical procedure.
6. **Omitted detail is not successful conventional construction.** Missing fixings, seals, closures or interfaces remain unknown/not represented/owner proof as appropriate.
7. **Site-agnostic exterior space is not real-site feasibility.** Do not infer scaffold, tower, vehicle, sewer, utility, boundary or neighbour feasibility.
8. **Technical-boundary occurrence is not performance proof.** Fire, acoustic, moisture, weather, thermal, structural and similar performance remain with the proper technical owner unless explicitly proved.
9. **Delivery assumptions are not architecture.** Temporary containment, protection, extraction, sequencing, housekeeping and commissioning method stay with delivery even when architecture makes them easier or harder.
10. **No redesign during modelability review.** In particular, do not alter CI-10's deliberately remote wet-room challenge or CI-13's structural control.
11. **No held-candidate leakage.** Replaceable lining, universal manifold, local deep service zone or selective floor access cannot be granted to the RH unless a later authorised architectural packet actually selects them.
12. **No missing-model defect inflation.** `UNKNOWN`, `NOT_REPRESENTED`, `OWNER_PROOF_REQUIRED`, `SITE_PROOF_REQUIRED` and `DELIVERY_METHOD_REQUIRED` do not become `DEFECT_CANDIDATE` merely because further proof would be useful.
13. **No nominal-dimension optimism.** A room/riser/opening dimension proves only the geometry actually represented, not future component compatibility.
14. **No zero-disruption inference.** Even a physically bounded architectural intervention may entail legitimate noise, dust, wet work, curing, outage or room surrender.
15. **Complete sequence or bounded non-verdict.** If removal, replacement, test, reinstatement, cleaning or return-to-use cannot be evaluated, say so; do not stop at `access achieved` and call the intervention solved.

---

# 9. Packet split after 05A

The controlled sources support the programme split without semantic drift:

`05B (CI-01…CI-07) ∥ 05C (CI-08…CI-10) ∥ 05D (CI-11…CI-13)`

All three packets must:

- use this 05A evidence hierarchy and vocabulary;
- cite the exact current RH source/fact for each material proof unit;
- preserve the canonical scenario starting condition and purpose;
- trace the complete applicable intervention sequence;
- keep all six consequence dimensions available without aggregation;
- preserve architecture/detail/specialist/site/delivery ownership;
- report model silence as model silence;
- create no design response directly;
- send every credible `DEFECT_CANDIDATE` to 05E rather than fixing it locally.

For reconciliation, each packet closeout must distinguish:

1. what the RH positively establishes;
2. what remains unrepresented;
3. what requires external owner/site/delivery proof;
4. what, if anything, is a genuine represented contradiction candidate.

---

# 10. Rejected shortcuts

## 10.1 Treating the pattern-occurrence register as complete physical proof

Rejected. The register is deliberately honest about unresolved proof.

## 10.2 Requiring a construction-level model before OCG-05 can run

Rejected. OCG can produce useful bounded findings by distinguishing represented fact from proof debt. Demanding false completeness would be as misleading as assuming missing facts.

## 10.3 Converting every missing detail into an OCG defect

Rejected. Many missing facts belong to later project stages, product selection, specialist design or real-site deployment.

## 10.4 Granting held candidates because they are already documented

Rejected. Documentation is not selection.

## 10.5 Creating a scenario pass/fail percentage

Rejected. Different consequence dimensions and ownership states are not commensurable.

## 10.6 Adding OCG fields to the compiler now

Rejected. OCG-08 owns any later computational admission after physical audit and synthesis. Modelability here describes the current evidence surface; it does not enlarge it.

---

# 11. Integrity checks

## 11.1 Source hierarchy

**PASS.** Controlled RH fact, selected-but-unresolved occurrence, derived representation, doctrine/pattern intent, held candidate, product/detail/engineering fact, site fact and delivery-method fact remain distinct.

## 11.2 Evidence vocabulary

**PASS.** `PROVEN`, `PARTIAL`, `UNKNOWN`, `NOT_REPRESENTED`, `OWNER_PROOF_REQUIRED`, `SITE_PROOF_REQUIRED`, `DELIVERY_METHOD_REQUIRED` and `DEFECT_CANDIDATE` have non-overlapping purposes and are not collapsed to traffic lights.

## 11.3 Proof unit

**PASS.** The unit binds scenario, proof family, exact source/fact, sequence step, consequence dimension, evidence/finding state and owner/proof route.

## 11.4 Canonical-suite integrity

**PASS.** CI-01…CI-13 remain unchanged; CI-10 and CI-13 retain their adversarial control roles.

## 11.5 OCG-04E handoff

**PASS.** Proof families A–G are preserved and mapped without claiming resolution.

## 11.6 No design response

**PASS.** No RH geometry/topology/detail, doctrine/pattern, compiler constraint, drawing, delivery requirement or publication prose is changed or authorised.

## 11.7 Anti-overclaim

**PASS.** Model silence, external-owner proof, site facts and contractor method cannot masquerade as either architectural success or architectural failure.

---

# Result

**OCG-05A PASS — the Reference House modelability / coverage contract is frozen.**

The most important consequence is methodological:

> **OCG-05 is allowed to prove only what the controlled Reference House positively represents, and it must preserve every external proof boundary that remains.**

The current proof surface is sufficient to run the canonical suite because OCG does not require every scenario to become fully `PROVEN`. A rigorous result may instead be a precise combination of represented fact, model silence, specialist proof, site proof and delivery-method dependency.

After clean merge, the authorised split is:

`OCG-05B (CI-01…07) ∥ OCG-05C (CI-08…10) ∥ OCG-05D (CI-11…13)`

All three feed OCG-05E. No architectural correction is authorised before that reconciliation gate.