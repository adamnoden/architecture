<!-- nav-exclude: redirect -->
# Resolved-work sanitation programme

> **The publication contains the resolved work, not the history of its resolution.**

This programme separates Ovid’s House’s reader-facing work from the internal record of how that work was developed. It applies to both the website and generated PDFs.

## Standard

Losslessness means losslessness of substantive ideas, not losslessness of drafts, migrations, programme records or historical formulations.

Before reader-facing material is removed, determine whether it contains a unique architectural claim, distinction, constraint, precedent, evidence item or useful formulation that survives nowhere else. If it does, migrate that value into the appropriate resolved source first. Git remains the historical record.

## Classification

Every suspect reader-facing item is classified as one of:

- **KEEP** — resolved material that belongs as-is;
- **REWRITE** — substantive material framed through obsolete process or terminology;
- **MERGE** — useful material whose resolved home is elsewhere;
- **INTERNALISE** — useful project record that should remain in the repository but not on public surfaces;
- **DELETE** — redundant material with no unique surviving value.

## Sequence

1. **SAN-00 — corpus map:** enumerate the website and PDF build graphs and establish the current baseline.
2. **SAN-01 — mechanical scan:** identify version, migration, provenance, phase, programme and historical-language residue.
3. **SAN-02 — structural/editorial audit:** read the reader-facing corpus for residue that keyword scans cannot detect.
4. **SAN-03 — semantic-loss audit:** map unique value before any merge, internalisation or deletion.
5. **SAN-04 — cleanup:** remove historical/process material from public build inputs and rewrite surviving prose in resolved form.
6. **SAN-05 — coherence pass:** read the result as a first-time reader and remove seams, unexplained internal codes and duplicated arguments.
7. **SAN-06 — verification:** rebuild all public outputs and prove that substantive content has been retained, intentionally rejected or superseded.

## Acceptance criteria

The programme closes only when:

- no reader-facing section exists primarily to document project evolution;
- obsolete version/taxonomy/migration language is absent unless it is itself architecturally necessary;
- all removed material has been checked for unique substantive content;
- website navigation exposes only intended external reading material;
- PDFs contain resolved work plus genuinely useful scholarly/technical apparatus;
- a first-time reader does not need development history to understand the work;
- internal records remain recoverable in the repository and Git history.

Issue #133 is the programme handoff record.
