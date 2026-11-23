# Unverified route/operation correction recovery — 23 November 2026

This branch is a **reconstructed, unverified recovery checkpoint**, not an integrated current source or an accepted arrangement. Base main is ae5d28d605c2ebf190cb6bf922a8af8f0ddb29b3. The execution environment failed while the original patch and tests were in an isolated worktree. These source files were reconstructed through the GitHub connector from known tool inputs and exact base file contents; they have not been byte-compared to the now inaccessible worktree, compiled or tested as this remote tree.

## Observed defect

The source8 cold route screen considered room/furniture/doors/maintenance/shield bodies, other cold pipes and fitting territories, but omitted actual valve bodies, stems and ordinary arm capsules. Its local geometry/budget pass did not establish route-operation compatibility.

At unchanged bank [11360,2350] and Utility/Plant axes1270/1890mm:
- Utility return [11150,2350,1520] → [11150,2350,2250] enters Plant stem/wheel box [11143,2287.5,1827.5,217,125,125]. Observed pipe reserve −60.05mm with full40.05mm jacket radius and two10mm settings.
- Plant upstream approach [11360,2230,2610] → [11360,2230,1640] conflicts with its own insulated valve body: observed reserve −23.55mm. A same-branch exclusion would conceal this.
- The Utility return also crosses the Plant ordinary arm sector. The shared checker was executed once before environment loss: minimum continuous-sector pipe/arm reserve −101.581440mm, preserving arm radius40mm, jacket40.05mm, settings20mm and sweep allowance1.545415mm.

The narrow geometry/budget comparison remains explicitly narrow. The reconstructed current join exposes a separate operation result and makes the bank route/operation/clamp screen reject actual collisions. Joined diagnostics include INLET_ROUTE_VALVE_BODY_OR_STEM_COLLISION and INLET_ROUTE_ORDINARY_ARM_COLLISION. It does not change duties, saved geometry, source8 schema, fault bounds, ordinary maintenance fields or product selection.

## Method and connection boundary

The checker lives in the existing shared inlet routing method and is consumed by the existing bank receiver and saved inlet stage, so CLI and browser requests use one computation. It checks all full-jacket straight segments and full boxed fitting territories against both valve body/stem envelopes and continuous ordinary shoulder-to-grip capsules.

Only the designated connected axial segment at each exact160mm valve face is trimmed, through its own insulated body plus pipe jacket and both settings. It must remain on the actual flow axis and extend beyond the boundary; unsupported face geometry throws. Other legs on the same branch and all sibling bodies remain checked. Arms receive no connection exemption. A1e−7mm numerical zero snaps only floating-point residual at the exact constructed interface boundary.

The declared regrip sector is sampled every1degree across−15..15degrees and every2mm across0..40mm wheel inboard uncertainty. The extra radius is62.5*pi/180/2 + 2/2 =1.545415mm: a Lipschitz/Hausdorff cover for intermediate capsules. This is a conservative declared-envelope comparison, not measured operator torque or verified factory wheel position.

## Verification state and required next work

Before interruption, six existing focused tests produced five passes and one expected failure at the old assertion that the bank screen was true. That assertion was corrected and a source8 counterexample regression added. A seven-test rerun was launched (session63695) but its result could not be retrieved. An earlier typecheck completed, before the last admission/zero-normalisation edits. No exact-remote-head test claim is made.

The latest attempted visual valve/arm overlays did not receive a successful tool response and are deliberately excluded from this reconstruction. Only explicit SVG rejection text is present. No generated receipt, source-account blob, current witness or review SVG has been hand-edited or regenerated. Those existing receipts are therefore intentionally stale with respect to this unverified branch. No PR or merge is authorised by this checkpoint alone.

On environment recovery:
1. Inspect/review the reconstructed method, admission and exact exclusions. Validate missing/null geometry, sparse tuples, duplicate/missing path/valve identities and any non-centred body envelope assumptions; the new helper currently trusts much of its native typed output.
2. Run focused indoor-routes, bank-receiver, bank-edit and source-envelope checks, then typecheck. Reconcile any older expected passing route-operation screen.
3. Add an owning HAD source-family registration for this note and genuine source change edges. Use the existing canonical producer to regenerate nominal/local-pocket/carrier receipts from fresh validated bindings; retain every source-audit edge. Never patch receipt identities.
4. Verify unchanged source faults, stock/pressure/gravity inventory and saved-ground datum; prove compiler/CLI/browser parity, stale-source rejection and reversible edits at the submitted head.
5. Generate and visually inspect actual valve/arm collision views, then canonical publication preflight before integration.

## Reroute proposal — not tested or selected

A possible all90degree replacement leaves bank, valve axes, ordinary operator and full maintenance field unchanged. Utility downstream points:
[11360,2350,1350], [11360,2350,1520], [11310,2200,1520], [11310,2200,2270], [11310,2360,2270], [10040,2360,2270], [10040,1250,2270], [10760,1250,2270], [10760,1250,1000].
The short plan diagonal lies between vertical legs and allows rotated ordinary90degree elbows. Move both Plant upstream approach Y2230 stations toY2030.

This is only a candidate. Actual valve/body/arm/box territories, hot supply, fan pod/collar/condensate, all tools, receiver cold wrapping and pressure/thermal/gravity must be re-proved. Potential new authored source9 controls (returnY2200, returnTop2270, highRouteY2360, PlantApproachY2030, existing returnX11310) are not introduced here. No relief/backfeed/stored-water/electrical/floor duty is deleted.

## Full3D experimental continuation at interruption

Local commit130b647c6d34d8a7f3cfad051da1e059cd78e673, based86efc8ad, contained ten source-pinned recovery files (962,538bytes) under project/had/studies/side-receiver-full3d-recovery-20261123. **Those ten raw files were not uploaded before environment loss.** Their manifest was /tmp/convergence-water-full3d-diffmanifest-20261123.json. Do not claim that local commit or its raw results are available remotely.

Observed192 comparisons used native3D flexibility, a rigid6DOF pickup master, full route99.740481kg reference pipe/water/jacket/insulation plus two nominal6kg valves, full9bar cut-force signs, independent branch±40K signs, four guide seizure combinations and three explicit valve laws. Max frame122.241671MPa; pickup1514.282469N and76.379377Nm; translation0.139555mm; compatibility~1.8e−12, residual~1e−9. Independent cantilever uniform-line/internal-point-load controls at500/1500mm and fixed-fixed reactions passed. These comparisons do not bound actual valve stiffness/forces; softer laws sometimes worsen stress. A1700N translational reference cannot qualify the joint moment. Independent segment temperatures, copper/member/deformed clearance, actual guides, valve CG/compliance, collar/capture/cold wrapper and receiver resistance remain unresolved. Frozen source8 collisions invalidate adoption regardless of a local stress pass.

Earlier nineteen-file side-receiver checkpoint is durable at recovery/had-side-receiver-20261123, commit4d06892903bb4fba7185cae8a29d47c2498acb0c. Do not modify that historical experiment or treat it as current-house evidence.
