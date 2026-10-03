# G-01 Plan / Section / Elevation Coupling — D6 Seed v0.1

**Status:** preliminary analytical model; D6 not complete  
**Purpose:** determine how Georgian domestic architecture coordinates spatial plan, section, façade and construction without assuming that one projection always dominates.  
**Dependency:** D3 semantic annotation v0.1 complete; D4/D5 remain active.  
**Rule status:** no G-01 coupling rule is promoted here.

> **Plan, section and elevation are not consecutive design stages. They are negotiated views of one architectural order.**

## 1. Why D6 exists

A weak house generator can:

1. make a floor plan;
2. extrude walls;
3. distribute windows over the resulting façades.

That is exactly the failure mode G-01 is meant to avoid.

The precedent work suggests a more difficult reality:

- sometimes room order drives the façade;
- sometimes façade order constrains the room;
- sometimes section establishes hierarchy that plan alone cannot show;
- sometimes a deliberate compromise keeps both systems legible without making them identical.

D6 exists to identify those relationships explicitly.

## 2. The key D3 discovery — coupling needs direction

The annotation trial already established five useful states:

- **MUTUAL**
- **PLAN_LEADS**
- **ELEVATION_LEADS**
- **CONFLICT / COMPROMISE**
- **UNKNOWN**

D6 adds a further refinement:

> **direction belongs to an attribute, not necessarily to the whole object.**

An opening can exist for façade reasons while its exact position responds to a room.

Therefore one object may contain:

~~~text
existence_coupling   = ELEVATION_LEADS
centreline_coupling  = PLAN_LEADS
width_coupling       = MUTUAL
height_coupling      = ELEVATION_LEADS
~~~

This is conceptual research notation only.

## 3. Proposed coupling record

For each material relationship, record:

- case;
- phase;
- subject entity;
- plan entity/entities;
- elevation entity/entities;
- section entity/entities;
- attribute under comparison;
- coupling direction;
- strength/confidence;
- evidence source;
- conflict;
- resolution;
- architectural consequence.

Potential attributes:

- existence;
- centreline;
- width;
- height;
- sill level;
- head level;
- projection;
- recess;
- room position;
- wall line;
- stair position;
- storey level;
- ceiling datum;
- bay;
- structural support line.

## 4. Coupling is not only plan ↔ elevation

D6 needs at least six relationship families.

### Plan ↔ elevation

Examples:

- room centre ↔ window centre;
- bay ↔ wall subdivision;
- entrance ↔ internal route;
- room rank ↔ opening rank.

### Plan ↔ section

Examples:

- room hierarchy ↔ ceiling height;
- double-height space ↔ missing upper-floor area;
- stair position ↔ floor opening;
- service stacking ↔ plan adjacency.

### Elevation ↔ section

Examples:

- storey hierarchy ↔ window height;
- sill/head levels ↔ floor/ceiling datums;
- cornice/parapet ↔ roof/floor geometry.

### Plan ↔ structure

Examples:

- room wall ↔ bearing line;
- opening ↔ lintel/support;
- bay width ↔ span.

### Elevation ↔ structure

Examples:

- pier width ↔ support capacity;
- window jamb ↔ beam bearing/framing;
- projection ↔ structural support.

### Plan/section/elevation ↔ service topology

Examples:

- wet-room stack;
- chimney/flue mass;
- service stair;
- riser;
- service wing.

The future compiler may need all of these to prevent one drawing view from quietly breaking another.

## 5. Marble Hill — strong sectional coupling, incomplete opening coupling

### Principal façade order

**FACT**

- north and south fronts have five bays;
- centre three project and are pedimented.

### Principal-room order

**FACT**

- Great Room occupies the dominant central principal position;
- Great Room is a 24 ft cube;
- Great Room rises through the floor above.

### Current coupling record

#### MHH-CPL-01 — principal centre

- subject: principal block / MHH-1-GREAT
- attribute: central ordering
- plan: dominant central room
- elevation: strongly articulated centre-three-bay composition
- section: dominant double-height/cubic volume
- current direction: **MUTUAL / unresolved at exact geometric level**
- confidence: high for shared architectural centre; medium for exact coordinate coincidence

Interpretation:

> Marble Hill's architectural centre is expressed in more than one projection.

D6 should not yet claim every opening aligns to a room axis.

#### MHH-CPL-02 — sectional hierarchy

- subject: MHH-1-GREAT
- attribute: room rank
- plan signal: central principal position
- section signal: 24 ft height / upper-floor void
- direction: **MUTUAL**
- consequence: first-floor hierarchy rewrites second-floor topology

This is currently the strongest Marble Hill coupling observation.

### Missing evidence

To move from architectural centre to precise opening grammar, D6 needs:

- measured target-phase plans;
- measured elevations;
- opening centreline mapping;
- wall/room centres.

## 6. Danson — explicit negotiation rather than perfect alignment

Danson is currently the richest D6 case.

### DAN-CPL-01 — principal rooms and canted bays

Known:

- east, west and south fronts have central canted bays;
- Dining Room, Library and Saloon occupy corresponding principal fronts/positions;
- room geometry itself incorporates bay conditions.

Direction: **MUTUAL** at broad compositional level.

The bay is neither merely external decoration nor merely an interior bump-out.

### DAN-CPL-02 — blind-window existence

The fabric report records blind windows designed to simulate ordinary windows externally.

For such a condition:

- spatial opening function: absent;
- façade opening representation: present.

Direction for **existence**:

**ELEVATION_LEADS**

The façade grammar requires an opening-like state even where no ordinary spatial opening exists.

This is one reason the semantic model needs BLIND/SIMULATED rather than boolean OPEN/CLOSED.

### DAN-CPL-03 — blind-window centreline

The research records cases where blind windows at Danson are centred internally and therefore do not coincide with the centre of the exterior elevation; comparable Taylor villas sometimes resolve the same issue differently.

Direction for **centreline**:

**PLAN_LEADS**, producing an exterior **CONFLICT / COMPROMISE**.

This is the clearest current proof that one coupling label per opening is insufficient.

### DAN-CPL-04 — Library framing and windows

Fabric evidence records a major Library floor beam running north–south between window-jamb conditions, with the framing system responding to the room/opening geometry.

Relationship:

- plan room geometry;
- elevation/window jambs;
- structural floor support.

Current direction:

**MUTUAL / CONSTRUCTION-COORDINATED**

This does not mean the architectural grammar proves structure.

It means D6 must eventually allow a shared variable—such as opening/jamb position—to participate in architectural and structural obligations simultaneously.

### DAN-CPL-05 — common principal-floor height

Known principal rooms have different plan proportions but share a 16 ft height.

Relationship:

- plan families vary;
- section supplies a common datum;
- elevation expresses a coherent piano-nobile/principal floor.

Direction:

**SECTIONAL DATUM COORDINATES MULTIPLE PLAN FAMILIES**

This may prove more useful than searching for one common width:length ratio.

## 7. 76 Dean Street — vertical hierarchy without central façade symmetry

### Façade facts

- four windows wide;
- doorway second bay from right;
- first-floor fenestration receives stronger treatment;
- second window from left is wider/taller.

### Plan facts

The inspected GLC/V&A survey-state plan supports:

- double-pile arrangement;
- entrance/primary stair condition to one side;
- principal-sized front and rear rooms;
- separate secondary/service stair condition;
- different subdivision between ground and first floors.

### DS76-CPL-01 — entrance versus façade centre

- attribute: entrance centreline
- façade: even four-bay field
- entrance: off geometric centre
- plan: side entrance/stair circulation condition
- direction: **PLAN/URBAN-MORPHOLOGY LEADS**, at least at broad level
- confidence: high for off-centre condition; causal claim medium

Important result:

> A coherent Georgian façade does not require a centred entrance.

### DS76-CPL-02 — piano-nobile hierarchy

- plan/section: first floor carries stronger principal-room/stair-gallery hierarchy
- elevation: first-floor windows more architecturally emphatic
- direction: **MUTUAL at storey-hierarchy level**
- exact room/opening mapping: UNKNOWN

### DS76-CPL-03 — enlarged first-floor opening

One first-floor window is wider/taller than the others.

The historic plan suggests a large front room behind the first-floor frontage, but current evidence is insufficient to decide:

- whether the enlarged opening is centred on that room;
- whether room arrangement drove the opening;
- whether façade composition drove the room.

Direction: **UNKNOWN**.

This UNKNOWN is analytically useful.

## 8. First cross-case conclusion — coupling operates at several scales

### Whole-building scale

- principal centre;
- façade hierarchy;
- courtyard/axis;
- massing.

### Room scale

- room centre;
- opening;
- fireplace;
- door axis;
- bay.

### Component scale

- jamb;
- pier;
- sill;
- cornice;
- structural bearing.

A future grammar cannot use one generic “align” operator for all three without context.

## 9. Second conclusion — shared variables may be more useful than sequential rules

Instead of:

~~~text
PLAN creates wall
then ELEVATION creates window
then STRUCTURE checks it
~~~

some conditions may be better understood as a shared architectural variable:

~~~text
BAY / OPENING AXIS X
     ├── constrains room composition
     ├── constrains façade opening
     ├── participates in pier/jamb geometry
     └── generates structural obligations
~~~

This is conceptually closer to compilation.

It means several views are elaborations of one semantic relationship.

## 10. Third conclusion — conflict can be legitimate architecture

A system that forces all related centres to coincide may produce tidy but historically false architecture.

Danson demonstrates that:

- internal order;
- exterior order;

can conflict.

The grammar needs a way to represent **controlled disagreement**.

Possible future relation:

~~~text
COUPLING:
  preferred_alignment: ...
  actual_alignment: ...
  authority: PLAN_LEADS
  deviation: ...
  status: LICENSED / EXPECTED / WARNING
~~~

No syntax is proposed.

## 11. Fourth conclusion — elevation hierarchy may be topological information

76 Dean Street suggests an important point.

If a façade identifies a principal storey through:

- taller openings;
- richer surrounds;
- exceptional opening treatment;

then the elevation is communicating interior hierarchy.

That information should not exist only as decorative geometry.

Potential semantic relation:

> ELEVATION_EXPRESSES(HIERARCHY_ROLE)

This needs wider-corpus testing.

## 12. Fifth conclusion — section may be the mediator

Marble Hill and Danson both show section doing work that a plan/elevation pairing alone cannot explain.

Examples:

- double-height Great Room;
- common 16 ft principal-floor datum across different plan ratios;
- raised piano nobile;
- stair volume.

Therefore the project should avoid the phrase “plan/elevation coupling” when it really means a three-way relation.

D6 should formally remain:

**plan / section / elevation coupling.**

## 13. Coupling and the future user interface

If the system eventually exposes direct manipulation:

### Example — move a window

A user drags a principal window 250 mm.

The system should understand potential effects on:

- room axis;
- façade bay;
- vertical alignment;
- pier width;
- lintel/bearing;
- interior panel field;
- daylight/view;
- architectural grammar.

The useful response is not:

> collision detected.

It is closer to:

~~~text
Move exceeds current bay/room coupling envelope.

Affected:
- façade centreline relation
- room-axis relation
- upper-storey vertical alignment
- masonry pier structural obligation

Valid movement within current grammar: ...
Alternative: move room field / change bay family / license deviation.
~~~

D6 is the research that makes such feedback legitimate.

## 14. Proposed coupling-authority hierarchy

Not universal; to test.

When a conflict occurs, ask:

1. is one side fixed by law/physics?
2. is one side a high-order grammar invariant?
3. is one side merely a local preference?
4. is the relationship intentionally unresolved/contrasting?
5. can a shared variable move while preserving higher-order relationships?

This is better than:

> façade always follows plan

or:

> plan always follows façade.

## 15. D6 mutation tests

### D6-M01 — Marble Hill centre drift

Move one central principal-room/opening relation off the building's dominant centre.

Observe:

- which projection first feels incoherent?
- does the grammar need exact or bounded alignment?

### D6-M02 — Danson blind-window regularisation

Force blind-window centrelines onto an exterior-perfect grid.

Observe:

- what interior relationship is damaged?
- which coupling authority should win?

### D6-M03 — Danson make every room match one plan ratio

Preserve façade/section while forcing all principal rooms toward one aspect ratio.

Observe:

- whether room family/hierarchy becomes less coherent despite “better proportion consistency”.

### D6-M04 — 76 Dean Street centre the entrance

Move entrance to abstract façade centre.

Observe:

- effect on stair/hall;
- front-room geometry;
- bay order;
- urban morphology.

### D6-M05 — flatten piano-nobile hierarchy

Make 76 Dean Street openings identical across storeys.

Observe:

- how much vertical hierarchy disappears without changing plan topology?

## 16. D6 evidence table — current

| Case | Coupling | Direction | Confidence | Key unresolved item |
|---|---|---|---|---|
| Marble Hill | principal centre across plan/elevation/section | MUTUAL / partial | medium/high | exact opening centres |
| Marble Hill | Great Room plan ↔ section | MUTUAL | high | none for existence; exact adjacent metrics |
| Danson | canted principal rooms ↔ canted elevations | MUTUAL | high | detailed centreline map |
| Danson | blind-window existence | ELEVATION_LEADS | high | individual IDs |
| Danson | blind-window centreline | PLAN_LEADS / compromise | high | individual measured offsets |
| Danson | Library window/jamb ↔ floor framing | MUTUAL / construction-coordinated | high qualitative | measured structural geometry |
| Danson | room plans ↔ common principal height | SECTION COORDINATES | high | broader corpus |
| 76 Dean | entrance ↔ four-bay front | PLAN/URBAN MORPHOLOGY LEADS | medium/high | target-phase exact route |
| 76 Dean | first-floor hierarchy ↔ window hierarchy | MUTUAL at storey level | medium/high | exact room/opening mapping |
| 76 Dean | exceptional first-floor opening ↔ room | UNKNOWN | correct | high-resolution phase-checked plan/elevation |

## 17. D6 completion criteria

Do not mark complete until:

1. all three trial cases have phase-appropriate plan/elevation/section sources;
2. major openings have stable IDs;
3. room/opening centreline relations are measured where evidence permits;
4. storey datums are recorded;
5. coupling is recorded per relevant attribute;
6. intentional blind/solid conditions are included;
7. at least one structural coupling is mapped;
8. conflicts are recorded rather than normalised away;
9. mutation tests are performed;
10. a candidate general coupling vocabulary survives the three cases and hold-out review.

## 18. Current conclusion

D6 already supports one strong conceptual correction:

> **The future grammar should not generate a plan and then generate an elevation. It should generate shared architectural relationships from which plan, section, elevation and technical obligations are derived together.**

The precise shared variables still need to be discovered from measured evidence.

---

## Source anchors

- Historic England, Marble Hill House listing: https://historicengland.org.uk/listing/the-list/list-entry/1285673
- Historic England, Marble Hill measured-drawing archive: https://historicengland.org.uk/images-books/photos/volume/PF/MHH
- Historic England, Danson Research Report 103/2000: https://historicengland.org.uk/research/results/reports/103-2000
- Bexley/ADS searchable copy of Danson fabric research: https://www.bexley.gov.uk/sites/default/files/2022-12/the-house-and-park-at-danson-london-borough-of-bexley-the-anatomy-of-a-georgian-suburban-estate.pdf
- Historic England, Danson list entry: https://historicengland.org.uk/listing/the-list/list-entry/1064225
- Historic England, 76 Dean Street list entry: https://historicengland.org.uk/listing/the-list/list-entry/1066917
- Historic England, Early Georgian Townhouse — 76 Dean Street: https://historicengland.org.uk/campaigns/visit/walking-tours/spotter-guide-georgian-townhouse/76-dean-street/
- Historic England Archive SN00359: https://historicengland.org.uk/images-books/photos/item/SN00359
- V&A GLC survey-plan record E.371-2003: https://collections.vam.ac.uk/item/O105658/record-of-76-dean-street-print-greater-london-council/
