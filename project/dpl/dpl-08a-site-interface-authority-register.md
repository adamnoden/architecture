# DPL-08A — Site-Interface Authority and Package Register

**Issue:** [#358 — DPL-08A — site-interface authority and package register](https://github.com/adamnoden/architecture/issues/358)  
**Programme:** [#299 — DPL — deployment, jurisdiction and real-site integration programme](https://github.com/adamnoden/architecture/issues/299)  
**Authorised by:** [#356 — DPL-WA Wave A integration and DRW rendezvous](https://github.com/adamnoden/architecture/issues/356)  
**Baseline `main`:** `8314fbaba52d6a4451ee14947bcce440ee1d78d8`  
**Reference Site:** `DPL-RS-01`  
**Status:** site-interface authority/package contract; **not** foundation, drainage, utility, landscape or construction-detail design

## Question

> **What does the controlled Reference House hand to the site, what must the site/evidence provide back, which interface package owns the response, and when does that response cease to be site adaptation and become a Reference House revision?**

DPL-08A freezes that boundary before any downstream site package is designed.

It does not attempt to make the Reference Site compile green.

---

# 1. Result

The house/site boundary can be divided cleanly into **six** controlled interface packages:

1. `SI-P01 — Ground / Foundation Support`
2. `SI-P02 — Datum / Plinth / Accessible Approach`
3. `SI-P03 — Foul / Surface Water / Site Water`
4. `SI-P04 — Utility Approach / External Plant`
5. `SI-P05 — Construction / Maintenance / Landscape`
6. `SI-P06 — Context / Environmental Mitigation`

The first five were anticipated by DPL-WA. The sixth is retained because DPL-02 explicitly licenses bounded site-specific solar, privacy and noise mitigation outside protected architectural order. Hiding that freedom inside “landscape” would blur architectural/environmental authority.

The governing interface rule is:

> **A site-interface package owns the response between a controlled building-side handoff and evidenced site conditions. It does not own the facts, the external rules, the specialist proof or the protected architecture on either side.**

Conceptually:

```text
REFERENCE HOUSE AUTHORITY
        ↓
BUILDING-SIDE HANDOFF
        ↓
SITE-INTERFACE PACKAGE
        ↑
SITE CLAIMS + EVIDENCE
        ↑
TARGET / CONSENT / SPECIALIST OBLIGATIONS
        ↓
CONDITIONAL OR DESIGNED RESPONSE
        ↓
CONFORMANCE TEST
        ├── inside DPL-02 freedom → candidate may proceed
        └── crosses protected order → Reference House rewind or incompatibility
```

There is no generic `siteInterfaceSolved = true` state.

Each package matures independently and inherits DPL-03/DPL-04 assurance semantics.

---

# 2. Authority hierarchy recovered

DPL-08A does not derive authority from whichever drawing is easiest to measure.

The relevant hierarchy is:

1. **Ovid's House architectural doctrine** — general propositions;
2. **Reference House gate authority** — current authored house;
3. **DPL-02 conformance contract** — what deployment may and may not change;
4. **DPL-07 Reference Site / later real site manifests** — site claims and explicit unknowns;
5. **DPL-09 / DPL-10 / DPL-11** — external regulatory, planning and non-planning obligation/evidence families;
6. **competent specialist / third-party design or determination** — where the issue cannot be proved natively;
7. **DPL-08 package response** — the designed or conditional interface between the above.

A publication drawing, coordination diagram or surrogate setting may evidence an already-authorised relation. It does not create architectural/site authority by itself.

---

# 3. DPL-02 boundary carried forward

DPL-02 defines site-interface freedom as a bounded land/building relationship whose exact physical solution necessarily depends on real site evidence.

It already licenses:

- foundation / ground response;
- absolute datum and external-level transition;
- utility approach outside protected internal service geography;
- foul and surface-water discharge beyond controlled building-side points;
- principal approach / external access / landscape integration;
- site-specific solar / privacy / noise mitigation outside protected order.

It does **not** license deployment-side changes to protected shell/court geometry, room topology, stair topology, principal architectural orders, concentrated service topology, roof/water topology or other protected Reference House decisions.

The governing consequence remains:

> **If the site interface cannot be solved without changing protected architecture, the interface packet stops. The candidate either requires an explicit upstream Reference House revision or becomes incompatible with that site.**

DPL-08 is not an architectural mutation licence.

---

# 4. Interface object model

Every later site-interface package should be able to state the following without ambiguity.

## 4.1 `buildingHandoff`

A condition already controlled by the Reference House.

Examples:

- protected load-path / masonry support geography;
- ground-floor relative datum;
- principal entrance / threshold occurrence and internal one-level topology;
- foul drain building exit geography;
- roof downpipe / courtyard-water exit geography;
- utility/service-entry destination;
- external plant/service working geography;
- maintenance/logistics duties.

A handoff may be a point, zone, datum, route class, duty or protected relationship. It need not be one coordinate.

## 4.2 `siteInputs`

Claims about the actual or synthetic site needed to design/evaluate the interface.

Examples:

- levels;
- ground/geotechnical evidence;
- tree geometry;
- groundwater;
- sewer records;
- utility connection points/capacity;
- legal/working boundary model;
- access rights;
- neighbour geometry;
- road/highway conditions;
- acoustic/environmental evidence.

These remain DPL-06 site claims/evidence. The package consumes them; it does not rewrite them.

## 4.3 `externalObligations`

Applicable requirements, policies, consents or professional-evidence duties coming from DPL-09/10/11 target/evidence families.

Examples:

- structural/site-preparation obligations;
- accessible approach requirement;
- drainage requirements;
- planning flood/amenity/character questions;
- sewer undertaker approval;
- utility-provider constraints;
- Party Wall/process questions;
- legal route/access evidence;
- specialist geotechnical/acoustic/arboricultural determination.

The package may orchestrate these obligations but never changes their authority class.

## 4.4 `response`

The actual or conditional site-interface solution.

At DPL-08A this remains a class of response, not a construction detail.

Examples:

- competent foundation family selected later from ground evidence;
- grading/retaining/approach strategy;
- external foul/surface route;
- utility route from provider point to controlled entry geography;
- ASHP placement/screening response;
- temporary-access/maintenance geography;
- external shading/privacy/acoustic measure.

## 4.5 `specialistBoundary`

The point at which DPL records a question/evidence requirement and a competent external method owns adequacy.

Typical owners include:

- structural/geotechnical engineer;
- drainage engineer/designer;
- utility/sewer undertaker;
- MEP/acoustic professional;
- arboriculturist;
- access/highway/temporary-works designer;
- solicitor/conveyancer/Party Wall surveyor where legal/process determination is needed;
- planning professional/decision authority for judgement-dependent planning matters.

## 4.6 `rewindTrigger`

A condition showing that the response has left DPL-02's site-interface freedom.

A rewind trigger is not automatically a defect in the house. It means:

```text
site interface cannot remain local
        ↓
current deployment candidate is non-conforming / unresolved
        ↓
Reference House owning gate must explicitly reconsider the protected decision
        OR
site is rejected for current Reference House revision
```

---

# 5. `SI-P01 — Ground / Foundation Support`

## Purpose

Connect the protected structural/load-path proposition to actual ground without pretending that the architectural model has already designed foundations.

## Controlled building-side handoff

The current Reference House supplies:

- a 12.0 × 10.8 m controlled outer mass and 3.6 × 4.0 m courtyard;
- permanent outer and courtyard masonry support lines intended to do useful loadbearing work;
- short-span first-floor/roof structural logic between those permanent lines;
- inner loadbearing masonry leaf as the current first structural comparator;
- no whole-house frame, room-shaping column grid or gratuitous long-transfer strategy;
- protected internal relative levels / sectional hierarchy;
- a requirement that site response not create hidden architectural consequences above.

The current technical coordination explicitly proves **no foundation type, depth, capacity, bearing or robustness strategy**.

Therefore the building-side handoff is the protected superstructure/load-path geography and its loads **as later engineered**, not a drawn strip footing.

## Site inputs consumed

At minimum where applicable:

- authoritative working boundary / adjacent-building geometry;
- topography / levels;
- soil/geology and intrusive geotechnical evidence;
- groundwater;
- contamination / ground-gas / aggressive ground evidence;
- trees / root-related evidence;
- adjacent foundations/structures where relevant;
- sewer / utility apparatus conflicting with foundation zones;
- slope/stability conditions;
- site access / temporary works conditions where they constrain constructability.

DPL-RS-01 deliberately leaves most of these unknown.

## External obligations / evidence

Potential consumers include:

- DPL-09 structural/site-preparation/material obligations;
- DPL-11 geotechnical/environmental evidence;
- DPL-11 Party Wall / adjoining-owner process where geometry triggers it;
- DPL-11 sewer/utility constraints;
- planning conditions/evidence only where the planning target actually creates them.

## Response class

Permitted later responses include ordinary shallow foundation families, piled/deeper systems, local ground improvement or other competent engineered support **provided** they preserve the protected architectural load-path concept and do not create material above-ground architectural consequences.

DPL-08A does not select among them.

## Specialist boundary

Foundation capacity, settlement, reinforcement/member sizing, ground improvement, retaining design and construction method remain competent structural/geotechnical engineering.

## Rewind triggers

Examples include a ground response requiring:

- material change to outer/courtyard support geography;
- intrusive columns / transfer structure;
- materially raised or split internal floor architecture;
- major retaining structure that becomes part of the architectural composition;
- foundation/service conflict that can only be solved by moving protected rooms/service topology;
- another architectural consequence outside RH-SI01.

A difficult foundation is not itself incompatibility if a competent conformance-preserving response exists.

## DRW boundary

DPL-08A creates no foundation detail authority.

Any future section showing foundations must distinguish:

- controlled architectural support lines;
- conditional/schematic site response;
- externally engineered construction geometry.

---

# 6. `SI-P02 — Datum / Plinth / Accessible Approach`

## Purpose

Connect protected internal relative levels and envelope duties to actual street/garden/topography without turning the house into a split-level object or inventing an all-purpose perimeter detail.

## Controlled building-side handoff

The Reference House supplies:

- ground FFL `±0` as a **relative internal datum**;
- first FFL +3300 mm and protected sectional hierarchy above it;
- one-level entrance-storey topology;
- intended step-free internal ground floor;
- principal entrance / threshold occurrence `TH-02` requiring a substantially level, weathered and replaceable threshold while preserving entrance hierarchy;
- permanent envelope air / thermal / moisture duties independent of removable trim;
- wall-base inspection / moisture-management requirement;
- maintenance-ground requirements around selected external positions.

The house does **not** fix its absolute elevation on a real site.

## Site inputs consumed

- authoritative topographical survey / street and garden levels;
- working boundary / highway relation;
- approach route length and gradient potential;
- drainage / surface-water geometry near thresholds;
- groundwater / ground conditions where relevant;
- retaining constraints;
- external material/landscape conditions;
- neighbour / highway / tree constraints affecting grading;
- target-selected accessibility requirements.

## Important separation

The current maintenance authority explicitly rejects one universal `perimeter dry zone` solution.

Wall-base drying, drainage, inspection and temporary maintenance-support territory are different functions. They may share geometry only where technically compatible.

Therefore DPL-08B must not begin with:

```text
house perimeter = gravel trench
```

or another single inherited detail.

It must begin with duties.

## Response class

Later work may design:

- absolute house datum;
- grading and local retaining;
- step-free principal approach;
- threshold external level/drainage relation;
- wall-base moisture/splashback strategy;
- local hardstanding / maintenance-support positions;
- garden / terrace transitions.

These remain site-conditioned while the internal relative-level architecture stays protected.

## Specialist boundary

Final accessible-gradient/landing geometry, drainage, waterproofing/moisture, retaining and ground-bearing adequacy require the appropriate technical evidence/design.

## Rewind triggers

- site can only be resolved by creating a materially different split-level internal house;
- principal entrance order must move materially;
- required retaining/grading becomes a major architectural intervention incompatible with the controlled house;
- accessible approach cannot be achieved by a credible conformance-preserving route and the applicable target requires it;
- threshold/wall-base solution requires material envelope/order changes outside implementation freedom.

## Reference Site consequence

DPL-RS-01's broad 240 mm fall over 30 m and provisional RH datum are enough to exercise the package later. They are not technical evidence that an accessible/weathered plinth solution passes.

## DRW boundary

Until DPL-08B and technical authority exist, DRW may show controlled FFL/ground relations only at the level already earned. It should not freeze a construction-complete plinth, threshold drainage or retaining detail.

---

# 7. `SI-P03 — Foul / Surface Water / Site Water`

## Purpose

Connect the Reference House's deliberate building-side water/failure geography to an actual lawful, maintainable site discharge strategy.

## Controlled building-side handoffs

### Foul — `FD-01`

Current RH-06 topology provides:

- one principal 100 mm-class soil/vent stack `FS-01` inside the service geography;
- accessible stack-base / rodding geography in or adjacent to `G-PLANT-01`;
- below-ground drop within the service suite;
- building exit through the service-side foundation/wall zone;
- external inspection chamber before the route continues into the site.

The historical virtual continuation toward an assumed street sewer is **surrogate geography**, not a real-site right or discharge proof.

### Outer roof water — `RW-OUT-01`

RH-08 provides:

- four outward-draining roof fields;
- open/inspectable external collection edges;
- four side/rear-return downpipe families `RWP-SW / SE / NW / NE`;
- visible outward overflow behaviour;
- downpipe termination at accessible gullies / inspection points.

RH-08 explicitly does **not** select a buried perimeter ring drain or final discharge destination.

### Courtyard water — `RW-COURT-01`

RH-08 provides:

- courtyard catchment separated from primary roof catchment;
- accessible east/service-side collector;
- one short, straight, joint-minimised gravity route beneath service/circulation geography to an external service-side inspection point;
- independent higher-level emergency overflow discharging visibly to the service side before occupied thresholds become the failure weir.

Final receiving surface, pipe sizing, inlet level and hydraulic adequacy remain technical design.

## Site inputs consumed

- sewer/drain location, ownership, depth/diameter/material where known;
- statutory undertaker identity / constraints;
- site levels / outfall levels;
- infiltration/percolation evidence;
- groundwater;
- flood/surface-water evidence;
- available lawful discharge destinations;
- watercourse/attenuation requirements where applicable;
- title/easement/right-of-route evidence;
- tree / ground / foundation conflicts;
- maintenance/inspection access.

## External obligations / evidence

Potentially distinct families include:

- DPL-09 Part H and other technical drainage obligations;
- DPL-10 flood/drainage planning obligations;
- DPL-11 undertaker/build-near/diversion/rights evidence;
- environmental/riparian/other external permissions where actually applicable;
- competent hydraulic/drainage design.

One status must never stand in for all of them.

## Response class

Later DPL-08C may select/coordinate:

- foul route from the controlled external inspection point;
- sewer connection/diversion interface;
- surface-water infiltration / attenuation / watercourse / sewer route as lawfully/technically justified;
- inspection chambers/access;
- external overflow receiving geometry;
- local site grading needed to keep failure visible and away from vulnerable fabric.

## Rewind triggers

- final site solution would require converting the roof to internal drainage;
- new primary inner-courtyard gutter/outlet becomes necessary;
- foul or high-consequence drainage must cross protected principal rooms/courtyard contrary to controlled topology;
- site water management materially rewrites internal thresholds / principal geometry rather than remaining an interface;
- no lawful/technical discharge route remains after admissible alternatives are tested.

## DRW boundary

DPL-08A confirms building-side water exit/failure points as legitimate source authority.

It does not author final below-ground site-drainage geometry or a construction detail for gullies, threshold drains, attenuation or infiltration.

---

# 8. `SI-P04 — Utility Approach / External Plant`

## Purpose

Connect real provider/network infrastructure and external plant conditions to the protected service geography without routing infrastructure through principal architecture merely because the site approaches from the wrong side.

## Controlled building-side handoffs

### Utility entry — `UE-01`

RH-06 supplies:

- water, electricity and communications grouped **geographically** at the service/plant side while retaining supplier-compliant separate penetrations where required;
- termination directly into `G-PLANT-01` / adjacent dry distribution field;
- immediately accessible primary isolations;
- protected concentrated service geography inside the house.

The east-side approach in the virtual house is explicitly a **surrogate**, not a compass commitment. Whole-house mirroring and rigid rotation remain permitted deployment variants.

### Plant replacement

`G-PLANT-01` supplies:

- approximately 2.9 × 2.2 m gross equipment-room geography;
- internal working approach;
- nominal 1000 mm external replacement-opening target;
- replacement route toward the service-side field.

Final product packing remains specialist MEP work.

### External heat source — `ASHP-01 / PEN-HS-01`

RH-10 selects an air-to-water heat-pump family as the working baseline and creates:

- provisional external unit geography beside the plant/service field;
- bounded local building crossing for flow/return, electrical/control and condensate/service duties;
- a requirement that the unit remain serviceable and not consume the sole useful side passage;
- real-site acoustic, airflow, neighbour/boundary and terminal checks.

The exact unit location is not protected identity.

## Site inputs consumed

Per service/provider:

- network/operator identity;
- apparatus location;
- actual connection point;
- available capacity / accepted offer where due;
- route geometry;
- route rights/easements/wayleaves where needed;
- diversion/reinforcement requirements;
- site levels / crossings;
- boundary and neighbour conditions;
- construction access;
- ASHP acoustic/airflow context;
- relevant utility/sewer conflicts.

A desktop utility map is not a connection offer, and a physical route is not proof of legal entitlement.

## External obligations / evidence

- DPL-09 applicable technical/electrical/energy obligations;
- DPL-10 planning energy/noise/amenity/appearance obligations where applicable;
- DPL-11 provider capacity / route-right / wayleave / utility evidence;
- competent MEP/acoustic design;
- provider/undertaker acceptance where required.

## Response class

Later DPL-08D may coordinate:

- provider point → external site route → controlled entry geography;
- bounded external chambers/meters/cabinets where required;
- external heat-source placement and removable acoustic/screening treatment;
- external plant replacement route;
- local penetrations/crossings while preserving envelope duties.

## Rewind triggers

- only feasible utility route crosses a principal room, courtyard or protected structural node;
- service geography must be materially relocated independently of the coherent whole-house variant;
- external plant can only fit by destroying all credible maintenance/access geography;
- provider/plant requirements materially rewrite protected façade/opening/room order;
- no admissible connection route/right/capacity exists for the selected system after alternatives are exhausted.

## DRW boundary

Existing analytical service-side objects may remain represented at their current authority.

DPL-08A does not freeze meter boxes, trenches, exact external ASHP position, service duct banks or penetration construction details for publication.

---

# 9. `SI-P05 — Construction / Maintenance / Landscape`

## Purpose

Ensure that a house which fits geometrically can also be built, maintained and renewed without quietly relying on unavailable neighbour/highway land or allowing later landscape to destroy the maintenance strategy.

## Controlled building-side handoffs

The Reference House already protects:

- east/service-side plant, utility, façade and roof-access territory;
- representative west façade/roof-edge access positions;
- rear working line;
- garden-to-courtyard maintenance logistics route;
- courtyard tower working position;
- external courtyard-drain / overflow inspection points;
- external plant replacement route;
- ordinary external scaffold/tower access as the primary roof-maintenance strategy;
- no permanent roof hatch in the current baseline;
- approximately 1200 mm coordination target at the controlling courtyard-logistics opening where the door family can provide it.

The exact site access method remains site-specific.

## Site inputs consumed

- controlled/working boundaries;
- street/highway width and restrictions;
- site entrance dimensions;
- delivery/crane/pump/scaffold/tower possibilities;
- neighbour access / oversail / licence evidence;
- hardstanding / ground bearing / chambers;
- tree/landscape constraints;
- permanent stores/screens/fences/gates;
- external plant footprint;
- construction sequencing constraints;
- future maintenance route rights;
- waste/material handling conditions.

## Important authority separation

For every critical route distinguish:

```text
PHYSICAL SPACE EXISTS
        ≠
GROUND / TEMPORARY WORKS CAN SUPPORT THE METHOD
        ≠
LEGAL RIGHT / HIGHWAY PERMISSION EXISTS
        ≠
CONTRACTOR METHOD HAS BEEN DESIGNED
```

The compiler must not turn the first statement into the remaining three.

## Response class

Later DPL-08E may coordinate:

- site entrance and material route;
- temporary access/support territories;
- removable versus protected landscape zones;
- external plant/landscape coexistence;
- future façade/roof/window/plant replacement methods at architectural-planning level;
- neighbour/highway dependencies as explicit external obligations rather than hidden assumptions.

## Rewind / incompatibility triggers

- no credible construction route exists without materially changing protected house geometry;
- all credible façade/roof/plant maintenance positions depend on rights that do not exist/cannot be obtained;
- site arrangement makes courtyard or major component replacement impossible without demolition of protected permanent fabric;
- a required external plant / parking / landscape condition necessarily consumes the sole protected service/maintenance geography with no alternative;
- site constraints turn ordinary maintenance into avoidably specialist work in conflict with protected RH-PROT-14 and no conformance-preserving solution remains.

## DRW boundary

DRW may depict analytical maintenance territory already earned by RH-08/10.

It must not convert DPL-08A's package register into invented scaffold foundations, retaining details, legal access lines or permanent landscape geometry.

---

# 10. `SI-P06 — Context / Environmental Mitigation`

## Purpose

Own bounded real-site environmental/context responses that DPL-02 explicitly permits **outside protected architectural order**.

This package prevents solar, privacy and noise responses from being smuggled either into arbitrary façade mutation or into an undefined “landscape” bucket.

## Controlled building-side handoffs

The Reference House supplies:

- shallow occupied bands / passive-first environmental hierarchy;
- room-specific glazing rather than generic maximisation;
- openable purge distinct from whole-house ventilation;
- protected front/courtyard/outer-elevation order and primary opening duties;
- principal rooms retaining outer-façade daylight responsibility;
- selected concentrated service / ASHP geography subject to real-site acoustic checks;
- no default mechanical-cooling rescue strategy;
- G-01 / tectonic requirements applying to visible architectural interventions.

## Site inputs consumed

- cardinal orientation after rigid placement/mirroring;
- neighbour masses and authoritative window geometry where due;
- shading/sky exposure;
- noise sources / acoustic evidence;
- privacy/overlooking context;
- air-quality / pollution context where material;
- trees/landscape;
- planning character/heritage/context evidence;
- ASHP and ventilation terminal relationship to neighbours/openings.

## Response class

Potential later responses include:

- external shading devices or landscape shading;
- screens / boundary treatment;
- acoustic screening around external plant;
- local landscape/planting response;
- orientation/handing selection from already permitted variants;
- product-level glazing/acoustic/shading choices within protected opening duties.

## Specialist / planning boundary

Solar/daylight/overheating/acoustic performance and qualitative planning context remain external modelling/judgement where not covered by a bounded native method.

A mitigation can be physically plausible yet planning-unacceptable, or planning-acceptable yet acoustically inadequate. Keep those statuses separate.

## Rewind triggers

- mitigation requires deleting/relocating protected primary openings;
- front/courtyard/outer-elevation order must be materially rewritten;
- passive hierarchy can only be rescued by making mechanical cooling the baseline;
- ASHP/service topology must move through protected domestic order rather than remain a site-conditioned placement;
- context can be satisfied only by a material architectural change outside permitted mirror/rotation/site-interface freedom.

## Downstream ownership

`SI-P06` should initially travel with DPL-08E because many responses are external landscape/access/screening conditions.

If actual analysis shows solar/privacy/noise response has enough independent architectural/technical complexity, split it rather than overloading DPL-08E.

---

# 11. Cross-package conditions

Several site facts cannot be owned by one package.

## 11.1 Trees

A tree may affect:

- `SI-P01` foundation/ground response;
- `SI-P02` levels/approach;
- `SI-P05` construction/maintenance route;
- `SI-P06` shade/privacy/landscape;
- DPL-10 planning policy/designation;
- DPL-11 arboricultural evidence.

One tree claim must therefore be referenced by several obligations, not copied into six incompatible facts.

## 11.2 Boundary geometry

A boundary model may affect all six packages.

Its authority must remain explicit:

`GENERAL_TITLE_EXTENT`, `SURVEY_WORKING_LINE`, `DETERMINED_BOUNDARY` or another declared status.

No package may upgrade a general title-plan line into precise legal geometry merely because its calculation needs a number.

## 11.3 External levels

Levels influence foundations, access, drainage and temporary works.

The same survey/source identity should be consumed by each package; the resulting obligations remain separate.

## 11.4 Sewers / utilities

One apparatus corridor can affect foundation design, drainage routing, utility access, construction sequence and planning evidence.

Again the source fact is shared; authority/results do not collapse.

## 11.5 Neighbours

Neighbour geometry/rights can affect planning amenity, Party Wall, construction access, maintenance, solar/privacy/noise and external plant.

A planning judgement does not grant legal access to neighbour land.

---

# 12. Package state and evidence rules

DPL-08A does not create new truth statuses.

Each package inherits DPL-03/DPL-04 semantics.

A useful packet summary may include:

```text
package: SI-P03
assuranceProfile: FEASIBILITY
buildingHandoff: controlled
siteInputs: partially known
blocking obligations:
  sewer ownership/depth       EVIDENCE_REQUIRED
  infiltration suitability    UNKNOWN
  external route right        EVIDENCE_REQUIRED
response: CONDITIONAL
conformance: not yet disproved
```

Do not translate that into “70% solved”.

Likewise:

```text
package: SI-P01
candidate foundation response: X
engineering evidence: FAIL
alternative admissible response: not yet evaluated
```

is **not** proof that the site is incompatible.

DPL-03 route-exhaustion semantics continue to govern the top-level result.

---

# 13. Reference Site replay at authority level

DPL-RS-01 is sufficient to exercise package **shape**, but deliberately insufficient to close most packages technically.

## `SI-P01`

Known synthetic site geometry plus one mature tree create useful friction.

Ground, groundwater, adjacent foundation and geotechnical evidence remain unknown.

**Authority result:** package is meaningful; technical response unresolved.

## `SI-P02`

The 240 mm broad site fall and provisional house datum allow future grading/approach work to be tested.

Exact topo/threshold/drainage/retaining evidence is not proven.

**Authority result:** package is meaningful; no accessible-plinth verdict yet.

## `SI-P03`

Building-side foul/roof/courtyard handoffs exist.

Real sewer ownership/level, infiltration, groundwater, flood and final discharge conditions remain unknown.

**Authority result:** correct unresolved state; do not invent a sewer route.

## `SI-P04`

The 3.0 m synthetic technical/service-side field gives plausible working geography.

Actual provider points, capacities, route rights and ASHP acoustic/boundary evidence remain unknown.

**Authority result:** package is spatially exercisable; no connection/acoustic proof.

## `SI-P05`

The 3.0 m service side, 2.4 m principal side, 14.0 m rear garden and courtyard route provide a plausible maintenance/logistics test bed.

Ground bearing, gates, highway/third-party permissions and real construction method remain unresolved.

**Authority result:** credible synthetic geography; not construction/maintenance approval.

## `SI-P06`

The north-street / south-garden orientation, approximate neighbour masses and mature tree are enough to create context questions.

Neighbour windows, real noise, planning character, shading models and acoustic evidence remain unknown.

**Authority result:** package exists without forcing invented mitigation.

The Reference Site therefore survives DPL-08A unchanged.

---

# 14. DRW / publication boundary

DPL-WA froze the rule:

> **DPL-08 and DRW-11 may proceed laterally, but neither programme may invent the other's authority.**

DPL-08A sharpens that rule.

## DRW may represent now

Where already controlled by Reference House authority:

- protected internal/relative datums;
- controlled water collection / building-side exit/failure geography;
- utility/service-side destination geography;
- maintenance territories/routes at their current analytical authority;
- external plant as provisional/analytical geometry where the owning source already permits it;
- explicit unknown / conditional site conditions.

## DRW may not infer from DPL-08A alone

- foundation type or depth;
- exact ground-bearing slab / footing / pile construction;
- finished external levels and retaining construction;
- construction-complete threshold/plinth detail;
- exact below-ground foul/surface routes beyond controlled handoffs;
- actual sewer/utility apparatus;
- exact meters/chambers/trenches;
- permanent scaffold/temporary-works foundations;
- legal boundary/access rights;
- final ASHP acoustic screen/location;
- final landscape/shading/privacy construction.

If a future publication detail requires those, it must wait for the owning DPL-08/technical packet or depict the uncertainty honestly.

DPL-08 likewise gains no publication-detail authority merely by defining a package.

---

# 15. Downstream packet ownership

The DPL-WA decomposition survives authority recovery with one refinement: explicit `SI-P06` context/environment duty.

## DPL-08B — ground / datum / plinth / accessible approach

Own primarily:

- `SI-P01`;
- `SI-P02`.

Split foundation engineering from architectural ground/threshold work if the packet exposes independent proof burdens.

## DPL-08C — foul / surface water / site water

Own:

- `SI-P03`.

Keep regulatory, planning and undertaker statuses separate.

## DPL-08D — utilities / external plant

Own:

- `SI-P04`.

Do not confuse provider availability with internal service topology.

## DPL-08E — construction / maintenance / landscape / bounded context response

Own initially:

- `SI-P05`;
- external/landscape-facing parts of `SI-P06`.

Split `SI-P06` if environmental/context analysis becomes a separate architectural packet.

## DPL-08F — Reference Site integration / adversarial closeout

Replay all packages against DPL-RS-01 with explicit synthetic assumptions/unknowns, then attack:

- architectural mutation pressure;
- authority collapse;
- hidden neighbour/right assumptions;
- hidden site-cleanliness assumptions;
- unsupported DRW detail;
- fake package-completion claims.

DPL-08B→F remain **held** after DPL-08A unless a later programme gate explicitly authorises them.

---

# 16. Machine-readable representation decision

**Do not add one in DPL-08A.**

Reason:

- the stable authority object is the six-package contract;
- DPL-09A / DPL-10A still need to freeze executable source/status spines;
- DPL-14A still needs to freeze real-plot screening inputs;
- DPL-12 is explicitly held until these B1 packets exist.

Creating `SiteInterfacePackage` types now would encourage DPL-12 architecture to harden around a first prose pass rather than around four independently tested concrete object families.

The correct DPL-08A output is therefore this controlled backstage authority register only.

---

# 17. Anti-patterns frozen by DPL-08A

Do not:

- treat the site interface as a metre-wide physical strip around the house;
- create one universal plinth/perimeter-drainage detail before site evidence;
- let a package own the external law/policy/evidence it consumes;
- promote a title-plan red line into exact buildable geometry;
- assume a utility shown on a map is available/capable/legally reachable;
- assume planning permission supplies sewer, access or neighbour rights;
- turn one competent foundation failure into `INCOMPATIBLE SITE` while other admissible routes remain;
- solve bad ground by silently changing protected storey/plan architecture;
- solve awkward drainage by changing the protected outward-draining roof topology;
- solve utility approach by routing primary services through principal rooms/courtyard;
- let `ASHP-01` consume the sole maintenance route because it fits in plan;
- assume neighbour land/highway is available for construction or maintenance;
- respond to privacy/noise/solar context by casually deleting protected openings;
- infer construction detail from an analytical DRW overlay;
- infer publication authority from this register;
- fill Reference Site unknowns merely to complete a package;
- create a scalar site-interface-completion score.

---

# 18. Rewind routing

Where a package crosses its licensed freedom, route the issue to the owning Reference House authority rather than patching downstream.

Typical examples:

| Pressure | First owning authority to reopen |
|---|---|
| shell / courtyard support geography must change | RH-01 / RH-02 + structural downstream gates |
| internal level/stair hierarchy must change | RH-03 / RH-04 |
| principal entrance/order must move | RH-04 / relevant outer-elevation authority |
| service suite / principal riser topology must move | RH-06 / later service gates |
| environmental/passive/opening order materially changes | RH-07 / RH-10 / G-01 as relevant |
| roof changes to internal drainage / inner gutter | RH-08 |
| maintenance geography no longer credible | RH-08 / RH-10 |
| envelope family / threshold duty changes materially | RH-09 / RH-10 envelope authority |
| heat-source/system family materially rewrites architecture | RH-10 energy/heat authority |

A rewind may produce a better Reference House. Until it is explicitly re-earned, the deployment candidate remains outside the current contract.

---

# 19. Acceptance assessment

DPL-08A succeeds because later site-interface work can now answer, before drawing a solution:

1. **What exactly is the controlled building-side handoff?**
2. **Which site claims/evidence are required?**
3. **Which external target/consent/specialist obligations consume those facts?**
4. **Which interface package owns the architectural/site response?**
5. **What remains external specialist design?**
6. **What may vary without changing the Reference House?**
7. **What condition requires an upstream rewind or eventual incompatibility decision?**
8. **What may DRW represent now, and what detail authority has not yet been earned?**

The package structure is sufficiently stable for downstream work.

No construction solution, compliance proof, planning permission, legal determination or Reference House geometry change has been created.

**DPL-08A result: PASS at authority/package-register scope.**
