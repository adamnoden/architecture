# HFI-07B — Reference House Approach + Ground-Floor Audit

**Packet:** HFI-07B  
**Programme:** [`docs/development/human-factors-low-friction-inhabitation-programme.md`](../../docs/development/human-factors-low-friction-inhabitation-programme.md)  
**Execution plan:** [`docs/development/human-factors-low-friction-inhabitation-execution-plan.md`](../../docs/development/human-factors-low-friction-inhabitation-execution-plan.md)  
**Owning issue:** #195  
**Baseline `main`:** `4724be3b3f376f9b324e07ec6c70c0e32847077f`  
**Coverage authority:** [`hfi-07a-modelability-coverage.md`](hfi-07a-modelability-coverage.md)  
**Question:** how does the current Reference House perform against HFI targets at the principal approach and entrance storey, without inventing missing occupied-interface geometry?  
**Boundary:** HFI-07 verdicts only. This packet does not alter Reference House geometry, derive new targets, author missing doors/fixtures/thresholds, create compiler proof, change doctrine/patterns/publication or reopen an RH gate.

---

## 1. Result in one sentence

At the resolution the Reference House actually represents, the **ground-floor topology is strong**: it provides a one-level entrance storey, a deliberate all-weather principal domestic route, direct food/living/garden relationships and a credible entrance-level fallback *framework* without forcing routine use through the open courtyard. But the model is **not yet detailed enough to prove the human-factors performance of the approach, thresholds, doorway manoeuvres, WC/shower, controls, kitchen open states or the complete fallback-living mode**.

No ground-floor geometry change is earned by this packet.

---

## 2. Verdict discipline

HFI-07A froze the result vocabulary:

`PASS / IMPROVE / CONFLICT / UNRESOLVED / NOT-MODELLED`

This packet applies it at the **claim scope the current source can support**.

A macro-topology `PASS` does not imply that an unmodelled doorway, threshold or fixture arrangement also passes. Conversely, `NOT-MODELLED` does not turn a good topological decision into a defect.

---

# 3. Finding register

| ID | Question / target | Evidence in current RH | Verdict | Consequence |
|---|---|---|---|---|
| `HFI-07B-01` | Does the entrance storey provide continuous same-level planning topology between principal domestic destinations? | one ground FFL; entrance hall, gallery, living rooms, kitchen/garden dining and service suite all on ground level; RH-10 explicitly intends an internally step-free ground floor | **PASS — TOPOLOGY** | preserve one-level ground-floor order; local thresholds remain separate |
| `HFI-07B-02` | Is there an ordinary all-weather route from entrance toward kitchen/garden-side life without crossing the open courtyard or passing serially through principal rooms? | RH-02 selected G1 specifically to provide hall → east inner gallery → kitchen/garden-side route | **PASS — TOPOLOGY** | no rewind |
| `HFI-07B-03` | Is the ordinary route architecturally dignified/equivalent rather than a conspicuous back/service-door workaround? | gallery is a deliberate internal architectural circulation element tied to the courtyard and principal arrival, not an alternate external/service entrance | **PASS — ROUTE ROLE** | preserve dignity/equivalence in later detail |
| `HFI-07B-04` | Does the effective finished gallery route satisfy HFI-MOV-ROUTE-01 through real obstructions? | `G-GAL-01` is 1300 mm **gross**; final walls, doors, joinery, radiators and local pinch geometry unresolved | **NOT-MODELLED** | do not award clear-width credit from gross field |
| `HFI-07B-05` | Do ground-floor doorway approaches satisfy the coupled door + route + nib + swing target? | internal door positions, clear openings and leaf swings are not comprehensively authored | **NOT-MODELLED** | later architectural/technical source must represent them before judgment |
| `HFI-07B-06` | Is the public/site approach to the principal entrance step-free and low-friction? | Reference House is site-agnostic; pavement, set-down, parking, slope and external levels intentionally absent | **NOT-MODELLED — SITE-BOUND** | not an RH defect; real project must prove it |
| `HFI-07B-07` | Does the principal entrance threshold satisfy continuous-ground-plane use while remaining weather/drainage real? | substantially-level intent exists, but exact doorset/drainage/thermal/weathering geometry is unresolved | **NOT-MODELLED** | no false PASS from the word “level” |
| `HFI-07B-08` | Does ordinary internal dry-floor continuity avoid gratuitous threshold/upstand events? | RH-09 explicitly selects no decorative threshold strip where the same floor build-up continues | **PASS — ARCHITECTURAL SELECTION** | preserve this relation; individual constructed openings remain unproved |
| `HFI-07B-09` | Are courtyard/garden thresholds low-friction and technically sound? | substantially flush intent only; exact external threshold geometry unresolved | **NOT-MODELLED** | later source must reconcile drainage/weathering/accessibility |
| `HFI-07B-10` | Is a plausible entrance-level sleeping destination available if routine stair use is lost? | multiple entrance-storey habitable rooms exist; RH-10 explicitly preserves a future sleeping-room option | **PASS — TOPOLOGICAL CAPABILITY** | no dedicated bedroom conversion is mandated |
| `HFI-07B-11` | Can the entrance storey support the **complete** fallback daily cycle: entry + living + food + WC + washing + sleeping? | topology provides living/food/sleeping candidates, but WC/shower and sleeping-use clearances are not represented at HFI resolution | **NOT-MODELLED — COMPLETE MODE** | do not upgrade a plausible fallback framework into a proved accessible suite |
| `HFI-07B-12` | Does the ground WC work as a real sanitary task, including door, basin/WC geometry, use/transfer and assistance where claimed? | service-suite reservation exists; final `G-WC-01` fixture/door geometry does not | **NOT-MODELLED** | RH-10 intention remains to be proved |
| `HFI-07B-13` | Is the potential entrance-level level-access shower a real low-friction bathing provision? | provision is an explicit adaptation intention; no shower/drainage/control/dry-staging/support geometry exists | **NOT-MODELLED** | no claim of usable showering yet |
| `HFI-07B-14` | Does kitchen fixed geometry satisfy open-state appliance/work/landing targets? | `G-KIT-02` room field exists; appliance, worktop and open-state geometry does not | **NOT-MODELLED** | room size is not task proof |
| `HFI-07B-15` | Are fixed controls placed/operated as coherent action sequences? | RH-09 has general accessible-band and door-surround positions but no T5 control map/action loop | **NOT-MODELLED** | no usability credit from mounting-band intent alone |
| `HFI-07B-16` | Do doors/windows meet reach, force, grip, one-hand and completion targets? | no product/action-force/handle sequence data | **NOT-MODELLED** | later product/interface design owns proof |
| `HFI-07B-17` | Does the rear plan give a low-friction garden-serving relationship at macro scale? | kitchen + garden dining are directly at rear/garden edge with explicit direct-garden intent | **PASS — TOPOLOGY** | detailed external doors/thresholds remain unproved |
| `HFI-07B-18` | Does ground-floor planning force permanent blanket circulation enlargement to achieve HFI goals? | selected G1 uses one concentrated gallery and wider destination/arrival nodes rather than a full circulation ring | **PASS — PROPORTIONALITY AT PLAN LEVEL** | preserve local-node logic; do not infer final clear widths |

---

# 4. What passes — and what that pass actually means

## 4.1 One-level entrance storey

The current Reference House makes a sound irreversible move: the principal entrance-storey programme is organised on one level.

That is valuable because it avoids building a permanent stair/step into ordinary daily movement between:

- arrival;
- principal living;
- food preparation/eating;
- sanitary/service territory;
- garden-side domestic life.

This earns `HFI-07B-01 = PASS — TOPOLOGY`.

It does **not** prove that every opening between those destinations is flush or manoeuvrable. HFI-07A forbids that inference.

## 4.2 All-weather domestic route

RH-02 already rejected the apparently efficient alternative in which normal front-to-rear movement would require crossing the open courtyard or serially traversing principal rooms.

The selected one-sided gallery therefore aligns strongly with HFI-03A/03D and HFI-MOV-ROUTE-02:

- it recognises route frequency;
- it gives the repeated front-to-rear journey a stable internal path;
- it does not spend area on a full circulation ring;
- it does not make weather exposure the price of architectural drama.

This is a substantive `PASS`, not merely absence of failure.

## 4.3 Dignity / equivalent use

The all-weather route is not a hidden accessible bypass beside a more prestigious stair/entrance sequence. It starts from the same principal arrival and uses an intentional courtyard-side gallery that belongs to the architecture.

That is enough for `HFI-07B-03 = PASS — ROUTE ROLE`.

The result must be protected downstream: later doors, utility storage or technical equipment must not turn this gallery into a visibly second-class service corridor for users who depend on the level route.

## 4.4 Entrance-level sleeping capability

The plan does not need a permanently labelled accessible bedroom to preserve life-course value. It contains entrance-storey habitable rooms capable in principle of changing use.

That earns only the topological capability pass. The complete fallback mode does **not** pass because the sanitary and bed-use geometry required by HFI-02C is not represented.

This distinction prevents two opposite errors:

- dismissing flexible room use because no dedicated accessible suite exists; and
- claiming life-course adequacy because “a sofa could go downstairs”.

---

# 5. The 1300 mm gallery is not a 1300 mm HFI corridor

The executable ground gallery occupies X `7800–9100`, hence **1300 mm gross**.

HFI-06B deliberately rejected a universal wider-corridor number. The relevant target is the **effective finished clear route**, including:

- wall/finish depth;
- door openings and leaves;
- approach geometry;
- fixed joinery/radiators;
- local obstruction position and length;
- conflict nodes.

Those facts are not currently represented.

Therefore:

> **The 1300 mm field is neither a PASS nor an IMPROVE finding for circulation width. It is planning geometry.**

`HFI-07B-04 = NOT-MODELLED` is the only defensible verdict.

This also blocks a future shortcut in which a drawing dimension is quoted as if it were finished usable width.

---

# 6. Continuous ground plane — good principle, incomplete proof

The Reference House already contains two decisions that align with HFI:

1. the ground floor is intended as one level;
2. RH-09 rejects decorative threshold strips where the same internal floor build-up continues.

Those are good architectural selections and are preserved.

But the external interfaces are harder:

- principal entrance;
- garden doors;
- courtyard doors;
- any genuine change of floor build-up or environmental duty.

HFI-MOV-GP-02 requires a necessary transition to earn its discontinuity and minimise it without cheating moisture/weathering duties. Current RH source does not yet represent that assembly.

Thus external threshold questions remain `NOT-MODELLED`, not `PASS` and not `CONFLICT`.

There is no demonstrated conflict yet because no detailed threshold solution exists to collide with the HFI target.

---

# 7. Entrance-level fallback — framework passes, complete mode does not exist as proof

HFI-02C defines a credible entrance-level fallback daily cycle as access to:

- entrance and principal living;
- food preparation/eating;
- WC;
- washing/showering;
- plausible sleeping.

The Reference House has a promising topology for all five. But HFI-07A correctly prevents topology from swallowing use geometry.

Specifically, current source does not prove:

- a real `G-WC-01` fixture arrangement;
- a level-access shower and drainage assembly;
- shower control-before-consequence geometry;
- dry reachable staging/dressing;
- future support-capable zones;
- sleeping-room bed placement, approach and privacy under fallback use;
- door manoeuvres connecting the sequence.

The whole fallback mode is therefore `NOT-MODELLED` at present.

This is a meaningful gap in proof, but **not yet evidence of a bad ground-floor plan**.

---

# 8. No ground-floor `IMPROVE` verdict is earned yet

HFI-07 is adversarial, but it is not required to manufacture a defect.

At the current source resolution, every represented ground-floor architectural relationship that HFI can legitimately judge is either sound or deliberately proportionate:

- one-level topology;
- all-weather front-to-rear route;
- dignified route role;
- flexible entrance-level habitable capacity;
- direct rear food/living/garden relationship;
- concentrated rather than blanket circulation area.

The obvious possible problems—door approaches, threshold details, WC/shower geometry, kitchen open states, controls—are not represented strongly enough to condemn or approve.

Therefore **HFI-07B records zero `IMPROVE` findings and zero `CONFLICT` findings**.

That is a proof-boundary result, not a declaration that the ground floor is finished.

---

# 9. RH rewind / stale downstream consequence

None from HFI-07B.

No represented ground-floor condition has earned a material defect verdict, so there is no basis to reopen RH-02, RH-09 or RH-10 in this packet.

The `NOT-MODELLED` items remain questions for later architectural/technical development and for HFI-07E disposition. They must not be backfilled merely to make the audit look complete.

No controlled publication, DRW plate, compiler proof or pattern occurrence is made stale by this packet.

---

# 10. Authority / maturity consequences

None.

HFI-07B:

- changes no Reference House geometry;
- changes no target;
- changes no doctrine or pattern;
- creates no compliance claim;
- creates no computational proof;
- changes no publication or Reference House maturity.

It adds only the adversarial audit record.

---

# 11. Packet closeout

`HFI-07B → baseline 4724be3b3f376f9b324e07ec6c70c0e32847077f → audit principal approach + ground floor under HFI-07A proof boundary → current RH-02/RH-09/RH-10 + executable fixture + HFI-02C/HFI-03/HFI-06 targets → macro one-level/all-weather/dignified/fallback-capable topology passes; detailed approach/threshold/door/sanitary/control/kitchen questions remain NOT-MODELLED; zero IMPROVE/CONFLICT → no architectural change or stale downstream artefact → exact next packet HFI-07C — stair + upper floor`

**Exact next packet:** **HFI-07C — stair + upper floor.**
