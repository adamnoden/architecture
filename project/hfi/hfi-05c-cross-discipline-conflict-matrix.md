# HFI-05C — Cross-Discipline Conflict Matrix

**Packet:** HFI-05C  
**Programme:** [`docs/development/human-factors-low-friction-inhabitation-programme.md`](../../docs/development/human-factors-low-friction-inhabitation-programme.md)  
**Execution plan:** [`docs/development/human-factors-low-friction-inhabitation-execution-plan.md`](../../docs/development/human-factors-low-friction-inhabitation-execution-plan.md)  
**Owning issue:** #195  
**Baseline `main`:** `932dd67c61ba10cbc154f68745cf8571430f3ada`  
**Prior packet:** HFI-05B — proportionality test  
**Question:** which HFI propositions carried from HFI-05B conflict with fire/life safety, structure, moisture/drainage, services, electrical, acoustics/privacy, security, energy/carbon, maintenance/replaceability, site/planning or architectural coherence; who owns each conflict; and what reconciliation posture must be preserved before HFI-05D can form governing principles?  
**Boundary:** conflict mapping and reconciliation logic only. This packet does **not** perform specialist technical design, select products, resolve site facts, set numerical targets, audit/redesign the Reference House, create doctrine/patterns, add compiler proof or change publication maturity.

---

## 1. Governing rule

HFI is not entitled to “win” a multidisciplinary conflict merely because the human-factors benefit is real.

The inverse is also forbidden: technical complexity is not a reason to erase a demonstrated human-factors mechanism without testing alternatives.

The governing rule is:

> **Preserve the human need; preserve the hard technical duty; change the means until both can coexist, or qualify/reject the proposition explicitly.**

A statutory, life-safety or competent-engineering constraint is not a negative point in a score. It is a hard boundary. Likewise, an unresolved technical detail cannot silently convert a human-factors proposition into “not important”.

---

## 2. Conflict status vocabulary

| Status | Meaning |
|---|---|
| `NO-MATERIAL-CONFLICT` | proposition is mainly analytical/coordination and creates no evident competing technical duty |
| `RECONCILABLE` | credible established design routes can preserve both sides; exact detail remains downstream |
| `CONDITIONAL` | proposition remains viable only if named technical conditions are proved |
| `HARD-CONSTRAINT` | statutory/life-safety/competent-engineering requirement limits the HFI solution space and cannot be traded away |
| `SPECIALIST-REVIEW` | project cannot responsibly close the conflict without competent external input |
| `SITE/PRODUCT-DEPENDENT` | generic HFI can preserve the objective but final disposition depends on actual site/system/product facts |
| `DEFERRED-ARCHITECTURAL-COMPARISON` | a real alternative must first be designed sufficiently to compare burden/conflict honestly |

A proposition may carry several statuses.

---

## 3. Discipline ownership map

| Discipline | HFI may diagnose | HFI may not self-award |
|---|---|---|
| fire / life safety | embodied-use consequence of doors, stairs, lift openings, circulation | fire strategy, compartmentation, escape compliance, fire-door performance |
| structure | human benefit of geometry/support/adaptation | structural adequacy, openings, load paths, reinforcement design |
| envelope / moisture | threshold/shower usability | watertightness, condensation control, DPC/air-barrier design |
| drainage / public health | traversability, control/reach/task sequence | drainage capacity, falls, traps, water hygiene, scald protection |
| MEP / ventilation / heating | control/task/interface usability | system sizing, ventilation rates, heating performance, commissioning |
| electrical | control/isolation legibility and reach | protective design, safe isolation, Part P / BS 7671 compliance |
| acoustics / privacy | human consequence of topology/equipment | acoustic performance specification and privacy strategy |
| security | reach/force/usability consequences | security performance, locking strategy/certification |
| energy / carbon | burden of mechanisms/area | regulated-energy or embodied-carbon proof without quantified method |
| maintenance / replaceability | occupant/future-access burden | service procedure, competent-person requirements, product lifecycle proof |
| architecture / conservation / planning | human consequences of form | planning/site acceptability, heritage judgement, architectural owner decisions |

The HFI-00A authority map remains controlling: accepted design changes rewind to the narrowest existing RH owner.

---

# 4. Conflict matrix — movement and circulation

## P-01 — stronger stair-going comparison

**HFI objective:** test whether a stronger going (e.g. around 300 mm) materially improves foot support/descent robustness over current 280 mm.  
**Conflicts:** stair run, riser count, landings, headroom, structure, guard/rail geometry, plan efficiency, upper/ground circulation and architectural composition.  
**Status:** `CONDITIONAL` + `SPECIALIST-REVIEW` at final technical stage.

**Reconciliation rule:** compare complete stair systems, never change going as an isolated number. A stronger HFI result cannot invalidate structural/headroom/fire requirements. Conversely, plan compactness alone is not a hard veto.

**Owner:** RH-03 first; later structure/fire/building-control review.

---

## P-03 — local conflict-node clearance generosity

**HFI objective:** spend area at turns, approaches, passing/recovery nodes where actual manoeuvre demands it.  
**Conflicts:** adjacent room area, storage, joinery, structural wall positions, fire-door geometry and architectural rhythm.  
**Status:** `RECONCILABLE`.

**Reconciliation rule:** first remove local causes—door swing, nib, radiator, joinery—before enlarging the whole plan. Local area transfer is legitimate only where the represented manoeuvre earns it.

**Owner:** RH-02/RH-03 by location; RH-09 where occupied interfaces dominate.

---

## P-04 — critical swept-path / open-state proof

**HFI objective:** prove actual manoeuvres rather than isolated nominal dimensions.  
**Conflicts:** none inherently; the proof may expose conflicts with fire doors, structure or furniture assumptions.  
**Status:** `NO-MATERIAL-CONFLICT`.

This is an analytical obligation and should survive into principle/target formation.

---

# 5. Ground plane / thresholds

## P-05 — continuous principal entrance-level ground plane

**HFI objective:** avoid unnecessary steps/lips while preserving ordinary walking/wheeling continuity.  
**Hard coupled duties:** water exclusion, drainage, doorset performance, thermal/air continuity, structural build-up, surface falls, maintainability, actual site levels/flood/runoff.  
**Status:** `CONDITIONAL` + `HARD-CONSTRAINT` + `SITE/PRODUCT-DEPENDENT` externally.

**Reconciliation hierarchy:**

1. reduce exposure geometrically where appropriate (recess/canopy);
2. direct falls purposefully;
3. intercept/drain water before the sill where appropriate;
4. choose traversable sill/grate geometry;
5. preserve inspectability/cleanability;
6. accept the minimum technically necessary discontinuity if robust water management cannot otherwise be proved.

The HFI principle is **continuous and traversable**, not “draw one flat line”.

**Owner:** RH-09 plus envelope/drainage/site technical owners; RH-10 for whole-route claims.

---

## P-06 — no gratuitous internal finish-transition lips

**HFI objective:** no obstacle whose only reason is decorative/finish convenience.  
**Possible conflicts:** fire/acoustic separation or genuinely different construction build-ups may sometimes require an interface detail.  
**Status:** `RECONCILABLE`.

Where a technical separation is truly required, the proposition becomes “minimise and shape the necessary transition”, not “remove it regardless”.

---

# 6. Doors, windows, hardware and controls

## P-08 — task-positioned frequent controls

**HFI objective:** locate ordinary controls according to the action sequence and operating position rather than service convenience alone.  
**Conflicts:** wiring/service routing, wet-zone electrical rules, fire/security interfaces, architectural composition, furniture/joinery.  
**Status:** generally `RECONCILABLE`; `HARD-CONSTRAINT` where electrical/wet/fire rules apply.

Service convenience is not itself a veto: first-fix routing should adapt where cheap. Safety-zone/electrical/fire requirements remain hard.

**Owner:** RH-09 plus electrical/MEP owner.

---

## P-09 — low-grip / low-force frequent openings

**HFI objective:** avoid unnecessary force, pinch/twist and compound actions.  
**Conflicts:** fire-door self-closing/latching, security resistance, weather seals, acoustic seals, large sash/leaf loads and wind pressure.  
**Status:** `CONDITIONAL` + `HARD-CONSTRAINT` + `SITE/PRODUCT-DEPENDENT`.

**Reconciliation options:** better hardware/hinges/balancing; improved seals/details; door geometry; hold-open only where fire strategy permits; powered assist where justified; user-specific powered aid demand-led.

HFI must never weaken secure locking, weather resistance or fire performance to hit an arbitrary force value.

---

## P-10/P-11 — automation / digital control

**HFI objective:** reduce manipulation where useful while retaining intelligible state and failure recovery.  
**Conflicts:** power/network failure, cyber/vendor dependency, standby energy, maintenance, commissioning, fire/security interfaces.  
**Status:** `RECONCILABLE` when secondary/proportionate; `REJECT-UNIVERSAL` remains unchanged.

The conflict matrix strengthens the 05B result: essential ordinary function should not acquire greater failure dependency merely to remove a modest physical interaction.

---

# 7. Sanitary / life-course provision

## P-12 — entrance-level WC + credible future level-access shower

**HFI objective:** preserve temporary/permanent stair-loss fallback and visitability.  
**Conflicts:** floor falls, drainage depth, waterproofing, structure, soil/waste routing, ventilation, hot/cold services, leak containment, room area and dry-zone quality.  
**Status:** `CONDITIONAL` + `RECONCILABLE`.

**Reconciliation rule:** build hidden enabling geometry only where the shower can become technically real without destructive work. A nominal “future shower” with impossible drainage/falls/support is false preparedness.

**Owner:** RH-10 whole-house claim; RH-09/interfaces and relevant sanitary/structure/services owners for detail.

---

## P-13 — concealed sanitary support capacity

**HFI objective:** allow later user-specific rails/seats without destructive wall reconstruction.  
**Conflicts:** wall build-up, waterproofing, service routes, fixing zones, structural capacity.  
**Status:** `RECONCILABLE`.

The project’s service-access doctrine is particularly relevant: future fixing zones must not blindly drive fixings through concealed services. The correct solution is coordinated support-capable zones with service exclusion/knowledge.

---

# 8. Kitchen / fixed work / storage

## P-16 — model appliance open states

**HFI objective:** test actual occupied geometry.  
**Conflicts:** none inherently; may expose cabinetry/services/fire-route conflicts.  
**Status:** `NO-MATERIAL-CONFLICT`.

Carry forward as an analytical requirement.

---

## P-17 — task-specific staging / landing

**HFI objective:** support predictable regrip/load-state changes, especially hot/heavy tasks.  
**Conflicts:** worktop/storage competition, hob/sink safety zones, circulation, fire/heat, services and visual composition.  
**Status:** `RECONCILABLE` / `CONDITIONAL` by task.

Do not manufacture permanent “landing shelves” everywhere. A normal worktop segment, table, island edge or other ordinary surface may satisfy the function if correctly placed.

---

## P-18 — credible frequent-use storage zone

**HFI objective:** avoid forcing frequent/heavy items into extreme high/low/deep reach.  
**Conflicts:** total storage capacity, worktop area, appliances/services and architectural joinery.  
**Status:** `RECONCILABLE`.

The requirement is allocation capability, not a mandated cabinet product or universal reachable band.

---

# 9. Entrance-level fallback living

## P-21 — dual-use entrance-level fallback sleeping/living

**HFI objective:** allow credible temporary/permanent stair-loss occupation without a dedicated institutional room.  
**Conflicts:** privacy, acoustic separation, daylight/ventilation, fire/escape, ordinary furniture/use quality, WC/shower route and household functioning.  
**Status:** `CONDITIONAL`.

A room only technically large enough for a bed is not a credible fallback if it destroys ordinary circulation, has poor privacy, or cannot connect dignifiedly to WC/shower/living/eating.

**Owner:** RH-10 with RH-02 for ground-floor topology; fire/acoustic/environmental review downstream.

---

# 10. Vertical adaptation

## P-22 — genuine stairlift-compatible architecture

**HFI objective:** preserve a lower-burden future vertical-access path without installing machinery now.  
**Conflicts:** effective stair width with rails/lift rail, head/foot parking, landings, doors, guarding, escape/fire strategy, electrical supply, transfer positions, installation/replacement route.  
**Status:** `CONDITIONAL` + `SITE/PRODUCT-DEPENDENT` at equipment stage.

A 1000 mm nominal stair is not proof. Architecture may claim “stairlift compatible” only once enough real geometry exists to support a credible product-family route without undermining safe ordinary stair use.

**Owner:** RH-03/RH-10; specialist stairlift/product review later.

---

## P-24 — future through-floor lift reservation

**HFI objective:** preserve potential whole-house vertical access where fallback living/stairlift may not suffice.  
**Conflicts:** floor/roof structure, vertically aligned area, fire compartmentation/openings, smoke spread, acoustics/privacy, services displacement, power, enclosure/doors, landing approach, installation/removal/replacement route, maintenance/rescue, architectural composition and opportunity cost of dual-use space.  
**Status:** `DEFERRED-ARCHITECTURAL-COMPARISON` + `SPECIALIST-REVIEW`.

This packet confirms the 05B disposition rather than pretending to close it.

A credible comparison must show at least one actual reservation concept with:

- vertically aligned clear envelope;
- structural strategy for the opening/temporary floor;
- no critical service occupation;
- plausible access/door/landing conditions at both levels;
- fire strategy route identified for competent review;
- installation/replacement route;
- dual-use value while no lift is installed;
- explicit area/architectural burden.

Until such a concept exists, neither “reserve a lift in every house” nor “lift reservation is needless over-specification” is evidence-based.

---

# 11. Laundry topology

## P-25 — upper sleeping/bathing ↔ ground utility laundry loop

**HFI objective:** reduce repeated cross-level dirty→wash→dry→fold→clean-return burden.  
**Countervailing disciplines:**

- moisture/leak containment;
- ventilation/drying;
- appliance noise/vibration near sleeping rooms;
- water/waste/service concentration;
- fire/electrical appliance risk;
- appliance delivery/replacement;
- cleaning/garden/dirty-work relationships;
- storage/folding space;
- structural vibration and floor build-up.

**Status:** `CONDITIONAL` + `SPECIALIST-REVIEW` only if architectural change is proposed.

### Reconciliation options that remain open

- retain ground utility but improve staging, basket/linen storage and route choreography;
- relocate utility within ground topology if that reduces multiple task routes;
- provide clean-linen/folding storage upstairs without duplicating wet appliances;
- place wet laundry upstairs only if a future bounded design proves leak/noise/vibration/ventilation/service/replacement consequences proportionate;
- do nothing if HFI-07 finds the actual burden acceptable relative to the technical advantages.

### Explicitly not assumed

- an upstairs laundry is automatically better;
- appliance duplication is proportionate;
- a laundry chute is benign (fire, cleanliness, blockage, guarding and maintenance would need their own case);
- route distance alone decides the question.

The HFI finding survives: the complete repeated cycle must be audited. The remedy remains open.

---

# 12. Assistance zones

## P-28 — local bounded assistance space

**HFI objective:** enable realistic two-body support where the task genuinely requires it.  
**Conflicts:** privacy/dignity, door swing, sanitary fixtures, circulation, fire-door/escape geometry and permanent area.  
**Status:** `CONDITIONAL`.

Assistance geometry belongs to the actual task. It must not become continuous two-person width or generic “carer space” throughout the house.

---

# 13. Cross-discipline conflict matrix

| HFI proposition | Fire | Structure | Moisture / drainage | MEP / electrical | Acoustics / privacy | Security | Maintenance / replaceability | Architecture / area | 05C disposition |
|---|---|---|---|---|---|---|---|---|---|
| stronger stair comparison | check | strong | — | lighting/power interfaces | — | — | stair component replacement | strong | conditional |
| local conflict-node clearance | door/escape check | possible | — | projections/services | possible | — | — | local | reconcilable |
| swept/open-state proof | reveals | reveals | reveals | reveals | reveals | reveals | reveals | reveals | no material conflict |
| continuous external ground plane | — | build-up | **strong** | drainage | — | doorset | drain/sill access | facade/site | conditional hard constraints |
| no gratuitous internal lips | possible separation | build-up | local | — | possible acoustic joint | — | finish replacement | low | reconcilable |
| task-positioned controls | fire controls | — | wet zones | **strong** | — | security controls | replaceability | composition | reconcilable/hard rules |
| low-force openings | **strong** | leaf/load | weather seal | powered assist | acoustic seal | **strong** | hardware lifecycle | appearance | conditional |
| future level shower | — | floor | **strong** | **strong** | privacy | — | access/repair | room area | conditional |
| sanitary support capacity | — | **strong** | waterproofing | avoid services | — | — | future fixing | low | reconcilable |
| appliance open-state proof | escape check | — | leaks where relevant | services | noise | — | replacement | layout | no material conflict |
| task staging | cooking/fire | — | wet work | services | — | — | — | worktop/area | conditional |
| frequent-use storage | — | wall loads | — | service clashes | — | — | hardware | storage/worktop | reconcilable |
| entrance fallback living | **strong** | — | sanitary link | ventilation | **strong** | — | — | topology | conditional |
| stairlift compatibility | **strong** | stair/load | — | power | — | — | machinery | stair/landing | conditional |
| future lift reservation | **strong** | **strong** | local | **strong** | **strong** | doors/access | **strong** | **strong** | deferred comparison |
| laundry topology | appliance/fire | vibration | **strong** | **strong** | **strong** | — | replacement | topology | conditional |
| local assistance zones | escape/doors | — | sanitary task | — | privacy | — | — | local area | conditional |

“Strong” means the discipline can materially reshape or defeat the proposed **means**. It does not mean the human-factors need disappears.

---

# 14. Conflict-resolution hierarchy

For every later proposition, use this order.

1. **Identify hard duties first.** Law, fire/life safety, structural adequacy, moisture safety and electrical safety are not negotiable scores.
2. **Return to the causal mechanism.** Do not defend a preferred remedy merely because research originally mentioned it.
3. **Try a lower-burden means.** Relocation, swing reversal, hardware, local geometry, support capacity or reserve-now/equipment-later may solve the same cause.
4. **Coordinate the interface.** Many apparent conflicts are discipline-boundary failures rather than true incompatibilities.
5. **Keep irreversible enabling work neutral.** Avoid product lock-in where a durable reservation/fixing/service route preserves options.
6. **Defer site/product facts honestly.** Generic Reference House logic must not invent weather exposure, lift product or stairlift geometry.
7. **Escalate to competent external review where the project lacks authority.** HFI-08D / RH-11 remain the proper route.
8. **If no safe/proportionate reconciliation exists, qualify or reject the HFI proposition.** Do not average a conflict away.

---

# 15. Technical remedies can create HFI regressions

Conflict reconciliation is two-way.

Examples:

- adding a high threshold to solve water can create CF-03;
- increasing door closer force to guarantee latching can create CF-04;
- relocating controls into a service cupboard can create CF-08/04;
- enclosing a future lift route can damage ordinary room quality/privacy;
- moving laundry upstairs can reduce CF-09A while creating noise/leak/service burden;
- enlarging circulation can remove useful storage and create longer domestic task routes;
- fire/security hardware can become compound or cryptic to operate.

Therefore technical closure must be rechecked against the frozen HFI scenarios, not treated as automatically neutral.

---

# 16. What is ready for HFI-05D

The following themes are sufficiently reconciled to be candidates for governing-principle formation, though HFI-05D decides wording/status:

- judge complete routes/tasks/interfaces rather than isolated nominal dimensions;
- spend spatial generosity locally where a causal manoeuvre/task earns it rather than enlarging everything;
- treat dynamic/open states as real geometry;
- preserve a continuous/traversable ground plane **with** drainage/weathering/moisture integrity;
- place controls/interfaces according to human sequence, mapping and feedback while retaining technical safety;
- build low-burden irreversible capacity early where retrofit asymmetry is high; keep user/product-specific equipment demand-led;
- preserve ordinary dual-use life-course capability rather than dedicated unused specialist space;
- treat services, fire, moisture, structure, security and maintenance as co-equal constraints, not after-the-fact objections.

---

# 17. What is **not** ready for HFI-05D as a universal principle

- “use 300 mm stair goings” — numerical target formation belongs to HFI-06B;
- “reserve a through-floor lift in every house” — bounded architectural comparison still missing;
- “put laundry upstairs” — conflict/topology audit unresolved;
- “make all thresholds flush” — technically false formulation;
- “use low-force doors” without fire/security/weather qualification;
- “make every kitchen/bathroom wheelchair accessible” — category/proportionality rejected;
- any proprietary automation/product strategy.

---

# 18. HFI-07 / HFI-08 consequences

### HFI-07

Later audit findings should name both:

- the HFI causal failure, if any; and
- any technical constraint that conditions the remedy.

`CONFLICT` must mean a real unresolved competition between requirements, not merely “hard to design”.

### HFI-08D / RH-11

External review should include bounded questions where final claims depend on:

- stair / stairlift compatibility;
- future level-access shower technical feasibility;
- threshold drainage/weathering detail;
- fire/structure/services implications of any future lift reservation;
- assisted-use geometry;
- any final laundry-topology change with material moisture/noise/services implications.

HFI cannot self-award those competencies.

---

# 19. Computational boundary

No compiler work is authorised.

A future machine representation may record conflict ownership/status, but it must not infer technical compliance from an HFI relationship.

Examples:

- `threshold_height` cannot prove watertightness;
- `door_force` cannot prove fire-door compliance;
- `lift_reservation` cannot prove structural/fire feasibility;
- `shower_zone` cannot prove waterproofing/drainage;
- `stair_width` cannot prove stairlift compatibility.

The proof boundary remains explicit.

---

# 20. Closeout

**Packet:** HFI-05C — cross-discipline conflict matrix  
**Baseline:** `932dd67c61ba10cbc154f68745cf8571430f3ada`  
**Exact question answered:** every material HFI proposition now has named competing disciplines, conflict status and reconciliation logic; HFI cannot override hard duties, and technical disciplines cannot erase a human-factors mechanism without testing alternative means.  
**Main result:** most strong HFI propositions are reconcilable through early coordination because they concern geometry, sequencing and option preservation rather than specialist equipment. External low thresholds, low-force openings, sanitary adaptation, stairlift compatibility, future lift reservation and laundry topology retain explicit technical conditions.  
**Still unresolved:** future through-floor lift reservation remains deferred pending a buildable low-burden architectural counterfactual; laundry topology remains an audit/conflict question rather than an upstairs-laundry mandate.  
**05D-ready themes:** complete-task/route reasoning; local causal generosity; dynamic-state proof; technically robust continuous ground plane; sequence/mapping-led controls; build-capacity-now/equipment-later; dual-use life-course capability; hard cross-discipline constraints preserved.  
**Checks:** no specialist design claimed; no numeric target; no Reference House verdict/rewind; no doctrine/pattern/compiler/publication/maturity change.  
**Exact next packet:** **HFI-05D — governing-principle formation.**
