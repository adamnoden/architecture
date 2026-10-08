# Supported Domain — H1 Paper Domain v0.3

**Status:** frozen paper-domain capability definition; not an executable H1 support claim  
**Purpose:** define the bounded world within which strong computational claims could be made without confusing architecture, regulation or project ambition with system competence.  
**Executable status:** P0 demonstrates a minimal semantic/obligation/evidence kernel. It does **not** implement the H1 technical domain described here. See [P0 + PAT-XW-01 — Executable Gate Result](p0-pat-xw-01-result.md).

> **The supported domain is the compiler's competence boundary. It is not the limit of architecture.**

## 1. Why the domain exists

Strong guarantees require narrow competence.

A universal building compiler would need to understand every structural system, site condition, building type, regulatory route, material, fire strategy, construction process and architectural morphology. That is not a credible first target.

The useful model is **closed but extensible**.

Inside a supported domain, entities and relationships are known, technical families have bounded proof routes, interfaces are understood and evidence expectations are explicit. Outside it, a design is not automatically wrong or unlawful; the compiler simply stops claiming native proof.

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
HSA DOCTRINE / PROJECT REQUIREMENTS
    +
PROJECT / SITE CONFIGURATION
    +
SOURCE MODEL
~~~

These answer different questions:

- **Compiler target:** which external normative environment applies?
- **Supported domain:** what building types, systems and parameter ranges can the compiler reason about?
- **Architectural grammar:** what design language is selected?
- **HSA / project requirements:** which architectural commitments apply to this project?
- **Project/site configuration:** what particular site, brief, climate, ground and client facts apply?

A detached masonry house can sit inside an H1 technical family and fail G-01. A convincing G-01 house can sit outside supported structural competence. Those distinctions must remain visible.

## 3. Ordinary construction as the research baseline

The computational research deliberately avoided making experimental HSA assemblies prerequisites for testing the semantic model.

Current HSA authority makes the distinction clearer than the original paper programme did:

- the structural proposition is carried by [Decompose Structural Interface Functions](../patterns/strategies/decompose-structural-interface-functions.md); a seated connection remains an implementation challenger;
- [`HSA-P-022 — Controlled Attachment Plane`](../patterns/controlled-attachment-plane.md) is canonical, but its particular Reference House backplane implementation remains project-specific;
- [Replaceable Architectural Lining](../patterns/candidates/replaceable-architectural-lining.md) remains held behind physical evidence;
- primary-floor/changeable-layer separation is a strategy; [Selective Floor Access](../patterns/candidates/selective-floor-access.md) is held; a full-room finish-agnostic platform remains an upper-bound challenger.

The H1 paper domain therefore uses conventional or already established technical answers wherever practical. This isolates the computational question from unresolved construction invention.

## 4. Two research scales

### S0 — reference-slice domain

The smallest integrated fixture: one principal room edge, one external masonry wall bay, one window opening, one upper-floor bearing, one local service/interface condition and the relevant boundary/evidence obligations.

S0 tested semantics, obligation generation, evidence dependencies, target interaction and controlled mutation. It is a frozen research fixture, not a miniature product.

### H1 — bounded whole-house paper domain

A deliberately narrow family of complete houses used to test whether the same architecture survives whole-house composition.

H1 remains a **paper-domain research construct**. Its capability matrix records what the research model could represent, what required external evidence and what remained unsupported. It is not equivalent to implemented compiler coverage.

## 5. H1 building/use scope

The paper domain assumes:

- new-build;
- single-household dwelling;
- low-rise and detached;
- private domestic occupation;
- no change of use;
- no existing-building fabric;
- no heritage-designation dependency;
- one or two principal storeys;
- roof space only within a supported roof/use condition;
- no basement.

Detached was chosen because it removes party-wall, attached-neighbour fire/acoustic, ownership and adjoining-construction complications that were not central to the research question.

## 6. H1 morphology

The paper domain uses intentionally legible geometry:

- orthogonal primary plans;
- rectangular or composited-rectangular rooms;
- simple projections/recesses;
- conventional openings;
- one coherent volume or a few clearly related volumes;
- conventional stairs;
- simple pitched-roof families.

It excludes doubly curved structure, free-form shells, major cantilevers, complex transfers, highly irregular floors, extreme split levels, occupiable bridges, long-span halls and deep atria needing unusual smoke/fire engineering.

These are competence exclusions, not aesthetic judgements.

## 7. H1 structural family

### Walls

Working baseline: conventional masonry, dense inner leaf where compatible with the selected family, ordinary opening/lintel families within declared limits, and no assumption that a removable lining is structural.

### Upper floors

Working baseline:

- engineered timber I-joists;
- manufacturer/engineer-supported span, depth and centres;
- certified restraint-type masonry hanger or another ordinary supported connection family;
- structural deck providing diaphragm action;
- routine service distribution kept out of the joist zone by default.

For H1 v0, [SAB-H1-01](structural-assurance-boundary-h1-v01.md) fixes the assurance boundary: structural identity, topology, geometry and dependencies are represented natively in the paper model; member, connection, stability and foundation adequacy may use scoped external engineering evidence.

### Local beams / trimmers

Only through defined families and envelopes. LVL or steel may serve stairs, larger openings, local collectors or concentrated conditions, but H1 does not attempt arbitrary transfer design.

### Stability

H1 requires an explicit lateral load path, wall restraint, diaphragm assumptions and robustness/tie strategy where applicable. Structural topology is not structural adequacy.

### Foundations

H1 v0 uses scoped external foundation/ground evidence rather than claiming a native foundation proof family.

## 8. H1 envelope family

Paper baseline:

- facing-brick outer leaf;
- drained cavity;
- insulation;
- dense masonry inner leaf;
- explicit primary environmental boundaries;
- conventional internal finish as trusted control.

A supported wall family would need to declare structural role, thermal route/properties, moisture strategy, air-control strategy, opening/detail families, permitted penetrations, floor/roof compatibility and evidence envelope.

## 9. H1 internal-finish baseline

### W1 — conventional mineral/plaster finish

Trusted control for low-service walls because it is technically ordinary and does not make computational research depend on the held lining candidate.

### W2 — controlled attachment plane + removable mineral lining

Reference House / prototype extension only. P01-W2 now tests the particular implementation. Its existence does not broaden the H1 paper-domain proof boundary automatically.

## 10. H1 floor-finish baseline

The paper baseline uses structural deck, conventional acoustic/levelling build-up and conventional finish-specific timber/tile/stone systems.

A full finish-agnostic removable platform remains outside the trusted baseline. Selective access is the lower-complexity candidate where physical evidence justifies it.

## 11. H1 roof family

The selected paper family is:

- [RF-TRUSS-DUO-01 — Simple Duo-Pitched Trussed-Rafter Cold Roof](roof-family-trussed-duopitch-v01.md).

It uses prefabricated timber trussed rafters, simple rectangular/duo-pitched geometry, an uninhabited roof void, ceiling-level thermal/air boundary and manufacturer/engineer structural design as scoped external evidence under SAB-H1-01.

Complex flat/green roofs, large rooflights and unusual structures remain outside this paper family unless separately researched.

## 12. H1 openings

H1 uses finite opening families: ordinary window in cavity masonry, external door, internal door and selected larger openings within declared support limits.

The HSA relationship [Permanent Opening / Replaceable Window](../patterns/permanent-opening-replaceable-window.md) maps naturally onto the window family, but the technical family remains responsible for head support, jamb/sill/head geometry, weather/thermal/air transition, fixing/replacement interface and evidence.

### Principal entrance

[ENTR-DOOR-MCW-01 — Principal External Doorset in Masonry Cavity Wall](entrance-family-principal-masonry-v01.md) treats threshold/access, security, weather, air, thermal continuity, moisture, structure, replacement and arrival as one composed interface.

## 13. H1 service topology

The paper domain exercises service relationships that are now represented in current HSA language by, among others:

- [`HSA-P-001 — Controlled Utility Entry`](../patterns/controlled-utility-entry.md);
- [`HSA-P-002 — Plant Room as Service Hub`](../patterns/plant-room-service-hub.md);
- [`HSA-P-014 — Accessible Vertical Service Zone`](../patterns/accessible-vertical-service-zone.md);
- [`HSA-P-003 — Coherent Horizontal Service Route`](../patterns/coherent-horizontal-service-route.md);
- [`HSA-P-015 — Accessible Room Service Route`](../patterns/accessible-room-service-route.md);
- [`HSA-P-004 — High-Service-Room Service Wall`](../patterns/high-service-room-service-wall.md);
- [`HSA-P-005 — Designed Structural Penetration`](../patterns/designed-structural-penetration.md);
- [Fail-Safe Water Distribution](../patterns/strategies/fail-safe-water-distribution.md);
- [`HSA-P-010 — Source-Capture Kitchen Extract`](../patterns/source-capture-kitchen-extract.md).

The computational domain does not derive technical truth from these pattern identities. They are architectural provenance and project commitments; physical relationships create the technical obligations.

Arbitrary routing through any available void, random masonry chasing and uncontrolled drilling/notching of primary structure remain outside the intended authoring model.

## 14. H1 heating, ventilation and electrical systems

The paper domain uses named technical families rather than generic “HVAC”.

### Heating

[HEAT-ASHP-RAD-01 — Air-to-Water Heat Pump + Low-Temperature Radiators](heating-family-ashp-radiators-v01.md) uses replaceable external plant, accessible internal hydraulic hub, replaceable low-temperature radiators, accessible distribution routes and competent external heat-loss/sizing/commissioning evidence.

This is an H1 technical family, not an HSA-wide heating preference.

### Ventilation

The later H1 research posture is **passive first, with bounded mechanical assistance where passive driving forces cannot discharge the performance obligation**.

[VENT-HYBRID-STACK-01](ventilation-family-hybrid-stack-v01.md) is the preferred research family: purpose-provided supply openings, explicit transfer routes and near-vertical extract stacks arranged so useful passive flow remains possible, with low-pressure mechanical assistance available when required. It remains research-supported rather than externally validated.

[VENT-CMEV-01](ventilation-family-cmev-v01.md) remains a supported fallback and the historical S2 family. MVHR remains a legitimate higher-complexity alternate where heat recovery, filtration, external noise/pollution or winter comfort justify the additional duct network and maintenance burden.

The decision record is [H1 Ventilation Strategy Decision v0.2](h1-ventilation-strategy-decision-v02.md). Frozen S2 evidence is not retrospectively rewritten.

### Electrical / data

The paper model assumes competent electrical topology, room-side service zones/defined routes and controlled structural crossings. It does not claim generic native electrical-design authority.

## 15. H1 wet rooms

H1 uses [WET-CORE-01 — Clustered Wet Core with Zonal Service Walls](wet-service-family-core-v01.md), preferring clustered bathrooms/utility/kitchen, short gravity branches, accessible stacks, zonal hot/cold isolation, adjacent plant/hot-water cylinder, explicit Part G/H routes and accessible traps, valves and rodding points.

Exact waterproofing remains a separate product/detail family.

## 16. H1 site envelope

Whole-house paper proof assumes an ordinary low-rise residential site, non-extreme topography, no basement or retaining-wall-dominated design, no known flood-driven special structural form, no unresolved contamination constraint, ordinary construction access, and declared wind/exposure and ground conditions.

Unknown site facts remain assumptions or external evidence obligations rather than invented certainty.

## 17. H1 fire and vertical circulation

The paper domain avoids novel fire engineering: simple single-family strategy, ordinary escape/protection routes inside supported targets, no atrium smoke-control system, mixed use, basement complexity or unusual compartmentation.

### Stair family

[ST-PRIVATE-01 — Private Timber Stair with Straight Flights and Rectangular Landings](stair-family-private-v01.md) covers one/two straight flights, rectangular landings, closed risers, conventional guarding/handrails, private-dwelling Part K geometry and floor-opening/headroom/circulation semantics. Member, fixing and floor-trimmer adequacy remain scoped external structural evidence.

### Fire / escape family

[FIRE-H1-2S-EGRESS-01 — Two-Storey Dwelling with Escape-Window Route](fire-family-two-storey-egress-v01.md) is intentionally narrow and remains a research family pending competent external review.

## 18. Grammar and doctrine remain independent

H1 does not encode “Georgian”, symmetry, classical openings or Palladian proportions. Those belong to G-01 or another grammar.

Likewise, a project can satisfy a supported technical condition while failing an HSA project requirement:

~~~text
SUPPORTED TECHNICAL CONDITION    PASS
REGULATORY OBLIGATION            PASS
STRUCTURAL OBLIGATION            PASS
HSA PROJECT REQUIREMENT          FAIL
~~~

The P0/PAT-XW-01 work later demonstrated this authority separation in executable form at much smaller scope.

## 19. Native, external and unsupported capability

Each capability needs one of three proof postures:

### NATIVE
The compiler discharges the obligation with trusted internal rules/calculations/evidence families.

### EXTERNAL
The condition is permitted, but proof comes from a competent external source.

### UNSUPPORTED
No accepted proof route exists. Change the design, extend the domain or leave the compiler guarantee.

Half-support is worse than an explicit boundary.

## 20. Frozen H1 paper capability matrix

| Area | H1 paper posture | Notes |
|---|---|---|
| New detached single-family house | Native candidate | Paper typology, not implemented product scope |
| One/two storeys | Native candidate | Exact constraints remain family-specific |
| Basement | Unsupported | Outside H1 |
| Orthogonal plan | Native candidate | Curvilinear special cases outside H1 |
| Cavity masonry envelope | Native candidate | Finite family library |
| Engineered I-joist upper floor | Native topology / external adequacy | SAB-H1-01 |
| Conventional plaster/mineral lining | Native candidate | Trusted control |
| W2 removable lining | Outside trusted baseline | Physical prototype gate open |
| Full removable floor platform | Unsupported | Experimental challenger |
| Selective floor access | Outside trusted baseline | Held candidate / prototype dependent |
| Simple duo-pitched trussed roof | Supported candidate | RF-TRUSS-DUO-01; adequacy external |
| Arbitrary steel frame | Unsupported | Defined local beams may be allowed |
| Complex transfer structure | Unsupported | Outside initial purpose |
| Simple masonry openings | Native semantics / external structural adequacy | Boundary family may be native while capacity remains external |
| Long-span opening | External/unsupported | Outside first structural domain |
| Coherent controlled service routes | Native candidate | Topological emphasis |
| High-service wall | Native candidate | Technical build-up separate |
| Arbitrary service routing | Unsupported | Deliberate |
| Hybrid passive-stack ventilation | Preferred research family / external performance proof | Evidence gate open |
| Central mechanical extract | Supported fallback | Historical S2 family |
| MVHR | Supported-domain alternate | Higher complexity; project/evidence dependent |
| Ordinary site | Candidate | Thresholds unresolved |
| Complex retaining/site structures | Unsupported | Outside H1 |
| Foundations | External | SAB-H1-01 |
| Standard prescriptive fire strategy | Candidate | Target-dependent |
| Fire-engineered alternative | External/unsupported | Not native H1 |
| G-01 Georgian grammar | Separate input | Not domain capability |
| HSA architectural requirements | Separate project authority | Not technical-domain capability |

Nothing marked “native candidate” is a demonstrated software capability. The table records the frozen H1 paper model.

The more detailed final paper audit is [H1 Capability Matrix v0.5](h1-capability-matrix-v05.md).

## 21. Domain extensions are admitted deliberately

A domain extension should state:

1. new semantics;
2. affected obligations;
3. engineering evidence;
4. regulatory implications;
5. interactions with existing assemblies;
6. conformance tests;
7. reference example;
8. failure/unsupported behaviour.

Potential future extensions may include physically validated lining/access systems, semi-detached/party-wall conditions, basements, alternative structures or additional roof/service families. None forms a standing implementation queue.

## 22. Promotion rule for experimental HSA systems

An experimental assembly enters a trusted technical domain only after the evidence appropriate to the claim exists, including where relevant:

- **architectural evidence** — tactile, visual and tectonic acceptance;
- **technical evidence** — structure, fire, acoustics, moisture and other performance;
- **workmanship evidence** — competent installers can achieve it within declared tolerances;
- **replacement evidence** — claimed reversibility works at 1:1;
- **domain specification** — parameter envelope and incompatible conditions are explicit;
- **conformance cases** — known passes and failures exist.

A Reference House prototype may contribute physical evidence, but does not automatically expand general computational authority.

## 23. Paper-compilation fixtures

S0, S1, S2 and H1 are frozen research fixtures. Their historical assumptions remain part of their evidence record. In particular, S2's cMEV assumption is not retrospectively rewritten to match the later passive-first ventilation decision.

These fixtures established the paper semantic / obligation / evidence model at increasing scales. The final internal H1 result remained **building release FAIL — expected**, with external professional review open.

## 24. What H1 deliberately leaves out

H1 does not attempt arbitrary architecture, conservation/listed work, conversions, apartments/high-rise/commercial uses, complex fire engineering, basements, extreme sites, arbitrary structural systems, free-form geometry, every HVAC system, every product or every compliance route.

A narrow explicit proof boundary is more credible than a broad dishonest one.

## 25. Reference House may exceed H1

The architecture is not constrained by this frozen computational research domain.

Where necessary, the correct statement is:

> **Reference House design exceeds the current demonstrated computational capability here.**

Architecture leads; computational coverage has to earn its authority separately.

## 26. Open research questions

Questions from the H1 paper programme remain useful only when a current workstream makes them relevant. They include:

- which technical families are valuable enough to deserve executable support;
- how much proof should remain external rather than native;
- how domain extension should interact with competent professional determination;
- which physically validated HSA assemblies deserve later technical-family representation;
- what minimum domain offers useful guarantees without becoming a broad CAD/regulations product.

## 27. Current programme position

The internal paper sequence is complete through **H1-PAPER-01** and its final red team. The frozen paper-domain audit is [H1 Capability Matrix v0.5](h1-capability-matrix-v05.md).

The later executable gate has also passed:

```text
paper semantic model       PASS at internal research scope
Phase-8 crosswalk          PASS at internal mapping scope
P0 executable kernel       PASS
PAT-XW-01                  PASS
```

The executable kernel deliberately proves much less than H1. It demonstrates stable identity, typed relationships, source/simple-geometry well-formedness, obligation derivation, scoped evidence, selective invalidation and authority separation. It does not turn the H1 families above into implemented proof capability.

Generic computational growth is therefore frozen. The open computational work is competent external review of the paper model and, only when another architectural/physical/professional workstream earns it, a targeted fixture for a concrete relationship.

## 28. Conclusion

The H1 research domain is intentionally ordinary: masonry, certified structural families, pitched roofs, known service routes and conventional finishes wherever experimental alternatives have not earned admission.

Its enduring lesson is not that H1 should now be built as software. It is that strong computational claims require an explicit competence boundary and a clear distinction between native proof, external evidence and unsupported conditions.

> **The computational system should prove itself on bounded ordinary conditions before claiming authority over novel or arbitrary construction.**
