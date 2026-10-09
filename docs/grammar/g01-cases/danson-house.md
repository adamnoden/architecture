# G-01 Case DAN — Danson House

**Case ID:** G01-DAN  
**Analysis role:** TRIAL  
**Corpus class:** compact later-Georgian / neo-Palladian villa  
**D3 status:** semantic annotation v0.1 complete; D5 dimensional seed unusually strong  
**Evidence grade:** A2 fabric research + near-contemporary plan evidence  
**Purpose:** test the annotation contract against a compact sophisticated villa in which circulation sequence, service circulation, room proportion, façade negotiation and structural framing are unusually well documented.

> This record annotates evidence. It does not promote G-01 rules.

## 1. Source register

| ID | Source | Type | What it supports | Phase authority | Geometric authority |
|---|---|---|---|---|---|
| DAN-S01 | Historic England, *Danson House: The Anatomy of a Georgian Villa* | scholarly monograph | evolution, planning, structure, proportion, restoration | high | high where reconstructed/measured |
| DAN-S02 | Historic England Research Report 103/2000 | detailed fabric/conservation investigation | phasing, room dimensions, wall thickness, structure, openings, route changes | high | high |
| DAN-S03 | Roger White, “Danson Park, Bexley”, *Archaeologia Cantiana* 98 | scholarly article | principal-floor topology, 1790 plan, stair/service relationships | high/medium | medium/high |
| DAN-S04 | Michael Angelo Taylor / Malton-associated 1790 published plan, reproduced in scholarship | near-contemporary plan | principal-floor organisation and detached service wings | high for late C18 state | medium/high |
| DAN-S05 | Historic England List entry 1064225 | authoritative descriptive record | principal floor, elevations, canted bays, entrance hierarchy | high | low/medium |
| DAN-S06 | Historic England Research Report 118/1997 | focused fabric investigation | closet P7 / Library P4 relationship and later alteration | high | medium/high |

## 2. Case identity

- **Building:** Danson House
- **Location:** Bexley, London
- **Architect:** Sir Robert Taylor
- **Patron:** John Boyd
- **Principal construction:** 1762–66, with interiors evolving through the later 1760s
- **Architectural family:** compact neo-Palladian Georgian villa
- **Primary use:** elite domestic villa
- **Morphology:** compact freestanding cubic/near-cubic principal block with canted bays; detached service wings added early in occupation
- **Storeys:** terrace/service level below; raised principal floor; bedroom floor above
- **Major later history:** Chambers interior interventions c.1770; side bays heightened before 1787; nineteenth-century door/comfort changes; twentieth-century deterioration and late-C20/early-C21 restoration

## 3. Phase frame

### DAN-P1 — Taylor principal-block execution, c.1762–66

Primary target for:

- original principal-floor topology;
- room proportion;
- main stair/service stair relationship;
- structural reading.

### DAN-P2 — completed late-eighteenth-century villa, c.1770–90

Use for:

- service wings;
- later-eighteenth-century decorative/elevation state;
- 1790 plan evidence.

### DAN-P3 — nineteenth-century alterations

Important because one later doorway changes the principal-floor route graph.

### DAN-P4 — conservation/restoration evidence

Use as fabric evidence, not as an automatic historical target.

## 4. Building-level morphology

**FACT**

- compact freestanding villa;
- all four fronts exposed;
- north/south fronts slightly wider than east/west;
- central canted bays on east, west and south;
- entrance on north at raised principal floor;
- principal apartments on the first/principal floor;
- detached wings served stables and kitchen offices in the later-eighteenth-century estate.

**INTERPRETATION**

Danson is exceptionally useful because the compactness forces several systems—room hierarchy, primary stair, service stair, façade order and structure—to negotiate within a small volume.

## 5. Semantic space register — principal floor

| ID | Historical/published name | Normalised role | Hierarchy | Confidence |
|---|---|---|---|---|
| DAN-P-ENTRANCE | Entrance Hall | ENTRANCE / PRINCIPAL-RECEPTION | H1 | high |
| DAN-P-DINING | Dining Room | DINING / PRINCIPAL-RECEPTION | H1 | high |
| DAN-P-SALOON | Saloon | PRINCIPAL-RECEPTION | H0/H1 | high |
| DAN-P-LIBRARY | Library | STUDY/LIBRARY / PRINCIPAL-RECEPTION | H1 | high |
| DAN-P-PRIMARY-STAIR | elliptical top-lit stair | STAIR-PRIMARY | H0/H1 | high |
| DAN-P-SERVICE-STAIR | servants'/service stair | STAIR-SERVICE | H3 | high |
| DAN-P-EAST-CLOSET | east-of-stair closet / later passage condition | STORAGE / SECONDARY | H3/H4 | high existence; use phase-sensitive |

### Service-wing research entities

| ID | Published use | Normalised role | Phase | Confidence |
|---|---|---|---|---|
| DAN-W-EAST | Kitchen Offices wing | SERVICE | P2 | high |
| DAN-W-WEST | Stables / coach accommodation | SERVICE | P2 | high |
| DAN-W-CONNECTORS | quadrant-wall / doorway connections | SERVICE-CONNECTION | P2 | high morphology |

## 6. Spatial topology

### Original principal-floor graph — DAN-P1

Authoritative fabric research and the 1790 plan support the following principal sequence:

~~~text
                 DAN-P-ENTRANCE
                   /          \
          DAN-P-DINING      DAN-P-LIBRARY
                   \          /
                  DAN-P-SALOON

              DAN-P-PRIMARY-STAIR
              DAN-P-SERVICE-STAIR
~~~

### Critical topological fact

The east-of-stair space was originally a closet and did **not** form a direct Entrance Hall → Saloon passage.

Therefore:

- Entrance Hall → Dining Room → Saloon
- or Entrance Hall → Library → Saloon

were principal routes.

A later doorway altered this graph.

### Route classification

- principal ceremonial route: through principal rooms;
- primary vertical route: central elliptical stair;
- service vertical route: adjacent narrow service stair;
- service-wing routes: distinct lower/side network.

### D3 finding

Danson proves that:

**adjacency ≠ connectivity ≠ route hierarchy ≠ sequence.**

All four need representation.

## 7. Spatial hierarchy

### Primary stair

The elliptical, top-lit stair is more than circulation.

Signals:

- central location;
- unusual geometry;
- top lighting;
- connection to spacious upper landing;
- principal visual/experiential role.

Candidate research reading: **circulation can itself be H0/H1 architecture.**

### Saloon

Signals:

- centre of garden front;
- octagonal/canted geometry;
- principal reception role;
- reached through other principal rooms in original topology.

Its rank is partly produced by **sequence**, not directness.

### Service stair

Closely adjacent spatially but architecturally subordinate.

This distinction is important for semantic authoring:

- near ≠ equal rank;
- same function family ≠ same architectural role.

## 8. Ordering structure

### Principal core

The main floor is tightly organised around the elliptical stair.

### Façade ordering

- north: central projected/pedimented entrance condition;
- east/west/south: central canted bays;
- principal-floor windows more strongly treated.

### Symmetry

Record at scoped levels:

- principal massing: strongly ordered;
- individual fronts: strong local symmetry/order;
- internal plan: approximately balanced but not reducible to simple mirror symmetry;
- service system: asymmetrical in function despite paired/adjacent formal organisation.

## 9. Metric geometry — D5 seed

The Historic England fabric research provides unusually strong direct dimensions.

### Wall system

- standard principal-floor wall thickness: **2 ft 6 in**;
- thicker walls occur around entrance where flues/niches intervene.

### Entrance Hall — DAN-P-ENTRANCE

- length: **26 ft 8 in**
- width: **20 ft**
- length:width ≈ **1.333 : 1**
- report explicitly identifies this as approximately **4:3**.

### Library — DAN-P-LIBRARY

- **18 ft × 36 ft**
- length:width = **2:1**

### Dining Room — DAN-P-DINING

- **18 ft × 36 ft**
- length:width = **2:1**

### Saloon — DAN-P-SALOON

- principal plan measure: **26 ft × 26 ft**
- geometrically octagonal/canted rather than a simple square room.

### Principal-floor height

- clear/room height reported as **16 ft** throughout principal floor.

### Side-bay geometry

The research report states:

- bay opening within the Library/Dining room is half the side length;
- three long facets are each **9 ft**;
- interior finish is elliptical;
- long:short ellipse diameter ≈ **4:3**.

### D3/D5 significance

This one case already defeats a simplistic “one preferred room ratio” model:

- 4:3 Entrance Hall;
- 2:1 Library and Dining Room;
- square/octagonal Saloon;
- common 16 ft height.

The hierarchy is coherent despite materially different room proportions.

## 10. Vertical grammar

**FACT**

- raised principal floor;
- terrace/service level below;
- bedroom floor above;
- primary stair continues vertically through the hierarchy;
- service stair is separate but adjacent;
- service functions occupy both lower level and detached wings.

**INTERPRETATION**

Vertical hierarchy and service geography are coordinated rather than incidental.

## 11. Elevation register

High-confidence facts:

- north entrance front has central projection/pediment;
- east/west/south have central three-window canted bays;
- principal-floor windows have stronger architectural treatment;
- the plan/elevation relationship includes blind/simulated windows at some side conditions.

Exact opening IDs will be attached in D6 once a scaled drawing is directly indexed.

## 12. Plan / elevation coupling

Danson is the strongest current D6 case.

### Attribute-level coupling

A single opening relationship can carry different directions for different attributes.

Example from blind-window evidence:

- **existence of simulated opening:** ELEVATION_LEADS
- **internal centring/location of some blind windows:** PLAN_LEADS
- **final external composition:** CONFLICT / COMPROMISE

Therefore coupling direction should be recorded **per attribute**, not once per opening.

Candidate fields:

- existence_coupling;
- centreline_coupling;
- width_coupling;
- height_coupling;
- vertical_alignment_coupling.

This is a D3 schema result, not yet formal ontology.

## 13. Section / plan coupling

Strong.

Examples:

- raised piano nobile;
- central stair volume;
- different service/occupation layers;
- height commonality across principal rooms despite different plan proportions.

The common 16 ft height is particularly important: plan proportions vary while one sectional datum ties the principal floor together.

## 14. Structural reading

The Historic England fabric research gives direct evidence.

### Library floor

Reported condition includes:

- a long north–south principal/main beam;
- span between jambs of north and south windows;
- principal/common joist system;
- floorboards running north–south across principal floor generally;
- Dining Room differs because the kitchen vault below changes the structural condition.

### Interpretation

This is high-value evidence that:

- room geometry;
- opening/jamb position;
- lower-floor condition;
- floor framing

can form one coordinated physical system.

Do not promote the historic framing method itself.

Promote the research question:

> can G-01 generate architectural fields that are structurally sympathetic before calculation?

## 15. Service / occupation reading

Danson makes service morphology first-class:

- adjacent service stair;
- lower service/terrace conditions;
- detached kitchen offices;
- detached stable/coach wing;
- quadrant/door connections.

Historical domestic labour structures should not become modern grammar invariants.

What may transfer is the **principle that different route classes can coexist without destroying principal spatial order**.

## 16. Social-history note

John Boyd was a wealthy merchant; Historic England's monograph notes his fortune was connected to West Indies sugar trade.

This context matters because:

- the house's service infrastructure and social separation depended on historical labour/economic conditions;
- G-01 must distinguish transferable spatial intelligence from social relations we do not seek to reproduce.

## 17. Long-Life House compatibility note

Potentially transferable:

- compactness without loss of hierarchy;
- dual circulation systems;
- strong principal-room sequence;
- technical/service accommodation without making it the visible architectural order;
- structure visibly cooperating with room/opening geometry.

Potential tension:

- through-room ceremonial circulation may conflict with contemporary privacy/independent access;
- servant separation is not a modern normative goal.

## 18. Candidate observation register

### OBS-DAN-001 — principal room circuit

**FACT:** Hall, Dining, Saloon and Library form a circuit in original principal-floor topology.  
**INTERPRETATION:** sequence, not just adjacency, carries architectural meaning.  
**HYPOTHESIS:** G-01 needs spatial-sequence semantics.  
**TEST:** other villas and townhouses; mutation adding Hall→Saloon shortcut.

### OBS-DAN-002 — ranked circulation

**FACT:** central primary stair and adjacent service stair coexist.  
**INTERPRETATION:** circulation systems can be physically adjacent yet hierarchically distinct.  
**HYPOTHESIS:** circulation requires route class/rank.  
**TEST:** Marble Hill and 76 Dean Street.

### OBS-DAN-003 — proportional plurality

**FACT:** principal rooms use 4:3, 2:1 and square/octagonal families under a common 16 ft height.  
**INTERPRETATION:** architectural coherence does not require one universal ratio.  
**HYPOTHESIS:** proportion should be role-/family-specific and range-based.  
**TEST:** wider corpus.

### OBS-DAN-004 — directional plan/elevation negotiation

**FACT:** blind-window placement reveals internal and external centring logics can differ.  
**INTERPRETATION:** “aligned” is too crude.  
**HYPOTHESIS:** coupling direction belongs on individual attributes.  
**TEST:** other Taylor villas, Marble Hill, urban corpus.

### OBS-DAN-005 — intentional absence

**FACT:** blind/simulated openings are part of façade composition without being ordinary spatial openings.  
**INTERPRETATION:** absence/closure has positive architectural meaning.  
**HYPOTHESIS:** grammar must model solid/blind/prohibited states explicitly.  
**TEST:** façade corpus.

### OBS-DAN-006 — structure/order relationship

**FACT:** Library floor framing relates to window-jamb geometry.  
**INTERPRETATION:** physical and architectural order can co-evolve.  
**HYPOTHESIS:** structural sympathy should be generated before structural proof.  
**TEST:** wider measured corpus.

## 19. Alteration register

| Phase | Change | Grammar consequence |
|---|---|---|
| 1762–63 | main carcass substantially complete | primary physical evidence |
| c.1765–66 | principal interior completion / service additions | mature initial villa |
| 1770 | Chambers interventions | decorative hierarchy changes, not wholesale topology |
| pre-1787 | east/west bays heightened | elevation/vertical state changes |
| c.1860s or later | Hall/Saloon-side closet doorway altered | principal route graph changes |
| C19 | comfort/service modifications | phase-check |
| 1995–2004 | conservation/restoration | fabric evidence + restored interpretation |

## 20. Uncertainty register

| ID | Question | Blocks |
|---|---|---|
| DAN-U01 | direct stable opening IDs/coordinates from highest-confidence scaled principal-floor drawing | D6 |
| DAN-U02 | exact historical target for every blind opening | D6 |
| DAN-U03 | complete bedroom-floor original topology | wider D4 vertical analysis |
| DAN-U04 | exact structural proof beyond recorded fabric | structural semantics |
| DAN-U05 | exact service-wing connection topology by moment in P2 | detailed service grammar |

## 21. D3 verdict

**COMPLETE AT SEMANTIC v0.1 LEVEL.**

Danson is already strong enough to support:

- comparable topology;
- hierarchy;
- route classification;
- phase-aware alteration;
- metric seed data;
- plan/elevation coupling semantics;
- structural observations.

D5/D6 still require direct drawing IDs and systematic measurements before any grammar rule is promoted.

## Source anchors

- Historic England, Research Report 103/2000: https://historicengland.org.uk/research/results/reports/103-2000
- Historic England, *Danson House: The Anatomy of a Georgian Villa*: https://historicengland.org.uk/images-books/publications/danson-house/
- Historic England List entry: https://historicengland.org.uk/listing/the-list/list-entry/1064225
- Historic England, Research Report 118/1997: https://historicengland.org.uk/research/results/reports/118-1997
- Kent Archaeological Society, Roger White, “Danson Park, Bexley”: https://www.kentarchaeology.org.uk/journal/98/danson-park-bexley
- Searchable Bexley/ADS copy of fabric research: https://www.bexley.gov.uk/sites/default/files/2022-12/the-house-and-park-at-danson-london-borough-of-bexley-the-anatomy-of-a-georgian-suburban-estate.pdf
