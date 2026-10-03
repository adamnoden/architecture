# Compiler Targets — Conceptual v0.1

**Status:** foundational research draft  
**Purpose:** define what a building is compiled *against* without mixing regulation, architectural taste, software capability and project facts into one undifferentiated rule set.

## 1. The concept

A house does not simply “comply with 2026”.

It exists within a specific normative environment.

That environment depends on:

- jurisdiction;
- the legislation and amendments applicable to the work;
- date and transitional provisions;
- building/work classification;
- the compliance routes selected for applicable functional requirements;
- referenced technical standards and national parameters.

The future compiler should package that external normative environment as a **versioned compiler target**.

> **A compile result is meaningless unless the target is named.**

## 2. Do not overload the target

The first concept paper used “compiler target” broadly.

That analogy is useful, but it should now be made precise.

Four separate configuration layers should exist conceptually.

### A. Compiler target

External normative environment.

Examples:

- England;
- applicable Building Regulations snapshot;
- new dwelling;
- applicable transitional basis;
- selected compliance routes;
- incorporated standards versions.

### B. Supported-domain profile

What the compiler itself knows how to prove.

Examples:

- supported masonry wall families;
- supported engineered-timber floor spans;
- permitted roof forms;
- structural proof envelopes;
- service strategies.

### C. Architectural grammar

The selected architectural language.

Examples:

- Georgian-derived grammar G-01;
- allowed room/bay/opening relationships;
- hierarchy and proportional rules.

### D. Project configuration

Facts and requirements particular to the project.

Examples:

- site;
- ground investigation;
- climate/exposure data;
- client brief;
- budget;
- room programme;
- chosen performance targets.

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

Keeping these separate prevents regulatory authority from being confused with architectural preference.

## 3. Why targets must be versioned

Building regulation is temporal.

A current guidance document may differ from the version applicable to work already within a transitional regime.

As of 2026, England is actively changing several Approved Documents and the Future Homes and Buildings Standards have introduced further amendments. Earlier guidance may remain relevant to projects falling under earlier regulatory standards.

Therefore:

> **“Use the latest rules” is not a valid target-selection algorithm.**

The target needs to identify the actual regulatory basis applicable to the project.

## 4. Target anatomy

A target should eventually identify at least the following.

### Jurisdiction

For the initial research:

**England**

Not “UK”.

Scotland, Wales and Northern Ireland must be separate targets if ever supported.

### Legal snapshot

The applicable primary/secondary legislation and amendments.

For England this includes the Building Regulations 2010 as amended, but the exact future machine representation must preserve amendment history and applicability.

### Effective / transitional basis

The target must explain why this regulatory snapshot applies.

Potential data:

- relevant work/application dates;
- commencement conditions;
- transitional provisions;
- project status;
- superseded provisions that remain applicable.

### Building/work classification

Examples:

- new dwelling;
- material change of use;
- extension;
- alteration;
- higher-risk building, where applicable.

The first supported domain should be much narrower than the universe of categories.

### Requirement set

Which functional requirements apply.

Examples:

- structure;
- fire;
- moisture;
- ventilation;
- sound;
- sanitation;
- energy;
- access;
- overheating;
- electrical safety;
- EV charging infrastructure;
- gigabit-ready infrastructure;
- toilet accommodation, as applicable.

The list is illustrative and target-version-dependent.

### Compliance-route selection

A functional legal requirement and a published Approved Document are not the same thing.

The target should identify the route by which compliance is intended to be demonstrated.

Possible route classes:

- Approved Document prescriptive/common route;
- calculation route;
- referenced standard route;
- tested/certified system;
- specialist engineered alternative;
- explicit human/professional determination.

A future target might mix routes across requirements.

### Referenced standards set

The exact technical standards/version/national annex relied upon by selected routes.

This should be reference metadata, not a pirated copy of copyrighted standard text.

### Official-source provenance

Every target rule should point back to its source/version where licensing permits.

Potential metadata:

- source title;
- issuer;
- identifier;
- version/edition;
- publication date;
- effective date;
- supersession information;
- source URI where appropriate;
- machine-rule implementation version.

## 5. Target is not planning

Town and country planning is a different legal/decision system from Building Regulations.

The project may eventually support planning constraints such as:

- local development plan;
- conservation area;
- listed status;
- permitted development;
- design codes;
- site-specific conditions.

But they should not be quietly mixed into the Building Regulations target.

A future architecture may use separate target families:

~~~text
BUILDING-CONTROL TARGET
PLANNING TARGET
ENVIRONMENTAL / SITE TARGET
CLIENT / DOCTRINE PROFILE
~~~

A build may need all of them.

They have different authorities and decision processes.

## 6. Target is not the building-control body

A local authority building control body or registered building control approver reviews evidence and performs statutory functions.

Their identity should not ordinarily redefine the substantive regulatory target.

However, a future workflow may need a separate **submission/review profile** describing:

- document packaging;
- naming;
- expected evidence structure;
- submission metadata;
- project contacts;
- change-control procedures.

That is downstream delivery configuration, not the core normative target.

## 7. Approved Documents

Approved Documents are statutory guidance describing ways of meeting the Building Regulations.

They contain:

- general guidance;
- expected performance;
- practical examples and solutions for common situations.

They are therefore excellent candidates for supported compliance routes in a bounded compiler.

But the system should never encode the false proposition:

> Approved Document requirement = legal functional requirement.

The target must preserve:

~~~text
LEGAL REQUIREMENT
      ↓
SELECTED COMPLIANCE STRATEGY
      ↓
GUIDANCE / STANDARD / CALCULATION / EVIDENCE
~~~

This also allows alternative solutions to exist without corrupting the model.

## 8. British and other technical standards

Standards present two distinct problems.

### Technical problem

Requirements may be:

- textual;
- tabular;
- mathematical;
- conditional;
- cross-referenced;
- scope-limited;
- dependent on other standards.

Their machine representation is a substantial research problem.

### Rights/licensing problem

Many British Standards are copyrighted and licensed.

The project must not assume that buying a PDF creates a right to redistribute the standard as executable source code.

Possible future strategies to investigate:

- licensed machine-readable standards services;
- BSI SMART standards;
- APIs;
- rule implementations that reference but do not reproduce protected content;
- open standards where available;
- independently derived algorithms where legally appropriate and properly verified.

This is a first-class programme risk.

## 9. SMART standards are strategically relevant

BSI reports active work on standards that are **Machine Applicable, Readable and Transferrable (SMART)**.

That direction matters because the compiler-target problem becomes materially easier if authoritative standards are distributed with reliable structured semantics rather than reverse-engineered from PDFs.

The project should monitor this area before designing its standards ingestion architecture.

## 10. Target snapshots should be immutable

Once a building release claims compilation against Target T, the meaning of T should not silently mutate.

If source guidance or a rule implementation changes:

- create Target T+1;
- preserve T;
- record supersession;
- explain whether existing projects should migrate.

This is analogous to dependency lockfiles and reproducible software builds.

A building designed five years ago must still be able to answer:

> what exactly did we compile against?

## 11. Rule implementation version is distinct from source version

Suppose Approved Document X version 2026 is formalised into machine rule pack RP-X-3.

The target must record both:

- **source authority/version**;
- **machine interpretation implementation/version**.

Why?

Because a bug can exist in the implementation even if the source document did not change.

A corrected rule pack should therefore be independently versionable.

This also enables validation suites for rule implementations.

## 12. Target validation

A target itself should have conformance tests.

Before it can be trusted, its machine rule pack should be tested against:

- known compliant examples;
- known non-compliant examples;
- boundary cases;
- exceptions;
- cross-rule dependencies;
- historical regression cases.

Where interpretation remains ambiguous, the target should expose that ambiguity rather than inventing false determinism.

## 13. Alternative compliance routes

The target model should not force one route when several legitimate routes exist.

Conceptually:

~~~text
Requirement Bx
   ├─ Route A: supported Approved Document rule set
   ├─ Route B: supported specialist calculation
   └─ Route C: EXTERNAL PROFESSIONAL EVIDENCE
~~~

This implies the compiler is not merely a validator.

It is also a planner of proof obligations.

## 14. Machine-readable target incompleteness

No early target is likely to formalise an entire regulatory system.

Therefore targets need explicit coverage declarations.

Example:

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

A compile cannot claim “regulatory compliance” beyond target coverage.

It can instead report:

- natively resolved;
- external evidence required;
- unsupported.

## 15. Site facts do not belong in target

Examples:

- radon;
- flood risk;
- wind exposure;
- ground bearing;
- local climate;
- neighbouring conditions.

These can affect applicable obligations.

But they belong in **project/site configuration**, not the jurisdictional target itself.

The target supplies the rule:

> if condition X, obligation Y applies.

The project supplies whether condition X is true or unknown.

## 16. Product evidence does not belong in target

A selected lintel, membrane or ventilation unit may carry evidence and limitations.

That belongs to:

- product library;
- assembly family;
- project selection;
- evidence graph.

The target may require certain performance.

It should not usually hard-code one commercial product.

## 17. Architectural doctrine does not belong in target

The Long-Life House doctrine is project/architectural governance.

It may be stricter than regulation.

Its obligations should remain distinguishable:

~~~text
REGULATORY PASS
DOCTRINE FAIL
~~~

That result is meaningful.

If the two are collapsed, it becomes impossible to explain whether a rejected design is illegal or merely outside our architectural system.

## 18. Example conceptual build manifest

~~~text
Build configuration: HOUSE-R01

Target:
  jurisdiction: England
  building class: new dwelling
  regulatory snapshot: T-ENG-NDW-2026-A
  transition basis: declared in REG-BASIS-01
  compliance route pack: CRP-04

Supported domain:
  DOMAIN-HOUSE-01

Architectural grammar:
  GRAMMAR-GEORGIAN-01

Project:
  SITE-S17
  BRIEF-B04
  ASSUMPTIONS-A12

Source model:
  HOUSE-MODEL-V23
~~~

Every compile output should carry this identity.

## 19. England-first research backlog

Before a real England target can exist:

1. map the applicable Building Regulations functional requirements for a tightly defined new-dwelling case;
2. map current 2026 Approved Document editions and transitional conditions;
3. identify which compliance routes are realistically formalizable;
4. map incorporated British/European standards;
5. identify licensing and access constraints;
6. determine which rules need specialist engineering rather than prescriptive automation;
7. create applicability tests;
8. build known-pass/known-fail conformance examples;
9. have target interpretation reviewed by competent regulatory practitioners;
10. define how later amendments supersede but do not erase older targets.

## 20. Current conclusion

The phrase **compiler target** survives scrutiny, but only if used carefully.

It should mean:

> **a named, immutable, versioned representation of the external normative environment against which defined claims are compiled.**

It should not mean:

> every preference and fact associated with the project.

That separation makes the compiler metaphor substantially stronger.

## External anchors

- UK Government, Building Regulations 2010: https://www.legislation.gov.uk/uksi/2010/2214
- UK Government, Approved Documents: https://www.gov.uk/government/collections/approved-documents
- UK Government, Future Homes and Buildings Standards Building Circular 01/2026: https://www.gov.uk/government/publications/the-future-homes-and-buildings-standards-building-circular-012026
- UK Government, building-regulations circulars: https://www.gov.uk/government/collections/building-regulations-circulars
- UK Government, Single Construction Regulator government response and digital building-control direction: https://www.gov.uk/government/consultations/single-construction-regulator-prospectus/outcome/single-construction-regulator-prospectus-government-response
- BSI, PAS 1958:2026 — Built environment data and information standards landscape: https://knowledge.bsigroup.com/products/built-environment-data-and-information-standards-landscape-guide
- BSI Annual Report 2025, SMART standards programme: https://www.bsigroup.com/siteassets/pdf/en/about-us/gl-grp-cross-govn-os-ot-nsp-mp-01annualreportandaccounts2025-0026.pdf
