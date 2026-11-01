# Reference House — RH-07 Environmental Coordination

**Status:** RH-07 design gate record / pre-simulation environmental concept  
**Date:** 2026-10-12  
**Question:** can the current architecture provide credible daylight, useful sunlight, purge/cross ventilation and summer resilience before active systems are used to rescue poor form?  
**Architectural authority:** [RH-04 Plan / Section / Elevation Gate](plan-section-elevation-gate.md)  
**Structural authority:** [RH-05 Structural Coordination](structural-coordination.md)  
**Service authority:** [RH-06 Services and Failure Geography](service-topology-rh06.md)  
**Drawings:** [environmental coordination diagram](environmental-coordination.svg), [courtyard solar section](courtyard-solar-section-rh07.svg), [MVHR topology](mvhr-topology-rh07.svg)

RH-07 is not a daylight, TM59 or Home Energy Model compliance calculation. No U-value, g-value, air-permeability target, fan duty or thermal comfort result is claimed here.

The gate asks a prior architectural question:

> **Does the form possess a credible passive environmental hierarchy, or would mechanical equipment merely conceal architectural failure?**

The answer is **yes**, with two important qualifications:

1. the courtyard is retained as a **shaded light court and spatial condenser**, not represented as a sunny primary garden;
2. whole-dwelling ventilation now selects **central MVHR as the Reference House baseline**, subject to a bounded RH-06 service-topology addendum proving real duct routes. Openable windows remain the principal summer purge/overheating mechanism; MVHR is not treated as cooling.

---

## 1. Regulatory and design baseline

### Part O — overheating

Approved Document O remains the current England statutory guidance for overheating in new residential buildings. Requirement O1 requires both:

- limiting unwanted solar gains in summer; and
- providing an adequate means of removing heat.

Mechanical cooling is a last resort where sufficient heat cannot otherwise be removed.

The simplified method distinguishes high- and moderate-risk locations. Much of west London is explicitly listed in Appendix C as **high risk**, including W5, W13, UB1–UB8 and other surrounding postcode areas. Because the Reference House has no real site, RH-07 does not assume a specific postcode; it uses the **high-risk London condition as the stress-test case**.

For cross-ventilated dwellings, the simplified method's high-risk glazing limits depend on orientation and additionally require qualifying shading on glazing from north-east through south to north-west. The simplified method also imposes substantial free-opening requirements, including a high-risk bedroom minimum free area of **13% of bedroom floor area**.

The Reference House should therefore **not distort its G-01 opening order merely to chase the simplified-method tables before a site exists**. Its real Part O route should normally be the dynamic thermal method once orientation, glazing, neighbours, noise, security and product opening geometry exist.

Canonical sources:

- GOV.UK, *Overheating: Approved Document O*: https://www.gov.uk/government/publications/overheating-approved-document-o
- GOV.UK, *Approved Document O FAQs*: https://www.gov.uk/guidance/approved-document-o-overheating-frequently-asked-questions

### Part F — ventilation

The 2026 Approved Document F distinguishes:

- purge ventilation;
- whole-dwelling ventilation;
- wet-room extract.

For central continuous mechanical extract, each habitable room still requires background ventilation. The 2026 guidance gives a minimum **4000 mm² equivalent area per habitable room** for that system family. Natural ventilation with intermittent extract uses materially larger background-ventilator allowances: **8000 mm² per habitable room** in a multi-storey dwelling.

MVHR instead mechanically supplies each habitable room and mechanically extracts from wet rooms. It does not remove the need for separate purge openings for summer heat removal.

Canonical source:

- GOV.UK, *Approved Document F, Volume 1: Dwellings — 2026 edition*: https://www.gov.uk/government/publications/approved-document-f-2026

### Daylight

Daylight compliance/quality is not reduced here to one project-wide number. The current London Housing Design guidance remains a useful design comparator, including ADF values of 1% for bedrooms and 1.5% for living rooms and a preference for direct sunlight to at least one habitable room.

The Reference House will require a proper daylight model once wall thickness, reveals, glass transmittance, neighbouring buildings and exact opening sizes are fixed.

---

## 2. Environmental reading of the current form

The house has four useful environmental properties before any active system is selected.

### 2.1 Shallow occupied bands

The courtyard leaves gross occupied wing depths of:

- **4.2 m** on west/east sides;
- **3.4 m** on south/north sides.

These are shallow enough that most important rooms can reach an external or courtyard façade without deep-plan residual space.

### 2.2 Multiple aspects are normal rather than exceptional

The ring plan gives many principal rooms two potential external conditions:

- an outer façade plus a courtyard face; or
- two outer façades at corners.

This is environmentally valuable because daylight, purge and summer refuge need not depend on a single orientation.

The exact window set on side/rear outer façades remains downstream elevation work, but RH-07 now makes **multi-aspect environmental performance a design obligation**, not an accidental bonus.

### 2.3 The service flank is not a solar hierarchy

The east/service-side drawing remains a surrogate. A real site may mirror it. RH-07 therefore refuses to encode a permanent belief that kitchens, bathrooms or service rooms belong east because of environmental performance.

### 2.4 Thermal mass is available without being invented

The current structural/envelope family already contains substantial masonry inner leaves. Where exposed or coupled effectively to the occupied space, that mass can damp short-term temperature swings.

RH-07 does **not** assume useful thermal mass merely because masonry exists. Removable linings, insulation position, finishes and night ventilation determine whether the mass is thermally coupled enough to matter. RH-09 / building-physics work must preserve or reject that benefit explicitly.

---

## 3. Courtyard environmental gate

The courtyard is **3.6 × 4.0 m** and the current cornice/eaves-control datum is about **6.25 m** above ground FFL.

That produces height-to-width ratios of roughly:

- **1.56** across the 4.0 m dimension;
- **1.74** across the 3.6 m dimension.

This is a relatively deep courtyard.

### Direct sun at the courtyard floor

Using London latitude (~51.5°N) and simple solar-noon geometry as a screening calculation:

| Date family | Approx. noon solar altitude | Shadow from 6.25 m south wall |
|---|---:|---:|
| summer solstice | ~61.9° | ~3.33 m |
| equinox | ~38.5° | ~7.86 m |
| winter solstice | ~15.1° | ~23.2 m |

Consequences:

- on the **4.0 m** court dimension, even summer-solstice noon leaves only about **0.67 m** of ground beyond the south-wall shadow;
- on the **3.6 m** dimension, that summer-noon sun patch falls to about **0.27 m**;
- at equinox and winter solstice the floor is effectively fully shadowed by the opposite two-storey wall at solar noon.

This is intentionally a screening calculation; it ignores roof profile, parapets, local openings and azimuth away from noon. Those refinements cannot convert the court into a winter-sun garden.

### Sky exposure

At the courtyard centre, the approximate clear sky aperture between opposite 6.25 m walls is only about:

- **35.5°** across the 4.0 m dimension;
- **32.1°** across the 3.6 m dimension.

The court therefore provides useful diffuse light and orientation, but ground-floor court-facing glazing should not be the sole daylight source for principal habitable rooms.

### RH-07 courtyard decision

**Retain the courtyard.**

Its environmental role is now defined honestly:

> **shaded light court + orientation device + sheltered purge reservoir + intimate outdoor room**, not primary sunny amenity.

The rear garden remains the principal sunny external space.

This has direct design consequences:

- principal rooms should retain meaningful outer-façade daylight;
- shade-tolerant courtyard planting is more credible than sun-demanding planting;
- the court should not be filled with a canopy/tree whose mature crown further destroys sky access without a deliberate reason;
- reflective glare should not be used to compensate crudely for low sky view;
- light-coloured but non-glare courtyard surfaces can improve diffuse brightness;
- RH-08 must ensure courtyard drainage does not turn the shaded microclimate into persistent dampness.

### Rewind trigger

Reopen RH-01/RH-02 only if later daylight simulation shows a principal room fails because the court is too deep **despite adequate outer-façade openings**. Do not enlarge the court merely to make the court floor sunny; that would be a different architectural brief.

---

## 4. Orientation stress test

Because there is no site, RH-07 rotates the current plan conceptually instead of optimising it to the south-street surrogate.

### A — street south / garden north — current drawing surrogate

Strengths:

- front drawing/study receive useful south light;
- rear family/kitchen remain comparatively cool;
- garden dining has a useful north-garden + south-court dual condition.

Risk:

- front upper bedrooms may receive high summer gains if glazing grows beyond the controlled G-01 family.

Verdict: **credible**.

### B — street west / garden east

Risk concentrates on:

- drawing/study and front bedrooms under low-angle afternoon sun.

This is the most important stress case for front-elevation overheating because horizontal overhangs are weak against low west sun.

Required response:

- keep glazing disciplined;
- preserve external shading / solar-control-glass options;
- preserve secure purge on a second aspect where possible;
- do not solve the condition with cooling by default.

Verdict: **credible only with deliberate solar-control strategy**.

### C — street east / garden west

The main summer risk shifts to the rear:

- family room;
- garden dining;
- kitchen;
- rear bedrooms.

This is potentially worse domestically because cooking and late-afternoon occupancy coincide with west solar gain.

Required response:

- rear garden façade needs genuine shading capacity;
- large fashionable rear glazing is explicitly prohibited unless simulation earns it;
- trees/pergolas may improve comfort but cannot substitute for the Part O compliance model where not admissible.

Verdict: **credible with disciplined rear glazing and external shading**.

### D — street north / garden south

This gives the principal rear domestic rooms useful south exposure.

Strength:

- beneficial winter sun potential;
- due-south high summer sun is easier to control with architectural overhangs than east/west sun.

Risk:

- garden dining/kitchen can still overheat if transformed into a large glazed rear wall.

Verdict: **environmentally attractive, still shading-dependent**.

### Orientation conclusion

No orientation forces an architectural rewind.

But RH-07 introduces one hard project control:

> **The Reference House does not acquire a large undifferentiated glazed rear wall.**

Opening size remains room- and orientation-specific. G-01's already restrained opening family is environmentally useful rather than an obstacle.

---

## 5. Daylight hierarchy

### Principal rooms

The drawing room, family room, kitchen/garden dining and bedrooms should receive useful daylight from an **outer façade** even where they also borrow light/air from the courtyard.

The courtyard may improve depth and balance; it should not rescue an otherwise dark room.

### Circulation

The courtyard is particularly valuable here:

- entrance/stair hall can receive court light;
- upper gallery receives direct court daylight;
- north cross-landing gains a visible external orientation;
- circulation avoids becoming an artificially lit internal core.

This is where the courtyard earns environmental value most convincingly.

### Family bathroom

`U-BATH-01` remains on the external/service flank and should retain a real outer window where privacy can be managed. Mechanical extract is required independently of that opening, but daylight and purge remain valuable.

### Daylight modelling questions

Later simulation should answer:

1. daylight autonomy / target metric for each principal room with actual reveals and glass;
2. contribution of courtyard openings versus outer openings;
3. effect of the 6.25 m courtyard walls on lower-level sky exposure;
4. whether any room depends excessively on glazing that creates summer gain;
5. whether service-side bathroom/privacy glazing remains worthwhile after envelope design.

---

## 6. Purge, cross and stack ventilation

### Purge ventilation remains architectural

Openable windows are retained even with MVHR.

Each habitable room should have a credible purge opening sized and positioned for summer use. On the real site, opening geometry must be checked against:

- Part O free-area/equivalent-area methodology or dynamic model inputs;
- security;
- fall protection;
- external noise;
- pollution;
- rain exposure;
- occupant control.

### Cross ventilation

The courtyard morphology creates several useful pressure-path opportunities:

- outer façade → room → courtyard;
- courtyard → room → outer façade;
- outer façade → linked room/circulation → opposite outer façade during deliberate purge.

Do not count an internal door that must remain permanently open for privacy-critical bedroom ventilation as the only summer strategy.

RH-07 therefore adds a **secondary-aspect opening obligation** to each bedroom where plan geometry permits. That opening may be modest, but it should create a real independent purge path rather than decorative glass.

### Stack effect

The open courtyard already creates a buoyant exterior void. The stair is not converted into a dedicated thermal chimney, but high-level opening at the upper stair/courtyard interface can strengthen whole-house purge during favourable conditions.

This remains occupant-controlled natural purge, not a required mechanical exhaust shaft.

### Night purge

For London overheating resilience, night-time heat rejection matters. Windows intended to contribute to night purge should have a secure, useful opening condition.

A tiny night-latch gap is not counted as a serious overheating strategy.

---

## 7. Solar-control hierarchy

Use the following order before considering active cooling.

### 1. Keep glass area disciplined

The existing G-01 front composition already avoids curtain-wall behaviour. Preserve that restraint on rear and side elevations.

### 2. External shading where orientation earns it

- south: horizontal overhangs / architectural projection can work effectively;
- east/west: vertical or operable external shading is geometrically more useful;
- courtyard: shading demand is generally lower at ground level because the geometry already self-shades strongly.

The exact device belongs to the selected architectural language. Do not attach generic solar fins after the elevation is complete.

### 3. Solar-control glass where needed

Part O's simplified high-risk route recognises glazing with maximum g-value 0.4 and minimum light transmittance 0.7 as one qualifying shading route.

RH-07 does **not** make low-g glass universal. Use it where simulation shows a solar problem and verify colour/rendering/daylight consequences.

### 4. Internal blinds / shutters for comfort and privacy

Useful operationally, but do not rely on internal shading as the primary compliance defence against solar gain.

### 5. Mechanical cooling only after passive failure is demonstrated

No comfort-cooling system is reserved by RH-07.

If dynamic modelling later demonstrates a residual problem that cannot be corrected proportionately through glazing, shading, purge or modest architectural changes, cooling becomes a bounded technical question rather than a default entitlement.

---

## 8. Whole-dwelling ventilation comparison

RH-06 deliberately left this open. RH-07 compares the three credible families.

### V1 — natural background ventilation + intermittent extract

**Advantages**

- few central components;
- easy local replacement;
- no supply duct network.

**Costs**

- 2026 Part F uses relatively large background ventilator provision for this family;
- winter ventilation heat loss is uncontrolled by heat recovery;
- external noise/draught/acoustic treatment becomes a room-by-room issue;
- airflow is more weather/occupant dependent;
- many façade/window ventilators complicate the controlled G-01 opening system.

**Decision:** reject as Reference House baseline. Retain as a legitimate comparator for a simpler/lower-airtightness house.

### V2 — continuous MEV + background ventilators

**Advantages**

- very simple extract topology in this house because wet rooms already cluster tightly;
- smaller background ventilator area than natural ventilation;
- central fan can be accessible and replaceable;
- good continuous pollutant/moisture removal.

**Costs**

- still requires a background ventilator in every habitable room;
- continuous winter heat leaves with extract air;
- pressure-driven outdoor-air supply still creates room-level acoustic/draught design burden;
- gives up a large energy opportunity in a deliberately high-quality new envelope.

**Decision:** retain as the **fallback baseline** if MVHR duct burden or commissioning evidence becomes disproportionate.

### V3 — central MVHR — **SELECTED**

**Why it wins here**

- a purpose-built new house can coordinate it from first principles rather than retrofit ducts later;
- the house already has a real plant/service hub with an external replacement route;
- habitable rooms receive controlled supply without background ventilators puncturing every window/façade;
- wet rooms already cluster around the east/service geography;
- winter ventilation heat loss is materially reduced through heat recovery;
- filtration provides an additional benefit where a future London site has noise/pollution constraints that make open background vents undesirable;
- the short-span radial structure allows bounded duct branches to follow joist direction rather than requiring arbitrary structural drilling.

**Costs and risks**

- more ducts;
- commissioning dependency;
- filters and fans require recurring maintenance;
- poor installation can create noise, imbalance and performance loss;
- concealed duct routing can violate House Kernel if treated as vague inaccessible volume;
- summer bypass does not make MVHR a cooling system.

### Selection condition

MVHR remains selected only while RH-07's bounded service addendum demonstrates all of the following:

- central unit in `G-PLANT-01` with ordinary filter/front-service access and external replacement route;
- intake and exhaust on a secondary external face/roof with adequate separation and no courtyard exhaust;
- two main ducts accommodated in `SV-01` without displacing soil/water/fire separation beyond the 900 × 700 clear reservation;
- ground-floor branch routes are **specific bounded routes aligned with floor framing**, not permission to use the whole 350 mm floor zone as a service plenum;
- upper-floor branches prefer upper ceiling/roof and gallery/service geography where possible;
- access/cleaning strategy is documented;
- acoustic treatment and fan duty are competent-design obligations;
- cooker source capture `KX-01` remains separate from MVHR grease extract.

If those conditions fail, revert to V2 continuous MEV rather than enlarging the house or deepening all floors simply to save MVHR.

---

## 9. RH-07 bounded RH-06 rewind — MVHR topology

Selecting MVHR creates a deliberate, small service-topology rewind.

It **does not** reopen:

- plant-room location;
- `SV-01` location;
- soil stack;
- kitchen source-capture route;
- protected structural reaction nodes/edge beams;
- general dry-service topology.

It adds:

- `MVHR-01` central unit reservation within `G-PLANT-01`;
- `MV-SUP-01` and `MV-EXT-01` vertical supply/extract trunk reservations through `SV-01`;
- `MV-OA-01` and `MV-EA-01` outdoor-air intake/exhaust penetrations, position to be coordinated with RH-08 roof/external maintenance;
- bounded radial branch corridors following joist direction where floor distribution is necessary;
- high-level wet-room extract terminal at `U-BATH-01` and continuous extract at utility/WC/kitchen background position;
- supply terminals to bedrooms and principal living rooms.

Detailed route drawing: [MVHR topology](mvhr-topology-rh07.svg).  
Service-control record: [RH-07 MVHR Service Addendum](service-topology-rh07-mvhr-addendum.md).

---

## 10. Heating and summer comfort

RH-07 does not select a heating emitter or heat-pump product.

Environmental implications for later technical design:

- low-temperature heating is preferred because the project is a new efficient envelope;
- avoid emitter arrangements that prevent furniture use or future window replacement;
- underfloor heating must justify its relationship with selective floor access and thermal mass rather than being assumed;
- mechanical cooling is not reserved;
- ceiling fans remain a low-complexity comfort option worth preserving geometrically where ceiling composition permits them, but are not mandatory.

The 2.95 m principal ground-floor ceiling gives useful air volume and accommodates slow air movement without requiring visibly technical ceiling infrastructure.

---

## 11. Modelling / specialist questions that remain open

The next environmental evidence should be **specific**, not another generic precedent search.

### Dynamic overheating model

At real-site or held-surrogate stage, model at least:

- current four-bay outer opening family;
- actual rear/side opening design;
- real orientation and neighbouring obstruction;
- secure night-purge opening areas;
- courtyard geometry;
- masonry thermal-mass exposure;
- selected glazing g-value / light transmittance;
- external shading;
- MVHR summer-bypass assumptions;
- realistic internal gains;
- no active cooling in the base case.

Use the current Part O dynamic thermal method / CIBSE methodology appropriate at time of design.

### Daylight model

Model:

- principal-room daylight with outer + courtyard openings;
- stair/gallery/court daylight;
- bathroom privacy glazing;
- courtyard surface reflectance sensitivity;
- effect of wall depth and G-01 reveals.

### Ventilation design

Competent MEP design must determine:

- final whole-dwelling airflow from actual internal floor area / bedroom count;
- MVHR unit duty, heat-recovery performance and summer bypass;
- duct sizes / pressure losses / terminal throws;
- intake/exhaust separation;
- acoustics;
- commissioning/balancing;
- filter access and replacement intervals;
- condensation/insulation of outdoor-air ducts;
- cleaning/access strategy.

---

## 12. Decisions that must not be silently reopened

1. The courtyard is retained, but is **not** represented as a sunny primary garden.
2. Principal habitable rooms must not depend on courtyard glazing as their only meaningful daylight source.
3. Large undifferentiated rear glazing is not part of the Reference House brief.
4. Openable windows remain required for purge even with mechanical whole-dwelling ventilation.
5. MVHR is the selected whole-dwelling ventilation baseline; continuous MEV is the explicit fallback.
6. MVHR selection does not authorise a generic floor/ceiling service plenum.
7. Cooker source capture remains separate from whole-dwelling ventilation.
8. Mechanical cooling is not reserved and must be earned by later modelling if ever required.
9. Real-site orientation may mirror the service flank and modify shading/opening design without altering House Kernel doctrine.

---

# RH-07 gate record

**Result:** **PASS with bounded RH-06 MVHR rewind.**

The passive hierarchy is credible because:

- occupied bands are shallow;
- most principal rooms can be genuinely multi-aspect;
- outer openings carry primary daylight responsibility;
- the courtyard improves diffuse light/circulation orientation without being misrepresented as a sunny court;
- glazing remains disciplined;
- secure purge/cross ventilation remains part of the architecture;
- shading is treated as orientation-specific architecture;
- active cooling is not needed to make the concept plausible;
- selected MVHR improves controlled winter ventilation without replacing passive summer heat rejection.

No architectural morphology, room-order, stair, structural or façade rewind is required.

**No maturity promotion is claimed.** Numerical daylight/overheating performance remains unproved until simulation and site facts exist.

**Next stage:** `RH-08 — Roof, drainage and external maintenance`.

**Exact next action:** resolve a roof/drainage geometry that respects the RH-04 cornice, leaves the court genuinely open, drains the shaded court safely, gives MVHR intake/exhaust and soil vent credible terminal geography, and provides ordinary inspection/maintenance access without compromising the front elevation.