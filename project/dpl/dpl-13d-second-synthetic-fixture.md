# DPL-13D — Second Canonical Synthetic Fixture / Borough-Assigned Generalisation

**Issue:** #498  
**Repair:** #503 — DPL-13D.1  
**Depends on:** DPL-J, DPL-13B, DPL-13C  
**Fixture:** `DPL-RS-02`  
**Local planning target:** Croydon controlled exemplar  
**Status:** implementation candidate corrected by DPL-13D.1; exact executable result frozen pending final-head validation and resumed DPL-K gate

## Purpose

DPL-RS-01 is intentionally no-borough and UNKNOWN/ASSUMED-heavy. That makes it a strong fixture for proving a complete conservative `UNRESOLVED @ SCREENING` result, but a poor experiment for whether the same machinery generalises to a materially better classified case.

DPL-13D introduces one second **synthetic** fixture. It changes the experiment without claiming a real site.

The question is:

> Can the existing DPL-13B owner universe and DPL-13C substantive aggregation be rebound to an explicit borough-assigned synthetic context, with materially changed classification state, while preserving external-evidence uncertainty and the existing UNRESOLVED-only result authority?

## Fixture identity

```text
siteId = DPL-RS-02
manifestId = DPL-RS-02-SM-v0.1
siteKind = SYNTHETIC_REFERENCE
local planning = Croydon controlled target
```

DPL-RS-02 deliberately preserves the same parcel, Reference House placement and 29-claim vocabulary as DPL-RS-01. This isolates the experiment to **site-fact disposition and local-target composition** rather than geometry.

The authored deployment candidate remains RH-V02, unmirrored, rotated 180°, but receives its own candidate/source identity. No candidate search occurs.

## Exact planning composition

The selected local target is:

```text
CROYDON-LOCAL-PLANNING-2018-2026-10-21
```

It proves the existing controlled parent edge to:

```text
LON-STRATEGIC-RESIDENTIAL-DESIGN-2021-2026-10-20
```

No borough inference or alias reconciliation is permitted.

## Deliberately changed synthetic facts

The fixture preserves most DPL-RS-01 uncertainty. Two planning-context claims are deliberately made explicit as synthetic scenario facts.

### `RS-HERITAGE-01`

The synthetic scenario explicitly defines no listed/conservation/other heritage designation in the authored fixture context.

It is recorded as `DERIVED_SITE_CLAIM` only in the narrow sense that the proposition is derived from the declared synthetic scenario definition. It is **not** a heritage search, planning-officer judgement or statutory determination.

### `RS-NOISE-01`

The synthetic scenario explicitly defines an ordinary residential acoustic context with no authored severe-noise/sensitive-receptor flag.

Again, this is scenario input only. It is **not** an acoustic survey, agent-of-change assessment or planning discharge.

These changes are intentionally sparse. Flood, ecology, ground, title detail, utility capacity, neighbour openings, sewer detail, surface-water strategy and construction logistics remain UNKNOWN where the original fixture preserved missing evidence.

Crucially, after DPL-13D.1 these authored facts do **not** by themselves resolve opaque owner acceleration questions. Provenance state and scenario value are not trigger authority.

## Coverage/readiness generalisation seam

DPL-13D does **not** create a new owner registry.

It reuses the complete DPL-13B owner universe and rebinds only the case-dependent parts:

- site claim state/basis;
- local-authority-dependent planning disposition;
- selected controlled local target identity;
- claim ownership state/basis;
- readiness/result identity.

For an assigned controlled borough:

- local-authority-dependent planning entries represented by the selected target become `DUE_NOW_REPRESENTED`;
- if the selected target is not represented by the owner entry, the entry fails closed as `DUE_NOW_MISSING`;
- no local-policy entry becomes PASS merely because the borough is known.

The rebinding adapter is also exercised against DPL-RS-01/no-borough context and must reproduce the existing DPL-13B normalized coverage, counts, uncovered-claim state and ownership semantics exactly before RS-02 is admitted as a valid experiment.

### DPL-13D.1 acceleration correction

DPL-K exposed a narrow but material defect in the first DPL-13D implementation.

The initial adapter recreated `ACCELERATION_REVIEW_REQUIRED` only when a referenced claim remained `UNKNOWN`, `ASSUMED` or `ASSUMED_DEPLOYMENT_DATUM`. That accidentally treated `AUTHORED / DERIVED_SITE_CLAIM` as evidence that an opaque owner trigger had been resolved false.

That inference was invalid. The same rule would have removed the review if the authored synthetic value described an adverse heritage or severe-noise condition.

DPL-13D.1 therefore freezes the conservative rule:

> **An opaque acceleration-review obligation survives synthetic rebinding unless explicit typed owner-side authority resolves it.**

DPL-13D introduces no typed owner-side acceleration disposition. It therefore preserves the complete baseline acceleration-review set. No trigger prose is parsed and no claim-value keyword is executed.

## External-evidence boundary

Synthetic authored facts remain synthetic facts.

DPL-RS-02 does not positively discharge, merely by authorship:

- title/control or private-rights evidence;
- survey/geotechnical/contamination evidence;
- flood/drainage professional evidence;
- highway/access determination;
- utility/provider capacity;
- building-control evidence;
- qualitative planning judgement;
- planning permission/determination;
- opaque acceleration conditions owned outside the synthetic fixture.

A better classified synthetic fixture may therefore still correctly remain `UNRESOLVED @ SCREENING`. DPL-13D is not authorised to emit `COMPATIBLE` in any event.

## Executable result

The exact DPL-RS-02 implementation is proved as a complete repository candidate and its deterministic result payload is pinned in assertions rather than described approximately.

### Identity freeze

Exact deterministic identity values are pinned in:

```text
compiler/dpl/dpl13d-result.test.ts
```

This authority record is itself fingerprint-bearing, so it deliberately does **not** self-embed downstream case/result fingerprints. That avoids a circular identity definition in which recording a downstream fingerprint changes the authority fingerprint and therefore changes the downstream fingerprint again.

### Coverage/readiness disposition

After DPL-13D.1:

```text
DUE_NOW_REPRESENTED              = 31
DUE_NOW_MISSING                  = 0
FUTURE_DUE                       = 53
DUE_CLASSIFICATION_UNRESOLVED    = 0
NOT_APPLICABLE_PROVED            = 1
ADVISORY_NON_BLOCKING            = 2
ACCELERATION_REVIEW_REQUIRED     = 17
```

Compared with DPL-RS-01, the two local-planning entries that were unresolved only because no borough existed are now represented under the exact Croydon target:

```text
PLANNING:DPL10-COV-LOCAL-QUALITATIVE-EVIDENCE-POLICY
PLANNING:DPL10-COV-LOCAL-QUANTITATIVE-POLICY
```

The deliberately authored heritage/noise scenario facts do **not** remove their opaque acceleration-review questions. Those questions remain blocking until typed owner authority can actually classify them.

### Aggregation blockers

```text
substantiveUnresolved       = 27
dueClassificationUnresolved = 17
substantiveFailure          = 0
```

This is the corrected DPL-13D finding.

Classification improves in exactly one earned way:

- the two no-borough local-policy classification blockers disappear because an exact controlled Croydon target is assigned;
- no due-now coverage is missing;
- opaque acceleration review remains unchanged because no typed acceleration decision exists.

But **27 substantive blockers remain unresolved** because external evidence, admitted evaluators or qualitative judgement are still absent. The system therefore does not mistake better target classification for positive compatibility.

### Whole-site result

```text
wholeSiteConclusion = UNRESOLVED @ SCREENING
localBoroughTarget = CROYDON-LOCAL-PLANNING-2018-2026-10-21
compatibleAtScreening = NOT_ADMITTED
incompatible = NOT_ADMITTED
routeExhaustion = NOT_IMPLEMENTED
architecturalCandidateSelection = NOT_IMPLEMENTED
```

The all-positive adversarial override still returns:

```text
NOT_ADMITTED
reason = POSITIVE_CONCLUSION_NOT_ADMITTED
```

The second fixture therefore demonstrates that the DPL-13C middle result is not merely hard-coded to the no-borough DPL-RS-01 ecology. Local-target classification can improve while the same aggregation machinery continues to return the evidence-appropriate middle result.

## Result authority

DPL-J admits only:

```text
UNRESOLVED @ SCREENING
```

or an explicit fail-closed non-conclusion.

DPL-13D preserves:

```text
compatibleAtScreening = NOT_ADMITTED
incompatible = NOT_ADMITTED
routeExhaustion = NOT_IMPLEMENTED
architecturalCandidateSelection = NOT_IMPLEMENTED
```

## Identity boundary

The second case is identity-distinct through:

- site manifest fingerprint;
- authored candidate fingerprint;
- deployment case/result fingerprints;
- local target id;
- rebound readiness identity/result fingerprints;
- changed aggregation records;
- final DPL-13C identity/result fingerprints.

Material site/readiness mutation changes identity. Aggregation-record ordering remains identity-neutral.

## Proof boundary

DPL-13D proves only a second controlled **synthetic candidate case** and the ability of the existing coverage/readiness + aggregation semantics to execute across a changed local-target context.

It does not yet broaden DPL's M4 claim beyond the DPL-J-controlled canonical RS-01 result. DPL-K must decide whether the corrected two-fixture execution earns a broader controlled scope.

It does not prove:

- positive compatibility;
- site incompatibility;
- route exhaustion;
- real-site deployability;
- planning permission;
- regulatory compliance;
- legal clearance;
- external validation;
- generic all-borough support;
- resolution of opaque acceleration triggers from synthetic claim provenance.

A fresh/resumed post-DPL-13D DPL-K gate is mandatory before any positive-result implementation or broader result-scope claim.
