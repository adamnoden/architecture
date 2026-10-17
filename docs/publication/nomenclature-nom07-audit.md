<!-- nav-exclude: redirect -->
# PUB-NOM — NOM-07 whole-corpus first-reader audit

**Gate:** NOM-07 — whole-corpus first-reader nomenclature audit  
**Status:** IN PROGRESS  
**Draft PR:** #157  
**Tracking issue:** #156  
**Starting head:** `936a529174c8856f9adeb38937b67b251a067837`

## Purpose

Audit the resolved publication as a reader rather than as a repository maintainer. The governing test is not zero acronyms or zero compact references. It is **zero unexplained or functionless identity noise**.

NOM-07 does not reopen completed NOM-02/NOM-03/NOM-06 decisions without new evidence. It asks whether the resolved site, Working Edition, Primer and technical/public surfaces make sense without knowledge of repository history.

## Bounded audit sequence

The gate is divided into independently resumable sub-gates so that each pass can be completed, recorded and validated before the next begins.

- [x] **NOM-07A — front door, navigation and publication openings**  
  Contents, landing/navigation/search-facing titles, Reader's Guide, part/chapter openings and section labels.
- [x] **NOM-07B — patterns, strategies and held candidates**  
  Pattern index and every reader-facing pattern page, then strategies and held candidates. Verify that useful cross-reference capability survived removal of machine IDs.
- [x] **NOM-07C — grammar, Reference House and technical/public computational surfaces**  
  Grammar material, Reference House exposition, generated/public technical pages, data plate and reader-visible compact technical references.
- [x] **NOM-07D — figures, captions, evidence and back matter**  
  Figure/table captions and in-text references, SVG-visible text/metadata where reader-relevant, evidence/precedent apparatus, appendices and glossary.
- [x] **NOM-07E — Primer and cross-surface consistency**  
  Read the Primer independently, then compare names/titles/references against the site and Working Edition.
- [ ] **NOM-07F — adversarial cold-reader reconciliation**  
  Final whole-corpus sweep for unexplained acronyms, false ordinals, workflow residue, inconsistent naming and over-cleaning. Resolve findings or explicitly defer number/order/version-only questions to NOM-08.

## Questions applied at every sub-gate

1. Is any acronym or compact reference unexplained where it first matters?
2. Does any code look like an ordinal when it is not?
3. Does any visible number imply false authority or maturity?
4. Does any workflow label survive in resolved architectural exposition?
5. Are names, titles and references consistent between web and print?
6. Has hiding a code removed useful cross-reference capability?
7. Has a technical surface become unnecessarily verbose because a useful compact code was over-cleaned?

## Finding classes

Each finding is recorded as one of:

- **FIX-NOW** — nomenclature/reader-coherence defect owned by NOM-07;
- **NOM-08** — number/order/version semantic question that should be decided in the dedicated next gate;
- **DRW** — figure/drawing quality or canonical figure-register matter owned by the sibling drawing programme;
- **RETAIN** — initially suspicious identity that earns its reader-facing role on inspection;
- **INTERNAL-ONLY** — valid machine/provenance identity confirmed absent from ordinary reader surfaces.

## Audit log

### NOM-07A — front door, navigation and publication openings — COMPLETE

Surfaces read:

- project landing page and reading guide;
- manuscript overview and Reader's Guide;
- Preface and Part I–V openings;
- publication entry titles used by the Working Edition;
- VitePress top-level navigation/sidebar definitions together with the public-surface filter and public-label overrides.

Findings:

- **FIX-NOW — obsolete hidden-ID explanation in Reader's Guide.** The guide still told readers that stable pattern IDs preserve provenance and cross-reference even though NOM-06 deliberately removed those machine IDs from ordinary presentation. Replaced with the actual reader semantic: pattern names are the identity and book order is editorial rather than ranking or required sequence.
- **FIX-NOW — code-first grammar introduction.** The first Reader's Guide mention of `G-01 v0.1` led with the code. Recast as a controlled Georgian-derived grammar with the compact reference in parentheses, so the reader encounters meaning before identifier.
- **RETAIN — `G-01` compact reference.** At the publication opening level the reference earns a role because it distinguishes the selected controlled grammar from the general architectural-grammar framework and is introduced with its human meaning. Whether `v0.1` is the best public version treatment remains a NOM-08 question.
- **INTERNAL-ONLY — workflow/history navigation definitions.** The source navigation file contains development/provenance labels and coded programme names, but `project/public-surface.ts` removes those sources from the public build/navigation and applies human-facing label overrides to retained technical material. No reader-facing defect was found at this layer.
- **RETAIN — ordinary external standards acronyms.** Familiar external references such as ISO/RICS/CIBSE/RIBA are used as standards/professional-body references rather than project-owned identity machinery. NOM-07 does not expand into stylistic acronym elimination where context is already clear.

Implementation commit: `5d265aca62163b61e96b898dbe881c10f16c2fbe`.

### NOM-07B — patterns, strategies and held candidates — COMPLETE

Surfaces read:

- pattern overview, authoring contract and service-topology sequence;
- all 21 active pattern pages;
- all three strategy pages and strategy index;
- all four held-candidate pages and candidate index.

Findings:

- **RETAIN — title-led pattern relationships.** All active pattern pages use human titles in rendered headings, relationship links and Reference House application prose. `PAT-*` identities remain confined to machine-readable frontmatter. Removing those IDs from ordinary presentation has not broken reader cross-reference.
- **FIX-NOW — machine-system narration on ordinary indexes.** Removed explanations that ordinary readers needed to know that patterns retain hidden machine IDs, strategies do not receive `PAT-xxx` IDs, or candidates have no `PAT-*` identity. These facts remain available where technically relevant but did no reader-facing work on the overview pages.
- **FIX-NOW — candidate status described absent machine identity.** Reduced four candidate status lines from “held; no stable pattern ID” to the reader-relevant state “held”.
- **FIX-NOW — machine sequence identity.** Removed the visible `service-topology` Sequence ID from the generative-sequence page. The real S1–S10 design-step numbering remains because it is genuine sequence order.
- **RETAIN — authoring-contract machine identity.** `docs/patterns/language-model.md` explicitly documents the pattern authoring/data contract. Stable machine identity and frontmatter are functional technical content on that page rather than publication residue.
- **RETAIN — Physical Service Index identifiers.** References to stable IDs on that pattern mean durable labels on real services, drawings and records; they are the architectural subject of the pattern, not repository identity leakage.
- **REVIEW AT NOM-07F — professional acronyms such as MEWP.** These are external industry terms rather than project-owned codes. They were not expanded mechanically during this gate; final cold-reader reconciliation will decide whether first-use expansion improves accessibility.

Implementation commit: `d982f6a05e369254a42918b65ac29a46947213e2`; one-shot workflow removed at `a6be8fa83533e07b6df57e751f0c1b5336bea51d`.

### NOM-07C1 — architectural grammar — COMPLETE

Surfaces read:

- grammar overview, framework, current G-01 specification, charter, scope/derivation method and validation/limits;
- corpus/source-quality register, annotation method, topology comparison, dimensional analysis, plan/section/elevation coupling and constraint-evidence register;
- precedent-case index, four core precedent cases and both source-qualified measurement/coupling evidence packs.

Findings:

- **RETAIN — `G-01` and `G01-R01`–`G01-R06`.** The grammar identity and normative rule references are functional technical references inside a controlled specification. Human architectural meaning accompanies them; removing them would make cross-reference worse.
- **RETAIN — corpus/source/case/entity IDs.** Codes such as `G01-MHH`, source IDs and case-specific room/relationship IDs occur in inspectable evidence records where exact provenance and cross-case comparison are the subject. They earn their technical role.
- **FIX-NOW — research-stage machinery in public case records.** The four core case pages still exposed labels such as `Analysis role: TRIAL`, `D3 status`, `D3 finding`, `D3 interpretation`, “dimensional analysis seed”, `SUPPLEMENTARY`, `web-source pass v0.1` and “this pass” narration. These were old research-run identities rather than resolved evidence semantics. They were replaced with durable evidence/method language while preserving useful case/source identifiers.
- **INTERNAL-ONLY — grammar execution-stage records.** D5/D6/D8/D9/D10/D10-S/D13 programme and run documents remain excluded from the resolved public surface. Their source identities do not need migration merely because they remain valid provenance.
- **NOM-08 — `v0.1` semantics.** The current grammar version label is intentionally retained here; whether its visible version semantics imply the right maturity/order meaning belongs to the dedicated number/version audit.

Implementation commit: `2da5c1164423ed639138dac38d490a7f29b99815`; one-shot workflow removed at `1acf5757c5d0028c38300693780484895e671c6c`.

### NOM-07C2 — Reference House — COMPLETE

Surfaces read:

- Reference House overview, G-01 conformance record, pattern occurrence register, tectonic language, vertical coordination, technical coordination and independent-review brief;
- generated output overview, service register, boundary register, output manifest and representative generated SVG inspection output.

Findings:

- **RETAIN — title-led Reference House exposition.** Ordinary public prose names architectural concepts and pattern occurrences rather than exposing workflow-stage identities.
- **RETAIN — generated technical identity.** `RH-*`, `HK-RH-COMPILE-*`, semantic entity/route/carrier IDs and fingerprints occur on an explicitly technical inspection surface where exact cross-checking is the point. Human labels lead and the surface states its limits.
- **INTERNAL-ONLY — `.oh-*` generated SVG class names.** These are invisible implementation selectors rather than rendered nomenclature. Renaming them would be churn without a reader benefit.
- **INTERNAL-ONLY — Reference House execution stages.** Historical compiler/fixture stages remain outside the resolved public surface.

No NOM-07C2 content fix was required.

### NOM-07C3 — computational/data surfaces — COMPLETE

Surfaces read:

- computational overview, executable architecture, formal model, validity/obligations, evidence/provenance, compiler targets, structural/boundary semantics, interface-obligation bundles, supported-domain statement, prior-art context and the retained scoped manufacturer-evidence example;
- canonical machine data plate and its public-surface treatment;
- VitePress theme/configuration controlling site-wide metadata presentation.

Findings:

- **RETAIN — technical semantic examples.** Illustrative IDs such as `STR-017`, `AB-01`, interface identities and validity/status enums are part of the technical model being explained and improve exactness.
- **INTERNAL-ONLY — canonical data plate.** `project/dataplate.json` remains machine/status data rather than an ordinary reader route. Its `M1`–`M4` values are therefore not reader leakage; the semantics of maturity numbering if surfaced belong to NOM-08.
- **FIX-NOW — site-wide Git build stamp.** Every site page still rendered `build <git-sha> · <timestamp>`. NOM-02 had already concluded that build provenance has no reader task and belongs on internal/machine surfaces. Removed the footer component, its styling and the now-unused Vite build-stamp globals rather than merely neutralising the wording again.
- **RETAIN — resolved manufacturer-evidence example.** The retained page has a human public title and scoped-evidence prose; its historical source filename does not leak into reader presentation.

Implementation commits: `09124eb1dc738de72b5e2316076c902986b3a9e2`, `d37ca1b4d5bd7d369cdfd12dfbf6f1d8d3bcb994`, `9a7158b791eb4aa01bff8ba10a5942389f0914a5`.

### NOM-07D — figures, captions, evidence and back matter — COMPLETE

Surfaces read:

- all 11 Working Edition figure placements, captions and publication SVGs;
- Evidence and Precedent Notes, Research Agenda, Reference House Implementation Schedule, Glossary and Sources/Further Reading;
- Part V physical-proof, procurement, commissioning and scenario-review material relevant to prototype/test nomenclature.

Findings:

- **RETAIN — figure text is human-led.** Visible titles, labels, captions and SVG accessibility text use architectural names and meanings rather than project machine IDs.
- **FIX-NOW — obsolete internal `D-F*` figure identities.** The figure placer still assigned retired `D-F01`–`D-F11` identities solely for internal validation/error messages. Removed the legacy identity family entirely and changed validation to preserve the exact figure set by asset identity/alt text. No replacement public numbering was invented because DRW owns the future figure-reference system.
- **RETAIN — external technical acronyms in back matter.** Terms such as MEP, MVHR, PV, RIBA and standards references are ordinary discipline/product/standard language, not project-owned workflow identity. `M4(2)`/`M4(3)` in the implementation schedule are UK accessibility categories, not the project maturity scale, and are contextually explicit.
- **RETAIN — resolved proof language.** Part V describes first articles, prototypes and commissioning as methods rather than exposing internal `P01`–`P04`/`W2` workflow shorthand.

Figure retirement implementation began at `74906dc9a4b00090c3f93a4b3148b13ed99e877e`; follow-up validator changes replace dependence on the retired IDs with descriptive asset identity.

### NOM-07E — Primer and cross-surface consistency — COMPLETE

Surfaces read:

- authored Primer proposition and outlook;
- deterministic Primer adapters for constitution, complete pattern set, representative patterns and Reference House;
- Reference House source sections copied into the Primer;
- pattern metadata path used internally by the adapter.

Findings:

- **RETAIN — title-only pattern presentation.** The Primer uses `PAT-*` internally to select and order patterns, but emits human pattern titles only. This preserves one canonical source without exposing machine identity.
- **RETAIN — numbered governing provisions.** The eleven constitution numbers are actual reader references within the architectural argument, not repository workflow codes.
- **RETAIN — Reference House maturity in prose.** The Primer copies plain-language proof boundaries rather than project `M*` maturity labels.
- **RETAIN — cross-edition identity.** Ovid’s House, House Kernel, Metamorph Compiler, G-01, pattern titles and Reference House meanings are consistent with the site/Working Edition at the surfaces where they appear.

No NOM-07E content fix was required.

## Exit condition

NOM-07 closes only when every listed surface has been read cold, all FIX-NOW findings are resolved and validated, remaining compact references have an intelligible reader function, and any deliberately deferred number/order/version questions are explicitly handed to NOM-08 rather than left ambiguous.
