# HFI-07D — Reference House Object + Domestic-Task Path Audit

**Packet:** HFI-07D  
**Programme:** [`docs/development/human-factors-low-friction-inhabitation-programme.md`](../../docs/development/human-factors-low-friction-inhabitation-programme.md)  
**Execution plan:** [`docs/development/human-factors-low-friction-inhabitation-execution-plan.md`](../../docs/development/human-factors-low-friction-inhabitation-execution-plan.md)  
**Owning issue:** #195  
**Baseline `main`:** `313cf9dcab138787cf1d6f177f68993aa37d74f3`  
**Coverage authority:** [`hfi-07a-modelability-coverage.md`](hfi-07a-modelability-coverage.md)  
**Question:** what can the current Reference House honestly conclude about furniture/object movement and repeated domestic task paths, especially the cross-level laundry loop?  
**Boundary:** HFI-07 verdicts only. This packet does not relocate utility functions, add an upstairs laundry, invent a chute, author object envelopes/door geometry, alter the stair, create a route-efficiency score, create compiler proof, change doctrine/patterns/publication or execute a rewind.

---

## 1. Result

The current Reference House has **promising macro task geography for groceries and garden-serving**, but detailed object routes remain largely `NOT-MODELLED`. The one major repeated burden genuinely represented is the **upper sleeping/bathing ↔ ground utility laundry loop**, which earns **`UNRESOLVED — MATERIAL TRADE-OFF`**, not an automatic upstairs-laundry remedy: the repeated stair-carrying burden is real, but so are moisture/noise/services/failure-geography reasons for keeping wet utility functions downstairs.

No object/task-path geometry change is earned directly by this packet.

---

## 2. Audit rule — sequence, not metres

HFI-06C adopted `HFI-USE-TASK-01`: repeated domestic work is judged through the complete task chain, recording doors, turns, level changes, set-downs, regrips, bending/reach, loading, sorting, storage and dirty/clean transitions.

Therefore:

- a short route can still be poor;
- one represented level change is a real event even when local door/set-down geometry is absent;
- missing event geometry remains `NOT-MODELLED`;
- no numeric route-length or stair-crossing threshold is invented;
- no weighted domestic-friction score is permitted.

---

## 3. Finding register

| ID | Task / object question | Current RH evidence | Verdict |
|---|---|---|---|
| `HFI-07D-01` | Grocery arrival → kitchen topology | principal entrance → hall → east gallery → kitchen | **PASS — TOPOLOGY** |
| `HFI-07D-02` | Complete loaded grocery sequence | door leaves, set-down, cold/dry storage and threshold detail absent | **NOT-MODELLED** |
| `HFI-07D-03` | Garden-serving topology | kitchen + garden dining + garden-side relationship authored | **PASS — TOPOLOGY** |
| `HFI-07D-04` | Complete loaded garden/tray sequence | door/leaf/threshold/drainage/set-down geometry absent | **NOT-MODELLED** |
| `HFI-07D-05` | Laundry geography | bedrooms/bath upstairs; utility ground; upper linen/storage represented | **UNRESOLVED — MATERIAL TRADE-OFF** |
| `HFI-07D-06` | Complete laundry event chain | basket staging, appliances, drying, folding, doors and storage handoffs absent | **NOT-MODELLED** |
| `HFI-07D-07` | Waste/recycling route | kitchen represented; bin/store/collection destination not fixed | **NOT-MODELLED** |
| `HFI-07D-08` | Cleaning-equipment routes | no controlled house-wide equipment/storage strategy | **NOT-MODELLED** |
| `HFI-07D-09` | Childcare/caregiving routes | no helper/child/device envelopes or task states | **NOT-MODELLED** |
| `HFI-07D-10` | Sofa → living-room swept path | no object envelope + complete opening/turn chain | **NOT-MODELLED** |
| `HFI-07D-11` | Mattress/bed → upper bedroom path | no object envelope + detailed stair/door chain | **NOT-MODELLED** |
| `HFI-07D-12` | White-goods delivery/replacement | no complete domestic delivery chain | **NOT-MODELLED** |
| `HFI-07D-13` | Pram/wheelchair complete device path | macro route exists; detailed door/turn/threshold envelope absent | **NOT-MODELLED** |
| `HFI-07D-14` | Blanket route enlargement | current plan concentrates circulation rather than universal widening | **PASS — PROPORTIONALITY AT MACRO SCALE** |

---

## 4. Groceries

The authored route `principal entrance → hall → east gallery → kitchen` is a good macro result for a frequent loaded task: it is all-weather, avoids routine courtyard crossing and reaches the kitchen without serial traversal of principal rooms.

That earns `PASS — TOPOLOGY`.

The complete task does **not** pass because current source does not show closed-door interactions, loaded handle/latch use, credible set-down, kitchen landing surface, cold/dry storage handoff or exact entrance threshold behaviour. Those remain `NOT-MODELLED`.

---

## 5. Garden serving

The rear relationship `kitchen ↔ garden dining ↔ garden-side edge` earns `PASS — TOPOLOGY`.

The actual tray-carry sequence remains `NOT-MODELLED` because exact garden-door, threshold, drainage and set-down geometry are absent. A good adjacency is not a complete occupied-hands proof.

---

## 6. Laundry — represented burden, unresolved remedy

### 6.1 Source-owned loop

The house places bedrooms, principal bathing and upper linen/storage upstairs while wet utility geography is on the ground floor. The represented loop is at least:

`upper bedroom/bath → upper circulation → stair → ground circulation → utility`

plus the clean return journey upstairs.

The level change is therefore not speculative.

### 6.2 Why the current arrangement cannot simply `PASS`

A repeated laundry cycle necessarily introduces stair carrying between the principal task origins/destinations and the utility. Occupied hands reduce immediate rail availability; dirty collection and clean return create repeated crossings; and the task is routine rather than exceptional.

The ground-floor utility therefore receives no HFI incumbency pass.

### 6.3 Why this is not yet an `IMPROVE`

HFI-06C explicitly kept cross-level laundry as **an audit proposition, not an adopted target**. HFI has no universal rule that laundry belongs upstairs or that a specified number of stair crossings fails.

HFI-05C also records legitimate countervailing duties for wet utility geography:

- moisture/leak containment;
- ventilation/drying;
- appliance noise/vibration near bedrooms;
- water/waste/service concentration;
- appliance electrical/fire considerations;
- delivery/replacement;
- structural vibration/floor build-up;
- garden/dirty-work relationships.

No alternate topology has yet been represented strongly enough to show that it removes more burden than it displaces.

### 6.4 Verdict

**`HFI-07D-05 = UNRESOLVED — MATERIAL TRADE-OFF`.**

This means:

- the cross-level burden is real and survives synthesis;
- the current arrangement gets no automatic pass;
- upstairs laundry, duplicated appliances and a chute are not pre-authorised;
- route distance alone cannot decide;
- any later architectural move must compare a bounded alternative against the technical advantages of the current service geography.

This is stronger than `NOT-MODELLED` because the critical level-change topology is represented. It is weaker than `CONFLICT` because no concrete improvement has yet been selected whose implementation collides with a hard duty.

---

## 7. Lower-burden laundry interventions remain live

Before major relocation, later integration should be free to test:

- better upper dirty-laundry collection;
- upper clean-linen/storage coordination;
- basket/set-down positions at stair transitions where geometry permits;
- folding/staging that reduces extra trips/regrips;
- distributed light-item storage;
- improved drying handoff;
- only then, if justified, an alternate wet-utility topology.

None receives a verdict now because its geometry is absent.

---

## 8. Waste, cleaning and care

The waste route cannot be completed because internal/external bin storage, collection point and real-site access are not owned by the generic Reference House.

Cleaning remains `NOT-MODELLED`: service/linen/storage territories exist, but there is no controlled vacuum/mop/chemical strategy.

Childcare/caregiving remains `NOT-MODELLED`: no two-body, carried-child or device-specific envelopes/sequences are represented.

HFI makes no assumption that one central cleaning cupboard, duplicated equipment, shortest waste route or continuous two-person width is automatically better.

---

## 9. Large-object routes

The source cannot prove sofa, mattress/bed, white-goods or pram/mobility-device movement. A valid swept-path proof would require a representative object/device envelope, handler assumptions, start/goal, opening states, clear openings, turns, stair/landing geometry where relevant and rotation/regrip/staging opportunities.

Those facts are absent, so the correct verdict is `NOT-MODELLED` rather than “movers will manage”.

---

## 10. Materiality / rewind consequence

HFI-07D creates **no direct geometry rewind**.

It creates one material unresolved architectural comparison obligation:

> **Does the technical benefit of ground-floor wet utility geography justify the repeated upper↔ground laundry loop, or can a bounded alternative remove meaningful burden without creating a larger moisture/noise/services/failure/area problem?**

HFI-07E should carry this as unresolved rather than as a defect requiring immediate relocation, and should narrow ownership against current authority rather than reopening multiple gates indiscriminately.

Candidate ownership to test in 07E includes RH-02 for ground utility geography, RH-03 for upper task geography, relevant service/moisture gates for technical constraints, and RH-10 for whole-house task coordination.

---

## 11. Authority / maturity consequences

None.

No room, utility equipment, target, object envelope, compiler proof, doctrine/pattern, publication content or maturity state changes. No rewind is executed.

---

## 12. Packet closeout

`HFI-07D → baseline 313cf9dcab138787cf1d6f177f68993aa37d74f3 → audit object + complete domestic-task paths under HFI-07A → HFI-03C/03D + HFI-05B/05C + HFI-06C/06D + current RH topology → groceries/garden-serving macro topology PASS; detailed loaded/object/waste/cleaning/care routes NOT-MODELLED; upper sleeping/bathing ↔ ground utility laundry loop UNRESOLVED — MATERIAL TRADE-OFF → no geometry change; carry unresolved comparison to HFI-07E → exact next packet HFI-07E — finding / rewind register`

**Exact next packet:** **HFI-07E — finding / rewind register.**
