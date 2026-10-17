<!-- nav-exclude: redirect -->
# PUB-NOM — NOM-09 regression system and generated-output proof

**Gate:** NOM-09 — regression system and generated-output proof  
**Status:** IN PROGRESS  
**Draft PR:** #157  
**Tracking issue:** #156  
**Starting head:** `93cbd0c157db1fa1c2641102dd9a656ebdccfbc2`

## Purpose

Prove that PUB-NOM is enforced as a system rather than preserved by the current clean snapshot. The test is adversarial: representative prohibited states are deliberately introduced, the relevant validator must fail, and the original repository/rendered artefact is restored before the next case.

The regression harness must test the **class of mistake**, not only the literal screenshot that triggered this programme.

## Bounded proof sequence

- [ ] **NOM-09A — source-surface adversarial fixtures**  
  Prove primary-source rejection of legacy `HSA-P-*`, reader-facing `PAT-*`, workflow gates, legacy project names, technical-only grammar versions, project maturity labels and prohibited publication-SVG text.
- [ ] **NOM-09B — publication identity/order and join fixtures**  
  Prove reader pattern titles cannot be constructed from machine IDs, publication order cannot collapse to machine-ID sort, and manifest/frontmatter joins fail closed when identity diverges.
- [ ] **NOM-09C — rendered-output and fail-closed fixtures**  
  Prove built HTML leakage is rejected, both expected PDFs are required, missing rendered corpora fail closed, and a prohibited token physically embedded into a rebuilt PDF is detected from its text layer.
- [ ] **NOM-09D — public-machine/link/full-system proof**  
  Prove canonical data-plate drift is rejected; rely on the repository route/link validators for post-migration cross-reference integrity; run full source/build/rendered CI with the permanent adversarial harness enabled.

## Harness rules

1. Mutate real canonical/rendered artefacts rather than maintaining fake legacy fixture copies.
2. Every mutation is restored in `finally`, even when the validator behaves unexpectedly.
3. A regression case passes only when the target validator returns non-zero for the intended reason.
4. Source/publication mutations run in the ordinary test suite and remain fast.
5. Rendered mutations run only after CI has built the site and both PDFs.
6. The clean baseline must still pass the normal validators before NOM-09 closes.

## Exit condition

NOM-09 closes when every required failure class is demonstrated by the permanent harness, both expected publication PDFs are explicitly required by rendered validation, cross-reference/data-plate integrity remains green, and the full PR pipeline succeeds on the restored clean state.
