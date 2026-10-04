# Stair Family ST-PRIVATE-01 — Private Timber Stair with Straight Flights and Rectangular Landings

**Status:** supported-family research candidate v0.1  
**Purpose:** close the first unavoidable vertical-circulation gap in a two-storey H1 dwelling without turning the compiler into a bespoke staircase-design system.  
**Structural status:** stair geometry and opening/support topology native; member/fixing/trimmer adequacy scoped external evidence under SAB-H1-01.  
**Regulatory status:** Part-K route modelled; whole-house fire/accessibility roles remain target/context dependent.  
**Construction status:** research family, not construction specification.

> **The stair is simultaneously geometry, circulation, structure, guarding and escape topology. The compiler must keep those roles coordinated without turning “stair” into one giant compliance flag.**

## 1. Base family

ST-PRIVATE-01 supports:

- one private stair serving one dwelling;
- ground-to-first-floor circulation;
- one or two straight flights;
- rectangular landings;
- closed risers;
- conventional timber stair construction;
- conventional handrail/guarding;
- ordinary floor opening/trimmer condition;
- no winder treads in v0.1;
- no spiral/helical stair;
- no alternating-tread stair;
- no sculptural/cantilevered stair;
- no basement stair in the first family.

The stair may be:

- one straight flight; or
- two straight flights joined by a rectangular intermediate landing.

A 90° or 180° change of direction can be represented through the landing relationship rather than tapered treads.

## 2. Why this family

The current H1 domain needs a credible two-storey circulation route.

A simple private timber stair is:

- ordinary;
- architecturally legible;
- geometrically bounded;
- compatible with standard floor openings/trimmers;
- separable from the more difficult whole-house fire strategy;
- sufficient to test topology, hierarchy and section in S2/S3.

Winders and bespoke stair geometry can be later extensions.

## 3. Semantic entities

The family can contribute:

- STAIR-S01;
- FLIGHT-F01;
- optional FLIGHT-F02;
- LANDING-L0 bottom;
- optional LANDING-L1 intermediate;
- LANDING-L2 top;
- TREAD/RISER pattern;
- HANDRAIL-HR01 / HR02;
- GUARDING-G01;
- STAIR-VOID / FLOOR-OPENING OPN-S01;
- FLOOR-TRIMMER relationship;
- lower circulation node;
- upper circulation node;
- headroom volume;
- under-stair volume.

These are conceptual identities.

The author should normally place/configure the stair as one meaningful circulation object.

## 4. Part-K geometry route

For a private stair in a dwelling, the current Approved Document K guidance gives the research envelope:

- rise: **150–220 mm**;
- going: **220–300 mm**;
- maximum pitch: **42°**;
- ordinary relationship: **2R + G between 550 and 700 mm**;
- rise/going consistent through a flight;
- minimum headroom: **2.0 m** over the stair access route;
- landings at top and bottom of each flight with width and length at least as great as the smallest flight width.

These are target-route values, not eternal stair-design truths.

The compiler target owns them.

The stair family supplies the semantic geometry to which they apply.

## 5. H1 family width

Approved Document K does not give a general minimum width for an ordinary internal private stair in the same way it does for several non-domestic stair categories.

H1 therefore needs its own bounded family envelope.

For v0.1:

**nominal clear stair width: >=900 mm — H1 PROJECT/DOMAIN REQUIREMENT**

This is deliberately labelled as a domain requirement, not Part K.

Why use it?

- gives a useful ordinary domestic circulation width;
- keeps landings/openings predictable;
- avoids optimising H1 around unusually tight stairs;
- gives S2 a clear circulation geometry.

A future accessibility profile may require a different stair family/envelope.

## 6. Rise / floor-height derivation

The source should author:

- lower finished-floor level;
- upper finished-floor level;
- available plan envelope;
- stair family.

The compiler derives/selects a valid integer riser count and corresponding rise/going state inside the target/family envelope.

Example only:

~~~text
floor-to-floor height = H
number of risers = N
rise = H / N
~~~

The compiler must not silently alter the upper floor datum merely to make the stair fit.

If no integer riser count / going / headroom arrangement fits the authored geometry:

**COMPILE FAIL / STAIR ENVELOPE DOES NOT FIT**

That is a useful early design failure.

## 7. Landings

Each flight has:

- bottom landing;
- top landing;
- optional intermediate landing.

Landing geometry participates in:

- stair safety;
- circulation route;
- door conflict;
- architectural arrival;
- fire/escape topology.

The landing must not be treated as dead stair-component geometry.

A door swing or obstruction can invalidate the circulation route even if the stair flight itself remains dimensionally valid.

## 8. Headroom volume

Headroom is represented as a spatial clearance volume over:

- flights;
- landings;
- the upper-floor opening.

For the base family:

**minimum target-route headroom = 2.0 m**

The floor/ceiling model must therefore know where:

- the stair opening begins;
- upper floor edges/trimmers occur;
- soffits/structure intrude.

This is an excellent compiler relationship:

> floor geometry and stair geometry are co-dependent.

The stair cannot be checked after the floor opening has become dumb geometry.

## 9. Handrails

For the target route:

- handrail top is modelled 900–1000 mm above pitch line/floor;
- where the stair is 1000 mm or wider, both sides require handrails under the referenced guidance.

For H1 v0, the preferred family default is:

**handrail on both sides**

even at the 900 mm family width.

This is a **project/domain quality choice**, not a claim that Part K universally requires it below 1000 mm.

A future architectural profile may integrate one handrail into wall/guarding design.

## 10. Guarding

Where the stair/landing edge creates the relevant fall risk, guarding is required.

For single-family dwellings, the current Part-K route uses:

- **900 mm guarding height** at stairs, landings, ramps and internal floor edges.

Where the building may be used by children under five:

- openings should not admit a 100 mm sphere;
- guarding should avoid readily climbable horizontal rails.

Guarding load/capacity and product design remain evidence-bearing technical propositions.

## 11. Riser/tread family

H1 v0 uses:

- closed risers;
- consistent tread/riser pattern;
- ordinary slip-resistant domestic finish;
- no open-riser option.

Part K permits certain open risers in dwellings if specific conditions are met.

H1 excludes them initially because they add:

- child-safety geometry;
- visual/tactile variation;
- another implementation branch

without increasing the first-domain value.

## 12. Structural graph contribution

The stair creates at least these structural relations:

~~~text
STAIR FLIGHT
    ↓
BOTTOM SUPPORT / LANDING
    ↓
GROUND / LOWER FLOOR

STAIR FLIGHT
    ↓
TOP / INTERMEDIATE SUPPORT
    ↓
FLOOR TRIMMER / WALL / LANDING STRUCTURE
    ↓
BUILDING STRUCTURE
~~~

The stair also creates/removes floor area through:

**FLOOR OPENING OPN-S01**

That opening generates:

- joist interruption;
- trimming;
- edge support;
- guarding;
- headroom.

These are canonical derived consequences of placing the stair.

## 13. External structural evidence

Under SAB-H1-01, external evidence may cover:

- timber stair member/stringer adequacy;
- fixings;
- landing support;
- floor trimmers;
- local joist reactions;
- guarding structural loads;
- unusual support conditions.

The compiler retains:

- source geometry;
- support topology;
- evidence scope;
- dependencies.

Moving the stair opening or changing floor-to-floor height can stale the relevant evidence.

## 14. Circulation topology

The stair is a vertical route, not only an assembly.

It connects:

~~~text
LOWER-CIRCULATION-NODE
    ↕
STAIR ROUTE
    ↕
UPPER-CIRCULATION-NODE
~~~

The route can carry:

- PRINCIPAL circulation role;
- SECONDARY circulation role;
- ESCAPE contribution;
- accessibility-profile role.

Those are contextual relationships.

Do not encode one permanent `isMainStair` or `isEscapeStair` truth into the physical stair object.

## 15. Fire / means-of-escape contribution

Approved Document K itself directs means-of-escape questions to Approved Document B.

The stair family therefore contributes:

- vertical route identity;
- connected storeys;
- landings;
- enclosure/wall relationships;
- doors opening onto/near the route;
- upper/lower destination.

The whole-house fire strategy decides whether the stair must be:

- protected;
- enclosed;
- associated with particular fire doorsets;
- part of another accepted escape route.

ST-PRIVATE-01 does **not** self-declare:

**FIRE COMPLIANT**

That belongs at building/route scope.

## 16. Accessibility contribution

For the current S1 M4(1) profile, Part M is primarily concerned with entrance-storey access/use rather than making every private upper-storey stair into a wheelchair-accessible route.

However:

- the stair remains a circulation object;
- optional M4(2)/M4(3) target changes can create different stair/vertical-circulation requirements;
- an accessibility-category migration must therefore invalidate affected stair/circulation evidence where appropriate.

H1 should not bake Category 1 forever into the stair family.

## 17. Architectural grammar / hierarchy

The stair can carry strong architectural rank.

G01-PILOT-P0 already suggests:

- principal versus service/secondary circulation distinction;
- vertical hierarchy as first-class;
- stair arrival as part of spatial order.

The technical stair family therefore exposes relationships such as:

- route class;
- arrival room/landing;
- axis relation;
- sectional prominence.

It does not prescribe:

- a Georgian stair;
- symmetry;
- one stair location.

A technically valid stair can fail architectural order.

## 18. Under-stair space

The under-stair volume is explicit.

Potential states:

- inaccessible/solid architectural volume;
- storage;
- service access;
- circulation conflict.

The compiler should know:

- headroom;
- guarding/collision risk;
- fire-strategy implications if enclosed/used;
- maintenance/service consequences.

It should not automatically fill the volume because it exists.

## 19. Service conflicts

The stair/floor opening creates a no-go/coordination zone for:

- floor services;
- ceiling services;
- structural joists/trimmers.

Moving the stair can therefore re-route or invalidate services.

This is an S2/S3 integration target.

The stair family itself does not own service design.

## 20. Evidence model

### Target evidence

- Part-K target version;
- selected accessibility/fire profiles.

### Family/product evidence

- stair construction/product;
- handrail/guarding family;
- fixing/support assumptions.

### Structural evidence

- stringers/landings/trimmers/fixings/guarding loads.

### Occurrence evidence

- actual floor-to-floor height;
- riser consistency;
- going;
- headroom;
- landing clearances;
- guarding/handrails;
- installed product identity.

### Construction evidence

- measured stair geometry;
- fixings/support;
- guarding;
- floor-opening protection.

## 21. Mutations

### ST-M01 — raise upper floor

Change upper finished-floor level without reconfiguring stair.

Expected:

- riser geometry invalid/stale;
- stair product evidence stale;
- room/window evidence unaffected.

### ST-M02 — shrink stair plan envelope

Reduce available run.

Expected:

- pitch/rise/going solver may find no supported solution;
- compile fails rather than silently steepening beyond target route.

### ST-M03 — move upper-floor opening

Headroom becomes <2.0 m.

Expected:

- K route fails;
- structural trimmer evidence stale;
- architectural stair route may remain conceptually present.

### ST-M04 — remove one guarding side

Where drop >600 mm:

- fall-protection obligation fails;
- stair rise/going remains valid.

### ST-M05 — add door swing onto landing

Expected:

- landing/circulation conflict generated;
- stair member capacity may remain current.

### ST-M06 — change target M4(1) → M4(2)

Expected:

- accessibility-dependent stair/circulation evidence re-evaluates;
- Part-K target evidence remains current unless target itself changes.

### ST-M07 — convert closed to open risers

Base family leaves supported domain.

Return:

**SUPPORTED EXTENSION REQUIRED**, even if another legal route may exist.

## 22. Complexity behavior

Ordinary authoring should look like:

> place/configure stair between Level 0 and Level 1, choose straight or two-flight landing form, select route role.

The system derives:

- riser count/rise/going;
- pitch;
- landings;
- headroom volume;
- floor opening;
- trimmer obligation;
- guarding;
- handrails;
- fire/accessibility contributions;
- evidence dependencies.

The user should not manually author a stair checklist.

## 23. H1 posture

ST-PRIVATE-01 is suitable as the first H1 stair candidate.

Current status:

~~~text
vertical route semantics        NATIVE
rise/going/pitch target checks  NATIVE
landing/headroom geometry       NATIVE
guarding/handrail applicability NATIVE / PRODUCT EVIDENCE
floor opening/trimmer topology  NATIVE
stair structural adequacy       EXTERNAL ENGINEERING
whole-house fire role           BUILDING-SCOPE / UNRESOLVED
M4 optional-category impacts    TARGET-SCOPE
architectural hierarchy         G01/PROJECT-SCOPE
installation evidence           FUTURE
~~~

This materially closes the two-storey vertical-circulation gap without supporting arbitrary staircase design.

## 24. Remaining stair work

Before H1 release:

- choose one actual timber stair construction/product route;
- define floor-opening/trimmer interface family;
- test against the eventual H1 whole-house fire/escape family;
- test M4(2) migration;
- obtain competent external review;
- decide whether one quarter-turn / half-turn configuration is enough for Reference House needs or whether a second stair family is justified.

Do not add winders merely because they are common.

## 25. Source anchors

- Approved Document K: https://www.gov.uk/government/publications/protection-from-falling-collision-and-impact-approved-document-k
- Approved Document M Volume 1: https://www.gov.uk/government/publications/access-to-and-use-of-buildings-approved-document-m
- Approved Document B Volume 1: https://www.gov.uk/government/publications/fire-safety-approved-document-b
