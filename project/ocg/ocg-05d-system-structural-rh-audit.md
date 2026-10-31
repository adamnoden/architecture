# OCG-05D — Reference House system-upgrade / structural-control occupied-change audit

**Programme:** OCG — Occupied Change  
**Parent:** #604  
**Packet:** #611  
**Common audit baseline:** OCG-05A merge `6c75c2d9c24faab61a2bd850ba56c70d2f6104fe`  
**Scenarios:** CI-11…CI-13  
**State:** controlled RH audit; no design response authorised

## 1. Method

This packet applies the exact OCG-05A proof boundary. System renewal and structural replanning are deliberately harder tests than local component replacement. The audit must distinguish:

- an architecture that has left coherent replacement geography;
- a model that does not know future products/systems;
- and a major alteration that correctly remains disruptive because it attacks slow fabric.

Primary RH authorities:

- `docs/reference-house/service-topology-rh06.md`;
- `docs/reference-house/service-crossing-register-rh06.md`;
- `docs/reference-house/structural-coordination.md`;
- `docs/reference-house/energy-heat-coordination-rh10.md`;
- `docs/reference-house/pattern-occurrence-register.md`;
- `docs/reference-house/whole-house-coordination-audit.md`;
- `docs/reference-house/external-access-maintenance-plan.md`.

CI-13 is a control case. It must not be made favourable by inventing a transfer structure, removable loadbearing wall or permanent temporary-works provision.

---

# 2. CI-11 — renew primary electrical distribution

## Represented starting condition

RH-06 selects a segregated dry distribution field in `G-PLANT-01`, a ground dry route through the service suite / gallery and selected low-level/perimeter routes, a dry vertical sub-zone of `SV-01`, and an upper route through `U-GAL-02` / landings with local branches into bedroom partitions/perimeter service zones. Primary dry trunks are explicitly not routed through the structural joist depth.

The house also selects a Physical Service Index / stable service identities as a stewardship aid, while preserving physical legibility as the primary condition.

## Proof units

| Family / sequence | Consequence | Evidence / finding | Owner / nonclaim |
|---|---|---|---|
| B — identify/disconnect trunk | service + fabric | **PROVEN** at topology level — the primary dry network has coherent hub, vertical and horizontal service geography outside the protected primary floor structure | does not prove final containment/cable sizing |
| B/A — remove old / pull new | fabric + logistics | **NOT_REPRESENTED / OWNER_PROOF_REQUIRED** — conduit/tray geometry, bend radii, cable fill, pull points, fire stopping and live congestion are not controlled strongly enough to prove end-to-end renewal | electrical/fire/detail |
| F — isolate/temporary supply/test | service + occupancy | **OWNER_PROOF_REQUIRED + DELIVERY_METHOD_REQUIRED** — safe isolation, temporary power strategy, test/commission and circuit migration are technical/method facts | electrician/delivery |
| C — access/reclose | recovery | **PARTIAL** — route concentration should localise opening/reclosure, but exact closures, fire/acoustic seals and decorative boundaries are not universally represented | detail |
| G — occupied renewal | occupancy + work | **DELIVERY_METHOD_REQUIRED** — staged outages, protection, noise/dust and room-by-room migration depend on work packaging | delivery |

## Finding

The RH positively avoids one of the common causes of destructive electrical renewal: primary distribution embedded indiscriminately in slow structure. It does not prove that an eventual cable system can be renewed wholesale through the represented topology.

A future technical design must prove actual pullability/containment and fire/acoustic reclosure without converting the current architectural route into a generic oversized service plenum.

**No `DEFECT_CANDIDATE`.**

---

# 3. CI-12 — renew or materially upgrade primary space-heating system

## Represented starting condition

RH-10 selects an architectural baseline:

`ASHP-01 → G-PLANT-01 DHW/hydraulic equipment → HYD-G-01 / HYD-U-01 → visible/replaceable low-temperature emitter family`.

The external heat source sits provisionally in the service-side working zone beside the plant room. Hydronic distribution launches through service/gallery territory and selected perimeter routes, with joint-minimised concealed runs and accessible joints/valves. Whole-house underfloor heating is explicitly **not** the baseline. The plant room retains the nominal 1000 mm external replacement-opening target.

## Proof units

| Family / sequence | Consequence | Evidence / finding | Owner / nonclaim |
|---|---|---|---|
| A — replace current generation module/cylinder | logistics + fabric | **PARTIAL** — dedicated plant room, service-side heat-source geography and replacement direction are represented | product envelope/mass/handling not proved |
| B — renew current hydronic distribution | fabric + service | **PARTIAL** — coherent ground/upper routes are represented outside primary structural-floor plenum; exact containment/access/renewability is not fully modelled | MEP/detail |
| C — replace emitters | fabric + recovery | **PROVEN** narrowly — the selected baseline deliberately uses visible/replaceable emitters with accessible valves rather than burying active terminals across principal floors | exact brackets/finishes/product remain external |
| F — isolate/drain/recommission | service | **OWNER_PROOF_REQUIRED + DELIVERY_METHOD_REQUIRED** | MEP/delivery |
| G — old/new equipment logistics | logistics | **SITE_PROOF_REQUIRED** for external equipment route/boundary/lifting/staging on a real plot | DPL/site |
| materially different future system | service + fabric | **NOT_REPRESENTED** — the RH does not promise spare geometry for unknown future technologies | future brief/system design |

## Finding

The selected heating family is deliberately replaceable **as the currently selected family**, without pretending that every future heat technology can reuse it unchanged.

OCG therefore distinguishes two claims:

1. **Current-family renewal:** materially supported by concentrated plant + accessible emitter + coherent route architecture, subject to product/detail/site proof.
2. **Arbitrary future system conversion:** not represented and not promised.

Reserving universal future plant volume, buried distribution or redundant interfaces solely for unknown technologies would be speculative future-proofing, not bounded change.

**No `DEFECT_CANDIDATE`.**

---

# 4. CI-13 — major load-bearing-wall replanning control

## Represented starting condition

RH-05/RH-10 select a legible short-span structural ring: external and courtyard masonry support lines, local bounded edge-beam conditions, bounded stair trimmers and registered service crossings. Later envelope work preserves the inner loadbearing masonry leaf as the first structural datum. Services are coordinated around protected structure rather than treating it as an unplanned void.

CI-13 asks for major replanning that attacks a selected loadbearing wall after occupation.

## Proof units

| Family / sequence | Consequence | Evidence / finding | Owner / nonclaim |
|---|---|---|---|
| A/B — identify affected slow fabric/services | fabric + service | **PROVEN** — the loadbearing system and registered service crossings are legible enough to know that this is not a fast-layer intervention | architecture |
| remove/support/rebuild | fabric | **OWNER_PROOF_REQUIRED** — temporary works, load redistribution, foundations/bearings, fire/acoustic/envelope consequences and final structure require structural design | structural engineer |
| maintain occupation | occupancy + safety | **UNKNOWN / DELIVERY_METHOD_REQUIRED** — whether the house can remain partly occupied depends on extent, sequencing, temporary stability, dust/noise and contractor control | engineer/delivery/project |
| service diversions | service | **PARTIAL / OWNER_PROOF_REQUIRED** — existing service geography helps identify crossings, but the proposed replanning is not modelled and may require relocation | MEP/structure |
| contamination/work | work | **DELIVERY_METHOD_REQUIRED** — demolition, cutting, propping and debris are intrinsically high-consequence | delivery |
| close/reinstate/return | recovery | **OWNER_PROOF_REQUIRED + DELIVERY_METHOD_REQUIRED** — structural making-good, finishes, testing and cleaning are substantial and project-specific | design/delivery |

## Finding

**CI-13 is the programme's slow-fabric boundary control.**

A major loadbearing-wall alteration is not a foreseeable fast-layer renewal that the permanent house should be obliged to make painless. OCG would become self-defeating if it required every primary wall to be demountable, every span to carry speculative transfer capacity or every structural bay to support arbitrary future replanning.

The correct result is:

> **ACCEPT_DISRUPTION. Preserve structural legibility and registered service crossings; do not pre-install a universal structural escape hatch.**

The house may still be alterable by competent engineering. OCG does not promise that it remains fully civilised during major surgery to slow fabric.

**No `DEFECT_CANDIDATE`; no structural redesign authorised.**

---

# 5. Cross-scenario consequence synthesis

## Fabric

- CI-11 and CI-12 benefit from deliberate service geography that keeps primary routes out of indiscriminate permanent masonry/joist occupation.
- CI-13 intentionally attacks slow fabric and therefore carries major legitimate fabric consequence.

## Services

- current electrical and heat topologies are coherent enough to locate renewal work;
- exact pullability, isolation, commissioning, fire/acoustic closure and product compatibility remain external technical proof;
- arbitrary future service technologies are not promised.

## Occupancy

- primary electrical/heating renewal can cause whole-house or staged outages even when routes are accessible;
- temporary service continuity belongs to project/delivery planning;
- major structural replanning may make continued occupation inappropriate. OCG does not force occupancy where safety/method says otherwise.

## Contamination/work

- electrical/MEP route work may be locally dirty/noisy;
- structural alteration is intrinsically demolition-heavy;
- architecture is judged on propagation it causes or prevents, not on elimination of unavoidable work.

## Logistics

- plant has a deliberate replacement direction and service-side geography;
- real equipment delivery/lifting requires site proof;
- structural debris/propping routes are project-specific and not a standing house obligation.

## Recovery

- route concentration can reduce redecoration/reclosure territory for system renewal;
- structural replanning has intrinsically large making-good/recovery.

---

# 6. Defect-candidate register

**None.**

CI-11 and CI-12 retain technical proof debt but no represented contradiction. CI-13 positively demonstrates the proportionality boundary OCG needs: **bounded change is not universal reversibility.**

OCG-05D provides no justification for:

- a house-wide access floor;
- universal oversized risers;
- redundant speculative heating interfaces;
- transfer structure sized for arbitrary future wall removal;
- demountable loadbearing wall doctrine;
- contractor simulation or outage-duration scoring.

---

# 7. 05E handoff

Carry forward:

1. live electrical service-zone containment/pullability/fire-acoustic closure proof when technical design exists;
2. plant packing/withdrawal and real-site replacement-route proof shared with 05B;
3. hydronic route/closure/isolation and commissioning proof at later MEP maturity;
4. preserve current visible/replaceable emitter preference as a project selection, not universal doctrine;
5. preserve CI-13 as explicit non-promise / slow-fabric boundary;
6. preserve delivery ownership of temporary service continuity and major-work containment.

**OCG-05D result: audit complete; zero current `DEFECT_CANDIDATE`s; major structural replanning is an accepted high-disruption slow-fabric intervention rather than an OCG failure.**