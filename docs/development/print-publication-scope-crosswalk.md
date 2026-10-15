# Print publication scope crosswalk

**Status:** maintained editorial scope record + generated manifest view  
**Updated:** 2026-10-15  
**Editorial authority:** [`../manuscript/publication-architecture.md`](../manuscript/publication-architecture.md)  
**Machine compile authority:** [`../../publication/publication.ts`](../../publication/publication.ts)  
**Pipeline control:** [`print-publication-pipeline.md`](print-publication-pipeline.md)

This record keeps the two publication authorities distinct. The publication architecture states **what the book means and how it should be organised**. `publication/publication.ts` states **the exact source/order currently compiled into the Working Edition**. The generated table below exposes that machine scope without maintaining a second hand-written manifest.

Where editorial intent and machine scope disagree, stop and reconcile them deliberately. Do not treat either drift direction as self-correcting.

## Scope rules

1. Compile current publication-facing material; do not fill manuscript gaps with web navigation or programme-control documents.
2. Preserve canonical ownership while allowing publication-native synthesis. Part III's canonical pattern records remain under `docs/patterns/`; the reader-facing bridge belongs to publication. Part IV and back matter may be authored under `docs/manuscript/` where they synthesise rather than duplicate canonical project records.
3. Supporting evidence remains supporting evidence. Research pages stay outside the primary PDF unless publication prose incorporates them deliberately.
4. Historical and migration records remain online provenance rather than primary linear reading.
5. Dynamic website-only representation may receive a deterministic **print adapter** only when the underlying canonical content is already publication-facing. An adapter may render or compose existing source; it may not invent the argument.
6. Missing target material remains visibly missing. Back matter enters the Working Edition only when a publication-facing source exists and serves a distinct reader function.

## Current Working Edition manifest

<!-- generated: publication-manifest:start -->
> Generated from `publication/publication.ts`. Do not hand-edit this table; run `npm run publication:scope:update` after changing the Working Edition manifest.

| # | Kind | Publication title | Primary source | Adapter |
|---:|---|---|---|---|
| 1 | preface | Preface — The Obvious, Eventually | `docs/manuscript/preface.md` | `—` |
| 2 | front-matter | Reader's Guide | `docs/manuscript/readers-guide.md` | `—` |
| 3 | part | Part I — The Proposition | `docs/manuscript/part-i.md` | `part-i-composite` |
| 4 | part | Part II — Architecture of the Platform | `docs/manuscript/part-ii.md` | `part-ii-composite` |
| 5 | part | Part III — Patterns and Generative Sequences | `publication/part-iii.md` | `—` |
| 6 | pattern | Controlled Utility Entry — HSA-P-001 | `docs/patterns/controlled-utility-entry.md` | `pattern-page` |
| 7 | pattern | Plant Room as Service Hub — HSA-P-002 | `docs/patterns/plant-room-service-hub.md` | `pattern-page` |
| 8 | pattern | Accessible Vertical Service Zone — HSA-P-014 | `docs/patterns/accessible-vertical-service-zone.md` | `pattern-page` |
| 9 | pattern | Coherent Horizontal Service Route — HSA-P-003 | `docs/patterns/coherent-horizontal-service-route.md` | `pattern-page` |
| 10 | pattern | Accessible Room Service Route — HSA-P-015 | `docs/patterns/accessible-room-service-route.md` | `pattern-page` |
| 11 | pattern | High-Service-Room Service Wall — HSA-P-004 | `docs/patterns/high-service-room-service-wall.md` | `pattern-page` |
| 12 | pattern | Designed Structural Penetration — HSA-P-005 | `docs/patterns/designed-structural-penetration.md` | `pattern-page` |
| 13 | pattern | Compartmented Service Void — HSA-P-016 | `docs/patterns/compartmented-service-void.md` | `pattern-page` |
| 14 | pattern | Visible Leakage Path — HSA-P-017 | `docs/patterns/visible-leakage-path.md` | `pattern-page` |
| 15 | pattern | Failure-Tolerant Wet Service Room — HSA-P-018 | `docs/patterns/failure-tolerant-wet-service-room.md` | `pattern-page` |
| 16 | pattern | Accessible Rainwater Route — HSA-P-009 | `docs/patterns/accessible-rainwater-route.md` | `pattern-page` |
| 17 | pattern | Permanent Opening / Replaceable Window — HSA-P-007 | `docs/patterns/permanent-opening-replaceable-window.md` | `pattern-page` |
| 18 | pattern | Permanent Opening / Replaceable Door — HSA-P-019 | `docs/patterns/permanent-opening-replaceable-door.md` | `pattern-page` |
| 19 | pattern | Designed Threshold — HSA-P-020 | `docs/patterns/designed-threshold.md` | `pattern-page` |
| 20 | pattern | Movement / Slip Junction — HSA-P-008 | `docs/patterns/movement-slip-junction.md` | `pattern-page` |
| 21 | pattern | Controlled Attachment Plane — HSA-P-022 | `docs/patterns/controlled-attachment-plane.md` | `pattern-page` |
| 22 | pattern | Source-Capture Kitchen Extract — HSA-P-010 | `docs/patterns/source-capture-kitchen-extract.md` | `pattern-page` |
| 23 | pattern | Source-Capture Bathroom Extract — HSA-P-021 | `docs/patterns/source-capture-bathroom-extract.md` | `pattern-page` |
| 24 | pattern | Roof Maintenance Route — HSA-P-011 | `docs/patterns/roof-maintenance-route.md` | `pattern-page` |
| 25 | pattern | Ground-Supported Façade Access — HSA-P-013 | `docs/patterns/ground-supported-facade-access.md` | `pattern-page` |
| 26 | pattern | Physical Service Index — HSA-P-012 | `docs/patterns/physical-service-index.md` | `pattern-page` |
| 27 | strategy | Fail-Safe Water Distribution | `docs/patterns/strategies/fail-safe-water-distribution.md` | `—` |
| 28 | strategy | Decompose Structural Interface Functions | `docs/patterns/strategies/decompose-structural-interface-functions.md` | `—` |
| 29 | strategy | Separate Structural Floor from Changeable Layers | `docs/patterns/strategies/separate-structural-floor-changeable-layers.md` | `—` |
| 30 | candidate | Replaceable Architectural Lining | `docs/patterns/candidates/replaceable-architectural-lining.md` | `—` |
| 31 | candidate | Individually Isolatable Manifold Distribution | `docs/patterns/candidates/individually-isolatable-manifold-distribution.md` | `—` |
| 32 | candidate | Local Deep Service Zone | `docs/patterns/candidates/local-deep-service-zone.md` | `—` |
| 33 | candidate | Selective Floor Access | `docs/patterns/candidates/selective-floor-access.md` | `—` |
| 34 | part | Part IV — Reference House | `docs/manuscript/part-iv.md` | `—` |
| 35 | part | Part V — Making and Testing the Platform | `docs/manuscript/part-v.md` | `part-v-wrapper` |
| 36 | back-matter | Appendix A — Evidence and Precedent Notes | `docs/manuscript/evidence-and-precedent-notes.md` | `—` |
| 37 | back-matter | Appendix B — Legacy Doctrine Register Crosswalk | `docs/manuscript/doctrine-register-crosswalk.md` | `—` |
| 38 | back-matter | Appendix C — Research Agenda | `docs/manuscript/research-agenda.md` | `—` |
| 39 | back-matter | Appendix D — Reference House Implementation Schedule | `docs/manuscript/reference-house-implementation-schedule.md` | `—` |
| 40 | back-matter | Appendix E — Glossary | `docs/manuscript/glossary.md` | `—` |
| 41 | back-matter | Appendix F — Sources and Further Reading | `docs/manuscript/sources-and-further-reading.md` | `—` |
<!-- generated: publication-manifest:end -->

The generated block is checked by `publication:validate`. A manifest change therefore fails normal repository tests until this report is regenerated with `npm run publication:scope:update` and the resulting scope change is reviewed.

## Editorial interpretation of the manifest

### Front matter and Parts I–II

The generated title page and contents are print mechanics and therefore do not appear as source entries. The canonical [`Reader's Guide`](../manuscript/readers-guide.md) consolidates the abstract, reading guidance, definitions, evidence/maturity legend and governing constraints.

Part I is a composition: [`part-i.md`](../manuscript/part-i.md) owns the argument while the adapter inserts the canonical [`governing-principles.md`](../manuscript/governing-principles.md) and developed [`principle-08-repose.md`](../manuscript/principle-08-repose.md) at their intended positions. Part II similarly inserts [`maintenance-geography-external.md`](../manuscript/maintenance-geography-external.md). These dependencies are validated by the publication adapter system; they are not additional primary manifest entries.

### Part III — Patterns and Generative Sequences

PR-00B3 replaced the previous website index, authoring contract and execution-style generative-sequence pages in the primary reading path with a single publication-facing bridge: `publication/part-iii.md`.

PR-01 narrows the status claim. The bridge now explains the distinction between constitutional provisions, strategies, patterns, implementation families and occurrences; the five editorial pattern fields; evidence boundaries; sparse relational use; the demonstrated service-topology sequence; the three strategies; and the four held candidates. It does not represent the whole 21-pattern corpus as one uniformly mature Alexander-style pattern language.

The canonical pattern records remain authoritative. Their architectural names now lead reader-facing presentation; stable `HSA-P-*` IDs remain provenance and machine-readable identity rather than publication rank. Repository mechanics such as frontmatter contracts, admission administration and pattern-index generation remain available online but do not read as book chapters.

The three strategy pages and four held-candidate pages remain in the Working Edition after the 21 canonical patterns. Their repository index wrappers are omitted because the publication-facing Part III already explains their status and boundary.

### Part IV — Reference House

PR-00B1/B2 replaced the previous bundle of Reference House control/development records with a publication-native synthesis: [`part-iv.md`](../manuscript/part-iv.md).

The six chapters correspond to the publication architecture: Site and type; Architectural order, repose and tectonic language; Material, structural and assembly system; Maintenance geography; Water and environmental systems; and Future maintenance scenarios.

The manuscript source does not become architectural authority by being publication-facing. Canonical Reference House and G-01 records remain the source of project truth; Part IV owns the coherent reader-facing explanation. PR-01 now also makes the house's evidential asymmetry explicit: its detached courtyard morphology is deliberately favourable to several serviceability moves, and transfer must be tested separately rather than inferred from the worked house. Gate/status administration and repository wayfinding stay outside the primary book.

### Part V and back matter

Part V enters directly from [`part-v.md`](../manuscript/part-v.md). Prototype, professional-review, delivery and computational records remain supporting tracks unless prose is deliberately incorporated into Part V later.

PR-00B4 completed the retained back-matter set as six distinct reader functions, with PR-01 corrections now propagated where they affect current authority:

- **Evidence and Precedent Notes** explains how external knowledge, precedent, internal design research and physical/professional evidence are used and bounded.
- **Legacy Doctrine Register Crosswalk** recovers the real 63-item House Design Doctrine v7 register from git history and maps it into the current governing constitution / downstream authority layers without re-promoting obsolete statements.
- **Research Agenda** records questions capable of falsifying or materially improving the work rather than generic future-work placeholders, now including explicit future-climate robustness.
- **Reference House Implementation Schedule** marks the boundary between current virtual coordination and real-site, professional, physical and delivery gates, including life-course adaptation, proportionality, novelty-budget and future-climate obligations.
- **Glossary** consolidates project-specific terms.
- **Sources and Further Reading** remains the selective external reading list.

The separately proposed pattern-map/generative-sequence appendix remains omitted: the publication-native Part III performs that function, so a second appendix would duplicate rather than deepen the book.

## Explicit whole-corpus exclusions

The following remain accessible online but are not recursively compiled into the Working Edition:

- root `README.md` and `STATUS.md`;
- `docs/reading-guide.md` and `docs/README.md`;
- `docs/research/`;
- `docs/development/`;
- `docs/prototypes/`;
- `docs/delivery/` including the separate implementation brief;
- `docs/computational/` as a standalone publication part;
- `docs/grammar/` research/case material;
- pattern authoring/index/migration/history/provenance material not explicitly listed in the manifest;
- Reference House control, review and development records except where publication prose deliberately synthesises them;
- the deleted House Design Doctrine v7 source itself; only its 63-item register is preserved through a current publication crosswalk.

These exclusions preserve the repository's authority boundaries rather than treating the PDF as an archive export.

## Machine invariants

The publication validator should continue to fail when:

- an included source or adapter dependency is missing;
- a primary source or manifest ID is duplicated;
- unsupported website-only constructs reach print without an explicit adapter;
- canonical active pattern IDs are missing, duplicated or out of editorial order;
- retired identities enter the active pattern sequence;
- local images referenced by publication sources are missing;
- a deterministic adapter produces empty output;
- the generated scope block above differs from `publication/publication.ts`.

The preparation/build layer separately ensures that excluded Markdown links become live-site URLs, included Markdown links become internal publication destinations, and canonical sources are not mutated during preparation.

If a build reveals another website-only construct or a new publication exception, add an explicit adapter or change the scope decision here. Do not silently strip content or duplicate the manifest by hand.