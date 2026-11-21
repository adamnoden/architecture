# One inlet direction: distinct duties and a conventional wet service room

**21 November 2026 — HAD-INLET-RESOLUTION remains OPEN.** Select **20 L/min Utility / 45 L/min Plant** as reference engineering duties, replacing the speculative symmetric 50/50 comparison. Develop the whole existing Utility as the wet service room, a sealed **mainboard-only** enclosure in the existing lobby, and an independent dry Streethead PV occurrence. Reject the current tall cabinet, narrow wet strip, combined indoor board/PV cupboard and unchanged Plant receiver. These decisions choose one development direction; they do not accept a completed room, pressure assembly, material exception or owner aesthetic proposal.

The same optional `inletSourceEnvelope` stage now derives the separate hydraulic duties, occupied fixture inventory, topology replacement, room/control reservations, transfer envelope, electrical/PV separation, stored-release duties and decision drawing. [Result](studies/inlet-source-envelope.results.json) · [Drawing](studies/inlet-source-envelope.svg) · [Method](../../compiler/reference-house/current-design/inlet-source-envelope.ts). Case/result version 2 rejects the earlier symmetric input schema; explicit earlier parameters can still replay the bounded adverse comparison through the reusable method.

## Defended reference duties

The actual selected service inventory has four WCs, four basins, two showers, one bath, a kitchen sink, Utility sink and washer. The direct Utility cold feed serves its sink and washer. Plant feeds the remaining cold tree and hot store; Utility hot water remains Plant-fed.

| Duty | Authored operating allocation | Status |
| --- | --- | --- |
| Utility | Sink cold draw 6 + washer inlet allowance 12 + design allowance 2 = **20 L/min** | Reference design requirement, not native rate guarantee |
| Plant | Two showers 18 + bath fill 12 + kitchen 6 + aggregate cistern refill 8 + allowance 1 = **45 L/min** | Explicit comfort scenario, not every outlet simultaneously |
| Shared upstream source | **65 L/min** while both branch requirements hold | Actual joint source curve required; no double allocation |

The retained Bosch WAN282X2GB is a retired first-release comparator. Its native pressure envelope is 1–10 bar; it does not certify a 12 L/min inlet duty. Actual fixture selection and commissioning must satisfy the authored allowance while retaining genuine hoses, fixed tap, support, material and removal requirements. Daily hot-water draw volumes do not establish instantaneous flow. The Howden bespoke vessel remains an article-specific pressure/safety package; rejected Vaillant and Megaflo benchmarks do not define its reducer, rating or required flow. [Bosch manual](https://media3.bosch-home.com/Documents/9001906867_B.pdf) · [Howden MS family](https://www.howden-electric.com/wp-content/uploads/2025/07/MS-Catalogue.pdf).

A duty edit remains visible as an authored allocation change. The reference case admits Utility duty at least 18 and Plant duty at least 44 L/min; reducing the comfort scenario is an explicit design decision rather than a solver trick to obtain a pass.

## Source, loss and actual receiver

Every branch retains the complete series path:

**Provider source → independent accessible Lodge cut → fixed metal restriction → replaceable joint-free wall spool → genuine ordinary indoor house cut → independently supported network → local apparatus cuts.**

Lodge isolation and appliance stops do not replace the indoor house cuts. A fixed restriction does not reduce closed-valve static pressure.

| Necessary comparison | Utility | Plant |
| --- | ---: | ---: |
| Reference demand | 20 L/min | 45 L/min |
| Nominal aperture / tolerance | 6.5 ± 0.1 mm | 10.2 ± 0.1 mm |
| Minimum simultaneous dynamic source | 3.5 bar | 3.5 bar |
| Required residual / additional network allowance | 1 / 0.5 bar | 1 / 1 bar |
| Authored Cd lower comparison / recovery credit | 0.55 / zero | 0.55 / zero |
| Existing under-sill channel/entrance/receiver screen | 101.180 L/min | 101.180 L/min |

The maximum source is an **unmeasured 9 bar total-gauge envelope**, including velocity, elevation and transients. With atmospheric maximum 1.1 bar, the conservative incompressible upper comparison uses 10.1 bar absolute against zero absolute throat pressure and Cd≤1. It uses the largest effective bore and density 990 kg/m³ over the declared 0–40°C comparison. Delivery uses the smallest bore, density 1000, the authored Cd and separate pressure-recovery fraction. Source datum, density and actual product behaviour remain qualification duties.

**Utility earns a necessary hydraulic interval.** Its loss is 1.774608 bar, leaving 1.225392 bar after the 0.5 bar allowance. Its upper source-fed rupture bound is **92.722918 L/min**. The actual old relief method gives 141.842 mm entrance head against 150 mm, 7.801 mm crown reserve and 10.003 mm free-drop reserve. Its nominal delivery minimum 6.312 mm is below the old receiver maximum 6.794 mm. Increasing its duty to 22 L/min with the same bore leaves only 0.853 bar and fails the residual requirement.

**Plant decisively rejects the old receiver.** At 45 L/min and 1 bar further-network allowance, minimum nominal aperture is **10.112 mm**, versus only **6.794 mm** allowed by the old receiver. Even Cd1 needs 7.525 mm. The larger 10.2 mm comparison restores necessary delivery but overwhelms the retained relief; it does not select a nozzle or solve its fault boundary. At the more optimistic 0.5 bar allowance, required nominal is 9.417 mm, and even Cd1 needs 7.010 mm: there is still no interval. The upper fixture valve at Z4550 versus Plant entry Z598.39 already costs about 3.95 m geometric rise before actual friction and fittings. Calculate the final network at its actual source datum; neither allowance is a completed hydraulic design.

The **101.180 L/min** result belongs only to the old under-sill trough's 150 mm head envelope. Its earlier 122.400 L/min crown-only number is not the whole rating. The tall cabinet raised its pan by 240 mm and retains its own different adverse matrix. A new room/outfall must earn its actual stages; no old low-channel limit is silently imposed on every future receiver.

The earlier 9 ± 0.1 mm, Cd0.62, zero-recovery, 50/50 comparison is retained as history and explicitly reproduced by tests. It supplied 176.271 L/min per branch but failed ordinary residual pressure. It never established an actual 100 L/min house requirement. A Cd1/90%-recovery counterexample still prevents a false universal rejection of fixed throats. Neither that optimistic fraction nor Cd is product evidence. Actual geometry, cavitation/choking, noise, erosion, fouling, tampering, potable constituents and effective-bore survival must be demonstrated. Bypass or missing aperture withdraws all limited-flow credit; a failed-open regulator is not a passive source ceiling.

## Replace the topology once

Retire the rejected lobby I0/U0/P0/common header and inherited low east route. Retire/cap the **cold** `ground-utility` connection to the Plant-fed `ground-front-west` tree; retain its independent hot/heating functions. Until the actual occupied source is changed and tested, these are replacement instructions, not a claim that both independent cold feeds are already disconnected.

Choose **two independent pillar taps** in the Utility head's existing pair of 28 mm holes at 180 mm centres. Each spout needs its actual air gap above bowl flood level; mixing occurs only in the open bowl. This avoids a speculative hot-to-cold mixer backfeed path. No check valve, tap product, air-gap measurement or material approval is invented. Actual hot-side faults remain part of the room duty.

A Lodge restriction bounds only supplied flow. The bespoke cylinder needs an actual **maximum retained/drainable inventory** and pressure-state model, including factory nonreturn, safety, expansion and anti-vacuum provisions and connected upper pipes. Ordered minimum 300 L and catalogue comparator 370 L are **not maximum inventory bounds**. Test a break with the house cut open, ordinary backflow and the declared failed-nonreturn compound state. Hot stored release lies outside this cold-water comparison. The separated primary buffer is not silently connected to potable water; its real heat-exchanger separation failure is a separately declared case.

## One whole-room proposal

The actual Utility is X9397–11570.5 / Y429.5–2453. Its north wall runs Y2453–2647. Retain the washer, sink, rack/waste/chase, south paired outward purge, radiator and both east-head maintenance tasks. The fan equipment field reaches Y2275 and may contain a worker head at Z2750; a new pipe cannot simply be placed above it at Z2400. Retain the Plant cylinder/cart, buffer, independent D2 and dry passage.

The derived mainboard proposal begins at the Utility wall's north face. The actual nVent HDW0606130 comparator has a 610 mm width, 605 mm rear height, 300 mm depth, 26.5 kg empty mass and 108 W on-wall passive figure at 20 K rise. Its 50 mm bracket and a conservative 30 mm overhang reservation give a 380 mm gross projection. Its contents, heat sum, cable entries, fixings, loaded doors and assembled pressure-jet duty are not selected. Its replaceable silicone seal is a real unapproved constituent. The single door/1000 mm working field requires temporary service-suite closure and independently verified isolation of source water, stored pressure, utility AC and PV AC before opening. [Manufacturer instructions](https://www.nvent.com/sites/default/files/dam/hoffman-im-hdw-mi-manual-usen-2108.pdf).

Reject putting an inverter in that small indoor case. The examined SMA 4 kW three-phase comparator needs an 835 mm width and 1270 mm vertical equipment zone with its published cooling clearances. Develop a **separate shaded outdoor-ventilated Streethead dry PV bay**, at least 900 × 1400 mm clear with its front service field and permanent separation from wet valves. Do not borrow the already reserved 795 × 1100 × 250 mm DNO cell. The result traces roof DC → separate rated conduit/dry raceway → DC disconnection → inverter → AC isolation/protection → service AC. Actual module/string voltage, cable current/loss/bend/pull, earthing, weather/fire and supply admission remain real design duties. A real plot is not needed to reserve these reference interfaces; final length and site conditions must match them. The kiosk's visible appearance retains owner review. [SMA mounting](https://manuals.sma.de/STPxx-3av-40-BE/en-US/391431051.html) · [Intended use](https://manuals.sma.de/STPxx-3av-40-BE/en-US/505337995.html).

An empty-case IP rating does not prove the assembled cabinet's source-jet duty. The manufacturer's high-pressure wash test uses a different fan-nozzle flow, footprint and exposure. Bigger nozzle pressure alone does not bound this house's much larger sustained or stored release. Keep that proof explicit; do not invent passive cooling holes, owner response or spray acceptance.

The proposed horizontal joint-free Plant transfer is **[11000,2360,2235] → [10600,3900,2235]**, about 1591 mm long. It passes both existing arches and the dry mainboard. The Lawton28mm comparison requires **80.1 mm** complete maximum jacket:28.1 mm tube including ovality +2×25 mm source radial insulation +2×1 mm metal jacket. The old74 mm reservation belongs to22 mm tube and is not transferred. Its full north draw leaves only19.95 mm below-jacket clearance to the retained2175 mm buffer top; two5 mm settings leave9.95 mm. The2300 mm cargo height leaves14.95 mm after settings. Arch head/jamb checks consume the actual source's radial finish. These necessary envelopes do not prove coupling tools, retained-end clamps, cradles, operators, rotation or export. The old sloping 2400→2260 alternative fails its full draw against the buffer. The actual transplanted post base leaves only 9.298 mm to the retained purge body and fails two 5 mm settings: no shifted witness or inherited support pass.

## Complete proof still required

The current whole arrangement remains rejected until one implementation joins:

- Actual ordinary indoor cuts, wet fronts/door and open-door fault/retreat, complete purge/fan/door and electrical separation states.
- A larger Plant relief and whole warm floor/liner, accessible drains and independent receivers for both sources **plus actual stored release**, one blocked, high/submerged and common-obstruction states.
- Independent thermal/pressure/dead-load supports, real anchors, floor/DPC closures and actual added loads in the coupled **52-head** solve. New casing mass is declared without pretending it has entered that solve; removing an unweighed inverter gives no beneficial credit.
- Actual two-sided cold valve, spool, complete transfer and apparatus renewals, positive zero-pressure proof, sibling retention and first rests.
- Actual source limits and material/safety package. The existing two valve comparisons still contain six known PTFE/EPDM items and zero owner exceptions.

Do not invent slab recess or drain/trap depth, cut through the mineral/DPC boundary to fit, or inherit warmth across open permanent spills. The result includes an explicit open-slot heat comparison without treating its pressure as a site-wind prediction. No hidden trace heater, pump, moving flap or manual response earns the passive boundary.

The counterfactual room geometry is authored for review; **replacement occupied-house compilation, complete containment and installed acceptance remain false**. The source-bound result names those limits and preserves actual room/Plant controls. Source/outfall measurements, physical fitted tests and owner aesthetic acceptance stay distinct from the remaining internal engineering.

## Reproduction and change propagation

`node --import tsx --test compiler/reference-house/current-design-inlet-source-envelope.test.ts` exercises the asymmetric duty/restriction, historical comparison/recovery, real room edits, stored/backfeed boundary and public saved-document/CLI reversal. `node --import tsx project/had/studies/inlet-source-envelope.ts --check` checks the actual receipt and drawing. Existing public `--read-inlet-source-envelope` / `--inlet-source-envelope` and optional saved stage carry the exported fields without a second room stage. Utility aperture edits change only its hydraulic branch and the paired fault total; transfer/board edits change their real clearance/drawing. Old occupied-service evidence remains withheld. Neither unchanged nominal plans nor a regenerated drawing becomes an adopted house.
