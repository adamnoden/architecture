# Wet post head: a nominal fan and an editable pad

**Use120 ×100mm as the next local development comparison, ahead of widening the posts.** This is a source-bound engineering recommendation for the next test, not a selected pad, bearing material or whole-house baseline. The saved220mm default remains an explicit reference;140mm is retained as the previous comparison. Existing saved width/cage edits drive the same native floor/beam/contact/52-head model and reverse through the document history.

The [current recovery proof](studies/wet-pad-fan-recovery-proof.json) authenticates the immutable original120/140/220 full native archives, checks all58 native source hashes against the current source, independently reconstructs the exact expected requests and replays the current contact/cage/fan methods. The12032→64 numerical comparison passes the unchanged criteria; its maximum52-head component change is0.000064284kN/kNm. The actual shared Node cage and fan consumers were executed on the full120/64 response and matched the pure current fan result. No new native solve or source hash rebinding is represented by this postprocessing replay.

| Actual wet27,1.35G/Q2,64-point pad | Necessary whole-pad virtual-domain reserve X | South affine peak pressure | Governing nominal ideal tie | North gross full-compression ratio |
| --- | ---: | ---: | ---: | ---: |
|220 ×100mm|−47mm|2.799MPa|This fan is unsupported|2.459851|
|140 ×100mm|−7mm|3.670MPa|11.374kN|1.699744|
|120 ×100mm|+3mm|3.993MPa|10.714kN|1.505239|

These are matched actual controls with the same10mm graded cage raise. Changing only pad width redistributes loads; narrowing raises the south affine pressure. The positive3mm virtual-domain reserve does **not** cure the northern gross head's no-tension condition. The source-wrench/body-G calculation first satisfies that gross-section condition about15.513mm below the120 north head, compared with30.486mm for140 and186.995mm for220. This describes an unresolved local reinforced region; it establishes neither cracking nor resistance, and it does not qualify a physical pad pressure.

The former140 comparison also increased sampled beam-axis displacement from0.7925 to0.8387mm relative to220 and moved up to3.668kN between head components. Those source-bound observations remain historical comparison evidence; a local fan result cannot erase the surrounding beam/foundation response.

## What the shared method computes

The fan consumes actual contact fibres and the independently generated, currently saved cage. Virtual targets derive from the straight-leg axes of its second-highest perimeter. For each downward force F at x,y relative to the post centroid, the four weights are `(1 ± x/a)(1 ± y/b)/4`. They must be nonnegative. Their inclined struts conserve the force and both first moments; four perimeter tie forces balance the bottom horizontal components. Actual pad gravity enters once at its source origin. Post gravity over the actual fan depth remains a separate centred field, added once and checked against both source end wrenches and the transported section.

At the actually examined 10 mm graded cage raise, the virtual half axes are 79/174 mm and depth is 172.290 mm. The120mm south comparison gives10.713827kN in the governing ideal tie, a0.532862 necessary single-H8 steel-only ratio using the existing comparison fraction. Its basic poor-bond length is220.647mm. The existing 80 mm hook tail is not automatically a developed fan tie: finite node, bend, hook and force-introduction geometry still need their actual model. These are necessary comparisons, not resistance acceptance.

The 220 mm pad lies outside this particular positive-weight fan. That rejects this topology for that input, not the post or the whole house. The shared method now charges the actual pad/post relative10mm bound, whole-cage5mm installation bound and link1mm fabrication bound independently, once each. It uses the actual pad-centre offset, complete pad dimensions and actual virtual straight-leg axes. For120, `79−60−10−5−1=3mm` in X;140 gives−7mm and220 gives−47mm. The nominal centred Y reserve is108mm. An actual4mm X offset would consume120's3mm reserve and reject this necessary geometric screen. No main-bar bound is substituted for the separately authored hoop/cage bounds.

This is whole-pad outline containment in **virtual extended straight-leg axes**, not the finite rounded hoop, concrete node or complete tolerance domain. It does not re-equilibrate a moved pad or grant friction, tensile retention, compatible post deformation or anchorage. All tolerance/node/anchorage/resistance acceptance flags remain false, including for the positive120 screen. No nominal fan is a placement pass. Missing/stale sources, request, cage paths, contact samples or incompatible head actions produce explicit diagnostics; no pressure is clipped to manufacture a fan.

## Architecture and remaining work

The south post crosses the rear corner of the existing stair midlanding, beyond the documented flight turn. That is an unjoined structural/landing-space interface, not a demonstrated blocked flight. Widening it would enlarge the join and cannot be selected without its actual compatibility and occupied geometry. An experimental closer upper cage also remains unadmitted: a clear bar-path drawing alone does not qualify anchorage, mass feedback or resistance.

The shared floor result and browser expose nominal fan status beside actual floor/contact/cage results. CLI, browser and batch use the same saved width and cage choices. No new stage/default, steel, material law or native stiffness is introduced. Finite CCT nodes, rounded-bar force introduction, anchorage, post-section continuation, placement, complete signed loading and the existing floor/corner mesh-convergence failure remain open. Neither slab thickness nor raised-ground/roof/interior coordination is adopted.


## Reproducible current recovery

`wet_pad_fan_recovery_proof.py --write` verifies every member of the two exact immutable archives before using their complete native responses and capture manifests. Each current-source native response must pass the existing52-head/source-wrench guard. The shared Node cage/fan replay supplies the same active consumers used by saved documents and the browser; its source/method identities are retained. The compact proof keeps every actual contact sample, exact request, post-end wrench and52-head vector losslessly. It regenerates the current cage paths and numerical/fan/gross-section comparisons with `--check`; it does not reconstruct omitted plate fields or full native response bytes from a hash.

```sh
python3 -B project/str/studies/wet_pad_fan_recovery_proof.py --write --width120-archive WIDTH120.tar.gz --alternatives-archive ALTERNATIVES.tar.xz
python3 -B project/str/studies/wet_pad_fan_recovery_proof.py --check
python3 -B -m unittest discover -s project/str/studies -p wet_post_head_fan_test.py
```

The proof records the exact repository paths, raw SHA256 values, Git blob identities and immutable evidence commit from which those archives can be recovered. No archive driver is executed as current authority. A changed native source, authored cage setting, method, request or retained contact observation invalidates the applicable replay; unavailable inputs produce diagnostics rather than a default pad or stale fan. Eleven analytical/adverse controls include unchanged input, actual width/offset and independent-bound edits, restoration, and missing/nonfinite rejection. Seven existing Node cage/editor tests preserve saved choices, undo and stale-result fencing. The default220 width and all physical/material/site acceptance obligations remain unchanged.
