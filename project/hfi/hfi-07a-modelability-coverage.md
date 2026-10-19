# HFI-07A — Reference House Modelability / Coverage Audit

**Packet:** HFI-07A  
**Programme:** [`docs/development/human-factors-low-friction-inhabitation-programme.md`](../../docs/development/human-factors-low-friction-inhabitation-programme.md)  
**Execution plan:** [`docs/development/human-factors-low-friction-inhabitation-execution-plan.md`](../../docs/development/human-factors-low-friction-inhabitation-execution-plan.md)  
**Owning issue:** #195  
**Baseline `main`:** `e6ce711aaee0992798074c7bf85cfd5363744323`  
**Question:** which HFI questions does the current Reference House source actually represent strongly enough for HFI-07 to judge, and which must remain `NOT-MODELLED`?  
**Boundary:** coverage only. This packet does not issue `PASS`, `IMPROVE` or `CONFLICT` findings; change Reference House geometry; invent missing detail; alter HFI targets; edit doctrine/patterns/publication; or widen compiler proof.

---

## 1. Result in one sentence

The current Reference House is **strongly modelled at macro plan topology and selected stair arithmetic, but deliberately sparse at occupied-interface resolution**: HFI-07 can judge the stair's represented rise/going system and some route/task topology, while most door, threshold, sanitary, hardware, control, kitchen open-state, object-path and site-approach questions remain `NOT-MODELLED`.

That is not a defect by itself. It is the proof boundary.

---

## 2. Audit vocabulary frozen before verdicts

HFI-07 uses exactly this result vocabulary:

| Result | Meaning |
|---|---|
| `PASS` | the relevant Reference House source is represented strongly enough and satisfies the applicable HFI target/question at the claimed scope |
| `IMPROVE` | the represented condition is materially weaker than the applicable HFI target/question and a better architectural response should be tested |
| `CONFLICT` | a material HFI improvement collides with another legitimate architectural/technical duty and cannot be resolved by pretending either side does not exist |
| `UNRESOLVED` | the question is represented enough to expose a real issue, but a required technical/site/product/external-review fact prevents a defensible final disposition |
| `NOT-MODELLED` | the current Reference House source does not contain the geometry/state/data needed to judge the question |

Two controls follow.

1. `NOT-MODELLED` is **not** a euphemism for failure. It says only that this source cannot support the verdict.
2. `UNRESOLVED` is **not** a substitute for missing representation. If the house does not encode the thing being judged, use `NOT-MODELLED`.

HFI-07A itself records only whether an audit question is **auditable from current source** or must be `NOT-MODELLED`. Later packets own the actual verdicts.

---

## 3. Source lease and authority read

Current source identities at baseline:

| Role | Path | Current blob SHA |
|---|---|---|
| RH-02 ground-floor authority | `docs/reference-house/ground-floor-development.md` | `97aa878a45ab6b7acf8c87cd5eea83d1a205cbf4` |
| RH-03 stair / upper-floor authority | `docs/reference-house/upper-floor-and-stair-development.md` | `d463ca19d2d1da4e312ec12d2429f9e159472c07` |
| RH-09 occupied-interface authority | `docs/reference-house/tectonic-integration-rh09.md` | `2a795a1101ff6405e8783da8a3c87f7510c2e6f4` |
| RH-10 whole-house authority | `docs/reference-house/whole-house-coordination-audit.md` | `13f740d2616ba02d256ee89b7bd38ee6a893b935` |
| integrated RH summary | `docs/reference-house/README.md` | `8c8b76f8f32d6a5433ad19df08592cbb7fa4cf58` |
| executable RH fixture | `compiler/reference-house/fixture.ts` | `8bce8f39b48873395be3922005890cc0f6dc06fa` |
| executable RH semantic model | `compiler/reference-house/model.ts` | `f640235105c1e77937f0b958536c969e22c61044` |

HFI-00B remains the controlled pre-research comparison point; this packet reads current `main` rather than assuming that historical freeze is the present source.

The executable fixture represents:

- shell, courtyard and planning lines;
- ground/first levels and ceiling datums;
- room/circulation reservations as rectangles or rectangle unions;
- selected adjacency/topology;
- stair riser/going topology, provisional clear-width target and reservation;
- selected façade opening families and technical topology used by existing compiler gates.

It does **not** turn room labels into detailed occupied geometry.

---

## 4. Admission rule for HFI-07 evidence

A question is auditable only when the current controlled architectural or executable source contains the facts needed by that target.

Acceptable current-source evidence includes:

- controlled/provisional dimensions explicitly authored in RH source;
- derived geometry whose inputs are controlled/provisional source facts;
- explicit architectural topology, adjacency or route claims where the target itself is topological;
- explicit selected/required relationships whose absence or presence is the audit question.

The following do **not** manufacture modelability:

- a room label such as `bathroom`, `kitchen`, `WC` or `gallery`;
- a gross room rectangle where the target requires a finished clear envelope;
- a façade opening family where the target requires an internal clear doorway approach;
- a narrative intention to be level/accessibile where the target requires a threshold detail;
- a nominal control-height band where the target requires approach, reach and action sequence;
- an architectural route line where the target requires object/body swept path;
- a proposed future adaptation without a reserved geometric envelope;
- a drawing that merely illustrates source more specifically than the source itself authorises.

No later HFI packet may trace a plausible door, fixture, rail, appliance or object path onto a drawing and treat that invention as Reference House evidence.

---

# 5. HFI-07B coverage — approach + ground floor

| Audit question | Current source support | HFI-07A disposition | Why |
|---|---|---|---|
| Ground-floor room/circulation topology and principal destination order | shell/court/space reservations; RH-02 selected G1 order | **AUDITABLE** | macro topology is authored and executable |
| Principal entrance → hall → east gallery → kitchen/garden-side route topology | RH-02/RH-10 narrative + represented circulation/room reservations | **AUDITABLE** | the route's existence and level topology can be judged; its detailed manoeuvres cannot |
| Gross `G-GAL-01` planning field | executable X 7800–9100 = 1300 mm gross | **AUDITABLE** | gross field is represented |
| Finished effective clear gallery route through walls/doors/joinery/radiators | expressly unresolved | `NOT-MODELLED` | HFI-MOV-ROUTE-01 requires actual fixed encroachments, not gross field width |
| Ground-floor internal same-level planning intent | one ground FFL plus RH-10 step-free intent | **AUDITABLE** at topology level | source supports absence of a planned storey-level change |
| Individual internal doorway thresholds / finish transitions | no detailed door/threshold geometry | `NOT-MODELLED` | cannot prove HFI-MOV-GP-01/02 at each opening |
| Real-site approach from street/parking/set-down | site intentionally absent | `NOT-MODELLED` | site-bound input; absence is not RH defect |
| Principal entrance threshold drainage/weathering/level geometry | intent only; final product/detail unresolved | `NOT-MODELLED` | substantially-level intent is not a constructed clear-envelope/detail proof |
| Internal door clear openings + leading/following-edge approach + leaf swing | no complete internal doorset geometry | `NOT-MODELLED` | HFI-MOV-DOOR-01 is a coupled manoeuvre target |
| Door/window operating effort, latch/lock/grip/one-hand sequence | no product/action-force data | `NOT-MODELLED` | HFI-USE-FORCE/MANIP/ONEHAND require interface data |
| Ordinary lighting/heating/ventilation/shade control location and action loop | general RH-09 principles only | `NOT-MODELLED` | no T5 control positions/mapping/state sequences are authored |
| Ground WC fixture/transfer/assistance geometry | gross service-suite field but no final `G-WC-01` fixture plan | `NOT-MODELLED` | a sanitary-room intention cannot stand in for fixture clearances |
| Entrance-level fallback shower geometry | adaptation intention only | `NOT-MODELLED` | no shower, drainage, dry-staging or support geometry represented |
| Entrance-level future sleeping option as room-use possibility | entrance-storey habitable rooms represented | **AUDITABLE** only as availability/topology | bed approach, transfer and associated sanitary route remain unmodelled |
| Garden/courtyard threshold human-factors detail | architectural intent only | `NOT-MODELLED` | exact level, drainage, weathering and doorset interface unresolved |
| Kitchen fixed work / open appliance states / landing surfaces | kitchen room field only | `NOT-MODELLED` | HFI-USE-KIT targets require appliance/worktop/open-state geometry |
| Fixed storage reach/bending allocation | no storage geometry | `NOT-MODELLED` | room area cannot prove reach allocation |
| Route dignity/equivalence | main all-weather route and principal sequence are authored | **AUDITABLE** at route-role level | detailed impediments remain outside current source |

### 5.1 Important split

HFI-07B may therefore judge **whether the plan makes a route exist and what role that route has**. It may not claim that the same route is ergonomically adequate at every doorway, turn or threshold unless that local geometry is actually represented.

---

# 6. HFI-07C coverage — stair + upper floor

| Audit question | Current source support | HFI-07A disposition | Why |
|---|---|---|---|
| Principal stair going | controlled `280 mm` | **AUDITABLE** | directly comparable with HFI-MOV-STAIR-01 preferred target |
| Principal stair rise | 3300 mm / 18 = ≈183.33 mm | **AUDITABLE** | derived from controlled level/riser facts |
| `2R+G` and pitch correspondence | derived ≈646.67 mm / ≈33.2° | **AUDITABLE** | source supports bounded numeric comparison; remains separate from HFI preference |
| Flight/riser topology and no-winder intent | 3 × 6 rises; 5 goings/flight; RH-03 full-landings/no-winders | **AUDITABLE** | topology is explicit |
| Finished usable stair width after rails/guards | provisional 1000 mm clear-width target, but no rail/guard construction | `NOT-MODELLED` for finished clear envelope | nominal target does not prove usable width |
| Detailed landing clear geometry and transition consistency | reservation/topology only | `NOT-MODELLED` | strings, balustrades, finish build-up and exact landing construction absent |
| Headroom through complete stair path | ≥2000 mm intent only | `NOT-MODELLED` | no finished headroom envelope is encoded |
| Continuous graspable hand support / rail count/section | not represented | `NOT-MODELLED` | target is interface-specific |
| Tread-edge legibility / lighting / contrast | not represented | `NOT-MODELLED` | no material/lighting state |
| Stair use while carrying / reduced-attention / assistance | stair geometry exists but dynamic body/task envelope does not | `NOT-MODELLED` for complete task | later audit may discuss geometry consequences only where target can be evaluated without invented body paths |
| South landing → east gallery → north cross-landing continuity | explicit positive-width adjacency and represented fields | **AUDITABLE** | route topology is executable |
| Gross upper gallery/turn fields | 1300 mm east gallery, 1300 mm south turn, ≈1200 mm north turn | **AUDITABLE** as planning geometry | no claim of finished clear usability follows |
| Finished upper route through door swings/obstructions | local openings/leaves/joinery not authored | `NOT-MODELLED` | gross planning fields receive no clear-route credit |
| Upper bedroom access manoeuvres | room reservations but no internal doors/furniture | `NOT-MODELLED` | cannot prove approach/bed/furniture task envelopes |
| Family bathroom fixture/transfer/dry-dressing/assistance geometry | `U-BATH-01` gross room only | `NOT-MODELLED` | HFI-USE-SAN targets require fixture/action geometry |
| Support-capable sanitary fixing zones | no support-zone/service-conflict map | `NOT-MODELLED` | wall construction family alone is insufficient |
| Stair-lift compatibility | narrative lower-burden future option + provisional stair width | `NOT-MODELLED` for a compatibility claim | no lift product/rail/envelope/landing transfer geometry |
| Through-floor lift reservation | no selected reservation | `NOT-MODELLED` | HFI deliberately left proportional case unresolved |
| Entrance-level fallback if stair use is lost | ground-floor habitable/sanitary intentions exist | **AUDITABLE** at topology level | actual sanitary/sleeping usability remains unmodelled |

### 6.1 Consequence for the numerical stair target

HFI-07C is authorised to compare the represented `280 mm` going and ≈`183.33 mm` rise with HFI-06B because those are real source facts. HFI-07A deliberately does **not** state the verdict.

The same permission does not extend to handrails, headroom, finished width or stair-lift compatibility merely because the stair has a bounding box.

---

# 7. HFI-07D coverage — objects + domestic task paths

| Audit question | Current source support | HFI-07A disposition | Why |
|---|---|---|---|
| Groceries: entrance → kitchen destination topology | entrance/hall/gallery/kitchen order represented | **AUDITABLE** at macro route topology | complete pickup/set-down/door/regrip events are absent |
| Groceries complete loaded-body event ledger | no door/opening/set-down/handling geometry | `NOT-MODELLED` | HFI-03D explicitly requires complete task sequence |
| Laundry: upper sleeping/bathing → ground service-suite level crossing | bedrooms/bathroom upstairs; gross service suite downstairs | **AUDITABLE** at macro topology | repeated inter-storey burden is a represented plan fact |
| Laundry complete dirty → wash → dry → fold → clean-return event ledger | exact utility/drying/storage points, doors and staging absent | `NOT-MODELLED` | do not fake a friction score or detailed sequence |
| Waste/recycling route | destination/storage/door sequence not sufficiently authored | `NOT-MODELLED` | room topology alone does not establish disposal route |
| Cleaning-equipment task routes | fixed storage/staging points absent | `NOT-MODELLED` | no complete sequence |
| Childcare/caregiving task routes | no body/helper/device task envelopes | `NOT-MODELLED` | dynamic scenario not encoded |
| Garden-serving kitchen/dining/garden adjacency | rear kitchen/garden-dining/garden relationship authored | **AUDITABLE** at macro topology | external threshold/door handling remains unmodelled |
| Sofa outside → principal living room swept path | no object envelope + internal opening/swing chain | `NOT-MODELLED` | static room fit is not route proof |
| Mattress/bed → upper bedroom swept path | no object envelope + detailed stair/door path | `NOT-MODELLED` | stair arithmetic is insufficient |
| White-goods delivery/replacement route | no domestic object-route chain | `NOT-MODELLED` | service-plant replacement route cannot substitute |
| Pram/wheelchair complete principal route | no device swept path + complete doorway/turn geometry | `NOT-MODELLED` | visitability intent is not route proof |

The upper-to-ground laundry relationship is therefore a legitimate HFI-07D audit case **without** pretending that the detailed utility workflow is modelled. The later packet must preserve that distinction.

---

# 8. Cross-cutting interface coverage

The following HFI-06C target families are presently `NOT-MODELLED` as Reference House T5 interface facts unless a later HFI-07 packet identifies a more specific controlled source:

- `HFI-USE-REACH-01` — functional reach with approach/obstruction/posture;
- `HFI-USE-FORCE-01` — task-matched operating effort;
- `HFI-USE-MANIP-01` — manipulation burden;
- `HFI-USE-ONEHAND-01` — coherent one-handed completion;
- `HFI-USE-OPENING-01/02` — complete opening/closing/confirmation sequence;
- `HFI-USE-CONTROL-01..06` — control loop, locality, mapping, feedback/persistence and fallback;
- `HFI-USE-SAN-01..05` — level-access bathing, control-before-consequence, support zones, dry staging and assistance;
- `HFI-USE-KIT-01..04` — open-state work geometry, landing, storage allocation and task-specific work height.

This is expected. HFI-06 intentionally refused to invent universal dimensions where actual product/layout/action geometry is required. HFI-07 must now honour that discipline rather than declaring success from generic room area.

---

# 9. What HFI-07 may and may not infer

## May infer / derive

- arithmetic consequences of controlled numeric source;
- rectangle dimensions from controlled/provisional planning lines;
- explicit shared-edge continuity / adjacency;
- storey changes between represented task destinations;
- presence/absence of a represented reservation;
- route-role relationships explicitly stated by RH authority.

## May not infer

- clear width by subtracting guessed wall/finish thicknesses;
- door position, leaf swing or clear opening from a room connection;
- fixture placement from a room label;
- worktop/appliance arrangement from `kitchen`;
- support capacity from generic masonry construction;
- threshold performance from the word `flush` or `level`;
- hardware force/grip from a doorset family;
- control usability from a generic 450–1200 mm guidance band;
- wheelchair/object manoeuvrability from gross floor area;
- site approach gradients/levels from a site-agnostic model;
- future adaptation feasibility from intention alone.

Where a later drawing exposes a plausible detail not owned upstream, the finding is **source incompleteness**, not permission to promote the drawing into hidden authority.

---

# 10. Coverage findings

## 10.1 Strongest current HFI audit coverage

The source is strongest for:

1. principal stair numeric geometry;
2. stair/upper circulation topology;
3. macro ground-floor route/destination topology;
4. gross circulation planning fields;
5. storey relationship between domestic-task destinations;
6. existence/non-existence of large adaptation reservations.

## 10.2 Weakest current HFI audit coverage

The source is weakest for:

1. finished doorway and turn manoeuvres;
2. external/internal threshold detail;
3. sanitary fixture and assistance geometry;
4. hardware force/grip/one-handed operation;
5. control placement/action/state loops;
6. kitchen appliance/open-state/work-surface geometry;
7. fixed storage reach geometry;
8. object swept paths;
9. detailed domestic-task event chains;
10. real-site approach/set-down/gradient conditions.

This boundary is architectural, not computational: adding fields to a compiler would not be justified merely to avoid `NOT-MODELLED`. HFI-09C later decides whether any accepted proposition earns machine checking.

---

# 11. HFI-07 audit locks

The following locks apply to 07B–07E:

1. **Target-form lock** — judge each target in the form HFI-06 adopted. Do not turn `T4-REL` into an invented scalar.
2. **Claim-scope lock** — a gross/topological fact can support only a gross/topological finding.
3. **Authority lock** — keep T1/T2/T3/T4/T5 layers distinct; a current RH value does not become a target by incumbency.
4. **Representation lock** — absent local geometry/data is `NOT-MODELLED`; no sketching-in to manufacture a verdict.
5. **Source-over-drawing lock** — drawings may expose source defects but may not silently author missing architecture.
6. **No aggregate score** — task/event burdens remain legible; do not collapse them into a pseudo-scientific friction number.
7. **Conflict lock** — if a represented HFI improvement meets a hard moisture/fire/security/structure/services duty, record the collision as `CONFLICT` where appropriate rather than weakening the target until current geometry passes.
8. **Site boundary lock** — real-site access facts remain site-specific; absence from the site-agnostic Reference House is not a design failure.
9. **No compiler-expansion lock** — modelability audit does not create a new proof family.
10. **No incumbency lock** — represented geometry receives no protection because it is already drawn, compiled or published.

---

# 12. Rejected shortcuts

### “Audit the PDFs/SVGs visually and measure whatever is drawn” — rejected

That would let projection detail outrun source authority and convert drawing convenience into hidden T5 facts.

### “Treat every room rectangle as enough to audit use” — rejected

HFI-06's relational targets specifically depend on approach, open state, posture, sequence and obstruction.

### “Mark missing detail UNRESOLVED so fewer things say NOT-MODELLED” — rejected

That destroys the distinction HFI-07A exists to establish. Missing representation stays `NOT-MODELLED`.

### “Expand the compiler before auditing” — rejected

HFI-07 is an adversarial architectural audit, not a demand to computationalise every human-factors question.

### “Defer the whole audit because many interfaces are not modelled” — rejected

The stair and macro topology are represented strongly enough to support meaningful 07B–07D findings now. Coverage gaps should narrow claims, not paralyse the programme.

---

# 13. Authority / maturity consequences

None.

HFI-07A changes only the audit proof boundary. It does not:

- alter Reference House geometry or room arrangement;
- change any HFI target;
- create a doctrine or pattern;
- establish compliance or technical adequacy;
- create compiler proof;
- change Reference House or publication maturity;
- make publication/DRW output stale.

A later HFI-07 finding may require an RH rewind. This packet itself does not.

---

# 14. Packet closeout

`HFI-07A → baseline e6ce711aaee0992798074c7bf85cfd5363744323 → determine current RH modelability for HFI audit → HFI-00B/00C + HFI-06B/06C/06D + current RH-02/RH-03/RH-09/RH-10 + executable RH fixture/model → macro topology and selected stair arithmetic auditable; occupied-interface detail mostly NOT-MODELLED → durable coverage record only → no architectural/maturity/downstream change → exact next packet HFI-07B — approach + ground floor`

**Exact next packet:** **HFI-07B — approach + ground floor.**
