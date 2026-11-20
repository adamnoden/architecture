# Cage comparisons across the executed native RC cases

The [consumer](studies/native_rc_cage_envelope.py) applies the existing worked cage calculation to every **executed** case in the native96 receipt. It does not solve the structure, alter its loads or create a new structural source. It reconstructs each physical endpoint/cap row from the shared geometry and that case's six signed simultaneous actions, then includes that case's full analytic interior cuts.

Run after the native sweep is complete:

```sh
python3 -B project/str/studies/native_rc_cage_envelope.py \
  project/str/studies/monolithic-rc-native96-proof.json \
  --output project/str/studies/native-rc-cage-envelope.json
python3 -B project/str/studies/native_rc_cage_envelope_test.py
```

An optional `--cage-case path.json` consumes an exact authored cage case. The receipt binds that case and its digest separately from the native case, the exact native proof bytes, every native producer/input identity, the sweep producer, the executed cage consumer/method, water geometry and actual 52-head grid. Stale or absent producers, incompatible geometry, changed action order, incomplete/duplicated execution identities and approval injection are rejected. The current strain-compatible capacity laws support the authored 17 MPa concrete and 500/1.15 MPa steel comparison; edits to those laws are explicitly unsupported rather than silently ignored.

The report gives one summary per physical wind case and per **selected** GMAX/Q case. Each member bending, link-flow, cap bending/link-flow and cap-mat tension/bond/bend governor retains its complete simultaneous cut, case ID, wind index and physical-G/external-load allocation. A component maximum from one state is never combined with another state's axial force or moments. A zero capacity becomes an explicit adverse diagnostic with a null numerical ratio, rather than invalid JSON or an invented pass.

The source's 96 wind-programme identities represent 48 actual physical floor/open-north-portal wind solves and 48 explicitly paired identities. The additional GMAX/Q cases are selected controls, not all 48 possible strength cases. Likewise, endpoint cuts, load boundaries, point-load sides and analytic **component-moment** stationary cuts do not prove the maximum nonlinear cage interaction between those stations.

These are necessary section and force-flow comparisons. The **default joint assembly is rejected**, rather than merely awaiting fabrication approval. Its horizontal hoop arrangement does not provide the complete eight-bar arch/post joint with rib/hook envelopes and at-most100mm spacing; its near4550mm lap approach/jog also has an incompatible bend. A passing necessary section ratio does not turn that assembly into a fabrication proposal. Joint panels, concrete diagonal struts, cap/grid/pile transfer, cracked stiffness, thermal/waterstop performance and installed acceptance remain unqualified. Every selection/acceptance flag remains false. An adverse cage result does not remove a load family or weaken the structural model.

The exported `assess_worked_cage_detail(case, controlling_sources)` records that adverse review against the exact reviewed authored-case, geometry-method and portal-source digests. The optional source map lets another already-bound consumer reuse the assessment; the default reads this repository's actual cage method and water source. An edited cage, changed method or changed portal source receives **unqualified-detail**, with no inherited geometric approval. A replacement must provide actual closed ties, hook/rib clearances, transition stations and feasible formed lap approaches before its assembly can be reconsidered. This rejection concerns the worked detail; it is not an exhaustive impossibility proof for every conventional reinforcing arrangement.

The [owning rejection record](continuous-rc-closed-links.md) and [geometric receipt](studies/continuous-rc-closed-links-proof.json), SHA-256 `f0971bd62d4d19064322c1e5ae7faaa03e0c08576a54623050d249408a7384e3`, distinguish the two cases. The historical69mm-face detail's13mm ramp and4mm jog give a7.0417mm curvature-radius lower bound against86mm required; its mirrored16mm jog gives1.7604mm. The explicit hook/rib collision trials and204mm as-built gap are for the separately authored71mm-face/4850mm-lap refinement, which is also rejected. Those new axes are not adopted by this native69mm-force/cage receipt.

## Executed result

The [computed receipt](studies/native-rc-cage-envelope.json) consumes the completed [native sweep](studies/monolithic-rc-native96-proof.json), exact SHA-256 `2566e71bf5fd0d5a32809eca3789f6c7e28af606c289b3a2ceb25a5be80e58a4`. It screens all 48 physical 0.9G wind cases and the two actually executed GMAX/Q controls, W7 and W31: **16,046 simultaneous section rows**, comprising 192 member ends, 116–128 actual interior cuts and eight finite-cap cuts per case. The varying interior count follows actual load boundaries and component extrema; a fixed station count is not substituted.

| Necessary comparison | Largest ratio | Actual case |
| --- | ---: | --- |
| Member uniaxial interaction | 0.564143 | MONOLITHIC-G0.9-W31 |
| Member closed-link force flow | 0.270556 | MONOLITHIC-GMAXQ-W31 |
| Finite-cap uniaxial interaction | 0.423559 | MONOLITHIC-GMAXQ-W7 |
| Finite-cap closed-link force flow | 0.046133 | MONOLITHIC-GMAXQ-W31 |
| Cap mat tension chord | 0.150641 | MONOLITHIC-GMAXQ-W31, NS |
| Credited poor-bond hook-tail length | 0.860805 | MONOLITHIC-GMAXQ-W31, NS |
| Authored mat bend mandrel | 0.158860 | MONOLITHIC-GMAXQ-W31, NS |

Every computed necessary ratio is at most one for this finite execution set and the authored reference cage. The closest reported comparison is the cap's poor-bond hook tail. Those arithmetic results remain valid within their existing source/geometry bounds while the default joint assembly remains rejected. They do not close the omitted nonlinear-between-station search, the unexecuted strength programmes or the joint/physical obligations above. Its complete governing rows remain in the receipt for independent uncached structural replay.

The tests include signed reconstruction/truncation controls, an independent zero/uniaxial calculation, actual source W31 row consumption, interior-governor participation, a link-pitch perturbation, source invalidation, strength/identity/approval rejection and synthetic aggregation controls. Replicating W31 rows in a temporary test fixture tests the consumer; it is not recorded as structural execution evidence.
