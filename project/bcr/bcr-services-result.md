# BCR-SERVICES — plant, riser and distribution feasibility

**Result:** bounded investigation complete, with adverse distribution and access findings. The current house has not earned an installed-services fit or a heating/ventilation selection.
**Observed main:** `d6f6d6638263a9f73e8fb6a6887feea5896af25e`, 29 October 2026.
**Owner:** [BCR #944](https://github.com/adamnoden/architecture/issues/944); the [programme](buildability-construction-resolution-programme.md) defines the investigation/acceptance distinction.

## Decision for the house

The eastern plant room is large enough for a useful, product-sized comparison without immediately enlarging the room. The present dry rectangle is too shallow for the selected comparison unit, but a local 70 mm reallocation can contain that body and its manufacturer's front maintenance field. This is a candidate correction, not source adoption. The more consequential unresolved question is distribution: a 55 mm void cannot contain even the tested 75 mm branch duct, and the upper access panel is separated from the service lining by an unassigned 300 mm section. Neither difficulty is cured by a larger plant room or a green historical service model.

Retain a conventional comparison: simplify equipment to the duties actually required; use short accessible plant connections, selective distribution and explicit local service zones. Compare alternative ventilation strategies and several local stacks where a single central route damages rooms. Do not select MVHR, a heat pump, a cylinder volume, a buffer or a one-stack doctrine by this study. Owner needs, ventilation/moisture strategy, heat loss, hot-water demand and competent system design remain inputs.

## Source and reproducible physical study

The [current house basis](../../docs/reference-house/current-house-basis.md), [interface contract](../triad-interface-contract.md), [IAS services study](../ias/ias-02s-services-access.md) and current source own the geometry. Historical RH service/energy documents supply questions only; their technical passes are not transferred.

| Inspected source | Git blob |
|---|---|
| `compiler/reference-house/georgian/layout-revision.ts` | `af955c7da2e2469fd24598f98db6fc942a119ed3` |
| `compiler/reference-house/georgian/section-exemplar.ts` | `75bf5c749da5095c07eed46105817a79095ca418` |
| `project/triad-interface-contract.md` | `789df054ec0c97326bf6549e1e93db50163036d0` |
| `docs/reference-house/current-house-basis.md` | `21b0daf3f0da198977b2eea41e2e35f4a4978255` |
| `project/ias/ias-02s-services-access.md` | `47cbb763c489dc9dc4d12072aa03f0a3bd9e1b06` |

[Study drawing](studies/services-feasibility.svg), [exact geometry/results](studies/services-feasibility.json) and [source-bound generator](studies/services-feasibility.ts) show plant packing and two replacement sweeps, an illustrative riser section and the intermediate-floor conflict. Regenerate with `node --import tsx project/bcr/studies/services-feasibility.ts`; add `--check` to verify retained outputs. Guards reject changed source reservations; checks cover containment, pairwise packing collisions and complete axis-aligned transport sweeps. They do not validate engineering or human handling.

## Declared component and duty basis

Manufacturer material was retrieved on 29 October 2026. These are real size comparisons, not a purchase schedule or equipment sized for this house.

| Comparison / evidence | Input used and applicability |
|---|---|
| [Zehnder ComfoAir Q350 UK product page](https://www.zehnder.co.uk/en/indoor-ventilation/solutions/mechanical-ventilation-with-heat-recovery/zehnder-comfoair-q350-st/zehnder-comfoair-q350) | Body 725 wide × 570 deep × 850 high; nominal connections 160–190. Current listing is not a house airflow calculation. |
| [Zehnder installer manual, 40015975-0118, pp 5, 8, 13–15](https://zehnder-systems-si.zendesk.com/hc/en-us/article_attachments/4417585038993) | At least 1000 front maintenance space; condensate space beneath; ducts/attenuators need additional room. Wall mounting requires its stated 200 kg/m² wall basis; the alternative floor frame is relevant where that is absent. This international 2018 manual is a comparison basis requiring confirmation for the actual UK variant. |
| [Vaillant uniSTOR standard range](https://professional.vaillant.co.uk/for-installers/products/unistor-standard-diameter-range-181952.html) | Current pure 250 comparison: 580 outer diameter including insulation and 1804 height. “250” is a model class, not the owner's required storage volume. No buffer is added by default. |
| [Vaillant installation manual 8000014621_07, §§4.4–4.5](https://professional.vaillant.co.uk/downloads/aproducts/cylinders-1/unistor/standard-diameter/unistor-pure-unistor-plus-8000014621-07-3045235.pdf) | At least 400 front access to thermostat/immersion, actual expansion-vessel access, supporting floor and tilt restraint, and a safe drain/discharge arrangement remain obligations. Cylinder diameter alone is not its installation envelope. |
| [Zehnder ComfoTube 75 manufacturer sheet, 2024, p 1, distributor-hosted copy](https://www.theairshop.co.uk/_uploads/baq-images/ComfoTube75mm20241.pdf) | 75 outer diameter, 63 inner diameter and 75 minimum bending radius. This physical branch example does not establish branch count, airflow, pressure loss or noise. |
| Authored comparison envelopes | Two 250 square duct envelopes; three 72 square water envelopes (22 body plus 25 radial allowance); 110 soil body; 100 × 50 dry containment; 25 riser boundary reservation each side. These are explicit sensitivity inputs, not product assemblies, insulation requirements, code segregation distances or complete fitting sizes. |

## Plant: fit, connections and working space

Current clear room: x 9562.5–11582.5, y 2612.5–6587.5, **2020 × 3975 = 8.0295 m²**. Source water reservation is 700 square at x 9862.5/y 3600; dry reservation 500 × 1000 at x 9862.5/y 5400; working strip x 10662.5–11582.5/y 2800–6500. None has an equipment height, fixing or operating-temperature acceptance.

The 580 cylinder body fits inside the 700 square with 60 per side. Its 1804 height leaves 1296 below the 3100 ceiling before top connections, restraint and service tasks. Reserve the manufacturer's 400 front field separately; it can face east into the current working region. Actual pipework, external expansion vessel, relief train and thermal insulation can exceed the 700 footprint. They must not be drawn over electrical controls or the renewal route. A filled-cylinder load and the floor's support are not established here.

Orient the Q350 front east, with 570 in x and 725 in y. The 500-deep dry reservation fails by **70**. Trial body x 9862.5–10432.5/y 5400–6125 plus front field x 10432.5–11432.5 fits the room; 150 remains to the east wall. That field extends 230 west of the source working-strip start and must be explicitly reallocated if adopted. This comparison has no electrical/control cabinet in the same dry reservation: its separate location and water segregation must be designed.

Vertical comparison: a nominal unit bottom at +250 and 850 body reaches +1100, leaving 2000 to the ceiling. This is a height allowance, not a mounting-frame selection or permission to omit condensate fall, connectors, silencers and insulation. The current 125 partition is not evidence of the manufacturer's wall-mass requirement. A floor frame or different support can be compared without pretending the timber/finish face supports the machine.

## Riser, access and horizontal routes

The source's 550 × 700 riser is a gross reservation. With an authored 25 boundary allowance each side, the study's 500 × 650 internal rectangle holds the listed bare comparison envelopes without collision. Two 250 ducts are stacked along the long dimension, leaving the narrow adjacent lane for soil/water and a separate lower dry-containment box. This proves only that one drawn body packing is possible. Clamps, sockets, insulation changes, junctions, turning radii, fire/acoustic treatment, installation order, separation barriers and usable access can falsify it. In particular, the 110 soil value excludes fittings. No area-percentage argument substitutes for those objects.

The upper lining is only 250 gross depth: a 250 duct envelope consumes it entirely before any face, support or tolerance. The gallery-side wet-spine inner face is x 9562.5; the lining starts x 9862.5, leaving **300 unassigned**. IAS's 650 × 550 clear panel is not proof of a contiguous passage through this gap. At centre y 4750, its clear interval 4425–5075 misses the final 125 of riser y 4500–5200. Inspection, small-component withdrawal and whole-stack renewal require different tasks; the Q350 or 580 cylinder cannot pass through a 550 short dimension as a whole body. They use the plant route, not that panel.

Representative routes and crossings, proposed for coordination rather than adopted centre lines:

| Route / host | Physical test and design consequence |
|---|---|
| Plant Q350 to riser, then upward | Body and connection axis do not coincide with the riser. Local header/attenuator/condensate space, bends and a supported vertical floor penetration need a drawn assembly. The 550 × 700 box cannot also silently become a structural opening of that size. |
| Ground distribution to western study via south ring | A direct line at y 4850 crosses the open court. A ring comparison goes from (10137.5,4850) to (10137.5,3300), then (3300,3300), (3300,2500) and (2500,2500): about 9.99 m of orthogonal route before terminal details. It avoids the court in plan but crosses the service spine and room/support boundaries. No pressure-loss or continuous section pass follows. |
| Ground distribution to rear kitchen | An eastern route toward y 9000 crosses plant/pantry boundaries y 6650 and 8105. It needs separate support and boundary reinstatement at both crossings; the pantry door/ceiling is not an automatic duct opening. |
| Intermediate-floor horizontal route | Fully allocated 350 = 20 finish + 22 deck + 238 framing + 55 service + 15 ceiling. A 75 branch exceeds the void by 20; 190 connection-scale duct by 135; 250 comparison by 195, before supports. Crossing ducts/pipes increases the required section further. |
| Upper-floor distribution | The roof/eaves space is not an unallocated plenum. Actual roof structure, thermal layers, access and terminal arrangement are unselected. Recheck against ROF and BCR-STRUCTURE rather than borrow historic attic routes. |
| Electrical/data/controls | IAS's 45 projecting skirting leaves only 27 gross behind an 18 face. The study's 50-deep containment cannot fit it. Smaller actual containment may be viable locally; bends, backboxes, heat, protection and segregation must be specified. No water or soil is routed in decorative skirting. |

A lower local ceiling/boxing, parallel route inside a structurally permitted zone, distributed ventilation or changed room/plant adjacency are legitimate alternatives. They must return to IAS/HAD/structural owners. For example, buying 195 extra depth below the existing ceiling reduces local 3100 clear height to 2905; it cannot be described as retaining the interface contract. No joist boring, roof void or unventilated facade penetration is approved here.

## Maintenance and replacement sequence

Two distinct plan witnesses are retained. The cylinder comparison uses a 700 square around its 580 body. The Q350 uses **670 × 825**, its oriented 570 × 725 body plus authored 50 handling allowance each side; it is not squeezed into the source's 700 square. Each moves east into the working region, translates to y 4600, then exits east through the nominal 1400 aperture. Complete rectangular sweeps avoid the other represented plant/riser bodies. They omit packaging, a particular trolley, operators, pipe projections, open door leaves and exterior ground: conditional plan feasibility only.

Before renewal: identify the actual equipment and independent isolations; isolate electricity and water/heat as applicable, drain/depressurise and verify safe state; protect the occupied route; support equipment before disconnecting; release actual ducts/pipes, cables and restraints; provide the lifting/transport apparatus; traverse the verified frame/leaf/height/threshold; transfer to a safe exterior set-down. A cylinder plus an authored 100 high carrier would be 1904 high; that arithmetic is not a doorway-height proof. Actual outside levels, rights, load support and lifting method remain site/design obligations.

After repair: inspect disturbed water/fire/air/acoustic boundaries, reconnect and test relevant services, recommission controls/flows, inspect leaks and condensate/discharge paths, dry affected construction, reinstall access pieces and update the service record. The required evidence belongs to the actual system/DEL issue, not a generic universal test list. Filters and ordinary controls should remain directly accessible without undertaking this renewal sequence.

## Findings for serial PREFLIGHT integration

All rows remain **routed-pending / blocked** at construction/design-acceptance scope. Their investigation is complete. The shared matrix is deliberately unchanged.

| Finding / receiving rows | Owner and concrete discharge condition |
|---|---|
| BS-01 / BCR-011: dry reserve 70 short; local body/service-field reallocation plausible | IAS/HAD services owner: adopt or reject actual equipment and its full connections/support/control packing; reconcile source and working strip. No plant enlargement required by this body test. |
| BS-02 / BCR-011, 017: gross riser and panel are not installed capacity/access | IAS/house services: actual section through panel, 300 gap, lining and components; joint/support/segregation layout and complete task-specific withdrawal. Structural owner accepts penetrations separately. |
| BS-03 / BCR-003, 010–013: horizontal service budget fails tested ducts | IAS/HAD/structure: choose a physically continuous route with real depth/crossings or eliminate the system; reconcile local ceiling/room consequences. EPR MEP/acoustic evidence supports duty and sizing, not a hidden geometric workaround. |
| BS-04 / BCR-012: ventilation/heat/hot-water duty unselected | Environmental/HAD owner with EPR: process owner requirements, actual loads/airflow/noise and normal/degraded operation; compare conventional alternatives before adopting these products. |
| BS-05 / BCR-010, 013, 024: water and dry-service boundaries incomplete | Services/IAS with MRA and DEL: visible failure declaration, isolation, relief/condensate destinations, safe supports and separation; no concealed wet joints behind a decorative face. |
| BS-06 / BCR-021, 025: replacement has a conditional plan witness only | OAS/HAD and actual site/access owner: actual door clear dimensions/leaf, lifting apparatus, headroom/threshold and exterior set-down; link BCR-OCCUPATION's complete-action findings. |
| BS-07 / BCR-001: later design choices may invalidate this study | PREFLIGHT/HRS: recheck affected rows after actual HAD/IAS/ROF changes. HAD's unadopted compact and rear-west en-suite alternatives are not the current source; an added rear-west stack needs its own living-room/cabinet/branch/discharge study. |

## Validation and claim ceiling

The generator checks the stated geometry and regenerates the SVG/JSON. The A3 drawing is inspected for scale, labels and correspondence. Repository health and exact-head CI are recorded in the merge PR. These checks establish a repeatable bounded study, not engineering adequacy, equipment capacity, statutory compliance, human handling, a selected services system or construction readiness. No current house source, shared matrix, historical proof identity, maturity or authority is changed by completing this investigation.
