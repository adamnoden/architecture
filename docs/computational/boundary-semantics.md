# Boundary Semantics — Conceptual v0.2

**Status:** conceptual foundation exercised through S0→H1 paper research; technical adequacy remains family/evidence dependent  
**Purpose:** define environmental, fire, acoustic and related boundaries as first-class semantic systems rather than incidental wall properties  
**Engineering status:** conceptual only; this document does not certify any construction

> **A wall is a physical assembly. A boundary is a performance relationship that may pass through many assemblies.**

## 1. One wall can carry several different boundaries

The phrase “this wall is the envelope” hides too much.

A single external wall may participate in weather, thermal, air, moisture, fire, acoustic, security and pest-control systems. Those systems can occupy different physical layers, terminate differently, respond differently to penetrations and require different evidence.

The semantic model should therefore not reduce them to one generic envelope property.

## 2. Physical assembly and performance boundary are different things

A cavity wall may physically contain brick, cavity, insulation, masonry inner leaf, an air-control layer, lining, window, closer, seals and lintel.

Across the same construction, the building may need a rain/drainage path, thermal envelope, air boundary, moisture strategy, acoustic separation and fire/cavity strategy.

One physical component may contribute to several boundaries. One boundary may pass through several components. That many-to-many relationship is the reason boundary needs first-class identity.

## 3. Boundary graph

A boundary should be representable as a connected semantic graph or surface network independent of one CAD-layer convention.

Possible nodes or segments include:

- boundary segment;
- transition;
- opening;
- penetration;
- termination;
- seal or closure;
- drain or vent;
- cavity barrier;
- interface.

Useful relationships include:

`continues-to` / `transitions-to` / `overlaps` / `seals-to` / `drains-to` / `terminates-at` / `penetrated-by` / `reinstated-by` / `protected-by`

Exact geometry may be surface-, line- or region-based.

## 4. Initial boundary roles

### B-WEA — Weather / rain

Where is rain shed? Where may water enter? Where is it intercepted, drained and allowed to dry?

### B-THM — Thermal

What defines the insulated enclosure? Where are the openings, junctions and thermal bridges?

### B-AIR — Air

What provides primary air control? How do joints, openings and penetrations maintain continuity?

### B-MOI — Moisture / vapour

What wetting paths exist, where is vapour resistance intended, and how can the construction dry? This must remain assembly-specific rather than collapsing into a universal “vapour barrier” rule.

### B-FIR — Fire / smoke

What fire-separating or cavity-control function applies, where does it continue, what penetrates it and how is performance reinstated?

### B-ACO — Acoustic

Which spaces require separation, what are the direct and flanking paths, and how do openings, penetrations, mass and decoupling affect them?

### B-SEC — Security

What constitutes the secure perimeter and which openings or interfaces control access?

### B-PST — Pest exclusion

Where can pests enter or travel, and how are vents, cavities and drains protected without defeating other functions?

Only applicable roles should be instantiated.

## 5. A boundary is not merely a layer label

A field wall may use parge as part of its air-control strategy, but `air-barrier-layer = parge` is not a sufficient model because performance depends on transitions and discontinuities.

A more useful representation is:

~~~text
AIR BOUNDARY AB-01
  carried-by parge P-01 on field wall
  transitions-to window seal S-04
  transitions-to floor-edge seal S-08
  penetrated-by service P-17
  reinstated-by collar/system C-17
~~~

The boundary describes the relationship across the enclosure, not only the material carrying it in one place.

## 6. Continuity obligations

For every applicable boundary, the system should know whether:

- segments belong to a coherent boundary system;
- transitions are declared;
- openings have explicit treatment;
- penetrations have explicit reinstatement;
- terminations are intentional;
- no required boundary simply ends in semantic space.

This is analogous to a structural load-path graph.

Semantic continuity still does **not** prove performance. Fire, acoustic, thermal and moisture adequacy require the relevant calculation, tested assembly or other evidence.

## 7. Boundary independence and replaceable layers

HSA makes one useful relationship explicit: routinely removable work should not casually carry critical performance that is expected to survive its removal.

~~~text
LINING L01
  lifecycle = replaceable

AIR BOUNDARY AB01
  carried-only-by L01
~~~

If a project requirement says the air boundary must survive routine lining removal, this state should create an obligation or failure.

A removable panel may still contribute acoustic absorption, protection, finish or secondary sealing. The issue is whether removing it destroys a critical boundary contrary to the declared strategy.

## 8. Intentional discontinuity needs semantic states

A boundary should distinguish conditions such as:

`CONTINUOUS` / `TRANSITION` / `OPENING` / `PLANNED-PENETRATION` / `SEALED-PENETRATION` / `DRAIN` / `VENT` / `TERMINATION` / `TEMPORARILY-OPEN-DURING-MAINTENANCE` / `UNRESOLVED`

A drain through a rain-control system is not a defect. The model must understand why the discontinuity exists.

## 9. Penetrations are typed events

A service penetration is not just a hole.

~~~text
PENETRATION P01
  passes-through:
    AIR BOUNDARY AB01
    THERMAL BOUNDARY TB01
    ACOUSTIC BOUNDARY AC01

requires:
  air-seal method
  thermal treatment
  acoustic treatment
  structural clearance
  pest/water treatment where applicable
~~~

A hole through non-critical finish may create little work. The same geometry through several critical boundaries may create a substantial interface obligation.

## 10. Openings are compound boundary transformations

A window does more than puncture a wall. It transforms opaque weather control into a window weather system, insulation into frame/glazing, the field air layer into a frame/seal transition, solid acoustic mass into an opening component and secure wall into an operable interface. Structurally, it also changes the masonry around head, jambs and sill.

The window should therefore create a bundle of boundary obligations.

This aligns with the architectural pattern **permanent opening / replaceable window**: the long-lived opening owns the transition geometry; the shorter-lived window occupies it.

## 11. Junctions carry several boundaries at once

The floor/wall edge may simultaneously involve structure, air, heat, sound, fire, moisture, finish and movement.

The model should let one interface participate in all applicable systems:

~~~text
INTERFACE I-FW-01
  participates-in STRUCTURAL relationship ...
  transitions AIR boundary ...
  transitions THERMAL boundary ...
  affects ACOUSTIC boundary ...
  requires FIRE closure if applicable ...
~~~

This is more useful than pretending each discipline owns an isolated detail.

## 12. Topology and geometry do different work

Some boundary questions are topological: does the air boundary close, does fire separation continue, has a penetration been reinstated?

Others are geometric or quantitative: insulation thickness, linear thermal bridge, cavity dimension, seal width, drainage fall or acoustic build-up.

The semantic system should generate the geometric queries or specialist calculations needed to discharge the latter.

## 13. Weather and drainage are directional

Water requires more than continuity. A rain/drainage model may need exposed and protected sides, fall direction, destination, overlap, drip, weep and cavity collection path.

A useful semantic sequence is:

~~~text
water enters here
→ is intercepted
→ drains here
→ exits here
~~~

That is closer to a flow graph than a coloured boundary line.

## 14. Moisture is an assembly strategy

Avoid universal slogans such as “always install a vapour barrier” or “every cavity is ventilated”.

A supported wall or roof family should instead declare its verified wetting, vapour and drying strategy. The compiler checks whether the instantiated assembly remains within that envelope. Alterations outside it create a building-physics obligation.

## 15. Thermal semantics

A supported thermal boundary may need conditioned/unconditioned sides, insulation continuity, properties, areas, junctions, openings, bridges, penetrations and a target calculation route.

Regulatory requirements change by target and date. The ontology should remain independent of any particular Approved Document edition.

## 16. Air-boundary semantics

Air leakage concentrates at transitions: floor and roof edges, openings, penetrations and service entries.

Evidence may therefore include design continuity review, a supported detail family, pre-closure inspection and final airtightness testing where applicable.

Colouring the field wall in a drawing without modelling its junctions is not a complete air-boundary model.

## 17. Acoustic semantics

Acoustics should distinguish direct separation, flanking paths, openings/penetrations, resilient or rigid connections, source/receiver relationships and the evidence supporting the build-up.

Detached H1 houses avoid some of the regulatory complexity of attached or multi-unit buildings, though internal acoustic quality can still be a project requirement. That simplification is one reason detached low-rise housing is a useful first research domain.

## 18. Fire semantics

Fire is especially unsafe to compress into `fire-rated = true`.

A supported fire claim needs its exact function, classification/duration where applicable, assembly/evidence, penetration and opening conditions, and scope.

Potential semantic concepts include protected routes, separating elements, cavity control, lining/reaction-to-fire requirements, penetration/fire-stop conditions, opening protection and structural fire requirements.

Novel fire-engineering strategies remain external or unsupported in the H1 domain.

## 19. Boundary families package bounded knowledge

A supported boundary family may combine:

- physical assembly;
- boundary roles;
- calculation method;
- test/classification evidence;
- parameter envelope;
- compatible transitions and penetrations;
- inspection requirements;
- exclusions.

~~~text
WALL FAMILY WF-01
carries:
  WEATHER WEA-01
  THERMAL THM-01
  AIR AIR-01
  MOISTURE MOI-01

compatible:
  WINDOW INTERFACE WI-01
  FLOOR EDGE FE-01
  SERVICE PENETRATION SP-01
~~~

This is the beginning of a performance-aware standard library, not evidence that the present executable kernel implements such a library.

## 20. Transitions deserve standard-library identity

Field walls are often easier than junctions. Reusable transition families may therefore become more valuable than generic detail drawings.

Likely families include wall-to-window head/jamb/sill, wall-to-floor edge, wall-to-roof, wall-to-foundation, service entry, rainwater outlet and ventilation terminal.

Each can carry several boundary roles and a declared evidence envelope.

## 21. Maintenance changes boundary state

For each removal or replacement action, record which boundaries open, which are exposed, which remain intact, which need reinstatement and what evidence confirms restoration.

~~~text
REMOVE WINDOW WIN01

permanent opening:
  remains

weather seal:
  intentionally opened
  must be reinstated

air transition:
  intentionally opened
  must be reinstated

thermal wall:
  local interface exposed
  bulk field remains

masonry:
  no destructive change intended
~~~

Replacement then becomes an explicit state transition rather than an unmodelled demolition event.

## 22. Boundaries accumulate evidence through time

Design may rely on details, calculations and tested systems. Construction may add substrate inspection, product identity and concealed-work records. Commissioning may add airtightness or other tests. Later maintenance can add resealing, repair or failure history.

These are different evidence phases attached to the same boundary graph.

## 23. Boundary objectives can conflict

Ventilation competes with airtightness; drainage openings with pest exclusion; acoustic decoupling with structural restraint; removable access with fire/acoustic closure; vapour resistance with drying.

The compiler should not “maximise” each boundary independently. It should identify interfaces where one objective changes another.

## 24. S0 minimum boundary set — historical fixture

The first paper slice exercised:

### BND-S0-01 — Weather path
The external wall/window junction has an explicit weathering and drainage strategy.

### BND-S0-02 — Thermal continuity
The wall/window/floor region declares a thermal-boundary path and leaves unresolved bridge obligations visible.

### BND-S0-03 — Air continuity
The primary air boundary is explicit through wall, window, floor and service conditions.

### BND-S0-04 — Moisture strategy
The wall family declares a wetting, drainage and drying strategy.

### BND-S0-05 — Service penetration
`P01` identifies each boundary crossed and how it is treated.

### BND-S0-06 — Replaceable window
Removing `WIN01` preserves the permanent opening and creates explicit boundary-reinstatement obligations.

### BND-S0-07 — Removable lining comparison
In S0-B, removing the W2 lining does not silently remove the primary environmental boundaries.

### BND-S0-08 — Evidence state
Every boundary claim is natively resolved, externally evidenced, unresolved, unsupported or planned for later physical verification.

## 25. S0 mutation expectations — historical fixture

### M1 — Widen window

Window/wall transition geometry changes; thermal and water-detail evidence may become stale; air-seal geometry changes. Unrelated service-penetration evidence should remain valid.

### M2 — Arbitrary service chase / penetration

Identify every crossed boundary and generate the relevant reinstatement obligations. If no supported penetration family applies, fail or report unsupported rather than silently drawing the hole.

### M3 — Obstruct window withdrawal

Maintenance validity fails while existing boundary-design evidence generally remains current. This tests dependency separation.

### M4 — W2 background out of tolerance

If boundary independence is real, the environmental field boundary behind the lining remains semantically intact while the lining/interface/workmanship state fails separately.

## 26. Compiler targets decide which obligations apply

The ontology should remain durable while targets select applicable performance requirements and evidence routes.

Approved Documents C, L, B, E, F and O, for example, may inform moisture, thermal/energy, fire, sound, ventilation and overheating rules for an England target. Their editions and transition dates belong to target provenance, not to the boundary ontology itself.

## 27. Specialist physics engines can remain specialist

The semantic model may generate inputs for U-value, thermal-bridge, hygrothermal, acoustic or fire-classification methods without reimplementing them.

The compiler's job may simply be to know the obligation exists, construct or request the correct input, invoke or accept a validated method, retain the result/evidence and invalidate it when dependencies change.

## 28. Anti-drift rules

- An external wall is not one generic boundary; several performance systems may cross it differently.
- A coloured line does not prove continuity through transitions, openings and penetrations.
- A removable lining may carry a critical boundary only if the selected strategy explicitly accepts its removal and reinstatement.
- A penetration is a typed boundary event, not just geometry.
- Fire claims require function, scope and evidence; `fire-safe` is not a generic wall property.
- More vapour resistance is not automatically safer; moisture strategy is assembly-specific.
- One seal may contribute to air, water, fire or sound, but those obligations remain distinct.
- The compiler need not reimplement every building-physics engine.

## 29. Boundary-family results from the paper programme

The original S0 tasks—defining wall/window/floor boundary roles, air-control continuity, penetration semantics and evidence invalidation—were subsequently exercised through S0→H1 paper research.

That work produced several bounded research families:

### BF-WIN-MCW-01

[Window in Partial-Fill Masonry Cavity Wall](boundary-family-window-masonry-v01.md)

Covers window weather, moisture, thermal, air transition and replacement contribution.

### BF-CORNER-MCW-01

[Orthogonal Masonry Cavity-Wall External Corner](boundary-family-external-masonry-corner-v01.md)

Covers continuity of the cavity/weather strategy, insulation turn, room-side air-control turn, structural-corner identity and workmanship/evidence.

### BF-GF-MCW-01

[Ground Floor to Masonry Cavity Wall Perimeter](boundary-family-ground-floor-masonry-v01.md)

Covers DPC/DPM moisture continuity, floor/wall thermal-junction identity, air-boundary transition and ground/substructure evidence dependency.

### PEN-ENV-01

[Controlled Service Penetration Through External Envelope](boundary-family-controlled-penetration-v01.md)

Covers explicit host-boundary crossings and evidence-backed reinstatement without pretending the penetration family itself proves structural, weather, fire or acoustic adequacy.

These families deliberately allow scoped external technical evidence. “Supported research family” means the semantic route and required evidence are bounded and known; it does **not** mean every physical-performance calculation is native or executable.

## 30. Current research boundary

P0 has demonstrated generic source relationships, boundary-role obligation derivation and evidence-scope/invalidation behaviour at deliberately small scale. It has not implemented the full boundary ontology or the H1 family library.

The live questions now belong primarily to Reference House detail coordination, physical prototypes and competent fire/building-physics/building-control review. Add computational boundary machinery only when those workstreams expose a concrete representational or evidence problem worth formalising.

---

## External anchors

- UK Government, **Approved Document C — Site preparation and resistance to contaminants and moisture**: https://www.gov.uk/government/publications/site-preparation-and-resistance-to-contaminates-and-moisture-approved-document-c
- UK Government, **Approved Document L 2026 — Energy and greenhouse gas emissions**: https://www.gov.uk/government/publications/approved-document-l-2026
- UK Government, **Approved Document B — Fire safety**: https://www.gov.uk/government/publications/fire-safety-approved-document-b
- UK Government, **Approved Document E — Resistance to sound**: https://www.gov.uk/government/publications/resistance-to-sound-approved-document-e
- UK Government, **Approved Document F 2026 — Ventilation**: https://www.gov.uk/government/publications/approved-document-f-2026
- UK Government, **Approved Document O — Overheating**: https://www.gov.uk/government/publications/overheating-approved-document-o
- existing project coordination: `docs/reference-house/vertical-bay-coordination.md`