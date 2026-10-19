# HFI-09A — Publication Impact / Freeze-Break Audit

**Packet:** HFI-09A  
**Programme:** `docs/development/human-factors-low-friction-inhabitation-programme.md`  
**Execution plan:** `docs/development/human-factors-low-friction-inhabitation-execution-plan.md`  
**Owning issue:** #195  
**Baseline `main`:** `feba7b5d520c609446e8cde6c90f833c350e4334`

## Question

Which accepted HFI changes affect the controlled public/site/publication corpus, and does any HFI-created stale surface remain capable of invalidating a later DRW-12 / PR-02 physical-object freeze?

## Result

**No unresolved HFI publication freeze break remains at this baseline.**

HFI has changed public architecture and Reference House geometry, but every accepted reader-facing or drawing-bearing change has already been propagated through its owning source and the controlled build/proof path. Open HFI research questions remain open questions; they are not accepted-but-unpropagated publication changes.

## Accepted HFI changes with publication impact

### 1. Principles 1 and 8

HFI-08A hardened the governing constitution rather than creating a new principle:

- Principle 1 now treats foreseeable human variance and ordinary temporary states as normal design input and keeps specialist equipment demand-led unless the brief requires it;
- Principle 8 now includes repeated bodily/cognitive compensation and complete-action review within the idea of unnecessary vigilance.

These changes are in the canonical manuscript source and have repeatedly passed the normal publication build, metadata, rendered-surface and nomenclature regressions.

**Disposition:** current; no stale publication surface.

### 2. Principal stair going: 280 → 300 mm

HFI-08B selected **300 mm** as the Reference House principal-stair going after a bounded full-system comparison. It remains an Ovid’s House project preference, not a statutory minimum.

The change was made at architectural/source authority rather than patched into a plate:

- RH-03 authority updated;
- canonical Reference House fixture now controls `RHCF-STAIR-G = 300 mm`;
- derived flight run, pitch and `2R+G` updated;
- RH-C5 correspondence rerun against the unchanged external-guidance method;
- deterministic Reference House outputs regenerated;
- successor compile identity/data plate regenerated where semantic source identity changed;
- publication principal-section geometry regenerated;
- affected DRW principal-section physical proofs rerun at A4 and conservative B5.

**Disposition:** current; no surviving HFI-owned 280 mm current-source/publication authority is known.

Historical/provenance records may describe the superseded 280 mm baseline where that history is the subject of the record. They do not constitute current architectural authority.

### 3. Human-Factors Verification delivery module

HFI-08C added `docs/delivery/human-factors-verification-requirements.md` and N17 as a public delivery requirement. The route was deliberately registered in curated navigation and the canonical public-route count updated.

The module carries complete-action and finished/net-interface proof into real project delivery without claiming those details already exist in the virtual Reference House.

**Disposition:** accepted new public surface; current and validated.

### 4. Independent-review public summary

HFI-08D added a bounded human-factors/inclusive-design section to the public independent-review questions. The detailed specialist review source remains within the existing internal review family.

The public surface states only that the specialist review is prepared and what it is intended to challenge. It explicitly avoids implying that review has happened.

**Disposition:** current; no validation/maturity overclaim.

## Physical publication metadata

Current controlled metadata remains:

- Working Edition: **217 pages / 109 duplex leaves / 40 entries / 11 figures**;
- Primer: **16 pages / 8 duplex leaves / 5 entries**.

The Primer moved from 15 to 16 pages when HFI-08A expanded the constitutional text. That metadata change was caught by CI, updated deliberately and subsequently revalidated. No later HFI packet has produced an unrecorded page-count drift.

## Open HFI matters that are *not* freeze breaks

The following remain legitimate unresolved or later-stage proof obligations:

- ground-floor utility / upstairs sleeping-bathing laundry trade-off;
- through-floor lift reservation (`UNRESOLVED — NO TARGET`);
- product-specific stairlift compatibility;
- real-site approach/set-down/gradient conditions;
- finished door, threshold, sanitary, control, kitchen and object-route facts that remain `NOT-MODELLED` at virtual-design scope;
- competent independent human-factors/inclusive-design review, which is prepared but not yet received.

None is an accepted architectural correction waiting to be propagated. Therefore none, by itself, makes the current publication geometrically stale.

If later evidence converts one of these into an accepted architectural change, the normal source-authority rewind rule applies and the relevant publication/drawing dependency must be re-audited before physical freeze.

## Freeze-break register

| Accepted HFI change | Controlled public/publication effect | Current state | Freeze break? |
|---|---|---|---|
| P1 human-variance wording | constitution / Primer / Working Edition | propagated + validated | no |
| P8 complete-action / compensation wording | constitution / dedicated Repose page / publication | propagated + validated | no |
| principal stair 300 mm | RH source, compiler/output, section drawing, DRW proof | propagated + re-proved | no |
| N17 Human-Factors Verification | public delivery route | registered + validated | no |
| human-factors external-review handoff | public review summary + internal specialist brief | correct public/internal split; review not claimed | no |
| laundry trade-off | no selected geometry change | unresolved | no — monitor |
| through-floor lift | no adopted target/geometry | unresolved | no — monitor |
| detailed occupied interfaces | later-stage proof | `NOT-MODELLED` where appropriate | no — monitor |

## DRW / physical-object consequence

HFI creates **no additional publication freeze hold at this baseline** beyond the ordinary requirement that current DRW work continue to project current controlled source.

DRW-12 / PR-02 may not close over a *future* accepted HFI correction that has not propagated, but it is not currently blocked by a known accepted HFI geometry/publication delta.

HFI-09B must now reconcile this conclusion directly against the current DRW controlled drawing family and identify any stale plate if one actually exists.

## Authority / maturity consequences

This packet changes no architecture, publication source, drawing geometry, compiler scope or maturity.

It establishes only that the accepted HFI changes are publication-current at the audited baseline and that unresolved HFI questions have not been falsely converted into publication defects.

`HFI-09A → baseline feba7b5d520c609446e8cde6c90f833c350e4334 → audit accepted HFI public/publication impacts and open questions → no unresolved accepted HFI freeze break; P1/P8, 300 mm stair, N17 and review summary already propagated/validated → no source/geometry/maturity change → exact next packet HFI-09B — DRW reconciliation`

**Exact next packet:** **HFI-09B — DRW reconciliation.**
