# G-01 Case DS76 — 76 Dean Street

**Case ID:** G01-DS76  
**Analysis role:** TRIAL — urban contrast  
**Corpus class:** early Georgian urban terraced townhouse  
**D3 status:** semantic annotation v0.1 complete with deliberately larger UNKNOWN set; D5 metrics deferred  
**Evidence grade:** B descriptive + located historic survey-plan evidence; direct plan interpretation limited to what the record image safely supports  
**Purpose:** stress-test the annotation contract against urban constraint and prevent villa-derived rules from being mistaken for universal Georgian rules.

> The value of this case is partly what it refuses to let us assume.

## 1. Source register

| ID | Source | Type | What it supports | Phase authority | Geometric authority |
|---|---|---|---|---|---|
| DS76-S01 | Historic England List entry 1066917 | authoritative descriptive record | date, architect, double-pile plan, storeys, four-bay front, doorway position, first-floor window hierarchy, principal/service stairs | high for listed fabric/history | low/medium |
| DS76-S02 | Survey of London, St Anne Soho, vols 33–34 | authoritative historical survey | historical building account and context | high | medium where measured material reproduced |
| DS76-S03 | Historic England SN00359 | historic survey record | “Details, Elevation, Plan, Section” source exists | medium/high | potentially high; image not exposed online |
| DS76-S04 | V&A E.371-2003, GLC record print | historic survey drawing / record print | ground- and first-floor plan geometry with scale bar | medium; survey state needs phase checking | high for recorded state |
| DS76-S05 | Historic England early-Georgian townhouse interpretation | contextual interpretive source | piano-nobile/storey hierarchy and changing window emphasis | contextual only | n/a |
| DS76-S06 | London historic-building photographic records | photographic survey | selected interiors / staircase / room character | medium | visual only |

## 2. Case identity

- **Building:** 76 Dean Street
- **Location:** Soho, London
- **Date:** 1732–33
- **Architect/builder attribution:** Thomas Richmond
- **Primary use:** urban terraced townhouse
- **Morphology:** double-pile terraced house
- **Storeys:** four storeys plus basement
- **Frontage:** four windows wide
- **Entrance:** second bay from right
- **Major interior feature:** principal stair compartment with illusionistic painting; separate service stair recorded
- **Urban condition:** party walls and narrow frontage constrain the plan fundamentally differently from freestanding villas

## 3. Phase frame

### DS76-P1 — original/early Georgian construction, 1732–33

Primary historical target.

### DS76-P2 — later Georgian / nineteenth-century adaptation

Potentially embodied in surviving fabric and historical surveys.

### DS76-P3 — LCC/GLC survey state

The V&A and Historic England survey material records a later surviving state.

Use for geometry only with explicit phase caution.

### DS76-P4 — modern restoration/adaptation

Not a grammar target.

### D3 consequence

Unlike Danson, we do not currently possess enough directly phase-reconciled source material to assign every room function to P1.

D3 therefore uses **geometry-neutral research IDs** where room names would be guesses.

## 4. Building-level morphology

**FACT**

- terraced;
- double-pile;
- narrow urban frontage;
- four-storey + basement vertical stack;
- four-window-wide façade;
- entrance off centre;
- principal and service stairs;
- differentiated first-floor fenestration.

**INTERPRETATION**

Urban Georgian order cannot be reduced to the freestanding-villa grammar of:

- centred doorway;
- odd bay count;
- bilateral whole-house symmetry;
- service wings outside principal block.

76 Dean Street forces hierarchy to operate under party-wall, frontage and vertical constraints.

## 5. Semantic space register

Historical room functions are kept deliberately conservative.

### Ground floor — survey-state geometry

| ID | Descriptive label | Normalised role | Hierarchy | Confidence |
|---|---|---|---|---|
| DS76-G-ENTRANCE | entrance / front hall zone | ENTRANCE / CIRCULATION-PRIMARY | H1/H2 | high geometry; phase-sensitive |
| DS76-G-FRONT | front principal-sized room | OTHER / candidate reception | H1/H2 | high geometry; use UNKNOWN |
| DS76-G-REAR | rear principal-sized room | OTHER / candidate reception | H1/H2 | high geometry; use UNKNOWN |
| DS76-G-PRIMARY-STAIR | principal stair | STAIR-PRIMARY | H1 | high existence |
| DS76-G-SERVICE-STAIR | secondary/service stair | STAIR-SERVICE | H3 | high existence from listing/survey |
| DS76-G-REAR-SMALL | small rear/side ancillary condition | OTHER / SERVICE? | H3/H4 | medium geometry; use UNKNOWN |

### First floor — survey-state geometry

| ID | Descriptive label | Normalised role | Hierarchy | Confidence |
|---|---|---|---|---|
| DS76-1-FRONT | large front room | OTHER / candidate principal reception | H0/H1 | high geometry; historical use not asserted |
| DS76-1-REAR | large rear room | OTHER | H1/H2 | high geometry; use UNKNOWN |
| DS76-1-PRIMARY-LANDING | principal stair / landing | CIRCULATION-PRIMARY | H1/H2 | high |
| DS76-1-SERVICE-STAIR | service/secondary stair | STAIR-SERVICE | H3 | high |

### Why generic labels are correct here

Calling DS76-1-FRONT a “saloon” merely because it appears architecturally privileged would contaminate the data.

The schema's UNKNOWN state is doing useful work.

## 6. Spatial topology

### Ground-floor survey-state reading

The historic survey-plan image supports a broad double-pile arrangement:

- entrance/stair circulation along one side/front zone;
- substantial front room;
- substantial rear room;
- primary stair;
- separate secondary/service stair;
- smaller rear/side ancillary condition.

Simplified, phase-qualified graph:

~~~text
STREET
  |
ENTRANCE / HALL
  |          \
FRONT ROOM   PRIMARY STAIR
  |              |
REAR ROOM    FIRST-FLOOR LANDING
                 |
           SERVICE-STAIR SYSTEM
~~~

This is deliberately schematic.

Do not infer every historic doorway from the survey reproduction without direct high-resolution source inspection.

### Vertical topology

The first floor reorganises the same constrained footprint into a more privileged front-room condition associated with the piano-nobile façade hierarchy.

This suggests **vertical change of rank inside a largely fixed urban envelope**.

## 7. Spatial hierarchy

Strong evidence exists for vertical/storey hierarchy even where room use is not known.

### First-floor privilege

Historic England's listing records:

- first-floor openings with rusticated surrounds/arches;
- one first-floor opening wider and taller, with elliptical arch;
- highly decorated stair compartment rising to first-floor gallery.

Historic England's townhouse interpretation places this within the broader early-Georgian shift toward first-floor entertaining/piano-nobile emphasis.

### D3 interpretation

Architectural hierarchy can be expressed through:

- storey;
- opening treatment;
- room size/position;
- stair arrival;

rather than a central villa room.

This is a critical urban counterexample to Marble Hill.

## 8. Ordering structure

### Façade

**FACT**

- four windows wide;
- doorway second bay from right;
- first-floor window hierarchy is non-uniform;
- second window from left is wider/taller.

### Symmetry domain

Do **not** record “asymmetric house”.

More precise:

- overall façade: ordered but not reducible to a central-door bilateral composition;
- entrance: deliberately/off-centrally located within four-bay field;
- first-floor openings: differentiated hierarchy within the façade;
- plan: constrained by party-wall/double-pile morphology;
- global bilateral symmetry: **not a useful invariant**.

### Centre

The geometric façade centre and entrance are not the same object.

This alone is enough to invalidate a naive “main entrance must occupy whole-building centre” rule.

## 9. Metric geometry — D5 state

### Known discrete geometry

- four windows/bays across principal façade;
- four storeys + basement;
- doorway in second bay from right.

### Survey plan

The V&A record print includes a scale bar.

However:

> **No D5 room dimensions are extracted from the current web reproduction.**

Reasons:

- resolution;
- phase uncertainty;
- availability of potentially better Historic England/Survey of London survey material.

D5 should use the best available drawing, not reverse-engineer precision from a convenient JPEG.

## 10. Vertical grammar

76 Dean Street is especially valuable vertically.

**FACT / CONTEXT**

- first-floor fenestration receives stronger architectural treatment;
- main stair rises into a decorated first-floor gallery condition;
- service stair remains distinct;
- townhouse tradition shifts principal entertaining emphasis through vertical hierarchy.

### D3 finding

The morphology requires a grammar that can say:

> principal architectural rank may occur **above** the entrance floor.

This is very different from a villa whose hierarchy is primarily central/planimetric.

## 11. Elevation register

High-confidence principal-front facts:

- four-window-wide stock-brick façade;
- off-centre doorway;
- first-floor openings singled out architecturally;
- one first-floor opening wider/taller than its neighbours;
- window hierarchy changes by storey.

Exact window-centre coordinates and room associations remain D6 work.

## 12. Plan / elevation coupling

### Strong known fact

Façade hierarchy is not uniform.

### Derived but deliberately limited observation

The survey plan and façade record together indicate that a large first-floor front room sits behind a façade in which one opening is unusually enlarged.

However, D3 does **not** yet assert:

- which opening corresponds to which internal axis;
- whether the enlarged opening is centred to the room;
- whether room composition drove façade variation or vice versa.

Current coupling state:

- storey-level hierarchy: MUTUAL / strong contextual evidence;
- exact first-floor opening-to-room alignment: UNKNOWN;
- entrance-to-primary-route relationship: partially supported, not metrically resolved.

## 13. Section / plan coupling

Strong at the level of **storey hierarchy**.

Unknown at detailed room-height level.

The important observation is:

- fixed urban footprint;
- changing architectural rank by floor;
- stair as vertical mediator;
- first-floor façade treatment signals internal hierarchy.

## 14. Structural reading

D3 makes no structural inference beyond:

- masonry terraced construction;
- party-wall constraints;
- double-pile morphology;
- multiple storeys.

The exact span directions, joists and support walls require survey/fabric evidence.

Status: **UNKNOWN**.

## 15. Service / occupation reading

The listing explicitly records a service stair.

### Interpretation

The urban house contains primary and service circulation **inside the same constrained envelope**, unlike a villa relying partly on detached service wings.

This is a valuable morphological contrast.

### Historical dependency warning

Service separation is partly a product of historical domestic labour organisation.

The transferable idea is differentiated route roles, not servants as a design requirement.

## 16. Social-history note

Soho townhouse occupation and entertaining practices changed across the eighteenth century.

Historic England uses 76 Dean Street to illustrate the broader emergence of first-floor/piano-nobile entertaining hierarchy.

G-01 should treat this as evidence about **vertical architectural hierarchy**, not a requirement that modern residents entertain on a prescribed floor.

## 17. Long-Life House compatibility note

Potentially transferable:

- vertical hierarchy under a constrained footprint;
- façade order without simplistic central symmetry;
- coexistence of principal/service circulation;
- strong stair architecture;
- differentiated opening hierarchy.

Potential conflict:

- narrow historic service routes may not meet contemporary accessibility/maintenance expectations;
- party-wall/urban constraints may belong to another future grammar profile rather than the Reference House's courtyard profile.

## 18. Candidate observation register

### OBS-DS76-001 — ordered façade without central doorway

**FACT:** four-bay façade; doorway second bay from right.  
**INTERPRETATION:** order does not require a central entrance.  
**HYPOTHESIS:** entrance relation must be scoped to morphology profile rather than universal.  
**TEST:** wider terrace/townhouse corpus.

### OBS-DS76-002 — vertical hierarchy

**FACT:** first-floor windows receive stronger treatment; one is wider/taller.  
**INTERPRETATION:** storey rank is expressed architecturally.  
**HYPOTHESIS:** G-01 needs PRINCIPAL_STOREY semantics independent of entrance floor.  
**TEST:** ordinary/urban corpus.

### OBS-DS76-003 — dual circulation under compression

**FACT:** principal stair and service stair coexist in double-pile terrace plan.  
**INTERPRETATION:** route differentiation is not dependent on detached service wings.  
**HYPOTHESIS:** circulation-system roles may transfer across morphology profiles.  
**TEST:** Marble Hill / Danson / urban corpus.

### OBS-DS76-004 — morphology changes the meaning of symmetry

**FACT:** narrow four-bay urban front with off-centre entrance remains recognisably ordered Georgian architecture.  
**INTERPRETATION:** villa-centred symmetry is not universal.  
**HYPOTHESIS:** symmetry must be a scoped relation over selected domains.  
**TEST:** terrace corpus and mutations.

## 19. Alteration register

| Phase | Change/state | Grammar consequence |
|---|---|---|
| P1 1732–33 | initial townhouse | primary target |
| later C18/C19 | occupation/adaptation not yet fully reconciled | survey-state plan may include changes |
| LCC/GLC survey era | recorded historic geometry | excellent geometry source, phase caution |
| modern | fire/restoration/adaptive use | exclude from P1 grammar except as evidence of survivals |

## 20. Uncertainty register

| ID | Question | Blocks |
|---|---|---|
| DS76-U01 | exact P1 ground-/first-floor doorway graph | complete D4 |
| DS76-U02 | historical room names/functions in P1 | hierarchy detail |
| DS76-U03 | direct high-resolution GLC/HE survey-plan extraction | D5 |
| DS76-U04 | exact opening-to-room centreline mapping | D6 |
| DS76-U05 | original versus later service-stair configuration | detailed topology |
| DS76-U06 | structural support/span system | structural research |

## 21. D3 verdict

**COMPLETE AT SEMANTIC v0.1 LEVEL, WITH MATERIAL UNKNOWNS.**

This is not a weakness.

D3 has demonstrated that the schema can:

- annotate an urban house without inventing room uses;
- preserve unknowns;
- distinguish morphology from style;
- identify vertical and circulation hierarchy;
- falsify villa-derived universal rules.

The remaining drawing acquisition belongs primarily to D4 completion and D5/D6 measurement/coupling analysis.

## Source anchors

- Historic England List entry: https://historicengland.org.uk/listing/the-list/list-entry/1066917
- Historic England Archive SN00359, “Details, Elevation, Plan, Section”: https://historicengland.org.uk/images-books/photos/item/SN00359
- Survey of London / British History Online, St Anne Soho: https://www.british-history.ac.uk/survey-london/vols33-4/pp228-235
- V&A, GLC record print E.371-2003: https://collections.vam.ac.uk/item/O105658/record-of-76-dean-street-print-greater-london-council/
- Historic England, Early Georgian Townhouse — 76 Dean Street: https://historicengland.org.uk/campaigns/visit/walking-tours/spotter-guide-georgian-townhouse/76-dean-street/
