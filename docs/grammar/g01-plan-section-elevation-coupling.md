# G-01 Plan / Section / Elevation Coupling

Plan, section and elevation are not consecutive design stages. They are negotiated views of one architectural order.

The G-01 evidence shows that sometimes room order drives an elevation, sometimes exterior order constrains an interior condition, sometimes section carries hierarchy that plan alone cannot express, and sometimes good architecture contains a controlled disagreement between these systems.

## Coupling has direction

Useful states include:

- **mutual**;
- **plan leads**;
- **elevation leads**;
- **conflict / compromise**;
- **unknown**.

The important refinement is that direction belongs to the **attribute under comparison**, not necessarily to the whole object.

An opening may exist for façade-composition reasons while its centreline responds to a room. Conceptually:

```text
existence coupling   = ELEVATION LEADS
centreline coupling  = PLAN LEADS
width coupling       = MUTUAL
height coupling      = ELEVATION LEADS
```

That distinction is descriptive; it does not prescribe one syntax for implementation.

## What a coupling record needs to know

Where a relationship matters, useful information includes:

- case and phase;
- subject entity;
- relevant plan/elevation/section entities;
- attribute under comparison;
- coupling direction;
- confidence and evidence source;
- conflict/resolution where present;
- architectural consequence.

Potential attributes include existence, centreline, width, height, sill/head level, projection, recess, room position, wall line, stair position, storey/ceiling datum, bay and structural support line.

## Coupling is wider than plan ↔ elevation

At least six relationship families can matter.

### Plan ↔ elevation

Room centre ↔ window centre; bay ↔ wall subdivision; entrance ↔ internal route; room rank ↔ opening rank.

### Plan ↔ section

Room hierarchy ↔ ceiling height; double-height room ↔ missing upper-floor area; stair position ↔ floor opening; stacked service relationships.

### Elevation ↔ section

Storey hierarchy ↔ window height; sill/head levels ↔ floor/ceiling datums; cornice/parapet ↔ roof geometry.

### Plan ↔ structure

Room wall ↔ bearing line; opening ↔ support; bay width ↔ span.

### Elevation ↔ structure

Pier width ↔ support condition; window jamb ↔ framing/bearing; projection ↔ structural support.

### Plan / section / elevation ↔ service topology

Wet-room stack, chimney/flue mass, stair/service circulation, riser or service wing may participate in all three architectural views.

## Marble Hill — strong sectional coupling

### Principal centre

The north and south fronts are five bays wide with the centre three projecting and pedimented. The Great Room occupies the dominant central principal position and is a 24 ft cube rising through the floor above.

### MHH-CPL-01 — principal centre

- **subject:** principal block / MHH-1-GREAT;
- **attribute:** central ordering;
- **plan:** dominant central room;
- **elevation:** articulated centre-three-bay composition;
- **section:** dominant double-height/cubic volume;
- **coupling:** mutual at broad order;
- **confidence:** high for the shared architectural centre; exact coordinate coincidence remains less certain.

The evidence supports one architectural centre expressed in more than one projection. It does not justify the rule that every opening must lie on a room axis.

### MHH-CPL-02 — sectional hierarchy

- **subject:** MHH-1-GREAT;
- **attribute:** room rank;
- **plan signal:** central principal position;
- **section signal:** 24 ft height / upper-floor void;
- **coupling:** mutual;
- **consequence:** first-floor hierarchy rewrites the topology of the floor above.

This is the strongest Marble Hill coupling observation.

## Danson — explicit negotiation rather than perfect alignment

### DAN-CPL-01 — canted principal rooms / canted elevations

Dining Room, Library and Saloon incorporate canted room geometry associated with corresponding external bays.

**Coupling:** mutual at broad compositional level.

The bay is neither merely façade decoration nor merely an interior bump-out.

### DAN-CPL-02 — blind-window existence

Fabric research records blind windows that simulate ordinary openings externally while providing no ordinary spatial opening internally.

**Coupling of existence:** elevation leads.

This is why the semantic model needs a blind/simulated state rather than a simple open/closed Boolean.

### DAN-CPL-03 — blind-window centreline

The same evidence records relevant blind windows centred internally even where this puts them out of line with the centre of the exterior elevation.

**Coupling of centreline:** plan leads into a controlled conflict/compromise.

The combination of CPL-02 and CPL-03 demonstrates why one coupling label per opening is insufficient.

### DAN-CPL-04 — Library framing and window jambs

Fabric evidence describes a major Library floor beam spanning between window-jamb conditions.

The shared geometry belongs simultaneously to:

- room plan;
- opening/elevation composition;
- structural floor framing.

**Coupling:** construction-coordinated / mutual at the shared geometry.

The grammar does not prove structure. It simply recognises that one coordinate can generate both architectural and structural obligations.

### DAN-CPL-05 — common principal-floor height

Danson’s principal rooms have different plan proportions but share a 16 ft height.

**Coupling:** a sectional datum coordinates several plan families and participates in the principal-storey elevation.

That relation is architecturally stronger than any claim that the rooms need one width:length ratio.

## 76 Dean Street — vertical hierarchy without a central doorway

### DS76-CPL-01 — entrance versus façade centre

- **attribute:** entrance centreline;
- **façade:** even four-bay field;
- **entrance:** off geometric centre;
- **plan:** side entrance/stair condition;
- **coupling:** plan/urban morphology leads at broad level;
- **confidence:** high for the off-centre condition, more limited for a single causal explanation.

The architectural conclusion is secure: a coherent Georgian façade does not require a centred entrance.

### DS76-CPL-02 — principal-storey hierarchy

The first floor carries stronger principal-room/stair hierarchy and the elevation gives the corresponding storey stronger opening treatment.

**Coupling:** mutual at storey-hierarchy level.

Exact room/opening mapping remains less certain than the overall relation.

### DS76-CPL-03 — exceptional first-floor opening

One first-floor opening is wider/taller than the others. The plan suggests a large front room behind the frontage, but the evidence does not securely establish whether room geometry drives the opening, elevation composition drives the room or both negotiate.

**Coupling:** unknown.

Unknown is the correct state where the source cannot establish authority.

## Coupling operates at several scales

### Whole building

Principal centre, façade hierarchy, massing and major axes.

### Room

Room centre, opening, fireplace, door axis and bay.

### Component

Jamb, pier, sill, cornice and structural bearing.

A single generic `align` relation cannot describe all three usefully.

## Shared variables are more useful than sequential generation

A weak generative model says:

```text
PLAN creates wall
then ELEVATION creates window
then STRUCTURE checks it
```

The evidence often supports a better representation:

```text
BAY / OPENING AXIS X
     ├── constrains room composition
     ├── constrains façade opening
     ├── participates in pier/jamb geometry
     └── generates structural obligations
```

Several views can therefore descend from one semantic relationship rather than being independent drawings reconciled afterward.

## Controlled disagreement can be legitimate architecture

A system that forces every related centre to coincide may produce tidy but historically false architecture.

Danson shows that internal and external orders can conflict without either becoming arbitrary. The useful model therefore needs to preserve:

- preferred relation;
- actual relation;
- authority/direction;
- degree and consequence of deviation;
- whether the disagreement is licensed, unresolved or a failure.

The point is not to celebrate misalignment. It is to stop exact alignment from acquiring universal authority without evidence.

## Elevation can carry hierarchy, not just decoration

Where one storey or opening receives greater height, size, surround or grouping, elevation may be expressing interior architectural rank.

That relationship should not exist only as decorative geometry. It belongs to the same semantic account as the room/storey hierarchy it expresses.

## Section is often the mediator

Marble Hill and Danson both show section doing work that plan/elevation alone cannot explain:

- double-height principal room;
- common principal-floor height across different plan ratios;
- principal-storey hierarchy;
- stair volume.

The relevant subject is therefore genuinely **plan / section / elevation coupling**, not a two-view façade coordination problem.

## Implication for authoring

If a future author moves a principal window, the useful feedback is not merely “collision detected”. The change may affect:

- room axis;
- façade bay;
- vertical alignment;
- pier width;
- lintel/bearing obligation;
- interior panel field;
- daylight/view;
- selected grammar relationship.

The system should identify which authority owns each affected relation and which movements remain valid, rather than pretending plan or façade always wins.

## Evidence table

| Case | Coupling | Direction | Confidence | Remaining boundary |
|---|---|---|---|---|
| Marble Hill | principal centre across plan/elevation/section | mutual at broad order | high | exact opening-centre coordinates less certain |
| Marble Hill | Great Room plan ↔ section | mutual | high | detailed adjacent metrics separate |
| Danson | canted principal rooms ↔ canted elevations | mutual | high | detailed centreline map not essential to broad result |
| Danson | blind-window existence | elevation leads | high | occurrence-specific detail may vary |
| Danson | blind-window centreline | plan leads / compromise | high | measured offsets not required for qualitative conclusion |
| Danson | Library window/jamb ↔ floor framing | construction-coordinated / mutual | high qualitative | capacity remains outside grammar |
| Danson | room plans ↔ common principal height | section coordinates | high | wider corpus limits positive universality |
| 76 Dean | entrance ↔ four-bay front | plan/urban morphology leads | medium/high | exact historical route remains less certain |
| 76 Dean | first-floor hierarchy ↔ window hierarchy | mutual at storey level | medium/high | exact room/opening mapping less certain |
| 76 Dean | exceptional first-floor opening ↔ room | unknown | correct epistemic state | stronger phase-checked source needed for direction |

## Current G-01 consequence

The evidence supports one major framework correction:

> **Do not generate a plan and then generate an elevation. Represent shared architectural relationships from which plan, section, elevation and relevant technical obligations are derived together.**

G-01 v0.1 uses this capacity selectively. It requires coherent fields, ranked opening families, a ranked entrance, integrated upper termination and relational spatial/sectional hierarchy without imposing universal centring or one coupling direction.

See [G-01 v0.1](g01-v0.1.md), [Marble Hill — Measurement and Coupling Evidence](g01-cases/marble-hill-d5-d6-web-evidence-v02.md), [Danson — Measurement and Coupling Evidence](g01-cases/danson-d5-d6-web-evidence-v02.md) and [Validation and Limits](g01-validation.md).

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
