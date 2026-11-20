# Continuous RC portal: rejected joint tie assembly

**The complete fabrication detail is REJECTED.** Both the historical 69 mm face / 4550 mm lap case and the proposed 71 mm face / 4850 mm lap refinement lack a buildable, closed, confined arch/post joint. Necessary member-section ratios do not admit either cage.

The new helper freezes explicit geometry failures, rather than assigning strength to unspecified construction steel. It binds the actual HAD portal geometry and the preceding cage generator by SHA256. It does not import a wind action receipt; the native 48-wind mechanical comparison is a separate, unchanged dependency. This result does not claim that every possible RC joint is impossible.

## Numerical rejection

The historical first bottom lap begins only 13 mm after its principal bend. Its 4 mm cubic jog has a minimum curvature-radius bound of 7.0417 mm, against the required 86 mm main-bar centre radius. It cannot be treated as a straight or adequately bent continuation.

The new authored refinement moves the two contact-lap intervals to X4850–5850 and X6150–7150, provides 300 mm ramps, and increases the paired centre separation to 14.5 mm. Its minimum curvature-radius lower bound is 869.565 mm against 87 mm required. The tied contact pack has zero minimum surface separation after a 13.5 mm rib envelope and ±0.5 mm relative packing tolerance. This is deliberate contact, not an independently spaced bar pair. The lap's tensile bond, force transfer and joint confinement have not been earned by this geometrical correction.

The explicit fixed horizontal post tie at Z2350 has a centreline separation of 1.761 mm from an extrados main-bar segment. The combined rib radii are 11.25 mm: the nominal solids intersect. At Z2300 its intrados witness is 4.407 mm. Enlarging the horizontal rectangle only within the actual cover-eroded post/ring union also fails; at Z2350 its witness is 8.785 mm. Permitted relative placement and interpolation allowances worsen these results. Deleting the failed links from the seven tested stations leaves a 200 mm nominal interval, 204 mm with ±2 mm station setting, against the authored maximum 100 mm. These are failures of the explicit layouts and their sampled schedule; they are not an exhaustive search over every possible oblique enclosure.

No complete closed joint station schedule has been produced. No joint-panel strength, arch/post force exchange, cap/grid strut-and-tie path or full fabrication acceptance follows from the isolated component checks.

## Parts retained for comparison

An isolated post, ring-end, outer upstand, court upstand and cap link can each accommodate the specified local main axes. Each H8 closure is a single wire with two 180° hooked ends in planes 14 mm apart, a nominal 55 mm straight tail and explicit three-dimensional jog. Under the admitted radius/tail/plane tolerances the smallest self-clearance is 3 mm. The smallest local main/link clearance lower bound is 1.302 mm. These values include the stated rib envelopes and total relative setting box; they are not measured-stock certification or a whole-cage fit.

Regular corner centre radius 22.75±0.25 mm and closure radius 24.75±0.25 mm give minimum rib-clear inner diameters 36 and 40 mm. Tail 55±1 mm remains above 50 mm. These dimensional checks do not prove hook bearing, bond or transverse-force anchorage. The main/link interpolation allowances are 0.4/0.02 mm. The main bound covers the corrected long cubic ramps and sampled arcs; it does not rescue the historical 13 mm ramp.

The new main face is 71 mm; normal bar offsets are ±74 mm in a 290 mm core. Its 16 proposed barrier penetrations differ from the native 69 mm conceptual barrier axes. Barrier, metal/bar seals, warm 140 mm core clip and moisture/thermal compatibility remain uncoordinated. No producer is silently relabelled to this detail.

## Reproduction and next decision

Run `python3 -B project/str/studies/continuous_rc_closed_links_proof.py --check` and `python3 -B project/str/studies/continuous_rc_closed_links_test.py`. The native helper accepts only the exact bounded authored case; additional approvals, source substitution and numeric mutation are refused. Adverse closure-plane reduction is tested independently and fails.

Stop refining this crossing cage. The next architectural comparison is an independent compression masonry arch below a straight RC frame versus a deliberately larger conventional joint/post body. Both must price actual opening, glass, finish and room consequences before either is recommended as a selected structure. The valid lap/hook parts above remain parts only.
