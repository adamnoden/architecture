# Reference House — RH-06 Services and Failure Geography

**Status:** RH-06 design gate record / pre-MEP coordination  
**Date:** 2026-10-12  
**Question:** can every major service be traced from entry to terminal, maintenance and replacement without treating the structural floor or permanent masonry as an unplanned service void?  
**Architectural authority:** [RH-02 Ground-Floor Development](ground-floor-development.md), [RH-03 Upper Floor and Stair](upper-floor-and-stair-development.md), [RH-04 Plan / Section / Elevation Gate](plan-section-elevation-gate.md)  
**Structural authority:** [RH-05 Structural Coordination](structural-coordination.md)  
**Drawings:** [service topology overlay](service-topology-rh06.svg), [service riser section](service-riser-section-rh06.svg)  
**Crossings:** [RH-06 Crossing Register](service-crossing-register-rh06.md)

RH-06 coordinates service geography. It is **not MEP design**. Pipe sizes, fan duties, pressure losses, heat loads, cable sizing, plant capacities and product selections remain external technical work.

The gate asks a harder architectural question:

> **Can the house carry plausible services while keeping structure legible, wet/high-consequence systems concentrated, replacement routes credible and principal rooms free of primary technical infrastructure?**

The answer is yes, with one project-level deletion: the conditional principal en-suite does not earn its service burden and is removed from the active Reference House.

---

## 1. Current regulatory performance anchors

These values are used only to keep route geometry honest. They do not size equipment.

### Ventilation

For a new dwelling in England the current 2026 Approved Document F Volume 1 requires extract to outside from kitchens, utility rooms, bathrooms and sanitary accommodation. Its intermittent minimum rates are:

- kitchen with cooker hood extracting outside: **30 l/s**;
- utility: **30 l/s**;
- bathroom: **15 l/s**;
- sanitary accommodation: **6 l/s**.

For continuous extract systems the minimum high rates are 13 / 8 / 8 / 6 l/s respectively, while whole-dwelling ventilation must satisfy both the floor-area and bedroom tests. For four bedrooms the bedroom test is **37 l/s**; the floor-area test is **0.3 l/s per m² of internal floor area**.

Source: GOV.UK, *Approved Document F, Volume 1: Dwellings, 2026 edition* — https://www.gov.uk/government/publications/approved-document-f-2026

RH-06 therefore protects direct wet-room/source-capture routes but **does not select the whole-dwelling ventilation system**. RH-07 owns that decision.

### Foul drainage

Current Approved Document H remains the 2015 edition. Its normal domestic guidance supports a nominal **100 mm** branch/stack family for WC discharge and requires a foul drain carrying WC effluent to have an internal diameter of at least 100 mm. It also treats branch length, gradient, trap-seal protection, stack ventilation and access for clearing as design obligations.

Source: GOV.UK, *Drainage and waste disposal: Approved Document H* — https://www.gov.uk/government/publications/drainage-and-waste-disposal-approved-document-h

RH-06 therefore coordinates a 100 mm-class soil/vent stack envelope and short branches. Final sanitary design remains an engineer/plumber/building-control task.

---

## 2. Service-intensity map

### High service intensity

- `G-SVC-02` — utility / plant / WC / primary isolation / distribution;
- `G-KIT-02` — water, waste, source-capture extract, high electrical load, maintainable appliances;
- `U-BATH-01` — water, soil/waste, extract, waterproofing and dry-side maintainable components;
- `SV-01` — bounded vertical service zone joining the above.

### Medium service intensity

- `G-GAL-01` and `U-GAL-02` / landings — dry/small-bore distribution where justified;
- study and bedrooms — power/data plus whichever low-temperature heating distribution RH-07 eventually selects;
- entrance/stair — power, lighting, controls and distribution continuity.

### Low service intensity

Principal drawing, family and bedroom wall fields remain deliberately free of primary wet, soil, large-duct and plant routes.

The courtyard remains free of principal utility routes beneath it.

---

## 3. Ground service suite — make `G-SVC-02` real

The gross `G-SVC-02` reservation remains approximately **2.9 × 4.0 m**. RH-06 treats it as a small service suite, not one undefined cupboard.

### North service / plant room — `G-PLANT-01`

Approximate gross reservation: **2.9 × 2.2 m** at the north end of `G-SVC-02`.

It contains or provides working geography for:

- primary water isolation and distribution;
- heating/hot-water plant interfaces without fixing a technology family;
- electrical distribution / controls in a segregated dry field;
- data/communications demarcation where appropriate;
- `SV-01` riser access;
- physical service index;
- utility sink / maintenance water point if later justified.

It has:

- internal approach from `G-GAL-01`;
- a **nominal 1000 mm clear external replacement opening target** on the service-side elevation, subject to actual plant;
- a direct replacement path to the side access zone;
- a robust water-resistant floor and visible/manageable leak path rather than reliance on sensors alone;
- no dependence on ordinary kitchen cabinetry for plant access.

### South service band

The remaining approximately **2.9 × 1.8 m gross** is divided between:

- `G-UTIL-01` — laundry / cleaning / appliance utility;
- `G-WC-01` — ground sanitary accommodation;
- local storage / distribution as the final partition geometry permits.

This subdivision remains adjustable. The requirement is that utility appliances and WC remain inside the high-service geography and reach the same drainage/ventilation family without long branches.

---

## 4. Utility entry — `UE-01`

Because there is no real site, RH-06 uses the east/service side as a **surrogate utility approach**, not a permanent compass fact.

Selected virtual occurrence:

- water, electricity and communications approach along the service side;
- individual supplier-compliant penetrations are grouped geographically but **not assumed to share one sleeve**;
- entries terminate directly into `G-PLANT-01` / the adjacent dry distribution field;
- principal isolations are immediately accessible from the internal service approach;
- future excavation remains outside principal entrance/courtyard paving where practical.

The house remains mirrorable. A real site that brings utilities from the opposite side invalidates the coordinates, not the pattern.

### Rewind trigger

If real utility records require a route through a principal room, beneath the courtyard or across a protected structural node, rewind site/plan coordination. Do not preserve `UE-01` merely because this virtual house drew it east.

---

## 5. Vertical service zone — `SV-01`

The existing `RH-P014-02` occurrence is now dimensioned enough for coordinated routing.

### Location

Within the north-west part of the ground service suite / family-bathroom stack, adjacent to the internal galleries:

- approximate clear zone: **900 × 700 mm**;
- coordination position: roughly X **9.15–10.05 m**, Y **6.55–7.25 m**;
- ground access from `G-GAL-01` / `G-PLANT-01`;
- upper dry-side access from `U-GAL-02` into the bathroom service edge.

RH-05's `SV-RES` becomes the framed floor-opening reservation for this zone. Allow approximately **1050 × 850 mm structural opening envelope** as an engineering starting point for lining, fire/acoustic closure, supports and tolerance. This is **not** an approved opening size.

### Contents

The zone is deliberately bounded. It may contain, in separated/supportable sub-zones:

- one 100 mm-class soil/vent stack;
- hot/cold domestic-water risers;
- small-bore hydronic flow/return if the eventual heating system needs them;
- a segregated dry electrical/data vertical route;
- leak-visible base / inspection geography;
- spare pulling capacity only where justified.

It is **not** a generic mixed-services shaft.

### Explicit exclusion

Do **not** reserve this 900 × 700 mm zone for a future central ventilation system by pretending large ducts will simply fit later. If RH-07 selects MVHR or another whole-house system requiring major vertical ducts, it must prove a separate duct route or explicitly enlarge/rewind this reservation.

That is preferable to filling today's riser with speculative volume.

---

## 6. Foul / soil geography

### Main stack — `FS-01`

Use one 100 mm-class soil/vent stack inside the wet side of `SV-01`.

It serves:

- `U-BATH-01` directly;
- `G-WC-01` by a short branch;
- utility waste by a short branch;
- kitchen waste via the short north service-wall branch.

The stack continues vertically for ventilation unless later sanitary design justifies another compliant arrangement. Roof terminal geometry belongs to RH-08.

### Stack base and below-ground route — `FD-01`

At ground level:

- provide accessible stack-base / rodding geography inside `G-PLANT-01` or immediately adjacent;
- drop directly to below-ground drainage within the service suite;
- leave the building by the east/service-side foundation/wall zone through a designed crossing;
- reach an external inspection chamber before continuing south along the surrogate service side toward the assumed street sewer connection.

No foul drain is routed beneath the courtyard merely because it shortens a line on plan.

### Kitchen branch

The selected kitchen service edge at Y ≈ 7.4 m is immediately north of `SV-01`. Sink/dishwasher waste can therefore reach `FS-01` within roughly one to two metres without crossing principal floor structure.

### Family bathroom

The family bathroom is directly above the service suite. WC, bath/shower and basin should be arranged so the highest-consequence branch reaches `FS-01` from the service edge rather than crossing the room or multiple joists.

Final fixture layout must respect Approved Document H branch length/fall requirements rather than assuming every aesthetically convenient position is available.

---

## 7. The principal en-suite is deleted

`U-ENS-01` was conditional at RH-03. RH-06 now tests the condition.

It fails.

The en-suite sits in the north-centre field, materially west of `SV-01`. A WC/shower/basin route to the primary stack would require one or more of the following:

- an east–west gravity branch crossing the north-centre north–south floor framing;
- repeated engineered joist penetrations for a large gravity pipe;
- a lowered ceiling/service bulkhead over the garden-dining room;
- a second soil stack and new permanent roof/foundation penetrations;
- moving the primary service stack away from the main bathroom/service hub merely to serve one private convenience room.

None is proportionate.

### Decision

**Delete the en-suite from the active Reference House.**

The former `U-ENS-01` reservation becomes **`U-DRESS-01` — principal dressing / linen / storage**. It remains useful to the principal bedroom without creating wet-service infrastructure.

This is a successful House Kernel result: the service topology is allowed to say no to programme.

Reintroducing a principal en-suite later is a brief change that must come with a new route proof, not a casual partition edit.

---

## 8. Water distribution and failure response

RH-06 keeps the existing **Fail-Safe Water Distribution** strategy but applies it to actual routes.

### `WF-01` — plant / isolation geography

Inside `G-PLANT-01`:

- main stop/isolation remains immediately accessible;
- distribution joints and principal valves remain visible/reachable;
- local leak sensing may be added but is not the sole defence;
- floor/failure geometry should make a significant leak visible and manageable before it migrates into principal rooms.

No specific manifold topology is selected; the manifold candidate remains held.

### `WF-02` — riser

For pressurised water in `SV-01`:

- favour continuous or joint-minimised vertical runs;
- place branch joints at accessible ends/service walls;
- retain pipe-in-pipe / withdrawable sleeving as an implementation comparator, not a doctrine requirement;
- make leakage at the riser base visible/inspectable.

### `WF-03` — kitchen / utility

- keep joints and appliance valves on the accessible service edge;
- provide individual appliance isolation;
- washing-machine/dishwasher failure should become visible locally rather than be hidden behind permanent construction;
- avoid blanket containment systems where an accessible joint and local tray/visible discharge solve the actual failure mode.

### `WF-04` — bathroom

- locate maintainable valves, cistern/service components and selected shower controls toward `U-GAL-02` dry-side access;
- keep concealed final runs short and joint-free where practical;
- keep waterproofing independent from access-panel removal.

### `WF-05` — soil/waste

- accessible stack base / rodding;
- short branches;
- supported/tested joints;
- deliberate inspection access;
- no invented secondary containment tray around gravity drainage.

---

## 9. Kitchen source capture

The kitchen remains the north-east room and therefore has a privileged short route to outside.

### `KX-01`

Selected topology:

- hood directly over/adjacent to the final cooking position;
- short dedicated duct to the **east/service-side external wall** as the first comparator;
- no shared riser and no grease duct routed across the floor/ceiling zone;
- cleaning access and replaceable fan/hood components from the kitchen side;
- external terminal location to be checked against nuisance, openings and real-site handedness.

This route is consistent with current Part F's explicit recognition of a cooker hood extracting directly outside and protects the `HSA-P-010` source-capture intent.

If a real site makes the service-side terminal unacceptable, test the north/rear wall before accepting a long roof route.

---

## 10. Bathroom / utility / WC extract

### `BX-01` — family bathroom

The bathroom touches the east external wall.

Use a short high-level direct-to-outside extract route through that wall as the baseline. It avoids the floor structure and avoids consuming the service riser with a duct that does not need to be there.

### `UX-01` / `WX-01`

Utility and ground WC sit against or close to the same service-side elevation. Their extract routes should likewise be short and direct where the final service-suite subdivision permits it.

The exact choice between intermittent and continuous extract belongs to the whole-dwelling ventilation design. RH-06 only reserves routes capable of serving either family.

---

## 11. Whole-dwelling ventilation — deliberately not selected

RH-06 refuses to make an environmental-system choice simply to complete a services drawing.

RH-07 must compare at least:

- natural/background ventilation plus local mechanical extract;
- continuous mechanical extract;
- balanced mechanical ventilation with heat recovery where airtightness/energy/environmental modelling warrants it.

The current house geometry supports local direct extracts cleanly. It **does not yet prove a central supply/extract duct network**.

If RH-07 selects a central ducted system, that decision must show:

- plant location and replacement;
- supply/extract terminal positions;
- real duct dimensions;
- vertical route(s);
- silencers/condensate/fire-acoustic treatment;
- bedroom/living-room distribution without converting the structural joist zone into a generic duct plenum.

That may reopen RH-06.

---

## 12. Electrical and data topology

Electrical/data are intentionally separated from wet/gravity geography even where they share the same broad service flank.

### Ground dry route — `DRY-G-01`

Origin: segregated dry distribution field in `G-PLANT-01`.

Route:

- service suite → `G-GAL-01`;
- south into entrance/stair territory;
- low-level/perimeter branches to study, drawing/family rooms and kitchen;
- use removable skirting/backplane/service-wall zones only where they genuinely improve access.

No primary dry trunk is routed through the structural joist depth.

### Upper dry route — `DRY-U-01`

Origin: dry sub-zone of `SV-01`.

Route:

- `U-GAL-02` → south stair landing and north cross-landing;
- local branches into bedroom partitions/perimeter service zones;
- west bedrooms reached from the north/south landing ends rather than by crossing the open courtyard or drilling courtyard reaction nodes.

This is now a genuine **coherent horizontal service route topology**. It is not a mixed-services duct.

---

## 13. Heating / cooling distribution

RH-06 reserves **distribution geography, not a heat-source ideology**.

Current baseline:

- heating/hot-water plant interfaces live in `G-PLANT-01`;
- an external low-carbon heat-source connection may use the east/service wall if selected;
- small-bore hydronic risers may share the wet-service sub-zone of `SV-01`;
- room branches may use selected perimeter/backplane routes or a later floor strategy where justified.

RH-07 owns heat-load, overheating and passive-first system selection. RH-09/P02 own whether any accessible-floor route is physically convincing.

Do not pre-install large empty service voids simply because a future heating system might use them.

---

## 14. Structural crossing result

RH-05 protected:

- courtyard corner reaction nodes;
- four edge beams;
- stair trimmers;
- lintel/bearing zones.

RH-06 routes avoid those protected zones.

The resulting crossing family is small and explicit:

1. grouped-but-separated utility entries through the east service wall;
2. `SV-01` framed first-floor service opening;
3. foul drain exit through the east foundation/wall zone;
4. kitchen source-capture penetration through east wall;
5. bathroom/utility/WC extract penetrations through service-side walls;
6. conditional external heat-source pipework penetration if selected.

See the [RH-06 Crossing Register](service-crossing-register-rh06.md).

There is **no routine drilling through `EB-*` beams or courtyard corner reaction nodes**.

---

## 15. Pattern consequences

RH-06 creates or confirms enough geometry for these current occurrences:

- `RH-P001-02` — Controlled Utility Entry, surrogate service-side occurrence;
- `RH-P002-02` — Plant Room as Service Hub, now resolved as `G-PLANT-01` within the service suite;
- `RH-P003-02` — Coherent Horizontal Service Route, ground dry route `DRY-G-01`;
- `RH-P003-03` — Coherent Horizontal Service Route, upper dry route `DRY-U-01`;
- `RH-P004-03` — kitchen high-service wall;
- `RH-P004-04` — family-bathroom high-service wall;
- `RH-P005-07..12` — new designed crossing family in the RH-06 register;
- `RH-P010-01` — Source-Capture Kitchen Extract at `KX-01`;
- `RH-P012-02` — Physical Service Index at the internal approach to `G-PLANT-01`;
- `RH-P014-02` — Accessible Vertical Service Zone `SV-01`, now dimensioned to 900 × 700 mm clear for coordination;
- `RH-P021-01` — Source-Capture Bathroom Extract at `BX-01`.

No pattern evidence or general maturity increases merely because the Reference House uses these occurrences.

---

## 16. What remains open

RH-06 does **not** claim:

- actual plant capacity or product family;
- final heat-source selection;
- final ventilation system;
- final duct/pipe/cable sizing;
- final riser fire/acoustic compartmentation;
- final drainage invert levels or public sewer connection;
- final below-ground inspection-chamber positions;
- final rainwater/courtyard drainage — RH-08;
- final service-wall build-up / access-panel expression — RH-09;
- final whole-house environmental performance — RH-07;
- final external terminal visual treatment;
- structural adequacy of any opening.

These are bounded technical questions, not missing basic topology.

---

# RH-06 gate record

**Result:** **PASS, with deletion of the conditional principal en-suite.**

Every major current service now has a credible architectural route:

- utilities enter directly into the service hub;
- plant has internal working access and external replacement access;
- water and dry vertical distribution have a bounded accessible zone;
- the family bathroom, ground WC, utility and kitchen cluster around one foul stack;
- foul drainage exits on the service side without crossing the courtyard;
- kitchen and bathroom source capture reach outside directly;
- power/data use legible circulation-edge routes rather than the structural floor as generic void;
- significant structural crossings are registered rather than improvised;
- pressurised-water failure responses vary by route class;
- the remote en-suite is removed rather than buying convenience with permanent technical complexity.

The surviving uncertainties are system selection, engineering and detailed performance questions rather than basic service geography.

**No maturity promotion is claimed.**

**Next stage:** `RH-07 — Resolve passive-first environmental design`.

**Exact next action:** test daylight, useful sunlight, purge/cross ventilation, courtyard environmental consequences, overheating/shading and whole-dwelling ventilation families against the now-coordinated architecture and service routes. If RH-07 selects a central ducted ventilation system, explicitly rewind RH-06 to prove its duct topology.