# Print publication scope crosswalk

**Status:** maintained editorial scope record + generated manifest view  
**Updated:** 2026-10-14  
**Editorial authority:** [`../manuscript/publication-architecture.md`](../manuscript/publication-architecture.md)  
**Machine compile authority:** [`../../publication/publication.ts`](../../publication/publication.ts)  
**Pipeline control:** [`print-publication-pipeline.md`](print-publication-pipeline.md)

This record keeps the two publication authorities distinct. The publication architecture states **what the book means and how it should be organised**. `publication/publication.ts` states **the exact source/order currently compiled into the Working Edition**. The generated table below exposes that machine scope without maintaining a second hand-written manifest.

Where editorial intent and machine scope disagree, stop and reconcile them deliberately. Do not treat either drift direction as self-correcting.

## Scope rules

1. Compile current publication-facing canonical material; do not fill manuscript gaps with web navigation or programme-control documents.
2. Preserve repository ownership while allowing publication-native synthesis. Part III remains sourced from the canonical pattern language; Part IV may be authored under `docs/manuscript/` when it synthesises rather than duplicates the canonical Reference House records.
3. Supporting evidence remains supporting evidence. Research pages stay outside the primary PDF unless publication prose incorporates them deliberately.
4. Historical and migration records remain online provenance rather than primary linear reading.
5. Dynamic website-only representation may receive a deterministic **print adapter** only when the underlying canonical content is already publication-facing. An adapter may render or compose existing source; it may not invent the argument.
6. Missing target material remains visibly missing. Back matter enters the Working Edition only when a canonical publication-facing source exists.

## Current Working Edition manifest

<!-- generated: publication-manifest:start -->
> Generated from `publication/publication.ts`. Do not hand-edit this table; run `npm run publication:scope:update` after changing the Working Edition manifest.

| # | Kind | Publication title | Primary source | Adapter |
|---:|---|---|---|---|
| 1 | preface | Preface — The Obvious, Eventually | `docs/manuscript/preface.md` | `—` |
| 2 | front-matter | Reader's Guide | `docs/manuscript/readers-guide.md` | `—` |
| 3 | part | Part I — The Proposition | `docs/manuscript/part-i.md` | `part-i-composite` |
| 4 | part | Part II — Architecture of the Platform | `docs/manuscript/part-ii.md` | `part-ii-composite` |
| 5 | index | Part III — Pattern Language | `docs/patterns/README.md` | `pattern-index` |
| 6 | method | Pattern Language — Model and Authoring Contract | `docs/patterns/language-model.md` | `—` |
| 7 | method | Service Topology — Generative Sequence | `docs/patterns/service-topology-sequence.md` | `—` |
| 8 | pattern | HSA-P-001 — Controlled Utility Entry | `docs/patterns/controlled-utility-entry.md` | `pattern-page` |
| 9 | pattern | HSA-P-002 — Plant Room as Service Hub | `docs/patterns/plant-room-service-hub.md` | `pattern-page` |
| 10 | pattern | HSA-P-014 — Accessible Vertical Service Zone | `docs/patterns/accessible-vertical-service-zone.md` | `pattern-page` |
| 11 | pattern | HSA-P-003 — Coherent Horizontal Service Route | `docs/patterns/coherent-horizontal-service-route.md` | `pattern-page` |
| 12 | pattern | HSA-P-015 — Accessible Room Service Route | `docs/patterns/accessible-room-service-route.md` | `pattern-page` |
| 13 | pattern | HSA-P-004 — High-Service-Room Service Wall | `docs/patterns/high-service-room-service-wall.md` | `pattern-page` |
| 14 | pattern | HSA-P-005 — Designed Structural Penetration | `docs/patterns/designed-structural-penetration.md` | `pattern-page` |
| 15 | pattern | HSA-P-016 — Compartmented Service Void | `docs/patterns/compartmented-service-void.md` | `pattern-page` |
| 16 | pattern | HSA-P-017 — Visible Leakage Path | `docs/patterns/visible-leakage-path.md` | `pattern-page` |
| 17 | pattern | HSA-P-018 — Failure-Tolerant Wet Service Room | `docs/patterns/failure-tolerant-wet-service-room.md` | `pattern-page` |
| 18 | pattern | HSA-P-009 — Accessible Rainwater Route | `docs/patterns/accessible-rainwater-route.md` | `pattern-page` |
| 19 | pattern | HSA-P-007 — Permanent Opening / Replaceable Window | `docs/patterns/permanent-opening-replaceable-window.md` | `pattern-page` |
| 20 | pattern | HSA-P-019 — Permanent Opening / Replaceable Door | `docs/patterns/permanent-opening-replaceable-door.md` | `pattern-page` |
| 21 | pattern | HSA-P-020 — Designed Threshold | `docs/patterns/designed-threshold.md` | `pattern-page` |
| 22 | pattern | HSA-P-008 — Movement / Slip Junction | `docs/patterns/movement-slip-junction.md` | `pattern-page` |
| 23 | pattern | HSA-P-022 — Controlled Attachment Plane | `docs/patterns/controlled-attachment-plane.md` | `pattern-page` |
| 24 | pattern | HSA-P-010 — Source-Capture Kitchen Extract | `docs/patterns/source-capture-kitchen-extract.md` | `pattern-page` |
| 25 | pattern | HSA-P-021 — Source-Capture Bathroom Extract | `docs/patterns/source-capture-bathroom-extract.md` | `pattern-page` |
| 26 | pattern | HSA-P-011 — Roof Maintenance Route | `docs/patterns/roof-maintenance-route.md` | `pattern-page` |
| 27 | pattern | HSA-P-013 — Ground-Supported Façade Access | `docs/patterns/ground-supported-facade-access.md` | `pattern-page` |
| 28 | pattern | HSA-P-012 — Physical Service Index | `docs/patterns/physical-service-index.md` | `pattern-page` |
| 29 | strategy | Strategies | `docs/patterns/strategies/README.md` | `—` |
| 30 | strategy | Fail-Safe Water Distribution | `docs/patterns/strategies/fail-safe-water-distribution.md` | `—` |
| 31 | strategy | Decompose Structural Interface Functions | `docs/patterns/strategies/decompose-structural-interface-functions.md` | `—` |
| 32 | strategy | Separate Structural Floor from Changeable Layers | `docs/patterns/strategies/separate-structural-floor-changeable-layers.md` | `—` |
| 33 | candidate | Held Pattern Candidates | `docs/patterns/candidates/README.md` | `—` |
| 34 | candidate | Replaceable Architectural Lining | `docs/patterns/candidates/replaceable-architectural-lining.md` | `—` |
| 35 | candidate | Individually Isolatable Manifold Distribution | `docs/patterns/candidates/individually-isolatable-manifold-distribution.md` | `—` |
| 36 | candidate | Local Deep Service Zone | `docs/patterns/candidates/local-deep-service-zone.md` | `—` |
| 37 | candidate | Selective Floor Access | `docs/patterns/candidates/selective-floor-access.md` | `—` |
| 38 | part | Part IV — Reference House | `docs/manuscript/part-iv.md` | `—` |
| 39 | part | Part V — Making and Testing the Platform | `docs/manuscript/part-v.md` | `part-v-wrapper` |
| 40 | back-matter | Sources and further reading | `docs/manuscript/sources-and-further-reading.md` | `—` |
<!-- generated: publication-manifest:end -->

The generated block is checked by `publication:validate`. A manifest change therefore fails normal repository tests until this report is regenerated with `npm run publication:scope:update` and the resulting scope change is reviewed.

## Editorial interpretation of the manifest

### Front matter and Parts I–II

The generated title page and contents are print mechanics and therefore do not appear as source entries. The canonical [`Reader's Guide`](../manuscript/readers-guide.md) consolidates the abstract, reading guidance, definitions, evidence/maturity legend and governing constraints.

Part I is a composition: [`part-i.md`](../manuscript/part-i.md) owns the argument while the adapter inserts the canonical [`governing-principles.md`](../manuscript/governing-principles.md) and developed [`principle-08-repose.md`](../manuscript/principle-08-repose.md) at their intended positions. Part II similarly inserts [`maintenance-geography-external.md`](../manuscript/maintenance-geography-external.md). These dependencies are validated by the publication adapter system; they are not additional primary manifest entries.

### Part III — Pattern Language

Part III is a professional reference layer rather than another prose version of Part II. The manifest order is the machine-readable publication order; stable pattern IDs remain identity rather than rank.

The Pattern Index receives a deterministic print adapter because its website list is Vue-generated. Pattern frontmatter remains source metadata rather than printed prose. `HSA-P-006` stays visible through the index as a retired identity but its full retired page does not enter the primary linear publication. The pre-admission Accessible Vertical Service Zone candidate and other migration/pilot records remain provenance rather than Working Edition entries.

Strategies remain visibly outside the 21-pattern count. Held candidates remain visibly outside the canonical language.

### Part IV — Reference House

PR-00B replaces the previous bundle of Reference House control/development records with a publication-native synthesis: [`part-iv.md`](../manuscript/part-iv.md).

The six chapters now correspond to the publication architecture:

13. Site and type;
14. Architectural order, repose and tectonic language;
15. Material, structural and assembly system;
16. Maintenance geography;
17. Water and environmental systems;
18. Future maintenance scenarios.

The manuscript source does not become architectural authority by being publication-facing. Canonical Reference House and G-01 records remain the source of project truth; Part IV owns the coherent reader-facing explanation. Gate/status administration and repository wayfinding stay outside the primary book.

### Part V and back matter

Part V enters directly from [`part-v.md`](../manuscript/part-v.md). Prototype, professional-review, delivery and computational records remain supporting tracks unless prose is deliberately incorporated into Part V later.

Of the back matter named by the publication architecture, only [`Sources and further reading`](../manuscript/sources-and-further-reading.md) currently has a canonical publication-facing source and therefore enters the Working Edition. Evidence/precedent notes, the doctrine register, research agenda, Reference House implementation schedule and glossary remain genuine PR-00B editorial work. The pattern map/generative material already lives in Part III and should not be duplicated merely to fill an appendix slot.

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
- pattern migration/history/provenance material;
- Reference House control, review and development records except where publication prose deliberately synthesises them.

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