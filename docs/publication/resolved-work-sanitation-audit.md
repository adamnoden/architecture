<!-- nav-exclude: redirect -->
# Resolved-work sanitation audit

**Programme:** PUB-SAN / issue #133  
**Baseline:** `main` at `7f13c2eb825ff5f83958fbb5abeee37b6125aebe`  
**Status:** SAN-00 and SAN-01 complete; SAN-02/SAN-03 in progress

## SAN-00 — reader-facing build graph

### Website

VitePress publishes Markdown from the repository and maps repository routes into the clean public route tree. Prior to this programme, every substantive Markdown page was deliberately placed in navigation and therefore internal development/history material was intentionally exposed rather than merely accidentally reachable.

The sanitation boundary is now explicit: repository ownership and public readability are separate. Internal records remain in place for project continuity but are excluded from the public build and filtered from public navigation.

### Full PDF

The Working Edition is assembled from `publication/publication.ts` by `publication/scripts/prepare.ts`. Canonical Markdown remains the source; adapters and figures transform it into the print worktree. Back matter previously included development provenance, including the legacy doctrine crosswalk.

### Primer PDF

The Primer is separately manifested from the same publication module and derives current principles, patterns and Reference House material through deterministic adapters. It does not depend on the legacy doctrine crosswalk.

## SAN-01 — high-confidence residue register

| Surface | Item / class | Classification | Reason / action |
|---|---|---|---|
| Full PDF + site | `doctrine-register-crosswalk.md` / “Appendix B — Legacy Doctrine Register Crosswalk” | **INTERNALISE** | Pure migration/provenance apparatus. Its only purpose is to explain how House Design Doctrine v7 became the current system. Current principles/patterns already own the surviving ideas. Removed from PDF and public site; retained internally. |
| Site | `docs/development/**`, `docs/editorial/**`, `docs/publication/**` | **INTERNALISE** | Programme control, migration, editorial machinery and sanitation records describe how the work is produced rather than the resolved architectural work. |
| Site | `STATUS.md` and `docs/README.md` | **INTERNALISE** | Project/repository management surfaces. Useful to contributors; unnecessary to an external reader. |
| Site | publication architecture / release / PR-00 control records | **INTERNALISE** | Build/release governance and candidate-book history. |
| Site | pattern pilot, retired identities, legacy aggregates and pre-admission candidate material | **INTERNALISE** | Historical identity/provenance rather than the current pattern language. |
| Site | obvious grammar process records | **INTERNALISE** | Modelling-correction, research-brief, completion-programme, superseded evidence-pass and D10-S programme records describe derivation process rather than the resolved grammar. |
| Site | RH-C0/RH-C1 baseline/discrepancy/parity records and explicit Reference House development-history pages | **INTERNALISE** | Records the sequence and machinery of resolution rather than the resolved house. |
| Site | external-review response template | **INTERNALISE** | Working instrument for future review, not reader-facing architectural content. |
| Site | historical targeted Pattern Language evidence pass | **INTERNALISE** | Phase-labelled historical research residue. |
| Site | P03 structural floor-edge handoff | **INTERNALISE** | Internal handoff record; the live engineering question and test protocol may remain reader-useful. |
| Site | compiler hardening/model-freeze/output-architecture programmes | **INTERNALISE** | Software-quality programme records rather than the resolved computational proposition. |
| Site | computational pattern crosswalks | **INTERNALISE** | Translation/migration apparatus. |
| Site | paper-compilation, research-programme and S0/S1/S2/H1 run/source/target history | **INTERNALISE** | Compiler-development chronology; retain internally. |
| Site | P0 implementation plan | **INTERNALISE** | Completed implementation programme rather than current computational content. |

## SAN-02 / SAN-03 — semantic review fronts

The remaining work cannot be solved by filename or keyword alone. Several current reader-facing sources contain legitimate architectural knowledge wrapped in development-stage language. The priority fronts are:

1. **Publication prose.** Remove PR/R-stage references, migration explanations and internal proof-family codes where the reader only needs the resolved proposition or evidence.
2. **G-01.** Preserve `G-01 v0.1` as a formal grammar identity, but remove D-stage release/process framing from the primary specification. Retain falsification and held-out evidence in reader-appropriate form rather than as a chronology of programme stages.
3. **Reference House.** Replace P03/P04, W0/W1/W2 and similar internal shorthand with semantic names where the codes do not improve comprehension. Preserve external regulatory classifications and genuinely stable architectural identifiers.
4. **Research Agenda / implementation schedule.** Keep their substantive open questions and real-project gates while removing references such as `PR-01`, `R8-A` and internal gate IDs.
5. **Evidence pages.** Determine whether raw grammar validation/evidence pages deserve reader-facing synthesis or should be internalised after unique evidence has been migrated.

## Semantic guardrail

An internal identifier is not removed merely because it is alphanumeric. The distinction is functional:

- a stable formal specification identity such as `G-01 v0.1` may be useful to a reader;
- an external standard or regulatory category must remain where relevant;
- a development-stage label such as `PR-01`, `D10-S`, `RH-C0` or `R8-A` should not survive in publication prose merely because the project used it internally.

Before any source is merged or internalised, unique architectural claims, distinctions, constraints, evidence and useful formulations must be mapped to a resolved destination.

## Guardrail introduced

`project/public-surface.ts` is the explicit public/private boundary. VitePress excludes internalised sources from the public build and filters their navigation entries, while the repository continues to retain them. Route validation now asserts coverage over the intentional public corpus rather than equating “Markdown exists” with “the public should see it”.

This corrects the underlying information-architecture error rather than merely deleting one appendix.
