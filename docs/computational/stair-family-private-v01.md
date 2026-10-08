# Stair Family ST-PRIVATE-01 — Private Timber Stair with Straight Flights and Rectangular Landings

**Status:** H1 paper-domain stair family v0.1; structural/product adequacy remains external evidence  
**Purpose:** give the bounded two-storey H1 research house a credible vertical-circulation family without turning the computational model into a bespoke staircase-design system.  
**Structural status:** stair geometry and opening/support topology belong to the semantic model; member/fixing/trimmer adequacy remains scoped external evidence under SAB-H1-01.  
**Regulatory status:** Part-K route represented conceptually; whole-house fire/accessibility roles remain target/context dependent.  
**Construction status:** research family, not construction specification or Reference House stair selection.

> **The stair is simultaneously geometry, circulation, structure, guarding and escape topology. Those roles must remain coordinated without turning “stair” into one giant compliance flag.**

## 1. Base family

ST-PRIVATE-01 covers:

- one private stair serving one dwelling;
- ground-to-first-floor circulation;
- one or two straight flights;
- rectangular landings;
- closed risers;
- conventional timber construction;
- conventional handrail/guarding;
- ordinary floor opening/trimmer condition;
- no winders, spiral/helical or alternating-tread geometry in v0.1;
- no sculptural/cantilevered stair;
- no basement stair in the base family.

A 90° or 180° change of direction can be represented through a rectangular landing rather than tapered treads.

This is a competence boundary, not a judgement that other stairs are architecturally inferior.

## 2. Why this family

The H1 domain requires one credible two-storey circulation route.

A simple private timber stair is ordinary, geometrically bounded, compatible with conventional floor openings and sufficient to test topology, hierarchy, section and cross-domain consequences.

Winders and bespoke stair geometry can become separate families if real architectural work earns them.

## 3. Semantic entities

The family can contribute:

- stair and flight identities;
- bottom/intermediate/top landings;
- tread/riser pattern;
- handrail and guarding occurrences;
- stair void / floor opening;
- floor-trimmer relationship;
- lower and upper circulation nodes;
- headroom volume;
- under-stair volume.

These are conceptual identities. The author should normally place/configure the stair as one meaningful circulation object rather than manually assembling a regulatory checklist.

## 4. Part-K geometry route

For a private stair in a dwelling, the current Approved Document K route provides the research envelope used by the H1 family:

- rise: **150–220 mm**;
- going: **220–300 mm**;
- maximum pitch: **42°**;
- ordinary relationship: **2R + G between 550 and 700 mm**;
- consistent rise/going through a flight;
- minimum headroom: **2.0 m** over the stair access route;
- landings at top and bottom of each flight with width and length at least as great as the smallest flight width.

These values belong to the selected target route, not to timeless stair doctrine.

## 5. H1 family width

For v0.1:

**nominal clear stair width: >=900 mm — H1 DOMAIN REQUIREMENT**

This is not presented as a universal Part-K minimum.

It gives the research family a useful ordinary domestic envelope and avoids optimising H1 around unusually tight stairs. A different project/accessibility profile may select another family or width.

## 6. Rise / floor-height derivation

The source should author:

- lower finished-floor level;
- upper finished-floor level;
- available plan envelope;
- stair family.

A future implementation may derive/select a valid integer riser count and corresponding rise/going state inside the target/family envelope.

The model must not silently alter the upper floor datum merely to make the stair fit. If no supported geometry fits, that is a legitimate design failure.

## 7. Landings and headroom

Landings participate in:

- stair safety;
- circulation route;
- door conflict;
- architectural arrival;
- fire/escape topology.

Headroom should be represented as a spatial clearance volume over flights, landings and the upper-floor opening.

This exposes an important dependency: **floor geometry and stair geometry are co-dependent**. The stair cannot be checked meaningfully after the floor opening has become dumb geometry.

## 8. Handrails and guarding

Target-derived handrail and guarding obligations remain distinct from H1 family preferences.

For example, H1's preference for handrails on both sides can be a project/domain quality choice even where the regulatory route would not require both at the selected width.

Similarly, guarding geometry and structural adequacy belong to different proof classes: the target may establish where guarding is required, while product/structural evidence establishes its capacity.

## 9. Riser/tread family

H1 v0 uses:

- closed risers;
- consistent tread/riser pattern;
- ordinary slip-resistant domestic finish;
- no open-riser option.

That simplifies the first family. It is not a doctrine against open risers.

## 10. Structural graph contribution

The stair creates support relationships and a floor opening:

~~~text
STAIR FLIGHT
    ↓
BOTTOM / INTERMEDIATE / TOP SUPPORT
    ↓
FLOOR TRIMMER / WALL / LANDING STRUCTURE
    ↓
BUILDING STRUCTURE
~~~

The floor opening generates:

- joist interruption;
- trimming;
- edge support;
- guarding;
- headroom obligations.

Under SAB-H1-01, external structural evidence may cover stair members, fixings, landings, floor trimmers, local reactions and guarding loads while the semantic model retains source geometry, support topology and evidence dependencies.

## 11. Circulation topology

The stair is a vertical route, not only an assembly.

It connects lower and upper circulation nodes and may carry contextual roles such as:

- principal circulation;
- secondary circulation;
- escape contribution;
- accessibility-profile role.

Those are relationships, not permanent properties such as `isMainStair = true` or `isEscapeStair = true`.

## 12. Fire / means-of-escape contribution

The stair family contributes route identity, connected storeys, landings, enclosure/wall relationships and destinations.

The whole-house fire strategy decides whether the stair must be protected, enclosed or associated with particular doorsets/escape provisions.

ST-PRIVATE-01 does **not** self-declare `FIRE COMPLIANT`.

## 13. Accessibility contribution

The selected accessibility target may create different circulation requirements. Migration between accessibility profiles should therefore invalidate affected stair/circulation evidence where appropriate.

H1 must not bake one occupancy/accessibility category into the stair ontology permanently.

## 14. Architectural grammar and hierarchy

The stair can carry architectural rank, arrival sequence, axis relationships and sectional prominence.

Those belong to G-01/project grammar or another architectural language, not the technical stair family.

A technically valid stair can fail architectural order; an architecturally compelling stair can sit outside this technical family.

## 15. Under-stair space and service conflicts

Under-stair volume should remain explicit. It may be solid/inaccessible, storage, service access or another project use.

The stair opening also creates a no-go/coordination zone for floor/ceiling services and structural members. Moving the stair can therefore re-route or invalidate service and structural evidence.

The stair family does not own those systems; it exposes the dependency.

## 16. Evidence model

### Target evidence

- Part-K target version;
- selected accessibility/fire profiles.

### Family/product evidence

- stair construction/product;
- handrail/guarding family;
- fixing/support assumptions.

### Structural evidence

- stringers/landings/trimmers/fixings/guarding loads.

### Occurrence/as-built evidence

- actual floor-to-floor height;
- riser consistency;
- going;
- headroom;
- landing clearances;
- guarding/handrails;
- installed product identity;
- measured construction where required.

## 17. Mutations

### ST-M01 — raise upper floor

Expected: riser geometry and product evidence become stale while unrelated room/window evidence may remain current.

### ST-M02 — shrink stair plan envelope

Expected: no supported rise/going/pitch solution may exist; fail rather than silently steepen beyond the target route.

### ST-M03 — move upper-floor opening

Expected: headroom and trimmer evidence re-evaluate independently.

### ST-M04 — remove guarding

Expected: fall-protection obligation fails while rise/going can remain valid.

### ST-M05 — add door swing onto landing

Expected: landing/circulation conflict while member capacity may remain current.

### ST-M06 — migrate accessibility target

Expected: accessibility-dependent circulation evidence re-evaluates while unrelated Part-K evidence may remain current.

### ST-M07 — convert to open risers or winders

Expected: leave the base family and require a supported extension/alternate route rather than silently stretching v0.1.

## 18. H1 paper result

ST-PRIVATE-01 closed the bounded paper programme's vertical-circulation gap at the required research level:

~~~text
vertical route semantics        H1 PAPER SEMANTICS
rise/going/pitch target checks  TARGET-RULE CONCEPT
landing/headroom geometry       MODELLED RELATIONSHIPS
guarding/handrail applicability TARGET + PRODUCT EVIDENCE
floor opening/trimmer topology  MODELLED RELATIONSHIPS
stair structural adequacy       EXTERNAL ENGINEERING
whole-house fire role           BUILDING-SCOPE
architectural hierarchy         G-01 / PROJECT SCOPE
installation evidence           PHYSICAL EVIDENCE
~~~

It did not create an executable general stair solver or release-ready stair design.

## 19. Current boundary

A real project still requires an actual stair construction/product route, floor-opening/trimmer engineering, fire/escape coordination, accessibility review and competent professional attack.

Those are project proof requirements, not an unfinished H1-paper queue. Reference House may require a different stair family or geometry; H1 does not constrain the architecture merely because this family was useful for computational research.

## 20. Source anchors

- Approved Document K: https://www.gov.uk/government/publications/protection-from-falling-collision-and-impact-approved-document-k
- Approved Document M Volume 1: https://www.gov.uk/government/publications/access-to-and-use-of-buildings-approved-document-m
- Approved Document B Volume 1: https://www.gov.uk/government/publications/fire-safety-approved-document-b