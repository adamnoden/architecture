# Outward arch width comparison

**Reference design — not released for construction.** This is an unfinished negative development comparison, not a selected house section. The current adopted HAD model is unchanged.

The 140 mm inner RC arch/jamb in the [previous joined comparison](corner-arch-junction.md) did not survive inward steel/link setout. This successor tests 160 and 180 mm normal widths while retaining the occupied inside concrete face, the true outer masonry arch, the complete window opening, 215 mm inner arch radial depth and the outward 225 mm jamb foot. Widening alone does not close the joined strength problem. It also changes stiffness and attracts in-plane bending; a larger normal width cannot be credited as a capacity increase against unchanged forces.

The owning reproducible sources are [geometry](studies/current-house-outward-arch-geometry.py), [six-degree member kernel and falsifiers](studies/current-house-outward-arch-kernel.py) and [simultaneous eight-opening response](studies/current-house-outward-arches.py). Their JSON outputs own the numerical values. The new model follows the actual normal centroid through the foot taper, uses rigid offsets back to the house reference axes, and retains the changed near-L bending coupling and torsional rigidity. Four stiffness/restraint controls each contain 96 roof wind programmes, both pressure signs, both guard-point signs and both point locations on every loaded window. Every other window responds to that point; local-only action recovery is not used.

The controlling arch bending comparison is the 0.35 cracked EI / 0.25 near-L torsion, all-bearing control. The ratios below include the same-state longitudinal torsion reserve; they are not independent bending maxima combined with a different torsion case.

| Normal RC width | Nominal arch bending ratio | Adverse arch bending ratio | Maximum adverse arch link flow | Ordinary glass reservation | Gross additional RC gravity* |
|---|---:|---:|---:|---:|---:|
| 160 mm | 1.025 | **1.213 — fails** | **209.21 N/mm — fails** | 90 mm | 7.744 kN |
| 180 mm | 1.030 | **1.189 — fails** | 184.35 N/mm | 70 mm | 15.584 kN |

The H6 minimum 5.7 / maximum pitch 58 comparison gives 191.29 N/mm. A link-flow result below that limit does not resolve bending, development or construction. *Gross added gravity includes unreconciled near-band/ring intersections and is not a favourable whole-house deadweight credit.

## Actual cage, not gross concrete dimensions

The predecessor’s nominal foot flow used a gross 149 mm normal cell. That is superseded: the actual H16 axes at −38 and +14, surrounded by H6, enclose only **74 mm** between link centrelines. The actual opposing jamb X axes at 2352.647 and 2455.882 enclose **125.235 mm**, not a guessed 129. A 1 kNm torque therefore produces more than twice the old gross-box flow at the foot. This correction narrows the previous nominal foot screen; that previous study already rejected the robust 140 mm section and admitted no cage or construction method.

All current cells come from one bar/link geometry. Ordinary upper normal cells are 84 and 104 mm at 160 and 180 width, tapering to the same 74 mm foot cell. The adverse comparison cumulatively reduces formed width and radial depth by 10 mm and moves each opposing steel/link layer inward by 5 mm. The foot cell becomes 105.235 × 54 mm. These are explicit comparison conditions, not measured fabrication bounds. They do not establish delivered cover, aggregate flow, sleeve clearance or physical placement. The existing H6 nominal 55 / maximum 58 mm station schedule and actual sleeves remain a joint construction duty.

## Simultaneous resistance comparison

The dated method is the [JRC February 2008 Eurocode 2 presentation, slides 83–87](https://eurocodes.jrc.ec.europa.eu/sites/default/files/2022-06/EN1992_1_Walraven.pdf): closed-cell shear flow and longitudinal torsion steel at a 45° strut angle. This is a research method, not a claim of current regulatory correspondence. C30 with authored fcd 17 MPa and ν = 0.528 remains the material comparison.

For each actual signed response, the total longitudinal torsion tie force is charged to the same four H16 bars used for bending and axial force. The remaining yield strength is reduced by an additional authored 5% uncertainty reserve and rounded down to whole percentage points for the cached section analysis. The old blanket 8% reduction is not substituted for this calculation. Each bending witness records the member end and uses that end’s axial force and both bending moments. Separate records retain the two-axis bending interaction, combined link flow and concrete strut interaction for each load case. The strut screen conservatively sums both shear directions with torsion. Additional longitudinal shear-shift/anchorage duties remain open, so a passing local comparison would still not select the section.

The kernel regression checks the planar strong and weak limits against the prior independent kernels, then checks physical off-centre signed point forces and all three moments, including yaw. Actual gravity acts at the changed concrete centroid. These checks establish computational consistency; they do not prove real joint stiffness, torsional cracking, shear-centre transfer, intermediate extrema or physical support conditions.

## Architectural and accounting price

The ordinary upper insulation reservation reduces from 110 to 90 or 70 mm, with the 50 mm drained cavity retained. The foot remains its separate 25 mm insulation reservation. The geometry output prices gross additional concrete and simple one-dimensional thermal changes, including the near-L band. Its gross near-band/arch intersections still need reconciliation before a whole-house quantity or favourable deadweight can be used. No new foundation capacity, net gravity credit or complete thermal bridge result is claimed.

The whole window and guard budget, true outer arch, 225 mm foot, actual sleeve/barrier ports and occupied room remain reference constraints, not automatically successful consequences of widening. Longer through ties, sleeve bending and restraint, actual cage transitions, the new outward face/cavity return, and the rear-west fixed cabinet access remain open. The previous cabinet has no authored height or removal method; the short outward window release has no universal occupied-room acceptance.

## Can larger bars solve the arch within the existing cage?

**Decision, 8 November 2026. Reject uniform upsizing of the four continuous H16 bars seated against the same H6 link faces in either width.** The corner jamb foot bounds the diameter, and one existing load case for each arch width already exceeds the project bending limit throughout the diameter range that fits. This closes the bar-only option under the gross-section stiffness and gravity assumptions of the width study.

The 225 mm foot has parallel H16 axes at −38 and +14 mm. Its fixed H6 link gives 68 mm between inside faces. Two bars of diameter `d` and the existing two adverse 5 mm placement offsets leave at most `68 − 2d − 10` mm between bar surfaces. The project requires 25 mm for placing concrete between these parallel bars. H16 gives 26 mm, **16.5 mm is the largest diameter that fits**, and H20 gives 18 mm. Fitting H20 would require at least 7 mm more inside the link in this direction. Straight development independently needs 1,035.2 mm for H20 at the study’s full yield stress and 2.1 MPa bond stress. The existing straight tail provides 900 mm. The study gives the bend no anchorage credit. [Foot placing study](studies/current-house-jamb-placement.py) · [Authored anchorage and tail](studies/current-house-arch-detail.py) · [JRC basic anchorage relation, slide 7](https://eurocodes.jrc.ec.europa.eu/sites/default/files/2022-06/05_EC2WS_Arrieta_Detailing.pdf)

### Strength over the whole fitting range

The checks below use the two moments and compression from a single member end in each archived adverse load case. Keeping each bar against the same inner link face moves its centre inward by half the diameter increase, up to 0.25 mm. An optimistic upper bound on bending resistance can therefore exclude the whole interval without assuming that an intermediate diameter behaves like either endpoint.

| Nominal width | Wind / window / element / end (zero-based) | Compression (kN) | Strong / weak demand (kNm) | Strong / weak resistance ceiling (kNm) | Interaction lower bound |
|---|---|---:|---:|---:|---:|
| 160 mm | 76 / 0 / 0 / 0 | 17.374 | 18.461 / 2.218 | 21.729 / 12.912 | 1.02136 |
| 180 mm | 55 / 5 / 0 / 0 | 18.362 | 19.566 / 2.380 | 22.277 / 16.649 | 1.02130 |

Take moments about the compression-side steel row. Its force has zero lever arm. Give the entire favourable strip of concrete 17 MPa in compression and give the two opposite bars their maximum area, original maximum row spacing and 95% of design yield stress. Waive the torsion debit altogether. In N and mm the resulting ceiling about the centroid is

```text
M ≤ 17 b a_max² / 2 + 2 A_max (0.95 f_yd) s_max + N (h/2 − a_min)
```

Here `b` and `h` are the adverse section dimensions for the axis considered. The compression row is `a_min` to `a_max` from that face, `s_max` is the H16 row spacing, and `A_max` is the area of one 16.5 mm bar. The symmetric rows give the same ceiling for either moment sign. Using the most favourable arm separately in each term overstates what any one diameter can achieve. Even with those allowances, the sum of strong and weak demand divided by their respective ceilings exceeds the project limit of 1.000 at both widths. This margin measures the exceedance of the project’s linear bending check. [Reproducible calculation](studies/outward-arch-bar-limit.py) · [Same-end responses](studies/current-house-outward-arches.json)

The next design must change a dimension or the force path. A deeper arch needs a drawn crown-to-roof clearance with the window intrados fixed. A different cage or termination needs its own foot spacing, anchorage and placing route. Re-solve the changed stiffness and carry its signed actions through the floor and foundations before selecting the house section.
