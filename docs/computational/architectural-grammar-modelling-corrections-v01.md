# Architectural Grammar — Modelling Corrections v0.1

**Status:** promoted modelling corrections; architectural-rule neutral  
**Origin:** G-01 D5/D6 precedent and mutation research  
**Purpose:** preserve general representational lessons discovered by the first grammar without accidentally promoting Georgian architectural preferences into the grammar framework.

> **A case-specific architectural result may expose a general modelling deficiency without becoming a general design rule.**

## 1. Authority boundary

These corrections say what the grammar machinery must be capable of representing.

They do **not** say what a valid Georgian, Victorian, modern or other house must look like.

That distinction is essential.

For example:

- Danson shows that adding a door can alter sequence without removing any existing route;
- the general modelling consequence is that `connectivity` and `sequence` are distinct;
- the Georgian rule consequence remains undecided.

## 2. MC-01 — connectivity, route role and sequence are distinct

**Status:** PROMOTED M0  
**Evidence:** Danson D6 Mutation Run 01.

The model must be able to distinguish:

- direct connectivity;
- route class/role;
- architectural sequence;
- route depth;
- alternative paths.

A new connection can make a graph shallower while weakening or bypassing a declared sequence.

Therefore:

```text
CONNECTED(A, B)
```

is not a sufficient representation of circulation order.

This is style-neutral.

## 3. MC-02 — coupling authority belongs to an attribute

**Status:** PROMOTED M0  
**Evidence:** Danson blind-window fabric evidence.

One architectural object can have different coupling authorities for different attributes.

Example:

```text
opening.existence    = ELEVATION_LEADS
opening.centreline   = PLAN_LEADS
opening.width        = MUTUAL / UNKNOWN
```

Therefore do not attach one generic `PLAN_LEADS` or `ELEVATION_LEADS` state to an entire opening, room or façade element.

Candidate attributes include:

- existence;
- centreline;
- width;
- height;
- sill/head datum;
- projection;
- room position;
- wall line;
- structural support line.

This is style-neutral.

## 4. MC-03 — coupling has architectural scope / owner

**Status:** PROMOTED M0  
**Evidence:** Bedford Square aggregate composition; supported by Dean Street and villa contrasts.

An architectural relation may operate at a scale larger or smaller than the individual dwelling.

The model must therefore record the scope that owns a relation.

Candidate descriptive scopes:

```text
COMPONENT
ROOM
DWELLING
ROW_BLOCK
SITE_URBAN
```

Example: the centre of a Bedford Square terrace composition can fall at the division between two houses. The row has a compositional centre that neither dwelling individually owns.

A rule such as `entrance must align to facade centre` is meaningless until the façade and centre **scope** are identified.

This is style-neutral.

## 5. MC-04 — dimensional evidence has scale / scope

**Status:** PROMOTED M0  
**Evidence:** D5 cross-case work on Marble Hill, Danson and Bedford Square.

A numeric relation must state the architectural scale at which it operates.

Candidate metric scopes include:

```text
URBAN_FIELD
ROW_BLOCK
PLOT_DWELLING
ROOM_VOLUME
OPENING_FACADE
ELEMENT_CONSTRUCTION
```

A 24 ft cubic room, a 40 in opening module, a roughly 25 ft urban plot module and a 320 mm structural beam are not competing values in one proportion system.

Without scope, dimensional analysis invites false universalisation.

This is style-neutral.

## 6. MC-05 — design intent and executed fabric are separate evidence classes

**Status:** PROMOTED M0 research/evidence correction  
**Evidence:** Marble Hill design/publication material versus later measured geometry; Danson published-plan/fabric discrepancies.

A historical plate, pattern-book design or architect’s published drawing may reveal:

- intended order;
- explicit design rule;
- theoretical relationship.

It does not automatically prove that the built house executed that relationship exactly.

The research model must distinguish at least:

```text
DESIGN / PUBLICATION INTENT
EXECUTED / MEASURED FABRIC
LATER ALTERATION / SURVEY STATE
RESTORATION / INTERPRETIVE STATE
```

This matters beyond historical grammars. A contemporary design model and an as-built survey are likewise different evidence states.

## 7. MC-06 — shared architectural variables may generate technical obligations

**Status:** PROMOTED M0  
**Evidence:** Danson Library window-jamb / floor-frame relation.

A coordinate or relationship can participate simultaneously in architectural and technical systems without merging their proof authorities.

Conceptually:

```text
WINDOW / JAMB AXIS
    ├── architectural opening relation
    ├── room composition relation
    └── structural support obligation
```

The grammar may establish or constrain the architectural variable.

Structural adequacy still requires structural evidence.

Therefore:

> **shared semantics do not imply shared proof.**

This is particularly important for the HSA compiler architecture.

## 8. MC-07 — sectional order must be first-class

**Status:** PROMOTED M0  
**Evidence:** Marble Hill Great Room and Danson principal-floor datum.

Plan and elevation are insufficient descriptions of architectural order.

Section can:

- remove floor area above a double-height room;
- establish a common principal-storey datum across different room plans;
- define stair hierarchy;
- change opening hierarchy;
- mediate roof/base relationships.

The grammar framework must therefore allow section to carry independent and coordinating authority rather than treating height as a late numeric property of a plan.

This does **not** say any specific language requires double-height rooms or a piano nobile.

## 9. Minimal coupling record after D6 v0.3

A research coupling record should now be capable of carrying:

```text
case
phase
scope_owner
subject
attribute
plan_entity
section_entity
elevation_entity
technical_entity          # where relevant
coupling_direction
authority_class
strength / confidence
evidence_source
conflict
resolution
architectural_consequence
```

No software schema is proposed yet.

## 10. Minimal metric record after D5 v0.3

A dimensional observation should be capable of carrying:

```text
case
phase
scale_scope
entity
role
geometry_family
raw_value
unit
measurement_method
source
source_access_state
uncertainty
derivation
named_family_comparison   # optional and downstream
```

The raw observation must survive any later classification into a ratio/proportion family.

## 11. What remains grammar-specific

These modelling corrections must not swallow the actual architectural research.

Still grammar-specific and unresolved are questions such as:

- whether G-01 requires explicit principal-room hierarchy;
- which route sequences are invariant, preferred or optional;
- when symmetry is expected;
- what opening hierarchy G-01 prefers;
- which dimensional/proportion families survive hold-out testing;
- which section/elevation relationships define membership in G-01.

Those remain in the G-01 candidate-rule programme.

## 12. Falsification test for this document

A later materially different grammar — for example a Victorian-derived G-02 — should be able to use these modelling capabilities without inheriting Georgian rules.

If it cannot, either:

1. the framework remains accidentally Georgian; or
2. the supposed modelling correction is actually a G-01 rule and should move back downstream.

That future second-grammar test is one reason not to overbuild the framework now.
