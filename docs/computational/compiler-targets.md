# Compiler Targets

A compile result needs a named normative environment.

A house does not simply “comply with 2026”. Its obligations depend on jurisdiction, applicable legislation and amendments, dates and transitional provisions, building/work classification, selected compliance routes and the standards or evidence those routes rely on.

A **compiler target** is therefore:

> **A named, immutable, versioned representation of the external normative environment against which defined claims are compiled.**

It should not become a container for architectural preference, software capability, product choice and project facts.

## Keep four configuration layers separate

### Compiler target

The external normative environment: jurisdiction, applicable regulatory snapshot, building/work class, transition basis, selected compliance route and incorporated standards/methods.

### Supported-domain profile

What Metamorph Compiler legitimately knows how to represent or establish: supported geometry, semantic relationships, method families and proof envelopes.

### Architectural grammar

The selected design language, such as G-01, with its own architectural authority.

### Project configuration

Facts and requirements particular to the job: site, ground evidence, climate/exposure, brief, budget, programme and chosen performance targets.

Conceptually:

```text
BUILD CONFIGURATION
    =
COMPILER TARGET
    +
SUPPORTED DOMAIN
    +
ARCHITECTURAL GRAMMAR
    +
PROJECT CONFIGURATION
    +
SOURCE BUILDING MODEL
```

The separation matters because a grammar deviation, an unsupported technical condition and a legal failure are not the same kind of fact even if each blocks one workflow.

## Targets are temporal

Regulation changes through amendments, new guidance and transitional provisions. A recently published document may not be the applicable basis for a project already inside an earlier regime.

> **“Use the latest rules” is not a valid target-selection algorithm.**

A target needs enough provenance to explain why its regulatory basis applies to the project being evaluated.

## Target anatomy

### Jurisdiction

The first relevant jurisdiction for Ovid’s House is **England**, not “the UK”. Scotland, Wales and Northern Ireland have distinct regulatory systems and would require their own targets.

### Legal snapshot

The applicable legislation and amendments, including the Building Regulations 2010 as amended where relevant. Applicability and amendment history matter.

### Effective / transitional basis

Record commencement dates, transition provisions and project status sufficient to establish why the snapshot applies. Superseded provisions may still govern a transitional project.

### Building / work classification

Examples include new dwelling, extension, alteration and material change of use. A supported target should only claim the classes it can defend.

### Requirement set

Which functional requirements apply: structure, fire, moisture, ventilation, sound, sanitation, energy, access, overheating, electrical safety and others as relevant.

### Compliance-route selection

Legal functional requirements and Approved Documents are not the same thing. The target should state how each supported requirement is intended to be demonstrated: selected Approved Document route, calculation, referenced standard, tested/certified system, specialist engineering or explicit professional determination.

### Referenced standards

Record exact standard identities, editions and national parameters relied upon by the selected route. Reference metadata is not permission to copy protected standards into executable form.

### Source provenance

Useful metadata includes source title, issuer, identifier, edition, publication/effective dates, supersession and authoritative source location.

## Planning is a separate target family

Planning and Building Regulations are different legal and decision systems.

A real project may also need to represent development-plan policy, conservation-area constraints, listed status, permitted-development conditions, local design codes or site-specific planning obligations.

Those should not be folded into the building-control target merely because both affect whether a project can proceed.

Conceptually:

```text
BUILDING-CONTROL TARGET
PLANNING / SITE TARGETS
SUPPORTED DOMAIN
ARCHITECTURAL GRAMMAR
PROJECT REQUIREMENTS
```

Their authorities remain distinct.

## The reviewing body is not the target

A local-authority building-control body or registered building-control approver performs statutory review functions. Its identity does not ordinarily redefine the substantive regulatory target.

Submission packaging, contacts, naming conventions and review correspondence belong to a downstream process profile rather than the normative target itself.

## Approved Documents are guidance, not the law itself

Approved Documents provide statutory guidance and common ways of meeting functional requirements. They are attractive bases for bounded machine methods precisely because they provide explicit routes.

The semantic chain should remain:

```text
LEGAL REQUIREMENT
      ↓
SELECTED COMPLIANCE STRATEGY
      ↓
GUIDANCE / STANDARD / CALCULATION / EVIDENCE
```

This preserves the possibility of alternative compliant routes and prevents guidance text from being silently promoted into the legal requirement itself.

## Standards create technical and rights constraints

Technical standards are often textual, tabular, mathematical, conditional, scope-limited and cross-referenced. Formalising them is substantial technical work.

They are also commonly copyrighted and licensed. Access to a standard does not imply a right to redistribute its text as executable rules.

Possible legitimate approaches include:

- licensed machine-readable services;
- structured SMART-standard sources;
- rule implementations that reference but do not reproduce protected text;
- open standards where available;
- independently derived algorithms where lawful and properly verified.

The standards-ingestion architecture should follow the authoritative ecosystem rather than be invented prematurely.

## Source version and implementation version are different

Suppose one guidance edition is implemented as machine method `M-3`.

Record both the source edition and the method implementation version. The authoritative source can remain unchanged while the software implementation contains a bug. A corrected implementation therefore needs its own identity and regression history.

This distinction applies equally to calculation methods, table transcriptions and formalised interpretation rules.

## Targets and methods need tests

Before trusting an encoded method, exercise it against:

- known passing examples;
- known failures;
- exact boundary cases;
- exceptions;
- applicability changes;
- cross-rule dependencies;
- regressions.

Where authoritative interpretation remains ambiguous, expose the ambiguity or require competent determination rather than manufacturing determinism.

## Alternative compliance routes remain first-class

A requirement may legitimately admit several proof routes:

```text
REQUIREMENT R
   ├─ supported guidance method
   ├─ supported specialist method
   └─ external professional evidence
```

The computational system therefore tracks proof routes rather than pretending one encoded path exhausts all legal means of compliance.

## Coverage must be explicit

A target or target-linked method set may cover only part of the wider regulatory environment.

For example:

```text
TARGET T
  private-stair numeric method    SUPPORTED
  structural capacity             EXTERNAL
  novel fire engineering          UNSUPPORTED
  whole-building approval         NOT A MACHINE CLAIM
```

The system can report native resolution, accepted external evidence or unsupported scope. It must not advertise regulatory coverage beyond what has actually been implemented and validated.

## Site facts belong to project configuration

Radon, flood risk, wind exposure, ground bearing, local climate and neighbouring conditions may affect which requirements apply. They are nevertheless facts about the project/site.

The target supplies conditional logic. Project evidence says whether the relevant condition is true, false or unknown.

## Product evidence belongs to the evidence graph

A lintel, membrane, ventilation unit or other product brings declared performance and limitations. Those belong to product/system records and evidence scope.

A target may require a performance level. It should not ordinarily hard-code one commercial product.

## Ovid’s House requirements are not regulation

Project requirements derived from Ovid’s House may be stricter than regulation and should remain independently reportable.

```text
REGULATORY METHOD           PASS
OVID’S HOUSE REQUIREMENT    FAIL
```

That distinction is useful. Collapsing the two would make it impossible to tell whether a design violates law or simply fails an architectural commitment chosen by the project.

A pattern reference or House Kernel provenance never upgrades architectural authority into regulation, engineering or product evidence.

## Build manifest

Every consequential compile should retain the configuration that gave the result.

Conceptually:

```text
BUILD CONFIGURATION

Target:
  jurisdiction
  building/work class
  regulatory snapshot
  transition basis
  selected methods

Supported domain:
  domain identity

Architectural grammar:
  grammar identity

Project:
  site / brief / assumptions

Source model:
  stable model identity
```

A result without this context is difficult to interpret or reproduce.

## Immutable target snapshots

Once a release claims Target T, the meaning of T should not silently change.

If source guidance or an encoded implementation changes, create a new target/method identity, preserve the earlier one and decide explicitly whether an existing project needs to migrate.

The building record should always be able to answer:

> **What exactly was this conclusion compiled against?**

## Current computational boundary

The present Metamorph Compiler does not implement a release-grade England building-control target.

Its current regulatory example is intentionally much smaller: a versioned private-stair numeric method compares controlled Reference House stair geometry with a selected Approved Document K guidance family while explicitly refusing to call the result whole-building Building Regulations compliance.

That bounded example demonstrates the target/method distinction without implying a general regulations engine.

A release-grade England target would require substantially more: applicability mapping, exact source/transition provenance, validated method implementations, standards/licensing strategy, known-pass/known-fail regression cases and competent regulatory review.

The right response to that gap is not to broaden claims. It is to keep the current proof boundary visible.

## Reference points

- UK Government, Building Regulations 2010.
- UK Government, Approved Documents and Building Regulations circulars.
- UK Government, Future Homes and Buildings Standards material.
- BSI, PAS 1958:2026 and SMART-standards work.
