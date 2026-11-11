# Selected internal-water failures, isolation and repair

**MRA-INTERNAL-LEAKS — bounded investigation complete; no MRA-02 or whole-house moisture pass.**

The selected house still needs an adopted incoming-water route and a demonstrated
way for abnormal internal water to become visible, stop, leave or dry without
prolonged concealed wetting. This investigation corrects one selected waste-route
projection, restores a specific inlet adoption blocker, and bounds what the
existing small leak witnesses can do. It does not select a replacement inlet,
change the roof or grant an installed water-system acceptance.

[Computed occurrences and cases](studies/internal-leak-study.json) ·
[Reproducer](studies/internal-leak-study.mjs) ·
[Focused regressions](../had/studies/selected-water-duties.test.mjs) ·
[Existing MRA threat model](mra-00-moisture-constitution-threat-model.md)

## Current authority and scope

The starting selected service authority is **HAD-SERVICES-02**, merged in
[PR #1473](https://github.com/adamnoden/architecture/pull/1473) at main
`a06013820dfdc2b5ee1918abf42abce8423eb0ad`. This packet begins after the independent
study registration at main `e19ce0d94cf7186eee517027873f14b43cb4f786`. Its executable
consumes `deriveCurrentHouse()`, all seventeen recorded JSON input identities,
the actual fitted-water and utility occurrences, current plant geometry, and
the owning IAS/MAT moisture and renewal requirements. It records the additional
producer and evidence blobs. The old service baseline supplies retained
distribution reservations; current fitted sources override nominal apparatus
endpoints. Neither an old study's pass nor a source being present awards current
whole-house acceptance.

The [owner-authorised split](../pco/independent-studies-result.md) permits this
investigation before TRIAD. **MRA-02 still requires TRIAD-GATE and this result.**
The existing `INT`, `WST` and bounded `CMP` scenarios are used below. The generated
cases are contributions to those scenarios, not a second whole-house matrix.
They retain first wetting, declaration, isolation, receiving/drying, repair,
maintenance, workmanship, evidence and owner fields. Roof/rainwater design,
real-site acceptance and whole-house vapour assurance remain with their owners.

## Two source consequences

### Correct the kitchen duty to its already-authored branch

The selected compositor had joined the fitted kitchen but retained an older
`foul-kitchen` duty in **both** `model.architecturalServices` and
`model.servicesInterface`.

| Reservation | Inherited duty | Existing selected source |
|---|---|---|
| North-wall centre, mm | `[9150,12000,382.0625]` | `[9275,12000,273.7625]` |
| External-tail centre, mm | `[9150,12450,-2480]` | `[9275,12450,-2480]` |

That is a **125 mm lateral and 108.3 mm vertical** wall disagreement. The
[current IAS branch](../ias/ias-03-household-water.md) already raises the Ø50 run
over the insulated feeds, then returns at 1:40 to the selected wall level.
The old +300 internal run was rejected for crossing those feeds; it is not
copied into the correction.

[The current compositor helper](../had/studies/selected-water-duties.mjs) now
derives only the downstream wall and tail from the existing service source,
checks the wall against the fitted kitchen's regrade, and binds the upstream
route to the current fitted kitchen. Both exposed duty arrays agree. Historical
inputs stay intact. This fixes an actual current metadata inconsistency; it
does not prove the opening, installed fittings, outfall or leak capture.

### Keep the rejected inlet visible as a blocker

The current selected model also retained the incoming-water leg at
**X11200/Z500**. Plant-N still requires the complete envelope
**X10980–11530, Y3797–3997, Z100–700**. Clipping the current centreline against
that required territory gives **200 mm inside it**. This replays, on the current
house, the route already rejected in
[the damaged-tube study](../mat/services-water-joints.md#damaged-tube-at-the-east-plant-station).
It is an exclusion-envelope conflict, not a new claim about detailed radiator
solids or an installed collision.

The [lobby inlet](../mat/plant-inlet-route.md) is an explicit alternative, with
its own wall, support, utility-branch, frost/site and adoption duties. It is not
silently substituted. Both current duty arrays now label the original line
`REJECTED_RETAINED_ROUTE`, retain its geometry, and carry its current witness
and resolution condition. `currentAdoptionBlockers` now states the inlet
route/isolation duty instead of being unconditionally empty. The architectural
reference remains selected; complete internal-water adoption remains blocked.

**Required discharge of this REWIND:** HAD/MAT must adopt a coordinated route
clear of plant-N and the actual wall cores, locate accessible upstream
isolation and a contained drain, and preserve independent supports, the utility
branch and cylinder first release. IAS/STR must join the affected working and
penetration interfaces. This is substantive design/adoption work before MRA-02
and selected-house integration, not a generic referral for later certification.

## What remains earned, and what the inventory actually contains

The current sanitary arrangement is **four WCs, four basins, three bathing
places, kitchen and utility sinks, and one washer: fourteen cold and nine hot
endpoints**. The optional rear-WC conversion is not selected; no dishwasher is
invented. The data retain each fixture ID, level and nominal branch reservation.

The water account also includes eight hot/cold routing territories, four
declared hot-return circuits, sixteen hydronic emitters, the elevated hydronic
supply-air coil, separate domestic and heating vessels, and six condensate
occurrences. The four local electric heaters add no water inventory. The
**68.25 m** sum is the retained water-corridor geometry, not multiplied pipe
length, a joint count or a complete installed valve map. The coil's recorded
intake route is an **air** route; it does not establish the water branches.

Useful local results survive the assault:

- All eight fitted basin-stop plan projections lie within their four pans. The
  older `serviceAxis` coordinates are nominal reservations; the guest's old
  axis outside the pan is not evidence that the selected final stop is outside
  it. Point projection still does not prove capture of a jet.
- The kitchen's raised waste clears the two feed envelopes in its existing
  comparison. The source correction preserves that result.
- The utility channel remains 310 mm from the electrical working field and
  25 mm from the receiving stand. Those are geometric separations, not a proved
  wet electrical fault state.
- The fitted WC drip receivers, supported fixture releases and dedicated
  domestic safety discharge retain their existing finite geometry and
  qualification conditions.

These are useful design results, not `PASS-INTERNAL` dispositions for the
complete failure paths. Sources: [household water](../ias/ias-03-household-water.md),
[WC takeoffs](../ias/ias-03-guest-rear-wc-takeoffs.md),
[upper WC release](../ias/ias-03-upper-wc-release.md),
[current services](../had/inhabited-services-selection.md).

## The finite-witness limit, including an absent occupant

IAS already says that the small receivers are leak witnesses, not unattended
burst containment. This study retains that limit and adds a reproducible
absence/residual envelope. The net and first-visible quantities below are
**requirements, not measured supplied capacities**. The 6/15/30 L/min cases are
inherited stress scenarios, not measured supply or a maximum rupture rate.

| Witness | Required net volume | Visible by | Remaining time at 30 L/min, zero residual | Full at an assumed 0.1 L/h | Maximum steady leak retained for 24 h, no outflow |
|---|---:|---:|---:|---:|---:|
| Each basin | 1.25 L | 0.20 L | 2.1 s | 12.5 h | 0.0521 L/h |
| Kitchen | 0.40 L | 0.05 L | 0.7 s | 4 h | 0.0167 L/h |
| Utility | 2.00 L | 0.20 L | 3.6 s | 20 h | 0.0833 L/h |

With full capture, no safe outflow and no evaporation credited, the volume
after first visible water is:

`V = visible volume + leak flow × response seconds / 60 + residual release`.

The witness holds only while `V ≤ required net capacity`. The equation assumes
all escaping water reaches the receiver; bypass can make the room wet earlier.
No alarm, automatic valve, powered drain or guaranteed human response is
selected by this calculation.

At the explicitly assumed **0.1 L/h**, 24 hours produces **2.4 L**. Even with
empty receivers, perfect capture and zero residual release, all three witness
sizes overflow: by 1.15, 2.00 and 0.40 L respectively. After eight hours the
kitchen witness has already overflowed; the other two still have volume
reserve under this narrow assumption. Thus temporary unoccupancy matters even
without choosing a burst. The eight- and twenty-four-hour cases are analyst
sensitivities, not a claimed household absence schedule.

An assumed five seconds after declaration at 30 L/min adds 2.5 L, exceeding all
three capacities. This is not a proposed manual-response promise and does not
borrow the cooker's airflow shutoff timing. Separately, an illustrative 1 L
post-isolation release would exceed the kitchen reserve by **0.65 L even with
immediate closure**. Actual post-valve hose, pipe and vessel release is unknown;
one litre is a sensitivity, not a selected branch inventory.

These results establish **spill beyond a finite witness**, not damage. The
owning sources intentionally allow visible overflow onto washable floor.
The unresolved question is what happens next at the actual floor fall, wall
toe, penetrations and threshold, whether hidden layers become wet, and how they
dry. The calculation neither condemns all local wetting nor invents a harmless
room outfall. It rejects the stronger hypothesis that these volumes plus visual
detection alone assure an unoccupied house.

## Isolation and common-path results

| Event | What the cut comparison establishes | What remains to earn |
|---|---|---|
| Cold tail downstream of its fitted stop | Closing that stop cuts its direct forward supply path, if the valve functions | Actual operating access during the fault, capture and downstream residual |
| Joint upstream of the fixture stop, or replacement of the stop itself | Closing the fixture stop does not cut that upstream source | Located upstream house/branch isolation and a drain; the rejected inlet cannot supply that proof |
| Hot distribution/return fault | Four return circuits and balancing/check/isolation stations are declared | Located feed/return cuts, check orientation and functional states; no assumed backfeed direction or complete isolation map |
| DHW vessel/outlet leak with mains and return pump off | Stored DHW remains a possible source path | Actual drainable release from elevation, air admission, checks and leak location; no 300/370 L spill is asserted |
| Heating vessel/branch leak with pump off | Pump shutdown is not a demonstrated positive cut or inventory removal | Both local cuts, makeup state, head, checks and draining of the separate heating circuit |
| Basin common-trap blockage | Bowl waste and overflow both lose their shared downstream path | Actual rim/room escape; the CL25 overflow is not a second independent drain |
| Restricted washer/sink common branch | Ordinary appliance discharge loads that same restriction | Matched pumped/combined duty and contained residual removal; the channel cannot be credited as a drain into the failed branch |

The selected bespoke domestic vessel requires **at least 300 usable litres**.
The **370 L** number is the stock catalogue comparison, whose standard pressure
rating is not accepted at 3.5 bar. The separate heating buffer is nominally
300 L with a required 260 L useful thermal layer. Neither is a drainable-water
measurement; their volumes are never added into an asserted spill. Stopping
pumps or closing mains does not by itself determine gravitational release.
The separate domestic T&P valve must remain directly connected to the vessel.
Its dedicated D2 receives connected relief flow; it is not a plant-floor leak
drain. [Current plant and safe first release](../had/inhabited-services-selection.md)

## Current occurrence dispositions

All first-vulnerable-fabric and detection-time unknowns remain explicit in the
generated case records. A removable cover or visible lip alone cannot turn an
unknown complete path into a moisture pass.

| Existing scenarios | Current occurrence and result | Receiving owner and required closure |
|---|---|---|
| INT-01 | **REWIND:** rejected inlet still conflicts with current plant-N; its status is now corrected | HAD/MAT with IAS/STR: adopted route, upstream isolation/drain and release compatibility |
| INT-01, CMP-03 | **OBLIGATION:** necessary joints in the eight distribution territories lack a complete located first-wetting/cut/drying account | HAD/MAT: minimise joints, then locate retained joints, valves and physical declaration; IAS/MAT join the receiving fabric |
| INT-02, CMP-03 | **OBLIGATION:** four basin stops/pans have useful geometry; rapid and unattended capture/room consequences remain unproved | IAS/HAD/MAT: actual capture, upstream stop repair, floor/toe/threshold and reinstatement |
| INT-02, WST-01, CMP-03 | **OBLIGATION:** kitchen metadata is corrected, but its 0.35 L post-declaration reserve cannot provide a general isolation allowance | IAS/HAD/MAT: operating cuts, residual receiving and safe room-side escape |
| INT-02, CMP-03 | **OBLIGATION:** washer/sink catch field and stop approach do not qualify burst-safe operation or unattended containment | IAS/HAD/MAT: actual hose/valve, fault approach, complete collars/field and electrical separation |
| INT-03 | **OBLIGATION:** four WC drip receivers do not establish containment of a cracked cistern or severed feed | IAS/MAT/HAD: actual first wetting, room escape and repeat fill/flush checks |
| INT-04 | **OBLIGATION:** DHW stored release and plant-floor leak destination are unknown despite a dedicated relief route | HAD/MAT/IAS: actual vessel/cuts, drainable bounds, safe receiver and restored safety system |
| INT-04 | **OBLIGATION:** separate heating buffer, components and sixteen emitters retain water after pump-off | HAD/MAT: circuit cuts/residuals; IAS/MAT: first-wetted room/plant fabric and drying |
| INT-04 | **OBLIGATION:** elevated supply-air coil at Z2150–2755 lacks a demonstrated water-side fault/first-wetting path | HAD/MAT/IAS: both branch cuts, drain, cabinet/duct escape and unpowered frost-safe state |
| WST-01, WST-03 | **OBLIGATION:** basin waste and bowl overflow share a common trap | IAS/HAD/MAT: blocked-trap/open-spout case and harmless actual room route |
| WST-01 | **OBLIGATION:** family bath, principal and rear showers have distinct local ports and water-boundary duties | IAS/MAT/HAD: each failed junction, lower-zone first wetting and supported repair; MRA-03 receives actual drying questions |
| WST-02, CMP-05 | **OBLIGATION:** utility sink and washer share the restricted downstream path | IAS/HAD/MAT: simultaneous duty, blockage and independent residual receiving |
| WST-03 | **OBLIGATION:** five external foul-tail reservations do not establish an internal surcharge/spill boundary | HAD/MAT: building-side blocked receiver; DPL: actual receiving levels/capacity before site acceptance |
| WST-04 | **OBLIGATION:** six condensate ports are located; upstream disconnection/blockage can occur before the wall port | HAD/MAT/IAS: actual trap/cleanout, internal first declaration and restored dry boundary |

The wet-room material directions reserve complete 80 mm floors and local
30 mm wet linings, with specific returns and repair duties. They do not prove
room flood volume, a watertight doorset, a floor drain or an acceptable drying
duration. No universal duration is assigned to “prolonged”. The actual material,
contamination, exposure and opening/drying route must decide that condition.
[MAT interior directions](../mat/interiors-whole-house-assembly-schedule.md) ·
[Distinct principal wet boundary](../mat/interiors-b-wetroom-assembly.md)

## Repair and discharge conditions that cannot be skipped

The washer's proposed front drain tray has a **3.445 L external cuboid upper
bound and unknown usable capacity**. With that tray present, its old tap-worker
stance overlaps by 106 mm. Preserve the already-authored order: isolate first,
drain cooled water in controlled batches with a real receiver, then perform the
separate fixed-end task. Its dry first rest temporarily occupies **0.2093 m²**
of the electrical working field; isolate beforehand and restore that field
before re-energising. These are retained limits, not new failures discovered
by this study. [Washer source and method](../ias/studies/utility-first-release.json)

For the domestic store, park the ladder, isolate heat/power and the proper cold
control, cool/drain and prove zero pressure. Support the retained connections
before removing the qualified discharge group and cold bridge. Never add an
isolation valve or operational plug between the vessel and its directly sensing
T&P valve. Restore and prove open safety discharge before heat. For all affected
wet boundaries, inspect the actual wet path, clean contaminated surfaces, expose
any affected concealed layer, establish drying and reinstate/test before closure.

The current outlet reservations are exact reference coordinates, not site
discharge acceptance:

| Duty | Reserved external centre, mm |
|---|---|
| Guest foul | `[8900,-450,-2480]` |
| Utility foul | `[12450,600,-2480]` |
| Corrected kitchen foul | `[9275,12450,-2480]` |
| Rear soil | `[-450,11177.5,-2480]` |
| East soil | `[12450,5625,-2480]` |
| Separate domestic safety discharge | `[12350,2500,-1850]` |

Before crediting a route, bind its actual pipe/opening/invert to the receiving
crown, onward fall, capacity and permitted backwater level. Test a blocked or
submerged primary receiver with **zero drainage credit through that path**.
Locate the first internal overflowing fitting from the actual connected
topology; do not infer it from a centreline height alone. If a separate passive
leak outfall is chosen, it must remain available under the fault it protects
against. No automatic connection to foul, rainwater, the court, an underfloor
void or the dedicated relief line is admitted. A receiver requiring lower
real terrain remains a named DPL condition, not an invented level.

## Recommended order of the remaining internal work

1. **Resolve the actual inlet and isolation station.** The current conflict is
   concrete and the upstream cut is needed for fixture-valve repair as well as
   faults. Reconcile the existing alternative or another owned route before
   treating the selected water network as connected and serviceable.
2. **Trace first wetting beyond the small witnesses.** Start with the elevated
   coil, plant vessels, high distribution joints and utility. Eliminate
   unnecessary joints first; then show the actual visible/passive escape,
   receiving fabric, threshold and drying/reopening route. Do not solve this
   by merely enlarging a pan or assuming an occupant responds.
3. **Close the separate hydraulic and waste cases.** Draw the actual cold,
   domestic hot/return and heating cuts, checks and residual-release bounds.
   Prove common-blockage consequences and the real receiving conditions.
   Supplementary sensing can be considered only after the physical path and
   isolation duties are clear; this result introduces no sensor dependency.

These are owning discharge conditions for MRA-02. They do not reopen completed
IAS geometry as a blanket failure, erase MAT's alternatives work, or substitute
a general external-review hold for useful internal design and calculation.

## Reproduction, change boundary and validation

Run:

```sh
node --test project/had/studies/selected-water-duties.test.mjs
node project/mra/studies/internal-leak-study.mjs --check
```

The focused regressions challenge stale kitchen coordinates, a wrong regrade,
the actual inlet intersection and status, unrelated house/port changes, the
finite-witness balance, local versus upstream cuts, common blockage and the
separate water inventories. They preserve the fitted stop projections and the
known washer maintenance limits. The generated case/data check is deterministic.
Exact-head repository CI and publication preflight remain required by the
integration PR; a local computational pass is not a physical water test.

The pre-fix selected schedule is Git blob
`3f9de5555c01f39f5c666dfd49e4e6b87f0b9624`. The investigation compared against those
committed bytes and a **pre-fix captured** current house, not two projections of
the corrected model. All seventeen JSON inputs, full exterior-port geometry,
all selected interfaces/weather faces and the compact schedule remain identical.
The whole-house parity comparison excludes exactly the two kitchen duty records,
two inlet status records and `currentAdoptionBlockers`; all other derived fields
must retain their captured identity. The inlet path itself is separately checked
against the unchanged input. The producer/helper and complete model identities
do change, so dependent studies must honestly rebind those fingerprints.

**Packet closeout:** the source-specific investigation, finite adverse results
and two justified source corrections are complete. The current inlet remains
`REWIND`; the other complete failure paths remain `OBLIGATION`. No row is promoted
to `PASS-INTERNAL`, and MRA-02, TRIAD and downstream integration retain their
own acceptance duties.
