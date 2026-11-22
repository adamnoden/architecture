# Global MMD ordering: numerical continuation

The coupled sparse vertical-frame factorisation now selects `MMD_AT_PLUS_A` instead of `COLAMD`. No pivot/equilibration option, matrix, load, work map, normalization, support, spring, contact law, iteration bound or acceptance threshold changes. The actual selected ordering is recorded in the raw numerical result. Interior vertical-plate factorisation remains unchanged; no factor cache or blocked RHS method is introduced.

The [historical recovery record](sparse-floor-recovery-20261122.md) retains the source725 initial-linear-system benchmark:24887 unknowns,2,882,472 matrix entries, default-pivot MMD,2.651seconds,494260KiB maximumRSS and6.81e−7 maximum physical free residual. Its unequal permutations/negative signed LU pivots are not an SPD certificate. That benchmark did not complete a contact iteration or house result; its local raw files were lost when the environment disappeared.

The small52-head fixture compares all312 reaction components, every member/contact force and global energy between MMD and an otherwise identical COLAMD control under both load signs. The test verifies that ordering is the only factorisation keyword changed. This earns a fresh nonlinear experiment, not a house, reinforcement or convergence decision. All dependent source-bound proof receipts remain stale until genuinely regenerated.

The required next evidence is a freshly generated unchanged500mm physical control and the actual250mm refinement, executed serially with complete source/request/checksum-bound captures. Their outcome is pending at this method checkpoint. No historical response is rehashed into the new source identity.

## First actual nonlinear control

The [source-bound native execution receipt](studies/global-mmd-native-controls.json) now retains a completed500mm native control on native58 identity `147fdd25…`. It completed in86.066s at observed child peak1,423,616KiB. All312 foundation reaction components match the historical physical500mm control within4.044e−9kN/kNm against the predeclared1e−6 comparator. Global energy residual is4.272e−12, maximum physical free residual4.712e−7kN/kNmm and recovered plate work residual2.893e−13. Complete native and capture-manifest checksums are retained; actual raw captures are under the shared workspace.

The250mm execution subsequently completed on the same frozen method/source tuple:296.208s, observed child peak4,062,864KiB, global energy residual2.848e−12, maximum physical free residual8.382e−7kN/kNmm and plate work residual3.953e−13. Its complete native/capture hashes are retained in that receipt. The numerical method is now earned for fresh proof regeneration; the structural/house candidate is not adopted.

## Actual500→250 refinement fails the declared stability screens

The [existing shared cut consumer applied to both fresh complete fields](studies/global-mmd-mesh-cut-controls.json) preserves all four authored physical cuts and their actual material. The predeclared0.1kN/kNm head-change and5% relative-cut screens are unchanged. The actual maximum head-component change is2.773789kN atP04/SE, Xreaction−470.840387→−473.614176kN. Large changes also occur atP07/NW and adjacent outer heads; this is not isolated to the wet grid. The wet-grid P24/P47/P16 maximum component changes are0.724469/0.389649/0.353661kN respectively.

| Fixed cut | Relative signed normal change | Relative signed twist change | Relative absolute normal+twist change |
| --- | --- | --- | --- |
| SW normalY at450mm |9.23% |3.14% |6.06% |
| SW normalY at650mm |7.99% |2.93% |6.36% |
| SW normalY at1300mm |10.77% |18.66% |10.38% |
| SW normalX at1450mm |20.61% |32.72% |22.63% |

The raw point envelope rises107.241682→119.251752kNm/m; it is not replaced by these cuts. Both requests differ **only** in the two explicit in-plane/vertical mesh-pitch fields. PhysicalG factor1.35, live pressure2kPa, floor concrete27kN/m³, wet concrete25kN/m³ and the adverse160mm south-pad edit remain identical. Characteristic joinedG is2969.885918349448/2969.885918349456kN; the six-component external wrench differs by at most1.275e−10kN/kNm. Native source bindings are equal, source-wrench guards pass, and bearing-fibre counts change19216→22032 with actual cell counts3010→4999. These checks support a physical discretisation change rather than duplicated load or request aliasing.

Execution is resolved; global/cut numerical stability, corner/joint idealisation, complete resistance and house adoption remain unresolved. The stale ancestor/current proof chain must still be regenerated from the earned method and actual captures. Historical250/274 worker failures remain history and cannot stand in for the current250 response or an unexecuted current274 case.
