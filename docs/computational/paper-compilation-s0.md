# Domain S0 — Paper Compilation Fixture v0.1

**Status:** pre-implementation integration-test specification  
**Purpose:** define the exact architectural slice, source assumptions, required semantic entities, obligations, mutations and outputs for the first end-to-end manual compilation.  
**Implementation:** none. The exercise is to be performed on paper / in research documents.

> **If we cannot compile one real junction coherently by hand, software will only automate confusion.**

## 1. What S0 is testing

S0 is not intended to prove that the whole house can already be compiled.

It tests whether the computational architecture actually joins up.

Specifically:

- can architectural intent become semantic entities without collapsing into CAD geometry?
- can one design act create obligations across several domains?
- can those obligations be traced to rules/evidence?
- can a design be valid in one dimension and invalid in another?
- can external proof be represented honestly?
- can future construction evidence be planned rather than fabricated?
- does a change invalidate exactly the evidence it should?
- can useful drawings/quantities be derived from the same source description?
- can a human understand the result?

## 2. Physical slice

Use a **representative principal-room external wall bay at upper-floor level**, closely based on the existing Reference House vertical-bay coordination work.

The fixture includes:

1. one principal occupied room;
2. one external cavity-masonry wall bay;
3. one window opening;
4. one upper floor bearing into the masonry wall;
5. one lower ceiling edge;
6. one conventional internal wall finish baseline;
7. one skirting/cornice interface condition;
8. one local electrical/data service route;
9. one deliberate controlled penetration or service transition;
10. enough adjacent geometry to test maintenance/replacement.

The slice should be large enough to contain real interactions but small enough to understand completely.

## 3. Baseline variant — S0-A

S0-A uses the trusted conservative baseline.

### External wall

Conceptual current build-up:

- facing brick outer leaf;
- drained cavity;
- insulation;
- dense masonry inner leaf;
- explicit air/moisture-control strategy;
- conventional mineral/plaster room-side finish.

Exact dimensions and products remain technical inputs.

### Floor

- engineered timber I-joist;
- ordinary supported masonry restraint/hanger family;
- structural deck;
- conventional acoustic/finish build-up;
- no full-room removable floor platform.

### Window

Use the established Long-Life House principle:

- permanent architectural opening;
- replaceable window unit;
- explicit head/jamb/sill boundary transitions;
- replaceable component does not define the permanent opening.

### Services

One small room-side electrical/data route should approach the bay through a defined service path.

Do not use random masonry chasing.

Where a crossing of permanent fabric/structure is unavoidable, represent it as a designed penetration/interface.

## 4. Comparative variant — S0-B

S0-B changes only the room-side wall architecture sufficiently to test the candidate selective-tectonic model.

Replace S0-A's conventional finish with:

- permanent masonry/boundary remains;
- sparse adjustable backplane;
- shallow local service/absorption zone where justified;
- removable mineral panel;
- functional skirting/cornice interface.

Everything else should remain as close as possible to S0-A.

S0-B is **not native supported-domain proof**.

It is a candidate-domain comparison.

The paper compile should therefore be capable of producing:

~~~text
S0-A
  supported-domain status: NATIVE CANDIDATE

S0-B
  supported-domain status: EXTERNAL / CANDIDATE
  unresolved prototype obligations: ...
~~~

This is an important test of the status model.

## 5. Source inputs

The paper compilation should freeze one source-input package.

### Architectural intent

- room role = principal occupied room;
- external wall role = enduring envelope / permanent fabric;
- window = replaceable shorter-lived component inside permanent opening;
- service route = shorter-lived system prohibited from arbitrary permanent-fabric consumption;
- ordinary Georgian-derived room architecture;
- no visibly technical aesthetic required.

### Geometry

Use one explicit set of nominal dimensions for:

- wall thickness/build-up;
- storey/floor position;
- floor depth;
- opening width/height;
- sill/head positions;
- joist spacing/depth;
- room-side finish depth;
- skirting/cornice zones.

These dimensions should come from the current Reference House coordination baseline where available, but any unverified number must be labelled **ASSUMPTION**, not fact.

### Site/context

The S0 fixture does not need a real plot.

It does need declared contextual assumptions sufficient for the obligations being tested.

Examples:

- exposure context;
- external/internal condition;
- target jurisdiction;
- floor loading category;
- material families.

### Build configuration

Record:

~~~text
compiler target
supported domain = S0
architectural grammar = G-01 research profile / partial
doctrine profile = Long-Life House
source model version = S0-MODEL-01
evidence set = S0-EV-01
~~~

No actual machine syntax is implied.

## 6. Minimum semantic entity set

The first manual source model should include at least:

### Spatial

- ROOM-R01
- EXTERIOR-E01
- MAINTENANCE-VOLUME-M01
- WINDOW-WITHDRAWAL-VOLUME-M02

### Physical

- WALL-W01
- OUTER-LEAF-W01A
- INSULATION-W01B
- INNER-LEAF-W01C
- FINISH-W01D
- OPENING-O01
- WINDOW-WIN01
- FLOOR-F01
- JOIST-J01
- DECK-D01
- CEILING-C01
- SKIRTING-SK01
- CORNICE-CO01

### Structural

- SUPPORT-S01
- BEARING-B01
- HANGER/HARDWARE-H01
- LOADPATH-LP01

### Boundary

- WEATHER-B01
- THERMAL-B02
- AIR-B03
- WATER-B04
- ACOUSTIC-B05
- FIRE-B06 where applicable to the tested condition

### Services

- ELEC-NET-E01
- ROUTE-E01
- PENETRATION-P01
- OUTLET-E01

### Interfaces

- WINDOW-OPENING-I01
- FLOOR-WALL-I02
- FINISH-WALL-I03
- SKIRTING-I04
- CORNICE-I05
- SERVICE-PENETRATION-I06

### Requirements/evidence

- target/rule sources;
- doctrine obligations;
- grammar observations;
- structural obligations;
- boundary obligations;
- construction/tolerance obligations;
- evidence items;
- assumptions.

This is deliberately more explicit than a normal drawing.

The point is to discover which concepts are genuinely useful.

## 7. Source relationships

The manual model should explicitly record relationships such as:

~~~text
ROOM-R01
  bounded-by WALL-W01

WALL-W01
  contains OPENING-O01
  participates-in THERMAL-B02
  participates-in AIR-B03
  supports FLOOR-F01

OPENING-O01
  receives WINDOW-WIN01
  interrupts WALL-W01
  creates structural + boundary obligations

FLOOR-F01
  bears-on WALL-W01 through INTERFACE-I02

WINDOW-WIN01
  replaceable-within OPENING-O01

ROUTE-E01
  serves OUTLET-E01
  may-cross WALL-W01 only through PENETRATION-P01
~~~

The notation is illustrative.

## 8. Obligation families S0 must generate

See [Structural Semantics](structural-semantics.md) and [Boundary Semantics](boundary-semantics.md) for the v0.1 domain models behind the structural and boundary obligation families.

### O-MOD — model integrity

Examples:

- referenced entities exist;
- relationship directions make sense;
- occurrence/family identities resolve.

### O-GEO — geometry

Examples:

- opening physically fits wall;
- floor bearing geometry exists;
- window withdrawal volume is unobstructed;
- maintenance working volume exists;
- service route does not collide with forbidden zones.

### O-STR — structure

At minimum:

- floor action has continuous semantic path to wall/support;
- joist/hanger/bearing family is within declared supported envelope or creates external proof obligation;
- opening has a head-support obligation;
- remaining wall/pier condition is not silently ignored;
- wall/floor restraint relationship is explicit.

The paper exercise does not need to become a full structural design if the proof envelope is not yet established.

It may legitimately output **EXTERNAL STRUCTURAL EVIDENCE REQUIRED**.

### O-BND — boundaries

At minimum:

- weather path;
- thermal continuity;
- air-boundary continuity;
- water drainage at opening;
- service penetration boundary treatment;
- floor/wall edge boundary conditions;
- relevant acoustic/fire conditions.

### O-DOC — Long-Life House doctrine

At minimum:

- no routine short-lived service routing by arbitrary chasing of permanent masonry;
- window replacement should not consume permanent opening;
- maintenance/replacement path exists;
- interface functions are explicit;
- permanent/replaceable hierarchy is coherent.

### O-GRM — architectural grammar

For S0, keep this narrow.

Test only relationships that G-01 research has enough confidence to discuss.

Possible early checks:

- opening participates in declared bay/room ordering;
- room-side interface architecture does not visibly contradict selected room hierarchy;
- skirting/cornice belong to coherent architectural datums.

Unknown grammar should create research feedback, not fake errors.

### O-WRK — workmanship/tolerance

At minimum:

- incoming masonry tolerance declared;
- controlling room-side datum declared;
- adjustment method for window/interface declared;
- remediation threshold exists;
- consequential concealed conditions have verification plan.

For S0-A conventional plaster, the tolerance strategy may differ substantially from S0-B.

That comparison is valuable.

### O-EVD — evidence

Every due-now mandatory obligation must identify:

- resolution method;
- evidence;
- state.

Future construction evidence must have:

- due phase;
- method;
- owner;
- hold point where useful.

## 9. Evidence package

The paper compile should create a small but real evidence graph.

Potential evidence items:

### EV-GEO-01
Nominal geometry query / drawing.

### EV-STR-01
Supported joist/hanger family evidence or external engineer determination placeholder.

### EV-BND-01
Wall-family environmental calculation/evidence placeholder.

### EV-WIN-01
Window family/permanent-opening interface evidence.

### EV-WRK-01
Tolerance/workmanship schedule.

### EV-INS-01
Future pre-closure inspection plan.

### EV-QTY-01
Derived quantities.

### EV-GRM-01
G-01 partial conformance/observation record.

The exercise should not invent certificates.

Where real evidence is absent, record the obligation and absence.

## 10. Outputs S0 must produce

A successful paper compilation should yield all of the following from one source description.

### Human-readable geometry

- one plan fragment;
- one section;
- one elevation/bay view;
- labelled interfaces.

These can initially be diagrams rather than construction drawings.

### Semantic schedule

List of entities, families, permanence classes and relationships.

### Structural trace

A simple load-path diagram and list of unresolved calculations.

### Boundary trace

Diagram/list showing where each relevant boundary runs and how it transitions at the window/floor/service conditions.

### Service trace

Route, penetration, outlet and isolation/maintenance consequences.

### Doctrine report

Long-Life House obligations and status.

### Grammar report

Only partial G-01 observations/rules genuinely available.

### Tolerance/workmanship schedule

Incoming condition → datum → adjustment → remediation → verification.

### Evidence plan

Due-now and future obligations.

### Quantities

At least:

- brick/masonry wall area/volume within slice;
- insulation area/volume;
- opening area;
- window count/type;
- joist length/count represented by slice;
- finish area;
- candidate backplane/panel quantities for S0-B.

These are test quantities, not a contractor BoQ.

### Release manifest

One compact summary containing all configuration/version/status information.

## 11. Deliberate mutations

S0 is not complete until mutations demonstrate invalidation.

### Mutation M1 — widen the window

Change:

- OPENING-O01 width + a declared amount.

Expected consequences:

- geometry updates;
- lintel/head support obligation becomes stale/re-evaluated;
- bearing/pier condition may change;
- window quantity/area changes;
- thermal/water details may need re-evaluation;
- G-01 bay/alignment condition may change;
- unchanged evidence should remain unchanged.

This is the primary **dependency-invalidation test**.

### Mutation M2 — route service through permanent masonry ad hoc

Attempt:

- create an electrical route by arbitrary chase through WALL-W01C.

Expected:

- doctrine conformance FAIL or relationship rejected;
- supported routing alternatives suggested conceptually;
- structural/boundary consequences exposed.

This is the primary **type-safety/doctrine test**.

### Mutation M3 — remove window withdrawal clearance

Place obstruction in M02.

Expected:

- geometry may remain visually plausible;
- maintenance/replacement obligation FAILS.

This tests that maintenance is not merely documentation.

### Mutation M4 — S0-B background outside adjustment range

Change incoming masonry deviation beyond the W2 declared recovery envelope.

Expected:

- adjustment route cannot hide condition;
- workmanship obligation FAILS;
- remediation required.

This is the primary **workmanship robustness test**.

## 12. Expected unsupported conditions

The paper compiler should deliberately say UNSUPPORTED where appropriate.

Likely examples at first pass:

- exact structural capacity if proof envelope not yet formalised;
- exact fire/acoustic performance of candidate W2 system;
- unverified full G-01 rule conformance;
- proprietary product equivalence.

A paper compile that returns no unsupported states at this stage is probably lying.

## 13. Comparison S0-A versus S0-B

The two variants should be compared not only on technical status but on obligation structure.

Questions:

- how many additional entities/interfaces does B introduce?
- how many additional obligations?
- how many additional future inspections?
- what evidence can B reuse across multiple rooms?
- which maintenance events become easier?
- what boundary debt appears?
- what permanent-fabric impacts disappear?
- where does B rely on prototype evidence A does not need?
- does the evidence burden remain proportionate?

This is potentially a powerful way to compare conventional and experimental architecture without reducing the comparison to taste.

## 14. Acceptance criteria for the paper compilation

S0 succeeds as a research exercise if:

1. the source semantic model is understandable without the diagrams;
2. the diagrams can be traced back to semantic entities;
3. one design mutation triggers consequences across multiple graphs;
4. unaffected evidence remains valid;
5. stale evidence becomes visible;
6. unsupported conditions remain explicit;
7. future evidence obligations are planned;
8. doctrine and regulatory/technical validity remain distinguishable;
9. G-01 grammar remains distinguishable from both;
10. derived quantities reconcile with geometry;
11. a competent external reviewer can follow the chain;
12. the model feels simpler than manually remembering all consequences.

S0 fails if the representation becomes more complicated than the building without producing equivalent explanatory value.

## 15. Research outputs after S0

If S0 succeeds, promote/refine:

- entity vocabulary;
- obligation taxonomy;
- evidence model;
- domain capability matrix;
- first structural semantics;
- first boundary semantics;
- paper-build manifest;
- potential formal-language requirements.

If S0 fails, do **not** write software.

Simplify the conceptual architecture first.

## 16. Immediate prerequisites

Before executing S0 fully:

- **structural semantic model: v0.1 established**; select actual S0 proof envelopes/evidence families;
- **boundary semantic model: v0.1 established**; instantiate the actual S0 wall/window/floor boundary graph;
- select one provisional England-new-dwelling compiler target snapshot/coverage for the obligations being exercised;
- freeze a nominal S0 geometry package;
- state all assumptions;
- identify what evidence is real versus placeholder/external.

These are the next research tasks.

---

## Existing project inputs

- docs/reference-house/vertical-bay-coordination.md
- docs/reference-house/vertical-bay-options.md
- docs/research/primary-floor-structure-baseline.md
- docs/research/candidate-pattern-hardening-summary.md
- docs/research/workmanship-robustness.md
- docs/computational/formal-architectural-model.md
- docs/computational/validity-and-obligations.md
- docs/computational/evidence-and-provenance.md
- docs/computational/compiler-targets.md
- docs/computational/supported-domain.md
