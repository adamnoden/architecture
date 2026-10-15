# Structural Semantics

> **A continuous represented load path is a semantic requirement. Structural adequacy is a separate proof obligation.**

The computational model needs structural meaning from the beginning without pretending that the architectural source model is itself a finite-element model or structural design calculation.

Three things should therefore remain distinct:

1. **physical structural fabric** — actual walls, joists, beams, posts, connections and foundations;
2. **structural topology** — what supports, spans, restrains and transfers to what;
3. **analytical idealisation and proof** — actions, supports, analysis members, combinations, calculated results and professional engineering judgement.

A masonry wall is one physical assembly. Depending on the proof method it may be idealised analytically as a line, region, surface, several members or no explicit numerical model at all. The semantic system should preserve the relationship between those representations rather than pretending they are identical.

## Physical structural fabric

Typical entities include:

- masonry wall;
- joist;
- beam;
- post;
- lintel;
- structural deck;
- hanger;
- restraint strap;
- foundation;
- roof member;
- other physical connection/support components.

These belong to the general physical building model.

## Structural topology

Relationships such as:

`supports` / `supported-by` / `spans-between` / `bears-on` / `hangs-from` / `restrains` / `braces` / `ties` / `transfers-to` / `stabilises` / `reacts-at`

form a **load-path and stability graph**.

That graph should be intelligible before detailed calculation begins.

The current compiler already uses a bounded form of this idea to check support continuity, span/support coherence, reaction geometry, interruptions and diaphragm ownership in the Reference House.

## Analytical model

A derived analytical representation may contain:

- analysis members;
- support/connection idealisations;
- actions and load cases;
- load combinations;
- design properties;
- reactions;
- deflection;
- vibration;
- stability;
- utilisation or other result measures.

The same physical building can legitimately produce more than one analytical model. A global stability model, local connection calculation and gravity-frame model need not be forced into one universal representation.

## What topology can establish

Semantic topology can establish relationships such as:

- a floor reaches a declared support;
- a support path continues to a foundation destination;
- an opening interrupts a support line and therefore creates a consequence;
- a beam reaction lands on a represented structural entity;
- a diaphragm has an owner and restraint destination;
- a structural interruption has declared local framing.

These checks can catch real mistakes early.

They do **not** establish member or connection capacity. A grossly undersized timber member and an adequate steel beam can occupy the same topological position.

## Structural channels

Do not reduce structure to `structural = true` or one generic downward arrow.

Where relevant, the model should distinguish:

- **gravity** — permanent and variable vertical actions;
- **lateral** — wind and other horizontal actions;
- **stability / restraint** — diaphragms, wall restraint, bracing and member stability;
- **local concentrated actions** — posts, beam reactions, heavy equipment, stair trimmers;
- **robustness / tying** — where required by the selected structural/regulatory strategy.

One physical element may participate in several channels.

## Structural role is semantic, not material

Material and thickness do not reliably identify structural function.

One masonry wall may bear load while another does not. A deck may act as a diaphragm. A timber partition might provide restraint in one design and none in another. A heavy finish can remain entirely non-structural.

Explicit structural roles may therefore include concepts such as:

`PRIMARY-BEARING` / `SECONDARY-BEARING` / `SPANNING` / `TRANSFER` / `LATERAL-RESTRAINT` / `DIAPHRAGM` / `BRACING` / `TIE` / `FOUNDATION` / `NONSTRUCTURAL`

The exact software vocabulary should remain no larger than useful cases require.

## A support relationship is richer than two IDs

A statement such as:

```text
FLOOR F01 supported-by WALL W01
```

may need associated facts concerning:

- support region, line or point;
- support direction;
- bearing, hanging or other connection mode;
- required bearing geometry;
- restraint behaviour;
- permitted movement;
- connection family;
- tolerance;
- inspection requirement.

This mirrors the architectural principle that bearing, restraint and movement are separate functions unless deliberately combined.

## Bearing, restraint, movement and boundaries

The Reference House floor-to-masonry edge shows why this distinction matters.

### Bearing

How does gravity pass from the floor member to the wall or support?

### Restraint

How are member stability, wall restraint, diaphragm action and lateral behaviour resolved?

### Movement

What relative movement is expected, and where can it occur harmlessly?

### Boundary

How are fire, acoustic, air, corrosion and finish conditions maintained around the structural relationship?

A generic `connection` property should not erase these separate obligations.

## Openings create obligations before a lintel is selected

An opening in a load-bearing region can immediately create questions about:

- head support;
- end bearing;
- residual pier/wall condition;
- reaction transfer below;
- floor or roof support lines;
- stability paths;
- local serviceability;
- foundation consequence where material.

The system need not know the final lintel or support family to know that these questions exist.

The sequence is:

> **semantic operation → structural obligations → proof**

## Protected structural zones

The source model can expose regions that constrain later work:

- no-drill / no-notch zones;
- manufacturer-permitted hole zones;
- bearings;
- restraint-fixing zones;
- required masonry piers;
- foundation load-spread regions;
- local structural interruptions.

Service routing can then reason against structure before site work occurs. A planned crossing becomes a typed interface; an arbitrary crossing becomes an explicit obligation or failure.

## Actions and load data

Avoid attaching one unexplained load number to an element.

A structural proof may need to distinguish:

- action source;
- category;
- magnitude;
- spatial distribution;
- direction;
- duration/category where relevant;
- load case and combination;
- target/standard provenance;
- assumptions.

Potential sources include self-weight, imposed floor load, roof load, wind, snow, partitions, equipment and point actions.

## Self-weight from the source where credible

Where material and geometry are sufficiently controlled, a useful chain is:

```text
physical assembly
   ↓
material + geometry
   ↓
quantity + density
   ↓
self-weight
   ↓
structural action
```

That avoids a second hand-entered dead-load model drifting from the actual construction. Where a simplifying load is used instead, it should remain an explicit assumption.

## Analytical idealisation is evidence-bearing judgement

Converting the physical building into analysis members involves engineering judgement: support width, pin/restraint assumptions, diaphragm stiffness, load sharing, support continuity and wall idealisation among others.

Common bounded families may allow some idealisations to be derived consistently. Where the system lacks that authority, the idealisation should remain an explicit external professional determination with provenance.

This is one of the principal boundaries between computation and engineering judgement.

## Proof envelopes

Native structural proof is credible only where an explicit envelope exists for the method or family being used.

That envelope may need to constrain:

- member/assembly family;
- geometry and span range;
- spacing;
- loading range;
- material;
- support conditions;
- openings and penetration limits;
- environment;
- calculation/table method;
- serviceability criteria;
- evidence source/version;
- exclusions.

Inside such an envelope, machine-supported proof may be legitimate. Outside it, require another supported solution or scoped external engineering evidence.

The present compiler does **not** contain a release-grade native structural-capacity library.

## Connection families

Connections deserve identity because much of the architecture/structure negotiation occurs there.

A supported connection family could define:

- connected element types;
- structural functions;
- geometry;
- fasteners;
- tolerance;
- permitted movement;
- required evidence;
- inspection obligations.

Likely domestic examples include floor-to-masonry support, local trimmers, lintel/head support, roof-to-wall support and wall/diaphragm restraint.

## Global stability is a separate closure problem

A building can have a coherent local gravity path while lacking a coherent stability system.

A higher-authority structural result would also need to answer:

- what resists lateral actions;
- what stabilises walls and members;
- how floors/roofs distribute those actions;
- where diaphragms connect;
- what prevents local instability;
- how actions reach foundations and ground.

The current executable structural layer intentionally stops before claiming this whole-building adequacy.

## Foundations and ground

Keep separate:

- foundation element;
- structural reaction;
- ground support model;
- ground evidence;
- bearing/settlement assumptions;
- geotechnical determination.

Ground evidence belongs to the real site and can invalidate a previously assumed structural basis. The compiler should not guess it merely because the foundation geometry is representable.

## Structural results are not one Boolean

Potential result classes include:

- strength/utilisation;
- deflection;
- vibration;
- stability;
- bearing;
- connection;
- robustness;
- reaction;
- movement;
- structural fire performance where within scope.

Each result should identify subject, method, case/combination, criterion and evidence scope.

## Architectural grammar and structure negotiate

A grammar may prefer aligned walls, regular support lines, sensible spans, adequate piers and limited transfers. Those constraints can make structural resolution more tractable without proving it.

For example:

```text
upper support line aligns with lower support line
```

may be an architectural-grammar condition while member and connection adequacy remain independent engineering obligations.

## Services reason against structure

A service author should not need to memorise every structural rule, but the shared model should prevent an unsupported intervention from disappearing between disciplines.

```text
SERVICE ROUTE R17
crosses STRUCTURAL MEMBER J14

result:
  no supported crossing / hole condition
  → reroute
  OR external structural determination
```

This is cross-domain type safety applied to building relationships.

## Change invalidates evidence selectively

Structural evidence may depend on:

- opening geometry;
- span;
- floor build-up / dead load;
- use/load category;
- product family;
- support condition;
- penetration;
- roof form;
- ground evidence.

A change to one dependency can stale the affected structural evidence without forcing unrelated analyses to rerun.

## Relationship to IFC

IFC’s structural domain provides useful precedent for separating physical building elements from analytical members, supports/connections, actions, groups/cases, results and analysis models.

House Kernel may still need additional concepts for:

- proof envelopes;
- obligation/evidence dependencies;
- lifecycle/permanence relationships;
- workmanship/tolerance;
- future modification constraints.

Interoperability should map these concepts deliberately rather than allowing exchange classes to dictate the internal ontology.

## Anti-drift rules

- A line to the ground does not prove structural safety.
- Physical and analytical structural objects are related but not identical.
- Structure should not be postponed until after architecture; topology begins with architectural decisions even when proof is external.
- Not every ordinary house needs a universal FEA model.
- Structural evidence applies only within its declared dependencies and scope.
- A supported product family does not make every use of that product supported.
- A service crossing does not become harmless because it fits geometrically.
- Structural truth remains non-negotiable even when the architectural grammar prefers another arrangement.

## Current executable boundary

The current compiler can check bounded qualitative structural topology in the Reference House: support continuity, span/support coherence, reaction geometry, interruptions, diaphragm ownership and represented gravity handoff.

It deliberately does **not** claim member sizing, connection adequacy, global stability, foundations or structural fire performance.

Those remain external engineering obligations until a controlled method family is explicitly admitted.

## Reference points

- UK Government, Approved Document A — Structure.
- buildingSMART, IFC structural-analysis model and structural-member/support/action concepts.
- Timber Development UK, timber I-joist guidance, as representative construction-system evidence rather than a selected proprietary design.
- [Floor-to-Masonry Structural Interface](../research/seated-floor-structure-options.md) for the Reference House connection comparison.
