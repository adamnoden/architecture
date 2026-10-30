# Copper crossing: what an openable floor route actually changes

**30 October 2026 · bounded RWT-METALS comparison · not for construction.** Starting authority: main `5a28e4d5d0f367cd8c3cda10788966b23c93f1a1`. This develops the [access-first direction](copper-access-first-result.md) alongside the [raised-terminal section](raised-terminal-section.md). It changes no house geometry, threshold, floor specification, water level or material selection. RWT-METALS remains planned.

## Decision

**Carry an openable, segmented north crossing forward as a conditional comparator, with its two threshold crossings treated as distinct renewal tasks. Do not describe a removable family-room cover as access to the entire route.** Segmentation can remove the need to pull one uninterrupted carrier through the whole house band. That advantage is not earned until the first release, threshold pieces and room-side lifting sequence are shown together.

The located comparison identifies a **3415 mm family-room run between two 417.5 mm threshold/support bands**. Those bands remain even when the interior floor is openable. A doorway supplies passage above its threshold; it does not make the construction below that threshold removable. A short crossing with an intact 220 mm flange still cannot pass through a 160 mm bore.

[Located comparison sheet](studies/segmented-copper-access.svg) · [recorded values](studies/segmented-copper-access.json) · [source](studies/segmented-copper-access.ts).

## Three physical territories, not one access label

The current house has a 3500 mm court ending at y7750 and a 12000 mm outer shell. Both north court and garden door apertures occupy x4800–7200. Retain the historical comparison axes x5800/6200 only to locate the question:

| Territory | Coordinates, mm | Proposed renewal task and retained construction |
|---|---|---|
| Court threshold | y7750–8167.5 | Support the door and crossing independently; expose service joints on the appropriate sides without removing the fixed court-water penetration or threshold weather boundary |
| Family-room floor | y8167.5–11582.5 | Open discrete floor components; release supported pipe modules and lift them into a separately reserved handling/set-down area |
| Garden threshold | y11582.5–12000 | Independently release its crossing piece; retain threshold support/weather boundary and a usable exterior approach |

These are plan bands from the house, not engineered clear passages. The old 650 mm opening is an unadopted comparison. Its proposed continuation through the room would interrupt floor finish, support, insulation and occupation; it is not an existing service hatch. Furniture relocation and temporary loss of the court/garden route are maintenance states for HAD to assess, not permanent furniture-free territory assumed here.

The historical continuous carrier required a 4450 mm body and an authored 5250 × 1600 mm exterior extraction reservation. With accessible modules, the longest **unopened plan band** could be 417.5 mm, but the corresponding pipe piece must also include its actual tails, engagement and release needs. **No 417.5 mm removable component, reduced garden corridor or maximum module length is selected.** A piece trapped by its flanges can remain unrenewable despite a short wall crossing. Staggered joints, different supports or a different route may alter the comparison.

## The floor reserve does not contain an unallocated service slot

The house source has a nominal **300 mm ground-floor reserve**, not a resolved load-bearing, insulated ground-floor assembly. The earlier ACO shallow-cover comparison supplies a **50 mm cover/frame-depth comparator**; it did not establish a selected non-plastic, insulated or watertight hatch. Use it here only to expose depth consumption.

For a centred 220 mm flange envelope on a horizontal pipe, let c be cover depth, i additional insulation above the flange, g the remaining gap above it, and f the retained fall between the two comparison slices. A necessary depth below FFL is:

`near depth = c + i + g + 220; far depth = near depth + f`.

This deliberately excludes the lower support, enclosure, water boundary, bolt/tool projections and removal sweep. It is a lower-bound layer comparison, not an assembled elbow section. The flange is placed at the historical crossing end slices to screen the same envelope at both elevations; actual joint-face locations are unknown.

| Conditional arrangement | Near bottom | Far bottom with retained 60 mm fall | Comparison with 300 mm reserve |
|---|---:|---:|---|
| c=50, i=0, g=0 | −270 | −330 | 30 mm remains near; far exceeds reserve by 30 mm, before all excluded duties |
| c=50, i=100, g=10 | −380 | −440 | Exceeds reserve by 80/140 mm |

The second row borrows the earlier study's 100 mm insulation and 10 mm gap as **sensitivity inputs**, not thermal or working-clearance requirements. Neither row is an approved floor build-up. Counting only the bare 108 mm tube would omit **112 mm** of diameter at the intact flange. Using smaller fittings, moving the joints, staggering their stations or changing the floor arrangement requires its own connected comparison; this result does not reject every openable route.

At one common longitudinal station, two 220 mm envelopes on the retained 400 mm centres occupy 620 mm. In the old 650 mm opening they leave only 15 mm at each outside edge before support, hardware and tools. Retaining the old 35 mm side allowances gives 690 mm before sleeve wall or running clearance. These bounds concern the **same-station paired arrangement**; they are not universal minimum widths for staggered or separately accessed modules.

## W1 and W2 must survive different operations

**W1** is water conveyed inside the carrier and its service joints. **W2** is the retained court pan/collector boundary and fixed penetrations protecting adjacent construction. The [HAD court trial](../had/had-03-court-levels.md) places paving at 0, pan top at −180 to −215 and a trial threshold reserve down to −45; the [first-failure register](../had/had-03-court-threshold-first-failure.md) explicitly withholds an actual lowest susceptible joint. Those drawn levels do not locate a selected outlet or admit a flange behind the threshold.

Before locating the first demountable W1 joint, provide an actual fixed outlet/stub section through W2 and the supported threshold. Show which side of W2 is accessible, how leaked or flood water behaves there, and which boundaries remain intact while the joint is open. An openable interior lid cannot supply the missing fixed penetration or make a low well dry. The [passive site-interface comparison](passive-court-site-interface.md) and raised-terminal result remain controlling: no deeper local trench, pump dependence or inaccessible groundwater tanking is introduced to rescue the fit.

Develop this falsifiable sequence on an actual assembly: independently divert the contributing rain; support retained pieces and the removable module; open its floor access without disturbing threshold support; remove fasteners and release the specified seals; perform the complete elbow/module sweep; renew each short threshold crossing by its demonstrated path; reinstate and test W1 separately from retained W2. The first right-angle terminal release does not prove the later straight-module lift. Opposed flat faces may permit a lateral release, but actual locating features, gasket adhesion and tools determine that result.

## What must now be resolved

The connected section needs exact mating faces and seal constituents, retained collar/hardware after any backing-ring removal, actual joint positions, independent supports, floor-cover structure and thermal continuity, and a measured full removal/handling path. It also needs the relevant receiving water, groundwater and court-threshold result. Actual outlet position, module lengths, working clearances, release travel and safe water levels remain **unknown**, not zero.

The separate [Endex source update](copper-access-first-result.md#actual-components-and-evidence-boundaries) recovers the manufacturer's component drawings and brazing instruction. It still does not supply an installed face/gasket stack. More catalogue dimensions cannot close the architectural crossing by themselves.

Run `node --import tsx project/rwt/studies/segmented-copper-access.ts --check` to verify the recorded arithmetic and sheet against the source. The generator guards the house/door dimensions and historical geometry identity; its checks establish reproducibility only. Independent architectural review, actual assembly demonstration and the later composed failure assessment remain different obligations.

**Earned:** the access-first comparator is located; its threshold tasks and conditional depth/lateral conflicts are explicit; the full-length extraction burden is no longer mistaken for an unavoidable property of every route. **Not earned:** a shortened physical extraction corridor, an installed terminal, dry service space, adequate floor/support, hydraulic acceptance or packet completion.
