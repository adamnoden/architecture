# S0 Compiler Target Snapshot — England / 2026-10-03 v0.1

**Status:** research fixture — authoritative-source map, not a complete compliance rule pack  
**Snapshot date:** 3 October 2026  
**Purpose:** make the compiler-target concept concrete for Domain S0 by freezing a narrow England/new-dwelling normative basis and explicitly separating documents that are published from documents that are applicable under the assumed project dates.  
**Legal status:** this is a research model of a target, not building-control advice or a declaration of compliance.

> **The point of the fixture is provenance and applicability, not to pretend the regulations have already been fully encoded.**

## 1. Assumed project basis

For this target fixture only, assume:

- jurisdiction: England;
- work: erection of a new detached dwelling;
- ordinary non-higher-risk-building work;
- building-control application basis: hypothetical application made **3 October 2026**;
- no entitlement to earlier transitional treatment from an application made before that date;
- S0 covers only one wall/window/floor/service slice, not whole-house regulatory compliance.

If any of those facts change, target selection/applicability must be re-evaluated.

## 2. Why the date matters

The target cannot be named simply **England.NewDwelling.2026** because several regulatory/guidance generations coexist.

On the snapshot date:

- 2026 Future Homes/Buildings Part L/F guidance has been published;
- for non-HRB work, the associated 2026 changes come into force on **24 March 2027**, subject to transition provisions;
- therefore the current pre-2027 L/F guidance remains the relevant starting point for this hypothetical 3 October 2026 application;
- Approved Document B's **2026 amendments took effect on 30 September 2026**, also subject to their own transition provisions.

This is exactly the problem compiler targets are intended to solve.

## 3. Target identity

Provisional identifier:

~~~text
T-ENG-NDW-2026-10-03-S0
~~~

Meaning:

- ENG — England;
- NDW — new dwelling;
- date — target applicability snapshot;
- S0 — deliberately partial coverage for the paper-compilation fixture.

This identifier should be immutable once used by a released research compile.

A changed interpretation/source creates a new target version.

## 4. Legal source layer

The ultimate legal source is the **Building Regulations 2010 as amended**, together with other applicable legislation.

The Approved Documents are guidance on ways of meeting requirements.

The target must preserve:

~~~text
LEGAL REQUIREMENT
      ↓
SELECTED COMPLIANCE / EVIDENCE ROUTE
      ↓
GUIDANCE / STANDARD / CALCULATION / TEST / DETERMINATION
~~~

S0 does not yet formalise the complete Regulations.

The purpose of this document is to define the source snapshot and partial route coverage needed for the fixture.

## 5. Approved Document source snapshot

### Part A — Structure

**Source for S0 target:** Approved Document A: Structure, published 2013.

GOV.UK describes the current edition as covering:

- loadings;
- foundations;
- walls;
- floors;
- roofs;
- chimneys.

### Part B — Fire safety

**Source for S0 target:** Approved Document B Volume 1: Dwellings, 2019 edition incorporating 2020, 2022, 2025 and **2026 amendments** as applicable to the snapshot basis.

The 2026 amendment package took effect on 30 September 2026.

Its headline second-stair changes concern taller blocks of flats and are not expected to control the low-rise detached S0 condition.

However, the target must still pin the correct document generation rather than silently use an earlier PDF.

Future 2029 amendments shown in collated online documents are **not** treated as effective merely because they are visible in the same publication.

### Part C — Site preparation and resistance to contaminants and moisture

**Source for S0 target:** Approved Document C, published 2013.

Relevant S0 interest:

- resistance of walls/floors/roofs to moisture;
- ground/site obligations remain largely outside the wall-bay slice.

### Part E — Resistance to sound

**Source for S0 target:** Approved Document E, published 2015.

Relevant S0 interest:

- floor/wall acoustic relationships where applicable;
- S0 does not claim whole-dwelling acoustic conformance.

### Part F — Ventilation

**Source for snapshot:** Approved Document F Volume 1: Dwellings, **2021 edition**, current guidance introduced in 2021/2022.

The separate **2026 edition is published but not yet the governing Future Homes/Buildings target for this assumed non-HRB application date**.

The 2026 changes are scheduled to come into force for non-HRB work on 24 March 2027, subject to transition rules.

### Part L — energy / thermal performance

**Source for snapshot:** Approved Document L, Conservation of fuel and power, Volume 1: Dwellings, **2021 edition incorporating 2023 amendments**.

The 2026 Approved Document L has been published, but for this assumed application date the pre-2027 route remains the target starting point.

Relevant S0 interest:

- wall/window thermal boundary;
- junctions/thermal bridging;
- opening effects;
- S0 cannot establish whole-dwelling Part L compliance.

### Part O — Overheating

Approved Document O applies to new residential buildings.

It belongs to the whole-building target environment.

**S0 coverage:** not evaluated in the wall-bay paper compile, because overheating is fundamentally a whole-dwelling/site/opening problem rather than a proposition that can be proved from one isolated bay.

The source remains registered so omission is explicit.

### Part P — Electrical safety

**Source:** Approved Document P, current page published 2013.

S0 exercises only:

- service-routing interaction with structure/permanent fabric;
- boundary treatment of a penetration.

Electrical design, inspection/testing and full Part P conformance remain external to S0.

## 6. S0 coverage versus source applicability

A document being part of the target does not mean S0 implements all of it.

| Source area | In target source map | S0 native rule coverage v0.1 | S0 treatment |
|---|---|---|---|
| A Structure | Yes | Semantic only | structural topology + external/native-proof placeholder |
| B Fire | Yes | Very partial | applicable junction/lining/penetration obligations exposed; no whole-house claim |
| C Moisture | Yes | Partial semantic | wall wetting/drainage/moisture strategy obligation |
| E Sound | Yes | Partial semantic | boundary role/evidence placeholder |
| F Ventilation | Yes | No substantive S0 proof | registered, whole-system obligations outside slice |
| L Energy | Yes | Partial semantic | thermal-boundary/junction obligations; no whole-house energy claim |
| O Overheating | Yes | None | explicitly outside S0 proof coverage |
| P Electrical | Yes | Interaction only | circuit safety/design external; penetration/routing interaction modelled |

This table is a coverage declaration, not a legal interpretation of every applicable regulation.

## 7. Target result language

S0 must never output:

> **Building Regulations compliant**

as a blanket result.

Permitted result shape:

~~~text
Target:
  T-ENG-NDW-2026-10-03-S0

Coverage:
  Structure topology       PARTIAL
  Fire junction semantics  PARTIAL
  Moisture boundary        PARTIAL
  Acoustic boundary        PARTIAL
  Thermal boundary         PARTIAL
  Ventilation              NOT EVALUATED
  Overheating              NOT EVALUATED
  Electrical circuit       EXTERNAL

Result:
  S0 TARGET OBLIGATIONS WITHIN DECLARED COVERAGE: ...
~~~

This forces claims to remain bounded.

## 8. Rule-source record

Each future S0 rule should contain source provenance such as:

- requirement area;
- source document;
- edition/amendment;
- effective basis;
- paragraph/table/standard reference where licensing permits;
- interpretation note;
- machine-rule implementation version;
- conformance tests.

The repo should not copy protected standards text merely to make the rules convenient.

## 9. Transition record

The target should preserve why a source version was selected.

### L/F transition record

For this research fixture:

- 2026 L/F documents published 24 March 2026;
- Future Homes/Buildings amendments for non-HRB work come into force 24 March 2027;
- hypothetical S0 application date = 3 October 2026;
- therefore the fixture pins the earlier current technical guidance for L/F.

### B transition record

For this research fixture:

- 2026 Approved Document B amendments took effect 30 September 2026;
- hypothetical application = after that date;
- no assumed pre-30-September application;
- fixture pins the B document state including applicable 2026 amendments.

This record is more important than a filename.

## 10. Source state versus target state

The web may show a collated document containing:

- amendments already effective;
- amendments effective later.

The compiler target must not equate:

> text visible in source file

with:

> rule effective for this project.

Each rule requires its own effective/applicability state.

This is a critical target-system requirement discovered by the fixture.

## 11. Standards referenced by guidance

Approved Documents frequently rely on British/European standards and other technical documents.

S0 v0.1 should **not** claim complete standards coverage.

Instead:

- preserve standards references as external dependencies;
- identify which obligation needs the standard;
- record exact version when known;
- mark rule implementation as incomplete until licensing/technical formalisation is resolved.

This is particularly important for structural design, fire classifications, acoustics, electrical work and test methods.

## 12. S0 target obligations exercised

The paper compilation should use the target to create at least these categories.

### TAR-A

Structural adequacy obligation exists for:

- floor support;
- opening head;
- connections/reactions.

Resolution may remain external.

### TAR-B

Any applicable fire/lining/cavity/penetration consequence at the chosen S0 junction must be identified.

If applicability cannot yet be determined from the partial model:

- UNRESOLVED applicability;
- do not guess.

### TAR-C

The wall/window/floor assembly must have an explicit moisture-resistance/drainage strategy.

### TAR-E

Any acoustic role represented in S0 must have a declared evidence route or be explicitly project-only rather than falsely attributed to regulation.

### TAR-L

The external wall/window/junction participates in the thermal envelope and creates thermal obligations.

S0 does not produce the whole-dwelling calculation.

### TAR-P

Electrical routing/penetration must not undermine structure or relevant building boundaries.

Full electrical design/test remains external.

## 13. What S0 teaches about compiler targets

This small exercise already demonstrates several target requirements.

### Targets are temporal

Publication date, effective date and project transition are separate.

### Target selection uses project facts

Application/start dates can affect applicable generations.

### A source document can contain future rules

Rule-level applicability is required.

### Coverage is independent of source scope

The target may know the whole source exists while the compiler implements only a small verified subset.

### “Current” is not enough

A reproducible building release needs a named immutable snapshot.

## 14. Future target migration test

A later research exercise should compile the same S0 source against a future target representing the 2026 Future Homes/Buildings standards after their commencement.

Expected result:

- source building stays the same;
- target changes;
- affected obligations become stale/re-evaluated;
- unaffected doctrine/grammar obligations remain current;
- differences are reported explicitly.

That would be a powerful demonstration of the compiler architecture.

## 15. Anti-drift rules

- **“2026 edition means it applies to every project in 2026.”**  
  No. effective/transitional basis matters.

- **“The latest PDF is the target.”**  
  No. a collated document may contain future amendments.

- **“S0 passed, therefore the dwelling complies.”**  
  No. S0 has deliberately partial coverage.

- **“Approved Document rule = statutory requirement.”**  
  No. the legal requirement and selected guidance route remain distinct.

- **“Anything not implemented is assumed fine.”**  
  No. outside coverage is explicit.

- **“The target includes G-01 and Long-Life House rules.”**  
  No. those are separate authorities.

## 16. Next target work

Before a release-grade whole-house H1 target:

1. map all applicable functional requirements for the exact H1 dwelling class;
2. formalise transition/applicability inputs;
3. map selected Approved Document routes;
4. map every referenced standard/version;
5. establish standards access/licensing strategy;
6. create rule-level provenance;
7. build known-pass/known-fail/exception conformance cases;
8. obtain competent regulatory review;
9. test migration across at least one real amendment boundary.

S0 needs only enough of that architecture to exercise provenance and applicability honestly.

---

## Authoritative source anchors

- Building Regulations / Approved Documents collection: https://www.gov.uk/government/collections/approved-documents
- Approved Document A — Structure: https://www.gov.uk/government/publications/structure-approved-document-a
- Approved Document B — Fire safety: https://www.gov.uk/government/publications/fire-safety-approved-document-b
- Approved Document C — Site preparation and resistance to contaminants and moisture: https://www.gov.uk/government/publications/site-preparation-and-resistance-to-contaminates-and-moisture-approved-document-c
- Approved Document E — Resistance to sound: https://www.gov.uk/government/publications/resistance-to-sound-approved-document-e
- Approved Document F — current/pre-Future-Homes guidance: https://www.gov.uk/government/publications/ventilation-approved-document-f
- Approved Document F 2026: https://www.gov.uk/government/publications/approved-document-f-2026
- Approved Document L — 2021 edition incorporating 2023 amendments: https://www.gov.uk/government/publications/conservation-of-fuel-and-power-approved-document-l
- Approved Document L 2026: https://www.gov.uk/government/publications/approved-document-l-2026
- Approved Document O — Overheating: https://www.gov.uk/government/publications/overheating-approved-document-o
- Approved Document P — Electrical safety: https://www.gov.uk/government/publications/electrical-safety-approved-document-p
- Future Homes and Buildings Standards Building Circular 01/2026: https://www.gov.uk/government/publications/the-future-homes-and-buildings-standards-building-circular-012026
