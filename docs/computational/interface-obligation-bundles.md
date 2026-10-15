# Interface Obligation Bundles

An ordinary architectural interface can create consequences across several technical systems at once.

A window in a masonry wall may involve geometry, structure, weather, moisture, thermal continuity, air continuity, fire, acoustics, tolerance, replacement and evidence. A floor-to-wall edge may involve gravity support, wall restraint, diaphragm action, movement, acoustics, fire closure and finish geometry.

The useful abstraction is an **interface obligation bundle**:

> **A meaningful architectural relationship contributes facts and constraints to several shared domain graphs, from which canonical obligations are derived.**

The important word is **contributes**. A bundle should not become a second source of truth or a manually maintained checklist that duplicates the building model.

## Why bundles exist

Without a higher-level authoring abstraction, a simple operation can create an expert-only forest of consequences.

```text
PLACE WINDOW IN EXTERNAL WALL
        ↓
geometry / structure / weather / air / thermal / acoustic / fire / maintenance / evidence consequences
```

Those consequences are legitimate. Requiring an author to create each one manually is not.

The author should manipulate the meaningful architectural relationship. The system should derive the applicable obligations from the composed building state.

## The wrong model — concatenate checklists

A naive implementation might let each local interface emit its own final obligations:

```text
WALL bundle      → air continuity check
WINDOW bundle    → air continuity check
FLOOR bundle     → air continuity check
PENETRATION      → air continuity check
```

That creates duplicates and raises an impossible later question: which obligation is the real one?

The correct model is:

```text
AUTHORING RELATIONSHIPS
        ↓
LOCAL CONTRIBUTIONS
        ↓
SHARED DOMAIN GRAPHS
        ↓
CANONICAL OBLIGATION DERIVATION
        ↓
EVIDENCE / STATUS
```

The wall, window, floor edge and penetration all contribute to one air-boundary graph. Continuity is evaluated on the composed graph rather than by de-duplicating independent checklist entries afterwards.

## Bundle contents

A useful bundle can contribute:

- semantic graph fragments;
- local invariants or constraints;
- applicability facts;
- required relationships;
- evidence dependencies;
- known boundary transitions;
- maintenance or replacement consequences.

It should not own authoritative copies of source geometry, product identity or final evidence state.

For example, an opening width belongs to the canonical opening occurrence. Structural, weather, thermal, quantity and grammar reasoning should reference that fact rather than each storing its own copy.

## Example — window in masonry

A window occurrence inside a permanent masonry opening may contribute:

### Spatial / geometric

- opening hosted by the correct wall;
- frame fits the declared opening/tolerance relationship;
- withdrawal geometry remains possible where replacement is claimed.

### Structural

- head support obligation;
- residual jamb/pier/support conditions;
- reactions or support geometry where represented.

### Boundary

- weather transition;
- air transition;
- thermal transition;
- moisture/drainage path;
- acoustic or fire duties where applicable.

### Lifecycle

- permanent opening remains when frame is removed;
- replaceable seals and interfaces are reinstated;
- sound permanent fabric is not consumed unnecessarily.

### Evidence

- product/system evidence applies only within its declared scope;
- changed geometry can stale the relevant evidence without staling unrelated evidence elsewhere.

The bundle is not itself the window detail. It defines what the composed relationship commits the building to resolving.

## Example — floor to masonry wall

A floor edge may contribute:

- gravity-support relationship;
- bearing or hanger condition;
- wall restraint;
- diaphragm transfer;
- movement and tolerance;
- air/thermal boundary transition at the envelope;
- fire/acoustic closure where applicable;
- inspection and repair obligations.

The detail may use conventional hangers, direct bearing or another engineered family. The bundle does not preselect that implementation. It keeps the obligations visible so a chosen family has something explicit to discharge.

## Obligation ownership and contribution scope

The same entity can contribute facts to propositions evaluated at several scopes.

A window may contribute to:

- occurrence-level glazing safety;
- interface-level envelope continuity;
- room-level purge ventilation;
- elevation-level fire reasoning;
- whole-building overheating analysis.

Those are not duplicate window obligations. The **subject of the proposition** owns the obligation; the window contributes facts.

Useful evaluation scopes may include:

`OCCURRENCE` / `INTERFACE` / `ROUTE` / `ROOM` / `ELEVATION` / `SYSTEM` / `BUILDING` / `SITE-TARGET`

These are conceptual scopes rather than a mandatory software enum.

## Contextual roles

A physical entity should not become a god-object with permanent fields for every possible analysis.

Prefer:

```text
STABLE ENTITY
    +
TYPED RELATIONSHIPS / CONTEXT MEMBERSHIPS
    +
SCOPE-SPECIFIC DERIVED OBLIGATIONS
```

A door can simultaneously be part of ordinary circulation, a selected escape route, an acoustic separation and an architectural hierarchy without those roles becoming intrinsic universal properties of “Door”.

## Interface bundle versus implementation family

These are different abstractions.

### Interface obligation bundle

Defines **what the relationship commits the building to resolving**.

### Implementation family

Defines **how a bounded physical solution can discharge those obligations**, with geometry, product/system conditions and evidence.

Keeping them separate prevents a detail family from becoming the only imaginable architectural solution and prevents the abstract bundle from pretending it proves physical performance.

## Evidence and invalidation

Each derived obligation can be supported by evidence appropriate to its authority and scope.

Change should invalidate evidence selectively.

For example, widening a window may stale:

- structural head-support evidence;
- thermal-junction evidence;
- window family/product evidence;
- weather-transition detail evidence.

It should not automatically stale an unrelated service penetration elsewhere on the building merely because both belong to the envelope.

The shared dependency graph provides that selectivity.

## Relation to patterns

A selected pattern may explain why an interface or project requirement exists. It does not become the machine authority for the technical obligations generated by that interface.

The chain remains:

```text
architectural intent / pattern provenance
        ↓
project requirement
        ↓
source entities + relationships
        ↓
shared domain graphs
        ↓
canonical obligations
        ↓
evidence / determination
```

Pattern provenance and technical validity remain deliberately separable.

## Anti-drift rules

- Bundles are not independent checklists.
- Bundles do not duplicate canonical source geometry.
- Several local relationships may contribute to one domain obligation.
- The subject of a proposition owns the obligation; contributors supply facts.
- A bundle does not prove an implementation family.
- Pattern selection does not upgrade technical authority.
- Bundle-level summaries must never hide failed mandatory underlying obligations.

## Current executable boundary

The present compiler already exercises the crucial underlying behaviour without requiring a universal runtime “bundle” object: ordinary source relationships feed shared structural, service and boundary semantics; selected crossings generate obligations; evidence remains scoped; and changes propagate through canonical source identity.

The bundle abstraction remains useful for authoring and explanation. It should become additional software machinery only where doing so simplifies a real interface case without introducing duplicate truth.

See [Formal Architectural Model](formal-architectural-model.md), [Validity and Obligations](validity-and-obligations.md) and [Boundary Semantics](boundary-semantics.md).
