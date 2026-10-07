# Pattern Crosswalk — Remaining Active Language

**Status:** Phase-8 P8.3 corpus crosswalk  
**Scope:** `HSA-P-007..011`, `P-013`, `P-015..022`  
**Method:** [Architectural Pattern → Computational Crosswalk](pattern-crosswalk-model.md)  
**Precondition:** [P8.2 Pilot Red-Team Review](../development/pattern-language-phase8-pilot-review.md) — PASS WITH CORRECTIONS

This document applies the frozen Phase-8 schema to the fourteen active patterns not covered by the service-topology pilot.

The records are intentionally concise. They identify formal consequences and proof boundaries; they do not duplicate the architectural pattern prose.

---

# 1. Openings and interfaces

## `HSA-P-007` — Permanent Opening / Replaceable Window

**Coverage:** **NATIVE**  
**Implementation timing:** post-P0 interface/replacement fixture; substantial paper precedent already exists in the window/masonry obligation bundle.

### Architectural invariant

The wall opening remains the longer-lived architectural entity; the window assembly can be replaced through a deliberate interface without unnecessary reconstruction of that opening or primary boundaries.

### S — formal core

Existing model concepts cover:

- stable `Opening` and `Window` occurrences;
- host wall/assembly;
- interface / mounting / fixing zone;
- permanence and replacement-unit classification;
- boundary transitions (weather, air, thermal, moisture, acoustic, security as applicable);
- removable trims / dependencies;
- maintenance and full-frame replacement sequence;
- withdrawal path and working/handling geometry.

### Formal project commitments

If the project claims `P-007`:

- opening and replaceable window are distinct occurrences;
- the window has an explicit removal/replacement sequence;
- that sequence identifies what must be removed first;
- routine full-frame replacement must not silently require destruction of elements declared longer-lived/permanent beyond the accepted project interface;
- relevant boundary transition components are explicit rather than inferred from finish.

### Induced technical obligations

Already belong to the window/wall interface and shared graphs:

- structural head/jamb/sill effects;
- weather/drainage;
- airtightness/thermal continuity;
- moisture/acoustic/security;
- fixing/product applicability;
- tolerance and inspection.

### D

- replacement sequence removes permanent fabric;
- withdrawal path is smaller than current frame occurrence;
- trim removal breaks a primary boundary;
- future replacement envelope is already fully consumed by tolerance/packers.

### J

Architectural proportion, reveal quality, visual solidity, outlook/daylight quality and whether the extra interface earns itself.

### Anti-formalisation

Do not equate a detachable subframe with pattern conformance. No proprietary detail is required.

### Mutation

Change the replacement sequence so the frame can leave only after cutting the permanent masonry reveal or destroying the primary air/water layer.

**Expected:** replacement/project requirement fails or becomes unresolved; technical boundary obligations invalidate independently.

---

## `HSA-P-008` — Movement / Slip Junction

**Coverage:** **NATIVE + FIXTURE NEEDED**  
**Implementation timing:** post-P0 interface fixture.

### Architectural invariant

Assemblies expected to move independently meet through a bounded interface that preserves required support/restraint and permits the intended movement without delegating it to brittle finish.

### S — formal core

- interface/joint identity;
- participating assemblies;
- controlling assembly / support relationship;
- declared movement range/direction where consequential;
- attachment/fixing relationships;
- replaceable seal/cover if present;
- boundary roles carried through the joint;
- tolerance/remediation envelope.

The formal model already names `permits-movement`, `restrains`, `attaches`, `locates`, `adjusts-to` and `releases-from` relationships.

### Formal project commitments

- declared relative movement is not simultaneously locked by an incompatible attachment;
- cover/slip component attachment follows the selected controlling assembly logic;
- intended movement range remains available after authored finish/fixing relationships;
- boundary duties remain represented across the movement condition.

### Induced technical obligations

Movement magnitude, structural restraint, seal capability, fire/acoustic/air/moisture continuity and product durability come from engineering/boundary/product evidence.

### D

- later trim/fixing bridges both assemblies;
- movement allowance is mostly consumed by construction tolerance;
- replaceable seal has no maintenance access;
- movement joint is introduced where no consequential movement source is declared.

### J

Whether the joint is visually quiet, proportionate and free of distracting rattle/shadow effects.

### Anti-formalisation

Do not turn “movement good” into permissive looseness. Support/restraint adequacy remains independent.

### Mutation

Add a finish/fixing relationship that attaches the nominal slip cover to both independently moving assemblies.

**Expected:** intended movement relation becomes contradictory; boundary/finish consequences remain separate.

---

## `HSA-P-019` — Permanent Opening / Replaceable Door

**Coverage:** **NATIVE**  
**Implementation timing:** post-P0 door/interface fixture; existing entrance-family work supplies useful technical precedent.

### Architectural invariant

The enduring opening remains distinct from the shorter-lived doorset and its adjustable/serviceable hardware, with replacement possible through a deliberate interface.

### S — formal core

- permanent opening occurrence;
- doorset/frame/leaf/hardware occurrences;
- fixing/adjustment interface;
- replacement unit/dependencies;
- clearance/operation relationships;
- threshold relationship;
- applicable fire/smoke/acoustic/security/weather/accessibility boundaries;
- maintenance/withdrawal paths.

### Formal project commitments

- opening and doorset identities are distinct;
- full-frame replacement sequence is represented where the pattern is claimed;
- critical hardware/fixings declared maintainable remain reachable;
- replacement does not silently destroy longer-lived opening/floor fabric outside the accepted interface.

### Induced technical obligations

Fire/smoke, acoustic, security, accessibility, weather/air, fixing strength, hardware performance and operation clearances retain their own technical/regulatory/product authority.

### D

- adjustment range exhausted at installation;
- leaf can be serviced but frame cannot be removed;
- replacement requires destructive floor/wall work;
- threshold/doorset/floor replacement dependencies form an unintended cycle.

### J

Solidity, quiet operation, visual quality, hardware restraint and whether demountable complexity is proportionate.

### Anti-formalisation

A replaceable leaf is not enough if the frame/opening interface remains destructive.

### Mutation

Change floor build-up/threshold so the frame can no longer be removed without destroying the long-lived floor edge.

---

## `HSA-P-020` — Designed Threshold

**Coverage:** **NATIVE + FIXTURE NEEDED**  
**Implementation timing:** post-P0 interface fixture, preferably coupled to door/floor replacement tests.

### Architectural invariant

A real transition between floor/door conditions is resolved as an owned interface with explicit datum, movement, wear, replacement and—where applicable—weather/accessibility duties.

### S — formal core

- adjacent floor/space/door assembly identities;
- finished datums and level relation;
- threshold/interface component occurrence;
- movement/replacement dependencies;
- edge-support/wear role;
- drainage/weather boundary roles for external thresholds;
- accessibility clearance/level geometry where applicable.

### Formal project commitments

- a claimed threshold corresponds to a real interface/transition rather than decorative insertion;
- adjacent assembly replacement dependencies are explicit;
- level relationship and interface datum are represented;
- where the threshold carries an environmental boundary role, that role is explicit.

### Induced technical obligations

Trip/accessibility geometry, weather/water/air/thermal, fire/smoke, acoustic, structural support and product durability derive from the actual interface/target.

### D

- threshold blocks removal of a declared replaceable floor;
- level error exceeds declared adjustment/remediation envelope;
- drainage route falls toward vulnerable interior fabric;
- threshold creates a geometric trip condition.

### J

Tactile quality, visual weight, whether a separate threshold is compositionally desirable.

### Anti-formalisation

Do not require a visible strip at every opening. The invariant is the resolved transition.

### Mutation

Raise one adjacent finished floor beyond the threshold's adjustment envelope.

**Expected:** datum/accessibility/interface obligations change; the component identity can remain stable.

---

# 2. Water and environmental systems

## `HSA-P-009` — Accessible Rainwater Route

**Coverage:** **NATIVE + FIXTURE NEEDED**  
**Implementation timing:** post-P0 extension. Existing programme item `C-043` already identifies rainwater as an implementation-extension family.

### Architectural invariant

Rainwater collection/discharge is an explicit maintainable water network with credible overflow/failure paths that reveal or shed water without silently directing it into vulnerable fabric.

### S — formal core

- catchment/source surfaces;
- gutters/channels/outlets/nodes;
- drainage route segments and discharge destination;
- overflow/failure paths;
- maintenance tasks/access paths at debris-prone points;
- penetrations/boundary transitions;
- ground/wall-base receiving condition.

### Formal project commitments

- principal route and destination are traceable;
- debris-prone points declared maintainable have access;
- selected overflow/failure paths terminate at declared safe/legible destinations;
- concealed route segments are not allowed to have “internal damage” as their only represented failure indication when the pattern claims visible/safe failure.

### Induced technical obligations

Hydraulic capacity, falls, rainfall basis, overflow sizing, weathering, wall-base drainage and structural/product performance remain technical/evidence questions.

### D

- blocked primary outlet has no represented overflow destination;
- overflow path intersects vulnerable boundary/fabric;
- access path to debris-prone node is absent;
- route discharges beside sensitive wall-base condition.

### J

Elevation composition, whether external vs concealed drainage is architecturally preferable, amount of redundancy proportionate to the roof.

### Anti-formalisation

Do not encode “external gutter = good” or one universal drainage typology.

### Mutation

Block the primary outlet in a scenario and trace the represented overflow/failure graph.

**Expected:** water reaches the declared safe path or the model exposes an unresolved/failing consequence.

---

## `HSA-P-010` — Source-Capture Kitchen Extract

**Coverage:** **NATIVE + FIXTURE NEEDED**  
**Implementation timing:** post-P0 extension; aligns with existing programme item `C-044`.

### Architectural invariant

Cooking contaminants are captured near source through an explicit source→capture→duct→fan/terminal relationship that remains maintainable and coordinated with replacement air/whole-house ventilation.

### S — formal core

- cooking source occurrence/zone;
- capture hood/canopy occurrence and spatial relation to source;
- duct/network route and geometry;
- fan/filter/terminal equipment;
- cleaning/maintenance tasks and access;
- external boundary penetration;
- replacement-air relation / whole-house ventilation context.

### Formal project commitments

- the source and selected capture device are related explicitly;
- route from capture point to discharge is continuous;
- declared cleanable/replaceable elements have access;
- terminal occurrence/destination is explicit;
- replacement-air/pressure interaction is not omitted from the system context where the selected design requires it.

### Induced technical obligations

Actual airflow, capture effectiveness, pressure interaction, acoustic performance, grease/fire considerations, commissioning, terminal nuisance/weather and electrical safety remain technical/regulatory/product evidence.

### D

- excessive route length/bends;
- filter/fan inaccessible;
- terminal too close to another intake/opening under a chosen family constraint;
- no declared replacement-air strategy despite high extract design;
- route crosses unexpected boundaries.

### J

How the hood is architecturally integrated, visual prominence, whether complexity suits actual cooking use.

### Anti-formalisation

Do not treat nominal fan airflow or presence of a hood as proof of source capture.

### Mutation

Move the cooking appliance away from the hood/capture geometry while keeping fan/duct unchanged.

**Expected:** source/capture formal relationship becomes invalid or unresolved; commissioned airflow evidence does not magically prove capture geometry.

---

## `HSA-P-017` — Visible Leakage Path

**Coverage:** **NATIVE + FIXTURE NEEDED**  
**Implementation timing:** post-P0 water-failure fixture.

### Architectural invariant

Where selected, credible concealed leakage has a passive physical route from source/containment to a safe legible endpoint before it silently damages vulnerable long-lived fabric.

### S — formal core

The formal model already anticipates `DrainagePath` and `FailurePath` concepts:

- credible leak source / source class;
- containment extent where used;
- failure/drainage route;
- fall/direction geometry where relevant;
- visible endpoint / discharge destination;
- vulnerable fabric/boundaries along the route;
- access/cleaning task where blockage is possible.

### Formal project commitments

- selected leak source class has a continuous represented secondary path to its endpoint;
- endpoint is not hidden by the source model's normal occupancy/storage state where visibility is claimed;
- the path does not terminate in vulnerable concealed fabric;
- electronic sensing alone does not satisfy a selected passive-path requirement.

### Induced technical obligations

Hydraulic reliability, actual fall/flow, freeze/pest/weather consequences, waterproofing/fire/acoustic penetrations and material durability remain technical evidence.

### D

- path contains local high point / disconnected segment;
- endpoint is hidden/ambiguous;
- containment capacity is unspecified for a high-rate failure scenario;
- path crosses a boundary without reinstatement.

### J

Whether permanent provision is proportionate to the failure probability/consequence and whether the visible endpoint is architecturally quiet.

### Anti-formalisation

Do not infer that every water route requires a secondary drainage path.

### Mutation

Reverse a short drain segment's fall or block the endpoint with fixed joinery.

---

## `HSA-P-018` — Failure-Tolerant Wet Service Room

**Coverage:** **NATIVE + FIXTURE NEEDED**  
**Implementation timing:** post-P0 room/wet-zone fixture; existing wet-zone family supplies useful boundary machinery.

### Architectural invariant

A room with sufficiently concentrated water-service risk can tolerate selected credible local failures through accessible isolation, water-management geometry and maintainable equipment space rather than treating the room as ordinary dry construction.

### S — formal core

- room/space identity;
- water-bearing equipment/components/routes;
- isolation relationships;
- failure scenarios/source classes;
- floor/wall waterproof boundary where selected;
- containment/drainage/visible failure paths;
- thresholds/adjacent-space relation;
- working/withdrawal volumes.

### Formal project commitments

Only measures the project actually selects become formal commitments. The pattern itself does not mandate a floor drain or tanking.

Machine-checkable examples:

- declared isolation remains accessible;
- selected drain/containment path reaches its destination;
- selected waterproof boundary has explicit extent/transitions;
- equipment declared replaceable has working/withdrawal geometry;
- selected threshold/failure geometry does not direct the represented water scenario into an unprotected adjacent space.

### Induced technical obligations

Waterproofing performance, drain capacity/falls, appliance/plumbing quality, acoustic/boundary performance and product applicability use existing technical/evidence machinery.

### D

- drain above represented low point;
- isolation blocked by installed equipment/storage;
- waterproof boundary terminates behind inaccessible fixed joinery;
- failure scenario crosses threshold into adjacent room.

### J

Whether room-scale treatment is proportionate; ordinary domestic character; which failure scenarios deserve permanent infrastructure.

### Anti-formalisation

Do not encode `utility_room => floor_drain_required`.

### Mutation

Change finished-floor geometry so the credible leakage scenario ponds away from the selected drain and spills through the doorway.

---

## `HSA-P-021` — Source-Capture Bathroom Extract

**Coverage:** **NATIVE + FIXTURE NEEDED**  
**Implementation timing:** post-P0 ventilation/room fixture.

### Architectural invariant

Bathroom moisture has an explicit source→extract point→duct→discharge path, with deliberate transfer air and maintainable equipment, rather than relying on a nominal fan detached from room airflow geometry.

### S — formal core

- shower/bath moisture source zone;
- extract terminal occurrence and source relation;
- transfer-air opening/path;
- duct route, fan and discharge terminal;
- condensate path where applicable;
- maintenance tasks/access;
- whole-house ventilation system context.

### Formal project commitments

- selected extract point is associated with the declared source zone;
- transfer-air path exists where the strategy depends on it;
- duct route is continuous and maintainable where declared;
- condensate obligation is represented when route/environment triggers it;
- fan/grille declared serviceable has access.

### Induced technical obligations

Airflow/moisture performance, electrical-zone safety, acoustics, pressure balance, condensation calculation, commissioning and terminal/weather performance remain technical/regulatory evidence.

### D

- long/crushed/high-resistance route under supported-family assumptions;
- no transfer-air route;
- fan inaccessible;
- cold-space route with no condensate resolution;
- terminal conflicts with openings/intakes.

### J

Exact terminal position, control behaviour, visual integration and subjective nuisance beyond measured criteria.

### Anti-formalisation

Do not claim “fan present = bathroom moisture strategy resolved”.

### Mutation

Seal the transfer-air path or reroute the duct through a cold zone without condensate handling.

---

# 3. Maintenance and external access

## `HSA-P-011` — Roof Maintenance Route

**Coverage:** **SMALL REFINEMENT — ALREADY AUTHORISED**  
**Implementation timing:** after P0, with the maintenance extension programme; may share `EXT-MAINT-01` machinery.

### Architectural invariant

Foreseeable roof tasks that cannot be designed out have an intentional complete access process: approach, arrival, working position and—where relevant—replacement/removal route.

### S — formal core

Existing maintenance graph covers:

- `MaintenanceTask` / target component;
- `AccessPath`;
- `WorkingPosition` / `WorkingVolume`;
- `WithdrawalPath` / replacement unit;
- roof/external-space geometry;
- boundary/structural interfaces for hatches/anchors where used.

The post-H1 doctrine audit already authorises a minimal `AccessMethod` concept/role refinement.

### Formal project commitments

- each selected consequential roof task has a declared approach/access method/path;
- arrival/working geometry is represented;
- replacement task includes withdrawal/material route where different from inspection;
- permanent hatch/anchor, if selected, is treated as an actual structural/boundary component rather than proof of safe access.

### Induced technical obligations

Work-at-height method safety, temporary works, anchor design, structural support, weather/thermal/air boundary performance and security remain professional/technical evidence.

### D

- worker path exists but replacement unit path does not;
- hatch opens onto incompatible edge/slope condition;
- route intersects fragile element;
- later extension/landscape removes external access method.

### J

Which access method is proportionate; whether permanent hardware is justified; visual/occupational consequences.

### Anti-formalisation

A roof hatch or anchor is not equivalent to a maintenance route.

### Mutation

Add a rooflight/plant item that blocks the only represented safe approach/working route.

---

## `HSA-P-013` — Ground-Supported Façade Access

**Coverage:** **SMALL REFINEMENT — ALREADY AUTHORISED**  
**Implementation timing:** `EXT-MAINT-01` after the minimal kernel.

### Architectural invariant

Façade and site geometry preserve at least one credible selected ordinary access process for foreseeable work, including equipment/material approach, support/setup geometry, working position and replacement/waste route.

### S — formal core

The doctrine-delta audit already established the substrate:

- Site / Plot / boundary;
- ExternalSpace / Courtyard;
- MaintenanceTask;
- AccessPath / WorkingPosition / WorkingVolume / WithdrawalPath;
- Ground support condition;
- replacement unit;
- landscape/scenario assumptions;
- third-party/highway dependency.

Authorised small refinement:

- `AccessMethod` or equivalent role;
- path/zone roles for approach, support, setup, work and withdrawal;
- explicit third-party/highway dependency semantics.

### Formal project commitments

- selected maintenance task has a declared access method/process;
- route from site/service entrance to support/setup position is represented;
- selected equipment envelope/support position exists geometrically;
- material/replacement/waste route is represented where consequential;
- third-party/highway dependency is explicit rather than hidden;
- landscape/as-built scenarios that are part of the strategy are dependencies capable of invalidating it.

### Induced technical obligations

Actual scaffold/MEWP temporary works, ground bearing capacity, anchor design, highway permission and neighbour consent remain external/professional evidence.

### D

- gate/path too small for equipment or replacement unit;
- projection blocks setup envelope;
- drain/lightwell occupies sole support position;
- mature landscape blocks sole route;
- external plant consumes support/setup zone;
- third-party land becomes required.

### J

Which method is reasonable/proportionate; landscape quality; whether architectural projection is worth the access complexity.

### Anti-formalisation

Do not define a universal maintenance-strip width or equate empty perimeter space with maintainability.

### Mutation

Use the already-authorised `EXT-MAINT-01` mutations: block support with lightwell/drain, narrow gate, add mature tree, or move external plant into the sole setup zone.

---

# 4. Room and assembly infrastructure

## `HSA-P-015` — Accessible Room Service Route

**Coverage:** **NATIVE**  
**Implementation timing:** post-P0; existing `SR-ROOM-LOW-01` family is direct precedent.

### Architectural invariant

Suitable local room services use an explicit accessible route in replaceable room-side architecture where selected, rather than defaulting to repeated chasing of permanent fabric.

### S — formal core

- local service route segments and service classes;
- host replaceable layer/joinery zone;
- access/removal relationship;
- no-fix/service zones;
- permanent fabric identity;
- designed crossings into/out of the route;
- local branch connection to primary network.

### Formal project commitments

- selected services remain within declared accessible route/allowed host except at designed crossings;
- declared access remains possible after authored floor/joinery conditions;
- service/no-fix zones are represented where future fastening risk matters;
- prohibited service classes do not silently use the route.

### Induced technical obligations

Electrical/plumbing separation/protection, fire/acoustic/wet-zone boundaries, fixing/fastener risk and product limits remain technical/target/family obligations.

### D

- route blocked by fixed furniture;
- later fastener enters no-fix/service zone;
- service class outside route allowance;
- local branch bypasses route into permanent fabric.

### J

Whether accessible routing is proportionate, visually quiet and compatible with room grammar.

### Anti-formalisation

Do not model `skirting = serviceable` as the pattern. Skirting is one implementation family.

### Mutation

Add a new outlet by chasing the permanent wall while the declared accessible route remains nearby and suitable.

---

## `HSA-P-016` — Compartmented Service Void

**Coverage:** **NATIVE**  
**Implementation timing:** post-P0 boundary/service composition fixture.

### Architectural invariant

Services may remain continuous across significant boundaries; the open access void does not automatically remain continuous with them.

### S — formal core

- service-void spatial extent;
- boundary segments/intersections;
- closure/cavity-barrier occurrence where required by the selected technical route;
- individual/grouped service penetrations through closure;
- access panels and their boundary roles;
- service route continuity independent from void continuity.

### Formal project commitments

- significant boundary intersections are explicit;
- where a boundary requires void closure, the open void does not continue through it;
- services crossing the closure do so through identified penetrations/transitions;
- access strategy does not silently assign the entire boundary role to removable decorative finish.

### Induced technical obligations

Fire/smoke/acoustic/air/pest performance, penetration systems and inspection evidence derive from the actual boundary/penetration graph and target.

### D

- continuous cavity bypasses a declared boundary;
- later cable creates anonymous penetration through closure;
- access panel removes the sole boundary layer;
- oversized grouped opening has no supported reinstatement family.

### J

How much discontinuity/access is proportionate and how closures integrate with the architecture.

### Anti-formalisation

Do not independently prescribe cavity barriers from the pattern; applicability belongs to the building/target/boundary design.

### Mutation

Add a cable route that crosses the closure without a penetration occurrence/reinstatement relationship.

---

## `HSA-P-022` — Controlled Attachment Plane

**Coverage:** **NATIVE + FIXTURE NEEDED**  
**Implementation timing:** post-P0 wall-bay / physical prototype companion fixture.

### Architectural invariant

Where selected, shorter-lived fit-out attaches primarily through a deliberate load-classified intermediate plane so permanent fabric receives a limited, documented set of designed anchors rather than repeated uncontrolled fixing.

### S — formal core

- permanent wall/host;
- attachment-plane assembly/interface;
- permanent anchor occurrences;
- supported fit-out components;
- load-class/project capacity declarations;
- safe/no-fix/service zones;
- adjustment/tolerance mechanism;
- replacement dependencies;
- relevant acoustic/fire/air/moisture boundary relationships.

### Formal project commitments

- claimed ordinary fit-out attachments use the declared plane where policy requires it;
- permanent anchors are identifiable/documented;
- load class of selected attachments is compatible with declared family/evidence envelope;
- no-fix zones protect service/boundary conditions represented by the project;
- plane replacement/inspection dependencies are explicit if it is shorter-lived than the wall.

### Induced technical obligations

Anchor capacity, wall capacity, heavy-load engineering, acoustic/fire/thermal bridge effects, product evidence and installation inspection retain technical authority.

### D

- fit-out bypasses plane and drills permanent fabric;
- requested load exceeds ordinary load class;
- permanent anchor count grows materially beyond the chosen strategy;
- later fastener conflicts with hidden service zone;
- adjustment capacity exhausted by wall tolerance.

### J

Whether the layer earns its depth/material, perceived solidity, acoustic/tactile quality and visual integration.

### Anti-formalisation

Do not encode one proprietary rail/backplane as the pattern and do not make the whole room a technical grid by default.

### Mutation

Attach a heavy cabinet using an ordinary-load position or bypass the plane into a protected/no-fix service zone.

---

# 5. P8.3 corpus finding

## No new fundamental abstraction

**PASS.** All fourteen fit the existing semantic / obligation / evidence architecture.

## Small refinements

Only already-known generic refinements surface:

1. `AccessMethod` / external maintenance role semantics for `P-011`/`P-013` — already authorised by Research Programme v0.5;
2. possible generic `identifies` / `refers-to` relation for the physical-information case in `P-012` — still not proven necessary.

No pattern-specific entity or subsystem is justified.

## Strong existing-family alignments

- `P-007` ↔ window/masonry interface bundle;
- `P-005` ↔ controlled penetration family;
- `P-015` ↔ room low-level service family;
- `P-018` ↔ wet-zone/boundary machinery;
- `P-009` ↔ authorised rainwater extension (`C-043`);
- `P-010` ↔ authorised cooking source-capture extension (`C-044`);
- `P-011`/`P-013` ↔ external-maintenance doctrine delta and `EXT-MAINT-01`.

The crosswalk is therefore primarily a coordination map between two mature project layers, not a new research architecture.

---

# 6. Implementation-priority classification

## P0 kernel — no pattern subsystem

The existing P0 scope remains unchanged.

A controlled penetration/service-route example can incidentally exercise semantics relevant to `P-005`/`P-003`, but pattern provenance is not a kernel prerequisite.

## First post-P0 crosswalk fixture — `PAT-XW-01`

Recommended minimal set:

- `P-005` Designed Structural Penetration;
- `P-003` Coherent Horizontal Service Route;
- `P-012` Physical Service Index as optional change/provenance extension.

## Early extension fixtures

- `P-009` rainwater;
- `P-010` kitchen source capture;
- `P-011` + `P-013` external/roof maintenance;
- `P-015` accessible room route;
- `P-016` compartmented void;
- `P-017` visible leakage;
- `P-018` wet service room;
- `P-021` bathroom extract.

## Interface / prototype-linked fixtures

- `P-007` replaceable window;
- `P-008` movement/slip junction;
- `P-019` replaceable door;
- `P-020` threshold;
- `P-022` attachment plane.

These gain most value when computational state can be compared against physical/detail prototypes rather than being expanded as paper-only rule sets.

---

# 7. P8.3 gate

| Question | Result |
|---|---|
| Can every active pattern be crosswalked without a pattern ontology? | **Yes** |
| Did any pattern force a new fundamental semantic graph? | **No** |
| Are qualitative architectural residues explicit? | **Yes** |
| Do crosswalks preserve technical authority outside pattern provenance? | **Yes** |
| Are executable mutations identifiable? | **Yes** |
| Does current P0 scope need expansion? | **No** |

## Decision

**P8.3 PASS.**

Proceed to P8.4: audit strategies and held candidates for computational coverage/gaps without turning them into canonical pattern nodes.