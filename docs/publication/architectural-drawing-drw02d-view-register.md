<!-- nav-exclude: redirect -->
# DRW-02D — Final publication view register

**Programme:** DRW — Architectural Drawing Programme  
**Packet:** DRW-02D  
**Status:** DONE pending branch validation  
**Issue:** #154  
**Starting baseline:** `5e729e98028b3bca481bf8a6a4846fbb80312a11`

## 1. Purpose

Freeze the drawing set that the publication is actually trying to produce before plate sequencing or implementation begins.

DRW-02A established the minimum views needed to make Part IV's architectural claims inspectable. DRW-02B tested whether Parts I–III genuinely need additional architectural drawings. DRW-02C then removed detail-scale candidates whose graphic precision would outrun present technical authority.

DRW-02D combines those results into one target register. Every candidate is assigned:

- publication priority: `ESSENTIAL`, `SUPPORTING`, `OPTIONAL` or `DELETE`;
- the reader task that earns or fails to earn it;
- source authority;
- intended print scale / scale band;
- page class under the frozen DRW-01 doctrine;
- later execution owner.

The governing rule is:

> **A publication view exists because it does work for the reader, not because a complete drawing set would normally contain it.**

This packet does **not** harden source geometry, implement the publication renderer, draw a plate, replace an active figure, sequence pages, or introduce reader-facing figure numbers.

## 2. Classification meanings

### `ESSENTIAL`

Removing the view would leave a central architectural claim or already-valid reader task materially unproved, or would make another retained drawing carry a task it cannot perform honestly.

### `SUPPORTING`

The view adds real non-duplicative architectural evidence, but the book could survive without it if the corresponding claim were softened or consolidated. It remains a current target, but later implementation may still expose a disproportionate cost that requires an explicit register revision.

### `OPTIONAL`

The view has no unique claim-proof obligation. It may improve synthesis or comprehension after the ordinary architecture is already legible. It does not receive a guaranteed plate merely because it is visually powerful.

### `DELETE`

The candidate is not a current publication target. It is redundant, has a poor claim-to-view ratio, would manufacture technical certainty, or is superseded by a stronger instrument.

`DELETE` is a register decision, not necessarily an immediate file deletion. The six inherited Reference House schematics remain temporarily active until their successors satisfy the DRW-00D replacement contract.

## 3. Scale and page-class rules carried into the register

DRW-01C requires controlled architectural orthographics to use the approved scale family and states that DRW-02 freezes the exact intended scale for retained views.

The register therefore uses:

- `1:200` for synthetic setting / broad external-maintenance geography;
- `1:100` for ordinary whole-house plans, sections, elevations, roof and analytical readings;
- `1:50` only for the bounded courtyard architectural reading where enlargement serves the reader without entering construction-detail territory;
- `NTS` only for the five abstract doctrine figures and the optional synthesis axonometric, which are not controlled orthographic construction drawings.

Analytical overlays inherit the exact scale of their canonical substrate. Paper-space line weights and type sizes do not shrink with geometry.

Page classes are those frozen by DRW-01D and physically exercised by DRW-01E. `PLATE_PAIR` means two complete facing plates; `PLATE_SPREAD` means one continuous composition with the 12 mm-per-side critical fold exclusion.

## 4. Frozen register — Parts I–III abstract instruments

DRW-02B found no reason to pull whole-house architecture forward before Part IV. The five figures retained by DRW-00D remain the correct instruments for their general claims.

| View / figure | Class | Reader task | Source authority | Scale | Page class | Later owner |
|---|---|---|---|---|---|---|
| Selective permanence / platform | **ESSENTIAL** | Distinguish slow permanent fabric, interfaces and faster replaceable layers. | manuscript doctrine + current retained abstract figure role | NTS | `FLOW` | DRW-11E normalisation only if earned |
| Designed interface functions | **ESSENTIAL** | Separate support, restraint, movement, sealing and access duties. | manuscript doctrine + current retained abstract figure role | NTS | `FLOW` | DRW-11E |
| Failure architecture sequence | **ESSENTIAL** | Explain defence → detection → harmless consequence → recovery as one causal sequence. | manuscript doctrine + current retained abstract figure role | NTS | `FLOW` | DRW-11E |
| Maintenance geography route | **ESSENTIAL** | Explain approach, working space, disconnection clearance and withdrawal as one transferable task geometry. | manuscript doctrine + current retained abstract figure role | NTS | `FLOW` | DRW-11E |
| Pattern fields + generative sequence | **ESSENTIAL** | Distinguish pattern fields from one generative service-topology sequence. | pattern/publication architecture + current retained abstract figure role | NTS | `FLOW` | DRW-11E |

These remain abstract on purpose. Later house drawings complement them; they do not automatically replace them.

## 5. Frozen register — Reference House base architecture

### 5.1 Essential conventional substrate

| View | Class | Reader task | Primary source authority | Scale | Page class | Execution owner |
|---|---|---|---|---|---|---|
| Ground-floor plan | **ESSENTIAL** | Programme, court morphology, arrival, service flank, maintenance approach and future-adaptation substrate. | `model-baseline-rhc0.md`; executable Reference House source; compiled plan state; RH-02/RH-03 coordination | `1:100` | `PLATE_PAIR` with first floor | DRW-03 |
| First-floor plan | **ESSENTIAL** | Bedroom/landing/gallery order, bathroom/service alignment and the consequence of deleting the remote en-suite. | same controlled source/compiled plan state; RH-03/RH-06 | `1:100` | `PLATE_PAIR` with ground floor | DRW-04 |
| Principal longitudinal section | **ESSENTIAL** | Front → arrival/stair → court → garden sequence; restrained ground-floor primacy; principal vertical datums and floor-zone relation. | controlled source/derived section geometry; RH-04; later coordinated structural/envelope facts only where owned | `1:100` | `PLATE_SPREAD` | DRW-05 |
| Principal front elevation | **ESSENTIAL** | Four-bay order, off-centre entrance, opening hierarchy and stair-window consequence. | RH-04 + controlled cross-view opening geometry | `1:100` | `PLATE_SINGLE` | DRW-06 |
| Roof / drainage plan | **ESSENTIAL** | Four outward-falling roof fields, watersheds, external collection, courtyard water route and visible failure topology. | RH-08 + coordinated roof/boundary source | `1:100` | `PLATE_PAIR` with roof-water/failure reading | DRW-07 |
| Synthetic setting / type plan | **ESSENTIAL** | Make type, service flank, detached surrogate condition, external working strips and site contingency legible without pretending to be a real site plan. | controlled house geometry + `external-access-maintenance-plan.md`; synthetic/site-conditional authority only | `1:200` | `PLATE_PAIR` with external-maintenance reading | DRW-08 |
| Service / transverse section | **ESSENTIAL** | Prove vertical service-zone, stacked high-service geography, dry-side access relation and bounded service capacity at architectural rather than MEP-detail scale. | RH-06; `vertical-bay-coordination.md`; compiled service/plan relationships | `1:100` | `PLATE_SINGLE` | DRW-08 |

### Why the principal section is a spread

At `1:100` the building itself consumes roughly 108–120 mm in its long direction before external context, dimensions, level markers and plate-safe annotation are added. DRW-01E proved a 128 mm B5 drawing frame. For the section, compressing all of the longitudinal architectural task into that width would leave almost no paper-space reserve and would encourage annotation loss.

The section therefore earns a true `PLATE_SPREAD` at `1:100`. Continuous architecture may cross the binding; unique levels, labels, dimensions and semantic events must stay outside the 12 mm-per-side critical fold exclusion.

## 6. Frozen register — secondary orthographic architecture

These views resolve the proof burden created by specific architectural claims without pretending every façade deserves equal ceremonial treatment.

| View | Class | Reader task | Primary source authority | Scale | Page class | Execution owner |
|---|---|---|---|---|---|---|
| Garden elevation | **SUPPORTING** | Show the three-field rear order, principal garden threshold and refusal of an undifferentiated glazed wall while preserving masonry piers. | `outer-elevation-coordination-rh10.md` + controlled room/opening relationships | `1:100` | `PLATE_SINGLE` | DRW-08 |
| Service-side elevation | **SUPPORTING** | Show grouped technical expression, plant replacement opening, room-owned fields, terminals/downpipes as subordinate architecture and service-side asymmetry. | RH-06/RH-08/RH-10 outer-elevation coordination | `1:100` | `PLATE_SINGLE` | DRW-08 |
| Courtyard architectural elevation | **SUPPORTING** | Show that the inner court has its own order and scale rather than inheriting the principal façade grid; support its reading as an external room. | RH-04 courtyard order + controlled court/opening geometry | `1:50` | `PLATE_SINGLE` | DRW-08 |
| West elevation | **DELETE** | The only distinctive claim is that the west side remains quiet and room-owned. That fact is source-controlled but does not purchase a dedicated publication plate. | RH-10 records the quiet two-room-field order | — | — | none unless later claim set changes |

The west-elevation deletion is deliberate. RH-10 has already resolved that elevation at architectural-coordination level, so no knowledge is lost. The publication simply declines to spend a plate proving a narrow fact that can remain bounded in prose and is consistent with the retained plans/opening order.

## 7. Frozen register — analytical readings over canonical geometry

The analytical drawings do not create parallel house geometries. They reuse the exact controlled substrate and alter only the semantic reading.

| View | Class | Reader task | Source authority | Scale | Page class | Execution owner |
|---|---|---|---|---|---|---|
| Structural / span overlay | **ESSENTIAL** | Make short-span ring, permanent support lines, edge-beam interruptions and structural opening constraints inspectable without implying engineering completion. | compiled RH-C2 structural topology + `structural-coordination.md`; base plan source | `1:100` | `PLATE_SINGLE` | DRW-10 |
| Service / maintenance overlay — ground | **ESSENTIAL** | Show service flank, plant/utility geography, primary isolation/approach, wet-route concentration and protected principal rooms. | compiled RH-C3 service relationships + RH-06; ground-plan substrate | `1:100` | `PLATE_PAIR` with upper service reading | DRW-10 |
| Service / maintenance overlay — first | **ESSENTIAL** | Show bathroom/riser/dry-gallery relation, wet concentration, absence of remote en-suite infrastructure and protected principal rooms. | compiled RH-C3 service relationships + RH-06; first-plan substrate | `1:100` | `PLATE_PAIR` with ground service reading | DRW-10 |
| External-maintenance / setting overlay | **ESSENTIAL** | Show approach, working, support and withdrawal geography around façades, plant, roof edges and courtyard, including landscape/access constraints at surrogate-setting level. | `external-access-maintenance-plan.md` + RH-08/RH-10 task geography; synthetic-setting substrate | `1:200` | `PLATE_PAIR` with synthetic setting/type plan | DRW-10 |
| Roof-water / failure overlay | **ESSENTIAL** | Show collection, overflow, outward failure visibility, courtyard consequence and inspection geography on the actual roof/water substrate. | RH-08 roof/water authority + compiled boundary/service occurrences | `1:100` | `PLATE_PAIR` with roof/drainage plan | DRW-10 |
| Entrance-storey future-adaptation overlay | **SUPPORTING** | Show the west/rear family-room sleeping option, substantially step-free route and potential sanitary/shower geography under loss of stair use. | controlled ground-plan geometry + bounded M4(2)-informed comparator recorded in Part IV claim map | `1:100` | `PLATE_SINGLE` | DRW-10 |

The service overlays intentionally stop at architectural geography. They do not acquire pseudo-pipes, pseudo-ducts, fictional valve layouts or product clearances merely to look technical.

The adaptation overlay is retained as `SUPPORTING`, not `ESSENTIAL`, because it demonstrates an important human consequence of the architecture but is not required to establish the core House Kernel system proposition. If later page pressure forces a cut, the correct response is to soften the corresponding future-adaptation prose rather than distort another analytical plate to carry it.

## 8. Optional synthesis view

| View | Class | Reader task | Source authority | Scale | Page class | Execution owner |
|---|---|---|---|---|---|---|
| Sectional axonometric | **OPTIONAL** | Give one synthetic comprehension view of court, permanent structure, service geography and replaceable layers after those facts have already been established orthographically. | must derive from the same controlled source / compiled state as retained orthographics; no independent illustrator geometry | NTS synthesis projection | `PLATE_SPREAD` if admitted | DRW-09 |

DRW-02A established that no unique Part IV claim requires this drawing. It therefore receives no guaranteed publication plate.

DRW-09 must re-test it after the ordinary orthographics exist. It is admitted only if one source-controlled axonometric materially improves comprehension without becoming a hero image whose justification was invented after the fact.

`NTS` here is not a scale-management escape hatch. The axonometric is an explicitly non-orthographic synthesis projection; its underlying geometry remains controlled.

## 9. Current detail candidates — deleted from the active target register

DRW-02C established that the project currently owns **zero** resolved construction-style details suitable for publication as selected architecture.

| Candidate | Register class | Reason / re-entry condition |
|---|---|---|
| Permanent opening / replaceable frame | **DELETE — CURRENT REGISTER** | Highest-value deferred detail, but jamb/head/sill, fixing/release, boundary performance and prototype/product authority are not yet sufficient. May re-enter DRW-11 only if the authority changes. |
| Service wall / riser / dry-side-access construction detail | **DELETE AS DETAIL** | Reader task survives in the service/transverse section and plan overlays at spatial authority. No pseudo-MEP assembly detail. |
| Movement / tolerance junction | **DELETE — CURRENT REGISTER** | Prototype comparison remains pre-test and the actual movement envelope/selected family is unresolved. |
| Controlled attachment / replaceable lining | **DELETE — CURRENT REGISTER** | Physical quality, selection, fixing/load, tolerance and reinstatement questions remain unresolved; conventional construction may win. |
| Project-specific structural penetration / boundary closure | **DELETE — CURRENT REGISTER** | Coordinated crossing occurrences may be shown on retained drawings; technical closure remains competent downstream design. |
| Threshold / wet-failure construction detail | **DELETE — CURRENT REGISTER** | No selected non-duplicative assembly currently earns a standalone detail; failure logic is clearer in retained abstract + house-specific water drawings. |

A later DRW-11 detail is a new evidence decision, not an automatic resurrection of this queue.

## 10. Inherited Reference House schematics — successor mapping

DRW-00D marked all six current Part IV schematics `REPLACE`. DRW-02D can now identify their successor instruments precisely.

| Current schematic reader task | Final register successor | Final disposition of old schematic |
|---|---|---|
| Reference House type / orientation | synthetic setting/type plan + paired floor plans | **DELETE WHEN SUCCESSOR LIVE** |
| Spatial / sectional order | paired floor plans + principal longitudinal section | **DELETE WHEN SUCCESSOR LIVE** |
| Structural / assembly logic | principal section + structural/span overlay | **DELETE WHEN SUCCESSOR LIVE** |
| Service / maintenance geography | paired plans + service/transverse section + paired service overlays | **DELETE WHEN SUCCESSOR LIVE** |
| External maintenance geography | synthetic setting/type plan + roof/elevation substrate + external-maintenance overlay | **DELETE WHEN SUCCESSOR LIVE** |
| Water / failure geography | roof/drainage plan + roof-water/failure overlay + relevant plan/section substrate | **DELETE WHEN SUCCESSOR LIVE** |

The old files are not removed by DRW-02D. DRW-00D requires atomic replacement only after a controlled successor is generated, placed, captioned and validated.

## 11. Register totals

Counting actual target views rather than legacy placeholders:

- **ESSENTIAL:** 17
  - 5 abstract doctrine figures;
  - 7 conventional Reference House views;
  - 5 analytical readings.
- **SUPPORTING:** 4
  - garden elevation;
  - service-side elevation;
  - courtyard architectural elevation;
  - entrance-storey future-adaptation overlay.
- **OPTIONAL:** 1
  - sectional axonometric.
- **DELETE from active target:**
  - dedicated west elevation;
  - 6 current construction-detail candidates;
  - 6 inherited Reference House schematics once their controlled successors are live.

The apparently high essential count is not a return to drawing-set completeness. Five are early-book abstractions already proved to have distinct general reader tasks, and several Part IV analytical entries are paired readings of the same canonical geometry rather than additional building models.

## 12. Reader-facing identity / numbering

DRW-02D creates **no new public figure-reference family**.

- legacy `D-F*` remains retired;
- compiler/source drawing IDs remain lineage metadata where useful internally;
- human titles and captions own ordinary reader identity;
- if later sequencing demonstrates that numbered cross-reference materially helps the reader, the new family must first enter `project/nomenclature.ts` with an explicit PUB-NOM class/surface contract.

Do not invent `A-01`, `F01`, `DRW-01` or similar reader-facing labels merely because the register is now frozen.

## 13. Implementation consequences

The register now gives later vertical packets a bounded target.

### DRW-03 / 04

Produce one canonical `1:100` paired-plan family. Analytical overlays later reuse those exact plan substrates rather than reconstructing rooms independently.

### DRW-05

Produce the principal section as one canonical `1:100` spread composition with deterministic left/right crops and gutter-safe semantic placement.

### DRW-06

Produce the principal front elevation first. It establishes the outer-elevation publication grammar before secondary elevations are attempted.

### DRW-07

Produce one canonical `1:100` roof/drainage substrate capable of receiving the later failure reading without changing geometry.

### DRW-08

Own the synthetic setting/type plan, service/transverse section and the three supporting secondary architectural views. It does **not** owe a west elevation merely for completeness.

### DRW-09

The sectional axonometric is conditional. The packet may legitimately conclude `DELETE` if it adds spectacle rather than comprehension.

### DRW-10

Reuse canonical source projections for every overlay. This is also the mandatory PUB-NOM integrated re-entry gate.

### DRW-11

Re-audit the five retained abstract figures under the frozen graphic doctrine and re-test detail authority against whatever evidence exists then. Current detail deletion remains controlling until explicitly superseded.

## 14. Fail-closed conditions carried forward

A later packet must stop or reopen this register rather than silently drift when any of the following occurs:

- a retained view cannot fit at its frozen scale/page class while preserving DRW-01 paper-space tokens;
- source hardening shows that the stated reader task depends on geometry that is not controlled;
- a supporting claim disappears or becomes duplicative enough that its view no longer earns a page;
- an optional synthesis view begins acquiring unique factual content absent from the orthographics;
- a deleted detail is needed only because another drawing was designed too schematically;
- an overlay requires invented technical geometry to make its argument;
- a new figure-number family appears without PUB-NOM registration;
- a legacy Reference House schematic is removed before its successor covers the reader task atomically.

A concrete implementation defect may reopen scale/page class. Aesthetic preference alone may not.

## 15. DRW-02D conclusion

The publication target is now neither a sparse essay with proxy schematics nor a pseudo-construction set.

It is a controlled architectural monograph structure:

1. five abstract figures carry the general doctrine where abstraction is the honest instrument;
2. a compact ordinary architectural substrate makes the Reference House inspectable;
3. analytical readings reuse that same geometry to expose structure, services, maintenance, failure and adaptation;
4. secondary elevations survive only where they add architectural knowledge;
5. one synthesis axonometric remains optional rather than pre-ordained;
6. unresolved construction detail remains absent until evidence earns it.

The strongest editorial consequence is the dedicated west-elevation deletion. The strongest technical consequence is that serviceability will be shown at **spatial authority**, not purchased with false assembly detail.

## 16. Handoff

**Next authorised packet after green closeout: DRW-02E — freeze the initial plate sequence and book rhythm using this register.**

DRW-02E owns order, facing relationships, deliberate blanks and the cadence between prose and plates. It must not revise view priority merely to make pagination convenient; if sequencing exposes a real conflict, reopen DRW-02D explicitly.

No renderer implementation, architectural source hardening or public figure replacement has begun in DRW-02D.