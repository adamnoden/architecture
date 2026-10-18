<!-- nav-exclude: redirect -->
# DRW-05A — Principal longitudinal-section authority audit

**Programme:** DRW — Architectural Drawing Programme  
**Packet:** DRW-05A  
**Status:** DONE pending branch validation  
**Issue:** #154  
**Starting baseline:** `168634941b5ba163dbdc2471e0936486ec256229`

## 1. Outcome

DRW-05A freezes the publication section as a **straight north–south longitudinal cut on X = 6000 mm, looking west**, with south drawn to the left and north to the right.

The cut is deliberately identical to the existing RH-C1 coordination section centreline. It is not a new architectural section invented for publication. It is the single straight cut that best satisfies the frozen DRW-02 reader task:

> front / arrival and stair → open courtyard → garden sequence, while making the restrained ground-floor primacy and principal vertical datums inspectable.

The cut passes through, in order:

- south outer wall;
- `G-HALL-02` / the principal stair field;
- south courtyard wall and its centred major opening;
- open courtyard `C-01`;
- north courtyard wall and its centred major opening;
- `G-GARDEN-02`;
- north outer wall.

On the first floor it passes through:

- `U-STAIR-01` / south landing;
- the open courtyard;
- `U-LAND-N01` north landing;
- `U-DRESS-01` toward the north façade.

Looking west is selected because the cut itself intersects the stair's eastern/upper flight while the westward projection can retain the other two flights as beyond-line information. This allows the already-authored three-flight stair sequence to remain intelligible without a jogged section, an offset cut or a second invented stair view.

## 2. Frozen view contract

| Attribute | DRW-05A decision |
|---|---|
| view ID | `REFERENCE-HOUSE-PRINCIPAL-LONGITUDINAL-SECTION` |
| cut | straight N–S section, X = 6000 mm |
| direction | looking west |
| drawing orientation | south = left; north = right; up = increasing Z |
| scale | 1:100 |
| page class | `PLATE_SPREAD` |
| geometry source | canonical Reference House source / compiled geometry plus bounded publication-section companion facts added only by DRW-05B |
| inherited comparator | `rhc1-principal-section.svg` is coordination provenance/current generated inspection projection, not the publication artifact |
| prohibited shortcut | no tracing or coordinate copying from `principal-section-rh04.svg` / RH-C0 comparators |

The section is straight. A jogged cut would make more rooms visible but would weaken cross-registration with the paired plans and blur which relationships are truly coincident.

## 3. Why this cut earns the publication section

### 3.1 It crosses the architectural sequence rather than merely the largest rooms

At X = 6000 mm the section cuts the house's internal organising axis rather than selecting a visually convenient façade opening. It crosses the principal stair/hall, the centred court and the rear garden-dining field. The result directly explains the building's longitudinal order.

### 3.2 It makes cross-view registration simple

The same X = 6000 mm line can be placed on both controlled floor plans later, when section markers become publication-live. No hidden offset or illustrator-only geometry is required.

### 3.3 Looking west earns the stair reading

The ground-plan publication source already owns a three-flight stair topology within the south hall reservation. The current plan trace places the first two flights west of X = 6000 and the final flight on/at the cut. A westward view therefore permits a conventional cut/beyond distinction while preserving the full stair sequence.

Looking east would suppress most of the stair behind the cut and privilege the service/gallery flank, which is not the principal reader task of this section and already receives its own later service section.

## 4. Vertical authority already sufficient

The following facts are already strong enough to survive into the publication section without new architectural invention.

| Section fact | Current authority | Publication consequence |
|---|---|---|
| ground FFL | controlled ±0 | principal datum |
| ground clear ceiling | controlled +2950 mm | occupied-height datum |
| first FFL | controlled +3300 mm | floor-to-floor datum |
| upper clear ceiling | controlled +6000 mm | upper occupied-height datum |
| outer cornice / roof-edge control | provisional ≈+6250 mm | may be shown as explicitly provisional architectural control |
| floor/service zone | 350 mm between +2950 and +3300 | may be represented as a planning zone; not a member depth |
| court longitudinal extent | Y = 3400–7400 mm | exact cut void length |
| south/north wing depths | 3400 mm each | exact longitudinal massing |
| stair rise topology | 18 rises in 6/6/6 groups | stair sectional arithmetic |
| stair going | 280 mm | stair sectional arithmetic |
| derived rise | 183.333… mm | deterministic consequence of +3300 / 18 |
| intermediate landings | +1100 / +2200 mm | deterministic consequence of rise groups |
| roof topology | four low-slope fields falling outward | section roof direction |
| roof screening fall | 1:40 planning fall | deterministic roof-line slope |
| wall planning family | ≈400–425 mm; 450 mm stress | enough to bound a publication cut-wall proxy, not construction build-up |
| structural family | outer/court loadbearing inner leaves + engineered-timber floor framing | may inform truthful architectural notes; no member sizes or connections |

RH-04's old pitched-roof silhouette is provenance only. The coordinated low-slope outward-draining roof selected downstream by RH-08/RH-10 governs the publication section.

## 5. Facts that are present but must not be over-read

### Floor zone

The 350 mm inter-storey zone is architecturally controlled as the gap between the ground clear ceiling and first FFL. It is **not** a selected joist/slab depth. DRW-05B may author a publication representation rule for the zone, but it must not turn 350 mm into a structural member claim.

### Wall depth

The 400–425 mm envelope family is credible coordination geometry. The section may use the already-established plan convention of a bounded cut-body proxy, but cavity, leaf, finish and bearing detail remain outside this drawing's authority.

### Roof

The roof's direction, planning fall and outer-edge control are controlled enough to draw the roof profile. Deck thickness, insulation build-up, parapet/coping/eaves assembly and rainwater construction are not.

### Stair

The stair arithmetic and three-flight topology are controlled. Exact strings, soffits, nosings, guards, handrails, trimming and headroom construction are not. The publication section may show a planning stair profile only.

## 6. Missing publication-critical source facts — DRW-05B handoff

DRW-05A finds a small, bounded set of facts that the coordination section deliberately never needed but a native architectural section does.

### A. Section cut-body representation

The renderer needs an explicit publication-level rule for:

- outer/courtyard cut-wall body ownership at the section plane;
- the inter-storey planning zone as a cut body or bounded zone;
- the roof cut line/body representation.

This is representation geometry, not a new construction specification. It should reuse the DRW-03/04 wall-body doctrine wherever the section projection can do so honestly.

### B. Courtyard opening vertical extents

The section line passes directly through the centred south and north courtyard openings on both occupied levels. Their plan positions/widths are publication-resolved, but the canonical opening family `FAM-COURT-NS-MAJOR` still has **unknown width in RH-C1 and no sill/head geometry**. DRW-03/04 only hardened the plan cuts.

DRW-05B must author the minimum provisional vertical opening extents needed to cut these four occurrences honestly. It must not create a window/door schedule or detailed frame family.

### C. North garden opening vertical extents

At X = 6000 the section also meets the centre garden axis:

- ground: garden-dining logistics / principal garden opening;
- first: dry dressing/storage outer opening.

Their plan centres and cut widths are already bounded by the publication-plan source, but the vertical extents needed by this section are not executable. DRW-05B must add only the provisional sill/head/threshold information required by this view.

### D. Publication stair section path

The house owns the rise/going arithmetic and three-flight topology, but the exact relationship between those flights and the X = 6000 section plane currently survives partly as plan-renderer geometry rather than as reusable section source.

DRW-05B must create a bounded publication-section stair source/projection contract that:

- reuses the existing stair reservation/topology and 6/6/6 arithmetic;
- distinguishes cut flight from westward beyond flights;
- introduces no string/soffit/guard/handrail construction;
- does not change the plan footprint merely to make the section attractive.

### E. Section termination at ground

There is no real site level, foundation or ground-bearing structural design. The publication section therefore needs a controlled **graphic termination rule**, not invented foundations. DRW-05B should explicitly choose a local datum/truncation convention around ground FFL and forbid foundation/terrain claims.

## 7. Facts explicitly not required by this section

DRW-05B must not harden these merely because sections commonly contain them:

- foundations, footings, piles or ground-bearing slab build-up;
- real-site topography or external approach levels;
- final engineered joist/member sizes or bearings;
- wall cavity/leaf construction detail;
- insulation, airtightness or fire-stopping build-ups;
- roof deck/insulation/coping/gutter construction;
- window/door frame/reveal/threshold construction;
- handrails, balustrades, newel/string details or stair finish build-up;
- services, ducts or pipes;
- structural reinforcement, lintels or connections;
- product-specific materials.

The principal section is architectural evidence, not a pseudo-construction section.

## 8. Publication content earned by the current authority

Once DRW-05B closes the five bounded gaps above, DRW-05C/D may legitimately draw:

- cut outer/court walls and floor/roof planning bodies;
- the open court and two occupied storeys;
- the three-flight stair as cut + beyond planning geometry;
- the centred court openings and north garden openings crossed by the cut;
- ground, first, ceiling and roof-control levels;
- the restrained ground-floor > upper-floor hierarchy;
- court and longitudinal dimensions needed for cross-checking;
- room/zone labels and restrained beyond lines;
- a section marker that registers exactly to X = 6000 on both controlled plans.

They may not imply the technical facts excluded above.

## 9. DRW-05B handoff

DRW-05B should harden **only**:

1. publication section body/termination representation rules;
2. vertical extents for the four N/S courtyard openings crossed by the cut;
3. vertical extents for the ground and upper centre garden openings crossed by the cut;
4. the bounded reusable planning stair-section path/cut-vs-beyond relation.

If those facts can be expressed as provisional publication companion source without changing the Reference House morphology, no architectural rewind is required.

If hardening them instead exposes a contradiction in the house, DRW-05B must split the smallest corrective packet rather than hide it in renderer code.
