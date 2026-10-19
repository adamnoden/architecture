# HFI-06B — Movement Targets

**Packet:** HFI-06B  
**Programme:** [`docs/development/human-factors-low-friction-inhabitation-programme.md`](../../docs/development/human-factors-low-friction-inhabitation-programme.md)  
**Execution plan:** [`docs/development/human-factors-low-friction-inhabitation-execution-plan.md`](../../docs/development/human-factors-low-friction-inhabitation-execution-plan.md)  
**Owning issue:** #195  
**Baseline `main`:** `de71a941f432878ce0d6ba41c224e38ceef866e8`  
**Method:** HFI-06A target classes / derivation method  
**Question:** what movement targets are actually earned for stairs, circulation, doors/turns, thresholds and gradients once evidence, proportionality and conflict are preserved?  
**Boundary:** target formation only. This packet does **not** audit or change Reference House geometry; redesign the stair/circulation/thresholds; select products/details; set construction tolerances; edit doctrine/patterns; add compiler proof; or change publication maturity.

---

## 1. Result in one sentence

HFI-06B yields **one genuinely useful numerical Ovid’s House preference family — stair rise/going — and mostly relational movement targets elsewhere**.

That is deliberate.

The evidence does not justify turning every circulation question into a stronger millimetre minimum. Door/route/turn/threshold performance is dominated by coupled geometry, dynamic state, category and site/technical context.

---

# 2. Authority stack retained

Movement targets use the HFI-06A classes:

- `T1` — statutory/regulatory boundary;
- `T2` — external good practice;
- `T3` — evidence-supported range/relationship;
- `T4` — deliberately adopted Ovid’s House target;
- `T5` — Reference House/site/product value later.

A `T4` target never replaces an applicable `T1` duty.

---

# 3. Stair geometry

## `HFI-MOV-STAIR-01` — private-stair going

**Cause:** `CF-02 — support / level-change movement mismatch`.  
**Scenarios:** ordinary daily ascent/descent; larger-foot user; older/reduced-balance user; carrying/reduced-attention state.  
**Measure:** horizontal going under the applicable stair measurement convention; complete rise/going/pitch system remains coupled.

### Authority stack

- `T1`: current Approved Document K private-stair guidance permits `220–300 mm` going, subject to the rest of its method.
- `T3`: HFI-02B identifies `275–300 mm` as the credible ordinary-domestic comparison region. Contemporary experimental/government evidence shows strong improvement over smaller goings, with subjective benefit becoming less distinct around/above approximately `275 mm` but continued plausible foot-support/overstep benefit toward `300 mm`.
- HFI-05B: stronger-going comparison survived as `CARRY-FORWARD-CONDITIONAL`.
- HFI-05C: full stair-system/plan/headroom/structure conflicts must be preserved.

### Ovid’s House target

**Class/form:** `T4-TARGET — PREFERRED`.  
**Preferred going:** **`300 mm`** for the principal private stair, where the full stair system can accommodate it without creating a stronger conflict.

### Why 300 rather than 280

This is not because deeper is always better.

`300 mm` is selected because:

1. it sits at the strong end of the evidence-supported `275–300 mm` region;
2. it provides additional foot-support margin for larger feet and descent without entering speculative beyond-guidance generosity;
3. it remains inside current AD K private-stair going guidance rather than requiring project exceptionalism;
4. the incremental run relative to 280 is bounded and can be evaluated explicitly at architectural stage;
5. 05B found the comparison worth carrying, and 05C found no categorical technical veto—only full-system coordination.

### What it is **not**

- not a statutory minimum;
- not an HFI hard failure threshold at `299 mm`;
- not evidence that the current RH `280 mm` is dangerous or defective;
- not permission to break `2R+G`, headroom, landings, guarding, structure or plan coherence.

### HFI-07 interpretation later

A represented going materially below the preferred value may be `IMPROVE` even while corresponding with AD K. HFI-07 must judge the whole stair and burden, not convert 300 into a legal-style cliff.

**Evidence confidence:** `MODERATE/HIGH`.

---

## `HFI-MOV-STAIR-02` — private-stair rise

**Cause:** `CF-02`.  
**Measure:** finished rise under the applicable stair measurement convention.

### Authority stack

- `T1`: AD K private-stair guidance `150–220 mm`.
- `T3`: HFI-02B serious comparison `150–200 mm`, with concentrated ordinary-domestic comparison around `160–185 mm`; higher rises increase physical demand, while very low rises can lengthen the flight and reduce perceptual salience.

### Ovid’s House target

**Class/form:** `T4-TARGET — PREFERRED RANGE`.  
**Preferred rise band:** **`160–185 mm`**.

The exact `T5` rise must be selected as part of the floor-to-floor height/riser-count/going/landing system. There is no Ovid’s House claim that 160 is better than 175 or 183 merely because it is lower.

**No stronger Ovid’s House hard minimum/maximum is created beyond applicable T1 rules.**

**Evidence confidence:** `MODERATE`.

---

## `HFI-MOV-STAIR-03` — rise/going system before pitch optimisation

**Class/form:** `T4-REL`.

> **Select going and rise first from the evidence-supported/preferred regions, then derive pitch and verify all applicable external rules. Do not optimise pitch or `2R+G` as substitutes for foot-support and rise-demand evidence.**

- `T1`: retain AD K maximum pitch `42°` and `2R+G = 550–700 mm` where applicable.
- `T4`: no independent preferred pitch number is adopted.
- `T4`: no independent Ovid’s House `2R+G` target is adopted.

A plausible Ovid’s House stair should naturally end materially below the 42° ceiling if `HFI-MOV-STAIR-01/02` are met, but the derived value remains a consequence rather than the primary target.

---

## `HFI-MOV-STAIR-04` — dimensional consistency and transitions

**Cause:** `CF-02`.  
**Class/form:** `T4-REL`.

> **The repeated rise/going geometry, and especially the landing-to-first/last-step transitions, must be predictably consistent in the finished stair.**

Evidence for inconsistency as a stepping-risk mechanism is strong. HFI does **not** derive a construction tolerance from laboratory `10 mm` defects.

A numeric fabrication/site tolerance belongs to the stair construction/delivery owner after:

- construction type;
- finish build-up;
- datum method;
- fabrication/site capability;
- regulatory tolerance requirements

are known.

**Target outcome:** `NO-HFI-NUMERIC-TOLERANCE` at this stage.

---

## `HFI-MOV-STAIR-05` — hand support

**Cause:** `CF-02` + `CF-04`.  
**Class/form:** `T4-REL`.

> **Provide a continuous, genuinely graspable support/recovery interface through the stair journey and its transitions; treat the usable width as the width remaining after the effective handrail/support envelopes.**

### Numeric/non-numeric decisions

- `38 mm round` remains a strong `T3` candidate evidence point for later handrail detail, **not** a universal `T4` section.
- a second rail retains credible life-course/carrying/recovery value, but HFI-05 did not establish enough universal burden evidence to make “two rails everywhere” a hard project target.
- rail count/section/clearance therefore remain detail/target work where the actual stair width and guarding strategy are known.

**Outcome:** adopt relational support target; retain exact section/count as `T3 / PROJECT-DETAIL` rather than fake certainty.

---

## `HFI-MOV-STAIR-06` — tread-edge legibility

**Cause:** `CF-02` + visual/attention modifier.  
**Class/form:** `T4-REL`.

> **The true tread edge and the level-to-stair transition should remain visually legible under plausible domestic lighting; edge information must describe the real edge rather than a displaced decorative cue.**

`≥50%` contrast remains one study’s `T3` evidence point, not a T4 threshold.

No standalone lux or contrast number is adopted in 06B.

---

## `HFI-MOV-STAIR-07` — headroom

**Decision:** `ADOPT-EXTERNAL-T1`; no stronger T4 target.

Current AD K `2.0 m` guidance remains the correspondence point. HFI found insufficient contemporary evidence to invent a larger universal headroom number.

This does not excuse local collision/attention defects; HFI-07 still audits the represented route.

---

# 4. Stair target synthesis

| ID | Target | Class | Form | Outcome |
|---|---|---|---|---|
| MOV-STAIR-01 | principal private-stair going | `T4` | preferred | **300 mm** |
| MOV-STAIR-02 | private-stair rise | `T4` | preferred range | **160–185 mm** |
| MOV-STAIR-03 | rise/going/pitch system | `T4` | relationship | derive pitch; retain T1 `42°` / `2R+G` method |
| MOV-STAIR-04 | repeated/transition geometry | `T4` | relationship | consistent finished geometry; no invented HFI tolerance |
| MOV-STAIR-05 | hand support | `T4` | relationship | continuous graspable support; exact section/count downstream |
| MOV-STAIR-06 | edge legibility | `T4` | relationship | true edge visually legible; no contrast number yet |
| MOV-STAIR-07 | headroom | `T1` | minimum correspondence | retain external 2.0 m guidance; no stronger T4 |

---

# 5. Circulation width — no universal stronger number

## Why HFI does not adopt “1000/1200/1300 mm corridors” as a universal rule

HFI-03A establishes that circulation adequacy depends on:

- clear rather than gross width;
- door opening;
- approach direction;
- nib/return wall;
- leaf sweep;
- turn topology;
- local obstruction position/length;
- carrying/assistance/device state;
- route frequency.

HFI-05B specifically rejected blanket widening and carried forward **local conflict-node generosity**.

Therefore the absence of one larger corridor number is a conclusion, not an omission.

---

## `HFI-MOV-ROUTE-01` — effective clear route

**Cause:** `CF-01`.  
**Class/form:** `T4-REL / CLEAR-ENVELOPE`.

> **Judge the effective finished clear route through actual fixed obstructions and interfaces; gross planning fields receive no usability credit.**

Measurement must include relevant fixed encroachments and identify any permitted local pinch separately.

---

## `HFI-MOV-ROUTE-02` — route hierarchy

**Class/form:** `T4-REL`.

> **Classify routes by role/frequency before spending permanent circulation area. Principal high-frequency routes receive the strongest protection at conflict nodes; ordinary/low-frequency branches do not inherit blanket passing generosity without evidence.**

The HFI-03A `R1/R2/R3` taxonomy remains an internal analysis tool unless later integration decides otherwise.

No universal R1 scalar is adopted in 06B.

---

## `HFI-MOV-ROUTE-03` — external category comparators remain category-specific

### M4(2)

Where M4(2) applies/serves as a comparator, retain its current guidance relationships including:

- `900 mm` minimum clear hall/landing width;
- local obstruction conditions;
- approach-dependent door/corridor pairings;
- `300 mm` leading-edge nib.

### M4(3)

Where M4(3) applies/serves as a wheelchair category comparator, retain its distinct guidance including:

- `1050 mm` general clear approach/hall width;
- `1200 mm` for non-head-on doorway approach;
- `850 mm` internal clear door opening;
- `300 mm` leading-edge / `200 mm` following-edge nibs;
- corner-door/turning provisions.

**Decision:** these remain `T1 CATEGORY-SPECIFIC` values, not universal T4 Ovid’s House corridor dimensions.

---

# 6. Doors and doorway approaches

## `HFI-MOV-DOOR-01` — door + approach is one movement target

**Cause:** `CF-01` + `CF-07`.  
**Class/form:** `T4-REL / CLEAR-ENVELOPE`.

> **A doorway is acceptable only as part of its approach manoeuvre: clear opening, approach direction, leading/following-edge space, leaf sweep and adjacent clear route are one geometric system.**

This rejects both:

- “wide door fixes bad approach”; and
- “wide corridor fixes bad doorway”.

### Numeric decision

No universal Ovid’s House internal-door clear-opening number is adopted in 06B because:

- M4(2) itself couples opening to approach width;
- M4(3)’s `850 mm` is a wheelchair-category value;
- final room/task mix differs;
- leaf/approach geometry can dominate.

Where a particular Ovid’s House claim later requires a scalar (visitability, wheelchair room access, object route), use the applicable category/task target rather than one universal door number.

---

# 7. Turns and manoeuvre space

## `HFI-MOV-TURN-01` — name the manoeuvre

**Cause:** `CF-01`.  
**Class/form:** `T4-REL / CLEAR-ENVELOPE`.

> **Name and prove the actual manoeuvre before sizing the turn.**

At minimum distinguish:

- flowing 90° turn;
- non-head-on doorway entry;
- 180° reversal/dead-end;
- door operating position;
- wheelchair/device turn;
- wheelchair + attendant;
- object + handler swept path.

### Numeric decision

**No universal `1500 mm turning circle` or Ovid’s House turning square is adopted.**

Evidence shows large device/manoeuvre variation:

- current M4(3) uses specific 1500 mm provisions in defined situations;
- contemporary unrestricted mobility-device turn envelopes can be substantially larger;
- constrained manoeuvres can occur in smaller spaces with more corrections.

A generic circle would hide rather than solve the problem.

---

## `HFI-MOV-TURN-02` — protect conflict nodes

**Class/form:** `T4-REL`.

> **Do not allow the usable envelope to collapse where a person must turn, reach, open a door, recover or choose a route.**

Local pinch width, location, length and task must be represented in HFI-07 if source data exists.

No global width increment follows.

---

# 8. Passing and assistance

## `HFI-MOV-PASS-01` — local passing/recovery opportunity

**Class/form:** `T4-REL`.

> **Where repeated simultaneous use on a principal route materially justifies it, prefer local passing/recovery opportunities or naturally wider nodes before continuous whole-route enlargement.**

No domestic universal two-adult/two-wheelchair passing width is supported by current evidence.

## `HFI-MOV-ASSIST-01` — task-specific assistance geometry

**Class/form:** `T4-REL / CATEGORY-TASK-SPECIFIC`.

> **Provide assistance space where the actual task requires it; do not multiply every route by a two-person envelope.**

Exact sanitary/stair/door assistance geometry belongs to the relevant target/task and category.

---

# 9. Continuous ground plane

## `HFI-MOV-GP-01` — internal dry continuity

**Cause:** `CF-03`.  
**Class/form:** `T4-REL`.

> **Where the same internal dry floor build-up continues through an opening and no technical separation is required, introduce no deliberate persistent threshold/upstand.**

This is stronger and more honest than inventing a `≤X mm` tolerance for a detail that has no reason to exist.

If different build-ups/technical joints genuinely require a transition, `HFI-MOV-GP-02` applies.

---

## `HFI-MOV-GP-02` — necessary transition must earn and minimise discontinuity

**Class/form:** `T4-REL`.

> **Where a technical joint/upstand is necessary, minimise and shape the finished discontinuity while preserving its technical function, rather than treating the obstacle as inevitable.**

No universal scalar can cover dry movement joints, fire/acoustic interfaces, external sills and wet-room drainage edges.

---

## `HFI-MOV-GP-03` — external accessible threshold

**Cause:** `CF-03`; moisture/drainage hard constraint.  
**Class/form:** `T4-REL` plus `T1` ceiling where category guidance applies.

> **Target a level/lowest-practicable traversable threshold through exposure reduction, deliberate drainage and robust sill/weathering design; do not create an upstand merely because the maximum guidance permits one.**

### Numeric authority

Where applicable as current Part M guidance:

- accessible threshold: level or, if raised, no more than `15 mm` total height;
- upstands above `5 mm` chamfered under the guidance definition.

**Decision:** retain these as `T1 CATEGORY-SPECIFIC`; **do not promote 15 mm, 5 mm, 10 mm or any other sub-15 value to a universal T4 Ovid’s House maximum** because current empirical evidence does not establish a defensible optimum and site/product water management varies.

The T4 target is the **integrated relationship**, not a fake precision threshold.

---

## `HFI-MOV-GP-04` — whole-route continuity

**Class/form:** `T4-REL`.

> **A low sill is not a step-free route if the approach, landing, door operation or route immediately before/after it contains an unproved barrier.**

HFI-07 must audit start-to-destination continuity where the site/source represents it.

---

# 10. Gradients and crossfall

## `HFI-MOV-GRAD-01` — approach gradient classes

**Decision:** retain current external guidance as `T1 CATEGORY/SITE-SPECIFIC`; no stronger universal T4 scalar.

Current Part M guidance definitions preserved where applicable:

- `level`: gradient not exceeding `1:60`;
- `gently sloping`: steeper than `1:60` up to `1:20`;
- `ramped`: steeper than `1:20` up to `1:12`, subject to the detailed guidance.

### Ovid’s House relational target

**Class/form:** `T4-REL`.

> **Use the shallowest route/fall reasonably achievable for the actual topographic and drainage duty; avoid needless compound crossfall through demanding manoeuvre/door zones.**

Real-site gradients remain `T5` because the generic Reference House intentionally lacks plot levels.

---

# 11. Entrance landings

Current M4 category guidance includes, where applicable:

- M4(2) principal entrance level external landing at least `1200 × 1200 mm`;
- M4(3) principal entrance level external landing `1500 × 1500 mm`.

These remain `T1 CATEGORY-SPECIFIC` comparators.

HFI does **not** invent an intermediate universal Ovid’s House square.

## `HFI-MOV-LAND-01`

**Class/form:** `T4-REL / CLEAR-ENVELOPE`.

> **The landing must provide the actual stable operating/recovery envelope required by the door, approach and claimed user scenario, with usable geometry remaining after leaf sweep and fixed obstructions.**

---

# 12. Object movement interface

HFI-03C owns representative furniture/appliance/object swept paths.

## `HFI-MOV-OBJ-01`

**Class/form:** `T4-REL / CLEAR-ENVELOPE`.

> **Where an object route is claimed, prove the object + handler swept path through the full sequence rather than deriving a generic “furniture corridor width”.**

No universal object-route scalar is adopted in 06B.

---

# 13. Movement target register

| ID | Subject | T4 result |
|---|---|---|
| MOV-STAIR-01 | private stair going | **preferred 300 mm** |
| MOV-STAIR-02 | private stair rise | **preferred 160–185 mm** |
| MOV-STAIR-03 | pitch / `2R+G` | relationship; preserve external method, no independent T4 number |
| MOV-STAIR-04 | consistency | relationship; numeric workmanship tolerance downstream |
| MOV-STAIR-05 | hand support | continuous graspable support; exact section/count downstream |
| MOV-STAIR-06 | tread-edge legibility | relationship; no contrast/lux scalar |
| MOV-STAIR-07 | headroom | no stronger T4; retain external 2.0 m guidance correspondence |
| MOV-ROUTE-01 | clear route | effective finished clear envelope, not gross field |
| MOV-ROUTE-02 | route hierarchy | role/frequency before blanket area |
| MOV-DOOR-01 | doors | clear opening + approach + nib + leaf as one manoeuvre; no universal scalar |
| MOV-TURN-01 | turns | manoeuvre-specific swept envelope; no generic 1500 circle |
| MOV-TURN-02 | conflict nodes | protect local usable envelope |
| MOV-PASS-01 | passing | local opportunity where earned; no universal continuous width |
| MOV-ASSIST-01 | assistance | task/category specific; no two-person multiplier |
| MOV-GP-01 | internal dry transitions | no deliberate persistent upstand where none technically required |
| MOV-GP-02 | necessary transitions | minimise/shape while preserving technical duty |
| MOV-GP-03 | external threshold | target level/lowest practicable integrated interface; retain category T1 `≤15 mm`, no stronger invented scalar |
| MOV-GP-04 | step-free route | whole-route proof |
| MOV-GRAD-01 | approach/falls | shallowest reasonable / purposeful; category/site values external/T5 |
| MOV-LAND-01 | landings | usable door/approach/recovery envelope; category comparators preserved |
| MOV-OBJ-01 | object movement | object + handler swept path; no generic width |

---

# 14. Deliberate non-targets

HFI-06B explicitly does **not** adopt:

- universal `1000`, `1200` or `1300 mm` domestic corridor width;
- universal `850 mm` internal door clear opening outside its applicable wheelchair/category/task context;
- universal `1500 mm` turning circle;
- universal continuous two-person passing width;
- universal assistance width;
- a numeric crossfall target independent of drainage/site;
- `15 mm` as a preferred threshold;
- a made-up `5/10 mm` Ovid’s House threshold maximum;
- `38 mm round` as the universal handrail section;
- `50%` as the universal tread-edge contrast;
- a stronger headroom number than current external guidance without evidence;
- a construction tolerance derived from laboratory inconsistent-step defects;
- a generic furniture-movement corridor width.

The programme is stronger for refusing these shortcuts.

---

# 15. Target interactions

Movement targets must not be applied independently.

Examples:

### Stair

`300 mm going + 160–185 mm rise` must still coordinate:

- floor-to-floor height;
- integer riser count;
- flight run;
- landings;
- headroom;
- handrails/usable width;
- guarding;
- structure;
- Part K correspondence;
- future stairlift compatibility if claimed.

### Door/corridor

A wider door can require more leaf sweep. A wider corridor can still fail if a leaf/turn consumes it. The manoeuvre target controls.

### Threshold

A lower sill can worsen water resistance unless exposure/drainage is solved. The integrated target controls.

### Local generosity

A wider turn node can steal adjacent storage and increase domestic task distance. HFI-07/HFI-08 must judge the complete consequence.

---

# 16. Reference House audit handoff — no verdict here

HFI-07 should now be able to ask, without moving the goalposts:

### Stair

- represented going vs preferred `300 mm`;
- represented rise vs preferred `160–185 mm` band;
- full system / AD K correspondence;
- finished consistency information if modelled;
- hand-support/edge/headroom state if modelled.

The current `280 / 183.333 mm` stair is **not judged in 06B**. Target derivation is deliberately independent of it.

### Circulation

- actual finished clear route rather than 1300 gross fields;
- door/turn manoeuvre state;
- local pinch/conflict nodes;
- applicable category-specific comparator where a claim is made;
- object/assistance route only where represented.

### Ground plane

- no gratuitous internal lips;
- external sill + landing + drainage + route relationship;
- applicable category threshold ceiling where claimed;
- site gradient only when site data exists.

Missing data remains `NOT-MODELLED`.

---

# 17. Red-team of the 300 mm stair preference

Because `300 mm` is the only prominent new scalar T4 preference in this packet, it receives explicit adversarial review.

### “Is 300 just the user’s large-foot preference?”

No. The original large-foot complaint opened the question but is not the derivation. The target comes from convergent going evidence, current government domestic-stair research and proportionality review.

### “Does the evidence prove 300 is safer than 280?”

Not as a direct population accident-rate claim. Evidence supports the mechanism and a credible continuing foot-support/overstep benefit; subjective differences diminish above roughly 275. Therefore 300 is a **preferred project value**, not a hard safety cliff.

### “Why not 325 if deeper helps?”

Because the 2020 experimental 325 condition does not establish an ordinary-domestic optimum; current AD K private-stair guidance tops the going range at 300; benefits are nonlinear; plan burden continues. Going beyond 300 would require a stronger exceptional case.

### “Why not keep 280 since it is already credible?”

Because target derivation gives current RH geometry zero incumbency weight. If choosing afresh, 300 provides a modest additional foot-support margin inside the recognised candidate region and current guidance envelope. HFI-07 may still conclude the cost of changing an already-coordinated 280 system is disproportionate—but that is an audit/integration judgement, not target formation.

### “Why not make 300 a minimum?”

Because the evidence does not justify a binary defect at 299/280. `T4-TARGET` correctly expresses a preferred design centre without pretending that nearby values suddenly become unsafe.

Result: **300 mm survives as a preferred T4 target, not a minimum.**

---

# 18. Computational boundary

No compiler admission occurs in 06B.

Potential future machine-checkable facts include:

- stair rise/going/pitch/`2R+G`;
- clear route fields if genuinely authored;
- door opening/leaf/nib geometry;
- swept envelopes;
- floor datums and threshold profiles.

But HFI-09C must separately decide proofability.

Critical separations:

- RH-C5 Approved Document K correspondence remains its existing external method;
- a future Ovid’s House `300 mm preferred going` check would be a separate HFI rule;
- no compiler may infer drainage/watertightness from threshold height;
- no generic turn-radius check may replace actual swept-path proof where the target is relational.

---

# 19. Closeout

**Packet:** HFI-06B — movement targets  
**Baseline:** `de71a941f432878ce0d6ba41c224e38ceef866e8`  
**Main numeric Ovid’s House targets:** preferred principal private-stair going **300 mm**; preferred rise range **160–185 mm**, both explicitly non-statutory and system-dependent.  
**External-only numeric boundaries retained:** AD K pitch/`2R+G`/headroom; category-specific M4 circulation/door/landing/threshold dimensions; Part M gradient classes.  
**Relational T4 targets:** complete stair system; finished stair consistency; continuous graspable hand support; edge legibility; effective clear routes; door+approach manoeuvre; manoeuvre-specific turns; protected conflict nodes; local passing/assistance; internal dry continuity; technically robust external thresholds; whole-route proof; purposeful gradients; object+handler swept paths.  
**Deliberate non-targets:** no universal corridor width, door width, turning circle, two-person width, assistance width, crossfall number, sub-15 mm threshold number, handrail diameter, tread contrast or furniture-route width.  
**Checks:** no Reference House verdict/rewind or geometry change; no product/detail selection; no construction tolerance; no doctrine/pattern/compiler/publication/maturity change.  
**Exact next packet:** **HFI-06C — interface and task targets.**
