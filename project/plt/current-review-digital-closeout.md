# PLT-CURRENT-REVIEW — current digital capability and review handoff

**Result:** complete at digital candidate scope, 30 October 2026. The current house has the required orthographic, analytical, setting, sectional-synthesis and intact-exterior representations, with exact-scale BOOK/WALL review files and an explicit source-consistent reading sequence. This closes the requeued digital packet. It does not close PLT, accept a physical print, settle house design, integrate the final manuscript or release drawing-publication-v2.

**Audited baseline:** `f388493334c71483ee037812a128e13feda433d1`. The owner’s accepted continuation basis remains the 12 m square house with a 3.5 m court. HAD/IAS wet-room, court-level and kitchen alternatives remain studies; they have not replaced `georgian/layout-family.ts`. Later BCR/ROF/RWT results expose technical obligations rather than silently changing that source. No new geometry, renderer, tokens or frozen plate identity is introduced here.

## Recovered capability and exact evidence

The [artifact index](current-review-artifacts.json) records each archive identity, immutable proof commit, run, expiry, contained PDF path, page count, page dimensions and SHA256. Download the named archive from its run/artifact link, verify its archive digest, then verify the selected PDF digest. These are seventeen existing PDF objects; the index does not concatenate, resize or relabel them as a final publication. CI artifacts expire: the listed immutable source commits, preparation scripts, workflow definitions and validation gates remain the recovery route. A regenerated binary is new evidence and must be validated and identified as such.

| Family | Existing capability and review objects | Verified proof |
|---|---|---|
| PLT16 | Twelve orthographics and six analytical readings; 18 pages each in B5/A4 at 1:100 and A2 at 1:50. Complete source inventory and WALL selection substrate. | [40975081343](https://github.com/adamnoden/architecture/actions/runs/40975081343), artifact 12942607144, commit `d9a061472cafaa5993857e2e68ee5dcea1cc25ac` |
| PLT17 | Twelve book readings in fourteen-page B5/A4 samplers; eight-page B5 facing preview. Plans/services/roof remain complete paired readings; principal section is 1:50 with 1:500 locator. Other architectural pages are 1:100. | Same run/artifact; `plt17/dist/` |
| PLT18 | Current theoretical setting and external obligations, two pages per format: B5/A4 1:200 and A2 1:100. | Same run/artifact; `plt18/dist/` |
| PLT19 | Opaque sectional synthesis: three-page B5/A4 streams with lead-in and two crops, one-page facing preview, one-page A2. Fixed parallel projection, NTS. | [40895151597](https://github.com/adamnoden/architecture/actions/runs/40895151597), artifact 12905449324, commit `7dd807d2635d0c4477f0ae7bf7a25d42208ea84c` |
| PLT20 | Selected principal section, one A1 page at true 1:25; geometry reprojected, physical tokens unchanged. | [40895151553](https://github.com/adamnoden/architecture/actions/runs/40895151553), artifact 12905849759, same commit |
| PLT21 | Four intact exterior cameras; four pages each B5/A4, five A2 pages including the four-view comparison; direct SVGs and web comparison. Common factor within each profile, NTS. | [40896349320](https://github.com/adamnoden/architecture/actions/runs/40896349320), artifact 12907551209, commit `97a1b9275976823f4326c832664aaf2ad18a2dbb` |

All four runs completed successfully. PLT16–18 reuse the exact successful 85-stage proof from accepted #1065. PLT21 deliberately uses the later accessible-DOM-identity correction, not the earlier same-geometry artifact: `prepare.ts` scopes SVG title/description IDs in multi-view HTML and `validate.ts` rejects duplicate IDs. The corrected proof preserves the exterior geometry while proving that additional boundary.

The source audit compared the relevant Georgian adapters, shared ADE and publication-drawing-v2 modules and specimen preparation/validation against the respective proof commits. They are unchanged at the audited baseline: PLT16–18 against `d9a06147`, PLT19/20 against `7dd807d2`, and PLT21 against `97a1b927`. Importing the current source objects reproduced these manifest identities:

| Object | SHA256 |
|---|---|
| PLT16 coordinated design object | `035be81a5fb40fce7913ab942b3ab27202aa39a15414e6463aeadf24e935cd4c` |
| PLT17 composition source | `47af26df01d81100d33ec3ad026e876ae3ec34418dbd5eb3e55490b2e75ef944` |
| PLT18 setting source | `249779e647553b284623a36436cc6c7e12e311562e28a8a226c0ae2dd5f1e2c4` |
| PLT19 synthesis source | `0699e9006594d6e5d9f393cf9acfffe1aadb82f3fe1a88df50a4bd6cd189ae96` |
| PLT20 layout source | `eef57fdf08ab98c71959d75c3551984b6491ac7cf29bfcb244592251f945dc96` |
| PLT21 model fingerprint | `5df67b1771eff2879165e0085331596cf83a2641e5d7c9ccdf08e840a49fd0c8` |

## Review sequence and role coverage

The [candidate admission table](../../docs/publication/architectural-plate-candidate-admission-and-handoff.md) accounts for all seventeen historical released roles through fifteen current readings. It remains the disposition authority; no duplicate sheet is restored merely to fill a count. The following index makes that review executable without a new layout engine:

1. **BOOK core:** open PLT17 B5 or A4, preserving all fourteen pages and its lead-in. Pages 2–3 are plans; 4–5 the principal section and locator; 6–7 services; 8–9 roof/water/access; 10–11 front/garden; 12 courtyard; 13–14 service elevation/section. The eight-page facing preview is for screen comparison, not printer imposition.
2. **Setting supplement:** PLT18 pages 1–2 add the theoretical setting and external-maintenance role on the same current house. Its approximate 15.5 m width and open-ended site guides are not an actual plot or workable access envelope.
3. **Synthesis supplement:** PLT19 retains its own lead-in and two physical crops, or its one-page facing preview for screen review. Do not append it blindly to an odd/even sequence: final composition must preserve the intended verso/recto pairing and 12 mm critical fold exclusion on each side.
4. **WALL selection:** select PLT16 pages 1, 2, 4, 6, 9, 10, 11 and 12 as ground, first, principal section, front, court-entry, court-windows, roof and roof-water candidates, with PLT18 setting/external pages and PLT19 synthesis available for their distinct roles. The retained court pair exposes both source faces; final admission may consolidate their equal aperture signature without erasing east/west distinctions. Service/technical review can use the remaining PLT16 sheets. This selection is review coverage, not a new released FRAME-GRADE register.
5. **Selected A1:** PLT20 principal section is the existing 1:25 object. Do not enlarge an A2 PDF or fit this page to another sheet.
6. **Exterior appendix:** PLT21 supplies four additional intact-roof cameras and its A2 comparison. It complements the cutaway. Four cameras are not four newly admitted book plates or replacements for the seventeen-role accounting.

The full PLT16 order is ground, first, locator, principal, service section, front, rear, service, court-entry, court-windows, roof, roof-water, ground services, first services, structure, roof-failure, external access and adaptation. The book subtraction preserves structural/framing and conversion obligations in retained captions rather than treating omitted diagrams as solved design.

## Inspection and architectural limits

This packet downloaded and digest-checked the four archives and inspected their PDF metadata. Screen render inspection covered PLT17 facing pages 2–8 (all drawing-bearing book spreads), PLT18 A2 setting page 1, PLT19 facing page 1, PLT20 A1 page 1 and corrected PLT21 A2 comparison page 5. No page clipping or drawing/text collision was observed in those inspected renderings. Existing packet closeouts retain their broader finished-page inspections; this packet does not claim to have newly inspected every page or to have performed actual-size print review.

The service drawings retain reservations and explicit product/carrying/crossing limits; their walking-grid provenance does not establish fixture operation or maintenance. The roof water arrows and dashed collection reserve are schematic: they do not define equal catchments, outlets, bore, hydraulic falls, overflow or safe access. ROF/RWT research does not become selected roof geometry by appearing beside these sheets. The service section’s bands are assembly-depth reservations, not a full-width member. The low roof space is not a standing storey. The synthesis deliberately omits internal partition/joinery and technical detail; exterior aperture notation does not select fabrication sections or frame setback.

The current ridge is approximately +7790.9 mm (`6800 + 2125 × tan 25°`); the older +7779 mm prose belonged to the earlier 2100 mm inset. This packet corrects that misleading current label and stale statements that digital setting/synthesis capability is still absent. It preserves the historical specimens and their evidence.

## Successor handoff

**PLT-FINAL-PREP** still waits for HRS-SYNTHESIS. Reconcile the actual accepted house, not draft HAD alternatives, across every affected plan, section, roof, elevation, analytical caption and isometric. Carry BCR findings and IAS/OAS/RWT/ROF decisions with their source authority; classify every v1 difference as representational or explicitly source-traced. Revisit the fifteen-reading judgement and exterior appendix against that source. Compose the actual publication with its prose intervals, placement anchors and captions; these separate streams do not prove the final reading rhythm.

**PLT-PRINT-REVIEW** remains manual: actual owner BOOK/A2 WALL/selected A1 evidence at the established distances, including physical folds, gutter loss, reproduction and keep/revise/reject findings. Material revisions require affected reprints and acceptance. A screen rendering or exact page-size assertion is not this verdict.

**PLT-FINAL-FREEZE** remains after preparation and applicable physical acceptance: source/object identity check, atomic manuscript/register/generated-view integration, final proof, token/source freeze and verified v2 release. Historical DRW/v1 identities remain protected. PUB retains manufacture authority. ADE/DEL construction-information delivery has its separate capability and issue-purpose boundaries; a book-plate review is neither construction information nor a new gate on house design work.
