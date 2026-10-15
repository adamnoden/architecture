# Print publication scope crosswalk

**Status:** internal publication-control record  
**Updated:** 2026-10-15  
**Editorial authority:** [`../manuscript/publication-architecture.md`](../manuscript/publication-architecture.md)  
**Machine compile authority:** [`../../publication/publication.ts`](../../publication/publication.ts)

This file records the exact machine scope of the Working Edition. It is intentionally internal: the book presents resolved work, while this record exists to catch publication-scope drift.

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
| 37 | back-matter | Appendix C — Research Agenda | `docs/manuscript/research-agenda.md` | `—` |
| 38 | back-matter | Appendix D — Reference House Implementation Schedule | `docs/manuscript/reference-house-implementation-schedule.md` | `—` |
| 39 | back-matter | Appendix E — Glossary | `docs/manuscript/glossary.md` | `—` |
| 40 | back-matter | Appendix F — Sources and Further Reading | `docs/manuscript/sources-and-further-reading.md` | `—` |
<!-- generated: publication-manifest:end -->

## Scope rule

The manifest may contain only current reader-facing argument, canonical patterns/strategies/candidates deliberately retained for the reader, the Reference House synthesis, and back matter with a distinct intellectual or technical function. Development history, migration records, release control and drafting provenance remain outside the Working Edition.

The generated block is checked by `publication:validate`; any manifest change therefore requires an explicit scope refresh and review.
