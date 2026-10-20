# DPL-07 — Synthetic Reference Site

**Issue:** [#347 — DPL-07 — define the synthetic Reference Site](https://github.com/adamnoden/architecture/issues/347)  
**Programme:** [#299 — DPL — deployment, jurisdiction and real-site integration programme](https://github.com/adamnoden/architecture/issues/299)  
**Baseline `main`:** `7646cd6a21ae4d1108a720d0471b79f49b1848d3`  
**Fixture identity:** `DPL-RS-01`  
**Manifest identity:** `DPL-RS-01-SM-v0.1`  
**Site kind:** `SYNTHETIC_REFERENCE`  
**Status:** canonical synthetic site candidate for review

## Question

> **What deliberately declared site context should the Reference House be demonstrated against before the project begins testing it on real London plots?**

DPL-07 answers that question with one synthetic integration fixture.

It does **not** claim to define:

- the statistically typical London plot;
- the minimum plot on which the house can work;
- the eventual deployment envelope;
- a compliant planning site;
- a Building Regulations-compliant site;
- a commercially representative land parcel;
- a real borough or address.

The fixture exists to make hidden assumptions visible and challengeable.

## Decision

Adopt **`DPL-RS-01`**, a medium cleared suburban residential parcel with:

- **17.4 m width**;
- **30.0 m depth**;
- public-street frontage to the **geographic north**;
- south-facing rear garden;
- the 12.0 × 10.8 m Reference House placed as a **rigid 180° rotation** of its model coordinate convention;
- **3.0 m gross service-side strip** to geographic west;
- **2.4 m gross principal-side strip** to geographic east;
- **5.2 m front setback**;
- **14.0 m rear garden depth**;
- modest existing topographic fall from street toward the rear;
- ordinary neighbouring two-storey massing on both side boundaries;
- one mature rear-garden tree as an ordinary physical friction;
- no authored existing building on the parcel;
- no invented exact neighbour windows, sewer connection, utility capacity, ground-bearing value or legal/planning conclusion.

The fixture is intentionally **ordinary but not frictionless**.

It gives the house enough land to demonstrate its intended maintenance/service logic while retaining real questions around levels, neighbours, tree influence, drainage, utilities, planning and due diligence.

## Why a Reference Site is necessary

The Reference House is currently site-agnostic by design.

That is valuable for architectural control, but it means several apparently resolved building decisions still hide site dependencies:

- absolute datum;
- step-free approach geometry;
- foundation/ground response;
- wall-base drainage;
- side access and temporary maintenance positions;
- ASHP/service-side working geography;
- foul/surface-water discharge;
- utility approach;
- neighbour/privacy/daylight/noise relationships;
- garden-to-courtyard logistics;
- construction access;
- mature landscape replay.

A canonical deployment exercise cannot continue to leave all of those in a white void.

The Reference Site therefore acts as a **controlled integration fixture**, not as evidence that real London land behaves this way.

## Authority recovered

### Reference House geometry

The controlled Reference House source freezes:

- shell width: **12.0 m**;
- shell depth: **10.8 m**;
- centred courtyard: **3.6 × 4.0 m**;
- model coordinate convention:
  - origin at south-west outer corner;
  - +X east;
  - +Y north;
  - model south = principal front.

DPL-02 explicitly permits the house to be **translated and rotated as a rigid architectural object** on a real site. Model `south = front` is therefore not a geographic compass commitment.

### Maintenance geography

The controlled External Access & Maintenance Plan requires credible ordinary access for:

- outer façades;
- roof edges/rainwater goods;
- plant/service work;
- the courtyard;
- material replacement routes;
- garden-to-courtyard logistics;
- temporary scaffold/tower support positions.

It identifies the technical/service side as particularly valuable and warns against sacrificing the sole maintenance route.

### Existing publication synthetic setting

DRW already has a deliberately bounded surrogate setting source.

That source contains only:

- a **15.5 m surrogate width**;
- centred house placement;
- approximately **1.75 m gross side clearance** per side;
- qualitative west/east access-capacity readings;
- rear/logistics continuation.

It explicitly records the following as **ABSENT**:

- plot depth;
- legal boundary;
- front/rear boundary;
- highway/road line;
- neighbours;
- geographic north;
- topography;
- planting;
- actual drainage;
- actual utilities;
- exact site entrance;
- exact ASHP position.

Its own source describes the 15.5 m width as a **house-centred width stress test** outside RH-C1.

Therefore:

> **The DRW synthetic setting is not promoted into the Reference Site.**

It remains valuable as prior coordination evidence and a narrower side-access challenger.

## Fixture-selection principles

`DPL-RS-01` follows seven rules.

### 1. Derived from architectural duties, not invented “typicality”

Dimensions are selected to exercise the current house and its known site-interface duties.

No claim is made that 17.4 × 30.0 m is an average, median or typical London plot.

### 2. Ordinary, not frictionless

The fixture includes:

- neighbouring houses;
- non-zero site fall;
- one mature tree;
- asymmetric side clearances;
- unresolved subsurface / utilities / drainage facts.

It is not a blank rectangular lawn floating in space.

### 3. Not adversarial by construction

The fixture does not deliberately inject:

- severe flood conditions;
- protected heritage;
- impossible access;
- known restrictive covenant;
- major sewer through the building footprint;
- extreme slope;
- pathological ground;
- abnormally tight boundaries.

Those belong to later real-plot/adversarial work unless a downstream target inventory shows one should be part of the canonical test.

### 4. No magic “clean site” booleans

Where a condition has not yet been earned by DPL-09/10/11, it remains explicit `UNKNOWN` rather than silently becoming `false`.

### 5. Real geographic orientation

The site has geographic north.

The house is rotated as a whole, proving that model orientation and geographic orientation are distinct.

### 6. Site facts do not author architecture

The fixture stops at site claims.

Foundations, grading, drainage design, screening, hard landscape, service routing and planning response remain later authored work.

### 7. Easy enough to reconstruct

The canonical geometry is tabulated in a simple local coordinate system so future drawings/compiler fixtures can reproduce it without interpreting prose.

## Reference coordinate system

Use a local metric site frame for the synthetic fixture:

```text
origin:          south-west parcel corner
X positive:      geographic east
Y positive:      geographic north
Z datum:         synthetic street/frontage datum
geographic north:+Y
```

All horizontal values below are in millimetres unless stated otherwise.

The local frame is synthetic. It has no OS grid coordinate and no real-world address.

## Canonical parcel geometry

```text
SITE PARCEL: DPL-RS-01

south-west:  (0, 0)
south-east:  (17,400, 0)
north-east:  (17,400, 30,000)
north-west:  (0, 30,000)

width E–W:   17,400
length S–N:  30,000
area:        522 m² (derived from authored rectangle)

street edge: north / Y = 30,000
rear garden: south
```

The 522 m² area is a deterministic fixture consequence, not an empirical London-site statistic.

## Canonical house placement

The Reference House is deployed as one rigid 180° rotation.

Its site-space bounding box is:

```text
west house face:   X = 3,000
east house face:   X = 15,000
south/rear face:   Y = 14,000
north/front face:  Y = 24,800
```

Derived clearances:

```text
west / technical-service side:  3,000
 east / principal side:          2,400
 north / front setback:          5,200
 south / rear garden:           14,000
```

The current unmirrored house is used.

Because it is rotated 180°:

- model front/south → geographic north / street;
- model rear/north → geographic south / rear garden;
- model east technical/service flank → geographic west;
- model west principal flank → geographic east.

No lateral mirror is required for the canonical fixture.

### Transform

Conceptually, model coordinates `(x, y)` map to site coordinates:

```text
siteX = 15,000 - modelX
siteY = 24,800 - modelY
```

for the controlled 12,000 × 10,800 shell.

The transformation preserves all internal geometry.

## Why the parcel is asymmetric

The previous DRW stress-test setting centred the house.

The Reference Site deliberately does not.

The extra **600 mm** on the technical/service side gives the canonical site an explicit service bias while preserving useful access on the principal flank.

This tests a real project proposition:

> the service side should be allowed to do more site work without making the whole house a technical object.

It also prevents “house is centred on every parcel” from becoming an accidental hidden invariant.

## Why 17.4 m width

The width is authored as:

```text
3.0 m  technical/service-side field
12.0 m Reference House
2.4 m  principal-side field
────────────────────────────
17.4 m parcel width
```

The dimensions are not statutory minima.

They create a canonical fixture with:

- a useful service/plant/access strip;
- credible temporary maintenance geography on both flanks;
- enough separation to test rather than preclude neighbouring context;
- materially more site information than the 15.5 m publication stress-test setting.

The narrower **15.5 m / ~1.75 m each side** DRW setting remains a useful challenger and should not be discarded.

## Why 30.0 m depth

The depth is authored as:

```text
14.0 m  rear garden / logistics / landscape field
10.8 m  Reference House
 5.2 m  front approach / arrival field
────────────────────────────────
30.0 m parcel depth
```

This is not a planning-compliance formula.

It provides enough depth to expose:

- front arrival and accessible approach;
- street/building datum relationship;
- rear domestic garden and maintenance staging;
- garden-to-courtyard logistics;
- one meaningful mature-tree condition;
- neighbour/context relationships;
- surface-water/site-interface questions.

## Site levels

The synthetic **existing broad ground plane** falls gently from the north/street edge toward the south/rear boundary.

Author:

```text
north/front boundary broad level:  Z = +0.000 m
south/rear boundary broad level:   Z = -0.240 m
broad longitudinal fall:           240 mm over 30.0 m (~1:125)
transverse broad fall:             none authored
```

This is a simple pre-development terrain claim, not final grading.

The canonical Reference House ground FFL is placed provisionally at:

```text
site datum for RH ground FFL: Z = +0.100 m
```

The internal RH datum remains ±0 in house coordinates; the deployment transform maps it to site `+0.100 m`.

This creates a modest, resolvable land/building level relationship without pre-designing:

- ramp geometry;
- terrace levels;
- threshold drainage;
- retaining walls;
- finished landscape;
- foundation depth.

DPL-08 owns those responses.

The FFL/site datum is an authored Reference Site assumption and may be rejected by later site-interface work if it creates a contradiction.

## Street and frontage

The north parcel boundary adjoins a synthetic established residential street context.

Canonical site claims:

- public-street frontage lies immediately north of the parcel;
- exact highway geometry beyond the frontage is **not authored**;
- a physically usable **west-side service/vehicle access zone** exists across the northern frontage aligned with the 3.0 m technical-side strip;
- exact crossover consent, gate design and highway approval are **not authored**;
- the principal pedestrian approach is available from the north frontage;
- exact path/hardscape geometry is **not authored**.

The distinction is deliberate:

> physical frontage capacity is a site fixture; permission and detailed access design are not.

## Neighbouring built context

DPL-RS-01 sits within an established low-rise residential context rather than as an isolated field.

Two simplified side-neighbour masses are authored as **approximate synthetic context only**.

### West neighbour mass `NBR-W-01`

```text
nearest east face: X ≈ -1,800
front/north line:  Y ≈ 24,300
rear/south line:   Y ≈ 13,800
approx height:     7.8 m
storeys:           two-storey domestic mass for context purposes
```

### East neighbour mass `NBR-E-01`

```text
nearest west face: X ≈ 19,200
front/north line:  Y ≈ 24,800
rear/south line:   Y ≈ 13,500
approx height:     8.2 m
storeys:           two-storey domestic mass for context purposes
```

These masses are intentionally approximate.

The following remain `UNKNOWN` / unauthored:

- exact neighbour window positions;
- room uses;
- legal rights;
- daylight/sunlight baselines;
- overlooking conclusions;
- exact roof geometry;
- exact neighbour ground levels.

DPL-10 determines which of those facts become due for planning-case work.

## Rear context

No immediate rear building geometry is frozen in v0.1.

The 14.0 m rear garden is real fixture geometry; conditions beyond the south boundary are recorded as context `UNKNOWN` until DPL-10 determines the minimum planning-case evidence needed.

This is preferable to inventing a rear-neighbour mass merely to make a complete-looking drawing.

## Mature tree condition

One existing synthetic mature deciduous tree is placed in the rear-west garden as an ordinary physical friction.

### `TREE-RS01-01`

```text
stem centre:      approximately (4,300, 5,000)
stem diameter:    approximately 450 mm
canopy radius:    approximately 3,200 mm
basis:            ASSUMED synthetic Reference Site condition
species:          not frozen
condition:        not professionally determined
root geometry:    UNKNOWN
TPO/protection:   UNKNOWN pending DPL-10 administrative-source model
```

The tree is far enough from the house not to be an intentionally impossible blocker but close enough to matter potentially for:

- mature-landscape maintenance replay;
- shading;
- ground/foundation investigation;
- landscape logistics;
- planning/arboricultural evidence if later target work makes it due.

No conclusion is made about removal, retention or foundation response.

## Ground / geotechnical condition

DPL-RS-01 deliberately does **not** invent a bearing capacity or named geological stratum.

Canonical v0.1 state:

```text
GROUND PROFILE:          UNKNOWN
BEARING PARAMETERS:      UNKNOWN
GROUNDWATER:             UNKNOWN
CONTAMINATION:           UNKNOWN
GROUND GAS / RADON:      UNKNOWN
BURIED OBSTRUCTIONS:     UNKNOWN
```

A bounded early-site assumption may later be added only if DPL-08/DPL-11 demonstrates that a provisional value is necessary to answer a specific question.

This prevents the Reference Site from becoming magically engineerable by assertion.

## Drainage and sewer context

The fixture assumes an established serviced residential street, but it does not assume a lawful connection strategy.

Canonical claims:

```text
public foul sewer somewhere within / serving the street context:
  ASSUMED PRESENT for canonical urban context

exact sewer centreline / depth / capacity:
  UNKNOWN

right / approval to connect:
  UNKNOWN

surface-water public connection:
  UNKNOWN

infiltration feasibility:
  UNKNOWN

existing on-site private drainage:
  NONE AUTHORED

sewer crossing beneath proposed house:
  NOT ASSERTED; presence/absence remains UNKNOWN until the due-diligence model says what evidence is needed
```

The phrase `ASSUMED PRESENT` is intentionally not the same as “available connection”.

DPL-11 owns the due-diligence model; DPL-08 later authors the site discharge/interface strategy.

## Utilities

For canonical urban context, author only the following synthetic assumptions:

```text
electricity distribution available in street context: ASSUMED
drinking-water main available in street context:      ASSUMED
telecommunications available in street context:       ASSUMED
mains gas:                                             not required / not authored
```

Keep `UNKNOWN`:

- exact routes;
- exact entry points;
- available capacities;
- connection quotations/rights;
- diversion requirements;
- easements/wayleaves;
- transformer/booster requirements;
- final service-entry design.

The west service-side strip provides physical approach capacity but does not prove that utilities will arrive there.

## Environmental/exposure conditions

DPL-RS-01 authors only a restrained first context:

- low-rise established urban/suburban surroundings;
- no extreme exposure condition deliberately authored;
- geographic orientation fixed as above;
- neighbouring massing fixed only at approximate bounding level;
- tree fixed as above.

Remain `UNKNOWN` until the relevant target/evidence packet determines due scope:

- measured external noise;
- air-quality condition;
- wind exposure;
- detailed solar/shading model;
- future-climate model inputs;
- radon/ground-gas basis;
- ecological/habitat condition;
- flood classifications.

No environmental condition is defaulted to “safe”.

## Heritage / administrative designations

The canonical Reference Site is intended to test ordinary London deployment before special heritage conditions are introduced.

Author at v0.1:

```text
listed building on parcel:       NONE — synthetic fixture assumption
conservation-area inclusion:     NONE — synthetic fixture assumption
other heritage designation:     NONE — synthetic fixture assumption
```

This does not mean heritage constraints are unimportant.

It deliberately keeps special heritage conditions out of the canonical baseline so DPL-10 can later treat them as target/site variants rather than hidden universal requirements.

Other administrative/environmental designations remain `UNKNOWN` until DPL-09/10 inventory establishes which are material to the canonical planning/regulatory case.

## Title / private-right assumptions

DPL-RS-01 is a synthetic developable parcel, but private-law complexity is not silently erased.

Author only:

```text
single parcel under one project-controlled ownership interest:
  ASSUMED for fixture
```

Remain `UNKNOWN`:

- exact registered-title wording;
- restrictive covenants;
- easements;
- rights of way;
- wayleaves;
- ransom strips;
- boundary ownership;
- Party Wall relationships;
- third-party access rights.

DPL-11 determines how those conditions should be represented and when they become due.

## Construction / maintenance logistics

Physical geometry supports, but does not prove, the following:

- direct street → west service-strip route;
- west service-side plant/replacement access;
- east principal-side façade/roof-edge access positions;
- front façade working area subject to street/highway method;
- rear garden staging area;
- rear garden → garden-dining → courtyard logistics route preserved by the house;
- temporary access equipment can plausibly reach side/rear zones without passing through a principal front room.

Remain unresolved:

- actual scaffold/tower bearing capacities;
- crane position;
- highway occupation/consent;
- neighbour oversailing/access;
- construction compound strategy;
- exact gates;
- temporary works loads;
- below-ground conflicts.

## Reference Site manifest claim register

The canonical v0.1 site claim set is summarised below.

| Claim ID | Proposition | Basis | v0.1 state |
|---|---|---|---|
| `RS-PARCEL-01` | parcel rectangle 17.4 × 30.0 m | `ASSUMED` synthetic fixture | authored |
| `RS-FRAME-01` | local XY frame; +Y geographic north | `ASSUMED` synthetic fixture | authored |
| `RS-STREET-01` | north boundary fronts established residential street | `ASSUMED` | authored |
| `RS-HOUSE-XFORM-01` | RH rigid rotation 180°, bbox X 3.0–15.0 m / Y 14.0–24.8 m | `DERIVED_SITE_CLAIM` from authored placement + controlled RH shell | authored |
| `RS-SIDES-01` | west 3.0 m / east 2.4 m gross side fields | `DERIVED_SITE_CLAIM` | authored |
| `RS-GARDENS-01` | north/front 5.2 m / south/rear 14.0 m | `DERIVED_SITE_CLAIM` | authored |
| `RS-TOPO-01` | broad ground falls 240 mm north→south | `ASSUMED` | authored |
| `RS-FFL-01` | RH ground FFL maps to site Z +0.100 m | `ASSUMED` deployment datum | authored |
| `RS-ACCESS-01` | west-side physical access zone at street frontage | `ASSUMED` | authored |
| `RS-NBR-W-01` | approximate two-storey west neighbour mass | `ASSUMED` | authored |
| `RS-NBR-E-01` | approximate two-storey east neighbour mass | `ASSUMED` | authored |
| `RS-NBR-OPEN-01` | exact relevant neighbour openings | — | `UNKNOWN` |
| `RS-TREE-01` | mature tree at approx (4.3, 5.0) m | `ASSUMED` | authored |
| `RS-TREE-ROOT-01` | root / arboricultural constraints | — | `UNKNOWN` |
| `RS-GROUND-01` | geotechnical design condition | — | `UNKNOWN` |
| `RS-SEWER-STREET-01` | foul sewer serves street context | `ASSUMED` | authored |
| `RS-SEWER-DETAIL-01` | route/depth/capacity/connection rights | — | `UNKNOWN` |
| `RS-SW-01` | lawful surface-water strategy | — | `UNKNOWN` |
| `RS-UTIL-E-01` | electricity available in street context | `ASSUMED` | authored |
| `RS-UTIL-W-01` | water available in street context | `ASSUMED` | authored |
| `RS-UTIL-T-01` | telecom available in street context | `ASSUMED` | authored |
| `RS-UTIL-CAP-01` | connection capacities/routes | — | `UNKNOWN` |
| `RS-HERITAGE-01` | no listed/conservation designation in fixture | `ASSUMED` synthetic baseline | authored |
| `RS-TITLE-CONTROL-01` | one project-controlled parcel interest | `ASSUMED` | authored |
| `RS-TITLE-DETAIL-01` | covenants/easements/rights/wayleaves | — | `UNKNOWN` |
| `RS-FLOOD-01` | flood condition/classification | — | `UNKNOWN` |
| `RS-NOISE-01` | external noise condition | — | `UNKNOWN` |
| `RS-ECO-01` | ecology/habitat condition | — | `UNKNOWN` |
| `RS-CONST-01` | detailed construction-logistics constraints | — | `UNKNOWN` |

All authored fixture facts are synthetic.

None are evidence about a real parcel.

## What is deliberately **not** in the fixture

DPL-RS-01 does not say:

```text
planning compliant
Building Regulations compliant
acceptable daylight
acceptable overlooking
acceptable parking
acceptable refuse/cycle provision
safe ground
sufficient utility capacity
lawful sewer connection
surface-water solution proven
TPO absent
BNG exempt / satisfied
Party Wall Act not applicable
covenants clear
construction access approved
```

Those conclusions belong to DPL-09/10/11 and later deployment work.

## Relationship to DRW synthetic setting

The two artefacts now have clearly different roles.

### DRW publication synthetic setting

Purpose:

- communicate/inspect the house outside a total white void;
- stress side-access capacity at 15.5 m width;
- support analytical drawing overlays without pretending to be a real site.

Authority:

- `SURROGATE_SETTING_OUTSIDE_RH_C1`;
- approximate/qualitative;
- deliberately missing site semantics.

### DPL-RS-01 Reference Site

Purpose:

- become the canonical synthetic site-state input for deployment research;
- make site assumptions explicit;
- allow DPL-08/09/10/11 and later DPL-13 to attack one concrete deployment case.

Authority:

- `SYNTHETIC_REFERENCE` site manifest;
- authored fixture claims with explicit assumptions/unknowns;
- no empirical real-site authority.

### Reuse rule

Do **not** replace the DRW setting automatically with DPL-RS-01.

The publication setting was tuned to a different question and may remain a useful narrower analytical stress test.

DPL-17 later decides whether any Reference Site geometry belongs visibly in the book.

## Rejected alternatives

### A. Promote the 15.5 m DRW setting directly

Rejected.

It has no plot depth, boundaries, geographic north, neighbours, topography, drainage, utilities or entrance. Its own authority explicitly refuses those semantics.

### B. Make the Reference Site the smallest site that can physically contain the house

Rejected.

That would turn the canonical integration fixture into an adversarial minimum-width optimisation and bias every site-interface decision toward scarcity.

Minimum deployable geometry must be earned later from real trials.

### C. Use a very generous detached-house plot

Rejected.

A large clean plot would hide the exact London/site pressures the programme exists to surface.

### D. Choose a real London parcel now

Rejected.

A real parcel would import title, planning, neighbour, privacy and evidence obligations before the site/target/due-diligence models have been exercised canonically.

DPL-14 later owns empirical real-plot pressure.

### E. Copy a “typical London plot” dimension from market intuition

Rejected.

There is no need to pretend statistical representativeness.

The fixture dimensions are justified by architectural duties and are explicitly synthetic.

### F. Keep the site perfectly flat

Rejected.

A small real level relationship is necessary to force DPL-08 to address absolute datum, threshold and plinth conditions rather than silently inherit a zero plane.

### G. Add a severe sewer/tree/heritage/flood problem

Rejected for the canonical fixture.

Those are valuable later challengers, but loading them into the first Reference Site would confuse ordinary integration with adversarial special-case testing.

### H. Leave all neighbours absent

Rejected.

That would make a London-context deployment fixture artificially frictionless and would postpone basic context/privacy/daylight questions unnecessarily.

Exact openings remain unknown until DPL-10 establishes the due evidence.

## “Magic site” adversarial test

### Does the plot centre the house automatically?

No. The house is asymmetric within the parcel, with more territory on the technical/service flank.

### Is the house compass orientation inherited from model coordinates?

No. The house is rigidly rotated 180° so the principal front addresses a north-side street and the private garden lies south.

### Are ground conditions declared safe?

No. They remain unknown.

### Are drainage and utilities magically available at the correct coordinates?

No. Only broad urban-network presence is assumed; routes/capacity/connections remain unknown.

### Are neighbours absent?

No. Approximate two-storey side masses are present.

### Are neighbour windows conveniently missing?

They are explicitly unknown, not asserted absent. DPL-10 will decide when exact window evidence is due.

### Is landscape empty?

No. One mature rear-garden tree exists.

### Is the tree conveniently unprotected and structurally irrelevant?

No. Protection/root implications remain unresolved.

### Is there no private-law risk?

No. Single-site control is assumed for the fixture, but covenants/easements/rights remain unknown until DPL-11.

### Does the site guarantee planning success?

No.

No planning-policy test has yet been applied.

### Does the fixture guarantee Reference House compatibility?

No.

DPL-RS-01 has not yet been through DPL-08/09/10/11/13. It is an input, not a pass certificate.

## Downstream consequences

### DPL-08 — site interface

DPL-08 now has concrete conditions to resolve:

- house FFL +0.100 m against modest falling ground;
- street/front approach over 5.2 m;
- 3.0 m technical-side field;
- 2.4 m principal-side field;
- 14.0 m rear garden/logistics field;
- mature rear-west tree;
- unresolved foundations/drainage/utilities;
- physical street/service access capacity.

DPL-08 must not change these assumptions merely because a preferred detail is inconvenient. If a fixture condition is genuinely badly chosen, revise the Reference Site explicitly with reasons.

### DPL-09 — England regulatory target

DPL-09 can identify which site claims become relevant to new-dwelling Building Regulations applicability/methods and which additional site evidence would be required at each assurance profile.

### DPL-10 — London planning target

DPL-10 can use the fixture to ask which planning-case facts are missing, especially:

- exact neighbour openings/context;
- site capacity/context evidence;
- access/parking/cycle/refuse evidence;
- tree/admin status;
- flood/ecology/environmental classifications;
- borough/local target identity.

The planning inventory may force a Reference Site v0.2 with additional **claims**, but should not silently rewrite v0.1.

### DPL-11 — due diligence

DPL-11 can use the explicit unknown set to establish what minimum evidence is needed for:

- ground;
- sewer/drainage;
- utilities;
- title/private rights;
- construction access;
- tree/root conditions.

### DPL-14 — real-plot corpus

The corpus should treat DPL-RS-01 as one synthetic fixture, not as the centre of an empirical distribution.

Real plots should be allowed to be:

- narrower;
- deeper/shallower;
- differently oriented;
- sloping;
- tree constrained;
- irregular;
- attached to different street contexts;
- affected by real private and planning constraints.

### DPL-16 — deployment envelope

No minimum site dimensions are inferred from DPL-RS-01.

Only real deployment trials may earn an envelope.

## Machine-readable fixture decision

DPL-07 does **not** yet add a TypeScript/JSON fixture.

Reason:

- the architectural/site claim set is now stable enough for research;
- DPL-09/10/11 are specifically intended to attack what facts are due;
- encoding a schema now would harden a site representation before those inventories have challenged it;
- DPL-12 remains the authorised implementation integration point.

The canonical v0.1 record is therefore this restart-safe site definition.

A later machine fixture should preserve the exact claim IDs and geometry or record an explicit migration.

## DPL-07 acceptance check

The Reference Site passes this packet if a future reader can answer, without inference:

1. what parcel geometry is authored;
2. where geographic north and street/garden lie;
3. how the controlled Reference House is transformed onto it;
4. what side/front/rear access territories exist;
5. what topography is assumed;
6. what neighbour/tree context exists;
7. what ground/drainage/utility/title/environment facts remain unknown;
8. which statements are synthetic assumptions rather than real evidence;
9. which later packet owns each missing interpretation/response;
10. why the fixture is neither a magic clean site nor a claim of London typicality.

`DPL-RS-01-SM-v0.1` satisfies those conditions at foundation/research scope.

## Packet conclusion

The Reference House no longer floats in a white void.

It now has one explicit synthetic land context:

> **a 17.4 × 30.0 m north-fronting / south-garden parcel, with the house rigidly rotated 180°, asymmetric 3.0/2.4 m side fields, a 5.2 m front approach, 14.0 m rear garden, modest site fall, ordinary neighbouring massing and one mature tree—while ground, drainage, utility, legal and several planning-case facts remain visibly unresolved.**

That is enough to make the next deployment questions concrete without pretending they are solved.

The fixture remains subordinate to evidence.

If DPL-09, DPL-10, DPL-11 or later real-plot work proves that a canonical assumption is misleading, the project should version the Reference Site rather than defend it by incumbency.
