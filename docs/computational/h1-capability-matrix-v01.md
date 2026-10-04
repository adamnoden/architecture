# H1 Capability Matrix — Post-S1 v0.1

**Status:** Gate-B audit  
**Purpose:** assess whether the first whole-house domain is becoming a genuine supported world or merely a semantic dependency tracker.  
**Basis:** S0 Run 01/02, S1 Run 01, current boundary/service families, SAB-H1-01 and G01-PILOT-P0.

> **The question is no longer whether the compiler can describe a house. It is whether enough ordinary house construction has a known route that the compiler can meaningfully help resolve it.**

## 1. Capability states

### NATIVE

The compiler/research model can evaluate the proposition directly from trusted internal semantics/rules/calculations.

### SUPPORTED + EXTERNAL EVIDENCE

The family/route is bounded and understood, but one or more technical propositions are discharged by scoped external evidence.

This is a legitimate H1-v0 state.

### CANDIDATE

The intended family is identified but not yet sufficiently bounded.

### EXTERNAL / PROJECT-SPECIFIC

Allowed, but no native supported family is selected.

### UNSUPPORTED

No accepted route within H1.

## 2. Core model capabilities

| Capability | H1 v0 state | Current basis | Gate-B note |
|---|---|---|---|
| semantic entity identity | NATIVE | formal model | strong |
| typed relationships | NATIVE candidate | formal model + S1 role correction | vocabulary still evolving |
| geometry source of truth | NATIVE | S0/S1 | strong conceptually |
| composition into shared graphs | NATIVE | S0 assembly composition | strong conceptually |
| obligation derivation | NATIVE | validity model | strong conceptually |
| obligation scope | NATIVE candidate | S1 | newly promoted |
| evidence provenance | NATIVE | evidence model | external review still needed |
| selective invalidation | NATIVE | S0/S1 mutations | strong paper evidence |
| grouped issue/action surface | NATIVE concept | S0/S1 complexity gates | UI untested |
| versioned compiler target | NATIVE concept | S0 target v0.1–v0.3 / S1 target | real transition test exists |

### Assessment

The **compiler architecture itself** is no longer the primary Gate-B weakness.

The weakness has shifted to **domain coverage**.

## 3. Regulatory / target coverage

| Area | State | Notes |
|---|---|---|
| target date/version/transition | SUPPORTED | L/F transition dependency exercised |
| A Structure | PARTIAL | topology native; adequacy external |
| B Fire | PARTIAL | local contributions; whole-house strategy not yet supported as a family |
| C Moisture | SUPPORTED/PARTIAL | wall/window/corner/floor-perimeter routes now explicit |
| E Sound | PARTIAL | same-dwelling conditions only; no separating construction in H1 detached baseline |
| F Ventilation | **SUPPORTED FAMILY SELECTED** | VENT-CMEV-01; competent airflow design/commissioning external |
| K Falling/glazing | PARTIAL | window applicability tested |
| L Energy | PARTIAL | boundary semantics strong; full dwelling model not instantiated |
| M Access | PARTIAL | Category-1 room/door/control route tested; whole-dwelling access not yet compiled |
| O Overheating | CONTRIBUTION ONLY | whole-dwelling analysis external/uninstantiated |
| P Electrical | INTERACTION ONLY | competent electrical design external |
| Q Security | PARTIAL | window applicability/product evidence route represented |
| Regulation 7 / AD7 | SUPPORTED PROCESS | numeric/product envelopes external |

### Assessment

Target architecture is viable.

Coverage is not yet complete enough for whole-house release.

## 4. Structure

| Structural capability | H1 v0 state | Notes |
|---|---|---|
| load-bearing identity | NATIVE |
| support/load-path topology | NATIVE |
| opening support obligations | NATIVE |
| floor span geometry extraction | NATIVE |
| wall restraint roles | NATIVE/PARTIAL |
| I-joist upper floor | SUPPORTED + EXTERNAL EVIDENCE | member/hanger engineering external |
| masonry walls | SUPPORTED + EXTERNAL EVIDENCE | capacity/stability external |
| ordinary window heads | SUPPORTED + EXTERNAL EVIDENCE | lintel/head engineering external |
| internal loadbearing door heads | SUPPORTED + EXTERNAL EVIDENCE | engineering external |
| foundations | EXTERNAL | explicit H1-v0 decision |
| global stability | EXTERNAL | semantics required; calculation external |
| roof structure | **SUPPORTED candidate** | RF-TRUSS-DUO-01; structural adequacy external |
| stairs/opening trimmers | **SUPPORTED candidate** | ST-PRIVATE-01; trimmer/member adequacy external |
| arbitrary steel transfers | UNSUPPORTED | deliberate |

### Assessment

The external-adequacy decision successfully prevents structural engineering from swallowing the project.

The major ordinary structural gap is now:

Roof and stair gaps are now materially reduced by RF-TRUSS-DUO-01 and ST-PRIVATE-01.

rather than “structure in general”.

## 5. External envelope

| Envelope condition | H1 v0 state | Current family |
|---|---|---|
| masonry cavity wall field | SUPPORTED candidate | W-S0-01 |
| window in cavity wall | SUPPORTED + EXTERNAL EVIDENCE | BF-WIN-MCW-01 |
| 90° external masonry corner | SUPPORTED + EXTERNAL EVIDENCE | BF-CORNER-MCW-01 |
| ground-floor/wall perimeter | SUPPORTED route + EXTERNAL evidence | BF-GF-MCW-01 |
| ordinary external door in cavity wall | **SUPPORTED candidate** | ENTR-DOOR-MCW-01 |
| roof/wall/eaves junction | **GAP** | depends on roof family |
| roof ridge/hip/valley | **GAP** | roof family absent |
| service penetration through envelope | PARTIAL | S0 semantics; family not hardened |
| complex façade/cladding | UNSUPPORTED | deliberate |
| basement envelope | UNSUPPORTED | deliberate |

### Assessment

S1 materially improved envelope coverage.

The remaining ordinary envelope gap is now concentrated around controlled service penetrations and roof/eaves detail hardening; the principal entrance is covered by ENTR-DOOR-MCW-01.

## 6. Ground floor / interior fabric

| Condition | State | Notes |
|---|---|---|
| finished floor datum | NATIVE |
| ground-floor boundary route | SUPPORTED + EXTERNAL | floor implementation family still unselected |
| conventional room finish | SUPPORTED baseline | S0-A process model |
| internal non-loadbearing partition | CANDIDATE | simple semantics, no dedicated family |
| internal loadbearing wall | SUPPORTED + EXTERNAL STRUCTURE | S1 |
| ordinary internal door | SUPPORTED semantically | Part M/F roles tested |
| ceiling below same-dwelling upper floor | SUPPORTED baseline | product/fire evidence external |
| removable W2 lining | EXTENSION CANDIDATE | not H1 baseline |
| removable floor platform | UNSUPPORTED initially | deliberate |

### Assessment

Interior ordinary-construction coverage is adequate for early H1 research.

## 7. Windows, doors and circulation

| Capability | State | Notes |
|---|---|---|
| window semantic/operational roles | NATIVE concept | S0/S1 |
| window product family | SUPPORTED route / product unselected | shared + occurrence applicability |
| internal door multi-role semantics | NATIVE concept | S1 |
| Category-1 internal access route | SUPPORTED/PARTIAL | room-scale tested |
| external entrance door | **SUPPORTED candidate** | ENTR-DOOR-MCW-01 |
| stair semantic role | CANDIDATE | G-01 evidence exists, technical family absent |
| stair technical family | **SUPPORTED candidate** | ST-PRIVATE-01 |
| service/secondary circulation rank | G01-PILOT candidate | not validated G-01 |

### Assessment

For a two-storey dwelling, the first private-stair family now exists; validation and floor-opening integration remain open.

## 8. Services

| Service capability | State | Notes |
|---|---|---|
| room low-level service geography | SUPPORTED + EXTERNAL technical design | SR-ROOM-LOW-01 |
| controlled service crossing concept | NATIVE/PARTIAL | S0 |
| electrical circuit design | EXTERNAL | deliberate |
| simple hydronic emitter branch | SUPPORTED route + EXTERNAL design | S1 |
| plant/service hub | CANDIDATE | doctrine mature; no computational family |
| vertical riser | CANDIDATE | doctrine mature |
| whole-house heating family | **GAP** | not selected |
| whole-house ventilation family | **SUPPORTED candidate** | VENT-CMEV-01; MVHR extension reserved |
| hot/cold water distribution | **GAP** | network/failure semantics not formalised |
| sanitary drainage | **GAP** | no H1 family |
| kitchen extract | CANDIDATE | topology understood, family not formalised |
| bathroom extract | CANDIDATE | same |
| arbitrary service routing | UNSUPPORTED | deliberate |

### Assessment

**Services are now the largest whole-house domain gap.**

Room-scale topology is promising, but H1 cannot be called a supported whole house while:

- ventilation;
- water;
- drainage;
- heating source/distribution

remain unselected.

## 9. Wet rooms

| Capability | State |
|---|---|
| wet-room role/cluster concept | CANDIDATE |
| water isolation/access doctrine | CANDIDATE |
| drainage fall/topology | OPEN |
| waterproofing family | OPEN |
| electrical-zone interaction | OPEN |
| extract family | CANDIDATE |
| maintainable service wall | CANDIDATE |

### Assessment

Wet rooms are a concentrated Gate-B gap.

Do not solve them by allowing arbitrary plumbing.

## 10. Roof

Current state:

**NO H1 SUPPORTED ROOF FAMILY**

This is unacceptable for Gate B.

The first roof family should be technically ordinary and deliberately narrow.

Recommended direction:

> **prefabricated timber trussed-rafter pitched roof, uninhabited roof space, no complex dormers/large rooflights, manufacturer/engineer structural design external, compiler-native geometry/support/boundary/evidence semantics.**

Why:

- ordinary UK construction;
- repeatable;
- external engineering evidence already natural to the procurement model;
- compatible with SAB-H1-01;
- removes arbitrary cut-roof design from the first domain;
- allows the compiler to focus on geometry, bearing, stability roles, insulation/air/moisture/drainage and maintenance access.

Exact roof family still needs a dedicated document.

## 11. Fire / escape

Current strength:

- target source/versioning;
- local cavity/lining/opening contributions;
- door/window role applicability can remain unresolved correctly.

Gap:

**there is no first whole-house H1 fire/escape strategy family.**

H1 should not support arbitrary fire engineering.

It needs one conventional low-rise dwelling route with:

- storey limits;
- escape topology;
- smoke/heat alarm obligations;
- internal-door applicability;
- stair/protected-route conditions where relevant;
- cavity/opening interfaces.

This should remain target-driven and may require competent building-control review.

## 12. Accessibility

S1 proves the target can reason about:

- entrance-storey habitable-room access;
- doorway approach;
- service-control height.

Whole-house H1 still needs:

- principal entrance;
- entrance threshold/approach;
- stair interaction;
- WC provision;
- target migration M4(1) ↔ optional categories.

This is manageable but not yet complete.

## 13. Architectural grammar

### Mature enough for compiler research

G01-PILOT-P0 can test:

- hierarchy;
- route class;
- sequence;
- scoped axis/order;
- opening rank;
- no-universal-ratio guardrail.

### Not mature enough

- numerical room bands;
- façade bay formulas;
- Georgian window ratios;
- courtyard extension;
- full rule promotion.

### Assessment

Grammar is **not a Gate-B blocker** if S2 remains a research fixture.

It becomes a blocker before claiming H1 generates architecturally resolved G-01 houses.

## 14. Quantity / cost / carbon

### Quantity

Basic geometric quantity derivation has worked in S0/S1.

**State: NATIVE CONCEPT**

### BOM

Family/product selection not mature enough for procurement-grade BOM.

**State: PARTIAL**

### BoQ / cost

**OPEN**

### carbon

**OPEN**

### Assessment

These are not immediate Gate-B blockers for proving the house compiler, but they remain part of the long-term proposition.

## 15. Construction / evidence / release

Strengths:

- workmanship process semantics;
- hold points;
- future evidence;
- scoped external evidence;
- stale-evidence invalidation;
- target migration;
- shared versus occurrence evidence.

Gaps:

- real professional evidence packages;
- actual product evidence;
- as-built/commissioning feedback;
- release manifest exercised end-to-end with real documents.

### Assessment

An **external competent review is now mandatory before Gate B/C are treated as implementation-ready**.

## 16. Whole-house readiness test

Would an ordinary two-storey detached H1 house currently be mostly supported?

### Yes, in:

- semantic geometry;
- wall/opening/corner/floor-edge envelope logic;
- upper-floor topology;
- room access;
- room-scale services;
- evidence/provenance;
- target applicability;
- change invalidation.

### No, still materially external/open in:

- roof;
- stairs;
- principal entrance/external door;
- whole-house ventilation;
- heating source/distribution;
- water;
- drainage;
- wet rooms;
- whole-house fire/escape;
- foundations/ground;
- whole-dwelling L/O calculations.

### Verdict

**H1 IS NOT YET GATE-B COMPLETE.**

But the problem is now **modular rather than foundational**.

That is significant progress.

## 17. Priority order

### P1 — roof family

Needed by every two-storey/roofed H1 house.

### P2 — stair + vertical-circulation family

Needed for two-storey H1 and S2/S3 topology.

### P3 — external entrance door family

Needed to complete M/Q/envelope entry semantics.

### P4 — one whole-house ventilation family

Needed to move Part F from room contribution to supported system.

### P5 — one heating family

Keep narrow.

### P6 — water/drainage/wet-room family

Likely one clustered service-wall/wet-room strategy.

### P7 — first whole-house fire/escape family

Should be developed with external competent review rather than from internal reasoning alone.

## 18. Complexity warning

The remaining modules could trigger a second complexity explosion if each becomes its own independent subsystem.

The programme should preserve the S0/S1 architecture:

~~~text
MEANINGFUL HOUSE SYSTEM / FAMILY
    ↓
SHARED GRAPH CONTRIBUTIONS
    ↓
SCOPE-CORRECT OBLIGATIONS
    ↓
GROUPED RESOLUTION ACTIONS
~~~

Do not create:

- roof checklist;
- stair checklist;
- ventilation checklist;
- wet-room checklist;

as separate silos that are reconciled manually at whole-house scale.

## 19. Gate-B path from here

Before S2:

- roof is useful but not strictly required if S2 remains ground-floor/connected-room research;
- stair semantics are needed if S2 includes vertical circulation;
- G01-PILOT-P0 is available;
- external expert review remains open.

Before whole-house H1:

**roof + stair + entrance + whole-house ventilation + wet-service strategy are mandatory coverage gaps.**

## 20. Current strategic conclusion

The executable-architecture idea has passed the point where its biggest risk is:

> can we represent building relationships at all?

The bigger risk is now:

> **can we complete enough ordinary domain families without turning the project into an endless standards/MEP encyclopaedia?**

That is the right next pressure.

H1 should remain intentionally narrow.

Each new family must remove a meaningful whole-house gap, not merely add completeness for its own sake.
