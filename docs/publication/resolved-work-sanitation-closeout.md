<!-- nav-exclude: redirect -->
# Resolved-work sanitation closeout

**Programme:** PUB-SAN / issue #133  
**Governing rule:** **The publication contains the resolved work, not the history of its resolution.**  
**State:** SAN-05 complete at source-review scope; SAN-06 validation pending CI on the closeout branch.

This record is the lossless closeout map for the sanitation programme. It does not preserve every document that was removed from public view. It records where the durable intellectual value now lives and which historical material is intentionally left only in the repository.

## Final SAN-05 result

The first-reader traversal now covers the principal site path, both publication manifests, reader-facing back matter, the pattern/G-01/Reference House/research/computational branches reached from that path, and the public/internal routing boundary.

The remaining back matter has a current reader function:

- **Evidence and Precedent Notes** — evidence classes, precedent limits and current proof boundary;
- **Research Agenda** — genuinely unresolved questions capable of changing the work;
- **Reference House Implementation Schedule** — the boundary between virtual coordination and site/professional/physical proof;
- **Glossary** — project-specific terminology;
- **Sources and Further Reading** — external intellectual and technical routes.

Appendix numbering is owned by `publication/publication.ts` for print. Website source headings are publication-neutral where practical so a source does not carry stale appendix identity into another medium.

The current editorial authority, `docs/manuscript/publication-architecture.md`, has been rewritten to match the resolved corpus. It no longer prescribes the legacy doctrine crosswalk or the old six-appendix order.

## SAN-06 lossless map

| Internalised / replaced material | Durable value retained in | Closeout judgement |
|---|---|---|
| House Design Doctrine v7 / legacy doctrine register crosswalk | `governing-principles.md`; current strategies, patterns and held candidates; current research and Reference House technical syntheses | Historical formulations are not publication content. Unique ideas survive under current owners; the crosswalk remains internal archaeology only. |
| Pattern Core-12, pilot catalogues, reversible-assembly aggregate and migration records | current 21 canonical pattern records; 3 strategy records; 4 held candidates; `docs/patterns/README.md`; service-topology sequence | Migration history internalised. Stable `HSA-P-*` identities retained because they serve current cross-reference, not because of provenance. |
| G-01 research-stage, falsification and reduction records | `g01-v0.1.md`; subject-organised grammar evidence; `G-01 Validation and Limits`; Reference House G-01 conformance | Stage chronology internalised after findings were synthesised. `G-01 v0.1` remains as a current formal specification identity. |
| Reference House RH-C / RH-06→RH-11 stage records, restart ledgers and coordination gates | `docs/reference-house/README.md`; `part-iv.md`; current Technical Coordination; Tectonic Architectural Language; Vertical Interface Coordination; Pattern Selection; Independent Review Questions; generated current inspection outputs | Development sequence removed from public reading. Current building decisions, uncertainty and external proof obligations remain. |
| Whole-House Coordination Fixture 01 and stale 12.6 × 11.4 m / 3.6 × 3.6 m output | current 12.0 × 10.8 m / 3.6 × 4.0 m Reference House and deterministic generated inspection plan | Stale geometry intentionally rejected, not migrated as a current alternative. Historical file remains internal. |
| Preface precedent-selection notes and editorial deployment instructions | Transformation, Persistence and Precedent; Preface; Sources and Further Reading | Research retained; selection/rejection commentary and rhetorical instructions internalised. |
| Repose doctrine-control/evidence working notes | Repose and Low Vigilance; Repose — Evidence and Limits; Principle 8 | Architectural synthesis, evidence limits and the unresolved structural-legibility hypothesis retained without pseudo-neuroscientific inflation. |
| Workmanship, floor-structure, accessible-floor and wall-lining working baselines | Workmanship Robustness; Floor-to-Masonry Structural Interface; Accessible Floor Systems; Replaceable Wall Lining; Reference House technical coordination | Comparative conclusions and proof questions retained; working-baseline chronology removed. |
| Prototype build packs, specimen scripts and handoff records before measured results | public prototype overview and current research questions | No result is manufactured. Detailed test administration remains internal until physical evidence exists. |
| S0/S1/S2/H1 paper-compilation runs, H1 technical families, capability matrices and one-off interface/boundary studies | Executable Architecture; Formal Architectural Model; Validity and Obligations; Evidence and Provenance; Compiler Targets; Structural Semantics; Boundary Semantics; Interface Obligation Bundles; Supported Domain; computational overview | Durable semantics retained. Paper-stage identities and any implication of a release-grade technical-family library removed. |
| External Mapeguard evidence trial programme framing | Scoped Manufacturer Evidence — Mapei Mapeguard WP | Component/system/installed-instance scope, applicability, dependencies and selective invalidation retained; trial-gate chronology removed. |
| Compiler hardening/output-architecture programmes, model freezes and executable gate reports | current compiler implementation and tests; computational overview; generated inspection outputs; resolved computational semantics | Software-quality history remains internal. Demonstrated capability is stated directly and narrowly. |
| Publication freeze/release programmes, candidate-book ledgers and editorial audits | `publication/publication.ts`; current `publication-architecture.md`; current manuscript; this sanitation record | Production history has no reader-facing claim. Current publication authority is resolved state, not release chronology. |

## Intentionally retained identity

The sanitation rule is semantic, not cosmetic. The following identifiers remain because they carry current meaning:

- `G-01 v0.1` — current bounded Georgian-derived grammar specification;
- `HSA-P-*` — stable canonical pattern identities;
- House Kernel and Metamorph Compiler — current architectural/computational system names;
- current model/compiler/evidence identifiers where required for deterministic outputs;
- external standards, regulations, classifications and evidence identifiers.

A version or code is removed only when its function is development chronology rather than present authority.

## Regression guard

`scripts/validate-resolved-public-surface.ts` now checks every public Markdown source for high-confidence development residue and rejects reader-facing links into internal-only Markdown records.

The guard deliberately targets unequivocal process identities rather than banning ordinary words such as “history”, “version”, “programme” or “superseded”, which can be legitimate architectural, evidence or lifecycle concepts.

## Final validation contract

SAN-06 closes only after the closeout branch passes the repository validation workflow, including:

- type checking and repository health;
- public-route integrity;
- resolved-public-surface sanitation guard;
- compiler/reference-house regression suites and generated-output integrity;
- publication validation and integrity;
- VitePress public-site build.

After a green closeout run, this record should be updated with the validated commit/PR, merged to `main`, and issue #133 closed as completed.