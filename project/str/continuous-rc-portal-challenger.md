# Continuous RC northern portals: free-floor challenger rejected

This is one authored replacement for both northern portal pairs, not adoption of a current house detail. It replaces the short/tapered RC piers and structural masonry arch with four full-height 212.5 × 215 mm RC piers, two integral 215 × 215 mm curved RC rings and the 140 mm wide, 750/650 mm deep outer/court floor upstands. It removes the structural tie and bore. The source 2960 mm raw span, 2250 mm spring, 600 mm rise, 215 mm axial core, 775 mm wrapped envelope and finished arch profile remain. Removing the visible 50 mm transom changes appearance and needs owner review.

**Outcome:** the RC upper topology is numerically viable without a tie in its declared local load challenges, but the complete proposed free-floor support arrangement cannot be accepted. Its applied normal overturning exceeds the total vertical compression times half the actual 215 mm normal support width, so no partial-contact redistribution can equilibrate this declared free-floor pressure case. Negative affine corner pressure alone only rejects full contact; selfweight-only local corner tension does not earn a compression-only equilibrium rejection. Supplying a real joined floor diaphragm can change this result; this rejection does not substitute a fictitious rigid floor restraint or prove all possible joined RC arrangements fail.

## Executable evidence

`studies/continuous_rc_portal.py` exposes `load_continuous_rc_source`, `reference_continuous_rc_case`, `build_continuous_rc_portal`, `solve_continuous_rc_case` and `compile_continuous_rc_portal`. `--read` returns source-bound authored fields with missing material/DPC/cover inputs left null. The saved proof contains an explicit numerical comparison, not inferred physical material or approval. Exact source/method identities, unsupported schemes and injected result/approval fields are checked.

`studies/continuous-rc-portal-proof.json` records seven actual signed/scoped load cases, every reaction at all 52 source heads, full six-component equilibrium and work/strain-energy balance. The source grid, finite upper caps, finite full-height RC posts, four-quadrature-point bilateral DPC interfaces, two curved rings and floor upstands share one compatible 171-node/191-member frame solve. No fixed-base roof/foundation increments are added.

| Check | Computed result |
| --- | ---: |
| Exact replacement RC union | 1.571280040 m³ |
| Gravity-only infill | 0.308047203 m³ |
| Physical replacement selfweight | 45.442945051 kN |
| Worst seven-case wrench residual | 5.22 × 10⁻¹⁰ kN/kNm |
| Worst work/strain-energy relative residual | 7.65 × 10⁻¹² |
| Positive/negative 2.25 kPa solid-face pressure, no favourable G | DPC corner tension up to 6.941974 MPa |
| GMAX/Q plus signed pressure | DPC corner tension up to 6.564247 MPa |
| Normal frame translation under pressure | about 27.94 mm |
| Half frame flexural factor | all-head maximum change 0.102482 kN/kNm; actual floor-port change 23.297803 mm/mrad |
| Arc 24 → 48 members | all-head maximum change 0.000433 kN/kNm; actual floor-port change 0.001444 mm/mrad |

The EI perturbation preserves actual grid members and physical mass. The exact circular solid-face pressure integration leaves the actual open-loggia opening unloaded. It is a load-introduction challenge; insulation/infill fixing resistance is still absent. No closed-door pressure or product fixing is invented.

## Physical body, reinforcement and interfaces

The new columns extend to Z3170, where the upstands begin. This is explicitly different concrete from the old source taper and masonry spandrel; the old geometry is not relabelled full-height RC. Arch material inside the pier rectangles is excluded from mass. The two upstands, columns and clipped ring unions do not overlap in the physical mass ledger. Curved finite-member stiffness with explicit 106.25 mm column-face rigid offsets remains an approximate monolithic joint model; local joint-panel flexibility/resistance is unqualified.

The nonstructural spandrel infill is gravity-supported on the new RC ring with an authored 30 mm headgap beneath the floor beam. Its own 20 kN/m³ gravity is included once. It contributes no favorable frame stiffness. Lateral sliding anchors, movement/fire/acoustic closures, differential strain, water-barrier continuity and installable finished interfaces remain unproved. The tie removal eliminates that particular bore/penetration, without qualifying other barriers.

The new post/ring trial has **4H16 and authored H8 links at 100 mm**. H8 is not an attribution to the existing jamb, whose general transverse schedule is absent. At 40 mm cover, the new ring has 87 mm clear spacing and the post 84.5 mm; simple bar fit is feasible. The unchanged 140 mm floor upstands do not acquire a fabricated accepted reinforcement cage. Their actual bars, bends, intersections, shear/torsion and placing are still unqualified.

The reused source rectangular 4H16 strain-compatibility law gives individual uniaxial strength comparisons for the posts/rings; their maximum linear comparison is about 0.55 under the scoped pressure load. This is not acceptance of biaxial, shear/torsion, cracked/second-order or joint resistance. No resistance is reported for an invented floor-beam cage.

Straight H16 bond development using the explicitly stated comparison is 579.71 mm, whereas the source 570 mm cap depth leaves only 490 mm between 40 mm covers. A hook, confinement, mechanical anchor or accepted positive connection cannot be inferred. The apparent 4H16 fit does not close cap anchorage, arch-column bar transition, DPC tension/shear retention or joint-panel duties.

A feasible installation proposition would require resolved cap starter/anchor and moisture-break retention first; then the full-height post/ring reinforcement and shutters as one coordinated RC pour, the connected upstands, infill after striking/shortening, sliding infill restraints, headgap closure and finished wrap. That is a sequence for further design, not an assertion that the current unsupported reinforcement/joint detail can be installed.

## Incoming actions and exact boundary

Native incoming actions are intercepted before ground redistribution. Signed receiving weights and residual first moments are retained. The 100 admitted rows are upper-core/finish GMAX, ceiling GMAX and the applicable native Q arrival, applied at the actual northern receiving territory. Gross filled-opening upper-wall GMAX is an external strength challenge, never retained favorable gravity.

The one local native slab GMAX card overlaps the authored RC union and is withheld until actual tributary/material subtraction. Loggia-W/E sidewall cards, roof families and other uncoupled duties remain named withheld evidence. The existing old masonry arch/ring/pier/spandrel and tie selfweights are excluded. This is not a whole-house G/Q or roof combination.

The four actual floor ports are at Z3170, X4377.5/7622.5, on court/outer Y8082.5/11667.5. Their reported displacements are transformed from beam-centroid masters to those actual points. They have **no invented lateral floor restraint**. The previous floor condensate retains only four outer L-corner interfaces, so its 12 coordinates cannot silently stand in for these four additional northern ports.

The capillary break interval [−50, −30] mm and its normal/shear bilateral stiffnesses are explicit numerical inputs. Ideal translation restraint/free rotation at all 52 heads, finite upper caps and the inherited rigid lower head-to-grid eccentric transfer remain declared comparison assumptions. No raised 715 mm service-floor proposal, upper ground RC tie, soil resistance or settlement is mixed into this baseline.

## Next joined proof, not another hardware repair

Retain actual northern floor support faces in a new perforated-floor condensation, together with the four existing L-corner patches. Connect the eight work-dual finite ports to this same RC/grid model. Remove overlapping north band/upstand material stiffness and reject any support patch or band crossing an aperture. Recompute source pressure application/eccentricity and all head reactions after compatibility, without old roof increments or invented anchors.

That joined floor result must determine whether the free-floor DPC equilibrium failure is removed or persists. Its bilateral pressure must first be classified as full-contact failure versus actual support-resultant infeasibility; partial-contact laws must then be solved where admissible. Anchorage/positive moisture-break retention, the actual floor cage and local RC joint resistance remain distinct obligations even if lateral movements improve. All **28 canonical receiving duties remain unresolved as complete paths**; this challenger produces no selected path, roof adoption, installed acceptance or owner approval.
