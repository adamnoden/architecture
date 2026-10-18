# HFI-03A — Circulation Geometry

**Packet:** HFI-03A  
**Programme:** [`docs/development/human-factors-low-friction-inhabitation-programme.md`](../../docs/development/human-factors-low-friction-inhabitation-programme.md)  
**Execution plan:** [`docs/development/human-factors-low-friction-inhabitation-execution-plan.md`](../../docs/development/human-factors-low-friction-inhabitation-execution-plan.md)  
**Owning issue:** #195  
**Baseline `main`:** `895d47d0ea356003eb5d37d4e1d2ce8a56df75a8`  
**Prior packet:** HFI-02D — carrying / reduced-attention movement  
**Question:** what evidence and normative geometry is strong enough to constrain later HFI reasoning about domestic corridors, landings, doorway approaches, corners, local manoeuvre space, passing and assistance without converting minimum guidance into an Ovid's House target?  
**Boundary:** evidence synthesis and candidate geometry relationships only. This packet does **not** set final corridor/door/turning dimensions, pass/fail the Reference House, redesign the upper turns, position doors, specify door hardware/operating force, define object swept paths, create doctrine/patterns or add compiler proof.

---

## 1. Purpose

A corridor width written as one number is a poor description of whether a route works.

Domestic circulation is a linked system of:

- clear width between actual obstructions;
- doorway clear opening;
- direction of approach;
- usable wall/nib beside the door;
- leaf sweep and nearby leaves;
- corners and changes of direction;
- local recovery/manoeuvre zones;
- radiators, cabinetry, architraves and other encroachments;
- carrying, assistance and mobility-aid states;
- route frequency and role.

The controlling proposition is:

> **Circulation adequacy is a route-and-interface property, not a corridor-width property.**

HFI-03A tests that proposition against current England dwelling guidance, contemporary government ergonomic research and wheeled-mobility manoeuvrability evidence.

---

# 2. Controlled Reference House facts — comparison only

HFI-00B remains the controlled pre-HFI geometry baseline. Later DRW work may improve drawing representation but does not grant human-factors authority to a dimension.

| Item | Current represented fact | HFI-03A treatment |
|---|---|---|
| ground east gallery `G-GAL-01` | `1300 mm` gross planning field | **not** a 1300 mm clear route; walls/doors/joinery unresolved |
| upper east gallery `U-GAL-02` | `1300 mm` gross planning field | same limitation |
| upper south turn | `1300 mm` provisional depth matching gallery field | source fact only; not HFI target |
| upper north turn | approximately `1200 mm` existing landing depth | source fact only; not HFI target |
| stair clear flight | approximately `1000 mm` provisional target | stair-specific; not a corridor target |
| final internal door clear openings | unresolved | no HFI pass can be awarded |
| final internal door positions/swings | unresolved | no HFI pass can be awarded |
| radiator/joinery/cabinet encroachment | unresolved | no HFI pass can be awarded |
| whole ground-floor internal level | intended step-free | ground-plane detail belongs mainly to 03B |

Existing `1300 mm` fields receive no incumbency advantage. Conversely, HFI does not assume they are deficient merely because stronger accessibility comparators exist.

---

# 3. Scenario coverage

HFI-01C already freezes the relevant interactions.

| Scenario | Circulation question |
|---|---|
| `HFI-SC-ARR-01` | coherent principal entry route without needless detour/door choreography |
| `HFI-SC-ARR-02` | dignified entrance-level participation for wheelchair user, subject to real-site facts |
| `HFI-SC-ARR-03` | mobility-aid entry through threshold, door and immediate turn |
| `HFI-SC-ARR-07` | route legibility for an unfamiliar visitor |
| `HFI-SC-MOV-06` | circulation under reduced attentional reserve |
| `HFI-SC-MOV-09` | principal corner without avoidable sideways/body choreography |
| `HFI-SC-MOV-10` | assistance at representative turns/doors without two-person width everywhere |
| `HFI-SC-LOG-01` | grocery route with occupied hands |
| `HFI-SC-LOG-05` | child-carrying route under occupied hands/divided attention |
| `HFI-SC-LOG-10` | complete entrance-level personal mobility-device route |
| `HFI-SC-USE-02` | body/leaf/control interference at door zone |
| `HFI-SC-LC-06` | dignified assisted visitor route through principal system |

03A does not add personas. It asks which persistent geometries materially affect these existing interactions.

---

# 4. Evidence additions and applicability

`HFI-SRC-N01/N02` remain the parent law/statutory-guidance records for Part M and Approved Document M Volume 1. `C01/C02` below are topic-specific clause/application records under that existing authority, not new statutory authorities.

## `HFI-SRC-C01` — Approved Document M Volume 1, M4(2) circulation clauses

- **Source:** HM Government, *Approved Document M: access to and use of buildings, Volume 1: Dwellings*, section 2B, paragraph 2.22 / Diagram 2.3 / Table 2.1.
- **Date/version:** 2015 edition incorporating 2016 amendments; official document checked 2026-10-18.
- **Jurisdiction / population:** England; Category 2 accessible and adaptable dwellings where the optional requirement applies.
- **Class:** `STATUTORY-GUIDANCE`.
- **Authority / status:** official guidance to M4(2); not an ergonomic optimum.
- **Applicability:** relationship among hall/landing clear width, local obstructions, doorway clear opening, approach direction and leading-edge nib.
- **Key guidance:** minimum clear hall/landing width `900 mm`; local obstruction not opposite/close to a doorway or at a change of direction and not reducing passage below `750 mm`; minimum `300 mm` leading-edge nib on entrance-storey inward-opening doors; non-head-on corridor/door pairs `1200/750`, `1050/775` or `900/800 mm`.
- **Known limits / nonclaims:** minimum guidance for a defined regulatory category; not proof of low-friction geometry, two-person passing, furniture movement or whole-dwelling wheelchair usability.
- **Access state:** official full PDF publicly accessible; Diagram 2.3/Table 2.1 visually checked.
- **Checked:** 2026-10-18.
- **Canonical location:** https://www.gov.uk/government/publications/access-to-and-use-of-buildings-approved-document-m

## `HFI-SRC-C02` — Approved Document M Volume 1, M4(3) circulation clauses

- **Source:** HM Government, *Approved Document M: access to and use of buildings, Volume 1: Dwellings*, section 3B, paragraph 3.24 / Diagrams 3.4–3.5.
- **Date/version:** 2015 edition incorporating 2016 amendments; official document checked 2026-10-18.
- **Jurisdiction / population:** England; Category 3 wheelchair user dwellings where the optional requirement applies.
- **Class:** `STATUTORY-GUIDANCE`.
- **Authority / status:** official guidance to M4(3); wheelchair-use comparator, not universal project requirement.
- **Applicability:** wheelchair circulation, non-head-on doorway approach, local obstructions, door clear opening, corner-door interactions and nibs.
- **Key guidance:** minimum clear hallway/approach/landing width `1050 mm`; `1200 mm` where doorway approach is not head-on; internal door clear opening `850 mm`; `300 mm` leading-edge and `200 mm` following-edge nibs; specific control of outward-opening doors close to corners/return-wall doors unless local `1500 mm` turning space is provided.
- **Known limits / nonclaims:** M4(3) is a defined wheelchair-user dwelling category and is not a universal Ovid's House target. Current guidance dimensions do not accommodate every wheeled-mobility device/user.
- **Access state:** official full PDF publicly accessible; paragraph 3.24 visually checked.
- **Checked:** 2026-10-18.
- **Canonical location:** https://www.gov.uk/government/publications/access-to-and-use-of-buildings-approved-document-m

## `HFI-SRC-C03` — BS 9266:2013

- **Source:** BSI, *BS 9266:2013 — Design of accessible and adaptable general needs housing. Code of practice*.
- **Date/version:** published 31 July 2013; BSI lists current on 2026-10-18.
- **Jurisdiction / population:** UK; general-needs houses/flats and assessment/improvement of existing dwellings.
- **Class:** `CONSENSUS-STANDARD`.
- **Authority / status:** current British Standard code of practice; non-statutory unless separately required.
- **Applicability:** accessible/adaptable general-needs housing including circulation areas within dwellings.
- **Known limits / nonclaims:** detailed clause values require licensed text and applicability checking. HFI does not import values from secondary summaries. BS 8300-2 remains excluded from individual-dwelling dimensional authority as already frozen in HFI-01B.
- **Access state:** BSI metadata/overview public; full standard licensed.
- **Checked:** 2026-10-18.
- **Canonical location:** https://knowledge.bsigroup.com/products/design-of-accessible-and-adaptable-general-needs-housing-code-of-practice

## `HFI-SRC-C04` — 2025 MHCLG / Arup Part M ergonomic research

- **Source:** Ove Arup & Partners Limited for DLUHC/MHCLG, *Access to and use of buildings — research on demographic and ergonomic requirements (Part M Research)*.
- **Date/version:** final report dated 1 November 2022; published by MHCLG 28 October 2025.
- **Jurisdiction / population:** England-focused government-commissioned review/experimental programme; broad wheeled-mobility device/user sample.
- **Class:** `GOVERNMENT-RESEARCH`.
- **Authority / status:** non-policy technical research; GOV.UK explicitly states findings/recommendations are not government policy or guidance.
- **Applicability:** occupied mobility-aid footprint, 90°/180° manoeuvring space and comparison with existing spatial guidance.
- **Useful findings:** device/user variation is large. For independent-use mobility aids the reported 90th-percentile unrestricted 90° manoeuvring envelope was about `1900 × 1897 mm`; across all device types about `2084 × 2066 mm`. A `1500 × 1500 mm` square accommodated only a minority of observed unrestricted turns, especially attendant-propelled devices.
- **Known limits / nonclaims:** much of the standards comparison uses ADM Volume 2/public-building benchmarks; unrestricted manoeuvring envelope is not the same as minimum confined-space capability; device mix and driving style matter; tighter turns can be achieved by some users through more complex movements. It does not create an Ovid's House `1900 mm` target.
- **Access state:** official full report publicly accessible; relevant tables/text inspected.
- **Checked:** 2026-10-18.
- **Canonical location:** https://www.gov.uk/government/publications/access-to-and-use-of-buildings-research-on-demographic-and-ergonomic-requirements

## `HFI-SRC-C05` — Koontz et al. 2010 wheelchair/scooter manoeuvrability

- **Source:** Koontz AM, Brindle ED, Kankipati P, Feathers D, Cooper RA, *Design Features That Affect the Maneuverability of Wheelchairs and Scooters*.
- **Date/version:** Archives of Physical Medicine and Rehabilitation 91(5), 2010.
- **Jurisdiction / population:** US multi-site convenience sample; manual wheelchair `n=109`, powered wheelchair `n=100`, scooter `n=14`.
- **Class:** `PEER-REVIEWED-EMPIRICAL`.
- **Authority / status:** peer-reviewed empirical evidence; non-statutory.
- **Applicability:** minimum passageway space for L-turn, 360° and U-turn manoeuvres; effect of device design on required space.
- **Useful finding:** manoeuvring space varies materially with mobility-device design; some tested users could not complete manoeuvres in then-current accessibility-guideline spaces.
- **Known limits / nonclaims:** US context; mobility-device test tasks rather than general domestic circulation; no UK dwelling dimension follows directly.
- **Access state:** PubMed abstract/metadata public.
- **Checked:** 2026-10-18.
- **DOI:** https://doi.org/10.1016/j.apmr.2010.01.009
- **PMID:** https://pubmed.ncbi.nlm.nih.gov/20434614/

## `HFI-SRC-C06` — Anthropometry of Wheeled Mobility Project

- **Source:** Center for Inclusive Design and Environmental Access / University at Buffalo for the U.S. Access Board, *Anthropometry of Wheeled Mobility Project: Final Report*.
- **Date/version:** final report published 2010.
- **Jurisdiction / population:** US field/laboratory research across manual/powered wheelchairs and scooters.
- **Class:** `GOVERNMENT-RESEARCH`.
- **Authority / status:** research commissioned for US accessibility-guideline development; not UK policy.
- **Applicability:** 90° L-turn, 180° dead-end turn and U-turn manoeuvres in mock-wall environments.
- **Useful finding:** manoeuvre topology changes the answer dramatically. The report describes about `1000 mm` uniform passage width accommodating 95% of manual/power-wheelchair users for its 90° L-turn test, while a dead-end 180° turn required about `1700 mm` for 95% of manual/power users; scooters differed again. This is precisely why one generic turning circle is a weak model.
- **Known limits / nonclaims:** US device/population/guideline context; multi-point manoeuvres allowed; test geometry and accommodation percentile must remain attached to every number; not direct Ovid's House targets.
- **Access state:** final report publicly available.
- **Checked:** 2026-10-18.
- **Canonical location:** https://idea.ap.buffalo.edu/wp-content/uploads/sites/110/2020/01/AnthropometryofWheeledMobilityProject_FinalReport.pdf

## `HFI-SRC-C07` — Habinteg / CAE Inclusive Housing Design Guide context

- **Source:** Habinteg Housing Association / Centre for Accessible Environments with RIBA, *The Inclusive Housing Design Guide*.
- **Date/version:** published September 2024; current official page checked 2026-10-18.
- **Jurisdiction / population:** UK specialist housing/inclusive-design practice.
- **Class:** `EXPERT-GUIDANCE`.
- **Authority / status:** professional expert guidance; non-statutory.
- **Applicability:** rationale for meeting/exceeding M4(2)/M4(3), furnished functional-use testing and assistance/ability variation.
- **Useful finding:** official guide description explicitly frames Part M requirements as minimum conditions and uses scaled people/furnished layouts to explain where functional use may justify more space.
- **Known limits / nonclaims:** full technical guide is purchased/licensed; no exact dimension is imported from marketing material; expert guidance is not causal empirical proof.
- **Access state:** official Habinteg description public; full guide purchased/licensed separately.
- **Checked:** 2026-10-18.
- **Canonical location:** https://www.habinteg.org.uk/the-inclusive-housing-design-guide

## `HFI-SRC-C08` — Approved Document M Volume 2 corridor/passing comparator

- **Source:** HM Government, *Approved Document M: access to and use of buildings, Volume 2: Buildings other than dwellings*, corridor/passageway provisions.
- **Date/version:** current official guidance family checked 2026-10-18.
- **Jurisdiction / population:** England; buildings other than dwellings.
- **Class:** `STATUTORY-GUIDANCE`.
- **Authority / status:** official guidance **outside the individual-dwelling scope**.
- **Applicability:** mechanism-only comparator for continuous route width versus local passing places under higher simultaneous traffic.
- **Useful comparator:** the non-dwelling guidance uses `1200 mm` unobstructed corridors and, where below `1800 mm`, local `1800 × 1800 mm` passing places at reasonable intervals.
- **Known limits / nonclaims:** these values are not dwelling requirements and must not be imported into the Reference House as targets. The source is used only to demonstrate the established design pattern of local passing opportunity instead of universal maximum width.
- **Access state:** official guidance publicly accessible.
- **Checked:** 2026-10-18.

---

# 5. Door + corridor + approach are one manoeuvre

The strongest dwelling-specific lesson in Approved Document M is not `900 mm` or `1050 mm` in isolation. It is that **doorway width and approach geometry are coupled**.

M4(2) Table 2.1 makes that relationship explicit for non-head-on entry:

| Door clear opening | Corridor clear passage |
|---:|---:|
| `750 mm` | `1200 mm` |
| `775 mm` | `1050 mm` |
| `800 mm` | `900 mm` |

A head-on approach follows a different relationship.

This defeats the shorthand:

> `The corridor is 900 mm, therefore circulation works.`

At a turn into a door, a 900 mm passage only makes sense alongside the associated opening and approach geometry.

HFI therefore carries forward:

> **Door clear opening, approach width, approach angle, leading-edge space and leaf sweep must be evaluated as one manoeuvre.**

The Reference House cannot currently pass that test because final internal door positions/openings/swings are not yet modelled.

---

# 6. Straight clear width: minima are comparison points, not targets

## 6.1 `900 mm` has a precise regulatory meaning

For M4(2), `900 mm` is the minimum clear width of a hall or landing, subject to the remainder of paragraph 2.22.

It is therefore a legitimate **statutory-guidance comparator** for Category 2.

It does not establish:

- comfortable two-way passing;
- carrying generosity;
- assistance space;
- furniture movement;
- wheelchair turning at corners;
- low-vigilance door operation;
- Ovid's House preferred geometry.

## 6.2 `1050–1200 mm` has a different wheelchair-use meaning

M4(3) uses `1050 mm` as the general hallway/approach/landing minimum and `1200 mm` for non-head-on doorway approaches, with `850 mm` internal door clear openings.

Those are useful **stronger wheelchair-use comparators**, not automatic Ovid's House minima.

## 6.3 Current `1300 mm gross` fields are promising but unproved

The ground/east-upper galleries are represented as `1300 mm gross` planning fields.

Numerically, that is greater than M4(3)'s clear approach figures, but the comparison is invalid until wall/finish build-up, doors, architraves, radiators/joinery and other projections are represented.

Current status:

- **promising planning reservation**;
- **not a clear-width result**;
- **no PASS status**.

HFI-07 must judge the actual clear route, not the gross source rectangle.

---

# 7. Corners and changes of direction

## 7.1 A corner is a swept manoeuvre, not two widths meeting

A 90° turn depends on:

- width before and after the turn;
- inner/outer corner geometry;
- approach alignment;
- nearby doors/projections;
- whether reversal/multi-point movement is acceptable;
- person/device/task.

Koontz and the wider wheeled-mobility evidence confirm that device design materially changes the space required.

## 7.2 The empirical numbers only make sense with the test attached

This packet deliberately carries two apparently very different contemporary/historical findings together:

- Arup/Loughborough's unrestricted 90° manoeuvring envelopes for current wheeled-mobility users are around `1900 × 1897 mm` at the 90th percentile for independent-use devices;
- the U.S. wheeled-mobility project reports around `1000 mm` uniform passage width accommodating 95% of manual/power users for its constrained 90° L-turn test.

These are **not contradictory targets**. They measure different manoeuvres and different definitions of space.

That is the point.

> **Never detach a manoeuvring dimension from the manoeuvre, device population, measurement method and accommodation percentile that produced it.**

## 7.3 `1500 mm turning circle` is not a universal accessibility token

A `1500 mm` circle/square is familiar in accessibility practice, but contemporary Arup/Loughborough data shows that it does not accommodate a large share of observed unrestricted turns, particularly attendant-propelled devices.

At the same time, requiring 1500 mm at every domestic corner would be unnecessary for ordinary ambulant movement and is not what M4(2)/M4(3) require for every route turn.

Therefore:

> **Name the turn before sizing the space.**

Later work must distinguish at least:

- flowing 90° route turn;
- non-head-on doorway entry;
- 180° reversal/dead end;
- positioning to operate a door;
- wheelchair + attendant;
- object + handler swept path.

## 7.4 Current upper turns

The current south upper turn (`1300 mm` provisional depth) and north turn (about `1200 mm`) are neither proved defective nor proved adequate by 03A because:

- they are planning fields, not final clear dimensions;
- nearby door positions are unresolved;
- exact turn topology and obstructions are unresolved;
- wheelchair usability is distinct from ordinary usability/visitability;
- assistance/object-route cases have not yet been overlaid.

They remain **candidate geometry awaiting target derivation and HFI-07 audit**.

---

# 8. Protect conflict nodes, not merely the straight run

Both M4(2) and M4(3) explicitly treat a projection near a doorway/change of direction as more consequential than one on a simple straight run.

This yields a strong HFI proposition:

> **The same obstruction is more costly where the occupant must turn, reach, open a door or choose a route.**

Examples:

- radiator opposite a doorway;
- cabinetry at an inner corner;
- architrave/handle reducing the effective turning throat;
- a leaf swinging across the route;
- storage occupying a landing;
- a decorative projection creating a pinch at the exact change of direction.

Later checks should record at least:

1. continuous clear width;
2. minimum local pinch width;
3. pinch location relative to a door/change of direction;
4. pinch length;
5. manoeuvre/task at that point.

A route should not receive credit for a generous nominal width if the usable envelope collapses at the difficult interface.

---

# 9. Door leaves and adjacent doors are circulation geometry

M4(3)'s corner-door provisions make the underlying mechanism explicit: one outward-opening door can consume the manoeuvre space needed to deal with another door/return wall.

General HFI inference:

> **A nominally wide corridor can be functionally narrow when door sweeps overlap the route, each other, a turning zone or the position needed to operate the handle.**

Questions carried into 04B/HFI-07:

- Can the user approach/reach the handle without first occupying the leaf sweep?
- Is there somewhere to stand/move while the leaf passes?
- Does one door trap the user against another leaf or return wall?
- Does an outward-opening sanitary door preserve route manoeuvre space?
- Does carrying force repeated load-down solely because the door/route consumes both hands?

No door swing is selected here.

---

# 10. Nibs and approach space are operational geometry

M4(2)'s entrance-storey leading-edge nib and M4(3)'s stronger leading/following-edge provisions preserve side approach/reach space beside the leaf.

Door use is a sequence:

`approach → position → reach/grasp → move leaf → move body/device → clear leaf → continue`

A wide opening without usable adjacent approach space can still force reach-back, collision or repositioning.

03A therefore treats nib/adjacent-wall geometry as circulation. HFI-04B owns force/grip/latch/closure behaviour.

---

# 11. Passing and overtaking

## 11.1 Do not turn a family house into a public corridor

The non-dwelling Approved Document uses a useful **pattern**: a moderate continuous route plus wider local passing places where simultaneous traffic demands them.

That source is out of dwelling scope and contributes no domestic target.

A private house has lower traffic, shorter routes, known occupants and different area/carbon/cost proportionality.

Therefore HFI rejects:

> `Two users may meet, therefore every domestic corridor must permit continuous two-wheelchair/two-load passing.`

## 11.2 But repeated side-on negotiation can still be real friction

The opposite extreme is also weak. On a principal high-frequency route, repeated queueing/body rotation can matter, particularly:

- entrance ↔ kitchen;
- kitchen ↔ garden/dining;
- family ↔ service/utility;
- upper bedrooms ↔ bathroom/stair;
- when one person is carrying or assisting another.

The proportionate design question is therefore **route hierarchy + local passing opportunity**, not one universal width.

HFI-05B/06B should compare:

- continuous wider route;
- ordinary-width route with deliberate local widening/passing nodes;
- naturally wider landings/room thresholds acting as passing/recovery nodes;
- no extra provision where frequency/consequence does not earn it.

No universal domestic passing dimension is set because the evidence is too thin.

---

# 12. Assistance space

`P-DYAD / S-ASSIST` matters, but assistance does not imply two adults side-by-side throughout the house.

Assistance may occur:

- beside;
- slightly behind/in front;
- at a door while the assisted person pauses;
- on a landing;
- at sanitary transfer geometry;
- at a stair where specialist conditions differ again.

Candidate proposition:

> **Preserve local support/manoeuvre room at difficult interfaces where assistance is foreseeable rather than applying a two-person-width multiplier to the whole dwelling.**

Exact assistance geometry belongs to the relevant task packet and later audit.

---

# 13. Carrying and reduced attention — what 02D changes here

HFI-02D found no evidence basis for a generic carrying-derived corridor increment.

03A therefore asks instead:

1. Does the route force a carried load to be set down purely to operate a door/negotiate a pinch?
2. Does a turn/door/threshold require multiple simultaneous corrections where attentional reserve may be reduced?
3. Is a useful recovery/support opportunity removed when one hand is occupied?

This keeps carrying tied to actual route choreography rather than nominal generosity.

---

# 14. Candidate route hierarchy for later proportionality

This is an internal evaluation taxonomy only; it is not reader-facing nomenclature and does not classify the Reference House yet.

## `R1 — principal / high-frequency domestic route`

Entrance → principal living/kitchen/garden sequence; main upper circulation.

Give strongest later weight to repeated two-way use, carrying, visitor legibility, door/corner choreography, reduced-attention robustness and proportionate future adaptation.

## `R2 — ordinary room-access route`

Short branch to bedrooms/study/secondary spaces. Applicable duties and ordinary usability still control, but continuous passing generosity may earn less permanent area.

## `R3 — genuinely low-frequency resident access`

Storage-like resident access where reduced frequency is real. It must never become a loophole for relegating disabled/assisted ordinary use to an inferior service route.

---

# 15. Candidate propositions carried forward

### `CIR-01 — route/interface coupling`

> **Judge circulation through complete manoeuvres. Corridor width, door opening, approach direction, nib and leaf sweep are one system.**

**Evidence state:** strong statutory-guidance support and geometric logic.

### `CIR-02 — protect conflict nodes`

> **Do not spend nominal width in the straight run and then lose it where a person turns, reaches or opens a door.**

**Evidence state:** strong dwelling-guidance support; compatible with 02D.

### `CIR-03 — manoeuvre-specific turning`

> **Name the turn before sizing the space.**

**Evidence state:** strong wheeled-mobility empirical support.

### `CIR-04 — gross width is not clear width`

> **A planning reservation receives no usability credit until the actual clear route through finishes, projections and door/interface geometry is represented.**

**Evidence state:** strong project/control inference.

### `CIR-05 — route hierarchy before blanket generosity`

> **Spend permanent circulation area where frequency, consequence and difficult interfaces earn it; do not solve every scenario by widening every corridor.**

**Evidence state:** HFI-01D proportionality inference; numerical expression pending.

### `CIR-06 — assistance locally, not everywhere`

> **Provide local manoeuvre/support room for foreseeable assistance at difficult interfaces rather than assuming continuous two-person width throughout the dwelling.**

**Evidence state:** credible specialist-design proposition; task-specific geometry pending.

### `CIR-07 — equivalent route dignity`

> **A more usable route must not be obtained by relegating disabled or assisted ordinary use to a conspicuously inferior service path where a reasonable equivalent principal route is achievable.**

**Evidence state:** HFI programme/equivalence principle; whole-house audit required.

---

# 16. Rejected shortcuts / hypotheses

- **`900 mm is an accessible corridor target`** — rejected. It is an M4(2) minimum inside a larger door/approach rule set.
- **`1300 mm gross gallery = 1300 mm usable corridor`** — rejected. Gross source geometry is not finished clear width.
- **`1500 mm turning circle = wheelchair accessibility`** — rejected. Different manoeuvres/devices require different envelopes.
- **`Arup says ~1900–2100 mm, so use that everywhere`** — rejected. Unrestricted manoeuvring data is not a universal private-dwelling target.
- **`The U.S. L-turn study says ~1000 mm, so that proves 1000 mm is enough`** — rejected. Its test geometry, population and allowed manoeuvre must remain attached to the result.
- **`Make all corridors wide enough for two people to pass comfortably`** — rejected as a universal instruction.
- **`A wide doorway fixes a narrow approach`** — rejected.
- **`A wide corridor fixes a bad doorway`** — rejected.
- **`A radiator/cabinet is harmless if a minimum width survives somewhere beside it`** — rejected; position and pinch length matter.
- **`Assistance requires two-person width everywhere`** — rejected.
- **`Furniture movement can be guessed now`** — rejected; 03C owns representative objects/swept paths.

---

# 17. Reference House implications — research only

No HFI-07 result is issued here.

## Ground floor later audit questions

1. Finished clear width of `G-GAL-01` after wall/finish/interface geometry?
2. Which door approaches are head-on versus oblique/non-head-on?
3. Do doors/radiators/cabinetry/joinery project near turns or door approaches?
4. Does entrance → kitchen/garden-dining → family/garden work without repeated leaf conflicts/body choreography?
5. Where are natural local passing/recovery nodes?
6. Does entrance-level wheelchair/visitor use remain on the principal domestic system rather than a service-like detour?

## Upper floor later audit questions

1. Finished clear dimensions of south turn, east gallery and north turn?
2. Exact 90° swept manoeuvre at each turn once doors exist?
3. Bedroom/bathroom corner-door or leaf-sweep conflicts?
4. Does likely handrail/guard/architrave geometry erode the route?
5. Does laundry/carrying expose a choreography problem rather than a width problem?
6. If stairlift parking/transfer survives 02C/05B, where does it overlap landing circulation?

Where geometry is absent, HFI-07 must use `NOT-MODELLED`, not infer a pass/fail.

---

# 18. Quantitative implications for HFI-06B

03A does not set targets, but HFI-06B must compare at least:

| Question | Minimum comparison set |
|---|---|
| ordinary/adaptable hall | M4(2) `900 mm` guidance floor vs stronger project candidates |
| wheelchair-use corridor | M4(3) `1050 mm` general / `1200 mm` non-head-on comparators |
| door clear opening | M4(2) approach-dependent table vs M4(3) `850 mm` comparator |
| leading-edge space | M4(2)/M4(3) `300 mm` comparator; sequence tested in 04B |
| corners | manoeuvre-specific swept-path comparisons, never a generic circle alone |
| turn/recovery node | scenario benefit versus permanent area burden |
| passing | continuous widening vs local passing node vs no special provision |
| assistance | local interface zones vs blanket widening |

Every adopted number still has to survive HFI-01D and HFI-05C.

---

# 19. Packet interfaces

- **03B** owns approach/threshold/internal level changes/gradients/water management; 03A supplies the horizontal manoeuvre envelope approaching them.
- **03C** owns representative furniture/appliance/pram/mobility-device objects and complete swept paths.
- **03D** owns groceries/laundry/waste/cleaning/childcare/caregiving route sequences.
- **04B** owns door/window force, grip, latch/lock and one-handed operation; 03A supplies spatial approach/leaf context.
- **05B/05C** own proportionality and cross-discipline conflicts.
- **06B** owns final movement-target architecture.
- **07** audits the represented Reference House against earned targets.

---

# 20. Evidence limits and open questions

1. **Domestic ambulant passing evidence is thin.** No defensible universal two-adult passing dimension is derived here.
2. **Wheelchair-device variation is large.** No one circle captures manual, powered, scooter and attendant-propelled manoeuvres.
3. Arup/Loughborough's contemporary manoeuvring evidence is powerful, but much of its standards comparison is framed against **ADM Volume 2/public-building geometry**; direct import into private-dwelling targets would be a scope error.
4. **Restricted-space skill changes outcomes.** Some users execute tighter multi-point turns at the cost of extra movements/attention.
5. **Door approach is under-modelled in the Reference House.** Final leaf/opening/nib geometry is required.
6. **Gross corridor fields are insufficient.** Wall/finish/architrave/radiator/joinery envelopes are required.
7. **Assistance varies by task.** Bathroom/stair assistance cannot be inferred from generic corridor width.
8. **Object logistics may dominate selected turns.** 03C must test object + handler paths.
9. **Fire/escape remains separately owned.** HFI cannot prefer a door/corridor arrangement that conflicts with life safety.
10. **Area/carbon/cost burden remains unquantified.** 05B owns proportionality.

---

# 21. Packet closeout

## Exact question answered

What circulation relationships are strong enough to constrain later HFI reasoning before final targets are chosen?

## Findings

1. Circulation adequacy is a **route/interface property**, not one width.
2. Door opening and corridor/approach width are explicitly coupled in current dwelling guidance.
3. M4(2) `900 mm` and M4(3) `1050/1200 mm` are authority-specific comparison points, not Ovid's House targets.
4. Local obstructions are especially consequential near doors and changes of direction.
5. 90° route turns, 180° reversals, door manoeuvres and assisted/wheelchair turns are different spatial tasks.
6. Apparently conflicting empirical turn dimensions become coherent once manoeuvre topology/method/population are restored; this is evidence against magic single-number turning rules.
7. `1500 mm` is not a universal accessibility token; neither is `1900–2100 mm` a universal domestic replacement.
8. Passing/assistance should first be tested through route hierarchy and local manoeuvre opportunities rather than blanket widening.
9. Current `1300 mm gross` gallery/turn fields are promising planning reservations but cannot earn HFI PASS until finished clear geometry and doors/projections exist.
10. No Reference House change is authorised.

## Rejected hypotheses

- minimum guidance = project optimum;
- gross width = clear width;
- one turning circle fits all manoeuvres;
- wider everywhere is the default answer;
- assistance means two-person width everywhere;
- carrying automatically earns a corridor increment;
- furniture logistics can be guessed before 03C.

## Artefact

- this internal HFI-03A evidence synthesis only.

## Checks before merge

- one packet file only;
- sources comply with HFI-01B authority/applicability boundaries;
- no numerical project target presented as established;
- no RH geometry/compiler/publication/maturity change;
- full PR validation green;
- final `main` concurrency lease inspected.

## Authority / maturity consequences

None. Research only.

## Stale downstream items

None. No accepted architecture changes.

## Exact next packet

**HFI-03B — continuous ground plane.**
