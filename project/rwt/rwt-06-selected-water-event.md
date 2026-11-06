# RWT-06 — selected water event and receiving limits

**6 November2026. Investigation in progress, not hydraulic admission or packet completion.** Starting main `8ab19d48ef16abaff39e7f49a3801d5dc5f65521`, original HAD blob `f7324121f59cc5f1707ea47640dd2b20c26b9bbb`. The current [HAD consumer](../had/studies/water-replan.json) is blob `4e6f9a338cb8c5e87f6afb82fe2a6f9fc6eeb702`, incorporating the source-owned [RWT receiving interface](studies/selected-receiving-interface.json). The [architectural selection](../had/water-replan-result.md), house topology, protection and quiet-stage budget remain unchanged. No historical north-mouth capacity becomes current proof.

[Calculation](studies/selected-water-event.mjs) · [regressions](studies/selected-water-event.test.mjs) · [complete values/state ledger](studies/selected-water-event.json) · [source-derived plan/section](studies/selected-water-event.svg).

## Decision

**Full hydraulic/first-wetting admission is not yet earned.** The initial N100 mm landing gap and absent E reception have now been replaced by an exact RWT-owned receiving interface, consumed by HAD. Actual terminal/receiver projection, rail clearance, cartridge handling/order and blocked-outlet spill territory are checked. The remaining performance boundary is the real entry/capture/drop/first-wetting envelope, not an unspecified receiver or generic external review. Sensitivity K is not assigned to the real inlet and is not itself an adoption failure.

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

Losses are placed separately:100 mm court/under-ramp approach; freefall into the catch; its northern return/250-side notch; hood plunge;600 carrier; and terminal. Quasi-uniform rectangular approach friction at authored n.02/.03/.04 gives0.51..3.36 mm, rather than assigning arbitrary lumped K to every downstream component. Actual side contraction and capture need their own geometry/velocity reference. If the catch remains free, remote hood/terminal losses are not simply added to the upstream crest; if they back up, that condition must be modeled explicitly. These are localized component sensitivities, not calibrated total loss.

## Conveyance and first wetting

Actual N250/E600 clear sections and source slopes are evaluated separately, including N roughness sensitivity. At full flow, the n.02 uniform comparisons give32.842 mm N depth and17.231 mm E depth. These are not gradually varied profiles, inlet capacities or backwater acceptance; they cannot be added as independent benefits.

The N40 mm depth is only a hydraulic trial; full-height folds/perforated covers remain distinct. The gutter-to-body drop is617.647 mm, giving ideal impact speed3.481 m/s. The actual250 side opening has **no defined250→600 spreader**: the600 outlet aperture does not earn a uniform600 stream. Same-width rectangular momentum gives99.097 mm conjugate depth for250, only0.903 mm below the100-depth budget; an explicit200-wide stream gives110.526 mm. The full600 comparison gives64.432 mm and is not the controlling actual-entry case. This follows the [USACE momentum balance](https://www.hec.usace.army.mil/confluence/rasdocs/ras1dtechref/6.2/theoretical-basis-for-one-dimensional-and-two-dimensional-hydrodynamic-calculations/1d-steady-flow-water-surface-profiles/applications-of-the-momentum-equation), checked6 November2026, reduced to a horizontal rectangular hydrostatic scenario. It is not a located jump, a prediction that the actual hood necessarily fails, or a splash rating. Actual turn, distribution, tailwater, air and first wetting remain unresolved. A positive0.903 mm nominal arithmetic reserve does not admit the capture assembly. Any forced spreader/deeper wet section must be a source-owned interface change, not an inferred material property.

## Receiving geometry

**Preserved historical negative:** N ended aty13550/outlet−600 while the former receiver began13650, trial water−800. The200 vertical gap did not bridge100 plan gap; a horizontal full250×100 section at full flow throws only29.1 mm. The earlier [terminal reception finding](rwt-06-terminal-reception.md) remains in the calculation/regressions and is not erased by the refinement.

**Current N interface:** receiving footprint4250..5750/13450..15150 keeps the outlet unchanged. Its full vertical250×100 exit lies50 inside the near edge, centre100 inside; canopy outlet5000/13700 also lands inside. A1500-wide NORTH overflow edge at−700 leads to a separate required continuation; ordinary maximum−800 and faulted maximum−650 are distinct conditions. Clean and50%-width ideal full-duty spill screens retain more than80 mm below the active−600 outlet. These do not establish actual terrain/disposal, impact, erosion or a physical splash envelope.

**Current E interface:** a removable600-clear/663-gross terminal cartridge descends from12250/−852.94 to12750/−1200. Its body stays between the existing rail inner faces6550/7250; independent edge shoes reach the flanges. A2000×1600 receiver at12500/6100 has ordinary maximum water−1400 and reserved500 lateral margins outside the600 stream. The entire still-air horizontal-to-downward ideal jet envelope, using all head from geometric15, travels at most985.9 mm; it remains764.1 inside the far boundary. This excludes undissipated roof-jet energy, wind and splash. The1600-wide EAST blocked-outlet spill has a separate required continuation and faulted maximum−1250; even50% ideal clear width leaves more than80 mm below the active exit. Real passive receiving terrain/disposal remains a conditional DPL requirement, never assumed infiltration or a pump.

Existing50-square rail-support posts at13500/6350 and13500/7450 remain inside the E wet/splash territory. Their faces clear the ideal600 stream by225 mm each. This is **not an empty excavation**: actual footing territory/post Z, lining collars or islands and erosion/support continuity require the STR-owned receiving interface; no bare post size is substituted for a footing envelope.

The cartridge is removed **after** MAT opens all outboard covers and refitted/tested **before** MAT's final closure/admission. A source-drawn2300 maximum interchangeable tilted manual staff reaches both independent shoe releases from the fixed NORTH strip; no operator stands on the open bay. Its descending pan/rail/head/reach bounds are checked. Captured2000 lift leaves its bottom800, above the empty rack600, before transfer to a separate800-square cradle pad. Exact MAT states remain unchanged/in order; omitted wrapper or premature closure is rejected. Actual force/positive capture/temporary guide/kit and support acceptance remain specific STR/MAT/IAS duties.

HAD imports this one interface, updates N receiver/canopy consumer and E receiving/maintenance fields, and retains the historical N terminal separately. No competing house model or hidden physical rating is created. Stronger E receiving head and required wet/overflow territories are explicit site-selection costs. The flange80 pipe/−1300 local catch remains separate and is not a full-duty E route.

## Rain during maintenance

- **E removed:** actual roof, L bund, skirts, entry and downpipe are located. Establish/test the enclosure with N intact/full-duty before E release. Its admitted wind-driven leakage/closure/temporary-weather envelope remains unresolved performance evidence.
- **N short modules removed:** court roof/E pipe and threshold bypass precede short work. N long liner stays intact; loggia roof/low pipe remains absent while short crews return. No simultaneous short/long removal is credited.
- **N long liner removed:** short modules are reinstated before the separate loggia canopy/pipe is installed. Canopy rain goes directly to its separately available receiver; the long crew uses the controlled lane. Assigned court/roof input goes to E.

The generated ledger retains exact current controls, outlets and phase identities. Actual full catchment interception, inlet/pipe loss, cover-cartridge leakage, splash and temporary-weather/erection operating limits still require proof. A failed intact route, unavailable required receiver or common whole-site flooding rejects the maintenance state. No pump, forecast, instant repair or attentive resident receives passive-safety credit.

## Disposition and verification

RWT-06 is **started, not complete**; RWT-07 remains dependent on it. Next is a defensible actual entry/capture/loss/first-wetting bound over the constructed route and its three maintenance phases. The terminal/receiver corrections are source-owned and visible above; any further house/protection/quiet-budget change must return to HAD. No generic external-review dependency is invented.

Seven regressions cover actual loss/obstruction budgets, critical energy and guard shadows, preserved receiver-gap counterexample, current full projection/rail clearance, maintenance separation and cartridge release/refit order. JSON/SVG reproduce in canonical `test:rwt`. The figure was rendered with Inkscape and inspected. Run `node --test project/rwt/studies/selected-water-event.test.mjs` and `node project/rwt/studies/selected-water-event.mjs --check`. No physical event, calibrated coefficient, material acceptance, real receiving level or first-harm certification is claimed. Exact-head full repository health remains required before integration.
