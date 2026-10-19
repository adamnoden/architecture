# HFI-07D — Reference House Object + Domestic-Task Path Audit

**Packet:** HFI-07D  
**Programme:** [`docs/development/human-factors-low-friction-inhabitation-programme.md`](../../docs/development/human-factors-low-friction-inhabitation-programme.md)  
**Execution plan:** [`docs/development/human-factors-low-friction-inhabitation-execution-plan.md`](../../docs/development/human-factors-low-friction-inhabitation-execution-plan.md)  
**Owning issue:** #195  
**Baseline `main`:** `ddcadc000431f3be3fa9bf1f23235e580b8001fa`  
**Coverage authority:** [`hfi-07a-modelability-coverage.md`](hfi-07a-modelability-coverage.md)  
**Prior audits:** HFI-07B approach + ground floor; HFI-07C stair + upper floor  
**Question:** what can the current Reference House honestly conclude about furniture/object movement and repeated domestic task paths, especially the cross-level laundry loop?  
**Boundary:** HFI-07 verdicts only. This packet does not relocate utility functions, add an upstairs laundry, invent a chute, author object envelopes/door geometry, alter the stair, create a route-efficiency score, create compiler proof, change doctrine/patterns/publication or execute a rewind.

---

## 1. Result in one sentence

The current Reference House has **promising macro task geography for groceries and garden-serving**, but its detailed object routes remain largely `NOT-MODELLED`; the one major repeated burden that is genuinely represented is the **upper sleeping/bathing ↔ ground utility laundry loop**, which earns **`UNRESOLVED — MATERIAL TRADE-OFF`**, not an automatic upstairs-laundry remedy, because HFI has established both the repeated cross-level carrying burden and legitimate moisture/noise/services/failure-geography reasons for keeping wet utility functions downstairs.

No object/task-path geometry change is earned directly by this packet.

---

# 2. Audit rule — sequence, not metres

HFI-06C adopted `HFI-USE-TASK-01`:

> **Judge repeated domestic work through the complete task chain rather than room-to-room distance. Record the events that create compensation—doors, turns, level changes, set-downs, regrips, bending/reach, loading, sorting, storage and dirty/clean transitions.**

HFI-03D explicitly forbids collapsing those events into a weighted friction score.

Accordingly:

- a short route can still be poor;
- a longer route can be acceptable if its handoffs are easy and technically honest;
- one represented level change is a real event even when exact door/set-down geometry is absent;
- missing event geometry remains `NOT-MODELLED` rather than being guessed;
- route frequency/consequence matter qualitatively, but no numeric distance/crossing threshold exists.

---

# 3. Finding register

| ID | Task / object question | Current RH evidence | Verdict | Consequence |
|---|---|---|---|---|
| `HFI-07D-01` | Grocery route: principal arrival → kitchen destination topology | principal entrance → hall → east gallery → kitchen is authored | **PASS — TOPOLOGY** | preserve direct all-weather kitchen reach |
| `HFI-07D-02` | Grocery route as complete loaded-body sequence | door leaves, handoffs, set-down, cold/dry storage and threshold detail absent | **NOT-MODELLED** | no claim that groceries can be carried through without forced regrip |
| `HFI-07D-03` | Garden-serving / tray route at macro scale | kitchen and garden-dining occupy adjacent rear fields with direct garden relationship | **PASS — TOPOLOGY** | preserve useful adjacency |
| `HFI-07D-04` | Garden-serving complete loaded sequence through external opening | exact door/leaf/threshold/drainage/set-down geometry absent | **NOT-MODELLED** | topology does not prove tray-carry usability |
| `HFI-07D-05` | Laundry location relative to dirty/clean origins/destinations | bedrooms + family bath upstairs; utility geography ground floor; upper linen/dry storage represented | **UNRESOLVED — MATERIAL TRADE-OFF** | current topology imposes repeated stair crossings, but relocation remedy has real technical counterburdens and no tested alternative yet |
| `HFI-07D-06` | Complete laundry event chain | actual basket staging, washer/dryer, drying, fold surface, doors and storage handoffs absent | **NOT-MODELLED** | no fake complete-route verdict or score |
| `HFI-07D-07` | Waste/recycling complete route | kitchen represented; internal/external bin/storage/collection destination not fixed | **NOT-MODELLED** | site-independent route cannot be completed honestly |
| `HFI-07D-08` | Cleaning-equipment routes | upper dry storage + ground service territory exist, but no controlled cleaning-equipment strategy | **NOT-MODELLED** | do not infer storage from spare-looking areas |
| `HFI-07D-09` | Childcare/caregiving loaded/assisted routes | no helper/child/device envelopes or task-specific route states | **NOT-MODELLED** | macro plan alone cannot prove two-body/carrying tasks |
| `HFI-07D-10` | Sofa outside → principal living room swept path | no representative object envelope + complete door/turn chain | **NOT-MODELLED** | room size/openings cannot substitute for swept path |
| `HFI-07D-11` | Mattress/bed → upper bedroom swept path | stair numeric topology exists; object envelope, landing/door chain does not | **NOT-MODELLED** | no delivery claim |
| `HFI-07D-12` | Domestic white-goods delivery/replacement | no complete domestic delivery opening/turn chain | **NOT-MODELLED** | service-plant replacement logic does not stand in for appliance route |
| `HFI-07D-13` | Pram/wheelchair route as complete object/device path | macro entrance-storey route exists; complete door/turn/threshold/device envelope absent | **NOT-MODELLED** | visitability intent is not swept-path proof |
| `HFI-07D-14` | Does the current house solve task friction by blanket route enlargement? | no; plan concentrates circulation and destination adjacency | **PASS — PROPORTIONALITY AT MACRO SCALE** | preserve task-specific/local intervention posture |

---

# 4. Groceries — macro geography passes, the actual carrying task does not yet exist as proof

The represented route is:

`principal entrance → entrance hall → east gallery → kitchen`

This is a good topological result for a frequent loaded task because:

- the route is all-weather;
- it does not require open-courtyard crossing;
- the kitchen is reached without traversing a chain of principal rooms;
- the route belongs to the ordinary domestic circulation system;
- the kitchen is a defined destination rather than residual cabinetry remote from the entrance route.

`HFI-07D-01 = PASS — TOPOLOGY`.

But the task target is the **complete sequence**. Current source does not show:

- whether a loaded user meets one or more closed doors;
- handle/latch operation with occupied hands;
- a credible set-down before a difficult interface;
- actual kitchen landing surface;
- cold/frozen and dry-storage handoff;
- packaging/waste consequence;
- exact external entrance threshold behaviour.

So `HFI-07D-02 = NOT-MODELLED`.

A topological pass and a sequence-level `NOT-MODELLED` are compatible; neither cancels the other.

---

# 5. Garden serving — adjacency is good, external interface remains unknown

The rear plan deliberately places:

`kitchen ↔ garden dining ↔ garden-side edge`

That is a proportionate macro arrangement for serving food/drink outside and moving trays between preparation/eating/garden use.

It therefore earns `PASS — TOPOLOGY`.

HFI does not convert that into a complete tray-route pass because the exact garden doors and thresholds are absent. The user state that matters—occupied hands carrying a tray—is precisely the state in which poor latch, leaf or threshold geometry becomes consequential.

The interface stays `NOT-MODELLED` until the source owns it.

---

# 6. Laundry — the represented burden is real

## 6.1 Current task geography

The house places:

- bedrooms upstairs;
- principal family bathing upstairs;
- upper linen/dry-storage territory upstairs;
- wet utility geography on the ground floor.

The represented repeated loop is therefore at least:

`upper bedroom/bathroom → upper circulation → stair → ground circulation → utility`

and later:

`utility → ground circulation → stair → upper circulation → bedroom/linen storage`.

The complete household task may also contain collection, sorting, washer loading, wet transfer, drying, folding and multiple clean-return destinations.

Even without those local details, **the level change is not speculative**. It is a source-owned feature of the plan.

## 6.2 Why this is not a `PASS`

A repeated dirty/clean laundry cycle that necessarily crosses the stair imposes a real burden:

- carrying a basket/load on stairs;
- occupied hands reduce immediate hand-support availability;
- descent/transition under carrying is a higher-reserve task than neutral walking;
- each laundry cycle can require more than one cross-level journey because dirty collection and clean return are opposite legs;
- upper origins/destinations are not exceptional: sleeping/bathing generate the task routinely.

The project therefore cannot call the current ground-floor utility placement a human-factors pass merely because the stair is otherwise good.

## 6.3 Why this is not yet an `IMPROVE`

HFI-06C explicitly kept cross-level laundry as **an audit proposition, not an adopted target**. There is no universal rule saying:

- laundry must be upstairs;
- one stair crossing is acceptable and two are not;
- route length beyond X metres fails;
- wet appliances should follow bedrooms rather than service/failure geography.

More importantly, HFI-05C records real countervailing duties for moving wet laundry functions upstairs:

- moisture/leak containment;
- ventilation/drying;
- appliance noise/vibration beside sleeping rooms;
- water/waste/service concentration;
- appliance electrical/fire considerations;
- delivery/replacement route;
- structural vibration/floor build-up;
- relationship to garden/dirty work and cleaning functions.

The current ground utility may therefore be imposing one human burden **in order to buy legitimate technical and domestic advantages**.

No alternative has yet been modelled strongly enough to show that the burden can be reduced without displacing more friction elsewhere.

## 6.4 Verdict

**`HFI-07D-05 = UNRESOLVED — MATERIAL TRADE-OFF`.**

This means:

- the cross-level burden is real and must survive synthesis;
- the current arrangement receives no incumbency pass;
- upstairs laundry is not pre-authorised;
- appliance duplication is not pre-authorised;
- a chute is not pre-authorised;
- route distance alone cannot decide;
- the next architectural move, if any, must compare a bounded alternative against the current technical advantages.

This is stronger than `NOT-MODELLED`, because the critical topology—the repeated level change between task origins/destinations and utility—is represented.

It is weaker than `CONFLICT`, because HFI has not yet selected a concrete improvement whose implementation collides with a hard duty.

---

# 7. Lower-burden laundry interventions remain live

Before any major relocation, the frozen research requires considering interventions that may reduce task burden without moving wet machinery upstairs, including:

- better upper dirty-laundry collection;
- upper clean-linen/storage coordination;
- useful basket/set-down positions at stair transitions where architecture permits;
- ground utility folding/staging that reduces extra trips/regrips;
- distributed light-item storage;
- improved drying handoff;
- only then, if still justified, an alternate wet-utility topology.

None can be awarded a verdict today because their exact geometry is not represented.

The point is to **preserve the problem without prematurely selecting the most expensive remedy**.

---

# 8. Waste/recycling — site boundary dominates

The complete route is:

`kitchen/use point → internal sort/bin → carry → external store/collection point → return`.

The Reference House has a kitchen, but it does not own:

- internal waste-storage position;
- external bin-store position;
- collection point;
- real side/rear/front access;
- collection regime;
- site levels.

The route is therefore `NOT-MODELLED`.

HFI specifically rejects inferring that the shortest route is best: smell, hygiene, pests, fire/security and cleaning can legitimately justify separation.

---

# 9. Cleaning / care — legitimate questions, absent source geometry

The house includes useful generic territories—service suite downstairs, linen/dressing/storage upstairs—but no controlled mapping of:

- vacuum/mop/chemical storage;
- bathroom cleaning kit;
- floor-by-floor distributed equipment;
- child-carrying routes;
- caregiver + cared-for movement envelopes;
- assistance staging.

These therefore remain `NOT-MODELLED`.

No assumption is made that one central cleaning cupboard is optimal; no assumption is made that duplicate equipment on every floor is proportionate.

---

# 10. Large-object routes remain genuinely unproved

The Reference House was not authored at the resolution required to prove:

- sofa delivery into principal living rooms;
- mattresses/beds to upper bedrooms;
- domestic white goods to kitchen/utility;
- pram or mobility-device swept movement through every relevant opening/turn.

HFI-03C established why isolated door width or room fit is not enough. A complete proof would need:

- representative object/device envelope;
- handler assumptions;
- start/goal;
- opening states;
- door clear openings;
- corner geometry;
- stair/landing geometry where relevant;
- rotation/regrip/staging opportunities.

Those facts are absent.

The correct result is `NOT-MODELLED`, not an optimistic assumption that furniture movers will manage.

---

# 11. No aggregate domestic-friction score

HFI-07D deliberately refuses to rank groceries, laundry, waste, cleaning and care by adding events into one number.

The reason is architectural:

- a stair crossing is not commensurate with a door operation;
- a wet/hot/dirty handoff can have different consequence from extra distance;
- frequency varies by household/task state;
- some separation is technically beneficial;
- some missing geometry prevents honest event counts.

The finding register therefore preserves each mechanism and its proof state separately.

---

# 12. Materiality / rewind consequence

HFI-07D produces **no direct geometry rewind**.

It produces one material unresolved architectural question:

> **Does the technical benefit of ground-floor wet utility geography justify the repeated upper↔ground laundry loop, or can a bounded alternative remove meaningful burden without creating a larger moisture/noise/services/failure/area problem?**

The current evidence is insufficient to answer that by declaration.

HFI-07E should therefore carry the laundry topology as an **unresolved architectural comparison obligation**, not as a defect requiring immediate room relocation.

The likely owners span:

- RH-02 for ground utility/service geography;
- RH-03 for upper sleeping/bathing/circulation geography;
- RH-06/RH-07 where services/moisture/ventilation/failure geography constrain alternatives;
- RH-10 for whole-house life-course/task coordination.

07E must narrow that ownership against current authoritative records rather than opening all gates indiscriminately.

---

# 13. Authority / maturity consequences

None in this packet.

HFI-07D:

- changes no room location;
- changes no utility equipment;
- creates no route-length target;
- creates no object envelope;
- creates no compiler proof;
- changes no doctrine/pattern;
- changes no publication/RH maturity;
- does not execute a rewind.

It records the current task/object audit state only.

---

# 14. Packet closeout

`HFI-07D → baseline ddcadc000431f3be3fa9bf1f23235e580b8001fa → audit object + complete domestic-task paths under HFI-07A proof boundary → HFI-03C/03D + HFI-05B/05C + HFI-06C/06D + current RH topology → groceries/garden-serving macro topology PASS; complete loaded sequences/object swept paths/waste/cleaning/care remain NOT-MODELLED; upper sleeping/bathing ↔ ground utility laundry loop = UNRESOLVED — MATERIAL TRADE-OFF, with real repeated stair burden but no pre-authorised relocation cure → no geometry change yet; carry material unresolved comparison to HFI-07E → exact next packet HFI-07E — finding / rewind register`

**Exact next packet:** **HFI-07E — finding / rewind register.**
