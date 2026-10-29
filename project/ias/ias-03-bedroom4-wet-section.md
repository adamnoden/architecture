# IAS-03 — Bedroom 4 wet-service section, conditional design study

**Disposition:** useful partial design, not IAS-03 completion or adoption of the HAD alternative. The selected dry family and IS-01–06 holds remain authoritative. This study puts the proposed second en suite's drain, floor levels and renewal operations into one located section. It rejects hiding them in the existing 55 mm service void.

## House decision and exact applicability

Develop an enclosed raised tray with an accessible north/west perimeter waste route as the comparison for the [HAD Bedroom 4 proposal and checkpoint PR](https://github.com/adamnoden/architecture/pull/1026). Keep the structural deck and the floor/ceiling datum unchanged in the current house. The proposal must explicitly accept a raised shower entrance and resolve the adjacent wet finish/door level before adoption. A level-access wet room is a separate floor/drain redesign, not a label for this arrangement.

The starting accepted main is `8cd642ef8ea7c7ec919c71c902f7f8daaf987034`. The HAD proposal is still unadopted: its reviewed study source blob is `099bd8d74b4db3fa2941d21d32f6de728c2b7a57`; the integrating PR records the accepted checkpoint and any reconciliation. Its new wet clear is x 417.5–2337.5, y 8292.5–10825; tray x 1337.5–2337.5, y 9825–10825; gross cabinet x 417.5–717.5, y 8800–9550. The old 300 × 400 cabinet and front-bedroom trials are superseded **as candidates**, not as accepted house geometry.

The [A3 section and route sheet](studies/bedroom4-wet-section.svg), [calculation](studies/bedroom4-wet-section.json) and [source](studies/bedroom4-wet-section.ts) distinguish house dimensions, manufacturer geometry and authored comparison inputs. They do not select a pipe system, product assembly or connection. Run the source with `--check` to compare retained artifacts.

## Evidence and incompatible product generations

Primary documents were inspected on 29 October 2026:

- [Mira product page, 1.1697.040.WH](https://www.mirashowers.co.uk/p/shower-enclosures/shop-shower-trays/mira-flight-low-square-1000-x-1000-0-upstands-11697040wh): 1000 square / 40 profile and optional riser. This does not bind every installation detail to the supplied revision.
- [Mira Flight Low manual 1493053-W2-D](https://resources.kohler.com/plumbing/mira/pdf/1493053-w2-d-mira-flight-low-level-installation-and-user-guide.pdf), pp 3–4, 8–9, 15–18: rigid 40 waste, minimum 18 mm/m fall, access and water testing; the 1000 square table gives 12 mm local floor depth above tray underside. The Rapi-Flo drawing shows 81 overall depth, with outlet axis 50 above its bottom. Corner and central plans both appear; the delivered tray/waste combination must be matched. The section uses these dimensions conditionally, not as proof of compatibility with every .040 tray. Top-access hair-trap cleaning is distinct from replacing the housing or union.
- [Mira's retained Flight Low range manual 1101274-W2-M](https://resources.kohler.com/plumbing/mira/pdf/1101274-w2-m-mira-flight-low-shower-trays-range-installation-and-user-guide.pdf) and [Mira technical catalogue, reproduced by PlumbNation](https://www.plumbnation.co.uk/documents/mira-flight-shower-tray-technical-sheet.pdf), square table/drawing printed p 189: historical comparison identifies .040 / .033 kit, 165 corner offset and 140–160 overall raised height. Those are not contemporary matched-kit certification. Earlier Vortex waste claims must not be combined with the current Rapi-Flo geometry or flow claims.

No flow rate, trap seal, total branch capacity or acceptable discharge connection is inferred from a diameter. The 18 mm/m is this retrieved manufacturer's minimum, not a universal house drainage design. Exact supplied tray, waste, leg kit, outlet orientation and support instructions are required before selection. The nominal 160 comparison height below is an **authored design envelope**, informed by the historical range, not a claim that a currently supplied kit earns it.

## Floor and threshold: spend depth explicitly

The accepted floor remains 20 finish + 22 deck + 238 framing + 55 service + 15 ceiling = 350, first FFL +3450 and ground soffit +3100. The earlier wet trial is still 26.5, before unspecified levelling/support additions. Two explicit comparisons follow:

| Comparison | Geometric consequence | Disposition |
|---|---|---|
| Flush 40 tray over a nominal finished floor | Conditional 12 mm drain-seat datum gives waste bottom −69 and outlet axis −19 relative to that floor | Fails an above-floor-only arrangement; would need an actual supported penetration/route. It cannot borrow the service void through the deck and framing |
| Raised tray, rim +160 relative to its supporting finished plane | Tray underside +120; conditional drain seat +132, housing bottom +51 and outlet axis +101 | Credible vertical envelope to develop. Actual underside contour, leg positions, bends and withdrawal remain unverified |
| Retain 26.5 wet trial on the held deck instead of 20 dry finish | Wet finish +3456.5, 6.5 above the adjacent dry room; raised tray rim +3616.5, **166.5 above dry FFL** | An explicit candidate level rewind, not a complete waterproof floor or an adopted step. Additional bedding/levelling adds to these values |

The 26.5 layers remain a rejected unchanged-budget trial, **not** a named complete supported wet product system. Retaining them here makes the minimum level cost visible; it does not certify substrate, tile support, movement or water containment. Select a supported complete system and rederive the actual levels, or deliberately revise the floor. Do not shave the deck or move a ceiling to conceal the cost.

The raised shower changes stepping, enclosure base and safe body support at the 750 nominal bifold entry. The 6.5 wet/dry step, door undercut/sweep and water boundary need a local threshold design. A bevel alone proves neither accessible passage nor containment. A leaking tray or blocked waste can still discharge through the enclosure entrance and room door: no dam, emergency floor drain or controlled overflow is selected.

## Located waste route and its real limits

Reserve **150 gross width × 170 gross height** of removable low boxing outside the tray along the north and west wet-room faces. The plan reservation already has a whole-path HAD comparison; its height is new here. The north-wall pipe axis is y 10750; west-wall axis x 492.5. A corner outlet at (1502.5, 10660) follows north → west → south to the cabinet at (492.5, 9500): **2350 plan length**, 42.3 fall at 18 mm/m. A central north outlet at (1837.5, 10660) lengthens that path to **2685**, requiring 48.33 fall. These are centreline geometric comparisons, not hydraulic equivalent lengths or actual elbow take-offs.

With the conditional +101 starting axis, end axes are +58.7 / +52.67 above the wet finish. An authored **60 outside envelope** for fittings leaves 28.7 / 22.67 below their underside. The 60 is a stress-test envelope, not a selected fitting's dimension. The actual system, socket growth, bends, clips, access and stack branch inlet must fit; no capacity is assigned to this residual space. The gross 300 cabinet width is not its internal fitting clearance.

An 18 removable top and faces within 150 × 170 leave a nominal 114 internal width and 152 below the cap. The maximum +101 axis plus the 30 fitting radius leaves 21 below the cap. Fixings, grounds and pipe clips consume that allowance; they are independent of the removable cover. Extend the floor water boundary continuously behind the covers and terminate it at a designed wall/threshold, not at the decorative face. No screw may puncture that boundary by assumption. Low boxing across the west window must fit below the actual sill/control/cleaning geometry; it does not earn a window-opening pass.

**Under-tray challenge:** the short initial north turn and westward exit must clear the actual tray underside and every required leg. A simple plan polyline or a raised rim does not prove that. At the corner-case exit from the tray's west edge the bare 43 outside-diameter pipe comparison has only about 2.1 below the nominal flat underside; a 60 fitting envelope there would overlap it. Raising the whole tray raises both references equally and does not cure a local contour/connector clash. Locate the actual outlet/bend under the moulded tray, change orientation/routing or select a different supported assembly. This is an adoption hold, not a fabricated assertion that the real tray is impossible.

The north-to-west perimeter path avoids a diagonal across the shower approach, but consumes a real strip of floor. It must stay within the HAD reservation and maintain the revised cabinet-access route. It cannot be extended across the door or through framing without a new fit check. Basin waste requires its own supported south/west route and connection; the WC connector and vent/stack are separate tasks. One shower route does not complete the wet room's sanitary system.

## First release, failure and complete renewal

| Actual task | Proposed sequence / retained duty | Remaining proof |
|---|---|---|
| Hair-trap cleaning | Stop shower; open enclosure; lift manufacturer's top-access parts, clean and refit in their indicated orientation; run water | Reach/step safety and correct product parts; no claim that the housing is renewed from above |
| Shower branch leak or blockage | Stop water use and isolate shower supply at reachable valves; open local boxing independently; inspect the first wet surface and disconnect accessible joint after draining | The first wetted surface under tray/boxing is the selected water boundary, still to be designed. A low removable face must permit inspection/drying; no hidden-tray visible-declaration claim is earned |
| Housing/union renewal | Remove appropriate tray-side cover; support pipe, release union/clamp and withdraw the actual housing; inspect/dry boundary, reinstall and water-test before covering | Under-tray access from south/west, required leg positions and tool sweep. NW orientation puts the housing toward the back: a low front panel alone does not prove reach |
| Tray exchange | Isolate and disconnect; protect route; dismantle enclosure as required; cut/renew perimeter seal, disconnect waste; release support fixings per matched instructions; two-person lift and controlled removal; remake/test seals and enclosure | 1000 square tray cannot be declared carried flat through a900 nominal room door. Edgewise height, turning/handling, mass, door hardware and route to outside need an actual carrying study. Tiled perimeter release may require local finish repair |
| Cabinet/stack service | North face for reachable northern routine points; isolate/support before local component release. Remove WC and east face for its distant connector where required | No reaching750 through a north hatch. Actual stack joints, vent, fire/acoustic opening, independently supported components and full replacement lengths remain BCR/services duties |

The raised tray helps retain the structural floor, but makes stepping, concealed under-tray work and visible leakage harder. A simpler openly accessible waste arrangement or different tray/wet layout should win if this assembly cannot discharge those tasks. More covers and leak sensors are not substitutes for a reachable component and a real drying path.

## Handoff and remaining adoption gates

IAS/HAD must first match the delivered product assembly and demonstrate the under-tray route/renewal section, then select the wet floor/wall/threshold system with actual final faces and levels. BCR-STRUCTURE owns supported floor/stack openings and local wet loads; BCR-SERVICES owns the connected branches, stack/vent and downstream discharge. HAD must recheck the step, enclosure operation, cabinet faces and affected window against its whole-action paths. The old U-ENS3 and I00-C1 cannot disappear until an adopted house rewind explicitly removes/replaces their tasks.

IS-01, IS-03 and IS-04–06 remain open; this work narrows IS-02/IW-01 with a located comparison and a falsifying under-tray check, but does not discharge them. No compiler geometry, source levels, shared BCR matrix, maturity, physical-test status or IAS-03 lifecycle changes. Full repository checks establish document/calculation integrity; no construction, hydraulic, structural, waterproofing or statutory acceptance is claimed.
