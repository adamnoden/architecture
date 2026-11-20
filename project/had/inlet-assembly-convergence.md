# One joined incoming-water arrangement

**19 November 2026 · retain the indoor reference; reject the default south closure arrangement for adoption.** The complete south inlet has useful geometry, but its passing pipe, flow and removal comparisons do not establish a closed, independently supported, renewable wet assembly. HAD-INLET-RESOLUTION remains open. This result replaces the succession of isolated next-detail instructions as the current integration checkpoint; their adverse evidence stays available at its original scope.

The [inlet assembly compiler](../../compiler/reference-house/current-design/inlet-assembly.ts) now joins the actual conditional sill, pressure paths, both fault cases, both removal cases and both wet closures from **one saved engineering document**. The result identifies the actual failing subassemblies and the remaining internal obligations. It gives no physical or aesthetic approval.

## Architectural disposition

| Arrangement | Current disposition | Reason |
| --- | --- | --- |
| Inherited east lobby line and open transfer cabinet | Rejected as an adopted inlet | Conflicts with plant-N, pressure containment and occupied handling; retained in the [owning rejection](inlet-resolution.md). |
| Independent south feeds with native rectangular roof closures | Reject for adoption | Utility lid exceeds its installed tapered cell; both collar reservations miss their declared seal land; Plant wall return intercepts the formed high vent. Clear pipe routes cannot cure these failures. |
| Same south feeds with the already tested shaped Utility lid, smaller collar envelope, thinner Plant return and independent front rest | Conditional comparison; incomplete | The closures can fit together, but rated seals, complete connection and retained-end retreat, anchored independent supports, complete mass and positive captured handling remain missing. These are pre-site engineering obligations. |
| Fully detachable small upper hoods over fixed independent troughs | Recommended conventional challenger before another capture mechanism | Price complete removal of each light upper enclosure after isolation, keeping the fixed liner, lower relief and sibling closure intact. Its seams, riser opening and full hand/tool movement must be drawn before it can replace the tested candidate. It is a recommended simplification, not a selected untested solution. |

Keep the Boundary Service Lodge split, independent branch cuts, joint-free metallic wall carriers, fixed branch-specific lower troughs and separate passive receivers as the working architecture. Do not trade that independence for a common wet cover or infer an unattended pass from a maintenance pan or a person operating B0. Do not add another local lid correction until the complete retained-end, upper-closure and supported withdrawal sequence can be shown on the same geometry.

## The actual continuous pressure paths

The prior standalone route comparison still describes its explicitly named older south scope at **X10500 / X10645**. It is historical comparison geometry for this purpose. The joined stage takes **X10080 / X10285** from the actual sill insert and the Utility riser **Y580** from the wet-box renewal geometry; it uses Plant **Y545**. It continues through the retained upper paths to the Utility washer and sink branches and through the removable Plant drop and short cold connector to the named factory port. Five explicit endpoint checks reject a disconnected branch instead of drawing a connecting line across the gap.

All numbers below are recomputed from those joined three-dimensional paths with R75 backbone bends, complete Ø74 reservations and the existing 10 mm setting deduction. They are geometric comparisons, not matched fitting, pressure or support acceptance.

| Joined comparison | After setting |
| --- | ---: |
| Cold branch separation | 36.2024 mm |
| Utility cold to revised hot backbone | 40.1917 mm |
| Utility lower cold terminal to revised hot routes | 46.9089 mm |
| Utility to washer through restrained first rest | 127.6396 mm |
| Plant to washer through restrained first rest | 207.9971 mm |
| Utility to inverter work field | 65.9971 mm |
| Plant to inverter work field | 107.9971 mm |

The lower terminals remain fixed, source-bound parts. The named connection at the factory port proves coordinate continuity only. Actual unions, restrained reactions, thermal transitions and the loaded removal of the long Plant drop remain unqualified. The existing direct cylinder safety and D2 duties stay separate.

## One operation and failure account

Normal service requires the branch wet boundaries, independent high hoods and lower reliefs closed and unobstructed. A subject branch service state closes its Lodge and local cuts, proves both sides at zero pressure and drains separately. The washer moves to its restrained first rest; conflicting occupied, purge and electrical fields close. Both retained pressure ends are supported before the actual companion disengages and retracts. Only the subject upper closure, target and collar open; the fixed lower trough and the sibling's complete wet boundary remain intact. Positive support continues through the 620 mm draw and the first rest. Pressure and wet boundaries are restored and tested before the cuts reopen.

Those are required operations, not evidence that an operator performed them. The existing preparation booleans describe a scenario. Neither they nor a gravity-stable bare lid qualify loaded capture.

For a source-fed fault, the compiler retains each branch's **blocked upper exterior mouth** case and separately evaluates its high hood and lower relief. No credit transfers from the other cell, manual isolation, roof outlet, D2 or foul drain. Loss of Plant's hood rejects that branch even with the same clear pipe routes and an available Utility receiver. Renewal of an upstream private stop needs B0 and proved downstream isolation; a failure ahead of B0 needs the provider-controlled upstream action.

## Remaining obligations and decision points

| Missing proof | Owner and resolution point |
| --- | --- |
| Rated dry connection, actual disengagement/retreat and ordinary dry control access with the wet closure closed | HAD/MAT, before pre-site arrangement completion |
| Complete upper closure, split filler/collar seals, inward-draining seams and matched hands/tools | HAD/MAT, before pre-site arrangement completion; compare the small detachable hood before adding elaborate retention |
| Independent carrier, liner, guide and receiver sections and anchors; pressure/handling reactions; retained sub-sill restraint and continuous air/water/thermal boundaries | STR/HAD/MAT, before pre-site arrangement completion |
| Complete assembled mass, hand loads, positive transfer and captured first rest for the carrier and upper closure | HAD/IAS/MRA, before pre-site arrangement completion |
| Potable constituents, corrosion interfaces, frost/insulation and any bounded material-policy exception | MAT, before affected material selection and procurement |
| Actual supply pressure/flow, route length, survey levels, frost exposure, dry access and lawful independent receiver tailwaters | DPL/HAD, at plot acceptance |
| Actual separately assembled blocked-mouth, hood, relief, impact, loaded handling and reinstatement challenges | MAT/PHY/MRA, before installation and occupied acceptance of those claims |

The first four rows are genuine internal design debt. Site purchase or an external consultant is not their substitute. The last two rows cannot be manufactured by software, but they do not require stopping the internal design or the honestly qualified book.

## Executable changes and verification

The saved `inletAssembly.plantSouthLegLevelMm` comes from the existing under-sill source; the compiler accepts the existing ±50 mm bounded edit. Raising it from Z2610 to Z2635 changes the actual plant route, the inter-pipe clearance, drawing and result identity and rejects the joined arrangement under the 25 mm comparison. The nominal plans, selected-house water event, sibling route, inlet fault calculation and unaffected stage manifests remain unchanged. Removing only Plant's high hood changes its failure result and the joined disposition while keeping the route calculation unchanged. Missing input stages or either branch are rejected; no default sibling or earlier insert is substituted. Source and method drift invalidate the saved document.

Reproduce the complete default document and result:

```sh
node --import tsx scripts/compile-current-design.ts --read-georgian-source |
  node --import tsx scripts/compile-current-design.ts --read-engineering - > current-engineering.json
node --import tsx scripts/compile-current-design.ts --bundle current-engineering.json > current-engineering-result.json
node --import tsx --test compiler/reference-house/current-design-inlet-assembly.test.ts
```

The six assembly tests exercise the real persisted CLI, complete endpoints, rejected native closures, a refitted conditional arrangement, route perturbation, branch fault, missing branches, unsupported levels, save/load and unchanged controls. Existing inlet pipeline and engineering-document tests remain applicable. Hosted exact-head repository checks and fresh canonical merge preflight remain required before integration. Full inlet completion and any selected-source/MRA adoption await the stated internal result; no graph dependency is removed here.
