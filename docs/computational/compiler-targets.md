# Compiler Targets — Conceptual v0.2

**Status:** conceptual foundation; target architecture exercised in the paper programme, no release-grade regulatory target implemented  
**Purpose:** define what a building is compiled *against* without mixing regulation, architectural preference, software capability and project facts into one rule set

## 1. A compile result needs a named normative environment

A house does not simply “comply with 2026”. Its obligations depend on jurisdiction, applicable legislation and amendments, dates and transitional provisions, building/work classification, selected compliance routes and the technical standards those routes rely on.

A release-capable compiler would package that external normative environment as a **versioned compiler target**.

> **A compile result is meaningless unless the target is named.**

## 2. Keep four configuration layers separate

Earlier work used “compiler target” too broadly. The useful model separates:

### A. Compiler target

The external normative environment: England, applicable Building Regulations snapshot, new dwelling, transitional basis, selected compliance routes and incorporated standards versions.

### B. Supported-domain profile

What the compiler itself knows how to establish: supported construction families, span ranges, roof forms, structural proof envelopes and service strategies.

### C. Architectural grammar

The selected design language: for example Georgian-derived grammar G-01 and its room, bay, opening, hierarchy and proportion rules.

### D. Project configuration

Facts and requirements particular to the job: site, ground evidence, climate/exposure, client brief, budget, room programme and chosen performance targets.

Conceptually:

~~~text
BUILD CONFIGURATION
    =
COMPILER TARGET
    +
SUPPORTED-DOMAIN PROFILE
    +
ARCHITECTURAL GRAMMAR
    +
PROJECT CONFIGURATION
    +
SOURCE BUILDING MODEL
~~~

The separation matters because a grammar preference, an unsupported condition and a legal failure should never acquire the same authority merely because all can block one workflow.

## 3. Targets are temporal

Regulation changes through amendments, new guidance and transitional provisions. A recently published document may not be the applicable basis for a project already inside an earlier regime.

Therefore:

> **“Use the latest rules” is not a valid target-selection algorithm.**

A target needs enough provenance to explain why its regulatory basis applies to the particular project.

## 4. Target anatomy

### Jurisdiction

Initial research target: **England**.

Not “UK”. Scotland, Wales and Northern Ireland require separate targets if supported later.

### Legal snapshot

The applicable legislation and amendments, including the Building Regulations 2010 as amended where relevant. A machine representation must preserve amendment history and applicability.

### Effective / transitional basis

Record dates, commencement conditions, transition provisions and project status that make the snapshot applicable. Superseded provisions may still govern a transitional project.

### Building / work classification

Examples include new dwelling, extension, alteration, material change of use and higher-risk building. A supported domain should cover only the classes it can defend.

### Requirement set

Which functional requirements apply: structure, fire, moisture, ventilation, sound, sanitation, energy, access, overheating, electrical safety and other applicable requirements. The actual set is target-dependent.

### Compliance-route selection

Legal functional requirements and Approved Documents are not the same thing. A target should state how each supported requirement is intended to be demonstrated: Approved Document route, calculation, referenced standard, tested/certified system, specialist engineering or explicit professional determination.

### Referenced standards set

Record the exact standard, edition and national parameters relied upon by the selected route. This is reference metadata, not permission to copy copyrighted standards into the repository.

### Official-source provenance

Useful metadata includes source title, issuer, identifier, edition, publication/effective dates, supersession, source URI where appropriate and the version of the machine-rule implementation.

## 5. Planning is a separate target family

Planning and Building Regulations are different legal and decision systems.

A project may also need planning constraints such as development-plan policy, conservation area, listed status, permitted development, design codes or site conditions, but these should not be folded into the building-control target.

A future build may combine:

~~~text
BUILDING-CONTROL TARGET
PLANNING TARGET
ENVIRONMENTAL / SITE TARGET
HSA / CLIENT PROJECT REQUIREMENTS
~~~

They retain different authorities and processes.

## 6. The building-control body is not the target

A local-authority building-control body or registered building-control approver reviews evidence and performs statutory functions. Its identity does not ordinarily change the substantive regulatory target.

A separate submission/review profile may still describe document packaging, naming, contacts, metadata and change-control procedures. That belongs downstream of the normative target.

## 7. Approved Documents are compliance guidance, not the law itself

Approved Documents provide statutory guidance and common ways of meeting functional requirements. They are therefore attractive supported routes for a bounded compiler.

The target should preserve the chain:

~~~text
LEGAL REQUIREMENT
      ↓
SELECTED COMPLIANCE STRATEGY
      ↓
GUIDANCE / STANDARD / CALCULATION / EVIDENCE
~~~

This keeps alternative compliant routes possible without pretending the guidance text *is* the legal requirement.

## 8. Standards create technical and rights problems

Technical standards are often textual, tabular, mathematical, conditional, cross-referenced and scope-limited. Formalising them is substantial work.

They are also commonly copyrighted and licensed. Buying access to a standard does not imply a right to redistribute its text as executable rules.

Possible future approaches include licensed machine-readable services, BSI SMART standards, APIs, rule implementations that reference but do not reproduce protected content, open standards where available and independently derived algorithms where lawful and properly verified.

This is a programme-level risk, not a documentation detail.

## 9. SMART standards may change the ingestion problem

BSI's work on Machine Applicable, Readable and Transferrable standards is strategically relevant. Authoritative structured semantics would be safer than reverse-engineering complex standards from PDFs.

Do not commit to a standards-ingestion architecture before understanding that ecosystem.

## 10. Target snapshots are immutable releases

Once Building Release B claims Target T, the meaning of T must not silently change.

If source guidance or a machine implementation changes, create T+1, preserve T, record supersession and decide explicitly whether existing projects should migrate.

The building should always be able to answer: **what exactly did this release compile against?**

## 11. Source version and rule-implementation version are different

Suppose source guidance edition 2026 is implemented as machine rule pack `RP-X-3`. Record both.

The authoritative source can stay unchanged while the machine implementation contains a bug. A corrected rule pack therefore needs its own version and regression history.

## 12. Targets need their own tests

Before trusting a machine rule pack, exercise it against known compliant cases, known failures, boundary cases, exceptions, cross-rule dependencies and historical regressions.

Where interpretation remains ambiguous, expose the ambiguity rather than manufacturing determinism.

## 13. Alternative compliance routes remain first-class

One requirement may legitimately admit several proof routes:

~~~text
Requirement Bx
   ├─ Route A: supported Approved Document rule set
   ├─ Route B: supported specialist calculation
   └─ Route C: EXTERNAL PROFESSIONAL EVIDENCE
~~~

The compiler is therefore not only a validator. It plans and tracks proof obligations.

## 14. Early targets will be incomplete

A target must declare its coverage explicitly.

~~~text
Target T-ENG-NDW-01

Coverage:
  Part A          supported within structural domain SF-01
  Part B          partial
  Part C          partial
  Part F          supported route F-DWELL-01
  Part L          supported route L-DWELL-02
  unusual fire engineering  unsupported
~~~

The system may report native resolution, external evidence required or unsupported. It must not claim regulatory coverage beyond what the target actually implements.

## 15. Site facts belong to project configuration

Radon, flood risk, wind exposure, ground bearing, local climate and neighbouring conditions may change which obligations apply, but they are facts about the site/project.

The target supplies the conditional rule; project evidence says whether the condition is true, false or unknown.

## 16. Product evidence belongs to the evidence graph

A lintel, membrane or ventilation unit brings its own performance and limitations. Those facts belong to product libraries, assembly families, project selections and evidence records.

The target may require a performance level. It should not ordinarily hard-code a commercial product.

## 17. HSA project requirements are not regulation

HSA-derived project requirements may be stricter than regulation and should remain independently reportable.

~~~text
REGULATORY PASS
HSA PROJECT REQUIREMENT FAIL
~~~

That is useful information. Collapsing the two would make it impossible to tell whether a design is unlawful or simply fails an architectural requirement selected by the project.

A pattern reference or HSA provenance never upgrades project authority into regulation, engineering or product evidence.

## 18. Conceptual build manifest

~~~text
Build configuration: HOUSE-R01

Target:
  jurisdiction: England
  building class: new dwelling
  regulatory snapshot: T-ENG-NDW-2026-A
  transition basis: REG-BASIS-01
  compliance route pack: CRP-04

Supported domain:
  DOMAIN-HOUSE-01

Architectural grammar:
  G-01

Project:
  SITE-S17
  BRIEF-B04
  ASSUMPTIONS-A12

Source model:
  HOUSE-MODEL-V23
~~~

Every compile output should retain this identity.

## 19. England-target research requirements

A release-grade England target would still need:

1. a tightly bounded new-dwelling case;
2. mapping of applicable functional requirements;
3. exact Approved Document editions and transitional conditions;
4. realistically formalizable compliance routes;
5. incorporated British/European standards and licensing constraints;
6. conditions requiring specialist engineering;
7. applicability tests;
8. known-pass/known-fail conformance examples;
9. review by competent regulatory practitioners;
10. supersession and migration rules between target versions.

The H1 paper target work exercised the architecture of these concerns. It did not produce a release-grade regulations engine.

## 20. Applied S0 target fixture

[S0 Compiler Target Snapshot — England / 2026-10-03](s0-target-snapshot.md) exercises the target architecture against three awkward realities at once:

- published future guidance that is not yet the applicable basis for the assumed project date;
- an amendment in force but subject to transition;
- deliberately partial compiler coverage of a wider source target.

It is a provenance/target-architecture test, not a complete encoded compliance route.

P0 did not add regulatory rule-pack implementation; it exercised the lower-level semantic, obligation and evidence mechanisms.

## 21. Current definition

Use **compiler target** narrowly:

> **A named, immutable, versioned representation of the external normative environment against which defined claims are compiled.**

It is not the container for every preference, product, capability and project fact.

Generic target/rule-pack expansion is not currently authorised. External building-control/fire review should first test whether these boundaries and interpretations are professionally sound.

---

## External anchors

- UK Government, Building Regulations 2010: https://www.legislation.gov.uk/uksi/2010/2214
- UK Government, Approved Documents: https://www.gov.uk/government/collections/approved-documents
- UK Government, Future Homes and Buildings Standards Building Circular 01/2026: https://www.gov.uk/government/publications/the-future-homes-and-buildings-standards-building-circular-012026
- UK Government, building-regulations circulars: https://www.gov.uk/government/collections/building-regulations-circulars
- UK Government, Single Construction Regulator government response and digital building-control direction: https://www.gov.uk/government/consultations/single-construction-regulator-prospectus/outcome/single-construction-regulator-prospectus-government-response
- BSI, PAS 1958:2026 — Built environment data and information standards landscape: https://knowledge.bsigroup.com/products/built-environment-data-and-information-standards-landscape-guide
- BSI Annual Report 2025, SMART standards programme: https://www.bsigroup.com/siteassets/pdf/en/about-us/gl-grp-cross-govn-os-ot-nsp-mp-01annualreportandaccounts2025-0026.pdf