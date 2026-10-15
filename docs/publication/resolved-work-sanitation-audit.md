# Resolved-work sanitation audit

**Programme:** PUB-SAN / issue #133  
**Baseline:** `main` at `7f13c2eb825ff5f83958fbb5abeee37b6125aebe`  
**Status:** SAN-00 complete; SAN-01 high-confidence tranche in execution

## SAN-00 — reader-facing build graph

### Website

VitePress publishes Markdown from the repository and maps repository routes into the clean public route tree. Prior to this programme, every substantive Markdown page was deliberately placed in navigation and therefore internal development/history material was intentionally exposed rather than merely accidentally reachable.

The sanitation boundary is now explicit: repository ownership and public readability are separate. Internal records remain in place for project continuity but are excluded from the public build and filtered from public navigation.

### Full PDF

The Working Edition is assembled from `publication/publication.ts` by `publication/scripts/prepare.ts`. Canonical Markdown remains the source; adapters and figures transform it into the print worktree. Back matter was previously allowed to include development provenance, including the legacy doctrine crosswalk.

### Primer PDF

The Primer is separately manifested from the same publication module and derives current principles, patterns and Reference House material through deterministic adapters. It does not depend on the legacy doctrine crosswalk.

## SAN-01 — high-confidence residue register

| Surface | Item / class | Classification | Reason / action |
|---|---|---|---|
| Full PDF + site | `doctrine-register-crosswalk.md` / “Appendix B — Legacy Doctrine Register Crosswalk” | **INTERNALISE** | Pure migration/provenance apparatus. Its only purpose is to explain how House Design Doctrine v7 became the current system. Current principles/patterns already own the surviving ideas. Remove from PDF and public site; retain repo/Git history only. |
| Site | `docs/development/**` | **INTERNALISE** | Programme control, migration, audit and integration history. Valuable internally; not part of the resolved reader-facing work. |
| Site | `docs/editorial/**` | **INTERNALISE** | Editorial machinery describes how the text is produced, not the architectural argument. |
| Site | publication architecture / release / PR-00 control records | **INTERNALISE** | Build/release governance and candidate-book history. Keep in repo; remove from reader navigation/build. |
| Site | pattern pilot, retired identities and legacy aggregates | **INTERNALISE** | Historical identity/provenance rather than the current pattern language. |
| Site | RH-C0/RH-C1 baseline/discrepancy/parity records | **INTERNALISE** | Compiler/reference-fixture validation records. They support project control but do not belong in the primary architectural reading surface. |
| Site | explicit Reference House development-history pages | **INTERNALISE** | Records the sequence of resolution rather than the resolved house. |
| Site | historical targeted Pattern Language evidence pass | **INTERNALISE** | Phase-labelled historical research residue. |
| Site | compiler hardening/model-freeze/output-architecture programmes | **INTERNALISE** | Software-quality programme records rather than the resolved computational proposition. |
| Site | computational pattern crosswalks | **INTERNALISE** | Translation/migration apparatus. |
| Site | paper-compilation and S0/S1/S2/H1 run/source/target history | **INTERNALISE** | Compiler-development chronology; retain internally. |
| Site | `STATUS.md`, documentation structure, development/editorial navigation | **INTERNALISE** | Project-management surface. Useful in the repository, unnecessary in the public reading experience. |

## Deferred semantic review

The following are deliberately **not** removed mechanically because they may contain reader-useful evidence rather than mere project history:

- G-01 falsification/held-out validation and grammar evidence records;
- current external-review packs and evidence trials;
- prototype build/test protocols that remain live validation instruments;
- Research Agenda and Reference House Implementation Schedule;
- current computational model, family and validity documents;
- source/evidence registers that substantiate current claims.

These require SAN-02/SAN-03 reading before any public removal.

## Guardrail introduced

`project/public-surface.ts` is the explicit public/private boundary. VitePress excludes internalised sources from the public build and filters their navigation entries, while the repository continues to retain them. Route validation is being changed to assert coverage over the intentional public corpus rather than equating “Markdown exists” with “the public should see it”.

This corrects the underlying information-architecture error rather than merely deleting one appendix.
