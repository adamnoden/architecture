# HFI-07E — Reference House Finding / Rewind Register

**Packet:** HFI-07E  
**Programme:** [`docs/development/human-factors-low-friction-inhabitation-programme.md`](../../docs/development/human-factors-low-friction-inhabitation-programme.md)  
**Execution plan:** [`docs/development/human-factors-low-friction-inhabitation-execution-plan.md`](../../docs/development/human-factors-low-friction-inhabitation-execution-plan.md)  
**Owning issue:** #195  
**Baseline `main`:** `5fcb20a12b77cdf3d7865c9c5c380d60bec7ae78`  
**Audit inputs:** [`hfi-07a-modelability-coverage.md`](hfi-07a-modelability-coverage.md), [`hfi-07b-approach-ground-floor.md`](hfi-07b-approach-ground-floor.md), [`hfi-07c-stair-upper-floor.md`](hfi-07c-stair-upper-floor.md), [`hfi-07d-object-task-paths.md`](hfi-07d-object-task-paths.md)  
**Question:** which material HFI-07 findings actually reopen Reference House authority, which downstream artefacts depend on those decisions, and which findings must instead remain unresolved or not modelled?  
**Boundary:** mapping and control only. This packet executes no Reference House redesign, changes no HFI target, creates no compiler proof, changes no pattern/doctrine/publication content, and does not treat every downstream projection as architecturally wrong merely because an owning gate is reopened.

---

## 1. Result

HFI-07 closes with **one architectural rewind family**, **one material unresolved comparison**, and a deliberately large set of proof gaps that do **not** become rewinds.

### Rewind authorised

`HFI-RW-01 — principal stair going / complete stair-system comparison`

- finding: `HFI-07C-01 = IMPROVE`;
- narrowest owner: **RH-03**;
- current selected going: **280 mm**;
- adopted HFI preference: **300 mm preferred**, not a statutory cliff or automatic minimum;
- required action: reopen RH-03 only far enough to compare the current stair with a bounded 300 mm-going/full-system alternative and resolve the preference explicitly;
- current 280 mm geometry receives no incumbency advantage;
- 300 mm receives no automatic victory merely because HFI prefers it in isolation.

### Material unresolved comparison — no rewind yet

`HFI-07D-05 — upper sleeping/bathing ↔ ground utility laundry loop`

- state: **UNRESOLVED — MATERIAL TRADE-OFF**;
- the repeated cross-floor carrying burden is real;
- no adopted HFI target says laundry must move upstairs;
- no alternative has yet shown that its human-factor benefit outweighs moisture, noise/vibration, service, failure-geography, replacement, structural and area consequences;
- **no RH gate is reopened by this finding yet**.

### Proof gaps — no rewind

`NOT-MODELLED` findings remain exactly that. They do not become defects merely because HFI would like answers. Door approaches, detailed thresholds, sanitary fixtures, hardware forces, controls, kitchen open states, object swept paths and real-site approach conditions require later source geometry/evidence at the correct owner and resolution.

There were **no HFI-07 `CONFLICT` findings**.

---

## 2. Disposition rule

HFI-07E uses the following control semantics.

| HFI verdict | 07E disposition |
|---|---|
| `PASS` | preserve at the scope actually proved; no rewind |
| `IMPROVE` | identify the narrowest owning RH gate and reopen it for a bounded comparison/correction |
| `CONFLICT` | identify both owners and block unilateral correction until the hard-duty collision is resolved |
| `UNRESOLVED` | preserve a named comparison/research obligation; no geometry rewind until an alternative/target earns one |
| `NOT-MODELLED` | preserve as a representation/evidence gap; do not manufacture geometry or a defect verdict |

A reopened owner and a stale projection are not the same thing.

- **Owner reopened** means the architectural decision is no longer entitled to pass without answering the new evidence.
- **Dependency hold** means a downstream artefact remains an accurate projection/check of the current baseline, but cannot be treated as final with respect to the reopened decision until the owner closes.
- **Regenerate/revalidate on change** means the artefact becomes technically stale only if the owning rewind selects changed source geometry.

This distinction prevents HFI from destroying valid computational/publication work before the architectural comparison has selected a new answer.

---

## 3. Consolidated HFI-07 finding register

| Finding family | HFI-07 result | Narrowest owner / route | 07E disposition |
|---|---|---|---|
| one-level ground-floor topology + all-weather front→rear route | `PASS — TOPOLOGY` | RH-02 / RH-10 | preserve; no rewind |
| entrance-level fallback topology | promising topology; complete mode `NOT-MODELLED` | RH-09/RH-10 + later detailed design | no rewind |
| real-site approach / set-down / gradient | `NOT-MODELLED` / site boundary | real project/site | outside generic RH rewind |
| internal/external detailed thresholds | `NOT-MODELLED` | RH-09 / technical detail | no rewind |
| finished door approaches/swings/clear envelopes | `NOT-MODELLED` | relevant RH interface/detail owner | no rewind |
| current 280 mm principal-stair going | **`IMPROVE`** | **RH-03** | **REOPEN — HFI-RW-01** |
| current stair rise / pitch / `2R+G` at current FFL | `PASS` at stated scope | RH-03 + RH-04 | rederive if rewind changes stair system |
| three-flight / full-landing / no-winder stair family | `PASS — TOPOLOGY` | RH-03 | preserve as comparison starting family, not immutable |
| nominal ≈1000 mm stair width as stairlift evidence | `NOT-MODELLED` | RH-03 / RH-10 claim scope | qualify unsupported compatibility claim; no geometry rewind by itself |
| upper stair→south landing→east gallery→north landing route | `PASS — TOPOLOGY` | RH-03 | preserve unless HFI-RW-01 proves coupled change necessary |
| finished upper door/route usability | `NOT-MODELLED` | later occupied-interface geometry | no rewind |
| upper family-bathroom human-use geometry | `NOT-MODELLED` | later bathroom/interface development | no rewind |
| future through-floor lift reservation | `UNRESOLVED — NO TARGET` | HFI integration / later RH comparison if earned | no rewind |
| grocery macro route | `PASS — TOPOLOGY` | RH-02 / RH-10 | preserve |
| garden-serving macro route | `PASS — TOPOLOGY` | RH-02 / RH-10 | preserve |
| complete loaded grocery/garden sequence | `NOT-MODELLED` | later opening/storage/interface detail | no rewind |
| upper↔ground laundry geography | **`UNRESOLVED — MATERIAL TRADE-OFF`** | RH-02 + RH-03 + service/moisture authority + RH-10 | comparison obligation only; no rewind yet |
| waste / cleaning / care / large-object complete paths | `NOT-MODELLED` | later project/detail/site owners | no rewind |

This register deliberately contains fewer rewinds than open questions. **An audit that turned every missing detail into a rewind would be less rigorous, not more.**

---

## 4. HFI-RW-01 — formal RH-03 rewind

### 4.1 Why RH-03 is the owner

RH-03 selected the principal stair as an architectural system:

- 18 risers;
- three flights of six risers;
- five goings per flight;
- 280 mm going;
- full landings;
- no winders;
- approximately 1000 mm clear-flight target;
- bounded stair-hall reservation and east-side passage;
- coupled upper landing/gallery relationship.

The HFI defect is therefore not owned by a drawing, renderer, publication spread or compiler fixture. Those are projections/checks of RH-03 authority.

**RH-03 is formally reopened for this bounded question.**

### 4.2 Exact rewind question

> Does the complete Reference House stair system perform better if the HFI preferred 300 mm going is adopted, once its coupled plan, section, circulation, structure and architectural costs are made explicit, or does a rigorously compared alternative justify retaining 280 mm?

The comparison must not be reduced to `280 + 20`.

At minimum it must rederive/test together:

1. flight run and total stair reservation;
2. riser count and rise against the controlled first-floor FFL;
3. pitch and `2R+G` consequences;
4. landing geometry and turning sequence;
5. entrance-hall / drawing-room / east-passage fit;
6. upper south-landing / east-gallery connection;
7. headroom once enough section geometry exists;
8. handrail/guard effects on actual clear width where represented;
9. structural trimming/opening consequences;
10. opening/elevation consequences if the stair footprint or section moves;
11. carrying/reduced-attention conditions that motivated the HFI preference;
12. area and architectural proportionality.

The current three-flight/full-landing/no-winder family is the **first comparison case** because it already performs well. It is not protected if the full-system comparison proves another arrangement materially better.

### 4.3 What the rewind is not

HFI-RW-01 does **not** authorise:

- widening the house;
- consuming the courtyard;
- deleting the service hub merely to buy stair length;
- introducing winders simply to recover plan area;
- declaring 300 mm a statutory minimum;
- changing floor-to-floor height solely to make a preferred going convenient;
- treating a nominal 1000 mm flight width as proof of stairlift compatibility;
- installing or reserving a lift without the separate life-course comparison;
- patching only the SVG/compiler/publication representation.

---

## 5. Downstream dependency / staleness map for HFI-RW-01

### 5.1 Direct owner surfaces — reopened now

| Surface | Relationship | State after 07E |
|---|---|---|
| `docs/reference-house/upper-floor-and-stair-development.md` | RH-03 owning stair decision | **OWNER REOPENED** for HFI-RW-01 |
| `docs/reference-house/upper-floor-and-stair-development.svg` | RH-03 visual projection | **DEPENDENCY HOLD** |
| `docs/reference-house/stair-courtyard-section.svg` | explicit stair sectional projection | **DEPENDENCY HOLD** |
| `docs/reference-house/stair-ground-floor-overlay.svg` | explicit stair/ground-fit projection | **DEPENDENCY HOLD** |

The current files remain valid records of the presently selected 280 mm house until the rewind chooses otherwise. They may not be cited as proof that the HFI going preference has been discharged.

### 5.2 Coordinated RH authority — recheck only where the comparison propagates

| Surface / gate | Why it may be affected | Required treatment |
|---|---|---|
| RH-04 plan/section/elevation coordination | owns +3300 first-floor datum and opening composition coupled to stair section | keep authority; recheck only if RH-03 alternative alters coupled section/opening geometry |
| RH-05 structure | stair trimming/opening is a bounded structural interruption | recheck only if footprint/opening changes |
| RH-10 whole-house coordination | carries stair as principal circulation and whole-house access narrative | refresh affected coordination claims after RH-03 closes |
| RH-11 review boundary | external review package must not review a knowingly superseded stair | update handoff if selected stair changes |

No blanket RH-04→RH-11 reopening is authorised. Only affected dependencies move.

### 5.3 Canonical computational fixture — dependency hold now; regenerate on selected change

`docs/reference-house/model-baseline-rhc0.md` explicitly freezes:

- `RHCF-STAIR-G = 280 mm`;
- five goings per flight;
- `RHCF-STAIR-RUN = 1400 mm`;
- derived rise / `2R+G` / pitch;
- stair width, box and passage planning assumptions.

It therefore enters **DEPENDENCY HOLD** for the HFI-RW-01 decision.

If RH-03 selects changed source geometry, the correct sequence is:

1. update the owning RH-03 authority;
2. update/re-freeze the affected RH-C0 canonical facts and derived dependency map;
3. regenerate RH-C1 from that canonical source;
4. run existing regression suites;
5. revalidate only downstream computational views whose inputs changed.

Do **not** edit generated RH-C1 geometry first.

The directly stair-bearing deterministic projections include:

- `docs/reference-house/rhc1-ground-floor.svg` where stair footprint is shown;
- `docs/reference-house/rhc1-first-floor.svg` where stair/landing geometry is shown;
- `docs/reference-house/rhc1-principal-section.svg` where stair section is shown.

RH-C2/RH-C3/RH-C4 are not declared stale wholesale. Their bounded topology should be rerun normally after any canonical source change, with correction only where a changed stair actually affects structure/services/boundary relationships.

### 5.4 RH-C5 numeric correspondence

RH-C5 currently checks the canonical 280 mm stair against the selected Approved Document K numeric method and returns `PASS` for its bounded method correspondence.

HFI does **not** invalidate that method or retroactively turn the current RH-C5 result into a regulatory failure. The current 280 mm value remains inside the represented Approved Document K range.

However, RH-C5 consumes the same canonical stair. Therefore:

- if RH-03 changes the stair, **rerun RH-C5 on the new derived values**;
- if RH-03 ultimately retains 280 mm after the full-system HFI comparison, no fabricated C5 change is required;
- RH-C5 must never be used to answer the separate HFI question `legal/guidance correspondence = therefore preferred human-factor geometry`.

### 5.5 Publication / DRW projections

The current drawing programme now includes the physically proved DRW-05E principal-section spread. Its renderer, true-scale proof, typography and spread composition are not defective.

But any controlled publication drawing that geometrically projects the selected stair is downstream of RH-03. This includes, as applicable:

- `docs/reference-house/publication-ground-floor-plan.svg`;
- `docs/reference-house/publication-first-floor-plan.svg`;
- `docs/reference-house/publication-principal-section.svg`;
- their controlled DRW scene/projection inputs and generated spread proofs.

Disposition:

- **do not reopen DRW-03C.2 typography or DRW-05E physical-layout proof merely because RH-03 is under review**;
- if HFI-RW-01 changes source geometry, regenerate the affected controlled drawing from the updated architectural source and rerun the existing physical proof/regression path;
- if RH-03 retains the current geometry after explicit comparison, the existing drawing geometry remains current.

This is a source-authority rewind, not a drawing-system defect.

---

## 6. Unsupported stairlift-compatibility claim — scope correction, not geometry verdict

HFI-07C found that nominal ≈1000 mm stair width is insufficient evidence for a stairlift-compatibility claim.

A credible claim would require enough represented geometry for at least:

- handrail/guard envelopes;
- equipment rail/chair family;
- parking and transfer at ends;
- door conflicts;
- residual ordinary-stair route;
- power/interface provision.

Those facts are not currently modelled.

Therefore HFI-08 integration must ensure any RH-03/RH-10/public wording is no stronger than the evidence. The correct state is **`NOT-MODELLED`**, not “incompatible” and not “compatible because 1000 mm”.

This does not itself authorise a wider stair, installed stairlift, lift reservation or another RH rewind.

---

## 7. Laundry — unresolved comparison ledger, explicitly not a rewind

The laundry finding crosses several owners because the burden and the benefits sit in different systems:

| Concern | Relevant owner/domain |
|---|---|
| ground utility geography | RH-02 / current ground programme |
| upper sleeping/bathing/linen geography | RH-03 / later RH-06 correction |
| wet services / leak / replacement geography | RH-06 / service strategy |
| noise/vibration / whole-house coordination | RH-10 + later specialist evidence |
| repeated human task burden | HFI-03D / HFI-07D |

This is exactly why 07E refuses a premature gate rewind.

The later comparison should first test low-disruption alternatives—collection, clean-linen/storage, set-down/staging and task handoff—before major wet-utility relocation. If a represented alternative later earns a material architectural change, it must then be routed to the narrowest owning RH gate and all genuine dependencies updated.

Until then:

**`HFI-07D-05 = UNRESOLVED — MATERIAL TRADE-OFF; NO REWIND AUTHORISED`.**

---

## 8. `NOT-MODELLED` backlog — proof obligations, not latent defects

The following HFI questions remain open without reopening present architecture:

- real-site route, set-down and approach gradient;
- principal entrance and garden/courtyard threshold assemblies;
- finished clear door openings, approaches, swings and corner manoeuvres;
- sanitary fixture, assistance, dry-staging and support-capable geometry;
- hardware grip/force/one-handed operation;
- lighting/heating/ventilation/shade/fault-control action sequences;
- kitchen open-state appliance/work-surface geometry;
- fixed storage reach/bending geometry;
- large-object swept paths;
- detailed laundry/waste/cleaning/care event chains;
- stair handrail/headroom/stairlift-detail claims not represented by current source;
- any future through-floor lift proposition.

These items are carried forward under the HFI-07A representation lock:

> **absence of proof is a demand for the right future proof, not permission to invent a present defect.**

No new compiler family is earned merely to eliminate `NOT-MODELLED` labels.

---

## 9. Authority and maturity consequences

HFI-07E changes **control state**, not house geometry.

It does:

- formally reopen RH-03 for `HFI-RW-01`;
- establish the exact stair-system comparison boundary;
- identify direct and conditional downstream dependencies;
- preserve the laundry loop as a named unresolved material trade-off;
- prevent unsupported stairlift-compatibility wording from outrunning represented evidence;
- prevent `NOT-MODELLED` items becoming synthetic defects.

It does **not**:

- select 300 mm going;
- supersede the current 280 mm geometry yet;
- change shell, courtyard, rooms or stair geometry;
- relocate laundry;
- add a lift/stairlift;
- change a doctrine, pattern or HFI target;
- change RH-C5's encoded Approved Document K method;
- invalidate DRW-03C.2 / DRW-05E rendering and physical-proof work;
- promote Reference House or compiler maturity;
- claim external validation.

The present Reference House remains the current controlled baseline **with RH-03 explicitly reopened at HFI-RW-01**.

---

## 10. HFI-07 gate closeout

The adversarial Reference House audit has now done what it was intended to do:

- it found one represented architectural condition worth reopening;
- it refused to manufacture ground-floor defects from absent detail;
- it separated a real domestic-task burden from an unearned remedy;
- it kept legal/guidance correspondence separate from project preference;
- it mapped computational/publication dependencies without confusing projection with ownership.

HFI-07 is therefore complete once this packet merges.

`HFI-07E → baseline 5fcb20a12b77cdf3d7865c9c5c380d60bec7ae78 → consolidate HFI-07 verdicts + map owning RH gates/downstream dependencies → one formal rewind HFI-RW-01 owned by RH-03; laundry retained UNRESOLVED; NOT-MODELLED gaps remain non-rewinds → RH-03 reopened for bounded full-system stair-going comparison; dependent RH-C0/RH-C1/RH-C5/publication/DRW surfaces held for propagation only if selected geometry changes → no geometry/maturity change in 07E → exact next packet HFI-08A — upstream architecture`

**Exact next packet:** **HFI-08A — upstream architecture.**
