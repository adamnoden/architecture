# HFI-00B — Controlled Human-Factors Baseline

**Packet:** HFI-00B  
**Programme:** [`docs/development/human-factors-low-friction-inhabitation-programme.md`](../../docs/development/human-factors-low-friction-inhabitation-programme.md)  
**Execution plan:** [`docs/development/human-factors-low-friction-inhabitation-execution-plan.md`](../../docs/development/human-factors-low-friction-inhabitation-execution-plan.md)  
**Owning issue:** #195  
**Frozen `main`:** `ba594718d12776c733a007b8162479ce391e084b`  
**Question:** what exact human-factors-sensitive Reference House state exists before HFI researches, classifies or proposes any stronger target?  
**Boundary:** baseline freeze only. No new design conclusion, preferred dimension, doctrine, pattern, Reference House correction, publication change or computational expansion is authorised here.

---

## 1. Freeze rule

HFI-00B freezes what the project currently says and what the current executable source currently represents.

It does **not** decide whether those facts are ergonomically sufficient.

Three classes remain separate:

1. **architectural intent / gate authority** — what RH-02, RH-03, RH-09 and RH-10 deliberately select or require;
2. **executable source / derived fact** — what the controlled Reference House fixture and derivation actually encode;
3. **unproved or unresolved obligation** — matters explicitly left to later technical, site or external review.

A current fact is not an HFI target merely because it is frozen here. Existing geometry receives no incumbency advantage in later research or audit.

---

## 2. Lease restart and pre-freeze correction

HFI-00B initially began from HFI-00A merge commit `80d975f2d94c75aabc93ba72bf0e3ff2ae4c584b` while DRW-04A.1 / PR #200 was still open.

Before the baseline could close, PR #200 merged as `ba594718d12776c733a007b8162479ce391e084b`. That merge changed the exact first-floor source HFI-00B was attempting to freeze, so the first pass was discarded and the baseline was recomputed from the new `main` rather than waived.

DRW-04A.1 is therefore **inside** this baseline, not a later HFI finding. It restores positive-width continuity for the already-authored route `south stair/landing → east gallery → north cross-landing` by adding bounded provisional turning fields and two explicit required adjacencies. It does not establish a human-factors target or technical stair adequacy.

Pre-freeze correction provenance:

- PR #200 head: `2b14aeafd34f9e38b57c08ca332a00c78694b1bd`;
- merged `main`: `ba594718d12776c733a007b8162479ce391e084b`;
- durable DRW record: `docs/publication/architectural-drawing-drw04a1-upper-circulation-continuity.md`;
- record blob: `2d1e8fd852c55a8694d0aeb6438863820c8ab5cb`.

---

## 3. Frozen source identities

All identities below are blobs at frozen `main` `ba594718d12776c733a007b8162479ce391e084b`.

| Role | Path | Blob SHA |
|---|---|---|
| HFI authority map | `project/hfi/hfi-00a-authority-map.md` | `e2a5625382b9a1faf81c4e54df87ae31d59637e9` |
| RH-02 ground-floor authority | `docs/reference-house/ground-floor-development.md` | `97aa878a45ab6b7acf8c87cd5eea83d1a205cbf4` |
| RH-03 stair / upper-floor authority | `docs/reference-house/upper-floor-and-stair-development.md` | `d463ca19d2d1da4e312ec12d2429f9e159472c07` |
| RH-09 occupied-interface authority | `docs/reference-house/tectonic-integration-rh09.md` | `2a795a1101ff6405e8783da8a3c87f7510c2e6f4` |
| RH-10 whole-house / visitability authority | `docs/reference-house/whole-house-coordination-audit.md` | `13f740d2616ba02d256ee89b7bd38ee6a893b935` |
| current integrated RH summary | `docs/reference-house/README.md` | `8c8b76f8f32d6a5433ad19df08592cbb7fa4cf58` |
| selected RH pattern occurrences | `docs/reference-house/pattern-occurrence-register.md` | `10845149d38d4da94bceb75afe498afd8faf00c0` |
| DRW-04A.1 correction provenance | `docs/publication/architectural-drawing-drw04a1-upper-circulation-continuity.md` | `2d1e8fd852c55a8694d0aeb6438863820c8ab5cb` |
| executable RH fixture | `compiler/reference-house/fixture.ts` | `8bce8f39b48873395be3922005890cc0f6dc06fa` |
| executable RH semantic model | `compiler/reference-house/model.ts` | `f640235105c1e77937f0b958536c969e22c61044` |
| executable plan adapter | `compiler/reference-house/plan-adapter.ts` | `fa7cff692ecbeb5f4fc54c6a652cb80253af538e` |
| executable RH derivation | `compiler/reference-house/derive.ts` | `4cbafd4706470caf602d69d231834a584182faf0` |
| generic calculation execution semantics | `compiler/calculation-slice/compile.ts` | `fad902c9c1878101eb01e9b3e99f115899e57774` |
| RH-C5 selected stair method | `compiler/rhc5/method.ts` | `7500f292e9b24b0dc89227c1a815514174b8f968` |
| RH-C5 proof boundary | `compiler/rhc5/proof-boundary.ts` | `07753896a904fa1eeda0e7bb07208522f63a83fd` |
| RH-C5 reader explanation | `compiler/rhc5/README.md` | `5d3532d3e07e54936ca7ad6f9b8a7fd0865c0862` |

This identity set is the comparison point for later HFI rewinds. Later source changes can state exactly what they supersede rather than reconstructing the old state from memory.

---

## 4. Ground-floor architectural baseline

### 4.1 Shell and court

The controlled Reference House remains:

- shell: **12,000 × 10,800 mm**;
- centred open court: **3,600 × 4,000 mm**;
- court coordinates: X **4,200–7,800 mm**, Y **3,400–7,400 mm**;
- gross side wings: **4,200 mm**;
- gross front/rear wings: **3,400 mm**.

RH-02 selected the G1 one-sided-gallery ground-floor order. RH-03 later superseded one local plan fact: the front drawing-room / hall boundary shifts from approximately X 4,200 mm to approximately **X 4,000 mm** so the principal stair and arrival can coexist.

The executable fixture carries that later correction as provisional source fact `RHCF-HALL-WEST = 4000 mm`.

### 4.2 Current executable room / route reservations

| ID | Current executable reservation | Status relevant to HFI |
|---|---|---|
| `G-DRAW-02` | west/front composite field; front edge terminates at X 4,000 mm, west court-side continuation to X 4,200 mm | provisional plan geometry |
| `G-FAM-02` | X 0–4,200; Y 5,000–10,800 | provisional plan geometry |
| `G-HALL-02` | X 4,000–7,800; Y 0–3,400 | provisional plan geometry; principal arrival / stair field |
| `G-STUDY-02` | X 9,100–12,000; Y 0–3,400 | frozen RH-C1 reservation |
| `G-GAL-01` | X 7,800–9,100; Y 0–7,400 | frozen RH-C1 gross gallery/service-access field |
| `G-SVC-02` | X 9,100–12,000; Y 3,400–7,400 | frozen RH-C1 gross service-suite field |
| `G-GARDEN-02` | X 4,200–7,800; Y 7,400–10,800 | frozen RH-C1 garden-dining field |
| `G-KIT-02` | X 7,800–12,000; Y 7,400–10,800 | frozen RH-C1 kitchen field |

`G-GAL-01` is therefore **1,300 mm gross in X** in the executable fixture. This is not a 1,300 mm clear-circulation target. RH-02 explicitly leaves detailed clear gallery width unresolved between roughly 1.10, 1.15 and 1.20 m pending walls, doors and joinery.

### 4.3 Movement intent

RH-02/RH-10 currently distinguish:

- principal architectural sequence: entrance → courtyard address/view → garden dining → garden;
- ordinary all-weather route: entrance hall → east inner gallery → kitchen / garden dining → family / garden.

No normal daily route is intended to require crossing the open courtyard.

The route intent is frozen. Detailed door clear openings, cased-opening widths, leaf swings, furniture conflicts and final passage clearances are **not** frozen as solved facts.

---

## 5. Stair and upper-floor baseline

### 5.1 Architectural stair intent

RH-03 selects a principal three-flight stair in the entrance hall with:

- 18 risers total;
- three flights of six risers;
- five **280 mm** goings per flight;
- full landings;
- no winders;
- approximately **1,000 mm** target clear flight width;
- approximately **2.4–2.5 m** planning reservation;
- clear-headroom intent not less than 2,000 mm.

RH-03 originally tested this against a provisional 3,240 mm floor-to-floor datum, yielding 180 mm rises. That datum was explicitly temporary.

### 5.2 Current executable stair source

The controlled fixture owns:

- first-floor FFL: **+3,300 mm** (`RHCF-FFL-1`, controlled);
- riser topology: **18**, grouped `[6, 6, 6]` (`RHCF-STAIR-N`, controlled);
- going: **280 mm** with **5 goings per flight** (`RHCF-STAIR-G`, controlled);
- clear-width target: **1,000 mm** (`RHCF-STAIR-W`, provisional);
- stair reservation: **2,400–2,500 mm** (`RHCF-STAIR-BOX`, provisional).

The executable derivation therefore yields approximately:

- rise: **183.333 mm**;
- flight run: **1,400 mm**;
- intermediate landing datums: approximately **1,100 mm** and **2,200 mm** above ground FFL;
- `2R + G`: **646.667 mm**;
- pitch: approximately **33.215°**.

These are source-derived current facts, not HFI-approved comfort or safety targets.

The executable source does **not** prove detailed landing geometry, balustrades, handrails, tread nosing, guarding, headroom or construction tolerance merely because the topology and arithmetic are represented.

### 5.3 Upper-floor architectural intent

RH-03 intends a three-sided U-shaped circulation system:

1. south stair hall / landing;
2. east courtyard gallery;
3. north cross-landing;
4. no west gallery.

The authored movement sequence is:

`stair → south landing → east courtyard gallery → north cross-landing`.

### 5.4 Current executable upper-circulation state

DRW-04A.1 has now made that authored route representable at planning resolution without changing the shell or courtyard.

The current executable facts are:

- `RHCF-U-SOUTH-TURN-D = 1300 mm`, provisional;
- `UPPER_SOUTH_TURN = 2,100 mm`, derived from court south Y=3,400 minus the 1,300 mm turn depth;
- `U-STAIR-01` retains its main south field X 4,000–7,800 / Y 0–3,400 and gains an east turning field X **7,800–9,100 / Y 2,100–3,400**;
- `U-GAL-02` remains X **7,800–9,100 / Y 3,400–7,400**;
- `U-LAND-N01` retains its north-centre field and gains an east turn X **7,800–9,100 / Y 7,400–8,600**;
- `U-BED-03` and `U-BED-04` are L-shaped around those turning fields;
- `ADJ-U-STAIR-GAL` and `ADJ-U-GAL-LAND` are explicit required adjacencies.

The two turns therefore have positive-width shared edges with the east gallery rather than mathematical corner contacts.

Authority remains deliberately narrow:

- the south turn is **provisional-but-representable** planning geometry;
- the 1,300 mm depth was selected to restore the authored route and match the current gallery-width field;
- the north turn uses the existing 1,200 mm north-landing depth;
- no internal door positions, door leaves/swings, new courtyard openings, stair strings/guards, service geometry or technical circulation-compliance claim were authored by DRW-04A.1.

HFI-00B therefore freezes this correction as current source. It does not infer that either turning field is sufficiently generous under future HFI scenarios.

### 5.5 Current upper programme relevant to HFI

The integrated/executable state contains four upper bedrooms, `U-BATH-01`, the south/east/north circulation family and dry dressing/linen territory.

The earlier remote principal en-suite proposition recorded in RH-03 was rejected downstream; current integrated authority uses that territory for dry dressing / linen / storage rather than restoring a second remote wet stack.

---

## 6. Occupied-interface baseline — RH-09

### 6.1 Controls and accessories

Current RH-09 positions are:

- ordinary socket outlets are **not** placed in the skirting;
- switches/socket-outlets for lighting and other equipment currently inherit the **450–1,200 mm above finished floor** band from Approved Document M guidance;
- distribution may remain low level behind removable skirting, with a known vertical rise bringing accessories/controls to an accessible position;
- selected door surrounds may host a switch/control near the room entrance where that route is genuinely useful;
- no exact HFI control position, operating force, mapping or action-sequence rule has yet been derived.

### 6.2 Internal thresholds

Where the same floor build-up genuinely continues through an internal doorway:

- use **no decorative threshold strip**;
- introduce a threshold only where construction, wear, movement or environmental duty genuinely changes.

This is a current Reference House selection, not yet a universal HFI rule.

### 6.3 External courtyard / garden thresholds

Current direction is:

- substantially flush architectural expression;
- threshold resolves internal datum, replaceable doorset, paving/drainage, movement, weathering and accessibility together;
- exact level-access, drainage and weathering geometry remains unresolved technical-design work.

### 6.4 Door/interface state

Doorsets in permanent openings use:

`permanent opening → declared fixing/adjustment zone → replaceable doorset → removable architrave`.

RH-09 does not yet freeze final clear-opening widths, operating forces, handle/lock geometry or swing/use sequences.

---

## 7. Visitability and life-course baseline — RH-10 / integrated RH

Current whole-house human-factors assumptions are deliberately modest.

### 7.1 Entrance storey

- the ground floor is **intended to remain step-free internally**;
- principal entrance approach and threshold should be step-free where the real site permits the normal Approved Document M solution;
- entrance-storey habitable rooms and `G-WC-01` remain on one level;
- door and passage widths must be checked together rather than treated as independent pass/fail values;
- the ground WC must retain its required access zone and outward-opening door geometry;
- if WC access conflicts with utility storage/appliance convenience, **utility yields area first** rather than expanding the shell automatically;
- RH-09 accessory/control positions remain in the accessible reach band rather than being placed in skirting.

### 7.2 Entrance threshold

The selected principal-entrance occurrence `RH-P020-02 / TH-02` is intended to be:

- substantially level;
- weathered;
- replaceable;
- architecturally consistent with the entrance hierarchy.

Real approach levels, gradient, parking/set-down and pavement/site conditions remain absent because the Reference House has no real site.

RH-10 therefore records the visitability state as **spatially credible; site-level proof outstanding**.

### 7.3 Life-course provisions currently claimed

The integrated Reference House summary additionally records:

- substantially level access intent at entrance level;
- a credible future entrance-level sleeping-room option;
- service-suite sanitary space intended to remain capable of WC/basin plus a potential level-access shower without enlarging the shell;
- stair width preserving a lower-burden future stair-lift option.

These are adaptation provisions only. They are **not** a claim of whole-dwelling wheelchair usability/compliance and have not yet been tested through the HFI scenario/proportionality method.

---

## 8. Pattern-occurrence baseline

The current RH occurrence register places `Designed Threshold` at:

- the principal entrance; and
- garden/courtyard external openings.

Its current implementation direction is **substantially level, quiet interfaces** whose weathering, wear, movement and replacement duties remain explicit.

Outstanding proof remains:

- real-site approach levels;
- drainage/weathering;
- doorset integration;
- accessibility proof.

Occurrence is not general evidence for `Designed Threshold` and is not an HFI target.

---

## 9. RH-C5 calculation baseline

### 9.1 Method identity and authority

The frozen method is:

- method ID: `ADK-2013-PRIVATE-STAIR-GEOMETRY`;
- version: `1.0.0`;
- authority kind: `statutory-guidance`;
- jurisdiction: England;
- document: *Approved Document K: protection from falling, collision and impact*;
- edition: 2013 edition;
- paragraph/table: paragraph 1.3 / Table 1.1;
- source checked: 2026-10-13;
- applicability: England / dwelling / private stair.

### 9.2 Encoded criteria

RH-C5 checks only:

- rise: **150–220 mm inclusive**;
- going: **220–300 mm inclusive**;
- pitch: **≤ 42°**;
- `2R + G`: **550–700 mm inclusive**.

The method consumes canonical derived Reference House stair values. It does not own a second stair geometry.

### 9.3 Claim boundary

The method claim is only that the represented rise, going, pitch and `2R + G` values correspond to the selected Approved Document K numeric guidance values for the research fixture.

Explicit non-claims include:

- Building Regulations compliance;
- Requirement K1 compliance as a whole;
- release-grade compiler-target applicability / transition basis;
- headroom adequacy;
- landing geometry adequacy;
- handrail or guarding adequacy;
- construction tolerance / workmanship compliance;
- accessibility compliance;
- fire / means-of-escape compliance.

The frozen proof boundary remains:

```text
SELECTED NUMERIC METHOD CORRESPONDENCE  MACHINE-CHECKED
APPROVED-DOCUMENT GUIDANCE COVERAGE     BOUNDED-METHOD-ONLY
RELEASE-GRADE COMPILER TARGET           NOT-ESTABLISHED
BUILDING REGULATIONS COMPLIANCE         NOT-PROVED
WHOLE-BUILDING TECHNICAL ADEQUACY       EXTERNAL-NOT-PROVED
```

### 9.4 Execution semantics relevant to HFI

The generic calculation slice:

- returns `UNSUPPORTED` for absent inputs, wrong units, non-finite values, invalid method definitions or applicability mismatch;
- gives `UNSUPPORTED` precedence over simultaneous failing criteria;
- otherwise returns `FAIL` if any represented criterion fails, else `PASS`.

A future stronger Ovid’s House stair target must therefore be a **separate architectural/evidence proposition**. HFI is not authorised to edit this external method merely to make the existing Reference House pass or fail a new preference.

---

## 10. Known absences frozen with the baseline

HFI-00B deliberately does not pretend the present model contains facts it does not contain. Material absences include:

- real-site entrance approach levels / gradients / set-down / parking;
- final clear door openings and operating forces;
- complete door-swing / furniture / radiator conflict geometry;
- representative furniture or white-goods swept paths;
- final corridor clear widths after finish/joinery/ironmongery conflicts;
- detailed stair tread/nosing/handrail/guard/headroom geometry;
- final internal door positions around the corrected upper U-route;
- shower/bath control positions and action sequences;
- final bathroom fixture/assistance/transfer geometry;
- final kitchen fixed-use clearances;
- quantified future stair-lift installation envelope;
- whole-dwelling wheelchair-usability geometry;
- HFI scenario classifications, percentile choices, target classes or preferred project dimensions.

These absences belong in HFI-00C as inventory/research questions where relevant. They are not defects merely because they are absent from the current virtual model.

---

## 11. Supersession / provenance notes

### B00B-01 — RH-02 hall field vs later RH-03/fixture

RH-02 records `G-HALL-02` as X 4.2–7.8 m. RH-03 explicitly moves the front drawing/hall boundary approximately 200 mm west, and the executable fixture uses X **4.0–7.8 m** for the front hall/stair field.

**Controlling baseline:** later RH-03 / executable source for this local boundary; RH-02 remains owner of the larger ground-floor room order.

### B00B-02 — RH-03 3,240 mm test datum vs current 3,300 mm FFL

RH-03’s 180 mm rise is tied to an explicitly provisional 3,240 mm test datum. The controlled fixture uses +3,300 mm first FFL and derives approximately **183.333 mm** rise.

**Controlling baseline:** current executable source/derived value for RH-C5 and downstream geometry; RH-03 retains architectural stair topology/intent.

### B00B-03 — RH-03 U-route intent and DRW-04A.1 executable correction

RH-03 authors a continuous south → east → north upper route. The pre-DRW executable fixture represented the two turns only as corner contacts. Before this HFI freeze, DRW-04A.1 repaired that source contradiction by adding provisional positive-width turning fields and compiler-enforced route adjacencies.

**Controlling baseline:** merged DRW-04A.1 executable geometry at `ba594718…`, with its explicitly provisional planning authority. The pre-correction corner-contact state is provenance, not current HFI baseline.

### B00B-04 — RH-03 en-suite proposal vs later integrated deletion

RH-03 carries an en-suite proposition conditionally. Later service/whole-house coordination rejects the remote wet condition and current fixture/integrated authority uses dry dressing/linen/storage instead.

**Controlling baseline:** later integrated dry use.

---

## 12. What HFI-00B does not establish

This baseline does **not** establish that:

- the 280 mm going is the correct HFI stair target;
- 1,000 mm stair width is sufficient or optimal;
- the 1,300 mm south turn is an HFI circulation target;
- the 1,200 mm north turn is sufficiently generous;
- the current ground gallery is generous enough;
- current room/furniture claims survive representative human/object scenarios;
- 450–1,200 mm is an Ovid’s House control-placement target rather than present regulatory/guidance inheritance;
- “substantially flush” is sufficient threshold specification;
- the M4(1)-level visitability intent is the correct long-term project ambition;
- future stair-lift provision is proportionate;
- any current dimension should survive HFI research;
- any missing geometry should automatically be added to the compiler.

Those questions remain downstream.

---

## 13. Acceptance / restart contract

HFI-00B is complete when:

- the baseline commit and exact source blobs are frozen;
- RH-02 ground plan, RH-03 stair/upper floor, RH-09 occupied interfaces, RH-10 visitability and RH-C5 semantics are represented without upgrading their authority;
- current executable facts are distinguished from authored architectural intent;
- DRW-04A.1 is incorporated because it merged before the final freeze, while remaining clearly non-HFI provenance;
- current unresolved / unmodelled areas are explicit;
- no geometry, target, doctrine, pattern, compiler behaviour or maturity state changes.

Any later HFI packet comparing “before” and “after” may use this file as the HFI baseline index, but original owning sources remain authoritative for the meaning of each fact.

---

## 14. Authority / maturity consequences

**None.** HFI-00B adds only an internal controlled baseline.

- Ovid’s House doctrine: unchanged.
- Pattern language: unchanged.
- Reference House: unchanged at M3 virtual-design scope.
- Computational track: unchanged at bounded M4 scope.
- DRW/publication: unchanged by HFI-00B.
- Delivery: unchanged.
- HFI does not gain a separate maturity row.

---

## 15. Exact next packet

**HFI-00C — friction register + completeness proof.**

Inventory current project claims, known annoyances, missing geometry and unmodelled questions against this frozen baseline. Assign owner and evidence state to each entry, and distinguish user-triggered friction from established project defect. Do not prescribe solutions in HFI-00C.