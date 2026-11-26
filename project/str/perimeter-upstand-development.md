# Conventional perimeter upstand development checkpoint

This is unfinished source development, not an executed upstand house or a selected structural system.

The explicit optional section controls are in `structural-perimeter-upstand-settings.ts` and the matching strict Python reader. Core widths stay in the existing saved `distributedFloor.cornerWidthsMm` authority: this complete comparison requires all four300mm cores. The default trial is a300×350mm outer band, bottom3170/top3520, above the unchanged200mm floor3170..3370 and FFL3450. The narrower200mm band remains a comparison, not a binding constraint. All reinforcement, resistance and owner acceptance remain false.

`perimeter_upstand.geometry_from_model` consumes the freshly built native four corner rectangles and the real north member coordinates, breadths and depths. It partitions the physical outer ring, excludes the slab material already present, existing upper L concrete and the actual retained deeper north beams, and reports only new concrete. It deliberately makes no200/290mm assumption about those north members. The proposed350mm band must not replace the retained750/650mm beams.

The source includes a full six-action rigid offset/work-transpose control and the actual solid rectangular Saint-Venant torsion series. Separate slab/rib torsions must not be added and advertised as a350mm rectangle. No stiffness, physical-G, normal contact, foundation support or world restraint has yet been installed by this checkpoint. `nativeSolveAvailable` and `materialInstalledInNativeModel` are false.

The intended complete insertion is ordinary finite perimeter frame receivers replacing their real slab strips, preserving all removed strips' original normal-bearing fibres through full work-dual beam traces. The remaining MITC/CST field is still200mm. No material or in-plane band stiffness may be counted twice. Corner joints would initially retain explicitly labelled conventional frame assumptions, not claim four finite three-dimensional joint validations. A real no-wind G/Q input and fresh solve are required; catalogue wind case0 is not that baseline.

Current hold: the cage consumer is testing whether an ordinary continuous ring cage, floor-bar development, column continuations and links actually fit. The300mm-wide band is preferred for that test over inventing tight bespoke development in200mm. Its visible consequence is a70mm-high perimeter plinth at first-floor FFL, with actual finished-face projection to be coordinated, not hidden.

The old rear300 signed96 and rear4000/31 references remain immutable. The complete new family must also remove the intrusive old rear posts through a real coordinated rear bearing/arch proposition. Their reactions cannot be transferred to this changed frame. Foundation tensile reactions, signed simultaneous actions, physical cap/grid coverage, genuine arches, room access and services remain owning checks.

If this ordinary frame still has no convincing placing/load path, the explicit fallback is a rearranged continuous masonry/crosswall house with genuine arches and conventionally seated/tied diaphragm. The earlier failed masonry frame does not reject that whole architectural family.
