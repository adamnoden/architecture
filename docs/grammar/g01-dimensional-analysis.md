# G-01 Dimensional and Proportional Analysis — D5 Seed v0.1

**Status:** preliminary evidence table; D5 not complete  
**Purpose:** extract raw dimensions and derived relationships from the G-01 trial cases without prematurely converting them into grammar rules.  
**Dependency:** D3 semantic annotation v0.1 complete.  
**Rule status:** no G-01 dimensional or proportional rule is promoted here.

> **Measure first. Name the family second. Decide whether it matters last.**

## 1. Why D5 exists

The architectural-grammar work began with an intuition that proportion might be one of the strongest programmable parts of architecture.

The historical/computational research already warned against beginning with a universal ratio.

D5 now tests that warning against actual buildings.

The immediate questions are:

- what raw dimensions can be supported by reliable sources?
- which room roles use which dimensional families?
- how do width, length and height interact?
- do repeated ratios occur?
- are exact ratios more stable than hierarchy/topology?
- what changes when one storey shares a common height across rooms of different plans?
- which apparent ratios survive phase/source scrutiny?

D5 is intentionally empirical.

## 2. Measurement discipline

Every value must preserve:

- case;
- entity ID;
- source ID;
- raw value;
- unit;
- whether directly stated, measured from drawing or derived;
- phase;
- uncertainty;
- derivation.

Do not:

- round a measured dimension towards a canonical ratio;
- infer missing dimensions from a low-resolution web image when a better measured source exists;
- silently combine different historical phases;
- turn one building's elegant numbers into a style law.

### Evidence classes for D5

**D — DIRECTLY STATED**  
Dimension stated by an authoritative source.

**M — MEASURED**  
Dimension taken from a sufficiently reliable scaled drawing.

**R — DERIVED RATIO**  
Computed from D or M values.

**U — UNKNOWN / NOT YET EXTRACTED**

At v0.1, most usable figures are D.

## 3. Current raw dataset

### Marble Hill House

| Entity | Role | Width | Length | Height | Evidence | Phase note |
|---|---|---:|---:|---:|---|---|
| MHH-1-GREAT | dominant principal reception | 24 ft | 24 ft | 24 ft | D — Historic England listing describes a 24 ft cube | authoritative listed/restored architectural condition |

Derived:

- plan length:width = **1.000**
- width:height = **1.000**
- length:height = **1.000**

No other Marble Hill room is yet admitted to the D5 dataset.

There are many measured drawings in the Historic England archive, but D5 should use them only after phase reconciliation.

### Danson House

Source: Historic England fabric/conservation research.

| Entity | Role | Width | Length | Height | Evidence | Notes |
|---|---|---:|---:|---:|---|---|
| DAN-P-ENTRANCE | entrance/principal hall | 20 ft | 26 ft 8 in | 16 ft | D | report identifies plan as 4:3 |
| DAN-P-LIBRARY | principal library | 18 ft | 36 ft | 16 ft | D | 2:1 plan |
| DAN-P-DINING | principal dining | 18 ft | 36 ft | 16 ft | D | 2:1 plan |
| DAN-P-SALOON | dominant garden-front saloon | 26 ft | 26 ft | 16 ft | D | octagonal/canted form; 26 × 26 principal measure |

Additional direct values:

- standard principal-floor wall thickness: **2 ft 6 in**;
- three long side-bay facets: **9 ft** each;
- internal ellipse of side bay: approximately **4:3** long:short diameter;
- principal-floor room height: **16 ft throughout**.

### 76 Dean Street

Current D5 state: **U**.

Known discrete count/order data:

- four-window-wide front;
- four storeys plus basement;
- entrance in second bay from right;
- first-floor fenestration differentiated in size/treatment.

The historic GLC/V&A plan reproduction includes a scale bar, but no room dimensions are admitted at v0.1 because:

- the currently inspected web reproduction is not the preferred metric source;
- target-phase reconciliation remains incomplete;
- Historic England survey material may offer a higher-authority extraction route.

This is deliberate evidence discipline, not missing effort.

## 4. Derived Danson ratios

### Entrance Hall

Raw:

- 26 ft 8 in × 20 ft × 16 ft high.

Derived:

- length:width ≈ **1.333 : 1**
- width:height = **1.250 : 1**
- length:height ≈ **1.667 : 1**

The report itself identifies the plan proportion as 4:3.

### Library

Raw:

- 36 ft × 18 ft × 16 ft high.

Derived:

- length:width = **2.000 : 1**
- width:height = **1.125 : 1**
- length:height = **2.250 : 1**

### Dining Room

Same stated dimensions as Library:

- length:width = **2.000 : 1**
- width:height = **1.125 : 1**
- length:height = **2.250 : 1**

### Saloon

Using the stated 26 ft × 26 ft principal measure and 16 ft height:

- plan principal-axis ratio = **1.000 : 1**
- principal width:height = **1.625 : 1**

The room is octagonal/canted, so the 1:1 figure is a bounding/principal-axis relation, not a claim that the experienced room is a simple square prism.

## 5. First empirical result — one house already needs several proportion families

Danson's principal floor contains at least:

- 4:3;
- 2:1;
- 1:1 / octagonal;
- approximately 4:3 ellipse geometry in side bays;

while retaining a common 16 ft room height.

Therefore a future grammar cannot plausibly say:

> principal Georgian room = ratio X.

A more credible representation is:

~~~text
ROOM ROLE
   +
GEOMETRIC FAMILY
   +
DIMENSIONAL BAND
   +
SECTIONAL DATUM
   +
RELATION TO ADJACENT ROOMS
~~~

The actual family may still use historically recurrent preferred ratios.

The ratio is one variable in a larger relation.

## 6. Second empirical result — common height creates unity across different plans

At Danson, the principal rooms share a 16 ft height despite major variation in plan.

This matters.

The rooms do not need the same width:length ratio to belong to one architectural level.

A shared sectional datum can provide coherence while plan families vary.

That suggests D5 must analyse:

- within-room proportion;
- cross-room dimensional hierarchy;
- shared storey/ceiling datums;

separately.

## 7. Third empirical result — hierarchy does not map monotonically to “better ratio”

Compare two current dominant spaces:

### Marble Hill Great Room

- 24 ft cube;
- central;
- double height;
- H0.

### Danson Saloon

- 26 × 26 ft principal plan measure;
- 16 ft high;
- octagonal/canted;
- H0/H1;
- terminal/central garden-front room in principal circuit.

Both use square-like principal plan geometry.

But their volumetric proportions are very different.

The architectural hierarchy is created through:

- location;
- sequence;
- section;
- openings;
- room form;
- decoration/use;

not a single volumetric ratio.

## 8. Fourth empirical result — exactness needs source context

The apparently clean historical numbers at Danson are unusually valuable because the research report explicitly discusses proportioning and foot measures.

That does **not** justify assuming every Georgian house was dimensioned to equally exact canonical ratios.

D5 must record:

- whether the source gives a dimension directly;
- whether the original construction appears intended to that dimension;
- whether later plaster/lining changes affect clear room size;
- whether a ratio is exact, approximate or reconstructed.

The distinction between **design module** and **measured finished room** may eventually matter.

## 9. Proposed D5 data model

This is a research table, not a software schema.

Each measured entity should eventually carry:

~~~text
entity
phase
role
geometry_family
width_raw
length_raw
height_raw
source
measurement_method
uncertainty
derived_ratios
nearest_historical_family
distance_from_family
hierarchy_rank
shared_datum_group
notes
~~~

### Why “nearest historical family” is downstream

First preserve:

> measured ratio = 1.47

Then separately compute:

> nearest named family = 1.50

Do not rewrite 1.47 as “3:2”.

## 10. Named proportion families — analysis vocabulary only

Potential comparison families:

- 1:1
- 4:3
- √2:1
- 3:2
- 5:3
- 2:1

These are not G-01 preferences yet.

They are reference points for analysing the corpus because they are historically/theoretically relevant and computationally easy to compare.

D5 should also allow **no meaningful named family**.

## 11. Absolute dimension matters

A ratio cannot carry room quality alone.

A 2:1 room might be:

- 6 × 12 ft;
- 18 × 36 ft;
- 30 × 60 ft.

These are architecturally different despite identical ratios.

Therefore every future rule must be capable of considering:

- absolute width;
- absolute length;
- area;
- height;
- role/use;
- furniture/occupation envelope;
- adjacent hierarchy.

## 12. Room form matters

The Danson Saloon demonstrates another trap.

“26 × 26” does not mean “square room” in the same sense as Marble Hill's cubic Great Room.

One is octagonal/canted.

Future dimensional analysis should distinguish:

- rectangular bounding dimensions;
- effective principal axes;
- polygonal/curved room family;
- bay/recess geometry;
- clear usable rectangle where relevant.

## 13. Cross-room relations to extract next

D5 should not stop at room aspect ratio.

For each floor/case, extract where evidence permits:

- principal-room area / secondary-room area;
- principal-room width / secondary-room width;
- ceiling-height ratio across storeys;
- centre bay / flank bay widths;
- opening height / room height;
- opening width / wall field;
- pier width / opening width;
- stair width / circulation width;
- principal-route width hierarchy;
- moulding datum / room height;
- façade storey heights.

These are more likely to reveal architectural hierarchy than one isolated room ratio.

## 14. Current cross-case table

| Case | Entity | Plan family | Height relation | Architectural rank | Current evidence |
|---|---|---|---|---|---|
| Marble Hill | Great Room | 1:1 | 1:1 cube; double-height consequence | H0 | direct |
| Danson | Entrance Hall | 4:3 | h < width < length | H1 | direct |
| Danson | Library | 2:1 | h slightly < width | H1 | direct |
| Danson | Dining Room | 2:1 | h slightly < width | H1 | direct |
| Danson | Saloon | square principal axes / octagonal | h substantially < width | H0/H1 | direct |
| 76 Dean Street | first-floor front room | UNKNOWN | UNKNOWN | candidate H0/H1 | geometry known qualitatively; metrics withheld |

Even this tiny dataset argues for plural families.

It does not yet justify statistical claims.

## 15. What D5 must not do

- no golden-ratio hunting;
- no “Palladio says 2:1, therefore rule”;
- no averaging three rooms into a target ratio;
- no metric extraction from low-resolution screenshots when better source drawings exist;
- no mixing clear dimensions and structural-grid dimensions silently;
- no treating restored measurements as original without phase evidence;
- no converting correlation into aesthetic judgement.

## 16. D5 completion criteria

D5 should not be marked complete until:

1. the three D3 trial cases have their best available phase-appropriate metric sources inspected;
2. raw dimensions are extracted with source IDs;
3. uncertainty is recorded;
4. room width:length:height is available for a meaningful subset;
5. major bay/opening dimensions are available for D6;
6. hierarchy ranks are linked without assuming causality;
7. named proportion-family distances are computed;
8. results include counterexamples/non-family dimensions;
9. raw measurements remain recoverable from every derived ratio;
10. no G-01 rule is promoted merely from frequency.

## 17. Immediate D5 work

Priority:

1. Marble Hill — extract target-phase room dimensions from the best measured sheets; reconcile with restoration state.
2. Danson — attach direct drawing/source references to the already-stated dimensions and extend to opening/bay geometry.
3. 76 Dean Street — obtain the highest-resolution historic survey plan before metric extraction.
4. Build one comparable dataset before expanding corpus size.

## 18. Current conclusion

The first measured evidence supports the project's earlier theoretical position:

> **proportion is likely to work as a family of admissible relationships embedded inside hierarchy, topology and section—not as the generator of the house.**

But D5 is deliberately too small to lock any family or tolerance band.

---

## Source anchors

- Historic England, Marble Hill House listing: https://historicengland.org.uk/listing/the-list/list-entry/1285673
- Historic England, Marble Hill measured-drawing archive: https://historicengland.org.uk/images-books/photos/volume/PF/MHH
- Historic England, Danson Research Report 103/2000: https://historicengland.org.uk/research/results/reports/103-2000
- Bexley/ADS searchable copy of Danson fabric research: https://www.bexley.gov.uk/sites/default/files/2022-12/the-house-and-park-at-danson-london-borough-of-bexley-the-anatomy-of-a-georgian-suburban-estate.pdf
- Historic England, 76 Dean Street listing: https://historicengland.org.uk/listing/the-list/list-entry/1066917
- Historic England Archive, 76 Dean Street SN00359: https://historicengland.org.uk/images-books/photos/item/SN00359
- V&A GLC survey-plan record E.371-2003: https://collections.vam.ac.uk/item/O105658/record-of-76-dean-street-print-greater-london-council/
