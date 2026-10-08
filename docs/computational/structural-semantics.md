# Structural Semantics — Conceptual v0.2

**Status:** conceptual foundation exercised through S0→H1 paper research; H1 adequacy remains externally evidenced and externally unvalidated  
**Purpose:** define the minimum structural representation needed to keep architectural source, support topology and engineering proof distinct  
**Engineering status:** conceptual only; this document does not size members or certify structural adequacy

> **A continuous load path is a semantic requirement. Structural adequacy is a separate proof obligation.**

## 1. Keep three structural things separate

The computational model needs structure from the beginning, but the architectural source model should not become a finite-element model.

It must distinguish:

1. **physical structural fabric** — the actual walls, joists, beams, connections and foundations;
2. **structural topology** — what supports, spans, restrains and transfers to what;
3. **analytical idealisation** — loads, supports, analysis members, combinations, reactions and calculated results.

A masonry wall is one physical assembly. Depending on the proof method it may be represented analytically as a load-bearing region, a line or surface, several members, or no explicit numerical model at all. The system should preserve those relationships rather than pretend the representations are identical.

## 2. Three structural layers

### S-A — Physical structural fabric

Typical entities include masonry wall, joist, beam, post, lintel, structural deck, hanger, restraint strap, foundation and roof member. These remain part of the general physical building model.

### S-B — Structural topology

Relationships such as:

`supports` / `supported-by` / `spans-between` / `bears-on` / `hangs-from` / `restrains` / `braces` / `ties` / `transfers-to` / `stabilises` / `collects` / `reacts-at`

Together they form the **load-path and stability graph**. The graph should be intelligible before detailed calculation begins.

### S-C — Analytical model

A derived representation used to establish capacity or performance. It may contain analysis members, support and connection idealisations, actions, load cases and combinations, design properties, reactions, deflection, vibration, stability and utilisation results.

IFC's structural-analysis domain is useful precedent for this separation: analytical members, supports, actions and results are represented distinctly from the physical building.

## 3. What topology proves, and what it does not

A semantic load-path graph can establish that a floor reaches support, an opening interrupts a support path, a beam reaction lands on a structural entity, a diaphragm has a declared restraint destination or a roof load reaches foundations conceptually.

That catches real errors early.

It does not establish member adequacy. A grossly undersized timber member and a large steel beam can occupy the same position in the graph. Capacity still requires calculation, bounded design data, test or accepted external evidence.

## 4. Load paths have several channels

Do not reduce structure to `structural = true` or one generic downward arrow.

The model should be able to distinguish, where applicable:

- **gravity** — permanent and variable vertical actions;
- **lateral** — wind and other horizontal actions;
- **stability / restraint** — wall restraint, diaphragms, bracing, member restraint and global stability;
- **local concentrated actions** — beam reactions, posts, stair trimmers, heavy equipment;
- **robustness / tying** — where required by the selected structural and regulatory strategy.

One element may participate in several channels.

## 5. Structural role is semantic, not material

Material and thickness do not reliably identify structural function. One masonry wall may bear load while another does not; a timber partition may provide restraint; a deck may act as a diaphragm; a heavy finish may remain non-structural.

Physical entities should therefore declare or derive explicit structural roles. Candidate vocabulary includes:

`PRIMARY-BEARING` / `SECONDARY-BEARING` / `SPANNING` / `TRANSFER` / `LATERAL-RESTRAINT` / `DIAPHRAGM` / `BRACING` / `TIE` / `FOUNDATION` / `NONSTRUCTURAL`

The exact vocabulary remains open.

## 6. A support relationship needs more than two object IDs

~~~text
FLOOR F01 supported-by WALL W01
~~~

may need to carry or reference:

- support region, line or point;
- supported direction;
- bearing, hanging or connection mode;
- required bearing geometry;
- restraint behaviour;
- permitted movement;
- connection family;
- tolerance;
- inspection requirement.

This directly reflects the architectural doctrine: support, restraint and movement are distinct functions unless deliberately combined.

## 7. Bearing, restraint, movement and boundaries

The Reference House I-joist/masonry edge is a useful test because one physical junction contains several different questions.

**Bearing:** how does gravity pass from joist to wall or support?

**Restraint:** how are joist stability, wall restraint, diaphragm action and lateral behaviour resolved?

**Movement:** what dimensional movement can occur harmlessly?

**Boundary:** how are fire, air, acoustic, corrosion and finish conditions maintained around the connection?

The semantic model should not hide these inside a generic `connection` property.

## 8. Openings generate obligations before a lintel is chosen

Creating an opening in a load-bearing region should immediately create structural consequences such as:

- head support;
- end bearing;
- residual pier/wall capacity;
- reaction transfer below;
- effects on floor or roof support lines;
- effects on lateral/stability paths;
- local serviceability;
- foundation consequence where material.

The system need not know the final support family to know these questions now exist.

This is the basic sequence:

**semantic operation → structural obligations → proof**.

## 9. Structural zones and later work

The source model should represent regions that constrain later interventions: no-drill/no-notch zones, permitted manufacturer hole zones, bearings, restraint fixing zones, required masonry piers and foundation load-spread regions.

Services and later alterations can then reason against structure before damage occurs. A planned penetration becomes a typed interface; an arbitrary one creates an obligation or rejection.

## 10. Actions and load data

Avoid attaching one unexplained load number to an element.

The analytical layer should eventually distinguish action source, category, magnitude, spatial distribution, direction, duration/category where relevant, load case, combination, target/standard provenance and assumptions.

Potential sources include self-weight, imposed floor load, roof load, wind, snow, partitions, equipment and point loads.

The important computational property is dependency: if the floor becomes heavier, dependent structural evidence can become stale.

## 11. Self-weight should descend from the building model where credible

A useful integration path is:

~~~text
physical assembly
   ↓
material + geometry
   ↓
quantity + density
   ↓
self-weight
   ↓
structural action
~~~

This avoids a second hand-entered dead-load model drifting away from the specified construction. Where a simplifying load is used instead, preserve it explicitly as an assumption and compare it later.

## 12. Analytical models have identity and versions

A building version may have several analytical models: gravity, lateral, local connection or alternative-option studies.

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

Do not force all structural reasoning into one universal model.

## 13. Idealisation is evidence-bearing judgement

Converting the real building into analysis members involves judgement: effective support width, pinned versus restrained behaviour, diaphragm stiffness, load sharing, support continuity or wall idealisation.

Common supported families may eventually derive these assumptions automatically. Where the system lacks that authority, the idealisation should be an explicit external professional determination with provenance.

This is one of the main boundaries between automation and engineering judgement.

## 14. Native proof envelopes

The computational architecture can support native proof only where a structural family has an explicit **proof envelope** covering, as relevant:

- member or assembly family;
- geometry and span range;
- spacing;
- loading range;
- material;
- support conditions;
- opening/penetration limits;
- environmental conditions;
- calculation or table method;
- serviceability criteria;
- evidence source/version;
- exclusions.

Inside such an envelope, native structural proof may be possible. Outside it, require external evidence, a formal domain extension or an `UNSUPPORTED` result.

No release-grade native structural proof family has been implemented by P0.

## 15. Candidate I-joist floor envelope

Engineered timber I-joists remain the working Reference House floor baseline. A supported envelope would need evidence for the exact family/class, depth, centres, clear span, end support, deck/diaphragm assumptions, restraint, actions, deflection, vibration, fire/acoustic interactions, permitted holes and trimmer/opening conditions.

Do not invent those numerical bounds in the architectural repository. The semantic model can be designed before the product and engineering evidence exists.

## 16. Candidate masonry wall envelope

The dense inner masonry wall likewise requires a supported profile covering material properties, thickness, height/slenderness, eccentricity/loading, opening and pier geometry, support/restraint, concentrated reactions, lintel compatibility and foundation relationship.

The current approximate 215 mm inner leaf is a Reference House coordination assumption, not a native compiler rule.

## 17. Connection families

Connections deserve first-class family identity because much of the structural/architectural negotiation happens there.

Initial candidates include:

- I-joist to masonry restraint hanger;
- joist to local trimmer;
- lintel/head support to masonry;
- roof member to wall plate/support;
- wall restraint/diaphragm connection.

A supported family should define connected element types, structural functions, geometry, fasteners, tolerance, permitted movement, required evidence and inspection obligations.

## 18. Global stability remains a separate closure problem

A model can have correct local gravity support and still lack a coherent stability system.

Whole-house release would need to answer what resists lateral action, what stabilises walls, how floors and roofs distribute those actions, where diaphragms connect, what prevents local instability and how loads reach the ground.

The H1 paper model deliberately leaves substantial structural adequacy external. That is acceptable because the boundary is explicit; it is also why H1-PAPER never became a building-release claim.

## 19. Foundations and ground

The foundation is the structural interface between the designed building and uncertain site conditions.

Keep distinct:

- foundation element;
- structural reaction;
- ground support model;
- ground evidence;
- bearing/settlement assumptions;
- geotechnical determination.

H1 v0 relies on external ground/foundation proof. A native foundation family should be added only if a real project need justifies a bounded ground envelope, geometry/load limits, required inputs and bearing/settlement methods.

## 20. Structural results are not one Boolean

Potential result classes include strength/utilisation, deflection, vibration, stability, bearing, connection, robustness, reaction, movement and fire-structure performance where within scope.

A result should identify subject, method, case/combination, criterion, result, margin and evidence scope.

## 21. Architectural grammar and structure negotiate

The grammar may prefer regular support lines, sensible spans, aligned walls, adequate piers and limited transfers. Those preferences can make structure more tractable without proving it.

For example:

~~~text
upper support line aligns with lower bearing line
~~~

may be a grammar rule while member and connection adequacy remain independent engineering obligations.

## 22. Services reason against structural semantics

Expose no-go zones, engineered penetration families, support/bearing regions and future no-drill information so service routing can react before construction.

~~~text
SERVICE ROUTE R-17
requested crossing of JOIST J-14

result:
  candidate hole lies outside permitted family envelope
  → reroute
  OR external structural evidence
~~~

This is cross-domain type safety: the service author need not understand every joist rule, but the model cannot silently allow an unsupported intervention.

## 23. Change recompiles structural evidence selectively

Changes that may affect structural evidence include opening geometry, span, floor build-up/dead load, use/load category, product substitution, support removal, penetration, roof form and ground evidence.

Dependencies should determine whether each existing calculation remains applicable, becomes stale or becomes invalid. Finish or maintenance changes that do not alter structural geometry/load should not trigger gratuitous re-analysis.

## 24. Relationship to IFC

IFC's structural domain already separates building elements from structural members, supports/connections, actions, groups/cases, results and analysis models. That is useful interoperability precedent.

The internal model may still require additional concepts for proof envelopes, obligation/evidence dependencies, permanence/change, workmanship/tolerance and future modification constraints.

Map to IFC later; do not use IFC classes prematurely as the internal type system.

## 25. S0 minimum structural obligations — historical fixture

The first wall/window/floor paper-compilation slice exercised:

### STR-S0-01 — Floor support path
The joist/floor region has an explicit gravity path into `WALL-W01`.

### STR-S0-02 — Supported connection family
The floor/wall connection is inside a supported envelope, externally evidenced, unresolved or unsupported. No implicit green state.

### STR-S0-03 — Opening head support
`OPENING-O01` creates a head-support obligation.

### STR-S0-04 — Reaction destination
Head and floor reactions land on structural support regions.

### STR-S0-05 — Residual support condition
The opening cannot erase the required wall/pier condition without consequence.

### STR-S0-06 — Restraint / stability declaration
The floor edge states what restraint/stability role its connection performs and what remains a whole-building obligation.

### STR-S0-07 — Structural penetration control
Service penetration `P01` does not violate a declared no-go region or unverified structural condition.

### STR-S0-08 — Evidence state
Every structural obligation is natively resolved, externally evidenced, unresolved or unsupported.

## 26. S0 mutation expectations — historical fixture

### M1 — Widen window

Head-support geometry and evidence become subject to review; reactions and residual piers may change; support below may need re-evaluation.

### M2 — Arbitrary service chase

If it enters a structural region, generate a structural obligation. Do not infer harmlessness.

### M3 — Finish / maintenance mutation

Do **not** invalidate structural evidence unless structural geometry or loading changes. This negative result is important: the dependency system should avoid unnecessary re-analysis.

### M4 — W2 tolerance failure

Ordinarily remain a workmanship/interface issue unless attachment anchorage or loading leaves its structural evidence envelope. This tests domain separation.

## 27. Anti-drift rules

- A line to the ground does not prove structural safety; topology is necessary, capacity is separate.
- The physical CAD wall and analytical wall are related but not identical.
- Structure cannot be deferred entirely until after architecture; structural topology exists from the start even when proof is external.
- Ordinary construction does not require a universal FEA model; bounded tables, product engineering or other methods may be better.
- Structural evidence applies only within its dependencies and scope.
- A supported product family does not make every use of that product supported.
- Architecture and structure negotiate; structural truth remains non-negotiable.

## 28. Current research boundary

The original S0 tasks—selecting a joist/hanger research family, defining opening-head obligations, creating evidence traces and testing mutation invalidation—were subsequently exercised through S0→H1 paper work. The later [Structural Assurance Boundary — H1](structural-assurance-boundary-h1-v01.md) records the frozen H1 proof boundary.

P0 demonstrates generic semantic identity, typed relationships, obligation derivation and evidence invalidation. It does not implement native structural design.

The live next step is competent structural attack on the Reference House and H1 proof boundary. Generic solver or structural-ontology expansion remains frozen unless that work exposes a concrete model defect or a narrowly valuable executable case.

---

## External anchors

- UK Government, **Approved Document A — Structure**: https://www.gov.uk/government/publications/structure-approved-document-a
- buildingSMART, **IfcStructuralAnalysisModel**: https://standards.buildingsmart.org/IFC/RELEASE/IFC4_3/HTML/lexical/IfcStructuralAnalysisModel.htm
- buildingSMART, **Structural analysis example / members, connections, actions and reactions**: https://standards.buildingsmart.org/IFC/RELEASE/IFC4_3/HTML/annex_e/structural-analysis-model/structural-curve-member.html
- Timber Development UK, **Timber I-Joists**: https://timberdevelopment.uk/resources/timber-i-joists/
- existing project baseline: `docs/research/primary-floor-structure-baseline.md`