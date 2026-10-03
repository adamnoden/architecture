# G-01 Precedent Annotation Schema — D3 v0.1

**Status:** annotation contract established; first qualitative trial started  
**Purpose:** define how precedent evidence is converted into comparable architectural observations without prematurely converting observations into grammar rules.  
**Related:** [G-01 Corpus Register](g01-corpus-register.md), [G-01 Research Brief](g01-research-brief.md)

> **Annotate the building first. Infer the grammar later.**

## 1. Why a fixed annotation contract matters

A precedent corpus becomes dangerous when each building is “read” differently according to whatever feature seems interesting at the time.

The annotation schema should force every case through the same questions.

This gives us:

- comparable evidence;
- explicit missing data;
- a clean separation between source fact and interpretation;
- enough structure to test topological and dimensional hypotheses;
- a record of alterations and uncertainty;
- resistance to cherry-picking.

The schema is intentionally implementation-independent.

It is a research form, not a proposed database schema.

## 2. Evidence discipline

Every annotation item must be one of:

### FACT

Directly supported by a cited source/drawing.

### DERIVED

Computed or logically derived from facts.

Examples:

- aspect ratio;
- access depth;
- number of graph steps from entrance;
- alignment relationship.

### INTERPRETATION

Architectural reading requiring judgement.

Examples:

- “principal room”;
- “secondary axis”;
- “hierarchy weakened”.

Interpretations must cite the facts that motivate them.

### HYPOTHESIS

Possible cross-case rule suggested by the case.

Hypotheses are **not** grammar rules until tested against the wider corpus and counterexamples.

### UNKNOWN

Required field for which evidence is not yet adequate.

Do not fill an unknown with a guess merely to complete the table.

## 3. Source record

Every case begins with a source register.

For each source:

- source ID;
- title / archive reference;
- institution / author;
- date;
- source type;
- original / measured / reconstructed / interpretive;
- scale, if applicable;
- what state/phase of the building it represents;
- known alterations already embodied in the source;
- rights / reproduction constraint where relevant;
- confidence;
- source URI / archive location.

### Phase warning

A measured plan can be geometrically excellent but historically wrong for the grammar question if it records later alterations.

Therefore:

> **geometric authority and phase authority are separate attributes.**

## 4. Case identity

Record:

- G-01 case ID;
- building;
- location;
- date range;
- architect / designer / attribution;
- original patron;
- primary historical use;
- corpus class;
- analysis role: TRIAL / DERIVE / HOLD-OUT / CONTEXT;
- source-quality grade;
- major alterations;
- target phase for annotation.

## 5. Building-level morphology

Record:

- freestanding / terrace / attached / courtyard / pavilion system;
- overall footprint family;
- storey count;
- basement / raised basement;
- attic / garret;
- roof family;
- main frontage(s);
- principal approach;
- garden relationship;
- service-wing / pavilion condition;
- major projections/recesses.

Do not yet attach value to these.

## 6. Semantic space register

Every identifiable space receives a stable research ID.

Example:

~~~text
MHH-GF-HALL
MHH-GF-BREAKFAST
MHH-1F-GREAT
~~~

Record:

- historical room name;
- normalised role;
- floor;
- public / private / service / circulation / mixed;
- candidate hierarchy rank;
- exterior frontage;
- direct exterior access;
- evidence source;
- confidence.

### Normalised role vocabulary — initial

This vocabulary is deliberately small.

- ENTRANCE
- PRINCIPAL-RECEPTION
- SECONDARY-RECEPTION
- DINING
- SLEEPING-PRINCIPAL
- SLEEPING-SECONDARY
- DRESSING
- STUDY/LIBRARY
- SERVICE
- KITCHEN
- CIRCULATION-PRIMARY
- CIRCULATION-SECONDARY
- STAIR-PRIMARY
- STAIR-SERVICE
- STORAGE
- OTHER

Historical names remain alongside normalised roles.

Do not erase semantic differences merely to fit the vocabulary; extend only when needed.

## 7. Spatial topology graph

For each space, record direct connections.

Edge types:

- DOOR;
- OPEN-ARCH / large opening;
- STAIR;
- SERVICE-CONNECTION;
- EXTERIOR;
- uncertain historic connection.

Derived properties may include:

- access depth from principal entrance;
- alternative route count;
- through-room circulation;
- cul-de-sac status;
- enfilade chain;
- centrality;
- separation between principal and service circulation.

Important:

> **A doorway is geometry; an access relation is topology.**

Record both separately.

## 8. Spatial hierarchy

Record candidate ranks independently from room size.

Initial scale:

- H0 — dominant/principal space;
- H1 — major principal space;
- H2 — secondary inhabited space;
- H3 — subordinate/private/service-support space;
- H4 — purely ancillary.

This is a research device, not a historical label.

For each rank assignment record evidence:

- room name/use;
- size;
- ceiling height;
- decorative richness;
- position;
- opening hierarchy;
- access route;
- source commentary.

If signals conflict, record conflict.

## 9. Ordering structure

Annotate:

### Axes

- primary building axis;
- secondary axis;
- room-level axis;
- landscape axis.

For each axis:

- entities aligned;
- whether geometric or perceptual;
- whether exact or approximate;
- scope.

### Centres

- building centre;
- façade centre;
- room centre;
- courtyard centre.

### Symmetry domains

Do **not** annotate simply:

isSymmetric = true/false

Record the domain:

- façade only;
- principal block;
- room;
- stair;
- landscape;
- opening group;
- approximate / exact.

This prevents the project from turning “Georgian symmetry” into a false universal rule.

### Bay structure

Record:

- bay count;
- bay centres;
- repeated / exceptional bay;
- centre emphasis;
- edge condition;
- projection/recess.

## 10. Metric geometry

Only populate from sources adequate for measurement.

For each space:

- clear width;
- clear length;
- clear height;
- area;
- wall thickness where relevant;
- door/opening dimensions;
- uncertainty.

Store raw values before ratios.

Derived:

- length:width;
- width:height;
- length:height;
- area rank;
- proximity to candidate historical ratio family.

### Ratio policy

Do not round a measured room toward a famous ratio.

Record:

~~~text
measured ratio: 1.47
nearest candidate family: 1.50
difference: -0.03
~~~

Whether that difference is architecturally meaningful is a later question.

## 11. Vertical grammar

Record:

- floor-to-floor height;
- clear ceiling height;
- hierarchy between storeys;
- double-height spaces;
- stair continuity;
- vertical stacking of walls;
- vertical opening alignment;
- attic/garret relationship;
- basement/piano-nobile condition.

## 12. Elevation register

For each principal elevation:

- orientation;
- frontage rank;
- storeys expressed;
- bay count;
- opening IDs;
- entrance position;
- centre condition;
- projection/recess;
- material/order transitions;
- roof/parapet relation;
- principal horizontal datums.

For each opening where evidence permits:

- centreline;
- width;
- height;
- sill level;
- head level;
- storey;
- associated room;
- hierarchy rank;
- surround type.

## 13. Plan / elevation coupling

This is one of the most important sections.

For every façade opening ask:

- which room does it serve?
- does it align with room centre?
- does it align with bay centre?
- does it align vertically with openings above/below?
- is its size correlated with room rank?
- is the entrance aligned with the main internal route?
- do external projections correspond to internal hierarchy?
- does façade symmetry continue into plan or stop at the external surface?

Record exact facts before interpretation.

## 14. Section / plan coupling

Ask:

- does room hierarchy correspond to ceiling height?
- does a stair disrupt otherwise regular stacking?
- do double-height rooms alter upper-floor topology?
- does the roof respond to room/order hierarchy?
- where do floor structures likely span?
- do chimney/fireplace positions imply stacking?

## 15. Structural reading

This is not a retrospective structural calculation.

Record only what can be supported.

Potential fields:

- load-bearing wall family;
- likely floor-span direction;
- repeated support lines;
- major transfer condition;
- chimney/fireplace structural mass;
- major openings;
- later structural alteration;
- evidence confidence.

The aim is to identify whether architectural order and structural order coincide.

## 16. Service / occupation reading

Record historical servicing arrangements only where relevant to spatial interpretation.

Fields:

- kitchen location;
- service stair;
- service wing;
- servant/service circulation;
- separation from principal route;
- sanitation additions/alterations;
- later service changes.

Then record:

**historical dependency** — does a spatial arrangement exist because of a social/service condition G-01 should not automatically preserve?

## 17. Social-history note

For each case, where evidenced:

- patron/household context;
- labour/servant structure;
- entertaining conventions;
- gendered/private/public practices;
- wealth source where architecturally/historically relevant;
- later occupation changes that drove alterations.

This field exists so repeated historical patterns are not accidentally treated as timeless laws of domestic life.

## 18. Long-Life House compatibility note

Do not score the historic building against the doctrine.

Instead record observations relevant to future translation:

- spatial order worth preserving;
- architectural elements that already perform interface/tolerance work;
- patterns that conflict with modern maintainability;
- opportunities for service geography;
- likely permanent architecture versus changeable fit-out.

This is interpretation, clearly labelled.

## 19. Candidate observation register

At the end of each case, record observations in a neutral form.

Example:

~~~text
OBS-MHH-004
FACT:
  The first-floor Great Room occupies the central principal position
  and rises through the floor above.

INTERPRETATION:
  Spatial rank is expressed through both centrality and vertical volume.

HYPOTHESIS:
  In G-01, dominant principal space may be marked by more than floor area;
  position and sectional privilege may be stronger rank signals.

TEST AGAINST:
  Danson / Ditchley / ordinary corpus / counterexamples.
~~~

This is the bridge from annotation to grammar research.

## 20. Alteration register

Every case needs a minimal chronology.

Fields:

- phase ID;
- date;
- alteration;
- affected entities;
- confidence;
- whether target-phase grammar analysis should include/exclude it.

A room arrangement visible today must not silently become evidence for the eighteenth-century state.

## 21. Uncertainty register

Unknowns are first-class data.

For each uncertainty:

- ID;
- question;
- affected annotation;
- source required;
- whether it blocks topology, metric analysis or neither.

## 22. D3 Trial A — Marble Hill House: preliminary qualitative annotation

**Status:** source pack strengthened to A1 archive level; qualitative annotation remains partial and metric extraction is deliberately pending direct sheet access.

### Sources currently indexed

- MHH-S01 — Historic England listing, Grade I, target phase 1724–29 architectural description.
- MHH-S02 — MP/MHH0016, measured ground/first-floor plan, 1926, room functions indicated.
- MHH-S03 — MP/MHH0116 / 0117, publication ground/first-floor measured plans, 1962.
- MHH-S04 — MP/MHH0032, measured elevations and section, 1950.
- MHH-S05 — English Heritage all-floor visitor/research plan; explicitly distinguishes the later-demolished service wing.
- MHH-S06 — PF/MHH/003, late-1920s/1930s job containing four measured sheets of plans, elevations and sections “as existing”.
- MHH-S07 — MP/MHH0157 / 0158, 1964 restoration ground-floor plans; useful for distinguishing measured existing fabric from restoration intent.
- MHH-S08 — PF/MHH archive volume: 563 measured drawings across survey, publication, restoration and later work; use as the source universe rather than treating one twentieth-century drawing as the eighteenth-century truth.

### Building facts already supportable

- compact freestanding Palladian villa;
- rectangular principal block;
- north and south principal elevations each five bays;
- centre three bays project and are pedimented;
- lowest of three main storeys treated as architectural basement;
- principal plan accompanied historically by a service wing;
- current/public research plan explicitly marks that service wing as demolished in 1909.

### Phase frame

The source pack now requires at least four explicit phases:

1. **early design / original-villa target phase, c.1724–29**;
2. **later eighteenth-century occupation and service development**;
3. **twentieth-century measured-existing state**;
4. **twentieth-century restoration / publication reconstruction**.

A measurement may be geometrically precise and still belong to the wrong historical phase. D3 therefore treats **phase confidence and geometric confidence as independent fields**.

### Ground-floor topology — preliminary

Identifiable principal-block spaces include:

- central Hall;
- Breakfast Parlour;
- Dining Parlour;
- Paper Room;
- Housekeeper's Bedchamber;
- primary stair;
- additional stair/circulation;
- connection toward service wing.

The published plan shows a strong central Hall as an organising space with principal rooms flanking it, while service/circulation conditions occupy the deeper/side portions.

**Do not yet infer exact symmetry.**

The plan contains meaningful asymmetries and later conditions that require phase checking.

### First-floor hierarchy — preliminary

Identifiable spaces include:

- central Great Room;
- Lady Suffolk's Bedchamber;
- Dressing Room;
- Miss Hotham's Bedchamber;
- Damask Room;
- stair/circulation.

The Great Room is explicitly double-height: the second-floor plan records the upper part of the Great Room.

Preliminary interpretation:

- the architectural hierarchy of the Great Room is expressed by **centrality + room size + sectional privilege**, not merely one proportion ratio.

This is an observation, not a G-01 rule.

### Second-floor consequence

The double-height Great Room removes a central portion of the second-floor usable plan.

This is valuable for the computational project because it demonstrates:

> plan grammar and vertical grammar cannot be solved independently.

### Alteration warning

The service wing was demolished in 1909.

Therefore:

- current exterior massing is not sufficient evidence for original service topology;
- the 2017 drawing is excellent for identifying the alteration but should not be mistaken for an untouched eighteenth-century source.

### Candidate observations

**OBS-MHH-001**  
Central principal spaces may carry hierarchy through position rather than simply size.

**OBS-MHH-002**  
The Great Room's double height suggests sectional privilege is a first-class hierarchy signal.

**OBS-MHH-003**  
Principal architectural order and service morphology need not be identical; later loss of the service wing would badly distort a grammar derived from current massing alone.

**OBS-MHH-004**  
Five-bay façade symmetry must be tested against internal plan alignment rather than presumed to imply full-plan symmetry.

### D3 gaps

Before metric extraction:

- retrieve/use the highest-confidence measured plan sheets;
- establish original versus 1926/1950/1962 conditions;
- identify exact principal entrance orientation/route for target phase;
- measure room dimensions from a source licensed/suitable for research extraction;
- map opening centres to rooms.

## 23. D3 Trial B — Danson House: preliminary qualitative annotation

**Status:** A2 textual/fabric evidence now supports topology, phase and structure observations; scaled plan extraction remains pending before metric geometry.

### Sources indexed

- DAN-S01 — Historic England monograph *Danson House: The Anatomy of a Georgian Villa*.
- DAN-S02 — Historic England Research Report 103/2000, 192 pages, building recording / architectural investigation.
- DAN-S03 — Historic England listing/park research and early estate plans.
- DAN-S04 — Michael Angelo Taylor's 1790 principal-floor plan as discussed in the published historical research.
- DAN-S05 — Roger White, “Danson Park, Bexley”, *Archaeologia Cantiana* 98; useful independent plan/topology discussion but subordinate to the Historic England fabric report.

### Phase frame

The authoritative Historic England research supports a deliberately non-single-date model:

- **1762–63:** main carcass substantially complete;
- **c.1765–66:** principal interiors/fitting out;
- **1770:** William Chambers called in for selected interior enhancement;
- **before 1787:** Taylor's originally single-storey east/west canted bays heightened;
- **c.1860s or later:** door from the saloon into the east-of-stair closet inserted;
- **modern conservation/restoration:** later investigative/reinstatement evidence must not be mistaken for original fabric.

This is a particularly useful case for proving why a grammar corpus needs phase provenance at observation level.

### Principal-floor topology — preliminary

The fabric report describes a tightly organised principal floor around an **elliptical, top-lit primary stair**, with a conventional service stair in the adjacent western rectangular bay.

The four principal rooms form a circuit around that core:

- Entrance Hall — north;
- Dining Room — east;
- Saloon — south;
- Library — west.

Critically, the east-of-stair passage was originally a closet and did **not** connect the Entrance Hall directly to the Saloon. The original route from Hall to Saloon therefore passed through either the Dining Room or Library.

Record this as a topological fact for the target phase, not merely an impression of the plan.

Preliminary graph:

~~~text
                 ENTRANCE HALL
                  /          \
          DINING ROOM      LIBRARY
                  \          /
                    SALOON

             [ELLIPTICAL STAIR]
             [SERVICE STAIR W]
~~~

The diagram expresses connectivity only; it is not metric geometry.

### Plan / elevation negotiation — preliminary

The fabric report records blind windows at several side-wing positions which simulate the external appearance of the other principal-floor windows. It also notes an important conflict: at Danson some were centred internally and therefore did not coincide with the centre of the external elevation, whereas equivalent positions in several other Taylor villas were centred on the exterior face.

This is strong evidence that the annotation schema needs to record **which ordering system is leading** when plan and façade do not agree.

It also means a blind window is not “no opening”. It can be a deliberate compositional device with a distinct interior/exterior state.

### Structural reading — preliminary

The Historic England fabric investigation gives unusually useful direct evidence that architectural room geometry and physical structure interlock.

In the Library, the floor frame includes a long north–south main beam spanning between the jambs of the north and south windows, with principal/common joists running east–west and continuing into the bay.

This should be annotated as evidence for H6 — structure and grammar can co-evolve — **not** as a claim that G-01 should reproduce this exact framing solution.

### Candidate observations

**OBS-DAN-001**  
A compact principal floor can be organised as a room circuit around a dominant circulation core rather than as a simple corridor tree.

**OBS-DAN-002**  
The lack of an original Hall→Saloon shortcut makes ceremonial/topological sequence architecturally meaningful; adjacency alone is insufficient to describe the plan.

**OBS-DAN-003**  
Primary and service stairs can be closely paired while remaining functionally and architecturally distinct.

**OBS-DAN-004**  
Plan and elevation can impose different centring logics on the same nominal opening position. G-01 needs directional plan/elevation-coupling annotations rather than assuming perfect alignment.

**OBS-DAN-005**  
Blind windows can carry façade grammar without being spatial openings. Absence/closure must therefore be representable as an intentional architectural state.

**OBS-DAN-006**  
The Library framing provides a concrete precedent for reading structural support paths alongside room/opening order.

### D3 gaps

Before metric extraction:

- obtain/directly inspect the highest-confidence reconstructed principal-floor and section sheets;
- assign stable room/opening IDs against those sheets;
- measure only from a reliable scaled source;
- reconcile the 1790 published plan with fabric evidence where they diverge;
- distinguish original opening intent from executed blind-window revisions.

Do not infer missing dimensions from secondary diagrams.

## 24. D3 Trial C — 76 Dean Street: preliminary qualitative annotation

**Status:** partial; plan source retrieval pending.

### Sources indexed

- DS76-S01 — Historic England Grade II* listing.
- DS76-S02 — *Survey of London* Vols. 33–34, St Anne Soho, cited by the listing and available through the Survey of London/British History Online corpus.
- DS76-S03 — Historic England early Georgian townhouse interpretive material.
- DS76-S04 — Historic England Archive SN00359, *Details, Elevation, Plan, Section*, from the LCC/GLC Historic Buildings Survey Notes; catalogue record located, image not exposed by the archive page.
- DS76-S05 — V&A E.371-2003, Greater London Council record print of 76 Dean Street containing ground- and first-floor plans with scale bar; source located for acquisition/inspection, not yet used for metric claims.

### Facts already supportable

- terraced townhouse;
- built 1732–33 by Thomas Richmond;
- double-pile plan;
- four storeys plus basement;
- four-window-wide façade;
- doorway in second bay from the right;
- first-floor openings receive stronger hierarchy than ordinary openings;
- one first-floor opening is wider/taller;
- principal stair and separate service stair are recorded.

### Immediate importance

This case falsifies an over-simple grammar before it is written.

A strong Georgian house can have:

- an even-numbered façade;
- an off-centre doorway;
- façade hierarchy concentrated at a particular storey;
- service and principal stair systems.

Therefore:

> “Georgian = globally symmetrical plan and centred entrance” cannot be an unqualified G-01 invariant.

The annotation needs to record **symmetry domain and scope**, not a single boolean.

### Candidate observations

**OBS-DS76-001**  
Storey hierarchy may be expressed through opening height/treatment.

**OBS-DS76-002**  
A Georgian façade may remain ordered without a centrally placed entrance.

**OBS-DS76-003**  
Principal/service circulation distinction can coexist within a compact double-pile urban plan.

### D3 gaps

- acquire/inspect the located GLC/V&A plan reproduction and Historic England SN00359 material at usable resolution;
- reconcile those drawings with the Survey of London account;
- establish room functions by floor;
- map stairs/doors/topological depth;
- measure bay/opening geometry only from reliable scaled source;
- distinguish original from later façade/interior alterations.

The source gap has therefore narrowed from “does a useful plan exist?” to **“obtain and phase-check the located plan evidence before extracting geometry.”**

## 25. Schema trial result

The schema survives the first qualitative pass, but four refinements are now clearly necessary.

### Refinement 1 — symmetry must be scoped

The field should never be a single boolean such as isSymmetric.

Instead symmetry must have:

- subject/domain;
- axis;
- storey/elevation scope;
- exact/approximate state.

### Refinement 2 — historical phase belongs on every material observation

Not just on the building record.

A doorway, wing or room topology may belong to a different phase from the rest of the source drawing.

Future annotations should allow an observation to reference a phase explicitly.

### Refinement 3 — plan/elevation coupling needs direction

A generic field such as “plan and elevation are coupled” is insufficient.

For a shared condition, record where evidence permits:

- **MUTUAL** — the two views appear resolved together;
- **PLAN_LEADS** — internal/spatial order governs the exterior position;
- **ELEVATION_LEADS** — façade order governs despite internal inconvenience;
- **CONFLICT / COMPROMISE** — neither system is perfectly satisfied;
- **UNKNOWN** — evidence does not justify a directional reading.

Danson's blind-window evidence demonstrates why this distinction matters.

### Refinement 4 — intentional absence is architectural data

The schema must distinguish:

- true opening;
- blind/simulated opening;
- prohibited opening;
- retained solid wall field;
- void / reserved clear zone;
- unknown condition.

A grammar of placement alone cannot describe architecture whose order depends partly on what is deliberately **not** opened or occupied.

These are exactly the kinds of discoveries D3 is meant to produce before software exists.

## 26. Next D3 action

1. obtain direct sheet/image access for the indexed Marble Hill A1 measured sources and complete phase reconciliation;
2. extract/inspect the Danson principal-floor and section drawings that correspond to the now-indexed textual fabric evidence;
3. acquire/inspect the located 76 Dean Street GLC/V&A and Historic England survey drawings;
4. assign stable room/opening IDs and complete the same topology/hierarchy fields for all three;
5. compare topology/hierarchy and plan/elevation authority **before** any ratio analysis;
6. then begin D5 metric extraction from phase-checked scaled sources;
7. only after D3–D6 evidence exists begin candidate-rule promotion.

No G-01 rule should yet be promoted.

No G-01 rule should yet be promoted.

---

## Current source anchors

- English Heritage, Marble Hill all-floor plan: https://www.english-heritage.org.uk/siteassets/home/visit/places-to-visit/marble-hill-house/history-and-stories/marble-hill-house-plans.pdf
- Historic England, Marble Hill listing: https://historicengland.org.uk/listing/the-list/list-entry/1285673
- Historic England, Marble Hill archive: https://historicengland.org.uk/images-books/photos/volume/PF/MHH
- Historic England, Danson monograph: https://historicengland.org.uk/images-books/publications/danson-house/
- Historic England, Danson Research Report 103/2000: https://historicengland.org.uk/research/results/reports/103-2000
- Historic England, 76 Dean Street listing: https://historicengland.org.uk/listing/the-list/list-entry/1066917
- Historic England, early Georgian townhouse interpretation: https://historicengland.org.uk/campaigns/visit/walking-tours/spotter-guide-georgian-townhouse/
