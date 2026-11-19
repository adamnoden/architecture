# STR-GROUND — source-bound grid, section and movement comparison

**1 November 2026. Bounded pre-site comparison complete; no foundation or ground-floor assembly accepted.** This continues the [first option reduction](ground-movement-foundation-options-result.md) against the [P0 brief](ground-movement-and-substructure-brief.md). It answers which foundation family deserves development, what its connected geometry costs and which apparent solutions fail. It does not manufacture a plot, a working foundation or a construction issue.

**Recommendation:** carry **G1, deep load transfer with a continuous reinforced supporting grid and a genuinely suspended mineral floor**, as the preferred tree-heavy-plot typology, conditionally on demonstrated ground/support movement and complete interfaces. Keep **G3, a deliberately designed raft/piled raft**, as the principal structural challenger. A proven benign site can favour **G2/G4 continuous shallow/deep strips**, including traditional mineral footings; their simplicity is a real advantage. **Reject the present assembly splice and a rigid gravity-service crossing.** Neither foundation family nor added concrete solves those failures.

The investigation closes as a **conditional typology recommendation with adverse joined-interface results**, rather than a passed design. STR-RECONCILE must carry these failures into its actual candidate; completing this comparison does not authorise selection of an unresolved foundation. **Reference design — not released for construction. Assumptions and outstanding verification accompany the proposal; internal checks do not constitute external assurance or certification.**

## Exact source and drawings

Starting main: `7c0e2c500eea0b6c0e9d495d39ce1d0b03a6b11c`. The accepted RH-LAYOUT-REVISION-02 / RH-LAYOUT-FAMILY-02 shell and courtyard remain unchanged. The internal support enquiry uses the explicitly **unadopted B** [joined house plan](studies/house-plan.json), not a parallel adopted house. Exact SHA-256 identities for its inputs, accepted section source and the existing MAT comparison are retained in [study data](studies/ground-interfaces.json).

| Output | What is actually represented |
|---|---|
| [G-01 foundation routes](studies/ground-grid.svg), A3 1:50 | Outer/court inner-leaf axes; B ground-wall lines, openings, bridge reaction reservations, two proposed connecting returns and an east service-passage trial. Lines are routes, not sized ground beams; open circles are ring-junction demands, not piles or a pile count. |
| [G-02 connected sections](studies/ground-sections.svg), A2 1:10 upper domains | Source wall widths, existing MAT 330 mm authored floor stack, below-bearing mineral-DPC territory, cavity-base and vent interaction; court control and internal-bearing boundary. The unsized lower support continuation is visibly broken and **not to scale**. No footing depth or beam section is invented. |
| [G-03 moving-service and synthetic-tree trial](studies/ground-crossings.svg), A3 | A 1:100 route-exclusion map with a deliberately synthetic tree constraint; longitudinal gravity crossing and stated three-axis demand. The crossing is a centreline diagram, not a pipe, joint or utility approval. |

Print at 100%; the physical sheet dimensions and scale bars are part of the SVG. The 1:10 upper section is a **comparison of identified components and unresolved contacts**, not a complete supported/qualified installation. Unknown bearing, foundation, thermal, air/gas and water-protection details remain labelled at their actual locations.

## Support grid and the inhabited house

G-01 follows the actual B walls, rather than assuming four independent annular strips. The outer inner-leaf axes are 332.5/11667.5; court inner-leaf axes are 3917.5/8082.5. Both cavity leaves require common support with their actual eccentricities and lateral ties; the inner-leaf centreline is not automatically the foundation centroid. Every B internal masonry line is given a continuous foundation route, including below doors. Opening imposts, arch thrust and their temporary centering remain concentrated load duties, rather than holes in the ground-beam route.

Two explicit blue return proposals connect the rear divider's **85 mm** offset and rear-east wall end's **207.5 mm** offset to the court support route. These are geometric connection lengths, not adequate beam lengths, bearing lengths or proof of torsional stiffness. The proposed B bridge reaction axes at x4785/7215 have **2430 mm** separation. They lie outside its narrowed 1800 court opening; the original 2400 opening cannot inherit that result. The plan's red P1 route runs from the gross B stack centre x9685,y5050 to the east side: it deliberately demands a structural port before support design. Its intersection with the plant-door territory earns no free under-threshold space.

Roof/floor reactions and both wall leaves → walls/arch piers and deliberate ties → continuous foundation routes and collected junction moments → site-designed pile/group/footing reactions → evidenced ground. This is the load-path **topology**, not a calculation of the reactions. The source does not yet select a whole-house structural arrangement. Any adopted C south extension, court change, wall move, arch/tie or roof-reaction change rebinds these routes and the movement cases. G1 cannot be frozen before that architectural choice.

## What the movement calculation establishes

The [reproducer](studies/ground-interfaces.py) uses a small analytic model to expose the trade-off, not to size a foundation. Two vertical support springs of nominal stiffness `k` are connected by an Euler beam with **restrained end rotations** and differential stiffness `kb=12EI/L³`. Set `rho=kb/k`. This is one vertical strip; the real grid also has rotations, cracked stiffness, creep, torsion, horizontal movement, nonlinear soil/shaft action, group effects and construction stages.

For equal support stiffnesses and a prescribed free-support ground difference `Delta`, equilibrium gives `d=Delta/(1+2rho)` and load transfer `kb*d`. The moment coefficient `6d/L²` is reported as **M/EI**, only for the declared **3585 mm outer/court leaf-axis span** and nonzero beam stiffness. It is not a moment capacity or an actual applied load. No soil stiffness, concrete grade, reinforcement or pile count is selected.

| `rho` | Resulting difference from a 15 mm prescribed input | Load transfer divided by `k` |
|---:|---:|---:|
| 0 | 15 mm | 0 mm |
| 0.1 | 12.5 mm | 1.25 mm |
| 1 | 5 mm | 5 mm |
| 10 | 0.714 mm | 7.143 mm |

Increasing coupling can suppress a relative displacement by **transferring force**. It does not make an arbitrary foundation rigid. In a second case one support has half the nominal stiffness and both carry original equal loads `P`: at rho=1 the displacements are **1.50 and 1.25 P/k**, support reactions **0.75P and 1.25P** and transferred load **0.25P**. At rho=10 the stronger support reaches **1.323P**. A weak support therefore creates a check on adjacent supports, reinforcement and masonry; an intact concrete cube result cannot close it.

The source-specific imposed-displacement diagnostics are separate from that 3585 mm model:

| Location | Axis separation | Gradient for 5 mm relative displacement | For 15 mm |
|---|---:|---:|---:|
| Outer/court inner-leaf axes | 3585 mm | 1/717 | 1/239 |
| B court-south bridge reaction axes | 2430 mm | 1/486 | 1/162 |
| B short L return | 597.5 mm | 1/119.5 | 1/39.8 |

These are **support-point slopes**, not masonry strains, crack widths, allowable settlement or predictions. A short return/arch can govern before a global house tilt looks concerning. No generic 1/500 limit is adopted. The actual structural candidate must supply its displacement/distortion/crack-width and differential-rotation criteria together with actions, masonry/arch behaviour and the receiving support model before dependent structural selection. The absence of that actual candidate prevents numerical acceptance; it does not prevent this comparative diagnosis.

The void screen independently tests 150/300/450 mm starting clearances, 50/150/300 mm soil rises and 0/50 mm construction losses. A 300 mm gap with 150 mm rise and 50 mm loss retains **100 mm**, while 300 rise consumes it even with no loss. These are **stress inputs**, not a clay forecast or adopted free-void dimension. Contact is flagged at zero residual; no benign contact pressure is assumed. Shaft uplift and restrained beam-side contact need independent force checks even when the floor gap remains clear.

### Same challenges, different foundation mechanisms

| Family | Comparative response and disposition |
|---|---|
| **G1 deep supports + grillage + suspended floor** | Separates floor/beam from shallow soil only where a real clear gap persists. Pile heads can still move; the spring/anomaly cases apply. Retain as leader because it offers deliberate separation, inspectable support/construction records and controlled crossings. Reject if shaft heave, group movement, anomalous supports, roots or rig/access constraints cannot be accommodated. |
| **G2 deep trench-fill/strip** | Continuous support can reduce isolated reaction discontinuities, but active soil can load sides/base and deep excavation increases root/adjacent-asset exposure. Apply the same support-displacement cases; do not assign a better stiffness because it is continuous. Retain where evidenced ground and excavation permit it. |
| **G3 stiff raft / piled raft** | Redistributes reactions and may reduce differential movement, with greater bending/tension and shared soil contact. The force-transfer trade-off remains; uplift/contact and pile–raft load sharing require the real model. Principal challenger where G1 support/installation costs or movement response are adverse. An on-ground raft is not the open-void option. |
| **G4 shallow strip / stone / stepped brick** | A meaningful conventional and material comparator on proven suitable ground. A hypothetical strip forced to follow 15 mm differential ground motion does not gain isolation from extra masonry/concrete. Mortar joints, variable material/workmanship and capillary paths add duties. Reject as tree-heavy default, not as a universal foundation family. |
| **G5 raised piers / arcade** | Raises and exposes the separation/inspection frame, but concentrates reactions, thrust and lateral duties. It can improve a sloping-site section while increasing approach, exposure and enclosure complexity. Retain only where the actual setting and owner composition justify it; no automatic economy or movement superiority. |

No family receives a fabricated stiffness, site settlement, cost or strength. A geotechnically justified shallow scheme can beat G1; a large concrete grid cannot be recommended solely for mass.

## Connected section: a useful failure, not a membrane waiver

G-02 consumes the existing [MAT suspended mineral-floor study](../mat/suspended-mineral-ground-floor.md) rather than inventing a new material assembly. Its **15 finish +65 distribution +100 insulation +150 structure =330 mm** is an authored comparison. With 300 mm clear void it reaches 630 mm below FFL, **330 mm beyond the existing 300 mm drawing reserve**. That difference is a section-rewrite demand, not an authorised excavation. The source reserve is neither a surveyed ground allowance nor an underfloor service tunnel.

The floor below-bearing DPC-band trial is −330 to −480. Against the MAT outside-ground trial −630 its lower bed has 150 mm clearance. Splicing it into the old court mark −150 instead puts that bed **330 mm below grade**. **Reject that joined control.** Raise/re-author the floor/court and accessible approach, or develop a different qualified wall-base arrangement. Do not cure it with a tanked moat or a pump. The more generous band is not a tested brick/slate thickness, joint recipe, slip resistance or thousand-year result.

The extended cavity-base trial places top-of-fill at −705, giving 225 mm below the assumed controlling lower bed. That arithmetic does not establish a drained cavity, foundation fill support or groundwater acceptance. AD C's ordinary non-pressure-water wall route distinguishes exterior DPC clearance, cavity depth and floor-boundary continuity; its suspended-concrete route separately addresses ventilation, moisture and reinforcement. These are guidance relationships, not a house approval. [C]

The YA13/YB11 probe is inherited from MAT: 65 mm nominal component height, 200 mm liner and an unresolved inner throat across the rest of the 417.5 wall. Its nominal +65 ground clearance and 35 mm depth remainder are not weather protection, adequate airflow or complete fit. **J1** bearing/thermal/air-gas closure, **J2** internal-support capillary separation, and **J3** water-protected vent/throat remain visibly open. Opposing-wall ventilation must reach every cell of this much more cellular foundation grid through designed passages, without perforating a DPC or beam. A suspended strategy may remove one particular membrane dependence only after qualification; a required gas/moisture barrier cannot be omitted. Both floor fields at an internal wall need the appropriate continuous boundary where one is required. The alternative ground-supported floor families remain the MAT controls; neither inherits clearance or a membrane exemption from suspension.

## Services, tree constraints and compound failures

G-03 tests a synthetic tree at (−3500,6000) and an **authored 6000 mm exclusion radius**, not a real tree or a BS 5837 RPA. A west-side route crosses it, with minimum centreline distance **2488 mm**; an east-side route clears it at **15529 mm**. Route lengths are 11.25/11.05 m respectively. This earns the specific result that a modest reroute can avoid *this* constraint; it proves no actual root protection or service feasibility. Rig tracks, piling platforms, caps/beam excavations, covers and replacement working space need their own footprints. Forest Research identifies trenching/compaction as tree hazards and favours less continuous disturbance where practicable; “trenchless” is not a root-safe verdict. [T]

The longitudinal service trial distinguishes house-fixed from soil-fixed segments. At 2 m and a nominal 1:80 centreline fall there is 25 mm fall; a **50 mm adverse receiving-end rise reverses it to −25 mm**. At 1:40 the same event consumes the whole 50 mm fall. The three-axis demand probe ±20 axial/±20 transverse/±50 vertical has maximum translation **57.45 mm** before independent rotations. No selected joint, sleeve, gas/water/fire seal or utility has passed it. **Reject rigid casting through the permanent beam and any claim that a flexible joint preserves gravity automatically.** A shallower receiving level, greater available fall, an adjustable accessible transition or different route must be assessed against the actual foul invert and separate court/roof-water duties before connection selection. A covered raceway is not assured dry or a mixed-utility approval.

| Challenge tested | Consequence for the recommendation and construction |
|---|---|
| Long drought / tree growth | Impose adverse differential support motion and growing interface offsets; free soil clearance alone cannot protect arches. Preserve roots, but do not treat a living tree's water uptake as a stable design input. |
| Prolonged wet winter / mature-tree loss | Test soil rise, shaft/beam uplift and water in the void together. No equilibrium time or movement range is forecast here. Wet-tolerant supports must not become a pump-dependent accommodation/service enclosure. |
| One pile anomaly | Half-stiffness case transfers reaction to the neighbour. Logs/integrity/load verification, as-built survey and a calculated redistribution response precede concealment; no local “good” test erases the system demand. |
| Restrained beam uplift / lost void | Zero residual flags contact. Prevent concrete overspill, retained temporary supports, debris, landscaping and root infill from becoming an accidental ground bearing. Assess side/shaft uplift separately; no heave pressure is fabricated. |
| Blocked court/primary drain with high receiving water | No discharge into the structural void. Keep the independent court emergency route and passive ground-water policy; if the only escape floods or requires a pump, reject that site/level arrangement. |
| Wet-season concrete/pile work | Verify actual strata/roots/water, installation and anomalies, reinforcement/cover/ports, full free gap, concrete identity/placement/consolidation/curing and initial benchmarks at the existing delivery hold points. Cube strength alone proves none of the moving-ground interfaces. |

Costs remain qualitative: G1/G3 require more design, specialist installation, testing, reinforcement and movement detailing; G2/G4 can offer simpler continuous trade but incur excavation/root/heave exposure; G5 pays for visible access and level change. No quotations, material quantities or net lifetime savings exist. First price the same actual load/ground/section with rig/platform, excavation/spoil, protected roots, concrete/steel, temporary formwork recovery, testing and renewal access; avoid comparing only cubic metres of concrete.

## Completion boundary and existing assurance routes

The pre-site option investigation now contains a reasoned comparison, source-bound foundation routing, representative scaled wall/court/internal interfaces, explicit support/heave/anomaly sensitivities, a longitudinal moving-service failure, a synthetic tree-constrained reroute and construction/fault dispositions. **No further generic foundation essay or second brief is required to repeat that comparison.** Its recommendation is conditional and its joined section is adverse, so it supplies constraints to STR-HOUSE/STR-RECONCILE rather than a passed structural candidate.

The following are **acceptance dependencies for a particular design/use**, carried through the existing owners and registers, not new parallel gates:

| Missing evidence | Decision it prevents / route / latest resolution |
|---|---|
| Actual support/reaction system, masonry/arch criteria, EI/cracked stiffness, bearing/ties and movement response | STR-HOUSE then STR-RECONCILE; BCR-003 and ER-STR-01. Resolve before adopting the dependent structural grid/openings, not by waiting until construction. |
| Joined floor support, DPC/vent/thermal/air/gas/water details and full constituents | MAT-ENVELOPE with STR/IAS/OAS and BCR-016. Resolve before floor/wall-base/threshold selection. J1/J2/J3 mark the present physical gaps; no material exception is approved. |
| Real survey, strata/chemistry, trees/roots, moisture/gas/flood and receiving levels, rig and neighbour constraints | DPL-COMMISSION / DPL-SITE-ASSESSMENT and BCR-002. Resolve before selecting the site-specific foundation, datums, founding depth or receiving connection. |
| Qualified moving joint/port, clearances, seals, retained fall and intervention path | STR/MAT-SERVICES/HAD-BOUNDARY/RWT with DPL receiving evidence; BCR-015/016. Resolve before adopting the crossing and before beam/port fabrication. |
| Construction test plan, appointed verification, installed records and applicable physical findings | Existing DEL/EPR/PHY routes and BCR-002/003/016. Establish the plan before work/concealment and obtain the evidence at its actual hold point. Internal study is not that event. |

## Reproduction and validation

Use Python 3 with the existing house-study renderer **Matplotlib 3.10.8** (the generator rejects another renderer version); numeric mechanics and geometry use the Python standard library. No npm dependency, repository-wide tool or permission changes. `python project/str/studies/ground-interfaces.py --check` verifies exact source-bound JSON and all three deterministic SVGs; omit `--check` only for deliberate regeneration. `--preview` produces disposable PNGs in the host temporary directory.

Checks include analytic zero-coupling behaviour, force equilibrium, uniform-translation invariance and spring-swap symmetry, plus exact source assertions. The final SVGs are rendered and inspected for physical scales, legibility, layer relationships, unresolved contacts and adverse cases. These checks establish the stated arithmetic/representation, not soil behaviour, masonry cracking, capacity, human use or certification. Full canonical repository health is required on the exact PR head in CI, followed by fresh canonical lease publication preflight.

### Evidence checked for this continuation

- **[C]** [England Approved Document C official edition page](https://www.gov.uk/government/publications/site-preparation-and-resistance-to-contaminates-and-moisture-approved-document-c) and [government PDF](https://assets.publishing.service.gov.uk/media/5a8192a0e5274a2e8ab54b5f/BR_PDF_AD_C_2013.pdf), 2004 edition incorporating 2010/2013 amendments; §§4.17–4.20 and 5.5, printed pp27 and29–30. Text directly checked 1 November 2026; MAT retains the visual/source/component review. No historical referenced standard is silently adopted as current.
- **[T]** [Forest Research, Tree roots and trenching](https://www.forestresearch.gov.uk/tools-and-resources/fthr/urban-regeneration-and-greenspace-partnership/practical-considerations-and-challenges-to-greenspace/tree-roots-and-trenching/), directly checked 1 November 2026; physical disturbance and root-risk distinctions only. Its NJUG historical zones are not used to derive the synthetic circle.
- [NHBC official Standards page](https://www.nhbc.co.uk/technical/nhbc-standards), checked 1 November 2026, confirms the 2027 edition applies to relevant foundations begun on/after 1 January 2027. Detailed current chapters require account access; this continuation does **not** represent historical 2025 Table7 as checked current design guidance. The original option reduction retains that dated comparator and its limits.
- [MAT suspended-floor and vent study](../mat/suspended-mineral-ground-floor.md) and its exact data; [MAT wall-base comparison](../mat/envelope-ground-boundary.md); [BCR construction-resolution matrix](../bcr/construction-resolution-matrix.md); [DPL-08C](../dpl/dpl-08c-foul-surface-site-water-interface.md). These preserve assembly evidence and the obligation routes; no owning record is silently cleared here.
