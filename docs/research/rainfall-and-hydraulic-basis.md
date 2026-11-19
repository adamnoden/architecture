# Rainfall and the building-side water network

**Scope:** pre-site architectural selection for Ovid’s House; England is the intended jurisdiction. This basis supports comparison of ordinary gravity systems. It does not size the commissioned house, select a design storm or certify hydraulic adequacy. The [Reference House](../reference-house/README.md) retains its own design authority; the reasoning here does not alter its geometry.

## Evidence and limits

Sources checked **29 October 2026**. These are recoverable primary publications; the interpretations and selection rules below are project reasoning, not quotations from a standard.

| Source | Inspected authority and locator | Use and limit |
|---|---|---|
| [Approved Document H, 2015 edition](https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/442889/BR_PDF_AD_H_2015.pdf), England; [official publication page](https://www.gov.uk/government/publications/drainage-and-waste-disposal-approved-document-h) | H3, printed pp. 40–42: introduction 0.3–0.5; 1.1–1.10; Tables 1–2 | Relates demand to area/rainfall and capacity to geometry; limits the simplified gutter table to its stated arrangement. High-consequence configurations require the fuller design route. It is compliance guidance, not a project approval. |
| [BSI: BS EN 12056-3:2000](https://knowledge.bsigroup.com/products/gravity-drainage-systems-inside-buildings-roof-drainage-layout-and-calculation) | Publisher catalogue and scope; listed current; published 15 September 2000 | Establishes the relevant roof-drainage standard and its non-siphonic calculation/siphonic performance scope. Full licensed text and national provisions were **not** accessed; no clause-level conformance is claimed. |
| [Historic England: Upgrades or Alterations to Rainwater Goods](https://historicengland.org.uk/advice/technical-advice/retrofit-and-energy-efficiency-in-historic-buildings/resilient-rainwater-systems/upgrades-or-alterations-to-rainwater-goods/) | “How to size and test gravity-fed rainwater goods”; effective area/rainfall; fail-safe systems | Warns against a universal rainfall constant and dated rainfall data; explains wind-adjusted effective area and visible failure. This is conservation guidance used for transferable water behaviour, not a new-house specification. |
| [Environment Agency: Flood risk assessments—climate change allowances](https://www.gov.uk/guidance/flood-risk-assessments-climate-change-allowances) | Peak rainfall intensity allowance, management catchments, development lifetime/epochs; [catchment tables](https://www.gov.uk/government/publications/peak-rainfall-climate-change-allowances-by-management-catchment) | Site-scale rainfall uplift depends on location, event and lifetime. Peak river-flow allowances are not rainfall multipliers. This does not by itself choose a roof design event or a London-wide percentage. |
| [Kayflow technical hub](https://kayflow.co.uk/technical-hub/) | Rainwater calculation example and gutter performance sections | Manufacturer explanation of simple roof effective area and demand arithmetic. Its convenient default intensity and proprietary capacities are not adopted as universal design inputs or product approval. |

The evidence supports a calculation **method and required inputs**, not a numerical house specification. Guidance that makes a simple eaves calculation convenient does not establish that an inward court roof, concealed gutter or threshold collector has the same tolerable failure consequence.

## Catchment before capacity

A catchment is the actual contributing surface draining to a collection edge or low point. Its identity must survive the roof model, schedule, drawing and eventual calculation. For each candidate record:

| Input | Required record |
|---|---|
| Geometry | Source/revision; face boundaries; slope direction; plan projection, height/pitch and receiving edge; overhangs and relevant wall contributions |
| Allocation | Which primary collector receives each part; intermediate transfers from higher roofs; any split assumption and its physical cause |
| Effective area | Method, assumptions, units and applicability; distinguish the result from plan area and covering/material area |
| Consequence | Exterior spill territory or trapped condition; occupied space, insulation, doors or other vulnerable boundaries beneath/adjacent |
| Transfer | Whether this is direct rain, roof runoff, facade runoff or flow already counted upstream |

The current 131.75 m² roof plan-reference annulus is not a selected effective catchment. Nor may eight arrows be divided into eight equal loads. Hips, inner/outer slopes, valley concentration, overhangs and collection boundaries must come from the selected roof geometry. Wind-adjusted effective areas are design-method quantities, not additional physical roof surface to add to a material schedule.

For an isolated rectangular pitched face, Kayflow illustrates `A_eff = (W + H/2) × L`, with horizontal run `W`, vertical rise `H`, and eaves length `L`, all in metres. This is useful for a simple-face check. It is **not** a licence to apply one pitch factor blindly to the entire ring roof or to add every facade under incompatible wind assumptions. The selected method must handle the actual multi-face arrangement and relevant rainfall direction consistently.

The nominal court opening is 12.25 m². Direct rainfall onto that opening, roof water collected separately, facade contribution, and accidental roof spill are distinct loads. Do not omit court rainfall because roof collection exists; do not add intercepted roof runoff to the normal court collector without a selected physical connection. A failure scenario may add that runoff and must say so.

## Demand and event basis

For a steady illustrative inflow, conservation of volume gives:

`Q = r × A_eff × C`

where `Q` is litres/second, `r` is litres/(second·m²), `A_eff` is m² and `C` is a dimensionless runoff factor. For these comparisons use `C = 1` for impermeable surfaces as an explicit no-retention assumption. No credit is taken for wetting losses, porous finishes, rainwater reuse or storage. A proposal seeking such credit needs its own evidence and full-storage/failure case.

Because one millimetre over one square metre is one litre, `r = i / 3600` for rainfall intensity `i` in mm/hour. A daily rainfall total cannot be inserted as a short-duration intensity. A nominal return period is not a guarantee that an event happens only once in that interval.

The event record must identify location/data source, duration, annual exceedance probability or return period, building consequence/risk basis, climate allowance source/epoch/lifetime, uncertainty and reviewing owner. Keep roof peak-flow demand and site drainage/storage events separately identified; their durations and acceptance purposes need not match. The downstream site designer must reconcile them at the handoff rather than substitute a discharge limit for the roof inflow.

A published default, an old map value, a risk factor and a climate uplift are not interchangeable. Do not multiply all available factors without checking their intended basis or assume that “London” determines a single rainfall value. In particular, the EA site-flood guidance is an input to the actual project assessment; no precise uplift is selected here.

### Arithmetic sensitivity, not a design storm

The following three intensities are deliberately chosen **illustrative inputs**, not sourced local rainfall or prescribed design events. The court is treated only as an impermeable 12.25 m² direct-rain surface, with no facade or roof inflow.

| Illustrative intensity | Equivalent rate | Direct court inflow |
|---|---:|---:|
| 0.020 l/(s·m²) | 72 mm/hour | 0.245 l/s |
| 0.040 l/(s·m²) | 144 mm/hour | 0.490 l/s |
| 0.060 l/(s·m²) | 216 mm/hour | 0.735 l/s |

At the middle input, a completely blocked collector accumulates **294 litres in ten minutes** if there is no escape or loss. That is **24 mm mean depth** over a hypothetical level 12.25 m² basin, not the court’s actual flood level or time to threshold entry. Actual falls, displacement, local low points and additional inflows change that answer. The example demonstrates why a small catchment still needs a real failure route; it does not establish a safe ponding allowance.

## Capacity belongs to the whole route

Selection must compare the demand reaching **each** part of the route with evidenced capacity in the actual configuration. A large downpipe does not rescue an inadequate inlet, adverse gutter fall or constrained receiving connection.

| Boundary | Selection question | Evidence needed before a sizing claim |
|---|---|---|
| Roof edge → collector | Does concentrated or fast runoff enter the collector rather than overshoot? | Selected edge geometry, pitch/discharge distribution and system evidence; valley concentration explicitly considered |
| Gutter/channel → outlet | Can water reach and enter the outlet without crossing a vulnerable level? | Profile, length, actual fall, outlet position/form, operating water depth, grating/guard condition and applicable capacity method |
| Outlet → downpipe | Is quoted flow achievable at the available head and installation? | Product/system capacity data and its test/configuration conditions; diameter alone is insufficient |
| Downpipe → bends/branches | Does the actual route carry the combined inflow without unacceptable surcharge? | Vertical/offset geometry, fittings, junction loads, ventilation/flow regime and applicable design calculation |
| Ground transition → handoff | Can the receiving condition throttle or back up the building-side route? | Required receiving envelope and explicit unknown backwater/outfall conditions, owned by site design |

Gravity requires an available head difference and a continuous viable path. Horizontal segments need an intentional fall and tolerance/deflection allowance appropriate to the chosen system; “gravity” is not proof that any line drawn downhill works. Do not invent one universal gutter slope, pipe velocity, minimum bore or freeboard. No siphonic behaviour is assumed to increase capacity; any such option would require a separately justified specialist system and failure analysis.

Approved Document H’s simple table assumes a particular level half-round eaves gutter, outlet and length condition. Do not import its nominal sizes into box gutters or long/complex routes. Its downpipe guidance also requires the combined contributing flow to be accommodated, not merely the largest upstream outlet. Selection may reserve a plausible component/access zone while capacity remains unresolved, but cannot claim a candidate fits if its unproved hydraulic space requirement is essential to that fit.

## Normal operation, obstruction and exceedance are separate cases

For each candidate, evaluate these scenarios before selection. These are project design questions; Detailed rainwater failure analysis precedes whole-house moisture assurance.

1. **Normal design operation:** all allocated inflow follows the primary route at an acceptable water level. No assumed emergency operation substitutes for primary capacity.
2. **Primary collector/outlet blocked:** identify the next physical path and the first vulnerable boundary. An extra outlet to the same blocked throat is not independent protection against that blockage.
3. **Downpipe or downstream receiving path obstructed:** trace backup through shared branches and the ground transition. An overflow rejoining that obstruction does not solve this case.
4. **Rainfall above primary capacity:** show where excess water goes, whether people can see it, and whether it wets fabric, threatens access or transfers risk elsewhere.
5. **Heavy rain with ordinary degradation:** examine debris/guards/partial obstruction and maintenance access together. Do not apply an invented universal percentage derating as proof.

For a trapped catchment or courtyard, record the normal water level, overflow activation level, **water level at the required overflow flow**, and first vulnerable threshold/fabric level in one datum. A low overflow lip alone is insufficient: finite flow needs head and the route may back up. Construction tolerance, settlement/deflection and receiving conditions must not reverse the intended hierarchy. No millimetre allowance is frozen here.

Visible overflow is an observation benefit, not proof of harmless discharge. Its full route must avoid occupied thresholds and unacceptable wetting, falls or downstream harm. The requirement to find a safe route may reject a roof/court arrangement, move a collector or reopen an architectural choice. Maintenance alone cannot earn a pass for a configuration whose plausible missed-cleaning case threatens permanent fabric.

## Required handoff and open decisions

| Decision/input | Owner | Latest useful decision point |
|---|---|---|
| Roof face allocation and exposed/trapped collection conditions | Roof and rainwater design | Before network synthesis; unresolved topology can force rewind |
| Collection family, outlet evidence and safe operating level | Rainwater design; construction resolution and competent review for technical adequacy | Before selecting a family whose fit depends on capacity |
| Branching, falls, surcharge and accessible route | Rainwater design and construction resolution | Before roof/water reconciliation |
| Materials, guards, supports and joint restrictions affecting flow/maintenance | Rainwater and roof material design | Before selecting the coupled assembly |
| Court falls, overflow route and vulnerable threshold datum | Rainwater, opening and architectural design | Before shared gate; not a later cosmetic detail |
| Actual rainfall/event/risk/climate basis and licensed design-method application | Actual-project drainage designer | Before numerical sizing and technical acceptance |
| Receiving levels, capacity, backwater, lawful destination and site flood routes | Site design / actual project | Before site-specific acceptance; never guessed by building-side design |
| Installation tolerances, inspection, flow testing and maintained access | Delivery and technical designer; physical testing where warranted | Before issue/acceptance, with requirements carried earlier into selection |

Each `SITE-WATER-HANDOFF` must carry the contributing identities, demand/event basis (or explicit unknown), physical location and datum when earned, expected receiving condition, failure/overflow relationship, access and evidence owner. No sewer, infiltration rate, attenuation volume or connection consent is selected here.

This basis is adequate to compare collection, conveyance and material families in parallel. It is not adequate to select final bores, outlet counts, courtyard levels or a certified whole-house drainage system. If actual geometry, hydraulic evidence or receiving conditions contradict a candidate, the candidate changes; the acceptance question must not be weakened to preserve it.
