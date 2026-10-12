# Reference House — RH-05 Structural Coordination

**Status:** RH-05 design gate record / pre-engineering structural concept  
**Date:** 2026-10-12  
**Question:** can the RH-04 architectural baseline be carried by a simple, legible structural concept without hidden transfers, arbitrary future drilling or sacrificing the serviceability strategy?  
**Plan authority:** [RH-02 Ground-Floor Development](ground-floor-development.md), [RH-03 stair overlay](stair-ground-floor-overlay.svg), [RH-03 upper floor](upper-floor-and-stair-development.svg)  
**Section/elevation authority:** [RH-04 Plan / Section / Elevation Gate](plan-section-elevation-gate.md)  
**Drawing:** [structural-concept-overlay.svg](structural-concept-overlay.svg)

RH-05 is **not structural design**. No member, connection, masonry thickness, foundation or lintel is sized here. The gate asks a prior architectural question:

> **Does the house admit a structurally ordinary load path, or is the architecture quietly depending on engineering heroics?**

The answer is yes, with a short-span masonry-and-engineered-timber concept and four bounded edge-beam conditions. The architecture does not need a whole-house steel frame, long transfer beams or room-shaping columns.

---

## 1. Structural principles for this house

The concept follows six constraints.

1. **Permanent architectural walls do the permanent structural work where useful.** The outer envelope and courtyard are already long-lived masonry boundaries; using their inner leaves structurally is more coherent than placing an independent frame beside them without cause.
2. **Keep normal floor spans short.** The courtyard geometry naturally creates 3.4–4.2 m gross support distances.
3. **Do not make ordinary room partitions structural merely to rescue the floor.** Room order may change; primary structure should not depend on every internal partition.
4. **Transfers are exceptions, not a planning system.** Where an edge beam is needed, it is short, repeated and explicit.
5. **The primary diaphragm remains in the structural floor.** Any future removable floor/access layer is not allowed to become structurally necessary.
6. **Services cross structure only at designed locations.** RH-05 creates reservations and prohibitions; RH-06 will turn actual routes into a crossing register.

---

## 2. Selected structural family — S1 short-span courtyard ring

### Vertical loadbearing boundaries

The working family is:

- loadbearing **inner leaf of the external masonry envelope**;
- loadbearing **inner leaf of the courtyard envelope**;
- engineered timber first-floor framing between those permanent lines;
- four short primary edge beams where the courtyard-wall support line has to continue across the front/rear wings;
- local stair and service-opening trimmers within the floor system;
- upper partitions treated as non-loadbearing unless engineering later gives a specific reason otherwise.

The facing brick, cavity and insulation remain environmental/weathering layers rather than assumed primary vertical structure.

The current vertical-bay studies use a dense masonry inner leaf as the slow structural/mass layer. RH-05 retains that family as the baseline but does **not** freeze the current 215 mm study thickness; the structural engineer and building-physics work own final thickness, strength class and support details.

### Why this family fits the house

The controlled plan already contains two concentric long-lived boundaries:

1. the outer rectangle;
2. the open courtyard rectangle.

The floor therefore does not need to span the 12.0 m or 10.8 m house dimension. It can span the **ring thickness**.

That is the central structural insight of RH-05.

---

## 3. First-floor framing geometry

Coordinate system follows the Reference House plan:

- outer shell: X 0–12.0 m / Y 0–10.8 m;
- courtyard: X 4.2–7.8 m / Y 3.4–7.4 m.

### West strip — `F-W`

**Zone:** X 0–4.2 m, full house depth except the local room geometry.  
**Primary joist direction:** east–west.  
**Gross support distance:** approximately **4.2 m**.

Support:

- west external loadbearing inner leaf;
- west courtyard wall in the middle zone;
- extension beam `EB-W-S` south of the courtyard;
- extension beam `EB-W-N` north of the courtyard.

This one span direction serves both west bedrooms above and the drawing/family rooms below without needing the ground-floor room split to be loadbearing.

### East strip — `F-E`

**Zone:** X 7.8–12.0 m.  
**Primary joist direction:** east–west.  
**Gross support distance:** approximately **4.2 m**.

Support:

- east courtyard wall / its front and rear beam extensions;
- east external loadbearing inner leaf.

This preserves the study, service hub, upper bathroom and bedroom geometry without columns inside those rooms.

### South centre — `F-S`

**Zone:** X 4.2–7.8 m / Y 0–3.4 m.  
**Primary joist direction:** north–south.  
**Gross support distance:** approximately **3.4 m**.

Support:

- south external masonry;
- south courtyard wall.

The principal stair removes much of this floor plate. Remaining floor/landing areas frame around `ST-01` rather than forcing the stair to pass through ordinary joists after construction.

### North centre — `F-N`

**Zone:** X 4.2–7.8 m / Y 7.4–10.8 m.  
**Primary joist direction:** north–south.  
**Gross support distance:** approximately **3.4 m**.

Support:

- north courtyard wall;
- north external masonry.

This carries the north landing / conditional en-suite / linen zone above the garden-dining room without requiring a post in that room.

---

## 4. The four edge beams

The only repeated non-wall primary condition is the continuation of the courtyard side-wall support lines through the front and rear wings.

| ID | Line | Approx. span | Function |
|---|---|---:|---|
| `EB-W-S` | X ≈ 4.2 m, south façade → south courtyard wall | 3.4 m | supports west-strip joist ends; also forms a natural western stair-edge/trimmer line |
| `EB-E-S` | X ≈ 7.8 m, south façade → south courtyard wall | 3.4 m | supports east-strip joist ends and the hall/gallery edge |
| `EB-W-N` | X ≈ 4.2 m, north courtyard wall → north façade | 3.4 m | supports west-strip joists above the family/dining connection |
| `EB-E-N` | X ≈ 7.8 m, north courtyard wall → north façade | 3.4 m | supports east-strip joists above the dining/kitchen connection |

These are **floor-edge beams**, not whole-house transfer girders. They are short, repetitive and geometrically generated by the courtyard.

### Material family

Working order for engineering comparison:

1. engineered timber / LVL within the floor zone;
2. a certified proprietary timber floor-edge solution where appropriate;
3. protected steel only if timber depth, vibration, connection or bearing cannot be resolved proportionately.

RH-05 does not select a section.

The current market plausibility check is deliberately modest: UK engineered-timber families are available in 240, 300, 360 mm and deeper depths, and manufacturer UK design tools size members to Eurocode 5 / UK National Annex assumptions. That demonstrates that the **300 mm class is a real design family**, not that any unsized member here is adequate.

Source anchors:

- Metsä Wood, Finnjoist product data: https://www.metsagroup.com/en-gb/metsawood/products-and-services/
- Metsä Wood, Finnwood UK design software / Eurocode 5 basis: https://www.metsagroup.com/en-gb/metsawood/products-and-services/UK-tools/finnwood/

All final member sizing, vibration, deflection, bearing, connection, fire and robustness checks require a structural engineer.

---

## 5. Does the RH-04 350 mm floor zone survive?

**Provisionally: yes.**

RH-04 reserves **350 mm** from ground clear ceiling (+2.950) to first FFL (+3.300).

A credible concept within that reservation is:

- engineered joist family around the **300 mm depth class** as the first engineering test;
- structural deck above;
- ceiling / resilient / fire-acoustic layers below and around the joist as required;
- no default horizontal service distribution consuming the joist zone.

This is a coordination envelope, not a build-up specification.

The 350 mm architectural datum therefore **does not need to be rewound at RH-05**.

### Rewind trigger

Return to RH-04 if engineering shows that the selected spans, vibration criteria, acoustic/fire build-up or edge beams need a persistent floor zone materially deeper than approximately **350 mm** and the difference cannot be absorbed without reducing the controlled 2.95 m ground clear height.

Do not quietly lower ceilings.

---

## 6. Stair structure — `ST-01`

The three-flight stair is treated as a designed opening, not as joists cut later.

Structural concept:

- `EB-W-S` forms or closely coordinates the western primary edge of the stair zone;
- the south courtyard wall provides the northern permanent support boundary;
- local engineered trimmers frame the remaining stair opening and landings;
- the stair itself is structurally independent enough that future stair repair does not require the main floor diaphragm to depend on decorative strings or balustrade joinery.

RH-05 does not choose timber/steel stair strings or landing construction.

### Architectural check

The stair does **not** require:

- a column in the entrance hall;
- a transfer through the drawing room;
- a deeper whole-house floor;
- movement of the courtyard;
- movement of the principal entrance.

The RH-03 stair survives structural coordination.

---

## 7. Courtyard walls and openings

The courtyard envelope is both architecture and structure in the selected concept.

### Vertical continuity

The four courtyard wall lines should remain vertically continuous from foundation to roof/eaves support except at deliberate openings.

This is valuable because the courtyard is already the building's most geometrically expensive move. Making its permanent walls carry real structural work avoids paying for an independent frame beside them.

### Openings

RH-04 establishes:

- broad centred openings on the south and north courtyard faces;
- two-bay opening families on east and west courtyard faces.

These conditions are structurally ordinary **provided enough masonry pier remains between openings and at corners**.

RH-05 therefore adds a guardrail:

> **Do not enlarge courtyard openings into continuous glazed walls without returning to the structural gate.**

Exact lintels, masonry pier widths, padstones/bearings and load distribution remain engineering work.

### Corner nodes

The four courtyard corners are structurally important because they receive:

- masonry wall loads;
- floor reactions;
- edge-beam reactions;
- later roof reactions;
- diaphragm/robustness forces.

Treat them as protected **structural nodes**, not convenient future service-chase locations.

---

## 8. Outer masonry and RH-04 front elevation

The selected four-bay front is structurally favourable.

Approximate ground opening widths remain around 0.9–1.05 m on **2.70 m bay centres**, leaving substantial masonry fields between openings. Upper openings align vertically on the same axes.

RH-05 therefore finds no reason to alter:

- the four-bay field;
- bay spacing;
- the off-centre entrance;
- the stair-window position.

The stair window's higher sill also leaves more masonry below the opening, not less.

The façade order survives the structural gate without a concealed frame.

---

## 9. Rear wall obligation

The rear elevation is less developed than the front.

RH-02 asks the family room, dining room and kitchen to connect strongly to the garden. RH-05 therefore records a constraint before later elevation work becomes over-glazed:

- retain meaningful masonry piers on the north external wall;
- align or coordinate major rear openings with the `EB-W-N` and `EB-E-N` reaction zones;
- do not turn the entire rear wall into one continuous opening unless a later architectural decision explicitly accepts the required beam/frame consequence.

This is not a ban on large garden openings. It is a refusal to assume structure disappears at the rear because the elevation has not yet been drawn.

---

## 10. Lateral stability and diaphragm concept

At concept level, stability comes from:

- substantial external masonry walls;
- the inner courtyard masonry ring;
- the permanent structural deck acting as the first-floor diaphragm;
- designed wall/floor restraint;
- roof diaphragm / restraint to be coordinated later.

The courtyard opening means the diaphragm is a **ring diaphragm**, not a full rectangle. The engineer must check:

- collector/chord requirements around the courtyard opening;
- wall restraint;
- torsion/asymmetry from openings;
- robustness ties;
- stair opening interaction;
- whether the selected masonry wall lengths are adequate in both principal directions.

RH-05 makes no lateral-capacity claim.

The important project rule remains:

> **the removable floor architecture above the structural deck does not participate in primary diaphragm stability.**

---

## 11. Service-zone coordination before RH-06

RH-05 deliberately gives structure some protected territory.

### Protected no-drill / no-chase zones

Treat the following as unavailable for casual future drilling:

- four courtyard corner structural nodes;
- `EB-W-S`, `EB-E-S`, `EB-W-N`, `EB-E-N`;
- stair trimmers;
- masonry lintels and bearing zones;
- floor diaphragm edge/collector zones once engineered.

### Vertical-service reservation

The current `RH-P014-02` vertical-service-zone geography is in the east-middle service/bathroom strip.

RH-05 reserves a **framed-opening zone** in that floor area rather than routing services through arbitrary I-joist webs after construction. Exact dimensions and service segregation are RH-06 work.

This reservation is **not yet a `HSA-P-005` Designed Structural Penetration occurrence** because the penetrating services and required clear opening are not yet defined.

### Routine horizontal services

Do not use the I-joist field as the default whole-house service highway merely because engineered joists can sometimes accommodate holes.

The current bias remains:

- coherent circulation/service routes;
- skirting / wall-side distribution where proportionate;
- dedicated vertical geography;
- only designed, manufacturer/engineer-approved floor crossings where unavoidable.

---

## 12. Foundation concept boundary

No real site or ground investigation exists, so RH-05 does **not** select strip foundations, trench fill, raft, piles or ground beams.

The structural load-path assumption is simply:

- outer loadbearing masonry reaches site-designed foundations;
- courtyard loadbearing masonry reaches site-designed foundations;
- concentrated edge-beam reactions are carried into those wall/foundation systems at explicit nodes;
- no floating ground-floor transfer is assumed.

A future real site can change the foundation system without changing the architectural structural order, provided those support lines remain credible.

---

## 13. Structural alternatives rejected / held

### S0 — whole-house steel or timber frame

An independent regular frame could carry the house and free every masonry wall from structure.

**Reject as baseline.**

It duplicates permanent systems and weakens the useful coincidence between long-lived masonry architecture and long-lived structure. Keep only as a fallback if engineering later invalidates the masonry concept.

### S2 — long-span floor across major house dimensions

Examples would include beams/joists spanning most of the 10.8 m or 12.0 m house dimension to avoid using the courtyard walls.

**Reject.**

The courtyard already creates short support distances. Ignoring them would add depth and cost for no architectural benefit.

### S3 — make every internal room partition loadbearing

**Reject.**

This would make the floor easy to support at the cost of freezing room subdivision and increasing future alteration consequence. Only permanent architectural boundaries should be recruited structurally where useful.

### S4 — steel ring around the courtyard

A steel frame around the courtyard could carry all floors/openings and permit almost arbitrary courtyard glazing.

**Hold as a failure fallback, not a design ambition.**

Use only if masonry pier/opening requirements prove incompatible with the selected architecture after actual engineering.

---

## 14. Engineer review questions

The external structural review should attack these questions explicitly.

1. Can the outer/courtyard masonry inner leaves credibly provide the proposed vertical/lateral roles with the intended cavity-wall family?
2. Can a first-floor system with gross spans of approximately **4.2 m** and **3.4 m** fit the RH-04 350 mm zone while meeting strength, vibration, deflection, fire and acoustic requirements?
3. What edge-beam family best resolves the four approximately 3.4 m extension conditions: LVL/proprietary timber or protected steel?
4. Are the four courtyard corner reaction nodes and masonry bearing lengths proportionate?
5. Can the broad north/south courtyard openings retain sufficient pier/bearing width without compromising RH-04 architecture?
6. Does the large courtyard opening create diaphragm/collector or robustness requirements that materially change the floor edge?
7. Is the RH-03 stair opening/trimmer concept structurally ordinary inside the selected south-centre zone?
8. What exact wall restraint and diaphragm connections are required without making removable linings structural?
9. What service-opening geometry can be reserved in the east-middle zone without forcing later joist cutting?
10. Does any assumption above require a visible RH-04 sectional rewind?

A negative answer is a design result, not a review failure.

---

# RH-05 gate record

**Result:** **PASS at architectural / pre-engineering coordination level.**

The current house admits a simple structural concept based on:

- loadbearing outer masonry inner leaves;
- loadbearing courtyard masonry inner leaves;
- short engineered-timber floor spans of approximately 3.4–4.2 m gross;
- four repeated short edge beams continuing courtyard support lines through front/rear wings;
- local stair and future service trimmers;
- permanent structural deck / diaphragm independent of removable occupied layers.

No RH-04 architectural coordinate currently requires:

- a whole-house frame;
- a room column;
- a long transfer girder;
- an enlarged floor zone;
- movement of the entrance;
- movement of the courtyard;
- deletion of the principal stair.

The 350 mm RH-04 floor reservation therefore remains controlled.

**No structural adequacy is claimed.** RH-11 structural-engineer review remains mandatory before any technical validation or construction use.

**No maturity promotion is claimed.**

**Next stage:** `RH-06 — Coordinate services and failure geography`.

**Exact next action:** route utility entry, plant replacement, water, foul/soil, kitchen/bath extract, electrical/data and the current vertical-service reservation through the RH-05 structural zones; create the first new crossing register only where route and structure genuinely intersect.