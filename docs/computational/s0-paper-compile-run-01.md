# Domain S0 — Paper Compilation Run 01

**Run ID:** S0-RUN-01  
**Source:** [S0 Frozen Source Package v0.1](s0-source-package.md)  
**Target:** [T-ENG-NDW-2026-10-03-S0](s0-target-snapshot.md)  
**Domain:** DOMAIN-S0  
**Variants:** S0-A conventional control; S0-B selective tectonic comparison  
**Compile mode:** exploratory / coordinated-design research  
**Date:** 2026-10-03  
**Implementation:** manual paper compilation

## 1. Headline result

### Research result

**THE COMPILER ABSTRACTION SURVIVES THE FIRST END-TO-END SLICE.**

The S0 source model can be taken through:

- semantic entities;
- geometry;
- structural topology;
- boundary topology;
- regulatory-route obligations;
- Long-Life House doctrine;
- workmanship/tolerance;
- evidence planning;
- quantities;
- deliberate mutation/invalidation;

without collapsing these authorities into one another.

### Building-release result

**S0-A: RELEASE FAIL — EXPECTED**  
**S0-B: RELEASE FAIL — EXPECTED / ADDITIONAL CANDIDATE-DOMAIN OBLIGATIONS**

Neither variant has enough real structural, thermal, product, fire, moisture and site evidence to justify release.

That is not a failed research run.

A paper compiler that returned a green building from the available evidence would be untrustworthy.

## 2. Source model summary

The fixture contains one 3.0 m external-wall bay.

~~~text
EXTERIOR
   │
   │ WEATHER / THERMAL / AIR / MOISTURE boundaries
   ▼
┌─────────────────────────────────────────────────────┐
│ 102.5 brick                                         │
│ 50 residual drained cavity                          │
│ 150 mineral-wool insulation                         │
│ 215 dense masonry inner leaf                        │
│ 8 parge / provisional primary air layer             │
│                                                     │
│       ┌──────── OPENING O01 ────────┐               │
│       │  replaceable WINDOW WIN01   │               │
│       └─────────────────────────────┘               │
│                                                     │
│ floor F01 → restraint hanger → inner masonry        │
└─────────────────────────────────────────────────────┘
   │
   │ A: 15 mm conventional finish
   │ B: 75 mm candidate W2 zone
   ▼
ROOM R01
~~~

One controlled 32 mm service sleeve P01 crosses the wall in the right-hand pier.

The fixture intentionally contains both:

- a replaceable window;
- a permanent-fabric penetration.

This forces replacement and penetration semantics into the same compile.

## 3. Model-integrity compile

### MOD-01 — entity identity

All required S0 entities have stable research identifiers.

**Result:** PASS

### MOD-02 — relationship resolution

All authored relationships point to declared entities.

**Result:** PASS

### MOD-03 — authority separation

The source distinguishes:

- geometry assumption;
- physical requirement;
- regulatory target;
- doctrine;
- architectural grammar research;
- evidence state.

**Result:** PASS

This is foundational.

A doctrine failure must not masquerade as a regulatory failure.

## 4. Geometry compile

### GEO-01 — opening fits wall bay

Bay width: 3000 mm  
Opening width: 1200 mm  
Residual side pier each side: 900 mm

**Result:** PASS — geometric fact only

This does not prove masonry capacity.

### GEO-02 — vertical opening fit

Sill: 750 mm AFFL  
Opening height: 1800 mm  
Head: 2550 mm AFFL  
Nominal room clear height: 2850 mm

Nominal solid field above opening before ceiling/cornice coordination: 300 mm.

**Result:** PASS — geometric fit

Structural lintel/cornice/detail adequacy remains separate.

### GEO-03 — maintenance working volume

Required paper-test zone:

1400 × 1000 × 2200 mm.

Baseline source has no obstruction in that volume.

**Result:** PASS

### GEO-04 — window withdrawal volume

Required paper-test zone:

1400 × 1200 × 2200 mm.

Baseline source has no obstruction in that volume.

**Result:** PASS

### GEO-05 — service penetration location

P01 is explicitly located in a 900 mm side pier and not authored through the opening head/floor-hanger zone.

**Result:** PASS — location only

Structural/weather/air consequences are evaluated separately.

## 5. Structural compile

The structural compiler is deliberately split into:

1. **topology** — do loads/reactions have explicit destinations?
2. **adequacy** — are members/connections actually strong/stiff/stable enough?

S0 can answer more of (1) than (2).

### STR-S0-01 — floor support path

Semantic gravity path:

~~~text
floor finish / occupation
→ structural deck
→ I-joist
→ restraint-type hanger
→ 215 mm masonry inner leaf
→ wall below
→ foundation / ground [OUTSIDE S0]
~~~

The path is explicit and has no orphan node inside the slice.

**Topology result:** PASS

**Adequacy result:** UNRESOLVED

Reason:

- no I-joist family selected;
- no load calculation;
- no hanger product/capacity;
- foundation/ground outside S0.

### STR-S0-02 — restraint-type hanger route

Approved Document A's small-building guidance recognises restraint-type joist hangers as a lateral-support route when applicable.

The source declares:

- low-rise dwelling;
- restraint-type hanger family;
- 400 mm nominal joist centres.

This is geometrically comfortably inside the guidance's 2 m interval concept for restraint-type hangers.

**Applicability/semantic route:** PASS

**Product conformity/capacity:** UNRESOLVED — external structural/product evidence required.

Important distinction:

> the compiler can prove that the design selected a recognised route without pretending it has proved the selected hardware.

### STR-S0-03 — opening head support

O01 generates an explicit head-support obligation.

Source contains a nominal 1500 mm lintel envelope only.

**Result:** UNRESOLVED

Required:

- load model;
- lintel/member family;
- bearing requirements;
- product/calculation evidence.

### STR-S0-04 — residual pier/support condition

Each side pier is 900 mm at baseline.

The geometry is known.

The masonry capacity/stability implication is not.

**Result:** UNRESOLVED

This is the correct boundary between geometry and engineering.

### STR-S0-05 — wall lateral support

Floor/wall restraint role is explicit.

**Semantic result:** PASS

**Whole-wall/whole-building structural proof:** EXTERNAL / OUTSIDE S0

### STR-S0-06 — service penetration

A 32 mm core is explicitly represented.

The system therefore does not silently assume a solid wall.

**Result:** UNRESOLVED STRUCTURAL EFFECT / LOW-SCALE EXTERNAL CHECK

The key success is that the penetration exists in the structural graph.

### Structural dimension result

**V3 STRUCTURAL RESOLUTION: FAIL / UNRESOLVED FOR RELEASE**

Topological integrity is good.

Engineering proof is intentionally absent.

## 6. Boundary compile

## 6.1 Weather / moisture

### BND-WEA-01 — drained cavity

Source defines:

- 150 mm partial-fill insulation;
- 50 mm residual drained cavity.

Approved Document C's common cavity-wall route uses a cavity at least 50 mm wide and, for partial fill, a residual cavity not less than 50 mm.

**Geometric route:** PASS

This does not prove exposure suitability or workmanship.

### BND-WEA-02 — window joint

The opening creates head/jamb/sill precipitation obligations.

Approved Document C requires wall/window joints to resist penetration of precipitation and directs moisture outward where the opening/reveal arrangement requires it.

Source declares:

- drained cavity;
- opening transition;
- head/jamb/sill water-management obligation.

But no final closer/tray/sill/reveal product/detail is selected.

Driving-rain exposure is unknown.

**Result:** UNRESOLVED

### BND-WEA-03 — service penetration

P01 crosses the weather boundary.

Required treatment:

- outward-falling sleeve;
- exterior weather seal/termination;
- cavity continuity/drainage protection.

Concept is authored.

Product/detail is not.

**Result:** UNRESOLVED

## 6.2 Thermal

### BND-THM-01 — field wall

Thermal path exists semantically.

Target limiting value for the external wall under the frozen Part L route:

**U ≤ 0.26 W/(m²·K)**.

No product conductivity set or U-value calculation is present.

**Result:** UNRESOLVED

### BND-THM-02 — window

Target limiting value:

**Uw ≤ 1.6 W/(m²·K)**.

No window selected.

**Result:** UNRESOLVED

### BND-THM-03 — junction

The window reveal/head/sill and floor edge create thermal-bridge obligations.

No ψ-values / validated junction calculations exist.

**Result:** UNRESOLVED / EXTERNAL BUILDING-PHYSICS EVIDENCE

## 6.3 Air boundary

This is one of S0's strongest results.

Approved Document L guidance for new dwellings explicitly calls for:

- drawings showing the air-barrier position/continuity;
- penetrations to be minimised/sealed;
- structural penetrations to be sealed;
- parge/plaster-type treatment to dense blockwork to reduce air permeability;
- window/door frames to connect to the primary air barrier.

The S0 semantic path is:

~~~text
parge on dense masonry
→ sealed opening transition
→ window frame/interface
→ sealed P01 sleeve
→ floor-edge continuation
~~~

### BND-AIR-01 — boundary topology

Every transition is named.

No removable S0-B panel carries the primary air boundary.

**Result:** PASS — semantic topology

### BND-AIR-02 — actual material/installation performance

No tape/sealant/parge system or physical test is selected.

**Design evidence:** UNRESOLVED  
**Construction evidence:** PLANNED  
**Whole-dwelling airtightness test:** FUTURE / OUTSIDE S0

This distinction is useful:

> boundary topology can pass while physical boundary performance remains unproved.

## 6.4 Fire

### BND-FIR-01 — cavity around opening

Approved Document B requires cavity edges/openings to be dealt with, subject to the masonry-cavity-wall route shown in Diagram 5.3.

The S0 wall has:

- 102.5 mm masonry outer leaf;
- 215 mm masonry inner leaf;

so the simple dimensional condition of two masonry leaves at least 75 mm thick is met.

The source also declares cavity closure around the window as an obligation.

**Route geometry/applicability:** PASS / route available

**Actual closure construction/material evidence:** UNRESOLVED

### BND-FIR-02 — internal lining

For ordinary rooms in the relevant Approved Document B table, wall/ceiling lining classification requirements apply.

No S0-A plaster system or S0-B panel product/classification has been selected.

**S0-A:** UNRESOLVED PRODUCT/ASSEMBLY EVIDENCE  
**S0-B:** UNRESOLVED + CANDIDATE-ASSEMBLY PROTOTYPE/EVIDENCE

### BND-FIR-03 — floor-edge cavity

The S0 intermediate floor is not authored as a compartment floor.

Therefore the specific compartment-floor cavity-barrier condition is not automatically asserted.

**Result:** NOT APPLICABLE on present S0 facts, subject to whole-house fire strategy.

This is important: do not create fire obligations just because a cavity exists.

## 6.5 Acoustic

The tested external wall/floor bay in a detached dwelling is not treated as a separating construction.

Project acoustic quality remains relevant.

**Regulatory Part E claim:** NOT EVALUATED / not attributed to this slice  
**Project acoustic performance:** UNRESOLVED

### Boundary dimension result

**V4 BOUNDARY / BUILDING-PHYSICS RESOLUTION: FAIL FOR RELEASE**

However:

- boundary topology is materially coherent;
- the compiler distinguishes topology from performance;
- S0-B demonstrates primary-boundary independence successfully at semantic level.

## 7. Long-Life House doctrine compile

### DOC-01 — preserve permanent fabric

Baseline service distribution does not use arbitrary masonry chasing.

**S0-A:** PASS  
**S0-B:** PASS

### DOC-02 — deliberate permanent penetration

P01 is:

- named;
- located;
- typed;
- boundary-aware.

**Result:** PASS

The doctrine does not mean zero penetrations.

It means penetrations are deliberate rather than incidental.

### DOC-03 — window replacement hierarchy

Source states:

~~~text
permanent architectural opening
≠
shorter-lived window unit
~~~

**Semantic result:** PASS

However the exact fixing/replacement interface is not designed strongly enough to prove repeated replacement without damage to permanent masonry.

**Replacement-detail result:** UNRESOLVED

This is a useful compiler finding rather than a reason to hide the distinction.

### DOC-04 — maintenance geography

Working/withdrawal volumes are explicit and unobstructed.

**Result:** PASS

### DOC-05 — boundary independence

S0-A has no removable wall system.

**S0-A:** NOT APPLICABLE

In S0-B, primary air/thermal/weather obligations remain behind the removable panel.

**S0-B semantic result:** PASS

Fire/acoustic consequences of the hidden lining cavity remain external.

### DOC-06 — interface legibility

Window, floor/wall, service penetration and wall finish interfaces are separately represented.

**Result:** PASS

### Doctrine dimension result

**S0-A V6: PASS WITH ONE UNRESOLVED REPLACEMENT-DETAIL OBLIGATION**  
**S0-B V6: PASS AT PRINCIPLE LEVEL / CANDIDATE-ASSEMBLY EVIDENCE UNRESOLVED**

## 8. Architectural grammar compile

G-01 does not yet contain promoted executable rules.

The source bay is centred only as a test condition.

Therefore the compiler must not manufacture an architectural pass.

### GRM-01 — centred opening

Recorded as:

**PROJECT SOURCE CONDITION — NOT A G-01 RULE**

### GRM-02 — skirting/cornice datum

The bay includes architectural interface zones, but no mature G-01 datum rule exists.

**Result:** RESEARCH OBSERVATION / NOT EVALUATED

### Grammar dimension result

**V7 ARCHITECTURAL GRAMMAR: NOT EVALUATED**

This is preferable to pretending an unfinished grammar has authority.

## 9. Workmanship/tolerance compile

## 9.1 S0-A

Conventional direct plaster/mineral finish has no formalised S0 workmanship envelope yet.

The project has general workmanship-robustness doctrine, but this exact assembly has not been parameterised.

**Result:** UNRESOLVED for formal V8 conformance

This exposes a real programme gap:

> workmanship robustness has been articulated architecturally but not yet instantiated computationally for the conventional control.

## 9.2 S0-B

Paper-test inputs:

- incoming masonry deviation: +10 mm;
- W2 adjustment range: ±15 mm.

Query:

~~~text
abs(+10) <= 15
~~~

**Result:** PASS — against TEST ASSUMPTION only

Future evidence plan:

- survey masonry before backplane installation;
- record deviations;
- stop and remediate outside envelope;
- inspect adjusted datum before closure.

### Workmanship dimension result

**S0-A:** UNRESOLVED  
**S0-B:** PASS WITHIN PAPER-TEST ENVELOPE; REAL ENVELOPE UNPROVEN

## 10. Regulatory-target compile

The target is deliberately partial.

### Part A / structure

- recognised restraint-hanger route identified;
- structural adequacy unresolved;
- opening support unresolved.

**Result:** PARTIAL / UNRESOLVED

### Part B / fire

- cavity/opening route identified;
- lining and closure products unproved.

**Result:** PARTIAL / UNRESOLVED

### Part C / moisture

- 50 mm residual drained cavity route geometrically present;
- exact exposure and opening detail unresolved.

**Result:** PARTIAL / UNRESOLVED

### Part L / energy

- air-boundary topology strongly aligned with current guidance;
- wall/window U-values unproved;
- whole-dwelling energy outside S0.

**Result:** PARTIAL / UNRESOLVED

### Part P / electrical

Building-fabric interaction is represented.

Circuit design/testing remains external.

**Result:** EXTERNAL

### Regulatory dimension result

**V5 REGULATORY-ROUTE CONFORMANCE: PARTIAL; RELEASE CLAIM PROHIBITED**

Correct output is not “Building Regulations compliant”.

## 11. Evidence graph

The first evidence graph can remain small.

### Due-now source/rule evidence

| Evidence ID | Class | Subject | State | Scope |
|---|---|---|---|---|
| EV-GEO-01 | E2 geometry query | bay/opening/volumes | ACCEPTED | S0-MODEL-01 only |
| EV-TAR-A-01 | rule-source provenance | structural route | ACCEPTED as source | target route, not engineering capacity |
| EV-TAR-B-01 | rule-source provenance | fire/cavity/lining | ACCEPTED as source | target route only |
| EV-TAR-C-01 | rule-source provenance | cavity/window moisture | ACCEPTED as source | target route only |
| EV-TAR-L-01 | rule-source provenance | thermal/air obligations | ACCEPTED as source | target route only |
| EV-DOC-01 | E1 semantic inference | service/permanence | ACCEPTED | LLH doctrine v-current |
| EV-GRM-01 | research record | G-01 | PRESENT | no executable authority |

### Missing due-now evidence

| Evidence plan | Needed for | State |
|---|---|---|
| EP-STR-01 | I-joist/member/hanger capacity | REQUIRED / ABSENT |
| EP-STR-02 | lintel + bearing + residual masonry | REQUIRED / ABSENT |
| EP-THM-01 | wall U-value / junction assessment | REQUIRED / ABSENT |
| EP-WIN-01 | window Uw + interface/product evidence | REQUIRED / ABSENT |
| EP-WEA-01 | exposure-specific head/jamb/sill detail | REQUIRED / ABSENT |
| EP-FIR-01 | cavity closure / lining classifications | REQUIRED / ABSENT |
| EP-WRK-A01 | conventional-control tolerance/workmanship route | REQUIRED / ABSENT |
| EP-W2-01 | W2 panel/backplane fire/acoustic/impact/prototype evidence | B ONLY / ABSENT |

### Future construction evidence

| Evidence ID | Method | Due phase | Hold point |
|---|---|---|---|
| FEV-01 | measure masonry/opening geometry | pre-window/backplane manufacture | before release of fitted components |
| FEV-02 | verify cavity closure/tray/weep/reveal | pre-closure | before concealment |
| FEV-03 | inspect/tape air-boundary window transition | pre-lining | before concealment |
| FEV-04 | inspect/seal P01 penetration | pre-lining/external close-up | before concealment |
| FEV-05 | confirm installed hanger/product identity | floor installation | before floor edge concealed |
| FEV-06 | W2 datum/deviation survey | B only; before panel closure | stop outside envelope |
| FEV-07 | whole-dwelling airtightness test | completion | whole-house evidence |
| FEV-08 | electrical inspection/testing | completion | external competent evidence |

The future evidence is **planned**, not falsely marked present.

## 12. Quantity output

### Baseline S0-A

| Quantity | Result |
|---|---:|
| gross wall-bay area | 9.90 m² |
| window area | 2.16 m² |
| net opaque wall area | 7.74 m² |
| facing-brick volume | 0.793 m³ |
| residual-cavity volume | 0.387 m³ |
| mineral-wool volume | 1.161 m³ |
| dense-inner-masonry volume | 1.664 m³ |
| internal plaster field before reveals | 7.74 m² |
| window occurrences | 1 |
| nominal lintel/head-support envelope | 1.50 m |
| represented floor-hanger/joist occurrences | ~8 |

### S0-B delta

Replace plaster field with approximately:

- 7.74 m² removable panel field;
- 75 mm nominal W2 room-side zone;
- rail/fixing quantities: **UNRESOLVED until module/layout is selected**.

This is exactly the right boundary between geometric take-off and fabricated procurement knowledge.

## 13. Variant comparison

| Issue | S0-A | S0-B |
|---|---|---|
| semantic boundary independence | simple / direct | strong by design |
| routine wall access | poor | potentially high |
| permanent masonry service chasing | prohibited | prohibited |
| additional cavity | none/minimal | yes |
| additional fire/acoustic obligations | low | higher |
| tolerance-adjustment logic | unformalised conventional route | explicit research envelope |
| removable wall surface | no | yes |
| prototype burden | low | high |
| release evidence burden | lower | materially higher |
| doctrine upside | baseline | potentially substantial |
| current supported-domain status | native candidate | candidate / external |

### Current judgement

S0-B remains worth prototyping.

But Run 01 validates the earlier strategic caution:

> **B should have to beat A, because B creates real evidence and cavity debt in exchange for serviceability.**

The compiler makes that debt visible.

## 14. Mutation Run M1 — widen window

Change:

- width 1200 → 1800 mm;
- side piers 900 → 600 mm;
- opening area 2.16 → 3.24 m²;
- net opaque wall 7.74 → 6.66 m².

Updated geometric quantities:

| Quantity | Baseline | M1 |
|---|---:|---:|
| window area | 2.16 | 3.24 m² |
| net wall area | 7.74 | 6.66 m² |
| outer-brick volume | 0.793 | 0.683 m³ |
| insulation volume | 1.161 | 0.999 m³ |
| inner-masonry volume | 1.664 | 1.432 m³ |

### Evidence invalidation

**STALE / RE-EVALUATE**

- lintel/head-support evidence;
- residual-pier/masonry evidence;
- window product/geometry evidence;
- opening head/jamb/sill weather detail;
- thermal-junction evidence;
- window quantity and wall quantities;
- any future G-01 bay/opening relation.

**REMAINS CURRENT unless another dependency changes**

- floor span;
- I-joist member family;
- floor hanger capacity;
- floor/wall restraint evidence;
- P01 service-penetration detail, provided its no-go zone remains clear;
- S0-B backplane adjustment envelope;
- general air-boundary method.

This is a major success.

The dependency graph invalidates **some**, not everything.

## 15. Mutation Run M2 — ad-hoc masonry chase

Attempt:

- 25 mm deep horizontal chase through 215 mm inner leaf.

Approved Document A's simple dimensional guidance for horizontal chases is one-sixth of leaf thickness:

~~~text
215 / 6 = 35.8 mm
25 mm < 35.8 mm
~~~

### Structural-target result

**DIMENSIONAL CHASE LIMIT: PASS**, subject to the other positional/stability conditions in the guidance.

This is intentionally narrow.

### Doctrine result

**FAIL**

Reason:

- routine short-lived service distribution is consuming permanent masonry;
- a supported service route already exists;
- the chase is not an exceptional designed crossing.

### Air-boundary result

If the chase damages/removes the parge air-control layer:

**FAIL / REINSTATEMENT OBLIGATION**

### Overall mutation result

**COMPILE FAIL despite the single chase-depth check passing.**

This is one of the most valuable S0 results.

It proves why authority/source must remain visible:

> legal/technical permissibility in one dimension does not erase a stricter architectural doctrine requirement.

## 16. Mutation Run M3 — obstruct window withdrawal

Place fixed joinery 500 mm into the 1200 mm required paper-test withdrawal depth.

Remaining withdrawal depth:

700 mm.

### Geometry

The room and window remain drawable.

**Ordinary geometric fit:** PASS

### Maintenance

Required withdrawal volume is violated.

**DOC / MAINTENANCE GEOGRAPHY:** FAIL

### Structural/boundary evidence

Unaffected.

**Result:** REMAINS CURRENT

Again, this is the intended behaviour.

A visually plausible model can still be invalid because future replacement has been made impossible under the selected doctrine profile.

## 17. Mutation Run M4 — W2 background out of range

S0-B only.

Change masonry deviation:

+10 → +20 mm.

Paper-test adjustment limit:

±15 mm.

~~~text
abs(+20) > 15
~~~

### Workmanship result

**FAIL**

Required response:

- stop;
- remediate background;
- or explicitly redesign/re-authorise the interface envelope.

Forbidden response:

- silently pack/force/cover the error.

### Unaffected dimensions

Remain current:

- structural topology;
- window geometry;
- external weather wall;
- floor support;
- thermal field geometry.

This clean isolation is exactly what “give variation somewhere to go” looks like computationally.

## 18. Compile summary

### S0-A

~~~text
S0-A / RUN 01

V0 Model integrity                 PASS
V1 Supported-domain status         NATIVE CANDIDATE / INCOMPLETE PROOF ENVELOPE
V2 Geometry / spatial              PASS
V3 Structure                       UNRESOLVED — EXTERNAL PROOF REQUIRED
V4 Boundary / building physics     PARTIAL / UNRESOLVED
V5 Regulatory-route conformance    PARTIAL ONLY
V6 Long-Life House doctrine        PASS WITH WINDOW-INTERFACE OBLIGATION
V7 Architectural grammar           NOT EVALUATED
V8 Workmanship / tolerance         UNRESOLVED FOR CONTROL ASSEMBLY
V9 Evidence completeness           FAIL — DUE-NOW EVIDENCE ABSENT

RELEASE RESULT                     FAIL
RESEARCH COMPILE                   COHERENT
~~~

### S0-B

~~~text
S0-B / RUN 01

V0 Model integrity                 PASS
V1 Supported-domain status         CANDIDATE / EXTERNAL
V2 Geometry / spatial              PASS
V3 Structure                       UNRESOLVED — EXTERNAL PROOF REQUIRED
V4 Boundary / building physics     PARTIAL + EXTRA CAVITY/ASSEMBLY OBLIGATIONS
V5 Regulatory-route conformance    PARTIAL ONLY
V6 Long-Life House doctrine        PASS AT PRINCIPLE LEVEL
V7 Architectural grammar           NOT EVALUATED
V8 Workmanship / tolerance         PASS AGAINST TEST ENVELOPE ONLY
V9 Evidence completeness           FAIL — DUE-NOW + PROTOTYPE EVIDENCE ABSENT

RELEASE RESULT                     FAIL
RESEARCH COMPILE                   COHERENT
~~~

## 19. Acceptance criteria audit

Against the fixture's twelve research criteria:

1. **source model understandable without drawings** — PASS;
2. **geometry traceable to semantic entities** — PASS at paper-diagram level;
3. **mutation crosses multiple graphs** — PASS, M1/M2;
4. **unaffected evidence remains valid** — PASS;
5. **stale evidence visible** — PASS;
6. **unsupported conditions explicit** — PASS;
7. **future evidence planned** — PASS;
8. **doctrine and regulation distinct** — PASS, strongly demonstrated by M2;
9. **grammar remains distinct** — PASS by refusing fake G-01 conformance;
10. **quantities reconcile with geometry** — PASS for test quantities;
11. **competent external reviewer can follow chain** — PROVISIONAL; requires actual external review later;
12. **model simpler than remembering consequences manually** — PROVISIONAL PASS, with an important warning below.

### S0 research verdict

**PASS WITH ARCHITECTURE WARNING**

The compiler abstraction is worth continuing.

It has now survived one manual integrated slice.

## 20. Alarm — obligation explosion

S0 exposes a real risk.

A single wall bay can be decomposed into dozens of tiny obligations:

- lintel;
- pier;
- hanger;
- restraint;
- air transition;
- thermal transition;
- weather transition;
- fire closure;
- lining classification;
- maintenance volume;
- penetration;
- tolerance;
- inspection;
- product evidence.

If a future system exposes all of these to the user as individually authored/checklisted objects, the project will have created:

> **a bureaucracy engine with a CAD viewer.**

That would be a course failure.

### Required response

The formal model should preserve fine-grained obligations internally, but user-facing authoring should mostly operate through **compositional interface families**.

For example:

~~~text
WINDOW_IN_MASONRY_CAVITY_WALL
    expands internally to:
      structural head
      residual support
      weather head/jamb/sill
      thermal transition
      air transition
      cavity closure
      replacement
      tolerance
      inspection
~~~

The expert can inspect the expansion.

The ordinary author should mostly manipulate the meaningful architectural object.

This is analogous to a software type/library abstraction:

> complexity is retained by the system, not repeatedly demanded from the user.

This is now a programme-level requirement.

## 21. Second alarm — avoid manually duplicated truths

Run 01 also makes clear that the same fact appears in several analytical views.

Example:

**opening width = 1200 mm**

affects:

- geometry;
- lintel;
- residual pier;
- window product;
- thermal area;
- weather detail;
- quantity;
- grammar.

Future formalisation must store the authoritative dimension **once** and derive all views from it.

Separate manually maintained “structural model”, “thermal model” and “quantity model” values would recreate coordination failure inside the compiler.

This reinforces the existing source/derived-view architecture.

## 22. Third finding — release failure is useful output

The strongest psychological test of the concept was whether the paper compiler could comfortably return:

**FAIL**

after substantial work.

It can.

The run distinguishes:

- coherent model;
- successful research compilation;
- unresolved building proof;
- unsuccessful release.

That distinction should be protected.

A compiler that feels pressure to return green because the design “looks reasonable” is unsafe.

## 23. What S0 changes in the research programme

### Proven enough to retain

- semantic source + derived analytical views;
- obligation discharge;
- explicit authority/source;
- boundary graphs;
- structural topology separate from adequacy;
- time-phased evidence;
- dependency invalidation;
- UNSUPPORTED / UNRESOLVED as first-class states;
- doctrine as a separately selectable profile.

### Needs strengthening

- interface/assembly obligation bundles;
- conventional-control workmanship semantics;
- native structural proof envelopes;
- product/assembly evidence scope;
- actual wall/window boundary family;
- mapping of source entities to human-readable drawing output.

### Still not justified

- formal programming-language syntax;
- CAD-kernel choice;
- solver architecture;
- claims of full regulatory compliance;
- whole-house automatic structural proof;
- G-01 hard-rule enforcement.

## 24. Immediate next work after Run 01

The correct next step is **not** to make S0 more elaborate indefinitely.

Do these in order:

1. promote the obligation-bundle concept into the formal model;
2. define one actual reusable S0 interface bundle: WINDOW_IN_MASONRY_CAVITY_WALL;
3. select one bounded I-joist/hanger structural family or consciously leave member adequacy external for H1 v0;
4. instantiate the wall/window boundary transition family with evidence requirements;
5. formalise conventional S0-A workmanship/tolerance sufficiently to compare fairly with B;
6. red-team Run 01 for obligations that were missed;
7. only then decide whether S0 needs a second manual run.

In parallel, G-01 D4–D6 can continue.

Do not let either stream block the other unnecessarily.

## 25. Overall interpretation

S0 has not proved that a house can be compiled.

It has proved something smaller and necessary:

> **one real architectural junction can be represented as meaningful source entities, expanded into multi-domain obligations, evaluated against different authorities, supplied with an evidence plan, mutated, and selectively re-evaluated without the conceptual model falling apart.**

That is enough to continue.

It is not enough to implement.

---

## Regulatory evidence used in Run 01

- Approved Document A — structural small-building guidance, including lateral support, restraint-type joist hangers and chase limits: https://www.gov.uk/government/collections/approved-document-a-structure-and-associated-documents
- Approved Document B — fire safety, Volume 1, current target generation: https://www.gov.uk/government/publications/fire-safety-approved-document-b
- Approved Document C — cavity external walls and window/reveal moisture protection: https://www.gov.uk/government/publications/site-preparation-and-resistance-to-contaminates-and-moisture-approved-document-c
- Approved Document L — 2021 edition incorporating 2023 amendments under the frozen S0 transition basis: https://www.gov.uk/government/publications/conservation-of-fuel-and-power-approved-document-l
