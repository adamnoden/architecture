# IAS-03 — Bedroom 4 wet-service section, conditional design study

**Disposition:** useful partial design, not IAS-03 completion or adoption of the HAD alternative. The selected dry family and IS-01–06 holds remain authoritative. This study puts the proposed second en suite's drain, floor levels and renewal operations into one located section. It rejects hiding them in the existing 55 mm service void.

## House decision and exact applicability

Develop an enclosed raised tray with an accessible north/west perimeter waste route as the comparison for the [HAD Bedroom 4 proposal and checkpoint PR](https://github.com/adamnoden/architecture/pull/1046). Keep the structural deck and the floor/ceiling datum unchanged in the current house. The proposal must explicitly accept a raised shower entrance and resolve the adjacent wet finish/door level before adoption. A level-access wet room is a separate floor/drain redesign, not a label for this arrangement.

The starting accepted main is `8cd642ef8ea7c7ec919c71c902f7f8daaf987034`. The HAD proposal is still unadopted: its reviewed [study source at commit4c7e1047](https://github.com/adamnoden/architecture/blob/4c7e1047a4a96537d847356df39ca8907036533f/project/had/studies/bedroom4-allocation-study.ts) has blob `099bd8d74b4db3fa2941d21d32f6de728c2b7a57`; the integrating PR records the accepted checkpoint and any reconciliation. Its new wet clear is x 417.5–2337.5, y 8292.5–10825; tray x 1337.5–2337.5, y 9825–10825; gross cabinet x 417.5–717.5, y 8800–9550. The old 300 × 400 cabinet and front-bedroom trials are superseded **as candidates**, not as accepted house geometry.

The [A3 section and route sheet](studies/bedroom4-wet-section.svg), [calculation](studies/bedroom4-wet-section.json) and [source](studies/bedroom4-wet-section.ts) distinguish house dimensions, manufacturer geometry and authored comparison inputs. They do not select a pipe system, product assembly or connection. Run the source with `--check` to compare retained artifacts.

## Evidence and incompatible product generations

Primary documents were inspected on29October2026, including a high-resolution rendering of manual page4 and the exploded assembly on page15:

- [Current Mira product1.1697.040.WH](https://www.mirashowers.co.uk/p/shower-enclosures/shop-shower-trays/mira-flight-low-square-1000-x-1000-0-upstands-11697040wh):1000square,40profile, optional riser; product listing alone does not bind the exact support/waste revision.
- [Mira1493053-W2-D](https://resources.kohler.com/plumbing/mira/pdf/1493053-w2-d-mira-flight-low-level-installation-and-user-guide.pdf), pp3–4/15–18: rigid40waste, minimum18mm/m fall, access/testing; square1000 has an **edge-centred outlet165from its edge**, not a corner outlet. C25 measures rim to lowest wet floor; D12 measures rim to the higher sloping tray field, not local drain-seat thickness. Waste dimensions50to outlet axis and81to housing bottom run **downward from the housing/clamping flange datum**. Page15 places housing/seal below the tray; its relation to the upper wet floor needs actual local tray thickness and gasket reconciliation. Top cleaning is distinct from housing renewal.
- [Historical manufacturer catalogue reproduced by PlumbNation](https://www.plumbnation.co.uk/documents/mira-flight-shower-tray-technical-sheet.pdf), printedp189, identifies .040/.033 and140–160 raised height. [Retained1101274-W2-M](https://resources.kohler.com/plumbing/mira/pdf/1101274-w2-m-mira-flight-low-shower-trays-range-installation-and-user-guide.pdf) and [riser instructions1105031-W2-B reproduced by Plumbworld](https://www.plumbworld.co.uk/documents/mira-flight-low-easy-plumb-riser-kit-installation-guide.pdf) are older records; the latter gives push-fit legs/locking/centre support/panels, but no current matched product identity or verified overall adjustment range. Its55mm clip installation dimension is **not** a tray raise. Do not combine older Vortex, current Rapi-Flo and unrelated standard-Flight kits.

**Correction of draftb8745066:** its corner1000 plan, inferred seat132/outlet101, and resulting2.1/−6.4 under-tray clearances were wrong and are withdrawn. They do not establish a physical clash. This revision uses the actual dimension directions and treats the flange relationship explicitly. No invalid number is retained as evidence of failure.

The160rim remains an authored comparison informed by historical140–160, not certification of a current kit. Raising it further simply to rescue fall is rejected without a supported alternative. No diameter establishes capacity;18mm/m is this manual's minimum, not a whole-system drainage design.

## Floor and threshold: spend depth explicitly

The accepted floor remains 20 finish + 22 deck + 238 framing + 55 service + 15 ceiling = 350, first FFL +3450 and ground soffit +3100. The earlier wet trial is still 26.5, before unspecified levelling/support additions. Two explicit comparisons follow:

| Comparison | Geometric consequence | Disposition |
|---|---|---|
| Flush40 tray above floor | Upper wet floor +15; even optimistic housing flange at +15 gives bottom−66 and axis−35 | Not above-floor-only; needs actual supported opening/route, not a claimed55void |
| Raised rim+160 | Nominal underside+120; upper wet floor+135. **If** housing flange were+135: bottom+54, axis+85 | Optimistic reference only. Housing flange lies below tray; actual local thickness/seal must be reconciled |
| Retain26.5 wet trial on held deck | WetFFL3456.5; rim3616.5,166.5above dryFFL | Explicit adverse level comparison, not selected complete waterproof floor |

The 26.5 layers remain a rejected unchanged-budget trial, **not** a named complete supported wet product system. Retaining them here makes the minimum level cost visible; it does not certify substrate, tile support, movement or water containment. Select a supported complete system and rederive the actual levels, or deliberately revise the floor. Do not shave the deck or move a ceiling to conceal the cost.

The raised shower changes stepping, enclosure base and safe body support at the 750 nominal bifold entry. The 6.5 wet/dry step, door undercut/sweep and water boundary need a local threshold design. A bevel alone proves neither accessible passage nor containment. A leaking tray or blocked waste can still discharge through the enclosure entrance and room door: no dam, emergency floor drain or controlled overflow is selected.

## Located waste route and its real limits

The retainedNEtray uses150gross-width ×170gross-height removable boxing along north/west faces, with pipe axes y10750/x492.5. Its edge-centred outlet may face north at(1837.5,10660), or west at(1502.5,10325) with the pipe initially turned north under the tray. Both perimeter paths to cabinetentry(492.5,9500) are **2685**, requiring48.33fall. West orientation moves the housing closer to a reachable side but does not shorten this perimeter route. Actual moulding, required legs and bends still determine whether it fits.

The flange offset below the upper wet floor is unresolved. Letdelta denote that offset; **0,10,15 are authored sensitivity points, not measured bounds or manufacturer tolerances**. At160rim, the starting axis is85−delta. At cabinetentry the NEaxis is36.67−delta. An authored60outside fitting envelope has underside6.67−delta. Adding a comparison125inside-cabinet travel to a north stack consumes another2.25fall: axis34.42−delta and envelope underside4.42−delta. That small optimistic residual cannot be called installation space. Actual socket, clip, substrate clearance, connection envelope and local flange datum are decisive. A north stack must also accommodate the longer WC branch; entry into a cabinet is not a connection.

The corrected idealized under-tray exit at590travel has axis74.38 when delta0; a60envelope lies15.62below the nominal+120underside. This **withdraws** the old clash; it does not certify contour/leg clearance. The150×170boxing with18faces/cap leaves114internal width and152under-cap height. At idealized85axis/60envelope there is37below the cap; fixing/support/tool duties consume it. Continuous water boundary and independent covers remain required.

Two concrete alternatives were challenged:

| Alternative | Section benefit | Whole-design consequence |
|---|---|---|
| Direct west from retainedNE outlet, then south:1835length/33.03fall | Saves15.3fall | Crosses770of open floor beyond existing boxing. Requires an actual cross-room step/box; **rejected as unchanged-plan fit** |
| Move trayNW to x417.5–1417.5, keep y9825–10825, south outlet(917.5,9990), west then south to entry |915length/16.47fall; idealized entryaxis68.53,60envelope underside38.53; even authored delta15 leaves23.53 before in-cabinet travel/support | EASTenclosure entry and connected600body route are spatially plausible in HAD read-only comparison; directly wets retained westwindow intervaly9700–10700 with nominal750sill. Requires actual wet-window frame/sill/water boundary, controls and shade design; not adopted |
| Extend cabinet north300to y9850 | Saves only5.4fall | Creates620corridor between cabinet and NEtray;600body has only20total nominal allowance. **Rejected as robust improvement** |

The NW route stays beneath the tray and a short west-wall strip rather than bridging occupied floor. Its shorter drainage and nearer housing are useful design choices, but the new shower/window duty cannot be hidden. The NE layout avoids that new duty but has a severely constrained outlet-to-stack section. Neither is selected on a favourable single number. An actual conventional matched support/waste assembly or openly revised wet layout must resolve this choice.

Low boxing remains below nominal750sill but this does not prove window operation/cleaning, and a directly wetted window is a different boundary from a dry window above boxing. Basin/WC/vent paths remain separate. No shower route completes the room's sanitary system.

## First release, failure and complete renewal

| Actual task | Proposed sequence / retained duty | Remaining proof |
|---|---|---|
| Hair-trap cleaning | Stop shower; open enclosure; lift manufacturer's top-access parts, clean and refit in their indicated orientation; run water | Reach/step safety and correct product parts; no claim that the housing is renewed from above |
| Shower branch leak or blockage | Stop water use and isolate shower supply at reachable valves; open local boxing independently; inspect the first wet surface and disconnect accessible joint after draining | The first wetted surface under tray/boxing is the selected water boundary, still to be designed. A low removable face must permit inspection/drying; no hidden-tray visible-declaration claim is earned |
| Housing/union renewal | Remove appropriate tray-side cover; support pipe, release union/clamp and withdraw the actual housing; inspect/dry boundary, reinstall and water-test before covering | Under-tray access from south/west, required leg positions and tool sweep. West-facing NE or south-facing NW orientation shortens the housing reach to165from an edge, but a low panel alone does not prove tool access |
| Tray exchange | Isolate and disconnect; protect route; dismantle enclosure as required; cut/renew perimeter seal, disconnect waste; release support fixings per matched instructions; two-person lift and controlled removal; remake/test seals and enclosure | 1000 square tray cannot be declared carried flat through a900 nominal room door. Edgewise height, turning/handling, mass, door hardware and route to outside need an actual carrying study. Tiled perimeter release may require local finish repair |
| Cabinet/stack service | North face for reachable northern routine points; isolate/support before local component release. Remove WC and east face for its distant connector where required | No reaching750 through a north hatch. Actual stack joints, vent, fire/acoustic opening, independently supported components and full replacement lengths remain BCR/services duties |

The raised tray helps retain the structural floor, but makes stepping, concealed under-tray work and visible leakage harder. A simpler openly accessible waste arrangement or different tray/wet layout should win if this assembly cannot discharge those tasks. More covers and leak sensors are not substitutes for a reachable component and a real drying path.

## Handoff and remaining adoption gates

IAS/HAD must first match the delivered product assembly and demonstrate the under-tray route/renewal section, then select the wet floor/wall/threshold system with actual final faces and levels. BCR-STRUCTURE owns supported floor/stack openings and local wet loads; BCR-SERVICES owns the connected branches, stack/vent and downstream discharge. HAD must recheck the step, enclosure operation, cabinet faces and affected window against its whole-action paths. The old U-ENS3 and I00-C1 cannot disappear until an adopted house rewind explicitly removes/replaces their tasks.

IS-01, IS-03 and IS-04–06 remain open; this work narrows IS-02/IW-01 with a located comparison and corrected route/section sensitivities and rejected geometric shortcuts, but does not discharge them. No compiler geometry, source levels, shared BCR matrix, maturity, physical-test status or IAS-03 lifecycle changes. Full repository checks establish document/calculation integrity; no construction, hydraulic, structural, waterproofing or statutory acceptance is claimed.
