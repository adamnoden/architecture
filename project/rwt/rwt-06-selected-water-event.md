# RWT-06 — selected water event and receiving limits

**6 November2026. Investigation in progress, not hydraulic admission or packet completion.** Starting main `8ab19d48ef16abaff39e7f49a3801d5dc5f65521`. The controlling [selected HAD model](../had/studies/water-replan.json) is blob `f7324121f59cc5f1707ea47640dd2b20c26b9bbb`; its [architectural result](../had/water-replan-result.md) remains selected at its own development scope. This work changes no HAD/Services/MAT geometry and carries no historical north-mouth capacity into the current proof.

[Calculation](studies/selected-water-event.mjs) · [regressions](studies/selected-water-event.test.mjs) · [complete values/state ledger](studies/selected-water-event.json).

## Decision

**The actual full event and receiving claim is not yet earned.** The E mouth has a finite additional-loss budget, but no source-bound calibrated loss/capture envelope. The N terminal remains100 mm short of its receiving footprint. The active E receiving-water limit has no corresponding located receiver/nozzle/landing-splash envelope. These specific relationships prevent RWT-06 admission; they are not a generic external-review request or a rejection of the architectural development selection.

The synthetic216 mm/h event over60.0625 m² assigns3.60375 L/s. It covers inward roof plus direct court rain, not the entire outer roof and not an adopted London design storm. The protective return gives geometric crest15 and allocated quiet stage−35 after25 splash/25 tolerance. Actual first susceptible material/first harm remains unknown. Calculation does not certify the declared geometric budget.

## Actual entry and loss budget

Only the direct E mouth atx6125 is credited: y6950–7175 and7275–7375,325 mm total, with actual graded crests. North wall-edge and northeast-apron entries and actual guard shadows receive zero capacity. The open framed ramp is not treated as an unlimited unobstructed weir.

The [US Bureau of Reclamation energy derivation](https://www.usbr.gov/tsc/techreferences/mands/wmm/chap02_13.html), checked6 November2026, separates theoretical critical flow from empirical corrections for curvature/friction/velocity distribution. Its [crest/approach/submergence discussion](https://www.usbr.gov/tsc/techreferences/mands/wmm/chap07_03.html) does not calibrate this short graded edge. The [USACE minor-loss reference](https://www.hec.usace.army.mil/confluence/rasdocs/ras1dtechref/7.0/modeling-pipe-networks/pipe-minor-losses), checked the same date, separates velocity-head, turn and plunge losses. No pipe-network coefficient is imported into the open house inlet.

For a rectangular unit strip, `q = sqrt(g) yc^(3/2)`. Critical velocity head is `yc/2`; a hypothetical added loss `K Vcrit²/(2g)` gives `H = (1.5 + K/2) yc`. Integration follows the TWO actual graded intervals. **K is an explicit sensitivity referenced to critical velocity, not an actual measured/selected coefficient.**

| Additional K | Required stage for3.60375 L/s | Reserve below quiet−35 |
|---:|---:|---:|
|0|−51.092 mm|16.092 mm|
|0.5|−45.256 mm|10.256 mm|
|1|−39.427 mm|4.427 mm|
|1.5|−33.602 mm|**−1.398 mm**|
|2|−27.782 mm|**−7.218 mm**|

The energy-derived clean coefficient1.7049 replaces the uncalibrated1.84 ideal screen for this comparison. Clean capacity at quiet stage is6.357 L/s; maximum additional clean K is1.380. With K1, only12.73% effective-width loss fits that allocated stage. The explicit25% width-loss/K1 case gives3.097 L/s and fails it. These are adverse sensitivity bounds, not proof that actual K equals1 or a particular debris mat removes25%. Actual under-ramp approach, contraction, capture, turning and tailwater need a defensible source-bound rating. Do not choose a convenient coefficient to manufacture a pass.

## Conveyance and first wetting

Actual N250/E600 clear sections and source slopes are evaluated separately, including N roughness sensitivity. At full flow, the n.02 uniform comparisons give32.842 mm N depth and17.231 mm E depth. These are not gradually varied profiles, inlet capacities or backwater acceptance; they cannot be added as independent benefits.

The N40 mm depth is only a hydraulic trial; full-height folds/perforated covers remain distinct. The gutter-to-body drop is617.647 mm. A full-width ideal free fall gives3.481 m/s impact,1.725 mm sheet depth and64.432 mm rectangular conjugate depth. This is NOT the actual250-wide side-notch turn, deflector or a located hydraulic jump. Actual air, jet distribution, waves, splash and first wetting remain unqualified. A100-depth budget cannot by itself protect nearby beam/cavity/floor joints.

## Receiving geometry

N ends aty13550/outlet−600; its receiver begins aty13650 with trial high water−800. The200 vertical gap does **not** bridge the100 plan gap. A horizontal full250×100 section at3.60375 L/s throws only29.1 mm during the drop, even neglecting losses; a vertical discharge has zero horizontal throw. Shallower jets can travel farther, so this is a source-unbound adverse case, not a universal miss claim. Bind the supported nozzle/chute and contained landing, or correct the receiver location. The earlier [terminal reception finding](rwt-06-terminal-reception.md) survives the new source's import of the historical terminal.

A finite candidate for HAD coordination is extending the same N receiver south to13450 while retaining the outlet: it would put a vertical jet100 inside, retaining the canopy outlet13700. It is **not adopted here**. Lip/support, wetting/erosion and real plot/head acceptance remain explicit decisions.

E provides a carrier endx12250 and receiving-water maximum−1000, but no active receiving footprint or located terminal/landing-splash envelope. The flange catch's80 pipe/−1300 maintenance receiver is not a full-duty E route. RWT must author the actual E terminal/receiver relationship and return space/level consequences to HAD. Real-site disposal and common flooded-ground applicability remain DPL duties.

## Rain during maintenance

- **E removed:** actual roof, L bund, skirts, entry and downpipe are located. Establish/test the enclosure with N intact/full-duty before E release. Its admitted wind-driven leakage/closure/temporary-weather envelope remains unresolved performance evidence.
- **N short modules removed:** court roof/E pipe and threshold bypass precede short work. N long liner stays intact; loggia roof/low pipe remains absent while short crews return. No simultaneous short/long removal is credited.
- **N long liner removed:** short modules are reinstated before the separate loggia canopy/pipe is installed. Canopy rain goes directly to its separately available receiver; the long crew uses the controlled lane. Assigned court/roof input goes to E.

The generated ledger retains exact current controls, outlets and phase identities. Actual full catchment interception, inlet/pipe loss, cover-cartridge leakage, splash and temporary-weather/erection operating limits still require proof. A failed intact route, unavailable required receiver or common whole-site flooding rejects the maintenance state. No pump, forecast, instant repair or attentive resident receives passive-safety credit.

## Disposition and verification

RWT-06 is **started, not complete**; RWT-07 remains dependent on it. Next are actual terminal/receiver correction and a defensible entry/capture/loss/first-wetting bound, including the three source-drawn maintenance phases. Geometric falsifiers return to HAD/MAT owners, never through a silent selected-source edit.

Four regressions cover actual loss/obstruction budgets, critical-energy/unit/guard-shadow relationships, receiver-gap counterexample and maintenance-phase separation. Tests also compare committed output exactly. Run `node --test project/rwt/studies/selected-water-event.test.mjs` and `node project/rwt/studies/selected-water-event.mjs --check`; the test joins canonical `test:rwt`. No physical event, calibrated coefficient, material acceptance, real receiving level or first-harm certification is claimed. Exact-head full repository health remains required before integration.
