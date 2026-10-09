# Print publication scope crosswalk

**Status:** G2 working record  
**Date:** 2026-10-09  
**Authority:** [`../manuscript/publication-architecture.md`](../manuscript/publication-architecture.md)  
**Pipeline control:** [`print-publication-pipeline.md`](print-publication-pipeline.md)

This crosswalk answers one mechanical question: **which canonical repository sources currently become the Working Edition, and which deliberately do not?**

It is not a new publication outline. Where this record conflicts with the publication architecture, the publication architecture wins.

## Scope rules

1. Compile current publication-facing canonical material; do not fill manuscript gaps with web navigation or programme-control documents.
2. Preserve repository ownership. Part III and Part IV enter from `patterns/` and `reference-house/` rather than copied manuscript duplicates.
3. Supporting evidence remains supporting evidence. Research pages are linked to the live site unless and until publication prose incorporates them.
4. Historical and migration records remain online provenance rather than primary linear reading.
5. Dynamic website-only representation may receive a deterministic **print adapter** only when the underlying canonical content is already publication-facing. An adapter may render existing data statically; it may not invent or rewrite the argument.
6. Missing target material remains visibly missing in the Working Edition. The print pipeline is not authorised to manufacture an abstract, glossary, bibliography or Reference House chapter merely to complete the table of contents.

## Front matter

| Publication target | Current source | Working Edition treatment |
|---|---|---|
| Title / subtitle | publication metadata | **Generated mechanically** in G3; no prose source required |
| Preface — *The Obvious, Eventually* | `docs/manuscript/preface.md` | **Include directly** |
| Abstract | no dedicated canonical publication source | **Missing / defer**; do not substitute root README |
| How to read the book | `docs/reading-guide.md` is primarily website wayfinding | **Missing / defer**; do not print the web reading guide as front matter |
| Definitions | no dedicated canonical publication source | **Missing / defer** |
| Evidence and maturity legend | concepts distributed through current corpus | **Missing / defer** until publication-facing source exists |
| Governing constraints | governing principles exist, but are Part I content | **Do not duplicate in front matter** |

The generated table of contents is print mechanics rather than authored front matter and may appear from G2 onward.

## Preface and Part I — The Proposition

| Publication role | Canonical source | Treatment |
|---|---|---|
| Preface | `docs/manuscript/preface.md` | **Include** |
| Chapters 1–4: house after completion; different speeds; selective permanence; architectural platform | `docs/manuscript/part-i.md` | **Include** |
| Chapter 5: eleven principles | `docs/manuscript/governing-principles.md` | **Include** |
| Developed Principle 8 spread | `docs/manuscript/principle-08-repose.md` + owned SVG | **Include** after governing principles |

The separate Principle 8 piece is an intended developed insert, not accidental duplication. Its evidence links remain live-site links where the research records themselves are outside the book.

## Part II — Architecture of the Platform

| Publication role | Canonical source | Treatment |
|---|---|---|
| Chapters 6–12 | `docs/manuscript/part-ii.md` | **Include** |
| Developed exterior maintenance insert | `docs/manuscript/maintenance-geography-external.md` | **Include** with Part II |

Research syntheses cited by these chapters remain outside the primary PDF.

## Part III — Pattern Language

Part III is a professional reference layer, not another prose version of Part II. Stable IDs are identity only; the detailed pattern order follows the editorial grouping already established in the publication architecture.

### Part III opening and method

| Publication role | Canonical source | Treatment |
|---|---|---|
| Pattern-language overview/index | `docs/patterns/README.md` | **Include through deterministic `pattern-index` adapter** because the website list is Vue-generated |
| Language model and authoring contract | `docs/patterns/language-model.md` | **Include** |
| First worked generative sequence | `docs/patterns/service-topology-sequence.md` | **Include** |

The Pattern index adapter may only replace the `<script setup>` and Vue-rendered active/retired lists with static Markdown derived from canonical pattern frontmatter. All authored prose remains unchanged.

### Active canonical patterns — publication order

**A · Service geography and distribution**

1. `docs/patterns/controlled-utility-entry.md` — HSA-P-001
2. `docs/patterns/plant-room-service-hub.md` — HSA-P-002
3. `docs/patterns/accessible-vertical-service-zone.md` — HSA-P-014
4. `docs/patterns/coherent-horizontal-service-route.md` — HSA-P-003
5. `docs/patterns/accessible-room-service-route.md` — HSA-P-015
6. `docs/patterns/high-service-room-service-wall.md` — HSA-P-004
7. `docs/patterns/designed-structural-penetration.md` — HSA-P-005
8. `docs/patterns/compartmented-service-void.md` — HSA-P-016

**B · Water, leakage and failure**

9. `docs/patterns/visible-leakage-path.md` — HSA-P-017
10. `docs/patterns/failure-tolerant-wet-service-room.md` — HSA-P-018
11. `docs/patterns/accessible-rainwater-route.md` — HSA-P-009

**C · Openings, movement and attachment**

12. `docs/patterns/permanent-opening-replaceable-window.md` — HSA-P-007
13. `docs/patterns/permanent-opening-replaceable-door.md` — HSA-P-019
14. `docs/patterns/designed-threshold.md` — HSA-P-020
15. `docs/patterns/movement-slip-junction.md` — HSA-P-008
16. `docs/patterns/controlled-attachment-plane.md` — HSA-P-022

**D · Environment and external maintenance geography**

17. `docs/patterns/source-capture-kitchen-extract.md` — HSA-P-010
18. `docs/patterns/source-capture-bathroom-extract.md` — HSA-P-021
19. `docs/patterns/roof-maintenance-route.md` — HSA-P-011
20. `docs/patterns/ground-supported-facade-access.md` — HSA-P-013

**E · Stewardship**

21. `docs/patterns/physical-service-index.md` — HSA-P-012

All 21 are **included directly**. Their frontmatter remains source metadata and must not print as prose.

### Strategies

| Source | Treatment |
|---|---|
| `docs/patterns/strategies/README.md` | **Include** as the strategy boundary/index |
| `docs/patterns/strategies/fail-safe-water-distribution.md` | **Include** |
| `docs/patterns/strategies/decompose-structural-interface-functions.md` | **Include** |
| `docs/patterns/strategies/separate-structural-floor-changeable-layers.md` | **Include** |

Strategies remain visibly outside the 21-pattern count.

### Held candidate bench

| Source | Treatment |
|---|---|
| `docs/patterns/candidates/README.md` | **Include** as candidate boundary/index |
| `docs/patterns/candidates/replaceable-architectural-lining.md` | **Include** |
| `docs/patterns/candidates/individually-isolatable-manifold-distribution.md` | **Include** |
| `docs/patterns/candidates/local-deep-service-zone.md` | **Include** |
| `docs/patterns/candidates/selective-floor-access.md` | **Include** |

The pre-admission Accessible Vertical Service Zone candidate remains provenance and is **excluded**.

### Retired and migration material

`HSA-P-006` remains visible in the adapted Pattern index as a retired identity and through links, but its full retired page is **not** in the primary linear Part III. `core-12.md`, the pilot, reversible-assembly legacy material and other migration records remain **excluded provenance**.

## Part IV — Reference House

The publication architecture defines a six-chapter target for Part IV, but current Reference House material is still L2–L3 and is organised as live coordination records rather than six finished manuscript chapters. The Working Edition should expose that state instead of fabricating a finished narrative.

Include the current primary, non-historical Reference House set in this order:

1. `docs/reference-house/README.md` — overview, scope and authority boundary;
2. `docs/reference-house/tectonic-architectural-language.md` — current architectural/tectonic resolution;
3. `docs/reference-house/vertical-bay-options.md` — current options work;
4. `docs/reference-house/vertical-bay-coordination.md` — current coordination;
5. `docs/reference-house/whole-house-coordination-fixture.md` — current whole-house integration fixture + owned SVG;
6. `docs/reference-house/pattern-occurrence-register.md` — canonical project occurrence mapping;
7. `docs/reference-house/external-access-maintenance-plan.md` — current exterior maintenance plan.

This order follows a reader from architectural scope → local tectonic/vertical resolution → whole-house coordination → pattern audit → external maintenance. It is a **Working Edition order**, not a claim that the final six Part-IV chapters are complete.

Exclude from the primary Part IV:

- `service-topology-coordination.md`;
- `service-topology-run-01.md`;
- G-01 grammar research/case corpus under `docs/grammar/`;
- research evidence packs;
- development/audit records.

The Reference House may link to those resources on the live site.

## Part V — Making and Testing the Platform

| Publication role | Canonical source | Treatment |
|---|---|---|
| Chapters 19–25 | `docs/manuscript/part-v.md` | **Include directly** |

Prototype, professional-review, delivery and computational records remain supporting tracks unless prose is deliberately incorporated into Part V later.

## Back matter

The publication architecture names evidence notes, doctrine register, research agenda, Reference House implementation schedule, pattern map/generative notes, glossary, bibliography and standards. These are not currently assembled as canonical publication-facing back matter.

**G2 treatment: omit rather than substitute.**

The generated PDF may therefore end after current Part V in the Working Edition. Missing back matter is an editorial completion task for later gates, not a renderer defect.

## Explicit whole-corpus exclusions

These areas remain accessible online but are not recursively compiled into the primary PDF:

- root `README.md` and `STATUS.md`;
- `docs/reading-guide.md` and `docs/README.md`;
- `docs/research/`;
- `docs/development/`;
- `docs/prototypes/`;
- `docs/delivery/` including the separate implementation brief;
- `docs/computational/` as a standalone publication part;
- `docs/grammar/` research/case material;
- pattern migration/history/provenance material;
- Reference House historical service-topology records.

These exclusions preserve the repository's established authority boundaries rather than treating the PDF as an archive export.

## G2 implementation consequences

The full manifest should therefore contain roughly fifty entries rather than the entire documentation corpus. It should validate:

- every included source exists;
- no source appears twice;
- every raw Vue construct has a named deterministic adapter;
- all canonical active pattern IDs appear exactly once and in the editorial order above;
- retired IDs do not accidentally enter the active pattern sequence;
- excluded Markdown links become live-site URLs;
- included Markdown links become internal publication destinations;
- generated/adapted output never mutates canonical source.

If the first full build reveals another website-only construct, stop and add an explicit adapter or change the scope decision here. Do not silently strip it.
