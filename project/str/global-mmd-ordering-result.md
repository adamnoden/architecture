# Global MMD ordering: numerical continuation

The coupled sparse vertical-frame factorisation now selects `MMD_AT_PLUS_A` instead of `COLAMD`. No pivot/equilibration option, matrix, load, work map, normalization, support, spring, contact law, iteration bound or acceptance threshold changes. The actual selected ordering is recorded in the raw numerical result. Interior vertical-plate factorisation remains unchanged; no factor cache or blocked RHS method is introduced.

The [historical recovery record](sparse-floor-recovery-20261122.md) retains the source725 initial-linear-system benchmark:24887 unknowns,2,882,472 matrix entries, default-pivot MMD,2.651seconds,494260KiB maximumRSS and6.81e−7 maximum physical free residual. Its unequal permutations/negative signed LU pivots are not an SPD certificate. That benchmark did not complete a contact iteration or house result; its local raw files were lost when the environment disappeared.

The small52-head fixture compares all312 reaction components, every member/contact force and global energy between MMD and an otherwise identical COLAMD control under both load signs. The test verifies that ordering is the only factorisation keyword changed. This earns a fresh nonlinear experiment, not a house, reinforcement or convergence decision. All dependent source-bound proof receipts remain stale until genuinely regenerated.

The required next evidence is a freshly generated unchanged500mm physical control and the actual250mm refinement, executed serially with complete source/request/checksum-bound captures. Their outcome is pending at this method checkpoint. No historical response is rehashed into the new source identity.

## First actual nonlinear control

The [source-bound native execution receipt](studies/global-mmd-native-controls.json) now retains a completed500mm native control on native58 identity `147fdd25…`. It completed in86.066s at observed child peak1,423,616KiB. All312 foundation reaction components match the historical physical500mm control within4.044e−9kN/kNm against the predeclared1e−6 comparator. Global energy residual is4.272e−12, maximum physical free residual4.712e−7kN/kNmm and recovered plate work residual2.893e−13. Complete native and capture-manifest checksums are retained; actual raw captures are under the shared workspace.

The250mm execution has started on exactly the same frozen method/source tuple but has no result at this checkpoint. This successful unchanged control does not establish finer-mesh convergence or adopt the structural/house candidate. The stale ancestor/current proof chain remains to be regenerated after the numerical method is earned.
