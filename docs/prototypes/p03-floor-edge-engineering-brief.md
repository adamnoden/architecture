# P03 — Structural Floor Edge Engineering Brief

**Status:** issue-ready engineering brief; no structural selection yet  
**Date:** 2026-10-12  
**Programme:** [Tectonic Prototype and Engineering Programme](../development/tectonic-prototype-programme.md)  
**Reference House authority:** [RH-05 Structural Coordination](../reference-house/structural-coordination.md)  
**Research basis:** [Seated Floor Structure — Options Appraisal](../research/seated-floor-structure-options.md)  
**Canonical strategy:** [Decompose Structural Interface Functions](../patterns/strategies/decompose-structural-interface-functions.md)

P03 exists to answer one narrow question:

> **What is the simplest credible floor-to-masonry edge family for the Reference House once gravity support, restraint, diaphragm action, movement, fire/acoustic closure and future inspection are treated as separate duties?**

P03 is **engineering-first, prototype-second**. No bespoke seat, shoe or sliding connection is to be fabricated merely because it looks compatible with House Kernel. The engineer must first reduce the option set to calculable details using the actual Reference House geometry.

---

## 1. Fixed architectural context

Use the current Reference House only as the project test case.

- outer shell: **12.0 × 10.8 m**;
- open courtyard: **3.6 × 4.0 m**;
- first-floor datum: **+3300 mm**;
- ground clear ceiling: **+2950 mm**;
- available architectural floor / ceiling zone: **350 mm**;
- west/east floor strips: approximately **4.2 m gross span** between outer and courtyard masonry support lines;
- north/south centre strips: approximately **3.4 m gross span**;
- engineered timber floor remains the working family;
- structural deck / diaphragm remains permanent and is not delegated to any removable finish layer;
- outer and courtyard **inner masonry leaves** are the current primary bearing lines;
- routine services do not receive permission to drill primary members or edge beams.

The current envelope family is approximately **400–425 mm**, stress-tested to **450 mm** overall. Final inner-leaf thickness remains an engineering/building-physics decision.

### Architectural rewind boundary

Engineering may change:

- joist manufacturer/family;
- joist centres;
- local blocking;
- hanger/restraint products;
- bearing length;
- connection plates/straps;
- local fire/acoustic closure;
- local edge geometry inside the 350 mm reservation.

Engineering must **explicitly trigger an RH-04/RH-05 rewind** if the credible solution needs:

- a persistent floor zone materially deeper than 350 mm that reduces the controlled 2950 mm ground clear height;
- columns/posts in principal rooms;
- long transfer beams replacing the short-span ring concept;
- movement of courtyard or principal opening geometry;
- an independent whole-house frame to make the floor work;
- routine service penetrations through protected edge-beam/reaction-node zones.

Do not absorb those consequences silently inside a connection detail.

---

## 2. Functions to allocate deliberately

For each option, identify the component or mechanism responsible for each duty.

| Duty | Required engineering answer |
|---|---|
| gravity support | how joist reactions reach the loadbearing masonry |
| joist stability | anti-roll / anti-unseating / end restraint as required |
| wall restraint | how the masonry is laterally restrained where required |
| diaphragm transfer | how floor diaphragm actions reach the wall/support system |
| robustness | tying / accidental action strategy at this junction |
| tolerance | what construction misalignment can be accepted and where adjustment occurs |
| movement | what relative movement is expected, where it is allowed and why |
| fire | floor-edge resistance / cavity / penetrations / protected steel as applicable |
| acoustics | flanking and edge closure |
| moisture/corrosion | durability of timber, steel and masonry interfaces |
| inspection | what can be seen/checked after construction and by what route |
| repair | what local component can realistically be repaired without masonry demolition |
| replacement | what is actually replaceable; do not imply full joist withdrawal unless the whole assembly permits it |
| construction sequence | what must be built first and what tolerance information installers need |

The engineering response should make it obvious if one component is being asked to perform several unrelated duties merely through convention.

---

## 3. Option families to compare

### A — certified restraint-type masonry hanger — **baseline to beat**

Engineered timber joist supported by a recognised restraint-type masonry hanger / compatible engineered system, with separate or integrated restraint only as the engineered family requires.

This option carries the incumbency advantage because it is ordinary, calculable and reproducible.

### B — direct / seated bearing + separate restraint — **comparator**

Joist or approved bearing interface obtains gravity support through bearing; wall restraint, joist stability and diaphragm duties are resolved separately.

Do not bury vulnerable timber ends into masonry merely to make the structural diagram look pure.

### C — engineered shoe / ledge — **experimental challenger**

Continuous or discrete engineered steel/other durable bearing interface attached to permanent masonry, with joist capture/restraint separated from gravity support.

This option progresses only if it demonstrates a material whole-life advantage after fire, acoustic, corrosion, fixing, tolerance and realistic repair consequences are counted.

### D — other engineer-proposed ordinary family

A reviewer may add another conventional family if it better satisfies the duties above. P03 is not an A/B/C beauty contest.

---

## 4. Required engineering comparisons

For each viable option provide, at minimum:

1. **schematic calculable detail** at outer-wall and courtyard-wall conditions;
2. required joist family/depth and preliminary spacing for the **4.2 m gross span** case;
3. wall bearing / hanger / anchor demand at representative reactions;
4. lateral restraint and diaphragm transfer concept;
5. compatibility with the **350 mm** architectural zone;
6. edge fire/acoustic strategy at concept level;
7. durability/corrosion/moisture issues;
8. construction tolerance and adjustment allowance;
9. primary failure modes and inspectability;
10. realistic repair/replacement statement;
11. compatibility with P04 wall/ceiling finish-movement strategy;
12. cost/complexity order-of-magnitude comparison where reasonably possible.

Do not claim adequacy from a manufacturer's span table alone. The engineer owns the selected connection and whole junction behaviour.

---

## 5. Decision matrix

Score only after the engineering information exists.

| Criterion | A hanger | B bearing | C shoe/ledge | D other |
|---|---:|---:|---:|---:|
| structural adequacy / clarity |  |  |  |  |
| 350 mm-zone compatibility |  |  |  |  |
| masonry robustness |  |  |  |  |
| fire/acoustic resolution |  |  |  |  |
| moisture/corrosion durability |  |  |  |  |
| tolerance / buildability |  |  |  |  |
| ordinary competence / recognisability |  |  |  |  |
| inspection / local repair |  |  |  |  |
| permanent fixing burden |  |  |  |  |
| cost / bespoke dependency |  |  |  |  |
| architectural/interface fit |  |  |  |  |

A novel option does not receive credit for theoretical demountability if deck, ceilings, partitions and services still prevent meaningful member replacement.

---

## 6. Engineering outcome classes

### `P03-E-CONVENTIONAL`

A conventional certified hanger/restraint family is the best whole-house answer.

This is a **successful House Kernel result** if the duties are explicit and the finish/movement interface is properly separated. No special structural joint is required merely to make the project distinctive.

### `P03-E-BEARING`

Direct/seated bearing with separate restraint materially improves the project without introducing disproportionate technical debt.

Proceed to a full-scale representative junction specimen.

### `P03-E-CHALLENGER`

A shoe/ledge or other non-standard family demonstrates a credible advantage large enough to justify project-specific engineering.

Proceed only with explicit engineer ownership and a full-scale junction specimen.

### `P03-E-REWIND`

The current architectural floor/support concept cannot be made credible within the stated geometry.

Reopen the owning RH gate rather than weakening the evidence threshold.

---

## 7. Prototype release gate

A P03 physical specimen is released only after a competent structural engineer has:

- reduced the option set to **no more than two serious connection families plus the conventional control**;
- provided enough geometry that the specimen is representative rather than theatrical;
- stated which structural properties **can** and **cannot** be inferred from a workshop specimen;
- defined any proof-load or load-test method if structural loading is to be part of the test.

Without that step, P03 may build only a **non-loadbearing assembly/inspection mock-up**, and its result must not be described as structural validation.

---

## 8. P03 success condition

P03 succeeds when the Reference House has:

1. one engineer-owned floor-edge family;
2. explicit allocation of support/restraint/diaphragm/movement/fire/acoustic duties;
3. no hidden dependence on a bespoke connection where an ordinary family is better;
4. a defined full-scale detail/prototype requirement only where it adds evidence;
5. an explicit architectural rewind if the 350 mm zone or short-span ring cannot survive.

The purpose is not to prove the original seated-floor intuition correct. The purpose is to end with the **best ordinary structural interface that still respects the project’s long-life logic**.