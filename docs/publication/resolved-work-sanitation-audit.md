<!-- nav-exclude: redirect -->
# Resolved-work sanitation audit

**Programme:** PUB-SAN / issue #133  
**Governing rule:** **The publication contains the resolved work, not the history of its resolution.**  
**Current state:** SAN-00 through SAN-06 complete on PR #150; content validation passed on `79fd0218fd38d7854292b089618545c9ba16af7e`; final metadata-only closeout validation remains before merge.

Losslessness means preservation of architectural ideas, evidence, constraints and useful distinctions—not preservation of draft chronology, migrations, gate names or superseded formulations on reader-facing surfaces.

## Result

The website and PDFs now have an explicit public/internal boundary. Repository ownership no longer implies publication. VitePress navigation and public build filtering use the same boundary, while the Working Edition and Primer are assembled from explicit manifests.

The original trigger—**Legacy Doctrine Register Crosswalk / House Design Doctrine v7**—is no longer part of the public site or Working Edition. Development, editorial and publication-control records remain recoverable in Git without being treated as reader-facing intellectual content.

## Reader-facing corpus

The sanitation pass covered the complete public path rather than only keyword matches:

`Project overview → Reading guide → manuscript Parts I–V → Pattern Language → G-01 → Reference House → Research/evidence → Computational track → back matter / sources`

The final public corpus now states current arguments and capability directly:

- the manuscript presents the resolved architectural proposition rather than release/migration history;
- the pattern system exposes 21 current patterns, 3 strategies and 4 held candidates without retired-pattern archaeology or migration footers;
- G-01 presents a current specification, evidence method, precedent cases, dimensional/topological/coupling evidence and validation limits without requiring readers to follow D-stage chronology;
- the Reference House presents one current coordinated building proposition and current technical/proof boundaries rather than RH-stage progression;
- research pages present evidence, comparisons and open questions rather than doctrine-writing or hardening programmes;
- prototype pages expose evidence questions without publishing pre-test administration as results;
- computational pages state current semantic capability and proof limits without implying that paper-compilation/H1 research families form a release-grade technical library;
- back matter has only enduring reader functions: evidence/precedent notes, research agenda, implementation schedule, glossary and sources/further reading.

## Material intentionally internalised

High-confidence internal-only classes include:

- legacy doctrine versions and doctrine crosswalks;
- publication/editorial/release-control programmes and ledgers;
- retired/pilot pattern records and migration checkpoints;
- raw G-01 research-stage/falsification programme records after findings were synthesised;
- Reference House model-freeze, discrepancy, restart and RH-stage gate records after current conclusions were migrated;
- stale whole-house fixture outputs;
- prototype build packs and pre-result test administration;
- compiler hardening, model-freeze, paper-compilation, capability-gate and old H1 family records after durable semantics were migrated.

The detailed semantic owner map is recorded in `docs/publication/resolved-work-sanitation-closeout.md`.

## Unique-content verification

Internalisation or deletion was not allowed merely because a document looked historical. Unique architectural claims, distinctions, evidence, constraints and useful formulations were either:

1. migrated to a current resolved owner;
2. retained under a present identity where the identifier still carries authority; or
3. explicitly rejected as stale/obsolete rather than silently preserved.

The stale Whole-House Coordination Fixture is the clearest example of the third case: its old 12.6 × 11.4 m / 3.6 × 3.6 m geometry remains repository history while the current 12.0 × 10.8 m / 3.6 × 4.0 m Reference House and generated inspection plan own the reader-facing state.

Current identities such as `G-01 v0.1`, `PAT-*`, House Kernel and Metamorph Compiler remain because they describe present authority or stable cross-reference, not development chronology.

## Regression prevention

`scripts/validate-resolved-public-surface.ts` is part of `npm test`. It scans public Markdown sources for high-confidence development residue and rejects reader-facing links into internal-only Markdown. It also rejects migration-style `**Provenance:**` footers.

This prevents the original failure mode—internal project archaeology leaking back into public publication—from being reintroduced casually.

## Validation

PR #150 content head `79fd0218fd38d7854292b089618545c9ba16af7e` passed the full **Validate pull request** workflow (`run 423`, workflow run `38874440924`). The suite covers type checking, repository health, route/public-surface validation, compiler/Reference House regression tests, generated-output integrity, publication validation/integrity and the VitePress build.

The only remaining action is to validate this metadata-only audit/closeout update, merge PR #150 and close issue #133.

## Closeout condition

Once the metadata-only head is green, PUB-SAN is complete. Future work should treat the public/internal boundary and sanitation guard as standing publication infrastructure rather than reopen the development-history corpus for completeness.