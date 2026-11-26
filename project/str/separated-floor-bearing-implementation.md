# Executable separated-floor candidate

This plan belongs to the [source-bound owner comparison](separated-floor-bearing-comparison.md). Its geometry/pressure-only consumer passes nine controls. No new coupled house response, horizontal connection, bearing resistance or owner acceptance is earned.

## Physical topology

- Keep all four outer L200 lateral/roof walls and their actual base splices. Model real RC through Z3170..3370 independently of the floor.
- Cut the four RC/gap domains from the slab. Add four lower140 mm masonry L bodies with actual unilateral normal floor contact and full ground-girder support.
- Keep the two deep northern upstands as floor components; replace four monolithic beam/pier heads with real compression-only sliding beds. Retain portal gravity, actual arch thrust and the real foundations.
- Add only SW-X, SW-Y and NW-X horizontal interfaces. Their free-sliding comparison has no vertical transfer. Additional physical restraint must be explicitly identified.
- Retain actual roof/masonry seats, ordinary lower bodies, wet/rear supports, openings, G/Q, roof stock/pressure, court programme and all52 heads. No discarded load or hidden new support may improve the result.

The old monolithic finite SW solid cannot become this joint by deleting its reported moments. Three rigid corner controls likewise do not certify three released interfaces.

## Exact native seams

| Source at5ab | Current physical coupling | Candidate implementation |
| --- | --- | --- |
| distributed_floor_compatibility.py:228–279 | The L lower-wall top nodes also own membrane corner u/v/rz and rigid-patch maps. | Give continuous RC and floor separate physical nodes/traces. Trim floor/band material around all four RC/gap footprints. Use the separately authorised exact-zero extra chord admission; no tiny fake EA. |
| perforated_floor_condensation.py:129–239 | Every retained corner has three rigid-patch coordinates; owner() maps its whole rectangle. | Add narrowly scoped physical point-translation retention for the key locations, or an owned candidate assembler using the same CST/band kernels. Do not create empty corner patches, arbitrary drilling stiffness or zero-energy unused coordinates. Retain physical rigid modes and source-consistent loads. |
| rc_floor_house_loads.py:381–398 | Membrane joins finite northern upstands; JOINED-FLOOR/energy and actual north-pressure replacement are installed. | Keep the upstands with the floor and preserve their real material/pressure. Release their post heads, not their actual floor gravity. Preserve the actual north gross-pressure removal and open-portal replacement. |
| masonry_frame_a.py:171–209 | Each physical post endpoint3170 is work-mapped to its upstand centroid master, transmitting moment/H. | Create independent post-top nodes and beam-bottom traces. Integrate compression-only beds over the actual212.5×290 footprints. Crop post tops for actual bed thickness. Retain arch loads, pier G and cap routes. Check independent post stability after release. |
| vertical_rc_floor.py:235–243,296–320 | Plate w/rx/ry follow all four L rectangles and northern receivers. | Remove all four corner rotation traces and actual RC/gap plate cells. Keep plate/upstand continuity where integral, but transfer into northern posts only through the four new beds. New masonry seats get physical normal contacts. |
| upper_roof_bearing.py:98–109 | _build_base exposes receiver/core callbacks, but not the deeper pre_plate_model_transform. | Thread one bounded source-owned topology builder/transform into the existing build_vertical_rc_floor seam, or provide an owned candidate build function. No solver monkeypatch or response-fed assembly. |
| lower_core_bodies.py:90–219 | Existing serial body shortening and separate top contact; exact base routing. | Add the four actual masonry bodies once. Route full base footprints through actual girders/caps with offsets and origin records. Check contacted + free-top + unsupported areas, body force and work. No nearest-head fallback. |
| floor_section_successor.py:69–75,156–177 | Reassembly recreates RC corner membrane maps and can undo a release. | Supply the owned topology path before reassembly; do not call the unchanged section successor after splitting and silently recover its old maps. Keep RC200 admission. |
| floor_section_successor.py:78–107 | Source3370→midplane3270 offset moments go directly to RC corners except actual north-beam segments. | Remove the corner moment bypass. Apply physical offset couples through actual vertical plate rotation/load traces at source locations; normal bearing must close the out-of-plane wrench. Preserve any legitimately loaded north-beam route with actual origins. |
| floor_section_model.py:46–68,145–155 / upper-L builder | Upper L starts physically3370 but the lower master remains the old floor/collector node. | Create actual RC nodes at3170/3270/3370, wall segments through the200 mm band, and a real3370 upper-wall start. Replace volumes/G/upper gaps exactly once. The floor stays independent. |
| roof_floor_compatibility.py / upper_roof_bearing.py:112–156 | Actual roof operator, upper L members and18 normal masonry roof seats. | Retain geometry, stock G, source pressure/court programme and unilateral laws. Releasing the floor does not authorise dropping roof uplift or adding upper restraint. |

Only the selected floor/key traces belong to the new H interfaces. Existing northern beam/plate relations remain internal to the floor component; their global support now comes through beds. Audit all spring/constraint IDs and work maps to prove no other floor-to-core/post H or rotation bypass remains.

The candidate request contains actual authored nativeCase controls plus explicit geometry/interface choices, never retained forces. Bind changed methods as a new source set. Historical receipts/identities stay historical; the parent owns legitimate current-source migration.

## Physical H connection before acceptance

The native pressure-only component already reaches94.581 kN. Ordinary masonry head restraints are not a diaphragm substitute. Three physical orthogonal pin/vertical-slot clevises are a better development route than four bespoke angled keys: captive opposed bearing handles reversal; an unclamped shouldered pin allows Z and along-wall travel.

Wall-side full-depth through-rods with front/back plates cast flush into200RC could transfer pull as rear-face compression and reverse load as front-face compression. They avoid an invented200 mm bonded horizontal development length, preserve continuous exterior insulation, and use permanent structural metal rather than a service route. Floor-side anchorage can run into the actual slab interior with a local mat recomposition.

No sizes or capacity are accepted. Draw/check rods, plates, pin/slot travel, actual RC longitudinal bars/links, floor mats, covers and settings. Check bearing/steel/weld/plate resistance, compression spreading/splitting, floor local D-region, reversal/slip/rotation, corrosion/fire/thermal continuity and finish access. A zero vertical-force idealisation is not evidence that a real loaded pin has no friction or stop.

For orientation only: a250 mm square rear plate carrying94.581 kN at an explicitly assumed50 mm vertical eccentricity would need a triangular225 mm compression zone and about3.36 MPa peak bearing. This hand-derived necessary screen is not a tested new demand, plate/rod strength, concrete resistance or cage-fit pass.

If an actual all-metal detail fails200 mm placement or strength, reject it promptly and compare a concrete core/section change. Do not rescue it with resin, polymer sleeves, shortened anchorage, invisible thickening or a renewed slab moment clamp.

## Minimal next proof

1. **Component work controls first.** Independent wall lift/rotation and floor vertical motion must remain separate. The explicitly free-sliding H interface has zero vertical work; normal beds may open. Recover physical six-wrench and energy independently. Check the membrane rigid modes, condensed load wrench, actual plate work and complete new material/origin ledgers.
2. **One unchanged source control.** After the parent resolves the current membrane recovery guard, run the same zero-extra-chord + rear W31 request through the new wrapper with the topology transform disabled. Require unchanged physical heads/ports/work and current source/runtime/request identity. Historical outputs never assemble the model.
3. **Fresh changed W0 and W31.** Assemble all four new seats, four northern beds, continuous cores and three H interfaces. Retain every full input/response. Compare all52 heads; roof/floor displacements; actual new normal-contact states; body shortenings; pressure/roof/body six-wrenches; offset couples; and northern pier/arch movement. Do not preserve the old32-contact count by fiat.
4. **Actual adverse mechanisms.** Remove one H restraint and detect the corresponding mode. Engage a real vertical stop or lock slip and quantify the uplift/moment bypass reintroduced. Reverse wind and engage the opposite captive face. Bound friction/seizure for thermal restraint without taking friction credit for wind. A locked case with different geometry/G is an adverse, not an unchanged old-house control.
5. **Only then fund a new signed programme.** If physical details and coupled/numerical results are meaningful, run a fresh96-case programme. Recover simultaneous wall, floor, beam and key actions. Choose ordinary continuous-wall steel and direct-bearing floor reinforcement against those new demands. Old96 witnesses and the rejected15H12 node do not select the new cage.

The hoped-for benefit is that roof/core movement no longer drags the gravity floor off its masonry. It can fail through contact loss, western core/foundation overload, released-pier movement, inadequate slab support anchorage or thermal/friction restraint. Those are concrete falsifiers, not a claim of conservatism.

## Retained scope and residue

The present private branch changes only comparison inputs, consumer/tests, drawings/report and a bounded read-only hosted workflow. It changes no physical producer, saved house, old receipt or source account. The temporary workflow remains with its proof provenance pending parent integration/cleanup. No merge, engineering adoption or clean workstream closeout is claimed.
