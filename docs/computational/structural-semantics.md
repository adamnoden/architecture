# Structural Semantics — Conceptual v0.1

**Status:** Gate-B foundational research draft  
**Purpose:** define the minimum structural representation needed for executable architecture before any structural solver, calculation engine or member-sizing implementation is selected.  
**Engineering status:** conceptual only. This document does not size members or certify structural adequacy.

> **A continuous load path is a semantic requirement. Structural adequacy is a separate proof obligation.**

## 1. The problem

The computational proposition requires structure to exist inside the same semantic building model from the beginning.

That does **not** mean the architectural source model should itself become a finite-element model.

A useful system needs to preserve three different things:

1. **the physical building** — walls, joists, beams, connections, foundations;
2. **the structural meaning** — what supports what, what spans where, what restrains what;
3. **the analytical idealisation** — loads, supports, member models, combinations, reactions and calculated results.

Collapsing these creates confusion.

A masonry wall is a real physical assembly.

Its structural representation may be:

- a load-bearing wall region;
- a line/surface idealisation;
- several analytical members;
- or, for a bounded prescriptive route, no explicit numerical analysis model at all.

The formal model should preserve the relationship rather than pretend the representations are identical.

## 2. Three structural layers

### S-A — physical structural fabric

Actual building entities:

- masonry wall;
- joist;
- beam;
- post;
- lintel;
- structural deck;
- hanger;
- restraint strap;
- foundation;
- roof member.

These belong to the physical semantic model.

### S-B — structural topology

Relationships expressing structural function:

- supports;
- supported-by;
- spans-between;
- bears-on;
- hangs-from;
- restrains;
- braces;
- ties;
- transfers-to;
- stabilises;
- collects;
- reacts-at.

This is the **load-path / stability graph**.

It should be understandable before detailed calculation.

### S-C — analytical model

A derived representation used to establish capacity/performance.

Potential concepts:

- analysis member;
- support condition;
- connection idealisation;
- action/load;
- load case;
- load combination;
- material/design property;
- result;
- utilisation;
- reaction;
- deflection;
- vibration result;
- stability check.

This separation has strong precedent in IFC's structural-analysis domain, which treats structural members, connections/supports, actions and results as an analysis model distinct from the building representation.

## 3. What the load-path graph proves

A semantic load-path graph can establish propositions such as:

- every gravity-supported floor region reaches a support;
- an opening interrupts a support path and therefore creates a head-support obligation;
- a beam reaction lands on a supporting entity rather than empty space;
- a diaphragm has a declared restraint/stability destination;
- a roof load reaches walls/foundations conceptually;
- no structural component is semantically floating.

This is valuable.

It catches a class of errors earlier than conventional post-hoc calculation.

But:

> **connectivity does not prove adequacy.**

A 50 mm timber stick and a 600 mm steel beam can occupy the same graph position.

Only calculation/test/table evidence can establish whether the selected member is adequate.

## 4. Load paths are multi-channel

A building does not have one generic load path.

At minimum the model should distinguish:

### Gravity

Permanent and variable vertical actions.

### Lateral

Wind and other horizontal actions.

### Stability / restraint

- wall restraint;
- floor diaphragm;
- roof diaphragm/bracing;
- member lateral restraint;
- global stability.

### Local concentrated actions

Examples:

- beam reactions;
- posts;
- stair trimmers;
- heavy equipment.

### Robustness / tying

Where required by the selected structural/regulatory strategy.

A member may participate in several channels.

The model should not mark an element simply structural = true and stop there.

## 5. Structural roles are semantic, not material

Do not infer structural role merely from material or thickness.

Examples:

- one masonry wall may be load-bearing;
- another may be non-load-bearing;
- a timber partition may provide restraint;
- a structural deck may act as diaphragm;
- a floor finish may be heavy but non-structural.

Each physical entity should declare or derive its structural roles explicitly.

Candidate roles:

- PRIMARY-BEARING;
- SECONDARY-BEARING;
- SPANNING;
- TRANSFER;
- LATERAL-RESTRAINT;
- DIAPHRAGM;
- BRACING;
- TIE;
- FOUNDATION;
- NONSTRUCTURAL.

The exact vocabulary remains open.

## 6. Support relationships need semantics

The relationship:

~~~text
FLOOR F01 supported-by WALL W01
~~~

is too weak by itself.

A support relationship may need to record:

- support region/line/point;
- supported direction;
- bearing/hanging/connection mode;
- minimum required bearing geometry;
- restraint degrees/behaviour conceptually;
- movement permitted;
- connection family;
- tolerance;
- inspection requirement.

This maps directly onto the Long-Life House doctrine:

> support, restraint and movement are different functions unless deliberately combined.

## 7. Bearing and restraint must remain distinct

The Reference House floor research has already established this as a core principle.

For the I-joist/masonry edge:

### Bearing/support question

How does gravity load transfer from joist to wall/support?

### Restraint question

How are:

- joist stability;
- wall restraint;
- diaphragm action;
- lateral movement;

resolved?

### Movement question

What harmless dimensional movement is permitted?

### Boundary question

How are:

- fire;
- air;
- acoustic;
- corrosion;
- finish;

resolved around the same physical junction?

The compiler model must not hide these inside one generic connection.

## 8. Openings generate structural obligations

Creating an opening in a load-bearing region should produce structural consequences automatically at the semantic level.

Potential obligations:

- head support;
- bearing at each end;
- residual pier/wall capacity;
- reaction transfer below;
- effect on floor/roof support lines;
- effect on lateral/stability path;
- local deflection/serviceability;
- foundation consequence where significant.

The compiler should not need to know the final lintel before recognising that these questions now exist.

This is a strong example of:

> **semantic operation → obligation generation → later proof.**

## 9. Structural zones and no-go regions

The source model should be capable of representing areas where later work is constrained.

Examples:

- no-drill/no-notch region;
- permitted manufacturer hole zone;
- bearing zone;
- restraint fixing zone;
- masonry pier required for support;
- foundation load-spread region.

Services and later alterations can then reason against structure before physical damage occurs.

A planned penetration becomes a typed interface.

An arbitrary penetration becomes a structural obligation or rejection.

## 10. Actions and load data

Do not hard-code one load number into an element.

The analytical layer should eventually distinguish:

- action source;
- category;
- magnitude;
- spatial distribution;
- direction;
- duration/category where relevant;
- load case;
- combination;
- target/standard provenance;
- assumptions.

Potential sources:

- self-weight from quantities/materials;
- imposed floor load from use;
- roof load;
- wind;
- snow;
- partitions;
- equipment;
- point load.

The key computational benefit is dependency.

If a floor build-up becomes heavier, self-weight changes and dependent structural evidence can become stale.

## 11. Self-weight should descend from the same model where practical

One valuable integration target is:

~~~text
physical assembly
   ↓
material / geometry
   ↓
quantity + density
   ↓
self-weight
   ↓
structural action
~~~

This should be pursued where the material model is sufficiently reliable.

Avoid separately typing structural dead loads that drift away from the actual specified construction.

Where a simplifying assumed load is used, preserve it explicitly as an assumption and compare later.

## 12. Analysis-model identity

The structural analytical model should itself be versioned.

~~~text
STRUCTURAL MODEL SM-04
derived from:
  HOUSE-MODEL-V23

idealisation:
  ...
loads:
  LOADSET-07
combinations:
  COMBSET-03
solver/method:
  ...
results:
  RESULTSET-04
~~~

A building version can have several analysis models:

- gravity;
- lateral;
- detailed local connection;
- alternative option.

Do not force one universal structural model.

## 13. Analytical idealisation is evidence-bearing judgement

Turning real architecture into analytical members is not always mechanically obvious.

Examples:

- effective support width;
- pinned versus restrained connection;
- diaphragm stiffness;
- load-sharing assumption;
- support continuity;
- wall idealisation.

Therefore the analytical idealisation itself should have provenance.

A future system may automate common supported families.

Where it cannot, the idealisation becomes an external professional determination.

This is a critical boundary between automation and structural judgement.

## 14. Native proof envelopes

The first compiler should not solve arbitrary structures.

Instead, each supported structural family should define a **proof envelope**.

A proof envelope states:

- member/assembly family;
- geometry range;
- span range;
- spacing;
- loading range;
- material;
- support conditions;
- opening/penetration limits;
- environmental conditions;
- calculation/table method;
- serviceability criteria;
- evidence source/version;
- exclusions.

Inside the envelope, the compiler may produce native structural proof.

Outside:

- external structural evidence;
- domain extension;
- or unsupported.

## 15. I-joist floor family — candidate first envelope

The project has selected engineered timber I-joists as the working Reference House baseline.

The eventual S0/H1 proof envelope should define:

- exact supported I-joist family or family class;
- depth range;
- centres;
- clear span;
- end bearing/hanger condition;
- deck/diaphragm assumptions;
- restraint;
- load assumptions;
- deflection;
- vibration;
- fire/acoustic build-up interactions;
- permitted holes/penetrations according to product/engineering guidance;
- trimmer/opening conditions.

Do **not** invent these bounds in the architectural repo.

They require product/structural engineering evidence.

The semantic model can be designed before the values exist.

## 16. Masonry wall family — candidate first envelope

Similarly, the dense inner masonry wall needs a supported structural profile.

Eventually define:

- material/block family and properties;
- thickness;
- height/slenderness conditions;
- eccentricity/load conditions;
- opening/pier geometry;
- support/restraint;
- concentrated reaction limits;
- lintel/support compatibility;
- foundation relationship.

The current approximately 215 mm inner leaf is a Reference House coordination assumption, not yet a native compiler rule.

## 17. Connection families

Connections deserve first-class family identity.

Candidate initial families:

- I-joist to masonry restraint hanger;
- joist to local trimmer;
- lintel/head support to masonry;
- roof member to wall plate/support;
- wall restraint/diaphragm connection.

A supported connection family should define:

- which elements it connects;
- structural functions;
- permitted geometry;
- fasteners;
- tolerance;
- movement;
- required product/engineering evidence;
- inspection obligations.

This is exactly where a building compiler can outperform generic CAD.

## 18. Stability is not an afterthought

A model can have perfect local gravity support and still lack a coherent stability system.

Therefore a release-grade whole-house structural model must eventually answer:

- what resists lateral actions?
- what stabilises each wall?
- how do floors/roofs distribute lateral actions?
- where do diaphragms connect?
- what prevents local member instability?
- how does load reach the ground?

The first S0 slice may represent only a partial stability obligation and explicitly defer whole-building closure.

That is acceptable.

Pretending the slice proves global stability is not.

## 19. Foundations and ground

The foundation is the terminal structural interface between designed building and uncertain site.

The model should distinguish:

- foundation element;
- structural reaction;
- soil/ground support model;
- ground evidence;
- settlement/bearing assumptions;
- geotechnical determination.

Early S0/H1 work may use external ground/foundation proof.

A native foundation family should only be added when:

- ground class/envelope is defined;
- geometry/load limits are explicit;
- geotechnical inputs are known;
- settlement/bearing checks are supported.

## 20. Structural result taxonomy

A future structural determination may include more than capacity.

Candidate result classes:

- strength/utilisation;
- deflection;
- vibration;
- stability;
- bearing;
- connection;
- robustness;
- reaction;
- movement;
- fire-structure performance where within structural scope.

Each result should identify:

- subject;
- method;
- combination/case;
- limit/criterion;
- result;
- margin;
- evidence scope.

Avoid a single structural-pass Boolean.

## 21. Interaction with architectural grammar

The grammar should generate **structurally sympathetic** arrangements.

Examples:

- regular support lines;
- sensible spans;
- aligned walls;
- adequate piers around openings;
- limited transfers.

But the grammar does not prove structure.

A rule may prefer:

~~~text
upper support line aligns with lower bearing line
~~~

while structure still independently establishes capacity.

This preserves architectural agency without making engineering decorative.

## 22. Interaction with service routing

Structural semantics should expose:

- forbidden penetration regions;
- permitted engineered penetration families;
- support/bearing zones;
- future no-drill information.

Service compilation can therefore reason against structure.

Potential outcome:

~~~text
SERVICE ROUTE R-17
requested crossing of JOIST J-14

result:
  candidate hole lies outside permitted family envelope
  → reroute
  OR external structural evidence
~~~

This is a direct example of cross-domain type safety.

## 23. Interaction with change compilation

Structural evidence is especially sensitive to later changes.

Changes that should trigger impact analysis include:

- opening width/position;
- member/span;
- floor build-up/dead load;
- room use/load category;
- product substitution;
- support removal;
- service penetration;
- roof form;
- foundation/site evidence.

The dependency graph should determine whether old calculations become:

- still applicable;
- stale;
- invalid.

## 24. Relationship to IFC

IFC already contains a useful separation between building elements and structural-analysis representations.

Its structural domain includes:

- structural members;
- connections/supports;
- actions;
- load groups/cases;
- result groups;
- analysis models.

That is a strong interoperability precedent.

The Long-Life House internal model may still need additional concepts for:

- supported-domain proof envelopes;
- obligation/evidence dependencies;
- permanence/change;
- workmanship/tolerance;
- future modification constraints.

Map later.

Do not prematurely use IFC classes as the internal type system.

## 25. S0 structural obligations — minimum viable set

For the first wall/window/floor paper compilation:

### STR-S0-01 — floor support path

The joist/floor region must have an explicit gravity path into WALL-W01.

### STR-S0-02 — supported connection family

The floor/wall connection must be:

- inside a supported connection envelope;
- or externally evidenced;
- or unresolved/unsupported.

### STR-S0-03 — opening head support

OPENING-O01 creates a head-support obligation.

### STR-S0-04 — reaction destination

Head/floor reactions must land on a structural support region.

### STR-S0-05 — residual support condition

The opening must not erase the supporting wall/pier condition without consequence.

### STR-S0-06 — restraint/stability declaration

The floor edge must state what restraint/stability role the connection performs and what remains a whole-building obligation.

### STR-S0-07 — structural penetration control

Service penetration P01 must not violate a declared no-go region or unverified structural condition.

### STR-S0-08 — evidence state

Every structural obligation must be:

- natively resolved;
- externally evidenced;
- unresolved;
- or unsupported.

No implicit green state.

## 26. S0 mutation expectations

### M1 — widen window

Expected structural propagation:

- head-support geometry changes;
- lintel/beam evidence stale;
- reaction magnitude/location may change;
- residual pier geometry changes;
- support below may need re-evaluation.

### M2 — arbitrary service chase

If the chase affects a structural region:

- generate structural obligation;
- do not infer harmlessness.

### M3 — finish/maintenance mutation

Should **not** invalidate structural evidence unless it changes structural geometry/load.

This negative result matters.

The dependency system must avoid unnecessary re-analysis.

### M4 — W2 tolerance failure

Should ordinarily remain a workmanship/interface issue unless the backplane anchorage/load condition crosses its structural evidence envelope.

This tests domain separation.

## 27. Anti-drift rules

- **“There is a line to the ground, therefore it is safe.”**  
  No. Load-path continuity is necessary, not capacity proof.

- **“The CAD wall is the structural analysis wall.”**  
  No. Physical entity and analytical idealisation are related but distinct.

- **“The engineer can sort the structure later.”**  
  No. Structural topology participates from the beginning even where final calculation is external.

- **“Every structure needs a general FEA model.”**  
  No. Bounded tables/rules/product engineering may be the better proof method for ordinary construction.

- **“One structural pass covers every future change.”**  
  No. Evidence has dependencies and scope.

- **“A supported product family means every use of the product is supported.”**  
  No. Proof envelope governs applicability.

- **“Structure should dictate architecture.”**  
  No. Grammar and structure negotiate; structural truth remains non-negotiable.

## 28. Immediate research tasks

1. select the exact I-joist/hanger family or neutral engineered family for S0 research;
2. obtain its declared design/installation envelope;
3. define one opening-head/lintel family;
4. define semantic action/load categories for S0;
5. define minimum stability declaration for the slice;
6. identify foundation/ground obligations that remain external;
7. create one structural obligation/evidence trace manually;
8. execute S0 Mutation M1 and observe evidence invalidation.

Only after this should a structural engine strategy be discussed.

---

## External anchors

- UK Government, **Approved Document A — Structure**: https://www.gov.uk/government/publications/structure-approved-document-a
- buildingSMART, **IfcStructuralAnalysisModel**: https://standards.buildingsmart.org/IFC/RELEASE/IFC4_3/HTML/lexical/IfcStructuralAnalysisModel.htm
- buildingSMART, **Structural analysis example / members, connections, actions and reactions**: https://standards.buildingsmart.org/IFC/RELEASE/IFC4_3/HTML/annex_e/structural-analysis-model/structural-curve-member.html
- Timber Development UK, **Timber I-Joists**: https://timberdevelopment.uk/resources/timber-i-joists/
- existing project baseline: docs/research/primary-floor-structure-baseline.md
