# Inner collector candidate — unselected checkpoint

**This is a new, incomplete candidate. It is not recovered source, an adopted assembly, or an ordinary rain-safe renewal pass.** The earlier private inner model did not survive. The durable recovery record is PR1470 comment [6765298508](https://github.com/adamnoden/architecture/pull/1470#issuecomment-6765298508). Its old40kg/m inventories, continuous rails, full-cover dependency and1171 sampled states are not inherited.

The frozen main candidate source has SHA256 `4eb505e4349b1af1eaa98c96b0aa7174a8b6e3c4210628a969cc10c8252e7eba`. This directory is a private review package. Root owns canonical integration and publication.

## Files and reproduction

The main candidate is `roof_water_inner_candidate.py`. It requires NumPy; the reference execution used2.3.5. It uses repository-relative source paths when installed under `project/rof/studies`, and accepts an explicit `--source-root` for a private run. There are no silent private-source fallbacks.

From an installed repository checkout:

```sh
OPENBLAS_NUM_THREADS=1 python project/rof/studies/roof_water_inner_candidate.py --output /tmp/roof-water-inner-full.json
python project/rof/studies/roof_water_inner_candidate_receipt.py --input /tmp/roof-water-inner-full.json --output project/rof/studies/roof_water_inner_candidate_compact.json
python project/rof/studies/roof_water_inner_candidate_wind.py
OPENBLAS_NUM_THREADS=1 python project/rof/studies/roof_water_inner_local_clearance.py
python project/rof/studies/roof_water_inner_renewal_candidate.py
```

The compact1.17MB receipt preserves all3584 case identities, the actual frame-member geometry, complete dimensioned stock list, case stress envelopes, exact controlling forces/movements and equilibrium residuals. The12.75MB full receipt is reproducible and remains private. The compactor verifies that its input receipt matches the candidate source before reducing it. It does not change the calculation.

The wind export contains768 finite resultants and24 shared-sign groups. The local-clearance source recovers physical section movement by exact beam-polynomial interpolation, including the uniform-load quartic term and section rotation. The renewal source independently computes continuous swept polygons; it does not reuse a sample count from the lost model.

## Current physical comparison

All dimensions are millimetres. Local `p` increases clockwise along the court face; `q` increases from the exterior face towards the court; `Z` is upward.

| Item | Current candidate |
|---|---|
| Court collector |280×120×20, centreq3917.5/Z6600; solidq3777.5–4057.5/Z6540–6660 |
| Primary wet body |q4375–4725,350wide; bedsSW6605.75/NE6635; front6715; rear6795;170water comparison |
| Lower wet body |q4375–4800,425wide; bedsSE6386.25/NW6415;125walls; rims6511.25–6540;190water comparison |
| Primary cap |Unchanged planq4700–4800; Z6820–6840 |
| Independent fixed rails |80×120×2 atq4235; primaryZ6880, lowerZ6730; same three root allocations and30 dry gaps |
| Separate root stems |Primaryq3850, lowerq3985, on8mm plates above the collector; footprints3790–3910 and3925–4045 |
| Lower fixed hanger |200along×20radial×3, centreq4335; finite radial body4325–4345 |
| Primary physical arms |p4800,5325,5775,6225,6675,7200; wet-module cuts, actual water centroids and native roots remain unchanged |
| Lower physical arms |p4600,5100,5550,6000,6450,6900,7400 |
| Removable carrier release |q4335 for both circuits; the primaryq4235–4335 socket stub remains fixed |
| Primary apron |Wet planeq4590/4593, outside the secondary baffleq4565; fixed toe6880;320long lower leaf;190stroke; minimum normal lap120.75 |
| Primary apron stow |Minimum retracted toe6870.75; highest top7220; nominal75.75 to rear6795 and39.88 to the primary weather plane atq4590 |
| Secondary wet path |(4545,7107.3288)→(4565,7085)→(4346,6990); downleg ends35 above the local lower bed |
| Lower shoe |q4310–4400;20lip and60 tongue stroke |
| Primary spill |q4730–4780; proposed80 upward captured stroke before any horizontal primary draw; raised top6795 lies25 below cap underside6820 |

The primary-arm relocation is necessary: the former primary arms intersected the widened lower hangers. The new150-wide arms have25mm minimum nominal along-face separation from the200-wide lower hangers, with50mm at the intermediate closest pairs. This is only a nominal solid separation until the actual native paired motion, both local flexes and settings are joined.

The nominal court weather face remainsq4250. Theq4275 bound is an explicitly authored25mm projection/setout challenge; it is not a recovered proud-brick dimension. The source does not treat wall fabric as air. It declares a new continuous upper recess and local primary-hanger pockets. Their lowest proposed cut isZ6540, leaving only25mm above the6515 arch envelope. Arch stability, remaining masonry, roof load introduction, cavity/air/thermal/weather closure and the wider collector seat/diaphragm are not qualified.

## Material and local response

The comparison retains1mm copper for the primary wet body and uses supported0.7mm316L for the other wet skins. It explicitly counts separate wet/end/joint stock, apron overlaps, independent apron end ribs, independent moving-pan backing ribs, roots, fixed rails, hangers, carrier rails, plates, guides, bolts/nuts/washers, clips, locks, spill guides/stops and declared weld metal. The apron ribs are independentRHS20×20×1 members; an unsupported folded-hat stiffness credit is not used.

The lower corner rear span is500mm, so its backing count includes five supports per half-corner at150 maximum. The total lower backing count is30; primary is24 at200 maximum. Full-width corner ribs are conservative stock bounds, not a fabricated corner frame.

| Main local comparison | Primary | Lower |
|---|---:|---:|
| Dimensioned face stock,kg/m |57.450022 |65.144077 |
| Maximum member comparison,MPa |85.773765 |106.210848 |
| Absolute local toe movement,mm |5.774969 |8.268110 |
| Local paired-width movement,mm |3.683862 |6.329555 |
| Separate carrier strip/rib/rail bound,mm |4.701555 |1.504823 |
| Maximum main-frame toe normal movement,mm |2.203796 |3.857720 |

The steel screen uses E180GPa, density8000kg/m³ and a165MPa proof comparison divided by1.1, giving150MPa. Actual material, weld and joint qualification remains separate. The kernel has closed-form cantilever displacement/reaction checks and an independently split uniform-load beam check. Member interior force extrema are recovered for the consistent stock/wind loads; the stress screen conservatively combines independently maximised force components.

The native60 contract is **per cassette**, with primary58.5/67.5/58.5kg and lower57.5/81/57.5kg limits. A face-average kg/m value is not that contract. The main receipt still marks its proportional allocation as a screen. The structural colleague's separate exact profile/root/module partition reports conditional remaining mass reserve, but the physical stock assignments and permitted remaining-part centroids must be joined before those caps are earned.

The physical arm/hanger overlap query leaves **12.007593mm** for native paired along-face closure and other movement after both recovered local bounds and10mm opposed settings. The local normal movement of the lower hanger in that overlap is **2.309326mm**. These values exclude the separately exported added apron-rib/standoff pressure, roof/facade movement and contact/guide flexibility.

## Wind and hydraulic boundaries

The main frame checks both vertical wind signs, simultaneous along/radial wind, independently signed rear/front body and apron pressure, all0/full local water patterns and gravity factors0/1.35. Every finite eccentric resultant uses the explicit cross product at its own application point. The body-wall and apron corner lengths differ from water tributary lengths and are represented separately.

The wind export distinguishes the panel/main-frame domain from an additional gross apron-rib/standoff projection. That additional pressure has **not** been returned through the main local frame. Its provisional p/q/Z ranges must be enveloped; a midpoint is not asserted to be a fabricated stock centroid. The52 vertical floor rows also overlap portions of the original native roof/cap pressure reservation. A conservative addition can be tested, but must retain its identity rather than being called a source-exact replacement.

The structural colleague's new conservative horizontal-pressure addition has already failed the existing global screens: court interaction1.054540; M24 tension118.416362kN against113.922727kN; floor ties8.220266kN against8; roof ties3.084917kN against3. Its own source/receipt is the authority for those observations. It is not valid to attach the earlier original-house-wind pass to this local candidate.

Root owns the portable hydraulic comparison. The candidate now carries170 primary/190 lower water. The old160 primary results are prior comparisons. Uniformly distributing an obstruction around the lower graded lip was insufficient: blocking the low part gives a larger head. The current hydraulic proposal includes that adverse placement and transport losses. No hydraulic pass is supplied by this local-frame source.

## Raised handling-trough comparison

The new route keeps the four gate-post positions and guard planes. It proposes a fixed ground-supported trough atfloor6100/rim6250, fixed lower guard to6250, and upper part gates6250–6640 opening to underside7140 with890stroke. The separate route raises both rests to6300. This supersedes the earlier6280 rest concept only within that temporary-stage comparison.

The complete585-square body bound begins at(4310,4310). It draws955 in both axes to(5265,5265), then follows the existing355east/370north/445east handoff. Continuous swept polygons, with separate5mm body and post setting boxes, retain **10mm** minimum post clearance and **15mm** rest margins. Reversing those translations gives the same static swept solids. It does not prove reversible water control or reconnection.

The trough's120 capture skirt conflicts by95mm with the old worker at(6500,6550). The new worker position(6500,6700) and an explicit150mm north extension of the outer landing restore55mm tray/worker clearance without moving the four transfer-gate posts. The temporary layout is therefore a real alteration, not a relabelled old stage.

The full3.60375L/s inward dose is the proposed trough duty. Its capacity, first deployment, roofward bridge, post/pipe collars, outlets/backup, wind/splash containment, support/guard resistance, site/service intersections and onward export remain unproved. The source deliberately reports no rain-safe renewal pass.

## Precise remaining failures

1. **First wet opening:** no recovered inner bowl/shoulder/collar or positive outlet shutter proves contained diversion before the first head/spout release. Independent interception must be live before the80 spill upstroke, apron retraction, a seam opening or normal-head release. Retain350 spout lift,800 head/upper-spool lift and8350 complete hoist controls until an actual inner assembly proves its own geometry.
2. **Independent cassettes and whole corners:** actual wet joints must pass water without adding unmodelled vertical force, torsion or along-face moment between root cassettes. A rigid L pan does not automatically preserve the native diagonal-half water reactions. The support/articulation remains unproved.
3. **Local connection and stack:** twoM10 capture bolts and60×40×6 socket stock are inventory placeholders, not an earned moment connection. The current25-deep arm axis14 below the wet floor leaves1.5mm above its top, while0.7 liner+1.2 backing needs1.9mm: correct the0.4mm stacking difference in the next revision.
4. **Window clearance:** the complete26.9mm carrier stack leaves59.35mm nominal above the6300 window head. Even the prior native14.709108mm downward bound plus local8.268110, carrier1.504823 and10setting leaves only24.867959mm, below the old25mm target before the added pressure domain. The61.25mm old gap cannot be inherited.
5. **Wall/release motion:** actual roof/facade and roof-to-ground relative motion must be joined. Common-root cancellation cannot be assumed. The new pressure addition and apron/guide flex are not contained in the earlier908 vertical-only queries.
6. **Weather and supports:** the proposed wall recess, roof laps, wet apron joints, full rib/standoff contacts, temporary trough, first rain bridge and actual receiving structure are unqualified. A passing beam stress or swept polygon does not supply those missing interfaces.

The useful result is a concrete, reproducible partial design and a set of located falsifiers. It remains unsuitable for a selected ordinary-renewal claim.
