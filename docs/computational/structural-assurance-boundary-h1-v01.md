# Structural Assurance Boundary — H1 v0

**Identifier:** SAB-H1-01  
**Status:** frozen H1 paper-domain assurance boundary; external structural review remains open  
**Applies to:** S0/H1 paper research and any later H1-family reasoning that explicitly adopts this boundary  
**Purpose:** define what the computational system may establish structurally before any native member-design engine is justified.

> **The system should know where the loads go before it claims to know exactly how strong every member is.**

## 1. Decision

For H1:

> **Native computation may establish structural semantics, topology, applicability and evidence dependencies. Final member, connection, stability and foundation adequacy may be discharged by scoped external engineering evidence.**

This is a proof boundary, not a claim that native structural calculation is impossible or desirable by default.

P0 has since demonstrated the lower-level semantic/evidence mechanisms in software. It does not implement H1 structural adequacy.

## 2. Why this boundary is preferable

### Complexity

The computational project already coordinates architecture, structure, boundaries, maintenance, workmanship and evidence.

Making automated structural member design a prerequisite for the first useful semantic system would multiply one of the hardest technical problems before the architectural value of doing so is established.

### Safety

Structural calculations depend on actions/load combinations, member properties, support conditions, stability assumptions, connections, material/product data, ground/foundation behaviour and engineering judgement.

An under-scoped native solver creates false confidence more readily than value.

### Product value

The core proposition does not require removing the structural engineer.

A useful computational model can already aim to:

- make unsupported geometry impossible to ignore;
- maintain an explicit load-path graph;
- extract engineering inputs;
- identify affected structural evidence after change;
- prevent stale calculations from surviving mutations;
- package a coherent model for engineer review.

## 3. Native structural responsibilities

H1 semantics should establish:

### Identity

- structural entities have stable identity;
- occurrences map to source architectural entities.

### Topology

- load-bearing elements have explicit support destinations;
- support chains do not terminate silently inside the model;
- openings create support obligations;
- floor/roof systems identify support lines;
- lateral-restraint/stability roles are explicit where required.

### Relationship typing

Distinguish relationships such as:

- `SUPPORTS`;
- `RESTRAINS`;
- `BEARS_ON`;
- `CONNECTS`;
- `SPANS_BETWEEN`;
- `TRANSFERS_TO`;
- `STABILISES`.

A generic connected edge is insufficient.

### Geometry extraction

Generate engineering-relevant values from canonical source geometry where the model has authority:

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

The model must state which external structural propositions remain to be proved.

## 4. External structural responsibilities

Unless a verified native proof family is deliberately added, external professional evidence discharges:

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

The evidence contract should state what proposition the external evidence covers.

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

result:
  PASS — EXTERNAL EVIDENCE
~~~

If a dependency leaves the evidence envelope, the pass becomes stale.

## 6. Structural compile status

A credible future H1 result could distinguish:

~~~text
STRUCTURAL TOPOLOGY        PASS
STRUCTURAL DOMAIN          PASS
MEMBER ADEQUACY            PASS — EXTERNAL EVIDENCE
CONNECTION ADEQUACY        PASS — EXTERNAL EVIDENCE
FOUNDATION / GROUND        PASS — EXTERNAL EVIDENCE
EVIDENCE CURRENT           PASS
~~~

That would be a successful structural result without pretending the compiler performed every calculation.

## 7. What the model must refuse

### Orphan load path

**ERROR**

External engineering evidence should not hide an unrepresented support relationship.

### Changed geometry outside evidence scope

**STALE / RECOMPILE**

Example:

- engineer evidence covers opening widths ≤ 1500 mm;
- source widens to 1800 mm.

Affected evidence must be invalidated.

### Unmodelled transfer

**UNRESOLVED**

Do not silently treat geometry as self-supporting because an engineer might solve it later.

### Unknown structural role

**UNRESOLVED / AUTHORING ERROR**

The source must distinguish load-bearing and non-load-bearing roles where that distinction affects proof.

## 8. Future native proof families

A later implementation could internalise bounded engineering families such as:

- manufacturer-backed joist span/spacing envelopes;
- simple lintel tables;
- masonry wall applicability envelopes;
- standard connection families;
- simple roof/truss packages.

Each would require:

- explicit parameter envelope;
- calculation/rule version;
- test suite;
- source/provenance;
- regression cases;
- clear fallback to external evidence outside the envelope.

No such expansion is currently authorised merely because it is technically possible.

## 9. User experience consequence

A non-engineer can still add a window, widen a room or move a wall.

The system can respond:

> this change makes the existing structural evidence stale; engineer review is required.

That contains dependency complexity without transferring professional responsibility to the user.

## 10. What P0 established — and did not

P0 demonstrated a deliberately small subset of the required mechanism:

1. stable semantic identity;
2. typed relationships;
3. source/geometry well-formedness;
4. obligation derivation;
5. scoped evidence;
6. local invalidation;
7. explicit unsupported/unresolved states.

It did **not** demonstrate H1 structural topology in full, native member design, stability, connections or foundations.

The next high-value structural step is competent external review of this boundary and the Reference House's actual structural/interface propositions, not generic solver growth.

## 11. Course-change trigger

Reconsider this boundary if external structural evidence proves so coarse that:

- most design changes invalidate the entire building;
- engineers must manually reinterpret an opaque model;
- evidence cannot be scoped to source entities;
- the author receives no useful early structural feedback.

Only then would a larger native proof kernel have a clear architectural reason to exist.