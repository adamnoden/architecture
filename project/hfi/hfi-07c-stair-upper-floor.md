# HFI-07C — Reference House Stair + Upper-Floor Audit

**Packet:** HFI-07C  
**Programme:** [`docs/development/human-factors-low-friction-inhabitation-programme.md`](../../docs/development/human-factors-low-friction-inhabitation-programme.md)  
**Execution plan:** [`docs/development/human-factors-low-friction-inhabitation-execution-plan.md`](../../docs/development/human-factors-low-friction-inhabitation-execution-plan.md)  
**Owning issue:** #195  
**Baseline `main`:** `6989409a55aad80db5aac2f0f91b3a8360148fcb`  
**Coverage authority:** [`hfi-07a-modelability-coverage.md`](hfi-07a-modelability-coverage.md)  
**Prior audit:** [`hfi-07b-approach-ground-floor.md`](hfi-07b-approach-ground-floor.md)  
**Question:** how does the current Reference House stair and upper floor perform against the frozen HFI target architecture at the resolution actually represented?  
**Boundary:** HFI-07 verdicts only. This packet does not alter RH-03 geometry, redraw the stair, author handrails/doors/bathrooms, decide the future-lift question, create compiler proof, change doctrine/patterns/publication or execute a rewind.

---

## 1. Result in one sentence

The current stair is **mostly strong but misses one deliberately adopted Ovid’s House preference**: its represented **280 mm going earns `IMPROVE` against the HFI-06B preferred 300 mm going**, while its ≈183.33 mm rise, three-flight/full-landing/no-winder topology and derived pitch/`2R+G` system remain sound. The upper circulation topology also passes at planning resolution, but finished clear routes, handrails, headroom, stairlift compatibility, sanitary use and most room-interface questions remain `NOT-MODELLED`.

This is the first HFI-07 material `IMPROVE` finding.

---

# 2. Finding register

| ID | Question / target | Current RH evidence | Verdict | Consequence |
|---|---|---|---|---|
| `HFI-07C-01` | HFI-MOV-STAIR-01 preferred principal-stair going | controlled `280 mm` | **IMPROVE** | compare a 300 mm-going full stair system at the owning RH gate; 280 is not declared unsafe/noncompliant |
| `HFI-07C-02` | HFI-MOV-STAIR-02 preferred rise band `160–185 mm` | 3300 / 18 = ≈`183.33 mm` | **PASS** | retain as a valid preferred-range outcome unless a stair rewind changes system geometry |
| `HFI-07C-03` | HFI-MOV-STAIR-03 rise/going system; derive pitch and retain external method | pitch ≈`33.2°`; `2R+G` ≈`646.67 mm`; existing RH-C5 bounded correspondence passes | **PASS — BOUNDED** | no independent HFI pitch/`2R+G` target invented |
| `HFI-07C-04` | secure ordinary stepping topology / avoid geometry compression into winders | three flights of six rises, five goings/flight, full landings, no winders | **PASS — TOPOLOGY** | preserve unless a better full-system solution earns change |
| `HFI-07C-05` | finished dimensional consistency at repeated treads and landing transitions | topology/arithmetic represented; construction/finish tolerances and finished transitions not | **NOT-MODELLED** | HFI does not infer workmanship from source arithmetic |
| `HFI-07C-06` | continuous graspable support through stair journey | no handrail/guard section, count, continuity or effective-width geometry | **NOT-MODELLED** | no support-interface verdict |
| `HFI-07C-07` | tread-edge/level-transition legibility under domestic lighting | no finish/contrast/lighting state | **NOT-MODELLED** | no perceptual verdict |
| `HFI-07C-08` | clear headroom through complete stair route | `≥2000 mm` intent only; no finished headroom envelope | **NOT-MODELLED** | cannot convert intent into PASS |
| `HFI-07C-09` | usable clear stair width after support/guard envelopes | provisional `1000 mm` clear-width target; rail/guard geometry absent | **NOT-MODELLED** | nominal width is not finished usable width |
| `HFI-07C-10` | HFI-USE-LC-02 genuine stairlift enabling geometry | current narrative claims lower-burden stairlift option; no rail/parking/landing/door/power/residual-use geometry | **NOT-MODELLED** | current claim is not HFI-validated |
| `HFI-07C-11` | future through-floor lift reservation | no selected reservation; HFI-06C created no target and kept question unresolved | **UNRESOLVED — NO TARGET** | carry to later bounded comparison; absence is not an `IMPROVE` verdict |
| `HFI-07C-12` | authored upper route continuity: stair → south landing → east gallery → north landing | explicit positive-width adjacency and represented fields | **PASS — TOPOLOGY** | DRW-04A.1 correction survives HFI at topology level |
| `HFI-07C-13` | effective finished upper route through turns/doors/obstructions | gross 1300 mm gallery/south turn and ≈1200 mm north turn; local doors/finishes/obstructions absent | **NOT-MODELLED** | no clear-route credit from gross fields |
| `HFI-07C-14` | upper bedroom doorway/furniture approach | room reservations exist; internal doors/furniture not represented | **NOT-MODELLED** | no manoeuvre verdict |
| `HFI-07C-15` | family bathroom fixture/transfer/dry-dressing/assistance geometry | `U-BATH-01` gross room only | **NOT-MODELLED** | bathroom label/area is not sanitary task proof |
| `HFI-07C-16` | support-capable sanitary fixing zones | no support-zone/service-conflict map | **NOT-MODELLED** | later architectural/technical detail must prove |
| `HFI-07C-17` | upper circulation dignity/legibility at macro scale | U-shaped route intentionally organised around courtyard and principal stair | **PASS — ROUTE ROLE** | preserve route as architecture, not residual corridor |

---

# 3. Material finding — 280 mm going versus preferred 300 mm

## 3.1 Why this is `IMPROVE`

HFI-06B deliberately adopted:

> **300 mm preferred going for the principal private stair, where the full stair system can accommodate it without creating a stronger conflict.**

The current Reference House is not ambiguously close to an unmodelled target: its going is a controlled **280 mm** source fact.

That makes the comparison legitimate.

The 20 mm difference is also not treated as a legal-style cliff. The verdict rests on the complete target architecture:

- `280 mm` remains within current Approved Document K private-stair guidance;
- it remains inside the HFI-02B credible `275–300 mm` ordinary-domestic comparison region;
- older preference/biomechanical evidence does not establish 280 as defective;
- HFI-05B explicitly said the stronger-going **comparison**, not an automatic geometry change, was proportionate;
- HFI-06B nevertheless selected `300 mm` as the project preference because of additional foot-support/descent margin, particularly for larger feet and reduced-attention conditions.

Therefore the correct result is:

> **`IMPROVE`: test the 300 mm preferred-going stair as a full architectural system.**

It is **not**:

- `FAIL`;
- a regulatory defect;
- evidence that 280 mm is dangerous;
- permission to add 20 mm locally while ignoring landings/headroom/plan/structure;
- permission to protect 300 mm if the full-system comparison exposes a stronger conflict.

## 3.2 Bounded geometric burden

The current stair has **five goings per flight**.

Moving from 280 → 300 mm increases the horizontal run of each flight by:

`5 × 20 = 100 mm`

That is a real but bounded architectural consequence.

Because the stair is three-flight/full-landing geometry inside a compact entrance-hall reservation, even 100 mm per flight can propagate into:

- landing arrangement;
- stair well/guard geometry;
- entrance-hall passage;
- upper south landing;
- headroom and section;
- adjacent room reservations.

Those consequences are exactly why HFI-07C does **not** redraw RH-03 locally.

The finding earns a later RH-03 rewind/comparison; HFI-07E will map ownership and stale downstream artefacts.

---

# 4. Rise and whole numeric system remain strong

The current first-floor datum is `+3300 mm` with 18 equal risers, producing ≈`183.33 mm` rise.

HFI-06B preferred rise band:

**160–185 mm**.

The current rise therefore earns `PASS`.

Likewise:

- `2R+G ≈ 646.67 mm` sits inside the existing external-guidance correspondence method;
- pitch ≈`33.2°` is materially below the external 42° ceiling;
- HFI created no independent preferred pitch or `2R+G` scalar.

The important discipline is that these good derived values do **not** cancel the preferred-going miss by averaging the stair into a score.

If a later 300 mm-going comparison changes riser count or floor geometry, all coupled values must be re-derived together.

---

# 5. Full landings / no winders remain a good architectural choice

The Reference House solved the shallow front-wing problem by using three short flights with full landings rather than compressing the stair into winders/tapered treads.

That choice remains aligned with HFI's evidence and project preference:

- ordinary stepping surfaces stay geometrically simple;
- turning occurs on landings rather than on tapered treads;
- the stair remains a principal architectural element;
- the plan accepted an extra landing rather than buying compactness through more demanding foot placement.

`HFI-07C-04 = PASS — TOPOLOGY`.

The 300 mm-going comparison should therefore begin by preserving the **three-flight/full-landing/no-winder family** unless the RH-03 rewind proves another arrangement is materially better.

---

# 6. Why the nominal 1000 mm width does not pass stairlift or hand-support targets

The current source includes an approximately **1000 mm clear-width target** and describes the stair as preserving a lower-burden future stairlift option.

HFI-06C deliberately hardened that claim:

> **If stairlift compatibility is claimed, prove enough real stair/landing/parking/door/power geometry for a credible equipment-family route while retaining safe ordinary stair use; nominal stair width alone is not proof.**

Current source does not provide:

- actual handrail/guard envelopes;
- stairlift rail position;
- chair/platform parking position;
- transfer space at ends;
- door conflicts;
- residual clear ordinary-stair route;
- power/interface provision;
- a credible bounded equipment family.

Therefore the correct verdict is `NOT-MODELLED`.

This is not a small semantic point. The current public/project narrative must not be read as externally validated stairlift compatibility merely because `1000 mm` sounds generous.

HFI-07E must decide how the unsupported claim is routed back to RH-10/RH-03 authority without overreacting into a universal installed lift.

---

# 7. Upper circulation — topology survives, finished usability remains open

DRW-04A.1 previously corrected the upper route so that:

`stair → south landing → east gallery → north cross-landing`

has positive-width continuity rather than mathematical corner contact.

HFI-07C finds that correction sound at the scope it actually claimed.

The current represented fields include:

- east gallery: **1300 mm gross**;
- south turning field: **1300 mm deep**;
- north turning field: approximately **1200 mm deep**;
- explicit stair↔gallery and gallery↔north-landing adjacency.

This earns `PASS — TOPOLOGY`.

It does **not** prove HFI-MOV-ROUTE-01/DOOR-01 at finished-use resolution because internal bedroom/bathroom doors, leaf swings, local obstructions and finished clear widths are not represented.

As on the ground floor, gross planning fields receive no automatic clear-envelope credit.

---

# 8. Upper bathroom remains below HFI audit resolution

`U-BATH-01` is a real, represented room reservation concentrated over the service geography. That is useful building topology, but it does not represent the human task HFI-04A/06C require.

Absent facts include:

- WC/basin/bath/shower fixture positions;
- approach and transfer zones;
- control-before-spray/hot-water sequence;
- dry reachable staging;
- stable dressing/seat opportunity;
- two-body assistance geometry where claimed;
- support-capable fixing zones and concealed-service conflicts;
- internal doorway approach/swing.

The family bathroom therefore remains `NOT-MODELLED` for HFI sanitary-use verdicts.

No enlargement is inferred or demanded from room area alone.

---

# 9. Future through-floor lift remains unresolved by design

HFI-05B required a **bounded, genuinely buildable low-burden reservation counterfactual** before either universal adoption or rejection of a future through-floor lift route.

HFI-06C therefore explicitly created **no target** and marked `HFI-USE-LC-03 = UNRESOLVED`.

The Reference House currently has no selected future lift reservation.

HFI-07C must not transform that absence into either:

- `PASS` — as though the question had been rejected upstream; or
- `IMPROVE` — as though a lift reservation had been adopted upstream.

The verdict remains:

**`UNRESOLVED — NO TARGET`**.

This survives into later integration work until the required bounded counterfactual is actually performed.

---

# 10. Materiality and rewind consequence

HFI-07C contains one material architectural finding:

**`HFI-07C-01 — current 280 mm going should be compared against the adopted 300 mm preferred target as a full stair system.`**

The narrowest architectural owner is **RH-03** because RH-03 selected the stair topology/going and owns its relation to the entrance hall and upper circulation.

HFI-07C does not itself reopen RH-03. HFI-07E owns the formal finding/rewind register and the stale-downstream map.

Potentially affected downstream surfaces are intentionally **not enumerated here** because 07E must read current `main` and distinguish actual projections of the 280 mm geometry from unrelated stair records.

---

# 11. Authority / maturity consequences

No geometry or maturity changes occur in HFI-07C itself.

The packet:

- records one `IMPROVE` finding;
- preserves several bounded `PASS` findings;
- preserves `NOT-MODELLED` interface questions;
- preserves the no-target future-lift `UNRESOLVED` state;
- does not modify RH-03;
- does not alter HFI targets;
- does not change RH-C5 or its Approved-Document-K proof boundary;
- does not create compiler proof;
- does not change publication content/maturity.

---

# 12. Packet closeout

`HFI-07C → baseline 6989409a55aad80db5aac2f0f91b3a8360148fcb → audit stair + upper floor under HFI-07A proof boundary → current RH-03/RH-10 + executable fixture + HFI-02B/02C/HFI-06B/06C/06D → 280 mm going = IMPROVE against preferred 300 mm; ≈183.33 mm rise + bounded derived system + full-landing/no-winder topology = PASS; upper U-route topology = PASS; finished clear route/handrail/headroom/stairlift/sanitary detail = NOT-MODELLED; future lift = UNRESOLVED/no target → no geometry change yet; material finding awaits HFI-07E RH-03 rewind mapping → exact next packet HFI-07D — object/task paths`

**Exact next packet:** **HFI-07D — object/task paths.**
