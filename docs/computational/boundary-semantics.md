# Boundary Semantics — Conceptual v0.1

**Status:** Gate-B foundational research draft  
**Purpose:** define how environmental, fire, acoustic and related boundaries should exist as first-class semantic systems rather than incidental properties of wall objects.  
**Engineering status:** conceptual only. This document does not certify any construction.

> **A wall is a physical assembly. A boundary is a performance relationship that may pass through many assemblies.**

## 1. The problem

Conventional drawings often encourage a dangerous simplification:

> this wall is the envelope.

In reality, several distinct performance boundaries may pass through or alongside the same physical construction.

Examples:

- weather/rain control;
- thermal control;
- air control;
- vapour/moisture control;
- fire/smoke separation;
- acoustic separation;
- security;
- pest exclusion.

These boundaries:

- may occupy different physical layers;
- may terminate at different places;
- respond differently to penetrations;
- have different continuity rules;
- may require different inspection/evidence.

Therefore the semantic model should not reduce them to one generic “envelope boundary”.

## 2. Physical assembly and performance boundary are different ontologies

Consider a cavity wall.

Physical entities may include:

- brick outer leaf;
- cavity;
- insulation;
- masonry inner leaf;
- parge/air-control layer;
- plaster or removable lining;
- window;
- cavity closer;
- seal;
- lintel.

Performance boundaries may include:

- rain-screen/drainage path;
- thermal envelope;
- air boundary;
- moisture/vapour strategy;
- acoustic boundary;
- fire/cavity strategy.

One physical component may carry several boundary roles.

One boundary may cross many physical components.

This is a many-to-many relationship.

That alone justifies making boundary first-class.

## 3. Boundary graph

A boundary should be representable as a connected semantic graph or surface network.

Candidate nodes/segments:

- boundary segment;
- transition;
- opening;
- penetration;
- termination;
- seal;
- closure;
- drain;
- vent;
- cavity barrier;
- interface.

Candidate relationships:

- continues-to;
- transitions-to;
- overlaps;
- seals-to;
- drains-to;
- terminates-at;
- penetrated-by;
- reinstated-by;
- protected-by.

The exact geometry may be surface-, line- or region-based.

The semantic graph should exist independently of one CAD layer naming convention.

## 4. Boundary roles

Initial roles worth treating separately:

### B-WEA — external weather / rain

Questions:

- where is bulk rain shed?
- where can water enter?
- where is drainage provided?
- where can the assembly dry?

### B-THM — thermal

Questions:

- what defines the insulated enclosure?
- where are thermal bridges?
- how do openings/junctions transition?

### B-AIR — air

Questions:

- what layer/assembly provides primary air control?
- where are joints?
- what penetrates it?
- how is continuity maintained?

### B-MOI — moisture / vapour

Questions:

- what wetting paths exist?
- where is vapour resistance intended?
- where can construction dry?
- are moisture-sensitive materials protected?

This should not be modelled as one universal vapour barrier concept; strategy depends on assembly/building physics.

### B-FIR — fire / smoke

Questions:

- what is the required fire-separating or cavity-control function?
- where does it continue?
- what penetrates it?
- what closure/fire-stop system reinstates performance?

### B-ACO — acoustic

Questions:

- what spaces require separation?
- what are the flanking paths?
- what penetrations/openings weaken the boundary?
- what mass/decoupling/absorption system supports performance?

### B-SEC — security

Questions:

- what constitutes the secure perimeter?
- what openings/interfaces control access?

### B-PST — pest exclusion

Questions:

- where can pests enter or travel?
- how are vents/cavities/drains protected without defeating other functions?

Not every S0/H1 condition needs every role.

The model should create only applicable boundaries.

## 5. Boundary role is not automatically one layer

A future schema should avoid:

~~~text
air-barrier-layer = parge
thermal-layer = insulation
~~~

as the whole model.

Why?

Because real performance depends on:

- joints;
- transitions;
- penetrations;
- openings;
- floor/roof junctions;
- damage;
- discontinuities.

Instead:

~~~text
AIR BOUNDARY AB-01
  carried-by parge P-01 on field wall
  transitions-to window seal S-04
  transitions-to floor-edge seal S-08
  penetrated-by service P-17
  reinstated-by collar/system C-17
~~~

The boundary is the relationship across the complete enclosure.

## 6. Boundary continuity obligations

For each applicable boundary, the model should generate continuity obligations.

At minimum:

- every segment belongs to a coherent boundary system;
- required transitions are declared;
- openings have explicit boundary treatment;
- penetrations have explicit reinstatement;
- terminations are intentional;
- no required boundary ends in empty semantic space.

This is the boundary equivalent of a structural load-path graph.

But again:

> **semantic continuity does not prove performance.**

Thermal, acoustic, fire and moisture adequacy require their own calculations, tested systems or other evidence.

## 7. Boundary independence

The Long-Life House doctrine already contains an unusually important proposition:

> routinely removable layers should not casually carry critical boundaries whose performance must survive their removal.

The computational model can make this precise.

Suppose:

~~~text
LINING L01
  lifecycle = replaceable
  removal-frequency = occasional

AIR BOUNDARY AB01
  carried-only-by L01
~~~

If doctrine profile requires boundary independence, the compiler should raise an obligation or failure.

This is a powerful example of semantic type safety.

A removable panel may still contribute:

- acoustic absorption;
- protection;
- finish;
- secondary sealing.

The issue is whether critical performance disappears during routine removal contrary to the design strategy.

## 8. Boundary states

A boundary segment/interface may need states such as:

- CONTINUOUS;
- TRANSITION;
- OPENING;
- PLANNED-PENETRATION;
- SEALED-PENETRATION;
- DRAIN;
- VENT;
- TERMINATION;
- TEMPORARILY-OPEN-DURING-MAINTENANCE;
- UNRESOLVED.

These are not all equivalent.

For example, a drain opening in a rain-control system is not a defect.

The semantics must understand intentional discontinuity.

## 9. Penetrations are typed events

A service penetration should not simply be a hole.

Conceptually:

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

Different penetrations create different obligation sets.

A penetration through a non-critical finish may require almost nothing.

A penetration through several boundaries may be a significant interface.

## 10. Openings are compound boundary transformations

A window opening is much more consequential than a penetration.

It transforms:

- opaque weather assembly → window weather system;
- opaque thermal assembly → glazing/frame;
- opaque air-control layer → frame/seal system;
- masonry → structural head/jamb/sill;
- solid acoustic mass → opening component;
- secure wall → operable security interface.

The window entity should therefore carry or create a bundle of boundary obligations.

This aligns directly with Pattern 07:

**permanent opening / replaceable window**.

The permanent opening owns the long-lived transition geometry.

The replaceable window component occupies that prepared interface.

## 11. Junctions are multi-boundary interfaces

The floor/wall edge may simultaneously involve:

- structure;
- air;
- heat;
- sound;
- fire;
- moisture;
- finish;
- movement.

Do not solve each in isolated drawings if one physical decision affects several.

The semantic model should allow:

~~~text
INTERFACE I-FW-01
  participates-in STRUCTURAL relationship ...
  transitions AIR boundary ...
  transitions THERMAL boundary ...
  affects ACOUSTIC boundary ...
  requires FIRE closure if applicable ...
~~~

This creates a junction obligation bundle.

## 12. Boundary topology and geometry

Some boundary checks are primarily topological:

- does the air boundary close?
- does the fire separation continue?
- does a penetration have reinstatement?

Others are geometric/quantitative:

- insulation thickness;
- linear thermal bridge;
- acoustic build-up;
- cavity dimension;
- seal width;
- drainage fall/clearance.

The boundary model should generate geometric queries where needed.

This mirrors the wider principle:

> semantics constrain geometry; geometry discharges some semantic obligations.

## 13. Weather/water deserves directional semantics

Water behaves directionally.

A useful rain/drainage model may need:

- exposed side;
- protected side;
- fall direction;
- drainage destination;
- overlap;
- drip;
- weep;
- cavity collection path.

A visually continuous material is not necessarily a valid water path.

The computational model should be capable of distinguishing:

~~~text
water enters here
→ is intercepted
→ drains here
→ exits here
~~~

This is closer to a flow graph than a generic boundary line.

## 14. Moisture requires strategy, not slogan

The model should avoid simplistic universal rules such as:

- always install a vapour barrier;
- always make the interior more vapour-tight;
- any cavity is ventilated.

Instead, a supported wall/roof family should declare its verified moisture strategy.

The compiler then checks whether the instantiated assembly remains inside that strategy's envelope.

Out-of-family alterations create a building-physics obligation.

## 15. Thermal semantics

A supported thermal boundary should eventually include:

- conditioned/unconditioned side;
- insulation continuity;
- material properties;
- area;
- junctions;
- openings;
- thermal bridges;
- penetrations;
- target calculation route.

The 2026 England Approved Document L is one relevant compiler-target source for future dwellings subject to its transitional basis, but the boundary ontology should remain independent of a specific edition.

Regulation changes.

The concept of a thermal boundary does not.

## 16. Air-boundary semantics

Air leakage often occurs at interfaces rather than field materials.

The model should therefore emphasise:

- continuity;
- transitions;
- penetrations;
- floor/roof junctions;
- openings;
- service entries.

Potential evidence:

- design continuity review;
- detail family;
- inspection before closure;
- final air test where applicable to target/project.

A drawing that colours the wall red but omits the window/floor junction is not a complete semantic boundary.

## 17. Acoustic semantics

Acoustic performance is not merely “wall rating”.

The model should distinguish:

- direct separating path;
- flanking path;
- opening/penetration;
- resilient/rigid connection;
- room source/receiver relationship;
- relevant build-up/evidence.

For a detached single-family H1 house, some regulatory acoustic obligations are simpler than in attached/multi-unit buildings.

Internal acoustic quality may still be a project requirement.

This is one reason detached-only H1 is a materially cleaner first domain.

## 18. Fire semantics

Fire requirements are especially dangerous to oversimplify.

The model should represent only those fire relationships the supported compiler target/domain can justify.

Potential concepts:

- protected route;
- fire-separating element;
- cavity-control requirement;
- lining/reaction-to-fire requirement;
- penetration/fire-stop;
- opening protection;
- structural fire requirement.

A generic field fire-rated = true is inadequate.

A fire claim requires:

- exact function;
- duration/classification where applicable;
- assembly/evidence;
- penetration/opening conditions;
- scope.

Novel fire engineering should remain external/unsupported in H1.

## 19. Boundary evidence families

A supported boundary family should eventually package:

- physical assembly;
- boundary roles carried;
- calculation method;
- test/classification evidence;
- parameter envelope;
- compatible transitions;
- compatible penetrations;
- inspection requirements;
- exclusions.

Example:

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

This is close to a standard library for envelope performance.

## 20. Boundary transitions as standard-library objects

The field wall is often the easy part.

The hard part is the junction.

The standard library should ultimately contain tested/verified transition families such as:

- wall ↔ window head;
- wall ↔ window jamb;
- wall ↔ window sill;
- wall ↔ floor edge;
- wall ↔ roof;
- wall ↔ foundation;
- service entry;
- rainwater outlet;
- ventilation terminal.

Each transition family can carry multiple boundary roles.

That is a much stronger design primitive than a generic detail drawing pasted into CAD.

## 21. Removability states and boundary disruption

For each maintenance/replacement action, ask:

- which boundaries are opened?
- which are merely exposed?
- which remain intact?
- which require reinstatement?
- what evidence confirms reinstatement?

Example:

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

This turns replacement into an explicit state transition rather than a demolition event.

## 22. Boundary lifecycle and inspection

Boundary performance may need different evidence phases.

Design evidence:

- detail;
- calculation;
- tested system.

Construction evidence:

- substrate condition;
- seal/closure installation;
- cavity/fire-stop inspection;
- product identity.

Commissioning evidence:

- air test;
- ventilation performance;
- other project-specific tests.

Later maintenance:

- replacement/reseal record;
- leak event;
- remedial work.

The same boundary graph can accumulate evidence through time.

## 23. Boundary conflict detection

Different boundary objectives can conflict.

Examples:

- ventilation opening versus air tightness;
- drainage opening versus pest exclusion;
- acoustic decoupling versus structural restraint;
- removable access versus fire/acoustic closure;
- vapour resistance versus drying strategy.

The compiler should not simply maximise every boundary.

It should identify interfaces where one condition affects another.

This is another reason interfaces deserve first-class identity.

## 24. S0 boundary set

The first paper compilation should model at least:

### BND-S0-01 — weather path

External wall/window junction has explicit weathering/drainage strategy.

### BND-S0-02 — thermal continuity

Wall/window/floor region has a declared thermal-boundary path and unresolved bridge obligations are visible.

### BND-S0-03 — air continuity

Primary air boundary is explicit through wall/window/floor/service conditions.

### BND-S0-04 — moisture strategy

Wall family has a declared wetting/drainage/drying strategy.

### BND-S0-05 — service penetration

P01 identifies each boundary it crosses and how each is treated.

### BND-S0-06 — replaceable window

Removing WIN01 does not destroy the permanent opening; boundary reinstatement obligations are explicit.

### BND-S0-07 — removable lining comparison

In S0-B, removing W2 lining does not silently destroy the primary environmental boundaries.

### BND-S0-08 — evidence state

Every boundary claim is:

- natively resolved;
- externally evidenced;
- unresolved;
- unsupported;
- or planned for later physical verification.

## 25. S0 mutations

### M1 — widen window

Expected boundary consequences:

- window/wall transition geometry changes;
- thermal junction evidence may become stale;
- water-detail evidence may become stale;
- air-seal length/geometry changes;
- unrelated service penetration evidence should remain valid.

### M2 — arbitrary service chase/penetration

Expected:

- identify every crossed boundary;
- generate reinstatement obligations;
- if no supported penetration family exists, unsupported/fail rather than silently draw a hole.

### M3 — obstruct window withdrawal

Expected:

- maintenance validity fails;
- boundary design evidence should generally remain current.

This tests dependency separation.

### M4 — W2 out-of-tolerance background

Expected:

- environmental field boundary behind lining should remain semantically intact if the design truly provides boundary independence;
- lining/interface/workmanship status fails separately.

This is a strong test of the doctrine.

## 26. Relationship to compiler targets

The boundary ontology should be durable.

The target says which boundary obligations and performance levels apply.

For example:

- Approved Document C informs moisture/site resistance routes;
- Approved Document L informs energy/thermal requirements for the applicable regulatory snapshot;
- Approved Document B informs fire;
- Approved Document E informs sound;
- Approved Document F informs ventilation;
- Approved Document O addresses overheating for new residential buildings within its scope.

These are target/rule sources.

They should not define the ontology itself.

England's 2026 L/F documents also demonstrate why target versioning matters: their publication date and effective/transitional dates are not simply the same as “current today”.

## 27. Relationship to building physics tools

The semantic boundary model should eventually be able to produce inputs for specialised calculations.

Examples:

- U-value;
- thermal bridge analysis;
- condensation/hygrothermal assessment;
- acoustic prediction;
- fire classification lookup.

The compiler does not need to reinvent every physics engine.

Its job may be:

1. know that the obligation exists;
2. construct the appropriate model/input;
3. invoke or accept the validated method;
4. retain the evidence/result;
5. propagate change invalidation.

## 28. Anti-drift rules

- **“The external wall is the boundary.”**  
  No. Several boundaries may pass through the wall differently.

- **“One coloured line proves continuity.”**  
  No. transitions/openings/penetrations matter.

- **“A removable lining can carry the critical boundary because it is easy to draw.”**  
  Only if the doctrine/profile intentionally accepts loss/reinstatement during removal.

- **“A hole is just geometry.”**  
  No. penetrations are typed boundary events.

- **“Fire-safe is a property of the wall object.”**  
  No. fire claims have exact function, scope and evidence.

- **“More vapour resistance is always safer.”**  
  No. moisture strategy belongs to supported assembly/building-physics evidence.

- **“The same seal solves air, water, fire and sound.”**  
  Sometimes one product contributes to several functions; the obligations remain distinct.

- **“The compiler should implement all building physics itself.”**  
  No. specialised validated engines/evidence may remain separate.

## 29. Immediate research tasks

1. define the exact S0 wall-family boundary roles;
2. draw the boundary graph through wall/window/floor edge;
3. choose the provisional primary air-control location for S0;
4. define one supported service penetration family conceptually;
5. define the window head/jamb/sill transition obligations;
6. identify which boundary checks are topology-only versus calculation/test dependent;
7. create one evidence trace;
8. execute S0 M1/M2/M4 and observe invalidation/isolation.

---

## External anchors

- UK Government, **Approved Document C — Site preparation and resistance to contaminants and moisture**: https://www.gov.uk/government/publications/site-preparation-and-resistance-to-contaminates-and-moisture-approved-document-c
- UK Government, **Approved Document L 2026 — Energy and greenhouse gas emissions**: https://www.gov.uk/government/publications/approved-document-l-2026
- UK Government, **Approved Document B — Fire safety**: https://www.gov.uk/government/publications/fire-safety-approved-document-b
- UK Government, **Approved Document E — Resistance to sound**: https://www.gov.uk/government/publications/resistance-to-sound-approved-document-e
- UK Government, **Approved Document F 2026 — Ventilation**: https://www.gov.uk/government/publications/approved-document-f-2026
- UK Government, **Approved Document O — Overheating**: https://www.gov.uk/government/publications/overheating-approved-document-o
- existing project coordination: docs/reference-house/vertical-bay-coordination.md


## 25. First supported boundary-family set

S0/S1 have now forced three reusable routes out of the general boundary ontology.

### BF-WIN-MCW-01

[Window in Partial-Fill Masonry Cavity Wall](boundary-family-window-masonry-v01.md)

Covers:

- window weather;
- moisture;
- thermal;
- air transition;
- replacement contribution.

### BF-CORNER-MCW-01

[Orthogonal Masonry Cavity-Wall External Corner](boundary-family-external-masonry-corner-v01.md)

Covers:

- continuity of cavity/weather strategy;
- insulation turn;
- room-side air-control turn;
- structural-corner identity;
- workmanship/evidence.

### BF-GF-MCW-01

[Ground Floor to Masonry Cavity Wall Perimeter](boundary-family-ground-floor-masonry-v01.md)

Covers:

- DPC/DPM moisture continuity;
- floor/wall thermal junction identity;
- air-boundary transition;
- ground/substructure evidence dependency.

These families deliberately allow scoped external technical evidence.

A supported boundary family means:

- the semantic route is bounded and known;
- required evidence is known;
- unsupported combinations are explicit.

It does **not** mean every physical performance calculation is native.
