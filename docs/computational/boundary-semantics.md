# Boundary Semantics

> **A wall is a physical assembly. A boundary is a performance relationship that may pass through many assemblies.**

The phrase “this wall is the envelope” hides too much.

One physical external wall may participate in weather, thermal, air, moisture, fire, acoustic, security and pest-control systems. Those systems can occupy different layers, terminate in different places, react differently to openings and penetrations, and depend on different evidence.

The computational model therefore treats boundaries as first-class semantic systems rather than as generic properties attached to one wall object.

## Physical assembly and performance boundary are different

A cavity wall may physically contain facing masonry, cavity, insulation, structural inner leaf, air-control layer, lining, window, closer, seals and lintel.

Across the same construction, the building may need:

- a rain-shedding and drainage path;
- a thermal envelope;
- an air boundary;
- a moisture/drying strategy;
- an acoustic separation;
- fire/cavity control;
- a security perimeter;
- pest exclusion.

One component can contribute to several boundaries. One boundary can pass through several components. This many-to-many relationship is the reason boundary identity matters.

## Boundary graph

A boundary can be understood as a connected semantic graph or surface network independent of any one CAD-layer convention.

Useful entities include:

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

The exact geometry may be a line, surface or region depending on the boundary and method.

## Boundary roles

Only applicable roles should be instantiated.

### Weather / rain

Where is rain shed? Where can water enter? Where is it intercepted, drained and allowed to dry?

### Thermal

What defines the insulated enclosure? Where are the openings, junctions and bridges?

### Air

What provides primary air control? How do openings, junctions and penetrations maintain continuity?

### Moisture / vapour

What wetting paths exist, where is vapour resistance intended and how can the assembly dry?

This remains assembly-specific; it should never collapse into a universal “vapour barrier” rule.

### Fire / smoke

What separating or cavity-control function applies, where does it continue, what penetrates it and how is performance reinstated?

### Acoustic

Which spaces require separation, what are the direct and flanking paths, and how do openings, penetrations, mass and decoupling affect them?

### Security

What constitutes the secure perimeter and which openings or interfaces control access?

### Pest exclusion

Where can pests enter or travel, and how are vents, cavities and drains protected without defeating another boundary function?

## A boundary is more than a material label

A field wall may use parge as one carrier of the air strategy, but:

```text
air-barrier-layer = parge
```

is not a complete air-boundary model.

A more useful representation is:

```text
AIR BOUNDARY AB-01
  carried-by parge P-01 on field wall
  transitions-to window seal S-04
  transitions-to floor-edge seal S-08
  penetrated-by service P-17
  reinstated-by collar/system C-17
```

The boundary describes continuity and transition across the enclosure, not merely the material used in one field condition.

## Continuity obligations

For each applicable boundary, the system should be able to determine whether:

- segments belong to a coherent system;
- transitions are declared;
- openings have explicit treatment;
- penetrations have explicit reinstatement;
- terminations are intentional;
- no required boundary simply ends in semantic space.

This is analogous to structural load-path continuity.

Semantic continuity still does **not** prove physical performance. Thermal, moisture, fire and acoustic adequacy require their appropriate calculation, tested assembly or other evidence.

## Boundary independence and replaceable layers

A routinely removable layer should not casually become the sole carrier of a critical slow-building function expected to survive its removal.

For example:

```text
LINING L01
  lifecycle = replaceable

AIR BOUNDARY AB01
  carried-only-by L01
```

If the project requires the air boundary to remain intact during routine lining removal, that state should be rejected or create an unresolved obligation.

A removable panel may still contribute secondary sealing, acoustic absorption, protection or finish. The issue is whether removal destroys a critical boundary contrary to the declared strategy.

## Intentional discontinuity needs semantic meaning

A boundary should distinguish states such as:

`CONTINUOUS` / `TRANSITION` / `OPENING` / `PLANNED-PENETRATION` / `SEALED-PENETRATION` / `DRAIN` / `VENT` / `TERMINATION` / `TEMPORARILY-OPEN-DURING-MAINTENANCE` / `UNRESOLVED`

A drain through a rain-control system is not a defect. The model should know why the discontinuity exists.

## Penetrations are typed events

A service penetration is not merely a hole.

```text
PENETRATION P01
  passes-through:
    AIR BOUNDARY AB01
    THERMAL BOUNDARY TB01
    ACOUSTIC BOUNDARY AC01

requires:
  air treatment
  thermal treatment
  acoustic treatment
  structural clearance
  water / pest treatment where applicable
```

The same physical hole can create very different obligations depending on which boundaries and structural conditions it crosses.

The current compiler already uses this principle: selected service penetrations generate boundary-reinstatement duties rather than disappearing between service and envelope abstractions.

## Openings are compound transformations

A window does more than puncture a wall.

It transforms:

- opaque rain control into a window/frame weathering system;
- wall insulation into frame and glazing;
- field air control into frame/perimeter seals;
- solid acoustic mass into an opening component;
- secure wall into an operable element;
- uninterrupted masonry into jamb, head and sill structural conditions.

The opening therefore creates a **bundle of obligations** across several domains.

This aligns with the architectural pattern **Permanent Opening / Replaceable Window**: the long-lived opening owns enduring geometry and the shorter-lived window occupies that interface.

## Junctions carry several boundaries at once

A floor/wall edge can simultaneously involve:

- structure;
- air;
- heat;
- sound;
- fire;
- moisture;
- finish;
- movement.

One interface may therefore participate in several shared graphs:

```text
INTERFACE I-FW-01
  participates-in STRUCTURAL relationship
  transitions AIR boundary
  transitions THERMAL boundary
  affects ACOUSTIC boundary
  requires FIRE closure where applicable
```

This is more useful than pretending each discipline owns an isolated detail.

## Topology and geometry do different work

Some boundary questions are topological:

- does the air boundary close;
- is a penetration accounted for;
- does a fire separation continue;
- does a drainage route reach a destination?

Others are geometric or quantitative:

- insulation thickness;
- linear thermal bridge;
- cavity dimension;
- seal width;
- drainage fall;
- acoustic build-up.

The semantic model should expose the correct geometric query, specialist method or external evidence required for the latter rather than claiming that topology proves performance.

## Weather and drainage are directional

Water requires more than continuity.

A useful semantic sequence is:

```text
water arrives
→ is shed / intercepted
→ drains through a declared path
→ leaves at a safe destination
```

Relevant facts can include exposure, protected side, fall direction, overlap, drip, weep and cavity collection path.

The current Reference House roof model already derives catchments and ensures roof drainage remains directed outward rather than silently reversing toward the courtyard.

## Moisture is an assembly strategy

Avoid slogans such as “always install a vapour barrier” or “every cavity must be ventilated”.

A supported wall or roof family should instead declare its wetting, drainage, vapour and drying strategy. Alterations outside that validated envelope create a building-physics obligation.

## Thermal semantics

A thermal boundary may need:

- conditioned/unconditioned side;
- insulation continuity;
- material properties;
- areas;
- openings;
- junctions;
- bridges;
- penetrations;
- target calculation route.

Regulatory performance levels change by target and date. The ontology should remain independent from one Approved Document edition.

## Air semantics

Air leakage commonly concentrates at transitions: floor and roof edges, openings, penetrations and service entries.

Relevant evidence can include continuity review, supported detail families, pre-closure inspection and final airtightness testing where appropriate.

A coloured field-wall layer without its transitions is not a complete air-boundary model.

## Acoustic semantics

Acoustic reasoning should be able to distinguish:

- direct separation;
- flanking paths;
- openings and penetrations;
- resilient or rigid connections;
- source/receiver relationships;
- evidence supporting the assembly.

The compiler need not become an acoustic engine merely to know that a junction or penetration has created an acoustic obligation.

## Fire semantics

Fire is especially unsafe to compress into `fire-rated = true`.

A supported fire claim needs its actual function, assembly/evidence, conditions, openings and penetrations, and field of application.

Relevant concepts may include:

- protected routes;
- separating elements;
- cavity control;
- reaction-to-fire requirements;
- penetration/fire-stop conditions;
- opening protection;
- structural fire performance.

Novel or project-specific fire engineering remains external unless a bounded method has genuinely been admitted.

## Boundary families and transition families

A supported technical family can package bounded knowledge about:

- physical assembly;
- boundary roles;
- applicable method;
- test/classification evidence;
- parameter envelope;
- compatible transitions and penetrations;
- inspection requirements;
- exclusions.

Transitions may be more valuable than generic field details because failures and conflicting duties concentrate at junctions.

Typical transition families could include:

- wall-to-window;
- wall-to-floor edge;
- wall-to-roof;
- wall-to-foundation;
- service entry;
- rainwater outlet;
- ventilation terminal.

The present compiler does **not** contain a release-grade technical-family library. Family identity is useful only where backed by real evidence and a controlled scope.

## Maintenance changes boundary state

Replacement can intentionally open a boundary without destroying the architectural strategy.

For a window replacement, for example:

```text
REMOVE WINDOW WIN01

permanent opening:
  remains

weather transition:
  intentionally opened
  must be reinstated

air transition:
  intentionally opened
  must be reinstated

thermal field:
  local interface exposed
  bulk wall remains
```

This lets replacement become a declared state transition rather than an unmodelled demolition event.

## Boundaries accumulate evidence through time

Design may rely on detail families, calculations and test data. Construction may add substrate inspection, product identity and concealed-work records. Commissioning may add airtightness or other tests. Later maintenance can add resealing, repair or failure history.

These evidence phases attach to the same semantic boundary system while remaining different kinds of evidence.

## Boundary objectives can conflict

Ventilation competes with airtightness. Drainage openings compete with pest exclusion. Acoustic decoupling can compete with structural restraint. Removable access can compete with fire/acoustic closure. Vapour resistance can compete with drying.

The computational objective is not to maximise every boundary independently. It is to expose interfaces where one requirement changes another.

## Anti-drift rules

- An external wall is not one generic boundary.
- A coloured line does not prove continuity through openings and junctions.
- A removable lining may carry a critical boundary only if the selected strategy accepts its removal/reinstatement consequences.
- A penetration is a typed boundary event, not just geometry.
- Fire claims require function, scope and evidence.
- More vapour resistance is not automatically safer.
- One seal can contribute to several boundaries without making those obligations identical.
- The compiler need not reimplement every building-physics engine.

## Current executable boundary

The present compiler represents weather, air, thermal and moisture boundary systems independently across the Reference House; turns openings and selected service crossings into explicit transition/reinstatement obligations; derives roof catchments and drainage relationships from canonical geometry; and prevents critical slow-envelope functions from migrating accidentally onto routinely removable layers.

It does **not** prove U-values, thermal bridges, condensation safety, fire resistance, acoustic performance, airtightness or whole-envelope physical adequacy.

Those remain external methods/evidence until a bounded technical method is deliberately admitted.

## Reference points

- UK Government, Approved Documents B, C, E, F, L and O where relevant to England target research.
- [Vertical Interface Coordination](../reference-house/vertical-bay-coordination.md) for the current Reference House junction strategy.
- [Replaceable Wall Lining](../research/replaceable-wall-system-options.md) for the boundary-independence problem at removable room finishes.
