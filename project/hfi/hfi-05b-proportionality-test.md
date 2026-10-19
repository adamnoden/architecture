# HFI-05B — Proportionality Test

**Packet:** HFI-05B  
**Programme:** [`docs/development/human-factors-low-friction-inhabitation-programme.md`](../../docs/development/human-factors-low-friction-inhabitation-programme.md)  
**Execution plan:** [`docs/development/human-factors-low-friction-inhabitation-execution-plan.md`](../../docs/development/human-factors-low-friction-inhabitation-execution-plan.md)  
**Owning issue:** #195  
**Research-start baseline `main`:** `1cf19e3fa77fdecdbe103d519a26e45ecde1f337`  
**Prior packet:** HFI-05A — causality and taxonomy  
**Question:** which candidate human-factors interventions emerging from HFI-02/03/04 remain proportionate once their scenario benefit, frequency, consequence, evidence confidence, irreversibility and credible lower-burden alternatives are compared against permanent area, cost, carbon, technical complexity, maintenance, architectural effect and displaced friction?  
**Boundary:** proposition-level proportionality only. This packet does **not** resolve cross-discipline technical conflicts reserved to HFI-05C, form final governing principles, set numerical HFI targets, audit/redesign the Reference House, alter doctrine/patterns, add compiler proof or change publication maturity.

---

## 1. Method

HFI-05B applies the already-frozen HFI-01D method.

There is **no weighted master score**.

Every proposition is judged through:

`cause → scenario/task → frequency → consequence → evidence confidence → intervention → alternatives → burden now → retrofit difficulty if omitted → adverse effects → disposition`

Hard technical/statutory conflicts cannot be averaged away by a strong usability benefit. Those conflicts are passed to HFI-05C rather than guessed here.

### Disposition vocabulary

| Disposition | Meaning |
|---|---|
| `CARRY-FORWARD` | benefit is credible and burden is proportionate enough to remain a serious HFI proposition |
| `CARRY-FORWARD-CONDITIONAL` | proposition is credible but depends materially on technical conflict, exact geometry, site or bounded target derivation |
| `PREFER-LOWER-BURDEN-ALTERNATIVE` | underlying problem is real but a less permanent intervention dominates the proposed form |
| `DEMAND-LED` | preserve enabling conditions where proportionate; install user/product-specific equipment when need exists |
| `DEFER-BOUNDED-COMPARISON` | evidence is insufficient without one specific architectural alternative/counterfactual |
| `REJECT-UNIVERSAL` | intervention may be valid in defined cases but is disproportionate as a universal project rule |
| `REJECT` | proposition itself is not justified by current evidence/proportionality |

A disposition is **not** a final project target. HFI-06 owns target admission.

---

# 2. Movement and circulation

## P-01 — increase stair going beyond the current 280 mm baseline as a universal immediate change

**Cause:** `CF-02` support/level-change movement mismatch.  
**Baseline:** current RH source uses 280 mm going; HFI-02B found it credible and not defective.  
**Candidate:** change now to a larger going, with ~300 mm the strongest later comparator identified by 02B.  
**Beneficiaries:** ordinary daily stair users; larger-foot users; older/reduced-balance users; carried-load/reduced-attention states.  
**Frequency:** `F-DAILY` to `F-CONTINUAL`.  
**Consequence if poor:** from `C1` repeated attention/foot-placement burden to potentially `C3` fall exposure depending on geometry/state.  
**Evidence:** `E-MODERATE/HIGH` for greater foot-support mechanism over shallow treads; **not** evidence that 280 mm is defective or that 300 mm is universally optimal.

**Burden:**
- additional stair run / plan reservation can propagate through the stair hall and upper/ground circulation;
- changing going may require re-solving rise count, pitch, landings, headroom, guarding and architectural composition;
- permanent shell consequence is high compared with later replaceable interventions.

**Alternatives:**
- retain 280 if HFI-06 comparison does not show material benefit;
- compare 280 vs ~300 as a full stair system rather than “add 20 mm” locally;
- prioritise dimensional consistency, rail quality, edge legibility and landing transitions where these buy more benefit for less area.

**Disposition:** **`CARRY-FORWARD-CONDITIONAL`**.

The *comparison* is proportionate; an immediate geometry change is not yet earned. HFI-06B must compare 280 against a stronger alternative such as 300 with full plan/system burden exposed.

---

## P-02 — blanket widening of all corridors / galleries

**Cause claimed:** `CF-01` envelope/path mismatch.  
**Benefit:** potentially more passing, carrying, manoeuvring and wheelchair margin.  
**Burden:** repeated permanent area inflation across the whole dwelling, possible room/storage loss or enlarged envelope, embodied/operational consequences, and no guarantee that door/corner nodes improve.

HFI-03A found no evidence basis for one universal “comfortable passing” width and explicitly showed that route/interface geometry, not straight-run width alone, controls many failures.

**Lower-burden alternatives:**
- route hierarchy (`R1/R2/R3`);
- local widening/passing/recovery nodes;
- fix door swing/nib/radiator/joinery conflicts;
- protect actual swept turns;
- preserve ordinary width where frequency/consequence does not earn more.

**Disposition:** **`REJECT-UNIVERSAL`**.

The underlying CF-01 problem is real. Blanket widening is not the preferred universal remedy.

---

## P-03 — role-based local clearance generosity at high-frequency/conflict nodes

**Cause:** `CF-01` + `CF-07`.  
**Candidate:** spend area selectively at turns, door approaches, landings, passing/recovery nodes and other places where actual manoeuvre evidence shows conflict.

**Benefit:** broad ordinary use; carrying; assistance; object movement; wheelchair/mobility-device scenarios where claimed.  
**Frequency:** varies by node; strongest on `R1` principal routes.  
**Consequence:** generally `C1–C2`; can contribute to `C3` near stairs/hot work if conflict is poorly placed.  
**Evidence:** `E-MODERATE/HIGH` for route/interface coupling and manoeuvre-specific geometry.

**Burden:** local area only; may often be achieved by door/partition/joinery coordination rather than envelope growth.

**Disposition:** **`CARRY-FORWARD`**.

This is preferable to blanket width generosity and should reach HFI-06B as a target-architecture proposition rather than one magic corridor number.

---

## P-04 — require complete critical swept-path proof for doors, corners and representative large objects

**Cause:** `CF-01` + `CF-07`.  
**Candidate:** analytical/design requirement, not necessarily additional construction.

**Benefit:** prevents false passes from isolated doorway/corridor dimensions and catches geometry that is expensive to correct after construction.  
**Frequency/consequence:** object moves may be occasional, but route geometry is highly irreversible; ordinary door/corner manoeuvres are frequent.  
**Burden:** modelling/design effort; little or no permanent area unless a real conflict is found.

**Disposition:** **`CARRY-FORWARD`**.

This is one of the clearest low-burden/high-option-value HFI propositions.

---

# 3. Ground plane and thresholds

## P-05 — substantially continuous principal entrance-level ground plane

**Cause:** `CF-03` ground-plane discontinuity.  
**Candidate:** avoid unnecessary steps/lips on principal entrance-level ordinary routes while allowing purposeful gradients and technically necessary joints.

**Benefit:** ordinary walking, prams, wheeled objects, mobility aids, temporary impairment, visitors, carrying.  
**Frequency:** `F-DAILY` / `F-CONTINUAL` on principal routes.  
**Consequence:** often `C1–C2`, potentially `C3` where small discontinuities interact with reduced balance/wet conditions.  
**Evidence:** `E-HIGH` for mechanism and current accessible-route guidance; exact preferred threshold values remain HFI-06 work.

**Burden:** low where decided early internally; external thresholds can impose meaningful envelope/drainage/detail complexity.

**Disposition:** **`CARRY-FORWARD-CONDITIONAL`**.

The human-factors objective is proportionate. External/wet interfaces must survive HFI-05C moisture/drainage/weathering conflict; “flush at any cost” is explicitly rejected.

---

## P-06 — prohibit decorative/internal finish-transition lips where no technical discontinuity is required

**Cause:** `CF-03`.  
**Benefit:** removes a repeated obstacle with no compensating technical value.  
**Burden:** generally negligible if flooring interfaces are coordinated; may require better finish detailing.

**Disposition:** **`CARRY-FORWARD`**.

This has unusually clean proportionality because the competing benefit of the obstacle is absent by definition.

---

## P-07 — make every exterior threshold mathematically flush

**Cause claimed:** `CF-03`.  
**Burden/conflict:** may sacrifice weathering, drainage, doorset robustness, maintainability or replacement tolerance.

**Disposition:** **`REJECT`**.

The valid proposition is traversable continuity with technically robust water management, not visual flatness.

---

# 4. Hardware, openings and controls

## P-08 — frequent controls should be located by task/operating position and sequence, not mounting-height band alone

**Cause:** `CF-04` + `CF-05` + `CF-08`.  
**Benefit:** broad ordinary use, shorter/smaller users, upper-limb impairment, wet/occupied hands, unfamiliar users, low-light use.  
**Frequency:** frequently `F-DAILY/F-CONTINUAL`.  
**Consequence:** mostly `C1–C2`, with higher consequence around bathing, cooking and fault/isolation conditions.  
**Evidence:** `E-HIGH` for the general mechanism; exact position remains interface-specific.

**Burden:** usually very low when designed before first fix; potentially costly only if discovered after finishes/services are fixed.

**Disposition:** **`CARRY-FORWARD`**.

This is a strong example of human-factors benefit without area inflation.

---

## P-09 — low-grip / low-force / non-compound operation as the default for frequent ordinary hardware where technically compatible

**Cause:** `CF-04`.  
**Benefit:** ordinary use plus reduced dexterity, occupied hand and temporary upper-limb states.  
**Frequency:** doors/windows can be daily or continual.  
**Evidence:** strong mechanism, but exact operating-force targets/product selections remain downstream.  
**Burden:** often modest product/detail choice; can conflict with security, weather seal, closer/fire duties.

**Disposition:** **`CARRY-FORWARD-CONDITIONAL`**.

Carry the interface objective forward; HFI-05C must prevent it overriding fire/security/envelope performance.

---

## P-10 — motorise all hard-to-reach windows/blinds or automate all environmental controls

**Cause claimed:** `CF-04` / `CF-08`.  
**Benefit:** can remove reach/force demand for some tasks.  
**Burden:** controls, motors, wiring/power, maintenance, failure modes, standby energy, replacement, vendor/product dependence; automation can create CF-08 state ambiguity.

**Lower-burden alternatives:** better fixed handle/control location; manual low-force mechanism; demand-led motorisation; secondary remote control.

**Disposition:** **`REJECT-UNIVERSAL`**.

Motorisation remains legitimate where geometry/user need earns it.

---

## P-11 — app/cloud-only interface for ordinary essential environmental control

**Cause claimed:** removes wall-control reach burden.  
**Adverse effects:** introduces device/account/network/vendor dependency, guest exclusion and degraded-mode complexity; can worsen CF-08.

**Disposition:** **`REJECT-UNIVERSAL`**.

Digital control may be secondary/adaptive, but dependency must be proportionate to consequence and fallback.

---

# 5. Bathing / sanitary use

## P-12 — preserve entrance-level WC plus technically credible future level-access shower capability

**Cause:** `CF-03` + `CF-09B`; with `CF-04/05` at detailed interface level.  
**Benefit:** ordinary/visitor use, temporary lower-limb impairment, post-operative states, ageing and future fallback living.  
**Frequency:** ordinary WC use is daily; shower fallback may be episodic but consequence of absence can be `C2` task failure/dependence.  
**Evidence:** `E-MODERATE/HIGH` across current guidance, adaptation evidence and task logic.

**Burden:** local drainage/floor/service/support coordination and some plan consequence; retrofit after completion can be highly disruptive.

**Alternatives:** wait and later rebuild sanitary floor/drainage; specialist bathing equipment; upper-floor-only provision.

**Disposition:** **`CARRY-FORWARD`**.

The option value and retrofit asymmetry are strong enough to justify early architectural provision, while detailed fixture/clearance targets remain later work.

---

## P-13 — concealed wall/support capacity for future sanitary grab rails/seats where future support is credible

**Cause:** `CF-04` + `CF-09B`.  
**Benefit:** preserves later user-specific support without destructive wall opening/reconstruction.  
**Frequency:** need may be episodic/unknown; consequence can be material once needed.  
**Burden now:** low if integrated into appropriate wall construction at build time; hidden/no visual institutionalisation.

**Disposition:** **`CARRY-FORWARD`**.

This is the canonical HFI-01D case: low burden now, high retrofit difficulty later, credible future benefit.

---

## P-14 — install generic grab rails / specialist sanitary equipment everywhere from completion

**Benefit:** immediate support for some users.  
**Burden:** user-specific geometry may be wrong; visual/functional burden; maintenance/product choice; can medicalise ordinary space without need.

**Lower-burden alternative:** permanent support capacity now; actual hardware demand-led.

**Disposition:** **`DEMAND-LED`**.

---

## P-15 — enlarge every bathroom to M4(3)/two-person-assistance geometry

**Benefit:** broad manoeuvre/assistance capability.  
**Burden:** substantial permanent area across rooms; category mismatch; assistance geometry is task-specific.

**Disposition:** **`REJECT-UNIVERSAL`**.

Wheelchair/assisted geometry remains mandatory where the brief/regulatory category actually requires it.

---

# 6. Kitchen, storage and fixed work

## P-16 — model representative appliance open states and operating positions before freezing fixed kitchen/work geometry

**Cause:** `CF-07` plus `CF-04/06`.  
**Benefit:** prevents false clearance and workflow assumptions; catches dishwasher/oven/fridge/drawer conflicts while cheap to change.  
**Burden:** design/model effort only unless conflict is found.

**Disposition:** **`CARRY-FORWARD`**.

---

## P-17 — provide task-specific stable staging/landing where predictable high-consequence load-state changes occur

**Cause:** `CF-06` + `CF-05`.  
**Examples:** grocery arrival/unpack; hot oven extraction; heavy appliance handling; some laundry/cleaning transitions.  
**Benefit:** fewer regrips, less carrying while manipulating doors/controls, lower hot/heavy handling burden.  
**Burden:** local worktop/shelf/floor opportunity; can become wasteful if universalised.

**Disposition:** **`CARRY-FORWARD-CONDITIONAL`**.

Carry the event requirement, not “landing surface beside every appliance”. HFI-06C may formalise relationships only where task evidence justifies them.

---

## P-18 — ensure credible frequent-use storage can avoid extreme high/low/deep reach without putting all storage in one reachable band

**Cause:** `CF-04`.  
**Benefit:** broad ordinary use plus smaller/older/pregnancy/temporary impairment scenarios.  
**Burden:** mostly allocation/flexibility rather than more total storage area; may trade against occasional high/low storage.

**Disposition:** **`CARRY-FORWARD`**.

The proportionate proposition is to preserve useful frequent-use zones, not to make every shelf equally accessible.

---

## P-19 — install universally adjustable/lowerable worktops, sinks/hobs and motorised storage

**Benefit:** can provide excellent seated/user-specific adaptation.  
**Burden:** mechanisms, flexible services, cost, maintenance, lost storage, replacement/product lock-in and unnecessary complexity for many households.

**Lower-burden alternative:** adaptation-compatible service/structural geometry with demand-led adjustable equipment where a defined user/brief requires it.

**Disposition:** **`REJECT-UNIVERSAL`** / **`DEMAND-LED`** for equipment.

---

## P-20 — make every mainstream kitchen permanently M4(3)-equivalent

**Benefit:** wheelchair manoeuvre/use for a defined category.  
**Burden:** permanent area, storage/worktop/service implications; category-specific relationships may not optimise ambulant households and do not eliminate need for user-specific detail.

**Disposition:** **`REJECT-UNIVERSAL`**.

Preserve category-specific compliance where applicable and low-burden future adaptability separately.

---

# 7. Life-course / vertical adaptation

## P-21 — preserve credible entrance-level fallback sleeping + living/eating + WC + potential level-access shower

**Cause:** `CF-09B`.  
**Benefit:** temporary or permanent stair loss need not immediately force relocation/dependence; ordinary rooms retain ordinary usefulness meanwhile.  
**Frequency:** fallback use `F-EPISODIC`, but component rooms are ordinarily useful daily.  
**Consequence if absent under relevant state:** `C2` material task/occupation degradation.  
**Evidence:** `E-MODERATE/HIGH` from current accessible/adaptable housing practice and HFI-02C/04A synthesis.

**Burden:** low if achieved through dual-use ordinary rooms; potentially high if it demands dedicated unused specialist space.

**Disposition:** **`CARRY-FORWARD`**, explicitly in **dual-use** rather than specialist-room form.

---

## P-22 — genuine later stairlift compatibility; machinery installed only when needed

**Cause:** `CF-09B`.  
**Benefit:** preserves vertical adaptation route with much lower permanent burden than installed lift machinery.  
**Burden now:** stair/landing geometry, power/parking/clearance coordination; still must be real, not a width-only claim.  
**Equipment burden later:** product/user-specific.

**Disposition:** enabling architecture **`CARRY-FORWARD`**; stairlift machinery **`DEMAND-LED`**.

A nominal 1000 mm stair width alone must not be labelled “stairlift ready”.

---

## P-23 — install a stairlift or through-floor lift at completion in every two-storey house

**Benefit:** immediate vertical assistance for some scenarios.  
**Burden:** machinery, maintenance, energy, visual/spatial occupation, rescue/product lifecycle, user fit and potential non-use.

**Disposition:** **`REJECT-UNIVERSAL`** / equipment **`DEMAND-LED`**.

---

## P-24 — reserve a future through-floor lift route in every Reference House / Ovid’s House by default

**Cause:** `CF-09B`.  
**Potential benefit:** preserves whole-dwelling vertical access for scenarios stairlift/fallback living cannot fully address; very high retrofit asymmetry if later needed and no route exists.  
**Potential burden:** vertically aligned area, structure, services, circulation, enclosure/access, architectural effect; burden depends enormously on whether the reservation can be dual-use/removable with little sacrifice.

HFI-02C explicitly forbids deciding this rhetorically and requires at least one **bounded genuinely buildable low-burden reservation concept** if the disposition remains material.

No such Reference House-specific option has yet been generated and costed/coordinated.

**Disposition:** **`DEFER-BOUNDED-COMPARISON`**.

This is not a rejection and not an adoption. HFI-05B finds the question cannot be honestly resolved without an architectural counterfactual. If pursued later, one bounded option should be generated under the owning RH gate and evaluated before HFI-06 admits/rejects a universal target.

---

# 8. Domestic task topology

## P-25 — relocate or duplicate laundry functions upstairs solely to eliminate the upper sleeping/bathing ↔ ground utility loop

**Cause:** `CF-09A` repeated functional separation.  
**Benefit:** potentially large reduction in repeated basket carrying, stair use and dirty/clean return movements.  
**Frequency:** plausibly `F-REGULAR` to `F-DAILY` depending household; current HFI deliberately avoids inventing a universal frequency.  
**Consequence:** typically `C1`, potentially `C2` under pregnancy, injury, ageing or high household load.  
**Evidence:** strong task-sequence logic; no current evidence establishes that upstairs laundry is the universal optimum.

**Countervailing burden / benefits of downstairs utility:**
- moisture/noise separation from sleeping areas;
- service concentration;
- dirty/garden/cleaning relationships;
- potential fire/leak/appliance-service considerations;
- duplication would add appliances/services/area and maintenance;
- moving the utility may worsen other domestic routes.

**Lower-burden alternatives to test later:**
- improve basket staging/handrail/landing choreography;
- laundry chute only if safety/service/cleanliness case survives (not assumed);
- partial clean-linen storage/folding geography;
- altered utility location within ground topology;
- future/demand-led assistive equipment rather than duplicate appliances.

**Disposition:** **`CARRY-FORWARD-CONDITIONAL` to HFI-05C/HFI-07**, **not a relocation mandate**.

The current cross-level loop is a serious audit case. Proportionality does **not** establish that the remedy is “put laundry upstairs”. The topology must be judged against moisture/noise/services and competing task routes.

---

## P-26 — force every repeated domestic route to be shortest possible

**Benefit:** fewer steps.  
**Burden/adverse effect:** destroys zoning, privacy, acoustic, service, moisture, security and architectural relationships; raw distance is not the HFI task metric.

**Disposition:** **`REJECT`**.

Task-event burden, not shortest-path optimisation, controls.

---

# 9. Assistance and wheelchair-related universals

## P-27 — continuous two-person/assistance-width provision throughout the dwelling

**Benefit:** some assisted movement scenarios.  
**Burden:** major permanent area inflation; actual assistance posture varies by task and often occurs locally rather than side-by-side along whole routes.

**Lower-burden alternative:** local support/manoeuvre space at difficult interfaces where assistance is foreseeably required.

**Disposition:** **`REJECT-UNIVERSAL`**.

---

## P-28 — local manoeuvre/support space for bounded assistance scenarios

**Cause:** usually `CF-01/07`, task-specific.  
**Benefit:** supports real assistance where consequence is meaningful without turning the whole house into a care environment.  
**Burden:** local and scenario-dependent.

**Disposition:** **`CARRY-FORWARD-CONDITIONAL`**.

Exact geometry must remain with the relevant bathroom/stair/route task and target packet.

---

# 10. Propositions rejected as “future-proofing” rhetoric

HFI-05B explicitly rejects universal adoption of the following unless a defined scenario/brief independently earns them:

- fully M4(3)-equivalent geometry everywhere;
- installed lifts/stairlifts from completion;
- universal adjustable kitchens;
- generic grab rails everywhere;
- motorised windows/blinds everywhere;
- duplicated controls for every automated function;
- duplicated appliances/services solely for redundancy;
- continuous two-person passing width;
- oversized storage for every conceivable future object;
- proprietary smart-home infrastructure as the default resilience strategy.

The preferred HFI posture is often:

> **make irreversible architecture capable where the option is cheap and credible; keep user- and product-specific equipment replaceable and demand-led.**

That posture is itself still subject to HFI-05C technical conflict and HFI-05D principle formation.

---

# 11. Proportionality register

| ID | Proposition | Primary cause | Timing posture | 05B disposition |
|---|---|---|---|---|
| P-01 | compare stronger stair going vs current 280 | CF-02 | build-now geometry if earned | `CARRY-FORWARD-CONDITIONAL` |
| P-02 | blanket corridor widening | CF-01 | build-now | `REJECT-UNIVERSAL` |
| P-03 | local role/conflict-based clearance generosity | CF-01/07 | build-now | `CARRY-FORWARD` |
| P-04 | critical swept-path proof | CF-01/07 | design/proof now | `CARRY-FORWARD` |
| P-05 | continuous principal entrance-level ground plane | CF-03 | build-now | `CARRY-FORWARD-CONDITIONAL` |
| P-06 | no gratuitous internal finish lips | CF-03 | build-now | `CARRY-FORWARD` |
| P-07 | mathematically flush every external threshold | CF-03 | build-now | `REJECT` |
| P-08 | task-positioned frequent controls | CF-04/05/08 | build-now/first-fix | `CARRY-FORWARD` |
| P-09 | low-grip/low-force frequent hardware | CF-04 | replaceable/detail now | `CARRY-FORWARD-CONDITIONAL` |
| P-10 | universal motorisation/automation | CF-04/08 | installed now | `REJECT-UNIVERSAL` |
| P-11 | app/cloud-only essential control | CF-08 | installed now | `REJECT-UNIVERSAL` |
| P-12 | entrance WC + credible future level shower | CF-03/09B | build enabling now | `CARRY-FORWARD` |
| P-13 | concealed sanitary support capacity | CF-04/09B | build now | `CARRY-FORWARD` |
| P-14 | generic grab rails everywhere | CF-04 | equipment | `DEMAND-LED` |
| P-15 | every bathroom M4(3)/carer-sized | CF-01 | build-now area | `REJECT-UNIVERSAL` |
| P-16 | model appliance open states | CF-07 | design/proof now | `CARRY-FORWARD` |
| P-17 | task-specific staging at high-value transitions | CF-06/05 | build-now local | `CARRY-FORWARD-CONDITIONAL` |
| P-18 | credible frequent-use storage zone | CF-04 | fit-out geometry | `CARRY-FORWARD` |
| P-19 | universal adjustable/motorised kitchen | CF-04 | equipment/mechanism | `REJECT-UNIVERSAL` / `DEMAND-LED` |
| P-20 | every kitchen M4(3)-equivalent | CF-01/04 | build-now | `REJECT-UNIVERSAL` |
| P-21 | dual-use entrance-level fallback living | CF-09B | topology now | `CARRY-FORWARD` |
| P-22 | genuine stairlift-compatible architecture | CF-09B | enable now / equipment later | `CARRY-FORWARD` + `DEMAND-LED` |
| P-23 | universal installed stairlift/lift | CF-09B | equipment now | `REJECT-UNIVERSAL` |
| P-24 | universal future through-floor lift reservation | CF-09B | reserve now | `DEFER-BOUNDED-COMPARISON` |
| P-25 | upstairs/duplicated laundry as cure | CF-09A | topology/services | `CARRY-FORWARD-CONDITIONAL` — audit/conflict, not mandate |
| P-26 | shortest possible repeated routes | CF-09A | topology | `REJECT` |
| P-27 | two-person width throughout | CF-01 | build-now area | `REJECT-UNIVERSAL` |
| P-28 | local bounded assistance space | CF-01/07 | build-now local | `CARRY-FORWARD-CONDITIONAL` |

---

# 12. What proportionality strongly favours

Across otherwise different domains, the same timing pattern recurs.

### 12.1 High-value early moves

The strongest build/design-now propositions tend to be those that are:

- cheap or neutral before construction;
- expensive/destructive to retrofit;
- useful to ordinary occupants as well as bounded variation scenarios;
- not dependent on one proprietary product.

Examples from this packet:

- protect actual swept paths before freezing geometry;
- remove gratuitous threshold lips;
- locate controls correctly before first fix;
- provide concealed sanitary support capacity;
- preserve dual-use entrance-level fallback functions;
- ensure fixed service/structure does not casually destroy credible future adaptation;
- represent open appliance/door states before accepting fixed work geometry.

### 12.2 Demand-led equipment

The strongest delay-until-needed cases are those that are:

- user-specific;
- product-specific;
- mechanically maintained;
- replaceable without destructive shell work;
- burdensome or visually intrusive when unused.

Examples:

- stairlift chair/rail;
- through-floor lift machinery;
- specialist grab rails/transfer aids;
- motorised/adjustable kitchen mechanisms where a defined user needs them;
- specialist powered opening aids.

### 12.3 Area generosity must be local and causal

HFI-05B finds no basis for “make everything bigger”.

Area is most defensible where:

- a specific manoeuvre/task fails without it;
- a local node serves several high-frequency scenarios;
- later alteration is structurally destructive;
- a smaller coordination change cannot remove the cause.

---

# 13. Unresolved propositions handed to HFI-05C

05B has intentionally **not** resolved propositions where human benefit is credible but another discipline may dominate the final answer.

| Proposition | HFI benefit | Conflict owner(s) for 05C |
|---|---|---|
| P-01 stronger stair going | foot support / descent robustness | architecture/structure/headroom/plan efficiency |
| P-05 low external thresholds | continuous movement | envelope/moisture/drainage/doorset |
| P-09 low-force openings/hardware | easier operation | fire/security/weather seal/acoustics |
| P-12 future level shower | life-course fallback | drainage/moisture/services/structure |
| P-17 hot/heavy staging | handling safety | kitchen/fire/services/space planning |
| P-22 stairlift-compatible architecture | future vertical adaptation | stair clear width/guarding/fire/services/landing circulation |
| P-24 future lift reservation | whole-house adaptation option | structure/services/fire/acoustics/area/architecture/maintenance |
| P-25 laundry topology | repeated route burden | moisture/noise/services/fire/leak/housekeeping/garden relationships |
| P-28 assistance zones | care/support usability | area/privacy/fixture/door/fire geometry by task |

05C must treat these as **conflicts to reconcile**, not as reasons to discard HFI benefit automatically.

---

# 14. Reference House consequences — no verdict / no rewind yet

HFI-05B does not audit or alter the Reference House.

It does sharpen later HFI-07 questions.

### Stair

Current 280 mm going retains incumbency **only as a baseline fact, not as a preferred HFI result**. HFI-06 must compare it against stronger candidate geometry before HFI-07 can judge it.

### Ground floor / thresholds

Current step-free/substantially flush intentions are proportionately strong, but technical interface proof remains absent. No PASS follows.

### Ground sanitary fallback

The current combination of entrance-level WC, potential shower and credible sleeping-room option is proportionately well-founded as a dual-use life-course strategy. HFI-07 must still prove actual use geometry.

### Stairlift / lift

The current approximate stair width is insufficient by itself to prove stairlift compatibility. No future lift route is represented. The latter is **not yet a defect** because P-24 remains deferred pending a bounded low-burden option.

### Laundry

The cross-level laundry cycle remains a serious HFI-07 audit case. HFI-05B explicitly refuses to convert that finding into an upstairs-laundry mandate before 05C reconciles moisture/noise/services and competing domestic routes.

### Kitchen / controls

Where the RH source lacks fitted interfaces, later audit must remain `NOT-MODELLED`; proportionality does not authorise inventing detail to create a pass.

---

# 15. Red-team checks

## 15.1 Did “low burden” become a loophole for weak evidence?

No. Low burden improves timing posture only where a credible mechanism/scenario exists. HFI still rejects speculative features with no defined benefit.

## 15.2 Did rare events automatically lose?

No. Entrance-level fallback, concealed support capacity and adaptation-ready geometry survive partly because retrofit difficulty/consequence are high despite episodic use.

## 15.3 Did daily inconvenience automatically win?

No. The laundry loop remains unresolved rather than forcing major service/topology change solely because it repeats.

## 15.4 Did accessibility categories get universalised?

No. M4(3)/wheelchair geometry remains category- or brief-specific unless a separate proposition earns broader adoption.

## 15.5 Did area become the only burden?

No. Product lock-in, energy, maintenance, services, moisture, fire, security, workmanship, architecture and displaced task friction remain explicit.

## 15.6 Did current RH geometry receive incumbency advantage?

No. Current 280 stair going, current laundry topology and existing absence of lift reservation are baselines, not presumptively correct outcomes.

## 15.7 Did HFI pre-empt HFI-05C?

No. Where a technical conflict is material, the disposition is conditional/deferred and the conflict owner is named.

---

# 16. Computational consequence

No compiler work is authorised.

Potential future proposition metadata now has a stable shape:

- `proposition_id`;
- `cause_family[]`;
- `scenario_ids[]`;
- `frequency_band`;
- `consequence_class`;
- `evidence_confidence`;
- `timing_posture`;
- `baseline`;
- `intervention`;
- `alternatives[]`;
- `burden_axes[]`;
- `disposition`;
- `conflict_owners[]`;
- `architectural_owner`;
- `known_unknowns[]`.

No numerical weighted score should be added later merely because these fields are structured.

---

# 17. Closeout

**Packet:** HFI-05B — proportionality test  
**Research-start baseline:** `1cf19e3fa77fdecdbe103d519a26e45ecde1f337`  
**Method:** HFI-01D applied to bounded interventions after HFI-05A causal synthesis; no weighted master score.  
**Main result:** HFI strongly favours low-burden, high-retrofit-asymmetry enabling architecture and task-specific local interventions over blanket area growth or speculative permanent equipment.  
**Carried forward strongly:** local conflict-node generosity; swept-path/open-state proof; continuous principal ground plane subject to technical closure; no gratuitous internal lips; task-positioned controls; entrance-level WC/shower capability; concealed sanitary support capacity; fixed-work open-state modelling; useful frequent-storage zones; dual-use entrance-level fallback living; genuine stairlift-compatible architecture.  
**Conditional / conflict-dependent:** stronger stair going comparison; external low thresholds; low-force openings; task-specific staging; assistance zones; laundry topology.  
**Demand-led equipment:** stairlift/lift machinery, user-specific grab rails/supports, specialist powered/adjustable mechanisms.  
**Rejected as universal:** blanket corridor widening; universal M4(3) bathrooms/kitchens; continuous two-person width; universal motorisation/automation; app/cloud-only essential controls; universal adjustable kitchens; installed lifting equipment everywhere.  
**Unresolved by design:** universal future through-floor lift reservation requires a bounded buildable low-burden counterfactual before disposition.  
**Checks:** no quantitative target, Reference House verdict/rewind, architectural change, doctrine, pattern, compiler proof, publication content or maturity change.  
**Exact next packet:** **HFI-05C — cross-discipline conflict matrix.**
