# DPL Foundation Coherence Review

**Gate:** [#344 — DPL-FR — foundation coherence review gate](https://github.com/adamnoden/architecture/issues/344)  
**Programme:** [#299 — DPL — deployment, jurisdiction and real-site integration programme](https://github.com/adamnoden/architecture/issues/299)  
**Baseline `main`:** `e581d18db732a8bd6ae9a10a967cf038ce5459eb`  
**Foundation reviewed:** DPL-01 through DPL-06  
**Decision:** **PASS WITH BOUNDED CORRECTIONS**

## Gate question

> **Do DPL-01 through DPL-06 form one coherent authority, evidence and deployment model that remains faithful to Ovid’s House, or must one or more foundation packets be reopened before downstream deployment work begins?**

## Decision

**PASS WITH BOUNDED CORRECTIONS.**

The six foundation packets compose cleanly. No architectural rewind, compiler-authority widening, status-model replacement, target-model rewrite or site-model rewrite is required.

The only material inconsistency found is expected programme-control drift: `deployment-programme.md` still contains DPL-00’s deliberately provisional vocabulary from before DPL-01 through DPL-06 froze the semantics.

That control document must therefore be reconciled in this gate.

The corrections are bounded because they:

- replace provisional wording with already-frozen foundation semantics;
- do not change the Reference House;
- do not change DPL-01 through DPL-06 conclusions;
- do not add executable compiler authority;
- do not encode substantive England/London rules;
- do not create a real-site deployment claim.

No foundation packet needs reopening.

## Authority reviewed

The gate reviewed as one system:

- `project/dpl/dpl-01-deployment-ontology.md`;
- `project/dpl/dpl-02-reference-house-conformance.md`;
- `project/dpl/dpl-03-assurance-result-semantics.md`;
- `project/dpl/dpl-04-compilation-maturity.md`;
- `project/dpl/dpl-05-target-stack-model.md`;
- `project/dpl/dpl-06-site-manifest-model.md`;
- `project/dpl/deployment-programme.md`;
- `docs/computational/compiler-targets.md`;
- `docs/computational/validity-and-obligations.md`;
- `docs/computational/evidence-and-provenance.md`;
- current Reference House gate authority and conformance contract;
- current compiler proof/authority boundary.

## Foundation model after reconciliation

The six packets now form the following chain:

```text
OVID'S HOUSE ARCHITECTURAL PROPOSITION
        │
        ↓
REFERENCE HOUSE
controlled authored architecture
        │
        ├──────────── REAL / REFERENCE SITE
        │                    │
        │                    ↓
        │               SITE CLAIMS
        │                    ↓
        │               SITE MANIFEST
        │
        ├──────── EXTERNAL NORMATIVE SOURCES
        │                    │
        │                    ↓
        │            COMPILER TARGET SNAPSHOTS
        │                    ↓
        │        TARGET COMPOSITION MANIFEST
        │
        └──────────────┬──────────────────────┐
                       ↓                      │
                DEPLOYMENT CASE               │
                       │                      │
              architectural authoring         │
                       ↓                      │
               DEPLOYMENT CANDIDATE            │
                       │                      │
                       └──────────┬───────────┘
                                  ↓
                             HOUSE KERNEL
                       admitted formal representation
                                  ↓
                         METAMORPH COMPILER
                                  ↓
                  OBLIGATIONS + EVIDENCE STATE
                                  ↓
                 COMPATIBLE / UNRESOLVED /
                       INCOMPATIBLE
                   @ exact assurance profile
```

House Kernel is deliberately downstream of architectural authoring in this authority model. It formalises selected facts/relationships; it is not the totality of Ovid’s House doctrine and is not a design generator.

## Coherence matrix

| Boundary | Foundation owners | Review result |
|---|---|---|
| Ovid’s House doctrine vs House Kernel | DPL-01 | **PASS** — explicitly separated. |
| Reference House identity vs site pressure | DPL-02 | **PASS** — deployment freedoms are opt-in; compatibility precedes adaptation. |
| Site facts vs architectural response | DPL-01, DPL-02, DPL-06 | **PASS** — manifest records claims; DPL-08 will own site-interface authoring. |
| Site facts vs external rules | DPL-05, DPL-06 | **PASS** — site claims trigger applicability; target rules do not live in manifests. |
| Target family vs authority rank | DPL-05 | **PASS** — composition graph has no implicit local/newer/list precedence. |
| Obligation result vs evidence lifecycle | DPL-03 + existing computational authority | **PASS** — separate canonical lattices retained. |
| Low-level result vs deployment conclusion | DPL-03 | **PASS** — deployment conclusion remains derived and profile-scoped. |
| Deployment profile vs project maturity | DPL-04 | **PASS** — DPL profiles are orthogonal to M1–M5 and RIBA stages. |
| Unknown vs false/not-applicable | DPL-03, DPL-06 | **PASS** — unknown fails closed where due. |
| Assumption vs fact | DPL-06 | **PASS** — assumptions are explicit provisional dependencies with replacement evidence. |
| Candidate failure vs site incompatibility | DPL-02, DPL-03 | **PASS** — incompatibility requires hard failure plus route exhaustion/invariance. |
| Planning/professional judgement vs native proof | DPL-03, DPL-05 | **PASS** — external determination remains external authority. |
| Target evolution vs source-law evolution | DPL-05 | **PASS** — source, target-model, method and composition identities remain separate. |
| Site-model correction vs historical result | DPL-06 | **PASS** — immutable manifest snapshots preserve prior case meaning. |
| Compiler evaluation vs architectural authorship | DPL-01, DPL-02 | **PASS** — compiler evaluates admitted candidates; it does not silently redesign. |
| Current compiler proof boundary vs deployment ambition | DPL-01, DPL-03, DPL-05 | **PASS** — no RH-C6 / whole-building authority inferred. |

## Review findings

### F1 — `House Kernel / doctrine` in DPL-00 is obsolete

DPL-00 used `House Kernel / doctrine` as a working shorthand.

DPL-01 correctly rejected that equivalence.

Canonical relationship:

```text
Ovid’s House architectural proposition
        ↓ selected formalisation
House Kernel
```

**Correction:** rewrite the programme control so Ovid’s House/manuscript owns architectural doctrine and House Kernel remains the narrower formal architecture/computation layer.

**Foundation reopen:** none.

### F2 — the original system diagram bypasses architectural authorship

DPL-00’s provisional diagram was:

```text
HOUSE KERNEL + REFERENCE HOUSE + TARGET + SITE + EVIDENCE
    ↓
COMPILER
    ↓
DEPLOYMENT RESULT
```

DPL-01 showed that this is too compressed because it can imply that the compiler receives a house/site/rules bundle and authors an adapted design.

The canonical sequence must include:

- deployment case;
- authored deployment candidate;
- House Kernel representation;
- compiler evaluation.

**Correction:** replace the DPL-00 system diagram.

### F3 — “target stack” remains useful language but not stack semantics

The programme can retain the human-facing phrase **target stack**.

DPL-05 freezes its meaning as an immutable target-composition manifest over a typed graph of target snapshots.

No order, geographic nesting or recency implies precedence.

**Correction:** programme control must describe graph composition, not hierarchy/inheritance.

### F4 — DPL-00 result vocabulary is superseded

The provisional candidate statuses:

`PROVED / FAIL / UNKNOWN / EVIDENCE REQUIRED / JUDGEMENT REQUIRED / NOT APPLICABLE`

must not survive as a competing result lattice.

DPL-03 freezes:

```text
obligation result:
PASS / EXTERNALLY_DISCHARGED / FAIL /
UNSUPPORTED / UNRESOLVED / NOT_APPLICABLE /
WARNING / SUPERSEDED

external evidence lifecycle:
PLANNED / PRESENT / ACCEPTED / REJECTED /
STALE / SUPERSEDED / WITHDRAWN

deployment conclusion:
COMPATIBLE / UNRESOLVED / INCOMPATIBLE
@ exact deployment assurance profile
```

“Evidence required” and “judgement required” remain useful explanatory language/method descriptions, not statuses.

**Correction:** reconcile programme control.

### F5 — compilation maturity is an assurance profile, not a stage counter

DPL-04 freezes six profiles:

- `SCREENING`;
- `FEASIBILITY`;
- `PLANNING_CASE`;
- `TECHNICAL_DESIGN`;
- `CONSTRUCTION`;
- `COMMISSIONED_AS_BUILT`.

The old word `planning` is too easily mistaken for planning permission/process stage, hence `PLANNING_CASE`.

The profiles define due-now evidence/claim boundaries and may rewind; they are not a scalar progress measure.

**Correction:** reconcile programme control.

### F6 — site manifest is claim architecture, not a field bag

DPL-06 materially strengthens DPL-00’s initial site-manifest wording.

Canonical semantics:

- real site exists outside the repository;
- manifest is an immutable site-state snapshot;
- claims have subject, proposition/value, scope, time, basis and provenance;
- unknowns are first-class;
- assumptions are explicit dependencies;
- evidence remains separate;
- derived normative conclusions do not belong in the raw manifest;
- better evidence creates a new manifest version and selectively stales dependent results.

**Correction:** programme control must reflect this stronger model.

### F7 — DPL-02 intentionally makes the Reference House relatively rigid

The conformance contract does **not** expose every current dimension as a parameter.

The programme’s original “site interface absorbs legitimate difference” remains correct only under DPL-02’s strict reading:

- identity invariants remain;
- protected order is not a deployment parameter;
- only explicitly licensed discrete variants may vary;
- site-interface freedom does not authorise interior/architectural mutation;
- implementation freedom remains bounded by architecture and external obligations.

No contradiction exists.

The consequence is intentional:

> A site may be rejected even though a talented architect could redesign the house to fit it.

That is the meaning of **compatibility before adaptation**.

### F8 — DPL-03 and DPL-04 correctly permit early positive conclusions without fake later certainty

`COMPATIBLE @ SCREENING` is legitimate when all screening-due blocking obligations are resolved even though later facts remain future-due.

This does not create optimism because:

- the profile is part of the claim;
- material unknowns remain explicit;
- DPL-04 decision-critical acceleration pulls visible potential blockers forward;
- later evidence can rewind the result.

No correction required.

### F9 — DPL-05 and DPL-06 form a clean external-rule / real-world-fact pair

DPL-05 answers:

> **What exact external normative models are we evaluating against?**

DPL-06 answers:

> **What do we presently claim to know or assume about this site, and on what basis?**

Applicability is computed from their relation; neither may absorb the other.

No correction required.

### F10 — no hidden Reference House redesign has been earned

The foundation review found no condition requiring an immediate architectural rewind.

That absence is not evidence that the house will survive real deployment.

DPL-07 through DPL-15 exist precisely to create the evidence capable of challenging it.

For now:

- Reference House authority remains unchanged;
- drawings remain based on controlled source;
- no shell/courtyard/plan/service/roof/elevation redesign is authorised by this gate.

## Adversarial checks

### Could missing site evidence manufacture a pass?

**No.**

If the claim is due now, missing information produces unresolved/unsupported state. If it is legitimately future-due, a positive result is explicitly limited to the selected earlier profile.

### Could a single failed candidate reject a plot?

**No, not generally.**

Incompatibility requires the relevant admitted conformance-preserving routes to be exhausted or the failure to be invariant across them.

### Could the compiler mirror, rotate or alter the house automatically?

**No.**

Even admitted variants must become architecturally authored deployment candidates. The compiler evaluates them.

### Could a borough target automatically override a London strategic target?

**No.**

Any precedence/supplement relation must be encoded from the actual planning authority model in DPL-10.

### Could a newer regulation automatically replace an older project basis?

**No.**

DPL-05 requires effective/transitional applicability, not “latest wins”.

### Could a site manifest say “planning compliant”?

**No.**

It may record site facts and authoritative designation facts. Policy/legal consequences are derived outside the raw manifest.

### Could a Reference Site be presented as representative of London?

**No.**

It remains synthetic and explicit. Empirical deployment envelope work comes from the later real-plot corpus/trials.

### Could DPL imply Building Regulations compliance now?

**No.**

Current compiler authority remains bounded. DPL-09 must establish the real England target/inventory and DPL-12 later decides what is executable versus external evidence.

## Programme maturity judgement

The DPL workstream has moved beyond **M1 — Framed**.

The foundation now contains substantive developed models for:

- ontology;
- Reference House conformance;
- assurance/results;
- assurance profiles;
- target composition;
- site manifests.

However, DPL is not yet coordinated at whole-programme scope because it does not yet contain:

- the Reference Site;
- substantive England/London target inventories;
- the site-interface architecture;
- real-site due-diligence model;
- deployment compiler substrate;
- canonical deployment compile;
- real-plot trials.

The correct current programme maturity is therefore:

> **M2 — Developed**

not M3.

This gate should update the canonical maturity registry/status accordingly.

## Downstream decomposition review

The provisional DPL-07 through DPL-18 decomposition remains fundamentally sound.

One sequencing refinement is adopted:

> **Do not rush DPL-12 implementation merely because its semantic dependencies are now technically satisfied.**

The concrete Reference Site and external target/due-diligence inventories should attack the foundation before shared executable orchestration is frozen.

### Wave A — authorised after this gate

The following may open after the review PR merges:

#### DPL-07 — Reference Site

Define the explicit synthetic Reference Site using DPL-06 site-claim semantics and DPL-05 context identity.

#### DPL-09 — England regulatory target inventory

Inventory the actual England new-dwelling authority/applicability corpus first. Split into bounded child packets only after that inventory reveals coherent technical seams.

#### DPL-10 — London planning target inventory

Recover the actual Greater London + borough planning authority relationship, including what can be machine-checked, what requires evidence and what remains judgement.

#### DPL-11 — site due-diligence / non-planning constraints

Clarify the external/private/utility/ground/access conditions that affect deployability without pretending they are planning policy.

These four lanes may proceed laterally because the foundation now supplies common semantics.

### Wave B — not opened at foundation close

#### DPL-08 — house ↔ land site interface

Waits for DPL-07.

#### DPL-12 — deployment compiler substrate

Semantically unblocked but intentionally deferred until DPL-07/09/10/11 produce enough concrete material to challenge the abstractions.

#### DPL-14 — real London plot corpus

Still important early empirical pressure. Open once DPL-07 has established a usable first site-manifest field discipline, rather than inventing corpus encoding independently.

### Later integration remains unchanged

- DPL-13 canonical deployment compile follows DPL-07 through DPL-12;
- DPL-15 follows DPL-13 + DPL-14;
- DPL-16 derives the deployment envelope from trials;
- DPL-17 integrates the small reader-facing jurisdiction/site layer;
- DPL-18 adversarially attacks the integrated result.

## Corrections required by this gate

The review PR must:

1. add this durable gate record;
2. reconcile `project/dpl/deployment-programme.md` to DPL-01→06 semantics;
3. advance DPL programme maturity from M1 to M2 in `project/maturity.ts`;
4. reconcile the generated/current `STATUS.md` DPL language and maturity row;
5. leave DPL-01→06 records unchanged unless a factual typo is discovered;
6. create no executable deployment capability;
7. create no DPL-07+ issue until this gate is merged.

## Rejected alternatives

### Reopen DPL-01 because DPL-00 was wrong

Rejected.

DPL-00 explicitly described its object meanings as working/provisional. DPL-01 performed the intended correction. The stale programme control needs reconciliation; the ontology does not need reopening.

### Promote DPL directly to M3

Rejected.

The foundation is internally coherent, but the deployment workstream has not yet coordinated the actual Reference Site, external target inventories, site interface or real-site evidence. M2 is the more truthful rating.

### Start compiler implementation immediately

Rejected.

Doing so would risk formalising elegant abstractions before England/London/site evidence has attacked them.

### Make the Reference House more parametric now

Rejected.

No real-site evidence has earned that architectural change. DPL-02 intentionally protects the authored proposition until deployment evidence proves it too brittle.

### Open the full DPL-07→18 issue set now

Rejected.

Wave-based issue creation preserves lateralisation without filling the tracker with prematurely specified downstream work.

## Gate result

> **PASS WITH BOUNDED CORRECTIONS**

The DPL foundation is coherent enough to support the next programme wave.

No DPL foundation packet reopens.

No Reference House geometry changes.

No compiler proof boundary changes.

No legal/planning compliance claim is created.

After this gate merges, **DPL-07, DPL-09, DPL-10 and DPL-11** are authorised to open and proceed laterally.

DPL-08, DPL-12, DPL-14 and later work remain sequenced as stated above.
