# IAS room lighting — interrupted design recovery, 22 November 2026

**Recovery checkpoint only. IAS-ROOM-LIGHTING is not complete.** No lighting scheme, component, material exception, installation, physical result, photometric performance or owner aesthetic acceptance has been adopted. The execution environment became explicitly unavailable during implementation. The owning result remains unissued.

## Source and occupancy

- Started from main `769b60bc360a9a1cb36e9cfe0add9908d6db4b8e`.
- Local worktree: `/tmp/ovid-ias-room-lighting-worktree`; local branch `work/ias-room-lighting-20261122`.
- Canonical own lease: IAS-ROOM-LIGHTING generation 1, UUID `c3d35a47-cb1b-40b3-92c2-a18b35228633`, holder `chatgpt / ias-room-lighting-20261122`. Claimed 00:25:18.324 UTC, original expiry 01:10:18.324 UTC.
- Root subsequently released the lease to handoff at 00:43:29 UTC (reported canonical readback content SHA prefix `771ebb73`). This branch is a recovery checkpoint, not a renewed claim.
- Governing brief: [adaptable-room-lighting-brief.md](adaptable-room-lighting-brief.md), issue #1614. Reused completed [lighting research](../../docs/research/lighting-and-accessible-service-layers.md), [Crafted Room Kit](crafted-room-kit-result.md), IAS-02S and Controlled Attachment Plane; no broad research restart.
- No STR native58 file, HAD arrangement, water-replan, MAT baseline, generated current output, compiler source account or existing crafted-room receipt was edited.

## Durable contents and local-only residue

This recovery branch preserves the authored defaults and component-reference schedule:
[adaptable-study-lighting.json](studies/adaptable-study-lighting.json) and
[lighting-component-references.json](studies/lighting-component-references.json).

A new local-only compiler method had been written at
`compiler/reference-house/current-design/assemblies/study-lighting.ts`.
**It is uncommitted and unavailable through this remote checkpoint.** Do not infer its implementation is saved because this note describes its calculations. If the local environment returns, inspect and recover the actual file before rebuilding it. The final local edit was not rerun.

No compile.ts route, saved engineering-document stage, semantic editor change, sourceCoverage registration, producer, tests, views, owning result, node completion, PR, CI, preflight or merge was completed. Root had reserved lighting-specific optional `studyLighting` and semantic-edit hunks in the shared compiler files to this worker, but no such edits had begun.

## One observed local calculation

One actual `node --import tsx --input-type=module` invocation imported the new method, resolved the current Georgian source, called the existing occupied-service binding and Study kit kernels, and printed a result. It returned `DEVELOPMENT_COMPARISON` with an empty diagnostic list. That was a **development geometry smoke calculation**, not an automated test or acceptance result. No typecheck, test suite, physical measurement, product photometry, source audit or current-head CI ran.

Observed room identities:

| Field | Identity |
| --- | --- |
| Current plan basis | RH-LAYOUT-REVISION-02 |
| Occupied house | HAD-SERVICES-02 |
| Room | GROUND/G-STUDY |
| Occupied binding digest | `384837dd37a4ca46629d67068e5fd3352301f8e4172911513cabcb54f5e1fb1c` |
| Furnished geometry SHA256 | `ff387bfb8119310c7fccbd54848d8982bd2feba8541b297b0583bd8640f1352e` |
| Workable Study floor SHA256 | `db86483f5d040c819b9d169c98f70e4f267cfca838ed942cd98c766f9d7f4593` |
| Workable Study release SHA256 | `c902cc720c22b53340b1b70e219d332b1625b211711137d16ec40be6d357067c` |

The actual three Study bands were:
`[429.5,429.5,4703,1103]`,
`[429.5,1103,3303,2553]`,
`[429.5,2553,2720.5,3150.5]` mm.
Desk `[655,600,2255,1300]`, chair `[900,1400,1900,2300]`,
west emitter `[429.5,1250,629.5,2400]` are opposite-corner rectangles in mm.
Door rough X is `1350..2250`; north finished face Y `3150.5`.
The existing Study method supplied ceiling Z `3100`, the south module
`[2675,1280,3125,1730]` XZ and the inlet/grille reserve
`[2826.5,1773.58,3263.5,2304.58]` XZ. These identities and dimensions must be regenerated from the next current source, not copied into a new fixture.

## Bounded design direction — unadopted

Prefer a **desk task lamp + portable floor fill + one independently supported door-side wall arrival source** for further development. This is an arrangement recommendation pending the complete fair comparison and actual trial. A simple ceiling fitting plus lamps remains a credible fallback; whole-ceiling panels are not required.

Keep the crafted stack within its existing 27 mm datum in general fields. Its 26.35 mm assembled stack is already allocated and supplies no credible 47 mm electrical-box cavity. Explore the following localized deeper candidate instead:

| Derived candidate quantity | Observed value |
| --- | ---: |
| General core-to-face datum | 27 mm |
| Local total core-to-face depth | 75 mm |
| Fixed boundary allowance | 7.5 mm |
| Removable local face allowance | 10.5 mm |
| Gross stand-off behind face | 57 mm |
| Independent carrier depth reserve | 2 mm |
| Connected usable routing depth | 55 mm |
| Referenced actual back box | 72 × 72 × 47 mm |
| Remaining depth beyond box | 8 mm |
| Local roomward intrusion | 48 mm |
| Candidate bay X | 1000..1300 mm |
| Candidate front face Y | 3102.5 mm |
| Door rough-to-bay stop | 50 mm |
| Conservative charged floor territory | 0.0144 m² |
| Socket centre XYZ | 1150, 3102.5, 600 mm |
| Ordinary switch centre XYZ | 1150, 3102.5, 1100 mm |
| Separate west desk socket XYZ | 477.5, 800, 600 mm |
| Plug inserted projection reference | 20 mm |
| Hand/use plan rectangle | [1000,2982.5,1300,3102.5] mm |
| Decorative first normal draw | 50 mm |
| Decorative first-draw plan | [1000,3052.5,1300,3102.5] mm |
| First-rest stand/parking plan | [1000,2700.5,1300,3000.5] mm |
| Optional removable fixed-support module | 260 × 450 mm |
| Complete luminaire projection reserve | 180 mm, authored requirement, not manufacturer assembled proof |
| Authored module mass ceiling | 3 kg, not actual product mass |
| Authored gravity demand | 29.43 N |
| Authored gravity moment at 180 mm | 5.2974 Nm |

The 75 mm detail uses a **new local positively screwed decorative infill**, not the old hung cassette plus an imaginary extra cavity. Fixed socket/control islands remain independently supported and enclosed when adjacent decoration is removed. The luminaire bracket loads an independent metal carrier and fixed side rails through declared hard lands into permanent structure. Decoration and the mineral/air layer do not become structural anchors.

The 3 kg/180 mm load envelope is a requirement to qualify, not a capacity proof. Complete hardware geometry, actual substrate, anchors, retention, drop prevention, electrical enclosure, earthing, strain relief, thermal clearances and all product constituents remain open. No separate remote driver is presumed for the referenced replaceable-E27 fitting. Fixed-light work requires identified circuit isolation and proof of dead; a switched portable socket does not isolate a fixed light.

### Important final local correction, not rerun

Inspection found that the retained left door-side skirting end piece spans X `1225..1345` and needs its existing 22 mm independent normal first draw. The last local patch therefore:
- started the deeper bay above the current room-assembly skirting top plus its 5 mm setting gap (currently Z 155 mm);
- stopped low containment 5 mm before that retained end piece (currently X 1220 mm);
- kept the end piece and its release independent;
- charged the **complete** 180 mm light projection plus 50 mm module draw, rather than checking a decorative face alone;
- listed affected north-wall crafted panel identities as local replacements rather than reopening the entire completed kit.

The resulting complete light/module first-draw plan would be
`[1000,2872.5,1300,3102.5]` mm at the present source.
**These final changes were not compiled or tested after editing.** Their datum, trim and access consequences must be checked before relying on them.

## Four common-room comparisons drafted in the local method

All four used one actual furnished room and the same finish/task assumptions; no illuminance, surrounding luminance, glare rating or acoustic benefit was computed.

| Arrangement | Sources and burden to assess |
| --- | --- |
| Portable | Adjustable desk task, north-west floor fill, side-table task on an additional 300 mm stand; dedicated ordinary switched lamp socket for arrival; added local side socket and protected edge lead required. Removed floor lamp loses intended arrival. |
| Lamps + wall | Desk task, portable floor fill, one door-side wall arrival source. Preferred development direction because moving a portable lamp does not remove the intended arrival source. |
| Wall-led | Door-side background, separate adjustable wall task source at the desk, south-module background. Three supports/feeds; actual task product and all three local support/geometry details still need completion. |
| Ceiling + lamps | Desk task, floor fill, one ordinary switched accessible surface ceiling fitting. One 150 mm base and an authored 320 × 320 × 350 mm fitting envelope; structural fixing and source replacement not yet qualified. |

The side-table lamp is an **added** occupied item, not historical furniture. Its stand/socket/lead path still needs a complete placement and replacement check. The wall-led comparator must use an actual adjustable task fitting, not call the diffuse Astro background fitting a task light. A promising dimensional witness was the [Type 75 wall light with cable](https://www.anglepoise.com/product/type-75-wall-light-with-cable-jet-black/): manufacturer states 75 mm wall plate, 320 mm maximum reach, 145 mm shade diameter and 192 mm shade height. It was **not** added to the saved component JSON or mechanically coordinated before interruption. Its full reach/load/lead envelope cannot inherit the north module's 180 mm requirement without a new check.

Observed candidate desk lead route:
`[795,800,730] → [795,800,600] → [625,800,600] → [477.5,800,600]` mm:
447.5 mm plus authored 200 mm slack versus the reference 2700 mm lead.
Observed floor route:
`[594.5,2800.5,0] → [594.5,3080.5,0] → [1150,3080.5,0] → [1150,3102.5,600]`:
1435.9032 mm plus 200 mm slack versus reference 2500 mm lead.
These are geometric routes, not certification of cable support, actual exit point, trip safety, thermal design or exact product flex.

The method intended explicit diagnostics for insufficient local depth, lost bend reserve, furniture/use/draw/parking collision, socket reach outside the completed research's 450..1200 mm comparator, exceeded supplied lead, removed selected carrier, failed source and changed finish. It held manual controls independent of automation and all photometric/material/physical/owner acceptance fields false or null. The diagnostic implementation has not received a test suite.

## Actual kitchen transferability screen

The smoke calculation read the actual bound current-house model, not a second kitchen fixture:

| Object | Actual XYWH mm |
| --- | --- |
| Central dining/work table | 8500, 9100, 800, 1200 |
| Occupied west-south chair/worker position | 8000, 9150, 500, 500 |
| North sink station | 8700, 10970.5, 900, 600 |
| North cooking station | 10750, 10970.5, 600, 600 |

A demanding central task was located at `8700,9400` mm on the existing table, near its occupied west-side worker. Z 750 mm was explicitly an authored comparison plane; actual table height, food suitability and performance remain unmeasured. Existing cooking top Z 900 mm came from the actual source.

Do not generalize the Study lamp preference to central food preparation. A portable lead crossing circulation or wet/hot work is not a credible fallback. Retain an independently supported, ordinarily switched, replaceable-source ceiling task fitting over the actual table task, with source product/cleanability, worker/hand shadows, glare, heat/grease, reach, fixing and isolated replacement still to qualify. Sink/hob/hood task lighting retains separate obligations. The local method used the current Study/occupied-storey ceiling datum as a comparison reference; confirm the actual kitchen ceiling before completing its section. No kitchen layout was changed.

## Resume in order

1. Re-establish fresh main, eligibility and canonical own lease. This released generation is not reusable authority.
2. Recover the actual local TS method if available; otherwise rebuild from the existing shared Study and occupied-service kernels using this bounded record. Do not treat the smoke calculation or final unrun patch as a receipt.
3. Complete real task/background products, all three comparator feed/support obligations, lead/stand routes, north service corner/reveal/skirting release, full component replacement/parking and actual kitchen section. Keep all constituents/admission limits explicit.
4. Add matched furnished views and the service corner plan/section/elevation from the same derived method. No artificial light pools, guessed lux, arbitrary acoustic credit or automatic ceiling-panel mandate.
5. Add meaningful tests: 75→27 mm depth must reject; supported deeper bay must move its face/area/draw; left→right desk task moves lead/fixture without changing room/door/kitchen; source removal loses its intended role; carrier removal rejects fixed choice; changed finish explicitly invalidates future reflected-light evidence; unknown input/units/derived fields reject; unchanged geometry controls stay equal.
6. Integrate the optional saved `studyLighting` stage and stable semantic edit via existing compile.ts / engineering-document.ts / engineering-edit.ts, preserving save/load, undo and stale-reply checks. Coordinate those shared files with root and HAD first.
7. Bind authored defaults, component source and new method in the existing source account; retain producer source receipts and current-source invalidation. No historical fixture or smoke output may masquerade as current evidence.
8. Issue `adaptable-room-lighting-result.md` with fair task ledger and precise existing PHY/BCR/DEL physical-trial duties. Update owner pack through its actual review gate. Physical validation, aesthetics, material admission and construction/print release remain separate.
9. Run exact-head checks/CI/publication preflight, integrate and close out only when earned. No packet completion is claimed by this checkpoint.

**Stop reason:** actual execution environment unavailable, with native commands and automated validation inaccessible. Root owns lease release reconciliation. This checkpoint preserves useful authored work; it does not advance completion counts.
