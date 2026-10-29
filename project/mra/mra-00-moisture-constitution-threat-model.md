# MRA-00 — Moisture constitution, inventory and threat model

**State:** complete assurance-definition baseline; no selected-house assurance pass
**Date:** 2026-10-29 (targeted closeout of the 28 October first pass)
**Parent:** [MRA — Moisture Resilience Assurance](moisture-resilience-assurance-programme.md) / [#959](https://github.com/adamnoden/architecture/issues/959)

## Question

What exact moisture-resilience claim is Ovid’s House trying to earn, what existing project material already supports it, what counts as a credible failure, and what questions must IAS/OAS/HAD answer before the selected house can be assaulted as one water-management system?

MRA-00 is an assurance-definition packet. It does **not** redesign the house, select an opening detail, specify plumbing products, perform building-physics calculations or claim technical adequacy.

---

## 1. Result of the constitutional check

No new moisture-specific governing principle is currently justified.

The general authority already exists in the Governing Constitution:

- **Principle 3 — Design the interface** requires sealing, drainage, inspection, movement and renewal duties to be deliberately resolved at junctions;
- **Principle 4 — Make foreseeable failure detectable, containable and repairable** already asks how a system fails, what the failure touches, how it is detected and where it is stopped;
- **Principle 5 — Give maintenance a geography** already extends inspection, cleaning and repair to roof, façade, ground plane and external routes;
- **Principle 8 — Design for repose** supplies the occupation consequence: the house should not demand continuous vigilance simply to remain comfortable;
- **Principle 9 — Let passive architecture do the first work** already gives drainage and gravity priority before active correction.

MRA therefore does not create an upstream doctrine saying that moisture is universally the dominant architectural risk. That would overstate a project risk preference as general truth.

Instead, the Reference House adopts a deliberately stronger **assurance posture** within the existing constitution:

> **No credible single failure of a seal, joint, fitting, local waterproofing element, drain, water-bearing component or ordinary maintenance item should be capable of producing prolonged concealed wetting of permanent fabric.**

Where an ordinary maintenance degradation can plausibly coincide with a normal weather or service event, selected bounded compound cases are also tested.

The preferred abnormal-water behaviour is:

> **outward, visible, local, isolatable and dryable.**

This is a project-specific assurance burden, not a literal leak-proof guarantee and not a general claim that all houses require the same redundancy.

---

## 2. Why concealed wetting is the primary failure state

MRA distinguishes **water entry** from **destructive moisture failure**.

A robust house may experience local wetting during construction, rain exposure, maintenance, a failed hose or an ageing seal. The unacceptable condition is water that can remain in contact with vulnerable long-lived fabric without a short, credible route to one or more of:

- harmless shedding or drainage;
- obvious visible declaration;
- local containment;
- rapid isolation;
- inspection and repair;
- drying before material degradation becomes significant.

“Prolonged” is relative to the actual material, exposure, temperature, contamination and available drying route; it is not a universal number of hours. If that duration is decisive and unestablished, route the evidence and keep the row unresolved. “Visible” means a recognisable abnormal indication at a reachable observation point, not merely water somewhere outside; a dry finish does not prove a dry deck behind it.

The assurance target is therefore not “zero water”. It is **zero credible silent path from an ordinary defect to prolonged hidden attack on permanent fabric**.

This distinction prevents MRA from rewarding brittle over-sealing, unnecessary tanking or hidden redundancy that itself creates moisture traps.

---

## 3. Threat vocabulary

### 3.1 Moisture-source families

MRA uses six source families. The first five are physical water/moisture sources; the sixth is a project-delivery source capable of loading the same assemblies before occupation.

| Family | Typical initiating sources | Primary downstream packets |
|---|---|---|
| `EXT` — external bulk water | rain, wind-driven rain, roof runoff, splash, blocked rainwater collection, surface water | MRA-01 |
| `GRD` — ground/capillary water | wet ground, splash zone, capillary rise, local surface-water accumulation, below-ground interfaces | MRA-01; site facts remain DPL-owned |
| `INT` — internal supply/process water | mains, hot/cold distribution, hydronic systems, cisterns, appliances, filters, relief discharge | MRA-02 |
| `WST` — foul/waste/condensate water | traps, wastes, soil stacks, appliance drains, condensate, blockage/backflow consequences | MRA-02 |
| `VAP` — vapour/condensation | bathing/cooking humidity, cold surfaces, interstitial condensation, cold ducts/pipes, trapped vapour | MRA-03 |
| `CON` — construction moisture | rain-wetted materials, wet trades, premature closure, trapped moisture at handover | MRA-03 / DEL |

### 3.2 Failure-mechanism classes

A source becomes an MRA scenario when paired with at least one credible mechanism:

- **loss of primary weathering** — displaced covering, failed flashing, aged perimeter seal, failed local gasket;
- **blocked or exceeded drainage** — gutter/outlet/drain blockage, debris, local capacity exceedance, reversed/incorrect fall;
- **tracking or bypass** — water follows a sleeve, fixing, cavity bridge, threshold, crack or material interface around the intended defence;
- **supply leakage** — joint, hose, valve, fitting, vessel or component leakage;
- **waste leakage / surcharge** — failed trap/connection, blockage, backflow or overflow;
- **condensate failure** — blocked, disconnected, poorly fallen or freezing condensate route;
- **vapour/air-boundary failure** — moist air reaches a persistently cold surface or moisture-sensitive layer;
- **construction/closure error** — an assembly is enclosed while materially wet or a drainage path is obstructed during finishing;
- **maintenance degradation** — ordinary fouling, ageing, seal wear or loss of adjustment that should be expected during the building’s life.

### 3.3 Vulnerability classes

The threat model distinguishes what gets wet because consequence depends on the receiving layer.

- **sacrificial / readily dryable finish** — local visible wetting may be acceptable if it declares failure and dries without propagating;
- **replaceable assembly** — local damage can be tolerable if removal is bounded and permanent interfaces remain intact;
- **insulation / concealed lining / cavity contents** — prolonged wetting is high concern because drying and diagnosis may be poor;
- **timber / corrosion-sensitive structure or fixings** — consequence can become structural or recurrent;
- **permanent masonry / concrete** — wetting is not automatically failure, but persistent saturation, salts, freeze/thaw, corrosion interfaces, trapped finishes and adjacent materials can make it consequential;
- **occupied environmental surface** — mould, odour, staining and high humidity can fail repose/health before structural damage occurs.

MRA does not equate every damp masonry surface with structural failure. The matrix records actual vulnerability and drying behaviour rather than treating “wet” as a single binary state.

---

## 4. Credible-failure boundary

### 4.1 Credible single failure

For MRA, a credible single failure is **one local defect, degradation, blockage, omission or component failure that a competent long-life house should reasonably tolerate without prolonged concealed wetting of permanent fabric**.

Examples include:

- one failed perimeter seal;
- one locally displaced roof/weathering component;
- one blocked primary rainwater outlet;
- one leaking pipe joint, valve, appliance hose or cistern connection;
- one disconnected/blocked condensate route;
- one failed local wet-room junction;
- one penetration seal allowing tracking;
- one extract fan/route unavailable during an ordinary humidity episode;
- one construction area closed before it has adequately dried.

The test assumes the rest of the building is in ordinary serviceable condition. It does not require simultaneous independent failures everywhere.

### 4.2 Bounded compound failure

A compound case is admitted when **one foreseeable maintenance degradation and one normal environmental/service event are plausibly concurrent**.

Examples:

- partially fouled gutter + ordinary heavy rain;
- aged external seal + wind-driven rain;
- appliance leak + temporarily unoccupied house;
- wet-room extract degradation + several consecutive showers;
- minor drain restriction + normal appliance discharge;
- construction moisture + ordinary cold-weather drying conditions.

This is not unrestricted N+2 redundancy. The point is to prevent the single-fault model becoming artificially generous by assuming every maintenance item is perfect precisely when the ordinary load arrives.

### 4.3 Outside the generic Reference House claim

The following are not silently absorbed into MRA’s internal assurance claim:

- real-site fluvial, coastal, reservoir or groundwater flood exposure;
- site-specific sewer surcharge or drainage-authority constraints;
- extreme events outside an explicitly selected design basis;
- gross structural collapse;
- deliberate damage or exceptional misuse;
- product defects whose failure mode cannot be established without product-specific evidence;
- statutory, warranty or insurer acceptance.

Where these become relevant, DPL/EPR/DEL or a real commission owns the evidence. MRA must still test the building-side consequence of a named blocked or submerged receiver and state the receiving-level condition that the site must satisfy. Unknown actual flood probability is not permission to declare an intrinsically trapped path safe. If the condition cannot be satisfied, reject the candidate/site combination or request a design rewind; do not invent a lower garden, capacity or route through occupied rooms.

---

## 5. Existing assurance inventory

MRA begins with substantial existing principles and local water reasoning. Their existence is not evidence that the current house satisfies them: **applicability, composition and claim strength** must be tested against the selected source.

| Existing source | What it already establishes | MRA use | Current gap / caution |
|---|---|---|---|
| `docs/manuscript/governing-principles.md` | interface design; failure detection/containment/repair; maintenance geography; repose; passive drainage/gravity | constitutional authority | intentionally general; does not itself impose MRA’s higher moisture-specific assurance burden |
| `PAT-009 Accessible Rainwater Route` | inspectable rainwater collection, deliberate overflow/failure path, safe discharge, tolerance-aware falls | external-water baseline | hydraulic capacity and selected-house details remain unproved |
| `PAT-017 Visible Leakage Path` | passive route for consequential concealed leakage to declare itself before vulnerable fabric is consumed | internal-water and concealed-interface baseline | selective/proportionate, not a blanket secondary-drainage requirement |
| `PAT-018 Failure-Tolerant Wet Service Room` | room-scale tolerance where concentrated water risk earns it; accessible isolation, containment/drainage/drying | wet-zone baseline | exact Reference House wet-room construction not yet selected |
| `Fail-Safe Water Distribution` strategy | eliminate concealed joints first, then access → visibility → containment → isolation → room-scale tolerance | whole internal-water hierarchy | existing strategy says least-complex adequate measure; MRA now supplies a deliberately stricter consequence test for this house |
| `PAT-001 Controlled Utility Entry` | few deliberate penetrations, accessible isolation, explicit water/weather boundary duties, outward fall where relevant | ingress/penetration baseline | selected utility-entry water-tracking detail remains unresolved |
| `PAT-005 Designed Structural Penetration` | every crossing owns applicable water/air/thermal/fire/acoustic duties; external penetration must not fall inward/trap water | penetration baseline | product/detail performance remains technical evidence |
| `PAT-020 Designed Threshold` | external threshold explicitly owns drainage/weathering, datum and replacement duties | door/ground interface baseline | level-access + water-management geometry needs OAS/real-site resolution |
| `PAT-007 Permanent Opening / Replaceable Window` | building-side drainage distinct from frame weathering; sill fall; no sealant-only weather defence; water layer survives replacement | opening baseline | jamb/head/sill family still requires OAS selection and proof |
| bathroom/kitchen source-capture patterns | capture moisture/grease close to source; short maintainable routes; condensate and commissioning duties | vapour/source-control baseline | actual whole-house ventilation topology and performance remain technical questions |
| `PAT-011 Roof Maintenance Route` | roof maintenance is a designed task with credible access and working position | inspection/renewal baseline | current roof candidate must be used; old low-slope assumptions are not current authority |
| `docs/reference-house/whole-house-coordination-audit.md` | records predecessor RH-10 intentions for outward roof drainage, no internal roof outlet, inspectable collection, courtyard overflow and short wet routes | historical reasoning and obligation seed only | no current-house discharge, plant leak geography, overflow or maintenance pass transfers; HRS current basis controls applicability |
| `docs/reference-house/envelope-coordination-rh10.md` | drained masonry-cavity family; slow envelope remains complete without removable trim; window/penetration moisture duties explicit | envelope-family baseline | its low-slope roof/parapet language is superseded by the newer roof constraint and must not be carried into MRA as current geometry |
| `docs/reference-house/pattern-occurrence-register.md` | maps selected water/opening/environment patterns to Reference House occurrences and outstanding proofs | obligation inventory seed | several occurrence descriptions still refer to the previous low-slope/two-storey design state; use as provenance, not unquestioned current geometry |
| [Current house basis](../../docs/reference-house/current-house-basis.md), `layout-revision.ts` / `layout-family.ts`, `project/design-constraints.ts` | RH-LAYOUT-REVISION-02: 12 m square shell, 3.5 m court and provisional 25° inward/outward ring; no-flat-roof constraint remains | current geometric authority and explicit technical limits | four inner valleys and both eaves need actual collection/escape; nominal service and wet-room reservations are not fit or moisture proof |

### Targeted additions and current obligation inventory

| Inspected source | Material contribution / precise limit |
|---|---|
| [PAT-002 Plant Room as Service Hub](../../docs/patterns/plant-room-service-hub.md), [PAT-004 High-Service-Room Service Wall](../../docs/patterns/high-service-room-service-wall.md) | Actual isolation, working and replacement tasks; concentration/access does not itself contain water, establish a dry-side passage or select equipment. |
| [PAT-012 Physical Service Index](../../docs/patterns/physical-service-index.md) | Legible component/isolation identity survives ordinary account loss; a label or reminder is not a physical declaration or passive failure path. |
| [PAT-016 Compartmented Service Void](../../docs/patterns/compartmented-service-void.md) | Continuous services do not justify a continuous uncontrolled void. Its fire/acoustic boundary logic is not certification of a water stop; moisture tracking and closure/drying need their own actual section. |
| [IAS wet variants](../ias/ias-02w-wet-kitchen-variants.md), [services/access](../ias/ias-02s-services-access.md) | IW-01…05 retain complete wet floor/wall/threshold, sanitary fit, leak declaration/isolation/drying and utility containment questions. Ordinary dry finishes and removable faces are not waterproof assemblies; the 300 mm ground reserve is separate from the fully allocated 350 mm intermediate floor. |
| [OAS representative detail](../oas/representative-detail-completion.md) | Bounded nominal front threshold and window interfaces are established at study scope. Court/garden thresholds remain distinct obligations; neither front levels nor a packet completion supplies the court's first vulnerable boundary. |
| [HAD furnished study](../had/had-03-furnished-design-study.md), [en-suite fit review](../had/had-03-ensuite-fit-review.md), [relocation trial](../had/had-03-relocation-trial.md) | Current small en suite remains unfitted; relocation is a candidate. A room/fixture rectangle does not establish waterproofing, connected waste, service-face access or safe use. |
| [IAS Bedroom 4 section](../ias/ias-03-bedroom4-wet-section.md) and [HAD allocation](../had/had-03-bedroom4-allocation.md) | Accepted partial studies remain unadopted. Corrected tray/flange datums supersede the withdrawn draft clash; favourable route arithmetic does not select a complete wet boundary, connected stack/foul exit or housing-renewal method. The shorter NW option introduces an unresolved directly wetted window. |
| [Roof topology](../../docs/research/roof-topology-families.md), [assembly](../../docs/research/roof-assembly-options.md), [access](../../docs/research/roof-access-and-renewal.md) | ROF comparisons expose inner-valley concentration, underlay/common-receiver dependence and rejected ordinary high court tower. No selected roof assembly or admitted high-level working method follows; a conditional scaffold is not a maintenance pass. |
| [RWT failure study](../../docs/research/rainwater-failure-and-exceedance.md), [court-route partial](../rwt/rwt-06-access-court-transition.md) | Candidate-specific next paths and fault cuts exist. Inner spill transfers load into a still-trapped court; direct court rain persists under high transfer. Low/higher crossing alternatives remain unadmitted pending full floor/support, vulnerable levels, hydraulic head/receiving conditions and access. |
| [BCR water](../bcr/bcr-water-result.md), [wet](../bcr/bcr-wet-result.md), [services](../bcr/bcr-services-result.md), [structure](../bcr/bcr-structure-result.md) | Completed investigations locate material adverse findings and owning handoffs, not accepted construction. Preserve pinned low-twin evidence separately from later higher relief; do not turn a waterproof core into a complete wet boundary or a plant body into connected system capacity. |
| [BCR proportionality](../bcr/bcr-proportionality-result.md), [roof/water contract](../roof-water-interface-contract.md) | Additional interfaces and owner attention must earn their burden. Conventional construction still has actual water/access duties; no cost or component-count argument waives a harmful failure path. |

This inventory was reconciled against accepted main `0d0e6e9dbe6f337fa112dcdddae4c703b134605d`. Later design changes require affected-row applicability review; moving peer drafts are not adopted evidence. MRA-00 does not rewrite historical records or their source fingerprints.

### Inventory conclusion

The existing pattern language already covers the right *types* of intervention. MRA should resist creating new patterns merely to strengthen rhetoric.

The missing layer is a **house-level fault model** that makes every consequential water route answer the same questions and rejects locally plausible details that compose into a globally hidden failure path.

---

## 6. Authority correction discovered during kickoff

MRA must not use the old low-slope roof as the selected-house baseline.

RH-10 records retain predecessor low-slope geometry; the later Georgian re-plan also contains an outward-only roof assumption. Neither is the current roof authority. HRS current-house reconciliation and ROF-02 bind the actual provisional inward/outward 25° ring with four inner valleys. The no-flat/very-low-slope constraint survives, but it does not convert that ring into outward-only drainage or prove safe court overflow.

This is not itself an MRA design change. It is an **authority-selection rule**:

> MRA-01 must attack the roof geometry that survives IAS/OAS/HAD/TRIAD integration, using the current project design constraint, not historical RH-08/RH-10 roof prose.

Historical RH-10 water reasoning remains useful where the underlying proposition survives—for example external inspectable rainwater routes, independent overflow and maintenance access—but its obsolete roof family is not silently inherited.

---

## 7. Whole-house assurance matrix contract

MRA-01/02/03 populate domain matrices using the following fields. MRA-04 composes them without weakening or renaming the initiating scenario.

| Field | Required content |
|---|---|
| `id` | stable MRA scenario identity |
| `family` | `EXT`, `GRD`, `INT`, `WST`, `VAP` or `CON` |
| `location / assembly` | actual selected-house occurrence, source revision/blob and applicability scope; a historical or candidate occurrence must be labelled |
| `initiating event` | one credible single failure or admitted bounded compound case; identify the failed element, normal load/maintenance state and scope of the failure |
| `water/moisture source` | physical source and expected direction/pressure/volume class where known |
| `path` | physical route water/moisture takes after initiation |
| `primary defence` | first intended prevention/shedding/control mechanism |
| `secondary / failure path` | next physical route under the named fault, including shared receiver/obstruction/backwater and why any claimed independence survives it; `none justified` must be explicit |
| `first vulnerable fabric` | actual first material/layer or boundary whose wetting matters, with level/contact relation where relevant; a plausible investigation target is not a determined first layer |
| `declaration` | where/how abnormal water becomes visible or otherwise unambiguously discoverable |
| `detection latency` | immediate / short / periodic inspection / unresolved, with the physical basis and relation to material wetting/drying; no invented response time or assumption that someone is present |
| `containment / discharge` | where water is physically stopped or safely sent |
| `isolation` | means of stopping continuing source where applicable |
| `access / repair` | credible route to inspect, reach, remove and reinstate the failed item |
| `drying route` | how wetted layers return to a safe dry state without destructive guesswork |
| `maintenance dependency` | item whose cleaning/renewal is required and how that requirement remains legible |
| `workmanship tolerance` | what ordinary site error can occur before water behaviour reverses or becomes hidden |
| `evidence state` | internal architectural reasoning / calculation needed / product evidence / PHY / EPR / DEL / DPL / real commission |
| `owner` | IAS, OAS, HAD, BCR, PHY, EPR, DEL, DPL or other explicit owner |
| `status` | `PASS-INTERNAL`, `OBLIGATION`, `REWIND`, `OUTSIDE-SCOPE` |

### Pass rule

A row may be `PASS-INTERNAL` only if the physical route is legible enough to show that the stated single failure does not plausibly create prolonged concealed wetting of permanent fabric at the Reference House’s current evidence level.

A row remains `OBLIGATION` where an essential path, first vulnerable layer, declaration, drying route, capacity/head or maintenance operation is unknown, even when its owner is named. Use `REWIND` for an evidenced conflict requiring a design change. `OUTSIDE-SCOPE` names the external premise and retained building-side compatibility condition; it cannot excuse an unresolved internal crossing, threshold or receiving requirement. A labelled separate pipe is not independent under a shared failed receiver. Reassess affected rows after a source change rather than carrying a historical pass forward.

A conventional detail is not automatically a pass because it is conventional. Conversely, MRA does not demand an extra membrane, tray, drain or sensor where ordinary geometry already gives the stronger answer.

---

## 8. Defence hierarchy used by every packet

When a scenario fails, correction is sought in this order:

1. **remove the failure opportunity** — simplify geometry, remove concealed joints, reduce penetrations;
2. **shed / drain by form and gravity** — falls, laps, drips, cavity drainage, capillary breaks, outward routes;
3. **add a simple passive second line where consequence earns it**;
4. **make failure declare itself before permanent fabric is consumed**;
5. **contain and isolate locally**;
6. **preserve a credible drying route**;
7. **add sensing/automation only as supplementary response**;
8. **make inspection/renewal normal and physically possible**.

A proposed redundancy that creates a hidden stagnant zone, relies on inaccessible outlets, makes drying worse or multiplies failure interfaces can be rejected as **less** resilient.

---

## 9. IAS assurance questions

IAS may continue designing normally. It must leave answers to these questions visible for later MRA-02/03 assault.

1. Where can water-bearing distribution, valves, joints, traps, appliance connections and concealed cistern/service components physically exist in the selected interior system?
2. Which of those items are visible, dry-side accessible or removable without opening permanent fabric?
3. If one consequential joint/component leaks, what does the water touch **first**?
4. Can the wall/floor/panel/skirting system accidentally create a hidden trough that carries water away from the leak before it becomes visible?
5. Where do wet-room waterproofing, replaceable wall/floor finishes and service-access boundaries begin/end, and can one be renewed without destroying the others?
6. What happens at floor/wall, floor/threshold, bath/shower, WC/cistern, basin and service-panel junctions when the local water-control element fails?
7. Are any materials placed beneath credible leak sources that cannot dry without dismantling permanent fabric?
8. Can the utility/plant/service-room geometry tolerate a bounded appliance or fitting failure without exporting water into principal dry rooms?
9. Do removable interior layers leave the slow envelope and moisture/air boundaries complete when removed?
10. Can wet components be isolated by an occupant/trade without moving joinery, stored goods or fragile finishes first?

MRA-00 does not dictate tanking, floor drains, pipe-in-pipe or manifolds. Those are candidate implementations only where the selected system earns them.

---

## 10. OAS assurance questions

OAS must make the **water path under failure** as explicit as the cassette/replacement path.

1. At every external opening, which layer is primary frame weathering and which layer is building-side drainage?
2. If the exterior perimeter seal/gasket fails locally, where does the water go next?
3. Do head/jamb/sill geometries provide a gravity-respecting route that does not depend on one perfect sealant bead?
4. What prevents cavity/head water from bypassing into the inner reveal or permanent opening?
5. Can sill drainage or weeps block without turning concealed fabric into the emergency overflow route?
6. Can the complete window/door assembly be replaced while retaining or deliberately reinstating the building-side water path without destructive ambiguity?
7. At level-access thresholds, how are accessibility, splash, driven rain, drainage and replacement reconciled without allowing a low datum to become a hidden inward fall?
8. Are tolerance/adjustment spaces themselves drained/dryable, or can they become sealed moisture pockets?
9. Do fixings, subframes, brackets or anchors create tracking paths across the intended drainage plane?
10. Which opening conditions deserve physical weather testing because internal reasoning cannot establish real water performance?

---

## 11. HAD assurance questions

HAD owns the large-scale form choices that determine whether water management is naturally simple or technically rescued later.

1. Does the roof form naturally shed toward visible, maintainable collection edges rather than hidden internal basins?
2. Are valleys, abutments, parapets, concealed gutters or other concentrated water junctions being introduced for expression where a simpler form could avoid them?
3. Can each primary rainwater path block locally without forcing water into the envelope?
4. Where does overflow visibly go during a blocked-outlet case, including courtyard conditions?
5. Does façade composition preserve real drips, projections, sills, copings, cavity drainage and wall-base discharge rather than flattening them into sealant-dependent details?
6. Are external thresholds and ground levels arranged so normal surface water is biased away from the house?
7. Are service-side penetrations concentrated without creating one unmaintainable water-vulnerable cluster?
8. Can gutters, downpipes, copings, flashings, terminals and opening seals actually be reached for inspection/renewal using the intended maintenance geography?
9. Does the courtyard concentrate rain/splash/wall runoff into any interface whose failure would be hidden from occupants?
10. Does an architectural concealment choice turn a replaceable/weathering component into an inaccessible permanent-risk item?

The current no-flat-roof constraint reduces one class of risk but does not itself prove a roof is moisture-resilient. Pitched roofs still have ridges, hips/valleys where present, eaves, abutments, flashings, gutters and penetrations that must fail safely.

---

## 11A. ROF/RWT assurance questions

ROF/RWT own constructive design and the shared gate. They must leave these questions answerable without MRA selecting their preferred solution:

1. Which actual roof/court catchment feeds each receiver under ordinary and named failure states, including inner-valley concentration, direct court rain and facade/runoff additions? Use a consistent overhang boundary; no duplicated area or assumed court-only inflow.
2. Where does water go physically next after a blocked inlet, outlet or shared receiver, partial restriction, disconnected joint or surface exceedance? Identify the lowest vulnerable fabric and operating water level, not just a nominal invert or internal FFL.
3. Does secondary roof drainage meet the same blocked collector? Do two drops share downstream backwater, debris or inaccessible cleaning? State fault-specific independence rather than counting routes.
4. Can the selected floor/structure/threshold crossing preserve support, thermal/air/moisture boundaries and actual access, including a joint leak into concealed layers? A removable rectangle or small spare depth is not a complete section.
5. Can a person actually observe, clear, support, disconnect, withdraw, replace and reinstate the receiver/carrier at its height, with temporary capture and a named discharge while it is disabled? Ground optics and a nominal platform do not prove high-level repair.
6. Can the damaged layers dry and be inspected before closure, and can that task occur without relying on continuous owner vigilance, a closed check valve, alarm or unselected pump to remove new rain?
7. Which exact exterior level/capacity/backwater/access conditions does the building-side handoff require, and what design/site incompatibility follows if they fail? RWT resolves its internal route; DPL supplies real-site facts.

## 12. Shared IAS/OAS/HAD interface questions

Before `TRIAD-GATE`, the three streams should be able to identify ownership at every material moisture boundary:

- wall ↔ window/door head, jamb and sill;
- floor ↔ external threshold;
- interior wet-room finish ↔ door/threshold/service panel;
- roof ↔ wall/eaves/cornice/gutter/downpipe;
- façade ↔ utility/service penetration;
- service route ↔ structural/boundary crossing;
- wall base ↔ DPC/DPM ↔ paving/landscape/drainage;
- extract/vent terminal ↔ external envelope;
- courtyard paving/drainage ↔ surrounding walls/openings.

A junction with three owners and no explicit water-path owner is an MRA failure even if each adjacent assembly is locally plausible.

---

## 13. Initial adversarial scenario register

These are scenario seeds, not passes/fails. Original identities are retained so later packets cannot silently avoid awkward cases after seeing the selected details. The additions below capture current-interface failures without rewriting the original seed meanings.

### External / ground

- `EXT-01` one local roof covering/weathering defect during rain;
- `EXT-02` one primary gutter/outlet blocked during heavy but ordinary design-basis rain;
- `EXT-03` one downpipe connection fails or disconnects at the wall;
- `EXT-04` one window perimeter weather seal fails under wind-driven rain;
- `EXT-05` one door/threshold weather seal or drained threshold component fails;
- `EXT-06` one service-entry weather seal permits tracking along a sleeve;
- `EXT-07` one cavity drainage/weep zone is locally obstructed;
- `EXT-08` courtyard primary drain is restricted while the independent overflow must operate;
- `EXT-09` local paving/landscape level or splash condition challenges the wall base;
- `EXT-10` maintenance degradation at a flashing/coping/eaves interface coincides with normal rain;
- `EXT-11` one court/underfloor carrier joint or channel boundary leaks into floor/wall layers, independently of a blockage case;
- `EXT-12` a receiver is deliberately removed for foreseeable renewal while ordinary rain must have a maintained temporary route (an intervention state, not an invented simultaneous component fault).

### Internal / waste

- `INT-01` one concealed/partially concealed supply joint leaks slowly;
- `INT-02` appliance hose or valve releases water rapidly;
- `INT-03` cistern/concealed fixture connection leaks;
- `INT-04` plant-room water-bearing component or relief connection leaks;
- `WST-01` basin/bath/shower waste connection leaks;
- `WST-02` appliance waste/drain becomes disconnected or blocked;
- `WST-03` soil/waste branch blockage causes local surcharge/overflow consequence;
- `WST-04` condensate route blocks/disconnects and discharges abnormally.

### Vapour / construction

- `VAP-01` bathroom extract is unavailable during repeated normal bathing;
- `VAP-02` cold bridge/local surface reaches recurrent condensation conditions;
- `VAP-03` moist air bypasses the intended air/vapour-control boundary at one consequential junction;
- `VAP-04` a concealed service/panel cavity becomes wetted and must demonstrate drying rather than trapping;
- `CON-01` masonry/timber/finish zone is closed materially wet after construction exposure;
- `CON-02` wet trade moisture is trapped behind a low-permeability or replaceable finish before handover.

### Bounded compounds

- `CMP-01` partially fouled rainwater route + ordinary heavy rain;
- `CMP-02` aged opening seal + wind-driven rain;
- `CMP-03` appliance/supply leak + temporary unoccupancy;
- `CMP-04` degraded bathroom extraction + repeated showers;
- `CMP-05` restricted waste route + ordinary appliance discharge;
- `CMP-06` degraded inner collection or court primary drainage + ordinary rain, with both actual roof spill and direct court rainfall accounted for. Shared downstream obstruction is one common-cause failure where the actual topology makes it so, not automatically two independent faults.

MRA-01/02/03 may add scenarios where the selected design creates a new credible route. They may not delete these seeds merely because a chosen detail makes them inconvenient.

---

## 14. Early evidence-routing rules

MRA distinguishes internal architectural assurance from claims that require competent evidence.

- **MRA / architecture** can establish source/path topology, concealment, access, failure visibility, isolation geography and whether a proposed failure route is inherently inward/outward.
- **BCR** owns construction-resolution closure and reconciliation of concrete obligations.
- **EPR** owns claims requiring envelope, drainage, building-physics or MEP professional adequacy.
- **PHY** owns physical propositions where a mock-up/test is the proportionate way to establish behaviour, especially non-standard opening/interface details.
- **DEL** owns workmanship controls, inspection hold points, commissioning, moisture-content acceptance and reinstatement requirements once the selected assembly makes them concrete.
- **DPL** owns real-site flood, groundwater, external levels, drainage authority/outfall and deployment facts.

A matrix row is not upgraded from `OBLIGATION` to `PASS-INTERNAL` merely because the likely technical answer appears obvious.

---

## 15. Construction/handover obligations to carry forward

MRA-00 establishes these questions early because finished-house moisture resilience can be defeated before occupation:

- What material/assembly moisture state permits closure?
- Which cavities, panel zones, floor zones or wet-room builds require inspection before concealment?
- Which rainwater, drainage, threshold or visible-leakage paths require a witnessed water/fall test before finishes hide them?
- Which water services require pressure/leak testing before closure?
- Which wet-room assemblies require water/containment testing where their selected construction warrants it?
- Which window/door prototypes require spray/hose or other scoped weather testing?
- What baseline moisture/condition record is useful at handover for later diagnosis without pretending one survey proves future dryness?

These become DEL/BCR obligations only when the selected system earns them. MRA does not pre-specify a universal test regime.

---

## 16. Targeted closeout and result

| Required sweep | Result |
|---|---|
| Canonical doctrine/pattern/strategy additions | Existing Principles 3/4/5/8/9 and PAT-009/017/018 remain sufficient. Added PAT-002/004/012/016 and source-capture applicability above; no new doctrine, pattern or universal tanking requirement is justified. |
| Current house water/service obligations | HRS current basis, ROF/RWT comparisons and BCR physical findings replace inherited geometry assurances. IAS wet/service, bounded OAS front detail and HAD sanitary candidates retain their actual limits. |
| Proportionality conflict | No contradiction: the Reference House's stronger consequence target changes the burden of evidence, not the rule to use the least complex adequate measure. Additional trays, drains, controls and inaccessible redundancy can be rejected when their complete consequences are worse. |
| Questions reach design owners | HAD already links these questions. IAS/OAS and ROF/RWT programme interfaces now point here while retaining their design authority; no duplicate design matrix is introduced. |
| Terms consistently usable | Source identity, named event/common failure, actual first vulnerable layer, declaration/latency/drying and routed-unknown status are explicit. Material-specific prolonged wetting and external receiving conditions remain evidence questions where unresolved. |

MRA-00 is complete at assurance-definition scope. The original threat vocabulary, matrix and seeds remain; current-source applicability and three additional scenario seeds make them usable against the present house. No selected-house row is passed or failed here. MRA-01/02/03 remain dependent on the integrated design at TRIAD-GATE (including ROF-RWT-GATE); closing this definition packet neither opens that gate nor establishes moisture, construction or professional adequacy. Future changed geometry or new credible mechanisms require affected inventory/seed review, not silent inheritance.
