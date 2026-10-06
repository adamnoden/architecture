# Supported Domain — Candidate v0.3

**Status:** Gate-B capability definition draft  
**Purpose:** define the bounded world within which a future compiler may make strong claims without confusing architecture, regulation or project ambition with what the system can actually establish  
**Implementation:** none

> **The supported domain is the compiler's competence boundary. It is not the limit of architecture.**

## 1. Why the domain exists

Strong guarantees require narrow competence.

A universal building compiler would need to understand every structural system, site condition, building type, regulatory route, material, fire strategy, construction process and architectural morphology. That is not a credible first research target.

The better model is **closed but extensible**.

Inside the domain, entities and relationships are known, technical families have bounded proof routes, interfaces are understood and evidence expectations are explicit. Outside it, a design is not automatically wrong or unlawful; the compiler simply stops claiming native proof.

## 2. Domain is not target, grammar, doctrine or project

~~~text
BUILD CONFIGURATION
    =
COMPILER TARGET
    +
SUPPORTED DOMAIN
    +
ARCHITECTURAL GRAMMAR
    +
LONG-LIFE HOUSE DOCTRINE PROFILE
    +
PROJECT / SITE CONFIGURATION
    +
SOURCE MODEL
~~~

These answer different questions:

- **Compiler target:** which external normative environment applies?
- **Supported domain:** what building types, systems and parameter ranges can the compiler reason about?
- **Architectural grammar:** what design language is selected?
- **Doctrine profile:** which Long-Life House propositions are mandatory?
- **Project/site configuration:** what particular site, brief, climate, ground and client facts apply?

A detached masonry house can be technically inside H1 and fail G-01. A beautiful G-01 house can sit outside supported structural competence. Those distinctions should remain visible.

## 3. First prove the compiler on ordinary construction

The Long-Life House contains experimental systems such as the seated floor structure, architectural backplane, replaceable wall lining and finish-agnostic floor platform.

None should define the trusted baseline before its own calculation, prototype and evidence work is complete.

The first whole-house domain should therefore use the best conventional or already established technical answer wherever practical.

That isolates the computational research question:

> **Can the compiler architecture work on a technically ordinary house?**

Experimental assemblies can enter later as explicit domain extensions once they earn promotion.

## 4. Two useful domain scales

### S0 — reference-slice domain

The smallest integrated fixture: one principal room edge, one external masonry wall bay, one window opening, one upper-floor bearing, one local service/interface condition and the relevant boundary/evidence obligations.

S0 exists to test semantics, obligation generation, evidence dependencies, target interaction and controlled mutation. It is a research fixture, not a miniature product.

### H1 — first whole-house trusted domain

A deliberately narrow family of complete houses. H1 should be defined before software implementation, while exact engineering envelopes remain open until competent evidence exists.

## 5. H1 building/use scope

Provisional inclusion:

- new-build;
- single-household dwelling;
- low-rise and detached;
- private domestic occupation;
- no change of use;
- no existing-building fabric;
- no heritage-designation dependency;
- one or two principal storeys;
- roof space only within a supported roof/use condition;
- no basement in H1.

Detached comes first because it removes party-wall, attached-neighbour fire/acoustic, ownership and adjoining-construction complications that are not central to testing the compiler concept.

## 6. H1 morphology

Initial geometry should be intentionally legible.

Include orthogonal primary plans, rectangular or composited-rectangular rooms, simple projections/recesses, conventional openings, one coherent volume or a few clearly related volumes, conventional stairs and simple pitched/hipped roof families once defined.

Exclude initially: doubly curved structure, free-form shells, major cantilevers, complex transfers, highly irregular floors, extreme split levels, occupiable bridges, long-span halls and deep atria needing unusual smoke/fire engineering.

These are competence exclusions, not aesthetic judgements.

## 7. H1 structural family

### Walls

Working baseline: conventional masonry, dense inner leaf where compatible with the selected family, ordinary opening/lintel families within declared limits, and no assumption that removable lining is structural.

### Upper floors

Working baseline:

- engineered timber I-joists;
- manufacturer/engineer-supported span, depth and centres;
- certified restraint-type masonry hanger or another ordinary supported connection family;
- structural deck providing diaphragm action;
- routine service distribution kept out of the joist zone by default.

For **H1 v0**, [SAB-H1-01](structural-assurance-boundary-h1-v01.md) fixes the assurance boundary: structural identity, topology, geometry and dependencies are native; member, connection, stability and foundation adequacy may use scoped external engineering evidence. Native proof families can be admitted later.

### Local beams / trimmers

Only through defined families and envelopes. LVL or steel may eventually serve stairs, larger openings, local collectors or concentrated conditions, but H1 should not depend on arbitrary transfer design.

### Stability

H1 must eventually declare the lateral load path, wall restraint, diaphragm assumptions and robustness/tie strategy where applicable. It cannot be called structurally supported until these are explicit.

### Foundations

Do not invent a native foundation domain ahead of geotechnical/structural research. **H1 v0 uses scoped external foundation/ground evidence.** A simple shallow-foundation family may be promoted later when its site envelope and proof route are bounded.

## 8. H1 envelope family

Candidate baseline:

- facing-brick outer leaf;
- drained cavity;
- insulation;
- dense masonry inner leaf;
- explicit primary environmental boundary;
- conventional internal finish as trusted control.

Support a small finite set of wall families rather than arbitrary user-built layer stacks.

Each family should eventually declare structural role, thermal route/properties, moisture strategy, air-control strategy, opening/detail families, permitted penetrations, floor/roof compatibility and evidence envelope.

## 9. H1 internal finish baseline

### W1 — conventional mineral/plaster finish

Trusted control for low-service walls because it is technically ordinary and does not make compiler research depend on W2.

### W2 — backplane + removable mineral lining

An extension candidate only. Promotion requires successful wall-bay prototype, load classes, boundary behaviour, acoustic/tactile acceptance, tolerance strategy, representative-installer success and evidence package.

## 10. H1 floor-finish baseline

Start with structural deck, conventional acoustic/levelling build-up and conventional finish-specific timber/tile/stone systems.

The full finish-agnostic removable platform remains outside H1. A local access band can become an extension if physical evidence justifies it.

Conventional construction remains the baseline; novelty earns promotion.

## 11. H1 roof family

The first selected family is:

- [RF-TRUSS-DUO-01 — Simple Duo-Pitched Trussed-Rafter Cold Roof](roof-family-trussed-duopitch-v01.md).

It uses prefabricated timber trussed rafters, simple rectangular/duo-pitched geometry, an uninhabited roof void, ceiling-level thermal/air boundary and manufacturer/engineer structural design as scoped external evidence under SAB-H1-01.

A supported roof family must define geometry, spans, bearings, stability, openings, insulation/air/moisture strategy, drainage, maintenance access and evidence route.

Complex flat/green roofs, large rooflights and unusual structures remain later extensions unless separately researched.

## 12. H1 openings

Openings should be finite supported families: ordinary window in cavity masonry, external door, internal door and selected larger opening within declared support limits.

The Long-Life House pattern **permanent opening / replaceable window** fits particularly well. A supported opening family should carry its head support, jamb/sill/head geometry, weather/thermal/air transition, fixing/replacement interface, opening-component envelope and evidence.

### Principal entrance

The first entrance family is [ENTR-DOOR-MCW-01 — Principal External Doorset in Masonry Cavity Wall](entrance-family-principal-masonry-v01.md), treating threshold/access, security, weather, air, thermal continuity, moisture, structure, replacement and arrival as one composed interface.

## 13. H1 service topology

Early supported strategies may include:

- controlled utility entry;
- compact plant/service hub;
- planned vertical routes;
- horizontal service spine;
- [SR-ROOM-LOW-01](service-family-room-low-level-v01.md) for accessible low-level room distribution;
- high-service-room service wall;
- designed structural penetrations;
- water-damage-safe routes;
- source-capture kitchen extraction;
- accessible principal isolation;
- explicit drainage/fall routes.

These are attractive first computational targets because much of their value is topological.

Do not initially permit arbitrary routing through any available void, random masonry chasing or uncontrolled drilling/notching of primary structure.

## 14. H1 heating, ventilation and electrical systems

The domain should support named families rather than generic “HVAC”.

### Heating

First family:

- [HEAT-ASHP-RAD-01 — Air-to-Water Heat Pump + Low-Temperature Radiators](heating-family-ashp-radiators-v01.md).

It uses replaceable external plant, accessible internal hydraulic hub, replaceable low-temperature radiators, accessible distribution routes and competent external heat-loss/sizing/commissioning evidence.

Embedded wet underfloor heating is not an H1 baseline because it places a large service network inside the floor fabric.

### Ventilation

The current H1 posture is **passive first, with bounded mechanical assistance where passive driving forces cannot discharge the performance obligation**.

The preferred research family is [VENT-HYBRID-STACK-01](ventilation-family-hybrid-stack-v01.md): purpose-provided supply openings, explicit transfer routes and near-vertical extract stacks arranged so useful passive flow remains possible, with low-pressure mechanical assistance available when required. It is **research-supported, not yet promoted to trusted H1 status**; competent whole-house airflow/performance proof remains external.

[VENT-CMEV-01](ventilation-family-cmev-v01.md) remains a supported fallback and the historical S2 family. MVHR remains a legitimate higher-complexity alternate where heat recovery, filtration, external noise/pollution or winter comfort justify the second duct network and additional maintenance burden.

The current decision is recorded in [H1 Ventilation Strategy Decision v0.2](h1-ventilation-strategy-decision-v02.md), which supersedes the earlier CMEV-first planning decision without rewriting frozen S2 evidence.

### Electrical / data

Use competent electrical topology, room-side service zones/defined routes and controlled structural crossings. Native support still requires named families rather than an assertion that all systems are understood.

## 15. H1 wet rooms

Wet rooms combine water, drainage, ventilation, electrical zones, waterproofing, maintenance and finish; the first domain should constrain them deliberately.

H1 uses [WET-CORE-01 — Clustered Wet Core with Zonal Service Walls](wet-service-family-core-v01.md), preferring clustered bathrooms/utility/kitchen, short gravity branches, accessible stacks, zonal hot/cold isolation, adjacent plant/hot-water cylinder, explicit Part G/H routes and accessible traps, valves and rodding points.

Exact waterproofing remains a separate product/detail family.

## 16. H1 site envelope

Whole-house proof needs a bounded site context. Candidate restrictions include ordinary low-rise residential site, non-extreme topography, no basement or retaining-wall-dominated design, no known flood-driven special structural form, no unresolved contamination constraint, ordinary construction access, and declared wind/exposure and ground conditions.

Do not invent exact thresholds until the technical research exists. Unknown site facts become explicit assumptions or external evidence obligations.

## 17. H1 fire and vertical circulation

The first domain should avoid novel fire engineering: simple single-family strategy, ordinary escape/protection routes inside supported targets, no atrium smoke-control system, mixed use, basement complexity or unusual compartmentation.

### Stair family

[ST-PRIVATE-01 — Private Timber Stair with Straight Flights and Rectangular Landings](stair-family-private-v01.md) supports one/two straight flights, rectangular landings, closed risers, conventional guarding/handrails, private-dwelling Part K geometry and native floor-opening/headroom/circulation semantics. Member, fixing and floor-trimmer adequacy remain scoped external structural evidence.

Winders, spirals, alternating treads and sculptural stairs remain outside the first family. Fire/escape and accessibility roles remain contextual obligations rather than permanent properties of the stair entity.

### Fire / escape family

[FIRE-H1-2S-EGRESS-01 — Two-Storey Dwelling with Escape-Window Route](fire-family-two-storey-egress-v01.md) is intentionally narrow: detached ground+one-upper-storey dwelling, upper storey within the selected ≤4.5 m route, one ordinary stair, escape windows to upper habitable rooms, ordinary alarm obligation and ground hall connection to the principal final exit.

Protected-stair, open-plan and taller arrangements are separate families. This family remains a research candidate until competent external review.

## 18. Grammar and doctrine remain independent

H1 must not encode “Georgian”, symmetry, classical openings or Palladian proportions. Those belong to G-01 or another grammar.

Likewise, a project may pass the technical domain and regulatory target while failing the Long-Life House doctrine:

~~~text
SUPPORTED DOMAIN       PASS
REGULATORY TARGET      PASS
STRUCTURE              PASS
LONG-LIFE DOCTRINE     FAIL
~~~

This separation is a test of the system architecture, not an inconvenience.

## 19. Native, external and unsupported capability

Each capability should be classified as:

### NATIVE
The compiler discharges the obligation with trusted internal rules/calculations/evidence families.

### EXTERNAL
The condition is permitted, but proof comes from a competent external source.

### UNSUPPORTED
No accepted proof route exists. Change the design, extend the domain or leave the compiler guarantee.

Half-support is worse than an explicit boundary.

## 20. Provisional H1 capability matrix

| Area | H1 initial posture | Notes |
|---|---|---|
| New detached single-family house | Native candidate | First whole-house typology |
| One/two storeys | Native candidate | Exact constraints later |
| Basement | Unsupported | Later extension |
| Orthogonal plan | Native candidate | Curvilinear special cases later |
| Cavity masonry envelope | Native candidate | Finite family library |
| Engineered I-joist upper floor | Native topology / external adequacy in H1 v0 | SAB-H1-01 |
| Conventional plaster/mineral lining | Native candidate | Trusted control |
| W2 removable lining/backplane | Extension candidate | Prototype/evidence required |
| Full removable floor platform | Unsupported initially | Experimental |
| Local floor-access band | Extension candidate | Prototype dependent |
| Simple duo-pitched trussed roof | Supported candidate | RF-TRUSS-DUO-01; adequacy external, geometry/boundaries semantic/native |
| Arbitrary steel frame | Unsupported | Defined local beams may be allowed |
| Complex transfer structure | Unsupported | Outside initial purpose |
| Simple masonry openings | Native semantics / external structural adequacy initially | Boundary family can be native while capacity remains external |
| Long-span opening | External/unsupported | Future structural domain |
| Controlled service spine | Native candidate | Strong pattern basis |
| High-service wall | Native candidate | Build-up to define |
| Arbitrary service routing | Unsupported | Deliberate |
| Hybrid passive-stack ventilation | Preferred research family / external performance proof | VENT-HYBRID-STACK-01; evidence gate open |
| Central mechanical extract | Supported fallback | VENT-CMEV-01; historical S2 family |
| MVHR | Supported-domain alternate | Higher complexity; site/evidence dependent |
| Ordinary site | Candidate | Thresholds unresolved |
| Complex retaining/site structures | Unsupported | Later extension |
| Foundations | External in H1 v0 / future native family | SAB-H1-01 |
| Standard prescriptive fire strategy | Candidate | Target-dependent |
| Fire-engineered alternative | External/unsupported | Not native H1 |
| G-01 Georgian grammar | Separate input | Not domain capability |
| Long-Life doctrine | Separate profile | Not domain capability |

Nothing marked “native candidate” is yet a software capability. The table records research intent.

## 21. Domain extensions are admitted deliberately

An extension should state:

1. new semantics;
2. affected obligations;
3. engineering evidence;
4. regulatory implications;
5. interactions with existing assemblies;
6. conformance tests;
7. reference example;
8. failure/unsupported behaviour.

Potential future extensions include W2 removable lining, local access floor, semi-detached/party wall, terrace, basement, alternative structure and flat-roof families.

## 22. Promotion rule for experimental Long-Life systems

An experimental assembly enters the native domain only after:

- **architectural evidence** — tactile, visual and tectonic acceptance;
- **technical evidence** — relevant structure, fire, acoustics, moisture and other performance resolved;
- **workmanship evidence** — competent installers can achieve it within declared tolerances;
- **replacement evidence** — claimed reversibility works at 1:1;
- **domain specification** — parameter envelope and incompatible conditions explicit;
- **conformance cases** — known passes and failures exist.

Physical prototypes therefore feed computational capability directly.

## 23. S0 paper compilation

See [Domain S0 — Paper Compilation Fixture](paper-compilation-s0.md).

The first fixture uses a principal room edge, cavity masonry wall, replaceable window, I-joist bearing, conventional W1 finish, one local service route/penetration, relevant boundary obligations, maintenance route and evidence plan.

A comparative candidate compile may substitute W2:

~~~text
S0-A  conventional trusted baseline
S0-B  selective tectonic candidate
~~~

This tests the compiler architecture without pretending W2 has earned native support.

## 24. What H1 deliberately leaves out

H1 does not attempt arbitrary architecture, conservation/listed work, conversions, apartments/high-rise/commercial uses, complex fire engineering, basements, extreme sites, arbitrary structural systems, free-form geometry, every HVAC system, every product or every compliance route.

A narrow useful compiler is more credible than a broad dishonest one.

## 25. Reference House may exceed H1

The architecture should not be constrained by current compiler research merely because the compiler is incomplete.

Where necessary, record:

> **Reference House design exceeds current supported-domain capability here.**

The domain can later grow if the condition proves valuable and supportable.

Architecture leads; the compiler earns coverage.

## 26. Open questions

- Is detached-only materially cleaner than including semi-detached housing?
- Is two storeys enough, or should a light attic/third level enter?
- Which foundation family gives the best first native proof envelope?
- How much local steel can exist before H1 becomes arbitrary structural engineering?
- What exact span/opening envelopes are useful?
- Which wall families belong beyond the Reference House masonry family?
- How much of heating/ventilation design should become native rather than external evidence?
- How should sloping sites be bounded?
- What changes materially when party walls enter?
- Should a later “all-native proof” tier exist beside H1 v0's scoped external-evidence model?
- What is the smallest H1 that still permits enough architectural variety to justify a product?

## 27. Current programme position

The internal paper sequence is now complete through **H1-PAPER-01** and the final internal red team. The current frozen capability record is [H1 Capability Matrix v0.5 — Post-H1-PAPER Freeze](h1-capability-matrix-v05.md).

The whole-house paper test supports the central semantic / obligation / evidence architecture at bounded-house scale, but it does **not** authorise a release claim: competent technical and physical evidence remains absent, and external professional review is still open.

The current development sequence is therefore:

1. obtain competent external attack using the [H1-PAPER External Review Pack v0.2](external-review-pack-h1-paper-v02.md);
2. implement the minimal executable semantic/compiler vertical slice defined in [Research Programme v0.5](research-programme-v05.md);
3. test source well-formedness, obligation derivation, evidence scope and selective invalidation in executable form;
4. after that kernel succeeds, exercise doctrine-driven extensions beginning with external maintenance geography;
5. use physical/product prototyping where doctrine meets workmanship;
6. decide only then whether heavier geometry, CAD, solver and product architecture have been earned.

S0, S1 and S2 remain valuable frozen research fixtures. In particular, S2's CMEV assumption is historical evidence and is not retroactively rewritten to match the later passive-first ventilation decision.

## 28. Current conclusion

The first supported domain should be **boring in exactly the right ways**: ordinary masonry, certified structural families, pitched roofs, known service routes and conventional finishes wherever experimental alternatives have not yet earned admission.

Architectural ambition can then live in spatial grammar, proportion, hierarchy, service topology, interface design, maintainability and later evidence-backed extensions.

> **The compiler should prove itself on ordinary construction before asking novel construction to prove itself through the compiler.**