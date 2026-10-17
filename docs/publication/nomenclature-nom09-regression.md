<!-- nav-exclude: redirect -->
# PUB-NOM — NOM-09 regression system and generated-output proof

**Gate:** NOM-09 — regression system and generated-output proof  
**Status:** COMPLETE  
**Draft PR:** #157  
**Tracking issue:** #156  
**Starting head:** `93cbd0c157db1fa1c2641102dd9a656ebdccfbc2`  
**Final proof head:** `6ad5a585653acfa4b99ca7c702ec242a51ea9686`  
**Final PR validation:** run `39056023321` / #530 — PASS

## Purpose

Prove that PUB-NOM is enforced as a system rather than preserved by the current clean snapshot. The test is adversarial: representative prohibited states are deliberately introduced, the relevant validator must fail, and the original repository/rendered artefact is restored before the next case.

The regression harness tests the **class of mistake**, not only the literal screenshot that triggered this programme.

## Bounded proof sequence

- [x] **NOM-09A — source-surface adversarial fixtures**  
  Primary-source rejection of legacy `HSA-P-*`, reader-facing `PAT-*`, workflow gates, legacy project names, technical-only grammar versions, project maturity labels and prohibited publication-SVG text.
- [x] **NOM-09B — publication identity/order and join fixtures**  
  Reader pattern titles cannot be constructed from machine IDs, publication order cannot collapse to machine-ID sort, and manifest/frontmatter joins fail closed when identity diverges.
- [x] **NOM-09C — rendered-output and fail-closed fixtures**  
  Built HTML leakage is rejected, both expected PDFs are individually required, missing rendered corpora fail closed, and a prohibited token physically embedded into a rebuilt PDF is detected from its extracted text layer.
- [x] **NOM-09D — public-machine/link/full-system proof**  
  Canonical data-plate drift is rejected; repository route/link checks remain green; the full source/build/rendered PR pipeline succeeds with the permanent adversarial harness enabled.

## Permanent harness

`scripts/test-public-nomenclature-regressions.ts` is the adversarial harness.

Source/publication mode is part of the ordinary `npm test` chain through `test:nomenclature-regressions`. It first proves the clean baseline, then deliberately introduces and requires rejection of:

1. `HSA-P-001` in primary prose;
2. `PAT-001` in primary prose;
3. workflow gate `RH-C5` in primary prose;
4. legacy project name `House Design Doctrine` in primary prose;
5. technical-only `G-01 v0.1` in primary prose;
6. project maturity `M4` in primary prose;
7. legacy pattern identity inside a reader-facing publication SVG;
8. a reader pattern title constructed from `PAT-001`;
9. pattern manifest/frontmatter identity divergence;
10. reader publication order collapsed to machine-ID sort, including regeneration of the derived publication-scope record so the dedicated semantic guard is reached rather than a stale-output guard;
11. canonical public-machine data-plate drift.

Every mutation restores its original file in `finally`, and clean source/publication/data-plate validation is rerun afterward.

Rendered mode runs after the real site and both PDFs have been built. It proves rejection of:

1. legacy identity injected into built site HTML;
2. absence of the built HTML corpus;
3. absence of the full Working Edition PDF;
4. absence of the Primer PDF;
5. a deliberately contaminated Primer rebuilt with `HSA-P-001`, detected from the actual PDF text layer via `pdftotext`.

Rendered mutations likewise restore the original artefacts and finish by rerunning clean rendered validation.

## Fail-closed improvements made during NOM-09

Rendered validation previously accepted any PDF under `publication/dist`. It now requires both canonical products by exact identity:

- `publication/dist/ovids-house.pdf`;
- `publication/dist/ovids-house-primer.pdf`.

If either is absent, validation fails before nomenclature scanning. This prevents a partial publication build from masquerading as complete rendered coverage.

The rendered corpus already fails closed if the VitePress build directory contains no HTML.

## Proof history

The first source/order adversarial attempt usefully exposed that a deliberately reordered publication caused the generated publication-scope crosswalk to become stale before the dedicated machine-order guard executed. The harness was strengthened rather than weakened: it now regenerates that derived record under the broken order, then requires the exact `collapsed to machine-ID order` failure and restores the derived record afterward.

The source/publication adversarial suite was then demonstrated green in staging: every intended broken state was rejected for the expected reason and every restored baseline passed.

The temporary staging workflow could not push a change to `validate-pr.yml` because the GitHub Actions token lacked workflow-write permission. The production workflow was therefore updated directly through the repository connector and all temporary staging workflows were removed. This is a tooling-permission boundary, not a project exception.

## Final full-system proof

PR validation run `39056023321` (#530) passed at head `6ad5a585653acfa4b99ca7c702ec242a51ea9686` with the permanent harness active.

The run passed, in order:

- locked dependency installation;
- complete repository health (`npm run check`), including the new source/publication adversarial suite, route/link integrity, data plate, compiler suites, output verification, publication validation/integrity and site build;
- source nomenclature validation;
- full Working Edition + Primer rebuild;
- PDF metadata checks;
- clean rendered nomenclature validation;
- rendered adversarial nomenclature proof;
- final reader-facing nomenclature inventory.

The clean tree therefore passes before and after deliberate corruption of both source and rendered products.

## Exit condition

NOM-09 is complete. The remaining PUB-NOM work is **NOM-10 — closeout, DRW reconciliation and PR-02 handoff**. NOM-10 must consolidate the final namespace/exposure architecture and migration map, record the DRW boundary precisely, and distinguish PUB-NOM completion from the later DRW-integrated re-verification required before PR-02 can freeze the combined nomenclature/visual-reference system.
