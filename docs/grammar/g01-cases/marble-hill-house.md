# G-01 Case MHH — Marble Hill House

**Case ID:** G01-MHH  
**Analysis role:** TRIAL  
**Corpus class:** compact English Palladian villa  
**D3 status:** semantic annotation v0.1 complete; D5 metric extraction intentionally partial  
**Evidence grade:** A1 source universe available, with phase reconciliation required  
**Purpose:** test the annotation contract against a compact canonical villa whose architectural hierarchy, vertical order and later service growth are unusually legible.

> This record annotates evidence. It does not promote G-01 rules.

## 1. Source register

| ID | Source | Type | What it supports | Phase authority | Geometric authority |
|---|---|---|---|---|---|
| MHH-S01 | Historic England List entry 1285673 | authoritative descriptive record | five-bay fronts; projecting/pedimented centre three; Great Room 24 ft cube; restoration history | medium/high | low/medium |
| MHH-S02 | MP/MHH0016, 9 Nov 1926 | measured drawing | ground/first-floor plans with room functions | medium | high |
| MHH-S03 | MP/MHH0116 / MP/MHH0117, 1962 | publication measured drawings | ground/first floor geometry | medium; pre-restoration publication state | high |
| MHH-S04 | PF/MHH/003 | measured-drawing job | four sheets of existing plans/elevations/sections, late 1920s/1930s | medium | high |
| MHH-S05 | English Heritage, Marble Hill all-floor plan, Nov 2024 | interpretive/phase-coded plan | room names; all floors; phase-coded later fabric; lost service-wing location | high for published interpretation | medium/high |
| MHH-S06 | PF/MHH archive volume | archive source universe | 563 measured drawings across survey, restoration and later work | variable | variable/high |
| MHH-S07 | English Heritage history/timeline | authoritative interpretation | original 1720s villa; 1740s–50s service wing and dining-parlour changes; 1965–66 restoration | high | n/a |

### Source discipline

Marble Hill is a warning against equating **precise drawing** with **correct historical phase**.

The record therefore keeps separate:

- geometry confidence;
- phase confidence;
- room-name/use confidence.

The 1965–66 restoration sought to return the house towards Henrietta Howard's period. A twentieth-century measured drawing can consequently be more geometrically authoritative than historically neutral.

## 2. Case identity

- **Building:** Marble Hill House
- **Location:** Twickenham, London
- **Original patron:** Henrietta Howard
- **Primary construction:** begun 1724; principal villa of the later 1720s
- **Architectural family:** English Palladian villa
- **Primary use:** elite domestic villa
- **Morphology:** compact freestanding principal block, later expanded by service accommodation
- **Storeys:** three principal visible levels in the published all-floor record; lowest treated architecturally as basement in listing description
- **Major later history:** extensive service-wing addition during Howard's occupation; dining-parlour reconfiguration; service wing demolished 1909; major GLC restoration 1965–66

## 3. Phase frame

D3 does **not** force Marble Hill into one timeless plan.

### MHH-P1 — initial principal-villa phase, c.1724–29

Use for:

- principal-block morphology;
- primary façade order;
- original-villa grammar questions where evidence can be reconciled.

### MHH-P2 — mature Howard occupation, 1740s–50s

Use for:

- expanded service morphology;
- mature room-use relationships;
- dining-parlour changes.

English Heritage records a large service wing and fashionable dining-parlour work in this period.

### MHH-P3 — measured-existing twentieth-century states

Use for:

- high-confidence geometry;
- evidence of what survived.

Do not automatically treat as P1 or P2.

### MHH-P4 — 1965–66 restoration and later museum states

Use for:

- restoration provenance;
- understanding what was intentionally reinstated.

### D3 consequence

**There is no single historically honest Marble Hill graph unless phase is attached to the graph.**

## 4. Building-level morphology

**FACT**

- freestanding rectangular principal villa;
- north and south elevations of five bays;
- centre three bays project and are pedimented;
- strong centre/flank ordering on both principal fronts;
- later service morphology extended beyond the compact principal block.

**INTERPRETATION**

The principal block is a useful case of **strong formal order coexisting with service growth that does not share the same compositional status**.

## 5. Semantic space register

The IDs below are research identifiers, not claims about original archival nomenclature.

### Ground floor / published mature-house reading

| ID | Historical/published name | Normalised role | Hierarchy | Phase note | Confidence |
|---|---|---|---|---|---|
| MHH-G-HALL | Hall | ENTRANCE / CIRCULATION-PRIMARY | H1 | principal block | high |
| MHH-G-BREAKFAST | Breakfast Parlour | SECONDARY-RECEPTION | H2 | published mature-house use | high |
| MHH-G-DINING | Dining Parlour | DINING / PRINCIPAL-RECEPTION | H1/H2 | use/fabric altered in 1750s | high use; phase-sensitive |
| MHH-G-HOUSEKEEPER | Housekeeper's Room/Bedchamber | SERVICE / PRIVATE | H3 | use label varies by source | medium/high |
| MHH-G-GREAT-STAIR | Great Stairs | STAIR-PRIMARY | H1/H2 | principal circulation | high |
| MHH-G-STONE-STAIR | Stone Staircase | STAIR-SERVICE / CIRCULATION-SECONDARY | H3 | exact historical role requires phase care | high existence |
| MHH-G-SERVICE-DIR | Service-wing connection | SERVICE-CONNECTION | H4 | P2; later wing lost | high at morphology level |

### First floor

| ID | Published name | Normalised role | Hierarchy | Confidence |
|---|---|---|---|---|
| MHH-1-GREAT | Great Room | PRINCIPAL-RECEPTION | H0 | high |
| MHH-1-HOWARD | Henrietta Howard / Lady Suffolk bedchamber | SLEEPING-PRINCIPAL | H1 | high |
| MHH-1-DRESSING | Dressing Room | DRESSING | H2 | high |
| MHH-1-HOTHAM | Miss Hotham's Bedchamber | SLEEPING-SECONDARY | H2 | high for published state |
| MHH-1-DAMASK | Damask Bedchamber/Room | SLEEPING-SECONDARY | H2 | high |
| MHH-1-GREAT-STAIR | Great Stair / landing | STAIR-PRIMARY | H1/H2 | high |
| MHH-1-SECONDARY-STAIR | secondary stair condition | STAIR-SERVICE / CIRCULATION-SECONDARY | H3 | medium; phase/function requires care |

### Second floor

| ID | Published name | Normalised role | Hierarchy | Confidence |
|---|---|---|---|---|
| MHH-2-GREAT-VOID | Upper part of Great Room | VOID / SECTIONAL-PRIVILEGE | H0-related | high |
| MHH-2-GALLERY | Gallery | OTHER / CIRCULATION | H2/H3 | high label; rank interpretive |
| MHH-2-GREEN | Green Room | PRIVATE | H2/H3 | high |
| MHH-2-PLAID | Plaid Room | PRIVATE | H2/H3 | high |
| MHH-2-WROUGHT | Wrought Room | PRIVATE | H2/H3 | high |

## 6. Spatial topology

### Ground floor

**FACT / DERIVED FROM PUBLISHED PLAN**

The Hall is the dominant front/central distributor in the principal block.

It is associated with flanking Breakfast and Dining parlours, while stair/service conditions sit deeper in the plan.

Simplified topology:

~~~text
BREAKFAST ── HALL ── DINING
               |
        DEEPER CIRCULATION
          /            \
 GREAT STAIR       STONE STAIR
                       |
               SERVICE DIRECTION
~~~

This diagram expresses ordering only; not every edge is asserted as an original doorway.

### First floor

**FACT**

The Great Room occupies the dominant central principal position.

**DERIVED**

Its role is not explainable by access graph alone because its double-height volume consumes part of the second floor.

### Route classes

- principal route: Hall → Great Stair → first-floor principal realm;
- secondary/service route: distinct stair/service conditions exist alongside the principal route;
- service-wing route: phase-dependent and materially expanded in P2.

### D3 finding

Marble Hill cannot be represented adequately by a single adjacency matrix. Route class and phase matter.

## 7. Spatial hierarchy

### Dominant signal — MHH-1-GREAT

Evidence for H0 rank:

- central principal position;
- explicit name “Great Room”;
- 24 ft cubic volume in authoritative listing;
- double-height sectional consequence;
- principal reception function.

This is unusually strong evidence that hierarchy is **multidimensional**:

~~~text
rank ≠ area alone
rank = position + volume + use + route + architectural treatment
~~~

### Ground-floor hierarchy

The Hall is architecturally more important than an ordinary corridor.

This matters computationally: ENTRANCE / CIRCULATION-PRIMARY may itself carry architectural rank.

## 8. Ordering structure

### Façade

**FACT**

North and south fronts are five bays; centre three project and are pedimented.

### Symmetry domain

Record:

- principal north façade: strong bilateral façade symmetry/order;
- principal south façade: strong bilateral façade symmetry/order;
- whole historical house including service morphology: **do not infer global symmetry**;
- room graph: **not yet tested as globally symmetric**.

### Centres

Candidate centre relationships:

- centre of principal façade;
- centre of principal block;
- Great Room central position;
- Hall central/near-central ordering role.

Exact centreline coincidence belongs to D6 measured plan/elevation work.

## 9. Metric geometry — D5 seed only

### MHH-1-GREAT

**FACT**

Historic England's listing describes the Great Room as a **cube of 24 ft**.

Therefore:

- width ≈ 24 ft;
- length ≈ 24 ft;
- height ≈ 24 ft;
- plan ratio ≈ 1:1;
- width:height ≈ 1:1.

This is a rare direct authoritative metric.

### Other rooms

**UNKNOWN FOR D5**

Do not scale values from the public plan for rule extraction while higher-authority measured drawings remain to be reconciled.

## 10. Vertical grammar

**FACT**

MHH-1-GREAT rises through the floor above; the all-floor plan explicitly records its upper part on the second floor.

**DERIVED**

This produces:

- vertical removal of otherwise usable second-floor plan;
- direct coupling between first-floor hierarchy and second-floor topology;
- a hierarchy signal stronger than floor area alone.

### Candidate relation

SECTIONAL_PRIVILEGE(MHH-1-GREAT)

This is a research concept, not formal schema.

## 11. Elevation register

High-confidence facts:

- five bays north/south;
- centre three projecting;
- centre three pedimented;
- north front more architecturally enriched;
- central entrance condition on the principal composition.

Opening-by-opening room mapping remains D6 work.

## 12. Plan / elevation coupling

### Current state

**PARTIALLY KNOWN**

The building clearly has coordinated central ordering in façade and principal-room hierarchy, but D3 does not yet claim exact opening-centre/room-centre coincidence.

Record provisional coupling:

- existence of strong centre: MUTUAL/UNKNOWN pending direct geometry;
- exact opening alignment: UNKNOWN;
- opening-size hierarchy by room: UNKNOWN.

This restraint is important. A formal façade can look coordinated while exact internal alignments differ.

## 13. Section / plan coupling

**STRONG**

The Great Room proves that sectional order can rewrite the plan above.

This is one of the strongest D3 observations across the corpus.

## 14. Structural reading

D3 does not infer a structural system from classical order.

Current claims:

- masonry principal block;
- repeated major wall lines are visible in plans;
- exact floor-span/support graph requires measured/source review;
- the Great Room's large/double-height volume necessarily affects floor/roof arrangement, but no structural rule is inferred here.

Status: **UNKNOWN / structural research later**.

## 15. Service / occupation reading

### Historical fact

English Heritage records substantial later service expansion and changes to the dining provision during Howard's occupation.

### Interpretation

Service topology was **capable of changing without replacing the principal architectural identity of the villa**.

This is highly relevant to the Long-Life House, but must not be romanticised: the social organisation depended on historic servant labour and elite domestic practice that G-01 must not encode as universal modern life.

## 16. Social-history note

Marble Hill was built for Henrietta Howard and used for elite sociability and retreat.

The grammar project should extract:

- hierarchy;
- circulation;
- spatial order;
- adaptable service relationship;

not preserve historic social hierarchy as a normative domestic requirement.

## 17. Long-Life House compatibility note

Potentially transferable:

- strong principal spatial order;
- hierarchy expressed through multiple dimensions;
- distinct service growth;
- architecture with enough hierarchy to absorb change without becoming formless.

Not automatically transferable:

- servant/service social segregation;
- exact eighteenth-century room uses;
- fixed Palladian ratio doctrine.

## 18. Candidate observation register

### OBS-MHH-001 — hierarchy through position

**FACT:** Great Room occupies dominant central principal position.  
**INTERPRETATION:** centrality contributes to rank.  
**HYPOTHESIS:** G-01 hierarchy may be relational before metric.  
**TEST:** Danson principal rooms; urban corpus.

### OBS-MHH-002 — sectional privilege

**FACT:** Great Room is 24 ft cube and double height.  
**INTERPRETATION:** vertical volume is a deliberate rank signal.  
**HYPOTHESIS:** principal-space hierarchy may include sectional privilege.  
**TEST:** other villas/townhouses; deliberate mutation removing height.

### OBS-MHH-003 — service morphology as a separate layer

**FACT:** substantial service wing added later and later demolished.  
**INTERPRETATION:** principal block identity survived major service-topology change.  
**HYPOTHESIS:** grammar may distinguish enduring primary order from subordinate service morphology.  
**TEST:** Danson service wings; townhouse service stairs.

### OBS-MHH-004 — façade symmetry scope

**FACT:** principal fronts have strong five-bay centre/flank order.  
**INTERPRETATION:** this does not establish global plan symmetry.  
**HYPOTHESIS:** symmetry must be scoped to a domain.  
**TEST:** 76 Dean Street; Danson side conditions.

## 19. Alteration register

| Phase | Change | Grammar consequence |
|---|---|---|
| P1 c.1724–29 | principal villa constructed | core architectural evidence |
| P2 1740s–50s | service wing / dining changes | service and room-use topology changes |
| later occupation | multiple adaptations | phase-check before use |
| 1909 | service wing demolished | current massing loses historical service topology |
| 1965–66 | restoration to Howard-period appearance | present fabric includes restorative interpretation |
| 2022-era conservation | conservation/redisplay | source context, not original state |

## 20. Uncertainty register

| ID | Question | Blocks |
|---|---|---|
| MHH-U01 | exact target-phase door graph for principal block | full D4 topology |
| MHH-U02 | exact room dimensions beyond Great Room | D5 |
| MHH-U03 | exact room-centre / façade-opening-centre relationships | D6 |
| MHH-U04 | original versus mature-Howard ground-floor room boundaries | D5/D6 phase analysis |
| MHH-U05 | structural span/support graph | structural grammar research |

## 21. D3 verdict

**COMPLETE AT SEMANTIC v0.1 LEVEL.**

This means:

- the same annotation contract has been applied;
- known evidence and unknowns are explicit;
- phase is first-class;
- stable research IDs exist;
- topology/hierarchy/order can be compared.

It does **not** mean:

- metric analysis is complete;
- opening coordinates are extracted;
- a G-01 rule has been proved.

Those belong downstream.

## Source anchors

- Historic England list entry: https://historicengland.org.uk/listing/the-list/list-entry/1285673
- Historic England measured plan MP/MHH0016: https://historicengland.org.uk/images-books/photos/item/MP/MHH0016
- Historic England ground-floor publication plan MP/MHH0116: https://historicengland.org.uk/images-books/photos/item/MP/MHH0116
- Historic England first-floor publication plan MP/MHH0117: https://historicengland.org.uk/images-books/photos/item/MP/MHH0117
- Historic England measured-drawing job PF/MHH/003: https://historicengland.org.uk/images-books/photos/job/PF/MHH/003
- Historic England archive volume PF/MHH: https://historicengland.org.uk/images-books/photos/volume/PF/MHH
- English Heritage history: https://www.english-heritage.org.uk/visit/places-to-visit/marble-hill-house/history-and-stories/
- English Heritage November 2024 plan: https://www.english-heritage.org.uk/siteassets/home/visit/places-to-visit/marble-hill-house/history-and-stories/marble-hill-plans-2024.pdf
