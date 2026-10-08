# Pattern Crosswalk — Implementation Handoff

**Status:** completed Phase-8 P8.5 handoff; retained as implementation provenance  
**Purpose at the time:** convert the completed architectural/computational crosswalk into a bounded executable test programme without expanding the authorised P0 kernel.  
**Current outcome:** P0 and `PAT-XW-01` both passed; generic kernel/crosswalk growth is now frozen. See [P0 + PAT-XW-01 — Executable Gate Result](p0-pat-xw-01-result.md).

> **Historical handoff.** Instructions below such as “run only after P0” and “next computational move” describe the pre-implementation sequence that has since been completed. The semantic constraints remain useful provenance; the executable result is now the current authority.

---

# 1. Programme decision

**The minimal P0 compiler kernel scope does not change.**

P0 still exists to falsify the core semantic/compiler mechanism:

- stable identity;
- typed relationships;
- simple deterministic geometry / source well-formedness;
- obligation derivation;
- status separation;
- evidence scope;
- selective invalidation;
- intelligible diagnostics;
- clean unsupported-domain behaviour;
- deterministic reproducibility.

Do not add a pattern subsystem to P0.

The Phase-8 result is a **post-kernel crosswalk fixture**, not a new ontology milestone.

---

# 2. Pattern provenance in implementation

Do not introduce a required core `Pattern` or `PatternIntent` building entity.

Use existing project-requirement/provenance machinery conceptually:

```text
PROJECT REQUIREMENT PR-XW-003
provenance: HSA-P-003
scope: service route set SR-01
formal commitments:
  - route segments identified
  - branch relationships explicit
  - declared maintenance nodes represented
architectural judgement:
  - topology is proportionate/coherent in the house
```

The exact storage syntax should be chosen only when code exists.

The important semantic rule is:

> pattern provenance may explain **why** a project requirement exists; it does not replace the source entities/relationships that make the requirement true or false.

---

# 3. First executable pattern crosswalk fixture — `PAT-XW-01`

Run only after the P0 success gate is satisfied.

## Fixture purpose

Demonstrate that one small source model can simultaneously:

1. retain architectural pattern provenance;
2. test the deterministic subset of selected architectural commitments;
3. derive technical obligations from ordinary shared graphs;
4. keep those authorities separate in diagnostics;
5. invalidate only dependent results after mutation;
6. leave non-formalisable architectural judgement visibly outside machine proof.

## Fixture scope

Keep geometry crude and reuse P0-scale concepts.

Suggested source:

```text
ROOM R01
SERVICE ZONE SZ01
EXTERNAL / BOUNDARY WALL W01
SERVICE NETWORK NET01
PRIMARY ROUTE SR01
LOCAL BRANCH SR02
PENETRATION PEN01 through W01
ISOLATOR ISO01
optional PHYSICAL INDEX / LABEL artefact IDX01
```

Pattern provenance:

- `HSA-P-003 — Coherent Horizontal Service Route` for `SR01/SR02`;
- `HSA-P-005 — Designed Structural Penetration` for `PEN01`;
- optional second-stage `HSA-P-012 — Physical Service Index` for `IDX01`.

Do **not** include `P-002`, `P-004`, `P-014` in the first fixture merely to look comprehensive. They need more spatial geometry and add little to the first falsification.

---

# 4. Baseline expectations

## `P-003` formal subset

The source should establish:

- network route continuity;
- primary route vs local branch role;
- route host/zone;
- declared maintenance/access node where relevant;
- designed crossing rather than implicit boundary traversal.

Output should say only that the **formal commitments represented by the project requirement are resolved**.

It must not claim that the topology is architecturally optimal or proportionate.

## `P-005` formal subset

The source should establish:

- penetration identity;
- host identity;
- routed service/network;
- geometry/location;
- boundary roles interrupted;
- transition/reinstatement obligations derived from shared graphs.

`P-005` project commitment may be resolved while technical obligations remain `UNRESOLVED` or `EXTERNALLY DISCHARGED`.

That split is a required success condition.

## Optional `P-012` subset

Only after the baseline works:

- physical index/label artefact exists;
- it carries or refers to a stable semantic identifier;
- inspection confirms correspondence;
- a later identity/change mutation can stale the physical-record evidence without invalidating unrelated building evidence.

If expressing this requires invasive schema work, defer it. `P-012` is not a kernel blocker.

---

# 5. Required mutation suite

## `XW-M01` — route crosses boundary without an owned transition

Mutate `SR02` so it traverses `W01` without a `Penetration` / boundary-transition relationship.

Expected:

- source/model well-formedness or relationship validity fails;
- diagnostic is building-meaningful;
- no pattern-specific fire/weather logic is required.

## `XW-M02` — designed penetration, missing technical evidence

Restore `PEN01` as a correctly owned crossing but remove/omit the evidence needed for one boundary role.

Expected:

- formal `P-005` architectural commitments can remain resolved;
- relevant technical obligation becomes `UNRESOLVED`;
- other penetration obligations remain unaffected where their evidence is still valid.

This mutation is essential because it proves pattern conformance is not technical proof.

## `XW-M03` — technically valid ad-hoc branch

Add `SR03` as a technically valid local route that bypasses the project-selected `P-003` geography without a declared exception.

Expected:

- the branch may remain technically valid;
- project architectural requirement derived from `P-003` becomes failed/unresolved or emits an explicit departure;
- regulatory/engineering validity does not fail merely because HSA intent fails.

This mutation is essential because it proves technical validity and architectural-project intent can diverge.

## `XW-M04` — boundary-role change

Change `W01`/the crossed condition so `PEN01` now interrupts an additional boundary role, for example fire separation.

Expected:

- existing unrelated geometry/source facts remain current;
- new obligation derives;
- previously accepted evidence not covering the new role does not magically expand scope;
- only dependent release state changes.

## `XW-M05` — optional physical-index stale mapping

Replace/rename `ISO01` in the semantic model but leave its installed physical label/index mapping unchanged.

Expected:

- digital model can remain internally coherent;
- physical-record correspondence becomes `STALE` / unresolved;
- unrelated route/penetration evidence stays current.

---

# 6. Required report shape

The crosswalk must not emit one `PATTERN = PASS` Boolean.

Conceptually:

```text
Pattern crosswalk: HSA-P-005
Project scope: PEN01

FORMAL ARCHITECTURAL COMMITMENTS
  identified occurrence                 PASS
  host + routed system declared         PASS
  geometry/location explicit            PASS
  crossed boundary roles discoverable   PASS

INDUCED TECHNICAL OBLIGATIONS
  structural adequacy                   EXTERNAL EVIDENCE REQUIRED
  air-boundary reinstatement            PASS
  thermal transition                    PASS
  fire stopping                         NOT APPLICABLE

ARCHITECTURAL JUDGEMENT
  visible resolution / proportionality  HUMAN DETERMINATION
```

The report is a view over existing source/obligation/evidence state.

---

# 7. Authority rules for implementation

A crosswalk diagnostic must identify its authority.

Examples:

```text
FAIL
route SR03 leaves selected accessible service geography
authority: project requirement
provenance: HSA-P-003

UNRESOLVED
penetration PEN01 interrupts air boundary AB01 without accepted reinstatement evidence
source: composed boundary graph

EXTERNAL EVIDENCE REQUIRED
penetration PEN01 structural adequacy
source: structural obligation / supported-domain boundary
```

Do not allow pattern provenance to masquerade as regulation, engineering or product authority.

---

# 8. Minimal implementation additions authorised by Phase 8

## Required

None beyond the already-authorised P0 machinery.

## Post-P0 additions allowed if the fixture needs them

1. project-requirement provenance reference capable of pointing to `HSA-P-xxx`;
2. report grouping that gathers relevant project commitments + induced obligations under a pattern occurrence/scope;
3. generic `identifies` / `refers-to` relation for physical information artefacts **only if `P-012` cannot be represented cleanly without it**.

These are bounded refinements, not a new pattern domain model.

---

# 9. Extension-fixture map after `PAT-XW-01`

## External maintenance — `EXT-MAINT-01`

Crosswalks:

- `P-011` Roof Maintenance Route;
- `P-013` Ground-Supported Façade Access.

Also exercises already-authorised `AccessMethod`, support/setup/work/withdrawal roles, third-party dependency and landscape/as-built invalidation.

## Rainwater — `RAIN-XW-01`

Crosswalk:

- `P-009` Accessible Rainwater Route.

Can fulfil/extend existing programme item `C-043`.

Core mutation: blocked primary outlet → trace overflow/failure path.

## Cooking source capture — `KEX-XW-01`

Crosswalk:

- `P-010` Source-Capture Kitchen Extract.

Can fulfil/extend existing programme item `C-044`.

Core mutation: source/capture geometry changes without changing nominal fan evidence.

## Water failure — `WATER-XW-01`

Crosswalks:

- Fail-Safe Water Distribution strategy;
- `P-017` Visible Leakage Path;
- `P-018` Failure-Tolerant Wet Service Room.

Core mutations: blocked leak path; floor/drain geometry changes; isolation becomes inaccessible.

## Room service/boundary composition — `ROOM-XW-01`

Crosswalks:

- `P-015` Accessible Room Service Route;
- `P-016` Compartmented Service Void.

Core mutation: later service bypasses access route and punctures compartment closure.

## Openings / replaceable interfaces — `OPEN-XW-01`

Crosswalks:

- `P-007` Replaceable Window;
- `P-008` Movement / Slip Junction;
- `P-019` Replaceable Door;
- `P-020` Designed Threshold.

Prefer coupling this to physical/detail work rather than building a large paper-only ruleset.

## Attachment / lining prototype — `ATTACH-XW-01`

Crosswalk:

- `P-022` Controlled Attachment Plane;
- held Replaceable Architectural Lining candidate.

Best run against W2 physical prototype evidence so digital semantics and real workmanship are attacked together.

---

# 10. Success gate for `PAT-XW-01`

Pass only if the executable fixture demonstrates all of the following:

1. pattern provenance can be retained without making patterns core building entities;
2. formal architectural commitments are derived from ordinary source facts;
3. induced technical obligations still come from shared graphs;
4. project-intent failure can coexist with technical PASS;
5. technical evidence failure can coexist with formal pattern-commitment PASS;
6. dependency invalidation remains local;
7. human architectural judgement remains explicit and un-faked;
8. diagnostics explain the distinction intelligibly;
9. adding the crosswalk does not materially expand the P0 schema.

If these fail, simplify the crosswalk rather than growing a pattern compiler.

---

# 11. Phase-8 handoff conclusion

The pattern-language overhaul does not demand a new computational architecture.

It supplies a disciplined authoring/provenance layer that can be projected onto the existing semantic model.

The next computational move therefore remains exactly what the programme already required:

> **build the minimal semantic/compiler kernel first.**

Only after that kernel survives should `PAT-XW-01` test whether architectural pattern intent can ride on top of it cleanly.