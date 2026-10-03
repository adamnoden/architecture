# Structural Assurance Boundary — H1 v0

**Identifier:** SAB-H1-01  
**Status:** programme decision v0.1  
**Applies to:** S0 Run 02 and candidate H1 v0  
**Purpose:** define what the compiler itself is expected to establish structurally before the project attempts any native member-design engine.

> **The first compiler should know where the loads go before it claims to know exactly how strong every member is.**

## 1. Decision

For H1 v0:

> **Native compilation will establish structural semantics, topology, applicability and evidence dependencies. Final member, connection, stability and foundation adequacy may be discharged by scoped external engineering evidence.**

This is a deliberate product boundary.

It is not a statement that native structural proof is impossible or undesirable later.

## 2. Why this boundary is preferable now

### Complexity

The computational project is already integrating architecture, structure, boundaries, regulation, maintenance, workmanship and evidence.

Making automated structural member design a prerequisite for the first credible whole-house system would multiply the hardest part of the programme before the wider compiler architecture has been proved.

### Safety

Structural calculations depend on actions/load combinations, member properties, support conditions, stability assumptions, connections, material/product data, ground/foundation behaviour and engineering judgement.

An under-scoped native solver creates false confidence more readily than value.

### Product value

The core product proposition does not require removing the structural engineer.

A useful compiler can already:

- make unsupported geometry impossible to ignore;
- maintain an explicit load-path graph;
- extract engineering inputs;
- identify affected structural evidence after change;
- prevent stale calculations from surviving mutations;
- package a coherent model for engineer review.

That is substantial.

## 3. Native structural responsibilities

H1 v0 should establish natively:

### Identity

- structural entities have stable identity;
- occurrences map to source architectural entities.

### Topology

- every load-bearing element has an explicit support destination;
- support chains do not terminate silently inside the model;
- openings create support obligations;
- floor/roof systems identify support lines;
- lateral-restraint/stability roles are explicit.

### Relationship typing

Distinguish:

- SUPPORTS;
- RESTRAINS;
- BEARS_ON;
- CONNECTS;
- SPANS_BETWEEN;
- TRANSFERS_TO;
- STABILISES.

A generic connected edge is insufficient.

### Geometry extraction

Generate engineering-relevant values from canonical source geometry:

- spans;
- opening widths;
- bearing-zone geometry;
- member centres;
- tributary geometry where defined;
- locations of penetrations/conflicts.

### Domain/applicability

Know whether a condition is:

- inside a supported interface/family;
- outside the supported domain;
- awaiting an engineer-defined proof envelope.

### Dependency invalidation

A design change must identify which structural evidence becomes stale.

### Evidence contract

The compiler knows what external structural propositions remain to be proved.

## 4. External structural responsibilities

Unless/until a verified native proof family is deliberately added, external professional evidence discharges:

- design actions/load combinations;
- member sizing/capacity;
- deflection/vibration;
- connection capacity;
- local masonry bearing/capacity;
- global stability calculations;
- diaphragm design where non-trivial;
- foundation/ground adequacy;
- unusual openings/transfers;
- project-specific engineering judgement.

## 5. External evidence cannot be a blanket PDF

The unsafe form is:

> engineer.pdf attached to project → STRUCTURE PASS.

The evidence contract should instead say what proposition the external evidence covers.

Example:

~~~text
ENGINEERING EVIDENCE E-STR-017

subjects:
  F01
  HANGER-FAMILY HF01
  WALL W01

propositions:
  member capacity
  connection capacity
  local support adequacy

depends on:
  F01 span = 4000 mm
  joist centres = 400 mm
  wall family = W-S0-01
  opening O01 width <= declared envelope
  service penetrations as recorded

author:
  competent structural engineer

version/date:
  ...

result:
  PASS — EXTERNAL EVIDENCE
~~~

If a dependency leaves the evidence envelope, the pass becomes stale.

## 6. Structural compile status

A credible H1 result can therefore be:

~~~text
STRUCTURAL TOPOLOGY        PASS
STRUCTURAL DOMAIN          PASS
MEMBER ADEQUACY            PASS — EXTERNAL EVIDENCE
CONNECTION ADEQUACY        PASS — EXTERNAL EVIDENCE
FOUNDATION / GROUND        PASS — EXTERNAL EVIDENCE
EVIDENCE CURRENT           PASS
~~~

This is a successful structural compile.

It is not a claim that the compiler personally performed every calculation.

## 7. What the compiler must refuse

### Orphan load path

**ERROR**

No external engineer attachment should be allowed to hide an unrepresented support relationship.

### Changed geometry outside evidence scope

**STALE / RECOMPILE**

Example:

- engineer evidence covers opening widths ≤ 1500 mm;
- user widens to 1800 mm.

The system must invalidate the affected evidence.

### Unmodelled transfer

**UNRESOLVED**

Do not silently treat geometry as self-supporting because an engineer might solve it later.

### Unknown structural role

**UNRESOLVED / AUTHORING ERROR**

The source must say whether an element is load-bearing if that distinction affects proof.

## 8. Future native proof families

Later versions may internalise bounded engineering families such as:

- manufacturer-backed joist span/spacing envelopes;
- simple lintel tables;
- masonry wall applicability envelopes;
- standard connection families;
- simple roof/truss packages.

Each must have:

- explicit parameter envelope;
- calculation/rule version;
- test suite;
- source/provenance;
- regression cases;
- clear fallback to external evidence outside the envelope.

Native proof should grow incrementally, not be assumed from day one.

## 9. Why this helps the 12-year-old UX

The user can still add a window, widen a room or move a wall.

The system can respond:

> this change makes the existing structural evidence stale; engineer review is required.

That is vastly better than letting the change silently invalidate the structure or forcing the user to become a structural engineer.

The compiler contains the dependency complexity.

It does not transfer professional responsibility to the child/user.

## 10. H1 gate

H1 v0 does not need a general native structural solver before implementation research can begin.

It does need to prove that:

1. structural topology is explicit;
2. engineering inputs are deterministic;
3. external evidence is scoped;
4. change invalidation works;
5. unsupported conditions cannot masquerade as passed.

If those five conditions fail, implementation should remain blocked.

## 11. Course-change trigger

Reconsider this boundary if external structural evidence becomes so coarse that:

- most design changes invalidate the entire building;
- engineers must manually reinterpret an opaque model;
- evidence cannot be scoped to source entities;
- the user receives no useful early structural feedback.

In that case, a larger native proof kernel may be necessary.

For now, the external-adequacy boundary is the lower-risk path.
