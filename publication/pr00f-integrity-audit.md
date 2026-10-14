# PR-00F — Cross-reference, Nomenclature and Back-Matter Integrity Audit

**Status:** active gate control  
**Date:** 2026-10-14  
**Parent:** PR-00 — Candidate-Book Freeze Execution Programme  
**Entry baseline:** `784e1cef962d8ba13f3fac53c4c39d76ff203bc2`  
**Umbrella issue:** #71 — PUB-01 publication credibility and release programme

PR-00F is a trust pass. It does not improve the architectural argument; it removes small inconsistencies that make a careful reader doubt whether the book controls its own terms, references and evidence boundaries.

## 1. Checks

### Identity and nomenclature

- **Ovid’s House** remains the public/book identity.
- **House Kernel** appears only for the formal architectural/computational system or explicit provenance.
- **Metamorph Compiler** appears only for the bounded executable machinery.
- Former master names appear only as explicit historical provenance.
- `HSA-P-*` IDs remain stable pattern identities; the prefix is legacy identity, not current project branding.
- pattern / strategy / held-candidate distinctions remain intact.
- G-01 references use the frozen v0.1 scope and do not expand it into a historical period classifier.

### Reader-facing integrity

- no PR/gate/candidate-book/Working Edition process language leaks into the primary reading path;
- literal repository paths are removed from reader-facing prose or converted into durable publication references;
- chapter numbering and Part identities agree with Publication Architecture v0.14;
- D-F01→D-F11 composition resolves to existing assets and authored captions;
- internal Markdown links are rewritten by the publication pipeline rather than printed as repository navigation.

### Back matter

- Glossary covers the project-specific terms needed to read the book and does not create stronger definitions than the manuscript;
- Evidence and Precedent Notes agree with PR-00C claim boundaries;
- Sources and further reading remains a reading surface rather than an endorsement register;
- Research Agenda contains the material research debts still exposed in the manuscript;
- the legacy doctrine crosswalk remains provenance rather than a second live doctrine.

## 2. Executable residue scan

PR-00F adds a scan over the **composed publication** after print adapters and figure composition. This is intentionally downstream of raw repository files: canonical sources may contain maintenance/provenance mechanics that a publication adapter legitimately removes.

The scan fails closed on:

- literal code-form repository paths such as `docs/...`, `publication/...`, `compiler/...` or `project/...` that survive into reader-facing output;
- `PR-00*`, `candidate-book` or `Working Edition` language in the primary book path.

The first run is an audit. Any failures become the finite defect list; the check is not weakened merely to obtain a green build.

## 3. Known entry defect

PR-00E transferred one known item into this gate:

- Preface note [5] ends with the literal repository path `docs/research/preface-precedents.md`.

It should be removed from the book-facing composition while the canonical research record remains in the repository.

## 4. Gate

PR-00F passes when nomenclature, cross-reference and back-matter defects are no longer likely to distract an adversarial reader from the substantive argument, and the executable integrity scan passes without suppressing genuine residue.

The next gate is PR-00G — candidate print proof.