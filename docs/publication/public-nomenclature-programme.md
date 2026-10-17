<!-- nav-exclude: redirect -->
# PUB-NOM — Reader-facing Nomenclature and Identifier Architecture

**Status:** planned programme  
**Baseline before programme record:** `9d0af7871531fb6f4d7599c680dd55890d46f4a2`  
**Owner:** publication / project systems  
**Relationship:** follow-on hardening after PUB-SAN; sibling to DRW; must close before the PR-02 physical-object freeze

## 1. Purpose

Establish a deliberate architecture for every name, acronym, identifier, code, sequence number and version label that can reach a reader of Ovid’s House.

The immediate trigger is the Working Edition contents page. Canonical patterns are currently presented as `HSA-P-001`, `HSA-P-002`, `HSA-P-014`, `HSA-P-003` and so on. Two separate problems are exposed by that one page:

1. **`HSA` is a legacy project-derived namespace.** `House Systems Architecture` is no longer the master identity, yet the old prefix remains embedded in canonical pattern identifiers and therefore leaks into the resolved publication.
2. **stable identity is being presented as reading order.** The pattern numbers are deliberately non-semantic and publication order is separately authored, but a reader naturally interprets `014` before `003` as an ordering mistake.

The correct response is not a blind search-and-replace from `HSA` to a new brand prefix. That would repair the screenshot while preserving the underlying design error: machine identity, project history, publication order and reader-facing nomenclature are currently too entangled.

This programme therefore asks a larger question:

> **Which identifiers should a reader ever see, what work should each visible identifier perform, and which machine/workflow identities should remain behind the publication boundary?**

The desired end state is not “fewer acronyms” as an aesthetic preference. It is a coherent contract between architectural meaning, machine identity, workflow provenance and publication presentation.

---

## 2. Governing position

### 2.1 Names are for people; identifiers are contracts

A stable machine identifier may be valuable for cross-repository references, compiler models, evidence joins or historical traceability. None of those facts makes it good reader-facing typography.

A code earns public display only when it helps a reader perform a real task better than the human-readable name would.

### 2.2 Public order and stable identity are different dimensions

If an identifier is stable across reordering, its number must not be used visually as though it were the publication sequence.

Publication order should be owned explicitly by publication structure. Pattern identity should be owned explicitly by pattern metadata. Neither should masquerade as the other.

### 2.3 Do not couple durable IDs to a temporary brand

A stable identifier should not need another repository-wide migration merely because the project changes its title. Brand-derived machine namespaces are therefore presumptively wrong unless the brand itself is the durable semantic domain.

This is the central objection to mechanically replacing `HSA-P-001` with `OH-P-001`.

### 2.4 Do not erase useful technical identity merely to make the book look clean

Some compact codes can carry legitimate meaning. A grammar instance such as `G-01`, a project maturity level such as `M4`, or a figure number may be useful on selected technical surfaces. They must be judged by function, not by resemblance to internal workflow codes.

### 2.5 The public boundary is surface-specific

The project has more than one public surface:

- primary book prose;
- contents, headings, captions and cross-references;
- appendices / technical apparatus;
- reader-facing website pages;
- explicitly technical website/reference pages;
- downloadable machine-readable data such as the project data plate;
- SVG metadata and generated artefacts.

An identifier can be legitimate on one surface and inappropriate on another. The system must express this directly rather than relying on ad-hoc prose discipline.

### 2.6 Git history is the compatibility layer of last resort

Do not retain obsolete aliases, prefixes and migration shims merely because they once existed. If there is no demonstrated external consumer requiring compatibility, a clean atomic migration is preferable to permanent dual identity. Repository history preserves archaeology.

### 2.7 Do not rename what the reader never encounters without a reason

This programme is not a repository beautification exercise. Internal filenames, paths, test fixture IDs and implementation symbols should change only when they violate the canonical identity model, create maintenance ambiguity, or prevent enforcement of the public boundary.

---

## 3. Scope

The audit includes every compact identity system that can plausibly affect the public or canonical project model, including at minimum:

- project/master/subsystem names: Ovid’s House, House Kernel, Metamorph Compiler and legacy names;
- pattern identifiers (`HSA-P-*`) and pattern titles;
- pattern evidence/maturity labels and relationship names;
- grammar identities such as `G-01 v0.1` and grammar-development gate codes;
- Reference House identities: `RH-*`, `RH-C*`, fixture names and generated-view identifiers;
- compiler/programme identities: `P0`, `PAT-XW-01`, `CF-01`, `CH-*`, `H1-*` and related proof/gate labels;
- publication/workflow identities: `PR-*`, `PUB-SAN`, `DRW-*` and future programme labels;
- prototype identities such as `P01`–`P04`;
- project maturity labels (`M1`–`M5`);
- figure identifiers, including legacy `D-F*` identities and future DRW figure numbering;
- appendix, table, section and cross-reference numbering where it behaves as an identifier;
- data-plate field labels and public machine-readable identifiers;
- visible SVG labels, embedded titles/descriptions and generated artefact names;
- URL/route slugs where they are meaningfully exposed to readers or relied upon as public references;
- aliases, legacy-name allowlists and public-label overrides;
- any other unexplained acronym or alphanumeric tag encountered during the corpus traversal.

The programme explicitly does **not** assume that all of these should be renamed or hidden.

---

## 4. Required classification model

Every namespace or identifier family must be classified before editing. The programme should use the following classes unless the baseline audit proves a missing category.

### `PUBLIC_NAME`

Human-readable identity intended to be encountered as ordinary publication language.

Examples: `Ovid’s House`, `Controlled Utility Entry`, `Georgian-Derived Domestic Grammar`.

### `PUBLIC_REFERENCE`

A compact stable code that performs an actual reader-facing cross-reference function and whose semantics are explicitly defined.

Examples may include conventional figure numbers or, if justified, a neutral pattern reference code.

This is a high bar. “It already exists” is not sufficient.

### `PUBLIC_TECHNICAL`

A code useful on explicitly technical/reference surfaces but normally suppressed in primary reading flow.

A maturity level or machine data identifier may belong here.

### `INTERNAL_STABLE`

A durable machine identifier used for joins, compiler semantics, tests, lineage or canonical repository relationships, but not intended as reader-facing nomenclature.

### `WORKFLOW`

A phase, gate, issue, experiment or programme identifier whose purpose is to organise project development: `PR-01`, `RH-C5`, `CH-08`, `DRW-04`, and similar.

Workflow codes must not leak into resolved publication surfaces except where a page is explicitly about the workflow itself.

### `PROVENANCE_ONLY`

Historical identity preserved only where development history is intentionally being recorded. Legacy master-project names and superseded namespaces normally belong here.

### `LEGACY_PROHIBITED`

An obsolete identity with no current semantic role. It may remain in Git history or tightly bounded historical records but should be rejected from current canonical/public surfaces.

---

## 5. Surface model

A code's classification is insufficient without an exposure policy. NOM-01 must freeze a surface vocabulary at least as precise as:

1. `BOOK_PRIMARY` — main prose, headings, contents and ordinary captions;
2. `BOOK_TECHNICAL` — indexes, technical notes, controlled appendices if retained;
3. `SITE_PRIMARY` — reader-facing architectural/publication pages;
4. `SITE_TECHNICAL` — computational, evidence or machine-reference pages deliberately exposed;
5. `PUBLIC_MACHINE` — JSON/data-plate/artefact metadata intended for machine or expert inspection;
6. `INTERNAL` — repository-only development, test and workflow surfaces;
7. `PROVENANCE` — deliberately historical records.

The eventual registry should state which surfaces may expose each namespace. Public validation should then test the **rendered outputs**, not only source Markdown.

---

## 6. Programme

## NOM-00 — Authority recovery, baseline and occurrence inventory

Recover current `main` and map the actual identity system before proposing replacements.

Required work:

- record the exact starting commit and generated Working Edition identity;
- enumerate all reader-facing source paths using the current public-surface model;
- enumerate full-PDF, Primer, site, generated-data and figure build paths;
- scan canonical source **and generated public output** for alphanumeric identifier families, legacy names, abbreviations and version labels;
- distinguish token occurrence count from conceptual namespace count;
- freeze representative before-state material: the current TOC, pattern index/page, grammar surfaces, Reference House surfaces, technical/public pages, figure captions and data plate;
- produce `docs/publication/nomenclature-register.md` (or a machine-generated equivalent with a human-readable projection) listing each namespace, examples, owning subsystem, current public exposure and unresolved questions.

The baseline must include identifiers that are *not* currently problematic. Without that, the programme will overfit to `HSA`.

**Gate:** no renaming before the occurrence inventory and namespace register exist.

---

## NOM-01 — Freeze the nomenclature ontology and exposure contract

Turn the classification and surface models above into a project-owned contract.

For every namespace/family record:

- canonical long name / meaning;
- compact syntax or regex where applicable;
- owning subsystem;
- classification (`PUBLIC_NAME`, `PUBLIC_REFERENCE`, etc.);
- allowed public surfaces;
- whether the token is semantic, ordinal, versioned or identity-only;
- stability promise;
- whether brand/project-name coupling is allowed;
- migration status;
- reason for any exception.

This should become machine-readable rather than another prose-only policy. The likely target is a small canonical registry under `project/` integrated with `project/identity.ts`, not a second independent branding file.

The registry must be small enough to understand at a glance. Do not construct an enterprise taxonomy system.

**Gate:** every subsequent rename/hide/retain decision must cite the frozen class and exposure rule.

---

## NOM-02 — Necessity red-team: make every visible code earn itself

Before changing syntax, test whether the code should be public at all.

For every identifier family, answer:

1. What reader task does the compact code enable?
2. Can the human name perform that task equally well?
3. Does the code imply order, maturity, authority or version semantics that it does not actually possess?
4. Does it reveal project-development mechanics rather than architectural content?
5. Is the code meaningful without knowledge of the repository?
6. Is it stable for the right reason, or merely old?
7. Would an architect encountering the publication cold understand why it is there?
8. If removed from primary surfaces, where — if anywhere — must it remain for rigorous cross-reference?

Specific families that must receive explicit decisions include:

- `HSA-P-*`;
- `G-01` and grammar version labels;
- `M1`–`M5`;
- `RH-*` and `RH-C*`;
- `P0`, `PAT-XW-01`, `CF-01`, `CH-*`, `H1-*`;
- `PR-*`, `PUB-SAN`, `DRW-*`;
- `P01`–`P04` prototypes;
- `D-F*` and the future DRW figure register;
- any remaining legacy-name acronym found by NOM-00.

Possible outcomes are `KEEP_PUBLIC`, `TECHNICAL_ONLY`, `HIDE_PUBLIC`, `RENAME_NEUTRAL`, `REPLACE_WITH_NAME`, `MIGRATE_INTERNAL`, or `RETIRE`.

**Gate:** produce an explicit decision table. No family is changed merely because another family was changed.

---

## NOM-03 — Pattern identity and order decision

Treat the pattern system as its own hard gate because it triggered the programme and has the deepest current coupling.

### Questions to resolve

- Should canonical pattern IDs remain public references at all?
- If public, should they appear in the TOC, page heading, index, technical metadata only, or nowhere in normal reading flow?
- Should the internal canonical namespace remain `HSA-P-*`, migrate to a neutral namespace such as `PAT-*`, or use another brand-independent form?
- Do any external consumers actually rely on current IDs?
- Can filenames/slugs remain stable and human-readable while internal IDs migrate?
- How should relationship metadata and compiler crosswalks reference patterns after migration?
- Does any compatibility alias have a demonstrated user, or would it merely immortalise the old namespace?

### Working presumption to attack

The default hypothesis is:

- **pattern names remain the primary reader identity;**
- **the Working Edition contents and ordinary headings should not lead with machine IDs;**
- **publication order remains an explicit ordered list/group structure, independent of identifier numbers;**
- **if a stable machine ID is still required, it should be brand-neutral;**
- **do not introduce `OH-P-*` simply because the current master name is Ovid’s House.**

This is a presumption, not a licence to migrate blindly. NOM-03 must prove the blast radius and external-contract position first.

### Migration rule if a neutral internal namespace wins

Prefer one atomic canonical migration with a generated old→new mapping in the closeout record. Do not carry dual IDs indefinitely unless a real external compatibility obligation is found.

**Gate:** pattern display policy and canonical identifier policy are frozen separately.

---

## NOM-04 — Reader-facing reference architecture

Separate source identity from rendered presentation in the publishing system.

Likely system changes to test:

- publication manifests should distinguish `internalId`, human `title`, optional `publicReference`, and publication `order` rather than constructing titles by concatenating machine IDs;
- pattern frontmatter should not force a single field to serve machine joins and public typography;
- cross-references should originate from semantic keys/relationships and render into surface-appropriate labels;
- the site pattern index and book adapter should share the same display policy rather than each improvising it;
- figure captions should use normal publication numbering or titles, while compiler/source lineage remains in metadata;
- public-machine artefacts may expose stable internal identities where that is explicitly part of their contract, without causing those identities to spill into book typography.

The goal is to make **reader-facing suppression or transformation a first-class system capability**, not a list of string replacements.

**Gate:** one canonical concept must not require duplicated public display strings across site, PDF and machine outputs.

---

## NOM-05 — Canonical namespace governance and validators

Implement the minimum machinery required to stop recurrence.

Expected architecture:

- extend or complement `project/identity.ts` with a machine-readable nomenclature/namespace registry;
- define allowed public surfaces and legacy/provenance exceptions centrally;
- make validation consume that registry rather than maintaining disconnected regex lists where practical;
- extend `validate-project-brand.ts` so legacy identities are governed intentionally, including old acronyms/prefixes where appropriate;
- extend `validate-resolved-public-surface.ts` or introduce a tightly scoped validator for namespace leakage;
- validate generated publication/site output, not only authored Markdown;
- make any public exception explicit, local and reasoned rather than silently allowlisted.

A validator should be able to distinguish, for example, a legitimate technical explanation of `M4` from an accidental `RH-C5` in primary book prose.

Do not attempt perfect natural-language detection. Combine structural surface policy with high-confidence namespace rules.

---

## NOM-06 — Execute approved migrations in dependency order

Apply only the decisions frozen by NOM-02/NOM-03.

Recommended order:

1. introduce the new registry/display abstractions while preserving current behaviour;
2. change reader-facing rendering independently of canonical machine IDs where possible;
3. migrate canonical IDs only after all joins/crosswalks/tests are enumerated;
4. update pattern relationships, compiler crosswalks, data manifests and tests atomically for any ID migration;
5. update public headings, indexes, captions and cross-references;
6. remove obsolete aliases/shims that no longer have a consumer;
7. regenerate public artefacts and verify no stale generated outputs remain.

A public display cleanup must not silently break computational or evidence relationships. Conversely, internal traceability must not be used as an excuse to keep obsolete public typography.

---

## NOM-07 — Whole-corpus first-reader nomenclature audit

Read the result as a reader, not as a repository maintainer.

Audit:

- contents pages;
- part/chapter openings;
- pattern index and every pattern page;
- strategies and held candidates;
- grammar material;
- Reference House material;
- figure/table captions and in-text references;
- evidence/precedent apparatus;
- website navigation and search-facing titles;
- Primer;
- technical/public computational pages;
- data plate;
- SVG-visible text and metadata where relevant;
- appendices/back matter.

Questions:

- Is any acronym unexplained where it first matters?
- Does any code look like an ordinal when it is not?
- Does any visible number imply false authority or maturity?
- Does any workflow label survive in resolved architectural exposition?
- Are names, titles and references consistent between web and print?
- Has hiding a code removed useful cross-reference capability?
- Has a technical surface become unnecessarily verbose because a useful compact code was over-cleaned?

The test is not “zero acronyms.” It is **zero unexplained or functionless identity noise**.

---

## NOM-08 — Order, numbering and version semantics audit

Perform a dedicated semantic review of every number still visible to readers.

For each visible number, identify which of these it means:

- reading order;
- stable identity;
- edition/version;
- maturity;
- figure/table sequence;
- technical parameter;
- historical/workflow gate.

No visual treatment should encourage a different interpretation.

This gate must specifically prove that the original contents-page defect cannot recur: a stable pattern identity may not visually impersonate chapter sequence.

Version labels also require discipline. `v0.1` is acceptable only where the thing is genuinely versioned and the reader benefits from knowing that version. Draft/workflow numbering is not publication content merely because it resembles versioning.

---

## NOM-09 — Regression system and generated-output proof

Close the gap left by source-only hygiene checks.

Required verification should include:

- deterministic extraction of visible/public text from the generated Working Edition inputs or final PDF text layer where practical;
- generated site-page checks for prohibited namespace leakage;
- specific regression fixtures for legacy `HSA` pattern exposure;
- checks that pattern publication order is independent of stable ID sort order;
- checks that human titles are not constructed from machine IDs by default;
- checks that legacy names/prefixes appear only on explicitly allowed provenance surfaces;
- link/cross-reference integrity after any identifier migration;
- data-plate/schema checks where public machine identity is intentionally retained;
- full repository, publication and site CI.

The test suite should fail for the *class* of mistake, not just the exact screenshot that triggered it.

---

## NOM-10 — Closeout, DRW reconciliation and PR-02 handoff

Produce a durable closeout record containing:

- baseline and final commit identities;
- the final namespace/exposure register;
- every identifier-family decision and rationale;
- old→new mapping for any migrated canonical IDs;
- intentionally retained public technical codes and why they earn exposure;
- intentionally retained internal legacy/provenance references and their boundaries;
- before/after reader-facing examples;
- evidence that site, Working Edition, Primer and machine artefacts agree;
- validation results and known limitations.

Coordinate with DRW before closure:

- DRW owns architectural drawing quality and the canonical figure register;
- PUB-NOM owns whether figure IDs/numbers are reader-facing and how source/compile lineage is hidden or exposed;
- compiler drawing IDs may remain internal metadata even when publication figure numbers change;
- neither programme should invent an independent numbering system for the other.

Only after NOM-10 and the relevant DRW publication-integration gates pass should PR-02 treat the book's nomenclature and visual reference system as frozen.

---

## 7. Relationship to existing programmes

### PUB-SAN

PUB-SAN remains complete. This programme does **not** reopen it as failed work.

PUB-SAN removed development-history prose and high-confidence residue. PUB-NOM addresses a narrower structural problem that the `HSA-P-*` case made visible: canonical machine/workflow identifiers can still be technically current while being wrong for the resolved public surface.

PUB-SAN's governing sentence still applies:

> **The publication contains the resolved work, not the history of its resolution.**

PUB-NOM adds:

> **The publication exposes identifiers only when the reader benefits from their identity.**

### DRW

DRW and PUB-NOM may proceed partly in parallel, but their interface must be explicit.

Safe parallel work:

- NOM-00/01/02 inventory and ontology;
- DRW-00/01 authority and visual doctrine.

Required coordination:

- NOM-04 should inform DRW-02's figure-register identity/display policy;
- DRW-10 publication integration must obey the frozen nomenclature rules;
- NOM-07/08/09 should inspect the final DRW-integrated public outputs, because new architectural drawings can introduce labels and identifiers.

Do **not** serialise the whole drawing programme behind this audit. Only the shared publication-identity decisions need a gate.

### PR-02

PR-02 should not manufacture the private hardback from a contents/index/reference system known to contain legacy or misleading public identity. This is a bounded pre-production correction, not permission for another free-form manuscript-development cycle.

---

## 8. Red-team risks

### Risk A — needless repository churn

Aesthetic dislike of codes can turn into mass renaming with no reader or maintenance benefit.

**Control:** classify exposure first; leave reader-invisible internals alone unless they violate canonical identity or block enforcement.

### Risk B — rebranding the namespace instead of fixing the architecture

`HSA-P-001` → `OH-P-001` would produce a cleaner screenshot today and another migration after the next naming change.

**Control:** durable machine IDs should be brand-neutral unless brand semantics are genuinely part of the identity.

### Risk C — destroying traceability

Removing visible IDs can make technical cross-reference harder if the project actually relies on them.

**Control:** distinguish primary reading flow from technical/reference surfaces; retain a neutral public reference only where a real cross-reference task is demonstrated.

### Risk D — compatibility sediment

Aliases intended as temporary migration aids can become permanent duplicate identity.

**Control:** require evidence of an external consumer before retaining compatibility aliases after closeout.

### Risk E — over-cleaning useful compact semantics

`G-01` or `M4` may be genuinely useful on technical surfaces even if `RH-C5` is not.

**Control:** no family-level guilt by association; every namespace gets its own necessity decision.

### Risk F — source cleanliness without output cleanliness

A publication adapter, generated title or SVG may reconstruct an unwanted identifier after source files pass validation.

**Control:** validate rendered/generated outputs as first-class public surfaces.

### Risk G — accidental order semantics

A neutral `PAT-014` still looks ordinal if displayed prominently before `PAT-003`.

**Control:** hiding/relocating identity and separating publication order is independent from namespace renaming.

### Risk H — framework overbuild

A nomenclature registry could metastasise into a general metadata platform.

**Control:** only model namespace families and surfaces that the current project actually needs. Prefer typed constants and simple validators over a generic rules engine.

---

## 9. Expected current hypotheses — not yet final decisions

The programme begins with the following hypotheses because they are strong enough to test, but NOM-00→NOM-03 must be allowed to overturn them.

1. **Pattern names should dominate the Working Edition and site.** `Accessible Vertical Service Zone` is useful reader language; `HSA-P-014` is not.
2. **Pattern publication order should remain explicitly curated and independent of stable identity.** The current non-numeric order can be architecturally correct even when the displayed codes make it look wrong.
3. **`HSA-P-*` is unlikely to survive as the canonical long-term machine namespace.** If a stable ID is still useful, a brand-neutral namespace such as `PAT-*` is structurally preferable to another project-name prefix.
4. **Most project gate/programme codes belong behind the public boundary.** `RH-C5`, `CH-08`, `PUB-SAN`, `DRW-04` and similar are excellent repository controls and poor resolved-publication language.
5. **`G-01` and `M1`–`M5` require more nuanced treatment.** They may earn technical/public use because they identify a grammar instance and an explicit maturity model rather than merely recording workflow history.
6. **Figure numbering should be a publication concern, while compiler/source drawing IDs remain lineage metadata.** DRW should not preserve legacy figure IDs merely for continuity.
7. **URLs and filenames should not be renamed merely to achieve visual purity.** Human-visible labels and canonical identity are the priority; stable routes are valuable unless they themselves leak a false public concept.

---

## 10. Acceptance criteria

PUB-NOM is complete only when all of the following are true:

1. Every canonical identifier family has an owner, semantic definition, classification and allowed-surface policy.
2. No legacy project-derived namespace appears on primary reader surfaces unless an explicit, defensible exception exists.
3. Every compact code visible in primary publication flow performs a demonstrated reader task.
4. Stable identity, publication order, maturity and version are represented as separate concepts; no visible code accidentally impersonates another.
5. The pattern contents/index/page system no longer makes architecturally intentional ordering look like a numbering error.
6. Pattern public presentation and pattern machine identity are independently controlled.
7. Any canonical ID migration is atomic, tested, mapped and free of unnecessary permanent aliases.
8. Workflow/gate identities remain available internally without leaking into resolved architectural prose.
9. Site, Working Edition, Primer, figures and public machine artefacts obey the same canonical nomenclature policy appropriate to their surfaces.
10. Figure/reference identity is reconciled with DRW rather than duplicated.
11. Public-surface validation detects legacy/prohibited namespace leakage in generated output, not just source Markdown.
12. Cross-references, relationships, compiler joins and public links remain intact after approved migrations.
13. A cold reader does not need repository history to interpret any visible acronym, number or code.
14. No broad renaming was performed without a reader-facing, semantic or maintenance reason.
15. The final Working Edition passes full repository/publication/site validation and is suitable to freeze for PR-02 once DRW also closes its publication-facing obligations.

---

## 11. Handoff / resume protocol

A future agent recovering this programme should:

1. fetch current `main` rather than assuming the baseline commit is still HEAD;
2. read this file;
3. read the tracking issue for PUB-NOM and its latest comments;
4. read `project/identity.ts`, `project/public-surface.ts`, `scripts/validate-project-brand.ts`, `scripts/validate-resolved-public-surface.ts`, `publication/publication.ts`, `publication/adapters.ts`, `docs/patterns/language-model.md`, `docs/patterns/patterns.data.ts`, `publication/part-iii.md`, the current project data-plate implementation and DRW programme;
5. inspect the latest full Working Edition and current site rather than reasoning only from source;
6. resume from the first incomplete NOM gate;
7. update the tracking issue after each gate with commit identities, decisions and the exact next resume point.

Do not begin by replacing `HSA` globally. The first deliverable is the namespace occurrence/register baseline. The first conceptual decision is **whether an identifier belongs in front of a reader at all**.
