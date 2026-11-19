# HRS-BASELINE — accepted house and inherited-evidence applicability

**Result:** current-source/applicability repair complete at the bounded scope below; no geometry, technical adequacy, maturity or construction-issue acceptance.  
**Inspected main:** `f75668d39bdebb389b12721c28230549566bf8b9` (29 October 2026).  
**Owner:** HRS #945; accepted-house instruction in `project/refurbishment-plan.md` and `project/owner-house-charter.md`.

## Question and finding

Can the ordinary reader and an early feasibility worker identify one accepted house without inheriting incompatible predecessor results? Previously the Reference House entry pointed to a “current” technical summary with a 12 × 10.8 m shell, +3300 mm first floor and outward-only low-slope roof. Part IV, the implementation schedule and RH-11 briefs repeated those facts while current drawings represented the 12 m square revision. The discrepancy was present in authored sources; changing drawing output or relabelling historical fixtures would conceal it.

The current architectural basis is `RH-LAYOUT-REVISION-02`, with drawing family `RH-LAYOUT-FAMILY-02`. [Current House Basis](../../docs/reference-house/current-house-basis.md) now provides the source map, current facts, technical limits and material inherited-evidence dispositions. The Reference House entry path points there. Part IV and Appendix C now describe the actual square house, current stair, void, service reservations and inward/outward roof instead of presenting predecessor arrangements as current.

## Exact inspected source identity

Git blob identities at the inspected main identify the source content; human family names alone are not fingerprints. These sources are unchanged by this packet.

| Source | Git blob |
|---|---|
| `compiler/reference-house/georgian/layout-revision.ts` | `af955c7da2e2469fd24598f98db6fc942a119ed3` |
| `compiler/reference-house/georgian/layout-family.ts` | `30ef287f3176e0f4cf2b03ef57c4fdfc915494c9` |
| `compiler/reference-house/georgian/layout-analysis.ts` | `69ab57b6345a8ca06a87c05087f9488716f3723d` |
| `compiler/reference-house/georgian/section-exemplar.ts` | `75bf5c749da5095c07eed46105817a79095ca418` |
| `compiler/reference-house/georgian/source.ts` | `1edcfe12392e7b56bf957ffa10a57e21878f3fa0` |
| `project/triad-interface-contract.md` | `789df054ec0c97326bf6549e1e93db50163036d0` |
| `project/design-constraints.ts` | `0c76e5372a2537bbc6f3c6c29f07ab0efa297129` |

This is an inspection identity, not a new freeze or second machine evidence register. HRS-TECHNICAL must reconsider applicability after selected design; PCO-APPLICABILITY owns machine-readable assessment binding.

## Disposition and preservation

- Current geometry, orthographic correspondence and candidate interfaces remain at their existing bounded scope. No room, opening, stair, roof or service coordinate changed.
- The inherited technical summary, RH-04/D12 gates, RH-C0 baseline, environmental/energy/service summaries and pattern occurrence register are labelled historical. Their original content and proof identities remain recoverable. Statements saying “current” inside those records refer to their historical subject, not revision 02.
- The generated inspection hub identifies the historical technical fixture. Generated drawings, reports and manifest are unchanged. The active `publication/plates-current.ts` successor labels the predecessor in every retained caption and relocates two narrative anchors. The original `publication/plates.ts`, DRW freeze manifest, renderer/style and seventeen view specifications remain byte-frozen. An equivalence guard confines the successor to these composition changes; this is not current-house drawing acceptance or a new PLT release. No old plate is presented as a current-house drawing. No output was hand-edited to simulate current-house migration.
- Current review questions now name the actual house and enumerate changed geometry, stair, entry void, roof, plant/riser, sanitary and energy premises. RH-11 discipline briefs are explicitly held from current-house issue pending EPR refresh. Their historic prepared status is not professional acceptance. The regulatory baseline is retained rather than silently asserting fresh law applicability.
- RH-00's original ledger is explicitly delimited from later owner constraints. Its previous open shape/programme choices do not reopen the accepted house.
- Historic 450 mm wall stress, 50 m² PV field, removed en-suite, stair-lift option, MVHR fit and 900 × 700 mm clear-riser claims are not transferred to this source. The current small en suite, access conflict, floor budget, route capacities and void structure remain unresolved.

## Downstream ownership

The applicability table in Current House Basis is the reader-facing summary of this review, not a competing task graph. BCR's existing matrix owns construction findings; separate physical studies can now start from the identified source. HRS-TECHNICAL owns bounded migration after TRIAD and CCR; EPR/PHY own current discipline-pack and prototype applicability; PCO owns design-bound assessment freshness; DPL owns plot requirements and actual site assessment. ROF/RWT retain roof/water selection. Historical DPL placement/conformance results do not apply automatically to the square house.

No referral is called resolution. No actual review, physical test, regulatory acceptance, current-house computational pass or maturity change is earned here. Later geometry changes must reconcile this entry path and any affected result before claiming continued applicability.

## Validation

Source review compared the revised text with `layout-revision.ts`, its inherited section source, the shared interface contract and the coordinated-family record. The current fact map distinguishes nominal reservations from usable clear capacity and supports independent review of each correction. Source geometry and generated technical output bytes remain unchanged.

Independent source review checked all seven source blobs, resolved local links and challenged surviving conformance, maintenance and programme claims; those findings were corrected. Local typecheck, project-control, repository, public-route, sanitation, publication composition and integrity checks passed. Local figure rendering could not run because the pinned Chrome binary was unavailable; exact-head CI remains required.

Production proof run `40954259736` on head `752f00b8935e7346440b2e6991f33c6c02d94832` built and verified both PDFs: A4 281 pages / 141 leaves and B5 332 pages / 166 leaves. Its ledger check correctly exposed changed pagination; the metadata is reconciled to those measured results, with no typography token or SVG changes. Representative proof run `40953857839`, artifact `12931679631` (SHA-256 `7c69f128c96c947e42bcc24df1a0923a290c5fa8d0560dae015c6b8c81b1330c`), was hash-verified and inspected: B5 adaptation schedule and front/ground/first plate captions are readable and explicitly historical, without overlap or clipping. Final exact-head CI and whole-proof inspection are recorded in PR #1025 before merge. This is an authored-source applicability repair; it does not issue a new typeset publication, accept the old embedded plate family as current, or claim physical print inspection. Final plate/edition reconciliation remains with PLT and EDA.

The historical TYP-08 candidate remains bound to its original plate register. A broadened import migration briefly triggered that separate profile: run `40955599694` failed before rendering because its historical correction requires five division openings while the current book has six. The identical raw-prepare/prepare/correct failure was reproduced on clean main `15ab2ca5d4da39d7f46372dbbf55a4cd9af6ae10`; it is pre-existing historical-profile drift, not a current production proof result. The unrelated TYP-08 import change was removed and its assertion preserved. TYP-05/07 inspect current manuscript/placement selections and therefore use the current composition, while historical DRW/TYP-08 remain unchanged. Current production typography and full repository CI passed at `3507a4f45ec53f73123163c8817f51b8d3337f90`; the final preservation-only head is rechecked before merge.
