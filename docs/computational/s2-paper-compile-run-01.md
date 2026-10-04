# Domain S2 — Paper Compilation Run 01

**Run ID:** S2-RUN-01  
**Source:** [S2 Frozen Connected-Cluster Source Package](s2-source-package.md)  
**Target basis:** H1 current target + services extension + FIRE-H1-2S-EGRESS-01 candidate  
**Grammar:** G01-PILOT-P0  
**Date:** 2026-10-04  
**Implementation:** manual paper compilation

## 1. Headline result

### Research compile

**PASS — CONNECTED-CLUSTER SCALE**

S2 successfully composes:

- principal entrance;
- hall;
- principal room;
- secondary room;
- wet/service core;
- private stair;
- upper landing;
- representative bedroom;
- shared façade relationships;
- whole-house ventilation/heating/wet-service families;
- candidate whole-house fire route;
- architectural hierarchy/sequence.

The source remains one connected model.

No separate discipline model had to duplicate the rooms, doors, stair or service core.

### Building release

**FAIL — EXPECTED**

S2 still lacks:

- competent external structural review/evidence;
- competent fire/building-control review;
- actual ventilation design/commissioning;
- heating design;
- drainage/water design;
- selected product evidence;
- whole-dwelling Part L/O calculations;
- construction evidence.

## 2. Core result — architecture can fail while the building still works technically

S2 is the first fixture where several mutations can produce:

~~~text
TECHNICALLY VALID
+
ARCHITECTURALLY WRONG
~~~

or:

~~~text
ARCHITECTURALLY COHERENT
+
TECHNICALLY INVALID
~~~

That is essential.

A house compiler cannot reduce all validity to one pass/fail axis.

## 3. Geometry

### Principal room

4800 × 5400.

**PASS**

### Secondary room

4000 × 4500.

**PASS**

### Hall

2000 mm clear width.

**PASS**

### Entrance

900 mm clear, step-free.

**PASS against current H1 entrance route**

## 4. Stair compile

Source:

- floor-to-floor = 3000 mm;
- 18 risers;
- nominal rise = 166.7 mm;
- going = 250 mm;
- 2R + G = 583.3 mm;
- pitch ≈ 33.7°;
- two straight flights + rectangular landing;
- width = 900 mm.

Against ST-PRIVATE-01 / selected Part-K route:

- rise inside range;
- going inside range;
- pitch below maximum;
- 2R+G inside route;
- width inside H1 project envelope;
- headroom source says supported arrangement.

**STAIR GEOMETRY: PASS**

Structural stair/floor-trimmer evidence:

**EXTERNAL**

## 5. Architectural hierarchy

Declared:

- R-P01 = principal H1;
- R-S01 = secondary H2;
- B-01 = H2;
- H-01 = principal circulation;
- ST-01 = principal vertical circulation;
- U-01 = service/secondary.

Important:

ENTR-01 / ST-01 sit on AXIS-A01.

R-P01 does not.

Therefore:

> principal architectural rank is not inferred from centring.

**G01-PILOT HIERARCHY: PASS**

## 6. Route / sequence

### Principal arrival

~~~text
OUTSIDE
  → ENTR-01
  → H-01
  → D-P01
  → R-P01
~~~

### Vertical route

~~~text
ENTR-01
  → H-01
  → ST-01
  → L-01
  → B-01
~~~

### Service route

~~~text
H-01
  → D-U01
  → U-01
~~~

Service route is subordinate.

**ROUTE CLASS: PASS**

**SEQUENCE: PASS**

## 7. Scoped axis

AXIS-A01:

- ENTR-01 centreline = 5800;
- ST-01 route centreline = 5800.

No claim is made that:

- the whole façade is symmetric;
- the principal room is centred;
- all openings align to AXIS-A01.

**SCOPED AXIS: PASS**

This is exactly the representation G01-CAND-04 called for.

## 8. Opening hierarchy / coupling

Front ground-floor openings:

- WIN-P01 = PRIMARY;
- WIN-S01 = SECONDARY;
- WIN-P01 nominal area > WIN-S01.

**OPENING RANK: PASS**

Vertical relation:

- WIN-S01 centreline X = 8800;
- WIN-B01 centreline X = 8800.

**ALIGN-V01: PASS**

This coupling is explicit.

It is not inferred from a generic façade symmetry flag.

## 9. Entrance / accessibility

ENTR-01:

- 900 mm clear;
- step-free;
- connected to wide hall.

Room doors:

- principal 850;
- secondary 800.

Current Category-1 research route:

**PASS at represented cluster scale**

Whole-dwelling Part-M audit:

**OUTSIDE S2 / NOT CLAIMED**

## 10. Fire / escape

Candidate family:

**FIRE-H1-2S-EGRESS-01**

B-01 upper FFL:

3.0 m above ground.

Inside selected <=4.5 m route.

WIN-B01:

- effective escape area = 0.60 m²;
- openable dimensions >450 mm;
- bottom of openable area = 900 mm AFFL.

Against current target research route:

**ESCAPE-WINDOW GEOMETRY: PASS**

Ground route:

- hall → ENTR-01 → outside.

**SEMANTIC FINAL-EXIT ROUTE: PASS**

Alarm system:

**OBLIGATION GENERATED / PRODUCT + INSTALLATION EVIDENCE UNRESOLVED**

Whole fire-family result:

**RESEARCH ROUTE PASS / EXTERNAL COMPETENT REVIEW REQUIRED**

## 11. Ventilation

Family:

VENT-CMEV-01.

### Habitable inlet nodes

- R-P01;
- R-S01;
- B-01.

### Extract node in represented cluster

- U-01.

### Transfer

- room doors;
- hall;
- stair/landing;
- utility route.

**LOCAL VENTILATION TOPOLOGY: PASS**

Whole-dwelling airflow rate, full inlet count, fan selection and commissioning:

**EXTERNAL / WHOLE-DWELLING CONTEXT REQUIRED**

This is the correct scope.

## 12. Heating

Family:

HEAT-ASHP-RAD-01.

Source has:

- shared plant/service core;
- three representative radiator nodes;
- accessible service routes.

**HEATING TOPOLOGY: PASS**

Heat-loss / emitter / heat-pump sizing:

**EXTERNAL**

No underfloor heating network is introduced.

## 13. Wet services

Family:

WET-CORE-01.

U-01 baseline:

- adjacent riser;
- short WC/utility branches;
- accessible valve cluster;
- hot-water plant relation;
- stack/rodding access.

**WET-SERVICE TOPOLOGY: PASS**

Detailed Part-G/H sizing/falls:

**EXTERNAL / TARGET EVIDENCE**

The important compile result is that no long hidden route is required by the baseline plan.

## 14. Structure

Native topology:

- upper floor support relations represented;
- stair opening/trimmer obligation represented;
- window/door heads represented;
- service-core crossings typed.

**STRUCTURAL TOPOLOGY: PASS**

Adequacy:

**EXTERNAL under SAB-H1-01**

## 15. Default author-facing issue surface

Despite multiple rooms/storeys/systems, the unresolved state can still be grouped approximately as:

1. **Site + envelope context/product evidence**
2. **Structural engineering package**
3. **Fire/building-control review + alarm/window fire evidence**
4. **Whole-house ventilation design/commissioning**
5. **Heating design + heat-pump/emitter evidence**
6. **Water/drainage technical design + hot-water safety**
7. **Whole-dwelling energy/overheating evidence**
8. **Product-specific construction/tolerance/commissioning evidence**

Architectural hierarchy/sequence/axis have no baseline issue.

### Complexity result

Internal obligations are far more numerous than eight.

The author-facing actions remain decision-shaped.

**S2 COMPLEXITY GATE: PROVISIONAL PASS**

## 16. Mutation S2-M01 — service shortcut

Add a 900 mm general-use door:

U-01 → R-P01.

### Connectivity

Increases.

**TOPOLOGY: VALID**

### Technical services

Wet core remains valid.

**PASS**

### Architecture

A service room now becomes an ordinary shortcut into the principal room.

This conflicts with:

- G01-PILOT principal/service route distinction;
- declared principal arrival sequence.

**ARCHITECTURAL ROUTE HIERARCHY: FAIL / DEVIATION**

### Regulation

No automatic Part-M/fire failure merely because the extra door exists.

Applicable route/fire relationships must re-evaluate, but the original hall/final-exit path remains.

### Result

This is one of the strongest research results yet:

> **more connectivity is not automatically better architecture.**

## 17. Mutation S2-M02 — stair-axis drift

ST-01 centreline:

5800 → 6200.

Rise/going unchanged.

### Stair Part K

**PASS**

### Project / G01-PILOT order

AXIS-A01 broken.

**FAIL / DEVIATION**

### Structure

Floor opening/trimmer geometry changes.

**STRUCTURAL EVIDENCE STALE**

### Fire

Vertical escape route still connects the same storeys/hall.

**ROUTE REMAINS VALID**, subject to changed geometry not causing another conflict.

### Result

Architectural axis and technical stair validity remain independent.

## 18. Mutation S2-M03 — flatten opening hierarchy

WIN-S01:

1500 × 1500 → 1900 × 1800.

It becomes larger than WIN-P01.

### Architectural order

Declared PRIMARY > SECONDARY opening rank no longer expressed by size.

**G01-PILOT OPENING-HIERARCHY DEVIATION**

This is not automatically a universal Georgian failure; it is a failure of the selected pilot profile.

### Technical consequences

Re-evaluate:

- lintel/head;
- wall quantities;
- thermal;
- B4 elevation contribution;
- product;
- weather/air transition.

WIN-P01 remains locally unchanged.

### Result

One geometric edit legitimately touches both architecture and technical evidence, but through separate authorities.

## 19. Mutation S2-M04 — remove upper escape capability

WIN-B01 becomes fixed.

Masonry opening unchanged.

### Fire

FIRE-H1-2S-EGRESS-01 relies on B-01 escape capability.

**FIRE FAMILY: FAIL**

Alternative route required.

### Ventilation

If WIN-B01 was also the bedroom purge route:

**PURGE ROUTE RE-EVALUATE / FAIL unless alternate opening exists**

### Thermal / façade geometry

Can remain geometrically valid.

### Result

A product/operation mutation can invalidate fire + ventilation without changing façade opening geometry.

## 20. Mutation S2-M05 — move wet core

Relocate U-01 / service core approximately 4 m west.

Room identities remain.

### Wet services

Re-evaluate:

- WC/waste branch;
- water routes;
- cylinder/stack relationship;
- rodding/access;
- gravity fall.

May leave WET-CORE-01 supported geometry.

### Ventilation

Extract duct routes/fan position re-evaluate.

### Heating

Plant/distribution lengths and service spine re-evaluate.

### Architecture

Principal room hierarchy and front façade remain unchanged.

### Default issue

Do not emit three unrelated subsystem warnings by default.

Group:

> **Wet/service core relocation breaks current service strategy — drainage, ventilation and heating routes require re-resolution.**

### Result

**SHARED-CORE COMPLEXITY TEST: PASS**

## 21. Mutation S2-M06 — entrance-hall obstruction

Fixed joinery reduces principal clear route near entrance/stair to:

750 mm.

### Accessibility

**FAIL / RE-EVALUATE**

### Fire

Final-exit route is obstructed/narrowed.

**FIRE ROUTE: RE-EVALUATE / FAIL under selected route**

### Architecture

Principal arrival compromised.

**ORDER / ARRIVAL DEVIATION**

### Structure / wet services

**UNCHANGED**

One physical obstruction legitimately affects three route authorities.

## 22. Mutation S2-M07 — promote service route

No geometry changes.

Change route classification:

U-01 service path → PRINCIPAL.

### Technical systems

No geometry or service validity changes.

### Architecture

Conflicts with declared hierarchy:

- principal arrival route no longer unique/clear;
- service circulation becomes co-dominant.

**G01-PILOT / PROJECT-ORDER FAIL**

### Regulation

No direct statutory failure generated solely from the role reclassification.

### Result

This demonstrates that semantic authoring matters even when geometry is unchanged.

## 23. Mutation S2-M08 — raise upper floor

Upper FFL:

3000 → 3250 mm.

Initial stair geometry/product evidence is unchanged.

### Source relationship

Old stair no longer meets the new landing elevation.

**STAIR SOURCE/EVIDENCE: STALE**

If the compiler re-solves within the same 18-riser family:

- rise = 180.6 mm;
- going = 250 mm;
- 2R + G = 611.1 mm;
- pitch ≈ 35.8°.

Those values remain inside the current private-stair target route.

Therefore:

**A VALID REPARAMETERISATION EXISTS**

but:

- stair product/structural evidence changes;
- floor opening/headroom re-evaluates;
- landing/door interfaces re-evaluate.

### Fire

Upper storey still below the selected 4.5 m threshold.

**FIRE FAMILY APPLICABILITY REMAINS**

### Result

This is the first strong example of a mutation that should trigger:

> **RECOMPILE / RESOLVE**

rather than simply PASS or FAIL.

## 24. New modelling result — “re-solvable” is distinct from valid

S2-M08 exposes a useful state.

The source after mutation is not yet valid because the existing stair no longer reaches the floor.

But the system can prove:

> the selected stair family still contains a valid solution.

Therefore future authoring may distinguish:

- VALID;
- INVALID;
- UNSUPPORTED;
- UNRESOLVED;
- **RESOLVABLE WITHIN CURRENT FAMILY**.

This should be treated cautiously.

It could become an excellent UX state:

> “Upper floor moved +250 mm. Stair can be re-solved within ST-PRIVATE-01; 4 dependent evidence items will become stale.”

Do not promote this state into the formal model until more examples confirm it.

## 25. New modelling result — route roles are semantic source, not analysis decoration

S2-M07 confirms that:

- principal;
- service;
- secondary;
- escape;

route roles are not merely labels added after geometry is drawn.

They affect architectural validity.

The source model therefore needs a way to author intentional route roles without requiring the user to draw separate graph objects manually.

## 26. Family-catalogue complexity audit

S2 uses many named families.

That creates a legitimate concern:

> is the model becoming a catalogue of acronyms?

Current answer:

**not yet**, because the user-facing authoring can still be expressed through meaningful selections:

- masonry house;
- principal entrance;
- private stair;
- central extract ventilation;
- heat pump + radiators;
- clustered wet core;
- two-storey escape-window fire route.

The internal family IDs exist for provenance and evidence.

### Alarm threshold

Raise alarm if ordinary authoring starts requiring the user to know IDs such as:

- BF-GF-MCW-01;
- VENT-CMEV-01;
- ST-PRIVATE-01.

Those are expert/internal names.

The UI should say:

> Simple masonry wall  
> Private stair  
> Central extract ventilation

unless expert inspection is requested.

## 27. S2 acceptance audit

| Question | Result |
|---|---|
| connected source model | PASS |
| hierarchy independent of centring | PASS |
| principal/service route distinction | PASS |
| sequence represented relationally | PASS |
| stair multi-role composition | PASS |
| shared façade/order scope | PASS |
| wet-core shared consequences | PASS |
| upper fire route | PASS as candidate / external review open |
| selective invalidation | PASS across mutations |
| semantic-only mutation | PASS |
| re-solvable mutation | NEW RESEARCH RESULT |
| complexity containment | PROVISIONAL PASS |
| release-grade compile | FAIL — correct |

## 28. Course judgement

No major course change is required.

However two alarms remain active.

### Alarm A — family-catalogue inflation

Keep families internal/expert-facing.

New families must remove real unsupported conditions.

### Alarm B — external-evidence optimism

S2 looks coherent partly because external engineering/regulatory evidence has not yet been exercised with real practitioners/documents.

That is now the larger credibility risk.

## 29. What S2 earns

S2 is sufficient evidence to begin designing a **whole H1 paper house compile**.

But do not do that immediately.

First:

1. integrate the new RESOLVABLE concept cautiously into the research programme;
2. obtain or simulate with real published/example evidence at least one structured external evidence package;
3. harden one wet-room waterproofing family and one controlled envelope-penetration family;
4. keep the external competent-review gate explicit.

Then the next research scale can be:

> **H1-PAPER-01 — first complete bounded house compile**

That should be the last major paper gate before software architecture is reconsidered.

## 30. Final result

S2 answers its central question positively:

> **The compiler can preserve architectural hierarchy, route and sequence while the same geometry participates in structure, fire, accessibility and services.**

The most important evidence is S2-M01 and S2-M07.

A service route can be perfectly buildable and perfectly compliant yet still be architecturally wrong.

That is exactly why the project needed an architectural compiler rather than merely a building-regulations checker.
