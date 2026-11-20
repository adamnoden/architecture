# Fixed incoming-water entry: joint-free lower-tube proposal

## Decision and limits

Prefer a fixed, single cold-bent lower pressure tube with accessible cold-cut renewal for further development. The former loaded carrier remains rejected; its adverse history is not replaced by a new pass. The previous level-primary/factory-elbow checkpoint is retained as a product-dimensional comparison. Neither that comparison nor this simpler proposal is selected for the house. HAD-INLET-RESOLUTION remains open.

The callable proposal is `compileFixedInletCandidate()` in [inlet-fixed-entry.ts](../../compiler/reference-house/current-design/inlet-fixed-entry.ts), with the joined tool/freebody/frost calculations in [inlet-fixed-operating.ts](../../compiler/reference-house/current-design/inlet-fixed-operating.ts). It consumes the same-document insert, authored fault case and fault result, verifies bound source blobs and rejects mismatched cases. Settings, identities, computations, diagnostics and drawings are serialisable. The shared design document owns recurring current-house use; this is no second selected house.

## One complete layout

Coordinates are house millimetres; Z is above the existing local ground-floor finish. Positive Y is into the Utility. RC room-side face is Y402.5; finished wall is Y429.5. Pressure axes remain X10080/10285. The actual 180 normal ×205 along RC jambs are at X9297.5/10502.5.

| Interface | Utility | Plant |
| --- | ---: | ---: |
| Primary at finished face Z | 478.39 | 598.39 |
| Clear secondary pressure sleeve | Ø150 | Ø150 |
| Formed pressure opening | Ø160 | Ø160 |
| Constant primary offset above sleeve axis | 18 | 18 |
| Protected lower outside diameter reservation | 50 | 50 |
| Radial reserve after5 setting | 27 | 27 |
| Fixed riser Y | 600 | 600 |
| Lower bend radius / turn angle | 98 /88.854237° | 98 /88.854237° |
| Lower bend tangent starts Y | 508.9596 | 508.9596 |
| Lower bend tangent ends Z | 577.9596 | 697.9596 |
| Upper south leg Z | 2725 | 2585 |
| Ordinary valve centre Z | 1200 | 1200 |
| First plain-pipe repair cuts Z | 975 /1425 | 975 /1425 |
| Exterior first plain-pipe cut Y | −300 | −300 |

Follow the secondary sleeve's existing1:50 fall towards the Lodge, then turn into the vertical riser with a finite R98 cold bend. The maker's Sanpress Inox instructionsp24 permits cold bendingd15/18/22/28 with radius at least3.5d and at least50 straight pipe at the ends. Both actual straight ends exceed50. The nonorthogonal fillet is already supported by the existing shared `finiteBends` method; no90° factory fitting is substituted for an88.854° turn. The former factory2316/article435660 geometry and native STEP identity remain explicit comparison evidence in the result.

There is74.4596 from finished wall to the first tangent. The actual Utility/Plant vent segments end at the wall mouths, not at the fronts of the wet cells. Conservative complete draw sweeps leave113.017/60.604 to those vents after5 and the chord allowance. The proposal reserves a circularØ76 opening around each roof riser: finite tube to remaining3-thick roof plate leaves7.996 after5 and chord allowance. This is a small geometric reserve and an authored opening, not a qualified roof collar, seal or fastening detail. The Plant bend is not rejected merely because its end is close below the roof; that end lies beneath the declared riser opening.

No permanent guard or support enters the PV working field startingY700. Guard frontY685 leaves5 after10 setting; native valve handle rotation is included. Routine valve reaches remain approximately414/552. The ordinary stance only just clears the washer exclusion. Low renewal uses the washer's existing restrained first rest.

## Installation and two real renewal cycles

Bench-bend the single lower wall-tail/riser, then connect at accessible straight runs. There is no lower elbow fitting, loaded carrier, sliding press joint, axially retracted sibling or165 valve cartridge. The lower bare tube mass is1.13672/1.03592kg. Clamps and any remaining jacket still need actual gross takeoff.

After independent isolation, zero pressure, cold cuts and opening its supports, strip the renewable jacket and split the upper funnel/roof closure and translate the drained small L-tube739.5 inY. Its outer tip clearsY429.5 by10; maximum riserY is1339.5. The conservative25 module radius leaves125.5 to the washer first rest after10. Roof plates and upper guard open during this work; lower troughs, reliefs and independent receivers remain fixed. Every intermediate translation is included. The primary offset in the sleeve decreases18→3.21; the curve stays inside the room beyond the wall. Reverse that motion for the bench-bent replacement.

**The earlier first-repair arrangement had a real defect:** a cut atZ1000 with the original coupling centred1080 leaves its lower edge1032, while the new96-long repair body reaches1048:16 overlap. Removing an entire valve module would remove that old body, but lower-L-only replacement would not. That failed sequence is retained as a regression, not described as maintainable.

The corrected first cuts are975/1425, with initial coupling centres1075/1325. New and retained old bodies are separated4; initial bodies clear the116 valve reservation by19; each first cut is47 from an old body after5. The actual2315.5/article436407 native CAD is95.5 long; the catalogue96 reservation remains conservative. Centred engagements are48 each side against the manufacturer's minimum24. Park lower repair bodiesZ879–975 and upper bodiesZ1425–1521. Park the exterior repair body on the **new bench tail** atY−300..−204 before introduction; centre across the cut afterwards. There is no invented96-long clean old exterior tail.

Second declared cuts are875/1525 andY−200. New and first-repair bodies again remain4 apart. Further cycles require replacing a longer accessible run. Never cut an existing96 fitting as though it were28 bare pipe. The source system permits zero connector interval atd28; that fact does not prove a particular press-tool pose.

Close both Lodge branch cuts for entry renewal, verify downstream isolation and zero pressure, and drain inventories independently. The wall contains approximately0.2674L while charged. Its sloping centreline is geometrically drainable towards the Lodge, but actual Lodge drain, air admission, no residual pockets and unattended response are **not established**. Catch the inventory during cutover. Retain independent temporary counterholds, protect sound ends against swarf, deburr, restore marked engagements, press, flush and pressure/leak test. Restore wet/air/thermal boundaries and separate free outlets before charging; restore electrical/occupied states only after drying and inspection.

## Joined tool reservations

The new native2484.9/article485542 Ø28 jaw STEP contains separate open and closed assemblies. The closed press axis isX−58.3 in the native model; the open display is offset150 inZ. Both hinge axes are recovered atX−27.5/Y±25.5. Full-circle corner-radius bounds around those axes contain every intermediate rigid jaw rotation, deliberately exceeding the actual opening angle. This is stronger than checking only a closed jaw silhouette.

The result places those bounds at all three first and second repair locations on both branches:12 joined poses. It covers all press-plane positions within the complete96 coupling, a100 approach translation, finished wall, actual inverter, washer first rest and retained sibling bodies. Default minimum sibling reserve is27.999 after5; exterior second-repair wall reserve is40.799. Own isolated guard and jacket open; electrical exclusion is temporary and restored afterwards.

This does **not** complete the tool duty. Official machine dimensions320×100×72 do not locate its attachment pin relative to the jaw. The maker page supplies no tool STEP, and the tested exact GTIN STEP endpoint returned404. Machine docking, whole machine/grip motion, Knipex cutter registration/knob movement and deburrer size remain unqualified. The existing R100 cutter/R150 hand screens remain authored working reservations. Knipex's1 9/16in minimum cutting radius is conditional on the stated tool/pipe/knob arrangement, not a measured hand envelope. A dimensional jaw check is not physical access evidence.

## Independent support and freebody

The actual low-frame comparison remains RHS80×60×4 rails atY480/Z40,120, spanning the two actual jambs. It weighs20.36kg and avoids the rejected front rails in the electrical field. Posts,3-thick wet floors and10×50 ribs at100 maximum pitch remain proposed pieces, not rated supports.

The new freebody places known pipe stock weight at its actual line-length centroid and retains signed unbalanced-endpA envelopes in both orthogonal directions. All represented pipe weight is conservatively assigned to the low frame; this is not an established tributary support network. Four signed normal bearings and two vertical bearings balance all six force/moment components about the frame centre for four adverse sign combinations. The maximum known normal bearing reaction is approximately4.319kN. Signed reactions and zero force/moment residuals are emitted, rather than an isolated scalar fit number.

The declared symmetric bearing law is statically admissible; it is not a solved stiffness/contact model. The existing scalar rail stress comparison also excludes fitting, valve, jacket, liner/frame weight, actual tool/counterhold actions, guide friction, thermal restraint and transients. No capacity follows from equilibrium.

The replacement receiving comparison remains the actual two RHS80×60×4 rails, Yaxis480 andZaxes40/120, spanning1205 between the real jambs; paired150-wide×10 backplates spanZ20–160, with bearing/anchor lines at the rail levels. Two rails weigh20.36kg. This is explicit candidate geometry, not a chosen anchor product or verified receiver. The new complete signed known-action distribution reaches4.319kN at one normal bearing under its stated symmetric bearing law; this does not include the excluded actions above.

The entire independent path still needs actual details: pipe fixed point/sliding guides → post/clamp and sealed boss → liner local plate/ribs → **rib-to-low-rail transfer members** → rail/backplate joints → anchor groups in the real jambs. The previously unstated rib/rail transfer cannot be treated as present. Window, sibling shell and floor-moisture capacity receive no credit. The general jamb link schedule is unresolved: an authored H8 comparison would give24 mm cover against25, while H6 would give26 mm nominally. Neither diameter is an established continuous-jamb arrangement or an installed cover/strength pass. No DPC penetration is authorised.

The owning `reconciled-house-interface.py` and its receipt specify the four H12 and returning H16 lanes, but do not supply ordinary transverse diameter, pitch or continuous hoop paths. The H6 socket-row links in the [earlier handoff](../str/provisional-house-handoff.md) are a separate local duty. The earlier phrase “retained H8 cage” promoted a conditional comparison into a source fact; withdraw that attribution. STR must author the actual continuous schedule, bends, setting allowance and confinement proof. Do not repair an invented H8 baseline or substitute H6 silently.

Intact restrained pressure pipe balances fluid end thrust through pipe-wall/joint force. FullpA is an adverse unbalanced-end envelope, not automatically an ordinary external clamp action. Conversely, wholly restrained40K expansion gives approximately13.34kN/132MPa. A small expansion distance does not remove that force. The real fixed-point, guide, terminal movement and bend-flexibility arrangement remains an internal design obligation.

## Fault and thermal duties

Retain two independently supplied90L/min branches, each with its ordinary outer sleeve mouth blocked, own lower relief open, own high hood intact, no manual/sibling credit and own free exterior receiver. Exact authored case and source identities are checked. The50 protected diameter and18 offset retain123.015 charged head and11.985 crown-air reserve atK1. A74 diameter fails. Fitted-cell entrance losses and complete guard/boot spray behaviour remain unqualified.

Nine bar is a support comparison ceiling. It does not prove an unrestricted source at that pressure supplies no more than90L/min. Actual pressure and rupture flow must separately meet the admitted envelope. PN16 does not enlarge relief admission.

The50 outside-diameter reservation leaves only11 radial insulation. [Water Regs UK's entry guidance](https://www.waterregsuk.co.uk/topics/all-faqs/how-should-pipework-access-a-building/) expressly distinguishes delaying freezing from preventing it. Its [insulation tool](https://www.waterregsuk.co.uk/information/tools/pipe_insulation_tool/) requires real temperatures, pipe and insulation data.

An explicit **sensitivity, not an assembly prediction**, uses initial10°C water,−5°C surrounding air, dryλ0.04 insulation andh25. Water plus steel heat capacity and cylindrical resistance reach first0°C in approximately2.010h. Holding0°C requires approximately1.952W/m; the210 exterior tail alone represents0.410W per branch under that idealised exposure. This is neither burst time nor heater selection. Moisture, bridges, local wind, axial heat and real constituents are not qualified. Increasing jacket diameter delays this sensitivity while eventually rejecting the actual roof/fault geometry. No-flow frost protection remains unqualified; no manual drain or invented continuously flowing water earns an unattended pass.

Recommend a verified frost-protected service envelope first. If an exposed tail remains, develop a separately protected mineral-insulated surface heat route with an actual outage/drain envelope. The [Thermon MIQ laser-welded specification](https://content.thermon.com/pdf/us_pdf_files/TEP0020a-MIQ-Laser-Spec.pdf) names a conductor, MgO insulation and Alloy825 sheath for freeze protection; it does not disclose or approve every termination, control and supply constituent. Holding an authored minimum+5°C needs3.904W/m in the ideal dry sensitivity. This is no selected heater or whole installed material exception. Prove actual holdover under declared weather, bridges and power loss; beyond it the Lodge isolation/drain/air-admission duty must be real. Do not shrink a real thermal assembly to the50 geometric allowance. If it is larger, resize or reroute the entry, hood and relief. The passive pressure-fault isolation and hood retention do not depend on that electrical system.

## Ordinary whole-valve hood replaces the bonnet neck

The recommended proposal encloses the complete stock valve and its handle inside a normally closed150-wide metal hood, Xaxis−110..+40, Y545..685. The previous80-wide guard could not enclose the91.3 west stem or full handle swing. The larger hoods remain55 apart and preserve the5 PV-field reserve after10. Their smallest full-handle reserve after3 plate and5 setting is only0.8: fabrication tolerances and actual fitted shape must earn it. There is no pressure-shaft penetration, new remote actuator, unqualified dynamic seal or need to identify a stationary bonnet landing.

A removable U-shaped control cover spansZ950–1460 and draws150 forward, clearing the full handle by33.8 after5. Its bottom clears the installed washer by97 after5. Front and sides come away together so the ordinary stem can actually be gripped. The existing ordinary inside valves remain separate from independent Lodge isolation. The normal access state temporarily occupies the electrical working reservation; simultaneous electrical work is excluded. Two lower metal seat cleats and two upper captive M6 retainers have explicit coordinates.30 returned shingle overlaps are proposed; exact dry flanges, welds, retention capacity and fitted splash-tightness remain unqualified. No gasket composition is invented.

Each wider hood overhangs its own wet cell, so an80-drop split metal funnel returns solely through its own circularØ76 throat. A proposed76-square throat failed the actual Utility taper and was discarded. Moving the risers25 rearwards toY600 permits the circular throat, with1.339 Utility /20 Plant boundary reserve after the actual2mm lining and5mm setting. The formerY605 proposal fails by0.677mm once that lining is charged; the regression retains that rejection. The pipe-to-throat reserve is8 after5. Net throat area aroundØ50 is2572.964mm². The declaredCd0.6 orifice sensitivity needs48.119 head at90L/min, leaving21.881 within80 after10. This is not a fitted discharge-coefficient or spray qualification. Ideal steady fully reversed jet momentum at the simultaneously admitted9bar/90L/min is127.279N; transient/local seam and retainer effects remain separate duties.

The **passive occupied source-fed fault case requires the covers closed**, with no intervention credited. `controlHoodDrawMm` defaults0; any opening explicitly rejects that case while preserving the independent pipe/relief computations. For a known wet/faulted hood, isolate independently at the Lodge before opening. The design does not claim inside shutoff access during a live contained rupture. Normal ordinary inside isolation can be operated independently through its access cover; opening is a supervised service state, not continued passive full-fault containment. This is the bounded operating choice, not a hidden equivalence.

For low tube renewal, isolate both Lodge branches, use the washer first rest and remove the full own front/side shell plus split funnel/roof closure. The lower troughs and independent reliefs stay fixed. Open the sibling front shell for pressing only within that same isolated state. The joined jaw checks explicitly omit those temporarily removed shells, rather than claiming the tool passes through them.

## Material, owner and later acceptance gates

This remains a dimensional Sanpress comparison, with **eight** known press seals per branch after deleting the lower elbow, plus PTFE ball seats, stock plastic T-handle and exact lubricants/selector constituents needing disclosure. There is no recorded owner exception. The [material policy](../../docs/reference-house/material-policy.md) grants none for smallness, concealment or renewability. The existing [water-joint control](../mat/services-water-joints.md) develops metal-sealing Conex copper compression; its22 fittings are not28 stainless substitutes. Complete the actual28 compression/tool/repair comparison before proposing any narrow residue decision. The2375.8 swing-out valve remains rejected because it is not for potable water.

| Boundary | Missing evidence / affected decision | Required route and latest point |
| --- | --- | --- |
| Internal design | Complete machine/cutter/deburrer motions; actual support path and thermal restraint; named thermal assembly and frost envelope; hood/funnel static seams and retention | HAD with STR/MAT before describing a complete pre-site arrangement or adopting this proposal |
| Owner material | Exact complete constituent comparison and any specifically requested exception | Actual owner decision before material selection; no approval invented here |
| Owner architecture | Window obscuration, ordinary use, complete restoration and sash/frame renewal, with compression/exterior-bay alternatives if necessary | Existing joined architectural/interior owner gate before selection |
| Site/network | Provider pressure and rupture flow, actual frost conditions, exterior working/rest ground, upstream drain/admission and independent tailwaters | Existing DPL/BCR/DEL acceptance routes before fixing the site-specific entry and installing it |
| Physical | Complete blocked-mouth/hood/relief/guard test, loaded support, actual ordinary-tool renewal and wet/air/thermal restoration | Existing physical/installation records before occupied acceptance |

The current interior coordinates do not prove an exterior bay necessary. The light module fits the declared washer first rest. If the remaining complete duties reject it, compare a genuinely accessible bay with the same duties; do not adopt extra footprint simply because the old carrier failed. Honest publication of this conditional investigation does not require physical or statutory acceptance of the house.

## Verification and propagation

Focused tests cover real old/new body separation, adverse valve-body overlap, nonorthogonal lower bend and full draw, native jaw motion bounds, a hand-solvable six-reaction control, signed equilibrium, independent frost/jacket changes, riser/cut/guard edits, lost hood and mismatched fault revisions. Settings save/load reproduces the proposal; injected approval is rejected. These are computational checks with explicit proof ceilings.

Changed inputs areY600 risers,975/1425 first cuts and their100-centre offsets, and the explicit closed/open control-cover state. Methods now include the lower slope-following fillet, full translated module/vent/roof checking, native jaw bounds, complete known-action freebody and declared frost sensitivity. Both drawings, stock/mass, source case, operating output and dependent evidence change. The new whole-valve cover/funnel drawing replaces the earlier bonnet-neck dependency. Shared geometry's declaration now exposes its existing bend metadata. Remaining computational debt is the actual tool registration, full support/thermal model and complete assembly boundaries listed above; it is not relabelled physical proof.
