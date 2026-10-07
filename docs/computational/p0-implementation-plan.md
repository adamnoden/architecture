# P0 — Minimal Executable Compiler Kernel

**Status:** active implementation plan  
**Starting point:** `main@693b8e08923fc108ab232c4d067642017a7ddc66`  
**Authority:** [Research Programme v0.6](research-programme-v06.md), inheriting the executable gate from [v0.4](research-programme-v04.md)  
**Purpose:** falsify the central semantic / obligation / evidence mechanism with code before choosing heavy CAD, solver or product architecture.

P0 is not a house application and not a pattern-language implementation.

---

## 1. Success question

> Can a deliberately small executable model preserve stable building meaning, derive obligations, distinguish evidence/validity states, invalidate only dependent results after mutation, explain failures intelligibly and reject unsupported conditions without requiring a general CAD stack?

If not, the compiler thesis should be weakened before the project accumulates software architecture around it.

---

## 2. Explicitly in scope

P0 must demonstrate:

1. **stable identity** for entities and relationships;
2. **typed relationships** over one semantic source;
3. **deterministic well-formedness** using crude axis-aligned 2D geometry;
4. **contextual roles** carried by relationships rather than duplicated objects/flags;
5. **obligation derivation** from composed source relationships/boundary roles;
6. distinct statuses: `PASS`, `FAIL`, `UNRESOLVED`, `UNSUPPORTED`, `EXTERNALLY_DISCHARGED`;
7. **scoped evidence** with proposition, subject, source/version and explicit dependency snapshots;
8. **selective invalidation** when source facts change;
9. **building-meaningful diagnostics** with deterministic provenance;
10. **clean unsupported-domain handling** rather than guessed answers;
11. **reproducibility** for a frozen source / target / evidence set.

---

## 3. Explicitly out of scope

Do not add:

- pattern entities or `PAT-XW-01`;
- UI/editor;
- 3D/B-rep/mesh kernel;
- general geometry/constraint solver;
- structural analysis solver;
- Building Regulations database;
- IFC/BIM import/export;
- product search/substitution;
- cost/carbon engine;
- cloud/database architecture;
- AI judgement;
- optimisation/generative design.

---

## 4. Implementation shape

Use TypeScript with a very small module surface under `compiler/p0/`.

```text
compiler/p0/
  model.ts          # source/entity/relationship/evidence types
  geometry.ts       # deterministic Box2D operations only
  obligations.ts    # shared obligation derivation
  evidence.ts       # scope + dependency snapshots
  compile.ts        # compile pipeline + diagnostics
  fixture.ts        # canonical P0 source/target/evidence fixture
  p0.test.ts        # baseline + mutation suite
```

Avoid framework/domain packages in the kernel. The only new development dependency should be the test runner unless implementation proves otherwise.

---

## 5. P0 source fixture

Use one small single-storey condition containing:

- `STOREY-01`;
- two adjacent spaces `ROOM-01` / `ROOM-02`;
- an external wall `WALL-EXT-01` carrying explicit boundary roles;
- an internal wall `WALL-INT-01`;
- a window/opening `WIN-01` hosted by the external wall;
- a door/opening `DOOR-01` hosted by the internal wall;
- a service route `SR-01`;
- one controlled penetration `PEN-01` through `WALL-EXT-01` carrying `SR-01`;
- one maintenance-access relation where useful;
- selected family/target identifiers only where they drive a bounded obligation;
- scoped evidence sufficient to discharge some but not all obligations.

Geometry is intentionally crude. It exists only to make containment, overlap, adjacency, host and level checks executable.

---

## 6. Compile pipeline

```text
SOURCE
  ↓
identity / reference validation
  ↓
supported-domain check
  ↓
well-formedness geometry/relationship checks
  ↓
shared obligation derivation
  ↓
evidence scope + dependency freshness evaluation
  ↓
status aggregation
  ↓
deterministic diagnostics / manifest
```

A source-level failure should not be disguised as a technical evidence problem.

---

## 7. Required baseline behaviours

### P0-B01 — identity

Duplicate entity/relationship IDs fail deterministically.

### P0-B02 — references

A relationship pointing to a missing entity fails before higher-order reasoning.

### P0-B03 — containment

Contained geometry must lie inside the declared container where that relationship claims containment.

### P0-B04 — forbidden overlap

Two ordinary spaces on the same storey declared as peers must not overlap in area.

### P0-B05 — adjacency

A declared adjacency must be geometrically true under the deliberately simple Box2D model.

### P0-B06 — opening host

A hosted opening must geometrically lie within/intersect its declared host wall envelope and share level/storey context.

### P0-B07 — controlled crossing

A service route declared to cross a wall must have an identified penetration/transition occurrence linking route and host.

### P0-B08 — boundary obligations

A penetration through a wall carrying boundary roles derives one obligation per relevant boundary role from the composed source.

### P0-B09 — evidence scope

Evidence discharges only obligations/subjects within its declared scope.

### P0-B10 — external discharge

An accepted external professional determination can yield `EXTERNALLY_DISCHARGED` without pretending the compiler performed that analysis itself.

---

## 8. Required mutations

### P0-M01 — impossible geometry

Move `ROOM-02` so it overlaps `ROOM-01`.

Expected: source/model `FAIL`; higher-order release cannot pass.

### P0-M02 — false adjacency

Move `ROOM-02` away while retaining the `adjacent-to` relationship.

Expected: adjacency diagnostic names both spaces and the relation.

### P0-M03 — broken opening host

Move `WIN-01` outside `WALL-EXT-01` while retaining the host relation.

Expected: source/model `FAIL`; unrelated service evidence remains irrelevant rather than being blamed.

### P0-M04 — anonymous service crossing

Delete `PEN-01` while leaving `SR-01 crosses WALL-EXT-01`.

Expected: source/model `FAIL` with a controlled-crossing diagnostic.

### P0-M05 — new boundary role

Add `fire` to `WALL-EXT-01` boundary roles.

Expected:

- a new fire obligation appears;
- existing air/weather/thermal evidence does not broaden scope automatically;
- the new obligation is `UNRESOLVED` unless suitable evidence exists.

### P0-M06 — evidence dependency stale

Move `PEN-01` after accepting evidence whose dependency snapshot includes the penetration geometry.

Expected:

- only obligations/evidence depending on that geometry become stale/unresolved;
- unrelated window/adjacency results remain current.

### P0-M07 — external determination

Supply accepted structural/external evidence for a scoped obligation.

Expected: `EXTERNALLY_DISCHARGED`, not machine `PASS`.

### P0-M08 — explicit technical failure

Supply evidence/determination whose scoped result is failure.

Expected: relevant obligation `FAIL`; source geometry can remain well formed.

### P0-M09 — unsupported condition

Change one source geometry to the explicitly unsupported geometry kind.

Expected: clean `UNSUPPORTED` result/diagnostic; compiler does not guess.

### P0-M10 — reproducibility

Compile the identical frozen input twice.

Expected: deep-equal deterministic result ordering and diagnostics.

---

## 9. Evidence model for P0

An evidence record must include at minimum:

```text
id
kind / resolver
proposition
subject IDs
source + version
result
supported obligation keys
captured dependency snapshots
```

Dependency snapshots are deliberately explicit in P0. The compiler compares them with current source values to decide whether evidence is current or stale.

Do not build a general provenance database yet.

---

## 10. Diagnostic standard

Prefer:

> `PEN-01` crosses `WALL-EXT-01` whose `fire` boundary role has no current accepted evidence.

Not:

> assertion 47 failed.

Each diagnostic should carry stable code, severity/status, subject IDs and enough message text to identify the building consequence.

---

## 11. Implementation gates

### P0.1 — source + geometry

Identity, references, Box2D, containment, overlap, adjacency, host/level checks.

**Gate:** baseline + M01–M03 tests pass.

### P0.2 — crossing + obligation derivation

Controlled penetration and per-boundary-role obligations.

**Gate:** baseline + M04–M05 pass.

### P0.3 — evidence + invalidation

Evidence scope, dependency snapshots, external discharge, explicit technical failure.

**Gate:** M06–M08 pass and unaffected results remain stable.

### P0.4 — unsupported + reproducibility

Explicit unsupported source condition and deterministic result ordering.

**Gate:** M09–M10 pass.

### P0.5 — integration

- add `npm test` / `npm run test:p0`;
- run tests in GitHub Actions before docs build;
- write P0 execution/gate review;
- update Research Programme / STATUS only after real CI passes.

---

## 12. Kill / weakening conditions

Stop and simplify if:

- Box2D cannot test compiler value without forcing a CAD kernel;
- dependencies require manual annotation on every derived fact;
- obligation derivation becomes pattern/family-specific branching everywhere;
- evidence scope cannot remain local;
- diagnostics cannot explain provenance deterministically;
- TypeScript type machinery becomes more complex than the semantic problem;
- implementation needs application scaffolding before one mutation can be evaluated.

---

## 13. Resume protocol

Read:

1. `STATUS.md`;
2. [Research Programme v0.6](research-programme-v06.md);
3. this file;
4. [Formal Architectural Model](formal-architectural-model.md);
5. [Validity and Obligations](validity-and-obligations.md);
6. [Evidence and Provenance](evidence-and-provenance.md).

Then continue the first incomplete `P0.x` gate. Do not begin `PAT-XW-01` until P0 receives a formal PASS.