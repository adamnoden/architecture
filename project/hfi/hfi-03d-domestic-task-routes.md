# HFI-03D — Domestic Task Routes

**Packet:** HFI-03D  
**Programme:** [`docs/development/human-factors-low-friction-inhabitation-programme.md`](../../docs/development/human-factors-low-friction-inhabitation-programme.md)  
**Execution plan:** [`docs/development/human-factors-low-friction-inhabitation-execution-plan.md`](../../docs/development/human-factors-low-friction-inhabitation-execution-plan.md)  
**Owning issue:** #195  
**Baseline `main`:** `ace7bd9ace1fa353f0a5d1f8cf9413dbfe4a0a3e`  
**Prior packet:** HFI-03C — object movement  
**Question:** how should HFI represent and judge repeated domestic task routes — groceries, laundry, waste/recycling, cleaning, childcare/caregiving and similar household work — without reducing them to corridor width, shortest distance or an invented universal efficiency score?  
**Boundary:** evidence synthesis and task-route method only. This packet does **not** relocate rooms, prescribe a utility-room floor, require a laundry chute, set maximum route lengths, create a domestic-work score, assign household roles, specify storage heights, change door geometry, pass/fail the Reference House, create doctrine/patterns or add compiler proof.

---

## 1. Purpose

A house can contain individually usable rooms and still make ordinary household work unnecessarily difficult.

Domestic tasks are chains. A grocery trip may involve arrival, a door, a turn, a set-down, cold storage and dry storage. Laundry may involve collection, sorting, stairs, washing, drying, folding and return. Waste begins inside the kitchen but ends at a real collection point. Cleaning equipment moves repeatedly between storage and dispersed destinations. Childcare and caregiving combine movement, supervision, occupied hands and another person's needs.

The controlling proposition is:

> **Domestic-task usability is a property of the whole sequence of handoffs, interfaces and destinations, not merely the distance between two rooms.**

HFI-03D tests that proposition against the already-frozen carrying/reduced-attention evidence, object-route method, current UK/London housing guidance and bounded empirical evidence about instrumental activities of daily living and caregiving.

The packet deliberately refuses two opposite shortcuts:

1. make every route as short/open/wide as possible;
2. dismiss ordinary housework as loose lifestyle behaviour outside architecture.

Persistent architecture matters when it repeatedly imposes carrying, bending, door operation, level change, awkward staging, dirty/clean conflict or avoidable detour.

---

# 2. Controlled Reference House facts — comparison only

HFI-00B remains the controlled geometry baseline. Later DRW packets may improve representation but do not create human-factors authority.

## 2.1 Ground-floor task geography

The current ground floor contains:

- principal entrance / hall / stair at the south-centre;
- east inner gallery as the ordinary all-weather circulation spine;
- kitchen at the north-east;
- garden-dining field at the north-centre;
- family room at the north-west;
- service-suite / utility territory on the east side;
- garden access associated with the rear/garden side.

The current ordinary all-weather movement intent is:

`entrance hall → east inner gallery → kitchen / garden dining → family / garden`

No ordinary daily route is intended to require crossing the open courtyard.

Final door clear openings, leaf swings, joinery, actual set-down surfaces, waste location, cleaning-equipment storage and detailed garden/external thresholds remain unresolved.

## 2.2 Upper-floor task geography

The upper floor contains:

- four bedrooms;
- `U-BATH-01`;
- south stair landing;
- east courtyard gallery;
- north cross-landing;
- dry dressing / linen / storage territory.

Sleeping and principal bathing are therefore upstairs while utility geography is on the ground floor.

That creates a foreseeable vertical laundry/housekeeping route. HFI-02D already identified the route as a legitimate audit case and explicitly did **not** call the arrangement a defect.

## 2.3 Site-dependent task geography

The generic Reference House does not know:

- pavement/driveway/parking/set-down geometry;
- grocery handoff point beyond the principal approach assumption;
- refuse/recycling collection point;
- side/rear access;
- outdoor clothes-drying position;
- garden-store position;
- bin collection method/frequency;
- real garden levels.

Those facts cannot be invented to make a route pass or fail.

---

# 3. Scenario coverage

HFI-01C already freezes the relevant interactions.

| Scenario | Domestic-task question |
|---|---|
| `HFI-SC-LOG-01` | groceries from entrance to kitchen with occupied hands |
| `HFI-SC-LOG-02` | laundry between sleeping/bathing and utility/storage with occupied hands |
| `HFI-SC-LOG-03` | waste/recycling from kitchen to external destination |
| `HFI-SC-LOG-04` | cleaning equipment between storage and whole-house destinations |
| `HFI-SC-LOG-05` | carrying a child through doors/corners/stairs under occupied hands + divided attention |
| `HFI-SC-ARR-05` | inside → garden carrying tray/load through door/threshold sequence |
| `HFI-SC-LC-05` | pregnancy as a temporary state affecting bending, balance or carrying tolerance where evidence is relevant |
| `HFI-SC-LC-06` | assisted visitor/care route through the principal system |

HFI-03D does not add personas or allocate tasks to one household member.

---

# 4. Existing evidence reused

03D reuses rather than duplicates several prior HFI sources.

## 4.1 HFI-02D — carrying and reduced reserve

The following mechanisms are already established as legitimate research concerns:

- occupied hands can remove immediate access to a rail or handle;
- load-down / free-hand / operate / regrip sequences are observable friction events;
- asymmetric carrying is not equivalent to neutral object translation;
- divided attention and fatigue reduce available reserve;
- stair descent and the approach-to-descent transition deserve particular protection;
- carrying evidence does **not** justify a generic corridor/stair-width increment.

## 4.2 HFI-03A — circulation geometry

03A established that route adequacy depends on the combined geometry of doors, approach, width, turns, obstructions and local manoeuvre space — not one corridor number.

## 4.3 HFI-03B — continuous ground plane

03B established that thresholds and external transitions must solve movement and water together. A domestic route cannot claim low friction by ignoring drainage/weathering.

## 4.4 HFI-03C — object movement

03C distinguishes repeated daily object routes from occasional delivery routes and establishes that whole-route feasibility includes start, goal, door state, turns, staging and handling assumptions.

## 4.5 `HFI-SRC-O04` — HSE manual-handling guidance

03C already registered current HSE guidance as `EXPERT-GUIDANCE`. It identifies bulky/difficult loads, restricted posture, twisting/stooping, poor visibility, stairs, obstructed/slippery routes and insufficient space as material handling risks.

03D reuses that mechanism evidence. It does not create workplace-law claims about ordinary household chores.

---

# 5. Evidence additions and applicability

Every new source below uses the HFI-01B evidence ontology unchanged.

## `HFI-SRC-T01` — Seidel et al. 2010 IADL activity-demands study

- **Source:** Seidel D, Richardson K, Crilly N, Matthews FE, Clarkson PJ, Brayne C, *Design for independent living: activity demands and capabilities of older people*.
- **Date/version:** *Ageing & Society* 30(7), 2010, 1239–1255.
- **Jurisdiction / population:** Great Britain; `4,886` community-dwelling adults aged `55–93`, drawn from a follow-up to the 1996/97 Family Resources Survey.
- **Class:** `PEER-REVIEWED-EMPIRICAL`.
- **Authority / status:** peer-reviewed empirical study; non-statutory.
- **Applicability:** cooking, housework, laundering and shopping as instrumental activities of daily living; relationship between task demands and reported difficulty.
- **Useful findings:** limitations in body postures, physical actions and hand functions were associated with difficulty across the studied activities. The largest population-attributable burden was associated with body-posture limitations, particularly bending/stooping; lifting/lowering, holding/carrying and hand functions also mattered.
- **Known limits / nonclaims:** older-adult population and survey/task-analysis method; does not identify optimum room adjacencies, maximum route lengths or Ovid's House dimensions. It supports treating domestic work as a real capability/task system rather than proving one architectural solution.
- **Access state:** publisher abstract/metadata publicly accessible.
- **Checked:** 2026-10-18.
- **DOI:** https://doi.org/10.1017/S0144686X10000310
- **Canonical location:** https://www.cambridge.org/core/journals/ageing-and-society/article/design-for-independent-living-activity-demands-and-capabilities-of-older-people/65CF90A43DE02DE9FD0AD123438246B8

## `HFI-SRC-T02` — Seidel et al. 2011 observed cooking/laundry postures

- **Source:** Seidel D, Hjalmarson J, Freitag S, Larsson TJ, Brayne C, Clarkson PJ, *Measurement of stressful postures during daily activities: An observational study with older people*.
- **Date/version:** *Gait & Posture* 34(3), 2011, 397–401.
- **Jurisdiction / population:** home-like test environment; `27` men and women aged `75+`.
- **Class:** `PEER-REVIEWED-EMPIRICAL`.
- **Authority / status:** peer-reviewed empirical evidence; non-statutory.
- **Applicability:** observed posture during cooking and laundry; identification of task moments producing very large trunk inclination.
- **Useful findings:** the study classified trunk inclination `≥60°` as a critical posture for its analysis. Such postures accounted for about `3%` of cooking time and `10%` of laundry time, clustering particularly around lower cupboards, refrigerator access, laundry basket, washing machine and waste-bin use.
- **Known limits / nonclaims:** small older-adult sample and controlled/home-like environment; the `≥60°` criterion is the study's analytical threshold, not an Ovid's House rule. The study says more about **handoff/storage/interface positions** than about room-to-room distance.
- **Access state:** PubMed/publisher abstract and metadata publicly accessible.
- **Checked:** 2026-10-18.
- **DOI:** https://doi.org/10.1016/j.gaitpost.2011.06.009
- **PMID:** https://pubmed.ncbi.nlm.nih.gov/21764584/

## `HFI-SRC-T03` — London Housing Design Standards LPG

- **Source:** Greater London Authority, *Housing Design Standards London Plan Guidance* / official Housing Design page.
- **Date/version:** adopted 8 June 2023; official page checked 2026-10-18.
- **Jurisdiction / population:** Greater London housing planning guidance.
- **Class:** `PLANNING-GUIDANCE`.
- **Authority / status:** adopted London Plan Guidance supporting current housing policy.
- **Applicability:** household storage, cleaning equipment, waste/recycling and functional dwelling planning.
- **Useful findings:** current guidance states that everyday household items including cleaning equipment need to be readily accessible; dwelling planning should provide sufficient built-in storage; waste/recycling storage and collection must be designed early, remain accessible and respond to local collection arrangements; nuisance from noise/smell and cleaning of waste areas are explicit considerations.
- **Known limits / nonclaims:** primarily planning/design guidance for London and includes multi-unit concerns; it does not define a domestic task-route score or prove one utility/waste adjacency.
- **Access state:** official GLA HTML/guidance publicly accessible.
- **Checked:** 2026-10-18.
- **Canonical location:** https://www.london.gov.uk/publications/housing-design

## `HFI-SRC-T04` — Interim London Housing Design Guide utility precedent

- **Source:** London Development Agency / Mayor of London, *Interim London Housing Design Guide*.
- **Date/version:** 2010; superseded by later London policy/guidance.
- **Jurisdiction / population:** London housing-design precedent.
- **Class:** `HISTORICAL-PRECEDENT`.
- **Authority / status:** superseded guidance; not current planning policy.
- **Applicability:** provenance for treating laundry, drying, waste and cleaning storage as spatial/technical functions rather than loose afterthoughts.
- **Useful findings:** the guide explicitly discusses accessible cleaning-equipment storage, dedicated waste/recycling positions, washing-machine location, ventilated/heated clothes-drying space, and a utility room as desirable/recommended in larger family homes. It records adjacency options such as recycling in the kitchen or utility room next to the kitchen.
- **Known limits / nonclaims:** historical and superseded; cannot create a current requirement that utility must be adjacent to kitchen, on the ground floor or of any fixed size.
- **Access state:** archived/public PDF accessible.
- **Checked:** 2026-10-18.
- **Canonical location:** https://www.london.gov.uk/sites/default/files/Interim%20London%20Housing%20Design%20Guide.pdf

## `HFI-SRC-T05` — Kallitsis, Soilemezi & Maguire-Elliot caregiver spatial study

- **Source:** Kallitsis P, Soilemezi D, Maguire-Elliot A, *Disabling spaces and spatial strategies: feminist approaches to the home environment of family caregivers of people with dementia*.
- **Date/version:** *Home Cultures* 15(3), published 2019, 265–287.
- **Jurisdiction / population:** qualitative study of `13` family caregivers; dementia-care context.
- **Class:** `PEER-REVIEWED-EMPIRICAL`.
- **Authority / status:** peer-reviewed qualitative evidence; non-statutory.
- **Applicability:** whether home layout/flexibility can materially affect caregiving experience and adaptation strategies.
- **Useful finding:** themes included compact layout, spatial flexibility and the wider neighbourhood; adjacency-diagram analysis was used to understand caregivers' spatial experience.
- **Known limits / nonclaims:** very small qualitative sample and dementia-specific care context; does not prove that all family homes should be compact, open-plan or care-institution-like. It supports keeping caregiving route/adjacency as a legitimate HFI question.
- **Access state:** university research-portal abstract/metadata and accepted-manuscript route publicly accessible.
- **Checked:** 2026-10-18.
- **DOI:** https://doi.org/10.1080/17406315.2018.1690293
- **Canonical location:** https://researchportal.port.ac.uk/en/publications/disabling-spaces-and-spatial-strategies-feminist-approaches-to-th/

## `HFI-SRC-T06` — caregiver home-modification strategies

- **Source:** Messecar DC, Archbold PG, Stewart BJ, Kirschling J, *Home environmental modification strategies used by caregivers of elders*.
- **Date/version:** *Research in Nursing & Health* 25(5), 2002, 357–370.
- **Jurisdiction / population:** United States; `24` caregivers of community-dwelling elders, with guided home tours/selected activity observation in `17` families.
- **Class:** `PEER-REVIEWED-EMPIRICAL`.
- **Authority / status:** peer-reviewed qualitative evidence; non-statutory.
- **Applicability:** evidence that caregiving households actively reorganise and modify environments to support function, protection and daily routines.
- **Useful finding:** the study identified multiple families of adaptation, including organising the home, supplementing function, protecting the elder and working around limitations/deficits in the home environment.
- **Known limits / nonclaims:** small US qualitative sample and elder-care context; cannot justify universal care-suite geometry or any Ovid's House dimension. It supports treating repeated workarounds imposed by persistent architecture as a real design signal.
- **Access state:** PubMed abstract/metadata publicly accessible.
- **Checked:** 2026-10-18.
- **DOI:** https://doi.org/10.1002/nur.10048
- **PMID:** https://pubmed.ncbi.nlm.nih.gov/12221690/

---

# 6. What a domestic task route is

A domestic task route is not merely a line between room centroids.

HFI-03D represents each task as a sequence containing five kinds of state.

## 6.1 Person state

Examples:

- both hands free;
- one/both hands occupied;
- asymmetric load;
- divided attention;
- wet/dirty hands;
- reduced balance or temporary impairment;
- assisting/carrying another person.

The relevant state must come from HFI-01C/02D rather than being improvised to justify a design.

## 6.2 Payload state

Examples:

- bagged groceries;
- laundry basket / loose linen;
- clean folded laundry;
- waste/recycling/food waste;
- vacuum/mop/bucket/cleaning kit;
- child or care equipment;
- tray/hot food/drinks.

A payload may change state during the task: dirty laundry becomes wet laundry then clean/dry laundry; groceries split into cold/dry destinations; cleaning equipment becomes wet/dirty during use.

## 6.3 Route state

The route includes:

- level segments;
- stairs/ramps/thresholds;
- doors and openings;
- turns;
- fixed obstructions;
- route choices;
- external/site-dependent portions.

## 6.4 Handoff / work state

The task may require:

- pick-up;
- set-down;
- sort;
- open/close/lock;
- load/unload;
- bend/reach;
- transfer to another surface/container;
- pause/regrip;
- clean/dry/fold;
- store/put away.

These states matter because T02 shows that demanding postures can cluster at exactly these interfaces even when the room-to-room route is short.

## 6.5 Consequence state

Later evaluation asks whether the architecture causes:

- repeated load-down/regrip;
- loss of support at a consequential transition;
- avoidable bending/reaching;
- duplicated trips;
- awkward dirty/clean crossing;
- avoidable dependency on another person;
- route exclusion under a representative capability state;
- moisture/noise/smell conflict;
- a large permanent spatial intervention for trivial benefit.

No single consequence automatically proves a defect.

---

# 7. Task-route event ledger

03D freezes an **event ledger**, not a weighted score.

For each representative task, later HFI-07D should record material occurrences of:

| Event | Meaning |
|---|---|
| `PICKUP` | load/person/equipment is first taken into control |
| `SETDOWN` | a load must or can be safely placed down |
| `REGRIP` | handling posture/grip must change materially |
| `DOOR` | leaf/latch/lock/control must be operated |
| `TURN` | meaningful route/body/load direction change |
| `LEVEL` | stair/ramp/threshold/other level transition |
| `BEND-REACH` | posture/reach demand materially belongs to the fixed interface |
| `LOAD-UNLOAD` | washer/bin/fridge/storage or equivalent transfer |
| `SORT` | task requires spatial separation/classification |
| `STORE` | final/intermediate storage interaction |
| `DIRTY-CLEAN` | contamination/wet/dirty state crosses or changes |
| `OUTDOOR` | task enters a site/weather-dependent segment |
| `RETURN` | the task has a required return/put-away leg |

The ledger is descriptive.

HFI rejects arithmetic such as:

`task friction = 3 doors + 2 turns + 1 stair = 6 points`

A stair while carrying hot food is not commensurable with a benign turn; one necessary fire/security door is not inherently worse than two open cased openings; a longer route may be justified to protect acoustics, hygiene or privacy.

The ledger exists to expose where judgement is needed.

---

# 8. Task-route evaluation method

For each task:

1. freeze the **start condition**;
2. freeze the **destination(s)** and return state;
3. identify the person/payload state;
4. trace the **complete sequence**, including return/put-away where real;
5. populate the event ledger;
6. identify events that stack at the same moment;
7. identify task-specific technical conflicts;
8. identify lower-burden alternatives;
9. apply HFI-01D proportionality later;
10. do **not** convert the record into a design change before HFI-07/08.

The method prefers eliminating **unnecessary stacked demands** over blindly minimising metres.

Example:

`carry laundry → reach top landing → open door while basket blocks view → turn → commit to descent`

is materially different from:

`carry laundry → clear landing/staging → descend predictable stair → operate door after stair transition`.

The total path length could be identical.

---

# 9. Grocery route

## 9.1 Complete task

The minimum grocery sequence is:

`arrival/handoff → principal entrance → internal route → kitchen set-down → cold/frozen storage + dry storage → packaging/waste consequence where relevant`

The first architectural question is not total metres. It is whether the occupant can reach a **credible set-down state** without repeatedly freeing a hand to operate doors or negotiating a difficult transition while fully loaded.

## 9.2 Current Reference House question

The current topology is promising at planning resolution:

`principal entrance → hall → east gallery → kitchen`

The kitchen is on the ordinary all-weather route and does not require crossing the open court.

But HFI cannot award a pass because the current source does not yet freeze:

- internal door positions/leaves;
- entrance-leaf operation under load;
- kitchen set-down/work-surface geometry;
- cold/dry storage positions;
- joinery/radiator encroachment;
- real vehicle/kerb/driveway handoff.

## 9.3 Candidate inference

> **A frequent loaded arrival route should reach a useful set-down state before the architecture demands unnecessary repeated door/turn/regrip choreography.**

This is a candidate task principle, not a maximum route length or open-plan mandate.

---

# 10. Laundry route

Laundry is a loop, not one journey.

## 10.1 Complete task chain

A representative full chain may include:

`bedroom/bathroom use → dirty-laundry accumulation → collect/sort → carry → washer → wet transfer → dry → fold → return to bedroom/linen storage → put away`

If drying is outdoors, add:

`utility/washer → garden/external threshold → drying position → return`

If drying is indoors, moisture/ventilation and drying-space ownership become part of the task system.

A route analysis that tests only `dirty laundry → washing machine` is incomplete.

## 10.2 Why handoff geometry matters

T02 observed critical postures particularly around laundry baskets and washing-machine interaction. T01 likewise shows laundering difficulty relates to multiple postural/action/hand-function capabilities.

03D therefore carries forward questions about:

- where a basket can be staged;
- whether collection requires floor-level storage by default;
- washer loading/unloading posture;
- wet-laundry transfer distance;
- drying handoff;
- folding/set-down surface;
- clean-laundry return and storage.

Exact appliance/storage heights belong mainly to HFI-04D. 03D owns the **sequence and geography**.

## 10.3 Current Reference House question

Current sleeping/bathing is upstairs while utility geography is on the ground floor.

This creates a real vertical carrying loop:

`upper bedrooms/bath → upper circulation → stair → ground circulation → utility`, plus return.

The arrangement is **not** declared wrong.

Potential benefits of ground-floor utility include service concentration, moisture/failure geography, garden/drying relationship and separation of noisy/wet work from bedrooms. Potential burdens include repeated vertical laundry carrying.

Those unlike effects must meet in HFI-05B/05C rather than being decided by a “laundry should be upstairs” slogan.

## 10.4 Lower-burden alternatives remain open

Before relocating major architecture, later synthesis should consider alternatives such as:

- better upper collection/linen staging;
- safe set-down at stair transitions;
- distributed light-item storage;
- improved folding/return staging;
- a deliberately designed laundry chute **only if** fire, acoustic, hygiene, structure, service and maintenance consequences are resolved;
- ground-floor entrance-level fallback laundry use where life-course needs justify it.

None is selected here.

A laundry chute is not assumed to be a free solution and must not violate the permanent-fabric/service doctrine by stealth.

---

# 11. Waste / recycling route

Waste is both a carrying task and a hygiene/nuisance route.

## 11.1 Complete task

`kitchen/use point → internal sort/bin → carry → external store/collection point → return`

Food waste may introduce leak/smell/cleaning consequences distinct from dry recycling.

## 11.2 Current guidance signal

Current London housing guidance requires waste/recycling storage and collection to be considered early, remain accessible and respond to local collection requirements; it also explicitly recognises nuisance from smell/noise and the need for cleanable facilities.

That supports a key HFI constraint:

> **the shortest waste route is not automatically the best route if it creates hygiene, smell, security or principal-space conflict.**

## 11.3 Current Reference House boundary

The generic Reference House has a kitchen but no real-site bin store/collection point.

Therefore HFI-07D can later audit only the **site-independent internal segment** unless a real plot exists.

It must not invent a side passage, front bin store or garden collection route.

---

# 12. Cleaning route

Cleaning is a distributed task rather than a single origin/destination journey.

## 12.1 Complete task family

Representative tasks include movement of:

- vacuum / floor-cleaning equipment;
- mop/bucket or wet-cleaning kit;
- cloths/chemicals;
- bathroom cleaning kit;
- bedding/linen maintenance equipment.

The task may start and end repeatedly at storage while visiting multiple rooms/floors.

## 12.2 Evidence signal

Current London guidance explicitly says everyday household items including cleaning equipment need to be readily accessible. T01/T02 show that housework difficulty and demanding postures are affected by storage/interface conditions, not merely room size.

## 12.3 No automatic single-store doctrine

HFI rejects:

> `all cleaning equipment must live in one central cupboard`

and also rejects:

> `duplicate everything on every floor`.

Distributed low-burden storage can be proportionate for frequently used light items, while large/expensive equipment may remain central. Chemicals introduce safeguarding/security considerations. Area/carbon/cost and clutter also matter.

03D therefore records **storage-to-task geography** as the question and leaves quantity/location to HFI-04D/05B.

## 12.4 Current Reference House boundary

The house has upper dry dressing/linen/storage territory and ground service-suite geography, but no frozen house-wide cleaning-equipment strategy.

A later audit should mark unsupported storage assumptions as `NOT-MODELLED`, not infer them from spare-looking plan areas.

---

# 13. Childcare and caregiving routes

Care routes are not ordinary object routes.

They may involve:

- carrying or guiding another person;
- occupied hands;
- divided attention;
- two-body movement;
- supervision/sightline concerns;
- temporary equipment;
- toileting/bathing/dressing sequences;
- repeated environmental workarounds.

## 13.1 Evidence boundary

T05 and T06 show that home layout/flexibility and environmental modification can matter to family caregiving, but both evidence bases are small and context-specific.

03D therefore takes only a bounded inference:

> **caregiving should be tested as real domestic work whose route can be helped or hindered by persistent layout; specialised care geometry must not be inferred without a real need/evidence chain.**

## 13.2 Compact does not mean compressed

The caregiving evidence contains a useful “compact layout” theme, but HFI must not turn that into a small-house ideology.

A useful compact relationship means reducing avoidable separation between related care tasks while preserving:

- dignity/privacy;
- safe two-person movement where needed;
- retreat and ordinary domestic character;
- future flexibility;
- fire/acoustic/technical duties.

## 13.3 Principal-route dignity remains binding

A disabled occupant, visitor or assisted person is not an occasional delivery object.

HFI-03C permits a secondary route for a sofa where proportionate. That logic **cannot** be used to justify a conspicuously inferior service route for people.

---

# 14. Garden-serving / tray route

The HFI-01C `ARR-05` scenario tests movement from inside to garden carrying a tray/load.

The current Reference House has kitchen and garden-dining fields adjacent along the rear/north side, which is a promising task topology.

However, later audit still needs:

- exact opening/leaf geometry;
- threshold/drainage condition;
- useful set-down positions;
- route to actual garden destination;
- whether hot/wet loads coincide with awkward doors/turns.

The correct candidate inference is not “open-plan garden kitchen”. It is:

> **where serving between fixed food-preparation/dining/outdoor destinations is foreseeable and frequent, avoid unnecessary interface choreography at the loaded transition.**

---

# 15. Route frequency and significance

HFI needs frequency without pretending to know every household routine.

03D uses three qualitative bands only.

## 15.1 `ROUTINE`

Tasks plausibly repeated daily or many times across ordinary occupancy depending on household:

- kitchen use;
- some groceries/food movement;
- waste/food-waste handling;
- childcare/caregiving where relevant;
- cleaning-item access in active use.

## 15.2 `PERIODIC`

Tasks repeated regularly but not continuously:

- laundry cycles;
- full-house cleaning;
- recycling transfer;
- bedding change.

## 15.3 `OCCASIONAL`

- seasonal storage movements;
- unusual deep-cleaning equipment;
- exceptional care equipment changes.

These are **not fixed empirical frequencies** and do not become numeric weights.

A low-consequence periodic task can lose a proportionality contest against area/technical burden; a rare high-consequence task can still matter. HFI-01D remains controlling.

---

# 16. Adjacency is a hypothesis, not a universal good

Reducing separation between related task nodes can reduce carrying and repeated transitions.

But adjacency has costs.

Examples:

- utility beside kitchen may help groceries/laundry/service concentration but add appliance noise;
- drying beside living space may shorten travel but add moisture/visual clutter;
- refuse close to kitchen may help task distance but worsen smell/pest/fire/security conditions depending on detail;
- cleaning storage on a circulation route may be accessible but consume useful clear width;
- care spaces immediately adjacent may reduce travel but undermine privacy/acoustic separation.

Therefore HFI rejects:

> `related tasks should always be placed as close together as possible`.

The later proportionality question is:

> **what adjacency or staging removes meaningful repeated burden without creating a larger technical or architectural burden elsewhere?**

---

# 17. Candidate task-route propositions

These are research outputs for HFI-05, not doctrine or targets.

### `HFI-03D-P1` — whole-task sequence

> **Judge repeated domestic work from start state through handoffs, processing, destination and return — not from room-to-room distance alone.**

Strength: **strong method proposition**.  
Later owner: HFI-05A/05D.

### `HFI-03D-P2` — staging is architecture

> **Where a repeated loaded task meets a door, stair, threshold or processing interface, a credible set-down/staging state can be more valuable than blanket route enlargement.**

Strength: **moderate-to-strong candidate**.  
Later owner: HFI-05B/06B/06C.

### `HFI-03D-P3` — repeated stacked demand

> **Small individual frictions become more material when a frequent task repeatedly stacks carrying, door operation, turning, level change and regrip at the same moment.**

Strength: **moderate-to-strong candidate**, qualitative only.  
Later owner: HFI-05A/05B.

### `HFI-03D-P4` — laundry is a loop

> **Laundry geography must include collection, wash, dry, fold and return; optimising only the washing-machine approach can simply move burden elsewhere.**

Strength: **strong task-method proposition**.  
Later owner: HFI-05A/07D.

### `HFI-03D-P5` — dirty/wet/noisy tasks have technical geography

> **Low-friction task design does not override moisture, hygiene, acoustics, fire, security or maintenance duties; sometimes separation is the correct price of a technically honest house.**

Strength: **strong boundary proposition**.  
Later owner: HFI-05C.

### `HFI-03D-P6` — care work is not invisible

> **Where care is foreseeable, persistent layout should be tested for the work it imposes on both cared-for person and caregiver without converting an ordinary house into a specialist institution by default.**

Strength: **moderate candidate**; evidence/context sensitive.  
Later owner: HFI-05A/05B/05D.

### `HFI-03D-P7` — task roles remain capability-based

> **The architecture may respond to a household task, but it must not encode an assumption about which gender, age or family role performs it.**

Strength: **strong programme-method proposition**, consistent with HFI-01C.  
Later owner: HFI-05D.

---

# 18. Rejected shortcuts

## 18.1 “Shortest route always wins” — rejected

Distance is only one burden. Technical separation, privacy, moisture, smell, acoustics, security and fire can justify additional travel.

## 18.2 “Count doors/turns and minimise the total score” — rejected

Events are not commensurable. The event ledger exposes choreography; HFI-01D supplies judgement.

## 18.3 “Put the laundry upstairs because bedrooms are upstairs” — rejected as a universal rule

This can reduce carrying but may worsen services, moisture, acoustics, failure geography, garden drying and life-course use. It remains an option, not a conclusion.

## 18.4 “Ground-floor utility is automatically low-friction” — rejected

It can impose a repeated vertical laundry loop. Current Reference House placement gets no incumbency advantage.

## 18.5 “A laundry chute solves the route” — rejected as an automatic answer

It creates fire, acoustic, hygiene, structural, maintenance and permanent-fabric questions and solves only one direction/state of the laundry loop.

## 18.6 “One central household store is always efficient” — rejected

Distributed storage may reduce repeated carrying for some tasks; duplication has area/cost/safeguarding consequences. The answer is task-specific.

## 18.7 “Duplicate all cleaning equipment on each floor” — rejected

No evidence/proportionality case supports a universal duplication rule.

## 18.8 “Waste should use the principal route because it is shortest” — rejected

Hygiene, smell, security and real-site collection can justify a different route.

## 18.9 “Hide all service/dirty work at any cost” — rejected

A visually discreet route can still be needlessly burdensome. `Accessible ≠ exposed` applies; concealment is not permission for bad task geography.

## 18.10 “Caregiving requires institutional clearances everywhere” — rejected

Care scenarios deserve testing, but specialist geometry must be earned by actual scenario/evidence/proportionality.

## 18.11 “Caregiving is private behaviour outside architecture” — rejected

Empirical evidence shows households modify and work around their environments during care. Persistent layout can therefore create or remove real work.

## 18.12 “Housework has a default performer” — rejected

Task ownership is not a design assumption. HFI evaluates capability states and route demands, not gender/family stereotypes.

## 18.13 “An external waste/drying route can be assumed in the generic RH” — rejected

Real-site geometry controls it.

---

# 19. Reference House later-audit obligations

No `PASS / IMPROVE / CONFLICT / UNRESOLVED / NOT-MODELLED` findings are awarded before HFI-07.

03D freezes the questions HFI-07D must later answer.

| Task | Current RH fact | Later audit obligation |
|---|---|---|
| groceries | kitchen sits on ordinary entrance → east-gallery route | model final doors, loaded operation and credible kitchen set-down before judgement |
| laundry | upper sleeping/bathing + ground utility | audit the **full dirty + clean return loop**, stair transitions and staging; compare benefits/conflicts before any relocation finding |
| waste/recycling | kitchen represented; real collection point absent | audit internal segment only; external segment `NOT-MODELLED` until site data exists |
| cleaning | ground service geography + upper dry storage exist, but cleaning strategy absent | do not infer storage; test representative storage/task distribution once modelled |
| child carrying | two-storey house with stair/doors; no role assignment | combine 02D mechanisms with final door/stair transition geometry; no child-specific dimension |
| caregiving/assistance | entrance-level fallback/adaptation intentions exist | test principal-route dignity and two-person task sequences where scenario warrants; no institutionalisation |
| garden tray/serving | kitchen + garden-dining adjacency is promising | audit actual opening/threshold/set-down/garden destination before judgement |

Current `1300 mm` galleries, `1000 mm` stair width and existing room positions receive no HFI pass merely because the task topology looks plausible.

---

# 20. Proportionality handoff

HFI-05B must later compare task-route interventions against:

- task frequency;
- consequence when the route is awkward/fails;
- number and severity of **stacked** demands rather than raw event count;
- whether a local staging/storage change solves the problem;
- area/cost/carbon of room relocation or route enlargement;
- service/moisture/acoustic consequences;
- fire/security implications;
- cleaning/hygiene burden;
- workmanship complexity;
- retrofit difficulty;
- architectural character/privacy;
- real-site dependency.

A small local intervention that removes a repeated load-down event may dominate a large plan change. Conversely, a superficially convenient shortcut can lose if it creates moisture/fire/service risk.

No master score is permitted.

---

# 21. Cross-discipline conflict handoff

HFI-05C must reconcile task-route candidates with:

| Concern | Typical task-route conflict |
|---|---|
| moisture / ventilation | indoor drying, wet utility work, garden threshold |
| acoustics | washing/drying appliances near sleep/repose spaces |
| fire | laundry chute, door removal/hold-open assumptions, waste storage |
| structure | chute/opening/major room relocation |
| services | washer/sink/drying relocation, utility plumbing/extract, controls |
| security | external bin/garden/service routes and doors |
| hygiene / pests | food waste, dirty laundry, cleaning equipment |
| maintenance/failure geography | appliance leaks, drain access, replacement path |
| safeguarding | cleaning chemicals/child access; not a generic reason for inaccessible storage |
| energy/carbon | tumble-drying vs ventilation/drying provision; duplicated area/storage |
| privacy / dignity | care routes and visible household work |
| architectural grammar | circulation hierarchy and service-space expression |
| real site | refuse collection, parking/grocery handoff, outdoor drying, garden/service access |

Nothing is declared outside HFI without its assurance owner.

---

# 22. Computational admission boundary

A later computational representation of domestic tasks is plausible as a **route/event graph**, but HFI-03D authorises no implementation.

A bounded machine-readable task could eventually contain:

- start node;
- destination/handoff nodes;
- route edges;
- level changes;
- doors/interfaces;
- payload/state tags;
- required return path;
- site-dependent edges;
- known set-down/staging nodes.

A compiler could then prove narrow facts such as:

- a required route graph is connected;
- a task crosses a stair;
- a door/interface lies on the route;
- a site-dependent segment is unresolved.

It must **not** silently claim that:

- fewer graph edges are more humane;
- three doors are worse than two;
- a route is ergonomically acceptable;
- caregiving quality is machine-proved;
- room adjacency is optimal.

Any admission must use the existing computational-governance route and must not become RH-C6 by stealth or widen M4 proof scope.

---

# 23. What HFI-03D establishes

Evidence and prior HFI mechanisms are strong enough to establish the following research conclusions:

1. **Domestic work is architecturally material.** Shopping, laundering and housework involve capability demands that can be helped or worsened by persistent layout/interfaces.
2. **Task routes are sequences, not lengths.** Pick-up, door/turn/level events, processing, set-down, storage and return all matter.
3. **Interface posture can dominate distance.** Laundry/cooking evidence shows demanding postures clustering at baskets, washers, low storage, refrigerator and waste-bin interactions.
4. **Event counting is not a score.** Door, turn, stair, set-down and dirty/clean events require qualitative context and HFI-01D proportionality.
5. **Staging can be a first-class intervention.** A credible set-down/regrip state may remove repeated friction more proportionately than global enlargement.
6. **Laundry must be evaluated as a full loop.** Dirty collection, wash, dry, fold and clean return can move burden between floors/states.
7. **Waste has technical geography.** Accessibility must coexist with smell, hygiene, cleaning, security and real collection requirements.
8. **Cleaning storage is part of route design.** “Readily accessible” does not dictate one central cupboard or universal duplication.
9. **Care work deserves route testing without institutional default.** Bounded caregiving evidence supports layout/flexibility relevance but not universal specialist geometry.
10. **Shortest adjacency is not automatically best.** Moisture, acoustics, fire, hygiene, privacy, services and real-site duties can legitimately require separation.
11. **Role stereotypes are inadmissible.** Domestic/care work is assigned to task/capability states, not gender or presumed household role.
12. **Reference House task topology remains unjudged.** Current room positions are inputs for later audit, not HFI-approved outcomes.

---

# 24. What remains unresolved

03D does **not** determine:

- a maximum acceptable grocery/laundry/waste route distance;
- a preferred number of doors/turns;
- a final location for utility/laundry;
- whether a laundry chute is warranted;
- whether cleaning storage should be central/distributed;
- final kitchen set-down/storage geometry;
- final waste/recycling store/collection route;
- outdoor drying position;
- real-site grocery/parking handoff;
- final garden-serving opening/threshold;
- any care-specific room/clearance requirement;
- whether the current Reference House task routes pass HFI;
- whether task graphs deserve compiler admission.

Those belong to HFI-04/05/06/07, real-site design and/or later computational admission as appropriate.

---

# 25. HFI-03 gate check

HFI-03 required four route/logistics packets:

- HFI-03A — circulation geometry;
- HFI-03B — continuous ground plane;
- HFI-03C — object movement;
- HFI-03D — domestic task routes.

03D closes the research-method gap between person circulation and large-object delivery by representing the **repeated work the household itself performs**.

The HFI-03 gate can close if this packet merges with:

- evidence/source classes valid under HFI-01B;
- no premature target/design finding;
- consistency with HFI-01C/01D, 02D and 03A–C;
- full repository validation green;
- concurrency lease clean or explicitly reconciled.

No architectural maturity increase follows from closing this research gate.

---

# 26. Packet closeout

**Packet:** HFI-03D — domestic task routes  
**Baseline `main`:** `ace7bd9ace1fa353f0a5d1f8cf9413dbfe4a0a3e`  
**Exact question answered:** how can HFI represent and judge repeated household work without reducing it to shortest distance, corridor width or an arbitrary task-efficiency score?  
**Evidence/sources:** existing HFI carrying/circulation/threshold/object-route evidence; Seidel et al. 2010 GB IADL activity-demand study; Seidel et al. 2011 observed cooking/laundry posture study; current London Housing Design Standards guidance; historical London utility/storage precedent; bounded caregiver qualitative evidence.  
**Findings:** use a complete task sequence + event ledger; preserve payload/person/handoff/consequence state; evaluate grocery, laundry, waste, cleaning, care and garden-serving as different task families; treat laundry as a full dirty→clean→return loop; treat staging/set-down as a legitimate local intervention; forbid universal shortest-route and event-count scores; preserve technical geography and role neutrality.  
**Rejected hypotheses:** shortest-route-always-wins; door/turn score; upstairs-laundry rule; ground-utility-is-good rule; laundry-chute shortcut; one-central-store rule; duplicate-everything rule; principal waste route by default; hide-housework-at-any-cost; institutionalise-care geometry; care-is-not-architecture; default housework performer; invented external route.  
**Artefacts/changes:** this research record only.  
**Checks required before merge:** source/class audit; method/score nonclaim audit; cross-packet consistency; HFI-03 gate check; full repository PR validation; concurrency lease against current `main`.  
**Authority/maturity consequences:** none. No HFI target, RH finding, room relocation, doctrine/pattern, compiler proof or maturity increase.  
**Stale downstream items:** none created by research alone.  
**Exact next packet:** **HFI-04A — bathing, toileting and dressing**.
