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

## 22. D3 trial case records

The D3 trials now live as separate case records so the schema remains a reusable contract rather than becoming a precedent scrapbook.

- [Marble Hill House](g01-cases/marble-hill-house.md)
- [Danson House](g01-cases/danson-house.md)
- [76 Dean Street](g01-cases/76-dean-street.md)
- [D3 trial-set index](g01-cases/README.md)

All three records use the sections defined above.

## 23. Schema refinements forced by D3

The trial set has changed the annotation contract in substantive ways.

### Refinement 1 — symmetry must be scoped

Never reduce symmetry to a building-level boolean.

Record:

- subject/domain;
- axis;
- storey/elevation scope;
- exact/approximate state;
- phase.

A principal façade can be strongly symmetric while a service system, room graph or whole historical accretion is not.

### Refinement 2 — phase belongs on material observations

A geometrically authoritative drawing may represent the wrong historical state for the research question.

Phase therefore belongs on:

- spaces;
- edges;
- openings;
- room uses;
- alterations;
- measurements;
- observations.

**Geometry confidence and phase confidence are separate.**

### Refinement 3 — plan/elevation coupling needs direction

“Plan and elevation are coupled” is too weak.

Initial directional states are:

- **MUTUAL**
- **PLAN_LEADS**
- **ELEVATION_LEADS**
- **CONFLICT / COMPROMISE**
- **UNKNOWN**

Danson shows that the direction may differ even within one nominal opening condition.

### Refinement 4 — coupling direction may be attribute-specific

An opening can exist for façade reasons while its precise centreline responds to an interior condition.

Therefore future D6 records should be able to distinguish, where evidence justifies it:

- existence_coupling;
- centreline_coupling;
- width_coupling;
- height_coupling;
- vertical_alignment_coupling.

Do not force one scalar relationship onto the whole opening.

### Refinement 5 — intentional absence is architectural data

Distinguish:

- true opening;
- blind/simulated opening;
- prohibited opening;
- retained solid field;
- reserved void/clear zone;
- unknown condition.

Architecture is partly made from what is deliberately not occupied or opened.

### Refinement 6 — topology is more than adjacency

D3 requires distinct concepts for:

- direct connectivity;
- principal/secondary/service route class;
- required traversal/sequence;
- visual or axial relationship;
- vertical connection.

Danson's original principal-floor circuit is the clearest current example: adding a direct Hall→Saloon doorway changes architectural sequence even though the rooms themselves do not move.

### Refinement 7 — UNKNOWN is a valid completed annotation state

A case should not be held permanently “incomplete” because a field lacks sufficient evidence.

D3 completion means:

- the question was asked;
- evidence was assessed;
- unsupported claims were not invented;
- the missing evidence is recorded in the uncertainty register.

This is particularly important at 76 Dean Street.

## 24. D3 completion contract

A case qualifies as D3 semantic v0.1 complete when it contains:

1. source register;
2. phase frame;
3. case identity and morphology;
4. stable semantic space IDs where evidence permits;
5. topology/route reading;
6. hierarchy reading;
7. ordering/symmetry reading;
8. metric fields populated or explicitly UNKNOWN;
9. vertical/elevation/coupling readings;
10. structural and service readings at evidence-supported resolution;
11. alteration and uncertainty registers;
12. neutral candidate observations, clearly separated from grammar rules.

D3 does **not** require completed D5 metrics or D6 coordinate analysis.

## 25. D3 result

**D3 v0.1 is complete.**

The schema has survived three deliberately different cases:

- a canonical compact Palladian villa;
- a compact later Georgian villa organised around a principal circulation core and room circuit;
- a constrained urban double-pile townhouse.

The trial has already falsified several tempting simplifications:

- “Georgian” is not one plan graph;
- symmetry is not a whole-building boolean;
- hierarchy is not room area alone;
- proportion is not one preferred ratio;
- circulation is not merely leftover connective space;
- plan and elevation do not always share one centre;
- absence can be compositional;
- historical phase cannot be stripped from geometry.

No G-01 rule is promoted by D3.

The next work is:

- finish D4 topology comparison against the case records;
- begin D5 dimensional/proportional extraction from phase-checked sources;
- begin D6 plan/section/elevation coupling analysis;
- only later create the candidate-rule register.

