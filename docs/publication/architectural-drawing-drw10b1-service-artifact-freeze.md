<!-- nav-exclude: redirect -->
# DRW-10B.1 — Service-maintenance controlled-artifact freeze repair

**Programme:** DRW — Architectural Drawing Programme  
**Packet:** DRW-10B.1  
**Issue:** #154  
**Status:** ACTIVE  
**Starting lease:** `8314fbaba52d6a4451ee14947bcce440ee1d78d8`

## Discovery

DRW-10F analytical-family proof found that DRW-10B's source, renderer, generator and candidate workflow were present, but the two accepted service/maintenance overlay SVGs were not committed on `main` and no artifact-level byte lock existed.

The defect is in the DRW-10B freeze step, not in the architectural drawing. The workflow generated untracked SVGs and then used `git diff --quiet` before staging them. Git therefore reported no tracked-file diff and the job exited successfully without ever adding or committing the generated files.

## Corrective scope

This packet is deliberately narrow:

1. repair the freeze primitive by staging the generated SVG pair before testing whether canonical bytes differ;
2. freeze the already-reviewed canonical ground and first-floor service/maintenance overlays at their existing paths;
3. add a deterministic artifact regression proving committed bytes equal canonical generation and preserve the DRW-10B authority boundary;
4. run the existing candidate/typography and repository validation gates.

No source geometry, architectural decision, analytical content, drawing style or plate role is changed.

## Controlled outputs

- `docs/reference-house/publication-ground-service-maintenance-overlay.svg`
- `docs/reference-house/publication-first-service-maintenance-overlay.svg`

Both remain true `1:100` analytical overlays over the canonical plan substrates. They describe host-space / maintenance geography only. Exact route centrelines remain absent; the removed remote en-suite remains removed rather than acquiring a second permanent stack.

## Completion condition

DRW-10B.1 closes only when both SVGs are genuinely tracked on the exact validated branch head, canonical regeneration is byte-identical, physical SVG typography remains green, full PR validation is green, and the exact-main lease is clean or explicitly reconciled.

After merge, DRW-10F resumes from the corrective merge commit.
