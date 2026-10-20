# DPL-09A — England Legal, Applicability and Process Source Spine

**Issue:** [#359 — DPL-09A — England legal, applicability and process source spine](https://github.com/adamnoden/architecture/issues/359)  
**Programme:** [#299 — DPL — deployment, jurisdiction and real-site integration programme](https://github.com/adamnoden/architecture/issues/299)  
**Parent inventory:** [DPL-09](dpl-09-england-regulatory-target-inventory.md)  
**Authorised by:** [#356 — DPL-WA Wave A integration and DRW rendezvous](https://github.com/adamnoden/architecture/issues/356)  
**Research date:** 2026-10-20  
**Baseline `main`:** `782d5eb512c7ec8958bfa20fdddb3091e1cddb74`  
**Jurisdiction:** England  
**Reference work class for test cases:** new low-rise detached dwelling; non-HRB unless an actual case proves otherwise  
**Status:** source/applicability contract; **not** a substantive Parts A–T implementation and **not** a declaration of compliance

## Question

> **How do we identify, version and compose the operative England legal/official sources, transition events, applicability facts and process/dutyholder obligations so that later technical methods cannot silently use the wrong regime?**

DPL-09A freezes that source-selection spine.

It deliberately stops before implementing the substantive technical rules that later packets may derive from the selected target.

---

# 1. Result

An England deployment target cannot be represented by a token such as:

```text
ENGLAND_2026
```

or by a rule such as:

```text
use latest Building Regulations
```

The minimum honest model is a composition of **independently identified source families** evaluated against **project-event facts**.

For the present target family:

```text
SOURCE SNAPSHOTS
  ├── base Building Regulations source
  ├── amending instruments / commencement / transition sources
  └── official route/guidance sources downstream

PROJECT / WORK FACTS
  ├── jurisdiction
  ├── work / building class
  ├── HRB status where relevant
  ├── notice / application type
  ├── notice / application date
  └── commencement event/date

        ↓ explicit applicability evaluation

TARGET SELECTION
  ├── TECHNICAL / SUBSTANTIVE target family
  └── PROCESS / DUTYHOLDER target family

        ↓ later bounded methods / external evidence

OBLIGATIONS + RESULTS
```

The most important consequence is:

> **Technical transitional eligibility and current statutory process/dutyholder obligations are separate axes.**

A project that legitimately retains an earlier technical standard under a transitional provision does **not** thereby revert to an earlier process/dutyholder world unless the legislation expressly provides that consequence.

---

# 2. Authority recovered

## 2.1 Base instrument — Building Regulations 2010

Primary instrument:

- **The Building Regulations 2010 — S.I. 2010/2214**, as amended;
- official source: `https://www.legislation.gov.uk/uksi/2010/2214/contents`.

The target must identify the 2010 Regulations as an amended legal source rather than treating Schedule 1 Parts A–T as the complete regulatory system.

Relevant obligations also live in the surrounding regulations: application/process provisions, Part 2A duties, testing/commissioning/information provisions and other requirements that cannot honestly be reconstructed from the Approved Documents alone.

### Consolidation warning

A consolidated legislation page is a useful current view but must not be treated as a timeless source blob.

A reproducible target selection therefore records:

- the underlying instrument identity;
- the source/revision view or retrieval date used;
- the amending/transition instrument material to the selected target;
- any known unapplied/pending effect relevant to the proposition being evaluated.

If the official revised-text service has not yet incorporated a material change, the amending instrument remains authoritative evidence of that change.

## 2.2 Dutyholder / competence family — 2023 amendments

Primary amending instrument:

- **The Building Regulations etc. (Amendment) (England) Regulations 2023 — S.I. 2023/911**;
- official source: `https://www.legislation.gov.uk/uksi/2023/911`;
- Part 2A insertion source: regulation 6;
- relevant commencement: **1 October 2023**.

The amendment inserted **Part 2A — Dutyholders and competence** into the 2010 Regulations.

The current 2010 Regulations therefore contain duties including client arrangements, designer/contractor duties and competence requirements.

These obligations are statutory but are not ordinary geometric or numerical design checks.

DPL therefore retains a separate target family:

```text
ENGLAND_BUILDING_REGS_PROCESS_DUTYHOLDER
```

A compiler may track applicability, appointments, required declarations/evidence and unresolved external duties. It must not convert that into a claim that it has proved a person or organisation competent.

## 2.3 Future Homes and Buildings Standards amendment family — 2026

Primary amending instrument:

- **The Building Regulations etc. (Amendment) (England) Regulations 2026 — S.I. 2026/335**;
- made: **23 March 2026**;
- official source: `https://www.legislation.gov.uk/uksi/2026/335/enacted`.

For ordinary work that is **not HRB work or work to an existing HRB**, the principal amendments come into force on **24 March 2027**.

Regulation 5 establishes a material transition route for building work on a particular building where, before 24 March 2027, a relevant:

- building notice;
- initial notice; or
- application for building control approval with full plans

has been given/made, **provided that the work to which it relates is commenced before 24 March 2028**.

The instrument also contains additional/special transitional provisions, including inherited 2021/2013 cases and distinct HRB timing. DPL-09A does not erase those branches merely because the Reference House test case is presently non-HRB.

The target-selection lesson is general:

```text
notice/application date
        +
notice/application route
        +
work/building class
        +
commencement event
        ↓
technical transition applicability
```

Publication of a new Approved Document or amendment is **not** by itself enough to select the new technical regime.

---

# 3. Source classes remain distinct

DPL-09A freezes the following source-class distinction for the England regulatory target.

| Source class | Example | Authority role | May directly define legal obligation? |
|---|---|---|---:|
| `PRIMARY_OR_DELEGATED_LEGISLATION` | Building Regulations 2010; S.I. 2023/911; S.I. 2026/335 | legal requirement, amendment, commencement, transition | yes |
| `OFFICIAL_COMPLIANCE_GUIDANCE` | Approved Documents | recognised practical guidance / route | no — do not promote guidance text into the law |
| `REFERENCED_TECHNICAL_STANDARD` | BS / EN / calculation methodology where a route relies on it | technical method/evidence substrate | only to the extent the governing route gives it effect |
| `OFFICIAL_CIRCULAR_OR_EXPLANATORY_SOURCE` | MHCLG building circular / explanatory material | interpretation, implementation context, transition explanation | not a substitute for the legal instrument |
| `EXTERNAL_PROFESSIONAL_OR_STATUTORY_EVIDENCE` | engineer determination, test certificate, building-control decision | discharges or informs an obligation at admitted scope | evidence/decision, not source law |

The model must preserve these classes even when several point to the same practical design outcome.

---

# 4. Minimal source snapshot object

DPL-09A does **not** add a runtime TypeScript registry yet.

The repository does not currently contain a release-grade England target registry whose shape should be extended, and DPL-09B+ has not yet established the stable technical-source fields needed across Parts A–T.

Freezing a code schema now would therefore turn an authority record into premature implementation.

Later structured target work must, however, preserve at least this logical shape:

```text
RegulatorySourceSnapshot {
  id
  jurisdiction
  sourceClass
  title
  instrumentOrPublicationId
  canonicalSource
  sourceVersionOrPointInTime
  retrievedAt

  madeAt? / publishedAt?
  commencement[]

  status
  supersedes[]
  amendedBy[]
  transitionRules[]

  completenessNote
  provenance
}
```

### Required semantics

`sourceVersionOrPointInTime`
: identifies the legal/guidance state actually used. A retrieval date alone is not enough where point-in-time source state is material.

`status`
: must distinguish at least current operative source, known future operative source, superseded/historical source and guidance publication state where relevant. “Published” must never imply “currently applicable”.

`transitionRules`
: explicit relations, not prose hidden in a source note.

`completenessNote`
: records whether the source view is consolidated/revised, original/enacted, or known to require material amendment instruments to reconstruct the target state.

The source object identifies authority. It does not contain project/site facts.

---

# 5. Applicability facts are separate objects

The DPL-05 rule remains binding:

> **A target describes external normative authority. Project and site facts determine whether and how that authority applies; they do not become part of the source definition.**

For the transition cases in this packet the minimum relevant fact set is conceptually:

```text
EnglandBuildingControlCaseFacts {
  jurisdiction
  workClass
  buildingClass
  hrbStatus

  controlRoute?
  noticeOrApplicationKind?
  noticeOrApplicationDate?
  noticeOrApplicationStatus?

  commencementDate?
  commencementEvidence?
}
```

Unknown values remain unknown.

Do not manufacture a date merely because target selection would otherwise remain unresolved.

## 5.1 Event identity matters

The source refers to legally meaningful events, not generic project milestones.

For example:

```text
"design started"
"planning application submitted"
"contractor appointed"
```

are not substitutes for a qualifying building notice, initial notice, building-control approval application with full plans, or statutory commencement event.

The applicability evaluator must consume the event type the governing transition actually names.

## 5.2 Evidence matters independently

A claimed commencement date is not self-proving.

DPL-03 evidence semantics remain canonical:

```text
fact claim:       work commenced on <date>
evidence state:   PRESENT / ACCEPTED / STALE / ...
obligation:       establish transition qualification
result:           PASS / UNRESOLVED / ...
```

The target-selection layer should therefore be able to report a conditional or unresolved result even where a date has been informally asserted but not admitted as evidence at the current assurance profile.

---

# 6. Two England target families must compose independently

DPL-09A freezes at least these two regulatory target families.

## 6.1 Technical / substantive family

Conceptual identity:

```text
ENGLAND_BUILDING_REGS_TECHNICAL
```

This family owns the substantive requirements and selected technical compliance/evidence routes later decomposed across Parts A–T and related regulations.

Its source state can be transition-sensitive.

For example, a qualifying project may legitimately remain on the pre-24-March-2027 F/L technical route while another project is subject to the 2026-amended requirements.

## 6.2 Process / dutyholder family

Conceptual identity:

```text
ENGLAND_BUILDING_REGS_PROCESS_DUTYHOLDER
```

This family owns statutory process/dutyholder/competence obligations applicable to the project under their own source and transition rules.

It is **not selected by copying the technical target's version label**.

This matters because the legal history is not one synchronized release train.

## 6.3 Forbidden shortcut

The following is invalid:

```text
technicalTarget = PRE_2027
therefore
processTarget = PRE_2027
```

unless an actual legal provision establishes that consequence.

Likewise, the following is invalid:

```text
technicalTarget = FHBS_2027
therefore
all England regulatory sources = 2027 edition
```

Different obligation families can legitimately be sourced from instruments with different dates and transition histories.

---

# 7. Target-selection result

DPL-09A does not create a new result vocabulary.

The DPL-03 lattice remains canonical.

Target selection should conceptually produce:

```text
RegulatoryTargetSelection {
  family
  selectedSourceComposition?
  applicability
  result
  reasons[]
  missingFacts[]
  sourceProvenance[]
  alternatives[]
}
```

Where:

- a fully determined applicable selection may support `PASS` **for the narrow selection obligation**;
- missing transition facts/evidence produce `UNRESOLVED`;
- an evaluator lacking authority/method to determine the source relation produces `UNSUPPORTED`;
- a family proven irrelevant to the case may be `NOT_APPLICABLE`;
- an old selection invalidated by later facts becomes historical / `SUPERSEDED` rather than silently overwritten.

A target-selection `PASS` says only:

> **the source/applicability question has been resolved for this case.**

It says nothing about whether the design complies with the selected technical obligations.

---

# 8. Temporal test cases

These examples prove the source/applicability semantics only. They are not whole-project legal determinations.

## Case A — work resolved wholly before the 2027 technical change

Assume a non-HRB new dwelling whose controlling technical source question is evaluated before the 2026 amendments come into force and no other source fact displaces the current route.

```text
technical family
  operative source state: pre-24-Mar-2027 regime
  selection: resolved

process/dutyholder family
  Part 2A source: operative since 1-Oct-2023
  selection: resolved independently
```

The existence of S.I. 2026/335 in the source registry does not make its future technical amendments currently operative.

## Case B — post-24-March-2027 notice/application

Assume non-HRB work where the relevant notice/application is first given/made on or after 24 March 2027 and no other saving provision applies.

```text
technical family
  2026 amendment family: operative
  old reg-5(1) transition: unavailable on the stated facts

process/dutyholder family
  evaluated independently against its current sources
```

Later DPL-09 packets determine the exact substantive F/L/etc. methods inside that selected technical target.

## Case C — qualifying pre-date notice/application + timely commencement

Assume:

- non-HRB work;
- qualifying building notice / initial notice / building-control approval application with full plans before 24 March 2027;
- work to which it relates commenced before 24 March 2028;
- no fact displacing the stated transition route.

Then regulation 5 of S.I. 2026/335 provides the material technical transition relation.

```text
technical family
  pre-2027 route retained where regulation 5 makes the 2026 amendments inapplicable

process/dutyholder family
  still evaluated independently
```

Do not describe this as “the project uses 2026 law” or “the project uses 2021 law” without identifying the exact source composition and transition relation.

## Case D — qualifying pre-date notice/application + commencement unknown

Assume the qualifying notice/application date is established but commencement has not yet occurred or cannot yet be evidenced.

The correct result is not a guessed target.

```text
technical target-selection obligation: UNRESOLVED

known alternatives:
  A — timely qualifying commencement → saved earlier technical route
  B — transition condition not met    → successor technical regime

missing fact/event:
  qualifying commencement before 24-Mar-2028
```

This is a first-class valid compiler state.

## Case E — qualifying pre-date notice/application + commencement too late

Assume the case relies only on the regulation 5(1) route and the relevant work does not commence before 24 March 2028.

The saved route cannot be treated as satisfied merely because the application was early.

The technical target must be re-evaluated against the successor regime and any other applicable savings/transition provisions.

## Case F — notice/application date or route itself unknown

If the project has not yet selected or evidenced the legally relevant building-control route/date, technical target selection may remain unresolved even when the intended construction date is known.

The missing fact must be surfaced explicitly rather than defaulting to the currently published or expected future standard.

---

# 9. Staleness, supersession and reproducibility

A deployment result must retain the source state against which it was produced.

Later source publication or amendment must not rewrite history.

Example:

```text
Compile X
  technical target composition: T-2026-10-20-A
  source set: exact identified snapshots
  method version: M-17
  case facts: F-42
  result: ...

Later:
  source amendment published

Compile X remains reproducible and historical.
New compile Y selects/re-evaluates against the new source state where applicable.
```

The project therefore needs four identities to remain separable, as DPL-05 already requires:

1. **external source identity/version**;
2. **target-model identity/version**;
3. **method implementation identity/version**;
4. **target composition identity/version** for the exact case.

Changing any one may require re-evaluation, but they must never be conflated.

## 9.1 Known future sources

A source may be:

- published/made;
- known to commence in future;
- not yet applicable to the current case.

The registry may retain it as a known future source without making it operative.

This is exactly the posture required for S.I. 2026/335 during October 2026.

## 9.2 Superseded results

When later facts prove an earlier conditional source selection wrong or stale:

- retain the old selection/result as provenance;
- mark it historical / `SUPERSEDED` under the existing result model;
- produce a new current selection from the updated facts/source state.

Do not mutate the historical result in place.

---

# 10. Source provenance required downstream

Every substantive DPL-09 child must be able to trace a requirement/method to its selected source chain.

At minimum:

```text
obligation
  ↓
legal / normative source snapshot
  ↓
applicability / transition relation
  ↓
selected compliance/evidence route
  ↓
guidance / standard / calculation / external evidence
  ↓
method identity
  ↓
result
```

Where a later packet uses an Approved Document, the record must still point back to the governing legal requirement and must identify the Approved Document edition/amendment state selected for that route.

A PDF filename such as `Approved Document L 2026` is not sufficient target identity.

---

# 11. Process / dutyholder boundary

DPL-09A intentionally admits statutory process obligations into deployment without pretending they are design geometry.

Potential process-family obligations include, where applicable:

- client arrangements for compliance;
- dutyholder appointment/role duties;
- competence requirements;
- prescribed notices/applications;
- declarations and completion/process evidence;
- other statutory procedural events required by the selected control route.

Their resolution method may legitimately be:

- documentary evidence;
- external professional declaration;
- statutory/building-control evidence;
- human determination;
- `UNSUPPORTED` where DPL has not admitted a reliable method.

A compiler can prove that required evidence is absent or present under a declared schema. It generally cannot prove that a human being possesses the legally required competence merely by storing their name.

---

# 12. Red-team findings

## 12.1 “Latest rules” fails

A project can legitimately be on a saved earlier technical route after a successor instrument has been made and even after it has commenced, depending on the transition conditions.

Therefore source freshness and case applicability are different questions.

## 12.2 “Application before cutoff” is insufficient

For the principal non-HRB 2026 transition in regulation 5(1), timely commencement is also material.

A target selector using only application date can produce a false legal regime.

## 12.3 “One England version” fails

Part 2A process/dutyholder duties and technical F/L transition history do not share one release label.

The target must compose independent families.

## 12.4 “Approved Document edition = law version” fails

Approved Documents are guidance routes and can have their own publication/correction history. Their edition identity is necessary but not sufficient legal provenance.

## 12.5 “Known future source = current target” fails

S.I. 2026/335 exists in October 2026 but its principal ordinary non-HRB amendments do not come into force until 24 March 2027.

The source model must represent future authority without activating it early.

## 12.6 “Consolidated webpage = complete source closure” can fail

Revised legislation services and official publication sets may incorporate changes on different schedules. The target must retain the material amending instrument/transition provenance where the proposition depends on it.

## 12.7 “Compiler selected the source, therefore compliant” fails

Source selection is only an applicability obligation.

It earns no substantive compliance conclusion for Parts A–T or any other requirement.

---

# 13. Why no executable registry is added in DPL-09A

A code/JSON target registry is deliberately deferred.

Reasons:

1. DPL-09A proves source/applicability semantics, not the final technical target schema.
2. DPL-09B+ will reveal which source fields recur across technical families and which are family-specific.
3. DPL-10A is simultaneously establishing a planning source/status spine; premature common code would risk forcing unlike authority systems into one structure.
4. DPL-12 remains intentionally blocked until the B1 concrete objects exist and are integrated.
5. The existing compiler has bounded target/provenance concepts but no release-grade England source registry that this packet merely needs to extend.

The smallest justified structured object at this stage is therefore the logical contract and test cases above.

A later machine representation should be derived from these contracts, not treated as their source of truth.

---

# 14. Consequences for DPL-09B+

Later England technical packets may now assume:

- exact source identity is required;
- applicability is evaluated from explicit case facts;
- transitions are explicit relations;
- unknown future events may leave target selection `UNRESOLVED`;
- technical and process/dutyholder families compose independently;
- guidance/standards remain downstream route/evidence sources;
- historic target selections are reproducible and never silently updated;
- native method coverage is independent of whether the underlying requirement applies.

They may **not** assume:

- one monolithic England target version;
- one Approved Document edition per calendar year;
- publication date equals applicability date;
- application date alone resolves all transitions;
- saved technical standards save unrelated process duties;
- compiler source selection proves compliance.

---

# 15. Non-claims

DPL-09A does **not** establish that:

- the Reference House complies with the Building Regulations;
- every amendment to S.I. 2010/2214 has now been encoded;
- all transition provisions are reducible to the one S.I. 2026/335 test case;
- Parts A–T have executable methods;
- Approved Documents are legal requirements;
- a building-control body would accept a later proposed route;
- the compiler can prove designer/contractor competence;
- HRB transition semantics are covered for the Reference House;
- planning policy has selected optional regulatory categories;
- DPL has created a new RH-C proof family.

---

# 16. Packet result

**DPL-09A result: PASS at its declared modelling scope.**

The England target can now ask a bounded source/applicability question without rediscovering basic legal chronology:

> **Which exact regulatory source composition applies to this obligation family, under these evidenced project events, and what remains unresolved?**

The answer may be resolved, conditional/unresolved, unsupported or not applicable under the existing DPL-03 semantics.

That is enough authority for later technical packets to begin from the correct legal/source state without pretending that source selection itself is technical compliance.

## Next gate

DPL-09A does **not** automatically open DPL-09B+.

Its result returns to the Wave-B1 integration sequence alongside DPL-10A and DPL-14A. The programme should decide the next technical-domain packet only after those B1 objects have also been proved and their shared source/site/applicability seams reviewed.
